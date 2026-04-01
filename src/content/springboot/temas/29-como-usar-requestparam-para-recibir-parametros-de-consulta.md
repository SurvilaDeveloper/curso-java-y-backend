---
title: "Cómo usar @RequestParam para recibir parámetros de consulta"
description: "Entender cómo funciona @RequestParam en Spring Boot, cuándo conviene usarlo y en qué se diferencia de capturar valores directamente desde la ruta con @PathVariable."
order: 29
module: "Spring Web y APIs REST"
level: "base"
draft: false
---

En el tema anterior viste cómo usar `@PathVariable` para capturar valores variables dentro de la ruta.

Eso te permitió trabajar con URLs como:

- `/usuarios/10`
- `/productos/25`
- `/pedidos/100`

Ese mecanismo es fundamental cuando el valor forma parte de la identidad del recurso.

Pero una API real no solo recibe datos desde la ruta.

Muy pronto aparecen necesidades como estas:

- buscar usuarios por nombre
- filtrar productos por categoría
- paginar resultados
- ordenar una lista
- activar un modo opcional de consulta
- pedir solo ciertos datos

Y esas necesidades suelen expresarse de esta forma:

- `/usuarios?activo=true`
- `/productos?categoria=hardware`
- `/pedidos?page=0&size=20`
- `/articulos?autor=gabriel&orden=desc`

La pregunta entonces es:

> ¿cómo se leen esos valores que vienen después del signo `?` en la URL?

Spring Boot resuelve eso con `@RequestParam`.

## Qué problema resuelve `@RequestParam`

Cuando hacés una petición como esta:

```text
GET /productos?categoria=hardware
```

la URL tiene dos partes conceptualmente distintas:

- la ruta: `/productos`
- el parámetro de consulta: `categoria=hardware`

Ese segundo dato no está identificando al recurso como tal.
Más bien está **ajustando la consulta** o agregando información adicional sobre cómo querés recuperar los datos.

`@RequestParam` sirve justamente para leer ese tipo de valores.

Dicho de forma simple:

> `@RequestParam` permite capturar parámetros de consulta que vienen en la URL después del signo `?`.

## Qué es un query parameter

Un query parameter, o parámetro de consulta, es un valor que se envía en la URL para modificar, filtrar o complementar una petición.

Por ejemplo:

```text
/productos?categoria=hardware
```

Acá:

- `categoria` es el nombre del parámetro
- `hardware` es su valor

Y si hay varios:

```text
/productos?categoria=hardware&stock=true&orden=asc
```

entonces tenés múltiples parámetros dentro de la misma petición.

## La idea general

Para usar `@RequestParam`, normalmente hacés esto:

1. definís un parámetro en la URL
2. declarás un parámetro del método con `@RequestParam`
3. Spring lo toma desde la petición y lo inyecta

Por ejemplo:

```java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProductoController {

    @GetMapping("/productos")
    public String listarPorCategoria(@RequestParam String categoria) {
        return "Categoría: " + categoria;
    }
}
```

Si llamás:

```text
GET /productos?categoria=hardware
```

el método recibe:

```java
categoria = "hardware"
```

## Cómo leer este ejemplo

```java
@GetMapping("/productos")
public String listarPorCategoria(@RequestParam String categoria) {
    return "Categoría: " + categoria;
}
```

Podés leerlo así:

- el endpoint sigue siendo `/productos`
- el cliente agrega un parámetro llamado `categoria`
- Spring busca ese parámetro en la query string
- lo inyecta en el método
- el controlador lo usa

La ruta no cambió.
Lo que cambió fue el contexto o criterio de consulta.

## Por qué esto es tan importante

Porque muchísimas APIs necesitan recibir datos que no forman parte de la identidad del recurso, sino de la forma en que se quiere consultar o procesar la información.

Por ejemplo:

- filtrar
- buscar
- paginar
- ordenar
- activar opciones
- limitar resultados
- definir comportamiento opcional

Todo eso suele encajar muy bien con query params.

## Diferencia fundamental con `@PathVariable`

Este es el punto más importante del tema.

### `@PathVariable`
Suele usarse cuando el valor forma parte de la identidad o ubicación del recurso dentro de la URL.

Ejemplo:

```text
/usuarios/10
```

Acá `10` representa un usuario específico.

### `@RequestParam`
Suele usarse cuando el valor ajusta o complementa la consulta.

Ejemplo:

```text
/usuarios?activo=true
```

Acá `activo=true` no identifica un usuario concreto.
Solo modifica el criterio de consulta.

