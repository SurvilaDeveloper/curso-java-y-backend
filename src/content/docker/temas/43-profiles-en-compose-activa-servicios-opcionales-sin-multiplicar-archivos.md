---
title: "Profiles en Compose: activá servicios opcionales sin multiplicar archivos"
description: "Tema 43 del curso práctico de Docker: cómo usar profiles en Docker Compose para activar o desactivar servicios opcionales según el caso, sin duplicar todo el stack ni llenar el compose.yaml de configuraciones mezcladas."
order: 43
module: "Docker Compose como herramienta central"
level: "intermedio"
draft: false
---

# Profiles en Compose: activá servicios opcionales sin multiplicar archivos

## Objetivo del tema

En este tema vas a:

- entender qué son los profiles en Docker Compose
- activar servicios opcionales sin duplicar todo el stack
- distinguir servicios “siempre activos” de servicios condicionados
- usar `--profile` y `COMPOSE_PROFILES`
- decidir cuándo conviene un profile y cuándo conviene un archivo override

La idea es que empieces a hacer stacks más flexibles sin volverlos inmanejables.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender qué problema resuelven los profiles
2. ver cómo se declara `profiles` dentro de un servicio
3. activar servicios opcionales con `--profile`
4. entender qué pasa con los servicios sin profile
5. construir una regla simple para decidir entre profiles y overrides

---

## Idea central que tenés que llevarte

En muchos proyectos hay servicios que no querés levantar siempre.

Por ejemplo:

- un panel auxiliar
- una herramienta de debugging
- un runner de tests
- un mailhog
- un adminer
- un contenedor de desarrollo puntual

Si metés todo eso en el stack base y siempre se levanta, el entorno se vuelve más pesado de lo necesario.

Compose resuelve eso con profiles.

Dicho simple:

> los profiles te permiten dejar servicios opcionales dentro del mismo archivo  
> y activarlos solo cuando realmente los necesitás.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker explica que los profiles permiten ajustar la aplicación Compose para distintos entornos o casos de uso activando servicios de forma selectiva. También documenta que los servicios sin atributo `profiles` están siempre habilitados, mientras que los que sí tienen profile solo se inician cuando activás ese profile. Además, Docker soporta activar profiles con `--profile` o con la variable `COMPOSE_PROFILES`, incluso varios a la vez. citeturn471256search0turn471256search1turn471256search9

---

## Qué problema resuelven en la práctica

Imaginá este caso:

- `web`
- `db`
- `adminer`
- `mailhog`
- `debug-tools`

No siempre querés levantar todo eso.

Tal vez en el día a día solo necesitás:

- `web`
- `db`

Y solo a veces querés sumar:

- `adminer`
- `debug-tools`

Con profiles, podés dejar todo en el mismo `compose.yaml`, pero activar los servicios opcionales solo cuando haga falta.

---

## Cómo se declara un profile

Se declara dentro del servicio con el atributo `profiles`.

Por ejemplo:

```yaml
services:
  web:
    image: nginx

  db:
    image: postgres:18

  admin:
    image: adminer
    profiles:
      - tools
```

---

## Cómo se lee

La lectura conceptual sería:

- `web` y `db` no tienen profile, así que están siempre habilitados
- `admin` pertenece al profile `tools`
- `admin` solo se levantará si activás ese profile

Esa es la base del mecanismo.

---

## Servicios sin profile

Esto es importantísimo.

Docker documenta que los servicios sin `profiles` están siempre habilitados. citeturn471256search0turn471256search1

Eso significa que un stack así:

```yaml
services:
  web:
    image: nginx

  db:
    image: postgres:18

  admin:
    image: adminer
    profiles:
      - tools
```

si hacés:

```bash
docker compose up -d
```

levantará por defecto:

- `web`
- `db`

Pero no levantará:

- `admin`

---

## Activar un profile con --profile

La forma más directa es esta:

```bash
docker compose --profile tools up -d
```

---

## Qué hace

Activa el profile `tools`, así que ahora el stack levantaría:

- `web`
- `db`
- `admin`

Esto es muy cómodo porque no necesitás otro archivo completo solo para meter un servicio auxiliar.

