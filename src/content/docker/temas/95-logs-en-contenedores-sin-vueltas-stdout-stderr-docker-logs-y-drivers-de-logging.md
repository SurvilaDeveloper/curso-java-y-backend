---
title: "Logs en contenedores sin vueltas: stdout, stderr, docker logs y drivers de logging"
description: "Tema 95 del curso práctico de Docker: cómo funciona el logging básico en contenedores, por qué conviene escribir a stdout y stderr, cómo usar docker logs y docker compose logs, y qué papel cumplen drivers como json-file y local."
order: 95
module: "Logs, stdout/stderr y observabilidad básica"
level: "intermedio"
draft: false
---

# Logs en contenedores sin vueltas: stdout, stderr, docker logs y drivers de logging

## Objetivo del tema

En este tema vas a:

- entender cómo piensa Docker el logging básico de contenedores
- usar `stdout` y `stderr` como camino principal para logs
- inspeccionar salidas con `docker logs` y `docker compose logs`
- entender qué son los logging drivers
- evitar el error de “mi contenedor no loguea” cuando en realidad la app está escribiendo en otro lado

La idea es que empieces a observar contenedores de una forma mucho más natural: leyendo su salida estándar, sin inventar mecanismos raros de logging antes de tiempo.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender qué ve Docker como log de un contenedor
2. ver qué papel tienen `stdout` y `stderr`
3. usar `docker logs` y `docker compose logs`
4. entender qué pasa cuando una app escribe en archivos dentro del contenedor
5. mirar qué rol cumplen drivers como `json-file` y `local`
6. construir una regla práctica para logging básico mucho más sano

---

## Idea central que tenés que llevarte

Docker espera, por defecto, que una aplicación containerizada escriba sus logs por:

- `STDOUT`
- `STDERR`

La documentación oficial lo explica así: por defecto, `docker logs` muestra la salida que el comando del contenedor envía a `STDOUT` y `STDERR`. También aclara que, si la aplicación escribe en archivos internos en vez de a estos streams, `docker logs` puede no mostrar información útil salvo que hagas algo extra. citeturn335537search3turn335537search1

Dicho simple:

> para Docker, el camino más natural del log es la salida estándar del proceso principal.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker deja varias ideas muy claras para este tema:

- Docker incluye varios mecanismos de logging llamados **logging drivers**; cada daemon tiene un driver por defecto y cada contenedor usa ese driver salvo que configures otro. citeturn335537search0
- Por defecto, `docker logs` muestra la salida enviada a `STDOUT` y `STDERR`. citeturn335537search3turn335537search1
- `docker logs --follow` sigue el flujo en vivo; `--tail`, `--since`, `--until` y `--timestamps` permiten inspeccionar mejor lo que ya existe o lo reciente. citeturn335537search1
- `docker compose logs` ofrece una vista equivalente a nivel de servicios Compose, con opciones como `--follow`, `--tail`, `--since` y `--timestamps`. citeturn335537search5
- Docker documenta que el driver `json-file` captura `stdout` y `stderr` y los guarda en archivos JSON por contenedor, anotando origen y timestamp. citeturn335537search2
- Docker documenta que el driver `local` también captura `stdout` y `stderr`, pero usa un almacenamiento interno optimizado para performance y espacio, con rotación y compresión por defecto. citeturn335537search4

---

## Primer concepto: qué ve Docker como log

Cuando una app corre como proceso principal dentro del contenedor, Docker observa principalmente sus streams de salida:

- `STDOUT`
- `STDERR`

La guía general de logs y métricas lo explica de forma directa: `STDOUT` suele ser la salida normal del comando y `STDERR` la salida de errores. Por defecto, `docker logs` muestra ambos. citeturn335537search3

---

## Qué enseñanza deja esto

Deja una regla muy simple:

> si querés que Docker vea y gestione los logs de forma natural, hacé que tu aplicación escriba a `stdout`/`stderr`.

Eso vale muchísimo para:

- apps propias
- procesos Node, Python, Java, Go, etc.
- comandos de entrada simples
- servicios que querés inspeccionar rápido con Docker CLI

---

## Segundo concepto: qué pasa si la app escribe en archivos internos

Docker también aclara algo muy importante:

si tu imagen corre un proceso no interactivo como un web server o una base, esa aplicación puede escribir sus logs a archivos dentro del contenedor en vez de hacerlo a `stdout`/`stderr`. En ese caso, `docker logs` puede no mostrarte lo que esperabas. citeturn335537search3

---

## Qué problema típico aparece acá

Aparece el clásico diagnóstico equivocado:

- “Docker no está registrando logs”
- “el contenedor no loguea”
- “`docker logs` no muestra nada útil”

Y muchas veces lo que pasa en realidad es esto:

- la app sí está logueando
- pero lo hace en un archivo como `/var/log/...`
- y Docker no lo está viendo por la vía natural de `stdout`/`stderr`

Este matiz es importantísimo.

---

## Tercer concepto: `docker logs`

La referencia oficial de `docker container logs` explica que:

- recupera los logs presentes al momento de la ejecución
- `--follow` sigue el flujo nuevo en tiempo real
- `--tail` limita cuántas líneas ves al final
- `--timestamps` agrega timestamps RFC3339Nano
- `--details` puede mostrar atributos extra cuando el log driver los provee vía `log-opt` citeturn335537search1

---

## Un uso básico muy sano

```bash
docker logs mi-contenedor
```

### Qué te da
- una vista rápida de lo que el proceso principal emitió a `stdout` y `stderr`

Y si querés seguir el flujo en vivo:

```bash
docker logs -f mi-contenedor
```

Esto suele ser el primer comando sano de observabilidad en Docker.

---

## Opciones que valen mucho la pena

### Ver solo lo último
```bash
docker logs --tail 50 mi-contenedor
```

### Ver con timestamps
```bash
docker logs --timestamps mi-contenedor
```

### Seguir en vivo
```bash
docker logs --follow mi-contenedor
```

### Ver desde cierto momento
```bash
docker logs --since 10m mi-contenedor
```

La referencia oficial documenta todas estas variantes. citeturn335537search1

---

## Cuarto concepto: `docker compose logs`

Cuando trabajás con Compose, muchas veces no querés pensar en nombres de contenedores individuales.
Querés ver el conjunto del servicio o del proyecto.

La referencia oficial de `docker compose logs` documenta justamente ese comando y sus opciones `--follow`, `--tail`, `--since`, `--until`, `--timestamps`, entre otras. citeturn335537search5

---

## Un uso básico muy sano

```bash
docker compose logs
```

### Qué te da
- una vista agregada de logs por servicios del proyecto

Y si querés seguirlos en vivo:

```bash
docker compose logs -f
```

O solo de un servicio puntual:

```bash
docker compose logs -f app
```

Esto suele ser mucho más cómodo en stacks con varios servicios.

---

## Quinto concepto: qué son los logging drivers

Docker documenta que el daemon soporta distintos mecanismos de logging llamados **logging drivers**. Cada daemon tiene uno por defecto, y cada contenedor lo usa salvo que configures otro. citeturn335537search0

La idea útil no es memorizar todos los drivers hoy.
La idea útil es entender que:

- Docker no solo “muestra logs”
- también decide **cómo** almacenarlos o a dónde enviarlos

---

## Dos drivers muy importantes para arrancar

### `json-file`
Docker documenta que:

- captura `stdout` y `stderr`
- escribe archivos JSON por contenedor
- cada línea queda anotada con su origen (`stdout` o `stderr`) y timestamp citeturn335537search2

### `local`
Docker documenta que:

- también captura `stdout` y `stderr`
- usa un almacenamiento interno optimizado para performance y espacio
- rota y comprime por defecto
- guarda por defecto 100MB por contenedor (20MB x 5 archivos) citeturn335537search4

---

## Qué diferencia práctica te importa hoy

Para este nivel del curso, la enseñanza más útil es:

- ambos parten de `stdout`/`stderr`
- la diferencia está en cómo Docker almacena o gestiona esos logs
- vos, como autor de la imagen o del servicio, seguís beneficiándote si la app loguea por stdout/stderr

O sea:
**el primer buen paso no es elegir un driver raro; es hacer que la app loguee bien al stream correcto**.

---

## Un detalle importante sobre `docker logs`

Docker advierte que `docker logs` puede no mostrar información útil en algunos casos:

- si usás un logging driver que manda logs a otro backend y tenés desactivado dual logging
- si la aplicación escribe en archivos internos en vez de stdout/stderr citeturn335537search3

Esto es muy importante para no diagnosticar mal lo que ves.

---

## Sexto concepto: no leas archivos internos del driver directamente

Docker advierte específicamente, por ejemplo para el driver `local`, que esos archivos internos están pensados para ser usados por el daemon y que manipularlos con herramientas externas puede interferir con el sistema de logging. citeturn335537search4

La enseñanza útil es:

> si querés inspeccionar logs, usá `docker logs`, `docker compose logs` o el backend de logging correspondiente;  
> no te apoyes en “abrir archivos internos” del driver como si fueran logs de app normales.

---

## Un patrón sano de diseño de logs

Para la mayoría de apps que estás containerizando, el patrón más sano es:

- la app escribe logs a stdout/stderr
- vos inspeccionás con `docker logs` o `docker compose logs`
- si más adelante necesitás forwarding a otro sistema, ahí ya evaluás drivers o una capa de observabilidad más avanzada

Ese orden mental te evita sobrediseñar demasiado pronto.

---

## Un ejemplo conceptual muy simple

Imaginá una app Node que hace algo así:

```js
console.log("Servidor iniciado");
console.error("No se pudo conectar a Redis");
```

Eso ya encaja muy bien con Docker porque:

- `console.log` termina en stdout
- `console.error` termina en stderr
- `docker logs` puede mostrar ambas salidas naturalmente

Esto es mucho más alineado con Docker que una app que solo escribe a un archivo interno sin exponer nada a stdout/stderr.

---

## Qué no tenés que confundir

