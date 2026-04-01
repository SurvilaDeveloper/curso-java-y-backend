---
title: "Variables de entorno en Compose: usá environment, env_file y .env sin mezclar conceptos"
description: "Tema 40 del curso práctico de Docker: cómo usar variables de entorno en Docker Compose con environment, env_file y .env, cómo funciona la interpolación y qué prioridad tienen los distintos orígenes de configuración."
order: 40
module: "Docker Compose como herramienta central"
level: "base"
draft: false
---

# Variables de entorno en Compose: usá environment, env_file y .env sin mezclar conceptos

## Objetivo del tema

En este tema vas a:

- entender cómo se manejan las variables de entorno en Compose
- distinguir `environment`, `env_file` y `.env`
- usar interpolación con `${VARIABLE}`
- entender mejor la prioridad entre distintas fuentes de valor
- empezar a separar configuración del archivo principal con más criterio

La idea es que dejes de tratar todas las variables “como si fueran lo mismo” y empieces a ver qué rol cumple cada mecanismo.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. distinguir las tres piezas clave: `environment`, `env_file` y `.env`
2. ver cómo se interpolan variables dentro de `compose.yaml`
3. entender cuándo una variable termina dentro del contenedor y cuándo solo ayuda a construir el archivo
4. revisar la precedencia entre fuentes
5. armar una regla práctica para no mezclar conceptos

---

## Idea central que tenés que llevarte

En Compose aparecen varias capas de variables, y no todas hacen exactamente lo mismo.

Dicho simple:

- `environment` define variables para el contenedor.
- `env_file` carga variables para el contenedor desde uno o más archivos.
- `.env` suele usarse para **interpolar** valores dentro del `compose.yaml` o para comportamiento de Compose, no como sinónimo automático de “variables dentro del contenedor”. citeturn128931search1turn128931search2turn128931search4turn128931search10

Si esta diferencia te queda clara, Compose se vuelve muchísimo más entendible.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker Compose distingue varios conceptos relacionados:

- `environment` y `env_file` son atributos del servicio para establecer variables de entorno del contenedor. citeturn128931search2turn128931search7
- la interpolación en `compose.yaml` usa sintaxis tipo `${VARIABLE}` y puede tomar valores del shell o de archivos `.env`. citeturn128931search1turn128931search3
- si no indicás `--env-file`, Compose busca un `.env` por defecto y puede usarlo para interpolación y configuración de Compose. citeturn128931search1turn128931search4
- cuando `environment` y `env_file` definen el mismo nombre, `environment` tiene prioridad. citeturn128931search0turn128931search7

---

## Primera pieza: environment

La forma más directa de definir variables para un servicio es `environment`.

Por ejemplo:

```yaml
services:
  db:
    image: postgres:18
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: mysecretpassword
```

Esto significa que esas variables se pasan al contenedor del servicio `db`.

La documentación oficial de Docker Compose muestra justamente `environment` como la forma explícita de establecer variables de entorno del servicio. citeturn128931search2turn128931search7

---

## Cuándo conviene environment

Suele convenir cuando:

- querés dejar explícita la configuración del servicio
- tenés pocas variables
- querés que el archivo sea claro de leer
- no te molesta declarar esos valores directamente en `compose.yaml`

Es una opción muy clara, pero no siempre la más cómoda si tenés muchas variables o si no querés tener valores duros en el archivo.

---

## Segunda pieza: env_file

`env_file` permite cargar variables de entorno desde un archivo.

Por ejemplo:

```yaml
services:
  db:
    image: postgres:18
    env_file:
      - ./db.env
```

Y un archivo `db.env` podría tener:

```env
POSTGRES_DB=appdb
POSTGRES_USER=postgres
POSTGRES_PASSWORD=mysecretpassword
```

La documentación oficial actual de Docker explica que `env_file` sirve para cargar variables desde uno o más archivos y que, si declarás varios, se evalúan en orden y los posteriores pueden sobrescribir a los anteriores. citeturn128931search2

---

## Cuándo conviene env_file

Suele convenir cuando:

- tenés muchas variables
- querés separar configuración del archivo principal
- querés tener archivos distintos por entorno
- querés que el `compose.yaml` quede más limpio

Esto ya te da una separación bastante útil entre estructura del stack y configuración del servicio.

---

## Tercera pieza: .env

Acá aparece una de las confusiones más comunes.

Un archivo `.env` en Compose suele usarse mucho para **interpolar** valores dentro del `compose.yaml`.

Por ejemplo, si tenés un `.env` así:

```env
TAG=v1.6
DEBUG=1
```

y un `compose.yaml` así:

```yaml
services:
  web:
    image: "mi-web:${TAG}"
    environment:
      DEBUG: "${DEBUG}"
```

Compose reemplaza `${TAG}` y `${DEBUG}` usando los valores disponibles. La documentación oficial lo explica justo con este tipo de ejemplos y aclara que `${VARIABLE}` es la sintaxis estándar de interpolación. citeturn128931search1turn128931search3

---

