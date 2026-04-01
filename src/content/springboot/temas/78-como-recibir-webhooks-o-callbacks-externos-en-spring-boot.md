---
title: "Cómo recibir webhooks o callbacks externos en Spring Boot"
description: "Entender qué son los webhooks o callbacks, por qué muchos servicios externos te notifican eventos en lugar de responder todo en la misma request y cómo diseñar endpoints Spring Boot para recibir esas notificaciones de forma segura y ordenada."
order: 78
module: "Integraciones con servicios externos"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo manejar:

- errores
- timeouts
- reintentos

cuando tu backend depende de un servicio externo.

Eso ya te mostró una parte muy importante de las integraciones reales:

> no alcanza con poder llamar a un tercero; también tenés que diseñar qué hacer cuando ese tercero tarda, falla o responde mal.

Pero ahora aparece otra situación muy común y muy importante:

> a veces no solo vos llamás al tercero; a veces el tercero te llama a vos.

Y ahí entra un patrón central de muchísimas integraciones reales:

- **webhooks**
- **callbacks**
- **notificaciones entrantes**

Este tema es clave porque muchísimos sistemas externos no te resuelven todo en una única request síncrona.
En lugar de eso, muchas veces te responden algo inicial y después, más tarde, te notifican eventos hacia tu backend.

Eso cambia bastante la forma de pensar la integración.

## Qué es un webhook

Dicho de forma simple:

> un webhook es una llamada HTTP que un sistema externo le hace a tu backend para avisarle que ocurrió un evento.

Es decir, en vez de que solo tu sistema consulte constantemente “¿ya pasó esto?”, el tercero puede empujarte la información cuando sucede algo relevante.

Ese evento puede ser, por ejemplo:

- un pago aprobado
- un pago rechazado
- un envío despachado
- un email entregado
- una suscripción cancelada
- un archivo procesado
- un usuario autenticado por un proveedor externo
- una factura emitida
- una actualización de stock
- una firma completada en un servicio externo

La idea importante es esta:

> el tercero inicia la request hacia tu backend.

## Por qué esto cambia el modelo mental

Hasta ahora, en varios temas de integraciones, estabas pensando principalmente en este flujo:

1. tu backend arma request
2. tu backend llama a un servicio externo
3. el externo responde
4. tu backend decide qué hacer

Eso sigue existiendo.

Pero con webhooks aparece otra mitad muy importante del mundo real:

1. algo ocurre en el servicio externo
2. el externo llama a un endpoint de tu backend
3. tu backend recibe el evento
4. tu backend valida que esa notificación sea legítima
5. procesa el evento
6. actualiza su estado interno

Este patrón es muy frecuente en pagos, mensajería, logística y muchos otros servicios.

## Por qué muchos terceros usan webhooks

Porque no siempre tiene sentido resolver todo en una sola respuesta inmediata.

Por ejemplo:

- un pago puede tardar en confirmarse
- una transferencia puede cambiar de estado más tarde
- una entrega puede avanzar por varias etapas
- un email puede primero aceptarse y luego entregarse o rebotar
- un archivo puede tardar en procesarse
- una firma digital puede completarse minutos después
- un proceso manual puede demorar

Entonces, en vez de obligarte a consultar constantemente, el proveedor te empuja el evento cuando ocurre.

Eso es muchísimo más eficiente en muchos casos.

## Un ejemplo muy típico: pagos

Supongamos que tu backend crea un pago externo.

El proveedor puede responder algo inicial como:

- pago creado
- pendiente
- checkout URL generado

Pero la confirmación real puede llegar después.

Entonces el flujo completo puede ser:

1. tu backend crea intención de pago
2. el usuario interactúa con la pasarela
3. el proveedor procesa el pago
4. cuando el estado cambia, el proveedor hace un webhook a tu backend
5. tu backend actualiza la orden local a “pagada”, “rechazada” o “pendiente”

Este patrón aparece muchísimo y es una de las mejores formas de entender el valor de los webhooks.

## Qué es un callback

En este contexto, muchas veces “callback” se usa casi como idea hermana de webhook.

A grandes rasgos, ambas expresiones suelen apuntar a algo así como:

> el sistema externo invoca un endpoint tuyo para notificarte algo.

No hace falta que te obsesiones con una distinción terminológica rígida.
Lo importante es captar el patrón arquitectónico:
el evento viaja hacia tu backend desde el exterior.

## Qué necesita tu backend para recibir webhooks

Como mínimo, suele necesitar:

- un endpoint público o adecuadamente accesible
- entender el formato del request del proveedor
- validar que la notificación sea auténtica
- interpretar el evento recibido
- actualizar estado interno o disparar lógica
- responder de forma correcta al proveedor

Eso ya te muestra que recibir un webhook no es solo “otro POST más”.

