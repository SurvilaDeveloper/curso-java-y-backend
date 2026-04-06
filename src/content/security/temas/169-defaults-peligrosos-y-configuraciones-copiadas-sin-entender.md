---
title: "Defaults peligrosos y configuraciones copiadas sin entender"
description: "Cómo reconocer defaults peligrosos y configuraciones XML copiadas sin comprender en aplicaciones Java con Spring Boot. Por qué muchos problemas de XXE nacen de factories usadas con valores por defecto o con hardening parcial copiado desde ejemplos sin revisar qué cubren realmente."
order: 169
module: "XML, parsers y procesamiento inseguro de documentos"
level: "base"
draft: false
---

# Defaults peligrosos y configuraciones copiadas sin entender

## Objetivo del tema

Entender por qué muchos problemas de **XXE** en aplicaciones Java + Spring Boot nacen de dos patrones muy comunes:

- **usar defaults sin cuestionarlos**
- **copiar configuraciones de hardening sin entender bien qué cubren y qué dejan afuera**

La idea de este tema es tocar una causa muy cotidiana de vulnerabilidades XML.

En muchos equipos, el flujo real se parece bastante a esto:

- alguien necesita parsear XML
- busca un ejemplo
- crea una factory
- copia dos o tres líneas “anti-XXE”
- el código compila
- el parser funciona
- nadie revisa mucho más
- el tema queda aparentemente cerrado

O, directamente, ni siquiera se copia una mitigación:
simplemente se usan los defaults y se asume que:

- “seguro esto ya viene razonable”
- “si fuera peligroso, la librería lo deshabilitaría sola”
- “es una API muy usada, así que no deberíamos preocuparnos tanto”
- “ya tenemos un resolver o una factory creada por la librería”

Ahí es donde empieza buena parte del problema.

En resumen:

> en XML, muchos riesgos no nacen de decisiones explícitamente inseguras,  
> sino de una mezcla de defaults heredados, configuraciones parciales, ejemplos copiados y una comprensión muy incompleta de qué capacidades del parser siguen activas en realidad.

---

## Idea clave

La idea central de este tema es esta:

> un parser XML usado “como viene” o endurecido con recetas copiadas sin criterio sigue siendo una superficie de seguridad difícil de auditar, porque el equipo no sabe con claridad qué capacidades están activas, cuáles se deshabilitaron de verdad y cuáles quedaron fuera del modelo mental.

Eso importa porque en la práctica no alcanza con:

- tener “algunas líneas de seguridad”
- ver un `setFeature(...)`
- o encontrar un snippet famoso en internet

La pregunta madura sigue siendo:

- ¿qué capacidades XML están vivas?
- ¿cuáles son necesarias?
- ¿cuáles se apagaron de verdad?
- ¿qué parte del comportamiento del parser sigue dependiendo de defaults?
- ¿qué se asumió sin comprobar?

### Idea importante

Una configuración copiada puede parecer segura.
Pero si el equipo no entiende su alcance real, el sistema sigue dependiendo de suposiciones más que de diseño consciente.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- usar `DocumentBuilderFactory`, `SAXParserFactory` o `XMLInputFactory` con defaults sin revisión
- copiar snippets de hardening sin saber qué bloquean
- asumir que una configuración “famosa” ya cubre todo XXE
- no detectar que distintos parsers o factories quedan endurecidos de forma distinta
- creer que tener una línea “anti-XXE” equivale a comprender el comportamiento del parser
- olvidar que una mitigación parcial puede seguir dejando abiertas otras capacidades

Es decir:

> el problema no es solo que existan defaults o snippets.  
> El problema es convertirlos en una caja negra: confiar en ellos sin entender si están alineados con el riesgo real del flujo.

---

## Error mental clásico

Un error muy común es este:

### “Ya tenemos la configuración segura que se usa siempre”

Eso suena bien, pero no alcanza como afirmación si nadie puede responder cosas como:

- ¿qué parser usa cada flujo?
- ¿esa configuración aplica en todos los casos?
- ¿qué cubre exactamente?
- ¿qué no cubre?
- ¿qué capacidades XML siguen activas?
- ¿qué parte depende todavía de defaults?
- ¿qué pasa en librerías de terceros?
- ¿qué pasa en un worker que crea su propia factory?

### Idea importante

Una configuración “estándar” solo protege de verdad cuando:
- se usa consistentemente
- se entiende
- y está alineada con el caso de uso real.

---

# Parte 1: El problema de los defaults

