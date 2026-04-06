---
title: "Dependencias para Java Backend con Spring Boot"
description: "En Spring Boot no existe una lista cerrada de “todas las librerías posibles”, porque puede integrarse con muchísimas librerías Java. Lo que sí existe es un ecosistema muy amplio de starters oficiales, módulos del ecosistema Spring y librerías de terceros que se usan habitualmente junto con Spring Boot."
order: 1
module: "Spring Boot"
level: "intro"
draft: false
---
# Glosario amplio de dependencias para Java Backend con Spring Boot

> Documento de consulta para estudio y referencia.
> En Spring Boot no existe una lista cerrada de “todas las librerías posibles”, porque puede integrarse con muchísimas librerías Java. Lo que sí existe es un ecosistema muy amplio de **starters oficiales**, módulos del **ecosistema Spring** y librerías de terceros que se usan habitualmente junto con Spring Boot.

---

## Cómo leer este glosario

Cada entrada está resumida con este criterio:

- **Dependencia**: nombre o familia de dependencias.
- **Para qué sirve**: objetivo principal.
- **Cuándo usarla**: contexto típico.
- **Alternativas / observaciones**: notas prácticas, variantes o dependencias relacionadas.

---

# 1) Núcleo y base general

## `spring-boot-starter`
**Para qué sirve:** starter base de Spring Boot. Suele aportar auto-configuración base, logging y utilidades comunes.

**Cuándo usarla:** normalmente llega de forma implícita a través de otros starters; rara vez la agregás sola en un proyecto real.

**Alternativas / observaciones:** más que una dependencia “de negocio”, es una pieza base del ecosistema Boot.

## `spring-boot-starter-actuator`
**Para qué sirve:** health checks, métricas, info, readiness/liveness, endpoints operativos.

**Cuándo usarla:** casi siempre en aplicaciones reales, especialmente si van a producción.

**Alternativas / observaciones:** suele combinarse con Micrometer, Prometheus, OpenTelemetry o Zipkin.

## `spring-boot-starter-validation`
**Para qué sirve:** validación de DTOs, parámetros y beans con Bean Validation.

**Cuándo usarla:** cuando usás `@Valid`, `@Validated`, restricciones como `@NotNull`, `@Size`, `@Email`, etc.

**Alternativas / observaciones:** en APIs REST es de las más comunes.

---

# 2) Logging y serialización

## `spring-boot-starter-logging`
**Para qué sirve:** configuración por defecto de logging.

**Cuándo usarla:** generalmente viene incluida automáticamente por otros starters.

**Alternativas / observaciones:** normalmente usa Logback como implementación por defecto.

## `spring-boot-starter-log4j2`
**Para qué sirve:** usar Log4j2 como backend de logging.

**Cuándo usarla:** si preferís Log4j2 en lugar del stack por defecto.

**Alternativas / observaciones:** suele requerir excluir el starter de logging por defecto para evitar conflictos.

## `spring-boot-starter-jackson`
**Para qué sirve:** serialización/deserialización JSON con Jackson.

**Cuándo usarla:** casi siempre en APIs REST o integraciones HTTP.

**Alternativas / observaciones:** Boot suele integrarlo automáticamente en stacks web.

## `spring-boot-starter-gson`
**Para qué sirve:** usar Gson como alternativa para JSON.

**Cuándo usarla:** cuando querés trabajar con Gson por preferencia o compatibilidad.

**Alternativas / observaciones:** Jackson es mucho más frecuente en Spring Boot.

## `spring-boot-starter-jsonb`
**Para qué sirve:** JSON-B como alternativa de serialización JSON.

**Cuándo usarla:** cuando trabajás con la especificación JSON-B.

**Alternativas / observaciones:** menos habitual que Jackson.

---

# 3) Web, HTTP y APIs

## `spring-boot-starter-web`
**Para qué sirve:** backend HTTP clásico con Spring MVC.

**Cuándo usarla:** cuando querés construir APIs REST tradicionales o apps web MVC.

**Alternativas / observaciones:** durante mucho tiempo fue la dependencia estándar para REST clásico.

## `spring-boot-starter-webflux`
**Para qué sirve:** stack reactivo con programación no bloqueante.

**Cuándo usarla:** cuando buscás un enfoque reactivo, streaming o composición reactiva.

**Alternativas / observaciones:** no es la opción por defecto para aprender backend clásico; generalmente se compara con `starter-web`.

