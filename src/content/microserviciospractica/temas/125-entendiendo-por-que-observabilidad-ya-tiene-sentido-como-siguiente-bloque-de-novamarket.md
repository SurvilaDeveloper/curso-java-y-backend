---
title: "Entendiendo por qué observabilidad ya tiene sentido como siguiente bloque de NovaMarket"
description: "Inicio del siguiente gran bloque del curso rehecho. Comprensión de por qué, después de consolidar infraestructura, seguridad y resiliencia, ya conviene abrir observabilidad en NovaMarket."
order: 125
module: "Módulo 12 · Observabilidad"
level: "intermedio"
draft: false
---

# Entendiendo por qué observabilidad ya tiene sentido como siguiente bloque de NovaMarket

En la clase anterior cerramos un bloque muy importante del curso rehecho:

- NovaMarket ya tiene un entorno multicontenedor serio,
- ya tiene gateway fuerte,
- ya tiene seguridad real con Keycloak,
- y además ya cuenta con una primera capa fuerte de resiliencia aplicada sobre flujos críticos entre servicios.

Eso ya tiene muchísimo valor.

Pero ahora aparece una pregunta muy natural:

**si el sistema ya es bastante más serio, más distribuido y más capaz de degradarse o protegerse, cómo sabemos con claridad qué está pasando cuando una request atraviesa varias piezas del sistema?**

Ese es el terreno de esta clase.

Porque una cosa es tener:

- infraestructura,
- seguridad,
- resiliencia,
- y servicios conectados.

Y otra bastante distinta es poder observar:

- por dónde pasó una request,
- dónde tardó,
- dónde falló,
- qué servicio respondió,
- y cómo se relacionan entre sí todos esos eventos dentro del sistema.

Ese es exactamente el siguiente gran problema que conviene abrir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- claro por qué observabilidad ya tiene sentido en este punto del proyecto,
- entendida la diferencia entre “el sistema existe” y “el sistema se puede entender cuando corre”,
- alineado el modelo mental para introducir trazabilidad, correlación y visión más rica de requests distribuidas,
- y preparado el terreno para empezar por una primera capa de observabilidad útil en la próxima clase.

Todavía no vamos a instalar todas las herramientas del bloque.  
La meta de hoy es entender por qué observabilidad aparece exactamente ahora como siguiente gran frente natural.

---

## Estado de partida

Partimos de un sistema donde ya:

- Compose integra varios componentes,
- el gateway enruta tráfico real,
- la seguridad ya está bastante madura,
- y la resiliencia ya introdujo reacciones más sofisticadas frente a fallos y degradación.

Eso significa que el problema ya no es solo:

- “cómo levantar el sistema”
- o
- “cómo protegerlo”
- o
- “cómo hacerlo tolerar mejor ciertos fallos”

Ahora empieza a importar otra pregunta:

- **cómo entendemos lo que está ocurriendo adentro del sistema mientras una request atraviesa sus piezas**

Y esa pregunta cambia muchísimo el nivel del proyecto.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar por qué la observabilidad aparece naturalmente después del bloque de resiliencia,
- entender qué tipo de problemas resuelve,
- conectar esta idea con todo lo que ya construimos antes,
- y dejar clara la lógica del siguiente gran bloque del roadmap rehecho.

---

## Qué problema queremos resolver exactamente

Hasta ahora ya logramos algo importante:

- el sistema ya funciona, se protege y se degrada de una forma bastante más madura.

Eso fue un gran salto.

Pero a medida que el proyecto crece, aparece otra necesidad muy concreta:

**que el comportamiento distribuido del sistema deje de ser una caja negra.**

Porque ahora conviene hacerse preguntas como:

- ¿por qué esta request tardó tanto?
- ¿pasó por gateway, por orders y por inventory?
- ¿dónde se quedó más tiempo?
- ¿qué pasó cuando se activó timeout?
- ¿cuándo intervino el breaker?
- ¿cómo relaciono logs de distintos servicios con la misma operación?

Ese cambio de enfoque es justamente el corazón de esta etapa.

---

## Qué significa observabilidad en este contexto

Para esta etapa del curso, una forma útil de pensarlo es esta:

**observabilidad es la capacidad de entender qué está ocurriendo dentro del sistema a partir de las señales que emite mientras corre.**

Esa idea es central.

No se trata solo de tener logs sueltos.  
Se trata de poder reconstruir el comportamiento del sistema con señales útiles y conectadas.

Eso suele apoyarse en cosas como:

- trazabilidad,
- correlación entre requests,
- métricas,
- y más adelante herramientas dedicadas para ver recorridos y tiempos.

Pero hoy no hace falta abrir todo de golpe.  
Lo importante es entender por qué este frente ya es necesario.

---

## Por qué este bloque aparece justo después de resiliencia

Esto también importa mucho.

Si todavía no tuviéramos:

- varios servicios reales,
- gateway,
- seguridad,
- y resiliencia aplicada,

observabilidad sería bastante prematura o quedaría demasiado artificial.

