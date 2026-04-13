---
title: "Log aggregation"
description: "Qué es la agregación de logs, qué problema resuelve en una arquitectura distribuida y cómo aplicarla en NovaMarket para centralizar el análisis técnico de gateway, servicios de negocio e infraestructura."
order: 29
module: "Módulo 7 · Observabilidad moderna"
level: "intermedio"
draft: false
---

# Log aggregation

A medida que una arquitectura distribuida crece, mirar los logs de cada servicio por separado deja de ser suficiente.

En una aplicación simple, puede alcanzar con abrir la consola del proceso principal y leer lo que va apareciendo. Pero en una solución con varios microservicios, múltiples contenedores y componentes de infraestructura, ese enfoque se vuelve rápidamente incómodo, frágil y poco escalable.

En **NovaMarket**, a esta altura del curso ya tenemos o vamos a tener componentes como:

- `api-gateway`,
- `catalog-service`,
- `inventory-service`,
- `order-service`,
- `notification-service`,
- `config-server`,
- `discovery-server`,
- RabbitMQ,
- Keycloak,
- y más adelante todo esto funcionando con Docker Compose.

Cuando ocurre un problema real, lo normal es que la información relevante no esté en un solo lugar. Ahí es donde aparece la **agregación de logs**.

---

## Qué es la agregación de logs

La agregación de logs consiste en **recolectar, centralizar, indexar y consultar los logs emitidos por distintos servicios y componentes del sistema**.

La idea no es solo guardar archivos en un lugar común, sino permitir que esos logs puedan:

- buscarse de forma unificada,
- filtrarse por servicio,
- correlacionarse por tiempo,
- agruparse por nivel o tipo de evento,
- y analizarse sin tener que entrar manualmente a cada instancia o contenedor.

---

## Qué problema resuelve

Veamos un caso típico en NovaMarket.

Un usuario intenta crear una orden y recibe un error.

La información relevante podría estar repartida entre varios lugares:

- el gateway puede haber registrado la request de entrada,
- `order-service` puede haber emitido un error de negocio,
- `inventory-service` puede haber respondido con latencia o error técnico,
- RabbitMQ puede haber tenido alguna situación particular,
- `notification-service` puede haber intentado procesar un evento posterior.

Si cada log vive aislado:

- el análisis es lento,
- aumenta la probabilidad de pasar por alto algo importante,
- cuesta reconstruir el orden real de los hechos,
- y el troubleshooting se vuelve más artesanal que sistemático.

La agregación de logs reduce fuertemente ese problema.

---

## Por qué este tema importa en microservicios

En un sistema distribuido, la complejidad ya no está solo en el código de negocio.

También aparece en:

- la red,
- la infraestructura,
- los contenedores,
- la seguridad,
- el descubrimiento de servicios,
- la mensajería,
- la resiliencia.

Cada una de esas piezas puede emitir logs valiosos.

Si esos registros no están centralizados, la capacidad de diagnóstico cae mucho. Por eso la agregación de logs no es un “extra lindo de observabilidad”, sino una capacidad operativa importante.

---

## Qué diferencia hay entre logging y log aggregation

### Logging

Es la práctica de emitir mensajes técnicos desde una aplicación o servicio.

Ejemplos:
- “Se recibió la solicitud para crear una orden”
- “No hay stock para el producto 15”
- “Se publicó OrderCreatedEvent”
- “JWT inválido o expirado”

### Log aggregation

Es la práctica de **reunir esos logs en un punto común** para poder analizarlos de forma eficiente.

Una cosa no reemplaza a la otra:

- primero el sistema debe loguear razonablemente bien,
- después esos logs deben centralizarse para ser realmente útiles a escala.

---

## Qué logs conviene centralizar en NovaMarket

En el contexto del curso, conviene pensar al menos en estas fuentes:

### 1. Logs de aplicación

- gateway,
- `catalog-service`,
- `inventory-service`,
- `order-service`,
- `notification-service`.

### 2. Logs de infraestructura propia

- `config-server`,
- `discovery-server`.

### 3. Logs de componentes externos o de soporte

- RabbitMQ,
- Keycloak,
- contenedores del entorno local.

No hace falta empezar centralizando absolutamente todo, pero sí conviene mostrar desde temprano que la arquitectura real genera información en varios lugares.

---

## Relación con trazas y métricas

La agregación de logs forma parte del mismo bloque de observabilidad que métricas y trazas, pero cumple una función distinta.

### Métricas

Ayudan a detectar tendencias:
- aumento de latencia,
- subida de errores,
- caída de throughput.

### Trazas

Ayudan a reconstruir el recorrido de una operación puntual.

### Logs agregados

Ayudan a leer mensajes técnicos concretos emitidos por los componentes del sistema, con contexto suficiente para entender mejor lo que pasó.

Una visión muy práctica sería esta:

- las métricas te avisan que algo anda mal,
- las trazas te muestran dónde estuvo el problema,
- los logs te cuentan con más detalle qué dijeron los componentes involucrados.

---

## Qué características debería tener una buena solución de agregación

No toda centralización de logs aporta el mismo valor. Una solución útil debería permitir:

- búsqueda por texto,
- filtrado por servicio,
- filtrado por nivel (`INFO`, `WARN`, `ERROR`),
- filtrado por rango temporal,
- correlación por identificador de traza o request,
- navegación relativamente cómoda del volumen de logs.

