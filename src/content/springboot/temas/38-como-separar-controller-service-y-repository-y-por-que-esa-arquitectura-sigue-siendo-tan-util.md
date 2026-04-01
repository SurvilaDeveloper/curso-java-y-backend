---
title: "Cómo separar controller, service y repository y por qué esa arquitectura sigue siendo tan útil"
description: "Entender cómo se reparten las responsabilidades entre controller, service y repository en Spring Boot, y por qué esta separación sigue siendo una base muy práctica para construir aplicaciones claras y mantenibles."
order: 38
module: "Arquitectura por capas en Spring Boot"
level: "base"
draft: false
---

Hasta ahora viste muchas piezas fundamentales de una API Spring Boot:

- controladores REST
- verbos HTTP
- entrada por ruta, query params y body
- validación
- manejo centralizado de errores
- excepciones de negocio

Eso ya te permite construir endpoints bastante serios.

Pero aparece una pregunta arquitectónica muy importante:

> ¿dónde debería vivir cada responsabilidad dentro de la aplicación?

Porque una API puede funcionar y, sin embargo, estar mal organizada.

Por ejemplo, es perfectamente posible escribir un controlador que:

- reciba el request
- valide cosas
- consulte datos
- aplique reglas de negocio
- transforme estructuras
- resuelva conflictos
- arme respuestas
- y haga todo en un solo método

Técnicamente puede funcionar.

Pero cuando el sistema crece, ese enfoque suele volverse muy difícil de mantener.

Por eso, en Spring Boot aparece una arquitectura muy conocida y todavía muy útil:

- **controller**
- **service**
- **repository**

Este tema es importante porque marca un paso clave: dejar de pensar solo en “endpoints que funcionan” y empezar a pensar en **aplicaciones bien separadas por responsabilidades**.

## La idea general

La arquitectura clásica por capas suele repartir el trabajo así:

### Controller
Se encarga de la interacción HTTP.

### Service
Se encarga de la lógica de negocio o de aplicación.

### Repository
Se encarga del acceso a datos.

Dicho de forma simple:

> el controlador habla con el mundo web, el servicio coordina el comportamiento del sistema y el repositorio habla con la persistencia.

No es la única arquitectura posible del universo, pero sigue siendo una base muy buena para muchísimos proyectos.

## Por qué esta separación sigue siendo tan útil

Porque ayuda a combatir uno de los problemas más frecuentes en aplicaciones que empiezan a crecer: la mezcla de responsabilidades.

Cuando todo vive en la misma clase o en el mismo método, empiezan a aparecer problemas como:

- controladores gigantes
- lógica repetida
- dependencias mal ubicadas
- tests más incómodos
- mayor acoplamiento
- código difícil de leer
- cambios pequeños que impactan en demasiados lugares

Separar por capas no garantiza automáticamente una arquitectura perfecta, pero sí ayuda muchísimo a mantener cierto orden estructural.

## Qué hace un controller

El controller representa la puerta de entrada HTTP.

Su trabajo suele incluir cosas como:

- mapear rutas
- recibir requests
- leer path variables, query params y request body
- disparar validación
- delegar a un servicio
- devolver una respuesta HTTP

Dicho de otra forma:

> el controller debería estar muy enfocado en el contrato web del endpoint.

Eso significa que debería preocuparse por cosas como:

- qué URL entra
- con qué verbo
- qué parámetros recibe
- qué status conviene devolver
- cómo traducir el resultado a una respuesta

Lo que no conviene es que absorba toda la lógica del sistema.

## Qué hace un service

La capa service suele encargarse de la lógica de negocio o, según el caso, de la lógica de aplicación.

Eso incluye cosas como:

- aplicar reglas
- coordinar pasos
- decidir flujos
- validar condiciones del dominio
- consultar uno o más repositorios
- lanzar excepciones de negocio
- orquestar operaciones

Podés pensarlo así:

> el service responde a la pregunta “qué tiene que hacer el sistema en este caso”.

No debería preocuparse por detalles HTTP como `@GetMapping`, `ResponseEntity`, códigos de estado o cosas propias del controlador.

## Qué hace un repository

El repository representa la capa de acceso a datos.

Su trabajo suele ser:

- buscar datos
- guardar datos
- actualizar datos
- eliminar datos
- encapsular la interacción con la base o mecanismo de persistencia

En una etapa inicial, incluso puede ser un repositorio en memoria, solo para entender la separación de responsabilidades antes de entrar a JPA o a bases reales.

