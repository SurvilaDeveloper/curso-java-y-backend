---
title: "Nombres de proyecto en Compose: evitá choques entre stacks y corré varias copias sin problemas"
description: "Tema 45 del curso práctico de Docker: cómo funciona el nombre de proyecto en Docker Compose, cómo afecta a contenedores, redes y volúmenes, y cómo usar -p, COMPOSE_PROJECT_NAME o name: para evitar conflictos cuando corrés varios stacks a la vez."
order: 45
module: "Docker Compose como herramienta central"
level: "intermedio"
draft: false
---

# Nombres de proyecto en Compose: evitá choques entre stacks y corré varias copias sin problemas

## Objetivo del tema

En este tema vas a:

- entender qué es el nombre de proyecto en Compose
- ver cómo afecta los nombres de contenedores, redes y volúmenes
- evitar choques cuando corrés varios stacks a la vez
- usar `-p`, `COMPOSE_PROJECT_NAME` y `name:` con criterio
- aprender a identificar proyectos activos con `docker compose ls`

La idea es que puedas correr varias composiciones en la misma máquina sin que se pisen entre sí ni te generen confusión.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender qué es un project name en Compose
2. ver cómo Compose usa ese nombre para crear recursos
3. conocer las formas de establecerlo
4. entender el orden de precedencia
5. ver cuándo conviene personalizarlo
6. aprender a listar proyectos activos

---

## Idea central que tenés que llevarte

Compose no solo levanta contenedores.
También necesita agrupar recursos que pertenecen a una misma aplicación.

Para eso usa un **nombre de proyecto**.

Dicho simple:

> el nombre de proyecto es la identidad del stack  
> y Compose lo usa para nombrar y aislar contenedores, redes, volúmenes y otros recursos.

Si entendés eso, vas a poder evitar muchísimos choques y trabajar con varios stacks sin volverte loco.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker explica que cada configuración Compose tiene un **project name**. Por defecto, Compose lo toma del nombre del directorio que contiene el archivo Compose o del primer archivo usado con `-f`, pero podés sobrescribirlo con `-p`, con `COMPOSE_PROJECT_NAME` o con la propiedad top-level `name:` del archivo. También documenta el orden de precedencia de estos mecanismos y remarca que usar project names distintos permite desplegar varias copias del mismo `compose.yaml` sobre la misma infraestructura sin cambios en el archivo. Además, Docker indica que la red por defecto de Compose se nombra a partir del project name y que `docker compose ls` lista los proyectos activos. citeturn257220search0turn257220search2turn257220search4turn257220search6turn257220search7turn257220search8turn257220search10turn257220search1

---

## Qué es exactamente el project name

Es el nombre lógico que Compose usa para identificar una aplicación o stack.

No es lo mismo que:

- el nombre de un servicio
- el nombre de un contenedor individual
- el nombre del archivo `compose.yaml`

Es más bien la “etiqueta general” del stack.

Podés pensarlo como el prefijo o identidad del proyecto al que pertenecen todos sus recursos.

---

## Por qué esto importa tanto

Imaginá que corrés dos veces el mismo stack o dos stacks parecidos en la misma máquina.

Si Compose no tuviera una forma de aislarlos por proyecto, se podrían pisar cosas como:

- nombres de contenedores
- redes por defecto
- volúmenes nombrados
- labels internas de Compose

El project name evita justamente eso.

---

## Cómo usa Compose el nombre de proyecto

Docker documenta que Compose usa el project name para generar nombres únicos de recursos del stack. Por ejemplo, la red por defecto de la app recibe un nombre basado en el project name, y los contenedores llevan nombres compuestos por el proyecto, el servicio y un índice. También las etiquetas canónicas de Compose incluyen el nombre del proyecto. citeturn257220search10turn257220search9turn257220search7

La idea útil para el curso es esta:

- si el proyecto cambia de nombre, cambian también los nombres derivados de sus recursos
- eso te da aislamiento entre stacks

---

## Ejemplo mental simple

Supongamos este archivo:

```yaml
services:
  web:
    image: nginx

  db:
    image: postgres:18
```

Y supongamos que la carpeta del proyecto se llama:

```text
miapp
```

Si no definís nada especial, Compose puede tomar `miapp` como project name por defecto. A partir de ahí, vas a ver recursos con nombres parecidos a:

- `miapp-web-1`
- `miapp-db-1`
- `miapp_default`

No hace falta obsesionarse con memorizar el formato exacto.
Lo importante es ver la idea de agrupación.

---

## Cuál es el comportamiento por defecto

La documentación oficial actual dice que, por defecto, Compose usa el nombre del directorio que contiene el archivo Compose. Si usás `-f` con varios archivos, toma el basename del directorio del primer archivo especificado. Y si no pasás archivo alguno, puede usar el basename del directorio actual. citeturn257220search0turn257220search2turn257220search4

