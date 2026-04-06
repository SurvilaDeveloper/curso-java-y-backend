---
title: "Referrer-Policy"
description: "Qué hace Referrer-Policy en una aplicación Java con Spring Boot y por qué ayuda a limitar cuánta información de navegación comparte el navegador al seguir enlaces o cargar recursos. Cómo reducir fugas de contexto, URLs y paths sin tratar este header como un detalle menor."
order: 107
module: "HTTP, headers y superficie del navegador"
level: "base"
draft: false
---

# Referrer-Policy

## Objetivo del tema

Entender qué hace **`Referrer-Policy`** en una aplicación Java + Spring Boot y por qué vale la pena pensarlo como una forma de reducir fugas silenciosas de contexto hacia otros sitios o recursos.

La idea es revisar una superficie que muchas veces pasa desapercibida porque no suena tan dramática como:

- XSS
- CSRF
- IDOR
- fuga de secretos
- clickjacking

Pero igual puede revelar demasiado.

Porque cuando un usuario navega desde tu aplicación hacia otro origen, o cuando la página carga ciertos recursos, el navegador puede enviar información sobre **desde qué URL venía**.

Y esa URL, según cómo esté armada tu app, puede contener bastante contexto.

En resumen:

> `Referrer-Policy` ayuda a controlar cuánta información de navegación comparte el navegador con otros destinos.  
> No protege un secreto mágico, pero sí reduce fugas de contexto que muchas veces se subestiman.

---

## Idea clave

Cuando el navegador hace ciertas requests, puede incluir información de referencia sobre la página de origen.

Esa información suele ir en el header:

- `Referer`

Aunque el nombre histórico esté escrito así, la idea importante es simple:

> otro sitio o recurso puede enterarse desde qué página o URL llegó el usuario.

Eso a veces es útil.
Pero también puede ser demasiado.

La idea central es esta:

> no toda navegación o carga de recursos necesita compartir la URL completa de origen.  
> Y cuando la comparte sin control, puede regalar más contexto del necesario.

`Referrer-Policy` sirve justamente para decirle al navegador **cuánto** de esa referencia debería enviar.

---

## Qué problema intenta resolver este tema

Este tema busca evitar situaciones como:

- URLs internas o sensibles filtradas hacia terceros
- paths de páginas privadas enviados como referencia al cargar recursos externos
- parámetros de navegación demasiado ricos terminando en otros dominios
- fuga de estructura interna de la app por navegación normal
- herramientas externas aprendiendo demasiado sobre rutas, pantallas o flujos del sistema
- compartir más contexto del necesario entre páginas del mismo sitio y otros orígenes
- pensar que “es solo un header de navegación” y no ver el valor de la metadata que puede estar saliendo

Es decir:

> el problema no es solo que la app muestre información.  
> También importa qué parte del contexto de navegación termina viajando silenciosamente a otros destinos.

---

## Error mental clásico

Un error muy común es este:

### “El referrer no importa mucho; total solo dice de dónde vino”

Eso puede ser peligroso.

Porque “de dónde vino” puede revelar cosas como:

- rutas internas
- IDs o slugs
- estructura de páginas privadas
- nombres de recursos
- estados de flujos
- queries
- parámetros
- pasos de un proceso sensible
- detalles del backoffice o del panel

### Idea importante

A veces el problema no es que la URL tenga un secreto literal.
El problema es que contiene **contexto valioso** que no necesitás compartir con el siguiente destino.

---

## Qué puede terminar filtrándose

Dependiendo de cómo estén construidas tus URLs, el navegador puede terminar compartiendo referencias con información como:

- rutas de paneles privados
- identificadores de recursos
- nombres de secciones internas
- parámetros de búsqueda
- estados de filtros
- estructura de workflows
- nombres de pantallas operativas
- paths de backoffice
- detalles de navegación del usuario autenticado

### Idea útil

