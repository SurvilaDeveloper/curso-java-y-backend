---
title: "Práctica integrada de README operativo: stack chico, comandos clave y advertencias útiles para retomar o compartir"
description: "Tema 116 del curso práctico de Docker: una práctica integrada donde armás un README operativo mínimo para un stack pequeño con Docker Compose, dejando a mano cómo levantar, bajar, ver estado, logs, exec, rebuild y advertencias importantes sobre limpieza y volúmenes."
order: 116
module: "Cierre operativo, documentación mínima y proyecto más compartible"
level: "intermedio"
draft: false
---

# Práctica integrada de README operativo: stack chico, comandos clave y advertencias útiles para retomar o compartir

## Objetivo del tema

En este tema vas a:

- juntar en una sola práctica varias ideas del bloque de documentación operativa
- dejar un proyecto fácil de levantar, bajar, reconstruir y depurar
- documentar comandos clave sin llenar de texto innecesario
- distinguir mejor operaciones normales de operaciones destructivas
- terminar con una plantilla de README que puedas reutilizar en proyectos reales

La idea es cerrar este bloque con un ejemplo muy concreto: un stack pequeño que cualquiera pueda retomar mañana sin depender de memoria, contexto oral o “preguntarle al que lo armó”.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. partir de un stack pequeño ya definido con Compose
2. decidir qué comandos mínimos conviene dejar visibles
3. documentar levantar, bajar, logs, exec, estado y rebuild
4. agregar una advertencia útil donde realmente hace falta
5. construir un README operativo corto, pero de verdad usable

---

## Idea central que tenés que llevarte

Un proyecto Docker o Compose se vuelve mucho más compartible cuando alguien puede responder rápido estas preguntas:

- ¿cómo lo levanto?
- ¿cómo lo bajo?
- ¿cómo veo si está corriendo bien?
- ¿cómo veo logs?
- ¿cómo entro a un servicio?
- ¿cómo reconstruyo?
- ¿qué comando puede afectar datos persistentes?

Docker documenta que `docker compose up` crea, recrea, inicia y adjunta a los servicios del proyecto; que `docker compose down` detiene y elimina los recursos creados por `up` pero no elimina volúmenes por defecto; que `docker compose logs` sirve para observar la salida de los servicios; que `docker compose exec` permite correr comandos arbitrarios dentro de un servicio; y que `docker compose ps` da una foto del estado actual del proyecto. Además, Docker distingue `up` de `run`: `up` levanta la aplicación completa, mientras `run` está más orientado a tareas puntuales sobre un servicio y sus dependencias. citeturn515917search0turn515917search1turn515917search2turn515917search3turn515917search19turn515917search16

Dicho simple:

> un buen README operativo no explica todo Docker;  
> deja visibles los comandos que te ahorran fricción real.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker deja varias ideas muy claras para este tema:

- `docker compose up` **builds, (re)creates, starts, and attaches** to containers for a service, y agrega la salida de cada contenedor como lo hace `docker compose logs --follow`. citeturn515917search0
- `docker compose down` detiene y elimina contenedores y redes creados por `up`; por defecto no elimina volúmenes externos ni los named volumes, salvo que uses `--volumes`. citeturn515917search1
- `docker compose logs` soporta `--follow`, `--tail`, `--since`, `--timestamps` y filtrado por servicio, por lo que es una herramienta muy natural para documentación operativa mínima. citeturn515917search2
- `docker compose exec` es el equivalente de `docker exec` orientado a un servicio Compose y asigna TTY por defecto. citeturn515917search3
- `docker compose ps` sirve para ver qué servicios están running, su estado y los puertos que usan. citeturn515917search19
- Compose está pensado precisamente para definir y compartir aplicaciones multi-contenedor consistentes desde un único modelo o archivo Compose. citeturn515917search4turn515917search6turn515917search14

---

## Escenario del tema

Vas a imaginar un stack pequeño con:

- `proxy`
- `app`
- `db`

y un `compose.yaml` ya preparado.

