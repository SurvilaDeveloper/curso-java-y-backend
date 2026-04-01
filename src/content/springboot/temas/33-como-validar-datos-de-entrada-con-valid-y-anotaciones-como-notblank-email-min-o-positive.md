---
title: "Cómo validar datos de entrada con @Valid y anotaciones como @NotBlank, @Email, @Min o @Positive"
description: "Entender cómo funciona la validación de datos en Spring Boot, cómo usar @Valid junto con Bean Validation y por qué validar temprano mejora muchísimo la calidad de una API."
order: 33
module: "Validación y manejo de errores"
level: "base"
draft: false
---

Hasta ahora viste cómo una API Spring Boot puede:

- exponer endpoints
- recibir datos por ruta, query params o body
- devolver respuestas más expresivas
- usar códigos HTTP más precisos

Pero todavía queda un problema muy importante.

Supongamos que el cliente manda esto:

```json
{
  "nombre": "",
  "email": "no-es-un-email",
  "edad": -5
}
```

O esto:

```json
{
  "titulo": "Notebook",
  "precio": -1000,
  "stock": -4
}
```

La pregunta es:

> ¿cómo evitás que datos claramente inválidos entren en la lógica de tu sistema?

Podrías validar todo manualmente con `if`, pero eso rápidamente se vuelve repetitivo, poco elegante y difícil de mantener.

Ahí entra un mecanismo central del ecosistema Spring:

- `@Valid`
- anotaciones de validación como `@NotBlank`, `@Email`, `@Min`, `@Positive`, etc.

Este tema es muy importante porque marca el paso desde una API que simplemente recibe datos hacia una API que empieza a **proteger sus contratos de entrada**.

## Qué problema resuelve la validación

Cuando un cliente manda datos al servidor, esos datos no deberían asumirse como correctos por defecto.

Pueden venir:

- incompletos
- vacíos
- mal formados
- fuera de rango
- inconsistentes
- con tipos que no representan un caso válido del negocio

Si esos datos entran demasiado lejos en el sistema, después aparecen problemas como:

- errores más difíciles de rastrear
- lógica de negocio contaminada con chequeos básicos
- respuestas poco claras
- comportamientos inesperados
- datos inválidos persistidos o procesados

La validación ayuda a cortar ese problema temprano.

## La idea general

Podés pensar la validación así:

> antes de procesar seriamente un request, querés verificar que sus datos mínimos tengan sentido.

En Spring Boot, una forma muy común de hacer esto es:

1. definir un DTO de entrada
2. ponerle restricciones declarativas
3. marcar el parámetro del controlador con `@Valid`
4. dejar que Spring valide automáticamente antes de seguir

Esto reduce muchísimo el código repetitivo.

## Qué es `@Valid`

`@Valid` es una anotación que le dice a Spring que valide el objeto recibido según las reglas declaradas en sus campos.

Ejemplo:

```java
@PostMapping("/usuarios")
public String crearUsuario(@Valid @RequestBody UsuarioRequest request) {
    return "Usuario válido recibido";
}
```

Acá Spring entiende que `UsuarioRequest` no solo debe mapearse desde JSON, sino también **validarse**.

Si alguna regla no se cumple, la petición no debería continuar normalmente como si nada.

## Qué son esas reglas

Las reglas suelen declararse con anotaciones sobre los campos del DTO.

Por ejemplo:

- `@NotBlank`
- `@NotNull`
- `@Email`
- `@Min`
- `@Max`
- `@Positive`
- `@PositiveOrZero`
- `@Size`

Estas anotaciones expresan restricciones sobre lo que se considera válido.

## Un primer ejemplo completo

```java
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public class UsuarioRequest {

    @NotBlank
    private String nombre;

    @Email
    @NotBlank
    private String email;

    @Positive
    private int edad;

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

    public int getEdad() {
        return edad;
    }

    public void setEdad(int edad) {
        this.edad = edad;
    }
}
```

Y el controlador:

```java
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @PostMapping
    public String crearUsuario(@Valid @RequestBody UsuarioRequest request) {
        return "Usuario válido: " + request.getNombre();
    }
}
```

## Cómo leer este ejemplo

Podés leerlo así:

- el cliente manda JSON
- Spring lo convierte a `UsuarioRequest`
- antes de entrar a la lógica normal del método, valida las reglas del DTO
- si el request cumple, el método sigue
- si no cumple, la petición falla

Ese flujo es una de las bases más importantes para construir APIs serias.

## Qué hace `@NotBlank`

`@NotBlank` se usa mucho en strings.

Expresa, conceptualmente:

> este texto no puede ser null, vacío ni solo espacios en blanco.

Por ejemplo:

```java
@NotBlank
private String nombre;
```

Esto es ideal para campos como:

- nombre
- título
- descripción breve
- username
- asunto
- nombre de categoría

## Por qué `@NotBlank` es mejor que solo mirar si es null

Porque muchas veces el problema no es solo que falte el valor, sino que venga algo como:

- `""`
- `"   "`

Es decir, un string que técnicamente existe pero que no tiene valor útil real.

`@NotBlank` cubre muy bien ese escenario.

## Qué hace `@Email`

`@Email` expresa:

> este texto debe tener forma de email válida.

Ejemplo:

```java
@Email
private String email;
```

Suele combinarse con `@NotBlank`, porque un email no solo debe tener formato correcto, sino además existir como dato.

```java
@Email
@NotBlank
private String email;
```

Esa combinación es extremadamente común.

## Qué hace `@Min`

`@Min` sirve para imponer un valor mínimo.

Ejemplo:

```java
@Min(0)
private int stock;
```

o:

```java
@Min(1)
private int cantidad;
```

Esto resulta útil para números donde querés expresar un límite inferior.

Por ejemplo:

- cantidad mínima
- edad mínima
- stock no negativo
- tamaño mínimo
- prioridad mínima
- tiempo mínimo permitido

## Qué hace `@Positive`

`@Positive` expresa:

> este número debe ser mayor que cero.

Ejemplo:

```java
@Positive
private double precio;
```

Esto es muy útil para campos como:

- precio
- monto
- peso
- ancho
- alto
- cantidad obligatoriamente positiva

## Diferencia entre `@Min(0)` y `@Positive`

Esta diferencia importa.

### `@Min(0)`
Permite cero y valores mayores.

### `@Positive`
Solo permite valores mayores que cero.

Entonces:

- si cero es válido, `@Min(0)` o `@PositiveOrZero` puede tener más sentido
- si cero no tiene sentido, `@Positive` comunica mejor la regla

## Qué hace `@PositiveOrZero`

Expresa:

> este número debe ser positivo o cero.

Ejemplo:

```java
@PositiveOrZero
private int stock;
```

Esto es ideal para casos donde:

- cero es aceptable
- negativos no

Por ejemplo:

- stock
- cantidad acumulada
- reintentos
- saldo que puede ser cero

## Qué hace `@NotNull`

`@NotNull` expresa:

> este valor no puede ser null.

Esto es especialmente útil cuando trabajás con tipos wrapper como:

- `Integer`
- `Long`
- `Boolean`
- `Double`

Ejemplo:

```java
@NotNull
private Long categoriaId;
```

Si el valor no llega, la validación puede detectarlo.

## `@NotNull` no es igual a `@NotBlank`

Esto es importante.

### `@NotNull`
Sirve para decir que el valor no puede faltar.

### `@NotBlank`
Sirve especialmente para strings que no pueden venir vacíos ni en blanco.

Entonces:

- para un `String`, muchas veces `@NotBlank` resulta más fuerte y más útil
- para un objeto o un wrapper, `@NotNull` suele ser el punto de partida

## Qué hace `@Size`

`@Size` sirve para limitar longitud o tamaño.

Por ejemplo:

```java
@Size(min = 3, max = 100)
private String titulo;
```

Esto puede expresar:

- longitud mínima
- longitud máxima
- rango permitido de caracteres

También puede aplicarse a colecciones y otros casos, aunque al principio suele verse más en strings.

## Un ejemplo más realista

```java
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class RegistroUsuarioRequest {

    @NotBlank
    @Size(min = 2, max = 80)
    private String nombre;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Size(min = 6, max = 100)
    private String password;

    @Positive
    private int edad;

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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public int getEdad() {
        return edad;
    }

    public void setEdad(int edad) {
        this.edad = edad;
    }
}
```

Esto ya se parece bastante a un request real de una API.

## Cómo se usa junto con el controlador

```java
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/registro")
public class RegistroController {

    @PostMapping
    public String registrar(@Valid @RequestBody RegistroUsuarioRequest request) {
        return "Usuario registrado: " + request.getEmail();
    }
}
```

Con esto, la validación ocurre automáticamente antes de seguir con la operación.

## Qué pasa si la validación falla

Si el DTO no cumple alguna de las reglas, la petición ya no sigue normalmente como si todo estuviera bien.

Eso es una gran ventaja.

Porque significa que:

- no llegás con datos basura a la lógica de negocio
- no necesitás hacer tantos `if` manuales en cada endpoint
- el framework puede detectar el problema temprano