Aunque no haya una contraseña o token en la URL, igual puede haber demasiado contexto útil para terceros o para análisis innecesario.

---

## Cuándo aparece este header en la práctica

`Referrer-Policy` importa cuando tu app:

- enlaza a otros sitios
- carga recursos desde otros orígenes
- mezcla contenido propio con contenido de terceros
- usa analítica externa
- carga imágenes, scripts o estilos fuera del mismo origen
- tiene paneles internos o rutas sensibles que pueden ser origen de navegación
- combina navegación web con integraciones visibles del lado del navegador

### Idea importante

No es un tema solo de “links salientes”.
También afecta cómo se comporta el navegador al cargar otros recursos en ciertos contextos.

---

## No es solo privacidad del usuario, también es privacidad estructural de la app

Mucha gente piensa `Referrer-Policy` solo en términos de privacidad del usuario final.
Y sí, toca ese tema.

Pero también importa desde el punto de vista del backend y de la arquitectura expuesta.

Porque el referrer puede enseñar cosas como:

- qué panel existe
- qué módulo está visitando el usuario
- cómo se organizan ciertas rutas
- qué recursos tiene abiertos
- qué partes del sistema conectan con terceros

### Idea importante

A veces el problema no es solo “datos personales”.
También puede ser fuga de inteligencia estructural sobre la aplicación.

---

## URLs y contexto: por qué importa tanto cómo diseñas los paths

Este tema se conecta con algo más amplio:
cómo armas las URLs.

Si una URL contiene demasiado:

- estado
- parámetros
- nombres sensibles
- rutas administrativas
- información de negocio
- detalle de recursos

entonces cualquier fuga de referrer se vuelve más costosa.

### Regla sana

`Referrer-Policy` ayuda a limitar daño, pero no debería ser la única defensa si tus URLs ya están cargando demasiado contexto.

---

## No deberías depender de “ojalá el navegador mande poco”

Dejar esta cuestión librada al comportamiento por defecto del navegador no es una gran idea.

Porque esos defaults pueden:

- cambiar
- variar según contexto
- no coincidir con lo que querés proteger
- ser más abiertos de lo necesario para ciertas superficies

### Idea útil

Igual que con otros security headers, la ventaja está en **decidir la política**, no en asumir que el navegador va a comportarse justo como más te conviene.

---

## No todo destino necesita conocer la URL completa de origen

Esta es la intuición más útil del tema.

Preguntate:

- ¿este tercero necesita saber la URL exacta desde la que llegó el usuario?
- ¿necesita conocer el path completo?
- ¿necesita ver parámetros?
- ¿necesita saber si venía de un panel admin o de una pantalla concreta?
- ¿necesita saber algo más que el origen general?

En muchísimos casos, la respuesta es:

- no

### Idea importante

Ese “no” es justamente la razón por la que `Referrer-Policy` vale la pena.

---

## Si tu app tiene paneles, backoffice o rutas sensibles, esto pesa más

No todas las apps tienen el mismo perfil.

El tema se vuelve especialmente importante cuando tu backend sirve páginas como:

- paneles administrativos
- backoffice
- vistas de operaciones
- configuraciones de cuenta
- flujos internos
- listados con filtros ricos
- secciones con nombres de recursos o de negocio delicados

### Porque ahí el referrer puede enseñar
- más estructura interna
- más contexto del usuario
- más información de negocio
- más pasos del flujo

### Regla sana

Cuanto más rica y sensible es la navegación, más sentido tiene recortar cuánto se comparte hacia afuera.

---

## También importa en apps con terceros embebidos

Si tu frontend o la parte web servida por backend carga:

- analítica
- widgets
- recursos externos
- CDNs
- imágenes o scripts de terceros

ese ecosistema puede recibir referrers si la política es demasiado laxa.

### Idea importante

No solo estás compartiendo información con “otro sitio al que el usuario hace clic”.
También podés estar revelando contexto a servicios externos que forman parte de la página.

