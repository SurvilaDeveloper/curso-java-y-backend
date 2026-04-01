---
title: "Práctica integrada de imagen profesional: no root, healthcheck y puertos mínimos en un mismo stack"
description: "Tema 112 del curso práctico de Docker: una práctica integrada donde combinás usuario no root, healthcheck y exposición mínima de puertos para dejar una imagen y un stack más profesionales, más seguros y más confiables."
order: 112
module: "Imagen final más profesional y más segura"
level: "intermedio"
draft: false
---

# Práctica integrada de imagen profesional: no root, healthcheck y puertos mínimos en un mismo stack

## Objetivo del tema

En este tema vas a:

- juntar en una sola práctica varias ideas del bloque final del roadmap
- correr la app como usuario no root
- exponer solo lo que realmente hace falta
- medir salud real con `HEALTHCHECK`
- combinar estas decisiones en una imagen y un stack más profesionales
- terminar con un patrón bastante reutilizable para proyectos reales

La idea es cerrar este bloque con una práctica concreta donde ya no veas estas mejoras como piezas separadas, sino como partes de una misma imagen final bien pensada.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. partir de una imagen que funciona, pero está demasiado abierta o demasiado permisiva
2. cambiar la runtime para que no corra como root
3. agregar un healthcheck representativo
4. exponer solo lo que realmente necesita salir al host
5. dejar una composición final más segura y más confiable
6. cerrar con una regla práctica para imágenes de mejor nivel

---

## Idea central que tenés que llevarte

En los temas anteriores viste tres mejoras muy importantes por separado:

- correr como usuario no root
- distinguir `running` de `healthy`
- publicar solo los puertos necesarios y, cuando corresponde, limitar a localhost

Este tema las junta con una idea muy simple:

> una imagen final más profesional no depende de una sola mejora,  
> sino de varias decisiones coherentes que se refuerzan entre sí.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker recomienda usar `USER` para pasar a un usuario no root cuando el servicio no necesita privilegios especiales, y las guías recientes de Docker para frameworks y runtimes modernos remarcan que la imagen final debería correr como usuario no privilegiado. Docker también documenta `HEALTHCHECK` como mecanismo para distinguir un contenedor que solo está corriendo de uno que realmente responde bien, y Compose permite usar `depends_on.condition: service_healthy` para esperar readiness real. En networking, Docker advierte que publicar puertos es inseguro por defecto si no era necesario, y explica que `127.0.0.1` limita el acceso al propio host, mientras que `ports` publica hacia el host y `expose` solo declara accesibilidad interna entre servicios. Además, las guías oficiales modernas de Node insisten en separar build y runtime, usar non-root y construir imágenes más seguras y mantenibles. citeturn422370search3turn422370search0turn422370search1turn422370search2turn422370search4turn422370search8turn422370search14

---

## Escenario del tema

Vas a imaginar este stack:

- `proxy`: punto de entrada HTTP
- `app`: backend Node
- `db`: PostgreSQL

Querés que:

- `proxy` sea el único servicio publicado en todas las interfaces
- `app` quede solo dentro de la red interna
- `db` no se publique al exterior y, si hiciera falta acceso local, quede solo en localhost
- la runtime de `app` corra como usuario no root
- `app` y `db` tengan salud real y no solo procesos vivos

Este es un muy buen “stack modelo” para terminar el bloque.

---

## Primera versión: funciona, pero todavía es demasiado plana

Imaginá algo así:

```Dockerfile
FROM node:22
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "dist/server.js"]
```

y un Compose parecido a este:

```yaml
services:
  proxy:
    image: nginx
    ports:
      - "8080:80"

  app:
    build: .
    ports:
      - "3000:3000"

  db:
    image: postgres:18
    ports:
      - "5432:5432"
```

---

## Qué problema tiene esta primera versión

Puede funcionar, sí.

Pero deja varios problemas juntos:

- la app corre como root
- `app` está publicada al host aunque quizá debería quedar interna
- `db` también está publicada al host en todas las interfaces
- no hay healthcheck para distinguir arranque real de disponibilidad real
- el stack se apoya demasiado en “si arrancó, debe estar bien”

No está roto.
Pero todavía no se ve como una imagen o un stack de buen nivel final.

---

## Paso 1: mejorar la imagen de `app`

Ahora imaginá una versión más sana del Dockerfile de `app`:

