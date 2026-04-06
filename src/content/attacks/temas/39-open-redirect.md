---
title: "Open Redirect"
description: "Qué es Open Redirect, por qué ocurre, qué impacto puede tener sobre la confianza en la aplicación y cómo principios de diseño más estrictos ayudan a evitar redirecciones inseguras."
order: 39
module: "Ataques clásicos a aplicaciones web"
level: "intro"
draft: false
---

# Open Redirect

En el tema anterior vimos **File Inclusion**, donde la aplicación podía terminar incorporando archivos o recursos no previstos dentro de su propio flujo interno.

Ahora vamos a estudiar otra vulnerabilidad clásica, más sutil en apariencia pero muy importante en la práctica: **Open Redirect**.

La idea general es esta:

> la aplicación permite redirigir a una persona hacia un destino controlado externamente o no previsto, sin validar con suficiente rigor si ese destino es realmente legítimo.

A primera vista puede parecer un problema menor, porque no siempre implica acceso directo a datos, ejecución de comandos o modificación de registros.

Pero en seguridad web, la confianza importa mucho.

Y una redirección insegura puede debilitar precisamente eso:

- la confianza en los enlaces del sitio
- la integridad del flujo de navegación
- la legitimidad percibida de ciertos procesos
- la seguridad de otros mecanismos que dependen de redirecciones controladas

Por eso Open Redirect es importante:  
aunque no siempre sea devastador por sí solo, puede ser muy útil para engaños, cadenas de ataque y abuso de flujos legítimos.

---

## Qué es una redirección

Una **redirección** es un mecanismo mediante el cual una aplicación o un sitio envía a la persona usuaria desde una ubicación hacia otra.

Eso puede ser completamente legítimo y hasta necesario.

Por ejemplo, las redirecciones se usan para:

- enviar a login
- volver al recurso original después de autenticarse
- mover tráfico entre páginas
- derivar a una sección distinta del sitio
- completar flujos de pago, autorización o integración
- manejar cambios de URL o estructura

La idea importante es esta:

> redirigir no es malo; el problema aparece cuando la aplicación no controla correctamente a dónde redirige.

---

## Qué es un Open Redirect

Un **Open Redirect** ocurre cuando la aplicación permite que una entrada externa decida o influya indebidamente sobre el destino de una redirección, y no valida con suficiente rigor si ese destino es seguro o esperado.

La palabra clave es **open**.

Se llama así porque la redirección queda “abierta” a destinos que no deberían ser aceptados libremente.

Dicho de forma simple:

- la aplicación debería redirigir solo a destinos legítimos
- pero termina aceptando destinos externos o no previstos
- eso permite que el sitio funcione como puente hacia otra ubicación

El problema no está en redirigir, sino en perder control sobre el destino real de esa redirección.

---

## Por qué este problema importa

Open Redirect importa porque los enlaces y flujos dentro de una aplicación suelen heredar confianza.

Cuando una persona ve un enlace o una navegación que parte desde un sitio legítimo, tiende a asumir que:

- el flujo es confiable
- el destino forma parte del proceso normal
- la transición fue decidida por la aplicación
- no hay una manipulación oculta detrás

Si el sitio permite redirigir libremente hacia destinos no previstos, esa confianza puede ser abusada.

Eso vuelve a Open Redirect especialmente útil para:

- engaños
- campañas de phishing
- abuso de flujos de autenticación o autorización
- encadenamiento con otras vulnerabilidades
- debilitamiento de la percepción de seguridad del sitio

---

## Qué busca lograr un atacante con un Open Redirect

El objetivo no suele ser “romper” el sistema desde adentro, sino usar la propia legitimidad del sitio como parte del engaño o del flujo ofensivo.

A nivel conceptual, un atacante puede buscar:

- hacer que un enlace parezca más confiable porque empieza en un dominio legítimo
- aprovechar la redirección para llevar a la víctima a un destino no esperado
- insertar el sitio legítimo dentro de una cadena de navegación engañosa
- apoyar campañas de phishing o suplantación
- abusar de flujos donde la redirección tiene valor especial
- combinar la falla con otros mecanismos sensibles del sistema

La idea importante es esta:

> el atacante quiere aprovechar la reputación del sitio para facilitar que otra persona llegue a un destino que no habría aceptado tan fácilmente de forma directa.

---

## Por qué ocurre

Open Redirect suele aparecer cuando la aplicación toma un valor externo para decidir a dónde enviar a la persona usuaria y no restringe suficientemente el conjunto de destinos permitidos.

A nivel conceptual, puede pasar cuando:

- se usa un parámetro para decidir el destino posterior
- se acepta una URL de retorno sin validación fuerte
- se confía en que el valor recibido “debería” ser legítimo
- se delega demasiado en la entrada del usuario o del cliente
- no existe una lista clara de destinos válidos
- se asume que toda redirección iniciada desde el sitio es segura

La raíz del problema vuelve a ser conocida:

> una decisión de seguridad importante queda demasiado influida por datos externos.

---

## Dónde puede aparecer

