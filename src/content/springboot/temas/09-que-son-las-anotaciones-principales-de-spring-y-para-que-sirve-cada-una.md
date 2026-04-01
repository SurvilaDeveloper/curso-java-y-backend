---
title: "Qué son las anotaciones principales de Spring y para qué sirve cada una"
description: "Una introducción a las anotaciones más importantes de Spring para entender cómo define componentes, configuración e inyección de dependencias."
order: 9
module: "Fundamentos de Spring y Spring Boot"
level: "intro"
draft: false
---

Hasta ahora viste varias ideas importantes:

- Spring trabaja con un contenedor
- ese contenedor administra beans
- las clases pueden recibir dependencias en lugar de crearlas manualmente
- Spring Boot simplifica mucho la configuración inicial

Pero todavía falta una pieza muy importante: entender **cómo le indicamos a Spring qué clases debe administrar y qué rol cumple cada una dentro de la aplicación**.

Ahí entran en juego las anotaciones.

## Qué es una anotación en Java

Antes de pensar en Spring, conviene recordar qué es una anotación en Java.

Una anotación es una marca que se coloca sobre una clase, un método, un atributo o un parámetro para aportar información adicional.

Por ejemplo:

```java
@Override
public String toString() {
    return "Hola";
}
```

En este caso, `@Override` le dice al compilador que ese método está sobrescribiendo otro heredado.

Spring usa muchísimo este mecanismo.

En lugar de obligarte a escribir configuraciones enormes a mano, usa anotaciones para que el código exprese cosas como estas:

- esta clase es un componente de Spring
- esta clase representa un servicio
- esta clase accede a datos
- este método responde a una petición HTTP
- esta configuración define beans
- esta dependencia debe ser inyectada

## Por qué Spring usa tantas anotaciones

Spring podría haberse apoyado mucho más en configuración externa o en código manual, pero las anotaciones volvieron el desarrollo mucho más directo.

Gracias a ellas, una clase puede expresar su responsabilidad de forma bastante clara.

Por ejemplo:

```java
@Service
public class UsuarioService {
}
```

Con solo ver eso, ya entendés que:

- la clase representa una lógica de servicio
- Spring la va a detectar como bean si está dentro del escaneo
- puede ser inyectada en otras clases

Las anotaciones no reemplazan el diseño, pero ayudan a que la estructura del proyecto sea más legible y consistente.

## La idea general: Spring necesita saber qué administrar

El contenedor no administra todas las clases del proyecto automáticamente porque sí.

Necesita pistas.

Esas pistas suelen venir de dos caminos:

- clases anotadas, como `@Component`, `@Service`, `@Repository`, `@Controller`
- clases de configuración, como `@Configuration` y métodos `@Bean`

En los temas iniciales de Spring Boot, las anotaciones más importantes son justamente las que definen:

- componentes
- configuración
- controladores web
- mapeos HTTP
- inyección de dependencias

## `@Component`: la anotación base para registrar una clase como bean

La anotación más general es `@Component`.

Sirve para marcar una clase como candidata a ser detectada por Spring y registrada como bean.

```java
@Component
public class FechaProvider {

    public String hoy() {
        return "2026-03-27";
    }
}
```

Si esta clase está dentro del paquete que Spring escanea, el contenedor puede crearla y administrarla.

Después, otra clase podría recibirla por inyección:

```java
@Service
public class ReporteService {

    private final FechaProvider fechaProvider;

    public ReporteService(FechaProvider fechaProvider) {
        this.fechaProvider = fechaProvider;
    }
}
```

### Cuándo usar `@Component`

`@Component` se usa cuando una clase forma parte de la aplicación y querés que Spring la gestione, pero no encaja mejor en una anotación más específica.

Por ejemplo:

- utilidades de negocio
- adaptadores
- helpers con lógica propia
- proveedores internos

Aun así, en la práctica suele preferirse usar anotaciones más semánticas cuando corresponda.

## `@Service`: para lógica de negocio

`@Service` es una especialización de `@Component`.

Eso significa que, técnicamente, también registra la clase como bean. Pero además comunica algo importante: **esa clase representa lógica de negocio o coordinación de reglas de la aplicación**.

```java
@Service
public class PedidoService {

    public void crearPedido() {
        System.out.println("Creando pedido...");
    }
}
```

### Qué comunica `@Service`

Cuando una clase tiene `@Service`, normalmente esperamos que allí viva parte de la lógica del sistema:

- validaciones de negocio
- coordinación entre repositorios
- cálculos
- decisiones del dominio
- reglas que no deberían quedar en el controller

No es que Spring haga magia especial solo por poner `@Service` en vez de `@Component`, pero sí mejora mucho la lectura del proyecto.

