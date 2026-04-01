---
title: "Definir servicios en Compose: cuándo usar image, cuándo usar build y cómo pensar cada componente"
description: "Tema 35 del curso práctico de Docker: cómo definir servicios en Compose con image o build, cómo declarar puertos, variables y volúmenes dentro de cada servicio y cómo empezar a pensar cada componente del stack con más intención."
order: 35
module: "Docker Compose como herramienta central"
level: "base"
draft: false
---

# Definir servicios en Compose: cuándo usar image, cuándo usar build y cómo pensar cada componente

## Objetivo del tema

En este tema vas a:

- entender mejor qué representa un servicio en Compose
- distinguir cuándo conviene usar `image`
- distinguir cuándo conviene usar `build`
- declarar puertos, variables y volúmenes dentro de un servicio
- empezar a describir cada componente del stack con más criterio

La idea es que ya no veas un servicio Compose como una cajita genérica, sino como una definición clara de qué hace cada pieza de la aplicación.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. reforzar qué es un servicio en Compose
2. entender la diferencia entre `image` y `build`
3. agregar puertos, variables y volúmenes a un servicio
4. mirar un ejemplo más completo y legible
5. aprender a pensar mejor qué declarar en cada componente del stack

---

## Idea central que tenés que llevarte

En Compose, un servicio representa un componente de tu aplicación.

Ese componente puede:

- usar una imagen ya existente
- construirse desde tu propio código
- publicar puertos
- usar variables de entorno
- montar volúmenes
- depender de otros servicios

Dicho simple:

> un servicio es la unidad con la que describís cada pieza del stack dentro de `compose.yaml`

---

## Qué dice la documentación oficial

Docker describe `services` como el elemento principal del modelo Compose y documenta que cada servicio puede usar `image` o `build`, además de atributos como `ports`, `environment`, `volumes` y `depends_on`. También aclara que `build` puede ser una ruta simple al contexto o una estructura más detallada, y que `ports` mapea puertos del host al contenedor. citeturn334449search0turn334449search2turn334449search12

---

## Recordatorio rápido: qué es un servicio

En Compose, un servicio no es solo “un contenedor cualquiera”.

Es más útil pensarlo así:

- una pieza lógica de la aplicación
- una configuración declarativa
- un componente con imagen o build, red, puertos, almacenamiento y entorno

Por ejemplo, en un proyecto real podrías tener servicios como:

- `web`
- `api`
- `db`
- `redis`
- `worker`

Cada uno representa una responsabilidad diferente dentro del stack.

---

## Primer gran punto: image

Usás `image` cuando el servicio debe correr usando una imagen ya existente.

Por ejemplo:

```yaml
services:
  web:
    image: nginx

  db:
    image: postgres:18
```

---

## Cuándo conviene image

Suele convenir cuando:

- ya existe una imagen oficial o externa que querés usar
- no necesitás construir nada desde tu código
- querés usar algo estándar como Nginx, PostgreSQL o Redis
- el servicio no es tu aplicación principal, sino una dependencia del stack

Esto es muy común para:

- bases de datos
- caches
- proxies
- herramientas auxiliares

---

## Segundo gran punto: build

Usás `build` cuando querés que Compose construya la imagen desde tu proyecto local.

Por ejemplo:

```yaml
services:
  app:
    build: .
```

O también con más detalle:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
```

---

## Cuándo conviene build

Suele convenir cuando:

- el servicio es tu propia aplicación
- tenés un Dockerfile en tu proyecto
- querés que Compose construya la imagen antes de arrancar el servicio
- necesitás un flujo más integrado entre código y stack

Esto suele ser muy natural para:

- una API propia
- un frontend tuyo
- un worker o servicio que vos desarrollás

---

## Diferencia práctica entre image y build

### `image`
Le decís a Compose qué imagen usar.

### `build`
Le decís a Compose cómo construir la imagen del servicio.

A veces incluso podés usar ambas cosas juntas en flujos más avanzados, pero para el arranque del curso conviene quedarte con esta regla simple:

- `image` para servicios ya disponibles
- `build` para tus servicios propios

---

## Puertos dentro de un servicio

`ports` funciona igual que ya conocés en Docker.

Por ejemplo:

```yaml
services:
  web:
    image: nginx
    ports:
      - "8080:80"
