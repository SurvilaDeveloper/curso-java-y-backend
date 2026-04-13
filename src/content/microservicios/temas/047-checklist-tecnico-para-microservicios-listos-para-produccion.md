---
title: "Checklist técnico para microservicios listos para producción"
description: "Qué aspectos técnicos conviene revisar antes de considerar una arquitectura de microservicios como razonablemente preparada para producción, usando NovaMarket como referencia integradora."
order: 47
module: "Módulo 12 · Cierre y proyecto integrador"
level: "avanzado"
draft: false
---

# Checklist técnico para microservicios listos para producción

Llegar al final de un curso de microservicios no significa solamente haber visto muchas herramientas.

La pregunta verdaderamente importante es otra:

**¿qué tendría que revisar antes de considerar que una arquitectura como NovaMarket está razonablemente preparada para ejecutarse en un entorno serio?**

Ese es el objetivo de esta clase.

No vamos a pensar la producción como un sello mágico que se obtiene por haber usado Spring Cloud, Docker, RabbitMQ o Keycloak.  
Vamos a pensarla como una suma de decisiones técnicas que conviene revisar con criterio.

En otras palabras:

**más que una meta absoluta, producción es una conversación de madurez técnica.**

---

## Por qué hace falta un checklist

En microservicios es muy fácil quedar atrapado en la ilusión de avance.

El sistema puede:

- compilar,
- levantar,
- responder algunas requests,
- publicar mensajes,
- e incluso verse muy bien en una demo.

Pero eso no implica automáticamente que esté listo para un uso más serio.

En una arquitectura distribuida, pequeños descuidos pueden generar problemas grandes:

- configuraciones rígidas,
- endpoints expuestos,
- reintentos mal pensados,
- poca visibilidad,
- errores no controlados,
- o acoplamientos ocultos.

El checklist ayuda a hacer una pausa y mirar el sistema con más criterio.

---

## 1. Configuración externa y gestión de entornos

Una primera pregunta clave es esta:

**¿el sistema depende demasiado de configuración embebida o difícil de cambiar?**

En NovaMarket, esto nos obliga a revisar:

- si la configuración está externalizada,
- si los perfiles están bien pensados,
- si los servicios pueden cambiar parámetros sin tocar el binario,
- y si la distinción entre desarrollo, prueba y producción está razonablemente clara.

Una arquitectura que no puede configurarse bien difícilmente sea cómoda de operar.

---

## 2. Descubrimiento y conectividad entre servicios

También conviene revisar cómo se conectan los componentes.

Preguntas útiles:

- ¿los servicios se descubren de forma coherente?
- ¿las dependencias entre servicios están claras?
- ¿el gateway enruta correctamente?
- ¿las URLs fijas innecesarias fueron evitadas cuando tenía sentido hacerlo?

En NovaMarket, este punto conecta con `discovery-server`, `api-gateway` y la forma en que los servicios se encuentran entre sí.

---

## 3. Seguridad real y no solo simbólica

Una arquitectura no queda segura por haber agregado una dependencia de seguridad.

Conviene revisar:

- qué endpoints deberían ser públicos y cuáles no,
- si los tokens se validan bien,
- si la propagación de identidad tiene sentido,
- si existen rutas internas expuestas por accidente,
- y si roles o scopes se están usando con criterio.

En NovaMarket, el uso de Keycloak, JWT y resource servers debería haber mejorado esto.  
Pero el checklist obliga a preguntarse si la seguridad quedó realmente coherente.

---

## 4. Manejo de errores y respuestas consistentes

En sistemas distribuidos, los errores no desaparecen.  
Solo se reparten mejor o peor.

Por eso conviene revisar:

- si los errores de negocio son distinguibles de los errores técnicos,
- si los endpoints devuelven respuestas razonables,
- si hay mensajes útiles para diagnóstico,
- y si las fallas entre servicios no se traducen en comportamientos caóticos.

Esto es importante porque la operación real del sistema va a estar llena de casos no ideales.

---

## 5. Resiliencia y comportamiento ante fallas

Otro bloque crítico es la resiliencia.

Preguntas útiles:

- ¿los timeouts están pensados o se dejaron librados al azar?
- ¿los retries tienen criterio o pueden empeorar un problema?
- ¿el circuit breaker protege de verdad o solo está “presente”?
- ¿hay políticas claras ante dependencia caída o lenta?

En NovaMarket, este punto es especialmente relevante en la interacción entre `order-service` e `inventory-service`.

La madurez no está en tener la palabra “resilience” en el proyecto.  
Está en saber cómo se comporta el sistema cuando algo falla.

---

## 6. Observabilidad suficiente

Una arquitectura distribuida lista para un entorno serio necesita ser observable.

Eso implica revisar:

- si hay logs útiles,
- si las métricas importantes están expuestas,
- si las trazas permiten seguir el flujo entre servicios,
- y si el sistema es diagnosticable cuando algo sale mal.

En NovaMarket, este punto conecta con:

- Actuator,
- Micrometer,
- tracing,
- Zipkin,
- y el soporte local con Docker.

Si nadie puede entender qué pasó, el sistema es mucho más frágil de lo que parece.

---

## 7. Mensajería confiable

Si el sistema usa mensajería, conviene revisar:

- si hay idempotencia donde corresponde,
- si existen estrategias de reintento razonables,
- si los mensajes fallidos tienen tratamiento,
- si los consumidores toleran duplicados,
- y si el flujo asincrónico puede seguirse con suficiente claridad.

En NovaMarket, este bloque impacta especialmente en los eventos asociados a la creación de órdenes y en `notification-service`.

---

## 8. Datos distribuidos y consistencia

Otro punto importante:

**¿el sistema entiende realmente su propia consistencia?**

En microservicios conviene revisar:

- si cada servicio tiene una responsabilidad clara sobre sus datos,
- si los estados intermedios están modelados,
- si la consistencia eventual fue asumida con conciencia,
- si el outbox y las compensaciones tienen sentido donde aparezcan,
- y si no se intentó simular un monolito distribuido a fuerza de acoplamiento oculto.

En NovaMarket, esta revisión es clave para el flujo de órdenes, inventario y notificaciones.

---

## 9. Testing suficiente para evolucionar con confianza

Tampoco alcanza con que “algo haya sido probado alguna vez”.

Una pregunta más útil es:

**¿el sistema tiene la cobertura adecuada en sus riesgos más importantes?**

Conviene revisar:

- pruebas unitarias donde aporten valor,
- integración dentro de servicios,
- validación de clientes Feign,
- pruebas del gateway y seguridad,
- y escenarios más integrados cuando el flujo lo justifique.

Sin eso, la arquitectura puede quedar demasiado frágil ante cambios.

---

## 10. Containerización y entorno reproducible

En una arquitectura moderna, también importa cómo se levanta el sistema.

Hay preguntas concretas que conviene hacerse:

- ¿los servicios están dockerizados de forma razonable?
- ¿la configuración puede inyectarse desde fuera?
- ¿existe un entorno reproducible con Compose?
- ¿la infraestructura compartida puede levantarse de forma coherente?

NovaMarket ya trabajó bastante este punto, pero el checklist ayuda a verificar si quedó realmente integrado y no solo resuelto de forma parcial.

---

## 11. Claridad del dominio y del flujo principal

No todo es técnica transversal.

También conviene revisar si el sistema sigue siendo entendible desde el negocio.

En NovaMarket, el flujo central es:

**consultar catálogo → crear orden → validar stock → registrar orden → publicar evento → notificar**

Una buena arquitectura no debería hacer que ese flujo se vuelva opaco o arbitrariamente complejo.

Si las decisiones técnicas hacen irreconocible el proceso de negocio, algo se perdió en el camino.

---

## 12. Operabilidad y capacidad de diagnóstico

Además de observar, hay que poder operar.

Eso incluye cosas como:

- entender en qué estado está cada componente,
- reconocer rápidamente una dependencia caída,
- detectar errores de arranque,
- revisar contenedores,
- y reconstruir el recorrido de una operación problemática.

Este punto a veces se subestima, pero en la práctica pesa muchísimo.

---

## Qué no significa este checklist

Es importante aclararlo:  
este checklist no convierte automáticamente al proyecto en producción real.

Tampoco significa que exista una respuesta binaria y definitiva: “listo” o “no listo”.

Lo que sí hace es ayudar a mirar la arquitectura con una madurez distinta.

Pasa de la lógica de:

- “anda en mi máquina”

a una lógica más útil:

- “entiendo qué partes están sólidas, cuáles son frágiles y qué faltaría reforzar”.

Eso ya es un salto enorme.

---

## Cómo se aplica a NovaMarket

En este punto del curso, NovaMarket ya debería poder evaluarse como un sistema que contiene:

- servicios de negocio,
- configuración centralizada,
- discovery,
- gateway,
- seguridad,
- resiliencia,
- observabilidad,
- mensajería,
- testing,
- y Docker Compose.

Por eso esta clase funciona como una síntesis técnica muy potente.

No se trata de agregar una herramienta nueva.  
Se trata de aprender a mirar el sistema completo.

---

## Qué valor didáctico tiene este cierre

Este checklist ayuda a consolidar algo muy importante:

un curso serio de microservicios no debería dejar la sensación de que basta con aprender nombres de tecnologías.

Debería dejar una capacidad mejorada para hacerse preguntas correctas sobre una arquitectura distribuida.

Esa es la verdadera ganancia de este cierre.

---

## Una idea práctica para llevarse

Antes de pensar que una arquitectura está “lista”, conviene dejar de preguntarse:

**“¿Qué tecnologías usé?”**

y empezar a preguntarse:

**“¿Qué riesgos cubrí, qué comportamientos entendí y qué tan operable, segura y observable es esta arquitectura en la práctica?”**

Ese cambio de enfoque vale muchísimo.

---

## Cierre

Pensar microservicios listos para producción no consiste en aplicar un sello, sino en revisar con criterio un conjunto de dimensiones técnicas que sostienen la arquitectura.

En NovaMarket, ese recorrido incluye configuración, conectividad, seguridad, resiliencia, observabilidad, mensajería, testing, consistencia y entorno reproducible.

Con esta clase dejamos preparada la mirada final del curso.  
En la próxima vamos a cerrar el roadmap integrando todo en el **proyecto final de NovaMarket**, tomando el sistema como una arquitectura completa y coherente de punta a punta.
