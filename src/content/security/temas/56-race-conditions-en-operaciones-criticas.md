---
title: "Race conditions en operaciones críticas"
description: "Cómo entender y detectar race conditions en una aplicación Java con Spring Boot. Qué ocurre cuando dos requests compiten sobre el mismo recurso, por qué los chequeos de negocio pueden romperse bajo concurrencia y qué estrategias ayudan a mantener operaciones críticas consistentes y más difíciles de abusar."
order: 56
module: "Lógica de negocio y abuso funcional"
level: "base"
draft: false
---

# Race conditions en operaciones críticas

## Objetivo del tema

Entender qué es una **race condition** en un backend **Java + Spring Boot**, por qué aparece incluso cuando el código “parece correcto” y cómo pensar operaciones críticas que siguen siendo válidas cuando varias requests llegan casi al mismo tiempo.

La idea no es aprender todavía todas las técnicas avanzadas de concurrencia, sino desarrollar una intuición práctica para detectar un problema muy común:

- dos usuarios actúan al mismo tiempo
- dos procesos compiten por el mismo recurso
- dos requests pasan una validación que parecía suficiente
- el estado cambia entre el chequeo y la escritura
- una operación termina ejecutándose más de una vez cuando en realidad debía ocurrir una sola

En resumen:

> un backend no corre en un mundo secuencial ideal.  
> Corre en un entorno donde varias acciones pueden intentar usar el mismo estado al mismo tiempo.

---

## Idea clave

Una race condition aparece cuando el resultado correcto de una operación depende del **orden exacto** o del **momento** en que varias acciones concurrentes acceden o modifican un mismo estado.

Dicho de otra forma:

- una request lee un dato
- toma una decisión basada en ese dato
- antes de escribir, otra request cambia ese mismo estado
- la primera sigue adelante como si nada hubiera pasado

Y ahí el backend puede terminar:

- cobrando dos veces
- aplicando dos descuentos
- reservando un stock que ya no existe
- cancelando algo que ya cambió de estado
- aprobando una acción que debía ejecutarse una sola vez

La idea central es esta:

> validar primero no alcanza si entre la validación y la acción el estado puede cambiar.

---

## Qué problema intenta resolver este tema

Muchos sistemas tienen reglas del negocio que suenan claras en papel.

### Ejemplos
- “una orden solo puede cancelarse si está en `PENDING`”
- “un cupón solo puede usarse una vez”
- “el stock no puede quedar negativo”
- “un retiro solo puede procesarse una vez”
- “una factura no puede pagarse dos veces”
- “una aprobación requiere que todavía esté en estado `WAITING_APPROVAL`”

El problema aparece cuando dos requests concurrentes leen el mismo estado inicial y ambas creen tener permiso para avanzar.

Desde afuera parece que el sistema “rompió sus reglas”.

Pero muchas veces la causa real no fue una falta de validación, sino una validación que no resistió concurrencia.

---

## Error mental clásico

Un error mental muy común es este:

> “Primero consulto si se puede hacer. Si se puede, lo hago. Listo.”

Ese razonamiento funciona solo si nadie más toca el mismo recurso entre medio.

En un backend real, eso no siempre es cierto.

### Ejemplo mental inseguro

1. request A lee una orden en estado `PENDING`
2. request B lee la misma orden en estado `PENDING`
3. A decide cancelarla
4. B decide cobrarla
5. ambas continúan usando una foto vieja del estado

El problema no es que cada request individual esté “mal programada”.

El problema es que el flujo completo asume un mundo secuencial que no existe.

---

## La forma más fácil de visualizarlo

Pensá una operación como tres pasos:

1. **leer**
2. **decidir**
3. **escribir**

Muchas race conditions viven justamente ahí.

### Patrón peligroso

- leo estado actual
- verifico una regla
- hago el cambio después

Si otra request modifica el mismo recurso entre la lectura y la escritura, la decisión ya nació vieja.

Por eso una pregunta muy útil es:

> ¿qué pasa si dos requests llegan con milisegundos de diferencia sobre el mismo recurso?

Si la respuesta es “las dos podrían pasar”, entonces hay riesgo real.

---

## Ejemplo típico: stock

Supongamos que un producto tiene stock `1`.

Dos usuarios compran al mismo tiempo.

### Flujo ingenuo

```java
Product product = productRepository.findById(productId)
    .orElseThrow();

if (product.getStock() <= 0) {
    throw new BusinessException("Sin stock");
}

product.setStock(product.getStock() - 1);
productRepository.save(product);
```

A simple vista parece correcto.

