---
title: "Observá mejor tu stack en Compose: usá ps, logs, events y stats para entender qué está pasando"
description: "Tema 66 del curso práctico de Docker: cómo observar mejor un stack con docker compose ps, logs, events y stats, para entender arranques, reinicios, consumo de recursos y cambios de estado sin depender solo de la intuición."
order: 66
module: "Observabilidad básica del stack con Compose"
level: "intermedio"
draft: false
---

# Observá mejor tu stack en Compose: usá ps, logs, events y stats para entender qué está pasando

## Objetivo del tema

En este tema vas a:

- usar `docker compose ps` con más intención
- leer mejor logs con `docker compose logs`
- entender qué aporta `docker compose events`
- observar consumo de recursos con `docker compose stats`
- construir una forma más ordenada de mirar qué está pasando en tu stack

La idea es que no dependas solo de “parece que arrancó” o “parece que falló”, sino que aprendas a mirar señales concretas del stack.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. usar `ps` como foto del estado actual
2. usar `logs` como historia de salida del stack
3. usar `events` como flujo de cambios en tiempo real
4. usar `stats` como ventana al consumo de recursos
5. combinar estas herramientas en una rutina de diagnóstico simple

---

## Idea central que tenés que llevarte

Un stack puede:

- estar corriendo
- estar reiniciándose
- estar sano pero ruidoso
- estar gastando demasiada memoria
- haber creado, recreado o destruido contenedores hace segundos

Y no todo eso se ve con un solo comando.

Dicho simple:

> `ps` te da una foto  
> `logs` te cuentan la salida  
> `events` te muestran cambios de estado  
> y `stats` te deja ver consumo de recursos

Juntas, estas herramientas te dan una lectura mucho más realista del stack.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker Compose describe `docker compose ps` como una foto del estado actual de los servicios y documenta filtrado por estado y distintos formatos de salida. También define `docker compose logs` como la forma de ver la salida de los servicios, con opciones como `--follow`, `--tail`, `--since` y `--index`. La referencia de `docker compose events` explica que transmite en tiempo real eventos de todos los contenedores del proyecto y que con `--json` emite un objeto por línea, incluyendo campos como tiempo, tipo, acción, servicio y atributos. Además, `docker compose stats` muestra un stream en vivo del uso de recursos de los contenedores del proyecto, y la referencia de `docker compose up` aclara que el comando agrega la salida de los contenedores de forma parecida a `docker compose logs --follow`. citeturn504593search2turn504593search1turn504593search0turn504593search10turn504593search19

---

## Primer bloque: `docker compose ps`

La forma base es:

```bash
docker compose ps
```

La documentación oficial lo presenta como una vista del estado actual de los servicios. citeturn504593search2turn504593search12

---

## Qué te muestra realmente

Te muestra algo parecido a una foto del stack en este instante.

Normalmente te interesa mirar cosas como:

- nombre del servicio
- estado
- puertos
- nombre del contenedor
- a veces el exit code o el estado concreto

No te cuenta la historia completa.
Pero te orienta rapidísimo.

---

## Qué preguntas responde bien `ps`

`docker compose ps` responde bien preguntas como estas:

- ¿qué servicios están arriba ahora?
- ¿cuál quedó detenido?
- ¿cuál está reiniciándose?
- ¿qué puertos tiene publicados?
- ¿qué parte del stack existe realmente en este momento?

Por eso suele ser una muy buena primera parada.

---

## Filtrar por estado

La referencia oficial documenta que `docker compose ps` soporta filtrado por estado con `--status` y también con `--filter status=<status>`. citeturn504593search2

Por ejemplo:

```bash
docker compose ps --status running
```

o:

```bash
docker compose ps --filter status=exited
```

Esto es muy útil cuando querés enfocarte en:

- lo que sigue vivo
- lo que ya salió
- o lo que quedó fallando

---

## Formatos de salida

La documentación oficial también documenta `--format`, incluyendo salida JSON. citeturn504593search2

Por ejemplo:

```bash
docker compose ps --format json
```

No hace falta usarlo todo el tiempo, pero es bueno saber que existe cuando querés inspección más estructurada o scripts.

---

## Segundo bloque: `docker compose logs`

La forma base es:

```bash
docker compose logs
```

La referencia oficial de logs documenta opciones como `--follow`, `--tail`, `--since`, `--no-log-prefix` e `--index`. citeturn504593search1

---

## Qué te muestra realmente

Te muestra la salida de los servicios.

O sea:

- mensajes de arranque
- errores
- warnings
- trazas
- información escrita a stdout/stderr por los procesos del stack

Es una herramienta muchísimo más narrativa que `ps`.

---

## Cuándo conviene usar logs

Conviene mucho cuando querés responder preguntas como:

- ¿por qué falló?
- ¿qué dijo el servicio al arrancar?
- ¿qué pasó justo antes del reinicio?
- ¿qué servicio está generando ruido?
- ¿hay errores repetidos?