El problema ahora ya no es técnico de contenedores.
El problema es operativo:

- dentro de dos semanas no te acordás cómo lo levantabas
- otra persona no sabe por dónde empezar
- nadie recuerda el comando exacto para ver logs o entrar a `app`
- `down --volumes` puede borrar datos y nadie lo dejó advertido

Este es un cierre muy realista para el roadmap.

---

## Qué conviene documentar primero

Para un stack Compose chico, lo más útil suele ser documentar al menos:

- levantar el proyecto
- ver el estado
- ver logs
- entrar a `app`
- entrar a `db` si hace falta
- reconstruir
- bajar el proyecto
- advertir qué pasa si usás `--volumes`

Esto cubre una gran parte del uso real del proyecto.

---

## Stack conceptual de referencia

Imaginá algo así:

```yaml
services:
  proxy:
    image: nginx
    ports:
      - "8080:80"

  app:
    build: .
    expose:
      - "3000"

  db:
    image: postgres:18
    ports:
      - "127.0.0.1:5432:5432"

volumes:
  db-data:
```

No hace falta describir todo el YAML en el README operativo.
Lo que sí hace falta es dejar claro cómo usar ese stack.

---

## Paso 1: documentar cómo levantar

Docker documenta que `docker compose up` es el comando natural para crear, recrear, iniciar y adjuntar a los servicios del proyecto. citeturn515917search0

Entonces, en un README operativo mínimo, suele tener mucho sentido dejar:

```bash
docker compose up -d
```

### Qué conviene explicar
- que este es el comando normal de arranque
- que `-d` lo deja en segundo plano
- que si querés ver el arranque en vivo, podés usar `docker compose up` sin `-d`

Con esa sola aclaración ya resolvés bastante fricción.

---

## Paso 2: documentar cómo ver estado

Docker documenta que `docker compose ps` da una foto del estado actual de los servicios. citeturn515917search19

Entonces conviene dejar algo como:

```bash
docker compose ps
```

### Qué gana esto
- no dependés de adivinar si el stack quedó levantado
- ves qué servicios están activos
- ves puertos y estado
- te da un punto de partida rápido antes de entrar a logs o exec

Es un comando pequeño, pero muy valioso.

---

## Paso 3: documentar logs útiles

Docker documenta `docker compose logs` como herramienta de observación con opciones como `--follow` y `--tail`. citeturn515917search2

Entonces, un README operativo mínimo suele ganar mucho con algo como:

```bash
docker compose logs -f
docker compose logs -f app
docker compose logs --tail 100
```

### Qué gana esto
- te deja un camino directo a debugging
- evita recordar flags de memoria
- ayuda a enfocar rápido un servicio puntual como `app`

Esto es de las partes más usadas de un README operativo real.

---

## Paso 4: documentar `exec`

Docker documenta `docker compose exec` como el equivalente de `docker exec` dirigido a un servicio. citeturn515917search3

Entonces conviene dejar ejemplos concretos y cortos como:

```bash
docker compose exec app sh
docker compose exec db psql -U postgres -d appdb
```

### Qué conviene explicar
- qué servicio suele ser el más útil para entrar primero
- qué shell o comando se espera
- si la base acepta una CLI como `psql`

Esto vuelve al README una herramienta operativa real.

---

## Paso 5: documentar rebuild

Aunque `docker compose up` puede construir según el flujo, en la práctica conviene dejar explícito cómo reconstruir la imagen cuando cambió el Dockerfile o el código.

Por ejemplo:

```bash
docker compose up --build -d
```

o, si querés dejarlo separado:

```bash
docker compose build
docker compose up -d
```

### Qué conviene aclarar
- cuándo alcanza con `up -d`
- cuándo conviene `up --build -d`
- si el proyecto depende de build local y no de imágenes ya publicadas

Esto evita bastante improvisación.

---

## Paso 6: documentar cómo bajar

Docker documenta que `docker compose down` detiene y elimina los recursos creados por `up`, pero que por defecto no elimina volúmenes. citeturn515917search1

