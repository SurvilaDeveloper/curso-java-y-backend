---
title: "Clickjacking y X-Frame-Options"
description: "Qué es el clickjacking, cómo puede afectar a una aplicación Java con Spring Boot y de qué manera ayudan headers como X-Frame-Options a reducir el riesgo de que una página legítima sea embebida dentro de otra maliciosa para inducir interacciones no deseadas."
order: 106
module: "HTTP, headers y superficie del navegador"
level: "base"
draft: false
---

# Clickjacking y X-Frame-Options

## Objetivo del tema

Entender qué es el **clickjacking**, por qué puede afectar a una aplicación Java + Spring Boot aunque el backend “funcione bien”, y cómo headers como **`X-Frame-Options`** ayudan a reducir ese riesgo.

La idea es mirar una superficie que a veces se subestima porque no se parece a una falla clásica de backend como:

- SQL injection
- IDOR
- mala autorización
- fuga de secretos

Sin embargo, puede ser muy dañina igual.

Porque una aplicación puede estar correctamente autenticada, tener una acción legítima y aun así quedar expuesta a que esa interfaz sea cargada dentro de otra página que intenta engañar visualmente al usuario.

En resumen:

> clickjacking no rompe el backend por dentro.  
> Intenta aprovechar cómo el navegador presenta tu interfaz para inducir acciones que el usuario no percibe como realmente las está ejecutando.

---

## Idea clave

El clickjacking ocurre cuando una página legítima es **embebida dentro de otra** —por ejemplo mediante un frame o iframe— y el atacante manipula el contexto visual para que el usuario:

- haga clic donde no cree estar haciendo clic
- apruebe una acción sin entenderlo
- interactúe con un panel legítimo disfrazado
- termine usando su propia sesión autenticada en beneficio del atacante

La idea central es esta:

> el usuario cree que está interactuando con una interfaz inocente,  
> pero en realidad sus clics están cayendo sobre una página legítima embebida y oculta parcial o visualmente manipulada.

Eso es lo que vuelve al clickjacking especialmente incómodo:
no depende tanto de explotar una lógica interna rota, sino de engañar la percepción del usuario sobre el contexto donde está interactuando.

---

## Qué problema intenta resolver este tema

Este tema busca evitar escenarios como:

- permitir que paneles o vistas sensibles se carguen libremente dentro de iframes ajenos
- exponer pantallas de backoffice, login o acciones críticas a ser embebidas por sitios no confiables
- asumir que “si el usuario está autenticado, lo demás ya depende de él”
- olvidar que una UI legítima puede ser abusada si se la presenta dentro de un contexto visual malicioso
- no endurecer el embebido de páginas que no deberían mostrarse en otros sitios
- copiar defaults sin revisar si el contenido realmente debería poder ser framed
- no distinguir entre páginas que necesitan embebido legítimo y páginas que jamás deberían cargarse dentro de otra

Es decir:

> el problema no es solo que tu app muestre cosas correctas.  
> El problema también es si el navegador permite que esa interfaz sea reusada por otro origen para engañar al usuario.

---

## Error mental clásico

Un error muy común es este:

### “Si mi backend no tiene una vulnerabilidad lógica, no me preocupa clickjacking”

Eso es una simplificación peligrosa.

Porque el clickjacking puede usar interfaces totalmente legítimas, por ejemplo:

- un botón de confirmar
- una acción de borrar
- una pantalla de aceptar permisos
- un formulario ya autenticado
- una opción de transferir, enviar o aprobar

### Idea importante

No hace falta que la acción sea ilegítima.
Alcanza con que el usuario la ejecute en un contexto visual engañoso.

El backend puede pensar:

- “la sesión es válida”
- “el usuario hizo clic”
- “la operación fue autorizada”

Y, aun así, la interacción haber sido inducida de forma tramposa.

---

## Qué tiene que existir para que el riesgo aparezca

En términos simples, suelen juntarse varias condiciones como:

- una página legítima puede ser embebida
- el usuario tiene una sesión o contexto válido
- existe una acción relevante dentro de esa página
- el atacante logra presentar o superponer la UI de forma engañosa
- el usuario interactúa sin entender el contexto real

### Idea útil

No todos los sistemas tienen el mismo nivel de riesgo.
Pero cuanto más acciones críticas haya en interfaz web tradicional, más sentido tiene revisar esta superficie.

---

## Por qué el navegador importa tanto acá

El clickjacking vive en una frontera muy de navegador.

No está intentando convencer al backend de que algo imposible es válido.
Está intentando manipular:

- la presentación
- el framing
- la percepción visual
- el foco de interacción
- el contexto en que el usuario cree estar

### Idea importante

Por eso este tema aparece naturalmente dentro del bloque de HTTP security headers.
Porque la mitigación clásica pasa, en buena medida, por decirle al navegador:

> “esta respuesta no debería poder ser embebida libremente dentro de otra página”.

---

## Qué tipo de páginas son más sensibles

No todas las respuestas de una app tienen el mismo perfil de riesgo.

El clickjacking suele preocupar más cuando hablamos de:

- pantallas de login
- paneles administrativos
- formularios con acciones relevantes
- backoffice
- settings de cuenta
- permisos
- operaciones financieras
- aprobaciones
- acciones destructivas
- pantallas de moderación
- cualquier vista donde un clic tenga impacto real

### Idea útil

Cuanto más crítica es la acción posible desde la interfaz, menos sentido suele tener dejarla embebible por defecto.

---

## X-Frame-Options: la defensa clásica

Acá entra el header **`X-Frame-Options`**.

Su idea, a nivel conceptual, es muy simple:

> indicarle al navegador si esa respuesta puede o no puede cargarse dentro de un frame/iframe.

Eso ayuda a cortar una parte clave del ataque:
que la página legítima sea usada como “capa embebida” dentro del sitio malicioso.

### Idea importante

No evita todos los engaños visuales posibles del mundo web.
Pero sí reduce bastante una vía muy concreta: el embebido no deseado de tu interfaz.

---

## Qué intenta controlar este header

Sin entrar todavía en implementaciones ultra finas, la pregunta que responde es algo como:

- ¿esta página puede renderizarse dentro de otra?
- ¿o debe mostrarse solo como contexto de nivel superior?

### Eso importa porque

si la página no puede ser emebida, el atacante pierde una herramienta muy útil para:

- ocultarla
- superponerla
- alinearla con botones falsos
- inducir clics sobre elementos legítimos

### Regla sana

Si una vista no tiene una razón fuerte para ser embebida, conviene sospechar de dejar esa puerta abierta.

---

## Clickjacking no es solo “ocultar un botón”

A veces se lo imagina de forma demasiado caricaturesca:
una página transparente con un botón escondido detrás.

Eso ayuda a entender la idea.
Pero el problema es más amplio.

Puede incluir cosas como:

- superposición parcial
- interfaces disfrazadas
- consentimiento inducido
- confirmaciones manipuladas
- pantallas reales cargadas donde no deberían
- pasos de flujo legítimos presentados de forma engañosa

### Idea importante

El eje no es la técnica visual exacta.
El eje es que el usuario pierde claridad sobre **qué interfaz real está accionando**.

---

## Si la app usa sesión o cookies, el riesgo sube

Esto conecta con temas anteriores del curso.

Cuando la aplicación usa:

- sesión
- cookies
- login web
- paneles autenticados
- navegación tradicional

el navegador puede mandar automáticamente credenciales válidas al recurso embebido.

### Entonces el atacante no necesita
- robar la sesión
- romper autenticación
- obtener un token explícito

Le alcanza con lograr que el usuario interactúe con una interfaz legítima ya autenticada, pero presentada en un contexto malicioso.

### Idea útil

Cuanto más browser-based y session-based es la app, más atención merece esta superficie.

---

## No reemplaza CSRF ni otras defensas

Esto es muy importante.

`X-Frame-Options` ayuda contra una forma de engaño visual.
Pero no reemplaza otras capas como:

- CSRF defenses
- autorización
- validaciones de acciones críticas
- reautenticación cuando corresponde
- UX prudente en operaciones sensibles

### Regla sana

Pensalo como una defensa específica contra framing y clickjacking, no como un sustituto de toda la seguridad de interacción.

---

## Tampoco corrige una acción peligrosa mal diseñada

Si una aplicación tiene una operación extremadamente crítica expuesta de forma demasiado fácil o sin confirmaciones adecuadas, el problema sigue existiendo aunque pongas el header.

### Ejemplos conceptuales

- borrar algo importante en un solo clic
- aprobar una operación de alto impacto sin verificación extra
- cambiar configuración crítica sin fricción

### Idea importante

El header reduce una vía de abuso.
No vuelve automáticamente prudente una UX que ya era demasiado frágil.

---

## No todas las páginas deberían tener la misma política

Este punto conviene pensarlo bien.

Muchas apps pueden tener páginas que **nunca** deberían embeberse.
Pero algunas integraciones legítimas sí pueden requerir framing en ciertos contextos.

### Entonces conviene preguntarse

- ¿qué vistas realmente necesitan poder embeberse?
- ¿cuáles jamás deberían?
- ¿el baseline debería ser negar y abrir solo excepciones justificadas?
- ¿qué costo tendría habilitar framing por comodidad?

### Idea útil

La política sana rara vez es “dejemos todo embebible y vemos”.
Más bien suele ser lo inverso.

---

## Si rompe algo, tal vez estaba mostrando una deuda real

Esto pasa mucho con security headers.

El equipo endurece framing y descubre que cierta parte del producto:

- dependía de iframes no pensados
- tenía una integración rara
- embebía pantallas donde no correspondía
- mezclaba UI de forma poco clara

Y la reacción es:

- “mejor saquemos el header”

Eso suele ser una salida demasiado rápida.

### Porque a veces el header está señalando
- una dependencia vieja
- una arquitectura UI confusa
- una integración que necesita diseño explícito
- una superficie más laxa de la cuenta

### Idea importante