Esta vulnerabilidad suele aparecer en flujos donde las redirecciones forman parte natural del diseño.

### Login y retorno posterior

Por ejemplo, cuando una persona inicia sesión y luego debe volver a una página previa.

### Logout o transiciones de sesión

Algunas aplicaciones redirigen después de ciertos cambios de estado.

### Integraciones con terceros

Pagos, autorizaciones o servicios externos pueden incluir retornos y callbacks que requieren mucha más validación.

### Confirmaciones, invitaciones o enlaces de recuperación

Algunos flujos críticos usan URLs de retorno o continuación.

### Paneles administrativos o herramientas internas

No es un problema exclusivo de páginas públicas; cualquier redirección basada en entrada externa merece revisión.

En general, cada vez que el sistema acepta un “destino” desde afuera, conviene pensar en este riesgo.

---

## Por qué puede ser peligroso aunque no “ejecute” nada por sí mismo

Este es un punto importante.

Open Redirect no siempre significa:

- ejecución de código
- acceso directo a base de datos
- lectura inmediata de información sensible

Pero eso no lo vuelve irrelevante.

Su poder está en que puede:

- romper la confianza del flujo
- ayudar a construir engaños convincentes
- facilitar cadenas de ataque
- aprovechar la reputación del dominio legítimo
- complicar la percepción de riesgo de la persona usuaria

En seguridad web, una vulnerabilidad que debilita confianza y navegación puede ser muy valiosa para un atacante aunque, por sí sola, no “rompa” el backend.

---

## Relación con phishing y engaño

Esta es una de las asociaciones más conocidas de Open Redirect.

Si una persona ve un enlace que empieza con un dominio legítimo, puede confiar más en él que en uno completamente desconocido.

Entonces, si el sitio redirige libremente a destinos no previstos, el atacante puede intentar usar ese dominio confiable como parte del engaño.

La víctima puede pensar algo como:

- “el enlace viene del sitio legítimo”
- “la navegación parece oficial”
- “la transición es parte del flujo normal”

Ese aprovechamiento de confianza es justamente lo que vuelve a Open Redirect tan útil en campañas de engaño.

---

## Relación con otros flujos sensibles

Open Redirect también importa mucho cuando forma parte de procesos como:

- autenticación
- recuperación de cuenta
- integración con terceros
- confirmación de acciones
- flujos administrativos
- navegación después de operaciones sensibles

¿Por qué?

Porque en esos contextos la redirección no es solo “cambio de página”.  
Puede formar parte de una secuencia donde la persona usuaria espera legitimidad reforzada.

Si el destino queda abierto, la falla gana más valor ofensivo.

---

## Ejemplo conceptual simple

Imaginá una aplicación que, después del login, redirige a la persona hacia una página de retorno.

Hasta ahí, eso es completamente normal.

Ahora imaginá que el sistema permite que ese destino de retorno sea decidido por una entrada externa sin validar con suficiente rigor si realmente forma parte de los destinos legítimos de la aplicación.

Entonces la aplicación ya no controla bien el flujo de navegación.  
Está prestando su propia legitimidad para derivar a un lugar que no necesariamente debería aceptar.

Ese es el corazón de Open Redirect:

> el sitio deja de decidir claramente adónde puede enviar y pasa a funcionar como intermediario hacia destinos no previstos.

---

## Qué impacto puede tener

El impacto depende mucho del contexto del sitio y del valor que tenga la redirección dentro del flujo.

### Sobre la confianza

Puede hacer que el dominio legítimo se convierta en soporte de navegación engañosa.

### Sobre la seguridad del usuario

Puede facilitar que la persona llegue a destinos que no aceptaría con la misma facilidad si el enlace fuera directo.

### Sobre flujos sensibles

Puede debilitar procesos donde la redirección forma parte de:

- autenticación
- recuperación
- continuidad de navegación
- integración con terceros

### Sobre la seguridad general

Puede combinarse con otras vulnerabilidades o con campañas de phishing para aumentar credibilidad y efectividad.

---

## Qué señales pueden sugerir este problema

Detectarlo no siempre se logra desde el uso normal, pero hay algunas situaciones que deberían llamar la atención.

### Ejemplos conceptuales

- parámetros que deciden libremente a dónde redirigir
- flujos de login o recuperación con destinos externos poco controlados
- funciones que aceptan URLs de retorno sin lista permitida
- revisión de código donde la aplicación redirige en base a entrada externa sin validación fuerte
- enlaces internos que, en realidad, permiten derivar a ubicaciones no previstas
- flujos donde el origen parece confiable, pero el destino final no está claramente restringido

Muchas veces el hallazgo aparece más claramente en revisión de diseño que como un síntoma visible de “rotura” funcional.

---

## Qué diferencia hay entre una redirección legítima y una insegura

No toda redirección dinámica es mala.

Una redirección legítima es aquella donde la aplicación conserva control claro sobre:

- qué destinos son válidos
- en qué contexto pueden usarse
- qué entradas se aceptan
- cómo se valida el flujo

