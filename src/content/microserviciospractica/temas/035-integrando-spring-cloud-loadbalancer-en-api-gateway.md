---
title: "Integrando Spring Cloud LoadBalancer en api-gateway"
description: "Primer paso práctico del nuevo bloque de gateway. Integración de Spring Cloud LoadBalancer en api-gateway para prepararlo para rutas basadas en nombres lógicos con lb://."
order: 35
module: "Módulo 6 · API Gateway"
level: "intermedio"
draft: false
---

# Integrando Spring Cloud LoadBalancer en `api-gateway`

En las dos clases anteriores dejamos resuelto algo muy importante:

- `api-gateway` ya existe como nuevo punto de entrada del sistema,
- ya entendimos por qué no debería enrutar usando puertos fijos,
- y además ya ubicamos correctamente a NovaMarket dentro de un modelo principalmente de **client-side load balancing**.

Ahora toca el paso práctico que destraba de verdad el bloque nuevo:

**integrar Spring Cloud LoadBalancer en `api-gateway`.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- agregado el soporte de LoadBalancer al gateway,
- `api-gateway` preparado para resolver nombres lógicos registrados en Eureka,
- y el proyecto listo para empezar a usar rutas `lb://...` en la próxima clase.

Todavía no vamos a definir rutas definitivas.  
La meta de hoy es dejar al gateway técnicamente listo para soportarlas de la manera correcta.

---

## Estado de partida

En este punto ya tenemos:

- `config-server`
- `discovery-server`
- `catalog-service`
- `inventory-service`
- `order-service`
- `api-gateway`

Además:

- los servicios principales ya se registran en Eureka,
- `order-service` ya consume a `inventory-service` por nombre lógico,
- y `api-gateway` ya existe, consume configuración centralizada y puede registrarse dentro de la infraestructura del sistema.

Pero todavía falta una pieza concreta para que el gateway enrute por nombres lógicos con balanceo real.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar por qué Gateway + Eureka todavía no alcanzan por sí solos,
- agregar la dependencia correcta al gateway,
- verificar que el proyecto arranque sano con esa pieza nueva,
- y dejar preparado el entorno para que la próxima clase ya sea solo configuración de rutas.

---

## Qué problema queremos resolver exactamente

Queremos evitar esta situación:

- el gateway conoce Eureka,
- el gateway ve servicios registrados,
- pero igual no tiene la capacidad completa para resolver una URI del tipo:

```txt
lb://catalog-service
```

Ese es el hueco que viene a cerrar Spring Cloud LoadBalancer.

---

## Por qué no alcanza con tener solo Gateway + Eureka

Este punto conviene dejarlo muy claro.

Tener:

- Spring Cloud Gateway
- y Eureka Discovery Client

ya es muchísimo avance, pero todavía no equivale automáticamente a:

- “puedo enrutar correctamente usando `lb://...`”

Lo que falta es la pieza que toma el **nombre lógico** y lo convierte en una **selección real de instancia** para la request concreta.

Esa pieza es justamente Spring Cloud LoadBalancer.

---

## Qué aporta Spring Cloud LoadBalancer al gateway

Dentro de `api-gateway`, Spring Cloud LoadBalancer aporta algo muy específico:

- capacidad de trabajar con nombres lógicos registrados,
- resolución de instancias a partir del discovery,
- y selección de una instancia concreta para el request.

O sea:

- Eureka dice qué instancias existen
- LoadBalancer ayuda a decidir cuál usar ahora

Ese es el aporte real.

---

## Paso 1 · Revisar el estado actual del `pom.xml`

Antes de agregar nada, conviene mirar cómo quedó `api-gateway` desde la clase 32.

En este punto debería tener al menos dependencias como:

- Spring Cloud Gateway
- Eureka Discovery Client
- Config Client

Eso está perfecto.

Lo importante hoy es sumar la pieza de balanceo y no mezclar este paso con otros cambios no necesarios.

---

## Paso 2 · Agregar la dependencia de LoadBalancer

Dentro de `api-gateway`, agregá en el `pom.xml` la dependencia correspondiente a:

- **Spring Cloud LoadBalancer**

La idea es que el gateway gane explícitamente la capacidad de resolver rutas con el prefijo `lb://`.

Este paso importa muchísimo porque corrige justamente el hueco que quedó entre:

- “tengo discovery”
- y
- “puedo enrutar por nombre lógico desde el gateway”.

---

## Paso 3 · Mantener el resto del gateway igual por ahora

Una vez agregada la dependencia, no hace falta todavía tocar:

- controladores,
- filtros custom,
- ni configuración avanzada.

En esta etapa, el gateway sigue siendo básicamente el mismo servicio que en la clase 32, pero ahora con la pieza necesaria para soportar balanceo sobre nombres lógicos.

Eso mantiene el cambio de hoy enfocado y fácil de validar.

---

## Paso 4 · Revisar la configuración remota del gateway

Antes de levantarlo, conviene revisar que en:

```txt
config-repo/api-gateway.yml
```

el gateway mantenga al menos una base coherente como esta:

```yaml
spring:
  application:
    name: api-gateway

server:
  port: 8080

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka
```

Todavía no hace falta agregar rutas acá.  
Pero sí conviene confirmar que el gateway:

- sigue identificado correctamente,
- y sigue integrado con Eureka.

---

## Paso 5 · Levantar primero la infraestructura base

Como en las clases anteriores, respetemos el orden de arranque.

Primero levantá:

- `config-server`
- `discovery-server`

Después conviene levantar también los servicios principales:

- `catalog-service`
- `inventory-service`
- `order-service`

No porque el gateway ya vaya a enrutar hoy, sino porque así podemos verificar que la infraestructura completa sigue sana y visible desde Eureka.

---

## Paso 6 · Levantar `api-gateway`

Ahora sí levantá `api-gateway`.

En este arranque conviene prestar especial atención a:

- que el proyecto compile bien con la nueva dependencia,
- que no haya conflictos extraños en el classpath,
- que el gateway siga cargando bien su configuración,
- y que siga pudiendo registrarse o al menos integrarse sanamente con el resto del entorno.

La meta de hoy es que el gateway quede técnicamente preparado, sin romper nada de lo ya construido.

---

## Paso 7 · Revisar Eureka

Una vez arriba, entrá a:

```txt
http://localhost:8761
```

Y verificá que el gateway siga apareciendo, junto con los demás servicios.

Idealmente deberías ver algo equivalente a:

- `API-GATEWAY`
- `CATALOG-SERVICE`
- `INVENTORY-SERVICE`
- `ORDER-SERVICE`

Esto no valida todavía el ruteo, pero sí confirma que la arquitectura sigue sana antes de pasar a la siguiente clase.

---

## Paso 8 · Entender qué todavía no debería “verse” distinto

Este punto es importante.

Después de agregar Spring Cloud LoadBalancer, todavía no deberías esperar grandes cambios visibles desde afuera.

¿Por qué?

Porque todavía no configuramos rutas reales con:

```txt
lb://...
```

Entonces el valor de esta clase no está en una prueba funcional espectacular, sino en algo más estructural:

- el gateway ahora ya tiene la pieza que necesitaba para soportar correctamente ese tipo de rutas.

Y eso es exactamente el paso que faltaba.

---

## Qué estamos logrando con esta clase

Esta clase hace un cambio pequeño en código, pero enorme en arquitectura.

Hasta acá, el gateway existía y el modelo conceptual ya estaba bien planteado.  
Ahora además el proyecto incorpora la pieza concreta que permite convertir ese modelo en ruteo real por nombre lógico.

Eso deja el bloque rehecho perfectamente alineado.

---

## Qué todavía no hicimos

Todavía no vamos a:

- definir rutas para catálogo, inventario y órdenes,
- probar acceso al sistema pasando por el gateway,
- usar `StripPrefix` o `RewritePath`,
- ni observar requests reales yendo desde `8080` hacia los microservicios.

Todo eso viene en la próxima clase.

La meta de hoy es mucho más concreta:

**dejar `api-gateway` preparado para usar `lb://` de forma correcta.**

---

## Errores comunes en esta etapa

### 1. Pensar que Eureka Client solo ya alcanza para `lb://`
No. Falta explícitamente la pieza de LoadBalancer.

### 2. Mezclar esta clase con configuración de rutas
Conviene separar el soporte técnico de la configuración funcional.

### 3. No revisar que el gateway siga sano después del cambio
Primero se consolida la pieza nueva, después se usa.

### 4. Querer probar ruteo antes de definir rutas
Todavía no estamos en ese paso.

### 5. No mantener el hilo con lo que ya hacía `order-service`
Este gateway ahora se pone al nivel del resto del sistema: nombres lógicos + balanceo.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `api-gateway` debería:

- seguir arrancando correctamente,
- seguir integrado con Config Server y Eureka,
- y además quedar listo para enrutar usando URIs del tipo `lb://servicio`.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- `api-gateway` tiene agregada la dependencia de Spring Cloud LoadBalancer,
- arranca correctamente,
- sigue integrado con Eureka,
- y entendés que el valor de esta clase es estructural, no todavía una prueba final de ruteo.

Si eso está bien, ya podemos pasar al siguiente tema y configurar las primeras rutas reales del gateway con `lb://`.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a definir las primeras rutas reales de `api-gateway` hacia `catalog-service`, `inventory-service` y `order-service`, usando `lb://` y dejando a NovaMarket con su primer punto de entrada funcional.

---

## Cierre

En esta clase integramos Spring Cloud LoadBalancer en `api-gateway`.

Con eso, NovaMarket deja listo el soporte técnico que faltaba para que el gateway deje de ser solo un punto de entrada creado y pase a convertirse en un enroutador real apoyado en discovery y balanceo por nombre lógico.
