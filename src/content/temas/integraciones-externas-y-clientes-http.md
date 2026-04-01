---
title: "Integraciones externas y clientes HTTP"
description: "Cómo consumir APIs y servicios externos desde un backend Java, qué problemas aparecen en integraciones reales y qué buenas prácticas conviene adoptar."
order: 58
module: "Arquitectura y escalabilidad"
level: "intermedio"
draft: false
---

## Introducción

Hasta ahora ya recorriste una parte muy amplia del backend con Java y Spring Boot:

- controllers
- services
- DTOs
- validaciones
- manejo de errores
- seguridad
- persistencia
- testing
- observabilidad
- cache
- CI/CD
- arquitectura hexagonal
- mensajería y eventos

Eso ya te permite construir sistemas bastante serios.

Pero en muchos proyectos reales aparece otra necesidad muy importante:

**tu backend no vive solo**

Muy a menudo necesita hablar con otros sistemas.

Por ejemplo:

- pasarelas de pago
- servicios de email
- APIs de logística
- servicios de geolocalización
- APIs de facturación
- catálogos externos
- proveedores de identidad
- otros microservicios

Ahí entran las integraciones externas y los clientes HTTP.

## La idea general

Un backend moderno muchas veces no resuelve todo dentro de su propia base y su propio código.

En cambio, necesita consultar o invocar servicios externos.

Eso cambia bastante el panorama porque ya no dependés solo de tu lógica y tu base.
También dependés de:

- red
- latencia
- disponibilidad de terceros
- contratos externos
- autenticación hacia otros servicios
- errores remotos
- timeouts
- reintentos

Por eso las integraciones externas merecen una lección propia.

## Qué es una integración externa

Una integración externa es una comunicación entre tu aplicación y un sistema ajeno a su núcleo interno.

Ejemplos:

- llamar a una API REST de terceros
- consumir otro microservicio
- enviar datos a una pasarela de pago
- pedir cotización de envío
- consultar información de un proveedor externo

## Qué es un cliente HTTP

Un cliente HTTP es el componente que tu aplicación usa para enviar requests HTTP a otros servicios y recibir responses.

Dicho simple:

si tu aplicación expone endpoints usando controllers, un cliente HTTP hace el rol inverso:
sale a llamar endpoints ajenos.

## Qué problema resuelven estos clientes

Permiten que tu backend pueda:

- obtener información externa
- disparar acciones en otros sistemas
- enriquecer respuestas propias
- coordinar procesos distribuidos
- integrarse con productos y servicios reales

## Por qué este tema importa tanto

Porque muchos sistemas reales se vuelven valiosos precisamente por sus integraciones.

Un backend puede necesitar:

- cobrar
- enviar emails
- consultar stock externo
- emitir factura
- validar identidad
- sincronizar datos

Y todo eso requiere hablar bien con otros sistemas.

## Qué cambia respecto de trabajar solo “hacia adentro”

Cuando trabajás solo con tu base y tus clases internas, tenés bastante control.

Cuando integrás con un sistema externo, aparecen riesgos nuevos como:

- el servicio está caído
- responde lento
- cambió el contrato
- devuelve errores raros
- requiere autenticación especial
- devuelve datos incompletos
- tiene límites de rate
- no responde siempre igual

Eso exige más criterio técnico.

## Request y response hacia afuera

En una integración HTTP externa, tu backend hace cosas como:

- construir URL
- armar headers
- enviar body JSON
- manejar status codes
- parsear responses
- interpretar errores

O sea, muchos conceptos de HTTP y JSON que ya viste vuelven a aparecer, pero ahora del lado del cliente.

## Ejemplo mental simple

Supongamos que tu backend quiere consultar el precio de envío en un servicio externo.

Podría hacer algo así:

```text
POST https://shipping.example.com/api/quotes
```

enviando un JSON con:

- destino
- peso
- dimensiones

Y recibir algo como:

```json
{
  "provider": "FastShip",
  "price": 3500.00,
  "currency": "ARS",
  "estimatedDays": 2
}
```

## Qué componentes suelen aparecer

Cuando integrás servicios externos, suelen aparecer piezas como:

- DTOs de request y response externos
- cliente HTTP
- service de integración
- manejo de errores específicos
- timeouts
- reintentos
- logs
- métricas
- validaciones del contrato externo

## Dónde conviene ubicar la integración

No suele ser buena idea que el controller llame directo a un servicio externo.

Tampoco conviene mezclar toda la lógica externa de forma caótica.

