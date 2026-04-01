---
title: "Cómo crear beans con @Configuration y @Bean y cuándo conviene hacerlo"
description: "Entender cómo declarar beans explícitamente con @Configuration y @Bean, en qué se diferencia esto del component scanning y en qué casos conviene usar cada enfoque."
order: 15
module: "Fundamentos de Spring y Spring Boot"
level: "intro"
draft: false
---

Hasta ahora viste que Spring puede detectar clases automáticamente mediante anotaciones como `@Component`, `@Service`, `@Repository` o `@RestController`.

Ese mecanismo es muy importante y en la práctica se usa muchísimo.

Pero no es la única forma de registrar beans.

Spring también permite crear beans de forma **explícita** mediante clases de configuración y métodos anotados con `@Bean`.

Ese enfoque es clave porque te da más control sobre cómo se construyen ciertos objetos y, además, te permite integrar clases que no podés anotar directamente.

Dicho de forma simple:

> no todos los beans tienen que nacer del component scanning; algunos pueden declararse de forma manual y controlada.

## La idea general

Hay dos caminos muy comunes para que un objeto pase a formar parte del contenedor de Spring.

### 1. Detección automática

Spring escanea paquetes y encuentra clases anotadas.

Por ejemplo:

```java
@Service
public class PedidoService {
}
```

### 2. Registro explícito

Vos escribís una clase de configuración y dentro declarás un método que construye el bean.

Por ejemplo:

```java
@Configuration
public class AppConfig {

    @Bean
    public PedidoService pedidoService() {
        return new PedidoService();
    }
}
```

En ambos casos, `PedidoService` puede terminar siendo un bean administrado por Spring.

La diferencia está en **cómo llega a registrarse**.

## Qué es `@Configuration`

`@Configuration` se usa para marcar una clase cuyo objetivo principal es **declarar configuración de beans** para el contenedor.

Esa clase funciona como un lugar donde definís explícitamente qué objetos querés que Spring administre y cómo deben construirse.

Ejemplo básico:

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Bean
    public String mensaje() {
        return "Hola desde un bean";
    }
}
```

Acá Spring puede registrar un bean de tipo `String` llamado `mensaje`.

Aunque este ejemplo es artificial, sirve para ver la idea: el objeto lo construís vos dentro de un método, y Spring lo registra como bean.

## Qué es `@Bean`

`@Bean` se coloca sobre un método dentro de una clase de configuración.

Ese método le dice a Spring algo como esto:

> “el objeto que devuelve este método quiero que forme parte del contenedor”.

Por ejemplo:

```java
@Configuration
public class AppConfig {

    @Bean
    public EmailClient emailClient() {
        return new EmailClient();
    }
}
```

Desde ese momento, el objeto retornado por `emailClient()` puede ser inyectado en otras clases.

```java
@Service
public class NotificacionService {

    private final EmailClient emailClient;

    public NotificacionService(EmailClient emailClient) {
        this.emailClient = emailClient;
    }
}
```

## Qué relación hay entre `@Configuration` y `@Bean`

Normalmente trabajan juntos.

- `@Configuration` marca la clase como fuente de configuración
- `@Bean` marca los métodos que producen beans

En otras palabras:

- la clase es el “contenedor de definición”
- el método es la “fábrica” del bean

## Un ejemplo más realista

Supongamos que tenés una clase que querés usar en tu aplicación:

```java
public class ConversorMoneda {

    public double convertir(double monto) {
        return monto * 1.1;
    }
}
```

Podrías registrarla así:

```java
@Configuration
public class AppConfig {

    @Bean
    public ConversorMoneda conversorMoneda() {
        return new ConversorMoneda();
    }
}
```

Y luego inyectarla:

```java
@Service
public class FacturaService {

    private final ConversorMoneda conversorMoneda;

    public FacturaService(ConversorMoneda conversorMoneda) {
        this.conversorMoneda = conversorMoneda;
    }
}
```

Con eso, `ConversorMoneda` ya participa del contenedor aunque no tenga ninguna anotación de Spring en su propia clase.

## Cuándo conviene usar `@Component` y cuándo `@Bean`

Esta es una de las preguntas más importantes del tema.

### Usualmente conviene `@Component`, `@Service`, `@Repository`, etc.

Cuando la clase forma parte de tu propio dominio de aplicación y no necesita una construcción especial, lo más natural suele ser usar detección automática.

Por ejemplo:

- servicios de negocio
- repositorios
- controladores
- validadores
- mappers
- componentes propios del proyecto

En estos casos, el component scanning suele ser más simple, expresivo y directo.

### Conviene `@Bean` cuando querés más control

`@Bean` suele ser mejor opción cuando:

- la clase no es tuya y no podés anotarla
- necesitás construir el objeto con lógica particular
- querés centralizar configuración explícita
- necesitás combinar varias dependencias manualmente
- el objeto depende de valores externos o de inicialización específica

## Un caso muy importante: clases de librerías externas

Supongamos que usás una clase de una librería externa:

```java
public class ClienteExterno {

