---
title: "Envíos, logística y tracking"
description: "Cómo pensar la logística de un e-commerce real, por qué enviar no es solo calcular un costo, qué estados conviene modelar y cómo diseñar tracking sin perder trazabilidad operativa." 
order: 198
module: "E-commerce profesional"
level: "intermedio"
draft: false
---

## Introducción

Cuando alguien compra en un e-commerce, muchas veces siente que lo más difícil ya pasó:

- eligió el producto
- confirmó el carrito
- pagó
- recibió la confirmación

Pero para el negocio, ahí empieza otra parte crítica.

Ahora hay que lograr que esa orden:

- se prepare correctamente
- salga por el canal logístico correcto
- llegue a destino
- pueda seguirse durante el trayecto
- y deje evidencia clara de lo que pasó en cada etapa

Y eso introduce una complejidad muy distinta a la de catálogo, pricing o pagos.

Porque en logística el backend ya no habla solo con datos digitales.
También empieza a depender de:

- stock físico
- depósitos
- operadores humanos
- transportistas
- ventanas horarias
- direcciones imperfectas
- eventos asincrónicos
- fallas del mundo real

Por eso, en un e-commerce serio, envíos no significa solamente “sumar un costo de delivery”.
Significa diseñar una parte del sistema que conecte la orden digital con la ejecución física.

## Enviar no es una sola acción

Un error común es pensar el envío como un evento único:

- se despachó
- o no se despachó

Pero igual que en pagos, en logística lo real suele ser un proceso con etapas.

Por ejemplo:

- pendiente de preparación
- en preparación
- listo para despacho
- asignado a operador logístico
- despachado
- en tránsito
- en distribución
- entregado
- no entregado
- reprogramado
- devuelto
- extraviado

Y a eso hay que sumarle variaciones según el modelo logístico:

- retiro en tienda
- envío a domicilio
- envío a sucursal
- same-day delivery
- envío programado
- fulfillment tercerizado
- dropshipping

Entonces, igual que con órdenes o pagos, conviene pensar logística como un flujo de estados y eventos, no como un simple campo booleano.

## Logística no es solo costo de envío

Al principio es normal modelar envío como algo así:

- método
- precio
- dirección

Eso sirve para empezar, pero en un sistema real no alcanza.

Porque la logística afecta muchas más cosas:

- promesa de entrega
- experiencia del cliente
- costo operativo
- margen del negocio
- tasa de reclamos
- cancelaciones
- devoluciones
- capacidad del depósito
- coordinación con carriers

Por ejemplo, dos opciones de envío pueden tener el mismo precio para el cliente, pero ser muy distintas para la operación:

- una puede ser más barata pero mucho más lenta
- otra puede requerir integración especial con un carrier
- otra puede tener mejor tracking pero peor cobertura
- otra puede generar más incidencias por fallas de última milla

Entonces, el backend no debería tratar logística solo como una línea de costo.
También tiene que verla como parte central del cumplimiento de la promesa comercial.

## Qué suele guardar el sistema de envíos

En una implementación seria, suele ser útil guardar más contexto que solo “tipo de envío” y “precio”.

Por ejemplo:

- método de envío elegido
- operador logístico o carrier
- servicio específico del carrier
- dirección de destino normalizada
- código postal
- zona logística
- costo cobrado al cliente
- costo interno estimado o real
- número de tracking
- estado interno del fulfillment
- estado reportado por el carrier
- fecha estimada de entrega
- fecha real de despacho
- fecha real de entrega
- intentos de entrega
- motivo de incidencia o devolución
- historial de eventos logísticos

Todo eso ayuda a resolver:

- soporte al cliente
- reclamos
- conciliación con operadores
- reporting logístico
- debugging
- análisis de performance

## Estado interno vs estado del carrier

Este es uno de los puntos más importantes.

Tu sistema puede tener estados propios.
El carrier también.
Y no siempre coinciden.

Por ejemplo, internamente podrías usar:

- pending_fulfillment
- ready_to_ship
- shipped
- in_transit
- delivered
- failed_delivery
- returned

Mientras que un carrier puede reportar eventos como:

- label_created
- picked_up
- sorting_center
- out_for_delivery
- delivered
- exception
- return_to_sender

Si el backend copia literalmente todos los estados del proveedor como si fueran sus estados de negocio, termina acoplado al carrier.

Si, en cambio, ignora por completo lo que el carrier informa, pierde trazabilidad útil.

La solución suele ser distinguir entre:

- **estado interno de negocio**
- **eventos o estado externo del carrier**

Así el sistema puede mapear eventos externos a un modelo interno más estable.

