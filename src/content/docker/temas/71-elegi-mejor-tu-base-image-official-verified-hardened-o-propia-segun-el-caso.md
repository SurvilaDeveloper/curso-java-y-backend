---
title: "Elegí mejor tu base image: official, verified, hardened o propia según el caso"
description: "Tema 71 del curso práctico de Docker: cómo elegir una base image con más criterio, cuándo conviene empezar desde una Docker Official Image, cuándo mirar Verified Publisher o Hardened Images, y en qué casos tiene sentido crear o mantener una base propia."
order: 71
module: "Elegir bases e imágenes con criterio"
level: "intermedio"
draft: false
---

# Elegí mejor tu base image: official, verified, hardened o propia según el caso

## Objetivo del tema

En este tema vas a:

- entender qué es realmente una base image
- distinguir entre imágenes oficiales, verificadas, hardened y propias
- elegir mejor desde qué imagen arrancar un servicio nuevo
- pensar en confianza, tamaño, mantenimiento y reproducibilidad
- evitar decisiones improvisadas en el `FROM` de tus Dockerfiles

La idea es que no elijas una imagen base “porque sí”, sino con un criterio bastante más profesional.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender qué rol cumple una base image
2. ver qué recomienda Docker como punto de partida
3. distinguir Official Images, Verified Publisher y Hardened Images
4. pensar cuándo conviene una base propia
5. construir una regla práctica para elegir mejor el `FROM`

---

## Idea central que tenés que llevarte

Toda imagen arranca desde otra imagen.

Eso significa que, antes incluso de pensar tu aplicación, ya estás tomando una decisión muy importante:

- de seguridad
- de mantenimiento
- de tamaño
- de compatibilidad
- y de confianza en la fuente

Dicho simple:

> elegir una base image no es un detalle menor del Dockerfile;  
> es una de las decisiones más importantes de toda la imagen.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker dice que el primer paso para lograr una imagen segura es elegir la base correcta, y recomienda usar imágenes de una fuente confiable y mantenerlas pequeñas. Docker destaca que las Docker Official Images son una colección curada con buena documentación, buenas prácticas y actualizaciones regulares, y que también existen imágenes de Verified Publisher y Docker-Sponsored Open Source dentro del conjunto de trusted content de Docker Hub. Además, la documentación de base images recuerda que en la mayoría de los casos no necesitás crear tu propia base image desde cero, porque Docker Hub ya ofrece muchas imágenes adecuadas para usar como base. citeturn565823view0turn565823view1turn565823view2

---

## Qué es una base image

Docker define una base image como la imagen que tu Dockerfile extiende, es decir, lo que aparece en la instrucción `FROM`. citeturn565823view2

Por ejemplo:

```Dockerfile
FROM node:22
```

o:

```Dockerfile
FROM python:3.13-slim
```

o incluso:

```Dockerfile
FROM scratch
```

Esa línea no solo trae un sistema base.
Trae una herencia técnica bastante grande:

- paquetes
- librerías
- herramientas
- políticas de actualización
- tamaño
- superficie de ataque
- y modelo de mantenimiento

---

## Primer criterio: empezá por una fuente confiable

Docker recomienda explícitamente elegir imágenes construidas desde una fuente confiable y mantenerlas pequeñas. También señala que, al elegir una base, conviene mirar los badges y programas de trusted content en Docker Hub. citeturn565823view0turn565823view1

Eso te da una primera regla muy buena:

> antes de mirar detalles finos, preguntate si la imagen viene de una fuente en la que realmente querés confiar.

---

## Docker Official Images

Docker documenta que las Docker Official Images son un conjunto curado de repositorios en Docker Hub y recomienda usarlas en tus proyectos. También explica que tienen documentación clara, promueven buenas prácticas y se actualizan con regularidad. citeturn565823view1turn565823view0

Ejemplos típicos:

- `nginx`
- `postgres`
- `node`
- `python`
- `ubuntu`
- `alpine`

