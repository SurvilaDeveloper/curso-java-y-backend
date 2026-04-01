---
title: "Proyecto integrador"
description: "Cómo unir varias piezas del roadmap en un proyecto backend real que sirva para consolidar, practicar y demostrar lo aprendido."
order: 45
module: "Cierre de etapa y proyección"
level: "intermedio"
draft: false
---

## Introducción

A esta altura del recorrido ya viste una base muy amplia y muy valiosa:

- fundamentos del lenguaje
- orientación a objetos
- colecciones
- excepciones
- fechas
- archivos
- Maven
- HTTP
- JSON
- API REST
- Spring Boot
- controllers
- services
- DTOs
- validaciones
- manejo de errores
- repository
- JPA
- Hibernate
- consultas
- testing
- Spring Security
- JWT
- despliegue
- Docker
- buenas prácticas y roadmap de profundización

Eso ya no es “solo teoría suelta”.
Eso ya es una base para construir un sistema real.

Por eso esta lección apunta a algo muy importante:

**integrar todo en un proyecto**

## Qué es un proyecto integrador

Un proyecto integrador es un proyecto pensado para conectar varias de las piezas aprendidas en un solo sistema coherente.

No se trata solo de “hacer una app más”.

Se trata de construir algo que te obligue a usar, combinar y justificar decisiones sobre:

- diseño
- arquitectura
- validaciones
- seguridad
- persistencia
- testing
- despliegue

## Por qué es tan importante

Porque una cosa es entender temas por separado y otra muy distinta es hacer que todos convivan bien dentro de una aplicación.

El proyecto integrador sirve para pasar de:

- “sé qué es cada cosa”
- a
- “sé usar varias cosas juntas con criterio”

Ese salto es muy importante.

## La idea general

Un buen proyecto integrador no necesita ser gigantesco.

De hecho, muchas veces conviene que sea:

- acotado
- realista
- bien diseñado
- terminado
- mejorable

Es mejor un proyecto mediano, limpio y completo que uno enorme, desordenado y a medio hacer.

## Qué debería tener un buen proyecto integrador

No hay una única forma correcta, pero a esta altura del roadmap un proyecto muy valioso suele incluir varias de estas piezas:

- API REST
- varias entidades del dominio
- DTOs
- validaciones
- manejo global de errores
- services
- repositories
- JPA con base real
- autenticación
- roles o permisos
- tests
- Docker
- despliegue básico

## Qué objetivo tiene realmente

El objetivo no es solo “hacer andar endpoints”.

El objetivo es poder demostrar cosas como:

- que sabés estructurar una app
- que entendés separación de responsabilidades
- que sabés proteger rutas
- que sabés persistir datos
- que sabés validar entrada
- que sabés responder errores con coherencia
- que sabés desplegar algo funcional

## Cómo elegir el tema del proyecto

Conviene elegir un dominio que sea:

- entendible
- suficientemente rico
- no exageradamente complejo
- interesante de construir

Algunas opciones muy buenas para esta etapa son:

- e-commerce simple
- gestor de tareas
- sistema de reservas
- sistema de cursos
- gestor de inventario
- backend para notas o productividad
- panel administrativo de catálogo

## Qué hace bueno a un dominio para practicar

Un buen dominio para practicar suele permitir:

- CRUDs claros
- relaciones entre entidades
- validaciones reales
- casos de negocio interesantes
- seguridad por roles
- consultas útiles
- testing representativo

## Ejemplo fuerte: e-commerce simple

Un e-commerce simple es un proyecto muy bueno para integrar conocimientos porque permite trabajar con cosas como:

- usuarios
- productos
- categorías
- carrito
- órdenes
- stock
- seguridad
- roles
- validaciones
- persistencia real

## Ejemplo fuerte: sistema de tareas

También puede ser excelente si querés algo más acotado.

Por ejemplo:

- usuarios
- autenticación
- tareas
- estados
- etiquetas
- filtros
- paginación
- seguridad por propietario

Aunque parezca más simple, también da muchísimo juego para practicar backend serio.

## Qué entidades conviene incluir

