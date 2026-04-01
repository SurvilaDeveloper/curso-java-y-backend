---
title: "Cómo separar dominio, aplicación e infraestructura en Spring Boot sin caer en sobreingeniería"
description: "Entender cómo empezar a distinguir reglas de negocio, casos de uso e infraestructura en un backend Spring Boot, y por qué esta separación puede aportar mucha claridad cuando el sistema crece, siempre que no se convierta en complejidad artificial."
order: 85
module: "Arquitectura y crecimiento del backend"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo estructurar proyectos grandes o con muchos módulos en Spring Boot cuando el backend ya empezó a reunir cosas como:

- auth
- frontend real
- pagos
- storage
- notificaciones
- webhooks
- integraciones externas
- varios dominios funcionales

Eso ya te dejó una idea muy importante:

> cuando el sistema crece, la estructura deja de ser una cuestión menor y pasa a influir muchísimo en la claridad, el mantenimiento y la velocidad para evolucionar el backend.

Ahora aparece una pregunta muy natural cuando el proyecto ya dejó de ser chico:

> además de ordenar carpetas o módulos, ¿cómo separo mejor las responsabilidades internas entre negocio, casos de uso e infraestructura?

Porque una cosa es agrupar por módulos.
Pero otra, igual de importante, es distinguir mejor dentro de cada módulo qué parte del sistema representa:

- reglas del negocio
- coordinación del caso de uso
- integración con base, web, terceros o framework

Ahí aparecen tres palabras muy importantes:

- **dominio**
- **aplicación**
- **infraestructura**

Este tema es clave porque te ayuda a introducir una separación mucho más madura sin caer todavía en una arquitectura pomposa o sobrediseñada.

## El problema de mezclar demasiado todo dentro del mismo service

Cuando un backend todavía es chico, es muy común que una clase `Service` haga un poco de todo:

- valida reglas de negocio
- coordina el caso de uso
- llama repositorios
- habla con proveedores externos
- arma DTOs
- interpreta respuestas HTTP
- decide estados del dominio
- maneja errores técnicos

Y durante un tiempo eso puede parecer razonable.

Pero cuando el sistema crece, ese tipo de service empieza a convertirse en una especie de “cerebro gigante” donde se amontonan responsabilidades muy distintas.

Entonces aparece una pregunta importante:

> ¿todo esto pertenece realmente al mismo nivel de la arquitectura?

Muchas veces, la respuesta es no.

## Qué significa separar dominio, aplicación e infraestructura

No significa necesariamente copiar una arquitectura famosa al pie de la letra ni convertir el backend en un laberinto de paquetes.

Primero conviene entender la intuición básica.

### Dominio
Es la parte que expresa el negocio:
- reglas
- estados
- invariantes
- entidades
- conceptos propios del sistema

### Aplicación
Es la parte que coordina casos de uso:
- qué flujo se ejecuta
- qué pasos siguen
- qué puertos o servicios usa
- cómo se orquesta el trabajo

### Infraestructura
Es la parte que conecta con detalles concretos:
- base de datos
- HTTP
- providers externos
- Spring
- storage
- email
- security plumbing
- transporte

Esta distinción, bien usada, puede aclarar muchísimo un proyecto grande.

## Una intuición muy útil

Podés pensar así:

- **dominio**: qué significa algo para mi negocio
- **aplicación**: qué tiene que pasar en este caso de uso
- **infraestructura**: con qué mecanismos técnicos concretos lo hago

Esa frase resume muchísimo del tema.

## Qué suele pertenecer al dominio

Por ejemplo:

- `Pedido`
- `Usuario`
- `Producto`
- `PaymentAttempt`
- `OrderStatus`
- reglas como:
  - “no se puede pagar una orden cancelada”
  - “un producto eliminado no debe publicarse”
  - “una cuenta inactiva no puede operar”
  - “un intento de pago aprobado no vuelve a pendiente”

Es decir, el dominio expresa el lenguaje y las reglas del negocio, no la mecánica del framework.

## Qué suele pertenecer a aplicación

Por ejemplo:

- iniciar checkout
- registrar usuario
- aprobar un pedido
- procesar webhook de pago
- cambiar imagen principal
- solicitar reset de contraseña

Acá ya no estás solo en el nivel del concepto puro del negocio.
Estás en el nivel del **caso de uso**:
qué hay que ejecutar, en qué orden y con qué dependencias.

## Qué suele pertenecer a infraestructura

