---
title: "Spring Data, filtros dinámicos y evaluación inesperada"
description: "Cómo entender los riesgos de filtros dinámicos y evaluación inesperada en Spring Data y aplicaciones Java con Spring Boot. Por qué no todo query building declarativo es solo dato, y qué cambia cuando input externo influye demasiado la lógica de filtrado, navegación o construcción de consultas."
order: 204
module: "Expresiones, templates y ejecución indirecta"
level: "base"
draft: false
---

# Spring Data, filtros dinámicos y evaluación inesperada

## Objetivo del tema

Entender por qué **Spring Data** y los **filtros dinámicos** pueden convertirse en una superficie delicada en aplicaciones Java + Spring Boot cuando el sistema deja que input externo influya demasiado en cómo se construyen, resuelven o evalúan criterios de consulta.

La idea de este tema es continuar directamente lo que vimos sobre:

- expression injection
- ejecución indirecta
- SpEL
- `@Value`
- y cadenas que dejan de ser solo dato para entrar en mecanismos interpretativos del framework

Ahora toca bajar esa intuición a una zona muy cotidiana del backend Spring:

- búsqueda
- filtros
- ordenamiento
- criteria dinámicos
- query builders
- repositories
- y combinaciones declarativas que el equipo suele percibir como “solo lógica de datos”

Y justo ahí aparece una trampa muy común.

Porque una cosa es:

- recibir parámetros
- validarlos
- y mapearlos a filtros explícitos y cerrados

Y otra muy distinta es:

- recibir strings o estructuras flexibles
- dejar que definan qué campos se navegan
- qué relaciones se recorren
- qué operadores se usan
- o qué parte del framework arma y evalúa la consulta con demasiada magia

En resumen:

> los filtros dinámicos importan porque el problema no es solo qué datos consulta el backend,  
> sino cuánto poder le da al input para describir la lógica declarativa que Spring o sus capas asociadas van a construir, resolver o interpretar al momento de ejecutar una búsqueda.

---

## Idea clave

La idea central del tema es esta:

> no todo filtro dinámico es solo “dato para una consulta”.  
> A veces es una forma de **lógica declarativa influida por input**.

Eso cambia bastante la conversación.

Porque una cosa es:

- `status = ACTIVE`
- `page = 2`
- `sort = createdAt desc`
- y una lista pequeña de filtros permitidos y bien mapeados

Y otra muy distinta es:

- dejar que el cliente arme paths de propiedades
- combinar operadores flexibles
- decidir joins o navegación
- o pasar cadenas que el framework o una capa auxiliar interpretan con más libertad de la que el negocio necesitaba exponer

### Idea importante

La frontera crítica no está solo en la query final.
Está en **cómo se construye** y **qué parte de esa construcción depende de input no confiable**.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- pensar que todos los filtros dinámicos son equivalentes
- tratar query building como si fuera solo “pasar parámetros”
- no distinguir filtros cerrados de filtros demasiado expresivos
- dejar que el input navegue propiedades o relaciones sin suficiente control
- no ver que una sintaxis flexible de búsqueda puede acercarse mucho a un motor de evaluación declarativa
- subestimar la opacidad que introduce el framework cuando arma demasiado por vos

Es decir:

> el problema no es solo buscar datos.  
> El problema es permitir que input externo describa demasiado de la lógica de búsqueda que el backend va a interpretar o ejecutar.

---

## Error mental clásico

Un error muy común es este:

### “Esto no es evaluación; son solo filtros de base de datos”

Eso puede ser cierto en diseños pequeños y cerrados.
Pero deja de ser una buena descripción cuando:

- el cliente define paths de propiedades
- el filtro acepta operadores ricos
- la query se arma con demasiada flexibilidad
- hay navegación de relaciones
- o el framework empieza a resolver bastante más lógica de la que el equipo cree

### Idea importante

La palabra “filtro” puede esconder una frontera bastante más interpretativa de lo que parece.

---

# Parte 1: Qué significa “filtro dinámico”, a nivel intuitivo

## La intuición simple

Un filtro dinámico suele ser cualquier mecanismo donde el sistema no tiene una sola consulta fija, sino que construye alguna parte de la lógica de búsqueda en función de input.

Eso puede incluir:

- campos opcionales
- ordenamientos variables
- operadores configurables
- navegación por atributos
- combinación AND/OR
- filtros por rangos
- búsquedas avanzadas
- criterios declarativos enviados desde frontend o admin

### Idea útil

La dinamia no es mala por sí misma.
El problema aparece cuando el nivel de expresividad crece más de lo que el negocio realmente necesitaba.

### Regla sana

Cuanto más describe el cliente la forma de la consulta, más conviene revisar esa superficie como lógica declarativa y no solo como “parámetros”.

---

# Parte 2: Filtro cerrado vs filtro demasiado expresivo

Esta distinción ayuda muchísimo.

## Filtro cerrado
- campos conocidos
- operadores conocidos
- mapping explícito
- pocas sorpresas
- poca navegación de relaciones
- poca magia del framework

