---
title: "Cómo pensar catálogo, productos, variantes, precio y stock en un e-commerce Spring Boot sin modelarlos como si fueran campos planos ni reglas triviales"
description: "Entender por qué un e-commerce serio en Spring Boot necesita pensar mejor catálogo, variantes, precio y stock, y cómo modelar estas piezas con más criterio para no romper negocio, operación ni crecimiento cuando aparece complejidad real."
order: 152
module: "E-commerce profesional"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo pensar:

- el dominio real de un e-commerce
- entidades de negocio
- reglas
- estados
- invariantes
- operación humana
- flujos críticos
- y por qué un backend Spring Boot serio no debería reducir un e-commerce a un CRUD de productos y pedidos

Eso te dejó una idea muy importante:

> si querés construir un e-commerce serio, no alcanza con reconocer que el dominio es más grande; también tenés que empezar a modelar correctamente algunas de sus piezas más delicadas, y entre las primeras aparecen catálogo, variantes, precio y stock.

Y en cuanto aparece esa idea, surge una pregunta muy natural:

> si producto, precio y stock parecen conceptos tan básicos, ¿por qué tantas implementaciones de e-commerce se rompen justamente ahí cuando el negocio empieza a volverse real?

Porque una cosa es hacer un ejemplo donde cada producto tiene:

- nombre
- descripción
- precio
- stock
- imagen

Y otra muy distinta es sostener un catálogo real cuando empiezan a aparecer cosas como:

- variantes por talle, color, capacidad o presentación
- precios promocionales y listas distintas
- moneda
- impuestos
- stock por sucursal o depósito
- reservas temporales
- productos compuestos
- visibilidad comercial
- productos agotados pero publicables
- lanzamientos programados
- bundles
- disponibilidad parcial
- productos físicos y digitales
- backoffice que corrige datos
- integraciones externas de inventario
- y reglas que cambian según canal o contexto

Ahí aparecen ideas muy importantes como:

- **catálogo**
- **producto**
- **SKU**
- **variante**
- **atributos**
- **precio publicado**
- **precio efectivo**
- **stock disponible**
- **stock reservado**
- **disponibilidad comercial**
- **estado de publicación**
- **fuente de verdad**
- **consistencia operativa**
- **modelo comercial vs modelo físico**

Este tema es clave porque muchas implementaciones caen en una simplificación demasiado tentadora:

- una tabla de producto
- un campo price
- un campo stock
- un campo imageUrl
- y listo

Eso puede servir para aprender o para una demo.
Pero casi siempre queda demasiado chico para un e-commerce real.

La madurez empieza cuando dejás de preguntar solo:

> “¿cómo guardo un producto?”

Y empezás a preguntar algo mucho más útil:

> “¿qué estoy modelando exactamente cuando digo producto, qué parte es comercial, qué parte es operativa, qué parte es inventario y qué reglas necesito proteger para no romper ventas ni backoffice?”

## El problema de modelar todo como campos planos

Cuando un e-commerce todavía es simple, muchas veces se hace algo así:

- Product
- name
- description
- price
- stock
- image
- categoryId

Y parece razonable.
Pero con el tiempo esa forma empieza a mostrar límites.

Porque enseguida surgen preguntas como:

- ¿el stock pertenece al producto o a una variante?
- ¿el precio es único o depende de la variante?
- ¿el producto puede venderse aunque no tenga stock hoy?
- ¿la visibilidad depende de inventario o de una decisión comercial?
- ¿qué pasa con un producto discontinuado pero todavía visible para órdenes viejas?
- ¿qué campo representa “hay stock”, cuál representa “se puede vender” y cuál representa “se puede mostrar”? 
- ¿qué pasa si una promo cambia el precio sin tocar el precio base?
- ¿qué SKU compra realmente el cliente cuando elige color y talle?

Entonces aparece una verdad muy importante:

> producto, precio y stock parecen simples solo mientras el negocio todavía no los exige demasiado.

## Qué significa pensar catálogo de forma más madura

Dicho simple:

> significa dejar de ver el catálogo como una lista plana de ítems y empezar a verlo como la representación comercial de lo que la tienda decide mostrar, vender, ordenar y operar.

La palabra importante es **representación**.

Porque el catálogo no es solo inventario.
Tampoco es solo marketing.
Tampoco es solo un conjunto de filas.

El catálogo expresa cosas como:

- qué existe para el cliente
- cómo se agrupa
- cómo se descubre
- qué variantes tiene
- qué precio muestra
- si puede comprarse
- bajo qué condiciones
- en qué orden aparece
- qué atributos lo describen
- y qué parte de esa información es pública, operativa o interna

Es decir:
catálogo no es únicamente persistencia.
También es organización comercial.

## Una intuición muy útil

Podés pensar así:

- inventario responde “qué tengo y cuánto”
- catálogo responde “qué muestro, cómo lo vendo y cómo lo entiende el cliente”

La diferencia ordena muchísimo.

## Qué diferencia hay entre producto y variante

Muy importante.

En muchos e-commerce reales, el **producto** no es exactamente la unidad que se compra.
Muchas veces el cliente compra una **variante** concreta.

Por ejemplo:

- remera básica = producto
- remera básica, color negro, talle M = variante

O:

- disco SSD = producto
- SSD 1TB = variante
- SSD 2TB = variante

O:

- perfume línea clásica = producto
- perfume 50 ml = variante
- perfume 100 ml = variante

Entonces otra verdad importante es esta:

> el producto suele ser una entidad más comercial o de catálogo, mientras que la variante suele estar mucho más cerca de la unidad concreta que tiene precio, SKU y stock reales.

No siempre tiene que modelarse exactamente así.
Pero en muchísimos casos esa separación ayuda muchísimo.

## Qué significa pensar SKU con más criterio

Cuando aparece operación real, suele necesitarse un identificador más preciso para la unidad vendible concreta.
Ahí entra el concepto de **SKU**.

Podés pensarlo así:

> el SKU identifica la unidad comercial específica que realmente se vende, se trackea, se reserva y se mueve en operación.

Eso importa porque:

- el cliente selecciona una variante concreta
- el stock suele vivir ahí
- el picking y fulfillment suelen necesitar eso
- las integraciones externas muchas veces se apoyan en eso
- los reportes más útiles suelen bajar a ese nivel

Entonces modelar todo como si el producto genérico fuera siempre la unidad vendible suele ser demasiado ingenuo.

## Qué relación tiene esto con el precio

Absolutamente fuerte.

El precio también suele parecer simple al principio:

- un número
- una moneda
- y listo

Pero en negocio real enseguida aparecen tensiones como:

- precio base vs precio promocional
- precio por variante
- precio por canal
- precio vigente según fecha
- precio mostrado vs precio efectivamente cobrado
- precio con impuesto incluido o separado
- descuentos acumulables o no
- listas especiales
- campañas temporales
- reglas de redondeo
- congelamiento del precio al ordenar

Entonces aparece otra verdad muy importante:

> “el precio del producto” casi nunca es un único dato simple; muchas veces es el resultado de reglas comerciales, contexto y momento.

## Qué diferencia hay entre precio publicado y precio efectivo

Muy útil distinguir esto.

### Precio publicado
Es el que el cliente ve en catálogo o PDP.
Puede incluir:

- precio regular
- precio tachado
- descuento visible
- promoción vigente
- comunicación comercial

### Precio efectivo
Es el que realmente termina aplicándose a la unidad comprada bajo ciertas reglas.
Puede depender de:

- variante elegida
- promo válida
- cupón
- canal
- fecha
- moneda
- regla fiscal
- restricciones de combinación

No siempre conviene modelarlos como entidades separadas.
Pero sí conviene pensar la diferencia conceptual.
Porque muchas implementaciones se rompen cuando usan un solo campo para expresar demasiadas cosas distintas.

## Qué relación tiene esto con la orden

Importantísima.

Porque cuando una orden se confirma, normalmente no conviene depender de que el catálogo futuro siga igual.
La orden necesita **snapshot** suficiente de lo comprado.

Por ejemplo:

- nombre al momento de compra
- precio al momento de compra
- variante elegida
- cantidad
- moneda
- descuentos aplicados
- atributos relevantes
- SKU comprado

Entonces otra idea clave es esta:

> la orden no debería depender frágilmente de que el producto siga intacto, visible o igual en el catálogo tiempo después.

Eso cambia mucho cómo pensás persistencia y consistencia.

## Qué significa pensar stock de forma menos ingenua

Stock suele ser de las partes más maltratadas en implementaciones rápidas.
Muchas veces se modela como:

- stock = 12

Y listo.

Pero en un e-commerce serio suelen importar distinciones como:

