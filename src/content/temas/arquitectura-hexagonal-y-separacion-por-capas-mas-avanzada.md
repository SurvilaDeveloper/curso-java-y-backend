---
title: "Arquitectura hexagonal y separación por capas más avanzada"
description: "Qué es la arquitectura hexagonal, por qué puede mejorar el diseño de un backend y cómo se relaciona con controllers, services, repositories y adaptadores."
order: 56
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
- repositories
- JPA
- testing
- seguridad
- Docker
- CI/CD
- observabilidad
- cache

Esa base ya te permite construir aplicaciones muy valiosas y bastante serias.

Pero cuando los proyectos crecen, aparece una pregunta importante:

**¿cómo hacés para que la estructura del sistema siga siendo mantenible cuando aumentan módulos, reglas, integraciones y complejidad?**

Ahí empieza a cobrar mucho sentido mirar una arquitectura más explícita.

Una de las más conocidas para este objetivo es la arquitectura hexagonal.

## Qué es arquitectura hexagonal

La arquitectura hexagonal es una forma de organizar un sistema para separar mejor:

- la lógica del negocio
- la infraestructura
- los puntos de entrada y salida del sistema

También se la suele conocer como:

- Ports and Adapters
- arquitectura de puertos y adaptadores

## La idea general

La idea central es que el corazón del sistema no debería depender directamente de detalles externos como:

- HTTP
- base de datos
- framework web
- Redis
- mensajería
- email
- integraciones con APIs externas

En cambio, el núcleo del negocio debería expresar sus reglas y casos de uso de forma más independiente.

## Por qué “hexagonal”

El hexágono no es importante por la figura en sí.

Se usa sobre todo como una forma visual de expresar que el sistema puede tener múltiples lados o entradas/salidas, no una única dirección rígida.

La idea importante no es “dibujar un hexágono”, sino pensar mejor los límites entre:

- dominio
- casos de uso
- infraestructura
- adaptadores externos

## Qué problema intenta resolver

En muchos proyectos, sobre todo cuando crecen rápido, termina pasando algo así:

- el controller conoce demasiado
- el service mezcla negocio con infraestructura
- el repository se vuelve inseparable del resto
- el framework invade todo
- la lógica del negocio depende demasiado de detalles técnicos

Eso vuelve más difícil:

- testear
- cambiar infraestructura
- evolucionar el sistema
- entender qué es negocio y qué es integración

## Qué propone la arquitectura hexagonal

Propone, en esencia:

- poner el negocio más al centro
- aislarlo de infraestructura
- interactuar con el exterior mediante puertos
- implementar esos puertos con adaptadores

## Qué es un puerto

Un puerto es una abstracción que define cómo el núcleo del sistema interactúa con algo.

Puede ser:

- una entrada al sistema
- una salida hacia algo externo

## Qué es un adaptador

Un adaptador es una implementación concreta que conecta esa abstracción con el mundo real.

Por ejemplo:

- un controller REST puede ser un adaptador de entrada
- un repository JPA puede ser un adaptador de salida
- un cliente HTTP externo puede ser otro adaptador de salida

## Diferencia mental útil

Podés pensarlo así:

- puerto = contrato
- adaptador = implementación concreta

## Qué sería el centro del sistema

En una lectura bastante sana de arquitectura hexagonal, en el centro deberían vivir cosas como:

- entidades del dominio
- reglas del negocio
- casos de uso
- contratos importantes del sistema

Y más afuera quedarían cosas como:

- Spring MVC
- JPA
- Redis
- seguridad técnica
- integración con terceros

## Relación con la separación por capas que ya viste

Esto es importante.

La arquitectura hexagonal no niega que haya controllers, services y repositories.

Más bien, obliga a pensar mejor qué rol cumplen y de qué deberían depender.

O sea:

- lo que ya viste sigue siendo útil
- pero ahora se vuelve más explícito qué queda “adentro” y qué queda “afuera”

## Capas clásicas vs hexagonal

En una arquitectura por capas clásica, a veces se piensa algo así:

- controller
- service
- repository

Eso ayuda bastante, pero no siempre alcanza para dejar claras las dependencias correctas.

En hexagonal, además de separar capas, se pone mucho foco en que el negocio no dependa de detalles externos concretos.

## Ejemplo mental simple

Supongamos un caso de uso:

**crear producto**

En una estructura más tradicional, podrías tener:

- `ProductController`
- `ProductService`
- `ProductRepository`

Eso está bien.

Pero en hexagonal querrías preguntarte además:

- ¿el caso de uso depende de JPA directamente?
- ¿la lógica central sabe demasiado de Spring?
- ¿podría cambiar la persistencia sin romper el núcleo?

## Caso de uso

Una idea muy importante en esta arquitectura es la de caso de uso.

Un caso de uso representa una operación relevante del sistema.

Por ejemplo:

- crear producto
- registrar usuario
- confirmar orden
- cancelar orden
- renovar token
- listar productos activos

## Por qué importa pensar en casos de uso

Porque obliga a modelar el sistema por comportamiento del negocio, no solo por piezas técnicas.

## Ejemplo conceptual de caso de uso

```java
public interface CreateProductUseCase {
    ProductResult createProduct(CreateProductCommand command);
}
```

## Qué expresa esto

Expresa el contrato del caso de uso.

Todavía no habla de:

- controller
- JPA
- endpoint
- Redis
- HTTP

Habla del negocio:
crear un producto.

## Comando de entrada

También es común usar objetos específicos para representar entrada del caso de uso.

Ejemplo:

```java
public class CreateProductCommand {
    private final String name;
    private final double price;

    public CreateProductCommand(String name, double price) {
        this.name = name;
        this.price = price;
    }

    public String getName() {
        return name;
    }

    public double getPrice() {
        return price;
    }
}
```

## Resultado del caso de uso

Y algo similar para la salida:

```java
public class ProductResult {
    private final Long id;
    private final String name;
    private final double price;

    public ProductResult(Long id, String name, double price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public double getPrice() {
        return price;
    }
}
```

## Qué gana este enfoque

Que el caso de uso queda descrito con lenguaje del sistema, no con detalles accidentales del framework.

## Puerto de salida

Ahora imaginá que para crear el producto necesitás guardar algo.

En vez de depender directamente de un repository JPA concreto, podrías definir un puerto de salida como este:

```java
public interface SaveProductPort {
    Product save(Product product);
}
```

## Qué expresa esto

Expresa que el caso de uso necesita una capacidad:

**guardar producto**

No dice todavía si eso se hará con:

- JPA
- JDBC
- memoria
- API externa
- otra tecnología

## Implementación del caso de uso

```java
public class CreateProductService implements CreateProductUseCase {

    private final SaveProductPort saveProductPort;

    public CreateProductService(SaveProductPort saveProductPort) {
        this.saveProductPort = saveProductPort;
    }

    @Override
    public ProductResult createProduct(CreateProductCommand command) {
        if (command.getPrice() < 0) {
            throw new IllegalArgumentException("El precio no puede ser negativo");
        }

        Product product = new Product(null, command.getName(), command.getPrice(), true);
        Product saved = saveProductPort.save(product);

        return new ProductResult(saved.getId(), saved.getName(), saved.getPrice());
    }
}
```

## Qué tiene de importante este ejemplo

La lógica central depende de una abstracción (`SaveProductPort`), no de una implementación concreta de infraestructura.

Eso es muy valioso.

## Adaptador de salida con JPA

Después, afuera del núcleo, podrías tener un adaptador concreto.

Ejemplo conceptual:

```java
import org.springframework.stereotype.Component;

@Component
public class ProductJpaAdapter implements SaveProductPort {

    private final SpringDataProductRepository repository;

    public ProductJpaAdapter(SpringDataProductRepository repository) {
        this.repository = repository;
    }

    @Override
    public Product save(Product product) {
        ProductEntity entity = ProductEntity.fromDomain(product);
        ProductEntity saved = repository.save(entity);
        return saved.toDomain();
    }
}
```

## Qué muestra esto

Muestra que la infraestructura JPA queda en un adaptador, no metida de lleno en el caso de uso.

## Adaptador de entrada con controller REST

También podrías tener un adaptador de entrada así:

```java
@RestController
@RequestMapping("/products")
public class ProductController {

    private final CreateProductUseCase createProductUseCase;

    public ProductController(CreateProductUseCase createProductUseCase) {
        this.createProductUseCase = createProductUseCase;
    }

    @PostMapping
    public ProductResponseDto create(@RequestBody CreateProductRequestDto request) {
        CreateProductCommand command = new CreateProductCommand(
                request.getName(),
                request.getPrice()
        );

        ProductResult result = createProductUseCase.createProduct(command);

        return new ProductResponseDto(
                result.getId(),
                result.getName(),
                result.getPrice()
        );
    }
}
```

## Qué tiene de valioso esto

El controller no depende de la implementación concreta de infraestructura del caso de uso.

Depende del puerto de entrada.

Eso deja bastante más desacoplada la estructura.

## Entrada y salida

Una forma muy útil de pensar esta arquitectura es:

### Adaptadores de entrada

Llevan cosas del mundo exterior hacia el núcleo.

Ejemplos:

- controller REST
- consumidor de cola
- CLI
- scheduler

### Adaptadores de salida

Llevan necesidades del núcleo hacia infraestructura externa.

Ejemplos:

- repository JPA
- cliente Redis
- cliente SMTP
- integración con API externa

## Qué gana el dominio con esto

El dominio o la lógica central queda menos contaminado por decisiones técnicas específicas.

Eso hace más fácil:

- testear
- cambiar implementaciones
- razonar sobre negocio
- escalar diseño con más control

## Hexagonal no significa complejidad obligatoria

Esto es importante.

No significa que todo proyecto deba llenarse de interfaces y capas exageradas.

Como casi todo en arquitectura, tiene que usarse con criterio.

## Cuándo empieza a aportar más valor

Suele aportar más cuando:

- el proyecto crece
- hay varios módulos de negocio
- hay varias integraciones externas
- querés testear mejor casos de uso
- querés aislar framework e infraestructura
- querés sostener evolución a mediano plazo

## Cuándo puede ser demasiado

Puede ser excesivo si:

- el proyecto es muy pequeño
- todavía no hay suficiente complejidad real
- agregás abstracciones sin necesidad
- terminás con mucho código ceremonial y poco valor

## No se trata de copiar una moda

Se trata de preguntarte si el proyecto realmente gana claridad y mantenibilidad con ese nivel de separación.

## Relación con testing

Una gran ventaja de esta arquitectura es que los casos de uso pueden testearse con mucha comodidad porque dependen de puertos abstractos.

Por ejemplo, podrías mockear o fakear `SaveProductPort` sin levantar Spring, HTTP ni JPA.

## Ejemplo mental de test

```java
@Test
void shouldCreateProductWhenPriceIsValid() {
    SaveProductPort savePort = product -> new Product(1L, product.getName(), product.getPrice(), true);
    CreateProductUseCase useCase = new CreateProductService(savePort);

    ProductResult result = useCase.createProduct(new CreateProductCommand("Notebook", 1250.50));

    assertEquals("Notebook", result.getName());
}
```

## Qué demuestra esto

Demuestra que el caso de uso puede probarse en aislamiento bastante limpio.

## Relación con Spring Boot

Spring Boot sigue siendo muy útil.

No desaparece.

La diferencia es que se intenta que Spring viva más en los bordes de la aplicación y no invada innecesariamente el corazón del negocio.

## Qué suele vivir más afuera

Por ejemplo:

- `@RestController`
- `@Repository`
- configuración de seguridad
- integración con Redis
- detalles de JPA
- clientes HTTP concretos

## Qué suele vivir más adentro

Por ejemplo:

- reglas de negocio
- casos de uso
- contratos del dominio
- modelos de negocio relevantes

## Entidades de dominio vs entidades JPA

Este es un punto muy importante.

En algunos diseños hexagonales, se separan:

- entidad de dominio
- entidad de persistencia JPA

Eso aumenta separación, pero también complejidad.

En ciertos proyectos vale mucho la pena.
En otros puede ser demasiado.

## Qué conviene hacer al principio

No hace falta separar absolutamente todo al extremo desde el primer minuto.

Una evolución razonable puede ser:

1. buena separación clásica por capas
2. puertos en casos de uso importantes
3. adaptadores claros para infraestructura
4. más desacople donde realmente aporta

## Ejemplo de estructura posible

Una estructura conceptual podría verse así:

```text
application/
  usecase/
  port/in/
  port/out/

domain/
  model/
  exception/

infrastructure/
  adapter/in/web/
  adapter/out/persistence/
  config/
```

## Qué transmite esta estructura

Que el proyecto se organiza más por responsabilidad arquitectónica que solo por tipo técnico superficial.

## Ventaja de fondo

La ventaja más fuerte no es “queda más elegante”.

La ventaja fuerte es que te obliga a pensar:

- qué es negocio
- qué es infraestructura
- qué es entrada
- qué es salida
- qué depende de qué

Y eso mejora mucho decisiones de diseño.

## Desventaja o costo

También tiene costo.

Por ejemplo:

- más clases
- más interfaces
- más estructura
- más decisiones de diseño

Por eso conviene usarla cuando el valor justifica esa inversión.

## Ejemplo completo resumido

### Puerto de entrada

```java
public interface CreateProductUseCase {
    ProductResult createProduct(CreateProductCommand command);
}
```

### Puerto de salida

```java
public interface SaveProductPort {
    Product save(Product product);
}
```

