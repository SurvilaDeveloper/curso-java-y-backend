---
title: "Filters y lógica transversal"
description: "Uso de filters en Spring Cloud Gateway para aplicar lógica transversal como logging, correlation IDs, transformación de requests y manejo centralizado de errores en NovaMarket."
order: 15
module: "Módulo 4 · API Gateway"
level: "base"
draft: false
---

# Filters y lógica transversal

En la clase anterior dejamos a **Spring Cloud Gateway** actuando como punto de entrada único para **NovaMarket**. Ya vimos que el gateway puede recibir requests externas y enrutar cada una al microservicio correspondiente.

Pero un gateway no solo sirve para enviar tráfico de un lado al otro.

Su verdadero valor aparece cuando empezamos a usarlo como lugar para resolver **preocupaciones transversales**. Es decir, problemas que no pertenecen a un único servicio de negocio, sino que atraviesan a varios componentes del sistema.

En esta clase vamos a trabajar con una de las piezas más importantes de Spring Cloud Gateway para lograr eso: los **filters**.

---

## Qué es una preocupación transversal

Una preocupación transversal es una responsabilidad técnica que aparece en muchos puntos del sistema.

Por ejemplo:

- registrar requests entrantes,
- agregar encabezados,
- propagar identificadores de correlación,
- medir tiempos,
- validar ciertos aspectos comunes,
- transformar paths,
- normalizar respuestas de error.

Sería una mala idea repetir esta lógica dentro de cada microservicio si el problema realmente corresponde al borde del sistema.

En NovaMarket, por ejemplo, tiene mucho más sentido que el gateway se encargue de algunas de estas tareas antes de delegar la request a `catalog-service`, `order-service` o `inventory-service`.

---

## Qué es un filter en Spring Cloud Gateway

Un **filter** es un componente que participa en el procesamiento de una request o de una response mientras atraviesa el gateway.

Según el caso, puede ejecutarse:

- antes de enviar la request al servicio de destino,
- después de recibir la respuesta,
- o en ambos momentos.

Eso nos permite interceptar el flujo y aplicar lógica técnica sin tocar directamente el microservicio final.

---

## Para qué sirven los filters

En un sistema como NovaMarket, los filters pueden ayudarnos a:

- registrar qué request entró,
- agregar un `X-Correlation-Id`,
- modificar headers,
- medir duración,
- unificar ciertas respuestas de error,
- aplicar políticas comunes de entrada,
- enriquecer el contexto antes de reenviar la request.

Lo importante es que el gateway no reemplace la lógica interna de negocio de los servicios, sino que centralice las responsabilidades que realmente viven en el borde.

---

## Filters antes y después del enrutamiento

Podemos pensar el recorrido de una request en dos partes:

### Antes de llegar al microservicio
Acá el gateway puede:

- inspeccionar path, headers o método,
- agregar información,
- transformar parte de la request,
- registrar trazas técnicas,
- tomar decisiones previas al enrutamiento.

### Después de volver del microservicio
Acá el gateway puede:

- inspeccionar el status code,
- agregar headers a la respuesta,
- registrar tiempo total,
- normalizar ciertos errores,
- enriquecer la salida.

Esta separación es importante porque no todos los problemas se resuelven en el mismo punto del flujo.

---

## Filters y NovaMarket

Tomemos un ejemplo real de nuestro sistema.

Supongamos que un cliente llama a:

```text
POST /api/orders
```

Esa request entra por el gateway y luego se reenvía a `order-service`.

Antes de reenviarla, el gateway podría:

- registrar el método y path,
- generar un identificador de correlación,
- agregar ese identificador como header,
- dejar preparado el contexto para debugging.

Después de obtener la respuesta, también podría:

- registrar el código de respuesta,
- medir la duración total,
- devolver headers útiles,
- dejar trazabilidad más clara para troubleshooting.

Ese tipo de lógica es transversal. No pertenece solo a `order-service`, sino a la entrada del sistema.

---

## Correlation ID

Uno de los casos más útiles y didácticos para este módulo es el **Correlation ID**.

Cuando un sistema distribuido empieza a crecer, un mismo flujo de negocio puede pasar por varios componentes:

1. entra al gateway,
2. llega a `order-service`,
3. consulta a `inventory-service`,
4. publica un evento,
5. más tarde `notification-service` consume ese evento.

Si no existe una forma de relacionar esos pasos, leer logs se vuelve muy difícil.

El correlation ID es un identificador que viaja junto con la operación y permite asociar distintos logs con el mismo flujo lógico.

---

## Por qué el gateway es un buen lugar para iniciarlo

En muchos sistemas, el gateway es el primer componente propio que recibe la request externa.

Por eso es un lugar natural para:

- aceptar un correlation ID si ya viene desde afuera,
- generarlo si no existe,
- agregarlo a la request saliente,
- dejarlo visible en logs.

En NovaMarket, esto nos sirve especialmente para seguir el flujo de **crear una orden** de punta a punta.

---

## Logging técnico en el gateway

Otra responsabilidad muy razonable en esta capa es el **logging técnico de entrada y salida**.

Por ejemplo, registrar:

- método HTTP,
- path solicitado,
- hora de inicio,
- correlation ID,
- status final,
- duración total.

