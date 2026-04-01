---
title: "Proyecciones, read models y vistas materializadas"
description: "Qué son las proyecciones y los read models, cuándo conviene derivar estructuras específicas para lectura, cómo pensar vistas materializadas sin convertirlas en una trampa de consistencia, y qué decisiones ayudan a servir consultas rápidas y estables sin castigar el modelo operativo principal."
order: 214
module: "Datos, reporting y procesamiento"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior vimos algo clave:

- mover datos no es solo copiarlos
- ETL y ELT son decisiones sobre dónde y cuándo transformar
- batch y streaming cambian la latencia y la complejidad
- y un pipeline sano tiene que tolerar fallas, reprocesos y datos tardíos

Pero apenas eso queda claro, aparece otra pregunta muy práctica:

**una vez que ya moví o derivé datos, cómo los organizo para leerlos bien.**

Porque una cosa es tener datos disponibles.
Y otra muy distinta es poder responder consultas de forma:

- rápida
- estable
- semánticamente clara
- barata de ejecutar
- y sin castigar a cada rato el sistema transaccional principal

Ahí entran tres ideas que aparecen muchísimo en sistemas reales:

- **proyecciones**
- **read models**
- **vistas materializadas**

Las tres apuntan al mismo problema general:

**no siempre conviene leer desde el modelo original de escritura.**

A veces porque ese modelo está optimizado para consistencia y mutación.
A veces porque la consulta necesita joins y agregaciones incómodas.
A veces porque querés una forma de lectura más simple para una pantalla, un dashboard o una API.
Y a veces porque consultar en vivo sobre el core operativo sale demasiado caro.

La idea central de este tema es esta:

**cuando las necesidades de lectura crecen, muchas veces conviene construir estructuras derivadas específicamente pensadas para leer, no para escribir.**

Y hacer eso bien implica entender:

- qué estás proyectando realmente
- con qué latencia aceptable
- con qué garantías de consistencia
- con qué costo de mantenimiento
- y con qué semántica para quienes consumen esa lectura

## El problema real: el modelo de escritura no siempre sirve bien para leer

Éste es un error muy común en sistemas que empiezan a crecer.

Se modela razonablemente bien la parte operativa:

- órdenes
- pagos
- envíos
- reembolsos
- usuarios
- tenants
- suscripciones
- eventos de uso

Y después se intenta usar exactamente esas mismas tablas y relaciones para todo lo demás:

- pantallas complejas
- dashboards
- búsquedas
- backoffice
- reportes internos
- APIs de consulta para otros equipos

Al principio parece lógico.

Si la información ya existe, por qué no leerla desde ahí.

El problema es que el modelo operativo suele estar optimizado para cosas como:

- crear una orden
- cambiar un estado
- validar una transición
- registrar un pago
- reservar stock
- actualizar una suscripción

No necesariamente para cosas como:

- mostrar una vista consolidada de una orden con pago, envío, fraude y timeline
- listar clientes enterprise con uso, plan, facturación y riesgo de churn
- consultar métricas de fulfillment por región y carrier
- construir una pantalla de backoffice con filtros complejos y latencia baja

Entonces aparece el síntoma clásico:

- queries enormes
- joins difíciles de mantener
- endpoints lentos
- N+1 queries
- lógica de lectura repartida entre servicios
- métricas inconsistentes según quién consulta

La raíz suele ser esta:

**estás intentando hacer lecturas complejas sobre un modelo que fue pensado principalmente para escribir y validar operación.**

## Qué es una proyección

Una **proyección** es una representación derivada de datos pensada para un uso concreto de lectura.

La palabra ayuda porque sugiere algo importante:

no estás copiando el mundo entero.
Estás proyectando ciertos hechos del sistema hacia una forma útil para consultar.

Ejemplos:

- una tabla con el estado consolidado de una orden
- un resumen por tenant y por día
- una vista de catálogo lista para búsqueda
- una estructura con saldo actual por cuenta
- un timeline de eventos relevantes por entidad

Una proyección puede surgir de:

- tablas transaccionales
- eventos del dominio
- logs de cambio
- pipelines batch
- procesamiento streaming
- combinaciones de varias fuentes