Lo más sano suele ser que la integración viva en una capa o componente específico, por ejemplo:

- adapter externo
- client service
- integration service
- puerto de salida + adaptador, si usás una arquitectura más hexagonal

## Relación con arquitectura hexagonal

Este tema conecta muy bien con la lección anterior.

En una mirada hexagonal, una integración externa suele ser un adaptador de salida.

Por ejemplo:

### Puerto de salida

```java
public interface ShippingQuotePort {
    ShippingQuoteResult getQuote(ShippingQuoteCommand command);
}
```

### Adaptador concreto

```java
@Component
public class ShippingHttpAdapter implements ShippingQuotePort {
    // implementación con cliente HTTP real
}
```

## Qué gana el sistema con eso

Que el caso de uso no depende del cliente HTTP concreto ni de los detalles del proveedor externo.

Depende de una abstracción del negocio o de la aplicación.

## Qué herramientas hay en Java / Spring

En el ecosistema Spring vas a encontrar distintas formas de hacer llamadas HTTP externas.

Históricamente se usaron herramientas como:

- `RestTemplate`
- clientes reactivos o modernos del ecosistema
- librerías HTTP específicas

Para esta etapa no hace falta obsesionarse con una herramienta particular.
Lo más importante es entender el modelo general y los problemas reales que aparecen.

## Qué hace un cliente HTTP externo

A nivel conceptual, un cliente externo hace algo así:

1. recibe datos internos del sistema
2. construye request HTTP
3. envía request
4. recibe response
5. interpreta status y body
6. traduce eso a algo usable para el resto del backend

## DTOs externos

Una práctica muy sana es usar DTOs específicos para la integración externa.

Por ejemplo:

- `ShippingQuoteRequestDto`
- `ShippingQuoteResponseDto`

Eso ayuda a no mezclar directamente:

- modelo interno del dominio
- contrato externo del proveedor

## Por qué esto importa

Porque el contrato externo puede cambiar o tener rarezas propias.

Mantenerlo aislado reduce el acoplamiento.

## Ejemplo conceptual

### DTO de request externo

```java
public class ShippingQuoteRequestDto {
    private String postalCode;
    private double weight;

    public ShippingQuoteRequestDto(String postalCode, double weight) {
        this.postalCode = postalCode;
        this.weight = weight;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public double getWeight() {
        return weight;
    }
}
```

### DTO de response externo

```java
public class ShippingQuoteResponseDto {
    private String provider;
    private double price;
    private String currency;

    public String getProvider() {
        return provider;
    }

    public double getPrice() {
        return price;
    }

    public String getCurrency() {
        return currency;
    }
}
```

## Qué tiene de sano este enfoque

Que el resto del sistema no necesita conocer directamente el JSON crudo del proveedor.

## Flujo típico de integración

Un flujo bastante común podría ser:

1. service interno necesita cotización
2. llama a un puerto o cliente de integración
3. ese cliente arma request externa
4. recibe response
5. la transforma a un resultado interno
6. el caso de uso sigue trabajando con algo propio del sistema

## Ejemplo de resultado interno

```java
public class ShippingQuoteResult {
    private final String provider;
    private final double price;
    private final String currency;

    public ShippingQuoteResult(String provider, double price, String currency) {
        this.provider = provider;
        this.price = price;
        this.currency = currency;
    }

    public String getProvider() {
        return provider;
    }

    public double getPrice() {
        return price;
    }

    public String getCurrency() {
        return currency;
    }
}
```

## Qué muestra esto

Que conviene traducir el contrato externo a una forma propia y controlada del sistema.

## Problemas reales de una integración externa

Este es uno de los puntos más importantes de la lección.

Integrar con otro sistema no es solo “hacer un request”.

Hay problemas reales que aparecen muy seguido.

## 1. Timeouts

El servicio externo puede tardar demasiado.

No conviene dejar requests infinitas esperando.

## 2. Errores HTTP

Puede responder:

- `400`
- `401`
- `403`
- `404`
- `500`
- `503`

y cada uno puede requerir tratamiento distinto.

## 3. Latencia

Aunque funcione, puede ser lento.

Eso impacta directamente en tu API si la integración es sincrónica.

## 4. Contratos inestables

El proveedor puede cambiar el formato de response o ciertos campos.

## 5. Caídas parciales

A veces el sistema externo está caído, pero tu backend debería seguir funcionando al menos parcialmente.

## 6. Rate limits

Algunas APIs externas limitan cuántas requests podés hacer por tiempo.

## Qué implica todo esto

