---
title: "Práctica integrada de observación en Compose: usá ps, logs, events y stats para diagnosticar un stack real"
description: "Tema 67 del curso práctico de Docker: una práctica integrada donde combinás docker compose ps, logs, events y stats para observar un stack con comportamientos distintos, detectar reinicios, leer salidas recientes y entender mejor el uso de recursos."
order: 67
module: "Observabilidad básica del stack con Compose"
level: "intermedio"
draft: false
---

# Práctica integrada de observación en Compose: usá ps, logs, events y stats para diagnosticar un stack real

## Objetivo del tema

En este tema vas a:

- juntar varias herramientas de observación en una sola práctica
- usar `docker compose ps` como foto del estado actual
- usar `docker compose logs` para leer la salida reciente
- usar `docker compose events` para detectar cambios de ciclo de vida
- usar `docker compose stats` para mirar consumo de recursos
- construir una rutina de diagnóstico bastante más ordenada

La idea es bajar el bloque de observabilidad a un caso concreto, para que no quede como una lista de comandos sueltos.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. levantar un stack simple con comportamientos distintos
2. mirar el estado actual con `ps`
3. mirar la salida con `logs`
4. detectar cambios con `events`
5. mirar recursos con `stats`
6. usar todo eso en una secuencia razonable de observación

---

## Idea central que tenés que llevarte

Ya viste que Compose te da varias ventanas distintas sobre el stack:

- `ps`
- `logs`
- `events`
- `stats`

Este tema junta todo eso en una práctica con una idea muy simple:

> observar bien un stack no es usar un solo comando,  
> sino combinar varias vistas que responden preguntas distintas.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker Compose describe `docker compose ps` como una vista del estado actual de los servicios y documenta filtros por estado y salida estructurada. También define `docker compose logs` como la forma de ver la salida de los servicios, con opciones como `--follow`, `--tail`, `--since` y `--index`. La referencia de `docker compose events` explica que transmite en tiempo real eventos de todos los contenedores del proyecto y que con `--json` emite un objeto por línea con campos como tiempo, tipo, acción y servicio. Además, `docker compose stats` muestra un stream en vivo del uso de recursos de los contenedores del proyecto. citeturn871930search0turn871930search1turn871930search2turn871930search3

---

## Escenario de la práctica

Vas a imaginar un stack simple con dos servicios:

- `web`
- `worker`

La idea del ejemplo no es hacer una app compleja, sino tener señales distintas para observar:

- un servicio que escribe logs
- otro que puede reiniciarse o salir
- y ambos consumiendo recursos de manera observable

Esto vuelve más claro qué aporta cada comando.

---

## Stack de ejemplo

Podés usar algo conceptualmente así:

```yaml
services:
  web:
    image: nginx
    ports:
      - "8080:80"
    restart: unless-stopped

  worker:
    image: alpine
    command: sh -c 'echo "worker arrancó"; sleep 2; echo "worker terminó con error"; exit 1'
    restart: on-failure:3
```

---

## Cómo se lee este stack

La lectura conceptual sería:

- `web` es un servicio continuo
- `worker` es un servicio que falla y vuelve a intentar
- el stack te permite observar tanto estado como eventos y logs recientes

Esto es muy útil porque te da algo concreto para mirar:

- un servicio estable
- otro con un patrón de fallo y reinicio

---

## Paso 1: mirar el estado actual con `ps`

Ahora ejecutarías:

```bash
docker compose ps
```

La referencia oficial lo define como la vista del estado actual de los servicios. citeturn871930search0

---

## Qué deberías buscar

En esta práctica, con `ps` querés mirar cosas como:

- qué servicios están running
- si `worker` quedó reiniciándose o salió
- qué puertos tiene `web`
- cuál es la foto del stack en este momento

`ps` te orienta muy rápido.

---

## Qué te muestra mejor `ps`

Te ayuda sobre todo a responder:

- ¿qué está vivo ahora?
- ¿qué quedó detenido?
- ¿qué está reiniciándose?
- ¿cuál es el estado actual del proyecto?

No te explica por qué pasó.
Pero te deja ver dónde mirar después.

---

## Filtrar estado

La documentación oficial documenta filtros por estado en `docker compose ps`. citeturn871930search0

Por ejemplo:

```bash
docker compose ps --status running
```

o:

```bash
docker compose ps --filter status=exited
```

Esto es muy útil si `worker` entra y sale, y querés enfocarte solo en contenedores ya detenidos o solo en los que siguen arriba.

