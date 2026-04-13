---
title: "Configuración de Spring Cloud Gateway"
description: "Cómo incorporar Spring Cloud Gateway a NovaMarket, definir rutas hacia microservicios internos y convertirlo en el punto de entrada único del sistema."
order: 14
module: "Módulo 4 · API Gateway"
level: "base"
draft: false
---

# Configuración de Spring Cloud Gateway

En la clase anterior vimos por qué una arquitectura de microservicios suele necesitar un **API Gateway**.

También vimos que en NovaMarket ya no tiene demasiado sentido seguir exponiendo cada microservicio directamente hacia clientes externos.

Ahora toca dar el siguiente paso:

**incorporar Spring Cloud Gateway como punto de entrada único del sistema**.

La idea de esta clase no es centrarse todavía en seguridad avanzada ni en filtros complejos. Primero necesitamos construir una base clara:

- levantar el gateway,
- conectarlo con la arquitectura existente,
- definir rutas,
- y hacer que los clientes externos empiecen a entrar por ahí.

---

## Qué es Spring Cloud Gateway dentro del ecosistema del curso

`Spring Cloud Gateway` es la solución de gateway del ecosistema Spring Cloud para enrutar tráfico hacia servicios internos y aplicar comportamientos transversales.

En NovaMarket, su rol será:

- recibir requests externas,
- resolver a qué servicio deben dirigirse,
- integrarse con discovery,
- y convertirse en la puerta principal del sistema.

Esto lo transforma en una pieza central de la arquitectura.

---

## La nueva posición del gateway en NovaMarket

Antes de incorporarlo, un cliente externo podría interactuar más o menos así:

- cliente → `catalog-service`
- cliente → `order-service`
- cliente → `inventory-service`

Después de incorporar el gateway, la forma de acceso deseada pasa a ser:

- cliente → `api-gateway` → `catalog-service`
- cliente → `api-gateway` → `order-service`
- cliente → `api-gateway` → `inventory-service`

Con esto logramos una diferencia importante:

los clientes dejan de hablar con el sistema interno como si fuera una colección suelta de puertos y servicios independientes.

---

## Primer objetivo práctico

En esta etapa, el objetivo es simple y muy valioso:

### Exponer una API de entrada uniforme
Por ejemplo:

- `GET /api/products`
- `GET /api/products/{id}`
- `POST /api/orders`
- `GET /api/orders/{id}`

Aunque internamente esos endpoints pertenezcan a distintos servicios.

Esto ya mejora mucho la arquitectura desde el punto de vista del consumidor.

---

## Cómo piensa el gateway una request

Cuando llega una request, el gateway necesita responder preguntas como estas:

- ¿qué ruta llegó?
- ¿coincide con alguna regla configurada?
- ¿a qué servicio interno hay que mandarla?
- ¿hay que reescribir el path?
- ¿hay que agregar o transformar headers?
- ¿hay que aplicar filtros antes o después?

En esta clase nos concentramos sobre todo en las dos primeras capas:

- **matching de rutas**
- **routing hacia microservicios**

---

## Definir rutas es definir contratos de entrada

Una ruta en el gateway no es solo una regla técnica. También representa una decisión de diseño.

Por ejemplo, si decidimos que el catálogo se expone como:

```text
/api/products/**
```

estamos diciendo que para el exterior el acceso al catálogo tiene esa forma, aunque internamente el servicio real exponga otras rutas o tenga otra organización.

Eso es importante porque el gateway nos da una oportunidad para diseñar una API pública más coherente que la estructura interna de cada servicio.

---

## Integración con Eureka

Como ya venimos trabajando con discovery, el gateway idealmente no debería depender de URLs fijas para enrutar.

En una arquitectura más madura, el gateway también puede trabajar con nombres lógicos de servicio, igual que lo hacen otros clientes internos.

Eso significa que:

- el gateway descubre servicios registrados,
- resuelve sus instancias disponibles,
- y dirige tráfico sin tener que atarse a hosts y puertos concretos.

Esta integración es muy valiosa porque mantiene coherencia con el resto del sistema.

---

## Ejemplo conceptual de rutas en NovaMarket

Podemos pensar un diseño inicial como este.

### Rutas hacia catálogo
- `/api/products/**` → `catalog-service`

### Rutas hacia órdenes
- `/api/orders/**` → `order-service`

### Rutas administrativas de inventario
- `/api/inventory/**` → `inventory-service`

Todavía no estamos hablando de qué rutas deben ser públicas o protegidas; eso lo vamos a trabajar más adelante en seguridad.

Acá el foco es más básico:

**que el gateway se convierta en la entrada organizada del sistema**.

---

## Paths externos y paths internos

Una ventaja del gateway es que los paths que ve el cliente no tienen por qué coincidir exactamente con los paths internos del servicio.

Por ejemplo, podríamos decidir que externamente exista:

```text
/api/products
```

pero internamente `catalog-service` podría manejar:

```text
/products
```

El gateway puede encargarse de adaptar esa diferencia.

