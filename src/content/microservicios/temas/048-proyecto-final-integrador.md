---
title: "Proyecto final integrador"
description: "Cierre del curso integrando NovaMarket como una arquitectura completa de microservicios, reuniendo configuración, discovery, gateway, seguridad, resiliencia, observabilidad, mensajería y Docker Compose."
order: 48
module: "Módulo 12 · Cierre y proyecto integrador"
level: "avanzado"
draft: false
---

# Proyecto final integrador

Llegamos al cierre del curso.

A esta altura, **NovaMarket** ya no es solo un ejemplo conceptual ni una colección de microservicios aislados.  
Es una arquitectura distribuida que fue creciendo de forma progresiva a lo largo de todo el roadmap, incorporando piezas que aparecieron por necesidad del sistema y no como herramientas sueltas.

El objetivo de esta clase final es reunir todo ese recorrido en una visión integradora.

No vamos a pensar el proyecto como una “demo final”, sino como una **arquitectura coherente de punta a punta**, capaz de mostrar cómo se conectan entre sí las decisiones que fuimos construyendo durante el curso.

---

## Qué representa NovaMarket al final del recorrido

NovaMarket es una plataforma simple de pedidos cuya función central es permitir que un usuario autenticado consulte productos y cree una orden de compra.

Sin embargo, su valor didáctico no está solamente en ese objetivo funcional.  
Su verdadero valor está en que permite reunir, dentro de un mismo sistema, problemas y soluciones típicas de una arquitectura distribuida moderna.

A esta altura del curso, NovaMarket integra:

- configuración centralizada,
- service discovery,
- gateway,
- seguridad distribuida,
- invocaciones REST entre servicios,
- resiliencia,
- observabilidad,
- mensajería asincrónica,
- testing,
- y ejecución completa con Docker Compose.

Eso lo convierte en una muy buena columna vertebral para un curso práctico de microservicios.

---

## El flujo principal del sistema

Durante todo el curso trabajamos con un flujo funcional central:

**consultar catálogo → crear orden → validar stock → registrar orden → publicar evento → notificar**

Ese flujo fue la guía pedagógica del roadmap.

Gracias a él pudimos justificar:

- por qué apareció `catalog-service`,
- por qué `order-service` necesita consultar a `inventory-service`,
- por qué el gateway se vuelve necesario,
- por qué la seguridad deja de ser opcional,
- por qué la resiliencia importa,
- por qué la observabilidad resulta crítica,
- y por qué la mensajería asincrónica tiene sentido.

Una de las ideas más importantes del curso es justamente esta:

**las herramientas tuvieron sentido porque el flujo de negocio las necesitó.**

---

## Arquitectura final de referencia

En su versión final, NovaMarket puede pensarse con los siguientes componentes principales:

### Servicios de negocio
- `catalog-service`
- `inventory-service`
- `order-service`
- `notification-service`

### Infraestructura transversal
- `config-server`
- `discovery-server`
- `api-gateway`

### Infraestructura complementaria
- `Keycloak`
- `RabbitMQ`
- `Zipkin`
- bases de datos por servicio
- Docker Compose como entorno integrador

Esta arquitectura no pretende ser gigantesca.  
Pretende ser lo suficientemente realista como para enseñar problemas auténticos sin volverse innecesariamente inmanejable.

---

## Qué rol cumple cada pieza en el resultado final

### `catalog-service`
Expone los productos del sistema y sirve como punto de entrada funcional simple para el dominio.

### `inventory-service`
Administra disponibilidad y permite validar stock antes de crear una orden.

### `order-service`
Orquesta el caso de uso principal y concentra buena parte del valor de negocio del sistema.

### `notification-service`
Consume eventos y muestra cómo desacoplar partes del flujo mediante mensajería.

### `config-server`
Centraliza configuración y ayuda a separar binario de entorno.

### `discovery-server`
Permite registro y descubrimiento de servicios en una arquitectura que ya no depende solo de URLs rígidas.

### `api-gateway`
Centraliza el acceso externo, el ruteo y parte de la lógica transversal.

### `Keycloak`
Introduce autenticación y autorización más realistas.

### `RabbitMQ`
Permite trabajar con integración asincrónica y eventos.

### `Zipkin`
Vuelve visible el recorrido distribuido de las requests.

---

## Qué demuestra este proyecto final

NovaMarket no intenta demostrar únicamente que “los microservicios funcionan”.

Lo que demuestra es algo más valioso:

### 1. Que una arquitectura distribuida necesita contexto
No alcanza con dividir una aplicación en varias partes.

### 2. Que cada capacidad técnica aparece por una necesidad concreta
Config, gateway, seguridad, resiliencia y observabilidad no fueron adornos.

### 3. Que la complejidad distribuida es real
Aparecen fallas parciales, asincronía, necesidad de diagnóstico y decisiones de consistencia.

### 4. Que el sistema debe ser operable además de funcional
Tiene que poder levantarse, observarse, probarse y entenderse.

---

## Cómo se integra todo en el flujo principal

Pensemos el caso de uso final como una secuencia arquitectónica completa.

### Paso 1 · El usuario accede al sistema
El ingreso ocurre a través de `api-gateway`, que funciona como punto de entrada unificado.

### Paso 2 · La identidad se valida
La seguridad se apoya en `Keycloak`, y el gateway participa en la protección del acceso.

### Paso 3 · El usuario consulta el catálogo
`catalog-service` responde la información de productos.

### Paso 4 · El usuario crea una orden
La request llega a `order-service`.

### Paso 5 · `order-service` valida stock
La validación se realiza consumiendo `inventory-service`, idealmente a través de discovery y cliente declarativo.

### Paso 6 · Se registra la orden
`order-service` persiste la información correspondiente.