La idea clave es esta:

> el repository se enfoca en persistencia, no en reglas de negocio ni en HTTP.

## Una primera forma de visualizarlo

Podés imaginarlo así:

```text
HTTP Request
   ↓
Controller
   ↓
Service
   ↓
Repository
   ↓
Datos
```

Y luego el resultado vuelve:

```text
Datos
   ↑
Repository
   ↑
Service
   ↑
Controller
   ↑
HTTP Response
```

Ese flujo es una base muy útil para pensar aplicaciones Spring Boot.

## Un ejemplo sin capas bien separadas

Supongamos este controlador:

```java
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @GetMapping("/{id}")
    public ResponseEntity<String> obtener(@PathVariable Long id) {
        if (id <= 0) {
            return ResponseEntity.badRequest().body("Id inválido");
        }

        if (id.equals(999L)) {
            return ResponseEntity.notFound().build();
        }

        String usuario = "Usuario " + id;
        return ResponseEntity.ok(usuario);
    }
}
```

Este ejemplo es pequeño, así que todavía parece tolerable.

Pero ya se ve que el controlador está haciendo varias cosas:

- interpreta el request
- decide validaciones de negocio simples
- resuelve si existe o no existe
- construye la respuesta final

En un caso más grande, eso se empieza a poner feo muy rápido.

## El mismo ejemplo separado por capas

### Repository

```java
import org.springframework.stereotype.Repository;

@Repository
public class UsuarioRepository {

    public String buscarNombrePorId(Long id) {
        if (id.equals(999L)) {
            return null;
        }

        return "Usuario " + id;
    }
}
```

### Service

```java
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public String obtenerNombre(Long id) {
        if (id <= 0) {
            throw new IllegalArgumentException("El id debe ser positivo");
        }

        String nombre = usuarioRepository.buscarNombrePorId(id);

        if (nombre == null) {
            throw new UsuarioNoEncontradoException("No existe un usuario con id " + id);
        }

        return nombre;
    }
}
```

### Controller

```java
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<String> obtener(@PathVariable Long id) {
        String nombre = usuarioService.obtenerNombre(id);
        return ResponseEntity.ok(nombre);
    }
}
```

Ahora el reparto de responsabilidades es mucho más claro.

## Cómo leer este ejemplo

### El controller
- recibe el id
- delega
- devuelve la respuesta

### El service
- decide si el id tiene sentido
- consulta el repositorio
- decide si el usuario existe o no
- lanza una excepción de negocio si corresponde

### El repository
- sabe cómo buscar el dato

Esta separación ya se siente bastante mejor.

## Por qué esto mejora tanto la legibilidad

Porque ya no necesitás leer toda la lógica mezclada para entender qué hace cada parte.

Cada clase tiene un foco más claro.

Eso hace que el proyecto sea más fácil de:

- leer
- modificar
- testear
- extender
- discutir en equipo

## Qué no debería hacer un controller

Esta pregunta es muy importante.

Un controller no debería convertirse en un lugar donde se mezclan demasiadas cosas como:

- reglas de negocio pesadas
- acceso directo a base de datos
- algoritmos complejos
- construcción manual de entidades de persistencia
- demasiadas decisiones de dominio

Su rol debería estar mucho más cerca de la capa web.

## Señales de que el controller está absorbiendo demasiado

Por ejemplo, si un controller:

- tiene métodos muy largos
- inyecta demasiadas dependencias raras
- accede directo al repositorio
- toma decisiones de negocio complejas
- tiene muchos ifs de reglas del dominio
- repite lógica parecida en varios endpoints

entonces probablemente esté cargando responsabilidades que deberían ir en otro lugar.

## Qué no debería hacer un repository

Un repository no debería encargarse de reglas de negocio.

Por ejemplo, no debería decidir cosas como:

- si un pedido puede confirmarse
- si un usuario puede borrarse
- si una orden entra en conflicto
- si cierta transición de estado está permitida

Esas decisiones suelen pertenecer a la lógica de negocio.

El repository está mucho más cerca del “guardar, buscar, borrar, consultar”.

## Qué no debería hacer un service

El service tampoco debería contaminarse con demasiados detalles HTTP.

Por ejemplo, esto sería una mala señal:

```java
@Service
public class UsuarioService {

    public ResponseEntity<?> obtenerUsuario(Long id) {
        if (id.equals(999L)) {
            return ResponseEntity.status(404).body("No encontrado");
        }

        return ResponseEntity.ok("Usuario");
    }
}
```

