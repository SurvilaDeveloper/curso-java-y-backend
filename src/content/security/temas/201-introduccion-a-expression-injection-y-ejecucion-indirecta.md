---
title: "Introducción a expression injection y ejecución indirecta"
description: "Introducción a expression injection y ejecución indirecta en aplicaciones Java con Spring Boot. Qué significa realmente esta categoría, por qué no se reduce a ejecutar código arbitrario clásico y cómo aparecen riesgos cuando input externo influye motores de evaluación, templates o DSL internas."
order: 201
module: "Expresiones, templates y ejecución indirecta"
level: "base"
draft: false
---

# Introducción a expression injection y ejecución indirecta

## Objetivo del tema

Entender qué significa realmente **expression injection** y por qué la **ejecución indirecta** sigue siendo una categoría importante en aplicaciones Java + Spring Boot, incluso cuando el sistema no parece estar “ejecutando código” en el sentido clásico.

La idea de este tema es abrir un nuevo bloque con una advertencia muy útil:

- no todo riesgo de ejecución aparece como `Runtime.exec`
- no todo problema serio requiere una shell
- no todo bug peligroso pasa por “inyectar código” de forma obvia
- y muchas veces el backend habilita motores que no se perciben como ejecución, pero que sí interpretan, evalúan o resuelven expresiones con bastante poder

Ahí empieza esta familia de problemas.

Porque una cosa es que el sistema reciba:

- datos
- parámetros
- texto
- filtros
- opciones
- templates
- reglas

Y otra muy distinta es que esos insumos terminen alimentando:

- motores de expresiones
- evaluadores
- plantillas dinámicas
- DSL internas
- mecanismos de resolución de propiedades
- o capas del framework que “interpretan” algo más que simples valores

En resumen:

> expression injection importa porque el backend no siempre ejecuta instrucciones de manera obvia,  
> pero sí puede terminar evaluando expresiones, reglas o estructuras dinámicas si deja que input externo se acerque demasiado a motores internos pensados para resolver, interpretar o materializar lógica dentro del runtime.

---

## Idea clave

La idea central del tema es esta:

> no toda ejecución peligrosa empieza con una API que “lanza comandos”.  
> A veces empieza mucho antes, cuando el sistema deja que input no confiable participe en un mecanismo de **evaluación**.

Eso cambia bastante la conversación.

Porque una cosa es:

- recibir un string
- validarlo
- tratarlo como dato

Y otra muy distinta es:

- recibir un string
- pasarlo a un motor que lo interpreta
- dejar que ese motor resuelva expresiones, referencias, propiedades o fragmentos de lógica
- y luego actuar sobre el resultado

### Idea importante

La frontera crítica no está solo en “correr código”.
Está también en **ceder demasiada interpretación** a motores internos del framework o de la aplicación.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- pensar que ejecución peligrosa solo significa RCE clásica
- no ver como riesgo a motores de expresiones o plantillas
- asumir que una DSL interna o un sistema de reglas es solo “configuración”
- tratar ciertos strings dinámicos como si fueran datos cuando en realidad el sistema los evalúa
- no distinguir claramente dato, template y expresión
- subestimar cuánto poder puede tener una capa de evaluación aparentemente cómoda

Es decir:

> el problema no es solo ejecutar algo explícitamente.  
> El problema es permitir que input externo entre en mecanismos que el backend usa para **interpretar** y no solo para almacenar o mostrar.

---

## Error mental clásico

Un error muy común es este:

### “Acá no ejecutamos código; solo resolvemos expresiones / plantillas / configuraciones”

Eso suena tranquilo.
Pero puede ser una forma elegante de esconder bastante poder.

Porque todavía importan preguntas como:

- ¿qué motor resuelve eso?
- ¿qué sintaxis entiende?
- ¿qué objetos, propiedades o funciones puede tocar?
- ¿quién controla el input?
- ¿qué tan cerca está esa evaluación del runtime real?
- ¿qué parte del framework se activa cuando “solo resolvemos” esa expresión?

