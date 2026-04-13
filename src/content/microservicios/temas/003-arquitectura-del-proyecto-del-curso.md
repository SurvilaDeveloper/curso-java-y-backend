---
title: "Arquitectura del proyecto del curso"
description: "Presentación de NovaMarket como sistema base del curso, sus microservicios principales, el flujo funcional central y el rol de cada componente dentro de la arquitectura." 
order: 3
module: "Módulo 1 · Fundamentos y arquitectura base"
level: "intro"
draft: false
---

# Arquitectura del proyecto del curso

En esta clase vamos a definir la arquitectura base del sistema que nos va a acompañar durante todo el curso.

Ese sistema se llama **NovaMarket**.

No lo vamos a usar como un ejemplo decorativo ni como un caso inventado que desaparece después de dos clases. Va a ser la **columna vertebral de todo el recorrido**, de modo que cada tema nuevo se incorpore sobre el mismo proyecto y tenga un motivo claro para existir.

La idea del curso no es aprender herramientas aisladas, sino construir una plataforma de microservicios que vaya creciendo paso a paso hasta convertirse en un sistema distribuido coherente, observable, seguro y desplegable.

---

## Qué es NovaMarket

NovaMarket es una plataforma simple de pedidos.

Desde el punto de vista funcional, el sistema permite que un usuario:

- consulte productos,
- elija uno o varios ítems,
- cree una orden,
- valide disponibilidad de stock,
- registre la operación,
- y dispare procesos posteriores de forma asincrónica.

No necesitamos un e-commerce completo con frontend sofisticado, carrito complejo, promociones, pagos reales y logística avanzada. El foco del curso está en la **arquitectura distribuida**.

Eso significa que NovaMarket está pensado para enseñar problemas reales de microservicios sin meter complejidad innecesaria desde el principio.

---

## El caso de uso central del curso

Todo el curso va a girar alrededor de un flujo principal:

**consultar catálogo → crear orden → validar stock → registrar orden → publicar evento → notificar**

Ese flujo es extremadamente útil desde el punto de vista pedagógico porque permite introducir casi todos los conceptos importantes del roadmap.

Por ejemplo:

- el catálogo nos sirve para mostrar un servicio simple de consulta,
- la validación de stock nos sirve para mostrar comunicación sincrónica entre servicios,
- la creación de la orden nos sirve para hablar de lógica de negocio y persistencia,
- la publicación de eventos nos sirve para introducir mensajería asincrónica,
- la notificación nos sirve para desacoplar responsabilidades,
- y el recorrido completo nos sirve para trabajar logs, métricas y trazas.

En otras palabras, el flujo principal no está elegido al azar. Está pensado para que todo el curso tenga continuidad.

---

## Qué queremos lograr con esta arquitectura

A medida que el sistema evolucione, vamos a querer que NovaMarket pueda:

- externalizar configuración,
- descubrir servicios dinámicamente,
- enrutar tráfico desde un punto de entrada único,
- autenticar y autorizar usuarios,
- tolerar fallas parciales,
- observar el recorrido de una request entre servicios,
- desacoplar pasos mediante eventos,
- y levantarse completo en un entorno local con Docker Compose.

Eso significa que la arquitectura no está pensada solo para “que funcione”, sino también para **soportar los problemas típicos de una aplicación distribuida**.

---

## Microservicios principales del sistema

NovaMarket va a trabajar principalmente con los siguientes componentes.

### `catalog-service`
Se encarga de exponer el catálogo de productos.

Su responsabilidad principal será permitir consultas como:

- listar productos,
- obtener detalle de un producto,
- filtrar por disponibilidad o estado, según la evolución del curso.

Al comienzo va a ser uno de los servicios más simples, y por eso mismo es ideal para arrancar.

---

### `inventory-service`
Se encarga de administrar la disponibilidad de stock.

Su responsabilidad será responder preguntas como:

- si un producto tiene stock suficiente,
- cuánta cantidad está disponible,
- y más adelante, si conviene, reservar o descontar stock.

Este servicio es muy valioso dentro del curso porque `order-service` va a depender de él para poder crear una orden válida. Eso nos da un ejemplo excelente de dependencia distribuida.

---

### `order-service`
Es el corazón funcional del proyecto.

Se encarga de:

- recibir solicitudes de creación de orden,
- validar la información,
- consultar stock,
- persistir la orden,
- y publicar eventos de negocio cuando la operación se completa.

Es el servicio más importante del sistema desde el punto de vista didáctico, porque va a concentrar gran parte de la lógica sobre la que después vamos a sumar seguridad, resiliencia, observabilidad y mensajería.

