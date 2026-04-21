---
title: "Sumando RabbitMQ al entorno y levantando la primera base real de mensajería asíncrona en NovaMarket"
description: "Primer paso práctico del módulo 13. Incorporación de RabbitMQ al entorno de NovaMarket para empezar a sostener mensajería asíncrona real dentro de la arquitectura."
order: 138
module: "Módulo 13 · Comunicación asíncrona y eventos"
level: "intermedio"
draft: false
---

# Sumando RabbitMQ al entorno y levantando la primera base real de mensajería asíncrona en NovaMarket

En la clase anterior dejamos algo bastante claro:

- la arquitectura ya tiene suficiente madurez como para abrir mensajería asíncrona,
- RabbitMQ ya tiene sentido como siguiente pieza real del stack,
- y el siguiente paso lógico ya no es seguir hablando de desacoplamiento en abstracto, sino empezar a darle al sistema una infraestructura concreta para mensajes y eventos.

Ahora toca el paso concreto:

**sumar RabbitMQ al entorno y levantar la primera base real de mensajería asíncrona en NovaMarket.**

Ese es el objetivo de esta clase.

Porque una cosa es entender que cierta reacción podría vivir fuera del request síncrono.

Y otra bastante distinta es tener:

- una pieza real del entorno,
- viva,
- accesible,
- y lista para sostener mensajes dentro del sistema.

Ese es exactamente el primer gran valor práctico que vamos a construir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- incorporado RabbitMQ al entorno de NovaMarket,
- mucho más clara la relación entre servicios y una infraestructura de mensajería,
- visible una primera base real para comunicación asíncrona,
- y el proyecto mejor preparado para publicar y consumir mensajes después.

La meta de hoy no es todavía cerrar un flujo completo basado en eventos.  
La meta es mucho más concreta: **hacer que NovaMarket pase de la idea de mensajería a una primera infraestructura real de mensajería asíncrona dentro del entorno**.

---

## Estado de partida

Partimos de un sistema donde ya:

- existen varios servicios reales,
- el entorno Compose ya sostiene infraestructura importante del proyecto,
- y el módulo ya dejó claro que ahora conviene abrir un estilo distinto de coordinación entre piezas del sistema.

Eso significa que el problema ya no es si comunicación asíncrona tiene sentido.  
Ahora la pregunta útil es otra:

- **cómo empezamos a levantar una infraestructura real que permita sostener mensajes y eventos**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- sumar RabbitMQ al entorno,
- darle un lugar claro dentro de Compose,
- ubicar su rol arquitectónico dentro de NovaMarket,
- y validar que el sistema ya cuenta con una primera base real para mensajería asíncrona.

---

## Paso 1 · Entender qué lugar ocupa RabbitMQ

A esta altura del curso, conviene pensarlo así:

- RabbitMQ no reemplaza al gateway
- no reemplaza a la base de datos
- no reemplaza a los servicios

RabbitMQ entra como:

- infraestructura de mensajería,
- vecina del resto del stack,
- y responsable de facilitar el intercambio desacoplado de mensajes entre productores y consumidores.

Ese matiz importa muchísimo para ubicar bien la pieza dentro del proyecto.

---

## Paso 2 · Sumarlos a Compose

Una incorporación inicial razonable al entorno puede verse conceptualmente así:

```yaml
services:
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    networks:
      - novamarket-net
```

No hace falta todavía abrir demasiadas variantes de configuración.

La idea central es mucho más simple:

- darle a NovaMarket una primera pieza real de infraestructura para sostener mensajería asíncrona.

Ese paso ya tiene muchísimo valor.

---

## Paso 3 · Entender por qué la imagen con management ayuda mucho acá

Este punto vale muchísimo.

A esta altura del curso, usar una variante con panel de administración suele ser muy útil.

¿Por qué?

Porque nos permite:

- verificar que RabbitMQ está vivo,
- observar colas, exchanges y mensajes más adelante,
- y mantener el bloque práctico mucho más visible y didáctico.

Ese criterio mejora muchísimo la progresión del módulo.

---

## Paso 4 · Levantar el entorno actualizado

Ahora levantá otra vez el stack con RabbitMQ incluido.

