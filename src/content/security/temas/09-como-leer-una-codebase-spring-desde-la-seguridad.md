---
title: "Cómo leer una codebase Spring desde la seguridad"
description: "Cómo revisar una codebase Java con Spring Boot con ojos de seguridad. Qué buscar primero, qué archivos mirar, qué señales suelen revelar más riesgo y cómo recorrer controllers, services, repositories y configuración con mejor criterio."
order: 9
module: "Fundamentos"
level: "intro"
draft: false
---

# Cómo leer una codebase Spring desde la seguridad

## Objetivo del tema

Aprender a revisar una codebase Java + Spring Boot desde seguridad sin perderse en miles de archivos ni quedarse solo mirando endpoints aislados.

La idea de este tema es responder esta pregunta:

> Cuando abrís un proyecto Spring por primera vez, ¿cómo lo recorrés para detectar rápido dónde puede estar lo más delicado?

Porque una cosa es saber conceptos de seguridad.

Y otra muy distinta es entrar a una codebase real y poder decir:

- qué me preocupa primero
- qué archivos voy a abrir antes
- qué clases probablemente concentran más riesgo
- qué decisiones de diseño quiero entender
- qué patrones me hacen ruido aunque todavía no haya encontrado un bug concreto

---

## Idea clave

Leer una codebase desde seguridad no significa leer todo.

Significa leer **con criterio**.

En resumen:

> Una revisión útil no empieza por cualquier archivo. Empieza por ubicar rápido valor, poder, superficies, flujos sensibles, cuentas con alcance delicado y puntos donde el sistema parece confiar demasiado.

---

## Error común al revisar una codebase

Muchos arrancan así:

- abren el primer controller
- saltan a un service
- leen entidades al azar
- recorren archivos sin prioridad
- buscan “alguna vulnerabilidad” suelta

Eso suele generar dos problemas:

1. mucho tiempo perdido
2. poca comprensión del riesgo real

Una lectura mejor arranca con una estrategia.

---

## Qué querés descubrir primero

Cuando abrís una codebase Spring desde seguridad, al principio no querés saber todos los detalles.

Querés contestar estas preguntas:

1. ¿Qué hace esta aplicación?
2. ¿Qué partes parecen más sensibles?
3. ¿Cómo autentica?
4. ¿Cómo autoriza?
5. ¿Qué operaciones cambian estados importantes?
6. ¿Qué recursos parecen tener ownership?
7. ¿Dónde puede haber abuso de negocio?
8. ¿Qué integraciones o cuentas técnicas existen?
9. ¿Qué tan separadas están las capas?
10. ¿Qué parte parece diseñada con demasiada confianza?

Si resolvés eso primero, la lectura mejora muchísimo.

---

## Primera pasada: entender el sistema sin entrar todavía en detalle

Antes de leer métodos finos, conviene ubicar el mapa general.

### Cosas que querés detectar rápido

- tipo de aplicación
- dominio principal
- recursos principales
- actores principales
- operaciones críticas
- módulo de seguridad
- configuración sensible
- integraciones externas
- jobs, eventos o automatizaciones

### Archivos que suelen ayudar mucho al principio

- `pom.xml` o `build.gradle`
- `application.properties` o `application.yml`
- clases de configuración de Spring Security
- package structure
- controllers principales
- servicios de autenticación
- entidades importantes
- integración con terceros
- clases de auditoría o logging
- configuración de Actuator, Swagger o perfiles

---

## Empezá por el negocio, no por los detalles técnicos

Antes de obsesionarte con filtros y anotaciones, conviene entender:

- ¿es un e-commerce?
- ¿es un panel admin?
- ¿es un SaaS multiusuario?
- ¿es una API interna?
- ¿maneja pagos?
- ¿maneja órdenes?
- ¿maneja cuentas?
- ¿maneja roles?
- ¿maneja documentos?
- ¿maneja soporte o backoffice?

Porque eso te dice qué probablemente vale más.

### Ejemplo

