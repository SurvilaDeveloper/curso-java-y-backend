---
title: "Puertos explícitos e implícitos en destinos salientes"
description: "Cómo pensar los puertos explícitos e implícitos al analizar SSRF en una aplicación Java con Spring Boot. Por qué no alcanza con validar host y esquema, y qué cambia cuando el backend puede terminar conectando a puertos distintos de los que el equipo imaginaba."
order: 137
module: "Consumo saliente, SSRF y conexiones externas"
level: "base"
draft: false
---

# Puertos explícitos e implícitos en destinos salientes

## Objetivo del tema

Entender por qué, al analizar **SSRF** en una aplicación Java + Spring Boot, también importa revisar los **puertos explícitos e implícitos** de los destinos salientes.

La idea de este tema es corregir otra simplificación muy común:

- “validamos el host”
- “el esquema es `http` o `https`”
- “el dominio está en allowlist”
- “no parece localhost”
- “entonces ya está bastante controlado”

Eso puede seguir dejando una parte relevante sin mirar:

- **¿a qué puerto va a terminar conectando realmente el backend?**

Porque el puerto también forma parte del destino.
Y puede cambiar bastante el riesgo.

En resumen:

> en SSRF no basta con decidir “a qué host” y “con qué esquema” está dispuesto a salir el backend.  
> También importa **a qué puerto** llega esa conexión y si ese puerto coincide con el modelo real de confianza de la funcionalidad.

---

## Idea clave

Un destino saliente no se define solo por:

- esquema
- host

También se define por:

- **puerto**

Eso puede venir de dos maneras:

### Puerto explícito
Cuando aparece escrito en la URL o en la configuración.

### Puerto implícito
Cuando no aparece, pero el sistema asume uno por defecto según el esquema o la librería que usa.

La idea central es esta:

> si no revisás bien el puerto, podés creer que aprobaste una salida “web normal” y terminar conectando a un servicio muy distinto del que imaginabas.

Y eso puede cambiar mucho el nivel de exposición.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- validar solo host y esquema
- no distinguir entre puerto implícito y puerto explícito
- asumir que un destino con `http` o `https` ya implica un puerto razonable
- dejar puertos variables cuando la funcionalidad no lo necesita
- permitir redirects que cambian de puerto sin revalidar
- no pensar que servicios internos distintos pueden vivir en el mismo host pero en puertos diferentes
- tratar el puerto como detalle técnico y no como parte del destino efectivo

Es decir:

> el problema no es solo “a qué máquina” sale el backend.  
> El problema también es **a qué servicio** de esa máquina termina llegando, y el puerto es parte central de esa respuesta.

---

## Error mental clásico

Un error muy común es este:

### “Si el host está permitido, el puerto no debería cambiar demasiado la historia”

Eso es demasiado optimista.

Porque en muchos entornos, el mismo host puede exponer cosas muy distintas según el puerto, por ejemplo:

- aplicación pública
- panel de administración
- métricas
- Actuator
- herramientas internas
- APIs auxiliares
- servicios de debugging
- bases o servicios intermedios expuestos erróneamente
- gateways locales
- sidecars

### Idea importante

El puerto no es un detalle cosmético.
Puede cambiar totalmente **qué servicio** alcanza la request saliente.

---

## Qué significa puerto explícito

El puerto explícito es el que viene indicado directamente en el destino.

Por ejemplo, conceptualmente:

- host + puerto concreto
- callback configurado con un puerto específico
- endpoint que no usa el puerto “esperado” del esquema
- redirect que manda a otro puerto

### Problema

Si una feature permite puertos explícitos demasiado libremente, puede ampliar mucho el rango de servicios alcanzables desde el backend.

### Regla sana

Si el negocio no necesita puertos variables, permitirlos libremente suele ser superficie innecesaria.

---

## Qué significa puerto implícito

El puerto implícito aparece cuando la URL o el destino no lo traen escrito, pero igual el sistema asume uno por defecto.

Eso puede parecer más seguro porque “al menos no dejaron un puerto arbitrario”.
Y, en muchos casos, realmente ayuda.

Pero aun así conviene entender:

- qué puerto implícito se asume
- si ese es el único esperado
- si un redirect puede cambiarlo
- si otro componente del stack termina conectando distinto
- si la funcionalidad de negocio realmente tolera ambos esquemas o uno solo

### Idea importante

Los puertos implícitos suelen ser más fáciles de razonar que los arbitrarios, pero no deberían quedar invisibles en la revisión.

---

## Host igual, puerto distinto, confianza distinta

Esta es una de las ideas más útiles del tema.

A veces el equipo piensa el destino como:
- “ese dominio”
o
- “ese servidor”

Pero desde seguridad el backend no habla con “el dominio” en abstracto.
Habla con un servicio concreto expuesto en una combinación de:

- host
- puerto
- esquema

### Idea útil

Dos requests al mismo host pero a puertos distintos pueden tener perfiles de riesgo totalmente diferentes.

---

## El mismo host puede servir cosas públicas e internas a la vez

Este patrón aparece bastante en entornos reales.

Un host puede tener:

- un puerto público normal
- otro puerto para administración
- otro para métricas
- otro solo para uso interno
- otro para herramientas de soporte
- otro para debugging
- otro expuesto accidentalmente en red privada

### Idea importante

Una allowlist de host que no piense puertos puede ser mucho más amplia de lo que parece.
Porque “permitir el host” puede terminar significando “permitir hablarle a varios servicios distintos que viven ahí”.

---

## Si el negocio quiere web externa, no necesariamente quiere puertos arbitrarios

Este es un criterio práctico muy útil.

Muchas funcionalidades dicen algo como:

- “traer una web”
- “validar un callback HTTP”
- “hacer preview”
- “descargar un archivo remoto”
- “consultar una API externa”

Eso normalmente no equivale a:

- “permitir cualquier puerto que el usuario quiera”

### Regla sana

Si la feature no necesita variación de puerto, permitirla suele ser una ampliación gratuita de superficie.

### Idea importante

No conviertas “destino configurable” en “destino configurable en cualquier puerto” si el producto nunca pidió eso.

---

## Puerto y SSRF: por qué el riesgo escala

En SSRF, permitir puertos inesperados puede aumentar el daño porque el backend podría terminar alcanzando servicios que:

- no están pensados para el mismo tipo de tráfico
- viven solo en red interna
- exponen administración
- responden distinto
- ofrecen más señales de reconocimiento
- no tienen la misma dureza que el servicio público esperado

### Idea útil

Aunque el host sea “legítimo”, el puerto puede convertir una request supuestamente inocente en acceso a otra clase de superficie.

---

## Validar solo puertos “obvios” tampoco siempre alcanza

Igual que con otros temas del bloque, una defensa simplista puede decir:

- “bloqueemos algunos puertos raros”
- “permitamos todo salvo unos pocos”

Eso puede ayudar un poco.
Pero no es lo ideal si la feature realmente necesita un conjunto pequeño y claro de puertos.

### Regla sana

Mejor preguntarte:
- “¿qué puertos sí necesita este caso de uso?”
que
- “¿qué puertos raros se me ocurre negar?”

### Idea importante

La lógica positiva suele ser más fuerte que la negativa también a nivel de puertos.

---

## El puerto también debería entrar en la allowlist

Esto conecta directamente con los temas anteriores.

Una allowlist sólida no debería responder solo:

- qué host está permitido

También conviene que pueda responder:

- con qué esquema
- y, cuando corresponda, con qué puerto

### Idea útil

Si el caso de uso tolera solo un tipo de servicio web bastante estándar, la allowlist debería reflejar esa precisión y no quedarse en el host.

---

## Redirects pueden cambiar el puerto

Esto merece una sección propia porque es una trampa muy común.

Aunque el destino inicial use un puerto aceptable, un redirect puede mandar al backend a:

- otro host
- otro esquema
- y también **otro puerto**

### Entonces la pregunta sana es

- ¿seguimos validando después del redirect?
- ¿el nuevo puerto sigue siendo legítimo?
- ¿el cliente HTTP lo sigue sin que nadie lo cuestione?

### Idea importante

Si solo validaste el primer puerto, el flujo puede escapar después sin demasiado ruido.

