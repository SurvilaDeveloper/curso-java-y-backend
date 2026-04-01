---
title: "Cómo consumir APIs externas desde Spring Boot usando un cliente HTTP"
description: "Entender cómo se hace una llamada HTTP desde un backend Spring Boot hacia un servicio externo, qué piezas suelen intervenir y por qué conviene encapsular ese acceso en un cliente claro en lugar de desparramarlo por el sistema."
order: 76
module: "Integraciones con servicios externos"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo empezar a diseñar integraciones con servicios externos desde Spring Boot y por qué conviene pensar esas conexiones con bastante más cuidado que una simple llamada local.

Eso te dejó una idea muy importante:

- el tercero tiene su propio contrato
- puede fallar
- puede tardar
- puede exigir autenticación
- puede cambiar
- y no conviene contaminar todo tu dominio con esos detalles

Ahora toca bajar esa idea a algo mucho más práctico:

> ¿cómo hace realmente un backend Spring Boot para llamar a una API externa por HTTP?

Porque, en la práctica, muchísimas integraciones terminan teniendo este corazón:

- construir request
- enviar request HTTP
- recibir response
- interpretar status y body
- convertir ese resultado a algo usable por tu sistema

Este tema es clave porque marca el paso desde “entiendo por qué una integración externa merece diseño” a “entiendo cómo se implementa esa llamada de forma sana dentro del backend”.

## El problema de hablar con otro sistema por HTTP

Supongamos que tu backend necesita:

- consultar una cotización externa
- crear un pago en una pasarela
- pedir una dirección geocodificada
- enviar datos a un servicio interno
- subir metadata a un proveedor
- consultar stock o disponibilidad en otro sistema

En todos esos casos aparece una idea común:

> tu backend necesita actuar como cliente HTTP de otra API.

Eso significa que ya no solo expone endpoints.
Ahora también consume endpoints de otros.

Esta simetría es muy importante de entender:

- tu backend es servidor para tus clientes
- pero también puede ser cliente de otros servicios

## Qué significa “consumir una API externa”

Dicho simple:

> significa que tu backend construye una request HTTP hacia otro servicio, la envía, espera una respuesta y luego interpreta lo que recibió.

Esa request puede ser:

- `GET`
- `POST`
- `PUT`
- `DELETE`

Puede llevar:

- query params
- headers
- JSON body
- autenticación
- metadata

Y la respuesta puede traer:

- body JSON
- status code
- errores
- timeouts
- respuestas parciales
- datos que necesitan adaptarse a tu dominio

Eso hace que un cliente HTTP sea una pieza muy importante del backend real.

## Qué no conviene hacer

No conviene desparramar lógica HTTP por cualquier parte del sistema.

Por ejemplo, no es una buena idea que un service de negocio haga todo esto directamente una y otra vez:

- armar URL
- setear headers
- serializar body
- enviar request
- parsear response
- mapear errores
- decidir retry
- convertir a DTO interno

si además esa misma lógica se va repitiendo en varios lugares.

Eso suele volver el sistema:

- repetitivo
- difícil de testear
- difícil de cambiar
- muy acoplado al tercero

Por eso conviene encapsular bastante bien el cliente HTTP.

## Un ejemplo de mala dirección

Imaginá algo como:

```java
public class PedidoService {

    public void crearPedido(...) {
        // lógica del pedido
        // construir URL del proveedor externo
        // armar JSON manual
        // hacer POST
        // parsear respuesta
        // capturar timeout
        // capturar status 400 del tercero
        // convertirlo a excepción de negocio
    }
}
```

Acá se mezclan demasiadas cosas:

- caso de uso local
- transporte HTTP
- contrato externo
- errores de tercero
- detalles de serialización

Eso suele doler bastante con el tiempo.

## Una dirección más sana

Algo más razonable sería tener una pieza dedicada, por ejemplo:

```java
public interface ShippingGateway {
    ShippingQuoteResponse cotizarEnvio(ShippingQuoteRequest request);
}
```

o:

```java
public interface CurrencyGateway {
    CurrencyQuote obtenerCotizacion(String base, String target);
}
```

Y que la implementación concreta se encargue de la llamada HTTP.

Entonces tu caso de uso puede quedar algo más limpio:

```java
public class PedidoService {

    private final ShippingGateway shippingGateway;

    public PedidoService(ShippingGateway shippingGateway) {
        this.shippingGateway = shippingGateway;
    }

    public ResumenPedido cotizar(...) {
        return shippingGateway.cotizarEnvio(...);
    }
}
```

Esto no elimina toda la complejidad, pero la ubica mucho mejor.

## Qué piezas suelen intervenir en un cliente HTTP

Cuando consumís una API externa, suelen aparecer cosas como:

- base URL
- endpoint relativo
- método HTTP
- headers
- autenticación externa
- request body
- response body
- manejo de status no exitosos
- timeouts
- mapping entre DTO externo y modelo interno

Tener este mapa en la cabeza ayuda muchísimo a no pensar la integración como “solo un POST”.

## Qué suele pasar dentro del cliente externo

Conceptualmente, un cliente HTTP externo suele hacer algo así:

1. recibir datos del dominio o una request interna
2. adaptarlos al contrato del tercero
3. construir llamada HTTP
4. enviarla
5. leer respuesta
6. validar status
7. convertir body a DTO externo
8. traducir ese DTO a algo usable en tu sistema
9. devolver resultado o lanzar una excepción bien pensada

Este flujo es el corazón práctico de muchas integraciones.

## Qué opciones conceptuales existen para hacer la llamada

A lo largo del tiempo, en el ecosistema Spring aparecieron varias formas de consumir HTTP desde backend.

No hace falta ahora entrar a una comparación histórica obsesiva.
Lo importante para este tema es entender que:

> Spring Boot te permite construir clientes HTTP y usarlos como componentes normales de tu aplicación.

Más que casarte de memoria con una API concreta del framework, lo importante es captar qué rol cumple ese cliente en la arquitectura.

## Un ejemplo conceptual simple

Imaginá que querés consultar una API externa de cotizaciones:

```text
GET https://api.ejemplo.com/rates?base=USD&target=ARS
```

Podrías modelar un cliente así:

```java
public interface ExchangeRateGateway {
    ExchangeRate obtenerCotizacion(String base, String target);
}
```

Y luego una implementación concreta que haga la llamada HTTP real.

Eso ya ordena muchísimo el diseño.

## DTO externo de respuesta

Supongamos que la API externa responde algo como:

```json
{
  "base": "USD",
  "target": "ARS",
  "rate": 1234.56
}
```

Un DTO externo razonable podría ser:

```java
public class ExchangeRateApiResponse {

    private String base;
    private String target;
    private double rate;

    public String getBase() {
        return base;
    }

    public void setBase(String base) {
        this.base = base;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }

    public double getRate() {
        return rate;
    }

    public void setRate(double rate) {
        this.rate = rate;
    }
}
```

Esto expresa el contrato del tercero.
No necesariamente tu modelo final del dominio.

## Modelo interno más limpio

Quizá tu sistema prefiera algo como:

```java
public class ExchangeRate {

    private final String fromCurrency;
    private final String toCurrency;
    private final double value;

    public ExchangeRate(String fromCurrency, String toCurrency, double value) {
        this.fromCurrency = fromCurrency;
        this.toCurrency = toCurrency;
        this.value = value;
    }

    public String getFromCurrency() {
        return fromCurrency;
    }

    public String getToCurrency() {
        return toCurrency;
    }

    public double getValue() {
        return value;
    }
}
```

Fijate cómo ya aparece una idea muy importante:

- el contrato externo tiene una forma
- tu modelo interno puede tener otra más alineada a tu dominio

No hace falta mezclar ambos mundos si no querés.

## Un mapper o adaptación razonable

```java
public class ExchangeRateMapper {

    public ExchangeRate toDomain(ExchangeRateApiResponse response) {
        return new ExchangeRate(
                response.getBase(),
                response.getTarget(),
                response.getRate()
        );
    }
}
```

Esto parece una pequeña capa extra, pero ayuda muchísimo cuando el contrato externo empieza a complicarse.

## Un cliente HTTP conceptual

Sin pelearte demasiado todavía con la API exacta, la implementación podría verse conceptualmente así:

```java
import org.springframework.stereotype.Component;

@Component
public class ExchangeRateHttpClient implements ExchangeRateGateway {

    private final ExchangeRateMapper mapper;

    public ExchangeRateHttpClient(ExchangeRateMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public ExchangeRate obtenerCotizacion(String base, String target) {
        // construir request HTTP
        // enviar GET al tercero
        // deserializar response en ExchangeRateApiResponse
        // mapear a ExchangeRate
        // devolver
        return null;
    }
}
```

Este ejemplo todavía es esquemático, pero ya muestra la frontera importante:
el resto de tu sistema no necesita saber exactamente cómo se hizo la llamada HTTP.

## Qué conviene construir explícitamente

Cuando hagas la llamada real, normalmente necesitás pensar en cosas como:

- URL completa o base URL + path
- query params
- headers
- tipo de contenido
- autenticación si aplica
- body si es POST o PUT
- clase esperada en la respuesta

Esto vuelve la llamada bastante más rica que un simple string suelto.

## Un ejemplo conceptual con GET

Podrías imaginar algo como:

```java
public ExchangeRate obtenerCotizacion(String base, String target) {
    String path = "/rates?base=" + base + "&target=" + target;

    ExchangeRateApiResponse response = // llamar API externa

    return mapper.toDomain(response);
}
```

Más adelante lo refinarías para construir mejor query params y manejar errores.
Pero como mapa mental inicial funciona muy bien.

## Un ejemplo conceptual con POST

Supongamos que querés crear un pago externo.

Tu sistema piensa en un `Pedido`, pero el tercero espera algo así:

```json
{
  "amount": 12000,
  "referenceId": "ORD-123",
  "payerEmail": "gabriel@mail.com"
}
```

Podrías tener:

```java
public class CreatePaymentApiRequest {

    private double amount;
    private String referenceId;
    private String payerEmail;

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public String getPayerEmail() {
        return payerEmail;
    }

    public void setPayerEmail(String payerEmail) {
        this.payerEmail = payerEmail;
    }
}
```

Y un mapper desde tu dominio:

```java
public class PaymentGatewayMapper {

    public CreatePaymentApiRequest toExternalRequest(Pedido pedido) {
        CreatePaymentApiRequest request = new CreatePaymentApiRequest();
        request.setAmount(pedido.getTotal());
        request.setReferenceId(pedido.getNumero());
        request.setPayerEmail(pedido.getCustomerEmail());
        return request;
    }
}
```

Esto vuelve mucho más ordenado el paso de tu dominio al contrato externo.

## Qué pasa con la respuesta externa

Supongamos que el proveedor responde algo como:

```json
{
  "paymentId": "PAY-999",
  "status": "PENDING",
  "checkoutUrl": "https://..."
}
```

Podrías modelarlo así:

```java
public class CreatePaymentApiResponse {

    private String paymentId;
    private String status;
    private String checkoutUrl;

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

    public String getCheckoutUrl() {
        return checkoutUrl;
    }

    public void setCheckoutUrl(String checkoutUrl) {
        this.checkoutUrl = checkoutUrl;
    }
}
```

Y luego mapear a algo interno más útil para tu caso de uso.

## Qué gana el backend con estos DTOs separados

Muchísimo.

Porque evita que:

- todo tu dominio use nombres raros del proveedor
- todos tus services dependan de JSONs externos
- cambie el proveedor y tengas que tocar medio sistema
- el contrato externo contamine todas tus capas

Es una separación que suele pagar sola bastante rápido.

## Qué pasa con headers y autenticación externa

Muchas APIs externas exigen cosas como:

- `Authorization`
- API key
- headers custom
- tokens del proveedor
- `Content-Type`
- `Accept`

Entonces el cliente HTTP no solo manda URL y body.
También necesita construir bien los headers.

Por ejemplo, conceptualmente:

```java
Authorization: Bearer <api-token-del-proveedor>
Content-Type: application/json
Accept: application/json
```

Esto vuelve muy importante tener la configuración bien separada del código.

## Qué relación tiene esto con application.properties

Muy fuerte.

Normalmente no querés hardcodear cosas como:

- base URL del proveedor
- API key
- secret
- timeout
- path base
- credenciales por entorno

Eso suele vivir mejor en configuración.

Conceptualmente, podrías tener cosas como:

```properties
external.exchange.base-url=https://api.ejemplo.com
external.exchange.api-key=...
```

