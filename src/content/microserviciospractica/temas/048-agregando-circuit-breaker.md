---
title: "Agregando circuit breaker"
description: "Profundización del bloque de resiliencia en NovaMarket. Uso explícito de circuit breaker para proteger order-service frente a fallas repetidas de inventory-service."
order: 48
module: "Módulo 8 · Resiliencia aplicada"
level: "intermedio"
draft: false
---

# Agregando circuit breaker

En la clase anterior incorporamos retry y vimos algo importante:

- a veces un reintento ayuda,
- pero otras veces no,
- y si la dependencia está realmente caída, seguir insistiendo puede empeorar el problema.

Ese es justamente el terreno ideal para introducir la siguiente herramienta clave del módulo:

**circuit breaker**.

La idea central del circuit breaker es muy poderosa:

**si un servicio remoto viene fallando repetidamente, no tiene sentido seguir insistiendo como si nada.**

En lugar de eso, el sistema puede “abrir el circuito”, dejar de intentar por un tiempo y responder de una forma más controlada.

Eso es lo que vamos a trabajar en esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- configurado un circuit breaker más explícito para la llamada hacia inventario,
- entendidos sus estados básicos,
- verificado el comportamiento cuando la dependencia falla repetidamente,
- y observado el valor real de esta herramienta dentro del flujo de NovaMarket.

---

## Estado de partida

Partimos de este contexto:

- `order-service` ya tiene timeout,
- ya tiene mejor manejo de errores,
- ya integra Resilience4j,
- y ya aplica retry sobre la llamada hacia `inventory-service`.

Eso significa que el sistema ya reacciona mejor ante ciertas fallas, pero todavía no tiene una política visible y bien entendida para cortar temporalmente el tráfico cuando la dependencia falla una y otra vez.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- refinar la configuración del circuit breaker,
- revisar con claridad el punto donde se aplica,
- provocar fallas repetidas,
- observar qué pasa cuando el circuito se abre,
- y dejar el comportamiento mucho más comprensible antes de entrar a métricas y Actuator.

---

## Qué problema resuelve circuit breaker

Retry es útil cuando vale la pena volver a intentar.  
Pero si la dependencia está realmente caída o muy degradada, insistir demasiado puede ser perjudicial.

Ahí aparece el valor del circuit breaker:

- detecta una tasa de fallas alta,
- deja de permitir nuevas llamadas durante un período,
- y protege al servicio consumidor de seguir sufriendo una dependencia que está claramente mal.

Esto ayuda mucho a evitar cascadas de fallos y presión innecesaria.

---

## Recordatorio rápido de los estados básicos

Aunque este curso práctico sea operativo, conviene tener presente la idea general.

### Closed
El circuito está cerrado y las llamadas pasan normalmente.

### Open
El circuito está abierto y las llamadas se cortan sin intentar realmente llegar a la dependencia.

### Half-open
Después de un tiempo de espera, el sistema permite algunos intentos de prueba para ver si la dependencia se recuperó.

No hace falta memorizar teoría abstracta.  
Lo importante es que en esta clase vamos a intentar observar señales reales de estos comportamientos.

---

## Paso 1 · Revisar o ajustar la configuración del circuit breaker

En `config-repo/order-service.yml`, si ya habías dejado una configuración inicial, este es un buen momento para revisarla y hacerla un poco más explícita para pruebas.

Una base conceptual razonable podría verse así:

```yaml
resilience4j:
  circuitbreaker:
    instances:
      inventoryService:
        slidingWindowSize: 5
        minimumNumberOfCalls: 3
        failureRateThreshold: 50
        waitDurationInOpenState: 10s
        permittedNumberOfCallsInHalfOpenState: 2
  retry:
    instances:
      inventoryService:
        maxAttempts: 3
        waitDuration: 500ms
```

Estos valores no son mágicos ni universales, pero sí son suficientemente chicos como para que el comportamiento del circuit breaker sea más fácil de observar durante las pruebas del curso.

---

## Qué significan estos valores

### `slidingWindowSize: 5`
Se evaluarán las últimas cinco llamadas.

### `minimumNumberOfCalls: 3`
No se toma una decisión antes de tener al menos tres llamadas evaluables.

### `failureRateThreshold: 50`
Si más de la mitad de esas llamadas fallan, el circuito puede abrirse.

### `waitDurationInOpenState: 10s`
Cuando se abre, espera diez segundos antes de intentar pasar a half-open.

### `permittedNumberOfCallsInHalfOpenState: 2`
En half-open deja pasar dos llamadas de prueba.

Para un curso práctico, esta configuración es muy útil porque hace visible el comportamiento sin necesitar un volumen enorme de requests.

---

## Paso 2 · Confirmar dónde está aplicado el circuit breaker

En `OrderService`, el punto importante sigue siendo el método que encapsula la llamada a inventario.

La idea es que algo equivalente a esto siga existiendo:

```java
@Retry(name = "inventoryService")
@CircuitBreaker(name = "inventoryService", fallbackMethod = "inventoryFallback")
public InventoryItemResponse getInventory(Long productId) {
    return inventoryFeignClient.findByProductId(productId);
}
```

Este método es hoy el corazón del bloque de resiliencia del flujo.

---

## Paso 3 · Reiniciar `order-service`

Después de ajustar la configuración, reiniciá `order-service`.

Asegurate también de tener arriba:

- Keycloak
- `config-server`
- `discovery-server`
- `api-gateway`

Y para la fase inicial de prueba, también `inventory-service`.

Primero queremos comprobar que el caso feliz sigue sano.

