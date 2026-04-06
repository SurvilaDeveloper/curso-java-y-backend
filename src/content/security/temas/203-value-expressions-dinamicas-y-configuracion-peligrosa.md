---
title: "`@Value`, expressions dinámicas y configuración peligrosa"
description: "Cómo entender los riesgos de `@Value`, expressions dinámicas y configuración peligrosa en aplicaciones Java con Spring Boot. Por qué no todo valor de configuración es solo dato y qué cambia cuando cadenas dinámicas terminan pasando por mecanismos de resolución con más poder del que el equipo imaginaba."
order: 203
module: "Expresiones, templates y ejecución indirecta"
level: "base"
draft: false
---

# `@Value`, expressions dinámicas y configuración peligrosa

## Objetivo del tema

Entender por qué **`@Value`**, las **expressions dinámicas** y cierta **configuración peligrosa** pueden convertirse en una superficie delicada en aplicaciones Java + Spring Boot, incluso cuando el equipo siente que “solo está leyendo configuración”.

La idea de este tema es continuar directamente lo que vimos sobre SpEL.

Ya entendimos que:

- SpEL no es solo reemplazo de placeholders
- es un motor de expresiones con capacidad real de evaluación
- el problema no depende solo de la sintaxis, sino de quién controla la cadena y qué contexto queda disponible
- y una parte importante del riesgo aparece cuando una cadena deja de ser solo dato y pasa a ser lógica para el framework

Ahora toca mirar una superficie muy natural dentro del ecosistema Spring:

- `@Value`
- resolución de propiedades
- configuración declarativa
- strings dinámicos
- y mecanismos de wiring que el equipo suele vivir como algo “administrativo”, no como una frontera delicada

Y justo ahí aparece una trampa fuerte.

Porque una cosa es:

- tener valores fijos de configuración
- resolver placeholders internos del sistema
- y mantener esa resolución completamente del lado del backend

Y otra muy distinta es:

- mezclar cadenas dinámicas
- dejar que parte de esa cadena venga influida por input no confiable
- o convertir un mecanismo pensado para configuración interna en una capa de evaluación demasiado flexible

En resumen:

> `@Value` y la resolución dinámica de configuración importan porque el problema no es solo “leer variables”,  
> sino qué pasa cuando el sistema deja que cadenas con más poder del debido entren a un mecanismo de resolución que puede interpretar bastante más que un valor plano.

---

## Idea clave

La idea central del tema es esta:

> no toda “configuración” es solo dato.  
> A veces, una cadena que parece un valor termina entrando en un mecanismo de **resolución o evaluación** con bastante más poder del que el equipo le atribuye.

Eso cambia bastante la conversación.

Porque una cosa es:

- leer una propiedad estática
- inyectarla
- y usarla como dato

Y otra muy distinta es:

- permitir que una cadena dinámica llegue a `@Value` o a mecanismos equivalentes
- dejar que se resuelva contra contexto, placeholders o expresiones
- y tratar el resultado como si el sistema solo hubiera “cargado config”

### Idea importante

El problema no está solo en qué valor se obtiene.
También está en **cómo se obtiene** y **qué motor participó en esa resolución**.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- pensar que `@Value` es siempre inocente por ser “configuración”
- no distinguir valor estático de cadena evaluable
- mezclar input dinámico con resolución de propiedades o expresiones
- tratar placeholders, interpolation y evaluation como si fueran casi lo mismo
- no ver que una capa administrativa del framework puede volverse frontera de ejecución indirecta
- subestimar el poder de una configuración demasiado flexible o demasiado derivada de datos externos

Es decir:

> el problema no es usar `@Value` para configuración interna razonable.  
> El problema es dejar que cadenas externas o semiinternas entren demasiado cerca de un mecanismo que el framework usa para resolver más que simples valores.

---

## Error mental clásico

Un error muy común es este:

### “Esto no es evaluación peligrosa; es solo configuración del framework”

Eso puede ser verdad en muchos casos sanos.
Pero deja de ser una buena descripción si:

- la cadena no es realmente fija
- se arma dinámicamente
- mezcla placeholders con otras expresiones
- o parte de su contenido puede ser influido por fuentes que el diseño no modeló bien

### Idea importante

La palabra “configuración” puede ocultar demasiada confianza si el valor dejó de ser puramente declarativo y pasó a depender de resolución rica.

---

# Parte 1: Qué hace `@Value`, a nivel intuitivo

## La intuición simple

`@Value` suele percibirse como una forma cómoda de:

- inyectar propiedades
- resolver valores
- evitar wiring manual
- o componer configuración declarativa

Desde la experiencia del developer, eso se siente muy natural:

- hay una propiedad
- el framework la resuelve
- llega el valor a un campo o constructor
- y listo

### Idea útil

Ese flujo es razonable cuando el valor realmente es solo un dato controlado por el sistema.

### Regla sana

Cada vez que veas `@Value`, preguntate primero:
- “¿esto es una propiedad interna fija?”
o
- “¿hay algo más dinámico o evaluable metido acá?”

---

# Parte 2: Cuándo `@Value` suma

Tampoco conviene demonizarlo.

`@Value` suma cuando se usa para:

- propiedades internas claras
- valores de entorno bien controlados
- flags o umbrales razonables
- wiring declarativo pequeño
- defaults simples del sistema

### Idea importante

En esos casos, el valor sigue siendo mayormente dato, no lógica abierta al borde.

### Regla sana

`@Value` suele ser perfectamente razonable mientras el sistema mantenga la expresión o el valor completamente bajo control interno y con semántica chica.

---

# Parte 3: Cuándo empieza el problema

El problema empieza cuando la frontera entre:

- valor
- placeholder
- expresión
- y cadena dinámica

se vuelve borrosa.

Eso puede pasar cuando:

- una cadena deja de ser fija
- se construye parcialmente con datos variables
- se alimenta desde configuración editable sin buen modelo de confianza
- se mezcla con mecanismos de resolución más ricos
- o el equipo ya no puede explicar claramente qué parte del valor es dato y qué parte es evaluable

### Idea importante

Ahí la conversación deja de ser solo “inyección de config” y empieza a parecerse mucho más a evaluación indirecta.

### Regla sana

Si una propiedad deja de ser estática y se vuelve demasiado interpretable, ya hay una superficie nueva que revisar.

---

# Parte 4: Configuración interna vs configuración influida por terceros

Esta distinción es central.

## Configuración interna controlada
- definida por el equipo
- versionada
- bien conocida
- poco expresiva
- pensada para resolver valores acotados

## Configuración influida por terceros
- editable por admins o usuarios
- armada dinámicamente
- compuesta con strings variables
- traída desde otras fuentes del sistema
- usada en contextos que el equipo ya no controla tan claramente

### Idea importante

La misma tecnología puede ser razonable en el primer caso y bastante delicada en el segundo.
La diferencia la marca la **frontera de confianza** y el poder del mecanismo de resolución.

### Regla sana

Siempre preguntate:
- “¿quién define esta configuración y con cuánto control real?”

---

# Parte 5: El problema de llamar “config” a cosas que ya son lógica

Otra trampa muy común:
el equipo mete bajo la palabra “configuración” cosas que en realidad son más parecidas a:

- reglas
- lógica declarativa
- expresiones compuestas
- condiciones
- navegación de propiedades
- comportamiento derivado de strings

### Idea útil

La configuración es un nombre cómodo.
Pero no reduce mágicamente el poder del mecanismo que la interpreta.

### Regla sana

No midas la inocencia de una cadena por la carpeta o el archivo donde vive.
Medíla por lo que el motor hace con ella.

### Idea importante

