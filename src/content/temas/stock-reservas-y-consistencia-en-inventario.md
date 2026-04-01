---
title: "Stock, reservas y consistencia en inventario"
description: "Cómo pensar el inventario en un e-commerce real, por qué stock no es solo un número, qué diferencia hay entre stock físico, disponible y reservado, cómo evitar sobreventa, cómo diseñar reservas con expiración y confirmación, y qué decisiones de consistencia importan cuando varios clientes, pagos, depósitos e integraciones intentan tocar el mismo inventario al mismo tiempo."
order: 193
module: "E-commerce profesional"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior vimos que un catálogo serio no puede modelarse como una ficha plana.

Ahora vamos a entrar en otra zona donde los e-commerce reales dejan de parecer simples:

**el inventario**.

Porque cuando el negocio recién arranca, muchas veces parece que stock es solo esto:

- producto
- cantidad

Y nada más.

Pero apenas el sistema empieza a vender de verdad, esa idea se rompe.

Aparecen situaciones como:

- dos personas quieren comprar la última unidad al mismo tiempo
- un carrito retiene mercadería durante algunos minutos
- el pago puede aprobarse, demorarse o fallar
- el depósito físico no coincide exactamente con lo que el sistema cree
- hay stock distribuido en varios depósitos o sucursales
- una parte del inventario está dañada o inmovilizada
- una venta en marketplace consume el mismo inventario que la tienda propia
- una devolución vuelve stock, pero no siempre vuelve vendible
- una orden cancelada debería liberar unidades reservadas
- una integración externa informa movimientos con demora

Entonces este tema gira alrededor de una pregunta central:

**¿cómo se modela el inventario para que el sistema no venda lo que no tiene, no bloquee lo que ya no existe y no se vuelva inconsistente cuando muchas cosas ocurren a la vez?**

## El error inicial: creer que stock es un único número absoluto

El primer modelo ingenuo suele ser algo así:

- `product_id`
- `quantity`

Eso puede servir para una demo.

Pero en operación real casi nunca alcanza.

Porque el negocio no necesita solo saber cuántas unidades existen “en general”.

Necesita saber:

- cuántas unidades existen físicamente
- cuántas están realmente disponibles para vender
- cuántas están reservadas por órdenes todavía no cerradas
- cuántas están comprometidas para picking o fulfillment
- cuántas están dañadas o inmovilizadas
- cuántas pertenecen a un depósito específico
- cuántas pueden venderse en cierto canal

Entonces el problema no es solo numérico.

Es semántico.

No alcanza con preguntar “cuánto stock hay”.

Hay que preguntar:

**¿stock de qué tipo, en qué estado, en qué ubicación y para qué propósito?**

## Stock físico, stock disponible y stock reservado no son lo mismo

Esta separación es una de las más importantes de todo el módulo.

### Stock físico

Es lo que efectivamente existe en el mundo real.

Por ejemplo:

- 100 unidades en depósito

### Stock reservado

Es la porción temporalmente apartada para procesos en curso.

Por ejemplo:

- 8 unidades retenidas por carritos o checkouts pendientes

### Stock disponible para venta

Es lo que el sistema todavía puede prometer comercialmente.

Por ejemplo:

- 92 unidades vendibles ahora mismo

Eso ya muestra una idea importante:

**disponible no siempre equivale a físico**.

Incluso aunque no haya errores, puede existir una diferencia legítima entre lo que hay y lo que todavía puede venderse.

## Reservar no es vender

Este es otro error conceptual muy común.

Muchas implementaciones mezclan demasiado pronto la reserva con la venta.

Pero son momentos distintos.

### Reservar

Significa:

“intento apartar unidades mientras confirmo si esta operación va a concretarse”.

### Confirmar venta

Significa:

“la operación pasó el punto de compromiso y el inventario ya no debe volver al pool vendible salvo cancelación o devolución”.

Si el sistema no distingue eso, aparecen dos problemas opuestos.

### Si no reservás

Podés sobrevendir.

Dos clientes llegan casi al mismo tiempo.
Ambos ven disponibilidad.
Ambos pagan.
Solo uno debía quedarse con la unidad.