Eso significa que muchas veces el nombre del proyecto te queda “bien” sin pensar demasiado.
Pero no siempre.

---

## Cuándo te puede traer problemas dejar el nombre por defecto

Puede traerte problemas o confusión cuando:

- querés correr dos copias del mismo stack
- trabajás con ramas o entornos distintos
- compartís una misma máquina con más gente
- tenés carpetas con nombres poco claros
- querés distinguir mejor dev, test y demo

Ahí conviene controlar el nombre de proyecto de forma explícita.

---

## Primera forma de definirlo: -p

La forma más directa es esta:

```bash
docker compose -p miapp-dev up -d
```

La documentación oficial marca `-p` como la opción de mayor precedencia para definir el project name. citeturn257220search2turn257220search4

### Qué ventaja tiene
Es ideal cuando querés decidir el nombre en ese comando puntual.

### Cuándo conviene
- demos
- entornos temporales
- pruebas paralelas
- levantar varias copias de la misma app

---

## Segunda forma: COMPOSE_PROJECT_NAME

También podés usar una variable de entorno:

```bash
COMPOSE_PROJECT_NAME=miapp-dev docker compose up -d
```

Docker documenta `COMPOSE_PROJECT_NAME` como una de las formas oficiales de establecer el project name, justo por debajo de `-p` en precedencia. citeturn257220search4

### Qué ventaja tiene
Es muy útil para scripts, shells, automatización o entornos de CI.

### Cuándo conviene
- aliases
- scripts de arranque
- CI/CD
- equipos que quieren una convención más fija

---

## Tercera forma: name: dentro del archivo

También podés definirlo en el archivo Compose con la propiedad top-level `name:`.

Por ejemplo:

```yaml
name: miapp

services:
  web:
    image: nginx
```

La documentación oficial actual explica que `name:` define el project name si no lo sobrescribís por otros medios, y que incluso queda expuesto para interpolación como `COMPOSE_PROJECT_NAME`. citeturn257220search6turn257220search4

### Qué ventaja tiene
Hace explícito el nombre base del proyecto dentro del archivo.

### Cuándo conviene
- querés una identidad por defecto clara
- querés que el stack sea más portable entre directorios distintos
- querés evitar que el nombre dependa del nombre de carpeta

---

## Orden de precedencia

Docker documenta el siguiente orden de precedencia para el project name:

1. `-p`
2. `COMPOSE_PROJECT_NAME`
3. `name:` en el archivo
4. basename del directorio del primer archivo Compose
5. basename del directorio actual, si no especificaste archivos citeturn257220search2turn257220search4

Esto es muy importante porque te ayuda a entender por qué Compose terminó usando cierto nombre aunque vos creías haber definido otro.

---

## Ejemplo práctico de precedencia

Imaginá este archivo:

```yaml
name: miapp

services:
  web:
    image: nginx
```

Si ejecutás:

```bash
docker compose up -d
```

el project name sería `miapp`.

Pero si ejecutás:

```bash
COMPOSE_PROJECT_NAME=miapp-dev docker compose up -d
```

ganaría `COMPOSE_PROJECT_NAME`.

Y si ejecutás:

```bash
docker compose -p demo up -d
```

ganaría `-p`.

Eso te muestra claramente la jerarquía.

---

## Correr varias copias del mismo stack

Docker lo menciona explícitamente en su FAQ y en la explicación del project name: una de las razones principales para definir nombres de proyecto distintos es poder correr varias copias del mismo archivo Compose sobre la misma infraestructura. citeturn257220search8turn257220search7

Por ejemplo:

```bash
docker compose -p tienda-a up -d
docker compose -p tienda-b up -d
```

Esto te permite tener dos stacks paralelos usando el mismo `compose.yaml`, pero aislados entre sí por nombre de proyecto.

---

## Qué recursos quedan separados

Cuando el project name cambia, Compose diferencia recursos como:

- contenedores
- red por defecto
- volúmenes nombrados del proyecto
- labels internas de agrupación

Por eso dos stacks con distinto project name no se pisan aunque compartan el mismo archivo base.

---

## Ver proyectos activos con docker compose ls

Ahora entra un comando muy útil:

```bash
docker compose ls
```

La documentación oficial lo describe como el comando para listar los proyectos Compose activos. También acepta `-a` para incluir detenidos y `-q` para mostrar solo los nombres. citeturn257220search1

Esto es excelente cuando ya empezás a tener varios stacks corriendo y querés ver rápidamente:

- qué proyectos existen
- cuáles siguen activos
- cuáles están detenidos
- cómo se llaman realmente

---

## Qué papel juega la red por defecto

La documentación oficial de networking de Compose remarca que la red por defecto de una app recibe un nombre basado en el project name. citeturn257220search10

Esto explica por qué dos stacks con distinto project name no terminan usando la misma red por defecto por accidente.

Es otra pieza clave del aislamiento.

---