## Un primer ejemplo conceptual

Supongamos una ruta así:

```text
POST /webhooks/payments
```

El proveedor externo hace una request a ese endpoint cada vez que cambia el estado de un pago.

Por ejemplo, tu controller podría verse conceptualmente así:

```java
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/webhooks")
public class PaymentWebhookController {

    private final PaymentWebhookService paymentWebhookService;

    public PaymentWebhookController(PaymentWebhookService paymentWebhookService) {
        this.paymentWebhookService = paymentWebhookService;
    }

    @PostMapping("/payments")
    public ResponseEntity<Void> recibirWebhook(@RequestBody PaymentWebhookRequest request) {
        paymentWebhookService.procesar(request);
        return ResponseEntity.ok().build();
    }
}
```

Este ejemplo es simple, pero ya muestra la idea central:
tu backend recibe un evento externo y lo procesa.

## Qué suele traer el body de un webhook

Depende totalmente del proveedor.
Puede traer cosas como:

- identificador del recurso externo
- tipo de evento
- estado nuevo
- timestamps
- firma o metadata
- payload completo del objeto
- apenas una referencia que luego tenés que consultar de nuevo

Por ejemplo, un body podría verse así:

```json
{
  "eventType": "payment.updated",
  "paymentId": "pay_123",
  "status": "APPROVED"
}
```

Otras veces puede ser muchísimo más grande o mucho más minimalista.

Lo importante es recordar que el contrato del webhook lo define el proveedor, no vos.

## Qué implica eso para tu diseño

Implica que conviene modelar bien el contrato de entrada del webhook, igual que hacés con otras integraciones externas.

Por ejemplo:

```java
public class PaymentWebhookRequest {

    private String eventType;
    private String paymentId;
    private String status;

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
```

Esto ya te permite empezar a pensar el webhook como un contrato externo claro y no como un JSON misterioso suelto.

## Por qué no conviene mezclar el webhook con el dominio sin adaptación

Porque muchas veces el proveedor usa:

- nombres de campos raros
- estados propios
- estructuras muy acopladas a su sistema
- conceptos que no coinciden exactamente con tu modelo interno

Por eso, igual que en otras integraciones, muchas veces conviene mapear o traducir lo recibido antes de contaminar el dominio.

Por ejemplo:

- el proveedor dice `APPROVED`
- tu dominio quizá usa `PAGADO`

o:

- el proveedor dice `FAILED`
- tu dominio quizá usa `RECHAZADO`

Este pequeño detalle ya muestra por qué la adaptación importa mucho.

## Qué relación tiene esto con el estado interno del sistema

Muy fuerte.

Los webhooks suelen existir justamente para actualizar tu estado local a partir de información externa.

Por ejemplo:

- orden pendiente → pagada
- envío creado → despachado
- email aceptado → entregado
- usuario en onboarding → validado
- suscripción activa → cancelada

Eso significa que el webhook no es una curiosidad técnica.
Suele estar muy conectado a transiciones reales del negocio.

## Un ejemplo de service de procesamiento

Podrías imaginar algo así:

```java
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentWebhookService {

    private final PedidoRepository pedidoRepository;

    public PaymentWebhookService(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    @Transactional
    public void procesar(PaymentWebhookRequest request) {
        if (!"payment.updated".equals(request.getEventType())) {
            return;
        }

        Pedido pedido = pedidoRepository.findByExternalPaymentId(request.getPaymentId())
                .orElseThrow(() -> new PedidoNoEncontradoException("No existe pedido para ese pago externo"));

        if ("APPROVED".equals(request.getStatus())) {
            pedido.setEstadoPago("PAGADO");
        } else if ("FAILED".equals(request.getStatus())) {
            pedido.setEstadoPago("RECHAZADO");
        } else if ("PENDING".equals(request.getStatus())) {
            pedido.setEstadoPago("PENDIENTE");
        }

        pedidoRepository.save(pedido);
    }
}
```

Este ejemplo ya deja muy clara la dinámica:

- entra evento externo
- se busca entidad local asociada
- se traduce estado
- se actualiza sistema interno

## Qué problema aparece si el webhook no es legítimo

Este es uno de los puntos más importantes del tema.

Porque si tu endpoint simplemente acepta cualquier POST desde internet y lo trata como si viniera del proveedor real, eso sería muy peligroso.

Por eso, en integraciones serias, suele ser muy importante validar la autenticidad del webhook.

## Qué significa validar autenticidad del webhook

Significa, conceptualmente:

> verificar que la notificación realmente proviene del proveedor esperado y no de cualquier actor externo.

Esto puede resolverse de distintas formas según el proveedor:

- firma en headers
- secret compartido
- token del webhook
- validación de origen
- consulta posterior al proveedor
- combinación de varias estrategias