Entonces conviene dejar algo como:

```bash
docker compose down
```

Y además una advertencia clara si vas a mostrar esto:

```bash
docker compose down --volumes
```

### La advertencia importante
`--volumes` puede eliminar datos persistentes del proyecto.

Esa advertencia merece estar escrita.
No conviene dejarla implícita.

---

## README operativo mínimo integrado

Acá tenés un ejemplo de README operativo corto, pero muy útil:

```md
# Proyecto X

## Requisitos
- Docker
- Docker Compose

## Archivo principal
- `compose.yaml`

## Levantar el proyecto
```bash
docker compose up -d
```

## Ver estado
```bash
docker compose ps
```

## Ver logs
```bash
docker compose logs -f
docker compose logs -f app
docker compose logs --tail 100
```

## Entrar a la app
```bash
docker compose exec app sh
```

## Entrar a la base
```bash
docker compose exec db psql -U postgres -d appdb
```

## Reconstruir
```bash
docker compose up --build -d
```

## Bajar el proyecto
```bash
docker compose down
```

## Bajar y borrar volúmenes
```bash
docker compose down --volumes
```

> Atención: `--volumes` elimina datos persistentes.
```

---

## Qué hace buena a esta plantilla

La hace buena que:

- responde preguntas reales
- usa comandos oficiales del flujo Compose
- deja advertencias justo donde importan
- no intenta volver a enseñar Docker entero
- sigue siendo fácil de leer y de copiar

Eso es exactamente lo que querés para un cierre operativo sano.

---

## Una mejora pequeña, pero muy útil

También suele ayudar dejar una línea como esta:

- “Los comandos de este README asumen que estás parado en la raíz del proyecto.”

Parece menor.
Pero evita muchísimos errores bobos cuando alguien ejecuta desde otra carpeta o sin ver el `compose.yaml`.

---

## Otra mejora útil: dejar una mini convención del proyecto

Por ejemplo:

- `proxy` es la entrada HTTP
- `app` corre internamente
- `db` se publica solo a localhost
- el flujo normal es `docker compose up -d`
- para debugging básico se usa primero `docker compose ps` y luego `logs`

Con 4 o 5 líneas así, el README deja de ser solo un listado de comandos y pasa a ser una referencia operativa con contexto.

---

## Qué no tenés que confundir

### README operativo no es tutorial completo
Su trabajo es ayudarte a operar el proyecto, no volver a explicar todo Docker.

### Más texto no siempre significa más utilidad
A veces solo agrega ruido.

### `down` no borra datos por defecto
Pero `down --volumes` sí cambia el riesgo. citeturn515917search1

### `up` no es lo mismo que `run`
Docker documenta que `up` levanta el proyecto completo y `run` se usa más para tareas puntuales sobre un servicio. citeturn515917search16

---

## Error común 1: no dejar documentado cómo reconstruir

Eso obliga a improvisar cada vez que cambia la imagen.

---

## Error común 2: no advertir sobre `--volumes`

Ese olvido puede costar datos reales. citeturn515917search1

---

## Error común 3: llenar el README de teoría y no dejar comandos concretos de uso diario

Eso lo vuelve menos útil justo cuando hace falta.

---

## Error común 4: no dejar claro cuál es el servicio más común para logs o exec

Eso mete fricción en debugging básico.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Respondé con tus palabras:

- por qué un stack Docker sin README operativo se vuelve más difícil de retomar
- qué comandos te parecen mínimos e imprescindibles
- por qué `up`, `ps`, `logs`, `exec`, `down` y rebuild forman una base tan buena

### Ejercicio 2
Tomá esta plantilla:

```md
# Proyecto X

## Requisitos
- Docker
- Docker Compose

## Archivo principal
- `compose.yaml`

## Levantar el proyecto
```bash
docker compose up -d
```

## Ver estado
```bash
docker compose ps
```

## Ver logs
```bash
docker compose logs -f
docker compose logs -f app
docker compose logs --tail 100
```

## Entrar a la app
```bash
docker compose exec app sh
```

## Entrar a la base
```bash
docker compose exec db psql -U postgres -d appdb
```

## Reconstruir
```bash
docker compose up --build -d
```

## Bajar el proyecto
```bash
docker compose down
```

## Bajar y borrar volúmenes
```bash
docker compose down --volumes
```

> Atención: `--volumes` elimina datos persistentes.
```

