---
title: "Configurando Eureka Server y Eureka Client"
description: "Implementación de Eureka Server y Eureka Client en NovaMarket para registrar instancias, descubrir servicios dinámicamente y dejar atrás las direcciones fijas entre microservicios."
order: 9
module: "Módulo 3 · Service Discovery e invocaciones REST"
level: "base"
draft: false
---

# Configurando Eureka Server y Eureka Client

En la clase anterior vimos qué problema resuelve el **Service Discovery** y por qué, en una arquitectura distribuida, depender de direcciones fijas termina generando fragilidad operativa.

Ahora vamos a bajar esa idea a un caso concreto dentro de **NovaMarket**.

Hasta este punto del curso ya tenemos una visión general del sistema y una infraestructura de configuración centralizada. El paso lógico siguiente es resolver cómo se van a **encontrar entre sí** los microservicios cuando empiecen a comunicarse por red.

Para eso vamos a incorporar **Eureka**, el componente de registro y descubrimiento que va a permitir que los servicios publiquen su presencia y que otros componentes puedan ubicarlos sin hardcodear host y puerto en cada llamada.

---

## El problema práctico que queremos resolver

Imaginemos una primera versión muy simple de NovaMarket con estos servicios:

- `catalog-service`
- `inventory-service`
- `order-service`

En un entorno muy básico, uno podría pensar algo así:

- `inventory-service` corre en `http://localhost:8082`
- `order-service` corre en `http://localhost:8083`

Entonces `order-service` podría llamar a `inventory-service` usando directamente esa URL.

El problema es que eso se rompe rápido cuando aparecen situaciones normales en un sistema distribuido:

- el puerto cambia,
- el servicio se mueve de máquina,
- hay varias instancias del mismo servicio,
- el entorno deja de ser local,
- se redeploya una parte del sistema,
- una instancia deja de estar disponible.

En ese contexto, una arquitectura basada en direcciones fijas empieza a ser incómoda, frágil y difícil de operar.

---

## Qué aporta Eureka

Eureka permite que cada microservicio pueda:

- **registrarse** al iniciar,
- **anunciar su nombre lógico**,
- **publicar dónde está corriendo**,
- y **renovar periódicamente** su presencia para indicar que sigue vivo.

A su vez, otros componentes del sistema pueden consultar ese registro y descubrir:

- qué servicios existen,
- qué instancias están activas,
- y dónde están disponibles.

En NovaMarket eso significa que, en lugar de pensar en una URL fija como:

```txt
http://localhost:8082
```

podemos empezar a pensar en nombres lógicos como:

```txt
inventory-service
```

Ese cambio es muy importante, porque desacopla la identidad del servicio de su ubicación concreta.

---

## Rol de Eureka dentro de NovaMarket

Dentro del proyecto del curso, **Eureka no es un servicio de negocio**. Es una pieza de infraestructura.

Su responsabilidad no es manejar productos, stock ni órdenes. Su responsabilidad es sostener un mapa actualizado de los servicios disponibles en el ecosistema.

En nuestra arquitectura va a ocupar este lugar:

- `config-server` centraliza configuración,
- `discovery-server` registra y expone el catálogo de servicios,
- los microservicios de negocio se registran allí,
- más adelante `api-gateway` también se apoyará en este mecanismo para enrutar tráfico.

De esta manera, Eureka pasa a ser una base importante para varias decisiones futuras del curso.

---

## Qué vamos a construir en esta clase

En esta clase vamos a trabajar dos piezas:

1. **`discovery-server`** como Eureka Server.
2. **clientes Eureka** en los microservicios que queramos registrar.

Al final de la clase el objetivo no es todavía hacer llamadas de negocio complejas, sino lograr algo más fundamental:

- levantar el servidor de descubrimiento,
- registrar servicios bajo nombres lógicos,
- ver las instancias desde el panel de Eureka,
- entender cómo se renueva la presencia de cada servicio.

---

## Qué es Eureka Server

**Eureka Server** es el componente central del sistema de descubrimiento.

Se encarga de:

- recibir registros de instancias,
- almacenar qué servicios están disponibles,
- exponer esa información a los clientes,
- eliminar o marcar instancias cuando dejan de renovar su presencia.

En NovaMarket este componente lo vamos a materializar en un proyecto separado:

- `discovery-server`

