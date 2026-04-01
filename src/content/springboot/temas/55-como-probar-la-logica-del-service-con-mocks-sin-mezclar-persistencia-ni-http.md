---
title: "Cómo probar la lógica del service con mocks sin mezclar persistencia ni HTTP"
description: "Entender cómo testear la capa service en Spring Boot usando mocks para aislar el caso de uso, verificar reglas de negocio y evitar mezclar en una misma prueba responsabilidades que pertenecen a persistencia o a la capa web."
order: 55
module: "Testing en Spring Boot"
level: "base"
draft: false
---

En el tema anterior viste cómo usar `@DataJpaTest` para probar repositories, entidades y consultas JPA sin levantar toda la aplicación completa.

Eso fue muy importante porque te permitió separar mejor:

- preguntas de persistencia
- queries reales
- mapeos JPA
- comportamiento de la capa de datos

Ahora toca la siguiente capa natural del backend:

**el service**

Y acá cambia bastante el foco.

Porque cuando probás un service, normalmente ya no querés responder cosas como:

- si una query derivada funciona
- si la tabla está bien mapeada
- si la paginación de JPA devuelve el orden correcto

Ahora las preguntas suelen ser más parecidas a estas:

- ¿la lógica del caso de uso toma la decisión correcta?
- ¿si ya existe un producto, se lanza la excepción adecuada?
- ¿si el recurso no existe, se responde con el flujo esperado?
- ¿si todo sale bien, se guarda lo que corresponde?
- ¿se llama al mapper correctamente?
- ¿se evita guardar cuando no debería guardarse?

Es decir:

> la capa service se prueba mucho más como lógica de negocio o de aplicación que como persistencia o HTTP.

Y para eso, una herramienta muy común es usar **mocks**.

Este tema es clave porque te ayuda a entender cómo aislar el caso de uso para verificar su lógica sin mezclar bases de datos reales ni endpoints web cuando no hacen falta.

## Qué significa probar un service

Probar un service significa verificar que el caso de uso haga lo correcto con sus dependencias.

Por ejemplo, si tenés un `ProductoService`, te interesa saber cosas como:

- si consulta el repository cuando debe
- si no guarda cuando detecta un conflicto
- si lanza excepciones de negocio correctas
- si transforma la entrada de la forma esperada
- si devuelve el resultado correcto

La idea central es esta:

> el service coordina lógica, reglas y flujo.

Por eso el test del service debería enfocarse en eso.

## Por qué no conviene meter persistencia real en todos los tests de service

Porque si querés probar solo la lógica del caso de uso, traer una base real puede meter ruido innecesario.

Por ejemplo, supongamos este método:

```java
@Transactional
public ProductoResponse crear(CrearProductoRequest request) {
    if (productoRepository.existsByTitulo(request.getTitulo())) {
        throw new ProductoDuplicadoException("Ya existe un producto con ese título");
    }

    Producto producto = productoMapper.toEntity(request);
    Producto guardado = productoRepository.save(producto);

    return productoMapper.toResponse(guardado);
}
```

Si lo que querés verificar es:

- que detecta conflicto por título repetido
- que no intenta guardar en ese caso
- que si no hay conflicto guarda y devuelve response

entonces no necesariamente necesitás una base real para esas preguntas.

Lo que necesitás es controlar el comportamiento de las dependencias.

Ahí entran los mocks.

## Qué es un mock en este contexto

Podés pensar un mock como una dependencia simulada y controlable.

Por ejemplo:

- un repository simulado
- un mapper simulado

No estás probando que el repository real funcione.
Eso ya lo probarías mejor en la capa repository.

Acá lo usás como colaborador controlado para hacer preguntas sobre el service.

Dicho de forma simple:

> el mock te permite decidir qué devuelve una dependencia y luego verificar cómo reacciona el service frente a eso.

## Por qué esto es tan útil

Porque hace que el test del service sea:

- más rápido
- más enfocado
- más fácil de leer
- más fácil de diagnosticar
- menos acoplado a infraestructura externa

