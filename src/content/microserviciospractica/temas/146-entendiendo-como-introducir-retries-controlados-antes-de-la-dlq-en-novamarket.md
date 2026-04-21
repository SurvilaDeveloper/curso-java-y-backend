---
title: "Entendiendo cómo introducir retries controlados antes de la DLQ en NovaMarket"
description: "Siguiente paso del módulo 13. Comprensión de cómo y por qué introducir retries controlados del lado consumidor antes de enviar definitivamente un mensaje a la dead letter queue."
order: 146
module: "Módulo 13 · Comunicación asíncrona y eventos"
level: "intermedio"
draft: false
---

# Entendiendo cómo introducir retries controlados antes de la DLQ en NovaMarket

En la clase anterior cerramos una primera capa muy importante de robustez en mensajería:

- ya existe un flujo real `OrderCreated`,
- ya existe una DLQ para separar mensajes problemáticos,
- y NovaMarket ya dejó de tratar el fallo del lado consumidor como algo completamente difuso.

Eso ya tiene muchísimo valor.

Pero ahora aparece una pregunta muy natural:

**todos los mensajes que fallan deberían ir directamente a la DLQ o a veces conviene intentar procesarlos otra vez antes de apartarlos del flujo principal?**

Ese es el terreno de esta clase.

Porque una cosa es decir:

- “si falla, lo saco del flujo principal”.

Y otra bastante distinta es decidir:

- “antes de apartarlo definitivamente, quizá una o pocas oportunidades extra tengan sentido si el fallo parece transitorio”.

Ese es exactamente el siguiente problema que conviene abrir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- claro por qué los retries controlados ya tienen sentido después del primer flujo real y la primera DLQ,
- entendida la diferencia entre un fallo transitorio y un mensaje persistentemente problemático,
- alineado el modelo mental para introducir reintentos antes del desvío final,
- y preparado el terreno para aplicar una primera capa concreta de retries en la próxima clase.

La meta de hoy no es todavía diseñar toda la política definitiva de confiabilidad del broker.  
La meta es mucho más concreta: **entender cuándo conviene intentar otra vez y cuándo ya no tiene sentido seguir insistiendo antes de mandar el mensaje a la DLQ**.

---

## Estado de partida

Partimos de un sistema donde ya:

- `order-service` publica `OrderCreated`,
- `notification-service` lo consume,
- y además existe una DLQ para casos que el flujo principal no puede manejar correctamente.

Eso significa que el problema ya no es cómo aislar mensajes claramente problemáticos.  
Ahora la pregunta útil es otra:

- **si todos los fallos ameritan desvío inmediato o si algunos merecen un nuevo intento controlado**

Y eso es exactamente lo que vamos a resolver en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar por qué no todos los fallos del lado consumidor son iguales,
- entender qué tipo de errores justifican retry,
- entender cómo se relaciona esto con la DLQ,
- y dejar clara la lógica del siguiente paso práctico del bloque.

---

## Qué problema queremos resolver exactamente

Hasta ahora ya logramos algo importante:

- el sistema ya puede separar mensajes problemáticos en una cola especial.

Eso fue un gran salto.

Pero a medida que el bloque madura, aparece otra necesidad muy concreta:

**que el sistema no trate como “irrecuperable” a todo mensaje que falle una sola vez si el problema era pequeño, puntual o transitorio.**

Porque ahora conviene hacerse preguntas como:

- ¿qué pasa si el consumidor falló por algo momentáneo?
- ¿tiene sentido reintentar una vez?
- ¿cuántas veces?
- ¿qué errores ameritan retry y cuáles no?
- ¿cómo evitamos tanto la rigidez excesiva como la insistencia ciega?

Ese cambio de enfoque es justamente el corazón de esta etapa.

---

## Qué significa retry en este contexto

Para esta etapa del curso, una forma útil de pensarlo es esta:

**retry significa volver a intentar procesar un mensaje una cantidad pequeña y controlada de veces antes de decidir que debe salir del flujo principal.**

Esa idea es central.

No estamos hablando de insistir sin límite.  
Estamos hablando de algo mucho más razonable:

- pocos intentos,
- bajo condiciones claras,
- y con la intención de tolerar fallos transitorios del lado consumidor o de sus dependencias.

Ese matiz importa muchísimo.

---

## Por qué retry y DLQ se complementan

Este punto vale muchísimo.

A esta altura del módulo conviene fijar algo importante:

### Retry
Da una oportunidad adicional a mensajes que podrían procesarse bien si el problema fue transitorio.

### DLQ
Se queda con los mensajes que ya no deberían seguir molestando al flujo principal después de cierto criterio de fallo.

Eso significa que no compiten entre sí.  
Se complementan.

Primero el sistema intenta recuperarse.  
Si no lo logra, aparta el caso problemático.

Ese puente es uno de los corazones del bloque.

---

## Qué tipo de fallos podrían justificar retry

A esta altura del curso, retries controlados pueden tener sentido cuando pensamos en situaciones como:

- un problema temporal de conectividad,
- una dependencia momentáneamente lenta o no disponible,
- un fallo breve del recurso que el consumidor usa,
- o una perturbación puntual que no implica que el mensaje en sí sea venenoso.

