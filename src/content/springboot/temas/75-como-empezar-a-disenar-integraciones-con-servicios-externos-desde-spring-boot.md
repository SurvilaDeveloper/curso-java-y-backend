---
title: "Cómo empezar a diseñar integraciones con servicios externos desde Spring Boot"
description: "Entender qué significa integrar un backend Spring Boot con APIs o servicios de terceros, qué problemas aparecen cuando tu sistema depende de algo externo y cómo pensar estas integraciones de forma más ordenada y mantenible."
order: 75
module: "Integraciones con servicios externos"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo versionar y evolucionar una API Spring Boot sin romper a los clientes que ya dependen de ella.

Eso te dio una idea muy importante:
una vez que el backend empieza a tener consumidores reales, deja de ser solo lógica interna y pasa a formar parte de un ecosistema más amplio de contratos y dependencias.

Ahora aparece un paso muy natural en proyectos reales:

> tu backend ya no solo se conecta con su base de datos y con su frontend, sino también con servicios externos.

Por ejemplo, muy pronto pueden aparecer necesidades como estas:

- enviar emails usando un proveedor externo
- cobrar con una pasarela de pagos
- consultar una API de geolocalización
- integrar Cloudinary o almacenamiento externo
- conectarte con un ERP
- hablar con un servicio de logística
- consumir una API de cotizaciones
- validar datos contra un tercero
- usar OAuth con proveedores externos
- llamar a otro microservicio o backend de tu propia organización

Ahí empieza el mundo de las **integraciones con servicios externos**.

Este tema es clave porque trabajar con terceros cambia bastante la forma de pensar el backend.
Ahora ya no alcanza con que tu código “esté bien”.
También importa:

- qué pasa si el servicio externo falla
- qué formato espera
- cuánto tarda
- qué autenticación usa
- cómo versiona su API
- qué parte de tu dominio debería conocerlo o no
- y cómo evitar acoplar todo tu sistema a detalles externos

## Qué significa integrar un servicio externo

Dicho de forma simple:

> integrar un servicio externo significa que tu backend hace requests o intercambia información con un sistema que no forma parte directa de tu base de código ni de tu proceso de ejecución principal.

Ese sistema puede ser:

- una API pública de terceros
- un SaaS
- una infraestructura cloud
- un proveedor de pagos
- un servicio interno de otra área
- otro backend de tu empresa
- una plataforma de mensajería o email
- un sistema heredado expuesto por HTTP

La idea central es esta:

> tu backend deja de ser una isla y empieza a depender de contratos fuera de tu control directo.

## Por qué esto cambia tanto el diseño

Porque hasta ahora, en muchos temas del curso, estabas trabajando con componentes que vos controlás más directamente:

- controllers propios
- services propios
- repositories propios
- base de datos propia
- DTOs tuyos
- seguridad tuya
- contratos de tu API

Cuando aparece un servicio externo, parte del flujo depende de algo que:

- no controlás completamente
- puede cambiar
- puede fallar
- puede responder lento
- puede tener otra semántica
- puede tener límites de uso
- puede pedir autenticación distinta
- puede devolver errores difíciles de interpretar

Eso vuelve el diseño bastante más interesante y más delicado.

## El problema de tratar un servicio externo como si fuera una función local

A veces al principio uno piensa algo así:

- “necesito enviar un email”
- “necesito cobrar”
- “necesito subir una imagen”
- “necesito consultar una API externa”

y lo modela mentalmente como si fuera casi lo mismo que llamar un método interno.

Pero no lo es.

Porque cuando llamás un servicio externo aparecen preguntas como:

- ¿qué pasa si no responde?
- ¿qué pasa si responde 500?
- ¿qué pasa si tarda demasiado?
- ¿qué pasa si cambia el formato?
- ¿qué pasa si hoy está disponible y mañana no?
- ¿qué pasa si me devuelve un error parcial?
- ¿qué hago si mi base ya cambió pero la integración externa falló?

Eso muestra por qué no conviene pensar estas integraciones como llamadas locales triviales.

## Un ejemplo muy común: enviar emails

Supongamos que tu sistema registra usuarios y querés mandar un email de bienvenida.

Podrías pensar el flujo así:

1. el usuario se registra
2. se guarda en la base
3. se llama a un proveedor externo de email
4. el proveedor intenta enviar el mensaje

Ya con este ejemplo aparecen varias preguntas reales:

- ¿qué pasa si el usuario se guardó pero el email falló?
- ¿hay que revertir el registro?
- ¿hay que reintentar más tarde?
- ¿el usuario debe enterarse?
- ¿el email es obligatorio o complementario?
- ¿qué logs conviene guardar?
- ¿tu service de negocio debería conocer el detalle del proveedor?

