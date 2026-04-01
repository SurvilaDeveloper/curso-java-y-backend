---
title: "Caché y performance en catálogo y checkout"
description: "Cómo pensar caché y performance en un e-commerce real, qué conviene cachear en catálogo y checkout, qué cosas no deberían servirse de forma ingenua desde caché, y cómo equilibrar velocidad, frescura y consistencia sin romper la experiencia de compra."
order: 203
module: "E-commerce profesional"
level: "intermedio"
draft: false
---

## Introducción

Cuando un e-commerce empieza a crecer, la performance deja de ser un detalle técnico.

Pasa a convertirse en una parte visible de la experiencia de compra.

El usuario la siente cuando:

- el listado tarda en cargar
- los filtros responden lento
- la PDP se siente pesada
- el carrito recalcula con demora
- el checkout parece congelado
- una promoción aparece un momento sí y otro no
- el stock visible no coincide con lo que pasa al pagar

En ese punto, aparece una reacción bastante típica:
**“pongamos caché”**.

Y sí, la caché puede ayudar muchísimo.
Pero también puede romper cosas muy sensibles si se usa sin criterio.

Porque en e-commerce no todo dato se comporta igual.
No tiene el mismo costo servir:

- una categoría pública
- un ranking de productos populares
- una PDP con muchas señales dinámicas
- un carrito por usuario
- un cálculo final de checkout
- una validación de stock antes de confirmar la compra

Esta lección trata justamente de eso:
**cómo pensar caché y performance en catálogo y checkout, qué conviene acelerar, qué conviene recalcular, y cómo evitar que la búsqueda de velocidad destruya consistencia donde más importa.**

## El error de creer que todo problema de lentitud se resuelve con caché

Éste es uno de los errores más comunes.

El sistema empieza a responder lento y aparece la idea de cachear todo.

Entonces se intenta guardar en caché:

- listados completos
- resultados de búsqueda
- stock
- precio
- promociones
- carritos
- órdenes recientes
- cálculos de checkout

Y por un rato parece funcionar.

Pero después llegan problemas como:

- precios desactualizados
- filtros que muestran productos agotados
- usuarios viendo stock que ya no existe
- promociones incoherentes entre listing y checkout
- carritos con datos viejos
- invalidaciones imposibles de razonar
- bugs intermitentes difíciles de reproducir

La razón es simple:
**la caché no arregla por sí sola un diseño confuso. Solo mueve el problema a otro lugar.**

Si no sabés:

- qué dato cambia
- con qué frecuencia cambia
- quién lo consume
- cuánto daño causa verlo viejo
- qué evento lo invalida
- qué costo tiene recalcularlo

entonces cachear puede empeorar el sistema en vez de mejorarlo.

## Performance no es solo tiempo de respuesta promedio

A veces el equipo mira una métrica agregada y concluye que todo está bien.

Por ejemplo:

- el promedio de catálogo responde en 180 ms
- la PDP en 250 ms
- el checkout en 400 ms

Pero eso no alcanza.

En e-commerce importan también cosas como:

- latencia en percentiles altos
- variabilidad bajo carga
- tiempo de render total de una página clave
- consistencia entre distintas vistas del producto
- comportamiento en picos
- degradación cuando falla una dependencia

Porque un promedio aceptable puede esconder que:

- el 5% de las búsquedas tarda muchísimo
- los productos más vendidos son los más lentos
- el checkout se degrada justo en campañas fuertes
- el precio final se recalcula tarde
- el stock visible difiere del reservable

O sea:
**la performance útil no es solo rapidez. Es rapidez predecible en los flujos que más impactan conversión.**

## Catálogo y checkout tienen necesidades muy distintas

Este punto es clave.

Muchas veces se habla de performance del e-commerce como si fuera una sola cosa.
Pero catálogo y checkout tienen perfiles muy diferentes.

### Catálogo suele tolerar más caché

En catálogo, muchas lecturas son:

- públicas
- repetidas
- altamente compartidas
- más orientadas a exploración que a confirmación transaccional

Por eso suelen ser buenos candidatos para acelerar con:

- CDN
- caché HTTP
- caché de aplicación
- precomputación
- índices de búsqueda
- materialización de resultados frecuentes

### Checkout exige mucha más precisión

En checkout, en cambio, aparecen cosas como:

- datos por usuario
- stock muy sensible
- promociones dependientes del contexto
- costos de envío dinámicos
- validaciones transaccionales
- integraciones de pago
- cálculos finales que no deberían depender de información vieja

