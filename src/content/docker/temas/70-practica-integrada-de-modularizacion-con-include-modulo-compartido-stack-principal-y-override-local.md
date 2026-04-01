---
title: "Práctica integrada de modularización con include: módulo compartido, stack principal y override local"
description: "Tema 70 del curso práctico de Docker: una práctica integrada donde usás include para incorporar módulos Compose completos, combinás un stack principal con archivos compartidos y entendés cómo ajustar el modelo final con overrides locales sin perder claridad."
order: 70
module: "Organización avanzada del stack Compose"
level: "intermedio"
draft: false
---

# Práctica integrada de modularización con include: módulo compartido, stack principal y override local

## Objetivo del tema

En este tema vas a:

- juntar en una sola práctica varias ideas del bloque de organización avanzada
- usar `include` para incorporar módulos Compose completos
- separar un stack principal de módulos compartidos
- entender cómo aplicar overrides locales al modelo resultante
- pensar mejor ownership, modularidad y claridad cuando el stack ya creció

La idea es bajar `include` a un caso concreto, para que no quede como una feature abstracta sino como una forma real de mantener un stack grande sin convertirlo en un archivo gigantesco.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. pensar una estructura con un stack principal y módulos separados
2. usar `include` para incorporar esos módulos
3. entender cómo el stack principal consume servicios incluidos
4. ver cómo aplicar un override local del modelo final
5. comparar esta estrategia con un archivo único o con puro `-f`
6. cerrar el bloque con una práctica bastante realista

---

## Idea central que tenés que llevarte

A esta altura del curso ya viste varias formas de ordenar Compose:

- un solo archivo simple
- overrides con `-f`
- `compose.override.yaml`
- `x-` extensions
- `extends`
- `include`

Este tema junta varias de esas ideas con una lógica muy concreta:

> un stack grande puede mantenerse mucho más claro si el archivo principal deja de definirlo todo y pasa a **consumir módulos Compose completos** mantenidos por separado.

---

## Escenario del tema

Vas a imaginar una plataforma simple con esta división:

- un módulo de datos
- un módulo de aplicación
- un stack principal que consume ambos
- un override local para adaptar el resultado al entorno del equipo que lo usa

Esto se parece bastante a un caso real donde distintos equipos o áreas mantienen partes diferentes del sistema.

---

## Estructura de la práctica

Podés pensar una estructura así:

```text
plataforma/
├── compose.yaml
├── compose.override.yaml
├── team-data/
│   └── compose.yaml
└── team-app/
    └── compose.yaml
```

---

## Paso 1: definir el módulo de datos

Archivo:

```text
team-data/compose.yaml
```

Contenido:

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
    restart: unless-stopped
```

---

## Cómo se lee este módulo

La lectura conceptual sería:

- el módulo de datos declara su propio servicio `db`
- encapsula su configuración
- expresa readiness y restart desde su propio dominio
- no necesita que el archivo principal copie toda esta lógica

Esto muestra una frontera bastante clara de responsabilidad.

---

## Paso 2: definir el módulo de aplicación

Archivo:

```text
team-app/compose.yaml
```

Contenido:

```yaml
services:
  api:
    image: miusuario/api:dev
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
```

---

## Cómo se lee este módulo

La lectura conceptual sería:

- el módulo de aplicación declara `api`
- `api` depende de `db`
- no necesita que `db` esté definido en el mismo archivo para expresar esa dependencia
- asume que el modelo final del proyecto incluirá ese servicio

Esto ya muestra una idea muy potente:
los módulos pueden mantenerse separados y aun así formar parte del mismo stack final.

---

## Paso 3: definir el stack principal

Archivo:

```text
compose.yaml
```

Contenido:

```yaml
include:
  - ./team-data/compose.yaml
  - ./team-app/compose.yaml

services:
  gateway:
    image: nginx
    depends_on:
      - api
