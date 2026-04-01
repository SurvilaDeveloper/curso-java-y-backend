---
title: "Pricing, promociones y reglas comerciales"
description: "Cómo pensar precios en un e-commerce real, por qué precio no es solo un número fijo por producto, cómo convivien listas, monedas, impuestos, promociones, cupones y reglas de segmentación, qué conflictos aparecen cuando varias reglas compiten entre sí, y cómo diseñar un backend que calcule importes de forma consistente, explicable y auditable."
order: 194
module: "E-commerce profesional"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior vimos que inventario no es simplemente una cantidad.

Ahora vamos a entrar en otra de las zonas donde muchos e-commerce parecen sencillos hasta que el negocio empieza a crecer de verdad:

**el pricing**.

Porque al principio suele parecer que el precio también es algo trivial.

Algo como:

- producto
- precio

Y listo.

Pero apenas aparece operación real, esa idea deja de alcanzar.

Empiezan a aparecer preguntas como:

- ¿el precio cambia según el canal?
- ¿hay lista mayorista y minorista?
- ¿hay promociones por tiempo limitado?
- ¿un cupón se acumula con una promo automática?
- ¿el descuento aplica sobre precio con o sin impuestos?
- ¿qué pasa si una promoción afecta solo algunas variantes?
- ¿qué moneda se usa en catálogo y cuál en checkout?
- ¿cómo se redondea?
- ¿qué sucede si una regla cambia mientras el cliente está comprando?
- ¿cómo se explica después por qué una orden terminó con ese total?

Entonces la pregunta central de este tema es esta:

**¿cómo modelar precios y promociones para que el backend calcule bien, sea consistente, permita evolucionar reglas comerciales y no se vuelva un caos imposible de auditar?**

## El error inicial: creer que el precio vive fijo dentro del producto

El primer modelo ingenuo suele ser algo así:

- `product_id`
- `price`

Eso puede servir para una demo.

Pero en un comercio real rara vez alcanza.

Porque el negocio no necesita solo saber “cuánto vale este producto”.

Necesita saber cosas como:

- cuánto vale en este canal
- cuánto vale para este tipo de cliente
- cuánto vale en esta moneda
- cuánto vale hoy y cuánto valdrá mañana
- qué promociones lo afectan
- qué impuestos o recargos lo modifican
- qué precio se debe mostrar y cuál se debe cobrar
- qué precio efectivamente se usó en una orden ya cerrada

Entonces el precio no es solo un atributo estático.

Es una **decisión comercial contextual**.

## Precio de catálogo, precio de venta y precio final no son lo mismo

Esta distinción es una de las más importantes de todo el módulo.

### Precio de catálogo

Es el valor base que el negocio quiere exponer como referencia.

Por ejemplo:

- Zapatilla Runner X → 120000

### Precio promocional o efectivo de venta

Es el valor que finalmente aplica en cierto contexto.

Por ejemplo:

- Zapatilla Runner X con promo del 15% → 102000

### Precio final cobrado

Es lo que termina formando parte de la operación concreta, incluyendo el contexto completo.

Por ejemplo:

- descuento por campaña
- cupón adicional
- impuestos
- recargo por financiación
- redondeo final

Eso deja una idea clave:

**un producto puede tener varios precios válidos dependiendo del momento y del contexto, y una orden necesita congelar cuál fue el que realmente se usó.**

## Mostrar un precio no siempre es lo mismo que poder cobrarlo

Este problema aparece mucho en sistemas reales.

Una cosa es el precio que ve el usuario navegando catálogo.

Otra es el que se confirma cuando:

- entra al checkout
- elige envío
- selecciona medio de pago
- aplica cupón
- se recalculan impuestos
- cambia de país o región
- vence una promoción

Por eso el backend serio suele distinguir entre:

- precio de exhibición
- precio cotizado o calculado
- precio confirmado en la orden

Si eso no se entiende, aparecen errores como:

- el usuario vio un precio y pagó otro sin explicación clara
- una promo vencida siguió aplicándose por caché
- una regla de checkout modificó el total sin rastreo
- la orden quedó con importes que no pueden reconstruirse después

## El pricing vive en una línea de reglas, no en una única cifra