## `spring-boot-starter-websocket`
**Para qué sirve:** comunicación bidireccional en tiempo real mediante WebSocket.

**Cuándo usarla:** chats, notificaciones push, actualización en vivo, dashboards en tiempo real.

**Alternativas / observaciones:** también puede convivir con STOMP y mensajería.

## `spring-boot-starter-hateoas`
**Para qué sirve:** construir APIs hipermedia.

**Cuándo usarla:** cuando querés incluir enlaces y recursos navegables en una API REST.

**Alternativas / observaciones:** no es de uso masivo en CRUDs simples.

## `spring-boot-starter-data-rest`
**Para qué sirve:** exponer repositorios Spring Data directamente como endpoints REST.

**Cuándo usarla:** cuando querés prototipar o exponer recursos rápidamente sobre repositorios.

**Alternativas / observaciones:** en proyectos serios muchas veces se prefiere controlar los endpoints manualmente con controllers y DTOs.

## `spring-boot-starter-jersey`
**Para qué sirve:** usar JAX-RS con Jersey en lugar del modelo típico Spring MVC.

**Cuándo usarla:** si tu stack o tus requisitos están más alineados con Jersey/JAX-RS.

**Alternativas / observaciones:** en el ecosistema Spring suele ser más frecuente Spring MVC o WebFlux.

## `spring-boot-starter-webservices`
**Para qué sirve:** servicios SOAP con Spring Web Services.

**Cuándo usarla:** integraciones heredadas o entornos empresariales que siguen usando SOAP.

**Alternativas / observaciones:** para APIs modernas suele preferirse REST o GraphQL.

## `spring-boot-starter-rsocket`
**Para qué sirve:** comunicación reactiva bidireccional y eficiente con RSocket.

**Cuándo usarla:** sistemas distribuidos, streaming o comunicación cliente-servidor avanzada.

**Alternativas / observaciones:** menos común que REST tradicional.

## `spring-boot-starter-graphql`
**Para qué sirve:** construir APIs GraphQL sobre Spring Boot.

**Cuándo usarla:** cuando necesitás consultas flexibles desde frontend o múltiples clientes.

**Alternativas / observaciones:** suele convivir con transporte web (`web` o `webflux`).

---

# 4) Clientes HTTP

## `spring-boot-starter-webclient`
**Para qué sirve:** cliente HTTP reactivo (`WebClient`).

**Cuándo usarla:** consumo de APIs externas, integraciones HTTP modernas, llamadas no bloqueantes.

**Alternativas / observaciones:** suele ser la opción recomendada frente a `RestTemplate` en proyectos nuevos.

## `spring-boot-starter-restclient`
**Para qué sirve:** cliente HTTP bloqueante más moderno del ecosistema Spring.

**Cuándo usarla:** cuando querés consumir APIs externas con un cliente más actual dentro del enfoque bloqueante.

**Alternativas / observaciones:** convive con `WebClient` pero responde a otro estilo de programación.

---

# 5) Persistencia SQL y acceso relacional

## `spring-boot-starter-jdbc`
**Para qué sirve:** acceso directo a base de datos usando JDBC.

**Cuándo usarla:** cuando querés control fino del SQL o una capa simple con `JdbcTemplate`.

**Alternativas / observaciones:** menos abstracción que JPA.

## `spring-boot-starter-data-jdbc`
**Para qué sirve:** persistencia relacional con Spring Data JDBC.

**Cuándo usarla:** cuando querés una alternativa más simple que JPA/Hibernate, manteniendo una experiencia Spring Data.

**Alternativas / observaciones:** buena opción si querés menos magia que JPA.

## `spring-boot-starter-data-jpa`
**Para qué sirve:** persistencia con JPA y normalmente Hibernate.

**Cuándo usarla:** CRUDs, sistemas de negocio clásicos, entidades, relaciones y repositorios.

**Alternativas / observaciones:** probablemente la dependencia de persistencia más usada en backend Spring Boot tradicional.

## `spring-boot-starter-jooq`
**Para qué sirve:** SQL tipado y generado con jOOQ.

**Cuándo usarla:** cuando querés escribir SQL con mucho control y seguridad de tipos.

**Alternativas / observaciones:** suele ser elegida por equipos que prefieren SQL explícito frente a ORM.

## `spring-boot-starter-r2dbc`
**Para qué sirve:** acceso reactivo a bases relacionales.

