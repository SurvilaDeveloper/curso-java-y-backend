---
title: "Cuándo conviene usar @Query y dejar de depender solo de nombres derivados"
description: "Entender en qué casos las consultas derivadas por nombre dejan de ser suficientes y cómo usar @Query para escribir consultas más claras o más complejas dentro de un repository Spring Data JPA."
order: 43
module: "Persistencia con Spring Data JPA"
level: "base"
draft: false
---

En el tema anterior viste una de las comodidades más lindas de Spring Data JPA: poder declarar métodos como:

- `findByEmail`
- `findByTitulo`
- `existsByNombre`
- `findByEstado`

sin escribir la query manualmente.

Esa funcionalidad es excelente y resuelve una enorme cantidad de casos cotidianos.

Pero también llega un momento en el que aparece una pregunta muy importante:

> ¿qué pasa cuando el nombre del método empieza a quedarse corto, a volverse demasiado largo o directamente deja de ser la mejor forma de expresar la consulta?

Ahí entra `@Query`.

Este tema es importante porque te ayuda a dar un paso de madurez dentro de la capa de persistencia:

- aprovechar consultas derivadas cuando son claras
- pero saber pasar a una query explícita cuando el caso ya lo pide

La idea no es abandonar los nombres derivados.
La idea es aprender **cuándo conviene dejar de forzarlos**.

## El valor de las consultas derivadas

Conviene empezar reconociendo algo importante: las consultas derivadas son muy buenas.

Por ejemplo:

```java
Optional<Usuario> findByEmail(String email);
```

o:

```java
boolean existsByNombre(String nombre);
```

o:

```java
List<Pedido> findByEstado(String estado);
```

Estos métodos tienen varias virtudes:

- son cortos
- se entienden rápido
- no requieren query manual
- reducen boilerplate
- suelen ser muy legibles

Por eso no hay que dejar de usarlas por moda ni por complejizar antes de tiempo.

## El problema aparece cuando el nombre empieza a forzarse

Imaginá una entidad así:

```java
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
public class Producto {

    @Id
    @GeneratedValue
    private Long id;

    private String titulo;
    private String categoria;
    private boolean activo;
    private double precio;
    private int stock;

    public Long getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    public double getPrecio() {
        return precio;
    }

    public void setPrecio(double precio) {
        this.precio = precio;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }
}
```

Ahora querés una consulta que haga algo como:

- traer productos activos
- de una categoría dada
- con precio mayor que cierto mínimo
- ordenados por precio

Podrías intentar algo como:

```java
List<Producto> findByActivoAndCategoriaAndPrecioGreaterThanOrderByPrecioAsc(
    boolean activo,
    String categoria,
    double precio
);
```

Y sí, Spring Data JPA puede interpretar bastantes cosas de este estilo.

Pero ya empieza a sentirse un poco pesado.

La pregunta entonces es:

> ¿el nombre sigue siendo una buena forma de comunicar la consulta o ya conviene escribirla explícitamente?

## La idea general de `@Query`

`@Query` te permite escribir la consulta de forma explícita sobre un método del repository.

Ejemplo:

```java
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    @Query("select p from Producto p where p.activo = true")
    List<Producto> buscarActivos();
}
```

Acá ya no dependés de que el framework derive la consulta desde el nombre.
La consulta está escrita explícitamente.

Eso te da más control y, en muchos casos, también más claridad.

## Qué gana `@Query`

Varias cosas muy importantes:

- evita nombres exageradamente largos
- hace más explícita la lógica de búsqueda
- te permite expresar consultas más complejas
- vuelve la intención más legible en ciertos escenarios
- te da una transición natural hacia consultas más avanzadas

No significa que sea “mejor siempre”.
Significa que es una herramienta muy útil cuando el nombre derivado deja de ser la mejor opción.

## Cuándo conviene seguir con consultas derivadas

Antes de ver cuándo usar `@Query`, conviene dejar claro cuándo **no hace falta**.

Por ejemplo, esto sigue siendo perfecto como consulta derivada:

```java
Optional<Usuario> findByEmail(String email);
```

También esto:

```java
boolean existsByNombre(String nombre);
```

Y esto:

```java
List<Pedido> findByEstado(String estado);
```

Si el método sigue siendo:

- corto
- claro
- directo
- fácil de leer

entonces la derivación por nombre sigue siendo una gran opción.

## Cuándo empieza a convenir `@Query`

Suele empezar a tener sentido cuando:

- el nombre del método se vuelve demasiado largo
- la consulta tiene varias condiciones y el nombre pierde legibilidad
- querés expresar mejor la intención en una query explícita
- necesitás construir algo que el método derivado expresa de forma torpe
- querés proyectar resultados concretos
- querés usar JPQL más directamente

## Un primer ejemplo comparativo

### Derivada por nombre

```java
List<Producto> findByActivoAndCategoriaAndPrecioGreaterThan(
    boolean activo,
    String categoria,
    double precio
);
```

Esto todavía puede ser tolerable.

### Con `@Query`

```java
@Query("select p from Producto p where p.activo = :activo and p.categoria = :categoria and p.precio > :precio")
List<Producto> buscarProductosFiltrados(boolean activo, String categoria, double precio);
```

La segunda forma puede leerse mejor cuando la consulta empieza a crecer.

El nombre del método ya no tiene que cargar toda la semántica por sí solo.

## Qué lenguaje se usa normalmente en `@Query`

Cuando usás `@Query`, lo más común al empezar es trabajar con **JPQL**.

No hace falta que entres en toda su profundidad ahora, pero conviene entender esta idea:

- no es exactamente SQL puro contra tablas
- suele expresarse sobre entidades y propiedades del modelo Java

Por ejemplo:

```java
@Query("select p from Producto p where p.activo = true")
```

Acá se habla de:

- `Producto` como entidad
- `p.activo` como propiedad

No de nombres crudos de tabla o de columna SQL.

## Qué significa esa consulta

Por ejemplo:

```java
@Query("select p from Producto p where p.activo = true")
List<Producto> buscarActivos();
```

Podés leerla así:

- seleccionar entidades `Producto`
- alias `p`
- donde `activo` sea verdadero

Es muy expresivo y bastante cercano a cómo pensás el dominio.

## Un ejemplo con parámetros

Muy pronto vas a necesitar que la consulta reciba valores.

Por ejemplo:

```java
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    @Query("select p from Producto p where p.categoria = :categoria")
    List<Producto> buscarPorCategoria(@Param("categoria") String categoria);
}
```

Acá aparece algo muy importante: los parámetros nombrados.

## Qué hace `@Param`

`@Param` vincula un parámetro del método con un parámetro usado dentro de la consulta.

Por ejemplo:

- en la query: `:categoria`
- en el método: `@Param("categoria") String categoria`

Eso le dice a Spring cómo reemplazar el valor dentro de la consulta.

## Cómo leer este ejemplo completo

```java
@Query("select p from Producto p where p.categoria = :categoria")
List<Producto> buscarPorCategoria(@Param("categoria") String categoria);
```

Podés leerlo así:

- quiero una lista de productos
- cuyo campo `categoria` coincida con el valor recibido
- ese valor se llama `categoria` dentro del método

Es bastante directo.

## Un ejemplo con varias condiciones

```java
@Query("""
    select p
    from Producto p
    where p.activo = :activo
      and p.categoria = :categoria
      and p.precio >= :precioMinimo
""")
List<Producto> buscarFiltrados(
    @Param("activo") boolean activo,
    @Param("categoria") String categoria,
    @Param("precioMinimo") double precioMinimo
);
```

Este ejemplo ya muestra una de las ventajas reales de `@Query`:

la consulta sigue siendo bastante clara, y no obligás al nombre del método a convertirse en una oración interminable.

## Qué gana el nombre del método en este caso

Algo muy importante: con `@Query`, el nombre del método puede enfocarse más en la intención general y menos en enumerar cada criterio exacto.

Por ejemplo:

```java
buscarFiltrados(...)
```

o:

```java
buscarActivosPorCategoria(...)
```

o:

```java
buscarDisponibles(...)
```

La consulta explícita ya cuenta el detalle fino.
Entonces el nombre del método puede quedar más razonable.

## Un ejemplo clásico: búsquedas parciales

Imaginá que querés buscar productos cuyo título contenga cierto texto.

Con derivación por nombre, a veces también podrías expresarlo, pero `@Query` puede quedar muy legible:

```java
@Query("select p from Producto p where lower(p.titulo) like lower(concat('%', :texto, '%'))")
List<Producto> buscarPorTituloParcial(@Param("texto") String texto);
```

Esto ya muestra que `@Query` te da un lenguaje bastante flexible para búsquedas más expresivas.

## Por qué esto empieza a ser valioso

Porque muchas búsquedas reales no son solo “igual a exacto”.

A veces querés:

- contiene texto
- mayor que
- menor que
- entre dos valores
- combinación de condiciones
- orden más específico
- filtrado con flags

Y ahí una query explícita puede comunicar mucho mejor el criterio.

