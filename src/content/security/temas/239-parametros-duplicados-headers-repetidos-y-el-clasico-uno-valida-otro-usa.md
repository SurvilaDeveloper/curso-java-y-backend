---
title: "Parámetros duplicados, headers repetidos y el clásico “uno valida, otro usa”"
description: "Cómo entender parámetros duplicados, headers repetidos y el patrón clásico de una capa que valida una interpretación mientras otra usa otra distinta en aplicaciones Java con Spring Boot. Por qué el problema no está solo en que el input tenga repeticiones, sino en cómo distintas capas eligen cuál valor consideran el verdadero."
order: 239
module: "Parsing diferencial y ambigüedad entre componentes"
level: "base"
draft: false
---

# Parámetros duplicados, headers repetidos y el clásico “uno valida, otro usa”

## Objetivo del tema

Entender por qué los **parámetros duplicados**, los **headers repetidos** y el patrón clásico de **“uno valida, otro usa”** son una superficie muy importante en aplicaciones Java + Spring Boot cuando distintas capas del sistema no coinciden en cuál valor consideran el “real”.

La idea de este tema es continuar directamente lo que vimos sobre:

- parsing diferencial
- ambigüedad entre componentes
- canonicalización
- normalización
- y la pregunta “qué string es el verdadero”

Ahora toca mirar una forma muy concreta y muy frecuente en la que esa pregunta se rompe.

Porque muchas veces el sistema asume algo implícito:

- “este parámetro tiene un valor”
- “esta cabecera tiene un valor”
- “este campo identifica una sola cosa”
- “este header representa al cliente real”
- “este query param ya quedó resuelto”

Pero en la práctica el input puede traer:

- parámetros repetidos
- headers duplicados
- múltiples instancias del mismo nombre
- variantes combinadas por proxy
- listas separadas por coma
- y capas que eligen resolver eso de manera diferente

Y justo ahí aparece un patrón clásico:

1. una capa valida o filtra usando un valor
2. otra capa consume el mismo nombre, pero elige otro valor
3. el sistema cree haber protegido el input
4. pero en realidad validó una interpretación y ejecutó otra

En resumen:

> parámetros duplicados, headers repetidos y el patrón “uno valida, otro usa” importan porque muchas vulnerabilidades no nacen de valores exóticos,  
> sino de que distintas capas del sistema no coinciden en cuál instancia de un mismo input es la que manda, y el diseño actúa como si sí coincidieran.

---

## Idea clave

La idea central del tema es esta:

> cuando un input puede aparecer más de una vez, el problema ya no es solo qué valor trae,  
> sino **qué capa decide cuál de esos valores es el verdadero**.

Eso cambia mucho la forma de revisar filtros y validaciones.

Porque una cosa es pensar:

- “validamos el parámetro `redirect`”
- “leímos el header `Host`”
- “comparamos el valor de `X-Forwarded-For`”
- “controlamos el `role` que vino en la query”
- “el request trae este único `id`”

Y otra muy distinta es preguntarte:

- “¿qué pasa si vienen dos?”
- “¿esta capa toma el primero y la siguiente el último?”
- “¿una combina y la otra separa?”
- “¿el gateway ve un header y la app ve otro?”
- “¿la validación se hizo sobre el primer valor pero el router o el negocio usan el segundo?”

### Idea importante

La duplicación no es solo un detalle de formato.
Puede cambiar por completo qué dato termina gobernando la decisión real del sistema.

### Regla sana

Cada vez que un parámetro o header pueda aparecer repetido, preguntate qué capas lo leen, cuál elige cada una y si todas coinciden en esa elección.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- asumir que un parámetro tiene un solo valor por definición
- tratar headers repetidos como si todas las capas los fusionaran igual
- no revisar qué hace el framework, qué hace el proxy y qué hace el código custom
- validar un primer valor cuando el consumidor final usa otro
- no modelar listas, repetidos o ambigüedad como parte del input
- creer que si “el nombre del campo” es el mismo entonces la semántica también lo es

Es decir:

> el problema no es solo que un input venga repetido.  
> El problema es **qué pasa cuando una capa decide sobre una instancia y otra actúa sobre otra distinta**.

---

## Error mental clásico

Un error muy común es este:

### “Ya validamos el parámetro/header, así que está resuelto”

