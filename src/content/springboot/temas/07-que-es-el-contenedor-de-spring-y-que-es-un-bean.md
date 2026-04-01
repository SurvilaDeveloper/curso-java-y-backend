---
title: "Qué es el contenedor de Spring y qué es un bean"
description: "Una introducción al contenedor de Spring, el concepto de bean y por qué esta base es central para entender cómo funciona Spring Boot."
order: 7
module: "Fundamentos de Spring y Spring Boot"
level: "intro"
draft: false
---

Hasta este punto ya viste que Spring Boot simplifica mucho el desarrollo sobre Spring. Pero para entender de verdad qué hace Spring Boot, hay una base conceptual que no se puede saltear: el **contenedor de Spring**.

Gran parte de lo que Spring hace gira alrededor de una idea simple pero poderosa:

> los objetos importantes de la aplicación no tienen por qué ser creados, conectados y administrados manualmente por vos.

En lugar de eso, Spring puede encargarse de crearlos, configurarlos y entregarlos donde hagan falta.

Ese mecanismo vive dentro de lo que normalmente se llama **contenedor de Spring**.

Y los objetos que ese contenedor administra reciben un nombre muy importante dentro del ecosistema: **beans**.

En este tema vas a entender:

- qué es el contenedor de Spring
- qué significa que un objeto esté administrado por Spring
- qué es un bean
- por qué los beans son tan importantes
- cómo se relaciona todo esto con Spring Boot
- por qué esta idea cambia por completo la forma de estructurar una aplicación Java

## Por qué hace falta un contenedor

Imaginá una aplicación sin Spring.

Supongamos que tenés estas clases:

- `PedidoController`
- `PedidoService`
- `PedidoRepository`
- `EmailService`

Una forma tradicional de conectarlas sería crear cada dependencia manualmente:

```java
public class PedidoController {

    private final PedidoService pedidoService = new PedidoService();
}
```

Y dentro de `PedidoService`, crear otras dependencias:

```java
public class PedidoService {

    private final PedidoRepository pedidoRepository = new PedidoRepository();
    private final EmailService emailService = new EmailService();
}
```

A primera vista puede parecer práctico, pero este enfoque trae varios problemas:

- las clases quedan muy acopladas
- cambiar una implementación cuesta más
- testear es más difícil
- el armado del sistema queda disperso por todas partes
- al crecer la aplicación, el código se vuelve más rígido

Spring propone otra idea.

En lugar de que cada clase cree por su cuenta lo que necesita, existe un contenedor central que conoce los componentes de la aplicación y puede conectarlos entre sí.

Eso hace que el sistema sea más flexible, más limpio y más mantenible.

## Qué es el contenedor de Spring

El **contenedor de Spring** es la parte del framework que se encarga de administrar objetos y relaciones dentro de la aplicación.

Dicho de forma simple, el contenedor puede:

- crear objetos
- configurarlos
- resolver sus dependencias
- inyectarlos donde correspondan
- participar en su ciclo de vida

No es solamente una “bolsa de objetos”.

Es una infraestructura que entiende cómo ensamblar partes de la aplicación.

Cuando Spring arranca, analiza la configuración disponible, detecta componentes, registra definiciones internas y construye un contexto a partir del cual la aplicación puede funcionar.

A ese contexto normalmente se lo conoce como **ApplicationContext**.

## ApplicationContext

Cuando se habla del contenedor de Spring, muy seguido aparece esta idea: `ApplicationContext`.

`ApplicationContext` es una de las interfaces centrales del ecosistema Spring para representar el contexto de la aplicación.

Podés pensarla como la “gran estructura” donde Spring mantiene registrados los componentes que administra.

En otras palabras:

- el contenedor administra objetos
- esos objetos registrados son beans
- el `ApplicationContext` representa ese entorno administrado

En una aplicación Spring Boot, todo esto se arma automáticamente al arrancar la aplicación.

