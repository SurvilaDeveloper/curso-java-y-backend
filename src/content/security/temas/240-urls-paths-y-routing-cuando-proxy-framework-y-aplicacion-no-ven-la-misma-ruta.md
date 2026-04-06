---
title: "URLs, paths y routing: cuando proxy, framework y aplicación no ven la misma ruta"
description: "Cómo entender parsing diferencial en URLs, paths y routing en aplicaciones Java con Spring Boot. Por qué no alcanza con validar una ruta en una sola capa y qué cambia cuando proxy, framework y aplicación interpretan distinto el mismo path."
order: 240
module: "Parsing diferencial y ambigüedad entre componentes"
level: "base"
draft: false
---

# URLs, paths y routing: cuando proxy, framework y aplicación no ven la misma ruta

## Objetivo del tema

Entender por qué **URLs**, **paths** y **routing** forman una de las superficies más importantes para pensar **parsing diferencial** y **ambigüedad entre componentes** en aplicaciones Java + Spring Boot.

La idea de este tema es continuar directamente lo que vimos sobre:

- parsing diferencial
- ambigüedad entre componentes
- canonicalización
- normalización
- y parámetros duplicados o headers repetidos bajo el patrón “uno valida, otro usa”

Ahora toca mirar un caso muy clásico y muy productivo para este tipo de bugs:

- proxy
- CDN
- load balancer
- gateway
- servidor web
- framework
- router
- filtros de seguridad
- aplicación
- storage o componente final

Y justo ahí aparece una suposición muy frágil:

- que todos ven la **misma ruta**

Eso suena obvio.
Pero en sistemas reales puede no ser cierto.

Porque una cosa es pensar:

- “la request vino a `/admin/report`”
- “validamos que el path empieza con `/public/`”
- “el proxy enruta esto a un servicio”
- “Spring resuelve este controller”

Y otra muy distinta es aceptar que entre una capa y otra pueden cambiar cosas como:

- slashes dobles
- `%2f`
- `%2e`
- segmentos `..`
- path parameters
- mayúsculas o minúsculas
- trailing slash
- normalización previa o posterior
- colapso de separadores
- reescrituras del proxy
- prefijos agregados o removidos
- decoding antes o después del match
- diferencias entre el path bruto y el path ya procesado

En resumen:

> URLs, paths y routing importan porque el riesgo no suele estar solo en qué string vino por red,  
> sino en qué ruta cree ver cada capa y cuál de esas rutas termina gobernando el filtrado, el routing, la autorización o el acceso real al recurso.

---

## Idea clave

La idea central del tema es esta:

> si varias capas toman decisiones sobre la ruta, pero no comparten exactamente la misma interpretación de esa ruta, el sistema puede terminar protegiendo una cosa y ejecutando otra.

Eso cambia mucho la forma de revisar seguridad en paths.

Porque una cosa es pensar:

- “el proxy bloquea `/admin`”
- “el filtro solo permite `/public/*`”
- “el router matchea esta ruta”
- “el controller recibe este endpoint”

Y otra muy distinta es preguntarte:

- “¿están comparando la misma representación?”
- “¿una capa decodea antes y otra después?”
- “¿una colapsa slashes y otra no?”
- “¿una ve el path reescrito y otra el original?”
- “¿una autoriza por una ruta y otra resuelve recurso por otra?”
- “¿qué string exacto es el que manda en cada punto?”

### Idea importante

El path no siempre tiene una semántica única a lo largo del sistema.
Y cuando eso pasa, el routing deja de ser solo plumbing y pasa a ser una frontera de seguridad.

### Regla sana

Cada vez que una capa filtre, autorice o rote por path, preguntate si la capa que realmente consumirá ese path comparte exactamente la misma ruta canónica.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- asumir que proxy, framework y app ven la misma ruta por definición
- validar un path antes de que otra capa lo normalice distinto
- no distinguir ruta cruda, ruta decodeada y ruta reescrita
- no revisar canonicalización de path cuando de eso depende authz o acceso a recurso
- creer que si una capa bloquea una ruta textual ya está protegido el recurso real
- tratar reescrituras o normalizaciones como detalles operativos y no como semántica de seguridad

Es decir:

> el problema no es solo qué URL entra.  
> El problema es **qué versión del path usa cada capa para decidir y cuál usa finalmente la capa que ejecuta**.

---

## Error mental clásico

Un error muy común es este:

### “Filtramos la ruta antes, así que si pasó ya debería ser segura”

Eso puede ser demasiado optimista.

Porque todavía conviene preguntar:

- ¿la ruta filtrada es la misma que luego matchea Spring?
- ¿el proxy y la app decodean igual?
- ¿la reescritura cambió prefijos o segmentos?
- ¿la autorización se hizo sobre el path raw o el normalized?
- ¿qué pasa si el recurso final se resuelve con otra semántica?
- ¿qué diferencia hay entre lo que se logueó, lo que se comparó y lo que se sirvió?

### Idea importante

Filtrar “la ruta” no alcanza si el sistema no tiene una sola verdad sobre qué ruta era realmente esa request.

---

# Parte 1: Qué significa “la misma ruta” en un sistema real

## La intuición simple

Cuando alguien dice “es la misma URL” o “es el mismo path”, suele sonar como una verdad obvia.
Pero en práctica puede haber varias versiones relevantes:

- la ruta tal como llegó por red
- la ruta tal como la ve el proxy
- la ruta luego de reescritura
- la ruta luego de URL decoding
- la ruta ya normalizada
- la ruta que usa el router del framework
- la ruta que usa el autorizador
- la ruta que usa el componente que finalmente toca el recurso

### Idea útil

Si esas versiones no coinciden de forma clara, ya no existe una única verdad textual compartida.

### Regla sana

Cada vez que un flujo dependa del path, hacé el mapa completo de:
- qué ve cada capa,
- qué transforma,
- y qué usa realmente para decidir.

---

# Parte 2: Routing también es interpretación

Otra idea importante: el routing no es solo lookup técnico.
También es interpretación semántica.

Un componente puede decidir:

- qué endpoint matchea
- qué handler recibe la request
- qué servicio downstream la procesa
- qué recurso interno representa
- qué política se le aplica
- si entra o no entra a una zona protegida

### Idea importante

Si dos capas no comparten la misma semántica del path, pueden enrutar y proteger realidades distintas.

### Regla sana

No trates el routing como una etapa neutra.
Cuando el path importa para seguridad, el routing es parte de la superficie de decisión.

---

# Parte 3: Raw path, decoded path y normalized path no son lo mismo

Este es uno de los aprendizajes más importantes del tema.

Podés pensar, conceptualmente, tres niveles:

## Raw path
Tal como entró, con escapes o codificaciones todavía presentes.

## Decoded path
Luego de interpretar secuencias encoded relevantes.

## Normalized path
Luego de colapsar o resolver cosas como:
- slashes redundantes
- segmentos equivalentes
- `.` o `..`
- trailing slash
- u otras reglas del sistema

### Idea útil

Si una capa compara el raw path y otra consume el normalized, la primera puede haber protegido una forma textual distinta de la realidad final.

### Regla sana

Cada vez que una validación por ruta importe para seguridad, preguntate sobre cuál nivel está ocurriendo: raw, decoded o normalized.

### Idea importante

Muchas defensas fallan porque comparan demasiado temprano, antes de que aparezca la semántica final del path.

---

# Parte 4: Reescrituras y prefijos pueden crear mundos distintos

En sistemas reales, el path no siempre llega intacto hasta la app.
Puede sufrir cosas como:

- agregar prefijo de gateway
- quitar prefijo de reverse proxy
- rewrite por versión de API
- cambio de mount point
- forwarding interno
- mapping a otro servicio
- fallback routing

### Idea útil

Entonces una capa puede estar validando `/public/report`
mientras otra termina resolviendo algo que internamente equivale a otra zona lógica.

### Regla sana

Cada vez que haya rewrites o prefijos virtuales, preguntate qué ruta es la que se usa para:
- filtrar,
- autorizar,
- loguear,
- y consumir realmente.

### Idea importante

La ruta “visible” al cliente no siempre coincide con la ruta “real” del backend.

---

# Parte 5: Slashes, segmentos y separadores no siempre son decorativos

A veces el equipo ve diferencias como:

- slash doble
- trailing slash
- segmentos vacíos
- `.` o `..`
- separadores repetidos

y las trata como cuestiones menores de formato.

