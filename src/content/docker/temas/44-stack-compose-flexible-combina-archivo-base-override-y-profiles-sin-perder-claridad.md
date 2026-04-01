---
title: "Stack Compose flexible: combiná archivo base, override y profiles sin perder claridad"
description: "Tema 44 del curso práctico de Docker: cómo combinar compose.yaml, compose.override.yaml y profiles para construir un stack flexible, entendible y cómodo para desarrollo sin duplicar archivos ni mezclar toda la configuración en un solo lugar."
order: 44
module: "Docker Compose como herramienta central"
level: "intermedio"
draft: false
---

# Stack Compose flexible: combiná archivo base, override y profiles sin perder claridad

## Objetivo del tema

En este tema vas a:

- combinar un archivo Compose base con un override de desarrollo
- usar profiles para servicios opcionales
- entender mejor cuándo conviene cada herramienta
- inspeccionar la configuración resultante antes de levantar el stack
- construir un stack más cercano a un proyecto real sin volverlo caótico

La idea es que empieces a trabajar con Compose en capas, pero de una forma controlada y fácil de leer.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. crear un `compose.yaml` base
2. agregar un `compose.override.yaml` para desarrollo
3. marcar un servicio auxiliar con `profiles`
4. inspeccionar la configuración combinada con `docker compose config`
5. levantar el stack base
6. levantar el stack base más el servicio opcional
7. entender por qué esta combinación es tan útil

---

## Idea central que tenés que llevarte

Cuando un stack empieza a crecer, conviene separar tres tipos de decisiones:

- qué forma parte de la base del proyecto
- qué solo querés ajustar para desarrollo
- qué servicios son opcionales y no querés levantar siempre

Compose te deja resolver esto sin duplicar todo el archivo.

Dicho simple:

> `compose.yaml` define la base  
> `compose.override.yaml` ajusta esa base  
> y `profiles` activan piezas opcionales solo cuando las necesitás

Esta combinación te da mucha flexibilidad sin perder claridad.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker Compose indica que, por defecto, Compose usa `compose.yaml` y opcionalmente `compose.override.yaml`, y que ambos se fusionan siguiendo reglas de merge donde los archivos posteriores pueden sobrescribir o ampliar al archivo base. También explica que los profiles permiten activar servicios opcionales de forma selectiva, mientras que los servicios sin `profiles` quedan habilitados por defecto. Además, `docker compose config` renderiza la configuración final ya combinada y con variables resueltas, lo que lo vuelve ideal para verificar qué stack real vas a aplicar antes de levantarlo. citeturn763429search0turn763429search5turn763429search6turn763429search4turn763429search12

---

## Qué problema práctico vas a resolver

Imaginá este escenario:

### Siempre querés
- `web`
- `db`

### En desarrollo querés además
- bind mount del código
- `APP_ENV=development`

### A veces querés sumar
- un panel auxiliar como `adminer`

Si ponés todo eso en un solo archivo, el stack queda mezclado.
Si duplicás todo el stack en dos archivos grandes, también se vuelve molesto.

Este tema te muestra una forma más equilibrada.

---

## Estructura del ejemplo

Vas a trabajar con estos archivos:

```text
mi-stack-flexible/
├── compose.yaml
├── compose.override.yaml
├── .env
└── web/
    └── index.html
```

---

## Paso 1: crear el .env

Creá un archivo:

```text
.env
```

Con esto:

```env
WEB_PORT=8080
DB_NAME=appdb
DB_USER=postgres
DB_PASSWORD=mysecretpassword
```

Este archivo te sirve para interpolar valores del stack.

---

## Paso 2: crear el contenido web

Creá:

```text
web/index.html
```

Con algo simple como esto:

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Stack flexible con Compose</title>
  </head>
  <body>
    <h1>Stack Compose flexible</h1>
    <p>Este contenido viene desde el archivo base más el override de desarrollo.</p>
  </body>