Una string dentro de config puede seguir siendo una expresión bastante poderosa si el sistema la evalúa como tal.

---

# Parte 6: `@Value` no vive aislado; vive dentro de Spring

Esto conecta con la idea del tema anterior.
El problema no es solo la anotación.
El problema es el universo del framework que está detrás:

- resolución declarativa
- placeholders
- expresiones
- beans
- contexto
- y el modelo de wiring propio de Spring

### Idea útil

Eso hace que `@Value` sea más delicado cuando se lo mezcla con cadenas que no deberían acercarse tanto a esa maquinaria.

### Regla sana

Cuando revises `@Value`, no mires solo la anotación.
Mirá también:
- qué se está resolviendo,
- de dónde viene,
- y qué parte del framework participa.

---

# Parte 7: Por qué la comodidad administrativa baja la guardia

Esta superficie es traicionera porque se siente muy distinta a “ejecución”.
Se siente como:

- configuración
- wiring
- resolución
- setup
- bootstrap
- un detalle del framework

Y eso baja mucho la alerta mental del equipo.

### Problema

Una cadena evaluada durante wiring o resolución sigue siendo una cadena evaluada.
La fase del ciclo de vida no la vuelve automáticamente inocente.

### Idea importante

La comodidad administrativa del framework no elimina la necesidad de modelar el poder interpretativo de lo que resuelve.

### Regla sana

No subestimes algo solo porque ocurre en bootstrap, config o wiring en vez de en lógica de negocio visible.

---

# Parte 8: Qué formas de riesgo conviene imaginar acá

Todavía no estamos en detalles concretos de todos los mecanismos relacionados, pero sí conviene pensar en varias familias de riesgo:

### 1. Evaluación inesperada
Una cadena que debía ser dato termina resolviéndose con semántica más rica.

### 2. Acceso o navegación no prevista
La resolución llega a propiedades o contexto más allá de lo esperado.

### 3. Lógica de aplicación alterada
Una configuración demasiado flexible cambia comportamiento sensible.

### 4. Opacidad del framework
El equipo ya no sabe bien qué parte del valor vino fija y qué parte fue interpretada.

### 5. Exceso de poder declarativo
El sistema convierte “configurable” en “demasiado evaluable”.

### Idea importante

No hace falta llegar a un escenario extremo para que esta superficie ya esté mal diseñada.
A veces basta con que la frontera entre dato y evaluación esté demasiado difusa.

---

# Parte 9: Qué preguntas conviene hacer cuando veas `@Value`

Cuando veas `@Value` o mecanismos parecidos, conviene preguntar:

- ¿qué valor exacto se inyecta?
- ¿es fijo o puede variar dinámicamente?
- ¿qué parte del valor controla el sistema y qué parte podría venir de otras fuentes?
- ¿hay placeholders o expresiones?
- ¿el negocio necesitaba realmente esta flexibilidad?
- ¿qué pasaría si esa cadena dejara de ser tratada como simple dato?
- ¿qué alternativa más explícita o más pequeña existe?

### Idea importante

La pregunta útil no es:
- “¿usa `@Value`?”
La pregunta útil es:
- “¿qué clase de resolución está ocurriendo y quién influye esa cadena?”

---

# Parte 10: Dónde suele esconderse esta superficie

En Spring, esto puede esconderse detrás de cosas como:

- anotaciones que parecen de wiring puro
- propiedades derivadas
- configuración editable
- strings compuestas
- loaders de config
- servicios que arman expresiones o placeholders dinámicos
- módulos de “customización” o “rules” que terminan reutilizando resolución del framework

### Idea útil

La superficie no siempre se ve como “engine de expresiones”.
A veces aparece bajo la forma de simple flexibilidad de configuración.

### Regla sana

Cada vez que veas demasiada magia para resolver cadenas declarativas, preguntate si todavía estás en config sana o ya pasaste a evaluación delicada.

---

# Parte 11: Qué revisar en una app Spring