Por eso en muchos casos no lo ves directamente al principio, pero está ahí todo el tiempo.

## Qué es un bean

Un **bean** es un objeto administrado por el contenedor de Spring.

Esto es lo más importante del tema.

No cualquier objeto de Java es un bean.

Por ejemplo:

```java
String texto = "hola";
LocalDate fecha = LocalDate.now();
```

Esos son objetos normales de Java. Existen, pero Spring no necesariamente los administra.

En cambio, si tenés una clase que Spring detecta como componente, o una instancia declarada explícitamente en configuración, entonces esa instancia puede convertirse en un bean.

Por ejemplo:

```java
@Service
public class PedidoService {
}
```

Si Spring detecta esa clase como parte de los componentes de la aplicación, va a crear una instancia administrada del servicio. Esa instancia será un bean.

Lo mismo podría pasar con un repositorio, un controlador, un componente utilitario o una clase configurada con `@Bean`.

## Qué significa que un bean esté administrado por Spring

Que un objeto esté administrado por Spring implica varias cosas importantes.

### 1. Spring puede crearlo

No hace falta que vos hagas `new` manualmente en todos lados.

### 2. Spring puede inyectarlo en otras clases

Si otra clase lo necesita, el contenedor puede entregárselo.

### 3. Spring puede configurarlo

Dependiendo del tipo de bean, Spring puede inicializarlo con propiedades, dependencias y comportamientos definidos por la configuración.

### 4. Spring puede participar en su ciclo de vida

El contenedor puede intervenir cuando el bean se crea, se inicializa o se destruye.

### 5. Spring puede reemplazar o combinar beans según configuración

Más adelante vas a ver perfiles, condiciones, beans alternativos y configuración más avanzada. Todo eso se apoya en esta base.

## Un ejemplo conceptual

Supongamos estas clases:

```java
public class PedidoRepository {

    public void guardar() {
        System.out.println("Guardando pedido...");
    }
}
```

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

```java
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }
}
```

En Java puro, alguien tiene que crear manualmente todo esto:

```java
PedidoRepository pedidoRepository = new PedidoRepository();
PedidoService pedidoService = new PedidoService(pedidoRepository);
PedidoController pedidoController = new PedidoController(pedidoService);
```

Eso funciona, pero en una aplicación grande se vuelve tedioso y difícil de mantener.

Con Spring, esa responsabilidad pasa al contenedor.

Si esas clases son reconocidas como componentes, Spring puede encargarse de:

- crear `PedidoRepository`
- usarlo para crear `PedidoService`
- usar `PedidoService` para crear `PedidoController`

Eso hace que la aplicación quede mucho más limpia.

## La relación entre bean e inyección de dependencias

El contenedor y los beans están totalmente ligados a otro concepto central: la **inyección de dependencias**.

La lógica es esta:

- si Spring administra un objeto como bean
- y otro bean necesita ese objeto
- entonces Spring puede inyectarlo

Por ejemplo:

```java
@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;

    public PedidoService(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }
}
```

Acá `PedidoService` necesita un `PedidoRepository`.

Si `PedidoRepository` también es un bean, Spring puede resolver la dependencia automáticamente.

Por eso, entender los beans es un paso previo a entender la inyección de dependencias.

## No todos los objetos tienen que ser beans

Esto también es importante.

En una aplicación Spring no todo objeto tiene que vivir en el contenedor.

Hay objetos que pueden seguir siendo totalmente normales y no administrados por Spring.

Por ejemplo:

- DTOs
- objetos temporales
- estructuras auxiliares creadas dentro de un método
- resultados de operaciones
- objetos del dominio que no necesitás registrar como componentes del framework

Los beans suelen ser aquellos objetos que representan piezas estructurales de la aplicación, como por ejemplo:

- servicios
- repositorios
- controladores
- componentes reutilizables
- configuraciones
- clientes externos
- utilidades compartidas

Conviene no convertir en bean cualquier cosa sin criterio.