## Otro caso típico: varias condiciones opcionales o semicomplejas

Sin meterte todavía en criterios realmente dinámicos, ya podés encontrar casos donde `@Query` se siente más natural que un nombre largo.

Por ejemplo:

```java
@Query("""
    select u
    from Usuario u
    where u.activo = true
      and u.email like concat('%', :fragmento, '%')
""")
List<Usuario> buscarActivosPorFragmentoEmail(@Param("fragmento") String fragmento);
```

Esto sería bastante incómodo de expresar con un nombre derivado sin empezar a forzar demasiado la convención.

## `@Query` no reemplaza siempre a los métodos derivados

Este punto es central.

No conviene pensar:

> “ya aprendí `@Query`, entonces ahora voy a usarlo para absolutamente todo”

Eso sería un error.

Porque para consultas simples, las derivadas suelen seguir siendo mejores por:

- brevedad
- claridad
- menos ruido
- menos verbosidad

La idea correcta es esta:

- derivación por nombre cuando sigue siendo limpia
- `@Query` cuando la consulta explícita mejora la legibilidad o la capacidad de expresión

## Un muy buen criterio práctico

Podés guiarte con esta pregunta:

> ¿el nombre derivado sigue siendo claro y razonable, o ya está empezando a convertirse en una herramienta forzada?

Si todavía es claro, seguí con derivación.
Si ya se está volviendo exagerado, `@Query` probablemente tenga más sentido.

## Un ejemplo muy claro de límite

Esto:

```java
Optional<Usuario> findByEmail(String email);
```

está perfecto.

Pero algo como esto:

```java
List<Producto> findByActivoAndCategoriaAndPrecioGreaterThanAndStockGreaterThanOrderByPrecioAsc(
    boolean activo,
    String categoria,
    double precio,
    int stock
);
```

ya empieza a ser discutible desde el punto de vista de legibilidad.

No es que no funcione.
Es que quizá ya no sea la mejor forma de expresarlo.

## Un ejemplo equivalente con `@Query`

```java
@Query("""
    select p
    from Producto p
    where p.activo = :activo
      and p.categoria = :categoria
      and p.precio > :precio
      and p.stock > :stock
    order by p.precio asc
""")
List<Producto> buscarDisponibles(
    @Param("activo") boolean activo,
    @Param("categoria") String categoria,
    @Param("precio") double precio,
    @Param("stock") int stock
);
```

Acá la consulta está más desarrollada, sí, pero el nombre quedó mucho más razonable.

## Por qué `@Query` puede mejorar la legibilidad

Porque a veces el detalle del criterio está mejor expresado como query que como nombre de método.

Es una inversión:

- el nombre queda más corto
- la intención general sigue clara
- la consulta muestra el detalle fino

Eso suele ser una muy buena combinación.

## `@Query` y el uso de alias

En JPQL es muy común usar alias.

Por ejemplo:

```java
select p from Producto p where p.activo = true
```

Acá `p` es simplemente una forma corta de referirse a la entidad `Producto` dentro de la consulta.

Eso hace que la query sea más cómoda de escribir y leer.

## `@Query` y propiedades de la entidad

Es muy importante recordar esto:

en JPQL normalmente hablás en términos de:

- entidad
- propiedades Java

Por ejemplo:

```java
p.titulo
p.precio
p.activo
```

No en términos de nombres SQL brutos de columnas, al menos en la forma más introductoria y común de uso.

Eso conecta bien con el modelo orientado a objetos.

## Un ejemplo con retorno único

```java
@Query("select u from Usuario u where u.email = :email")
Optional<Usuario> buscarPorEmailExacto(@Param("email") String email);
```

Esto muestra que `@Query` no obliga a listas.
También puede usarse perfectamente en casos donde esperás a lo sumo un único resultado.

## Un ejemplo con boolean de existencia no derivada

En general, para existencia simple suele seguir siendo más elegante usar:

```java
boolean existsByEmail(String email);
```

Pero conceptualmente podrías escribir algo más explícito con query si el caso creciera o cambiara.

La idea importante es entender que `@Query` amplía tus opciones; no te obliga a abandonar las derivadas más cómodas.

## Cuándo todavía no hace falta `@Query`

Conviene insistir en esto porque es una tentación común usar la herramienta más “poderosa” demasiado pronto.

Para cosas como:

- `findByEmail`
- `findByNombre`
- `existsBySlug`
- `findByEstado`
- `countByActivo`

seguir con derivación por nombre suele ser una muy buena decisión.

No hace falta sofisticar lo simple.