### Paso 7 · Se publica un evento
El sistema comunica la creación de la orden mediante RabbitMQ.

### Paso 8 · `notification-service` reacciona
Se desacopla el procesamiento posterior de la operación principal.

### Paso 9 · El recorrido completo se observa
Logs, métricas y trazas permiten seguir la operación de punta a punta.

Esa secuencia resume de forma muy fiel el espíritu del curso.

---

## Qué aprendizajes técnicos deja el proyecto

### Configuración centralizada
El proyecto deja claro que un sistema distribuido no debería depender de configuración dispersa y rígida.

### Discovery y balanceo
Permite entender que las ubicaciones físicas de los servicios no deberían ser el centro del diseño.

### Gateway y seguridad
Muestra que el acceso a la arquitectura necesita una capa bien pensada y protegida.

### Resiliencia
Hace visible que una llamada remota puede fallar y que esa falla tiene que ser manejada con criterio.

### Observabilidad
Enseña que no alcanza con que el sistema funcione; también tiene que poder explicarse cuando algo falla.

### Mensajería asincrónica
Muestra una forma concreta de desacoplar partes del negocio.

### Datos distribuidos
Introduce preguntas reales sobre consistencia, idempotencia y propagación de estados.

### Docker y Compose
Permite ejecutar el ecosistema como sistema y no solo como código fuente.

---

## Qué se espera de un proyecto final bien construido

Un buen proyecto final de este curso no debería buscar solamente “meter todo”.

Debería mostrar, con claridad, que la arquitectura:

- tiene un caso de uso reconocible,
- distribuye responsabilidades de manera razonable,
- integra servicios con coherencia,
- aplica seguridad donde corresponde,
- contempla fallas,
- permite diagnóstico,
- y puede levantarse de forma reproducible.

Dicho de otra forma:

**no se trata de acumular piezas, sino de que esas piezas formen una arquitectura entendible.**

---

## Criterios para evaluar la calidad del resultado

Si quisiéramos mirar NovaMarket como proyecto final, podríamos evaluarlo con preguntas como estas:

### Sobre diseño
- ¿cada servicio tiene una responsabilidad clara?
- ¿el flujo principal se entiende?

### Sobre integración
- ¿los servicios se comunican de manera razonable?
- ¿el gateway refleja bien la topología externa?

### Sobre seguridad
- ¿las rutas protegidas están bien delimitadas?
- ¿la identidad se valida y propaga con criterio?

### Sobre resiliencia
- ¿hay una respuesta sensata cuando falla una dependencia?

### Sobre observabilidad
- ¿se puede seguir una request a través del sistema?

### Sobre asincronía
- ¿los eventos están bien ubicados dentro del flujo?

### Sobre entorno
- ¿el proyecto puede levantarse como sistema completo?

Estas preguntas muestran una madurez mucho mayor que simplemente revisar si “la app arranca”.

---

## Qué valor práctico tiene este cierre

Este proyecto final sirve para cerrar el curso con una idea muy valiosa:

trabajar con microservicios no consiste en aprender herramientas por separado, sino en construir una arquitectura donde esas herramientas tengan un papel claro dentro de un sistema realista.

En ese sentido, NovaMarket funciona como una síntesis muy útil porque obliga a juntar:

- diseño,
- integración,
- seguridad,
- operación,
- observabilidad,
- y ejecución reproducible.

Eso deja una experiencia de aprendizaje mucho más fuerte.

---

## Qué se podría extender después del curso

Aunque el roadmap termina acá, NovaMarket deja una base muy buena para seguir creciendo.

Por ejemplo, podrían agregarse después:

- `payment-service`,
- `shipping-service`,
- sagas más completas,
- outbox real en producción,
- dashboards de métricas más avanzados,
- auditoría,
- rate limiting más explícito,
- despliegue en Kubernetes,
- o pipelines de CI/CD.

Lo importante es que esas extensiones ya no caerían en un sistema improvisado.  
Caerían sobre una base arquitectónica coherente.

---

## Qué cambio de mentalidad debería quedar después del curso

Hay una idea que conviene llevarse como cierre de fondo.

Antes de recorrer un curso así, alguien podría pensar en microservicios como:

- varios proyectos,
- varias APIs,
- varias tecnologías conectadas.

Después de recorrer NovaMarket de punta a punta, la mirada debería ser más madura:

**microservicios es una forma de construir y operar sistemas distribuidos donde diseño, infraestructura, seguridad, integración, resiliencia y observabilidad forman parte del mismo problema.**

Ese cambio de enfoque vale muchísimo más que memorizar dependencias o configuraciones.

---

## Una idea práctica para llevarse

Si este curso dejó algo valioso, no debería ser solo “sé usar Spring Cloud”.

Debería ser algo más potente:

**sé mirar una arquitectura distribuida como un sistema completo, entender por qué aparecen ciertos problemas y reconocer qué tipo de herramientas tienen sentido para resolverlos.**

Ese es el mayor aprendizaje que NovaMarket puede dejar como proyecto final.

---

## Cierre final del curso

NovaMarket cierra el roadmap como una arquitectura distribuida pequeña pero suficientemente rica para enseñar problemas reales de microservicios de manera práctica, incremental y coherente.

A lo largo del curso, el proyecto fue incorporando capacidades técnicas porque el propio sistema las necesitó.  
Eso hizo que cada módulo tuviera una razón de existir y que el recorrido completo mantuviera una lógica clara.

Con este proyecto final integrador termina el roadmap, pero queda construida una base muy fuerte para seguir profundizando en arquitectura distribuida, despliegue y operación de sistemas más complejos.

El curso termina acá.  
La arquitectura, en cambio, recién empieza a estar lista para evolucionar con criterio.
