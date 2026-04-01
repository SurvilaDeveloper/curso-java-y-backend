---
title: "Inspect sin adivinar: mirá estado real, puertos, mounts, variables y redes antes de tocar nada"
description: "Tema 103 del curso práctico de Docker: cómo usar docker inspect para leer metadata real de contenedores, imágenes y volúmenes, cuándo conviene mirar el JSON completo y cuándo usar --format para extraer exactamente lo que necesitás."
order: 103
module: "Inspección, metadata y diagnóstico con criterio"
level: "intermedio"
draft: false
---

# Inspect sin adivinar: mirá estado real, puertos, mounts, variables y redes antes de tocar nada

## Objetivo del tema

En este tema vas a:

- entender qué problema resuelve `docker inspect`
- dejar de adivinar estado, mounts, puertos o variables cuando Docker ya te los puede mostrar
- usar el JSON completo como fuente de verdad
- empezar a sacar datos puntuales con `--format`
- distinguir mejor cuándo inspeccionar un contenedor, una imagen o un volumen

La idea es que, antes de tocar, borrar o corregir algo, aprendas a mirar el estado real del objeto Docker que tenés adelante.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender qué devuelve `docker inspect`
2. ver cuándo conviene mirar primero el JSON completo
3. usar `--format` para sacar solo lo importante
4. inspeccionar contenedores, imágenes y volúmenes
5. construir una regla práctica para diagnosticar con menos intuición y más evidencia

---

## Idea central que tenés que llevarte

Cuando trabajás con Docker, una enorme cantidad de información ya existe dentro de los objetos que el daemon administra:

- estado del contenedor
- variables de entorno
- mounts
- puertos
- redes
- labels
- configuración de imagen
- metadata de volúmenes

Docker documenta que `docker inspect` devuelve información detallada de bajo nivel sobre objetos controlados por Docker y que, por defecto, la muestra como un array JSON. Además, `docker container inspect`, `docker image inspect` y `docker volume inspect` ofrecen versiones especializadas con el mismo enfoque de salida JSON y soporte para `--format`. citeturn330034search0turn330034search3turn330034search2turn330034search21

Dicho simple:

> si Docker ya sabe el dato exacto,  
> conviene inspeccionarlo antes de suponerlo.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker deja varias ideas muy claras para este tema:

- `docker inspect` devuelve información detallada de bajo nivel sobre objetos Docker y, por defecto, la renderiza como un array JSON. citeturn330034search0
- `docker container inspect`, `docker image inspect` y `docker volume inspect` también aceptan `--format` para extraer partes concretas del objeto inspeccionado. citeturn330034search3turn330034search2turn330034search21
- Docker soporta **Go templates** para formatear la salida de comandos, incluyendo `inspect`. citeturn330034search1
- la documentación de networking recuerda que un contenedor recibe una IP por cada red Docker a la que se adjunta, lo que explica por qué en inspect aparecen datos bajo `NetworkSettings` y redes concretas. citeturn330034search4turn330034search19
- la documentación de port publishing explica que los puertos publicados se mapean al host mediante NAT/PAT, algo que también podés corroborar en inspect revisando los bindings de puertos. citeturn330034search12
- Docker documenta además que los labels son metadata sobre objetos como imágenes, contenedores, volúmenes y redes, lo que también se vuelve visible vía inspect. citeturn330034search16

---

## Primer concepto: qué hace `docker inspect`

El comando básico es:

```bash
docker inspect NOMBRE_O_ID
```

Docker documenta que este comando devuelve información detallada de bajo nivel sobre objetos controlados por Docker. citeturn330034search0

### Qué tipo de objetos puede inspeccionar
- contenedores
- imágenes
- volúmenes
- redes
- contextos
- y otros objetos Docker según el subcomando o tipo

---

## Qué enseñanza deja esto

Deja una idea muy poderosa:

> `inspect` no es un comando “de detalle raro”;  
> es una fuente de verdad muy útil para diagnóstico cotidiano.

