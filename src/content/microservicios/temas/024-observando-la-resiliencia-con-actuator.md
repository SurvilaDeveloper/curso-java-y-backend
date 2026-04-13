---
title: "Observando la resiliencia con Actuator"
description: "Cómo usar Spring Boot Actuator para inspeccionar salud, métricas y estado operativo de los mecanismos de resiliencia dentro de una arquitectura de microservicios."
order: 24
module: "Módulo 6 · Resiliencia y tolerancia a fallas"
level: "intermedio"
draft: false
---

# Observando la resiliencia con Actuator

En las clases anteriores incorporamos una idea central de cualquier sistema distribuido serio: los servicios no solo tienen que funcionar cuando todo sale bien, también tienen que comportarse de manera razonable cuando algo falla.

En NovaMarket ya vimos por qué aparecen timeouts, reintentos, degradación y circuit breakers cuando `order-service` depende de `inventory-service`. Pero hay una pregunta igual de importante:

**¿cómo sabemos qué está pasando realmente en tiempo de ejecución?**

Ahí entra Spring Boot Actuator.

Actuator no reemplaza a la resiliencia, pero sí nos da una forma de observar el estado del sistema, exponer información operativa y entender si un mecanismo defensivo está actuando como esperamos.

---

## Por qué no alcanza con “configurar y confiar”

Un error bastante común en cursos y proyectos iniciales es este:

1. se agrega un Circuit Breaker,
2. se configura un Retry,
3. la aplicación arranca,
4. y se asume que ya quedó “resiliente”.

Pero en un sistema real eso no alcanza.

También necesitamos responder preguntas como estas:

- ¿el servicio está sano o no?
- ¿el Circuit Breaker está cerrado, abierto o half-open?
- ¿cuántas veces se están ejecutando retries?
- ¿hay fallas constantes contra una dependencia?
- ¿la latencia está subiendo?
- ¿la degradación está ocurriendo en un punto específico?

Sin visibilidad, la resiliencia termina siendo una caja negra.

---

## Qué es Spring Boot Actuator

Spring Boot Actuator es un conjunto de endpoints y capacidades orientadas a la operación de aplicaciones.

Su función no es resolver lógica de negocio, sino exponer información útil para monitoreo, diagnóstico y administración técnica.

En el contexto de NovaMarket, Actuator nos permite mirar mejor cosas como:

- salud general de cada servicio,
- métricas de requests,
- disponibilidad de dependencias,
- estado del circuito de resiliencia,
- comportamiento técnico de la aplicación.

---

## Qué problema resuelve en NovaMarket

Pensemos en el flujo principal del curso:

**consultar catálogo → crear orden → validar stock → registrar orden → publicar evento → notificar**

Imaginemos este escenario:

- el usuario envía `POST /orders`,
- `order-service` intenta consultar `inventory-service`,
- `inventory-service` responde lento o falla,
- el Circuit Breaker empieza a activarse,
- algunos requests reintentan,
- otros terminan fallando.

Si no tenemos observabilidad técnica mínima, solo vamos a ver síntomas difusos:

- respuestas lentas,
- errores intermitentes,
- comportamiento aparentemente inconsistente.

Actuator ayuda a convertir esos síntomas en señales más concretas.

---

## Dependencia base

Una base típica para habilitar Actuator es agregar la dependencia correspondiente al proyecto.

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

A partir de ahí, Spring Boot puede exponer endpoints operativos como:

- `/actuator/health`
- `/actuator/info`
- `/actuator/metrics`
- `/actuator/env`
- `/actuator/beans`
- `/actuator/circuitbreakers` en ciertos escenarios de integración

No todos quedan expuestos automáticamente. Normalmente se decide cuáles publicar.

---

## Exposición de endpoints