## Por qué los defaults son peligrosos en XML

Los defaults son peligrosos no porque siempre sean catastróficos, sino porque:

- cambian entre implementaciones
- cambian entre versiones
- no siempre están pensados para input no confiable
- y el equipo suele conocerlos peor de lo que cree

### Idea útil

El parser puede venir listo para parsear XML funcionalmente.
Eso no significa que venga endurecido para parsear XML **hostil** o **influido por terceros**.

### Regla sana

“Funciona” y “está endurecido para input no confiable” son dos objetivos distintos.

---

## Default funcional vs default seguro

Este contraste es muy importante.

### Default funcional
Apunta a:
- aceptar más documentos
- ser compatible
- seguir comportamientos esperados por el estándar o por integraciones viejas
- minimizar fricción de uso

### Default seguro
Apunta a:
- reducir capacidades innecesarias
- evitar resolución externa
- cortar expansión peligrosa
- endurecer el parser frente a input no confiable

### Idea importante

En muchos parsers y fábricas XML, el default histórico se acerca más a lo funcional que a lo mínimo estrictamente seguro.

---

## Por qué el ecosistema Java agrava este problema

En Java, el tema se vuelve más traicionero porque suele haber:

- muchas APIs posibles
- factories distintas
- librerías que envuelven el parseo
- defaults heredados
- versiones variadas
- ejemplos viejos circulando todavía

### Idea útil

Eso hace muy fácil que el equipo pierda una visión clara de:
- qué comportamiento viene de la API
- qué viene de la implementación real
- qué viene de la librería que está arriba
- y qué parte fue configurada explícitamente.

### Regla sana

Mientras más capas haya entre tu código y el parser real, menos conviene confiar en supuestos implícitos.

---

# Parte 2: El problema de copiar configuraciones

## El patrón típico

Aparece un hallazgo o alguien menciona XXE.
Entonces se hace algo así:

- se busca “disable xxe java”
- se encuentra un snippet
- se copian algunas líneas
- se pega en un helper o en una factory
- se asume que ya quedó

### Por qué parece razonable

Porque:
- ahorra tiempo
- suena profesional
- usa APIs reales
- y suele venir de un blog o respuesta bastante conocida

### Por qué puede fallar

Porque el equipo rara vez sabe, después de copiarlo:

- qué vulnerabilidad exacta cubre
- qué parser aplica
- qué capacidades deja vivas
- si cubre DoS además de lectura externa
- si sirve igual para DOM, SAX y StAX
- si rompe o no un caso legítimo de negocio
- si otra parte del sistema sigue usando otra factory sin ese cambio

### Idea importante

Copiar una configuración no equivale a entender la postura de seguridad del parser.

---

## Configuración “famosa” no significa configuración suficiente

Este es un punto muy importante.

Hay snippets muy repetidos que sí mejoran cosas.
Pero eso no significa automáticamente que:

- cubran todas las familias de impacto
- apliquen igual en todos los modelos de parseo
- sean suficientes para todos los flows XML
- reemplacen revisar runtime, red, filesystem y librerías de terceros

### Regla sana

Una receta conocida puede ser buen punto de partida.
Nunca debería ser el final del razonamiento.

---

# Parte 3: Qué suele pasar cuando se copia sin entender

Cuando una configuración se copia sin criterio, suelen aparecer problemas como:

- se endurece DOM pero no SAX
- se endurece una factory local pero otra librería crea la suya
- se deshabilita algo que no era el corazón del riesgo y se deja otra capacidad viva
- se cree que XXE quedó resuelto, pero solo se cubrió una dimensión
- reviewers no pueden explicar qué cubre el snippet
- nadie se anima a tocar la configuración después porque parece “mágica”

### Idea importante

El problema no es solo que la mitigación sea incompleta.
También es que el equipo pierde visibilidad sobre el comportamiento real del parser.

---

# Parte 4: Señales de que el equipo no entiende la configuración que usa

Hay algunas señales muy típicas:

- “esa parte no la toques porque es la config anti-XXE”
- “no sé exactamente qué hace, pero viene de un ejemplo bueno”
- “esto lo copiamos hace años”
- “sirve para todos los XML”
- “si está puesto, debería bastar”
- “no sé si aplica a StAX también”
- “la librería ya lo maneja”

### Idea útil

Estas frases no prueban que la config esté mal.
Pero sí prueban que el equipo no la tiene bien modelada.

### Regla sana

Si nadie puede explicarla claramente, la postura defensiva ya es más frágil de lo que parece.