Igual que en inventario vimos que hay estados y transiciones, en pricing conviene pensar que el valor final suele salir de una **cadena de transformaciones**.

Por ejemplo:

1. precio base de lista
2. ajuste por canal
3. ajuste por segmento de cliente
4. promoción automática vigente
5. cupón aplicado
6. impuestos o recargos
7. redondeo
8. total congelado en la orden

Esto importa mucho porque cuando el negocio crece, el precio deja de ser solo “dato”.

Pasa a ser el resultado de una **política comercial ejecutada por el backend**.

## Un mismo producto puede tener más de una lista de precios

Muchos negocios no trabajan con una sola lista universal.

Aparecen escenarios como:

- precio minorista
- precio mayorista
- precio para distribuidores
- precio para clientes premium
- precio para marketplace
- precio para tienda propia
- precio para venta corporativa

Entonces una pregunta clave ya no es:

**¿cuál es el precio del producto?**

Sino:

**¿cuál es la fuente de precio que aplica en este contexto?**

Si el sistema no modela eso bien, termina resolviéndolo con `if` dispersos por todos lados.

Y ahí empieza el caos.

## Precio base y promociones no deberían mezclarse demasiado pronto

Un error común es guardar directamente el precio “ya con descuento” como si fuera el precio real del producto.

Eso trae varios problemas:

- cuesta saber cuánto valía originalmente
- no queda claro si el descuento fue una promo o una lista especial
- resulta difícil quitar la campaña sin tocar datos estructurales
- se vuelve opaco explicar el ahorro real al cliente
- se complica muchísimo auditar órdenes históricas

Por eso suele ser más sano separar conceptos como:

- precio base
- regla promocional
- descuento aplicado
- precio resultante

No siempre hace falta una arquitectura gigantesca.

Pero sí conviene que el sistema pueda distinguir entre **valor base** y **transformaciones comerciales**.

## Las promociones son reglas, no solo porcentajes

Al principio parece que promocionar es simplemente restar un porcentaje.

Pero en operación real aparecen muchos formatos distintos.

Por ejemplo:

- 10% de descuento
- 2x1
- 3x2
- segunda unidad al 50%
- monto fijo de descuento
- envío gratis a partir de cierto subtotal
- descuento por categoría
- descuento por marca
- descuento por cliente nuevo
- descuento por medio de pago
- cupón para una campaña específica
- regalo con compra

Eso muestra que una promoción no es solo un número.

Es una **regla con condiciones y efectos**.

Y esas condiciones pueden depender de:

- vigencia temporal
- canal
- país o región
- stock disponible
- cliente o segmento
- cantidad comprada
- combinación de productos
- medio de pago
- subtotal mínimo
- primer compra o compras recurrentes

Entonces el backend no necesita solo “guardar descuento”.

Necesita evaluar reglas.

## No todas las promociones deberían combinarse entre sí

Este es uno de los lugares donde más se rompen los sistemas comerciales.

El negocio suele querer definir cosas como:

- esta promo se acumula con cupones
- esta otra no
- el descuento por categoría no combina con el de marca
- el envío gratis sí se puede sumar
- el precio mayorista excluye promociones automáticas
- la promo de lanzamiento no puede coexistir con financiación especial

Si el sistema no tiene una política clara de combinación, aparecen resultados absurdos.

Por ejemplo:

- descuentos dobles no previstos
- precios negativos o casi nulos
- beneficios incompatibles ejecutándose juntos
- resultados distintos según el orden del cálculo

Entonces una parte importante del diseño es definir:

- qué reglas pueden coexistir
- cuáles son excluyentes
- cuál tiene prioridad
- cuál gana si hay conflicto

## El orden del cálculo importa muchísimo

Este punto parece técnico, pero en realidad es comercial.

No da lo mismo hacer esto:

1. aplicar cupón
2. luego calcular impuesto

que esto otro:

1. calcular impuesto
2. luego aplicar cupón

Tampoco da igual:

- aplicar porcentaje sobre precio base
- aplicar porcentaje sobre precio ya rebajado
- aplicar descuento fijo antes o después del recargo de financiación

Por eso el pricing necesita una política explícita de cálculo.

No debería depender de “cómo quedó implementado”.