**Cuándo usarla:** aplicaciones reactivas end-to-end.

**Alternativas / observaciones:** se asocia naturalmente con WebFlux.

## `spring-boot-starter-data-r2dbc`
**Para qué sirve:** integración Spring Data sobre R2DBC.

**Cuándo usarla:** si querés repositorios reactivos para bases relacionales.

**Alternativas / observaciones:** es la contraparte reactiva del mundo Spring Data relacional.

---

# 6) Drivers de bases de datos relacionales

Estas no son starters de Spring Boot, pero casi siempre las agregás junto con JDBC, JPA o R2DBC.

## PostgreSQL Driver
**Para qué sirve:** conexión a PostgreSQL.

**Cuándo usarla:** cuando tu base es PostgreSQL.

**Alternativas / observaciones:** muy usada en proyectos modernos.

## MySQL Driver
**Para qué sirve:** conexión a MySQL.

**Cuándo usarla:** cuando tu base es MySQL.

**Alternativas / observaciones:** frecuente en aplicaciones heredadas y muchos hostings compartidos.

## MariaDB Driver
**Para qué sirve:** conexión a MariaDB.

**Cuándo usarla:** cuando trabajás con MariaDB.

**Alternativas / observaciones:** puede reemplazar a MySQL en muchos escenarios.

## SQL Server Driver
**Para qué sirve:** conexión a Microsoft SQL Server.

**Cuándo usarla:** entornos corporativos Microsoft.

**Alternativas / observaciones:** común en empresas grandes.

## Oracle Driver
**Para qué sirve:** conexión a Oracle Database.

**Cuándo usarla:** entornos empresariales y legacy corporativo.

**Alternativas / observaciones:** muchas veces aparece en sistemas bancarios, grandes ERPs y aplicaciones históricas.

## H2
**Para qué sirve:** base embebida muy usada para tests y desarrollo local.

**Cuándo usarla:** prototipos, demos, pruebas rápidas.

**Alternativas / observaciones:** no reemplaza una base real de producción salvo casos muy específicos.

---

# 7) Migraciones de base de datos

## `spring-boot-starter-flyway`
**Para qué sirve:** versionado y ejecución de migraciones SQL.

**Cuándo usarla:** cuando querés control de esquema desde archivos versionados.

**Alternativas / observaciones:** muy usada por su simplicidad y enfoque claro.

## `spring-boot-starter-liquibase`
**Para qué sirve:** gestión de cambios de esquema y datos con changelogs.

**Cuándo usarla:** cuando preferís un enfoque más declarativo o querés mayor expresividad en migraciones.

**Alternativas / observaciones:** alternativa muy conocida a Flyway.

---

# 8) NoSQL y stores alternativos

## `spring-boot-starter-data-mongodb`
**Para qué sirve:** integración con MongoDB.

**Cuándo usarla:** documentos JSON/BSON, modelos flexibles, colecciones documentales.

**Alternativas / observaciones:** también existe versión reactiva.

## `spring-boot-starter-data-mongodb-reactive`
**Para qué sirve:** MongoDB reactivo.

**Cuándo usarla:** si tu app usa WebFlux o un stack reactivo.

**Alternativas / observaciones:** normalmente se elige junto con programación reactiva completa.

## `spring-boot-starter-data-redis`
**Para qué sirve:** integración con Redis.

**Cuándo usarla:** cache, sesiones, colas livianas, rate limiting, estructuras rápidas.

**Alternativas / observaciones:** extremadamente común como complemento.

## `spring-boot-starter-data-redis-reactive`
**Para qué sirve:** Redis reactivo.

**Cuándo usarla:** entornos reactivos.

**Alternativas / observaciones:** suele verse menos que la variante clásica.

## `spring-boot-starter-data-elasticsearch`
**Para qué sirve:** integración con Elasticsearch.

**Cuándo usarla:** búsqueda avanzada, indexación, filtros complejos, observabilidad.

**Alternativas / observaciones:** se usa mucho cuando la búsqueda supera lo que conviene hacer con SQL tradicional.

## `spring-boot-starter-data-neo4j`
**Para qué sirve:** integración con Neo4j.

**Cuándo usarla:** modelos de grafos, relaciones complejas, navegación relacional profunda.

**Alternativas / observaciones:** no es común en CRUDs típicos, pero sí en dominios específicos.

