---
title: "Cómo crear métodos como findByEmail, findByTitulo o existsByNombre sin escribir queries a mano"
description: "Entender cómo funcionan las consultas derivadas por nombre en Spring Data JPA y por qué permiten resolver muchísimos casos comunes sin necesidad de escribir SQL o JPQL manualmente."
order: 42
module: "Persistencia con Spring Data JPA"
level: "base"
draft: false
---

En el tema anterior viste cómo `JpaRepository` te da una base muy poderosa para operaciones comunes como:

- guardar
- buscar por id
- listar
- eliminar
- contar
- verificar existencia

Eso ya te permite hacer muchísimo.

Pero muy pronto aparece una necesidad más específica.

Por ejemplo:

- buscar un usuario por email
- verificar si ya existe una categoría con cierto nombre
- traer productos activos
- buscar un pedido por número
- recuperar una lista por estado
- combinar algunos criterios simples de consulta

La pregunta entonces es:

> ¿hace falta escribir una query manual cada vez que quiero buscar por un campo?

En muchísimos casos, no.

Spring Data JPA ofrece una característica muy potente y muy cómoda: las **consultas derivadas por nombre de método**.

Es una de esas funcionalidades que, cuando la entendés bien, te ahorra muchísimo código repetitivo.

## Qué problema resuelven las consultas derivadas

Supongamos que tenés esta entidad:

```java
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
public class Usuario {

    @Id
    @GeneratedValue
    private Long id;

    private String nombre;
    private String email;
    private boolean activo;

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }
}
```

Ahora querés hacer algo muy común:

- buscar un usuario por email

Sin Spring Data JPA, podrías imaginarte escribiendo una query manual o implementando un método con bastante infraestructura.

Pero con Spring Data JPA, para muchísimos casos simples, basta con declarar el método en el repository.

## La idea general

La idea es esta:

> escribís un método con un nombre que siga ciertas convenciones, y Spring Data JPA interpreta ese nombre para construir la consulta correspondiente.

Por ejemplo:

```java
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);
}
```

Y listo.

No implementaste el método manualmente.
No escribiste SQL.
No escribiste JPQL.
No creaste una clase concreta del repository.

Spring Data JPA puede derivar la consulta a partir del nombre.

## Cómo leer `findByEmail`

Podés leerlo así:

- `find` → quiero recuperar algo
- `By` → a partir del siguiente criterio
- `Email` → el campo sobre el que quiero buscar

O sea:

> buscá un `Usuario` por su `email`.

Es muy directo y muy expresivo.

## Qué devuelve este método

En este caso:

```java
Optional<Usuario> findByEmail(String email);
```

el método devuelve un `Optional<Usuario>`.

Eso tiene mucho sentido, porque quizá exista un usuario con ese email y quizá no.

El `Optional` hace visible esa incertidumbre.

## Un ejemplo típico de uso

```java
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Usuario obtenerPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsuarioNoEncontradoException("No existe un usuario con email " + email));
    }
}
```

Este flujo ya se parece muchísimo a algo real.

## Otro caso muy típico: `existsBy...`

A veces no querés traer la entidad completa.
Solo querés saber si existe.

Por ejemplo:

```java
boolean existsByEmail(String email);
```

Repository completo:

```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    boolean existsByEmail(String email);
}
```

Esto es muy útil en casos como:

- validar unicidad
- prevenir duplicados
- chequear referencias
- decidir si una operación puede continuar

## Un ejemplo con `existsByEmail`

```java
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public void registrar(String email) {
        if (usuarioRepository.existsByEmail(email)) {
            throw new EmailDuplicadoException("Ya existe un usuario con ese email");
        }

        // seguir con la creación
    }
}
```

Este patrón es extremadamente común.

## Otro caso típico: `findByNombre`

Supongamos esta entidad:

```java
@Entity
public class Categoria {

    @Id
    @GeneratedValue
    private Long id;

    private String nombre;
    private boolean activa;

    // getters y setters
}
```

Podrías tener un repository así:

```java
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    Optional<Categoria> findByNombre(String nombre);
}
```

Y otra variante muy común:

```java
boolean existsByNombre(String nombre);
```

Esto muestra que el patrón no se limita a email.
Se aplica muy bien a muchos campos simples del modelo.

## Qué tipos de prefijos son comunes

Al empezar, los más importantes suelen ser:

- `findBy`
- `existsBy`
- `countBy`
- `deleteBy`