## Una forma simple de pensarlo

Podés resumirlo así:

- **ruta** → qué recurso querés
- **query params** → cómo querés consultarlo o con qué opciones

Esta distinción te va a acompañar constantemente al diseñar APIs.

## Un ejemplo básico de búsqueda

```java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UsuarioController {

    @GetMapping("/usuarios")
    public String buscarUsuarios(@RequestParam String nombre) {
        return "Buscando usuarios con nombre: " + nombre;
    }
}
```

Si llamás:

```text
GET /usuarios?nombre=Gabriel
```

el método recibe `"Gabriel"`.

## También puede ser un parámetro numérico

```java
@GetMapping("/productos")
public String limitarResultados(@RequestParam int limite) {
    return "Límite: " + limite;
}
```

Y la llamada:

```text
GET /productos?limite=20
```

haría que `limite` valga `20`.

Spring puede convertir el texto recibido al tipo adecuado, igual que pasaba con `@PathVariable`.

## Un ejemplo con varios parámetros

```java
@GetMapping("/productos")
public String buscarProductos(
    @RequestParam String categoria,
    @RequestParam boolean disponible,
    @RequestParam int limite
) {
    return "Categoría: " + categoria + ", disponible: " + disponible + ", límite: " + limite;
}
```

Llamada:

```text
GET /productos?categoria=hardware&disponible=true&limite=10
```

Acá Spring recupera los tres valores desde la query string.

## Cómo se escriben varios query params

Cuando hay más de uno, la estructura suele ser así:

```text
?param1=valor1&param2=valor2&param3=valor3
```

Por ejemplo:

```text
/productos?categoria=hardware&stock=true&page=0&size=20
```

Cada par nombre-valor va separado por `&`.

## ¿Qué cosas suelen modelarse con `@RequestParam`?

Muchísimas.

Por ejemplo:

- filtros
- búsqueda por texto
- paginación
- ordenamiento
- flags opcionales
- rangos
- modo de respuesta
- selección de formato
- parámetros técnicos de consulta

Es una herramienta central en cualquier API con listados o búsquedas.

## Un caso muy típico: paginación

Aunque más adelante lo verás con más detalle, desde ya conviene reconocer este patrón:

```text
GET /productos?page=0&size=20
```

o:

```java
@GetMapping("/productos")
public String listar(
    @RequestParam int page,
    @RequestParam int size
) {
    return "Página " + page + ", tamaño " + size;
}
```

Esto es muy típico en APIs reales.

## Otro caso típico: ordenamiento

```text
GET /productos?sort=precio&direction=asc
```

o:

```java
@GetMapping("/productos")
public String ordenar(
    @RequestParam String sort,
    @RequestParam String direction
) {
    return "Ordenando por " + sort + " en dirección " + direction;
}
```

Otra vez, el query param no identifica un recurso.
Solo modifica la forma de consultar.

## Parámetros opcionales

Un punto muy importante es que un query param no siempre tiene que ser obligatorio.

Por ejemplo, a veces querés que el cliente pueda pasar un filtro, pero que el endpoint también funcione si ese filtro no está presente.

Para eso podés indicar que el parámetro no sea obligatorio.

Ejemplo:

```java
@GetMapping("/productos")
public String listar(@RequestParam(required = false) String categoria) {
    return "Categoría: " + categoria;
}
```

Con esto, el endpoint puede llamarse tanto con:

```text
GET /productos?categoria=hardware
```

como con:

```text
GET /productos
```

## Qué significa `required = false`

Normalmente, si declarás:

```java
@RequestParam String categoria
```

Spring espera que el parámetro exista.

Pero si escribís:

```java
@RequestParam(required = false) String categoria
```

entonces le estás diciendo:

> este parámetro puede faltar.

En ese caso, si no se envía, el valor suele llegar como `null` si el tipo lo permite.

## Un ejemplo con parámetro opcional

```java
@GetMapping("/articulos")
public String listarArticulos(@RequestParam(required = false) String autor) {
    if (autor == null) {
        return "Listado general de artículos";
    }
    return "Listado de artículos del autor: " + autor;
}
```

Esto ya muestra una diferencia importante entre:

- parámetro ausente
- parámetro presente

## Valores por defecto

Además de hacer un parámetro opcional, también podés darle un valor por defecto.

Ejemplo:

```java
@GetMapping("/productos")
public String listar(@RequestParam(defaultValue = "0") int page) {
    return "Página " + page;
}
```

Si el cliente no manda `page`, Spring usa `0`.

