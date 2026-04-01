---
title: "Qué es Docker Compose: la forma más cómoda de definir y levantar varios servicios juntos"
description: "Tema 32 del curso práctico de Docker: qué es Docker Compose, por qué se vuelve tan útil cuando una aplicación necesita varios contenedores, y cómo empezar a pensar en un compose.yaml como archivo central del stack."
order: 32
module: "Docker Compose como herramienta central"
level: "base"
draft: false
---

# Qué es Docker Compose: la forma más cómoda de definir y levantar varios servicios juntos

## Objetivo del tema

En este tema vas a:

- entender qué es Docker Compose
- ver qué problema resuelve cuando una app necesita varios contenedores
- empezar a pensar en `compose.yaml` como el archivo central del stack
- entender por qué Compose simplifica muchísimo el trabajo con varios servicios
- prepararte para levantar aplicaciones completas con un solo comando

La idea es que dejes de pensar en varios `docker run` sueltos y empieces a ver una forma mucho más ordenada de definir tu aplicación.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender qué problema aparece cuando una app necesita varios contenedores
2. ver por qué hacerlo todo a mano se vuelve incómodo
3. entender qué papel cumple Docker Compose
4. conocer la idea de `compose.yaml`
5. preparar la base mental para los próximos temas prácticos

---

## Idea central que tenés que llevarte

Cuando una aplicación ya necesita más de un contenedor, empieza a aparecer este problema:

- un contenedor para la app
- otro para la base de datos
- otro para un cache
- quizá otro para un panel auxiliar

Si intentás manejar todo eso a mano con comandos separados, el flujo se vuelve más difícil de recordar, repetir y compartir.

Docker Compose resuelve eso.

Dicho simple:

> Compose te permite definir varios servicios en un único archivo YAML y levantarlos juntos con un solo comando.

---

## Qué es Docker Compose

Docker Compose es la herramienta de Docker para definir y ejecutar aplicaciones multi-contenedor.

En vez de escribir muchos comandos manuales por separado, podés describir tu aplicación en un archivo y después usar la CLI de Compose para:

- crear servicios
- iniciar servicios
- detenerlos
- ver logs
- gestionar redes
- gestionar volúmenes

Todo de una forma mucho más centralizada.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker describe Compose como la forma de simplificar el control de toda la pila de aplicación, definiendo servicios, redes y volúmenes en un único archivo YAML. También explica que el archivo recomendado es `compose.yaml`, que la CLI actual se usa con `docker compose`, y que Compose crea y arranca todos los servicios definidos con un solo comando. citeturn806403search0turn806403search4turn806403search8turn806403search9turn806403search11

---

## Qué problema resuelve realmente

Pensá en un escenario mínimo:

- un backend
- una base PostgreSQL
- quizá Redis
- variables de entorno
- un volumen para la base
- una red para que se hablen

Ya sabés hacer todo eso con `docker run`, redes y volúmenes manuales.

Pero ahora imaginá que tenés que:

- recordar todos los comandos
- ejecutarlos en el orden correcto
- repetirlos mañana
- compartirlos con otra persona
- documentarlos bien
- apagarlos todos después

Ahí es donde Compose se vuelve mucho más valioso.

---

## Cómo conviene pensar Compose

Compose te deja describir la aplicación como un conjunto de servicios relacionados.

No tenés que pensar primero en “contenedores sueltos” y después intentar recordar cómo se conectaban.

Podés pensar más bien así:

- esta app tiene estos servicios
- esta base usa este volumen
- esta app expone este puerto
- estos dos servicios comparten red
- esta variable pertenece a este servicio

Y todo eso queda escrito en un solo archivo.

---

## Qué es compose.yaml

`compose.yaml` es el archivo donde describís tu aplicación para Compose.

Ahí podés definir, por ejemplo:

- servicios
- imágenes
- builds
- puertos
- variables de entorno
- volúmenes
- redes

La documentación oficial actual de Docker marca `compose.yaml` como el nombre preferido del archivo, aunque sigue aceptando variantes históricas como `compose.yml` o `docker-compose.yml`. citeturn806403search4

---

## Qué aspecto tiene un compose.yaml simple

Un ejemplo muy básico podría verse así:

```yaml
services:
  web:
    image: nginx
    ports:
      - "8080:80"
```

---

## Cómo se lee este archivo

La lectura conceptual sería algo así:

- mi aplicación tiene un servicio llamado `web`
- ese servicio usa la imagen `nginx`
- ese servicio publica el puerto `80` del contenedor en el `8080` del host

Todavía no hay varios servicios, pero ya se ve la idea base.

---

## Qué significa service en Compose

La documentación oficial explica que Compose trabaja con el concepto de **service** como unidad lógica de la aplicación. Un servicio representa un componente que se ejecuta como contenedor o conjunto de contenedores con una misma configuración. citeturn806403search4turn806403search3

Eso significa que Compose te ayuda a pensar más en componentes de la app que en comandos aislados.

Por ejemplo:

- `web`
- `db`
- `redis`
- `worker`

Cada uno puede tener su propia configuración.

---

## Qué ventajas te da Compose

Compose te da varias ventajas muy concretas:

### 1. Menos comandos manuales
No necesitás recordar una lista larga de `docker run`.

### 2. Más claridad
La configuración queda escrita en un solo lugar.

### 3. Más repetibilidad
Podés levantar el mismo stack muchas veces de forma consistente.

### 4. Más facilidad para compartir
Si el archivo va en el repositorio, otra persona puede usarlo también.

### 5. Más orden
Redes, volúmenes, puertos y variables ya no quedan repartidos en comandos sueltos.

---

## Qué comandos importantes vas a usar después

Los más importantes del arranque suelen ser:

```bash
docker compose up
docker compose down
docker compose logs
docker compose ps
```

La documentación oficial actual de Docker destaca justamente esos comandos como base del ciclo de vida con Compose. citeturn806403search4turn806403search8

No hace falta profundizar hoy en todos.
En los próximos temas los vas a usar de verdad.

---

## Qué hace docker compose up

La idea general es:

- leer el `compose.yaml`
- crear lo necesario
- iniciar los servicios definidos

Si tu aplicación tiene varios servicios, `docker compose up` puede levantarlos juntos.

Esta es una de las razones más fuertes por las que Compose resulta tan cómodo.

---

## Qué hace docker compose down

La idea general es:

- detener los servicios
- limpiar recursos asociados de esa ejecución de Compose

Esto hace mucho más cómodo arrancar y apagar un stack completo.

---

## Qué pasa con redes y volúmenes en Compose

La documentación oficial indica que Compose puede definir y gestionar servicios, redes y volúmenes dentro del mismo archivo. También aclara que el archivo de Compose tiene secciones específicas para declarar volúmenes y redes cuando hace falta. citeturn806403search1turn806403search6turn806403search10

Esto es muy importante porque te permite dejar juntas estas piezas:

- servicios
- almacenamiento
- conectividad

Eso hace que la app quede mucho mejor documentada.

---

## Qué red crea Compose por defecto

Docker documenta que, por defecto, Compose crea una red para la aplicación y conecta allí todos los servicios. También explica que dentro de esa red los servicios son alcanzables por su nombre. citeturn806403search10

Esto conecta muy bien con todo lo que ya viste en el bloque de redes.

Por eso Compose se siente tan natural cuando ya entendiste:

- redes definidas por el usuario
- comunicación por nombre
- app + base de datos

---

## Qué diferencia hay entre docker run y docker compose

### Con docker run
Vos manejás todo de forma más manual:

- nombre
- red
- volumen
- puerto
- variables
- orden de arranque

### Con docker compose
Eso queda definido en un archivo central.

No es que `docker run` deje de servir.
Simplemente Compose se vuelve mucho más cómodo cuando la app ya tiene varios servicios.

---

## Qué no tenés que confundir

### Compose no reemplaza Docker
Compose usa Docker para gestionar una aplicación multi-contenedor.

### Compose no significa “magia”
Sigue habiendo servicios, redes, volúmenes y contenedores.
Solo que los definís de forma más ordenada.

### Compose no es solo para producción
La documentación oficial lo presenta como útil para desarrollo, testing, CI, staging y otros entornos. citeturn806403search0turn806403search11