### Si reservás mal

Podés bloquear inventario de más.

Carritos abandonados, pagos colgados o flujos incompletos dejan el stock retenido artificialmente.

Entonces el desafío real no es solo “reservar”.

Es diseñar:

- cuándo reservar
- cuánto reservar
- cuánto dura la reserva
- cómo se confirma
- cómo se libera
- qué pasa si el proceso queda a mitad de camino

## El inventario vive en una línea de tiempo, no en una foto

Otra forma útil de pensar este problema es esta:

**inventario no es solo estado; también es secuencia de movimientos**.

Por eso en sistemas más maduros suele ser muy valioso registrar eventos como:

- ingreso de mercadería
- ajuste manual
- reserva creada
- reserva liberada
- venta confirmada
- picking iniciado
- despacho realizado
- devolución recibida
- merma o rotura
- transferencia entre depósitos

Eso permite varias cosas.

Primero, entender cómo llegaste al número actual.

Segundo, auditar diferencias.

Tercero, reconstruir errores.

Cuarto, alimentar reporting y conciliación.

Si solo guardás un número final y lo sobrescribís cada vez, después es muy difícil saber por qué cambió.

## El inventario suele estar atado a la unidad vendible, no al producto base

En el tema anterior distinguimos entre producto visible y variante vendible.

Acá esa diferencia se vuelve crítica.

Porque el inventario normalmente debería gestionarse sobre la unidad exacta que realmente se vende.

No sobre la idea genérica del producto.

Por ejemplo:

- Remera clásica · azul · talle M → 4 unidades
- Remera clásica · azul · talle L → 0 unidades
- Remera clásica · negra · talle M → 12 unidades

Si el sistema guarda stock solo a nivel producto base:

**“Remera clásica: 16 unidades”**

entonces pierde información operativa esencial.

Y puede mostrar disponibilidad engañosa.

## También importa dónde está el stock

No siempre alcanza con saber cuántas unidades existen.

Muchas veces importa dónde están.

Por ejemplo:

- depósito central
- sucursal física
- operador logístico
- tienda de retiro
- dark store
- proveedor dropshipping

Entonces el inventario puede depender no solo de SKU sino también de ubicación.

Eso cambia mucho la complejidad.

Porque ahora no solo preguntás:

- ¿hay stock?

Sino:

- ¿hay stock en la ubicación correcta?
- ¿ese stock puede venderse en este canal?
- ¿sirve para retiro inmediato?
- ¿sirve para envío en 24 horas?
- ¿puede prometerse para cierta zona?

En catálogos más avanzados, el problema ya no es simplemente inventario.

Es **inventario elegible para una promesa comercial concreta**.

## El modelo mínimo sano suele necesitar más de un estado

No todos los negocios necesitan el mismo nivel de detalle.

Pero muchos sistemas mejoran mucho apenas distinguen algo así como:

- on hand / físico
- reserved / reservado
- available / disponible
- damaged / dañado o no vendible
- in transit / en tránsito

No necesariamente tienen que llamarse así.

Pero sí conviene distinguir estados con significado real.

Porque si todo entra en una sola bolsa, después las reglas de negocio quedan escondidas o repartidas por todo el código.

## La sobreventa casi nunca es un problema “teórico”

A veces en etapas tempranas se subestima.

Se piensa:

“si pasa una vez cada tanto, después lo resolvemos manualmente”.

Pero la sobreventa pega en varios lugares al mismo tiempo:

- experiencia del cliente
- reputación
- atención al cliente
- reembolsos
- conciliación operativa
- métricas comerciales
- confianza del equipo en el sistema

Y además suele empeorar cuando:

- hay campañas
- hay pocas unidades
- hay varios canales consumiendo el mismo stock
- hay latencia entre sistemas
- se hacen imports o sincronizaciones frecuentes

Entonces no conviene pensar la consistencia de inventario como una sofisticación innecesaria.

En muchos negocios, es parte del corazón del producto.

## El momento de descontar inventario es una decisión de negocio, no solo técnica

