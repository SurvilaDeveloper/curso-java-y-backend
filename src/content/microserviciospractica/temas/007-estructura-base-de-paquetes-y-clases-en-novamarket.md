---
title: "Estructura base de paquetes y clases en NovaMarket"
description: "Definición de una organización interna clara para los microservicios iniciales del proyecto. Paquetes recomendados, capas base y criterios para mantener coherencia a medida que NovaMarket crezca."
order: 7
module: "Módulo 1 · Preparación del proyecto y primeros servicios"
level: "base"
draft: false
---

# Estructura base de paquetes y clases en NovaMarket

Ya tenemos tres microservicios creados y configurados:

- `catalog-service`
- `inventory-service`
- `order-service`

Ahora nos falta otro paso clave antes de empezar a meter lógica de negocio real:

**definir una organización interna clara para el código.**

Cuando un proyecto empieza a crecer, una mala estructura de paquetes puede volverlo difícil de leer, de mantener y de evolucionar.  
En un curso práctico eso se nota mucho, porque si los servicios se desordenan desde el principio, después cada clase agrega fricción innecesaria.

Por eso, en esta clase vamos a fijar la base organizativa que vamos a usar en NovaMarket.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar claro:

- cómo vamos a organizar paquetes dentro de cada microservicio,
- qué capas básicas vamos a usar,
- qué criterios vamos a repetir en todos los servicios,
- y cómo evitar que el proyecto se vuelva caótico a medida que crezca.

No vamos a construir todavía entidades completas ni endpoints funcionales del negocio.  
El foco de hoy está en la **estructura**.

---

## Estado de partida

Partimos de tres servicios Spring Boot ya creados y con configuración mínima alineada.

Por ejemplo:

```txt
novamarket/
  services/
    catalog-service/
    inventory-service/
    order-service/
```

Cada uno debería arrancar correctamente y tener ya su clase principal `@SpringBootApplication`.

---

## Qué vamos a construir hoy

En esta clase vamos a definir:

- paquete base de cada servicio,
- subpaquetes recomendados,
- criterio de organización por capas,
- y clases mínimas o espacios donde luego vivirán los componentes del proyecto.

La idea no es llenar el proyecto de clases vacías sin necesidad.  
La idea es dejar una estructura clara que nos sirva de guía durante las próximas clases.

---

## Qué tipo de organización conviene usar

Para este curso, una opción muy razonable es usar una organización simple por capas.

No porque sea la única válida, sino porque:

- es fácil de entender,
- funciona bien para un curso progresivo,
- ayuda a separar responsabilidades,
- y permite introducir cambios sin que el proyecto se vuelva confuso demasiado pronto.

Una estructura base recomendada podría incluir paquetes como estos:

- `controller`
- `service`
- `repository`
- `model`
- `dto`
- `config`

No todos van a usarse desde el primer minuto, pero sí conviene dejar claro que ese será el patrón general del curso.

---

## Paquete base recomendado

Una buena práctica es que cada servicio tenga un paquete raíz coherente con el group elegido en Initializr.

Por ejemplo, si venimos usando:

```txt
com.novamarket
```

entonces una estructura razonable sería:

### Para `catalog-service`
```txt
com.novamarket.catalog
```

### Para `inventory-service`
```txt
com.novamarket.inventory
```

### Para `order-service`
```txt
com.novamarket.order
```

Esto ayuda bastante porque:

- separa claramente los servicios,
- evita paquetes genéricos demasiado amplios,
- y hace más clara la identidad de cada módulo.

---

## Estructura interna sugerida por servicio

Tomemos como ejemplo `catalog-service`.

Una estructura base razonable podría ser:

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

Lo mismo puede adaptarse para los otros servicios:

### `inventory-service`
```txt
src/main/java/com/novamarket/inventory/
  InventoryServiceApplication.java
  controller/
  service/
  repository/
  model/
  dto/
  config/
```

### `order-service`
```txt
src/main/java/com/novamarket/order/
  OrderServiceApplication.java
  controller/
  service/
  repository/
  model/
  dto/
  config/
```

---

## Qué rol cumple cada paquete

### `controller`
Acá van a vivir los endpoints HTTP.

Más adelante, por ejemplo, en `catalog-service` vamos a tener controladores para exponer productos.

### `service`
Va a contener la lógica de aplicación o de negocio que no queremos dejar mezclada con el controlador.

### `repository`
Se usará cuando incorporemos persistencia con JPA.

### `model`
Va a alojar entidades o modelos del dominio del servicio.

### `dto`
Nos va a servir para requests y responses, especialmente cuando convenga separar estructuras externas del modelo interno.

### `config`
Va a contener configuraciones específicas del servicio cuando empiecen a aparecer.

---

## Por qué no conviene meter todo en un solo paquete

Al principio puede parecer tentador dejar todas las clases juntas porque el proyecto todavía es pequeño.

Pero eso trae varios problemas:

- mezcla de responsabilidades,
- dificultad para encontrar cosas,
- controladores y lógica de negocio demasiado cerca,
- y menos claridad cuando el servicio empieza a crecer.

En un curso práctico como este, una estructura un poco más ordenada desde el principio ayuda muchísimo.

---

## Qué tampoco conviene hacer

Tampoco conviene sobrediseñar.

No hace falta crear hoy veinte paquetes sofisticados ni introducir estructuras muy complejas si todavía no aportan valor.

Por eso la propuesta del curso es una estructura **simple pero consistente**.

Queremos evitar ambos extremos:

- ni todo mezclado,
- ni una arquitectura interna exagerada para un servicio que recién empieza.

---

