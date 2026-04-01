---
title: "Cómo probar endpoints con @WebMvcTest, validación, JSON y códigos HTTP"
description: "Entender cómo usar @WebMvcTest para probar la capa web en Spring Boot, verificar endpoints, request bodies, validación, respuestas JSON y códigos HTTP sin levantar toda la aplicación completa."
order: 56
module: "Testing en Spring Boot"
level: "base"
draft: false
---

En el tema anterior viste cómo probar la lógica del service con mocks, aislando el caso de uso para verificar reglas, excepciones de negocio e interacciones con sus dependencias sin mezclar persistencia real ni HTTP.

Ahora toca la siguiente capa natural:

**la capa web**

Y acá el foco vuelve a cambiar bastante.

Porque cuando probás un endpoint, las preguntas ya no son tanto:

- si la query funciona
- si el service decide bien un flujo interno
- si la entidad se guarda en la base

Ahora las preguntas suelen ser más parecidas a estas:

- ¿la ruta responde al verbo correcto?
- ¿si mando un JSON válido devuelve el status esperado?
- ¿si el body es inválido devuelve `400 Bad Request`?
- ¿el controlador devuelve el JSON con la forma correcta?
- ¿el parámetro de path se interpreta bien?
- ¿si el service lanza una excepción, el contrato HTTP responde correctamente?

Es decir:

> al probar la capa web, el foco está en el contrato HTTP.

Y una herramienta muy importante para esto en Spring Boot es:

`@WebMvcTest`

Este tema es clave porque te ayuda a probar endpoints de forma enfocada, sin levantar toda la aplicación ni mezclar innecesariamente base de datos, repositories o lógica interna de persistencia cuando lo que querés verificar pertenece claramente a la web.

## Qué significa probar la capa web

Probar la capa web significa verificar el comportamiento HTTP del backend.

Por ejemplo:

- rutas
- verbos
- bodies JSON
- validación de entrada
- serialización de salida
- status codes
- integración entre controller y manejo de errores web

No significa probar si PostgreSQL guarda bien.
No significa verificar queries derivadas.
No significa confirmar todos los detalles internos del caso de uso.

La pregunta acá es:

> ¿cómo se comporta la API desde el punto de vista del cliente HTTP?

## El problema de levantar toda la app para una pregunta de endpoint

Supongamos que querés responder algo muy puntual como esto:

- si hago `POST /productos` con un título vacío, ¿responde `400`?
- si hago `GET /productos/1`, ¿devuelve un JSON con `id` y `titulo`?
- si el service lanza `ProductoNoEncontradoException`, ¿el endpoint responde `404`?

Todas esas preguntas pertenecen muy claramente a la capa web.

Si para responderlas levantás:

- toda la aplicación
- base real
- repositories
- migraciones
- services completos con persistencia
- infraestructura no necesaria

entonces terminás pagando un costo innecesario para una pregunta que era mucho más específica.

Ahí entra el valor de `@WebMvcTest`.

## Qué es `@WebMvcTest`

`@WebMvcTest` es una anotación pensada para probar la capa MVC o web de Spring Boot de forma enfocada.

Dicho de forma simple:

> levanta un contexto reducido orientado a controllers, validación, serialización y comportamiento HTTP, sin arrancar toda la aplicación completa.

Eso la vuelve ideal para preguntas como:

- ¿esta ruta responde?
- ¿este JSON entra bien?
- ¿esta validación devuelve 400?
- ¿este endpoint responde con el body correcto?
- ¿este error termina en el status esperado?

## Qué significa que sea un slice web

Igual que `@DataJpaTest` era un slice de persistencia, `@WebMvcTest` es un slice de la capa web.

Eso significa que el contexto levantado está mucho más recortado hacia:

- controllers
- validación
- MVC
- serialización/deserialización
- contrato HTTP

No intenta probar todo el sistema completo.

Y eso es justamente lo que lo hace tan útil para esta capa.

## Por qué esto importa tanto

Porque permite hacer tests que sean:

- más rápidos
- más claros
- más alineados con la capa HTTP
- más fáciles de diagnosticar
- menos contaminados por infraestructura innecesaria

En otras palabras:

> si querés probar web, conviene usar una herramienta pensada para web.

## Un controller de ejemplo

Supongamos este controller:

```java
import java.util.List;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @PostMapping
    public ResponseEntity<ProductoResponse> crear(@Valid @RequestBody CrearProductoRequest request) {
        ProductoResponse response = productoService.crear(request);
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponse> obtener(@PathVariable Long id) {
        ProductoResponse response = productoService.obtener(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ProductoResponse>> listar() {
        List<ProductoResponse> response = productoService.listar();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
```