---

## Activar varios profiles

Docker documenta que podés activar múltiples profiles usando varios `--profile` o con `COMPOSE_PROFILES` separado por comas. citeturn471256search1turn471256search9

Por ejemplo:

```bash
docker compose --profile tools --profile debug up -d
```

O con variable:

```bash
COMPOSE_PROFILES=tools,debug docker compose up -d
```

Esto te permite armar stacks bastante flexibles sin multiplicar archivos.

---

## Usar COMPOSE_PROFILES

La documentación oficial de variables predefinidas de Compose explica que `COMPOSE_PROFILES` permite indicar uno o más profiles a activar cuando corrés Compose. citeturn471256search9

Por ejemplo:

```bash
COMPOSE_PROFILES=tools docker compose up -d
```

Esto es útil cuando querés:

- automatizar un entorno local
- dejar configurado un flujo de desarrollo
- usar scripts o alias sin repetir tanto `--profile`

---

## Un ejemplo más realista

Mirá este archivo:

```yaml
services:
  web:
    image: nginx
    ports:
      - "8080:80"

  db:
    image: postgres:18
    environment:
      POSTGRES_PASSWORD: mysecretpassword

  admin:
    image: adminer
    ports:
      - "8081:8080"
    profiles:
      - tools

  mailhog:
    image: mailhog/mailhog
    ports:
      - "8025:8025"
    profiles:
      - dev
```

---

## Cómo se lee este stack

La lectura conceptual sería:

- `web` y `db` son la base del stack
- `admin` es opcional y entra si activás `tools`
- `mailhog` es opcional y entra si activás `dev`

Eso ya te permite tener un solo archivo con bastante flexibilidad.

---

## Qué pasaría con distintos comandos

### Si ejecutás:

```bash
docker compose up -d
```

Se levantarían:

- `web`
- `db`

### Si ejecutás:

```bash
docker compose --profile tools up -d
```

Se levantarían:

- `web`
- `db`
- `admin`

### Si ejecutás:

```bash
docker compose --profile tools --profile dev up -d
```

Se levantarían:

- `web`
- `db`
- `admin`
- `mailhog`

Esto te muestra muy bien el poder práctico de los profiles.

---

## Ejecutar directamente un servicio con profile

La documentación oficial también aclara algo muy útil:
si apuntás explícitamente a un servicio que tiene profile, Compose puede iniciar ese servicio aunque el profile no se haya activado globalmente, y además arranca sus dependencias. citeturn471256search1

Por ejemplo, si tuvieras:

```bash
docker compose run admin
```

o una orden similar sobre un servicio con profile, Compose puede habilitarlo para esa ejecución puntual.

No hace falta profundizar demasiado ahora, pero sí conviene saber que existe ese comportamiento.

---

## Cuándo conviene profile y cuándo override

Esta distinción es muy útil.

### Conviene usar profile cuando...
- querés activar o desactivar servicios opcionales
- el stack base sigue siendo el mismo
- no necesitás cambiar demasiada configuración de servicios existentes
- querés algo simple dentro del mismo archivo

### Conviene usar override cuando...
- querés modificar bastante la configuración del stack
- cambia el comportamiento de varios servicios
- querés separar entorno de desarrollo y producción en capas
- necesitás bind mounts, cambios de puertos, imágenes o builds distintos

Dicho simple:

> profile suele servir para “sumar o no sumar piezas”  
> override suele servir para “cambiar cómo funciona el stack”

---

## Un criterio muy útil

Pensalo así:

### “Quiero agregar un panel auxiliar o herramientas extra”
Profile.

### “Quiero que desarrollo y producción usen configuraciones bastante distintas”
Override o múltiples archivos Compose.

Esto no es una ley rígida, pero como regla práctica funciona muy bien.

---

## Qué no tenés que confundir

### Un profile no es otro archivo
Es una forma de condicionar servicios dentro del mismo archivo.

### Un profile no reemplaza por completo a los overrides
Resuelve otro tipo de problema.

### Los servicios sin profile no son opcionales
Están activos por defecto.

### Activar un profile no borra ni reemplaza el stack base
Solo suma o habilita servicios etiquetados con ese profile.