Esto no reemplaza el logging interno de cada servicio, pero agrega una primera capa de observación muy útil.

Es especialmente importante porque, cuando algo sale mal, muchas veces lo primero que queremos saber es:

- si la request realmente entró,
- a qué ruta fue enviada,
- qué respuesta devolvió,
- cuánto tardó.

---

## Qué no debería hacer el gateway

Que el gateway pueda interceptar requests no significa que deba concentrar toda la lógica posible.

Hay ciertos errores de diseño frecuentes:

### 1. Poner lógica de negocio en el gateway
Por ejemplo, calcular precios o validar reglas de stock desde filtros.

Eso estaría mal, porque esa lógica pertenece a servicios de negocio como `order-service` o `inventory-service`.

### 2. Duplicar validaciones internas de los servicios
El gateway puede hacer controles de borde, pero no debería reemplazar la validación propia de cada microservicio.

### 3. Convertirse en un “super componente”
Si el gateway empieza a resolver demasiadas cosas, se transforma en un cuello de botella técnico y conceptual.

La idea es centralizar preocupaciones transversales, no reconstruir un monolito en la entrada.

---

## Tipos de lógica transversal útiles para el curso

En este curso, tiene mucho sentido usar filters para estos casos:

### Logging de requests y responses
Nos sirve desde ahora y será útil más adelante cuando agreguemos observabilidad.

### Correlation IDs
Nos prepara para tracing y troubleshooting distribuido.

### Encabezados comunes
Por ejemplo, agregar información técnica compartida entre componentes.

### Manejo inicial de errores de borde
No para esconder todo lo que falla, sino para normalizar ciertos casos simples en la entrada.

---

## Relación con seguridad

Aunque en esta clase todavía no vamos a entrar de lleno en OAuth2 ni JWT, es importante entender que el gateway también suele ser un lugar clave para decisiones de seguridad.

Más adelante vamos a ver que:

- puede actuar como resource server,
- puede validar tokens,
- puede reenviar identidad a otros servicios,
- puede convertirse en una primera barrera de acceso.

Por eso esta clase es importante: los filters y la lógica transversal preparan el terreno para el módulo de seguridad.

---

## Relación con observabilidad

También estamos dejando preparada la base para el módulo de observabilidad.

Cuando incorporemos:

- métricas,
- trazas distribuidas,
- agregación de logs,

nos va a resultar mucho más natural si ya pensamos el gateway como un punto donde la request puede ser observada, enriquecida y correlacionada.

En otras palabras, los filters no solo sirven para “tocar headers”, sino también para construir mejores capacidades de operación.

---

## Un ejemplo conceptual en NovaMarket

Imaginemos este flujo:

1. un cliente llama a `POST /api/orders`,
2. el gateway recibe la request,
3. un filter genera `X-Correlation-Id` si no existe,
4. el gateway registra un log de entrada,
5. la request viaja a `order-service`,
6. el servicio responde `201 Created`,
7. otro filter registra el status y la duración,
8. la response vuelve al cliente.

Con ese único cambio ya conseguimos varias mejoras:

- más trazabilidad,
- mejor debugging,
- menor repetición de lógica,
- una base más sólida para observabilidad.

---

## Qué aporta esta clase al proyecto del curso

Hasta acá, NovaMarket ya tiene:

- microservicios básicos,
- configuración centralizada,
- discovery,
- llamadas REST,
- balanceo,
- gateway.

Con esta clase, el gateway deja de ser solo un router y pasa a ser una pieza más madura de la arquitectura.

Eso es importante porque en una arquitectura distribuida no alcanza con que los componentes se encuentren. También necesitamos:

- entender qué está pasando,
- mantener coherencia en la entrada,
- y preparar el sistema para seguridad y observabilidad.

---

## Buen criterio para decidir si algo va en un filter

Una pregunta útil es esta:

**¿Esta lógica pertenece al negocio del servicio o al borde técnico del sistema?**

Si pertenece al borde, el gateway es un buen candidato.

Si pertenece al negocio, debería vivir dentro del microservicio correspondiente.

Por ejemplo:

- generar correlation IDs: gateway,
- loguear entrada y salida: gateway,
- validar stock: `inventory-service`,
- crear una orden: `order-service`,
- calcular total de compra: `order-service`.

Este criterio te ayuda a no mezclar responsabilidades.

---

## Cierre

Los filters de Spring Cloud Gateway permiten aplicar lógica transversal sobre requests y responses sin ensuciar los microservicios de negocio con responsabilidades que no les corresponden.

En NovaMarket, esto nos permite usar el gateway como una pieza más inteligente de la arquitectura:

- registrando requests,
- generando correlation IDs,
- enriqueciendo el tráfico,
- y preparando el terreno para seguridad y observabilidad.

La idea importante de esta clase no es memorizar una lista de filtros, sino entender por qué el gateway es un lugar tan valioso para resolver problemas transversales en un sistema distribuido.

En la próxima clase vamos a entrar en el siguiente gran bloque del curso: **seguridad distribuida**, para entender cómo se protege un sistema con varios microservicios y por qué autenticación y autorización cambian mucho cuando la aplicación deja de ser monolítica.
