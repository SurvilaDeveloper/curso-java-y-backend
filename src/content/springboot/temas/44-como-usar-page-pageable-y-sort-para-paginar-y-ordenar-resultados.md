---
title: "Cómo usar Page, Pageable y Sort para paginar y ordenar resultados"
description: "Entender cómo funcionan la paginación y el ordenamiento en Spring Data JPA usando Page, Pageable y Sort, y por qué son claves para construir listados realistas cuando la cantidad de datos crece."
order: 44
module: "Persistencia con Spring Data JPA"
level: "base"
draft: false
---

En los temas anteriores viste cómo:

- modelar entidades con JPA
- usar `JpaRepository`
- crear consultas derivadas por nombre
- pasar a `@Query` cuando el criterio se vuelve más complejo

Eso ya te da una base muy buena para trabajar con persistencia.

Pero aparece rápidamente un problema muy importante en aplicaciones reales:

> ¿qué pasa cuando la base deja de tener 5 o 10 registros y empieza a tener cientos, miles o muchísimos más?

Ahí `findAll()` empieza a quedarse corto como estrategia general.

Porque traer “todo” de una sola vez puede volverse:

- poco eficiente
- difícil de manejar
- incómodo para el cliente
- malo para la UX
- innecesario si el usuario solo está viendo una pequeña parte de la información

Por eso, en aplicaciones reales, los listados suelen necesitar dos cosas básicas:

- **paginación**
- **ordenamiento**

Y en Spring Data JPA esas piezas aparecen muy naturalmente con:

- `Page`
- `Pageable`
- `Sort`

Este tema es clave porque te ayuda a pasar de listados ingenuos a listados más realistas y más escalables.

## El problema de `findAll()`

Supongamos este repository:

```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
}
```

Y este service:

```java
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public List<Producto> listarTodos() {
        return productoRepository.findAll();
    }
}
```

Esto puede estar perfecto para primeros ejemplos, pero tiene límites claros.

Si la tabla crece mucho, `findAll()` trae todo:

- todos los productos
- en una sola llamada
- en una sola lista
- sin recorte
- sin estructura de paginación
- sin metadata de páginas

Eso no suele ser lo más razonable en sistemas reales.

## Qué significa paginar

Paginar significa dividir un conjunto grande de resultados en partes más pequeñas, normalmente llamadas páginas.

Por ejemplo:

- página 0 → primeros 20 resultados
- página 1 → siguientes 20
- página 2 → siguientes 20

La idea es muy simple:

> en vez de traer todo junto, traés solo una porción ordenada del total.

Esto mejora mucho la experiencia y también el comportamiento técnico del sistema.

## Qué significa ordenar

Ordenar significa definir en qué criterio querés ver esos resultados.

Por ejemplo:

- por nombre ascendente
- por precio descendente
- por fecha de creación
- por id
- por stock
- por estado y luego fecha

Porque no alcanza con traer “una página”.
También suele importar **en qué orden** querés que aparezcan los datos.

## Qué es `Pageable`

`Pageable` representa la información necesaria para pedir una página.

Suele incluir cosas como:

- número de página
- tamaño de página
- ordenamiento

Podés pensarlo así:

> `Pageable` es un objeto que describe **cómo** querés paginar una consulta.

## Qué es `Page`

`Page` representa el resultado paginado.

No solo trae la lista de elementos.
También trae metadata muy útil como:

- contenido de la página
- número actual
- tamaño de página
- total de elementos
- total de páginas
- si hay página siguiente
- si hay página anterior

Dicho de forma simple:

> `Page` es mucho más que una lista; es una respuesta paginada rica.

## Qué es `Sort`

`Sort` representa el criterio de ordenamiento.

Por ejemplo:

- ordenar por `titulo`
- ordenar por `precio` descendente
- ordenar por más de un campo

Es una pieza que puede usarse por separado o en combinación con `Pageable`.

## Un primer ejemplo con paginación

Supongamos un repository así:

```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
}
```

Como `JpaRepository` ya extiende capacidades de paginación, podés hacer cosas como:

```java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public Page<Producto> listarPaginado() {
        return productoRepository.findAll(PageRequest.of(0, 10));
    }
}
```

Acá estás diciendo:

- traeme la página 0
- con tamaño 10

Es decir: los primeros 10 resultados.

## Qué es `PageRequest`

`PageRequest` es una implementación muy usada de `Pageable`.

