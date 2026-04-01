---
title: "Cómo modelar una entidad con @Entity, @Id y @GeneratedValue"
description: "Entender qué es una entidad en JPA, cómo se marca con @Entity y qué papel cumplen @Id y @GeneratedValue al empezar a trabajar con persistencia en Spring Boot."
order: 40
module: "Persistencia con Spring Data JPA"
level: "base"
draft: false
---

Hasta ahora viste cómo estructurar una aplicación Spring Boot con:

- controllers
- services
- repositories
- DTOs
- validación
- manejo de errores
- separación de capas

Eso ya te permitió construir una API bastante sólida desde el punto de vista web y de arquitectura.

Pero todavía hay una gran pieza faltante para que la aplicación se vuelva realmente útil en muchos escenarios:

> guardar y recuperar datos desde una base de datos de forma estructurada.

Ahí entra JPA y, con ella, aparece un concepto central: la **entidad**.

En este tema vas a ver qué significa modelar una entidad, por qué se usa `@Entity` y qué papel cumplen `@Id` y `@GeneratedValue`.

Este es un paso muy importante porque marca el comienzo del bloque donde Spring Boot deja de trabajar solo con clases comunes y empieza a integrarse seriamente con persistencia.

## Qué problema resuelve una entidad

Supongamos que en tu aplicación tenés una clase como esta:

```java
public class Producto {

    private Long id;
    private String titulo;
    private double precio;
    private int stock;

    // getters y setters
}
```

Como clase Java, esto está bien.
Podés crear objetos, pasarlos entre capas y trabajar con ellos dentro del programa.

Pero si querés que esos datos puedan:

- guardarse en una base
- recuperarse más tarde
- actualizarse
- eliminarse
- participar en consultas persistentes

entonces esa clase necesita pasar a formar parte del modelo de persistencia.

Ahí entra el concepto de entidad.

## Qué es una entidad

Dicho de forma simple, una entidad es una clase que representa un objeto persistible del sistema.

En el contexto de JPA, una entidad es una clase cuyos objetos pueden mapearse a una estructura de persistencia, normalmente una tabla en una base relacional.

Podés pensarlo así:

> una entidad es una clase del modelo que JPA puede gestionar para guardar, buscar, actualizar y borrar datos.

No es simplemente “una clase con campos”.
Es una clase que el framework reconoce como parte del mundo persistente.

## Por qué no alcanza con una clase Java común

Porque una clase Java común no le dice nada especial a JPA.

Para que el framework la trate como entidad, hace falta marcarla explícitamente.

Esa marca principal es `@Entity`.

## Qué hace `@Entity`

`@Entity` indica que la clase debe ser tratada como entidad por JPA.

Ejemplo:

```java
import jakarta.persistence.Entity;

@Entity
public class Producto {
}
```

Con esto, conceptualmente le estás diciendo al sistema:

> esta clase forma parte del modelo persistente y quiero que JPA pueda gestionarla.

Ese es el primer paso para transformar una clase en algo que el framework pueda mapear hacia la base.

## La idea general del mapeo

Aunque más adelante profundizarás muchísimo más en JPA, conviene ya quedarte con esta intuición:

- clase → tabla
- campos → columnas
- instancia → fila o registro
- atributo identificador → clave primaria

No siempre el mapeo real es tan simple como una traducción exacta uno a uno, pero como imagen mental inicial funciona muy bien.

## Un ejemplo mínimo de entidad

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
    private double precio;
    private int stock;

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

Este ejemplo ya muestra los tres elementos centrales del tema:

- `@Entity`
- `@Id`
- `@GeneratedValue`

## Qué hace `@Id`

Toda entidad necesita un identificador.

Ese identificador sirve para distinguir una instancia de otra dentro del modelo persistente.

`@Id` marca el campo que cumple el rol de clave primaria o identificador principal.

Por ejemplo:

```java
@Id
private Long id;
```

Esto le dice a JPA:

> este campo identifica de forma principal a la entidad.

## Por qué una entidad necesita un identificador

Porque si el sistema va a persistir y recuperar objetos, necesita una forma clara de distinguirlos.

Por ejemplo:

- producto 1
- producto 2
- usuario 10
- pedido 53

Sin un identificador, sería mucho más difícil representar correctamente operaciones como:

- buscar uno específico
- actualizar uno existente
- eliminar uno concreto
- comparar identidad persistente

Por eso el id no es un detalle secundario.
Es una pieza central del modelo persistente.

## Qué tipo suele usarse como id

Al empezar, uno de los tipos más frecuentes es `Long`.

Por ejemplo:

```java
@Id
private Long id;
```

Esto es muy común porque funciona bien para identificadores numéricos generados.

Más adelante vas a ver que existen otras estrategias posibles, como UUIDs, ids naturales o claves compuestas, pero para arrancar `Long` suele ser una base excelente.

## Qué hace `@GeneratedValue`

`@GeneratedValue` indica que el valor del id puede generarse automáticamente.

Por ejemplo:

```java
@Id
@GeneratedValue
private Long id;
```

Con esto, la idea general es:

> no quiero asignar manualmente el id cada vez; quiero que el sistema de persistencia o la estrategia configurada se encargue de generarlo.

