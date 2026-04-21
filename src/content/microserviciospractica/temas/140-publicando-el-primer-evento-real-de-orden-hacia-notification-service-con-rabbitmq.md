---
title: "Publicando el primer evento real de orden hacia notification-service con RabbitMQ"
description: "Siguiente paso práctico del módulo 13. Publicación del primer evento real del dominio desde order-service hacia notification-service usando RabbitMQ."
order: 140
module: "Módulo 13 · Comunicación asíncrona y eventos"
level: "intermedio"
draft: false
---

# Publicando el primer evento real de orden hacia notification-service con RabbitMQ

En la clase anterior dejamos algo bastante claro:

- RabbitMQ ya forma parte del entorno,
- la mensajería asíncrona ya dejó de ser una idea futura,
- y el siguiente paso lógico ya no es seguir hablando de desacoplamiento en abstracto, sino empezar a hacer que el sistema emita un primer evento real del dominio.

Ahora toca el paso concreto:

**publicar el primer evento real de orden hacia `notification-service` con RabbitMQ.**

Ese es el objetivo de esta clase.

Porque una cosa es tener RabbitMQ vivo dentro del entorno.

Y otra bastante distinta es conseguir que:

- `order-service` produzca un hecho del dominio,
- ese hecho viaje como mensaje,
- y otra pieza del sistema quede en condiciones de reaccionar después sin depender del mismo flujo síncrono.

Ese es exactamente el primer gran valor práctico que vamos a construir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mucho más clara la relación entre productor, mensaje y consumidor potencial,
- visible una primera base real de publicación de eventos del dominio,
- mejorado el desacoplamiento entre creación de orden y reacción posterior,
- y NovaMarket mejor preparado para seguir consolidando mensajería asíncrona después.

La meta de hoy no es todavía diseñar toda la arquitectura de eventos del proyecto.  
La meta es mucho más concreta: **hacer que NovaMarket deje de tener solo infraestructura de mensajería y empiece a emitir un primer evento real del dominio**.

---

## Estado de partida

Partimos de un sistema donde ya:

- RabbitMQ forma parte del entorno,
- existe `order-service`,
- existe `notification-service`,
- y el módulo ya dejó claro que ahora conviene pasar de infraestructura a mensajes concretos del sistema.

Eso significa que el problema ya no es cómo levantar el broker.  
Ahora la pregunta útil es otra:

- **cómo hacemos que una operación real del dominio publique un mensaje que otra pieza pueda consumir después**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir un hecho del dominio razonable para emitir,
- definir una primera estructura de evento,
- preparar a `order-service` para publicarlo,
- y dejar visible una primera base real de publicación asíncrona dentro del sistema.

---

## Qué evento conviene elegir primero

A esta altura del curso, uno de los eventos más naturales suele ser algo como:

```txt
OrderCreated
```

¿Por qué?

Porque:

- encaja perfectamente con el flujo central de NovaMarket,
- se relaciona muy bien con `notification-service`,
- y evita forzar un caso artificial solo para “usar RabbitMQ”.

Ese evento es excelente para inaugurar el bloque.

---

## Paso 1 · Definir una estructura simple del evento

No hace falta todavía una estructura gigantesca.

Una opción muy razonable puede ser algo como:

```java
public record OrderCreatedEvent(
        Long orderId,
        String customerEmail,
        String status,
        String createdAt
) {
}
```

No importa todavía si luego ajustás tipos o campos.

La idea central es otra:

- el sistema necesita una representación explícita del hecho que quiere emitir.

Ese es uno de los corazones prácticos de toda la clase.

---

## Paso 2 · Pensar qué exchange y routing key conviene usar

A esta altura del curso, una primera estrategia clara y didáctica puede ser algo como:

- exchange: `orders.exchange`
- routing key: `orders.created`

No hace falta todavía abrir una taxonomía complejísima de nombres.

La meta es mucho más concreta:

- darle al flujo una primera convención visible y entendible para publicar mensajes.

Ese criterio mejora muchísimo la legibilidad del bloque.

---

## Paso 3 · Preparar a `order-service` como productor

Ahora conviene hacer que, cuando una orden se cree correctamente, `order-service` publique el evento.

Conceptualmente, algo como:

```java
rabbitTemplate.convertAndSend(
        "orders.exchange",
        "orders.created",
        event
);
```

No hace falta todavía resolver toda la serialización avanzada.

La idea central es muy clara:

- una operación del dominio ya puede producir un mensaje desacoplado del flujo principal.