## La promesa de entrega también es parte del backend

Muchas veces desde afuera parece que “fecha estimada de entrega” es solo un detalle visual.

Pero no.
Es una parte importante de la promesa comercial.

Porque esa fecha puede depender de:

- disponibilidad real del producto
- ubicación del cliente
- horario del pedido
- días hábiles
- feriados
- capacidad operativa
- carrier elegido
- tipo de producto
- reglas de corte del depósito

Por ejemplo, no es lo mismo:

- comprar antes del horario de corte
- comprar un viernes a la noche
- comprar un producto con stock inmediato
- comprar un producto con preparación especial
- comprar en una zona remota

Entonces, la promesa logística no debería salir de una frase estática.
Conviene que el backend tenga reglas claras para calcular o estimar:

- disponibilidad de método de envío
- fecha estimada de despacho
- ventana estimada de entrega

Y además, conviene distinguir entre:

- promesa estimada mostrada al cliente
- fecha esperada operativa
- fecha real confirmada por el proceso logístico

## Preparación y despacho no son lo mismo

Otra confusión común es mezclar preparación con envío.

Pero en la práctica son cosas distintas.

### Preparación

Incluye actividades como:

- picking
- packing
- control de productos
- etiquetado
- consolidación de bultos

### Despacho

Es el momento en que la orden o el paquete sale efectivamente hacia el circuito logístico.

Eso importa porque una orden puede estar:

- pagada
- confirmada
- y todavía no despachada

O también:

- lista para despacho
- pero esperando retiro del carrier

Si el sistema marca todo eso como “enviado”, después aparecen problemas de soporte y expectativas incorrectas.

## Tracking: más que mostrar un numerito

Muchos equipos ven tracking como algo muy simple:

- guardar el tracking number
- mostrarlo al usuario

Pero tracking útil implica bastante más.

Porque el valor real no está solo en el identificador, sino en la capacidad de responder preguntas como:

- ¿la orden ya salió realmente?
- ¿quién tiene el paquete?
- ¿hubo intento de entrega?
- ¿está frenado por una incidencia?
- ¿se entregó de verdad o solo cambió de estado?
- ¿qué fue lo último confiable que pasó?

Por eso conviene pensar tracking como una combinación de:

- identificador externo
- fuente del evento
- timestamp del evento
- tipo de evento
- detalle adicional o metadata
- traducción a estados comprensibles para negocio y soporte

## El tracking casi siempre llega de forma asíncrona

En muchos casos, la logística se actualiza por eventos diferidos.
Por ejemplo:

- webhooks del carrier
- polling periódico a la API del operador
- carga batch desde un archivo
- actualización manual desde backoffice

Eso significa que el backend no puede asumir que sabrá todo en tiempo real y de forma perfectamente ordenada.

Pueden pasar cosas como:

- eventos duplicados
- eventos fuera de orden
- eventos tardíos
- estados contradictorios
- ausencia temporal de novedades

Entonces el diseño necesita:

- idempotencia
- trazabilidad de eventos
- criterio para ignorar o reconciliar inconsistencias
- reglas para no retroceder estados internos sin validación

## La última milla concentra muchos problemas

En la práctica, una enorme parte del dolor operativo aparece en la última milla.

Por ejemplo:

- dirección incompleta
- cliente ausente
- zona complicada
- teléfono inválido
- rechazo de entrega
- demoras del repartidor
- reprogramaciones
- paquetes dañados
- mala coordinación horaria

Desde el punto de vista del sistema, esto implica que no alcanza con saber “salió del depósito”.
También hace falta modelar incidencias y excepciones.

Por ejemplo:

- intento de entrega fallido
- entrega reprogramada
- dirección no válida
- paquete devuelto
- extravío
- daño reportado
- entrega parcial

Sin eso, soporte y operaciones quedan ciegos.

## Devoluciones y retornos también son parte de la logística

Muchas veces se habla de devolución como un proceso aparte.
Y sí, puede tener su propia complejidad.

Pero desde la operación logística, un retorno también forma parte del flujo físico del pedido.

Por eso conviene que el modelo no termine en “entregado”.
También debería contemplar posibles caminos posteriores:

- devolución solicitada
- retiro del producto al cliente
- recepción en depósito
- inspección
- reintegro a stock o descarte

Esto es importante porque una orden entregada no siempre significa una operación cerrada.

## No todos los productos deberían compartir la misma logística

Otro error frecuente es asumir que todo producto se envía igual.

Pero la logística depende mucho del tipo de producto.

Por ejemplo:

- un producto pequeño y estándar
- un mueble voluminoso
- un producto frágil
- un alimento perecedero
- un artículo digital que no requiere envío físico
- una preventa que todavía no puede despacharse

Eso impacta en:

- métodos disponibles
- carriers compatibles
- costo logístico
- tiempos prometidos
- reglas de embalaje
- necesidad de tracking
- política de entrega

Entonces suele ser útil que la disponibilidad logística no dependa solo del destino, sino también del tipo de producto y de sus restricciones.

## Fulfillment propio vs tercerizado

No todos los e-commerce operan igual.

### Fulfillment propio

El negocio controla depósito, preparación y a veces incluso despacho.
Eso da más control, pero también más responsabilidad.

### Fulfillment tercerizado

Parte del flujo queda en manos de terceros:

- 3PL
- operador logístico
- seller externo
- dropshipper

Eso cambia bastante el diseño del backend.
Porque ya no solo hay que saber qué pasa adentro del negocio, sino también:

- recibir estados externos
- mapear eventos de terceros
- resolver diferencias de información
- controlar SLA operativos

Y eso exige más trazabilidad y mejores integraciones.

## Qué debería poder responder el sistema

Un buen modelo logístico debería permitir responder rápido preguntas muy concretas.

Por ejemplo:

- ¿esta orden ya fue preparada?
- ¿ya fue despachada o solo etiquetada?
- ¿qué carrier la tiene?
- ¿cuál fue el último evento confiable?
- ¿cuándo se prometió entregarla?
- ¿cuántos intentos de entrega hubo?
- ¿hubo incidencia?
- ¿está en retorno?
- ¿la demora es interna o del operador?

Si el backend no puede responder eso con cierta claridad, la operación empieza a depender demasiado de revisar sistemas externos manualmente.

## Buenas prácticas iniciales

## 1. Separar orden, fulfillment y envío

No mezclar todo en un solo campo baja mucho la confusión operativa.

## 2. Modelar estados internos propios

No depender por completo de los nombres del carrier.

## 3. Guardar eventos logísticos relevantes

El historial ayuda muchísimo para soporte, auditoría y debugging.

## 4. Distinguir preparación, despacho, tránsito y entrega

Son momentos distintos y conviene tratarlos como tales.

## 5. Diseñar tracking como flujo de eventos, no solo como número

Eso da trazabilidad real.

## 6. Soportar incidencias y excepciones

La logística real rara vez sale perfecta siempre.

## 7. Tratar promesa de entrega como parte seria del sistema

No como simple texto decorativo del frontend.

## Errores comunes

### 1. Reducir logística a un costo y una dirección

Eso deja fuera la complejidad operativa real.

### 2. Marcar una orden como enviada demasiado pronto

Etiquetar no siempre significa despachar.

### 3. Copiar ciegamente los estados del carrier al dominio interno

Eso acopla demasiado el sistema a integraciones externas.

### 4. No guardar historial de eventos

Después cuesta muchísimo investigar reclamos.

### 5. No modelar intentos fallidos, devoluciones o incidencias

La operación queda sin lenguaje para describir problemas reales.

### 6. Hacer promesas de entrega sin reglas serias

Eso degrada la experiencia y aumenta reclamos.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. ¿tu sistema distingue claramente entre preparado, despachado, en tránsito y entregado?
2. ¿qué harías si el carrier informa un estado extraño que no encaja con tu modelo interno?
3. ¿cómo detectarías si una orden está demorada por un problema interno o por el operador logístico?
4. ¿qué historial guardarías para que soporte pueda responder un reclamo sin revisar cinco sistemas distintos?
5. ¿tu diseño soporta devoluciones, reintentos de entrega e incidencias sin romper el flujo principal?

## Resumen

En esta lección viste que:

- logística y envíos no son solo un costo adicional, sino una parte central de la promesa comercial del e-commerce
- conviene modelar el envío como un proceso con estados, eventos e incidencias, no como una acción binaria
- el sistema debería distinguir entre estados internos de negocio y eventos externos informados por carriers
- tracking útil implica historial, timestamps, eventos y trazabilidad, no solo un número de seguimiento
- preparación, despacho, tránsito, entrega y retorno son momentos diferentes que conviene separar
- una buena modelización logística ayuda a soporte, operaciones, reporting y experiencia del cliente

## Siguiente tema

Ahora que ya entendés mejor cómo pensar envíos, logística y tracking, el siguiente paso natural es meterse en **devoluciones, reembolsos y postventa**, porque después de cobrar y entregar no termina todo: los problemas, ajustes y reclamos posteriores también forman parte del diseño real de un e-commerce profesional.
