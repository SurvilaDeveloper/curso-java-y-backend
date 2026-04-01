---
title: "Límites de contexto como base para separar servicios"
description: "Cómo usar bounded contexts y fronteras de dominio como criterio real para separar servicios, por qué una mala partición rompe más de lo que resuelve y qué señales ayudan a encontrar límites más sanos."
order: 154
module: "Microservicios y sistemas distribuidos"
level: "intermedio"
draft: false
---

## Introducción

Después de ver **cuándo un monolito deja de alcanzar de verdad**, de distinguir **señales reales y señales falsas**, y de entender los **costos ocultos de microservicios**, aparece una pregunta decisiva:

**si de verdad vamos a separar algo, ¿por dónde se parte?**

Ésta es probablemente una de las decisiones más delicadas de toda una descomposición.

Porque un sistema distribuido no se rompe solo por tener mala infraestructura.
Muchas veces se rompe antes, en una capa más conceptual:

- se separaron fronteras equivocadas
- se partió según tablas y no según negocio
- se usaron límites organizacionales temporales como si fueran límites del dominio
- se dividió por “funciones técnicas” demasiado genéricas
- se partió una misma regla de negocio entre varios servicios
- se dejaron datos y decisiones importantes repartidos en lugares que deberían haber permanecido juntos

En otras palabras:

**no alcanza con decidir que habrá varios servicios.**
La pregunta crítica es:

**qué parte del negocio vive junta, qué parte puede vivir separada, y dónde están las fronteras que minimizan fricción conceptual, operativa y evolutiva.**

Ahí entra la idea de **límite de contexto**.

Este tema trata justamente de eso:

cómo usar los límites de contexto como base para separar servicios **con criterio de dominio**, en lugar de separar por moda, intuición vaga o estructura accidental del código actual.

## El problema de separar sin entender el dominio

Una descomposición mal hecha suele empezar así:

- “armemos un servicio de usuarios”
- “otro de productos”
- “otro de pagos”
- “otro de órdenes”
- “otro de notificaciones”
- “otro de reportes”

Suena razonable.
A veces incluso parece ordenado.

Pero la pregunta no es si esos nombres suenan bien.
La pregunta es otra:

**¿esas fronteras representan de verdad contextos de negocio relativamente coherentes, o son solo etiquetas conocidas puestas sobre un problema todavía no entendido?**

Porque si la respuesta es la segunda, empiezan los problemas típicos:

- servicios que se llaman entre sí para completar una sola regla básica
- lógica duplicada en varios lugares
- ownership confuso
- datos que deberían estar juntos pero quedaron repartidos
- cambios de negocio que obligan a coordinar demasiados equipos
- contratos que se vuelven inestables porque el límite inicial era artificial

Separar sin entender bien el dominio es como cortar una máquina compleja sin saber qué piezas forman una misma función.
Tal vez logres dividirla.
Pero no necesariamente logres que siga funcionando con menos fricción.

## Qué significa “límite de contexto” en este escenario

La idea viene de bounded contexts en Domain-Driven Design, pero no hace falta ponerse académico para captarla.

Un límite de contexto intenta responder algo bastante concreto:

**¿dónde un conjunto de reglas, conceptos, lenguaje y decisiones forma una unidad suficientemente coherente como para evolucionar con cierta autonomía?**

Dicho más simple:

un contexto es una zona del sistema donde:

- ciertas reglas de negocio viven naturalmente juntas
- ciertos términos tienen un significado claro y específico
- ciertas decisiones deberían tomarse cerca unas de otras
- cierto modelo mental del dominio tiene sentido local
- cierta parte del lenguaje del negocio deja de significar exactamente lo mismo que en otra parte

Eso es muy importante.

Porque una misma palabra puede significar cosas distintas según el contexto.

Por ejemplo:

- “cliente” no siempre significa lo mismo en identidad, billing y soporte
- “orden” no siempre significa lo mismo en checkout, fulfillment y reporting
- “producto” no siempre significa lo mismo en catálogo, pricing e inventario
- “usuario” no siempre significa lo mismo en autenticación, permisos y CRM

Cuando forzás un único modelo para todas esas visiones, el sistema suele empezar a deformarse.

## Separar servicios no es lo mismo que dibujar carpetas