La idea no es duplicar por duplicar.
La idea es **publicar una lectura con otra forma, porque esa otra forma sirve mejor para el caso de uso**.

## Qué es un read model

Un **read model** es una estructura de datos diseñada específicamente para consultas.

En muchos contextos, “proyección” y “read model” se usan casi como sinónimos.
No hace falta obsesionarse con la pureza del término.

Una forma práctica de diferenciarlos puede ser esta:

- **proyección** enfatiza el proceso de derivar datos desde otra fuente
- **read model** enfatiza el resultado final pensado para lectura

Por ejemplo:

- tu sistema emite eventos de orden creada, pago capturado y envío despachado
- construís una proyección que consolida esos hechos
- el resultado es un read model `order_overview`

Ese read model podría tener campos como:

- `order_id`
- `customer_name`
- `payment_status`
- `fulfillment_status`
- `shipment_tracking_code`
- `fraud_review_status`
- `grand_total`
- `last_relevant_event_at`

Tal vez esos datos en el modelo original existen, pero repartidos entre muchas tablas y servicios.
El read model los deja listos para leer.

## Qué es una vista materializada

Una **vista materializada** es una estructura persistida que guarda el resultado de una consulta o derivación, en lugar de recalcularla completa cada vez.

La diferencia importante con una vista tradicional es que la materializada:

- guarda resultados físicamente
- suele requerir refresh o actualización
- intercambia frescura por velocidad de lectura

Sirve mucho cuando tenés:

- joins costosos
- agregaciones frecuentes
- consultas repetidas
- necesidad de respuesta rápida
- reportes que no requieren exactitud en tiempo real absoluto

Ejemplos típicos:

- ventas por día y categoría
- stock agregado por depósito
- uso por tenant consolidado cada cierto intervalo
- ranking de productos más vendidos
- estados resumidos de procesamiento

La vista materializada no es magia.
Simplemente hace explícita una decisión muy humana:

**prefiero pagar el costo de cálculo en un momento controlado y leer rápido después.**

## La idea unificadora: escribir de una forma, leer de otra

Éste es el corazón del tema.

En muchos sistemas reales conviene aceptar que:

- la forma óptima de escribir
- y la forma óptima de leer

no son la misma.

Esto no significa necesariamente usar CQRS formal o montar una arquitectura exótica.
Significa algo más simple y útil:

**permitirte derivar estructuras de lectura distintas del modelo fuente cuando eso reduce costo mental, costo computacional y fragilidad operativa.**

Algunos ejemplos muy concretos:

### Ejemplo 1: pantalla de detalle de orden

En el modelo operativo tenés:

- `orders`
- `order_items`
- `payments`
- `refunds`
- `shipments`
- `fraud_reviews`
- `customer_notes`

Todo eso sirve para operar.
Pero para la UI de backoffice querés una lectura mucho más simple.

Entonces armás un read model:

- `order_view`

con la información consolidada más relevante.

### Ejemplo 2: dashboard de SaaS B2B

El sistema tiene:

- tenants
- subscriptions
- invoices
- feature usage
- support tickets

Pero el dashboard de account management necesita:

- tenant
- plan actual
- uso del mes
- salud de cobranza
- incidentes abiertos
- riesgo comercial

Ese dashboard probablemente no quiera resolver todo en tiempo real con joins sobre cinco fuentes distintas.
Le conviene un read model consolidado.

### Ejemplo 3: catálogo de e-commerce

El modelo operativo tiene:

- productos
- variantes
- stock por depósito
- reglas de precio
- promociones
- estado de publicación

Pero la búsqueda pública necesita algo como:

- título indexable
- precio efectivo
- disponibilidad agregada
- atributos filtrables
- popularidad
- score de búsqueda

Eso muchas veces termina viviendo mejor en una proyección de lectura pensada para catálogo que en el modelo transaccional original.

## Cuándo conviene proyectar

No todo merece una proyección.
No todo merece una vista materializada.
No todo merece un read model separado.

Pero sí hay señales muy claras.

### Señales de que conviene derivar una estructura de lectura

