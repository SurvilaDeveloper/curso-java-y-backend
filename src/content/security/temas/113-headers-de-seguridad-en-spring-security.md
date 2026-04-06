---
title: "Headers de seguridad en Spring Security"
description: "Cómo pensar y configurar headers de seguridad en Spring Security dentro de una aplicación Java con Spring Boot. Qué aporta el framework, qué límites tienen los defaults y por qué conviene tratar estos headers como parte de la postura de seguridad de la app y no como una receta copiada."
order: 113
module: "HTTP, headers y superficie del navegador"
level: "base"
draft: false
---

# Headers de seguridad en Spring Security

## Objetivo del tema

Entender cómo pensar los **headers de seguridad en Spring Security** dentro de una aplicación Java + Spring Boot.

La idea de este tema es cerrar el bloque de headers con una pregunta muy práctica:

> cuando tu app ya usa Spring Security, ¿cómo deberías mirar la configuración de security headers sin caer ni en el “dejemos los defaults y listo” ni en el “copiemos una receta cualquiera de internet”?

Esto importa porque, en muchas apps Spring, los headers de seguridad aparecen de una de estas formas:

- vienen por defaults del framework
- se tocan un poco sin mucha claridad
- se desactivan porque “rompían algo”
- se copian de otra app
- o se delegan al proxy sin saber bien qué quedó a cargo de quién

Y ninguna de esas opciones, por sí sola, garantiza que la política final tenga sentido para tu superficie real.

En resumen:

> Spring Security puede ayudarte mucho con headers de seguridad.  
> Pero sigue siendo tu responsabilidad entender qué está saliendo, por qué sale y si realmente coincide con el tipo de app que estás exponiendo.

---

## Idea clave

Spring Security no es solo autenticación y autorización.
También puede intervenir en la respuesta HTTP agregando o ayudando a configurar ciertos headers que endurecen la superficie del lado del navegador.

Eso es muy útil porque te permite integrar en la propia capa de seguridad cosas relacionadas con:

- transporte
- framing
- interpretación de contenido
- referrer
- CSP
- permisos del navegador
- y otras políticas de respuesta web

La idea central es esta:

> el framework puede facilitar mucho la implementación,  
> pero no reemplaza el criterio sobre qué política corresponde a tu app concreta.

Es decir:

- el framework te da mecanismos
- pero el modelo de riesgo y la decisión siguen siendo tuyos

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- asumir que los defaults de Spring Security siempre son suficientes
- no saber qué headers salen realmente hoy
- desactivar headers porque un caso puntual se rompió, sin entender la deuda que eso deja
- copiar una configuración de otro proyecto con superficie distinta
- mezclar decisiones de app, proxy e infraestructura sin claridad
- pensar que “como está en la config de seguridad, ya está bien”
- no adaptar la política al tipo de contenido que realmente sirve la app
- usar Spring Security como envoltorio mecánico y no como lugar donde la política debería ser explícita

Es decir:

> el problema no es usar Spring Security para esto.  
> El problema es tratar la configuración de headers como algo automático, estático o cosmético.

---

## Error mental clásico

Un error muy común es este:

### “Spring Security ya maneja eso por mí”

Eso es parcialmente cierto y parcialmente engañoso.

Sí, el framework puede agregar defaults útiles o permitir una configuración relativamente cómoda.
Pero todavía quedan preguntas importantes como:

- ¿esos headers siguen siendo los correctos para esta app?
- ¿qué parte está quedando a cargo del proxy y cuál de Spring?
- ¿qué respuestas concretas llevan esos headers?
- ¿la app sirve solo API o también HTML, paneles y admin?
- ¿hay una CSP real o solo defaults mínimos?
- ¿alguien desactivó algo sin revisar impacto?

### Idea importante

Delegar la mecánica al framework no te libera de entender la política.

---

## Framework no es estrategia

Este punto conviene decirlo con fuerza.

Spring Security puede ayudarte a poner headers.
Pero poner headers no es lo mismo que tener una estrategia de endurecimiento web bien pensada.

### Porque una estrategia real implica decidir

- qué superficie estoy protegiendo
- qué headers importan más aquí
- cuáles deberían estar activos
- cuáles necesitan valores específicos
- qué excepciones son legítimas
- qué cosas debería seguir resolviendo en proxy o CDN
- qué cambios implican deuda y no simple ajuste

