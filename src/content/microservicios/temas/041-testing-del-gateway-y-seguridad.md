---
title: "Testing del Gateway y seguridad"
description: "Cómo probar rutas, filtros y controles de acceso en Spring Cloud Gateway, y por qué estas pruebas son críticas en la arquitectura de NovaMarket."
order: 41
module: "Módulo 10 · Testing en microservicios"
level: "intermedio"
draft: false
---

# Testing del Gateway y seguridad

En una arquitectura con microservicios, el gateway no es un detalle técnico menor.  
Muchas veces es la **puerta real de entrada** al sistema.

En **NovaMarket**, el `api-gateway` concentra varias responsabilidades sensibles:

- recibir tráfico externo,
- enrutar requests,
- aplicar filtros,
- participar en seguridad,
- y, en ciertos casos, propagar identidad hacia servicios internos.

Eso significa que probar el gateway y la seguridad no es opcional.  
Si esta capa falla, el sistema puede quedar roto aunque cada microservicio funcione bien aislado.

---

## Por qué esta capa merece atención especial

Supongamos que:

- `catalog-service` responde bien,
- `order-service` está correcto,
- `inventory-service` funciona,
- y `notification-service` procesa eventos sin problemas.

Aun así, el sistema puede tener errores graves si:

- el gateway envía una ruta al destino incorrecto,
- un filtro altera indebidamente el request,
- un endpoint protegido queda expuesto,
- un token válido es rechazado,
- o un token inválido atraviesa la entrada.

Por eso esta capa necesita pruebas explícitas.

---

## Qué cosas conviene validar en el gateway

En términos generales, el testing del gateway debería cubrir al menos cuatro áreas:

1. **ruteo**  
2. **filtros**  
3. **seguridad de acceso**  
4. **propagación de identidad cuando corresponda**

Cada una protege un tipo de riesgo diferente.

---

## Ruteo

El gateway existe, entre otras cosas, para enrutar tráfico hacia los servicios correctos.

En NovaMarket, eso podría implicar rutas como:

- `/api/products` hacia `catalog-service`,
- `/api/orders` hacia `order-service`,
- endpoints internos protegidos según el diseño.

Una prueba de ruteo debería ayudar a responder preguntas como estas:

- ¿la ruta existe realmente?
- ¿usa el predicado correcto?
- ¿termina en el servicio esperado?
- ¿un cambio de configuración rompió el comportamiento?

Una arquitectura puede verse bien en papel, pero si el ruteo real falla, el sistema no está operativo.

---

## Filtros

Los filtros del gateway suelen encargarse de lógica transversal.

Por ejemplo:

- agregar headers,
- registrar información técnica,
- generar o propagar correlation IDs,
- modificar paths,
- aplicar reglas previas o posteriores a la llamada.

Este tipo de comportamiento también conviene probarlo.

No necesariamente hay que testear cada detalle cosmético, pero sí lo que tenga impacto funcional o de observabilidad.

Por ejemplo:

- que se agregue cierto header relevante,
- que una reescritura de path ocurra como se espera,
- que un filtro no bloquee tráfico legítimo,
- o que se mantenga un identificador útil para rastreo.

---

## Seguridad de acceso

Esta es una de las partes más críticas.

En NovaMarket, el flujo de catálogo podría empezar más abierto, pero la creación de órdenes y otras operaciones sensibles no deberían quedar expuestas sin control.

Por eso el testing tiene que verificar, entre otras cosas:

- que un endpoint protegido rechace requests sin token,
- que un token inválido no otorgue acceso,
- que un token válido permita pasar,
- que roles o scopes se respeten cuando corresponda.

Si esta capa falla, el problema ya no es solo técnico.  
Puede convertirse en un problema funcional o de seguridad muy serio.

---

## Propagación de identidad

En algunos escenarios el gateway no solo valida acceso, sino que además reenvía identidad hacia servicios downstream.

Eso agrega otra frontera crítica.

Conviene probar que:

- el token llegue cuando deba llegar,
- no se pierda información necesaria,
- no se reenvíe identidad incorrecta,
- y los servicios internos reciban el contexto esperado.

En un sistema real, una mala propagación puede romper autorización, auditoría o trazabilidad de acciones.

---

## Cómo se ve esto en NovaMarket

