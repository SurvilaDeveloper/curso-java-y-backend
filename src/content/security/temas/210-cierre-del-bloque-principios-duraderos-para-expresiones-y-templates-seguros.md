---
title: "Cierre del bloque: principios duraderos para expresiones y templates seguros"
description: "Principios duraderos para diseñar expresiones, templates, reglas y DSL internas más seguras en aplicaciones Java con Spring Boot. Una síntesis práctica del bloque sobre SpEL, filtros dinámicos, SSTI, templates editables y ejecución indirecta."
order: 210
module: "Expresiones, templates y ejecución indirecta"
level: "base"
draft: false
---

# Cierre del bloque: principios duraderos para expresiones y templates seguros

## Objetivo del tema

Cerrar este bloque con una lista de **principios duraderos** para diseñar, revisar y endurecer el uso de **expresiones**, **templates**, **reglas** y otras formas de **ejecución indirecta** en aplicaciones Java + Spring Boot.

La idea de este tema es hacer una síntesis parecida a la que ya hicimos al cerrar los bloques de SSRF, XXE, deserialización y archivos complejos.

Ya recorrimos muchas piezas concretas:

- introducción a expression injection y ejecución indirecta
- SpEL y su poder real dentro de Spring
- `@Value` y configuraciones que dejan de ser solo datos
- filtros dinámicos y lógica declarativa en Spring Data
- templates server-side y SSTI
- Thymeleaf, FreeMarker y motores equivalentes
- templates editables por admins o terceros
- reglas, fórmulas y DSL internas
- y estrategias para recortar superficie sin matar el valor del producto

Todo eso deja bastante material.
Pero si el bloque termina siendo solo una lista de motores o de features “peligrosas”, el aprendizaje queda demasiado pegado a la tecnología puntual.

Por eso conviene cerrar con algo más estable:

> principios que sigan sirviendo aunque mañana el problema ya no se llame SpEL, Thymeleaf o FreeMarker, sino cualquier mecanismo donde una cadena deje de ser dato y empiece a describir comportamiento dentro del backend.

En resumen:

> el objetivo de este cierre no es sumar otro motor interpretativo a la lista,  
> sino quedarnos con una forma de pensar expresiones y templates que siga siendo útil aunque cambie el framework, la sintaxis o la feature de producto que hoy esté abriendo ejecución indirecta.

---

## Idea clave

La idea central que deja este bloque podría resumirse así:

> el riesgo aparece cuando el sistema deja que input externo o semiinterno deje de ser **dato** y pase a ser **lógica interpretable**.

Esa frase resume prácticamente todo lo que vimos.

Porque los errores más repetidos aparecieron cuando:

- una cadena dejó de ser texto y pasó a ser expresión
- una configuración dejó de ser valor y pasó a ser lógica declarativa
- un filtro dejó de ser parámetro y pasó a describir estructura de consulta
- una plantilla dejó de ser presentación y pasó a abrir lógica de render
- o una regla de negocio dejó de ser preferencia y pasó a parecerse demasiado a un mini lenguaje

### Idea importante

La defensa duradera en este bloque no depende de memorizar nombres de engines.
Depende de una idea más simple:
- **mantener una distancia sana entre input no confiable y motores que interpretan comportamiento**.

---

# Principio 1: dato, template, expresión y regla no son la misma cosa

Este fue el punto de partida más importante del bloque.

Muchos sistemas meten todo bajo palabras cómodas como:

- config
- template
- filtro
- regla
- placeholder
- personalización

Pero eso mezcla categorías técnicas muy distintas.

## Dato
Algo que el sistema almacena, muestra o compara sin interpretarlo como lógica.

## Template
Una estructura declarativa que el backend interpreta para producir salida.

## Expresión
Una sintaxis más rica que puede navegar, resolver o evaluar contexto.

## Regla / DSL
Una manera de describir comportamiento del sistema desde una capa declarativa.

### Idea duradera

El riesgo sube mucho cuando el sistema deja de tratar una cadena como dato y empieza a tratarla como plantilla, expresión o mini lógica.