Que una integración externa debe diseñarse con más cuidado que una simple llamada local entre clases.

## Timeouts

Los timeouts son clave.

Un timeout define cuánto tiempo estás dispuesto a esperar una respuesta externa.

Sin timeouts razonables, una integración puede colgar o degradar tu sistema entero.

## Por qué esto importa tanto

Porque si un servicio externo está lento y tu backend espera indefinidamente, podés terminar con:

- threads ocupados
- requests colgadas
- peor experiencia para usuarios
- más inestabilidad general

## Reintentos

A veces conviene reintentar una integración si falla por algo temporal.

Por ejemplo:

- timeout puntual
- error transitorio
- caída momentánea de red

Pero no conviene reintentar ciegamente cualquier error.

## Ejemplo mental sano

Podría tener sentido reintentar:

- un `503 Service Unavailable`
- un timeout temporal

Podría no tener sentido reintentar:

- un `400 Bad Request`
- credenciales inválidas
- body mal formado

## Circuit breaker

En sistemas más avanzados aparece mucho la idea de circuit breaker.

No hace falta profundizar demasiado ahora, pero la intuición es esta:

si una integración externa está fallando demasiado, conviene dejar de insistir momentáneamente para no empeorar el problema.

Es una estrategia de resiliencia muy conocida.

## Fallbacks

A veces, si una integración externa falla, querés una degradación controlada.

Por ejemplo:

- mostrar “cotización no disponible”
- usar valor por defecto temporal
- seguir sin una funcionalidad no crítica

Eso es mejor que romper todo el flujo principal en algunos casos.

## Qué tareas conviene mantener síncronas y cuáles no

No toda integración tiene que hacerse dentro de la request principal.

Por ejemplo:

### Síncrono

- validar un pago si el negocio lo requiere inmediatamente
- obtener un dato indispensable para responder

### Asíncrono

- enviar email
- sincronizar analytics
- notificar sistema secundario
- registrar auditoría externa

Esto conecta mucho con la lección de mensajería y eventos.

## Integración síncrona vs asíncrona

### Síncrona

Tu backend espera respuesta del servicio externo en ese momento.

### Asíncrona

Tu backend puede publicar algo o encolar una tarea para que otro componente haga la integración después.

Elegir una u otra cambia mucho latencia, acoplamiento y resiliencia.

## Logs en integraciones

Las integraciones externas son un lugar donde logs razonables valen muchísimo.

Por ejemplo, conviene registrar cosas como:

- inicio de llamada externa
- proveedor o servicio llamado
- tiempo de respuesta
- errores relevantes
- status inesperados

## Qué no conviene loguear

Otra vez, cuidado con datos sensibles:

- tokens
- secretos
- datos personales innecesarios
- payloads completos si son delicados

## Métricas en integraciones

También es muy útil observar métricas como:

- cantidad de llamadas
- porcentaje de errores
- latencia promedio
- timeouts
- volumen por proveedor

Eso ayuda muchísimo a detectar si una integración está degradándose.

## Ejemplo conceptual de puerto de salida

```java
public interface PaymentGatewayPort {
    PaymentResult authorizePayment(PaymentCommand command);
}
```

## Adaptador concreto

```java
@Component
public class PaymentHttpAdapter implements PaymentGatewayPort {

    @Override
    public PaymentResult authorizePayment(PaymentCommand command) {
        // armar request HTTP
        // enviar request
        // interpretar response
        return new PaymentResult(true, "APPROVED");
    }
}
```

## Qué expresa esto

Que el núcleo del sistema no depende directamente del proveedor concreto de pagos.

Eso es muy sano arquitectónicamente.

## Ejemplo mental con e-commerce

Caso:
crear orden y cobrar.

Flujo posible:

1. usuario confirma compra
2. backend valida orden
3. backend llama a pasarela de pago
4. si pago aprueba, guarda orden confirmada
5. publica evento para email o logística

Acá la integración con pago puede ser crítica y probablemente síncrona.

En cambio, email y analytics pueden quedar asíncronos.

## Integraciones y errores del dominio

Otra práctica sana es no dejar que todo el sistema vea errores crudos del proveedor externo.

Muchas veces conviene traducirlos a excepciones o resultados propios.

Por ejemplo:

- `ExternalShippingUnavailableException`
- `PaymentRejectedException`
- `IdentityValidationFailedException`

Eso hace la lógica interna mucho más clara.

## Por qué traducir errores

Porque el proveedor externo puede usar formatos raros o inconsistentes.

El resto de tu sistema no debería depender de eso innecesariamente.