## `spring-boot-starter-data-cassandra`
**Para qué sirve:** integración con Cassandra.

**Cuándo usarla:** sistemas distribuidos, alta disponibilidad, grandes volúmenes.

**Alternativas / observaciones:** depende mucho del caso de uso.

## `spring-boot-starter-data-cassandra-reactive`
**Para qué sirve:** Cassandra reactiva.

**Cuándo usarla:** entornos reactivos sobre Cassandra.

**Alternativas / observaciones:** menos frecuente en aprendizaje inicial.

## `spring-boot-starter-data-couchbase`
**Para qué sirve:** integración con Couchbase.

**Cuándo usarla:** documentos y key-value en entornos que ya usan Couchbase.

**Alternativas / observaciones:** más de nicho que MongoDB o Redis.

## `spring-boot-starter-data-couchbase-reactive`
**Para qué sirve:** Couchbase reactivo.

**Cuándo usarla:** si necesitás esa combinación específica.

**Alternativas / observaciones:** bastante menos frecuente.

## `spring-boot-starter-data-ldap`
**Para qué sirve:** acceso a LDAP mediante Spring Data.

**Cuándo usarla:** directorios corporativos, autenticación empresarial, consultas a LDAP.

**Alternativas / observaciones:** suele verse en integración empresarial.

## `spring-boot-starter-ldap`
**Para qué sirve:** soporte LDAP general.

**Cuándo usarla:** autenticación o consultas contra directorios LDAP.

**Alternativas / observaciones:** complementa necesidades de seguridad e integración corporativa.

---

# 9) Seguridad, autenticación y autorización

## `spring-boot-starter-security`
**Para qué sirve:** seguridad base de la aplicación.

**Cuándo usarla:** autenticación, autorización, filtros, protección de rutas, reglas de acceso.

**Alternativas / observaciones:** es la base para casi cualquier estrategia de seguridad en Spring Boot.

## `spring-boot-starter-oauth2-client`
**Para qué sirve:** login OAuth2 y cliente OAuth2.

**Cuándo usarla:** login social, integración con Google, GitHub, Keycloak, Okta, etc.

**Alternativas / observaciones:** puede convivir con OIDC.

## `spring-boot-starter-oauth2-resource-server`
**Para qué sirve:** validar tokens bearer/JWT en una API.

**Cuándo usarla:** APIs protegidas con JWT emitidos por un proveedor externo o propio.

**Alternativas / observaciones:** muy común en microservicios y APIs modernas.

## `spring-boot-starter-oauth2-authorization-server`
**Para qué sirve:** montar un servidor de autorización.

**Cuándo usarla:** cuando necesitás emitir tokens, manejar clientes OAuth2 y flujos de autorización.

**Alternativas / observaciones:** no es para todos los proyectos; muchas veces se usa un proveedor externo.

## `spring-boot-starter-security-test`
**Para qué sirve:** testing de seguridad.

**Cuándo usarla:** pruebas de endpoints protegidos, usuarios simulados, roles, autenticación.

**Alternativas / observaciones:** muy útil cuando el proyecto usa Spring Security.

## `spring-boot-starter-security-saml2`
**Para qué sirve:** integración SAML 2.

**Cuándo usarla:** entornos empresariales con SSO basado en SAML.

**Alternativas / observaciones:** más común en contextos corporativos que en apps públicas pequeñas.

---

# 10) Mensajería e integración asíncrona

## `spring-boot-starter-amqp`
**Para qué sirve:** integración AMQP, típicamente RabbitMQ.

**Cuándo usarla:** colas, eventos, procesamiento asíncrono, desacople entre servicios.

**Alternativas / observaciones:** una de las opciones más comunes para mensajería tradicional.

## `spring-boot-starter-kafka`
**Para qué sirve:** integración con Apache Kafka.

**Cuándo usarla:** eventos, streaming, pipelines de datos, microservicios orientados a eventos.

**Alternativas / observaciones:** muy frecuente en arquitecturas distribuidas.

## `spring-boot-starter-pulsar`
**Para qué sirve:** integración con Apache Pulsar.

**Cuándo usarla:** plataformas que adoptan Pulsar como broker/event bus.

**Alternativas / observaciones:** más de nicho que Kafka o RabbitMQ.

## `spring-boot-starter-jms`
**Para qué sirve:** soporte JMS.

**Cuándo usarla:** integración con brokers compatibles JMS.

