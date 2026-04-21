---
title: "Recorriendo y validando NovaMarket de punta a punta como sistema completo"
description: "Primer paso práctico del módulo 14. Recorrido y validación end-to-end de NovaMarket como plataforma integrada, desde la entrada por gateway hasta sus efectos síncronos y asíncronos."
order: 154
module: "Módulo 14 · Integración final y cierre operativo"
level: "intermedio"
draft: false
---

# Recorriendo y validando NovaMarket de punta a punta como sistema completo

En la clase anterior dejamos algo bastante claro:

- NovaMarket ya tiene suficientes bloques maduros como para dejar de leerse solo como una suma de módulos,
- el sistema ya merece una validación integrada de punta a punta,
- y antes de abrir Kubernetes conviene confirmar que lo construido ya funciona como una plataforma coherente y no solo como piezas técnicamente correctas pero aisladas.

Ahora toca el paso concreto:

**recorrer y validar NovaMarket de punta a punta como sistema completo.**

Ese es el objetivo de esta clase.

Porque una cosa es tener:

- gateway,
- seguridad,
- resiliencia,
- observabilidad,
- eventos.

Y otra bastante distinta es poder decir:

- “sé cómo entra una request real al sistema”
- “sé cómo atraviesa las piezas”
- “sé qué reacciones dispara”
- y “sé leer el conjunto como una arquitectura integrada y operativa”.

Ese es exactamente el primer gran valor práctico que vamos a construir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mucho más claro el recorrido integral de una operación real dentro de NovaMarket,
- validada la relación entre entrada, seguridad, servicios, observabilidad y eventos,
- visible el sistema como plataforma integrada y no solo como suma de módulos,
- y NovaMarket mejor preparado para cerrar su lectura operativa antes de abrir Kubernetes.

La meta de hoy no es todavía desplegar en cluster.  
La meta es mucho más concreta: **recorrer el sistema completo y validar que ya existe una arquitectura coherente de punta a punta**.

---

## Estado de partida

Partimos de un sistema donde ya:

- existe `api-gateway`,
- existe seguridad real con Keycloak,
- existen servicios de negocio conectados,
- existe resiliencia sobre flujos críticos,
- existe observabilidad distribuida,
- y además existen eventos reales del dominio con RabbitMQ.

Eso significa que el problema ya no es “qué hace cada pieza”.

Ahora la pregunta útil es otra:

- **cómo se ve una operación real cuando atraviesa todas las capas importantes del sistema**

Y eso es exactamente lo que vamos a convertir en algo visible en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir un recorrido funcional representativo del sistema,
- atravesarlo desde la entrada hasta sus efectos principales,
- mirar cómo intervienen las piezas que construimos,
- y validar que NovaMarket ya puede leerse como una plataforma completa.

---

## Qué recorrido conviene elegir primero

A esta altura del curso, el recorrido más natural sigue siendo el flujo central del proyecto:

- una operación vinculada a la creación de una orden,
- pasando por gateway,
- protegida por seguridad,
- con llamadas entre servicios,
- observable,
- y capaz de disparar una reacción asíncrona posterior.

¿Por qué este caso es tan bueno?

Porque concentra prácticamente todas las capas importantes del sistema sin volverse artificial.

Ese criterio mejora muchísimo el valor del bloque.

---

## Paso 1 · Entrar por el gateway como único borde del sistema

El recorrido debería empezar, como corresponde, por `api-gateway`.

Ese detalle importa muchísimo porque deja claro algo central del proyecto:

- NovaMarket ya no se piensa como varios servicios expuestos sin criterio,
- sino como un sistema donde el borde de entrada está ordenado y centralizado.

Ese punto ya dice muchísimo sobre la madurez de la arquitectura.

---

## Paso 2 · Confirmar qué papel juega la seguridad en el recorrido

A esta altura del sistema, no alcanza con que la request entre.

Ahora también importa ver:

- cómo participa Keycloak,
- cómo se valida identidad o autorización,
- y cómo el flujo ya no vive en un entorno “abierto” o ingenuo.

Ese paso es central porque muestra que el recorrido completo del sistema ya incluye seguridad real y no solamente lógica de negocio.

---

## Paso 3 · Observar el paso por servicios del dominio

Ahora conviene seguir el flujo hacia los servicios de negocio involucrados.

Por ejemplo:

- `order-service`
- y cualquier otra pieza que participe del caso de uso concreto, como `inventory-service`

Lo importante es leer el recorrido no como llamadas sueltas, sino como partes de una única operación de negocio distribuida.

Ese cambio de mirada es uno de los más importantes de toda la clase.

---

## Paso 4 · Observar cómo participa la resiliencia

Este punto vale muchísimo.

