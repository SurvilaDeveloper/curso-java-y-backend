---
title: "Creando config-server con Spring Initializr"
description: "Inicio del bloque de configuración centralizada en NovaMarket. Generación de config-server con Spring Initializr, configuración base y primer arranque del servidor de configuración."
order: 21
module: "Módulo 4 · Configuración centralizada"
level: "intermedio"
draft: false
---

# Creando `config-server` con Spring Initializr

Hasta ahora, todos los servicios de NovaMarket vienen manejando su configuración de manera local.

Eso fue razonable para arrancar, pero a medida que el sistema crece, empieza a aparecer una necesidad bastante clara:

**centralizar configuración.**

No queremos que cada servicio dependa eternamente de un archivo local completamente aislado del resto.  
Más adelante va a ser mucho más cómodo tener una pieza específica de infraestructura encargada de servir configuración al sistema.

Esa pieza es:

**`config-server`**

En esta clase vamos a arrancar el bloque de configuración centralizada creando el servidor de configuración con Spring Initializr.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creado el proyecto `config-server`,
- ubicado dentro del monorepo,
- con dependencias apropiadas,
- configurado como Config Server,
- y arrancando correctamente como servidor de configuración base.

Todavía no vamos a conectar clientes.  
Primero necesitamos tener el servidor listo.

---

## Estado de partida

Partimos de un monorepo donde ya existen varios servicios de negocio e infraestructura inicial, por ejemplo:

```txt
novamarket/
  services/
    catalog-service/
    inventory-service/
    order-service/
  infrastructure/
  config-repo/
  docs/
  scripts/
```

Y todos los servicios siguen cargando configuración desde sus archivos locales.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- generar `config-server` con Spring Initializr,
- ubicarlo dentro de `services/`,
- agregar su configuración base,
- habilitar el rol de servidor de configuración,
- y verificar que arranque correctamente.

---

## Qué problema resuelve `config-server`

Antes de meternos en el paso a paso, conviene dejar clara la motivación práctica.

A medida que NovaMarket crezca, vamos a necesitar gestionar cosas como:

- puertos,
- nombres de aplicación,
- propiedades compartidas,
- perfiles,
- y settings específicos por servicio.

Si cada servicio maneja todo eso solo desde su carpeta local, el sistema se vuelve más difícil de mantener y de coordinar.

`config-server` viene a resolver justamente ese problema:  
ofrecer una fuente centralizada de configuración para el ecosistema.

---

## Paso 1 · Abrir Spring Initializr

Vamos a usar el mismo enfoque que ya usamos para los servicios anteriores, pero esta vez para un componente de infraestructura.

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
config-server
```

### Name
```txt
config-server
```

### Packaging
```txt
Jar
```

### Java
La misma versión que venimos usando en el resto del proyecto.

---

## Paso 3 · Dependencias necesarias

Acá sí necesitamos una dependencia concreta de Spring Cloud:

- **Config Server**

Y, como base general:

- **Spring Boot DevTools** opcional

La clave es que el proyecto nazca ya con el rol de servidor de configuración, no como una aplicación Spring Boot genérica.

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
```

Con esto, NovaMarket ya empieza a sumar infraestructura propia dentro del monorepo.

---

## Paso 5 · Revisar la estructura generada

La estructura del proyecto debería ser la habitual de un servicio Spring Boot:

```txt
config-server/
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

Y dentro del paquete principal, una clase tipo:

```java
@SpringBootApplication
public class ConfigServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConfigServerApplication.class, args);
    }
}
```

---

## Paso 6 · Habilitar el Config Server

Ahora necesitamos marcar esta aplicación como servidor de configuración.

Para eso, en la clase principal agregá la anotación correspondiente.

Una versión razonable debería quedar así:

```java
package com.novamarket.configserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.config.server.EnableConfigServer;

@EnableConfigServer
@SpringBootApplication
public class ConfigServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ConfigServerApplication.class, args);
    }
}
```

Esto le dice a Spring que esta aplicación no es una app cualquiera, sino un Config Server.

---

## Paso 7 · Definir configuración mínima del servidor

Ahora vamos a ajustar el `application.yml` del proyecto.

Una base razonable para esta etapa podría ser algo así:

```yaml
spring:
  application:
    name: config-server
  cloud:
    config:
      server:
        native:
          search-locations: file:../config-repo

server:
  port: 8888