¿Por qué está mal conceptualmente?

Porque el service ya está hablando el lenguaje del controlador.

Lo más sano suele ser que el service trabaje con:

- objetos del dominio
- DTOs internos si corresponde
- excepciones de negocio
- decisiones de aplicación

Y que el controller o el manejo global de errores traduzcan eso a HTTP.

## ¿Siempre el service contiene “la lógica de negocio pura”?

A veces sí, a veces no exactamente.

En proyectos reales, el service muchas veces mezcla:

- coordinación de flujos
- lógica de aplicación
- reglas simples del dominio
- llamadas a repositorios
- integración con otros componentes

No hace falta ponerse dogmático demasiado pronto.

Lo importante al empezar es esta idea:

> el service es un mejor lugar que el controller para alojar decisiones de comportamiento del sistema.

## Qué se gana con repositories explícitos aunque sean simples

Incluso si tu repositorio inicial es apenas una clase que simula datos en memoria, igual sirve mucho para entrenar la separación de capas.

Por ejemplo:

```java
@Repository
public class ProductoRepository {

    public String buscarPorId(Long id) {
        if (id.equals(1L)) {
            return "Notebook";
        }
        return null;
    }
}
```

Aunque sea simple, ya estás reforzando una idea importante:

- el acceso a datos tiene un lugar propio
- no vive mezclado con la capa web

## Un ejemplo CRUD muy básico por capas

### DTO request

```java
public class CrearCategoriaRequest {

    private String nombre;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}
```

### Repository

```java
import org.springframework.stereotype.Repository;

@Repository
public class CategoriaRepository {

    public boolean existePorNombre(String nombre) {
        return "Electrónica".equalsIgnoreCase(nombre);
    }

    public String guardar(String nombre) {
        return nombre;
    }
}
```

### Service

```java
import org.springframework.stereotype.Service;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    public String crearCategoria(CrearCategoriaRequest request) {
        if (categoriaRepository.existePorNombre(request.getNombre())) {
            throw new CategoriaDuplicadaException("Ya existe una categoría con ese nombre");
        }

        return categoriaRepository.guardar(request.getNombre());
    }
}
```

### Controller

```java
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @PostMapping
    public ResponseEntity<String> crear(@RequestBody CrearCategoriaRequest request) {
        String nombre = categoriaService.crearCategoria(request);
        return ResponseEntity.status(201).body("Categoría creada: " + nombre);
    }
}
```

Este ejemplo ya deja bastante claro cómo se reparte el trabajo.

## Cómo ayuda esto al testing

La separación por capas también mejora muchísimo los tests.

Por ejemplo:

- el controller puede testearse como capa web
- el service puede testearse aislando reglas de negocio
- el repository puede testearse según la persistencia usada

Si todo está mezclado, testear con foco se vuelve más incómodo.

Cuando cada parte tiene una responsabilidad más clara, también se vuelve más testeable.

## Qué relación tiene esto con los DTOs

Muy fuerte.

A medida que la arquitectura madura, suele ser natural que:

- el controller reciba DTOs de entrada
- el service trabaje con modelos más orientados al caso de uso
- el repository persista entidades o estructuras de datos

No significa que siempre haya una transformación enorme entre todo, pero sí que cada capa empieza a relacionarse con objetos acordes a su rol.

## Controller-service-repository no significa “tres clases sí o sí por cada mínima cosa”

Esto también es importante.

No se trata de crear capas por burocracia vacía.

Si un caso es diminuto, no hace falta complejizarlo artificialmente.

La idea no es fabricar estructura inútil.
La idea es tener una arquitectura que te ayude cuando el sistema realmente empieza a crecer.

Aun así, para aprender, practicar esta separación suele ser muy valioso porque te entrena desde temprano en una organización más limpia.

## Una buena pregunta para ubicar una responsabilidad

Podés guiarte con preguntas como estas:

### ¿Esto habla de HTTP?
Probablemente pertenece al controller.

### ¿Esto decide comportamiento del sistema o reglas del caso?
Probablemente pertenece al service.

### ¿Esto busca o guarda datos?
Probablemente pertenece al repository.

No siempre la frontera es perfecta, pero como brújula inicial ayuda muchísimo.

## Qué pasa si el controller llama directo al repository

A veces, en ejemplos muy simples, se ve algo así:

```java
@GetMapping("/{id}")
public ResponseEntity<String> obtener(@PathVariable Long id) {
    String nombre = usuarioRepository.buscarNombrePorId(id);
    return ResponseEntity.ok(nombre);
}
```