### Cuándo suelen tener mucho sentido
- cuando arrancás un servicio nuevo
- cuando querés una base conocida y bien documentada
- cuando no necesitás nada demasiado exótico
- cuando querés una opción segura y razonable como punto de partida

Para muchísimos proyectos, una Official Image es la opción más sensata para empezar.

---

## Verified Publisher

Docker también documenta las imágenes de Verified Publisher como imágenes de alta calidad publicadas y mantenidas por organizaciones asociadas, con autenticidad verificada por Docker. citeturn565823view0turn565823view1

### Cuándo suelen tener sentido
- cuando necesitás una imagen oficial de un proveedor o empresa concreta
- cuando el software no tiene una Official Image
- cuando querés una fuente más confiable que un repositorio cualquiera

No son lo mismo que una Official Image, pero siguen entrando en el universo de trusted content.

---

## Docker-Sponsored Open Source

Docker también incluye imágenes mantenidas por proyectos open source patrocinados por Docker dentro de trusted content. citeturn565823view0turn565823view1

### Cuándo puede tener sentido
- cuando tu stack depende de una herramienta open source concreta
- y querés una opción más confiable que “la imagen que encontré por ahí”

No hace falta memorizar todas las categorías.
Lo importante es ver el mapa:
Docker te da señales de confianza para elegir mejor la fuente.

---

## Docker Hardened Images

Docker documenta las Docker Hardened Images (DHI) como imágenes mínimas, seguras y listas para producción, diseñadas para reducir vulnerabilidades y simplificar compliance. También explica que son minimal-by-design y que, al incluir menos componentes, pueden reducir tamaño, superficie de ataque y overhead operativo. citeturn565823view4turn565823view5

### Cuándo suelen tener mucho sentido
- en entornos con foco fuerte en seguridad
- cuando querés una base más minimalista
- cuando compliance o supply chain importan bastante
- cuando tu organización ya trabaja con DHI o necesita ese nivel de endurecimiento

No siempre van a ser tu primera opción de aprendizaje o desarrollo local.
Pero son muy importantes en escenarios más profesionales o regulados.

---

## Qué significa “keep it small”

Docker, en best practices, dice explícitamente que conviene mantener la imagen pequeña. citeturn565823view0

Eso no significa elegir la imagen más chica a ciegas.
Significa algo más razonable:

- no meter más de lo necesario
- no arrancar desde una base gigante si no hace falta
- no sumar componentes irrelevantes
- reducir superficie de ataque y peso

La clave no es obsesionarse con el número exacto de MB.
La clave es no sobredimensionar la base.

---

## ¿Base pequeña o base conocida?

Acá entra una decisión importante.

A veces una imagen pequeña ayuda mucho.
Pero a veces una base demasiado minimalista puede volverte el desarrollo o la compatibilidad más difíciles.

Por ejemplo, según la documentación de Docker Hardened Images, hoy conviven variantes más minimalistas y también variantes compatibles con Alpine o Debian para distintos niveles de familiaridad y compatibilidad. citeturn565823view5

Entonces, una regla sana sería:

- no elijas “la más chica” por deporte
- elegí la más pequeña **que siga siendo razonable para tu caso**

---

## ¿Cuándo conviene una base propia?

Docker recuerda que, en la mayoría de los casos, no necesitás crear tu propia base image porque Docker Hub ya ofrece muchas bases adecuadas. Pero también documenta que podés crear una base propia desde una distro elegida o incluso desde `scratch` cuando necesitás control total del contenido. citeturn565823view2

### Cuándo puede tener sentido una base propia
- cuando necesitás control muy fino del contenido
- cuando tu organización estandariza un runtime interno
- cuando querés imponer una base común a muchos servicios
- cuando el costo de mantener esa base se justifica de verdad

### Cuándo no conviene apurarse a hacerlo
- cuando todavía estás resolviendo cosas básicas
- cuando una Official Image ya cubre muy bien el caso
- cuando no querés heredar mantenimiento extra