## Filtro demasiado expresivo
- campos arbitrarios o semi-arbitrarios
- paths dinámicos
- operadores amplios
- composición rica
- navegación profunda
- más interpretación del lado del backend

### Idea importante

Ambos pueden llamarse “filtros dinámicos”, pero no tienen el mismo perfil de riesgo.

### Regla sana

La madurez aquí se nota cuando el backend decide:
- qué filtros existen,
- en vez de dejar que el cliente describa demasiada lógica de filtrado.

---

# Parte 3: Por qué Spring Data hace esto especialmente traicionero

Spring Data y su ecosistema vuelven esto cómodo porque abstraen muchísimo:

- repositories
- specifications
- criteria
- sorting
- paging
- query derivation
- predicates
- builders declarativos

Eso es muy útil.
Pero también puede esconder bastante poder.

### Idea útil

Cuando el framework construye la query “por vos”, es fácil dejar de mirar:
- qué parte sigue siendo completamente tu decisión
y
- qué parte ya está siendo guiada por input no confiable.

### Regla sana

Cada vez que Spring Data te ahorre mucho código en filtros dinámicos, preguntate cuánto control explícito acabás de ceder.

---

# Parte 4: El problema de los property paths

Uno de los riesgos más típicos aparece cuando el sistema acepta algo como:

- nombre de campo
- ruta de propiedad
- nested property
- criterio que puede navegar relaciones

Desde negocio eso se siente poderoso y elegante:
- “dejo elegir el campo”
- “dejo ordenar por cualquier cosa”
- “dejo filtrar por propiedades anidadas”

### Problema

En ese momento el input ya no describe solo un valor.
Empieza a describir **qué parte del modelo de datos quiere recorrer**.

### Idea importante

Eso acerca mucho la frontera al lenguaje interno del modelo, no solo a un catálogo pequeño de filtros permitidos.

### Regla sana

Cada vez que el cliente elige paths o propiedades, preguntate si el backend sigue teniendo el control real del espacio de búsqueda.

---

# Parte 5: Operadores dinámicos también son lógica

Otra trampa común es tratar al operador como si fuera un detalle menor.

Pero no es lo mismo permitir:

- igualdad simple
que
- contiene
- rango
- comparación
- combinaciones
- not
- in
- startsWith
- navegación anidada
- criterios compuestos

### Idea útil

Cada operador nuevo no solo suma UX.
También suma expresividad lógica.

### Regla sana

No midas un filtro solo por el campo que toca.
Medilo también por el operador y por la composición que habilita.

### Idea importante

El operador es parte de la lógica de evaluación, no un simple valor más.

---

# Parte 6: El problema de “búsqueda avanzada” como mini lenguaje

Muchas apps terminan creando algo que no llaman DSL, pero que en la práctica se le parece mucho:

- filtros configurables
- JSON de criterios
- strings de búsqueda rica
- builders desde frontend
- reglas de admin
- query params con semántica cada vez más expresiva

### Idea útil

Cuando esa flexibilidad crece, el sistema deja de recibir solo parámetros y empieza a recibir una forma de **lenguaje de consulta declarativa**.

### Regla sana

Cada vez que una búsqueda avanzada empieza a sentirse como un mini lenguaje, conviene tratarla como tal desde seguridad.

### Idea importante

No hace falta llamar “engine” a algo para que ya esté actuando como uno.

---

# Parte 7: Qué tipo de evaluación inesperada puede aparecer

Este tema no es solo “query rota”.
También puede haber cosas como:

- navegación de propiedades no prevista
- acceso a campos que el equipo no quería abrir
- filtros demasiado costosos
- combinaciones lógicas no pensadas
- queries más ricas de lo que el producto necesitaba
- exposición de estructura interna del modelo
- comportamiento raro por paths o relaciones profundas
- mezcla entre input y mecanismos declarativos del framework

### Idea útil

La evaluación inesperada acá no siempre es “ejecución” espectacular.
A veces es dejar que el cliente describa demasiado de la lógica interna de búsqueda.

### Regla sana

Si el filtro ya no se parece a una lista cerrada de opciones, probablemente merece revisión como superficie interpretativa.

---

# Parte 8: El modelo de dominio no debería salir tan directo al borde

Esto conecta con deserialización y con SpEL.

A veces el equipo piensa:
- “como internamente tenemos estas entidades y relaciones, dejemos que el cliente filtre por ellas”

Eso puede ser cómodo.
Pero también puede ser demasiado.

### Idea importante

El modelo interno del dominio no siempre debería reflejarse directamente en el lenguaje de filtrado que exponés en la API.

### Regla sana

No le regales al cliente el mismo mapa de propiedades y relaciones que usa internamente tu backend.

---

# Parte 9: Qué señales indican que el filtro ya es demasiado poderoso

Conviene sospechar más cuando aparecen cosas como:

- paths de propiedades enviados por el cliente
- ordenamiento por campos arbitrarios
- filtros anidados y composables
- reglas guardadas por usuarios o admins
- query builders en frontend que describen mucha lógica
- poca diferencia entre lenguaje de negocio y lenguaje de consulta real
- el equipo ya no puede enumerar claramente qué combinaciones admite el sistema

