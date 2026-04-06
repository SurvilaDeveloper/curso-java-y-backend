---
title: "Errores seguros: qué decir y qué no decir"
description: "Cómo diseñar respuestas de error seguras en una aplicación Java con Spring Boot. Qué información conviene devolver al cliente, qué detalle reservar para logs o auditoría y cómo evitar que los errores se conviertan en una fuente de enumeración, fuga de contexto interno o ayuda para atacantes."
order: 54
module: "Observabilidad y respuesta"
level: "base"
draft: false
---

# Errores seguros: qué decir y qué no decir

## Objetivo del tema

Entender cómo diseñar **respuestas de error seguras** en una aplicación Java + Spring Boot, para que el backend pueda:

- comunicar fallos de forma útil
- mantener una API razonable
- ayudar a clientes legítimos a corregir requests
- dejar trazabilidad técnica adecuada

sin convertir cada error en una fuente de:

- enumeración
- fuga de detalles internos
- exposición de estructura de datos
- confirmación de cuentas o recursos
- ayuda innecesaria para atacantes
- confusión entre mensaje al cliente y detalle técnico interno

En resumen:

> un buen manejo de errores no consiste en ocultar todo ni en contarle todo al cliente.  
> Consiste en dar el detalle correcto al actor correcto, por el canal correcto.

---

## Idea clave

Los errores tienen al menos dos audiencias posibles:

## 1. El cliente que hizo la request
Necesita saber lo suficiente para:
- entender si falló la forma
- corregir el input
- reintentar si corresponde
- comprender si está autenticado o autorizado

## 2. El sistema y el equipo
Necesitan saber mucho más para:
- investigar
- depurar
- auditar
- responder a incidentes
- correlacionar eventos

En resumen:

> el detalle útil para soporte o debugging no tiene por qué ir completo en la respuesta pública del endpoint.

Esa separación es una de las decisiones más importantes en diseño seguro de errores.

---

## Qué problema intenta resolver este tema

Este tema intenta evitar patrones como:

- devolver stack traces al cliente
- exponer nombres de tablas, columnas o clases internas
- distinguir demasiado entre escenarios sensibles
- confirmar existencia de usuarios o recursos sin necesidad
- devolver mensajes de librerías sin filtrar
- enviar excepciones completas en JSON
- usar la API como interfaz pública de diagnóstico del estado interno

Es decir:

> el problema no es devolver errores.  
> El problema es devolver errores con más información, más precisión o más contexto del que realmente conviene exponer.

---

## Error mental clásico

Muchos sistemas caen en uno de estos extremos:

### Extremo 1
- “mandemos el error exacto así el frontend sabe todo”

### Extremo 2
- “devolvamos siempre algo inútil como ‘error’ para no filtrar nada”

Los dos extremos suelen ser malos.

### Si devolvés demasiado
- ayudás a enumerar
- mostrás estructura interna
- filtrás detalles técnicos
- facilitás debugging ofensivo
- exponés superficie innecesaria

### Si devolvés demasiado poco
- rompés UX
- hacés más difícil corregir requests legítimos
- volvés la API opaca
- obligás al cliente a adivinar
- degradás mantenibilidad y soporte

La meta sana es:
- **detalle útil para el cliente**
- **detalle más profundo en logs/auditoría**
- **sin regalar información ofensivamente útil**

---

## No todos los errores tienen el mismo riesgo

Esto es muy importante.

Hay errores donde conviene ser bastante claro.

### Ejemplos razonables
- formato inválido de email
- campo obligatorio ausente
- longitud excedida
- JSON mal formado
- parámetro no soportado
- enum inválido

Y hay errores donde conviene ser mucho más prudente.

### Ejemplos sensibles
- login
- forgot password
- reset password
- activación
- acceso a recursos por ID
- tokens inválidos
- recursos que podrían existir pero no corresponder
- estados internos delicados
- acciones administrativas sensibles

En esos casos, demasiada precisión puede ayudar más al atacante que al usuario legítimo.

---

## Qué conviene decir en errores de validación básica

