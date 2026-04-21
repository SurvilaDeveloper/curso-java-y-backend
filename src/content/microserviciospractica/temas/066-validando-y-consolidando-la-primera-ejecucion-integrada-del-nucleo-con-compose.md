---
title: "Validando y consolidando la primera ejecución integrada del núcleo con Compose"
description: "Checkpoint del módulo 8. Validación y consolidación de la primera ejecución integrada del núcleo de negocio de NovaMarket usando Docker Compose."
order: 66
module: "Módulo 8 · Docker Compose para NovaMarket"
level: "intermedio"
draft: false
---

# Validando y consolidando la primera ejecución integrada del núcleo con Compose

En las últimas clases del módulo 8 dimos un paso muy importante dentro del proyecto:

- creamos el primer `compose.yaml`,
- levantamos `config-server` y `discovery-server` juntos,
- sumamos `catalog-service`,
- sumamos `inventory-service`,
- sumamos `order-service`,
- y con eso empezamos a describir dentro de Compose una porción bastante seria de NovaMarket.

Eso ya tiene muchísimo valor.

Pero ahora conviene hacer, otra vez, lo que venimos haciendo cada vez que el proyecto gana una nueva capa de madurez:

**un checkpoint de consolidación.**

Porque una cosa es haber ampliado la composición paso a paso.  
Y otra bastante distinta es detenerse a mirar qué significa realmente eso para la postura general del sistema.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- NovaMarket ya cuenta con una primera ejecución integrada real de infraestructura más núcleo de negocio,
- esa capa aporta valor genuino al proyecto,
- y el sistema ya empezó a dejar atrás una ejecución demasiado artesanal o demasiado dependiente de comandos manuales sueltos.

Esta clase funciona como checkpoint fuerte del avance inicial en Docker Compose.

---

## Estado de partida

Partimos de un sistema donde ya:

- `config-server` forma parte del Compose,
- `discovery-server` forma parte del Compose,
- `catalog-service`, `inventory-service` y `order-service` ya están dentro del archivo,
- y la composición ya dejó atrás la etapa de “infraestructura mínima” para parecerse mucho más al sistema real.

Eso significa que ya no estamos discutiendo una hipótesis.

Ahora estamos leyendo una mejora real sobre cómo NovaMarket puede ejecutarse como conjunto.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- revisar el valor estructural de esta primera ejecución integrada,
- consolidar cómo se relaciona con todo lo construido antes,
- validar qué cambia en la madurez general del proyecto,
- y dejar este bloque como base estable para el siguiente paso grande dentro del Compose.

---

## Qué queremos comprobar ahora

No queremos mirar solo “si el archivo levanta”.

Queremos observar algo más interesante:

- si NovaMarket ya empezó a comportarse como una aplicación multicontenedor real,
- si el núcleo del negocio ya dejó de depender exclusivamente de ejecuciones separadas y manuales,
- y si el módulo 8 ya ganó una base concreta antes de sumar el borde del sistema.

Ese es el verdadero valor del checkpoint.

---

## Paso 1 · Volver sobre el recorrido de esta etapa

Antes de entrar en detalles, conviene fijar la secuencia que construimos:

- primero entendimos por qué Compose ya tenía sentido,
- después levantamos infraestructura,
- luego sumamos catálogo,
- luego inventario,
- y finalmente órdenes.

Ese encadenamiento importa mucho porque muestra que esta etapa no apareció aislada, sino como una evolución natural después del bloque de Dockerfiles y servicios dockerizados.

---

## Paso 2 · Consolidar la relación entre imágenes aisladas y sistema integrado

Este es uno de los puntos más importantes de toda la clase.

A esta altura ya conviene poder decir algo como:

- dockerizar servicios por separado fue clave,
- pero Compose agrega una capa totalmente nueva:
- el sistema ya no se piensa solo como un conjunto de imágenes, sino como una aplicación integrada descrita de forma declarativa.

Ese cambio importa muchísimo porque mueve a NovaMarket a una postura mucho más seria desde el punto de vista operativo.

---

## Paso 3 · Entender qué valor tiene haber incorporado el núcleo del negocio

También vale mucho notar que no nos quedamos solo en infraestructura.

Sumamos al Compose:

- catálogo,
- inventario,
- y órdenes

Eso tiene muchísimo valor técnico y pedagógico.

¿Por qué?

Porque hace que la composición ya no sea solo una base de soporte, sino una descripción bastante reconocible del corazón funcional del sistema.

Ese salto es enorme.

---

## Paso 4 · Revisar qué cambió en la madurez del proyecto

A esta altura conviene fijar algo importante:

antes, NovaMarket ya podía correr en Docker, pero más como suma de piezas separadas.

Ahora, en cambio, además empieza a tener una noción más clara de que:

- varias piezas importantes pueden vivir juntas,
- el arranque del sistema puede declararse en un archivo central,
- y el proyecto ya no depende tanto de una ejecución manual repartida entre terminales y flags.

