---
title: "Running no siempre significa listo: HEALTHCHECK, healthy/unhealthy y readiness real"
description: "Tema 107 del curso práctico de Docker: cómo usar HEALTHCHECK para distinguir entre un contenedor que simplemente está corriendo y uno que realmente está listo, cómo ver estados de salud, cómo configurarlo en Dockerfile o Compose y cómo usar service_healthy para evitar carreras de arranque."
order: 107
module: "Salud, readiness y arranque confiable"
level: "intermedio"
draft: false
---

# Running no siempre significa listo: HEALTHCHECK, healthy/unhealthy y readiness real

## Objetivo del tema

En este tema vas a:

- distinguir claramente entre un contenedor **running** y un contenedor realmente **ready**
- entender qué resuelve `HEALTHCHECK`
- ver los estados `starting`, `healthy` y `unhealthy`
- aprender a mirar salud con `docker ps` e `inspect`
- usar healthchecks en Dockerfile y en Compose
- entender cómo `service_healthy` ayuda a evitar carreras de arranque

La idea es que dejes de pensar “si el contenedor está running, entonces ya está listo” y empieces a separar mejor **vida del proceso** de **disponibilidad real del servicio**.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender por qué `running` no alcanza
2. ver qué hace realmente `HEALTHCHECK`
3. aprender qué significan `starting`, `healthy` y `unhealthy`
4. mirar cómo se consulta ese estado
5. usar healthchecks desde Dockerfile o Compose
6. conectar eso con `depends_on` y `service_healthy`

---

## Idea central que tenés que llevarte

Un contenedor puede estar perfectamente **running** y aun así no estar listo para atender tráfico o dependencias.

Docker documenta justamente que `HEALTHCHECK` existe para detectar casos donde el proceso principal sigue vivo pero el servicio ya no funciona correctamente, por ejemplo un web server trabado o una app que todavía no terminó de inicializar. Cuando hay healthcheck, el contenedor tiene un estado de salud adicional a su estado normal: empieza en `starting`, pasa a `healthy` cuando una comprobación tiene éxito y se vuelve `unhealthy` tras cierta cantidad de fallos consecutivos. citeturn331647view0turn331647view2

Dicho simple:

> `running` te dice que hay un proceso vivo.  
> `healthy` te dice que el servicio pasó una prueba de salud.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker deja varias ideas muy claras para este tema:

- `HEALTHCHECK` en Dockerfile tiene dos formas: `HEALTHCHECK [OPTIONS] CMD ...` y `HEALTHCHECK NONE`, que deshabilita un healthcheck heredado de la imagen base. citeturn331647view0
- Cuando un contenedor tiene healthcheck, su salud empieza en `starting`; después pasa a `healthy` cuando una prueba tiene éxito y a `unhealthy` después de cierta cantidad de fallos consecutivos. citeturn331647view0
- Las opciones principales son `interval`, `timeout`, `start_period`, `start_interval` y `retries`; `start_period` da tiempo de bootstrap sin contar fallos hacia el límite, y `start_interval` controla la frecuencia de checks durante ese período inicial. citeturn331647view0turn444871view4
- El comando del healthcheck debe devolver `0` para saludable y `1` para no saludable; el exit code `2` está reservado. Docker guarda la salida corta del probe y puede consultarse con `docker inspect`. citeturn331647view0turn331647view2
- La salud también aparece en `docker ps`. citeturn331647view2
- Compose soporta `healthcheck` a nivel de servicio con el mismo comportamiento general que Dockerfile y puede sobrescribir lo definido por la imagen. También permite `disable: true` o `test: ["NONE"]` para desactivarlo. citeturn331647view1
- Compose no espera readiness real por defecto; con `depends_on.condition: service_healthy` sí puede esperar que la dependencia esté saludable antes de arrancar el servicio dependiente. citeturn444871view1

---

## Primer concepto: `running` no significa “listo”

Imaginá una base PostgreSQL o una app web que:

- ya arrancó su proceso principal
- todavía está cargando config
- todavía no acepta conexiones
- o responde mal aunque el proceso siga vivo

Desde afuera, el contenedor puede verse **running**.
Pero desde el punto de vista real del stack, todavía no está listo.

