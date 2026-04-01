---
title: "Práctica integrada final: stack chico, runtime profesional y README operativo listo para compartir"
description: "Tema 117 del curso práctico de Docker: una práctica integrada de cierre donde combinás runtime más profesional, salud, exposición mínima de puertos y un README operativo mínimo para dejar un proyecto Docker más fácil de retomar, depurar y compartir."
order: 117
module: "Cierre operativo, documentación mínima y proyecto más compartible"
level: "intermedio"
draft: false
---

# Práctica integrada final: stack chico, runtime profesional y README operativo listo para compartir

## Objetivo del tema

En este tema vas a:

- juntar en una sola práctica varias ideas del cierre del roadmap
- dejar un stack pequeño con una runtime más profesional
- combinar no root, healthcheck y exposición mínima de puertos
- separar mejor imagen, datos vivos y operación del proyecto
- dejar un README operativo mínimo realmente útil
- terminar con un modelo bastante reutilizable para proyectos reales

La idea es cerrar esta etapa con un proyecto que no solo “corre”, sino que además queda mejor preparado para:
- retomarlo más adelante
- compartirlo con otra persona
- depurarlo sin improvisación
- y operarlo con bastante menos fricción

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. partir de un stack chico ya razonablemente bien armado
2. resumir qué decisiones lo vuelven más profesional
3. definir cómo debería quedar su operación cotidiana
4. dejar un README operativo mínimo con comandos clave
5. cerrar con una versión más redonda del proyecto

---

## Idea central que tenés que llevarte

A esta altura del roadmap ya viste muchas buenas prácticas importantes:

- multi-stage
- no root
- healthcheck
- service_healthy
- puertos mínimos
- datos persistentes fuera de la imagen
- documentación operativa mínima

Este tema las junta con una idea muy simple:

> un proyecto Docker bien cerrado no depende solo de una imagen correcta;  
> también depende de una operación clara y de una estructura que otra persona pueda entender rápido.

---

## Escenario del tema

Vas a imaginar este stack:

- `proxy`: punto de entrada HTTP
- `app`: backend
- `db`: PostgreSQL
- volumen persistente para la base
- README operativo mínimo para levantarlo, observarlo y bajarlo

Querés que:

- `proxy` sea el único servicio publicado al host
- `app` quede interna
- `db` persista fuera del contenedor
- `app` corra como no root
- `app` y `db` tengan salud real
- el proyecto tenga una entrada operativa clara

Este stack resume bastante bien el tipo de criterio que querés llevarte.

---

## Paso 1: pensar el stack como sistema, no solo como contenedores sueltos

Un stack pequeño pero sano ya debería expresar varias cosas a la vez:

- qué servicio entra desde afuera
- qué servicio solo habla dentro de la red interna
- qué servicio necesita persistencia
- qué parte del sistema depende de readiness real
- cómo levantarlo y depurarlo sin memorizar demasiado

Ese cambio de mirada es muy importante:
ya no estás armando contenedores aislados.
Estás dejando un proyecto operable.

---

## Paso 2: runtime de `app` más profesional

Imaginá una app con un Dockerfile como este:

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

### Qué gana esta imagen
- separa build y runtime
- corre como no root
- deja ownership correcto para el usuario final
- mide disponibilidad real con healthcheck
- documenta el puerto interno sin publicarlo al host

Esto ya deja una base bastante seria para la app.

---

## Paso 3: stack Compose con menos superficie y mejor arranque

Ahora pensá el Compose así:

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

---

## Cómo se lee este stack

La lectura conceptual sería:

- `proxy` es la única entrada visible desde el host
- `app` queda solo en la red interna
- `db` persiste fuera del contenedor
- `db` se limita a localhost si querés acceso local con una GUI o cliente SQL
- `app` y `db` tienen healthchecks
- el arranque se apoya en salud real, no solo en “el proceso está vivo”

Este ya es un stack chico, pero bastante más maduro.

---

## Paso 4: separar mejor datos vivos y temporales

En este stack, la separación sana sería:

### Imagen de `app`
- artefacto final
- dependencias de runtime
- usuario final
- healthcheck
- configuración estática no sensible

### Volumen `db-data`
- datos persistentes de la base

### `tmpfs` en `app`
- temporales de runtime que no querés persistir

### Secretos reales
- fuera de la imagen

Este punto es muy importante porque completa la idea de runtime más profesional:
**la imagen no es el lugar para guardar estado mutable serio**.

---

## Paso 5: dejar una entrada operativa mínima

Ahora el proyecto ya está bastante bien técnicamente.
Pero todavía falta algo muy real:
que alguien pueda usarlo sin depender de memoria.

Entonces conviene dejar un README operativo mínimo con:

- cómo levantar
- cómo ver estado
- cómo ver logs
- cómo entrar a servicios
- cómo reconstruir
- cómo bajar
- y una advertencia clara sobre volúmenes

---

## README operativo mínimo integrado

Acá tenés una base corta y bastante sana:

```md
# Proyecto X

## Requisitos
- Docker
- Docker Compose

## Archivo principal
- `compose.yaml`

## Levantar el proyecto
```bash
docker compose up -d
```

## Ver estado
```bash
docker compose ps
```

## Ver logs
```bash
docker compose logs -f
docker compose logs -f app
docker compose logs --tail 100
```

## Entrar a la app
```bash
docker compose exec app sh
```

## Entrar a la base
```bash
docker compose exec db psql -U postgres -d appdb
```

## Reconstruir
```bash
docker compose up --build -d
```

## Bajar el proyecto
```bash
docker compose down
```

## Bajar y borrar volúmenes
```bash
docker compose down --volumes
```

> Atención: `--volumes` elimina datos persistentes.
```

---

## Qué hace buena a esta documentación