---

# Parte 5: El riesgo de la cobertura parcial

Esto conecta con temas anteriores.

Una configuración copiada puede bloquear:
- cierta forma de resolución externa

pero dejar intactas otras cosas como:

- DTD innecesaria
- otra family de parser
- otras factories
- entidades o expansión no deseada
- librerías que crean internamente otro parser
- workers o jobs que procesan XML por otra vía

### Idea importante

La seguridad XML parcial puede ser peligrosa porque reduce ruido, pero también puede aumentar la falsa sensación de cierre.

### Regla sana

Entre “no hicimos nada” y “hicimos algo pero creemos que eso cubre todo” a veces la segunda opción es más traicionera.

---

# Parte 6: Defaults más snippet copiado = combinatoria confusa

Una situación muy común es esta:

- parte del comportamiento queda en defaults
- parte se cambia con flags copiadas
- parte depende de otra implementación
- parte vive en una librería de terceros
- y el equipo ya no sabe qué combinación real quedó activa

### Idea útil

No es raro que el parser “seguro” exista solo en la imaginación compartida del equipo, mientras la configuración real es una mezcla inconsistente y poco comprendida.

### Regla sana

Una postura segura debería poder describirse de forma simple.
Si requiere demasiadas suposiciones sobre defaults heredados, ya hay deuda.

---

# Parte 7: Qué vuelve sano a un hardening XML

Una postura más sana suele tener varias propiedades a la vez.

## A. Es explícita
No depende demasiado de defaults no revisados.

## B. Es comprensible
El equipo puede explicar qué se deshabilita y por qué.

## C. Es consistente
No solo una factory aislada está endurecida; el patrón aplica donde corresponde.

## D. Es proporcional al flujo
No deja capacidades vivas “por si acaso” si el caso de uso no las necesita.

## E. Es auditable
Un reviewer puede mirar el código y entender qué está pasando sin leer media doc externa.

### Idea importante

La seguridad madura no es solo tener líneas de configuración.
Es poder razonar sobre ellas.

---

# Parte 8: El valor de “menos magia, más contrato”

Este es uno de los aprendizajes más útiles del tema.

En vez de:

- confiar en defaults
- confiar en snippets
- confiar en que la librería lo resolvió
- confiar en que “esto siempre se hizo así”

conviene avanzar hacia algo más claro:

- este flujo usa este parser
- con esta factory
- con estas capacidades apagadas
- porque este caso de uso no necesita más
- y este runtime corre con este alcance

### Regla sana

Cuanto más explícito y pequeño sea el contrato del parser, menos necesitás fe en defaults o recetas copiadas.

---

# Parte 9: Defaults peligrosos no solo significan “inseguros”, también significan “desconocidos”

Esto merece remarcarse.

A veces el default no resulta catastrófico en sí.
El problema igual existe porque:

- nadie sabe bien cuál es
- nadie sabe si cambió
- nadie sabe si aplica igual en todas las implementaciones
- nadie sabe si cubre el caso del flujo actual

### Idea útil

En seguridad, lo desconocido ya es una deuda.
No hace falta que sea inmediatamente explotable para ser una mala base de diseño.

### Idea importante

Un default no auditado no es una postura segura.
Es una postura implícita.

---

# Parte 10: Copiar una config buena sigue exigiendo comprensión

Tampoco hace falta demonizar copiar ejemplos.
Muchas veces se empieza así y está bien.

El punto importante es qué pasa después.

### Camino pobre
- copiar
- pegar
- no entender
- no revisar
- no propagar correctamente
- asumir que quedó todo cubierto

### Camino sano
- copiar
- entender qué cubre
- adaptar al parser real
- revisar qué capacidad sobra en el flujo
- verificar consistencia
- documentar la intención

### Regla sana

Copiar puede ser el comienzo del hardening.
Nunca debería ser su final.

---

# Parte 11: Qué preguntas conviene hacer frente a una config XML existente

Cuando veas una configuración “anti-XXE” ya puesta, conviene preguntar:

- ¿qué parser exacto protege?
- ¿qué parser deja afuera?
- ¿qué capacidad XML deshabilita?
- ¿qué capacidad sigue activa?
- ¿qué familia de impacto cubre mejor: lectura local, SSRF, DoS?
- ¿esto depende de defaults no revisados?
- ¿hay más flows XML sin esta configuración?
- ¿el equipo entiende por qué está cada línea?

### Idea importante

Estas preguntas transforman una config heredada en una postura auditable, o exponen rápido que todavía era más fe que diseño.