Te permite construir un `Pageable` fácilmente.

Por ejemplo:

```java
PageRequest.of(0, 10)
```

significa:

- página número 0
- tamaño de página 10

En Spring Data JPA, la paginación normalmente empieza en cero.

Esto es importante:

- página 0 → primera página
- página 1 → segunda página
- página 2 → tercera página

## Cómo leer un Page

Supongamos:

```java
Page<Producto> page = productoRepository.findAll(PageRequest.of(0, 10));
```

Desde ahí podrías obtener:

- el contenido:
```java
page.getContent()
```

- el total de elementos:
```java
page.getTotalElements()
```

- el total de páginas:
```java
page.getTotalPages()
```

- si hay una página siguiente:
```java
page.hasNext()
```

- si hay una anterior:
```java
page.hasPrevious()
```

Esto muestra por qué `Page` es mucho más útil que una lista simple cuando trabajás con paginación.

## Un ejemplo más completo en el service

```java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public Page<Producto> listarPaginado(int pagina, int tamanio) {
        return productoRepository.findAll(PageRequest.of(pagina, tamanio));
    }
}
```

Esto ya te permite pedir distintas páginas de forma dinámica.

## Qué gana el cliente con esto

Muchísimo.

Por ejemplo, un frontend puede:

- pedir la página 0 con 20 productos
- mostrar esos 20
- pedir la página siguiente cuando el usuario navega
- mostrar cuántas páginas hay
- saber si debe habilitar el botón “siguiente”

Esto se acerca mucho más a cómo funcionan los listados reales.

## Paginación y escalabilidad

No hace falta exagerar: paginar no resuelve mágicamente todos los problemas del mundo.

Pero sí ayuda muchísimo a evitar uno muy básico y frecuente:

- traer volúmenes innecesarios de datos
- cargar de más al backend
- cargar de más al cliente
- trabajar con respuestas enormes sin necesidad

Por eso la paginación se vuelve tan importante apenas los datos dejan de ser triviales.

## Cómo agregar ordenamiento

Además del tamaño y el número de página, muchas veces querés indicar un orden.

Por ejemplo:

```java
PageRequest.of(0, 10, Sort.by("titulo"))
```

Esto significa:

- página 0
- tamaño 10
- ordenado por `titulo`

Es una mejora muy natural sobre la paginación básica.

## Un ejemplo con orden ascendente y descendente

Por defecto, `Sort.by("titulo")` suele representar orden ascendente.

Pero también podés explicitar dirección:

```java
PageRequest.of(0, 10, Sort.by(Sort.Direction.ASC, "titulo"))
```

o:

```java
PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "precio"))
```

Esto ya permite construir listados bastante más realistas.

## Un ejemplo con paginación y orden

```java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public Page<Producto> listarPaginadoOrdenado(int pagina, int tamanio) {
        return productoRepository.findAll(
                PageRequest.of(pagina, tamanio, Sort.by(Sort.Direction.ASC, "titulo"))
        );
    }
}
```

Acá ya estás combinando:

- página
- tamaño
- ordenamiento

Esta tríada aparece muchísimo en APIs de listados.

## Qué pasa con más de un criterio de orden

También podés ordenar por más de un campo.

Por ejemplo:

```java
Sort sort = Sort.by("categoria").ascending()
        .and(Sort.by("titulo").ascending());
```

Y luego:

```java
PageRequest.of(0, 10, sort)
```

Esto puede ser útil cuando querés un orden más rico, por ejemplo:

- primero por categoría
- luego por título

## Un ejemplo práctico de uso

Supongamos una tabla de productos.

El frontend puede querer:

- página 0
- tamaño 20
- orden por precio descendente

Entonces el service podría hacer algo así:

```java
public Page<Producto> listarPorPrecioDesc(int pagina, int tamanio) {
    return productoRepository.findAll(
            PageRequest.of(pagina, tamanio, Sort.by(Sort.Direction.DESC, "precio"))
    );
}
```

Eso ya se parece bastante a un listado real de e-commerce, catálogo o panel admin.

## Un paso más: aceptar `Pageable` directamente

En lugar de construir siempre el `PageRequest` dentro del service, a veces también puede ser útil recibir un `Pageable` ya armado.

Por ejemplo:

```java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public Page<Producto> listar(Pageable pageable) {
        return productoRepository.findAll(pageable);
    }
}
```

