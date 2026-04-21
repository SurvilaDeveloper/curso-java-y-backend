---
title: "Introduciendo una primera capa de correlation id entre gateway y servicios en NovaMarket"
description: "Primer paso práctico del módulo 12. Incorporación de una primera capa de correlation id para poder seguir una misma request entre el gateway y los servicios de NovaMarket."
order: 126
module: "Módulo 12 · Observabilidad"
level: "intermedio"
draft: false
---

# Introduciendo una primera capa de correlation id entre gateway y servicios en NovaMarket

En la clase anterior dejamos algo bastante claro:

- NovaMarket ya tiene suficiente complejidad distribuida como para necesitar observabilidad,
- mirar logs sueltos ya empieza a quedarse corto,
- y el siguiente paso lógico no es todavía una herramienta enorme, sino una primera forma clara de seguir una misma request a través del sistema.

Ahora toca el paso concreto:

**introducir una primera capa de correlation id entre gateway y servicios en NovaMarket.**

Ese es el objetivo de esta clase.

Porque una cosa es tener:

- logs en gateway,
- logs en `order-service`,
- logs en `inventory-service`.

Y otra bastante distinta es poder decir:

- “todos estos mensajes pertenecen a la misma request”.

Ese es exactamente el primer gran valor que vamos a construir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mucho más clara la idea de correlation id,
- agregado un primer identificador de correlación a las requests que atraviesan el sistema,
- visible cómo ese identificador puede propagarse entre gateway y servicios,
- y NovaMarket mejor preparado para seguir profundizando observabilidad después.

La meta de hoy no es todavía instalar un stack completo de trazas distribuidas.  
La meta es mucho más concreta: **darle al sistema una primera forma explícita y visible de seguir el hilo de una misma request entre varias piezas**.

---

## Estado de partida

Partimos de un sistema donde ya:

- el gateway enruta tráfico real,
- varias requests atraviesan más de un servicio,
- la seguridad y la resiliencia ya generan eventos importantes,
- y el módulo ya dejó claro que ahora necesitamos una forma mejor de leer ese comportamiento distribuido.

Eso significa que el problema ya no es “tener información”.  
Ahora la pregunta útil es otra:

- **cómo relacionamos la información dispersa de varias piezas cuando todas pertenecen a la misma operación**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- introducir la idea de correlation id,
- hacer que el gateway asigne o reenvíe un identificador,
- propagarlo hacia servicios internos,
- y dejar visible cómo una misma request empieza a ser reconocible a través del sistema.

---

## Qué es un correlation id en este contexto

Para esta etapa del curso, una forma útil de pensarlo es esta:

**un correlation id es un identificador que acompaña una request para permitir relacionar entre sí los eventos que esa misma request genera en distintas piezas del sistema.**

Esa idea es central.

No representa al usuario.  
No reemplaza a autenticación.  
No es un id de negocio.

Representa otra cosa:

- el hilo técnico de una misma operación mientras atraviesa el sistema distribuido.

Ese matiz importa muchísimo.

---

## Por qué conviene empezar por el gateway

A esta altura del bloque, el mejor primer lugar para introducir este patrón suele ser:

- `api-gateway`

¿Por qué?

Porque:

- es el punto de entrada,
- ve primero la request,
- y puede asignar o reenviar el correlation id antes de que la operación se distribuya hacia otros servicios.

Eso vuelve al gateway el lugar más natural para inaugurar esta primera capa de observabilidad.

---

## Paso 1 · Elegir un header para el correlation id

Una opción muy razonable y muy clara puede ser trabajar con un header como:

```txt
X-Correlation-Id
```

No hace falta todavía una discusión gigante sobre convenciones más avanzadas.

La meta es algo mucho más concreta:

- tener un identificador visible,
- fácil de leer,
- y fácil de propagar en el laboratorio.

Ese criterio es muy sano para el primer paso práctico del bloque.

---

## Paso 2 · Hacer que el gateway lo genere si no existe

A esta altura del curso, una opción muy didáctica puede ser crear un filtro en `api-gateway` que:

- lea el header `X-Correlation-Id`
- si no existe, genere uno nuevo
- y lo agregue a la request antes de seguir el flujo

Conceptualmente, la idea es algo así:

```java
String correlationId = request.getHeaders().getFirst("X-Correlation-Id");
if (correlationId == null || correlationId.isBlank()) {
    correlationId = UUID.randomUUID().toString();
}
```

No hace falta todavía cerrar toda la implementación exacta.

La idea central es otra:

- cada request que entra al sistema ya puede quedar identificada de una forma explícita.

Eso es uno de los corazones prácticos de toda la clase.

