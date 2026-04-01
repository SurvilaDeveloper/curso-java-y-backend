---
title: "Validaciones"
description: "Cómo validar datos en una API Spring Boot para aceptar solo entradas correctas y devolver errores claros cuando algo no cumple las reglas."
order: 33
module: "Backend web"
level: "intermedio"
draft: false
---

## Introducción

En la lección anterior viste DTOs, o sea, objetos pensados para transportar datos entre la API y el resto del sistema.

Eso te permitió separar mejor:

- lo que entra
- lo que sale
- lo que el sistema maneja internamente

Pero todavía falta una pieza muy importante:

¿qué pasa si los datos que llegan no son válidos?

Por ejemplo:

- username vacío
- email inválido
- precio negativo
- contraseña demasiado corta
- cantidad nula donde debería existir un valor

Para resolver eso aparecen las validaciones.

## Qué es validar

Validar significa comprobar que los datos cumplen ciertas reglas antes de seguir procesándolos.

Dicho simple:

- si los datos son correctos, el flujo puede continuar
- si los datos no son correctos, la API debería rechazar la request de forma clara

## Por qué esto es importante

Validar bien ayuda a:

- evitar datos inválidos
- proteger la lógica del sistema
- devolver errores más claros
- reducir fallos más adelante
- mejorar la calidad de la API

## La idea general

Supongamos que querés crear un producto.

Si llega esta request:

```json
{
  "name": "",
  "price": -10
}
```

lo correcto no sería guardarla “igual y ver después”.

Lo razonable es detectarlo cuanto antes y responder algo como:

- `400 Bad Request`

con un mensaje claro sobre qué falló.

## Validación técnica y validación de negocio

Conviene distinguir estas dos ideas.

## Validación técnica o estructural

Controla si los datos cumplen requisitos básicos.

Ejemplos:

- campo obligatorio
- texto no vacío
- email con formato válido
- número positivo
- longitud mínima

## Validación de negocio

Controla reglas del dominio.

Ejemplos:

- no se puede crear un usuario con email ya registrado
- no se puede confirmar una orden sin stock
- no se puede cancelar una orden ya entregada

En esta lección nos vamos a enfocar principalmente en la validación de entrada típica en APIs.

## Bean Validation

En Spring Boot, una forma muy común de validar DTOs es usando Bean Validation.

Vas a ver mucho anotaciones como estas:

- `@NotNull`
- `@NotBlank`
- `@Size`
- `@Email`
- `@Min`
- `@Max`
- `@Positive`

Estas anotaciones suelen ponerse sobre los campos del DTO.

## Idea importante

Los DTOs de request son un lugar excelente para poner validaciones de entrada.

¿Por qué?
Porque representan exactamente los datos que llegan a la API.

## Ejemplo de request DTO validado

```java
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public class CreateProductRequestDto {

    @NotBlank(message = "El nombre es obligatorio")
    private String name;

    @Positive(message = "El precio debe ser mayor que cero")
    private double price;

    @Email(message = "El email debe tener un formato válido")
    private String supplierEmail;

    public CreateProductRequestDto() {
    }

    public String getName() {
        return name;
    }

    public double getPrice() {
        return price;
    }

    public String getSupplierEmail() {
        return supplierEmail;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public void setSupplierEmail(String supplierEmail) {
        this.supplierEmail = supplierEmail;
    }
}
```

## Qué expresan estas anotaciones

### `@NotBlank`

Indica que el texto no debe ser `null`, vacío ni solo espacios.

### `@Positive`

Indica que el número debe ser mayor que cero.

### `@Email`

Indica que el texto debe tener formato de email razonable.

## `@Valid`

Poner anotaciones en el DTO no alcanza por sí solo.

Para que Spring active la validación al recibir el body, se suele usar `@Valid` en el controller.

Ejemplo:

```java
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products")
public class ProductController {

    @PostMapping
    public String createProduct(@Valid @RequestBody CreateProductRequestDto request) {
        return "Producto válido recibido";
    }
}
```

## Qué hace `@Valid`

Le dice a Spring:

“antes de ejecutar este método, validá el objeto recibido”.

Si alguna regla falla, Spring puede detener el flujo y devolver un error en vez de seguir normalmente.

## Ejemplo de request válida

```json
{
  "name": "Notebook",
  "price": 1250.50,
  "supplierEmail": "proveedor@example.com"
}
```

## Ejemplo de request inválida