No hace falta aprender todos los posibles del universo ahora.
Con dominar bien estos ya ganás muchísimo.

## Qué hace `countBy...`

Permite contar cuántos registros cumplen cierta condición.

Por ejemplo:

```java
long countByActivo(boolean activo);
```

Esto podría servir para cosas como:

- contar usuarios activos
- contar productos visibles
- contar pedidos por estado
- estadísticas simples

## Qué hace `deleteBy...`

También pueden declararse métodos de borrado por criterio.

Por ejemplo:

```java
void deleteByEmail(String email);
```

O variantes más sofisticadas.

De todos modos, al empezar conviene usarlos con criterio y claridad.
Muchísimas veces primero vas a buscar el recurso, aplicar reglas y recién después borrarlo.

Así que aunque `deleteBy...` exista, no siempre será la mejor opción desde el punto de vista del flujo de negocio.

## Un caso muy clásico: buscar por estado

Supongamos esta entidad:

```java
@Entity
public class Pedido {

    @Id
    @GeneratedValue
    private Long id;

    private String numero;
    private String estado;

    // getters y setters
}
```

Podrías declarar:

```java
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    List<Pedido> findByEstado(String estado);
}
```

Esto devuelve una lista porque tiene sentido que haya muchos pedidos con el mismo estado.

## Elegir bien el tipo de retorno también importa

No todos los métodos derivados deberían devolver lo mismo.

Por ejemplo:

### Caso que suele ser único
```java
Optional<Usuario> findByEmail(String email);
```

### Caso que puede devolver muchos
```java
List<Pedido> findByEstado(String estado);
```

### Caso donde solo te interesa saber si existe
```java
boolean existsByNombre(String nombre);
```

### Caso donde querés contar
```java
long countByActivo(boolean activo);
```

El nombre del método importa, pero también importa elegir un tipo de retorno coherente con el caso.

## Un patrón muy útil: combinar criterios simples

Spring Data JPA también puede interpretar nombres que combinan más de un campo.

Por ejemplo:

```java
List<Producto> findByActivoAndStockGreaterThan(boolean activo, int stock);
```

Aunque todavía no hace falta que te pongas a memorizar variantes más sofisticadas, este ejemplo sirve para ver que la idea puede crecer bastante.

Podés leerlo así:

- buscar productos
- donde `activo` sea tal valor
- y donde `stock` sea mayor que cierto número

Es bastante impresionante lo lejos que puede llegar esta convención en escenarios comunes.

## Otro ejemplo combinado

```java
Optional<Usuario> findByEmailAndActivo(String email, boolean activo);
```

Esto podría interpretarse como:

> buscá un usuario por email y además exigí cierto valor de activo.

Este tipo de combinaciones pueden ser muy útiles cuando el criterio ya no depende de un solo campo.

## Por qué esto resulta tan cómodo

Porque para una gran cantidad de consultas habituales, no necesitás saltar inmediatamente a una query manual.

Y eso reduce muchísimo:

- boilerplate
- repetición
- ruido
- clases innecesarias
- complejidad temprana

Es una de las razones por las que Spring Data JPA se siente tan productivo.

## Cómo sabe Spring qué campo estás nombrando

La derivación funciona a partir de los nombres de las propiedades de la entidad.

Por ejemplo, si la entidad tiene:

```java
private String email;
```

entonces un método como:

```java
findByEmail(String email)
```

tiene sentido.

Si la entidad tiene:

```java
private boolean activo;
```

entonces algo como:

```java
findByActivo(boolean activo)
```

también lo tiene.

Por eso es tan importante mantener nombres claros y consistentes en las entidades.

## Un ejemplo con booleanos

```java
List<Usuario> findByActivo(boolean activo);
```

Esto puede usarse, por ejemplo, así:

```java
List<Usuario> activos = usuarioRepository.findByActivo(true);
```

Es muy directo y suele leerse muy bien.

## Un ejemplo de service usando un método derivado

```java
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;

    public PedidoService(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    public List<Pedido> listarPendientes() {
        return pedidoRepository.findByEstado("PENDIENTE");
    }
}
```

Esto ya te muestra cómo la capa service puede apoyarse en un repository muy expresivo sin escribir queries manuales.

## Qué relación tiene esto con el diseño del repositorio

Una muy buena práctica es que el repository exprese operaciones de persistencia de forma clara y alineada con el modelo.

Por ejemplo:

- `findByEmail`
- `existsByNombre`
- `findByEstado`
- `countByActivo`

