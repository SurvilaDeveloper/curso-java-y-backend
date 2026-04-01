---
title: "Cómo integrar pagos o checkout externo de forma seria desde Spring Boot"
description: "Entender cómo modelar una integración de pagos o checkout externo en Spring Boot, qué contratos suelen intervenir, cómo se relaciona con el dominio de órdenes y por qué estados, webhooks y consistencia importan muchísimo más que una simple llamada HTTP."
order: 82
module: "Integraciones con servicios externos"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo integrar almacenamiento externo de archivos o imágenes desde Spring Boot y por qué conviene separar:

- archivo físico en el proveedor
- metadata local en tu backend
- gateway de integración
- dominio interno
- validaciones y visibilidad

Eso ya te reforzó una idea muy importante:

> una integración externa sana no consiste solo en “usar un servicio”, sino en decidir muy bien qué queda del lado del proveedor y qué responsabilidad mantiene tu propio sistema.

Ahora toca uno de los casos más sensibles y reales de todos:

- pagos
- checkout externo
- pasarelas de cobro
- aprobación o rechazo
- estados pendientes
- webhooks
- conciliación entre sistema local y sistema del proveedor

Este tema es clave porque integrar pagos no es simplemente “hacer un POST y listo”.
Acá entran con mucha fuerza cosas como:

- contratos externos
- estados de negocio
- experiencia del usuario
- consistencia
- fallos parciales
- confirmaciones asíncronas
- idempotencia
- y seguridad

Es decir, este es uno de los mejores ejemplos de backend real serio.

## Por qué pagos es un caso tan delicado

Porque en otras integraciones a veces un fallo puede ser molesto pero no gravísimo.

Por ejemplo:

- falló un email de bienvenida
- falló una cotización secundaria
- falló una notificación complementaria

Pero con pagos aparecen efectos mucho más sensibles:

- dinero
- órdenes
- confirmaciones
- fraude
- duplicación
- inconsistencias
- experiencia crítica del usuario

Eso significa que una integración de pagos mal pensada puede traer problemas mucho más serios que otras integraciones más accesorias.

## Qué significa integrar checkout o pagos externos

Dicho simple:

> significa que tu backend coordina una parte del proceso de cobro con un proveedor externo, manteniendo al mismo tiempo su propio estado interno sobre órdenes, pagos y resultado del flujo.

Ese proveedor externo puede ser, por ejemplo:

- una pasarela de pago
- un checkout redirigido
- un proveedor con preferencia de pago
- una API de cobro
- un sistema que luego te notifica resultados por webhook

La idea central es esta:

> tu sistema y el proveedor comparten responsabilidad sobre el flujo, pero no viven dentro del mismo estado ni dentro de la misma transacción.

Y esa frase explica gran parte de la dificultad del tema.

## El error de pensar el pago como una simple llamada HTTP

Cuando uno recién empieza, puede imaginar algo así:

1. el usuario hace click en comprar
2. mi backend llama al proveedor
3. el proveedor responde “ok”
4. listo, ya está

A veces parte del flujo puede parecerse a eso, pero en la práctica suele ser muchísimo más complejo.

Porque pueden pasar cosas como:

- el proveedor crea una intención de pago pero todavía no está aprobado
- el usuario abandona el checkout
- el pago queda pendiente
- el pago se aprueba más tarde
- el proveedor te notifica luego por webhook
- el usuario paga, pero tu backend no recibe la confirmación enseguida
- tu backend crea una orden local, pero el paso externo falla después
- el proveedor reintenta eventos
- el usuario refresca o dispara dos veces la operación

Eso muestra muy bien por qué pagos merece un tratamiento bastante más serio.

## Qué piezas suelen intervenir

Muy comúnmente, una integración de checkout o pagos termina involucrando cosas como:

- orden o pedido local
- cliente o comprador
- monto
- moneda
- items
- referencia interna del negocio
- cliente HTTP al proveedor
- response inicial del checkout
- identificador externo del pago
- webhook o callback posterior
- actualización de estado local
- lógica para evitar duplicados
- validación y observabilidad

Es decir, ya no se trata solo de “hacer una llamada”.
Se trata de coordinar dos mundos con sus propios estados.

## Qué suele existir del lado del dominio local

Por ejemplo, muchas veces tenés algo como:

- `Pedido`
- `Order`
- `Checkout`
- `PaymentAttempt`
- `PaymentStatus`

No todos los proyectos modelan exactamente lo mismo, pero es muy importante entender esto:

> tu backend necesita su propio modelo de pago u orden, aunque el cobro real pase por un tercero.

Porque si no, te quedás sin una forma clara de representar:

- qué intentó pagar el usuario
- qué referencia interna corresponde al cobro
- cuál era el monto
- en qué estado quedó
- qué proveedor participó
- si hubo webhook
- si el pago se aprobó o sigue pendiente

