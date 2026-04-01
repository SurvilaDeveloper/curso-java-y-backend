---
title: "Emails transaccionales y notificaciones"
description: "Cómo pensar el envío de emails transaccionales y otras notificaciones en un backend real, qué diferencias hay con mensajes promocionales y qué decisiones de diseño importan para que el sistema comunique eventos de forma confiable."
order: 75
module: "Backend real e integraciones"
level: "intermedio"
draft: false
---

## Introducción

Muchos sistemas reales no solo guardan datos, validan operaciones o exponen endpoints.

También necesitan **comunicar cosas**.

Por ejemplo:

- confirmar una compra
- avisar que una orden cambió de estado
- enviar un enlace de recuperación de contraseña
- notificar que un pago fue aprobado
- informar que un archivo ya está listo para descargar
- recordar un vencimiento
- alertar sobre una acción importante
- confirmar una reserva
- avisar que una importación terminó
- informar que ocurrió un error relevante en un proceso

Ahí aparece un tema muy importante en backend real:

- **emails transaccionales**
- **notificaciones**

En esta lección vamos a enfocarnos primero en entender el problema, los tipos de mensajes y las decisiones de diseño que importan.

## Qué es un email transaccional

Un email transaccional es un correo que el sistema envía como consecuencia directa de una acción, un evento o un cambio relevante de estado.

Por ejemplo:

- bienvenida después del registro
- recuperación de contraseña
- confirmación de compra
- aviso de pago recibido
- comprobante de una operación
- confirmación de turno
- actualización importante de una orden

La idea central es que el email está ligado a una acción concreta del sistema o del usuario.

No es un email de marketing.
No es una campaña masiva.
No es una newsletter.

Es parte del funcionamiento del producto.

## Diferencia entre email transaccional y email promocional

Esta diferencia es muy importante.

### Email transaccional

Está relacionado con una operación o evento del sistema.

Ejemplos:

- “tu orden fue creada”
- “tu contraseña fue restablecida”
- “tu pago fue aprobado”

### Email promocional

Busca vender, retener o promocionar algo.

Ejemplos:

- ofertas
- campañas de descuento
- novedades comerciales
- newsletters
- recomendaciones de productos

¿Por qué importa esta diferencia?

Porque suelen implicar:

- distinta criticidad
- distintas expectativas del usuario
- distinta prioridad operativa
- diferentes requisitos legales o de consentimiento
- diferentes mecanismos de envío y seguimiento

En backend de producto, los transaccionales suelen ser mucho más sensibles.

## Qué entendemos por notificación

Una notificación es un mensaje que informa algo importante al usuario o a otro actor del sistema.

Ese mensaje no tiene por qué ser siempre un email.

También puede ser:

- notificación dentro de la aplicación
- push notification
- SMS
- webhook
- aviso en panel administrativo
- mensaje en un canal interno
- alerta operativa

Entonces, cuando hablamos de este tema, conviene pensar más ampliamente:

**el sistema necesita comunicar eventos importantes de forma correcta y confiable.**

## Casos de uso muy comunes

## 1. Recuperación de contraseña

Uno de los casos más clásicos.

El usuario pide restablecer su acceso y el sistema envía un enlace o código.

## 2. Confirmación de registro

Después de crear una cuenta, el sistema puede confirmar el alta o verificar el email.

## 3. Confirmación de compra

En e-commerce y sistemas de órdenes, esto es central.

## 4. Actualización de estado

Por ejemplo:

- orden enviada
- turno confirmado
- pago rechazado
- documento aprobado

## 5. Notificaciones operativas internas

A veces no se notifica al cliente, sino a un operador o admin.

Por ejemplo:

- “falló una importación”
- “quedaron pedidos sin procesar”
- “un job terminó con errores”

## 6. Avisos programados

Por ejemplo:

- vencimientos
- renovaciones
- recordatorios
- eventos próximos

## Por qué este tema importa tanto

Porque comunicar mal también rompe el producto.

Un sistema puede funcionar técnicamente en base de datos y lógica interna, pero si no notifica correctamente:

- el usuario no sabe qué pasó
- se genera incertidumbre
- aumenta el soporte
- se pierde confianza
- aparecen errores de experiencia
- ciertas acciones críticas quedan invisibles

Ejemplos típicos:

- el usuario no recibe el email de recuperación y no puede entrar
- una compra se creó pero no llegó confirmación
- una orden cambió de estado y el cliente nunca fue avisado
- un proceso batch falló y el equipo no se enteró

En todos esos casos, el backend no solo “maneja datos”.
También maneja comunicación de negocio.

## No todo mensaje tiene la misma criticidad

Esto es clave.

Hay mensajes que son casi obligatorios para el funcionamiento correcto del sistema.

Por ejemplo:

- recuperación de contraseña
- verificación de email
- confirmación de pago
- acceso a links temporales
- avisos de seguridad

Y otros que pueden ser menos críticos:

- resumen semanal
- aviso informativo no urgente
- recomendaciones
- recordatorios blandos

Distinguir criticidad ayuda a decidir:

- si el envío debe ser inmediato
- si puede ir por cola
- si necesita reintentos
- si requiere monitoreo más fuerte
- si debe generar alertas si falla

## Email no significa “mandar un string y listo”

Cuando el sistema envía emails en serio, aparecen muchas decisiones importantes:

- cuándo se dispara el envío
- qué contenido lleva
- si debe ser inmediato o diferido
- qué pasa si falla
- cómo evitar duplicados
- cómo registrar el resultado
- qué proveedor se usa
- cómo separar plantilla, lógica y datos
- si hay reintentos
- cómo monitorear entregas

O sea:

**enviar un email bien no es solo llamar a una librería.  
Es un problema de diseño y operación.**

## Cuándo disparar una notificación

Hay varias estrategias posibles.

### 1. Directamente dentro del flujo principal

Ejemplo:

- se crea una orden
- se intenta enviar email enseguida

### 2. Como trabajo diferido

Ejemplo:

- se crea la orden
- el backend responde rápido
- luego una cola o tarea envía el email

### 3. A partir de un evento de dominio o de aplicación

Ejemplo:

- ocurre “OrderCreated”
- otro componente escucha ese evento y dispara la notificación

Estas decisiones impactan mucho en robustez y desacople.

## Por qué muchas veces conviene desacoplar el envío

Si cada operación importante depende de enviar el email en ese mismo request, pueden aparecer problemas como:

- lentitud
- timeouts
- fallos externos que arruinan una operación principal
- acoplamiento excesivo con el proveedor de correo
- mala experiencia de usuario

Por eso, en muchos casos conviene separar:

- la operación principal del negocio
- del envío de la notificación

Por ejemplo:

- la orden se guarda
- la respuesta al usuario sale rápido
- el envío del email se procesa aparte

## Relación con temas anteriores

Este tema conecta directamente con lo que ya viste.

### Idempotencia

Porque no querés mandar el mismo email crítico varias veces por error.

### Tareas programadas y procesos batch

Porque algunos mensajes pueden salir en horarios determinados o por tandas.

### Archivos y storage externo

Porque a veces una notificación incluye links a archivos o reportes.

Todo esto forma parte de un backend más real.

## Qué datos suele necesitar una notificación

El sistema no suele enviar un mensaje “vacío”.
Normalmente necesita contexto.

Por ejemplo:

- destinatario
- tipo de evento
- datos de negocio
- idioma
- plantilla
- links
- fecha
- identificadores
- estado
- quizá adjuntos o referencias

Por eso conviene separar:

- lógica del negocio
- composición del mensaje
- canal de envío

## Plantillas

En sistemas serios, el contenido del email no suele estar hardcodeado de cualquier manera dentro de un service gigante.

Suele haber alguna estrategia para manejar plantillas.

Por ejemplo:

- texto con placeholders
- plantillas HTML
- plantillas por idioma
- plantillas por tipo de notificación

Esto ayuda a mantener:

- claridad
- consistencia
- reutilización
- mantenimiento más simple

## Variables dinámicas

Una plantilla puede incluir datos como:

- nombre del usuario
- número de orden
- importe
- fecha
- link de acción
- estado actualizado

Entonces, una parte importante del diseño es decidir cómo se inyectan esos datos de forma ordenada y segura.

## Emails HTML vs texto plano

Muchas veces los emails reales usan HTML para tener mejor presentación.

Por ejemplo:

- botones
- estructura visual
- branding
- bloques de información

Pero también puede ser importante considerar:

- accesibilidad
- fallback en texto plano
- compatibilidad
- simplicidad en algunos casos

No todos los mensajes necesitan la misma complejidad visual.

## ¿Qué pasa si falla el envío?

Esta es una de las preguntas más importantes.

Si un sistema depende de notificaciones, no alcanza con intentar enviar y olvidarse.

Hay que pensar:

- ¿se reintenta?
- ¿cuántas veces?
- ¿se registra el fallo?
- ¿se alerta a alguien?
- ¿la operación principal igual se considera exitosa?
- ¿hay un estado “pendiente de envío”?
- ¿cómo evitás duplicados en el retry?

Esto es parte del diseño serio del problema.

## Ejemplo conceptual

Supongamos una compra.

El sistema podría hacer esto:

1. validar y crear la orden
2. guardar el cambio de estado principal
3. registrar que debe enviarse una confirmación
4. responder al usuario
5. procesar el envío en segundo plano
6. registrar si el email salió bien o falló