### Caso de uso

```java
public class CreateProductService implements CreateProductUseCase {

    private final SaveProductPort saveProductPort;

    public CreateProductService(SaveProductPort saveProductPort) {
        this.saveProductPort = saveProductPort;
    }

    @Override
    public ProductResult createProduct(CreateProductCommand command) {
        if (command.getPrice() < 0) {
            throw new IllegalArgumentException("El precio no puede ser negativo");
        }

        Product product = new Product(null, command.getName(), command.getPrice(), true);
        Product saved = saveProductPort.save(product);

        return new ProductResult(saved.getId(), saved.getName(), saved.getPrice());
    }
}
```

### Adaptador REST

```java
@RestController
@RequestMapping("/products")
public class ProductController {

    private final CreateProductUseCase createProductUseCase;

    public ProductController(CreateProductUseCase createProductUseCase) {
        this.createProductUseCase = createProductUseCase;
    }

    @PostMapping
    public ProductResponseDto create(@RequestBody CreateProductRequestDto request) {
        ProductResult result = createProductUseCase.createProduct(
                new CreateProductCommand(request.getName(), request.getPrice())
        );

        return new ProductResponseDto(
                result.getId(),
                result.getName(),
                result.getPrice()
        );
    }
}
```

## Qué demuestra este ejemplo

Demuestra varias ideas centrales:

- el controller actúa como adaptador de entrada
- el caso de uso expresa negocio
- la persistencia se abstrae como puerto
- el sistema gana desacople entre núcleo e infraestructura

## Buenas prácticas iniciales

## 1. No adoptar hexagonal como moda vacía

Usarla donde realmente aporte claridad y mantenibilidad.

## 2. Identificar primero casos de uso importantes

Ahí suele tener más sentido empezar.

## 3. Separar bien puertos de implementaciones

Ese es uno de los corazones del enfoque.

## 4. No sobreingenierizar proyectos diminutos

Más arquitectura no siempre significa mejor diseño.

## 5. Pensar arquitectura como herramienta para el negocio, no como decoración

Eso mantiene el criterio sano.

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede recordarte a separar dominio, casos de uso e infraestructura de una forma más explícita que en un backend expressivo típico. En Java y Spring Boot, esta arquitectura suele encajar muy bien porque el ecosistema se presta bastante a contratos claros y tipados.

### Si venís de Python

Puede parecerse a enfoques donde el dominio y los casos de uso se mantienen aislados de frameworks e infraestructura. En Java, la arquitectura hexagonal suele tomar mucha fuerza porque ayuda a evitar que Spring, JPA o integraciones externas invadan demasiado el corazón del sistema.

## Errores comunes

### 1. Creer que hexagonal es obligatoria para todo proyecto

No lo es.

### 2. Agregar interfaces sin propósito real

Eso genera ceremonias vacías.

### 3. Mezclar negocio central con detalles de infraestructura igual que antes

Entonces no estás obteniendo el valor de la arquitectura.

### 4. Llevar la separación a un extremo innecesario demasiado pronto

Eso puede frenar más de lo que ayuda.

### 5. No entender primero bien la arquitectura por capas clásica

Hexagonal suele aprovecharse mucho mejor cuando ya dominás esa base.

## Mini ejercicio

Tomá un caso de uso de tu proyecto integrador, por ejemplo:

- crear producto
- registrar usuario
- crear orden

Y definí:

1. un puerto de entrada
2. un comando o request interno
3. un resultado
4. un puerto de salida que necesite el caso de uso
5. un adaptador REST
6. un adaptador de persistencia

Aunque sea conceptual, intentá separar bien negocio e infraestructura.

## Ejemplo posible

Caso de uso:
`CreateOrderUseCase`

Puerto de salida:
`SaveOrderPort`

Adaptador de entrada:
`OrderController`

Adaptador de salida:
`OrderJpaAdapter`

## Resumen

En esta lección viste que:

- la arquitectura hexagonal busca separar mejor negocio e infraestructura
- se apoya en la idea de puertos y adaptadores
- los casos de uso quedan más al centro del sistema
- controllers y repositories concretos pueden entenderse como adaptadores
- este enfoque puede mejorar testabilidad, desacople y mantenibilidad
- conviene usarlo con criterio y no como moda automática

## Siguiente tema

La siguiente natural es **mensajería y eventos: introducción a colas y procesamiento asíncrono**, porque después de entender una arquitectura más flexible y desacoplada, el siguiente paso muy interesante es empezar a ver cómo ciertos sistemas se comunican y procesan trabajo más allá del request-respose tradicional.
