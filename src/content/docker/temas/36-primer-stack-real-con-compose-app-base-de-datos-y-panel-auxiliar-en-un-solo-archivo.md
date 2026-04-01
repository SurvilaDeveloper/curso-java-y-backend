---
title: "Primer stack real con Compose: app, base de datos y panel auxiliar en un solo archivo"
description: "Tema 36 del curso práctico de Docker: cómo armar un stack Compose más realista con una app web, una base de datos y un servicio auxiliar, entendiendo cómo Compose crea la red del proyecto, conecta servicios por nombre y monta volúmenes de persistencia."
order: 36
module: "Docker Compose como herramienta central"
level: "base"
draft: false
---

# Primer stack real con Compose: app, base de datos y panel auxiliar en un solo archivo

## Objetivo del tema

En este tema vas a:

- armar un stack Compose más parecido a una aplicación real
- levantar varios servicios desde un único `compose.yaml`
- ver cómo Compose crea la red del proyecto y conecta servicios por nombre
- persistir la base de datos con un volumen
- entender mejor cómo encajan servicios, red, puertos y almacenamiento dentro del mismo archivo

La idea es que dejes atrás los ejemplos mínimos y empieces a sentir cómo se ve un stack real, aunque todavía sea chico.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. crear un `compose.yaml` con tres servicios
2. levantar una app web simple
3. levantar una base de datos PostgreSQL
4. agregar un servicio auxiliar de administración
5. usar la red por defecto de Compose
6. comprobar que los servicios del stack se entienden por nombre
7. ver qué recursos crea Compose automáticamente

---

## Idea central que tenés que llevarte

Cuando una app ya no vive sola, Compose empieza a mostrar muchísimo valor.

En vez de pensar así:

- un `docker run` para la app
- otro para la base
- otro para una herramienta auxiliar
- otro comando para la red
- otro para el volumen

podés pensar así:

> este archivo describe todo el stack  
> y Compose se encarga de levantarlo como una unidad

Esa forma de trabajo es mucho más clara y mucho más cercana a un proyecto real.

---

## Qué stack vas a armar

Vas a usar tres servicios:

- `web`: una app web simple servida con Nginx
- `db`: PostgreSQL con persistencia
- `admin`: un panel auxiliar para explorar o administrar la base

No hace falta que la app web hable todavía con la base a nivel lógica de aplicación.
Lo importante es ver cómo conviven los servicios dentro del mismo stack y cómo Compose los organiza.

---

## Estructura de la carpeta

Creá una carpeta, por ejemplo:

```bash
mkdir practica-compose-stack
cd practica-compose-stack
```

Y adentro vas a tener algo así:

```text
practica-compose-stack/
├── compose.yaml
└── web/
    └── index.html
```

---

## Paso 1: crear el archivo HTML de la app web

Creá la carpeta y el archivo:

```bash
mkdir web
```

Archivo:

```text
web/index.html
```