En una app Spring, conviene sospechar especialmente cuando veas:

- `@Value` con contenido más expresivo de lo habitual
- propiedades armadas dinámicamente
- configuración editable por admins o por componentes externos
- mezcla entre placeholders, expressions y strings no completamente controladas
- valores que el equipo ya no puede explicar si son datos o lógica
- features donde “la configuración” altera bastante comportamiento del runtime

### Idea importante

La anotación sola no te dice todo.
La superficie aparece cuando el valor deja de ser pequeño, fijo y claramente interno.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- propiedades pequeñas y claras
- poco poder interpretativo
- separación clara entre config y lógica
- menor influencia de input no confiable
- menos construcción dinámica innecesaria
- equipos que saben explicar exactamente qué se resuelve y por qué

### Idea importante

La madurez aquí se nota cuando la configuración sigue siendo configuración y no una DSL improvisada con demasiado poder.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- cadenas de configuración demasiado ricas
- mezcla de partes fijas con input no confiable
- el equipo no distingue dato de expresión
- nadie puede explicar bien qué interpreta Spring en ese punto
- se habla de wiring inocente, pero la resolución ya es demasiado poderosa
- la flexibilidad administrativa empezó a parecerse demasiado a lógica evaluable

### Regla sana

Si una propiedad deja de sentirse como valor y empieza a sentirse como mini-programa declarativo, probablemente la superficie ya se agrandó demasiado.

---

## Checklist práctica

Para revisar `@Value` y configuraciones dinámicas en una app Spring, preguntate:

- ¿qué se está resolviendo exactamente?
- ¿es dato o expresión?
- ¿quién define esa cadena?
- ¿qué parte puede variar?
- ¿qué mecanismo interpreta el valor?
- ¿qué alcance tiene esa interpretación?
- ¿el negocio necesitaba realmente ese nivel de dinamismo?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Dónde usás `@Value`?
2. ¿Qué usos son claramente fijos y cuáles se volvieron más dinámicos?
3. ¿Hay cadenas que ya no son solo config sino algo más expresivo?
4. ¿Qué parte del equipo sigue viendo eso como “solo wiring”?
5. ¿Qué flujo revisarías primero?
6. ¿Qué poder te parece más subestimado acá?
7. ¿Qué cambio harías primero para hacer esa configuración más chica y explícita?

---

## Resumen

`@Value`, las expressions dinámicas y la configuración peligrosa importan porque la palabra “configuración” puede ocultar bastante poder interpretativo cuando el sistema deja que ciertas cadenas entren en mecanismos de resolución que hacen más que inyectar un valor plano.

La gran intuición del tema es esta:

- no toda config es solo dato
- `@Value` suma cuando resuelve valores internos pequeños y controlados
- empieza a complicarse cuando la cadena deja de ser fija y claramente interna
- y el problema real aparece cuando el mecanismo de resolución hace bastante más de lo que el equipo cree que “solo config” debería hacer

En resumen:

> un backend más maduro no trata `@Value` ni la resolución dinámica de configuración como zonas automáticamente inocentes del framework, sino como lugares donde todavía conviene preguntarse qué se está interpretando realmente, quién controla esa cadena y cuánto del poder del contenedor Spring quedó expuesto por comodidad.  
> Entiende que la pregunta no es solo si la propiedad “funciona”, sino si sigue siendo un valor razonablemente pequeño y declarativo o si ya empezó a cruzar la línea hacia una forma de lógica evaluable demasiado cercana al runtime.  
> Y justamente por eso este tema importa tanto: porque ayuda a ver que una parte importante de la ejecución indirecta puede esconderse no en features llamativas, sino en la tranquilidad administrativa de la configuración, que es justamente el lugar donde muchos equipos menos esperan encontrar una frontera sensible.

---

## Próximo tema

**Spring Data, filtros dinámicos y evaluación inesperada**
