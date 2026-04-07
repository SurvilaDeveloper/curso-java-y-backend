---
title: "Bibliotecas necesarias para backend Java"
description: "Cuando se habla de las “bibliotecas necesarias” para backend Java, no existe una lista única que sirva para todos los proyectos. Un backend pequeño para una API CRUD no necesita exactamente lo mismo que un sistema con autenticación, mensajería, cache distribuida, documentación OpenAPI, migraciones de base de datos o pruebas de integración con contenedores."
order: 18
module: "Java  - 'biblioteca'"
level: "intro"
draft: false
---
# Bibliotecas necesarias para backend Java

## Introducción

Cuando se habla de las “bibliotecas necesarias” para backend Java, no existe una lista única que sirva para todos los proyectos. Un backend pequeño para una API CRUD no necesita exactamente lo mismo que un sistema con autenticación, mensajería, cache distribuida, documentación OpenAPI, migraciones de base de datos o pruebas de integración con contenedores.

Aun así, en el ecosistema Java moderno hay un conjunto de bibliotecas que aparecen una y otra vez, especialmente cuando se trabaja con **Spring Boot**.

Este artículo organiza esas bibliotecas en tres grupos:

1. **Las que casi siempre conviene tener**.
2. **Las que se agregan según el tipo de backend**.
3. **Las que mucha gente suma demasiado pronto, pero no siempre son necesarias**.

---

## La base práctica: el backend Java moderno suele partir de Spring Boot

En la práctica, hoy gran parte del backend Java parte de **Spring Boot**, porque simplifica la creación de aplicaciones ejecutables, la configuración y la gestión de dependencias. En este ecosistema, en lugar de declarar decenas de librerías manualmente, normalmente se agregan **starters** como `spring-boot-starter-web` o `spring-boot-starter-data-jpa`, que ya traen el conjunto de dependencias apropiado para cada necesidad.

Por eso, al hablar de bibliotecas necesarias para backend Java, conviene pensar primero en una **base de Spring Boot** y luego en los complementos concretos del proyecto.

---

## 1. Bibliotecas casi necesarias en la mayoría de los backends Java

### 1. `spring-boot-starter-web`

Es la biblioteca base para crear aplicaciones web clásicas y APIs REST con Spring MVC.

Suele ser necesaria cuando el backend expone endpoints HTTP.

Aporta, entre otras cosas:

- infraestructura web con Spring MVC,
- serialización y deserialización JSON,
- soporte para controladores REST,
- servidor embebido para ejecutar la aplicación.

**Cuándo usarla:**

- APIs REST,
- backends monolíticos tradicionales,
- servicios HTTP síncronos.

---

### 2. `spring-boot-starter-validation`

Es una de las dependencias más útiles y más fáciles de subestimar.

Permite validar datos de entrada con anotaciones como:

- `@NotNull`
- `@NotBlank`
- `@Size`
- `@Email`
- `@Min`
- `@Max`

En backend, la validación no debería quedar solo en el frontend. También debe existir en el servidor para proteger reglas de negocio, contratos de API y consistencia de datos.

**Cuándo usarla:**

- prácticamente siempre que el backend recibe DTOs, formularios o payloads JSON.

---

### 3. Acceso a datos: una de estas opciones

No todos los proyectos acceden a base de datos de la misma forma, pero la mayoría necesita alguna capa de persistencia. Acá no se agregan todas juntas, sino la que corresponda.

#### Opción A: `spring-boot-starter-data-jpa`

Es la opción más habitual para proyectos CRUD tradicionales con bases relacionales.

Se usa cuando querés trabajar con:

- entidades,
- repositorios,
- ORM,
- consultas derivadas,
- integración con Hibernate/JPA.

**Ideal para:**

- APIs administrativas,
- sistemas empresariales,
- aplicaciones con modelo de dominio persistente.

#### Opción B: `spring-boot-starter-jdbc`

Es una alternativa más simple y directa cuando no querés usar JPA/Hibernate.

Sirve si preferís:

- escribir SQL explícito,
- tener más control sobre las consultas,
- evitar parte de la complejidad del ORM.

**Ideal para:**

- aplicaciones más cercanas a SQL,
- servicios con consultas muy específicas,
- proyectos donde se prioriza el control sobre la abstracción.

#### Opción C: `spring-boot-starter-data-r2dbc`

Se usa en backends reactivos que acceden a bases relacionales sin el modelo bloqueante clásico.

**Ideal para:**

- stacks reactivos,
- aplicaciones construidas con WebFlux,
- escenarios donde realmente tiene sentido el enfoque no bloqueante.

---

### 4. Driver de base de datos

Además de la capa de acceso a datos, normalmente hace falta el driver de la base elegida. Algunos ejemplos comunes:

- PostgreSQL
- MySQL
- MariaDB
- SQL Server
- Oracle Database

El driver **sí es una dependencia necesaria** cuando el backend usa esa base. La elección depende del motor real del proyecto.

---

### 5. `spring-boot-starter-actuator`

Es una dependencia extremadamente recomendable para entornos reales.

Permite exponer información operativa de la aplicación, por ejemplo:

