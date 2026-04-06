---
title: "Scripts, reglas y DSL internas: cuando el negocio empieza a ejecutar cosas"
description: "Cómo entender los riesgos de scripts, reglas y DSL internas en aplicaciones Java con Spring Boot. Por qué no siempre se presentan como 'código', qué cambia cuando el negocio describe comportamiento y cómo reconocer cuándo una configuración ya se volvió ejecución indirecta."
order: 208
module: "Expresiones, templates y ejecución indirecta"
level: "base"
draft: false
---

# Scripts, reglas y DSL internas: cuando el negocio empieza a ejecutar cosas

## Objetivo del tema

Entender por qué **scripts**, **reglas** y **DSL internas** pueden convertirse en una superficie delicada en aplicaciones Java + Spring Boot, incluso cuando nadie dentro del equipo diría explícitamente:

- “estamos dejando ejecutar código”
- “tenemos un language runtime”
- “el usuario programa el sistema”

La idea de este tema es continuar directamente lo que vimos sobre:

- expression injection
- SpEL
- configuración demasiado expresiva
- filtros dinámicos
- templates server-side
- trust boundaries reales en plantillas editables

Ahora toca mirar una frontera muy frecuente en productos maduros:

- motores de reglas
- fórmulas de negocio
- automatizaciones
- workflows configurables
- scripts administrativos
- plantillas lógicas
- DSL internas para filtros, scoring, pricing o notificaciones

Y justo ahí aparece una trampa conceptual muy fuerte.

Porque el equipo suele describir estas features como:

- “reglas de negocio”
- “automatización”
- “configuración avanzada”
- “custom logic”
- “workflow configurable”
- “fórmula”
- “expresión”

Todo eso suena razonable y muy valioso.
Pero desde seguridad conviene traducirlo a otra pregunta:

> ¿cuánto comportamiento del sistema dejamos que una cadena, una regla o una sintaxis declarativa empiece a describir y activar dentro del backend?

En resumen:

> scripts, reglas y DSL internas importan porque el riesgo no aparece solo cuando el sistema permite ejecutar código en un lenguaje general,  
> sino también cuando empieza a aceptar descripciones suficientemente ricas de comportamiento, decisiones o flujo, y luego las interpreta dentro del runtime como si siguieran siendo “solo negocio configurable”.

---

## Idea clave

La idea central del tema es esta:

> una regla, fórmula o DSL deja de ser “solo configuración” cuando ya empieza a describir **comportamiento** y no solo **valores**.

Eso parece una distinción simple, pero cambia muchísimo la superficie.

Porque una cosa es:

- elegir un umbral
- activar o desactivar una feature
- cargar un porcentaje fijo
- seleccionar una plantilla entre varias

Y otra muy distinta es:

- definir condiciones complejas
- combinar operadores
- navegar datos o contexto
- elegir acciones
- encadenar pasos
- expresar lógica reutilizable
- o dejar que una sintaxis propia del negocio determine cómo decide el sistema

### Idea importante

El riesgo sube cuando el sistema deja de leer parámetros y empieza a **interpretar reglas**.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- pensar que solo hay riesgo cuando aparece “código” clásico
- tratar DSLs internas como si fueran siempre inocentes por estar ligadas al negocio
- no distinguir entre configuración declarativa pequeña y lenguaje de comportamiento
- no modelar qué puede ver, recorrer o disparar una regla
- no revisar qué motores interpretan esas reglas
- subestimar cuánto poder se condensa en features de automatización o personalización avanzada

Es decir:

> el problema no es solo tener reglas configurables.  
> El problema es cuánto del comportamiento del backend dejás que esas reglas describan y con qué motor o contexto se terminan interpretando.

---

## Error mental clásico

Un error muy común es este:

### “Esto no es código, son solo reglas de negocio”

Eso puede ser verdad desde la óptica del producto.
Pero puede ser muy engañoso desde la óptica del backend.

Porque todavía conviene preguntar:

- ¿quién escribe esas reglas?
- ¿qué sintaxis tienen?
- ¿qué datos o contexto pueden tocar?
- ¿qué motor las evalúa?
- ¿qué decisiones o acciones pueden producir?
- ¿qué tan cerca están de objetos, servicios o estados internos del sistema?

### Idea importante

Llamarlo “regla” o “fórmula” no reduce automáticamente el poder técnico del mecanismo que la interpreta.

---

# Parte 1: Qué significa “cuando el negocio empieza a ejecutar cosas”

## La intuición simple

El negocio empieza a “ejecutar cosas” cuando deja de configurar solo opciones cerradas y empieza a describir:

- condiciones
- decisiones
- flujos
- combinaciones
- disparadores
- transformaciones
- o acciones derivadas

dentro de una sintaxis que luego el backend interpreta.

### Idea útil

No hace falta que haya un editor de código.
Alcanza con que exista una capa donde alguien fuera del núcleo de desarrollo pueda definir comportamiento.

### Regla sana

Cada vez que una feature ya no solo selecciona entre opciones predefinidas, preguntate si no está emergiendo una mini plataforma de ejecución.

---

# Parte 2: Qué es una DSL interna, a nivel intuitivo

## La intuición útil

Una **DSL interna** puede pensarse como un pequeño lenguaje que el producto o la plataforma inventa para describir algo del negocio, por ejemplo:

- reglas de descuento
- criterios de segmentación
- prioridades
- fórmulas
- condiciones de aprobación
- triggers
- reglas de enrutamiento
- workflows
- filtros avanzados

### Idea importante

La DSL no necesita parecerse a un lenguaje general para ser poderosa.
Le alcanza con describir lo suficiente como para que el backend tome decisiones importantes a partir de ella.

### Regla sana

No midas el poder de una DSL por si parece “código”.
Medilo por cuánto comportamiento real puede modelar.

---

# Parte 3: Configuración pequeña vs lenguaje de comportamiento

Esta distinción es central en este tema.

## Configuración pequeña
- valores fijos
- opciones enumeradas
- flags
- thresholds
- decisiones cerradas
- poco espacio para composición

## Lenguaje de comportamiento
- condiciones combinables
- operadores
- referencias a datos
- navegación de contexto
- acciones o efectos
- composición de reglas
- sintaxis propia con bastante expresividad

### Idea importante

Ambas cosas pueden llamarse “configuración”.
Pero la segunda ya se parece mucho más a una capa de ejecución indirecta.

### Regla sana

Cuando el negocio puede describir lógica y no solo elegir opciones, la conversación de seguridad cambia de nivel.

---

# Parte 4: Por qué esto gusta tanto al producto y al negocio

Estas features aparecen mucho porque resuelven dolores reales:

- no depender siempre de deploy
- adaptar comportamiento rápido
- personalizar por cliente
- automatizar decisiones
- escalar operación
- dejar reglas en manos del negocio
- soportar casos enterprise o white-label

### Idea útil

Ese valor es completamente real.
Por eso mismo estas superficies crecen fácil: porque ofrecen mucha autonomía y reducen fricción con el equipo técnico.

### Regla sana

Cuanto más valor de negocio trae una DSL o un motor de reglas, más importante se vuelve revisar cuánta superficie extra está abriendo.

### Idea importante

El atractivo del feature no elimina la necesidad de acotar su poder técnico.

---

# Parte 5: Dónde empieza a ponerse delicado

Esto se vuelve delicado cuando la regla o el script puede:

- navegar datos del sistema
- combinar operadores ricos
- referirse a objetos internos
- decidir acciones más amplias
- encadenarse con otras reglas
- producir side effects
- evaluar expresiones dinámicas
- o apoyarse en motores que tienen demasiado contexto disponible

### Idea útil

La superficie no la define solo la existencia del motor.
La define cuánto del runtime, del modelo o del flujo de negocio queda describible desde esa capa.

### Regla sana