### Idea importante

Llamarlo “expresión” o “template” no hace automáticamente inocente al mecanismo que la evalúa.

---

# Parte 1: Qué significa “ejecución indirecta”

## La intuición simple

Podés pensar **ejecución indirecta** como una situación donde el sistema no recibe instrucciones en un formato clásico de programación visible, pero igual termina haciendo algo parecido a:

- interpretar
- evaluar
- resolver
- expandir
- materializar
- componer lógica
- o navegar objetos y propiedades

a partir de input no confiable.

### Idea útil

La ejecución no siempre llega como “código fuente”.
A veces llega como:

- expresión
- placeholder
- regla
- template
- filtro
- fórmula
- string dinámico
- selector
- referencia

### Regla sana

Cada vez que el sistema “entiende” un string más allá de leerlo como dato, conviene levantar la alerta mental.

---

# Parte 2: Qué significa “expression injection”

## La intuición útil

Expression injection aparece cuando un input no confiable logra influir una expresión que luego el sistema:

- evalúa
- interpreta
- resuelve
- o integra en un motor que tiene más poder del que el diseño quería exponer

No hace falta pensar todavía en una sintaxis concreta.
Lo importante en esta introducción es entender la forma del problema:

1. entra input externo o semiinterno
2. el sistema lo usa como parte de una expresión o estructura evaluable
3. un motor interno la procesa
4. el resultado produce más comportamiento del previsto

### Idea importante

La inyección no siempre entra como “comando”.
A veces entra como **trozo de lógica dentro de una sintaxis que el backend decidió interpretar**.

### Regla sana

Si una cadena puede dejar de ser dato y pasar a ser expresión, ya cambió de categoría de riesgo.

---

# Parte 3: Por qué esto no es solo “otro nombre para RCE”

Conviene aclararlo desde el principio para no deformar el bloque.

Sí, algunas formas de expression injection pueden acercarse mucho a ejecución de alto impacto.
Pero ese no es el único escenario importante.

También puede haber:

- lectura o acceso no previsto a propiedades
- navegación inesperada de objetos
- evaluación más rica de la que el negocio necesitaba
- filtros o reglas alteradas
- generación de contenido no previsto
- ampliación indebida del poder del template o del motor
- caminos raros del framework

### Idea útil

La categoría vale mucho antes de llegar al caso más espectacular.

### Regla sana

No midas la importancia de esta superficie solo por si termina o no en RCE.
Medila por cuánto poder de interpretación le cediste al input.

---

# Parte 4: Dato, template y expresión no son lo mismo

Esta distinción va a ser central en todo el bloque.

## Dato
Algo que el sistema almacena, muestra o compara sin interpretarlo como lógica.

## Template
Una estructura que combina texto fijo con lugares dinámicos a resolver.

## Expresión
Una forma más poderosa de referirse a propiedades, funciones, navegación, operadores o evaluación dentro de un motor.

### Idea importante

Muchos bugs nacen cuando el equipo cree estar manejando datos, pero en realidad el sistema trata esa entrada como template o expresión.

### Regla sana

Antes de confiar en un string dinámico, preguntate:
- “¿esto se usa como texto plano o entra en un mecanismo que lo interpreta?”

---

# Parte 5: Por qué esto aparece mucho en frameworks cómodos

Igual que con deserialización o XML, esta categoría crece fácil en ecosistemas donde el framework ofrece mucha ergonomía.

Por ejemplo, cuando el sistema deja:

- resolver propiedades dinámicas
- construir filtros
- armar templates
- evaluar expresiones de configuración
- navegar objetos automáticamente
- o generar comportamiento desde strings declarativos

### Idea útil

La comodidad del framework no es mala por sí misma.
Pero cuanto más “inteligente” se vuelve la resolución de strings, más importante es controlar quién puede influirlos.

