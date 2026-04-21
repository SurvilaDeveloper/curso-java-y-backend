---
title: "Entendiendo por qué Docker Compose ya tiene sentido en NovaMarket"
description: "Inicio del siguiente gran tramo del curso rehecho. Comprensión de por qué, después de dockerizar varios servicios de negocio, ya conviene pasar de contenedores sueltos a una ejecución integrada con Docker Compose."
order: 61
module: "Módulo 8 · Docker Compose para NovaMarket"
level: "intermedio"
draft: false
---

# Entendiendo por qué Docker Compose ya tiene sentido en NovaMarket

En la clase anterior cerramos una primera tanda muy importante del bloque de Docker:

- dockerizamos `catalog-service`,
- dockerizamos `inventory-service`,
- dockerizamos `order-service`,
- y con eso dejamos empaquetado el núcleo principal de negocio de NovaMarket.

Eso ya tiene muchísimo valor.

Pero ahora aparece una pregunta muy natural:

**si ya tenemos varias piezas dockerizadas, cuándo empieza a tener sentido dejar de levantarlas como contenedores sueltos y pasar a una ejecución integrada con Docker Compose?**

Ese es el terreno de esta clase.

Porque una cosa es tener:

- varias imágenes construidas,
- varios `docker run`,
- y varios servicios empaquetados por separado.

Y otra bastante distinta es empezar a pedirle al proyecto algo más serio:

- que sus servicios se levanten juntos,
- que compartan una red coherente,
- que la configuración de la ejecución no viva desperdigada en comandos manuales,
- y que el arranque del sistema empiece a verse más como una arquitectura coordinada que como una colección de contenedores independientes.

Ese es exactamente el siguiente problema que vamos a abrir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- claro por qué Docker Compose ya tiene sentido en este punto del proyecto,
- entendida la diferencia entre “contenedores sueltos” y “ejecución integrada del sistema”,
- alineado el modelo mental para empezar a definir servicios en un `compose.yaml`,
- y preparado el terreno para escribir el primer archivo Compose real de NovaMarket.

Todavía no vamos a levantar toda la arquitectura completa en una sola clase.  
La meta de hoy es entender por qué este nuevo frente aparece exactamente ahora.

---

## Estado de partida

Partimos de un sistema donde ya:

- varios servicios de negocio están dockerizados,
- el patrón de empaquetado ya se repitió varias veces,
- y NovaMarket ya dejó de depender exclusivamente del IDE para ejecutar sus piezas principales.

Eso significa que el problema ya no es solo:

- “cómo empaqueto un servicio”
- o
- “cómo corro una imagen”

Ahora empieza a importar otra pregunta:

- **cómo corro varias piezas juntas sin volverme dependiente de una lista larga de comandos manuales y frágiles**

Y esa pregunta cambia muchísimo el nivel del proyecto.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar por qué Docker Compose aparece como siguiente evolución natural,
- entender qué tipo de problemas resuelve mejor que una secuencia larga de `docker run`,
- conectar esta idea con el estado actual de NovaMarket,
- y dejar clara la lógica del siguiente gran tramo práctico.

---

## Qué problema queremos resolver exactamente

Hasta ahora, Docker ya nos ayudó a resolver algo muy importante:

- cada servicio puede empaquetarse de forma portable.

Eso fue un gran salto.

Pero a medida que el proyecto madura, aparece otra necesidad muy concreta:

**que varias piezas del sistema puedan levantarse juntas con una configuración declarativa, compartiendo red y sin depender de un arranque manual demasiado artesanal.**

Porque ahora conviene hacerse preguntas como:

- ¿cómo levanto `config-server` y `discovery-server` sin escribir un comando separado para cada uno?
- ¿cómo conecto servicios entre sí sin recordar una lista de flags?
- ¿cómo dejo documentado en el repo qué piezas componen el sistema y cómo se ejecutan juntas?
- ¿cómo paso de “muchas imágenes” a “una primera forma integrada de correr la aplicación”?  

Ese cambio de enfoque es justamente el corazón de esta etapa.

---

## Qué es Docker Compose en este contexto

Para esta etapa del curso, una forma útil de pensarlo es esta:

**Docker Compose es la forma de describir y ejecutar una aplicación multicontenedor a partir de un archivo declarativo, en vez de depender de muchos `docker run` escritos a mano.**

Esa idea es central.

No estamos hablando todavía de una plataforma final de orquestación.  
Estamos hablando de algo mucho más razonable y muy valioso para el punto donde está NovaMarket:

- un archivo claro,
- servicios definidos de forma explícita,
- redes y puertos descritos en un lugar central,
- y una ejecución integrada más fácil de repetir.

Ese cambio ya aporta muchísimo valor.

---

## Qué gana NovaMarket cuando entra en Compose

Aunque todavía no hayamos escrito el archivo, el valor ya se puede ver con claridad.

A partir de Compose, NovaMarket empieza a ganar cosas como:

- una ejecución más repetible,
- una vista más clara del sistema como conjunto,
- una configuración centralizada del arranque,
- y una base muchísimo más fuerte para seguir creciendo después.

Eso vuelve al proyecto mucho más serio desde el punto de vista operativo.

