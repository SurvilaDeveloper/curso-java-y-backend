---
title: "Clickjacking"
description: "Qué es Clickjacking, por qué ocurre, qué impacto puede tener sobre las acciones del usuario y qué principios defensivos ayudan a evitar interacciones engañosas sobre la interfaz."
order: 40
module: "Ataques clásicos a aplicaciones web"
level: "intro"
draft: false
---

# Clickjacking

En el tema anterior vimos **Open Redirect**, donde una aplicación podía terminar redirigiendo a una persona hacia destinos no previstos y aprovechar la confianza del dominio legítimo.

Ahora vamos a estudiar otra vulnerabilidad clásica que también gira en torno a la confianza y a la interacción del usuario, pero desde otro ángulo: **Clickjacking**.

La idea general es esta:

> una persona cree que está haciendo clic sobre un elemento visible e inocente, pero en realidad termina interactuando con una interfaz distinta, oculta o presentada de forma engañosa.

Es decir, el problema no siempre está en que el sistema ejecute algo “por sí solo”, sino en que alguien sea inducido a realizar una acción que no entiende realmente.

Por eso Clickjacking es un tema importante:  
muestra cómo una aplicación puede quedar expuesta no solo por fallas de backend o de datos, sino también por cómo permite que su interfaz sea presentada e interactuada desde otros contextos.

---

## Qué es Clickjacking

**Clickjacking** es una técnica en la que una persona es engañada para hacer clic sobre un elemento de una aplicación sin comprender realmente sobre qué está interactuando.

La lógica general suele ser esta:

- existe una interfaz legítima con botones, formularios o acciones sensibles
- esa interfaz es embebida, superpuesta o presentada de forma engañosa
- la persona cree estar interactuando con otra cosa
- pero su clic termina afectando a la interfaz real escondida o disfrazada

La idea importante es esta:

> el usuario no actúa con intención genuina sobre esa función; actúa bajo una percepción manipulada de la interfaz.

Por eso Clickjacking también puede entenderse como un problema de **secuestro de interacción**.

---

## Por qué ocurre

Este problema suele aparecer cuando una aplicación permite que su contenido sea cargado o mostrado dentro de otro contexto visual sin controles adecuados.

Eso puede abrir la puerta a situaciones donde:

- la interfaz legítima se incrusta dentro de otra página
- el contenido real queda oculto o parcialmente visible
- otro diseño se superpone para engañar a la persona
- se induce a hacer clic en lugares que corresponden a acciones reales del sitio legítimo

La raíz del problema no está solo en la interfaz engañosa del atacante, sino también en que la aplicación legítima no restringe suficientemente cómo puede ser presentada fuera de su propio contexto.

---

## Qué busca lograr un atacante con Clickjacking

El objetivo suele ser aprovechar la interacción legítima del usuario contra él mismo.

A nivel conceptual, un atacante puede buscar que la víctima:

- haga clic en una acción que no quería ejecutar
- cambie una configuración sin darse cuenta
- active una función sensible
- confirme una operación
- altere permisos o preferencias
- interactúe con una sesión autenticada de forma no intencionada

Lo importante es que el atacante no siempre necesita robar credenciales ni romper la autenticación.  
Le alcanza con conseguir que la persona haga una acción dentro de una sesión válida sin entender qué está haciendo realmente.

---

## Por qué este problema es delicado

Es delicado porque explota algo muy básico de la experiencia digital:  
la persona usuaria confía en lo que ve y en la correspondencia entre:

- el elemento visual
- y la acción que produce

Cuando esa correspondencia se rompe, el usuario puede terminar tomando decisiones que en realidad no quiso tomar.

Eso vuelve especialmente relevante a Clickjacking en operaciones donde la interfaz tiene mucho poder, por ejemplo:

- cambios de configuración
- activación o desactivación de opciones
- confirmaciones
- permisos
- acciones administrativas
- operaciones sobre cuentas o recursos sensibles

En otras palabras:

> si la acción depende de un clic humano, entonces manipular visualmente ese clic puede ser una vía de abuso.

---

## Qué diferencia hay entre Clickjacking y CSRF

Estos temas pueden parecer cercanos porque ambos pueden terminar en acciones no deseadas bajo una sesión válida, pero no son lo mismo.

### En CSRF
La aplicación acepta una solicitud no legítima porque confía demasiado en el navegador autenticado.

### En Clickjacking
La persona realmente interactúa, pero lo hace engañada sobre el significado visual de esa interacción.

Podría resumirse así:

- **CSRF** abusa de la confianza del sitio en la solicitud
- **Clickjacking** abusa de la confianza del usuario en la interfaz

Ambos pueden afectar acciones sensibles, pero lo hacen desde mecanismos distintos.

---

## Qué condiciones hacen posible este ataque