    public ClienteExterno(String baseUrl, int timeout) {
    }
}
```

No podés entrar al código de esa librería y ponerle `@Component`.

Entonces, si querés que Spring administre ese objeto, una solución típica es esta:

```java
@Configuration
public class ClienteConfig {

    @Bean
    public ClienteExterno clienteExterno() {
        return new ClienteExterno("https://api.ejemplo.com", 5000);
    }
}
```

Este es uno de los usos más clásicos de `@Bean`.

## Otro caso típico: construcción con parámetros

A veces una clase necesita varios valores o dependencias para construirse y querés que esa construcción quede visible y centralizada.

```java
public class ReporteService {

    private final ExportadorPdf exportadorPdf;
    private final GeneradorCsv generadorCsv;

    public ReporteService(ExportadorPdf exportadorPdf, GeneradorCsv generadorCsv) {
        this.exportadorPdf = exportadorPdf;
        this.generadorCsv = generadorCsv;
    }
}
```

Podrías registrarlo así:

```java
@Configuration
public class ReporteConfig {

    @Bean
    public ReporteService reporteService(ExportadorPdf exportadorPdf, GeneradorCsv generadorCsv) {
        return new ReporteService(exportadorPdf, generadorCsv);
    }
}
```

Fijate algo interesante: el método `@Bean` también puede recibir dependencias, y Spring las resuelve igual que con cualquier otro bean.

## Spring también inyecta dependencias en métodos `@Bean`

Esto es importante.

No hace falta que construyas todo manualmente dentro del método.

Spring puede inyectar en los parámetros del método `@Bean` otros beans ya conocidos por el contenedor.

```java
@Configuration
public class AppConfig {

    @Bean
    public NotificacionService notificacionService(EmailClient emailClient) {
        return new NotificacionService(emailClient);
    }
}
```

Acá `emailClient` puede ser otro bean del contexto.

Esto hace que la configuración explícita siga encajando dentro del modelo de inyección de dependencias.

## Diferencia conceptual entre ambos enfoques

### Enfoque por anotación de componente

La clase misma declara su rol:

```java
@Service
public class UsuarioService {
}
```

### Enfoque por configuración explícita

Otra clase externa declara cómo se construye el bean:

```java
@Configuration
public class UsuarioConfig {

    @Bean
    public UsuarioService usuarioService() {
        return new UsuarioService();
    }
}
```

La primera opción es más directa y suele ser mejor para componentes propios simples.

La segunda da más control y suele ser útil para objetos más especiales.

## Qué pasa con el nombre del bean

Cuando usás `@Bean`, por defecto el nombre del bean suele ser el nombre del método.

```java
@Bean
public EmailClient emailClient() {
    return new EmailClient();
}
```

En este caso, el bean suele llamarse `emailClient`.

Eso importa en algunos escenarios, por ejemplo cuando hay varios beans del mismo tipo y necesitás distinguirlos.

Más adelante vas a ver con más detalle cómo resolver colisiones o ambigüedades, pero conviene saber desde ya que el método también aporta identidad al bean.

## Un ejemplo con varios beans de una misma configuración

```java
@Configuration
public class InfraConfig {

    @Bean
    public EmailClient emailClient() {
        return new EmailClient();
    }

    @Bean
    public SmsClient smsClient() {
        return new SmsClient();
    }

    @Bean
    public NotificacionService notificacionService(EmailClient emailClient, SmsClient smsClient) {
        return new NotificacionService(emailClient, smsClient);
    }
}
```

Esto muestra una idea importante:

- una clase `@Configuration` puede agrupar varios beans relacionados
- esos beans pueden depender unos de otros
- Spring resuelve esas relaciones dentro del contexto

## Cuándo centralizar configuración puede ser útil

A veces, aunque podrías anotar directamente una clase con `@Component`, te conviene agrupar ciertos beans dentro de una configuración explícita.

Por ejemplo:

- clientes HTTP
- adaptadores externos
- estrategias configurables
- objetos de infraestructura
- componentes técnicos que querés ver todos juntos

Eso puede mejorar la claridad del proyecto, porque te deja concentrada la creación de ciertos objetos en un solo lugar.

## Pero tampoco conviene abusar de `@Bean`

No todo debería convertirse en configuración manual.

Si empezaras a definir absolutamente todos tus servicios con `@Bean`, podrías terminar con clases de configuración gigantescas y menos legibles.

Por eso, una regla sana suele ser esta:

- **component scanning** para la mayoría de los componentes propios y sencillos
- `@Bean` para casos donde de verdad necesitás control explícito o integración especial

## Un criterio práctico muy útil

Podés pensar así:

### Si la clase “se comporta como componente de aplicación”
Usualmente:
- `@Service`
- `@Repository`
- `@Component`
- `@RestController`

### Si la clase “se arma como una pieza técnica o externa”
Usualmente:
- `@Configuration` + `@Bean`

No es una ley absoluta, pero como criterio mental ayuda mucho.

## `@Bean` no significa “más avanzado” por sí solo

A veces uno podría pensar que declarar beans manualmente es una forma más “profesional” que usar `@Service`.

No necesariamente.

Muchas veces, la opción más limpia y correcta es simplemente usar anotaciones de componente y dejar que Spring detecte la clase.

`@Bean` no es mejor por ser más manual.

Es mejor solo cuando realmente resuelve un problema concreto.

## Una comparación simple

### Caso ideal para `@Service`

```java
@Service
public class ClienteService {
}
```

Es tu clase, es un servicio de negocio, no necesita construcción rara. Perfecto.

### Caso ideal para `@Bean`

```java
@Configuration
public class HttpClientConfig {

