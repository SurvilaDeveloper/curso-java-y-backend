---
title: "Observabilidad: logs, métricas y trazas"
description: "Introducción a la observabilidad moderna en microservicios: cómo se complementan logs, métricas y trazas para entender el comportamiento real del sistema."
order: 25
module: "Módulo 7 · Observabilidad moderna"
level: "base"
draft: false
---

# Observabilidad: logs, métricas y trazas

A medida que NovaMarket fue creciendo, dejamos atrás la etapa en la que todo podía entenderse mirando una sola aplicación aislada.

Ahora tenemos varios servicios, llamadas por red, fallas parciales, seguridad distribuida, retries, circuit breakers y procesos asincrónicos en camino.

En ese contexto aparece una necesidad fundamental:

**entender qué está pasando realmente dentro del sistema**.

Ese es el objetivo de la observabilidad.

---

## Por qué la observabilidad se vuelve necesaria

En una aplicación simple, muchas veces alcanza con:

- mirar la consola,
- revisar un stack trace,
- poner algunos logs,
- reproducir el error localmente.

Pero en una arquitectura distribuida empiezan a aparecer escenarios mucho más complejos.

Por ejemplo:

- un request entra por `api-gateway`,
- pasa a `order-service`,
- `order-service` consulta a `inventory-service`,
- una dependencia responde lento,
- un retry se ejecuta,
- el circuito cambia de estado,
- el resultado final tarda más de lo esperado.

Si solo miramos un servicio en aislamiento, nos perdemos parte de la historia.

---

## Qué es observabilidad

En términos prácticos, la observabilidad es la capacidad de inferir qué está ocurriendo dentro de un sistema a partir de las señales que emite.

No se trata solo de “tener logs” ni solo de “medir CPU”.

Se trata de construir una imagen más completa del comportamiento del sistema usando varias fuentes complementarias.

En microservicios, esas fuentes suelen organizarse alrededor de tres señales principales:

- **logs**
- **métricas**
- **trazas**

Estas tres piezas no compiten entre sí. Se complementan.

---

## La diferencia entre monitoreo y observabilidad

Los términos suelen mezclarse, pero conviene separarlos.

### Monitoreo
Suele responder preguntas conocidas, por ejemplo:

- ¿el servicio está arriba?
- ¿cuánto CPU consume?
- ¿cuántos errores hubo en la última hora?

### Observabilidad
Apunta más a responder preguntas como:

- ¿por qué está fallando este flujo?
- ¿en qué servicio está el cuello de botella?
- ¿qué pasó con esta request específica?
- ¿en qué punto se degradó el recorrido?

El monitoreo mira señales conocidas.
La observabilidad ayuda a investigar comportamientos menos obvios.

---

## Las tres señales de observabilidad

### 1. Logs
Los logs registran eventos discretos.

Ejemplos:

- se recibió una request,
- se creó una orden,
- falló la validación de stock,
- un token fue rechazado,
- se abrió un circuit breaker.

Los logs son muy útiles para entender contexto y secuencia textual.

### 2. Métricas
Las métricas resumen comportamientos cuantitativos a lo largo del tiempo.

Ejemplos:

- cantidad de requests por segundo,
- porcentaje de errores,
- latencia promedio,
- tiempo máximo de respuesta,
- cantidad de reintentos.

Las métricas ayudan a detectar tendencias y anomalías.

### 3. Trazas
Las trazas siguen el recorrido de una operación a través de varios servicios.

Ejemplos:

- una request entra al gateway,
- pasa a `order-service`,
- consulta a `inventory-service`,
- publica un evento,
- un consumidor procesa la notificación.

Las trazas permiten reconstruir el camino end-to-end de una operación.

---

## Por qué una sola señal no alcanza

Un error común es confiar demasiado en una sola fuente.

### Solo logs
Podemos tener mucho detalle textual, pero cuesta ver tendencias globales.

### Solo métricas
Podemos detectar que hay más errores o más latencia, pero no siempre entender el caso puntual.

### Solo trazas
Podemos reconstruir recorridos, pero quizás no ver suficiente contexto de negocio o agregación estadística.

La combinación de las tres señales da una imagen mucho más rica.

---

## Ejemplo aplicado a NovaMarket

Imaginemos que el flujo de crear una orden empieza a fallar de forma intermitente.

### Con logs
Podemos ver mensajes como:

- request recibida en el gateway,
- inicio de creación de orden,
- llamada a `inventory-service`,
- timeout o error remoto,
- fallback ejecutado.

### Con métricas
Podemos detectar:

- aumento de errores en `/orders`,
- latencia creciente,
- incremento en llamadas fallidas a inventario,
- número de retries disparados.

### Con trazas
Podemos seguir una operación específica y descubrir:

- cuánto tiempo pasó en cada servicio,
- en qué salto apareció el problema,
- si el cuello de botella estuvo en gateway, order o inventory.

Cada señal aporta una parte distinta del diagnóstico.

---