Esto resulta muy útil en escenarios como:

- paginación
- orden por defecto
- flags opcionales
- límites estándar

## Un ejemplo con varios defaults

```java
@GetMapping("/productos")
public String listar(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size,
    @RequestParam(defaultValue = "nombre") String sort
) {
    return "page=" + page + ", size=" + size + ", sort=" + sort;
}
```

Esto ya se parece mucho más a un endpoint real de listado.

## Nombre explícito del parámetro

Igual que con `@PathVariable`, también podés indicar explícitamente el nombre.

```java
@GetMapping("/usuarios")
public String buscar(@RequestParam("nombre") String nombreUsuario) {
    return "Nombre: " + nombreUsuario;
}
```

Acá el query param se llama `nombre`, pero la variable Java se llama `nombreUsuario`.

Esto puede mejorar la claridad interna del código.

## Cuándo conviene usar nombre explícito

Suele ser útil cuando:

- el nombre del parámetro Java no coincide con el de la URL
- querés más expresividad dentro del código
- seguís una convención de nombres interna distinta

Ejemplo:

```java
@GetMapping("/pedidos")
public String listarPorEstado(@RequestParam("estado") String estadoPedido) {
    return "Estado: " + estadoPedido;
}
```

## Tipos comunes que puede manejar

`@RequestParam` suele trabajar bien con tipos comunes como:

- `String`
- `Integer`
- `Long`
- `Boolean`
- `Double`

Por ejemplo:

```java
@GetMapping("/demo")
public String demo(
    @RequestParam String texto,
    @RequestParam int numero,
    @RequestParam boolean activo
) {
    return texto + " / " + numero + " / " + activo;
}
```

Spring intentará convertir los valores recibidos en la URL a esos tipos.

## Qué pasa si el valor no se puede convertir

Igual que ocurría con `@PathVariable`, si esperás por ejemplo un entero y el cliente manda un valor incompatible, Spring no podrá resolverlo correctamente.

Por ejemplo:

```java
@RequestParam int limite
```

pero llega:

```text
?limite=abc
```

Ahí el valor no puede convertirse a `int`.

Por eso conviene elegir bien los tipos y pensar qué espera realmente el endpoint.

## Un patrón muy habitual: filtros opcionales

Este es uno de los usos más frecuentes de `@RequestParam`.

```java
@GetMapping("/productos")
public String filtrar(
    @RequestParam(required = false) String categoria,
    @RequestParam(required = false) Boolean disponible
) {
    return "Filtrando productos";
}
```

La idea es:

- si no viene ningún filtro, listás todo
- si vienen algunos, ajustás la consulta

Ese patrón aparece muchísimo en APIs reales.

## Otro patrón muy habitual: búsqueda + paginación

```java
@GetMapping("/usuarios")
public String listarUsuarios(
    @RequestParam(required = false) String q,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size
) {
    return "q=" + q + ", page=" + page + ", size=" + size;
}
```

Esto ya se parece mucho a la estructura de muchos endpoints profesionales.

## Un ejemplo completo y realista

```java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/productos")
public class ProductoController {

    @GetMapping
    public String listarProductos(
        @RequestParam(required = false) String categoria,
        @RequestParam(required = false) String nombre,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "nombre") String sort
    ) {
        return "Listado filtrado";
    }
}
```

Aunque todavía no estás consultando base de datos ni devolviendo DTOs reales, ya tenés una forma muy representativa de cómo se diseña un endpoint de listado en una API.

## Diferencia conceptual con `@RequestBody`

Todavía no llegaste a `@RequestBody`, pero conviene anticipar una distinción.

`@RequestParam` sirve para valores chicos, simples y ligados a la URL.
En cambio, cuando el cliente manda una estructura más rica de datos, normalmente eso viaja en el cuerpo de la petición.

Por ahora, basta con quedarte con esta idea:

- datos simples de consulta → `@RequestParam`
- payload estructurado → `@RequestBody`

Más adelante vas a profundizarlo.

## Diferencia conceptual con `@PathVariable`

Vale la pena repetirlo porque es una distinción central del diseño web.

### `@PathVariable`
Se usa cuando el dato identifica el recurso dentro de la ruta.

Ejemplo:

```text
/usuarios/10
```

### `@RequestParam`
Se usa cuando el dato ajusta la consulta o agrega contexto a la petición.

Ejemplo:

```text
/usuarios?activo=true
```

Esta diferencia te va a ayudar muchísimo a diseñar APIs más claras.

## Cuándo conviene usar `@RequestParam`

