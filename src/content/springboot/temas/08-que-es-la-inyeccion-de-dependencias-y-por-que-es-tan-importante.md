---
title: "Qué es la inyección de dependencias y por qué es tan importante"
description: "Una de las bases más importantes de Spring: qué es la inyección de dependencias, qué problema resuelve y por qué cambia la forma de construir aplicaciones Java."
order: 8
module: "Fundamentos de Spring y Spring Boot"
level: "intro"
draft: false
---

La **inyección de dependencias** es uno de los conceptos más importantes de Spring.

De hecho, si entendés bien este tema, vas a empezar a entender por qué Spring está diseñado como está, por qué trabaja con beans, por qué existe el contenedor y por qué las aplicaciones hechas con Spring suelen estar mejor organizadas que otras aplicaciones Java más improvisadas.

Dicho de forma simple, la inyección de dependencias consiste en que una clase **reciba desde afuera** los objetos que necesita para trabajar, en lugar de crearlos por su cuenta.

Esa idea parece pequeña, pero cambia mucho la estructura de una aplicación.

## El problema de crear dependencias manualmente

Supongamos que tenemos un servicio que necesita acceder a un repositorio para guardar pedidos.

Una forma muy común, sobre todo al empezar a programar, sería hacer algo así:

```java
public class PedidoService {

    private PedidoRepository pedidoRepository = new PedidoRepository();

    public void crearPedido() {
        pedidoRepository.guardar();
    }
}
```

Esto funciona, pero tiene varios problemas.

### 1. La clase queda demasiado acoplada

`PedidoService` no solo sabe usar un repositorio, sino que además decide **cuál** repositorio crear y **cómo** crearlo.

Eso significa que si mañana querés cambiar `PedidoRepository` por otra implementación, ya no alcanza con cambiar una configuración externa: tenés que modificar la clase.

### 2. Es más difícil testear

Si querés probar `PedidoService` en aislamiento, no podés reemplazar fácilmente el repositorio por un mock, porque la propia clase lo crea con `new`.

### 3. La responsabilidad queda mezclada

La clase debería encargarse de la lógica de negocio.

Pero además está tomando decisiones de construcción de objetos que no le corresponden.

### 4. La aplicación se vuelve más rígida

A medida que aparecen más dependencias, más colaboradores y más variantes, esta forma de construir objetos empieza a escalar mal.

## La idea de la inyección de dependencias

Ahora pensemos la misma clase de otra manera:

```java
public class PedidoService {

    private final PedidoRepository pedidoRepository;

    public PedidoService(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    public void crearPedido() {
        pedidoRepository.guardar();
    }
}
```

Fijate qué cambió.

`PedidoService` ya no crea el repositorio. Solo lo **recibe**.

Eso significa que la clase pasa a decir:

> “Para funcionar, necesito un `PedidoRepository`, pero no me importa quién lo construye.”

Esa es la idea central.

La dependencia existe igual, pero ahora llega **inyectada** desde afuera.

## Qué es exactamente una dependencia

Una dependencia es cualquier objeto que una clase necesita para hacer su trabajo.

Por ejemplo:

- un servicio depende de un repositorio
- un controlador depende de un servicio
- un servicio puede depender de un validador
- un cliente HTTP puede depender de una configuración
- una clase de seguridad puede depender de un encoder

No todas las dependencias son iguales, pero la idea general es la misma: si una clase necesita otra pieza para funcionar, esa otra pieza es una dependencia.

## Por qué se llama “inyección”

Se llama así porque la dependencia no nace dentro de la clase, sino que le es “inyectada”.

En lugar de esto:

```java
private EmailClient emailClient = new EmailClient();
```

la clase recibe el objeto ya preparado:

```java
public NotificacionService(EmailClient emailClient) {
    this.emailClient = emailClient;
}
```

En Spring, normalmente esa inyección la hace el contenedor.

Es decir, Spring crea los beans, los relaciona y se los entrega a otras clases cuando hace falta.

## Qué gana una aplicación con esto

La inyección de dependencias no es una moda ni una formalidad. Tiene ventajas concretas.

### Menor acoplamiento

Las clases dejan de depender de implementaciones construidas internamente.

Eso permite cambiar piezas con mayor facilidad.

### Mejor testabilidad

Si una clase recibe sus dependencias, en una prueba podés entregarle mocks o dobles de prueba sin tener que tocar la lógica real.

