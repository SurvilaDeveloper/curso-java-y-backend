---
title: "Creando discovery-server con Spring Initializr"
description: "Inicio del bloque de Service Discovery en NovaMarket. Generación de discovery-server con Spring Initializr, configuración de Eureka Server y primer arranque del servidor de descubrimiento."
order: 26
module: "Módulo 5 · Service Discovery y comunicación profesional"
level: "intermedio"
draft: false
---

# Creando `discovery-server` con Spring Initializr

Hasta ahora, NovaMarket ya dio varios pasos importantes:

- tiene servicios de negocio funcionando,
- ya usa persistencia real,
- y además empezó a centralizar configuración con `config-server`.

Pero todavía hay una limitación clara en la comunicación entre servicios:

**las ubicaciones siguen estando bastante rígidas.**

Por ejemplo, `order-service` todavía conoce a `inventory-service` usando una URL fija.  
Eso estuvo bien como primer paso, pero si el sistema quiere crecer con más flexibilidad, necesitamos otro componente de infraestructura:

**`discovery-server`**

En esta clase vamos a crear ese servidor de descubrimiento usando Eureka.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creado el proyecto `discovery-server`,
- ubicado dentro del monorepo,
- configurado como Eureka Server,
- y arrancando correctamente como servidor de descubrimiento.

Todavía no vamos a registrar clientes.  
Primero necesitamos que el servidor exista y esté operativo.

---

## Estado de partida

Partimos de un monorepo parecido a este:

```txt
novamarket/
  services/
    catalog-service/
    inventory-service/
    order-service/
    config-server/
  config-repo/
  infrastructure/
  docs/
  scripts/
```

Además:

- `config-server` ya existe,
- los servicios principales ya consumen configuración centralizada,
- y la comunicación entre servicios todavía no usa discovery.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- generar `discovery-server` con Spring Initializr,
- agregar las dependencias correctas,
- configurarlo como Eureka Server,
- definir configuración base,
- y verificar su arranque.

---

## Qué problema resuelve `discovery-server`

Cuando una arquitectura distribuida crece, no conviene depender indefinidamente de URLs hardcodeadas como:

```txt
http://localhost:8082
```

Eso puede servir para una etapa inicial, pero no es una estrategia cómoda ni escalable.

Un servidor de descubrimiento permite que los servicios:

- se registren,
- se identifiquen por nombre,
- y puedan ser encontrados dinámicamente por otros componentes del sistema.

En NovaMarket, esto va a ser clave para dar el siguiente paso hacia una integración más profesional.

---

## Paso 1 · Abrir Spring Initializr

Vamos a crear un nuevo proyecto, esta vez no como servicio de negocio sino como infraestructura.

---

## Paso 2 · Configuración recomendada en Initializr

Una configuración razonable para este proyecto es:

### Project
**Maven**

### Language
**Java**

### Group
```txt
com.novamarket
```

### Artifact
```txt
discovery-server
```

### Name
```txt
discovery-server
```

### Packaging
```txt
Jar
```

### Java
La misma versión que venís usando en el resto del proyecto.

La consistencia acá sigue importando mucho.

---

## Paso 3 · Dependencias necesarias

Para este proyecto necesitamos la dependencia de:

- **Eureka Server**

Y opcionalmente podés sumar:

- **Spring Boot DevTools**

La idea es que el proyecto nazca directamente como un servidor de descubrimiento y no como una aplicación genérica.

---

## Paso 4 · Generar y ubicar el proyecto

Una vez generado, ubicá el proyecto dentro de:

```txt
novamarket/services/
```

El resultado esperado debería verse así:

```txt
novamarket/
  services/
    catalog-service/
    inventory-service/
    order-service/
    config-server/
    discovery-server/
```

Con esto, NovaMarket suma una nueva pieza de infraestructura importante dentro del monorepo.

---

## Paso 5 · Revisar la estructura generada

La estructura base debería ser la habitual de una aplicación Spring Boot:

```txt
discovery-server/
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

Y dentro del paquete principal debería existir una clase tipo:

```java
@SpringBootApplication
public class DiscoveryServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(DiscoveryServerApplication.class, args);
    }
}
```

---

## Paso 6 · Habilitar Eureka Server

Ahora necesitamos marcar esta aplicación como servidor Eureka.

La clase principal debería quedar más o menos así:

```java
package com.novamarket.discoveryserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@EnableEurekaServer
@SpringBootApplication
public class DiscoveryServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(DiscoveryServerApplication.class, args);
    }
}
```

Esta anotación es la que transforma a la aplicación en un servidor de descubrimiento.

---

## Paso 7 · Configurar `application.yml`

Ahora vamos a definir una configuración mínima para el servidor.

Una base razonable para esta etapa podría ser:

```yaml
spring:
  application:
    name: discovery-server

