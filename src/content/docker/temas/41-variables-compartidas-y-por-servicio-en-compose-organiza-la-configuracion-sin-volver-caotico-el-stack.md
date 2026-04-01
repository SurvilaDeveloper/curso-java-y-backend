---
title: "Variables compartidas y por servicio en Compose: organizá la configuración sin volver caótico el stack"
description: "Tema 41 del curso práctico de Docker: cómo organizar variables compartidas y variables específicas por servicio en Docker Compose, usando .env, environment y env_file con una lógica clara para que el stack siga siendo legible a medida que crece."
order: 41
module: "Docker Compose como herramienta central"
level: "base"
draft: false
---

# Variables compartidas y por servicio en Compose: organizá la configuración sin volver caótico el stack

## Objetivo del tema

En este tema vas a:

- organizar mejor variables compartidas y variables por servicio
- leer un `compose.yaml` con más criterio cuando empieza a crecer
- evitar stacks donde toda la configuración termina mezclada
- usar `.env`, `environment` y `env_file` con una lógica más ordenada
- construir una forma mental simple para mantener el archivo claro

La idea es que, a medida que tu stack crece, no conviertas el `compose.yaml` en una bolsa de variables sin criterio.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. distinguir variables compartidas de variables propias de cada servicio
2. decidir qué conviene interpolar desde `.env`
3. decidir qué conviene dejar en `environment`
4. decidir cuándo usar `env_file`
5. leer un ejemplo más grande sin perderte
6. construir una regla práctica para stacks que ya tienen varios servicios

---

## Idea central que tenés que llevarte

A medida que un stack crece, empiezan a convivir varios tipos de configuración:

- valores repetidos entre varios servicios
- valores exclusivos de un servicio
- configuraciones que querés cambiar según el entorno
- datos que querés separar del archivo principal

Si no ordenás eso, el `compose.yaml` se vuelve mucho más difícil de leer.

Dicho simple:

> un stack Compose claro separa bien  
> qué valores son compartidos,  
> qué valores son propios de cada servicio,  
> y qué conviene sacar del archivo principal.

---

## Qué problema resuelve este tema

Después de entender `environment`, `env_file` y `.env`, suele aparecer una pregunta muy práctica:

> “Está bien, pero en un stack real… ¿cómo ordeno todo esto sin volverlo un caos?”

Esa es exactamente la pregunta de este tema.

Porque no alcanza con saber “qué existe”.
También necesitás decidir **dónde conviene poner cada cosa**.

---

## Recordatorio rápido del tema anterior

Ya viste estas ideas:

- `environment` define variables del contenedor
- `env_file` carga variables del contenedor desde archivos
- `.env` suele participar en interpolación del `compose.yaml`
- `environment` tiene prioridad sobre `env_file` si coinciden

Ahora toca pasar de la teoría a una forma de organización más realista.

---

## Primera gran distinción: variables compartidas

Llamemos variables compartidas a las que reutilizás en más de un lugar del stack o que cambian por entorno, pero no pertenecen solo a un servicio aislado.

Por ejemplo:

- tags de imágenes
- puertos del host
- nombres de proyecto
- flags generales de entorno
- nombres de base o credenciales repetidas en varios servicios

Estas variables suelen ser buenas candidatas para interpolación con `.env`.

---

## Segunda gran distinción: variables por servicio

Son variables que pertenecen a un solo servicio o que tienen sentido solo dentro de ese contenedor.

Por ejemplo:

- `POSTGRES_PASSWORD` para `db`
- `REDIS_PASSWORD` si existiera solo para cache
- un flag puntual de una API
- un modo de debug exclusivo de un worker

Estas suelen ser candidatas naturales para:

- `environment`, si son pocas y querés que el archivo quede explícito
- `env_file`, si son muchas o querés separarlas del YAML principal

---

## Regla práctica simple

Una regla mental bastante útil puede ser esta:

### Usá `.env` cuando...
querés interpolar valores repetidos o variables generales del stack.

