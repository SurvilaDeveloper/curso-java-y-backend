---
title: "Creando catalog-service con Spring Initializr"
description: "Creación del primer microservicio real del proyecto práctico. Generación de catalog-service con Spring Initializr, configuración mínima y primer arranque de Spring Boot."
order: 3
module: "Módulo 1 · Preparación del proyecto y primeros servicios"
level: "base"
draft: false
---

# Creando `catalog-service` con Spring Initializr

En esta clase vamos a crear el primer microservicio real de **NovaMarket**:

**`catalog-service`**

Este servicio va a ser el encargado de exponer el catálogo de productos del sistema.  
Más adelante va a tener modelos, endpoints, persistencia e integración con otras piezas, pero hoy el objetivo es más simple:

**generarlo correctamente, ubicarlo en el proyecto, arrancarlo y verificar que el servicio base funcione.**

Este paso es muy importante porque fija el patrón que vamos a repetir después con otros servicios.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creado el proyecto `catalog-service`,
- ubicado dentro del monorepo de NovaMarket,
- con configuración mínima inicial,
- y arrancando correctamente con Spring Boot.

Todavía no vamos a crear endpoints funcionales de catálogo.  
Solo vamos a dejar listo el servicio base.

---

## Estado de partida

Partimos desde el workspace creado en la clase anterior.

Debería existir algo así:

```txt
novamarket/
  services/
  infrastructure/
  config-repo/
  docs/
  scripts/
```

En este punto, `services/` todavía no contiene ningún proyecto Spring Boot.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- generar `catalog-service` con Spring Initializr,
- definir sus dependencias iniciales,
- ubicarlo dentro de `services/`,
- revisar su estructura,
- ajustar configuración mínima,
- y arrancarlo por primera vez.

---

## Paso 1 · Abrir Spring Initializr

Podés usar Spring Initializr desde navegador o desde el flujo que prefieras si tu IDE ya lo integra.

La idea es generar un proyecto Maven estándar para arrancar con una base limpia.

---

## Paso 2 · Configuración recomendada en Initializr

Para este curso práctico, una configuración razonable para `catalog-service` es esta:

### Project
**Maven**

### Language
**Java**

### Spring Boot
Elegí una versión estable y moderna compatible con el stack que vayas a usar en el resto del curso.

### Group
Podés usar algo simple y consistente, por ejemplo:

```txt
com.novamarket
```

### Artifact
```txt
catalog-service
```

### Name
```txt
catalog-service
```

### Packaging
```txt
Jar
```

### Java
La versión que estés usando de forma consistente en el curso.

---

## Paso 3 · Dependencias iniciales recomendadas

Para esta primera versión del servicio, conviene empezar con pocas dependencias.

Recomendación inicial:

- **Spring Web**
- **Spring Boot DevTools** opcional
- **Validation** opcional desde ahora, aunque todavía no la usemos

Si querés ser más minimalista todavía, con `Spring Web` alcanza para esta etapa.

La idea es no llenar el proyecto de dependencias antes de necesitarlas.

---

## Paso 4 · Generar y ubicar el proyecto

Una vez descargado el zip o generado el proyecto desde el IDE, extraelo o crealo dentro de:

```txt
novamarket/services/
```

El resultado final debería quedar así:

```txt
novamarket/
  services/
    catalog-service/
  infrastructure/
  config-repo/
  docs/
  scripts/
```

Ese detalle es importante.  
Queremos que el servicio quede ya en su lugar definitivo dentro del monorepo.

---

## Paso 5 · Revisar la estructura generada

La estructura típica inicial del proyecto debería verse más o menos así:

```txt
catalog-service/
  src/
    main/
      java/
      resources/
    test/
      java/
  pom.xml
  mvnw
  mvnw.cmd
```

Dentro de `src/main/java` debería existir la clase principal generada por Spring Boot.

Algo parecido a:

```java
@SpringBootApplication
public class CatalogServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(CatalogServiceApplication.class, args);
    }
}
```

Esta clase es el punto de entrada del servicio.

---

## Paso 6 · Abrir el proyecto en el IDE

Podés abrir directamente la carpeta `catalog-service` como proyecto Maven o abrir la raíz `novamarket` y trabajar con sus carpetas internas según cómo prefieras organizarte.

Para el curso, suele resultar cómodo abrir la carpeta del servicio cuando estamos concentrados en él y después trabajar desde la raíz cuando la arquitectura ya tenga varios módulos activos.

---

## Paso 7 · Revisar el `pom.xml`

En esta etapa, el `pom.xml` debería ser pequeño y claro.

Lo importante ahora es verificar que:

- el artifact sea `catalog-service`,
- las dependencias elegidas estén presentes,
- y el proyecto compile sin errores.

Todavía no hace falta agregar nada más sofisticado.

---

## Paso 8 · Ajustar `application.yml` o `application.properties`