Pero si dos requests leen `stock = 1` casi al mismo tiempo, ambas podrían pasar el `if` y ambas podrían decrementar.

Resultado posible:

- se vendieron 2 unidades
- había solo 1
- el negocio quedó inconsistente

---

## Ejemplo típico: cupón de un solo uso

```java
Coupon coupon = couponRepository.findByCode(code)
    .orElseThrow();

if (coupon.isUsed()) {
    throw new BusinessException("Cupón ya utilizado");
}

coupon.setUsed(true);
couponRepository.save(coupon);
```

Otra vez:

- request A lee `used = false`
- request B lee `used = false`
- las dos lo marcan como usado
- ambas obtienen el beneficio

La regla decía “una sola vez”.
El flujo real permitió dos.

---

## Ejemplo típico: transición de estado

Supongamos una orden que solo puede pasar de `PENDING` a `PAID` o de `PENDING` a `CANCELLED`, pero no ambas.

### Riesgo

- una request intenta pagar
- otra intenta cancelar
- las dos revisan el mismo estado inicial
- ambas creen que la transición es válida

Sin control adecuado, el sistema puede terminar con:

- eventos duplicados
- acciones incompatibles ejecutadas
- historial incoherente
- side effects externos conflictivos

Y esto es todavía peor si además se envían:

- emails
- webhooks
- movimientos contables
- liberación o reserva de stock

---

## No es solo un problema técnico: es abuso funcional

Este tema también toca seguridad.

Porque un actor malicioso puede intentar provocar la carrera a propósito.

### Ejemplos
- enviar muchas veces la misma operación crítica
- automatizar requests concurrentes
- abrir varias pestañas o clientes
- repetir un submit en el instante justo
- explotar un endpoint que valida y luego actualiza tarde

En otras palabras:

> una race condition no siempre es solo “mala suerte de concurrencia”.  
> A veces es una superficie de abuso del negocio.

---

## Dónde suelen aparecer más

Conviene sospechar race conditions especialmente en operaciones que:

- mueven dinero
- consumen stock
- usan cupones o beneficios únicos
- cambian estados importantes
- reservan turnos, asientos o recursos limitados
- procesan retiros, reembolsos o cancelaciones
- confirman o aprueban acciones sensibles
- emiten tokens, códigos o enlaces de un solo uso
- ejecutan side effects externos

Cuanto más irreversible o costosa es la acción, más importa resistir concurrencia.

---

## Señal de alarma muy útil

Prestá atención a flujos con esta forma:

- buscar entidad
- verificar condición
- modificar entidad
- guardar

Ese patrón no siempre está mal.

Pero si la condición y la modificación dependen de que nadie más cambie el estado entre medio, ya hay una señal de alarma.

### Pregunta sana

> ¿la regla del negocio se hace cumplir incluso si llegan dos requests al mismo tiempo?

Si la respuesta es “depende del timing”, entonces todavía no está bien resuelta.

---

## Lo que NO alcanza

Hay varias cosas que la gente cree que resuelven el problema, pero no siempre lo hacen.

### 1. “Está dentro de un service”
Eso organiza el código, pero no impide concurrencia.

### 2. “Está dentro de una transacción”
Ayuda a muchas cosas, pero no convierte mágicamente cualquier flujo en seguro frente a carreras.

### 3. “El frontend deshabilita el botón”
Eso mejora UX, no protege la regla del negocio.

### 4. “Casi nunca pasa”
En seguridad y negocio crítico, una vez puede alcanzar para causar daño.

### 5. “Después lo corregimos manualmente”
Eso ya significa que el sistema permitió un estado incorrecto.

---

## Cómo pensar mejor estas operaciones

La idea general no es “hacer todo más complejo”, sino diseñar la operación para que la regla importante quede protegida también bajo concurrencia.

Hay varias familias de enfoques.

---

## 1. Hacer la validación y el cambio lo más atómicos posible

Cuanto más separados estén el chequeo y la escritura, más ventana hay para la carrera.

La idea sana es reducir esa ventana.

### En vez de pensar
- leo
- valido
- más tarde escribo

### Conviene pensar
- intento aplicar el cambio solo si el estado todavía cumple la condición esperada

Eso acerca la regla al momento real de la modificación.

---

## 2. Basar la actualización en el estado esperado

Una forma muy útil de pensar es esta:

> no actualices “porque antes viste que se podía”.  
> Actualizá solo si en este instante todavía sigue pudiéndose.

### Ejemplo conceptual

En lugar de:

- leer orden
- ver que está `PENDING`
- luego guardarla como `CANCELLED`

