---
title: "Práctica integrada de logs: app, db y docker compose logs para observar mejor todo el stack"
description: "Tema 96 del curso práctico de Docker: una práctica integrada donde combinás stdout/stderr, docker compose logs, filtros como follow/tail/since y una lectura más clara de logs por servicio para entender mejor qué está pasando en un stack app + db."
order: 96
module: "Logs, stdout/stderr y observabilidad básica"
level: "intermedio"
draft: false
---

# Práctica integrada de logs: app, db y docker compose logs para observar mejor todo el stack

## Objetivo del tema

En este tema vas a:

- juntar en una sola práctica varias ideas del bloque de logs
- pensar una app y una base como servicios observables desde `docker compose logs`
- usar mejor `stdout` y `stderr`
- leer logs por servicio sin perderte entre demasiada salida
- usar filtros como `--follow`, `--tail`, `--since` y timestamps
- entender mejor qué parte del problema pertenece a la app y cuál a la base

La idea es cerrar este bloque con una práctica concreta donde ya no mires los logs como algo aislado por contenedor, sino como una herramienta para leer mejor el comportamiento de un stack completo.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. partir de un stack simple con `app` y `db`
2. asumir una app que escribe a `stdout`/`stderr`
3. leer logs agregados con `docker compose logs`
4. filtrar por servicio cuando haga falta
5. usar `--follow`, `--tail`, `--since` y timestamps con más criterio
6. cerrar con una forma bastante más clara de observar el stack

---

## Idea central que tenés que llevarte

Ya viste que Docker entiende como logs naturales lo que el proceso principal envía a:

- `STDOUT`
- `STDERR`

También viste que Compose te deja leer esos logs a nivel de servicios.

Este tema junta ambas ideas con una práctica muy simple:

> si cada servicio del stack loguea bien a `stdout`/`stderr`,  
> `docker compose logs` te da una vista muy potente para entender qué está pasando en conjunto y por partes.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker explica que, por defecto, `docker logs` muestra la salida que el proceso del contenedor envía a `STDOUT` y `STDERR`, y advierte que si una app escribe solo a archivos internos, `docker logs` puede no mostrar información útil. También documenta que `docker compose logs` permite inspeccionar logs de servicios Compose y soporta opciones como `--follow`, `--tail`, `--since`, `--until`, `--timestamps` y `--no-log-prefix`. Además, la documentación de `docker compose up` aclara que el comando agrega la salida de los contenedores como si fuera `docker compose logs --follow`, lo que ayuda a entender por qué a veces ya ves todos los logs mezclados durante el arranque. citeturn342702search2turn342702search1turn342702search0turn342702search8

---

## Escenario del tema

Vas a imaginar este stack:

- `app`: una aplicación que escribe mensajes normales y errores a `stdout`/`stderr`
- `db`: una base PostgreSQL
- Compose como forma principal de levantar ambos servicios

Querés poder responder preguntas como:

- ¿la app arrancó?
- ¿la app intentó conectarse a la base?
- ¿la base ya estaba aceptando conexiones?
- ¿el error viene del lado de la app o de `db`?
- ¿qué pasó en los últimos minutos sin leer todo el historial completo?

Este es un caso perfecto para practicar logs a nivel de stack.

---

## Stack base de la práctica

Mirá este ejemplo conceptual:

```yaml
services:
  app:
    image: miusuario/app:dev
    environment:
      DB_HOST: db
      DB_PORT: 5432
    depends_on:
      - db

  db:
    image: postgres:18
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: mysecretpassword
```

---

## Cómo se lee este stack desde logs

La lectura conceptual sería:

- `app` tiene su propio stream de logs
- `db` tiene su propio stream de logs
- Compose puede agregarlos en una sola vista
- vos podés leer el comportamiento del sistema como conjunto o separar por servicio cuando haga falta

Esto ya es una forma mucho más útil de pensar observabilidad básica que “mirar un contenedor aislado al azar”.

---

## Paso 1: asumir que la app loguea bien a stdout/stderr

Imaginá una app que hace algo como esto:

```js
console.log("App iniciando...");
console.log("Intentando conectar a db:5432");
console.error("Error: timeout al conectar a db");
```

Docker documenta que `docker logs` y, por extensión, `docker compose logs`, muestran justamente esa salida estándar y de error. citeturn342702search2turn342702search1

---

## Qué gana esta app

Gana algo importantísimo:

- Docker puede capturar sus logs naturalmente
- no dependés de abrir archivos dentro del contenedor
- Compose puede agregarlos con los de otros servicios

Esta es la base sana de observabilidad para el día a día.

---

## Paso 2: leer el stack entero con `docker compose logs`

El primer comando razonable sería:

```bash
docker compose logs
```

La referencia oficial de `docker compose logs` documenta que este comando muestra los logs de los servicios del proyecto y soporta opciones de seguimiento, recorte y rango temporal. citeturn342702search0

---

## Qué te da este primer comando

Te da una vista agregada por servicio.

Eso suele ser ideal para preguntas como:

- ¿qué servicio habló primero?
- ¿qué error apareció antes?
- ¿la app falló antes o después de que la base reportara readiness?
- ¿hay correlación visible entre mensajes de `app` y de `db`?

En un stack chico, esta vista suele ser excelente como primer paso.

---

## Paso 3: seguir logs en vivo

Si querés ver lo que pasa mientras el stack arranca o mientras reproducís un problema:

```bash
docker compose logs -f
```

La opción `--follow` está documentada oficialmente en `docker compose logs`. citeturn342702search0

---

## Qué gana `--follow`

Gana algo muy práctico:

- no necesitás ejecutar el comando una y otra vez
- ves el flujo en tiempo real
- te acercás a una experiencia parecida a “tail -f” del stack entero

Esto es ideal para:

- arranque del proyecto
- debugging de reconexiones
- errores intermitentes
- pruebas manuales mientras el stack corre

---

## Paso 4: no leer demasiado con `--tail`

Muchas veces no te sirve leer todo el historial.

Ahí entra algo como:

```bash
docker compose logs --tail 50
```

o para seguir solo lo último:

```bash
docker compose logs -f --tail 50
```

La documentación oficial de `docker compose logs` incluye `--tail` justamente para limitar la cantidad de líneas mostradas desde el final de los logs. citeturn342702search0

---

## Qué problema resuelve `--tail`

Resuelve el clásico problema de ruido:

- el stack ya corrió mucho tiempo
- no querés leer cientos o miles de líneas viejas
- querés foco en lo último relevante

En práctica real, `--tail` suele ser de las opciones más útiles.

---

## Paso 5: mirar solo lo reciente con `--since`

Cuando querés restringirte a una ventana temporal, por ejemplo lo que pasó en los últimos 10 minutos:

```bash
docker compose logs --since 10m
```

o combinado con seguimiento:

```bash
docker compose logs -f --since 10m
```

La documentación oficial soporta `--since` con timestamps o duraciones relativas. citeturn342702search0turn342702search1

---

## Qué problema resuelve `--since`

Resuelve preguntas como:

- ¿qué pasó desde que hice el último deploy?
- ¿qué pasó desde que reinicié el servicio?
- ¿qué logs aparecieron desde que empecé la prueba?

Esto evita muchísimo ruido histórico irrelevante.

---

## Paso 6: sumar timestamps

Cuando querés correlacionar mejor eventos entre servicios:

```bash
docker compose logs --timestamps
```

o:

```bash
docker compose logs -f --timestamps
```

La opción `--timestamps` está documentada en Compose logs y también en `docker logs`. citeturn342702search0turn342702search1

---

## Qué gana esto

Gana algo muy útil para stacks:

- podés comparar mejor qué ocurrió antes y después
- se vuelve más fácil alinear un error de `app` con un mensaje de `db`
- el flujo deja de ser “solo texto” y empieza a tener orden temporal mucho más claro

En observabilidad básica, esto ayuda muchísimo.

---

## Paso 7: filtrar por servicio cuando el stack completo ya mete demasiado ruido

Una vez que viste el panorama general, muchas veces querés aislar un servicio.