Muchos problemas diarios se aclaran cuando dejás de mirar solo nombres o estados resumidos y empezás a mirar metadata real.

---

## Segundo concepto: el JSON completo es el punto de partida más sano

Docker documenta que la salida por defecto de `docker inspect` es un array JSON. citeturn330034search0

Entonces, si querés empezar por la visión completa, el camino natural es simplemente:

```bash
docker inspect mi-contenedor
```

---

## Por qué conviene mirar primero el JSON completo

Porque muchas veces todavía no sabés exactamente qué campo necesitás.

Tal vez querés entender:

- si el contenedor está realmente corriendo
- qué variables tiene
- qué mounts se aplicaron
- qué red está usando
- qué puerto está publicado
- qué imagen exacta lo creó

Y eso a veces se ve más claro cuando primero recorrés el objeto entero.

---

## Tercer concepto: después sí, `--format`

Una vez que ya sabés qué querés extraer, Docker documenta que podés usar `--format` con Go templates. citeturn330034search0turn330034search1turn330034search3turn330034search2turn330034search21

Por ejemplo:

```bash
docker inspect --format '{{.State.Status}}' mi-contenedor
```

### Qué te da
- solo el estado del contenedor
- sin todo el resto del JSON

Este paso suele ser muchísimo más útil después de mirar el objeto completo al menos una vez.

---

## Cuarto concepto: qué cosas suele interesarte inspeccionar en un contenedor

En la práctica, algunos de los grupos de datos más valiosos suelen ser:

- estado
- variables de entorno
- mounts
- puertos
- redes
- labels

No hace falta memorizar todo el árbol JSON hoy.
Lo importante es entender que `inspect` suele ser el camino para confirmar estas cosas sin adivinarlas.

---

## Un caso típico: estado real del contenedor

Podés querer saber si está:

- running
- exited
- restarting

Con algo como:

```bash
docker inspect --format '{{.State.Status}}' mi-contenedor
```

Esto encaja perfecto con la idea de no depender solo de intuiciones del tipo “creo que se reinició” o “parece que está levantado”.

---

## Otro caso típico: variables de entorno

Si querés confirmar qué variables quedaron realmente en el contenedor, podés inspeccionar la configuración y mirar el bloque de entorno.

Un ejemplo útil podría ser:

```bash
docker inspect --format '{{json .Config.Env}}' mi-contenedor
```

### Qué gana esto
- ves el array real de variables
- confirmás si una variable está o no
- dejás de adivinar si Compose, el Dockerfile o tu shell terminó imponiendo cierto valor

Esto es especialmente valioso cuando venís de trabajar con `ARG`, `ENV` y overrides de Compose.

---

## Otro caso típico: mounts

Muchas veces querés confirmar si un contenedor tiene:

- bind mount
- named volume
- rutas montadas en el lugar que pensabas

Un ejemplo útil puede ser:

```bash
docker inspect --format '{{json .Mounts}}' mi-contenedor
```

### Qué gana esto
- ves source, destination y tipo de mount
- confirmás si realmente se montó lo que esperabas
- evitás seguir adivinando por qué “no aparece” cierto archivo o por qué una ruta quedó tapada

Esto conecta muy bien con todo el bloque de storage.

---

## Otro caso típico: puertos publicados

Docker documenta que los puertos publicados se mapean al host. citeturn330034search12

Entonces, si querés ver bindings reales en un contenedor, también podés inspeccionar su metadata de red.

Por ejemplo:

```bash
docker inspect --format '{{json .NetworkSettings.Ports}}' mi-contenedor
```

### Qué gana esto
- confirmás si el puerto está publicado
- ves a qué host/puerto quedó asociado
- evitás seguir mirando Compose o el Dockerfile como si fueran la única fuente de verdad

Esto vale muchísimo cuando el contenedor real no quedó igual a como vos creías.

---

## Otro caso típico: redes e IPs

Docker documenta que un contenedor recibe una IP por cada red Docker a la que se une. citeturn330034search4turn330034search19