Cuando el problema es puramente de forma o contrato, suele estar bien ser bastante claro.

### Ejemplos
- `"email": "debe tener un formato válido"`
- `"name": "no puede estar vacío"`
- `"size": "debe ser menor o igual a 100"`

Eso suele ayudar y, en general, no expone demasiado.

### Idea útil

Los errores de validación estructural suelen ser buen lugar para mensajes concretos, porque ayudan a corregir el input y no suelen revelar demasiado del estado interno del sistema.

---

## Qué conviene evitar en errores sensibles de autenticación

En flujos como login o recuperación, conviene evitar mensajes del tipo:

- “No existe usuario con ese email”
- “La contraseña es incorrecta”
- “La cuenta existe pero está deshabilitada”
- “La cuenta todavía no activó el correo”
- “El token era válido pero ya se usó”
- “El refresh token pertenece a otra sesión”

Todos esos mensajes pueden ayudar a:

- enumerar cuentas
- distinguir estados
- confirmar existencia
- entender demasiado del lifecycle interno
- ajustar mejor ataques o abuso

### Más sano

Mensajes más prudentes como:

- “Credenciales inválidas”
- “No se pudo completar la operación”
- “El enlace es inválido o expiró”
- “Si existe una cuenta asociada, te enviaremos instrucciones”

---

## Qué conviene evitar en errores de acceso a recursos

Este tema también se conecta mucho con IDOR y ownership.

Supongamos un recurso consultado por `/{id}`.

### Mensajes riesgosos
- “La orden existe pero pertenece a otro usuario”
- “El recurso pertenece al tenant B”
- “La factura existe pero no tenés permisos para verla”
- “Ese archivo es de otro cliente”

Todo eso revela demasiado.

### Más sano

Según la política del sistema, suele ser mejor algo como:

- “No autorizado”
- “Recurso no encontrado”
- “No se pudo completar la operación”

Lo importante es que el backend no use el error para enseñar demasiado sobre existencia, ownership o estructura interna.

---

## Qué no deberías devolver nunca tal cual

Estas cosas no deberían salir crudas en respuestas públicas:

- stack trace completo
- nombre de clase interna
- nombre de tabla o columna
- SQL crudo
- rutas del sistema de archivos
- secretos o tokens
- detalles de configuración
- mensajes completos de librerías o proveedores
- payloads internos
- valores sensibles que el cliente no debería ver

### Ejemplo pésimo

```json
{
  "error": "org.postgresql.util.PSQLException: ERROR: column user0_.role does not exist ..."
}
```

Esto puede ayudar a alguien a aprender muchísimo sobre tu estructura interna sin necesidad.

---

## Los mensajes de excepción de librerías no son contratos de API

Otro error común es dejar que una excepción técnica llegue casi sin filtro al cliente.

### Problema

Esas excepciones suelen estar escritas para:
- desarrolladores
- logs
- diagnóstico interno

No para:
- consumidores externos
- navegadores
- clientes móviles
- terceros integrados

Entonces pueden incluir:
- detalles internos
- nombres técnicos
- mensajes crudos
- información ofensivamente útil

### Regla sana

Transformar errores técnicos en respuestas de API más estables y controladas.

---

## 400, 401, 403, 404, 409, 422, 429, 500: el código ayuda, pero no lo es todo

El status code importa mucho.
Pero no alcanza por sí solo.

### Por ejemplo
- `400`: request mal formada o inválida
- `401`: falta autenticación o credencial inválida en contexto adecuado
- `403`: actor autenticado pero sin acceso
- `404`: recurso no encontrado o recurso ocultado por política
- `409`: conflicto de estado
- `422`: validación semántica en algunos estilos de API
- `429`: demasiadas requests
- `500`: error inesperado del servidor

Elegir bien el código ayuda muchísimo.

Pero además conviene pensar:
- qué texto acompañás
- cuánto detalle agregás
- si ese detalle ayuda al usuario legítimo o al atacante

---

## 500 no debería contarle al cliente cómo explotarte