### Problema

Si una capa los colapsa y otra no, ya cambió la semántica del path.

Eso puede afectar:

- matching de rutas
- zonas protegidas
- resolución de recursos
- equivalencia entre rutas
- cálculo de firmas
- allowlists de path

### Idea útil

No hace falta un payload llamativo.
Un separador extra puede bastar si dos capas lo entienden distinto.

### Regla sana

No subestimes la semántica de los delimitadores cuando varias capas comparan o resuelven paths.

---

# Parte 6: Proxy, framework y aplicación pueden tener “tres rutas verdaderas”

Este es un patrón muy útil para pensar.

## Proxy
Ve una ruta A y decide:
- filtrar
- enrutar
- reescribir

## Framework
Ve una ruta B y decide:
- matchear controller
- aplicar middleware
- resolver handler

## Aplicación o negocio
Ve una ruta C y decide:
- qué recurso real tocar
- qué permiso aplicar
- qué archivo o entidad resolver

### Idea importante

Si A, B y C no coinciden del todo, el sistema global ya no tiene una sola ruta verdadera.

### Regla sana

No revises solo “qué path recibió Spring”.
Revisá también qué path decidió el proxy y qué path usa la lógica final del recurso.

---

# Parte 7: La autorización por path es especialmente frágil bajo ambigüedad

Muchas apps hacen cosas como:

- proteger `/admin/**`
- permitir `/public/**`
- restringir `/internal/**`
- derivar tenant o módulo desde el path
- decidir si algo es descargable por prefijo o carpeta lógica

Eso puede funcionar.
Pero se vuelve muy frágil si la capa que autoriza:

- compara una forma textual
- mientras otra resuelve otra representación
- o el recurso final se calcula con otra lógica de path

### Idea útil

La authz basada en path exige muchísimo alineamiento semántico entre capas.

### Regla sana

Cada vez que el permiso dependa de la ruta, preguntate si la ruta protegida y la ruta consumida son realmente la misma cosa.

### Idea importante

Autorizar sobre paths mal canonicalizados se parece mucho a firmar una cosa y ejecutar otra.

---

# Parte 8: El storage o filesystem también puede reintroducir semántica nueva

Esto es especialmente delicado cuando el path de aplicación termina afectando:

- filesystem
- bucket storage
- repositorio documental
- resolución de templates
- descarga de archivos
- keys de objetos

Porque ahí puede pasar que:

- la app compare un path lógico
- el storage resuelva otro tras su propia normalización
- el recurso real termine siendo distinto del que la validación creyó haber aprobado

### Idea útil

El consumidor final del path no siempre es el controller.
A veces es otra capa con otra canonicalización todavía.

### Regla sana

No cierres la review en el routing HTTP si el path termina impactando un recurso real que tiene su propia semántica.

---

# Parte 9: Qué patrones merecen sospecha inmediata

Conviene sospechar especialmente cuando veas cosas como:

- filtros custom de URI
- authz por prefijos de path
- reverse proxy con rewrites
- URLs firmadas o HMAC sobre la ruta textual
- lógica de recursos basada en concatenación de paths
- comparación manual de `startsWith("/admin")`, `startsWith("/public")`, etc.
- integración entre CDN/proxy y Spring con distinta política de normalización
- resolución final del recurso fuera del router principal

### Idea útil

No hace falta conocer un bypass puntual para detectar la clase de problema.
Alcanza con ver que varias capas deciden cosas sensibles sobre paths y no está claro si comparten la misma canonicalización.

### Regla sana

Cada vez que una ruta tenga poder de routing, authz o resolución de recurso, exigí una verdad canónica compartida o asumí parsing diferencial potencial.

---

# Parte 10: Qué preguntas conviene hacer en una review

Cuando revises URLs, paths y routing, conviene preguntar:

- ¿qué ve el proxy?
- ¿qué ve el framework?
- ¿qué ve la lógica de negocio?
- ¿qué transformaciones ocurren en el medio?
- ¿se decodea antes o después del filtro?
- ¿se normaliza antes o después del routing?
- ¿qué path se firma?
- ¿qué path se autoriza?
- ¿qué path consume finalmente el recurso real?

### Idea importante