### `docker logs` no “lee cualquier archivo del contenedor”
Lee lo que el proceso principal manda a stdout/stderr según el log driver configurado. citeturn335537search1turn335537search3

### Logging driver no es lo mismo que formato de log de tu app
El driver decide cómo Docker captura o envía la salida; tu app sigue decidiendo qué escribe y cómo lo formatea. citeturn335537search0turn335537search2

### `docker compose logs` no reemplaza a buen logging en la app
Si la app no escribe a stdout/stderr, Compose tampoco va a inventarlo por vos. citeturn335537search3turn335537search5

### Ver pocos logs no significa automáticamente que el contenedor no hizo nada
Capaz escribió en un archivo interno o usa un driver/backend distinto.

---

## Error común 1: hacer que la app escriba solo a archivos internos y esperar que `docker logs` lo muestre todo

Docker advierte justamente ese caso. citeturn335537search3

---

## Error común 2: pensar que el primer paso es elegir un logging driver sofisticado

Primero conviene asegurar que la app escriba bien a stdout/stderr.

---

## Error común 3: no usar `--follow`, `--tail` o `--since` y perder tiempo leyendo demasiado o muy poco

La propia CLI ya trae herramientas muy buenas para eso. citeturn335537search1turn335537search5

---

## Error común 4: tratar archivos internos del driver como si fueran “los logs de la app”

Docker desaconseja manipular esos archivos directamente. citeturn335537search4

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Respondé con tus palabras:

- qué ve Docker como log básico de un contenedor
- qué diferencia práctica hay entre `stdout` y `stderr`
- por qué conviene que una app escriba ahí en vez de solo a archivos internos

### Ejercicio 2
Compará estos dos casos conceptualmente:

- una app que loguea con `console.log` / `console.error`
- una app que solo escribe a `/var/log/app.log`

Respondé:

- en cuál `docker logs` te va a ayudar más directamente
- por qué
- qué problema te puede dar el segundo enfoque si no hacés nada más

### Ejercicio 3
Respondé además:

- para qué usarías `docker logs -f`
- para qué usarías `docker logs --tail 50`
- para qué usarías `docker compose logs -f app`
- qué ventaja te da `docker compose logs` cuando tenés varios servicios

### Ejercicio 4
Respondé también:

- qué es un logging driver
- qué capturan `json-file` y `local`
- por qué el driver no reemplaza un buen diseño de logging en la aplicación

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- si hoy la app escribe a stdout/stderr o solo a archivos internos
- si hoy usás más `docker logs` o `docker compose logs`
- qué servicio del stack te gustaría observar mejor primero
- si hoy te está faltando más formato en los logs o simplemente exponerlos bien al stream correcto
- qué cambio concreto harías para que el debugging básico sea más cómodo

No hace falta escribir todavía una configuración final de logging.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la relación entre logs de la app y stdout/stderr?
- ¿en qué proyecto tuyo hoy `docker logs` muestra menos de lo que esperabas?
- ¿qué servicio hoy te convendría mirar con `docker compose logs -f` primero?
- ¿qué parte del tema de drivers te parece más útil recordar por ahora?
- ¿qué mejora concreta te gustaría notar al ordenar mejor la salida de logs?

Estas observaciones valen mucho más que memorizar todos los drivers disponibles.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero que Docker vea naturalmente los logs de mi app, probablemente me conviene escribir a ________ y ________.  
> Si quiero seguir logs en vivo de un contenedor, probablemente me conviene usar `docker logs ________`.  
> Si quiero ver logs de un servicio Compose, probablemente me conviene usar `docker compose ________`.  
> Si mi app escribe solo a archivos internos, `docker logs` puede mostrar menos de lo que espero porque ________.

Y además respondé:

- ¿por qué este tema impacta tanto en debugging del día a día?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no esconder todos los logs dentro del contenedor?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar cómo entiende Docker el logging básico de contenedores
- usar mejor `docker logs` y `docker compose logs`
- distinguir stdout/stderr de archivos internos de log
- entender qué papel cumplen los logging drivers
- observar mucho mejor lo que pasa en tus contenedores sin sobrecomplicar el problema

---

## Resumen del tema

- Por defecto, Docker muestra en `docker logs` lo que el proceso principal envía a `STDOUT` y `STDERR`. citeturn335537search3turn335537search1
- Si una app escribe a archivos internos en vez de stdout/stderr, `docker logs` puede no mostrar información útil. citeturn335537search3
- `docker container logs` soporta `--follow`, `--tail`, `--since`, `--until`, `--timestamps` y `--details`. citeturn335537search1
- `docker compose logs` ofrece una vista equivalente a nivel de servicios Compose. citeturn335537search5
- Docker usa logging drivers; `json-file` y `local` capturan stdout/stderr y los almacenan de formas distintas. citeturn335537search0turn335537search2turn335537search4
- Este tema te deja una base muy sólida para observar contenedores con menos fricción y menos diagnósticos equivocados.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque con una práctica integrada:

- app
- db
- logs por servicio
- `docker compose logs`
- y una forma mucho más clara de leer qué está pasando en un stack entero
