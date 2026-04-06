---
title: "Thymeleaf, FreeMarker y compañía: qué revisar sin paranoia vacía"
description: "Cómo revisar Thymeleaf, FreeMarker y otros motores de templates en aplicaciones Java con Spring Boot sin caer ni en alarmismo ni en confianza ciega. Qué preguntas conviene hacer, qué superficies importan de verdad y dónde suele aparecer riesgo real."
order: 206
module: "Expresiones, templates y ejecución indirecta"
level: "base"
draft: false
---

# Thymeleaf, FreeMarker y compañía: qué revisar sin paranoia vacía

## Objetivo del tema

Entender **qué revisar de verdad** en motores de templates como **Thymeleaf**, **FreeMarker** y otros equivalentes del ecosistema Java + Spring Boot, sin caer ni en:

- la confianza ciega de “esto es solo HTML con variables”
ni en
- la paranoia vacía de “todo template engine implica desastre automático”

La idea de este tema es continuar directamente lo que vimos sobre **SSTI en Java**.

Ya entendimos que:

- un template server-side no es solo presentación
- hay un motor que interpreta una sintaxis declarativa
- el problema aparece cuando input no confiable influye demasiado lo que el motor evalúa
- y no hace falta que el usuario escriba una plantilla completa para que exista una superficie delicada

Ahora toca bajar esa intuición a la realidad del ecosistema Java web.

Porque en la práctica, cuando alguien usa templates server-side, muchas veces usa motores muy conocidos como:

- **Thymeleaf**
- **FreeMarker**
- u otros equivalentes

Y ahí aparecen dos errores opuestos.

## Error 1
“Como es una tecnología común de Spring/Java web, no debería preocupar demasiado.”

## Error 2
“Como es un template engine, seguro todo uso ya es casi explotación.”

Ambos son malos puntos de partida.

En resumen:

> revisar Thymeleaf, FreeMarker y compañía bien no consiste en asumir que todo template engine es automáticamente crítico ni en tratarlo como simple HTML con azúcar sintáctica,  
> sino en entender qué evalúa, qué contexto recibe, qué parte del render controla el backend y qué parte quedó demasiado cerca de input externo.

---

## Idea clave

La idea central del tema es esta:

> un motor de templates no se vuelve riesgoso por existir,  
> sino por la combinación de:
- **capacidad del motor**
- **contexto disponible**
- **flexibilidad del diseño**
- y **grado de influencia del input no confiable sobre la lógica de render**

Eso ayuda mucho a bajar el tema a tierra.

Porque no todos los usos son iguales.

### Hay usos más razonables:
- plantillas fijas
- datos claramente tratados como datos
- fragmentos controlados por el servidor
- poco contexto expuesto
- poca composición dinámica

### Y hay usos mucho más delicados:
- nombres de vista dinámicos
- fragmentos influenciados por input
- templates editables o componibles
- expresiones mezcladas con cadenas externas
- demasiado acceso a contexto interno
- demasiada magia en el render

### Idea importante

La pregunta madura no es:
- “¿usa Thymeleaf o FreeMarker?”
La pregunta madura es:
- “¿qué tanto poder le dio el sistema a ese motor en este caso concreto?”

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- discutir template engines solo por reputación
- pensar que Thymeleaf o FreeMarker son “seguros” o “inseguros” en abstracto
- no revisar qué parte del render es fija y qué parte es dinámica
- no distinguir el motor del uso que hace la aplicación
- confundir variables mostradas con expresiones evaluadas
- no modelar cuánto contexto del backend queda expuesto en la plantilla

Es decir:

> el problema no es solo qué motor usa la app.  
> El problema es cómo lo usa y qué parte del render deja influida por input no confiable.

---

## Error mental clásico

Un error muy común es este:

### “El riesgo depende solo del motor”

Eso simplifica demasiado.

Sí, la tecnología concreta importa.
Pero el riesgo real cambia muchísimo según cosas como:

- si las plantillas son internas o editables
- si el nombre de la vista es fijo o dinámico
- si el input solo llena datos o también influye estructura
- si el motor recibe mucho contexto del backend
- si hay helpers, beans o mecanismos extra disponibles
- si la composición de fragmentos es rígida o flexible

### Idea importante

El motor importa.
Pero **el diseño concreto del render importa todavía más**.

---

# Parte 1: Qué revisar primero: el uso, no la fama

## La intuición simple

Cuando veas Thymeleaf, FreeMarker o algo similar, lo primero no debería ser pensar:

- “¿esta tecnología tiene mala fama?”
o
- “¿esta tecnología es estándar?”

La primera pregunta útil debería ser:

- **¿qué parte del render controla realmente el backend y qué parte puede variar?**

### Idea útil

Muchas veces una tecnología “potente” puede estar bastante acotada en un uso.
Y una tecnología “normalita” puede estar muy mal usada en otro.

### Regla sana

No arranques la revisión por reputación del motor.
Arrancala por:
- flujo,
- contexto,
- y poder del input.

---

# Parte 2: Templates fijas vs templates dinámicas