Esto es muy útil porque en muchísimos casos el identificador no debería ser responsabilidad del cliente ni del controlador.

## Por qué suele ser buena idea generar el id automáticamente

Porque normalmente, al crear un recurso nuevo, el cliente manda cosas como:

- título
- precio
- stock
- nombre
- email

pero no debería tener que decidir el id persistente real.

Ese id suele pertenecer al sistema y a su mecanismo de almacenamiento.

Por eso `@GeneratedValue` resulta tan natural en muchísimos diseños iniciales.

## Un ejemplo típico de creación

Supongamos un request DTO así:

```java
public class CrearProductoRequest {

    private String titulo;
    private double precio;
    private int stock;

    // getters y setters
}
```

Acá el cliente no manda id.
Y eso está bien.

La entidad podría ser:

```java
@Entity
public class Producto {

    @Id
    @GeneratedValue
    private Long id;

    private String titulo;
    private double precio;
    private int stock;

    // getters y setters
}
```

El cliente crea el producto sin id.
Luego el sistema persiste la entidad.
Y el id se genera automáticamente.

Ese flujo es extremadamente común.

## Qué relación hay entre request DTO y entidad

Esto conecta directamente con el tema anterior.

El request DTO representa lo que entra desde la API.
La entidad representa lo que JPA va a persistir.

No tienen por qué ser exactamente iguales.

De hecho, muchas veces es buena señal que no lo sean.

Por ejemplo:

- el request no trae id
- la entidad sí tiene id
- la entidad puede tener campos internos adicionales
- la respuesta puede mostrar solo parte de todo eso

## Una buena comparación

### Request DTO
```java
public class CrearUsuarioRequest {
    private String nombre;
    private String email;
    private String password;
}
```

### Entidad
```java
@Entity
public class Usuario {

    @Id
    @GeneratedValue
    private Long id;

    private String nombre;
    private String email;
    private String passwordHash;
    private boolean activo;
}
```

Ya se ve clarísimo que no cumplen exactamente el mismo rol.

## Qué pasa si no ponés `@Id`

En términos prácticos, una entidad sin identificador definido no encaja bien con el modelo que JPA espera.

Conceptualmente, una entidad necesita una identidad persistente.
Por eso `@Id` no es algo opcional decorativo.

Es parte estructural de la definición de la entidad.

## Qué pasa si no usás `@GeneratedValue`

No significa automáticamente que la entidad esté mal.

Podrías tener escenarios donde decidís manejar el id manualmente.

Pero al empezar, en la mayoría de los casos comunes de CRUD, dejar que el id se genere automáticamente suele ser lo más natural y cómodo.

Más adelante vas a ver estrategias más finas de generación y distintos casos de uso.

## Una intuición importante sobre identidad

El id no siempre es lo mismo que “toda la igualdad de negocio” de un objeto.

Por ejemplo, dos usuarios distintos pueden tener emails distintos y ids distintos.
Pero el id persistente cumple un rol muy concreto:
identificar de manera principal la entidad dentro del sistema de persistencia.

Es decir, el id ayuda a JPA a ubicar y gestionar esa entidad.
No necesariamente expresa toda la riqueza del dominio por sí solo.

## Cómo pensar una entidad al empezar

Una forma muy útil de pensarla es esta:

> una entidad representa un recurso del dominio que el sistema quiere persistir y reconocer individualmente a lo largo del tiempo.

Por ejemplo:

- Usuario
- Producto
- Pedido
- Categoria
- Cliente
- Factura

Todas esas ideas suelen tener muy buen encaje como entidades.

## Qué tipo de clases suelen convertirse en entidades

Suelen ser buenos candidatos a entidad los objetos que:

- tienen identidad propia
- viven más allá de una sola llamada o request
- necesitan persistirse
- pueden recuperarse y modificarse
- representan algo importante del dominio

En cambio, objetos como DTOs de request, respuestas temporales o estructuras puramente técnicas no suelen ser entidades.

