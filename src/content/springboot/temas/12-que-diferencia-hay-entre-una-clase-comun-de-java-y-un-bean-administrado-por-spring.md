---
title: "Qué diferencia hay entre una clase común de Java y un bean administrado por Spring"
description: "Una explicación clara para entender qué cambia cuando una clase deja de ser solo un objeto común de Java y pasa a ser administrada por el contenedor de Spring."
order: 12
module: "Fundamentos de Spring y Spring Boot"
level: "intro"
draft: false
---

Hasta ahora ya viste varias piezas importantes del mundo Spring:

- qué es Spring Framework
- qué aporta Spring Boot
- qué son los beans
- cómo funciona la inyección de dependencias
- qué anotaciones aparecen con más frecuencia
- cómo se organizan las capas de una aplicación

Con todo eso sobre la mesa, aparece una pregunta muy importante:

> ¿qué diferencia real hay entre una clase común de Java y una clase administrada por Spring?

A primera vista, ambas siguen siendo clases Java.

Las dos tienen:

- atributos
- métodos
- constructores
- lógica
- tipos normales del lenguaje

Pero cuando una clase pasa a estar administrada por Spring, cambia algo fundamental:

> ya no es solamente una clase que vos usás manualmente, sino una pieza que forma parte del contenedor.

Y esa diferencia tiene consecuencias prácticas muy importantes.

## Una clase común de Java

Una clase común de Java es una clase que existe por sí misma, sin participación del contenedor de Spring.

Por ejemplo:

```java
public class CalculadoraDescuentos {

    public double aplicar(double precio, double porcentaje) {
        return precio - (precio * porcentaje / 100);
    }
}
```

Esta clase no tiene nada de malo.

Es una clase normal.

Para usarla, podrías hacer esto:

```java
CalculadoraDescuentos calculadora = new CalculadoraDescuentos();
double resultado = calculadora.aplicar(1000, 10);
```

Acá el objeto:

- lo creás vos
- lo administrás vos
- decidís cuándo instanciarlo
- decidís dónde guardarlo
- decidís cómo pasarlo a otras clases

En otras palabras, el ciclo de vida del objeto depende completamente de tu código.

## Qué es un bean administrado por Spring

Un bean administrado por Spring también es, en esencia, un objeto Java.

La diferencia es que ese objeto:

- lo crea Spring
- lo registra Spring dentro del contenedor
- puede ser inyectado en otras clases
- puede participar del ciclo de vida del contexto
- puede configurarse de forma declarativa
- puede integrarse con muchas otras características del framework

Por ejemplo:

```java
@Service
public class CalculadoraDescuentos {

    public double aplicar(double precio, double porcentaje) {
        return precio - (precio * porcentaje / 100);
    }
}
```

Ahora esa clase ya no es solamente una clase “normal” a nivel de uso dentro de la aplicación.

Si Spring la detecta durante el component scanning, la registra como bean.

Y entonces otra clase puede recibirla así:

```java
@Service
public class PedidoService {

    private final CalculadoraDescuentos calculadoraDescuentos;

    public PedidoService(CalculadoraDescuentos calculadoraDescuentos) {
        this.calculadoraDescuentos = calculadoraDescuentos;
    }
}
```

Acá `PedidoService` no la crea con `new`.

La recibe desde el contenedor.

## La diferencia más importante: quién controla la creación

Esta es probablemente la idea central de todo el tema.

### En una clase común
La clase depende de que vos la instancies manualmente.

### En un bean
La creación del objeto pasa a estar controlada por Spring.

Eso cambia muchísimo la manera de construir una aplicación.

Porque ya no pensás solo en objetos aislados.

Pasás a pensar en un sistema donde las piezas:

- se registran
- se descubren
- se conectan
- se inyectan
- se configuran

Todo eso bajo el control del contenedor.

## Un ejemplo comparativo

### Sin Spring

```java
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final EmailService emailService;

    public PedidoService() {
        this.pedidoRepository = new PedidoRepository();
        this.emailService = new EmailService();
    }

    public void crearPedido() {
        pedidoRepository.guardar();
        emailService.enviarConfirmacion();
    }
}
```

Este enfoque trae varios problemas:

- `PedidoService` decide qué implementación usar
- las dependencias quedan acopladas
- testear se vuelve más incómodo
- reemplazar piezas cuesta más
- el código escala peor

### Con Spring

