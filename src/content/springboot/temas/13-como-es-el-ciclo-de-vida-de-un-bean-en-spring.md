---
title: "Cómo es el ciclo de vida de un bean en Spring"
description: "Entender en qué momentos Spring crea, inicializa, usa y destruye un bean, y por qué eso importa en una aplicación Spring Boot."
order: 13
module: "Fundamentos de Spring y Spring Boot"
level: "intro"
draft: false
---

Cuando una clase pasa a ser un bean administrado por Spring, deja de ser simplemente un objeto más creado con `new` y empieza a formar parte del ciclo de vida del contenedor.

Eso significa que Spring no solo puede crear ese objeto, sino también:

- decidir cuándo instanciarlo
- resolver sus dependencias
- inicializarlo
- ponerlo a disposición de otras clases
- y, en ciertos casos, destruirlo de manera ordenada

Entender esto es importante porque muchas cosas que más adelante parecen “automáticas” en Spring en realidad se apoyan en este ciclo de vida.

## Qué significa ciclo de vida de un bean

El ciclo de vida de un bean es el recorrido que hace ese objeto desde que Spring lo detecta y lo crea hasta que deja de usarse o el contenedor se apaga.

A grandes rasgos, ese recorrido suele pasar por estas etapas:

1. Spring detecta que ese bean existe.
2. Spring crea la instancia.
3. Spring resuelve e inyecta sus dependencias.
4. Spring ejecuta pasos de inicialización.
5. El bean queda disponible para usarse en la aplicación.
6. Cuando el contexto se cierra, Spring puede ejecutar lógica de destrucción.

No todos los beans pasan exactamente por todas las etapas de la misma forma, pero esta es la idea general.

## Por qué importa entender esto

A primera vista podría parecer un detalle interno del framework, pero no lo es.

Entender el ciclo de vida de un bean te ayuda a comprender:

- por qué una dependencia ya está lista cuando la usás
- en qué momento conviene inicializar recursos
- cómo ejecutar lógica al arrancar la aplicación
- cómo liberar recursos correctamente
- por qué ciertas anotaciones funcionan como funcionan
- qué hace realmente Spring detrás de escena

En otras palabras: te da una imagen mental más clara del funcionamiento real del contenedor.

## Todo empieza con el ApplicationContext

El contenedor de Spring suele representarse mediante el `ApplicationContext`.

Cuando la aplicación arranca, Spring Boot crea ese contexto y empieza a cargar la configuración del proyecto.

Durante ese proceso, Spring:

- analiza clases y configuraciones
- detecta componentes
- registra definiciones de beans
- resuelve dependencias
- construye el grafo de objetos necesario para la aplicación

Ese contexto es el que mantiene los beans vivos mientras la aplicación está funcionando.

## Fase 1: detección y registro del bean

Antes de crear un bean, Spring primero tiene que saber que existe.

Eso puede ocurrir de varias maneras:

- porque la clase fue detectada por component scanning
- porque fue declarada manualmente con un método `@Bean`
- porque viene dada por alguna auto-configuración de Spring Boot

Por ejemplo, con component scanning:

```java
@Service
public class PedidoService {
}
```

O con configuración manual:

```java
@Configuration
public class AppConfig {

    @Bean
    public PedidoService pedidoService() {
        return new PedidoService();
    }
}
```

En ambos casos, Spring registra que hay un bean que forma parte del contexto.

## Fase 2: instanciación

Una vez que Spring sabe que tiene que gestionar ese bean, crea la instancia.

En esta etapa se construye el objeto real.

Por ejemplo, si la clase usa inyección por constructor:

```java
@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;

    public PedidoService(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }
}
```

Spring crea `PedidoService`, pero para hacerlo antes necesita resolver `PedidoRepository`.

Por eso, cuando hay dependencias, el contenedor no crea objetos de forma aislada, sino que arma una red de objetos conectados entre sí.

## Fase 3: inyección de dependencias

Después de instanciar, Spring se asegura de que el bean reciba lo que necesita para funcionar.

En la práctica, esto suele pasar al crear el bean, especialmente con inyección por constructor, que es la forma más recomendable.