```

---

## Cómo se lee el archivo principal

La lectura conceptual sería:

- el archivo principal no repite la definición de `db` ni de `api`
- incorpora ambos módulos con `include`
- declara además un servicio propio llamado `gateway`
- `gateway` puede depender de `api` como si estuviera definido localmente

Esto es justo el corazón práctico de `include`.

---

## Qué te enseña esta parte

Te enseña que el archivo principal puede pasar de:

- “ser el lugar donde vive todo el YAML”

a algo mucho más sano:

- “ser el archivo que ensambla módulos Compose mantenidos por separado”

Ese cambio de mentalidad importa muchísimo cuando el proyecto crece.

---

## Paso 4: agregar un override local

Ahora imaginá que el equipo que consume estos módulos quiere hacer pequeños ajustes locales.

Archivo:

```text
compose.override.yaml
```

Contenido:

```yaml
services:
  api:
    ports:
      - "3000:3000"

  gateway:
    ports:
      - "8080:80"
```

---

## Cómo se lee este override

La idea es:

- el módulo `team-app` sigue siendo reusable y limpio
- el equipo local no modifica el archivo del módulo
- el stack consumidor ajusta puertos o detalles propios de su entorno

Esto conversa muy bien con lo que documenta Docker sobre overrides sobre el modelo final resultante de `include`.

---

## Qué gana esta estructura

Gana varias cosas al mismo tiempo:

- separación clara entre dominios
- menos archivo gigante en la raíz
- ownership más nítido
- posibilidad de reutilizar módulos
- capacidad de aplicar ajustes locales sin tocar la fuente del módulo

Eso ya se parece bastante a un flujo serio de equipo.

---

## Qué papel cumple include en esta práctica

`include` resuelve la modularización del stack.

O sea:

- cómo juntar módulos completos
- cómo incorporarlos al modelo final
- cómo trabajar con servicios declarados en otros archivos como si fueran parte del mismo proyecto

Sin `include`, probablemente terminarías haciendo una de estas dos cosas:

- meter todo en un solo `compose.yaml`
- o depender de muchas combinaciones manuales con `-f`

---

## Qué papel cumple compose.override.yaml en esta práctica

El override local resuelve otra preocupación distinta:

- adaptar el modelo final a una necesidad concreta del entorno consumidor

Por ejemplo:

- exponer puertos
- añadir volúmenes locales
- ajustar flags de desarrollo
- tocar una configuración solo para este consumo

Esto muestra que `include` y override no compiten.
Pueden convivir muy bien.

---

## Qué diferencia hay con usar solo `-f`

Con puro `-f`, el equipo consumidor tendría que recordar más cosas en cada comando.

Por ejemplo, algo como:

```bash
docker compose -f compose.yaml -f team-data/compose.yaml -f team-app/compose.yaml up
```

Eso puede funcionar, pero a medida que el proyecto crece:

- se vuelve más cargoso
- el merge puede hacerse más difícil de razonar
- se pierde algo de la idea de “módulo Compose reutilizable”

En cambio, con `include` el archivo principal ya expresa esa composición estructural.

---

## Qué diferencia hay con `extends`

`extends` sigue siendo útil cuando querés reutilizar la configuración de un servicio concreto.

Pero en esta práctica no estás diciendo:

- “quiero heredar propiedades de un servicio fuente”

Estás diciendo algo más grande:

- “quiero incorporar módulos Compose completos al modelo final”

Por eso `include` encaja mejor.

---

## Qué pasa con los paths relativos

Una de las cosas más valiosas de `include` es que cada módulo puede mantener su propia lógica de paths.

Eso significa que un módulo incluido no tiene por qué romperse solo porque el archivo principal viva en otra carpeta.

Esta propiedad vuelve a `include` muy cómodo para separar subdominios de forma más independiente.

---

## Qué te enseña realmente esta práctica

Te enseña a pensar Compose así:

- módulo de datos
- módulo de aplicación
- stack principal ensamblador
- override local consumidor

Eso ya es una forma bastante madura de escalar desde:

- un proyecto chico
- a un proyecto con ownership repartido
- sin volverte loco con un YAML gigantesco

---

## Qué no tenés que confundir

### `include` no reemplaza a `compose.override.yaml`
Resuelven problemas distintos.

### Un módulo incluido no es solo “otro override”
Tiene una intención más estructural.

### Modularizar no significa fragmentar sin criterio
La separación sigue teniendo que responder a dominios o responsabilidades claras.

### El archivo principal no tiene que volver a copiar lo que ya vive en el módulo
Si copiás todo otra vez, perdés gran parte del beneficio.

---

## Error común 1: usar include para cosas que solo eran bloques pequeños repetidos

Ahí muchas veces alcanzaba con `x-` extensions o anchors.

---

## Error común 2: seguir metiendo todo en un solo archivo cuando el ownership ya está claramente dividido

Eso suele volver el stack más difícil de mantener.

---

## Error común 3: ajustar directamente el archivo del módulo para necesidades locales del consumidor

Muchas veces un override local es una solución más limpia.

---

## Error común 4: no distinguir entre un módulo reusable y un simple override temporal

Si no hacés esa distinción, la organización se vuelve menos clara.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Imaginá esta estructura:

```text
plataforma/
├── compose.yaml
├── compose.override.yaml
├── team-data/
│   └── compose.yaml
└── team-app/
    └── compose.yaml