---

### `notification-service`
Se encarga de consumir eventos y generar una acción posterior, por ejemplo una notificación de que la orden fue creada correctamente.

Este servicio no es necesario para empezar el sistema, pero sí es muy útil cuando introduzcamos mensajería asincrónica.

Su presencia nos permite enseñar una idea importante: no toda consecuencia de una operación debe ejecutarse en la misma request síncrona.

---

### `api-gateway`
Es el punto de entrada único al sistema.

Su función será:

- recibir requests externas,
- enrutar a los servicios adecuados,
- aplicar filtros,
- centralizar ciertas preocupaciones transversales,
- y más adelante intervenir en seguridad y propagación de token.

En una arquitectura real, el gateway suele ser una pieza clave porque evita que los clientes tengan que conocer directamente cada microservicio interno.

---

### `config-server`
Se encarga de centralizar configuración.

Su objetivo es que los servicios no dependan exclusivamente de archivos locales dentro de cada proyecto, sino que puedan resolver propiedades desde una fuente común.

Esto es importante cuando el sistema empieza a crecer, porque repetir configuración en muchos servicios vuelve más difícil mantener coherencia entre ambientes.

---

### `discovery-server`
Se encarga del registro y descubrimiento de servicios.

En nuestro caso lo vamos a implementar con Eureka.

Su rol será permitir que los microservicios se registren con un nombre lógico y que otros servicios puedan encontrarlos sin depender de URLs hardcodeadas.

---

### `Keycloak`
No es un microservicio desarrollado por nosotros, pero forma parte de la arquitectura del curso como proveedor de identidad.

Lo vamos a usar para enseñar:

- autenticación,
- emisión de tokens,
- validación de JWT,
- roles,
- scopes,
- y propagación segura de identidad entre servicios.

Usar Keycloak nos permite enfocarnos en seguridad distribuida sin desviar el curso hacia la implementación casera de un sistema de login.

---

## Infraestructura complementaria que aparecerá más adelante

Además de los microservicios centrales, la arquitectura va a incorporar otras piezas a medida que avancemos.

### RabbitMQ
Lo vamos a usar para comunicación asincrónica basada en eventos.

### Zipkin
Lo vamos a usar para visualizar trazas distribuidas.

### Docker Compose
Lo vamos a usar para levantar el ecosistema completo en local.

### Bases de datos por servicio
Según el momento del curso, podremos arrancar con H2 y luego pasar a PostgreSQL por servicio para reflejar una arquitectura más realista.

---

## El flujo funcional central

Vamos a ver el recorrido de la operación principal desde una perspectiva arquitectónica.

### Paso 1: consulta de catálogo
El usuario consulta productos a través del gateway.

El gateway deriva la request hacia `catalog-service`, que devuelve los productos disponibles.

### Paso 2: creación de orden
El usuario envía una solicitud para crear una orden con uno o varios productos.

La request entra por el gateway y llega a `order-service`.

### Paso 3: validación de stock
`order-service` necesita saber si hay disponibilidad suficiente.

Para eso consulta a `inventory-service`.

En una primera etapa, esa comunicación puede ser una llamada HTTP simple. Más adelante la mejoraremos con discovery, Feign y balanceo de carga.

### Paso 4: registro de la orden
Si el stock es suficiente, `order-service` registra la orden en su propia persistencia.

### Paso 5: publicación de evento
Una vez creada la orden, `order-service` publica un evento de dominio, por ejemplo `OrderCreatedEvent`.

### Paso 6: consumo del evento
`notification-service` consume ese evento y ejecuta una acción posterior, como registrar o simular una notificación.

### Paso 7: observación del flujo
Más adelante podremos seguir toda la operación con logs, métricas y trazas distribuidas.

---

## Por qué este flujo es tan útil para el curso

Porque obliga a trabajar con varios tipos de problemas reales.

### Problemas de diseño
Tenemos que decidir qué responsabilidad vive en cada servicio.

### Problemas de comunicación
Un servicio necesita datos o validaciones que viven en otro.

### Problemas de seguridad
La creación de órdenes no debería quedar abierta a cualquiera.

### Problemas de resiliencia
Si `inventory-service` responde lento o falla, `order-service` tiene que reaccionar de forma controlada.

### Problemas de observabilidad
Cuando una operación cruza varios servicios, necesitamos entender qué pasó y dónde.

### Problemas de consistencia
No todo puede resolverse en una sola transacción local cuando el sistema está distribuido.