Eso explica por qué `inspect` puede mostrar datos de redes e IPs bajo `NetworkSettings`.

Un ejemplo útil sería:

```bash
docker inspect --format '{{json .NetworkSettings.Networks}}' mi-contenedor
```

### Qué gana esto
- ves en qué redes está realmente
- confirmás IPs por red
- entendés mejor por qué un contenedor ve o no ve a otro

Esto conecta muy bien con todo el bloque de networking.

---

## Quinto concepto: también podés inspeccionar imágenes

Docker documenta `docker image inspect` como comando especializado para imágenes, también con `--format`. citeturn330034search2

Esto es muy útil cuando querés confirmar cosas como:

- labels de imagen
- configuración base
- digest
- arquitectura/plataforma
- variables heredadas en la imagen
- command/entrypoint configurados

---

## Qué tipo de preguntas responde bien `image inspect`

Por ejemplo:

- ¿esta imagen tiene tal label?
- ¿qué `Env` trae baked-in?
- ¿cuál es su digest o metadata de plataforma?
- ¿qué configuración expone antes de crear contenedor?

Ahí `docker image inspect` suele encajar mejor que mirar solo `docker images`.

---

## Sexto concepto: también podés inspeccionar volúmenes

Docker documenta `docker volume inspect` y explica que devuelve información sobre uno o más volúmenes, con salida JSON o `--format`. citeturn330034search21

Esto es muy útil cuando querés confirmar:

- nombre exacto del volumen
- driver
- labels
- mountpoint real
- metadata útil para no borrar a ciegas

Esto conecta perfecto con el bloque de limpieza que acabás de cerrar.

---

## Un caso muy sano con volúmenes

Si no estás seguro de qué volumen contiene qué o si un volumen sigue siendo importante, una idea mucho más sana que borrar por impulso es inspeccionarlo primero.

Por ejemplo:

```bash
docker volume inspect db-data
```

La idea no es memorizar cada campo hoy.
La idea es acostumbrarte a mirar antes de tocar.

---

## Séptimo concepto: los labels también viven acá

Docker documenta que los labels son metadata aplicable a objetos como imágenes, contenedores, volúmenes y redes. citeturn330034search16

Eso significa que `inspect` también es un lugar natural para confirmar:

- qué labels tiene un objeto
- si Compose o tu Dockerfile aplicó metadata como esperabas
- si un objeto está marcado para cierto propósito o pipeline

Este punto va a volverse cada vez más útil cuando tengas entornos más grandes o automatizados.

---

## Un patrón sano para usar inspect

Una secuencia muy útil suele ser esta:

### 1. Primero, ver el JSON completo
```bash
docker inspect mi-contenedor
```

### 2. Después, extraer solo lo que importa
```bash
docker inspect --format '{{.State.Status}}' mi-contenedor
docker inspect --format '{{json .Mounts}}' mi-contenedor
docker inspect --format '{{json .Config.Env}}' mi-contenedor
```

Este orden suele ser muchísimo más sano que empezar intentando recordar templates de memoria sin haber visto el objeto primero.

---

## Qué no tenés que confundir

### `inspect` no reemplaza a comandos resumidos
Los complementa. Te da el detalle cuando lo necesitás.

### JSON completo no significa que tengas que leer todo siempre
Sirve para orientarte; después conviene filtrar con `--format`.

### Un Compose file o un Dockerfile no siempre son la fuente final de verdad
El objeto ya creado puede diferir de lo que recordabas. `inspect` te muestra el estado real.

### Ver una IP o un puerto en docs no significa que el contenedor real quedó así
Otra vez: el objeto real manda.

---

## Error común 1: seguir suponiendo mounts o variables sin inspeccionarlos

Eso suele alargar muchísimo diagnósticos que se resolvían en segundos.

---

## Error común 2: usar `--format` sin haber mirado nunca el árbol JSON

A veces terminás buscando a ciegas un campo que no entendés dónde vive.

---