La review buena no termina en:
- “la ruta es esta”
Sigue hasta:
- “¿esta ruta es la misma para todas las capas que toman decisiones sobre ella?”

---

# Parte 11: Qué revisar en una app Spring

En una app Spring, conviene sospechar especialmente cuando veas:

- `HandlerInterceptor` o filtros que comparan paths manualmente
- reglas de seguridad por patrones de ruta
- reverse proxies o API gateways delante de la app
- `Forwarded` / `X-Forwarded-*` combinados con routing o host/path logic
- controladores que derivan recursos reales desde fragments de path
- firmas sobre URLs
- serving de archivos o recursos donde el path HTTP se traduce a otra semántica interna

### Idea útil

Si el path decide seguridad y más de una capa lo toca, ya hay suficiente superficie como para revisar alineación semántica real.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- una forma canónica clara del path relevante
- menos reescrituras opacas entre capas
- validación y consumo sobre representaciones alineadas
- menor distancia entre authz por ruta y recurso real servido
- equipos que pueden explicar qué path exacto manda en cada etapa

### Idea importante

La madurez aquí se nota cuando el sistema no deja que proxy, framework y negocio vivan con rutas “parecidas”, sino con una semántica bien alineada.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- nadie sabe cuál es la ruta “real” después de rewrites
- proxy y app tienen políticas de normalización diferentes
- filtros o authz comparan strings crudos
- se firma una ruta y se sirve otra equivalente solo para otra capa
- el recurso real se resuelve con semántica distinta a la del routing
- el equipo asume que todas las capas ven “obviamente lo mismo”

### Regla sana

Si el sistema no puede responder con claridad qué ruta exacta valida, cuál enruta y cuál consume realmente, probablemente ya tiene suficiente ambigüedad como para que una capa proteja una cosa y otra ejecute otra.

---

## Checklist práctica

Para revisar URLs, paths y routing, preguntate:

- ¿qué representaciones del path existen?
- ¿quién las transforma?
- ¿cuál se usa para filtrar?
- ¿cuál se usa para autorizar?
- ¿cuál se usa para routing?
- ¿cuál usa finalmente el recurso real?
- ¿qué daño aparece si dos de esas capas no coinciden?

---

## Mini ejercicio de reflexión

Tomá una ruta real de tu app Spring y respondé:

1. ¿Qué ve primero el proxy o gateway?
2. ¿Qué ve Spring al rutear?
3. ¿Qué usa la lógica final para identificar el recurso?
4. ¿Qué transformaciones ocurren en el medio?
5. ¿Qué capa toma una decisión sensible por esa ruta?
6. ¿Qué parte del equipo sigue asumiendo que todas ven lo mismo?
7. ¿Qué revisarías primero después de este tema?

---

## Resumen

Las URLs, los paths y el routing importan porque muchas fallas de parsing diferencial no nacen de un parser absurdo, sino de que distintas capas del sistema toman decisiones críticas sobre rutas que no están viendo exactamente de la misma manera.

La gran intuición del tema es esta:

- la ruta no siempre es una sola verdad compartida
- raw, decoded, normalized y rewritten pueden divergir
- proxy, framework y aplicación pueden decidir sobre paths distintos
- authz por ruta es especialmente frágil si la canonicalización no está alineada
- y el problema no es solo qué string vino, sino qué ruta exacta termina mandando en cada etapa del sistema

En resumen:

> un backend más maduro no trata las URLs y los paths como simples cadenas que todas las capas van a interpretar “más o menos igual”, sino como entradas cuya semántica puede fragmentarse entre proxy, framework, filtros y lógica de negocio si no existe una forma canónica compartida.  
> Entiende que la pregunta importante no es solo cuál es la ruta que ve una capa concreta, sino si esa capa está tomando decisiones de seguridad sobre la misma ruta que después gobernará el routing, la autorización y el acceso real al recurso.  
> Y justamente por eso este tema importa tanto: porque muestra una de las superficies más clásicas del parsing diferencial, la de sistemas donde una ruta parece segura, pública o válida para una capa y termina siendo otra cosa para la siguiente, que es una de las maneras más directas de convertir validaciones razonables en protecciones semánticamente desalineadas.

---

## Próximo tema

**Firmas, HMAC y representación canónica: cuando se firma una cosa y se ejecuta otra**