Si la regla ya se parece a una forma de programar el sistema, tratala como tal.

---

# Parte 6: “No es Turing-complete” no tranquiliza tanto como parece

Otro error común es pensar:

- “esto no es un lenguaje completo”
- “no tiene loops”
- “no es código general”
- “son apenas fórmulas”

Eso puede ser cierto y aun así insuficiente.

Porque incluso una sintaxis no general puede seguir teniendo suficiente poder como para:

- alterar decisiones importantes
- navegar datos sensibles
- disparar caminos inesperados
- exponer demasiada lógica interna
- o acercarse mucho al runtime en un punto crítico del negocio

### Idea importante

No hace falta un lenguaje general para tener una frontera muy delicada.

### Regla sana

No preguntes solo:
- “¿qué tan completo es este lenguaje?”
Preguntá también:
- “¿qué impacto real tiene sobre el sistema?”

---

# Parte 7: Qué actores suelen escribir estas reglas

Esto conecta directo con trust boundaries reales.

Muchas veces las reglas o DSL las escriben:

- admins
- equipos de operaciones
- analistas
- negocio
- soporte
- partners
- clientes enterprise
- o developers de integraciones

Eso suele venir acompañado de una confianza ambigua:

- “no son usuarios comunes”
pero tampoco
- “son el equipo que entiende el runtime en profundidad”

### Idea útil

Eso vuelve muy peligrosa la sobreconfianza organizacional.
No alcanza con que el editor tenga un rol “interno”.

### Regla sana

Toda capacidad de escribir reglas debería mapearse contra:
- confianza real,
- formación real,
- y poder técnico real del motor.

---

# Parte 8: Qué vuelve traicionera a una “regla”

Las reglas engañan porque suenan muy cercanas al negocio.
Y eso baja la guardia.

Una “regla” puede parecer:

- simple
- declarativa
- administrativa
- auditable
- entendible por no developers

Pero técnicamente puede seguir siendo una entrada que:

- el backend interpreta
- mezcla datos y lógica
- puede navegar contexto
- y termina moldeando comportamiento real del sistema

### Idea importante

La cercanía semántica con el negocio no vuelve segura a la evaluación.

### Regla sana

Cada vez que escuches “solo una regla”, traducilo mentalmente a:
- “¿qué motor la evalúa y qué puede hacer con ella?”

---

# Parte 9: Qué tipos de impacto conviene imaginar

Todavía no estamos en mitigaciones ni ejemplos concretos de todos los engines posibles, pero ya conviene pensar en varias familias de impacto:

### 1. Lógica demasiado flexible
La regla describe más comportamiento del que el negocio necesitaba.

### 2. Contexto demasiado rico
El motor ve demasiados datos, objetos o servicios.

### 3. Cambios operativos difíciles de predecir
Una regla aparentemente chica altera bastante el comportamiento del sistema.

### 4. Opacidad
El equipo ya no sabe claramente qué parte es configuración y cuál ya es mini-programación.

### 5. Ejecución indirecta
La regla termina haciendo de interfaz hacia un motor con demasiado poder.

### Idea importante

El valor del tema no está solo en pensar en “explotación”, sino en ver cuándo una feature de negocio ya se convirtió en una capa de ejecución.

---

# Parte 10: Qué preguntas conviene hacer en una review

Cuando revises scripts, reglas o DSL internas, conviene preguntar:

- ¿quién escribe eso?
- ¿qué sintaxis admite?
- ¿qué tan expresiva es?
- ¿qué datos o contexto puede ver?
- ¿qué acciones o decisiones puede producir?
- ¿qué motor la interpreta?
- ¿qué parte del sistema ya no decide el backend directamente sino la regla?
- ¿qué parte del diseño podría resolverse con opciones más cerradas?

### Idea importante

La pregunta útil no es solo:
- “¿tenemos reglas?”
La pregunta útil es:
- “¿cuánto comportamiento le estamos regalando a este mecanismo?”

---

# Parte 11: Qué revisar en una app Spring