Este punto importa mucho.

No existe una única respuesta universal a la pregunta:

**¿cuándo se descuenta stock?**

Las alternativas típicas son estas.

### Descontar al agregar al carrito

Ventaja:

- baja probabilidad de sobreventa

Problema:

- bloquea inventario demasiado pronto
- puede castigar mucho el abandono de carrito

### Descontar al iniciar checkout o crear una reserva temporal

Ventaja:

- equilibrio razonable entre protección y uso del stock

Problema:

- requiere expiraciones y limpieza de reservas

### Descontar solo cuando el pago queda aprobado

Ventaja:

- no se inmoviliza stock por procesos incompletos

Problema:

- aumenta riesgo de vender más de lo disponible

La elección depende de cosas como:

- tipo de producto
- rotación
- escasez
- tolerancia a sobreventa
- duración típica del checkout
- método de pago
- canal de venta
- capacidad operativa para resolver errores

Esto muestra otra idea importante:

**inventario no se diseña solo desde base de datos; se diseña junto con la política comercial y operativa**.

## Reserva con expiración: patrón muy frecuente

Una solución muy común en e-commerce es la reserva temporal.

La idea es simple:

1. el usuario inicia una operación relevante
2. el sistema intenta reservar cierta cantidad
3. la reserva vence después de un tiempo
4. si la compra se confirma antes del vencimiento, esa reserva se transforma en consumo real
5. si no se confirma, la reserva se libera

Parece sencillo.

Pero en la práctica aparecen preguntas delicadas.

### ¿Cuánto dura la reserva?

- 5 minutos
- 10 minutos
- 30 minutos
- depende del medio de pago

### ¿Qué pasa si el pago se aprueba justo después del vencimiento?

### ¿Qué pasa si una orden reintenta confirmarse dos veces?

### ¿Qué pasa si el job que limpia reservas vencidas falla temporalmente?

### ¿Qué pasa si el usuario abre dos sesiones o dos tabs?

### ¿La reserva es por carrito completo o por ítem?

Una reserva temporal no es difícil de imaginar.

Lo difícil es definir su comportamiento en bordes y fallos.

## Confirmar y liberar deberían ser operaciones explícitas

En sistemas sanos, las transiciones importantes de inventario conviene que sean claras.

Por ejemplo:

- `reserve`
- `confirm`
- `release`
- `adjust`
- `transfer`

Eso suele ser mejor que esconder cambios de inventario como efectos secundarios implícitos de otras operaciones.

Cuando todo descuenta stock “por abajo”, después cuesta mucho seguir el flujo real.

En cambio, si las operaciones de inventario son explícitas, resulta más fácil:

- razonar sobre el dominio
- auditar
- testear
- idempotentizar
- observar errores

## La consistencia importa más cuando muchos procesos tocan el mismo stock

No es lo mismo un sistema donde solo un backend escribe inventario una vez por hora, que uno donde muchas cosas compiten al mismo tiempo.

Por ejemplo:

- storefront web
- app mobile
- panel interno
- marketplace
- ERP
- sistema de depósitos
- importador masivo
- proceso de devoluciones
- jobs automáticos

Cuantos más actores escriben, más importante se vuelve el criterio de consistencia.

Porque ya no alcanza con tener una tabla correcta “en abstracto”.

Hay que evitar conflictos reales.

## El clásico problema de concurrencia

Supongamos que hay 1 unidad disponible.

Dos requests llegan casi al mismo tiempo.

Ambos leen:

- disponible = 1

Ambos intentan reservar 1.

Si el sistema no protege bien esa operación, los dos pueden creer que tuvieron éxito.

Y ahí nació la sobreventa.

Esto muestra por qué no alcanza con:

- leer disponibilidad
- validar en memoria
- luego escribir

En zonas críticas, hace falta que la operación se diseñe para que el chequeo y la modificación relevante queden protegidos de condiciones de carrera.

## Leer y luego escribir suele ser más peligroso de lo que parece

Un flujo ingenuo sería:

1. leer stock
2. si alcanza, continuar
3. descontar

