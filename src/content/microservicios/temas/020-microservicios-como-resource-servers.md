---
title: "Microservicios como Resource Servers"
description: "Cómo proteger servicios internos de NovaMarket validando JWT emitidos por Keycloak, por qué no conviene depender solo del gateway y cómo aplicar autorización en cada microservicio."
order: 20
module: "Módulo 5 · Seguridad en microservicios"
level: "intermedio"
draft: false
---

# Microservicios como Resource Servers

En las clases anteriores resolvimos dos piezas fundamentales de la seguridad en NovaMarket:

- incorporamos **Keycloak** como proveedor de identidad,
- y entendimos cómo puede propagarse el token desde el gateway hacia los servicios internos.

Ahora toca cerrar el bloque de seguridad con una decisión de arquitectura muy importante:

**hacer que los microservicios sean capaces de validar tokens por sí mismos.**

Eso es exactamente lo que significa convertirlos en **resource servers**.

---

## Qué es un Resource Server

Un resource server es una aplicación que expone recursos protegidos y que acepta access tokens emitidos por un Authorization Server confiable.

En nuestro caso:

- **Keycloak** es quien emite el token,
- y microservicios como `order-service` o `inventory-service` pueden convertirse en resource servers.

Eso implica que cada servicio protegido puede:

- recibir un JWT,
- validar que provenga del emisor esperado,
- verificar que no haya expirado,
- leer sus claims,
- y aplicar reglas de autorización sobre sus propios endpoints.

---

## Por qué no conviene depender solo del gateway

Es muy común que, cuando aparece un gateway, alguien piense:

> “Si el gateway ya valida el token, entonces los servicios internos pueden confiar y listo.”

Esa idea puede funcionar en ejemplos muy pequeños, pero tiene limitaciones fuertes.

### Problema 1: el gateway se vuelve la única barrera real

Si por algún motivo una request llega a un servicio interno sin pasar por el gateway, ese servicio podría quedar expuesto.

### Problema 2: el servicio pierde autonomía

Si `order-service` no entiende nada sobre identidad ni autorización, depende completamente de otro componente para proteger sus recursos.

### Problema 3: las reglas de negocio sensibles suelen vivir en el servicio

El gateway puede hacer validaciones generales, pero muchas decisiones de autorización dependen del recurso concreto.

Por ejemplo:

- un usuario puede crear una orden,
- pero quizá solo puede ver sus propias órdenes,
- mientras que un administrador puede ver todas.

Esa lógica tiene más sentido dentro de `order-service` que en el gateway.

---

## Qué gana NovaMarket cuando los servicios validan JWT

Cuando `order-service`, `inventory-service` y otros servicios se comportan como resource servers, la arquitectura mejora de varias formas.

### 1. Defensa en profundidad

No hay una sola barrera; hay varias capas de validación.

### 2. Autonomía de cada servicio

Cada microservicio entiende y protege sus propios recursos.

### 3. Mejor alineación entre seguridad y negocio

La autorización se puede aplicar cerca del recurso que realmente importa.

### 4. Menor dependencia de supuestos externos

El servicio no tiene que creer simplemente que “el gateway ya hizo lo correcto”. Puede verificarlo.

---

## Qué servicios de NovaMarket tiene sentido proteger

No todos los servicios tienen el mismo nivel de exposición ni la misma necesidad de autorización, pero varios sí deberían convertirse en resource servers.

### `order-service`

Es uno de los candidatos más claros.

Necesita proteger operaciones como:

- crear una orden,
- consultar una orden,
- listar órdenes,
- restringir acceso según identidad.

### `inventory-service`

También es importante, sobre todo para endpoints internos o administrativos.

Puede necesitar:

- restringir consultas sensibles,
- permitir administración solo a roles específicos,
- registrar acciones con contexto de identidad.

### `catalog-service`

Puede ser público en parte, pero igual puede beneficiarse de tener seguridad para ciertos endpoints de administración o mantenimiento.

---

## Validación del token: qué debe comprobar el servicio

Cuando un microservicio recibe un JWT, no alcanza con leerlo como si fuera un JSON cualquiera.