```

### Ejercicio 2
Tomá estos tres archivos conceptuales.

#### `team-data/compose.yaml`

```yaml
services:
  db:
    image: postgres:18
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: mysecretpassword
```

#### `team-app/compose.yaml`

```yaml
services:
  api:
    image: miusuario/api:dev
    depends_on:
      - db
```

#### `compose.yaml`

```yaml
include:
  - ./team-data/compose.yaml
  - ./team-app/compose.yaml

services:
  gateway:
    image: nginx
    depends_on:
      - api
```

### Ejercicio 3
Respondé con tus palabras:

- qué aporta cada módulo
- qué aporta el archivo principal
- por qué este enfoque es más modular que meter todo junto
- por qué `gateway` puede depender de `api` como si fuera local

### Ejercicio 4
Ahora agregá mentalmente este override local:

```yaml
services:
  api:
    ports:
      - "3000:3000"

  gateway:
    ports:
      - "8080:80"
```

Y respondé:

- qué problema resuelve el override
- por qué no hace falta tocar el módulo original
- por qué esta combinación te parece útil en equipos reales

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué módulo podría separarse primero en otro Compose file
- cuál sería el archivo principal ensamblador
- si necesitarías un `compose.override.yaml` local
- qué ownership te gustaría dejar más claro
- qué parte de tu stack hoy está demasiado centralizada en un solo archivo

No hace falta escribir todavía el stack final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre módulo reusable y override local?
- ¿qué parte de tus proyectos se beneficiaría más de un `include`?
- ¿qué ventaja te parece más fuerte: claridad, ownership o reutilización?
- ¿en qué caso seguirías con un archivo único y en cuál ya modularizarías?
- ¿qué parte de tus stacks hoy está pidiendo una separación más sana?

Estas observaciones valen mucho más que memorizar sintaxis.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero ensamblar módulos Compose completos, probablemente me conviene ________.  
> Si quiero ajustar el modelo final para mi entorno local sin tocar el módulo original, probablemente me conviene ________.

Y además respondé:

- ¿por qué esta práctica te parece más cercana a un proyecto real de equipo?
- ¿qué módulo tuyo te gustaría separar primero?
- ¿qué ventaja le ves a que el archivo principal ya exprese la composición del stack?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- combinar `include` con un archivo principal ensamblador
- pensar módulos Compose mantenidos por separado
- usar overrides locales sin tocar los módulos base
- escalar mejor un stack que ya creció más allá de un solo archivo
- organizar Compose de una forma bastante más madura y mantenible

---

## Resumen del tema

- `include` permite incorporar módulos Compose completos dentro del modelo final del proyecto.
- Un archivo principal puede ensamblar esos módulos y además declarar servicios propios.
- Un `compose.override.yaml` local puede ajustar el modelo resultante sin tocar los módulos base.
- Esta combinación ayuda mucho cuando hay ownership separado o dominios distintos dentro del mismo stack.
- El valor del tema está en pasar de un YAML gigante a una composición más modular y mantenible.
- Esta práctica cierra el bloque de organización avanzada con un caso bastante realista.

---

## Próximo tema

En el próximo bloque vas a empezar a moverte hacia otra capa muy útil del trabajo real con Docker:

- imágenes oficiales vs imágenes propias
- criterios para elegir bases
- confianza, tamaño y mantenimiento
- y cómo tomar decisiones más profesionales al arrancar un servicio nuevo