Pensemos en el caso de uso principal del curso:

**consultar catálogo → crear orden → validar stock → registrar orden → publicar evento → notificar**

Desde el punto de vista del acceso, el gateway debería sostener reglas como estas:

- consultar productos puede ser público o parcialmente abierto según el diseño del tramo del curso,
- crear órdenes debe requerir autenticación,
- ciertas rutas internas o administrativas no deberían estar expuestas libremente,
- y la identidad del usuario debe mantenerse donde resulte necesaria.

Todo eso merece pruebas.

---

## Qué escenarios conviene cubrir

Un conjunto útil de escenarios para esta capa podría incluir:

### Escenario 1: ruta pública válida
El gateway reenvía correctamente una consulta permitida.

### Escenario 2: ruta protegida sin token
La request se bloquea.

### Escenario 3: ruta protegida con token inválido
La request se rechaza.

### Escenario 4: ruta protegida con token válido
La request avanza correctamente.

### Escenario 5: filtro técnico esperado
Se mantiene o agrega información útil, como un header o correlation ID.

### Escenario 6: propagación hacia downstream
La identidad llega correctamente al servicio de destino cuando el diseño lo requiere.

---

## Qué riesgo evita cada grupo de pruebas

Estas pruebas no son redundantes entre sí.

- Las de ruteo evitan errores de configuración y direccionamiento.
- Las de filtros evitan errores en lógica transversal.
- Las de seguridad evitan accesos indebidos o bloqueos incorrectos.
- Las de propagación evitan inconsistencias entre autenticación en gateway y comportamiento interno.

En conjunto, ayudan a validar el punto de entrada real del sistema.

---

## El gateway como contrato operativo

Hay una idea importante acá:

aunque el dominio principal del negocio viva en los microservicios internos, para muchos consumidores externos **el gateway es el sistema**.

Eso significa que cualquier error en esta capa tiene mucha visibilidad y mucho impacto.

Por eso no alcanza con asumir que “si los servicios andan, el gateway también”.

El gateway merece su propia batería de verificación.

---

## Qué no conviene hacer

Al igual que en otras partes del testing, conviene evitar extremos.

### Error 1: no probar casi nada
Eso deja expuesta una frontera muy sensible.

### Error 2: probar detalles irrelevantes
No hace falta inmovilizar cada byte de configuración si no tiene valor funcional.

### Error 3: confiar solo en pruebas manuales
Pueden ayudar a explorar, pero no deberían ser la única defensa frente a regresiones.

Lo importante es defender el comportamiento significativo.

---

## Relación con el resto del curso

Esta clase conecta muchos temas previos:

- gateway,
- filtros,
- seguridad distribuida,
- OAuth2,
- JWT,
- propagación de token,
- y observabilidad.

También refuerza la idea de que una arquitectura profesional no se evalúa solo por lo bien que se construye, sino también por lo bien que se valida.

---

## Qué aporta al proyecto práctico

NovaMarket no quiere ser solo una suma de microservicios técnicos.  
Quiere parecerse a un sistema real.

Y en un sistema real, el punto de entrada, las políticas de acceso y la lógica transversal del gateway son demasiado importantes como para dejarlas sin pruebas específicas.

Este bloque ayuda a cerrar el módulo de testing con una mirada bastante completa:

- lógica interna,
- integración entre servicios,
- y validación del acceso real a la arquitectura.

---

## Una idea práctica para llevarse

Cuando existe un gateway, la pregunta no es solo:

**“¿Mis servicios funcionan?”**

La pregunta más realista es:

**“¿El sistema es accesible, enrutable y seguro desde su punto de entrada real?”**

Ese es el valor del testing del gateway y la seguridad.

---

## Cierre

Probar el gateway y la seguridad significa defender la frontera más visible y más sensible de la arquitectura.

En NovaMarket, esta capa decide cómo entran las requests, cómo se enrutan, qué filtros se aplican y quién puede acceder a operaciones críticas como la creación de órdenes.

Por eso conviene cubrir de forma explícita:

- ruteo,
- filtros,
- control de acceso,
- y propagación de identidad.

En la próxima clase vamos a cerrar el módulo viendo cómo trabajar con **ambientes de prueba usando Docker Compose o Testcontainers**, para acercarnos todavía más a una validación realista del sistema distribuido.
