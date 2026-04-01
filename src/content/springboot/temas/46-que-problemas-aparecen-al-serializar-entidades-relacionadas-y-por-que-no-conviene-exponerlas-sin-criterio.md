---
title: "Qué problemas aparecen al serializar entidades relacionadas y por qué no conviene exponerlas sin criterio"
description: "Entender por qué las entidades JPA relacionadas pueden generar problemas al serializarse como JSON y cómo conceptos como lazy loading, recursión y relaciones bidireccionales refuerzan la necesidad de usar DTOs con cuidado."
order: 46
module: "Persistencia con Spring Data JPA"
level: "base"
draft: false
---

En el tema anterior viste cómo modelar relaciones entre entidades con:

- `@ManyToOne`
- `@OneToMany`
- `mappedBy`
- `@JoinColumn`

Eso te permitió pasar de entidades aisladas a un modelo mucho más realista.

Pero en cuanto empiezan a existir relaciones entre entidades, aparece un problema muy importante que muchísima gente descubre “a los golpes”:

> si devuelvo entidades JPA directamente como JSON, pueden empezar a pasar cosas raras, costosas o directamente problemáticas.

Y esas cosas raras suelen venir de una combinación de factores como:

- relaciones bidireccionales
- serialización automática a JSON
- lazy loading
- estructuras recursivas
- exposición de demasiada información
- acoplamiento entre persistencia y API

Este tema es clave porque te ayuda a entender por qué, a medida que el modelo crece, devolver entidades JPA sin criterio suele dejar de ser una buena idea.

## El punto de partida: una entidad aislada parece inocente

Supongamos una entidad simple:

```java
@Entity
public class Categoria {

    @Id
    @GeneratedValue
    private Long id;

    private String nombre;

    // getters y setters
}
```

Si la devolvés desde un endpoint así:

```java
@GetMapping("/categorias/{id}")
public Categoria obtener(@PathVariable Long id) {
    return categoriaService.obtenerEntidad(id);
}
```

quizá al principio todo parece ir bien.

Porque la entidad es simple:

- tiene pocos campos
- no tiene relaciones
- no hay estructuras profundas
- no hay ciclos aparentes

Entonces la serialización a JSON puede parecer totalmente natural.

## El problema empieza cuando aparecen relaciones

Ahora imaginá esto:

### Categoria

```java
@Entity
public class Categoria {

    @Id
    @GeneratedValue
    private Long id;

    private String nombre;

    @OneToMany(mappedBy = "categoria")
    private List<Producto> productos;

    // getters y setters
}
```

### Producto

```java
@Entity
public class Producto {

    @Id
    @GeneratedValue
    private Long id;

    private String titulo;

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    // getters y setters
}
```

A nivel del modelo JPA esto puede estar bien.
Pero si devolvés una de estas entidades directamente como JSON, empiezan a aparecer riesgos importantes.

## Primer problema: recursión infinita

Este es uno de los más famosos.

Imaginá que devolvés una `Categoria`.

Spring intenta serializarla a JSON.

Entonces ve:

- `id`
- `nombre`
- `productos`

Y cuando entra en `productos`, cada `Producto` tiene:

- `id`
- `titulo`
- `categoria`

Y esa `categoria` vuelve a tener:

- `id`
- `nombre`
- `productos`

Y así sucesivamente.

El resultado conceptual es algo como:

- categoria
  - productos
    - producto
      - categoria
        - productos
          - producto
            - categoria
              - ...

Eso puede convertirse en un ciclo recursivo enorme o directamente problemático para la serialización.

## Por qué pasa esto

Porque desde el punto de vista de los objetos, ambos lados se conocen:

- la categoría conoce sus productos
- el producto conoce su categoría

Pero al serializar a JSON, ese grafo de objetos empieza a expandirse sin una frontera clara si no tomás medidas.

Y JSON, por sí solo, no “entiende” naturalmente dónde debería cortar esa recursión a nivel de diseño de tu API.

## Un ejemplo mental de respuesta peligrosa

Si no hubiera control, algo como esto:

```json
{
  "id": 1,
  "nombre": "Electrónica",
  "productos": [
    {
      "id": 10,
      "titulo": "Notebook",
      "categoria": {
        "id": 1,
        "nombre": "Electrónica",
        "productos": [
          {
            "id": 10,
            "titulo": "Notebook",
            "categoria": {
              ...
            }
          }
        ]
      }
    }
  ]
}
```

No hace falta que esto llegue exactamente a esta forma visible para que el problema exista.
La idea importante es que la estructura puede volverse recursiva y muy difícil de controlar.

## Segundo problema: exponer demasiado del dominio

Aunque no hubiera recursión, devolver entidades relacionadas puede hacer que la API exponga mucha más información de la necesaria.