Una secuencia clara evita que el sistema produzca resultados inconsistentes entre:

- catálogo
- checkout
- panel interno
- facturación
- devoluciones
- reportes

## El redondeo parece pequeño hasta que deja de serlo

Muchos bugs comerciales aparecen por redondeo.

Por ejemplo:

- descuentos porcentuales con decimales largos
- impuestos calculados por línea versus sobre subtotal
- cuotas con prorrateo
- múltiples monedas
- promociones repartidas entre varios ítems

Y ahí aparecen preguntas delicadas:

- ¿se redondea por ítem o al final?
- ¿se redondea hacia arriba, hacia abajo o al más cercano?
- ¿el total final puede no coincidir exactamente con la suma visual de los ítems?
- ¿cómo se reparte un descuento global entre líneas de orden?

Si esto no se define bien, después aparecen diferencias entre:

- lo que vio el cliente
- lo que cobró el gateway
- lo que quedó en la orden
- lo que se exportó a facturación

El redondeo no es un detalle cosmético.

Es parte del diseño del dinero.

## Moneda, tipo de cambio y pricing internacional agregan otra capa entera

En un e-commerce local y simple puede que todo ocurra en una sola moneda.

Pero en sistemas más amplios aparecen casos como:

- catálogo en una moneda y cobro en otra
- listas distintas por país
- reglas tributarias diferentes por región
- conversión a tipo de cambio del día
- precios psicológicos específicos por mercado

Eso hace que la pregunta ya no sea solo “cuánto vale”.

Pasa a ser:

- ¿en qué moneda está definido el precio base?
- ¿en qué moneda se muestra?
- ¿en qué moneda se cobra?
- ¿qué tipo de cambio se usó?
- ¿ese tipo de cambio debe quedar congelado para la orden?

En pricing internacional, guardar solo un número es una invitación al desastre.

## El cliente necesita precios entendibles; el backend necesita precios explicables

Esto es muy importante.

No alcanza con que el cálculo dé un número correcto.

En sistemas sanos, conviene poder explicar:

- cuál era el precio base
- qué promociones aplicaron
- qué cupón intervino
- qué recargo o impuesto se sumó
- por qué una regla no aplicó
- por qué una promoción ganó sobre otra

Esa explicabilidad sirve para:

- soporte al cliente
- auditoría interna
- debugging
- reclamos comerciales
- conciliación de órdenes
- análisis de campañas

Si el sistema solo guarda el total final sin contexto, después entender incidentes cuesta muchísimo.

## Congelar el precio en la orden es fundamental

Una vez que la orden se confirma, el sistema debería guardar una foto suficientemente completa del pricing utilizado.

Porque después pueden cambiar:

- listas de precios
- campañas
- cupones
- impuestos
- reglas comerciales
- costos financieros

Y sin embargo la orden histórica debe seguir siendo consistente.

Por eso conviene persistir cosas como:

- precio unitario usado
- descuentos aplicados
- reglas promocionales relevantes
- subtotal por línea
- totales agregados
- moneda
- impuestos
- recargos
- total final

La orden no debería depender de recalcular todo desde las reglas actuales.

Debe poder sostenerse sola.

## El pricing de catálogo y el pricing de checkout no siempre tienen la misma responsabilidad

Esto suele ayudar mucho a ordenar la arquitectura.

### Pricing de catálogo

Busca responder rápido cosas como:

- qué precio mostrar
- qué etiqueta promocional exponer
- cuál es el precio tachado
- cuál es el ahorro estimado

### Pricing de checkout

Busca calcular con precisión el monto que se va a cobrar.

Incluye cosas como:

- dirección o región
- envío
- impuestos concretos
- medio de pago
- cupones reales
- validaciones de vigencia
- reglas de no acumulación

Si se mezcla todo en una sola capa improvisada, suele pasar que:

- catálogo queda demasiado pesado
- checkout depende de cálculos poco confiables
- hay diferencias entre lo que se muestra y lo que se cobra

## Reglas comerciales y reglas técnicas no son lo mismo

Otra fuente común de desorden es mezclar decisiones comerciales con detalles técnicos.

Por ejemplo:

- “el 2x1 no aplica con mayorista” → regla comercial
- “la promo se evalúa después del price list resolver” → regla técnica de ejecución

