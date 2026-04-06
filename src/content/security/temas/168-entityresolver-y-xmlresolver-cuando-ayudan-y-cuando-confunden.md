---
title: "EntityResolver y XMLResolver: cuándo ayudan y cuándo confunden"
description: "Cómo pensar EntityResolver y XMLResolver frente a XXE en aplicaciones Java con Spring Boot. Cuándo ayudan a controlar resolución externa, por qué no reemplazan el hardening del parser y qué errores de diseño pueden introducir si se usan como parche parcial."
order: 168
module: "XML, parsers y procesamiento inseguro de documentos"
level: "base"
draft: false
---

# EntityResolver y XMLResolver: cuándo ayudan y cuándo confunden

## Objetivo del tema

Entender qué papel cumplen **`EntityResolver`** y **`XMLResolver`** frente a **XXE** en aplicaciones Java + Spring Boot, y por qué pueden ser útiles pero también engañosos si se los usa como sustituto de una configuración segura del parser.

La idea de este tema es seguir bajando el bloque a piezas concretas del ecosistema Java.

Ya vimos que:

- DOM, SAX y StAX no resuelven XXE por nombre
- las factories importan muchísimo
- la seguridad real depende de qué capacidades XML siguen activas
- y una parte central del problema está en si el parser puede resolver recursos externos o expandir demasiado

Ahora toca mirar dos mecanismos que muchas veces aparecen en discusiones sobre hardening:

- `EntityResolver`
- `XMLResolver`

A primera vista suenan muy prometedores.
Y en parte lo son.

Porque tocan justo una zona delicada:
- la resolución de recursos o entidades

Pero también hay una trampa cultural muy común:

- se agrega un resolver
- se ve que el caso de prueba deja de salir a buscar algo
- el equipo siente que “ya está”
- y se olvida que quizá la factory sigue permisiva, la DTD sigue activa o la superficie del parser sigue siendo más grande de lo necesario

En resumen:

> `EntityResolver` y `XMLResolver` pueden ayudar a controlar la resolución externa,  
> pero no deberían convertirse en excusa para dejar el parser demasiado abierto ni en una falsa señal de que el problema quedó resuelto solo por interceptar un punto del flujo.

---

## Idea clave

La idea central de este tema es esta:

> un resolver puede ser una pieza útil para controlar o interceptar cómo el parser resuelve ciertas referencias, pero no reemplaza el principio más fuerte del bloque: **desactivar capacidades XML que el caso de uso no necesita**.

Eso importa porque un resolver trabaja sobre una parte del comportamiento:
- qué hacer cuando el parser intenta resolver algo

Pero una postura segura más amplia sigue necesitando preguntas como:

- ¿por qué el parser llegó siquiera a ese punto?
- ¿por qué DTD o entidades seguían activas?
- ¿qué otras capacidades XML quedaron habilitadas?
- ¿el flujo realmente necesita resolver algo externo?
- ¿el runtime sigue siendo demasiado rico aunque el resolver intercepte algo?

### Idea importante

Un resolver bien usado puede ser una capa útil.
Un resolver usado como única defensa puede ser una forma elegante de parchear demasiado tarde.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- creer que un resolver sustituye el hardening del parser
- usar `EntityResolver` o `XMLResolver` sin entender qué parte del problema atacan
- confiar en que “como ahora resolvemos nosotros”, XXE ya no aplica
- agregar un resolver a una librería o parser todavía permisivo
- usar resolvers como parche aislado en vez de como parte de una postura más explícita
- no distinguir entre interceptar resolución y desactivar la capacidad innecesaria desde la raíz

Es decir:

> el problema no es usar resolvers.  
> El problema es convertirlos en una falsa señal de cierre cuando la superficie XML de fondo sigue demasiado abierta.

---

## Error mental clásico

Un error muy común es este:

### “Con un resolver propio ya quedamos cubiertos”

Eso puede ser cierto en algunos flujos muy concretos y bien entendidos.
Pero como afirmación general es demasiado optimista.

Porque todavía quedan preguntas como:

- ¿DTD sigue activa?
- ¿el parser sigue aceptando más de lo necesario?
- ¿hay otras rutas de comportamiento que el resolver no cubre?
- ¿el flujo realmente necesitaba llegar a resolución externa?
- ¿hay otras factories o librerías hermanas sin ese resolver?
- ¿el runtime sigue siendo demasiado privilegiado?

### Idea importante

Interceptar un punto de resolución no siempre equivale a reducir realmente el contrato del parser.

---

# Parte 1: Qué es `EntityResolver`, a nivel intuitivo

## La intuición útil

`EntityResolver` aparece típicamente en el mundo SAX y DOM.

La forma mental más simple de pensarlo es esta:

> es un mecanismo mediante el cual la aplicación puede influir o decidir qué hacer cuando el parser quiere resolver entidades o recursos asociados durante el parseo XML.

Eso puede significar cosas como:

- devolver otra cosa
- bloquear
- reemplazar
- redirigir
- o resolver de forma controlada lo que el parser estaba por consultar

### Idea importante

`EntityResolver` mete a la aplicación en un punto del flujo donde, de otro modo, el parser quizá resolvería algo según sus reglas por defecto.

---

# Parte 2: Qué es `XMLResolver`, a nivel intuitivo

## La intuición útil

`XMLResolver` juega un rol parecido, pero en el mundo más asociado a StAX.

La idea conceptual es casi la misma:

> es un punto donde la aplicación puede participar en cómo se resuelve un recurso o referencia que el parser intenta consultar durante el procesamiento XML.

### Idea importante

Aunque cambien las APIs, el patrón mental es similar:
- el parser quiere resolver algo
- el resolver permite interceptar o decidir mejor qué hacer con eso

### Regla sana

No hace falta memorizar exactamente qué interfaz pertenece a qué API para este tema.
Lo importante es entender el rol: **intermediar resolución**.

---

# Parte 3: Por qué estos mecanismos pueden ayudar

## Ayudan porque sacan control de los defaults

Uno de los problemas más típicos en XML es dejar que el parser resuelva cosas “como venga”.
Un resolver puede ayudar justamente a quitar esa opacidad.

Por ejemplo, conceptualmente puede servir para:

- negar resolución
- devolver una respuesta vacía o controlada
- mapear recursos permitidos
- evitar que el parser salga al entorno libremente
- hacer explícito algo que antes quedaba delegado a defaults

### Idea útil

Un resolver puede ser una forma de decir:
- “si el parser intenta resolver algo, no quiero dejar esa decisión librada a un comportamiento implícito”.

### Idea importante

En ese sentido, sí puede ser una mejora real respecto de dejar todo a defaults.

---

## También ayudan para volver visible una parte del comportamiento

A veces el mayor valor inicial de un resolver es conceptual:
ayuda a que el equipo vea que el parser estaba intentando resolver algo.

Eso ya es valioso, porque rompe una ilusión muy frecuente:

- “solo parseamos XML”
- cuando en realidad
- el parser estaba tratando de consultar recursos adicionales

### Regla sana

Todo mecanismo que vuelva explícita una capacidad oculta del parser ya mejora la auditabilidad del sistema.

---

# Parte 4: Por qué también pueden confundir

## La gran trampa

Justamente porque el resolver toca un punto muy sensible, es fácil que el equipo piense:

- “perfecto, ahí estaba el problema”
- “interceptamos eso y listo”
- “XXE ya quedó controlado”

Y ese salto puede ser peligroso.

Porque un resolver trabaja en una capa concreta del problema, pero no necesariamente cambia:

- la necesidad real de DTD
- la amplitud del parser
- otros defaults activos
- la complejidad general del flujo
- el runtime donde corre
- ni la existencia de otras rutas XML hermanas en la app

### Idea importante

El resolver puede mejorar una parte de la historia sin convertir automáticamente al sistema en un diseño XML pequeño, predecible y bien endurecido.

---

# Parte 5: Resolver no es lo mismo que deshabilitar

Esta es una distinción muy importante.

## Deshabilitar una capacidad
significa:
- el parser ya no debería intentar cierto comportamiento porque esa capacidad dejó de estar activa.

## Resolver esa capacidad
significa:
- el parser llega al punto donde intenta resolver
- y ahí otro componente le dice qué hacer.

### Idea útil

En muchos casos, si la capacidad no hace falta, suele ser más fuerte apagarla que dejarla viva pero interceptada.

### Regla sana

Entre:
- “permito esta capacidad pero la superviso”
y
- “esta capacidad directamente no existe para este flujo”  
la segunda postura suele ser más simple de defender cuando el caso de uso no la necesita.

---

# Parte 6: Cuándo un resolver sí puede tener buen lugar

Tampoco se trata de demonizar estas interfaces.
Pueden tener buen lugar cuando:

- querés controlar explícitamente resolución en un flujo legítimo
- tenés casos concretos y bien entendidos donde cierto recurso debe mapearse de forma controlada
- necesitás compatibilidad concreta sin dejar al parser resolver libremente
- querés volver más predecible algo que de otro modo usaría defaults poco claros

### Idea importante

El uso sano del resolver suele aparecer cuando forma parte de un diseño explícito y estrecho, no cuando intenta tapar una superficie XML excesiva.

### Regla sana

Resolver controlado puede ser razonable.
Resolver libre o resolver como sustituto de hardening casi nunca lo es.