Éste es un error muy común.

Un equipo mira su código actual, ve paquetes o carpetas como:

- `users`
- `orders`
- `payments`
- `notifications`

Y concluye:

“listo, cada carpeta será un servicio”.

Eso puede salir bien por casualidad.
Pero como criterio general es flojo.

Porque la estructura actual del código puede reflejar:

- historia del proyecto
- decisiones apuradas
- conveniencia técnica del momento
- separación por capas y no por dominio
- naming heredado
- límites que ya están deteriorados

Entonces, convertir paquetes existentes en servicios es peligroso si antes no verificaste que esos paquetes realmente representen contextos sanos.

La frontera correcta no debería salir solo de cómo hoy está ordenado el repositorio.
Debería salir de entender:

- qué reglas cambian juntas
- qué datos necesitan consistencia fuerte entre sí
- qué lenguaje del negocio comparten
- qué operaciones deben permanecer locales
- qué parte del sistema tiene sentido operar como unidad

## Una buena frontera junta lo que cambia junto

Ésta es una heurística valiosísima.

Cuando buscás límites de contexto, una pregunta útil es:

**¿qué cosas cambian juntas de manera frecuente y significativa?**

Si dos reglas cambian casi siempre al mismo tiempo, quizá pertenezcan al mismo contexto.
Si dos conceptos requieren coordinación permanente para una operación central, quizá todavía no convenga separarlos.
Si una misma decisión de negocio se reparte entre dos servicios, probablemente el límite sea malo.

En cambio, un límite sano suele mostrar que:

- dentro del contexto hay bastante coherencia interna
- fuera del contexto hay menos necesidad de coordinación fina
- los cambios importantes no cruzan la frontera todo el tiempo
- las reglas principales pueden mantenerse localmente sin demasiadas idas y vueltas

No significa “cero dependencia”.
Eso casi nunca existe.
Significa algo más realista:

**dependencias aceptables sin romper la integridad conceptual del dominio.**

## Una buena frontera protege lenguaje, modelo y decisiones

Además de mirar qué cambia junto, conviene mirar otra cosa:

**qué decisiones de negocio deberían permanecer cerca entre sí para que el modelo siga siendo claro.**

Un contexto sano protege:

- su vocabulario principal
- sus invariantes importantes
- sus criterios de validez
- sus estados relevantes
- sus reglas de transición
- sus decisiones locales

Cuando eso queda demasiado repartido, aparecen modelos frágiles.

Por ejemplo:

- el estado “aprobado” se decide en un servicio, pero las condiciones reales de aprobación están dispersas en otros dos
- el stock se “descuenta” en un lado, pero la reserva real se interpreta distinto en otro
- una “orden confirmada” significa una cosa en checkout y otra distinta en fulfillment, sin una frontera clara entre ambas visiones

El resultado es mala coordinación conceptual.
Y eso, en sistemas distribuidos, después explota como:

- contratos ambiguos
- bugs difíciles de reproducir
- eventos difíciles de interpretar
- soporte confuso
- discusiones eternas entre equipos sobre quién es dueño de qué

## Partir por entidades es tentador, pero a veces engaña

Otro error clásico es separar por entidad nominal.

Por ejemplo:

- servicio de usuario
- servicio de orden
- servicio de producto
- servicio de pago

A veces esto funciona.
Pero muchas veces no.

Porque una entidad visible no necesariamente coincide con un bounded context.

Un `Producto`, por ejemplo, puede estar involucrado en:

- catálogo
- pricing
- promociones
- inventario
- recomendaciones
- reporting

¿Eso significa que todo debe vivir en el mismo servicio?
No.
Pero sí significa que “producto” probablemente no sea una frontera suficiente por sí sola.

Hay que distinguir entre:

- **la entidad que aparece en muchas áreas**
- **el contexto que decide algo específico sobre esa entidad**

Tal vez catálogo sea dueño de la descripción comercial.
Tal vez pricing sea dueño del precio vigente.
Tal vez inventario sea dueño de la disponibilidad física.
Tal vez recomendaciones use proyecciones derivadas.

La entidad parece la misma.
Pero el ownership real cambia según el contexto.

## Un mal límite se detecta porque obliga a demasiada conversación para hacer algo básico