Y además te permite probar ramas de comportamiento que serían más incómodas de inducir si dependieras siempre de persistencia real.

## Un ejemplo base de service

Supongamos este service:

```java
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final ProductoMapper productoMapper;

    public ProductoService(ProductoRepository productoRepository, ProductoMapper productoMapper) {
        this.productoRepository = productoRepository;
        this.productoMapper = productoMapper;
    }

    @Transactional
    public ProductoResponse crear(CrearProductoRequest request) {
        if (productoRepository.existsByTitulo(request.getTitulo())) {
            throw new ProductoDuplicadoException("Ya existe un producto con ese título");
        }

        Producto producto = productoMapper.toEntity(request);
        Producto guardado = productoRepository.save(producto);

        return productoMapper.toResponse(guardado);
    }

    @Transactional(readOnly = true)
    public ProductoResponse obtener(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ProductoNoEncontradoException("No existe el producto " + id));

        return productoMapper.toResponse(producto);
    }

    @Transactional
    public void eliminar(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ProductoNoEncontradoException("No existe el producto " + id));

        productoRepository.delete(producto);
    }
}
```

Este service ya es un gran candidato para tests de lógica con mocks.

## Qué dependencias tiene este service

Tiene dos dependencias principales:

- `ProductoRepository`
- `ProductoMapper`

Eso significa que, si querés probar el service en aislamiento, podés simular ambas.

No querés probar si el repository real consulta bien la base.
Querés probar qué hace el service según lo que el repository le informa.

## Un primer ejemplo de test con mocks

```java
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private ProductoMapper productoMapper;

    private ProductoService productoService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        productoService = new ProductoService(productoRepository, productoMapper);
    }

    @Test
    void crear_deberiaLanzarExcepcion_siTituloYaExiste() {
        CrearProductoRequest request = new CrearProductoRequest();
        request.setTitulo("Notebook");
        request.setPrecio(2500);
        request.setStock(10);

        when(productoRepository.existsByTitulo("Notebook")).thenReturn(true);

        assertThatThrownBy(() -> productoService.crear(request))
                .isInstanceOf(ProductoDuplicadoException.class)
                .hasMessage("Ya existe un producto con ese título");

        verify(productoRepository, never()).save(any());
    }
}
```

Este test ya muestra perfectamente el espíritu de la capa service.

## Cómo leer este test

Podés leerlo así:

- preparo el request
- defino que el repository informe que el título ya existe
- ejecuto el método del service
- verifico que se lanza la excepción correcta
- verifico que no se intenta guardar nada

Esto responde una pregunta de lógica del caso de uso, no de persistencia real.

## Qué está probando exactamente este test

No está probando:

- si el repository consulta bien PostgreSQL
- si `existsByTitulo` funciona de verdad en la base
- si la entidad JPA está bien mapeada

Está probando esto:

> si el repository informa conflicto, el service corta el flujo y reacciona correctamente.

Eso es exactamente el rol del test de service.

## Un segundo ejemplo: creación exitosa

```java
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private ProductoMapper productoMapper;

    private ProductoService productoService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        productoService = new ProductoService(productoRepository, productoMapper);
    }

    @Test
    void crear_deberiaGuardarYDevolverResponse_siNoHayConflicto() {
        CrearProductoRequest request = new CrearProductoRequest();
        request.setTitulo("Notebook");
        request.setPrecio(2500);
        request.setStock(10);

        Producto entidad = new Producto();
        entidad.setTitulo("Notebook");
        entidad.setPrecio(2500);
        entidad.setStock(10);

        Producto guardado = new Producto();
        guardado.setTitulo("Notebook");
        guardado.setPrecio(2500);
        guardado.setStock(10);
        guardado.setActivo(true);

        ProductoResponse response = new ProductoResponse();
        response.setId(1L);
        response.setTitulo("Notebook");
        response.setPrecio(2500);
        response.setStock(10);
        response.setActivo(true);

        when(productoRepository.existsByTitulo("Notebook")).thenReturn(false);
        when(productoMapper.toEntity(request)).thenReturn(entidad);
        when(productoRepository.save(entidad)).thenReturn(guardado);
        when(productoMapper.toResponse(guardado)).thenReturn(response);

        ProductoResponse resultado = productoService.crear(request);

        assertThat(resultado.getTitulo()).isEqualTo("Notebook");
        assertThat(resultado.getPrecio()).isEqualTo(2500);

        verify(productoRepository).existsByTitulo("Notebook");
        verify(productoMapper).toEntity(request);
        verify(productoRepository).save(entidad);
        verify(productoMapper).toResponse(guardado);
    }
}
```

