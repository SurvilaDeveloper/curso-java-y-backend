---
title: "Integraciones con ERP, carriers y plataformas externas"
description: "Cómo pensar integraciones clave de un e-commerce real con ERP, operadores logísticos, medios de pago, marketplaces y otras plataformas externas, por qué estas conexiones no son simples llamadas a APIs, qué riesgos operativos introducen, y cómo diseñarlas para convivir con retrasos, errores, reintentos, estados inciertos y diferencias de modelo sin romper la operación del negocio."
order: 206
module: "E-commerce profesional"
level: "intermedio"
draft: false
---

## Introducción

Cuando un e-commerce es chico, da la impresión de que todo puede vivir adentro del mismo sistema.

Productos.
Stock.
Precios.
Órdenes.
Pagos.
Envíos.
Clientes.

Pero a medida que el negocio crece, eso casi nunca sigue siendo cierto.

Empiezan a aparecer integraciones con sistemas externos como:

- ERP
- carriers
- pasarelas de pago
- marketplaces
- sistemas de facturación
- herramientas de atención al cliente
- plataformas de marketing
- WMS o sistemas de depósito
- proveedores externos de catálogo
- soluciones antifraude

Y ahí cambia por completo la naturaleza del backend.

Porque el sistema deja de ser solo un lugar donde el negocio guarda datos.
Pasa a ser también un punto de coordinación entre varios actores externos que:

- tienen modelos distintos
- confirman cosas en tiempos distintos
- pueden fallar
- pueden responder tarde
- pueden duplicar eventos
- pueden tener caídas parciales
- pueden dejar estados ambiguos
- pueden cambiar contratos con el tiempo

Por eso, cuando hablamos de **integraciones con ERP, carriers y plataformas externas**, no hablamos simplemente de “conectar APIs”.

Hablamos de diseñar un backend capaz de convivir con un ecosistema externo imperfecto sin destruir la operación del negocio.

## El error de pensar integración como “consumir un endpoint y listo”

Uno de los errores más comunes es imaginar que integrar un sistema externo es solo hacer esto:

- llamar una API
- recibir una respuesta
- guardar datos
- continuar el flujo

En una demo, eso puede parecer suficiente.
Pero en comercio real no alcanza.

Porque una integración real puede tener comportamientos como:

- devolver éxito técnico pero fracaso de negocio
- aceptar la operación pero procesarla más tarde
- responder timeout aunque la acción sí haya ocurrido
- enviar el mismo webhook varias veces
- rechazar por validaciones no documentadas
- devolver estados intermedios poco claros
- cambiar nombres de campos o catálogos de estados
- caerse solo para ciertos tenants, canales o regiones

Entonces la pregunta correcta no es solo:

**“¿cómo llamo esta API?”**

La pregunta correcta es:

**“¿cómo hago para que mi sistema siga siendo confiable aunque la integración sea imperfecta?”**

## No todas las integraciones cumplen el mismo rol

Un paso importante es dejar de tratar a todas las integraciones externas como si fueran equivalentes.

En un e-commerce real, pueden existir integraciones de varios tipos.

### Integraciones operativas críticas

Afectan directamente el cumplimiento del negocio.

Por ejemplo:

- ERP para stock, pedidos o facturación
- carriers para etiquetas, tracking o despacho
- pasarela de pagos
- WMS o gestión de depósito

Si estas fallan, la operación se frena o entra en riesgo.

### Integraciones comerciales

Afectan exposición, adquisición o expansión del negocio.

Por ejemplo:

- marketplaces
- plataformas de anuncios
- catálogos externos
- motores promocionales

Si fallan, quizás no frenen una orden ya creada, pero sí generan pérdida comercial o inconsistencias de oferta.

### Integraciones de soporte o contexto

Ayudan a operar mejor, pero no siempre bloquean el core transaccional.

Por ejemplo:

- CRM
- help desk
- herramientas de customer service
- analítica externa

Distinguir estos tipos ayuda a decidir:

- qué integración necesita más resiliencia
- cuál merece mayor observabilidad
- cuál puede degradarse
- cuál debe tener fallback
- cuál no debería bloquear flujos críticos

## ERP: la fuente de verdad no siempre vive donde querés

El ERP suele ser una de las integraciones más delicadas.

¿Por qué?
Porque muchas veces concentra funciones que el negocio ya usa hace años:

- maestro de productos
- stock consolidado
- precios
- impuestos
- facturación
- contabilidad
- estado administrativo de pedidos
- compras o abastecimiento

Eso genera una tensión clásica.

El e-commerce necesita velocidad.
El ERP suele priorizar control administrativo.

El e-commerce quiere:

- responder rápido
- vender sin fricción
- tolerar volumen
- actualizar experiencia en tiempo real

El ERP suele moverse mejor en:

- consistencia administrativa
- procesos más lentos
- reglas empresariales heredadas
- integraciones batch o semisíncronas

Entonces aparece una decisión arquitectónica importante:

**no asumir que el ERP puede ser consultado en línea para cada decisión del storefront.**

Muchas veces conviene desacoplar.

Por ejemplo:

- sincronizar catálogo hacia el e-commerce
- proyectar stock y precios en modelos locales
- enviar pedidos al ERP de forma asíncrona
- reconciliar estados luego
- usar colas o eventos para absorber diferencias de tiempo

Si cada acción del cliente depende sin amortiguación del ERP, el sitio termina heredando la fragilidad y latencia de un sistema que quizá no fue pensado para ese ritmo.

## Carrier no es solo tracking: también introduce incertidumbre operativa

Cuando se piensa en carriers, a veces se los reduce a “mostrar el número de seguimiento”.

Pero en la práctica suelen intervenir en partes muy sensibles del flujo:

- cotización de envío
- promesas de entrega
- generación de etiquetas
- retiro o pickup
- tracking
- incidentes logísticos
- confirmación de entrega
- devoluciones o reverse logistics

Y además tienen una característica complicada:

**muchas veces el carrier es fuente de información tardía, incompleta o difícil de interpretar.**

Por ejemplo:

- marca un pedido como “en distribución” pero no se sabe ventana real
- informa “entregado” aunque el cliente reclama lo contrario
- devuelve estados distintos según país o sucursal
- reintenta retiro sin notificar a tiempo
- reporta novedades en lotes, no en tiempo real

Eso significa que no conviene modelar logística como si cada respuesta del carrier fuera verdad instantánea y perfecta.

Conviene pensar más bien en:

- estados internos del negocio
- estados externos del carrier
- reglas de mapeo entre ambos
- eventos de excepción
- revisión manual cuando hay ambigüedad

O sea:
**la integración logística necesita traducción de estados, no solo transporte de datos.**

## Marketplaces y plataformas externas: vender en más lugares complica el modelo

Cuando el e-commerce se conecta con marketplaces o plataformas externas, el desafío no es solo técnico.
También es comercial y operativo.

Porque vender en muchos canales suele implicar diferencias en:

- estructura de catálogo
- atributos requeridos
- taxonomías
- políticas de publicación
- pricing
- comisiones
- stock disponible por canal
- tiempos de despacho
- reglas de cancelación
- devoluciones
- SLA

Y además puede haber asimetría de ownership.

Por ejemplo:

- el producto maestro vive en tu sistema pero la publicación vive afuera
- el pedido entra desde el marketplace pero el fulfillment ocurre en tu operación
- el reclamo arranca en la plataforma externa pero requiere acción interna
- el stock se comparte entre canal propio y canal tercero

Esto obliga a pensar integraciones con una lógica mucho más madura que “copiar datos”.

Hay que responder preguntas como:

- cuál es el identificador canónico del producto
- cómo se mapean variantes entre sistemas
- quién manda sobre el precio final en cada canal
- cómo se reserva stock sin sobreventa entre canales
- cómo se sincronizan cancelaciones
- cómo se manejan diferencias de estado
- cómo se auditan reprocesos y errores de publicación

## Integrar no es replicar exactamente el modelo externo

Otro error muy común.

Llega una integración nueva y alguien decide copiar en la base local exactamente:

- los nombres de campos del proveedor
- sus estados
- sus códigos internos
- su jerarquía
- sus reglas implícitas

Eso parece práctico.
Pero a largo plazo genera dependencia innecesaria.

Porque tu backend termina organizado alrededor de cómo piensa el proveedor, no alrededor de cómo necesita operar tu negocio.

Una práctica más sana suele ser:

- tener un modelo interno propio
- traducir contratos externos a conceptos internos
- mapear estados externos a estados de negocio comprensibles
- guardar el payload crudo cuando haga falta para auditoría
- aislar adaptadores por proveedor

Esto es importante porque cambia mucho la mantenibilidad.

Si mañana:

- cambiás de carrier
- sumás otro ERP
- incorporás otro marketplace
- cambiás de pasarela de pagos

vas a agradecer no haber contaminado todo el dominio con los nombres y rarezas del proveedor anterior.

## Sincronización no siempre significa tiempo real

En e-commerce hay mucha presión por “todo en tiempo real”.

Y a veces tiene sentido.
Por ejemplo, en:

- disponibilidad de stock
- resultado de pagos
- estado visible de una orden al cliente

Pero no todo necesita esa misma inmediatez.

Hay integraciones que toleran mejor:

- sincronización por eventos
- procesamiento asíncrono
- jobs periódicos
- reconciliaciones batch
- refresco con ventanas pequeñas

La clave es distinguir qué necesita el negocio de verdad.

Porque exigir tiempo real donde no hace falta suele encarecer y fragilizar la arquitectura.

Ejemplos:

- una actualización contable en ERP quizás no necesita impactar en milisegundos en la web
- cierta metadata logística puede refrescarse cada algunos minutos
- un catálogo externo puede sincronizarse por lotes
- ciertas conciliaciones financieras pueden correr en segundo plano

La pregunta útil no es:

**“¿puede ser en tiempo real?”**

La pregunta útil es:

**“¿qué demora máxima tolera este proceso antes de afectar operación, experiencia o riesgo?”**

## Webhooks, polling y jobs de reconciliación

En integraciones reales, rara vez alcanza con una única estrategia.

Muchas veces conviven varias.

### Webhooks

Sirven para enterarse de cambios externos sin estar preguntando todo el tiempo.

Pero tienen problemas típicos:

- duplicados
- desorden temporal
- payloads incompletos
- entregas retrasadas
- reintentos masivos

### Polling

Sirve para consultar estado cuando el proveedor no empuja eventos o cuando querés verificar algo.

Pero también trae problemas:

- costo operativo
- latencia innecesaria
- límites de rate
- carga extra sobre ambos sistemas

### Jobs de reconciliación

Son muy importantes y a veces olvidados.

Sirven para detectar diferencias entre tu estado y el del proveedor después del flujo normal.

Por ejemplo:

- pagos aprobados afuera pero no reflejados adentro
- órdenes enviadas al ERP pero no confirmadas
- envíos sin tracking actualizado
- publicaciones desincronizadas con el marketplace

En sistemas serios, reconciliar no es un parche vergonzoso.
Es una parte esperable del diseño.

Porque cuando hay varios sistemas coordinándose, tarde o temprano aparecen diferencias.

## Idempotencia y reintentos son obligatorios, no opcionales

Este punto vale oro.

En comercio real, una integración externa puede provocar:

- reenvío de eventos
- repetición de mensajes
- reintento por timeout
- duplicación manual por parte de un operador
- relanzamiento de procesos fallidos

Si tu sistema no está preparado para eso, aparecen problemas graves como:

- órdenes duplicadas
- etiquetas de envío duplicadas
- facturas duplicadas
- cambios de estado repetidos
- reembolsos múltiples
- reservas inconsistentes

Por eso las integraciones importantes deberían diseñarse con preguntas como:

- cuál es la clave idempotente
- qué operación puede reintentarse sin efecto colateral nuevo
- qué parte del flujo debe detectar duplicados
- qué eventos ya fueron procesados
- qué hacer cuando no sabés si el intento anterior impactó o no

En integraciones de negocio, reintentar “a ciegas” sin modelo idempotente es receta para incidentes serios.

## Los estados inciertos merecen tratamiento explícito

Este es uno de los puntos más reales y menos enseñados.

Hay situaciones donde no sabés con certeza qué pasó.

Por ejemplo:

- llamaste al ERP y hubo timeout
- mandaste a generar etiqueta y el carrier no respondió claro
- el marketplace aceptó el pedido pero la confirmación quedó pendiente
- el pago parece aprobado en el proveedor pero tu sistema no terminó de persistir el cambio

En esos casos, mucha gente cae en dos malos extremos:

- asumir éxito sin confirmación fuerte
- asumir fracaso sin verificar si la acción sí ocurrió

Los dos pueden romper el negocio.

Por eso suele ser sano modelar estados como:

- pendiente de confirmación
- enviado pero no confirmado
- inconsistente
- requiere reconciliación
- en revisión manual

Eso le da al sistema una forma honesta de representar la incertidumbre sin inventar certezas.

## Observabilidad: no alcanza con saber que “la integración falló”

