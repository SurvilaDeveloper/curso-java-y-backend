---
title: "`disallow-doctype-decl`: por qué suele ser tan valioso"
description: "Cómo entender `disallow-doctype-decl` en parsers XML de Java y Spring Boot. Por qué suele ser una medida tan valiosa contra XXE, qué clase de superficie recorta desde la raíz y por qué no conviene dejar DTD habilitada cuando el flujo no la necesita."
order: 174
module: "XML, parsers y procesamiento inseguro de documentos"
level: "base"
draft: false
---

# `disallow-doctype-decl`: por qué suele ser tan valioso

## Objetivo del tema

Entender por qué la opción o enfoque equivalente a **`disallow-doctype-decl`** suele ser una de las medidas más valiosas al endurecer parseo XML en aplicaciones Java + Spring Boot.

La idea de este tema es tomar una de las decisiones de hardening más importantes del bloque y explicarla con una intuición muy clara.

Ya vimos que:

- XXE gira mucho alrededor de DTD, entidades y resolución externa
- secure processing ayuda, pero no resuelve todo por sí solo
- factories y parsers importan muchísimo
- usar resolvers o snippets parciales puede dejar demasiada superficie viva
- si una capacidad XML no hace falta, suele ser mejor desactivarla desde la raíz

Acá entra justamente una de las medidas más potentes para esa estrategia:

> **si tu flujo no necesita DTD, bloquear `DOCTYPE` temprano suele recortar una parte enorme de la superficie problemática antes de que el parser llegue siquiera a considerar entidades, definiciones o resolución asociada.**

En resumen:

> `disallow-doctype-decl` suele ser tan valioso porque no intenta solamente vigilar mejor un comportamiento riesgoso,  
> sino que directamente evita que el parser entre en una zona del formato XML que muchos flujos de negocio no necesitan y que, históricamente, abre la puerta a gran parte del riesgo XXE.

---

## Idea clave

La idea central del tema es esta:

> cuando un flujo no necesita DTD, permitir `DOCTYPE` suele agregar poder al documento sin agregar valor real al negocio.

Y ese poder extra es justamente el que vuelve más complicado el parseo seguro.

Porque, desde la intuición del bloque, `DOCTYPE` suele ser una puerta hacia:

- DTD
- definiciones adicionales sobre el documento
- entidades
- expansión
- resolución externa
- y, en general, más capacidad del parser para hacer cosas que el flujo no necesitaba

### Idea importante

Por eso `disallow-doctype-decl` suele ser tan fuerte:
no intenta solo limitar una consecuencia puntual.
Intenta **recortar desde el principio** una familia completa de comportamiento que sobra en la mayoría de los usos modernos de XML no confiable.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- dejar `DOCTYPE` habilitado “por compatibilidad” sin una necesidad clara
- pensar que alcanza con secure processing o con un resolver
- no ver que muchas mitigaciones más complejas empiezan a ser necesarias solo porque DTD siguió viva
- asumir que bloquear entidades externas basta aunque la puerta de `DOCTYPE` siga abierta
- subestimar cuánto simplifica el hardening cortar la capacidad desde más arriba

Es decir:

> el problema no es solo que el parser pueda resolver entidades externas.  
> El problema es que una parte muy importante de esa historia empieza cuando le permitís al documento traer una DTD o una declaración `DOCTYPE` que el flujo ni siquiera necesitaba soportar.

---

## Error mental clásico

Un error muy común es este:

### “Podemos dejar `DOCTYPE` habilitado y controlar el resto con otras flags”

A veces eso puede funcionar en un flujo muy específico y muy bien entendido.
Pero como estrategia general para XML no confiable suele ser más frágil de lo necesario.

Porque al dejar `DOCTYPE` habilitado:

- seguís permitiendo una capa más compleja del formato
- seguís dependiendo de más configuraciones alrededor
- seguís dejando viva una parte del lenguaje XML que el caso de uso probablemente no necesitaba
- y seguís pidiendo que varios controles acierten a la vez

### Idea importante

Si no necesitás DTD, dejarla viva para luego intentar domesticar todo lo que habilita suele ser una postura más compleja y menos robusta que cortarla de raíz.

---

# Parte 1: Qué significa intuitivamente bloquear `DOCTYPE`

## La intuición más simple

Sin meternos todavía en detalles de API, la idea conceptual de **`disallow-doctype-decl`** es algo así:

> “si el documento intenta declarar `DOCTYPE`, el parser no debería aceptarlo para este flujo”.