No hace falta meter veinte entidades de entrada.

Conviene elegir pocas, pero bien pensadas.

Por ejemplo, para un e-commerce básico:

- `User`
- `Product`
- `Category`
- `Order`
- `OrderItem`

O para tareas:

- `User`
- `Task`
- `Tag`

## Qué roles podrían existir

Tener al menos dos roles puede aportar muchísimo al proyecto.

Por ejemplo:

- `USER`
- `ADMIN`

Eso te permite practicar:

- autenticación
- autorización
- endpoints públicos y privados
- permisos por rol
- diferencias de acceso realistas

## Qué endpoints mínimos debería tener

Un proyecto integrador razonable suele incluir:

### Públicos

- login
- registro, si aplica
- quizás catálogo público, según el caso

### Privados

- perfil del usuario
- operaciones del usuario autenticado
- recursos propios del usuario

### Admin

- gestión de entidades principales
- endpoints de administración

## Ejemplo de módulos para un e-commerce simple

### Auth

- `POST /auth/register`
- `POST /auth/login`

### Products

- `GET /products`
- `GET /products/{id}`
- `POST /products` solo admin
- `PUT /products/{id}` solo admin
- `DELETE /products/{id}` solo admin

### Categories

- `GET /categories`
- `POST /categories` solo admin

### Orders

- `POST /orders`
- `GET /orders/me`
- `GET /orders/{id}`
- `PATCH /orders/{id}/status` solo admin o según reglas

## Qué conceptos del roadmap podés integrar ahí

### Lenguaje y POO

- clases
- objetos
- encapsulación
- enums
- colecciones
- excepciones

### Spring Boot

- controllers
- services
- repositories
- DTOs
- validaciones
- manejo de errores

### Persistencia

- entidades JPA
- relaciones
- consultas
- repositorios

### Seguridad

- Spring Security
- JWT
- roles
- protección de rutas

### Calidad

- tests
- estructura de proyecto
- separación de responsabilidades

### Producción

- Docker
- variables de entorno
- despliegue inicial

## Proyecto integrador no significa meter todo de golpe

Esto es muy importante.

No conviene arrancar queriendo implementar todo al mismo tiempo.

Una forma más sana es trabajar por etapas.

## Etapa 1: estructura mínima

Primero conviene tener:

- proyecto Spring Boot creado
- base de paquetes
- configuración inicial
- una entidad simple
- un controller
- un service
- un repository

Objetivo:
tener una base limpia y funcionando.

## Etapa 2: persistencia real

Después sumar:

- PostgreSQL
- entidades JPA
- relaciones básicas
- repositorios reales
- algunas consultas útiles

Objetivo:
dejar de depender de memoria y pasar a persistencia seria.

## Etapa 3: DTOs + validaciones + errores

Después sumar:

- DTOs de request y response
- Bean Validation
- manejo global de errores
- respuestas consistentes

Objetivo:
hacer la API más profesional y robusta.

## Etapa 4: seguridad

Después sumar:

- Spring Security
- JWT
- roles
- endpoints protegidos
- login real

Objetivo:
dejar de tener una API totalmente abierta.

## Etapa 5: testing

Después sumar:

- tests unitarios de services
- tests web de controllers
- tests de validación
- tests de repository donde aporte

Objetivo:
subir la confianza y la mantenibilidad.

## Etapa 6: despliegue

Después sumar:

- Docker
- variables de entorno
- build reproducible
- despliegue básico

Objetivo:
cerrar el ciclo completo de una app real.

## Qué priorizar si te sentís abrumado

Si todo junto parece demasiado, una prioridad muy buena suele ser esta:

1. estructura limpia
2. CRUD serio
3. DTOs
4. validaciones
5. errores
6. JPA
7. seguridad
8. testing
9. Docker
10. despliegue

Eso te da una progresión bastante realista.

## Qué cosas conviene sí o sí demostrar en el proyecto

A esta altura, si querés que el proyecto realmente muestre tu nivel, conviene que tenga al menos varias de estas señales:

- endpoints bien pensados
- capas separadas
- DTOs
- validaciones
- manejo de errores consistente
- seguridad básica
- persistencia real
- alguna consulta útil
- tests
- forma clara de correrlo

## Qué errores conviene evitar en el proyecto integrador

### 1. Hacer un CRUD gigante pero sin diseño

No importa solo la cantidad de endpoints.

### 2. Exponer entidades directo por todos lados

DTOs siguen siendo muy importantes.

### 3. No manejar errores de forma consistente

Eso baja muchísimo la calidad percibida de la API.

### 4. Saltar a microservicios o arquitectura enorme demasiado pronto

A esta etapa le conviene más profundidad que grandilocuencia.

### 5. Dejar el proyecto sin terminar

Cerrar una versión usable enseña muchísimo.

## Qué entregables debería tener

Un proyecto integrador serio idealmente debería poder ofrecer:

- código ordenado
- README claro
- instrucciones para correrlo
- variables necesarias explicadas
- endpoints principales documentados
- ejemplos de uso
- quizá colección de Postman o documentación básica

## README: por qué importa tanto

Muchísima gente construye algo interesante pero no explica cómo correrlo.

Eso baja mucho el valor práctico del proyecto.

Un buen README debería contar al menos:

- qué hace el proyecto
- stack usado
- cómo correrlo
- variables necesarias
- cómo probar endpoints principales
- si hay usuarios demo o datos de ejemplo

## Qué documentación mínima conviene incluir

Podrías incluir cosas como:

- módulos principales
- endpoints importantes
- roles existentes
- pasos de arranque
- ejemplo de login
- ejemplo de uso de token JWT

No hace falta escribir una tesis.
Hace falta que sea usable por otra persona.

## Cómo saber si el proyecto está bien encaminado

Una buena señal es poder responder con claridad cosas como:

- qué capas tiene y por qué
- qué rutas son públicas y cuáles privadas
- dónde están las validaciones
- dónde están los errores globales
- cómo se mapea entidad a DTO
- cómo se autentica el usuario
- cómo se corre el proyecto
- cómo se conecta a la base

Si podés explicar eso con claridad, el proyecto ya está tomando forma madura.

## Proyecto integrador como portfolio

Este tipo de proyecto sirve muchísimo para portfolio porque demuestra varias cosas a la vez.

No solo “sé Java”.

Demuestra:

- sé construir backend
- sé estructurar código
- sé persistir datos
- sé proteger endpoints
- sé validar entrada
- sé devolver respuestas razonables
- sé testear
- sé desplegar

Eso vale mucho más que una lista suelta de conceptos.

## Qué versión 1 conviene apuntar a cerrar

Una v1 sana de un proyecto integrador podría tener:

- login
- roles básicos
- CRUD principal funcionando
- DTOs
- validaciones
- errores globales
- PostgreSQL
- algunos tests clave
- Docker básico
- README claro

Eso ya sería una entrega muy digna y muy útil.

## Qué mejoras podrían venir en una v2

Después de cerrar una v1, podrías profundizar con cosas como:

- filtros
- paginación
- ordenamiento
- refresh tokens
- más tests
- documentación OpenAPI / Swagger
- cache
- mejores logs
- CI/CD
- observabilidad básica

Eso da un camino muy natural de mejora continua.

## Ejemplo completo de propuesta de proyecto

### Nombre conceptual

`Commerce Lab API`

### Objetivo

Backend de e-commerce simple con autenticación, catálogo, categorías y órdenes.

### Tecnologías

- Java
- Spring Boot
- Spring Security
- JWT
- Spring Data JPA
- PostgreSQL
- Maven
- Docker

### Entidades posibles

- `User`
- `Role`
- `Product`
- `Category`
- `Order`
- `OrderItem`

### Funcionalidades mínimas

- registro y login
- listar productos
- crear y editar productos como admin
- crear órdenes como usuario autenticado
- listar órdenes propias
- cambiar estado de orden como admin
- validaciones y errores globales
- tests de piezas importantes
- Docker para app y base

## Qué roadmap interno podría tener ese proyecto