## Un ejemplo completo dentro de un repository

```java
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Optional<Producto> findByTitulo(String titulo);

    boolean existsByTitulo(String titulo);

    @Query("select p from Producto p where p.categoria = :categoria")
    List<Producto> buscarPorCategoria(@Param("categoria") String categoria);

    @Query("""
        select p
        from Producto p
        where p.activo = true
          and p.precio >= :precioMinimo
        order by p.precio asc
    """)
    List<Producto> buscarActivosDesdePrecio(@Param("precioMinimo") double precioMinimo);
}
```

Este repository ya mezcla muy bien ambos enfoques:

- métodos derivados para lo simple
- `@Query` para lo más expresivo o detallado

Eso suele ser una estrategia muy sana.

## Qué relación tiene esto con la capa service

El service no tiene por qué saber si la consulta se resolvió por derivación o por query explícita.

Por ejemplo:

```java
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public List<Producto> listarActivosDesdePrecio(double precioMinimo) {
        return productoRepository.buscarActivosDesdePrecio(precioMinimo);
    }
}
```

Eso está muy bien.
La implementación concreta del acceso a datos sigue quedando encapsulada en el repository.

## Qué relación tiene esto con legibilidad del proyecto

Muy fuerte.

Un repository bien diseñado suele permitir que alguien lea sus métodos y entienda rápidamente:

- qué tipo de búsquedas ofrece
- cuáles son simples
- cuáles son más complejas
- dónde conviene usar derivación
- dónde conviene usar query explícita

Eso hace que el proyecto sea mucho más amable de navegar.

## Una buena heurística

Podés pensar esto:

### Derivación por nombre
Ideal cuando:
- el criterio es simple
- el nombre queda corto o razonable
- la consulta se entiende rápido

### `@Query`
Ideal cuando:
- el criterio se vuelve más complejo
- el nombre empieza a perder claridad
- querés expresar mejor el detalle de la consulta
- querés más control explícito

Esta heurística te va a servir muchísimo.

## Error común: usar `@Query` para todo por entusiasmo

Ya lo vimos, pero vale repetirlo.

No porque puedas escribir consultas explícitas quiere decir que debas reemplazar todas las derivadas.

A veces `findByEmail` sigue siendo la mejor solución del mundo para ese caso.

## Error común: forzar nombres derivados monstruosos

Tampoco conviene ir al otro extremo.

Cuando el nombre del método ya no se lee bien, probablemente estás perdiendo la principal ventaja de la derivación: la claridad.

## Error común: pensar que `@Query` es “más profesional” por sí mismo

No necesariamente.

Una API o un backend no se vuelve mejor por escribir más consultas manuales.
Se vuelve mejor cuando el código es más claro, más mantenible y más adecuado al problema.

A veces la opción más profesional es justamente la más simple.

## Error común: olvidar que la query sigue hablando el idioma de la entidad

Aunque uses `@Query`, seguís trabajando normalmente con el modelo JPA.

Eso significa que no deberías perder de vista:

- nombres de entidad
- nombres de propiedades
- consistencia con el dominio

No es un salto caótico hacia una capa separada del modelo.

## Relación con Spring Boot

Spring Boot y Spring Data JPA hacen muy natural combinar ambos estilos:

- convención derivada para lo cotidiano
- query explícita para lo más específico

Esa combinación es una de las grandes fortalezas del stack, porque te permite empezar simple y aumentar expresividad solo cuando el caso realmente lo exige.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> `@Query` conviene cuando una consulta deja de expresarse de forma cómoda o legible con un nombre derivado, permitiendo escribir el criterio de búsqueda de forma explícita sin abandonar la integración natural que Spring Data JPA tiene con entidades y repositories.

## Resumen

- Las consultas derivadas siguen siendo muy valiosas para búsquedas simples.
- `@Query` aparece cuando el nombre del método deja de ser cómodo o claro.
- Con `@Query` podés escribir la consulta explícitamente usando JPQL.
- `@Param` permite vincular parámetros del método con parámetros nombrados dentro de la query.
- No conviene reemplazar todo por `@Query` ni forzar nombres derivados monstruosos.
- La clave está en elegir la herramienta más clara para cada caso.
- Este tema marca la transición desde consultas básicas derivadas hacia una capa de persistencia más expresiva.

## Próximo tema

En el próximo tema vas a ver cómo usar paginación y ordenamiento con `Page`, `Pageable` y `Sort`, para evitar `findAll` gigantes y empezar a devolver listados mucho más realistas en aplicaciones con muchos datos.