Eso permite:

- diseñar una API pública consistente,
- desacoplarla de detalles internos,
- y reorganizar el backend con menos impacto hacia afuera.

---

## Qué conviene evitar al definir rutas

### Exponer sin criterio la estructura interna
El gateway no debería limitarse a copiar todos los paths internos tal como están.

### Mezclar criterios distintos en cada servicio
Si una ruta empieza con `/api/products`, otra con `/orders-api` y otra con `/inventory-service/v1/internal`, la API externa queda desordenada.

### Sobrecargar el gateway con lógica de negocio
La ruta define acceso y enrutamiento, no reglas complejas del dominio.

---

## Un cambio importante en la forma de pensar clientes externos

Cuando todavía no hay gateway, el consumidor externo suele trabajar con una lógica como esta:

- “para productos uso este puerto”
- “para órdenes uso este otro”
- “para inventario, otro distinto”

Cuando incorporamos el gateway, la lógica cambia:

- “todo entra por la misma puerta”

Eso simplifica muchísimo el consumo.

Además, prepara el terreno para algo que después va a ser fundamental:

**centralizar seguridad de entrada**.

---

## Cómo impacta esto en el flujo principal

Volvamos al caso de uso central del curso:

**consultar catálogo → crear orden → validar stock → registrar orden → publicar evento → notificar**

Desde el punto de vista del consumidor externo, las primeras acciones del flujo pasan ahora por el gateway:

### Consulta de catálogo
```text
GET /api/products
```

### Creación de orden
```text
POST /api/orders
```

El cliente ya no necesita conocer directamente a `catalog-service` ni a `order-service`.

Esa es una mejora arquitectónica concreta y visible.

---

## Qué cosas todavía no estamos resolviendo del todo

En esta etapa, el gateway ya puede enrutar. Pero todavía faltan varias capacidades que irán apareciendo en clases posteriores.

Por ejemplo:

- filtros personalizados,
- logging más rico,
- correlation IDs,
- autenticación y autorización,
- propagación de token,
- políticas transversales más finas.

Es importante no querer resolver todo junto.

Primero hacemos que el gateway **exista y enrute bien**.
Después lo volvemos una pieza más sofisticada.

---

## Un primer diseño razonable para NovaMarket

Si pensamos en una primera versión bien didáctica, podríamos tomar esta idea:

### `api-gateway`
Responsable de:

- escuchar requests externas,
- definir rutas por prefijo,
- usar discovery para encontrar servicios,
- actuar como entrada única al sistema.

### `catalog-service`
Sigue siendo dueño del catálogo.

### `order-service`
Sigue siendo dueño de las órdenes.

### `inventory-service`
Sigue siendo dueño del inventario.

El gateway no les roba responsabilidad: solo ordena la entrada.

---

## Qué se gana incluso antes de agregar seguridad

A veces se asocia el gateway solo con autenticación, pero su valor aparece mucho antes.

Incluso sin seguridad avanzada, ya mejora:

- el diseño externo de la API,
- el encapsulamiento de la topología interna,
- la mantenibilidad,
- la consistencia de entrada,
- y la posibilidad de agregar políticas transversales después.

Por eso conviene incorporarlo antes de entrar de lleno en seguridad.

---

## Errores comunes al empezar con un gateway

### Pensar que el gateway reemplaza a los servicios
No. Los servicios siguen haciendo el trabajo de negocio.

### Usarlo solo como proxy sin criterio de diseño
Si solo reenviamos todo sin pensar rutas ni contratos externos, desaprovechamos gran parte de su valor.

### Intentar meter toda la seguridad y toda la observabilidad de una vez
Eso suele volver la adopción más confusa.

### Seguir exponiendo todos los servicios por afuera igual que antes
Si el gateway existe pero los clientes siguen entrando directo a cada microservicio, la arquitectura no aprovecha de verdad la nueva pieza.

---

## Cómo se conecta con las próximas clases

Una vez que el gateway ya está en la arquitectura, se vuelve natural avanzar sobre:

- filtros,
- logging transversal,
- seguridad con OAuth2,
- gateway como cliente y como resource server,
- propagación de tokens hacia los servicios internos.

Es decir: esta clase prepara el terreno para casi todo lo importante que viene después en el módulo de gateway y seguridad.

---

## Cierre

Configurar **Spring Cloud Gateway** en NovaMarket implica convertirlo en el punto de entrada único del sistema y definir rutas claras hacia los microservicios internos.

La idea central de esta clase es entender que el gateway no es solamente un “router HTTP”, sino una capa que ayuda a:

- desacoplar a los clientes de la topología interna,
- ordenar la API pública,
- y preparar la arquitectura para seguridad y políticas transversales.

A partir de este punto, NovaMarket deja de exponer sus servicios hacia afuera como piezas sueltas y empieza a presentarse como un sistema más coherente desde su entrada.

En la próxima clase vamos a profundizar en los **filters** del gateway y en cómo empezar a aplicar lógica transversal antes y después del enrutamiento.
