---
title: "Introducción al Service Discovery"
description: "Qué problema resuelve el descubrimiento de servicios en una arquitectura distribuida, por qué las direcciones fijas dejan de escalar y cómo esta necesidad aparece naturalmente en NovaMarket."
order: 8
module: "Módulo 3 · Service Discovery e invocaciones REST"
level: "base"
draft: false
---

# Introducción al Service Discovery

Hasta ahora, en NovaMarket trabajamos principalmente sobre una necesidad estructural: **ordenar la configuración del sistema**.

Eso nos permitió construir una base importante para que los microservicios no dependan de propiedades desparramadas y difíciles de sostener.

Pero a medida que la arquitectura empieza a tener más componentes, aparece otro problema muy típico de los sistemas distribuidos:

**¿cómo encuentra un servicio a otro servicio?**

La pregunta parece simple, pero en realidad toca uno de los puntos más sensibles de una arquitectura de microservicios. Cuando el sistema deja de ser una única aplicación y pasa a estar compuesto por varias piezas independientes, ya no alcanza con que cada servicio exista: también hace falta una forma confiable de **descubrirlo** y **ubicarlo**.

Eso es exactamente lo que vamos a empezar a estudiar en esta clase.

---

## El problema de las direcciones fijas

Supongamos que `order-service` necesita consultar a `inventory-service` para validar stock antes de crear una orden.

La solución más inmediata y más simple suele ser algo como esto:

- `order-service` conoce una URL fija,
- por ejemplo `http://localhost:8082`,
- y hace la request directamente a esa dirección.

Para una prueba rápida puede funcionar. Pero apenas el sistema empieza a crecer, esa estrategia empieza a mostrar sus límites.

### ¿Qué pasa si cambia el puerto?

Hay que modificar configuración o código donde corresponda.

### ¿Qué pasa si el servicio se mueve de host?

La dirección ya no sirve.

### ¿Qué pasa si hay varias instancias?

Una URL fija deja de representar al servicio completo.

### ¿Qué pasa si un servicio cae y otro sigue activo?

La arquitectura necesita saber qué instancias siguen disponibles.

En otras palabras, una dirección fija puede servir para una etapa inicial, pero no escala bien cuando hablamos de microservicios de verdad.

---

## Qué es Service Discovery

Service Discovery es el mecanismo que permite que los componentes de una arquitectura distribuida puedan **registrarse**, **ser encontrados** y **ser consumidos por nombre lógico en lugar de depender de direcciones hardcodeadas**.

La idea central es sencilla:

- cada servicio conoce su propia identidad,
- se registra en un componente especializado,
- y otros servicios lo resuelven mediante ese registro.

Eso cambia el tipo de pregunta que hace el sistema.

Antes:
- “¿cuál es la URL exacta de este servicio?”

Después:
- “¿dónde están las instancias disponibles de `inventory-service`?”

Ese cambio es mucho más importante de lo que parece, porque permite desacoplar la lógica de negocio de detalles demasiado frágiles de infraestructura.

---

## Por qué este tema aparece de forma natural en NovaMarket

En el proyecto del curso ya definimos un flujo principal:

**consultar catálogo → crear orden → validar stock → registrar orden → publicar evento → notificar**

Dentro de ese flujo, muy pronto aparece una dependencia clara:

- `order-service` necesita consultar a `inventory-service`,
- y más adelante también puede necesitar hablar con otros componentes.

Si todas esas relaciones se resolvieran con URLs fijas, NovaMarket empezaría a acoplarse muy rápido a decisiones de despliegue.

Eso es justamente lo que queremos evitar.

La arquitectura debería poder pensar en términos de capacidades del sistema:

- catálogo,
- inventario,
- órdenes,
- notificaciones,

no en términos de “ese servicio vive exactamente en tal puerto y en tal host para siempre”.

---

## Qué problema resuelve realmente

