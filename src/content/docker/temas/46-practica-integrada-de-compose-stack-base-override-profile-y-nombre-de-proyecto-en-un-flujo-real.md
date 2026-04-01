---
title: "Práctica integrada de Compose: stack base, override, profile y nombre de proyecto en un flujo real"
description: "Tema 46 del curso práctico de Docker: una práctica integrada de Docker Compose donde combinás compose.yaml, compose.override.yaml, profiles, docker compose config y un project name explícito para trabajar con un stack mucho más cercano a un entorno real."
order: 46
module: "Docker Compose como herramienta central"
level: "intermedio"
draft: false
---

# Práctica integrada de Compose: stack base, override, profile y nombre de proyecto en un flujo real

## Objetivo del tema

En este tema vas a:

- juntar en una sola práctica varias herramientas importantes de Compose
- usar un archivo base y un override de desarrollo
- activar un servicio opcional con profiles
- inspeccionar la configuración final con `docker compose config`
- usar un nombre de proyecto explícito para evitar choques
- trabajar de una forma mucho más parecida a un proyecto real

La idea es cerrar este gran bloque de Compose con una práctica integrada donde todo lo anterior empiece a sentirse conectado.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. crear un stack base con `compose.yaml`
2. agregar un `compose.override.yaml` para desarrollo
3. marcar un servicio auxiliar como opcional con `profiles`
4. usar `.env` para interpolar parte de la configuración
5. renderizar la configuración final con `docker compose config`
6. levantar el stack con un project name explícito
7. activar el servicio opcional solo cuando lo necesites
8. bajar el stack sin pisar otros proyectos

---

## Idea central que tenés que llevarte

Compose se vuelve realmente poderoso cuando dejás de usarlo solo para “levantar dos servicios” y empezás a combinar varias capas:

- una base clara
- ajustes locales de desarrollo
- servicios opcionales
- un nombre de proyecto explícito
- una forma de inspeccionar el resultado final antes de correr nada

Dicho simple:

> un stack Compose profesional no es solo un `compose.yaml` suelto,  
> sino una forma ordenada de combinar base, entorno, opcionales y nombres de proyecto sin duplicar todo.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker Compose sostiene varias ideas que se unen directamente en esta práctica:

- por defecto, Compose lee un `compose.yaml` y opcionalmente un `compose.override.yaml`, fusionándolos según reglas de merge. citeturn619556search1turn619556search5
- los servicios con `profiles` solo se activan cuando habilitás ese profile; los que no tienen `profiles` quedan habilitados por defecto. citeturn619556search7
- `docker compose config` renderiza el modelo final ya fusionado y con variables resueltas. citeturn619556search18turn619556search10
- Compose crea una red por defecto para la app, conecta ahí los servicios y los hace alcanzables por nombre. citeturn619556search2turn619556search8
- el project name puede fijarse con `-p`, `COMPOSE_PROJECT_NAME` o `name:`, y usar nombres distintos permite correr varias copias del mismo stack sin conflicto. citeturn619556search4turn619556search0turn619556search21

---

## Qué problema práctico vas a resolver

Imaginá este caso:

### Siempre querés
- `web`
- `db`

### En desarrollo querés además
- bind mount del contenido web
- una variable de entorno más explícita
- una experiencia cómoda para editar y recargar

### A veces querés sumar
- un panel auxiliar como `adminer`

### Además querés
- que este stack no choque con otros stacks Compose en la misma máquina

Si resolvés todo eso de forma desordenada, el proyecto puede volverse difícil de mantener.

Este tema te muestra una forma mucho más limpia.

---

## Estructura del ejemplo

Vas a trabajar con esta estructura:

```text
compose-practica-integrada/
├── .env
├── compose.yaml
├── compose.override.yaml
└── web/
    └── index.html
```

---

## Paso 1: crear el archivo .env

Creá un archivo llamado:

```text
.env
```

Con este contenido:

```env
WEB_PORT=8080
DB_NAME=appdb
DB_USER=postgres
DB_PASSWORD=mysecretpassword
```

### Qué rol cumple

Este archivo te ayuda a interpolar valores dentro de la configuración Compose.