- la misma consulta pesada se repite mucho
- una pantalla depende de demasiados joins o llamadas encadenadas
- querés semántica de lectura más clara que la del modelo operativo
- la base transaccional sufre por consultas analíticas o de backoffice
- necesitás combinar varias fuentes en una sola vista coherente
- las consultas requieren agregaciones frecuentes
- la latencia de lectura importa mucho
- el costo de recalcular en vivo es alto
- la lectura tolera cierta demora respecto del dato fuente

### Señales de que todavía no hace falta

- la consulta es simple y barata
- el volumen es bajo
- la complejidad de sincronizar una proyección sería mayor que el beneficio
- todavía no sabés bien cuál es el patrón real de consumo
- el caso de uso es exploratorio y cambia cada semana

La clave es no caer en ninguno de los extremos:

- ni “todo directo desde el modelo operativo para siempre”
- ni “todo merece su read model desde el día uno”

## Proyección por batch vs proyección por eventos

Hay muchas formas de construir una proyección.
Dos familias muy comunes son:

- por **batch**
- por **eventos**

### Proyección por batch

Consiste en recalcular total o parcialmente una estructura derivada cada cierto intervalo.

Ejemplos:

- cada 5 minutos
- cada hora
- cada noche
- al cierre de día

Ventajas:

- más simple de diseñar
- más fácil de depurar
- más fácil de reprocesar por rango
- menor complejidad distribuida

Costos:

- más latencia
- riesgo de picos de cálculo por ventana
- posible frescura insuficiente para ciertos casos

### Proyección por eventos

Consiste en actualizar el read model a medida que ocurren cambios relevantes.

Ejemplos:

- cuando llega `OrderCreated`, insertás una fila
- cuando llega `PaymentCaptured`, actualizás `payment_status`
- cuando llega `ShipmentDispatched`, actualizás `fulfillment_status` y tracking

Ventajas:

- menor latencia
- read model casi en tiempo real
- útil para interfaces operativas o monitoreo rápido

Costos:

- más complejidad de consistencia
- más cuidado con orden de eventos, duplicados y reintentos
- debugging más difícil
- exige observabilidad mejor

Ningún enfoque gana siempre.
Otra vez, la pregunta sana es:

**qué frescura necesitás y cuánto querés pagar de complejidad para conseguirla.**

## La consistencia cambia cuando introducís proyecciones

Éste es un punto clave.

Cuando derivás un read model separado, muchas veces dejás de tener consistencia instantánea y única entre escritura y lectura.

Por ejemplo:

- se confirma un pago en el sistema fuente
- pero el read model de dashboard tarda 10 segundos en reflejarlo

Eso puede ser totalmente aceptable.
Pero tiene que ser una decisión consciente.

### Preguntas importantes acá

- la lectura necesita reflejar el cambio inmediatamente o puede tolerar delay
- cuánto delay es aceptable: segundos, minutos, horas
- quién consume esa lectura: un cliente final, finanzas, soporte, producto
- qué consecuencias tiene ver un dato viejo
- cómo explicás semánticamente ese retraso

Un read model sin contrato semántico claro genera confusión.
No alcanza con decir “eventualmente converge”.
Hay que saber **para qué uso esa eventualidad es razonable y para cuál no**.

## El peligro de la duplicación sin semántica

Una de las peores trampas es crear tablas derivadas sin dejar claro qué representan.

Entonces aparecen nombres como:

- `orders_summary`
- `orders_v2`
- `dashboard_orders`
- `reporting_current`

Y nadie sabe bien:

- qué lógica tienen adentro
- qué latencia manejan
- si son exactas o aproximadas
- si incluyen cancelaciones tardías
- si ya conciliaron reembolsos
- si se actualizan en vivo o por batch

Eso genera una capa analítica o de lectura difícil de confiar.

Por eso una proyección sana necesita decir explícitamente:

- qué representa
- desde qué fuentes se construye
- con qué frecuencia se actualiza
- qué retraso puede tener
- qué entidad o evento la alimenta
- qué reglas de negocio usa
- quién debería consumirla

## Vistas materializadas: cuándo ayudan muchísimo

Las vistas materializadas pueden ser una herramienta excelente cuando:

- la consulta de base es estable
- el patrón de uso es repetitivo
- recalcular siempre sería caro
- la frescura necesaria no es instantánea

Ejemplo típico:

querés mostrar ventas por día, canal y categoría para los últimos 90 días.

Podrías recalcular cada consulta leyendo:

- órdenes
- ítems
- pagos
- reembolsos
- promociones

Pero probablemente eso sea caro y propenso a errores.
Entonces definís una vista materializada que ya deje preparado ese agregado.

La lectura después es mucho más simple.

## Vistas materializadas: trampas comunes

También tienen trampas.

### 1. Nadie sabe cuándo se refrescan

Entonces un usuario mira el dashboard y cree que ve tiempo real cuando en realidad está viendo datos de hace una hora.

### 2. Se vuelven demasiado pesadas de refrescar

Lo que empezó como una gran idea termina tardando tanto que el refresh compite con la operación normal.

### 3. Tienen dependencias implícitas frágiles

Cambió una tabla fuente, cambió una semántica, cambió un join, y la vista quedó conceptualmente vieja.

### 4. Se multiplican sin gobernanza

Cada equipo crea sus propias vistas materializadas y después nadie sabe cuál es la fuente confiable.

### 5. Se usan como parche eterno

A veces una vista materializada tapa un problema de modelado o de arquitectura, pero no lo resuelve.

La moraleja no es “no uses vistas materializadas”.
La moraleja es:

**usarlas como herramienta consciente, no como acumulación improvisada de atajos.**

## Read models orientados a caso de uso

Una práctica muy sana es diseñar read models pensando en un consumidor concreto.

No en abstracto.

Por ejemplo:

- read model para la pantalla de detalle de orden
- read model para la búsqueda de catálogo
- read model para el dashboard de customer success
- read model para conciliación financiera
- read model para métricas diarias por tenant

Esto mejora mucho el diseño porque te obliga a responder:

- qué campos necesita de verdad el consumidor
- qué filtros o agregaciones hará
- cuánta frescura necesita
- qué volumen de lectura espera
- qué semántica debe tener cada estado o métrica

El read model deja de ser “una copia cómoda” y pasa a ser **una interfaz de lectura diseñada**.

## Ejemplo mental: e-commerce

Imaginá un detalle de orden para backoffice.

Si lo resolvés en vivo cada vez, tal vez necesitás:

- ordenar principal
- ítems
- pago
- fraude
- envío
- reembolso
- historial de eventos
- datos de cliente

Eso puede implicar:

- múltiples joins
- varias tablas grandes
- lógica semántica repetida en cada endpoint

En cambio, podrías tener una proyección `order_backoffice_view` con campos como:

- `order_id`
- `customer_display_name`
- `current_status`
- `payment_status`
- `fulfillment_status`
- `risk_status`
- `tracking_code`
- `refund_total`
- `last_event_at`

No reemplaza al modelo fuente.
Lo complementa para un uso de lectura concreto.

## Ejemplo mental: SaaS B2B

Supongamos que querés una pantalla de “salud del cliente”.

El dato viene de:

- tenant
- plan
- consumo
- invoices
- dunning
- tickets abiertos
- incidentes recientes

Podrías construir un read model `tenant_health_snapshot` que tenga:

- `tenant_id`
- `plan_name`
- `usage_ratio`
- `billing_health`
- `open_support_tickets`
- `recent_incidents`
- `renewal_risk_score`

Eso permite lecturas rápidas y semánticamente claras para equipos de CS o ventas.

## Qué cuidar cuando actualizás una proyección

Construir la proyección es solo la mitad del problema.
La otra mitad es mantenerla bien.

### Cosas importantes a definir

#### Identidad

Qué clave identifica cada fila proyectada.

#### Estrategia de actualización

- insert
- upsert
- replace por partición
- recomputación completa

#### Orden de procesamiento

Si depende de eventos, importa saber qué pasa cuando llegan fuera de orden.

#### Idempotencia

Si reprocesás la misma entrada, el resultado tiene que seguir siendo correcto.

#### Manejo de faltantes temporales

Qué hacés cuando todavía no llegó una de las fuentes necesarias.

