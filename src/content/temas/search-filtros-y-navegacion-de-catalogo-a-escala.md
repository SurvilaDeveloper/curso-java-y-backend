---
title: "Search, filtros y navegación de catálogo a escala"
description: "Cómo diseñar búsqueda, filtros y navegación de catálogo en un e-commerce real, qué decisiones de modelado y datos impactan la experiencia, y por qué esto no se resuelve solo con un LIKE sobre la tabla de productos." 
order: 201
module: "E-commerce profesional"
level: "intermedio"
draft: false
---

## Introducción

Cuando un catálogo es chico, encontrar productos parece fácil.

El usuario entra, mira unas pocas categorías, recorre algunas páginas y listo.

Pero cuando el catálogo crece, eso cambia por completo.

Empiezan a aparecer problemas como:

- demasiados productos
- variantes y atributos heterogéneos
- títulos inconsistentes
- categorías mal usadas
- filtros vacíos o engañosos
- resultados poco relevantes
- duplicación de fichas
- navegación lenta
- búsquedas sin resultados útiles
- facetas que no reflejan stock o contexto real

Y en ese punto, search deja de ser una funcionalidad decorativa.
Pasa a ser parte central del negocio.

Porque en un e-commerce grande, muchas ventas dependen menos de “entrar a un producto exacto” y más de **poder descubrir rápido lo correcto dentro de un catálogo enorme**.

Esta lección trata justamente de eso:
**cómo pensar search, filtros y navegación de catálogo a escala en un e-commerce real.**

## El error de pensar que buscar productos es hacer un LIKE

Éste es uno de los errores más comunes cuando el sistema todavía es chico.

La idea suele ser algo así:

- el usuario escribe texto
- hacemos `WHERE name LIKE '%texto%'`
- devolvemos coincidencias
- listo

Eso puede alcanzar al principio.
Pero deja de servir rápido.

¿Por qué?

Porque la búsqueda real en catálogo necesita resolver mucho más que coincidencias literales.

Por ejemplo:

- sinónimos
- errores de tipeo
- plural y singular
- orden distinto de palabras
- marcas y modelos
- atributos importantes
- priorización de stock disponible
- relevancia comercial
- categorías implícitas
- resultados parciales pero útiles

Un usuario que busca:

- “iphone 14 funda transparente”
- “zapatillas running hombre 42”
- “silla escritorio negra”
- “cargador samsung tipo c original”

no está pidiendo solo coincidencias de texto.
Está expresando una intención.

Y el backend, junto con la capa de búsqueda, tiene que ayudar a interpretar esa intención.

## Search, browse y discovery no son exactamente lo mismo

Conviene separar tres cosas que muchas veces se mezclan.

### 1. Search

El usuario escribe algo explícito.
Quiere que el sistema interprete una consulta.

Ejemplos:

- “notebook lenovo i7”
- “campera impermeable mujer”
- “cafetera nespresso”

### 2. Browse o navegación

El usuario no siempre sabe exactamente qué quiere.
A veces navega por estructuras como:

- categorías
- subcategorías
- colecciones
- marcas
- promociones
- landing pages temáticas

### 3. Discovery

Es la capacidad de encontrar cosas relevantes incluso cuando la intención no está formulada de manera precisa.

Por ejemplo:

- sugerencias
- productos relacionados
- destacados por contexto
- rankings dentro de una categoría
- recomendaciones de afinidad

En un e-commerce real, estas tres cosas conviven.
Si el sistema las trata como si fueran una sola, la experiencia suele quedar pobre.

## Qué hace difícil buscar bien en catálogo

El problema no es solo técnico.
Es también de datos y de modelado.

Porque un buscador funciona peor cuando el catálogo tiene:

- nombres poco claros
- atributos faltantes
- variantes mal modeladas
- categorías mal elegidas
- marcas duplicadas o escritas distinto
- unidades inconsistentes
- fichas repetidas
- productos sin stock mezclados sin criterio
- señales comerciales mal usadas

O sea:
**la calidad de search depende muchísimo de la calidad del catálogo.**

Por eso esta lección se conecta muy fuerte con varias anteriores, como:

- catálogo grande, variantes y modelado de producto complejo
- stock, reservas y consistencia en inventario
- pricing, promociones y reglas comerciales
- marketplaces, sellers y catálogos de terceros

## Búsqueda relevante no es solo texto: también es ranking

Dos productos pueden coincidir con la consulta.
Eso no significa que deban aparecer en el mismo orden.