No hace falta meter todo acá.
Solo lo que te convenga parametrizar o reutilizar.

---

## Paso 2: crear el contenido web

Creá este archivo:

```text
web/index.html
```

Con algo simple como esto:

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Práctica integrada de Compose</title>
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
        max-width: 760px;
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
      <h1>Práctica integrada de Docker Compose</h1>
      <p>Este contenido está siendo servido por <code>web</code> dentro del stack.</p>
      <p>La app corre junto a una base de datos y un servicio auxiliar opcional.</p>
    </main>
  </body>
</html>
```

---

## Paso 3: crear el archivo base

Creá un archivo llamado:

```text
compose.yaml
```

Con este contenido:

```yaml
services:
  web:
    image: nginx
    ports:
      - "${WEB_PORT}:80"

  db:
    image: postgres:18
    environment:
      POSTGRES_DB: "${DB_NAME}"
      POSTGRES_USER: "${DB_USER}"
      POSTGRES_PASSWORD: "${DB_PASSWORD}"
    volumes:
      - postgres_data:/var/lib/postgresql

  admin:
    image: adminer
    ports:
      - "8081:8080"
    profiles:
      - tools

volumes:
  postgres_data:
```

---

## Cómo se lee el archivo base

La lectura conceptual sería:

- `web` forma parte del stack base y publica su puerto al host
- `db` también forma parte del stack base y persiste datos en un volumen
- `admin` existe en el mismo archivo, pero no se levanta por defecto porque está detrás del profile `tools`

Esto ya te da un stack base muy razonable.

---

## Paso 4: crear el override de desarrollo

Ahora creá:

```text
compose.override.yaml
```

Con este contenido:

```yaml
services:
  web:
    environment:
      APP_ENV: development
    volumes:
      - ./web:/usr/share/nginx/html:ro
