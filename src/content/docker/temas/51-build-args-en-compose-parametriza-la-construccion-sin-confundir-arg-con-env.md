---
title: "Build args en Compose: parametrizá la construcción sin confundir ARG con ENV"
description: "Tema 51 del curso práctico de Docker: cómo usar build.args en Docker Compose, qué diferencia hay entre ARG y ENV, cómo pasar parámetros al build desde compose.yaml y por qué no conviene usar build args para secretos."
order: 51
module: "Imágenes propias y flujos más cercanos a despliegue"
level: "intermedio"
draft: false
---

# Build args en Compose: parametrizá la construcción sin confundir ARG con ENV

## Objetivo del tema

En este tema vas a:

- entender qué son los build args en Docker y Compose
- usar `build.args` dentro de `compose.yaml`
- distinguir claramente `ARG` y `ENV`
- parametrizar imágenes sin volver confuso el stack
- entender por qué los build args no son una buena forma de manejar secretos

La idea es que empieces a hacer builds más flexibles, pero sin mezclar el momento de construcción con el momento de ejecución.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. recordar qué papel cumple `ARG` en un Dockerfile
2. ver cómo Compose pasa valores con `build.args`
3. distinguir build-time y run-time
4. comparar `ARG` con `ENV`
5. construir una regla práctica para saber cuándo usar cada cosa

---

## Idea central que tenés que llevarte

Un servicio puede necesitar parámetros en dos momentos distintos:

- mientras se construye la imagen
- cuando ya corre el contenedor

Eso no es lo mismo.

Dicho simple:

> `ARG` sirve para parametrizar el build  
> `ENV` sirve para configurar el entorno del contenedor  
> y mezclar ambos conceptos te trae confusión bastante rápido.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker explica que los build arguments (`ARG`) y las environment variables (`ENV`) sirven para pasar información al proceso de build, pero cumplen roles distintos. También aclara que los build args no están disponibles en contenedores creados desde la imagen salvo que el Dockerfile los copie explícitamente hacia la imagen, y que pueden persistir en metadatos o historial, por lo que no son adecuados para secretos. Docker Compose, por su parte, documenta que `build` puede declararse de forma detallada y que incluye la clave `args` para establecer build arguments. citeturn398927search1turn398927search0turn398927search7turn398927search15

---

## Primer recordatorio: qué es ARG en un Dockerfile

`ARG` es una variable de build.

Se declara en el Dockerfile y su valor se usa durante la construcción de la imagen.

Por ejemplo:

```Dockerfile
ARG APP_VERSION=dev
FROM nginx:latest
RUN echo "Versión: ${APP_VERSION}" > /tmp/version.txt
```

La idea útil es esta:

- `APP_VERSION` existe mientras se ejecuta el build
- el Dockerfile puede usarla en instrucciones donde corresponda
- no tenés que asumir que va a existir automáticamente dentro del contenedor final

---

## Qué diferencia hay con ENV

`ENV` apunta al entorno de la imagen o del contenedor.

Por ejemplo:

```Dockerfile
ENV APP_ENV=production
```

Eso sí puede terminar formando parte del entorno visible del contenedor en ejecución.

La documentación oficial actual remarca esta diferencia: `ARG` parametriza el build y no está disponible en contenedores a menos que lo transfieras explícitamente, mientras que `ENV` sí forma parte del entorno del contenedor o la imagen. citeturn398927search1turn398927search18

---

## Qué problema resuelve build.args en Compose

Hasta ahora ya viste que un servicio puede construirse con:

```yaml
services:
  app:
    build: .
```

Pero a veces querés que ese build cambie según el entorno o la intención.

Por ejemplo:

- elegir una versión base
- pasar una etiqueta de app
- activar una variante del build
- parametrizar alguna decisión del Dockerfile

Ahí aparece `build.args`.

---

## Sintaxis básica de build.args

La forma típica es esta:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        APP_VERSION: "1.0.0"
```

Esto significa:

- el servicio `app` se construye desde el contexto indicado
- Compose pasa `APP_VERSION=1.0.0` como build arg al Dockerfile

La Compose Build Specification documenta `args` como parte de la definición detallada de `build`. citeturn398927search0

---

## Ejemplo simple completo

Imaginá esta estructura:

```text
mi-app/
├── compose.yaml
└── Dockerfile
```

### Dockerfile

```Dockerfile
ARG APP_VERSION=dev
FROM nginx:latest
RUN echo "Versión del build: ${APP_VERSION}" > /usr/share/nginx/html/version.txt
```

### compose.yaml

```yaml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        APP_VERSION: "1.0.0"
    ports:
      - "8080:80"