Entonces, aunque también se puede optimizar, el criterio cambia.

En esta zona, servir datos obsoletos puede costar:

- carritos rotos
- órdenes inválidas
- sobreventa
- cobros incorrectos
- pérdida de confianza

La idea central es:
**catálogo puede tolerar más desacople entre frescura y velocidad; checkout, mucho menos.**

## Qué conviene cachear en catálogo

No hay una receta universal.
Pero hay varios candidatos frecuentes.

### 1. Assets estáticos

Imágenes, hojas de estilo, bundles, recursos estáticos.

Esto parece obvio, pero sigue siendo una de las mejores ganancias costo/beneficio.

### 2. Páginas o fragmentos de categorías populares

Especialmente cuando:

- el tráfico es alto
- el catálogo no cambia segundo a segundo
- el ranking no necesita recalcularse todo el tiempo

### 3. PDP parcialmente materializada

Muchas veces la ficha del producto mezcla:

- datos base relativamente estables
- imágenes
- atributos
- descripción
- breadcrumbs
- reseñas resumidas
- señales dinámicas como stock o precio final

En esos casos conviene pensar la PDP como una composición:

- una parte cacheable con alta reutilización
- una parte dinámica con reglas de frescura más estrictas

### 4. Resultados de búsqueda frecuentes

No siempre como una caché cruda de la query completa, pero sí como:

- rankings precomputados
- sugerencias populares
- facetas frecuentes
- resultados base para consultas comunes

### 5. Navegación estructural

Menús, taxonomías, colecciones, landing pages promocionales, bloques de navegación.

Suelen ser muy buenos candidatos para caché.

## Qué no deberías cachear ingenuamente en catálogo

Acá aparecen varios errores peligrosos.

### Stock visible como si fuera un dato estático

En productos calientes o de baja disponibilidad, mostrar stock desde una caché vieja puede generar una experiencia muy mala.

### Precio final sin considerar contexto

El precio puede depender de:

- promociones activas
- moneda
- canal
- seller
- segmento
- tenant
- reglas temporales

Si eso se ignora, el usuario puede ver un precio en listing y otro en checkout.

### Facetas inconsistentes

Un filtro que dice que hay resultados disponibles cuando luego no aparecen, o que omite productos reales, rompe la confianza.

### Mezclar datos de distintos momentos

Por ejemplo:

- ranking viejo
- stock fresco
- precio de hace unos minutos
- promoción recién vencida

Cada componente por separado “parece razonable”, pero el conjunto se vuelve incoherente.

## Un principio muy útil: separar datos base de datos sensibles al tiempo

Esto ayuda muchísimo a diseñar bien.

En e-commerce conviene preguntarse:

**¿qué parte de esta respuesta es relativamente estable y cuál cambia con suficiente frecuencia o criticidad como para no tratarla igual?**

Por ejemplo, en una PDP:

### Datos base

- nombre
- descripción
- imágenes
- atributos técnicos
- marca
- taxonomía
- contenido editorial

### Datos sensibles al tiempo

- precio efectivo
- stock disponible
- countdown promocional
- ETA de envío
- disponibilidad por sucursal
- beneficios por usuario o segmento

Cuando el sistema no hace esa separación, termina con una de dos malas opciones:

- o recalcula demasiado y se vuelve lento
- o cachea demasiado y se vuelve inconsistente

## El catálogo rápido casi siempre se apoya en precomputación

Cuando el volumen crece, muchas respuestas rápidas ya no salen de consultas improvisadas a tablas transaccionales.

Suelen apoyarse en:

- índices especializados
- vistas materializadas
- documentos denormalizados
- read models
- snapshots parciales
- resultados preagregados

Esto se conecta mucho con ideas que ya vimos antes:

- search a escala
- catálogos complejos
- eventos comerciales
- reporting y proyecciones

La idea no es duplicar datos por capricho.
La idea es que el modelo transaccional que sirve para operar no siempre es el mejor para responder rápido a lecturas masivas.

## Checkout rápido no significa checkout ingenuo

En checkout, el objetivo no es solo bajar milisegundos.
Es evitar fricción **sin romper la verdad del negocio**.

Acá conviene optimizar cosas como:

- validaciones repetidas innecesarias
- llamadas redundantes a servicios internos
- serialización de pasos que podrían paralelizarse
- dependencias externas en el camino crítico
- recalculado excesivo de carrito

Pero hay que tener mucho cuidado con cachear el resultado final de operaciones sensibles.

