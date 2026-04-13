---
title: "Organizando un checklist básico de hardening para NovaMarket"
description: "Primer paso concreto del módulo de seguridad y hardening básico. Organización de un checklist razonable de endurecimiento inicial para el sistema y el entorno dentro de Kubernetes."
order: 153
module: "Módulo 15 · Seguridad y hardening básico"
level: "avanzado"
draft: false
---

# Organizando un checklist básico de hardening para NovaMarket

En la clase anterior dejamos claro algo importante:

- NovaMarket ya está lo suficientemente maduro como para que seguridad y hardening básico aparezcan como la siguiente prioridad natural,
- y además el foco de este tramo no es “resolver toda la seguridad del mundo”, sino empezar por una capa razonable, útil y realista.

Ahora toca el paso concreto:

**organizar un checklist básico de hardening para NovaMarket.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- identificado un conjunto razonable de endurecimientos iniciales,
- ordenadas sus prioridades,
- y mucho más claro por dónde conviene empezar a fortalecer el sistema sin volver la evolución caótica.

La meta de hoy no es aplicar todo de una vez.  
La meta es mucho más concreta: **definir un checklist básico y sensato que nos diga qué conviene endurecer primero**.

---

## Estado de partida

Partimos de un sistema que ya tiene una base fuerte:

- arquitectura funcional de microservicios,
- infraestructura base,
- entrada madura,
- operación razonable,
- observabilidad inicial,
- y una hoja de ruta posterior que puso a seguridad y hardening como siguiente prioridad.

Eso significa que ya no estamos discutiendo “si conviene endurecer algo”.

Ahora lo importante es responder algo más útil:

- **qué conviene endurecer primero**
- y **en qué orden**

---

## Qué vamos a construir hoy

En esta clase vamos a:

- identificar las áreas de endurecimiento inicial más importantes,
- separarlas en bloques entendibles,
- priorizarlas con criterio,
- y dejar un checklist básico de hardening para NovaMarket.

---

## Qué queremos resolver exactamente

Queremos evitar dos errores bastante comunes:

### Error 1
Endurecer cosas al azar, sin distinguir qué es urgente de qué es accesorio.

### Error 2
Intentar aplicar demasiadas mejoras de seguridad de una sola vez, rompiendo foco y claridad.

En lugar de eso, queremos algo más sano:

- un checklist corto,
- entendible,
- priorizado,
- y conectado al tipo de sistema que NovaMarket ya es hoy.

Ese cambio de enfoque es el corazón de esta clase.

---

## Paso 1 · Separar el hardening en bloques

Una forma muy útil de ordenar esta etapa es dividir el endurecimiento inicial en bloques como estos:

- exposición del sistema
- configuración y secretos
- runtime y contenedores
- políticas del cluster
- y superficie operativa

No hace falta todavía entrar al detalle fino de cada uno.

La prioridad ahora es que el mapa quede claro.

---

## Paso 2 · Empezar por exposición del sistema

Una primera gran pregunta bastante razonable es esta:

- ¿qué estamos exponiendo que realmente necesita estar expuesto?
- ¿qué endpoints o componentes podrían quedar demasiado abiertos?
- ¿qué piezas deberían quedar más limitadas o mejor controladas?

Este bloque tiene mucho sentido como prioridad alta porque reduce superficie innecesaria y obliga a mirar el sistema con más criterio.

---

## Paso 3 · Revisar configuración y secretos

Otra gran área muy importante es la de configuración.

A esta altura del proyecto conviene revisar cosas como:

- qué datos sensibles viven en `Secret`,
- qué cosas todavía están demasiado visibles o dispersas,
- y si la frontera entre configuración común y sensible quedó realmente clara.

Este bloque importa muchísimo porque muchos problemas de seguridad no empiezan en el código, sino en configuraciones blandas o demasiado expuestas.

---

## Paso 4 · Revisar runtime y contenedores

Otra línea fuerte del checklist debería mirar cómo corren realmente las piezas del sistema.

Por ejemplo:

- qué permisos tienen,
- qué defaults del contenedor siguen siendo demasiado cómodos,
- y qué cosas del runtime conviene volver más estrictas.

No hace falta todavía entrar en una política ultra avanzada.  
Lo importante es reconocer que el contenedor también forma parte del problema y de la solución.

---

## Paso 5 · Revisar políticas del cluster

A esta altura también conviene empezar a mirar el cluster mismo con un poco más de exigencia.

Por ejemplo:

- qué tan abiertas están ciertas comunicaciones,
- qué tan suelto quedó el entorno,
- y qué decisiones del cluster convendría endurecer para acompañar mejor al sistema

Este bloque quizá no sea el primero que ejecutemos, pero sí debería estar en el checklist desde el inicio.

---

## Paso 6 · Revisar superficie operativa y administrativa

Otra línea bastante importante es esta:

- ¿qué herramientas del entorno están accesibles?
- ¿qué consolas o superficies administrativas conviene tratar con más cuidado?
- ¿qué partes de la observabilidad o de la operación deberían tener un criterio más serio de acceso?

Este bloque importa porque, cuando el proyecto madura, la seguridad ya no vive solo en el negocio o en los servicios, sino también en cómo se opera todo el entorno.

---

## Paso 7 · Proponer una priorización razonable

A esta altura, una primera priorización bastante sana podría verse así:

1. exposición del sistema  
2. configuración y secretos  
3. runtime y contenedores  
4. superficie operativa  
5. políticas más finas del cluster  

No hace falta que esta priorización sea dogma absoluto.  
Pero sí ayuda muchísimo más que seguir endureciendo cosas sin orden.

---

## Paso 8 · Entender por qué este checklist vale tanto

Este punto importa mucho.

Sin un checklist, el hardening puede convertirse en una mezcla de cambios técnicos sin dirección clara.

Con un checklist, en cambio:

- cada mejora tiene contexto,
- el proyecto sigue madurando con coherencia,
- y la seguridad deja de ser una idea difusa para convertirse en un trabajo priorizado.

Ese valor estratégico es enorme.

---

## Paso 9 · Pensar qué conviene aplicar primero de forma concreta

Si hubiera que elegir el primer foco real después de esta clase, una combinación muy razonable sería:

- revisar exposición,
- revisar secretos,
- y endurecer algunos defaults básicos del runtime.

¿Por qué?

Porque son áreas que suelen dar mucho valor relativamente rápido sin exigir todavía una capa gigantesca de complejidad adicional.

Ese sería un muy buen siguiente paso práctico.

---

## Paso 10 · Entender qué gana NovaMarket con este orden

A esta altura conviene fijar algo muy importante:

este checklist no solo dice “qué nos falta”.

Dice algo mucho más útil:

- qué conviene revisar primero,
- qué puede venir después,
- y cómo seguir endureciendo NovaMarket sin romper su claridad ni su utilidad didáctica.

Ese valor de orden vale muchísimo.

---

## Qué estamos logrando con esta clase

Esta clase instala el checklist básico de hardening de NovaMarket.

Ya no estamos solo diciendo que seguridad es la próxima prioridad.  
Ahora también estamos ordenando cómo empezar a trabajarla de forma razonable y útil.

Eso es un salto importante.

---

## Qué todavía no hicimos

Todavía no:

- aplicamos endurecimientos concretos sobre el sistema,
- ni validamos todavía el efecto de esta primera capa de hardening.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dejar un checklist básico, priorizado y coherente para endurecer NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Tratar seguridad como una lista infinita sin prioridades
Conviene empezar por pocas áreas claras y bien justificadas.

### 2. Enamorarse de temas avanzados sin endurecer primero lo básico
El valor real suele estar en el orden.

### 3. Mezclar exposición, secretos y runtime sin distinguir sus problemas
Separar bloques ayuda muchísimo a entender mejor qué estamos haciendo.

### 4. Pensar que el checklist es burocracia
En realidad le da dirección real a todo el módulo.

### 5. No pensar en la superficie operativa
A esta altura del proyecto también forma parte del endurecimiento.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener una hoja bastante clara de qué revisar primero para endurecer NovaMarket de una forma inicial, razonable y útil.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- el checklist ya está ordenado por bloques,
- entendés por qué exposición y secretos aparecen tan arriba,
- ves que runtime y superficie operativa también importan,
- y sentís que el hardening del proyecto ya dejó de ser una idea difusa para convertirse en un plan concreto.

Si eso está bien, ya podemos pasar a aplicar las primeras mejoras reales de hardening sobre NovaMarket.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a aplicar un primer paquete de endurecimiento básico sobre NovaMarket y a validar cómo cambia el sistema después de esas mejoras iniciales.

Ese será el primer endurecimiento real de esta nueva etapa.

---

## Cierre

En esta clase organizamos un checklist básico de hardening para NovaMarket.

Con eso, la continuación opcional deja de hablar de seguridad en abstracto y empieza a ordenarla en un plan concreto, priorizado y razonable para seguir madurando el sistema.