## Qué no tenés que confundir

### El project name no es lo mismo que el nombre de un servicio
El servicio puede ser `web`, pero el proyecto puede ser `miapp-dev`.

### Cambiar el nombre de la carpeta no siempre es suficiente si ya estás usando otros mecanismos
`-p`, `COMPOSE_PROJECT_NAME` y `name:` pueden sobrescribir el valor por defecto.

### Correr dos veces el mismo compose sin cambiar el project name no te da dos stacks independientes
El project name es justamente lo que marca esa identidad.

### docker compose ls no lista servicios, lista proyectos
Para servicios usás más bien `docker compose ps`.

---

## Error común 1: no controlar el project name cuando querés dos copias del mismo stack

Eso puede hacer que una ejecución intente reutilizar o modificar recursos del mismo proyecto en vez de crear un segundo stack independiente.

---

## Error común 2: pensar que el nombre del directorio siempre manda

No.

La documentación oficial deja claro que hay varias capas de precedencia por encima. citeturn257220search2turn257220search4

---

## Error común 3: meter un name: y olvidarte de que -p lo pisa

El archivo puede tener un nombre base, pero `-p` sigue teniendo prioridad.

---

## Error común 4: no usar docker compose ls cuando ya tenés varios proyectos

Eso te quita una herramienta muy cómoda para orientarte rápido.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá un archivo `compose.yaml` simple:

```yaml
services:
  web:
    image: nginx
    ports:
      - "8080:80"
```

### Ejercicio 2
Levantá el stack con un nombre explícito:

```bash
docker compose -p demo-a up -d
```

### Ejercicio 3
Levantá otra copia del mismo stack con otro nombre:

```bash
docker compose -p demo-b up -d
```

### Ejercicio 4
Listá los proyectos:

```bash
docker compose ls
```

### Ejercicio 5
Respondé con tus palabras:

- por qué `demo-a` y `demo-b` no se pisan
- qué papel jugó el project name
- por qué esto te sirve para demos, pruebas o entornos paralelos

### Ejercicio 6
Bajá ambos stacks:

```bash
docker compose -p demo-a down
docker compose -p demo-b down
```

---

## Segundo ejercicio de análisis

Imaginá este archivo:

```yaml
name: tienda

services:
  web:
    image: nginx
```

Y respondé qué nombre de proyecto esperás en cada caso:

### Caso A
```bash
docker compose up -d
```

### Caso B
```bash
COMPOSE_PROJECT_NAME=tienda-dev docker compose up -d
```

### Caso C
```bash
docker compose -p tienda-demo up -d
```

Después explicá por qué.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre servicio y proyecto?
- ¿qué valor práctico le ves a poder correr dos copias del mismo stack?
- ¿qué método te gusta más para fijar el nombre: `-p`, `COMPOSE_PROJECT_NAME` o `name:`?
- ¿en qué proyecto tuyo esto te evitaría más confusión?
- ¿por qué `docker compose ls` se vuelve más útil a medida que tenés más stacks?

Estas observaciones valen mucho más que memorizar la tabla de precedencia.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero fijar el nombre del proyecto solo para este comando, me conviene ________.  
> Si quiero fijarlo desde un entorno o script, me conviene ________.  
> Si quiero dejar un nombre base dentro del archivo, me conviene ________.

Y además respondé:

- ¿por qué el project name es la identidad real del stack?
- ¿qué problema evita cuando corrés varias composiciones en la misma máquina?
- ¿qué rol juega en nombres de redes y volúmenes?
- ¿qué parte de este tema te parece más útil para trabajo real?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar qué es el project name en Compose
- usar `-p`, `COMPOSE_PROJECT_NAME` y `name:` con criterio
- entender el orden de precedencia
- evitar choques entre stacks paralelos
- usar `docker compose ls` para orientarte entre proyectos activos

---

## Resumen del tema

- Compose usa un project name para identificar un stack y derivar nombres de recursos asociados. citeturn257220search0turn257220search7turn257220search10
- Por defecto toma el nombre del directorio, pero puede sobrescribirse con `-p`, `COMPOSE_PROJECT_NAME` o `name:`. citeturn257220search0turn257220search2turn257220search4turn257220search6
- El orden de precedencia importa y `-p` gana sobre las demás opciones. citeturn257220search2turn257220search4
- Cambiar el project name permite correr varias copias del mismo stack sin conflictos. citeturn257220search7turn257220search8
- `docker compose ls` te ayuda a ver los proyectos Compose activos. citeturn257220search1
- Este tema te da una herramienta muy práctica para evitar choques y trabajar con múltiples stacks a la vez.

---

## Próximo tema

En el próximo tema vas a empezar a cerrar este gran bloque de Compose con una práctica más integrada:

- stack completo
- nombre de proyecto explícito
- servicios opcionales
- overrides de desarrollo
- y una forma de trabajo muy cercana a un entorno real