Eso hace que NovaMarket sea un muy buen proyecto base para aprender microservicios con una lógica de negocio suficiente, pero sin convertirse en una plataforma inmanejable.

---

## Qué no vamos a hacer al principio

Para que el curso sea práctico y didáctico, no vamos a arrancar con toda la arquitectura completa desde la primera clase.

No tendría sentido crear de entrada:

- gateway,
- config server,
- discovery,
- seguridad,
- mensajería,
- observabilidad completa,
- y Docker Compose,

si todavía no existe un flujo funcional mínimo que justifique esas piezas.

Por eso vamos a trabajar por etapas.

Primero construiremos un sistema pequeño pero funcional.
Después le iremos sumando infraestructura y capacidades.

Ese enfoque permite entender **por qué** aparece cada herramienta.

---

## Evolución prevista del sistema durante el curso

### Etapa 1
Sistema mínimo con:

- `catalog-service`
- `inventory-service`
- `order-service`

Objetivo:
lograr un flujo básico de consulta de catálogo y creación de orden.

### Etapa 2
Se agrega configuración centralizada:

- `config-server`

Objetivo:
externalizar propiedades y organizar mejor ambientes.

### Etapa 3
Se agrega descubrimiento de servicios:

- `discovery-server`

Objetivo:
dejar de depender de direcciones fijas.

### Etapa 4
Se mejora la comunicación entre servicios con:

- OpenFeign
- Spring Cloud LoadBalancer

Objetivo:
hacer el consumo más declarativo y profesional.

### Etapa 5
Se agrega:

- `api-gateway`

Objetivo:
centralizar el acceso al sistema.

### Etapa 6
Se incorpora seguridad con:

- Keycloak
- JWT
- Resource Server

Objetivo:
proteger operaciones sensibles y propagar identidad.

### Etapa 7
Se trabaja resiliencia:

- timeouts
- retry
- circuit breaker

Objetivo:
manejar fallas parciales.

### Etapa 8
Se suma observabilidad:

- logs estructurados
- métricas
- trazas distribuidas

Objetivo:
entender qué ocurre dentro del sistema.

### Etapa 9
Se incorpora mensajería asincrónica:

- RabbitMQ
- `notification-service`

Objetivo:
desacoplar consecuencias posteriores de la creación de orden.

### Etapa 10
Se dockeriza todo:

- Dockerfiles
- Docker Compose

Objetivo:
levantar la arquitectura completa en local.

---

## Una vista conceptual de la arquitectura

Podemos imaginar la primera arquitectura completa de referencia de esta manera:

- el cliente entra por `api-gateway`,
- `api-gateway` enruta a `catalog-service`, `order-service` u otros servicios,
- `order-service` consulta a `inventory-service`,
- los servicios obtienen configuración desde `config-server`,
- los servicios se registran en `discovery-server`,
- la autenticación se apoya en Keycloak,
- los eventos se publican a través de RabbitMQ,
- `notification-service` consume eventos,
- Zipkin ayuda a seguir el recorrido de las requests,
- y Docker Compose levanta el ecosistema completo.

Esa foto general nos da un mapa del curso, aunque todavía falte construir la mayor parte del sistema.

---

## Qué decisiones didácticas estamos tomando

Este proyecto base está diseñado con algunos criterios muy concretos.

### 1. Un solo caso de uso principal
Eso evita dispersión y le da coherencia a todos los temas.

### 2. Complejidad progresiva
No metemos herramientas porque sí. Las incorporamos cuando el sistema las necesita.

### 3. Servicios con responsabilidades claras
Eso ayuda a que los alumnos entiendan el sentido de la separación.

### 4. Infraestructura realista pero controlada
El sistema se parece a una arquitectura profesional, pero sigue siendo enseñable.

### 5. Persistencia del contexto entre clases
Cada nueva clase se apoya en lo anterior. El proyecto no se reinicia todo el tiempo.

---

## Cierre

NovaMarket va a ser el sistema base del curso y el hilo conductor de todos los módulos.

A partir de esta arquitectura vamos a construir, de forma progresiva, una plataforma de microservicios capaz de mostrar configuración centralizada, discovery, gateway, seguridad, resiliencia, observabilidad, mensajería y despliegue local completo.

Lo importante de esta clase no es memorizar nombres de servicios, sino entender que el curso ya tiene un sistema con identidad propia, un flujo de negocio claro y una arquitectura pensada para crecer con sentido.

En la próxima clase vamos a empezar con una de las primeras necesidades reales que aparece cuando el sistema deja de ser un único proyecto aislado: la **configuración centralizada**.
