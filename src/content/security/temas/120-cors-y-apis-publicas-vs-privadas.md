---
title: "CORS y APIs públicas vs privadas"
description: "Cómo pensar CORS de forma distinta en APIs públicas y privadas dentro de una aplicación Java con Spring Boot. Por qué no conviene aplicar la misma política a todos los endpoints, qué cambia cuando hay autenticación o datos sensibles y cómo evitar configuraciones amplias por inercia."
order: 120
module: "HTTP, headers y superficie del navegador"
level: "base"
draft: false
---

# CORS y APIs públicas vs privadas

## Objetivo del tema

Entender por qué **CORS no debería pensarse igual en APIs públicas y privadas** dentro de una aplicación Java + Spring Boot.

La idea de este tema es cerrar el bloque de CORS con una distinción muy útil, porque muchas configuraciones nacen de una simplificación que después trae problemas:

- “pongamos una política global”
- “total todos los endpoints son de la misma app”
- “si al frontend le funciona, ya está”
- “dejemos la misma configuración para todo y no nos complicamos”

Eso suele mezclar superficies muy distintas.

Porque no es lo mismo exponer:

- un catálogo público
- una lista de países
- una API abierta de solo lectura
- un endpoint sin sesión ni datos privados

que exponer:

- perfil del usuario
- pedidos
- billing
- backoffice
- acciones autenticadas
- recursos multi-tenant
- operaciones con cookies o sesión

En resumen:

> CORS no debería configurarse igual para todo porque no todas las APIs expresan el mismo nivel de confianza ni exponen el mismo tipo de respuesta al navegador.

---

## Idea clave

La pregunta más útil para pensar CORS no es solo:

- “¿qué frontend tiene que hablar con esto?”

También es:

- “¿qué tipo de API es esto?”
- “¿qué valor tiene lo que devuelve?”
- “¿hay autenticación?”
- “¿hay cookies o sesión?”
- “¿es una lectura pública o una interacción privada?”
- “¿qué tan costoso sería que otro origin pudiera leer esta respuesta?”

La idea central es esta:

> cuanto más privada, autenticada o sensible es una API, menos sentido tiene tratar CORS como si fuera un detalle menor de integración.

Y, al revés:

> cuanto más pública y deliberadamente abierta es una API, más razonable puede ser una política menos restrictiva, siempre que siga estando alineada con el modelo real de consumo.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- aplicar la misma política CORS a toda la app por comodidad
- abrir demasiado endpoints privados solo porque endpoints públicos también existen
- no distinguir entre lectura pública y lectura autenticada
- heredar orígenes, métodos y headers de una API a otra sin revisar sensibilidad
- mezclar CORS de catálogo público con CORS de perfil de usuario
- asumir que “como todo vive bajo el mismo backend, la política puede ser la misma”
- abrir CORS global porque una parte del frontend lo necesitaba
- no ver que cada clase de endpoint expresa una relación distinta de confianza con el navegador

Es decir:

> el problema no es solo tener CORS.  
> El problema es no segmentarlo según el valor real del recurso y el contexto de autenticación que hay detrás.

---

## Error mental clásico

Un error muy común es este:

### “Si ya configuramos CORS para la app, alcanza para todos los endpoints”

Eso es demasiado bruto.

Porque una misma aplicación puede exponer al mismo tiempo:

- recursos totalmente públicos
- recursos internos
- recursos con sesión
- endpoints de administración
- operaciones de lectura
- operaciones de escritura
- APIs para terceros
- APIs solo para un frontend concreto

### Idea importante

Una política uniforme puede ser cómoda de implementar, pero muchas veces es demasiado amplia para unas superficies y demasiado torpe para otras.

---

## Qué sería una API pública en esta conversación

Acá conviene definir el término con cuidado.

Cuando hablamos de una API pública en el contexto de CORS, solemos pensar en endpoints donde:

- la información está pensada para ser consumida ampliamente
- no hay sesión del usuario
- no viajan cookies delicadas
- no hay datos privados
- el recurso ya es, por diseño, bastante abierto o de bajo riesgo

### Ejemplos conceptuales

- catálogos públicos
- datos de referencia
- endpoints de documentación abierta
- recursos de solo lectura diseñados para múltiples frontends

### Idea útil

No todo lo “sin login” es automáticamente público en el sentido operativo.
Pero suele haber menos fricción para permitir lectura desde más origins cuando el valor de la respuesta es realmente abierto.

---

## Qué sería una API privada en esta conversación

En cambio, una API privada o sensible suele ser aquella donde aparece alguna combinación de:

- autenticación
- cookies o sesión
- datos del usuario
- operaciones con efectos
- backoffice
- multi-tenancy
- recursos con ownership
- lógica interna
- información de negocio no pública

### Ejemplos conceptuales

- perfil y configuración de cuenta
- pedidos o facturas
- datos internos de operación
- panel administrativo
- endpoints de moderación
- acciones de alta, edición o borrado
- recursos de un tenant

### Idea importante

En estas APIs, CORS ya no es solo “dejar que el frontend lea”.
Es una decisión bastante seria sobre qué origin puede hablar con el backend en nombre o contexto de usuarios reales.

---

## API pública no significa CORS sin pensar

Esto también conviene aclararlo.

A veces, como un recurso es público, el equipo salta a:

- “entonces `*`”
- “entonces cualquier origin”
- “entonces no importa”

No siempre es mala idea abrir bastante una API genuinamente pública.
Pero incluso ahí conviene preguntarse:

- ¿el uso está pensado para navegador de cualquiera o para otros clientes?
- ¿hay riesgo de abuso de volumen?
- ¿hay endpoints públicos que igual no quieren consumo cross-origin indiscriminado?
- ¿hay un modelo de negocio o de costo detrás?

### Idea importante

Público no significa automáticamente “abrí sin criterio”.
Significa que probablemente el análisis sea distinto y, en algunos casos, más laxo de forma legítima.

---

## API privada no debería heredar la apertura de la pública

Este es uno de los errores más comunes.

Una app tiene un par de endpoints públicos y, por facilidad, se configura CORS de manera global.
Después, sin querer, esa misma apertura termina aplicando a:

- endpoints autenticados
- datos de usuario
- recursos internos
- operaciones más sensibles

### Problema

La política deja de reflejar el recurso real y pasa a reflejar la comodidad de una configuración global.

### Regla sana

No dejes que la necesidad de un endpoint público arrastre apertura innecesaria sobre toda la superficie privada.

---

## Lo público suele pedir amplitud; lo privado, precisión

Esta es una intuición muy útil.

### En APIs públicas
puede tener sentido pensar en:
- más apertura
- menos confianza específica en un solo frontend
- políticas más compatibles con consumo amplio

### En APIs privadas
suele tener más sentido pensar en:
- menos origins
- más precisión
- menos métodos
- menos headers
- menos mezcla con entornos auxiliares
- más cuidado con credentials

### Idea importante

No hay una única política “correcta” de CORS.
La buena política depende del nivel de confianza que el recurso puede tolerar.

---

## Cuando hay cookies, la distinción se vuelve mucho más fuerte

Esto conecta directamente con los últimos temas.

Una API privada con:

- cookies
- sesión
- contexto autenticado
- datos del usuario

no debería pensarse ni remotamente igual que una API pública de lectura.

### Porque en ese caso CORS pasa a implicar

- qué frontend puede leer respuestas autenticadas
- qué origin puede beneficiarse del contexto del navegador
- qué blast radius aparece si ese frontend se compromete

### Regla sana

Si hay sesión, la palabra “pública” deja de servir como atajo mental.
La confianza cross-origin ya es de otro nivel.

---

## CORS amplio en endpoints públicos puede ser razonable; en privados, suele exigir mucha más justificación