Un `500 Internal Server Error` bien manejado no necesita mostrar:

- el stack
- la consulta SQL
- la clase Java
- el bean que falló
- el payload interno
- el nombre del archivo donde explotó

### Más sano

Dar un error estable tipo:

```json
{
  "message": "Ocurrió un error interno"
}
```

y reservar el detalle real para:
- logs
- requestId
- observabilidad
- diagnóstico interno

---

## Request ID ayuda a dar menos detalle público

Una práctica muy sana es devolver algo como:

- `requestId`
- `traceId`
- `correlationId`

cuando ocurre un error.

### Ejemplo

```json
{
  "message": "Ocurrió un error interno",
  "requestId": "7f91b7d2-3a..."
}
```

Eso ayuda muchísimo porque:

- el cliente no necesita ver todo el stack
- soporte puede pedir ese ID
- el equipo puede buscar el detalle real en logs
- la respuesta pública sigue siendo prudente

Es una muy buena forma de separar:
- mensaje externo
- diagnóstico interno

---

## Errores de negocio: claridad sí, sobreexposición no

No todos los errores son técnicos.

A veces el backend rechaza una acción por reglas del dominio.

### Ejemplos
- “la orden no puede cancelarse en este estado”
- “el cupón ya expiró”
- “el archivo excede el tamaño permitido”
- “ya existe una cuenta con ese email”
- “el recurso ya fue procesado”

En estos casos conviene equilibrar:
- claridad para el usuario legítimo
- no sobreexponer detalles internos innecesarios

### Idea útil

Si el mensaje ayuda a corregir o entender una regla del negocio sin exponer demasiado, suele estar bien.
Si revela estructura interna o estados sensibles explotables, ya empieza a ser mala idea.

---

## Qué hacer con errores de concurrencia o conflicto

En operaciones con estado, pueden aparecer cosas como:

- ya procesado
- ya cancelado
- versión vieja
- recurso cambió
- conflicto de transición

Ahí suele ser razonable devolver algo claro tipo:

- “El recurso ya fue actualizado”
- “La operación ya no es válida en el estado actual”
- “Debes refrescar antes de reintentar”

Esto ayuda a clientes legítimos sin necesidad de enseñar internamente toda la mecánica del backend.

---

## Errores de autorización: prudencia especial

Autorización es un terreno donde el exceso de detalle suele ser peligroso.

### Ejemplos riesgosos
- “Te falta authority `billing.refund.force`”
- “Tenés permiso de lectura pero no de edición”
- “El recurso pertenece a otro tenant”
- “Sos support, no finance”
- “Podés ver pero no exportar porque este cliente es premium”

Ese nivel de detalle puede ser útil internamente, pero no siempre conviene darlo hacia afuera.

### Más sano

Mensajes más estables como:
- “No autorizado”
- “No tienes permisos para esta operación”
- “No se pudo completar la operación”

Y el detalle fino:
- a logs
- a trazabilidad interna
- o a canales operativos controlados

---

## Cuidado con diferenciar demasiado por timing o estructura

Como vimos con enumeración, no solo el texto importa.

También puede filtrar demasiado si cambian mucho:

- códigos HTTP
- estructura JSON
- headers
- tiempos de respuesta
- paths de error

### Ejemplo

Si para:
- usuario inexistente devolvés un formato
- password incorrecta otro
- cuenta deshabilitada otro

aunque el texto sea moderado, igual podés estar enseñando demasiado.

La consistencia ayuda mucho a reducir esa señal.

---

## Qué papel juegan los global exception handlers

En Spring, tener un manejo centralizado de errores suele ayudar muchísimo.

Porque permite:

- respuestas consistentes
- menos fugas accidentales
- mapping controlado de excepciones
- separación mejor entre error técnico y mensaje público

### Idea sana

- excepciones de negocio -> mensajes controlados
- validación -> detalle razonable
- autenticación/autorización -> prudencia
- fallos internos -> mensaje estable + requestId

No hace falta mostrar la implementación acá para entender que el patrón es muy valioso.

