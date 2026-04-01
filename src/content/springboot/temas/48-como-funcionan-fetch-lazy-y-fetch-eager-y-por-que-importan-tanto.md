---
title: "Cómo funcionan fetch = LAZY y fetch = EAGER y por qué importan tanto"
description: "Entender qué significa que una relación se cargue de forma diferida o inmediata en JPA, cómo se expresan fetch = LAZY y fetch = EAGER y por qué esta decisión impacta muchísimo en performance, diseño y serialización."
order: 48
module: "Persistencia con Spring Data JPA"
level: "base"
draft: false
---

En el tema anterior viste cómo funciona `@Transactional` y por qué las transacciones son fundamentales para mantener consistencia cuando varias operaciones deben confirmarse o revertirse juntas.

Ahora toca otro concepto muy importante dentro de JPA, especialmente cuando empezás a trabajar con relaciones entre entidades:

- `fetch = LAZY`
- `fetch = EAGER`

Este tema importa muchísimo porque explica algo que al principio suele resultar medio misterioso:

> ¿por qué algunas relaciones parecen cargarse automáticamente y otras no?

o también:

> ¿por qué a veces una entidad viene “liviana” y otras veces parece arrastrar medio grafo de objetos detrás?

La respuesta suele estar muy ligada a la estrategia de carga de las relaciones.

Y entender esto temprano te ayuda a evitar varios problemas comunes:

- respuestas demasiado pesadas
- consultas innecesarias
- comportamiento inesperado al acceder a relaciones
- problemas al serializar entidades
- confusión sobre qué datos están realmente cargados y cuáles no

## El problema de fondo

Supongamos estas entidades:

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

Ahora imaginá que buscás un `Producto` por id.

La pregunta es:

> cuando obtenés ese producto, ¿JPA trae automáticamente también la categoría completa?

Y si buscás una `Categoria`, otra pregunta sería:

> ¿trae inmediatamente toda la lista de productos o la deja para después?

Eso es exactamente lo que las estrategias de fetch ayudan a decidir.

## Qué significa “fetch”

`fetch` se refiere a **cómo y cuándo** se cargan las relaciones entre entidades.

No se trata de si una relación existe o no.
La relación puede estar perfectamente modelada.

Lo que cambia es esto:

- ¿la cargo enseguida?
- ¿la cargo solo si realmente se accede a ella?
- ¿la traigo junto con la entidad principal?
- ¿la dejo diferida para más adelante?

Dicho de forma simple:

> `fetch` define la estrategia de carga de una relación.

## Qué significa `LAZY`

`LAZY` significa carga diferida o perezosa.

La idea general es esta:

> la relación no se carga completamente de inmediato; se intenta cargar solo si realmente se la necesita.

Podés pensarlo como:

- primero traigo la entidad principal
- la relación queda “pendiente”
- si más adelante el código accede a esa relación, ahí recién puede cargarse

Este enfoque suele ser muy útil para evitar traer datos innecesarios.

## Qué significa `EAGER`

`EAGER` significa carga inmediata o ansiosa.

La idea general es:

> cuando se carga la entidad principal, también se carga enseguida esa relación asociada.

Podés pensarlo como:

- quiero la entidad principal
- y además quiero ya mismo esta relación, aunque todavía no la haya tocado explícitamente en el código

Esto a veces resulta cómodo, pero también puede hacer que las consultas se vuelvan más pesadas de lo necesario.

## Una intuición muy útil

Podés resumirlo así:

- `LAZY` → cargá después, si realmente hace falta
- `EAGER` → cargá ya mismo junto con la entidad principal

Esa diferencia conceptual es la base del tema.

## Un ejemplo de `LAZY`

```java
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;

@ManyToOne(fetch = FetchType.LAZY)
private Categoria categoria;
```

Esto expresa algo como:

> este producto tiene una categoría, pero no quiero traerla completamente desde el primer momento si todavía no la necesito.

## Un ejemplo de `EAGER`

```java
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;

@ManyToOne(fetch = FetchType.EAGER)
private Categoria categoria;
```

Esto expresa algo como:

> cuando cargues el producto, traé también la categoría de entrada.

## Por qué esta decisión importa tanto

Porque afecta directamente cosas como:

- cantidad de datos cargados
- momento en que esos datos se cargan
- costo potencial de ciertas operaciones
- comportamiento del código cuando navegás relaciones
- tamaño conceptual de las respuestas
- riesgo de cargar estructuras que no necesitabas

No es un detalle decorativo.
Es una decisión que puede impactar mucho en cómo se comporta tu modelo persistente.

## Un caso simple para entender `LAZY`

Supongamos que tenés un listado de productos y solo querés mostrar:

- id
- título
- precio

No querés mostrar la categoría completa de cada uno.