## Un ejemplo conceptual de entidad local

Podrías imaginar algo así:

```java
@Entity
public class PaymentAttempt {

    @Id
    @GeneratedValue
    private Long id;

    private String provider;
    private String externalPaymentId;
    private String externalReference;
    private String status;
    private BigDecimal amount;
    private String currency;

    @ManyToOne
    private Pedido pedido;

    // getters y setters
}
```

No hace falta que todos los sistemas tengan exactamente esta entidad.
Lo importante es la idea:

> conviene tener un rastro local del intento de pago y su relación con tu dominio.

## Por qué una entidad local ayuda tanto

Porque el proveedor externo no reemplaza la semántica de tu sistema.

Tu backend sigue necesitando saber cosas como:

- este pago corresponde a esta orden
- este intento fue con este monto
- este proveedor devolvió tal id externo
- el estado actual del negocio es pendiente, pagado o rechazado
- este webhook actualiza este intento concreto
- este checkout pertenece a este usuario

Toda esa información tiene muchísimo valor local.

## Qué estados suelen aparecer

Este es uno de los puntos más importantes del tema.

Muy a menudo los pagos no son simplemente:

- pagado
- no pagado

Aparecen estados intermedios o matices como:

- creado
- iniciado
- pendiente
- aprobado
- rechazado
- cancelado
- expirado
- fallido
- en revisión

Estos estados pueden existir:

- en tu dominio
- en el proveedor
- o en ambos, pero con nombres distintos

Y ahí aparece un problema clásico:
**traducir estados externos al lenguaje interno del negocio**.

## Un ejemplo de traducción de estados

Supongamos que el proveedor devuelve:

- `approved`
- `pending`
- `rejected`

Tu dominio podría querer hablar de:

- `PAGADO`
- `PENDIENTE`
- `RECHAZADO`

Ese mapping parece simple, pero es una pieza muy importante porque:

- el frontend depende de eso
- la orden depende de eso
- los webhooks dependen de eso
- los reintentos o siguientes pasos dependen de eso

Entonces conviene modelarlo con bastante intención.

## Qué suele pasar al iniciar un checkout

Muy frecuentemente el flujo se parece a algo así:

1. tu backend valida carrito o pedido
2. crea o recupera una orden local
3. prepara request para el proveedor
4. llama al proveedor externo
5. el proveedor responde con algo inicial
6. tu backend guarda referencias externas
7. devuelve al frontend información para continuar el checkout

Esa “información para continuar” podría ser, por ejemplo:

- una URL de checkout
- un identificador de preferencia
- una sesión externa
- un link para redirección
- metadata para abrir un widget del proveedor

## Un ejemplo conceptual de gateway

```java
public interface PaymentGateway {
    PaymentInitResult iniciarPago(PaymentInitCommand command);
}
```

Y el comando podría verse así:

```java
public class PaymentInitCommand {

    private final String internalOrderNumber;
    private final BigDecimal amount;
    private final String currency;
    private final String payerEmail;

    public PaymentInitCommand(
            String internalOrderNumber,
            BigDecimal amount,
            String currency,
            String payerEmail
    ) {
        this.internalOrderNumber = internalOrderNumber;
        this.amount = amount;
        this.currency = currency;
        this.payerEmail = payerEmail;
    }

    public String getInternalOrderNumber() {
        return internalOrderNumber;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getCurrency() {
        return currency;
    }

    public String getPayerEmail() {
        return payerEmail;
    }
}
```

Este contrato ya expresa bastante bien la intención del caso de uso.

## Qué podría devolver el gateway

Por ejemplo:

```java
public class PaymentInitResult {

    private final String externalPaymentId;
    private final String checkoutUrl;
    private final String externalReference;
    private final String providerStatus;

    public PaymentInitResult(
            String externalPaymentId,
            String checkoutUrl,
            String externalReference,
            String providerStatus
    ) {
        this.externalPaymentId = externalPaymentId;
        this.checkoutUrl = checkoutUrl;
        this.externalReference = externalReference;
        this.providerStatus = providerStatus;
    }

    public String getExternalPaymentId() {
        return externalPaymentId;
    }

    public String getCheckoutUrl() {
        return checkoutUrl;
    }

    public String getExternalReference() {
        return externalReference;
    }

    public String getProviderStatus() {
        return providerStatus;
    }
}
```

Esto le da al dominio una representación mucho más ordenada que usar directamente el JSON bruto del proveedor.

## Un service de checkout conceptual