Tiene que validar varios aspectos.

### 1. Emisor

El token debe provenir de la autoridad que el sistema reconoce, en este caso Keycloak.

### 2. Firma

El token debe tener una firma válida.

### 3. Expiración

No debe estar vencido.

### 4. Estructura y claims relevantes

El servicio puede necesitar verificar información útil para su lógica.

### 5. Reglas de autorización

No basta con aceptar el token; después hay que decidir si ese usuario puede acceder al recurso solicitado.

---

## Autenticación y autorización dentro del servicio

Esta distinción sigue siendo fundamental.

### Autenticación

Responde a la pregunta:

**¿quién es este actor?**

### Autorización

Responde a la pregunta:

**¿puede este actor hacer esto acá?**

Un service resource server se encarga primero de aceptar o rechazar la autenticidad del token y luego de aplicar reglas de acceso sobre sus propios endpoints.

---

## Ejemplos concretos en `order-service`

Pensemos operaciones reales dentro de NovaMarket.

### Caso 1: crear una orden

Endpoint:

- `POST /orders`

Regla razonable:

- requiere usuario autenticado.

### Caso 2: consultar una orden puntual

Endpoint:

- `GET /orders/{id}`

Regla razonable:

- el usuario puede ver la orden si le pertenece,
- o un administrador puede verla aunque no sea suya.

### Caso 3: listar todas las órdenes

Endpoint:

- `GET /orders`

Regla razonable:

- quizá solo para `ROLE_ADMIN`,
- o bien para usuarios limitando la respuesta a sus propios recursos.

Ninguna de estas reglas depende únicamente del gateway. Todas tienen sentido dentro del servicio que conoce la entidad `Order`.

---

## Ejemplos concretos en `inventory-service`

### Caso 1: consultar disponibilidad técnica

Una operación interna usada por `order-service`.

Acá el diseño puede variar según cómo se exponga el endpoint:

- interno y protegido,
- restringido a roles técnicos,
- o protegido por una política especial.

### Caso 2: modificar stock

Endpoint administrativo.

Regla razonable:

- solo `ROLE_ADMIN`.

### Caso 3: consultar inventario global

También puede ser una operación administrativa o interna.

Lo importante es que el servicio tenga la capacidad de aplicar esas reglas directamente sobre su superficie de recursos.

---

## Qué información del token puede usar el servicio

Cuando un microservicio valida correctamente el JWT, puede acceder a datos útiles como:

- username,
- subject,
- roles,
- scopes,
- claims personalizadas.

Eso habilita varias posibilidades.

Por ejemplo, `order-service` podría:

- asociar el `subject` al `userId` de la orden,
- usar el username para auditoría,
- aplicar filtros por propietario del recurso,
- permitir excepciones a administradores.

Otra vez, esto es mucho más confiable que pedirle al cliente que envíe manualmente un identificador de usuario dentro del body.

---

## Un principio importante: seguridad cerca del recurso

El gateway sigue siendo valioso, pero la autorización más específica debería vivir lo más cerca posible del recurso protegido.

¿Por qué?

Porque el microservicio conoce detalles que el gateway normalmente no conoce:

- a quién pertenece una orden,
- qué estado tiene,
- si una acción es válida según la lógica del dominio,
- qué condiciones de negocio deben cumplirse.

El gateway puede decidir cosas amplias como:

- “esta ruta requiere autenticación”,
- “este token es inválido”,
- “este request no entra”.

Pero reglas finas como:

- “solo el dueño de la orden o un admin puede verla”

pertenecen naturalmente al servicio.

---

## Qué no debería hacer un microservicio resource server

Convertir un servicio en resource server no significa meter toda la seguridad posible dentro suyo de forma caótica.

Hay errores que conviene evitar.

### Error 1: duplicar lógica de autenticación innecesaria

El servicio no debería intentar reemplazar a Keycloak ni volver a emitir identidad.

### Error 2: mezclar autorización HTTP con reglas de negocio sin criterio

