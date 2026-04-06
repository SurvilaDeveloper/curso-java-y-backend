---
title: "Precios, descuentos y totales enviados por el cliente: cuando la UI cotiza por el backend"
description: "Cómo entender los riesgos de aceptar precios, descuentos y totales enviados por el cliente en aplicaciones Java con Spring Boot. Por qué no alcanza con validar que el request tenga forma correcta y qué cambia cuando el backend toma como verdad económica un cálculo que la UI nunca debió cerrar."
order: 244
module: "Client-side trust y decisiones peligrosas basadas en el frontend"
level: "base"
draft: false
---

# Precios, descuentos y totales enviados por el cliente: cuando la UI cotiza por el backend

## Objetivo del tema

Entender por qué **precios**, **descuentos**, **subtotales**, **totales**, **costos de envío** y otros valores económicos enviados por el cliente forman una de las superficies más clásicas y más importantes de **client-side trust** en aplicaciones Java + Spring Boot.

La idea de este tema es continuar directamente lo que vimos sobre:

- client-side trust
- decisiones peligrosas basadas en el frontend
- UI como capa de experiencia y no como autoridad
- y el error de dejar que el backend acate conclusiones que el cliente nunca debió fijar por su cuenta

Ahora toca bajar esa intuición a un caso que aparece una y otra vez en productos reales:

- carrito
- checkout
- promociones
- cupones
- impuestos
- costo de envío
- packs
- bundles
- cantidades
- recargos
- totales finales
- precio “ya calculado” por la interfaz

Y justo ahí aparece una trampa muy común.

Porque desde frontend es totalmente normal calcular cosas para mostrar:

- subtotal visible
- descuento en tiempo real
- precio final estimado
- impuesto aproximado
- total con envío
- promo aplicada
- resumen del pedido

Todo eso está perfecto para UX.
El problema aparece cuando el backend toma esos mismos valores como si fueran la **verdad económica final** del sistema.

En resumen:

> precios, descuentos y totales enviados por el cliente importan porque el riesgo no está solo en que un usuario pueda alterar un número,  
> sino en que el backend acepte como autoridad contable o comercial una cotización construida del lado del frontend, que como mucho debía servir para mostrar y guiar, pero no para cerrar la decisión final de negocio.

---

## Idea clave

La idea central del tema es esta:

> el frontend puede **mostrar** un precio,  
> pero el backend tiene que **decidirlo**.

Eso cambia mucho la forma de diseñar checkouts y operaciones monetarias.

Porque una cosa es pensar:

- “la UI ya calculó el total”
- “la app ya aplicó el descuento”
- “el carrito ya trae el importe final”
- “el cliente ya mandó el monto correcto”

Y otra muy distinta es preguntarte:

- “¿qué parte de ese total reconstruye el servidor?”
- “¿qué promociones valida de nuevo?”
- “¿qué precio de catálogo vuelve a buscar?”
- “¿qué pasa si el cliente manda otro número?”
- “¿qué parte del cálculo depende del estado vivo del negocio?”
- “¿el servidor está usando el monto del cliente como propuesta o como verdad?”

### Idea importante

La UI puede presentar una cotización.
La autoridad final sobre el importe real tiene que seguir viviendo del lado del servidor.

### Regla sana

Cada vez que el cliente mande un valor monetario derivado, preguntate si el backend lo recalcula o si simplemente lo acepta.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- aceptar `total`, `finalPrice` o `discount` tal como vienen del frontend
- confiar en que la UI aplicó bien una promo o un cupón
- usar cantidades y precios del request como si ya fueran consistentes con el catálogo actual
- tomar costos de envío del cliente como cerrados
- no reconstruir impuestos, recargos o reglas comerciales del lado servidor
- tratar el request económico como si fuera un comprobante final y no una propuesta del cliente

Es decir:

> el problema no es solo que el cliente pueda mandar números.  
> El problema es **qué parte de la verdad económica el backend deja de calcular por confiar en la cotización que ya viene armada desde la interfaz**.

---

## Error mental clásico

Un error muy común es este:

### “El frontend ya calcula el total, el backend solo lo procesa”

Eso puede sonar práctico.
Pero suele ser demasiado riesgoso.