```Dockerfile
FROM node:22 AS build
WORKDIR /src

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-slim AS runtime
WORKDIR /app

RUN groupadd -r app && useradd -r -g app app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build --chown=app:app /src/dist /app/dist

USER app

HEALTHCHECK --interval=30s --timeout=5s --retries=3   CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

---

## Cómo se lee este Dockerfile

La lectura conceptual sería:

- separás build y runtime
- la runtime corre como no root
- el artefacto final llega con ownership correcto
- agregás un healthcheck que prueba el endpoint de salud interno
- `EXPOSE 3000` documenta el puerto de la app, pero no lo publica al host

Esto ya se parece mucho más a una imagen final bien pensada.

---

## Qué gana esta versión de `app`

Gana varias cosas al mismo tiempo:

- runtime más limpia
- proceso final con menos privilegios
- menos sorpresa de permisos gracias a `COPY --chown`
- una señal clara de salud real de la app
- una separación más clara entre intención interna (`EXPOSE`) y publicación real (`ports`)

No es una mejora aislada.
Es una mejora estructural.

---

## Un detalle importante del healthcheck

La idea de un healthcheck sano es que compruebe **salud real** del servicio, no solo “si el proceso existe”.

Por eso un endpoint `/health` suele ser una buena opción para la app si está bien diseñado.

No hace falta que el ejemplo exacto sea siempre este.
La idea importante es:

- el probe debe representar disponibilidad real
- no debería tener efectos colaterales
- debería ser razonable para el tiempo de bootstrap del servicio

---

## Paso 2: mejorar `db`

Ahora pensá la base así en Compose:

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
      timeout: 10s
      retries: 5
      start_period: 30s
```

---

## Qué gana esta versión de `db`

Gana algo clave para el stack:

- `db` ya no es solo un proceso corriendo
- ahora tiene una comprobación explícita de readiness real
- otras piezas del stack pueden depender de esa señal más fuerte

Esto encaja perfecto con el patrón oficial de startup order más confiable.

---

## Paso 3: dejar `app` interna

Ahora Compose puede tratar a `app` así:

```yaml
services:
  app:
    build: .
    expose:
      - "3000"
    depends_on:
      db:
        condition: service_healthy
```

### Cómo se lee
- `app` no se publica al host
- sigue siendo accesible desde otros servicios de la red del stack
- espera a que `db` esté realmente healthy antes de arrancar

Esto ya corrige dos problemas a la vez:
- carrera de arranque
- sobreexposición innecesaria

---

## Paso 4: publicar solo el proxy

Ahora dejá el proxy así:

```yaml
services:
  proxy:
    image: nginx
    ports:
      - "8080:80"
    depends_on:
      app:
        condition: service_healthy
```

### Qué gana esto
- solo `proxy` sale al host
- `app` queda protegida detrás de él
- la dependencia ya no es solo “arrancó”, sino “está healthy”

Este paso ordena muchísimo el diseño del stack.

---

## Paso 5: qué hacer con `db`

Tenés dos caminos razonables.

### Opción A: `db` solo interna
Si solo `app` necesita hablar con la base, ni siquiera hace falta publicar `db`.

### Opción B: `db` accesible solo desde el host local
Si querés abrir una GUI SQL desde tu máquina:

```yaml
services:
  db:
    image: postgres:18
    ports:
      - "127.0.0.1:5432:5432"
```

Esto limita el acceso al propio host y evita abrir PostgreSQL a toda la red local.

La idea importante es:
**si no la necesitás fuera del stack, no la publiques; y si la necesitás solo localmente, limitála a localhost**.

---

## Stack final de la práctica

Mirá una versión integrada y bastante sana:

```yaml
services:
  proxy:
    image: nginx
    ports:
      - "8080:80"
    depends_on:
      app:
        condition: service_healthy

  app:
    build: .
    expose:
      - "3000"
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
      timeout: 10s
      retries: 5
      start_period: 30s
    ports:
      - "127.0.0.1:5432:5432"
```

Y la imagen de `app` con:

- multi-stage
- usuario no root
- healthcheck
- `EXPOSE 3000` como documentación de intención

---

## Cómo se lee este stack final

La lectura conceptual sería:

- `proxy` es la única puerta de entrada general
- `app` queda interna y corre con menos privilegios
- `db` tiene salud real y, si se publica, queda limitada a localhost
- las dependencias esperan readiness real
- el stack expresa mucho mejor qué servicio debe ser accesible, con qué privilegios y en qué momento

Esto ya se parece bastante a un stack profesional chico.

---

## Qué te enseña realmente esta práctica

Te enseña a combinar estas capas:

### Seguridad de proceso
no root en runtime.

### Seguridad/exposición de red
solo publicar lo necesario y en la interfaz correcta.

### Confiabilidad de arranque
healthchecks y `service_healthy`.

Lo valioso no es cada mejora aislada.
Lo valioso es que juntas forman una imagen y un stack mucho más maduros.

---

## Qué no tenés que confundir

### `EXPOSE` no reemplaza a `ports`
Solo documenta intención interna.

### `running` no reemplaza a `healthy`
El proceso puede existir y aun así no estar listo.

### no root no resuelve readiness
Y healthcheck no resuelve permisos.
Son mejoras distintas que se complementan.

### publicar menos no significa “romper acceso”
Significa publicar solo donde realmente hace falta.

---

## Error común 1: correr la app como no root, pero dejar publicados todos los puertos igual