Este controller es un gran candidato para `@WebMvcTest`.

## Qué dependencia suele mockearse acá

Como el foco del test no es probar la lógica real del service, normalmente el service se mockea.

Eso es muy importante conceptualmente.

No querés verificar si el service calcula o persiste bien.
Eso ya tiene sus propios tests.

Acá querés verificar:

- cómo el controller recibe requests
- cómo responde
- cómo serializa
- qué status devuelve
- cómo se comporta la validación

Entonces el service se usa como dependencia controlada.

## Un primer test con @WebMvcTest

```java
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ProductoController.class)
class ProductoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductoService productoService;

    @Test
    void obtener_deberiaResponder200YJsonEsperado_siProductoExiste() throws Exception {
        ProductoResponse response = new ProductoResponse();
        response.setId(1L);
        response.setTitulo("Notebook");
        response.setPrecio(2500);
        response.setStock(10);
        response.setActivo(true);

        when(productoService.obtener(1L)).thenReturn(response);

        mockMvc.perform(get("/productos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.titulo").value("Notebook"))
                .andExpect(jsonPath("$.precio").value(2500))
                .andExpect(jsonPath("$.stock").value(10))
                .andExpect(jsonPath("$.activo").value(true));
    }
}
```

Este test ya muestra muy bien el espíritu de la capa web.

## Qué está probando este test exactamente

Está probando cosas como:

- que `GET /productos/1` responde
- que devuelve `200 OK`
- que el JSON contiene los campos esperados
- que el controller usa el valor devuelto por el service para construir la respuesta

No está probando:

- si `productoService.obtener(...)` funciona internamente
- si el repository consulta bien la base
- si JPA está bien configurado

Eso es precisamente lo que mantiene al test enfocado.

## Qué es `MockMvc`

`MockMvc` es una herramienta muy importante para tests de la capa web en Spring.

Te permite simular llamadas HTTP al controller dentro del contexto de test.

Podés pensarla así:

> es una forma de ejercitar endpoints como si hicieras requests HTTP, pero dentro del entorno de pruebas de Spring.

Eso la vuelve muy útil para verificar:

- rutas
- verbos
- parámetros
- request bodies
- respuestas
- status
- JSON

## Qué hace `@MockBean`

`@MockBean` crea un mock gestionado por Spring dentro del contexto de test.

En este caso:

```java
@MockBean
private ProductoService productoService;
```

significa:

- el controller recibirá un `ProductoService` simulado
- el test puede definir qué devuelve
- no se usará el service real

Esto encaja perfecto con el objetivo del test web.

## Un test para POST exitoso

Supongamos que querés probar la creación.

```java
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ProductoController.class)
class ProductoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductoService productoService;

    @Test
    void crear_deberiaResponder201YJsonEsperado_siRequestEsValido() throws Exception {
        ProductoResponse response = new ProductoResponse();
        response.setId(1L);
        response.setTitulo("Notebook");
        response.setPrecio(2500);
        response.setStock(10);
        response.setActivo(true);

        when(productoService.crear(any(CrearProductoRequest.class))).thenReturn(response);

        mockMvc.perform(post("/productos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "titulo": "Notebook",
                                  "precio": 2500,
                                  "stock": 10
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.titulo").value("Notebook"))
                .andExpect(jsonPath("$.precio").value(2500))
                .andExpect(jsonPath("$.stock").value(10))
                .andExpect(jsonPath("$.activo").value(true));
    }
}
```

Este test responde una pregunta muy de API pública:
qué pasa cuando el cliente manda un body válido.

## Qué gana este test frente a probarlo solo en el service

Muchísimo.

Porque ahora sí estás verificando:

- que el endpoint acepta JSON
- que responde `201`
- que serializa correctamente la respuesta
- que el contrato HTTP se ve como esperás

El service por sí solo no te puede responder eso.

## Un test de validación muy importante

Acá aparece uno de los mayores valores de `@WebMvcTest`.

Supongamos que `CrearProductoRequest` tiene:

```java
@NotBlank
@Size(min = 3, max = 120)
private String titulo;

@Positive
private double precio;

@PositiveOrZero
private int stock;
```

Entonces un test muy valioso sería:

```java
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ProductoController.class)
class ProductoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductoService productoService;

    @Test
    void crear_deberiaResponder400_siRequestEsInvalido() throws Exception {
        mockMvc.perform(post("/productos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "titulo": "",
                                  "precio": -10,
                                  "stock": -1
                                }
                                """))
                .andExpect(status().isBadRequest());
    }
}
```

