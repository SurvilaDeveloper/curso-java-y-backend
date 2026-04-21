---
title: "Distinguiendo filtros globales y filtros por ruta en api-gateway"
description: "Segundo tema del nuevo tramo del módulo 6. Diferencia entre filtros globales y filtros por ruta dentro de Spring Cloud Gateway y criterio para usarlos en NovaMarket."
order: 46
module: "Módulo 6 · API Gateway"
level: "intermedio"
draft: false
---

# Distinguiendo filtros globales y filtros por ruta en `api-gateway`

En la clase anterior dimos un paso muy importante dentro del nuevo tramo del gateway:

- aplicamos un primer filtro global simple,
- dejamos una huella visible del paso de las requests por `api-gateway`,
- y además NovaMarket ya empezó a tratar al gateway no solo como un enroutador, sino también como una pieza activa del borde del sistema.

Eso ya tiene muchísimo valor.

Pero ahora aparece una pregunta muy natural:

**si ya tenemos un filtro global, cuándo conviene usar un filtro global y cuándo conviene aplicar uno solo a una ruta específica?**

Ese es el terreno de esta clase.

Porque una cosa es tener comportamiento transversal para todo lo que pasa por el gateway.  
Y otra bastante distinta es querer aplicar algo solo a:

- catálogo,
- inventario,
- órdenes,
- o alguna ruta específica del sistema.

Ese matiz es exactamente el que vamos a ordenar hoy.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar claro:

- qué diferencia hay entre un filtro global y un filtro por ruta,
- qué ventajas tiene cada enfoque,
- qué tipo de problemas conviene resolver con uno u otro,
- y cómo decidir con más criterio qué clase de filtro tiene más sentido en NovaMarket según el caso.

Todavía no vamos a construir algo complejo.  
La meta de hoy es fijar el mapa correcto antes de seguir agregando comportamiento al gateway.

---

## Estado de partida

En este punto ya tenemos:

- `api-gateway` enroutando correctamente,
- rutas reales hacia `catalog-service`, `inventory-service` y `order-service`,
- un primer filtro global simple que deja una huella visible,
- y un gateway que ya no solo enruta, sino que también procesa tráfico.

Eso significa que ya no estamos en el nivel de “¿se puede filtrar?”.  
Ahora estamos en un nivel bastante mejor:

- **¿qué conviene filtrar globalmente y qué conviene filtrar solo en rutas puntuales?**

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué significa que un filtro sea global,
- revisar qué significa que un filtro esté pegado a una ruta,
- comparar ambos modelos con ejemplos concretos de NovaMarket,
- y dejar instalado un criterio claro para las próximas clases.

---

## Qué problema queremos resolver exactamente

Queremos evitar dos errores muy comunes:

### Error 1
Hacer todo global solo porque “es más fácil”.

### Error 2
Hacer todo por ruta y perder la idea de comportamiento transversal del gateway.

En lugar de eso, queremos una lectura más sana:

- algunas cosas tienen sentido para todas las requests,
- y otras tienen sentido solo para ciertos caminos del sistema.

Ese equilibrio es el corazón de esta clase.

---

## Qué es un filtro global

Un filtro global, dentro del gateway, es una pieza que participa en **todas** las requests que atraviesan el punto de entrada del sistema.

Eso significa que si el tráfico entra por:

- `/catalog/...`
- `/inventory/...`
- `/order-api/...`

el filtro global va a intervenir igual.

Es una muy buena herramienta para comportamiento transversal.

---

## Qué tipo de problemas encajan bien en un filtro global

Un filtro global suele encajar muy bien cuando queremos hacer cosas como:

- dejar una marca general del paso por el gateway,
- registrar método y path,
- agregar un header común a todas las responses,
- iniciar una traza,
- o aplicar una observación uniforme a todo el tráfico.

En otras palabras:

**si el comportamiento debería valer para casi todo lo que entra al gateway, probablemente tenga sentido pensarlo como global.**

---

## Qué es un filtro por ruta

Un filtro por ruta, en cambio, no vive como pieza transversal para todo el sistema.

Vive asociado a una ruta concreta definida en la configuración del gateway.

Eso significa que puede aplicarse solo a requests que matchean, por ejemplo:

- `/catalog/**`
- o `/order-api/**`

y no necesariamente a las demás.

Este enfoque es muchísimo más puntual.

---

## Qué tipo de problemas encajan bien en un filtro por ruta

Un filtro por ruta suele encajar mejor cuando queremos hacer algo como:

- agregar un header solo en respuestas de catálogo,
- reescribir comportamiento solo para órdenes,
- ajustar algún detalle de path en una sola ruta,
- o dejar una marca especial en un tramo específico del sistema.

En otras palabras:

**si el comportamiento no debería afectar a todo el gateway, probablemente convenga atarlo a una ruta concreta.**

---

## Qué diferencia conceptual hay entre ambos

Esta distinción puede resumirse así:

### Filtro global
Piensa en:
- “todo request que entra al gateway”