Por ejemplo, es muy distinto:

- cachear configuración general de medios de pago
- cachear la cotización final del envío por usuario
- cachear reglas promocionales base
- cachear el total final validado antes de crear la orden

En checkout, lo importante es entender qué puede reutilizarse y qué debe reconfirmarse.

## En checkout conviene distinguir entre cálculo preliminar y validación final

Esta separación suele ordenar muchísimo el diseño.

### Cálculo preliminar

Sirve para mostrar una experiencia fluida.
Puede incluir:

- subtotal estimado
- costo de envío tentativo
- promociones probables
- medios de pago sugeridos
- tiempos aproximados

### Validación final

Ocurre cerca de la creación de la orden.
Ahí se confirma con más rigor:

- stock reservable
- precio vigente
- promociones aplicables
- costo de envío definitivo
- impuestos finales
- restricciones operativas

Esto permite que la UX sea rápida sin mentir.

Porque el usuario puede navegar un flujo ágil, pero el sistema conserva un punto claro donde reconfirma lo verdaderamente crítico.

## TTL no es estrategia de consistencia

Otro error muy común es resolver todo con TTL.

Algo así como:

- cacheamos por 5 minutos
- o por 1 minuto
- o por 30 segundos
- y listo

Eso puede servir como parte de la solución.
Pero no es una estrategia suficiente.

Porque el TTL no entiende:

- cuándo cambió el precio
- cuándo venció una promoción
- cuándo entró o salió stock
- cuándo se publicó una campaña
- cuándo se cayó una integración

Entonces conviene pensar también en invalidación por eventos.

Por ejemplo:

- cambio de precio
- actualización de stock
- activación o expiración de promoción
- publicación de producto
- cambio de seller
- modificación de taxonomía

Sin eso, la caché termina siendo un tiempo arbitrario de mentira tolerada.

## El desafío real no es solo cachear: es invalidar bien

Ésta suele ser la parte más difícil.

Porque invalidar bien implica entender:

- qué entidad cambió
- qué vistas dependían de esa entidad
- qué materializaciones quedaron viejas
- qué tan urgente es refrescarlas
- qué costo tiene hacerlo inmediatamente

En e-commerce esto se vuelve especialmente complejo porque un cambio puede impactar en muchas superficies.

Por ejemplo, un solo cambio de precio puede afectar:

- PDP
- listados
- búsqueda
- promociones visibles
- bundles
- recomendaciones
- carrito
- checkout
- backoffice

Por eso muchas arquitecturas maduras prefieren modelar explícitamente:

- fuentes de verdad
- proyecciones derivadas
- eventos de cambio
- pipelines de refresco
- prioridades de actualización

## Cache stampede y picos sobre productos calientes

En días normales, una estrategia mediocre de caché puede pasar desapercibida.
En campañas o productos virales, no.

Aparecen problemas como:

- muchas requests pidiendo la misma clave vencida
- regeneración simultánea de resultados costosos
- presión repentina sobre base de datos o search engine
- latencia en cascada
- caída de páginas muy consultadas

Este tipo de fenómeno se vuelve común en:

- productos que salen en una promo fuerte
- landing pages del evento
- búsquedas populares
- fichas de productos agotándose rápido

Por eso conviene pensar en mecanismos como:

- stale-while-revalidate
- refresh anticipado
- single-flight por clave
- locks o coalescing al recomputar
- warming de caché antes de campañas

No hace falta usar todo siempre.
Pero sí conviene saber que estos problemas existen.

## Warm-up y preparación previa a eventos

Cuando ya sabés que viene una campaña fuerte, esperar a que la caché se llene sola puede ser una mala idea.

Muchas veces conviene preparar con anticipación:

- categorías destacadas
- landing pages del evento
- productos más promocionados
- búsquedas más frecuentes
- assets pesados
- facetas y rankings principales

Esto no elimina todos los problemas, pero reduce muchísimo la carga inicial del pico.

Especialmente en los primeros minutos de una campaña, donde la simultaneidad suele ser muy agresiva.

## Performance también depende de reducir trabajo innecesario

A veces el sistema es lento no porque falte caché, sino porque hace demasiado trabajo.

Por ejemplo:

- recalcula promociones complejas en cada request
- hace joins innecesarios para campos secundarios
- consulta stock detallado cuando solo necesita una señal simple
- invoca múltiples servicios para armar una sola pantalla
- recalcula el carrito completo ante cualquier cambio menor