**Alternativas / observaciones:** más habitual en sistemas empresariales heredados.

## `spring-boot-starter-activemq`
**Para qué sirve:** integración con ActiveMQ.

**Cuándo usarla:** sistemas que dependen de ActiveMQ.

**Alternativas / observaciones:** relacionado al mundo JMS.

## `spring-boot-starter-artemis`
**Para qué sirve:** integración con Artemis.

**Cuándo usarla:** proyectos que usan ActiveMQ Artemis.

**Alternativas / observaciones:** otra opción del ecosistema JMS.

## `spring-boot-starter-integration`
**Para qué sirve:** patrones de integración empresarial con Spring Integration.

**Cuándo usarla:** flujos complejos entre sistemas, routing, adapters, pipelines internos.

**Alternativas / observaciones:** muy poderosa, pero más especializada.

---

# 11) Batch, jobs y scheduling

## `spring-boot-starter-batch`
**Para qué sirve:** procesamiento batch.

**Cuándo usarla:** importaciones masivas, procesos nocturnos, consolidación de datos, ETLs livianos.

**Alternativas / observaciones:** típica en sistemas empresariales.

## `spring-boot-starter-batch-jdbc`
**Para qué sirve:** soporte batch con JDBC.

**Cuándo usarla:** batch persistiendo metadatos y estado en una base relacional.

**Alternativas / observaciones:** suele ser complementaria.

## `spring-boot-starter-quartz`
**Para qué sirve:** scheduler avanzado con Quartz.

**Cuándo usarla:** cron jobs persistentes, jobs distribuidos, agenda robusta.

**Alternativas / observaciones:** más completo que un simple `@Scheduled`.

---

# 12) Sesiones, cache y estado compartido

## `spring-boot-starter-session-data-redis`
**Para qué sirve:** guardar sesiones en Redis.

**Cuándo usarla:** aplicaciones distribuidas, múltiples instancias, sesiones compartidas.

**Alternativas / observaciones:** muy útil cuando no querés depender de la memoria local de cada instancia.

## `spring-boot-starter-session-jdbc`
**Para qué sirve:** guardar sesiones en base de datos relacional.

**Cuándo usarla:** si querés persistencia de sesión sin usar Redis.

**Alternativas / observaciones:** puede ser más simple operativamente si ya tenés una BD relacional y no querés otro componente.

## `spring-boot-starter-cache`
**Para qué sirve:** abstracción de caché de Spring.

**Cuándo usarla:** optimizar lecturas, reducir consultas repetidas, cachear resultados costosos.

**Alternativas / observaciones:** puede respaldarse con Redis, Caffeine, Hazelcast y otros proveedores.

## `spring-boot-starter-hazelcast`
**Para qué sirve:** integración con Hazelcast.

**Cuándo usarla:** cache distribuido, sesiones, datos en memoria compartidos.

**Alternativas / observaciones:** más frecuente en arquitecturas que ya trabajan con grids en memoria.

---

# 13) Email y comunicaciones tradicionales

## `spring-boot-starter-mail`
**Para qué sirve:** envío de emails.

**Cuándo usarla:** recuperación de contraseña, notificaciones, confirmaciones, mails transaccionales.

**Alternativas / observaciones:** suele apoyarse en SMTP o proveedores externos.

---

# 14) Templates y renderizado del lado servidor

## `spring-boot-starter-thymeleaf`
**Para qué sirve:** renderizado HTML del lado servidor con Thymeleaf.

**Cuándo usarla:** aplicaciones MVC clásicas, paneles administrativos, páginas renderizadas desde backend.

**Alternativas / observaciones:** muy tradicional dentro de Spring MVC.

## `spring-boot-starter-freemarker`
**Para qué sirve:** templates con FreeMarker.

**Cuándo usarla:** si el proyecto usa ese motor de plantillas.

**Alternativas / observaciones:** menos frecuente que Thymeleaf en Spring moderno.

## `spring-boot-starter-mustache`
**Para qué sirve:** templates con Mustache.

**Cuándo usarla:** sitios o vistas server-side simples.

**Alternativas / observaciones:** minimalista en comparación con otros motores.

## `spring-boot-starter-groovy-templates`
**Para qué sirve:** templates Groovy.

**Cuándo usarla:** proyectos que ya usan Groovy en vistas.

**Alternativas / observaciones:** mucho menos habitual.