- stock físico
- stock disponible para vender
- stock reservado
- stock comprometido por órdenes aún no pagadas
- stock en tránsito
- stock por depósito
- stock de seguridad
- stock sincronizado desde otro sistema
- stock virtual para bundles o kits

Entonces aparece una verdad muy importante:

> stock no siempre responde solo “cuánto hay”, sino también “cuánto puedo vender ahora con seguridad razonable”.

## Qué diferencia hay entre disponibilidad y stock

Muy útil también.

Un producto puede:

- tener stock y no estar visible
- estar visible y no tener stock
- no tener stock pero permitir precompra
- tener stock en un depósito no habilitado para ese canal
- estar discontinuado pero seguir existiendo en histórico

Entonces conviene no mezclar demasiado rápido:

- stock
- visibilidad
- vendibilidad
- disponibilidad comercial

Porque son conceptos cercanos, pero no iguales.

## Una intuición muy útil

Podés pensar así:

- stock responde “qué puedo respaldar físicamente u operativamente”
- disponibilidad responde “qué decido permitir comercialmente”

Esa diferencia evita muchísimos parches después.

## Qué relación tiene esto con reservas de stock

Muy fuerte.

En checkout real aparece una tensión importante:

- si no reservás nada hasta el final, podés vender más de lo que tenés
- si reservás demasiado pronto, bloqueás inventario que quizás nunca se convierte en venta

Entonces empiezan preguntas como:

- ¿cuándo se reserva stock?
- ¿al agregar al carrito?
- ¿al iniciar checkout?
- ¿al autorizar pago?
- ¿al confirmar la orden?
- ¿cuánto dura la reserva?
- ¿cómo se libera?
- ¿qué pasa si falla el pago o expira el intento?

No hay una única respuesta universal.
Pero sí aparece algo importante:

> stock e interacción de compra están muchísimo más acoplados de lo que parece, y modelarlos mal rompe confianza, conversión u operación.

## Qué relación tiene esto con concurrencia

Total.

El inventario real hace aparecer problemas como:

- dos clientes comprando la última unidad
- una promo que dispara compras simultáneas
- jobs que sincronizan stock desde un ERP
- backoffice corrigiendo inventario mientras hay checkout en curso
- cancelaciones que devuelven stock
- pagos demorados que confirman tarde

Entonces precio y stock no son solo temas de modelado estático.
También son temas de:

- consistencia
- locking
- transacciones
- idempotencia
- eventos
- orden de operaciones

Eso los vuelve mucho más delicados.

## Qué relación tiene esto con Spring Boot

Directísima.

Porque en un backend Spring Boot serio estas preguntas impactan en:

- entidades y agregados
- DTOs de catálogo
- servicios de pricing
- servicios de inventario
- validaciones de checkout
- transacciones
- repositorios
- eventos internos o externos
- jobs de sincronización
- backoffice
- diseño de endpoints

Spring Boot te da una base muy buena para organizar todo eso.
Pero el framework no decide por vos:

- si la variante merece identidad propia
- dónde vive el stock real
- cómo se calcula el precio vigente
- qué snapshot guarda la orden
- cómo se hacen reservas
- qué reglas manda el catálogo y cuáles manda inventario

Eso sigue siendo criterio de negocio, modelado y arquitectura.

## Qué relación tiene esto con backoffice

Absolutamente fuerte.

Porque cuando el negocio ya es real, catálogo y stock no viven solo del lado del cliente final.
También existen preguntas operativas como:

- quién publica o despublica productos
- quién corrige precios
- quién corrige stock
- qué cambios quedan auditados
- qué cambios pueden hacerse manualmente
- qué cambios vienen de integraciones externas
- cómo evitar que una edición rompa variantes ya vendidas
- cómo se evita que una promo deje inconsistencias

Entonces modelar producto, precio y stock sin mirar backoffice suele dejar un backend incompleto.

## Qué relación tiene esto con integraciones externas

Muy fuerte también.

Muchos e-commerce reales no son la única fuente de verdad para todo.
A veces el stock o parte del catálogo vienen de:

- ERP
- OMS
- WMS
- sistema de sucursales
- integraciones de marketplace
- proveedores externos

Eso cambia mucho la conversación.
Porque entonces ya no alcanza con tener campos en la base.
También importa:

- quién manda sobre qué dato
- cada cuánto se sincroniza
- qué conflictos se aceptan
- qué pasa si falla una sincronización
- qué dato se considera más confiable
- qué latencia de actualización tolerás

Entonces otra verdad importante es esta:

> producto, precio y stock no solo son entidades internas; muchas veces también son fronteras de integración.

## Qué no conviene hacer

No conviene:

- modelar producto y variante como si siempre fueran lo mismo
- mezclar en un solo campo todas las ideas de precio posibles
- usar un solo stock plano para cualquier escenario
- confundir visibilidad con disponibilidad y con inventario
- depender del catálogo vivo para reconstruir una orden histórica
- ignorar reservas, concurrencia y consistencia
- diseñar todo pensando solo en la UI y no en operación real
- asumir que catálogo es puro marketing o que stock es solo un número

Ese tipo de simplificación suele explotar justo cuando el negocio empieza a moverse de verdad.

## Otro error común

Pensar que el modelado correcto consiste en meter todas las posibilidades desde el día uno.
Tampoco.

No hace falta construir una monstruosidad ultraabstracta.
La idea no es sobreingeniería.
La idea es distinguir bien conceptos que después no querés mezclar mal.

Muchas veces alcanza con empezar por algo así:

- producto como entidad comercial principal
- variante como unidad vendible concreta cuando haga falta
- stock a nivel variante si el negocio lo exige
- precio base claramente separado de promociones o reglas dinámicas
- snapshot de orden bien guardado
- estados comerciales explícitos

Eso ya ordena muchísimo mejor el crecimiento.

## Una buena heurística

Podés preguntarte:

- ¿qué compra realmente el cliente: un producto genérico o una variante concreta?
- ¿dónde debería vivir el SKU?
- ¿qué parte del precio es dato y qué parte es regla?
- ¿qué diferencia hay entre precio visible y precio cobrado?
- ¿qué stock representa cantidad física y cuál representa disponibilidad para vender?
- ¿el producto puede verse sin poder comprarse?
- ¿qué pasa con el stock cuando alguien inicia checkout y no termina?
- ¿qué snapshot necesita la orden para no depender del catálogo futuro?
- ¿qué datos corrige el backoffice y cuáles vienen de integraciones?
- ¿qué conflictos reales pueden aparecer cuando dos cosas cambian al mismo tiempo?

Responder eso te ayuda muchísimo a pensar mejor esta parte del dominio.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque en un e-commerce real aparecen preguntas como:

- “¿el stock va por producto o por variante?”
- “¿podemos tener color sin talle en algunos productos y ambos en otros?”
- “¿el precio promo pisa el base o se calcula aparte?”
- “¿qué guardamos en la orden si después cambia el producto?”
- “¿qué pasa si un usuario compra lo último mientras el stock se estaba sincronizando?”
- “¿un producto agotado se oculta o queda visible?”
- “¿cómo distinguimos producto publicado, vendible y disponible?”
- “¿qué pasa con packs, bundles o kits?”
- “¿qué corrige manualmente el admin y qué no?”

Responder bien eso exige bastante más que una tabla con `price` y `stock`.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> en un e-commerce serio construido con Spring Boot, catálogo, variantes, precio y stock no deberían modelarse como campos planos pegados a un producto genérico, sino como piezas distintas del dominio comercial y operativo que conviene separar con criterio para sostener mejor venta, consistencia, backoffice, crecimiento e integraciones reales.

## Resumen

- Catálogo no es solo inventario; también expresa organización comercial y experiencia de compra.
- Producto y variante muchas veces no son lo mismo, y distinguirlos mejora muchísimo el modelado.
- El SKU suele vivir más cerca de la unidad concreta que realmente se vende y opera.
- Precio no siempre es un único dato simple; muchas veces depende de reglas, contexto y momento.
- Stock tampoco es solo “cuánto hay”; importa mucho distinguir disponible, reservado y vendible.
- Visibilidad, disponibilidad comercial e inventario son conceptos cercanos pero no iguales.
- La orden necesita snapshot suficiente para no depender frágilmente del catálogo futuro.
- Spring Boot ayuda a organizar esta complejidad, pero no decide por vos el modelado de negocio.
- Este tema deja listo el terreno para entrar en carrito, checkout y composición de órdenes con una mirada más seria.

## Próximo tema

En el próximo tema vas a ver cómo pensar carrito, checkout y composición de órdenes en un e-commerce Spring Boot sin tratarlos como un simple formulario final, porque después de entender mejor catálogo, variantes, precio y stock, la siguiente pregunta natural es cómo transformar intención de compra en una orden consistente sin romper experiencia ni operación.
