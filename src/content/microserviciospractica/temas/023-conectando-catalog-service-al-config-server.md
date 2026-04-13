---
title: "Conectando catalog-service al Config Server"
description: "Primer cliente real de configuración centralizada en NovaMarket. Integración de catalog-service con config-server, ajuste del arranque y verificación de carga remota de propiedades."
order: 23
module: "Módulo 4 · Configuración centralizada"
level: "intermedio"
draft: false
---

# Conectando `catalog-service` al Config Server

En las dos clases anteriores construimos la infraestructura base de configuración centralizada:

- creamos `config-server`,
- y armamos `config-repo` con archivos de configuración por servicio.

Ahora toca dar el siguiente paso lógico:

**hacer que un microservicio deje de depender solamente de su archivo local y empiece a consumir configuración desde `config-server`.**

Vamos a empezar por `catalog-service`.

La idea es usar este servicio como primer cliente real de configuración centralizada para validar el mecanismo completo antes de extenderlo al resto del sistema.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- `catalog-service` configurado para consumir propiedades desde `config-server`,
- reducido o simplificado su archivo local,
- verificado el arranque contra el servidor de configuración,
- y comprobado que el servicio está leyendo propiedades remotas correctamente.

Esto marca el primer uso real de la infraestructura de configuración centralizada de NovaMarket.

---

## Estado de partida

En este punto deberíamos tener funcionando:

- `config-server` en su puerto de trabajo, por ejemplo `8888`,
- `config-repo` con al menos:
  - `application.yml`
  - `catalog-service.yml`
  - `inventory-service.yml`
  - `order-service.yml`

Además, `catalog-service` todavía debería seguir usando su configuración local directa.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- agregar a `catalog-service` la dependencia de cliente de configuración,
- indicarle que cargue configuración desde `config-server`,
- simplificar el archivo local del servicio,
- levantar primero el servidor y luego el cliente,
- y verificar que las propiedades realmente vengan desde el repositorio centralizado.

---

## Qué problema queremos resolver

Hasta ahora `catalog-service` puede tener cosas como estas definidas localmente:

- `spring.application.name`
- `server.port`
- datasource
- JPA
- otras propiedades del servicio

Eso funciona, pero hace que el servicio siga muy atado a su propia carpeta.

Queremos pasar a un modelo donde:

- `catalog-service` sepa **quién es**,
- sepa **dónde está `config-server`**,
- y el resto de la configuración venga desde afuera.

Esa es la lógica correcta de este bloque del curso.

---

## Paso 1 · Agregar la dependencia de Config Client

Dentro de `catalog-service`, agregá en el `pom.xml` la dependencia necesaria para que el servicio pueda actuar como cliente de configuración.

La dependencia a sumar es la de:

- **Spring Cloud Config Client**

No hace falta quitar todavía JPA, H2 ni el resto de dependencias del servicio.  
Solo estamos agregando la capacidad de consumir configuración remota.

---

## Paso 2 · Revisar el archivo local del servicio

Ahora conviene revisar el `application.yml` actual de `catalog-service`.

Hasta ahora probablemente tenga muchas propiedades locales.  
Después de integrar Config Server, el objetivo es que este archivo quede mucho más chico.

En esta etapa, lo importante es que el cliente declare:

- el nombre de la aplicación,
- y cómo encontrar al servidor de configuración.

Dependiendo del stack que estés usando, una forma moderna y muy razonable de hacerlo es con `spring.config.import`.

Una base conceptual podría verse así:

```yaml
spring:
  application:
    name: catalog-service
  config:
    import: "optional:configserver:http://localhost:8888"
```

Si además querés fallar cuando el servidor no está disponible, más adelante podrías sacar `optional:`.  
Pero para empezar, esta versión suele ser útil para un curso práctico.

---

## Paso 3 · Reducir la configuración local

Una vez que `catalog-service` sabe:

- su nombre,
- y dónde está `config-server`,

ya no hace falta dejar localmente duplicadas propiedades como:

- `server.port`
- datasource
- JPA
- flags específicas del servicio

Esas propiedades ahora deberían vivir en:

```txt
config-repo/catalog-service.yml
```

La idea es que el archivo local del servicio deje de ser el lugar donde vive la configuración principal.

---

## Paso 4 · Revisar `catalog-service.yml` en `config-repo`

Antes de arrancar nada, conviene revisar que en:

```txt
novamarket/config-repo/catalog-service.yml
```

realmente estén las propiedades que `catalog-service` va a necesitar.

Por ejemplo, debería incluir cosas como:

```yaml
spring:
  application:
    name: catalog-service
  datasource:
    url: jdbc:h2:mem:catalogdb
    driver-class-name: org.h2.Driver
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

server:
  port: 8081

catalog:
  seed-enabled: true
```