### Regla sana

Cada vez que revises una cadena dinámica, preguntate:
- “¿esto se muestra o se interpreta?”

---

# Principio 2: la ejecución indirecta empieza mucho antes que la RCE clásica

Otra lección fuerte del bloque fue esta:

el problema no empieza recién cuando aparece:

- una shell
- un proceso externo
- o una API explícita de ejecución

Empieza antes, cuando el sistema permite:

- evaluar expresiones
- resolver templates
- navegar propiedades
- construir lógica declarativa
- o activar un motor que entiende más que un simple valor

### Idea duradera

La superficie crítica no es solo la ejecución explícita.
También lo es la **evaluación**.

### Regla sana

No preguntes solo:
- “¿acá ejecutamos código?”
Preguntá también:
- “¿acá interpretamos comportamiento?”

---

# Principio 3: la comodidad del framework puede ocultar bastante poder

Esto apareció con SpEL, `@Value`, Spring Data y motores de templates.

El framework ayuda muchísimo cuando ofrece:

- wiring declarativo
- expressions
- templates
- rules
- filtros dinámicos
- placeholders
- navegación de propiedades

Eso es productivo.
Pero también puede concentrar bastante poder interpretativo detrás de una sintaxis pequeña y amigable.

### Idea duradera

La ergonomía del framework no elimina el riesgo.
A veces lo vuelve menos visible.

### Regla sana

Cada vez que una cadena reemplaza muchas líneas de código gracias a “magia útil”, preguntate si también está ganando demasiado poder semántico.

---

# Principio 4: la pregunta importante no es solo qué motor usás, sino quién controla la entrada

Este principio apareció una y otra vez.

El mismo motor puede ser bastante razonable si:

- la expresión la define el equipo
- la plantilla es interna
- la regla es pequeña
- el contexto disponible es chico

Y puede volverse muy delicado si:

- la cadena viene de usuario
- la toca un admin con demasiada capacidad
- la compone un partner
- la define un tercero
- o el backend ya no sabe bien quién la controla de verdad

### Idea duradera

El motor importa.
Pero la **frontera de confianza** importa todavía más.

### Regla sana

Siempre preguntate:
- “¿quién escribe esto realmente?”
y no solo:
- “¿qué tecnología lo interpreta?”

---

# Principio 5: “admin-controlled” no equivale a “safe-to-evaluate”

Este fue uno de los puntos más finos y más importantes del bloque.

Muchos equipos se tranquilizan cuando una plantilla, regla o configuración no está expuesta al usuario final.
Pero eso no resuelve solo el problema.

Porque todavía importan:

- nivel técnico del editor
- tipo real de confianza
- incentivos
- errores posibles
- terceros involucrados
- y poder real del motor que interpreta esa entrada

### Idea duradera

La confianza organizacional parcial no debería traducirse en confianza técnica total.

### Regla sana

Si la confianza real en el actor es parcial, la capacidad técnica también debería ser parcial.

---

# Principio 6: el problema suele ser el poder sobrante, no la flexibilidad necesaria

Esto conecta directo con el tema 209.

Muchas features de negocio necesitan cierto dinamismo real.
Pero el sistema suele implementar ese dinamismo con mecanismos demasiado poderosos para la necesidad concreta.

Por ejemplo:

- expresiones libres donde alcanza con unas pocas opciones
- property paths arbitrarios donde alcanzan campos permitidos
- templates componibles donde alcanza con bloques predefinidos
- reglas demasiado expresivas donde alcanza con un catálogo pequeño de decisiones

### Idea duradera

No todo dinamismo aporta valor.
Muchas veces hay **expresividad sobrante**.

### Regla sana

Antes de defender una superficie abierta, preguntate:
- “¿qué parte usa de verdad el negocio y qué parte quedó abierta solo porque el framework lo hace fácil?”

---

# Principio 7: pasar de strings libres a estructuras pequeñas suele mejorar muchísimo el diseño