### Mejor separación de responsabilidades

Cada clase se concentra en hacer su trabajo, no en crear todo lo que necesita.

### Más flexibilidad

Podés cambiar implementaciones, estrategias o colaboraciones sin reescribir gran parte del sistema.

### Arquitectura más limpia

El diseño de la aplicación se vuelve más claro: unas clases exponen comportamiento, otras implementan acceso a datos, otras configuran objetos, y el ensamblado queda centralizado.

## Un ejemplo más realista

Imaginemos una API donde un controlador usa un servicio y el servicio usa un repositorio.

### Sin inyección de dependencias

```java
public class ProductoController {

    private ProductoService productoService = new ProductoService();

    public void crearProducto() {
        productoService.crear();
    }
}
```

Y dentro del servicio:

```java
public class ProductoService {

    private ProductoRepository productoRepository = new ProductoRepository();

    public void crear() {
        productoRepository.guardar();
    }
}
```

Acá cada clase crea lo que necesita. Parece simple, pero el sistema queda fuertemente atado.

### Con inyección de dependencias

```java
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    public void crearProducto() {
        productoService.crear();
    }
}
```

```java
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public void crear() {
        productoRepository.guardar();
    }
}
```

Ahora las clases están mucho mejor definidas.

No deciden cómo crear sus colaboradores. Solo expresan qué necesitan.

## Relación entre inyección de dependencias y Spring

Spring usa esta idea como una de sus bases.

Cuando marcás clases como componentes, servicios, repositorios o controladores, el contenedor puede registrarlas como beans.

Después, cuando un bean necesita otro, Spring puede resolver esa dependencia y conectarlos.

Por ejemplo:

```java
@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }
}
```

Si `UsuarioRepository` también es un bean administrado por Spring, el framework puede inyectarlo automáticamente.

```java
@Repository
public class UsuarioRepository {
}
```

En este escenario, Spring:

- detecta ambas clases
- crea los beans
- entiende que `UsuarioService` necesita un `UsuarioRepository`
- entrega el bean correspondiente al construir el servicio

## Inyección por constructor

La forma más importante y recomendable de inyección en Spring es la **inyección por constructor**.

Ejemplo:

```java
@Service
public class PagoService {

    private final PagoRepository pagoRepository;
    private final EmailService emailService;

    public PagoService(PagoRepository pagoRepository, EmailService emailService) {
        this.pagoRepository = pagoRepository;
        this.emailService = emailService;
    }
}
```

Esta forma tiene varias ventajas:

- deja claras las dependencias obligatorias
- permite campos `final`
- mejora la inmutabilidad
- facilita testing
- hace más evidente cuándo una clase está demasiado cargada de responsabilidades

Cuando una clase empieza a tener demasiados parámetros en el constructor, eso suele ser una señal útil: probablemente está haciendo demasiado.

## Otras formas de inyección

Además de la inyección por constructor, existen otras formas.

### Inyección por campo

```java
@Service
public class ReporteService {

    @Autowired
    private ReporteRepository reporteRepository;
}
```

Esto existe, pero no suele ser la mejor opción para aprendizaje ni para diseño limpio.

¿Por qué?

- oculta dependencias
- dificulta testing más puro
- reduce claridad
- promueve menos control sobre la construcción del objeto

### Inyección por setter

```java
@Service
public class ExportadorService {

    private FormateadorService formateadorService;

    @Autowired
    public void setFormateadorService(FormateadorService formateadorService) {
        this.formateadorService = formateadorService;
    }
}
```

Puede servir en algunos casos, sobre todo cuando una dependencia es opcional o configurable, pero la inyección por constructor sigue siendo la opción principal.

## Qué papel cumple `@Autowired`

Históricamente, `@Autowired` se usó para indicarle a Spring que debía inyectar una dependencia.

Por ejemplo:

```java
@Autowired
public ClienteService(ClienteRepository clienteRepository) {
    this.clienteRepository = clienteRepository;
}
```

Pero hoy, si una clase tiene **un único constructor**, Spring puede usarlo sin necesidad de poner `@Autowired`.

Por eso, en código moderno, suele escribirse así:

```java
@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }
}
```

Esto suele verse más limpio y claro.

## Inyección de dependencias no significa “magia”

