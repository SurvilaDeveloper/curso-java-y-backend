---
title: "Healthchecks y readiness en Compose: evitá stacks que arrancan pero todavía no están listos"
description: "Tema 59 del curso práctico de Docker: cómo usar healthchecks y depends_on con condition en Docker Compose para distinguir entre un contenedor simplemente corriendo y un servicio realmente listo para recibir conexiones."
order: 59
module: "Healthchecks y readiness para stacks más confiables"
level: "intermedio"
draft: false
---

# Healthchecks y readiness en Compose: evitá stacks que arrancan pero todavía no están listos

## Objetivo del tema

En este tema vas a:

- entender la diferencia entre un contenedor **running** y un servicio **ready**
- usar `healthcheck` dentro de Compose
- entender mejor `depends_on`
- usar `condition: service_healthy` con más criterio
- evitar carreras de arranque típicas entre aplicación y base de datos

La idea es que tu stack no solo “suba”, sino que además tenga una forma más clara de expresar cuándo un servicio está realmente listo.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender el problema de startup race
2. ver qué resuelve y qué no resuelve `depends_on`
3. definir un `healthcheck`
4. usar `condition: service_healthy`
5. construir una regla práctica para stacks con dependencias reales

---

## Idea central que tenés que llevarte

Que un contenedor esté corriendo no significa necesariamente que el servicio ya pueda atender tráfico o aceptar conexiones.

Docker lo deja explícito para Compose: al arrancar, Compose no espera a que un contenedor esté “ready”, solo a que esté running, y eso puede causar problemas cuando una app depende de algo como una base relacional que todavía está inicializando. citeturn812882view0turn956269view3

Dicho simple:

> **running** no significa **ready**  
> y los healthchecks existen justamente para expresar mejor esa diferencia.

---

## Qué problema resuelve este tema

Imaginá este caso:

- `web` depende de `db`
- ambos arrancan con `docker compose up`
- `db` todavía está inicializando internamente
- `web` intenta conectarse demasiado pronto
- el stack “subió”, pero la app falla igual

Docker usa justamente este tipo de ejemplo en la documentación de startup order y también en la Quickstart de Compose cuando habla de “fix the startup race with health checks”. citeturn812882view0turn812882view3

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker Compose explica que:

- `depends_on` controla el orden de arranque y apagado. citeturn956269view1turn812882view0
- con sintaxis corta, Compose garantiza que las dependencias estén **started**, pero no espera a que estén **healthy**. citeturn956269view1
- para readiness real, se usa `condition` en la forma larga de `depends_on`, con opciones como `service_started`, `service_healthy` y `service_completed_successfully`. citeturn956269view3turn956269view1
- el atributo `healthcheck` en Compose define una verificación de salud del servicio y funciona de forma equivalente al `HEALTHCHECK` del Dockerfile, con posibilidad de override desde el Compose file. citeturn956269view0
- en Dockerfile, un contenedor con `HEALTHCHECK` puede pasar por estados `starting`, `healthy` y `unhealthy`. citeturn956269view2

---

## Primer concepto: depends_on no resuelve todo por sí solo

Mirá este ejemplo:

```yaml
services:
  web:
    build: .
    depends_on:
      - db

  db:
    image: postgres:18
```

A primera vista parece razonable.

Y sí, algo resuelve.

### Qué resuelve
Hace que Compose cree o arranque `db` antes que `web`. Docker lo documenta claramente para el short syntax de `depends_on`. citeturn956269view1turn812882view0

### Qué no resuelve
No espera a que `db` esté realmente lista para aceptar conexiones. Con short syntax, Compose no espera a que la dependencia esté healthy. citeturn956269view1

Esta distinción es fundamental.

---

## Segundo concepto: healthcheck

`healthcheck` es la forma de declarar una verificación de salud del servicio.

La referencia oficial de Compose lo define como una comprobación que determina si los contenedores del servicio están “healthy”, usando la misma lógica general del `HEALTHCHECK` del Dockerfile. citeturn956269view0

Un ejemplo muy simple:

```yaml
services:
  web:
    image: nginx
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 1m30s
      timeout: 10s
      retries: 3
      start_period: 40s
      start_interval: 5s
```

La documentación oficial de Compose muestra justamente esta forma y estos campos. citeturn956269view0

---

## Qué significan esos campos

Docker documenta los parámetros principales del `HEALTHCHECK` así:

- `interval`: cada cuánto se ejecuta la prueba. citeturn956269view2
- `timeout`: cuánto puede tardar una ejecución antes de considerarse fallida. citeturn956269view2
- `retries`: cuántos fallos consecutivos hacen falta para declarar el contenedor como `unhealthy`. citeturn956269view2
- `start_period`: ventana inicial de bootstrap donde los fallos no cuentan igual para el conteo normal. citeturn956269view2
- `start_interval`: frecuencia de chequeos durante el start period. Docker aclara que esta opción requiere Engine 25.0 o posterior. citeturn956269view2turn956269view0

---

## Qué forma puede tener test

Docker y Compose aceptan varias formas para `test`:

- lista con `CMD`
- lista con `CMD-SHELL`
- string, que se interpreta como `CMD-SHELL`
- `NONE`, para desactivar el healthcheck heredado del Dockerfile. citeturn956269view0turn956269view2

Por ejemplo:

```yaml
healthcheck:
  test: ["CMD-SHELL", "curl -f http://localhost || exit 1"]
```

o:

```yaml
healthcheck:
  test: curl -f http://localhost || exit 1
```

Compose documenta que ambas formas son equivalentes para el caso string vs `CMD-SHELL`. citeturn956269view0

---

## Qué estados puede tener un contenedor con healthcheck

Docker documenta estos estados:

- `starting`
- `healthy`
- `unhealthy` citeturn956269view2

Esto es muy útil porque ya no pensás solo en “está corriendo o no”.
Tenés una capa más rica de estado.

---

## Tercer concepto: service_healthy

Acá aparece la pieza que junta todo.

La documentación oficial de Compose dice que, para detectar estado listo, se usa `condition` en `depends_on`, y una de las opciones es `service_healthy`, que indica que la dependencia debe estar healthy antes de arrancar la dependiente. citeturn956269view3turn956269view1

Ejemplo:

```yaml
services:
  web:
    build: .
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:18
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 10s
      retries: 5
      start_period: 30s
      timeout: 10s
```

Docker usa justamente un ejemplo muy parecido en su guía de startup order. citeturn956269view3

---

## Qué resuelve esta forma larga

Ahora sí:

- `db` arranca primero
- además Compose espera a que `db` pase el healthcheck
- recién después crea o arranca `web`

La documentación oficial lo dice explícitamente: Compose waits for healthchecks to pass on dependencies marked with `service_healthy`. citeturn956269view3

Esto es muchísimo más parecido a lo que realmente querés en un stack con dependencias.

---

## Qué otras condiciones existen

Docker documenta tres opciones de `condition` en este contexto:

- `service_started`
- `service_healthy`
- `service_completed_successfully` citeturn956269view3

### service_started
Sirve cuando te alcanza con que la dependencia haya arrancado.

### service_healthy
Sirve cuando necesitás una señal real de readiness.

### service_completed_successfully
Sirve para casos donde una dependencia debe correr y terminar bien antes de que otra arranque, por ejemplo una tarea tipo job o migración. citeturn956269view3

---

## Qué papel juega restart dentro del depends_on largo

Docker documenta también un campo `restart: true` dentro de la sintaxis larga de `depends_on`, que hace que un servicio dependiente se reinicie después de una operación explícita de Compose sobre la dependencia, como `docker compose restart`. citeturn956269view1turn956269view3

No hace falta abusar de esto en todos los proyectos, pero está bueno saber que existe.

---

## Healthcheck en Compose vs HEALTHCHECK en Dockerfile

Acá hay otra distinción útil.

### HEALTHCHECK en Dockerfile
Viaja con la imagen como parte de su definición. Docker lo documenta en la referencia del Dockerfile. citeturn956269view2turn812882view1

### healthcheck en Compose
Es la definición de salud a nivel de servicio en el stack. Compose puede usarla para definir o sobreescribir lo que venga desde la imagen. La referencia de Compose lo dice explícitamente. citeturn956269view0

Regla práctica:

- si querés que la imagen traiga una verificación razonable por defecto, puede tener sentido Dockerfile
- si querés adaptar esa lógica al stack o al entorno, Compose te da más flexibilidad

---

## Qué hace que un healthcheck sea bueno

Un healthcheck suele ser más útil cuando:

- prueba algo realmente representativo
- no tiene efectos colaterales
- es rápido
- falla cuando el servicio todavía no está listo
- no depende de cosas irrelevantes

Docker, en la referencia del `HEALTHCHECK`, remarca que el chequeo sirve para detectar si el contenedor sigue funcionando de verdad y no solo si el proceso principal sigue vivo. citeturn956269view2

---

## Qué ejemplos son razonables

### Web app
```yaml
test: ["CMD", "curl", "-f", "http://localhost"]
```

