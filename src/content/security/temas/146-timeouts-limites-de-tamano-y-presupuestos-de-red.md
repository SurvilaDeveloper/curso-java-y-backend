---
title: "Timeouts, límites de tamaño y presupuestos de red"
description: "Cómo pensar timeouts, límites de tamaño y presupuestos de red al diseñar requests salientes en una aplicación Java con Spring Boot. Por qué no alcanza con validar el destino y qué controles ayudan a evitar que una feature remota consuma más tiempo, ancho de banda o recursos de los que el negocio realmente necesita."
order: 146
module: "Consumo saliente, SSRF y conexiones externas"
level: "base"
draft: false
---

# Timeouts, límites de tamaño y presupuestos de red

## Objetivo del tema

Entender por qué, en una aplicación Java + Spring Boot, **no alcanza con validar el destino** de una request saliente si después esa request puede:

- tardar demasiado
- descargar demasiado
- reintentar demasiado
- o consumir más red y recursos de los que la feature realmente necesita

La idea de este tema es sumar una capa muy práctica al bloque de SSRF y consumo remoto.

Hasta ahora venimos hablando mucho de preguntas como:

- ¿a qué host sale el backend?
- ¿qué esquema acepta?
- ¿qué pasa con redirects?
- ¿qué cliente HTTP usamos?
- ¿qué señales de error devolvemos?

Todo eso es importante.
Pero todavía falta otra parte:

> aun cuando el destino sea relativamente legítimo, una request saliente puede volverse demasiado costosa si el sistema no limita bien **cuánto tiempo**, **cuánto contenido** y **cuánto presupuesto de red** le deja consumir.

En resumen:

> la seguridad saliente no consiste solo en decidir a dónde puede ir el backend.  
> También consiste en decidir **cuánto esfuerzo** estamos dispuestos a dejar que gaste una feature para llegar, esperar, descargar o insistir.

---

## Idea clave

Una feature saliente no solo consume confianza.
También consume recursos.

Cada request remota puede gastar cosas como:

- tiempo de CPU esperando
- sockets
- hilos o capacidad async
- memoria para buffers
- ancho de banda
- espacio si se persiste
- retries
- tiempo total del worker
- presupuesto del proveedor o del sistema

La idea central es esta:

> toda request saliente necesita no solo una política de destino, sino también una política de **presupuesto**.

Es decir:
- cuánto puede esperar
- cuánto puede leer
- cuántas veces puede reintentar
- cuántos redirects puede seguir
- y cuánto impacto puede tener sobre el sistema si el remoto responde lento, enorme o malicioso

### Idea importante

En consumo remoto, controlar el destino sin controlar el costo sigue dejando una superficie muy real de abuso y degradación.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- tener validación razonable de host pero sin timeouts sanos
- permitir descargas enormes para features que solo necesitaban metadata mínima
- dejar retries muy generosos en flows sensibles
- no separar una request “ligera” de una importación costosa
- hacer previews o test connections con tiempos excesivos
- permitir que un remoto lento o muy pesado degrade workers, colas o threads
- no modelar cuánto de la red del backend está dispuesto a gastar cada feature
- pensar solo en SSRF como reachability y no como consumo de recursos

Es decir:

> el problema no es solo que el backend pueda hablar con destinos indebidos.  
> El problema también es que incluso destinos legítimos pueden consumir demasiado si no hay límites claros.

---

## Error mental clásico

Un error muy común es este:

### “Si el host ya es aceptable, ya resolvimos lo importante”

Eso es demasiado optimista.

Porque todavía quedan preguntas como:

- ¿cuánto esperamos para conectar?
- ¿cuánto esperamos para leer?
- ¿cuántos bytes estamos dispuestos a descargar?
- ¿seguimos leyendo aunque ya teníamos suficiente?
- ¿cuántas veces reintentamos?
- ¿cuánto tiempo total puede tomar este flujo?
- ¿cuántos recursos locales le dejamos consumir?

### Idea importante

Un destino aceptable no vuelve automáticamente aceptable cualquier costo de interacción con ese destino.

---

## Qué significa timeout en este contexto

Cuando hablamos de timeouts acá, la intuición útil es simple:

> no queremos que una request saliente pueda quedarse consumiendo tiempo del sistema mucho más allá de lo que el caso de uso justifica.

Eso incluye distintas dimensiones como:

- tiempo para conectar
- tiempo para recibir datos
- tiempo total de operación
- tiempo acumulado incluyendo retries
- tiempo de un worker o job completo