### Filtro por ruta
Piensa en:
- “todo request que entra por esta ruta particular”

Ese cambio de escala es justamente lo que importa entender.

---

## Cómo se ve esto en NovaMarket

En el estado actual del proyecto, algunos ejemplos bastante naturales serían estos:

### Global
- dejar el header `X-NovaMarket-Gateway`
- registrar un log básico
- agregar una marca común del paso por el gateway

### Por ruta
- agregar un header especial solo en `/order-api/**`
- aplicar algo visible solo en catálogo
- transformar o enriquecer comportamiento solo en inventario

Eso vuelve muchísimo más concreta la diferencia.

---

## Por qué conviene empezar por filtros globales

Pedagógicamente, tiene mucho sentido que el primer filtro haya sido global.

¿Por qué?

Porque eso deja clarísimo algo fundamental:

- el gateway ya puede intervenir sobre todo el tráfico

Ese aprendizaje tiene muchísimo valor porque instala la capacidad transversal del sistema.

Después de eso, ya sí tiene sentido bajar un nivel y decir:

- ahora veamos cómo hacer algo más puntual, solo para una ruta concreta

Ese orden es muy sano.

---

## Por qué conviene sumar ahora filtros por ruta

Una vez que el gateway ya mostró su capacidad transversal, aparece otra necesidad:

- no todo comportamiento debería afectar a todo el sistema

Y ese matiz importa mucho.

Porque si todo se hace global, el gateway puede volverse demasiado invasivo o demasiado opaco.

Los filtros por ruta permiten algo más fino:

- mantener control,
- dejar más clara la intención,
- y aplicar comportamiento solo donde realmente tiene sentido.

Ese es exactamente el siguiente salto de madurez del módulo.

---

## Qué gana NovaMarket al distinguir bien estas dos capas

Entender esta diferencia tiene muchísimo valor porque ayuda a pensar el gateway con bastante más criterio.

En vez de ver una sola “caja de filtros”, ahora podemos pensar en dos niveles:

### Nivel 1 · comportamiento transversal
Lo que conviene aplicar a todo request

### Nivel 2 · comportamiento específico
Lo que conviene aplicar solo a algunos caminos del sistema

Ese modelo mental hace muchísimo más ordenado todo lo que viene después.

---

## Qué todavía no estamos haciendo en esta clase

Todavía no vamos a:

- diseñar una estrategia completa de filtros,
- resolver seguridad por ruta,
- ni aplicar un bloque muy sofisticado de transformación del tráfico.

La meta actual es mucho más concreta:

**entender con claridad la diferencia entre filtros globales y filtros por ruta.**

Eso ya aporta muchísimo valor.

---

## Qué estamos logrando con esta clase

Esta clase ordena el mapa mental del bloque de filtros.

Ya no solo sabemos que el gateway puede intervenir en requests y responses.  
Ahora también sabemos que esa intervención puede ocurrir en dos escalas distintas: global y específica por ruta.

Eso mejora muchísimo el criterio arquitectónico del módulo.

---

## Qué todavía no hicimos

Todavía no:

- aplicamos un filtro por ruta concreto y visible,
- ni validamos qué cambia cuando el comportamiento deja de ser global y pasa a estar atado a una sola parte del sistema.

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**dejar bien fijada la diferencia entre filtros globales y filtros por ruta dentro de NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Pensar que global siempre es mejor
No. A veces solo querés tocar una parte específica del sistema.

### 2. Pensar que por ruta siempre es más seguro o más limpio
No necesariamente; puede duplicar comportamiento que debería ser transversal.

### 3. No distinguir entre comportamiento común y comportamiento local
Esa diferencia es central.

### 4. Querer decidir todo de una sola vez
Conviene entender primero el mapa y después aplicar el criterio.

### 5. No relacionar la decisión con el diseño del sistema
La elección entre global y por ruta no es caprichosa; depende del problema que querés resolver.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder decir con claridad:

- qué es un filtro global,
- qué es un filtro por ruta,
- para qué tipo de problemas conviene usar cada uno,
- y por qué NovaMarket ya está listo para empezar a usar ambos con criterio.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué comportamiento del gateway ya es global,
- distinguís lo que tendría sentido aplicar solo a una ruta,
- ves que no todo filtro tiene que ser transversal,
- y sentís que el módulo ya está listo para un primer ejemplo concreto de filtro por ruta.

Si eso está bien, ya podemos pasar al siguiente tema y aplicar un filtro específico sobre una parte concreta de NovaMarket.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a aplicar un primer filtro por ruta, visible y simple, sobre una parte específica del gateway para mostrar con claridad cómo cambia el comportamiento cuando la lógica ya no es transversal a todo el sistema.

---

## Cierre

En esta clase distinguimos filtros globales y filtros por ruta en `api-gateway`.

Con eso, NovaMarket gana una lectura mucho más madura del gateway: no solo como punto de entrada que puede intervenir en el tráfico, sino como pieza capaz de hacerlo en diferentes escalas según el tipo de necesidad arquitectónica.