Cuando una integración se rompe, el equipo necesita más que un mensaje genérico.

Necesita entender:

- qué proveedor falló
- en qué operación
- para qué orden, envío o publicación
- con qué payload o referencia
- cuántas veces se reintentó
- qué respuesta devolvió
- si el error es transitorio o permanente
- cuántos casos quedaron afectados
- si hay backlog acumulado

Por eso la observabilidad de integraciones debería incluir, idealmente:

- logs estructurados
- correlation IDs
- métricas por proveedor y operación
- colas con visibilidad de pendientes
- dashboards por tipo de error
- alertas por degradación sostenida
- trazabilidad entre evento, job y entidad de negocio

La meta no es solo “registrar errores”.
La meta es **poder operar el ecosistema integrado sin depender de adivinanzas**.

## Integraciones y operación manual controlada

En un sistema sano, no todo se resuelve de forma automática.

A veces hace falta intervención humana.

Por ejemplo:

- relanzar una sincronización fallida
- remarcar una orden para conciliación
- reenviar un pedido al ERP
- regenerar una etiqueta
- pausar publicaciones a un marketplace
- revisar un mismatch de stock

Pero esa intervención no debería ser desordenada.

Conviene que el sistema permita acciones manuales controladas, por ejemplo:

- reprocesar con motivo registrado
- limitar quién puede ejecutar ciertas operaciones
- mostrar impacto potencial
- evitar duplicaciones peligrosas
- auditar quién intervino y cuándo

Porque cuando la operación manual existe pero el sistema no la soporta bien, la gente termina improvisando por afuera.
Y eso casi siempre empeora la confiabilidad.

## Algunas decisiones sanas para integraciones de e-commerce

### 1. Diferenciar modelo interno de contrato externo

No dejar que el proveedor defina toda tu semántica interna.

### 2. Diseñar para reintentos, duplicados y demoras

Asumir que van a pasar.
No tratarlos como casos raros.

### 3. Elegir sincronización según necesidad real del negocio

No todo requiere tiempo real.

### 4. Tener reconciliaciones periódicas

Para detectar y corregir desvíos inevitables.

### 5. Hacer visibles estados inciertos

Mejor incertidumbre explícita que falsa certeza.

### 6. Aislar adaptadores por proveedor

Para reducir impacto cuando cambian contratos o se reemplaza un partner.

### 7. Dar tooling operativo para reprocesar con control

No obligar al equipo a resolver incidentes por afuera del sistema.

### 8. Medir la salud de cada integración

Latencia, error rate, backlog, retries, volumen afectado y tiempo de recuperación.

## Mini ejercicio mental

Imaginá un e-commerce con:

- ERP como maestro administrativo
- stock sincronizado cada pocos minutos
- carrier principal y carrier secundario
- ventas en canal propio y en dos marketplaces
- pagos con pasarela externa
- equipo operativo que necesita reprocesar errores

Preguntas para pensar:

- qué datos proyectarías localmente en vez de consultar siempre al ERP
- qué operaciones harías síncronas y cuáles asíncronas
- cómo mapearías estados logísticos externos a estados internos comprensibles
- qué reconciliaciones correrías cada hora y cuáles una vez por día
- qué harías si el carrier genera una etiqueta pero tu sistema no recibe confirmación
- cómo evitarías sobreventa entre sitio propio y marketplaces
- qué dashboards necesitaría el equipo para detectar integración degradada antes de que explote el soporte
- qué acciones manuales permitirías en backoffice para reprocesar sin duplicar efectos

## Resumen

Las integraciones con ERP, carriers y plataformas externas son una parte central del e-commerce real.

No son detalles periféricos.
Tampoco son simples llamadas técnicas.

Son puntos de coordinación entre sistemas con ritmos, contratos, estados y niveles de confiabilidad distintos.

La idea central de este tema es esta:

**integrar bien en e-commerce no consiste en conectar sistemas, sino en diseñar un backend capaz de absorber diferencias, fallas, retrasos y ambigüedades sin perder trazabilidad, consistencia operativa ni capacidad de resolución.**

Cuando eso se hace bien, el negocio puede vender en más canales, operar con más partners y escalar sin que cada integración nueva se convierta en una fuente permanente de caos.

Y eso nos deja listos para el siguiente tema, donde vamos a mirar cómo traducir toda esa operación en información útil para decidir:

**métricas comerciales y reporting transaccional**.
