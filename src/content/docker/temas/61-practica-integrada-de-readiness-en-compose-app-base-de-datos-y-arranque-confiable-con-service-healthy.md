---
title: "Práctica integrada de readiness en Compose: app, base de datos y arranque confiable con service_healthy"
description: "Tema 61 del curso práctico de Docker: una práctica integrada donde combinás una aplicación, una base de datos, un healthcheck real y depends_on con condition: service_healthy para evitar carreras de arranque y mejorar la confiabilidad del stack."
order: 61
module: "Healthchecks y readiness para stacks más confiables"
level: "intermedio"
draft: false
---

# Práctica integrada de readiness en Compose: app, base de datos y arranque confiable con service_healthy

## Objetivo del tema

En este tema vas a:

- juntar varias ideas del bloque de readiness en una sola práctica
- usar una app que depende de una base de datos
- definir un `healthcheck` real para la base
- usar `condition: service_healthy`
- comparar un stack que solo “sube” con uno que además arranca con más criterio

La idea es bajar todo este bloque a un caso concreto donde se vea por qué running no alcanza y por qué readiness cambia mucho la confiabilidad del arranque.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. definir un stack simple con `app` y `db`
2. ver qué pasa con un `depends_on` básico
3. agregar un `healthcheck` a la base
4. usar la forma larga de `depends_on`
5. hacer que la app espere una señal más realista de disponibilidad
6. cerrar este subbloque con una práctica bastante cercana a un caso real

---

## Idea central que tenés que llevarte

Ya viste algo fundamental:

- que un contenedor esté corriendo no significa que el servicio ya esté listo
- que `depends_on` corto ordena arranque, pero no resuelve readiness real
- que `service_healthy` usa una señal más significativa

Este tema junta esas ideas en una práctica simple y muy valiosa:

> un stack más confiable no es solo uno que inicia contenedores,  
> sino uno que además expresa cuándo una dependencia está realmente lista para ser usada.

---

## Escenario del tema

Vas a trabajar con este caso:

- una app llamada `app`
- una base de datos llamada `db`

La app necesita que la base ya esté lista para aceptar conexiones.

La diferencia entre un arranque ingenuo y uno más robusto va a estar justo ahí.

---

## Estructura conceptual del stack

El stack va a tener dos servicios:

- `db` → PostgreSQL
- `app` → una app simple que depende de la base

No hace falta que la app sea compleja.
Lo importante es ver cómo cambia el comportamiento del arranque según cómo describís las dependencias.

---

## Primera versión: arranque básico pero ingenuo

Mirá esta versión:

```yaml
services:
  app:
    build: .
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

## Cómo se lee esta primera versión

La lectura conceptual sería:

- `app` depende de `db`
- Compose arranca `db` antes que `app`
- la base tiene su configuración mínima

A primera vista parece suficiente.

Pero no lo es.

---

## Qué resuelve esta versión

Resuelve orden de arranque.

Eso significa:

- `db` se crea o inicia antes que `app`
- Compose respeta esa dependencia básica

Esto está bien.
Pero no alcanza para readiness real.

---

## Qué problema sigue existiendo

La base puede estar todavía:

- inicializando internamente
- creando estructuras
- levantando el proceso
- o simplemente no lista para aceptar conexiones

Entonces:

- `db` ya está running
- `app` arranca
- `app` intenta conectarse
- y el stack puede fallar igual

Ese es exactamente el tipo de startup race que este bloque quiere que aprendas a evitar.

---

## Segunda versión: arranque más confiable

Ahora mirá esta versión:

```yaml
services:
  app:
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

---

## Qué cambia en esta versión

Cambian dos cosas fundamentales:

### 1. `db` tiene `healthcheck`
Ahora la base expresa una señal concreta de salud.

### 2. `app` depende de `service_healthy`
Ahora Compose no solo espera que `db` haya arrancado, sino que además haya pasado el chequeo de salud.

Esto hace una diferencia enorme.

---

## Cómo se lee el healthcheck de PostgreSQL

La idea del check es:

- ejecutar `pg_isready`
- usar el usuario y la base configurados
- comprobar si PostgreSQL ya está listo para aceptar conexiones

No es un chequeo decorativo.
Representa bastante bien el momento en que la base está utilizable para la app.

---

## Por qué este check es mucho mejor que “solo mirar si el contenedor existe”

Porque un contenedor puede existir y estar arriba, pero la base todavía no estar lista.

En cambio, `pg_isready` intenta validar algo mucho más cerca de lo que realmente le importa a la app:

- si la base está aceptando conexiones

Eso ya es una señal de readiness bastante más real.

---

## Qué resuelve `condition: service_healthy`

Resuelve la diferencia entre:

- “el contenedor arrancó”
- “la dependencia ya está lista”

En esta versión:

- Compose arranca `db`
- espera a que el healthcheck marque la base como healthy
- recién después arranca `app`

Ese orden es mucho más parecido a lo que realmente necesitás en un stack con dependencias.

---

## Qué rol juega `start_period`

`start_period` le da a PostgreSQL un margen razonable para inicializar sin castigar demasiado temprano los primeros fallos del check.

Esto es muy útil en servicios que:

- no están listos instantáneamente
- necesitan algunos segundos para bootstrapear
- podrían marcarse mal como “unhealthy” si el chequeo empieza demasiado pronto

Es una pieza importante de un healthcheck bien pensado.

---

## Qué rol juegan `interval`, `timeout` y `retries`

### `interval`
Cada cuánto se ejecuta el chequeo.

### `timeout`
Cuánto puede tardar una ejecución antes de contarse como fallida.

### `retries`
Cuántos fallos consecutivos hacen falta para declarar la salud como mala.

La clave no es memorizar los nombres, sino entender que estos valores ayudan a que el check represente mejor el comportamiento real del servicio.

---

## Una app mínima para acompañar el ejemplo

No hace falta una app compleja.

Podrías imaginar algo tan simple como un contenedor que:

- arranca
- intenta conectarse a `db`
- y depende de que la base ya esté lista

Por ejemplo, un `Dockerfile` mínimo con una app Node muy simple, o incluso una app ficticia para razonar el caso.

Lo importante de este tema no es el código de la app:
es la lógica de arranque del stack.

---

## Cómo se vería el stack completo con una app propia simple

Imaginá esta estructura:

```text
app-db-ready/
├── compose.yaml
├── Dockerfile
├── package.json
└── src/
    └── index.js
```

### Dockerfile

```Dockerfile
FROM node:22
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "src/index.js"]
```

### package.json

```json
{
  "name": "app-db-ready",
  "version": "1.0.0",
  "scripts": {
    "start": "node src/index.js"
  }
}
```

### src/index.js

```javascript
console.log("La app arrancó después de que la base estuvo healthy");
```

### compose.yaml