Eso ya muestra muy bien la complejidad que aparece.

## Otro ejemplo muy común: pagos

Supongamos que tu e-commerce quiere cobrar con una pasarela externa.

El flujo puede incluir cosas como:

- crear una intención de pago
- redirigir al usuario
- recibir confirmación
- consultar estado
- procesar webhook
- actualizar orden local

Esto ya no es “guardar una entidad y listo”.
Ahora tu sistema tiene que coordinarse con un actor externo que también tiene su propio estado y sus propios tiempos.

## Qué tipos de integraciones externas aparecen mucho

Algunos grupos muy comunes son:

### Comunicación
- email
- SMS
- WhatsApp
- push notifications

### Pagos
- Mercado Pago
- Stripe
- PayPal
- pasarelas locales

### Archivos y media
- Cloudinary
- S3
- almacenamiento externo
- CDN

### Geolocalización y mapas
- Google Maps
- geocoding
- cálculo de distancia
- validación de direcciones

### Identidad y auth externa
- OAuth
- login con Google
- login con GitHub
- proveedores de identidad

### Logística y negocio
- envíos
- ERP
- facturación electrónica
- stock externo
- partners

### Servicios internos
- otro microservicio
- API de otra área
- backend B2B
- servicios internos de la organización

Este bloque del curso suele crecer muchísimo porque el backend real vive lleno de estas conexiones.

## Qué cambia en la arquitectura mental

Hasta ahora, muchos casos de uso podían pensarse así:

- entra request
- validás
- leés o escribís tu base
- devolvés respuesta

Con integración externa, muchas veces el flujo pasa a ser algo más así:

- entra request
- validás
- actualizás o consultás tu base
- llamás a un sistema externo
- interpretás respuesta externa
- decidís qué hacer si falla
- tal vez persistís resultado de la integración
- devolvés respuesta

La cantidad de puntos donde algo puede salir distinto empieza a crecer bastante.

## Qué es un cliente externo dentro de tu backend

A nivel de diseño, suele ser muy útil pensar que no querés desparramar llamadas HTTP por todo el sistema.

En vez de eso, muchas veces conviene encapsular la integración en una clase o componente especializado.

Por ejemplo, algo conceptual como:

```java
public interface EmailGateway {
    void enviarBienvenida(String destinatario, String nombre);
}
```

o:

```java
public interface PaymentGateway {
    PagoExternoResponse crearPago(PagoExternoRequest request);
}
```

La idea importante no es el nombre exacto.
Es esta:

> el resto de tu sistema no debería depender directamente de cada detalle raro de una API externa si podés encapsularlo mejor.

## Por qué conviene encapsular la integración

Porque si no, terminás con cosas como:

- URLs externas sueltas por todos lados
- tokens de terceros repartidos por el código
- parseo manual repetido
- manejo de errores inconsistente
- fuerte acoplamiento al formato externo
- dificultad enorme para cambiar de proveedor más adelante

Encapsular ayuda a que tu backend siga teniendo fronteras más claras.

## Un ejemplo conceptual de mala idea

Supongamos un service de negocio así:

```java
public void registrarUsuario(RegisterRequest request) {
    // validar
    // guardar usuario
    // armar JSON para proveedor de email
    // hacer POST manual a https://api.mail-loquesea.com/send
    // interpretar response
    // capturar errores específicos del proveedor
}
```

Esto mezcla demasiadas cosas:

- lógica de negocio del registro
- detalles de email
- detalles HTTP
- detalles del proveedor
- detalles de error externo

Ese acoplamiento suele volverse incómodo muy rápido.

## Una forma más sana

Algo más razonable sería pensar algo así:

```java
public void registrarUsuario(RegisterRequest request) {
    // validar
    // guardar usuario
    emailGateway.enviarBienvenida(usuario.getEmail(), usuario.getUsername());
}
```

Y que `emailGateway` encapsule la integración externa.

Esto no resuelve mágicamente todos los problemas, pero ordena muchísimo las responsabilidades.

## Qué gana el sistema con esa separación

Muchísimo.

Por ejemplo:

- el caso de uso se entiende mejor
- el proveedor externo queda mejor aislado
- es más fácil testear
- es más fácil cambiar de proveedor
- los errores se pueden mapear con más criterio
- la lógica de negocio no queda contaminada con detalles de transporte

Eso hace una gran diferencia a medida que el proyecto crece.

## Qué tipo de cosas suelen vivir dentro del cliente o gateway externo

Normalmente, ahí suelen concentrarse cosas como:

- URL base del proveedor
- headers requeridos
- autenticación externa
- serialización de requests
- parseo de responses
- timeouts
- manejo de errores técnicos
- adaptación entre DTO externo y modelo interno