Si `ps` te orienta, `logs` suele empezar a explicarte.

---

## Seguir logs en vivo

La forma típica es:

```bash
docker compose logs -f
```

La documentación oficial documenta `--follow` para seguir la salida en tiempo real. citeturn504593search1

Esto es muy útil cuando:

- estás levantando el stack
- acabás de recrear un servicio
- querés mirar si algo entra en bucle
- querés ver si el servicio mejora o empeora al momento

---

## Mirar pocas líneas

La referencia oficial documenta `--tail`. citeturn504593search1

Por ejemplo:

```bash
docker compose logs --tail 50
```

Esto ayuda mucho cuando:

- no querés tragarte una pared de logs
- querés solo el final
- estás entrando al problema desde el punto más reciente

---

## Mirar desde un momento concreto

La referencia oficial documenta `--since` con timestamps absolutos o relativos. citeturn504593search1

Por ejemplo:

```bash
docker compose logs --since 10m
```

Esto es muy útil cuando:

- querés ver solo lo reciente
- reiniciaste algo hace poco
- el log histórico ya es demasiado largo

---

## Logs de una réplica concreta

La referencia oficial documenta `--index` para seleccionar un contenedor cuando un servicio tiene varias réplicas. citeturn504593search1

Por ejemplo:

```bash
docker compose logs --index 2 web
```

No lo vas a usar siempre, pero es muy útil saber que existe cuando el problema no ocurre igual en todas las instancias.

---

## `docker compose up` también muestra salida

La referencia oficial de `docker compose up` explica que el comando agrega la salida de los contenedores, de forma parecida a `docker compose logs --follow`. citeturn504593search19

Esto significa que:

- `up` ya te sirve para observar el arranque en vivo
- pero `logs` te da un control mucho más específico después

Es una relación útil para no mezclar herramientas.

---

## Tercer bloque: `docker compose events`

La forma base es:

```bash
docker compose events
```

La documentación oficial define este comando como un stream en tiempo real de eventos de todos los contenedores del proyecto. citeturn504593search0

---

## Qué te muestra realmente

Te muestra cambios de estado y acciones sobre los recursos del stack.

Por ejemplo, eventos como:

- create
- start
- stop
- die
- restart
- kill
- recreate

No está pensado para reemplazar a los logs.
Está pensado para mostrarte “qué pasó” en la vida del stack como sistema.

---

## Cuándo conviene muchísimo usar events

Conviene mucho cuando querés responder preguntas como:

- ¿se está recreando este servicio?
- ¿se muere y vuelve a arrancar?
- ¿el contenedor fue creado de nuevo?
- ¿qué evento acaba de ocurrir?
- ¿esto es un fallo puntual o un loop de reinicios?

Si `logs` habla desde el proceso, `events` habla desde el ciclo de vida del contenedor.

---

## Salida JSON en events

La referencia oficial documenta `--json` y muestra el formato del objeto emitido. Incluye campos como:

- `time`
- `type`
- `action`
- `id`
- `service`
- `attributes` citeturn504593search0

Por ejemplo:

```bash
docker compose events --json
```

Esto es excelente si querés:

- leer eventos con más precisión
- procesarlos en scripts
- entender mejor qué cambió y cuándo

---

## Un ejemplo de lectura mental de events

Si ves algo como:

- `create`
- `start`
- `die`
- `start`
- `die`

la lectura más probable es:

- el contenedor entra en problema
- Docker o Compose lo está relanzando
- tenés una señal fuerte de inestabilidad del servicio

`events` es muy bueno para detectar ese tipo de patrones rápidamente.

---

## Cuarto bloque: `docker compose stats`

La forma base es:

```bash
docker compose stats
```

La referencia oficial lo describe como un stream en vivo del uso de recursos de los contenedores del proyecto. citeturn504593search10

---

## Qué te muestra realmente

Te muestra consumo de recursos como:

- CPU
- memoria
- tráfico de red
- I/O de bloques
- PIDs

No te dice por qué algo está consumiendo de más.
Pero sí te muestra **qué** servicio está consumiendo más y cómo evoluciona.

---

## Cuándo conviene usar stats

Conviene mucho cuando querés responder preguntas como:

- ¿qué servicio se está yendo de memoria?
- ¿cuál consume CPU de forma anormal?
- ¿esto es un problema de recursos o de lógica?
- ¿cuál de todos los servicios está más cargado?
- ¿esta recreación aumentó mucho el consumo?

Es una herramienta muy buena para no mirar problemas de performance a ciegas.

---

## Una rutina muy útil de observación

Podés pensar esta secuencia:

### Paso 1
```bash
docker compose ps
```
Para ver el estado actual.

### Paso 2
```bash
docker compose logs --tail 50
```
Para ver el final de la historia reciente.

### Paso 3
```bash
docker compose events
```
Para detectar cambios de ciclo de vida en vivo.

### Paso 4
```bash
docker compose stats
```
Para ver si también hay un patrón de consumo problemático.