Porque todavía conviene preguntar:

- ¿con qué precios de catálogo calculó?
- ¿qué promo usó?
- ¿qué vigencia tenía esa promo?
- ¿el cupón seguía siendo válido?
- ¿las cantidades siguen disponibles?
- ¿ese envío sigue costando lo mismo?
- ¿ese total sigue siendo coherente con el estado actual del carrito y del negocio?

### Idea importante

El hecho de que la UI pueda calcular algo no la vuelve autoridad sobre ese cálculo.

---

# Parte 1: Qué significa “la UI cotiza por el backend”

## La intuición simple

Podés pensar este problema así:

1. el frontend arma o calcula un resumen económico
2. se lo muestra al usuario
3. el usuario confirma
4. el backend recibe ese mismo resumen o una parte de él
5. y en lugar de reconstruir la verdad, lo toma como base suficiente para cobrar, reservar o registrar

### Idea útil

Ahí la UI deja de ser una capa de presentación y pasa a comportarse como motor de pricing o de policy comercial.

### Regla sana

El cliente puede proponer qué quiere comprar.
El servidor debe decidir cuánto cuesta realmente.

---

# Parte 2: Mostrar no es cerrar

Este es uno de los aprendizajes más importantes del tema.

El frontend necesita mostrar cosas como:

- precio unitario
- subtotal
- descuentos estimados
- envío estimado
- impuestos aproximados
- total visible

Eso está bien.
Pero mostrar un valor y cerrar el valor son operaciones distintas.

### Idea importante

El precio mostrado sirve para interacción.
El precio final aceptado por el sistema debe reconstruirse con autoridad del lado servidor.

### Regla sana

No confundas:
- valor de UX
con
- valor contable, contractual o de negocio.

### Idea útil

La interfaz puede ser una calculadora visual.
El backend tiene que ser el árbitro final.

---

# Parte 3: El precio no es solo un número; es una política

Otra razón por la que este tema importa es que el precio final muchas veces depende de varias reglas a la vez:

- catálogo actual
- moneda
- descuentos vigentes
- cupones
- restricciones por usuario
- promociones por tenant o región
- combinaciones permitidas
- stock
- impuestos
- costo de envío
- cantidades mínimas o máximas
- redondeos
- reglas temporales

### Idea importante

Aceptar un `total` desde el cliente no es solo aceptar un número.
Es aceptar una **conclusión de política comercial** que la UI nunca debió cerrar sola.

### Regla sana

Cada vez que el monto final dependa de varias reglas del negocio, asumí que el backend debe reconstruirlo, no solo recibirlo.

---

# Parte 4: Los descuentos son especialmente tentadores y especialmente peligrosos

Esto aparece muchísimo con campos como:

- `discount`
- `discountAmount`
- `discountPercent`
- `couponApplied`
- `promotionId`
- `finalPrice`
- `priceAfterDiscount`

### Problema

La UI puede haber hecho algo como:

- aplicar mal la promo
- usar una promo vencida
- combinar descuentos que no deberían acumular
- calcular con datos viejos
- o simplemente enviar un valor alterado

### Idea útil

No hace falta imaginar fraude sofisticado.
Basta con que el backend trate el descuento ya resuelto por el cliente como si fuera la policy comercial misma.

### Regla sana

Cada vez que un descuento llegue desde el cliente, preguntate si el backend lo usa como evidencia o como input para recalcular desde reglas propias.

### Idea importante

La promo válida no debería venir “decidida” desde el navegador.

---

# Parte 5: Cantidad, precio unitario y total forman una tríada muy frágil

Otra fuente clásica de errores es recibir cosas como:

- `quantity`
- `unitPrice`
- `lineTotal`
- `cartTotal`

y asumir que ya vienen coherentes entre sí.

### Problema

Aun si el usuario quisiera comprar algo legítimo, el backend debería poder responder:

- ¿este precio unitario sigue vigente?
- ¿la cantidad es posible?
- ¿la línea corresponde al producto real?
- ¿el total refleja bien la multiplicación y los descuentos válidos?
- ¿el redondeo y la moneda son los correctos?

### Idea útil