### Usá `environment` cuando...
querés dejar visible y explícita la configuración de un servicio.

### Usá `env_file` cuando...
querés sacar muchas variables del archivo principal o separar mejor la configuración de un servicio.

Esta regla no es perfecta para todos los casos, pero para empezar ordena muchísimo.

---

## Qué dice la documentación oficial

Docker Compose documenta que la interpolación usa sintaxis `${VARIABLE}` y puede tomar valores desde el shell o desde archivos `.env`. También explica que `environment` y `env_file` sirven para establecer variables de entorno del contenedor, y que si ambos definen el mismo nombre, `environment` tiene prioridad. Además, Docker remarca que `env_file` puede usar varios archivos en orden y que `.env` se usa por defecto para interpolación cuando no indicás otro con `--env-file`. citeturn845454search1turn845454search3turn845454search2turn845454search0turn845454search4

---

## Un ejemplo de stack más realista

Imaginá este proyecto:

- `web`
- `api`
- `db`

Ahora vamos a repartir la configuración con más criterio.

### Archivo `.env`

```env
TAG=1.27
WEB_PORT=8080
API_PORT=3000
APP_ENV=development
POSTGRES_DB=appdb
POSTGRES_USER=postgres
```

### Archivo `db.env`

```env
POSTGRES_PASSWORD=mysecretpassword
```

### Archivo `api.env`

```env
JWT_SECRET=supersecreto
LOG_LEVEL=debug
```

### Archivo `compose.yaml`

```yaml
services:
  web:
    image: "nginx:${TAG}"
    ports:
      - "${WEB_PORT}:80"

  api:
    build: ./api
    ports:
      - "${API_PORT}:3000"
    environment:
      APP_ENV: "${APP_ENV}"
      DB_HOST: db
      DB_NAME: "${POSTGRES_DB}"
      DB_USER: "${POSTGRES_USER}"
    env_file:
      - ./api.env
    depends_on:
      - db

  db:
    image: postgres:18
    environment:
      POSTGRES_DB: "${POSTGRES_DB}"
      POSTGRES_USER: "${POSTGRES_USER}"
    env_file:
      - ./db.env
    volumes:
      - postgres_data:/var/lib/postgresql

volumes:
  postgres_data:
```

---

## Cómo se lee este stack

La lectura conceptual sería esta:

- `.env` guarda valores compartidos o reutilizados en varios puntos del archivo
- `api.env` guarda variables específicas del servicio `api`
- `db.env` guarda variables específicas del servicio `db`
- `compose.yaml` queda más limpio y más declarativo
- los servicios siguen teniendo explícito lo más importante de su configuración

Esto ya es bastante más parecido a un stack real razonable.

---

## Qué cosas pusimos en .env y por qué

En `.env` pusimos valores como:

- `TAG`
- `WEB_PORT`
- `API_PORT`
- `APP_ENV`
- `POSTGRES_DB`
- `POSTGRES_USER`

¿Por qué?

Porque son valores que:

- se reutilizan
- son cómodos de interpolar
- ayudan a no escribir tanto valor duro en el archivo
- pueden cambiar por entorno

Esto hace el archivo más flexible.

---

## Qué cosas pusimos en env_file y por qué

En `api.env` y `db.env` pusimos variables específicas del servicio.

Por ejemplo:

- `JWT_SECRET`
- `LOG_LEVEL`
- `POSTGRES_PASSWORD`

¿Por qué?

Porque son variables que:

- pertenecen a un servicio concreto
- no hacen falta visualmente en el corazón del `compose.yaml`
- pueden crecer en cantidad
- conviene separar del archivo principal

Esto ayuda a que el YAML no se convierta en una pared de texto.

---

## Qué cosas dejamos en environment y por qué

Dentro de `environment` dejamos valores como:

- `APP_ENV`
- `DB_HOST`
- `DB_NAME`
- `DB_USER`
- `POSTGRES_DB`
- `POSTGRES_USER`

