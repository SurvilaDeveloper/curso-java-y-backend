---
title: "Resilience4j: configuración e integración"
description: "Implementación práctica de resiliencia en NovaMarket con Resilience4j, aplicando Circuit Breaker, retry y reglas iniciales de protección sobre las llamadas de order-service a inventory-service."
order: 23
module: "Módulo 6 · Resiliencia y tolerancia a fallas"
level: "intermedio"
draft: false
---

# Resilience4j: configuración e integración

En la clase anterior trabajamos el patrón **Circuit Breaker** desde el punto de vista conceptual.  
Ahora toca pasar a una implementación concreta dentro de **NovaMarket**.

Nuestro objetivo no es usar resiliencia como un adorno técnico, sino aplicarla en el punto donde el sistema realmente la necesita:

**la comunicación entre `order-service` e `inventory-service` durante la creación de una orden**.

Ese es el mejor lugar para empezar porque concentra varias ideas importantes a la vez:

- una dependencia remota crítica,
- posibilidad de timeouts,
- fallas transitorias,
- riesgo de cascada,
- necesidad de observabilidad,
- y decisiones de negocio claras sobre qué hacer cuando no puede validarse stock.

Para este paso vamos a trabajar con **Resilience4j**.

---

## Qué es Resilience4j

Resilience4j es una librería orientada a patrones de resiliencia para aplicaciones Java.

En el contexto de Spring Boot, suele usarse para implementar mecanismos como:

- **Circuit Breaker**,
- **Retry**,
- **Rate Limiter**,
- **Bulkhead**,
- **Time Limiter**.

En este curso vamos a empezar por los dos que mejor se entienden y más valor didáctico tienen en esta etapa:

- Circuit Breaker,
- Retry.

Más adelante también vamos a relacionarlos con métricas y Actuator para poder observar su comportamiento.

---

## Por qué usar una librería específica

Podríamos intentar codificar lógica defensiva “a mano”, pero eso traería varios problemas:

- código repetido,
- políticas difíciles de mantener,
- poca claridad sobre el estado de la dependencia,
- escasa integración con métricas,
- decisiones de resiliencia desperdigadas por la aplicación.

Usar una librería específica nos da una forma más clara de expresar:

- qué dependencia estamos protegiendo,
- cuándo queremos cortar llamadas,
- qué excepciones cuentan como falla,
- cuántos reintentos aceptar,
- y cómo observar el comportamiento.

---

## El caso concreto dentro de NovaMarket

El flujo sigue siendo el mismo:

1. el usuario autenticado envía `POST /api/orders`,
2. `order-service` recibe la solicitud,
3. `order-service` necesita validar stock,
4. consulta a `inventory-service`,
5. si la validación es confiable y positiva, crea la orden.

La resiliencia se aplica justamente sobre esa llamada remota.

No vamos a envolver todo el servicio de órdenes con resiliencia genérica.  
Vamos a proteger **la dependencia concreta que introduce riesgo operacional**.

Ese enfoque ayuda a enseñar algo importante:

**la resiliencia se diseña alrededor de dependencias y operaciones específicas, no como una capa mágica global que resuelve todo sola**.

---

## Dependencias iniciales

En una aplicación Spring Boot, la integración suele comenzar agregando las dependencias necesarias para Resilience4j y, según el caso, su integración con Spring Boot Actuator.

El detalle exacto puede variar según la versión del stack del proyecto, pero conceptualmente `order-service` va a incorporar:

- integración de Circuit Breaker,
- integración de Retry,
- y soporte para observabilidad a través de Actuator.

En el curso conviene presentar esto como una capa incremental sobre el servicio ya existente, no como algo que reescribe toda la arquitectura.

---

## Dónde conviene aplicar la protección

Una buena decisión didáctica es aplicar resiliencia sobre un componente bien identificado, por ejemplo:

- el cliente Feign que habla con `inventory-service`,
- o el servicio de dominio que encapsula la consulta de stock.

Lo importante es evitar dos extremos:

### Extremo 1
Aplicar la resiliencia demasiado abajo, de forma difícil de seguir.

### Extremo 2
Aplicarla demasiado arriba, envolviendo todo sin separar responsabilidades.

En NovaMarket, el lugar más claro es el punto donde `order-service` ejecuta la validación remota de stock.  
Así el alumno puede ver con claridad:

- qué llamada se protege,
- qué falla activa el mecanismo,
- y cómo repercute eso sobre la creación de órdenes.

---

## Primera decisión de negocio

