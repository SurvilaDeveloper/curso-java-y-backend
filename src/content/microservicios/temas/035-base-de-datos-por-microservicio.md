---
title: "Base de datos por microservicio"
description: "Por qué en una arquitectura de microservicios conviene que cada servicio sea dueño de sus datos y qué problemas aparecen cuando varios servicios comparten la misma base."
order: 35
module: "Módulo 9 · Datos distribuidos y consistencia"
level: "intermedio"
draft: false
---

# Base de datos por microservicio

Una de las decisiones más importantes en una arquitectura de microservicios no tiene que ver con HTTP, con mensajería ni con discovery. Tiene que ver con los datos.

Muchas implementaciones parecen distribuir la lógica, pero siguen manteniendo una base de datos única y compartida entre todos los servicios. A primera vista eso puede parecer práctico. Permite hacer consultas cómodas, joins directos y acceso inmediato a cualquier tabla.

El problema es que esa comodidad suele venir acompañada de un costo arquitectónico muy alto.

En un sistema de microservicios, una idea central es que **cada servicio sea dueño de sus datos**. No porque sea una regla estética, sino porque los datos definen gran parte de la autonomía real de un servicio.

En NovaMarket, esta decisión impacta directamente en cómo se separan `catalog-service`, `inventory-service`, `order-service` y `notification-service`.

---

## Qué significa “base por microservicio”

No significa necesariamente una máquina física distinta para cada servicio.

Tampoco significa que todas las tecnologías de persistencia tengan que ser diferentes.

La idea principal es esta:

- cada servicio controla su propio modelo de datos,
- decide cómo persiste su información,
- evoluciona su esquema sin depender de otros servicios,
- y ningún otro servicio modifica directamente sus tablas.

En otras palabras, el dato forma parte del límite del servicio.

---

## Por qué esta idea es tan importante

Si dos o más servicios comparten las mismas tablas y escriben sobre ellas libremente, la separación entre servicios empieza a ser solo superficial.

Puede haber procesos distintos, repositorios distintos o endpoints distintos, pero el verdadero acoplamiento sigue viviendo en la base.

Eso genera varios problemas:

- cambios de esquema con impacto cruzado,
- dependencia fuerte entre servicios,
- dificultad para evolucionar el modelo,
- reglas de negocio repartidas en varios lugares,
- y pérdida de autonomía real.

---

## Ejemplo simple en NovaMarket

Supongamos que NovaMarket tiene estos servicios:

- `catalog-service`
- `inventory-service`
- `order-service`

### Enfoque equivocado

Todos comparten la misma base y acceden a tablas como:

- `products`
- `inventory`
- `orders`
- `order_items`

Entonces podría pasar que:

- `order-service` lea directamente la tabla de inventario,
- `inventory-service` modifique información de productos,
- `catalog-service` consulte pedidos para armar reportes,
- y cualquier cambio estructural afecte a varios servicios al mismo tiempo.

En ese escenario, el sistema parece distribuido por fuera, pero sigue siendo un monolito de datos por dentro.

---

## Qué cambia cuando cada servicio es dueño de sus datos

Con una separación más sana, el mapa sería algo así:

### `catalog-service`
Es dueño de los datos del catálogo.

Ejemplo:

- `products`

### `inventory-service`
Es dueño de los datos de inventario.

Ejemplo:

- `inventory_items`
- `stock_movements`

### `order-service`
Es dueño de las órdenes.

Ejemplo:

- `orders`
- `order_items`

### `notification-service`
Es dueño de sus registros de notificación.

Ejemplo:

- `notification_log`

Cada servicio expone lo que los demás necesitan a través de contratos, no mediante acceso directo a tablas ajenas.

---

## Beneficio 1: autonomía de evolución

Cuando un servicio es dueño de sus datos, puede evolucionar su esquema con más independencia.

Por ejemplo, `order-service` podría:

- agregar un nuevo campo de estado,
- dividir una tabla,
- crear tablas auxiliares,
- cambiar restricciones internas,
- o ajustar índices para su patrón de acceso,