La idea es que NovaMarket ya no solo tenga:

- infraestructura de servicios,
- seguridad,
- resiliencia,
- observabilidad

sino también una primera pieza real de mensajería asíncrona.

Ese es uno de los momentos más importantes de la clase.

---

## Paso 5 · Verificar que RabbitMQ esté vivo

Ahora probá entrar a algo como:

```txt
http://localhost:15672
```

Lo importante es confirmar que:

- RabbitMQ arranca,
- responde,
- y ya forma parte visible del entorno del sistema.

No hace falta todavía tener exchanges o colas de negocio totalmente armadas.  
La meta de hoy es mucho más concreta: validar la presencia real de esta nueva pieza.

---

## Paso 6 · Pensar qué piezas del sistema van a dialogar con RabbitMQ

A esta altura del bloque, las candidatas más naturales suelen ser:

- `order-service`
- y
- `notification-service`

¿Por qué?

Porque es muy razonable que:

- una orden creada emita un hecho,
- y otra pieza reaccione después para notificar.

Ese escenario encaja muy bien con la arquitectura que ya venimos construyendo y vuelve coherente el próximo subtramo práctico del módulo.

---

## Paso 7 · Entender qué acabamos de ganar

Este punto importa muchísimo.

Hasta ahora, mensajería asíncrona era una intención lógica del roadmap.

Ahora, en cambio, ya existe:

- una pieza concreta,
- viva,
- accesible,
- y sostenida por el mismo entorno donde viven gateway, servicios, seguridad, resiliencia y observabilidad.

Eso cambia muchísimo la madurez del bloque, porque la comunicación asíncrona deja de ser solo una idea futura y pasa a ser infraestructura real del sistema.

---

## Paso 8 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya tiene eventos de negocio funcionando”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene la primera infraestructura real de mensajería asíncrona integrada al entorno.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase suma RabbitMQ al entorno y levanta una primera base real de mensajería asíncrona en NovaMarket.

Ya no estamos solo hablando de comunicación desacoplada como siguiente bloque lógico.  
Ahora también estamos haciendo que la pieza que la va a sostener viva dentro del mismo entorno integrado del sistema.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- publicamos todavía mensajes reales,
- ni conectamos todavía productores y consumidores del dominio.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dar el primer paso real para que la mensajería asíncrona tenga infraestructura concreta dentro de NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Pensar que levantar RabbitMQ ya equivale a tener arquitectura basada en eventos completa
No. Este es solo el primer paso de infraestructura.

### 2. Tratar a RabbitMQ como si fuera un servicio más del negocio
No pertenece al dominio; pertenece a la infraestructura de mensajería.

### 3. Querer resolver exchanges, colas, productores y consumidores en la misma clase
Conviene ir bloque por bloque.

### 4. No validar que la pieza realmente arranca y responde
La verificación sigue siendo parte esencial de la clase.

### 5. No ver el cambio de escala del proyecto después de esta incorporación
Ahora el entorno ya sostiene también mensajería asíncrona como infraestructura real.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- RabbitMQ ya forma parte del Compose,
- arranca correctamente,
- vive junto al resto de la arquitectura,
- y NovaMarket ya dio un primer paso serio hacia comunicación asíncrona real.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- RabbitMQ está agregado al entorno,
- el sistema actualizado levanta correctamente,
- la interfaz responde,
- y sentís que la mensajería asíncrona ya dejó de ser una idea futura para convertirse en una pieza real del sistema.

Si eso está bien, ya podemos pasar al siguiente tema y empezar a publicar y consumir mensajes reales desde NovaMarket.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a empezar a conectar un primer flujo real entre `order-service` y `notification-service` usando RabbitMQ para que la mensajería asíncrona deje de ser solo infraestructura viva y empiece a sostener eventos concretos del sistema.

---

## Cierre

En esta clase sumamos RabbitMQ al entorno y levantamos una primera base real de mensajería asíncrona en NovaMarket.

Con eso, el proyecto deja de preparar la arquitectura basada en eventos solo desde ideas o diagramas y empieza a sostenerla también con una pieza concreta, viva y mucho más alineada con una arquitectura real de microservicios.