Antes de escribir configuración, conviene dejar fija una regla funcional:

**si no se puede validar stock de forma confiable, la orden no se crea**.

Esa definición es importante porque condiciona la estrategia técnica.

Si el negocio exigiera aceptar órdenes pendientes aun sin confirmación de stock, el diseño sería distinto.  
Pero para este curso, en esta etapa, queremos un comportamiento simple y honesto:

- si el stock se valida, seguimos,
- si no se puede validar bien, respondemos con error controlado.

Eso vuelve mucho más clara la relación entre resiliencia y negocio.

---

## Circuit Breaker en la práctica

El Circuit Breaker se va a asociar a la operación de consulta de stock.

Conceptualmente, la implementación busca esto:

- permitir llamadas normalmente mientras la dependencia esté sana,
- registrar fallas y latencias anormales,
- abrir el circuito cuando la dependencia se vuelva no confiable,
- fallar rápido mientras el circuito esté abierto,
- probar recuperación de forma controlada,
- volver a cerrar el circuito si la dependencia mejora.

### Ejemplo conceptual de configuración

```yml
resilience4j:
  circuitbreaker:
    instances:
      inventoryService:
        slidingWindowType: COUNT_BASED
        slidingWindowSize: 10
        minimumNumberOfCalls: 5
        failureRateThreshold: 50
        waitDurationInOpenState: 10s
        permittedNumberOfCallsInHalfOpenState: 3
```

No hace falta memorizar cada propiedad desde el primer contacto.  
Lo importante es entender la intención:

- observar una ventana de llamadas recientes,
- abrir el circuito si la tasa de fallas supera un umbral,
- esperar un tiempo antes de volver a probar,
- y dejar pasar unas pocas llamadas en estado HALF_OPEN.

---

## Cómo leer esta configuración

### `slidingWindowSize`
Define cuántas llamadas recientes se consideran para evaluar el estado.

### `minimumNumberOfCalls`
Evita tomar decisiones con muy poca información.  
No conviene abrir un circuito por una sola llamada aislada.

### `failureRateThreshold`
Marca el porcentaje de fallas a partir del cual el circuito se abre.

### `waitDurationInOpenState`
Define cuánto tiempo permanece abierto antes de permitir nuevas pruebas.

### `permittedNumberOfCallsInHalfOpenState`
Controla cuántas llamadas se dejan pasar cuando se está verificando si la dependencia ya se recuperó.

El valor correcto no es universal.  
Depende de la operación, del tráfico y del negocio.  
En el curso nos interesa primero comprender el comportamiento antes que afinarlo obsesivamente.

---

## Retry en la práctica

El retry responde a una pregunta distinta:

**¿tiene sentido intentar de nuevo una operación si la primera llamada falló?**

En algunos casos sí.  
Por ejemplo, si hubo un error transitorio muy breve.

En otros casos no.  
Si el servicio ya está saturado o el circuito detecta degradación sostenida, insistir puede empeorar todo.

Por eso el retry debe configurarse con mucha prudencia.

### Ejemplo conceptual

```yml
resilience4j:
  retry:
    instances:
      inventoryService:
        maxAttempts: 3
        waitDuration: 300ms
```

La idea acá es simple:

- primer intento,
- uno o dos reintentos breves si el error parece transitorio,
- y nada más.

No queremos una tormenta de reintentos.

---

## Orden conceptual entre retry y circuit breaker

Esta es una pregunta importante:  
¿qué ocurre primero?

La respuesta depende de la forma de integración, pero conceptualmente conviene pensar así:

- el **retry** puede ayudar frente a fallas puntuales,
- el **circuit breaker** protege frente a una dependencia que ya muestra un patrón de degradación.

Es decir:

- si el problema es apenas una falla transitoria, un retry corto puede resolverlo,
- si el problema ya es sistémico, el circuit breaker debe terminar imponiendo el corte.

En el curso conviene explicar esto con mucho cuidado para evitar una mala intuición:

**retry no significa insistir infinitamente; circuit breaker no significa dejar de intentar para siempre**.

---

## Qué excepciones deberían contar como falla

Otro punto importante es decidir qué errores alimentan el circuito o activan reintentos.

No todo error tiene el mismo significado.

Por ejemplo:

- un timeout suele indicar un problema real de disponibilidad o latencia,
- una excepción de conexión también,
- pero un error de validación del negocio no debería contarse como una “falla de infraestructura”.

Si el usuario pide una cantidad inválida, eso no es una señal para abrir el circuito de `inventory-service`.  
Es simplemente una solicitud incorrecta.

