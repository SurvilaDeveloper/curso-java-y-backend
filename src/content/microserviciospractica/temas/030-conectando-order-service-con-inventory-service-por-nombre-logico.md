---
title: "Conectando order-service con inventory-service por nombre lógico"
description: "Reemplazo de la URL fija en order-service por resolución vía Eureka y OpenFeign. Integración real por nombre lógico dentro de NovaMarket."
order: 30
module: "Módulo 5 · Service Discovery y comunicación profesional"
level: "intermedio"
draft: false
---

# Conectando `order-service` con `inventory-service` por nombre lógico

En la clase anterior integramos **OpenFeign** en `order-service` y reemplazamos el cliente manual por una interfaz declarativa.

Eso mejoró bastante la claridad interna de la integración, pero todavía nos quedó una rigidez importante:

**la URL del servicio remoto sigue estando fija.**

Hoy vamos a resolver justamente eso.

La idea es que `order-service` deje de llamar a:

```txt
http://localhost:8082
```

y pase a resolver a `inventory-service` por su **nombre lógico** registrado en Eureka.

Este es uno de los pasos más importantes del curso hasta ahora, porque marca la transición desde una integración funcional pero rígida a una integración mucho más propia de una arquitectura de microservicios.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- `order-service` consumiendo `inventory-service` por nombre lógico,
- el cliente Feign ya sin URL fija,
- la resolución apoyada en Eureka,
- y el flujo `POST /orders` funcionando correctamente sobre discovery real.

---

## Estado de partida

Partimos de este contexto:

- `discovery-server` está funcionando,
- `catalog-service`, `inventory-service` y `order-service` ya se registran en Eureka,
- `order-service` ya usa Feign,
- pero el cliente declarativo todavía tiene una URL fija hacia inventario.

Eso significa que ya tenemos todos los componentes necesarios, pero todavía no los terminamos de conectar del modo correcto.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- ajustar el cliente Feign,
- usar como referencia el nombre lógico de `inventory-service`,
- verificar configuración necesaria,
- levantar la arquitectura,
- y probar que `order-service` ya no depende de una URL explícita para encontrar a inventario.

---

## Qué cambia realmente con este paso

Hasta ahora, aunque el servicio ya estaba registrado en Eureka, `order-service` no necesitaba ese registro para llamar a inventario.

Después de esta clase, la lógica cambia.

`order-service` ya no va a decir:

- “andá a tal host y tal puerto”

Va a decir algo más cercano a:

- “necesito hablar con `inventory-service`”

Y será la infraestructura de discovery la que ayude a resolver dónde está esa instancia.

Ese cambio es muy importante.

---

## Paso 1 · Revisar el nombre registrado de `inventory-service`

Antes de tocar el cliente, conviene revisar en Eureka cómo aparece `inventory-service`.

En la consola de `discovery-server`, deberías ver algo equivalente a:

```txt
INVENTORY-SERVICE
```

Eso nos confirma que el nombre lógico del servicio es el esperado y que la resolución por descubrimiento tiene una base confiable.

---

## Paso 2 · Ajustar el cliente Feign

Ahora vamos a modificar `InventoryFeignClient` para que deje de usar la URL fija y pase a usar el nombre lógico del servicio registrado.

La interfaz debería quedar razonablemente así:

```java
package com.novamarket.order.service;

import com.novamarket.order.dto.InventoryItemResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "inventory-service")
public interface InventoryFeignClient {

    @GetMapping("/inventory/{productId}")
    InventoryItemResponse findByProductId(@PathVariable("productId") Long productId);
}
```

Fijate que ahora:

- desaparece la URL fija,
- y el nombre del cliente coincide con el nombre lógico registrado en Eureka.

Ese detalle es clave.

---

## Paso 3 · Verificar que `order-service` siga registrado en Eureka

Este paso parece obvio, pero conviene confirmarlo.

Como `order-service` ahora quiere consumir a otro servicio por discovery, necesitamos que:

- `order-service` también esté funcionando como cliente Eureka,
- se registre correctamente,
- y esté bien integrado con la infraestructura de discovery.

Si en clases anteriores eso ya quedó hecho, ahora alcanza con verificar que siga sano.

---

## Paso 4 · Verificar configuración de Eureka en ambos servicios

Revisá que en el `config-repo` tanto `inventory-service.yml` como `order-service.yml` mantengan correctamente:

```yaml
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka
```

Esto es importante porque ambos servicios tienen que formar parte del mismo entorno de descubrimiento.

---

## Paso 5 · Levantar `discovery-server`

Ahora toca preparar el entorno para la prueba real.

Primero levantá:

- `discovery-server`