---

## Paso 2: mirar la salida con `logs`

Ahora pasarías a:

```bash
docker compose logs --tail 50
```

La referencia oficial de `docker compose logs` documenta `--tail`, `--since`, `--follow` y `--index`. citeturn871930search3

---

## Qué deberías buscar en esta práctica

Querés ver cosas como:

- qué escribió `worker` antes de salir
- si `worker` está repitiendo el mismo error
- si `web` está emitiendo algo relevante
- qué pasó justo antes del estado que viste en `ps`

En esta secuencia, `ps` te dice “qué hay”.
`logs` te empieza a decir “por qué”.

---

## Seguir logs en vivo

Si querés ver el comportamiento mientras ocurre, podrías usar:

```bash
docker compose logs -f
```

o si querés enfocarte en uno solo:

```bash
docker compose logs -f worker
```

La documentación oficial documenta `--follow` justo para ese caso. citeturn871930search3

Esto es especialmente útil si el servicio entra en un loop de fallo y restart.

---

## Recortar por tiempo

También podrías usar:

```bash
docker compose logs --since 10m
```

La referencia oficial documenta `--since` con timestamps o duraciones relativas. citeturn871930search3

Esto sirve mucho cuando no querés leer toda la historia del servicio, sino solo lo reciente.

---

## Paso 3: mirar cambios de ciclo de vida con `events`

Ahora pasás a:

```bash
docker compose events
```

La referencia oficial lo describe como un stream de eventos de todos los contenedores del proyecto. citeturn871930search1

---

## Qué deberías buscar en esta práctica

Querés detectar eventos como:

- create
- start
- die
- restart

Si `worker` entra en fallo y Compose o Docker lo relanza según su política, `events` te lo muestra con mucha más claridad que `ps`.

---

## Por qué `events` es tan valioso acá

Porque un loop de restart puede ser confuso si mirás solo `ps`.

Con `events`, la historia se vuelve más visible:

- se crea
- arranca
- muere
- vuelve a arrancar

La referencia oficial de `events` documenta justamente ese enfoque de stream en tiempo real del ciclo de vida del proyecto. citeturn871930search1

---

## Salida JSON en events

La documentación oficial también documenta:

```bash
docker compose events --json
```

y muestra que cada línea incluye campos como:

- `time`
- `type`
- `action`
- `id`
- `service`
- `attributes` citeturn871930search1

Esto es excelente cuando querés leer el flujo con más precisión o procesarlo en scripts.

---

## Paso 4: mirar recursos con `stats`

Ahora pasarías a:

```bash
docker compose stats
```

La referencia oficial lo define como un stream en vivo del uso de recursos de los contenedores del proyecto. citeturn871930search2

---

## Qué deberías buscar en esta práctica

Querés responder preguntas como:

- ¿qué servicio consume más CPU?
- ¿hay algo raro con la memoria?
- ¿un reinicio está acompañado de picos de consumo?
- ¿`web` está estable y `worker` no?
- ¿el problema parece lógico o también de recursos?

`stats` no te da causas lógicas, pero sí te da síntomas de presión de recursos.

---

## Qué aporta `stats` que los otros no muestran igual

- `ps` te da estado
- `logs` te da salida
- `events` te da ciclo de vida
- `stats` te da presión operativa

Esa última pieza es clave cuando un stack “anda raro” pero no queda claro si el problema es consumo, reinicio o lógica de aplicación.

---

## Una rutina integrada para este caso

Podés pensar una secuencia así:

### Paso 1
```bash
docker compose ps
```
Para ver el estado actual.

### Paso 2
```bash
docker compose logs --tail 50
```
Para ver el final de la historia.

### Paso 3
```bash
docker compose events
```
Para ver si el servicio entra en loop o cambia de estado en tiempo real.

### Paso 4
```bash
docker compose stats
```
Para ver si además hay una anomalía de consumo.

Esta rutina ya te da un flujo de observación bastante serio.

---

## Qué aprenderías si `worker` falla en loop

### Con `ps`
Verías el estado actual, posiblemente el contenedor subiendo y bajando o quedando detenido.

### Con `logs`
Verías el mensaje de error o la salida repetida.

### Con `events`
Verías claramente la secuencia `start -> die -> start -> die`.

### Con `stats`
Verías si el patrón de fallo viene acompañado de consumo anormal o no.

Ese contraste es justamente el valor del tema.

---

## Qué no tenés que confundir