En esos casos, antes de agregar caché conviene preguntar:

- ¿se puede simplificar el camino?
- ¿se puede denormalizar algo?
- ¿se puede precalcular?
- ¿se puede separar una parte crítica de otra secundaria?
- ¿se puede evitar una dependencia en el camino síncrono?

Muchas veces, la mejor optimización no es guardar resultados viejos.
Es **dejar de hacer trabajo inútil**.

## Performance percibida también importa

No todo tiene que resolverse en backend puro.

A veces la experiencia mejora mucho si el sistema:

- muestra estados intermedios claros
- anticipa cálculos probables
- evita loaders confusos
- actualiza por partes en vez de bloquear todo
- conserva información útil mientras refresca

Esto no reemplaza una arquitectura correcta.
Pero ayuda a que la interacción se sienta más fluida.

En e-commerce, esa diferencia impacta mucho en abandono.

## Hay que definir dónde aceptás datos un poco viejos y dónde no

Éste es uno de los criterios más sanos para pensar la caché.

Preguntas útiles:

- ¿puedo mostrar una categoría con unos segundos de retraso? Probablemente sí.
- ¿puedo mostrar sugerencias no totalmente frescas? Muchas veces sí.
- ¿puedo dejar viejo el stock final antes de confirmar una compra? Mucho menos.
- ¿puedo dejar viejo el total final a cobrar? No debería.
- ¿puedo dejar viejo el estado interno de una orden recién creada? Depende del contexto, pero hay que ser muy cuidadoso.

No toda frescura vale lo mismo.
No toda inconsistencia cuesta lo mismo.

El diseño maduro aparece cuando el sistema diferencia eso explícitamente.

## Algunos principios de diseño que suelen ayudar

No son reglas absolutas.
Pero suelen ordenar bastante.

### 1. Cachear más agresivamente lecturas públicas y compartidas

Especialmente catálogo, navegación y contenido estable.

### 2. Separar datos estáticos de datos dinámicos

No forzar la misma estrategia para ambos.

### 3. En checkout, usar caché con mucha más cautela

Sobre todo cerca de decisiones transaccionales.

### 4. Distinguir estimación de confirmación final

Fluidez en la UX no significa comprometer validación crítica.

### 5. Diseñar invalidaciones a partir de eventos reales del dominio

Precio, stock, promoción, publicación, seller, campaña.

### 6. Precomputar donde el costo de lectura masiva lo justifique

No depender siempre del modelo transaccional para servir catálogo.

### 7. Preparar la caché antes de campañas previsibles

Especialmente para productos y páginas hot.

### 8. Medir percentiles y comportamiento bajo carga, no solo promedios

Porque las colas largas suelen pegar justo donde más duele.

## Mini ejercicio mental

Imaginá un e-commerce con:

- 300 mil productos
- campañas promocionales semanales
- búsquedas muy repetidas
- stock cambiante en productos hot
- precio dependiente de promociones y seller
- checkout con cálculo de envío en tiempo real

Preguntas para pensar:

- qué respuestas servirías desde CDN
- qué partes de la PDP cachearías y cuáles no
- qué superficies invalidarías cuando cambia un precio
- qué información del checkout mostrarías como estimación
- en qué punto reconfirmarías stock y precio final
- qué harías para evitar stampede en campañas grandes
- qué vistas precomputarías para catálogo y búsqueda
- qué tolerancia a staleness aceptarías en categorías, PDP y checkout

## Resumen

La caché en e-commerce no es solo una técnica para “hacer todo más rápido”.

Es una decisión de arquitectura que toca:

- experiencia de navegación
- coherencia de catálogo
- consistencia de precios
- visibilidad de stock
- estabilidad bajo carga
- checkout
- conversión
- operación comercial

La idea central de este tema es esta:

**la performance sostenible en catálogo y checkout no aparece por cachear indiscriminadamente, sino por distinguir qué puede servirse rápido con cierta tolerancia a staleness y qué debe validarse con precisión porque impacta directamente en la promesa comercial.**

Cuando eso se entiende, el diseño mejora mucho.

Se vuelve natural separar entre:

- lecturas públicas y compartidas
- datos base y datos sensibles al tiempo
- estimaciones y confirmaciones finales
- precomputación e invalidación
- catálogo exploratorio y checkout transaccional

Y eso nos deja listos para el siguiente tema, donde vamos a mirar otra pieza fundamental del e-commerce real desde adentro:

**backoffice, administración y operaciones internas**.