Este fue uno de los hilos más prácticos del bloque.

Muchas superficies mejoran cuando el sistema deja de aceptar:

- strings libres
- expresiones abiertas
- property paths arbitrarios
- fragmentos o nombres de template arbitrarios
- reglas textuales demasiado ricas

y pasa a aceptar:

- IDs
- enums
- catálogos
- combinaciones predefinidas
- DTOs tipados y validados
- opciones cerradas

### Idea duradera

La mejor reducción de superficie muchas veces no consiste en eliminar el feature, sino en cambiar el **medio técnico** con el que el feature viaja.

### Regla sana

Si hoy una feature depende demasiado de interpretar strings, preguntate si no puede rediseñarse como contrato estructurado y pequeño.

---

# Principio 8: el backend debería decidir más estructura y el input menos

Esto atravesó todo el bloque.

La ejecución indirecta crece cuando el backend deja que el input decida demasiado sobre:

- qué expresión evaluar
- qué regla aplicar
- qué propiedad navegar
- qué vista cargar
- qué fragmento incluir
- qué operador usar
- qué parte del flujo se compone declarativamente

### Idea duradera

La refactorización sana suele mover esas decisiones de vuelta al lado del servidor.

### Regla sana

Si una cadena hoy le dice al backend **cómo** resolver algo, preguntate si el backend no debería decidirlo por sí mismo a partir de un conjunto mucho más chico de opciones.

---

# Principio 9: contexto pequeño vale tanto como sintaxis pequeña

No alcanza con recortar el lenguaje o la sintaxis.
También hay que recortar el **contexto**.

Esto importa muchísimo en:

- SpEL
- templates server-side
- reglas
- DSL internas
- filtros dinámicos
- motores declarativos

Porque una sintaxis aparentemente chica puede seguir siendo peligrosa si ve:

- demasiados objetos
- demasiadas propiedades
- demasiados helpers
- demasiados beans
- demasiada estructura interna del backend

### Idea duradera

El poder del motor depende tanto de lo que **entiende** como de lo que **puede ver**.

### Regla sana

No recortes solo la gramática.
Recortá también el mundo disponible para la evaluación.

---

# Principio 10: el modelo interno no debería salir tan directo al borde

Esto apareció con filtros dinámicos, property paths, templates y reglas.

Muy seguido el backend deja que el exterior vea demasiado de:

- su mapa de propiedades
- sus relaciones
- sus nombres internos
- su lenguaje de vistas
- su contexto de render
- su forma interna de decidir cosas

### Idea duradera

La seguridad mejora cuando hay más distancia entre:
- interfaz pública
y
- mecanismos internos del framework o del dominio.

### Regla sana

No le regales al input el mismo lenguaje de navegación o de composición que usa internamente tu sistema.

---

# Principio 11: las features de negocio “declarativas” pueden convertirse en mini plataformas sin que nadie lo note

Este fue uno de los puntos más importantes del subbloque de reglas y DSL.

Muchas veces el producto cree que está agregando:

- un filtro flexible
- una regla configurable
- una plantilla editable
- una automatización
- una búsqueda avanzada

y sin darse cuenta termina agregando:

- una mini DSL
- un motor declarativo
- una interfaz de programación parcial
- una capa de evaluación con bastante poder

### Idea duradera

La ejecución indirecta suele crecer por acumulación gradual de flexibilidad, no por una decisión explícita de “exponer programación”.

### Regla sana

Cada vez que una feature dinámica se vuelva difícil de explicar en una frase corta, preguntate si no se está convirtiendo en una mini plataforma.

---

# Principio 12: la buena revisión baja del feature al motor

Otra lección fuerte del bloque fue esta:

no alcanza con mirar el feature como producto:

- búsqueda avanzada
- branding
- templates de email
- reglas de negocio
- configuración dinámica

La revisión madura baja a preguntas como:

- ¿qué motor interpreta eso?
- ¿qué sintaxis entiende?
- ¿qué contexto recibe?
- ¿qué parte es fija?
- ¿qué parte es editable?
- ¿qué parte del input influye estructura y no solo contenido?

