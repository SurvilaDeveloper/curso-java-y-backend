---
title: "Creando el modelo de producto en catalog-service"
description: "Primer paso funcional del dominio de NovaMarket. Creación del modelo Product en catalog-service, definición de sus campos y preparación del servicio para exponer el catálogo."
order: 8
module: "Módulo 2 · Primer flujo funcional del sistema"
level: "base"
draft: false
---

# Creando el modelo de producto en `catalog-service`

En esta clase vamos a dar el primer paso real sobre el dominio de **NovaMarket**.

Hasta ahora construimos la base del proyecto:

- preparamos el workspace,
- creamos los tres primeros microservicios,
- alineamos configuración mínima,
- y ordenamos la estructura interna.

Ahora sí empezamos a trabajar con algo que ya pertenece al negocio del sistema.

El objetivo de hoy es crear el modelo de producto dentro de `catalog-service`.

Todavía no vamos a persistirlo con base de datos ni a exponer endpoints completos; primero queremos definir bien qué representa un producto dentro de NovaMarket y dejar una estructura clara para que el servicio de catálogo empiece a tener identidad funcional.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creada la clase `Product` en `catalog-service`,
- definidos sus campos principales,
- ubicada dentro del paquete correcto,
- y lista para ser usada en las próximas clases por el servicio y el controlador del catálogo.

Todavía no esperamos tener una API de catálogo completa.  
Hoy nos enfocamos en el modelo base.

---

## Estado de partida

Partimos de este contexto:

- `catalog-service` ya existe,
- `inventory-service` ya existe,
- `order-service` ya existe,
- la configuración mínima ya está alineada,
- y la estructura base de paquetes ya fue definida.

Dentro de `catalog-service`, deberíamos tener una estructura similar a esta:

```txt
src/main/java/com/novamarket/catalog/
  CatalogServiceApplication.java
  controller/
  service/
  repository/
  model/
  dto/
  config/
```

---

## Qué vamos a construir hoy

En esta clase vamos a:

- pensar qué es un producto en NovaMarket,
- definir sus campos iniciales,
- crear la clase `Product`,
- ubicarla en `model/`,
- y dejarla lista para empezar a usarla en el flujo del catálogo.

---

## Qué representa un producto en NovaMarket

Dentro del dominio del curso, un producto es un elemento del catálogo que un usuario puede consultar y eventualmente incluir dentro de una orden.

No hace falta que el modelo inicial sea gigantesco.  
De hecho, conviene empezar con una versión simple pero suficiente.

Una primera representación razonable de `Product` podría incluir campos como estos:

- `id`
- `name`
- `description`
- `price`
- `active`

Con eso ya podemos construir un catálogo bastante útil para las primeras etapas del proyecto.

---

## Por qué conviene empezar simple

Todavía no necesitamos:

- imágenes,
- categorías complejas,
- SKU avanzado,
- auditoría,
- ni atributos demasiado sofisticados.

Este curso práctico tiene una lógica progresiva.  
Primero queremos un producto que alcance para:

- listar,
- consultar por id,
- y usarlo más adelante como base para inventario y órdenes.

Agregar demasiada complejidad desde ahora solo volvería más pesada la implementación sin aportar valor real a este punto del recorrido.

---

## Paso 1 · Crear la clase `Product`

Dentro de `catalog-service`, creá esta clase en:

```txt
src/main/java/com/novamarket/catalog/model/Product.java
```

La clase debería representar el producto del catálogo.

Una primera versión razonable podría verse así:

```java
package com.novamarket.catalog.model;

import java.math.BigDecimal;

public class Product {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private boolean active;

    public Product() {
    }

    public Product(Long id, String name, String description, BigDecimal price, boolean active) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
```

---

## Por qué usamos `BigDecimal` para el precio

Este detalle vale la pena fijarlo desde ahora.

Para valores monetarios no conviene usar tipos pensados para cálculos de coma flotante imprecisos.  
En Java, una opción mucho más razonable para representar precios es `BigDecimal`.

Aunque todavía no hagamos lógica compleja de dinero, es una buena costumbre empezar bien.

