---
title: "Comparando rutas explícitas y discovery locator en api-gateway"
description: "Comparación de dos estrategias de ruteo en Spring Cloud Gateway dentro de NovaMarket: rutas explícitas definidas manualmente y discovery locator basado en Eureka."
order: 41
module: "Módulo 6 · API Gateway"
level: "intermedio"
draft: false
---

# Comparando rutas explícitas y discovery locator en `api-gateway`

En las clases anteriores hicimos algo muy importante:

- configuramos rutas reales del gateway con `lb://`,
- levantamos múltiples instancias reales de `inventory-service`,
- y comprobamos que el tráfico ya puede repartirse entre ellas.

Eso ya dejó a NovaMarket en un punto bastante serio.

Pero ahora aparece una pregunta natural sobre el gateway:

**¿siempre conviene definir rutas explícitas a mano o también podríamos apoyarnos más directamente en Eureka para que el gateway descubra servicios?**

Ese es el terreno de esta clase.

Porque en Spring Cloud Gateway suele aparecer otra posibilidad además de las rutas manuales:

**discovery locator.**

Y conviene entender bien qué aporta, qué simplifica y qué costo tiene.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- clara la diferencia entre rutas explícitas y discovery locator,
- entendido qué ventajas da cada enfoque,
- mucho más claro cuál conviene usar en NovaMarket en este punto del curso,
- y preparado el criterio para no convertir el gateway en una caja negra innecesaria.

No vamos a reemplazar todavía todo lo que ya hicimos.  
La meta de hoy es comparar con criterio.

---

## Estado de partida

En este punto ya tenemos en `api-gateway` rutas explícitas como:

- `/catalog/**` → `lb://catalog-service`
- `/inventory/**` → `lb://inventory-service`
- `/order-api/**` → `lb://order-service`

Ese enfoque ya nos dio varias ventajas:

- el sistema enruta bien,
- los paths públicos están bien pensados,
- y el consumidor no depende de los puertos internos.

Eso significa que ya tenemos una solución funcional y bastante buena.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué es discovery locator,
- compararlo con el enfoque actual de rutas manuales,
- entender cómo afectaría a la claridad del gateway,
- y decidir cuál tiene más sentido sostener en NovaMarket en esta etapa.

---

## Qué son las rutas explícitas

El modelo actual de NovaMarket es este:

- vos definís manualmente cada ruta,
- decidís el path público,
- decidís a qué servicio lógico apunta,
- y si hace falta aplicás filtros como `StripPrefix`.

Por ejemplo, una ruta explícita puede decir:

- todo lo que entre por `/catalog/**`
- va a `lb://catalog-service`

Este enfoque tiene una gran ventaja:

**la intención del gateway queda muy visible.**

---

## Qué es discovery locator

Discovery locator es una forma de decirle al gateway:

- “si un servicio aparece en Eureka, generá automáticamente una ruta para él”

En vez de definir una a una las rutas, el gateway puede apoyarse en discovery y crear rutas automáticamente a partir de los nombres lógicos registrados.

Eso suena muy atractivo porque reduce configuración manual.

Pero también cambia bastante cómo se ve y cómo se entiende la entrada al sistema.

---

## Cómo se vería conceptualmente discovery locator

La idea general es esta:

- Eureka registra `catalog-service`
- Eureka registra `inventory-service`
- Eureka registra `order-service`
- el gateway detecta esos servicios
- y genera rutas automáticamente a partir de ellos

En una configuración típica, esto suele implicar que el path público queda mucho más atado al nombre del servicio.

Por ejemplo, algo del estilo:

```txt
/catalog-service/**
/inventory-service/**
/order-service/**
```

o una variante equivalente según la configuración exacta.

---

## Ventajas de discovery locator

Este enfoque tiene ventajas reales:

### 1. Menos configuración manual
No hace falta declarar una por una las rutas.

### 2. Más rapidez para prototipar
Si aparece un servicio nuevo registrado, el gateway puede exponerlo más rápido.

### 3. Muy útil para pruebas o entornos exploratorios
Cuando querés descubrir rápido qué servicios existen, puede ser cómodo.

Eso lo vuelve una herramienta interesante y totalmente válida.

---

## Límites de discovery locator

Pero también tiene costos claros:

### 1. Menos control sobre el path público
El diseño de entrada queda mucho más atado al nombre técnico del servicio.

### 2. Más acoplamiento entre nombres internos y exposición externa
Eso no siempre es deseable.

### 3. Menos intención visible en el gateway
Con rutas explícitas se ve claramente qué exponés y cómo.  
Con discovery locator, parte de esa intención se vuelve más implícita.

### 4. Puede exponer más de lo que querés si no se usa con cuidado
Y eso, pedagógica y arquitectónicamente, importa bastante.

---

## Qué gana NovaMarket con rutas explícitas

Este punto importa muchísimo.

En el estado actual del curso, NovaMarket gana bastante con rutas explícitas porque:

- el alumno entiende mejor qué path entra al sistema,
- el gateway deja más visible la intención de diseño,
- el curso puede explicar con claridad cómo un path público se traduce a un servicio interno,
- y se mantiene más control sobre qué parte del sistema se expone y bajo qué forma.

Eso tiene muchísimo valor didáctico y también arquitectónico.

---

## Qué podría aportar discovery locator en NovaMarket

Eso no significa que discovery locator no sirva para nada.

Al contrario: puede ser muy útil como tema del curso para mostrar que el gateway también puede apoyarse más directamente en Eureka.

Pero, en este punto del proyecto, probablemente convenga tratarlo como:

- una alternativa válida,
- una herramienta útil,
- pero no necesariamente como el enfoque principal de NovaMarket.

Ese matiz es muy sano.

---

## Paso 1 · Entender cómo se habilitaría conceptualmente

Sin meternos todavía a cambiar todo, el discovery locator suele habilitarse con una configuración conceptual del tipo:

```yaml
spring:
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true
```

Y a partir de ahí el gateway puede empezar a generar rutas basadas en los servicios registrados.

No hace falta todavía aplicarlo de forma definitiva.  
Lo importante es entender qué clase de comportamiento introduce.

---

## Paso 2 · Compararlo con una ruta explícita real del proyecto

Tomemos esta idea:

### Ruta explícita actual
```txt
/catalog/products
```

### Ruta interna resultante
```txt
/products
```

Eso está muy bien diseñado para el consumidor.

Con discovery locator, en cambio, lo más natural suele parecerse más a algo como:

```txt
/catalog-service/products
```

Eso funciona, pero deja el acceso público más acoplado al nombre técnico interno.

Y esa diferencia, aunque parezca chica, importa muchísimo.

---

## Paso 3 · Pensar qué conviene priorizar en este curso

En un curso como este, donde queremos que el alumno entienda arquitectura y no solo haga que “ande”, suele convenir bastante más:

- sostener rutas explícitas como base principal,
- y mostrar discovery locator como una alternativa interesante.

¿Por qué?

Porque las rutas explícitas obligan a pensar:

- qué querés exponer,
- bajo qué path,
- y cómo querés modelar la entrada al sistema.

Eso mejora mucho la calidad del diseño y del aprendizaje.

---

## Paso 4 · Entender cuándo discovery locator sería especialmente útil

Discovery locator brilla más en escenarios como:

- entornos de exploración,
- demos rápidas,
- plataformas internas,
- o situaciones donde querés sumar servicios sin escribir tanta configuración manual.

En cambio, cuando querés un gateway más pensado y más limpio hacia el exterior, las rutas explícitas suelen dar una mejor base.

Ese criterio es justamente el que conviene instalar acá.

---

## Qué estamos logrando con esta clase

Esta clase no solo agrega una alternativa técnica.  
También mejora el criterio con el que pensamos el gateway.

Ya no estamos en el nivel de:

- “hay una sola forma de enrutar”

Ahora estamos en uno bastante mejor:

- “hay más de una forma, pero no todas sirven igual para lo que queremos construir en NovaMarket”

Eso es un salto de madurez importante.

---

## Qué todavía no hicimos

Todavía no:

- revisamos el bloque de errores comunes más frecuentes,
- ni cerramos este subtramo rehecho del gateway con un checkpoint fuerte.

Todo eso viene enseguida.

La meta de hoy es mucho más concreta:

**comparar rutas explícitas y discovery locator para decidir con criterio qué enfoque conviene sostener en NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Pensar que menos configuración manual siempre significa mejor arquitectura
No necesariamente.

### 2. Confundir automatización con claridad
Discovery locator puede simplificar, pero también volver más implícita la exposición.

### 3. No distinguir entre gateway interno y gateway pensado hacia consumidores reales
El criterio cambia bastante según el caso.

### 4. Reemplazar rutas explícitas demasiado pronto
En este curso, probablemente convenga sostenerlas como base principal.

### 5. Pensar que discovery locator “compite” con Eureka
No. Se apoya en él; simplemente lo usa de otra manera dentro del gateway.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías entender bastante mejor:

- qué es discovery locator,
- qué ventajas reales tiene,
- qué límites introduce,
- y por qué en NovaMarket sigue teniendo más sentido sostener rutas explícitas como enfoque principal en esta etapa.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué hace discovery locator,
- distinguís ese enfoque del que ya estamos usando,
- ves por qué las rutas explícitas siguen siendo más convenientes en NovaMarket,
- y sentís que el gateway ya no es una simple herramienta, sino una pieza de diseño más consciente.

Si eso está bien, ya podemos pasar al siguiente tema y cerrar este tramo con los errores frecuentes que más conviene saber detectar.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a revisar los errores más comunes de Gateway + Eureka + LoadBalancer en NovaMarket y a dejar un checkpoint fuerte para consolidar este bloque rehecho.

---

## Cierre

En esta clase comparamos rutas explícitas y discovery locator en `api-gateway`.

Con eso, NovaMarket gana una lectura mucho más madura del gateway: no solo como pieza que enruta, sino como componente donde también se decide con bastante criterio cómo exponer y ordenar la entrada al sistema.