---

# Parte 12: Cómo reconocer esta superficie en una codebase Spring

En una app Spring o Java, conviene sospechar de defaults peligrosos o configs copiadas cuando veas:

- factories creadas sin configuración visible
- bloques de `setFeature(...)` copiados y nadie sabe explicarlos
- distintos módulos XML con configuraciones distintas
- comentarios del tipo “esto arregla XXE”
- librerías que parsean XML sin que el equipo revise su hardening
- reviewers que validan “hay líneas de seguridad” pero no entienden qué cubren
- flows DOM, SAX y StAX endurecidos de forma inconsistente

### Idea útil

En revisión real, el olor no es solo “falta configuración”.
También es “hay configuración, pero nadie sabe si realmente alcanza”.

---

## Qué revisar en una app Spring

Cuando revises defaults peligrosos y configuraciones copiadas sin entender en una aplicación Spring, mirá especialmente:

- qué factories XML se usan
- cuáles dependen de defaults
- cuáles tienen hardening explícito
- si el hardening es consistente entre DOM, SAX y StAX
- si hay librerías de terceros que crean parsers aparte
- si el equipo sabe explicar qué cubre cada línea crítica
- si el runtime que procesa XML es acotado o demasiado rico
- qué parte del diseño sigue dependiendo más de supuestos que de decisiones explícitas

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- poco uso de defaults no revisados
- hardening explícito
- configs comprensibles
- criterios consistentes entre parsers
- menos snippets mágicos
- reviewers capaces de explicar el porqué de la configuración
- menos confianza en que “la librería seguro ya lo maneja”

### Idea importante

La madurez aquí se nota cuando la configuración deja de ser folklore del equipo y pasa a ser diseño entendido.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- defaults asumidos como seguros
- snippet copiado sin explicación
- mezcla de configs distintas entre módulos
- “no toques eso que arregla XXE”
- nadie sabe si cubre SAX o StAX
- librerías de terceros parseando XML fuera del radar
- falsa sensación de cierre basada en presencia de flags, no en comprensión del comportamiento

### Regla sana

Si el equipo no puede traducir la config XML a lenguaje claro, probablemente todavía no domina esa superficie.

---

## Checklist práctica

Cuando veas configuración XML en Java/Spring, preguntate:

- ¿esto depende de defaults?
- ¿qué parte fue configurada explícitamente?
- ¿qué parser protege?
- ¿qué capacidad XML deshabilita?
- ¿qué quedó activo?
- ¿esto fue copiado o diseñado conscientemente?
- ¿el equipo puede explicarlo?
- ¿hay otros flows XML sin el mismo hardening?
- ¿el runtime agrava el impacto si la config queda corta?

---

## Mini ejercicio de reflexión

Tomá una factory XML real de tu app Spring y respondé:

1. ¿Está usando defaults o configuración explícita?
2. ¿Qué parte del hardening fue copiada?
3. ¿Entendés qué cubre cada línea importante?
4. ¿Qué parser o flujo deja afuera?
5. ¿Hay otras factories hermanas configuradas distinto?
6. ¿Qué supuestos del equipo te generan más desconfianza?
7. ¿Qué revisarías primero para pasar de folklore a diseño explícito?

---

## Resumen

Muchos problemas de XXE nacen no de una decisión explícitamente insegura, sino de dos patrones muy comunes:

- usar defaults sin auditarlos
- copiar configuraciones sin comprender su alcance real

Eso vuelve frágil la postura de seguridad porque deja al sistema dependiendo de:

- suposiciones
- folklore del equipo
- snippets heredados
- y cobertura parcial que a veces se confunde con cierre completo

En resumen:

> un backend más maduro no trata el hardening XML como una colección de líneas copiadas ni como una confianza implícita en que los defaults del parser seguramente ya vienen razonables para input no confiable, sino como una decisión explícita sobre qué capacidades XML sobran para cada flujo y cómo desactivarlas de manera comprensible, consistente y auditable.  
> Y justamente por eso este tema importa tanto: porque ayuda a pasar de una postura basada en “creo que esto ya estaba cubierto” a una postura donde el equipo realmente sabe qué parser usa, qué dejó activo, qué quiso apagar y qué parte del riesgo seguiría viva si esa configuración famosa que alguien copió hace tiempo resultara ser más parcial o más frágil de lo que todos venían suponiendo.

---

## Próximo tema

**Cómo revisar librerías de terceros que parsean XML por vos**