---

## Paso 4 · Probar el flujo sano

Antes de romper nada, ejecutá una orden válida:

```bash
curl -i -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 1 }
    ]
  }'
```

La respuesta debería seguir siendo correcta.

Esto confirma que la configuración del circuit breaker no afecta negativamente el flujo cuando la dependencia está saludable.

---

## Paso 5 · Apagar `inventory-service`

Ahora sí, provoquemos el escenario que queremos estudiar.

Apagá `inventory-service`.

Queremos forzar una secuencia de fallas repetidas que le permita al circuit breaker tomar la decisión de abrirse.

---

## Paso 6 · Repetir varias veces la creación de orden

Ahora ejecutá varias veces el mismo request autenticado.

Por ejemplo, repetí tres, cuatro o cinco veces una orden que necesite inventario:

```bash
curl -i -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 1 }
    ]
  }'
```

La idea es que, después de suficientes fallas, el circuito deje de comportarse como un simple intento fallido y pase a un estado donde ya ni siquiera quiera intentar la llamada real.

---

## Paso 7 · Observar cómo cambia el comportamiento

Este es el corazón de la clase.

Al principio, las primeras requests pueden fallar intentando realmente consultar inventario.

Pero después de cierto punto, cuando el circuit breaker se abra, lo esperable es que el sistema:

- falle más rápido,
- llegue directamente al fallback,
- y deje de insistir contra una dependencia claramente caída.

Ese cambio de comportamiento es exactamente lo que queremos aprender.

---

## Paso 8 · Mirar logs de `order-service`

Revisá la consola de `order-service`.

Queremos detectar señales de:

- primeras fallas reales,
- transición hacia apertura del circuito,
- y uso del fallback sin intento remoto posterior.

Aunque no siempre sea perfectamente visible sin métricas más ricas, esta clase ya permite intuir bastante bien el cambio en el comportamiento operativo.

---

## Paso 9 · Volver a levantar `inventory-service`

Ahora levantá nuevamente `inventory-service`.

Esperá a que:

- se registre otra vez en Eureka,
- quede operativo,
- y responda normalmente.

Después conviene esperar también el tiempo definido por `waitDurationInOpenState`, porque si el circuito sigue abierto no va a volver inmediatamente al comportamiento normal.

---

## Paso 10 · Probar la recuperación

Ahora repetí nuevamente una orden autenticada válida.

La expectativa es observar que, después del período correspondiente y según cómo el circuito entre en half-open, el sistema empiece a permitir otra vez la llamada y eventualmente vuelva al comportamiento sano.

No hace falta que esta observación sea quirúrgica al milímetro en esta clase.  
Lo importante es captar la idea:

- el circuito no queda abierto para siempre,
- y existe un proceso de recuperación controlado.

---

## Qué estamos logrando con esta clase

Esta clase agrega una capa muy importante de madurez al sistema.

Antes, si inventario fallaba repetidamente, `order-service` seguía insistiendo demasiado.

Ahora ya puede reconocer que la dependencia está claramente en mal estado y cortar tráfico durante un tiempo.

Eso es muy valioso para proteger al sistema de cascadas más serias.

---

## Qué relación tiene con retry

Este punto es importante.

Retry y circuit breaker no compiten.  
Se complementan.

- **Retry** intenta salvar problemas breves o transitorios.
- **Circuit breaker** protege cuando el problema ya se volvió sistemático.

Entender esa diferencia es una de las ganancias más importantes del módulo.

---

## Qué todavía no hicimos

Todavía no expusimos claramente:

- métricas del circuit breaker,
- estado por Actuator,
- ni visualización más rica de estos mecanismos.

Todo eso viene enseguida.

La meta de hoy es mucho más concreta:

**ver y entender el comportamiento del circuit breaker dentro del flujo.**

---

## Errores comunes en esta etapa

### 1. Configurar umbrales demasiado altos
Entonces cuesta muchísimo observar la apertura del circuito en pruebas manuales.

### 2. Probar solo una llamada fallida
El circuit breaker necesita repetición suficiente para tomar decisiones.

### 3. No esperar el tiempo de `openState`
Entonces parece que el sistema “no se recupera”.

### 4. Confundir retry con circuit breaker
Son herramientas distintas con roles distintos.

### 5. No volver a probar el caso sano después de la recuperación
Ese paso ayuda muchísimo a cerrar el aprendizaje.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, NovaMarket debería mostrar un comportamiento más inteligente frente a fallas repetidas de inventario:

- no insistir indefinidamente,
- cortar tráfico cuando la dependencia está claramente mal,
- y permitir una recuperación controlada más adelante.

Eso deja el bloque de resiliencia bastante más sólido.

---

## Punto de control

Antes de seguir, verificá que:

- existe configuración visible de circuit breaker,
- el caso feliz sigue funcionando,
- probaste varias fallas seguidas con inventario caído,
- observaste un cambio en el comportamiento del sistema,
- y entendiste la diferencia entre retry y circuit breaker.

Si eso está bien, ya podemos pasar a una etapa muy útil: observar y verificar estas piezas con Actuator.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a verificar el comportamiento de resiliencia usando Actuator.

Ese paso nos va a ayudar a dejar mucho más observable este bloque antes de seguir con el roadmap.

---

## Cierre

En esta clase profundizamos el uso de circuit breaker sobre la llamada crítica hacia inventario.

Con eso, NovaMarket ya no solo reintenta cuando algo falla: también puede reconocer cuándo una dependencia está sistemáticamente mal y proteger al sistema de seguir empujando sobre un punto roto.
