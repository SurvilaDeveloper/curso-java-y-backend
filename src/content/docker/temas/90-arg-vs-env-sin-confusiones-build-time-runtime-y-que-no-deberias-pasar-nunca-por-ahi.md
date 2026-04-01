---
title: "ARG vs ENV sin confusiones: build-time, runtime y qué no deberías pasar nunca por ahí"
description: "Tema 90 del curso práctico de Docker: cómo distinguir ARG y ENV en Dockerfiles, qué vive solo durante el build, qué persiste en la imagen y en el runtime, cómo funciona el scope en multi-stage builds y por qué ni ARG ni ENV son adecuados para secretos."
order: 90
module: "Variables, ARG y ENV sin mezclar conceptos"
level: "intermedio"
draft: false
---

# ARG vs ENV sin confusiones: build-time, runtime y qué no deberías pasar nunca por ahí

## Objetivo del tema

En este tema vas a:

- distinguir claramente `ARG` y `ENV`
- entender qué vive solo en build y qué persiste en runtime
- ver cómo funciona el scope de `ARG` en multi-stage builds
- evitar mezclar configuración de build con configuración del contenedor en ejecución
- entender por qué ni `ARG` ni `ENV` son una buena idea para secretos

La idea es que dejes de usar `ARG` y `ENV` “más o menos intuitivamente” y empieces a pensar con mucha más precisión qué tipo de variable corresponde a cada etapa.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender qué problema resuelve `ARG`
2. entender qué problema resuelve `ENV`
3. comparar build-time vs runtime
4. entender cómo cambia el scope en multi-stage
5. ver qué cosas no deberías pasar ni por `ARG` ni por `ENV`
6. construir una regla práctica para elegir bien entre ambos

---

## Idea central que tenés que llevarte

`ARG` y `ENV` se parecen lo suficiente como para confundir mucho al principio.

Ambos pueden aparecer en un Dockerfile.
Ambos pueden participar del build.
Ambos pueden parametrizar cosas.

Pero no resuelven el mismo problema.

La documentación oficial de Docker lo dice muy claro: build arguments (`ARG`) y environment variables (`ENV`) son similares, pero sirven a propósitos distintos. Los `ARG` no están presentes en los contenedores instanciados desde la imagen salvo que vos los transfieras explícitamente, mientras que `ENV` sí persiste en la configuración de la imagen y aparece en el runtime. Docker también advierte que ni `ARG` ni `ENV` son adecuados para secretos, porque pueden persistir en la imagen o en su metadata. citeturn116915search0turn116915search2turn116915search5

Dicho simple:

> `ARG` sirve para parametrizar el build.  
> `ENV` sirve para configurar el entorno de la imagen y del contenedor en runtime.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker deja varias ideas muy claras para este tema:

- `ARG` y `ENV` pueden parametrizar el build, pero tienen propósitos distintos. citeturn116915search0
- Los `ARG` no quedan accesibles en contenedores lanzados desde la imagen a menos que vos los pases explícitamente de otra manera; además, pueden persistir en metadata e image history. citeturn116915search0
- `ENV` persiste en la imagen y puede verse en contenedores creados a partir de ella. Docker incluso aclara que no se puede overridear directamente al build-time salvo combinándolo con `ARG`. citeturn116915search0turn116915search1
- `FROM` puede estar precedido solo por `ARG`, justamente porque `ARG` puede usarse para parametrizar la imagen base. citeturn116915search1
- En Compose, las variables del servicio en `environment`, `env_file` o `run --env` tienen precedencia sobre un `ENV` definido en el Dockerfile. citeturn116915search11
- Docker recomienda no usar ni `ARG` ni `ENV` para secretos; en su lugar, usar build secrets o mecanismos de secrets apropiados. citeturn116915search0turn116915search2turn116915search5

---

## Primer concepto: qué es `ARG`

`ARG` sirve para declarar una variable de build.

Por ejemplo:

```Dockerfile
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}
```

La referencia del Dockerfile documenta justamente que `ARG` puede aparecer antes de `FROM`, y que `FROM` puede usar esos argumentos. citeturn116915search1

---

## Cómo leer `ARG`

