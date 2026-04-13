---
title: "Persistiendo inventario en inventory-service"
description: "Migración de inventory-service desde datos en memoria hacia persistencia real con Spring Data JPA, manteniendo operativos los endpoints de inventario en NovaMarket."
order: 17
module: "Módulo 3 · Persistencia real con JPA"
level: "intermedio"
draft: false
---

# Persistiendo inventario en `inventory-service`

En la clase anterior empezamos el bloque de persistencia real llevando `catalog-service` desde una lista en memoria hacia una implementación basada en **Spring Data JPA**.

Ahora vamos a hacer lo mismo con el segundo servicio del dominio:

**`inventory-service`**

Este paso es muy importante porque `order-service` ya depende de inventario para validar stock.  
Mientras `inventory-service` siga usando datos en memoria, el sistema todavía queda a mitad de camino entre demo y aplicación real.

La idea de esta clase es simple:

**hacer que el stock de NovaMarket ya no viva en una lista fija dentro del código, sino en una base real de trabajo.**

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- agregada persistencia JPA a `inventory-service`,
- configurada una base de datos de trabajo,
- adaptado `InventoryItem` como entidad,
- creado el repositorio correspondiente,
- migrado el servicio desde la lista en memoria,
- y mantenidos operativos:
  - `GET /inventory`
  - `GET /inventory/{productId}`

---

## Estado de partida

Partimos de este contexto:

- `catalog-service` ya usa persistencia real,
- `inventory-service` todavía usa una lista en memoria,
- `order-service` ya consulta a `inventory-service` antes de crear una orden.

Eso quiere decir que si cambiamos la implementación interna de inventario, necesitamos hacerlo sin romper el contrato HTTP actual.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- agregar dependencias de persistencia,
- configurar una base de datos para `inventory-service`,
- adaptar `InventoryItem`,
- crear `InventoryRepository`,
- reemplazar la lista en memoria por consultas reales,
- cargar datos iniciales,
- y verificar que los endpoints sigan funcionando.

---

## Decisión práctica para esta etapa

Igual que con `catalog-service`, en esta fase del curso conviene mantener un entorno de persistencia simple y rápido de levantar.

Una muy buena opción es usar **H2** también para inventario.

Eso nos permite:

- avanzar sin agregar infraestructura externa todavía,
- centrarnos en JPA,
- validar el comportamiento real del servicio,
- y sostener una transición gradual hacia una arquitectura más madura.

Más adelante ya habrá tiempo de mover estas bases a un entorno más realista si el curso lo requiere.

---

## Paso 1 · Agregar dependencias de persistencia

Dentro de `inventory-service`, asegurate de incluir en el `pom.xml` las dependencias necesarias para trabajar con persistencia.

Como mínimo:

- **Spring Data JPA**
- **H2 Database** si estás usando H2 en esta etapa

La idea es dejar a `inventory-service` en un estado equivalente al que ya tiene `catalog-service` desde el punto de vista de infraestructura de persistencia.

---

## Paso 2 · Configurar la base en `application.yml`

Ahora agregá configuración de datasource y JPA en `inventory-service`.

Una configuración razonable para esta etapa podría verse conceptualmente así:

```yaml
spring:
  application:
    name: inventory-service
  datasource:
    url: jdbc:h2:mem:inventorydb
    driver-class-name: org.h2.Driver
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

server:
  port: 8082
```

El objetivo no es todavía afinar cada detalle de producción, sino dejar el servicio listo para persistir stock de forma real.

---

## Paso 3 · Adaptar `InventoryItem` como entidad

Hasta ahora `InventoryItem` era solo un modelo simple.  
Ahora necesitamos convertirlo en una entidad JPA.

Una versión razonable podría quedar así:

```java
package com.novamarket.inventory.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "inventory_items")
public class InventoryItem {

    @Id
    private Long productId;

    private Integer availableQuantity;

    public InventoryItem() {
    }

    public InventoryItem(Long productId, Integer availableQuantity) {
        this.productId = productId;
        this.availableQuantity = availableQuantity;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getAvailableQuantity() {
        return availableQuantity;
    }

    public void setAvailableQuantity(Integer availableQuantity) {
        this.availableQuantity = availableQuantity;
    }
}
```

---

## Por qué usamos `productId` como `@Id`

En esta etapa del curso, esta decisión es bastante razonable porque el inventario está modelado como una entrada por producto.

Eso nos deja una relación conceptual muy clara:

- cada producto tiene una disponibilidad,
- y `productId` ya funciona como identificador natural de esa fila de inventario.

Más adelante, si el sistema creciera hacia depósitos múltiples o movimientos complejos, podríamos necesitar otro modelo.  
Pero para NovaMarket en esta etapa, esta decisión es simple y consistente.

---

## Paso 4 · Crear `InventoryRepository`

Ahora creá el repositorio:

```txt
src/main/java/com/novamarket/inventory/repository/InventoryRepository.java
```

Una versión mínima razonable podría ser:

```java
package com.novamarket.inventory.repository;

import com.novamarket.inventory.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {
}
```

Esto nos va a permitir consultar y gestionar stock sin tener que implementar una capa manual de acceso a datos.

---

## Paso 5 · Modificar `InventoryService`

Ahora toca reemplazar la lista en memoria por acceso real al repositorio.

Una versión razonable del servicio podría quedar así:

```java
package com.novamarket.inventory.service;

import com.novamarket.inventory.model.InventoryItem;
import com.novamarket.inventory.repository.InventoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    public List<InventoryItem> findAll() {
        return inventoryRepository.findAll();
    }

    public InventoryItem findByProductId(Long productId) {
        return inventoryRepository.findById(productId).orElse(null);
    }
}
```

Fijate que el contrato del servicio hacia el controller prácticamente no cambia.  
Ese es un muy buen síntoma de que la transición está bien encapsulada.

---

## Paso 6 · Cargar stock inicial

Igual que pasó con el catálogo, si movemos el inventario a base y no cargamos datos, el servicio va a responder vacío.

Para esta etapa, una solución simple y útil es cargar datos de ejemplo al arrancar.

Podés hacerlo con un `CommandLineRunner`.

Por ejemplo, en `config/` podés crear algo conceptualmente equivalente a esto:

```java
package com.novamarket.inventory.config;

import com.novamarket.inventory.model.InventoryItem;
import com.novamarket.inventory.repository.InventoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class InventoryDataLoader {

    @Bean
    CommandLineRunner loadInventory(InventoryRepository inventoryRepository) {
        return args -> {
            if (inventoryRepository.count() == 0) {
                inventoryRepository.save(new InventoryItem(1L, 15));
                inventoryRepository.save(new InventoryItem(2L, 40));
                inventoryRepository.save(new InventoryItem(3L, 8));
            }
        };
    }
}
```

Esto deja al servicio con el mismo comportamiento funcional que tenía antes, pero ahora usando persistencia real.

---

## Paso 7 · Levantar `inventory-service`

Ahora toca volver a arrancar `inventory-service`.

En este punto conviene prestar atención a:

- la creación de tablas,
- la inicialización del esquema,
- la carga de datos,
- y cualquier error relacionado con entidades o repositorios.

Si activaste logs SQL, esta clase se vuelve todavía más fácil de seguir.

---

## Paso 8 · Probar los endpoints de inventario otra vez

Ahora repetí las pruebas que ya venías haciendo antes:

```bash
curl http://localhost:8082/inventory
```

Y:

```bash
curl http://localhost:8082/inventory/1
```

La idea es verificar que el comportamiento externo siga igual aunque la implementación interna ya no dependa de una lista fija.

---

## Paso 9 · Verificar el impacto en `order-service`

Este paso es especialmente valioso.

Como `order-service` ya depende de `inventory-service`, conviene verificar que la integración actual siga funcionando sin cambios en el contrato.

Probá nuevamente crear una orden válida:

```bash
curl -X POST http://localhost:8083/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 2 }
    ]
  }'
```

Si esto sigue funcionando, entonces la migración de inventario hacia JPA fue transparente para el servicio consumidor.

Eso es una muy buena señal de evolución sana del sistema.

---

## Qué estamos logrando con esta clase

Esta clase consolida algo muy importante:

**el flujo de órdenes ya no depende de un servicio de inventario “fake” en memoria, sino de uno persistente.**

Eso acerca mucho más a NovaMarket a un sistema real.

Además, fortalece una idea central del curso práctico:  
vamos evolucionando internamente los servicios sin romper innecesariamente sus contratos externos.

---

## Qué todavía no hicimos

Todavía no persistimos órdenes.  
Y tampoco estamos:

- descontando stock,
- haciendo reservas,
- usando transacciones distribuidas,
- ni trabajando con datos cargados por scripts más elaborados.

Todo eso puede venir después.

La meta de hoy es más concreta:

**que `inventory-service` ya sea persistente y compatible con el flujo actual.**

---

## Errores comunes en esta etapa

### 1. No anotar `InventoryItem` como entidad
Entonces JPA no la trata como tabla persistente.

### 2. Olvidar crear `InventoryRepository`
Sin eso, el servicio no puede salir de la lista en memoria.

### 3. No cargar datos iniciales
El endpoint puede responder vacío y parecer roto.

### 4. Romper el contrato HTTP sin querer
Conviene que `GET /inventory` y `GET /inventory/{productId}` sigan comportándose igual.

### 5. No volver a probar `POST /orders`
Ese test sirve para confirmar que la migración no rompió la integración con `order-service`.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `inventory-service` debería:

- usar Spring Data JPA,
- persistir stock en una base de trabajo,
- cargar datos iniciales,
- seguir respondiendo correctamente sus endpoints,
- y seguir siendo consumido correctamente por `order-service`.

Esto deja al flujo distribuido en un estado bastante más sólido.

---

## Punto de control

Antes de seguir, verificá que:

- `InventoryItem` es entidad JPA,
- existe `InventoryRepository`,
- `InventoryService` usa el repositorio,
- los datos iniciales se cargan correctamente,
- `GET /inventory` sigue funcionando,
- y `POST /orders` sigue validando stock correctamente.

Si todo eso está bien, ya estamos listos para persistir también las órdenes.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a llevar persistencia real a `order-service`.

Eso significa que las órdenes dejarán de existir solo como respuesta en memoria y pasarán a quedar registradas de forma real en el sistema.

---

## Cierre

En esta clase migramos `inventory-service` desde una lista en memoria hacia una implementación con Spring Data JPA.

Con eso, NovaMarket da otro paso importante hacia una arquitectura más realista: el stock ya es persistente y sigue sosteniendo el flujo de creación de órdenes sin romper la integración existente.