```

La lectura conceptual es:

- host `8080`
- contenedor `80`

Esto sirve cuando querés que tu máquina host acceda al servicio.

No hace falta poner `ports` en todo.
Solo en los servicios que realmente necesitás exponer al host.

---

## Variables de entorno dentro de un servicio

`environment` permite declarar variables de entorno del servicio.

Por ejemplo:

```yaml
services:
  db:
    image: postgres:18
    environment:
      POSTGRES_PASSWORD: mysecretpassword
      POSTGRES_DB: appdb
```

También puede escribirse en formato lista:

```yaml
services:
  db:
    image: postgres:18
    environment:
      - POSTGRES_PASSWORD=mysecretpassword
      - POSTGRES_DB=appdb
```

Ambas formas son válidas.
Al empezar, la forma mapa suele ser más legible.

---

## Volúmenes dentro de un servicio

`volumes` dentro del servicio define qué mounts usa ese componente.

Por ejemplo:

```yaml
services:
  db:
    image: postgres:18
    volumes:
      - postgres_data:/var/lib/postgresql
```

La idea es:

- este servicio necesita persistir datos
- usá el volumen nombrado `postgres_data`
- montalo en la ruta apropiada del contenedor

Después ese volumen se declara arriba o abajo a nivel top-level:

```yaml
volumes:
  postgres_data:
```

---

## Dependencias entre servicios

Compose también tiene `depends_on`.

Por ejemplo:

```yaml
services:
  api:
    build: .
    depends_on:
      - db

  db:
    image: postgres:18
```

Esto le indica a Compose que `api` depende de `db`.

Es útil para expresar relación entre componentes del stack.

Importante:
al comienzo conviene pensar `depends_on` como una forma de ordenar o declarar dependencia, no como una garantía mágica de que la base ya esté “lista” a nivel aplicación.

---

## Un ejemplo más realista

Mirá este archivo:

```yaml
services:
  web:
    image: nginx
    ports:
      - "8080:80"

  api:
    build: ./api
    ports:
      - "3000:3000"
    environment:
      DB_HOST: db
      DB_NAME: appdb
      DB_USER: postgres
      DB_PASSWORD: mysecretpassword
    depends_on:
      - db

  db:
    image: postgres:18
    environment:
      POSTGRES_PASSWORD: mysecretpassword
      POSTGRES_DB: appdb
    volumes:
      - postgres_data:/var/lib/postgresql

volumes:
  postgres_data:
```

---

## Cómo se lee este archivo

La lectura conceptual sería:

- `web` usa Nginx y publica `8080:80`
- `api` se construye desde tu código local en `./api`
- `api` publica `3000:3000`
- `api` necesita variables para conectarse a `db`
- `db` usa PostgreSQL 18
- `db` persiste datos en `postgres_data`

Esto ya se parece mucho más a un stack real.

---

## Qué te ayuda a decidir qué poner en cada servicio

Podés hacerte estas preguntas:

### ¿Es una dependencia estándar?
Entonces probablemente `image`.

### ¿Es mi aplicación propia?
Entonces probablemente `build`.

### ¿Necesito entrar desde el host?
Entonces probablemente `ports`.

### ¿Necesita configuración dinámica?
Entonces probablemente `environment`.

### ¿Necesita persistir datos o montar archivos?
Entonces probablemente `volumes`.

### ¿Depende de otro servicio del stack?
Entonces probablemente `depends_on`.

Estas preguntas ordenan muchísimo la lectura y escritura del archivo.

---

## Qué no tenés que confundir

### `image` no es lo mismo que `build`
Una cosa usa una imagen.
La otra construye una.

### `ports` no hace falta en todos los servicios
Solo en los que realmente necesitás exponer al host.

### `environment` no reemplaza entender la configuración de tu app
Solo te ayuda a declararla en Compose.

### `volumes` dentro del servicio no reemplaza declarar el volumen top-level
Si es un volumen nombrado, normalmente también lo declarás en `volumes:` a nivel superior.

---

## Error común 1: poner ports en la base de datos por costumbre

No siempre hace falta.

Si la base solo la consume otro servicio del stack, muchas veces puede quedarse interna.

---

## Error común 2: usar image cuando el servicio en realidad es tu app propia

Eso te deja sin el flujo natural de build desde tu proyecto.

---

## Error común 3: usar build para todo sin pensar

No todo servicio necesita construirse localmente.
Muchas dependencias encajan mucho mejor con imágenes ya hechas.

---

## Error común 4: creer que depends_on garantiza que todo esté listo

Conviene no pensar eso de forma mágica.
El arranque lógico del stack y la disponibilidad real de la aplicación no siempre son exactamente la misma cosa.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá un `compose.yaml` con este contenido:

```yaml
services:
  web:
    image: nginx
    ports:
      - "8080:80"

  api:
    build: ./api
    ports:
      - "3000:3000"
    environment:
      DB_HOST: db
      DB_NAME: appdb
      DB_USER: postgres
      DB_PASSWORD: mysecretpassword
    depends_on:
      - db

  db:
    image: postgres:18
    environment:
      POSTGRES_PASSWORD: mysecretpassword
      POSTGRES_DB: appdb
    volumes:
      - postgres_data:/var/lib/postgresql

