---
title: "Testing de microservicios y clientes Feign"
description: "Cómo probar microservicios que consumen otros servicios por HTTP, qué conviene validar en clientes Feign y cómo aplicar estas pruebas en NovaMarket."
order: 40
module: "Módulo 10 · Testing en microservicios"
level: "intermedio"
draft: false
---

# Testing de microservicios y clientes Feign

Cuando un microservicio depende de otro para completar una operación, los tests empiezan a jugar un papel todavía más importante.

En **NovaMarket**, `order-service` necesita consultar a `inventory-service` antes de confirmar la creación de una orden.  
En el curso, esa integración se apoya en un cliente **OpenFeign**.

Eso nos deja frente a una pregunta clave:

**¿cómo probamos un servicio que no trabaja solo, sino que depende de respuestas remotas?**

En esta clase vamos a ver cómo pensar el testing de microservicios que consumen otros servicios por HTTP, y en particular cómo cubrir correctamente el comportamiento de clientes Feign.

---

## Qué cambia cuando un servicio consume a otro

Si `order-service` tuviera toda la lógica dentro de sí mismo, muchas pruebas serían locales.

Pero como depende de `inventory-service`, aparecen nuevas fuentes de riesgo:

- la llamada puede apuntar al endpoint equivocado,
- el contrato puede no coincidir,
- la respuesta puede venir con un formato inesperado,
- el error remoto puede interpretarse mal,
- el timeout puede alterar el comportamiento,
- o el cliente puede estar mal configurado.

Eso hace que el testing ya no pueda enfocarse solo en la lógica de negocio interna.

---

## Qué partes conviene probar

Cuando existe un cliente Feign, suele ser útil distinguir al menos tres cosas:

1. la lógica del servicio que usa ese cliente,
2. el contrato esperado de la integración,
3. el comportamiento ante distintos tipos de respuesta.

En NovaMarket, por ejemplo, conviene cubrir:

- qué hace `order-service` si el stock alcanza,
- qué hace si el stock no alcanza,
- qué hace si el servicio remoto responde con error,
- qué hace si la respuesta no tiene la forma esperada,
- y cómo se comporta la capa que invoca a Feign.

---

## Primer nivel: probar la lógica sin dependencia real

Una primera capa razonable es probar la lógica del servicio simulando el comportamiento del cliente Feign.

Por ejemplo, si existe una clase de aplicación que depende de un `InventoryClient`, se puede simular:

- respuesta con stock suficiente,
- respuesta con stock insuficiente,
- error de integración,
- excepción de negocio.

La ventaja de este nivel es que permite validar decisiones importantes de `order-service` sin necesidad de levantar realmente `inventory-service`.

Esto es muy útil para comprobar:

- cambios de estado,
- validaciones,
- armado de respuestas,
- y decisiones de flujo.

---

## Qué limitación tiene esa capa

Aunque esta capa es valiosa, no alcanza para verificar todo.

¿Por qué?

Porque una simulación puede comportarse como nosotros queramos, pero no necesariamente como se comporta la integración real.

Podemos testear que `order-service` reacciona bien a cierto objeto de respuesta.  
Pero todavía no estamos validando que la llamada HTTP real coincida con el contrato verdadero.

Ahí entra un segundo nivel.

---

## Segundo nivel: validar la integración HTTP

Acá ya importa que el cliente realmente “hable” como debe.

Cuando se testea un cliente Feign, conviene validar cosas como:

- ruta esperada,
- método HTTP correcto,
- estructura del request,
- forma del response,
- headers relevantes,
- mapeo de errores.

En el caso de NovaMarket, esto podría implicar validar que `order-service` invoque correctamente una operación de chequeo de stock en `inventory-service`.

Este tipo de prueba no necesariamente exige levantar todo el ecosistema, pero sí conviene acercarse más al contrato real.

---

## Qué riesgo estamos reduciendo acá

Este tipo de testing reduce errores del estilo:

- el endpoint cambió y nadie actualizó el cliente,
- el cuerpo del request ya no coincide,
- el response tiene otro formato,
- el código asume un campo que ya no existe,
- un 404 o 500 remoto se interpreta como otra cosa.

Son errores muy típicos en integraciones entre microservicios.

---

## Cómo se ve esto en el flujo de NovaMarket

Pensemos en el caso central del curso.

Cuando un usuario crea una orden:

1. `order-service` recibe `POST /orders`,
2. arma una solicitud de validación de stock,
3. usa un cliente Feign para consultar a `inventory-service`,
4. recibe una respuesta,
5. decide si crear o rechazar la orden.

Ese flujo puede fallar en varios lugares.

Por eso conviene probar al menos estas variantes:

- stock disponible,
- stock insuficiente,
- error remoto,
- respuesta inesperada,
- y excepción de integración.

---

## Qué conviene probar exactamente del lado del servicio consumidor

En `order-service`, el foco no debería ser solo “si Feign respondió algo”.

Lo importante es verificar qué hace la lógica de negocio con esa respuesta.

Por ejemplo:

### Caso 1: stock suficiente
Se crea la orden y se devuelve una respuesta exitosa.

### Caso 2: stock insuficiente
La orden se rechaza o se devuelve un error de negocio controlado.

### Caso 3: error técnico en inventario
Puede devolverse un error temporal o activarse otra política definida por el diseño.

### Caso 4: respuesta inconsistente
Conviene que el servicio falle de forma clara y no siga como si nada.

---

## La importancia del contrato implícito

Aunque dos microservicios no compartan base de datos ni código completo, sí comparten algo muy sensible:

**el contrato de integración.**

Ese contrato incluye:

- shape del request,
- shape del response,
- semántica de errores,
- campos obligatorios,
- estados posibles.

Si ese contrato se rompe, la integración también.

Por eso el testing de clientes Feign ayuda a defender una frontera crítica del sistema.

---

## Qué no conviene hacer

Un error frecuente es construir pruebas demasiado acopladas a detalles internos de Feign o demasiado frágiles.

Por ejemplo, tests que dependen de:

- detalles irrelevantes de implementación,
- formatos accidentales,
- o comportamientos tan específicos que cualquier refactor menor los rompe.

La prueba tiene que defender el comportamiento importante, no inmovilizar innecesariamente el diseño.

---

## Pensar en fallas explícitamente

En integraciones entre microservicios, los tests más valiosos muchas veces no son los del camino feliz, sino los que validan reacciones ante problemas reales.

En NovaMarket, eso puede incluir:

- `inventory-service` no disponible,
- error 5xx,
- respuesta vacía,
- timeout,
- o datos incompletos.

Esto conecta directamente con lo que el curso ya vio en resiliencia:  
las fallas distribuidas no son excepciones rarísimas, sino parte del contexto normal de diseño.

---

## Qué aporta esta clase al curso práctico

Este tema es importante porque sostiene la credibilidad del proyecto.

No queremos que NovaMarket sea solo un conjunto de servicios que “parecen andar” cuando todo sale bien.

Queremos que el alumno vea cómo defender técnicamente integraciones críticas, especialmente en el flujo central de creación de órdenes.

Eso hace que el curso siga siendo práctico en un sentido más profesional: no solo construir, sino **verificar**.

---

## Un enfoque razonable para el módulo

Una estrategia didáctica saludable para este punto sería:

1. probar lógica de negocio del consumidor simulando el cliente,
2. validar contrato de la integración,
3. cubrir errores remotos relevantes,
4. evitar tests excesivamente acoplados a detalles sin valor,
5. reforzar el flujo principal del negocio.

Ese orden ayuda a que el testing no se vuelva ni superficial ni artificialmente complejo.

---

## Una idea práctica para llevarse

Cuando un microservicio consume a otro, la pregunta no es solo:

**“¿Funciona mi lógica?”**

La pregunta completa es:

**“¿Funciona mi lógica con el contrato remoto que espero, y qué pasa cuando ese contrato responde distinto o falla?”**

Esa es la pregunta que justifica el testing de integraciones con Feign.

---

## Cierre

El testing de microservicios que usan clientes Feign no debería limitarse a verificar que “se llamó algo por HTTP”.  
Lo importante es cubrir la frontera entre servicios y validar qué hace el sistema ante respuestas correctas, errores de negocio y fallas técnicas.

En NovaMarket, este punto es especialmente sensible porque `order-service` depende de `inventory-service` para tomar una decisión central del negocio: si una orden puede o no crearse.

En la próxima clase vamos a movernos a otra frontera todavía más visible del sistema: **el gateway y la seguridad**, donde se decide buena parte del acceso real a la arquitectura.