## Un ejemplo más completo

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
    private String descripcion;
    private boolean activa;

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public boolean isActiva() {
        return activa;
    }

    public void setActiva(boolean activa) {
        this.activa = activa;
    }
}
```

Esta clase ya se ve bastante cercana a una entidad real que luego podría terminar en base de datos.

## Por qué el id muchas veces no tiene setter público o no se usa desde afuera

En varios proyectos, el id se trata como algo que no debería modificarse libremente desde cualquier lado, especialmente si es generado.

No siempre es obligatorio esconderlo totalmente, pero sí conviene entender que el id generado no suele ser un dato que el cliente de la API deba controlar.

Eso refuerza la idea de separar request DTOs y entidades.

## Qué todavía no estás viendo

En este tema todavía no estás entrando en:

- tablas concretas
- columnas personalizadas
- relaciones
- estrategias exactas de generación
- equals y hashCode
- lazy loading
- cascadas
- transacciones
- repositorios Spring Data JPA

Todo eso va a venir después.

Ahora el objetivo es consolidar bien el núcleo:

- qué es una entidad
- por qué necesita `@Id`
- por qué muchas veces conviene `@GeneratedValue`

## Una relación muy importante con el repository

Cuando empieces a trabajar con Spring Data JPA, los repositories van a operar naturalmente sobre entidades.

Por ejemplo, conceptualmente:

- guardar un `Producto`
- buscar un `Producto` por id
- listar `Producto`
- eliminar un `Producto`

Eso hace todavía más importante entender qué es una entidad y por qué ocupa ese lugar central dentro del modelo persistente.

## Qué relación tiene esto con la base de datos

La entidad es la forma en que el mundo Java y el mundo de la base de datos empiezan a encontrarse.

Todavía no estás viendo el detalle exacto del mapeo completo, pero ya sí podés entender esta idea:

- la aplicación trabaja con objetos
- la base trabaja con estructuras persistentes
- JPA ayuda a conectar ambos mundos
- la entidad es una pieza central en esa conexión

## Un ejemplo de flujo completo, todavía conceptual

1. el cliente manda un request para crear un producto
2. el controller recibe un `CrearProductoRequest`
3. el service transforma eso a una entidad `Producto`
4. el repository persiste el `Producto`
5. el sistema genera un `id`
6. luego la app devuelve una respuesta con ese nuevo recurso

Este flujo muestra muy bien por qué entidad, DTO y persistencia no deberían confundirse como si fueran la misma cosa exacta.

## Una buena pregunta para saber si una clase debería ser entidad

Podés preguntarte:

- ¿esto representa algo del dominio que quiero guardar?
- ¿necesita identidad propia persistente?
- ¿voy a querer recuperarlo, modificarlo o eliminarlo después?
- ¿vive más allá de un request aislado?

Si la respuesta es sí, probablemente estés frente a una buena candidata a entidad.

## Qué no conviene hacer

No conviene pensar que cualquier clase del proyecto debería ser entidad solo porque tiene campos.

Por ejemplo, no suelen ser entidades:

- request DTOs
- response DTOs
- objetos de error de API
- estructuras técnicas de configuración
- modelos temporales de transferencia

Ser entidad no significa solo “ser una clase con datos”.
Significa jugar un papel persistente en el modelo del sistema.

## Qué relación tiene esto con el diseño limpio

Modelar bien las entidades ayuda a:

- separar mejor persistencia de API
- evitar mezclar request/response con base de datos
- pensar mejor la identidad de los objetos
- preparar el terreno para repositories y JPA real
- hacer que el modelo del sistema sea más explícito

Por eso este tema no es un detalle técnico aislado.
Es parte del diseño general de la aplicación.

## Error común: usar entidades como request y response “porque total ya tienen los campos”

Esto ya lo viste en el tema anterior, pero ahora cobra todavía más importancia.

Cuando la clase ya es entidad JPA, mezclarla con el contrato web puede traer todavía más problemas porque la acoplás a persistencia, mapeos y detalles que no siempre querés exponer.

## Error común: dejar que el cliente mande el id cuando debería generarse solo

Si el id es generado automáticamente, no suele tener sentido que el request de creación lo traiga como si fuera un dato controlado por el cliente.

Eso puede volver el contrato más confuso e incluso menos seguro.

## Error común: pensar que @GeneratedValue es obligatorio en todos los casos del universo

No lo es.

Pero para un curso que empieza desde cero y para muchísimos CRUDs típicos, es una elección muy natural y recomendable.

Más adelante ya verás cuándo conviene explorar otras estrategias.

## Error común: creer que la entidad es solo una bolsa de campos sin identidad conceptual

La entidad no es solo “la clase que después mapeo a la tabla”.
También representa una decisión de modelado:
qué cosas del dominio tienen identidad persistente y merecen ser tratadas como recursos durables del sistema.

## Relación con Spring Boot

Spring Boot, junto con Spring Data JPA, hace muy cómodo empezar a trabajar con entidades porque te permite conectar el modelo Java con persistencia sin tener que escribir toda la infraestructura manualmente.

Pero justamente por esa comodidad, conviene entender bien qué significa una entidad y no tratarla como una simple clase cualquiera.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> una entidad marcada con `@Entity` representa un objeto persistente del sistema, `@Id` define su identidad principal y `@GeneratedValue` suele permitir que esa identidad se genere automáticamente, sentando la base para que Spring Data JPA pueda guardar y recuperar esos objetos de forma natural.

## Resumen

- `@Entity` marca una clase como parte del modelo persistente gestionado por JPA.
- `@Id` define el identificador principal de la entidad.
- `@GeneratedValue` permite generar ese identificador automáticamente en muchos casos comunes.
- Las entidades no cumplen el mismo rol que los DTOs de request o response.
- Modelar bien una entidad ayuda a preparar el terreno para trabajar con persistencia real.
- El id es una pieza central de la identidad persistente del objeto.
- Este tema marca el comienzo formal del bloque de acceso a datos con JPA en Spring Boot.

## Próximo tema

En el próximo tema vas a ver cómo funciona un repository de Spring Data JPA con `JpaRepository`, y ahí empieza la parte donde ya no solo definís entidades, sino que además aprendés a guardarlas, buscarlas, listarlas y borrarlas con muy poco código.