Esta lista ya te muestra por qué conviene que no quede desparramado por cualquier service de negocio.

## Qué relación tiene esto con DTOs externos

Muy fuerte.

Así como tu API tiene sus propios DTOs públicos, las integraciones externas muchas veces requieren sus propios contratos de request y response.

Por ejemplo:

- `CloudinaryUploadRequest`
- `MercadoPagoCreatePreferenceResponse`
- `EmailProviderSendRequest`

No significa que siempre debas usar esos nombres literalmente.
Lo importante es entender que:

> el contrato del tercero no tiene por qué ser el mismo que el contrato interno de tu dominio.

Y mezclar ambos sin criterio suele generar problemas.

## Por qué conviene mapear entre tu dominio y el contrato externo

Porque tu sistema debería seguir hablando el lenguaje de su dominio.

Por ejemplo, quizás tu sistema piensa en:

- `Pedido`
- `Usuario`
- `Pago`
- `Producto`

pero el proveedor externo piensa en:

- `merchant_order`
- `payer`
- `transaction_amount`
- `reference_id`

No querés contaminar todo tu dominio con ese vocabulario externo solo porque una integración lo use.

Por eso suele ser muy útil tener una capa de adaptación.

## Un ejemplo conceptual de adaptación

Podrías tener algo así:

```java
public class PaymentGatewayAdapter {

    public PagoExternoRequest toExternalRequest(Pedido pedido) {
        PagoExternoRequest request = new PagoExternoRequest();
        request.setAmount(pedido.getTotal());
        request.setReferenceId(pedido.getNumero());
        return request;
    }
}
```

Esto ya muestra una idea importante:
traducir entre tu mundo y el mundo externo.

## Qué pasa con los errores de terceros

Este es uno de los puntos más importantes del tema.

Porque una integración externa puede fallar de mil formas:

- timeout
- credenciales inválidas
- request mal formada
- proveedor caído
- respuesta inesperada
- rate limit
- error parcial
- rechazo funcional del servicio externo

Tu backend necesita decidir qué hace con eso.

No conviene dejar que todo error externo atraviese el sistema sin criterio.

## Un ejemplo mental importante

Supongamos:

- tu sistema crea una orden local
- luego intenta crear un pago externo
- el pago externo falla

Ahora tenés que decidir cosas como:

- ¿la orden queda creada igual?
- ¿queda en estado pendiente?
- ¿se revierte?
- ¿se marca como error?
- ¿se permite reintentar?
- ¿qué response devolvés al cliente?

Este tipo de preguntas es exactamente lo que vuelve tan interesante el diseño de integraciones.

## Qué relación tiene esto con transacciones

Muy fuerte.

Porque las integraciones externas suelen mostrarte un límite muy real:

> no todo lo que pasa en tu sistema puede entrar en una única transacción local mágica junto con un tercero.

Por ejemplo:

- tu base puede confirmar una transacción
- pero el tercero puede fallar después
- o al revés, el tercero puede aceptar algo y tu base puede fallar después

Esto obliga a pensar con más cuidado consistencia, estados intermedios y reintentos.

No hace falta resolver toda esa complejidad hoy mismo.
Pero conviene empezar a verla.

## Qué pasa con el tiempo de respuesta

Otra gran diferencia frente a tu propio código es que un tercero puede tardar bastante más de lo que esperás.

Entonces empiezan a importar cosas como:

- timeout
- reintentos
- experiencia del usuario mientras espera
- si el flujo debe ser síncrono o asíncrono
- qué pasa si la llamada tarda demasiado

Esto afecta directamente la UX y también la arquitectura del backend.

## Un ejemplo muy claro

No es lo mismo:

- guardar una entidad local en milisegundos

que:

- llamar a un proveedor externo que puede tardar varios segundos o fallar de manera intermitente

Ese simple hecho cambia mucho la manera de pensar un caso de uso.

## Qué relación tiene esto con configuración

Muy directa.

Porque una integración externa suele requerir:

- base URL
- API key
- secret
- credenciales
- endpoints del proveedor
- configuración por entorno
- timeouts

Eso significa que ya no conviene hardcodear cosas en el código.
La configuración gana muchísimo protagonismo.

## Qué relación tiene esto con seguridad

También es importante.

Porque muchas integraciones externas usan:

- API keys
- tokens
- firmas
- secretos
- webhooks autenticados
- credenciales por entorno

Entonces este bloque también dialoga bastante con todo lo que aprendiste antes sobre seguridad, aunque ahora desde otra perspectiva.

## Qué relación tiene esto con testing

Muy fuerte.

Porque probar una integración externa no es exactamente igual que probar solo lógica interna.

Muy rápido aparecen preguntas como:

- ¿cómo pruebo sin pegarle siempre al proveedor real?
- ¿cómo simulo respuestas?
- ¿cómo pruebo errores del tercero?
- ¿cómo verifico que mi backend reacciona bien a timeouts o rechazos?
- ¿cómo testeo el mapping entre mi dominio y el contrato externo?

Esto hace que el testing de integraciones sea un tema muy importante y con sabor propio.

## Qué relación tiene esto con observabilidad y logs

Muchísima.

Cuando un tercero entra en juego, se vuelve mucho más importante poder ver cosas como:

- qué llamada se hizo
- a qué endpoint externo
- cuánto tardó
- qué devolvió
- si falló
- si hubo reintento
- qué correlación tiene con un pedido o usuario local

Porque cuando algo sale mal, ya no alcanza con mirar solo tu base o tu service.
Ahora hay otro actor en escena.

## Una buena pregunta antes de integrar algo externo

Podés preguntarte:

- ¿esta integración es crítica o complementaria?
- ¿qué pasa si falla?
- ¿qué parte de mi dominio debería conocerla?
- ¿cómo voy a encapsularla?
- ¿qué contrato externo me impone?
- ¿cómo traduzco ese contrato a mi lenguaje interno?
- ¿cómo voy a manejar errores y reintentos?

Estas preguntas ordenan muchísimo el diseño.

## Qué no conviene hacer

No conviene:

- llamar APIs externas desde cualquier parte del código sin frontera clara
- mezclar lógica de negocio y detalles HTTP del proveedor
- dejar URLs y secretos hardcodeados
- asumir que el tercero siempre responde bien
- acoplar todo tu dominio al formato externo
- tratar errores externos como si fueran idénticos a errores internos

Ese tipo de decisiones suele doler mucho cuando el proyecto crece.

## Otro error común

Pensar que porque la integración “anda” ya está bien diseñada.

Una integración puede funcionar hoy y sin embargo estar:
- súper acoplada
- mal testeada
- mal configurada
- frágil ante fallos
- difícil de cambiar

Conviene no confundir funcionamiento momentáneo con diseño sano.

## Otro error común

No distinguir entre el caso de uso del negocio y el adaptador al tercero.

Por ejemplo, “crear una orden” no es lo mismo que “hacer POST al proveedor de pagos”.
Mezclar esas capas demasiado pronto suele complicar mucho el backend.

## Otro error común

Creer que todos los terceros tienen la misma confiabilidad y el mismo contrato estable.
No.
Y cuanto antes incorpores esa idea, mejor preparado va a estar tu diseño.

## Una buena heurística

Podés pensar así:

- mi dominio habla su idioma
- el tercero habla otro
- necesito un puente bien diseñado entre ambos
- ese puente debería encapsular detalles externos
- y el resto de mi backend no debería quedar completamente contaminado por ellos

Esa heurística vale muchísimo.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque casi ninguna aplicación medianamente seria vive aislada para siempre.

Muy rápido aparecen integraciones como:

- pagos
- emails
- almacenamiento
- auth social
- logística
- APIs de negocio
- servicios internos de otra área

Entonces este bloque no es una rareza.
Es una de las grandes transiciones entre un backend académico y un backend mucho más real.

## Relación con Spring Boot

Spring Boot te facilita muchísimo construir las capas de tu backend y también integrar clientes HTTP, configuración, seguridad y testing.

Pero la parte realmente importante no es solo que “se pueda hacer una llamada”.
Lo importante es **cómo la modelás** para que el sistema siga siendo claro, mantenible y robusto.

Y ese es exactamente el foco de este bloque que empieza acá.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> integrar servicios externos en Spring Boot significa hacer que tu backend dependa de contratos, tiempos, errores y formatos que no controlás del todo, por lo que conviene encapsular bien esas integraciones, adaptar su lenguaje al de tu dominio y diseñarlas pensando desde el principio en fallos, configuración y mantenibilidad.

## Resumen

- Una integración externa hace que tu backend dependa de un sistema fuera de tu control directo.
- No conviene tratar llamadas a terceros como si fueran simples métodos locales.
- Suele ser muy sano encapsular estas integraciones en clientes o gateways específicos.
- Los contratos externos no deberían contaminar sin filtro todo tu dominio interno.
- Errores, latencia, configuración y seguridad se vuelven mucho más importantes cuando aparece un tercero.
- Este tema abre un bloque muy realista del backend profesional.
- A partir de acá empieza a cobrar mucha importancia cómo diseñás el puente entre tu sistema y servicios externos.

## Próximo tema

En el próximo tema vas a ver cómo consumir APIs externas desde Spring Boot usando un cliente HTTP, que es el paso práctico natural después de entender por qué conviene encapsular y diseñar bien una integración externa.
