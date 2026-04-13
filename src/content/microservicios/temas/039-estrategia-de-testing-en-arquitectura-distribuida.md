---
title: "Estrategia de testing en arquitectura distribuida"
description: "Cómo pensar una estrategia de testing realista en microservicios, qué conviene probar en cada nivel y cómo aplicar ese enfoque en NovaMarket."
order: 39
module: "Módulo 10 · Testing en microservicios"
level: "intermedio"
draft: false
---

# Estrategia de testing en arquitectura distribuida

A medida que un sistema crece y se distribuye en varios microservicios, probarlo bien deja de ser una cuestión de “agregar algunos unit tests”.

En una arquitectura como **NovaMarket**, donde existen varios servicios, llamadas HTTP, mensajería, seguridad y estados distribuidos, el testing necesita pensarse como una estrategia y no como una colección aislada de pruebas.

Ese es el objetivo de esta clase: entender **qué conviene probar, en qué nivel y con qué propósito**, para no caer ni en un exceso de confianza ni en una batería de tests costosa y poco útil.

---

## Por qué el testing en microservicios cambia tanto

En un sistema monolítico simple, muchas veces es relativamente directo seguir una operación completa dentro de un mismo proceso.

En microservicios, en cambio, una sola funcionalidad puede implicar:

- una request que entra por el gateway,
- una validación de seguridad,
- una llamada a otro servicio,
- persistencia local,
- publicación de eventos,
- consumo asincrónico,
- y cambios de estado distribuidos.

Eso significa que una falla puede aparecer en varios puntos diferentes, y que distintos tipos de pruebas sirven para detectar distintos problemas.

---

## El error de pensar que un solo tipo de test alcanza

Un error frecuente es apoyarse demasiado en un único nivel de testing.

### Caso 1: solo unit tests
Sirven mucho, pero no detectan bien errores de integración, configuración, wiring o contratos entre servicios.

### Caso 2: solo pruebas end to end
Dan mucha cobertura funcional, pero suelen ser más lentas, más costosas de mantener y más difíciles de diagnosticar cuando algo falla.

### Caso 3: solo pruebas manuales
Pueden servir para explorar, pero no son una base confiable para evolucionar el sistema.

Una estrategia sana combina niveles.

---

## Qué niveles de prueba conviene pensar

Una forma pragmática de organizar el testing en NovaMarket es pensar al menos estos niveles:

- pruebas unitarias,
- pruebas de integración del microservicio,
- pruebas de integración entre servicios,
- pruebas del gateway y seguridad,
- pruebas del flujo más cercano a producción.

No siempre todos los niveles tienen la misma cantidad de tests.  
Lo importante es que cada uno cubra un tipo de riesgo distinto.

---

## Pruebas unitarias

Las pruebas unitarias son útiles para validar lógica de negocio aislada.

En NovaMarket podrían servir para verificar cosas como:

- cálculo del total de una orden,
- validaciones sobre estados permitidos,
- decisiones de negocio simples,
- mapeos o transformaciones.

Su fortaleza es que:

- son rápidas,
- dan feedback inmediato,
- ayudan a detectar errores lógicos,
- y suelen ser fáciles de ejecutar constantemente.

Pero tienen un límite claro:

**no prueban la arquitectura distribuida real.**

---

## Pruebas de integración del microservicio

Acá ya se prueba una porción más real del servicio:

- controlador,
- capa de aplicación,
- persistencia,
- validaciones,
- configuración básica,
- y en algunos casos seguridad local.

Por ejemplo, en `order-service` podría verificarse que:

- `POST /orders` rechaza requests inválidas,
- persiste correctamente una orden válida,
- devuelve el estado esperado,
- y maneja ciertos errores con el formato correcto.

Este nivel ya detecta muchos problemas que un unit test no ve.

---

## Pruebas de integración entre servicios

En microservicios, este nivel gana mucha importancia.

No alcanza con que cada servicio funcione aislado si después:

- la llamada HTTP está mal construida,
- el contrato entre servicios no coincide,
- la URL o el nombre lógico es incorrecto,
- la respuesta esperada cambió,
- o un cliente Feign interpreta mal un error.

En NovaMarket, una prueba de este tipo podría validar que `order-service` consulta correctamente a `inventory-service` para verificar disponibilidad.

---

## Pruebas del gateway y de seguridad

Este nivel merece atención especial porque el gateway se transforma en la entrada principal al sistema.

Conviene probar, entre otras cosas:

- que una ruta realmente reenvíe al servicio correcto,
- que los filtros se ejecuten como se espera,
- que los endpoints protegidos no sean accesibles sin token,
- que los tokens válidos sí atraviesen el gateway,
- y que la propagación del token se haga correctamente cuando corresponda.