### Compose no exige que todos los servicios se construyan igual
Un servicio puede usar `image`, otro puede usar `build`, y eso sigue siendo válido dentro del mismo archivo. citeturn806403search3

---

## Error común 1: seguir pensando en Compose como “solo un archivo más”

No.

En la práctica, termina siendo el punto de entrada al stack completo.

---

## Error común 2: creer que solo sirve cuando tenés una arquitectura enorme

No hace falta un sistema gigante.
Con una app y una base ya empieza a tener mucho sentido.

---

## Error común 3: pensar que Compose elimina la necesidad de entender redes, volúmenes o puertos

No la elimina.

De hecho, entender esos conceptos antes hace que Compose te resulte mucho más claro.

---

## Error común 4: confundir docker-compose con docker compose

La documentación actual de Docker usa `docker compose` como CLI principal. Las variantes viejas forman parte de la historia de Compose, pero hoy conviene acostumbrarse a la sintaxis moderna. citeturn806403search7turn806403search8

---

## Ejercicio práctico obligatorio

Quiero que hagas este recorrido de análisis.

### Ejercicio 1
Pensá en una app con estos servicios:

- `web`
- `db`

### Ejercicio 2
Respondé con tus palabras:

- ¿qué tendrías que configurar manualmente si usaras solo `docker run`?
- ¿qué ventajas tendría poner esa configuración en un `compose.yaml`?
- ¿qué parte te parece más fácil de leer o compartir si queda escrita en YAML?

### Ejercicio 3
Mirá este ejemplo mínimo:

```yaml
services:
  web:
    image: nginx
    ports:
      - "8080:80"
```

Y respondé:

- qué servicio define
- qué imagen usa
- qué puerto publica
- por qué este archivo ya es más claro que recordar el `docker run` equivalente de memoria

---

## Segundo ejercicio de análisis

Imaginá una aplicación con:

- `api`
- `db`
- `redis`

Respondé:

- qué servicios tendría
- qué variables de entorno probablemente querrías declarar
- qué volumen necesitaría la base
- por qué te convendría que eso esté en un solo archivo

No hace falta escribir todavía el YAML completo.
La idea es empezar a pensar la estructura.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué problema de orden resuelve Compose?
- ¿qué tan natural te resulta pensar en “servicios” en vez de “comandos sueltos”?
- ¿por qué un archivo central mejora tanto la comunicación con otras personas?
- ¿qué parte del bloque anterior hace que Compose ahora te resulte más entendible?
- ¿qué te imaginás que va a simplificar mucho en los próximos temas?

Estas observaciones valen mucho más que memorizar un par de comandos.

---

## Mini desafío

Intentá explicar con tus palabras esta idea:

> Docker Compose te deja describir en un solo archivo cómo debe levantarse toda una aplicación con varios servicios relacionados.

Y además respondé:

- ¿por qué eso mejora la repetibilidad?
- ¿por qué eso mejora la claridad?
- ¿qué ventaja tiene que Compose cree una red para la app por defecto?
- ¿qué tipo de proyecto tuyo te gustaría organizar así?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar qué es Docker Compose con claridad
- entender por qué se vuelve tan útil cuando ya hay varios servicios
- pensar en `compose.yaml` como el archivo central de un stack
- distinguir mejor el uso de `docker compose` frente a muchos `docker run`
- prepararte para usar Compose de verdad en los próximos temas

---

## Resumen del tema

- Docker Compose sirve para definir y ejecutar aplicaciones multi-contenedor desde un solo archivo YAML. citeturn806403search0turn806403search4turn806403search9
- El archivo recomendado hoy es `compose.yaml`. citeturn806403search4
- Compose permite describir servicios, redes, volúmenes y más en un único lugar. citeturn806403search1turn806403search6
- Los comandos como `docker compose up` y `docker compose down` simplifican muchísimo el ciclo de vida del stack. citeturn806403search4turn806403search8
- Este tema te da la base mental que necesitás para empezar a usar Compose como herramienta central del resto del curso.

---

## Próximo tema

En el próximo tema vas a bajar todo esto a lo concreto:

- estructura básica de `compose.yaml`
- sección `services`
- cómo escribir tu primer archivo Compose real
- empezar a levantar varios servicios desde un mismo archivo