Esto es muy interesante porque permite que otra capa decida cómo se construye la paginación.

## Un controlador usando `Pageable`

En Spring Web, incluso podés recibir un `Pageable` directamente como parámetro del endpoint.

Ejemplo conceptual:

```java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public Page<Producto> listar(Pageable pageable) {
        return productoService.listar(pageable);
    }
}
```

Esto hace que el endpoint pueda recibir información de paginación desde la request.

Más adelante podés profundizar mucho más en cómo se configura eso del lado web, pero ya desde ahora conviene saber que Spring integra muy bien estas piezas.

## Qué forma de request suele acompañar esto

Cuando el endpoint acepta `Pageable`, suelen aparecer parámetros como:

- `page`
- `size`
- `sort`

Por ejemplo, conceptualmente:

```text
GET /productos?page=0&size=10&sort=titulo,asc
```

Esto es muy potente, porque permite paginar y ordenar desde la request sin tener que inventar mucho código manual.

## Qué devuelve Page además del contenido

Este punto vale oro.

Supongamos:

```java
Page<Producto> page = productoRepository.findAll(PageRequest.of(0, 10));
```

Podés preguntar cosas como:

```java
page.getContent();
page.getNumber();
page.getSize();
page.getTotalElements();
page.getTotalPages();
page.hasNext();
page.hasPrevious();
```

Eso le da muchísima información útil al cliente o a la capa de presentación.

## Un ejemplo de uso en un service

```java
public Page<Producto> listarActivos(int pagina, int tamanio) {
    return productoRepository.findByActivo(
            true,
            PageRequest.of(pagina, tamanio, Sort.by("titulo").ascending())
    );
}
```

Para que esto funcione, el repository podría declarar:

```java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Page<Producto> findByActivo(boolean activo, Pageable pageable);
}
```

Esto muestra algo muy importante:

las consultas derivadas también pueden combinarse con paginación.

## Qué significa esto para el diseño del repository

Muchísimo.

Ya no estás limitado a:

- `findByActivo(boolean activo)`

Ahora también podés pensar en:

- `findByActivo(boolean activo, Pageable pageable)`

Eso hace que los repositories se vuelvan mucho más útiles para listados reales.

## Otro ejemplo con query derivada paginada

```java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    Page<Pedido> findByEstado(String estado, Pageable pageable);
}
```

Esto permite pedir, por ejemplo:

- pedidos pendientes
- paginados
- ordenados
- sin traerlos todos de golpe

Es una combinación muy natural y muy potente.

## También se puede combinar con `@Query`

No estás limitado a `findAll(Pageable)` o a derivación simple.

También puede pasar algo así:

```java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    @Query("select p from Producto p where p.activo = true")
    Page<Producto> buscarActivos(Pageable pageable);
}
```

Esto muestra que paginación y query explícita también pueden convivir perfectamente.

## Cuándo conviene devolver `Page` y cuándo `List`

Esta es una buena pregunta.

### `List`
Sirve bien cuando:
- el volumen es chico
- no hace falta metadata de paginación
- la consulta no está pensada como listado paginado

### `Page`
Sirve mejor cuando:
- querés paginar
- necesitás total de elementos o total de páginas
- querés exponer navegación de páginas
- la consulta se parece a un listado real de producción

En APIs que van creciendo, `Page` suele volverse muy valiosa.

## Un detalle importante: no siempre querés exponer Page tal cual

Aunque `Page` es muy útil, más adelante vas a ver que a veces conviene mapear su contenido a DTOs o envolverlo en estructuras de respuesta más controladas.

Por ahora está bien usarlo para entender la mecánica.

Pero conviene saber desde ya que el tema puede evolucionar bastante.

## Un ejemplo de controller con página

```java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public Page<UsuarioResponse> listar(Pageable pageable) {
        return usuarioService.listar(pageable);
    }
}
```

Y el service:

```java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;

    public UsuarioService(UsuarioRepository usuarioRepository, UsuarioMapper usuarioMapper) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioMapper = usuarioMapper;
    }

    public Page<UsuarioResponse> listar(Pageable pageable) {
        return usuarioRepository.findAll(pageable)
                .map(usuarioMapper::toResponse);
    }
}
```

Este ejemplo ya muestra algo muy fuerte:
podés paginar entidades y mapear esa página a DTOs de respuesta.

