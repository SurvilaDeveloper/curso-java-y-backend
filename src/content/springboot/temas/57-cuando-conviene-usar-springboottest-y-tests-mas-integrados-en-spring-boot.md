---
title: "Cuándo conviene usar @SpringBootTest y tests más integrados en Spring Boot"
description: "Entender qué aporta @SpringBootTest, en qué se diferencia de los slices como @DataJpaTest o @WebMvcTest y cuándo tiene sentido levantar un contexto más completo para verificar colaboración real entre varias capas del sistema."
order: 57
module: "Testing en Spring Boot"
level: "base"
draft: false
---

En los temas anteriores del bloque de testing viste una idea muy importante:

- no conviene mezclar todas las preguntas del backend en una sola prueba gigante
- repository, service y controller pueden probarse con enfoques distintos
- `@DataJpaTest` ayuda a enfocarse en persistencia
- tests con mocks ayudan a enfocarse en lógica del service
- `@WebMvcTest` ayuda a enfocarse en la capa web y el contrato HTTP

Eso ya te da una base muy buena.

Pero aparece una pregunta natural:

> ¿qué pasa cuando sí quiero verificar que varias capas colaboren juntas y no solo una por separado?

Por ejemplo, a veces querés comprobar cosas como:

- que el endpoint realmente llega al service
- que el service realmente llega al repository
- que el repository realmente persiste
- que la validación, el mapper, el manejo de errores y la base colaboran en un flujo bastante completo
- que una feature real funciona de punta a punta dentro de la aplicación

Ahí entra una herramienta muy importante:

`@SpringBootTest`

Este tema es clave porque te ayuda a entender cuándo conviene pasar de tests por slices a pruebas más integradas, y por qué no siempre tiene sentido levantar todo, pero a veces sí aporta muchísimo valor hacerlo.

## Qué problema resuelve @SpringBootTest

Supongamos que ya tenés por separado:

- tests de repository
- tests de service con mocks
- tests de controller con `@WebMvcTest`

Eso está muy bien.

Pero aun así puede quedarte una duda real del sistema:

> ¿funcionan bien juntas todas estas piezas cuando se ejecutan dentro de un contexto más completo y menos simulado?

Por ejemplo, puede pasar que:

- el controller esté bien aislado
- el service esté bien aislado
- el repository esté bien aislado

y aun así haya un problema en cómo colaboran entre sí en el entorno real de la aplicación.

Entonces aparece la necesidad de tests que cubran más integración entre capas.

Ahí es donde `@SpringBootTest` empieza a tener mucho sentido.

## Qué es @SpringBootTest

`@SpringBootTest` es una anotación que arranca un contexto mucho más completo de Spring Boot.

Dicho de forma simple:

> te permite probar la aplicación con una integración más real entre sus componentes, en lugar de recortar una sola capa como hacías con los slices.

Eso significa que, según cómo lo uses, el test puede trabajar con:

- controller real
- service real
- repository real
- configuración real o casi real
- validación
- contexto de Spring mucho más amplio
- y, en ciertos escenarios, hasta requests HTTP o simuladas sobre una app bastante completa

## La idea general

Podés pensar la diferencia así:

### @DataJpaTest
Quiero enfocarme en persistencia.

### @WebMvcTest
Quiero enfocarme en web.

### test de service con mocks
Quiero enfocarme en lógica aislada.

### @SpringBootTest
Quiero levantar una parte mucho más completa del sistema y verificar colaboración real entre varias capas.

Esta comparación es muy importante porque evita usar `@SpringBootTest` por reflejo para todo.

## Por qué no conviene usar @SpringBootTest para cualquier cosa

Porque tiene más costo.

Levantar un contexto amplio suele implicar:

- más componentes
- más configuración
- más tiempo de arranque
- más superficie de fallo
- mayor complejidad general del test

Entonces no conviene usarlo para preguntas pequeñas y muy específicas que ya responden mejor otras herramientas.

Por ejemplo:

- para una query derivada simple, `@DataJpaTest` suele ser mejor
- para un status HTTP puntual, `@WebMvcTest` suele ser mejor
- para una regla lógica del service, un test aislado con mocks suele ser mejor

`@SpringBootTest` gana valor cuando la pregunta es más integrada.

## Qué preguntas responde bien @SpringBootTest

Por ejemplo:

- ¿esta feature funciona de punta a punta dentro del contexto real?
- ¿el controller, el service y el repository colaboran bien?
- ¿la validación, el mapeo y la persistencia cooperan correctamente?
- ¿el manejo de errores se comporta bien en el flujo integrado?
- ¿la aplicación arranca con la configuración esperada y ejecuta correctamente ciertos casos importantes?

Estas ya no son preguntas tan pequeñas ni tan aisladas.

## Un ejemplo de caso donde tiene mucho sentido

Supongamos una feature de productos con:

- endpoint `POST /productos`
- validación
- service con chequeo de unicidad
- repository JPA
- PostgreSQL o un entorno de persistencia de test
- `@ControllerAdvice`

Podrías querer verificar algo así:

- si mando un request válido, se crea de verdad
- si luego lo consulto, existe de verdad
- si intento crearlo de nuevo, da conflicto de verdad
- todo eso dentro de una app bastante real

Eso ya es una pregunta muy integrada.
Y ahí `@SpringBootTest` se vuelve mucho más razonable.

## Qué significa “más integrado”

Significa que el test deja de simular tantas cosas y empieza a dejar colaborar a varias capas reales.

Por ejemplo:

- el controller real recibe la request
- el service real ejecuta la lógica
- el repository real persiste
- la validación real corre
- las excepciones reales fluyen
- la serialización real responde

Eso se parece mucho más al comportamiento real de la aplicación.

## Qué diferencia hay con un mock

Cuando mockeás el service en `@WebMvcTest`, el controller no habla con el service real.
Habla con una versión simulada.

Eso está perfecto si querés probar solo web.

Pero si querés comprobar la colaboración real:

- controller → service → repository → persistencia

entonces el mock te corta justamente el flujo que querías observar.

Ahí tiene sentido un test más integrado.

## Un ejemplo mental muy útil

Podés pensar la evolución así:

### Test aislado
“¿esta pieza hace bien su trabajo por sí sola?”

### Test integrado
“¿estas piezas hacen bien su trabajo juntas?”

Ambas preguntas son valiosas.
La clave es no confundirlas.

## Un primer ejemplo conceptual

Supongamos que querés probar la creación real de un producto a través del endpoint.

Podrías tener algo conceptual como:

```java
@SpringBootTest
@AutoConfigureMockMvc
class ProductoIntegrationTest {
}
```

Acá aparecen dos ideas juntas:

- `@SpringBootTest` → contexto amplio
- `@AutoConfigureMockMvc` → posibilidad de usar `MockMvc` sobre una aplicación bastante completa

Esto suele ser una combinación muy útil para tests integrados de capa web + service + repository.

## Qué aporta AutoConfigureMockMvc en este escenario

Permite usar `MockMvc`, pero ahora ya no contra un slice web aislado, sino contra un contexto mucho más amplio de la app.

Eso significa que la request puede atravesar más piezas reales del sistema.

No estás limitado a un controller con service mockeado.
Ahora podés dejar que el flujo sea mucho más auténtico.

## Un ejemplo de test integrado de creación

```java
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class ProductoIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void crearProducto_deberiaPersistirYResponder201() throws Exception {
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
                .andExpect(jsonPath("$.titulo").value("Notebook"))
                .andExpect(jsonPath("$.precio").value(2500))
                .andExpect(jsonPath("$.stock").value(10))
                .andExpect(jsonPath("$.activo").value(true));
    }
}
```

La diferencia con `@WebMvcTest` es enorme.

Acá, según cómo esté configurado el proyecto, la request puede atravesar:

- controller real
- service real
- mapper real
- repository real
- persistencia real o casi real del entorno de test

Eso cambia completamente el tipo de confianza que obtenés.

## Qué está probando este test

Algo como esto:

- el endpoint recibe bien el JSON
- la validación deja pasar el body
- el service ejecuta la lógica real
- el repository persiste
- el DTO de salida se arma bien
- la respuesta HTTP sale correcta

Eso ya es mucho más “de punta a punta” dentro del backend.

## Un ejemplo de conflicto integrado

Si el sistema exige título único, también podrías probar algo como:

```java
@Test
void crearProducto_deberiaResponder409_siTituloYaExiste() throws Exception {
    mockMvc.perform(post("/productos")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {
                              "titulo": "Notebook",
                              "precio": 2500,
                              "stock": 10
                            }
                            """))
            .andExpect(status().isCreated());

    mockMvc.perform(post("/productos")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {
                              "titulo": "Notebook",
                              "precio": 2600,
                              "stock": 5
                            }
                            """))
            .andExpect(status().isConflict());
}
```

Este test es muy valioso porque verifica una regla real del sistema atravesando varias capas:

- request
- validación
- service
- repository
- excepción de negocio
- `@ControllerAdvice`
- status final

Eso ya no es un test de una sola capa.
Es claramente un test integrado.

## Qué relación tiene esto con la base de datos del test

Muy fuerte.

Cuando usás `@SpringBootTest` en escenarios integrados, la persistencia puede volverse una parte real del flujo de prueba.

Eso significa que necesitás pensar:

- contra qué base corre el test
- cómo se prepara el estado inicial
- cómo se limpia o aísla
- si usás una base de test, una embebida o algo más realista

No hace falta resolver hoy todos esos matices técnicos, pero sí entender esta intuición:

> cuanto más integrado es el test, más importa el entorno real donde corre.

## Cuándo conviene usar @SpringBootTest

Suele tener mucho sentido cuando querés verificar:

- un flujo importante de negocio de punta a punta
- integración real entre varias capas
- que el sistema completo colabora bien en un caso significativo
- configuración real de arranque
- interacción entre controller, service, repository y manejo de errores

También puede tener mucho sentido cuando el riesgo de integración entre capas es alto y querés una red de seguridad real.

## Cuándo no conviene usarlo

No suele ser la mejor elección para preguntas muy acotadas como:

- si una query derivada funciona
- si un body inválido devuelve 400 en un controller sencillo
- si el service lanza una excepción ante cierto mock
- si un mapper transforma bien una entidad simple

Para esas preguntas, los tests más enfocados suelen ser mejores.

## Un ejemplo de buena estrategia combinada

Podrías tener:

- muchos tests de repository con `@DataJpaTest`
- muchos tests de service con mocks
- varios tests web con `@WebMvcTest`
- y unos pocos tests integrados estratégicos con `@SpringBootTest`

Esa combinación suele ser muy sana.

¿Por qué?
Porque:

- los tests chicos te dan diagnóstico fino y feedback rápido
- los tests grandes te dan confianza en la colaboración real entre capas

Una cosa complementa a la otra.

## Qué gana el proyecto con algunos tests integrados

Muchísimo.

Porque a veces los tests por capa individual no detectan ciertos problemas de integración, por ejemplo:

- el controller espera algo distinto de lo que el service devuelve
- el service usa mal el mapper real
- el repository funciona solo pero el flujo global no
- el manejo de errores no se conecta como esperabas
- la validación y la persistencia se pisan de una forma inesperada

Los tests integrados ayudan justamente a detectar esas costuras.

## Qué pierde si abusás de ellos

Si hacés casi todo con `@SpringBootTest`, podés terminar con:

- tests más lentos
- más complejos
- más difíciles de diagnosticar
- mayor costo de mantenimiento
- feedback menos preciso

Por eso conviene verlos como una herramienta poderosa, pero no como la única herramienta.

## Un buen criterio práctico

Podés preguntarte:

> ¿la pregunta que quiero responder necesita de verdad que varias capas reales colaboren entre sí?

Si la respuesta es sí, `@SpringBootTest` probablemente tenga bastante sentido.

Si la respuesta es no, quizá otra herramienta más enfocada sea mejor.

## Qué relación tiene esto con confianza al refactorizar

Muy fuerte.

Los tests integrados dan una confianza distinta a la de los tests por capa.

Por ejemplo, si refactorizás:

- controller
- service
- mappers
- configuración
- manejo de errores
- wiring entre componentes

un test integrado puede avisarte si el flujo completo dejó de funcionar como sistema, incluso cuando cada pieza aislada todavía parece razonable.

## Qué relación tiene esto con wiring de Spring

También muy importante.

A veces no falla la lógica pura.
Falla cómo se conectan los componentes en el contexto real de Spring.

Por ejemplo:

- un bean no carga como pensabas
- una configuración no se aplica
- una dependencia falta
- el advice no intercepta como suponías
- la serialización no está quedando como esperabas con el wiring real

Ese tipo de problemas aparece mucho mejor en tests más integrados.

