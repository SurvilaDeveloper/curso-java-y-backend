---
title: "Fallbacks, reintentos y degradación controlada"
description: "Cómo pensar la reacción de un backend cuando una dependencia externa falla, y por qué los fallbacks, los reintentos y la degradación controlada son claves para sostener resiliencia sin colapsar el sistema."
order: 88
module: "Integraciones y sistemas reales"
level: "intermedio"
draft: false
---

## Introducción

Cuando un backend depende de sistemas externos, una de las preguntas más importantes no es solo:

**¿cómo llamo a esa API?**

También hay que preguntarse:

**¿qué hago cuando falla?**

Y esa falla puede tomar muchas formas:

- timeout
- error temporal de red
- proveedor caído
- respuesta inválida
- rate limit
- lentitud extrema
- autenticación vencida
- contrato cambiado
- error intermitente
- degradación parcial del servicio

Si no pensás esto de antemano, tu sistema puede reaccionar mal:

- quedarse esperando demasiado
- reintentar sin control
- saturar aún más al proveedor
- romper la experiencia del usuario
- duplicar operaciones
- bloquear flujos enteros
- propagar la falla a otras partes del sistema

Por eso en esta lección vamos a trabajar tres ideas muy importantes:

- **reintentos**
- **fallbacks**
- **degradación controlada**

## Por qué este tema importa tanto

Porque en sistemas reales las dependencias externas fallan.

No a veces como una rareza extraordinaria, sino como parte normal de operar software en red.

Puede fallar:

- una API externa
- un proveedor de pagos
- un sistema de emails
- un storage
- una integración logística
- un servicio interno separado
- una base secundaria
- una cola o broker
- una validación remota

La diferencia entre un sistema frágil y uno más resiliente no es que uno nunca falla.

La diferencia suele estar en:

**cómo reacciona cuando algo falla.**

## Qué es un reintento

Un reintento es volver a ejecutar una operación que falló, con la expectativa de que el error sea temporal y pueda resolverse en un intento posterior.

Por ejemplo:

- una request HTTP dio timeout
- la red tuvo una interrupción breve
- el proveedor respondió con error transitorio
- hubo una falla momentánea de conectividad

En esos casos, un nuevo intento puede tener sentido.

## Qué es un fallback

Un fallback es una alternativa de comportamiento cuando la operación principal no puede completarse como se esperaba.

Por ejemplo:

- usar un valor cacheado
- mostrar una respuesta parcial
- dejar el proceso pendiente
- cambiar a un proveedor secundario
- desactivar temporalmente una funcionalidad no crítica
- responder con una opción degradada pero útil

La idea no es “hacer lo mismo”.
La idea es **tener un plan B razonable**.

## Qué es degradación controlada

La degradación controlada es aceptar que, ante una falla, el sistema quizá no pueda ofrecer el comportamiento ideal, pero sí puede seguir funcionando de una forma limitada, comprensible y manejable.

Por ejemplo:

- el usuario no ve cotización en tiempo real, pero puede guardar el carrito
- una exportación no sale instantáneamente, pero queda pendiente
- una notificación no se manda al instante, pero se reintenta después
- una integración secundaria se apaga sin romper el flujo principal
- una pantalla muestra estado “temporalmente no disponible” en vez de colgarse indefinidamente

No se trata de resignarse.
Se trata de sostener servicio de la mejor forma posible bajo condiciones no ideales.

## Reintentar no siempre es buena idea

Este punto es fundamental.

A primera vista, reintentar parece siempre algo razonable.

Pero no siempre lo es.

Porque un reintento puede:

- duplicar una operación
- empeorar una caída
- aumentar la carga sobre el proveedor
- generar más lentitud
- repetir un error permanente
- ocultar un problema real
- saturar colas o threads
- afectar la experiencia de usuario

Entonces la pregunta no es:

- “¿reintentamos sí o no?”