- estado de salud,
- métricas,
- información del entorno,
- disponibilidad,
- endpoints de observabilidad.

No es una biblioteca “decorativa”: en producción ayuda a monitorear, diagnosticar y operar el servicio.

**Cuándo usarla:**

- casi siempre en aplicaciones que van a desplegarse.

---

### 6. `spring-boot-starter-test`

Si el backend va a mantenerse seriamente, necesita pruebas.

Este starter reúne el conjunto típico para testing en aplicaciones Spring Boot.

A partir de ahí, se pueden cubrir:

- pruebas unitarias,
- pruebas de capa web,
- pruebas de integración,
- pruebas del contexto Spring.

**Cuándo usarla:**

- siempre que el proyecto tenga una base mínima de calidad.

---

## 2. Bibliotecas muy importantes según el tipo de backend

### 7. `spring-boot-starter-security`

Cuando el backend maneja autenticación, autorización o rutas protegidas, esta dependencia pasa a ser central.

Sirve para implementar, entre otras cosas:

- login,
- control de acceso,
- filtros de seguridad,
- protección de endpoints,
- seguridad a nivel de método.

**Cuándo usarla:**

- APIs con usuarios,
- paneles administrativos,
- backends con roles y permisos,
- servicios protegidos por token o sesión.

Si el proyecto usa JWT, OAuth2 o un proveedor de identidad externo, a veces también se agregan starters complementarios del ecosistema Spring Security.

---

### 8. Migraciones de base de datos: `Flyway` o `Liquibase`

Una aplicación seria no debería depender de “scripts sueltos” ejecutados manualmente en cada ambiente.

Por eso suelen incorporarse herramientas de migración como:

- **Flyway**
- **Liquibase**

Ambas permiten versionar y aplicar cambios de esquema de base de datos de forma controlada.

**Cuándo usar una de ellas:**

- siempre que la aplicación tenga una base relacional y evolucione en el tiempo.

**No se suelen usar las dos juntas** como norma general. Lo normal es elegir una.

---

### 9. `springdoc-openapi-starter-webmvc-ui`

Si el backend expone una API pública o interna que debe ser consumida por frontend, mobile, otros servicios o equipos, documentarla bien ahorra muchísimo tiempo.

`springdoc-openapi` automatiza la generación de documentación OpenAPI y de interfaces como Swagger UI.

**Cuándo usarla:**

- APIs REST que van a ser consumidas por terceros,
- equipos donde backend y frontend trabajan por separado,
- proyectos donde importa tener documentación navegable.

---

### 10. `Testcontainers`

Es una biblioteca muy valiosa para pruebas de integración reales.

Permite levantar dependencias reales en contenedores para tests, por ejemplo:

- PostgreSQL,
- MySQL,
- Redis,
- Kafka,
- RabbitMQ,
- otros servicios externos.

Esto evita depender de bases en memoria poco realistas cuando la aplicación en producción usa otra cosa.

**Cuándo usarla:**

- cuando querés pruebas de integración más fieles al entorno real,
- cuando tu backend depende de servicios externos o infraestructura concreta.

---

### 11. `spring-boot-starter-data-redis`

No todos los backends necesitan Redis, pero cuando aparece cache distribuida, sesiones compartidas, rate limiting o estructuras rápidas en memoria, esta dependencia pasa a ser importante.

**Cuándo usarla:**

- cache,
- sesiones distribuidas,
- colas simples,
- throttling,
- almacenamiento rápido de datos efímeros.

---

### 12. Mensajería: Kafka o RabbitMQ

Cuando el backend trabaja con procesamiento asíncrono o integración entre servicios, aparece la mensajería.

Bibliotecas frecuentes:

- `spring-kafka`
- `spring-boot-starter-amqp` para RabbitMQ

**Cuándo usarlas:**

- eventos de dominio,
- procesamiento desacoplado,
- colas de trabajo,
- integración entre microservicios.

---

### 13. `spring-boot-starter-mail`

Se usa cuando el backend debe enviar correos:

- verificación de cuenta,
- recuperación de contraseña,
- notificaciones,
- comprobantes,
- alertas.

**Cuándo usarla:**

- solo si el sistema realmente envía email.

---

### 14. `spring-boot-starter-webflux`

Es el starter web reactivo de Spring.

No reemplaza automáticamente a `spring-boot-starter-web`; responde a otro modelo de programación.

**Cuándo usarlo:**

- cuando el proyecto es deliberadamente reactivo,
- cuando tiene sentido el procesamiento no bloqueante de punta a punta.

**Cuándo no usarlo por inercia:**

- si tu backend es una API CRUD tradicional, porque ahí muchas veces el stack clásico con MVC es más directo y suficiente.

---

## 3. Bibliotecas útiles, pero no imprescindibles desde el primer día

### 15. Lombok

Muy usada para reducir código repetitivo.

Puede resultar cómoda, pero no es una biblioteca fundamental para que el backend exista. Es una decisión de productividad, no una necesidad estructural.

---

### 16. MapStruct

Muy útil para mapear entidades y DTOs, especialmente en proyectos medianos o grandes.