---

## DNS y puerto no compiten: se complementan

A veces el equipo mejora su defensa pensando en host y resolución DNS, pero sigue sin pensar en puertos.
Eso deja un análisis incompleto.

### Porque para el destino efectivo importa:
- a qué IP llegás
- y a qué puerto de esa IP entrás

### Regla sana

Resolver mejor el host no reemplaza revisar qué puertos permitís sobre ese destino.

---

## Puertos implícitos también deberían hacerse explícitos en tu modelo mental

Aunque no dejes que el usuario mande un puerto arbitrario, conviene que el equipo sea explícito sobre qué puertos considera válidos por defecto.

Por ejemplo, si el contrato de negocio es:

- “solo consumo web externa”

entonces el modelo mental debería ser algo como:

- esquemas concretos
- puertos esperados por esos esquemas
- nada más salvo caso de negocio muy justificado

### Idea importante

Lo implícito también debe entenderse.
Si no, queda como superficie invisible que nadie revisa.

---

## Persistencia y puertos configurables

Esto también importa cuando guardás destinos en base.

Por ejemplo:

- callback URL
- endpoint por tenant
- URL base de integración
- host de proveedor

Si la app permite guardar puertos variables, el riesgo no queda solo en el request actual.
Queda persistido en una configuración que luego el backend reutilizará muchas veces.

### Idea útil

Puerto variable persistido + request saliente automatizada suele merecer mucha revisión.

---

## Features admin y “test connection” merecen especial sospecha

Esto es especialmente cierto en herramientas internas.

Muchas veces un panel admin permite:

- probar conexión a un host
- guardar endpoint remoto
- validar reachability
- configurar callback o provider

Y la flexibilidad con puertos suele aparecer como “comodidad”.

### Problema

Ese tipo de tooling puede convertir al backend en un cliente muy potente para explorar servicios internos o inesperados si nadie acota bien:

- host
- esquema
- puerto
- redirects
- red alcanzada

### Regla sana

Las herramientas “de soporte” o “de integración” suelen tener más superficie de SSRF, no menos.

---

## No toda variación de puerto es ilegítima

También conviene no caricaturizar.

Hay casos donde cierto rango o conjunto de puertos puede estar justificado por la integración.
Pero eso debería poder contarse claramente.

### Preguntas sanas

- ¿por qué esta feature necesita puertos variables?
- ¿qué clientes reales los usan?
- ¿qué superficie adicional abre?
- ¿cómo se controla?
- ¿qué puertos serían inaceptables para este caso de uso?

### Idea importante

No se trata de prohibir por deporte.
Se trata de que la variación de puerto exista por necesidad real y no por dejar el destino demasiado abierto.

---

## Puerto y tipo de servicio van de la mano

Otra forma útil de pensarlo es esta:

cuando permitís un puerto, no solo permitís un número.
También estás permitiendo potencialmente otra clase de servicio detrás de ese número.

### Idea útil

Por eso la revisión de puertos debería hacerse con mentalidad de:
- “¿qué servicio estoy habilitando?”
y no solo de:
- “¿qué sintaxis de URL estoy aceptando?”

---

## Qué preguntas conviene hacer en revisión

Cuando revises una feature saliente, conviene preguntar:

- ¿el puerto puede venir explícito?
- ¿qué pasa si no viene?
- ¿qué puerto implícito asume el sistema?
- ¿esa feature necesita puertos variables o no?
- ¿el host permitido expone más cosas en otros puertos?
- ¿hay redirects que cambian el puerto?
- ¿la allowlist incluye el puerto o solo el host?
- ¿qué pasaría si esta misma salida llegara al puerto equivocado de un servicio legítimo?
- ¿qué servicios internos serían peligrosos si un puerto inesperado quedara alcanzable?
- ¿qué parte del equipo nunca pensó explícitamente esta dimensión?

### Regla sana

Si nadie puede explicar qué puertos son legítimos para una funcionalidad, ya hay una superficie innecesariamente borrosa.

---

## Cómo reconocer este problema en una codebase Spring

En una app Spring, conviene sospechar especialmente cuando veas:

- callbacks o URLs configurables con puertos arbitrarios
- validación que ignora el puerto
- allowlists de host sin restricciones de puerto
- features de preview o importación que aceptan destinos casi libres
- follow redirects sin revalidar puerto
- paneles admin con “test connection”
- componentes genéricos que parsean URLs pero no modelan puertos como parte de la política
- defensa muy centrada en dominio y DNS, pero ciega al puerto final

### Idea útil

Si el puerto no aparece en el modelo de decisión, probablemente esté apareciendo en la superficie de riesgo.

---

## Qué conviene revisar en una app Spring

Cuando revises puertos explícitos e implícitos en destinos salientes en una aplicación Spring, mirá especialmente:

- si la URL permite puerto explícito
- qué puertos implícitos se usan por defecto
- si la validación mira host y esquema, pero no puerto
- si la allowlist contempla también el puerto
- si redirects pueden cambiarlo
- si el destino se persiste con puerto configurable
- si hay herramientas admin o integraciones con mucha flexibilidad
- qué servicios internos o auxiliares viven en otros puertos del mismo host
- si el negocio realmente necesita variación de puerto

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- menos puertos variables sin necesidad
- puertos explícitamente modelados cuando importan
- allowlists más precisas
- más conciencia de que host no alcanza por sí solo
- redirects controlados también en esta dimensión
- mejor alineación entre caso de uso y tipo real de servicio alcanzable

---

## Señales de ruido

Estas señales merecen revisión rápida:

- el puerto no aparece en ninguna discusión de seguridad
- la allowlist mira solo host
- callbacks o integraciones aceptan puertos arbitrarios “por flexibilidad”
- el equipo asume que `http/https` ya lo resuelve todo
- nadie revisó qué otros servicios viven en puertos distintos del mismo host
- redirects cambian el puerto y nadie lo revalida
- el modelo de negocio nunca pidió esa amplitud, pero la tecnología la dejó abierta igual

---

## Checklist práctico

Cuando revises este tema, preguntate:

- ¿la feature acepta puerto explícito?
- ¿qué puerto implícito usa cuando no se indica?
- ¿esa funcionalidad necesita puertos variables?
- ¿la allowlist contempla host y puerto o solo host?
- ¿qué pasa si un redirect cambia el puerto?
- ¿qué servicio distinto podría tocar el backend en el mismo host?
- ¿qué puertos son legítimos para el caso de uso?
- ¿cuáles nunca deberían estar permitidos?
- ¿qué riesgo agrega persistir destinos con puerto configurable?
- ¿qué cambio harías primero para que el puerto deje de ser un detalle invisible?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Qué features permiten destinos con puerto explícito?
2. ¿Cuáles usan puertos implícitos que nadie pensó demasiado?
3. ¿La validación hoy revisa el puerto o lo ignora?
4. ¿Qué host permitido podría exponer servicios sensibles en otros puertos?
5. ¿Hay redirects que cambien el puerto?
6. ¿Qué herramienta admin o integración te preocupa más por esta flexibilidad?
7. ¿Qué restricción agregarías primero para alinear mejor puertos permitidos con el caso de uso real?

---

## Resumen

En SSRF, el puerto también forma parte del destino saliente y puede cambiar mucho el riesgo de una conexión.

No alcanza con validar:

- host
- esquema
- dominio
- DNS

si después el backend todavía puede terminar llegando a:

- otros servicios del mismo host
- puertos administrativos
- métricas
- Actuator
- herramientas internas
- endpoints distintos de los que el caso de uso realmente necesitaba

En resumen:

> un backend más maduro no trata el puerto como un detalle técnico oculto dentro de la URL ni supone que host y esquema ya cuentan toda la historia.  
> También modela qué puertos son legítimos para cada funcionalidad, porque entiende que en SSRF no solo importa a qué máquina llega la request, sino a qué servicio concreto entra dentro de esa máquina o de esa IP, y que dejar esa dimensión abierta o implícita sin revisión es otra forma muy común de ampliar la superficie saliente más allá de lo que el negocio realmente quería permitir.

---

## Próximo tema

**Por qué no conviene usar clientes HTTP genéricos sin restricciones**
