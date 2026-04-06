---
title: "Guía práctica para iniciar un proyecto con Spring Initializr"
description: "Guía de consulta general para crear un proyecto Spring Boot desde cero usando Spring Initializr."
order: 12
module: "Spring Boot - 'Initializr'"
level: "intro"
draft: false
---
# Guía práctica para iniciar un proyecto con Spring Initializr

> Guía de consulta general para crear un proyecto Spring Boot desde cero usando Spring Initializr.

---

## 1. ¿Qué es Spring Initializr?

Spring Initializr es una herramienta para generar rápidamente la base de un proyecto Spring Boot. Permite elegir:

- sistema de build (`Maven` o `Gradle`)
- lenguaje (`Java`, `Kotlin`, `Groovy`)
- versión de Spring Boot
- coordenadas del proyecto (`group`, `artifact`, `name`, `package`)
- empaquetado (`Jar` o `War`)
- versión de Java
- dependencias iniciales

Sitio principal:

- `https://start.spring.io/`

---

## 2. Requisitos previos

Antes de generar el proyecto, conviene tener instalado:

- JDK compatible con la versión de Spring Boot elegida
- un editor o IDE (IntelliJ IDEA, VS Code, Eclipse, STS, etc.)
- Git opcional, pero recomendable

Si se va a usar Spring Boot 4.x, el mínimo es Java 17.

Comandos útiles para verificar el entorno:

```bash
java -version
mvn -version
gradle -version
```

> Nota: si el proyecto se genera con wrapper, no es obligatorio tener Maven o Gradle instalados globalmente para compilar o ejecutar.

---

## 3. Cómo entrar y generar el proyecto

### Opción A: desde la web

1. Abrir `https://start.spring.io/`
2. Completar los campos del formulario
3. Elegir las dependencias necesarias
4. Pulsar **Generate**
5. Descargar el `.zip`
6. Descomprimirlo
7. Abrir la carpeta en el IDE

### Opción B: desde un IDE

Muchos IDEs integran Spring Initializr y permiten generar el proyecto desde una ventana guiada.

---

## 4. Qué significa cada campo del formulario

### Project

Define el sistema de build.

- **Maven**: usa `pom.xml`
- **Gradle**: usa `build.gradle` o `build.gradle.kts`

### Language

Lenguaje principal del proyecto.

- **Java**: opción más común
- **Kotlin**: muy usado también en ecosistema Spring
- **Groovy**: menos frecuente para nuevos proyectos

### Spring Boot

Versión de Spring Boot que tendrá el proyecto.

Conviene elegir una versión:

- estable
- compatible con la versión de Java disponible
- adecuada para el tipo de proyecto

### Project Metadata

#### Group

Equivale al identificador base de la organización o dominio invertido.

Ejemplos:

```text
com.ejemplo
ar.com.empresa
io.demo
```

#### Artifact

Nombre técnico del proyecto o módulo.

Ejemplos:

```text
api
backend
orders-service
```

#### Name

Nombre legible del proyecto. A veces coincide con `artifact`.

#### Description

Descripción breve del proyecto.

#### Package name

Paquete base donde quedará la aplicación.

Ejemplo:

```text
com.ejemplo.api
```

### Packaging

- **Jar**: opción más común en Spring Boot
- **War**: sólo si existe una necesidad concreta de desplegar en un contenedor externo

### Java

Versión del JDK usada por el proyecto.

Ejemplos frecuentes:

- `17`
- `21`

---

## 5. Primer criterio para elegir dependencias

Al generar el proyecto, lo mejor es elegir sólo lo necesario para el primer objetivo técnico.

Ejemplos:

### API REST simple

- Spring Web MVC
- Validation
- Spring Boot DevTools

### API REST con base de datos

- Spring Web MVC
- Validation
- Spring Data JPA
- PostgreSQL Driver
- Flyway o Liquibase
- Spring Boot DevTools

### API reactiva