### PostgreSQL
```yaml
test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
```

Estos ejemplos aparecen, respectivamente, en la referencia de Compose y en la guía de startup order. citeturn956269view0turn956269view3

---

## Qué no tenés que confundir

### Contenedor running no es lo mismo que servicio ready
Docker lo aclara de forma explícita para Compose. citeturn812882view0turn956269view3

### depends_on corto no espera healthy
Solo asegura orden básico de arranque. citeturn956269view1

### healthcheck no reemplaza por completo el buen diseño de la app
Sigue siendo útil que la app maneje reintentos o fallos transitorios, pero Compose mejora mucho el arranque del stack.

### healthcheck en Compose puede sobrescribir el de la imagen
La referencia oficial de Compose lo documenta. citeturn956269view0

---

## Error común 1: creer que depends_on simple ya resolvió readiness

No.
Docker documenta que con short syntax no espera a que la dependencia esté healthy. citeturn956269view1

---

## Error común 2: poner un healthcheck que solo confirma que el proceso existe

Eso puede quedarse corto si el servicio todavía no está listo de verdad para aceptar tráfico o conexiones.

---

## Error común 3: no ajustar start_period en servicios que tardan en bootstrapear

Docker documenta `start_period` justamente para dar tiempo de inicialización sin contar esos fallos igual desde el principio. citeturn956269view2

---

## Error común 4: pensar que un stack “arrancó bien” solo porque los contenedores están Up

Sin healthchecks, puede que todavía haya servicios no listos aunque ya estén corriendo.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Tomá este Compose simple:

```yaml
services:
  web:
    build: .
    depends_on:
      - db

  db:
    image: postgres:18
```

Respondé:

- qué resuelve `depends_on`
- qué no resuelve
- por qué todavía podría aparecer una carrera de arranque

### Ejercicio 2
Ahora mirá esta versión:

```yaml
services:
  web:
    build: .
    depends_on:
      db:
        condition: service_healthy

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
```

Respondé:

- qué agrega `healthcheck`
- qué agrega `condition: service_healthy`
- por qué esta versión es más robusta

### Ejercicio 3
Respondé además:

- qué diferencia hay entre `service_started` y `service_healthy`
- en qué caso te imaginarías usar `service_completed_successfully`

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué servicio depende de otro para arrancar bien
- qué tipo de chequeo representaría mejor que esa dependencia ya está lista
- si preferirías declarar el healthcheck en el Dockerfile o en Compose
- qué problema real te evitaría esto en el arranque del stack

No hace falta escribir todavía el archivo final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre running y ready?
- ¿qué dependencia de tus proyectos te parece más propensa a startup race?
- ¿qué tipo de healthcheck te parece más representativo para una app real?
- ¿qué parte del stack hoy “sube” pero quizás no está tan lista como parece?
- ¿qué te parece más útil: declarar la salud en la imagen o en Compose?

Estas observaciones valen mucho más que memorizar sintaxis.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si solo quiero ordenar el arranque básico, puede alcanzarme con ________.  
> Si necesito que una dependencia esté realmente lista antes de arrancar otra, me conviene usar ________ junto con ________.

Y además respondé:

- ¿por qué Docker insiste en que running no significa ready?
- ¿qué servicio tuyo te gustaría proteger primero con `service_healthy`?
- ¿qué ventaja te da tener un estado `healthy` en vez de solo “container up”?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar por qué un contenedor running no siempre está listo
- usar `healthcheck` dentro de Compose
- distinguir `depends_on` corto y largo
- usar `condition: service_healthy` con más criterio
- construir stacks que arranquen de forma bastante más confiable

---

## Resumen del tema

- Compose no espera readiness por defecto; solo espera que el contenedor esté running. citeturn812882view0turn956269view3
- `depends_on` corto ordena arranque y apagado, pero no espera salud. citeturn956269view1
- `healthcheck` define cómo verificar si el servicio está healthy y puede sobrescribir el HEALTHCHECK de la imagen. citeturn956269view0turn956269view2
- `condition: service_healthy` hace que Compose espere a que una dependencia pase su healthcheck antes de arrancar la dependiente. citeturn956269view3turn956269view1
- Las condiciones `service_started`, `service_healthy` y `service_completed_successfully` resuelven necesidades distintas. citeturn956269view3
- Este tema te ayuda a evitar stacks que “arrancan” pero todavía no están realmente listos.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en esta capa más operativa:

- healthchecks en Dockerfile
- cuándo conviene que viajen con la imagen
- cuándo conviene sobreescribirlos en Compose
- y cómo diseñar una señal de salud más reusable