Por ejemplo:

- `JpaRepository`
- cliente HTTP a proveedor de pagos
- cliente de email
- integración con storage externo
- implementación concreta de `UserDetailsService`
- filtro JWT
- controller HTTP
- configuración Spring
- adaptador a Cloudinary
- webhook signature validator del proveedor
- mapeo técnico a JSON de terceros

Esta capa suele estar mucho más pegada a herramientas, frameworks y contratos técnicos externos.

## Por qué esta separación puede ayudar tanto

Porque muchas veces mezcla problemas de niveles distintos si no la tenés presente.

Por ejemplo:

- una regla de negocio no debería depender directamente de cómo habla el proveedor externo
- un caso de uso no debería quedar oculto detrás de detalles técnicos dispersos
- una integración externa no debería definir el lenguaje principal del dominio
- una entidad de negocio no debería vivir totalmente contaminada por DTOs HTTP o contratos del proveedor

Separar mejor estas capas ayuda a que el sistema respire mejor.

## Un ejemplo muy concreto

Supongamos este caso de uso:

> iniciar checkout para un pedido

Si todo está mezclado, podrías terminar con un service que:

- valida estado del pedido
- arma request del proveedor externo
- hace POST HTTP
- interpreta JSON del proveedor
- decide si el pedido puede o no iniciar pago
- actualiza estados
- guarda intento
- arma response para el controller

Funciona, sí.
Pero mezcla demasiadas cosas.

## Cómo se ve eso mejor separado

Podrías pensar algo así:

### Dominio
- `Pedido`
- `PaymentAttempt`
- reglas como:
  - “solo se puede iniciar checkout si el pedido está en estado pendiente”
  - “no se inicia un nuevo intento si ya hay uno aprobado”

### Aplicación
- `StartCheckoutUseCase`
- coordina:
  - cargar pedido
  - validar reglas del dominio
  - pedir al gateway externo que inicie pago
  - guardar intento local
  - devolver resultado

### Infraestructura
- `PaymentGatewayHttpClient`
- `PaymentAttemptJpaRepository`
- controller que expone `/checkout`
- configuración del proveedor externo

Este ejemplo muestra muy bien la diferencia de niveles.

## Qué significa “sin caer en sobreingeniería”

Esto es importantísimo.

Porque una vez que alguien escucha “dominio, aplicación, infraestructura” puede entusiasmarse demasiado y terminar creando:

- 200 interfaces innecesarias
- 15 paquetes vacíos
- clases diminutas que solo rebotan llamadas
- ceremonias excesivas
- capas que no resuelven ningún problema real

Y eso también es malo.

La meta no es “hacer arquitectura linda en papel”.
La meta es:

> separar mejor responsabilidades cuando esa separación realmente hace más claro y más mantenible el backend.

## Qué señales muestran que esta separación ya te empieza a hacer falta

Por ejemplo:

- tus services hacen demasiadas cosas distintas
- reglas de negocio y detalles de infraestructura están demasiado mezclados
- el vocabulario del proveedor externo ya contaminó el dominio
- controllers y services contienen demasiada lógica del caso de uso
- los tests son incómodos porque todo depende de todo
- cambiar una integración externa obliga a tocar demasiada lógica de negocio
- el proyecto ya creció lo suficiente como para que las responsabilidades mezcladas se noten

Si pasa eso, probablemente esta separación ya empiece a aportar valor real.

## Qué suele vivir en dominio

No hace falta ponerse dogmático, pero muchas veces en dominio viven cosas como:

- entidades
- value objects
- enums de negocio
- reglas
- validaciones centrales del modelo
- excepciones de negocio
- transiciones de estado
- comportamientos relevantes del núcleo del sistema

Por ejemplo:

```java
public class Pedido {

    private OrderStatus status;

    public void iniciarCheckout() {
        if (status != OrderStatus.PENDING) {
            throw new DomainException("Solo se puede iniciar checkout para pedidos pendientes");
        }
    }
}
```

Este ejemplo es simple, pero muestra algo importante:
la regla pertenece al negocio, no al proveedor externo.

## Qué suele vivir en aplicación

Muchas veces viven cosas como:

- services de caso de uso
- commands o requests internas
- coordinación entre repositorios y gateways
- orquestación del flujo
- decisiones sobre qué pasos ejecutar
- publicación de eventos de aplicación si corresponde

Por ejemplo:

```java
public class StartCheckoutUseCase {

    public CheckoutResult execute(Long orderId) {
        // cargar pedido
        // invocar regla de negocio
        // llamar gateway
        // persistir intento
        // devolver resultado
    }
}
```

La aplicación coordina.
No debería ser ni puro dominio ni puro detalle técnico.

## Qué suele vivir en infraestructura

Suelen vivir cosas como:

- repositorios JPA concretos
- implementaciones de gateways externos
- controllers REST
- configuraciones
- filtros
- clientes HTTP
- storage adapters
- email adapters
- DTOs puramente técnicos de terceros

Por ejemplo:

```java
@Component
public class PaymentGatewayHttpClient implements PaymentGateway {
    // llamada real al proveedor
}
```

Acá estás claramente en el mundo del detalle técnico concreto.

## Qué relación tiene esto con interfaces o puertos

Muy directa.

A veces, para separar mejor aplicación o dominio de infraestructura, aparecen abstracciones como:

- `PaymentGateway`
- `EmailGateway`
- `StorageGateway`
- `OrderRepository` como puerto
- `UserLookupService`

La idea es que el caso de uso o el dominio dependan más de una capacidad abstracta que del detalle concreto del proveedor.

Esto puede ser muy útil, siempre que no lo lleves al extremo innecesariamente.

## Un ejemplo bastante sano

```java
public interface PaymentGateway {
    PaymentInitResult startCheckout(PaymentInitCommand command);
}
```

Luego, en infraestructura:

```java
@Component
public class ExternalPaymentHttpClient implements PaymentGateway {
    // implementación concreta
}
```

Y en aplicación:

```java
@Service
public class StartCheckoutUseCase {

    private final PaymentGateway paymentGateway;

    public StartCheckoutUseCase(PaymentGateway paymentGateway) {
        this.paymentGateway = paymentGateway;
    }

    public CheckoutResult execute(...) {
        // coordinar flujo
    }
}
```

Este patrón puede aportar muchísimo si el proyecto ya tiene varias integraciones y suficiente complejidad.

## Qué gana el sistema con este tipo de separación

Muchísimo.

Por ejemplo:

- el dominio queda más limpio
- la lógica de negocio no depende tan directo del framework
- cambiar proveedor externo cuesta menos
- el caso de uso se lee mejor
- los tests suelen ser más claros
- la estructura del proyecto cuenta mejor qué hace cada parte

No es magia, pero sí una mejora muy grande cuando el backend ya creció.

## Qué relación tiene esto con testing

Muy fuerte.

Cuando separás mejor:

- dominio
- aplicación
- infraestructura

también se vuelve más claro qué testear en cada nivel.

Por ejemplo:

### Dominio
- reglas e invariantes

### Aplicación
- flujo del caso de uso
- coordinación entre dependencias

### Infraestructura
- integración real con JPA, HTTP, storage, etc.

Esto puede hacer que el testeo sea mucho más expresivo y menos confuso.

## Qué relación tiene esto con módulos grandes

También muy directa.

Dentro de un módulo como `payments/`, por ejemplo, podrías llegar a tener algo así:

```text
payments/
  domain/
  application/
  infrastructure/
```

Y dentro de cada uno, recién después, sus clases concretas.

Eso puede tener muchísimo sentido cuando el módulo ya tiene suficiente entidad propia.

Por ejemplo:

```text
payments/
  domain/
    PaymentAttempt.java
    PaymentStatus.java
  application/
    StartCheckoutUseCase.java
    ProcessPaymentWebhookUseCase.java
  infrastructure/
    gateway/
    repository/
    webhook/
    controller/
```

Esto ya expresa una arquitectura bastante más madura sin necesidad de volverse una locura de inmediato.

## Qué no hace falta hacer todavía

No hace falta convertir todo el proyecto de golpe en una arquitectura hiperformal con:

- millones de interfaces
- módulos Maven separados
- bounded contexts ultra duros
- capas infinitas
- ceremonias excesivas

Primero alcanza con introducir una separación más consciente de responsabilidades.

Después, si el sistema lo pide, podés seguir refinando.

## Una muy buena pregunta práctica

Podés preguntarte:

> ¿esta clase habla más del negocio, del caso de uso o del mecanismo técnico?

Esa pregunta sola ya ordena muchísimo.

Por ejemplo:

- `Pedido` → dominio
- `StartCheckoutUseCase` → aplicación
- `ExternalPaymentHttpClient` → infraestructura
- `PaymentWebhookController` → infraestructura web
- `JwtAuthenticationFilter` → infraestructura de seguridad
- `UsuarioRegistradoEvent` → depende del diseño, pero muchas veces queda muy cerca de aplicación o dominio según el caso