---

## Error común 1: poner profiles a todo

Si todo tiene profile, perdés la idea de “base del stack”.
Conviene que haya servicios claramente esenciales y siempre activos.

---

## Error común 2: usar un override entero solo para agregar un panel opcional

A veces eso es demasiado.
Para servicios opcionales simples, profile puede ser más cómodo.

---

## Error común 3: creer que profiles sirven para cualquier cambio de entorno

No siempre.

Si cambia mucho la configuración, los overrides o múltiples archivos siguen siendo mejores.

---

## Error común 4: olvidar que COMPOSE_PROFILES existe

A veces es más cómodo que repetir muchos `--profile`, sobre todo en scripts o automatización local. citeturn471256search9

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá un `compose.yaml` así:

```yaml
services:
  web:
    image: nginx
    ports:
      - "8080:80"

  db:
    image: postgres:18
    environment:
      POSTGRES_PASSWORD: mysecretpassword

  admin:
    image: adminer
    ports:
      - "8081:8080"
    profiles:
      - tools

  mailhog:
    image: mailhog/mailhog
    ports:
      - "8025:8025"
    profiles:
      - dev
```

### Ejercicio 2
Respondé con tus palabras:

- qué servicios forman la base del stack
- qué servicios son opcionales
- qué profile activa `admin`
- qué profile activa `mailhog`

### Ejercicio 3
Ahora imaginá estos comandos y respondé qué levantarían:

```bash
docker compose up -d
docker compose --profile tools up -d
docker compose --profile tools --profile dev up -d
```

### Ejercicio 4
Respondé además:

- cuándo te parece mejor usar profile
- cuándo te parece mejor usar override
- por qué no conviene meter todo el tiempo servicios auxiliares en el stack base

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué servicios deberían estar siempre activos
- qué servicios te gustaría volver opcionales con profiles
- qué herramientas de debugging, testing o administración pondrías detrás de un profile
- qué valor práctico tendría eso en tu día a día

No hace falta escribir todavía el archivo final.
La idea es que empieces a pensar el stack con más flexibilidad.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué parte del stack te gustaría que no se levantara siempre?
- ¿qué diferencia más clara ves entre “servicio base” y “servicio opcional”?
- ¿por qué profiles te parecen más livianos que multiplicar archivos para ciertas cosas?
- ¿qué tipo de cambio seguirías resolviendo con overrides y no con profiles?
- ¿qué proyecto tuyo se beneficiaría mucho de esta idea?

Estas observaciones valen mucho más que memorizar una bandera de CLI.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero que un servicio exista en el mismo archivo pero solo se active a veces, probablemente me conviene ________.  
> Si quiero cambiar bastante la configuración del stack entre entornos, probablemente me conviene ________.

Y además respondé:

- ¿por qué los servicios sin profile forman la base del stack?
- ¿qué ventaja te da `COMPOSE_PROFILES`?
- ¿qué servicio auxiliar pondrías primero detrás de un profile en uno de tus proyectos?
- ¿qué te parece más elegante de esta herramienta?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar qué son los profiles en Compose
- activar servicios opcionales con `--profile`
- usar `COMPOSE_PROFILES`
- distinguir servicios base y servicios opcionales
- decidir mejor cuándo conviene profile y cuándo override

---

## Resumen del tema

- Los profiles permiten activar servicios de forma selectiva dentro del mismo archivo Compose. citeturn471256search0turn471256search1
- Los servicios sin `profiles` están siempre habilitados. citeturn471256search0turn471256search1
- Podés activar profiles con `--profile` o con `COMPOSE_PROFILES`. citeturn471256search1turn471256search9
- Los profiles son muy útiles para herramientas auxiliares, debugging o casos de uso opcionales.
- No reemplazan por completo a los overrides: resuelven un problema distinto.
- Este tema te ayuda a construir stacks más flexibles sin multiplicar archivos innecesariamente.

---

## Próximo tema

En el próximo tema vas a empezar a cerrar este bloque con una práctica más integrada:

- stack Compose más flexible
- servicios base, servicios opcionales y configuración por entorno
- una forma de trabajo mucho más cercana a un proyecto real