La lectura conceptual sería:

- esta variable existe para parametrizar el proceso de build
- puede cambiar cómo se construye la imagen
- puede influir en instrucciones del Dockerfile
- pero no pasa a ser automáticamente una variable de entorno visible en el contenedor final

Ese último punto es el corazón del tema.

---

## Un ejemplo típico de `ARG`

```Dockerfile
ARG APP_VERSION=1.0.0
FROM alpine
ARG APP_VERSION
RUN echo "Construyendo versión ${APP_VERSION}"
```

### Qué enseña este ejemplo
- `ARG` puede usarse durante el build
- el build puede cambiar según su valor
- eso no significa que el contenedor final vaya a tener `APP_VERSION` como variable de entorno

Si querés que el runtime la vea, tenés que hacer algo más explícito.

---

## Segundo concepto: qué es `ENV`

`ENV` define variables de entorno que quedan en la imagen y en los contenedores lanzados desde ella.

Por ejemplo:

```Dockerfile
ENV NODE_ENV=production
```

Docker lo documenta como una instrucción que configura el entorno para instrucciones posteriores y que persiste en la imagen resultante. citeturn116915search0turn116915search1

---

## Cómo leer `ENV`

La lectura conceptual sería:

- esta variable forma parte del entorno del contenedor
- existe no solo durante el build, sino también en runtime
- otros procesos del contenedor la pueden leer
- puede afectar cómo corre la aplicación cuando arranca

Eso hace que `ENV` sea el lugar natural para cosas de runtime, no de build puntual.

---

## Un ejemplo típico de `ENV`

```Dockerfile
FROM node:22
ENV NODE_ENV=production
WORKDIR /app
COPY . .
CMD ["node", "server.js"]
```

### Qué enseña este ejemplo
- `NODE_ENV=production` queda como variable de entorno del contenedor
- la app puede leerla en runtime
- esto ya no es solo un detalle de build

Esta es la diferencia central respecto a `ARG`.

---

## Tercer concepto: build-time vs runtime

Podés pensarlo así:

### Build-time
cosas que necesitás mientras se construye la imagen.

### Runtime
cosas que necesitás cuando el contenedor ya está corriendo.

Entonces:

- si solo necesitás parametrizar el build, pensá primero en `ARG`
- si necesitás una variable disponible en el contenedor en ejecución, pensá primero en `ENV`

Esa regla sola aclara muchísimo.

---

## Un ejemplo comparado

### Opción A
```Dockerfile
ARG APP_PORT=3000
```

### Opción B
```Dockerfile
ENV APP_PORT=3000
```

### Lectura correcta
- con `ARG`, la variable sirve durante el build
- con `ENV`, el contenedor final puede usar `APP_PORT`

Entonces, si tu app necesita leer `APP_PORT` al arrancar, `ENV` tiene más sentido.
Si solo querés, por ejemplo, seleccionar una base o un comportamiento de build, `ARG` suele ser mejor.

---

## Cuarto concepto: `ARG` antes y después de `FROM`

La referencia de Dockerfile explica algo muy importante:

- `ARG` puede ir antes de `FROM`
- pero ese `ARG` global está fuera de cualquier etapa de build
- si querés usarlo dentro de una etapa después de `FROM`, tenés que consumirlo o redeclararlo allí citeturn116915search1

Este detalle es muy importante en multi-stage builds.

---

## Un ejemplo claro de scope

```Dockerfile
ARG NODE_VERSION=22
FROM node:${NODE_VERSION} AS build
ARG NODE_VERSION
RUN echo $NODE_VERSION
```

### Qué enseña
- el primer `ARG NODE_VERSION=22` sirve para parametrizar `FROM`
- dentro de la etapa `build`, lo redeclarás para poder usarlo ahí también

Si no lo redeclarás, no podés asumir que sigue disponible como si nada dentro de la etapa.

---

## Quinto concepto: `ARG` en multi-stage builds

La documentación de variables y de Dockerfile explica que los `ARG` tienen reglas de scope y de herencia entre etapas. Un argumento declarado en el scope global no se hereda automáticamente en una etapa si no lo consumís allí; una vez consumido dentro de una etapa, sí puede heredarse por etapas hijas basadas en esa etapa. citeturn116915search0turn116915search1