## Qué diferencia hay entre .env y env_file

Esto es clave.

### `.env`
Suele participar en la interpolación del `compose.yaml` y también puede influir en variables predefinidas de Compose. citeturn128931search1turn128931search4

### `env_file`
Declara variables que Compose pasa al contenedor del servicio. citeturn128931search2turn128931search7

Pueden convivir, pero no son exactamente lo mismo.

---

## Regla práctica muy útil

Podés pensar así:

- **quiero escribir menos valores duros dentro de `compose.yaml`** → probablemente `.env` para interpolación.
- **quiero cargar muchas variables dentro del contenedor** → probablemente `env_file`.
- **quiero declarar una variable clara y puntual directamente en el servicio** → probablemente `environment`.

Esta regla te ordena muchísimo.

---

## Interpolación con ${VARIABLE}

Docker documenta que Compose usa una sintaxis tipo Bash para interpolación y acepta tanto `$VARIABLE` como `${VARIABLE}`, aunque la forma con llaves suele ser la más clara. También admite formatos típicos como valores por defecto en expresiones con llaves. citeturn128931search3

Un ejemplo simple:

```yaml
services:
  web:
    image: "nginx:${TAG}"
```

Si `TAG=latest` está en tu `.env`, Compose resolverá eso antes de levantar el stack. citeturn128931search1turn128931search3

---

## Qué significa “resolver antes de levantar”

Significa que Compose lee el archivo, sustituye variables donde corresponde y luego trabaja con el resultado final.

Por eso conviene distinguir:

- valores usados para construir el archivo final
- valores que efectivamente terminarán dentro del contenedor

No siempre son la misma cosa.

---

## El .env por defecto y --env-file

La documentación oficial actual explica que, si no pasás `--env-file`, Compose busca un `.env` por defecto. También documenta que podés usar `docker compose --env-file ./ruta/algo.env up` para cambiar ese archivo y que incluso podés pasar varios `--env-file`, evaluados en orden. citeturn128931search1turn128931search4

Eso es muy útil para trabajar con entornos como:

- desarrollo
- testing
- staging
- producción

sin tocar tanto el archivo principal.

---

## Precedencia: cuál valor gana

Este es otro punto donde mucha gente se confunde.

Docker tiene una guía específica de precedencia para variables de entorno en Compose. Lo más útil para este nivel es quedarte con estas ideas:

- `docker compose run -e` puede sobrescribir valores al ejecutar tareas one-off. citeturn128931search0turn128931search2
- cuando `environment` y `env_file` definen la misma variable, `environment` tiene prioridad. citeturn128931search0turn128931search7
- los valores de shell o de `.env` por sí solos no “entran al contenedor” si no están referenciados por `environment` o `env_file`; muchas veces su papel es ayudar a interpolar o replicar valores. citeturn128931search0turn128931search1

---

## Ejemplo claro de prioridad

Supongamos esto:

Archivo `webapp.env`:

```env
NODE_ENV=test
```

Archivo `compose.yaml`:

```yaml
services:
  webapp:
    image: webapp
    env_file:
      - ./webapp.env
    environment:
      NODE_ENV: production
```

En este caso, la documentación oficial indica que el contenedor termina viendo `NODE_ENV=production`, porque `environment` tiene prioridad sobre `env_file`. citeturn128931search0turn128931search7

---

## Cuándo conviene no poner secretos directamente

Docker tiene una guía específica de secrets para Compose, separada del uso de variables de entorno. No hace falta profundizar todavía, pero sí conviene que te quede esta idea:

- para aprendizaje y configuración simple, `environment` y `env_file` alcanzan
- para datos realmente sensibles, más adelante conviene estudiar `secrets` en Compose citeturn128931search9

Esto te ayuda a no convertir variables en una solución universal para todo.

---

## Ejemplo de stack simple con .env + environment

Archivo `.env`:

```env
TAG=1.27
WEB_PORT=8080
```

Archivo `compose.yaml`:

```yaml
services:
  web:
    image: "nginx:${TAG}"
    ports:
      - "${WEB_PORT}:80"
```

### Cómo se lee

- `TAG` no está escrito duro en el archivo
- `WEB_PORT` tampoco
- Compose toma ambos valores y construye la configuración final

Esto hace el archivo más flexible. citeturn128931search1turn128931search3

---

## Ejemplo con env_file para el contenedor

Archivo `db.env`:

```env
POSTGRES_DB=appdb
POSTGRES_USER=postgres
POSTGRES_PASSWORD=mysecretpassword
```

Archivo `compose.yaml`:

```yaml
services:
  db:
    image: postgres:18
    env_file:
      - ./db.env
```

### Cómo se lee

- el archivo `db.env` no es solo “para interpolar”
- Compose usa ese archivo para cargar variables dentro del servicio `db` citeturn128931search2turn128931search7

---

## Qué no tenés que confundir

### `.env` no significa automáticamente “variables dentro del contenedor”
Muchas veces su rol principal es interpolar o configurar Compose. citeturn128931search1turn128931search4