```

---

## Cómo se lee el override

La idea es simple:

- no redefine todo el stack
- solo ajusta el servicio `web` para desarrollo local
- agrega una variable útil
- monta el contenido del host para que puedas editar sin rebuild

Esto encaja perfecto con la convención oficial de usar `compose.override.yaml` para cambios locales o de desarrollo. citeturn619556search1

---

## Qué está resolviendo cada capa

### `.env`
parametriza parte de la configuración.

### `compose.yaml`
define la base del stack.

### `compose.override.yaml`
ajusta la base para desarrollo local.

### `profiles`
activan o no servicios opcionales.

Esta combinación ya se parece mucho a cómo se trabaja en proyectos reales.

---

## Paso 5: ver el resultado final antes de correr nada

Ahora ejecutá:

```bash
docker compose config
```

### Qué hace

`docker compose config` te muestra cómo quedó la configuración final después de:

- interpolar variables
- fusionar el archivo base y el override
- resolver el modelo Compose resultante

Esto es excelente para dejar de adivinar qué stack real se va a aplicar. Docker lo documenta justo como la forma de renderizar el modelo final. citeturn619556search10turn619556search18

---

## Qué deberías observar

Deberías ver que:

- `web` sigue usando la imagen `nginx`
- `web` conserva el puerto del archivo base
- `web` ahora además tiene `APP_ENV=development`
- `web` ahora además tiene el bind mount a `./web`
- `db` conserva su volumen y sus variables
- `admin` sigue existiendo en el archivo, pero su profile no cambia el hecho de que el servicio está declarado

Esto te deja verificar la combinación final antes de ejecutar nada.

---

## Paso 6: levantar el stack con un nombre de proyecto explícito

Ahora ejecutá:

```bash
docker compose -p tienda-dev up -d
```

### Por qué usar -p acá

La documentación oficial remarca que `-p` define explícitamente el project name y te permite correr varias copias del mismo stack sin conflictos. citeturn619556search4turn619556search21

En este caso, `tienda-dev` te da una identidad clara para:

- contenedores
- red del proyecto
- volumen del proyecto

y te evita choques con otras composiciones que tengas corriendo.

---

## Paso 7: comprobar qué servicios subieron

Ahora ejecutá:

```bash
docker compose -p tienda-dev ps
```

### Qué deberías ver

Como no activaste el profile `tools`, deberían estar corriendo:

- `web`
- `db`

Y no debería estar corriendo:

- `admin`

Docker documenta que los servicios sin profile arrancan por defecto, mientras que los que tienen `profiles` solo lo hacen si los activás. citeturn619556search7

---

## Paso 8: probar el servicio web

Abrí en el navegador:

```text
http://localhost:8080
```

Deberías ver tu página.

Además, como `web` tiene bind mount en el override, si modificás `web/index.html` y recargás, deberías ver el cambio sin rebuild.

Esto te muestra un flujo de desarrollo muy cómodo dentro del mismo stack.

---

## Paso 9: activar el servicio opcional

Ahora ejecutá:

```bash
docker compose -p tienda-dev --profile tools up -d
```

### Qué cambia

Ahora sí debería levantarse también:

- `admin`

Podés comprobarlo con:

```bash
docker compose -p tienda-dev ps
```

Y abrir:

```text
http://localhost:8081
```

Esto demuestra que el servicio opcional está integrado al mismo archivo, pero no ensucia el arranque básico del stack.

---

## Qué red creó Compose

Docker documenta que Compose crea una red por defecto para la app y que los servicios en esa red pueden alcanzarse por su nombre. citeturn619556search2turn619556search8

Eso significa que dentro del stack:

- `db` es resolvible como hostname
- `web` también
- `admin` también, cuando está activo

Y no necesitaste crear una red a mano.

---

## Qué rol juega el project name en esta práctica

El project name explícito `tienda-dev` ayuda a:

- separar este stack de otros
- darle nombres consistentes a los recursos
- evitar choques si corrés más de una copia
- identificar más fácil el proyecto cuando usás `docker compose ls`

Esto es especialmente útil si más adelante querés correr algo como:

- `tienda-dev`
- `tienda-demo`
- `tienda-test`

usando el mismo archivo base.

---

## Ver proyectos activos

Ahora probá:

```bash
docker compose ls
```

Docker documenta `docker compose ls` como el comando para listar los proyectos Compose activos. citeturn619556search10turn619556search21

Si solo levantaste este stack, deberías ver algo asociado a `tienda-dev`.

---

## Qué demuestra esta práctica

Demuestra que ya podés combinar varias herramientas importantes de Compose de forma coherente:

- stack base
- override de desarrollo
- profile opcional
- variables con `.env`
- `docker compose config`
- project name explícito
- red por defecto del proyecto
- volumen persistente de la base

Y todo esto sin tener que duplicar el stack completo ni meter todo mezclado en un único archivo caótico.

---

## Cuándo conviene mucho esta forma de trabajo

Conviene mucho cuando:

- el stack base es bastante estable
- querés desarrollo local cómodo
- querés uno o dos servicios auxiliares opcionales
- querés evitar choques entre stacks
- querés poder inspeccionar el resultado final antes de levantarlo

No reemplaza todos los demás patrones, pero es un enfoque excelente para muchísimos proyectos reales pequeños o medianos.

---

## Qué no tenés que confundir

### El override no “vive solo”
Se entiende siempre en relación al archivo base.

### El profile no es otro entorno completo
Solo activa servicios opcionales.

### docker compose config no levanta nada
Solo renderiza el modelo final.

### El project name no cambia el contenido del stack
Cambia la identidad con la que Compose crea y agrupa sus recursos.

---

## Error común 1: usar un profile cuando en realidad necesitabas cambiar mucha configuración

Ahí suele convenir más un override o un archivo Compose adicional.

---

## Error común 2: duplicar todo el stack entre base y override

Eso te hace perder el beneficio principal del merge.

---

## Error común 3: no usar project name explícito cuando querés correr más de una copia

Eso puede llevar a reutilizar o chocar con recursos del mismo proyecto.

---

## Error común 4: no revisar docker compose config antes de asumir que el merge quedó como imaginabas

Es una herramienta muy práctica para ahorrarte errores tontos.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá estos archivos:

#### `.env`

```env
WEB_PORT=8080
DB_NAME=appdb
DB_USER=postgres
DB_PASSWORD=mysecretpassword
```

#### `compose.yaml`

```yaml
services:
  web:
    image: nginx
    ports:
      - "${WEB_PORT}:80"

  db:
    image: postgres:18
    environment:
      POSTGRES_DB: "${DB_NAME}"
      POSTGRES_USER: "${DB_USER}"
      POSTGRES_PASSWORD: "${DB_PASSWORD}"
    volumes:
      - postgres_data:/var/lib/postgresql

  admin:
    image: adminer
    ports:
      - "8081:8080"
    profiles:
      - tools