En sistemas reales, el ranking suele mezclar señales como:

- coincidencia textual
- coincidencia en atributos clave
- categoría relevante
- marca buscada
- disponibilidad real
- popularidad o conversión
- margen comercial
- prioridad promocional
- calidad de ficha
- reputación del seller
- tiempo de entrega

Por eso, search no es solo “encontrar candidatos”.
También es **decidir qué mostrar primero**.

Y esa decisión impacta directamente en:

- conversión
- revenue
- satisfacción del usuario
- exposición de catálogo
- presión operativa

## Query intent: no toda búsqueda pide lo mismo

Esto es muy importante.

No todas las consultas tienen la misma intención.

Por ejemplo:

- “nike” puede querer decir marca
- “televisores” puede ser una categoría
- “samsung a54” puede ser un producto casi exacto
- “zapatos negros cuero hombre” combina categoría, color, material y género
- “ofertas notebook” mezcla intención de producto con señal comercial

Entonces conviene pensar que la búsqueda a veces necesita inferir:

- marca
- categoría
- familia de producto
- atributos
- rango implícito
- contexto de promoción

Si el sistema no detecta eso, la experiencia se vuelve tosca.

## Filtros no son un agregado visual: son parte del modelo

Muchas veces se ve el filtro como algo de frontend.

Como si fuera:

- mostrar checkboxes
- mandar parámetros
- traer resultados

Pero en realidad, los filtros dependen de cómo está modelado y normalizado el catálogo.

Porque para poder filtrar bien necesitás cosas como:

- atributos consistentes
- valores normalizados
- relaciones claras por categoría
- variantes bien separadas
- stock calculado correctamente
- precio indexable
- marcas sin duplicación
- jerarquías navegables

Si eso no existe, el filtro se vuelve engañoso o directamente inútil.

## No todos los filtros deberían existir en todas las categorías

Otro error frecuente es querer usar siempre el mismo set de filtros.

Eso genera experiencias absurdas.

Por ejemplo:

- filtro de talle en heladeras
- filtro de memoria RAM en zapatillas
- filtro de material en televisores

En catálogo grande, conviene pensar filtros contextuales.

O sea:

- filtros por categoría
- filtros por familia de producto
- filtros por taxonomía
- filtros por tipo de variante

Esto mejora muchísimo la usabilidad.

Y además reduce ruido operativo.

## Facetas y conteos: el usuario quiere entender el espacio de búsqueda

Un buen sistema de filtros no solo permite restringir resultados.
También ayuda al usuario a entender qué hay disponible.

Por eso importan mucho las facetas con conteos, por ejemplo:

- Marca A (120)
- Marca B (84)
- Marca C (17)

Eso permite navegar mejor.

Pero esos conteos no son triviales.

Porque dependen de preguntas como:

- ¿cuentan sobre el universo total o sobre el conjunto ya filtrado?
- ¿incluyen productos sin stock?
- ¿cuentan productos o variantes?
- ¿se recalculan con cada filtro aplicado?
- ¿qué pasa con sellers distintos para la misma ficha?

En sistemas grandes, faceting mal diseñado puede confundir mucho o volverse costoso de calcular.

## Producto base vs variante visible en search

Esta tensión aparece muchísimo.

Por ejemplo, una remera puede tener:

- color
- talle
- diseño

Entonces aparece la pregunta:

**¿la búsqueda devuelve la ficha base o cada variante visible por separado?**

Las dos estrategias tienen trade-offs.

### Devolver ficha base

Ventajas:

- menos duplicación visual
- experiencia más limpia
- navegación más simple

Desventajas:

- puede ocultar disponibilidad específica
- complica ranking por variante concreta
- requiere resolver selección posterior

### Devolver variantes visibles

Ventajas:

- más precisión por combinación real
- mejor exposición de diferencias fuertes
- puede captar mejor queries muy específicas

Desventajas:

- mucho ruido visual
- duplicación de resultados
- ranking más difícil de explicar

No hay una única respuesta universal.
Pero sí conviene decidirlo conscientemente.

## Stock importa mucho en search y filtros

Mostrar productos agotados no siempre está mal.

Pero sí está mal tratarlos sin criterio.

Hay varias estrategias posibles:

- ocultar completamente sin stock
- mostrar sin stock al final
- mostrar con etiqueta pero permitir descubrirlos
- ocultar solo cuando la variante buscada no existe
- mantener visibles si vuelven pronto

Lo importante es que la decisión sea consistente.

Porque si el usuario filtra por:

- talle 42
- color negro
- envío rápido

y el resultado parece disponible pero en la PDP no se puede comprar, la experiencia se rompe.

Por eso search y filtros tienen que trabajar con disponibilidad real, no con una ilusión de catálogo.

## Navegación por categorías no reemplaza la búsqueda

Algunos sistemas intentan resolver todo desde categorías.

Otros intentan resolver todo desde search.

Las dos posturas suelen ser pobres.

Porque en la práctica:

- algunas personas buscan
- otras exploran
- otras empiezan por categoría y luego refinan
- otras llegan desde landing promocional
- otras usan autocomplete y no pisan la navegación tradicional

Un catálogo a escala suele necesitar convivencia entre:

- categorías claras
- búsqueda útil
- filtros consistentes
- breadcrumbs
- páginas de colección
- páginas de marca
- accesos por intención comercial

## Autocomplete y sugerencias tienen muchísimo valor

Muchas veces el mayor impacto no está en la página de resultados.
Está antes.

Un buen autocomplete puede ayudar a:

- corregir rápido la intención
- sugerir categorías
- sugerir marcas
- mostrar productos top
- reducir consultas sin salida
- acelerar la compra

Pero también hay que diseñarlo con criterio.

Porque si autocomplete devuelve cualquier cosa:

- distrae
- confunde
- empuja resultados pobres
- vuelve costosa la infraestructura

## Ordenar resultados también comunica criterio

No solo importa qué resultados aparecen.
También importa cómo se ordenan.

Ordenamientos típicos:

- relevancia
- precio ascendente
- precio descendente
- más vendidos
- novedades
- descuento
- mejor valorados

Pero ordenar no es inocente.

Porque puede entrar en conflicto con:

- relevancia textual
- stock real
- campañas comerciales
- reglas de visibilidad
- sellers priorizados

Entonces conviene definir una política clara sobre cuándo manda cada criterio.

## Search no puede depender solo del OLTP principal

Este punto es muy importante a escala.

Cuando el catálogo crece, intentar resolver todo directamente desde la base transaccional empieza a ser problemático.

Aparecen tensiones como:

- consultas pesadas
- joins costosos
- facetas caras
- ranking limitado
- latencia alta
- impacto sobre la operación principal

Por eso muchas arquitecturas reales terminan separando:

- fuente transaccional de verdad
- índice de búsqueda optimizado para lectura
- procesos de actualización del índice

Eso puede implicar motores especializados o proyecciones dedicadas.

Lo importante conceptualmente es entender esto:
**search de catálogo suele necesitar una representación derivada, no solo leer tablas operativas crudas.**

## Indexación y frescura: qué tan actualizado tiene que estar todo

Cuando hay un índice separado, aparece otra pregunta importante:

**¿cuánto retraso aceptamos entre el cambio real y lo que ve search?**

Por ejemplo:

- cambio de precio
- cambio de stock
- nueva publicación
- despublicación
- actualización de atributos
- bloqueo de un seller

No todos los cambios tienen la misma sensibilidad.

Algunos toleran pequeño delay.
Otros no.

Por ejemplo:

- una descripción puede tolerar segundos o minutos
- stock y precio suelen ser más delicados
- una publicación prohibida puede necesitar impacto inmediato

Entonces, la indexación no es solo un problema técnico.
Es también una decisión de negocio y riesgo operativo.

## Filtros combinados pueden romper la experiencia si el sistema no los entiende bien

Ejemplo:

- categoría: zapatillas
- marca: Nike
- talle: 42
- color: negro
- envío: 24h
- precio: hasta X

Parece normal.

Pero detrás hay bastantes preguntas difíciles:

- ¿el talle está en el nivel de variante o de producto base?
- ¿el conteo por color respeta el talle ya elegido?
- ¿qué pasa si una ficha tiene negro en una variante sin stock y azul en otra con stock?
- ¿el filtro de envío depende del producto, del seller o del depósito?
- ¿la faceta marca debe colapsar sellers distintos?

En catálogos complejos, combinar filtros sin una semántica clara termina generando resultados confusos.

## SEO y navegación también dependen de esto

Search y filtros no impactan solo la UX dentro del sitio.
También pueden afectar:

- indexación en buscadores
- páginas de categoría
- landings navegables
- URLs filtradas
- contenido duplicado
- canónicas
- crawl budget

Por eso, en e-commerce real conviene decidir qué combinaciones de navegación:

- son indexables
- son solo experienciales
- merecen landing propia
- deben bloquearse o canonicalizarse