La pregunta real es:

- **¿qué conviene reintentar, cuándo y bajo qué condiciones?**

## Errores transitorios y errores permanentes

Una distinción muy útil es esta.

### Error transitorio

Puede resolverse solo con el tiempo o con un nuevo intento.

Por ejemplo:

- timeout puntual
- fallo breve de red
- lentitud momentánea
- error temporal del proveedor
- indisponibilidad corta

### Error permanente o no reintentable

Reintentar probablemente no ayude.

Por ejemplo:

- credencial inválida
- request mal formada
- validación de negocio fallida
- recurso inexistente
- contrato incompatible
- operación prohibida

Confundir estos dos tipos de error lleva a malas decisiones.

## Ejemplo intuitivo

Supongamos que querés consultar una cotización de envío.

Si la API responde lento una vez, quizás un reintento corto tenga sentido.

Pero si devuelve:

- credenciales inválidas
- request mal armada
- parámetro obligatorio faltante

reintentar tres veces no arregla nada.

Solo agrega ruido y demora.

## Reintentos y experiencia de usuario

También importa mucho desde la UX.

Un sistema puede:

- reintentar internamente sin que el usuario lo note
- demorar demasiado intentando salvar algo
- responder rápido y dejar pendiente
- mostrar un mensaje claro
- sugerir reintento manual
- ofrecer una alternativa

No siempre el mejor diseño es “esperar todo lo posible”.

A veces conviene fallar más rápido y más claramente.

## Reintentos en línea vs reintentos diferidos

Esta distinción ayuda mucho.

### Reintento en línea

Ocurre dentro del mismo request o flujo inmediato.

Ejemplo:

- el backend hace una llamada externa
- falla por timeout
- reintenta una vez antes de responder

### Reintento diferido

Se hace después, fuera del request principal.

Ejemplo:

- una notificación no pudo enviarse
- queda un job para reintentar más tarde

No todos los casos necesitan el mismo tipo de reintento.

## Cuándo puede tener sentido reintentar en línea

Suele tener más sentido cuando:

- la operación es rápida
- el error parece claramente transitorio
- la latencia total sigue siendo aceptable
- la acción no es peligrosa de duplicar
- el usuario realmente necesita ese resultado en ese momento

## Cuándo conviene diferir o evitar el reintento en línea

Suele ser mejor cuando:

- la dependencia es lenta o inestable
- el flujo no requiere respuesta inmediata
- el costo de esperar es alto
- la operación puede duplicarse peligrosamente
- hay mejor tratamiento asincrónico
- querés evitar propagar latencia al usuario

## Idempotencia y reintentos

Este tema conecta directamente con idempotencia.

Si una operación puede reintentarse, tenés que pensar:

- ¿puede duplicarse un efecto?
- ¿puedo cobrar dos veces?
- ¿puedo crear dos órdenes?
- ¿puedo mandar varios emails?
- ¿puedo descontar stock de más?

Entonces, un sistema resiliente no solo reintenta.
También diseña para que el reintento no genere caos.

## Backoff

Cuando se reintenta, muchas veces no conviene hacerlo inmediatamente una y otra vez.

Puede tener más sentido espaciar los intentos.

La idea general del backoff es:

- primer intento falla
- esperar un poco
- volver a intentar
- si sigue fallando, esperar más
- y así sucesivamente dentro de un límite razonable

Esto ayuda a:

- no saturar al proveedor
- dar tiempo a que se recupere
- reducir agresividad del sistema

## Reintentos infinitos: una mala idea

Otro error común es dejar reintentos sin límite claro.

Eso puede generar:

- consumo innecesario
- loops operativos
- colas infladas
- saturación de recursos
- problemas invisibles que nunca terminan
- operaciones zombi que siguen reintentando eternamente

Por eso conviene definir:

- cantidad máxima de intentos
- criterio de abandono
- qué pasa cuando ya no se reintenta más
- dónde queda registrado ese caso

