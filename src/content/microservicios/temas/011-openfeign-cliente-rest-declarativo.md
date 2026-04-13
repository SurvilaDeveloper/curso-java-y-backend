---
title: "OpenFeign: cliente REST declarativo"
description: "Uso de OpenFeign en NovaMarket para definir clientes REST declarativos, consumir servicios por nombre lógico y mejorar la claridad de la comunicación entre microservicios."
order: 11
module: "Módulo 3 · Service Discovery e invocaciones REST"
level: "base"
draft: false
---

# OpenFeign: cliente REST declarativo

En la clase anterior analizamos la naturaleza de las invocaciones REST entre microservicios y vimos que, detrás de una llamada HTTP aparentemente simple, aparecen contratos, acoplamiento temporal, diseño de errores y dependencia de red.

Ahora vamos a incorporar una herramienta que mejora mucho la forma de expresar ese consumo dentro de un proyecto Spring Cloud: **OpenFeign**.

La idea no es esconder los problemas del sistema distribuido, sino representarlos de una manera más clara, más mantenible y más alineada con la arquitectura que queremos construir en **NovaMarket**.

---

## Qué es OpenFeign

OpenFeign es un cliente HTTP declarativo.

Eso significa que, en lugar de escribir manualmente toda la lógica de construcción de requests, URLs, serialización y consumo de endpoints, podemos definir una interfaz que represente el contrato remoto que queremos consumir.

En otras palabras, pasamos de pensar:

- “voy a armar una request HTTP paso por paso”

A pensar:

- “voy a declarar un cliente que representa al servicio remoto y sus operaciones relevantes”.

Ese cambio mejora bastante la expresividad del código.

---

## Qué problema nos resuelve en NovaMarket

Recordemos el caso principal.

Cuando un usuario crea una orden, `order-service` necesita consultar a `inventory-service` para saber si hay stock suficiente.

Si modelamos esa integración de manera muy manual, el código de `order-service` puede terminar mezclando:

- lógica de negocio,
- detalles HTTP,
- armado de URLs,
- parsing de respuestas,
- manejo técnico del cliente.

Eso hace que el servicio se vuelva menos claro.

Con OpenFeign podemos representar esa dependencia de forma mucho más declarativa:

- existe un cliente hacia `inventory-service`,
- ese cliente expone una operación de validación de stock,
- `order-service` la invoca como parte de su flujo.

---

## Por qué se lo llama cliente declarativo

Se lo llama declarativo porque nosotros declaramos:

- a qué servicio queremos consumir,
- qué endpoint representa cada operación,
- qué request enviamos,
- qué tipo de respuesta esperamos.

Y la infraestructura se encarga de materializar esa comunicación en tiempo de ejecución.

Este enfoque encaja muy bien en una arquitectura con Service Discovery, porque ya venimos trabajando con nombres lógicos de servicio gracias a Eureka.

---

## La ventaja conceptual más importante

La principal ventaja de OpenFeign no es solo que “es más cómodo”.

La ventaja más importante es que ayuda a que la integración entre servicios se exprese con una semántica más cercana al dominio.

Por ejemplo, dentro de `order-service` podemos pensar en algo como:

- `inventoryClient.checkAvailability(...)`

Eso comunica mucho mejor la intención que una secuencia de pasos técnicos para armar una request HTTP manual.

La lectura del código mejora porque la dependencia queda representada como una interfaz clara.

---

## Cómo encaja con Eureka

Acá aparece una integración muy valiosa del ecosistema Spring Cloud.

Como `inventory-service` ya está registrado en Eureka, OpenFeign puede consumirlo usando su **nombre lógico de servicio**, sin que nosotros tengamos que depender de una URL fija.

Eso significa que el cliente puede definirse pensando en:

```txt
inventory-service
```

En lugar de algo como:

```txt
http://localhost:8082
```

Este punto es central para NovaMarket, porque consolida una idea que venimos construyendo desde las últimas clases:

- los servicios no deberían conocerse por su dirección concreta,
- deberían conocerse por su identidad lógica dentro del sistema.

---