## Cómo detecta Spring los beans

Hay varias maneras, pero las dos más importantes al principio son:

### 1. Component scanning

Spring puede escanear paquetes y detectar clases anotadas con estereotipos como:

- `@Component`
- `@Service`
- `@Repository`
- `@Controller`
- `@RestController`

Por ejemplo:

```java
@Service
public class UsuarioService {
}
```

Si esa clase está dentro de un paquete que Spring escanea, puede registrarla como bean.

### 2. Declaración explícita con `@Bean`

También podés registrar un bean manualmente desde una clase de configuración.

```java
@Configuration
public class AppConfig {

    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }
}
```

Acá `clock()` devuelve un objeto que Spring registra como bean dentro del contenedor.

Esto es muy útil cuando querés crear beans de clases que no anotaste directamente o cuando necesitás una construcción más personalizada.

## Estereotipos comunes

Aunque después vas a profundizar esto, conviene conocer desde ya algunos nombres muy usados.

### `@Component`

Es una anotación genérica para indicar que una clase puede ser registrada como bean.

### `@Service`

Se usa normalmente para lógica de negocio.

### `@Repository`

Se usa para acceso a datos. Además, tiene semántica especial en algunos escenarios relacionados con persistencia.

### `@Controller` y `@RestController`

Se usan para la capa web.

Estas anotaciones no son magia por sí mismas. Lo importante es que sirven para que Spring identifique clases que deben entrar al contenedor.

## Ciclo de vida básico de un bean

Un bean no es simplemente un objeto “guardado” por Spring.

El contenedor participa en varias etapas de su vida.

A nivel conceptual, el ciclo básico incluye:

1. Spring detecta que debe registrar el bean.
2. Spring lo crea.
3. Spring resuelve e inyecta sus dependencias.
4. Spring puede aplicar inicialización adicional.
5. El bean queda disponible para ser usado dentro del contexto.
6. Cuando el contexto se cierra, Spring puede ejecutar lógica de destrucción si corresponde.

Al principio no necesitás memorizar cada detalle interno. Lo importante es entender que el contenedor no solo guarda referencias: administra activamente estas instancias.

## Por qué esto es tan importante en Spring Boot

Spring Boot se apoya completamente en esta base.

Cuando agregás starters, activás auto-configuración y definís componentes en una aplicación Boot, lo que en el fondo está ocurriendo es que el contenedor de Spring empieza a registrar beans y a conectarlos entre sí.

Por ejemplo:

- cuando usás `spring-boot-starter-web`, Spring Boot registra un montón de beans relacionados con la web
- cuando marcás una clase como `@RestController`, Spring la registra como bean
- cuando inyectás un servicio en un controlador, Spring resuelve esa relación entre beans

Por eso se dice muchas veces que Spring Boot no reemplaza los conceptos de Spring. Los usa intensamente, pero te simplifica el trabajo.

## Diferencia entre crear objetos manualmente y dejar que Spring los administre

Veámoslo de una forma más clara.

### Enfoque manual

```java
public class FacturaService {

    private final FacturaRepository facturaRepository = new FacturaRepository();
}
```

Acá la clase queda acoplada a una implementación concreta.

### Enfoque con Spring

```java
@Service
public class FacturaService {

    private final FacturaRepository facturaRepository;

    public FacturaService(FacturaRepository facturaRepository) {
        this.facturaRepository = facturaRepository;
    }
}
```

Y el repositorio podría ser:

```java
@Repository
public class FacturaRepository {
}
```

En este segundo enfoque:

- `FacturaService` no crea su propia dependencia
- `FacturaRepository` puede ser administrado por Spring
- Spring puede conectarlos
- el código queda mejor preparado para pruebas y cambios

## Una analogía útil

Podés pensar el contenedor como una especie de “central de ensamblado” de la aplicación.

En lugar de que cada clase viva por su cuenta tratando de crear todo lo que necesita, existe una estructura que:

- sabe qué componentes existen
- sabe cómo armarlos
- sabe cuáles dependen de cuáles
- los mantiene disponibles para el resto del sistema

Eso permite que cada clase se concentre más en su responsabilidad concreta y menos en cómo construir el mundo alrededor.

## Errores comunes al empezar

### 1. Pensar que bean es cualquier objeto

No. Un bean es un objeto administrado por Spring.

### 2. Creer que Spring “inyecta cualquier cosa”

Spring puede inyectar lo que esté registrado y disponible dentro del contexto, o lo que pueda resolver a partir de la configuración.

### 3. Usar `new` dentro de clases que deberían depender del contenedor

No siempre está prohibido, pero muchas veces rompe la lógica de desacoplamiento que Spring busca favorecer.

### 4. Convertir todo en bean sin criterio

No hace falta registrar cada clase del proyecto como bean.

### 5. Memorizar anotaciones sin entender el fondo

Lo importante no es decorar clases mecánicamente. Lo importante es entender qué papel cumple el contenedor y por qué Spring administra ciertas instancias.

## Qué pasa si hay varios beans del mismo tipo

Más adelante lo vas a estudiar mejor, pero conviene mencionarlo desde ahora.

Si el contenedor tiene varios beans compatibles con una misma dependencia, Spring necesita alguna forma de decidir cuál usar.

Ahí aparecen herramientas como:

- `@Primary`
- `@Qualifier`
- nombres de beans
- condiciones de configuración

Esto no es un problema del tema inicial, pero sirve para entender que el contenedor no es algo trivial: puede manejar escenarios bastante complejos.

## Qué relación tiene esto con la arquitectura en capas

En una aplicación Spring típica, muchas piezas importantes de cada capa suelen ser beans.

Por ejemplo:

- controlador → bean
- servicio → bean
- repositorio → bean

Eso permite que cada capa dependa de la otra de forma limpia, sin crear manualmente todas las conexiones.

Una estructura muy habitual sería:

- `Controller` recibe requests
- `Service` aplica reglas de negocio
- `Repository` accede a datos

Y el contenedor se encarga de ensamblar las dependencias necesarias entre esas piezas.

## Qué relación tiene esto con la mantenibilidad

La existencia del contenedor y los beans tiene impacto directo en la calidad de la aplicación.

Cuando el sistema está bien armado sobre esta base:

- cuesta menos reemplazar componentes
- se simplifican las pruebas
- se reduce el acoplamiento
- la configuración queda más centralizada
- el proyecto escala mejor

Por eso esta idea, que al principio puede parecer teórica, termina afectando decisiones muy prácticas.

## Lo más importante para llevarte

Si tuvieras que quedarte con una sola idea, sería esta:

> un bean es un objeto administrado por Spring, y el contenedor es la infraestructura que crea, conecta y mantiene esos beans dentro de la aplicación.

Eso es la base de casi todo lo que vas a ver después.

Cuando más adelante estudies:

- inyección de dependencias
- scopes
- configuración
- perfiles
- auto-configuración
- Spring MVC
- seguridad
- acceso a datos

vas a ver que todo, de una forma u otra, se apoya en el funcionamiento del contenedor.

## Resumen

- El contenedor de Spring administra componentes importantes de la aplicación.
- `ApplicationContext` representa el contexto donde viven esos componentes.
- Un bean es un objeto administrado por Spring.
- Los beans pueden crearse automáticamente por escaneo de componentes o declararse explícitamente con `@Bean`.
- El contenedor puede crear beans, configurarlos, inyectarlos y participar en su ciclo de vida.
- Spring Boot se apoya completamente en esta infraestructura.
- Entender beans y contenedor es clave para entender el resto del ecosistema Spring.

## Próximo tema

En el próximo tema vas a profundizar en cómo Spring conecta esos beans entre sí mediante **inyección de dependencias**, y por qué ese mecanismo es una de las claves para escribir aplicaciones más desacopladas y testeables.