## Paso 1 · Revisar el paquete base actual

Entrá en cada proyecto y revisá cómo quedó el paquete generado por Initializr.

Si el package base del proyecto quedó algo genérico o no sigue el patrón que querés para el curso, este es un buen momento para corregirlo.

La meta recomendada es que cada servicio quede bajo un paquete raíz claro, por ejemplo:

- `com.novamarket.catalog`
- `com.novamarket.inventory`
- `com.novamarket.order`

---

## Paso 2 · Revisar la clase principal

La clase principal debería quedar dentro del paquete raíz del servicio.

Por ejemplo:

### `catalog-service`
```txt
com.novamarket.catalog.CatalogServiceApplication
```

### `inventory-service`
```txt
com.novamarket.inventory.InventoryServiceApplication
```

### `order-service`
```txt
com.novamarket.order.OrderServiceApplication
```

Esto es importante porque Spring Boot escanea componentes a partir del paquete donde se encuentra la clase principal.

Si más adelante empezamos a ubicar clases fuera de ese árbol, podemos encontrarnos con problemas evitables de escaneo.

---

## Paso 3 · Crear los subpaquetes base

En cada servicio, podés crear la estructura mínima sugerida:

- `controller`
- `service`
- `repository`
- `model`
- `dto`
- `config`

No hace falta llenarlos hoy.  
Pero sí conviene dejarlos listos o, al menos, decidir que esa va a ser la estructura que vamos a usar.

Esto ayuda a que las próximas clases sean mucho más directas.

---

## Paso 4 · Mantener el mismo patrón en los tres servicios

Este paso es muy importante.

No queremos que:

- `catalog-service` tenga una estructura,
- `inventory-service` otra distinta,
- y `order-service` otra totalmente diferente sin razón.

La consistencia entre servicios va a ser una de las fortalezas del curso.

Después, cuando aparezcan necesidades particulares, podremos ajustar.  
Pero la base debería ser homogénea.

---

## Paso 5 · Revisar imports y nombres después de mover paquetes

Si cambiaste el paquete raíz o moviste clases, revisá:

- imports,
- package declarations,
- y referencias del IDE.

Después de este tipo de ajustes, conviene recompilar o relanzar el servicio para asegurarte de que todo quedó bien.

---

## Paso 6 · Levantar nuevamente los servicios

Una vez acomodada la estructura, conviene volver a levantar los tres servicios.

¿Por qué?

Porque así verificás enseguida que:

- mover paquetes no rompió nada,
- la clase principal sigue siendo válida,
- y el proyecto mantiene un estado saludable antes de pasar a la construcción funcional.

---

## Qué gana NovaMarket con esta estructura

Este paso no agrega todavía una funcionalidad visible para el usuario, pero sí agrega algo muy importante para el proyecto:

**capacidad de crecer sin desorden.**

Gracias a esta base, cuando empecemos a crear:

- `Product`
- `InventoryItem`
- `Order`
- controllers
- DTOs
- services

vamos a tener claro dónde vive cada cosa.

Eso mejora muchísimo la experiencia del curso.

---

## Ejemplo conceptual de cómo se va a usar después

Más adelante, en `catalog-service`, podríamos llegar a tener algo así:

```txt
com.novamarket.catalog
  CatalogServiceApplication.java
  controller/
    ProductController.java
  service/
    ProductService.java
  repository/
    ProductRepository.java
  model/
    Product.java
  dto/
    ProductResponse.java
```

Y el mismo criterio general se repetirá en otros servicios.

Ese tipo de previsibilidad es muy útil.

---

## Errores comunes en esta etapa

### 1. Dejar cada servicio con una estructura distinta
Eso hace más difícil mantener coherencia en el curso.

### 2. Mover la clase principal a un lugar extraño
Puede afectar el escaneo de Spring.

### 3. Crear demasiados paquetes innecesarios
Conviene mantener una base simple.

### 4. No recompilar después de mover paquetes
Eso puede dejar errores ocultos hasta la siguiente clase.

### 5. Mezclar clases del dominio en paquetes genéricos
Mejor dejar desde ahora un lugar claro para `model`, `dto`, `service`, etc.

---

## Resultado esperado al terminar la clase

Al terminar esta clase debería quedar claro cómo vamos a organizar internamente cada microservicio de NovaMarket.

Y, además, cada servicio debería tener una estructura base parecida a esta:

```txt
src/main/java/com/novamarket/<servicio>/
  <Servicio>Application.java
  controller/
  service/
  repository/
  model/
  dto/
  config/
```

No hace falta que todos los paquetes tengan clases todavía, pero sí que la organización esté definida.

---

## Punto de control

Antes de seguir, verificá que:

- cada servicio tiene un paquete raíz claro,
- la clase principal está dentro de ese paquete raíz,
- la estructura base de subpaquetes está definida,
- los tres servicios siguen arrancando,
- y ya no hay dudas sobre dónde va a vivir cada tipo de clase a partir de ahora.

Si eso está listo, ya podemos empezar con el verdadero flujo funcional del sistema.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a dar el primer paso funcional concreto sobre el dominio:

**crear el modelo de producto en `catalog-service`**

Ahí empieza de verdad la construcción del negocio de NovaMarket.

---

## Cierre

En esta clase dejamos definida la estructura interna base de los tres primeros microservicios del proyecto.

Puede parecer una preparación silenciosa, pero en realidad es una de las decisiones que más va a impactar en la claridad del curso práctico.

Ahora sí, con el workspace listo, los servicios creados, la configuración mínima alineada y la estructura interna ordenada, NovaMarket está preparado para empezar a construir funcionalidad real.
