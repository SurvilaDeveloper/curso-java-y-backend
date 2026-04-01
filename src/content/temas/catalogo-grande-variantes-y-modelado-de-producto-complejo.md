---
title: "Catálogo grande, variantes y modelado de producto complejo"
description: "Cómo pensar un catálogo de e-commerce cuando el producto deja de ser una ficha simple, por qué variantes, atributos, combinaciones, disponibilidad, merchandising, pricing e inventario complican el modelo, y cómo diseñar backend capaz de sostener catálogos grandes sin caer en esquemas rígidos, duplicación de datos ni reglas imposibles de mantener."
order: 192
module: "E-commerce profesional"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior vimos que un e-commerce real no se entiende bien si lo reducís a un CRUD.

Ahora vamos a entrar en una de las partes que más suelen romper ese simplismo:

**el catálogo**.

Porque mientras el negocio es chico, parece que el producto se puede modelar fácil:

- nombre
- descripción
- precio
- stock
- imagen

Y listo.

Pero cuando el catálogo crece, esa visión se queda muy corta.

Empiezan a aparecer cosas como:

- variantes por talle, color, material o capacidad
- atributos técnicos distintos según categoría
- combinaciones válidas e inválidas
- stock por variante
- imágenes específicas por variante
- reglas de visibilidad
- disponibilidad por canal
- precios distintos según contexto
- productos compuestos o bundles
- familias de producto con muchas similitudes pero no idénticas

Entonces la pregunta de este tema es:

**¿cómo se modela un catálogo grande sin que el backend termine atado a una estructura rígida, duplicada o imposible de mantener?**

## El error inicial: tratar todos los productos como si fueran iguales

Este problema aparece muy rápido.

Al principio alguien arma algo como:

- `id`
- `name`
- `description`
- `price`
- `stock`
- `imageUrl`
- `categoryId`

Para una primera demo puede alcanzar.

Pero cuando el negocio real entra en escena, ese esquema empieza a tensionarse.

Porque no es lo mismo vender:

- una remera con talle y color
- una notebook con RAM, disco y procesador
- un perfume con tamaño de presentación
- una silla con material y terminación
- un repuesto con compatibilidades técnicas
- un producto digital sin stock físico
- un bundle de varios ítems

Y si todos intentan entrar en el mismo molde plano, el catálogo se deforma.

## Producto visible y unidad vendible no siempre son la misma cosa

Esta distinción es importantísima.

Muchas veces desde negocio o desde UX existe algo que el usuario percibe como “un producto”.

Por ejemplo:

**Zapatilla Runner X**

Pero comercialmente puede haber múltiples unidades vendibles distintas:

- Runner X · negro · talle 39
- Runner X · negro · talle 40
- Runner X · azul · talle 39
- Runner X · azul · talle 40

Entonces conviene separar conceptualmente dos niveles.

### Producto base o entidad catálogo

Representa la identidad comercial más visible:

- nombre principal
- descripción general
- marca
- categoría
- storytelling
- assets generales
- SEO
- atributos compartidos

### Variante o SKU vendible

Representa una combinación concreta que puede venderse:

- atributos específicos
- SKU
- EAN o código interno
- stock
- precio efectivo o base particular
- peso y dimensiones
- disponibilidad
- imágenes específicas
- reglas logísticas o comerciales propias

Cuando esta separación no existe, se mezclan conceptos distintos y el modelo se vuelve confuso.

## Variante no significa solo “color y talle”

A veces se habla de variantes como si fueran una sola idea simple.

Pero en realidad la variante puede surgir por distintos tipos de diferencia.

Por ejemplo:

- configuración física
- presentación comercial
- compatibilidad técnica
- capacidad
- región
- edición
- empaque
- proveedor
- canal

Eso importa porque no todas las variantes se comportan igual.

No es lo mismo:

- una prenda con combinaciones de talle y color
- una notebook con componentes seleccionables
- una impresora con cartuchos compatibles
- un medicamento con distintas concentraciones
- un pack armado con cantidad de unidades distinta

Entonces el modelo no debería asumir que todas las variantes se resuelven con la misma receta fija.

## El catálogo grande obliga a distinguir entre atributos de catálogo y atributos operativos

Otro error común es mezclar todo en una lista gigante de campos.

Por ejemplo:

- color
- peso
- alto
- consumo eléctrico
- voltaje
- talle
- material
- largo
- país de origen
- compatibilidad
- depósito
- stock
- impuesto
- lead time
- courier permitido

El problema es que esos datos no cumplen la misma función.

### Hay atributos descriptivos