A nivel conceptual, Clickjacking suele apoyarse en una combinación de factores como estos:

### La aplicación permite ser presentada dentro de otro contexto

Por ejemplo, embebida o integrada visualmente de manera que otra página pueda influir en cómo se percibe.

### Existen acciones relevantes que pueden ejecutarse mediante clic o interacción similar

No todas las páginas tienen el mismo riesgo.  
Cuanto más sensibles sean las acciones expuestas, más grave puede ser el problema.

### La persona usuaria mantiene una sesión válida

Si el sitio ya reconoce a la persona, entonces sus clics pueden tener consecuencias reales sobre su cuenta o sobre el sistema.

### La interfaz puede ser manipulada visualmente

Si el atacante logra ocultar, superponer o disfrazar elementos, puede desviar la intención del clic.

---

## Qué tipo de acciones suelen ser más sensibles

Clickjacking es especialmente relevante cuando una interfaz ofrece acciones con impacto.

Por ejemplo, conceptualmente:

- cambiar configuraciones de cuenta
- activar o desactivar opciones de seguridad
- confirmar operaciones
- modificar permisos
- iniciar acciones administrativas
- interactuar con recursos privados o sensibles
- autorizar una relación entre cuentas, servicios o elementos

Cuanto más importante sea la acción y menos señales claras exija el flujo, más delicado puede volverse este problema.

---

## Qué relación tiene con la sesión del usuario

Como en CSRF, el valor del ataque suele crecer si la persona ya tiene una sesión válida en el sitio objetivo.

Eso significa que el clic engañado no cae sobre una interfaz neutra, sino sobre una interfaz que el sitio puede interpretar como autorizada por una identidad real.

La aplicación ve algo como:

- la sesión es válida
- la interacción vino desde la interfaz
- la acción fue ejecutada

Pero la parte que falta es:

- la persona entendía realmente sobre qué estaba haciendo clic

Ese es el corazón del riesgo en Clickjacking.

---

## Ejemplo conceptual simple

Imaginá una aplicación que tiene un botón para cambiar una configuración importante de la cuenta.

Ahora imaginá que esa interfaz puede ser presentada dentro de otro contexto visual de manera engañosa.

La persona cree estar haciendo clic en un elemento inocente o irrelevante, pero en realidad su interacción cae exactamente sobre el control real de la aplicación.

Entonces:

- la sesión es legítima
- el clic ocurrió de verdad
- la acción se ejecutó
- pero la intención del usuario fue manipulada

Ese es el corazón de Clickjacking:

> la acción existe, el clic existe, la sesión existe; lo que está roto es la integridad de la interacción visual.

---

## Qué impacto puede tener

El impacto depende de qué acciones queden expuestas a este tipo de engaño.

### Sobre la cuenta del usuario

Puede provocar cambios no deseados en configuraciones, preferencias o relaciones importantes.

### Sobre la integridad de acciones sensibles

Puede hacer que se ejecuten operaciones que la persona no habría aprobado conscientemente.

### Sobre la seguridad de la sesión

Si la interfaz incluye acciones relacionadas con permisos o acceso, el impacto puede ser especialmente serio.

### Sobre la confianza en el sistema

Una aplicación que permite este tipo de engaño queda más expuesta a abuso del contexto visual que la persona usuaria considera legítimo.

Si además la víctima tiene privilegios altos, el impacto puede crecer mucho más.

---

## Qué relación tiene con el diseño de la interfaz

Clickjacking deja una enseñanza importante:

> la seguridad también depende de cómo una interfaz puede ser presentada y percibida, no solo de cómo funciona técnicamente en condiciones ideales.

Esto significa que el diseño seguro de una aplicación no termina en:

- backend correcto
- autenticación sólida
- permisos bien definidos

También importa:

- cómo se renderiza la interfaz
- si puede ser incrustada o reutilizada fuera de contexto
- si las acciones sensibles dependen solo de un clic simple
- si el sistema protege suficientemente su presentación legítima

Es un problema de interacción, no solo de lógica.

---

## Qué señales pueden sugerir este problema

No siempre es una vulnerabilidad fácil de detectar desde el uso cotidiano, pero algunas señales deberían llamar la atención.

### Ejemplos conceptuales

- páginas sensibles que pueden cargarse dentro de otros contextos visuales sin restricciones
- acciones importantes que dependen de una interacción muy simple y directa
- revisión de diseño que muestra falta de protección frente a incrustación o presentación externa
- flujos donde una interfaz autenticada podría resultar engañosa si se superpone con otras capas visuales
- páginas administrativas o de configuración que no restringen adecuadamente cómo pueden ser mostradas

A menudo el hallazgo surge más claramente de una revisión de seguridad o arquitectura que del comportamiento normal de la aplicación.

---

## Por qué no se resuelve solo con “el usuario debería darse cuenta”