Ambas importan.

Pero conviene distinguirlas.

Porque una cosa es la política de negocio.

Y otra es cómo el sistema la implementa con orden y consistencia.

Cuando eso se mezcla demasiado, el código se llena de condiciones opacas difíciles de mantener.

## Los cupones agregan identidad, vigencia y restricciones

Un cupón no es solo un string.

Suele traer condiciones como:

- vigencia temporal
- cantidad máxima de usos
- límite por usuario
- monto mínimo
- categorías incluidas o excluidas
- canales válidos
- tipo de cliente
- primera compra o no
- acumulable o excluyente

Además, los cupones suelen requerir trazabilidad adicional:

- quién lo creó
- en qué campaña nació
- cuántas veces se usó
- en qué órdenes impactó
- si fue público o privado

Entonces el backend necesita tratarlos como entidades comerciales reales, no como un parche que “resta algo al total”.

## No toda regla tiene que resolverse en tiempo real si el negocio no lo necesita

En algunos contextos conviene calcular precios en tiempo real.

En otros, puede servir precomputar ciertas proyecciones.

Por ejemplo:

- precio visible por canal
- etiqueta de descuento en catálogo
- ranking de productos en oferta

Pero hay otras partes donde la recalculación en tiempo real sí suele importar mucho.

Por ejemplo:

- validación final del cupón
- vigencia exacta de una promo
- disponibilidad de financiación
- impuestos según destino
- total final del checkout

Entonces la pregunta correcta no es:

**¿todo el pricing tiene que calcularse siempre on the fly?**

Sino:

**¿qué partes conviene proyectar para velocidad y qué partes conviene recalcular para precisión?**

## Pricing e inventario a veces se cruzan más de lo que parece

Hay promociones que dependen del stock.

Por ejemplo:

- liquidación hasta agotar stock
- descuento especial para remanente
- precio distinto para últimas unidades
- campañas limitadas por cantidad vendida

Eso genera una interacción delicada entre dos dominios complejos.

Porque la promo no depende solo del producto.

Puede depender también de:

- unidades remanentes
- canal que consume el inventario
- stock reservado o disponible
- ventanas temporales

Si el sistema no define bien quién manda y en qué momento se valida, pueden aparecer conflictos entre:

- precio prometido
- stock realmente disponible
- campaña que todavía parece vigente en una capa pero no en otra

## Pricing y marketing quieren velocidad; finanzas y operaciones quieren consistencia

Este choque es muy común.

Marketing quiere poder:

- lanzar campañas rápido
- probar promociones
- segmentar audiencias
- cambiar banners y descuentos con agilidad

Pero finanzas y operaciones necesitan:

- consistencia de cálculo
- trazabilidad
- límites claros
- prevención de errores graves
- reconstrucción histórica

Un backend de e-commerce maduro tiene que permitir cierta flexibilidad comercial **sin perder control**.

Eso normalmente exige:

- reglas claras
- validaciones fuertes
- simulación previa
- visibilidad de impacto
- activaciones y expiraciones confiables

## Devoluciones y reembolsos necesitan entender cómo se armó el precio original

Si una orden tuvo:

- promo por categoría
- cupón global
- envío bonificado
- recargo por cuotas

entonces devolver un ítem puede no ser trivial.

Aparecen preguntas como:

- ¿qué parte del descuento correspondía a esa línea?
- ¿el cupón se prorratea?
- ¿si devuelvo un ítem se pierde una promo por combo?
- ¿el envío gratis sigue aplicando o debería recalcularse?
- ¿qué monto corresponde reembolsar exactamente?

Esto muestra otra razón por la cual guardar solo el total final es insuficiente.

Las devoluciones necesitan entender la **composición del precio**.

## Los errores de pricing pegan directo en confianza, margen y operación

Un bug visual en una pantalla puede molestar.

Un bug de pricing pega en lugares mucho más sensibles.

Por ejemplo:

- margen destruido por descuento mal acumulado
- reclamos porque el total cambió en checkout
- fraude por abuso de cupones
- conciliaciones manuales costosas
- campañas que venden por debajo de lo esperado
- conflictos entre soporte, marketing y finanzas