### Regla sana

Cada vez que un framework te ahorra código a fuerza de interpretar cadenas, preguntate si también te está acercando a una frontera de ejecución indirecta.

---

# Parte 6: El riesgo suele esconderse detrás de nombres tranquilos

Esto pasa muchísimo en tickets y codebases.

El equipo usa palabras como:

- expression
- template
- formula
- rule
- resolver
- interpolation
- placeholder
- dynamic field
- configurable filter

Todo eso suena razonable y declarativo.

### Problema

A veces esos nombres hacen olvidar que, detrás, puede haber un motor real capaz de:

- evaluar
- navegar estructuras
- resolver objetos
- ejecutar lógica
- o alterar bastante el comportamiento del backend

### Idea importante

El nombre tranquilo del mecanismo no cambia su poder real.

### Regla sana

No audites por marketing interno.
Auditá por capacidad efectiva de interpretación.

---

# Parte 7: Por qué esto importa especialmente en Java y Spring

Este bloque encaja muy bien en Java + Spring porque el ecosistema suele traer:

- motores de expresiones
- templates server-side
- mucha resolución declarativa
- configuración rica
- binding cómodo
- DSLs internas
- reflexión
- navegación de propiedades
- frameworks con bastante “magia útil”

### Idea útil

Eso hace que expression injection no sea una rareza, sino una categoría bastante natural de riesgo cuando el equipo empieza a mezclar:

- input no confiable
- strings dinámicos
- y motores con poder real sobre el runtime

### Regla sana

En Java/Spring, cuanto más declarativo y más automático sea un mecanismo, más conviene preguntar cuánto del poder interpretativo quedó expuesto.

---

# Parte 8: Qué tipos de impacto conviene tener en mente desde ya

Todavía no estamos en tecnologías concretas, pero sí conviene arrancar con varias familias de impacto posibles:

### 1. Evaluación no prevista
El sistema interpreta algo que debía tratar solo como dato.

### 2. Navegación indebida de objetos o propiedades
La expresión llega más lejos de lo que el diseño quería.

### 3. Lógica alterada
Un filtro, una regla o una resolución cambia más de lo previsto.

### 4. Cercanía peligrosa al runtime
El motor expone demasiada capacidad de introspección o resolución.

### 5. Opacidad
El equipo no entiende bien qué hace realmente el motor de expresiones o templates.

### Idea importante

Expression injection no es solo “inyectar algo raro”.
Es dejar que el backend entienda demasiado de una cadena que no debía tratar como lógica.

---

# Parte 9: Por qué esto se parece a otros bloques del curso

Hay una continuidad muy fuerte con temas anteriores.

## Con XXE
aprendimos que el problema no era solo el archivo, sino el parser que lo interpretaba.

## Con deserialización
aprendimos que el riesgo subía cuando el input se acercaba demasiado al mundo interno de objetos.

## Con archivos complejos
aprendimos que una feature aparentemente simple podía activar motores grandes y opacos.

## Con expression injection
la lección vuelve a ser parecida:
- el peligro no está solo en el dato
- sino en el **motor que decide interpretarlo**.

### Idea útil

Este bloque encaja muy bien en el patrón general del curso:
- más interpretación automática suele significar más superficie delicada.

---

# Parte 10: Qué preguntas conviene hacerse desde el inicio del bloque

Cada vez que veas una cadena dinámica en una app Spring, conviene empezar a preguntarte:

- ¿esto se almacena o se evalúa?
- ¿entra a un motor de expresiones o de templates?
- ¿quién controla esa entrada?
- ¿qué tan poderoso es ese motor?
- ¿qué objetos, propiedades o helpers puede tocar?
- ¿qué parte del framework está haciendo magia acá?
- ¿el negocio realmente necesitaba esta capacidad de interpretación?

### Regla sana