```java
@Service
public class FacturaService {

    private final ClienteService clienteService;
    private final EmailService emailService;

    public FacturaService(ClienteService clienteService, EmailService emailService) {
        this.clienteService = clienteService;
        this.emailService = emailService;
    }
}
```

Spring busca los beans necesarios, los resuelve y los inyecta.

Gracias a eso, cuando `FacturaService` queda listo, ya tiene adentro todas sus dependencias.

## Fase 4: inicialización

Una vez creado el bean y resueltas sus dependencias, Spring puede ejecutar lógica de inicialización.

Esta fase sirve para preparar el objeto antes de su uso normal.

Por ejemplo, se puede usar `@PostConstruct`:

```java
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

@Service
public class CacheService {

    @PostConstruct
    public void init() {
        System.out.println("Inicializando la caché...");
    }
}
```

Ese método se ejecuta cuando Spring terminó de construir el bean y ya inyectó sus dependencias.

### Para qué sirve la inicialización

Puede usarse para:

- cargar configuración derivada
- preparar caches
- validar estado interno
- abrir recursos
- dejar el bean listo para trabajar

De todos modos, conviene no abusar de esta etapa ni meter lógica pesada sin necesidad.

## Fase 5: uso del bean dentro de la aplicación

Después de la inicialización, el bean ya queda disponible para que el resto de la aplicación lo use.

En este punto, el bean forma parte del contexto y puede ser inyectado en otras clases.

Por ejemplo:

```java
@RestController
@RequestMapping("/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }
}
```

Cuando entra un request, Spring usa los beans ya preparados para atender esa operación.

En otras palabras: el bean no se crea cada vez que vos lo llamás desde el código. En general, ya fue preparado antes por el contenedor.

## Fase 6: destrucción del bean

Cuando la aplicación se detiene y el contexto se cierra, Spring puede ejecutar lógica de destrucción para ciertos beans.

Esto es útil cuando hay recursos que conviene liberar de manera ordenada.

Por ejemplo, se puede usar `@PreDestroy`:

```java
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Service;

@Service
public class ConexionTemporalService {

    @PreDestroy
    public void cerrar() {
        System.out.println("Liberando recursos antes de cerrar la aplicación...");
    }
}
```

Esto puede servir para:

- cerrar conexiones
- liberar archivos abiertos
- detener procesos internos
- apagar recursos externos
- guardar estado antes de cerrar

## Resumen visual del ciclo

Una forma simple de imaginarlo es así:

```text
Detección -> Registro -> Creación -> Inyección -> Inicialización -> Uso -> Destrucción
```

No siempre vas a intervenir manualmente en cada fase, pero conocerlas te ayuda a entender qué está pasando.

## El ciclo de vida no es igual a “usar new”

Cuando hacés esto:

```java
PedidoService service = new PedidoService();
```

estás creando un objeto simple de Java.

Ese objeto:

- no vive dentro del contenedor
- no participa del ciclo de vida de Spring
- no recibe automáticamente dependencias
- no ejecuta callbacks de Spring
- no puede ser administrado igual que un bean

En cambio, cuando Spring crea el objeto, sí entra dentro de todo ese circuito administrado.

Por eso una clase común y un bean pueden parecer lo mismo desde afuera, pero no funcionan igual.

## Métodos comunes para engancharse al ciclo de vida

Aunque lo más importante es entender la idea general, hay varias formas frecuentes de interactuar con el ciclo de vida.

### `@PostConstruct`

Se usa para ejecutar lógica justo después de que Spring termina de crear e inyectar el bean.

```java
@PostConstruct
public void init() {
    System.out.println("Bean listo");
}
```

### `@PreDestroy`

Se usa para ejecutar lógica justo antes de destruir el bean.

```java
@PreDestroy
public void destroy() {
    System.out.println("Bean destruido");
}
```

### `InitializingBean` y `DisposableBean`

También existen interfaces específicas para inicialización y destrucción, pero hoy suelen usarse menos en código moderno porque las anotaciones suelen ser más claras.