Eso es muchísimo más potente de lo que parece a primera vista.

Porque no es solo:
- “no me gusta esta sintaxis”

Sino más bien:
- “esta clase de capacidad del formato XML no forma parte del contrato permitido de este input”.

### Idea útil

No se está parcheando una consecuencia.
Se está estrechando el lenguaje que el parser acepta para este caso de uso.

### Regla sana

Cuando el flujo solo necesita leer datos XML simples, aceptar `DOCTYPE` suele ser una concesión que no trae casi beneficio y sí bastante complejidad defensiva.

---

# Parte 2: Por qué `DOCTYPE` es una puerta tan importante

Ya vimos en temas anteriores que la DTD y las entidades son piezas centrales de XXE.

Desde esa intuición, `DOCTYPE` importa tanto porque suele ser el punto de entrada hacia esa zona más poderosa del formato.

### Dicho de forma simple

Si el parser no acepta `DOCTYPE`, entonces:

- le resulta más difícil al documento introducir cierta lógica adicional
- reducís mucho la superficie asociada a DTD
- y evitás que una parte relevante del comportamiento XML siquiera llegue a la mesa

### Idea importante

Por eso esta medida suele tener tanto valor:
- porque corta temprano
- y porque corta arriba, no abajo.

---

# Parte 3: Por qué suele simplificar el hardening

Una de las mayores virtudes de bloquear `DOCTYPE` cuando no hace falta es que **simplifica** la postura defensiva.

Si dejás viva esa parte del formato, normalmente necesitás preocuparte más por:

- qué DTD se acepta
- qué entidades se permiten
- qué se expande
- qué se resuelve
- qué parte del parser o resolver entra en juego
- qué combinaciones de defaults siguen siendo peligrosas

Si en cambio la cortás de raíz, una parte importante del problema deja de existir para ese flujo.

### Idea útil

No es que mágicamente desaparezca toda discusión de seguridad XML.
Pero sí se achica bastante el espacio en el que pueden aparecer ciertas familias de errores.

### Regla sana

En seguridad, simplificar la superficie suele ser mejor que intentar vigilar eternamente una complejidad innecesaria.

---

# Parte 4: Por qué suele ser mejor que confiar solo en restricciones posteriores

Podrías pensar:
- “bueno, dejamos `DOCTYPE`, pero apagamos entidades externas”
- “dejamos `DOCTYPE`, pero usamos un resolver”
- “dejamos `DOCTYPE`, pero activamos secure processing”

Algunas de esas medidas pueden sumar.
Pero cuando `DOCTYPE` no hace falta, muchas veces siguen siendo una defensa más indirecta de la necesaria.

### Idea importante

Entre:
- dejar una puerta abierta y supervisar todo lo que podría pasar después
y
- cerrar la puerta porque el flujo no la necesita  
la segunda opción suele ser más fuerte y más fácil de razonar.

### Regla sana

Siempre que el negocio lo permita, recortar capacidad en origen suele ser preferible a administrar una complejidad que nunca fue necesaria.

---

# Parte 5: La gran pregunta: ¿el flujo realmente necesita DTD?

Esta es probablemente la pregunta más importante del tema.

Y en muchísimos casos modernos, la respuesta real es:
- no
o
- casi nunca
o
- no para input no confiable

### Ejemplos donde muchas veces no hace falta
- leer unos pocos campos XML
- importar estructuras simples
- parsear metadata controlada
- convertir un XML bien acotado
- consumir documentos cuya forma esperada ya está modelada por la aplicación

### Idea útil

A veces `DOCTYPE` queda viva no porque haga falta, sino por:
- defaults
- compatibilidad heredada
- ejemplos viejos
- o simple ausencia de revisión.

### Regla sana

Si el equipo no puede explicar para qué necesita DTD en ese flujo, esa ya es una señal fuerte a favor de deshabilitarla.

---

# Parte 6: Por qué esto ayuda tanto contra XXE

Volvamos a la intuición central del bloque.

XXE depende de que el documento pueda arrastrar al parser a una zona del formato donde:

- se definen entidades
- se expanden referencias
- se resuelven recursos
- y el parser gana más capacidad de la necesaria

Al cortar `DOCTYPE`, en muchos escenarios estás cortando temprano una parte muy importante de ese camino.

### Idea importante

No es la única medida importante.
Pero sí suele ser una de las más estructuralmente valiosas porque reduce la superficie desde bastante arriba.

### Regla sana

Cuando una mitigación ataca una causa habilitante y no solo una consecuencia específica, suele valer mucho.

