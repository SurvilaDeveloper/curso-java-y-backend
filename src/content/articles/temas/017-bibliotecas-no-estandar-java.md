---
title: "Bibliotecas no estándar de Java"
description: "En Java, una biblioteca no estándar es cualquier biblioteca, framework o API que no forma parte de las APIs públicas de Java SE."
order: 17
module: "Java  - 'biblioteca'"
level: "intro"
draft: false
---
# Bibliotecas no estándar de Java

## Qué significa “no estándar” en Java

En Java, una biblioteca **no estándar** es cualquier biblioteca, framework o API que **no forma parte de las APIs públicas de Java SE**.

Dicho de forma práctica:

- **Estándar**: lo que pertenece a Java SE y está definido como parte de la plataforma base.
- **No estándar**: lo que hay que agregar aparte, lo que depende de un proveedor concreto, lo que es interno del JDK o lo que históricamente existió en ciertas versiones pero ya no integra la plataforma base.

Este tema suele generar confusión porque muchas cosas “se usan con Java” o “vienen en algún JDK”, pero eso no las convierte en bibliotecas estándar de Java.

---

## Regla práctica para distinguirlas

Una biblioteca es **no estándar** si cae en alguna de estas situaciones:

1. **Se agrega como dependencia externa** mediante Maven o Gradle.
2. **Pertenece a APIs específicas del JDK** y no a Java SE.
3. **Es interna o no soportada** por la plataforma pública.
4. **Antes venía incluida en ciertas versiones**, pero en Java moderno ya no forma parte de la base.
5. **Pertenece a otro ecosistema Java relacionado**, pero distinto de Java SE, como Jakarta EE.

---

## 1. Bibliotecas de terceros

Son las más fáciles de identificar. No forman parte del estándar y se incorporan explícitamente al proyecto.

### Ejemplos muy comunes

- Spring Framework
- Spring Boot
- Hibernate ORM
- Jackson
- Gson
- Lombok
- MapStruct
- Log4j 2
- SLF4J
- JUnit 5
- Mockito
- Apache Commons
- Guava
- Netty
- OkHttp
- Retrofit
- Flyway
- Liquibase

### Características

- Se descargan desde repositorios como Maven Central.
- Tienen su propio ciclo de versiones.
- No dependen de que una implementación de Java SE las incluya.
- Pueden cambiar de API, licencia, mantenimiento o compatibilidad según sus autores.

### Idea clave

Estas bibliotecas pueden ser muy populares, incluso casi universales en ciertos proyectos, pero siguen siendo **no estándar** porque no forman parte de Java SE.

---

## 2. APIs específicas del JDK

No todo lo que aparece en un JDK pertenece al estándar Java SE.

Existe una diferencia importante entre:

- los módulos **`java.*`**, que definen la base de Java SE,
- y los módulos **`jdk.*`**, que son específicos del JDK.

### Ejemplos de módulos y APIs específicas del JDK

- `jdk.httpserver`
- `jdk.jfr`
- `jdk.jshell`
- `jdk.compiler`
- `jdk.attach`
- `jdk.management`
- `jdk.javadoc`
- `jdk.jconsole`

### Por qué no se consideran estándar

Porque no están garantizadas como parte de la plataforma Java SE en todas las implementaciones. Pueden existir en un JDK concreto y aun así no pertenecer al conjunto estándar base.

### Ejemplos prácticos

- Usar clases de **Java Flight Recorder** desde `jdk.jfr`
- Apoyarse en el compilador desde `jdk.compiler`
- Usar el servidor HTTP liviano del JDK desde `jdk.httpserver`

Estas APIs pueden ser públicas y documentadas, pero siguen siendo **JDK específicas**, no estándar en el mismo sentido que `java.lang`, `java.util` o `java.time`.

---

## 3. APIs internas o no soportadas

Esta es una categoría especialmente delicada.

### Ejemplos típicos

- `sun.*`
- `com.sun.*`
- `jdk.internal.*`

### Por qué no deben tratarse como estándar

- No forman parte de la API pública comprometida de Java SE.
- Pueden cambiar o desaparecer sin mantener compatibilidad.
- Muchas veces están presentes por necesidades internas del JDK, no para consumo general de aplicaciones.

### Ejemplos históricos frecuentes

- `sun.misc.Unsafe`
- clases internas de compilación o herramientas del JDK
- implementaciones internas de XML, reflection o networking

### Regla práctica

Si una solución depende de `sun.*` o de paquetes internos, no debe considerarse basada en bibliotecas estándar seguras para uso general.

---

## 4. APIs que antes venían incluidas y hoy ya no

Otra fuente clásica de confusión es pensar que algo “es estándar” porque alguna vez vino incluido en versiones viejas del JDK.

Con la evolución de Java, varias tecnologías dejaron de integrarse en la plataforma base.

### Casos conocidos removidos del JDK moderno

- JAXB
- JAX-WS
- SAAJ
- JAF / Java Activation Framework
- CORBA
- partes relacionadas con JTA para interoperabilidad heredada

### Qué pasó con estas APIs

En Java moderno, especialmente desde JDK 11, dejaron de formar parte de la plataforma base. Eso significa que si un proyecto las necesita, en general debe agregarlas como dependencias externas.

### Consecuencia práctica

Mucho código antiguo compilaba “de fábrica” en JDK 8 porque ciertas APIs estaban disponibles por defecto. Ese mismo código puede dejar de compilar o ejecutar en Java moderno si no se agregan dependencias explícitas.

---

## 5. JavaFX

JavaFX merece una categoría propia porque suele generar dudas.

### Qué pasa con JavaFX