```java
@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final EmailService emailService;

    public PedidoService(PedidoRepository pedidoRepository, EmailService emailService) {
        this.pedidoRepository = pedidoRepository;
        this.emailService = emailService;
    }

    public void crearPedido() {
        pedidoRepository.guardar();
        emailService.enviarConfirmacion();
    }
}
```

Ahora:

- `PedidoService` no crea sus dependencias
- queda más desacoplado
- es más fácil reemplazar dependencias
- resulta más fácil de probar
- se integra naturalmente al estilo de trabajo de Spring

## Un bean sigue siendo un objeto Java

Esto también es muy importante.

Spring no inventa una categoría mágica completamente distinta.

Un bean sigue siendo un objeto Java.

Podés tener:

- atributos privados
- métodos públicos
- constructores
- interfaces
- herencia
- composición
- encapsulamiento

Lo que cambia no es el lenguaje.

Lo que cambia es **el contexto en el que ese objeto vive**.

Cuando una clase está administrada por Spring, entra en un ecosistema donde el framework puede intervenir para ayudarte.

## Qué ventajas obtiene una clase al convertirse en bean

Cuando una clase pasa a ser bean, gana varias ventajas prácticas.

## 1. Puede ser inyectada en otras clases

Esta es la más visible.

Si Spring administra un bean, puede entregarlo automáticamente a otras clases que lo necesiten.

Eso permite construir relaciones limpias entre componentes.

## 2. Puede recibir otras dependencias también como beans

No solo podés inyectar un bean.

Ese bean, a su vez, puede recibir otros beans.

Así se forma toda la red de objetos de la aplicación.

## 3. Puede formar parte de una arquitectura coherente

Cuando controller, service, repository y config están todos administrados por Spring, la aplicación empieza a comportarse como un sistema ensamblado alrededor del contenedor.

Eso favorece una organización consistente.

## 4. Puede participar del ciclo de vida del contexto

Spring puede decidir:

- cuándo crear el bean
- cuándo inicializarlo
- cómo configurarlo
- cuándo destruirlo, si corresponde

Más adelante vas a ver estos temas con más detalle, pero desde ahora conviene saber que esto existe.

## 5. Puede integrarse con muchas herramientas del ecosistema

Un bean puede participar fácilmente en características como:

- transacciones
- validación
- seguridad
- eventos
- AOP
- configuración condicional
- perfiles
- proxies internos del framework

No hace falta dominar todo eso ahora.

Lo importante es entender que ser bean no es solo “poder inyectarse”, sino también integrarse al modelo completo de Spring.

## Qué cosas no cambian por ser bean

Tampoco conviene pensar que todo cambia.

Hay cosas que siguen siendo exactamente igual:

- sigue siendo Java
- sigue habiendo clases, métodos y atributos
- sigue importando escribir código claro
- sigue importando la responsabilidad de cada clase
- sigue importando el diseño del sistema

O sea: Spring no reemplaza el criterio de diseño.

Una clase mal pensada puede seguir siendo mala, incluso si está anotada con `@Service`.

## Cuándo una clase no necesita ser bean

Este punto es muy importante, porque al empezar mucha gente quiere convertir todo en bean.

Y no siempre hace falta.

Hay clases que pueden seguir siendo simples clases Java sin pasar por el contenedor.

Por ejemplo:

- objetos de dominio muy simples
- DTOs
- records de request y response
- clases utilitarias pequeñas
- excepciones personalizadas
- helpers muy puntuales

No todo lo que existe en un proyecto Spring Boot debe ser un bean.

Generalmente conviene que sean beans las clases que:

- representan servicios del sistema
- coordinan lógica importante
- acceden a infraestructura
- necesitan configuración
- deben ser inyectadas en varias partes

## Un error común: anotar todo sin criterio

A veces alguien descubre `@Component`, `@Service` y `@Repository` y empieza a anotar cada clase del proyecto.

Eso no hace que la arquitectura mejore automáticamente.

De hecho, puede pasar lo contrario:

- se llena el contexto de cosas innecesarias
- se vuelve más confuso qué rol cumple cada clase
- se pierde claridad entre objetos de negocio y componentes de infraestructura

Spring funciona mejor cuando registrás como beans las piezas que realmente forman parte del sistema administrado por el contenedor.

## Diferencia entre “usar una clase” y “dejar que Spring la use”

Esta frase ayuda mucho a entender la diferencia:

### Clase común
La usás vos directamente.

