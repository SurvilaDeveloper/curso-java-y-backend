---
title: "Marketplaces, sellers y catálogos de terceros"
description: "Cómo pensar un e-commerce que no vende solo catálogo propio, qué cambia cuando entran sellers externos, y por qué integrar catálogos de terceros exige control, reglas y trazabilidad." 
order: 200
module: "E-commerce profesional"
level: "intermedio"
draft: false
---

## Introducción

Hasta cierto punto, un e-commerce parece relativamente directo de modelar:

- el negocio publica productos
- el cliente compra
- el sistema cobra
- se prepara el pedido
- se entrega

Pero ese modelo cambia bastante cuando el negocio ya no vende solo stock propio.

Ahí aparecen escenarios como:

- sellers externos
- catálogos importados
- marcas que publican su propio inventario
- operadores que hacen fulfillment parcial
- dropshipping
- marketplaces con múltiples vendedores
- productos sincronizados desde otros sistemas

Y en ese punto el backend deja de ser un simple e-commerce monovendedor.
Pasa a ser, en cierta medida, una plataforma.

Eso cambia muchas cosas al mismo tiempo:

- ownership de catálogo
- calidad de datos
- pricing
- stock
- comisiones
- fulfillment
- soporte
- devoluciones
- reputación
- reglas de publicación

Esta lección trata justamente de eso:
**cómo pensar marketplaces, sellers y catálogos de terceros en un e-commerce real.**

## El error de pensar que “agregar sellers” es solo sumar un campo seller_id

Éste es uno de los errores más comunes.

Desde afuera parece que alcanza con esto:

- Product tiene `sellerId`
- OrderItem tiene `sellerId`
- listo

Pero en la práctica, eso deja afuera mucha complejidad real.

Porque cuando hay múltiples sellers, el sistema suele necesitar resolver:

- quién crea o mantiene el producto
- quién define el precio
- quién informa el stock
- quién despacha
- quién responde ante incidencias
- quién absorbe una devolución
- cómo se calculan comisiones
- qué seller puede operar en qué zona
- qué SLA tiene cada uno
- cómo se modera la calidad del catálogo

Entonces el problema no es solo “asociar productos a vendedores”.
El problema es **modelar responsabilidades y contratos operativos dentro de la plataforma**.

## Qué cambia cuando el catálogo ya no es solo propio

En un catálogo propio, el negocio suele controlar casi todo:

- nombre del producto
- descripción
- imágenes
- precio
- stock
- atributos
- publicaciones
- política comercial

Cuando entran terceros, eso deja de ser tan simple.

Puede pasar que:

- el seller cargue directamente sus productos
- el catálogo venga de un ERP externo
- haya feeds masivos de publicación
- varios sellers compitan por un producto similar
- el marketplace unifique fichas de producto pero separe ofertas
- el negocio modere publicaciones antes de hacerlas visibles

Entonces conviene distinguir entre cosas que antes estaban mezcladas.

Por ejemplo:

- **ficha de producto**
- **oferta comercial**
- **seller que la publica**
- **stock disponible**
- **precio y condiciones**

Esa separación suele volverse mucho más importante en modelos marketplace.

## Producto no siempre es lo mismo que oferta

Esto es clave.

Un error frecuente es tratar como una sola entidad algo que en realidad son dos capas distintas.

### Capa 1: el producto o ficha base

Representa qué se está vendiendo.

Por ejemplo:

- marca
- modelo
- categoría
- atributos técnicos
- imágenes
- descripción principal
- especificaciones

### Capa 2: la oferta

Representa cómo un seller vende esa ficha.

Por ejemplo:

- seller
- precio
- moneda
- stock
- plazo de despacho
- condición del producto
- costo de envío o reglas logísticas
- políticas particulares
- estado de la publicación

En muchos marketplaces, varios sellers pueden ofrecer la misma ficha de producto.

Si el backend no distingue bien estas capas, aparecen problemas como:

- duplicación absurda de catálogo
- fichas inconsistentes
- múltiples descripciones del mismo producto
- dificultad para comparar ofertas
- mala experiencia de búsqueda y navegación

## Marketplace no es solo multivendedor: también es gobierno de plataforma

Cuando construís algo tipo marketplace, además de vender, también empezás a gobernar una plataforma.