## Qué cambia en la arquitectura mental del proyecto

Antes de introducir OpenFeign, `order-service` necesitaba pensar en:

- cómo localizar el servicio,
- cómo construir la request,
- cómo invocar el endpoint,
- cómo deserializar la respuesta.

Con OpenFeign, ese pensamiento se mueve hacia algo más limpio:

- existe un contrato remoto declarado en una interfaz,
- el servicio de negocio usa esa interfaz,
- la infraestructura resuelve la llamada.

Esto no elimina la complejidad distribuida, pero sí mejora mucho la separación entre negocio e integración técnica.

---

## Cliente remoto como parte explícita del diseño

En NovaMarket conviene modelar los clientes Feign como piezas deliberadas del sistema.

No deberían aparecer como atajos improvisados, sino como una manera formal de expresar relaciones entre servicios.

Por ejemplo:

- `order-service` depende de un cliente hacia `inventory-service`.

Eso debería reflejarse en:

- nombres claros,
- DTOs bien definidos,
- endpoints estables,
- contratos de error comprensibles.

OpenFeign hace más visible esa relación, lo cual es una ventaja.

---

## Caso central: validar stock desde `order-service`

Esta será la integración más importante de este tramo del curso.

El cliente declarativo de `order-service` hacia `inventory-service` va a representar algo como:

- una operación de validación de disponibilidad,
- recibiendo la lista de ítems solicitados,
- devolviendo si hay stock suficiente.

Conceptualmente, eso nos permite escribir el flujo del negocio con más claridad:

1. recibir solicitud de orden,
2. invocar cliente de inventario,
3. evaluar respuesta,
4. crear o rechazar la orden.

Ese nivel de lectura ya se parece mucho más al lenguaje del problema de negocio.

---

## Qué no hace OpenFeign por nosotros

Es importante no idealizar la herramienta.

OpenFeign mejora la forma de declarar y consumir llamadas REST, pero no resuelve mágicamente todos los problemas del sistema distribuido.

Por sí solo no elimina:

- la latencia,
- las caídas del servicio remoto,
- los timeouts,
- los errores HTTP,
- la necesidad de diseñar bien los contratos,
- ni el riesgo del acoplamiento temporal.

Es una mejora muy valiosa de diseño y ergonomía, no una solución total a la resiliencia.

---

## Beneficios concretos dentro del curso

Usar OpenFeign en NovaMarket nos da varias ventajas pedagógicas y técnicas:

### 1. Código más legible
La intención del consumo queda mejor expresada.

### 2. Mejor separación de responsabilidades
La lógica de negocio puede concentrarse más en decidir y menos en construir requests.

### 3. Integración natural con Eureka
Consumimos servicios por nombre lógico.

### 4. Preparación para el balanceo de carga
Más adelante, LoadBalancer podrá trabajar mejor sobre esta base.

### 5. Base clara para incorporar resiliencia
Circuit Breaker, Retry y observabilidad encajan muy bien cuando la integración ya está modelada con claridad.

---

## DTOs y contratos: siguen siendo críticos

Aunque la interfaz del cliente sea declarativa, seguimos necesitando contratos bien diseñados.

Eso implica pensar con cuidado en los DTOs que viajan entre servicios.

Por ejemplo, para validar stock probablemente necesitaremos:

- un request DTO con ítems y cantidades,
- un response DTO con resultado global y detalle por producto.

Si esos contratos son ambiguos, la comodidad de Feign no va a salvar la integración.

Por eso OpenFeign debe usarse junto con una disciplina de diseño de contratos.

---

## Cuidado con el exceso de acoplamiento

Una tentación frecuente es empezar a modelar demasiadas dependencias directas entre servicios solo porque Feign lo vuelve cómodo.

Eso sería un error.

El hecho de que una herramienta facilite la llamada no significa que toda interacción deba resolverse mediante consumo sincrónico.

En el curso conviene mantener una regla clara:

- usar Feign cuando una dependencia sincrónica tenga sentido de negocio,
- no usarlo para compensar un mal diseño de límites entre servicios.

---