### Idea útil

No toda espera larga es un bug.
Pero una espera larga sin contrato claro suele ser una deuda peligrosa en flujos salientes.

---

## Qué significa límite de tamaño

Los límites de tamaño responden a otra pregunta básica:

> ¿cuánto contenido estamos dispuestos a aceptar de ese remoto antes de cortar, rechazar o tratar el flujo como inválido?

Eso importa mucho en features como:

- previews
- descarga de imágenes
- importación de PDFs
- fetch de documentos
- scrapers
- callbacks que devuelven body inesperado
- pruebas de conectividad que, por accidente, leen más de la cuenta

### Idea importante

Si la feature necesitaba solo:
- saber si el host responde
o
- leer unos pocos metadatos

entonces dejarla descargar megabytes o decenas de megabytes es regalar superficie sin necesidad.

---

## Qué significa “presupuesto de red”

Esta es la idea integradora del tema.

Un presupuesto de red es, conceptualmente, un límite razonable sobre cuánto:

- tiempo
- ancho de banda
- tamaño
- retries
- conexiones
- redirects
- procesamiento asociado

puede gastar una feature para cumplir su objetivo.

### Regla sana

No todas las features merecen el mismo presupuesto.

No es lo mismo:
- un preview de link
que
- una importación documental
que
- un webhook saliente
que
- una sincronización administrativa controlada

### Idea importante

Si todas comparten el mismo presupuesto generoso, muchas quedan sobredimensionadas y más fáciles de abusar.

---

## Una feature pequeña no debería tener presupuesto de crawler

Esta es una intuición muy útil.

Un preview, un “test connection” o una verificación de callback suelen necesitar algo pequeño:

- conectar rápido
- leer poco
- responder pronto
- fallar rápido si algo no cuadra

Si esa misma feature hereda presupuestos de:

- múltiples retries
- tiempos largos
- cuerpos enormes
- redirects libres
- lecturas profundas
- parsing costoso

entonces quedó sobredimensionada.

### Regla sana

La capacidad saliente debería parecerse al caso de uso, no a una herramienta universal de scraping o ingestión.

---

## El remoto lento también es parte del riesgo

A veces el equipo piensa solo en destinos internos o prohibidos.
Pero un destino legítimo también puede ser problemático si responde:

- muy lento
- en streaming indefinido
- con cuerpos enormes
- con redirects encadenados
- con respuestas que fuerzan a consumir demasiado

### Idea importante

No hace falta que el remoto sea “malicioso” en sentido clásico.
Alcanza con que sea lento, pesado o impredecible para que una feature sin límites degrade bastante al backend.

---

## Descargas grandes y previews: mala combinación

Esto merece una sección propia porque es muy común.

Una feature de preview o extracción de metadata suele necesitar muy poco.
Pero si la implementación descarga demasiado antes de decidir, puede terminar:

- leyendo HTML enorme
- descargando recursos secundarios
- reteniendo buffers grandes
- gastando ancho de banda inútil
- demorando workers y colas

### Idea útil

Cuando la necesidad de negocio es pequeña, cualquier descarga grande ya es una señal de diseño poco disciplinado.

---

## PDFs, imágenes y archivos: donde el tamaño pega fuerte

En importaciones remotas, el tamaño importa todavía más.

Porque además de descargar, la app puede:

- persistir
- transformar
- indexar
- generar thumbnails
- hacer OCR
- extraer metadata

### Idea importante

Un límite de tamaño no solo protege la red.
También protege todo el pipeline posterior que depende de ese contenido remoto.

---

## Retry automático sin presupuesto claro = amplificación

Otra zona delicada son los retries.

Un retry puede ser razonable si mejora robustez.
Pero si nadie lo acota bien, puede convertir una request ya costosa en varias requests costosas.

### Problemas típicos

- varios intentos largos
- tiempos acumulados enormes
- workers ocupados demasiado tiempo
- misma superficie de reachability ejercida repetidamente
- presión innecesaria sobre el remoto o sobre tu propio sistema

### Regla sana

Retry sin presupuesto explícito suele ser más capacidad de red de la que la feature necesitaba.

---

## Los redirects también consumen presupuesto

Ya vimos los riesgos de seguridad de los redirects.
Acá sumamos otra mirada:

cada redirect también gasta:

- tiempo
- conexiones
- resolución
- y posibilidad de lectura adicional

