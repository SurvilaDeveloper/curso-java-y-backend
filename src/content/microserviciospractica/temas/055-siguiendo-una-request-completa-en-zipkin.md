---
title: "Siguiendo una request completa en Zipkin"
description: "Cierre del tramo de trazas distribuidas en NovaMarket. Análisis de una request completa atravesando gateway, order-service e inventory-service dentro de Zipkin."
order: 55
module: "Módulo 9 · Observabilidad de punta a punta"
level: "intermedio"
draft: false
---

# Siguiendo una request completa en Zipkin

En la clase anterior dejamos una pieza muy importante funcionando:

- los servicios principales ya exportan trazas,
- Zipkin ya está arriba,
- y la UI ya debería mostrar actividad real de NovaMarket.

Ahora toca el paso que más valor práctico suele tener dentro del módulo:

**seguir una request completa de punta a punta.**

Porque una cosa es saber que las trazas “existen”.  
Y otra mucho más útil es poder abrir Zipkin y entender:

- por dónde pasó una request,
- qué servicios tocó,
- cuánto tardó cada tramo,
- y dónde convendría investigar si algo va mal.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- una request real del sistema aparece en Zipkin,
- el recorrido distribuido puede leerse de forma coherente,
- y NovaMarket ya tiene una base operativa muy sólida de observabilidad de punta a punta.

Esta clase funciona como cierre del tramo principal de trazas distribuidas.

---

## Estado de partida

En este punto del curso deberíamos tener:

- Zipkin levantado,
- `api-gateway`, `order-service` e `inventory-service` exportando trazas,
- y una UI que ya muestra actividad real del sistema al generar tráfico.

Además, el flujo autenticado de órdenes debería seguir funcionando correctamente.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- generar una request distribuida real,
- abrirla en Zipkin,
- recorrer sus spans,
- interpretar el camino que hizo por la arquitectura,
- y usar ese análisis para consolidar el aprendizaje del módulo.

---

## Por qué esta clase vale tanto

Porque es el momento donde la observabilidad distribuida deja de sentirse como una colección de dependencias o configuraciones y pasa a convertirse en una herramienta real de lectura del sistema.

Después de esta clase, el alumno debería poder pensar algo como:

- “esta request pasó por acá”
- “acá se demoró más”
- “acá se llamó a inventario”
- “si esto fallara, podría investigar este tramo”

Ese cambio de mentalidad es muy valioso.

---

## Paso 1 · Levantar el entorno relevante

Conviene arrancar con el entorno completo necesario:

1. Zipkin
2. `config-server`
3. `discovery-server`
4. Keycloak
5. `catalog-service`
6. `inventory-service`
7. `order-service`
8. `api-gateway`

La idea es observar una request real del sistema en su estado operativo normal.

---

## Paso 2 · Obtener un token si vas a probar el flujo protegido

Como la ruta de órdenes está protegida, si querés usar el flujo más interesante del sistema necesitás un token válido.

Podés obtenerlo con el usuario de prueba que ya venís usando en el bloque de seguridad.

La idea es usar un request que realmente atraviese la arquitectura principal, no una consulta demasiado trivial.

---

## Paso 3 · Generar una request distribuida representativa

La mejor candidata para esta clase es, otra vez, la creación de una orden autenticada.

Por ejemplo:

```bash
curl -i -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 1 },
      { "productId": 2, "quantity": 1 }
    ]
  }'
```

¿Por qué este request es ideal?

Porque atraviesa:

- el gateway,
- el servicio de órdenes,
- y el servicio de inventario.

Es decir, nos deja una traza distribuida con valor real.

---

## Paso 4 · Abrir Zipkin inmediatamente después

Ahora entrá a la UI de Zipkin.

Por ejemplo:

```txt
http://localhost:9411
```

La idea es buscar la traza generada por esa request reciente.

Como acabás de producir tráfico, debería ser más fácil encontrarla entre los últimos registros.

---

## Paso 5 · Identificar la traza correcta

En esta etapa, lo importante es localizar una traza que corresponda al request que acabás de ejecutar.

Una vez encontrada, abrila para ver el detalle.

No hace falta todavía interpretar cada milisegundo con obsesión.  
Lo importante es reconocer que esa traza representa una historia real de una request dentro de NovaMarket.

---

## Paso 6 · Reconocer los servicios que participaron

Dentro de la traza, deberías poder identificar algo equivalente a este recorrido:

- entrada por `api-gateway`
- paso por `order-service`
- llamada hacia `inventory-service`

La visualización exacta puede variar, pero conceptualmente el camino debería resultar reconocible.

Este paso es muy importante porque deja completamente visible algo que, sin Zipkin, antes solo podíamos deducir por logs dispersos o intuición.