Y verificá que la consola esté disponible en:

```txt
http://localhost:8761
```

---

## Paso 6 · Levantar `inventory-service`

Ahora levantá `inventory-service`.

Esperamos que:

- se registre en Eureka,
- aparezca como instancia disponible,
- y quede listo para ser consumido por nombre lógico.

Conviene mirar la consola de Eureka antes de seguir.

---

## Paso 7 · Levantar `order-service`

Ahora levantá `order-service`.

En este arranque conviene mirar especialmente:

- que el servicio siga cargando bien su configuración,
- que arranque correctamente con Feign,
- y que no haya errores de resolución del cliente remoto.

Si algo falla acá, muchas veces aparece bastante claro en los logs.

---

## Paso 8 · Verificar Eureka antes de probar

Antes de mandar requests, revisá otra vez la consola de Eureka y confirmá que estén visibles al menos:

- `INVENTORY-SERVICE`
- `ORDER-SERVICE`

Esto nos da bastante confianza de que la infraestructura de discovery está lista para sostener la llamada.

---

## Paso 9 · Probar una orden válida

Ahora sí, hagamos la prueba más importante de la clase.

Ejecutá:

```bash
curl -X POST http://localhost:8083/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 2 },
      { "productId": 2, "quantity": 1 }
    ]
  }'
```

La respuesta esperada debería seguir siendo:

- `201 Created`
- una orden válida
- con estado `CREATED`

Lo importante acá no es solo que funcione.  
Lo importante es que ahora funcione **sin** URL fija explícita en el cliente.

---

## Paso 10 · Probar un caso inválido

Ahora probá una orden con falta de stock:

```bash
curl -X POST http://localhost:8083/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 3, "quantity": 999 }
    ]
  }'
```

La respuesta debería seguir siendo un error de negocio controlado.

Esto confirma que el cambio de resolución no alteró la lógica funcional del servicio.

---

## Paso 11 · Confirmar que ya no dependemos de la URL fija

Este es uno de los chequeos más importantes de la clase.

Revisá el código de `order-service` y confirmá que:

- no quede una URL fija en el cliente Feign,
- el nombre lógico del servicio sea `inventory-service`,
- y toda la resolución remota esté apoyada en Eureka.

Ese es el verdadero objetivo del ejercicio.

---

## Qué estamos logrando con esta clase

Esta clase concreta una mejora arquitectónica muy importante:

`order-service` ya no está acoplado a una ubicación física fija de `inventory-service`.

Ahora la integración está basada en:

- nombre lógico,
- cliente declarativo,
- y descubrimiento centralizado.

Eso hace que el sistema quede bastante mejor preparado para seguir creciendo.

---

## Qué todavía no hicimos

Todavía no estamos hablando de:

- balanceo de carga explícito,
- múltiples instancias de inventario,
- circuit breaker sobre Feign,
- ni timeouts más finos.

Todo eso puede venir después.

La meta de hoy es mucho más precisa:

**reemplazar la URL fija por descubrimiento real.**

---

## Errores comunes en esta etapa

### 1. Dejar una URL fija por accidente en el cliente
Entonces Eureka realmente no está participando de la llamada.

### 2. Usar un nombre lógico distinto del registrado
Si el nombre no coincide, la resolución falla.

### 3. No levantar `discovery-server`
Sin Eureka arriba, esta integración no funciona como esperamos.

### 4. No verificar el registro del servicio remoto
Si `inventory-service` no aparece registrado, la llamada no se va a resolver.

### 5. Pensar que la consola de Eureka ya no importa
En esta clase sigue siendo una herramienta de diagnóstico muy útil.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `order-service` debería:

- usar Feign,
- consumir `inventory-service` por nombre lógico,
- y seguir creando órdenes correctamente cuando hay stock.

Eso representa uno de los saltos más importantes en la profesionalización de la integración entre servicios en NovaMarket.

---

## Punto de control

Antes de seguir, verificá que:

- `InventoryFeignClient` ya no tiene URL fija,
- usa `name = "inventory-service"`,
- `inventory-service` aparece registrado en Eureka,
- `order-service` también,
- y `POST /orders` sigue funcionando correctamente.

Si eso está bien, ya podemos hacer una verificación integral de la nueva integración profesional.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a probar de forma más integral la nueva integración con Eureka y Feign.

La idea es dejar completamente consolidado este bloque antes de pasar al siguiente.

---

## Cierre

En esta clase reemplazamos una integración rígida por una integración apoyada en descubrimiento real.

Con eso, NovaMarket ya dio un paso muy fuerte hacia una arquitectura más propia de microservicios: los servicios empiezan a hablarse por identidad lógica y no solo por ubicación fija.