```json
{
  "name": "",
  "price": -50,
  "supplierEmail": "correo-invalido"
}
```

En ese caso, la validación debería fallar.

## Anotaciones comunes

## `@NotNull`

El valor no puede ser `null`.

```java
@NotNull(message = "La cantidad es obligatoria")
private Integer quantity;
```

## `@NotBlank`

Muy útil para strings.

```java
@NotBlank(message = "El username es obligatorio")
private String username;
```

## `@Size`

Sirve para controlar longitud mínima y máxima.

```java
@Size(min = 3, max = 50, message = "El username debe tener entre 3 y 50 caracteres")
private String username;
```

## `@Email`

Valida formato de email.

```java
@Email(message = "El email no es válido")
private String email;
```

## `@Min` y `@Max`

Sirven para límites numéricos.

```java
@Min(value = 1, message = "La cantidad mínima es 1")
@Max(value = 100, message = "La cantidad máxima es 100")
private Integer quantity;
```

## `@Positive` y `@PositiveOrZero`

Sirven para números positivos.

```java
@Positive(message = "El precio debe ser positivo")
private double price;
```

o

```java
@PositiveOrZero(message = "El stock no puede ser negativo")
private int stock;
```

## Ejemplo completo de DTO validado

```java
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class CreateUserRequestDto {

    @NotBlank(message = "El username es obligatorio")
    @Size(min = 3, max = 30, message = "El username debe tener entre 3 y 30 caracteres")
    private String username;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no tiene un formato válido")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String password;

    public CreateUserRequestDto() {
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
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
}
```

## Controller usando `@Valid`

```java
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    @PostMapping
    public String createUser(@Valid @RequestBody CreateUserRequestDto request) {
        return "Usuario válido recibido";
    }
}
```

## Qué pasa cuando falla la validación

Cuando una validación falla, Spring puede responder automáticamente con un error HTTP, normalmente del rango `400`.

Dependiendo de la configuración, puede devolver una respuesta básica o una estructura más detallada.

Más adelante vas a ver cómo personalizar mejor esas respuestas.

## Validaciones y `BindingResult`

También existe una forma de capturar manualmente los errores de validación usando `BindingResult`.

Ejemplo conceptual:

```java
import jakarta.validation.Valid;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    @PostMapping
    public String createUser(@Valid @RequestBody CreateUserRequestDto request,
                             BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return "Hay errores de validación";
        }

        return "Usuario válido";
    }
}
```

## Cuándo sirve `BindingResult`

Sirve cuando querés inspeccionar los errores manualmente y construir una respuesta personalizada.

No siempre hace falta usarlo, pero conviene saber que existe.

## Validaciones anidadas

Si un DTO contiene otro objeto que también debe validarse, puede usarse `@Valid` sobre ese campo.

Ejemplo conceptual:

```java
public class AddressDto {
    @NotBlank(message = "La ciudad es obligatoria")
    private String city;

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }
}
```

```java
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

public class CreateUserRequestDto {

    @NotBlank(message = "El username es obligatorio")
    private String username;

    @Valid
    private AddressDto address;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public AddressDto getAddress() {
        return address;
    }

    public void setAddress(AddressDto address) {
        this.address = address;
    }
}
```

## Validaciones y tipos primitivos

Esto conviene pensarlo bien.

Si usás un tipo primitivo como `int` o `double`, no puede ser `null`.

En cambio, si usás wrappers como `Integer` o `Double`, sí pueden ser `null`.

Eso influye en qué validaciones tienen sentido.

Por ejemplo:

```java
@NotNull
private Integer quantity;
```

esto tiene sentido.

Pero:

```java
@NotNull
private int quantity;
```

no tiene el mismo sentido, porque `int` no puede ser null.

## Validaciones y lógica de negocio

Las anotaciones de validación ayudan mucho, pero no reemplazan toda la lógica del dominio.

Por ejemplo:

- `@Positive` puede asegurar que el precio sea mayor que cero
- pero no puede decidir sola si el producto ya existe duplicado en el sistema

Por eso conviene recordar:

- DTO + Bean Validation → excelente para validar entrada estructural
- service → excelente para validar reglas del negocio

## Ejemplo de combinación sana

### DTO

Valida formato básico:

- campos obligatorios
- tamaños
- email
- positivos

### Service

Valida reglas del dominio:

- username único
- email ya registrado
- estado permitido para cierta operación

## Ejemplo conceptual de service

