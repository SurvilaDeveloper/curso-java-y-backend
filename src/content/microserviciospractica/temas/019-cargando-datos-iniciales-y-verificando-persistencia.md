---
title: "Cargando datos iniciales y verificando persistencia"
description: "Checkpoint práctico del bloque de persistencia. Revisión de datos iniciales, validación de comportamiento persistente y verificación del estado actual de NovaMarket."
order: 19
module: "Módulo 3 · Persistencia real con JPA"
level: "intermedio"
draft: false
---

# Cargando datos iniciales y verificando persistencia

En las últimas clases llevamos persistencia real a:

- `catalog-service`
- `inventory-service`
- `order-service`

Eso significa que NovaMarket ya dejó atrás una parte importante de su etapa “en memoria”.

Pero cuando un proyecto cambia tan fuerte por dentro, conviene hacer una pausa y revisar algo muy importante:

**que los datos iniciales estén bien cargados y que el comportamiento persistente realmente sea el que esperamos.**

Ese es el objetivo de esta clase.

No vamos a incorporar una nueva tecnología grande.  
Vamos a hacer un checkpoint técnico del sistema para asegurarnos de que la base actual quedó sólida antes de seguir avanzando.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- `catalog-service` carga productos iniciales correctamente,
- `inventory-service` carga stock inicial correctamente,
- `order-service` persiste órdenes correctamente,
- el flujo de creación de órdenes sigue funcionando,
- y el sistema actual quedó sano después de la transición a JPA.

---

## Estado de partida

En este punto del curso:

- `catalog-service` ya usa JPA y carga productos iniciales,
- `inventory-service` ya usa JPA y carga stock inicial,
- `order-service` ya usa JPA para guardar órdenes,
- y el flujo `POST /orders` sigue validando inventario antes de crear la orden.

Es un gran avance, pero también un punto ideal para revisar el estado actual del proyecto.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- levantar los servicios persistentes,
- verificar los datos iniciales de catálogo,
- verificar los datos iniciales de inventario,
- crear órdenes nuevas,
- observar ids y datos generados,
- y confirmar que el sistema ya no depende de colecciones en memoria para estas partes del flujo.

---

## Paso 1 · Levantar los servicios necesarios

Para esta clase conviene levantar al menos:

- `catalog-service`
- `inventory-service`
- `order-service`

La idea es tener operativo el flujo completo que ya construimos.

---

## Paso 2 · Verificar los productos iniciales del catálogo

Primero, consultá:

```bash
curl http://localhost:8081/products
```

La respuesta debería incluir los productos cargados por el data loader.

Por ejemplo, deberías ver entradas equivalentes a:

- producto `1`
- producto `2`
- producto `3`

Esto confirma dos cosas:

1. el servicio arrancó correctamente,
2. los datos iniciales del catálogo se cargaron como esperábamos.

---

## Paso 3 · Verificar una consulta puntual del catálogo

Ahora probá:

```bash
curl http://localhost:8081/products/1
```

Y también:

```bash
curl http://localhost:8081/products/99
```

La idea es confirmar que:

- la consulta por id sigue funcionando,
- y el comportamiento frente a datos inexistentes no cambió con el paso a persistencia.

Desde afuera, el contrato del servicio debería seguir viéndose estable.

---

## Paso 4 · Verificar los datos iniciales del inventario

Ahora repetí la lógica sobre inventario.

Primero:

```bash
curl http://localhost:8082/inventory
```

Y después:

```bash
curl http://localhost:8082/inventory/1
```

También conviene probar un id inexistente:

```bash
curl http://localhost:8082/inventory/99
```

Acá queremos confirmar que:

- el stock se cargó correctamente,
- la relación conceptual con el catálogo sigue siendo coherente,
- y los endpoints del servicio siguen funcionando igual que antes, aunque ahora usen persistencia real.

---

## Paso 5 · Revisar coherencia entre catálogo e inventario

Este paso vale mucho la pena.

Compará mentalmente o visualmente:

- los ids de productos del catálogo,
- con los `productId` presentes en inventario.

La meta es verificar que la base del sistema sigue siendo coherente para el flujo de órdenes.

Si en esta etapa los datos iniciales de un servicio no coinciden con los del otro, el problema no es solo “de datos”:  
es una inconsistencia del sistema que más adelante se vuelve más costosa.

---

## Paso 6 · Crear una orden válida

Ahora probemos persistencia real en `order-service`.

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

La respuesta esperada debería ser:

- `201 Created`
- una orden con id generado
- estado `CREATED`
- y los ítems recibidos

Esto ya confirma que:

- `order-service` sigue integrando bien con inventario,
- y además ahora persiste la orden.

---

## Paso 7 · Crear otra orden para verificar ids persistentes

Repetí otra creación válida.

Por ejemplo:

```bash
curl -X POST http://localhost:8083/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 3, "quantity": 1 }
    ]
  }'
```

La idea es comprobar que el id generado sea distinto al anterior y que la persistencia esté gestionando correctamente nuevas órdenes.

Esto ayuda a verificar que el sistema ya no se comporta como una simple respuesta generada en memoria.

---

## Paso 8 · Probar una orden inválida por stock insuficiente

También conviene verificar que la validación distribuida siga funcionando después de la migración a persistencia.

Por ejemplo:

```bash
curl -X POST http://localhost:8083/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 3, "quantity": 50 }
    ]
  }'
```

La respuesta debería seguir siendo:

- `400 Bad Request`
- un mensaje de error claro

Esto confirma que el cambio interno del almacenamiento no rompió la regla de negocio del flujo principal.

---

## Paso 9 · Mirar logs de arranque y de ejecución

En esta clase conviene prestar más atención de lo habitual a los logs.

Queremos verificar cosas como estas:

### En `catalog-service`
- creación de tabla
- inserts iniciales
- queries al consultar productos

### En `inventory-service`
- creación de tabla
- inserts iniciales
- queries por producto

### En `order-service`
- creación de tablas
- inserción de órdenes
- integración HTTP con inventario

Este tipo de revisión te da mucha más intuición sobre lo que realmente está haciendo el sistema.

---

## Paso 10 · Confirmar qué parte del sistema ya es persistente y cuál no

Este checkpoint también sirve para tener claro el mapa actual del proyecto.

### Ya persistente
- productos
- inventario
- órdenes

### Todavía no persistente o no construido
- notificaciones
- eventos
- seguridad
- discovery
- gateway
- trazas
- y el resto de la infraestructura avanzada

Tener claro este mapa evita confundir el nivel real de madurez del sistema.

---

## Qué estamos validando de verdad en esta clase

No se trata solamente de “ver si arranca”.

Lo que estamos validando es esto:

### 1. Que los servicios cargan correctamente datos iniciales
### 2. Que los contratos HTTP siguen estables tras migrar a JPA
### 3. Que `order-service` sigue integrando con inventario
### 4. Que las órdenes ya se guardan de verdad
### 5. Que NovaMarket tiene una base persistente confiable para seguir creciendo

Ese es un salto muy importante en el curso práctico.

---

## Qué hacer si algo falla

Si en esta clase algo falla, conviene no avanzar todavía.

Problemas frecuentes en este punto:

- entidades mal anotadas,
- tablas no creadas,
- data loaders no ejecutados,
- servicios levantando sobre una config vieja,
- errores de mapeo en colecciones embebidas,
- o contratos rotos entre servicios.

Justamente por eso esta clase existe como checkpoint técnico.

---

## Qué todavía no estamos haciendo

Todavía no tenemos un endpoint tipo `GET /orders` para inspeccionar órdenes persistidas desde HTTP.

Eso podría ser una mejora futura, pero no es obligatorio para esta etapa.

Por ahora, el foco está en verificar que el flujo principal:

- sigue funcionando,
- persiste correctamente,
- y no perdió coherencia después de los cambios internos.

---

## Checklist de verificación mínima

Al terminar esta clase deberías poder confirmar que:

- `GET /products` responde con datos persistidos,
- `GET /inventory` responde con datos persistidos,
- `POST /orders` crea órdenes válidas,
- `POST /orders` sigue rechazando órdenes sin stock,
- los ids de las órdenes ya no dependen de memoria,
- y el sistema está listo para seguir creciendo sobre persistencia real.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, NovaMarket debería sentirse bastante más sólido.

Ya no estamos trabajando solo con servicios “que responden”:
estamos trabajando con servicios que persisten datos y sostienen el flujo principal del sistema sobre una base más seria.

Eso nos deja en una muy buena posición para entrar al siguiente bloque del curso.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a empezar a refinar el contrato de órdenes incorporando DTOs, validaciones y respuestas más cuidadas.

Eso va a mejorar bastante la calidad de la API antes de pasar a bloques más avanzados del roadmap.

---

## Cierre

Esta clase funcionó como un checkpoint del bloque de persistencia real.

Nos permitió confirmar que catálogo, inventario y órdenes ya están apoyados en JPA, que los datos iniciales se cargan correctamente y que el flujo principal de creación de órdenes sigue funcionando después de estos cambios.

Con esto, NovaMarket queda listo para seguir evolucionando con una base bastante más firme.