</html>
```

---

## Paso 3: crear el archivo base

Archivo:

```text
compose.yaml
```

Contenido:

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

- `web` y `db` forman la base del stack
- `web` expone el puerto definido en `.env`
- `db` usa variables interpoladas desde `.env`
- `db` persiste datos en `postgres_data`
- `admin` existe en el mismo archivo, pero solo se activará si habilitás el profile `tools`

Esto ya te da un stack claro y flexible.

---

## Paso 4: crear el override de desarrollo

Archivo:

```text
compose.override.yaml
```

Contenido:

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

La idea es:

- no cambia todo el stack
- solo ajusta `web` para desarrollo
- agrega una variable de entorno útil
- monta el contenido web local como bind mount de solo lectura

Esto es exactamente el tipo de cosa que suele tener sentido en un override de desarrollo.

---

## Qué está resolviendo cada capa

### compose.yaml
Define lo esencial del stack.

### compose.override.yaml
Ajusta el stack para el entorno local de desarrollo.

### profile `tools`
Activa o no un servicio auxiliar sin duplicar archivos.

Esta división de responsabilidades hace que el proyecto sea mucho más legible.

---

## Ver la configuración final antes de levantar nada

Ahora ejecutá:

```bash
docker compose config
```

---

## Qué hace

La documentación oficial de Docker indica que `docker compose config` renderiza el modelo final que se le aplicará a Docker Engine, fusionando los archivos indicados con `-f`, resolviendo variables e incluso expandiendo ciertas sintaxis cortas. citeturn763429search12

En este caso, te va a mostrar el stack base más el override ya combinados.

---

## Qué deberías observar

Deberías notar cosas como estas:

- `web` conserva su imagen y puerto del archivo base
- `web` ahora además tiene `APP_ENV=development`
- `web` ahora además tiene el bind mount de `./web`
- `db` sigue igual
- `admin` aparece en la configuración, pero su uso depende del profile

Esto es muy valioso porque te deja verificar mentalmente el stack real antes de levantarlo.

---

## Paso 5: levantar solo la base del stack

Ahora ejecutá:

```bash
docker compose up -d
```

---

## Qué debería levantarse

Como `admin` tiene un profile y no lo activaste, deberían levantarse:

- `web`
- `db`

Y no debería levantarse:

- `admin`

La documentación oficial es clara: los servicios sin profile están habilitados por defecto; los que tienen `profiles` solo arrancan cuando activás ese profile. citeturn763429search4

---

## Paso 6: comprobar el resultado

Podés usar:

```bash
docker compose ps
```

Y también abrir:

```text
http://localhost:8080
```

Deberías ver el HTML de tu carpeta `web`, porque el override agregó el bind mount a `web`.

---

## Paso 7: levantar también el servicio opcional

Ahora probá:

```bash
docker compose --profile tools up -d
```

---

## Qué cambia

Ahora sí debería levantarse también:

- `admin`

Podés comprobarlo con:

```bash
docker compose ps
```

Y abrir:

```text
http://localhost:8081
```

Esto te demuestra una idea muy potente:

- el stack base sigue siendo el mismo
- el entorno de desarrollo sigue aplicándose
- el servicio auxiliar entra solo cuando vos lo pedís

---

## Qué ventaja te da docker compose config en este flujo

Te da una herramienta muy buena para dejar de adivinar.

En vez de pensar:

> “Creo que Compose va a combinar esto como yo imagino...”

podés verificar la configuración final antes de correr nada.

Eso te ahorra muchísima confusión cuando ya empezás a mezclar:

- interpolación
- overrides
- profiles
- varios servicios

---

## Cuándo conviene esta combinación

Esta combinación suele ser excelente cuando:

- tenés un stack base bastante estable
- querés un entorno local más cómodo con bind mounts o flags de desarrollo
- querés herramientas opcionales como adminers, mailhog o contenedores de debugging
- no querés multiplicar archivos por cada pequeño ajuste

---

## Cuándo no alcanza con esto

Si el cambio entre entornos es muy grande, a veces sigue teniendo más sentido usar archivos explícitos como:

- `compose.yaml`
- `compose.dev.yaml`
- `compose.prod.yaml`

Este tema no reemplaza el uso de múltiples archivos más serios cuando hace falta.
Lo que hace es mostrarte una combinación muy útil para muchos proyectos intermedios.

---

## Qué pasa con la red del stack

Compose crea por defecto una red para la aplicación y conecta ahí todos los servicios, haciéndolos alcanzables por nombre dentro del proyecto. Docker lo documenta explícitamente en la guía de networking de Compose. citeturn763429search19

Eso significa que dentro del stack:

- `db` es resolvible por nombre
- `web` y `admin` también forman parte de la red del proyecto
- no necesitaste crear una red manual a mano

---

## Qué no tenés que confundir

### El override no reemplaza todo el archivo base
Solo ajusta o amplía lo necesario.

### Un profile no es otro entorno completo
Es una forma de activar servicios opcionales.

### `docker compose config` no levanta nada
Solo te muestra la configuración final resultante.

### Que `admin` exista en el archivo no significa que siempre arranque
Al tener `profiles`, depende de activación explícita.

---

## Error común 1: meter herramientas opcionales en el stack base sin control

Eso hace que el entorno levante más cosas de las necesarias todo el tiempo.

---

## Error común 2: usar un override enorme para cada detalle mínimo

A veces con un profile alcanza mejor para servicios opcionales.

---

## Error común 3: no mirar docker compose config antes de probar combinaciones

Eso te puede dejar adivinando cómo quedó el merge final.

---

## Error común 4: duplicar el stack completo entre archivos cuando solo querías cambiar dos o tres cosas

Eso va exactamente en contra del valor de los overrides.

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

### Ejercicio 3
Respondé con tus palabras:

- qué parte viene del archivo base
- qué parte agrega el override
- qué servicio es opcional
- qué configuración se ve ya combinada en `web`

### Ejercicio 4
Levantá el stack base:

```bash
docker compose up -d
```

### Ejercicio 5
Verificá qué servicios subieron:

```bash
docker compose ps
```

### Ejercicio 6
Activá el profile opcional:

```bash
docker compose --profile tools up -d
```

### Ejercicio 7
Volvé a verificar:

```bash
docker compose ps
```

### Ejercicio 8
Respondé con tus palabras:

- por qué `admin` no subió al principio
- qué te aporta el override de desarrollo
- por qué esta combinación te parece más limpia que duplicar todo

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué dejarías en `compose.yaml`
- qué pondrías en `compose.override.yaml`
- qué servicio auxiliar mandarías a un profile
- qué te gustaría poder verificar con `docker compose config` antes de levantar nada

No hace falta escribir el stack final completo.
La idea es que empieces a pensar esta arquitectura de configuración.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tipo de cambio te parece claramente de override?
- ¿qué tipo de servicio te parece claramente de profile?
- ¿qué tan útil te resultó ver el stack final con `docker compose config`?
- ¿por qué esta combinación te parece más flexible sin volverse caótica?
- ¿qué proyecto tuyo se beneficiaría mucho de esta estructura?

Estas observaciones valen mucho más que repetir comandos.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> La base del stack conviene dejarla en ________.  
> Los ajustes locales o de desarrollo conviene ponerlos en ________.  
> Los servicios opcionales conviene activarlos con ________.  
> Y si quiero ver cómo quedó todo finalmente combinado, conviene usar ________.

Y además respondé:

- ¿por qué esta combinación evita duplicar el stack?
- ¿qué parte del flujo te parece más profesional después de este tema?
- ¿qué servicio auxiliar te gustaría volver opcional primero en uno de tus proyectos?
- ¿qué te gustaría seguir refinando después de esta práctica?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- combinar archivo base, override y profiles sin confundirte
- usar `docker compose config` para inspeccionar la configuración final
- distinguir servicios base, ajustes de entorno y servicios opcionales
- construir stacks Compose más flexibles sin duplicar todo
- acercarte bastante más a una forma de trabajo real con Compose

---

## Resumen del tema

- Compose combina `compose.yaml` y `compose.override.yaml` por defecto. citeturn763429search0
- Los archivos posteriores sobrescriben o amplían a los anteriores según reglas de merge. citeturn763429search5turn763429search6
- Los profiles permiten activar servicios opcionales de forma selectiva. citeturn763429search4
- `docker compose config` renderiza la configuración final ya fusionada y con variables resueltas. citeturn763429search12
- Compose crea una red por defecto para el proyecto y los servicios se alcanzan por nombre dentro de ella. citeturn763429search19
- Este tema te deja con una práctica muy cercana a un flujo Compose más profesional.

---

## Próximo tema

En el próximo tema vas a seguir fortaleciendo el trabajo diario con Compose, pero ya mirando algo que aparece muchísimo en equipos y despliegues:

- nombres de proyecto
- aislamiento entre stacks
- cómo evitar choques cuando corrés varias composiciones al mismo tiempo