Este test muestra la rama feliz del caso de uso.

## Qué gana este test con mocks

Muchísimo.

Porque controla completamente el escenario:

- el repository dice que no hay conflicto
- el mapper transforma el request
- el save devuelve una entidad “guardada”
- el mapper devuelve un response final

Así podés verificar claramente:

- orden lógico del flujo
- interacciones esperadas
- resultado devuelto

sin depender de infraestructura externa.

## Un ejemplo para obtener por id

```java
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private ProductoMapper productoMapper;

    private ProductoService productoService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        productoService = new ProductoService(productoRepository, productoMapper);
    }

    @Test
    void obtener_deberiaDevolverResponse_siExisteProducto() {
        Producto producto = new Producto();
        producto.setTitulo("Notebook");
        producto.setPrecio(2500);
        producto.setStock(10);

        ProductoResponse response = new ProductoResponse();
        response.setId(1L);
        response.setTitulo("Notebook");
        response.setPrecio(2500);
        response.setStock(10);
        response.setActivo(true);

        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
        when(productoMapper.toResponse(producto)).thenReturn(response);

        ProductoResponse resultado = productoService.obtener(1L);

        assertThat(resultado.getTitulo()).isEqualTo("Notebook");
        verify(productoRepository).findById(1L);
        verify(productoMapper).toResponse(producto);
    }
}
```

Otra vez, el foco está clarísimo:
qué hace el service si el repository devuelve un producto.

## Un ejemplo para el caso not found

```java
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private ProductoMapper productoMapper;

    private ProductoService productoService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        productoService = new ProductoService(productoRepository, productoMapper);
    }

    @Test
    void obtener_deberiaLanzarExcepcion_siNoExisteProducto() {
        when(productoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productoService.obtener(99L))
                .isInstanceOf(ProductoNoEncontradoException.class)
                .hasMessage("No existe el producto 99");

        verify(productoMapper, never()).toResponse(any());
    }
}
```

Este tipo de test es muy valioso porque verifica una regla del flujo, no una query.

## Qué tipo de preguntas responde muy bien un test de service con mocks

Por ejemplo:

- ¿si ya existe el título, se rechaza la creación?
- ¿si no existe el recurso, se lanza excepción?
- ¿si todo sale bien, se llama a save?
- ¿se llama al mapper correcto?
- ¿no se sigue con el flujo cuando aparece un error?
- ¿se borra solo si el recurso existe?

Todas esas son preguntas muy propias del caso de uso.

## Qué no responde bien

No responde bien preguntas como:

- ¿la query real encuentra resultados en PostgreSQL?
- ¿JPA mapea bien esta entidad?
- ¿la paginación funciona realmente contra la base?
- ¿el endpoint responde `400`?
- ¿el JSON tiene la forma correcta?

Para esas preguntas hay mejores lugares:

- repository
- controller
- tests más integrados según el caso

## Qué relación tiene esto con mocks y confianza

A veces se dice “pero con mocks no estoy probando lo real”.

Y eso es cierto si pretendés que un test de service con mocks verifique persistencia real.
Pero no esa es su misión.

La misión acá es otra:

> verificar la lógica del service aislada de infraestructura externa.

Eso también es “real”, solo que a otro nivel del sistema.

## Una intuición muy importante

Podés pensar así:

- test de repository → confianza en acceso a datos
- test de service con mocks → confianza en lógica y flujo
- test de controller → confianza en contrato HTTP