---

## Paso 3 · Reenviar el header hacia servicios internos

Este punto importa muchísimo.

Generar el correlation id en el gateway no alcanza por sí solo.

Lo importante es que ese identificador viaje hacia los servicios a los que se enruta la request.

Entonces el gateway debería reenviar el header para que:

- `order-service`
- `inventory-service`
- y otras piezas futuras

puedan verlo también.

Ese paso es justamente el que convierte la idea en una primera capa real de trazabilidad distribuida.

---

## Paso 4 · Dejar visible el id en logs o respuestas de prueba

Para esta etapa del curso, una muy buena decisión suele ser hacer algo muy simple y observable:

- loggear el `X-Correlation-Id`
- o devolverlo temporalmente en alguna respuesta de prueba

No hace falta todavía una plataforma de observabilidad completa.

La meta es otra:

- comprobar que el mismo identificador ya puede verse en más de una pieza del sistema.

Ese contraste vale muchísimo.

---

## Paso 5 · Pensar cómo probarlo

Ahora podés hacer algo como:

```bash
curl -i http://localhost:8080/order-api/orders
```

y también probar enviando tú mismo un header:

```bash
curl -i http://localhost:8080/order-api/orders \
  -H "X-Correlation-Id: demo-123"
```

Lo importante es observar que:

- si no existe, el sistema puede generarlo,
- y si existe, el sistema puede conservarlo y seguirlo.

Ese comportamiento es central para una primera capa de observabilidad útil.

---

## Paso 6 · Entender qué acabamos de ganar

Este punto importa muchísimo.

Hasta ahora, una misma request podía generar eventos en varias piezas del sistema, pero era mucho más difícil unirlos.

Ahora, en cambio, ya existe una primera forma explícita de decir:

- “estos logs, estas trazas simples o estos eventos pertenecen a la misma operación”.

Ese salto cambia muchísimo la legibilidad del sistema.

---

## Paso 7 · Entender por qué este paso es tan importante aunque todavía no usemos Zipkin

A primera vista, puede parecer un paso pequeño.

Pero en realidad vale muchísimo porque inaugura una idea central del bloque de observabilidad:

- una request distribuida necesita un hilo que la una a través de distintas piezas.

Ese valor sigue siendo enorme incluso antes de herramientas más grandes.

---

## Paso 8 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya tiene trazabilidad distribuida completa”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene una primera capa real de correlation id entre gateway y servicios.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase introduce una primera capa de correlation id entre gateway y servicios en NovaMarket.

Ya no estamos solo abriendo el bloque de observabilidad.  
Ahora también estamos haciendo que una misma request empiece a dejar un hilo reconocible a través del sistema distribuido.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- consolidamos todavía este subbloque con un checkpoint fuerte,
- ni abrimos aún trazabilidad más rica o herramientas más grandes del bloque de observabilidad.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dar el primer paso real para que NovaMarket pueda seguir mejor una misma request a través de varias piezas del sistema.**

---

## Errores comunes en esta etapa

### 1. Confundir correlation id con id de usuario o id de negocio
Cumple otro rol completamente distinto.

### 2. Generarlo en el gateway pero no propagarlo
Entonces perdemos el valor distribuido del patrón.

### 3. Querer abrir herramientas grandes sin esta base mínima
Este paso mejora muchísimo la comprensión del resto del bloque.

### 4. No probar requests con y sin header existente
La comparación aporta mucho valor.

### 5. Pensar que esto solo sirve para logs
También ordena muchísimo la lectura general del comportamiento distribuido.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- el sistema ya cuenta con un `X-Correlation-Id`,
- ese id puede generarse o preservarse en el gateway,
- y NovaMarket ya dio un primer paso serio hacia una observabilidad distribuida más útil y mucho más legible.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué representa el correlation id,
- ves que puede viajar entre piezas del sistema,
- entendés por qué mejora la lectura del comportamiento distribuido,
- y sentís que NovaMarket ya empezó a ganar una primera capa real de trazabilidad básica.

Si eso está bien, ya podemos pasar al siguiente tema y consolidar esta nueva capa del bloque de observabilidad.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta primera capa de correlation id antes de decidir si seguimos con trazabilidad más rica o si abrimos el siguiente subtramo del bloque de observabilidad.

---

## Cierre

En esta clase introdujimos una primera capa de correlation id entre gateway y servicios en NovaMarket.

Con eso, el proyecto deja de observar sus requests distribuidas como eventos sueltos difíciles de relacionar y empieza a sostener una forma mucho más clara, mucho más útil y mucho más madura de seguir el hilo de una operación a través del sistema.
