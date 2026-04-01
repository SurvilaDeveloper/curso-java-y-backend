---
title: "Cómo probar repositories, services y endpoints en Spring Boot sin mezclarlo todo"
description: "Entender cómo pensar los tests en Spring Boot según la capa que querés verificar, qué diferencia hay entre probar repositories, services y endpoints, y por qué separar bien los tipos de prueba mejora muchísimo la confianza en el backend."
order: 53
module: "Testing en Spring Boot"
level: "base"
draft: false
---

En el tema anterior viste cómo diseñar un CRUD completo de punta a punta con:

- controller
- service
- repository
- DTOs
- validación
- manejo de errores
- entidad
- PostgreSQL
- migraciones
- arquitectura por capas

Eso ya te permite construir features reales.

Pero aparece una pregunta crucial:

> ¿cómo sabés que todo eso realmente funciona bien y seguirá funcionando cuando el proyecto crezca o cambie?

Porque una cosa es que el código “parezca razonable”.
Otra muy distinta es tener una forma sistemática de verificarlo.

Ahí entra el mundo del testing.

Y una de las primeras ideas importantes en Spring Boot es esta:

> no conviene probar todo siempre del mismo modo ni mezclar en un solo test todas las capas del sistema.

Este tema es clave porque te ayuda a construir una mirada mucho más ordenada del testing:

- qué conviene probar en cada capa
- qué diferencia hay entre probar repository, service y endpoint
- por qué mezclarlo todo vuelve más confusas las pruebas
- cómo empezar a ganar confianza real en el backend sin depender solo de pruebas manuales

## El problema de “probar todo junto”

Supongamos que tenés una feature de productos con:

- `ProductoController`
- `ProductoService`
- `ProductoRepository`
- DTOs
- validación
- PostgreSQL

Una posibilidad sería decir:

> bueno, hago un solo test enorme que arranque todo, llame al endpoint, toque la base, valide el JSON, cubra errores y listo.

Eso a veces puede servir para ciertos casos.
Pero como estrategia única trae varios problemas:

- cuesta aislar qué falló
- los tests pueden volverse pesados
- debugging más difícil
- demasiadas responsabilidades mezcladas
- feedback más lento
- cobertura menos precisa por capa

Por eso, en Spring Boot y en backend en general, suele ser muy valioso distinguir tipos de pruebas según el nivel del sistema que querés verificar.

## La idea general

Podés pensar el testing del backend por capas más o menos así:

### Repository
Quiero verificar acceso a datos y persistencia.

### Service
Quiero verificar lógica del caso de uso y reglas del negocio o de aplicación.

### Controller / Endpoint
Quiero verificar contrato HTTP, validación, serialización y respuestas.

Esta separación es muy poderosa porque alinea los tests con la arquitectura del proyecto.

## Por qué conviene separar los tests según la capa

Porque cada capa tiene responsabilidades distintas.

Entonces también tiene sentido que las preguntas de test sean distintas.

Por ejemplo:

### Repository
- ¿guarda bien?
- ¿busca bien?
- ¿la query derivada funciona?
- ¿la paginación devuelve lo esperado?

### Service
- ¿lanza la excepción correcta si no existe el recurso?
- ¿valida conflicto de unicidad?
- ¿mapea y coordina bien el flujo?
- ¿aplica reglas del caso de uso?

### Controller
- ¿el endpoint responde con el status correcto?
- ¿acepta el body esperado?
- ¿la validación devuelve 400?
- ¿el JSON sale con la forma correcta?

Estas preguntas no son exactamente iguales.
Y por eso tampoco conviene probarlas todas siempre del mismo modo.

## Qué significa probar un repository

Probar un repository significa verificar que la capa de persistencia haga bien lo que promete.

Por ejemplo:

- `save`
- `findById`
- `findByTitulo`
- `existsByTitulo`
- paginación
- queries derivadas
- queries con `@Query`

Acá el foco no está en HTTP ni en el controller.
Está en la interacción con la base y el comportamiento del acceso a datos.

## Un ejemplo mental de test de repository

Supongamos:

```java
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    boolean existsByTitulo(String titulo);

    Optional<Producto> findByTitulo(String titulo);
}
```

Un test de repository podría verificar cosas como:

- si guardo un producto con cierto título, luego `findByTitulo` lo encuentra
- si no existe, `findByTitulo` devuelve vacío
- `existsByTitulo` responde bien
- una query paginada devuelve el orden esperado

Ese tipo de test se enfoca en persistencia y consultas.

## Qué significa probar un service

Probar un service significa verificar el comportamiento del caso de uso o de la lógica que coordina el sistema.

Por ejemplo:

- si intento crear un producto duplicado, lanza `ProductoDuplicadoException`
- si pido un producto inexistente, lanza `ProductoNoEncontradoException`
- si actualizo, aplica bien los cambios
- si elimino, valida existencia antes de borrar

Acá el foco ya no es “la query SQL funciona”.
El foco es:

> ¿la lógica del service hace lo que debería hacer?

## Un ejemplo mental de test de service

Supongamos este método:

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

Un test de service podría preguntar:

- si `existsByTitulo` devuelve true, ¿se lanza la excepción correcta?
- si no existe, ¿se guarda el producto?
- ¿el mapper se usa como corresponde?
- ¿el resultado final devuelve un DTO coherente?

Ese test está mucho más orientado al flujo del caso de uso.

## Qué significa probar un endpoint o controller

Probar un endpoint significa verificar la capa HTTP.

Por ejemplo:

- si hago `POST /productos` con un body válido, ¿responde `201`?
- si el body es inválido, ¿responde `400`?
- si pido un recurso inexistente, ¿responde `404`?
- si todo sale bien, ¿la estructura JSON es la esperada?
- ¿la validación entra en juego correctamente?
- ¿los parámetros de la request se interpretan bien?

Acá el foco es el contrato web.

## Un ejemplo mental de test de controller

Supongamos este endpoint:

```java
@PostMapping
public ResponseEntity<ProductoResponse> crear(@Valid @RequestBody CrearProductoRequest request) {
    ProductoResponse response = productoService.crear(request);
    return ResponseEntity.status(201).body(response);
}
```

Un test de controller podría verificar:

- que con un JSON correcto responde `201`
- que con título vacío responde `400`
- que si el service lanza `ProductoDuplicadoException` se devuelve `409`
- que el JSON de salida contiene `id`, `titulo`, `precio`, etc.

Esto ya es otra capa completamente distinta del repository.

## Por qué mezclar todo en un mismo test puede confundir

Porque si algo falla, no está claro dónde está el problema.

Por ejemplo, un test gigantesco puede fallar por:

- error de configuración de base
- query incorrecta
- mapper roto
- validación mal declarada
- error del controller
- respuesta JSON inesperada

Y entonces el diagnóstico se vuelve más pesado.

En cambio, si tenés tests mejor separados:

- el repository te dice si la persistencia falla
- el service te dice si la lógica falla
- el controller te dice si el contrato HTTP falla

Eso te da muchísimo más control.

## Una buena regla mental

Podés pensarlo así:

- si quiero probar la base o las queries → repository
- si quiero probar decisiones y flujo del caso de uso → service
- si quiero probar request/response y contrato HTTP → controller

Esta regla ya ordena muchísimo.

## Tipos de prueba y costo

Otra idea importante es que no todos los tests cuestan lo mismo.

En general:

- probar lógica aislada suele ser más rápido
- probar capa web puede ser más costoso
- probar persistencia real puede ser más costoso todavía
- arrancar toda la app completa suele ser más pesado que probar una capa específica

Por eso suele ser muy sano combinar distintos tipos de tests en lugar de depender solo del más pesado o solo del más liviano.

## El testing no es una sola cosa

Esto es central.

A veces se habla de “hacer tests” como si fuera una única actividad homogénea.

Pero en realidad puede haber:

- tests más chicos y enfocados
- tests de integración entre capas
- tests de persistencia
- tests de endpoints
- tests del caso de uso
- tests más completos de extremo a extremo

No hace falta resolver hoy toda la taxonomía del universo del testing.
Pero sí conviene quedarte con esta idea:

> probar bien el backend implica elegir qué capa querés verificar y no usar siempre la misma forma para todo.

## Un ejemplo concreto con Producto

Supongamos que tenés este CRUD:

- crear producto
- obtener producto
- listar productos
- actualizar producto
- eliminar producto

