---
title: "Cómo funcionan @ManyToOne y @OneToMany para modelar relaciones entre entidades"
description: "Entender cómo se representan relaciones entre entidades en JPA usando @ManyToOne y @OneToMany, y por qué estas anotaciones permiten pasar de entidades aisladas a un modelo persistente mucho más realista."
order: 45
module: "Persistencia con Spring Data JPA"
level: "base"
draft: false
---

En los temas anteriores viste cómo:

- modelar entidades con `@Entity`
- definir un identificador con `@Id`
- usar `JpaRepository`
- escribir consultas derivadas y con `@Query`
- paginar y ordenar resultados

Hasta ahí, las entidades que fuiste viendo eran bastante “planas” o aisladas.

Por ejemplo:

- un `Producto`
- una `Categoria`
- un `Usuario`
- un `Pedido`

Pero en una aplicación real casi nunca las entidades viven completamente separadas.

Muy pronto aparecen relaciones como estas:

- muchos productos pertenecen a una categoría
- muchos pedidos pertenecen a un usuario
- muchos comentarios pertenecen a una publicación
- muchos ítems pertenecen a un pedido
- una categoría puede tener muchos productos

Ahí entra una de las partes más importantes de JPA:

- `@ManyToOne`
- `@OneToMany`

Este tema es clave porque marca el momento en que el modelo persistente deja de ser una colección de entidades aisladas y empieza a parecerse más a un dominio real con vínculos entre objetos.

## Por qué hacen falta relaciones

Supongamos que querés representar productos y categorías.

Podrías intentar algo así:

```java
@Entity
public class Producto {

    @Id
    @GeneratedValue
    private Long id;

    private String titulo;
    private String categoriaNombre;

    // getters y setters
}
```

Esto puede funcionar en un ejemplo mínimo.

Pero rápidamente aparecen problemas:

- la categoría se reduce a un texto suelto
- no hay una entidad real `Categoria`
- no podés navegar fácilmente entre objetos relacionados
- se pierde riqueza del modelo
- aparecen duplicaciones y menor consistencia

En muchos casos, lo correcto no es guardar simplemente “el nombre de la categoría” dentro de `Producto`, sino modelar la relación entre `Producto` y `Categoria`.

## La idea general de una relación

Cuando hay una relación entre entidades, lo que querés expresar es algo como:

- este producto pertenece a esta categoría
- este pedido pertenece a este usuario
- este comentario pertenece a esta publicación
- esta categoría agrupa estos productos

JPA permite modelar estas relaciones directamente entre objetos Java.

Eso es muy importante.

No solo estás pensando en tablas o claves foráneas.
También estás pensando en objetos que se vinculan entre sí.

## Qué significa `@ManyToOne`

`@ManyToOne` se usa cuando muchas instancias de una entidad apuntan a una única instancia de otra.

Por ejemplo:

- muchos productos → una categoría
- muchos pedidos → un usuario
- muchos comentarios → una publicación
- muchos empleados → un departamento

La lectura mental es esta:

> muchas instancias de A pertenecen a una instancia de B.

## Un ejemplo clásico: muchos productos pertenecen a una categoría

### Categoria

```java
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
public class Categoria {

    @Id
    @GeneratedValue
    private Long id;

    private String nombre;

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}
```

### Producto

```java
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class Producto {

    @Id
    @GeneratedValue
    private Long id;

    private String titulo;
    private double precio;

    @ManyToOne
    private Categoria categoria;

    public Long getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public double getPrecio() {
        return precio;
    }

    public void setPrecio(double precio) {
        this.precio = precio;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }
}
```

Este ejemplo ya expresa algo muy valioso:

- cada `Producto` tiene una `Categoria`
- una `Categoria` puede estar asociada a muchos productos

## Cómo leer este ejemplo

```java
@ManyToOne
private Categoria categoria;
```

Podés leerlo así:

- este producto está relacionado con una categoría
- muchos productos pueden compartir esa misma categoría
- desde el punto de vista del producto, la relación es “muchos a uno”

Es una forma muy natural de modelar algo real del dominio.

## Qué gana el modelo con esto

Muchísimo.

Porque ahora el producto no tiene simplemente un texto arbitrario.
Tiene una referencia real a otra entidad.

Eso permite cosas como:

- navegar del producto a su categoría
- validar relaciones más claramente
- consultar por entidad relacionada
- representar mejor el dominio
- evitar duplicaciones conceptuales

## Qué significa `@OneToMany`

`@OneToMany` es la cara complementaria del vínculo.

Se usa cuando una instancia de una entidad está asociada a muchas instancias de otra.

Por ejemplo:

- una categoría → muchos productos
- un usuario → muchos pedidos
- una publicación → muchos comentarios
- un pedido → muchos ítems

La lectura mental es:

> una instancia de A tiene muchas instancias de B asociadas.

## El lado inverso de la relación producto-categoría

Además de tener en `Producto`:

```java
@ManyToOne
private Categoria categoria;
```

podrías tener en `Categoria` algo así:

```java
import java.util.List;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
public class Categoria {

    @Id
    @GeneratedValue
    private Long id;

    private String nombre;

    @OneToMany(mappedBy = "categoria")
    private List<Producto> productos;

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public List<Producto> getProductos() {
        return productos;
    }

    public void setProductos(List<Producto> productos) {
        this.productos = productos;
    }
}
```

Ahora la relación está modelada en ambos sentidos.

## Qué significa `mappedBy`

Este atributo es muy importante.

```java
@OneToMany(mappedBy = "categoria")
private List<Producto> productos;
```

`mappedBy = "categoria"` le dice a JPA que esta relación está siendo “poseída” o referenciada desde el campo `categoria` de la entidad `Producto`.

Dicho de forma más simple:

> la referencia principal que define esta relación está del lado de `Producto`, en el campo `categoria`.

Eso evita que JPA interprete que son dos relaciones independientes sin conexión entre sí.

## Cómo pensar los dos lados

En este ejemplo:

### Lado Producto
```java
@ManyToOne
private Categoria categoria;
```

### Lado Categoria
```java
@OneToMany(mappedBy = "categoria")
private List<Producto> productos;
```

Podés pensar que:

- desde `Producto`, accedés a su categoría
- desde `Categoria`, accedés a la lista de productos asociados

Esto vuelve el modelo mucho más rico y navegable.

## ¿Siempre hace falta modelar ambos lados?

No necesariamente.

Y esto es muy importante.

No toda relación tiene que ser bidireccional desde el primer día.

A veces alcanza perfectamente con modelar solo un lado.

Por ejemplo, si en tu caso de uso solo necesitás que cada `Producto` conozca su `Categoria`, quizá con esto alcanza:

```java
@ManyToOne
private Categoria categoria;
```

Y no hace falta todavía poner una lista de productos dentro de `Categoria`.

Esa decisión depende mucho de lo que realmente necesite tu modelo y tus casos de uso.

## Relación unidireccional vs bidireccional

### Unidireccional
Solo una entidad conoce la relación.

Por ejemplo:

- `Producto` conoce `Categoria`
- pero `Categoria` no tiene `List<Producto>`

### Bidireccional
Ambas entidades conocen la relación.

Por ejemplo:

- `Producto` conoce `Categoria`
- `Categoria` conoce `List<Producto>`

No siempre la bidireccionalidad es mejor.
A veces agregar ambos lados complica más de lo que ayuda si realmente no lo necesitás.

## Un buen criterio al empezar

Podés pensar así:

- si solo necesitás navegar la relación desde un lado, modelá solo ese lado
- si realmente necesitás navegarla desde ambos, considerá una relación bidireccional
- no agregues lados extra por costumbre si todavía no aportan valor

Ese criterio te ahorra bastante complejidad innecesaria.

## Otro ejemplo clásico: muchos pedidos pertenecen a un usuario