Este es exactamente el hueco que llena `HEALTHCHECK`.

---

## Qué problema real resuelve esto

Resuelve cosas como:

- web server que sigue vivo pero dejó de responder
- base que tardó en inicializar y todavía no acepta conexiones
- app que abrió el proceso pero todavía no terminó su bootstrap
- dependencia que hace fallar al servicio de arriba por carrera de arranque

Esto es muchísimo más común de lo que parece.

---

## Segundo concepto: cómo se declara un healthcheck en Dockerfile

La forma básica es:

```Dockerfile
HEALTHCHECK CMD comando
```

Por ejemplo:

```Dockerfile
HEALTHCHECK --interval=30s --timeout=5s --retries=3   CMD curl -f http://localhost/ || exit 1
```

Docker documenta que `HEALTHCHECK` puede usar shell form o exec form, y que el exit code del comando determina la salud. citeturn331647view0

---

## Cómo se lee este ejemplo

La lectura conceptual sería:

- cada cierto tiempo Docker ejecuta el comando
- si responde bien, el contenedor está `healthy`
- si falla varias veces seguidas, pasa a `unhealthy`

Esto ya te da una capa de “vida útil del servicio” que va más allá de si el proceso existe.

---

## Tercer concepto: opciones importantes

Docker documenta estas opciones principales:

- `--interval`
- `--timeout`
- `--start-period`
- `--start-interval`
- `--retries` citeturn331647view0turn444871view4

### `interval`
cada cuánto se corre el check normalmente.

### `timeout`
cuánto tiempo se espera antes de considerar fallida una ejecución.

### `retries`
cuántos fallos consecutivos hacen falta para marcar `unhealthy`.

### `start_period`
tiempo de gracia inicial para bootstrap.

### `start_interval`
frecuencia de checks durante ese período inicial.

---

## Qué enseñanza deja `start_period`

`start_period` es especialmente valioso cuando el servicio necesita tiempo real para levantar.

Docker explica que durante ese período los fallos no cuentan hacia el límite de reintentos, salvo que ya haya habido un check exitoso. citeturn331647view0turn444871view4

Esto evita castigar prematuramente a servicios que:

- arrancan bien
- pero tardan un poco más en quedar listos

---

## Cuarto concepto: estados de salud

Docker documenta tres estados conceptuales clave:

- `starting`
- `healthy`
- `unhealthy` citeturn331647view0

### `starting`
el contenedor tiene healthcheck, pero todavía está en fase de arranque o grace period.

### `healthy`
una comprobación pasó correctamente.

### `unhealthy`
hubo suficientes fallos consecutivos para que Docker considere que el servicio no está bien.

Esto convive con el estado normal del contenedor.
O sea, un contenedor puede estar:

- `running` y `healthy`
- `running` y `starting`
- `running` y `unhealthy`

Esa distinción es central.

---

## Quinto concepto: cómo mirar la salud

Docker documenta dos caminos muy útiles.

### Verlo en `docker ps`
La documentación oficial dice que el estado de salud también aparece en `docker ps`. citeturn331647view2

### Verlo en `inspect`
Por ejemplo:

```bash
docker inspect --format '{{.State.Health.Status}}' mi-contenedor
```

Y, si querés más detalle:

```bash
docker inspect --format '{{json .State.Health}}' mi-contenedor
```

Docker documenta justamente este tipo de salida y que el output del probe queda guardado en el health status. citeturn331647view0turn331647view2

---

## Qué gana `inspect` acá

Gana muchísimo porque no solo ves el estado final.
También podés ver:

- racha de fallos (`FailingStreak`)
- log de ejecuciones
- salida corta del comando de salud

Eso vuelve mucho más claro *por qué* quedó `unhealthy`.

---

## Sexto concepto: Compose puede sobrescribir o definir healthchecks

Docker documenta que en Compose el atributo `healthcheck` funciona igual que la instrucción `HEALTHCHECK` de Dockerfile y puede sobrescribir lo que defina la imagen. citeturn331647view1

Por ejemplo:

```yaml
services:
  app:
    image: miusuario/app:dev
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 3s
      retries: 5
      start_period: 20s
```

