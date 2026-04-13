---
title: "Observabilidad y soporte local con Docker"
description: "Cómo aprovechar Docker para ejecutar y diagnosticar localmente la observabilidad de NovaMarket, integrando trazas, logs y herramientas de soporte al sistema."
order: 46
module: "Módulo 11 · Docker y despliegue local completo"
level: "intermedio"
draft: false
---

# Observabilidad y soporte local con Docker

A medida que NovaMarket se vuelve una arquitectura más completa, aparece una necesidad muy clara:

**no solo hay que levantar el sistema, también hay que poder observarlo y diagnosticarlo.**

Hasta ahora vimos que Docker y Docker Compose ayudan a ejecutar:

- microservicios,
- bases de datos,
- infraestructura compartida,
- seguridad,
- y mensajería.

Pero una arquitectura distribuida no se vuelve verdaderamente útil si, cuando algo falla, nadie puede entender qué está pasando.

Por eso esta clase se enfoca en una idea esencial:

**usar Docker también como base del entorno local de observabilidad y soporte técnico.**

---

## Qué significa “soporte local” en este contexto

No estamos hablando de soporte al usuario final.  
Estamos hablando del soporte técnico del sistema durante desarrollo, prueba y diagnóstico.

En una arquitectura como NovaMarket, ese soporte incluye poder:

- ver logs,
- seguir trazas,
- revisar el estado de contenedores,
- observar si un servicio está levantado,
- entender por qué algo no conecta,
- y detectar en qué parte del flujo se rompe una operación.

Eso es muy distinto de simplemente “tener la aplicación corriendo”.

---

## Por qué este punto es tan importante en microservicios

En una aplicación única, seguir una operación suele ser más simple porque muchas cosas ocurren dentro del mismo proceso.

En microservicios, el flujo se reparte.

En NovaMarket, una simple creación de orden puede involucrar:

- el gateway,
- `order-service`,
- `inventory-service`,
- RabbitMQ,
- `notification-service`,
- y componentes de seguridad o configuración según el caso.

Eso significa que, si algo falla, el problema puede estar en muchos lugares distintos.

Por eso la observabilidad deja de ser un lujo.  
Pasa a ser parte básica del trabajo con arquitecturas distribuidas.

---

## Qué aporta Docker en esta dimensión

Docker no solo sirve para ejecutar componentes.

También ayuda a organizar y hacer visible el entorno técnico donde podemos inspeccionar el sistema.

Por ejemplo, con un stack bien montado, es posible tener localmente:

- servicios corriendo en contenedores separados,
- herramientas de trazas,
- interfaces de soporte de infraestructura,
- logs accesibles,
- y un punto relativamente estable desde el que observar el comportamiento del sistema.

Eso mejora muchísimo la experiencia de aprendizaje.

---

## Observabilidad local como prolongación del módulo anterior

En módulos anteriores del curso ya vimos:

- logs,
- métricas,
- trazas distribuidas,
- Micrometer,
- tracing,
- y log aggregation.

Esta clase no repite esos conceptos.  
Lo que hace es conectarlos con el entorno Docker del proyecto.

La idea es entender que la observabilidad no se queda en teoría ni en dependencias de código:  
también necesita una forma concreta de ejecutarse y usarse localmente.

---

## El lugar de Zipkin en NovaMarket

Dentro del diseño base del curso, **Zipkin** aparece como backend de trazas para seguir el recorrido de una request entre varios servicios.

Integrarlo al entorno Docker tiene mucho valor porque permite observar de manera más tangible el flujo central del proyecto.

Por ejemplo:

1. la request entra al gateway,
2. pasa a `order-service`,
3. se consulta a `inventory-service`,
4. se publica un evento,
5. `notification-service` procesa una parte del flujo.

Ver eso reflejado como traza ayuda muchísimo a entender la arquitectura distribuida.

---

## El lugar de los logs en el entorno local

Los logs siguen siendo una de las herramientas más directas para diagnosticar problemas.

Docker ayuda a trabajar con ellos de varias maneras:

- separando la salida por contenedor,
- mostrando qué servicio está fallando,
- haciendo visible si algo no inicia correctamente,
- y permitiendo observar mejor la interacción entre componentes.

En una arquitectura con varios servicios, esa separación por procesos y por contenedores se vuelve muy útil para investigar fallas.

---

## Qué tipo de problemas ayuda a detectar este enfoque