sin obligar a que otros servicios reescriban directamente sus consultas SQL.

Esto hace que el despliegue y la evolución sean mucho más manejables.

---

## Beneficio 2: límites más claros de responsabilidad

La propiedad de los datos obliga a pensar con más claridad qué pertenece a cada servicio.

Por ejemplo:

- el precio visible del producto pertenece al catálogo,
- la cantidad disponible pertenece al inventario,
- la orden pertenece al dominio de pedidos,
- las notificaciones pertenecen al servicio de notificación.

Eso ayuda a que la arquitectura no se desdibuje con el tiempo.

---

## Beneficio 3: menor acoplamiento técnico

Si un servicio no puede tocar directamente la base de otro, tiene que integrarse a través de una API o un evento.

Eso puede parecer menos cómodo al principio, pero obliga a crear contratos explícitos.

Y los contratos explícitos son mucho más sanos que las dependencias ocultas en SQL cruzado.

---

## El costo: aparecen nuevos desafíos

Separar bases no es gratis.

Cuando cada servicio es dueño de sus datos, aparecen problemas reales que antes quedaban escondidos:

- no se puede hacer join directo entre todo,
- algunas vistas del negocio requieren composición,
- la consistencia global se vuelve más compleja,
- surgen duplicaciones controladas de información,
- y empieza a aparecer la necesidad de eventos, caches o modelos de lectura separados.

Eso no significa que la estrategia sea peor. Significa que deja a la vista la complejidad real del sistema distribuido.

---

## Por qué compartir una base parece tan tentador

Porque da una falsa sensación de simplicidad.

Con una base única, parece más fácil:

- consultar cualquier cosa,
- hacer reportes rápidos,
- cruzar datos con SQL,
- resolver dependencias “por debajo”,
- o arreglar un problema leyendo tablas ajenas.

Pero esa comodidad suele pagarla el sistema más adelante con:

- despliegues más inseguros,
- migraciones más delicadas,
- servicios menos autónomos,
- y equipos que no pueden evolucionar de forma independiente.

---

## Un servicio no debería escribir datos de otro

Este punto es central.

Una cosa es que un servicio consulte información necesaria a través de un contrato. Otra muy distinta es que escriba directamente en tablas ajenas.

Si `order-service` descuenta stock escribiendo sobre tablas internas de `inventory-service`, entonces:

- el inventario dejó de ser dueño de su lógica,
- la regla de negocio se repartió,
- y cualquier cambio interno puede romper consumidores invisibles.

En una arquitectura bien separada, `order-service` debería pedir o emitir algo, y `inventory-service` decidir cómo reflejarlo en sus propios datos.

---

## Ejemplo concreto en NovaMarket

Supongamos que llega una solicitud de creación de orden.

### Enfoque acoplado

`order-service`:

- crea la orden,
- descuenta stock directamente en la tabla de inventario,
- consulta productos desde tablas del catálogo,
- y guarda todo en una única transacción distribuida de facto sobre la misma base.

Eso es muy cómodo en apariencia, pero destruye la separación de responsabilidades.

### Enfoque más sano

`order-service`:

- recibe la solicitud,
- consulta o valida stock a través de `inventory-service`,
- persiste su orden en su propia base,
- publica un evento si corresponde,
- y cada servicio actualiza sus propios datos.

Ese enfoque es más coherente con el modelo de microservicios.

---

## Base separada no siempre significa motor distinto

En un curso práctico, conviene aclarar esto porque suele generar confusión.

Podés tener:

- motores distintos por servicio,
- bases lógicas distintas en el mismo servidor,
- esquemas aislados,
- o inclusive entornos compartidos durante desarrollo.

Lo importante no es tanto el detalle físico, sino la **propiedad lógica y operativa del dato**.

Aunque dos servicios usen el mismo motor PostgreSQL, la regla sigue siendo:

- cada uno es dueño de su esquema,
- y los demás no lo modifican directamente.

---