## Qué hacer cuando ya no vale la pena reintentar

Este punto es muy importante.

Si una operación falló varias veces, el sistema tiene que decidir algo.

Por ejemplo:

- marcar como fallida
- dejar pendiente de revisión
- enviar a una cola de error
- generar alerta
- notificar internamente
- ofrecer reproceso manual
- pasar a fallback

No alcanza con “dejar de intentar”.
También hay que decidir qué estado queda visible.

## Fallbacks: el plan B

Cuando el camino ideal falla, un fallback puede ayudar mucho.

Algunos ejemplos:

- usar un proveedor alternativo
- usar un dato cacheado
- responder con una estimación aproximada
- dejar el flujo en pendiente
- deshabilitar una parte no crítica
- mostrar una respuesta parcial

El fallback ideal depende del negocio.

No siempre existe.
Pero cuando existe, puede marcar una gran diferencia.

## Ejemplo con cotización

Supongamos que el proveedor principal de envíos no responde.

Posibles reacciones:

- esperar indefinidamente
- fallar toda la compra
- usar un proveedor alternativo
- usar una cotización aproximada previa
- dejar el pedido sin cotizar y completar después
- mostrar “cotización temporalmente no disponible”

Cada opción tiene trade-offs distintos.

## Degradación controlada y producto real

Este concepto es muy importante para producto.

Un sistema maduro a veces no puede ofrecer el comportamiento ideal.
Pero puede evitar el colapso total.

Por ejemplo:

- si falla el email, la orden igual puede crearse
- si falla la analítica, la compra no debería romperse
- si falla una recomendación secundaria, la página puede seguir cargando
- si falla una integración no crítica, la funcionalidad principal puede sobrevivir

La pregunta clave es:

**¿qué parte del flujo es realmente crítica y qué parte puede degradarse?**

## Dependencias críticas y no críticas

No todas las dependencias pesan igual.

### Críticas

Si fallan, el flujo principal no puede completarse razonablemente.

Por ejemplo:

- validación de pago imprescindible
- autorización obligatoria
- stock crítico si el modelo lo exige

### No críticas o menos críticas

Si fallan, el sistema aún puede seguir de otra manera.

Por ejemplo:

- emails
- analytics
- recomendaciones
- sincronizaciones secundarias
- métricas auxiliares
- ciertas notificaciones

Distinguir esto mejora muchísimo el diseño.

## Fallar rápido vs esperar demasiado

Muchas veces un sistema sufre porque espera demasiado a una dependencia.

Eso puede:

- bloquear threads
- aumentar latencia
- empeorar la experiencia
- generar cascadas de lentitud
- hacer que más partes fallen

A veces es mejor:

- cortar antes
- responder con degradación
- dejar pendiente
- reintentar después
- mostrar un error claro y controlado

Esto es parte central de la resiliencia.

## Relación con observabilidad

No alcanza con tener retries y fallbacks.
También hay que verlos.

Por ejemplo:

- cuántos retries están ocurriendo
- qué operaciones activan fallback
- si un proveedor está degradándose
- si la latencia está creciendo
- cuántos flujos quedan pendientes
- qué errores son transitorios y cuáles permanentes

Sin observabilidad, la resiliencia puede transformarse en opacidad.

## Relación con jobs y colas

Muchas estrategias sanas de reintento y fallback viven mejor en procesamiento diferido.

Por ejemplo:

- enviar email más tarde
- reintentar webhook saliente
- reconciliar un pago pendiente
- reintentar sincronización de stock

Esto evita meter demasiada complejidad dentro del request principal.

## Relación con consistencia eventual

Cuando una dependencia falla o tarda, puede ser razonable dejar un estado intermedio y converger después.

Por ejemplo:

- `PAYMENT_PENDING_CONFIRMATION`
- `SYNC_RETRY_PENDING`
- `NOTIFICATION_DELAYED`