Suele encajar muy bien para:

- filtros
- búsqueda
- paginación
- ordenamiento
- flags opcionales
- rangos simples
- datos de consulta poco voluminosos

## Cuándo no conviene forzarlo

No todo tiene que entrar por query params.

Si estás mandando muchos datos complejos, o un objeto entero, generalmente el query string deja de ser la mejor opción.

En esos casos, el cuerpo del request suele ser más natural.

## Un detalle importante sobre legibilidad

Aunque podrías hacer endpoints con muchísimos parámetros de consulta, eso también puede volver la API más difícil de entender.

Por ejemplo, si una URL empieza a tener diez o quince query params, quizá convenga revisar si:

- el endpoint está haciendo demasiado
- el criterio de filtrado debería modelarse de otra forma
- la búsqueda merece una estructura más clara

No es una regla rígida, pero es una buena señal de diseño a observar.

## Parámetros requeridos vs opcionales

Una decisión importante al diseñar el endpoint es definir qué parámetros son:

- obligatorios
- opcionales
- opcionales con default

Esa diferencia cambia mucho la experiencia de consumo de la API.

Por ejemplo:

### Obligatorio
```java
@RequestParam String categoria
```

### Opcional
```java
@RequestParam(required = false) String categoria
```

### Con default
```java
@RequestParam(defaultValue = "0") int page
```

Entender estas variantes te da bastante control sobre el contrato del endpoint.

## Error común: usar query params para identificar recursos que deberían ir en la ruta

Por ejemplo, hacer esto:

```text
GET /usuarios?id=10
```

cuando conceptualmente podrías hacer:

```text
GET /usuarios/10
```

No siempre está “prohibido”, pero muchas veces la segunda forma expresa mejor la identidad del recurso.

## Error común: usar `@PathVariable` para filtros que deberían ser query params

El error inverso también existe.

Por ejemplo, diseñar algo como:

```text
/productos/hardware/disponibles/true/pagina/0
```

cuando podría ser mucho más claro:

```text
/productos?categoria=hardware&disponible=true&page=0
```

La segunda forma suele comunicar mejor que esos datos están ajustando la consulta, no identificando el recurso.

## Error común: hacer todos los parámetros obligatorios sin necesidad

Si un endpoint de listado exige demasiados query params obligatorios, puede volverse incómodo o poco natural de consumir.

Muchas veces conviene pensar qué filtros realmente son opcionales y cuáles tienen defaults razonables.

## Error común: usar nombres ambiguos

Nombres como:

- `q`
- `x`
- `flag`
- `dato`

a veces pueden ser válidos en contextos muy puntuales, pero en general conviene preferir nombres más expresivos:

- `categoria`
- `nombre`
- `page`
- `size`
- `sort`
- `estado`

La claridad del contrato también se construye con buenos nombres.

## Error común: meter demasiada lógica de interpretación dentro del controlador

El controlador puede recibir parámetros de consulta, pero no por eso tiene que quedarse con toda la lógica pesada de filtrado, búsqueda y armado de criterios.

Más adelante vas a ver cómo delegar mejor estas decisiones a servicios y capas más apropiadas.

## Relación con Spring Boot

Spring Boot hace muy fácil capturar parámetros de consulta porque integra el sistema web con conversión automática de tipos y anotaciones expresivas.

Con muy poco código ya podés crear endpoints bastante útiles para:

- búsquedas
- listados
- filtros
- paginación
- ordenamiento

Eso te acerca mucho más a APIs reales y no solo a endpoints de demostración.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> `@RequestParam` permite leer parámetros de consulta enviados en la URL y es la herramienta natural para filtros, búsquedas, paginación, ordenamiento y otras opciones que ajustan una petición sin formar parte de la identidad del recurso.

## Resumen

- `@RequestParam` sirve para leer query params desde la URL.
- Es ideal para filtros, búsqueda, paginación y ordenamiento.
- Puede trabajar con distintos tipos simples como `String`, `int` o `boolean`.
- Los parámetros pueden ser obligatorios, opcionales o tener valores por defecto.
- No cumple el mismo rol que `@PathVariable`.
- Ruta y query params expresan cosas distintas dentro de una API.
- Entender esta diferencia mejora muchísimo el diseño de endpoints en Spring Boot.

## Próximo tema

En el próximo tema vas a ver cómo usar `@RequestBody` para recibir JSON en el cuerpo de la petición, y eso te va a permitir pasar de endpoints de consulta a endpoints que reciben datos estructurados para crear o actualizar recursos.