En ese contexto, si la relación con `Categoria` se carga eager innecesariamente, podrías estar trayendo más estructura de la que realmente necesitabas para ese caso de uso.

Con `LAZY`, el sistema puede intentar mantener la relación diferida hasta que se pida explícitamente.

## Un caso simple para entender `EAGER`

Supongamos que en un caso muy concreto, cada vez que obtenés un pedido necesariamente necesitás también su usuario de forma inmediata para todo el flujo.

Podría parecer tentador decir:

- entonces quiero que la relación venga siempre eager

La idea general sería razonable, pero conviene tener mucho criterio porque esa decisión se vuelve global para esa relación, no solo para un caso puntual.

Y ese es uno de los motivos por los que usar eager indiscriminadamente puede ser peligroso.

## Qué problema intenta resolver `LAZY`

Principalmente, evitar trabajo innecesario.

Si cada entidad arrastra automáticamente todas sus relaciones, incluso cuando no hacen falta, el modelo puede volverse muy pesado.

`LAZY` ayuda a que el sistema no cargue todo por reflejo.

Eso suele ser bueno para:

- rendimiento conceptual
- control del acceso a relaciones
- reducción de carga innecesaria
- evitar grafos demasiado grandes desde el principio

## Qué problema puede traer `EAGER`

Que parezca cómodo al principio, pero termine generando más carga de la que realmente necesitabas.

Por ejemplo:

- pedís un producto
- también viene su categoría
- esa categoría quizá arrastra otras cosas
- y el grafo empieza a crecer más de lo esperado

Eso puede hacer que operaciones aparentemente simples terminen siendo más pesadas o menos previsibles.

## Cómo pensar esto sin obsesionarse todavía con SQL o consultas internas

No hace falta entrar ahora en cada detalle de bajo nivel.

La idea conceptual que conviene fijar es esta:

> la estrategia de fetch define cuánta información relacionada intenta ponerse a disposición desde el principio y cuánta se deja diferida para después.

Eso ya es muchísimo.

## Relaciones típicamente “muchos a uno”

Volvamos al ejemplo:

```java
@ManyToOne
private Categoria categoria;
```

Una pregunta muy natural sería:

> cuando cargo un producto, ¿conviene traer también la categoría?

La respuesta depende del caso de uso, pero la lección importante no es memorizar una receta rígida.
Es entender que esto no es neutro: cambia el comportamiento del sistema.

## Relaciones típicamente “uno a muchos”

Ahora este otro lado:

```java
@OneToMany(mappedBy = "categoria")
private List<Producto> productos;
```

Acá la pregunta sería:

> cuando cargo una categoría, ¿quiero traer automáticamente toda la lista de productos?

En muchísimos casos, traer automáticamente una colección completa puede ser muy costoso o innecesario.
Por eso este tipo de relación se siente especialmente sensible a la estrategia de carga.

## Por qué las colecciones vuelven esto todavía más importante

Porque una relación hacia una colección puede significar:

- 2 elementos
- 20 elementos
- 200 elementos
- miles de elementos

Entonces, decidir si esa colección se carga inmediatamente o no puede tener un impacto mucho mayor que en una relación hacia un solo objeto.

## Un ejemplo explícito con `@OneToMany`

```java
import java.util.List;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
public class Usuario {

    @Id
    @GeneratedValue
    private Long id;

    private String nombre;

    @OneToMany(mappedBy = "usuario", fetch = FetchType.LAZY)
    private List<Pedido> pedidos;

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public List<Pedido> getPedidos() {
        return pedidos;
    }

    public void setPedidos(List<Pedido> pedidos) {
        this.pedidos = pedidos;
    }
}
```

La lectura conceptual sería:

> un usuario tiene muchos pedidos, pero no quiero cargar esa colección automáticamente salvo que realmente se la necesite.

## ¿Qué pasa si accedo a una relación lazy?

Ahí aparece el comportamiento interesante.

Si una relación es lazy y el contexto adecuado sigue disponible, al acceder a esa relación puede dispararse su carga.

Por ejemplo, algo como:

```java
Producto producto = productoRepository.findById(id).orElseThrow(...);
Categoria categoria = producto.getCategoria();
```

Podría hacer que la categoría se cargue en ese momento si todavía no lo estaba.

La idea importante es esa:

- primero no estaba completamente cargada
- al accederla, puede activarse su carga real

## Qué relación tiene esto con el tema anterior sobre serialización

Muchísima.

Si una entidad tiene relaciones lazy y la serialización JSON toca esas relaciones, puede producirse una carga que vos no habías planeado explícitamente.

Eso conecta directamente con varios de los problemas que viste en el tema 46:

- respuestas más pesadas
- acceso implícito a relaciones
- comportamiento no obvio
- dependencia del contexto persistente

Por eso fetch y serialización están muy relacionados.