---

# Parte 7: Por qué también ayuda organizacionalmente

Hay otro beneficio que a veces se subestima:
**vuelve el flujo más entendible**.

Si el parser acepta menos del lenguaje XML total, entonces:

- hay menos comportamiento oculto que modelar
- hay menos necesidad de combinar mil flags
- hay menos dependencia en que reviewers recuerden detalles raros
- hay menos folklore sobre resolvers y defaults

### Idea útil

La mejor seguridad no solo reduce ataques.
También reduce ambigüedad interna en el equipo.

### Regla sana

Un parser que rechaza temprano capacidades innecesarias suele ser más fácil de explicar, de revisar y de mantener.

---

# Parte 8: Cuándo NO conviene asumir que alcanza por sí sola

Aunque esta medida sea tan valiosa, conviene no transformarla en otro talismán.

Porque todavía quedan preguntas como:

- ¿qué otras capacities XML siguen activas?
- ¿el parser está bien endurecido en general?
- ¿hay otras APIs o librerías XML hermanas?
- ¿el runtime sigue siendo muy rico?
- ¿hay flujos documentales que usan otro parser distinto?
- ¿el equipo realmente confirmó que el `DOCTYPE` está bloqueado en todos los caminos relevantes?

### Idea importante

`disallow-doctype-decl` puede ser una medida extremadamente potente.
No significa automáticamente que el resto del hardening ya no importe.

### Regla sana

Tomala como una pieza central.
No como una excusa para dejar de revisar lo demás.

---

# Parte 9: Cuando el negocio sí necesita algo más complejo

También hay que ser honestos:
no todos los flujos XML son iguales.
Puede haber casos más específicos donde el sistema sí necesite cierto comportamiento relacionado con DTD o estructuras más complejas.

En esos casos:

- el análisis cambia
- el margen de hardening se vuelve más fino
- y ya no alcanza con la postura simple de “apagalo y listo”

### Idea útil

Pero ese debería ser el caso especial, no el default.
Y si aparece, conviene documentarlo y defenderlo explícitamente.

### Regla sana

La carga de justificar `DOCTYPE` debería estar del lado de quien quiere dejarla viva, no del lado de quien quiere desactivarla.

---

# Parte 10: El valor de una política por defecto más estrecha

Una política madura suele ser algo como:

- para XML no confiable, rechazar `DOCTYPE` salvo necesidad muy clara y documentada
- y solo abrir excepciones cuando haya una justificación técnica fuerte

### Idea importante

Eso invierte muy sanamente la carga de seguridad:
- el parser no arranca aceptando demasiado
- arranca aceptando menos
- y el equipo debe justificar cualquier ampliación

### Regla sana

En seguridad, los defaults estrechos suelen ser más sostenibles que las excepciones infinitas sobre defaults amplios.

---

# Parte 11: Qué preguntas conviene hacer sobre esta medida

Cuando veas una configuración relacionada con `disallow-doctype-decl`, conviene preguntar:

- ¿este flujo necesita DTD de verdad?
- ¿qué parte del caso de uso lo justificaría?
- ¿esta medida está aplicada explícitamente o se asume?
- ¿aplica al parser real que usa el flujo?
- ¿hay otras rutas XML que no la heredan?
- ¿qué parte del riesgo XML sigue viva incluso con esto activo?
- ¿el equipo entiende por qué esta medida es valiosa o solo la copió?

### Idea importante

Una buena configuración no es solo la que existe.
Es la que el equipo sabe defender conceptualmente.

---

# Parte 12: Por qué suele ser mejor que dejar todo abierto y usar un resolver

Volvamos un momento al tema anterior.

Un resolver puede ayudar, sí.
Pero si la necesidad real del flujo no incluye DTD, muchas veces sigue siendo mejor:

- no llegar nunca a esa etapa
que
- llegar a esa etapa y luego interceptarla con lógica adicional

### Idea útil

Cerrar antes suele ser más simple que vigilar después.

### Regla sana

Entre:
- permitir una capacidad compleja con supervisión
y
- rechazar esa capacidad porque no aporta valor al flujo  
la segunda opción suele ser más robusta.

---

# Parte 13: Qué señales indican que esta medida está bien ubicada

Hay buenas señales de uso sano cuando:

- el equipo sabe que el flujo no necesita DTD
- la medida está aplicada explícitamente
- forma parte de un hardening más amplio
- la factory está clara y visible
- no depende de folklore
- reviewers pueden explicar qué superficie recorta