---

## Qué te enseña esto

Te enseña algo muy útil:

> no siempre necesitás reconstruir la imagen para ajustar la salud en un entorno Compose.  
> A veces alcanza con definir u overridear el healthcheck en el Compose file.

Eso da muchísima flexibilidad para desarrollo y orquestación local.

---

## Séptimo concepto: `CMD` vs `CMD-SHELL`

Compose documenta que `test` puede ser una lista o un string.

- si es lista, el primer item debe ser `NONE`, `CMD` o `CMD-SHELL`
- si es string, equivale a `CMD-SHELL ...` citeturn331647view1

Por ejemplo, estas dos formas son equivalentes:

```yaml
test: ["CMD-SHELL", "curl -f http://localhost || exit 1"]
```

```yaml
test: curl -f http://localhost || exit 1
```

### Qué enseñanza deja esto
- `CMD` es más explícito y más cercano a exec form
- `CMD-SHELL` te deja usar operadores de shell como `|| exit 1`

Esto te da flexibilidad, pero también conviene usarlo con intención.

---

## Octavo concepto: deshabilitar un healthcheck heredado

Docker documenta que en Dockerfile existe:

```Dockerfile
HEALTHCHECK NONE
```

para deshabilitar uno heredado de la base. citeturn331647view0

Y Compose documenta dos formas útiles:

```yaml
healthcheck:
  test: ["NONE"]
```

o:

```yaml
healthcheck:
  disable: true
```

citeturn331647view1

Esto importa porque no siempre un healthcheck heredado encaja con tu servicio real.

---

## Noveno concepto: Compose no espera readiness real por defecto

Docker documenta esto muy claramente:
Compose arranca servicios en orden de dependencia, pero **no espera** a que estén listos, solo a que estén corriendo. citeturn444871view1

Ese es el origen de muchísimas carreras del tipo:

- `app` arrancó antes de que `db` acepte conexiones
- `web` salió a hablar con Redis antes de que Redis respondiera
- el contenedor “estaba running”, pero todavía no listo

---

## La solución: `service_healthy`

Docker documenta que `depends_on` puede usar condiciones como:

- `service_started`
- `service_healthy`
- `service_completed_successfully` citeturn444871view1

Y `service_healthy` significa justamente que la dependencia debe estar **healthy** antes de arrancar el servicio dependiente. citeturn444871view1

---

## Un ejemplo muy sano

```yaml
services:
  db:
    image: postgres:18
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: mysecretpassword
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 10s
      retries: 5
      start_period: 30s
      timeout: 10s

  app:
    image: miusuario/app:dev
    depends_on:
      db:
        condition: service_healthy
```

Docker muestra precisamente este patrón en su documentación oficial de startup order. citeturn444871view1

---

## Qué te enseña este ejemplo

Te enseña algo fundamental:

- `depends_on` solo no alcanza para readiness real
- `healthcheck` convierte el arranque en algo más confiable
- `service_healthy` reduce carreras entre servicios

Esto conecta directo con bloques anteriores de init, startup order y troubleshooting.

---

## Qué no tenés que confundir

### `running` no es lo mismo que `healthy`
Ese es el corazón del tema. citeturn331647view0turn331647view2

### Healthcheck no reemplaza buen diseño de la app
Solo agrega una verificación externa o interna de salud.

### `depends_on` solo no resuelve readiness
Docker lo documenta explícitamente. citeturn444871view1

### Un healthcheck heredado de la imagen no siempre es correcto para tu caso
Por eso existe `HEALTHCHECK NONE` o `disable: true`. citeturn331647view0turn331647view1

---

## Error común 1: asumir que “si está running, ya está listo”

Es justo el error que este bloque intenta corregir.

---

## Error común 2: hacer probes con efectos colaterales

El healthcheck debería comprobar salud, no alterar el estado del servicio.

---

## Error común 3: usar timeouts, retries o start periods sin pensar en el tiempo real de bootstrap

Eso puede marcar `unhealthy` demasiado pronto o demasiado tarde. citeturn331647view0turn444871view4

---

## Error común 4: olvidar revisar `.State.Health` en `inspect` cuando querés entender por qué falló un contenedor “running pero raro”