Más adelante vas a ver cómo personalizar y ordenar mejor la respuesta de error, pero ya desde ahora el concepto importante es este:

> la validación corta el flujo antes de que el request inválido avance demasiado.

## Un ejemplo de JSON inválido

Supongamos este DTO:

```java
public class ProductoRequest {

    @NotBlank
    private String titulo;

    @Positive
    private double precio;

    @PositiveOrZero
    private int stock;

    // getters y setters
}
```

Y el cliente manda:

```json
{
  "titulo": "",
  "precio": -300,
  "stock": -1
}
```

Acá hay varios problemas:

- `titulo` está vacío
- `precio` no es positivo
- `stock` no puede ser negativo

La validación detecta todo eso antes de que tu servicio intente operar con esos datos.

## Por qué esto es mejor que validar todo a mano

Podrías hacer algo así:

```java
@PostMapping("/productos")
public String crearProducto(@RequestBody ProductoRequest request) {
    if (request.getTitulo() == null || request.getTitulo().isBlank()) {
        throw new IllegalArgumentException("Título inválido");
    }

    if (request.getPrecio() <= 0) {
        throw new IllegalArgumentException("Precio inválido");
    }

    if (request.getStock() < 0) {
        throw new IllegalArgumentException("Stock inválido");
    }

    return "ok";
}
```

Pero eso tiene varios problemas:

- repetición
- controladores más ruidosos
- validaciones dispersas
- menor claridad del contrato
- menos reutilización

La validación declarativa suele ser mucho más limpia.

## El DTO expresa el contrato esperado

Una idea muy importante es esta:

> el DTO de entrada no solo transporta datos; también puede expresar qué condiciones mínimas deben cumplir esos datos.

Eso hace que la clase se vuelva más informativa.

Por ejemplo, al ver esto:

```java
@NotBlank
private String nombre;

@Email
@NotBlank
private String email;

@Positive
private double precio;
```

ya entendés bastante bien qué espera el endpoint sin necesidad de leer una gran cantidad de lógica manual.

## Validación y documentación viva

Esto conecta muy bien con algo que ya viste antes en configuración:

las anotaciones no solo validan; también documentan.

Cuando alguien mira el DTO, entiende mucho mejor:

- qué campos son obligatorios
- qué rangos tienen sentido
- qué formatos se esperan
- qué tamaño mínimo o máximo se admite

Eso mejora muchísimo la mantenibilidad.

## `@Valid` no valida por sí solo cualquier cosa mágica

Esto también es importante.

`@Valid` no inventa reglas donde no las hay.

Si el DTO no tiene restricciones, `@Valid` no va a aportar demasiado.

Por ejemplo:

```java
public class CategoriaRequest {
    private String nombre;
}
```

y luego:

```java
public String crear(@Valid @RequestBody CategoriaRequest request)
```

Si no hay anotaciones de restricción en `CategoriaRequest`, la validación declarativa no tiene mucho que aplicar.

La potencia aparece cuando combinás `@Valid` con restricciones concretas.

## Un buen patrón inicial

Muy pronto empieza a ser muy sano este patrón:

- DTO de entrada
- restricciones declaradas en el DTO
- `@Valid` en el controlador
- servicio que recibe ya datos razonablemente saneados

Esto no resuelve todos los problemas posibles del negocio, pero sí ordena muchísimo la validación básica de entrada.

## Validación básica vs reglas de negocio

Esta distinción es central.

No toda regla pertenece al mismo nivel.

### Validación básica de entrada
Ejemplos:
- nombre no vacío
- email con formato válido
- precio positivo
- stock no negativo

### Reglas de negocio
Ejemplos:
- el email no debe existir ya en el sistema
- el producto no puede activarse si no tiene categoría
- no se puede cerrar un pedido sin pago
- cierto campo es obligatorio solo en determinada condición de negocio

Las primeras suelen vivir muy bien en Bean Validation.
Las segundas, muchas veces, pertenecen a servicios o capas de negocio.

## Por qué esta distinción importa

Porque si metés toda la lógica de negocio dentro de anotaciones de validación básicas, el diseño puede volverse confuso.

Conviene pensar:

- Bean Validation para sanidad estructural y restricciones declarativas simples
- servicios para reglas más complejas o contextuales del negocio

## Un ejemplo típico de DTO para creación

```java
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public class CrearProductoRequest {

    @NotBlank
    @Size(min = 3, max = 120)
    private String titulo;

    @Positive
    private double precio;

    @PositiveOrZero
    private int stock;

    @NotBlank
    private String categoria;

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

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }
}
```