Pero ahora el sistema ya tiene suficiente complejidad como para que empiece a doler no poder ver claramente:

- cómo fluyen las requests,
- qué pasó en cada tramo,
- y cómo se relacionan entre sí los eventos de distintas piezas.

Ese orden es muy sano.

---

## Qué gana NovaMarket con observabilidad

Aunque todavía no apliquemos herramientas concretas en esta clase, el valor ya se puede ver con claridad.

A partir de observabilidad, NovaMarket puede empezar a ganar cosas como:

- mejor lectura de recorridos de requests,
- mayor claridad sobre dónde aparece la lentitud,
- mejor diagnóstico de fallos distribuidos,
- y una base mucho más fuerte para operar y entender un sistema que ya no es simple ni local.

Eso vuelve al proyecto muchísimo más maduro desde el punto de vista arquitectónico y operativo.

---

## Por qué no alcanza con “mirar logs” a secas

Este punto vale muchísimo.

Cuando alguien empieza a crecer con microservicios, es muy tentador pensar:

- “bueno, si algo falla miro logs”

Pero a esta altura del curso eso ya empieza a quedarse corto.

¿Por qué?

Porque los eventos de una misma request pueden estar repartidos entre:

- gateway,
- order-service,
- inventory-service,
- y más adelante otras piezas

y si no existe una forma de relacionarlos, el sistema empieza a volverse difícil de entender incluso cuando sí genera información.

Ese matiz es justamente uno de los grandes motores del bloque.

---

## Qué primer paso de observabilidad conviene abrir

A esta altura del curso, antes de saltar a herramientas más grandes, suele tener muchísimo sentido empezar por algo como:

- trazabilidad básica
- o
- correlación simple entre requests y logs

¿Por qué?

Porque eso ya deja visible algo muy importante:

- una misma operación puede recorrer varias piezas del sistema
- y necesitamos una forma de seguirle el hilo

Ese criterio mejora muchísimo la progresión del bloque.

---

## Qué todavía no estamos haciendo en esta etapa

Conviene dejar esto muy claro.

En este punto todavía no estamos:

- instalando todavía Zipkin,
- ni configurando aún trazas distribuidas completas,
- ni agregando todavía métricas o dashboards.

La meta actual es mucho más concreta:

**abrir correctamente el bloque de observabilidad como siguiente gran frente natural de NovaMarket.**

Y eso ya aporta muchísimo valor.

---

## Qué estamos logrando con esta clase

Esta clase no agrega todavía una herramienta concreta, pero hace algo muy importante:

**abre explícitamente el siguiente gran bloque del curso rehecho: hacer visible y comprensible el comportamiento distribuido del sistema que ya venimos construyendo.**

Eso importa muchísimo, porque NovaMarket deja de madurar solo desde infraestructura, seguridad y resiliencia y empieza a prepararse para otra mejora clave: poder entender con claridad qué está pasando cuando el sistema corre de verdad.

---

## Qué todavía no hicimos

Todavía no:

- elegimos todavía la primera técnica concreta del bloque,
- ni aplicamos todavía trazabilidad básica al sistema.

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender por qué observabilidad ya tiene sentido como siguiente gran bloque de NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Pensar que observabilidad puede esperar mucho más
Después de seguridad y resiliencia, ya empieza a ser bastante necesaria.

### 2. Reducir observabilidad a “tener logs”
Eso se queda corto en un sistema distribuido.

### 3. Querer saltar directamente a una herramienta grande sin una base conceptual clara
Conviene abrir el bloque con un problema real.

### 4. Suponer que si el sistema ya funciona, entenderlo no es tan importante
Cuanto más distribuido se vuelve, más importa poder leerlo bien.

### 5. No ver el valor del cambio
Este bloque hace muchísimo más operable y entendible a NovaMarket.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener claro por qué observabilidad ya tiene sentido como siguiente gran bloque de NovaMarket y por qué este paso aparece ahora como evolución natural del sistema después de infraestructura, seguridad y resiliencia.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés por qué el sistema ya necesita poder observarse mejor,
- ves que seguridad y resiliencia no alcanzan por sí solas para entender qué está pasando,
- entendés qué problema nuevo abre este bloque,
- y sentís que el proyecto ya está listo para empezar con una primera capa concreta de observabilidad.

Si eso está bien, ya podemos pasar al siguiente tema y construir la primera capa útil de trazabilidad básica en NovaMarket.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a introducir una primera capa de correlation/request id para poder seguir una misma request entre gateway y servicios y empezar a leer mejor el comportamiento distribuido de NovaMarket.

---

## Cierre

En esta clase entendimos por qué observabilidad ya tiene sentido como siguiente bloque de NovaMarket.

Con eso, el proyecto deja de madurar solo desde infraestructura, seguridad y resiliencia y empieza a prepararse para otra mejora muy valiosa: que el sistema ya no solo exista y se proteja mejor, sino que también pueda entenderse con mucha más claridad cuando corre de verdad.