Sirven para mostrar, filtrar o comprender el producto:

- color
- material
- capacidad
- dimensiones
- resolución
- compatibilidad
- composición

### Hay atributos comerciales

Sirven para vender o aplicar reglas:

- precio base
- promociones posibles
- canal habilitado
- visibilidad
- condición de venta
- mínimo de compra

### Hay atributos operativos

Sirven para fulfillment o logística:

- peso
- volumen
- depósito
- peligrosidad
- fragilidad
- restricciones de envío

### Hay atributos fiscales o regulatorios

Sirven para compliance o cálculo:

- categoría impositiva
- origen
- restricciones normativas
- tratamiento fiscal

Si tratás todos esos atributos como si fueran solo “propiedades del producto”, después cuesta muchísimo darles comportamiento correcto.

## Catálogo grande casi siempre implica heterogeneidad

Cuando el catálogo crece, aparece una verdad incómoda:

**no todos los productos comparten el mismo conjunto de atributos útiles**.

Una remera necesita:

- talle
- color
- composición

Un televisor necesita:

- pulgadas
- resolución
- tipo de panel
- conectividad

Una herramienta puede necesitar:

- potencia
- voltaje
- tipo de uso
- torque

Eso lleva a un problema clásico de modelado.

### Opción 1: tabla enorme con columnas para todo

Termina llena de campos nulos.
Y cada categoría usa solo una parte.

### Opción 2: esquema EAV extremo

Muy flexible en apariencia.
Pero suele complicar:

- validación
- performance
- consultas
- integridad
- reporting
- mantenibilidad

### Opción 3: modelo híbrido

Suele ser una salida más sana.

Combina:

- campos estructurados para lo que es central y frecuente
- atributos tipados por categoría o familia
- cierta flexibilidad controlada para extensiones

No existe una única solución universal.
Pero sí conviene desconfiar tanto del esquema completamente rígido como del completamente amorfo.

## Familia de producto, producto base y SKU no son lo mismo

En catálogos grandes ayuda mucho pensar por capas.

Por ejemplo:

### Familia de producto

Agrupa una lógica general compartida.

Ejemplo:

**Remera básica unisex**

### Producto base

Representa una publicación o entidad concreta dentro de esa familia.

Ejemplo:

**Remera básica unisex verano 2026**

### SKU o variante vendible

Representa una combinación exacta.

Ejemplo:

**Remera básica unisex verano 2026 · negro · talle M**

No todos los negocios necesitan todas esas capas con el mismo peso.
Pero cuando el catálogo crece, distinguir niveles ayuda a evitar duplicación y a entender mejor qué información vive en cada lugar.

## El SKU merece respeto

En catálogos reales, el SKU no debería ser tratado como un detalle menor.

Porque suele convertirse en una referencia central para:

- inventario
- picking
- depósitos
- ERP
- proveedores
- integraciones
- devoluciones
- soporte
- conciliación operativa

Por eso conviene que la unidad vendible concreta tenga una identidad clara y estable.

Si todo se opera solo a nivel “producto visible”, después el sistema sufre cuando tiene que interactuar con el mundo real.

## No todas las combinaciones de atributos son válidas

Este es un punto muy importante.

Cuando alguien dice “el producto tiene variantes de color y talle”, parece que se trata de un producto cartesiano simple.

Pero en la práctica muchas combinaciones no existen.

Por ejemplo:

- el color rojo solo existe en talles S y M
- cierta memoria solo existe en una versión de notebook
- una terminación premium solo aplica a cierta medida
- una presentación de 1 litro no está disponible en ciertos aromas

Entonces el modelo no debería asumir automáticamente que toda combinación posible está habilitada.

A veces conviene modelar combinaciones explícitas.
Otras veces conviene derivarlas desde variantes válidas ya definidas.

Lo peligroso es prometer desde frontend combinaciones que backend no puede sostener.

## El catálogo no solo modela datos: también modela navegación y descubrimiento

Cuando se piensa catálogo únicamente como persistencia, se pierde otra parte importante.

El catálogo también necesita servir para:

- listar
- buscar
- filtrar
- ordenar
- recomendar
- agrupar
- comparar
- destacar
- navegar por categorías

Eso significa que ciertos datos no están ahí solo porque el producto “es así”, sino porque el negocio necesita encontrarlos y venderlos mejor.

Por ejemplo:

- facetas de filtro
- atributos indexables
- tags comerciales
- badges
- jerarquías de categoría
- marca
- colección
- temporada
- compatibilidades

Esto vuelve importante distinguir entre:

- modelo fuente del catálogo
- proyecciones o índices para búsqueda y navegación

Porque a veces la mejor estructura para guardar no es la mejor para consultar en storefront.

## El problema de duplicar información en exceso

Una tentación común es duplicar todo por variante.

Entonces cada SKU repite:

- nombre completo
- descripción larga
- marca
- categoría
- assets generales
- atributos compartidos

Eso puede simplificar algunas lecturas al principio.
Pero en catálogos grandes genera problemas como:

- cambios masivos costosos
- inconsistencias
- errores de sincronización
- dificultad para mantener contenido
- explosión de datos redundantes

Del otro lado, si casi nada se materializa y todo depende de demasiadas uniones o composición tardía, también puede volverse torpe.

Otra vez aparece una idea clave:

**conviene buscar equilibrio entre normalización conceptual y practicidad operativa**.

## Imágenes y assets también tienen jerarquía

No todas las imágenes viven al mismo nivel.

Puede haber:

- imágenes del producto base
- imágenes por color
- imágenes por variante exacta
- manuales o fichas técnicas
- videos
- assets para marketplace
- assets para marketing

Si todo se mete como una lista plana de URLs, después cuesta saber:

- qué mostrar en la PDP
- qué imagen corresponde al color seleccionado
- cuál es la principal
- qué asset usar por canal
- cuál está aprobado o vigente

En un catálogo simple puede no molestar.
En uno grande, sí.

## La disponibilidad no depende solo de stock

Este error aparece mucho.

A veces se asume que si una variante tiene stock, entonces está disponible.

Pero la disponibilidad real puede depender también de:

- canal de venta
- país o región
- depósito habilitado
- restricciones logísticas
- estado regulatorio
- fecha de lanzamiento
- visibilidad manual
- publicación aprobada o no
- compatibilidad con el cliente o vehículo

Entonces “stock > 0” no siempre implica “se puede vender ahora”.

Conviene distinguir entre:

- existencia física
- stock vendible
- publicación visible
- elegibilidad comercial
- disponibilidad efectiva en checkout

## Pricing y catálogo se tocan, pero no deberían fusionarse sin criterio

En negocios chicos muchas veces el precio se guarda directamente en el producto o en la variante.

Y a veces eso alcanza.

Pero en catálogos más complejos, pricing puede depender de:

- canal
- país
- lista de precios
- segmento
- promoción
- mayorista o minorista
- moneda
- vigencia

Eso no obliga a separar pricing en otro gran sistema desde el día uno.
Pero sí invita a no asumir que el catálogo “es dueño absoluto” del precio final.

Una buena pregunta es:

**qué parte del precio pertenece al dato estable del catálogo y qué parte pertenece a reglas comerciales dinámicas.**

## Inventario por variante cambia mucho la película

Cuando el stock es por SKU y no por producto general, la cosa se vuelve bastante más realista.

Porque el usuario no compra “la remera”.
Compra:

**la remera negra talle M**.

Entonces reservar, descontar y reponer stock a nivel producto general suele ser conceptualmente incorrecto.

En muchos casos, la unidad lógica de inventario termina siendo la variante vendible.

Eso también afecta:

- disponibilidad mostrada
- reglas de reemplazo
- picking
- devoluciones
- transferencias entre depósitos
- conciliación física

## Modelar para marketplaces y múltiples canales agrega otra capa

Muchos catálogos no viven solo en una web propia.

También terminan yendo a:

- marketplaces
- sellers externos
- punto de venta físico
- apps móviles
- catálogos B2B
- integraciones con terceros

Eso introduce preguntas nuevas:

- qué atributos son internos y cuáles públicos
- qué nombre o descripción usa cada canal
- qué imágenes necesita cada destino
- qué reglas de publicación aplican
- qué identificador usa cada plataforma
- qué categorías externas mapean con las tuyas

Entonces el catálogo grande a veces no es solo un repositorio de productos.
También es una capa de publicación y adaptación a distintos contextos.

## Las categorías ayudan, pero no resuelven todo

Es común sobrecargar categorías con responsabilidades que no deberían tener.

Por ejemplo, intentar que la categoría defina al mismo tiempo:

- navegación
- atributos requeridos
- lógica comercial
- reglas logísticas
- permisos
- filtros
- impuestos
- reporting

A veces una parte de eso funciona.
Pero no todo debería colgar de la categoría.

Porque la categoría es útil para navegación y cierta organización conceptual.
No necesariamente es el mejor contenedor para todas las reglas del dominio.

## Catálogo grande exige gobernanza de datos, no solo esquema

Esto es muy importante.

