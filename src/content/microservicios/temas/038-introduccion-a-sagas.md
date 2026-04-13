---
title: "Introducción a sagas"
description: "Qué son las sagas, qué problema intentan resolver en procesos distribuidos y cómo pensar compensaciones dentro del flujo de NovaMarket."
order: 38
module: "Módulo 9 · Datos distribuidos y consistencia"
level: "intermedio"
draft: false
---

# Introducción a sagas

Cuando un proceso de negocio involucra varios pasos repartidos entre distintos microservicios, aparece una dificultad muy conocida:

**¿cómo coordinar todo el flujo sin depender de una única transacción global?**

En un monolito, muchas veces varias acciones pueden agruparse dentro de una misma transacción de base de datos.  
En microservicios, eso deja de ser natural porque:

- cada servicio tiene su propia base,
- cada paso puede ejecutarse en momentos diferentes,
- y cada componente puede fallar por separado.

Las **sagas** aparecen como una forma de modelar y coordinar ese tipo de procesos distribuidos.

En esta clase vamos a ver la idea general, sin entrar todavía en implementaciones complejas, para entender cómo encaja dentro del caso de uso principal de **NovaMarket**.

---

## Qué problema intentan resolver

Imaginemos que en NovaMarket el flujo de una orden empieza a crecer.

Ya no alcanza con:

- crear la orden,
- y publicar una notificación.

Ahora el proceso podría incluir:

1. registrar la orden,
2. reservar stock,
3. iniciar una validación de pago,
4. disparar una notificación,
5. actualizar el estado final.

Cada uno de esos pasos puede vivir en servicios distintos.

La pregunta entonces es:

**si uno de esos pasos falla, qué hacemos con los anteriores?**

Esa es la clase de problema que una saga intenta abordar.

---

## Qué es una saga

Una saga es una secuencia de pasos distribuidos donde cada paso realiza una operación local en un servicio y, si algo sale mal más adelante, el sistema puede ejecutar **acciones compensatorias** para deshacer o mitigar los efectos previos.

La idea clave es esta:

- no hay una única transacción global que abarque todo,
- hay varias transacciones locales,
- y una lógica de coordinación que guía el proceso y sus posibles compensaciones.

---

## Qué es una compensación

La palabra compensación es central.

Una compensación **no siempre significa “borrar como si nada hubiera pasado”**.

A veces significa:

- revertir una reserva,
- cancelar una orden,
- liberar stock,
- marcar un estado de rechazo,
- emitir un evento correctivo.

Es decir, en sistemas distribuidos muchas veces no se “deshace mágicamente” una operación.  
Se ejecuta otra acción de negocio que lleva el sistema a un estado consistente y comprensible.

---

## Ejemplo simple en NovaMarket

Supongamos este flujo extendido:

1. `order-service` crea una orden en estado `PENDING`,
2. `inventory-service` reserva stock,
3. `payment-service` intenta procesar un pago,
4. si el pago sale bien, la orden pasa a `CONFIRMED`,
5. si el pago falla, la orden pasa a `CANCELLED` y el stock reservado se libera.

Eso ya se parece mucho a una saga.

¿Por qué?

Porque el proceso completo:

- involucra varios servicios,
- tiene varios pasos,
- y necesita una reacción coordinada ante fallas parciales.

---

## Por qué no alcanza con “si falla, devuelvo error”

Ese enfoque puede servir en flujos muy simples y sin efectos persistentes.

Pero cuando ya pasó algo en otro servicio, devolver un error HTTP al cliente no resuelve el problema interno del sistema.

Por ejemplo:

- si ya se reservó stock,
- y después falla el pago,
- no alcanza con responder “500 Internal Server Error”.

Todavía hace falta decidir qué hacer con esa reserva.

Las sagas ayudan a pensar justamente en esa lógica de continuidad o compensación.

---

## Qué diferencia hay con una transacción clásica

### Transacción clásica
- intenta asegurar atomicidad total,
- todo o nada dentro de un mismo contexto transaccional fuerte,
- ideal cuando todo vive sobre el mismo recurso o sobre un entorno muy controlado.

### Saga
- acepta que los pasos ocurren en distintos servicios,
- usa transacciones locales separadas,
- coordina éxitos y fallas mediante eventos, comandos o lógica explícita,
- y resuelve problemas con compensaciones en vez de rollback global.

La diferencia de modelo es muy importante.

---

## Dos enfoques frecuentes para implementar sagas

A nivel conceptual, suele hablarse de dos estilos principales.

### 1. Coreografía
Cada servicio reacciona a eventos y decide qué hacer a continuación.

Ejemplo:
- `order-service` publica un evento,
- `inventory-service` lo consume y publica otro,
- `payment-service` reacciona después,
- y así sucesivamente.

Ventaja:
- menos centralización.

Costo:
- puede volverse difícil de seguir cuando el flujo crece.

### 2. Orquestación
Existe un componente que coordina el proceso y decide el siguiente paso.

Ejemplo:
- un orquestador le pide a inventario reservar,
- luego le pide a pagos procesar,
- y si algo falla, ordena compensaciones.

Ventaja:
- el flujo queda más explícito.

Costo:
- aparece una pieza central con más responsabilidad.

En esta clase nos interesa primero entender la lógica del problema.  
La implementación concreta puede variar según el caso.