conviene una estrategia donde la operación solo tenga éxito si la orden sigue en `PENDING` en el momento del cambio.

Eso reduce mucho el riesgo de que dos requests válidas según una foto vieja terminen rompiendo la regla.

---

## 3. Detectar que alguien más cambió el recurso

A veces no se trata de bloquear, sino de detectar conflicto.

Por ejemplo:

- alguien leyó una versión vieja
- otra request cambió el recurso
- cuando intentás guardar, el sistema detecta que tu foto ya no es actual

Entonces la operación puede fallar de forma controlada y obligar a reintentar o refrescar.

La idea útil es:

- mejor rechazar con conflicto
- que aceptar silenciosamente una decisión tomada sobre estado viejo

---

## 4. Serializar operaciones críticas cuando haga falta

En ciertas operaciones muy sensibles, tiene sentido impedir que dos ejecuciones compitan al mismo tiempo sobre el mismo recurso.

Esto puede agregar fricción o costo, pero a veces es exactamente lo correcto.

### Casos típicos
- movimientos de dinero
- consumo de saldo
- reserva de recursos escasos
- cambios de estado irreversibles

La pregunta no es “cómo evitar toda espera”.
La pregunta es “qué costo es aceptable para proteger esta regla”.

---

## 5. Diseñar side effects con mucha prudencia

Aunque resuelvas bien el estado interno, todavía puede haber problemas si la operación dispara efectos externos.

### Ejemplos
- enviar dos emails de confirmación
- emitir dos facturas
- disparar dos webhooks
- crear dos pagos en un proveedor externo

Por eso conviene pensar siempre dos cosas:

- consistencia del estado local
- repetición o duplicación de efectos externos

Muchas veces la carrera no se nota en la entidad, sino en los efectos colaterales.

---

## Ejemplo conceptual inseguro

```java
@Transactional
public void applyCoupon(String code, Long orderId) {
    Coupon coupon = couponRepository.findByCode(code)
        .orElseThrow();

    if (coupon.isUsed()) {
        throw new BusinessException("Cupón ya utilizado");
    }

    Order order = orderRepository.findById(orderId)
        .orElseThrow();

    order.applyDiscount(coupon.getAmount());
    coupon.setUsed(true);
}
```

Aunque tenga `@Transactional`, sigue existiendo una pregunta clave:

- ¿qué pasa si dos ejecuciones concurrentes ven el cupón todavía sin usar?

La transacción no reemplaza la necesidad de pensar la regla bajo concurrencia.

---

## Ejemplo conceptual más sano

Sin entrar todavía en detalles avanzados de implementación, una versión más madura del diseño pensaría así:

- el cupón solo debe marcarse como usado si todavía sigue disponible en el instante del cambio
- si otra request ya lo consumió, esta debe fallar de forma controlada
- la orden no debe recibir el descuento dos veces
- cualquier side effect externo debe tolerar repetición o estar protegido contra duplicados

Lo importante acá no es memorizar una API concreta.
Lo importante es cambiar el modelo mental.

---

## Qué preguntas conviene hacer cuando revisás un endpoint

Si estás revisando una operación crítica, preguntate:

- ¿dos requests simultáneas podrían pasar la misma validación?
- ¿la regla depende de un estado leído antes?
- ¿qué pasa si el estado cambia entre lectura y escritura?
- ¿la operación debe ocurrir una sola vez o puede repetirse?
- ¿qué side effects externos dispara?
- ¿un atacante podría forzar concurrencia a propósito?
- ¿el sistema detecta conflicto o lo pisa silenciosamente?
- ¿el negocio tolera inconsistencia temporal o no?

Esas preguntas suelen exponer el problema antes de que aparezca en producción.

---

## Race condition y transacciones: cómo pensar la relación

Las transacciones importan muchísimo.

Pero este es un buen punto mental:

> una transacción protege atomicidad de una unidad de trabajo.  
> No reemplaza automáticamente el diseño correcto de la regla concurrente.

Podés tener una operación transaccional y aun así seguir teniendo una carrera si dos transacciones compiten y ambas pasan validaciones que dependían del mismo estado inicial.

Por eso no conviene pensar:

- “tiene `@Transactional`, entonces ya está”

Conviene pensar:

- “¿qué garantía concreta necesito cuando dos operaciones compiten?”

---

## Race condition y autorización no son lo mismo, pero pueden mezclarse

A veces una carrera también abre problemas de autorización o de control del proceso.

### Ejemplos
- un usuario ejecuta dos veces una acción que debía requerir revisión intermedia
- un operador cambia un estado mientras otro ya tomó decisiones sobre ese mismo recurso
- una aprobación se basa en información que cambió recién después