## Error común 3: borrar volúmenes o imágenes sin inspeccionar metadata útil antes

Eso conecta con los riesgos del bloque anterior.

---

## Error común 4: confiar demasiado en lo que “debería haber pasado” según Compose

Cuando el objeto real ya existe, `inspect` es una fuente de verdad mucho más fuerte.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Respondé con tus palabras:

- qué problema resuelve `docker inspect`
- por qué conviene mirar primero el JSON completo
- por qué `--format` se vuelve más útil después de eso

### Ejercicio 2
Imaginá que querés confirmar estas cosas de un contenedor:

- si está running o exited
- qué variables tiene
- qué mounts tiene
- qué puertos están publicados
- en qué redes está

Respondé:

- por qué `inspect` te parece una mejor fuente de verdad que seguir adivinando
- qué ventaja te da poder extraer exactamente el campo que querés

### Ejercicio 3
Respondé además:

- cuándo te convendría usar `docker image inspect`
- cuándo te convendría usar `docker volume inspect`
- por qué esto conecta muy bien con troubleshooting y limpieza

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué dato te gustaría confirmar con `inspect` primero: mounts, puertos, variables o redes
- si hoy estás confiando demasiado en lo que “debería” haber quedado y no en lo que realmente quedó
- qué contenedor te gustaría inspeccionar primero
- qué volumen te gustaría revisar antes de borrarlo
- qué mejora concreta te gustaría notar al diagnosticar con más evidencia

No hace falta ejecutar nada todavía.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre estado real y configuración esperada?
- ¿en qué proyecto tuyo hoy `inspect` te ahorraría más tiempo?
- ¿qué parte del árbol JSON te gustaría aprender a leer primero?
- ¿qué dato seguís adivinando y deberías empezar a inspeccionar?
- ¿qué mejora concreta te gustaría notar al dejar de diagnosticar por intuición?

Estas observaciones valen mucho más que memorizar templates aislados.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero ver la metadata real de un objeto Docker, probablemente me conviene usar `docker ________`.  
> Si primero quiero entender el objeto completo, probablemente me conviene mirar la salida en ________.  
> Si después quiero extraer solo un dato puntual, probablemente me conviene usar `--________`.  
> Si quiero revisar un volumen antes de borrarlo, probablemente me conviene usar `docker volume ________`.

Y además respondé:

- ¿por qué este tema impacta tanto en troubleshooting con menos intuición y más evidencia?
- ¿qué objeto tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no tocar recursos sin inspeccionarlos?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar qué devuelve `docker inspect`
- usar el JSON completo como punto de partida sano
- extraer datos puntuales con `--format`
- distinguir mejor cuándo inspeccionar contenedores, imágenes o volúmenes
- diagnosticar con mucha más evidencia y bastante menos adivinanza

---

## Resumen del tema

- `docker inspect` devuelve información detallada de bajo nivel sobre objetos Docker y, por defecto, la muestra como un array JSON. citeturn330034search0
- `docker container inspect`, `docker image inspect` y `docker volume inspect` soportan `--format` para extraer partes concretas del objeto. citeturn330034search3turn330034search2turn330034search21
- Docker usa Go templates para formatear la salida de comandos. citeturn330034search1
- Un contenedor recibe una IP por cada red a la que se adjunta, lo que vuelve muy útil inspeccionar `NetworkSettings` y redes efectivas. citeturn330034search4turn330034search19
- Los puertos publicados se mapean al host mediante NAT/PAT, y eso también puede verse reflejado en la metadata de red inspeccionada. citeturn330034search12
- Los labels son metadata aplicable a imágenes, contenedores, volúmenes y redes, y también se vuelven visibles vía inspect. citeturn330034search16
- Este tema te deja una base muy sólida para mirar objetos Docker con bastante más precisión y menos suposiciones.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque con otra capa muy útil:

- filtros más prácticos con `--format`
- datos puntuales de estado, mounts y redes
- y una forma más rápida de pasar de un JSON enorme a respuestas concretas