Este test es extremadamente valioso porque responde algo muy importante del contrato HTTP:

> si el body es inválido, la API debe rechazarlo con `400`.

## Por qué esto pertenece claramente a la capa web

Porque la validación del request body en un controller REST es parte del comportamiento HTTP visible para el cliente.

No estás preguntando si el repository funciona.
No estás preguntando si la base guarda bien.
Estás preguntando:

- ¿la request es aceptada o rechazada?
- ¿qué status se devuelve?

Eso es web.

## Un test para DELETE

```java
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ProductoController.class)
class ProductoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductoService productoService;

    @Test
    void eliminar_deberiaResponder204_siTodoSaleBien() throws Exception {
        doNothing().when(productoService).eliminar(1L);

        mockMvc.perform(delete("/productos/1"))
                .andExpect(status().isNoContent());
    }
}
```

Otra vez, esto está respondiendo una pregunta muy concreta del contrato HTTP.

## Qué pasa con las excepciones de negocio en tests web

También son muy importantes.

Supongamos que el service lanza:

- `ProductoNoEncontradoException`

Y tu `@ControllerAdvice` la traduce a:

- `404 Not Found`

Entonces el test web puede verificar exactamente eso.

Por ejemplo:

```java
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ProductoController.class)
class ProductoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductoService productoService;

    @Test
    void obtener_deberiaResponder404_siProductoNoExiste() throws Exception {
        when(productoService.obtener(99L))
                .thenThrow(new ProductoNoEncontradoException("No existe el producto 99"));

        mockMvc.perform(get("/productos/99"))
                .andExpect(status().isNotFound());
    }
}
```

Este test es una gran forma de verificar contrato de error HTTP.

## Qué está probando acá realmente

No está probando si el service real encuentra el producto.
Está probando:

- si el controller + capa web reciben esa excepción
- si la traducen correctamente al status HTTP esperado

Eso es exactamente lo que debería hacer un test web.

## Qué pasa con el JSON de listas

También podés probar endpoints que devuelven colecciones.

Por ejemplo:

```java
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ProductoController.class)
class ProductoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductoService productoService;

    @Test
    void listar_deberiaResponderListaJson() throws Exception {
        ProductoResponse a = new ProductoResponse();
        a.setId(1L);
        a.setTitulo("Notebook");
        a.setPrecio(2500);
        a.setStock(10);
        a.setActivo(true);

        ProductoResponse b = new ProductoResponse();
        b.setId(2L);
        b.setTitulo("Mouse");
        b.setPrecio(50);
        b.setStock(20);
        b.setActivo(true);

        when(productoService.listar()).thenReturn(List.of(a, b));

        mockMvc.perform(get("/productos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].titulo").value("Notebook"))
                .andExpect(jsonPath("$[1].titulo").value("Mouse"));
    }
}
```

Este tipo de prueba es muy útil para asegurar que el endpoint devuelve estructuras JSON razonables y estables.

## Qué relación tiene esto con serialización

Muy fuerte.

La capa web es donde la serialización a JSON se vuelve visible para el cliente.

Por eso, si querés verificar:

- que un campo está
- que un campo no está
- que una lista sale bien
- que la estructura JSON coincide con el contrato

entonces `@WebMvcTest` es una herramienta muy apropiada.

## Qué no conviene pedirle a @WebMvcTest

No conviene usarlo para responder preguntas como:

- si el repository guarda bien en la base
- si la query JPA devuelve los registros correctos
- si el service aplica bien una lógica interna compleja sin depender del controller
- si una migración Flyway está correcta
- si PostgreSQL está bien configurado

Todo eso pertenece a otras capas o a otros tipos de tests.

## Qué relación tiene esto con velocidad de feedback

Muy buena.

`@WebMvcTest` suele ser mucho más liviano que arrancar toda la aplicación completa para una pregunta estrictamente web.

Eso hace que sea muy útil en el día a día para verificar endpoints de forma enfocada.

## Un muy buen mapa mental

Podés pensar así:

### Si quiero probar...
- status HTTP
- request body
- validación web
- JSON de respuesta
- path variables
- traducción de excepciones a status

### entonces `@WebMvcTest` es muy buen candidato.

Ese mapa ya te ordena muchísimo.

## Qué relación tiene esto con el service mockeado

Es central.

El service mockeado te permite forzar escenarios muy cómodamente.

Por ejemplo:

- devolver un DTO feliz
- lanzar `ProductoNoEncontradoException`
- lanzar `ProductoDuplicadoException`
- devolver una lista
- no hacer nada en delete

