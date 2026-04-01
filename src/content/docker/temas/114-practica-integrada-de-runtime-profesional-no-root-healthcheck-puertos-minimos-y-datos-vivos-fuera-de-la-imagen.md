---
title: "Práctica integrada de runtime profesional: no root, healthcheck, puertos mínimos y datos vivos fuera de la imagen"
description: "Tema 114 del curso práctico de Docker: una práctica integrada donde combinás usuario no root, healthcheck, publicación mínima de puertos y separación correcta entre imagen inmutable y datos vivos de runtime para dejar un stack pequeño, pero bastante más profesional."
order: 114
module: "Imagen final más profesional y más segura"
level: "intermedio"
draft: false
---

# Práctica integrada de runtime profesional: no root, healthcheck, puertos mínimos y datos vivos fuera de la imagen

## Objetivo del tema

En este tema vas a:

- juntar en una sola práctica varias ideas del cierre del roadmap
- correr la runtime como usuario no root
- medir salud real del servicio
- publicar solo lo que realmente hace falta
- separar artefacto inmutable de datos vivos
- terminar con un stack pequeño, pero bastante más profesional y reutilizable

La idea es cerrar esta parte del curso con una práctica integrada que junte **seguridad básica**, **readiness real**, **menor superficie expuesta** y **mejor separación entre imagen y estado mutable**.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. partir de una app containerizada que funciona, pero todavía mezcla demasiadas cosas
2. mejorar su Dockerfile para que la runtime sea más sana
3. dejar la app corriendo como no root
4. agregar un healthcheck representativo
5. sacar datos vivos fuera de la imagen
6. exponer solo lo que realmente hace falta hacia el host

---

## Idea central que tenés que llevarte

A esta altura ya viste varias buenas prácticas importantes por separado:

- multi-stage
- runtime mínima
- no root
- healthchecks
- `service_healthy`
- puertos mínimos
- datos vivos fuera de la imagen

Este tema las junta con una idea muy simple:

> una imagen final realmente buena no se define por un solo detalle,  
> sino por varias decisiones coherentes que juntas vuelven el stack más seguro, más predecible y más mantenible.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker recomienda correr como usuario no root cuando el servicio no necesita privilegios especiales, y las guías recientes de Node remarcan que la imagen final debe ser más segura, mínima y production-ready. Docker también documenta `HEALTHCHECK` para distinguir entre un contenedor simplemente running y un servicio realmente usable, y Compose permite usar `condition: service_healthy` para esperar readiness real. En networking, Docker advierte que publicar puertos es inseguro por defecto si no hacía falta, y que limitar a `127.0.0.1` reduce la superficie expuesta. En storage, Docker explica que la writable layer no persiste al destruir el contenedor y que los volúmenes son la opción preferida para datos persistentes; además, `tmpfs` sirve para datos temporales que no querés persistir. Por último, la guía oficial de Docker sobre seguridad explica que correr procesos como usuarios no privilegiados dentro del contenedor mejora la seguridad general. citeturn271753search21turn271753search1turn271753search2turn271753search3turn271753search7turn271753search15turn271753search16

---

## Escenario del tema

Vas a imaginar este stack:

- `proxy`: entrada HTTP
- `app`: backend Node
- `db`: PostgreSQL
- un volumen persistente para la base
- un espacio temporal de runtime que no debería persistir

Querés que:

- `proxy` sea el único punto realmente publicado al host
- `app` quede solo dentro de la red interna
- `db` no viva en la imagen ni en la writable layer
- la runtime de `app` corra como no root
- `app` y `db` tengan healthcheck
- la app no dependa de secretos baked-in

Este stack resume muy bien el tipo de criterio que querés llevarte del roadmap.

---

## Primera versión: funciona, pero todavía mezcla demasiado

Imaginá un Dockerfile simple:

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

Puede funcionar.
Pero mezcla varias decisiones poco cuidadas:

- la app corre como root
- la app está publicada al host aunque podría quedar interna
- la base también está publicada al host en todas las interfaces
- no hay salud real
- los datos vivos no están modelados explícitamente
- el stack no expresa bien qué debe ser inmutable y qué debe mutar

No está mal para una primera prueba.
Pero todavía no es una runtime madura.

---

## Paso 1: mejorar el Dockerfile de `app`

Ahora pensá la app con un Dockerfile bastante más sano:

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

- build y runtime están separados
- la runtime corre como usuario no root
- el artefacto final llega con ownership correcto
- el healthcheck verifica disponibilidad real
- `EXPOSE 3000` documenta intención, pero no publica hacia el host
- la imagen queda enfocada en correr, no en almacenar estado vivo

Esto ya se parece mucho más a una runtime seria.

---

## Qué gana esta versión de `app`

Gana varias cosas al mismo tiempo:

- menos privilegios
- mejor separación build/runtime
- menos ruido en la imagen final
- salud real del servicio
- mejor ownership de archivos
- una frontera más clara entre lo que la imagen contiene y lo que no debería contener

No es una mejora aislada.
Es una mejora de diseño.

---

## Paso 2: sacar datos vivos fuera de la imagen

Acá aparece una idea central del cierre.

Docker documenta que la writable layer no persiste cuando el contenedor se destruye y que los volúmenes son la opción preferida para datos persistentes; también documenta `tmpfs` para temporales en memoria. citeturn271753search15turn271753search3turn271753search7

### Qué significa eso para este stack
- la base debe usar volumen
- los temporales de runtime pueden usar `tmpfs`
- secretos y credenciales no deberían quedar baked-in en la imagen

---

## Paso 3: modelar `db` correctamente

Ahora pensá la base así:

```yaml
services:
  db:
    image: postgres:18
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: mysecretpassword
    volumes:
      - db-data:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 10s
      timeout: 10s
      retries: 5
      start_period: 30s
```

### Qué gana esto
- los datos de PostgreSQL no dependen de la writable layer
- el servicio tiene señal de salud real
- la base ya no está pensada como “algo que vive dentro del contenedor sin más”

Esto conversa perfecto con todo lo visto sobre persistencia.

---

## Paso 4: dejar `app` interna y solo con temporales efímeros

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
    tmpfs:
      - /tmp
```

### Cómo se lee
- `app` no se publica al host
- sigue siendo accesible para otros servicios del stack
- espera a que `db` esté realmente lista
- `/tmp` no persiste y refuerza una runtime más limpia

Esto ya ordena muy bien red, arranque y mutabilidad.

---

## Qué aporta `tmpfs` acá

Aporta una mejora muy concreta:

- los temporales viven en memoria
- no ensucian la writable layer con datos que no querés conservar
- ayudan a reforzar la idea de que el contenedor no es un disco persistente

No siempre hace falta en todos los proyectos.
Pero conceptualmente es muy bueno para separar mejor el tipo de dato.

---

## Paso 5: publicar solo el proxy

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
- el único punto publicado al host es la entrada real
- `app` no sale innecesariamente al exterior
- el stack queda mejor ordenado
- el orden de arranque se apoya en salud real

Esto reduce bastante la superficie expuesta.

---

## Paso 6: decidir qué hacer con `db` hacia el host

Acá tenés dos caminos razonables.

### Opción A: `db` solo interna
Si solo `app` necesita hablar con PostgreSQL, ni la publiques.

### Opción B: `db` accesible solo desde el host local
Si querés usar una GUI SQL local, limitála así:

```yaml
ports:
  - "127.0.0.1:5432:5432"
```

Docker documenta justamente que publicar con `127.0.0.1` limita el acceso al host local. citeturn271753search2

La idea clave es esta:
**o no la publicás, o la publicás solo donde realmente hace falta**.

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
    tmpfs:
      - /tmp

  db:
    image: postgres:18
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: mysecretpassword
    volumes:
      - db-data:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 10s
      timeout: 10s
      retries: 5
      start_period: 30s
    ports:
      - "127.0.0.1:5432:5432"

volumes:
  db-data:
```

Y la imagen de `app` con:

- multi-stage
- usuario no root
- healthcheck
- runtime sin estado persistente innecesario

---

## Cómo se lee este stack final

La lectura conceptual sería:

- `proxy` es la única entrada general
- `app` queda interna
- `db` persiste sus datos en volumen
- `app` usa temporales efímeros donde corresponde
- la runtime final corre como no root
- el arranque se apoya en salud real
- la imagen ya no intenta mezclar artefacto con datos vivos

Esto ya se parece bastante a un stack pequeño, pero profesional.

---

## Qué te enseña realmente esta práctica

Te enseña a juntar estas capas:

### Imagen final
- artefacto reproducible
- no root
- runtime enfocada

### Salud
- readiness real
- menos carreras de arranque

### Red
- solo publicar lo necesario

### Datos vivos
- volumen para persistencia
- tmpfs para temporales
- nada sensible baked-in

Lo valioso no es una sola técnica.
Lo valioso es la coherencia entre todas.

---

## Qué no tenés que confundir

### `EXPOSE` no reemplaza a `ports`
Solo documenta intención interna.

### Writable layer no reemplaza a volumen
No es persistencia seria.

### no root no reemplaza a healthcheck
Y healthcheck no reemplaza buena separación de datos.
Son mejoras distintas.

### publicar menos no significa perder funcionalidad
Significa exponer con intención.

---

## Error común 1: tener una imagen no root, pero seguir dejando uploads, base o caches pesadas dentro del contenedor

Ahí mejoraste privilegios, pero no modelo de datos.

---