### Usuario

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

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}
```

### Pedido

```java
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class Pedido {

    @Id
    @GeneratedValue
    private Long id;

    private String numero;

    @ManyToOne
    private Usuario usuario;

    public Long getId() {
        return id;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
}
```

Acá la idea es muy clara:

- un pedido pertenece a un usuario
- un usuario puede tener muchos pedidos

## Qué relación tiene esto con la base de datos

Aunque este curso está razonando mucho desde objetos Java, detrás de escena normalmente esto se traduce a una relación persistente entre tablas.

Por ejemplo, conceptualmente:

- tabla `pedido`
- tabla `usuario`
- en `pedido`, una referencia al `usuario`

No hace falta que profundices ahora en todo el detalle físico del esquema.
Pero sí conviene entender que JPA está ayudando a modelar ese vínculo desde el lado orientado a objetos.

## Qué hace `@JoinColumn`

Muy frecuentemente, cuando querés explicitar mejor la columna de unión, aparece `@JoinColumn`.

Por ejemplo:

```java
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Pedido {

    @Id
    @GeneratedValue
    private Long id;

    private String numero;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    public Long getId() {
        return id;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
}
```

`@JoinColumn` te permite indicar con más claridad el nombre de la columna usada para representar esa relación.

## Cuándo conviene usar `@JoinColumn`

Aunque a veces JPA puede inferir nombres por convención, explicitar `@JoinColumn` puede ser muy buena idea porque:

- hace más visible la intención
- da más control
- evita depender tanto de defaults
- mejora legibilidad del modelo persistente

No siempre es estrictamente obligatorio en ejemplos simples, pero conceptualmente es muy útil conocerlo.

## Una lectura mental muy útil

Podés pensar este código así:

```java
@ManyToOne
@JoinColumn(name = "categoria_id")
private Categoria categoria;
```

como:

> este producto pertenece a una categoría, y esa relación persistente se representa mediante la columna `categoria_id`.

Eso une muy bien el mundo de objetos con el mundo de persistencia.

## Qué pasa con `@OneToMany` y colecciones

Cuando usás `@OneToMany`, normalmente trabajás con colecciones.

Por ejemplo:

```java
private List<Producto> productos;
```

o:

```java
private Set<Pedido> pedidos;
```

Lo importante es entender que esa colección representa las muchas instancias del otro lado de la relación.

## ¿List o Set?

Al empezar, ambos aparecen en proyectos reales.

No hace falta entrar ahora en toda la discusión fina sobre qué colección conviene en cada contexto.

Lo importante por ahora es entender la idea:

- el lado `@OneToMany` suele representarse como una colección
- esa colección agrupa las entidades relacionadas

## Un ejemplo bidireccional más completo

### Categoria

```java
import java.util.List;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
public class Categoria {

    @Id
    @GeneratedValue
    private Long id;

    private String nombre;

    @OneToMany(mappedBy = "categoria")
    private List<Producto> productos;

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public List<Producto> getProductos() {
        return productos;
    }

    public void setProductos(List<Producto> productos) {
        this.productos = productos;
    }
}
```

### Producto

```java
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Producto {

    @Id
    @GeneratedValue
    private Long id;

    private String titulo;

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    public Long getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }
}
```

Esto ya representa una estructura muchísimo más realista que entidades completamente aisladas.

## Qué relación tiene esto con el dominio

Muchísima.

Porque en aplicaciones reales, el dominio rara vez es una lista de objetos sin vínculos.

Normalmente existen relaciones naturales como:

- producto → categoría
- pedido → cliente
- comentario → autor
- ítem → pedido
- tarea → proyecto

Modelarlas bien es parte de construir un dominio persistente coherente.

## Qué relación tiene esto con los DTOs

Muy fuerte.

Aunque las entidades se relacionen entre sí, eso no significa que debas exponer siempre toda esa estructura tal cual por la API.

Por ejemplo, podrías tener una entidad `Producto` relacionada con `Categoria`, pero en la respuesta de un endpoint quizá solo quieras devolver algo como:

```json
{
  "id": 10,
  "titulo": "Notebook",
  "categoriaNombre": "Electrónica"
}
```

o:

```json
{
  "id": 10,
  "titulo": "Notebook",
  "categoria": {
    "id": 3,
    "nombre": "Electrónica"
  }
}
```

Eso depende del diseño del contrato web, no solo del modelo JPA.

Por eso sigue siendo muy importante separar entidades y DTOs.

## Qué gana el repository con relaciones bien modeladas

Mucho.

Porque una vez que las entidades están relacionadas, el repository puede empezar a expresar consultas más interesantes.

Por ejemplo:

- buscar productos por nombre de categoría
- listar pedidos de un usuario
- filtrar comentarios por publicación
- recuperar entidades asociadas de forma más natural

Todavía no estás entrando en todas esas posibilidades, pero este tema deja la base.

## Un ejemplo conceptual de consulta derivada con relación

Si `Producto` tiene:

```java
@ManyToOne
private Categoria categoria;
```

más adelante podrías llegar a ver cosas como:

```java
List<Producto> findByCategoriaNombre(String nombre);
```

Esto muestra que modelar bien las relaciones no solo enriquece el dominio.
También enriquece la capacidad de consulta.

## Qué todavía no estás viendo

Aunque este tema es muy importante, todavía no estás entrando de lleno en cosas como:

- `@OneToOne`
- `@ManyToMany`
- `fetch`
- `cascade`
- `orphanRemoval`
- problemas de serialización recursiva
- lazy loading
- relaciones complejas entre agregados

Y está perfecto que así sea.

Primero conviene consolidar muy bien el núcleo más frecuente:

- `@ManyToOne`
- `@OneToMany`
- lado propietario
- lado inverso
- unidireccional vs bidireccional

## Una intuición muy importante: el lado “muchos” suele ser muy natural para modelar primero

En muchísimos casos, empezar por el lado `@ManyToOne` resulta muy natural.

Por ejemplo:

- cada pedido tiene un usuario
- cada producto tiene una categoría
- cada comentario tiene una publicación

Eso suele ser más directo de razonar que arrancar pensando primero en la colección del lado `@OneToMany`.

Por eso, al empezar, muchas veces el lado “muchos a uno” es la puerta de entrada más cómoda.

## ¿Qué significa lado propietario?

Sin entrar todavía en demasiada profundidad, conviene sembrar esta idea:

en relaciones bidireccionales, uno de los lados es el que representa de forma principal la relación persistente.

En el ejemplo de producto-categoría, típicamente ese rol lo cumple `Producto`, en el campo:

```java
@ManyToOne
@JoinColumn(name = "categoria_id")
private Categoria categoria;
```

Y del otro lado, `Categoria` usa:

```java
@OneToMany(mappedBy = "categoria")
private List<Producto> productos;
```

Esto ayuda a JPA a entender cómo se arma la relación sin duplicarla.

## Qué pasa si mezclás todo sin criterio

Si modelás relaciones bidireccionales por reflejo sin pensar, pueden aparecer problemas como:

- más complejidad de la necesaria
- modelos más pesados
- navegación innecesaria en ambos sentidos
- más dificultad al serializar entidades
- más confusión sobre quién controla la relación

Por eso conviene agregar el segundo lado solo cuando realmente aporta valor.

## Un criterio práctico muy sano

Podés pensar así:

- si una entidad “pertenece a” otra, `@ManyToOne` suele ser una gran primera opción
- si además necesitás navegar desde la entidad padre hacia sus hijos, evaluá `@OneToMany`
- no hagas toda relación bidireccional por automatismo

Este criterio ayuda mucho al empezar.

## Un ejemplo del mundo real

Imaginá un e-commerce.

### Categoria
- Electrónica
- Hogar
- Ropa

### Producto
- Notebook → Electrónica
- Heladera → Hogar
- Remera → Ropa

Eso encaja de forma muy natural con:

- muchos productos pertenecen a una categoría
- una categoría puede tener muchos productos

Este tipo de ejemplos muestran por qué `@ManyToOne` y `@OneToMany` son tan centrales.

## Qué relación tiene esto con reglas de negocio

Las relaciones no son solo una cuestión técnica de persistencia.

También expresan estructura del dominio.

Por ejemplo:

- un pedido sin usuario puede o no tener sentido según tu sistema
- un producto sin categoría puede o no estar permitido
- un comentario sin publicación probablemente no tenga sentido

Más adelante, estas decisiones se conectan con validaciones, restricciones y reglas más ricas.

## Error común: representar relaciones complejas solo con strings o ids sueltos en la entidad

A veces, por simplificar demasiado, alguien modela todo así:

```java
private Long categoriaId;
private String usuarioNombre;
```

Eso puede ser útil en DTOs o ciertos contextos de entrada/salida, pero no siempre es la mejor forma de modelar el dominio persistente.

Cuando la relación es real y estable, muchas veces conviene modelarla como relación entre entidades.

## Error común: hacer bidireccional todo sin necesitarlo

Ya lo vimos, pero vale insistir.

Agregar ambos lados de una relación aumenta el poder del modelo, sí, pero también su complejidad.

No conviene hacerlo por reflejo.

## Error común: exponer entidades relacionadas tal cual en la API sin pensar el contrato

Cuando las relaciones aparecen, se vuelve todavía más importante no devolver entidades JPA sin criterio.

Porque podrías terminar exponiendo demasiada estructura o generando respuestas más pesadas de lo necesario.

## Error común: no distinguir bien la relación desde el punto de vista del dominio

Antes de anotar nada, conviene preguntarte:

- ¿muchos de esto pertenecen a uno de aquello?
- ¿uno de esto agrupa muchos de aquello?
- ¿realmente necesito navegar ambos lados?
- ¿esta relación representa algo importante del dominio?

Ese razonamiento previo mejora muchísimo el diseño.

## Relación con Spring Boot

Spring Boot y Spring Data JPA hacen muy accesible el modelado de relaciones, pero justamente por eso conviene entender bien qué significan conceptualmente estas anotaciones.

No son solo decoración para que compile.
Están modelando vínculos importantes del sistema.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> `@ManyToOne` y `@OneToMany` permiten modelar relaciones reales entre entidades persistentes, haciendo que el dominio deje de estar compuesto por objetos aislados y pase a representar vínculos como pertenencia, agrupación y navegación entre recursos relacionados.

## Resumen

- `@ManyToOne` modela situaciones donde muchas entidades apuntan a una sola.
- `@OneToMany` modela el lado inverso, donde una entidad agrupa muchas de otra.
- `mappedBy` ayuda a indicar el lado inverso de una relación bidireccional.
- No siempre hace falta modelar ambos lados desde el principio.
- `@JoinColumn` permite hacer más explícita la columna de unión.
- Las relaciones enriquecen mucho el modelo persistente y reflejan mejor el dominio.
- Este tema sienta la base para trabajar con entidades conectadas, no solo con clases aisladas.

## Próximo tema

En el próximo tema vas a ver qué problemas aparecen al serializar entidades relacionadas directamente como JSON y por qué lazy loading, recursión y relaciones bidireccionales pueden generar respuestas problemáticas si no separás bien entidades y DTOs.