---

# Parte 7: Cuándo conviene desconfiar del enfoque “solo resolver”

Conviene sospechar cuando el sistema hace algo así:

- mantiene DTD habilitada sin cuestionarla
- mantiene entidades externas habilitadas
- agrega un resolver “por si acaso”
- y declara resuelto el tema

### Por qué esto es flojo

Porque el problema de fondo —la cantidad de capacidad XML activa— puede seguir siendo demasiado grande para el caso de uso.

### Idea útil

El resolver puede terminar actuando como parche elegante en un flujo que debería haber sido mucho más modesto desde la factory.

---

# Parte 8: Resolver también puede esconder complejidad

Otro riesgo cultural de estas interfaces es que, si se usan sin mucha claridad, agregan otra capa que pocos entienden bien.

Entonces el sistema queda así:

- factory con cierta configuración
- resolver con lógica custom
- librería por encima
- y reviewers que ya no saben con claridad qué se habilita, qué se bloquea y dónde

### Regla sana

Si el resolver agrega más opacidad de la que quita, ya merece revisión.

### Idea importante

Una defensa buena debería hacer más entendible el flujo, no convertirlo en una caja más difícil de auditar.

---

# Parte 9: La pregunta más importante no es “¿hay resolver?”

Una review superficial podría preguntar:
- “¿hay `EntityResolver` o `XMLResolver`?”

Pero esa no es la pregunta madura.

La pregunta útil es:

- ¿por qué este flujo todavía necesitaba llegar a resolver algo?
- ¿esa capacidad era realmente necesaria?
- ¿el resolver está endureciendo un caso legítimo o maquillando una superficie demasiado abierta?
- ¿qué pasaría si desactiváramos directamente lo que el parser no necesita hacer?

### Idea importante

La presencia de un resolver no demuestra seguridad.
Solo indica que hay una capa de control adicional cuya calidad todavía hay que evaluar.

---

# Parte 10: El runtime sigue importando igual

Como en todos los temas del bloque, nada de esto se entiende del todo sin mirar el contexto de ejecución.

Aunque tengas un resolver, sigue importando:

- qué proceso parsea
- qué filesystem ve
- qué red ve
- qué identidad tiene
- qué librerías llaman a ese parser
- qué pasa si el resolver falla o no cubre todos los flujos

### Regla sana

Un resolver útil en un proceso acotado es una cosa.
Un resolver parcial en un worker con acceso a filesystem sensible y red interna es otra muy distinta.

---

# Parte 11: Cómo pensar `EntityResolver` y `XMLResolver` sin magia

La forma más sana de pensarlos es esta:

> son ganchos o puntos de intervención sobre la resolución de recursos o entidades, no una garantía automática de que la superficie XML ya quedó bien diseñada.

Eso los pone en el lugar correcto:

- no son inútiles
- no son mágicos
- no reemplazan la factory
- no reemplazan el hardening
- no reemplazan analizar el runtime
- pero pueden ser parte de una postura más explícita y menos dependiente de defaults

### Idea importante

Cuando el equipo entiende esto, deja de verlos como talismanes y empieza a evaluarlos como una capa más del diseño.

---

# Parte 12: Cómo reconocer un uso sano vs uno engañoso

## Uso más sano
- parser ya endurecido
- resolver agregado para un caso legítimo y específico
- comportamiento claro y auditable
- poca dependencia en magia o defaults
- runtime razonablemente contenido

## Uso más engañoso
- parser todavía permisivo
- DTD y entidades siguen abiertas
- resolver agregado como parche rápido
- reviewers no entienden qué cubre
- el hallazgo se cierra solo porque “ya hay resolver”

### Regla sana

Si el resolver es la primera y casi única respuesta del equipo a XXE, conviene volver a mirar el diseño desde más abajo.

---

# Parte 13: Qué preguntas conviene hacer sobre `EntityResolver`

Cuando veas `EntityResolver`, conviene preguntar:

- ¿por qué hace falta?
- ¿qué está resolviendo exactamente?
- ¿qué pasaría si el parser no permitiera llegar a esa resolución?
- ¿se usa como capa adicional o como sustituto del hardening?
- ¿qué flujos DOM/SAX quedan fuera de su cobertura?
- ¿qué runtime ejecuta este parseo?

### Idea importante

Un `EntityResolver` bien puesto debería poder explicarse en términos simples.
Si nadie puede hacerlo, ya hay una señal de ruido.

---

# Parte 14: Qué preguntas conviene hacer sobre `XMLResolver`

Cuando veas `XMLResolver`, conviene preguntar:

- ¿qué intenta resolver el parser en este flujo StAX?
- ¿esa resolución es realmente necesaria?
- ¿qué políticas tiene el resolver?
- ¿qué otras capacidades XML siguen activas?
- ¿qué ocurriría si la factory fuera más estricta?
- ¿el resolver está ayudando a un diseño acotado o sosteniendo una superficie demasiado abierta?

### Regla sana

Con StAX, el resolver no debería dar falsa sensación de control total sobre el parseo si la factory todavía deja demasiadas libertades.

---

# Parte 15: Cómo reconocer esta superficie en una codebase Spring

En una app Spring o Java, conviene sospechar especialmente cuando veas:

- `setEntityResolver(...)`
- factories XML con resolvers custom pero sin hardening claro
- `XMLResolver` agregado en flujos StAX
- comentarios del estilo “esto evita XXE”
- librerías de terceros que usan resolvers y el equipo no sabe si además endurecen la factory
- reviewers que celebran la presencia del resolver sin revisar qué otras capacidades siguen activas

### Idea útil

En revisión real, el resolver puede ser una muy buena pista de que el equipo detectó el problema… o de que lo está resolviendo solo parcialmente.

---

## Qué revisar en una app Spring

Cuando revises `EntityResolver` y `XMLResolver` en una aplicación Spring, mirá especialmente:

- por qué están presentes
- qué factories los acompañan
- si el parser ya está endurecido desde su configuración
- qué capacidades XML siguen activas
- si el resolver cubre un caso puntual o se usa como escudo genérico
- qué proceso ejecuta el parseo
- qué red o filesystem ve ese proceso
- si la lógica del resolver es auditable o demasiado opaca

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- parser endurecido desde la factory
- resolver solo donde agrega valor claro
- comportamiento explícito y pequeño
- poca dependencia en defaults
- poca magia escondida
- reviewers que entienden qué capa resuelve qué parte del problema

### Idea importante

La madurez acá se nota cuando el resolver aparece como complemento razonado, no como talismán.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- “ya pusimos un resolver, así que está bien”
- parser todavía permisivo
- DTD o entidades externas activas sin necesidad
- resolver difícil de explicar
- coverage parcial pero sensación de cierre total
- capas XML más opacas después del cambio
- nadie sabe qué quedaría expuesto si el resolver fallara o no aplicara

### Regla sana

Si la seguridad descansa demasiado en un resolver y demasiado poco en el diseño del parser, probablemente el equilibrio está corrido.

---

## Checklist práctica

Cuando veas `EntityResolver` o `XMLResolver`, preguntate:

- ¿qué capacidad XML sigue activa para que el parser necesite llegar a resolver algo?
- ¿esa capacidad hace falta?
- ¿el resolver complementa o reemplaza hardening?
- ¿la factory sigue demasiado abierta?
- ¿qué runtime ejecuta esto?
- ¿la lógica del resolver es clara y auditable?
- ¿qué pasaría si mañana otro flujo hermano no usara ese resolver?

---

## Mini ejercicio de reflexión

Tomá un flujo XML de tu app Spring o de una librería que uses y respondé:

1. ¿Hay `EntityResolver` o `XMLResolver`?
2. ¿Por qué está ahí?
3. ¿Qué parte del problema intenta cubrir?
4. ¿La factory quedó endurecida además del resolver?
5. ¿Ese resolver simplifica o complica la comprensión del flujo?
6. ¿Qué runtime ejecuta ese parseo?
7. ¿Qué revisarías primero para saber si el uso es sano o engañoso?

---

## Resumen

`EntityResolver` y `XMLResolver` pueden ser útiles porque permiten controlar o interceptar la resolución de recursos y entidades durante el parseo XML.

Pero su valor real depende mucho de cómo se usen.

Pueden ayudar cuando:

- forman parte de un diseño explícito
- complementan una factory ya endurecida
- controlan un caso legítimo y pequeño

Pueden confundir cuando:

- se usan como sustituto de desactivar capacidades que sobran
- el parser sigue permisivo
- agregan opacidad
- o se presentan como “la solución” sin revisar el resto de la superficie XML

En resumen:

> un backend más maduro no trata `EntityResolver` y `XMLResolver` como amuletos anti-XXE ni como una prueba automática de que el flujo XML ya quedó bien defendido, sino como herramientas concretas de intervención sobre la resolución que solo tienen sentido dentro de una postura más amplia de hardening del parser.  
> Entiende que lo más fuerte sigue siendo reducir capacidades innecesarias desde la raíz y que, si un resolver aparece, debería hacerlo para controlar de forma explícita un caso estrecho y entendible, no para sostener silenciosamente una superficie XML que sigue siendo más poderosa, más opaca o más permisiva de lo que el flujo realmente necesita.

---

## Próximo tema

**Defaults peligrosos y configuraciones copiadas sin entender**