La enseñanza útil es:

> en multi-stage, no asumas que un `ARG` “está en todos lados”.  
> pensá en qué etapa lo necesitás realmente.

---

## Sexto concepto: `ENV` no se overridea igual que `ARG`

Docker explica que no podés overridear valores `ENV` directamente al build-time como sí hacés con `--build-arg`, pero sí podés combinar `ARG` y `ENV` para hacer una variable configurable desde el build y persistente en la imagen. citeturn116915search0turn116915search1

Por ejemplo:

```Dockerfile
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
```

### Cómo se lee
- `ARG` te deja parametrizar el valor en el build
- `ENV` lo deja persistente en la imagen final y en runtime

Este patrón es muy útil cuando querés un default razonable, pero también cierta configurabilidad.

---

## Un ejemplo bastante sano

```Dockerfile
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}

ARG APP_ENV=production
ENV APP_ENV=$APP_ENV

WORKDIR /app
COPY . .
CMD ["node", "server.js"]
```

### Qué gana esta versión
- la versión de Node es configurable en build
- `APP_ENV` queda disponible en runtime
- no estás mezclando dos propósitos distintos en una sola instrucción

---

## Séptimo concepto: Compose y precedencia de variables

Docker documenta la precedencia de variables de entorno en Compose y deja claro que valores definidos en:

- `docker compose run -e`
- `environment`
- `env_file`

tienen precedencia sobre `ENV` del Dockerfile. citeturn116915search11

Eso deja una idea muy útil:

> el `ENV` del Dockerfile puede dar defaults en la imagen,  
> pero el entorno del servicio en Compose puede sobreescribirlos.

Esto es muy importante para no tratar el Dockerfile como si fuera la última palabra absoluta de configuración de runtime.

---

## Octavo concepto: secretos no van ni en `ARG` ni en `ENV`

Docker lo advierte de forma explícita:

- `ARG` y `ENV` son inapropiados para secretos
- pueden persistir en la imagen final o en su metadata
- para eso hay que usar build secrets o mecanismos específicos de secrets citeturn116915search0turn116915search2turn116915search5

Este punto es importantísimo.

No importa si el secreto “solo era para build”.
Si lo pasás por `ARG` o `ENV`, ya entraste en un terreno que Docker desaconseja.

---

## Un caso típico donde muchos se equivocan

```Dockerfile
ARG NPM_TOKEN=mi-token
RUN npm config set //registry.npmjs.org/:_authToken=$NPM_TOKEN
```

Aunque la intención sea “solo lo uso en build”, Docker documenta que `ARG` puede persistir en metadata o image history. citeturn116915search0turn116915search5

La enseñanza útil es:
**si es secreto, pensalo como secreto desde el principio**.

---

## Un patrón mental muy útil

Podés hacerte estas preguntas:

### 1. ¿Esto solo importa mientras se construye la imagen?
Probablemente `ARG`.

### 2. ¿Esto tiene que existir cuando el contenedor arranque?
Probablemente `ENV`.

### 3. ¿Esto es secreto?
Ni `ARG` ni `ENV`.
Buscá un mecanismo de secrets.

Esta secuencia suele evitar la mayoría de las confusiones.

---

## Qué no tenés que confundir

### `ARG` no es lo mismo que variable de entorno del contenedor
Solo existe en build salvo que la transfieras de alguna forma. citeturn116915search0

### `ENV` no es solo “una comodidad del build”
Persiste en la imagen y en el runtime. citeturn116915search0turn116915search1

### Que algo se pueda pasar por `--build-arg` no significa que sea seguro
Docker desaconseja usar `ARG` o `ENV` para secretos. citeturn116915search2turn116915search5

### `ENV` del Dockerfile no siempre gana
Compose puede sobrescribirlo en runtime. citeturn116915search11

---

## Error común 1: usar `ARG` esperando leerlo dentro del contenedor en runtime

Eso suele fallar conceptualmente porque `ARG` no vive ahí por defecto. citeturn116915search0

---

## Error común 2: usar `ENV` para cosas que solo afectaban el build