Una redirección insegura aparece cuando el sistema permite que esa decisión quede demasiado abierta o dependa de una referencia externa no suficientemente restringida.

Podría resumirse así:

- redirigir según reglas seguras es normal
- dejar que una entrada externa elija libremente el destino, no

---

## Por qué no alcanza con “parece venir del sitio”

Este tema deja una lección muy importante para seguridad web:

> el origen aparente del enlace no garantiza la legitimidad del destino final.

Eso vale tanto para quienes diseñan aplicaciones como para quienes analizan riesgo.

Una URL que empieza en un dominio legítimo puede seguir siendo peligrosa si el sitio tiene una redirección abierta y termina llevando a otra ubicación no controlada.

Por eso, desde el punto de vista defensivo, la aplicación no debería depender de que el usuario “se dé cuenta”; debería restringir los destinos permitidos desde el diseño.

---

## Qué puede hacer una organización para prevenir este problema

Desde una mirada defensiva, algunas ideas clave son:

- no permitir que entradas externas definan libremente destinos de redirección
- trabajar con listas permitidas de destinos válidos
- usar identificadores controlados por la aplicación en lugar de aceptar URLs arbitrarias
- revisar con especial cuidado flujos de login, recuperación e integración con terceros
- tratar la redirección como una decisión de seguridad y no solo de navegación
- auditar parámetros de retorno o continuación
- mantener control explícito del flujo, incluso cuando la navegación sea dinámica

La idea importante es que la aplicación debería decidir **entre opciones seguras conocidas**, no aceptar cualquier destino que llegue desde afuera.

---

## Error común: pensar que como “solo redirige”, entonces no es grave

Eso puede llevar a subestimarlo.

Es cierto que Open Redirect no siempre tiene el mismo impacto directo que otras vulnerabilidades más agresivas.  
Pero puede ser muy útil para:

- engañar
- construir confianza indebida
- encadenar ataques
- debilitar flujos sensibles

En seguridad, una falla que compromete confianza y legitimidad aparente puede ser muy valiosa para un atacante.

---

## Error común: creer que basta con revisar visualmente la URL inicial

No alcanza.

Si el sitio redirige, la pregunta importante no es solo:

- ¿qué dominio aparece al principio?

sino también:

- ¿quién decide el destino final?
- ¿el sistema lo valida correctamente?
- ¿está restringido a opciones legítimas?

La seguridad no puede depender solo de la percepción superficial del primer enlace.

---

## Idea clave del tema

Open Redirect ocurre cuando una aplicación permite redirigir hacia destinos no previstos o no suficientemente validados, debilitando la confianza del flujo y facilitando engaños o cadenas de ataque.

Este tema enseña que:

- redirigir no es el problema; perder control sobre el destino sí
- la legitimidad del dominio puede ser abusada para apoyar phishing o navegación engañosa
- las redirecciones deben tratarse como decisiones de seguridad, no solo como detalles de UX
- la prevención depende de restringir explícitamente el conjunto de destinos válidos

---

## Resumen

En este tema vimos que:

- Open Redirect es una vulnerabilidad de redirección insegura
- aparece cuando el sistema acepta destinos externos o no previstos sin validación fuerte
- puede ser muy útil para phishing, engaño y abuso de flujos sensibles
- no siempre produce impacto directo sobre datos, pero sí sobre confianza y seguridad general
- la raíz del problema está en ceder demasiado control del destino a una entrada externa
- la defensa requiere listas permitidas y control explícito de los flujos de redirección

---

## Ejercicio de reflexión

Pensá en una aplicación que:

- redirige después de login
- permite volver a una página anterior
- integra pagos o autorizaciones externas
- usa enlaces de recuperación o invitación
- tiene algunos paneles internos con navegación dinámica

Intentá responder:

1. ¿qué flujos usan redirecciones?
2. ¿cuáles serían más sensibles si aceptaran destinos externos sin control?
3. ¿por qué un dominio legítimo puede hacer más convincente una redirección maliciosa?
4. ¿qué diferencia hay entre una redirección dinámica segura y una abierta?
5. ¿qué cambios de diseño aplicarías para restringir correctamente los destinos válidos?

---

## Autoevaluación rápida

### 1. ¿Qué es Open Redirect?

Es una vulnerabilidad donde la aplicación permite redirigir a destinos no previstos o no validados suficientemente.

### 2. ¿Por qué puede ser peligrosa?

Porque puede aprovechar la confianza en el dominio legítimo para facilitar engaños, phishing o cadenas de ataque.

### 3. ¿Cuál es la raíz conceptual del problema?

Que el destino final de la redirección queda demasiado influido por una entrada externa.

### 4. ¿Qué defensa ayuda mucho a prevenirla?

Restringir explícitamente los destinos válidos, usar listas permitidas y no aceptar URLs arbitrarias como decisiones de redirección.

---

## Próximo tema

En el siguiente tema vamos a estudiar el **Clickjacking**, otra vulnerabilidad clásica relacionada con la interacción de la persona usuaria, pero enfocada en cómo una aplicación puede ser embebida o presentada de forma engañosa para inducir acciones no intencionadas.