El problema es que entre el paso 1 y el 3 alguien más pudo haber modificado el inventario.

Por eso en operaciones críticas suelen aparecer estrategias como:

- locks
- actualizaciones condicionales
- control optimista de concurrencia
- serialización por clave de inventario
- colas o procesamiento secuencial por SKU

No existe una receta única.

Pero sí hay una advertencia clara:

**cuando varias operaciones compiten por el mismo inventario, la atomicidad deja de ser un detalle y pasa a ser parte del negocio.**

## El inventario no siempre necesita consistencia fuerte en todo

Acá conviene hacer una distinción sutil.

Hay partes del problema donde la consistencia fuerte suele importar mucho.

Por ejemplo:

- aceptar o rechazar una reserva
- confirmar una venta sobre unidades escasas
- evitar vender dos veces la última unidad

Pero hay otras partes donde puede tolerarse cierta asincronía.

Por ejemplo:

- dashboards
- métricas agregadas
- proyecciones de lectura
- sincronización con sistemas externos
- disponibilidad mostrada con una pequeña demora aceptable

Entonces la pregunta correcta no es:

**“¿todo debe ser estrictamente consistente?”**

Sino:

**“¿qué decisiones necesitan consistencia fuerte y cuáles pueden sostenerse con consistencia eventual?”**

## Inventario e integraciones: una fuente enorme de inconsistencias

En negocios reales, inventario rara vez vive aislado.

Se cruza con:

- ERP
- WMS
- marketplace
- POS físico
- proveedor externo
- sistema de shipping

Eso trae varios problemas.

### Diferencias de timing

Un sistema descuenta antes.
Otro informa después.
Otro reintenta mensajes.

### Diferencias semánticas

Un sistema entiende “reserved”.
Otro solo entiende “available”.
Otro manda stock total.

### Diferencias de autoridad

¿Quién manda?

- la tienda
- el ERP
- el depósito
- el marketplace

Si eso no está claro, aparecen bucles y sobrescrituras peligrosas.

Entonces una parte importante del diseño de inventario consiste en definir:

- fuente de verdad por tipo de dato
- dirección de sincronización
- frecuencia de actualización
- reglas de reconciliación
- manejo de conflictos

## Inventario físico e inventario prometible no siempre coinciden

Imaginá este caso:

- hay 20 unidades físicamente en depósito
- 8 están reservadas
- 4 están separadas para un canal mayorista
- 2 están bloqueadas por control de calidad

¿Cuánto puede prometer la tienda online?

No necesariamente 20.

Tal vez 6.

Esto importa porque desde negocio muchas veces se necesita distinguir entre:

- lo que existe
- lo que puede venderse ahora
- lo que conviene prometer según reglas comerciales

Ese “prometible” puede depender de criterios como:

- canal
- prioridad de cliente
- ubicación
- SLA de envío
- stock de seguridad
- reglas anti quiebre

Entonces el número útil comercialmente no siempre sale directo de contar cajas.

## Stock de seguridad: protegerse del borde

Algunos negocios no exponen todo lo que físicamente tienen.

Dejan un margen interno.

Por ejemplo:

- físico = 10
- seguridad = 2
- vendible = 8

¿Para qué sirve?

- reducir impacto de errores de conteo
- absorber diferencias entre sistemas
- evitar promesas demasiado agresivas
- proteger campañas o canales prioritarios

No reemplaza una buena gestión de inventario.

Pero puede ser una herramienta de negocio útil cuando la exactitud operativa no es perfecta.

## Ajustes manuales: inevitables y peligrosos

En casi todos los negocios reales aparecen ajustes manuales.

Por ejemplo:

- conteo físico distinto al sistema
- mercadería dañada
- devolución no registrada correctamente
- pérdida
- error de carga
- corrección de integración

Los ajustes manuales son necesarios.

Pero también son riesgosos.

Por eso conviene que estén bien modelados.

Con cosas como:

- motivo del ajuste
- usuario responsable
- referencia externa
- fecha y hora
- diferencia aplicada
- comentario operativo