server:
  port: 8761

eureka:
  client:
    register-with-eureka: false
    fetch-registry: false
```

Esta configuración deja bien claro que:

- el servidor Eureka no debe registrarse a sí mismo como cliente,
- no necesita descargar un registro externo,
- y va a escuchar en el puerto típico `8761`.

---

## Paso 8 · Revisar si querés centralizar también esta configuración

En esta etapa del curso práctico, podés dejar la configuración de `discovery-server` local para simplificar el arranque inicial.

Más adelante, si querés mantener coherencia total con el resto de la arquitectura, podrías moverlo también hacia `config-server`.

Pero para esta clase no hace falta complejizar eso todavía.  
Lo importante es dejar Eureka funcionando.

---

## Paso 9 · Levantar `discovery-server`

Ahora toca arrancar el proyecto.

Podés hacerlo desde el IDE o con el wrapper:

```bash
./mvnw spring-boot:run
```

Queremos verificar que:

- la aplicación compile,
- Eureka Server se inicialice bien,
- y el servicio arranque en el puerto configurado.

---

## Qué deberías ver al arrancar

Si todo está bien, deberías observar:

- arranque normal de Spring Boot,
- inicialización de Eureka Server,
- y escucha en el puerto `8761`.

En este punto todavía no debería haber instancias registradas.  
Eso es totalmente normal, porque todavía no conectamos clientes.

---

## Paso 10 · Abrir la consola de Eureka

Una de las validaciones más útiles en esta clase es abrir la interfaz web del servidor.

Por ejemplo:

```txt
http://localhost:8761
```

Si todo salió bien, deberías ver la consola de Eureka.

Aunque todavía no haya servicios registrados, el simple hecho de que la consola esté accesible ya es una verificación muy buena de que el servidor está funcionando.

---

## Qué estamos logrando con esta clase

Esta clase agrega otra pieza central de infraestructura a NovaMarket.

Ahora el proyecto ya tiene:

- `config-server`
- `discovery-server`

Eso significa que el sistema empieza a tener no solo servicios de negocio, sino también la base necesaria para que esos servicios puedan encontrarse y configurarse de una manera más profesional.

---

## Qué todavía no hicimos

Todavía no:

- registramos `catalog-service`,
- registramos `inventory-service`,
- registramos `order-service`,
- ni reemplazamos la URL fija entre servicios.

Todo eso viene a continuación.

La meta de hoy es mucho más concreta:

**dejar `discovery-server` creado y operativo.**

---

## Errores comunes en esta etapa

### 1. Olvidar `@EnableEurekaServer`
Entonces la aplicación arranca, pero no actúa como servidor Eureka.

### 2. No agregar la dependencia correcta
Sin la dependencia de Eureka Server, el proyecto no va a cumplir el rol esperado.

### 3. Usar un puerto equivocado o ya ocupado
Conviene mantener `8761` si no hay conflicto.

### 4. No desactivar `register-with-eureka` y `fetch-registry`
Para el propio servidor, eso suele ser innecesario y confuso.

### 5. Pensar que ya deberían aparecer servicios en la consola
Todavía no; primero hay que registrar clientes.

---

## Resultado esperado al terminar la clase

Al terminar esta clase debería existir:

```txt
novamarket/services/discovery-server
```

Y el proyecto debería:

- arrancar correctamente,
- exponer la consola de Eureka,
- y quedar listo para recibir registros de otros servicios.

---

## Punto de control

Antes de seguir, verificá que:

- existe `discovery-server` dentro de `services/`,
- la clase principal usa `@EnableEurekaServer`,
- el servicio arranca correctamente,
- y la consola en `http://localhost:8761` está disponible.

Si eso está bien, ya podemos empezar a registrar clientes.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a registrar en Eureka a los servicios principales de NovaMarket.

Ese será el primer paso real para que la arquitectura empiece a descubrirse dinámicamente.

---

## Cierre

En esta clase creamos `discovery-server`, el servidor de descubrimiento de NovaMarket.

Con esto, el proyecto suma otra pieza de infraestructura muy importante y queda preparado para abandonar progresivamente la lógica de ubicaciones fijas entre servicios.