No todo “romper algo” significa que el header estorba.
A veces significa que acabás de descubrir una deuda real.

---

## API JSON pura vs app web

En una API que casi no sirve HTML ni interfaz navegable, el valor práctico de `X-Frame-Options` suele ser menor.

En cambio, en apps que sí sirven:

- páginas HTML
- paneles
- admin
- login
- backoffice
- flujos web tradicionales

la conversación tiene mucho más peso.

### Regla útil

Cuanto más interfaz navegable y accionable servís desde backend, más relevante suele ser esta defensa.

---

## Qué puede enseñar la ausencia de esta defensa

Un atacante o un análisis automático puede inferir que ciertas páginas:

- aceptan ser embebidas
- no restringen framing
- quizá están diseñadas sin mucha atención a esta capa
- podrían ser candidatas para abuso visual

### Idea importante

No significa automáticamente que el ataque sea trivial.
Pero sí que la superficie está más abierta de lo necesario.

---

## X-Frame-Options y otras políticas modernas

Hoy también existe conversación relacionada con políticas más modernas del navegador para controlar embebido y aislamiento.
Pero conceptualmente, este tema sigue siendo muy útil para fijar la idea básica:

> si una página no tiene razones fuertes para aparecer dentro de otra, conviene decirlo explícitamente.

### Idea útil

Primero entendé el problema del framing no deseado.
Después tiene sentido discutir mecanismos más finos o modernos.

---

## Qué conviene revisar en una app Spring

Cuando revises clickjacking y `X-Frame-Options` en una aplicación Spring, mirá especialmente:

- qué páginas HTML o paneles sirve la app
- qué acciones críticas viven en interfaz navegable
- si esas respuestas pueden ser embebidas hoy
- qué capa agrega el header: app, proxy o gateway
- si existe alguna integración legítima que necesite framing
- si la política actual es negar por defecto o permitir por costumbre
- qué vistas serían más peligrosas si se cargaran dentro de un iframe malicioso
- si el equipo entiende que la amenaza es el engaño contextual al usuario y no solo “una cabecera más”

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- paneles y vistas sensibles no embebibles por defecto
- mejor conciencia sobre clickjacking en apps con sesión y UI real
- menos permisividad gratuita con framing
- excepciones justificadas y explícitas
- mejor alineación entre diseño de interacción y políticas del navegador
- comprensión de que la mitigación protege el contexto visual, no solo el contenido

---

## Señales de ruido

Estas señales merecen revisión rápida:

- nadie sabe si las páginas pueden embebirse hoy
- paneles admin o vistas de cuenta sin ninguna política de framing
- “es cosa del frontend” como respuesta
- permitir iframes por costumbre sin saber por qué
- desactivar endurecimiento apenas algo se rompe sin investigar la deuda
- no distinguir entre API pura y páginas con interacción sensible
- no pensar que una sesión válida también puede ser abusada visualmente

---

## Checklist práctico

Cuando revises clickjacking y `X-Frame-Options`, preguntate:

- ¿mi app sirve HTML o paneles con acciones relevantes?
- ¿esas páginas podrían cargarse hoy dentro de otra página?
- ¿qué vistas serían más peligrosas si eso pasara?
- ¿la app usa sesión o cookies que viajarían igual en ese contexto?
- ¿hay alguna razón legítima para permitir framing?
- ¿la política actual niega por defecto o deja abierto por inercia?
- ¿qué capa agrega hoy el header?
- ¿qué deuda podría revelar si activarlo rompe algo?
- ¿qué otras defensas complementarias faltan en acciones críticas?
- ¿qué página revisarías primero porque más daño haría si se pudiera clickjackingear?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Qué páginas HTML o paneles expone?
2. ¿Cuáles tienen acciones críticas?
3. ¿Podrían hoy embebirse en un iframe?
4. ¿Qué pasaría si un usuario autenticado interactuara con esa página dentro de un sitio malicioso?
5. ¿Qué vista te preocuparía más?
6. ¿Hay alguna integración real que de verdad necesite framing?
7. ¿Qué cambio harías primero para endurecer esta superficie sin romper casos legítimos?

---

## Resumen

El clickjacking intenta aprovechar que una página legítima pueda ser embebida y usada en un contexto visual engañoso para inducir acciones del usuario.

`X-Frame-Options` ayuda a reducir esa superficie diciéndole al navegador que ciertas respuestas no deberían cargarse libremente dentro de frames o iframes.

No reemplaza:

- CSRF
- buena autorización
- diseño prudente de acciones críticas
- confirmaciones o reautenticación cuando corresponda

Pero sí endurece una capa muy concreta e importante:

- el contexto visual donde el usuario interactúa con tu aplicación.

En resumen:

> un backend más maduro no se limita a servir una interfaz legítima y esperar que el contexto del navegador no importe.  
> Entiende que una UI correcta también puede ser abusada si se deja embebir sin control, y usa headers como `X-Frame-Options` cuando corresponde para evitar que otra página tome prestada esa interfaz y la convierta en una trampa visual.

---

## Próximo tema

**Referrer-Policy**
