---
title: "Métricas con Spring Boot Actuator y Micrometer"
description: "Cómo incorporar métricas en microservicios con Spring Boot Actuator y Micrometer para medir latencia, errores, throughput y señales operativas relevantes."
order: 26
module: "Módulo 7 · Observabilidad moderna"
level: "intermedio"
draft: false
---

# Métricas con Spring Boot Actuator y Micrometer

En la clase anterior vimos que la observabilidad moderna se apoya en tres señales principales:

- logs,
- métricas,
- trazas.

Ahora vamos a enfocarnos en la segunda de ellas.

Las métricas cumplen un papel fundamental porque nos permiten medir el comportamiento del sistema de forma agregada y cuantitativa. En vez de quedarnos con impresiones del tipo “parece lento” o “está fallando más”, podemos empezar a responder con datos.

En NovaMarket eso es clave, porque a esta altura del curso ya tenemos varios servicios colaborando entre sí y necesitamos entender mejor cómo rinden, cómo fallan y cómo se comportan bajo carga o degradación.

---

## Qué es una métrica

Una métrica es una señal numérica que representa algún aspecto del comportamiento del sistema.

Algunos ejemplos típicos son:

- cantidad de requests,
- tiempo de respuesta,
- porcentaje de errores,
- uso de memoria,
- número de conexiones activas,
- cantidad de mensajes procesados,
- cantidad de reintentos ejecutados.

La utilidad de una métrica no está solo en su valor aislado, sino en cómo evoluciona en el tiempo y cómo se relaciona con otras señales.

---

## Por qué las métricas importan en microservicios

En una arquitectura distribuida, muchos problemas no se detectan solo con logs.

Por ejemplo:

- un endpoint puede seguir respondiendo, pero cada vez más lento,
- una dependencia puede empezar a fallar solo en un porcentaje pequeño de requests,
- el throughput puede caer sin que haya un error evidente,
- una degradación puede ser gradual y no explosiva.

Las métricas ayudan justamente a ver ese tipo de comportamiento.

---

## Qué papel cumplen Actuator y Micrometer

### Spring Boot Actuator
Actuator expone capacidades operativas y endpoints técnicos de la aplicación.

### Micrometer
Micrometer funciona como una fachada o capa de instrumentación para capturar métricas dentro de la aplicación y enviarlas a distintos backends.

Dicho de forma simple:

- Actuator ayuda a exponer,
- Micrometer ayuda a instrumentar y estructurar métricas.

En muchos proyectos con Spring Boot los dos aparecen juntos de forma natural.

---

## Dependencias base

Una base típica podría incluir algo así:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

Y luego, según el backend o la integración elegida, pueden agregarse otras dependencias más adelante.

Para el objetivo conceptual de esta clase, lo importante es entender que con Actuator y Micrometer empezamos a transformar el comportamiento técnico del sistema en señales medibles.

---

## Exposición básica de métricas