No hace falta forzar un fallo en esta clase para que el bloque tenga sentido.

Lo importante es poder señalar que este recorrido no atraviesa servicios “desnudos”, sino servicios que ya:

- tienen límites razonables de espera,
- tienen una primera postura frente a degradación,
- y ya no están completamente expuestos a un comportamiento ingenuo del lado distribuido.

Eso vuelve mucho más fuerte la lectura del sistema completo.

---

## Paso 5 · Observar cómo participa la observabilidad

A esta altura del bloque, ya no alcanza con decir “el flujo pasó por varios servicios”.

Ahora también importa poder decir:

- cómo seguimos el correlation id,
- cómo leemos logs correlacionados,
- y cómo Zipkin ayuda a ver el recorrido distribuido de una request real.

Ese paso es central porque muestra que NovaMarket ya no solo ejecuta el flujo: también puede observarlo razonablemente bien.

---

## Paso 6 · Observar cómo participa la mensajería

Ahora conviene mirar el otro costado del sistema:

- el hecho del dominio que se emite,
- el paso por RabbitMQ,
- y la reacción posterior en `notification-service`

Este punto importa muchísimo porque hace visible que NovaMarket ya no es solo una arquitectura de request-response.  
Ahora también tiene una capa real de reacciones desacopladas.

Ese matiz cambia muchísimo la lectura del proyecto.

---

## Paso 7 · Entender por qué este recorrido vale tanto

A primera vista, podría parecer que solo estamos “probando que todo ande”.

Pero en realidad estamos haciendo algo bastante más importante:

- comprobar que las piezas no quedaron como demos separadas,
- y que el sistema ya puede leerse como una arquitectura coherente donde cada bloque construido encuentra su lugar dentro del flujo real.

Ese cambio importa muchísimo.

---

## Paso 8 · Pensar qué preguntas debería poder responder este recorrido

Después de esta clase, el sistema ya debería permitir responder preguntas como:

- por dónde entra el tráfico,
- cómo participa la seguridad,
- qué servicios intervienen,
- cómo se sigue el recorrido distribuido,
- y qué reacción asíncrona posterior se dispara

No hace falta todavía una auditoría perfecta del proyecto.

La meta es mucho más concreta:

- que NovaMarket ya pueda recorrerse como plataforma integrada y no solo como inventario de módulos.

---

## Paso 9 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya está listo para cualquier entorno sin más validación”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya puede recorrerse y validarse de punta a punta como sistema completo dentro del entorno que venimos construyendo.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase recorre y valida NovaMarket de punta a punta como sistema completo.

Ya no estamos solo revisando módulos aislados.  
Ahora también estamos haciendo visible que seguridad, gateway, servicios, observabilidad y eventos ya forman una arquitectura coherente y operativa dentro del mismo proyecto.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- consolidamos todavía este bloque con un checkpoint fuerte,
- ni terminamos todavía de leer NovaMarket como arquitectura cerrada lista para pasar a Kubernetes.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dar el primer paso real para que NovaMarket deje de verse como piezas separadas y empiece a validarse como sistema completo.**

---

## Errores comunes en esta etapa

### 1. Probar solo endpoints aislados
El valor real está en recorrer el sistema como una arquitectura integrada.

### 2. Ignorar las capas no funcionales
Seguridad, observabilidad y mensajería ya forman parte del recorrido real.

### 3. Pensar que esta clase solo “chequea que ande”
En realidad consolida la lectura del sistema como plataforma.

### 4. Saltar a Kubernetes sin este paso
Eso mezclaría demasiados problemas a la vez.

### 5. No elegir un caso de uso verdaderamente representativo
El flujo de orden sigue siendo el mejor hilo conductor para este tramo.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que NovaMarket ya puede recorrerse de punta a punta como sistema completo y que sus bloques principales ya participan de una forma coherente dentro del mismo flujo real.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- ya podés recorrer una operación real del sistema de punta a punta,
- entendés qué piezas participan y cómo se encadenan,
- ves que seguridad, observabilidad y eventos ya no están “aparte”, sino dentro del sistema,
- y sentís que NovaMarket ya empezó a validarse como plataforma integrada y no solo como suma de módulos.

Si eso está bien, ya podemos pasar al siguiente tema y cerrar operativamente el sistema antes de abrir Kubernetes.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar el cierre operativo de NovaMarket como sistema completo antes de abrir el último gran bloque técnico del curso: Kubernetes.

---

## Cierre

En esta clase recorrimos y validamos NovaMarket de punta a punta como sistema completo.

Con eso, el proyecto deja de verse solo como una suma de componentes técnicamente correctos y empieza a sostener una lectura mucho más integrada, mucho más operativa y mucho más madura como arquitectura real de microservicios.
