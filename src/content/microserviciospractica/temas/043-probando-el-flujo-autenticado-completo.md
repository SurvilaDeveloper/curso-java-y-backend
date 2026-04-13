---
title: "Probando el flujo autenticado completo"
description: "Checkpoint práctico del bloque de seguridad. Autenticación en Keycloak, obtención de JWT y verificación del acceso protegido al flujo de órdenes en NovaMarket."
order: 43
module: "Módulo 7 · Seguridad con Keycloak y JWT"
level: "intermedio"
draft: false
---

# Probando el flujo autenticado completo

En las últimas clases NovaMarket dio un salto muy importante en materia de seguridad:

- levantamos Keycloak,
- creamos realm, cliente y usuario de prueba,
- configuramos `api-gateway` como Resource Server,
- protegimos las rutas de órdenes,
- propagamos el token hacia downstream,
- y además preparamos a `order-service` para entender JWT como servicio interno.

Ahora toca hacer el cierre práctico de este bloque:

**probar el flujo autenticado completo de punta a punta.**

La idea no es solamente verificar que “hay seguridad”, sino comprobar operativamente todo el recorrido:

1. autenticarse,
2. obtener un token,
3. usar ese token contra el gateway,
4. y crear una orden protegida.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- Keycloak autentica correctamente al usuario de prueba,
- podemos obtener un JWT válido,
- el gateway rechaza accesos sin token,
- el gateway permite accesos con token válido,
- y el flujo de creación de órdenes funciona de punta a punta con autenticación real.

---

## Estado de partida

En este punto del curso deberíamos tener:

- Keycloak arriba,
- realm `novamarket`,
- cliente `novamarket-gateway`,
- usuario de prueba creado,
- `api-gateway` configurado como Resource Server,
- `/orders` protegido,
- y `order-service` preparado también como Resource Server.

La infraestructura principal de seguridad ya está construida.  
Lo que toca ahora es validarla de forma integral.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- levantar todo el entorno necesario,
- obtener un token desde Keycloak,
- probar acceso sin token,
- probar acceso con token,
- verificar el flujo de órdenes,
- y confirmar que el bloque de seguridad quedó funcional.

---

## Paso 1 · Levantar el entorno completo necesario

Conviene respetar un orden parecido a este:

1. Keycloak
2. `config-server`
3. `discovery-server`
4. `catalog-service`
5. `inventory-service`
6. `order-service`
7. `api-gateway`

La idea es que, al momento de probar autenticación, todo el sistema relevante ya esté arriba.

---

## Paso 2 · Verificar que el usuario de prueba sigue válido

Antes de pedir un token, conviene confirmar mentalmente que tenés claro:

- realm: `novamarket`
- cliente: `novamarket-gateway`
- usuario de prueba
- contraseña del usuario

Si alguno de estos puntos está mal, la autenticación puede fallar y costar más diagnosticarlo.

---

## Paso 3 · Obtener un token desde Keycloak

Ahora toca pedir un token real.

La forma exacta puede variar según la configuración del cliente, pero conceptualmente queremos realizar una autenticación contra el realm `novamarket` usando el usuario de prueba y obtener un JWT.

Una vez hecho correctamente, la respuesta debería incluir al menos:

- `access_token`
- y posiblemente otros campos como tipo de token o tiempo de expiración

Lo más importante de esta clase es capturar ese `access_token`, porque lo vamos a usar en las llamadas protegidas.

---

## Paso 4 · Confirmar que el token fue emitido correctamente

Antes de usarlo, conviene revisar que realmente obtuviste un token útil.

Señales esperadas:

- existe el campo `access_token`
- el valor es un JWT válido con formato de tres bloques separados por puntos
- no es un mensaje de error ni una autenticación rechazada

Esta comprobación simple ahorra bastante tiempo si algo sale mal más adelante.

---

## Paso 5 · Probar una ruta pública sin token

Empecemos por algo sencillo para confirmar que el sistema sigue distinguiendo bien entre rutas abiertas y protegidas.

Ejecutá:

```bash
curl http://localhost:8080/products
```

La respuesta debería seguir funcionando sin necesidad de autenticación.

Esto confirma que no cerramos accidentalmente más superficie de la que queríamos.

---

## Paso 6 · Probar una orden sin token

Ahora sí, probemos el acceso protegido sin autenticación.

Ejecutá:

```bash
curl -i -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 1 }
    ]
  }'
```

La respuesta debería ser de rechazo.

Lo importante conceptualmente es esto:

**sin token válido, no debería crearse la orden.**

Este paso valida que la frontera del gateway realmente está funcionando.

