---
title: "Aplicando un primer filtro por ruta visible sobre order-api"
description: "Primer ejemplo práctico de filtro por ruta en el gateway. Aplicación de un comportamiento visible y puntual solo sobre las requests que atraviesan order-api en NovaMarket."
order: 47
module: "Módulo 6 · API Gateway"
level: "intermedio"
draft: false
---

# Aplicando un primer filtro por ruta visible sobre `order-api`

En la clase anterior dejamos algo bastante claro:

- el gateway ya no solo puede aplicar comportamiento transversal,
- también puede aplicar comportamiento específico sobre una ruta concreta,
- y NovaMarket ya está listo para mostrar esa diferencia de una forma práctica y visible.

Ahora toca el paso concreto:

**aplicar un primer filtro por ruta visible sobre `order-api`.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- implementado un filtro por ruta sobre el bloque de órdenes,
- visible que el comportamiento ya no afecta a todas las rutas del gateway,
- mucho más clara la diferencia práctica entre global y específico,
- y consolidado el nuevo nivel de control fino que `api-gateway` ya puede ejercer sobre NovaMarket.

La meta de hoy no es construir una lógica compleja de negocio.  
La meta es mucho más concreta: **hacer visible que el gateway puede tratar distinto a distintas partes del sistema**.

---

## Estado de partida

Partimos de un sistema donde ya:

- `api-gateway` enruta correctamente,
- existe un primer filtro global simple,
- catálogo, inventario y órdenes ya pasan por el gateway,
- y el módulo ya distinguió conceptualmente filtros globales de filtros por ruta.

Eso significa que el problema ya no es si se puede filtrar algo.

Ahora la pregunta útil es otra:

- **cómo hacer que solo una parte del sistema reciba un tratamiento especial dentro del gateway**

Y eso es exactamente lo que vamos a volver real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir una ruta concreta del sistema,
- aplicarle un filtro visible,
- comprobar que el efecto aparece solo en esa parte,
- y verificar que las demás rutas siguen sin verse afectadas por este nuevo comportamiento puntual.

---

## Por qué conviene elegir `order-api` como primer caso

Para esta etapa del curso, `order-api` es una muy buena candidata porque:

- ya tiene un peso funcional claro,
- representa una zona sensible del sistema,
- y además es una ruta bastante fácil de probar con requests visibles.

Eso la vuelve ideal para mostrar que el gateway ya puede tomar decisiones más finas según la parte del sistema que esté atravesando el tráfico.

---

## Qué filtro conviene aplicar como primer ejemplo

De nuevo, conviene empezar por algo simple y muy visible.

Una muy buena opción para esta clase es:

- **agregar un header extra solo en las responses de `order-api`**

Por ejemplo, algo como:

```txt
X-NovaMarket-Order-Route: true
```

Eso tiene varias ventajas:

- es fácil de configurar,
- es fácil de probar con `curl -i`,
- no rompe el comportamiento del sistema,
- y deja clarísimo que la lógica ya no es global, sino específica de una ruta.

---

## Paso 1 · Revisar la ruta actual de órdenes en `api-gateway.yml`

En este punto del curso, la ruta hacia órdenes probablemente ya se vea conceptualmente así:

```yaml
- id: order-service-route
  uri: lb://order-service
  predicates:
    - Path=/order-api/**
  filters:
    - StripPrefix=1
```

Eso está perfecto como base.

Lo importante ahora es que vamos a expandir la lista de filtros **solo** para esta ruta.

---

## Paso 2 · Agregar un filtro visible a la ruta de órdenes

Una forma muy simple y didáctica de hacerlo es agregar un header en la response.

Por ejemplo:

```yaml
- id: order-service-route
  uri: lb://order-service
  predicates:
    - Path=/order-api/**
  filters:
    - StripPrefix=1
    - AddResponseHeader=X-NovaMarket-Order-Route, true
```

Con esto, cualquier request que pase por `order-api` debería devolver ese header adicional.

Y lo más importante es esto:

- ese comportamiento queda pegado a una sola ruta
- no a todo el gateway

Ese es exactamente el aprendizaje central de la clase.

---

## Paso 3 · Levantar el entorno en orden

Como siempre, conviene levantar el entorno completo de forma razonable:

1. `config-server`
2. `discovery-server`
3. `catalog-service`
4. `inventory-service`
5. `order-service`
6. `api-gateway`

No porque la lógica del filtro lo exija estrictamente, sino porque queremos validar el cambio en el entorno real y no en una versión recortada del sistema.

---

## Paso 4 · Probar una request hacia órdenes

Ahora probá una request a través del gateway, por ejemplo:

```bash
curl -i -X POST http://localhost:8080/order-api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 1 }
    ]
  }'
```

Lo que queremos observar es que, además de la respuesta funcional habitual, ahora aparezca algo como:

```txt
X-NovaMarket-Order-Route: true
```