Un ejemplo simple de configuración puede ser este:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: always
```

Esto indica que queremos exponer ciertos endpoints por HTTP para uso operativo o de desarrollo.

En entornos reales, esa exposición debe pensarse con cuidado.

No todo lo que resulta útil para diagnosticar debe quedar públicamente accesible. Muchas veces se limita a redes internas, autenticación administrativa o herramientas de monitoreo.

---

## El endpoint de health

Uno de los endpoints más importantes es:

`/actuator/health`

Su objetivo es responder una pregunta simple pero fundamental:

**¿la aplicación está sana?**

Esa pregunta parece obvia, pero en sistemas distribuidos no siempre lo es.

Una aplicación puede:

- estar arrancada, pero no poder conectarse a su base,
- responder HTTP, pero no tener disponibilidad real,
- seguir viva, pero con alguna dependencia crítica caída,
- estar funcional para algunas operaciones y rota para otras.

Por eso el health check es una pieza central para operación y despliegue.

---

## Salud técnica vs salud útil

Acá conviene distinguir dos ideas.

### Salud técnica
Responde algo como:

- el proceso está corriendo,
- el runtime está activo,
- la aplicación responde.

### Salud útil
Responde algo más cercano a:

- el servicio realmente puede cumplir su responsabilidad,
- sus dependencias críticas están disponibles,
- tiene conectividad con lo necesario para operar.

En NovaMarket, por ejemplo, `order-service` podría estar técnicamente levantado pero no ser realmente útil si no puede acceder a su base de datos o si su propia configuración crítica es inválida.

---

## Indicadores de salud

Actuator puede componer la salud a partir de distintos indicadores.

Ejemplos comunes:

- base de datos,
- espacio en disco,
- broker,
- componentes personalizados,
- servicios externos en algunos diseños.

También podemos crear indicadores propios cuando el estado técnico estándar no alcanza.

Por ejemplo, en NovaMarket podríamos querer un chequeo específico que detecte si `order-service` puede operar sobre ciertos recursos mínimos necesarios.

---

## Health checks y resiliencia

El vínculo con resiliencia es directo.

Cuando agregamos mecanismos como Retry o Circuit Breaker, es importante no pensar solo en “si el request se recupera”, sino también en:

- si el sistema está entrando en degradación,
- si la dependencia está inestable,
- si estamos sosteniendo errores transitorios o una caída más prolongada,
- si conviene seguir intentando o cortar temporalmente.

Actuator no decide por nosotros, pero aporta visibilidad para entender el comportamiento del sistema bajo falla.

---

## Métricas técnicas básicas

Otro endpoint importante es:

`/actuator/metrics`

Este endpoint permite consultar métricas registradas por la aplicación.

En una arquitectura como NovaMarket, eso puede ayudarnos a responder preguntas como:

- cuántas requests está recibiendo un servicio,
- cuánto tardan,
- cuántas terminan con error,
- cómo evoluciona la latencia,
- qué endpoints están sufriendo más carga.

Aunque más adelante vamos a dedicar una clase entera a métricas con Micrometer, ya desde acá conviene entender la idea: **resiliencia sin medición es muy difícil de operar bien**.

---

## Ver el estado del Circuit Breaker

Cuando integramos Resilience4j, una de las cosas más valiosas es poder observar el estado del circuito.

Porque una vez que el Circuit Breaker existe, el comportamiento del sistema ya no depende solo del servicio remoto, sino también del estado interno del mecanismo defensivo.

Queremos poder saber si el circuito está:

- `CLOSED`
- `OPEN`
- `HALF_OPEN`

Eso nos permite distinguir entre situaciones distintas.

### Ejemplo
Si `inventory-service` empieza a fallar repetidamente:

- al principio `order-service` sigue intentando,
- luego el circuito puede abrirse,
- mientras está abierto, ciertos requests fallan rápido,
- más tarde se prueban llamadas controladas en `HALF_OPEN`.

Sin observabilidad, ese comportamiento puede parecer errático.

Con visibilidad, se vuelve entendible.

---

## Qué mirar cuando algo falla

Cuando una operación de NovaMarket falla, no conviene empezar revisando código al azar.

Un camino operativo mejor sería mirar:

1. **health** del servicio afectado,
2. **métricas** de requests y errores,
3. estado del **circuit breaker**,
4. logs relevantes,
5. comportamiento de dependencias críticas.

Ese enfoque evita debugging a ciegas.

---

## Ejemplo aplicado a NovaMarket

Supongamos esta situación:

- el usuario intenta crear una orden,
- `order-service` responde con error,
- algunos intentos anteriores habían tardado mucho,
- `inventory-service` estuvo degradado.

Con Actuator podríamos analizar algo como esto:

### En `order-service`
- `health` general del servicio,
- métricas de requests a `/orders`,
- evidencia de latencia creciente,
- estado del Circuit Breaker que protege la consulta a inventario.

### En `inventory-service`
- health del servicio,
- métricas de error o demora,
- capacidad de responder normalmente.

Esto transforma una falla confusa en una secuencia observable.

---

## Por qué esto también importa para Docker y despliegue

Más adelante vamos a levantar todo NovaMarket con Docker Compose.

En ese contexto, los endpoints de Actuator también son valiosos para:

- verificar si un contenedor está operativo,
- diferenciar “el proceso arrancó” de “el servicio está listo”,
- usar health checks más útiles,
- entender si una dependencia demoró en inicializar.

Esto es especialmente importante en arquitecturas donde varios componentes arrancan juntos.

---

## Qué no conviene hacer

Hay varios errores típicos alrededor de Actuator.

### 1. Exponer todo sin criterio
Porque puede filtrar demasiada información técnica.

### 2. Confiar solo en `UP` o `DOWN`
Porque una realidad distribuida suele ser más matizada.

### 3. Usarlo solo cuando ya hay problemas
Conviene integrarlo como parte normal de la arquitectura, no como parche de último momento.

### 4. Creer que reemplaza logs, métricas y trazas
Actuator ayuda mucho, pero no sustituye una estrategia completa de observabilidad.

---

## Qué lugar ocupa esta clase en el curso

Hasta acá venimos construyendo una idea importante:

- los microservicios fallan de formas parciales,
- por eso necesitamos defensas como Retry y Circuit Breaker,
- pero además necesitamos ver cómo se comportan esas defensas.

Actuator es uno de los primeros pasos serios para que NovaMarket deje de ser solo una aplicación funcional y empiece a ser un sistema operable.

---

## Cierre

La resiliencia no termina cuando configuramos un mecanismo de protección. También necesitamos observar cómo responde el sistema bajo presión, degradación y falla.

Spring Boot Actuator nos da una base muy útil para eso, exponiendo health, métricas e información operativa que permite entender mejor el estado real de nuestros servicios.

En NovaMarket, esto resulta especialmente importante para seguir el comportamiento de `order-service` cuando depende de `inventory-service` y empiezan a aparecer errores distribuidos.

En la próxima clase vamos a abrir formalmente el bloque de observabilidad para entender cómo se combinan **logs, métricas y trazas** dentro de una arquitectura de microservicios.