Todos esos nombres comunican bastante bien lo que hacen.

Eso mejora la legibilidad del código incluso antes de mirar la implementación.

## Hasta dónde conviene llegar con nombres derivados

Acá hay una cuestión importante.

Los métodos derivados son geniales, pero no conviene empujarlos hasta el punto de volverlos monstruosos.

Por ejemplo, algo como:

```java
findByNombreAndActivoAndCategoriaAndPrecioGreaterThanAndStockGreaterThan(...)
```

quizá empiece a ser demasiado.

A veces la consulta derivada es perfecta.
Otras veces, cuando el criterio se vuelve muy complejo, conviene pensar en otro enfoque.

Por ahora, lo importante es dominar el caso cómodo y claro.

## Un criterio muy sano

Podés pensar así:

- si la consulta es simple y el nombre sigue siendo legible, la derivación suele ser excelente
- si el nombre empieza a volverse exagerado o difícil de entender, quizá convenga otra estrategia más adelante

Eso te ayuda a usar la herramienta con criterio y no solo por entusiasmo.

## Un ejemplo didáctico más amplio

### Entidad

```java
@Entity
public class Producto {

    @Id
    @GeneratedValue
    private Long id;

    private String titulo;
    private String categoria;
    private boolean activo;
    private int stock;

    // getters y setters
}
```

### Repository

```java
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Optional<Producto> findByTitulo(String titulo);

    boolean existsByTitulo(String titulo);

    List<Producto> findByCategoria(String categoria);

    List<Producto> findByActivo(boolean activo);

    long countByActivo(boolean activo);
}
```

Este repository ya es mucho más rico que el CRUD mínimo y, sin embargo, sigue siendo muy corto y muy expresivo.

## Qué gana el service con esto

Muchísimo.

Puede trabajar con un repository que ya expresa sus operaciones de forma muy cercana al lenguaje del dominio o del caso de uso.

Por ejemplo:

```java
public void crearProducto(CrearProductoRequest request) {
    if (productoRepository.existsByTitulo(request.getTitulo())) {
        throw new ProductoDuplicadoException("Ya existe un producto con ese título");
    }

    // seguir con la creación
}
```

Eso se lee casi como una oración.
Y esa claridad vale mucho.

## Qué pasa si el método está mal nombrado

Como la derivación depende de convenciones y de nombres de propiedades reales de la entidad, si el nombre del método no encaja con un campo o patrón válido, el framework no va a poder interpretarlo correctamente.

Esto es importante porque muestra que no es “magia libre”.
Hay reglas.
Por eso conviene:

- usar nombres claros en la entidad
- escribir métodos consistentes
- mantener coherencia terminológica

## Un detalle importante: el nombre debe reflejar propiedades reales

Si la entidad tiene:

```java
private String email;
```

entonces:

```java
findByEmail(...)
```

tiene sentido.

Pero si escribieras algo como:

```java
findByCorreo(...)
```

sin que la entidad tenga una propiedad llamada `correo`, el framework no podría derivar la consulta como esperás.

Por eso es clave que el nombre del método hable el idioma real de la entidad.

## Qué relación tiene esto con Optional

Ya lo viste un poco antes, pero conviene reforzarlo.

Cuando esperás como máximo un solo resultado, `Optional<T>` suele encajar muy bien.

Por ejemplo:

```java
Optional<Usuario> findByEmail(String email);
```

Esto expresa mejor la posibilidad de ausencia que devolver directamente `null`.

Y además se integra muy bien con excepciones de negocio como:

```java
.orElseThrow(...)
```

## Qué relación tiene esto con listas

Cuando una consulta puede devolver múltiples resultados, `List<T>` suele ser una opción natural.

Por ejemplo:

```java
List<Pedido> findByEstado(String estado);
```

Eso ya comunica bastante bien la naturaleza de la operación.

## Qué relación tiene esto con existsBy y countBy

Estos métodos son especialmente útiles cuando querés evitar traer entidades completas innecesariamente.

Por ejemplo:

- para validación de unicidad → `existsBy...`
- para estadísticas o chequeos → `countBy...`

Eso puede hacer el código más claro y, según el caso, también más eficiente conceptualmente.

## Un ejemplo de uso muy frecuente: unicidad

```java
public void registrarUsuario(RegistroUsuarioRequest request) {
    if (usuarioRepository.existsByEmail(request.getEmail())) {
        throw new EmailDuplicadoException("Ya existe un usuario con ese email");
    }

    // seguir con la creación
}
```