Cada uno aporta una pieza diferente de seguridad.

## Por qué esto mejora el diagnóstico

Porque si un test de service falla, la pregunta suele quedar bastante acotada:

- una condición lógica está mal
- una excepción no se lanza
- una interacción esperada no ocurrió
- el flujo siguió cuando no debía
- el mapper no se usó correctamente

Eso es mucho más fácil de rastrear que un test que mezcla todo.

## Qué relación tiene esto con el diseño limpio

Muy fuerte.

Si tu service está bien separado, probarlo con mocks suele ser bastante natural.

En cambio, si tu lógica está:

- mezclada con HTTP
- mezclada con queries manuales desperdigadas
- metida en controllers enormes
- acoplada a demasiadas dependencias

entonces también se vuelve más incómodo de probar.

En ese sentido, los tests a veces te muestran si la arquitectura realmente está sana.

## Un ejemplo de señal de mala salud

Si para probar que `crear(...)` rechaza un título duplicado necesitás:

- arrancar toda la app
- hacer una llamada HTTP
- usar PostgreSQL real
- tocar varias capas a la vez

quizá hay una pregunta más profunda:
¿la lógica del caso de uso está demasiado acoplada?

No siempre, pero muchas veces sí.

## Qué relación tiene esto con `@Transactional`

Cuando probás lógica del service con mocks, normalmente no estás verificando el comportamiento transaccional real de la base.

Y eso está bien.

Porque de nuevo, el objetivo del test no es probar toda la infraestructura persistente.
Es probar el flujo lógico.

Si más adelante querés verificar interacciones más completas con persistencia real, ahí aparecerán otros tipos de test.

## Qué relación tiene esto con el mapper

El mapper aparece mucho en la capa service.
Entonces tenés una decisión interesante:

- mockearlo
- o en algunos casos usar uno real simple

En este curso, para fijar bien la idea de aislamiento, tiene mucho sentido mostrarlo mockeado.

Eso deja clarísimo que el test está concentrado en el service y no en la transformación en sí.

Más adelante, según el tamaño del mapper y el estilo del proyecto, podrías decidir otras variantes.

## Qué relación tiene esto con las excepciones de negocio

Muy directa.

La capa service es uno de los lugares más naturales para probar que se lancen excepciones de negocio correctas.

Por ejemplo:

- `ProductoDuplicadoException`
- `ProductoNoEncontradoException`
- `StockInsuficienteException`

Eso es muy valioso porque esas excepciones expresan semántica del caso de uso.

## Una muy buena costumbre

Nombrar los tests de service como reglas claras del flujo.

Por ejemplo:

- `crear_deberiaLanzarExcepcion_siTituloYaExiste`
- `obtener_deberiaLanzarExcepcion_siNoExisteProducto`
- `eliminar_deberiaBorrar_siExisteProducto`
- `actualizar_deberiaGuardarCambios_siNoHayConflicto`

Este estilo ayuda muchísimo a que el test cuente una historia clara del negocio.

## Un ejemplo para eliminar

```java
import static org.mockito.Mockito.*;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private ProductoMapper productoMapper;

    private ProductoService productoService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        productoService = new ProductoService(productoRepository, productoMapper);
    }

    @Test
    void eliminar_deberiaBorrarProducto_siExiste() {
        Producto producto = new Producto();
        producto.setTitulo("Notebook");

        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));

        productoService.eliminar(1L);

        verify(productoRepository).delete(producto);
    }
}
```

Este test es muy concreto y va directo al punto.

## Otro ejemplo para no borrar si no existe

```java
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private ProductoMapper productoMapper;

    private ProductoService productoService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        productoService = new ProductoService(productoRepository, productoMapper);
    }

    @Test
    void eliminar_noDeberiaBorrar_siNoExisteProducto() {
        when(productoRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productoService.eliminar(1L))
                .isInstanceOf(ProductoNoEncontradoException.class)
                .hasMessage("No existe el producto 1");

        verify(productoRepository, never()).delete(any());
    }
}
```

