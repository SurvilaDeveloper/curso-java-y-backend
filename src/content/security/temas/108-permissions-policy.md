---
title: "Permissions-Policy"
description: "Qué hace Permissions-Policy en una aplicación Java con Spring Boot y por qué ayuda a restringir capacidades del navegador que no deberían quedar habilitadas por defecto. Cómo pensar este header para reducir superficie en páginas, paneles y contenido embebido sin tratarlo como una rareza del frontend."
order: 108
module: "HTTP, headers y superficie del navegador"
level: "base"
draft: false
---

# Permissions-Policy

## Objetivo del tema

Entender qué hace **`Permissions-Policy`** en una aplicación Java + Spring Boot y por qué puede ayudar a reducir superficie del lado del navegador cuando servís páginas, paneles o contenido web.

La idea es revisar una pregunta que no siempre aparece al diseñar un backend:

- ¿qué capacidades del navegador quedan disponibles para mis páginas?
- ¿todas las vistas deberían poder usar las mismas APIs del browser?
- ¿qué pasa si una parte de la app o contenido embebido intenta acceder a cosas que no necesitaba?

Muchas aplicaciones responden sin querer algo como:

- “lo que el navegador permita por defecto”
- “lo que venga activado”
- “si el frontend no lo usa, no importa”

Ese enfoque es flojo.

Porque una cosa es que tu app no use cierta capacidad.
Y otra muy distinta es dejarla habilitada sin una decisión explícita.

En resumen:

> `Permissions-Policy` ayuda a decir qué capacidades del navegador querés permitir o restringir para el contenido que servís.  
> No arregla una app rota, pero sí reduce superficie innecesaria del lado del cliente.

---

## Idea clave

El navegador moderno ofrece muchas capacidades que una página puede intentar usar, por ejemplo relacionadas con:

- cámara
- micrófono
- geolocalización
- pantalla completa
- sensores
- clipboard
- y otras APIs sensibles o potentes

No todas las apps necesitan esas capacidades.
Y mucho menos todas las páginas de una misma app.

La idea central es esta:

> si una capacidad del navegador no aporta valor real a una superficie, dejarla habilitada por defecto es regalar margen innecesario.

`Permissions-Policy` permite endurecer esa parte indicando, en términos generales:

- qué features del navegador están permitidas
- para qué contexto
- y, en ciertos casos, para qué orígenes o contenido embebido

---

## Qué problema intenta resolver este tema

Este tema busca evitar situaciones como:

- páginas con más capacidades del navegador de las que realmente necesitan
- contenido embebido o subrecursos con acceso a APIs del browser que no deberían usar
- paneles administrativos con superficie de navegador demasiado abierta
- apps que nunca pensaron si querían permitir ciertas funciones del cliente
- depender por completo de defaults del navegador
- tratar todas las pantallas como si necesitaran el mismo nivel de acceso a features del browser
- no distinguir entre una landing pública, un backoffice y una vista embebida
- dejar disponible una capacidad solo porque “no revisamos ese tema”

Es decir:

> el problema no es que existan APIs del navegador.  
> El problema es no decidir conscientemente cuáles querés dejar habilitadas en las superficies que servís.

---

## Error mental clásico

Un error muy común es este:

### “Si el frontend no usa esa API del navegador, no importa que quede habilitada”

Eso es demasiado optimista.

Porque aunque hoy tu código no la use, igual puede importar si:

- mañana aparece un cambio no revisado
- una dependencia del frontend intenta usarla
- contenido embebido o de terceros la solicita
- hay una superficie con XSS u otra falla del lado del cliente
- una vista sensible queda con más capacidad de la necesaria

### Idea importante

No usar algo no es lo mismo que prohibirlo.
Y, desde seguridad, muchas veces conviene pasar de “no lo usamos” a “no queremos que pueda usarse”.

---

## Qué controla conceptualmente este header