A veces, cuando alguien empieza con Spring, siente que las dependencias “aparecen solas”.

Pero no es magia.

Lo que ocurre es que:

1. Spring detecta clases candidatas a ser beans.
2. Registra esos beans en el contenedor.
3. Analiza qué necesita cada bean para construirse.
4. Resuelve esas dependencias.
5. Ensambla el objeto final.

O sea, no desaparece la lógica de construcción. Solo pasa a estar centralizada y administrada por el framework.

## Qué pasa si Spring no encuentra una dependencia

Si una clase necesita un bean y Spring no puede encontrarlo, la aplicación falla al arrancar.

Eso es algo bueno, porque detecta el problema temprano.

Por ejemplo, si tenés esto:

```java
@Service
public class FacturaService {

    private final FacturaRepository facturaRepository;

    public FacturaService(FacturaRepository facturaRepository) {
        this.facturaRepository = facturaRepository;
    }
}
```

pero `FacturaRepository` no está registrado como bean ni definido en configuración, Spring no podrá construir `FacturaService`.

En ese caso vas a ver un error de contexto al iniciar la aplicación.

## Una ventaja muy importante: cambiar implementaciones

La inyección de dependencias también facilita reemplazar una implementación por otra.

Por ejemplo, imaginá esta interfaz:

```java
public interface Notificador {
    void enviar(String mensaje);
}
```

Y dos implementaciones:

```java
public class EmailNotificador implements Notificador {
    public void enviar(String mensaje) {
        System.out.println("Enviando email: " + mensaje);
    }
}
```

```java
public class SmsNotificador implements Notificador {
    public void enviar(String mensaje) {
        System.out.println("Enviando SMS: " + mensaje);
    }
}
```

Si una clase depende de la abstracción `Notificador`, la arquitectura gana flexibilidad.

```java
public class AlertaService {

    private final Notificador notificador;

    public AlertaService(Notificador notificador) {
        this.notificador = notificador;
    }
}
```

Después, según cómo configures la aplicación, podrías usar una implementación u otra.

Esto se vuelve muy poderoso cuando el sistema crece.

## Errores comunes al empezar

### 1. Seguir usando `new` dentro de servicios y controladores

Es uno de los errores más frecuentes.

Si una clase forma parte del flujo administrado por Spring, normalmente no debería estar creando manualmente otras dependencias principales.

### 2. No entender qué es dependencia y qué no

No todo es un bean, ni todo merece ser inyectado. Pero servicios, repositorios, configuraciones, componentes y clientes de infraestructura suelen entrar naturalmente en este modelo.

### 3. Pensar que Spring existe solo para “ahorrar código”

Ahorrar código es una consecuencia menor.

Lo importante es que mejora la estructura, la testabilidad y el desacoplamiento.

### 4. Querer aprender anotaciones sin entender la idea

Memorizar `@Service`, `@Autowired` o `@Component` sin entender por qué existen lleva a confusión.

Primero conviene entender la idea de fondo: clases que reciben sus dependencias, no clases que fabrican todo internamente.

## Cómo reconocer una clase mejor diseñada

Una clase suele estar mejor diseñada cuando:

- sus dependencias son claras
- no crea colaboradores importantes con `new`
- tiene una responsabilidad concreta
- puede probarse en aislamiento
- depende de piezas externas de forma explícita

La inyección de dependencias no garantiza automáticamente todo eso, pero empuja el diseño en esa dirección.

## Resumen conceptual

Podés quedarte con esta fórmula mental:

- **sin inyección de dependencias**: la clase crea lo que necesita
- **con inyección de dependencias**: la clase recibe lo que necesita

Ese pequeño cambio tiene un impacto enorme en la arquitectura.

## Resumen

- La inyección de dependencias consiste en recibir dependencias desde afuera en lugar de crearlas dentro de la clase.
- Ayuda a reducir acoplamiento.
- Mejora mucho la testabilidad.
- Hace más clara la responsabilidad de cada clase.
- En Spring, el contenedor es quien normalmente crea y conecta los beans.
- La forma más recomendable de inyección es la inyección por constructor.
- Entender este tema es clave para entender casi todo el resto del ecosistema Spring.

## Próximo tema

En el próximo tema vas a ver cuáles son las anotaciones más comunes para registrar componentes en Spring, como `@Component`, `@Service`, `@Repository` y `@Controller`.
