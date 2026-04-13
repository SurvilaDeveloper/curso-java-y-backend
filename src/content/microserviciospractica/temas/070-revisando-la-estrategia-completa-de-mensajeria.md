---
title: "Revisando la estrategia completa de mensajería"
description: "Cierre del bloque principal de RabbitMQ en NovaMarket. Revisión integrada del flujo sano, del flujo fallido, de la DLQ y del replay de mensajes."
order: 70
module: "Módulo 10 · Mensajería asincrónica con RabbitMQ"
level: "intermedio"
draft: false
---

# Revisando la estrategia completa de mensajería

En las últimas clases NovaMarket construyó un bloque de mensajería bastante completo para el punto del curso en el que estamos:

- levantamos RabbitMQ,
- creamos `notification-service`,
- publicamos `order.created`,
- consumimos el evento,
- persistimos notificaciones,
- mejoramos la topología con exchange y routing key,
- simulamos fallas del consumidor,
- introdujimos una DLQ,
- y además hicimos un replay básico de mensajes fallidos.

Eso ya representa muchísimo trabajo y bastante madurez arquitectónica.

Antes de seguir con el roadmap, conviene hacer una pausa y revisar algo muy importante:

**qué estrategia completa de mensajería terminamos construyendo.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- el flujo asincrónico sano está bien entendido,
- el flujo fallido también,
- la DLQ ya tiene un rol claro,
- el replay también,
- y el bloque de mensajería de NovaMarket quedó lo suficientemente consolidado como para seguir creciendo sobre una base firme.

---

## Estado de partida

Partimos de una arquitectura donde ya existen:

- exchange principal de eventos
- routing key `order.created`
- cola de notificaciones
- DLQ para mensajes fallidos
- consumidor persistente
- endpoint `/notifications`
- y una forma básica de replay

La mensajería ya no es una prueba aislada: ya es una parte real y visible del sistema.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- recorrer el flujo sano,
- recorrer el flujo fallido,
- recorrer el replay,
- comparar todos esos caminos,
- y dejar clara la estrategia global que NovaMarket terminó implementando.

---

## Por qué esta clase vale tanto

Porque después de muchas clases técnicas, conviene volver a una visión arquitectónica.

No queremos terminar este tramo pensando solo en:

- colas,
- exchanges,
- controllers,
- listeners,
- o configuraciones.

Queremos terminar pudiendo explicar algo así:

- “cuando todo sale bien pasa esto”
- “cuando el consumidor falla pasa esto otro”
- “cuando recupero el error hago esto”

Esa visión es la que realmente deja sólido el aprendizaje.

---

## Paso 1 · Describir el flujo sano de punta a punta

Empecemos por el caso normal.

Una lectura razonable del sistema sano debería ser esta:

1. el cliente crea una orden vía gateway  
2. `order-service` valida inventario y persiste la orden  
3. `order-service` publica `order.created` en el exchange principal  
4. RabbitMQ enruta el mensaje a la cola de notificaciones  
5. `notification-service` consume el evento  
6. persiste la notificación  
7. la notificación queda visible mediante `/notifications`

Este es el flujo base que sostiene todo el bloque.

---

## Paso 2 · Verificar el flujo sano con una prueba real

Ahora probalo otra vez:

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

Después consultá:

```bash
curl http://localhost:8085/notifications
```

La idea es que vuelvas a ver el camino feliz completo y no lo des por obvio.

---

## Paso 3 · Describir el flujo fallido de punta a punta

Ahora repasemos el caso fallido.

Cuando el consumidor rompe, el recorrido conceptual queda algo así:

1. el cliente crea la orden  
2. `order-service` publica `order.created`  
3. RabbitMQ enruta a la cola normal  
4. `notification-service` intenta consumir  
5. el procesamiento falla  
6. el mensaje no termina en persistencia normal  
7. RabbitMQ lo mueve a la DLQ

Este mapa es muy importante porque deja clarísimo que el éxito del request principal no garantiza el éxito del flujo asincrónico posterior.

---

## Paso 4 · Verificar el flujo fallido con una prueba real

Ahora activá o conservá la falla controlada y generá un caso que la dispare:

```bash
curl -i -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 1 },
      { "productId": 2, "quantity": 1 }
    ]
  }'
```

Después verificá:

- logs del consumidor
- `/notifications`
- y la DLQ en RabbitMQ

La idea es volver a observar el camino fallido de una forma muy consciente.

---

## Paso 5 · Describir el rol real de la DLQ

A esta altura del módulo ya conviene fijar bien la idea:

la DLQ no existe para decorar la topología.  
Existe para que un mensaje fallido:

- no se pierda,
- no se mezcle con el flujo normal,
- y pueda quedar disponible para diagnóstico y recuperación.

Ese rol es uno de los grandes aprendizajes del módulo.

---

## Paso 6 · Describir el flujo de replay

Ahora repasemos también el tercer camino del sistema:

el mensaje que falló y luego se intenta recuperar.

Conceptualmente:

1. el mensaje falló y terminó en DLQ  
2. se revisa o se corrige la causa del fallo  
3. se reinyecta el evento al exchange principal  
4. RabbitMQ lo enruta otra vez  
5. el consumidor vuelve a procesarlo  
6. esta vez la notificación sí se persiste  

Ese recorrido convierte a la mensajería en algo mucho más gestionable.

---

## Paso 7 · Verificar el replay con una prueba real

Si querés cerrar el módulo con una verificación completa, hacé este circuito:

1. generá un fallo  
2. confirmá que el mensaje está en DLQ  
3. corregí la causa  
4. ejecutá el replay  
5. verificá que la notificación aparece finalmente en `/notifications`

Este ejercicio concentra casi todo el aprendizaje del tramo.

---

## Paso 8 · Comparar explícitamente los tres caminos

Ahora sí, comparemos los tres recorridos.

### Camino sano
- orden creada
- evento publicado
- consumo exitoso
- persistencia normal

### Camino fallido
- orden creada
- evento publicado
- consumo fallido
- mensaje a DLQ

### Camino recuperado
- mensaje fallido
- corrección del problema
- replay
- consumo exitoso posterior

Este esquema vale muchísimo porque resume de forma muy clara la estrategia que el sistema terminó adoptando.

---

## Paso 9 · Pensar qué ganamos arquitectónicamente

Después de este bloque, NovaMarket ya no es solo una arquitectura que “manda mensajes”.

Ahora tiene:

- comunicación asincrónica real
- consumidor con estado
- topología AMQP mejor modelada
- manejo visible de fallos
- aislamiento de mensajes problemáticos
- y una base de recuperación

Eso es un salto de madurez muy fuerte.

---

## Paso 10 · Pensar qué todavía falta para un sistema todavía más serio

También conviene reconocer lo que todavía no hicimos:

- idempotencia más sólida
- replay más gobernado
- API o panel de inspección de DLQ
- métricas específicas del flujo AMQP
- reintentos y backoff más sofisticados
- más de un consumidor para el mismo evento
- nuevos eventos del dominio

Esto es importante para no creer que “ya está todo resuelto”, pero también para valorar cuánto sí se construyó.

---

## Qué estamos logrando con esta clase

Esta clase cierra el primer gran tramo de mensajería del curso.

No agrega una dependencia nueva ni una herramienta espectacular.  
Hace algo incluso más valioso:

**ordena todo lo que ya construimos en una estrategia comprensible.**

Y eso es exactamente lo que permite seguir creciendo sin perder coherencia.

---

## Qué preguntas deberías poder responder después de esta clase

Después de esta clase deberías poder explicar con claridad cosas como:

- ¿cómo se publica el evento `order.created`?
- ¿cómo llega a `notification-service`?
- ¿qué pasa si el consumidor falla?
- ¿qué rol cumple la DLQ?
- ¿cómo se reinyecta un mensaje fallido?
- ¿qué parte del circuito es síncrona y cuál asincrónica?

Si podés responder eso, el módulo ya dejó una huella conceptual muy fuerte.

---

## Errores comunes en esta etapa

### 1. Pensar la DLQ como “fin del camino”
En realidad, puede ser un paso intermedio hacia recuperación.

### 2. Confundir replay con reintento automático del consumidor
Son mecanismos distintos.

### 3. Olvidar que la orden puede haberse creado bien aunque la reacción asincrónica falle
Ese es uno de los contrastes más importantes del módulo.

### 4. No comparar explícitamente los tres caminos
Ese contraste es lo que más enseña.

### 5. Quedarse solo con detalles técnicos y perder la visión arquitectónica
Esta clase justamente existe para recuperar esa visión.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener una visión muy clara de la estrategia completa de mensajería que NovaMarket ya implementó en esta etapa del curso:

- publicación
- enrutamiento
- consumo
- persistencia
- fallo
- DLQ
- replay

Eso deja el bloque muy bien consolidado.

---

## Punto de control

Antes de seguir, verificá que:

- entendés el camino sano,
- entendés el camino fallido,
- entendés el rol de la DLQ,
- entendés el replay,
- y podés explicar cómo se conectan estos elementos dentro del sistema.

Si eso está bien, entonces el bloque principal de mensajería ya quedó lo suficientemente sólido como para avanzar hacia el siguiente tramo del roadmap.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a empezar el bloque de despliegue y operación del entorno con Docker Compose.

Eso nos va a permitir dejar de levantar todas las piezas sueltas y empezar a pensar NovaMarket también como un sistema operable de forma más unificada.

---

## Cierre

En esta clase revisamos la estrategia completa de mensajería de NovaMarket.

Con eso, el proyecto ya no solo “usa RabbitMQ”: ahora tiene un circuito asincrónico que puede funcionar, fallar, aislar mensajes problemáticos y empezar a recuperarlos con criterio.