Ahí suele estar la evidencia que te faltaba. citeturn331647view2

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Respondé con tus palabras:

- por qué `running` no garantiza readiness real
- qué problema resuelve `HEALTHCHECK`
- qué significan `starting`, `healthy` y `unhealthy`

### Ejercicio 2
Mirá este ejemplo:

```Dockerfile
HEALTHCHECK --interval=30s --timeout=5s --retries=3   CMD curl -f http://localhost/ || exit 1
```

Respondé:

- qué se está verificando
- qué rol cumplen `interval`, `timeout` y `retries`
- qué tendría que pasar para que el contenedor termine `unhealthy`

### Ejercicio 3
Mirá este Compose:

```yaml
services:
  db:
    image: postgres:18
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 10s
      retries: 5
      start_period: 30s
      timeout: 10s

  app:
    image: miusuario/app:dev
    depends_on:
      db:
        condition: service_healthy
```

Respondé:

- qué problema resuelve el healthcheck de `db`
- por qué `service_healthy` es más fuerte que “arrancó el contenedor”
- por qué esto ayuda a evitar carreras de arranque

### Ejercicio 4
Respondé además:

- cómo consultarías el estado de salud con `inspect`
- por qué `docker ps` también te puede dar una pista útil
- cuándo te parecería razonable desactivar un healthcheck heredado

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué servicio hoy puede estar “running pero no listo”
- qué comando usarías como probe de salud
- si hoy te falta más `start_period`, más retries o simplemente un healthcheck que todavía no existe
- si Compose hoy arranca tus servicios demasiado pronto
- qué mejora concreta te gustaría notar al agregar salud real al stack

No hace falta escribir todavía el Dockerfile o Compose final.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre vida del proceso y disponibilidad real del servicio?
- ¿en qué proyecto tuyo hoy `service_healthy` te evitaría más problemas?
- ¿qué probe te parece más representativo de “salud real” para tu servicio?
- ¿qué parte del tuning te parece más sensible: timeout, retries o start period?
- ¿qué mejora concreta te gustaría notar al dejar de depender solo de `running`?

Estas observaciones valen mucho más que memorizar sintaxis.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero comprobar que un servicio no solo corre, sino que además responde bien, probablemente me conviene usar ________.  
> Si el contenedor tiene esa comprobación, su salud puede pasar por estados como `starting`, `________` y `________`.  
> Si una dependencia debe estar realmente lista antes de arrancar otra, probablemente me conviene usar `depends_on` con `condition: ________`.  
> Si quiero ver el detalle del historial de checks, probablemente me conviene mirar `docker inspect` sobre `________.Health`.

Y además respondé:

- ¿por qué este tema impacta tanto en arranques confiables?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no confundir “proceso vivo” con “servicio listo”?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- distinguir mucho mejor entre `running` y `healthy`
- declarar healthchecks en Dockerfile o Compose
- entender qué hacen `interval`, `timeout`, `retries`, `start_period` y `start_interval`
- mirar el estado de salud con `docker ps` e `inspect`
- usar `service_healthy` para mejorar el orden real de arranque
- diseñar stacks bastante más confiables frente a carreras de arranque

---

## Resumen del tema

- `HEALTHCHECK` agrega una comprobación de salud al contenedor y define un estado adicional a su estado normal. citeturn331647view0
- Los estados de salud principales son `starting`, `healthy` y `unhealthy`. citeturn331647view0
- Las opciones principales incluyen `interval`, `timeout`, `start_period`, `start_interval` y `retries`. citeturn331647view0turn444871view4
- El output del probe se guarda en el health status y puede consultarse con `docker inspect`; la salud también aparece en `docker ps`. citeturn331647view0turn331647view2
- Compose puede definir u overridear `healthcheck`, y `depends_on.condition: service_healthy` permite esperar readiness real de una dependencia. citeturn331647view1turn444871view1
- Este tema te deja una base mucho más sólida para separar contenedores simplemente corriendo de servicios realmente listos.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque con una práctica integrada:

- `HEALTHCHECK`
- `docker ps`
- `inspect`
- `service_healthy`
- y un arranque app + db mucho más confiable de punta a punta
