---
title: "Checklist mental inicial para revisar un backend Spring"
description: "Guía práctica para hacer una primera revisión de seguridad sobre un backend Java con Spring Boot. Qué preguntas conviene hacerse al principio, cómo priorizar la lectura y qué señales suelen indicar más riesgo."
order: 10
module: "Fundamentos"
level: "intro"
draft: false
---

# Checklist mental inicial para revisar un backend Spring

## Objetivo del tema

Tener una guía corta, práctica y reutilizable para hacer una **primera revisión de seguridad** sobre un backend Java + Spring Boot sin perderse en detalles secundarios.

La idea de este tema es darte una forma de arrancar con criterio cuando abrís una app y todavía no conocés bien:

- el negocio
- los actores
- los flujos
- la arquitectura
- las capas
- los puntos más delicados

En vez de revisar “todo”, este checklist te ayuda a revisar **mejor**.

---

## Idea clave

Una buena revisión inicial no intenta agotar el sistema.

Intenta responder rápido estas preguntas:

- ¿qué parte vale más?
- ¿qué parte tiene más poder?
- ¿qué parte confía demasiado?
- ¿qué parte podría abusarse con más facilidad?
- ¿qué parte sería más difícil de ver y cortar si algo sale mal?

En resumen:

> El objetivo de una primera revisión no es conocer todos los detalles. Es ubicar primero dónde está el riesgo más rentable de entender.

---

## Cuándo usar este checklist

Este checklist sirve muy bien cuando:

- heredás una codebase
- empezás una auditoría interna
- querés revisar un proyecto personal con más criterio
- vas a tocar una parte sensible del backend
- querés priorizar una revisión antes de profundizar
- querés detectar rápido puntos débiles sin leer todo el sistema

También sirve mucho antes de:

- agregar auth
- exponer nuevos endpoints
- lanzar un panel admin
- integrar un tercero
- cambiar permisos
- abrir un feature sensible
- hacer refactors grandes

---

## Qué no intenta hacer este checklist

No intenta:

- reemplazar una revisión profunda
- detectar todos los bugs
- cubrir todos los temas posibles
- garantizar que el sistema quede “auditado”

Lo que sí hace es darte un **primer mapa útil**.

---

# El checklist mental inicial

## 1. ¿Qué hace esta aplicación?

Parece obvio, pero conviene hacerlo explícito.

Preguntas útiles:

- ¿es una API pública?
- ¿es un backend para frontend?
- ¿es un panel interno?
- ¿es una app multiusuario?
- ¿es un e-commerce?
- ¿maneja pagos?
- ¿maneja cuentas?
- ¿maneja backoffice?
- ¿maneja soporte?
- ¿maneja datos sensibles?
- ¿es una API interna entre servicios?

### Por qué importa

Porque el tipo de sistema cambia muchísimo qué te preocupa primero.

No mirás igual:

- una API de catálogo
- una app de órdenes
- una app con reembolsos
- una plataforma multi-tenant
- una app de soporte con datos internos
- una app con permisos administrativos fuertes

---

## 2. ¿Qué parte vale más?

Antes de buscar bugs, ubicá valor.

Preguntas útiles:

- ¿qué datos serían más costosos de filtrar?
- ¿qué capacidad sería más costosa de abusar?
- ¿qué flujo sería más costoso de romper?
- ¿qué cuenta tendría más impacto si se comprometiera?
- ¿qué integración haría más daño si se usara mal?

### Cosas que suelen valer mucho

- credenciales
- reset password
- tokens
- datos personales
- órdenes
- pagos
- reembolsos
- roles
- cuentas admin
- soporte
- auditoría
- secretos
- integraciones con terceros
- pipelines
- endpoints internos

### Señal útil

Si no sabés qué vale más, todavía no sabés bien dónde poner la atención.

---

## 3. ¿Cómo autentica?

No hace falta bajar a todo el detalle al principio, pero sí ubicar rápido:

- ¿usa sesión o JWT?
- ¿usa Spring Security?
- ¿cómo loguea?
- ¿hay refresh token?
- ¿hay reset password?
- ¿hay MFA?
- ¿hay cuentas técnicas?
- ¿hay autenticación entre servicios?

### Qué querés ubicar rápido

- clases de configuración de seguridad
- filtros
- auth controller
- auth service
- password encoder
- user details
- storage de sesiones o tokens
- endpoints públicos relacionados con identidad

### Preguntas útiles

- ¿parece una autenticación improvisada o sólida?
- ¿hay endpoints muy sensibles sin suficiente control?
- ¿la identidad queda bien propagada al resto del sistema?
- ¿hay señales de confianza excesiva en tokens o headers?

---

## 4. ¿Cómo autoriza?

Después de saber quién entra, querés saber qué puede hacer.

Preguntas útiles:

- ¿se autoriza por rol solamente?
- ¿hay ownership?
- ¿hay distinción entre USER, SUPPORT, ADMIN?
- ¿hay separación entre acciones comunes y críticas?
- ¿la autorización vive solo en controller?
- ¿el service entiende el actor?
- ¿hay operaciones que parecen demasiado cómodas?