## `@Repository`: para acceso a datos

`@Repository` también es una especialización de `@Component`.

Se usa para clases que trabajan con persistencia o acceso a datos.

```java
@Repository
public class ProductoRepository {

    public void guardar() {
        System.out.println("Guardando producto...");
    }
}
```

### Qué comunica `@Repository`

Esta anotación le dice al lector del código que la clase pertenece a la capa de acceso a datos.

Por ejemplo:

- consultas
- persistencia
- interacción con base de datos
- lectura y escritura de entidades

En ciertos escenarios, además, Spring puede aplicar comportamientos relacionados con excepciones de persistencia. Pero por ahora lo importante es entender la idea estructural.

## `@Controller` y `@RestController`

Estas anotaciones se usan en la capa web.

### `@Controller`

Se usa principalmente en aplicaciones MVC tradicionales, donde una clase maneja requests y devuelve vistas.

```java
@Controller
public class HomeController {
}
```

### `@RestController`

Es una forma más directa de trabajar con APIs REST.

```java
@RestController
public class SaludoController {

    @GetMapping("/saludo")
    public String saludar() {
        return "Hola";
    }
}
```

`@RestController` combina la idea de controller con respuesta serializada directamente al cuerpo HTTP.

En proyectos de API, esta es una de las anotaciones más comunes.

## `@Configuration`: clases que definen configuración explícita

Hasta ahora viste clases detectadas por escaneo automático. Pero a veces necesitás definir beans de forma explícita.

Ahí aparece `@Configuration`.

```java
@Configuration
public class AppConfig {
}
```

Una clase con `@Configuration` suele contener métodos anotados con `@Bean`.

## `@Bean`: registrar un objeto manualmente en el contenedor

`@Bean` se usa sobre un método dentro de una clase `@Configuration` para indicarle a Spring que el objeto retornado debe registrarse como bean.

```java
@Configuration
public class AppConfig {

    @Bean
    public Clock sistemaClock() {
        return Clock.systemDefaultZone();
    }
}
```

Esto es útil cuando:

- querés registrar clases de librerías externas
- necesitás construir el objeto manualmente
- querés una configuración más explícita
- el componente no está anotado con `@Component`

### Diferencia entre `@Component` y `@Bean`

Aunque ambos terminan registrando algo en el contenedor, no son exactamente lo mismo.

#### `@Component`

Se usa sobre la clase.
Spring detecta esa clase automáticamente mediante component scanning.

#### `@Bean`

Se usa sobre un método.
Vos devolvés el objeto y Spring lo registra.

En resumen:

- `@Component` = detección automática de clases propias
- `@Bean` = registro explícito desde configuración

## `@SpringBootApplication`: la gran anotación de arranque

En aplicaciones Spring Boot, una de las anotaciones más importantes es `@SpringBootApplication`.

```java
@SpringBootApplication
public class MiAplicacion {

    public static void main(String[] args) {
        SpringApplication.run(MiAplicacion.class, args);
    }
}
```

Esta anotación combina varias ideas clave de Spring Boot.

A nivel conceptual, lo importante es entender que marca la clase principal de la aplicación y habilita la configuración automática y el escaneo de componentes.

Más adelante vas a verla con más detalle, pero desde ya conviene reconocerla como una anotación central del arranque de Boot.

## `@Autowired`: inyección automática de dependencias

Históricamente, Spring usó mucho `@Autowired` para indicar que una dependencia debía inyectarse.

```java
@Service
public class ClienteService {

    @Autowired
    private EmailService emailService;
}
```

Eso funciona, pero hoy en día se recomienda preferir **inyección por constructor**.

```java
@Service
public class ClienteService {

    private final EmailService emailService;

    public ClienteService(EmailService emailService) {
        this.emailService = emailService;
    }
}
```

### Por qué se prefiere constructor injection

Porque:

- deja claras las dependencias obligatorias
- facilita pruebas
- mejora la inmutabilidad
- hace más explícito el diseño

Entonces, aunque `@Autowired` sigue siendo importante y conviene conocerla, no necesariamente tiene que ser tu primera opción en código nuevo.

## Anotaciones web básicas: `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`

Cuando trabajás con controllers REST, estas anotaciones indican qué método HTTP maneja cada método del controller.

```java
@RestController
@RequestMapping("/productos")
public class ProductoController {

    @GetMapping
    public String listar() {
        return "Listado";
    }

    @PostMapping
    public String crear() {
        return "Creado";
    }
}
```

Estas anotaciones no definen beans, pero sí forman parte del conjunto de anotaciones esenciales de Spring porque estructuran la capa web.

## `@RequestMapping`: base para definir rutas