¿Por qué?

Porque son variables muy importantes para entender cómo se conecta el stack.

Si las escondieras todas en archivos externos, el `compose.yaml` perdería mucha legibilidad.

Esto muestra una idea muy útil:

> no se trata de sacar todo del archivo,  
> sino de sacar lo que conviene sacar  
> y dejar visible lo que ayuda a entender el stack.

---

## Un criterio muy útil: legibilidad primero

Una buena pregunta para hacerte es esta:

> “Si otra persona abre este `compose.yaml`, ¿entiende rápido cómo se conectan los servicios?”

Si la respuesta es no, probablemente escondiste demasiado en archivos externos.

Por ejemplo, cosas como:

- `DB_HOST: db`
- `DB_NAME: "${POSTGRES_DB}"`
- `APP_ENV: "${APP_ENV}"`

suelen valer la pena visibles en el archivo, porque explican mucho.

---

## Otro criterio útil: no repetir innecesariamente

Si un mismo valor aparece en muchos lugares, probablemente te conviene interpolarlo.

Por ejemplo:

```yaml
POSTGRES_DB: "${POSTGRES_DB}"
DB_NAME: "${POSTGRES_DB}"
```

Acá no estás repitiendo el valor duro.
Estás usando una sola fuente de verdad.

Esto hace más fácil cambiar entornos o nombres sin tener que tocar muchas líneas.

---

## Qué pasa si mezclás todo sin criterio

Pueden pasar cosas como estas:

- el `.env` termina teniendo variables que nadie entiende
- `compose.yaml` queda lleno de valores duros repetidos
- cada servicio tiene variables escondidas en lugares distintos sin lógica clara
- cuesta leer qué depende de qué
- cuesta cambiar una configuración sin miedo

El problema no es solo técnico.
También es de mantenimiento y comprensión.

---

## Una regla muy buena para no perderte

Podés intentar leer un stack en este orden:

### 1. servicios
¿Qué componentes existen?

### 2. puertos
¿Qué servicios son públicos?

### 3. environment visible
¿Qué relaciones o configuraciones importantes conviene entender rápido?

### 4. env_file
¿Qué configuración más “interna” se delegó a archivos por servicio?

### 5. .env
¿Qué valores compartidos o de entorno se están interpolando?

Esta secuencia te ayuda muchísimo a leer stacks medianos sin ahogarte.

---

## Qué no tenés que confundir

### `.env` no tiene por qué contener todo
No es “el archivo donde va todo”.

### `env_file` no vuelve automáticamente más claro el stack
Si sacás demasiadas cosas del YAML, puede quedar menos entendible.

### `environment` no siempre implica “poner valores duros”
También puede usar interpolación con `${VARIABLE}`.

### Compartido no significa “global por magia”
Una variable compartida sigue necesitando una fuente clara y una forma clara de ser usada.

---

## Error común 1: meter todas las variables en .env

Eso puede volver el proyecto menos legible si el archivo principal ya no muestra casi nada importante del stack.

---

## Error común 2: dejar todas las variables dentro de environment

Eso hace que el `compose.yaml` crezca demasiado y se vuelva difícil de escanear.

---

## Error común 3: usar env_file para esconder relaciones importantes del sistema

Si `api` depende de `db`, conviene que esa relación se entienda en el `compose.yaml`.

---

## Error común 4: repetir valores duros por todos lados

Si cambiás de entorno o necesitás renombrar algo, esa repetición se vuelve molesta y propensa a errores.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá estos tres archivos:

#### `.env`

```env
TAG=1.27
WEB_PORT=8080
API_PORT=3000
APP_ENV=development
POSTGRES_DB=appdb
POSTGRES_USER=postgres
```

#### `api.env`

```env
JWT_SECRET=supersecreto
LOG_LEVEL=debug
```

#### `db.env`

```env
POSTGRES_PASSWORD=mysecretpassword
```

