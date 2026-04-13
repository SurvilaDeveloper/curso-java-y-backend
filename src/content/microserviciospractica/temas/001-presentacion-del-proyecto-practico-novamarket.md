---
title: "Presentación del proyecto práctico NovaMarket"
description: "Inicio del curso práctico de microservicios. Presentación de NovaMarket, del flujo principal que vamos a construir y de la forma de trabajo paso a paso que seguiremos durante todo el proyecto."
order: 1
module: "Módulo 1 · Preparación del proyecto y primeros servicios"
level: "intro"
draft: false
---

# Presentación del proyecto práctico NovaMarket

Bienvenido al curso práctico de microservicios en el que vamos a construir **NovaMarket** de punta a punta.

Este no es un curso pensado para desarrollar teoría extensa sobre microservicios.  
La parte conceptual fuerte ya vive en el curso teórico.  
Acá el foco va a estar en otra cosa:

**crear, configurar, levantar, probar, corregir y hacer crecer un sistema real paso a paso.**

La idea es que al final del recorrido no solo entiendas qué piezas forman una arquitectura distribuida, sino que además tengas un proyecto funcional que puedas ejecutar, revisar, extender y usar como base para nuevos experimentos.

---

## Qué vamos a construir

NovaMarket va a ser una plataforma simple de pedidos construida con microservicios.

El flujo central del proyecto será este:

**consultar catálogo → crear orden → validar stock → registrar orden → publicar evento → notificar**

Ese flujo va a servir como columna vertebral del curso completo.

A partir de ese caso de uso vamos a ir incorporando, de forma progresiva:

- servicios Spring Boot,
- persistencia,
- configuración centralizada,
- Eureka,
- OpenFeign,
- API Gateway,
- Keycloak,
- Resilience4j,
- Actuator,
- Micrometer Tracing,
- Zipkin,
- RabbitMQ,
- Docker,
- y Docker Compose.

No vamos a construir todo junto desde el principio.  
Lo vamos a hacer por etapas, dejando siempre algo funcionando al terminar cada bloque.

---

## Qué tipo de curso es este

Este curso es **puramente práctico**.

Eso significa que en cada clase vamos a trabajar con uno o varios de estos pasos:

- generar proyectos con Spring Initializr,
- agregar dependencias,
- escribir clases Java,
- crear endpoints,
- configurar propiedades,
- levantar servicios,
- probar rutas,
- revisar logs,
- verificar errores,
- integrar componentes,
- y confirmar que cada parte funcione antes de seguir.

La idea no es avanzar rápido por avanzar.  
La idea es avanzar de forma acumulativa y verificable.

---

## Cómo vamos a trabajar

Durante todo el curso vamos a seguir una lógica bastante estable.

Cada clase va a intentar responder estas preguntas:

### 1. Qué vamos a construir
Cuál es el objetivo concreto del paso actual.

### 2. Desde qué estado partimos
Qué debería estar funcionando antes de empezar esa clase.

### 3. Qué archivos o proyectos vamos a crear o modificar
Qué parte de NovaMarket va a cambiar.

### 4. Cómo levantamos lo que acabamos de construir
Cómo ejecutar la pieza nueva o modificada.

### 5. Cómo verificamos que realmente funciona
Qué endpoint, log, respuesta o comportamiento vamos a usar como prueba.

Esa forma de trabajo es importante porque evita que el curso se convierta en una serie de pasos ciegos.

---

## Qué va a quedar construido al final

Al finalizar el curso, NovaMarket debería contar con una arquitectura parecida a esta:

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
- Keycloak
- RabbitMQ
- Zipkin
- bases de datos por servicio
- Docker Compose para levantar el sistema completo

No significa que en la primera etapa vayamos a tener todo esto listo.  
Significa que este es el mapa general de hacia dónde vamos.

---

## Qué problema resuelve cada parte del proyecto

Aunque el curso sea práctico, conviene tener una idea mínima del rol de cada componente.

### `catalog-service`
Va a exponer productos para consulta.

### `inventory-service`
Va a manejar disponibilidad o stock.

### `order-service`
Va a recibir la creación de órdenes y coordinar buena parte del flujo principal.

### `notification-service`
Va a reaccionar a eventos y nos va a permitir incorporar mensajería asincrónica.

### `config-server`
Nos va a ayudar a sacar configuración de los servicios.

### `discovery-server`
Va a permitir que los servicios se registren y se descubran entre sí.

### `api-gateway`
Va a ser el punto de entrada único al sistema.

### Keycloak
Va a encargarse de autenticación y tokens.

### RabbitMQ
Va a permitir publicar y consumir eventos.

### Zipkin
Va a ayudarnos a seguir el recorrido de una request entre varios servicios.

---

## Cómo va a crecer NovaMarket durante el curso

El proyecto no va a arrancar completo.

Lo vamos a construir por fases.

### Fase 1
Crearemos los primeros microservicios base con Spring Initializr.

### Fase 2
Implementaremos el primer flujo funcional simple: catálogo, inventario y órdenes.

### Fase 3
Sumaremos persistencia real.