---

## Por qué no conviene meter todo el sistema de una sola vez

Este punto importa muchísimo.

Si intentáramos meter desde ya:

- `config-server`
- `discovery-server`
- `catalog-service`
- `inventory-service`
- `order-service`
- `api-gateway`
- y tal vez bases de datos o dependencias futuras

todo en un solo salto, el bloque podría volverse demasiado pesado y confuso.

En cambio, lo más sano en esta etapa es algo bastante más claro:

1. entender por qué Compose ya tiene sentido
2. arrancar por una primera versión chica y controlada
3. verificar bien el patrón
4. y recién después expandirlo al resto del sistema

Ese orden hace que el bloque sea muchísimo más sólido.

---

## Por qué Compose encaja tan bien después de Dockerfiles repetidos

Esto también importa mucho.

Si todavía no hubiéramos dockerizado varios servicios, Compose se sentiría prematuro.

Pero justo ahora sí encaja muy bien, porque ya tenemos:

- imágenes de negocio reales,
- un patrón de Dockerfile bastante consistente,
- y un sistema que ya está listo para empezar a pensarse como una aplicación multicontenedor.

Ese orden es muy sano y muy coherente con el recorrido del curso rehecho.

---

## Qué piezas conviene llevar primero a Compose

A esta altura del proyecto, una primera aproximación razonable suele empezar por algo como:

- `config-server`
- `discovery-server`
- y al menos un servicio de negocio

¿Por qué?

Porque esas piezas ya dejan ver muy bien el valor de Compose:

- varias unidades vivas,
- dependencias lógicas entre ellas,
- y necesidad clara de una red común.

No hace falta todavía abrir todo el sistema de golpe.

---

## Qué cambia conceptualmente entre `docker run` y Compose

Esta diferencia conviene fijarla muy bien.

### Con `docker run`
- el arranque vive en comandos sueltos
- la red y los puertos se recuerdan manualmente
- y el sistema se siente más artesanal

### Con Compose
- el sistema se define en un archivo
- los servicios quedan descritos juntos
- la ejecución se vuelve mucho más repetible
- y el proyecto ya empieza a documentar mejor cómo debe levantarse como conjunto

Ese cambio importa muchísimo.

---

## Qué todavía no estamos haciendo en esta etapa

Conviene dejar esto muy claro.

En este punto todavía no estamos:

- levantando toda la arquitectura completa con Compose,
- ni resolviendo todavía toda la historia de salud, orden fino de arranque o readiness real,
- ni dando el salto final a Kubernetes desde Compose.

La meta actual es mucho más concreta:

**abrir correctamente el bloque de Docker Compose y dejar claro por qué NovaMarket ya está listo para empezar a ejecutarse como aplicación multicontenedor.**

Y eso ya aporta muchísimo valor.

---

## Qué estamos logrando con esta clase

Esta clase no crea todavía un `compose.yaml`, pero hace algo muy importante:

**abre explícitamente el siguiente gran bloque práctico del curso rehecho.**

Eso importa muchísimo, porque NovaMarket deja de madurar solo como conjunto de servicios dockerizados por separado y empieza a prepararse para otra mejora clave: ejecutarse como una aplicación integrada y declarada en un único archivo.

---

## Qué todavía no hicimos

Todavía no:

- elegimos formalmente qué piezas van a entrar primero al archivo Compose,
- ni escribimos todavía la primera versión real de `compose.yaml`.

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender por qué Docker Compose ya tiene sentido en NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Pensar que Docker Compose solo sirve cuando ya está todo dockerizado
Puede abrirse gradualmente y de forma incremental.

### 2. Querer meter toda la arquitectura de una sola vez
Conviene empezar con una primera versión pequeña y bien entendida.

### 3. Confundir Compose con la solución final de orquestación
Todavía estamos en una capa intermedia muy valiosa, pero no final.

### 4. No ver el valor declarativo del archivo Compose
Ese valor es justamente una de sus mayores fortalezas.

### 5. No conectar Compose con el trabajo previo de Dockerfiles
Compose tiene sentido ahora precisamente porque el bloque anterior ya dejó varias imágenes listas.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener claro por qué NovaMarket ya está listo para empezar a usar Docker Compose y por qué ese paso aparece ahora como siguiente evolución natural del bloque de Dockerización.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés por qué varias imágenes ya justifican una ejecución integrada,
- ves la diferencia entre contenedores sueltos y aplicación multicontenedor,
- entendés que no hace falta empezar por todo el sistema,
- y sentís que el curso ya está listo para un primer `compose.yaml` real.

Si eso está bien, ya podemos pasar a crearlo.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a crear el primer `compose.yaml` real de NovaMarket y usarlo para levantar de forma integrada `config-server` y `discovery-server`, estableciendo la base del resto del bloque.

---

## Cierre

En esta clase entendimos por qué Docker Compose ya tiene sentido en NovaMarket.

Con eso, el curso rehecho deja de pensar solo en servicios dockerizados por separado y empieza a prepararse para otra mejora muy valiosa: ejecutar el sistema como una aplicación multicontenedor mucho más clara, declarativa y repetible.