Contenido sugerido:

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mi stack con Compose</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        font-family: Arial, sans-serif;
        background: #0f172a;
        color: #e2e8f0;
      }

      .card {
        max-width: 720px;
        padding: 2rem;
        border-radius: 18px;
        background: #1e293b;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
      }

      h1 {
        margin-top: 0;
        color: #38bdf8;
      }

      code {
        background: #020617;
        padding: 0.2rem 0.45rem;
        border-radius: 6px;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <h1>Mi primer stack real con Docker Compose</h1>
      <p>
        Esta página está servida por <code>nginx</code> dentro del servicio
        <code>web</code>.
      </p>
      <p>
        En este mismo stack también viven una base de datos PostgreSQL y un
        servicio auxiliar.
      </p>
    </main>
  </body>
</html>
```

---

## Paso 2: crear el compose.yaml

Ahora creá un archivo llamado:

```text
compose.yaml
```

Con este contenido:

```yaml
services:
  web:
    image: nginx
    ports:
      - "8080:80"
    volumes:
      - ./web:/usr/share/nginx/html:ro

  db:
    image: postgres:18
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: mysecretpassword
    volumes:
      - postgres_data:/var/lib/postgresql

  admin:
    image: adminer
    ports:
      - "8081:8080"
    depends_on:
      - db

volumes:
  postgres_data:
```

---

## Cómo se lee este archivo

La lectura conceptual sería:

- el servicio `web` usa Nginx y publica `8080:80`
- el servicio `web` monta la carpeta `./web` como solo lectura dentro de la ruta estática de Nginx
- el servicio `db` usa PostgreSQL 18
- `db` recibe variables para inicializar la base
- `db` persiste sus datos en un volumen llamado `postgres_data`
- el servicio `admin` usa una imagen lista para dar una interfaz auxiliar
- `admin` publica `8081:8080`
- `admin` depende de `db`

Esto ya se parece bastante a un stack real.

---

## Qué partes del stack son importantes

### `web`
Representa la parte visible desde el navegador.

### `db`
Representa el servicio de datos que querés mantener interno y persistente.

### `admin`
Representa una herramienta auxiliar del stack.

Esto es muy útil porque te acostumbra a pensar que una app real no es solo “la app”, sino también sus componentes de soporte.

---

## Por qué este ejemplo es valioso

Porque une varias cosas que venís viendo por separado:

- servicio con `image`
- puertos publicados
- bind mount para archivos del host
- volumen para persistencia
- dependencia entre servicios
- stack definido en un único archivo

Eso lo convierte en un muy buen ejercicio puente hacia Compose más serio.

---

## Paso 3: levantar el stack

Ejecutá:

```bash
docker compose up -d
```

---

## Qué deberías ver

Compose debería:

- crear la red del proyecto
- crear el volumen `postgres_data`
- crear los servicios `web`, `db` y `admin`
- dejarlos corriendo en segundo plano

Podés comprobarlo con:

```bash
docker compose ps
```

---

## Paso 4: probar la app web

Abrí en el navegador:

```text
http://localhost:8080
```

Deberías ver tu página HTML servida por Nginx.

---

## Paso 5: probar el panel auxiliar

Abrí también:

```text
http://localhost:8081
```

Deberías ver la interfaz del servicio auxiliar.

En este ejemplo, el valor más importante no es explorar todas sus opciones, sino comprobar que el stack levantó más de un servicio útil desde el mismo archivo.

---

## Qué red creó Compose

Compose crea una red por defecto para el proyecto y conecta ahí todos los servicios, haciéndolos alcanzables por nombre. Eso significa que dentro del stack, `db` es resolvible como hostname por los demás servicios. citeturn805018search1turn805018search2turn805018search6

Por eso este archivo puede usar:

- `db` como nombre del servicio de base
- `web` como nombre del servicio web
- `admin` como nombre del panel auxiliar

sin que tengas que crear una red manual a mano.

---

## Qué volumen creó Compose

El bloque:

```yaml
volumes:
  postgres_data:
```

hace que Compose cree un volumen nombrado para la base. La especificación y la referencia oficial indican que los volúmenes pueden definirse a nivel superior y luego darse a los servicios que los necesiten. citeturn915706search4turn805018search6

Eso significa que `db` ya no depende solo de la vida efímera del contenedor para conservar información.

---

## Qué servicio está expuesto al host y cuál no

En este stack:

### `web`
sí está expuesto al host con:

```yaml
ports:
  - "8080:80"
```

### `admin`
también está expuesto con:

```yaml
ports:
  - "8081:8080"
```

### `db`
no está expuesto al host

Y eso está bien.
Porque `db` puede seguir siendo accesible desde otros servicios del stack por red interna, sin necesidad de publicar el puerto al host.

Esta separación es muy importante y muy saludable para pensar aplicaciones reales. Compose conecta servicios por nombre dentro de su red por defecto, así que no necesitás publicar todo. citeturn805018search1turn805018search5

---

## Qué demuestra este stack

Demuestra que Compose te deja definir en un solo archivo:

- servicios públicos
- servicios internos
- persistencia
- mounts
- dependencias
- una red compartida

Y todo eso con una lectura mucho más razonable que una lista larga de comandos.

---

## Qué pasa si cambiás el HTML

Como `web` está usando un bind mount:

```yaml
- ./web:/usr/share/nginx/html:ro
```

si cambiás `web/index.html` en tu host y recargás `http://localhost:8080`, deberías ver el cambio sin rebuild.

Esto también te muestra que dentro del mismo stack puede convivir:

- persistencia administrada por volumen para la base
- compartición dinámica de archivos del host para la app web

Esa combinación es muy común en desarrollo.

---

## Qué no tenés que confundir

### Que Compose cree la red por vos no significa que la red “no exista”
Sí existe, solo que ya no la tuviste que crear manualmente.

### Que `db` no tenga ports no significa que esté aislado de todo
Sigue siendo alcanzable por los otros servicios del stack.

### Bind mount y volumen siguen siendo cosas distintas dentro de Compose
Uno comparte una ruta del host.
El otro persiste datos administrados por Docker.

### `depends_on` no significa magia total de readiness
Ayuda a expresar dependencia y orden de creación, pero no conviene asumir que eso resuelve por sí solo toda la disponibilidad lógica de la app. La referencia oficial lo documenta como una ayuda para orden de inicio y apagado. citeturn195798search0

---

## Error común 1: publicar también la base “por las dudas”

No siempre hace falta.

Si la base solo la usan otros servicios del stack, puede quedarse interna.

---

## Error común 2: pensar que todo tiene que usar build

No.

En este stack hay servicios que usan imágenes ya hechas y eso está perfecto.

---

## Error común 3: no distinguir almacenamiento de código compartido

En el mismo archivo tenés:

- `./web:/usr/share/nginx/html:ro` → bind mount
- `postgres_data:/var/lib/postgresql` → volumen nombrado

Cumplen roles distintos.

---

## Error común 4: creer que si el stack baja, perdés necesariamente los datos

No.

Mientras no elimines el volumen, la persistencia de `db` puede seguir ahí.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá la estructura:

```text
practica-compose-stack/
├── compose.yaml
└── web/
    └── index.html
```

### Ejercicio 2
Poné el `index.html` con contenido propio.

### Ejercicio 3
Creá este `compose.yaml`:

```yaml
services:
  web:
    image: nginx
    ports:
      - "8080:80"
    volumes:
      - ./web:/usr/share/nginx/html:ro

  db:
    image: postgres:18
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: mysecretpassword
    volumes:
      - postgres_data:/var/lib/postgresql

  admin:
    image: adminer
    ports:
      - "8081:8080"
    depends_on:
      - db

volumes:
  postgres_data:
```

### Ejercicio 4
Levantá el stack:

```bash
docker compose up -d
```

### Ejercicio 5
Verificá el estado:

```bash
docker compose ps
```

### Ejercicio 6
Abrí:

```text
http://localhost:8080
http://localhost:8081
```

### Ejercicio 7
Respondé con tus palabras:

- qué servicio usa bind mount
- qué servicio usa volumen
- qué servicio queda interno
- por qué `db` puede seguir siendo útil sin publicar puertos
- qué valor práctico tiene que todo esté en un solo archivo

### Ejercicio 8
Cuando termines, apagá el stack:

```bash
docker compose down
```

---

## Segundo ejercicio de análisis

Pensá en una aplicación tuya y respondé:

- qué sería tu `web`
- qué sería tu `db`
- qué servicio auxiliar podrías tener
- qué servicios publicarías al host
- cuáles dejarías internos
- qué guardarías en un volumen
- qué compartirías con un bind mount durante desarrollo

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué parte del stack te resultó más clara al verla toda junta?
- ¿qué valor práctico viste en que Compose cree la red por defecto?
- ¿por qué este ejemplo ya se siente bastante más “real”?
- ¿qué diferencia viste entre servicio público e interno?
- ¿cómo te ayuda este ejercicio a imaginar tu propio stack?

Estas observaciones valen mucho más que solo hacer que arranque.

---

## Mini desafío

Intentá explicar con tus palabras esta idea:

> Un stack Compose real no es solo “varios contenedores juntos”, sino varios servicios con roles distintos: algunos públicos, otros internos, algunos con bind mounts, otros con volúmenes, todos definidos de forma coherente en un mismo archivo.

Y además respondé:

- ¿qué valor práctico tiene separar servicios públicos de servicios internos?
- ¿qué te aporta que Compose cree y conecte la red del proyecto?
- ¿qué parte de este ejemplo te parece más cercana a tus proyectos?
- ¿qué te gustaría refinar después de esta primera versión del stack?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- leer y levantar un stack Compose más realista
- distinguir servicios públicos e internos
- combinar bind mounts y volúmenes dentro del mismo archivo
- entender mejor cómo Compose organiza red y almacenamiento
- preparar el terreno para stacks todavía más completos en los próximos temas

---

## Resumen del tema

- Compose permite definir stacks más realistas con varios servicios en un solo archivo. citeturn806403search0turn806403search1
- Por defecto crea una red del proyecto y los servicios pueden alcanzarse por su nombre. citeturn805018search1turn805018search2
- En un mismo stack pueden convivir bind mounts para desarrollo y volúmenes para persistencia.
- No todo servicio necesita publicarse al host; los servicios internos pueden quedarse solo en la red de Compose. citeturn805018search1turn805018search5
- Este tema junta muchas piezas del curso en un ejemplo bastante cercano a una mini aplicación real.

---

## Próximo tema

En el próximo tema vas a seguir profundizando en el flujo Compose del día a día:

- reconstrucción de servicios
- cuándo hace falta rebuild
- cuándo alcanza con reiniciar
- cómo iterar más rápido sobre un stack que ya está corriendo