Tampoco es obligatoria al principio. Suma valor cuando el proyecto empieza a tener mucho mapeo repetitivo.

---

### 17. Spring Cloud

Importante en ciertos ecosistemas de microservicios, pero no debería entrar automáticamente en cualquier backend.

Primero conviene tener claro si realmente necesitás:

- configuración centralizada,
- service discovery,
- circuit breakers,
- gateways,
- patrones distribuidos más complejos.

---

### 18. Observabilidad avanzada

Herramientas como trazas distribuidas, exporters, collectors y plataformas de observabilidad son muy valiosas, pero no siempre son lo primero que necesita un backend pequeño.

Antes conviene tener:

- logs razonables,
- pruebas,
- health checks,
- métricas básicas,
- manejo consistente de errores.

---

## 4. Combinaciones prácticas según el tipo de proyecto

### A. Backend CRUD clásico

Conjunto habitual:

- `spring-boot-starter-web`
- `spring-boot-starter-validation`
- `spring-boot-starter-data-jpa` o `spring-boot-starter-jdbc`
- driver de base de datos
- `spring-boot-starter-actuator`
- `spring-boot-starter-test`
- `Flyway` o `Liquibase`
- `springdoc-openapi-starter-webmvc-ui` (muy recomendable)

---

### B. Backend con autenticación y autorización

Conjunto habitual:

- todo lo anterior,
- `spring-boot-starter-security`
- eventualmente soporte adicional para JWT u OAuth2 si el sistema lo requiere.

---

### C. Backend con arquitectura asíncrona

Conjunto habitual:

- base CRUD o API,
- `spring-kafka` o `spring-boot-starter-amqp`,
- `Testcontainers` para probar dependencias reales,
- quizás Redis si hay cache o coordinación ligera.

---

### D. Backend reactivo

Conjunto habitual:

- `spring-boot-starter-webflux`
- `spring-boot-starter-validation`
- `spring-boot-starter-data-r2dbc`
- driver o soporte compatible con el stack reactivo
- `spring-boot-starter-actuator`
- `spring-boot-starter-test`
- `springdoc-openapi` si expone API documentada

---

## 5. Una recomendación práctica para no sobredimensionar el stack

Un error común es agregar demasiadas bibliotecas “por si acaso”.

Eso suele traer:

- más complejidad,
- más tiempo de arranque,
- más superficie de configuración,
- más dependencias transitivas,
- más cosas para mantener y actualizar,
- más superficie potencial de seguridad.

Lo razonable es arrancar con una base mínima sólida y sumar solo lo que el proyecto necesita de verdad.

Una combinación inicial muy sensata para muchísimos backends Java es esta:

- `spring-boot-starter-web`
- `spring-boot-starter-validation`
- `spring-boot-starter-data-jpa` o `spring-boot-starter-jdbc`
- driver de base de datos
- `spring-boot-starter-actuator`
- `spring-boot-starter-test`
- `Flyway` o `Liquibase`
- `springdoc-openapi-starter-webmvc-ui`

Y recién después evaluar:

- `spring-boot-starter-security`
- `Testcontainers`
- Redis
- Kafka o RabbitMQ
- WebFlux
- otras bibliotecas más específicas.

---

## 6. Lista resumida

### Núcleo muy frecuente

- `spring-boot-starter-web`
- `spring-boot-starter-validation`
- `spring-boot-starter-data-jpa` o `spring-boot-starter-jdbc`
- driver de base de datos
- `spring-boot-starter-actuator`
- `spring-boot-starter-test`

### Muy recomendables en proyectos reales

- `Flyway` o `Liquibase`
- `springdoc-openapi-starter-webmvc-ui`

### Según necesidad

- `spring-boot-starter-security`
- `Testcontainers`
- `spring-boot-starter-data-redis`
- `spring-kafka`
- `spring-boot-starter-amqp`
- `spring-boot-starter-mail`
- `spring-boot-starter-webflux`
- `spring-boot-starter-data-r2dbc`

### Útiles pero no obligatorias desde el inicio

- Lombok
- MapStruct
- Spring Cloud
- observabilidad avanzada y tooling adicional

---

## Conclusión

Las bibliotecas “necesarias” para backend Java no deberían entenderse como una lista infinita de dependencias para agregar desde el primer minuto. La idea más útil es otra: construir una base pequeña, sólida y mantenible.

Para la mayoría de los backends Java modernos, esa base arranca con:

- web,
- validación,
- persistencia,
- driver de base de datos,
- testing,
- monitoreo básico,
- migraciones,
- documentación.

Después, el resto depende del problema real: seguridad, mensajería, cache, reactividad, integraciones, observabilidad avanzada o infraestructura distribuida.

Un buen backend no es el que tiene más bibliotecas, sino el que tiene **las bibliotecas correctas para su contexto**.

---

## Referencias oficiales sugeridas

- Spring Boot Reference Documentation
- Spring Boot Starters y Build Systems
- Spring Security Reference
- Spring Boot Validation
- Spring Boot Actuator
- JUnit 5 User Guide
- Testcontainers Documentation
- Flyway Documentation
- Liquibase Documentation
- springdoc-openapi