Si la app maneja:

- usuarios
- roles
- órdenes
- pagos
- reembolsos
- panel admin

entonces ya sabés que te va a interesar mucho revisar:

- autenticación
- autorización
- ownership
- estados
- montos
- integraciones
- auditoría
- soporte/admin

---

## Qué mirar primero en una codebase Spring

## 1. Configuración de seguridad

Si existe seguridad web, querés verla rápido.

Buscá clases como:

- `SecurityConfig`
- `WebSecurityConfig`
- `SecurityConfiguration`
- filtros JWT
- configuración de CORS
- configuración de sesiones
- beans de `PasswordEncoder`
- `AuthenticationManager`
- `UserDetailsService`

### Qué preguntas hacerte

- ¿usa sesión o JWT?
- ¿qué endpoints quedan públicos?
- ¿qué endpoints quedan autenticados?
- ¿hay distinción real entre user y admin?
- ¿hay rutas demasiado abiertas?
- ¿hay reglas globales demasiado gruesas?
- ¿qué filtros se usan?
- ¿hay manejo raro de tokens?
- ¿qué tan fácil parece “pasar” una identidad por todo el sistema?

---

## 2. Controllers

Después conviene mirar controllers para ver la superficie expuesta.

### Qué buscar

- endpoints sensibles
- endpoints admin
- endpoints de auth
- endpoints de soporte
- endpoints de cambio de estado
- endpoints que aceptan DTOs grandes
- endpoints con IDs directos
- búsquedas, filtros y paginaciones
- uploads
- webhooks
- exports

### Qué señales suelen hacer ruido

- `@RequestBody` con entidades
- `PATCH` genéricos
- endpoints que usan `userId` desde request
- muchos parámetros de búsqueda libres
- ausencia total de actor en operaciones sensibles
- responses demasiado grandes
- operaciones delicadas demasiado directas

---

## 3. Services

Después de ubicar la superficie, querés entender dónde vive la verdad del negocio.

### Preguntas útiles

- ¿la regla real vive acá o en el controller?
- ¿este service valida ownership?
- ¿este service valida estados?
- ¿este service recalcula cosas críticas?
- ¿este service deja auditoría?
- ¿este service entiende el actor?
- ¿o ejecuta operaciones sensibles sin contexto suficiente?

### Señales de ruido

- services casi vacíos
- services que hacen persistencia directa sin validar mucho
- operaciones críticas con muy poca lógica
- ausencia de contexto del actor
- métodos demasiado poderosos
- flujos sensibles demasiado lineales

---

## 4. Repositories

Muchas veces el repository parece aburrido, pero ayuda muchísimo a entender exposición de datos y alcance real.

### Qué buscar

- búsquedas por ID sin ownership
- filtros por tenant ausentes
- queries demasiado abiertas
- paginación sin límite
- ordenamientos arbitrarios
- JPQL o native queries riesgosas
- repositorios que devuelven entidades completas cuando no hace falta
- queries para admin mezcladas con queries de usuario común

### Preguntas útiles

- ¿cómo se llega a datos ajenos?
- ¿qué consultas podrían automatizarse?
- ¿hay enumeración fácil?
- ¿se proyecta demasiado?
- ¿hay consultas especialmente costosas o abusables?

---

## 5. Entidades y DTOs

Esto te ayuda a detectar qué datos existen y cómo se mezclan con exposición externa.

### Qué mirar

- entidades JPA
- relaciones entre objetos
- campos sensibles
- flags internos
- roles
- ownership
- estados
- timestamps
- soft delete
- visibilidad
- approval flags
- datos de auditoría

### Qué señales de riesgo suelen aparecer

- entidades devueltas directamente en responses
- DTOs de entrada demasiado amplios
- campos internos que parecen controlables por cliente
- estados mutables sin mucha restricción
- relaciones delicadas sin ownership claro
- datos sensibles sin tratamiento especial

---

## Cómo ordenar la lectura

Una secuencia muy útil es esta:

## Paso 1
Entender qué módulos tiene la app

## Paso 2
Ubicar auth y security config

## Paso 3
Encontrar endpoints más sensibles

## Paso 4
Seguir esos endpoints hacia service

## Paso 5
Ver qué queries y entidades tocan

## Paso 6
Revisar si hay ownership, rol, estado, auditoría y límites

## Paso 7
Recién después abrir detalles secundarios

Eso te da una lectura mucho más rentable que empezar aleatoriamente.

---

## Qué partes suelen concentrar más riesgo

En una app Spring, estas zonas suelen merecer atención prioritaria:

- login, refresh, reset password
- cambio de rol
- endpoints admin
- soporte y backoffice
- órdenes, pagos, reembolsos
- exports
- búsquedas con filtros
- uploads
- webhooks
- integraciones externas
- configuración de seguridad
- cuentas técnicas
- jobs automáticos
- acciones con cambio de estado

No significa que todo lo demás sea seguro.
Significa que ahí suele estar el mejor retorno de lectura inicial.

---

## Qué patrones hacen ruido rápido

Cuando estés leyendo, estas cosas deberían prender alarmas:

- controller que acepta entidad completa
- service que no recibe actor ni contexto
- `findById` seguido de response directa
- `PATCH` genérico para estados
- `hasRole()` usado como única defensa
- repositorios demasiado abiertos
- DTOs con campos internos
- totals, prices o ownerId viniendo del cliente
- paneles admin o soporte con mucho poder
- cuentas técnicas globales
- Swagger o Actuator sin cuidado
- lógica crítica repartida entre frontend y controller
- poca trazabilidad en acciones delicadas

---

## Cómo distinguir archivos importantes de archivos accesorios

No todo archivo pesa igual en seguridad.

### Suelen ser más importantes

- security config
- auth service
- controllers sensibles
- services de negocio crítico
- servicios admin
- repositories con búsquedas amplias
- DTOs de entrada delicados
- entidades con roles, ownership, estado o dinero
- integraciones y webhooks
- configuración de secretos o perfiles
- auditoría
- jobs automáticos

### Suelen ser menos prioritarios al principio

- mappers triviales
- utilidades muy pequeñas
- clases de presentación sin lógica
- configuración cosmética
- helpers sin relación con permisos o datos delicados

---

## Cómo leer controllers con mentalidad de seguridad

Cuando abras un controller, no lo leas solo como “API”.

Leelo con estas preguntas:

- ¿qué actor llega acá?
- ¿qué parámetros recibe?
- ¿qué parte del request controla demasiado?
- ¿qué IDs podrían probarse?
- ¿qué operación crítica representa?
- ¿este endpoint es de lectura o de cambio?
- ¿qué pasaría si alguien se salta la UI?
- ¿qué service llama?
- ¿ese service parece fuerte o débil?
- ¿esto parece demasiado cómodo?

---

## Cómo leer services con mentalidad de seguridad

Cuando abras un service, preguntate:

- ¿acá vive la regla real?
- ¿acá se valida ownership?
- ¿acá se valida el estado?
- ¿acá se recalculan valores críticos?
- ¿acá se autoriza de verdad o solo se asume?
- ¿este método podría abusarse si lo llama otro flujo?
- ¿deja auditoría?
- ¿hay riesgo de repetición, carrera o doble ejecución?
- ¿hay demasiado poder concentrado acá?

---

## Cómo leer repositories con mentalidad de seguridad

Cuando abras un repository, preguntate:

- ¿trae por ID sin más?
- ¿filtra por actor o tenant?
- ¿devuelve demasiado?
- ¿podría usarse para enumerar?
- ¿acepta sorting demasiado libre?
- ¿acepta filtros poco controlados?
- ¿hay native queries?
- ¿la query refleja reglas reales o solo acceso técnico?

---

## Cómo leer configuración con mentalidad de seguridad

En `application.yml`, `application.properties` y configs, fijate:

- perfiles
- secretos
- CORS
- Actuator
- Swagger/OpenAPI
- sesiones
- expiración de tokens
- headers de seguridad
- endpoints públicos
- URLs de terceros
- credenciales
- flags que alteran comportamiento

### Señales de ruido

- secretos en texto plano
- perfiles de dev demasiado cerca de prod
- Actuator abierto de más
- documentación expuesta sin criterio
- timeouts o validaciones ausentes en integraciones
- defaults inseguros

---

## Ejemplo de lectura guiada

Supongamos que abrís esta app y encontrás:

- `AuthController`
- `AdminUserController`
- `OrderController`
- `OrderService`
- `UserRepository`
- `SecurityConfig`

Una lectura buena podría ser:

### 1. SecurityConfig
- qué rutas están abiertas
- cómo autentica
- qué rolado general existe

### 2. AuthController
- login
- refresh
- reset
- activación

### 3. AdminUserController
- cambio de rol
- bloqueo
- altas sensibles

### 4. OrderController
- lectura por ID
- cancelación
- creación

### 5. OrderService
- ownership
- transición de estado
- auditoría
- cálculos

### 6. UserRepository y OrderRepository
- queries por actor
- exposición por ID
- filtros

Eso ya te da una foto mucho más útil que leer veinte archivos al azar.

---

## Qué querés producir al terminar una primera lectura

No hace falta que salgas con una auditoría perfecta.

En una primera buena pasada ya deberías poder decir algo como:

- estos son los módulos más sensibles
- estas son las operaciones con más impacto
- estas son las cuentas o roles más poderosos
- estas son las superficies que más me preocupan
- acá parece haber ownership débil
- acá el frontend parece decidir demasiado
- acá hay demasiado poder en admin/soporte
- acá la query parece demasiado abierta
- acá la arquitectura parece confiar demasiado

Eso ya es muchísimo valor.

---

## Señal de lectura madura

Una lectura madura de codebase no busca solo “si hay un bug”.

Busca entender:

- dónde está el valor
- dónde está el poder
- dónde está la confianza
- dónde están las rutas de crecimiento del daño
- dónde están los puntos de corte
- dónde el sistema parece demasiado cómodo para el actor equivocado

---

## Checklist práctico

Cuando abras una codebase Spring desde seguridad, preguntate:

- ¿qué hace esta app?
- ¿qué parte vale más?
- ¿cómo autentica?
- ¿cómo autoriza?
- ¿qué endpoints parecen más delicados?
- ¿qué services concentran más poder?
- ¿qué recursos tienen ownership?
- ¿qué roles o cuentas técnicas tienen demasiado alcance?
- ¿qué queries parecen demasiado abiertas?
- ¿qué configs o integraciones merecen revisión temprana?
- ¿qué flujos sensibles no veo suficientemente protegidos?

---

## Mini ejercicio de reflexión

Tomá una codebase Spring real o imaginaria y hacé esta primera pasada:

1. Identificá 5 controllers sensibles
2. Identificá 5 services sensibles
3. Identificá 3 repositories que más te interesaría revisar
4. Identificá 3 clases de configuración críticas
5. Escribí en una línea por qué cada una te preocupa

Después respondé:

- ¿estabas leyendo la app por criticidad?
- ¿o solo por orden alfabético y azar?

Ese cambio de método mejora muchísimo la calidad de revisión.

---

## Resumen

Leer una codebase Spring desde seguridad no es leer todo.

Es leer mejor.

Conviene empezar por:

- entender el negocio
- ubicar auth y security config
- detectar endpoints sensibles
- seguirlos a service
- revisar queries, DTOs, entidades y configuración
- buscar valor, poder, confianza y rutas de daño

En resumen:

> Una buena revisión de seguridad no empieza por el primer archivo que encontrás.
> Empieza por el lugar donde el sistema parece más valioso, más poderoso o más ingenuamente confiado.

---

## Próximo tema

**Checklist mental inicial para revisar un backend Spring**