No siempre va a haber una respuesta perfecta.
Pero esta pregunta mejora mucho el criterio.

## Qué pasa con DTOs

Muy buena pregunta.

No todos los DTOs tienen el mismo rol.

Por ejemplo:

- request/response HTTP públicas → muchas veces infraestructura web
- DTOs del proveedor externo → infraestructura de integración
- commands internos del caso de uso → aplicación

Este matiz es muy valioso.
Porque ayuda a no meter todos los DTOs en un mismo cajón indiferenciado.

## Qué pasa con repositorios

También depende del nivel de sofisticación del diseño.

A veces, cuando el proyecto todavía es más simple, `repository` puede convivir bastante cerca del resto sin demasiado problema.

Pero a medida que el sistema crece, puede empezar a tener sentido distinguir:

- contrato o necesidad del caso de uso
- implementación concreta con JPA

No hace falta hacerlo siempre con máxima pureza.
Pero entender la diferencia ayuda bastante.

## Qué no conviene hacer

No conviene crear capas vacías solo por seguir una moda arquitectónica.

Tampoco conviene decir “como no quiero sobreingeniería, entonces mezclo todo”.
La clave está en una separación que aporte claridad real.

## Otro error común

Ponerle nombres sofisticados a paquetes sin cambiar realmente la calidad del diseño.
No se trata de rebautizar `service` como `application` y listo.
Se trata de cambiar de verdad cómo pensás las responsabilidades.

## Otro error común

Intentar aplicar una arquitectura compleja completa en un proyecto que todavía no la necesita.
Eso puede agregar fricción innecesaria.

## Otro error común

No separar nada aunque el proyecto ya grite por esa separación.
Ahí también aparece costo real:
services gigantes, dependencias cruzadas y dificultad para evolucionar.

## Una buena heurística

Podés preguntarte:

- ¿esta clase expresa negocio o solo técnica?
- ¿estoy coordinando un caso de uso o modelando una regla?
- ¿estoy hablando con un proveedor o con mi dominio?
- ¿esta dependencia debería conocer detalles tan concretos?
- ¿mi módulo ya está lo bastante grande como para distinguir dominio, aplicación e infraestructura?

Responder esto te ayuda muchísimo a introducir separación donde realmente aporta.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque a esta altura del backend ya tenés:

- módulos
- seguridad
- integraciones externas
- frontend real
- pagos
- storage
- notificaciones
- webhooks

Y seguir metiendo todo en “services” cada vez más grandes suele volverse una carga importante.

Entonces esta separación no es teoría por teoría.
Es una forma muy práctica de mantener el backend respirable cuando ya creció bastante.

## Relación con Spring Boot

Spring Boot no te impide esta separación.
Al contrario, te deja bastante libertad para modelar mejor tu proyecto.

Pero justamente por esa libertad, conviene usarla con criterio:
no para hacer arquitectura decorativa, sino para que el sistema siga siendo claro y mantenible a medida que suma responsabilidades.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> separar dominio, aplicación e infraestructura en Spring Boot puede aportar muchísima claridad cuando el backend crece, porque ayuda a distinguir reglas del negocio, coordinación de casos de uso y detalles técnicos concretos, siempre que esa separación responda a problemas reales del sistema y no se convierta en sobreingeniería vacía.

## Resumen

- A medida que el backend crece, una sola capa de services suele empezar a mezclar demasiadas responsabilidades.
- Dominio, aplicación e infraestructura ayudan a distinguir mejor negocio, caso de uso y técnica.
- Esta separación puede mejorar claridad, testing, evolución y aislamiento frente a integraciones o frameworks.
- No hace falta aplicar una arquitectura gigantesca de golpe para empezar a beneficiarte.
- Lo importante es introducir la separación cuando resuelve problemas reales del proyecto.
- DTOs, repositorios, gateways, eventos y controllers pueden entenderse mucho mejor si pensás en qué nivel arquitectónico viven.
- Este tema continúa la maduración del backend grande pasando de “módulos” a una separación más fina y útil de responsabilidades.

## Próximo tema

En el próximo tema vas a ver cómo pensar mejor límites de contexto y dependencias entre módulos del backend, para evitar que auth, pagos, usuarios, storage y demás terminen todos conociéndose demasiado entre sí.