---

## Ejemplo conceptual sano

### En vez de esto

```java
catch (Exception e) {
    return ResponseEntity.status(500).body(e.getMessage());
}
```

### Mejor algo como

```java
catch (Exception e) {
    log.error("Fallo interno requestId={}", requestId, e);
    return ResponseEntity.status(500).body(
        Map.of(
            "message", "Ocurrió un error interno",
            "requestId", requestId
        )
    );
}
```

### Qué mejora esto

- el cliente recibe algo estable
- el detalle técnico queda en logs
- hay correlación para soporte e investigación
- no filtrás excepción cruda

---

## Qué conviene revisar especialmente

Merecen revisión especial los errores de:

- login
- forgot/reset password
- activación de cuenta
- acceso a recursos por ID
- tokens y sesiones
- operaciones admin
- exports
- uploads
- integración con terceros
- errores SQL o de infraestructura
- excepciones serializadas a JSON automáticamente

Ahí es donde más suele escaparse información de más.

---

## Qué gana el backend si maneja bien los errores

Cuando los errores están mejor diseñados, el backend gana:

- menos enumeración
- menos fuga de detalles internos
- respuestas más consistentes
- mejor soporte vía requestId/correlationId
- mejor separación entre cliente y diagnóstico interno
- más claridad donde sí hace falta
- menos ruido y menos improvisación en manejo de excepciones

No es solo estética de API.
Es seguridad y mantenibilidad.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- validación clara en errores de input
- prudencia en auth y autorización
- `500` estables
- detalles técnicos reservados a logs
- requestId o traceId útil
- handlers centralizados
- consistencia de estructura de error
- poco texto ofensivamente útil

---

## Señales de ruido

Estas cosas suelen hacer mucho ruido:

- `e.getMessage()` directo al cliente
- stack traces en JSON
- SQL crudo en respuestas
- mensajes distintos que enumeran usuarios o tokens
- errores de autorización demasiado precisos
- ausencia total de requestId
- cada endpoint responde errores de forma distinta
- nadie sabe qué detalle es público y cuál debería quedar interno

---

## Checklist práctico

Cuando revises errores en una app Spring, preguntate:

- ¿qué errores son puramente de validación y cuáles son sensibles?
- ¿qué información ve el cliente?
- ¿qué información queda solo en logs?
- ¿hay stack traces o mensajes de librerías expuestos?
- ¿hay requestId o correlationId para investigar?
- ¿los errores de auth y recursos revelan demasiado?
- ¿hay consistencia de códigos y estructura?
- ¿`500` está filtrando detalles internos?
- ¿los handlers globales están controlando bien la salida?
- ¿el equipo puede explicar qué sí conviene decir y qué no?

---

## Mini ejercicio de reflexión

Tomá cinco respuestas de error reales o imaginarias de tu backend y respondé:

1. ¿Qué intenta comunicar cada una?
2. ¿Ayuda a un cliente legítimo?
3. ¿Ayuda también a un atacante?
4. ¿Qué parte del mensaje podría ir a logs en vez de al cliente?
5. ¿Qué `status code` corresponde mejor?
6. ¿Hay requestId suficiente para investigar?
7. ¿Cuál de esas respuestas hoy expone más de lo necesario?

Ese ejercicio ayuda muchísimo a encontrar fugas de información que suelen pasar desapercibidas porque “solo son errores”.

---

## Resumen

Un error seguro no significa un error inútil.

Significa:

- claridad cuando el cliente necesita corregir algo razonable
- prudencia cuando el detalle podría ayudar a enumerar o entender demasiado
- consistencia de formato y códigos
- separación entre mensaje público y diagnóstico interno
- requestId o trazabilidad útil para investigación

En resumen:

> Un backend más maduro no usa las respuestas de error como un espejo de sus excepciones internas.  
> Las usa como una interfaz controlada, donde el cliente recibe lo suficiente para actuar y el sistema conserva lo demás para logs, soporte e investigación.

---

## Próximo tema

**Checklist mental para revisar un endpoint**