Eso puede ser demasiado optimista.

Porque todavía conviene preguntar:

- ¿qué valor exacto validamos?
- ¿qué pasa si el nombre aparece dos veces?
- ¿el framework me devuelve el primero, el último o todos?
- ¿el proxy combinó los valores?
- ¿la capa siguiente hace otra elección?
- ¿el componente que ejecuta el flujo ve exactamente la misma cosa?

### Idea importante

Validar “el nombre” del input no alcanza si el sistema no tiene una regla única sobre cuál valor de ese nombre es el que cuenta.

---

# Parte 1: Qué significa “duplicado” en este contexto

## La intuición simple

Acá “duplicado” no significa necesariamente error sintáctico.
Puede significar que el mismo nombre aparece más de una vez en el request o en la representación procesada por distintas capas.

Eso puede pasar con:

- query params repetidos
- form params repetidos
- headers duplicados
- cookies con semánticas parecidas
- campos serializados con claves repetidas
- valores repetidos convertidos en arrays o listas

### Idea útil

El problema no siempre es que el input esté “mal formado”.
A veces está dentro de lo que alguna capa tolera, pero eso ya basta para crear ambigüedad.

### Regla sana

Cada vez que una estructura admita más de una aparición del mismo nombre, asumí que ya puede existir parsing diferencial.

---

# Parte 2: Primero, último o todos: la decisión ya es semántica

Este es uno de los aprendizajes más importantes del tema.

Cuando una capa recibe varios valores con el mismo nombre, puede optar por algo como:

- tomar el primero
- tomar el último
- tomar todos en una lista
- concatenarlos
- rechazar el input
- normalizar y quedarse con uno
- delegar a otra capa la elección

### Idea importante

Eso no es un detalle irrelevante del parser.
Es una decisión que cambia la verdad del input.

### Regla sana

No des por sentado que dos componentes eligen igual entre primero, último o todos.

### Idea útil

La política de resolución de duplicados es parte de la semántica, no solo del parser.

---

# Parte 3: El patrón “uno valida, otro usa”

Este es el corazón del tema.

Podés pensar el patrón así:

1. entra un input con repeticiones
2. una capa de seguridad, filtro o negocio mira una representación
3. otra capa de routing, autorización o ejecución mira otra
4. el sistema cree haber protegido el flujo
5. pero la protección y el uso no estaban hablando del mismo valor

### Idea importante

No hace falta que una capa esté “rota”.
Alcanza con que cada una resuelva duplicados de manera distinta.

### Regla sana

Cada vez que una capa tome una decisión crítica sobre un parámetro o header, verificá si el consumidor final del mismo nombre ve exactamente el mismo valor.

---

# Parte 4: Parámetros duplicados: el caso más fácil de imaginar

A nivel intuitivo, imaginá un parámetro como:

- `id`
- `redirect`
- `returnTo`
- `tenant`
- `role`
- `action`
- `file`
- `next`
- `target`

Si viene dos veces, pueden pasar cosas como:

- una capa valida el primero
- otra usa el último
- una los mete en array
- otra llama a `getParameter()` y toma una sola versión
- una decide que está bien
- otra termina ejecutando con otro valor

### Idea útil

El sistema puede quedar con una falsa sensación de control:
- “sí, vimos el parámetro”
aunque en realidad la ejecución usó otra instancia del mismo.

### Regla sana

No valides “el parámetro X” en abstracto.
Validá la misma resolución concreta que el consumidor final va a usar de X.

---

# Parte 5: Headers repetidos: todavía más engañosos

Los headers suelen ser aún más traicioneros porque además intervienen:

- proxies
- gateways
- load balancers
- servidores web
- librerías HTTP
- normalización de cabeceras
- combinaciones separadas por coma
- convenciones heredadas

### Idea importante

Un mismo header puede no llegar a la app exactamente igual que salió del cliente.
Y aun si llega repetido, no todas las capas decidirán igual cómo interpretarlo.

### Regla sana

Cada vez que un header tenga impacto en seguridad, no asumas que “leerlo” es trivial si puede venir más de una vez o ser reescrito en el camino.

### Idea útil

Las cabeceras no viajan solo entre cliente y controller.
Viajan por varias capas con reglas distintas.

---

# Parte 6: Qué tipos de decisiones suelen romperse aquí