Ésta es otra señal muy poderosa.

Si una operación central y frecuente necesita demasiada coordinación entre servicios, hay una sospecha fuerte sobre el límite.

Por ejemplo, si para confirmar una compra común necesitás:

1. pedir validación a un servicio
2. consultar estado a otro
3. resolver reglas centrales en un tercero
4. volver al primero para persistir
5. emitir eventos que otros reinterpretan distinto

entonces tal vez no repartiste bien las responsabilidades.

No todo flujo distribuido es señal de error.
Algunos casos realmente requieren colaboración entre contextos.

Pero cuando el flujo básico del negocio queda atomizado en exceso, suele pasar algo de esto:

- el límite está mal trazado
- la operación fue separada demasiado pronto
- la consistencia requerida es mayor que la aceptable para esa frontera
- o el contexto principal todavía no está bien entendido

Una buena separación no elimina la comunicación.
Pero sí evita que lo trivial se vuelva una negociación distribuida permanente.

## La frontera correcta no siempre coincide con el organigrama

Muchos equipos separan servicios según cómo está organizada la empresa hoy.

Por ejemplo:

- equipo A → servicio A
- equipo B → servicio B
- equipo C → servicio C

Eso puede tener sentido parcial.
Pero también puede ser una trampa.

Porque la organización cambia más rápido que el dominio.

Si partís solo por la estructura actual del equipo, podés terminar con servicios definidos por:

- reparto político
- urgencias de staffing
- límites temporales
- nombres de squads que en seis meses ya no existen

Lo más sano es buscar una alineación razonable entre:

- contexto de negocio
- ownership técnico
- autonomía operativa

Pero en ese orden.

No primero el organigrama y después el dominio a la fuerza.

## Ejemplo intuitivo: e-commerce

Imaginá un e-commerce relativamente grande.

A primera vista podrías pensar en separar:

- productos
- órdenes
- pagos
- envíos
- usuarios
- promociones

Pero si mirás mejor, quizás descubras algo más fino.

### Catálogo

Puede ser dueño de:

- título
- descripción
- atributos comerciales
- imágenes
- categorías
- visibilidad comercial

### Pricing

Puede ser dueño de:

- precio vigente
- listas de precio
- reglas promocionales
- descuentos aplicables
- vigencias

### Inventario

Puede ser dueño de:

- stock disponible
- stock reservado
- movimientos de inventario
- reglas de reserva y liberación

### Checkout / órdenes

Puede ser dueño de:

- armado de compra
- intención de orden
- confirmación transaccional
- estados del pedido
- relación con pago y fulfillment

### Fulfillment / logística

Puede ser dueño de:

- preparación
- despacho
- tracking
- devolución operativa

Notá algo importante:

“producto” aparece en varios lados.
Pero el contexto no se decide por repetir la palabra producto.
Se decide por **qué parte del problema está modelando cada área**.

Eso permite una conversación mucho más madura sobre qué separar y qué no.

## Un contexto sano tiene ownership claro

Una frontera útil también ayuda a responder una pregunta muy concreta:

**¿quién decide la verdad principal sobre este aspecto del negocio?**

Si la respuesta es difusa, el límite probablemente también lo sea.

Ownership claro no significa aislamiento absoluto.
Significa que, para cierto aspecto del dominio, hay un lugar donde vive la decisión principal.

Por ejemplo:

- identidad decide credenciales y autenticación
- autorización decide permisos y políticas
- billing decide estados de suscripción e invoices
- inventario decide disponibilidad operativa
- catálogo decide representación comercial del producto

Cuando dos servicios creen ser dueños de la misma verdad importante, empiezan las contradicciones.

Y cuando nadie es claramente dueño, empieza el desgaste organizacional.

## Cuidado con el falso desacople vía base de datos compartida

A veces un equipo dice que separó servicios, pero todos siguen escribiendo las mismas tablas o dependen de joins cruzados entre bases compartidas.

Eso suele indicar que el límite todavía no está realmente resuelto.

Porque si para que un servicio funcione necesita:

- leer estructuras internas de otro
- depender del esquema interno de otro contexto
- interpretar estados que otro contexto cambia sin contrato claro
- consultar directamente datos ajenos para completar reglas centrales

entonces la frontera es, como mínimo, dudosa.