## Qué pasa con los reportes o vistas compuestas

Una objeción frecuente es esta:

“Si cada servicio tiene sus datos, ¿cómo muestro pantallas o reportes que combinan información?”

La respuesta no es volver a una base compartida.

La respuesta suele estar en estrategias como:

- composición por API,
- eventos de dominio,
- modelos de lectura,
- proyecciones,
- cachés,
- o servicios específicamente pensados para consulta agregada.

Más adelante en el curso vamos a ver cómo esta separación nos lleva naturalmente a hablar de consistencia eventual, outbox e incluso sagas.

---

## Relación con la consistencia

En una base única compartida, muchos problemas parecen resolverse con una sola transacción.

En microservicios, esa comodidad desaparece o deja de ser deseable.

Entonces hay que pensar en:

- consistencia local dentro de cada servicio,
- coordinación entre servicios mediante contratos,
- eventos que propagan cambios,
- reacciones asincrónicas,
- y estrategias para mantener coherencia sin acoplar de más.

Eso marca una diferencia profunda entre una aplicación modular monolítica y una arquitectura distribuida real.

---

## Cómo conviene pensarlo didácticamente en NovaMarket

Para el curso, una estructura clara sería esta:

### `catalog-service`
Base o esquema propio para:

- productos,
- descripción,
- precio,
- estado activo.

### `inventory-service`
Base o esquema propio para:

- disponibilidad,
- reservas,
- movimientos de stock.

### `order-service`
Base o esquema propio para:

- órdenes,
- items de orden,
- estado del pedido.

### `notification-service`
Base o esquema propio para:

- registros de notificación,
- eventos procesados,
- estado del envío o intento.

Con eso, cada pieza del sistema conserva un límite claro también a nivel de persistencia.

---

## Señales de que todavía hay un monolito de datos

Conviene revisar la arquitectura si aparecen síntomas como estos:

- varios servicios escriben en las mismas tablas,
- una migración de un servicio rompe consultas de otro,
- los contratos reales viven más en SQL que en APIs,
- para cambiar una columna hay que coordinar demasiados componentes,
- o los servicios parecen independientes, pero nadie puede desplegar uno sin revisar toda la base.

Eso suele indicar que la distribución está incompleta o mal separada.

---

## Anti-patrones comunes

### Compartir tablas “solo temporalmente” y nunca corregirlo

Lo transitorio suele quedarse mucho tiempo.

### Exponer la base como mecanismo de integración

Eso convierte el almacenamiento en una API implícita y frágil.

### Duplicar responsabilidades de negocio en varios servicios

Si varios servicios operan sobre el mismo dato central, se vuelve difícil saber quién manda realmente.

### Forzar consistencia global con acoplamiento fuerte

A veces el intento de conservar una sola gran transacción hace que la arquitectura distribuida pierda sus beneficios.

---

## Lo importante no es el purismo, sino la autonomía real

No se trata de seguir una regla rígida por moda.

Se trata de entender que, en microservicios, la autonomía no depende solo de tener varios proyectos, sino de que cada servicio pueda sostener su responsabilidad de punta a punta:

- lógica,
- API,
- despliegue,
- y datos.

Si los datos siguen totalmente mezclados, esa autonomía queda muy debilitada.

---

## Cierre

En una arquitectura de microservicios, pensar en **una base por servicio** no es un capricho. Es una forma de proteger límites, reducir acoplamiento y permitir evolución independiente.

Compartir una única base puede parecer más simple al principio, pero muchas veces termina conservando lo peor del monolito y sumando la complejidad de un sistema distribuido.

En NovaMarket, separar la persistencia entre `catalog-service`, `inventory-service`, `order-service` y `notification-service` nos da una base mucho más coherente para los temas que siguen: **consistencia eventual**, **outbox pattern** y **sagas**.

En la próxima clase vamos a profundizar justamente en uno de esos conceptos: qué significa realmente la **consistencia eventual** y por qué aparece como una consecuencia natural cuando cada servicio es dueño de sus propios datos.