Esta familia de problemas se vuelve importante cuando el valor duplicado influye cosas como:

- routing
- redirects
- identidad del cliente
- tenant efectivo
- autorización
- elección de recurso
- políticas por host
- source IP percibida
- callbacks
- URLs de destino
- firma de una request
- controles de negocio sobre parámetros sensibles

### Idea importante

No todos los campos repetidos son igual de graves.
El riesgo sube mucho cuando el nombre repetido sostiene una decisión sensible.

### Regla sana

Cada vez que un header o parámetro duplicado pueda cambiar quién, qué, dónde o hacia qué se ejecuta algo, ya conviene revisarlo como superficie de seguridad real.

---

# Parte 7: El proxy puede validar una cosa y la app consumir otra

Esto conecta muy fuerte con el tema anterior.

Un proxy o gateway puede:

- filtrar ciertos valores
- loguear uno
- normalizar uno
- combinar duplicados
- decidir routing por uno

y luego la aplicación puede:

- volver a parsear
- elegir otra instancia
- usar otra convención
- interpretar la lista de otro modo

### Idea útil

Ahí el clásico “uno valida, otro usa” aparece entre componentes, no solo dentro del mismo proceso.

### Regla sana

Cada vez que el perímetro tome decisiones sobre headers o parámetros, preguntate si el backend final está viendo exactamente la misma resolución de esos campos.

### Idea importante

La frontera de seguridad puede romperse aunque ninguna capa haga algo “absurdo” por separado.

---

# Parte 8: La app también puede pelearse consigo misma

No hace falta un proxy para que esto pase.
Puede ocurrir dentro de la misma app si:

- un filtro lee `request.getParameter(...)`
- un interceptor usa otra API
- el controlador recibe una lista
- una librería de binding elige otra cosa
- un validador custom toma el primero
- la lógica de negocio termina usando el último o un array completo

### Idea útil

El parsing diferencial no siempre es entre infraestructura y backend.
También puede estar entre distintas capas del propio framework o del propio código.

### Regla sana

No asumas que “como todo está en Spring” todas las APIs del stack resolverán la ambigüedad igual o que tu propio código lo hará de forma consistente.

---

# Parte 9: Duplicados y firmas también chocan

Esto es especialmente delicado.

Si una capa:

- firma una representación
- canonicaliza parámetros
- ordena campos
- toma el primer valor

y otra capa:

- parsea distinto
- toma el último
- o acepta combinaciones diferentes

entonces el sistema puede quedar firmando una versión del input y ejecutando otra.

### Idea importante

La firma no protege una semántica que la siguiente capa ya reinterpretó.

### Regla sana

Cada vez que haya HMAC, firma o canonicalización sobre requests con campos potencialmente repetidos, preguntate si el verificador y el ejecutor comparten exactamente la misma política de resolución.

---

# Parte 10: Qué patrones merecen sospecha inmediata

Conviene sospechar especialmente cuando veas cosas como:

- `getParameter()` en una capa y arrays/lists en otra
- headers de seguridad o routing leídos sin una política clara de repetidos
- validadores custom de query params sensibles
- lógica de redirect basada en parámetros tomados “tal cual”
- authz o tenant resolution apoyada en un header repetible
- firmas sobre requests o query strings con posible duplicación
- proxies que colapsan o combinan valores antes de llegar al backend

### Idea útil

No hace falta un caso exótico para detectar la clase de problema.
Basta con ver que varias capas tocan el mismo nombre de input y no está claro cuál instancia consideran la verdadera.

### Regla sana

Cada vez que un nombre pueda aparecer más de una vez, exigí una política explícita y consistente de resolución.

---

# Parte 11: Qué preguntas conviene hacer en una review

Cuando revises parámetros duplicados, headers repetidos y el patrón “uno valida, otro usa”, conviene preguntar:

- ¿este input puede venir repetido?
- ¿qué hace el proxy con los repetidos?
- ¿qué hace el framework?
- ¿qué hace el código custom?
- ¿quién toma el primero?
- ¿quién toma el último?
- ¿quién recibe todos?
- ¿qué capa decide algo sensible con ese valor?
- ¿qué capa lo consume finalmente?
- ¿están mirando exactamente la misma instancia o resolución?

### Idea importante