volumes:
  postgres_data:
```

### Ejercicio 2
Respondé con tus palabras:

- qué servicio usa `image`
- qué servicio usa `build`
- qué servicio publica el puerto `8080`
- qué servicio publica el puerto `3000`
- qué servicio persiste datos
- qué servicio depende de `db`

### Ejercicio 3
Respondé además:

- ¿por qué `db` probablemente no necesita `ports`?
- ¿por qué `api` sí podría necesitar `build`?
- ¿qué rol cumplen las variables `DB_HOST`, `DB_NAME`, `DB_USER` y `DB_PASSWORD`?

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué servicios tendría
- cuáles usarían `image`
- cuáles usarían `build`
- cuáles necesitarían `ports`
- cuáles necesitarían `volumes`
- cuáles dependerían de otros

No hace falta escribir el YAML completo todavía.
La idea es aprender a pensar el stack.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué parte te ayuda más a decidir entre `image` y `build`?
- ¿qué servicios de una app real suelen exponer puertos y cuáles no?
- ¿por qué te sirve pensar cada servicio por responsabilidad?
- ¿qué valor práctico tiene que toda esta información quede en un solo archivo?
- ¿qué parte de este tema te acerca más a describir un stack real tuyo?

Estas observaciones valen mucho más que repetir sintaxis.

---

## Mini desafío

Intentá explicar con tus palabras esta idea:

> en Compose, cada servicio debería declarar solo lo que realmente necesita: imagen o build, puertos si corresponde, variables si corresponde y almacenamiento si corresponde.

Y además respondé:

- ¿por qué eso vuelve más claro el stack?
- ¿qué errores evita respecto a poner “todo en todos los servicios”?
- ¿qué servicio tuyo describirías primero con `build`?
- ¿qué dependencia de tus proyectos describirías primero con `image`?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- distinguir cuándo usar `image` y cuándo usar `build`
- declarar puertos, variables y volúmenes dentro de un servicio
- entender mejor cómo describir cada componente del stack
- leer un archivo Compose más realista sin perderte
- prepararte para levantar un stack más propio en los próximos temas

---

## Resumen del tema

- Un servicio en Compose representa un componente de la aplicación. citeturn334449search0turn334449search5
- `image` sirve para usar una imagen ya existente. citeturn334449search0
- `build` sirve para construir una imagen desde tu proyecto local. citeturn334449search2
- `ports`, `environment`, `volumes` y `depends_on` ayudan a describir con más precisión cada servicio. citeturn334449search0turn334449search12turn334449search3
- Pensar bien cada servicio hace que el stack quede mucho más claro y mantenible.
- Este tema te da una base muy buena para empezar a modelar aplicaciones reales con Compose.

---

## Próximo tema

En el próximo tema vas a empezar a usar Compose en un ejemplo más cercano a la vida real:

- app + base + tal vez un servicio auxiliar
- levantar el stack
- ver redes y volúmenes creados por Compose
- empezar a sentir el flujo completo de una mini aplicación