Ese enfoque no es suficiente.

La seguridad no puede apoyarse únicamente en que la persona:

- mire mejor
- sospeche más
- detecte señales visuales sutiles
- interprete correctamente una interfaz manipulada

La responsabilidad principal sigue siendo del sistema, que debería reducir o impedir las condiciones técnicas que permiten el engaño.

Confiar solo en la atención del usuario es una defensa muy débil.

---

## Qué puede hacer una organización para prevenir este problema

Desde una mirada defensiva, algunas ideas clave son:

- evitar que interfaces sensibles puedan ser embebidas o presentadas libremente en contextos externos
- proteger especialmente páginas de configuración, autenticación y administración
- revisar qué acciones dependen solo de un clic simple bajo sesión válida
- diseñar con más cuidado las operaciones sensibles y su contexto de interacción
- tratar la presentación de la interfaz como parte de la superficie de seguridad
- revisar la integridad visual de los flujos críticos y no solo su backend

La idea importante es que la aplicación debería conservar control sobre el contexto en el que sus acciones sensibles se presentan al usuario.

---

## Error común: pensar que si la acción requiere un clic “real”, entonces ya es segura

No necesariamente.

En Clickjacking, justamente el clic es real.  
Lo que no es genuino es la comprensión del usuario sobre lo que está haciendo.

Ese es el punto central:

- la acción ocurre
- la persona interactúa
- pero la intención fue manipulada

Por eso no alcanza con decir “si alguien hizo clic, entonces quiso hacerlo”.

---

## Error común: creer que este ataque solo importa en páginas públicas

No.

Puede ser especialmente delicado en:

- paneles privados
- configuración de cuenta
- herramientas de soporte
- administración
- operaciones internas
- interfaces con alto valor de acción

Cuanto más poder concentre la pantalla, más importante es proteger cómo puede ser presentada.

---

## Idea clave del tema

Clickjacking ocurre cuando una persona es inducida a interactuar con una interfaz legítima de forma engañosa, haciendo clic o ejecutando acciones sin comprender realmente sobre qué está actuando.

Este tema enseña que:

- la seguridad también depende de la integridad visual de la interfaz
- una sesión válida no vuelve legítima cualquier interacción si la persona fue engañada
- las acciones sensibles no deberían quedar expuestas a contextos visuales no controlados
- proteger la presentación de la interfaz es parte de proteger la aplicación

---

## Resumen

En este tema vimos que:

- Clickjacking es una técnica de secuestro o manipulación de la interacción del usuario
- ocurre cuando la interfaz legítima puede presentarse de forma engañosa dentro de otro contexto
- puede provocar acciones no deseadas bajo una sesión válida
- se diferencia de CSRF porque aquí el clic es real, pero la comprensión del usuario está manipulada
- el impacto depende mucho del valor de las acciones expuestas
- la defensa requiere proteger cómo se presenta la interfaz y revisar especialmente las acciones sensibles

---

## Ejercicio de reflexión

Pensá en una aplicación con:

- login
- configuración de cuenta
- panel privado
- acciones de confirmación
- herramientas administrativas o de soporte
- usuarios que suelen mantener sesión abierta en el navegador

Intentá responder:

1. ¿qué pantallas serían más delicadas frente a Clickjacking?
2. ¿qué diferencia hay entre “clic real” e “interacción genuinamente intencionada”?
3. ¿por qué una cuenta con privilegios altos vuelve más grave este problema?
4. ¿qué parte del diseño de interfaz considerarías parte de la seguridad?
5. ¿qué controles aplicarías para evitar que una acción sensible pueda presentarse de forma engañosa?

---

## Autoevaluación rápida

### 1. ¿Qué es Clickjacking?

Es una vulnerabilidad donde una persona es engañada para hacer clic o interactuar con una interfaz legítima sin comprender realmente la acción que está ejecutando.

### 2. ¿Por qué puede ser peligrosa?

Porque permite provocar acciones reales bajo una sesión válida aprovechando una presentación visual engañosa.

### 3. ¿En qué se diferencia de CSRF?

En CSRF la solicitud puede generarse sin interacción genuina del usuario; en Clickjacking el clic existe, pero la percepción del usuario está manipulada.

### 4. ¿Qué defensa ayuda mucho a prevenirlo?

Proteger cómo pueden mostrarse las interfaces sensibles, revisar acciones de alto impacto y tratar la presentación visual como parte de la superficie de seguridad.

---

## Próximo tema

En el siguiente bloque vamos a entrar en los **ataques web más avanzados**, empezando por la **Server-Side Template Injection (SSTI)**, una vulnerabilidad donde el problema ya no está en el navegador o en la base de datos, sino en cómo el servidor interpreta plantillas de forma insegura a partir de entradas externas.