La review buena no termina en:
- “leemos el parámetro/header”
Sigue hasta:
- “¿qué versión concreta de ese valor está viendo cada capa?”

---

# Parte 12: Qué revisar en una app Spring

En una app Spring, conviene sospechar especialmente cuando veas:

- parámetros de control de flujo como `next`, `redirect`, `target`, `returnTo`
- headers usados para tenant, IP cliente, host efectivo o policy
- filtros de seguridad que leen request params o cabeceras antes del controller
- binding automático mezclado con validación manual
- decisiones de authz o routing basadas en nombres que podrían repetirse
- HMAC o firmas sobre query strings
- integraciones donde gateway, proxy y backend tocan el mismo header

### Idea útil

Si un campo sensible puede repetirse y más de una capa lo interpreta, ya hay suficiente superficie como para revisar parsing diferencial real.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- política explícita sobre repetidos
- rechazo claro o manejo consistente de duplicados sensibles
- menor distancia entre la capa que valida y la que usa
- menos transformaciones implícitas entre proxy, framework y negocio
- equipos que saben exactamente qué instancia o resolución de un nombre cuenta de verdad

### Idea importante

La madurez aquí se nota cuando el sistema no deja que la ambigüedad de repetidos decida en silencio la semántica del flujo.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- nadie sabe si el framework toma primero, último o todos
- validadores y consumidores usan APIs distintas sobre el mismo campo
- el proxy combina valores de una forma y la app de otra
- se asume que un nombre implica un solo valor
- hay decisiones sensibles sobre campos repetibles sin política explícita
- el equipo trata esto como edge case y no como ambigüedad estructural

### Regla sana

Si el sistema no puede responder con claridad qué pasa cuando un parámetro o header viene dos veces, probablemente ya tiene suficiente ambigüedad como para que una capa valide una cosa y otra use otra.

---

## Checklist práctica

Para revisar parámetros duplicados, headers repetidos y “uno valida, otro usa”, preguntate:

- ¿este nombre puede aparecer más de una vez?
- ¿qué hacen proxy, framework y app con eso?
- ¿quién toma primero, último o todos?
- ¿qué capa valida?
- ¿qué capa usa?
- ¿coinciden en la misma resolución?
- ¿qué decisión sensible podría romperse si no coinciden?

---

## Mini ejercicio de reflexión

Tomá un input real de tu app Spring y respondé:

1. ¿Puede venir repetido?
2. ¿Qué hace el proxy o gateway con ese campo?
3. ¿Qué hace Spring con ese mismo campo?
4. ¿Qué hace tu código custom?
5. ¿Qué capa toma una decisión sensible con ese valor?
6. ¿Qué capa lo consume realmente al final?
7. ¿Qué revisarías primero después de este tema?

---

## Resumen

Los parámetros duplicados, los headers repetidos y el patrón clásico “uno valida, otro usa” importan porque muchas vulnerabilidades no nacen de valores raros, sino de que distintas capas del sistema no coinciden en cuál instancia de un mismo input es la que manda y el diseño actúa como si sí coincidieran.

La gran intuición del tema es esta:

- un nombre repetido ya no tiene una semántica obvia
- primero, último o todos es una decisión de seguridad, no solo de parser
- una capa puede validar una instancia y otra ejecutar con otra
- proxy, framework y app pueden no coincidir
- y una gran parte del riesgo aparece cuando nadie definió explícitamente cuál valor es el verdadero

En resumen:

> un backend más maduro no trata parámetros duplicados y headers repetidos como rarezas molestas del protocolo o detalles de implementación del framework, sino como una superficie donde la semántica del input puede fracturarse entre capas y volver inútil una validación que, localmente, parecía correcta.  
> Entiende que la pregunta importante no es solo si el campo existe o si el nombre es el esperado, sino qué instancia concreta de ese nombre está gobernando realmente el flujo en cada componente.  
> Y justamente por eso este tema importa tanto: porque muestra una de las formas más clásicas y más reutilizables del parsing diferencial, la de sistemas donde una capa dice “ya controlé esto” y otra termina actuando sobre otra cosa, que es una de las maneras más directas de convertir una protección aparentemente razonable en una ilusión.

---

## Próximo tema

**URLs, paths y routing: cuando proxy, framework y aplicación no ven la misma ruta**