Por ejemplo, al devolver un `Producto`, quizá solo querías mostrar:

- id
- título
- precio
- nombre de categoría

Pero si devolvés la entidad entera con sus relaciones, podrías terminar exponiendo:

- la categoría completa
- la lista de todos los productos de esa categoría
- relaciones secundarias
- flags internos
- campos técnicos
- datos que el cliente ni pidió ni necesitaba

Eso hace la respuesta:

- más pesada
- más acoplada al modelo persistente
- menos clara
- más difícil de mantener

## Tercer problema: lazy loading

Acá entra un concepto muy importante de JPA.

Muchas relaciones no se cargan inmediatamente con todos sus datos.
En muchos casos, JPA usa carga diferida, conocida como **lazy loading**.

La idea general es esta:

> una relación no siempre se trae completamente de inmediato; a veces se deja como algo que se cargará solo si realmente se accede.

Esto puede ser muy útil desde el punto de vista de persistencia.
Pero combinado con serialización JSON puede traer problemas.

## Cómo pensar el lazy loading sin entrar aún en todos los detalles técnicos

Podés imaginártelo así:

- tenés un `Producto`
- ese producto tiene una `Categoria`
- JPA no necesariamente cargó toda la categoría todavía
- solo sabe que existe una relación
- si en algún momento alguien intenta acceder a ella, puede dispararse la carga real

Eso puede ser bueno para performance y diseño interno.
Pero si serializar a JSON obliga a recorrer todas las relaciones, ese acceso puede ocurrir automáticamente sin que vos lo hayas planeado explícitamente.

## Qué problema trae eso

Que al devolver una entidad como JSON, el proceso de serialización puede tocar getters y relaciones que vos no pensabas usar directamente.

Y eso puede causar cosas como:

- consultas extra inesperadas
- carga de relaciones que no querías exponer
- errores si el contexto de persistencia ya no está disponible
- respuestas más costosas de lo esperado

Aunque todavía no hace falta profundizar en todos los matices técnicos, conviene sembrar esta intuición:

> devolver una entidad JPA no es lo mismo que devolver un POJO plano e inocente.

Puede haber comportamiento implícito detrás.

## Cuarto problema: respuestas impredecibles o acopladas

Si la API devuelve entidades directamente, el contrato público empieza a depender demasiado de cómo están modeladas internamente las entidades JPA.

Eso significa que cambios internos como:

- agregar una relación
- renombrar una propiedad
- sumar un campo técnico
- modificar una estructura de persistencia

pueden terminar afectando la forma en que responde la API.

Y eso es una mala señal de acoplamiento.

La API pública debería poder evolucionar con cierta independencia respecto de la estructura interna de persistencia.

## Un ejemplo muy claro del problema de acoplamiento

Supongamos que hoy devolvés esta entidad:

```java
@Entity
public class Usuario {

    @Id
    @GeneratedValue
    private Long id;

    private String nombre;
    private String email;
}
```

Y tu endpoint devuelve eso tal cual.

Pero mañana la entidad cambia a:

```java
@Entity
public class Usuario {

    @Id
    @GeneratedValue
    private Long id;

    private String nombre;
    private String email;
    private boolean activo;

    @OneToMany(mappedBy = "usuario")
    private List<Pedido> pedidos;
}
```

De repente, sin haber repensado realmente el contrato del endpoint, podrías estar exponiendo:

- un nuevo campo `activo`
- una relación `pedidos`
- más estructura
- más volumen
- nuevos riesgos de serialización

Eso muestra que el contrato HTTP quedó demasiado atado a la entidad.

## Quinto problema: entidades no son DTOs

Esto conecta directamente con el tema 39.

Una entidad JPA:

- representa persistencia
- puede tener relaciones
- puede tener campos internos
- puede tener comportamiento ligado al contexto JPA

En cambio, un DTO de respuesta:

- representa lo que querés mostrar
- puede recortar campos
- puede aplanar relaciones
- puede evitar ciclos
- puede ser mucho más estable como contrato

Por eso, a medida que el modelo crece, la idea de “devolver entidades directamente” suele volverse cada vez menos conveniente.

## Un ejemplo más sano: usar DTOs de respuesta

En lugar de devolver `Producto` directamente, podrías definir algo como:

```java
public class ProductoResponse {

    private Long id;
    private String titulo;
    private double precio;
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

    public double getPrecio() {
        return precio;
    }

    public void setPrecio(double precio) {
        this.precio = precio;
    }

    public String getCategoriaNombre() {
        return categoriaNombre;
    }

    public void setCategoriaNombre(String categoriaNombre) {
        this.categoriaNombre = categoriaNombre;
    }
}
```

Y mapear desde la entidad:

```java
public ProductoResponse toResponse(Producto producto) {
    ProductoResponse response = new ProductoResponse();
    response.setId(producto.getId());
    response.setTitulo(producto.getTitulo());
    response.setPrecio(producto.getPrecio());

    if (producto.getCategoria() != null) {
        response.setCategoriaNombre(producto.getCategoria().getNombre());
    }

    return response;
}
```

Ahora el contrato es mucho más claro y controlado.

## Qué gana la API con esto

Muchísimo.

Porque ahora decidís explícitamente:

- qué campos salen
- qué relaciones se resumen
- qué nivel de profundidad querés exponer
- cómo evitar ciclos
- qué contrato querés mantener estable

Esto mejora:

- claridad
- performance conceptual
- independencia entre capas
- mantenibilidad
- legibilidad de la respuesta

## Un ejemplo de recorte intencional

Supongamos estas entidades:

### Usuario
- id
- nombre
- email
- pedidos

### Pedido
- id
- numero
- total
- usuario

Si querés devolver pedidos en un endpoint, probablemente no quieras que cada pedido devuelva a su vez todo el usuario con todos sus pedidos, y así sucesivamente.

Un DTO sano podría ser:

```java
public class PedidoResponse {

    private Long id;
    private String numero;
    private double total;
    private String nombreUsuario;

    // getters y setters
}
```

Eso evita muchísima complejidad innecesaria.

## Qué pasa con respuestas anidadas controladas

Usar DTOs no significa que todo tenga que volverse plano al extremo.

A veces querés estructuras anidadas, pero controladas.

Por ejemplo:

```java
public class CategoriaResumenResponse {

    private Long id;
    private String nombre;

    // getters y setters
}
```

```java
public class ProductoResponse {

    private Long id;
    private String titulo;
    private CategoriaResumenResponse categoria;

    // getters y setters
}
```

Esto sigue siendo muchísimo más sano que devolver la entidad completa con toda su red de relaciones.

Porque vos decidís exactamente qué entra en el resumen de la categoría.

## ¿Entonces nunca debería devolver una entidad?

No hace falta ser dogmático.

En ejemplos muy pequeños, prototipos o casos totalmente controlados, devolver una entidad simple puede ser tolerable.

Pero la idea importante del tema es esta:

> cuanto más crece el modelo y más relaciones aparecen, menos razonable suele ser exponer entidades JPA directamente como contrato público de la API.

Entonces no se trata de prohibirlo por religión.
Se trata de entender bien los riesgos y elegir con criterio.

## Qué relación tiene esto con lazy loading de forma práctica

Aunque todavía no estés estudiando a fondo estrategias de carga, ya conviene quedarte con esta intuición:

si una entidad tiene relaciones y esas relaciones pueden cargarse bajo demanda, la serialización automática puede tocar cosas que disparen comportamiento persistente no obvio.

Eso puede volver la respuesta:

- más pesada
- menos predecible
- más acoplada al contexto JPA
- más frágil

Con DTOs, en cambio, vos controlás mucho mejor qué se lee y qué se expone.

## Qué relación tiene esto con relaciones bidireccionales

Muy directa.

Las relaciones bidireccionales son especialmente propensas a generar estructuras recursivas si se serializan sin estrategia.

Por eso, cuanto más uses ambos lados:

- `@ManyToOne`
- `@OneToMany`

más importante se vuelve pensar bien qué objetos estás devolviendo por la API.

## Un ejemplo del flujo sano

Un flujo mucho más sano suele ser este:

1. el repository trae entidades
2. el service decide qué caso de uso ejecutar
3. el mapper transforma entidades a DTOs
4. el controller devuelve los DTOs

Ese flujo:

- corta el acoplamiento directo entre JPA y API
- evita exponer relaciones enteras sin querer
- deja el contrato HTTP bajo control explícito

## Qué pasa si querés devolver “detalle” y no solo resúmenes

También se puede.

Podés tener distintos DTOs para distintos endpoints.

Por ejemplo:

- `ProductoResumenResponse`
- `ProductoDetalleResponse`

En uno devolvés:

- id
- título
- precio

En otro devolvés además:

- descripción
- stock
- categoría resumida

Eso sigue siendo mucho más claro que usar siempre la entidad como si tuviera que servir para todo.

## Qué gana el frontend con esto

El frontend suele agradecer muchísimo que la respuesta sea:

- estable
- razonable
- sin ciclos raros
- sin campos internos inesperados
- sin estructura excesiva

Porque eso hace más fácil:

- renderizar
- tipar
- consumir
- testear
- evolucionar la interfaz

## Qué relación tiene esto con la performance percibida

No hace falta entrar todavía en microoptimización.
Pero sí conviene entender algo sencillo:

si el backend devuelve estructuras más grandes de lo necesario, con relaciones profundas o cargas extra, eso impacta en:

- tamaño de respuesta
- trabajo de serialización
- claridad del contrato
- experiencia del cliente

Controlar el shape del JSON es parte de hacer una API mejor.

## Un ejemplo concreto de endpoint sano

```java
@RestController
@RequestMapping("/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponse> obtener(@PathVariable Long id) {
        ProductoResponse response = productoService.obtener(id);
        return ResponseEntity.ok(response);
    }
}
```

Service:

```java
@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final ProductoMapper productoMapper;

    public ProductoService(ProductoRepository productoRepository, ProductoMapper productoMapper) {
        this.productoRepository = productoRepository;
        this.productoMapper = productoMapper;
    }

    public ProductoResponse obtener(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ProductoNoEncontradoException("No existe el producto " + id));

        return productoMapper.toResponse(producto);
    }
}
```

Este diseño evita exponer la entidad directamente y pone al contrato HTTP bajo control explícito.

## Un buen mapa mental

Podés pensar así:

### Entidad JPA
- pensada para persistencia
- puede tener relaciones
- puede tener lazy loading
- puede cargar mucha estructura

### DTO de respuesta
- pensado para JSON de salida
- controla campos
- evita ciclos
- expresa el contrato de la API

Esta diferencia es central.

## Qué pasa con anotaciones especiales de serialización

Existen herramientas y anotaciones que pueden ayudar a controlar la serialización de entidades relacionadas.

Pero incluso sabiendo eso, la lección arquitectónica importante sigue siendo la misma:

> usar DTOs suele ser una estrategia más sana y más controlable que depender de serializar entidades JPA tal cual.

Más adelante podrías estudiar esas herramientas, pero este tema quiere dejar firme primero la idea de diseño.

## Error común: pensar que el problema es solo “la recursión”

La recursión es uno de los problemas más famosos, sí.

Pero no es el único.

También están:

- acoplamiento del contrato a la persistencia
- exposición de demasiados campos
- estructuras pesadas
- comportamiento implícito de carga
- dificultad para controlar el JSON final

Por eso la solución no es pensar solo en “cómo evitar el loop”.
También es pensar qué deberías exponer realmente.

## Error común: usar entidades bidireccionales y devolverlas directas “a ver si sale”

Eso suele ser una receta para problemas.

Cuando las relaciones empiezan a crecer, conviene tomar consciencia de que ya no estás serializando un POJO aislado, sino una red de objetos persistentes interconectados.

## Error común: creer que DTOs son solo burocracia

A veces se ven los DTOs como “más clases para complicar”.

Pero cuando el modelo crece y aparecen relaciones, los DTOs dejan de ser burocracia y pasan a ser una herramienta de control, claridad y diseño del contrato HTTP.

## Error común: intentar que la entidad sirva igual para persistencia y respuesta pública compleja

Cuanto más rico y relacional sea el modelo JPA, menos razonable suele ser pedirle a esa misma clase que además sea el contrato perfecto de salida hacia clientes externos.

Eso mezcla demasiadas preocupaciones.

## Relación con Spring Boot

Spring Boot facilita muchísimo tanto la persistencia con JPA como la serialización JSON.
Y justamente por esa comodidad, es fácil caer al principio en la tentación de “devuelvo la entidad y listo”.

Pero cuando aparecen relaciones, lazy loading y crecimiento del dominio, esa comodidad rápida suele empezar a chocar con problemas de diseño muy reales.

Entender este punto temprano te ahorra muchos dolores después.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> cuando las entidades JPA empiezan a relacionarse entre sí, devolverlas directamente como JSON puede traer recursión, carga implícita, exposición excesiva y acoplamiento entre persistencia y API, por lo que usar DTOs de salida se vuelve una forma mucho más segura y controlada de diseñar respuestas.

## Resumen

- Las entidades simples aisladas pueden parecer fáciles de serializar, pero las entidades relacionadas complican mucho el panorama.
- Las relaciones bidireccionales pueden generar recursión al serializar JSON.
- Lazy loading puede introducir comportamiento implícito no obvio durante la serialización.
- Exponer entidades directamente acopla demasiado la API al modelo persistente.
- Los DTOs de salida permiten controlar qué campos y qué relaciones se exponen.
- El problema no es solo técnico; también es de diseño de contrato HTTP.
- Este tema refuerza por qué entidades y DTOs no deberían mezclarse como si cumplieran el mismo rol.

## Próximo tema

En el próximo tema vas a ver cómo funcionan las transacciones con `@Transactional`, por qué son tan importantes cuando varias operaciones deben formar una unidad consistente y qué significa realmente que una operación se confirme o se revierta en la base de datos.