## Un ejemplo de pregunta muy típica para @SpringBootTest

> “Quiero asegurarme de que el caso crear producto funciona completo, desde la request hasta la persistencia y la respuesta final.”

Esa es una pregunta muy razonable para esta herramienta.

## Una muy buena advertencia

No conviene pensar que `@SpringBootTest` es automáticamente “mejor” o “más profesional” que un slice.

Es simplemente otra herramienta, para otro tipo de pregunta.

A veces lo más profesional es justamente usar la herramienta más acotada posible para la duda que tenés.

## Qué papel juegan los mocks acá

En un test integrado con `@SpringBootTest`, muchas veces querés menos mocks que en un test de service o de controller slice.

La gracia justamente puede estar en dejar que colaboren varias piezas reales.

Aun así, eso no significa que jamás puedan existir mocks en un contexto más grande.
Solo que la filosofía ya cambia:

- en el slice web, el service se mockea porque no es el foco
- en un test integrado, muchas veces sí querés el service real

## Qué todavía no estás viendo del todo

Aunque este tema ya te da una base importante, todavía no estamos entrando a fondo en cosas como:

- configuración precisa de base para tests integrados
- limpieza de datos entre tests
- transacciones de test
- testcontainers
- comparación entre `MockMvc` y cliente HTTP real
- arranque en puerto aleatorio
- estrategias más avanzadas de entorno de test

Todo eso puede venir después.

Primero conviene dejar muy clara la idea central:

> @SpringBootTest sirve cuando la pregunta del test ya no pertenece a una sola capa, sino a la colaboración real entre varias capas del sistema.

## Una estrategia muy sana para aprender

Podés pensar así:

1. primero dominá tests por capa
2. después sumá algunos tests integrados estratégicos
3. no reemplaces una cosa por la otra
4. usá cada herramienta para la pregunta adecuada

Ese orden te evita muchísima confusión.

## Qué relación tiene esto con backend real

Muy fuerte.

En proyectos reales, tener solo tests aislados puede quedarse corto.
Y tener solo tests enormes también puede ser un problema.

La combinación sana suele incluir ambos mundos:

- precisión por capa
- confianza integrada en flujos clave

Aprender `@SpringBootTest` es parte de construir esa segunda dimensión de confianza.

## Error común: usar @SpringBootTest para cualquier tontería pequeña

Eso suele volver el suite más pesado y menos claro de lo necesario.

## Error común: no tener ningún test integrado y confiar solo en slices

A veces eso deja sin cubrir costuras reales entre capas.

## Error común: pensar que porque un controller, un service y un repository funcionan aislados, el sistema completo necesariamente también funciona bien

No siempre.
La integración puede traer sus propios problemas.

## Error común: meter demasiados escenarios en un solo test integrado gigante

También conviene que los tests integrados sigan teniendo foco.
No hace falta que uno solo cubra toda la aplicación.

## Relación con Spring Boot

Spring Boot hace especialmente cómoda esta progresión porque te ofrece tanto herramientas muy enfocadas por capa como `@DataJpaTest` o `@WebMvcTest`, como una herramienta más amplia y poderosa como `@SpringBootTest`.

Eso te permite construir una estrategia de testing más madura y flexible en lugar de depender de una sola forma de probar todo.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> `@SpringBootTest` conviene cuando querés verificar colaboración real entre varias capas del sistema dentro de un contexto amplio de Spring Boot, aportando confianza integrada en flujos importantes que no pertenecen solamente a persistencia, a lógica aislada o a la capa web por separado.

## Resumen

- `@SpringBootTest` levanta un contexto mucho más amplio que los slices.
- Es útil cuando querés probar colaboración real entre varias capas.
- No reemplaza a `@DataJpaTest`, `@WebMvcTest` ni a los tests de service con mocks; los complementa.
- Tiene sentido especialmente para flujos importantes de punta a punta dentro del backend.
- No conviene usarlo para preguntas pequeñas que otras herramientas responden mejor.
- Aporta confianza integrada, pero con más costo que los tests más acotados.
- Este tema completa una visión mucho más madura del testing en Spring Boot.

## Próximo tema

En el próximo tema vas a ver cómo organizar mejor el proyecto cuando empieza a crecer: paquetes por capa, por feature o por módulo, y qué señales te ayudan a no dejar que el backend se vuelva una bolsa amorfa de clases.