### Idea importante

Cuando esto pasa, `disallow-doctype-decl` deja de ser una línea copiada y pasa a ser una decisión de diseño: “este input no necesita esta parte del lenguaje XML”.

---

# Parte 14: Qué señales de ruido deberían prender alarma

Estas señales merecen revisión fuerte:

- nadie sabe si el flujo necesita DTD
- la medida no está, pero todos asumen que “seguro la librería ya lo resuelve”
- está en un lado, pero no en otros parsers hermanos
- el equipo confía más en secure processing o en resolvers que en cortar `DOCTYPE`
- nadie puede explicar qué recorta esta configuración
- el sistema sigue aceptando más XML del que el negocio realmente necesita

### Regla sana

Si `DOCTYPE` sigue habilitada por inercia y no por necesidad, probablemente hay superficie sobrante.

---

## Qué revisar en una app Spring

Cuando revises `disallow-doctype-decl` en una aplicación Spring o Java, mirá especialmente:

- qué factories XML se usan
- si el flujo realmente necesita DTD
- si la medida está aplicada de forma explícita
- si el parser real la respeta
- si DOM, SAX y otras rutas XML del sistema están alineadas
- si hay librerías de terceros donde no tenés el mismo control
- qué impacto dominante te preocupa más si la medida falta: lectura local, SSRF o DoS
- qué otra parte del hardening todavía necesitás aunque esta medida exista

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- XML no confiable con `DOCTYPE` deshabilitada por default
- justificaciones claras cuando eso no es posible
- factories entendibles y explícitas
- menor dependencia en resolvers o defaults mágicos
- reviewers que saben por qué esta decisión recorta tanto riesgo
- menos complejidad defensiva alrededor de un parser que ya acepta menos cosas

### Idea importante

La madurez aquí se nota cuando el equipo no discute `DOCTYPE` como detalle técnico marginal, sino como una decisión central sobre qué parte del lenguaje XML deja entrar al sistema.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- `DOCTYPE` habilitada por costumbre
- nadie sabe si hace falta
- secure processing usada como excusa para no revisar esto
- resolvers como sustituto de cortar desde la raíz
- diferentes parsers con políticas distintas
- el equipo no puede explicar por qué esta medida sería valiosa o por qué no está

### Regla sana

Si el documento puede traer capacidades XML que el negocio no necesita, lo raro debería ser permitirlas, no bloquearlas.

---

## Checklist práctica

Cuando veas `disallow-doctype-decl`, preguntate:

- ¿este flujo necesita DTD?
- ¿la medida está aplicada explícitamente?
- ¿qué parser real la usa?
- ¿qué superficie XML corta de raíz?
- ¿qué parte del riesgo sigue viva igual?
- ¿hay parsers o librerías hermanas donde todavía falta?
- ¿el equipo entiende esta decisión o solo la copió?

---

## Mini ejercicio de reflexión

Tomá un flujo XML de tu app Spring y respondé:

1. ¿Necesita DTD de verdad?
2. ¿Quién podría justificar mantenerla activa?
3. ¿El parser la rechaza explícitamente hoy?
4. ¿Qué parte del hardening se simplificaría si la cortaras de raíz?
5. ¿Qué otra mitigación seguirías necesitando igual?
6. ¿Qué librería o factory revisarías primero para comprobarlo?
7. ¿Qué explicación dejarías documentada para el equipo?

---

## Resumen

`disallow-doctype-decl` suele ser tan valioso porque, cuando el flujo no necesita DTD, permite recortar desde la raíz una parte importante de la superficie XML que habilita:

- definiciones adicionales
- entidades
- expansión
- resolución externa
- y parte de la complejidad que luego se intenta domesticar con controles más indirectos

En resumen:

> un backend más maduro no se pregunta solo cómo vigilar mejor lo que el parser podría hacer después de aceptar `DOCTYPE`, sino primero si tenía algún sentido dejarlo llegar hasta ahí en un flujo que solo necesitaba leer datos XML sencillos.  
> Y justamente por eso esta medida vale tanto: porque no se limita a endurecer una consecuencia puntual, sino que achica el lenguaje aceptado por el parser y elimina desde bastante arriba una puerta histórica hacia XXE.  
> No reemplaza todo el hardening restante, pero sí suele ser una de las decisiones más potentes, más simples de justificar y más fáciles de sostener en el tiempo cuando el caso de uso real no necesita esa parte del formato.

---

## Próximo tema

**Entidades externas vs expansión interna: qué sigue siendo riesgoso**