Si el proyecto vino con `application.properties`, podés dejarlo por ahora o cambiarlo a `application.yml` si esa va a ser la convención del curso.

Una configuración mínima razonable para esta etapa podría incluir:

- nombre de aplicación,
- puerto del servicio.

Por ejemplo, más adelante nos va a convenir definir explícitamente `spring.application.name`, pero en esta etapa al menos conviene empezar a pensar en eso como parte del patrón de todos los servicios.

Si querés dejar ya una base clara, podés usar algo conceptualmente equivalente a esto:

```yaml
spring:
  application:
    name: catalog-service

server:
  port: 8081
```

El puerto es solo un ejemplo.  
Lo importante es que desde ahora cada servicio tenga un puerto claro y no compita con otros más adelante.

---

## Paso 9 · Verificar la clase principal

Antes de arrancar, conviene revisar que la clase principal:

- tenga la anotación `@SpringBootApplication`,
- esté en el paquete correcto,
- y no tenga errores de importación.

En una primera generación de Initializr eso suele venir bien, pero vale la pena verificarlo igual.

---

## Paso 10 · Primer arranque del servicio

Ahora sí, toca levantar el servicio por primera vez.

Podés hacerlo desde:

- el IDE,
- `mvn spring-boot:run`,
- o usando el wrapper del proyecto.

Ejemplo conceptual:

```bash
./mvnw spring-boot:run
```

O en Windows:

```bash
mvnw.cmd spring-boot:run
```

También podés ejecutar directamente la clase principal desde tu IDE.

---

## Qué deberías ver al arrancar

Si todo está bien, deberías observar en consola algo equivalente a esto:

- el banner de Spring Boot,
- el inicio de la aplicación,
- el puerto en el que se levantó,
- y un mensaje indicando que el servicio arrancó correctamente.

Lo importante es confirmar que `catalog-service`:

- compila,
- levanta,
- no tiene conflictos de puerto,
- y queda escuchando correctamente.

---

## Verificación mínima recomendada

Aunque todavía no exista ningún endpoint funcional, hay varias formas simples de verificar que el servicio está vivo.

### Opción 1
Confirmar por consola que la aplicación arrancó sin errores.

### Opción 2
Abrir en el navegador una ruta cualquiera del puerto configurado y comprobar que al menos el servicio responde como una aplicación Spring levantada, aunque devuelva 404 en rutas inexistentes.

Por ejemplo, si configuraste el puerto `8081`, una prueba simple sería abrir:

```txt
http://localhost:8081
```

Si la aplicación está arriba, no debería fallar por conexión rechazada.  
Puede devolver una respuesta vacía o un 404, y eso en esta etapa está bien.

---

## Qué todavía no hicimos

Todavía no creamos:

- entidad `Product`,
- controller,
- service,
- repository,
- endpoints de catálogo,
- ni persistencia.

Y eso es correcto.

Hoy el objetivo es dejar el microservicio base listo y funcionando.

---

## Errores comunes en esta etapa

### 1. Extraer el proyecto fuera de `services/`
Eso rompe la organización que estamos intentando sostener.

### 2. Usar un puerto que ya está ocupado
Si otra aplicación ya está usando ese puerto, Spring Boot no va a levantar.

### 3. No revisar el nombre de aplicación
Más adelante esto puede generar inconsistencias con Config Server o Eureka.

### 4. Agregar demasiadas dependencias desde el inicio
Conviene construir el servicio de forma progresiva.

### 5. Pensar que un 404 significa que el servicio está roto
Si todavía no existen endpoints, un 404 en `/` puede ser totalmente normal.

---

## Resultado esperado al terminar la clase

Al terminar esta clase debería existir esta carpeta:

```txt
novamarket/services/catalog-service
```

Y el servicio debería:

- compilar,
- arrancar,
- y quedar escuchando en el puerto configurado.

Eso ya convierte a `catalog-service` en el primer módulo real de NovaMarket.

---

## Punto de control

Antes de seguir, verificá que:

- `catalog-service` existe dentro de `services/`,
- el proyecto abre bien en tu IDE,
- el `pom.xml` no tiene errores,
- la aplicación arranca sin fallas,
- y el puerto configurado responde como servicio vivo.

Si eso está bien, ya podés usar este mismo patrón para crear el segundo servicio.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a repetir esta misma lógica para crear:

**`inventory-service`**

Eso nos va a dejar dos servicios base listos dentro del proyecto y nos va a acercar al primer flujo funcional de NovaMarket.

---

## Cierre

En esta clase creamos `catalog-service`, el primer microservicio real del curso práctico.

Todavía no tiene lógica de negocio visible, pero ya tiene algo muy importante:  
una base concreta dentro del monorepo, una configuración mínima y un primer arranque verificado.

Ese patrón va a sostener el resto del proyecto.