Una base propia no es “más profesional” por sí sola.
A veces es una carga innecesaria.

---

## ¿Y `FROM scratch`?

Docker documenta `scratch` como una base mínima y reservada para construir imágenes muy reducidas, pero también aclara que esto puede ser difícil salvo en programas pequeños y simples. Además, remarca que reducir tamaño y superficie de ataque es deseable, pero que una base mínima total no siempre es práctica para cualquier aplicación. citeturn565823view2

### Cuándo puede tener sentido
- binarios pequeños
- herramientas muy simples
- imágenes donde sabés exactamente qué necesitás

### Cuándo no conviene forzarlo
- si tu app depende de muchas librerías o runtime
- si te complica demasiado debug, compatibilidad o mantenimiento

`FROM scratch` es potente, pero no es una medalla que haya que ganar siempre.

---

## Reproducibilidad: tags vs digests

Docker documenta que los tags son cómodos, pero que los digests son inmutables: si usás un digest, fijás exactamente esa versión de la imagen. También aclara que eso mejora la reproducibilidad, aunque no recibirás actualizaciones nuevas automáticamente hasta cambiar el digest. citeturn565823view3

Por ejemplo:

```Dockerfile
FROM ubuntu:24.04
```

vs

```Dockerfile
FROM ubuntu@sha256:2e863c44b718727c860746568e1d54afd13b2fa71b160f5cd9058fc436217b30
```

### Regla práctica
- tag claro para facilidad y legibilidad
- digest cuando la reproducibilidad exacta importa mucho

Esto no significa que siempre tengas que pinnear todo al digest desde el día 1.
Sí significa que entendás el trade-off.

---

## Un criterio muy útil para elegir base

Podés hacerte estas preguntas en orden:

### 1. ¿La fuente es confiable?
Si no, frená ahí.

### 2. ¿Ya existe una Official Image o una imagen verificada que cubra bien el caso?
Si sí, probablemente sea tu mejor primer intento.

### 3. ¿Necesito algo más minimalista o más endurecido?
Ahí puede aparecer Hardened Images o una variante más reducida.

### 4. ¿Realmente necesito una base propia?
Solo si el control extra justifica el mantenimiento extra.

Esta secuencia te evita muchas decisiones impulsivas.

---

## Un ejemplo razonable de arranque

Si vas a crear una API Node nueva, muchas veces algo como esto es una base muy sensata:

```Dockerfile
FROM node:22
```

o quizá una variante más chica según tu caso, siempre dentro de una fuente confiable.

La idea no es que memorices “esta es la mejor”.
La idea es que entiendas por qué una Official Image suele ser el punto de partida más sano.

---

## Un ejemplo donde quizás querés subir el estándar

Si tu organización prioriza muchísimo seguridad, compliance y reducción de superficie de ataque, ahí ya puede tener sentido mirar una Hardened Image o una política más estricta de bases aprobadas. Docker incluso documenta políticas de ejemplo para restringir imágenes base a registros aprobados y para pinnearlas a digests. citeturn915220search7turn915220search14

Esto muestra que elegir una base no es solo una decisión técnica local.
También puede ser una decisión organizacional.

---

## Qué no tenés que confundir

### Official Image no significa automáticamente “mejor en todos los casos”
Significa un punto de partida muy confiable y recomendable. citeturn565823view0turn565823view1

### Imagen más chica no significa automáticamente “mejor”
La compatibilidad y el mantenimiento también importan.

### Base propia no significa automáticamente “más profesional”
Puede significar más carga de mantenimiento.

### Pinnear por digest no significa “más seguro por sí solo”
Significa más reproducibilidad. Después tenés que actualizarlo cuando quieras cambios o parches. citeturn565823view3

---

## Error común 1: elegir una imagen cualquiera porque “funciona”

