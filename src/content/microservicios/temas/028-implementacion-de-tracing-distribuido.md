---
title: "Implementación de tracing distribuido"
description: "Implementación práctica de tracing distribuido en NovaMarket para seguir el flujo de creación de órdenes desde el gateway hasta los servicios internos y la mensajería asincrónica."
order: 28
module: "Módulo 7 · Observabilidad moderna"
level: "intermedio"
draft: false
---

# Implementación de tracing distribuido

En la clase anterior vimos qué es una traza distribuida, qué diferencia hay entre una trace y un span, y por qué esta capacidad se vuelve importante cuando una operación atraviesa varios microservicios.

Ahora vamos a bajar esa idea al proyecto del curso.

El objetivo de esta clase no es solo “activar una dependencia”, sino entender **dónde conviene instrumentar**, **qué flujo vamos a observar** y **qué señales esperamos ver** una vez que NovaMarket tenga tracing distribuido funcionando.

---

## Objetivo de la implementación

Vamos a instrumentar el flujo principal del curso:

**consultar catálogo → crear orden → validar stock → registrar orden → publicar evento → notificar**

Aunque todo el flujo completo del curso es más amplio, en esta clase nos interesa concentrarnos sobre todo en la operación de creación de orden.

Queremos poder ver:

1. la entrada de la request al `api-gateway`,
2. el paso hacia `order-service`,
3. la llamada de `order-service` a `inventory-service`,
4. la persistencia de la orden,
5. la publicación del evento,
6. y el consumo en `notification-service`.

Esa es la historia técnica que queremos reconstruir.

---

## Qué parte de la instrumentación puede ser automática

En el ecosistema Spring actual, una parte importante del tracing puede apoyarse en instrumentación automática o semiautomática, especialmente en flujos HTTP y componentes integrados con observabilidad.

Eso significa que no todo requiere crear spans manualmente desde cero.

Por ejemplo, suele ser razonable esperar spans automáticos o integrados para:

- requests HTTP entrantes,
- clientes HTTP salientes,
- algunos componentes del stack web,
- y parte de la propagación de contexto si la infraestructura está correctamente configurada.

Sin embargo, en el proyecto del curso no conviene depender ciegamente de “lo automático”.

Lo importante es saber:

- qué spans esperamos ver,
- qué relación deberían tener,
- y en qué puntos puede hacer falta instrumentación adicional.

---

## El flujo base que vamos a observar

Tomemos esta operación:

`POST /api/orders`

La request entra autenticada al gateway con un token válido. El gateway la enruta hacia `order-service`. Allí ocurre algo como esto:

1. se valida el request,
2. se consulta stock en `inventory-service`,
3. si hay disponibilidad, se crea la orden,
4. se publica `OrderCreatedEvent`,
5. `notification-service` consume el evento.

Lo interesante es que este flujo combina:

- tráfico HTTP,
- lógica interna,
- persistencia,
- y mensajería.

Eso lo convierte en una muy buena demostración didáctica para tracing distribuido.

---

## Dónde conviene tener spans claros

Para que el trazado sea útil, conviene pensar explícitamente qué partes del flujo merecen spans identificables.

### 1. Span de entrada en el gateway

Representa el ingreso de la request al sistema.

Sirve para responder preguntas como:
- cuándo entró la solicitud,
- cuánto tardó el gateway,
- si hubo filtros que agregaron latencia.

### 2. Span en `order-service`

Representa la lógica principal de creación de la orden.

Sirve para ver:
- duración del caso de uso,
- suboperaciones que dependen de él,
- fallas de negocio o validaciones.

### 3. Span de llamada a `inventory-service`

Representa la verificación de stock.

Es clave porque esta dependencia es uno de los mejores lugares para mostrar latencia, fallas, retries o circuit breaker.

### 4. Span de persistencia o confirmación

No siempre hace falta convertir cada operación de base en un span manual, pero conceptualmente conviene distinguir la parte donde la orden queda registrada.

### 5. Span de publicación del evento

Permite ver cuándo el flujo sincrónico delega trabajo al componente asincrónico.

### 6. Span del consumo en `notification-service`

Permite observar la continuidad de la operación después del evento.

---

## Qué esperamos ver al mirar una traza

Una vez implementado el tracing, una traza ideal del caso “crear orden” debería permitir ver algo parecido a esto:

- `POST /api/orders` en el gateway,
- paso a `order-service`,
- llamada saliente a `inventory-service`,
- respuesta de inventario,
- publicación de `OrderCreatedEvent`,
- consumo del evento en `notification-service`.

Además, cada tramo debería mostrar:

- duración,
- estado,
- relación padre-hijo,
- y, cuando corresponda, error asociado.

Eso ya es muchísimo más útil que mirar logs sueltos.

---

## Correlación con logs

Una implementación madura de tracing se vuelve mucho más útil cuando los logs incorporan el contexto de traza.

Esto permite que, al inspeccionar un log de `order-service`, pueda verse el identificador de la traza asociada. Luego, ese mismo identificador puede usarse para encontrar:

- el log de entrada en el gateway,
- la llamada a `inventory-service`,
- el consumo del evento en `notification-service`.

En otras palabras, la implementación del tracing no debería pensarse separada de la estrategia de logging.

---

## Propagación de contexto en HTTP

Uno de los puntos más importantes de la implementación es la propagación de contexto cuando un servicio llama a otro.