## Qué es lo peligroso de confiar ciegamente en eager

Que a veces parece una solución fácil:

> “si siempre me da problemas acceder a la relación, la pongo eager y listo”

Pero eso puede convertir cada carga de la entidad en algo demasiado costoso o demasiado amplio.

El problema no desaparece.
Solo cambia de forma.

En lugar de “no se cargó”, ahora puede pasar a ser:

- se carga demasiado
- se carga siempre
- se expone más de lo que necesitaba
- el modelo se vuelve más pesado

## Un criterio conceptual muy importante

No deberías pensar:

- `EAGER` es bueno
- `LAZY` es malo

o al revés.

La pregunta correcta es:

> ¿qué estrategia tiene más sentido para esta relación según cómo se usa realmente el modelo?

Ese cambio de enfoque es fundamental.

## Qué suele buscarse en muchos diseños sanos

Muy frecuentemente, se valora bastante:

- mantener relaciones lo más livianas posible por defecto
- no arrastrar grafos innecesarios
- controlar explícitamente qué datos querés cargar según el caso
- evitar exponer entidades sin criterio

Eso hace que `LAZY` resulte conceptualmente muy atractivo en muchos escenarios.

Pero lo importante en este curso, por ahora, no es memorizar una regla absoluta sino entender el tradeoff.

## Qué es un tradeoff acá

Un tradeoff es un intercambio entre ventajas y costos.

### `LAZY`
Puede ayudar a evitar cargas innecesarias, pero exige más conciencia sobre cuándo accedés a la relación.

### `EAGER`
Puede dar la sensación de “todo disponible enseguida”, pero a costa de cargar más de forma automática.

Entender este intercambio es mucho más importante que repetir un slogan.

## Un ejemplo del problema de carga excesiva

Supongamos:

- cargás una lista de productos
- cada producto tiene categoría eager
- cada categoría tiene otras relaciones o estructura relevante
- la API solo quería mostrar `id` y `titulo`

En ese escenario, eager puede estar metiendo más carga y más complejidad de la que realmente necesitabas.

## Un ejemplo del problema de acceso diferido

Supongamos lo contrario:

- cargás un pedido
- querés acceder luego a su usuario
- la relación es lazy
- el contexto ya no está disponible o el flujo no fue pensado para eso

Ahí puede aparecer una sorpresa desagradable.

Por eso `LAZY` no significa “sin costo”.
Significa que el costo se mueve al momento de acceso efectivo.

## Qué relación tiene esto con diseño de casos de uso

Muy fuerte.

Una aplicación bien diseñada no suele depender de “devolver entidades tal cual y rezar”.
Suele pensar explícitamente:

- qué datos necesito en este caso de uso
- qué parte del modelo debo recorrer
- qué respuesta quiero construir
- qué DTO conviene devolver
- qué relaciones necesito realmente para ese flujo

Cuando pensás así, fetch deja de ser una sorpresa misteriosa y pasa a ser parte del diseño consciente.

## Un ejemplo práctico y sano

Supongamos que querés devolver un `ProductoResponse` así:

```java
public class ProductoResponse {

    private Long id;
    private String titulo;
    private String categoriaNombre;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getCategoriaNombre() {
        return categoriaNombre;
    }

    public void setCategoriaNombre(String categoriaNombre) {
        this.categoriaNombre = categoriaNombre;
    }
}
```

Y el mapper:

```java
public ProductoResponse toResponse(Producto producto) {
    ProductoResponse response = new ProductoResponse();
    response.setId(producto.getId());
    response.setTitulo(producto.getTitulo());

    if (producto.getCategoria() != null) {
        response.setCategoriaNombre(producto.getCategoria().getNombre());
    }

    return response;
}
```

Acá el punto interesante es que vos sabés exactamente qué parte de la relación necesitás para la respuesta:

- no toda la categoría completa con toda su red
- solo el nombre

Ese tipo de diseño ayuda muchísimo a controlar el impacto de las relaciones.

## Qué relación tiene esto con `@Transactional`

Muy buena.

En el tema anterior viste que `@Transactional` define una unidad consistente de trabajo.

Dentro de ese contexto, muchas veces acceder a relaciones lazy puede comportarse de forma más natural porque seguís dentro de una unidad persistente activa del caso de uso.

No hace falta que profundices en todos los matices todavía, pero conviene notar que:

- transacciones
- carga de relaciones
- acceso a entidades
- construcción de respuestas

son piezas que se conectan bastante entre sí.

## Qué todavía no estás viendo del todo

Aunque este tema es muy importante, todavía no estás profundizando a fondo en:

- cuándo conviene cada fetch por defecto según la anotación
- problemas detallados de `LazyInitializationException`
- cómo forzar cargas explícitas en ciertos escenarios
- fetch joins
- entity graphs
- tuning fino de performance