No hace falta entrar todavía en cada mecanismo concreto.
Lo importante primero es entender que:

> un webhook no debería procesarse ciegamente solo porque llegó un POST.

## Un ejemplo conceptual con header secreto

Supongamos que el proveedor manda algo como:

```text
X-Webhook-Secret: abc123
```

Entonces podrías tener algo conceptual así:

```java
@PostMapping("/payments")
public ResponseEntity<Void> recibirWebhook(
        @RequestHeader("X-Webhook-Secret") String secret,
        @RequestBody PaymentWebhookRequest request
) {
    if (!"abc123".equals(secret)) {
        return ResponseEntity.status(401).build();
    }

    paymentWebhookService.procesar(request);
    return ResponseEntity.ok().build();
}
```

Esto es solo una ilustración simple.
En la práctica, cada proveedor suele tener su propio mecanismo y conviene hacerlo con más robustez.
Pero la idea ya queda muy clara: hay que validar legitimidad.

## Qué relación tiene esto con seguridad

Total.

En cierto sentido, los webhooks también son parte de tu superficie de seguridad.

Porque abrís un endpoint que acepta entradas externas que pueden cambiar tu sistema.
Eso exige bastante criterio.

No es solo una integración técnica.
También es una decisión de seguridad.

## Qué pasa si el proveedor reintenta el webhook

Esto también es muy común y muy importante.

Muchos proveedores reintentan webhooks si:

- tu endpoint responde error
- tu backend tarda demasiado
- la entrega falla
- no reciben un status que consideran exitoso

Eso significa que tu sistema puede recibir el mismo evento más de una vez.

Y acá aparece una idea crucial:
**idempotencia**

## Por qué la idempotencia es tan importante en webhooks

Porque si el mismo evento llega dos o tres veces, tu sistema no debería romperse ni duplicar efectos peligrosos.

Por ejemplo, si un webhook de pago aprobado llega dos veces, no querés:

- marcar la orden dos veces de una forma incoherente
- emitir dos comprobantes
- disparar dos emails de confirmación si no corresponde
- duplicar acciones críticas

Entonces una integración seria con webhooks suele diseñarse pensando:

> si este evento llega repetido, ¿mi procesamiento sigue siendo seguro?

## Un ejemplo mental de diseño idempotente

Supongamos que llega:

```json
{
  "eventType": "payment.updated",
  "paymentId": "pay_123",
  "status": "APPROVED"
}
```

Y tu pedido ya estaba marcado como `PAGADO`.

Entonces quizá el procesamiento correcto sea simplemente:

- reconocer que ya está en ese estado
- no hacer nada destructivo
- responder exitosamente igual

Eso suele ser muchísimo más sano que tratar el evento repetido como algo excepcional o duplicar lógica.

## Qué conviene responderle al proveedor

Depende del contrato del webhook, pero normalmente el proveedor espera algún status HTTP claro para saber si consideró la entrega exitosa o no.

Muy frecuentemente, una respuesta `200 OK` o similar indica:

- recibí la notificación
- la procesé o la acepté correctamente

Si devolvés error, muchos proveedores asumirán que deben reintentar.

Esto vuelve importante entender el contrato específico de cada servicio externo.

## Por qué no conviene tardar demasiado en responder

Porque el proveedor puede considerar que tu endpoint falló o quedó colgado y entonces reintentar.

Además, si el procesamiento interno del webhook es muy pesado, podrías:

- hacer esperar demasiado al tercero
- aumentar riesgo de duplicación por reintentos
- bloquear recursos innecesariamente

Esto hace que muchos diseños sanos prefieran:

- validar rápido
- aceptar rápido
- y, si hace falta, procesar internamente de forma más desacoplada

No hace falta que resolvamos hoy todo el mundo del procesamiento asíncrono.
Pero conviene empezar a notar la tensión.

## Qué pasa si el webhook trae poca información

Muy buena pregunta.

A veces el webhook no trae todos los datos finales.
Solo trae algo como:

- id externo
- tipo de evento

Y luego tu backend tiene que consultar al proveedor para obtener el detalle actualizado completo.

Ese patrón también es común.

Por ejemplo:

1. llega webhook con `paymentId`
2. tu backend valida el evento
3. tu backend llama al proveedor
4. obtiene el estado actualizado real del pago
5. recién ahí actualiza su dominio

Este patrón a veces es mucho más confiable que confiar ciegamente en todo el body entrante.

## Qué relación tiene esto con webhooks de pagos

Muy fuerte.

Los pagos son uno de los ejemplos más típicos donde el webhook muchas veces:

- avisa que hubo cambio
- pero la fuente de verdad final puede seguir siendo una consulta adicional al proveedor

Esto ayuda a reducir problemas por payloads incompletos o estados intermedios.

## Qué relación tiene esto con logs

Absolutamente central.