Ese es el mejor momento de toda la clase, porque vuelve muy visible la diferencia entre comportamiento global y comportamiento por ruta.

---

## Paso 5 · Probar catálogo y confirmar que no recibió ese filtro

Ahora hacé una request como:

```bash
curl -i http://localhost:8080/catalog/products
```

Y verificá que:

- sigue funcionando correctamente,
- pero **no** aparece el header específico de órdenes.

Este paso es crucial, porque si no lo hacés, la clase pierde gran parte de su valor didáctico.

No alcanza con ver que el filtro existe.  
Queremos confirmar que existe **solo donde corresponde**.

---

## Paso 6 · Probar inventario y confirmar lo mismo

Ahora repetí con inventario:

```bash
curl -i http://localhost:8080/inventory/inventory
```

De nuevo, lo esperable es que:

- la ruta funcione,
- el filtro global siga actuando si lo dejaste activo,
- pero el header específico de `order-api` no aparezca.

Eso termina de dejar clarísima la diferencia entre capas de filtrado.

---

## Paso 7 · Entender qué acabamos de demostrar

Lo que esta clase demuestra no es simplemente que “podemos agregar un header”.

Demuestra algo mucho más importante:

- el gateway ya no solo tiene comportamiento transversal,
- sino también la capacidad de tratar de forma distinta a distintas zonas del sistema.

Eso es una mejora de control enorme.

Porque abre la puerta a cosas como:

- reglas específicas por dominio,
- headers especiales solo para ciertas rutas,
- comportamiento diferenciado en bordes funcionales distintos,
- y más adelante, decisiones más finas de seguridad o trazabilidad.

---

## Paso 8 · Entender por qué este ejemplo vale tanto aunque sea simple

A primera vista, este filtro puede parecer pequeño.

Pero en realidad vale muchísimo porque cambia bastante la calidad del gateway.

Antes el gateway tenía:

- ruteo,
- discovery,
- balanceo,
- y un primer filtro global

Ahora además tiene:

- **comportamiento específico por ruta**

Ese salto es uno de los más importantes del bloque de filtros.

---

## Paso 9 · Entender qué todavía no estamos haciendo

Conviene dejar esto muy claro.

En esta etapa todavía no estamos:

- aplicando validaciones de negocio desde el gateway,
- ni armando seguridad real sobre `order-api`,
- ni construyendo un bloque complejo de manipulación por ruta.

La meta actual es mucho más concreta:

**demostrar con claridad que una ruta concreta del sistema puede recibir un tratamiento específico dentro del gateway.**

Y eso ya aporta muchísimo valor.

---

## Qué estamos logrando con esta clase

Esta clase convierte en algo observable la diferencia entre filtros globales y filtros por ruta.

Ya no estamos solo diciendo que el gateway puede comportarse distinto según el camino del sistema.  
Ahora también estamos haciendo que esa diferencia se vea en una response real dentro de NovaMarket.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- validamos con calma la convivencia entre filtro global y filtro por ruta,
- ni consolidamos todavía una primera capa ordenada de filtros dentro del gateway.

Todo eso viene enseguida.

La meta de hoy es mucho más concreta:

**aplicar un primer filtro por ruta visible sobre `order-api`.**

---

## Errores comunes en esta etapa

### 1. Probar solo la ruta afectada y no comparar con otra
La comparación con catálogo o inventario es parte esencial de la clase.

### 2. Elegir un efecto poco visible
Conviene empezar con algo que se vea fácil en headers.

### 3. No distinguir entre el filtro global y el filtro por ruta
Las dos capas pueden coexistir y eso justamente es parte del valor del ejemplo.

### 4. Pensar que el filtro por ruta reemplaza al global
No. Resuelven problemas distintos.

### 5. Querer empezar por lógica demasiado compleja
En esta etapa, lo simple y visible vale muchísimo más.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- `order-api` tiene un comportamiento adicional visible en el gateway,
- catálogo e inventario no lo heredan,
- y el punto de entrada del sistema ya puede tratar distintas partes del dominio con distinta lógica transversal.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- la ruta de órdenes tiene un filtro extra visible,
- las demás rutas no reciben ese comportamiento,
- el sistema sigue funcionando correctamente,
- y sentís que la diferencia entre global y por ruta ya dejó de ser teórica dentro de NovaMarket.

Si eso está bien, ya podemos pasar al siguiente tema y consolidar esta primera capa de filtros del gateway con un checkpoint más fuerte.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar una primera capa ordenada de filtros en `api-gateway`, leyendo qué nueva madurez ganó NovaMarket después de incorporar comportamiento transversal y comportamiento específico por ruta.

---

## Cierre

En esta clase aplicamos un primer filtro por ruta visible sobre `order-api`.

Con eso, NovaMarket deja de usar el gateway solo para comportamiento global y empieza a mostrar, de forma concreta y práctica, que distintas partes del sistema pueden recibir tratamientos distintos dentro del punto de entrada del sistema.