#### Borrados o invalidaciones

Cómo se refleja que un dato dejó de ser válido o cambió de semántica.

## La relación con CQRS

A veces este tema aparece mezclado con CQRS.
Está bien conocer la relación, pero no hace falta volverlo ceremonia.

La idea útil que podés rescatar es esta:

- el lado de escritura puede tener un modelo
- el lado de lectura puede tener otro

Eso no obliga a montar una arquitectura compleja.
Podés aplicar esa intuición de manera gradual.

Por ejemplo:

- seguir escribiendo sobre el modelo principal
- pero derivar uno o dos read models para consultas críticas

Eso ya captura gran parte del valor sin meterte en dogmas.

## Qué errores de diseño aparecen mucho

### 1. Crear proyecciones demasiado genéricas

Quieren servir para todo, y terminan no sirviendo bien para nada.

### 2. No documentar semántica

El consumidor no sabe si lo que ve es tiempo real, reconciliado, preliminar o parcial.

### 3. Construir demasiadas proyecciones solapadas

Después aparecen varias “fuentes de verdad” compitiendo.

### 4. Ignorar el costo de mantenimiento

Cada proyección nueva también es software que puede romperse.

### 5. Usar una vista materializada para tapar una consulta mal pensada

A veces conviene mejorar el modelo o la consulta antes de persistir un parche.

### 6. No diseñar reproceso

Cuando cambia la lógica, nadie sabe cómo regenerar la proyección de forma segura.

### 7. No pensar en frescura explícitamente

Y entonces soporte, finanzas y producto esperan comportamientos distintos sobre la misma salida.

## Cómo decidir entre consulta en vivo, read model o vista materializada

Una forma simple de pensar la decisión es esta.

### Consulta en vivo sobre modelo fuente

Conviene cuando:

- la consulta es simple
- el costo es bajo
- la frescura inmediata importa mucho
- el caso de uso todavía no está estabilizado

### Read model derivado

Conviene cuando:

- el caso de uso de lectura es claro
- querés otra forma semántica
- necesitás consolidar varias fuentes
- el patrón de consulta es estable y frecuente

### Vista materializada

Conviene cuando:

- la derivación es relativamente estable
- el costo de recalcular siempre es alto
- podés tolerar refresh periódico
- el objetivo principal es acelerar lectura repetitiva

No siempre hay una sola respuesta correcta.
A veces incluso convivís con varias:

- consulta en vivo para detalle ultra sensible
- read model para backoffice diario
- vista materializada para dashboard agregado

## Mini ejercicio mental

Imaginá que tenés un e-commerce con:

- órdenes
- pagos
- envíos
- reembolsos
- catálogo
- stock

Preguntas para pensar:

- qué pantalla o reporte hoy te obliga a demasiados joins
- qué lectura toleraría delay de 5 minutos sin problema
- qué estructura derivada podrías construir para soporte operativo
- qué dato sería peligroso mostrar si la proyección se atrasa
- qué campos pondrías en un read model de detalle de orden
- qué agregado pondrías en una vista materializada de ventas
- cómo reprocesarías el último mes si cambiara la lógica comercial

## Resumen

Proyecciones, read models y vistas materializadas aparecen cuando el sistema deja de poder leer cómodamente desde el mismo modelo con el que escribe.

La idea central de este tema es esta:

**cuando las necesidades de lectura crecen, conviene diseñar estructuras derivadas pensadas específicamente para consultar, con semántica clara, costo razonable y consistencia acorde al caso de uso.**

Eso permite:

- lecturas más rápidas
- consultas más simples
- menos presión sobre la operación transaccional
- dashboards y backoffices más estables
- menos lógica repetida en cada endpoint
- y una capa de lectura más expresiva para el negocio

Pero también exige cuidado con:

- la semántica
- la frescura
- la idempotencia
- el reproceso
- la gobernanza de las estructuras derivadas

Cuando eso está bien pensado, leer deja de ser una pelea constante contra el modelo operativo.
Y eso nos deja listos para el siguiente tema, donde vamos a subir un nivel más en la idea de derivar información:

**eventos como fuente de datos derivados.**