En NovaMarket, el caso más claro es este:

- `order-service` recibe una request,
- luego llama a `inventory-service` para verificar stock.

Si la propagación está bien resuelta:

- `inventory-service` no inicia una historia aislada,
- sino que continúa la misma traza.

Eso es indispensable para poder reconstruir correctamente el recorrido.

---

## Propagación de contexto en mensajería

La parte más interesante llega cuando aparece RabbitMQ.

Una vez publicada la orden, `order-service` emite un evento. Después, `notification-service` lo consume.

Si el contexto de observabilidad también se propaga en ese paso, la traza deja de ser puramente HTTP y pasa a cubrir tanto el flujo sincrónico como el asincrónico.

Esto es muy potente en el curso porque permite mostrar que una misma operación funcional puede continuar después de que la respuesta HTTP principal ya terminó.

---

## Qué decisiones conviene tomar en la implementación

### Empezar por el caso principal

No hace falta instrumentar todo NovaMarket de una vez.

Conviene empezar por:
- `api-gateway`,
- `order-service`,
- `inventory-service`,
- `notification-service`.

### No crear spans manuales para todo

Crear spans por cada línea o por cada método vuelve el análisis ruidoso.

Conviene reservar spans manuales para operaciones con valor explicativo claro, como:
- validación de stock,
- publicación de evento,
- procesamiento de una notificación.

### Mantener nombres claros

Los spans tienen que ser legibles. Si alguien mira la traza, debería entender rápidamente qué operación representa cada tramo.

---

## Ejemplo conceptual del flujo instrumentado

Imaginemos esta secuencia:

1. el cliente llama `POST /api/orders`,
2. el gateway crea o continúa una traza,
3. `order-service` procesa la orden bajo esa misma traza,
4. se genera un span para la consulta de stock,
5. `inventory-service` responde,
6. la orden se persiste,
7. se genera un span para la publicación del evento,
8. el contexto llega al consumidor,
9. `notification-service` genera su propio span como parte de la misma historia distribuida o de su continuación correlacionada.

El resultado es una línea temporal mucho más clara de todo lo que pasó.

---

## Qué escenarios conviene demostrar en clase

Para que la implementación sea didáctica, conviene mostrar no solo el caso feliz.

### Caso 1: operación exitosa

- hay stock,
- la orden se crea,
- el evento se publica,
- la notificación se procesa.

### Caso 2: latencia en inventario

- `inventory-service` responde lento,
- la traza muestra claramente dónde apareció la demora.

### Caso 3: error en la llamada a inventario

- la verificación falla,
- la traza refleja el error en el span correspondiente.

### Caso 4: problema en el consumidor de eventos

- la orden se crea correctamente,
- pero el consumo del evento falla o se retrasa,
- y el trazado permite analizar el comportamiento asincrónico.

Estos escenarios hacen que el tracing se entienda como una herramienta real, no como una decoración técnica.

---

## Relación con resiliencia

El tracing se vuelve todavía más valioso cuando ya hay circuit breakers, retries o timeouts.

¿Por qué?

Porque permite ver:

- si una llamada fue reintentada,
- cuánto tiempo consumieron los retries,
- qué tramo fue interrumpido por timeout,
- si un fallback evitó una propagación mayor del error.

Como NovaMarket ya viene de trabajar resiliencia en clases anteriores, este módulo de tracing cae justo en un momento ideal.

---

## Relación con seguridad

También es importante recordar que el flujo ya pasa por el gateway y servicios protegidos.

Eso implica que la operación de observabilidad convive con:

- filtros,
- autenticación,
- propagación de token,
- validación de JWT.

No queremos que el tracing rompa la seguridad ni que la seguridad impida la trazabilidad técnica. Ambas piezas deben convivir correctamente.

---

## Qué no deberíamos hacer

### 1. Instrumentar demasiado pronto procesos secundarios

Primero conviene que la traza del flujo principal sea clara.

### 2. Llenar la traza de spans irrelevantes

Más spans no siempre significa más valor.

### 3. Ignorar el componente asincrónico

Si el curso ya introduce RabbitMQ, dejarlo fuera del tracing debilita mucho la historia completa.

### 4. Pensar que la visualización reemplaza el análisis

La herramienta ayuda, pero lo importante es entender qué flujo se está observando.

---

## Resultado esperado en NovaMarket

Al terminar esta implementación, deberíamos poder tomar una operación real de negocio y responder con evidencia técnica preguntas como estas:

- ¿por qué tardó esta orden en procesarse?
- ¿el problema estuvo en el gateway, en `order-service` o en `inventory-service`?
- ¿el evento se publicó correctamente?
- ¿la notificación fue consumida como se esperaba?
- ¿hubo algún tramo asincrónico que se demoró más de lo previsto?

Eso convierte a la observabilidad en una capacidad práctica del sistema.

---

## Cierre

Implementar tracing distribuido en NovaMarket significa hacer visible el recorrido real de una operación de negocio a través de varios servicios.

La clave no está en agregar spans por todos lados, sino en instrumentar con criterio el flujo principal del sistema, propagando correctamente el contexto y correlacionando HTTP, lógica de negocio y mensajería.

En la próxima clase vamos a sumar la tercera pata fuerte de la observabilidad operativa: la agregación de logs y cómo centralizar lo que emiten los distintos componentes del sistema.