Si esto falla, la arquitectura puede parecer sana por dentro, pero quedar rota en el punto de entrada real.

---

## Pruebas cercanas a producción

También conviene reservar un nivel para ejecutar pruebas con más realismo operativo.

Eso puede incluir:

- varios servicios levantados juntos,
- una base real o muy parecida,
- un broker,
- configuración externa,
- y seguridad activa.

Estas pruebas no deberían reemplazar todo lo demás.  
Pero sí ayudan a detectar fallos que recién aparecen cuando el sistema se parece de verdad a su forma de ejecución real.

---

## Cómo aplicar esto a NovaMarket

Pensemos en el flujo central del curso:

**consultar catálogo → crear orden → validar stock → registrar orden → publicar evento → notificar**

Ese flujo puede descomponerse en distintos niveles de prueba.

### Nivel unitario
- cálculo de total de la orden,
- validación de estados,
- lógica de armado del evento.

### Nivel integración por servicio
- alta de orden,
- persistencia de productos,
- exposición de endpoints de inventario.

### Nivel integración entre servicios
- `order-service` consumiendo `inventory-service`,
- `notification-service` reaccionando a mensajes.

### Nivel gateway y seguridad
- acceso autenticado a `/api/orders`,
- bloqueo sin token,
- ruteo correcto a servicios internos.

### Nivel entorno integrado
- flujo casi completo con varios componentes reales.

---

## No todo necesita el mismo esfuerzo

Otra idea importante: una buena estrategia de testing no consiste en probarlo todo igual de fuerte.

Conviene priorizar según riesgo.

Por ejemplo, en NovaMarket probablemente tenga más sentido reforzar:

- creación de órdenes,
- validación de stock,
- propagación de token,
- publicación y consumo de eventos,
- estados de error importantes.

En cambio, un endpoint muy simple de lectura puede no necesitar el mismo nivel de cobertura sofisticada.

---

## Qué riesgos queremos cubrir de verdad

Una estrategia útil parte de riesgos concretos.

En este curso, algunos riesgos típicos serían:

- que una orden se cree con datos inválidos,
- que `order-service` interprete mal la respuesta de inventario,
- que una ruta del gateway quede mal definida,
- que un endpoint protegido quede expuesto,
- que un evento no se procese como se espera,
- que una integración falle por diferencias de contrato.

Cuando se piensa así, el testing deja de ser una obligación formal y pasa a ser una herramienta de reducción de riesgo.

---

## El costo de probar mal

Probar poco es peligroso, pero probar mal también.

Algunos síntomas de una mala estrategia:

- tests frágiles que fallan por detalles irrelevantes,
- pruebas lentísimas que nadie quiere ejecutar,
- solapamiento excesivo entre niveles,
- tests que dependen de demasiadas cosas al mismo tiempo,
- dificultad para entender por qué falló una prueba.

La idea no es solo tener tests.  
La idea es que el sistema pueda evolucionar con confianza.

---

## Un enfoque pragmático para el curso

Para NovaMarket conviene pensar una estrategia de testing escalonada:

1. lógica local bien probada,
2. endpoints importantes integrados dentro de cada servicio,
3. integraciones críticas entre servicios cubiertas,
4. gateway y seguridad verificados explícitamente,
5. pruebas más cercanas a producción reservadas para flujos importantes.

Ese equilibrio suele dar muy buenos resultados pedagógicos y técnicos.

---

## Qué relación tiene esto con la arquitectura

El testing también obliga a mirar la calidad del diseño.

Si una parte del sistema es casi imposible de probar, a veces eso dice algo sobre su arquitectura:

- demasiado acoplamiento,
- dependencias mal separadas,
- demasiada lógica en lugares difíciles de aislar,
- contratos poco claros.

Por eso testear no solo valida el sistema.  
También lo expone.

---

## Una idea práctica para llevarse

En una arquitectura distribuida, la pregunta no es:

**“¿Cuántos tests tengo?”**

La pregunta más útil es:

**“¿Qué riesgos cubre cada tipo de prueba y qué parte del sistema estoy dejando sin validar?”**

Ese cambio de enfoque mejora mucho la calidad del testing.

---

## Cierre

En microservicios, el testing necesita pensarse en capas y con intención.  
No alcanza con una sola clase de prueba ni conviene intentar resolver todo con el nivel más costoso.

En NovaMarket, una estrategia razonable combina:

- pruebas unitarias,
- pruebas de integración por servicio,
- validación entre servicios,
- pruebas del gateway y seguridad,
- y escenarios más cercanos a producción para flujos críticos.

Con esta base ya podemos entrar a temas más concretos del módulo.  
En la próxima clase vamos a enfocarnos en el testing de microservicios y clientes **Feign**, donde aparece uno de los puntos más delicados de la integración sincrónica.