---

## Paso 7 · Probar una orden con token válido

Ahora repetí la misma operación, pero agregando el token obtenido desde Keycloak.

Conceptualmente:

```bash
curl -i -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 1 },
      { "productId": 2, "quantity": 1 }
    ]
  }'
```

La respuesta esperada debería ser:

- `201 Created`
- una orden válida
- con id persistido
- y estado `CREATED`

Este es el corazón de la clase.

---

## Paso 8 · Probar un error de negocio con token válido

También conviene verificar que el hecho de estar autenticado no elimina las validaciones de negocio.

Ejecutá, por ejemplo:

```bash
curl -i -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "items": [
      { "productId": 3, "quantity": 999 }
    ]
  }'
```

La respuesta debería seguir siendo un error controlado de stock insuficiente.

Esto confirma algo muy importante:

- autenticación y autorización están funcionando,
- pero las reglas del negocio siguen siendo responsabilidad del flujo interno.

---

## Paso 9 · Revisar logs del gateway

Ahora conviene mirar la consola de `api-gateway`.

Queremos observar que:

- la request protegida entró correctamente,
- el token fue aceptado,
- la request no fue bloqueada,
- y el flujo se encaminó hacia `order-service`.

Este punto ayuda mucho a entender que el acceso exitoso realmente ocurrió por haber presentado un JWT válido.

---

## Paso 10 · Revisar logs de `order-service`

También conviene mirar la consola de `order-service`.

Queremos comprobar que:

- la request autenticada llegó,
- el servicio downstream recibió el contexto correspondiente,
- y el flujo de órdenes siguió funcionando normalmente.

Si además dejaste alguna traza temporal del header `Authorization`, esta clase es el momento ideal para validarla.

---

## Paso 11 · Comparar explícitamente los dos caminos

Una manera muy poderosa de cerrar esta clase es comparar:

### Sin token
- la orden no se crea

### Con token válido
- la orden sí puede crearse

Esa comparación es la forma más clara de ver que el bloque de seguridad ya está teniendo efecto real sobre el sistema.

---

## Qué estamos validando de verdad en esta clase

No se trata solo de pedir un token y hacer un POST.

Lo que estamos validando es esto:

### 1. Que Keycloak funciona como proveedor de identidad real
### 2. Que el gateway entiende y valida JWT
### 3. Que las rutas protegidas exigen autenticación
### 4. Que el token se usa dentro del flujo distribuido
### 5. Que el negocio sigue funcionando correctamente una vez autenticado el usuario

Eso representa uno de los bloques más valiosos del curso práctico hasta ahora.

---

## Qué todavía no estamos haciendo

Todavía no:

- configuramos roles más finos,
- usamos claims específicos para reglas de autorización,
- ni endurecemos todos los servicios internos por completo.

Todo eso puede venir después.

La meta de hoy es más concreta:

**cerrar el flujo autenticado base de NovaMarket.**

---

## Qué hacer si algo falla

Si en esta clase algo falla, conviene revisar primero:

- que Keycloak esté arriba,
- que el realm sea el correcto,
- que el usuario exista y esté habilitado,
- que el gateway tenga bien configurado el `issuer-uri`,
- que `/orders` esté protegido,
- y que el token realmente se esté enviando en el header `Authorization`.

Esta clase es justamente el punto ideal para detectar esas inconsistencias antes de seguir.

---

## Checklist de verificación mínima

Al terminar la clase deberías poder confirmar que:

- podés obtener un token desde Keycloak,
- `GET /products` sigue siendo público,
- `POST /orders` falla sin token,
- `POST /orders` funciona con token válido,
- y los errores de negocio siguen funcionando incluso en el flujo autenticado.

Si todo eso está bien, entonces el primer bloque real de seguridad de NovaMarket quedó consolidado.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, NovaMarket debería comportarse como una arquitectura que ya tiene:

- autenticación real,
- validación de JWT,
- rutas protegidas,
- y un flujo central de negocio operando bajo identidad autenticada.

Eso es un salto enorme respecto del estado inicial del proyecto.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a empezar el bloque de resiliencia, simulando fallas en `inventory-service`.

Eso nos va a mover desde seguridad hacia el comportamiento del sistema cuando una dependencia crítica deja de responder como esperamos.

---

## Cierre

Esta clase cerró el primer tramo completo del bloque de seguridad.

Probamos autenticación real con Keycloak, validación de JWT en el gateway y acceso controlado al flujo de órdenes.

Con eso, NovaMarket ya no es solo un sistema distribuido funcional: también es un sistema distribuido que empieza a proteger de verdad su operación principal.