```java
@Service
public class CheckoutService {

    private final PedidoRepository pedidoRepository;
    private final PaymentAttemptRepository paymentAttemptRepository;
    private final PaymentGateway paymentGateway;

    public CheckoutService(
            PedidoRepository pedidoRepository,
            PaymentAttemptRepository paymentAttemptRepository,
            PaymentGateway paymentGateway
    ) {
        this.pedidoRepository = pedidoRepository;
        this.paymentAttemptRepository = paymentAttemptRepository;
        this.paymentGateway = paymentGateway;
    }

    @Transactional
    public CheckoutResponse iniciarCheckout(Long pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("No existe el pedido"));

        PaymentInitCommand command = new PaymentInitCommand(
                pedido.getNumero(),
                pedido.getGrandTotal(),
                pedido.getCurrency(),
                pedido.getCustomerEmail()
        );

        PaymentInitResult result = paymentGateway.iniciarPago(command);

        PaymentAttempt attempt = new PaymentAttempt();
        attempt.setProvider("external");
        attempt.setExternalPaymentId(result.getExternalPaymentId());
        attempt.setExternalReference(result.getExternalReference());
        attempt.setStatus("PENDIENTE");
        attempt.setAmount(pedido.getGrandTotal());
        attempt.setCurrency(pedido.getCurrency());
        attempt.setPedido(pedido);

        paymentAttemptRepository.save(attempt);

        return new CheckoutResponse(result.getCheckoutUrl());
    }
}
```

Este ejemplo muestra muy bien varias ideas importantes del tema.

## Cómo leer este service

Podés leerlo así:

1. cargo la orden local
2. traduzco mi dominio a un comando entendible por el proveedor
3. llamo al gateway
4. guardo metadata local del intento
5. devuelvo al cliente lo necesario para seguir el checkout

Eso deja bastante claro que el backend mantiene un estado propio y no delega ciegamente toda la realidad al proveedor.

## Qué pasa después de iniciar el checkout

Muy a menudo, recién empieza otra parte del flujo.

Porque el proveedor puede:

- abrir un checkout externo
- dejar al usuario completar pago en otro sitio
- tardar en confirmar
- aprobar más tarde
- rechazar después
- mandar un webhook

Entonces el estado inicial local muchas veces queda como:

- `PENDIENTE`
- `INICIADO`
- o equivalente

Y no como `PAGADO` de inmediato.

Este punto es muy importante.
En pagos, confirmar demasiado pronto puede ser un error serio.

## Qué relación tiene esto con webhooks

Absolutamente total.

En muchísimos sistemas, el resultado definitivo del pago llega por webhook.

Por ejemplo:

1. backend inicia checkout
2. se guarda intento local
3. usuario interactúa con pasarela
4. proveedor envía webhook
5. backend actualiza intento y orden

Eso muestra por qué el tema 78 sobre webhooks era tan importante antes de entrar de lleno en pagos.

## Un ejemplo conceptual de webhook de pagos