Esto suele ser más robusto que mezclar todo dentro del mismo request.

## Duplicados y reintentos

Tal como viste con idempotencia, este tema también puede sufrir duplicados.

Por ejemplo:

- se reintenta una operación
- se reenvía un evento
- una cola reprocesa un mensaje
- el sistema no sabe si el proveedor llegó a recibirlo

Entonces conviene pensar:

- identificadores de envío
- estados de procesamiento
- claves de deduplicación
- registro de intentos

No siempre querés evitar todo reenvío.
A veces sí querés permitir reintentos controlados.
La clave es evitar caos.

## Proveedor externo de email

En sistemas reales, muchas veces el backend no “envía por sí solo”.
Se apoya en un proveedor o servicio externo especializado.

Eso trae ventajas, pero también decisiones:

- disponibilidad del proveedor
- errores temporales
- límites
- reputación de envío
- métricas de entrega
- rebotes
- credenciales
- seguridad

O sea:

**enviar emails también es una integración externa.**

## No toda notificación tiene que ser email

Este punto importa mucho.

A veces el mejor canal no es email.

Ejemplos:

- una alerta inmediata puede ser push
- un cambio dentro del sistema puede mostrarse in-app
- una integración técnica puede requerir webhook
- un evento crítico interno puede ir a un canal de operaciones
- un segundo factor podría usar otro canal según el sistema

Por eso conviene pensar primero:

**qué mensaje quiero comunicar, a quién y con qué urgencia**,  
antes de decidir el canal.

## Notificaciones internas vs externas

### Externas

Van hacia usuarios, clientes o sistemas externos.

Ejemplos:

- email al cliente
- webhook a un tercero
- SMS al usuario

### Internas

Van hacia operadores, admins o equipos internos.

Ejemplos:

- alerta por error
- aviso de stock bajo
- fallo de sincronización
- job con errores

Ambas son importantes, pero tienen objetivos distintos.

## Trazabilidad y observabilidad

En sistemas reales conviene poder responder preguntas como:

- qué notificación se intentó enviar
- cuándo
- a quién
- por qué evento
- por qué canal
- con qué resultado
- cuántos reintentos hubo
- si quedó pendiente
- si falló definitivamente

Esto ayuda muchísimo en soporte y operación.

## Buenas prácticas iniciales

## 1. Separar lógica de negocio y lógica de notificación

No meter todo mezclado si podés evitarlo.

## 2. Distinguir criticidad

No todos los mensajes merecen el mismo tratamiento.

## 3. Diseñar reintentos con criterio

Reintentar sin control puede empeorar el problema.

## 4. Tener trazabilidad mínima

Especialmente para mensajes críticos.

## 5. Pensar en deduplicación

Importa mucho cuando hay retries, colas o eventos repetidos.

## 6. Usar plantillas y variables de forma ordenada

Mejora mantenimiento y consistencia.

## 7. Elegir el canal correcto

No todo debe ir por email.

## Errores comunes

### 1. Enviar emails críticos directamente en el request sin pensar impacto

Puede volver frágil una operación principal.

### 2. Mezclar contenido, lógica de negocio y proveedor en un solo bloque de código

Después cuesta muchísimo mantenerlo.

### 3. No registrar fallos

Entonces nadie sabe qué pasó.

### 4. No pensar en duplicados

Y terminás mandando múltiples confirmaciones por error.

### 5. Tratar notificaciones críticas y no críticas igual

No tienen el mismo valor ni el mismo riesgo.

### 6. Elegir email por costumbre aunque no sea el mejor canal

A veces hay mejores opciones.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. ¿qué emails transaccionales necesitaría un e-commerce?
2. ¿cuáles deberían salir inmediatamente y cuáles podrían diferirse?
3. ¿qué harías si falla el envío de una confirmación de compra?
4. ¿qué mensajes de tu sistema no deberían ir por email?
5. ¿qué datos guardarías para auditar una notificación?

## Resumen

En esta lección viste que:

- un email transaccional es un mensaje ligado a una acción o evento relevante del sistema
- no es lo mismo un mensaje transaccional que uno promocional
- las notificaciones pueden salir por distintos canales, no solo email
- comunicar bien también es parte del backend real
- conviene pensar criticidad, desacople, plantillas, reintentos, deduplicación y trazabilidad
- los fallos de envío deben considerarse como parte del diseño
- el envío de emails suele ser también una integración externa con sus propias limitaciones y riesgos

## Siguiente tema

Ahora que ya entendés cómo pensar el envío de emails transaccionales y otras notificaciones en un backend real, el siguiente paso natural es aprender sobre **webhooks**, porque muchas integraciones modernas no solo envían mensajes a usuarios, sino también eventos automáticos entre sistemas.