Aunque el modelo técnico sea bueno, un catálogo grande se deteriora si no existen reglas claras para:

- carga de contenido
- aprobación
- completitud
- normalización de atributos
- naming
- calidad de imágenes
- consistencia de marcas
- taxonomía
- duplicados
- productos discontinuados

O sea:

el problema no es solo de tablas y clases.
También es de proceso.

Un catálogo mal gobernado termina generando:

- búsqueda pobre
- filtros inconsistentes
- mala conversión
- soporte confuso
- operación manual innecesaria

## Señales de que el modelo de catálogo se está rompiendo

Hay varias alarmas típicas.

### Señal 1: la tabla de producto tiene demasiadas columnas específicas y la mayoría quedan nulas

Eso suele mostrar que se intentó meter demasiados tipos de producto en un único molde rígido.

### Señal 2: todo se resolvió con un esquema hiperflexible y ahora consultar o validar es doloroso

La flexibilidad sin límites suele salir cara.

### Señal 3: el frontend tiene que reconstruir demasiado significado porque backend no modela bien producto, variante y disponibilidad

Eso suele revelar una frontera mal diseñada.

### Señal 4: stock, precio y visibilidad viven mezclados sin distinción conceptual

Después cuesta muchísimo razonar sobre reglas.

### Señal 5: soporte y operación no pueden identificar con claridad qué SKU se vendió o falló

Eso pega directo en fulfillment y postventa.

### Señal 6: agregar una nueva categoría compleja implica tocar demasiadas partes del sistema

Eso suele ser señal de que el catálogo no escala bien por diversidad.

### Señal 7: distintos canales muestran información incompatible del mismo producto

Eso suele mostrar falta de ownership o de estrategia de publicación.

## Qué prácticas ayudan a modelar mejor un catálogo grande

## 1. Separar producto visible, variante vendible y SKU operativo

Aunque en implementaciones chicas puedan convivir cerca, conceptualmente conviene distinguirlos.

## 2. Identificar qué atributos son compartidos y cuáles pertenecen a la variante

Eso reduce duplicación y mejora consistencia.

## 3. Distinguir atributos descriptivos, comerciales y operativos

No todos los campos tienen la misma función ni deberían gobernarse igual.

## 4. Evitar tanto el esquema completamente rígido como el completamente amorfo

En muchos casos, un enfoque híbrido resulta más sano.

## 5. Modelar disponibilidad como algo más rico que stock

Visibilidad, elegibilidad y restricciones también importan.

## 6. Pensar cómo se va a buscar, filtrar e indexar el catálogo

El modelo transaccional y el modelo de lectura no siempre coinciden.

## 7. Darle identidad fuerte a la unidad vendible

SKU, variante y referencias operativas importan mucho en negocio real.

## 8. Considerar desde temprano la publicación multicanal

Aunque no se use el día uno, muchas operaciones terminan necesitándola.

## Mini ejercicio mental

Imaginá que tenés que modelar un catálogo para un e-commerce que vende:

- indumentaria con talle y color
- electrónica con especificaciones técnicas
- packs promocionales
- stock por depósito
- publicación en tienda propia y marketplace
- filtros por atributos distintos según categoría

Preguntas para pensar:

- qué nivel considerarías “producto visible” y cuál “unidad vendible”
- qué atributos irían al producto base y cuáles a la variante
- cómo representarías combinaciones válidas de atributos
- cómo distinguirías disponibilidad, visibilidad y stock
- qué parte del modelo usarías como fuente para búsqueda y filtros
- cómo evitarías duplicar contenido compartido entre docenas de variantes
- qué identificador usaría soporte cuando una venta falla o una devolución llega

## Resumen

Un catálogo grande deja en evidencia que producto no es una entidad tan simple como parece al principio.

A medida que crece el negocio, aparece la necesidad de distinguir:

- producto visible
- variante
- SKU
- atributos compartidos
- atributos específicos
- disponibilidad
- pricing
- inventario
- assets
- publicación por canal

La idea central de este tema es esta:

**modelar catálogo bien no consiste en inventar una tabla gigante ni en hacer un esquema hiperabstracto, sino en representar con claridad qué se vende, cómo se presenta, qué se puede operar y qué reglas cambian según variante, canal y contexto.**

Cuando eso se entiende, el backend queda mucho mejor preparado para escalar catálogo, UX, operación y negocio sin convertirse en una maraña difícil de sostener.

Y eso nos deja listos para el siguiente tema, donde vamos a entrar en otra de las piezas más delicadas del comercio real:

**stock, reservas y consistencia en inventario**.
