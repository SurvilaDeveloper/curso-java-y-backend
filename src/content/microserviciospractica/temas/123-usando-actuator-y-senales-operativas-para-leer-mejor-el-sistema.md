---
title: "Usando Actuator y señales operativas para leer mejor el sistema"
description: "Primer paso concreto de la observabilidad operativa en Kubernetes. Uso de Actuator y señales básicas del sistema para interpretar mejor NovaMarket dentro del cluster."
order: 123
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Usando Actuator y señales operativas para leer mejor el sistema

En la clase anterior abrimos una nueva etapa importante del bloque:

- entendimos por qué la observabilidad operativa ya tenía sentido,
- y dejamos claro que el cluster ya es lo suficientemente rico como para que empecemos a leer mejor el estado del sistema, incluso antes de caer en troubleshooting fuerte.

Ahora toca el paso concreto:

**usar Actuator y señales operativas básicas para leer mejor NovaMarket dentro del cluster.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- instalada una forma básica de lectura operativa apoyada en Actuator,
- más claro qué señales ya expone el sistema y cómo interpretarlas,
- y preparada una base muy útil para entender mejor el estado general de NovaMarket dentro de Kubernetes.

Todavía no vamos a montar una plataforma enorme de monitoreo.  
La meta de hoy es mucho más concreta: **aprender a leer mejor lo que el sistema ya nos muestra**.

---

## Estado de partida

Partimos de un entorno donde ya existe una reconstrucción bastante rica del sistema y donde varias piezas ya cuentan con una base importante de señales operativas gracias a Spring Boot Actuator.

Eso significa que no estamos empezando de cero.

En realidad, esta etapa del bloque consiste en aprovechar mejor algo que ya construimos antes, pero que ahora pasa a tener todavía más valor dentro del cluster.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir una o más piezas importantes del sistema,
- revisar señales operativas útiles expuestas por Actuator,
- relacionarlas con el estado que ya vemos desde Kubernetes,
- y dejar un patrón básico de lectura mucho más rico que el del troubleshooting puramente reactivo.

---

## Qué problema queremos resolver exactamente

Queremos dejar atrás una lectura demasiado binaria del entorno, del tipo:

- el Pod existe o no existe
- está listo o no está listo
- anda o no anda

Eso sigue siendo importante, pero ya empieza a quedar corto.

Ahora queremos sumar otra capa de lectura, por ejemplo:

- qué expone la propia aplicación sobre su estado
- cómo se ve esa información dentro del entorno
- y qué nos aporta para entender mejor el sistema sin esperar a que falle fuerte

Ese cambio es justamente el centro de esta clase.

---

## Paso 1 · Elegir una pieza representativa del sistema

Para esta etapa del curso, conviene elegir una pieza importante y fácil de justificar, por ejemplo:

- `api-gateway`
- `order-service`
- o `notification-service`

La idea es trabajar con algo real, relevante y suficientemente rico como para que esta nueva lectura tenga sentido práctico.

---

## Paso 2 · Empezar por health

Un muy buen punto de partida sigue siendo:

```txt
/actuator/health
```

¿Por qué empezar por ahí?

Porque ese endpoint ya venía siendo útil para probes y salud operativa, pero ahora lo queremos leer con otro enfoque:

- no solo como criterio para Kubernetes,
- sino también como una señal operativa útil para nosotros

Ese pequeño cambio de mirada ya aporta bastante valor.

---

## Paso 3 · Entender qué mirar dentro de health

No se trata solo de ver si dice “UP”.

Conviene empezar a mirar algo más fino, por ejemplo:

- si responde consistentemente
- si refleja el estado general esperado del servicio
- y si lo que vemos ahí tiene sentido respecto del rol de esa pieza dentro del sistema

La idea es dejar de usarlo solo como una bandera mínima y empezar a tratarlo como una señal útil del entorno.

---

## Paso 4 · Sumar otras señales básicas si están disponibles

Según cómo venga configurado el proyecto, este es un buen momento para mirar también otras señales expuestas por Actuator, por ejemplo:

- info
- métricas básicas
- o cualquier otra salida sencilla que el servicio ya tenga disponible

No hace falta abrir una lista infinita.

La meta es empezar a enriquecer la lectura del sistema con señales que ya existen y que podemos usar mejor.

---

## Paso 5 · Relacionar esas señales con lo que ve Kubernetes

Este punto es muy importante.

No queremos leer Actuator como si viviera aislado del cluster.