volumes:
  postgres_data:
```

#### `compose.override.yaml`

```yaml
services:
  web:
    environment:
      APP_ENV: development
    volumes:
      - ./web:/usr/share/nginx/html:ro
```

### Ejercicio 2
Ejecutá:

```bash
docker compose config
```

Y respondé:

- qué parte viene del archivo base
- qué parte agrega el override
- qué servicio está detrás de un profile
- qué valores llegaron interpolados desde `.env`

### Ejercicio 3
Levantá el stack con un nombre explícito:

```bash
docker compose -p tienda-dev up -d
```

### Ejercicio 4
Verificá el estado:

```bash
docker compose -p tienda-dev ps
docker compose ls
```

### Ejercicio 5
Probá la web en:

```text
http://localhost:8080
```

### Ejercicio 6
Activá el profile opcional:

```bash
docker compose -p tienda-dev --profile tools up -d
```

### Ejercicio 7
Volvé a revisar:

```bash
docker compose -p tienda-dev ps
```

### Ejercicio 8
Respondé con tus palabras:

- por qué `admin` no arrancó al principio
- qué te aporta el override de desarrollo
- qué te aporta el project name explícito
- por qué esta forma de trabajo te parece más limpia que un solo archivo enorme

### Ejercicio 9
Bajá el stack:

```bash
docker compose -p tienda-dev down
```

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué dejarías siempre en el archivo base
- qué moverías a un override de desarrollo
- qué servicio harías opcional con profile
- qué nombre de proyecto usarías para dev, demo y test
- qué te gustaría verificar con `docker compose config` antes de levantar nada

No hace falta escribir el stack definitivo.
La idea es que imagines una forma de trabajo más profesional.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué parte de esta práctica te pareció más útil para proyectos reales?
- ¿qué tan clara te quedó la diferencia entre base, override y profile?
- ¿qué valor práctico le ves a `docker compose config`?
- ¿por qué el project name te parece importante en cuanto querés más de un stack?
- ¿qué parte de tus proyectos se beneficiaría mucho de esta estructura?

Estas observaciones valen mucho más que repetir los comandos.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> La base del stack conviene dejarla en ________.  
> Los ajustes locales o de desarrollo conviene ponerlos en ________.  
> Los servicios opcionales conviene activarlos con ________.  
> Y si quiero que el stack no choque con otros, conviene fijar un ________.

Y además respondé:

- ¿por qué esta combinación te parece más cercana a un entorno real?
- ¿qué parte te da más control sin volver todo más pesado?
- ¿qué servicio opcional te gustaría introducir primero en uno de tus proyectos?
- ¿qué te gustaría seguir aprendiendo después de cerrar este bloque de Compose?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- combinar base, override, profiles y project name sin confundirte
- usar `docker compose config` para inspeccionar la configuración final
- levantar un stack más flexible y realista
- evitar choques entre composiciones paralelas
- trabajar con Compose de una forma mucho más madura y ordenada

---

## Resumen del tema

- Compose puede combinar archivo base y override por defecto. citeturn619556search1
- Los profiles permiten activar servicios opcionales sin multiplicar archivos. citeturn619556search7
- `docker compose config` renderiza el modelo final combinado y resuelto. citeturn619556search10turn619556search18
- Compose crea una red por defecto donde los servicios se alcanzan por nombre. citeturn619556search2turn619556search8
- Un project name explícito evita choques y hace más fácil correr varias copias del mismo stack. citeturn619556search4turn619556search21
- Esta práctica junta varias piezas importantes del bloque de Compose en un flujo mucho más realista.

---

## Próximo tema

En el próximo bloque vas a empezar a moverte hacia una etapa todavía más cercana a uso profesional:

- imágenes propias dentro de Compose
- build más serio
- etiquetado
- publicación
- y transición hacia flujos más cercanos a despliegue real