```java
import org.springframework.stereotype.Service;

@Service
public class UserService {

    public void createUser(CreateUserRequestDto request) {
        if ("admin".equalsIgnoreCase(request.getUsername())) {
            throw new IllegalArgumentException("Ese username no está permitido");
        }

        // lógica de creación
    }
}
```

## Personalizar mensajes

Una buena práctica es escribir mensajes de error claros.

Mejor así:

```java
@NotBlank(message = "El username es obligatorio")
```

que dejar un mensaje genérico poco útil.

Eso mejora mucho la experiencia de quien consume la API y también el debugging.

## Validaciones y DTOs de update

No siempre las validaciones son iguales para crear y para actualizar.

Por ejemplo:

- en create puede ser obligatorio que estén muchos campos
- en update parcial quizá no todos sean obligatorios

Por eso a veces conviene tener DTOs distintos:

- `CreateUserRequestDto`
- `UpdateUserRequestDto`

## Ejemplo completo

```java
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class CreateProductRequestDto {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    private String name;

    @Positive(message = "El precio debe ser mayor que cero")
    private double price;

    @Email(message = "El email del proveedor no es válido")
    private String supplierEmail;

    public CreateProductRequestDto() {
    }

    public String getName() {
        return name;
    }

    public double getPrice() {
        return price;
    }

    public String getSupplierEmail() {
        return supplierEmail;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public void setSupplierEmail(String supplierEmail) {
        this.supplierEmail = supplierEmail;
    }
}
```

```java
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products")
public class ProductController {

    @PostMapping
    public String createProduct(@Valid @RequestBody CreateProductRequestDto request) {
        return "Producto válido: " + request.getName();
    }
}
```

## Qué demuestra este ejemplo

Demuestra que Spring Boot puede validar automáticamente el body de entrada si:

- el DTO tiene anotaciones correctas
- el controller usa `@Valid`

Eso permite rechazar datos inválidos antes de que contaminen la lógica del sistema.

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede recordarte a validar payloads con librerías o esquemas, pero en Spring Boot esto suele integrarse muy bien con anotaciones y el sistema de tipos de Java.

### Si venís de Python

Puede parecerse al uso de validaciones en modelos de entrada. En Java, Bean Validation se volvió una forma muy estándar y expresiva de representar reglas de entrada.

## Errores comunes

### 1. Confiar en que el cliente siempre enviará datos válidos

Eso casi siempre termina mal.

### 2. No usar `@Valid` en el controller

Sin eso, las anotaciones del DTO no se aplican automáticamente en ese flujo.

### 3. Mezclar toda la validación en una sola capa

La validación de entrada y la validación de negocio no son exactamente lo mismo.

### 4. Escribir mensajes de error vagos

Los mensajes claros ayudan muchísimo.

### 5. Usar tipos primitivos cuando necesitás distinguir ausencia de valor

A veces conviene usar wrappers como `Integer` o `Double`.

## Mini ejercicio

Diseñá un `CreateUserRequestDto` con validaciones para:

1. `username` obligatorio y entre 3 y 30 caracteres
2. `email` obligatorio y con formato válido
3. `password` obligatoria y mínimo 8 caracteres

Después, usalo en un `UserController` con `@Valid`.

## Ejemplo posible

```java
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateUserRequestDto {

    @NotBlank(message = "El username es obligatorio")
    @Size(min = 3, max = 30, message = "El username debe tener entre 3 y 30 caracteres")
    private String username;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no es válido")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String password;

    public CreateUserRequestDto() {
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
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
}
```

```java
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    @PostMapping
    public String createUser(@Valid @RequestBody CreateUserRequestDto request) {
        return "Usuario válido: " + request.getUsername();
    }
}
```

## Resumen

En esta lección viste que:

- validar significa comprobar que los datos cumplen reglas antes de procesarlos
- Bean Validation permite declarar reglas con anotaciones como `@NotBlank`, `@Email`, `@Size` y `@Positive`
- los DTOs de request son un lugar excelente para validar entrada
- `@Valid` activa la validación en controllers
- la validación de entrada no reemplaza toda la validación de negocio
- mensajes claros y buen diseño de DTOs mejoran mucho la calidad de una API

## Siguiente tema

En la próxima lección conviene pasar a **manejo de errores en Spring Boot**, porque después de validar formalmente los datos de entrada, el siguiente paso natural es aprender a devolver respuestas de error más limpias, consistentes y profesionales en toda la API.