## Qué pasa cuando no tenemos observabilidad

Sin observabilidad, los síntomas se vuelven confusos.

El usuario dice:

- “a veces tarda mucho”,
- “a veces falla”,
- “una orden sí se crea y otra no”,
- “no sé si el problema está en seguridad, inventario o red”.

Y el equipo técnico termina haciendo debugging reactivo, manual y fragmentado.

En microservicios, eso escala muy mal.

---

## Qué conviene observar en NovaMarket

No todo merece el mismo nivel de atención. Conviene priorizar lo que más impacto tiene en el flujo central del curso.

### Flujo principal
**consultar catálogo → crear orden → validar stock → registrar orden → publicar evento → notificar**

### Puntos importantes de observación
- entrada por gateway,
- autenticación y autorización,
- latencia de `order-service`,
- dependencia con `inventory-service`,
- publicación y consumo de eventos,
- fallas y reintentos,
- salud de componentes críticos.

---

## Relación con resiliencia

Observabilidad y resiliencia están muy conectadas.

La resiliencia intenta que el sistema falle mejor.
La observabilidad intenta que podamos entender cómo está fallando.

Por ejemplo, cuando agregamos Circuit Breaker a `order-service`, necesitamos ver:

- cuántas llamadas fallan,
- si el circuito se abrió,
- cuánto tiempo permaneció abierto,
- si la latencia sigue creciendo,
- si el problema está realmente en la dependencia remota.

Sin observabilidad, un mecanismo resiliente puede parecer aleatorio.

---

## Logs en una arquitectura distribuida

En una sola aplicación, un log simple ya puede dar bastante contexto.

En microservicios, los logs necesitan más cuidado.

Conviene prestar atención a cosas como:

- nombre del servicio que emite el log,
- timestamp consistente,
- nivel de severidad,
- identificador de correlación,
- contexto suficiente para entender el evento,
- evitar ruido excesivo.

Más adelante vamos a ver agregación de logs, porque revisar consola por consola deja de ser práctico bastante rápido.

---

## Métricas en una arquitectura distribuida

Las métricas sirven para pasar de la impresión subjetiva a la evidencia cuantitativa.

No es lo mismo decir:

- “parece lento”

a decir:

- “la latencia p95 de `/orders` subió de 180 ms a 1.8 s”,
- “el error rate se duplicó”,
- “la dependencia con inventario concentra el 80% de los fallos”.

Las métricas ayudan a medir salud, carga, latencia y errores de forma agregada.

---

## Trazas en una arquitectura distribuida

Las trazas son especialmente valiosas cuando una operación atraviesa varios componentes.

En NovaMarket, una traza puede mostrar el viaje de una sola request:

1. entra por `api-gateway`,
2. llega a `order-service`,
3. sale hacia `inventory-service`,
4. vuelve la respuesta,
5. se confirma la orden,
6. se dispara un evento.

Eso permite localizar mejor en qué paso apareció una demora o una falla.

---

## Una idea importante: observabilidad no es logging decorativo

A veces se piensa la observabilidad como “poner algunos logs lindos”.

Pero en realidad implica algo más serio:

- decidir qué señales emitir,
- qué información conservar,
- cómo correlacionarla,
- cómo usarla para diagnosticar,
- y cómo evitar tanto el silencio como el ruido excesivo.

Una mala estrategia de logs, métricas y trazas puede ser casi tan inútil como no tener nada.

---

## Qué vamos a incorporar en las próximas clases

En este bloque del curso vamos a profundizar en tres niveles:

1. **métricas** con Spring Boot Actuator y Micrometer,
2. **tracing distribuido** para seguir requests entre servicios,
3. **log aggregation** para centralizar lectura y diagnóstico.

Todo eso lo vamos a aterrizar sobre NovaMarket, siguiendo el flujo de creación de órdenes y las interacciones entre sus servicios.

---

## Señales útiles y señales inútiles

No toda señal aporta valor.

### Señales útiles
- requests por endpoint,
- latencia por operación,
- errores por dependencia,
- estado de circuit breakers,
- trazas de flujos críticos,
- logs con contexto suficiente.

### Señales inútiles o poco útiles
- logs redundantes en exceso,
- métricas sin interpretación,
- trazas imposibles de correlacionar,
- mensajes demasiado genéricos,
- falta de consistencia entre servicios.

La observabilidad también exige criterio.

---

## Cierre

La observabilidad moderna se apoya en tres señales principales: logs, métricas y trazas.

Cada una aporta una perspectiva distinta sobre el comportamiento del sistema, y juntas permiten entender mejor lo que sucede dentro de una arquitectura distribuida.

En NovaMarket, esto va a ser clave para seguir el flujo de una orden a través de múltiples servicios, detectar cuellos de botella, interpretar fallas y operar el sistema con más confianza.

En la próxima clase vamos a enfocarnos específicamente en las **métricas**, usando Spring Boot Actuator y Micrometer para empezar a medir el comportamiento técnico de nuestros microservicios.