---

## Paso 2 · Revisar si los campos tienen sentido para esta etapa

Una vez creada la clase, conviene revisar si cada campo tiene una razón clara.

### `id`
Nos va a servir para identificar el producto.

### `name`
Es el nombre visible del producto.

### `description`
Sirve para tener una descripción más expresiva en el catálogo.

### `price`
Es necesario para el catálogo y también va a ser útil más adelante cuando armemos órdenes.

### `active`
Nos permite introducir una idea muy práctica: no todo producto visible en desarrollo tiene por qué estar siempre habilitado.

---

## Paso 3 · Verificar imports y compilación

Después de crear la clase, conviene revisar:

- el package declaration,
- los imports,
- y que el proyecto compile correctamente.

Aunque la clase sea simple, este es un buen momento para sostener la lógica de verificación continua del curso.

---

## Paso 4 · Levantar nuevamente `catalog-service`

Ahora conviene volver a arrancar `catalog-service`.

¿Por qué?

Porque queremos confirmar que:

- la nueva clase no introdujo errores,
- el package está bien resuelto,
- y el servicio sigue sano antes de agregar más piezas.

Todavía no existe ningún endpoint usando `Product`, pero ya debería compilar y levantar sin problemas.

---

## Qué todavía no hicimos

En esta clase todavía no implementamos:

- un `ProductService`,
- un `ProductController`,
- una lista en memoria de productos,
- persistencia,
- ni DTOs específicos.

Eso viene a continuación.

El objetivo de hoy es dejar el modelo inicial del catálogo bien definido.

---

## Recomendación de diseño para esta etapa

Conviene resistir la tentación de mezclar cosas que todavía no corresponden.

Por ejemplo:

- no hace falta anotar `Product` como entidad JPA todavía,
- no hace falta crear repositorios ahora,
- no hace falta convertirlo a record si todavía no querés fijar ese criterio para todo el curso,
- y no hace falta generar lógica dentro del modelo.

Por ahora, mantenerlo simple es una muy buena decisión.

---

## Qué valor práctico tiene esta clase

A veces la creación de un modelo parece un paso “menor”, pero en realidad cumple una función importante:

empieza a transformar un microservicio genérico en una pieza con responsabilidad concreta dentro del sistema.

Después de esta clase, `catalog-service` ya no es solo una app Spring vacía.  
Empieza a tener un concepto de negocio propio: el producto.

---

## Errores comunes en esta etapa

### 1. Crear la clase en un paquete incorrecto
Debería vivir en `model/` según la estructura del curso.

### 2. Elegir tipos poco apropiados para el precio
Conviene usar `BigDecimal`.

### 3. Sobrecargar el modelo con demasiados campos
No hace falta modelar todo desde el principio.

### 4. Mezclar persistencia antes de tiempo
Todavía no estamos en la etapa de JPA.

### 5. No recompilar o no volver a levantar el servicio
El curso práctico se apoya mucho en validar cada paso.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, dentro de `catalog-service` debería existir:

```txt
src/main/java/com/novamarket/catalog/model/Product.java
```

Y esa clase debería representar el producto base del sistema con campos como:

- `id`
- `name`
- `description`
- `price`
- `active`

Además, `catalog-service` debería seguir arrancando sin errores.

---

## Punto de control

Antes de seguir, verificá que:

- la clase `Product` existe en `model/`,
- usa `BigDecimal` para `price`,
- compila correctamente,
- `catalog-service` arranca bien,
- y el modelo ya te resulta coherente para empezar a construir el catálogo.

Si eso está listo, ya podemos empezar a exponer funcionalidad real sobre ese modelo.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a usar este modelo para crear los primeros endpoints de catálogo.

Eso significa que `catalog-service` va a dejar de ser solo un servicio con un modelo interno y va a empezar a responder una API real.

---

## Cierre

En esta clase creamos `Product`, el primer modelo de dominio real de NovaMarket.

Con eso, `catalog-service` empieza a convertirse en un servicio funcional y ya deja preparada la base para que en la próxima clase podamos exponer los primeros endpoints del catálogo.