Este punto es clave porque enseña a separar:

- **errores del negocio**,
- **errores técnicos/transitorios**.

Y esa separación mejora mucho la calidad del diseño.

---

## Fallback: cuándo sí y cuándo no

Resilience4j permite definir fallbacks, es decir, una respuesta alternativa cuando la llamada protegida falla.

Eso puede ser muy útil, pero también peligroso si se usa de manera engañosa.

En NovaMarket, como la validación de stock es crítica, no conviene inventar disponibilidad si no pudimos verificarla.

Entonces, un fallback razonable en esta etapa no sería:

- “asumir que hay stock”

sino algo más honesto como:

- lanzar una excepción controlada,
- devolver una respuesta clara,
- o traducir la falla a un error funcional entendible para el cliente.

### Ejemplo conceptual

```java
public StockCheckResult fallback(Throwable ex) {
    throw new StockValidationUnavailableException(
        "No fue posible validar stock en este momento"
    );
}
```

El objetivo no es ocultar la falla, sino administrarla mejor.

---

## Integración conceptual en `order-service`

La secuencia podría pensarse así:

1. `order-service` recibe la solicitud de orden,
2. delega la validación de stock a un componente dedicado,
3. ese componente invoca a `inventory-service` protegido por retry y circuit breaker,
4. si la validación sale bien, sigue el flujo normal,
5. si falla de forma controlada, se devuelve una respuesta clara y consistente.

Eso mantiene dos beneficios:

- el flujo del negocio sigue siendo legible,
- la resiliencia queda asociada a una dependencia concreta.

---

## Qué comportamiento esperamos ver

Cuando todo funciona bien:

- el circuito permanece cerrado,
- las llamadas fluyen normalmente,
- la orden se crea si hay stock.

Si hay una falla puntual:

- puede activarse un retry corto,
- la operación podría recuperarse sin que el usuario lo note.

Si empieza una degradación sostenida:

- el circuit breaker detecta el problema,
- se abre,
- `order-service` deja de insistir con llamadas costosas,
- y la respuesta pasa a ser una falla rápida y controlada.

Ese cambio es uno de los grandes saltos de madurez en una arquitectura distribuida.

---

## Riesgos de mala configuración

### Retries excesivos
Pueden multiplicar la presión sobre un servicio ya dañado.

### Umbrales demasiado bajos
El circuito puede abrirse antes de tiempo.

### Umbrales demasiado altos
El circuito reacciona demasiado tarde.

### Fallbacks engañosos
Ocultan una falla crítica y degradan la integridad del negocio.

### Falta de observabilidad
Sin métricas ni estado visible, la resiliencia queda “invisible” y difícil de operar.

---

## Qué vamos a observar después

La implementación sola no alcanza.  
Una de las ventajas fuertes de Resilience4j es que puede integrarse con observabilidad para mostrar:

- estado del circuito,
- cantidad de llamadas exitosas y fallidas,
- transiciones entre CLOSED, OPEN y HALF_OPEN,
- reintentos realizados,
- y comportamiento general frente a una dependencia degradada.

En la próxima clase vamos a enfocarnos justamente en eso:  
**cómo observar la resiliencia con Actuator**.

Ahí el alumno va a poder ver que resiliencia no es solo agregar anotaciones o configuración, sino también entender lo que el sistema está haciendo cuando se defiende.

---

## Relación con el proyecto del curso

En NovaMarket, incorporar Resilience4j no es un tema aislado.  
Es la continuación natural de lo que ya construimos:

- primero tuvimos microservicios,
- después los conectamos,
- luego centralizamos el acceso y la seguridad,
- y ahora empezamos a preparar el sistema para un comportamiento más realista bajo falla.

Eso mantiene la coherencia del curso y refuerza una idea clave:

**cada herramienta aparece porque el sistema la necesita**.

---

## Cierre

Resilience4j nos permite implementar mecanismos concretos de resiliencia sobre dependencias remotas críticas, como la llamada de `order-service` a `inventory-service` durante la validación de stock.

Su valor no está en decorar código, sino en permitir que el sistema:

- reaccione mejor frente a fallas transitorias,
- corte a tiempo una dependencia degradada,
- falle rápido cuando hace falta,
- y prepare el terreno para una observabilidad mucho más rica.

En la próxima clase vamos a mirar cómo exponer y analizar ese comportamiento con **Actuator**, para que la resiliencia de NovaMarket no solo exista, sino que también pueda medirse y entenderse.