La pregunta más útil no es:
- “¿acá ejecutamos código?”
La pregunta madura es:
- “¿acá el sistema interpreta más de lo que debería interpretar?”

---

# Parte 11: Qué revisar en una app Spring

En una app Spring o en el ecosistema Java más amplio, conviene sospechar especialmente cuando veas:

- expresiones evaluadas a partir de strings
- templates server-side con partes dinámicas poco controladas
- reglas o filtros configurables por usuario o admin
- placeholders o resoluciones dinámicas armadas desde input
- `@Value` o construcciones declarativas mezcladas con datos no confiables
- sistemas de búsqueda, filtros o selección que se apoyan en sintaxis expresiva
- abstracciones tipo “rule engine”, “formula engine”, “template service” o “expression resolver”

### Idea útil

Si el sistema no solo recibe cadenas sino que las **entiende**, ya hay una superficie que merece revisión.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- separación clara entre dato y expresión
- poco poder interpretativo expuesto en el borde
- templates y reglas más cerradas
- menos magia innecesaria
- motores de evaluación con alcance bien acotado
- equipos que saben explicar exactamente qué se evalúa y con qué límites

### Idea importante

La madurez aquí se nota cuando el sistema no confunde comodidad declarativa con frontera segura.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- “solo resolvemos expresiones”
- “solo es una plantilla”
- “solo es una regla configurable”
- nadie sabe bien qué puede tocar ese motor
- input no confiable mezclado con cadenas evaluables
- demasiada cercanía entre strings externos y objetos internos del runtime
- la feature se describe como “de configuración”, pero el motor ya tiene demasiado poder

### Regla sana

Si un string ya no es solo string, el análisis también tiene que cambiar de nivel.

---

## Checklist práctica

Para arrancar este bloque, cuando veas una cadena dinámica en una app Spring, preguntate:

- ¿esto se guarda, se muestra o se evalúa?
- ¿qué motor la interpreta?
- ¿quién controla esa cadena?
- ¿qué capacidad real tiene ese motor?
- ¿qué objetos o propiedades puede tocar?
- ¿qué parte del diseño depende demasiado de esa interpretación?
- ¿el negocio necesitaba realmente ese nivel de expresividad?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Dónde hay strings dinámicos que no sean solo datos?
2. ¿Qué parte del sistema los interpreta?
3. ¿Quién controla esas cadenas?
4. ¿Qué motor o framework participa?
5. ¿Qué parte del equipo sigue viendo eso como “configuración” o “template” y no como evaluación?
6. ¿Qué flujo revisarías primero con esta nueva lente?
7. ¿Qué parte de esta categoría te parecía menos importante antes de este tema?

---

## Resumen

Expression injection y ejecución indirecta siguen importando porque el backend no siempre necesita “ejecutar código” de forma clásica para meterse en terreno peligroso: alcanza con que un string no confiable termine dentro de un motor que lo interpreta como algo más que dato.

La gran idea de este inicio es esta:

- dato, template y expresión no son lo mismo
- el riesgo aparece cuando el sistema empieza a evaluar
- los frameworks cómodos pueden esconder mucho poder interpretativo
- y una parte importante del problema vive en motores internos que el equipo no siempre modela como frontera sensible

En resumen:

> un backend más maduro no trata las expresiones, templates o reglas configurables como adornos declarativos casi inocentes, sino como mecanismos que pueden acercar input no confiable al corazón interpretativo del framework o del runtime si nadie los acota bien.  
> Y justamente por eso este tema importa tanto: porque antes de entrar a tecnologías concretas conviene recuperar una intuición muy simple pero muy poderosa, que es que el riesgo no empieza recién cuando vemos una shell o una API de ejecución explícita, sino mucho antes, en el momento en que dejamos que cadenas externas dejen de ser datos y empiecen a ser lógica para el sistema.

---

## Próximo tema

**SpEL en Spring: cuándo suma y cuándo abre demasiado poder**