## Qué lugar ocupa frente a WebClient o RestTemplate

OpenFeign no reemplaza conceptualmente todos los escenarios de consumo HTTP posibles.

Pero para el tipo de integración que estamos trabajando en NovaMarket, tiene una gran ventaja:

- expresa mejor el consumo entre microservicios internos del ecosistema.

Mientras `WebClient` o enfoques más manuales pueden ser útiles en otros contextos, Feign resulta especialmente cómodo cuando queremos representar un contrato remoto estable dentro de una arquitectura con Service Discovery.

---

## Relación con el balanceo de carga

Esta clase prepara directamente la siguiente.

Cuando Feign consume a `inventory-service` usando su nombre lógico, deja listo el terreno para que el sistema pueda decidir **qué instancia concreta** atenderá la llamada.

Ahí aparece el siguiente paso natural del recorrido:

- **Spring Cloud LoadBalancer**.

Es decir:

- Eureka nos dice qué instancias existen,
- Feign expresa la intención de consumo,
- el balanceador decidirá cómo repartir llamadas entre instancias disponibles.

---

## Errores y comportamiento remoto

Aunque el cliente sea declarativo, el servicio consumidor necesita seguir pensando qué hacer ante distintos resultados.

Por ejemplo:

- si `inventory-service` responde que no hay stock, `order-service` puede rechazar la orden,
- si responde con un error técnico, el tratamiento será diferente,
- si la llamada tarda demasiado, más adelante necesitaremos timeouts y resiliencia.

Esto muestra otra vez que Feign mejora la interfaz de consumo, pero no reemplaza las decisiones de negocio y operación.

---

## Una mejora fuerte en claridad arquitectónica

Hay un beneficio adicional que conviene destacar.

Cuando un proyecto empieza a crecer, la forma en la que se representan las dependencias internas se vuelve muy importante para mantener el sistema comprensible.

En NovaMarket, declarar explícitamente clientes hacia otros servicios ayuda a que quede claro:

- quién depende de quién,
- para qué,
- y a través de qué contrato.

Ese mapa mental vale mucho cuando más adelante sumemos gateway, seguridad, tracing y mensajería.

---

## Buenas prácticas para usar Feign en el curso

A medida que avancemos, conviene sostener estas reglas:

### 1. Nombrar los clientes de forma explícita
Que el cliente deje claro qué servicio consume.

### 2. Usar DTOs propios de integración
No mezclar entidades internas con contratos remotos sin pensarlo.

### 3. Mantener acotadas las operaciones expuestas
Un cliente Feign no debería convertirse en una puerta a media aplicación remota.

### 4. Diferenciar errores funcionales de errores técnicos
No es lo mismo “no hay stock” que “no se pudo consultar inventario”.

### 5. Preparar el terreno para resiliencia
Toda llamada remota importante debería pensarse luego con métricas, timeouts y fallback cuando el contexto lo justifique.

---

## Cómo queda NovaMarket después de esta clase

Después de incorporar OpenFeign, la arquitectura gana una forma más madura de expresar integraciones sincrónicas.

Ahora podemos pensar que:

- `order-service` ya no consume a `inventory-service` de una manera improvisada o puramente técnica,
- sino a través de un cliente remoto formal, declarativo y alineado con Eureka.

Eso hace que el sistema se vea mucho más coherente y preparado para crecer.

---

## Cierre

OpenFeign nos permite modelar la comunicación REST entre microservicios de una forma mucho más clara y mantenible, especialmente cuando ya contamos con Service Discovery y queremos consumir servicios por nombre lógico.

En NovaMarket, su incorporación mejora directamente una integración clave del sistema: la consulta de stock desde `order-service` hacia `inventory-service` dentro del flujo de creación de órdenes.

No elimina los desafíos del entorno distribuido, pero sí mejora mucho la forma en la que esos desafíos se representan en el código y en la arquitectura.

En la próxima clase vamos a completar este tramo incorporando **Spring Cloud LoadBalancer**, para entender cómo se reparte el tráfico cuando existen varias instancias de un mismo servicio dentro del ecosistema.