Esta distinción es central.

## Templates fijas
- definidas por el equipo
- versionadas
- ubicadas del lado del sistema
- con estructura controlada
- input usado solo como datos visibles

## Templates dinámicas
- elegidas según parámetro
- fragmentos componibles desde strings
- layouts variables
- partes editables por admin o usuario
- composición más abierta
- expresiones o bloques influenciados por input

### Idea importante

La segunda categoría es mucho más delicada, aunque el motor sea el mismo.

### Regla sana

La seguridad de templates suele subir cuando el backend controla totalmente la estructura y baja cuando empieza a externalizar decisiones de render.

---

# Parte 3: Qué parte del contexto ve la plantilla

Otro punto muy importante no es solo la plantilla en sí, sino el **contexto** que recibe.

Conviene preguntarse:

- ¿qué objetos llegan al render?
- ¿qué helpers están disponibles?
- ¿hay acceso amplio a beans, utilidades o datos internos?
- ¿qué navegación de propiedades permite el motor?
- ¿qué cosas puede resolver además de valores simples?

### Idea útil

Un motor de templates se vuelve más delicado cuanto más rico es el mundo que la plantilla puede ver o recorrer.

### Regla sana

Cuando revises un template engine, no mires solo la sintaxis.
Mirá también el universo de objetos y ayudas que tiene disponible.

---

# Parte 4: Thymeleaf y FreeMarker no son “solo HTML con variables”

Esto conviene dejarlo bien claro.

Desde afuera, un template engine puede parecer:

- placeholders
- condiciones
- loops
- fragmentos
- helpers visuales

Y sí, esa es parte de la historia.
Pero esa misma expresividad es la que obliga a revisar bien:

- qué se evalúa
- qué contexto está disponible
- qué decisiones de composición se vuelven dinámicas
- y cuánto del render sigue bajo control del servidor

### Idea importante

La capacidad de expresar lógica declarativa es justo lo que hace útiles a estos motores y, a la vez, lo que obliga a tratarlos con respeto.

### Regla sana

No banalices el motor por cómo se ve el HTML final.

---

# Parte 5: Qué sería una revisión sana y no paranoica

Una revisión sana evita dos errores:

## Error A: minimizar todo
- “es solo una vista”
- “son templates normales”
- “nunca tuvimos problema”

## Error B: exagerar todo
- “cualquier uso de template engine ya es gravísimo”
- “toda plantilla equivale a ejecución crítica”
- “cualquier HTML server-side ya es SSTI”

### Idea útil

La postura madura hace preguntas concretas:

- ¿el input influye estructura o solo contenido?
- ¿hay fragmentos o vistas dinámicas?
- ¿qué contexto expone el motor?
- ¿hay templates editables?
- ¿qué parte del render se compone con strings?
- ¿qué expresividad necesitaba realmente el negocio?

### Regla sana

La buena revisión baja el tema del mito a la arquitectura concreta.

---

# Parte 6: Nombres de vista, fragmentos e includes: una zona especialmente traicionera

Esto suele ser una de las superficies más subestimadas en proyectos reales.

El equipo a veces permite cosas como:

- elegir una vista según parámetro
- seleccionar un fragmento por nombre
- componer layouts
- incluir bloques dinámicos
- decidir una plantilla por tipo o categoría

Todo eso puede sonar razonable.
Pero ya no es solo “mostrar datos”.
Es empezar a hacer dinámico el mecanismo de render.

### Idea importante

Cuando el backend deja que input influya nombres de template o fragmentos, el problema deja de estar solo en las variables y pasa a tocar la estructura del render.

### Regla sana

Cuanto más variable sea el mapa de vistas o fragmentos, más importante se vuelve controlar estrictamente quién decide esas variaciones.

---

# Parte 7: Templates editables por admin o terceros

Esta superficie merece atención especial.

A veces una app no deja que usuarios comunes editen templates, pero sí:

- admins
- operadores
- partners
- equipos de negocio
- clientes enterprise
- integraciones de branding o personalización

Y el equipo piensa:
- “eso ya es interno”
- “lo toca gente de confianza”
- “es una feature administrativa”

### Problema

Eso puede seguir siendo una superficie muy delicada si el motor que interpreta esas plantillas tiene mucho poder y poca contención.

### Idea útil

La confianza parcial en el editor no reemplaza el modelado del poder del motor.

### Regla sana

Cada vez que alguien fuera del equipo de desarrollo toca plantillas o fragmentos, preguntate si el mecanismo de render sigue teniendo demasiado poder para ese caso.

---

# Parte 8: Qué señales indican un uso más sano

Una implementación más sana suele mostrar:

- plantillas controladas por el backend
- nombres de vista fijos o fuertemente acotados
- input usado como dato visible, no como lógica de render
- poco contexto expuesto
- poca composición dinámica innecesaria
- templates editables solo en casos muy justificados y muy acotados
- buena separación entre datos de negocio y estructura de la vista

### Idea importante

La madurez aquí se nota cuando el motor se usa como herramienta de presentación y no como canal flexible de programación declarativa abierta al borde.