Esto refuerza muy bien una regla del caso de uso.

## Qué relación tiene esto con velocidad de feedback

Muy buena.

Los tests de service con mocks suelen dar feedback bastante rápido porque:

- no levantan toda la app
- no necesitan base real
- no dependen de HTTP
- se enfocan en objetos y flujo

Eso los vuelve muy cómodos para refactorizar y para trabajar en el día a día.

## Qué relación tiene esto con cobertura útil

También muy buena.

Si tenés bien cubiertas ramas como:

- éxito
- conflicto
- not found
- no guardar
- sí guardar
- borrar / no borrar

entonces el service gana mucha robustez.

No porque mágicamente no vaya a romperse nunca, sino porque las decisiones principales del caso de uso quedan vigiladas.

## Qué todavía no estás viendo del todo

Este tema es conceptual y práctico, pero todavía no entramos profundamente en cosas como:

- anotaciones específicas para integración de Mockito con JUnit
- mejores estilos de setup
- diferencias más finas entre mocks, spies y stubs
- BDD Mockito
- captors
- verify más avanzados
- tests de service con Spring context vs sin contexto

Todo eso puede venir más adelante.

Lo importante acá es fijar bien la idea madre:

> la capa service se puede probar muy bien en aislamiento usando mocks para controlar dependencias y verificar reglas del caso de uso.

## Una muy buena pregunta antes de escribir un test de service

Podés preguntarte:

> ¿la pregunta que quiero responder es sobre el flujo lógico del caso de uso y la reacción del service frente a sus dependencias?

Si la respuesta es sí, un test con mocks probablemente sea muy adecuado.

## Error común: querer probar persistencia real en un test de service con mocks

Eso mezcla objetivos.
Si querés persistencia real, el repository tiene mejores herramientas.
El test de service no necesita cargar con todo eso.

## Error común: no verificar interacciones importantes

A veces el test mira solo el resultado y no verifica cosas clave como:

- que no se llamó a `save`
- que sí se llamó al mapper
- que no se llamó a `delete`
- que se consultó el repository con el id correcto

Verificar interacciones puede ser muy útil cuando la lógica del service consiste justamente en decidir qué pasos ocurren y cuáles no.

## Error común: mockear tanto que el test ya no cuenta nada útil

También puede pasar el otro extremo.

Si el test se vuelve una coreografía artificial de mocks sin una historia clara del caso de uso, pierde valor.

La clave es que el test responda una pregunta real del flujo del negocio.

## Error común: usar el service para probar JSON o status HTTP

Eso ya pertenece al controller.
No conviene pedirle al test de service que responda preguntas de capa web.

## Relación con Spring Boot

Spring Boot encaja muy bien con esta forma de testear porque su arquitectura por capas hace muy natural que:

- repositories se prueben como persistencia
- services como lógica
- controllers como web

Aprender a probar el service con mocks es una parte muy importante de dominar esa separación y sacarle provecho real en proyectos más grandes.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> probar la capa service con mocks permite verificar reglas de negocio, decisiones de flujo e interacciones con dependencias de forma rápida y enfocada, sin mezclar en la misma prueba persistencia real ni contrato HTTP cuando la pregunta que querés responder pertenece claramente al caso de uso.

## Resumen

- La capa service se prueba mejor enfocándose en lógica del caso de uso.
- Los mocks permiten controlar el comportamiento de repositories y mappers.
- Estos tests son ideales para verificar excepciones de negocio, ramas de decisión y flujo.
- No reemplazan a los tests de repository ni a los de controller; cumplen otra función.
- Ayudan mucho a diagnosticar fallos de lógica con rapidez y claridad.
- Verificar interacciones importantes también suele aportar mucho valor.
- Este tema prepara el terreno para pasar luego a la capa web y probar endpoints sin confundir responsabilidades.

## Próximo tema

En el próximo tema vas a ver cómo probar endpoints con `@WebMvcTest` y herramientas orientadas a la capa web, para verificar rutas, validación, JSON y códigos HTTP sin levantar toda la aplicación completa.