```

---

## Cómo se lee este ejemplo

La lectura conceptual sería:

- el Dockerfile define un `ARG` llamado `APP_VERSION`
- el archivo Compose le pasa el valor `1.0.0`
- durante el build, ese valor se usa para generar `version.txt`
- después la imagen queda construida con ese resultado

Esto te muestra muy bien una idea importante:

- el valor influye en cómo se construyó la imagen
- no significa automáticamente que ese valor exista luego como variable del contenedor

---

## Cuándo conviene ARG

Suele convenir cuando necesitás parametrizar decisiones del build.

Por ejemplo:

- una versión
- una variante del build
- una imagen base parametrizable
- una etiqueta interna generada durante la construcción

La documentación del Dockerfile recuerda además que `ARG` puede usarse incluso antes de `FROM`, lo que permite parametrizar la referencia base de la imagen. citeturn398927search3turn398927search13

---

## Ejemplo con ARG en FROM

Un patrón típico sería algo así:

```Dockerfile
ARG NGINX_TAG=latest
FROM nginx:${NGINX_TAG}
```

Y en Compose:

```yaml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NGINX_TAG: "1.27"
```

Docker documenta que `FROM` puede ir precedido por `ARG`, y también tiene una verificación específica que recomienda que un `ARG` usado en `FROM` tenga un valor por defecto válido. citeturn398927search3turn398927search13

---

## Qué pasa si querés que el valor exista en tiempo de ejecución

Ahí ya no alcanza con `ARG`.

Si querés que el contenedor vea la variable cuando está corriendo, normalmente te conviene `environment` o `ENV`, según el caso.

Por ejemplo, en Compose:

```yaml
services:
  app:
    environment:
      APP_ENV: production
```

Esto ya cae del lado del entorno del contenedor, no del build.

---

## Un criterio muy útil

Podés pensar así:

### ¿Esto afecta cómo se construye la imagen?
Entonces probablemente `ARG` / `build.args`.

### ¿Esto afecta cómo se comporta el contenedor cuando ya corre?
Entonces probablemente `ENV` o `environment`.

Esta regla simple evita muchísimos errores de diseño.

---

## Qué no tenés que hacer con ARG

No conviene usar build args para secretos.

La documentación oficial actual lo dice de forma bastante directa: build args y environment variables son inapropiados para secretos porque pueden persistir en metadatos o en la imagen final. Docker recomienda usar secret mounts o SSH mounts para exponer secretos al build de forma segura. citeturn398927search1turn398927search7turn398927search15

Esto es una idea muy importante para que no uses `ARG` como “atajo cómodo” con cosas sensibles.

---

## Qué pasa con valores sin declarar en el Dockerfile

Aunque Compose permita declarar `build.args`, el Dockerfile tiene que tener sentido respecto a esos argumentos.

Si el Dockerfile nunca usa ese `ARG`, el build arg no genera ningún efecto práctico.

La documentación oficial es clara: un build argument no tiene efecto si no se usa en una instrucción del Dockerfile. citeturn398927search1

---

## Qué relación tiene esto con docker compose build

Todo esto se aplica cuando corrés algo como:

```bash
docker compose build
```

La documentación oficial actual de `docker compose build` recuerda que si cambiaste el Dockerfile o el contenido del directorio de build, corresponde reconstruir. Y por extensión, si cambiaste un build arg relevante para el resultado del build, también tiene sentido volver a construir el servicio. citeturn398927search2

---

## Un ejemplo más realista

Mirá este servicio:

```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        APP_VERSION: "1.2.0"
        NODE_ENV: "production"
    image: miusuario/frontend:1.2.0
    ports:
      - "8080:80"