---

## Cómo pensarlo en NovaMarket

Para el curso, NovaMarket puede usar la idea de saga como evolución natural del flujo de órdenes.

Una versión posible del proceso sería:

1. `order-service` crea la orden en estado `PENDING`,
2. emite un evento o inicia una coordinación,
3. `inventory-service` intenta reservar stock,
4. si la reserva falla, se cancela la orden,
5. si la reserva sale bien, puede continuar otro paso,
6. si más adelante algo falla, se ejecutan compensaciones.

Aunque el curso no necesite construir una plataforma gigantesca, este ejemplo es suficiente para entender el valor del patrón.

---

## Qué hace buena a una saga

Una buena saga no es solo una secuencia de pasos.  
Necesita diseño consciente.

Entre otras cosas, conviene definir:

- qué inicia la saga,
- qué estados intermedios existen,
- qué pasos son obligatorios,
- qué fallas son recuperables,
- qué compensación corresponde en cada caso,
- qué eventos o comandos conectan el flujo,
- y cómo observar todo el proceso.

Sin eso, la saga se vuelve un conjunto difuso de acciones difíciles de mantener.

---

## Qué errores comunes aparecen

### 1. No modelar estados intermedios
Si todo intenta verse como “terminado” demasiado pronto, el sistema no refleja bien lo que está pasando.

### 2. Creer que compensar es igual a deshacer
A veces la compensación no borra, sino que corrige o lleva a otro estado válido.

### 3. Olvidar la idempotencia
En procesos distribuidos, un paso o una compensación pueden reintentarse.

### 4. No tener observabilidad
Si no se puede seguir la saga, los fallos parciales se vuelven muy difíciles de diagnosticar.

### 5. Diseñar flujos demasiado grandes desde el inicio
Conviene empezar con una saga pequeña, clara y con pocas ramas.

---

## Relación con consistencia eventual

Las sagas y la consistencia eventual están muy conectadas.

¿Por qué?

Porque una saga acepta explícitamente que:

- el proceso completo no se resuelve en un único instante,
- distintos pasos pueden ocurrir en distintos momentos,
- y el estado global va convergiendo a medida que avanzan o se compensan acciones.

En otras palabras:

la saga no evita la naturaleza distribuida del sistema,  
la **organiza**.

---

## Relación con outbox y mensajería

También hay una conexión muy fuerte con lo que vimos antes.

Si una saga se apoya en eventos entre servicios, entonces importa mucho que esos eventos se publiquen de forma confiable.  
Ahí el Outbox pattern puede ser un gran aliado.

Además, como los pasos pueden dispararse mediante mensajería:

- la idempotencia,
- los reintentos,
- y las dead letter queues

siguen siendo piezas importantes del panorama completo.

---

## Un ejemplo narrado de compensación

Pensemos en este caso en NovaMarket:

1. se crea la orden `#205`,
2. se reserva stock,
3. el siguiente paso falla,
4. la reserva ya no tiene sentido,
5. se ejecuta una compensación para liberar stock,
6. la orden queda en `CANCELLED`.

Fijate que el sistema no volvió al instante cero como si nada hubiera ocurrido.  
Más bien pasó por un proceso y terminó en un estado final coherente y trazable.

Eso es mucho más realista que imaginar un rollback global perfecto en todos los servicios.

---

## Qué valor didáctico tiene este patrón

Las sagas enseñan una de las lecciones más importantes de arquitectura distribuida:

**coordinar procesos de negocio en microservicios no consiste en forzar una atomicidad total artificial, sino en modelar bien pasos, estados y compensaciones.**

Ese cambio de mentalidad es muy valioso.

Además, ayuda a que el alumno deje de pensar los microservicios como “varios CRUD con HTTP” y empiece a verlos como partes de procesos de negocio distribuidos.

---

## Hasta dónde conviene llegar en el curso

Para este curso, no hace falta que la primera versión de NovaMarket tenga una saga enorme y sofisticada.  
Alcanza con introducirla de manera controlada y pedagógica.

Por ejemplo:

- orden creada,
- stock reservado,
- compensación si falla el siguiente paso.

Eso ya permite explicar el concepto con claridad y sin sobrecargar la arquitectura.

---

## Una idea práctica para llevarse

Cuando un proceso involucra varios servicios, la pregunta importante no es:

**“¿Cómo hago una gran transacción que abarque todo?”**

La pregunta más útil suele ser:

**“¿Qué pasos locales tiene este proceso, qué puede fallar en cada uno y qué compensación necesito para terminar en un estado de negocio válido?”**

Esa es la lógica que está detrás de una saga.

---

## Cierre

Las sagas son una forma de coordinar procesos distribuidos en arquitecturas de microservicios cuando varias operaciones locales participan en un mismo flujo de negocio.

En lugar de depender de una transacción global, se apoyan en pasos locales, estados intermedios y compensaciones que permiten conducir el sistema hacia un resultado consistente y comprensible.

En NovaMarket, este patrón encaja naturalmente a medida que el flujo de creación de órdenes se vuelve más rico y aparecen acciones dependientes como reservas, pagos, notificaciones o cancelaciones.

Con esta clase cerramos el bloque de datos distribuidos y consistencia.  
En el próximo módulo vamos a pasar a otra pieza esencial de un sistema profesional: **el testing en microservicios**.
