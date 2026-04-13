---
title: "Levantando RabbitMQ para NovaMarket"
description: "Inicio del bloque de mensajería asincrónica en NovaMarket. Puesta en marcha de RabbitMQ como broker del sistema para comenzar a desacoplar eventos del flujo principal."
order: 56
module: "Módulo 10 · Mensajería asincrónica con RabbitMQ"
level: "intermedio"
draft: false
---

# Levantando RabbitMQ para NovaMarket

Hasta este punto, NovaMarket ya construyó bastante infraestructura real:

- configuración centralizada,
- discovery,
- gateway,
- seguridad con Keycloak,
- resiliencia,
- y observabilidad distribuida.

Pero todavía hay una característica importante del sistema que no empezamos a trabajar de verdad:

**la comunicación asincrónica.**

Hoy el flujo principal de NovaMarket es fuertemente síncrono:

- el cliente entra por el gateway,
- el request llega a `order-service`,
- y `order-service` consulta a `inventory-service` para decidir si puede crear la orden.

Eso está bien para una parte del negocio, pero no todo tiene por qué resolverse dentro del request-response inmediato.

Hay acciones que conviene desacoplar, por ejemplo:

- disparar una notificación,
- registrar una acción secundaria,
- o reaccionar a un evento de negocio sin frenar el flujo principal.

La pieza que vamos a usar para abrir ese nuevo tramo del curso es:

**RabbitMQ**

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- RabbitMQ levantado y accesible,
- identificado como parte del entorno local de NovaMarket,
- y listo para que en las próximas clases publiquemos y consumamos eventos reales del sistema.

Todavía no vamos a conectar servicios al broker.  
Primero queremos dejar la infraestructura viva y visible.

---

## Estado de partida

Partimos de una arquitectura que ya tiene varias piezas de infraestructura funcionando:

- Config Server
- Discovery Server
- Keycloak
- Zipkin
- Gateway

Y además un flujo principal de negocio ya operativo entre:

- `api-gateway`
- `order-service`
- `inventory-service`

Ahora vamos a sumar una nueva pieza al ecosistema técnico del proyecto.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- incorporar RabbitMQ al entorno local,
- elegir una forma clara de levantarlo,
- verificar acceso al broker,
- verificar acceso a su consola,
- y preparar el terreno para el primer flujo asincrónico de NovaMarket.

---

## Qué problema resuelve RabbitMQ en este curso

RabbitMQ nos permite introducir una forma distinta de comunicación:

**publicar eventos o mensajes para que otro componente los procese después, sin bloquear necesariamente el flujo principal.**

Eso nos da varias ventajas conceptuales:

- menor acoplamiento temporal,
- mejor separación de responsabilidades,
- y una forma más realista de modelar acciones secundarias del sistema.

Para NovaMarket, esto va a ser muy útil cuando empecemos a trabajar, por ejemplo, con notificaciones asociadas a una orden creada.

---

## Cómo conviene levantar RabbitMQ en este curso

Para esta etapa del curso práctico, una opción muy razonable es levantar RabbitMQ como contenedor.

¿Por qué?

Porque:

- es fácil de repetir,
- encaja muy bien con la lógica de infraestructura que ya venimos siguiendo,
- y además RabbitMQ suele usarse muy naturalmente con Docker en entornos de desarrollo.

La idea es dejarlo arriba con:

- puerto del broker accesible,
- y consola de administración habilitada.

---

## Paso 1 · Preparar una carpeta dentro de `infrastructure/`

Dentro del monorepo, conviene dejar identificado un espacio para RabbitMQ.

Por ejemplo:

```txt
novamarket/infrastructure/rabbitmq/
```

No hace falta llenarlo de archivos todavía, pero sí conviene que el proyecto tenga claro que RabbitMQ forma parte del entorno técnico y no de los microservicios de negocio.

---

## Paso 2 · Elegir puertos claros

RabbitMQ suele requerir al menos dos cosas interesantes para este curso:

- el puerto del broker,
- y el puerto de la consola de administración.

Una convención habitual y muy cómoda es algo equivalente a:

- broker: `5672`
- consola: `15672`

No hace falta que uses exactamente esos si tu entorno ya los tiene ocupados, pero sí conviene sostener una convención clara y estable en el curso.

---

## Paso 3 · Levantar el contenedor de RabbitMQ

Ahora levantá RabbitMQ con una imagen que incluya consola de administración.

La meta práctica de esta clase es que queden accesibles dos cosas:

- el broker,
- y la UI administrativa.

