---
title: "Webhooks salientes y callbacks configurables"
description: "Cómo pensar webhooks salientes y callbacks configurables como superficie de SSRF en una aplicación Java con Spring Boot. Por qué no alcanza con guardar una URL y enviar eventos, y qué preguntas conviene hacerse cuando el backend llama destinos definidos por usuarios, clientes o tenants."
order: 141
module: "Consumo saliente, SSRF y conexiones externas"
level: "base"
draft: false
---

# Webhooks salientes y callbacks configurables

## Objetivo del tema

Entender por qué los **webhooks salientes** y los **callbacks configurables** son una superficie muy importante de **SSRF** en una aplicación Java + Spring Boot.

La idea de este tema es tomar una funcionalidad extremadamente común en productos modernos:

- “avisale al cliente cuando pase algo”
- “mandemos un evento a la URL que configuró”
- “probemos la conectividad del webhook”
- “guardemos el callback y luego lo usamos desde jobs o eventos”
- “cada tenant integra su propio endpoint”

Todo eso puede ser totalmente legítimo desde negocio.
De hecho, muchas integraciones serias dependen exactamente de esa capacidad.

El problema aparece cuando esa legitimidad de producto hace que el equipo piense algo como:

- “como es una integración esperada, no debería haber tanto riesgo”
- “si el cliente puso esa URL, nosotros solo notificamos”
- “guardamos el endpoint y listo”

Ahí es donde conviene frenar.

En resumen:

> un webhook saliente no es solo una feature de integración.  
> También es una decisión de confianza sobre **a qué destinos está dispuesto a conectarse tu backend** y bajo qué reglas, frecuencia, identidad y alcance de red lo hará.

---

## Idea clave

Un webhook o callback configurable significa, en términos simples:

1. alguien define o influye un destino remoto
2. el backend guarda ese destino
3. cuando ocurre un evento o una acción, el backend hace una request saliente hacia allí

Eso ya coloca a la funcionalidad en el corazón del riesgo de SSRF.

La idea central es esta:

> no importa que la request saliente sea “esperada” por el producto.  
> Sigue siendo una request que el backend hará hacia un destino que no siempre controla completamente la aplicación.

Y como esa salida ocurre desde el servidor, hereda:

- su posición de red
- su capacidad de resolución DNS
- sus puertos disponibles
- sus posibles headers comunes
- su infraestructura
- y, a veces, su identidad saliente

### Idea importante

La pregunta de seguridad no es solo:
- “¿tenemos webhooks?”

La pregunta importante es:
- “¿qué destinos estamos autorizando realmente a que el backend contacte?”

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- pensar que un callback legítimo de negocio no necesita análisis fuerte de SSRF
- permitir URLs muy libres porque “cada cliente tendrá la suya”
- validar solo al guardar y olvidarse del uso posterior
- asumir que un dominio configurado por un tenant ya es automáticamente confiable
- no controlar redirects, puertos, esquemas o resolución DNS
- usar clientes HTTP genéricos demasiado poderosos para mandar webhooks
- mezclar pruebas de conectividad, validación y entrega real en una misma lógica sin límites claros
- olvidar que un webhook es una request saliente repetible y automatizada desde el backend

Es decir:

> el problema no es tener webhooks.  
> El problema es dejar que esa feature convierta al backend en un notificador demasiado flexible hacia destinos poco controlados.

---

## Error mental clásico

Un error muy común es este:

### “El cliente quiere que le notifiquemos ahí, así que es lógico permitir esa URL”

Eso puede ser cierto desde producto.
Pero no alcanza desde seguridad.

Porque todavía faltan preguntas como:

- ¿qué esquema aceptamos?
- ¿qué host permitimos?
- ¿qué pasa con subdominios y DNS?
- ¿qué puertos toleramos?
- ¿qué redirects seguimos?
- ¿el destino podría apuntar a localhost, red privada o metadata?
- ¿quién revalida ese destino cuando pasan días o semanas?
- ¿qué headers o credenciales mandamos?
- ¿qué parte de la red del backend está quedando a disposición de esa integración?

### Idea importante

“Lo quiere el cliente” no reemplaza el modelado de confianza saliente.

---

## Por qué esta superficie aparece tanto en apps reales

Los webhooks salientes aparecen en casi todos los productos con algo de integración, por ejemplo:

- e-commerce
- SaaS B2B
- CRM
- pagos
- facturación
- automatizaciones
- notificaciones
- sistemas de tickets
- plataformas multi-tenant
- backoffices que se integran con terceros