Y en el controlador:

```java
@PostMapping("/productos")
public String crearProducto(@Valid @RequestBody CrearProductoRequest request) {
    return "Producto válido: " + request.getTitulo();
}
```

## ¿Solo sirve con @RequestBody?

No.

Aunque uno de los usos más típicos de `@Valid` es con `@RequestBody`, la idea de validación puede aparecer también en otros contextos.

Pero al empezar, el caso más natural y pedagógico suele ser justamente ese:

- el cliente manda JSON
- Spring lo convierte a DTO
- el DTO se valida
- si no cumple, la petición no sigue

## Validación de strings vs validación numérica

También conviene distinguir esto.

### Strings
Suelen validarse con cosas como:
- `@NotBlank`
- `@Size`
- `@Email`

### Números
Suelen validarse con:
- `@Min`
- `@Max`
- `@Positive`
- `@PositiveOrZero`

Pensar en familias de validación ayuda mucho a elegir mejor la restricción.

## Qué pasa con valores opcionales

No todos los campos tienen que ser obligatorios.

A veces un request puede tener:

- campos requeridos
- campos opcionales
- campos con validaciones solo si están presentes
- campos cuyo sentido depende del caso

Este tema va a madurar mucho más adelante, pero desde ya es importante no pensar la validación como “todo o nada”.

La clave está en modelar qué espera realmente el contrato del endpoint.

## Qué ganás con esto en la práctica

Muchísimo.

Por ejemplo:

- endpoints más limpios
- menos ifs repetitivos
- contratos de entrada más explícitos
- errores detectados más temprano
- código más mantenible
- DTOs más expresivos
- menor contaminación de la lógica de negocio con chequeos básicos

## Error común: creer que validar es opcional “para después”

A veces se posterga la validación porque “primero quiero que funcione”.

Pero cuanto más crece una API sin validación de entrada, más basura potencial deja pasar y más difícil se vuelve ordenar después el sistema.

No hace falta tener un sistema perfecto desde el minuto uno, pero introducir validación relativamente temprano suele ser una gran decisión.

## Error común: validar todo manualmente dentro del controlador

Ya lo vimos, pero vale insistir.

Un controlador lleno de chequeos imperativos suele volverse:

- más largo
- más ruidoso
- más repetitivo
- más difícil de mantener

Las anotaciones declarativas ayudan mucho a evitar eso.

## Error común: mezclar reglas de negocio complejas con restricciones básicas

No todo “lo importante” debería convertirse en una anotación sobre un campo.

Hay reglas que claramente viven mejor en el servicio.

Entender esta frontera te va a ahorrar muchos dolores de diseño.

## Error común: no pensar el DTO como contrato público

El request DTO no es solo una clase interna cualquiera.

Representa parte del contrato público de la API.

Por eso conviene cuidarlo:

- nombres claros
- restricciones claras
- campos necesarios
- semántica razonable

## Error común: usar anotaciones sin entender bien qué expresan

Por ejemplo:

- usar `@NotNull` cuando en realidad necesitabas `@NotBlank`
- usar `@Min(0)` cuando cero no debería ser válido
- usar `@Positive` cuando cero sí tenía sentido

Las anotaciones ayudan mucho, pero conviene elegirlas con intención.

## Relación con Spring Boot

Spring Boot hace muy natural integrar validación declarativa dentro de endpoints REST.

Eso permite que una API no solo reciba JSON, sino que también exija que ese JSON tenga una calidad mínima antes de procesarlo.

Es una mejora enorme en robustez y profesionalismo del backend.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> combinar `@Valid` con anotaciones como `@NotBlank`, `@Email`, `@Min` o `@Positive` permite que una API Spring Boot detecte automáticamente datos inválidos en la entrada y proteja mucho mejor su contrato antes de que el request llegue demasiado lejos.

## Resumen

- `@Valid` permite disparar la validación de un objeto recibido por el endpoint.
- Las restricciones se expresan con anotaciones sobre los campos del DTO.
- `@NotBlank`, `@Email`, `@Min`, `@Positive` y `@Size` son algunas de las más comunes.
- La validación ayuda a rechazar datos inválidos temprano.
- Esto reduce código manual repetitivo en controladores.
- La validación básica de entrada no reemplaza todas las reglas de negocio.
- Es una herramienta central para construir APIs más robustas y confiables.

## Próximo tema

En el próximo tema vas a ver qué respuesta devuelve Spring cuando la validación falla y cómo empezar a ordenar esos errores para que la API no solo detecte entradas inválidas, sino que también las comunique de una manera clara y útil para el cliente.