`@RequestMapping` permite declarar una ruta base o mapear métodos HTTP.

```java
@RestController
@RequestMapping("/usuarios")
public class UsuarioController {
}
```

Después, adentro de esa clase, otros mappings pueden construir rutas más específicas.

## `@PathVariable`, `@RequestParam` y `@RequestBody`

También son muy importantes en la capa web.

### `@PathVariable`

Sirve para capturar un valor desde la URL.

```java
@GetMapping("/{id}")
public String obtener(@PathVariable Long id) {
    return "Usuario " + id;
}
```

### `@RequestParam`

Sirve para leer parámetros de query string.

```java
@GetMapping
public String buscar(@RequestParam String nombre) {
    return nombre;
}
```

### `@RequestBody`

Sirve para recibir datos enviados en el cuerpo de la petición, normalmente JSON.

```java
@PostMapping
public String crear(@RequestBody UsuarioRequest request) {
    return request.nombre();
}
```

## `@Valid`: validación de datos de entrada

Otra anotación muy usada en Spring Boot es `@Valid`.

Se usa para activar validación sobre objetos recibidos en requests.

```java
@PostMapping
public String crear(@Valid @RequestBody UsuarioRequest request) {
    return "ok";
}
```

Esto suele combinarse con constraints como:

- `@NotBlank`
- `@Email`
- `@Size`
- `@Min`
- `@Max`

Más adelante lo vas a estudiar de lleno, pero ya conviene reconocerla como parte del lenguaje habitual de Spring Boot.

## La importancia de la semántica en las anotaciones

Una de las claves para escribir código claro en Spring no es solo “que funcione”, sino elegir la anotación adecuada según la responsabilidad de cada clase.

Por ejemplo:

- si una clase orquesta reglas de negocio, `@Service` comunica mejor que `@Component`
- si una clase expone endpoints, `@RestController` comunica mucho mejor que un componente genérico
- si una clase maneja acceso a datos, `@Repository` deja más clara su intención

Esto hace que la arquitectura del proyecto sea más legible.

## Un ejemplo pequeño con varias anotaciones juntas

```java
@RestController
@RequestMapping("/clientes")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping
    public String listar() {
        return clienteService.listar();
    }
}
```

```java
@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    public String listar() {
        return clienteRepository.listar();
    }
}
```

```java
@Repository
public class ClienteRepository {

    public String listar() {
        return "clientes";
    }
}
```

En ese ejemplo se ve algo muy importante:

- `@RestController` expone la entrada HTTP
- `@Service` concentra la lógica de servicio
- `@Repository` representa la capa de acceso a datos
- la inyección por constructor une las piezas

Ese patrón lo vas a ver una y otra vez en aplicaciones Spring Boot.

## Error común: creer que las anotaciones reemplazan el diseño

Un error muy común es pensar algo así:

> “Si ya puse `@Service`, entonces la clase ya está bien diseñada.”

No necesariamente.

Las anotaciones ayudan a declarar roles, pero no corrigen problemas como:

- clases gigantes
- lógica mezclada
- malas dependencias
- responsabilidades mal separadas
- controllers haciendo trabajo de servicio
- servicios haciendo trabajo de repositorio

Las anotaciones organizan, pero no piensan por vos.

## Qué conviene llevarte de este tema

En esta etapa no necesitás memorizar todas las anotaciones del ecosistema Spring.

Lo importante es quedarte con este mapa inicial:

- `@Component` → componente genérico administrado por Spring
- `@Service` → lógica de negocio
- `@Repository` → acceso a datos
- `@Controller` / `@RestController` → capa web
- `@Configuration` → configuración explícita
- `@Bean` → registrar objetos manualmente
- `@SpringBootApplication` → clase principal de una app Boot
- `@Autowired` → inyección automática, aunque hoy suele preferirse constructor injection
- anotaciones web como `@GetMapping`, `@PostMapping`, `@RequestBody`, etc. → manejo de requests

Con este mapa ya empezás a leer proyectos Spring con mucha más claridad.

## Resumen

- Spring usa anotaciones para declarar componentes, configuración, endpoints e inyección.
- `@Component` es la base para registrar clases como beans.
- `@Service`, `@Repository` y `@RestController` especializan ese rol según la capa.
- `@Configuration` y `@Bean` sirven para registrar objetos de forma explícita.
- En la capa web aparecen anotaciones como `@RequestMapping`, `@GetMapping` y `@RequestBody`.
- Las anotaciones ayudan mucho, pero no reemplazan una buena arquitectura.

## Próximo tema

En el próximo tema vas a ver cómo funciona el **component scanning**, es decir, cómo detecta Spring esas clases anotadas y cómo decide qué beans registrar dentro del contenedor.