Eso hace que el tema no sea marginal.
Es muy habitual.

### Idea útil

Cuanto más integrable es un producto, más probable es que tenga alguna forma de callback configurable.
Y, por lo tanto, más probable es que necesite pensar SSRF con seriedad en esa capa.

---

## El webhook no es una request puntual: puede repetirse muchas veces

Esto vuelve más importante el análisis.

Una preview o una prueba manual quizá disparan una request aislada.
En cambio, un webhook configurado puede producir requests:

- automáticas
- repetidas
- disparadas por eventos
- ejecutadas por jobs
- reintentadas
- procesadas en background
- y sostenidas en el tiempo

### Idea importante

No es solo “una vez el backend fue a ese destino”.
Puede convertirse en una capacidad estable de salida del sistema hacia un endpoint elegido o influido por otro actor.

---

## Destino persistido = confianza persistida

Este es un punto central.

Cuando la app guarda un callback, no solo guarda una URL.
Guarda una decisión de confianza que después será reutilizada.

Eso significa que el sistema está diciendo algo como:

> “cada vez que ocurra este evento, aceptaremos conectarnos a este destino desde nuestra infraestructura”.

### Regla sana

Persistir un callback merece el mismo rigor que persistir una relación de confianza operativa, no solo un dato de configuración.

---

## Validar al guardar no alcanza por sí solo

Esto conecta con varios temas anteriores.

Puede pasar que la app:

1. valide el callback cuando el usuario lo registra
2. resuelva DNS
3. pruebe conectividad
4. lo guarde
5. días después lo use en producción

### Problema

Entre esos momentos pueden cambiar cosas como:

- resolución DNS
- ownership del dominio
- redirects
- infraestructura del cliente
- significado operativo del destino

### Idea importante

Un callback aprobado una vez no garantiza que siga siendo un destino legítimo o seguro en cada uso posterior.

---

## Test de conectividad y envío real no son la misma cosa

Muchas implementaciones mezclan dos fases distintas:

## Fase 1
- “probar” el endpoint
- verificar que responde
- medir latencia
- comprobar status

## Fase 2
- enviar eventos reales
- enviar cuerpos de negocio
- incluir firma o headers
- reintentar ante fallo

### Problema

A veces el sistema aplica una lógica superficial en la fase de prueba y luego asume que eso ya legitima el destino para todos los usos futuros.

### Idea importante

La validación o health check del webhook no reemplaza el modelado de la entrega real.

---

## El riesgo no está solo en el body enviado

Es fácil pensar el webhook solo como un problema de:
- qué datos mandamos

Pero desde SSRF importa también:
- a dónde conectamos
- desde qué red
- con qué frecuencia
- con qué método
- con qué headers
- con qué redirects
- con qué cliente
- con qué auth o firma

### Idea útil

No es solo una cuestión de confidencialidad del payload.
También es una cuestión de **capacidad de red que el backend está ofreciendo**.

---

## Multi-tenant: donde este problema se vuelve todavía más serio

En sistemas multi-tenant, es muy común que cada cliente configure:

- su callback
- su endpoint de eventos
- su dominio de integración
- su receptor de webhooks

Eso es legítimo desde negocio.
Pero también significa que la app puede terminar aceptando muchos destinos distintos.

### Entonces conviene preguntar

- ¿qué policy común los restringe?
- ¿qué parte del endpoint puede variar?
- ¿qué checks hay por tenant?
- ¿qué allowlist o ownership se exige?
- ¿qué pasa con subdominios o dominios “del cliente”?
- ¿qué pasa si ese cliente apunta a un destino inesperado?

### Idea importante

Multi-tenant no justifica una superficie saliente sin límites.
Solo hace más importante diseñarlos bien.

---

## Callbacks “internos” o “solo para enterprise” no son automáticamente más seguros

Otro error común es pensar:

- “esto no lo toca un usuario común”
- “solo lo usa un admin”
- “solo clientes enterprise configuran esto”
- “es una feature interna”

Eso puede reducir algo el riesgo operativo.
Pero no elimina la necesidad de diseñar controles fuertes.

### Porque igual sigue pasando que
- el backend se conecta
- a destinos configurables
- desde su propia red
- con comportamiento automatizado

### Regla sana

Una feature con menos usuarios no es una feature con menos capacidad de daño si se usa mal.

---

## Los webhooks se parecen mucho a “salir del backend por diseño”

Esta es una buena intuición mental.