Una base compartida puede ser una etapa transitoria en ciertas migraciones.
Pero como diseño estable, muchas veces delata que la separación conceptual no terminó de ocurrir.

## Qué preguntas ayudan a encontrar un buen límite

Acá van preguntas especialmente útiles.

## 1. ¿Qué lenguaje del negocio deja de significar exactamente lo mismo al cruzar esta frontera?

Si el lenguaje cambia de sentido, puede haber un bounded context.

## 2. ¿Qué reglas deberían permanecer juntas para no fragmentar una decisión importante?

Eso ayuda a proteger invariantes e integridad conceptual.

## 3. ¿Qué datos requieren consistencia fuerte dentro de una misma operación?

Si necesitás consistencia inmediata y frecuente entre dos zonas, quizá todavía convenga mantenerlas más cerca.

## 4. ¿Qué parte del sistema puede cambiar a otro ritmo sin arrastrar a la otra?

Eso ayuda a evaluar autonomía real.

## 5. ¿Qué equipo puede hacerse cargo de extremo a extremo de esta frontera?

Sin ownership operativo, el límite técnico se vuelve frágil.

## 6. ¿Qué interacciones entre contextos serían esperables y cuáles serían sospechosamente frecuentes?

Si la conversación entre servicios sería constante para resolver lo básico, hay olor a mal límite.

## 7. ¿Dónde vive la verdad principal de cada decisión relevante?

Eso evita duplicación y conflictos de autoridad.

## No todos los contextos deben convertirse en servicios ya mismo

Éste es otro punto clave.

Descubrir bounded contexts útiles no obliga automáticamente a desplegarlos como servicios independientes.

Podés tener contextos bien diferenciados dentro de:

- un monolito modular
- un monorepo
- una misma aplicación desplegable
- un conjunto de módulos con fronteras fuertes pero runtime compartido

De hecho, muchas veces **conviene descubrir y reforzar los límites primero dentro del monolito**, antes de distribuirlos por red.

Eso da varias ventajas:

- validás si el límite conceptual realmente funciona
- reducís el costo de corregir errores de partición
- clarificás ownership
- estabilizás contratos internos
- entendés mejor qué datos y reglas pertenecen a cada zona

Recién después, si aparecen razones de escalado, aislamiento o autonomía operativa, podés extraer un servicio con mucha más madurez.

## Una mala frontera se corrige caro

Éste es un motivo fuerte para tomarse el tema en serio.

Corregir un paquete mal nombrado dentro de un monolito duele.
Corregir una mala frontera entre servicios duele mucho más.

Porque una vez distribuido, entran en juego:

- contratos remotos
- eventos ya consumidos por otros
- ownership ya asignado
- pipelines separados
- despliegues independientes
- dashboards y alertas específicos
- expectativas del negocio y del equipo

Entonces, una mala partición no es solo una incomodidad de diseño.
Puede transformarse en una deuda arquitectónica muy costosa.

## Idea final

Separar servicios con criterio no empieza preguntando “qué piezas técnicas tengo”, sino algo más profundo:

**qué partes del negocio forman contextos suficientemente coherentes como para vivir con autonomía razonable sin destruir claridad, consistencia y ownership.**

Los límites de contexto importan porque ayudan a evitar separaciones superficiales.
Permiten encontrar fronteras más sanas mirando:

- lenguaje del dominio
- reglas que cambian juntas
- decisiones que deben permanecer locales
- ownership claro
- consistencia necesaria
- ritmos de cambio
- patrones de colaboración razonables

Sin esa base, los microservicios suelen heredar el caos del monolito y además sumarle:

- latencia
- fallos distribuidos
- debugging más difícil
- contratos frágiles
- más costo operativo

Dicho simple:

**antes de repartir procesos, conviene entender bien dónde termina realmente una parte del dominio y empieza otra.**

## Lo que sigue

Ahora que ya viste **por qué los límites de contexto son la base real para separar servicios**, el siguiente paso es entrar en una consecuencia directa de esta decisión:

**la comunicación síncrona entre servicios.**

Porque una vez que las fronteras existen, aparece otra pregunta decisiva:

cómo hacer que los servicios colaboren sin convertir cada operación en una cadena frágil de llamadas remotas.