Si el sistema permite cambiar stock sin huella, después la operación se vuelve opaca y la confianza cae.

## Devoluciones: no siempre devuelven stock vendible

Este caso suele modelarse mal.

Una devolución no implica automáticamente:

- sumar 1 al disponible

Porque depende del estado del producto.

Puede volver:

- vendible
- con daño
- para inspección
- para refurbish
- solo para descarte

Entonces la devolución debería poder reingresar inventario a distintos estados, no solo al stock disponible.

## Picking y fulfillment también cambian el problema

En cuanto una orden entra en preparación, el inventario puede cambiar otra vez de semántica.

Por ejemplo:

- reservado para orden
- asignado a picking
- pickeado
- empaquetado
- despachado

No todos los negocios necesitan modelar cada paso.

Pero en operaciones más complejas, separar estas etapas ayuda a evitar ambigüedad.

Porque una unidad reservada pero todavía no pickeada no es igual a una unidad ya retirada físicamente del estante.

## Inventario negativo: a veces se tolera, a veces es inaceptable

Hay negocios donde permitir inventario negativo es directamente un error.

Por ejemplo:

- productos escasos
- promesas rígidas de entrega
- operaciones con baja tolerancia al fallo

Pero hay otros contextos donde puede aceptarse temporalmente.

Por ejemplo:

- ventas B2B con reposición inmediata
- modelos semi-manuales
- reconciliación posterior con ERP
- ciertas operaciones de backoffice

La decisión no es puramente técnica.

Es una política operativa.

Lo importante es que sea explícita.

No que el sistema “a veces deje pasar” negativos por accidente.

## La observabilidad de inventario importa muchísimo

Cuando el inventario falla, duele rápido.

Por eso conviene observar cosas como:

- reservas creadas
- reservas vencidas
- reservas liberadas
- confirmaciones
- rechazos por falta de stock
- ajustes manuales
- diferencias entre sistemas
- intentos concurrentes fallidos
- órdenes canceladas por inconsistencia de inventario

Eso ayuda a detectar patrones como:

- TTL demasiado largo
- integración lenta
- sobre-reserva
- limpieza defectuosa de expiraciones
- quiebres frecuentes en cierto canal

Si solo mirás el número final, es difícil ver dónde está el problema.

## Testing de inventario necesita casos de borde, no solo casos felices

Muchos bugs de inventario no aparecen en el flujo feliz.

Aparecen en situaciones como:

- dos compras simultáneas por la última unidad
- reserva que vence mientras el pago se confirma
- confirmación duplicada por reintento
- cancelación después de confirmación parcial
- ajuste manual concurrente con una venta
- integración externa que reenvía el mismo evento
- liberación doble de una misma reserva

Entonces este dominio necesita especialmente:

- tests de concurrencia
- tests de idempotencia
- tests de expiración
- tests de reconciliación
- tests de bordes operativos

## El inventario se beneficia mucho de operaciones idempotentes

Esto conecta con temas anteriores del roadmap.

Porque en inventario los reintentos pasan seguido.

Por ejemplo:

- el gateway de pagos reenvía notificaciones
- un job reintenta confirmaciones pendientes
- una integración externa repite un mensaje
- un usuario refresca o reenvía una acción

Entonces conviene que operaciones como:

- confirmar reserva
- liberar reserva
- aplicar movimiento externo

puedan tolerar repetición sin producir dobles descuentos o dobles liberaciones.

## A veces conviene separar el ledger del snapshot actual

En sistemas más maduros, puede ser útil distinguir dos cosas.

### Ledger o historial de movimientos

Registra qué pasó.

### Snapshot o estado actual materializado

Sirve para responder rápido cuánto hay ahora.

Eso permite combinar:

- auditabilidad
- reconstrucción
- consultas eficientes

Si solo tenés ledger, algunas lecturas pueden volverse costosas.

Si solo tenés snapshot, perdés trazabilidad.

La combinación suele dar un equilibrio mejor.

## El inventario de bundles y kits complica todavía más las cosas

No siempre se vende una sola unidad simple.

A veces se venden:

- packs
- kits
- bundles promocionales
- combos armados