Todo eso puede venir más adelante.

Por ahora, el objetivo principal es fijar la intuición correcta:

> cargar relaciones no es neutro; importa mucho cuándo y cómo se hace.

## Una intuición clave

Podés pensar así:

- relación eager → el sistema intenta traerla ya
- relación lazy → el sistema intenta dejarla para después
- ninguna de las dos opciones es automáticamente mágica
- ambas impactan en cómo se comporta la aplicación

Esa intuición ya te pone bastante por delante de muchos errores típicos.

## Un ejemplo del mundo real

Imaginá un sistema con:

- `Usuario`
- `Pedido`
- `PedidoItem`
- `Producto`
- `Categoria`

Si todo se cargara eager indiscriminadamente, podrías terminar con una cadena enorme de objetos traídos “por las dudas”.

En cambio, si todo fuera lazy sin criterio, podrías encontrarte con accesos diferidos que aparecen en momentos poco convenientes.

Por eso el diseño de relaciones y fetch necesita bastante intención.

## Qué papel vuelve a jugar el DTO

Otra vez, central.

Porque aunque las entidades tengan relaciones complejas, el DTO puede recortar y controlar muchísimo mejor la salida.

Por ejemplo, un `PedidoResponse` podría incluir:

- id
- número
- total
- nombre del usuario
- cantidad de ítems

sin necesidad de devolver toda la red completa de relaciones JPA.

Esto hace que la API sea mucho más estable y manejable.

## Un error muy común

Pensar:

> “si me da problemas acceder a la relación, le pongo eager y listo”

Eso es un parche mental típico, pero no siempre una buena solución.

A veces lo correcto no es cambiar la relación para todos los casos, sino diseñar mejor:

- el caso de uso
- la consulta
- el DTO
- el mapeo
- la forma en que obtenés los datos necesarios

## Otro error común

Pensar:

> “si es lazy, entonces nunca se va a cargar salvo que yo haga algo raro”

No exactamente.

Si accedés a la relación, aunque sea indirectamente, esa carga puede activarse.
Y serializar JSON, mapear DTOs o recorrer colecciones puede ser justamente ese acceso.

## Otro error común

No pensar en colecciones como focos sensibles.

Una relación `@ManyToOne` hacia un solo objeto ya importa.
Pero una `@OneToMany` hacia una colección puede tener un impacto muchísimo mayor en carga y volumen.

Eso merece especial cuidado.

## Una buena heurística

Podés pensar así:

- cuanto más grande o más navegable sea la relación, más importante es pensar bien su estrategia de carga
- cuanto más pública sea la respuesta HTTP, más importante es no depender de entidades directas
- cuanto más realista sea el dominio, menos conviene confiar en defaults sin entender qué implican

## Qué relación tiene esto con la mantenibilidad

Muy fuerte.

Cuando entendés fetch, dejás de sorprenderte tanto con comportamientos del tipo:

- “¿por qué esta respuesta vino enorme?”
- “¿por qué tocar este getter cambió tanto?”
- “¿por qué ahora se serializa medio grafo?”
- “¿por qué este endpoint parece traer más de lo necesario?”

Eso hace que el backend sea mucho más predecible de mantener.

## Relación con Spring Boot

Spring Boot facilita mucho trabajar con JPA, pero esa comodidad también puede hacer que al principio uno use relaciones sin pensar demasiado en cómo se cargan.

Entender `LAZY` y `EAGER` te ayuda justamente a recuperar conciencia sobre una parte muy importante del comportamiento real del modelo persistente.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> `fetch = LAZY` y `fetch = EAGER` definen cuándo y cómo se cargan las relaciones entre entidades, y entender esa diferencia es clave para evitar tanto cargas innecesarias como respuestas problemáticas cuando el modelo JPA empieza a tener vínculos reales y estructuras más profundas.

## Resumen

- `fetch` define la estrategia de carga de una relación.
- `LAZY` intenta diferir la carga hasta que realmente se necesite.
- `EAGER` intenta cargar la relación junto con la entidad principal.
- Esta decisión impacta en volumen de datos, comportamiento del modelo y diseño de respuestas.
- Las relaciones bidireccionales y la serialización JSON vuelven este tema todavía más importante.
- DTOs y diseño cuidadoso del caso de uso ayudan a controlar mejor qué relaciones se acceden y qué se expone.
- Entender fetch evita muchos comportamientos sorpresivos al trabajar con JPA en aplicaciones reales.

## Próximo tema

En el próximo tema vas a ver cómo usar Flyway o una estrategia equivalente de migraciones para versionar cambios en la base de datos, y ahí empieza el bloque donde el esquema deja de ser algo que “cambia a mano” para pasar a formar parte controlada de la evolución del proyecto.