Podrías tener preguntas de test como estas:

### Repository
- ¿`findByTitulo("Notebook")` encuentra el producto guardado?
- ¿`existsByTitulo("Notebook")` devuelve true cuando corresponde?

### Service
- ¿crear con título duplicado lanza excepción?
- ¿obtener por id inexistente lanza not found?
- ¿actualizar cambia los datos correctamente?

### Controller
- ¿`POST /productos` devuelve `201`?
- ¿`GET /productos/999` devuelve `404`?
- ¿un body inválido devuelve `400`?

Ese esquema ya te da una estrategia muchísimo más ordenada.

## Qué gana el proyecto con esta separación

Muchísimo.

Por ejemplo:

- tests más legibles
- fallos más fáciles de diagnosticar
- menos ruido
- mejor alineación con la arquitectura
- feedback más claro sobre qué capa se rompió
- más confianza al refactorizar

No es solo una preferencia estética.
Tiene mucho valor práctico.

## Qué relación tiene esto con la arquitectura por capas

Muy fuerte.

Si ya venías separando:

- controller
- service
- repository

tiene muchísimo sentido que el testing también refleje esa separación.

De algún modo, los tests también pueden ser una forma de verificar que la arquitectura tiene fronteras sanas.

Si te cuesta muchísimo testear por capas, a veces eso también puede ser una señal de diseño mezclado.

## Un ejemplo de mala señal

Imaginá que para probar una regla de negocio simple del service necesitás levantar media aplicación completa, tocar la base y pasar por HTTP.

Eso quizá indica que la lógica está demasiado acoplada o mal ubicada.

No siempre, pero a veces es una pista importante.

## Qué gana el aprendizaje con esta forma de pensar

Muchísimo.

Porque cuando recién arrancás con testing, es muy común sentirse abrumado y pensar:

- no sé qué probar
- no sé dónde poner el foco
- no sé si tengo que levantar toda la app
- no sé si esto es unitario o de integración
- no sé si estoy haciendo demasiado o demasiado poco

Separar por capa baja muchísimo la niebla.

## Una estrategia progresiva sana

Podés avanzar más o menos así:

1. primero entendé qué preguntas corresponde hacer en repository, service y controller
2. después aprendé a escribir tests de cada capa
3. luego combiná eso con algunos tests más integrados cuando haga falta

Este orden suele ser mucho más pedagógico que empezar directamente por el test más grande y confuso posible.

## Qué papel juegan los DTOs y la validación en los tests

También muy importante.

En la capa controller, los tests suelen ser un gran lugar para verificar:

- que un body válido entra bien
- que un body inválido dispara `400`
- que el JSON de salida tiene la forma esperada
- que no se filtran campos de más

Esto conecta directamente con todo lo que viste sobre contratos HTTP y separación entre entidades y DTOs.

## Qué papel juegan las excepciones de negocio en los tests

En la capa service y en la capa controller también cobran mucho valor.

Por ejemplo:

- el service puede testear que lanza `ProductoDuplicadoException`
- el controller puede testear que esa excepción termina convertida en `409 Conflict`

Esto muestra cómo las capas se complementan sin testear exactamente lo mismo.

## Una intuición muy valiosa

Podés pensar así:

### Repository
¿Los datos y consultas funcionan?

### Service
¿La lógica y reglas funcionan?

### Controller
¿El contrato HTTP funciona?

Esta triada es extremadamente útil.

## ¿Hace falta probar absolutamente todo en todas las capas?

No necesariamente.

No se trata de duplicar mecánicamente todas las pruebas en todos lados.

Se trata más bien de que cada capa cubra bien su responsabilidad.

Por ejemplo:

- no hace falta que el controller vuelva a probar toda la lógica interna del service como si fuera el service
- no hace falta que el repository pruebe validación HTTP
- no hace falta que el service pruebe serialización JSON

Cada capa aporta confianza sobre una parte distinta del sistema.

## Un ejemplo de mal enfoque

Probar una query JPA compleja solo a través de un endpoint final y nunca verificarla directamente en persistencia.

Eso puede funcionar, pero el diagnóstico del problema será mucho más torpe si algo falla.

## Otro ejemplo de mal enfoque