### Ejercicio 2
Creá este `compose.yaml`:

```yaml
services:
  web:
    image: "nginx:${TAG}"
    ports:
      - "${WEB_PORT}:80"

  api:
    build: ./api
    ports:
      - "${API_PORT}:3000"
    environment:
      APP_ENV: "${APP_ENV}"
      DB_HOST: db
      DB_NAME: "${POSTGRES_DB}"
      DB_USER: "${POSTGRES_USER}"
    env_file:
      - ./api.env
    depends_on:
      - db

  db:
    image: postgres:18
    environment:
      POSTGRES_DB: "${POSTGRES_DB}"
      POSTGRES_USER: "${POSTGRES_USER}"
    env_file:
      - ./db.env
    volumes:
      - postgres_data:/var/lib/postgresql

volumes:
  postgres_data:
```

### Ejercicio 3
Respondé con tus palabras:

- qué valores vienen de `.env`
- qué valores vienen de `api.env`
- qué valores vienen de `db.env`
- qué parte del archivo explica claramente cómo se conecta `api` con `db`
- por qué no convendría esconder toda esa relación fuera del `compose.yaml`

### Ejercicio 4
Mové una variable de un lugar a otro de forma mental y preguntate:

- ¿queda más claro?
- ¿queda más prolijo?
- ¿sigue siendo fácil entender el stack?

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué variables son compartidas por varios servicios
- cuáles pertenecen solo al backend
- cuáles pertenecen solo a la base
- cuáles te gustaría interpolar desde `.env`
- cuáles te gustaría separar en `env_file`
- cuáles conviene dejar visibles en `environment` porque ayudan a entender la arquitectura

No hace falta escribir todavía el archivo final.
La idea es ordenar el criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tipo de variable te parece mejor candidata para `.env`?
- ¿qué tipo de variable preferís sacar del YAML con `env_file`?
- ¿qué variables conviene que sigan visibles para que el stack sea entendible?
- ¿qué parte del archivo se vuelve más clara con esta organización?
- ¿qué parte de tus stacks suele volverse más caótica y te gustaría ordenar mejor a partir de ahora?

Estas observaciones valen mucho más que copiar una receta.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si una variable se reutiliza y me ayuda a parametrizar el stack, probablemente me conviene ________.  
> Si una variable pertenece a un servicio concreto y no necesito verla todo el tiempo en el YAML, probablemente me conviene ________.  
> Si una variable me ayuda a entender cómo se conectan los servicios, probablemente me conviene dejarla visible en ________.

Y además respondé:

- ¿por qué este enfoque hace más mantenible el stack?
- ¿qué error evita respecto a “meter todo en todos lados”?
- ¿qué servicio de tus proyectos te gustaría ordenar primero con esta lógica?
- ¿qué te gustaría seguir refinando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- distinguir variables compartidas y variables por servicio
- organizar mejor `.env`, `environment` y `env_file`
- leer un `compose.yaml` más grande sin perderte
- mantener visibles las relaciones importantes del stack
- evitar que la configuración se vuelva caótica a medida que el proyecto crece

---

## Resumen del tema

- Un stack Compose más grande necesita una lógica clara para ordenar variables.
- `.env` es muy útil para interpolación y valores compartidos del stack. citeturn845454search1turn845454search4
- `env_file` es muy útil para agrupar variables del contenedor por servicio. citeturn845454search3turn845454search2
- `environment` sigue siendo muy valioso para dejar visibles las relaciones y configuraciones importantes. citeturn845454search2
- Cuando `environment` y `env_file` definen el mismo nombre, gana `environment`. citeturn845454search0turn845454search2
- Este tema te ayuda a escribir archivos Compose más claros y más mantenibles.

---

## Próximo tema

En el próximo tema vas a dar un paso más hacia stacks más profesionales:

- varios archivos Compose
- overrides por entorno
- cómo cambiar comportamiento sin duplicar todo
- empezar a pensar desarrollo y producción con más orden