```yaml
services:
  app:
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

---

## Cómo se lee esta práctica integrada

La lectura conceptual sería:

- `db` arranca primero
- `db` no solo tiene configuración, también tiene una señal de salud
- `app` no arranca apenas el contenedor de `db` existe
- `app` espera a que la base esté healthy

Esto ya muestra de forma muy concreta la diferencia entre orden de arranque y readiness real.

---

## Qué te enseña realmente esta práctica

Te enseña a pensar los stacks así:

- no solo qué servicio depende de cuál
- sino **qué significa realmente que esa dependencia esté lista**

Ese cambio de mentalidad es muy importante.

Porque en sistemas reales, muchas veces el problema no es “qué arranca primero”, sino “qué ya está listo de verdad”.

---

## Qué pasa si mañana agregás otro servicio

Este criterio escala bastante bien.

Por ejemplo:

- `api` depende de `db`
- `worker` depende de `api`
- `admin` depende de que ciertos servicios ya estén sanos

No hace falta que todo use `service_healthy`, pero ahora ya tenés una herramienta mucho más sólida para decidir dónde sí tiene sentido.

---

## Cuándo no hace falta exagerar

No todo servicio necesita un healthcheck sofisticado.

Y no toda dependencia necesita `service_healthy`.

Este tema no te está diciendo:

> “poné healthchecks complejos en todo”

Te está enseñando a pensar mejor **dónde realmente importa que una dependencia esté lista antes de seguir**.

---

## Qué no tenés que confundir

### `depends_on` corto no es inútil
Simplemente resuelve menos cosas que la forma larga.

### `service_healthy` no reemplaza toda la robustez interna de la app
La app puede seguir necesitando lógica de reintento o manejo de fallos temporales.

### Un healthcheck tiene que representar algo útil
No alcanza con cualquier comando que “parezca andar”.

### Que la base esté healthy no significa automáticamente que todo el sistema ya esté perfecto
Significa solo que esa dependencia concreta alcanzó una señal de salud definida.

---

## Error común 1: pensar que startup order y readiness son lo mismo

No lo son.

Y este tema justamente existe para que dejen de parecerte lo mismo.

---

## Error común 2: usar un healthcheck que no representa disponibilidad real

Por ejemplo, un check demasiado superficial que no te dice nada relevante para la app.

---

## Error común 3: no dar suficiente margen a servicios lentos de inicialización

Ahí `start_period` suele ser una pieza muy importante.

---

## Error común 4: querer poner `service_healthy` en todo sin pensar

Conviene usarlo donde realmente aporta valor y evita carreras de arranque reales.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Compará estas dos versiones.

#### Versión A

```yaml
services:
  app:
    build: .
    depends_on:
      - db

  db:
    image: postgres:18
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: mysecretpassword
```

#### Versión B

```yaml
services:
  app:
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

### Ejercicio 2
Respondé con tus palabras:

- qué resuelve la versión A
- qué problema sigue teniendo la versión A
- qué agrega la versión B
- por qué la versión B es más confiable

### Ejercicio 3
Respondé además:

- qué rol cumple `pg_isready`
- qué rol cumple `service_healthy`
- por qué `start_period` puede importar bastante

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué servicio depende críticamente de otro para arrancar bien
- qué chequeo te parecería más representativo de que esa dependencia ya está lista
- si usarías ese check en Dockerfile o en Compose
- qué carrera de arranque real te gustaría evitar con esta técnica

No hace falta escribir todo el stack final.
La idea es aplicar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre startup order y readiness?
- ¿qué servicio de tus proyectos más necesita una dependencia realmente lista?
- ¿qué tipo de healthcheck te parece más representativo y útil?
- ¿qué parte del arranque hoy probablemente estás asumiendo demasiado?
- ¿qué valor le ves a que Compose espere salud real y no solo “container up”?

Estas observaciones valen mucho más que memorizar una sintaxis.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si solo quiero orden básico de arranque, probablemente me alcanza con ________.  
> Si necesito que una dependencia esté realmente lista antes de arrancar otra, probablemente me conviene ________ junto con ________.

Y además respondé:

- ¿por qué esta práctica te parece más cercana a un stack real?
- ¿qué servicio tuyo te gustaría proteger primero con esta lógica?
- ¿qué parte del arranque te gustaría volver más explícita?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- comparar un stack con orden básico y otro con readiness más realista
- usar `healthcheck` y `service_healthy` en un caso concreto
- entender mejor qué señal de salud tiene sentido para una base de datos
- evitar varias carreras de arranque típicas
- pensar stacks bastante más confiables desde el archivo Compose

---

## Resumen del tema

- Un stack con `depends_on` corto puede ordenar arranque, pero no resolver readiness real.
- Un `healthcheck` útil para la base puede expresar cuándo PostgreSQL ya está aceptando conexiones.
- `condition: service_healthy` hace que la app espere una señal de salud concreta antes de arrancar.
- `start_period`, `interval`, `timeout` y `retries` ayudan a modelar mejor la salud del servicio.
- Esta práctica te muestra una forma mucho más robusta de arrancar app + db.
- El valor del tema no está en la sintaxis sola, sino en aprender a pensar dependencias listas de verdad.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en esta capa operativa con otro caso muy útil:

- jobs o tareas one-shot
- migraciones
- `service_completed_successfully`
- y cómo hacer que ciertos pasos ocurran y terminen bien antes de levantar el resto