Otra forma de decirlo:

- abrir más en público puede ser una decisión de producto
- abrir más en privado suele ser una decisión de confianza y de riesgo

### Idea útil

Eso no significa que toda API privada deba ser same-origin estricta en todos los casos.
Pero sí que cada apertura requiere mucha más explicación y mucha menos inercia.

---

## No todo endpoint del mismo backend pertenece a la misma categoría

Este también es un cambio mental importante.

A veces el equipo piensa la app como una sola unidad.
Pero desde CORS conviene clasificar mejor sus superficies.

Por ejemplo, dentro del mismo backend puede haber:

- endpoints totalmente públicos
- endpoints de frontend público
- endpoints de usuario autenticado
- endpoints internos
- endpoints admin
- webhooks
- healthchecks
- documentación
- recursos estáticos

### Idea importante

Si esas superficies tienen valores y riesgos distintos, la política CORS también debería reflejar esa diferencia.

---

## Política global vs segmentada

En muchos proyectos, la primera implementación de CORS es global.
Eso puede ser útil para arrancar.
Pero si la app crece, conviene preguntarse si esa política global sigue teniendo sentido.

### Porque una política segmentada puede ayudarte a

- abrir solo lo público donde corresponde
- mantener más precisión en lo privado
- separar admin de frontend de usuario
- evitar que una necesidad de integración arrastre permisos innecesarios a toda la app

### Regla sana

La política global cómoda de hoy puede ser la sobreexposición silenciosa de mañana.

---

## APIs públicas y abuso de volumen

Aunque un recurso sea público, eso no vuelve irrelevante la pregunta por CORS.

Porque una API pública usada desde navegador de cualquier origin también puede verse afectada por cosas como:

- scraping
- extracción masiva
- consumo abusivo desde muchos sitios
- costos operativos
- uso no esperado del producto

### Idea importante

A veces la discusión sobre CORS en APIs públicas no es tanto “confidencialidad”, sino:
- alcance del consumo
- forma del consumo
- y exposición operativa

---

## APIs privadas y frontends “nuestros”

Otro error frecuente es pensar:

- “esto es privado, pero solo lo consume nuestro frontend”
- “entonces da igual si dejamos varios origins de nuestro ecosistema”

Eso merece mucha más sospecha.

### Preguntas sanas

- ¿qué tan controlados están esos origins?
- ¿todos tienen el mismo nivel de seguridad?
- ¿hay previews, staging o contenido mixto?
- ¿hay cookies o sesión?
- ¿qué datos privados se leen desde ahí?

### Idea importante

La palabra “nuestro” no debería reemplazar el análisis real de confianza.

---

## APIs públicas y privadas en el mismo dominio: trampa mental

A veces todo vive bajo el mismo backend o el mismo dominio lógico.
Eso hace más fácil olvidar que no todo recurso merece la misma apertura.

### Problema

Si el equipo configura por infraestructura y no por sensibilidad del recurso, la política CORS puede terminar reflejando la topología del despliegue, no el riesgo del dato.

### Regla sana

No configures CORS pensando solo en “qué servicio es”.
Pensalo también en “qué clase de recurso devuelve este endpoint”.

---

## Lo público puede tolerar amplitud; lo privado necesita trazabilidad de confianza

Otra forma útil de resumirlo:

### En lo público
la pregunta es más:
- ¿queremos permitir consumo amplio desde navegador?

### En lo privado
la pregunta es más:
- ¿qué origin exacto merece leer esto con este contexto autenticado?

### Idea importante

Cuanto más privada es la respuesta, más debería parecer la configuración a una confianza explícita y auditada, no a una apertura práctica heredada.

---

## Qué errores aparecen cuando no hacés esta distinción

Hay síntomas bastante típicos:

- mismo `allowedOrigins` para todo
- `allowCredentials(true)` activo globalmente
- endpoints públicos arrastrando apertura sobre privados
- admin compartiendo política con frontend público
- staging permitido porque el catálogo público lo necesitaba
- el equipo no puede explicar qué endpoints son realmente públicos y cuáles no
- CORS pensado por aplicación, no por sensibilidad de recurso

### Idea importante

Cuando no segmentás, la política termina describiendo infraestructura y costumbre, no confianza real.

---

## Qué conviene revisar en una app Spring

Cuando revises CORS y APIs públicas vs privadas en una aplicación Spring, mirá especialmente:

- qué endpoints son genuinamente públicos
- cuáles son privados o autenticados
- si ambos comparten la misma política CORS
- si hay credentials o cookies en endpoints privados
- qué origins están permitidos para cada grupo
- si existe una configuración global demasiado amplia
- qué endpoints sensibles heredaron apertura por inercia
- si el equipo sabe explicar por qué un recurso es público y otro no
- si la política actual refleja producto y riesgo, o solo comodidad operativa

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- mejor distinción entre recursos públicos y privados
- menos política global indiscriminada
- orígenes más precisos en endpoints privados
- más apertura solo donde el recurso realmente lo tolera
- menos mezcla entre frontend público, usuario autenticado y admin
- mejor alineación entre sensibilidad del endpoint y su política CORS
- más capacidad de auditar por qué cada superficie permite lo que permite

---

## Señales de ruido

Estas señales merecen revisión rápida:

- misma política CORS para todo el backend
- cookies y sesión habilitadas igual en superficies muy distintas
- endpoints privados heredando apertura de endpoints públicos
- el equipo no sabe cuáles APIs son verdaderamente públicas
- खुल long lists de origins justificadas por recursos públicos pero aplicadas a todo
- no hay segmentación entre usuario, backoffice y admin
- CORS tratado como plumbing global y no como decisión por superficie

---

## Checklist práctico

Cuando revises CORS y APIs públicas vs privadas, preguntate:

- ¿qué endpoints de esta app son realmente públicos?
- ¿cuáles son privados o autenticados?
- ¿comparten hoy la misma política CORS?
- ¿qué parte de esa política solo existe por los endpoints públicos?
- ¿qué parte queda demasiado abierta para los privados?
- ¿hay cookies o sesión en juego?
- ¿qué origins deberían poder leer cada grupo de endpoints?
- ¿qué endpoint privado heredó una confianza que en realidad no merece?
- ¿qué segmentación falta hoy?
- ¿qué cambio harías primero para que la política exprese mejor la sensibilidad real del recurso?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Qué endpoints son públicos de verdad?
2. ¿Qué endpoints son privados o autenticados?
3. ¿Tienen hoy la misma política CORS?
4. ¿Qué parte de la apertura actual solo se justificaba por lo público?
5. ¿Qué endpoint privado te preocupa más que herede esa misma apertura?
6. ¿Qué frontends deberían poder leer cada categoría?
7. ¿Qué cambio harías primero para separar mejor lo público de lo privado en la política CORS?

---

## Resumen

CORS no debería pensarse igual en APIs públicas y privadas porque el valor del recurso, el contexto de autenticación y la relación de confianza con el navegador cambian muchísimo entre una y otra.

En términos simples:

- lo público puede tolerar más amplitud si el modelo de producto lo permite
- lo privado exige mucha más precisión, sobre todo si hay cookies, sesión o datos sensibles

En resumen:

> un backend más maduro no aplica una política CORS uniforme solo porque todos los endpoints viven bajo la misma aplicación.  
> Distingue qué recursos están hechos para ser leídos ampliamente y cuáles implican una confianza mucho más delicada entre frontend, navegador y backend, porque entiende que abrir bien lo público no debería significar arrastrar la misma apertura sobre lo privado, y que una política sana de CORS empieza justamente cuando deja de tratar como iguales superficies que claramente no lo son.

---

## Próximo tema

**Vary: Origin y caches**