Ese cambio vuelve al sistema bastante más serio desde el punto de vista operativo.

---

## Paso 5 · Entender qué todavía no está resuelto

También conviene dejar algo claro:

después de este checkpoint todavía siguen existiendo muchos pasos posibles, por ejemplo:

- sumar `api-gateway`,
- fortalecer el borde del sistema dentro de Compose,
- trabajar mejor el orden de arranque,
- agregar healthchecks,
- o mejorar todavía más la lectura declarativa del conjunto.

Eso está bien.

La meta de esta etapa nunca fue cerrar todo Compose de una sola vez.  
Fue empezar con algo real, útil y bien visible.

Y eso sí se logró muy bien.

---

## Paso 6 · Pensar por qué esto mejora muchísimo el siguiente tramo

Este punto importa mucho.

A partir de ahora, sumar `api-gateway` al Compose va a ser mucho más fácil de sostener porque ya existe una primera referencia concreta de cómo se ve NovaMarket cuando infraestructura y núcleo del negocio ya conviven dentro de una misma definición multicontenedor.

Eso significa que esta clase no solo cierra una etapa.  
También prepara muy bien todo lo que viene después.

---

## Paso 7 · Comparar el proyecto actual con el del comienzo del módulo

Si miramos el recorrido hasta acá, la evolución ya empieza a verse bastante clara:

### Antes del módulo 8
- imágenes de servicios listas
- contenedores levantados de forma suelta
- más dependencia de comandos manuales

### Ahora
- infraestructura definida en Compose
- núcleo del negocio definido en Compose
- y una ejecución integrada mucho más seria y más repetible

Ese cambio vale muchísimo porque ya mueve a NovaMarket hacia una postura bastante más madura también en la forma de arrancar su arquitectura.

---

## Paso 8 · Entender qué NO estamos afirmando todavía

Conviene dejar esto muy claro.

En este punto todavía no estamos diciendo:

- que NovaMarket ya corre completo en Compose,
- ni que el archivo ya representa la arquitectura final entera,
- ni que toda la ejecución integrada quedó resuelta.

Eso sería exagerado.

Lo que sí podemos decir con bastante honestidad es algo mucho más valioso:

- NovaMarket ya dejó de tratar a su infraestructura y a su núcleo funcional como piezas que solo podían levantarse de forma artesanal y separada.

Y eso ya es un avance muy fuerte.

---

## Qué estamos logrando con esta clase

Esta clase consolida una primera ejecución integrada real del núcleo de negocio con Compose.

Ya no estamos solo describiendo imágenes individuales.  
Ahora también estamos mostrando que una parte bastante seria del sistema ya puede declararse y levantarse como aplicación multicontenedor.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- sumamos `api-gateway`,
- ni consolidamos todavía una experiencia Compose que represente también el borde de entrada del sistema.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**validar y consolidar la primera ejecución integrada del núcleo de negocio de NovaMarket usando Compose.**

---

## Errores comunes en esta etapa

### 1. Pensar que esta etapa solo “metió servicios al archivo”
En realidad cambió bastante la postura operativa del proyecto.

### 2. Reducir el valor del bloque a que `docker compose up` funciona
El valor real está en la nueva forma de describir el sistema.

### 3. Confundir núcleo integrado con sistema completo final
Todavía no estamos ahí.

### 4. Exagerar lo logrado
Todavía falta sumar el borde del sistema y seguir refinando la composición.

### 5. No consolidar este paso antes de abrir el siguiente frente
Eso haría más difícil sostener la lógica del módulo.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener una visión bastante más clara de cómo la primera ejecución integrada del núcleo con Compose mejora la postura general de NovaMarket y por qué esta evolución ya representa una madurez real dentro del módulo 8.

Eso deja muy bien preparado el siguiente tramo del curso rehecho.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué agrega tener infraestructura + núcleo del negocio en Compose,
- ves que el sistema ya es más integrado y más declarativo que antes,
- entendés qué cosas sí mejoraron y cuáles todavía quedan abiertas,
- y sentís que NovaMarket ya ganó una nueva capa concreta de madurez desde ejecución multicontenedor integrada.

Si eso está bien, entonces el bloque ya puede pasar al siguiente frente con una base mucho más fuerte.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a sumar `api-gateway` al Compose para empezar a completar una experiencia de ejecución integrada mucho más parecida a la aplicación real de NovaMarket, ahora sí incluyendo también el borde del sistema.

---

## Cierre

En esta clase validamos y consolidamos la primera ejecución integrada del núcleo con Compose.

Con eso, NovaMarket ya no solo tiene servicios dockerizados y contenedores sueltos: también empieza a tener una aplicación multicontenedor bastante más seria, bastante más declarativa y mucho más cercana a una ejecución integrada real del sistema.