Eso deja variables persistentes en la imagen sin necesidad.

---

## Error común 3: olvidar redeclarar `ARG` en etapas donde realmente lo necesitás

En multi-stage, el scope importa bastante. citeturn116915search0turn116915search1

---

## Error común 4: pasar secretos por `ARG` o `ENV`

Docker lo desaconseja explícitamente. citeturn116915search2turn116915search5

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Compará estas dos líneas:

```Dockerfile
ARG APP_ENV=production
ENV APP_ENV=production
```

Respondé con tus palabras:

- cuál existe solo para build
- cuál queda en runtime
- cuál elegirías si la app necesita leer `APP_ENV` al arrancar
- cuál elegirías si solo querés parametrizar el build

### Ejercicio 2
Mirá este ejemplo:

```Dockerfile
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}
ARG NODE_VERSION
RUN echo $NODE_VERSION
```

Respondé:

- por qué `ARG` puede ir antes de `FROM`
- por qué se redeclara después
- qué te enseña esto sobre el scope en multi-stage o en etapas del build

### Ejercicio 3
Ahora mirá este patrón:

```Dockerfile
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
```

Respondé:

- qué resuelve `ARG`
- qué resuelve `ENV`
- por qué esta combinación puede ser útil

### Ejercicio 4
Respondé además:

- por qué no conviene pasar secretos por `ARG`
- por qué no conviene pasarlos por `ENV`
- qué tipo de mecanismo deberías buscar en su lugar

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué valor hoy usás como variable de build y no debería quedar en runtime
- qué valor sí debería existir en runtime
- si hoy estás mezclando `ARG` y `ENV` sin demasiado criterio
- si alguna variable del Dockerfile luego se sobreescribe desde Compose
- qué secreto o dato sensible nunca más te gustaría pasar por estas instrucciones

No hace falta escribir todavía el Dockerfile final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre build-time y runtime?
- ¿en qué proyecto tuyo hoy estás usando `ENV` para cosas que eran solo de build?
- ¿en qué caso te convendría más `ARG`?
- ¿qué parte del scope de multi-stage te parece más fácil de olvidar?
- ¿qué mejora concreta te gustaría notar después de ordenar mejor esta parte?

Estas observaciones valen mucho más que memorizar una receta de variables.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si una variable solo sirve para parametrizar el build, probablemente me conviene usar ________.  
> Si una variable tiene que quedar disponible en el contenedor final, probablemente me conviene usar ________.  
> Si quiero parametrizar el build y además dejar el valor persistente en runtime, probablemente me conviene combinar ________ con ________.  
> Si el valor es secreto, probablemente no debería usar ni ________ ni ________.

Y además respondé:

- ¿por qué este tema impacta tanto en claridad, seguridad y mantenimiento?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no mezclar build-time con runtime ni meter secretos donde no corresponde?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- distinguir mejor `ARG` y `ENV`
- entender qué vive solo en build y qué persiste en runtime
- manejar mejor el scope de `ARG` en etapas y multi-stage builds
- combinar `ARG` y `ENV` cuando el caso lo justifique
- evitar usar cualquiera de los dos para secretos
- escribir Dockerfiles con variables bastante más claras y menos confusas

---

## Resumen del tema

- `ARG` y `ENV` pueden parametrizar el build, pero sirven a propósitos distintos. citeturn116915search0
- Los `ARG` no están presentes por defecto en contenedores creados desde la imagen, mientras que `ENV` persiste en la imagen y en runtime. citeturn116915search0turn116915search1
- `ARG` puede ir antes de `FROM` y usarse para parametrizar la imagen base. citeturn116915search1
- En Compose, `environment`, `env_file` y `run --env` tienen precedencia sobre `ENV` del Dockerfile. citeturn116915search11
- Docker desaconseja usar `ARG` o `ENV` para secretos y recomienda build secrets o mecanismos apropiados. citeturn116915search2turn116915search5
- Este tema te deja una base muy sólida para pensar variables sin mezclar build-time, runtime y datos sensibles.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque con una práctica integrada:

- `ARG`
- `ENV`
- build-time vs runtime
- Compose sobrescribiendo runtime
- y una configuración mucho más clara de punta a punta