No todo filtro tiene que convertirse en página pública.

## Qué errores comunes aparecen

Algunos errores frecuentes son éstos:

- confiar solo en `LIKE` sobre nombre del producto
- no normalizar atributos ni marcas
- mezclar producto base y variante sin criterio
- mostrar filtros inútiles o vacíos
- no recalcular facetas según contexto
- devolver resultados sin stock como si fueran comprables
- no distinguir relevancia textual de prioridad comercial
- intentar resolver search pesado desde la base transaccional principal
- no tener estrategia clara de indexación
- dejar que sellers o feeds degraden la calidad del catálogo

## Ejemplo intuitivo

Imaginá un e-commerce con estas condiciones:

- 500.000 productos
- múltiples sellers
- variantes por color y talle
- stock distribuido
- promociones por categoría
- marcas con nombres inconsistentes
- filtros por atributos técnicos en algunas familias

Un usuario busca:

**“zapatillas running negras hombre 42”**

Si el sistema está mal pensado, puede pasar esto:

- no reconoce que “running” es tipo de uso
- no entiende que “42” es talle
- mezcla fichas sin stock
- muestra productos negros solo en talle 40
- devuelve resultados donde “negra” aparece en descripción pero no en variante comprable
- ordena arriba productos patrocinados pero poco relevantes

Resultado:

- frustración
- más rebote
- menos conversión
- más presión sobre soporte

En cambio, si el sistema está bien pensado:

- interpreta parte de la intención
- filtra por variante disponible
- colapsa resultados sin duplicar visualmente de más
- ordena por relevancia y disponibilidad
- muestra facetas útiles para seguir refinando
- mantiene consistencia entre PLP, PDP y stock real

Ahí search deja de ser una caja negra y se vuelve una herramienta comercial fuerte.

## Relación con las lecciones anteriores y siguientes

Esta lección se conecta especialmente con:

- catálogo grande, variantes y modelado de producto complejo
- stock, reservas y consistencia en inventario
- pricing, promociones y reglas comerciales
- marketplaces, sellers y catálogos de terceros

Porque todo eso afecta directamente qué tan bien se puede buscar y navegar un catálogo.

Y prepara muy bien el terreno para lo que sigue:

- eventos comerciales y estacionalidad alta
- caché y performance en catálogo y checkout
- backoffice, administración y operaciones internas
- customer service tooling y soporte operativo

Porque cuando el catálogo crece, search ya no es solo UX.
También es performance, operación, negocio y gobierno del dato.

## Buenas prácticas iniciales

## 1. Separar claramente catálogo transaccional de representación de búsqueda

Eso permite optimizar search sin castigar la operación principal.

## 2. Definir semántica de filtros y variantes de forma explícita

Evita resultados confusos y comportamientos inconsistentes.

## 3. Tratar stock y disponibilidad como señales reales del ranking y de las facetas

No como un detalle visual de último momento.

## 4. Diseñar taxonomías y atributos con normalización suficiente

Sin eso, los filtros se degradan rápido.

## 5. Diferenciar relevancia textual, reglas comerciales y prioridades operativas

Mezclarlas sin criterio suele producir rankings difíciles de defender.

## 6. Medir consultas sin resultado, clics y conversión por búsqueda

Porque search también necesita observabilidad de producto.

## 7. Pensar navegación, search y landing pages como partes del mismo sistema

No como features aisladas que cada equipo resuelve por separado.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. ¿tu catálogo distingue bien producto base, variante y oferta visible en resultados?
2. ¿los filtros se calculan sobre datos consistentes o sobre campos poco confiables?
3. ¿el usuario puede terminar viendo en resultados algo que después no puede comprar realmente?
4. ¿tu ranking mezcla relevancia, negocio y disponibilidad con reglas explícitas?
5. ¿search depende demasiado de la base transaccional principal?

## Cierre

Cuando un catálogo crece de verdad, encontrar productos deja de ser un problema menor.

Pasa a ser una combinación de:

- modelado de datos
- calidad de catálogo
- relevancia
- performance
- stock real
- taxonomía
- observabilidad
- reglas comerciales

Y eso hace que search, filtros y navegación ya no puedan pensarse como un detalle de frontend.

Son parte central de la arquitectura del e-commerce.

Porque cuando esta capa está bien diseñada:

- el usuario encuentra mejor
- la conversión mejora
- el catálogo se vuelve más navegable
- la operación sufre menos
- y el negocio puede escalar sin convertir la búsqueda en una fuente constante de frustración.