Esta rutina te da una lectura muchísimo mejor del stack.

---

## Qué tipo de problema detecta mejor cada comando

### `ps`
Detecta estado actual.

### `logs`
Detecta explicación desde el proceso.

### `events`
Detecta cambios de ciclo de vida del contenedor.

### `stats`
Detecta presión o anomalías de recursos.

Pensarlo así te ayuda a no pedirle a un solo comando que te dé toda la verdad.

---

## Qué no tenés que confundir

### `ps` no reemplaza a `logs`
Uno te da estado; el otro, salida.

### `logs` no reemplaza a `events`
Los logs vienen del proceso. Los events vienen del runtime del proyecto.

### `stats` no te explica el error
Te muestra síntomas de consumo, no la causa lógica.

### `up` no reemplaza toda la observación
Te muestra salida agregada, pero no te da la misma flexibilidad que usar cada comando por separado. citeturn504593search19

---

## Error común 1: mirar solo logs y nunca events

A veces el problema real está en el ciclo de recreación o reinicio, no en lo que el proceso alcanza a escribir.

---

## Error común 2: mirar solo ps y concluir demasiado rápido

`ps` es una foto muy útil, pero no te cuenta cómo llegaste a ese estado.

---

## Error común 3: ignorar stats cuando el problema podría ser consumo

A veces el servicio “funciona”, pero el verdadero problema es que está consumiendo demasiados recursos.

---

## Error común 4: usar logs infinitos sin recortar con tail o since

Eso puede hacerte perder mucho tiempo entre ruido.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Respondé qué mirarías primero en cada caso:

- querés saber qué servicios están corriendo ahora
- querés ver por qué un servicio falló
- querés saber si un contenedor se está recreando en bucle
- querés ver cuál servicio consume más memoria

### Ejercicio 2
Asociá cada necesidad con uno de estos comandos:

```bash
docker compose ps
docker compose logs
docker compose events
docker compose stats
```

### Ejercicio 3
Ahora respondé con tus palabras:

- qué problema te ayuda a ver `events` que `logs` no siempre muestra tan claro
- qué valor práctico te da `stats`
- por qué `ps` suele ser una buena primera parada
- por qué `logs --tail` suele ser mejor que abrir toda la historia completa de una

### Ejercicio 4
Imaginá un servicio que entra en loop de restart.
Respondé qué secuencia usarías para investigarlo entre:

- `ps`
- `logs`
- `events`
- `stats`

Y por qué.

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué comando usarías primero si el stack “sube raro”
- qué comando usarías si la app parece sana pero lenta
- qué comando usarías si sospechás reinicios o recreaciones inesperadas
- qué parte de tu flujo actual te gustaría hacer más observável con estas herramientas

No hace falta escribir comandos largos ni scripts.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre estado, salida, eventos y recursos?
- ¿qué comando de todos te parece más subestimado?
- ¿en qué tipo de problema te imaginás usando más `events`?
- ¿qué parte de tus stacks hoy observás con demasiada intuición y poca evidencia?
- ¿qué mejora práctica te da pensar en estas cuatro ventanas por separado?

Estas observaciones valen mucho más que memorizar opciones.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero una foto del estado actual, probablemente me conviene ________.  
> Si quiero ver qué escribió el proceso, probablemente me conviene ________.  
> Si quiero ver cambios de ciclo de vida del contenedor, probablemente me conviene ________.  
> Si quiero ver consumo de recursos, probablemente me conviene ________.

Y además respondé:

- ¿por qué `events` te parece una herramienta tan útil para loops de restart?
- ¿qué valor te da `stats` aunque no explique la causa lógica del problema?
- ¿qué servicio de tus proyectos te gustaría mirar primero con esta rutina?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- distinguir qué tipo de observación te da `ps`, `logs`, `events` y `stats`
- usar una rutina simple para investigar problemas del stack
- detectar mejor loops de reinicio, consumo anormal y fallos recientes
- leer el estado del proyecto con más criterio y menos intuición
- observar mejor lo que está haciendo realmente tu composición

---

## Resumen del tema

- `docker compose ps` te da una foto del estado actual de los servicios. citeturn504593search2turn504593search12
- `docker compose logs` muestra la salida de los procesos y permite seguirla, recortarla y filtrarla en el tiempo. citeturn504593search1
- `docker compose events` transmite eventos en tiempo real sobre el ciclo de vida de los contenedores del proyecto y soporta salida JSON. citeturn504593search0
- `docker compose stats` muestra el uso de recursos en vivo. citeturn504593search10
- `docker compose up` agrega salida de logs, pero no reemplaza la observación más específica con estas herramientas. citeturn504593search19
- Este tema te ayuda a mirar el stack como un sistema observable y no solo como un conjunto de contenedores “arriba o abajo”.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en esta capa operativa con una práctica integrada:

- stack con fallos controlados
- observación de estado, logs, eventos y recursos
- y una forma mucho más ordenada de investigar qué está pasando realmente