No alcanza con que los números “cierren matemáticamente”.
También tienen que cerrar contra el catálogo, la promo y las reglas reales del sistema.

### Regla sana

La coherencia entre campos económicos tiene que ser reconstruida por el backend, no presumida a partir del request.

---

# Parte 6: Envío, impuestos y recargos también son policy, no decoración

A veces el equipo sí recalcula precio base, pero trata otras partes como menos críticas:

- shipping
- tax
- surcharge
- fee
- serviceCost
- insurance
- handling

Eso puede parecer secundario, pero siguen siendo parte del importe real.

### Idea importante

No hay mucha diferencia conceptual entre confiar en `price` y confiar en `shippingCost` o `taxAmount` si ambos afectan lo que el sistema termina cobrando o registrando.

### Regla sana

Cada componente monetario que altere el total final merece la misma pregunta:
- “¿lo decide el backend o solo lo recibe?”

### Idea útil

Descomponer el monto en varias piezas no vuelve confiable a ninguna de ellas por el solo hecho de venir separadas.

---

# Parte 7: El carrito del cliente no es la verdad del pedido

Otra trampa frecuente:
tratar el carrito serializado del frontend como si ya fuera el pedido “casi definitivo”.

Pero entre lo que la UI tiene y lo que el sistema debería aceptar pueden haber cambiado cosas como:

- precio vigente
- descuento habilitado
- disponibilidad
- impuestos
- shipping rate
- restricciones del cupón
- límite por usuario
- campaña activa
- tenant o región

### Idea útil

El carrito del cliente es una propuesta de compra.
No es todavía la representación final del compromiso económico del backend.

### Regla sana

No transformes automáticamente “contenido del carrito del cliente” en “verdad contable del pedido”.

### Idea importante

El checkout no debería ser la serialización directa de la UI hacia la contabilidad.

---

# Parte 8: “Pero la app oficial manda eso” no cambia la naturaleza del dato

Este argumento aparece mucho:

- “eso lo calcula nuestra SPA”
- “eso lo manda la app móvil oficial”
- “ese campo lo arma React”
- “el usuario normal ni lo ve”

### Problema

Nada de eso cambia el punto central:
sigue siendo dato del cliente.
Sigue pudiendo llegar distinto.
Sigue pudiendo quedar viejo.
Sigue sin ser autoridad final del negocio.

### Idea útil

La procedencia “bonita” del cálculo no lo convierte en policy del servidor.

### Regla sana

No subas el nivel de confianza de un importe solo porque lo produjo tu propio frontend.

---

# Parte 9: Qué patrones merecen sospecha inmediata

Conviene sospechar especialmente cuando veas cosas como:

- `finalPrice`, `total`, `subtotal`, `discountAmount` en DTOs de checkout
- `shippingCost` o `taxAmount` enviados desde la UI
- cupones resueltos del lado cliente y solo “confirmados” en backend
- líneas de carrito con precio unitario enviado por el request
- backends que “solo validan formato” del monto
- lógica donde el frontend parece actuar como motor de pricing
- equipos que justifican con “la UI ya lo calcula”

### Idea útil

No hace falta que el request sea obviamente malicioso.
Basta con que el backend haya renunciado a recomponer la verdad económica.

### Regla sana

Cada vez que un request traiga un número monetario ya derivado, revisá si el servidor lo usa para mostrar o para decidir.

---

# Parte 10: Qué preguntas conviene hacer en una review

Cuando revises precios, descuentos y totales enviados por el cliente, conviene preguntar:

- ¿qué valores monetarios manda el request?
- ¿cuáles de esos valores son simples datos y cuáles son resultados ya calculados?
- ¿qué reconstruye el backend?
- ¿qué parte del catálogo o pricing consulta de nuevo?
- ¿qué valida del cupón o promo?
- ¿qué pasa si el cliente manda otro total?
- ¿qué pasa si el monto mostrado por la UI no coincide con la policy actual?
- ¿el backend está procesando una compra o aceptando una cotización del cliente?

### Idea importante

La review buena no termina en:
- “el frontend manda el total”
Sigue hasta:
- “¿quién tiene realmente la autoridad de pricing en este sistema?”

---

# Parte 11: Qué revisar en una app Spring