Ahí mejoraste privilegios, pero no exposición de red.

---

## Error común 2: agregar healthcheck y seguir arrancando dependencias solo por `depends_on` básico

Ahí medís salud, pero no la usás para ordenar el arranque.

---

## Error común 3: publicar `app` y `proxy` a la vez hacia el host cuando el proxy ya cumple rol de entrada

Eso agranda superficie sin necesidad real.

---

## Error común 4: cambiar a no root sin preparar ownership y permisos

Eso suele romper escrituras, uploads o acceso a rutas necesarias.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Tomá este stack conceptual:

```yaml
services:
  proxy:
    image: nginx
    ports:
      - "8080:80"
    depends_on:
      app:
        condition: service_healthy

  app:
    build: .
    expose:
      - "3000"
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
      timeout: 10s
      retries: 5
      start_period: 30s
    ports:
      - "127.0.0.1:5432:5432"
```

Y este Dockerfile conceptual para `app`:

```Dockerfile
FROM node:22 AS build
WORKDIR /src

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-slim AS runtime
WORKDIR /app

RUN groupadd -r app && useradd -r -g app app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build --chown=app:app /src/dist /app/dist

USER app

HEALTHCHECK --interval=30s --timeout=5s --retries=3   CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

### Ejercicio 2
Respondé con tus palabras:

- qué mejora de seguridad aporta `USER app`
- qué mejora de confiabilidad aporta `HEALTHCHECK`
- qué mejora de exposición aporta dejar solo `proxy` publicado
- por qué `db` limitada a localhost es más sana que `5432:5432`

### Ejercicio 3
Respondé además:

- por qué `app` usa `expose` en vez de `ports`
- por qué `service_healthy` mejora el orden de arranque
- qué problema resuelve `COPY --chown`
- por qué esta práctica es más fuerte que aplicar solo una de estas mejoras aisladas

### Ejercicio 4
Imaginá que algo falla.
Respondé:

- qué mirarías primero en `docker ps`
- qué mirarías en `inspect` para mounts o salud
- qué servicio sospecharías primero si `proxy` responde pero la app no
- qué parte del stack revisarías si `app` arranca demasiado pronto

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- si hoy tu app corre como root
- si hoy le falta healthcheck
- si hoy estás publicando más puertos de los necesarios
- qué servicio te gustaría dejar solo interno
- qué servicio te gustaría limitar a localhost
- qué cambio concreto harías primero para acercarte a este modelo

No hace falta escribir todavía tu stack final real.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la relación entre privilegios, salud y exposición?
- ¿en qué proyecto tuyo hoy te convendría empezar por no root?
- ¿en cuál te convendría empezar por healthcheck?
- ¿qué puerto te parece más publicado de más hoy?
- ¿qué mejora concreta te gustaría notar al combinar estas buenas prácticas?

Estas observaciones valen mucho más que memorizar un único YAML.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si mi runtime no necesita privilegios especiales, probablemente me conviene correr como ________.  
> Si quiero medir disponibilidad real del servicio, probablemente me conviene usar ________.  
> Si un servicio solo debe ser accesible dentro del stack, probablemente me conviene usar ________ o dejarlo solo en la red interna.  
> Si una base solo la necesito desde mi host local, probablemente me conviene limitarla a ________.  
> Si quiero que el arranque respete salud real y no solo orden de creación, probablemente me conviene usar `condition: ________`.

Y además respondé:

- ¿por qué esta práctica te parece mucho más profesional de punta a punta?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no dejar todo como root, sin healthchecks y con puertos abiertos de más?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- combinar no root, healthcheck y exposición mínima en una misma práctica
- diseñar una runtime final bastante más segura
- arrancar stacks con menos carreras de arranque
- reducir superficie expuesta sin perder acceso útil
- pensar una imagen y un stack con bastante más criterio profesional de punta a punta

---

## Resumen del tema

- Docker recomienda correr la imagen final como usuario no root cuando el servicio no necesita privilegios especiales. citeturn422370search3turn422370search0
- `HEALTHCHECK` y `service_healthy` ayudan a distinguir running de readiness real y a ordenar mejor el arranque entre servicios. citeturn422370search1turn422370search7
- Publicar puertos es inseguro por defecto si no era necesario, y limitar a `127.0.0.1` reduce superficie expuesta. citeturn422370search2turn422370search14
- `ports` publica al host; `expose` deja el servicio accesible para otros contenedores de la red. citeturn422370search4turn422370search17
- Esta práctica te deja una base mucho más madura para construir imágenes y stacks chicos, pero bastante más profesionales.

---

## Próximo tema

En el próximo tema vas a seguir avanzando hacia el cierre del roadmap con una capa muy útil de hardening y mantenimiento:

- qué escribir y qué no escribir en la imagen
- temporales, uploads, secretos, mutabilidad
- y cómo pensar mejor el límite entre build, runtime y datos vivos