Entonces aparece otra decisión:

¿el bundle tiene stock propio?
¿o depende del stock de sus componentes?

Ejemplo:

Combo desayuno:

- 1 taza
- 1 café
- 1 cuchara

Si falta cucharita, ¿el combo queda sin stock?

¿se reserva el combo o se reservan las piezas?

¿puede haber prearmado físico o armado virtual?

Esto muestra que inventario puede volverse bastante más complejo cuando el catálogo y la logística se mezclan.

## Marketplace y multicanal: una sola verdad, muchas promesas

Cuando la misma mercadería se vende en varios canales, el problema crece.

Por ejemplo:

- tienda propia
- marketplace A
- marketplace B
- local físico
- venta telefónica

Todos compiten por el mismo pool o por partes de él.

Entonces hay que definir cosas como:

- stock compartido o segmentado
- buffers por canal
- prioridad comercial
- frecuencia de sincronización
- qué pasa si un canal vende antes de recibir la actualización

En este punto, el desafío deja de ser “guardar cantidades”.

Pasa a ser **coordinar promesas comerciales múltiples sobre una realidad física compartida**.

## Algunos principios de diseño que suelen ayudar

No son reglas absolutas.

Pero suelen dar bastante claridad.

### 1. Gestionar inventario al nivel de la unidad realmente vendible

Normalmente, SKU o variante.

### 2. Distinguir stock físico, reservado y disponible

Aunque el modelo exacto cambie, esa separación conceptual es muy valiosa.

### 3. Hacer explícitas las transiciones críticas

Reservar, confirmar, liberar, ajustar, transferir.

### 4. Proteger la concurrencia en puntos donde se decide disponibilidad

No confiar en lecturas ingenuas previas a una escritura posterior.

### 5. Diseñar expiraciones y limpieza de reservas como parte del dominio

No como un detalle menor de infraestructura.

### 6. Registrar movimientos y no solo valores finales

Eso mejora auditoría, debugging y conciliación.

### 7. Definir autoridad y reconciliación cuando intervienen sistemas externos

Especialmente en multicanal y ERP/WMS.

### 8. Separar lo que necesita consistencia fuerte de lo que puede tolerar asincronía

No todo requiere el mismo costo operacional.

## Mini ejercicio mental

Imaginá un e-commerce que vende zapatillas.

Cada SKU tiene:

- color
- talle
- stock por depósito

El negocio vende en:

- tienda propia
- marketplace
- local físico

Además:

- reserva inventario por 15 minutos al iniciar checkout
- usa un gateway que a veces confirma pagos con demora
- permite devoluciones
- integra con un ERP una vez cada pocos minutos

Preguntas para pensar:

- sobre qué entidad exacta modelarías el inventario
- qué estados mínimos distinguirías
- cuándo crearías la reserva
- cómo manejarías el vencimiento de esa reserva
- qué operación confirmaría el consumo real
- qué harías si el pago llega justo después de expirar la reserva
- qué sistema considerarías fuente de verdad del stock
- cómo auditarías un ajuste manual
- cómo evitarías vender dos veces la última unidad en simultáneo
- qué información mirarías para detectar desvíos frecuentes

## Resumen

El inventario en e-commerce real no es solo un contador.

Es una parte crítica del sistema donde se cruzan:

- catálogo
- checkout
- pagos
- fulfillment
- devoluciones
- depósitos
- canales de venta
- integraciones externas

La idea central de este tema es esta:

**stock no es una única cifra absoluta, sino una combinación de estados, ubicaciones, reservas, promesas y transiciones que el backend tiene que modelar con suficiente precisión para vender bien sin perder control operativo.**

Cuando eso se entiende, el diseño cambia mucho.

Se vuelve natural distinguir entre:

- físico
- reservado
- disponible
- confirmación
- liberación
- ajuste
- autoridad del dato
- consistencia crítica
- proyecciones y conciliación

Y eso nos deja listos para el siguiente tema, donde vamos a meternos en otra de las zonas más sensibles del comercio digital:

**pricing, promociones y reglas comerciales**.