### `ps` no te da la historia
Te da una foto del ahora. citeturn871930search0

### `logs` no te da el ciclo de vida completo del contenedor como sistema
Te da la salida del proceso. citeturn871930search3

### `events` no reemplaza a los logs
Te dice qué pasó con el contenedor, no necesariamente qué escribió la app. citeturn871930search1

### `stats` no te da la causa del error
Te muestra uso de recursos, no explicación lógica. citeturn871930search2

---

## Error común 1: investigar reinicios mirando solo logs

A veces el patrón de reinicio se entiende mejor con `events`.

---

## Error común 2: mirar solo `ps` y concluir que “ahora está bien”

Puede que justo hayas llegado en un instante donde el estado parece sano, pero la historia reciente diga otra cosa.

---

## Error común 3: no usar `--tail` o `--since`

Eso puede ahogarte en ruido y hacerte perder el foco. La referencia oficial documenta ambas opciones en `logs`. citeturn871930search3

---

## Error común 4: ignorar recursos cuando algo “anda raro”

A veces el síntoma principal no es el log, sino un consumo claramente anormal.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Tomá este stack mental:

```yaml
services:
  web:
    image: nginx
    restart: unless-stopped

  worker:
    image: alpine
    command: sh -c 'echo "worker arrancó"; sleep 2; echo "worker terminó con error"; exit 1'
    restart: on-failure:3
```

### Ejercicio 2
Respondé qué mirarías primero para saber:

- qué servicios están vivos ahora
- qué escribió `worker` antes de fallar
- si `worker` está entrando en un loop de restart
- cuál servicio consume más memoria o CPU

### Ejercicio 3
Asociá cada pregunta con uno de estos comandos:

```bash
docker compose ps
docker compose logs --tail 50
docker compose events
docker compose stats
```

### Ejercicio 4
Respondé además:

- por qué esta combinación es mejor que usar un solo comando
- qué problema detecta especialmente bien `events`
- qué valor práctico te da `stats` en una investigación real

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué comando usarías primero si un servicio “sube raro”
- qué comando usarías si sospechás reinicios
- qué comando usarías si sospechás consumo excesivo
- qué comando usarías si querés leer solo lo más reciente del problema
- qué parte de tu flujo actual te gustaría volver más observable con esta rutina

No hace falta escribir scripts ni automatizaciones.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre foto, historia, eventos y recursos?
- ¿qué comando te imaginás usando más para loops de restart?
- ¿qué comando hoy estás subusando más?
- ¿qué tipo de problema de tus stacks te cuesta más observar?
- ¿qué mejora práctica te da pensar en estas herramientas como una rutina y no como comandos aislados?

Estas observaciones valen mucho más que memorizar flags.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero una foto del estado actual, probablemente me conviene ________.  
> Si quiero ver la salida reciente del proceso, probablemente me conviene ________.  
> Si quiero ver cambios del ciclo de vida del contenedor, probablemente me conviene ________.  
> Si quiero ver consumo de recursos, probablemente me conviene ________.

Y además respondé:

- ¿por qué esta práctica te parece más cercana a un diagnóstico real?
- ¿qué servicio de tus proyectos te gustaría observar primero con esta rutina?
- ¿qué valor le ves a `events` frente a `logs`?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- combinar `ps`, `logs`, `events` y `stats` en una misma investigación
- detectar mejor reinicios, errores recientes y consumo anormal
- entender qué pregunta responde mejor cada herramienta
- observar el stack con más criterio y menos intuición
- investigar problemas operativos de una forma bastante más ordenada

---

## Resumen del tema

- `docker compose ps` muestra el estado actual del proyecto. citeturn871930search0
- `docker compose logs` permite leer la salida del proceso y recortarla con opciones como `--tail` y `--since`. citeturn871930search3
- `docker compose events` muestra el ciclo de vida del proyecto en tiempo real y soporta salida JSON. citeturn871930search1
- `docker compose stats` muestra uso de recursos en vivo. citeturn871930search2
- Juntas, estas herramientas te permiten observar mucho mejor qué está pasando realmente en el stack.
- Este tema te deja una rutina de diagnóstico bastante más madura para el día a día.

---

## Próximo tema

En el próximo tema vas a empezar a moverte hacia otro bloque muy útil del trabajo real con Compose:

- perfiles de entorno más finos
- overrides operativos
- y cómo organizar stacks que crecen sin que el archivo se vuelva inmanejable