## Buenas prácticas iniciales

## 1. Aislar la integración en componentes claros

No mezclarla por todos lados.

## 2. Usar DTOs externos

Evita acoplarte demasiado al contrato ajeno.

## 3. Definir timeouts razonables

Muy importante.

## 4. Pensar cuándo conviene reintentar y cuándo no

No todo error merece retry.

## 5. Traducir contratos y errores externos al lenguaje interno del sistema

Eso mejora diseño y mantenibilidad.

## 6. Loguear y medir con criterio

Las integraciones suelen ser una fuente frecuente de problemas reales.

## Ejemplo completo conceptual

### Puerto

```java
public interface ShippingQuotePort {
    ShippingQuoteResult getQuote(ShippingQuoteCommand command);
}
```

### Resultado interno

```java
public class ShippingQuoteResult {
    private final String provider;
    private final double price;
    private final String currency;

    public ShippingQuoteResult(String provider, double price, String currency) {
        this.provider = provider;
        this.price = price;
        this.currency = currency;
    }

    public String getProvider() {
        return provider;
    }

    public double getPrice() {
        return price;
    }

    public String getCurrency() {
        return currency;
    }
}
```

### Adaptador

```java
@Component
public class ShippingHttpAdapter implements ShippingQuotePort {

    @Override
    public ShippingQuoteResult getQuote(ShippingQuoteCommand command) {
        // llamada HTTP al servicio externo
        // parseo del resultado
        return new ShippingQuoteResult("FastShip", 3500.00, "ARS");
    }
}
```

## Qué demuestra este ejemplo

Demuestra la idea más importante:

- el caso de uso necesita una capacidad
- la integración externa queda encapsulada en un adaptador
- el sistema gana desacople y claridad

## Relación con lo anterior

Este tema conecta muy bien con:

- HTTP y JSON
- DTOs
- manejo de errores
- observabilidad
- mensajería
- arquitectura hexagonal
- proyecto integrador

Porque en cuanto el proyecto se vuelve más real, casi siempre empieza a hablar con otros sistemas.

## Comparación con otros lenguajes

### Si venís de JavaScript

Probablemente ya viste `fetch`, `axios` o SDKs de terceros para consumir APIs. En Java y Spring Boot la idea es la misma, pero suele cuidarse mucho más la separación entre contrato externo, lógica del negocio, timeouts, errores y adaptadores.

### Si venís de Python

Puede recordarte a clientes HTTP para consumir APIs externas, con DTOs, manejo de errores y timeouts. En Java, la gran ventaja es que esto puede integrarse muy bien con una arquitectura más explícita y con contratos tipados más claros.

## Errores comunes

### 1. Llamar APIs externas directo desde controllers

Eso suele mezclar demasiadas responsabilidades.

### 2. No definir timeouts

Puede degradar todo el sistema.

### 3. No traducir errores externos

Entonces el sistema queda demasiado atado al proveedor.

### 4. No pensar latencia y reintentos

Las integraciones reales fallan y se ponen lentas.

### 5. Acoplar demasiado el dominio al JSON o contrato del proveedor externo

Eso complica cambios futuros.

## Mini ejercicio

Tomá un caso de uso de tu proyecto integrador y pensá una integración externa razonable.

Definí:

1. qué servicio externo sería
2. si la llamada debería ser síncrona o asíncrona
3. qué puerto de salida usarías
4. qué DTO externo de request y response necesitarías
5. qué errores o timeouts deberías contemplar

## Ejemplo posible

Caso:
cotización de envío

- servicio externo: API de logística
- llamada: síncrona
- puerto: `ShippingQuotePort`
- DTO request: código postal + peso
- DTO response: proveedor + precio + moneda
- errores:
  - timeout
  - `503`
  - respuesta inválida
  - credencial expirada

## Resumen

En esta lección viste que:

- muchos backends reales necesitan integrarse con servicios externos
- los clientes HTTP permiten consumir APIs ajenas desde tu backend
- conviene aislar esas integraciones en componentes claros
- DTOs externos, timeouts, manejo de errores y observabilidad son piezas muy importantes
- este tipo de integración encaja muy bien con arquitectura hexagonal y adaptadores de salida
- diseñar bien una integración externa es mucho más que “hacer un request”

## Siguiente tema

La siguiente natural es **resiliencia: timeouts, reintentos y circuit breakers**, porque después de entender cómo integrar servicios externos, el siguiente paso muy valioso es aprender a proteger tu sistema frente a fallos, lentitud o inestabilidad de esas dependencias.