---

## No arregla URLs mal diseñadas

Esto conviene decirlo claro.

`Referrer-Policy` no arregla por sí sola problemas como:

- tokens en query params
- IDs sensibles en URL
- parámetros ricos de más
- estados críticos expuestos en el path
- malas decisiones de routing

### Regla sana

Primero: evitá meter cosas que nunca deberían ir en URLs.
Después: usá `Referrer-Policy` para limitar el contexto que igual podría compartirse.

---

## No es un sustituto de no poner secretos en URLs

Esto merece su propia aclaración.

Si una aplicación sigue poniendo:

- tokens
- recovery links inseguros
- datos de sesión
- secretos operativos
- información muy sensible en query params

el problema de base sigue siendo grave.

### Idea importante

`Referrer-Policy` ayuda a reducir cuánto se comparte.
No justifica malas prácticas previas de diseño de URLs.

---

## Cuánta información compartir es una decisión de riesgo

La cuestión práctica de este header es elegir entre políticas más abiertas o más restrictivas según el caso.

No hace falta memorizar todavía todos los valores posibles.
Lo importante es el modelo mental:

- compartir la URL completa es lo más rico
- compartir solo parte del origen reduce fuga
- compartir nada reduce todavía más
- el valor adecuado depende del tipo de app, del tipo de contenido y del equilibrio entre utilidad y exposición

### Regla útil

Pensalo como un control de **granularidad del contexto compartido**, no como una casilla binaria sí/no.

---

## Apps puramente internas también deberían pensarlo

A veces se asume que, si la app es interna, esto no importa tanto.
Eso no siempre es cierto.

Porque incluso en una app interna puede haber:

- recursos externos
- analítica
- links salientes
- paneles más sensibles
- entornos distintos
- proveedores
- navegación a otros dominios controlados por terceros

### Idea importante

Interno no significa automáticamente que compartir paths o contexto de navegación “dé lo mismo”.

---

## El referrer también puede enseñar más de lo que el usuario imagina

Hay un costado de privacidad UX que también vale la pena pensar.

El usuario puede estar en una pantalla privada o sensible y, al seguir un link o cargar algo externo, no darse cuenta de que esa otra parte recibe información sobre de dónde venía.

### Idea útil

No todo riesgo acá es técnico puro.
También hay una expectativa razonable de no compartir más contexto del necesario.

---

## No toda superficie necesita la misma política

Igual que con otros headers, conviene evitar el pensamiento excesivamente rígido.

No es lo mismo:

- una landing pública
- un panel de cuenta
- una consola admin
- un backoffice
- una pantalla de login
- una API JSON pura
- una descarga
- una vista interna con muchos parámetros

### Idea importante

El nivel de restricción razonable puede variar según la superficie.
Pero la ausencia total de política suele ser peor que una decisión consciente.

---

## También importa qué capa agrega el header

Como en otros security headers, conviene saber:

- ¿lo pone Spring?
- ¿lo pone el proxy?
- ¿lo pone el gateway?
- ¿sale en todas las respuestas HTML?
- ¿hay inconsistencias por entorno o por ruta?

### Regla sana

No alcanza con asumir que “algún componente” lo está enviando.
Conviene verificar qué respuestas relevantes realmente lo incluyen.

---

## Relación con analítica y recursos externos

Este es uno de los lugares donde más se nota el efecto práctico.

Si tu aplicación usa recursos externos, conviene preguntarte:

- ¿qué necesitan realmente saber esos terceros?
- ¿qué path o contexto están recibiendo hoy?
- ¿esa información agrega valor o solo es fuga?
- ¿estoy compartiendo demasiado por defaults del navegador?

### Idea útil

A veces la política más laxa beneficia más al tercero que a tu propia app o a tus usuarios.

---

## Menos contexto también reduce inteligencia gratuita

Desde una mirada ofensiva, el referrer puede servir para entender mejor:

- cómo navegan los usuarios
- qué pantallas existen
- qué recursos se relacionan
- qué módulos tiene el sistema
- cómo son ciertos flujos internos

### Idea importante

Aunque la información parezca “solo navegación”, puede convertirse en una ayuda gratuita para mapear mejor la superficie de la aplicación.

---

## Qué conviene revisar en una app Spring

Cuando revises `Referrer-Policy` en una aplicación Spring, mirá especialmente:

- qué páginas HTML o paneles sirve la app
- si hay rutas internas ricas en contexto
- si hay parámetros o queries con demasiada información
- qué links salientes existen
- qué recursos externos carga la página
- qué terceros podrían recibir referrers
- qué capa del sistema agrega el header
- si la política actual es consciente o simplemente el default
- qué superficies deberían ser más estrictas
- cuánto aprendería un tercero viendo hoy la URL de origen de ciertas pantallas

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- menos dependencia de defaults del navegador
- más conciencia sobre lo que una URL revela
- menos contexto de navegación compartido hacia terceros sin necesidad
- mejor combinación entre diseño de URLs y política de referrer
- rutas más sobrias en contextos sensibles
- mayor cuidado en paneles, backoffice y flujos con información interna
- mejor entendimiento de qué terceros reciben metadata de navegación

---

## Señales de ruido

Estas señales merecen revisión rápida:

- nadie sabe qué política de referrer sale hoy
- la app tiene paneles ricos y recursos externos, pero nunca se revisó esta capa
- URLs con mucho contexto sensible
- links o integraciones externas que reciben más información de la necesaria
- asumir que “si no hay secretos en la URL, no importa”
- no saber qué parte de la navegación un tercero puede inferir hoy
- confiar por completo en defaults del navegador

---

## Checklist práctico

Cuando revises `Referrer-Policy`, preguntate:

- ¿qué contexto de navegación podría estar compartiendo hoy el navegador?
- ¿mis URLs contienen paths o parámetros demasiado ricos?
- ¿qué terceros reciben ese contexto?
- ¿de verdad necesitan verlo?
- ¿qué pantallas me incomodaría que otro origen supiera que el usuario estaba visitando?
- ¿qué capa agrega hoy este header?
- ¿la política actual es una decisión consciente o un default accidental?
- ¿qué parte de la app necesita más restricción?
- ¿qué fuga de contexto podría afectar más al negocio o a la privacidad del usuario?
- ¿qué revisarías primero para compartir menos sin romper navegación legítima?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Qué URLs o pantallas tienen más contexto sensible?
2. ¿Qué recursos externos o links salientes existen en esas páginas?
3. ¿Qué podría recibir hoy otro origen como referrer?
4. ¿Eso te parece razonable o excesivo?
5. ¿Qué parte del negocio o del panel te molestaría más que quedara inferible por esta vía?
6. ¿Qué política creés que hoy está aplicando realmente el navegador?
7. ¿Qué cambio harías primero para reducir la fuga de contexto más innecesaria?

---

## Resumen

`Referrer-Policy` ayuda a controlar cuánta información de navegación comparte el navegador cuando el usuario sigue links o carga recursos.

No reemplaza:

- URLs bien diseñadas
- no poner secretos en query params
- separación por entornos
- prudencia con terceros
- buen diseño de frontend y backend

Pero sí ayuda a reducir una fuga silenciosa muy real:

- contexto de navegación
- paths
- parámetros
- estructura de la app
- metadata sobre lo que el usuario estaba haciendo

En resumen:

> un backend más maduro no solo se preocupa por lo que muestra directamente en pantalla o por API.  
> También piensa en cuánto contexto del recorrido del usuario se escapa hacia otros destinos por puro comportamiento del navegador, y usa `Referrer-Policy` cuando corresponde para que esa fuga deje de ser un detalle invisible y pase a ser una decisión consciente.

---

## Próximo tema

**Permissions-Policy**