- Spring WebFlux
- Validation
- R2DBC o MongoDB reactivo
- Spring Boot DevTools

### Backend con seguridad

- Spring Security
- OAuth2 Resource Server si se van a validar JWT

---

## 6. Plantillas de selección rápidas

### Plantilla 1: proyecto REST mínimo

- Project: Maven
- Language: Java
- Packaging: Jar
- Java: 17 o 21
- Dependencies:
  - Spring Web MVC
  - Validation
  - Spring Boot DevTools

### Plantilla 2: backend CRUD con PostgreSQL

- Project: Maven
- Language: Java
- Packaging: Jar
- Java: 17 o 21
- Dependencies:
  - Spring Web MVC
  - Validation
  - Spring Data JPA
  - PostgreSQL Driver
  - Flyway
  - Spring Boot DevTools

### Plantilla 3: API con seguridad JWT

- Project: Maven
- Language: Java
- Packaging: Jar
- Java: 17 o 21
- Dependencies:
  - Spring Web MVC
  - Validation
  - Spring Security
  - OAuth2 Resource Server
  - Spring Boot DevTools

---

## 7. Qué estructura genera Spring Initializr

Un proyecto típico generado con Maven suele traer algo parecido a esto:

```text
mi-proyecto/
├─ .mvn/
├─ src/
│  ├─ main/
│  │  ├─ java/
│  │  │  └─ com/ejemplo/demo/
│  │  │     └─ DemoApplication.java
│  │  └─ resources/
│  │     ├─ application.properties
│  │     └─ static/
│  └─ test/
│     └─ java/
├─ mvnw
├─ mvnw.cmd
├─ pom.xml
└─ .gitignore
```

Archivos clave:

- `pom.xml`: dependencias y build
- `DemoApplication.java`: clase principal
- `application.properties` o `application.yml`: configuración
- `mvnw` y `mvnw.cmd`: Maven Wrapper

---

## 8. Cómo abrir y ejecutar el proyecto

### Con Maven Wrapper

En Linux o macOS:

```bash
./mvnw spring-boot:run
```

En Windows:

```bash
mvnw.cmd spring-boot:run
```

### Con Gradle Wrapper

En Linux o macOS:

```bash
./gradlew bootRun
```

En Windows:

```bash
gradlew.bat bootRun
```

Si todo está bien, la aplicación suele iniciar en:

```text
http://localhost:8080
```

---

## 9. Primer endpoint de prueba

Una vez generado el proyecto, un primer paso práctico es crear un controlador simple.

### Archivo Java

```java
package com.ejemplo.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HolaController {

    @GetMapping("/hola")
    public String hola() {
        return "Hola, Spring Boot";
    }
}
```

Después de arrancar la aplicación, se puede probar con:

```text
http://localhost:8080/hola
```

O con `curl`:

```bash
curl http://localhost:8080/hola
```

---

## 10. Configuración mínima inicial

### `application.properties`

```properties
spring.application.name=demo
server.port=8080
```

### `application.yml`

```yaml
spring:
  application:
    name: demo

server:
  port: 8080
```

Se puede usar uno u otro formato, pero conviene mantener un único estilo por proyecto.

---

## 11. Qué hacer después de generarlo

Una secuencia práctica común puede ser esta:

1. generar el proyecto
2. abrirlo en el IDE
3. ejecutarlo con wrapper
4. comprobar que arranca
5. crear un endpoint simple
6. agregar configuración básica
7. recién después sumar persistencia, seguridad o integración externa

Este orden ayuda a detectar problemas de forma incremental.

---

## 12. Errores comunes al empezar

### Elegir demasiadas dependencias desde el inicio

Causa complejidad innecesaria y hace más difícil detectar por qué falla el arranque.

### Elegir una versión de Java incompatible

Siempre conviene revisar la compatibilidad entre Spring Boot y JDK.

### Confundir `group`, `artifact` y `package`