### Idea útil

El framework da herramientas.
La estrategia surge del tipo de app, de sus clientes y de su superficie web.

---

## Defaults útiles, pero no sagrados

Una de las grandes ventajas de Spring Security es que no arranca desde cero.
Suele traer o facilitar ciertas defensas razonables.

Eso está bien.
Y muchas veces es mucho mejor que no tener nada.

Pero tampoco conviene caer en dos extremos:

### Extremo 1
- “dejemos todo como viene y no pensemos más”

### Extremo 2
- “saquemos los defaults porque no entendemos bien qué hacen”

La postura sana es otra:

> partir de una base razonable, entender qué protege cada header y ajustar según la superficie real.

---

## No todas las apps Spring necesitan exactamente la misma política

Esto es central.

No es lo mismo una app Spring que:

- sirve solo JSON
- sirve HTML y login tradicional
- expone un backoffice
- mezcla SPA y recursos estáticos
- entrega archivos descargables
- usa iframes o widgets
- tiene integraciones fuertes con terceros
- vive detrás de un gateway que ya agrega headers

### Idea importante

La configuración de headers en Spring Security debería responder al tipo de app que tenés delante.
No a una plantilla genérica universal.

---

## API pura vs app web con navegador

Esta distinción ayuda muchísimo cuando configurás headers en Spring Security.

### En una API casi pura
algunos headers siguen siendo una mejora razonable, pero otros tienen menos protagonismo práctico.

### En una app que sirve HTML, paneles o login
la conversación gana mucho más peso porque hay más superficie de navegador, más contenido activo y más interacción visual.

### Regla sana

Antes de configurar, preguntate:

- ¿qué tipo de cliente consume esto?
- ¿hay HTML?
- ¿hay sesión?
- ¿hay panel admin?
- ¿hay contenido embebible?
- ¿hay archivos servidos al navegador?

Esa respuesta cambia bastante qué headers deberían importarte más.

---

## La política de headers también depende del contenido servido

Spring Security puede aplicar headers a respuestas de la app.
Pero conviene pensar qué tipo de contenido estás sirviendo.

No es lo mismo:

- JSON
- HTML
- pantallas de login
- admin
- recursos estáticos
- archivos descargables
- errores renderizados
- respuestas servidas detrás de otro componente

### Idea útil

Cuanto más heterogénea es la superficie, menos sentido tiene pensar los headers como una receta totalmente ciega y uniforme.

---

## Qué suele entrar en esta conversación dentro de Spring Security

En la práctica, este bloque suele tocar temas como:

- HSTS
- X-Content-Type-Options
- X-Frame-Options
- Referrer-Policy
- Content-Security-Policy
- Permissions-Policy

No hace falta repetir toda la teoría de cada uno acá.
Lo importante es entender cómo cambia la conversación cuando ya estás en la capa de configuración de seguridad del framework.

### La pregunta pasa a ser

- ¿qué deja activo Spring?
- ¿qué tengo que explicitar?
- ¿qué debería reforzar?
- ¿qué estoy desactivando y por qué?
- ¿qué se está poniendo en otra capa y cómo lo verifico?

---

## Spring Security como punto de convergencia

Una ventaja real del framework es que te permite concentrar varias decisiones de seguridad HTTP en un lugar relativamente visible y coherente.

Eso puede ser muy sano porque evita cosas como:

- headers dispersos por filtros ad hoc
- configuraciones parciales metidas en controladores
- decisiones duplicadas entre componentes
- políticas difíciles de rastrear

### Idea importante

Usar Spring Security para headers puede darte mejor orden y trazabilidad.
Pero solo si la configuración sigue siendo entendible y deliberada.

---

## Cuidado con mezclar app y proxy sin saber qué quedó dónde

Este es uno de los problemas más comunes en sistemas reales.

A veces:

- Spring agrega algunos headers
- el reverse proxy agrega otros
- el ingress pisa valores
- el CDN mete política propia
- alguien desactiva algo “porque ya lo pone nginx”
- otro equipo cambia el proxy y rompe consistencia

### Resultado

Nadie sabe bien:

- qué respuesta final ve el navegador
- qué capa manda qué
- qué política está activa de verdad
- dónde tocar cuando algo se rompe

### Regla sana

Si configurás headers en Spring Security, conviene tener claro:

- qué de eso vive en la app
- qué vive en infraestructura
- y cuál es la fuente de verdad para cada política

---

## Desactivar un header no es un simple toggle inocente

Otra trampa frecuente es esta:

- una integración falla
- un iframe deja de funcionar
- un recurso no carga
- un scanner molesta
- entonces alguien desactiva un header en Spring Security para “resolver rápido”

### Problema

Eso puede convertir una decisión puntual en una superficie más abierta de lo necesario.
Y muchas veces se hace sin dejar documentado:

- qué problema había
- qué riesgo se aceptó
- qué excepción real necesitaba la app
- si había una alternativa menos amplia

### Idea importante

Cada vez que desactivás o relajás un header, no solo “hacés que funcione”.
También estás cediendo parte del endurecimiento del navegador.

---

## Spring Security no corrige diseño web débil

Igual que con los headers mismos, conviene recordar esto:

aunque configures bien la capa de headers en Spring Security, la app puede seguir estando mal si:

- tiene XSS
- usa muchos scripts inline
- depende de demasiados terceros
- expone Actuator de más
- sirve archivos de forma insegura
- mezcla paneles sensibles con políticas pobres de sesión
- tiene rutas o templates débiles

### Regla sana

La configuración de headers en Spring Security suma mucho como capa de hardening.
No reemplaza el resto del diseño seguro.

---

## Los defaults pueden quedarse cortos para CSP

Este punto merece atención especial.

Spring Security puede ayudarte con varios headers más clásicos de forma cómoda.
Pero cuando entrás en temas como:

- Content-Security-Policy
- políticas más finas de recursos
- permisos del navegador
- configuraciones específicas por superficie

muchas veces ya no alcanza con confiar en lo que “viene listo”.

### Idea importante

Ahí es donde el equipo tiene que entender mucho mejor:

- qué contenido sirve la app
- qué recursos necesita
- qué política quiere realmente
- y no limitarse a activar un checkbox mental.

---

## Qué preguntas conviene hacerse antes de tocar la configuración

Antes de modificar headers en Spring Security, suele ayudar mucho preguntarse:

- ¿mi app sirve HTML o casi solo JSON?
- ¿qué headers están saliendo hoy realmente?
- ¿qué parte los agrega: app o infraestructura?
- ¿qué superficies más sensibles tengo?
- ¿qué comportamiento del navegador quiero reducir?
- ¿qué header estoy tocando y qué riesgo concreto intenta bajar?
- ¿qué dependencia del frontend o del producto se podría revelar si lo endurezo?
- ¿lo que voy a desactivar es realmente innecesario o solo incómodo?

### Idea útil

Preguntar esto antes evita caer en configuración mecánica.

---

## Seguridad observable también importa

No alcanza con tener la configuración escrita.
Conviene verificar:

- qué headers salen realmente en respuestas relevantes
- si cambian por entorno
- si los pisa otra capa
- si ciertas rutas quedaron sin política
- si el navegador ve lo que el equipo cree que está enviando

### Idea importante

En seguridad HTTP, la configuración que importa es la que ve el cliente final, no la que “parece” existir en el código.

---

## Apps con múltiples cadenas o superficies

En aplicaciones Spring más complejas, puede haber:

- rutas públicas
- rutas admin
- paneles
- APIs
- recursos estáticos
- docs internas
- diferentes security filter chains

Eso vuelve todavía más importante revisar si los headers están alineados con cada superficie.

### Porque si no
- ciertas zonas quedan con endurecimiento insuficiente
- otras quedan con políticas que rompen casos legítimos
- y se pierde coherencia entre lo que la app expone y cómo se protege del lado del navegador

### Regla sana

No siempre alcanza con pensar “un solo bloque de headers para todo” si la superficie es muy distinta según la zona.

---

## Spring Security ayuda, pero también puede esconder pereza mental

Esto pasa a veces cuando el equipo ve que la configuración es cómoda y entonces concluye:

- “ya estamos cubiertos”
- “ya activamos headers”
- “eso queda del lado del framework”

### Problema