Respondé:

- qué te parece más útil de esta estructura
- qué agregarías y qué no tocarías
- qué advertencia te parece más importante

### Ejercicio 3
Respondé además:

- por qué conviene dejar claro el archivo principal (`compose.yaml`)
- por qué conviene documentar `logs -f app`
- por qué conviene documentar una entrada rápida a `app`
- por qué un README corto puede ser mucho mejor que uno gigante

### Ejercicio 4
Escribí mentalmente tu propia mini estructura de README para uno de tus proyectos con:
- título
- requisitos
- levantar
- estado
- logs
- exec
- rebuild
- down
- advertencia de volúmenes

No hace falta que sea perfecta.
La idea es que te acostumbres a dejar documentación operativa útil.

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué parte hoy depende demasiado de tu memoria
- qué comando te gustaría dejar documentado primero
- si hoy te falta más documentación de rebuild, de logs o de cleanup
- qué advertencia te parecería más importante dejar visible
- qué cambio concreto harías primero para volver el proyecto más fácil de retomar o compartir

No hace falta escribir todavía el README final real.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre documentación útil y documentación de relleno?
- ¿en qué proyecto tuyo hoy te serviría más dejar logs y exec bien visibles?
- ¿qué advertencia te parece más valiosa dejar cerca de `down`?
- ¿qué comando creés que más olvidaría alguien nuevo en el proyecto?
- ¿qué mejora concreta te gustaría notar al dejar una entrada operativa más clara?

Estas observaciones valen mucho más que memorizar una plantilla fija.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero levantar el proyecto completo, probablemente me conviene usar `docker compose ________`.  
> Si quiero bajar el proyecto, probablemente me conviene usar `docker compose ________`.  
> Si quiero observar lo que está pasando, probablemente me conviene usar `docker compose ________`.  
> Si quiero ejecutar un comando dentro de un servicio, probablemente me conviene usar `docker compose ________`.  
> Si quiero ver una foto rápida del estado actual, probablemente me conviene usar `docker compose ________`.

Y además respondé:

- ¿por qué esta práctica impacta tanto en mantenimiento y transferencia del proyecto?
- ¿qué proyecto tuyo te gustaría documentar primero con esta lógica?
- ¿qué riesgo evitás al no depender solo de memoria o contexto oral?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- armar un README operativo mínimo de verdad útil
- decidir qué comandos conviene dejar visibles
- advertir correctamente operaciones con riesgo
- volver un proyecto Docker mucho más fácil de retomar o compartir
- pensar documentación operativa con bastante más foco y criterio

---

## Resumen del tema

- `docker compose up` crea, recrea, inicia y adjunta a los servicios del proyecto. citeturn515917search0
- `docker compose down` baja el proyecto y no elimina volúmenes por defecto; `--volumes` sí cambia el riesgo. citeturn515917search1
- `docker compose logs` sirve para observación rápida y soporta opciones muy útiles para el día a día. citeturn515917search2
- `docker compose exec` permite ejecutar comandos arbitrarios dentro de un servicio. citeturn515917search3
- `docker compose ps` da una foto del estado actual del proyecto. citeturn515917search19
- Compose está pensado para definir y compartir aplicaciones multi-contenedor de forma consistente. citeturn515917search4turn515917search6
- Esta práctica te deja una base mucho más clara para volver un proyecto retocable, compartible y mucho menos dependiente de memoria.

---

## Próximo tema

En el próximo tema vas a seguir avanzando hacia el cierre del roadmap con una práctica integrada final:

- stack pequeño
- runtime más profesional
- README operativo mínimo
- comandos clave a mano
- y un cierre mucho más redondo de punta a punta