## Error común 2: agregar healthcheck, pero seguir arrancando dependencias sin usar `service_healthy`

Ahí medís salud, pero no la usás en la orquestación.

---

## Error común 3: usar volumen para todo, incluso temporales que no querías persistir

Ahí te falta separar mejor persistencia de efímero.

---

## Error común 4: publicar `app` y `db` en todas las interfaces por costumbre

Ahí te falta criterio de exposición.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Tomá este stack final:

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
    tmpfs:
      - /tmp

  db:
    image: postgres:18
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: mysecretpassword
    volumes:
      - db-data:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 10s
      timeout: 10s
      retries: 5
      start_period: 30s
    ports:
      - "127.0.0.1:5432:5432"

volumes:
  db-data:
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

- qué mejora aporta `USER app`
- qué mejora aporta el healthcheck de `app`
- qué mejora aporta `service_healthy`
- qué mejora aporta dejar `app` solo con `expose`
- qué mejora aporta mover la base a volumen
- qué mejora aporta usar `tmpfs` para temporales

### Ejercicio 3
Respondé además:

- por qué este stack separa mejor artefacto de runtime y datos vivos
- por qué publicar solo `proxy` suele ser más sano
- por qué `db` limitada a localhost es mejor que `5432:5432`
- qué riesgo evitás al no hornear secretos ni estado mutable en la imagen

### Ejercicio 4
Imaginá que algo falla.
Respondé:

- qué mirarías primero en `docker ps`
- qué mirarías en `inspect` para mounts, puertos o salud
- qué parte sospecharías si `db` pierde datos al recrearse
- qué parte sospecharías si `app` no puede escribir archivos temporales
- qué parte sospecharías si `proxy` responde pero `app` no

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué parte de tu runtime hoy sigue demasiado mutable
- si hoy tu app corre como root
- si hoy tu servicio no tiene healthcheck
- si hoy estás publicando más puertos de los necesarios
- qué directorio te convendría mover a volumen
- qué directorio te convendría tratar como temporal
- qué cambio concreto harías primero para acercarte a este modelo

No hace falta escribir todavía tu stack final real.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la relación entre imagen inmutable, runtime no root, salud y exposición mínima?
- ¿en qué proyecto tuyo hoy te convendría empezar por separar mejor los datos vivos?
- ¿en cuál te convendría empezar por no root?
- ¿qué servicio hoy tiene más puertos abiertos de más?
- ¿qué mejora concreta te gustaría notar al acercarte a una runtime más profesional?

Estas observaciones valen mucho más que memorizar un solo ejemplo.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si mi imagen final no necesita privilegios especiales, probablemente me conviene correr como ________.  
> Si quiero readiness real, probablemente me conviene usar ________.  
> Si quiero que un servicio espere salud real de otro, probablemente me conviene usar `condition: ________`.  
> Si un servicio solo debe ser interno al stack, probablemente me conviene usar ________ o directamente no publicarlo.  
> Si un dato debe sobrevivir al contenedor, probablemente me conviene usar un ________.  
> Si un dato es temporal y no quiero persistirlo, probablemente me conviene usar ________.

Y además respondé:

- ¿por qué esta práctica te parece mucho más profesional de punta a punta?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no dejar todo como root, sin salud, con puertos abiertos y datos vivos dentro del contenedor?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- combinar no root, healthcheck, exposición mínima y separación de datos en una misma práctica
- diseñar una runtime final bastante más segura y más clara
- arrancar stacks con menos carreras e incertidumbre
- reducir superficie expuesta sin perder acceso útil
- pensar un stack pequeño con bastante más criterio profesional de punta a punta

---

## Resumen del tema

- Docker recomienda correr como no root cuando el servicio no necesita privilegios especiales. citeturn271753search21turn271753search16
- `HEALTHCHECK` y `service_healthy` ayudan a distinguir running de readiness real y a ordenar mejor el arranque. citeturn271753search1turn271753search9
- Publicar puertos es inseguro por defecto si no era necesario, y limitar a `127.0.0.1` reduce superficie expuesta. citeturn271753search2
- La writable layer no es una estrategia seria de persistencia; los volúmenes son preferibles para datos persistentes. citeturn271753search15turn271753search3
- `tmpfs` sirve para temporales efímeros y ayuda a no persistir datos que no querés conservar. citeturn271753search7
- Esta práctica te deja un stack pequeño pero bastante más profesional, donde privilegios, salud, red y datos vivos están mucho mejor separados.

---

## Próximo tema

En el próximo tema vas a seguir avanzando hacia el cierre del roadmap con una capa muy útil de calidad operativa:

- documentación mínima útil del proyecto
- comandos clave para levantar y depurar
- convenciones de equipo
- y cómo dejar un proyecto Docker mucho más fácil de retomar o compartir