La ergonomía del framework puede ocultar que nadie revisó de verdad:

- si la política es razonable
- si los defaults alcanzan
- si ciertas áreas merecen más dureza
- si otra capa pisa la configuración
- si algún header importante ni siquiera fue pensado

### Idea importante

Cuanto más cómoda es una abstracción, más fácil es usarla sin criterio.
Y ahí es donde conviene frenar y entender qué está pasando realmente.

---

## Qué conviene revisar en una app Spring

Cuando revises headers de seguridad en Spring Security, mirá especialmente:

- qué tipo de app es: API, HTML, admin, SPA, híbrida
- qué headers están activos hoy
- cuáles son defaults y cuáles están explícitamente configurados
- qué capa agrega cada uno
- si proxy o gateway pisan valores
- qué superficies más sensibles tiene la app
- si existe una CSP real o solo headers básicos
- qué fue desactivado y por qué
- si las políticas actuales reflejan el producto real o solo una receta heredada
- qué respuestas críticas están quedando sin el endurecimiento esperado

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- configuración comprensible y explícita
- defaults aprovechados, pero no idolatrados
- mejor alineación entre tipo de app y tipo de headers
- claridad sobre qué pone Spring y qué pone infraestructura
- pocas desactivaciones y bien justificadas
- verificación real de lo que recibe el navegador
- mayor conciencia de que los headers forman parte del contrato de seguridad de la respuesta

---

## Señales de ruido

Estas señales merecen revisión rápida:

- nadie sabe qué headers salen hoy realmente
- “Spring ya lo hace” como respuesta suficiente
- headers desactivados sin justificación clara
- política copiada de otra app muy distinta
- app y proxy duplicando o contradiciendo configuraciones
- CSP ausente o tratada como tema aparte sin dueño claro
- asumir que los defaults del framework equivalen a una estrategia completa
- no distinguir entre una API JSON y un backoffice HTML a la hora de endurecer

---

## Checklist práctico

Cuando revises headers de seguridad en Spring Security, preguntate:

- ¿qué tipo de superficie expone mi app?
- ¿qué headers están saliendo hoy de verdad?
- ¿cuáles vienen por default y cuáles configuré explícitamente?
- ¿qué capa del stack los está agregando?
- ¿hay incoherencias entre app, proxy y navegador final?
- ¿qué header fue desactivado y por qué?
- ¿la política actual sirve al producto real o solo hereda una receta?
- ¿qué superficie sensible sigue débil aunque “usemos Spring Security”?
- ¿qué cambio haría primero para pasar de defaults implícitos a política más consciente?
- ¿qué parte del equipo entiende realmente esta configuración y no solo la copia?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Qué headers de seguridad salen hoy realmente?
2. ¿Cuáles los pone Spring Security y cuáles otra capa?
3. ¿Tu app sirve solo API o también HTML, login, paneles o admin?
4. ¿Qué header te parece más importante revisar primero según esa superficie?
5. ¿Qué configuración desactivarías menos a la ligera porque ahora entendés mejor su impacto?
6. ¿Qué parte de tu stack podría estar pisando o contradiciendo lo que configuraste?
7. ¿Qué cambio harías primero para que la política deje de ser “lo que vino por default” y pase a ser una decisión consciente?

---

## Resumen

Spring Security puede ser un lugar excelente para centralizar y configurar headers de seguridad HTTP.
Pero eso no convierte automáticamente la política en correcta, suficiente o alineada con tu superficie real.

Los puntos más importantes para llevarte son:

- el framework ayuda, pero no decide por vos
- los defaults son un punto de partida, no una estrategia completa
- la política debe adaptarse al tipo de app que servís
- app, proxy e infraestructura tienen que estar alineados
- cada header desactivado o relajado debería entenderse como una decisión de riesgo, no como un simple ajuste técnico

En resumen:

> un backend más maduro no se conforma con “usar Spring Security” y asumir que los headers ya quedaron resueltos.  
> Usa el framework como herramienta para hacer explícita una política de respuesta más consciente, verificable y alineada con la superficie real de la aplicación, porque entiende que la seguridad del navegador no se construye por presencia de framework, sino por decisiones concretas sobre qué se envía, desde qué capa y con qué intención.

---

## Próximo tema

**CORS mal entendido**