Lo valioso es cruzar ambas miradas:

- lo que dice la aplicación
- y lo que está viendo Kubernetes sobre esa misma pieza

Por ejemplo:

- si la app expone buena salud
- y el Pod además está listo
- y no hay eventos raros
- entonces la lectura del entorno gana mucha más fuerza

Esa combinación es una de las claves de esta etapa.

---

## Paso 6 · Entender por qué esto mejora el troubleshooting

A esta altura del bloque ya conviene fijar algo muy claro:

la observabilidad operativa no reemplaza al troubleshooting.  
Lo mejora muchísimo.

Porque cuando aparece un problema real, ya no arrancamos completamente a ciegas.  
Tenemos una lectura más rica del sistema para construir mejores hipótesis.

Ese encastre es una de las razones más fuertes por las que este tema aparece ahora dentro del roadmap.

---

## Paso 7 · Construir una lectura más continua del servicio

Después de esta clase, la idea no es quedarnos solo con:

- “si falla, miro”

La idea es empezar a desarrollar algo más útil:

- “sé leer un poco mejor cómo está esta pieza incluso antes de que falle fuerte”

Ese cambio puede parecer pequeño, pero en la práctica eleva bastante el nivel con el que trabajamos dentro del cluster.

---

## Paso 8 · Pensar qué piezas del sistema se beneficiarían más de esta lectura

A partir de esta clase, ya debería quedar claro que esta forma de observación puede aportar bastante valor en piezas como:

- `api-gateway`
- `order-service`
- `notification-service`
- `config-server`
- `discovery-server`

No hace falta profundizar todo hoy.

Lo importante es instalar bien el criterio y mostrar que la lectura del sistema ya puede ser más rica que una simple reacción ante fallos.

---

## Paso 9 · Entender qué todavía no estamos haciendo

Conviene dejarlo claro.

En esta etapa todavía no estamos:

- construyendo una plataforma completa de métricas
- ni montando dashboards avanzados
- ni agotando todas las posibilidades de observabilidad

La meta actual es mucho más concreta:

**aprender a usar mejor señales básicas y ya disponibles para leer el sistema con más criterio.**

Eso ya aporta muchísimo valor práctico.

---

## Qué estamos logrando con esta clase

Esta clase instala una primera forma de observabilidad operativa muy útil dentro del bloque de Kubernetes.

Ya no estamos solo esperando problemas para diagnosticar.  
Ahora también empezamos a mirar mejor el estado del sistema mientras funciona.

Eso es un salto importante de madurez.

---

## Qué todavía no hicimos

Todavía no:

- consolidamos esta nueva lectura operativa como checkpoint del bloque
- ni la integramos todavía como una capacidad estable del entorno

Todo eso viene en la próxima clase.

La meta de hoy es mucho más concreta:

**aprender a usar Actuator y señales operativas básicas para leer mejor el sistema.**

---

## Errores comunes en esta etapa

### 1. Quedarse solo con “UP” y no leer nada más
La idea es desarrollar una observación un poco más rica.

### 2. Tratar Actuator como si viviera aislado del cluster
Lo valioso aparece cuando cruzamos ambas miradas.

### 3. Creer que esto solo sirve cuando hay problemas
También sirve muchísimo para entender mejor el sistema en estado normal.

### 4. Esperar una plataforma enorme antes de empezar
Para este curso, lo básico bien leído ya aporta muchísimo.

### 5. Confundir esta etapa con troubleshooting puro
Se relacionan, pero no son exactamente lo mismo.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener una forma bastante más rica de leer el estado de una pieza importante de NovaMarket dentro del cluster apoyándote en Actuator y en señales operativas básicas.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- ya no mirás health solo como una bandera mínima,
- entendés el valor de combinar señales de la aplicación con señales del cluster,
- sentís que podés leer mejor una pieza importante del sistema,
- y ves por qué esto mejora mucho todo lo que venga después.

Si eso está bien, ya podemos consolidar esta nueva etapa del bloque.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a consolidar esta lectura operativa más rica de NovaMarket dentro de Kubernetes y dejarla integrada al resto de refinamientos del entorno.

---

## Cierre

En esta clase usamos Actuator y señales operativas básicas para leer mejor el sistema.

Con eso, NovaMarket ya no solo vive, escala y se deja diagnosticar mejor dentro del cluster: también empieza a ser un entorno que sabemos observar de una forma más rica y más continua, incluso antes de entrar en troubleshooting fuerte.