## Qué hace `.map(...)` sobre `Page`

Esto es muy útil.

Si tenés una `Page<Usuario>`, podés transformarla en `Page<UsuarioResponse>` sin perder la metadata paginada.

Por ejemplo:

```java
page.map(usuarioMapper::toResponse)
```

Eso te permite mantener:

- total de páginas
- total de elementos
- número de página
- etc.

mientras transformás el contenido.

Es una característica muy valiosa.

## Qué relación tiene esto con UX y frontend

Muy directa.

Un frontend suele necesitar cosas como:

- saber cuántos elementos hay
- saber cuántas páginas existen
- saber si puede ir a la siguiente
- cambiar el orden
- pedir solo una parte de la información

La paginación y el ordenamiento hacen que la API se vuelva mucho más amigable para interfaces reales.

## Qué relación tiene esto con performance

También muy importante.

Traer todo indiscriminadamente puede impactar en:

- memoria
- red
- tiempo de respuesta
- experiencia del cliente
- carga sobre base de datos

No se trata de asustarse con “performance” demasiado pronto, pero sí de adoptar desde temprano patrones más razonables para listados que pueden crecer.

## Una buena heurística

Podés pensar así:

- si el conjunto es pequeño y controlado, un `List` simple puede alcanzar
- si el listado puede crecer o se parece a una pantalla real de producción, probablemente convenga paginar
- si además el usuario o sistema necesita criterio de orden, `Sort` se vuelve muy natural

## Error común: usar `findAll()` para todo

Es uno de los errores más comunes cuando todavía no se incorporó bien la idea de paginación.

`findAll()` está buenísimo para ejemplos iniciales o tablas pequeñas, pero no debería convertirse en la respuesta automática a todos los listados del sistema.

## Error común: paginar pero sin criterio de orden claro

Si no definís orden, el resultado puede no ser tan consistente o tan claro para el consumo.

No significa que siempre sea obligatorio explicitarlo manualmente, pero sí conviene pensar qué orden tiene sentido para cada listado.

## Error común: hacer paginación en memoria después de traer todo

Por ejemplo, hacer:

- `findAll()`
- traer miles de elementos
- y recién después cortar la lista en Java

Eso suele ser una mala idea cuando ya tenés herramientas como `Pageable` y `Page` que permiten que la paginación se exprese a nivel de consulta.

## Error común: exponer entidades directamente solo porque `Page` lo hace fácil

Como ya viste en temas anteriores, conviene separar entidades y DTOs.

Que la paginación sea sencilla no significa que debas devolver automáticamente la entidad JPA tal cual.

## Error común: pensar que `Sort` es solo “un detalle”

El criterio de orden muchas veces forma parte importante del contrato del endpoint.

No es lo mismo:

- últimos pedidos primero
- productos por precio ascendente
- usuarios por nombre
- categorías por id

Definir bien el orden puede cambiar mucho la utilidad del listado.

## Relación con Spring Boot

Spring Boot y Spring Data JPA hacen que la paginación y el ordenamiento estén muy integrados en todo el stack:

- repositories
- queries derivadas
- `@Query`
- controladores web
- tipos como `Page` y `Pageable`

Eso hace que pasar de un CRUD básico a listados realistas sea mucho más natural de lo que sería si tuvieras que montar toda esa infraestructura a mano.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> `Page`, `Pageable` y `Sort` permiten que una aplicación Spring Data JPA deje de traer listados completos de forma ingenua y empiece a trabajar con porciones ordenadas de resultados, algo muchísimo más realista, escalable y útil para APIs y frontends que manejan volúmenes crecientes de datos.

## Resumen

- `Pageable` describe cómo pedir una página.
- `Page` representa el resultado paginado junto con metadata útil.
- `Sort` permite definir el criterio de ordenamiento.
- `PageRequest.of(...)` es una forma muy común de construir un `Pageable`.
- La paginación puede combinarse con `findAll`, con consultas derivadas y con `@Query`.
- `Page` puede mapearse a DTOs sin perder la metadata.
- Esta herramienta es clave para construir listados más realistas y evitar `findAll()` gigantes.

## Próximo tema

En el próximo tema vas a ver cómo funcionan las relaciones entre entidades con `@ManyToOne` y `@OneToMany`, y ahí empieza el bloque donde JPA deja de trabajar solo con entidades aisladas para modelar vínculos reales entre objetos persistentes.