En webhooks conviene poder ver cosas como:

- qué proveedor llamó
- qué endpoint recibió
- qué event type llegó
- qué identificador externo traía
- si pasó validación de autenticidad
- si se procesó bien o no
- si era un duplicado
- cuánto tardó

Porque cuando algo falla, muchas veces el problema no se ve desde la UI de tu sistema sino recién desde los logs de integración.

## Qué relación tiene esto con testing

Muy fuerte también.

Conviene poder probar cosas como:

- webhook válido procesa correctamente
- webhook inválido o con firma incorrecta se rechaza
- evento repetido no rompe el sistema
- evento desconocido no genera desastre
- status externo se traduce bien a estado interno
- body mal formado devuelve error razonable
- si falta la entidad local asociada, la reacción es coherente

Este tipo de tests hacen una diferencia enorme en integraciones reales.

## Qué pasa con rutas y seguridad general

Muchas veces los endpoints de webhook necesitan ser accesibles desde el proveedor externo, lo que implica pensar con cuidado:

- si van fuera del JWT de tus usuarios
- si van protegidos por firma o secret propio
- si deben quedar excluidos del flujo normal de auth de usuario
- cómo diferenciarlos de rutas públicas comunes

Esto muestra otra vez que seguridad y webhooks están muy conectados.

## Qué no conviene hacer

No conviene:

- aceptar cualquier webhook sin validación
- asumir que llegará una sola vez
- asumir que el body siempre será perfecto
- mezclar lógica del proveedor por todos lados
- hacer procesamiento súper pesado antes de responder
- tratar el webhook como si fuera una request común de usuario

Los webhooks tienen comportamiento propio y merecen tratamiento propio.

## Otro error común

Pensar que porque el proveedor “manda el evento”, ya no hace falta diseñar idempotencia.

En realidad, es exactamente al revés: los reintentos del proveedor hacen la idempotencia todavía más importante.

## Otro error común

Usar el webhook para actualizar estado crítico sin ningún tipo de verificación adicional cuando el proveedor recomienda consultar su API para confirmar estado real.

Eso puede volver la integración más frágil o menos confiable de lo necesario.

## Otro error común

No documentar internamente qué hace el endpoint de webhook, qué proveedor lo usa, qué seguridad espera y qué efectos genera.
Después eso complica muchísimo mantenimiento y debugging.

## Una buena heurística

Podés preguntarte:

- ¿qué evento externo necesito recibir?
- ¿cómo valido que realmente viene del proveedor?
- ¿qué identificador local o externo necesito usar?
- ¿qué pasa si el mismo webhook llega dos veces?
- ¿qué estado interno debería cambiar?
- ¿conviene procesar con el body directo o consultar detalle al proveedor?
- ¿qué status debo responder para que el tercero no reintente innecesariamente?

Responder estas preguntas te ordena muchísimo el diseño.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque muchísimas integraciones serias del mundo real dependen de webhooks:

- pagos
- logística
- emails
- suscripciones
- almacenamiento
- identidad
- documentos
- procesos asíncronos

Así que este tema no es una rareza.
Es una de las piezas más típicas de backend integrado con terceros.

## Relación con Spring Boot

Spring Boot te deja muy bien parado para recibir webhooks porque, desde el punto de vista técnico, siguen siendo endpoints HTTP.

Pero la diferencia real está en cómo los diseñás:

- seguridad
- idempotencia
- validación
- mapping
- efectos internos
- logging
- testing

Y esa es justamente la capa de criterio que este tema busca dejarte clara.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> recibir webhooks en Spring Boot significa exponer endpoints para que sistemas externos te notifiquen eventos, pero hacerlo bien requiere mucho más que aceptar un POST: implica validar autenticidad, diseñar idempotencia, traducir el evento al lenguaje de tu dominio y procesarlo de una forma segura y coherente con el estado interno del sistema.

## Resumen

- Un webhook es una request HTTP que un sistema externo le hace a tu backend para avisar un evento.
- Es muy común en pagos, logística, email, suscripciones y otros procesos asíncronos.
- No conviene procesar webhooks ciegamente sin validar autenticidad.
- Idempotencia es clave porque muchos proveedores reintentan eventos.
- El body recibido muchas veces necesita adaptación al dominio interno.
- Logs, testing y diseño cuidadoso del endpoint hacen una gran diferencia.
- Este tema te muestra el otro gran patrón de integración: no solo cuando vos llamás al tercero, sino cuando el tercero te llama a vos.

## Próximo tema

En el próximo tema vas a ver cómo diseñar mejor eventos, colas o procesamiento asíncrono para desacoplar tareas pesadas del request principal, que es una evolución muy natural cuando empezás a trabajar con integraciones, webhooks y flujos que no conviene resolver de punta a punta dentro de una sola request HTTP.