En una app Spring, conviene sospechar especialmente cuando veas:

- DTOs de checkout con montos finales
- servicios que reciben `price`, `subtotal`, `discount`, `total`
- promociones aplicadas en frontend y apenas corroboradas
- endpoints que aceptan cantidades + precio unitario directo
- `shippingCost` y `taxAmount` enviados por el cliente
- lógica de pedido donde el backend no vuelve a mirar catálogo, promo y reglas vigentes
- cálculos complejos hechos en JS y tratados como si el backend solo tuviera que persistirlos

### Idea útil

Si el backend no puede explicar cómo reconstruye el importe final desde sus propias reglas, probablemente ya está confiando demasiado en la UI.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- frontend usado para estimar y mostrar
- backend que recalcula precio final y descuentos válidos
- menor cantidad de montos “ya cerrados” aceptados del cliente
- mejor separación entre intención de compra y decisión final de pricing
- equipos que entienden que UX de carrito y verdad contable no son lo mismo

### Idea importante

La madurez aquí se nota cuando el servidor nunca pierde la autoridad final sobre cuánto vale realmente la operación.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- “el frontend ya calcula el total”
- cupones aplicados del lado cliente como verdad final
- imports monetarios aceptados casi tal cual
- shipping e impuestos tratados como secundarios
- la app oficial usada como argumento de confianza
- el equipo no distingue entre precio mostrado y precio decidido por el backend

### Regla sana

Si una operación monetaria depende de que el cliente no altere ni envejezca un cálculo que el backend nunca reconstruye, probablemente ya hay demasiada confianza puesta en el frontend.

---

## Checklist práctica

Para revisar precios, descuentos y totales enviados por el cliente, preguntate:

- ¿qué valores monetarios vienen en el request?
- ¿cuáles son datos base y cuáles son cálculos derivados?
- ¿qué recalcula el backend?
- ¿qué parte de la policy comercial consulta en vivo?
- ¿qué haría el sistema si el cliente mandara otro total?
- ¿qué componente monetario se está aceptando por comodidad?
- ¿qué revisarías si asumieras que la UI solo puede proponer, no decidir?

---

## Mini ejercicio de reflexión

Tomá un checkout real de tu app Spring y respondé:

1. ¿Qué montos manda el frontend?
2. ¿Qué parte del precio final depende de reglas del negocio?
3. ¿Qué parte de eso recalcula el backend?
4. ¿Qué campo sería más peligroso si se alterara?
5. ¿Qué parte del equipo sigue defendiendo con “la UI ya lo hace”?
6. ¿Qué pasaría si una promo, un precio o un envío cambian entre render y confirmación?
7. ¿Qué revisarías primero después de este tema?

---

## Resumen

Los precios, descuentos y totales enviados por el cliente importan porque el riesgo no está solo en que un usuario pueda tocar un número, sino en que el backend deje de ejercer la autoridad final sobre una decisión económica y acepte como verdad una cotización construida del lado del frontend.

La gran intuición del tema es esta:

- mostrar no es cerrar
- el precio es política, no solo aritmética
- descuentos, impuestos y envío también son parte de esa policy
- el carrito del cliente es propuesta, no verdad contable
- y la pregunta importante no es si la UI puede calcular, sino si el backend sigue decidiendo de verdad cuánto vale la operación

En resumen:

> un backend más maduro no trata los valores económicos enviados por el cliente como si fueran el resultado final de una decisión ya resuelta, sino como una propuesta de interacción que todavía debe reconciliarse con catálogo, promociones, reglas vigentes, impuestos, envío y restricciones reales del sistema.  
> Entiende que la pregunta importante no es solo si el monto “parece correcto”, sino si el servidor puede reconstruir por sí mismo por qué ese monto debería ser exactamente ese y no otro.  
> Y justamente por eso este tema importa tanto: porque muestra una de las formas más clásicas y más costosas de client-side trust, la de dejar que la interfaz no solo muestre el precio, sino que en los hechos lo dicte, que es una de las maneras más directas de convertir UX en autoridad económica del lado equivocado.

---

## Próximo tema

**Wizards, pasos completados y estado del flujo declarado por el cliente**