Hay features donde la salida de red es un efecto colateral.
En webhooks, en cambio, la salida es el corazón del producto.

Eso significa que el diseño defensivo no puede ser un parche tardío.
Tiene que formar parte del contrato desde el principio.

### Idea importante

Si el feature existe para que el servidor llame a destinos externos, entonces la política de qué destinos son legítimos es parte central del negocio, no una validación cosmética.

---

## Qué vuelve más peligrosa a esta superficie

Los webhooks salientes se vuelven especialmente delicados cuando se combinan cosas como:

- destinos muy flexibles
- follow redirects
- puertos arbitrarios
- DNS poco controlado
- cliente HTTP genérico
- retries automáticos
- headers potentes
- firmas o tokens de webhook
- ejecución en background
- mucha frecuencia de eventos
- poca revisión posterior del destino

### Idea útil

No hace falta que todo eso ocurra junto para que haya riesgo.
Pero cuantos más de esos factores se acumulen, más seria se vuelve la superficie.

---

## El mismo host puede tener distintos puertos o servicios

Esto conecta con el tema de puertos.

A veces el equipo aprueba un callback pensando:
- “es el dominio del cliente”

Pero no modela:
- a qué puerto llega
- qué servicio vive detrás
- si hay paneles, métricas o endpoints internos
- si redirects pueden llevar a otros puertos

### Idea importante

En webhooks, aprobar el “dominio” sin pensar el servicio concreto puede ser demasiado amplio.

---

## Redirects en callbacks: muy mala idea si nadie los controla

Un webhook que sigue redirects sin disciplina puede terminar comportándose así:

- el destino inicial parece legítimo
- redirige
- el backend sigue
- termina en otro host, otra IP o otra red
- el sistema entrega igual el evento o prueba conectividad allí

### Regla sana

En una feature que ya es saliente por definición, los redirects merecen mucha sospecha.
Pueden ampliar sin ruido la confianza que el producto creyó estar otorgando.

---

## Qué datos devuelve el sistema al usuario también importa

Cuando el usuario registra o prueba un callback, la app suele devolver algo como:

- “conexión OK”
- “respondió 200”
- “no resolvió”
- “timeout”
- “certificado inválido”
- “host inaccesible”
- “redirect detectado”

Eso puede ser útil para UX o soporte.
Pero también puede dar señales muy valiosas sobre reachability desde la red del backend.

### Idea importante

Los mensajes de prueba de callback también pueden convertirse en canal de reconocimiento si la superficie está demasiado abierta.

---

## Webhook saliente no es lo mismo que API outbound fija

Esto merece claridad.

No es lo mismo:

- una integración fija con un proveedor que la app controla muy bien

que:

- un callback configurable por cliente o tenant

En el primer caso, el destino es mucho más estable.
En el segundo, la política saliente es parte del problema.

### Regla sana

No uses el mismo nivel de genericidad o el mismo cliente para ambos casos sin distinciones muy claras.

---

## Qué preguntas conviene hacer sobre una feature de webhook

Cuando revises webhooks o callbacks configurables, conviene preguntar:

- ¿quién define el destino?
- ¿qué parte de la URL puede variar?
- ¿qué esquema aceptamos?
- ¿qué host o dominio permitimos?
- ¿qué pasa con subdominios?
- ¿qué puertos toleramos?
- ¿seguimos redirects?
- ¿qué cliente HTTP usamos?
- ¿hay retries o reentregas?
- ¿qué mensajes de error o reachability devolvemos?
- ¿qué política revisa que este destino siga siendo legítimo con el tiempo?

### Regla sana

La seguridad de un webhook no se resume en “guarda una URL y hace POST”.
Hay mucho más contrato saliente que eso.

---

## Qué revisar en una codebase Spring

En una app Spring, esta superficie suele aparecer alrededor de:

- `WebhookService`
- `CallbackService`
- `NotificationDeliveryService`
- `OutboundIntegrationService`
- jobs de reenvío o retries
- entidades que guardan `callbackUrl`, `webhookUrl`, `endpoint`, `targetUrl`
- endpoints admin de “test callback”
- wrappers sobre `RestTemplate` o `WebClient` para notificaciones salientes
- lógica que firma payloads o agrega headers comunes
- validación al guardar separada de la entrega real

### Idea útil

Si una parte del sistema guarda un destino remoto y después le envía eventos automáticamente, ya estás en un caso clarísimo para revisar SSRF y contrato saliente.

---

## Qué vuelve más sana a una feature así