Si ese archivo está incompleto o mal nombrado, el cliente no va a arrancar como esperamos.

---

## Paso 5 · Levantar `config-server` primero

Este orden importa bastante.

Antes de arrancar `catalog-service`, levantá `config-server`.

Queremos asegurarnos de que:

- está arriba,
- puede resolver `catalog-service/default`,
- y el repositorio fue cargado correctamente.

Una buena prueba previa es abrir:

```txt
http://localhost:8888/catalog-service/default
```

Si esa URL responde con configuración, entonces la parte servidora está lista.

---

## Paso 6 · Levantar `catalog-service`

Ahora sí levantá `catalog-service`.

En este punto conviene mirar bien los logs de arranque, porque ahí suelen aparecer señales muy claras de si el servicio:

- encontró `config-server`,
- pudo cargar el entorno remoto,
- o falló intentando resolver configuración.

Si todo está bien, el servicio debería arrancar usando las propiedades centralizadas.

---

## Paso 7 · Qué deberías observar en los logs

Durante el arranque, conviene buscar indicios de que:

- `catalog-service` está consultando `config-server`,
- el nombre de aplicación resuelto es el correcto,
- y las propiedades remotas fueron aplicadas.

También deberías ver que el servicio arranca en el puerto que definiste en `config-repo`, no por una configuración local duplicada.

Ese es un punto de verificación muy valioso.

---

## Paso 8 · Probar que el servicio sigue funcionando

Una vez levantado, probá de nuevo:

```bash
curl http://localhost:8081/products
```

Y también:

```bash
curl http://localhost:8081/products/1
```

El comportamiento funcional debería seguir siendo el mismo.

Eso es muy importante: desde afuera, el servicio no cambia su contrato solo porque internamente ahora usa configuración centralizada.

---

## Paso 9 · Verificar que realmente usa propiedades remotas

Hay varias formas útiles de verificar esto.

### Opción 1
Cambiar una propiedad en `config-repo/catalog-service.yml`, reiniciar el servicio y comprobar que el cambio se refleje.

### Opción 2
Confirmar que el archivo local ya no contiene la mayoría de las propiedades que antes necesitaba para arrancar.

### Opción 3
Revisar logs de arranque y comportamiento.

Para esta etapa del curso, con que puedas confirmar que el servicio arranca correctamente usando la configuración servida por `config-server`, ya es una validación muy buena.

---

## Qué estamos logrando con esta clase

Esta clase marca un cambio arquitectónico real en NovaMarket.

Por primera vez, un microservicio del sistema:

- deja de depender por completo de su propia configuración local,
- consulta a una pieza central de infraestructura,
- y carga su entorno desde un repositorio compartido.

Eso cambia bastante la forma en que pensamos el proyecto.

---

## Qué todavía no hicimos

Todavía no conectamos:

- `inventory-service`
- `order-service`

como clientes.

Tampoco trabajamos todavía con:

- perfiles específicos por entorno,
- refresh dinámico,
- ni repositorio Git real.

Todo eso viene después.

La meta de hoy es más concreta:

**que el primer cliente real de configuración centralizada funcione.**

---

## Errores comunes en esta etapa

### 1. No agregar la dependencia de Config Client
Entonces el servicio no sabe consumir configuración remota.

### 2. Dejar el nombre de aplicación distinto al archivo del repositorio
Eso rompe la resolución de propiedades.

### 3. Intentar arrancar el cliente sin levantar antes `config-server`
Conviene respetar el orden.

### 4. Mantener demasiada configuración duplicada localmente
Eso vuelve confuso qué fuente está mandando realmente.

### 5. No probar el endpoint funcional después del cambio
Siempre conviene verificar que el comportamiento del servicio se mantuvo sano.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `catalog-service` debería:

- arrancar consumiendo configuración desde `config-server`,
- usar las propiedades definidas en `config-repo`,
- y seguir respondiendo correctamente su API.

Eso convierte a `catalog-service` en el primer cliente real del sistema de configuración centralizada.

---

## Punto de control

Antes de seguir, verificá que:

- `config-server` responde para `catalog-service/default`,
- `catalog-service` tiene la dependencia de cliente,
- el archivo local quedó reducido a lo necesario,
- el servicio arranca correctamente,
- y `GET /products` sigue funcionando.

Si eso está bien, ya podemos extender esta misma lógica al resto de los servicios principales.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a conectar también a `inventory-service` y `order-service` con el Config Server.

Con eso, NovaMarket va a completar la primera ola de migración hacia configuración centralizada en sus servicios principales.

---

## Cierre

En esta clase conectamos `catalog-service` al Config Server.

Con eso, NovaMarket dejó de tener solo infraestructura de configuración centralizada “armada” y pasó a tener también un primer cliente real consumiéndola.

Ese es el paso que realmente pone a trabajar el bloque de configuración centralizada.