o su equivalente en yaml.

La idea importante es que la integración externa suele ser muy dependiente de configuración.

## Por qué esto es mejor que hardcodear

Porque después querés poder cambiar:

- entorno dev
- entorno test
- sandbox
- producción
- credenciales
- hosts

sin tener que andar editando strings sueltos por el código.

Esto se vuelve todavía más importante en integraciones reales de pagos, email o logística.

## Qué pasa con los errores HTTP del tercero

Un punto absolutamente central.

No todas las respuestas externas exitosas van a ser `200`.
Y no todas las fallas deberían tratarse igual.

Podés encontrarte con cosas como:

- `400` del tercero por request inválida
- `401` porque tus credenciales externas son incorrectas
- `404` porque el recurso externo no existe
- `429` por rate limit
- `500` del proveedor
- timeout sin response

Tu backend necesita decidir qué hace con eso.

## Qué no conviene hacer con esos errores

No conviene simplemente dejar que cualquier error técnico extraño del proveedor explote crudo por todo tu sistema sin criterio.

Suele ser mejor traducirlo a algo más entendible para tu aplicación.

Por ejemplo:

```java
public class ExternalServiceException extends RuntimeException {

    public ExternalServiceException(String message) {
        super(message);
    }
}
```

o incluso excepciones más específicas:

- `PaymentGatewayUnavailableException`
- `EmailProviderRejectedRequestException`
- `ExchangeRateUnavailableException`

Esto ayuda muchísimo a que el resto del sistema no tenga que conocer todos los caprichos del proveedor.

## Un ejemplo de lógica conceptual de error

Podrías pensar algo así:

- si el proveedor responde algo esperable pero rechaza la operación → excepción más funcional
- si el proveedor no responde o falla feo → excepción más técnica de servicio externo
- si el proveedor tarda demasiado → timeout controlado
- si devuelve formato raro → error de integración o parsing

No hace falta resolver todavía toda la taxonomía perfecta.
Lo importante es no tratar todos los fallos externos como si fueran idénticos.

## Qué pasa con el tiempo de espera

Otro punto importantísimo.

Cuando llamás un tercero, no conviene asumir que siempre responde rápido.

Por eso los timeouts son muy importantes conceptualmente.

Porque si no, una request de tu backend puede quedar esperando demasiado tiempo por un sistema externo y arruinar bastante la experiencia o el uso de recursos.

Entonces una integración real también implica pensar:

- cuánto estoy dispuesto a esperar
- qué pasa si se supera ese tiempo
- qué respuesta doy
- si conviene retry o no

Este tema seguirá creciendo más adelante, pero ya conviene empezar a verlo.

## Qué relación tiene esto con un caso de uso real

Supongamos que tu frontend llama a tu backend para cotizar un envío.

Tu backend a su vez llama a una API externa de shipping.

Si el tercero:

- tarda demasiado
- responde mal
- está caído

tu backend tiene que decidir qué respuesta darle al frontend.

Eso muestra una verdad muy importante:

> integrar un tercero no solo afecta tu backend; afecta también la experiencia final de tus propios clientes.

Por eso conviene diseñarlo con bastante criterio.

## Qué relación tiene esto con testing

Muy fuerte.

Porque apenas metés un cliente HTTP externo, aparecen nuevas preguntas de prueba:

- ¿se construyó bien la URL?
- ¿se mandaron headers correctos?
- ¿el body externo se armó bien?
- ¿se parseó bien la respuesta?
- ¿se tradujeron bien los errores?
- ¿qué pasa si el proveedor responde 500?
- ¿qué pasa si timeout?

Y muchas veces no querés testear esto pegándole siempre al servicio real.
Entonces las pruebas de integraciones tienen un sabor especial que después seguirás viendo.

## Qué gana el sistema si encapsula bien el cliente HTTP

Muchísimo.

Por ejemplo:

- la lógica de negocio queda más limpia
- el contrato externo queda localizado
- la autenticación externa queda aislada
- es más fácil cambiar de proveedor
- es más fácil testear
- es más fácil mapear errores
- la configuración queda mejor centralizada

Esta es una de las decisiones de diseño que más diferencia hacen a medida que el proyecto crece.

## Un ejemplo completo esquemático

Podés imaginar algo así:

```java
public interface PaymentGateway {
    PaymentInitResult crearPago(Pedido pedido);
}
```

```java
@Component
public class PaymentHttpClient implements PaymentGateway {

    private final PaymentGatewayMapper mapper;

    public PaymentHttpClient(PaymentGatewayMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public PaymentInitResult crearPago(Pedido pedido) {
        CreatePaymentApiRequest externalRequest = mapper.toExternalRequest(pedido);

        // enviar POST al proveedor
        // recibir CreatePaymentApiResponse
        // mapear a PaymentInitResult
        // devolver
        return null;
    }
}
```

```java
@Service
public class CheckoutService {

    private final PaymentGateway paymentGateway;

    public CheckoutService(PaymentGateway paymentGateway) {
        this.paymentGateway = paymentGateway;
    }

    public CheckoutResponse iniciarCheckout(Pedido pedido) {
        PaymentInitResult result = paymentGateway.crearPago(pedido);
        return new CheckoutResponse(result.getCheckoutUrl());
    }
}
```

Acá se ve muy bien la separación:

- service de negocio
- gateway
- contrato externo
- mapping

Ese es un patrón muy valioso.

## Qué no conviene olvidar

Un cliente HTTP externo no es solo:

- una URL
- un verbo HTTP
- y un body

También es:

- latencia
- errores
- autenticación
- configuración
- mapping
- contratos
- mantenimiento
- y evolución del proveedor

Tener esta imagen más completa desde temprano ayuda muchísimo.

## Otro error común

Pensar que “como la llamada es corta”, puede vivir en cualquier service y listo.

Las llamadas cortas también se desordenan rápido si se repiten o si el proveedor cambia.

## Otro error común

Reusar directamente DTOs externos como si fueran parte natural del dominio interno.

Eso a veces parece práctico al principio, pero suele aumentar mucho el acoplamiento.

## Otro error común

Hacer depender toda la lógica de negocio de strings, paths y headers del proveedor.

Eso vuelve el sistema mucho más frágil de lo que parece.

## Una buena heurística

Podés preguntarte:

- ¿qué parte de esta integración es contrato externo puro?
- ¿qué parte es lógica de mi dominio?
- ¿cómo las separo?
- ¿qué componente debería hacer la llamada?
- ¿qué DTOs son externos y cuáles internos?
- ¿qué errores externos debo traducir?

Responder eso ordena muchísimo la implementación.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque en backend real casi siempre terminás teniendo que consumir HTTP hacia otro sistema.

Entonces saber hacerlo de forma limpia es una habilidad muy importante.
No alcanza con “saber pegarle a una URL”.
Lo que importa es cómo esa llamada encaja dentro del diseño general del backend.

## Relación con Spring Boot

Spring Boot te da un entorno muy cómodo para construir clientes HTTP, inyectarlos como componentes, configurarlos y hacer que formen parte sana de tu arquitectura.

Pero de nuevo, lo más importante no es la herramienta puntual solamente.
Lo importante es entender el rol arquitectónico del cliente HTTP y no convertir la integración en un caos repartido por todo el sistema.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> consumir una API externa desde Spring Boot implica mucho más que hacer una request HTTP: conviene encapsular esa llamada en un cliente claro, separar DTOs externos del dominio interno, centralizar configuración y traducir errores y respuestas del tercero de una forma que el resto del backend pueda usar sin quedar acoplado al proveedor.

## Resumen

- Un backend Spring Boot puede actuar como cliente HTTP de servicios externos.
- No conviene desparramar llamadas HTTP por los services de negocio.
- Es muy útil encapsular integraciones en gateways o clientes específicos.
- DTOs externos y modelos internos no tienen por qué ser lo mismo.
- Configuración, headers, autenticación externa y manejo de errores son parte central de la integración.
- Este tema aterriza la idea de integración externa en la mecánica concreta de llamar APIs por HTTP.
- A partir de acá se vuelve mucho más importante cómo estructurás el puente entre tu sistema y un proveedor externo.

## Próximo tema

En el próximo tema vas a ver cómo manejar errores, timeouts y reintentos cuando dependés de un servicio externo, porque una vez que ya sabés llamar a otro sistema, la siguiente gran pregunta es qué hacer cuando ese sistema no responde como esperabas.