Eso te permite probar el comportamiento web sin depender de infraestructura que no corresponde a la pregunta del test.

## Una diferencia importante con @SpringBootTest

No hace falta profundizar todavía en toda la comparación, pero conviene sembrar esta idea:

- `@WebMvcTest` → slice web enfocado
- `@SpringBootTest` → contexto mucho más amplio

Entonces si solo querés probar controllers y contrato HTTP, `@WebMvcTest` suele ser una herramienta mucho más precisa.

## Qué gana el proyecto con este tipo de tests

Muchísimo.

Por ejemplo:

- cambios en endpoints más seguros
- validación más confiable
- respuestas JSON más controladas
- manejo de errores HTTP más verificable
- refactors web con red de seguridad

Eso mejora bastante la calidad visible de la API.

## Qué relación tiene esto con frontend

Muy directa.

La capa web es lo que el frontend consume.

Entonces tener tests que verifiquen:

- status
- JSON
- errores
- validación

es una forma muy concreta de cuidar el contrato que ve el cliente real.

## Qué relación tiene esto con DTOs

Muy fuerte.

Como el controller trabaja con DTOs y JSON, los tests web son un gran lugar para verificar si esos DTOs se exponen como esperás.

Por ejemplo:

- que aparezca `titulo`
- que aparezca `precio`
- que no aparezcan campos de entidad que no querías filtrar
- que la estructura del response sea la correcta

Eso ayuda muchísimo a mantener el contrato HTTP bajo control.

## Error común: querer probar persistencia real con @WebMvcTest

Eso desordena el objetivo del test.
Si la pregunta es de JPA o de repository, hay mejores herramientas.

## Error común: no probar validación HTTP porque “ya está en el DTO”

Aunque la anotación esté en el DTO, lo importante desde la capa web es verificar el comportamiento visible del endpoint:

- ¿rechaza?
- ¿devuelve 400?
- ¿cumple el contrato esperado?

Eso sí merece pruebas.

## Error común: usar solo tests de service y nunca verificar el contrato HTTP

Eso deja sin cubrir una parte crucial del backend:
lo que realmente ve el cliente de la API.

## Error común: querer que @WebMvcTest pruebe toda la lógica de negocio

No es su rol.
Su misión es más bien asegurar el comportamiento web.
La lógica del caso de uso ya tiene un lugar mejor en tests de service.

## Error común: no incluir el manejo de errores dentro de la estrategia de test web

Los errores HTTP también forman parte del contrato.

Por eso es muy valioso verificar casos como:

- `404`
- `409`
- `400`

y no solo la rama feliz.

## Qué todavía no estás viendo del todo

Este tema te da la base conceptual y práctica, pero todavía no estamos entrando a fondo en cosas como:

- configuración adicional del slice cuando hay seguridad
- serialización más compleja
- custom ObjectMapper
- pruebas más avanzadas de headers
- assertions más expresivas sobre errores JSON
- comparación con tests de integración full stack

Todo eso puede venir después.

Lo importante ahora es fijar bien la idea madre:

> la capa web se puede probar de forma enfocada con `@WebMvcTest`, usando `MockMvc` y mocks del service para verificar contrato HTTP sin levantar toda la aplicación.

## Relación con Spring Boot

Spring Boot tiene muy buen soporte para testing por slices, y `@WebMvcTest` es una de las herramientas más valiosas de esa estrategia porque encaja perfecto con la arquitectura por capas:

- repository → persistencia
- service → lógica
- controller → web

Aprender a usarlo bien es una gran inversión para construir APIs más confiables.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> `@WebMvcTest` permite probar controllers, validación, JSON y códigos HTTP de forma enfocada, usando `MockMvc` y mocks del service para verificar el contrato web sin mezclar innecesariamente persistencia ni levantar toda la aplicación completa.

## Resumen

- `@WebMvcTest` está pensado para probar la capa web de forma enfocada.
- Es ideal para verificar rutas, verbos, request bodies, validación, JSON y status HTTP.
- `MockMvc` permite simular requests al controller dentro del contexto de test.
- El service suele mockearse porque no es el foco del test web.
- Estos tests no reemplazan a los de service ni a los de repository; responden otras preguntas.
- Son muy valiosos para cuidar el contrato visible de la API.
- Este tema completa muy bien la estrategia de testing por capas en Spring Boot.

## Próximo tema

En el próximo tema vas a ver cuándo conviene usar `@SpringBootTest` y tests más integrados, para cubrir escenarios donde sí tiene sentido levantar bastante más del sistema y verificar que varias capas colaboren juntas.