### `env_file` no es lo mismo que el `.env` por defecto de Compose
Uno es atributo de servicio.
El otro suele ser un archivo que Compose carga para interpolación si no le indicás otro explícitamente. citeturn128931search1turn128931search2

### `environment` gana sobre `env_file`
Esto está documentado de forma explícita. citeturn128931search0turn128931search7

### Variables del shell tampoco hacen magia por sí solas
Su valor suele usarse cuando las referenciás desde `environment`, `env_file` o interpolación. citeturn128931search0turn128931search1

---

## Error común 1: pensar que cualquier `.env` se mete solo dentro del contenedor

No necesariamente.

Depende de cómo lo uses en Compose.

---

## Error común 2: mezclar `env_file` y `.env` como si fueran el mismo mecanismo

Se parecen en el nombre, pero no tienen exactamente el mismo rol.

---

## Error común 3: olvidar la prioridad de `environment`

Si definís el mismo nombre en ambos lugares, gana `environment`. citeturn128931search0turn128931search7

---

## Error común 4: llenar el compose.yaml de valores duros cuando ya te convendría interpolar o usar env_file

Esto no es “incorrecto” siempre, pero puede volver el archivo más rígido y menos reutilizable.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá una carpeta de práctica.

### Ejercicio 2
Creá un archivo `.env` con esto:

```env
TAG=1.27
WEB_PORT=8080
```

### Ejercicio 3
Creá un archivo `db.env` con esto:

```env
POSTGRES_DB=appdb
POSTGRES_USER=postgres
POSTGRES_PASSWORD=mysecretpassword
```

### Ejercicio 4
Creá un `compose.yaml` con este contenido:

```yaml
services:
  web:
    image: "nginx:${TAG}"
    ports:
      - "${WEB_PORT}:80"

  db:
    image: postgres:18
    env_file:
      - ./db.env
```

### Ejercicio 5
Respondé con tus palabras:

- qué valores vienen del `.env`
- qué valores vienen del `db.env`
- qué parte se usa para interpolar el archivo
- qué parte termina dentro del contenedor de `db`

### Ejercicio 6
Ahora agregá esto en `db`:

```yaml
environment:
  POSTGRES_DB: otra_db
```

Y respondé:

- cuál valor ganaría
- por qué
- qué te enseña eso sobre prioridad

---

## Segundo ejercicio de análisis

Tomá este ejemplo:

```yaml
services:
  app:
    image: "mi-app:${TAG}"
    environment:
      DEBUG: "${DEBUG}"
```

Y respondé:

- qué variable se usa para construir la referencia de imagen
- qué variable termina como entorno del contenedor
- por qué esas dos cosas se parecen, pero no son exactamente lo mismo
- qué archivo usarías si quisieras cargar 15 variables del contenedor sin ensuciar tanto el `compose.yaml`

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué diferencia se te hizo más clara entre `.env` y `env_file`?
- ¿qué parte de la precedencia te parece más importante recordar?
- ¿qué tipo de configuración preferís dejar explícita en `environment`?
- ¿qué tipo de configuración preferís mover a `env_file`?
- ¿cómo cambia tu lectura de un `compose.yaml` después de entender esto?

Estas observaciones valen mucho más que memorizar una tabla completa de precedencia.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero ________ dentro del contenedor, probablemente me sirve `environment`.  
> Si quiero cargar muchas variables del contenedor desde un archivo, probablemente me sirve ________.  
> Si quiero reutilizar valores dentro del `compose.yaml`, probablemente me sirve ________.

Y además respondé:

- ¿por qué `.env` no debe confundirse automáticamente con `env_file`?
- ¿por qué `environment` tiene tanta fuerza en la prioridad?
- ¿qué parte de este tema te parece más útil para mantener el archivo Compose ordenado?
- ¿qué proyecto tuyo se beneficiaría mucho de separar mejor estas capas?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- distinguir `environment`, `env_file` y `.env`
- usar interpolación con `${VARIABLE}`
- entender la prioridad básica entre fuentes de variables
- leer con más criterio la configuración de un servicio Compose
- separar mejor estructura del stack y configuración de entorno

---

## Resumen del tema

- `environment` y `env_file` son mecanismos para definir variables de entorno del contenedor. citeturn128931search2turn128931search7
- `.env` suele participar en interpolación y en el comportamiento de Compose, no es automáticamente sinónimo de “variables dentro del contenedor”. citeturn128931search1turn128931search4
- Compose usa sintaxis como `${VARIABLE}` para interpolar valores dentro del archivo. citeturn128931search3turn128931search1
- Cuando `environment` y `env_file` definen el mismo nombre, gana `environment`. citeturn128931search0turn128931search7
- Entender estas capas te ayuda muchísimo a escribir archivos Compose más claros y menos rígidos.

---

## Próximo tema

En el próximo tema vas a seguir profundizando en configuración, pero ya desde una práctica más integrada:

- Compose con varios servicios
- variables compartidas y por servicio
- orden de lectura mental del archivo
- cómo evitar stacks confusos a medida que crecen