Ese paso ya tiene muchísimo valor.

---

## Paso 4 · Entender por qué este cambio importa tanto

Este punto vale muchísimo.

Hasta ahora, si queríamos que otra pieza reaccionara a la creación de una orden, la intuición natural podía ser:

- llamarla directamente,
- dentro de la misma request,
- y esperar que responda.

Ahora, en cambio, el sistema gana otra opción:

- publicar el hecho,
- y dejar que otra pieza reaccione después.

Ese cambio es exactamente el corazón del bloque.

---

## Paso 5 · Pensar qué gana `notification-service` con este desacoplamiento

A esta altura del laboratorio, `notification-service` ya no necesita formar parte del request principal de creación de orden para que el sistema siga siendo coherente.

Eso importa muchísimo porque:

- reduce acoplamiento temporal,
- evita cargar más el flujo síncrono principal,
- y deja mucho más claro que algunas reacciones del sistema pueden vivir en otro ritmo.

Ese matiz es uno de los más valiosos de toda la clase.

---

## Paso 6 · Probar la publicación

Ahora ejecutá una creación de orden o el flujo equivalente que dispare ese evento.

La idea no es todavía validar un procesamiento final súper rico del lado consumidor.

La meta de hoy es algo más concreta:

- comprobar que una acción real del dominio ya puede publicar un mensaje real hacia RabbitMQ.

Ese momento vale muchísimo.

---

## Paso 7 · Verificar en RabbitMQ

Ahora conviene revisar RabbitMQ para confirmar que:

- existe el exchange,
- la publicación ocurre,
- y el sistema ya está emitiendo mensajes del dominio.

No hace falta todavía exprimir todo el panel.

Lo importante es observar que el broker ya dejó de ser solo una pieza viva y pasó a participar del flujo real del sistema.

---

## Paso 8 · Entender qué acabamos de ganar

Este punto importa muchísimo.

Hasta ahora, RabbitMQ ya existía en el entorno.

Ahora, en cambio, además ya existe algo mucho más fuerte:

- una operación real del dominio
- produce un evento real
- y lo entrega a la infraestructura de mensajería

Ese salto cambia muchísimo la madurez del bloque.

---

## Paso 9 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya tiene mensajería asíncrona completa de punta a punta”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene una primera capa real de publicación de eventos del dominio desde `order-service`.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase publica el primer evento real de orden hacia `notification-service` con RabbitMQ.

Ya no estamos solo levantando infraestructura.  
Ahora también estamos haciendo que una operación real del dominio produzca un mensaje desacoplado y utilizable por otra pieza del sistema.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- conectamos todavía el consumo real en `notification-service`,
- ni consolidamos aún este subbloque con un checkpoint fuerte.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**hacer que NovaMarket deje de tener solo broker e infraestructura y empiece a emitir un primer evento real del dominio.**

---

## Errores comunes en esta etapa

### 1. Pensar que el simple hecho de tener RabbitMQ ya significa arquitectura basada en eventos
Hace falta producir mensajes reales.

### 2. Elegir un evento artificial solo para usar el broker
Conviene empezar con un hecho del dominio realmente natural.

### 3. Abrir demasiada complejidad de exchanges y routing keys al principio
Una primera convención clara vale muchísimo más.

### 4. Querer cerrar productor y consumidor final en la misma clase
Conviene ir subbloque por subbloque.

### 5. No verificar que el broker participa realmente del flujo
Ese es el corazón práctico de la clase.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- `order-service` ya publica un primer evento real,
- RabbitMQ ya participa del flujo del dominio,
- y NovaMarket ya dio un primer paso serio hacia mensajería asíncrona aplicada.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- existe un evento explícito del dominio,
- ese evento ya se publica desde `order-service`,
- entendés qué desacoplamiento nuevo gana el sistema con este paso,
- y sentís que NovaMarket ya dejó de tener solo infraestructura de mensajería para empezar a usarla en un flujo real.

Si eso está bien, ya podemos pasar al siguiente tema y hacer que `notification-service` consuma y procese ese evento.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a conectar `notification-service` como consumidor del evento `OrderCreated` para cerrar el primer flujo asíncrono real de NovaMarket de punta a punta.

---

## Cierre

En esta clase publicamos el primer evento real de orden hacia `notification-service` con RabbitMQ.

Con eso, el proyecto deja de preparar la mensajería asíncrona solo desde infraestructura viva y empieza a sostenerla también con un hecho real del dominio que puede viajar desacoplado y disparar reacciones posteriores dentro del sistema.