---

## Paso 7 · Mirar la duración de los spans

Ahora mirá los tiempos asociados a los distintos spans o tramos del recorrido.

La idea es hacerte preguntas como estas:

- ¿cuánto tardó el gateway?
- ¿cuánto tardó `order-service`?
- ¿cuánto tardó la llamada hacia inventario?
- ¿hay algún tramo claramente más costoso?

No hace falta todavía sacar conclusiones definitivas, pero sí empezar a leer esas señales con criterio.

---

## Paso 8 · Relacionar la traza con el comportamiento funcional

Este punto es muy valioso.

La traza no reemplaza el resultado funcional del request.  
La complementa.

Por eso conviene relacionar ambas cosas:

- la orden se creó correctamente,
- y además podemos ver por dónde pasó y cuánto tardó.

Este cruce entre negocio y observabilidad es uno de los grandes valores del tracing distribuido.

---

## Paso 9 · Repetir con un segundo request diferente

Si querés enriquecer la clase, repetí la prueba con otro request.

Por ejemplo:

- una orden más simple,
- o incluso una consulta al catálogo si también configuraste tracing ahí más adelante.

La idea es comparar trazas y empezar a reconocer que no todas las requests tienen la misma historia ni el mismo costo.

---

## Paso 10 · Probar también un escenario de error

Si querés darle todavía más valor a la clase, hacé una prueba de una orden que falle por negocio o por dependencia.

Por ejemplo:

- una cantidad sin stock,
- o un inventario caído si querés explorar resiliencia junto con trazas.

La idea es observar cómo se ve una traza no solo cuando todo sale bien, sino también cuando el flujo se degrada.

Esto suele ser una de las partes más valiosas del tracing en sistemas reales.

---

## Qué estamos logrando con esta clase

Esta clase cierra un recorrido muy importante del curso.

Antes teníamos:

- logs,
- Actuator,
- métricas,
- y señales locales.

Ahora también tenemos la capacidad de seguir una request real a través de varios componentes del sistema.

Eso transforma muchísimo la forma en que se diagnostica y se entiende la arquitectura.

---

## Qué tipo de lectura deberías poder hacer después de esta clase

Después de esta clase, el alumno debería poder pensar cosas como:

- “esta request pasó por estos tres componentes”
- “el tramo más costoso fue este”
- “si mañana algo falla, Zipkin me puede ayudar a ubicar el problema”
- “ya no tengo que adivinar completamente el recorrido de una request”

Esa ganancia conceptual vale muchísimo.

---

## Qué todavía no estamos haciendo

Todavía no:

- correlacionamos trazas con dashboards completos,
- centralizamos logs,
- ni construimos una plataforma de observabilidad total.

Todo eso puede venir después.

La meta de hoy es más concreta:

**cerrar el tramo fuerte de tracing distribuido con una lectura real de una request.**

---

## Errores comunes en esta etapa

### 1. Buscar trazas sin haber generado tráfico reciente
Eso vuelve más difícil encontrar el caso correcto.

### 2. Abrir Zipkin demasiado tarde
Conviene mirar la UI poco después de generar el request.

### 3. Querer interpretar todos los detalles técnicos de una vez
Para esta clase, lo importante es entender el recorrido general.

### 4. No relacionar la traza con el resultado funcional del request
La potencia del tracing aparece justamente al cruzar ambas cosas.

### 5. Quedarse solo con el caso feliz
Si podés, también vale mucho observar una traza de error o degradación.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías haber visto una request real de NovaMarket atravesando varios servicios dentro de Zipkin y deberías poder explicar, al menos a nivel general:

- por dónde pasó,
- qué componentes intervinieron,
- y cómo usarías esa información para diagnosticar el sistema.

Eso deja muy bien cerrado el tramo fuerte del módulo de observabilidad distribuida.

---

## Punto de control

Antes de seguir, verificá que:

- Zipkin muestra trazas de NovaMarket,
- pudiste abrir una request concreta,
- identificaste al menos gateway, órdenes e inventario,
- y entendiste el valor de seguir el recorrido completo de una request.

Si eso está bien, entonces el bloque actual de observabilidad ya quedó bastante sólido.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a empezar el bloque de mensajería asincrónica, levantando RabbitMQ para NovaMarket.

Eso va a abrir un nuevo tramo del curso donde vamos a dejar atrás parte de la comunicación exclusivamente síncrona.

---

## Cierre

En esta clase seguimos una request completa dentro de Zipkin.

Con eso, NovaMarket ya no solo genera y exporta trazas: también puede usarlas para leer el recorrido distribuido de sus requests de forma concreta y operativa.

Ese es uno de los grandes hitos del módulo de observabilidad.