Docker insiste en elegir una fuente confiable. Esa parte no es opcional si querés un punto de partida sano. citeturn565823view0turn565823view1

---

## Error común 2: saltar a una base propia demasiado pronto

Muchas veces una Official Image ya resuelve perfectamente el caso.

---

## Error común 3: obsesionarse con la base más pequeña sin mirar compatibilidad

A veces la base ultraminimalista te complica más de lo que ayuda.

---

## Error común 4: usar tags móviles sin entender que pueden cambiar

Si necesitás reproducibilidad exacta, el digest existe justamente para eso. citeturn565823view3

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Respondé con tus palabras:

- qué es una base image
- por qué el `FROM` es una decisión tan importante
- por qué Docker recomienda empezar por una fuente confiable

### Ejercicio 2
Compará estas opciones conceptualmente:

- una Docker Official Image
- una Verified Publisher image
- una Docker Hardened Image
- una base propia

Y respondé:

- cuál te parece mejor para empezar un servicio nuevo común
- cuál te parece más orientada a seguridad y compliance
- cuál te parece más costosa de mantener
- en cuál confiarías primero si todavía no tenés una necesidad especial

### Ejercicio 3
Respondé además:

- cuándo usarías un tag normal
- cuándo pensarías en pinnear por digest
- qué trade-off aparece ahí

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué imagen base usarías hoy
- por qué confiarías en esa fuente
- si te conviene una base más grande pero conocida o una más minimalista
- si realmente necesitás una base propia o todavía no
- qué decisión te gustaría dejar mejor pensada a partir de este tema

No hace falta escribir el Dockerfile final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre fuente confiable y base “cualquiera”?
- ¿en qué proyecto tuyo hoy estás eligiendo la base con menos criterio del que te gustaría?
- ¿qué te pesa más al elegir: confianza, tamaño, compatibilidad o mantenimiento?
- ¿cuándo te imaginás que una base propia sí se justificaría?
- ¿qué parte del tema de digests te parece más útil para trabajo real?

Estas observaciones valen mucho más que memorizar nombres de programas de Docker Hub.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero un punto de partida confiable y razonable para muchos casos, probablemente me conviene una ________.  
> Si necesito una opción más endurecida y minimalista para producción o compliance, probablemente me conviene mirar ________.  
> Si necesito reproducibilidad exacta, probablemente me conviene pinnear por ________.

Y además respondé:

- ¿por qué esta decisión impacta tanto en todo lo demás que viene después?
- ¿qué servicio tuyo te gustaría revisar primero con este criterio?
- ¿qué riesgo evitás al no elegir una base improvisada?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar qué es una base image y por qué importa tanto
- distinguir mejor Official Images, Verified Publisher, Hardened Images y bases propias
- elegir una base con más criterio según el caso
- entender el trade-off entre tags y digests
- arrancar servicios nuevos de una forma bastante más profesional

---

## Resumen del tema

- Docker recomienda elegir una base de una fuente confiable y mantenerla pequeña. citeturn565823view0
- Las Docker Official Images son una colección curada, bien documentada y actualizada regularmente, y Docker recomienda usarlas en los proyectos. citeturn565823view1turn565823view0
- Docker Hub también ofrece trusted content como Verified Publisher, Docker-Sponsored Open Source y Docker Hardened Images. citeturn565823view1turn565823view4
- En la mayoría de los casos no necesitás crear tu propia base image, aunque Docker permite hacerlo cuando necesitás control total, incluso desde `scratch`. citeturn565823view2
- Pinnear una imagen por digest mejora reproducibilidad, pero no actualiza automáticamente a versiones nuevas. citeturn565823view3
- Este tema te deja una base de criterio mucho más madura para decidir el `FROM` de tus próximos Dockerfiles.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque con una decisión todavía más concreta:

- Debian vs Alpine vs slim
- compatibilidad, tamaño y debug
- cuándo una base más chica ayuda y cuándo complica
- y cómo elegir una variante con más criterio