Ese proyecto será una aplicación Spring Boot dedicada a cumplir exclusivamente esta función.

---

## Qué es un Eureka Client

Un **Eureka Client** es cualquier aplicación que participa del ecosistema y se integra con el servidor Eureka.

Dependiendo del caso, un cliente puede:

- registrarse a sí mismo,
- consultar el registro para descubrir otras instancias,
- o ambas cosas.

En nuestro caso, los microservicios de negocio van a registrarse como clientes.

Por ejemplo:

- `catalog-service`
- `inventory-service`
- `order-service`

Más adelante también `api-gateway` actuará como cliente.

---

## Cómo se ve el registro a nivel conceptual

Cuando una instancia arranca, el flujo conceptual es este:

1. el microservicio inicia,
2. toma su nombre lógico, por ejemplo `inventory-service`,
3. conoce la dirección del servidor Eureka,
4. se registra enviando información como host, puerto e identificador,
5. empieza a enviar renovaciones periódicas,
6. Eureka la muestra como disponible.

Desde ese momento, el sistema ya tiene un punto central para saber dónde está corriendo esa instancia.

---

## Decisión importante: nombres lógicos de servicio

Una de las primeras decisiones de diseño que conviene tomar con seriedad es cómo se van a llamar los servicios.

Para NovaMarket vamos a usar nombres explícitos y consistentes:

- `config-server`
- `discovery-server`
- `catalog-service`
- `inventory-service`
- `order-service`
- `notification-service`
- `api-gateway`

Esto parece un detalle menor, pero no lo es.

Nombrar bien los servicios mejora:

- la legibilidad,
- la configuración,
- el debugging,
- la observabilidad,
- y la claridad de las rutas y métricas.

---

## Relación con la configuración centralizada

Como en NovaMarket ya venimos trabajando con **Spring Cloud Config**, una buena práctica es que la configuración relacionada con Eureka viva en el repositorio de configuración, no dispersa en cada proyecto local.

Eso nos permite centralizar cosas como:

- nombre del servicio,
- puerto,
- URL del Eureka Server,
- comportamiento del cliente,
- ajustes de renovación y registro.

De esta manera mantenemos una coherencia arquitectónica:

- Config Server administra configuración,
- Eureka administra descubrimiento,
- cada componente cumple un rol preciso.

---

## Estructura del proyecto `discovery-server`

El proyecto `discovery-server` puede pensarse como una aplicación Spring Boot muy liviana.

Su trabajo principal consiste en:

- arrancar,
- exponerse en un puerto conocido,
- habilitar Eureka Server,
- y no intentar registrarse como cliente de sí mismo en esta etapa del curso.

Como regla didáctica del proyecto, este servicio:

- no tiene base de datos,
- no expone endpoints de negocio,
- no procesa órdenes,
- no consulta stock.

Es pura infraestructura.

---

## Qué vamos a ver cuando funcione

Cuando Eureka Server esté operativo y un microservicio cliente logre registrarse, lo más visible será el dashboard web del servidor.

Ahí podremos observar:

- los nombres de las aplicaciones registradas,
- la cantidad de instancias,
- el estado de cada una,
- datos básicos de host y puerto.

Ese panel tiene mucho valor pedagógico al comienzo porque vuelve visible algo que, de otro modo, sería bastante abstracto.

---

## Primer servicio cliente en NovaMarket

Para la primera prueba conviene registrar uno o dos servicios, no todos a la vez.

Una secuencia razonable sería:

1. registrar `catalog-service`,
2. registrar `inventory-service`,
3. después registrar `order-service`.

Eso permite validar paso a paso que:

- el servidor está bien levantado,
- la comunicación cliente-servidor existe,
- los nombres lógicos quedaron correctos,
- los puertos que se publican coinciden con los reales.

---

## Qué información publica cada cliente

Cuando un microservicio se registra, no solo informa “existo”.

También publica metadatos importantes para el ecosistema, por ejemplo:

- nombre de la aplicación,
- host,
- puerto,
- dirección base,
- identificador de instancia,
- estado de salud aproximado,
- metadatos adicionales si el sistema los define.

Más adelante esto va a ser útil porque herramientas como el balanceador del lado cliente o el gateway pueden apoyarse en esa información.

---

## Renovación de presencia y heartbeats