Eso incluye definir reglas como:

- quién puede publicar
- qué categorías requieren validación
- qué campos son obligatorios
- qué imágenes se aceptan
- qué sellers pueden vender determinadas marcas
- cómo se detectan duplicados
- cómo se suspende una publicación
- cómo se desactiva un seller riesgoso
- cómo se gestiona reputación o performance

O sea:
**el backend no solo procesa ventas; también regula participación.**

Y eso hace aparecer necesidades nuevas:

- moderación
- auditoría
- trazabilidad de cambios
- workflows de aprobación
- métricas por seller
- enforcement de políticas

## Ownership real: quién es dueño de qué

Otra pregunta importante es ésta:

**¿qué parte del dato pertenece a la plataforma y qué parte pertenece al seller?**

Porque no siempre todo tiene el mismo dueño.

Por ejemplo:

- la ficha maestra puede pertenecer a la plataforma
- la oferta puede pertenecer al seller
- ciertas imágenes pueden venir del seller
- ciertos atributos pueden estar normalizados por la plataforma
- el stock puede venir de integración externa
- el precio puede venir del seller o de una regla central

Si esto no está claro, aparecen discusiones y errores como:

- un seller modifica campos que no debería tocar
- una sincronización externa pisa datos curados por la plataforma
- soporte no sabe quién corrige un error de catálogo
- se rompen integraciones por falta de ownership definido

En sistemas reales, **ownership de datos y ownership operativo** importan muchísimo.

## Sellers no son todos iguales

Otro error frecuente es modelar todos los sellers como si fueran equivalentes.

Pero en la práctica puede haber muchos tipos.

Por ejemplo:

- sellers internos del mismo grupo
- marcas oficiales
- revendedores autorizados
- sellers externos independientes
- proveedores de dropshipping
- partners logísticos con stock delegado

Y cada uno puede tener reglas distintas sobre:

- onboarding
- publicación
- categorías permitidas
- comisiones
- tiempos de despacho
- scoring de riesgo
- visibilidad
- acceso a herramientas

Entonces, muchas veces conviene que `Seller` no sea solo una tabla mínima, sino una entidad con:

- estado
- tipo
- configuración operativa
- capacidades
- restricciones
- datos fiscales o contractuales
- políticas logísticas
- métricas de desempeño

## Catálogo de terceros y calidad de datos

Uno de los mayores problemas reales no es vender.
Muchas veces es **limpiar el catálogo**.

Porque cuando entran terceros, aparecen datos como:

- títulos mal escritos
- atributos incompletos
- imágenes pobres
- categorías incorrectas
- variantes inconsistentes
- unidades mal cargadas
- descripciones infladas o engañosas
- duplicados del mismo producto

Si la plataforma no controla esto, se deterioran cosas muy importantes:

- búsqueda
- filtros
- SEO
- comparabilidad
- confianza del cliente
- conversión
- operación interna

Por eso, en modelos con terceros suele ser muy importante diseñar mecanismos de:

- validación
- normalización
- moderación
- enriquecimiento de datos
- deduplicación
- plantillas por categoría

## Publicación inmediata vs workflow de aprobación

No siempre conviene que un seller publique y quede visible al instante.

A veces tiene sentido.
Pero otras veces no.

Puede haber modelos como:

### Publicación directa

El seller publica y la oferta queda activa automáticamente.

Ventajas:

- menor fricción
- más velocidad
- onboarding más simple

Desventajas:

- más riesgo de catálogo sucio
- más riesgo de fraude
- más necesidad de monitoreo posterior

### Publicación moderada

El seller crea borrador o publicación pendiente, y la plataforma aprueba antes.

Ventajas:

- más control
- mejor calidad inicial
- menor riesgo reputacional

Desventajas:

- más costo operativo
- más fricción
- menos velocidad de crecimiento

Muchas plataformas terminan en modelos híbridos:

- sellers confiables publican directo
- sellers nuevos o categorías sensibles pasan por revisión

## Stock y disponibilidad cuando hay terceros

Cuando el stock es propio, ya es difícil.
Con sellers externos se vuelve más delicado.

Porque puede pasar que:

- el seller actualice stock tarde
- el feed llegue con atraso
- el stock externo tenga mala calidad
- la publicación siga activa con disponibilidad falsa
- dos canales compitan por el mismo inventario
- el seller despache fuera de SLA

Entonces conviene pensar:

- frecuencia de sincronización
- margen de seguridad o buffer de stock
- stock reservado vs disponible
- degradación cuando el feed falla
- política de despublicación por desactualización
- trazabilidad del origen del stock

En algunos casos, incluso conviene marcar confianza del stock según su fuente.

## Pricing y comisión en marketplace

Cuando el negocio vende stock propio, el margen suele calcularse de una forma relativamente directa.

Cuando hay sellers externos, aparecen otras preguntas:

- ¿la plataforma cobra comisión fija o variable?
- ¿hay comisión por categoría?
- ¿hay costo logístico retenido?
- ¿hay cargo por procesamiento de pago?
- ¿la plataforma liquida después de la entrega?
- ¿hay retenciones por fraude o devoluciones?
- ¿cómo se manejan promociones subsidiadas?

Además, puede haber escenarios como:

- la plataforma define precio mínimo
- el seller fija precio libremente
- hay buy box o priorización de una oferta principal
- hay promociones globales que afectan sellers externos

Todo eso exige bastante más que un campo `commissionPercent` suelto.

## Fulfillment: quién despacha y quién responde

No todos los modelos marketplace operan igual.

Puede pasar que:

- cada seller despache por su cuenta
- la plataforma haga fulfillment para el seller
- exista un modelo mixto
- ciertas categorías usen depósito central y otras no

Eso cambia mucho la operación.

Porque impacta:

- tiempos de preparación
- tracking
- control de calidad
- devoluciones
- soporte
- SLA
- experiencia del cliente

También cambia la responsabilidad ante fallas.

Por ejemplo:

- ¿quién responde si el producto llegó roto?
- ¿quién cubre una pérdida logística?
- ¿quién procesa una devolución?
- ¿quién se hace cargo de un error de catálogo?

En backend, esto suele requerir modelar bien:

- seller responsable
- fulfillment owner
- carrier
- política de devoluciones
- costos imputables
- estados de responsabilidad

## Customer experience: el cliente no quiere entender tu complejidad interna

Esto es muy importante.

Aunque por dentro existan varios sellers, múltiples depósitos y reglas operativas distintas, el cliente espera una experiencia razonablemente coherente.

No quiere pensar en:

- qué seller despacha cada ítem
- quién integra el stock
- qué oferta usa feed externo
- qué caso entra por workflow manual

Entonces el sistema necesita decidir cuánto de esa complejidad se expone y cuánto se abstrae.

Por ejemplo:

- mostrar vendedor claramente, pero sin volver caótico el checkout
- separar envíos por seller cuando hace falta
- agrupar experiencia de orden sin perder trazabilidad interna
- mostrar tiempos estimados realistas por oferta

## Órdenes mixtas y separación operativa

Un punto delicado aparece cuando una sola compra incluye productos de distintos sellers.

Entonces puede pasar que:

- haya una orden comercial para el cliente
- pero varios subpedidos internos
- cada seller tenga su propio fulfillment
- cada ítem tenga tracking distinto
- las devoluciones se resuelvan por separado
- la conciliación financiera también se parta por seller

Si el backend no contempla esto, el modelo de orden se rompe rápido.

Muchas veces conviene distinguir entre:

- orden externa o comercial
- subórdenes operativas
- asignación por seller
- liquidación por seller

## Integraciones masivas y feeds de catálogo

Los catálogos de terceros muchas veces no se cargan manualmente uno por uno.

Llegan por:

- CSV
- APIs
- feeds programados
- conectores con ERP
- integraciones con plataformas externas

Eso mete nuevos desafíos:

- importaciones parciales
- errores por lote
- validaciones diferidas
- mapeo de atributos
- deduplicación
- reconciliación entre catálogo previo y nuevo
- activación o desactivación masiva
- idempotencia de importaciones

O sea:
**el problema deja de ser solo de CRUD y pasa a ser de sincronización y gobierno de datos.**

## Qué errores comunes aparecen

Algunos muy frecuentes son:

### 1. Modelar marketplace como un e-commerce normal con un seller_id agregado

Eso suele quedarse corto muy rápido.