---

# 15) Observabilidad, métricas y tracing

## `spring-boot-starter-micrometer-metrics`
**Para qué sirve:** métricas con Micrometer.

**Cuándo usarla:** monitoreo, dashboards, exportación a Prometheus y sistemas similares.

**Alternativas / observaciones:** normalmente acompaña a Actuator.

## `spring-boot-starter-opentelemetry`
**Para qué sirve:** integración con OpenTelemetry.

**Cuándo usarla:** trazas distribuidas, observabilidad moderna, correlación entre servicios.

**Alternativas / observaciones:** muy útil en microservicios.

## `spring-boot-starter-zipkin`
**Para qué sirve:** integración con Zipkin para tracing.

**Cuándo usarla:** cuando tu stack de observabilidad usa Zipkin.

**Alternativas / observaciones:** hoy muchas arquitecturas también miran OpenTelemetry como estándar.

## `spring-boot-starter-cloudfoundry`
**Para qué sirve:** adaptación a despliegue/gestión en Cloud Foundry.

**Cuándo usarla:** si tu infraestructura realmente corre ahí.

**Alternativas / observaciones:** de uso muy contextual.

---

# 16) Testing

## `spring-boot-starter-test`
**Para qué sirve:** testing general de aplicaciones Spring Boot.

**Cuándo usarla:** casi siempre.

**Alternativas / observaciones:** suele incluir herramientas y configuraciones de prueba habituales del ecosistema Spring.

## Test slices
**Para qué sirven:** probar partes específicas de la app sin levantar todo el contexto.

**Cuándo usarlas:** cuando querés tests más rápidos y enfocados.

**Ejemplos habituales:**
- pruebas web MVC
- pruebas JPA
- pruebas JDBC
- pruebas GraphQL
- pruebas de seguridad

**Alternativas / observaciones:** se complementan con `@SpringBootTest` para pruebas integrales.

## Testcontainers
**Para qué sirve:** levantar servicios reales en contenedores durante tests.

**Cuándo usarla:** pruebas de integración con PostgreSQL, MySQL, Kafka, Redis, etc.

**Alternativas / observaciones:** aunque no es un starter core de Boot, es una de las librerías más valiosas para testing serio.

---

# 17) Documentación y contrato de API

## `spring-boot-starter-restdocs`
**Para qué sirve:** generar documentación de API a partir de tests.

**Cuándo usarla:** cuando querés documentación confiable y alineada con el comportamiento real.

**Alternativas / observaciones:** se diferencia de Swagger/OpenAPI porque parte del test, no del escaneo del código.

## `springdoc-openapi`
**Para qué sirve:** generar documentación OpenAPI/Swagger UI para APIs Spring Boot.

**Cuándo usarla:** cuando querés explorar y exponer la API rápidamente.

**Alternativas / observaciones:** no es un starter oficial de Spring Boot, pero es de las librerías externas más usadas.

---

# 18) Ecosistema Spring usado junto con Spring Boot

Estas no siempre se agregan como “starter core de Boot”, pero se usan muchísimo en proyectos reales.

## Spring Cloud Config
**Para qué sirve:** configuración centralizada.

**Cuándo usarla:** múltiples microservicios con config compartida.

## Spring Cloud Gateway
**Para qué sirve:** API Gateway.

**Cuándo usarla:** en arquitecturas de microservicios.

## Spring Cloud OpenFeign
**Para qué sirve:** cliente HTTP declarativo entre servicios.

**Cuándo usarla:** comunicación service-to-service con interfaces.

## Spring Cloud Stream
**Para qué sirve:** programación orientada a eventos sobre brokers.

**Cuándo usarla:** si trabajás con Kafka, RabbitMQ u otros sistemas de mensajería abstraídos.

## Spring Cloud Circuit Breaker
**Para qué sirve:** tolerancia a fallos.

**Cuándo usarla:** integraciones externas, microservicios, resiliencia.

## Spring Cloud Contract
**Para qué sirve:** contract testing entre servicios.

**Cuándo usarla:** cuando hay varios equipos o servicios que comparten contratos HTTP/mensajería.

## Spring Cloud Function
**Para qué sirve:** lógica basada en funciones, útil incluso para serverless.

**Cuándo usarla:** arquitecturas event-driven o despliegues función-como-servicio.

## Spring Cloud Vault
**Para qué sirve:** manejo de secretos y configuración desde Vault.