- `group`: identificador organizacional
- `artifact`: nombre técnico del módulo
- `package`: paquete base del código

### No usar wrapper

El wrapper simplifica la ejecución y hace el proyecto más portable.

### Mezclar `application.properties` y `application.yml` sin criterio

Lo mejor es usar un formato dominante y sostenerlo.

---

## 13. Cuándo conviene Maven y cuándo Gradle

### Maven

Conviene cuando se busca:

- estructura tradicional
- configuración explícita
- gran cantidad de ejemplos y documentación clásica

### Gradle

Conviene cuando se busca:

- scripts más flexibles
- DSL poderosa
- builds más personalizables

Para la mayoría de las guías iniciales, cualquiera de los dos sirve bien.

---

## 14. Cuándo elegir Jar y cuándo War

### Jar

Es la opción normal en Spring Boot moderno.

Ventajas:

- simple de ejecutar
- compatible con `java -jar`
- muy usada con contenedores y despliegues actuales

### War

Sólo suele elegirse cuando existe un requisito claro de despliegue en un contenedor servlet externo.

---

## 15. Dependencias frecuentes en proyectos Spring Boot

### Base web

- Spring Web MVC
- Spring WebFlux
- Validation
- Spring Boot DevTools

### Persistencia

- Spring Data JPA
- JDBC
- jOOQ
- PostgreSQL Driver
- MySQL Driver
- Flyway
- Liquibase

### Seguridad

- Spring Security
- OAuth2 Resource Server
- OAuth2 Client

### Observabilidad

- Spring Boot Actuator

### Testing

- Spring Boot Starter Test
- Testcontainers

---

## 16. Ejemplo de primera generación recomendada como punto neutro

Para una base general de aprendizaje o arranque técnico, una selección razonable puede ser:

- Project: Maven
- Language: Java
- Packaging: Jar
- Java: 17 o 21
- Dependencies:
  - Spring Web MVC
  - Validation
  - Spring Boot DevTools

Y luego ampliar según necesidad real.

---

## 17. Checklist rápido antes de generar

- [ ] ya está decidido si se usará Maven o Gradle
- [ ] ya está definida la versión de Java
- [ ] el `group` tiene sentido organizacional
- [ ] el `artifact` representa bien el proyecto
- [ ] el `package` base es correcto
- [ ] se eligieron sólo las dependencias necesarias
- [ ] el empaquetado es `Jar` salvo necesidad específica

---

## 18. Checklist rápido después de generar

- [ ] el proyecto abre bien en el IDE
- [ ] el wrapper existe
- [ ] la aplicación arranca
- [ ] responde un endpoint de prueba
- [ ] el archivo de configuración está claro
- [ ] las dependencias realmente coinciden con el objetivo del proyecto

---

## 19. Fuentes oficiales útiles

- Spring Initializr Reference Guide  
  `https://docs.spring.io/initializr/docs/current/reference/html/`

- Spring Boot System Requirements  
  `https://docs.spring.io/spring-boot/system-requirements.html`

- Spring Boot Tutorial: First Application  
  `https://docs.spring.io/spring-boot/tutorial/first-application/index.html`

- Spring Boot Build Systems  
  `https://docs.spring.io/spring-boot/reference/using/build-systems.html`

- Spring Boot DevTools  
  `https://docs.spring.io/spring-boot/reference/using/devtools.html`

---

## 20. Resumen corto

Spring Initializr sirve para crear la base de un proyecto Spring Boot de forma rápida y ordenada. El flujo más simple es:

1. entrar a `start.spring.io`
2. elegir build, lenguaje, packaging y Java
3. definir `group`, `artifact` y `package`
4. seleccionar dependencias iniciales
5. generar el proyecto
6. abrirlo en el IDE
7. ejecutarlo con wrapper
8. comprobar que arranca y responde un endpoint

A partir de ahí, el proyecto ya está listo para crecer de forma incremental.