    @Bean
    public ClienteExterno clienteExterno() {
        return new ClienteExterno("https://api.ejemplo.com", 3000);
    }
}
```

No controlás esa clase o necesita configuración puntual. Ahí `@Bean` tiene mucho sentido.

## Las clases `@Configuration` suelen representar infraestructura

En muchos proyectos, las clases marcadas con `@Configuration` agrupan definiciones relacionadas con infraestructura o integración.

Por ejemplo:

- configuración de seguridad
- configuración de clientes HTTP
- configuración de serialización
- configuración de beans de soporte
- configuración de librerías externas

Eso ayuda a separar mejor:

- lógica de negocio
- configuración técnica

## Un ejemplo más completo

Supongamos este escenario:

```java
public class ApiClient {

    private final String urlBase;
    private final int timeout;

    public ApiClient(String urlBase, int timeout) {
        this.urlBase = urlBase;
        this.timeout = timeout;
    }
}
```

Querés usarlo en tu app:

```java
@Service
public class PedidoGateway {

    private final ApiClient apiClient;

    public PedidoGateway(ApiClient apiClient) {
        this.apiClient = apiClient;
    }
}
```

Podrías declararlo así:

```java
@Configuration
public class ApiClientConfig {

    @Bean
    public ApiClient apiClient() {
        return new ApiClient("https://proveedor.com", 5000);
    }
}
```

Con eso, `PedidoGateway` recibe un bean administrado por Spring aunque `ApiClient` nunca haya sido anotado.

## Qué pasa si mezclás ambos enfoques

No hay ningún problema en usar ambos enfoques dentro del mismo proyecto.

De hecho, eso es lo normal.

Por ejemplo:

- tus servicios y controladores pueden entrar por component scanning
- tus clientes externos o componentes técnicos pueden registrarse con `@Bean`

Spring no te obliga a elegir un solo camino para todo el proyecto.

## Relación con Spring Boot

Spring Boot usa muchísimo esta idea.

Aunque vos no lo veas todo el tiempo, muchas de las auto-configuraciones internas de Boot registran beans mediante mecanismos equivalentes a configuración explícita.

O sea: Boot no solo escanea componentes tuyos. También construye beans de infraestructura según dependencias y propiedades disponibles.

Entender `@Configuration` y `@Bean` te ayuda a entender mejor cómo Boot arma el contexto detrás de escena.

## Error común: usar `@Bean` para todo

Este es un error bastante común cuando alguien descubre la configuración explícita.

Puede empezar a declarar así:

- todos los servicios
- todos los repositorios
- todos los componentes
- todo manualmente

Eso suele volver el proyecto más verboso sin aportar una ganancia real.

En muchos casos, lo más simple y correcto es dejar el componente donde está y anotarlo como servicio, repositorio o componente.

## Error común: querer anotar clases externas

Otro error frecuente es pensar:

> “esta clase de una librería no tiene `@Component`, entonces no la puedo usar como bean”

Sí podés. Justamente para eso existe una de las utilidades más importantes de `@Bean`.

## Error común: confundir configuración con lógica de negocio

Las clases `@Configuration` idealmente no deberían convertirse en lugares donde metés lógica de negocio.

Su rol principal es definir cómo se construyen o registran ciertos beans.

Si una clase empieza a tomar decisiones de negocio, probablemente ya no esté cumpliendo bien el rol de configuración.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> `@Configuration` y `@Bean` te permiten registrar beans de forma explícita cuando necesitás control, integración o construcción especial, mientras que el component scanning sigue siendo el camino natural para muchos componentes propios del proyecto.

## Resumen

- Spring puede registrar beans por detección automática o por configuración explícita.
- `@Configuration` marca una clase que declara beans.
- `@Bean` marca métodos cuyo resultado debe formar parte del contenedor.
- Este enfoque es muy útil para clases externas o para construcciones especiales.
- El component scanning suele ser ideal para servicios, repositorios y controladores propios.
- `@Bean` no reemplaza a `@Component`; lo complementa.
- En proyectos reales, ambos enfoques suelen convivir.

## Próximo tema

En el próximo tema vas a ver cómo Spring resuelve dependencias cuando hay varios beans del mismo tipo y qué papel cumplen herramientas como `@Primary` y `@Qualifier`.