**Cuándo usarla:** credenciales, secretos y configuración sensible centralizada.

---

# 19) Librerías de terceros muy comunes con Spring Boot

## Lombok
**Para qué sirve:** reducir boilerplate.

**Cuándo usarla:** getters, setters, builders, constructores, logs, etc.

**Alternativas / observaciones:** útil, pero conviene usarla con criterio para no ocultar demasiado el código.

## MapStruct
**Para qué sirve:** mapear DTOs, entidades y modelos.

**Cuándo usarla:** cuando querés mapeos claros y generados en compilación.

**Alternativas / observaciones:** muy usada en proyectos con capas bien separadas.

## Resilience4j
**Para qué sirve:** circuit breaker, retry, bulkhead, rate limiter, time limiter.

**Cuándo usarla:** resiliencia ante fallos en servicios externos.

**Alternativas / observaciones:** muy común en microservicios.

## QueryDSL
**Para qué sirve:** construcción tipada de consultas.

**Cuándo usarla:** cuando las queries dinámicas crecen mucho.

**Alternativas / observaciones:** una opción conocida junto a JPA.

## Mockito
**Para qué sirve:** mocks para tests.

**Cuándo usarla:** pruebas unitarias e integración parcial.

**Alternativas / observaciones:** muy estándar en Java.

## WireMock
**Para qué sirve:** simular servicios HTTP externos.

**Cuándo usarla:** tests de integración contra APIs de terceros.

**Alternativas / observaciones:** muy útil cuando no querés depender de un servicio externo real.

---

# 20) Dependencias típicas según el tipo de proyecto

## API REST clásica con base relacional
Suele usar:
- `spring-boot-starter-web`
- `spring-boot-starter-validation`
- `spring-boot-starter-security`
- `spring-boot-starter-data-jpa` o `spring-boot-starter-jdbc`
- driver de base de datos
- `spring-boot-starter-flyway` o `spring-boot-starter-liquibase`
- `spring-boot-starter-actuator`
- `spring-boot-starter-test`

## API con JWT
Suele agregar además:
- `spring-boot-starter-oauth2-resource-server`

## App reactiva
Suele usar:
- `spring-boot-starter-webflux`
- `spring-boot-starter-r2dbc` o `spring-boot-starter-data-r2dbc`
- `spring-boot-starter-security`
- `spring-boot-starter-actuator`

## App con mensajería/eventos
Suele usar:
- `spring-boot-starter-kafka` o `spring-boot-starter-amqp`
- `spring-boot-starter-actuator`
- métricas / tracing

## App empresarial grande
Puede sumar:
- `spring-boot-starter-batch`
- `spring-boot-starter-quartz`
- `spring-boot-starter-session-data-redis`
- `spring-boot-starter-cache`
- `spring-boot-starter-mail`
- Testcontainers
- Resilience4j
- springdoc-openapi

---

# 21) Qué conviene memorizar primero

Si estás estudiando Spring Boot backend, las dependencias que más conviene dominar primero son:

1. `spring-boot-starter-web`
2. `spring-boot-starter-validation`
3. `spring-boot-starter-security`
4. `spring-boot-starter-data-jpa`
5. `spring-boot-starter-jdbc`
6. driver de PostgreSQL o MySQL
7. `spring-boot-starter-flyway`
8. `spring-boot-starter-actuator`
9. `spring-boot-starter-test`
10. `spring-boot-starter-oauth2-resource-server`

Después de eso, ya conviene ampliar con:
- Redis
- Kafka o RabbitMQ
- GraphQL
- WebFlux
- Quartz
- Batch
- Spring Cloud
- Testcontainers
- springdoc-openapi

---

# 22) Cierre

Este glosario no pretende ser “la lista eterna de todo lo que un proyecto Java puede usar con Spring Boot”, sino un mapa amplio y ordenado de las dependencias más relevantes del ecosistema Spring Boot para backend.

La forma más sana de estudiarlo es por capas:

- **web**
- **validación**
- **seguridad**
- **persistencia**
- **migraciones**
- **testing**
- **observabilidad**
- **integraciones**

Si querés, el próximo paso natural es convertir este glosario en cualquiera de estas tres versiones:

1. **tabla resumida tipo machete de estudio**
2. **tabla con coordenadas Maven/Gradle**
3. **roadmap en orden de aprendizaje de dependencias Spring Boot**
