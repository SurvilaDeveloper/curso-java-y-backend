---
title: "Entendiendo por qué una primera capa de trazabilidad visible ya tiene sentido en api-gateway"
description: "Inicio del siguiente tramo del módulo 6. Comprensión de por qué, después de tener rutas, balanceo y filtros básicos, ya conviene empezar a trabajar una primera capa de trazabilidad visible en el gateway."
order: 49
module: "Módulo 6 · API Gateway"
level: "intermedio"
draft: false
---

# Entendiendo por qué una primera capa de trazabilidad visible ya tiene sentido en `api-gateway`

En la clase anterior cerramos el primer subbloque de filtros con una idea bastante fuerte:

- `api-gateway` ya no solo enruta,
- tampoco solo balancea,
- y ya no solo deja pasar tráfico de forma pasiva,
- sino que además empieza a intervenir en requests y responses con una primera capa de comportamiento transversal y específico.

Eso ya tiene muchísimo valor.

Pero ahora aparece otra pregunta muy natural:

**si el gateway ya participa activamente del tráfico, cuándo empieza a tener sentido usarlo también para dejar una primera capa de trazabilidad visible?**

Ese es el terreno de esta clase.

Porque una cosa es tener:

- rutas correctas,
- balanceo visible,
- y filtros básicos funcionando.

Y otra bastante distinta es empezar a preguntarse:

- cómo identificamos mejor una request,
- cómo dejamos una huella visible de su recorrido,
- cómo conectamos mejor request, logs y response,
- y cómo hacemos que el borde del sistema ya no sea solo el lugar donde “entra” el tráfico, sino también donde empieza a volverse más observable.

Ese es exactamente el tipo de problema que vamos a abrir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- claro por qué una primera capa de trazabilidad visible ya tiene sentido en el gateway,
- entendida la diferencia entre un filtro decorativo y una mejora real de observabilidad básica,
- alineado el modelo mental para empezar a identificar requests con más claridad,
- y preparado el terreno para aplicar una primera mejora concreta y visible en la próxima clase.

Todavía no vamos a construir trazabilidad distribuida completa.  
La meta de hoy es entender por qué este nuevo frente aparece exactamente ahora.

---

## Estado de partida

Partimos de un sistema donde ya:

- `api-gateway` existe y enruta correctamente,
- discovery y balanceo ya están bien integrados,
- existe una primera capa de filtros globales y por ruta,
- y el punto de entrada ya dejó de ser una pieza puramente pasiva.

Eso significa que el problema ya no es solo:

- “cómo entra la request”
- o
- “a qué servicio se enruta”

Ahora empieza a importar otra pregunta:

- **cómo hacemos más visible e identificable a esa request mientras atraviesa el gateway**

Y esa pregunta mejora mucho el nivel del módulo.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué entendemos por trazabilidad visible en esta etapa,
- entender por qué encaja naturalmente después del bloque de filtros,
- conectar esta idea con el estado actual de NovaMarket,
- y dejar clara la lógica del siguiente subtramo del gateway.

---

## Qué problema queremos resolver exactamente

Hasta ahora, el gateway ya nos permitió hacer cosas muy valiosas:

- centralizar la entrada,
- enrutar por nombre lógico,
- repartir tráfico entre instancias,
- y aplicar comportamiento global o por ruta.

Eso fue un gran salto.

Pero a medida que el gateway madura, aparece otra necesidad:

**que una request deje de ser solo “algo que pasó” y empiece a ser algo más fácil de reconocer, seguir y relacionar con logs y respuestas.**

Porque ahora conviene hacerse preguntas como:

- ¿cómo sé que esta response corresponde a esta request concreta?
- ¿cómo dejo una señal visible de identificación?
- ¿cómo hago que el paso por el gateway ya aporte una mínima observabilidad útil?
- ¿cómo preparo el sistema para trazabilidad más seria sin saltar todavía a una solución muy compleja?

Ese cambio de enfoque es justamente el corazón de esta etapa.

---

## Qué significa “trazabilidad visible” en este contexto

Para este punto del curso, una forma útil de pensarlo es esta:

**trazabilidad visible significa dejar una marca simple, clara y observable que permita identificar mejor una request mientras atraviesa el gateway.**

No estamos hablando todavía de una solución completa de tracing distribuido.

Estamos hablando de algo mucho más razonable y útil para el estado actual de NovaMarket:

- un identificador visible,
- una marca clara,
- y una relación más fuerte entre request, logs y response.

Ese cambio ya aporta muchísimo valor.