```

Esto deja varias cosas bien definidas:

- nombre de la aplicación,
- puerto del Config Server,
- y ubicación del repositorio de configuración.

En esta etapa estamos usando una estrategia **native** y local para simplificar el curso práctico.  
Más adelante podremos evolucionar eso hacia un repo Git real si queremos.

---

## Paso 8 · Activar el perfil `native`

Para que el modo `native` funcione como esperamos, conviene agregar el perfil correspondiente.

Por ejemplo:

```yaml
spring:
  application:
    name: config-server
  profiles:
    active: native
  cloud:
    config:
      server:
        native:
          search-locations: file:../config-repo

server:
  port: 8888
```

Esto deja al servidor listo para buscar archivos de configuración en la carpeta local del monorepo que ya habíamos preparado.

---

## Paso 9 · Verificar la carpeta `config-repo`

Antes de arrancar el servidor, conviene revisar que exista:

```txt
novamarket/config-repo/
```

Por ahora puede estar vacía.  
En la próxima clase vamos a llenarla con archivos reales.

Lo importante hoy es que `config-server` ya quede apuntando al lugar correcto.

---

## Paso 10 · Levantar `config-server`

Ahora toca arrancar el servidor.

Podés hacerlo igual que con los otros proyectos:

```bash
./mvnw spring-boot:run
```

O desde el IDE.

Queremos verificar que:

- el proyecto compile,
- `@EnableConfigServer` esté bien configurado,
- y la aplicación arranque correctamente en el puerto elegido.

---

## Qué deberías ver al arrancar

Si todo está bien, deberías ver:

- arranque normal de Spring Boot,
- levantada de `config-server`,
- y escucha en el puerto `8888` si estás usando esa convención.

Todavía no vamos a consumir configuración desde clientes, así que no hace falta probar ese flujo aún.

---

## Verificación mínima recomendada

En esta etapa, una prueba simple es verificar que el servidor esté vivo en su puerto.

Por ejemplo:

```txt
http://localhost:8888
```

Según la configuración y el estado del repositorio, quizás no haya una respuesta útil todavía en la raíz, y eso está bien.

Lo importante es que:

- el servidor arranque,
- no falle,
- y quede listo para la próxima clase, donde sí lo vamos a alimentar con archivos reales.

---

## Qué todavía no hicimos

Todavía no:

- creamos archivos de configuración en `config-repo`,
- conectamos `catalog-service`,
- conectamos `inventory-service`,
- conectamos `order-service`,
- ni validamos carga remota.

Todo eso viene después.

La meta de hoy es mucho más concreta:

**dejar `config-server` creado y operativo.**

---

## Errores comunes en esta etapa

### 1. Olvidar `@EnableConfigServer`
Entonces la aplicación arranca, pero no cumple el rol esperado.

### 2. No agregar la dependencia correcta
Sin la dependencia de Config Server, el proyecto no va a funcionar como necesitamos.

### 3. Apuntar mal la carpeta `config-repo`
Más adelante eso rompe la resolución de configuración.

### 4. Elegir un puerto ya ocupado
Conviene mantener `8888` o uno claramente reservado para este componente.

### 5. Pensar que hoy ya tienen que funcionar los clientes
No todavía.  
Primero estamos construyendo el servidor.

---

## Resultado esperado al terminar la clase

Al terminar esta clase debería existir:

```txt
novamarket/services/config-server
```

Y el proyecto debería:

- arrancar correctamente,
- estar configurado como Config Server,
- apuntar a `config-repo`,
- y quedar listo para servir configuración en las próximas clases.

---

## Punto de control

Antes de seguir, verificá que:

- existe `config-server` dentro de `services/`,
- el proyecto tiene la dependencia correcta,
- la clase principal usa `@EnableConfigServer`,
- el `application.yml` apunta a `config-repo`,
- y el servidor arranca correctamente.

Si eso está bien, ya podemos empezar a construir el repositorio de configuración.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a crear el contenido real de `config-repo`.

Eso significa que por fin vamos a tener archivos de configuración centralizada listos para que los servicios empiecen a consumirlos.

---

## Cierre

En esta clase creamos `config-server`, la primera pieza clara de infraestructura centralizada dentro de NovaMarket.

Todavía no está sirviendo configuración útil a los servicios, pero ya quedó listo y operativo.  
Ese es el paso necesario para empezar a mover la configuración del sistema fuera de cada microservicio.