En un sistema distribuido no alcanza con registrarse una sola vez.

Una instancia puede caerse, congelarse o quedar inaccesible después del arranque.

Por eso Eureka trabaja con un mecanismo de renovación periódica. Cada cliente envía heartbeats o renovaciones para indicar:

**“sigo vivo y sigo disponible”**.

Si esas renovaciones dejan de llegar, Eureka eventualmente puede considerar que la instancia ya no está disponible.

Este detalle es muy importante porque muestra una idea central de los microservicios: el sistema tiene que convivir con la posibilidad de que partes del ecosistema cambien de estado todo el tiempo.

---

## Qué pasa si el servidor Eureka no está disponible

Este es un buen punto para introducir una mirada realista.

Si Eureka no está disponible:

- los clientes nuevos no podrán registrarse correctamente,
- el mapa del sistema puede dejar de actualizarse,
- algunas partes que dependen del descubrimiento pueden degradarse.

Esto no significa que toda la arquitectura se vuelva inútil de inmediato, pero sí muestra que estamos incorporando un componente de infraestructura importante que debe tratarse con cuidado.

Más adelante, cuando hablemos de resiliencia y operación, esta clase de dependencias se vuelve especialmente relevante.

---

## Qué ganamos y qué no ganamos todavía

Después de configurar Eureka ganamos algo muy valioso:

- dejamos de pensar solo en host y puerto fijos,
- introducimos nombres lógicos de servicio,
- preparamos el sistema para tener varias instancias,
- habilitamos la base para el consumo dinámico entre componentes.

Pero todavía **no resolvimos todo**.

A esta altura del curso todavía nos faltan cosas como:

- clientes declarativos más cómodos,
- balanceo de carga entre instancias,
- gateway,
- resiliencia,
- observabilidad distribuida.

Eureka es una pieza base, no la solución completa de la comunicación distribuida.

---

## Una vista de NovaMarket después de esta clase

Después de esta clase, la arquitectura conceptual de NovaMarket podría verse así:

- `config-server` entrega configuración centralizada,
- `discovery-server` mantiene el registro de servicios,
- `catalog-service` se registra en Eureka,
- `inventory-service` se registra en Eureka,
- `order-service` se registra en Eureka.

Todavía no estamos aprovechando toda la potencia de ese registro, pero ya estamos construyendo la infraestructura correcta para que las próximas clases tengan sentido.

---

## Buenas prácticas didácticas para esta etapa

En esta parte del curso conviene mantener algunas reglas simples:

### 1. Registrar primero, consumir después
Antes de intentar llamadas complejas, conviene asegurarse de que el ecosistema ya se ve correctamente en Eureka.

### 2. Nombrar los servicios con consistencia
Lo que elijas acá va a aparecer en configuración, logs, métricas y llamadas internas.

### 3. Separar infraestructura de negocio
Eureka no debe contaminarse con lógica de dominio.

### 4. Mantener mínima la complejidad inicial
Primero un registro correcto. Después vendrán Feign, LoadBalancer y Gateway.

---

## Qué lugar ocupa esta clase dentro del recorrido

Esta clase marca un cambio importante en el curso.

Hasta ahora veníamos preparando el terreno con:

- fundamentos,
- arquitectura,
- configuración centralizada.

A partir de acá, NovaMarket empieza a sentirse más claramente como un sistema distribuido real.

Porque ya no alcanza con tener varios proyectos. Ahora esos proyectos empiezan a vivir dentro de un ecosistema que necesita mecanismos formales para ubicarse y colaborar.

---

## Cierre

Configurar **Eureka Server** y **Eureka Clients** es uno de los primeros pasos prácticos para convertir varios microservicios aislados en una arquitectura distribuida con cierta coherencia.

En NovaMarket, Eureka va a cumplir el rol de directorio central del sistema: cada servicio podrá anunciarse allí y, más adelante, otros componentes podrán encontrarlo usando su nombre lógico en lugar de depender de direcciones fijas.

Todavía no estamos resolviendo toda la comunicación entre servicios, pero ya estamos sentando una base imprescindible para lo que viene.

En la próxima clase vamos a pasar del descubrimiento a la interacción directa entre microservicios, analizando cómo se realizan las **invocaciones REST** y qué problemas aparecen cuando un servicio depende de otro a través de la red.