---

## Por qué esto viene después del bloque de filtros

Este punto importa muchísimo.

Si todavía no hubiéramos trabajado filtros, esta etapa se sentiría forzada.

¿Por qué?

Porque primero convenía demostrar que el gateway ya puede:

- observar tráfico,
- modificarlo,
- y actuar transversalmente.

Una vez que eso ya existe, aparece otra posibilidad natural:

- usar esa capacidad para dejar una huella más útil del recorrido de la request.

Ese orden es muy sano y hace que la evolución del módulo tenga muchísima más coherencia.

---

## Qué tipo de primer paso tiene sentido acá

A esta altura del módulo no hace falta arrancar con algo gigantesco.

De hecho, conviene muchísimo empezar por una mejora simple y muy visible.

Una gran opción es algo como esto:

- generar o propagar un identificador de request,
- y devolverlo también en un header visible de la response.

Eso tiene varias ventajas:

- es fácil de ver,
- es fácil de probar,
- conecta muy bien con logs,
- y deja clarísimo que el gateway ya no solo enruta, sino que también ayuda a identificar mejor el tráfico.

Ese tipo de primer paso encaja perfecto con el punto donde está NovaMarket ahora.

---

## Qué gana NovaMarket con una primera marca visible por request

Aunque parezca una mejora pequeña, el valor es enorme.

Porque en cuanto una request tiene una marca visible, ya empezás a poder pensar mejor cosas como:

- “este log pertenece a esta llamada”
- “esta respuesta salió de esta entrada”
- “esta request atravesó el gateway con este identificador”

Ese tipo de claridad, incluso en una capa muy básica, mejora muchísimo la forma de leer el sistema.

---

## Qué todavía no estamos haciendo en esta etapa

Conviene dejar esto muy claro.

En este punto todavía no estamos:

- integrando OpenTelemetry,
- ni montando trazabilidad distribuida completa,
- ni propagando contexto de tracing a todo el sistema,
- ni cerrando una estrategia final de observabilidad del gateway.

La meta actual es mucho más concreta:

**empezar una primera capa visible de identificación del tráfico en `api-gateway`.**

Y eso ya aporta muchísimo valor.

---

## Qué estamos logrando con esta clase

Esta clase no aplica todavía una mejora concreta, pero hace algo muy importante:

**abre explícitamente el siguiente frente lógico del gateway: una primera capa de trazabilidad visible.**

Eso importa muchísimo, porque el gateway deja de madurar solo desde el ruteo y los filtros básicos y empieza a prepararse para una función todavía más rica: volver el tráfico más identificable y más observable.

---

## Qué todavía no hicimos

Todavía no:

- elegimos el mecanismo concreto,
- ni aplicamos todavía una primera mejora real de trazabilidad visible sobre requests y responses.

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender por qué una primera capa de trazabilidad visible ya tiene sentido en `api-gateway`.**

---

## Errores comunes en esta etapa

### 1. Pensar que la trazabilidad solo tiene sentido cuando ya existe tracing distribuido completo
Incluso una primera capa simple ya aporta mucho valor.

### 2. Confundir una marca visible con una solución final de observabilidad
Este paso es inicial, no definitivo.

### 3. Abrir este frente demasiado pronto
Antes del bloque de filtros, esto se habría sentido prematuro.

### 4. Elegir una primera mejora demasiado compleja
En esta etapa, lo simple y visible vale muchísimo más.

### 5. No ver el valor de conectar request, logs y response
Ese puente es justamente el corazón del paso que viene.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener claro por qué NovaMarket ya está listo para empezar a trabajar una primera capa de trazabilidad visible desde el gateway y por qué ese paso aparece ahora como siguiente evolución natural del módulo.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés que el gateway ya no es solo un enroutador,
- ves por qué una request identificable agrega valor,
- entendés que no hace falta arrancar por una solución complejísima,
- y sentís que el módulo ya está listo para una primera mejora concreta y visible de trazabilidad.

Si eso está bien, ya podemos pasar a aplicarla en `api-gateway`.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a aplicar una primera mejora concreta de trazabilidad visible en `api-gateway`, agregando un identificador de request que pueda verse en logs y en la response.

---

## Cierre

En esta clase entendimos por qué una primera capa de trazabilidad visible ya tiene sentido en `api-gateway`.

Con eso, NovaMarket deja de madurar solo desde rutas, balanceo y filtros básicos y empieza a prepararse para otra mejora muy valiosa: volver el tráfico del borde del sistema más identificable, más observable y más fácil de leer.