### 2. No separar ficha de producto de oferta comercial

Genera duplicación, caos y mala navegación.

### 3. No definir ownership de datos

Después nadie sabe quién puede cambiar qué.

### 4. Permitir catálogo de terceros sin control de calidad mínimo

La búsqueda, la conversión y la confianza se deterioran.

### 5. No contemplar órdenes mixtas y responsabilidades por seller

Explota en logística, soporte y conciliación.

### 6. No modelar bien comisiones, liquidaciones y responsabilidades

Después aparecen conflictos financieros difíciles de cerrar.

### 7. Acoplarse demasiado a feeds o integraciones externas

El catálogo queda frágil y difícil de operar.

## Ejemplo intuitivo

Supongamos este caso:

- la plataforma tiene ficha unificada para una notebook
- 3 sellers distintos publican su oferta sobre esa ficha
- cada uno tiene precio, stock y plazo distintos
- uno usa fulfillment propio
- otro usa depósito de la plataforma
- el cliente compra 2 productos de sellers distintos en la misma transacción

Si el sistema está bien pensado, debería poder representar:

- una ficha base común
- varias ofertas asociadas
- ownership claro por seller
- una orden comercial visible para el cliente
- subórdenes operativas separadas
- tracking diferenciado
- liquidación por seller
- métricas de performance por oferta y por vendedor

Si el sistema no está bien pensado, todo termina mezclado en:

- catálogo duplicado
- órdenes difíciles de operar
- soporte confuso
- conciliación complicada
- mala experiencia de cliente

## Relación con las lecciones anteriores y siguientes

Este tema conecta muy fuerte con:

- catálogo grande, variantes y modelado de producto complejo
- stock, reservas y consistencia en inventario
- pricing, promociones y reglas comerciales
- órdenes, estados y fulfillment real
- envíos, logística y tracking
- devoluciones, reembolsos y postventa

Y prepara muy bien el terreno para lo que sigue:

- search, filtros y navegación de catálogo a escala
- backoffice, administración y operaciones internas
- customer service tooling y soporte operativo
- integraciones con ERP, carriers y plataformas externas

Porque cuando hay sellers y catálogos de terceros, todo eso se vuelve bastante más importante.

## Buenas prácticas iniciales

## 1. Separar ficha de producto y oferta comercial

Eso ordena muchísimo el modelo.

## 2. Definir ownership de datos y ownership operativo

Evita caos entre plataforma, seller e integraciones.

## 3. Diseñar controles mínimos de calidad para catálogo de terceros

Sin eso, la plataforma se degrada rápido.

## 4. Modelar órdenes y conciliación por seller cuando haga falta

Especialmente en compras mixtas.

## 5. No asumir que stock, precio y fulfillment son siempre propios

En marketplace real casi nunca lo son completamente.

## 6. Diseñar workflows de publicación y moderación según riesgo

No todo seller ni toda categoría merecen el mismo nivel de confianza inicial.

## 7. Pensar la plataforma como sistema de gobierno, no solo como storefront

Porque marketplace es también control operativo y contractual.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. ¿tu modelo separa claramente producto base de oferta por seller?
2. Si dos sellers venden la misma ficha, ¿el catálogo se duplica o se compara bien?
3. Una orden con productos de distintos sellers, ¿se puede operar sin mezclar responsabilidades?
4. Si un feed externo pisa un dato curado manualmente, ¿quién gana y por qué?
5. ¿la plataforma puede suspender publicaciones o sellers sin romper toda la operación?

## Cierre

Cuando un e-commerce empieza a trabajar con sellers, marketplace o catálogos de terceros, deja de resolver solo ventas.

Empieza a resolver también:

- gobierno de datos
- control de calidad
- responsabilidades operativas
- liquidaciones
- moderación
- integración entre múltiples actores

Y eso exige un backend bastante más maduro.

Porque en este punto ya no alcanza con:

- un CRUD de productos
- una orden simple
- un stock único
- una sola política operativa

Hace falta pensar en capas, ownership, flujos y contratos.

Y cuando eso está bien diseñado:

- el catálogo escala mejor
- la experiencia del cliente se vuelve más consistente
- la operación se vuelve más trazable
- el soporte sufre menos
- y la plataforma puede crecer sin volverse un caos.