```java
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

Y luego el service puede:

- ubicar el intento local
- traducir estado externo
- actualizar `PaymentAttempt`
- actualizar `Pedido`

Este es uno de los patrones más típicos del backend de e-commerce real.

## Qué pasa si el usuario vuelve del checkout pero el webhook aún no llegó

Muy buena pregunta.

Puede pasar perfectamente que:

- el usuario vuelva a tu frontend
- pero tu backend todavía no tenga el webhook confirmado

Entonces el frontend podría estar en una situación como:

- “el checkout terminó, pero el backend todavía ve el pago como pendiente”

Esto significa que la UX y el diseño del estado deben tolerar transiciones temporales.
No conviene asumir que todo se alinea en el mismo milisegundo.

## Qué relación tiene esto con consistencia

Muy fuerte.

Los pagos son uno de los mejores ejemplos de consistencia eventual o estados intermedios razonables.

Por ejemplo:

- el proveedor sabe algo antes que tu backend
- tu backend sabe algo local antes que el proveedor confirme
- el usuario ve una pantalla mientras tu sistema todavía reconcilia estados

Esto no es necesariamente un bug.
Puede ser parte normal del diseño si lo modelás bien.

## Qué relación tiene esto con idempotencia

También total.

En pagos conviene ser extremadamente cuidadoso con duplicaciones.

Por ejemplo:

- el usuario hace doble click
- el frontend reintenta
- el proveedor reintenta webhook
- tu backend recibe dos veces la misma notificación
- el mismo intento de cobro aparece dos veces

Por eso suelen importar muchísimo ideas como:

- referencias internas únicas
- externalReference
- checks de duplicado
- procesamiento idempotente de webhooks
- no crear dos pagos por el mismo pedido sin querer

Este es uno de los puntos más delicados de todo el tema.

## Un ejemplo de referencia interna

Muchas integraciones de pagos se apoyan en mandar al proveedor una referencia propia del negocio.

Por ejemplo:

- número de orden
- número de intento de pago
- identificador interno único

Eso luego ayuda a reconciliar lo externo con lo interno.

Podrías pensar algo así:

```java
String internalReference = "ORDER-" + pedido.getNumero();
```

y usarlo en el request al proveedor.

Esto puede parecer pequeño, pero ayuda muchísimo después.

## Qué relación tiene esto con errores y reintentos

Muy fuerte otra vez.

Porque iniciar un pago puede fallar por:

- timeout
- caída del proveedor
- rechazo por request inválida
- credenciales rotas
- fallo temporal

Y después recibir webhooks también puede traer:

- eventos repetidos
- estados desconocidos
- notificaciones fuera de orden
- payloads incompletos

Eso significa que pagos es uno de los casos donde mejor se ve la importancia de:

- traducir errores
- distinguir fallos temporales de funcionales
- decidir qué reintentar
- decidir qué marcar como pendiente
- tener muy buenos logs

## Qué relación tiene esto con seguridad

Absolutamente importante.

Los pagos tocan seguridad por varios lados:

- autenticación con el proveedor
- validación de webhooks
- integridad del monto
- usuario que inicia checkout
- protección contra manipulaciones del lado cliente
- no confiar ciegamente en valores que vuelven del frontend
- no marcar como pagado algo que el proveedor no confirmó de verdad

Esto vuelve todavía más importante que el backend sea la fuente seria de validación y transición de estados.

## Qué no conviene hacer

No conviene:

- marcar la orden como pagada solo porque se inició el checkout
- depender solo de lo que diga el frontend sobre si el pago salió bien
- ignorar webhooks o confirmaciones externas
- no guardar referencia local del intento
- acoplar todo el dominio al JSON del proveedor
- no pensar duplicados
- no pensar estados intermedios

Ese tipo de errores suele costar caro en este dominio.

## Otro error común

Pensar que el proveedor de pago reemplaza completamente tu modelo de negocio.
No.
El proveedor cobra; tu backend sigue necesitando saber:

- qué pedido era
- qué intento local se abrió
- qué estado interno corresponde
- qué hacer con la orden
- qué ve el frontend

## Otro error común

Creer que el flujo feliz basta para diseñar checkout.

En pagos, muchas veces lo difícil no es el éxito puro.
Lo difícil es:

- pendientes
- reintentos
- rechazo
- latencia
- webhook duplicado
- usuario que abandona
- provider timeout
- estados desalineados por unos instantes

Ahí está gran parte del diseño serio.

## Otro error común

No distinguir entre:
- respuesta inicial del checkout
- confirmación real del pago

Son dos cosas distintas y conviene tratarlas como tales.

## Una buena heurística

Podés preguntarte:

- ¿qué entidad local representa el intento de pago?
- ¿qué referencia uso para reconciliar proveedor y dominio?
- ¿cuándo considero realmente pagada la orden?
- ¿qué hago si el checkout inicia pero no se confirma?
- ¿cómo actualizo estado cuando llega el webhook?
- ¿cómo evito duplicados?
- ¿qué depende del proveedor y qué conserva mi dominio?

Responder eso te ayuda muchísimo a diseñar mejor esta integración.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque pagos es uno de los casos donde más claramente se ve si el backend está diseñado con madurez o solo “hace requests”.

Acá se cruzan:

- contratos externos
- dominio interno
- frontend
- webhooks
- estados
- consistencia
- errores
- seguridad

Es un caso ejemplar de backend real serio.

## Relación con Spring Boot

Spring Boot te da una base muy buena para implementar:

- gateway de pago
- clientes HTTP
- controllers de webhook
- services de checkout
- persistencia local del intento
- seguridad
- testing

Pero otra vez, lo más importante no es solo la herramienta.
Lo más importante es la arquitectura del flujo.

Y pagos es uno de los mejores terrenos para aprender a pensar esa arquitectura con mucha más madurez.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> integrar pagos o checkout externo de forma seria en Spring Boot implica modelar un estado local propio del intento de cobro, traducir el contrato del proveedor al lenguaje del dominio y tratar la confirmación real del pago como un flujo coordinado entre checkout inicial, referencias internas, webhooks, estados e idempotencia, y no como una simple llamada HTTP aislada.

## Resumen

- Los pagos son una de las integraciones externas más delicadas del backend real.
- No conviene tratarlos como una simple llamada HTTP ni como un flujo instantáneo.
- Tu backend suele necesitar una entidad o metadata local del intento de pago.
- La respuesta inicial del checkout y la confirmación real del pago suelen ser momentos distintos.
- Webhooks, estados, referencias internas e idempotencia son piezas centrales de este diseño.
- Seguridad, frontend y consistencia se cruzan fuertemente en este caso.
- Este tema consolida muy bien muchas de las ideas más maduras del bloque de integraciones externas.

## Próximo tema

En el próximo tema vas a ver cómo empezar a integrar autenticación externa u OAuth con proveedores como Google o GitHub, que es otro caso muy real donde tu backend tiene que convivir con identidad, contratos externos y flujos que no controla del todo.