### Señales que hacen ruido

- mucho `hasRole()` y poco ownership
- IDs usados sin comparar contra actor autenticado
- panel admin demasiado amplio
- soporte demasiado cerca de admin
- services que ejecutan cosas delicadas sin contexto
- endpoints sensibles protegidos solo por “estar logueado”

---

## 5. ¿Qué endpoints son los más sensibles?

En una primera revisión, conviene armar una lista corta de endpoints “caros”.

### Suelen ser especialmente delicados

- login
- refresh token
- reset password
- cambio de email
- cambio de rol
- panel admin
- endpoints de soporte
- creación/cancelación de órdenes
- reembolsos
- exports
- uploads
- búsquedas amplias
- webhooks
- integraciones
- acciones con cambio de estado

### Qué querés detectar

- qué endpoint cambia más poder
- qué endpoint toca más datos
- qué endpoint tiene más potencial de abuso
- qué endpoint podría servir como pivote
- qué endpoint parece demasiado directo

---

## 6. ¿Qué parte del request está confiando demasiado?

Este punto vale oro.

Preguntas útiles:

- ¿qué campo del body no debería venir del cliente?
- ¿qué ID del request se acepta como si fuera verdad?
- ¿qué total, monto o estado se está confiando?
- ¿qué parte depende demasiado de la UI?
- ¿qué validación existe solo en frontend?

### Señales comunes

- `ownerId` en request
- `userId` enviado por cliente
- `role` o `enabled` en DTOs de entrada
- `total`, `price`, `status` viniendo del cliente
- binds directos a entidades
- `PATCH` genéricos

---

## 7. ¿Dónde vive la regla de negocio real?

Esta pregunta sirve muchísimo para detectar backend débil.

Preguntas útiles:

- ¿la regla vive en service?
- ¿o solo en controller?
- ¿o en frontend?
- ¿o está repartida sin dueño claro?

### Ejemplos de reglas que deberían vivir en backend

- qué estados son válidos
- quién puede cancelar
- cuándo se puede reembolsar
- cómo se calcula el total
- qué rol puede cambiar otro rol
- qué datos puede ver soporte
- cuándo una cuenta está habilitada para operar

### Señales de ruido

- services vacíos
- controllers con demasiada lógica
- UI sosteniendo reglas críticas
- operaciones críticas resueltas solo por “flujo normal”

---

## 8. ¿Dónde podría haber IDOR o ownership débil?

Cada vez que veas:

- `/{id}`
- `/{userId}`
- `/{orderId}`
- `/{invoiceId}`

preguntate:

- ¿quién puede consultar esto?
- ¿cómo se verifica que le pertenezca?
- ¿qué pasa si prueban otro ID?
- ¿cómo responde si el recurso existe pero no corresponde?
- ¿hay tenant de por medio?
- ¿hay soporte o admin mezclados?

### Señal útil

Si el backend consulta por ID y devuelve sin mucho más, probablemente merezca una revisión más profunda.

---

## 9. ¿Qué operaciones cambian estados importantes?

No todo endpoint de lectura pesa igual que uno de cambio.

Prestá especial atención a operaciones que:

- aprueban
- cancelan
- reembolsan
- bloquean
- activan
- eliminan
- cambian rol
- exportan
- reasignan
- sincronizan con terceros
- modifican ownership

### Preguntas útiles

- ¿quién puede hacerlo?
- ¿bajo qué condiciones?
- ¿qué estado previo exige?
- ¿puede repetirse?
- ¿deja auditoría?
- ¿qué pasa si se llama fuera de secuencia?

---

## 10. ¿Qué servicios o cuentas tienen demasiado poder?

En una app Spring no solo importan usuarios humanos.

También importan:

- cuentas técnicas
- integraciones
- jobs
- services internos
- pipelines
- soporte
- admin

### Preguntas útiles

- ¿qué cuenta toca demasiadas cosas?
- ¿qué service concentra demasiadas capacidades?
- ¿qué integración externa tiene demasiado alcance?
- ¿qué panel interno parece demasiado poderoso?
- ¿hay una cuenta “universal”?

### Señales de ruido

- una sola cuenta para todo
- un solo panel que hace de todo
- servicios muy centrales con permisos muy amplios
- secretos reutilizados
- integraciones que leen y escriben demasiado

---

## 11. ¿Qué queries o búsquedas podrían abusarse?

Revisá rápido:

- paginación
- sorting
- filtros
- búsquedas
- exports
- consultas por rango
- listados masivos

### Preguntas útiles

- ¿hay límites?
- ¿el sort acepta cualquier campo?
- ¿la búsqueda puede automatizarse fácil?
- ¿hay filtros por ownership o tenant?
- ¿la query trae demasiado?
- ¿un actor moderado podría usarla para aprender demasiado?

---

## 12. ¿Qué parte del sistema sería más difícil de detectar o cortar si algo sale mal?

Esto te mete ya en maniobra defensiva.

Preguntas útiles:

- ¿qué acción sensible deja auditoría?
- ¿qué cuenta podría actuar sin dejar traza clara?
- ¿qué integración sería difícil de revocar?
- ¿qué cambio de estado sería difícil de reconstruir?
- ¿qué parte del sistema no sabrías aislar rápido?
- ¿qué daño colateral tendría cortar cierto acceso?

### Señales útiles

- poca auditoría
- poco contexto en logs
- demasiada dependencia de terceros
- falta de ownership claro
- paneles o cuentas sin trazabilidad fuerte
- operaciones críticas sin evento o rastro útil

---

# Cómo usar este checklist en orden

Una secuencia práctica para una primera revisión es esta:

## Paso 1
Entender qué hace la app

## Paso 2
Ubicar qué vale más

## Paso 3
Mirar auth y security config

## Paso 4
Listar endpoints sensibles

## Paso 5
Seguirlos a services y reglas reales

## Paso 6
Mirar ownership, roles y estados

## Paso 7
Revisar repositories y exposición de datos

## Paso 8
Ubicar cuentas técnicas, terceros e integraciones

## Paso 9
Pensar detección, auditoría y corte

Con eso ya tenés una primera lectura muchísimo mejor que abrir archivos al azar.

---

# Señales rápidas de alto riesgo

Si en una primera pasada encontrás varias de estas cosas, probablemente haya bastante riesgo acumulado:

- binds directos a entidades
- DTOs abiertos
- `userId` desde request
- `role`, `enabled`, `ownerId` o `status` viniendo del cliente
- `hasRole()` como única defensa
- ausencia de ownership
- `findById()` + response directa
- `PATCH` genéricos para cambios delicados
- services con poca lógica real
- paneles admin o soporte con mucho alcance
- queries demasiado abiertas
- poca auditoría en acciones críticas
- secrets visibles en config
- Actuator o Swagger expuestos de más
- integraciones externas demasiado confiadas

---

# Qué deberías tener al final de una primera revisión

No hace falta salir con una lista exhaustiva.

Alcanza con salir pudiendo decir algo como:

- estos son los módulos más sensibles
- estos son los endpoints que más me preocupan
- acá hay ownership débil
- acá el frontend parece decidir demasiado
- acá hay roles demasiado gruesos
- acá hay una cuenta o service con demasiado poder
- acá la búsqueda o la query es peligrosa
- acá falta trazabilidad
- acá habría mucho costo para cortar un incidente

Eso ya es una base excelente para profundizar.

---

# Ejemplo de uso rápido

Supongamos que abrís una app Spring con:

- `AuthController`
- `OrderController`
- `AdminUserController`
- `OrderService`
- `RefundService`
- `SecurityConfig`
- `OrderRepository`
- `application.yml`

Una primera revisión con este checklist podría dejarte esta lista:

1. Login y reset password son sensibles
2. Cancelación y reembolso son sensibles
3. Admin cambia roles, altísimo impacto
4. Hay que revisar ownership de órdenes
5. Hay que revisar estados válidos para refund
6. Hay que ver qué rutas deja públicas SecurityConfig
7. Hay que revisar si soporte y admin están bien separados
8. Hay que revisar queries de OrderRepository
9. Hay que ver auditoría en operaciones críticas
10. Hay que revisar configuración expuesta en `application.yml`

Eso ya te ordena muchísimo la lectura.

---

# Checklist resumido

Si querés una versión corta para usar rápido, sería esta:

- ¿Qué hace la app?
- ¿Qué vale más?
- ¿Cómo autentica?
- ¿Cómo autoriza?
- ¿Qué endpoints son más sensibles?
- ¿Qué parte del request confía demasiado?
- ¿Dónde vive la regla real?
- ¿Dónde puede haber IDOR?
- ¿Qué operaciones cambian estados importantes?
- ¿Qué cuenta o service tiene demasiado poder?
- ¿Qué queries podrían abusarse?
- ¿Qué parte sería más difícil de ver o cortar?

---

# Mini ejercicio de reflexión

Agarrá una codebase Spring y respondé estas 10 cosas en una hoja o un archivo:

1. 3 activos más valiosos
2. 3 endpoints más sensibles
3. 3 cuentas o roles más peligrosos si se comprometen
4. 3 reglas de negocio que no pueden salir mal
5. 3 lugares donde el backend podría estar confiando demasiado
6. 3 queries que merecen revisión
7. 3 operaciones críticas sin suficiente contexto
8. 3 acciones que deberían auditarse
9. 3 partes difíciles de cortar en un incidente
10. 3 sospechas de diseño ingenuo

Si podés responder eso, ya hiciste una muy buena primera pasada.

---

# Resumen

Una revisión inicial útil sobre un backend Spring debería ayudarte a ubicar rápido:

- valor
- poder
- confianza
- superficies
- ownership
- estados críticos
- queries delicadas
- cuentas técnicas
- terceros
- trazabilidad
- maniobra de corte

En resumen:

> Un buen checklist inicial no reemplaza la revisión profunda, pero te evita mirar a ciegas y te acerca mucho más rápido a donde el sistema está más expuesto.

---

## Próximo tema

**Nunca confiar en el cliente en una app Spring**