No hace falta todavía cerrar una taxonomía final de errores.

Lo importante es ver que:

- **no todo fallo amerita el mismo tratamiento**.

Ese criterio vuelve muchísimo más madura a la arquitectura.

---

## Qué tipo de fallos no deberían reintentarse ciegamente

Este punto importa muchísimo.

Si el problema es algo como:

- payload inválido,
- formato imposible de procesar,
- datos estructuralmente corruptos,
- o una condición del mensaje que jamás va a mejorar con un nuevo intento,

entonces retry no ayuda.

En esos casos, insistir puede incluso empeorar el sistema.

Ese matiz es exactamente lo que vuelve valioso combinar retry con DLQ y no usar uno u otro de forma aislada.

---

## Cómo se traduce esto a NovaMarket

A esta altura del proyecto, el escenario sigue siendo muy claro:

- `order-service` publica `OrderCreated`
- `notification-service` consume

La nueva pregunta ahora es:

- si `notification-service` falla al procesar el evento, ¿lo mando directo a la DLQ o le doy una o pocas oportunidades extra antes de apartarlo?

Esa pregunta ya no es teórica.  
Está directamente conectada con el primer flujo real del módulo.

---

## Qué gana NovaMarket con este cambio

Aunque todavía no lo apliquemos en esta clase, el valor ya se puede ver con claridad.

A partir de retries controlados antes de la DLQ, NovaMarket puede ganar cosas como:

- mejor tolerancia frente a fallos puntuales del consumidor,
- menos rigidez frente a errores transitorios,
- mejor separación entre mensajes recuperables y mensajes persistemente problemáticos,
- y una arquitectura bastante más madura para mensajería robusta.

Eso vuelve al proyecto muchísimo más serio desde el punto de vista de eventos.

---

## Por qué este paso aparece ahora y no antes

Esto también importa mucho.

Si todavía no tuviéramos:

- un primer flujo real,
- un consumidor real,
- y una primera DLQ

abrir retries habría quedado mucho más abstracto o menos útil.

Pero ahora el sistema ya tiene suficiente realidad como para que aparezca esta pregunta intermedia:

- **antes de mandar a la DLQ, conviene intentar una o pocas veces más?**

Ese orden es excelente.

---

## Qué todavía no estamos haciendo en esta etapa

Conviene dejar esto muy claro.

En este punto todavía no estamos:

- configurando todavía retries concretos,
- ni definiendo aún el mecanismo final exacto del broker o del consumidor,
- ni resolviendo todavía toda la política de redelivery.

La meta actual es mucho más concreta:

**abrir correctamente el subbloque de retries controlados antes del desvío final a la DLQ.**

Y eso ya aporta muchísimo valor.

---

## Qué estamos logrando con esta clase

Esta clase no agrega todavía retries concretos, pero hace algo muy importante:

**abre explícitamente el siguiente frente lógico del módulo 13: dejar de tratar todos los fallos del consumidor como equivalentes y empezar a introducir oportunidades controladas de recuperación antes del desvío final.**

Eso importa muchísimo, porque NovaMarket deja de madurar solo desde flujo feliz + DLQ y empieza a prepararse para otra mejora clave: distinguir mejor entre lo transitorio y lo persistentemente problemático.

---

## Qué todavía no hicimos

Todavía no:

- configuramos todavía la política concreta de retry,
- ni vimos todavía un mensaje recuperarse antes de ir a la DLQ.

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender cómo y por qué introducir retries controlados antes de la DLQ en NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Pensar que todo fallo debe ir directo a la DLQ
A veces un nuevo intento corto y controlado sí tiene sentido.

### 2. Reintentar indefinidamente sin criterio
Eso puede empeorar mucho el sistema.

### 3. Tratar igual un fallo transitorio y un payload irrecuperable
La arquitectura gana muchísimo cuando distingue esos casos.

### 4. Abrir este frente demasiado pronto
Sin un flujo real y sin DLQ previa, habría quedado menos claro.

### 5. No ver el valor del cambio
Este subbloque vuelve mucho más madura la robustez del consumo.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener claro cómo y por qué introducir retries controlados antes de la DLQ en NovaMarket y por qué este paso aparece ahora como siguiente evolución natural del bloque de mensajería robusta.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué problema nuevo abre el consumo real de mensajes fallidos,
- ves por qué retry y DLQ se complementan,
- entendés qué valor agrega distinguir errores recuperables de irrecuperables,
- y sentís que el proyecto ya está listo para una primera política concreta de retry antes del desvío final.

Si eso está bien, ya podemos pasar al siguiente tema y aplicar esa primera capa de retries controlados en NovaMarket.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a agregar una primera capa de retries controlados al consumo de `OrderCreated` antes del desvío final a la DLQ para que el sistema tolere mejor ciertos fallos transitorios.

---

## Cierre

En esta clase entendimos cómo y por qué introducir retries controlados antes de la DLQ en NovaMarket.

Con eso, el proyecto deja de tratar todo fallo del consumidor como definitivamente perdido después del primer intento y empieza a prepararse para otra mejora muy valiosa: una mensajería más robusta, más flexible y mucho más inteligente frente a errores transitorios.