Eso permite reflejar mejor lo que está pasando en vez de fingir un éxito o un fracaso definitivo demasiado pronto.

## Qué errores comunes aparecen

Algunos muy frecuentes son:

- reintentar todo indiscriminadamente
- no distinguir errores transitorios de permanentes
- hacer retries infinitos
- duplicar operaciones sensibles
- no tener fallback para dependencias no críticas
- degradar de forma confusa para el usuario
- bloquear todo el sistema por una dependencia secundaria
- no dejar visibilidad de qué quedó pendiente o degradado

## Buenas preguntas de diseño

Cuando una integración o dependencia puede fallar, ayuda mucho preguntarse:

1. ¿esta falla puede ser transitoria?
2. ¿vale la pena reintentar?
3. ¿cuántas veces?
4. ¿en línea o diferido?
5. ¿hay riesgo de duplicar efectos?
6. ¿qué fallback existe?
7. ¿el flujo principal puede seguir degradado?
8. ¿qué ve el usuario?
9. ¿qué ve soporte?
10. ¿cómo detecto que esto está ocurriendo demasiado?

## Buenas prácticas iniciales

## 1. Distinguir errores transitorios de errores permanentes

Eso cambia totalmente la estrategia.

## 2. Reintentar solo donde tenga sentido

No usar retries como reflejo automático universal.

## 3. Diseñar idempotencia donde pueda haber reprocesamiento

Fundamental para evitar caos.

## 4. Definir límites y backoff

Nunca dejar reintentos infinitos.

## 5. Pensar fallbacks para dependencias no críticas o parcialmente reemplazables

Puede mejorar mucho resiliencia.

## 6. Diseñar degradación comprensible

Que el sistema siga siendo operable y entendible.

## 7. Medir retries, fallbacks y estados degradados

La resiliencia también necesita observabilidad.

## Errores comunes

### 1. Reintentar cualquier error sin criterio

Eso suele empeorar más de lo que ayuda.

### 2. No contemplar duplicados

Muy peligroso en operaciones sensibles.

### 3. Esperar demasiado a una dependencia rota

Eso propaga la falla al resto del sistema.

### 4. No tener plan B para funcionalidades secundarias

Entonces una caída menor se convierte en caída mayor.

### 5. No reflejar bien estados pendientes o degradados

El usuario y soporte quedan a ciegas.

### 6. No registrar cuándo se activó un fallback

Después es difícil entender comportamientos raros.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. ¿qué integración de tu sistema reintentarías y cuál no?
2. ¿qué flujo podría seguir de forma degradada si una dependencia secundaria falla?
3. ¿qué riesgo habría si reintentás varias veces una operación de pago sin idempotencia?
4. ¿qué fallback se te ocurre para una cotización externa que no responde?
5. ¿qué métricas te gustaría ver sobre retries y degradación?

## Resumen

En esta lección viste que:

- una dependencia externa puede fallar de muchas formas y el sistema tiene que decidir cómo reaccionar
- los reintentos pueden ayudar en errores transitorios, pero mal usados empeoran la situación
- los fallbacks permiten ofrecer un comportamiento alternativo cuando el camino ideal no está disponible
- la degradación controlada busca sostener servicio útil sin colapsar ni prometer algo que no puede cumplirse
- idempotencia, límites de retries, backoff y observabilidad son piezas fundamentales de este diseño
- no todas las dependencias son igual de críticas, y eso debería reflejarse en cómo reaccionás ante sus fallos

## Siguiente tema

Ahora que ya entendés cómo pensar reintentos, fallbacks y degradación controlada frente a dependencias que fallan, el siguiente paso natural es aprender sobre **proveedor principal, proveedor secundario y estrategias de conmutación**, porque en algunas integraciones críticas no alcanza con resistir fallos: también conviene diseñar cómo cambiar de camino cuando un proveedor deja de responder bien.