Por eso pricing no debería verse como “un detalle del front”.

Es una responsabilidad central del backend.

## Algunas estrategias de diseño que suelen ayudar

No son reglas absolutas.

Pero en muchos sistemas reales dan bastante orden.

### 1. Separar precio base de transformaciones comerciales

Lista, promo, cupón, impuesto, recargo y total no deberían confundirse.

### 2. Tratar promociones como reglas con condiciones y efectos

No solo como campos numéricos sueltos.

### 3. Definir explícitamente el orden de cálculo

Para evitar diferencias entre contextos.

### 4. Modelar compatibilidad y prioridad entre reglas

No asumir que todas las promociones se acumulan.

### 5. Congelar la foto del pricing en la orden

Para auditoría, devoluciones y consistencia histórica.

### 6. Diseñar redondeo y reparto de descuentos como parte del dominio

No como detalles de último momento.

### 7. Diferenciar pricing de catálogo y pricing de checkout

Aunque compartan parte de la lógica.

### 8. Hacer el resultado explicable

Soporte, finanzas y producto lo van a necesitar.

## Un ejemplo mental sencillo

Imaginá este escenario.

Un producto tiene:

- precio base: 100000

Hay además:

- promo automática de 20% por campaña
- cupón de 10% para primera compra
- financiación con recargo del 8%
- envío gratis a partir de 90000

Preguntas para pensar:

- ¿la promo y el cupón se acumulan?
- si se acumulan, ¿en qué orden?
- ¿el recargo se calcula antes o después de descuentos?
- ¿el umbral de envío gratis mira subtotal antes o después del cupón?
- ¿qué se muestra en catálogo y qué se decide recién en checkout?
- ¿cómo quedaría persistida esa decisión dentro de la orden?

No hay una única respuesta universal.

Lo importante es que el backend tenga una política clara y consistente.

## Pricing como motor de decisiones comerciales, no como tabla suelta

A medida que el negocio madura, suele volverse natural pensar el pricing como un pequeño motor de reglas.

No necesariamente algo enorme o hiperabstracto.

Pero sí una zona donde confluyen:

- listas
- campañas
- cupones
- segmentos
- canales
- moneda
- impuestos
- recargos
- prioridades
- explicaciones

Cuando eso se acepta, el diseño mejora mucho.

Deja de depender de lógica dispersa en:

- frontend
- endpoints sueltos
- panel administrativo
- integraciones ad hoc

Y pasa a existir una fuente más clara de cálculo.

## Mini ejercicio mental

Imaginá un e-commerce que vende electrónica.

Tiene:

- lista minorista y mayorista
- campañas automáticas por categoría
- cupones para clientes nuevos
- cuotas con recargo
- envío gratis a partir de cierto monto
- precios en dos monedas según el país

Preguntas para pensar:

- qué distinguirías entre precio base, precio promocional y precio final
- qué reglas permitirías acumular y cuáles no
- dónde definirías el orden de cálculo
- qué parte del pricing resolverías en catálogo y cuál en checkout
- qué guardarías exactamente en cada línea de orden
- cómo explicarías después por qué una compra recibió cierto descuento
- cómo evitarías que una campaña vencida siga impactando el checkout por caché o cálculo viejo

## Resumen

En un e-commerce real, pricing no es solo un campo numérico dentro del producto.

Es una combinación de:

- listas de precio
- contexto de canal o cliente
- promociones automáticas
- cupones
- impuestos
- recargos
- moneda
- redondeo
- reglas de compatibilidad
- persistencia histórica

La idea central de este tema es esta:

**el backend de pricing debe transformar reglas comerciales en cálculos consistentes, explicables y auditables, para que el negocio pueda vender con flexibilidad sin perder control sobre lo que realmente cobra.**

Cuando eso se entiende, deja de tener sentido pensar el precio como una cifra única y fija.

Pasa a ser mucho más natural distinguir entre:

- precio base
- reglas aplicables
- orden de cálculo
- promociones acumulables o excluyentes
- total congelado en la orden
- trazabilidad del porqué

Y eso nos deja listos para el siguiente tema, donde vamos a avanzar hacia una zona todavía más sensible del e-commerce:

**carrito, checkout y experiencia transaccional**.