### Fase 4
Incorporaremos Config Server y Eureka.

### Fase 5
Pasaremos a una integración más profesional con Feign y Gateway.

### Fase 6
Agregaremos seguridad con Keycloak.

### Fase 7
Endureceremos el sistema con resiliencia y observabilidad.

### Fase 8
Incorporaremos mensajería asincrónica con RabbitMQ.

### Fase 9
Cerraremos con testing, Docker y Docker Compose.

Este crecimiento gradual es intencional.  
Queremos que cada herramienta aparezca porque el sistema ya la necesita.

---

## Qué no vamos a hacer

También es importante dejar claro qué cosas no son el foco principal de este curso.

No vamos a priorizar:

- una interfaz frontend elaborada,
- una experiencia visual sofisticada,
- patrones excesivamente avanzados desde la primera clase,
- ni una arquitectura gigantesca difícil de seguir.

El foco está en la construcción de una arquitectura distribuida clara, incremental y verificable.

---

## Qué se espera del alumno durante el curso

Como este es un curso práctico, lo ideal es que el alumno:

- ejecute cada paso,
- no saltee verificaciones,
- levante los servicios cuando corresponda,
- mire los logs,
- pruebe endpoints reales,
- y no siga avanzando si una base anterior quedó rota.

En microservicios, una parte muy importante del aprendizaje aparece cuando algo falla y hay que entender por qué.

Por eso, además de construir, vamos a prestar atención a la validación continua.

---

## Qué significa validar continuamente

Validar continuamente significa que no vamos a esperar al final del curso para descubrir si NovaMarket funciona.

Después de cada bloque importante vamos a verificar cosas concretas.

Por ejemplo:

- que un servicio arranca,
- que escucha en el puerto esperado,
- que responde un endpoint,
- que una integración devuelve el resultado correcto,
- que el gateway enruta bien,
- que el token se valida,
- que un evento se publica,
- o que una traza aparece en Zipkin.

Eso hace que el proyecto crezca con más control.

---

## Qué herramientas vamos a usar

A lo largo del curso vamos a trabajar con herramientas como estas:

- Java
- Spring Boot
- Maven
- Spring Web
- Spring Data JPA
- Validation
- Spring Cloud Config
- Eureka
- OpenFeign
- Spring Cloud Gateway
- Spring Security
- Keycloak
- Resilience4j
- Spring Boot Actuator
- Micrometer
- Micrometer Tracing
- Zipkin
- RabbitMQ
- Docker
- Docker Compose

No las vamos a introducir todas juntas.  
Van a aparecer en la medida en que el proyecto las vaya necesitando.

---

## Qué valor tiene este enfoque práctico

Construir NovaMarket paso a paso tiene una ventaja muy clara:

las decisiones técnicas dejan de verse como una lista de nombres y empiezan a verse como respuestas a problemas reales del sistema.

Por ejemplo:

- Config Server aparece cuando ya molesta repetir configuración.
- Eureka aparece cuando ya hay varios servicios que deben encontrarse.
- Gateway aparece cuando ya queremos entrar por un solo punto.
- Keycloak aparece cuando ya tiene sentido proteger el acceso.
- RabbitMQ aparece cuando ya hay procesos que conviene desacoplar.
- Zipkin aparece cuando el sistema ya necesita visibilidad distribuida.

Ese enfoque le da coherencia al curso.

---

## Resultado esperado al terminar esta primera clase

Al terminar esta clase todavía no vamos a crear microservicios ni escribir clases Java.

Pero sí deberían quedar claras estas cosas:

- qué es NovaMarket,
- cuál es el flujo principal que vamos a construir,
- qué servicios van a formar parte del proyecto,
- cómo va a crecer la arquitectura a lo largo del curso,
- y cuál va a ser la forma de trabajo práctica en cada clase.

Este paso es importante porque nos deja una base común antes de empezar a construir.

---

## Punto de control

Antes de pasar a la próxima clase, debería quedar claro lo siguiente:

- el proyecto del curso se llama **NovaMarket**,
- el flujo central es **crear una orden de compra**,
- el curso práctico se va a enfocar en construcción real y verificación continua,
- y el proyecto se va a desarrollar de manera incremental, no todo junto desde el principio.

Si eso está claro, ya tenemos una base sólida para empezar a crear el workspace real del proyecto.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a entrar ya en el trabajo concreto del entorno.

Vamos a preparar:

- la estructura general del proyecto,
- la organización del monorepo,
- las carpetas base,
- y las convenciones que vamos a sostener durante todo el curso práctico.

Ese será el verdadero punto de partida operativo de NovaMarket.

---

## Cierre

NovaMarket va a ser el sistema sobre el que construiremos todo el curso práctico.

A lo largo del recorrido vamos a pasar de una arquitectura inexistente a una arquitectura distribuida funcional, observable, segura, resiliente y levantable con Docker Compose.

Esta primera clase cumple un objetivo simple pero importante: dejar claro **qué vamos a construir, cómo lo vamos a construir y por qué el proyecto está organizado de esta manera**.

En la próxima clase empezamos a trabajar sobre el entorno real del proyecto.