La hace buena que:

- responde preguntas reales
- usa comandos que sí se usan en el día a día
- deja visible el riesgo donde importa
- convierte al proyecto en algo más compartible
- no se vuelve una enciclopedia eterna

Eso es exactamente lo que querés para cerrar bien un proyecto chico.

---

## Qué te enseña realmente esta práctica

Te enseña a juntar cuatro capas importantes:

### 1. Imagen mejor diseñada
- build/runtime separados
- no root
- healthcheck
- artefacto claro

### 2. Stack más sano
- entrada clara
- menos exposición
- datos persistentes fuera del contenedor
- temporales tratados como temporales

### 3. Arranque más confiable
- `service_healthy`
- menos carreras entre servicios

### 4. Operación más clara
- README mínimo
- comandos visibles
- menos dependencia de memoria

Lo valioso no es una sola técnica.
Lo valioso es la coherencia entre todas.

---

## Qué no tenés que confundir

### Proyecto técnicamente correcto no siempre significa proyecto fácil de operar
Podría correr muy bien y aun así ser incómodo de retomar.

### README largo no siempre significa README útil
A veces solo agrega ruido.

### Imagen profesional no reemplaza documentación operativa
Y documentación operativa no reemplaza una imagen bien diseñada.
Se complementan.

### `proxy` publicado no implica que todos los demás servicios deban publicarse
Justamente el proxy suele existir para evitar eso.

---

## Error común 1: cerrar el proyecto en la parte técnica y olvidarte de cómo se usa mañana

Eso vuelve al stack más frágil de lo necesario.

---

## Error común 2: dejar `app` publicada al host aunque ya exista `proxy`

Eso agranda superficie sin necesidad real.

---

## Error común 3: tener healthchecks, pero no dejar claro cómo verlos en logs o estado

Ahí te falta una capa operativa.

---

## Error común 4: no advertir qué comando toca datos persistentes

Ese olvido puede costar información valiosa.

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

- qué mejora aporta no root
- qué mejora aporta healthcheck
- qué mejora aporta dejar `app` interna
- qué mejora aporta limitar `db` a localhost
- qué mejora aporta el volumen de `db`
- qué mejora aporta un README operativo mínimo

### Ejercicio 3
Respondé además:

- por qué esta práctica es más fuerte que aplicar una sola mejora aislada
- por qué este stack es más compartible
- qué parte del proyecto te parece más fácil de retomar gracias al README
- qué riesgo evitás al dejar advertido `down --volumes`

### Ejercicio 4
Imaginá que algo falla.
Respondé:

- qué mirarías primero en `docker compose ps`
- qué mirarías luego en `docker compose logs -f app`
- cuándo usarías `docker compose exec app sh`
- qué revisarías si `db` pierde datos al recrearse
- qué revisarías si `app` parece running pero no healthy

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué parte hoy todavía está demasiado abierta o demasiado informal
- si hoy tu app corre como root
- si hoy te falta healthcheck
- si hoy publicás más puertos de los necesarios
- si hoy el proyecto depende demasiado de tu memoria
- qué cambio concreto harías primero para acercarte a este modelo de cierre

No hace falta escribir todavía tu proyecto final real.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la relación entre imagen, stack y operación?
- ¿en qué proyecto tuyo hoy te convendría empezar por README operativo?
- ¿en cuál te convendría empezar por no root o healthcheck?
- ¿qué puerto te parece más publicado de más hoy?
- ¿qué mejora concreta te gustaría notar al dejar un proyecto más profesional y más compartible?

Estas observaciones valen mucho más que memorizar una sola receta.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero una runtime final más segura, probablemente me conviene correr como ________.  
> Si quiero readiness real, probablemente me conviene usar ________.  
> Si un servicio solo debe ser interno, probablemente me conviene usar ________ o no publicarlo.  
> Si un dato debe sobrevivir al contenedor, probablemente me conviene usar un ________.  
> Si quiero que otra persona pueda levantar y depurar el proyecto sin preguntarme todo, probablemente me conviene dejar un ________ operativo mínimo.

Y además respondé:

- ¿por qué esta práctica te parece un buen cierre de varias capas del roadmap?
- ¿qué proyecto tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no dejar el proyecto dependiendo solo de memoria, root, puertos abiertos y datos vivos dentro del contenedor?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- combinar runtime más segura, salud real, exposición mínima y documentación operativa en una misma práctica
- dejar un stack pequeño bastante más profesional
- retomar o compartir un proyecto con menos fricción
- distinguir mejor entre artefacto, operación y datos vivos
- cerrar proyectos Docker con bastante más criterio de punta a punta

---

## Resumen del tema

- Docker recomienda correr como no root cuando el servicio no necesita privilegios especiales. citeturn840515search20turn840515search13
- `HEALTHCHECK` y `service_healthy` ayudan a distinguir running de readiness real y a ordenar mejor el arranque. citeturn840515search0turn840515search12
- Publicar puertos es inseguro por defecto si no era necesario, y limitar a `127.0.0.1` reduce superficie expuesta. citeturn840515search13
- Los volúmenes son la opción preferida para datos persistentes; `tmpfs` sirve para temporales efímeros. citeturn840515search13
- `docker compose up`, `ps`, `logs`, `exec` y `down` forman una base muy buena para un README operativo mínimo. citeturn840515search0turn840515search6turn840515search9turn840515search15turn840515search12
- Esta práctica te deja un cierre bastante más redondo: proyecto chico, runtime más sana y operación mucho más clara.

---

## Próximo tema

En el próximo tema vas a seguir avanzando hacia el cierre final del roadmap con una capa muy útil de estandarización:

- convenciones simples de equipo
- nombres claros
- archivos esperables
- y cómo reducir fricción cuando más de una persona toca el proyecto