### Idea duradera

La superficie real casi siempre vive más en el motor y en el contexto que en el nombre comercial del feature.

### Regla sana

Auditá por:
- motor,
- contexto,
- frontera de confianza,
- y expresividad real.

---

# Principio 13: la mejor flexibilidad suele ser la que el sistema puede enumerar claramente

Esto vale para filtros, templates, reglas y configuraciones.

Una flexibilidad más sana suele ser la que el equipo puede describir con claridad:

- qué opciones existen
- qué campos se pueden usar
- qué operadores se admiten
- qué fragmentos se pueden elegir
- qué bloques son editables
- qué acciones están permitidas

### Idea duradera

Cuando una superficie deja de ser enumerable y entendible, suele empezar a sobrar poder.

### Regla sana

Si el equipo no puede explicar en poco espacio qué puede hacer exactamente una regla, un template o un filtro, probablemente la superficie ya creció demasiado.

---

# Principio 14: el valor del producto no está casado con la implementación actual

Esto fue central en el tema 209.

Muy seguido el equipo defiende un mecanismo demasiado poderoso porque confunde:

- valor del feature
con
- mecanismo actual que lo implementa

Por ejemplo:

- negocio necesita personalización
pero no necesariamente
- lógica editable de templates

- negocio necesita búsqueda flexible
pero no necesariamente
- property paths arbitrarios

- negocio necesita reglas
pero no necesariamente
- mini lenguaje con mucho contexto

### Idea duradera

Cambiar el mecanismo no implica perder el caso de uso.

### Regla sana

Protegé el valor del producto, no el accidente histórico de implementación.

---

# Principio 15: la salida madura casi siempre es una mezcla de menos expresividad, menos contexto y más decisión del servidor

Este principio resume muy bien la parte práctica del bloque.

La mayoría de las mejoras sanas terminan pareciéndose a alguna combinación de:

- menos strings libres
- menos sintaxis abierta
- menos contexto disponible
- menos composición dinámica
- más IDs y enums
- más mapeo explícito del lado del servidor
- más separación entre contenido y lógica
- más contratos pequeños
- menos “magia” interpretativa del framework

### Idea duradera

Reducir superficie de ejecución indirecta no suele ser una acción única.
Suele ser una convergencia de varios recortes pequeños pero muy valiosos.

### Regla sana

Cuando una feature se sienta demasiado poderosa, preguntate:
- “¿qué parte del riesgo baja si reduzco sintaxis?”
- “¿qué parte baja si reduzco contexto?”
- “¿qué parte baja si el servidor decide más?”

---

## Cómo usar estos principios después del bloque

No hace falta recordar cada motor o cada sintaxis si te quedan claras unas pocas preguntas base.

Podés llevarte esta secuencia corta:

1. **¿Esto se trata como dato o se interpreta como lógica?**
2. **¿Qué motor lo evalúa o lo renderiza?**
3. **¿Quién controla la cadena o estructura que se interpreta?**
4. **¿Qué contexto ve ese motor?**
5. **¿Qué parte del dinamismo aporta valor real y qué parte sobra?**
6. **¿Qué podría pasar de string libre a opción cerrada o estructura tipada?**
7. **¿Qué parte de la decisión debería volver al servidor?**

### Idea útil

Si respondés bien estas preguntas, ya tenés una brújula muy fuerte para casi cualquier feature de ejecución indirecta futura.

---

## Qué revisar en una app Spring

Cuando uses este cierre como guía en una app Spring, conviene mirar especialmente:

- SpEL y expresiones evaluadas
- `@Value` y configuraciones demasiado ricas
- filtros dinámicos, property paths y sorting flexible
- templates server-side y nombres de vista o fragmentos dinámicos
- templates editables por admins, partners o terceros
- reglas, fórmulas y automatizaciones configurables
- DSL internas o mecanismos que ya se parezcan a mini lenguajes
- qué contexto del framework queda disponible en cada uno de esos puntos

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- cadenas tratadas realmente como datos
- menos expresividad accidental
- más contratos tipados y cerrados
- menor contexto disponible para el motor
- separación clara entre contenido editable y lógica evaluable
- más decisiones explícitas del lado del servidor
- equipos que pueden explicar con precisión qué se interpreta, quién lo define y con qué límites