`Permissions-Policy` funciona como una política que le dice al navegador algo parecido a:

> “Para esta respuesta o este contexto, ciertas capacidades del browser están restringidas o permitidas bajo reglas más explícitas.”

No hace falta memorizar todavía la sintaxis fina.
Lo importante es la idea:

- no todo feature del navegador debería quedar disponible por defecto
- y no toda página merece el mismo nivel de acceso

### Idea útil

Pensalo como un equivalente a “menor privilegio”, pero aplicado a capacidades del navegador del lado del cliente.

---

## Menor privilegio, pero del lado del browser

Esto conecta muy bien con temas anteriores del curso.

Así como en backend preguntamos:

- ¿qué secreto necesita este servicio?
- ¿qué permiso mínimo corresponde?

acá la pregunta es algo como:

- ¿qué capacidades del navegador necesita realmente esta página?

### Ejemplos

Una landing pública quizá no necesita:
- cámara
- micrófono
- geolocalización
- fullscreen
- clipboard-write

Un panel administrativo tampoco debería tenerlas habilitadas “porque sí” si no aportan valor real.

### Idea importante

El navegador también es una superficie con privilegios.
Y conviene tratarla con el mismo criterio de capacidad mínima.

---

## No todas las páginas necesitan las mismas capacidades

Esto es central.

No es lo mismo una página que:

- solo muestra contenido
- hace login
- administra usuarios
- opera pagos
- usa mapas
- captura una foto
- pide ubicación
- embebe contenido de terceros
- corre dentro de un iframe

### Idea útil

Una política razonable debería partir del caso de uso real.
No de asumir que todas las páginas del sitio necesitan la misma apertura.

---

## Qué tipo de problemas ayuda a reducir

`Permissions-Policy` no es una defensa universal.
Pero sí ayuda a reducir superficie en escenarios como:

- acceso innecesario a APIs del navegador
- mayor alcance para contenido embebido o de terceros
- dependencias del frontend que intentan usar capacidades no deseadas
- impactos de ciertas fallas del lado del cliente al limitar qué podría aprovecharse
- navegación con más poder del que el negocio realmente requería

### Idea importante

No está pensado para “detener cualquier ataque”.
Está pensado para **recortar capacidad sobrante**.

---

## No reemplaza permisos del usuario ni prompts del navegador

Esto también conviene decirlo claro.

El navegador y el sistema operativo ya tienen sus propios mecanismos de permiso y prompts para ciertas capacidades.
`Permissions-Policy` no reemplaza eso.

### Más bien agrega una capa de restricción extra

Es decir:

- aunque el navegador tenga una API disponible
- aunque el usuario pudiera conceder algo
- la política del sitio puede decidir que cierta capacidad no debería estar habilitada ahí

### Regla sana

Pensalo como una restricción adicional del lado del sitio, no como un sustituto de los permisos nativos del navegador.

---

## No es “solo frontend”

Como otros headers de este bloque, a veces se lo manda a una tierra de nadie entre frontend e infraestructura.

Pero la decisión de enviarlo sale desde:

- el backend
- o la infraestructura que responde por él

Entonces, aunque la consecuencia se vea en el navegador, sigue siendo parte del contrato de seguridad de la respuesta HTTP.

### Idea importante

Si tu backend sirve HTML o paneles, tiene sentido que alguien del lado backend entienda qué capacidades del browser está permitiendo por defecto.

---

## Panels, backoffice y superficies sensibles

Este header suele tener sentido especial en apps que sirven:

- paneles administrativos
- backoffice
- vistas de cuenta
- áreas autenticadas
- flujos con operaciones críticas

### ¿Por qué?

Porque en esas superficies suele convenir una política más sobria y restrictiva.
No querés capacidades extra del navegador abiertas sin necesidad real.

### Idea útil

Cuanto más crítica es la UI, más valor tiene preguntarte qué APIs del browser no deberían estar disponibles ahí.

---