```

### Cómo se lee

- `frontend` se construye desde `./frontend`
- usa un Dockerfile explícito
- recibe dos build args
- la imagen resultante se etiqueta con un nombre y tag claros

Esto ya se parece bastante a un flujo real donde parametrizás el build sin perder legibilidad.

---

## Qué no tenés que confundir

### `build.args` no es lo mismo que `environment`
Uno va al build.
El otro al contenedor en ejecución.

### Declarar un arg en Compose no obliga al Dockerfile a usarlo
Si el Dockerfile no lo consume, no cambia nada.

### Un ARG no es un secreto
Docker recomienda no usarlo así. citeturn398927search1turn398927search15

### ARG y ENV pueden convivir, pero no cumplen el mismo rol
Tienen nombres parecidos, pero momentos de vida distintos.

---

## Error común 1: usar build.args para configurar el contenedor en runtime

Eso suele fallar conceptualmente porque el valor se pensó para el build, no para la ejecución.

---

## Error común 2: usar environment cuando en realidad querías parametrizar el Dockerfile

Si lo que cambia es la construcción de la imagen, conviene pensar en `ARG`.

---

## Error común 3: meter secretos en build args

La documentación oficial recomienda explícitamente no hacerlo. citeturn398927search1turn398927search15

---

## Error común 4: pasar args desde Compose y olvidar declararlos o usarlos en el Dockerfile

Sin declaración o sin uso real, ese valor no produce el efecto esperado.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá este `Dockerfile` mental o real:

```Dockerfile
ARG APP_VERSION=dev
FROM nginx:latest
RUN echo "Versión del build: ${APP_VERSION}" > /usr/share/nginx/html/version.txt
```

### Ejercicio 2
Creá este `compose.yaml`:

```yaml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        APP_VERSION: "1.0.0"
    ports:
      - "8080:80"
```

### Ejercicio 3
Respondé con tus palabras:

- qué valor le pasa Compose al Dockerfile
- en qué momento existe ese valor
- por qué eso no significa automáticamente que `APP_VERSION` esté disponible como variable del contenedor cuando ya corre

### Ejercicio 4
Ahora compará con esta idea:

```yaml
services:
  web:
    environment:
      APP_VERSION: "1.0.0"
```

Y respondé:

- qué problema resuelve `environment`
- qué problema resuelve `build.args`
- por qué parecen parecidos pero no son lo mismo

---

## Segundo ejercicio de análisis

Pensá en uno de tus servicios propios y respondé:

- qué valores te gustaría parametrizar durante el build
- cuáles deberían existir solo en runtime
- si hay algún valor que hoy estás tratando como runtime pero en realidad afecta el build
- si hay algún valor que jamás deberías pasar por `ARG` porque es sensible

No hace falta escribir todavía el stack final completo.
La idea es ordenar el criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre build-time y run-time?
- ¿qué tipo de variable te parece mejor candidata para ARG?
- ¿qué parte del tema de secretos te parece más importante recordar?
- ¿qué servicio tuyo te gustaría parametrizar primero con build args?
- ¿qué error te parece más fácil cometer si no diferenciás ARG y ENV?

Estas observaciones valen mucho más que memorizar sintaxis.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero parametrizar la construcción de la imagen, probablemente me conviene ________.  
> Si quiero parametrizar el comportamiento del contenedor en ejecución, probablemente me conviene ________.  
> Y si el valor es sensible, probablemente no me conviene usar ni ________ ni ________ para el build.

Y además respondé:

- ¿por qué `build.args` te da flexibilidad sin cambiar el Dockerfile cada vez?
- ¿qué parte de este tema te parece más útil para un servicio propio?
- ¿qué riesgo evitás al no usar ARG para secretos?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar qué son los build args en Compose
- distinguir claramente `ARG` y `ENV`
- usar `build.args` con más intención
- evitar usar build args para secretos
- parametrizar builds sin confundir construcción y ejecución

---

## Resumen del tema

- Compose permite pasar build arguments usando `build.args` dentro de la definición detallada de `build`. citeturn398927search0
- `ARG` y `ENV` cumplen roles distintos: uno parametriza el build y el otro define entorno de la imagen o del contenedor. citeturn398927search1turn398927search18
- Un build arg no tiene efecto si el Dockerfile no lo usa. citeturn398927search1
- Docker recomienda no usar `ARG` ni `ENV` para secretos del build; para eso convienen secret mounts o SSH mounts. citeturn398927search15turn398927search7
- Este tema te ayuda a construir servicios más flexibles sin mezclar build-time con run-time.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque con otra distinción muy importante:

- qué queda dentro de la imagen
- qué se inyecta en runtime
- cómo evitar imágenes demasiado rígidas
- y cómo tomar mejores decisiones entre build y ejecución