### Idea importante

La madurez aquí se nota cuando el sistema sigue siendo flexible para negocio, pero mucho menos generoso con el poder interpretativo que cede al exterior.

---

## Señales de ruido

Estas señales indican que todavía queda trabajo pendiente:

- nadie distingue bien entre dato y expresión
- se usa “configuración” para nombrar cosas que ya son lógica
- los motores reciben demasiado contexto
- el input decide demasiada estructura
- los templates o reglas editables se justifican solo por rol organizacional
- el equipo defiende strings libres porque “es más flexible”
- nadie puede enumerar con claridad qué puede hacer realmente la sintaxis expuesta

### Regla sana

Si el equipo no puede explicar bien qué parte del sistema interpreta qué y bajo control de quién, probablemente todavía no tiene bien cerrada esta superficie.

---

## Checklist práctica

Para cerrar este bloque, cuando revises cualquier feature con expresiones, templates o reglas, preguntate:

- ¿esto se evalúa o solo se muestra?
- ¿qué motor lo interpreta?
- ¿quién define la cadena o estructura?
- ¿qué contexto ve el motor?
- ¿qué parte del feature necesita dinamismo real?
- ¿qué parte de la expresividad sobra?
- ¿qué podría pasar a contrato cerrado?
- ¿qué decisión debería volver al servidor?

---

## Mini ejercicio de reflexión

Tomá una feature real de tu app Spring y respondé:

1. ¿Qué parte del sistema interpreta cadenas o reglas?
2. ¿Qué motor usa?
3. ¿Quién controla esa entrada?
4. ¿Qué parte del contexto ve ese motor?
5. ¿Qué parte del dinamismo sí aporta valor?
6. ¿Qué parte del poder actual sobra?
7. ¿Qué cambio harías primero para bajar superficie sin romper el producto?

---

## Resumen

Este bloque deja una idea muy simple y muy útil:

- una cadena es relativamente inocente mientras se trata como dato
- se vuelve una frontera seria cuando el backend decide interpretarla como lógica
- y el riesgo real depende menos del nombre del motor que de:
  - quién controla la entrada,
  - qué parte del sistema la evalúa,
  - qué contexto ve,
  - y cuánta expresividad innecesaria se dejó abierta

Por eso los principios más duraderos del bloque son:

- distinguir dato, template, expresión y regla
- no pensar la ejecución solo como RCE clásica
- revisar siempre motor y frontera de confianza
- no sobreconfiar en roles administrativos
- recortar poder sobrante
- reducir contexto disponible
- pasar de strings libres a contratos pequeños
- y mantener más decisiones del lado del servidor

En resumen:

> un backend más maduro no trata expresiones, templates, reglas o DSL internas como adornos declarativos que el framework resuelve sin costo conceptual, sino como motores de interpretación que merecen la misma seriedad que cualquier otra frontera sensible del sistema.  
> Entiende que la seguridad duradera no nace de memorizar nombres de engines ni de demonizar toda flexibilidad, sino de saber exactamente cuándo una feature deja de manejar datos y empieza a manejar comportamiento, y de recortar tanto la expresividad como el contexto y la confianza implícita que esa interpretación recibe.  
> Y justamente por eso este cierre importa tanto: porque deja una forma de pensar que sigue sirviendo aunque cambie el motor, la sintaxis o la feature de producto, y esa forma de pensar es probablemente la herramienta más útil para seguir diseñando expresiones, templates y reglas de forma más segura mucho después de olvidar el detalle exacto de una tecnología concreta.

---

## Próximo tema

**Introducción a SSRF de segunda orden y encadenamientos modernos**