Esto puede funcionar, pero te salteás la capa service.

El problema es que cuando después aparecen reglas, validaciones de dominio, coordinación de pasos o integraciones, no tenés un lugar claro para ponerlas.

Por eso suele ser más sano acostumbrarse a pasar por el service, aunque al principio parezca una capa “intermedia”.

## Qué pasa si el repository empieza a tomar decisiones del negocio

Por ejemplo:

```java
@Repository
public class PedidoRepository {

    public boolean puedeConfirmarse(Long pedidoId) {
        ...
    }
}
```

Eso puede empezar a oler mal, porque el repository ya no solo accede a datos.
También está asumiendo reglas del dominio.

Esas decisiones suelen vivir mejor en el service o en una capa de dominio más rica, según el estilo de arquitectura.

## Un principio útil: cada capa debería saber menos de lo que no le corresponde

Por ejemplo:

- el controller no debería saber demasiado de persistencia
- el repository no debería saber de HTTP
- el service no debería depender de detalles de request/response si no hace falta

Esa reducción de conocimiento cruzado suele mejorar mucho el acoplamiento del sistema.

## Qué pasa con servicios demasiado grandes

También puede ocurrir el error inverso.

A veces el service se vuelve un “superobjeto” que hace absolutamente todo.

Aunque sigue siendo mejor que ponerlo todo en el controller, tampoco es ideal.

Más adelante vas a ver que cuando la aplicación crece, puede hacer falta refinar aún más la organización interna:

- servicios por caso de uso
- servicios de dominio
- componentes auxiliares
- mappers
- adaptadores
- etc.

Pero controller-service-repository sigue siendo una base muy buena para empezar con orden.

## Un mapa mental muy sano

Podés pensar así:

### Controller
Recibe el request y devuelve la response.

### Service
Decide qué hacer.

### Repository
Lee o guarda datos.

Esa simplificación no cubre toda la complejidad del mundo, pero es una base excelente para orientarte.

## Error común: usar el controller como cerebro del sistema

Ya lo vimos varias veces, pero acá se vuelve central.

Un controller con demasiada lógica termina siendo frágil y difícil de mantener.

## Error común: usar el repository como si fuera “service + data access”

Si el repository empieza a decidir reglas, ya no está claro qué responsabilidad tiene.

Eso complica mucho la arquitectura.

## Error común: hacer que el service devuelva ResponseEntity

Esto acopla innecesariamente la lógica del sistema a HTTP.

Es una señal bastante clara de que la frontera entre capas está mezclándose.

## Error común: inventar capas sin sentido solo por dogma

También puede pasar lo contrario: gente que crea demasiadas clases vacías solo porque “tiene que haber capas”.

La separación por capas no es un ritual burocrático.
Tiene sentido cuando ayuda a repartir responsabilidades de forma útil.

## Error común: no revisar si una lógica pertenece realmente al dominio o a la web

Por ejemplo:

- parsear query params → web
- decidir si un pedido puede cancelarse → negocio
- buscar por id en base → datos

Entender bien estas fronteras mejora mucho el diseño.

## Relación con Spring Boot

Spring Boot hace muy fácil construir esta arquitectura porque sus anotaciones encajan naturalmente con ella:

- `@RestController`
- `@Service`
- `@Repository`

No son solo decorativas.
Ayudan a expresar la intención de cada capa y a integrarlas dentro del contenedor.

Eso hace que la arquitectura por capas sea muy natural de implementar.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> separar controller, service y repository ayuda a repartir mejor las responsabilidades entre la capa web, la lógica del sistema y el acceso a datos, haciendo que una aplicación Spring Boot sea mucho más clara, mantenible y testeable a medida que crece.

## Resumen

- Controller, service y repository representan capas con responsabilidades distintas.
- El controller se enfoca en HTTP.
- El service se enfoca en lógica de negocio o de aplicación.
- El repository se enfoca en acceso a datos.
- Separar estas capas reduce mezcla de responsabilidades y mejora la mantenibilidad.
- También hace más fácil testear el sistema por partes.
- Es una arquitectura muy útil y todavía muy vigente para aprender y construir APIs con Spring Boot.

## Próximo tema

En el próximo tema vas a ver cuándo conviene usar DTOs, entidades y mappers, y eso te va a ayudar a no mezclar la capa web, la capa de negocio y la capa de persistencia como si todas trabajaran con exactamente los mismos objetos.