### Bean
La usa Spring como parte del ensamblado de la aplicación.

Eso no significa que vos desaparecés de la ecuación.

Significa que delegás en el framework la creación y conexión de ciertos objetos para que la aplicación sea más modular y mantenible.

## Qué pasa si mezclás beans y clases comunes

No hay ningún problema en mezclar ambos mundos.

De hecho, es lo normal.

Una aplicación Spring Boot real suele tener:

- beans administrados por Spring
- objetos creados manualmente
- DTOs que nacen y mueren por request
- entidades que construís según el caso
- estructuras auxiliares comunes de Java

Lo importante es entender qué papel juega cada cosa.

Por ejemplo:

- `ProductoService` probablemente sea un bean
- `ProductoController` probablemente sea un bean
- `ProductoRepository` probablemente sea un bean
- `ProductoResponse` probablemente no necesite ser bean
- `ErrorResponse` probablemente no necesite ser bean

## Un ejemplo concreto de mezcla sana

```java
@Service
public class ProductoService {

    public ProductoResponse crearResponse(Producto producto) {
        return new ProductoResponse(
                producto.getId(),
                producto.getNombre(),
                producto.getPrecio()
        );
    }
}
```

Acá `ProductoService` sí puede ser bean.

Pero `ProductoResponse` no tiene por qué serlo.

Es simplemente un objeto de datos que construís cuando lo necesitás.

Eso muestra algo importante:

> en una aplicación Spring, no todo vive dentro del contenedor.

## Cómo saber si algo debería ser bean

Una buena pregunta práctica es esta:

> ¿esta clase representa una pieza reusable del sistema que debería ser administrada e inyectada por Spring?

Si la respuesta es sí, probablemente tenga sentido que sea bean.

Si la respuesta es no, probablemente pueda quedar como una clase común.

Señales de que sí conviene que sea bean:

- varias clases la necesitan
- coordina lógica de negocio
- accede a recursos externos
- encapsula infraestructura
- depende de configuración
- participa del flujo principal de la aplicación

Señales de que quizás no hace falta:

- solo representa datos
- se crea para una operación puntual
- no necesita inyección
- no forma parte del ensamblado estable del sistema

## Qué relación tiene esto con la arquitectura por capas

Este tema conecta directamente con el anterior.

Cuando hablaste de capas como controller, service y repository, en realidad estabas viendo categorías de clases que normalmente son beans.

Por ejemplo:

- `@RestController` → bean de la capa web
- `@Service` → bean de la capa de negocio
- `@Repository` → bean de la capa de datos

En cambio, otros tipos de objetos del sistema no necesariamente tienen que registrarse como beans.

Por eso entender esta diferencia ayuda a no mezclar responsabilidades.

## Un bean no necesariamente es singleton “porque sí”

Otro matiz interesante es este:

por defecto, muchos beans en Spring se manejan con alcance singleton dentro del contexto.

Eso significa que Spring reutiliza una misma instancia para ese bean en la aplicación.

Pero eso no convierte al bean en un patrón singleton manual escrito por vos.

Lo importante acá, sin entrar todavía en scopes avanzados, es que:

- la administración la hace Spring
- el ciclo de vida no lo decidís manualmente con `new`
- el framework controla cómo y cuándo usar la instancia

Más adelante vas a profundizar en scopes y ciclo de vida.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola frase, podría ser esta:

> una clase común de Java la administrás vos; un bean administrado por Spring lo administra el contenedor.

Y esa diferencia trae ventajas muy concretas:

- mejor desacoplamiento
- mejor integración entre componentes
- mayor facilidad para testear
- más consistencia arquitectónica
- acceso natural a muchas herramientas del ecosistema Spring

## Resumen

- Una clase común de Java es creada y conectada manualmente por tu código.
- Un bean es un objeto administrado por el contenedor de Spring.
- La diferencia principal está en quién controla su creación y ensamblado.
- Un bean puede ser inyectado en otras clases y recibir dependencias también.
- No todo objeto de una aplicación Spring Boot debe convertirse en bean.
- Controller, service y repository suelen ser beans; DTOs y objetos de datos simples no necesariamente.
- Entender esta diferencia ayuda mucho a diseñar mejor una aplicación desde el principio.

## Próximo tema

En el próximo tema vas a ver cómo se definen beans explícitamente con `@Configuration` y `@Bean`, y en qué casos eso conviene más que depender solo de anotaciones como `@Component` o `@Service`.