### Idea útil

No hace falta que todas estén presentes.
Con varias de ellas, la superficie ya cambió de categoría.

### Regla sana

Si el equipo no puede explicar en una frase corta qué filtros exactos admite la API, probablemente ya abrió más expresividad de la necesaria.

---

# Parte 10: Qué preguntas conviene hacer en una review

Cuando revises filtros dinámicos en Spring Data o capas cercanas, conviene preguntar:

- ¿qué campos exactos se pueden filtrar?
- ¿qué operadores exactos se pueden usar?
- ¿quién decide esos campos y operadores?
- ¿hay property paths o navegación de relaciones?
- ¿qué parte del framework arma o interpreta esto?
- ¿el negocio necesitaba realmente esta flexibilidad?
- ¿podría resolverse con un contrato más explícito y más chico?
- ¿qué parte del modelo interno quedó expuesta sin necesidad?

### Idea importante

La pregunta útil no es solo:
- “¿la búsqueda funciona?”
Sino:
- “¿cuánta lógica de búsqueda quedó externalizada hacia input no confiable?”

---

# Parte 11: Qué revisar en una app Spring

En una app Spring, conviene sospechar especialmente cuando veas:

- filtros dinámicos armados desde request params
- builders de criteria
- specifications generadas desde input flexible
- ordenamiento configurable por nombres de campos
- filtros guardados por usuario o admin
- query DSL internas o JSON de criterios
- controllers o services que aceptan property names, sort fields o rutas anidadas casi directas desde el cliente

### Idea útil

Si una API deja que el cliente describa no solo valores sino también estructura de consulta, ya hay una superficie más rica que merece atención.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- campos filtrables bien enumerados
- operadores bien enumerados
- mapping explícito del lado del servidor
- poca navegación libre de propiedades
- menor cercanía entre API pública y modelo interno
- menos magia declarativa innecesaria
- equipos que saben explicar exactamente qué combina y qué no la búsqueda

### Idea importante

La madurez aquí se nota cuando la búsqueda sigue siendo flexible para negocio, pero pequeña para seguridad.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- el cliente decide demasiado del query shape
- property paths casi libres
- operadores muy ricos sin justificación clara
- filtros persistentes o configurables con mucha expresividad
- el equipo no sabe bien hasta dónde navega el motor
- se trata la búsqueda avanzada como “solo filtros” cuando ya parece un mini lenguaje

### Regla sana

Si la búsqueda ya se siente como una DSL, auditála como una DSL.

---

## Checklist práctica

Para revisar filtros dinámicos en una app Spring, preguntate:

- ¿qué define el cliente: valores o también lógica?
- ¿qué campos puede tocar?
- ¿qué operadores puede usar?
- ¿puede navegar relaciones o propiedades anidadas?
- ¿qué parte del framework interpreta eso?
- ¿qué parte del dominio quedó demasiado expuesta?
- ¿qué podría hacerse más cerrado y explícito?

---

## Mini ejercicio de reflexión

Tomá una búsqueda real de tu app Spring y respondé:

1. ¿Qué campos permite filtrar?
2. ¿Qué operadores permite?
3. ¿Hay property paths o nested properties?
4. ¿Qué parte arma Spring automáticamente?
5. ¿Qué parte del filtro ya se parece a un mini lenguaje?
6. ¿Qué flexibilidad aporta valor real y cuál sobra?
7. ¿Qué revisarías primero después de este tema?

---

## Resumen

Spring Data y los filtros dinámicos importan porque la búsqueda deja de ser una lista simple de parámetros en cuanto el sistema permite que input externo influya demasiado la forma de la lógica declarativa que el backend construye o interpreta para consultar datos.

La gran intuición del tema es esta:

- no todo filtro dinámico es igual
- el riesgo crece cuando el cliente deja de aportar solo valores y empieza a describir lógica
- property paths, operadores ricos y builders flexibles agrandan mucho la superficie
- y el problema real no está solo en la query final, sino en el poder interpretativo que se cedió al framework y al input

En resumen:

> un backend más maduro no confunde flexibilidad de búsqueda con licencia para exponer una mini DSL o una representación demasiado cercana de su modelo interno al borde público de la aplicación, sino que mantiene bien separadas las necesidades de negocio de la expresividad técnica del framework.  
> Entiende que la pregunta importante no es solo si los filtros devuelven los resultados correctos, sino cuánta lógica de consulta quedó modelada del lado del cliente y cuánta navegación, composición y evaluación está haciendo Spring en nombre de cadenas que el sistema quizá nunca debió tratar como algo más que parámetros acotados.  
> Y justamente por eso este tema importa tanto: porque muestra otra forma muy concreta de ejecución indirecta donde el problema no se ve como “correr código”, sino como dejar que input no confiable describa más de la lógica de búsqueda de lo que el negocio realmente necesitaba exponer.

---

## Próximo tema

**Motores de templates server-side: dónde aparece SSTI en Java**