Service Discovery no es solo una comodidad para no escribir URLs.

Resuelve varios problemas más profundos.

### 1. Desacopla consumidores de ubicaciones concretas

Un servicio puede pedir “quiero comunicarme con `inventory-service`” sin tener que saber en qué host o puerto está corriendo en ese momento.

### 2. Facilita el escalado horizontal

Si existen varias instancias de un mismo servicio, el sistema puede tratarlas como parte de una misma identidad lógica.

### 3. Ayuda a tolerar cambios de infraestructura

Si una instancia cambia de dirección o se recrea, el mecanismo de descubrimiento permite seguir resolviendo el servicio sin que los consumidores tengan que reconfigurarse manualmente de forma rígida.

### 4. Prepara el terreno para balanceo de carga

No se puede balancear bien si no se sabe qué instancias existen y cuáles están disponibles.

### 5. Vuelve más coherente la arquitectura

Los servicios se piensan por responsabilidad, no por coordenadas técnicas fijas.

---

## Qué no hace Service Discovery por sí solo

También conviene aclarar sus límites.

Service Discovery no resuelve automáticamente:

- resiliencia,
- seguridad,
- observabilidad,
- consistencia,
- ni calidad de los contratos entre servicios.

Lo que hace es resolver una pieza fundamental del rompecabezas:

**cómo encontrar los servicios dentro de una arquitectura distribuida**.

Eso es muchísimo, pero no es todo.

---

## El rol del registro de servicios

Para que el descubrimiento funcione, hace falta una pieza central o compartida que actúe como directorio.

Esa pieza cumple, en esencia, estas funciones:

- conoce qué servicios existen,
- sabe qué instancias están registradas,
- recibe información de alta o baja de instancias,
- y permite que otras partes del sistema resuelvan esos servicios.

En el ecosistema de Spring Cloud, una solución clásica para esto es **Eureka**.

En el curso vamos a trabajar con:

- `discovery-server` como servidor de registro,
- y servicios clientes que se registran y se descubren a través de él.

---

## Pensar servicios por identidad lógica

Esta clase también nos ayuda a reforzar una idea que ya venía apareciendo desde el módulo de configuración:

**los nombres importan mucho**.

En NovaMarket ya definimos nombres claros como:

- `catalog-service`
- `inventory-service`
- `order-service`
- `api-gateway`
- `config-server`
- `discovery-server`

Esos nombres no son solo prolijos. También son la base para:

- configuración,
- discovery,
- observabilidad,
- trazas,
- y lectura general de la arquitectura.

Cuando un sistema usa nombres inconsistentes, el descubrimiento de servicios se vuelve más confuso de lo necesario.

---

## Un ejemplo mental simple

Imaginemos esta situación.

`order-service` recibe una request para crear una orden.

Antes de confirmarla, necesita verificar stock.

### Sin discovery

`order-service` llama a una dirección fija, por ejemplo:

- `http://localhost:8082/api/inventory/check`

Eso funciona solo mientras la arquitectura siga siendo muy rígida.

### Con discovery

`order-service` ya no se preocupa por la dirección puntual.

En cambio, piensa algo como esto:

- “necesito comunicarme con `inventory-service`”

Y el ecosistema se encarga de resolver qué instancia o instancias representan a ese servicio en ese momento.

Ese cambio mental es exactamente el que hace madurar la arquitectura.

---

## Por qué esto es especialmente importante en microservicios

En una aplicación monolítica, muchas interacciones ocurren dentro del mismo proceso.

En cambio, en microservicios:

- una llamada viaja por red,
- el servicio remoto puede estar en otra máquina,
- puede haber múltiples instancias,
- puede caer una de ellas,
- puede haber cambios de infraestructura,
- y puede existir una capa de balanceo.

Con ese escenario, depender de direcciones manuales empieza a ser cada vez más frágil.