Probar el controller como si también debiera verificar toda la semántica de persistencia real, cuando en realidad el foco del controller es más el contrato web.

## Un ejemplo de buen enfoque

Tener:

- tests de repository para persistencia y consultas
- tests de service para reglas y flujo
- tests de endpoint para request/response

Y luego, si querés, sumar algunos tests integrados más grandes para escenarios clave.

Eso suele dar una base mucho más sólida.

## Qué relación tiene esto con la velocidad de feedback

Muy directa.

Cuando tenés tests más pequeños y enfocados:

- fallan más cerca del problema
- suelen correr más rápido
- son más fáciles de leer
- te ayudan más al refactorizar

Cuando solo dependés de pruebas enormes, el feedback suele ser más lento y más borroso.

## Qué relación tiene esto con confianza al cambiar código

Una muy fuerte.

Si tenés bien cubiertas las capas, podés cambiar internamente cosas como:

- implementación del service
- mapper
- consulta del repository
- formato de respuesta

y ver rápidamente qué parte se afectó.

Eso te da una seguridad mucho más real al refactorizar.

## Qué todavía no estás viendo del todo

En este tema estamos ordenando la estrategia conceptual.

Todavía no estás entrando a fondo en detalles como:

- `@DataJpaTest`
- `@WebMvcTest`
- `@SpringBootTest`
- mocks
- testcontainers
- H2 vs PostgreSQL real en tests
- assertions específicas
- herramientas de HTTP testing
- slices de Spring

Todo eso va a venir muy naturalmente después.

Pero primero conviene tener muy claro **qué querés probar** y **en qué capa tiene sentido probarlo**.

## Una muy buena pregunta antes de escribir un test

Podés preguntarte:

> ¿qué responsabilidad concreta estoy intentando verificar?

Si la respuesta es:

- “la query” → repository
- “la regla de negocio” → service
- “la respuesta HTTP” → controller

ya tenés una pista muy fuerte de dónde debería vivir ese test.

## Error común: hacer solo tests enormes porque “cubren todo”

A veces parece atractivo porque suena a máxima cobertura.
Pero también puede ser una forma de perder precisión y claridad.

No todo lo que “cubre mucho” diagnostica bien.

## Error común: intentar que todos los tests sean del mismo tipo

No hace falta.
De hecho, suele ser peor.

Cada capa pide un tipo de verificación distinto.

## Error común: probar detalles de una capa desde otra capa

Por ejemplo:

- intentar probar minuciosamente una query del repository solo desde el controller
- intentar probar serialización JSON desde el service
- intentar probar validación HTTP desde el repository

Eso mezcla responsabilidades y complica el diagnóstico.

## Error común: pensar que testing es algo que se agrega solo al final

Cuanto más tarde incorporás esta forma de pensar, más cuesta ordenar los tests después.

En cambio, si desde ahora aprendés a pensar por capa, el proyecto crece mucho más sano.

## Relación con Spring Boot

Spring Boot tiene un ecosistema de testing muy fuerte justamente porque acompaña muy bien este tipo de separación:

- persistencia
- web
- contexto completo
- servicios
- slices de aplicación

Eso hace que aprender testing en Spring Boot sea muy valioso, porque no se trata solo de “hacer asserts”, sino de entender cómo probar un backend real de forma ordenada.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> probar repositories, services y endpoints por separado según la responsabilidad de cada capa permite que el testing en Spring Boot sea mucho más claro, útil y mantenible, en lugar de depender solo de pruebas gigantes donde todo está mezclado y cuesta diagnosticar qué falló realmente.

## Resumen

- No conviene probar todo el backend siempre del mismo modo.
- Repository, service y controller responden a preguntas distintas y por eso conviene probarlos de forma distinta.
- Repository verifica persistencia y consultas.
- Service verifica lógica del caso de uso y reglas.
- Controller verifica contrato HTTP, validación y respuestas.
- Separar bien los tests mejora muchísimo el diagnóstico y la confianza al cambiar código.
- Este tema prepara el terreno para aprender herramientas concretas de testing en Spring Boot por capa.

## Próximo tema

En el próximo tema vas a ver cómo probar repositories con `@DataJpaTest`, que es una de las puertas más naturales para verificar persistencia y consultas sin levantar toda la aplicación completa.