Si además permite dashboards o visualizaciones, mejor, pero lo esencial es poder **consultar bien**.

---

## Importancia de la estructura del log

Centralizar logs desordenados no resuelve demasiado.

Para que la agregación sea realmente útil, conviene que los logs tengan cierta estructura y disciplina.

Por ejemplo, ayuda mucho que cada mensaje incluya o pueda asociarse con:

- nombre del servicio,
- timestamp consistente,
- nivel de severidad,
- identificador de traza o correlación,
- mensaje claro,
- y, cuando aplica, contexto técnico relevante.

Esto es muy importante porque, en una arquitectura con varios servicios, un log aislado y ambiguo pierde muchísimo valor.

---

## Buenos logs y malos logs

### Buenos logs

Suelen tener estas cualidades:

- son claros,
- tienen contexto suficiente,
- permiten identificar el servicio que los emitió,
- ayudan a entender qué operación estaba ocurriendo,
- no exponen información sensible innecesariamente.

### Malos logs

Suelen tener problemas como:

- mensajes genéricos,
- falta de contexto,
- ruido excesivo,
- datos sensibles expuestos,
- o ausencia de identificadores de correlación.

La agregación potencia los logs buenos, pero también hace más visibles los malos.

---

## Caso aplicado a NovaMarket

Supongamos que se reporta este síntoma:

> “algunas órdenes fallan de forma intermitente”

Con logs agregados podríamos:

1. buscar eventos relacionados con `POST /orders`,
2. filtrar por `order-service`,
3. mirar errores alrededor del mismo rango temporal,
4. identificar si coinciden con warnings o errores de `inventory-service`,
5. revisar si hubo algún problema de seguridad en el gateway,
6. seguir el identificador de traza para conectar varios eventos.

Sin agregación, este análisis implicaría abrir varias consolas o recolectar archivos manualmente.

---

## ELK como ejemplo didáctico

Un stack clásico para enseñar agregación de logs es **ELK**:

- **Elasticsearch** para indexación y consulta,
- **Logstash** para procesamiento e ingesta,
- **Kibana** para visualización.

En algunos contextos también aparece Filebeat u otros agentes de envío, pero para el curso nos alcanza con entender el concepto general:

- los logs se generan en varios servicios,
- se recolectan,
- se transforman o enrutan,
- se indexan,
- y se consultan desde una interfaz común.

No es necesario convertir este curso en un curso completo de ELK, pero sí usarlo como implementación de ejemplo para mostrar la idea con una base concreta.

---

## Qué mostrar en una implementación práctica

En términos pedagógicos, conviene demostrar cosas simples y valiosas.

### Escenario 1: búsqueda por servicio

Buscar todos los logs de `order-service` en una ventana temporal específica.

### Escenario 2: filtrado por error

Filtrar logs `ERROR` asociados a la creación de órdenes.

### Escenario 3: correlación con tracing

Usar un identificador de traza para encontrar logs de varios servicios que participaron en la misma operación.

### Escenario 4: análisis de flujo asincrónico

Ver logs del productor del evento y del consumidor de `notification-service` en torno al mismo caso funcional.

Estos escenarios muestran por qué centralizar logs tiene valor real.

---

## Riesgos y cuidados

La agregación de logs también trae responsabilidades.

### 1. Volumen excesivo

Si todo loguea demasiado, la señal se diluye entre ruido.

### 2. Datos sensibles

No deberían terminar centralizados en texto claro datos como:
- tokens,
- contraseñas,
- secretos,
- información personal innecesaria.

### 3. Costos operativos

Centralizar, indexar y consultar logs tiene costo de infraestructura y de administración.

### 4. Falsa sensación de observabilidad completa

Tener logs agregados no significa tener resuelto todo el diagnóstico. Sigue siendo importante combinar logs con métricas y trazas.

---

## Cómo encaja este tema en el curso

Este módulo llega después de:

- métricas con Actuator y Micrometer,
- trazas distribuidas con Micrometer Tracing,
- implementación del tracing sobre el flujo principal.

Eso es ideal, porque ahora la observabilidad de NovaMarket ya tiene suficiente madurez como para mostrar las tres señales juntas:

- **metrics**,
- **traces**,
- **logs agregados**.

En otras palabras, este no es un tema aislado: completa la observabilidad moderna del sistema.

---

## Qué mejora concreta deja en NovaMarket

Después de incorporar agregación de logs, el proyecto gana una capacidad operativa muy importante:

- diagnosticar problemas sin entrar manualmente a cada servicio,
- buscar errores de forma centralizada,
- entender mejor el contexto técnico de una request fallida,
- complementar trazas y métricas con mensajes concretos del sistema.

Eso hace que NovaMarket se acerque mucho más a una arquitectura que puede analizarse y mantenerse de forma profesional.

---

## Cierre

La agregación de logs resuelve uno de los problemas más prácticos de una arquitectura distribuida: la dispersión de la información técnica entre múltiples servicios y componentes.

Centralizar los logs no reemplaza las métricas ni el tracing, pero completa una observabilidad mucho más útil para debugging, operación y análisis del comportamiento real del sistema.

En el próximo módulo vamos a cambiar el foco desde la observabilidad hacia la **comunicación asincrónica**, incorporando RabbitMQ al flujo principal de NovaMarket.