Este patrón aparece una y otra vez en APIs de creación de recursos.

## Otro ejemplo frecuente: lookup por campo natural

```java
public Categoria obtenerPorNombre(String nombre) {
    return categoriaRepository.findByNombre(nombre)
            .orElseThrow(() -> new CategoriaNoEncontradaException("No existe la categoría " + nombre));
}
```

Esto también es muy común cuando el campo de búsqueda no es el id técnico, sino otro dato identificable del dominio.

## Un ejemplo de controller-service-repository completo

### Repository

```java
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);
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

    public Usuario obtenerPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsuarioNoEncontradoException("No existe un usuario con email " + email));
    }

    public void validarEmailDisponible(String email) {
        if (usuarioRepository.existsByEmail(email)) {
            throw new EmailDuplicadoException("Ya existe un usuario con ese email");
        }
    }
}
```

Esto ya se siente muy natural dentro de la arquitectura por capas que vienes construyendo.

## Qué todavía no estás viendo

Aunque las consultas derivadas son muy potentes, todavía no estás entrando en:

- `@Query`
- JPQL
- consultas nativas
- paginación real
- sorting avanzado
- proyecciones
- criterios dinámicos complejos

Y está perfecto que así sea.

Primero conviene dominar esta herramienta porque resuelve una enorme cantidad de casos cotidianos sin complicarte demasiado.

## Un mapa mental muy útil

Podés pensar las consultas derivadas así:

> si el nombre del método se mantiene claro y el criterio de búsqueda es relativamente simple, Spring Data JPA probablemente pueda generar la consulta por vos.

Ese principio ya te sirve muchísimo.

## Error común: saltar demasiado rápido a queries manuales

A veces alguien aprende `@Query` o SQL manual y empieza a usarlo para todo.

Pero para un montón de casos simples, un método derivado es mucho más corto, más legible y más fácil de mantener.

No hace falta complicarse antes de tiempo.

## Error común: hacer nombres interminables

Ya lo mencionamos, pero vale repetirlo.

Si el método empieza a parecer una novela, probablemente estés forzando demasiado esta herramienta.

La claridad del nombre es parte de su valor.
Si esa claridad se pierde, quizá convenga otra estrategia.

## Error común: no alinear nombres del repository con los nombres reales de la entidad

La derivación funciona sobre propiedades reales.
Si el lenguaje del método no coincide con el modelo, la consulta no puede derivarse correctamente.

## Error común: usar findAll y filtrar manualmente en memoria cuando podrías expresar la consulta en el repository

Por ejemplo, hacer esto:

```java
List<Usuario> activos = usuarioRepository.findAll()
        .stream()
        .filter(Usuario::isActivo)
        .toList();
```

cuando podrías simplemente declarar:

```java
List<Usuario> findByActivo(boolean activo);
```

La segunda opción suele ser mucho más clara y más alineada con la responsabilidad del repository.

## Relación con Spring Boot

Spring Boot, junto con Spring Data JPA, hace que estas consultas derivadas sean una de las formas más agradables de trabajar con persistencia básica e intermedia.

Es una mezcla muy buena de:

- productividad
- legibilidad
- convención útil
- poco boilerplate

Y por eso aparece tanto en proyectos reales.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> las consultas derivadas por nombre permiten que un repository de Spring Data JPA exprese búsquedas, verificaciones y conteos muy comunes mediante métodos como `findByEmail`, `findByTitulo` o `existsByNombre`, evitando escribir queries manuales para una enorme cantidad de casos cotidianos.

## Resumen

- Spring Data JPA puede derivar consultas a partir del nombre de ciertos métodos del repository.
- Métodos como `findBy...`, `existsBy...` y `countBy...` son muy comunes.
- Esto funciona cuando el nombre del método refleja propiedades reales de la entidad.
- Es una forma muy cómoda de resolver búsquedas y verificaciones simples.
- `Optional`, `List`, `boolean` y `long` son retornos comunes según el caso.
- Las consultas derivadas reducen muchísimo boilerplate y mejoran la legibilidad.
- Conviene usarlas mientras el criterio siga siendo claro y el nombre no se vuelva exagerado.

## Próximo tema

En el próximo tema vas a ver cuándo conviene dejar de usar solo nombres derivados y pasar a `@Query`, para escribir consultas más complejas cuando el nombre del método ya no alcanza o deja de ser razonablemente legible.