Por ejemplo:

```bash
docker compose logs app
```

o:

```bash
docker compose logs -f app
```

o para la base:

```bash
docker compose logs --tail 100 db
```

La referencia oficial documenta que `docker compose logs` acepta nombres de servicio para limitar la salida. citeturn342702search0

---

## Qué gana esta vista por servicio

Gana foco.

Porque a veces el stack completo te sirve para descubrir correlación, pero después querés concentrarte en:

- solo `app`
- solo `db`
- solo el servicio que te está dando problemas

El flujo sano suele ser:

1. vista agregada del stack
2. zoom sobre el servicio que ahora querés entender mejor

---

## Qué relación tiene esto con `docker compose up`

Docker documenta que `docker compose up` agrega la salida de cada contenedor como lo hace `docker compose logs --follow`. citeturn342702search8

Esto explica por qué muchas veces, cuando hacés:

```bash
docker compose up
```

ya ves una salida mezclada de varios servicios.

---

## Qué enseñanza deja eso

Deja una idea muy útil:

- `docker compose up` ya te puede servir como observación básica durante el arranque
- pero `docker compose logs` te da más control después con filtros, seguimiento y ventanas temporales

O sea:
**up** te muestra arranque vivo;
**logs** te deja inspeccionar mejor después o con más precisión.

---

## Qué pasa si un servicio escribe solo a archivos internos

Docker advierte que, si una imagen corre procesos que escriben a archivos internos en vez de `stdout`/`stderr`, `docker logs` puede no mostrar información útil. citeturn342702search2

Entonces, en esta práctica, una parte fundamental del diseño sano es:

- la app escribe a `stdout`/`stderr`
- así Compose puede mostrarla bien junto al resto del stack

Este punto es uno de los más importantes del bloque.

---

## Un flujo muy sano de debugging en esta práctica

Imaginá este recorrido:

### 1. Arrancás el stack
```bash
docker compose up -d
```

### 2. Mirás lo reciente del stack
```bash
docker compose logs --tail 50
```

### 3. Seguís en vivo
```bash
docker compose logs -f --timestamps
```

### 4. Detectás que el problema parece venir de la app
```bash
docker compose logs -f --since 5m app
```

### 5. O si parece venir de la base
```bash
docker compose logs --tail 100 db
```

Este flujo ya se siente bastante más profesional y mucho menos improvisado.

---

## Qué te enseña realmente esta práctica

Te enseña a pensar logs así:

- la app debe exponer bien su salida
- el stack completo se puede leer de forma agregada
- no hace falta leer siempre todo el historial
- filtros temporales y de cantidad te dan foco
- la observabilidad básica mejora muchísimo cuando no escondés la salida en archivos internos

Ese cambio mental vale muchísimo para el día a día.

---

## Qué no tenés que confundir

### `docker compose logs` no reemplaza a buen logging en la app
Si la app no escribe bien a stdout/stderr, Compose tampoco lo arregla por arte de magia. citeturn342702search2turn342702search5

### `docker compose up` no es exactamente lo mismo que `docker compose logs`
Se parecen durante el arranque, pero `logs` te da más control de inspección. citeturn342702search8turn342702search0

### Ver el stack entero no siempre es mejor
A veces necesitás zoom por servicio.

### Más logs no siempre significa mejor observabilidad
También necesitás foco y recorte.

---

## Error común 1: no usar `--tail` y tragarte todo el historial cada vez

Eso suele meter muchísimo ruido innecesario. citeturn342702search0

---

## Error común 2: no usar `--since` y perder tiempo con logs viejos que ya no importan

Esa opción existe justamente para evitar eso. citeturn342702search0turn342702search1

---

## Error común 3: mirar solo `app` o solo `db` desde el principio y perder correlación entre servicios

Muchas veces conviene empezar por la vista agregada del stack.

---

## Error común 4: diseñar una app que escribe solo a archivos internos y después decir que “Docker no muestra logs”

Docker ya advierte esa situación. citeturn342702search2

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Tomá este stack conceptual:

```yaml
services:
  app:
    image: miusuario/app:dev
    environment:
      DB_HOST: db
      DB_PORT: 5432
    depends_on:
      - db

  db:
    image: postgres:18
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: mysecretpassword
```

Respondé con tus palabras:

- por qué este stack se beneficia de `docker compose logs`
- qué diferencia hay entre mirar logs del stack entero y mirar solo `app`
- qué tipo de correlación podrías descubrir viendo `app` y `db` juntos

### Ejercicio 2
Respondé además:

- para qué usarías `docker compose logs -f`
- para qué usarías `docker compose logs --tail 50`
- para qué usarías `docker compose logs --since 10m`
- para qué usarías `docker compose logs --timestamps`

### Ejercicio 3
Ahora pensá dos apps:

- una que usa `console.log` y `console.error`
- otra que solo escribe a `/var/log/app.log`

Respondé:

- cuál encaja mejor con Docker por defecto
- cuál te va a dar más fricción con `docker compose logs`
- por qué

### Ejercicio 4
Armá mentalmente un flujo de debugging de 4 pasos usando:

- `docker compose up -d`
- `docker compose logs`
- `--follow`
- `--tail`
- o `--since`

No hace falta que sea único.
La idea es que te acostumbres a usar estos comandos con intención.

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- si hoy cada servicio del stack escribe bien a stdout/stderr
- si hoy te conviene más empezar mirando el stack completo o un servicio puntual
- qué filtro de logs te sería más útil primero: `--tail`, `--since` o `--timestamps`
- qué servicio te gustaría observar mejor
- qué cambio concreto harías para que el debugging básico sea más cómodo

No hace falta escribir todavía una política final de logging.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la relación entre logs por servicio y vista agregada del stack?
- ¿en qué proyecto tuyo hoy te convendría empezar con `docker compose logs -f`?
- ¿qué parte del ruido de logs podrías recortar mejor con `--tail` o `--since`?
- ¿qué servicio hoy probablemente no está exponiendo bien su salida a stdout/stderr?
- ¿qué mejora concreta te gustaría notar al mirar el stack con más método?

Estas observaciones valen mucho más que memorizar flags.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero ver el comportamiento conjunto del stack, probablemente me conviene usar `docker compose ________`.  
> Si quiero seguir en vivo lo que pasa, probablemente me conviene sumar `--________`.  
> Si quiero enfocarme en lo último y no leer todo el historial, probablemente me conviene usar `--________`.  
> Si quiero acotar la observación a una ventana reciente, probablemente me conviene usar `--________`.  
> Si una app escribe solo a archivos internos, Compose puede mostrar menos de lo que espero porque ________.

Y además respondé:

- ¿por qué esta práctica te parece mucho más útil que mirar contenedores aislados sin contexto?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no esconder la salida de la app fuera de stdout/stderr?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- usar `docker compose logs` con mucho más criterio
- combinar vista agregada del stack con zoom por servicio
- apoyarte mejor en `--follow`, `--tail`, `--since` y timestamps
- entender por qué stdout/stderr sigue siendo la base sana del logging en contenedores
- observar un stack pequeño de forma bastante más clara y útil

---

## Resumen del tema

- `docker compose logs` permite inspeccionar logs a nivel de servicios Compose y soporta filtros como `--follow`, `--tail`, `--since`, `--until` y `--timestamps`. citeturn342702search0
- `docker logs` y Compose muestran por defecto lo que el proceso envía a `STDOUT` y `STDERR`. citeturn342702search2turn342702search1
- `docker compose up` agrega la salida de los contenedores durante el arranque de forma similar a `docker compose logs --follow`. citeturn342702search8
- Si una app escribe solo a archivos internos, la salida visible por Docker puede ser pobre o insuficiente. citeturn342702search2
- Esta práctica te deja una forma mucho más clara de leer un stack entero, correlacionar servicios y enfocarte mejor en lo relevante.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque con otra capa muy útil de observabilidad básica:

- timestamps
- formatos
- ruido
- y cómo hacer que los logs de tu propia app sean más legibles cuando el stack crece
