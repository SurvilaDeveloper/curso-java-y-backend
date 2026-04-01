---
title: "Convenciones simples de equipo: compose.yaml, project name claro, sin container_name innecesario y config verificable"
description: "Tema 118 del curso práctico de Docker: cómo reducir fricción en equipos y proyectos compartidos usando convenciones simples de Docker Compose, como compose.yaml canónico, nombre de proyecto predecible, evitar container_name cuando no hace falta y validar la configuración real con docker compose config."
order: 118
module: "Cierre operativo, documentación mínima y proyecto más compartible"
level: "intermedio"
draft: false
---

# Convenciones simples de equipo: compose.yaml, project name claro, sin `container_name` innecesario y config verificable

## Objetivo del tema

En este tema vas a:

- entender qué pequeñas convenciones reducen mucha fricción en proyectos compartidos
- usar `compose.yaml` como archivo canónico del proyecto
- hacer más predecible el nombre del proyecto Compose
- evitar `container_name` cuando te complica más de lo que ayuda
- validar la configuración real con `docker compose config`
- construir un criterio simple de equipo para que el stack sea más fácil de tocar entre varias personas

La idea es que el proyecto no solo funcione en tu máquina, sino que también sea más fácil de entender, levantar y mantener cuando más de una persona lo toca.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. elegir una convención de archivo Compose clara
2. entender cómo Compose decide el project name
3. decidir cuándo conviene fijarlo y cuándo no
4. evitar `container_name` si te rompe escalado o flexibilidad
5. validar la configuración final renderizada con `docker compose config`
6. cerrar con una regla simple de equipo bastante reutilizable

---

## Idea central que tenés que llevarte

Muchos problemas “de equipo” en Docker Compose no vienen de networking complicado ni de builds raras.

Vienen de cosas más simples como:

- nadie sabe cuál es el archivo Compose “oficial”
- el project name cambia según la carpeta
- alguien fija `container_name` por costumbre y después no se puede escalar el servicio
- la configuración real no se revisa antes de ejecutar

Docker documenta que el archivo por defecto y preferido es `compose.yaml`, que el project name por defecto se deriva del directorio del proyecto pero puede sobrescribirse con `-p`, `COMPOSE_PROJECT_NAME` o el top-level `name`, que `docker compose config` renderiza el modelo final que se va a aplicar y que si un servicio define `container_name`, Compose no puede escalarlo más allá de un contenedor. Además, Compose usa el nombre del servicio para descubrimiento dentro de la red del proyecto. citeturn387813search8turn614051search1turn614051search9turn614051search3turn387813search0turn614051search21

Dicho simple:

> unas pocas convenciones compartidas valen más que mucha discusión informal sobre “cómo lo solemos hacer”.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker deja varias ideas muy claras para este tema:

- el archivo Compose por defecto y preferido es `compose.yaml`; `compose.yml`, `docker-compose.yaml` y `docker-compose.yml` siguen soportados por compatibilidad, pero si existe `compose.yaml`, Compose lo prefiere. citeturn614051search1
- Compose puede usar múltiples archivos, y por defecto lee `compose.yaml` y un opcional `compose.override.yaml`, que se fusiona sobre el base. citeturn387813search15
- por defecto, el **project name** se basa en el directorio que contiene el Compose file; puede sobreescribirse con `-p`, `COMPOSE_PROJECT_NAME` o el top-level `name`, con un orden de precedencia documentado oficialmente. citeturn387813search8turn614051search9turn387813search13
- `docker compose config` renderiza el modelo real que Compose va a aplicar, expandiendo notación corta, fusionando archivos y resolviendo variables. citeturn614051search3
- Compose usa el nombre del servicio para descubrimiento dentro de la red del proyecto. citeturn614051search21
- si usás `container_name`, Compose no puede escalar ese servicio más allá de una instancia. citeturn387813search0
- si cambiás el Dockerfile o el contexto de build, Docker documenta que `docker compose build` reconstruye el servicio y que los servicios se etiquetan por defecto como `project-service`. citeturn387813search12