Tener un entorno de observabilidad y soporte local permite detectar mejor cosas como:

- un servicio que no levanta,
- un contenedor reiniciando constantemente,
- un problema de configuración,
- una dependencia no disponible,
- un error de red entre contenedores,
- un token mal propagado,
- una llamada que tarda demasiado,
- o una integración asincrónica que no completa como se esperaba.

Es decir, no se trata solo de “mirar dashboards”.  
Se trata de hacer visible el estado real del sistema.

---

## Qué valor pedagógico tiene este tema

A nivel de curso, esta clase es muy importante porque muestra una verdad que a veces se oculta demasiado:

en microservicios no alcanza con diseñar bien el flujo de negocio.  
También hay que poder seguirlo, inspeccionarlo y depurarlo.

Eso hace que NovaMarket se sienta más como una arquitectura profesional y menos como una serie de ejemplos desconectados.

Además, consolida una idea que atraviesa todo el roadmap:  
cada herramienta nueva tiene sentido porque el sistema la necesita.

---

## Qué relación tiene con el trabajo diario

En la práctica profesional, una enorme parte del tiempo no se va solo en escribir código nuevo.

También se va en:

- mirar logs,
- seguir trazas,
- comprobar que una dependencia esté viva,
- verificar conexiones,
- inspeccionar contenedores,
- y reconstruir el camino de una request problemática.

Por eso este tema no es un “extra”.  
Es una habilidad central para trabajar con sistemas distribuidos.

---

## Qué conviene evitar

Como en otras áreas, hay algunos errores típicos que conviene evitar.

### 1. Pensar que con tener logs alcanza
Los logs ayudan mucho, pero no siempre alcanzan para reconstruir flujos distribuidos.

### 2. Creer que la observabilidad es algo solo de producción
Tener un entorno local observable acelera muchísimo el aprendizaje y el diagnóstico.

### 3. Levantar herramientas sin entender para qué sirven
El stack técnico tiene que estar al servicio de preguntas concretas.

### 4. Ignorar el estado de la infraestructura
A veces el problema no está en el código del microservicio, sino en el entorno que lo rodea.

### 5. Perder de vista el flujo principal
Toda esta capa de soporte sigue teniendo como referencia el caso central de NovaMarket: crear una orden.

---

## Cómo se ve esto dentro del proyecto

En esta etapa del curso, NovaMarket ya puede pensarse como un stack local donde conviven:

- servicios de negocio,
- infraestructura compartida,
- seguridad,
- mensajería,
- y trazabilidad.

Eso permite ejecutar escenarios muy completos y, al mismo tiempo, tener más herramientas para responder preguntas como estas:

- ¿la orden realmente llegó a crearse?
- ¿la consulta a inventario se ejecutó?
- ¿el evento fue publicado?
- ¿la notificación se procesó?
- ¿qué servicio devolvió error?
- ¿dónde se cortó la cadena?

Ese tipo de visibilidad es una de las mayores ganancias del curso.

---

## Relación con el cierre del roadmap

Después de esta clase, NovaMarket ya queda muy cerca de un estado bastante maduro desde el punto de vista técnico:

- arquitectura definida,
- servicios distribuidos,
- seguridad,
- resiliencia,
- observabilidad,
- testing,
- Docker,
- Compose,
- e infraestructura compartida.

Eso prepara muy bien la transición hacia el módulo final, donde vamos a mirar el sistema con una lógica de checklist y de integración completa.

---

## Una idea práctica para llevarse

Levantar microservicios es importante, pero en una arquitectura distribuida eso no alcanza.

La diferencia entre un sistema que simplemente corre y un sistema que realmente puede trabajarse está, muchas veces, en la capacidad de observarlo y diagnosticarlo.

Docker aporta mucho valor cuando no solo sirve para ejecutar NovaMarket, sino también para volverlo visible, inspeccionable y más fácil de entender.

---

## Cierre

La observabilidad y el soporte local con Docker permiten que NovaMarket deje de ser solo una arquitectura desplegable y pase a ser una arquitectura también diagnosticable.

Integrar localmente trazas, logs y herramientas de soporte mejora mucho la comprensión del sistema, facilita el troubleshooting y acerca el curso a un entorno de trabajo mucho más realista.

En la próxima clase vamos a empezar el cierre del curso con una mirada de madurez técnica: **el checklist para microservicios listos para producción**.