No siempre termina en acceso indebido clásico.
A veces termina en una operación válida desde permisos, pero inválida desde estado o proceso.

---

## Cómo se ve desde afuera

Las race conditions suelen dejar síntomas como estos:

- descuentos aplicados dos veces
- pagos duplicados
- stock negativo
- estados imposibles
- órdenes canceladas y pagadas a la vez
- varios emails contradictorios
- auditorías difíciles de explicar
- bugs “que no se reproducen siempre”

Cuando aparece algo así, no conviene quedarse solo con la explicación de “hubo un error raro”.

Muy seguido el problema real es:

- regla correcta en secuencia
- regla incorrecta bajo concurrencia

---

## Qué señales de código merecen atención especial

Prestá atención extra si ves patrones como:

- `findById()` y luego decisión crítica basada en el resultado
- chequeos de `status`, `used`, `active`, `stock`, `balance` antes de actualizar
- efectos externos disparados después de una validación simple
- ausencia de control de repetición en operaciones costosas
- endpoints críticos sin diseño para conflicto o reintento
- confianza en que “el usuario no va a hacer clic dos veces”

Nada de eso prueba por sí solo una race condition.
Pero sí marca lugares donde vale la pena pensar más profundo.

---

## Qué gana el backend si resuelve bien este problema

Cuando una operación crítica está mejor diseñada frente a concurrencia, el backend gana:

- menos estados inconsistentes
- menos duplicados
- menos fraude o abuso funcional
- menos soporte manual
- menos side effects contradictorios
- más previsibilidad operativa
- mejor trazabilidad cuando hay conflicto real

No es solo una mejora técnica.
Es protección del negocio.

---

## Señales de diseño más sano

Una implementación más madura suele mostrar:

- reglas de negocio pensadas bajo concurrencia
- operaciones críticas con protección explícita
- detección clara de conflictos
- menor ventana entre chequeo y cambio
- side effects externos tratados con prudencia
- rechazo controlado cuando el estado ya cambió
- menos dependencia del “timing afortunado”

---

## Señales de ruido

Estas frases suelen ser mala señal:

- “en realidad casi nunca llegan dos requests juntas”
- “el botón se deshabilita después del primer clic”
- “si pasa dos veces lo arreglamos en base”
- “con `@Transactional` debería bastar”
- “primero revisamos, después actualizamos, siempre funcionó”
- “no creo que alguien lo automatice”

Cuando una operación crítica depende de esas esperanzas, merece revisión.

---

## Checklist práctico

Cuando revises una operación crítica en una app Spring, preguntate:

- ¿qué recurso comparten las requests concurrentes?
- ¿qué regla del negocio no debe romperse nunca?
- ¿dos requests podrían ver el mismo estado inicial?
- ¿la validación está separada de la escritura?
- ¿qué pasa si el estado cambia entre medio?
- ¿la operación debe ejecutarse una sola vez?
- ¿hay efectos externos duplicables?
- ¿el sistema detecta conflicto o deja que ambos avancen?
- ¿un atacante podría explotar la carrera a propósito?
- ¿el negocio tolera ese fallo o sería grave?

---

## Mini ejercicio de reflexión

Tomá una operación real de tu proyecto, por ejemplo:

- pagar una orden
- aplicar un cupón
- reservar stock
- cancelar una suscripción
- aprobar un retiro

Y respondé:

1. ¿Qué condición tiene que seguir siendo verdadera en el instante exacto del cambio?
2. ¿Qué pasa si dos requests llegan al mismo tiempo?
3. ¿Cuál sería el peor resultado si ambas avanzan?
4. ¿La operación debería ser única, bloqueante o reintentable?
5. ¿Qué efectos externos podrían duplicarse?
6. ¿El sistema hoy detecta conflicto real o asume que no habrá competencia?
7. ¿Qué parte del flujo depende demasiado del timing?

Ese ejercicio ayuda mucho a encontrar carreras que en lectura superficial no se ven.

---

## Resumen

Una race condition aparece cuando una operación depende de una foto del estado que puede quedar vieja antes de actuar.

En backend real, esto importa muchísimo en operaciones críticas porque puede romper reglas como:

- una sola vez
- stock no negativo
- transición válida de estado
- pago o cancelación exclusivos
- consumo único de un recurso

En resumen:

> una operación crítica no está bien resuelta solo porque valida antes de guardar.  
> Está mejor resuelta cuando la regla importante sigue siendo cierta incluso si otra request compite al mismo tiempo.

---

## Próximo tema

**Doble submit y repetición de requests**
