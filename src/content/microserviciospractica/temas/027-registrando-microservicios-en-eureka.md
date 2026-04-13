---
title: "Registrando microservicios en Eureka"
description: "Registro de catalog-service, inventory-service y order-service en discovery-server. Integración de Eureka Client y verificación del alta de instancias en NovaMarket."
order: 27
module: "Módulo 5 · Service Discovery y comunicación profesional"
level: "intermedio"
draft: false
---

# Registrando microservicios en Eureka

En la clase anterior creamos `discovery-server` y lo dejamos listo para actuar como servidor Eureka.

Ahora toca dar el siguiente paso:

**registrar los microservicios del sistema como clientes de Eureka.**

Vamos a empezar por los tres servicios principales de NovaMarket:

- `catalog-service`
- `inventory-service`
- `order-service`

La idea es que, una vez terminada esta clase, esos servicios ya no sean solo aplicaciones aisladas corriendo en puertos distintos, sino instancias registradas en el servidor de descubrimiento.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- agregada la dependencia de Eureka Client en los servicios principales,
- configurada la URL del servidor Eureka,
- levantados los servicios con registro automático,
- y visibles las instancias en la consola de `discovery-server`.

Todavía no vamos a usar esos nombres para resolver llamadas entre servicios.  
Primero queremos que el registro funcione bien.

---

## Estado de partida

En este punto deberíamos tener:

- `discovery-server` funcionando en `http://localhost:8761`
- la consola de Eureka disponible
- y los servicios:
  - `catalog-service`
  - `inventory-service`
  - `order-service`
  funcionando por separado

Todavía ninguno debería aparecer registrado en Eureka.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- agregar Eureka Client a los servicios,
- configurar la URL del servidor de descubrimiento,
- levantar los clientes,
- y verificar que se registren correctamente.

---

## Qué significa registrarse en Eureka

Cuando un servicio se registra en Eureka, lo que hace es anunciarse ante el servidor con información como:

- su nombre lógico,
- su dirección,
- su puerto,
- y su estado.

Eso permite que otros componentes puedan encontrarlo usando su nombre de aplicación, sin necesidad de conocer primero una URL fija exacta.

En esta etapa del curso, lo más importante es ver el registro funcionando.

---

## Paso 1 · Agregar Eureka Client a `catalog-service`

Dentro de `catalog-service`, agregá la dependencia correspondiente a:

- **Eureka Discovery Client**

Con eso, el servicio ya tendrá la capacidad técnica de registrarse en el servidor.

---

## Paso 2 · Agregar configuración de Eureka a `catalog-service`

Como `catalog-service` ya consume configuración centralizada, una buena práctica en esta etapa es poner la configuración de Eureka dentro de:

```txt
config-repo/catalog-service.yml
```

Una base razonable podría ser:

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

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka
```

Con esto, el cliente ya sabe dónde está `discovery-server`.

---

## Paso 3 · Repetir el mismo proceso en `inventory-service`

Ahora hacé lo mismo en `inventory-service`:

- agregá la dependencia de Eureka Client
- y sumá la configuración correspondiente en:

```txt
config-repo/inventory-service.yml
```

Una base razonable sería:

```yaml
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka
```

El resto del archivo puede seguir teniendo datasource, JPA y puerto como ya lo venía haciendo.

---

## Paso 4 · Repetir el mismo proceso en `order-service`

Ahora hacé lo mismo en `order-service`.

Agregá:

- la dependencia de Eureka Client
- y la propiedad remota en:

```txt
config-repo/order-service.yml
```

Con esto, los tres servicios principales del sistema ya estarán listos para registrarse.

---

## Paso 5 · Verificar que `spring.application.name` esté bien definido

Este paso es muy importante.

Eureka usa el nombre de la aplicación como referencia principal para registrar la instancia.

Por eso conviene revisar que:

- `catalog-service` tenga `spring.application.name: catalog-service`
- `inventory-service` tenga `spring.application.name: inventory-service`
- `order-service` tenga `spring.application.name: order-service`

Si el nombre no coincide o está ausente, el registro puede no comportarse como esperamos.

---

## Paso 6 · Levantar `discovery-server`

Antes de arrancar los clientes, asegurate de que `discovery-server` esté arriba.

La consola de Eureka debería estar disponible en:

```txt
http://localhost:8761
```

Conviene tener esta pantalla abierta mientras levantás los servicios clientes, porque así vas viendo cómo aparecen.

---

## Paso 7 · Levantar `catalog-service`

Ahora levantá `catalog-service`.

Durante el arranque, conviene mirar logs para detectar que:

- el servicio sigue cargando bien su configuración,
- intenta conectarse a Eureka,
- y completa el registro de instancia.

Una vez arriba, revisá la consola de Eureka.  
Deberías empezar a ver registrado algo equivalente a `CATALOG-SERVICE`.

---

## Paso 8 · Levantar `inventory-service`

Ahora levantá `inventory-service`.

Repetí la misma lógica:

- revisar logs,
- verificar que arranca correctamente,
- y comprobar en la consola que se registre.

A esta altura, Eureka ya debería mostrar dos aplicaciones registradas.

---

## Paso 9 · Levantar `order-service`

Ahora levantá `order-service`.

Si todo está correcto, Eureka debería terminar mostrando los tres servicios principales registrados.

En este punto, aunque todavía no estemos usando discovery en las llamadas entre ellos, ya tenemos una infraestructura viva de registro y descubrimiento.

---

## Qué deberías ver en la consola de Eureka

Una vez levantados los tres servicios, la consola en `http://localhost:8761` debería mostrar aplicaciones registradas, por ejemplo:

- `CATALOG-SERVICE`
- `INVENTORY-SERVICE`
- `ORDER-SERVICE`

El formato visual exacto puede variar, pero la idea es que cada servicio aparezca como instancia activa y disponible.

---

## Paso 10 · Confirmar que los servicios siguen funcionando normalmente

Después del registro, conviene volver a probar que no rompimos el comportamiento del sistema.

Probá por ejemplo:

```bash
curl http://localhost:8081/products
curl http://localhost:8082/inventory
curl -X POST http://localhost:8083/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 1 }
    ]
  }'
```

La idea es confirmar que:

- el registro en Eureka no rompió los servicios,
- y la arquitectura sigue funcionando como antes, solo que ahora además está registrada.

---

## Qué estamos logrando con esta clase

Esta clase le da a NovaMarket un cambio importante de madurez.

Ahora los servicios principales ya no están simplemente “corriendo”.  
Están además:

- anunciándose,
- siendo visibles desde el servidor de descubrimiento,
- y preparándose para dejar atrás las referencias rígidas por URL.

Ese es un paso muy importante hacia una arquitectura más profesional.

---

## Qué todavía no hicimos

Todavía no:

- consumimos servicios por nombre lógico,
- usamos Feign,
- usamos balanceo,
- ni reemplazamos la URL fija en `order-service`.

Todo eso viene a continuación.

La meta de hoy es más concreta:

**que el registro en Eureka funcione bien.**

---

## Errores comunes en esta etapa

### 1. Agregar la dependencia en algunos servicios pero no en todos
Eso genera un registro inconsistente.

### 2. No definir bien `defaultZone`
Entonces el cliente no sabe a qué Eureka conectarse.

### 3. Arrancar servicios sin levantar Eureka antes
Conviene mantener el orden.

### 4. Tener mal definido `spring.application.name`
El servicio puede registrarse con un nombre inesperado o no hacerlo bien.

### 5. No revisar la consola durante el arranque
La UI de Eureka es una herramienta de verificación muy útil en esta etapa.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `catalog-service`, `inventory-service` y `order-service` deberían:

- arrancar correctamente,
- conectarse a `discovery-server`,
- y aparecer registrados en Eureka.

Eso deja listo el terreno para empezar a usar el descubrimiento de servicios dentro de la integración real del sistema.

---

## Punto de control

Antes de seguir, verificá que:

- los tres servicios tienen la dependencia de Eureka Client,
- la configuración remota incluye `defaultZone`,
- los tres servicios aparecen en la consola de Eureka,
- y el flujo funcional actual sigue funcionando.

Si eso está bien, ya podemos pasar a revisar y entender mejor el descubrimiento que acabamos de activar.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a detenernos a verificar el descubrimiento de servicios con más atención.

La idea va a ser entender bien qué estamos viendo en Eureka y cómo usar eso como base para las próximas integraciones.

---

## Cierre

En esta clase registramos los servicios principales de NovaMarket en Eureka.

Con eso, la arquitectura ya no depende solamente de saber “en qué puerto corre cada cosa”, sino que empieza a tener un mecanismo real de descubrimiento centralizado.