### Regla sana

Mientras más fijo sea el esqueleto del render, más fácil es que el motor se mantenga en zona razonable.

---

# Parte 9: Qué señales indican una postura floja

Estas señales merecen revisión fuerte:

- vistas elegidas por input
- fragmentos o includes muy dinámicos
- mezcla de strings externas con lógica de template
- demasiada riqueza de contexto en la plantilla
- plantillas editables con poco control
- el equipo no sabe bien qué capacidades del motor están habilitadas
- se trata al template engine como mero string builder

### Idea importante

Una postura floja no siempre significa “template controlada por usuario final”.
A veces basta con demasiada flexibilidad mal justificada en la composición del render.

---

# Parte 10: Qué preguntas conviene hacer en una review

Cuando revises Thymeleaf, FreeMarker y compañía, conviene preguntar:

- ¿qué motor concreto usa la app?
- ¿qué capacidades expresivas tiene?
- ¿las plantillas son fijas o editables?
- ¿el nombre de la vista o del fragmento puede variar?
- ¿qué parte del input influye el render?
- ¿qué objetos o helpers están disponibles en el contexto?
- ¿el negocio necesitaba realmente ese nivel de flexibilidad?
- ¿qué parte del diseño podría hacerse más rígida y más explícita?

### Idea importante

Estas preguntas suelen separar bastante bien un uso sano de uno que empezó a abrir demasiado poder.

---

# Parte 11: Qué revisar en una app Spring

En una app Spring, conviene sospechar especialmente cuando veas:

- controllers que devuelven nombres de vista construidos dinámicamente
- render de fragmentos según parámetros
- composición de plantillas o layouts a partir de strings
- templates de email o páginas editables
- sistemas de branding, theming o personalización avanzada
- mucha lógica declarativa movida al motor de templates
- contextos ricos con acceso a demasiados objetos del backend

### Idea útil

Si el motor no solo recibe datos sino también decisiones estructurales de render, ya hay una superficie que merece atención seria.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- poca variación estructural
- plantillas internas y controladas
- datos claramente separados de lógica de render
- contextos más pequeños
- menos helpers o accesos innecesarios
- equipos que pueden explicar con claridad qué parte del motor está realmente en uso

### Idea importante

La madurez aquí se nota cuando el equipo sabe exactamente dónde termina la flexibilidad útil y dónde empieza la superficie excesiva.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- “es solo Thymeleaf/FreeMarker”
- nadie sabe bien qué parte del render es dinámica
- hay templates o fragmentos componibles desde input
- el contexto de render es demasiado rico
- el equipo no distingue entre mostrar datos y construir lógica de template
- features de personalización abren demasiado poder sin mucho control

### Regla sana

Si la app ya no puede señalar con claridad qué parte del render está 100% bajo control del backend, probablemente el motor tiene más superficie de la que parece.

---

## Checklist práctica

Para revisar Thymeleaf, FreeMarker y compañía, preguntate:

- ¿qué motor se usa?
- ¿qué capacidades expresivas tiene habilitadas?
- ¿las plantillas son internas o editables?
- ¿quién define vistas, fragmentos e includes?
- ¿qué contexto ve la plantilla?
- ¿qué parte del input influye lógica de render?
- ¿qué parte del diseño podría hacerse más fija?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Qué motor de templates usa?
2. ¿Las plantillas son completamente internas?
3. ¿Hay vistas o fragmentos dinámicos?
4. ¿Qué objetos o helpers ve el contexto?
5. ¿Qué parte del equipo sigue pensando esto como “solo HTML”?
6. ¿Qué flexibilidad aporta valor real y cuál sobra?
7. ¿Qué revisarías primero después de este tema?

---

## Resumen

Thymeleaf, FreeMarker y otros motores de templates en Java no son automáticamente problemáticos ni automáticamente inocentes: el riesgo real depende de cuánto poder tiene el motor, qué contexto recibe y qué parte del render queda influida por input no confiable.

La gran intuición del tema es esta:

- el motor importa, pero su uso concreto importa más
- plantillas fijas y datos acotados suelen ser mucho más defendibles
- nombres de vista, fragmentos, templates editables y contextos ricos agrandan bastante la superficie
- y la revisión madura evita tanto la confianza ciega como la paranoia vacía

En resumen:

> un backend más maduro no revisa Thymeleaf, FreeMarker y compañía por fama ni por miedo genérico, sino por arquitectura concreta: qué evalúan, qué contexto exponen, qué parte del render controla el servidor y qué parte se volvió demasiado dinámica.  
> Entiende que la pregunta importante no es solo “qué motor usamos”, sino “qué tan declarativa, flexible e interpretable se volvió la frontera de render de esta aplicación”.  
> Y justamente por eso este tema importa tanto: porque ayuda a mirar los template engines con criterio técnico y no con reflejos automáticos, identificando dónde de verdad aparece superficie sensible sin convertir cualquier uso de HTML server-side en una alarma vacía.

---

## Próximo tema

**Templates editables por admins o terceros: trust boundaries reales**