### Idea importante

Una política de redirects no debería pensarse solo en términos de:
- “¿a dónde me puede mandar?”

También en términos de:
- “¿cuánto presupuesto adicional estoy dejando que se gaste en ese recorrido?”

---

## Timeouts demasiado altos: falsa sensación de robustez

A veces el equipo sube timeouts para “hacer el sistema más tolerante”.
Eso puede resolver problemas puntuales.
Pero también puede dejar requests salientes consumiendo recursos mucho más tiempo del debido.

### Idea útil

Robustez no siempre significa “esperar más”.
A veces significa:
- fallar antes
- cortar mejor
- aislar mejor
- y no dejar que una integración periférica robe presupuesto a todo el sistema

### Regla sana

Cuando el caso de uso es liviano, timeouts muy altos suelen ser más deuda que resiliencia.

---

## El tiempo total importa más que el timeout individual

Otra trampa común es mirar solo un número, por ejemplo:
- timeout de conexión
o
- timeout de lectura

Pero el costo real puede venir de la suma de:

- resolución
- conexión
- lectura
- redirects
- retries
- validación posterior
- procesamiento del contenido
- escritura en storage

### Idea importante

El presupuesto real de una feature saliente es acumulativo.
No lo mide solo un timeout aislado.

---

## Workers y jobs necesitan presupuestos todavía más claros

En procesos async o background, a veces el equipo relaja límites porque “no afecta al request web”.
Eso puede ser cierto parcialmente.
Pero igual afecta:

- colas
- throughput
- concurrencia
- costos
- retries
- capacidad operativa
- tiempo de procesamiento total

### Regla sana

Que una feature corra en background no justifica dejarla gastar red y tiempo sin una política clara.

---

## El presupuesto también es una decisión de producto

Esto es importante.

No todo límite se decide solo desde infraestructura.
También hay una pregunta de producto:

- ¿qué experiencia queremos ofrecer?
- ¿qué estamos dispuestos a tolerar para esa comodidad?
- ¿qué clase de importación o preview prometimos realmente?

### Idea útil

Una feature que promete demasiado “te traemos cualquier cosa, aunque tarde lo que tarde” suele empujar a un presupuesto demasiado amplio.
A veces la solución no es solo técnica.
También es ajustar el contrato del feature.

---

## No toda feature necesita leer el recurso completo

Otra mejora mental muy útil es esta:

muchas veces el backend no necesita:
- leer todo
- esperar todo
- descargar todo

A veces le alcanza con:
- confirmar existencia
- leer cabeceras
- extraer muy poca metadata
- cortar al primer umbral útil
- rechazar rápido si el recurso ya se sale del contrato

### Idea importante

Cuanto antes sepas que el recurso o el destino no sirven para el caso de uso, antes deberías cortar.
Seguir leyendo “por las dudas” suele ser costo innecesario.

---

## Presupuesto chico también ayuda a reducir valor ofensivo

Esto conecta con SSRF directamente.

Cuanto más limitado es el presupuesto de red:

- menos exploración puede hacer una feature
- menos tiempo tiene para observar diferencias
- menos contenido puede exfiltrar
- menos se puede degradar al sistema
- menos fácil es usarla como sonda o importador general

### Regla sana

Un presupuesto chico no reemplaza una buena política de destino, pero sí reduce bastante el impacto práctico de varios abusos.

---

## Qué preguntas conviene hacer sobre una feature saliente

Cuando revises una feature remota, conviene preguntar:

- ¿cuánto tiempo debería poder tardar?
- ¿cuánto tiempo total puede gastar con retries y redirects?
- ¿cuántos bytes necesita de verdad?
- ¿qué tamaño máximo estamos dispuestos a aceptar?
- ¿cuántos redirects son tolerables?
- ¿cuántos retries son tolerables?
- ¿el caso de uso justifica ese presupuesto o heredó uno más amplio?
- ¿el worker o proceso que hace la salida tiene límites claros?
- ¿qué pasa si el remoto responde lento pero nunca del todo mal?
- ¿qué parte del contrato de producto debería ser más modesta para que el presupuesto sea más sano?

### Idea útil

El presupuesto de red debería salir del caso de uso, no del valor default más cómodo de una librería.

---

## Cómo reconocer este problema en una codebase Spring

En una app Spring, conviene sospechar especialmente cuando veas:

- timeouts muy altos o no explícitos
- clientes HTTP compartidos con defaults generosos
- retries poco visibles
- follow redirects sin límites claros
- descargas que leen todo antes de validar
- previews o test connections con presupuestos casi de importador
- jobs de fondo sin topes claros
- poca diferencia entre una request ligera y una ingestión pesada
- nadie puede explicar cuánto debería “costar” cada feature en tiempo y bytes

### Regla sana

Si una feature no tiene presupuesto explícito, probablemente esté usando el presupuesto implícito más cómodo del stack.
Y eso rara vez coincide con el ideal de seguridad y producto.

---

## Qué conviene revisar en una app Spring

Cuando revises timeouts, límites de tamaño y presupuestos de red en una aplicación Spring, mirá especialmente:

- timeouts de conexión y lectura
- tiempo total esperado por feature
- políticas de redirects
- políticas de retry
- límites de tamaño por tipo de flujo
- qué tanto se descarga antes de decidir si algo sirve
- diferencias entre web request y workers de fondo
- qué clientes HTTP comparten defaults
- qué features heredaron más presupuesto del necesario
- qué flujo sería el más costoso si un remoto responde lento, enorme o intencionalmente molesto

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- presupuestos más pequeños y explícitos
- timeouts acordes al caso de uso
- límites de tamaño razonables
- retries más controlados
- redirects más acotados
- menos descarga innecesaria
- mejor separación entre features livianas e importaciones pesadas
- más alineación entre UX real y costo permitido

### Idea importante

Una feature madura no solo sabe adónde puede ir.
También sabe cuánto está dispuesta a gastar para llegar.

---

## Señales de ruido

Estas señales merecen revisión rápida:

- timeouts altos “por si acaso”
- tamaños máximos vagos o inexistentes
- retries generosos como default
- previews que descargan demasiado
- importadores remotos sin topes claros
- workers que esperan muchísimo
- redirects libres sin costo modelado
- nadie sabe cuál es el presupuesto razonable de cada feature
- el sistema se diseñó para “hacer lo posible” y no para “hacer lo suficiente”

### Regla sana

Cuanto más abierta está la tolerancia de tiempo y bytes, más fácil es que una feature remota se vuelva superficie de abuso o degradación.

---

## Checklist práctico

Cuando revises este tema, preguntate:

- ¿qué timeout real necesita esta feature?
- ¿cuánto puede tardar en total?
- ¿qué tamaño máximo debería aceptar?
- ¿cuántos redirects y retries tolera?
- ¿el presupuesto actual refleja el negocio o defaults heredados?
- ¿qué parte del flujo sigue leyendo o esperando de más?
- ¿qué worker o proceso podría degradarse primero?
- ¿qué abuso sería más fácil hoy: consumo de tiempo, bytes o ambos?
- ¿qué límite podrías bajar ya sin romper demasiado la UX?
- ¿qué feature se parece hoy más a un importador universal sin presupuesto que a una operación controlada?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Qué feature saliente tiene el timeout más alto?
2. ¿Cuál descarga más contenido?
3. ¿Cuál reintenta más?
4. ¿Qué parte de ese presupuesto está realmente justificada?
5. ¿Qué flujo liviano heredó costos de uno pesado?
6. ¿Qué worker te preocupa más si un remoto responde lento o enorme?
7. ¿Qué cambio harías primero para alinear mejor el presupuesto de red con el caso de uso real?

---

## Resumen

En consumo saliente y SSRF, no alcanza con decidir bien el destino.
También importa cuánto tiempo, ancho de banda y esfuerzo local puede consumir una feature para interactuar con ese destino.

Por eso conviene pensar en:

- timeouts
- límites de tamaño
- retries
- redirects
- presupuesto total por flujo
- y separación entre casos ligeros y casos pesados

En resumen:

> un backend más maduro no trata cada request saliente como si pudiera gastar indefinidamente red, tiempo y recursos solo porque el destino parecía legítimo o porque la librería lo tolera.  
> También define presupuestos claros por funcionalidad, porque entiende que la seguridad saliente no se rompe solo cuando el backend llega a donde no debía, sino también cuando una feature pequeña se comporta como una operación demasiado costosa, demasiado paciente o demasiado hambrienta de bytes, y termina ofreciéndole a un remoto lento, pesado o malicioso mucho más poder de desgaste y reconocimiento del que el negocio realmente quería permitir.

---

## Próximo tema

**Actuator, admin panels y servicios internos alcanzables por SSRF**