## El scope influye en el ciclo de vida

No todos los beans viven igual.

El scope define cómo y cuándo existe un bean.

El más común es `singleton`, donde Spring crea una sola instancia para todo el contexto.

En ese caso, el ciclo de vida suele ser:

- se crea al arrancar el contexto o cuando se necesita
- vive durante toda la aplicación
- se destruye al cerrar el contexto

Más adelante vas a ver scopes con más detalle, pero conviene que ya sepas que el ciclo de vida también depende de eso.

## Inicialización temprana y lazy loading

Por defecto, muchos beans se crean al arrancar la aplicación.

Eso ayuda a detectar errores pronto, porque si falta una dependencia o hay una configuración inválida, el problema aparece en el arranque.

Pero Spring también puede retrasar la creación de algunos beans cuando hace falta.

A esto se lo suele asociar con inicialización lazy.

La idea general es:

- inicialización temprana: el bean se crea al arrancar
- inicialización lazy: el bean se crea recién cuando se usa por primera vez

La mayoría de las veces, para empezar, conviene pensar con la lógica por defecto y dejar los casos especiales para más adelante.

## Qué relación tiene esto con Spring Boot

Spring Boot se apoya completamente en este modelo.

Aunque Boot te ahorre mucha configuración, por debajo sigue habiendo:

- beans
- contexto
- dependencias inyectadas
- inicialización
- destrucción
- auto-configuración basada en el contenedor

O sea: Boot no reemplaza el ciclo de vida de Spring. Lo usa intensamente.

Por eso, si entendés bien el ciclo de vida de un bean, entendés mejor cómo funciona Spring Boot de verdad.

## Un ejemplo conceptual completo

Supongamos estas clases:

```java
@Repository
public class ProductoRepository {
}
```

```java
@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }
}
```

```java
@RestController
@RequestMapping("/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }
}
```

Cuando la aplicación arranca, Spring hace algo conceptualmente parecido a esto:

1. detecta `ProductoRepository`, `ProductoService` y `ProductoController`
2. registra esos beans
3. crea `ProductoRepository`
4. crea `ProductoService` e inyecta `ProductoRepository`
5. crea `ProductoController` e inyecta `ProductoService`
6. deja todo listo para recibir requests
7. al cerrar la aplicación, ejecuta destrucción si corresponde

Eso no significa que internamente siempre ocurra exactamente en ese orden simple, pero sirve para entender la lógica.

## Errores comunes al pensar el ciclo de vida

### 1. Creer que Spring crea todo “mágicamente”
No es magia. Hay reglas, detección, registro, creación e inyección.

### 2. Pensar que cualquier objeto es un bean
No. Solo los objetos administrados por Spring forman parte del contexto.

### 3. Meter lógica pesada en constructores
Lo ideal es que el constructor reciba dependencias y no haga demasiado trabajo.

### 4. Confundir inicialización con uso normal
Una cosa es preparar el bean al arrancar. Otra cosa es ejecutar su lógica de negocio durante la vida de la aplicación.

### 5. Olvidar la destrucción de recursos
Si un bean usa recursos sensibles, a veces conviene prever cómo cerrarlos bien.

## Idea clave para llevarte

Si tuvieras que quedarte con una sola idea de este tema, sería esta:

> un bean no es solo un objeto; es un objeto cuyo nacimiento, preparación, uso y eventual destrucción son administrados por Spring.

Esa administración es una de las razones por las que Spring puede ofrecer tanta flexibilidad y tanta integración entre componentes.

## Resumen

- El ciclo de vida de un bean es el recorrido que hace dentro del contenedor.
- Spring detecta, registra, crea, inicializa y usa beans.
- También puede ejecutar lógica de destrucción al cerrar el contexto.
- `@PostConstruct` y `@PreDestroy` permiten participar en esas etapas.
- Un objeto creado con `new` no participa del ciclo de vida de Spring.
- Spring Boot se apoya por completo en este modelo.

## Próximo tema

En el próximo tema vas a ver qué es el **scope de un bean** y por qué no todos los beans viven de la misma manera dentro de una aplicación Spring.