No hace falta todavía automatizar todo con Docker Compose si no querés.  
Primero queremos ver la pieza viva y usarla en laboratorio.

---

## Paso 4 · Esperar a que termine de iniciar

Igual que pasó con Keycloak y Zipkin, conviene darle unos segundos para que complete el arranque.

No hace falta apurarse a abrir la consola si el contenedor todavía está terminando de inicializar.

---

## Paso 5 · Verificar acceso a la consola web

Ahora abrí la consola de administración de RabbitMQ.

Si usaste los puertos habituales, una dirección esperable sería algo como:

```txt
http://localhost:15672
```

La idea es confirmar que la interfaz carga correctamente.

En esta etapa, no importa todavía que haya colas, exchanges o mensajes.  
Lo importante es que la pieza ya esté viva.

---

## Paso 6 · Ingresar con credenciales de administración

Entrá con las credenciales que hayas definido al levantar el contenedor.

Para un entorno de curso práctico, conviene usar una convención simple y recordable.

La meta es solo verificar que:

- el login funciona,
- la consola es accesible,
- y RabbitMQ ya está listo para ser usado.

---

## Paso 7 · Reconocer qué partes te interesan de la UI

No hace falta que en esta clase recorras toda la interfaz de RabbitMQ.

Pero sí conviene empezar a ubicar visualmente al menos estas ideas:

- queues
- exchanges
- bindings
- overview general

Todavía no vamos a crear todo eso manualmente, pero es útil reconocer que RabbitMQ no es solo “una caja que recibe mensajes”, sino una infraestructura con piezas observables y configurables.

---

## Paso 8 · Confirmar que RabbitMQ ya forma parte del entorno del proyecto

A partir de esta clase, conviene empezar a pensar RabbitMQ como una pieza más del ecosistema NovaMarket, junto con:

- Config Server
- Discovery Server
- Keycloak
- Zipkin

Ese cambio mental importa bastante, porque el curso ya entró en una etapa donde el sistema no es solo un conjunto de microservicios, sino una arquitectura completa con soporte de infraestructura real.

---

## Qué estamos logrando con esta clase

Esta clase agrega un nuevo tipo de capacidad al proyecto.

Hasta ahora, la arquitectura estaba muy orientada a:

- requests síncronas,
- integraciones directas,
- y respuestas inmediatas.

Con RabbitMQ arriba, NovaMarket queda listo para empezar a trabajar mensajes y eventos.

Eso abre una parte muy interesante del curso.

---

## Qué todavía no hicimos

Todavía no:

- conectamos servicios al broker,
- declaramos colas,
- publicamos mensajes,
- ni consumimos eventos.

Todo eso viene a continuación.

La meta de hoy es mucho más concreta:

**dejar RabbitMQ arriba y accesible.**

---

## Errores comunes en esta etapa

### 1. Elegir puertos ya ocupados
Conviene revisar esto antes de levantar el contenedor.

### 2. No habilitar la consola de administración
Para el curso práctico, tener la UI visible ayuda muchísimo.

### 3. No esperar a que el broker termine de iniciar
A veces eso hace creer que “no funciona” cuando todavía estaba arrancando.

### 4. No dejar clara la convención de credenciales
Conviene usar una configuración simple para laboratorio.

### 5. Pensar que esta clase ya resuelve la mensajería
Todavía no; estamos montando la base de infraestructura.

---

## Resultado esperado al terminar la clase

Al terminar esta clase deberías tener:

- RabbitMQ levantado,
- la consola accesible,
- y una base lista para que NovaMarket empiece a trabajar con eventos asincrónicos reales.

Eso abre formalmente el bloque de mensajería del curso práctico.

---

## Punto de control

Antes de seguir, verificá que:

- RabbitMQ está levantado,
- podés abrir su consola web,
- podés iniciar sesión,
- y ya lo entendés como parte del entorno de infraestructura del proyecto.

Si eso está bien, ya podemos pasar al siguiente paso importante: sumar el servicio que va a reaccionar a eventos del negocio.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a crear `notification-service`.

Ese servicio va a ser la primera pieza de NovaMarket pensada específicamente para reaccionar a eventos asincrónicos del sistema.

---

## Cierre

En esta clase levantamos RabbitMQ y lo dejamos listo como broker de mensajería para NovaMarket.

Con eso, la arquitectura suma una nueva pieza muy importante y queda preparada para empezar a desacoplar parte de su comportamiento usando eventos en lugar de resolver todo dentro del flujo síncrono principal.