No todo debería resolverse con anotaciones directas sin pensar el modelo. Algunas reglas dependen de comparar datos del recurso con el usuario autenticado.

### Error 3: asumir que todos los endpoints tienen las mismas necesidades

No es lo mismo proteger:

- endpoints públicos de catálogo,
- operaciones autenticadas de órdenes,
- endpoints administrativos de inventario.

### Error 4: confiar en headers inventados en vez de validar el JWT

Si el servicio realmente depende de identidad, debería apoyarse en el token verificable y no solo en headers auxiliares improvisados.

---

## Resource server y propagación de token trabajan juntos

La clase anterior y esta no compiten entre sí. Se complementan.

### La propagación del token resuelve:

- que la identidad del usuario llegue al servicio.

### El resource server resuelve:

- que el servicio pueda confiar en esa identidad de forma verificable.

Juntas, estas dos piezas construyen un modelo mucho más sólido.

Sin propagación, el servicio puede no ver el contexto del usuario.
Sin validación propia, el servicio depende demasiado de otro componente.

---

## Cómo mejora esto el flujo central de NovaMarket

Recordemos el caso de uso central del curso:

**consultar catálogo → crear orden → validar stock → registrar orden → publicar evento → notificar**

Al convertir `order-service` en resource server, el flujo de creación de orden gana varias propiedades importantes.

### 1. La orden puede asociarse al usuario autenticado real

### 2. El endpoint de creación deja de aceptar requests anónimos

### 3. Las consultas futuras sobre órdenes pueden filtrar por propietario

### 4. Las reglas administrativas pueden apoyarse en roles del token

Eso hace que el proyecto se parezca mucho más a un sistema profesional y no solo a una demo de endpoints.

---

## Relación con testing y observabilidad futura

Además, esta decisión va a impactar positivamente en módulos posteriores.

### En testing

Vamos a poder probar:

- requests autenticados y no autenticados,
- acceso permitido o denegado según roles,
- endpoints de usuario vs endpoints administrativos.

### En observabilidad

Vamos a poder correlacionar mejor operaciones de negocio con identidad de usuario, siempre sin exponer información sensible de forma inapropiada.

---

## Defensa en profundidad: una idea que conviene conservar

Una de las mejores formas de resumir esta clase es esta:

**el gateway protege la entrada, pero cada servicio debe proteger sus propios recursos cuando eso importa.**

Esa es una forma sana de pensar seguridad en una arquitectura distribuida.

No significa repetirlo todo en todas partes de forma exagerada, pero sí evitar una arquitectura donde todos los componentes internos dependan ciegamente de un solo punto externo.

---

## Cómo se cierra el bloque de seguridad

Con esta clase, el módulo de seguridad ya deja establecido un modelo bastante completo para NovaMarket.

Tenemos:

- un proveedor de identidad real: Keycloak,
- un gateway capaz de recibir y filtrar tráfico,
- una estrategia para que el token viaje a servicios internos,
- y microservicios capaces de validar JWT y aplicar autorización.

Este cierre es importante porque, a partir del próximo módulo, vamos a empezar a hablar de resiliencia.

Y la resiliencia tiene sentido cuando el sistema ya existe como arquitectura distribuida con identidad, acceso protegido y dependencias entre servicios.

---

## Cierre

Convertir microservicios en resource servers es una decisión central para construir una seguridad distribuida más madura.

En NovaMarket, esto significa que servicios como `order-service` e `inventory-service` dejan de ser simples receptores de requests reenviadas por el gateway y pasan a convertirse en componentes capaces de:

- validar identidad,
- leer claims útiles,
- aplicar reglas propias de autorización,
- y proteger sus recursos con mayor autonomía.

La consecuencia más importante no es técnica sino arquitectónica:

**la seguridad deja de depender de una única frontera y se vuelve parte explícita del diseño de cada servicio relevante.**

Con esto cerramos el bloque de seguridad del curso y dejamos a NovaMarket listo para entrar en el próximo gran desafío de una arquitectura distribuida: fallar bien, resistir mejor y observar qué ocurre cuando las dependencias no responden como esperamos.