En una app Spring, conviene sospechar especialmente cuando veas:

- rule engines
- formula engines
- scoring configurable
- pricing dinámico
- workflows configurables
- triggers de negocio
- automatizaciones basadas en expresiones
- módulos donde negocio “arma lógica” sin pasar por código tradicional
- strings o estructuras declarativas que luego el backend evalúa con SpEL, templates o motores propios

### Idea útil

Si el sistema deja que negocio o terceros describan comportamiento y no solo parámetros, ya hay una frontera que merece análisis serio.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- DSLs pequeñas
- pocos operadores
- poco contexto expuesto
- acciones acotadas
- separación clara entre configuración y lógica
- menos magia del motor
- equipos que pueden explicar exactamente qué puede y qué no puede describir una regla

### Idea importante

La madurez aquí se nota cuando la plataforma ofrece flexibilidad útil, pero no una mini programación encubierta mucho más poderosa de lo que el negocio necesitaba.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- nadie puede describir bien qué tan poderosa es la regla
- el motor ve demasiado contexto
- admins o terceros pueden definir demasiada lógica
- la feature se vende como “configurable”, pero ya parece un lenguaje
- se trata la DSL como inocente porque “no es código”
- el equipo no sabe dónde termina la config y empieza la ejecución indirecta

### Regla sana

Si una regla ya se siente como una manera de programar el producto, auditála como una manera de programar el producto.

---

## Checklist práctica

Para revisar scripts, reglas y DSL internas, preguntate:

- ¿quién las escribe?
- ¿qué sintaxis admiten?
- ¿qué parte del sistema pueden describir?
- ¿qué contexto ven?
- ¿qué motor las interpreta?
- ¿qué acciones o efectos pueden producir?
- ¿qué parte podría volverse más cerrada y menos expresiva?

---

## Mini ejercicio de reflexión

Tomá una feature real de tu app Spring y respondé:

1. ¿Hay reglas, fórmulas o automatizaciones configurables?
2. ¿Quién las escribe?
3. ¿Qué sintaxis o expresividad tienen?
4. ¿Qué contexto pueden ver?
5. ¿Qué parte del sistema empiezan a “programar”?
6. ¿Qué flexibilidad aporta valor real y cuál sobra?
7. ¿Qué revisarías primero después de este tema?

---

## Resumen

Scripts, reglas y DSL internas importan porque el backend no necesita exponer un lenguaje de programación general para abrir una superficie de ejecución indirecta: alcanza con dejar que una capa declarativa suficientemente rica describa comportamiento real del sistema.

La gran intuición del tema es esta:

- una regla deja de ser solo config cuando ya describe comportamiento
- una DSL no necesita parecer código para ser poderosa
- el problema depende de quién la escribe, qué motor la interpreta y qué contexto puede tocar
- y una parte muy grande del riesgo aparece cuando el negocio empieza a “programar” más del sistema de lo que el equipo cree haber expuesto

En resumen:

> un backend más maduro no se tranquiliza porque una feature de reglas o automatización esté vestida con lenguaje de negocio en vez de sintaxis de programación clásica, sino que mira cuánto comportamiento real, cuánta navegación de contexto y cuánta capacidad declarativa está poniendo detrás de esa superficie.  
> Entiende que la pregunta importante no es solo si el motor es técnicamente un lenguaje completo, sino si ya tiene suficiente poder como para convertirse en una frontera sensible donde el negocio o terceros dejan de configurar opciones y empiezan, en los hechos, a ejecutar decisiones dentro del runtime.  
> Y justamente por eso este tema importa tanto: porque ayuda a ver una de las zonas más modernas y más subestimadas de la ejecución indirecta, la de las plataformas que quieren dar autonomía y flexibilidad pero corren el riesgo de abrir, sin notarlo, una mini capa de programación demasiado poderosa dentro del backend.

---

## Próximo tema

**Cómo recortar superficie de ejecución indirecta sin romper el producto**