Por eso el descubrimiento de servicios no es una moda ni una sofisticación innecesaria. Es una respuesta natural a la propia naturaleza distribuida del sistema.

---

## Qué relación tiene con Load Balancing

Aunque en esta clase todavía no vamos a implementar balanceo, es importante entender que ambos temas están muy conectados.

Para balancear llamadas entre varias instancias de `inventory-service`, primero hace falta saber:

- cuántas instancias existen,
- cuáles están disponibles,
- y cómo identificarlas como parte del mismo servicio lógico.

Service Discovery aporta precisamente esa información base.

Más adelante, cuando entremos en Feign y Spring Cloud LoadBalancer, esta clase va a cobrar todavía más sentido.

---

## Qué cambia en el diseño del sistema

La introducción de discovery cambia una decisión importante del diseño.

Antes, el vínculo entre servicios podía expresarse así:

- “este servicio depende de esa URL”

Después, empieza a expresarse así:

- “este servicio depende de esa capacidad del sistema”

Ese cambio mejora mucho la arquitectura porque acerca el diseño técnico al modelo conceptual del negocio.

`order-service` no debería preocuparse por dónde está físicamente `inventory-service`. Debería preocuparse por el hecho de que existe una capacidad de inventario a la que necesita consultar.

---

## Cómo se conecta con lo que ya vimos

Hasta este punto del curso, ya resolvimos dos ideas muy importantes:

### 1. Configuración centralizada

Los servicios ya no deberían depender de archivos internos desordenados.

### 2. Identidad clara por servicio

Cada componente de NovaMarket tiene un nombre lógico coherente.

Eso nos prepara de forma perfecta para discovery, porque un sistema de descubrimiento necesita precisamente eso:

- servicios con identidad clara,
- y configuración consistente.

Es decir, esta clase no aparece de la nada. Es una consecuencia lógica de las anteriores.

---

## Qué problemas vamos a poder mostrar después gracias a esto

Introducir discovery no solo mejora la arquitectura ahora. También abre la puerta a varios temas de módulos siguientes.

### Eureka

Vamos a poder registrar servicios y visualizarlos.

### OpenFeign

Vamos a dejar de consumir servicios por dirección fija y empezar a hacerlo por nombre lógico.

### LoadBalancer

Vamos a poder repartir llamadas entre varias instancias.

### Gateway

Va a poder enrutar en un ecosistema más dinámico.

### Resiliencia y observabilidad

Tendrán mucho más sentido cuando el sistema ya funcione como un conjunto real de servicios distribuidos.

---

## Lo que todavía no estamos resolviendo

Vale la pena marcar un límite para no mezclar temas demasiado pronto.

En esta clase todavía no estamos:

- configurando Eureka paso a paso,
- registrando clientes,
- llamando servicios con Feign,
- ni balanceando requests.

Por ahora estamos resolviendo la base conceptual:

**por qué una arquitectura distribuida necesita discovery y por qué las direcciones fijas dejan de ser una solución saludable cuando el sistema crece**.

Tener esa base clara hace que las próximas clases no se sientan como instalación de herramientas, sino como respuestas naturales a un problema real del sistema.

---

## Cierre

Service Discovery resuelve una necesidad central de cualquier arquitectura de microservicios: permitir que los servicios se encuentren entre sí sin depender rígidamente de ubicaciones fijas.

En NovaMarket, esta necesidad aparece de forma muy natural apenas `order-service` necesita hablar con `inventory-service` y la arquitectura empieza a crecer.

Con esta clase dejamos establecida una idea muy importante para todo lo que viene:

**en una arquitectura distribuida, los servicios deben relacionarse por identidad lógica y capacidad del sistema, no por direcciones hardcodeadas que vuelven frágil la solución**.

En la próxima clase vamos a pasar de la necesidad conceptual a la primera implementación concreta: **configurar Eureka Server y Eureka Client** para que NovaMarket empiece a descubrir servicios de una manera real.