Una implementación más sana suele mostrar:

- contrato de destino más acotado
- menos flexibilidad gratuita
- validación clara de esquema, host y puerto
- menos redirects libres
- cliente saliente más específico
- mejor separación entre prueba de conectividad y entrega real
- revisión más consciente del destino persistido
- menos mensajes de error ricos de más

### Idea importante

Un webhook más sano no es el que “logra enviar siempre”.
Es el que logra enviar sin convertir al backend en herramienta de conectividad demasiado libre.

---

## Qué señales de ruido deberían prenderte alarmas

Estas señales merecen revisión rápida:

- “poné la URL que quieras y te notificamos”
- `test connection` muy libre
- follow redirects automático
- puertos arbitrarios
- dominios o subdominios amplios
- el mismo cliente HTTP para webhooks y para otros consumos muy distintos
- retries automáticos sin pensar el destino
- mensajes demasiado detallados sobre por qué el backend no pudo alcanzar el host
- validación fuerte al guardar, pero casi nada al usar
- nadie sabe qué política real limita adónde puede llamar ese webhook

---

## Qué conviene revisar en una app Spring

Cuando revises webhooks salientes y callbacks configurables en una aplicación Spring, mirá especialmente:

- dónde se guardan los destinos remotos
- qué campos del destino controla el usuario o tenant
- qué validación ocurre al guardar
- qué validación ocurre al usar
- si el cliente sigue redirects
- si la policy incluye esquema, host, puerto y DNS
- si el webhook puede alcanzar destinos internos
- qué auth, firma o headers agrega
- qué mensajes y señales le devuelve la feature al usuario
- cuánto poder saliente se le está dando realmente al backend

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- webhooks más acotados
- menos genericidad
- validación más clara del destino
- separación entre testing y entrega
- menor flexibilidad de puertos y redirects
- clientes salientes más específicos
- mejor alineación entre caso de uso y confianza permitida

---

## Señales de ruido

Estas señales merecen revisión rápida:

- callback URL casi libre
- cliente HTTP genérico
- follow redirects por default
- puertos arbitrarios
- demasiados detalles de conectividad expuestos al usuario
- dominio permitido pero política poco clara sobre DNS y resolución
- nadie revisa el destino una vez persistido
- “solo es un webhook” como forma de minimizar el problema

---

## Checklist práctico

Cuando revises una feature de webhook o callback configurable, preguntate:

- ¿quién define el destino?
- ¿qué parte de la URL controla?
- ¿qué host y puertos son realmente legítimos?
- ¿seguimos redirects?
- ¿qué cliente HTTP usamos?
- ¿qué headers o auth hereda?
- ¿qué tan rico es el mensaje de error de prueba?
- ¿qué pasa si ese callback apunta a localhost, red privada o metadata?
- ¿la confianza queda persistida sin revisión?
- ¿qué restringirías primero para que la feature deje de parecer un conector abierto y se parezca más a una integración deliberada?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Existe alguna feature de webhook o callback configurable?
2. ¿Quién define el destino remoto?
3. ¿Qué validación ocurre al registrar ese destino?
4. ¿Qué validación ocurre al momento real de enviar?
5. ¿El cliente sigue redirects o usa puertos arbitrarios?
6. ¿Qué información le devuelve al usuario cuando prueba conectividad?
7. ¿Qué cambio harías primero para reducir la superficie SSRF de esa funcionalidad?

---

## Resumen

Los webhooks salientes y callbacks configurables son una superficie muy importante de SSRF porque formalizan algo que el backend hará de forma repetida y automática: conectarse a destinos definidos o influenciados por otros actores.

El riesgo no está solo en el payload.
Está en todo el contrato saliente que esa feature introduce:

- host
- esquema
- puerto
- DNS
- redirects
- retries
- cliente HTTP
- auth y headers
- mensajes de reachability
- alcance de red del backend

En resumen:

> un backend más maduro no trata los webhooks como simples “POST automáticos” ni como una tabla más de configuración por tenant.  
> Los trata como una relación de confianza persistente entre el sistema y destinos remotos elegidos desde afuera, porque entiende que cada callback guardado es una promesa de conectividad futura desde la red del servidor, y que la verdadera seguridad de esa promesa depende de qué tan estrechamente acotaste el destino, el comportamiento del cliente y la información que la aplicación está dispuesta a revelar o a poner en juego cada vez que decide notificar a ese endpoint.

---

## Próximo tema

**Descarga remota de imágenes, PDFs y archivos**