## Contenido embebido y terceros

`Permissions-Policy` también se vuelve especialmente interesante cuando existe:

- contenido embebido
- iframes
- widgets
- integraciones de terceros
- recursos externos que interactúan con la página

### Porque entonces aparece otra pregunta

- ¿querés que ese contenido herede o use ciertas capacidades del navegador?
- ¿o preferís recortar lo que puede intentar?

### Idea importante

No toda superficie visible dentro de tu página merece el mismo acceso a features del browser.

---

## No se trata de prohibir todo por deporte

Conviene evitar otra caricatura.

El objetivo no es llenar la app de restricciones absurdas que rompan casos de uso legítimos.
El objetivo es preguntarte:

- ¿qué necesito realmente?
- ¿qué capacidades sobran?
- ¿qué superficie puedo cerrar sin costo real?

### Regla sana

La política buena no es la más dura posible por reflejo.
Es la más acotada que siga permitiendo el comportamiento de negocio que sí querés.

---

## Si una funcionalidad necesita una capacidad, que sea explícita

Este es un criterio muy sano.

Si una parte de la app realmente necesita, por ejemplo:

- geolocalización
- cámara
- micrófono
- fullscreen

entonces esa necesidad debería ser:

- conocida
- justificada
- localizada
- y no heredada por el resto de las pantallas sin motivo

### Idea útil

Una capacidad legítima usada en una zona concreta no justifica abrir toda la aplicación “por las dudas”.

---

## También ayuda a descubrir dependencias ocultas

Igual que con otros headers, a veces endurecer una política muestra que una app dependía de defaults demasiado amplios.

Eso puede pasar si:

- un componente del frontend usa una API del browser sin haberlo explicitado
- una librería asumía capacidades disponibles
- una integración embebida hacía más de lo que el equipo sabía
- una pantalla vieja dependía de permisos no documentados

### Idea importante

Si una política más estricta rompe algo, no siempre significa que “la política estorba”.
A veces significa que acabás de encontrar una dependencia oculta que conviene entender mejor.

---

## Apps puramente API vs apps con HTML

En una API JSON pura, la relevancia práctica de este header suele ser bastante menor.

En cambio, cuando el backend sirve:

- HTML
- paneles
- páginas con interacción de navegador
- vistas autenticadas
- contenido embebible

la conversación gana mucho más peso.

### Regla útil

Cuanto más navegador real hay del otro lado, más sentido tiene pensar en `Permissions-Policy`.

---

## No reemplaza CSP, X-Frame-Options ni otras capas

Este header tiene su propio rol.

No reemplaza:

- `Content-Security-Policy`
- `X-Frame-Options`
- `Referrer-Policy`
- una buena gestión de sesiones
- una UI prudente
- una app sin XSS

### Idea importante

Su valor está en otra parte:
**recortar capacidades del browser** que no deberían estar abiertas sin necesidad.

Se complementa, no compite, con otros headers.

---

## Qué capacidades pensar primero

Sin entrar todavía en una lista exhaustiva, las preguntas más útiles suelen aparecer alrededor de features como:

- geolocalización
- cámara
- micrófono
- fullscreen
- clipboard
- sensores
- otras APIs que den acceso a capacidades del dispositivo o de la experiencia del navegador

### Idea útil

No hace falta memorizar todas las opciones de una vez.
Lo importante es incorporar la disciplina mental de revisar:

> “¿qué podría intentar hacer esta página con el navegador, y qué parte realmente quiero permitir?”

---

## Este header también es una conversación de producto

No es solo un tema técnico.

A veces una política laxa existe porque nadie definió claramente:

- qué experiencia necesitaba esa pantalla
- qué permisos del navegador eran razonables
- qué integraciones de terceros se aceptaban
- qué dependencias del frontend eran intencionales

### Idea importante

Revisar `Permissions-Policy` obliga también a aclarar el contrato entre:

- producto
- frontend
- backend
- seguridad

sobre qué capacidades del browser forman parte legítima del comportamiento esperado.

---

## Qué conviene revisar en una app Spring

Cuando revises `Permissions-Policy` en una aplicación Spring, mirá especialmente:

- si la app sirve HTML o paneles reales
- qué pantallas requieren capacidades del navegador de verdad
- si existen iframes o contenido de terceros
- si hay admin o backoffice con superficies muy sensibles
- qué capa agrega el header
- si hoy todo está simplemente en defaults del navegador
- si el equipo puede explicar qué capacidades deberían estar abiertas y cuáles no
- qué parte del frontend depende de features del browser no documentadas
- si una política más restrictiva mejoraría seguridad sin romper valor real

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- conciencia de que el navegador también tiene privilegios
- menos dependencia de defaults amplios
- capacidades permitidas de forma más explícita
- menor apertura de features innecesarias
- paneles y vistas sensibles con postura más sobria
- mejor control sobre contenido embebido o de terceros
- mejor alineación entre casos de uso reales y superficie habilitada

---

## Señales de ruido

Estas señales merecen revisión rápida:

- nadie sabe si existe alguna política hoy
- la app sirve paneles complejos y nunca se revisó qué APIs del browser quedan habilitadas
- integraciones o widgets de terceros sin criterio claro
- dependencias del frontend que usan capacidades del navegador sin decisión explícita
- pensar que “si no lo usamos, no importa”
- desactivar políticas apenas algo se rompe sin entender qué dependencia quedó expuesta
- no distinguir entre páginas públicas inocuas y superficies autenticadas con más riesgo

---

## Checklist práctico

Cuando revises `Permissions-Policy`, preguntate:

- ¿mi app realmente sirve páginas que interactúan con el navegador?
- ¿qué capacidades del browser necesita cada superficie?
- ¿qué capacidades no necesita en absoluto?
- ¿hay paneles o vistas sensibles con más apertura de la necesaria?
- ¿existe contenido embebido o de terceros que debería tener menos poder?
- ¿qué capa agrega hoy este header?
- ¿estamos viviendo de defaults del navegador sin decisión consciente?
- ¿qué dependencia del frontend podría quedar al descubierto si endurezco esta política?
- ¿qué capacidad del navegador me preocuparía más dejar abierta sin necesidad?
- ¿qué restricción probaría primero para recortar superficie sin romper valor real?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Qué páginas o paneles sirve al navegador?
2. ¿Cuáles de esas superficies necesitan alguna capacidad especial del browser?
3. ¿Cuáles no deberían necesitar nada más que renderizar y enviar requests?
4. ¿Hay widgets o iframes de terceros?
5. ¿Qué capacidades del navegador jamás revisaste, pero están “abiertas por default”?
6. ¿Qué pantalla sensible te gustaría ver con una política más sobria?
7. ¿Qué cambio harías primero para pasar de defaults amplios a capacidades más explícitas?

---

## Resumen

`Permissions-Policy` ayuda a restringir qué capacidades del navegador quedan habilitadas para las respuestas que servís.

No arregla:

- XSS
- mala autorización
- malas integraciones
- diseño de UI frágil
- gestión deficiente de sesiones

Pero sí aporta una capa valiosa:

- limitar features del browser que no necesitás
- reducir capacidad sobrante
- endurecer paneles y vistas sensibles
- controlar mejor qué puede intentar hacer contenido embebido o dependencias del frontend

En resumen:

> un backend más maduro no se conforma con que el navegador “ya verá qué deja hacer”.  
> También piensa qué capacidades del cliente realmente necesita cada superficie y usa `Permissions-Policy` cuando corresponde para reducir privilegios innecesarios del lado del browser, porque entiende que cada feature abierta sin necesidad es otra parte de la superficie que alguien podría intentar aprovechar.

---

## Próximo tema

**Content-Security-Policy: idea general**