- Durante una etapa estuvo asociado a distribuciones del JDK.
- En Java moderno se distribuye como **OpenJFX**.
- Normalmente se incorpora como SDK o dependencia aparte.

### Entonces, ¿es estándar?

Hoy, para fines prácticos, **no se considera parte de la biblioteca estándar base de Java SE** en el uso cotidiano moderno.

### Qué implica

Si una aplicación usa JavaFX, normalmente debe declarar dependencias o instalar componentes adicionales según la herramienta de build y la plataforma objetivo.

---

## 6. Jakarta EE y tecnologías empresariales relacionadas

Muchas APIs conocidas del ecosistema Java empresarial tampoco pertenecen a Java SE.

### Ejemplos

- Jakarta Servlet
- Jakarta Persistence (JPA)
- Jakarta RESTful Web Services
- Jakarta CDI
- Jakarta Validation
- Jakarta Mail
- Jakarta Transactions
- Jakarta Server Pages
- Jakarta Faces

### Por qué no son estándar de Java SE

Porque pertenecen al ecosistema **Jakarta EE**, que es un conjunto de especificaciones diferente de Java SE.

### Aclaración importante

Algo puede estar estandarizado dentro de **Jakarta EE** y aun así ser **no estándar respecto de Java SE**.

Es decir:

- **estándar en Jakarta EE** no significa
- **estándar de la biblioteca base de Java**.

---

## 7. Frameworks de testing, persistencia, web y observabilidad

Estas categorías aparecen tan seguido en el desarrollo real que vale la pena nombrarlas por separado.

### Testing

- JUnit
- TestNG
- Mockito
- AssertJ
- WireMock

### Persistencia y acceso a datos

- Hibernate
- EclipseLink
- MyBatis
- jOOQ
- HikariCP

### Web y APIs

- Spring MVC
- Spring WebFlux
- Jersey
- RESTEasy
- Undertow
- Netty

### Logging y observabilidad

- Logback
- Log4j 2
- Micrometer
- OpenTelemetry Java

### Migraciones y bases de datos

- Flyway
- Liquibase
- drivers JDBC de PostgreSQL, MySQL, MariaDB, SQL Server, Oracle

Nada de esto forma parte de Java SE, aunque en muchos proyectos sea habitual o casi imprescindible.

---

## 8. Herramientas y plugins del ecosistema Java

No todo lo que se usa en un proyecto Java es una biblioteca de runtime. También hay herramientas no estándar que forman parte del ecosistema.

### Ejemplos

- Maven Surefire Plugin
- Maven Compiler Plugin
- Gradle plugins
- Checkstyle
- SpotBugs
- PMD
- JaCoCo
- Error Prone

Estas herramientas pueden ser fundamentales en build, calidad o análisis estático, pero no son bibliotecas estándar de Java.

---

## 9. Bibliotecas de proveedor o implementación

Hay bibliotecas ligadas a un proveedor, servidor o implementación concreta.

### Ejemplos

- APIs o SDKs de AWS para Java
- SDKs de Google Cloud
- SDKs de Azure
- clientes de Elasticsearch
- clientes de Kafka
- drivers y conectores específicos de vendors
- bibliotecas propias de servidores de aplicaciones

Estas dependen del proveedor y del caso de uso. No forman parte del estándar Java SE.

---

## 10. Casos que suelen confundirse

### “Si viene con mi JDK, entonces es estándar”

No necesariamente. Puede ser parte del JDK y no de Java SE.

### “Si todo el mundo lo usa, entonces es estándar”

No. Popularidad no equivale a formar parte de la plataforma estándar.

### “Si tiene `javax.*`, entonces es estándar”

Tampoco necesariamente. Históricamente hubo paquetes `javax.*` en Java SE, pero también existieron APIs asociadas al ecosistema enterprise o a módulos que luego se removieron.

### “Si está documentado por Oracle, entonces es Java SE”

No siempre. Oracle documenta tanto Java SE como APIs específicas del JDK.

---

## Resumen operativo

Se puede pensar así:

### Sí es estándar

- `java.lang`
- `java.util`
- `java.io`
- `java.nio`
- `java.time`
- `java.net`
- `java.sql`
- `java.xml`
- y demás APIs públicas de Java SE

### No estándar

- bibliotecas de terceros
- frameworks
- módulos `jdk.*`
- paquetes internos como `sun.*`
- tecnologías removidas del JDK moderno
- JavaFX/OpenJFX en el uso moderno
- APIs de Jakarta EE
- SDKs de cloud y proveedores
- plugins y herramientas externas

---

## Regla final simple

Si para usar algo en un proyecto normalmente tenés que:

- agregar una dependencia,
- incorporar un SDK,
- apoyarte en un módulo `jdk.*`,
- usar una API interna,
- o integrar una especificación externa a Java SE,

entonces, en términos prácticos, estás frente a una **biblioteca no estándar de Java**.

---

## Conclusión

La expresión “biblioteca no estándar” no significa “mala”, “rara” ni “incorrecta”.

De hecho, gran parte del desarrollo Java real se apoya justamente en bibliotecas no estándar. Lo importante es distinguirlas con claridad de la biblioteca estándar base para entender:

- qué garantiza la plataforma Java SE,
- qué depende del JDK,
- qué depende de terceros,
- y qué debe declararse explícitamente en el proyecto.

Cuando esa diferencia se entiende bien, resulta mucho más fácil leer documentación, definir dependencias, migrar versiones de Java y razonar sobre portabilidad.

---

## Referencias oficiales consultadas

- Documentación oficial de Java SE y JDK
- JEP 320: Remove the Java EE and CORBA Modules
- Documentación oficial de OpenJFX
- Sitio oficial de especificaciones Jakarta EE