Una configuración inicial simple podría verse así:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
```

Con eso, uno de los endpoints disponibles será:

`/actuator/metrics`

Desde ahí se puede inspeccionar qué métricas están registradas en la aplicación.

---

## Qué tipos de preguntas responden las métricas

En NovaMarket, las métricas deberían ayudarnos a contestar preguntas como estas:

- ¿cuántas requests recibe `order-service`?
- ¿cuánto tarda crear una orden?
- ¿cuántas requests terminan con error?
- ¿qué endpoints tienen peor latencia?
- ¿hay diferencias entre `catalog-service` e `inventory-service`?
- ¿se está degradando una dependencia específica?

Esa capacidad de responder con números cambia muchísimo la calidad del diagnóstico.

---

## Métricas que suelen importar primero

Cuando un sistema recién empieza a instrumentarse, no conviene medir todo indiscriminadamente.

Hay algunas categorías que suelen aportar valor rápido.

### 1. Throughput
Cuántas operaciones se están procesando.

Por ejemplo:
- requests por segundo,
- cantidad de órdenes creadas,
- cantidad de mensajes consumidos.

### 2. Latencia
Cuánto tarda una operación.

Por ejemplo:
- tiempo promedio de respuesta,
- percentiles de latencia,
- p95 o p99 de un endpoint.

### 3. Errores
Qué proporción de operaciones falla.

Por ejemplo:
- errores HTTP 5xx,
- timeouts,
- fallas en llamadas remotas,
- rechazos por seguridad.

### 4. Recursos
Cómo está el estado técnico del servicio.

Por ejemplo:
- memoria,
- CPU,
- threads,
- conexiones.

---

## Ejemplo aplicado a NovaMarket

Pensemos otra vez en el flujo central del curso:

**consultar catálogo → crear orden → validar stock → registrar orden → publicar evento → notificar**

Hay varios puntos donde las métricas aportan muchísimo valor.

### En `api-gateway`
- cantidad de requests entrantes,
- latencia por ruta,
- errores de autenticación o autorización.

### En `order-service`
- cantidad de órdenes creadas,
- tiempo de respuesta de `POST /orders`,
- errores por stock insuficiente,
- fallas al consultar inventario.

### En `inventory-service`
- latencia de verificación de stock,
- frecuencia de consultas,
- errores técnicos o timeouts.

### En `notification-service`
- mensajes consumidos,
- fallos de procesamiento,
- tiempo de consumo.

---

## La importancia de la latencia

Uno de los indicadores más importantes en microservicios es la latencia.

Porque un sistema puede seguir “funcionando” y sin embargo estar deteriorándose mucho antes de caerse.

### Ejemplo
Supongamos que `inventory-service` no devuelve errores, pero pasa de responder en 40 ms a responder en 2 segundos.

En ese caso:

- quizás no veamos fallas inmediatas,
- pero `order-service` empieza a responder peor,
- el usuario percibe lentitud,
- pueden dispararse retries,
- el sistema entra en tensión.

Las métricas permiten detectar esa degradación antes de que el problema sea total.

---

## Promedios vs percentiles

Cuando hablamos de latencia, un detalle importante es no confiar solo en el promedio.

Porque el promedio puede ocultar comportamientos malos.

### Ejemplo
Si muchas requests responden muy rápido pero unas pocas tardan muchísimo, el promedio puede parecer aceptable y sin embargo la experiencia real ser mala.

Por eso los percentiles suelen ser más informativos:

- p50
- p95
- p99

Esos valores ayudan a ver qué está pasando con las requests más lentas.

---

## Métricas y resiliencia

Las métricas también son esenciales para evaluar si las decisiones de resiliencia están funcionando.

Por ejemplo, después de agregar Retry y Circuit Breaker, nos interesa medir cosas como:

- cuántas llamadas fallan antes del retry,
- cuántas se recuperan,
- cuánto aumenta la latencia total,
- cuándo el circuito se abre,
- cuánto tráfico queda afectado.

Eso evita que una estrategia resiliente se convierta en una suposición no verificada.

---

## Métricas de negocio y métricas técnicas

Conviene distinguir dos planos.

### Métricas técnicas
Hablan de funcionamiento operativo.

Ejemplos:
- latencia,
- error rate,
- memoria,
- throughput HTTP,
- conexiones.

### Métricas de negocio
Hablan de comportamiento funcional.

Ejemplos:
- órdenes creadas,
- órdenes rechazadas por stock,
- cantidad de productos consultados,
- notificaciones emitidas.

Las dos son valiosas.

En un curso como este conviene empezar fuerte por las técnicas, pero sin perder de vista que las de negocio también enriquecen mucho el sistema.

---

## Instrumentación automática y manual

Micrometer puede capturar muchas métricas automáticamente cuando se integra con componentes del ecosistema Spring.

Eso da una base muy útil.

Pero también puede haber casos donde queramos instrumentar algo específico del dominio.

### Ejemplo en NovaMarket
Podríamos querer contar:

- órdenes creadas exitosamente,
- órdenes rechazadas por falta de stock,
- eventos `OrderCreatedEvent` publicados,
- mensajes consumidos por `notification-service`.

Eso ya nos acerca a métricas más relevantes para el negocio.

---

## Qué errores conviene evitar

### 1. Medir demasiado sin objetivo
Tener muchas métricas no garantiza comprensión.

### 2. Medir solo infraestructura y no el flujo crítico
A veces se monitorea CPU y memoria, pero no el endpoint principal del sistema.

### 3. Mirar solo promedios
Puede ocultar colas largas de latencia.

### 4. No correlacionar con logs y trazas
Las métricas muestran patrones, pero no siempre explican por sí solas la causa exacta.

---

## Cómo usar métricas para diagnosticar mejor

Un enfoque útil frente a un problema en NovaMarket podría ser este:

1. detectar aumento de latencia o error rate,
2. identificar qué endpoint o servicio está afectado,
3. revisar si la dependencia remota concentra el problema,
4. complementar con logs,
5. reconstruir recorridos con trazas si hace falta.

Ese enfoque muestra por qué las métricas no reemplazan las otras señales, pero sí son una base excelente para disparar la investigación correcta.

---

## Qué vamos a profundizar después

En esta clase nos concentramos en el rol de las métricas y en cómo Actuator y Micrometer ayudan a instrumentar un sistema distribuido.

Después vamos a seguir con el tracing distribuido, donde ya no miraremos solo agregados numéricos, sino recorridos concretos entre servicios.

Eso va a complementar perfectamente lo que estamos construyendo ahora.

---

## Cierre

Las métricas son una pieza fundamental de la observabilidad porque convierten el comportamiento del sistema en señales cuantitativas útiles para operación, diagnóstico y mejora.

Con Spring Boot Actuator y Micrometer, NovaMarket puede empezar a medir latencia, errores, throughput y otras variables clave para entender cómo se comportan sus servicios.

Esto no solo ayuda a detectar problemas. También ayuda a validar si la arquitectura está respondiendo como esperamos cuando agregamos seguridad, resiliencia y comunicación distribuida.

En la próxima clase vamos a pasar del plano agregado de las métricas al recorrido completo de una operación, introduciendo el tracing distribuido.