### Fase 1

- auth
- user
- product
- category

### Fase 2

- order
- order item
- reglas básicas de negocio

### Fase 3

- tests
- Docker
- despliegue
- README fuerte

## Otra propuesta: Task Manager API

Si querés algo más corto pero muy sólido:

### Entidades

- `User`
- `Task`
- `Tag`

### Funcionalidades

- login
- CRUD de tareas
- tareas por usuario
- tags
- filtros por estado
- seguridad por propietario
- DTOs
- validaciones
- tests
- Docker

También sería un excelente proyecto integrador.

## Cómo decidir entre uno y otro

### Elegí e-commerce si querés practicar más dominio de negocio y más relaciones

### Elegí task manager si querés algo más corto y fácil de cerrar con alta calidad

Ambos sirven muchísimo.

## Qué aprender construyendo el integrador

Un proyecto así te va a enseñar no solo técnica, sino también criterio sobre:

- prioridades
- alcance
- consistencia
- refactor
- debugging
- diseño
- decisiones de seguridad
- decisiones de persistencia
- terminación real de software

Eso lo vuelve especialmente valioso.

## Buenas prácticas al construirlo

## 1. Trabajar por incrementos pequeños

No intentes cerrar todo de golpe.

## 2. Mantener una arquitectura clara desde temprano

Eso te ahorra mucho dolor después.

## 3. Hacer commits con sentido

Aunque no estemos profundizando Git acá, ordenar el trabajo ayuda muchísimo.

## 4. Cerrar versiones funcionales

Una versión chica pero usable vale mucho.

## 5. Volver a refactorizar

Un proyecto integrador también sirve para practicar mejora continua, no solo “primera versión que anda”.

## Comparación con otros lenguajes

### Si venís de JavaScript

Probablemente ya conozcas el valor de tener un proyecto que una routing, auth, base de datos y deploy. En Java pasa igual, pero con un énfasis muy fuerte en estructura, claridad de capas y robustez de backend.

### Si venís de Python

Puede recordarte a construir una app completa que combine vistas, modelos, seguridad y persistencia. En Java y Spring Boot, el proyecto integrador cumple un rol muy parecido: convertir conocimiento disperso en una práctica coherente y defendible.

## Errores comunes

### 1. Hacer algo demasiado grande para terminar

Conviene más algo acotado y sólido.

### 2. No elegir una prioridad clara

Eso dispersa mucho el esfuerzo.

### 3. Querer “usar todo” aunque no aporte

No hace falta meter tecnologías porque sí.

### 4. No documentar el proyecto

Eso le quita muchísimo valor práctico.

### 5. Nunca cerrar una v1

Cerrar una primera versión usable enseña muchísimo.

## Mini ejercicio

Elegí una de estas dos opciones:

1. e-commerce simple
2. task manager con usuarios

Y definí por escrito:

- entidades principales
- roles
- endpoints mínimos
- qué parte será pública
- qué parte será privada
- qué validaciones mínimas tendrá
- qué tests harías primero
- cómo lo correrías con Docker

## Ejemplo posible

### Opción: task manager

Entidades:

- `User`
- `Task`
- `Tag`

Roles:

- `USER`
- `ADMIN`

Público:

- login
- registro

Privado:

- CRUD de tareas
- listado de tareas propias

Admin:

- ver todos los usuarios
- administrar ciertas tareas si aplica

## Resumen

En esta lección viste que:

- un proyecto integrador sirve para unir varias piezas del roadmap en una aplicación coherente
- no hace falta que sea enorme, pero sí que esté bien pensado y bien cerrado
- un buen integrador puede demostrar diseño, persistencia, seguridad, testing y despliegue
- conviene construirlo por etapas y priorizar una v1 sólida
- documentarlo bien aumenta muchísimo su valor
- usarlo como base de mejora continua es una de las mejores formas de seguir creciendo

## Siguiente tema

A partir de acá, el siguiente paso natural ya no es solo sumar teoría, sino elegir un proyecto, construirlo por etapas y usarlo como base para profundizar cada una de las áreas del roadmap.