---

## Primer concepto: un archivo Compose canónico evita discusiones inútiles

Docker documenta que el archivo preferido por defecto es `compose.yaml`. citeturn614051search1

Eso ya te da una convención muy sana:

> si no hay una razón fuerte para otra cosa, usá `compose.yaml` como archivo principal.

### Qué gana esta convención
- menos ambigüedad
- menos “¿cuál es el archivo correcto?”
- mejor alineación con lo que Compose espera hoy
- menos necesidad de pasar `-f` todo el tiempo para el caso base

Esto parece mínimo, pero ayuda mucho.

---

## Segundo concepto: `compose.override.yaml` como override local razonable

Docker documenta que, por defecto, Compose lee `compose.yaml` y opcionalmente `compose.override.yaml`, fusionando ambos. citeturn387813search15

### Qué enseñanza deja esto
- `compose.yaml` puede ser la base compartida
- `compose.override.yaml` puede servir para ajustes locales o de desarrollo
- no hace falta meter todo en un solo archivo eterno

Esto es muy valioso para equipos chicos que quieren una base común y cierta flexibilidad local sin destruir la claridad.

---

## Tercer concepto: el project name no siempre es tan obvio como parece

Docker documenta que, por defecto, el project name sale del directorio donde vive el Compose file, pero que puede sobrescribirse por varios mecanismos con un orden claro de precedencia. citeturn387813search8turn387813search13

### Qué implica esto en práctica
- si dos personas clonan el proyecto en carpetas con nombres distintos, el project name por defecto puede cambiar
- eso cambia nombres de contenedores, redes y otros recursos
- puede generar pequeñas diferencias molestas si no lo hacés explícito

Esto no siempre es un problema grave.
Pero sí es una fuente clásica de fricción tonta.

---

## Cuándo conviene fijar el project name

Suele convenir fijarlo cuando:

- querés nombres más previsibles entre máquinas
- tenés varios stacks similares y querés distinguirlos bien
- el proyecto lo toca más de una persona
- querés evitar que el nombre de la carpeta mande demasiado

Tenés varias formas válidas documentadas por Docker:

### Con `-p`
```bash
docker compose -p miapp up -d
```

### Con variable de entorno
```bash
COMPOSE_PROJECT_NAME=miapp docker compose up -d
```

### Con top-level `name`
```yaml
name: miapp
services:
  app:
    image: nginx
```

---

## Qué enseñanza deja la precedencia

Docker documenta una precedencia clara:
`-p` tiene prioridad máxima, después `COMPOSE_PROJECT_NAME`, después `name:` y recién después el directorio. citeturn387813search8turn387813search13

La idea útil no es memorizar la tabla exacta.
La idea útil es esta:

> si querés previsibilidad, no dependas solo del nombre de la carpeta.

---

## Cuarto concepto: los servicios se descubren por nombre de servicio

Docker documenta que dentro de la red por defecto de Compose, los contenedores son alcanzables por el **nombre del servicio**. citeturn614051search21

Por ejemplo, si tenés:

```yaml
services:
  app:
    image: miusuario/app
  db:
    image: postgres:18
```

`app` puede hablar con `db` usando `db` como hostname.

### Qué enseñanza deja esto
- el nombre del servicio ya importa muchísimo
- conviene que sea claro, corto y estable
- no hace falta inventar nombres raros a nivel container para la comunicación interna

Esto conecta directo con la siguiente convención.

---

## Quinto concepto: `container_name` no siempre ayuda

Docker documenta algo muy concreto:
si un servicio define `container_name`, Compose no puede escalarlo más allá de una instancia. citeturn387813search0

Por ejemplo:

```yaml
services:
  app:
    image: nginx
    container_name: mi-app
```

### Qué problema te puede traer
- te ata a un nombre fijo
- perdés flexibilidad
- y si más adelante querés escalar el servicio, choca con esa decisión

