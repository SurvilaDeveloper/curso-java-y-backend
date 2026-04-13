---
title: "Ambientes de prueba con Docker Compose o Testcontainers"
description: "Cómo acercar las pruebas de microservicios a un entorno más realista usando contenedores, y cuándo conviene pensar en Docker Compose o Testcontainers dentro de NovaMarket."
order: 42
module: "Módulo 10 · Testing en microservicios"
level: "intermedio"
draft: false
---

# Ambientes de prueba con Docker Compose o Testcontainers

A medida que un sistema distribuido crece, llega un punto en el que probar componentes aislados ya no alcanza para ganar confianza real.

En **NovaMarket**, por ejemplo, hay flujos que dependen de varias piezas a la vez:

- `api-gateway`,
- `order-service`,
- `inventory-service`,
- seguridad,
- base de datos,
- y mensajería.

En ese contexto, una pregunta importante aparece de forma natural:

**¿cómo probamos algo que se parezca más al entorno real sin volver el testing inmanejable?**

En esta clase vamos a ver el valor de los ambientes de prueba basados en contenedores y por qué herramientas como **Docker Compose** o **Testcontainers** pueden acercar mucho las pruebas a una ejecución más realista.

---

## Por qué aparece esta necesidad

Hasta ahora vimos distintos niveles de testing:

- pruebas unitarias,
- integración dentro de un servicio,
- validación de clientes Feign,
- testing del gateway y seguridad.

Todo eso sigue siendo importante.

Pero hay problemas que recién aparecen cuando el sistema se ejecuta con dependencias más reales, por ejemplo:

- una base de datos levantada de verdad,
- un broker real,
- configuración externa,
- servicios corriendo en procesos separados,
- puertos, redes y tiempos de inicialización.

Ahí es donde los ambientes basados en contenedores empiezan a aportar mucho valor.

---

## Qué riesgo estamos tratando de reducir

Este tipo de pruebas ayuda a detectar problemas como:

- diferencias entre el entorno local y el entorno de ejecución real,
- configuración incorrecta de conexiones,
- dependencia de recursos no disponibles,
- errores de infraestructura que no aparecen con mocks,
- fallas de integración que solo emergen con componentes reales,
- y comportamientos condicionados por el arranque del sistema completo.

En otras palabras:

**no reemplazan las pruebas más chicas, pero ayudan a validar el ecosistema.**

---

## Qué significa “más realista”

Acercar una prueba a la realidad no quiere decir necesariamente replicar producción al 100%.

Significa, más modestamente, ejecutar una parte del sistema en condiciones más parecidas a su forma real de funcionamiento.

Por ejemplo, en NovaMarket eso puede implicar probar un flujo con:

- `order-service`,
- una base real o parecida,
- `inventory-service`,
- y quizás RabbitMQ o un componente de seguridad según el alcance del escenario.

Eso ya cambia muchísimo respecto de una prueba donde todo está simulado.

---

## Qué lugar ocupa Docker Compose

**Docker Compose** es muy útil cuando queremos levantar varios componentes juntos como un entorno coordinado.

En el contexto del curso, puede servir para:

- levantar varios microservicios,
- sumar bases de datos,
- agregar RabbitMQ,
- incluir Keycloak,
- o disponer de una topología parecida a la del sistema completo.

Su gran ventaja didáctica es que ayuda a pensar el sistema como conjunto.

En NovaMarket, eso permite ejecutar escenarios donde ya no se prueba una pieza aislada, sino una porción importante de la arquitectura.

---

## Qué lugar ocupa Testcontainers

**Testcontainers** apunta a otro tipo de necesidad.

Su valor principal está en permitir que las pruebas levanten dependencias efímeras controladas desde el propio contexto de test.

Eso resulta muy útil para:

- bases de datos temporales,
- brokers,
- servicios auxiliares,
- y entornos reproducibles por prueba o por suite.

La idea no es solo “usar Docker”, sino integrar dependencias reales dentro del flujo de ejecución de las pruebas de manera automatizable.

---

## No son enemigos entre sí

Conviene evitar pensar estas herramientas como opciones mutuamente excluyentes.

De forma muy simplificada:

- **Docker Compose** resulta muy natural para levantar entornos completos o semicompletos,
- **Testcontainers** suele ser muy conveniente para pruebas automatizadas con dependencias reales controladas desde el código.

Ambos enfoques pueden convivir dentro de una estrategia más amplia.

---

## Cómo se aplica esto a NovaMarket

Pensemos en el flujo central del curso:

**consultar catálogo → crear orden → validar stock → registrar orden → publicar evento → notificar**

Ese flujo puede probarse en distintos niveles.

En un entorno más realista, podríamos querer validar cosas como:

- que `order-service` realmente se conecte a su base,
- que la llamada a `inventory-service` ocurra con una dependencia levantada,
- que RabbitMQ procese un evento de forma observable,
- que la configuración externa sea tomada correctamente,
- o que el gateway enrute tráfico entre servicios corriendo de verdad.

Ese es el tipo de escenario que justifica este módulo.

---

## Cuándo conviene pensar en Docker Compose

Compose suele ser especialmente útil cuando queremos:

- arrancar varios servicios juntos,
- inspeccionar el sistema como entorno integrado,
- ejecutar validaciones manuales o semiautomáticas,
- reproducir el “stack” local de trabajo,
- o dejar un entorno didáctico fácil de levantar para el alumno.

En un curso práctico como este, Compose tiene además una ventaja muy fuerte:

**hace visible la arquitectura.**

El alumno ve que NovaMarket no es solo código Java, sino también un conjunto de procesos, redes y dependencias.

---

## Cuándo conviene pensar en Testcontainers

Testcontainers suele volverse muy atractivo cuando queremos que una prueba automatizada tenga acceso a dependencias reales sin depender de una instalación fija en la máquina del desarrollador.

Eso ayuda mucho a reducir problemas como:

- “en mi máquina funciona”,
- diferencias de versión,
- dependencias manuales mal levantadas,
- o pruebas que requieren preparación externa difícil de repetir.

Dentro del curso, este enfoque sirve muy bien para hablar de reproducibilidad y automatización.

---

## Qué cosas no conviene hacer

Como en otros temas, hay algunos extremos que conviene evitar.

### Error 1: querer hacer todo con entornos pesados
No todas las pruebas necesitan levantar medio sistema.

### Error 2: seguir confiando solo en mocks
Eso deja sin validar demasiadas piezas reales.

### Error 3: volver el pipeline de pruebas lentísimo
Más realismo no siempre equivale a mejor diseño de pruebas.

### Error 4: usar contenedores sin un objetivo claro
Levantar infraestructura “porque sí” no aporta demasiado si no sabemos qué riesgo queremos cubrir.

---

## Qué tipo de escenarios son buenos candidatos

En NovaMarket, algunos buenos candidatos para este tipo de pruebas serían:

- creación de orden con persistencia real,
- validación de integración con inventario,
- publicación y consumo de eventos en RabbitMQ,
- acceso autenticado a través del gateway,
- y verificación de configuración externa en un entorno más completo.

Estos escenarios tienen suficiente valor funcional como para justificar un entorno más cercano a la realidad.

---

## Qué gana el curso con este enfoque

Este tema es importante porque evita que el proyecto práctico quede reducido a una suma de demos aisladas.

Con ambientes de prueba más realistas, NovaMarket empieza a sentirse más como un sistema profesional:

- con dependencias vivas,
- con infraestructura concreta,
- con integración observable,
- y con una forma reproducible de verificar comportamientos importantes.

Eso mejora mucho el valor pedagógico del curso.

---

## Relación con el siguiente módulo

Además, esta clase cumple otra función: prepara muy bien la transición hacia el bloque de Docker.

Hasta ahora venimos trabajando con la arquitectura distribuida desde el lado del diseño, integración, resiliencia y testing.  
Ahora vamos a empezar a verla también desde el lado operativo.

Tiene mucho sentido que el cierre del módulo de testing conecte con el inicio del módulo de contenedores.

---

## Una idea práctica para llevarse

Cuando una arquitectura distribuida ya depende de bases, brokers, gateway y varios servicios, la pregunta no es solo:

**“¿Puedo probar la lógica?”**

La pregunta más útil es:

**“¿Puedo verificar el sistema con dependencias suficientemente reales como para confiar en que el entorno no me va a sorprender?”**

Ahí es donde Docker Compose y Testcontainers empiezan a tener mucho valor.

---

## Cierre

Los ambientes de prueba con contenedores ayudan a acercar el testing de microservicios a escenarios más realistas sin obligarnos a saltar directamente a producción.

En NovaMarket, esto permite validar flujos importantes con dependencias reales o casi reales, reducir diferencias entre entornos y reforzar la confianza en integraciones críticas.

Con esta clase cerramos el módulo de testing.  
En la próxima vamos a entrar en una pieza central del despliegue local del sistema: **cómo dockerizar microservicios**.