---

## Cuándo suele ser mejor no usar `container_name`

Suele ser mejor evitarlo cuando:

- querés dejar abierta la posibilidad de escalar
- no necesitás un nombre fijo por una razón realmente fuerte
- ya te alcanza con el naming automático de Compose
- querés dejar el stack más portable y menos acoplado

Esto no significa que `container_name` esté prohibido.
Significa que **debería ser una excepción consciente**, no una costumbre.

---

## Sexto concepto: nombres de servicio claros valen mucho más que nombres de contenedor personalizados

En vez de obsesionarte con `container_name`, suele ser mucho más sano elegir bien:

- `proxy`
- `app`
- `worker`
- `db`
- `redis`

### Qué gana esto
- descubrimiento interno claro
- logs y comandos más claros
- menos fricción para el equipo
- mejor lectura del `compose.yaml`

Es una convención chica, pero con mucho retorno.

---

## Séptimo concepto: `docker compose config` como fuente de verdad del modelo final

Docker documenta que `docker compose config` renderiza el modelo real que Compose va a aplicar: fusiona archivos, resuelve variables y expande notación corta. citeturn614051search3

Por ejemplo:

```bash
docker compose config
```

### Qué problema resuelve
- dejar de discutir “qué debería quedar”
- mirar qué **realmente** quedó después de merges e interpolación
- validar el Compose final antes de ejecutar o compartir

Esto es tremendamente útil en equipos, incluso pequeños.

---

## Qué conviene revisar con `docker compose config`

Suele servir para confirmar cosas como:

- nombre de proyecto efectivo
- puertos finales
- imágenes reales
- variables resueltas
- merges entre base y override
- configuración expandida en sintaxis más explícita

Es una herramienta de claridad, no solo de debugging.

---

## Octavo concepto: rebuild y nombres de imagen previsibles

Docker documenta que `docker compose build` reconstruye servicios y que, por defecto, los servicios quedan etiquetados como `project-service` si no definiste un nombre de imagen explícito. citeturn387813search12

### Qué enseñanza deja esto
- el project name vuelve a importar mucho
- si el nombre del proyecto es impredecible, también lo serán ciertas etiquetas y recursos
- otra vez se refuerza la idea de usar una convención clara

Esto conecta perfecto con todo lo anterior.

---

## Un conjunto simple de convenciones bastante sano

Podrías cerrar un proyecto con algo así:

1. `compose.yaml` como archivo base compartido.
2. `compose.override.yaml` solo para overrides locales razonables.
3. project name explícito si la previsibilidad importa.
4. nombres de servicio cortos, claros y estables.
5. evitar `container_name` salvo necesidad real.
6. usar `docker compose config` para revisar la configuración final antes de discutir o ejecutar.

Esto ya reduce muchísima fricción.

---

## Qué no tenés que confundir

### Archivo canónico no significa que no pueda haber overrides
Significa que hay una base clara.

### Project name no es lo mismo que nombre de servicio
Uno agrupa el proyecto; el otro nombra cada componente.

### `container_name` no es una mejora automática
A veces es una limitación innecesaria. citeturn387813search0

### `docker compose config` no reemplaza a `up`
Pero sí te muestra el modelo final antes de aplicarlo. citeturn614051search3

---

## Error común 1: tener varios archivos Compose y no dejar claro cuál es la base real

Eso mete fricción inmediata.

---

## Error común 2: depender del nombre de la carpeta para todo sin darte cuenta

Eso vuelve menos predecible el proyecto entre máquinas. citeturn387813search8turn387813search13

---

## Error común 3: usar `container_name` por costumbre y bloquear escalado futuro

Docker lo documenta explícitamente. citeturn387813search0

---

## Error común 4: no correr nunca `docker compose config` y discutir merges o variables a ciegas

Ahí falta una fuente de verdad del Compose final. citeturn614051search3

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Respondé con tus palabras:

- por qué `compose.yaml` te parece una buena convención base
- cuándo usarías `compose.override.yaml`
- por qué conviene que el proyecto tenga un archivo Compose canónico

### Ejercicio 2
Respondé además:

- cómo decide Compose el project name por defecto
- qué mecanismos tenés para sobreescribirlo
- por qué podría ser útil fijarlo en un proyecto compartido

### Ejercicio 3
Compará estas dos ideas:

#### Opción A
```yaml
services:
  app:
    image: nginx
```

#### Opción B
```yaml
services:
  app:
    image: nginx
    container_name: mi-app
```

Respondé:

- cuál te parece más flexible
- por qué
- qué problema futuro puede traerte `container_name`

### Ejercicio 4
Respondé además:

- por qué `docker compose config` te parece valioso antes de ejecutar
- qué cosas concretas revisarías ahí
- por qué esto reduce discusiones o confusiones de equipo

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- si hoy el archivo Compose principal está claro o no
- si hoy el project name depende demasiado de la carpeta
- si hoy usaste `container_name` por costumbre
- qué nombre de servicio te gustaría simplificar
- si te convendría empezar a usar `docker compose config` más seguido
- qué cambio concreto harías primero para reducir fricción en ese proyecto

No hace falta reescribir todavía tu stack real.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre archivo base, override, project name y service name?
- ¿en qué proyecto tuyo hoy hay más fricción de nombres o convenciones?
- ¿qué uso de `container_name` hoy te parece más innecesario?
- ¿qué valor concreto te daría ver el Compose final con `docker compose config`?
- ¿qué mejora concreta te gustaría notar al dejar reglas simples más explícitas?

Estas observaciones valen mucho más que memorizar un solo estilo.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero un archivo Compose base claro y canónico, probablemente me conviene usar ________.  
> Si quiero overrides locales sin ensuciar la base, probablemente me conviene usar ________.  
> Si quiero que el nombre del proyecto sea más predecible entre máquinas, probablemente me conviene fijar el ________ name.  
> Si quiero evitar trabarme con escalado innecesariamente, probablemente me conviene evitar ________ salvo que haya una razón fuerte.  
> Si quiero ver la configuración final realmente aplicada, probablemente me conviene usar `docker compose ________`.

Y además respondé:

- ¿por qué este tema impacta tanto cuando más de una persona toca el proyecto?
- ¿qué proyecto tuyo te gustaría ordenar primero con esta lógica?
- ¿qué riesgo evitás al no dejar nombres y convenciones librados a la costumbre?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- elegir una convención base clara para Compose
- entender mejor cómo funciona el project name y cuándo conviene fijarlo
- decidir con más criterio si `container_name` suma o estorba
- usar `docker compose config` como fuente de verdad del modelo final
- reducir bastante la fricción operativa de un proyecto compartido

---

## Resumen del tema

- `compose.yaml` es el archivo Compose por defecto y preferido; `compose.override.yaml` puede servir como capa de override local. citeturn614051search1turn387813search15
- El project name por defecto se basa en el directorio del proyecto, pero puede sobreescribirse con `-p`, `COMPOSE_PROJECT_NAME` o `name:`. citeturn387813search8turn614051search9turn387813search13
- Los servicios se descubren por nombre dentro de la red del proyecto. citeturn614051search21
- Si un servicio usa `container_name`, Compose no puede escalarlo más allá de una instancia. citeturn387813search0
- `docker compose config` renderiza el modelo final, resolviendo variables, merges y notación corta. citeturn614051search3
- Esta práctica te deja una base mucho más clara para ordenar nombres, archivos y convenciones cuando el proyecto deja de ser solo tuyo.

---

## Próximo tema

En el próximo tema vas a seguir avanzando hacia el cierre final del roadmap con una práctica integrada de estandarización:

- archivo base claro
- project name predecible
- nombres de servicio sanos
- README operativo
- y un proyecto mucho más fácil de compartir y mantener
