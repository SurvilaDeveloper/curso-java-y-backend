---
title: "Anotaciones de Spring organizadas por módulo"
description: "Esta guía reúne las anotaciones más importantes que aparecen en proyectos hechos con Spring en general, organizadas por módulo y por responsabilidad.
  No intenta ser un catálogo absoluto de todas las anotaciones existentes en todo el ecosistema, pero sí una referencia amplia y práctica para estudiar y consultar mientras desarrollás."
order: 25
module: "Spring Boot - anotaciones"
level: "intro"
draft: false
---
# Anotaciones de Spring organizadas por módulo

## Qué es este documento

Esta guía reúne las anotaciones más importantes que aparecen en proyectos hechos con Spring en general, organizadas por módulo y por responsabilidad.

No intenta ser un catálogo absoluto de **todas** las anotaciones existentes en todo el ecosistema, pero sí una referencia amplia y práctica para estudiar y consultar mientras desarrollás.

También incluye una sección aparte para las anotaciones de **Jakarta** que suelen usarse junto con Spring, porque en la práctica se mezclan todo el tiempo y es común confundir cuáles son de Spring y cuáles no.

---

## Cómo leer esta guía

- Cuando una anotación pertenece al **Spring Framework**, aparece dentro de los módulos base como Core, Web MVC, AOP, Transactions, Cache, Events o Scheduling.
- Cuando pertenece a un proyecto del ecosistema, aparece en módulos como **Spring Boot**, **Spring Security**, **Spring Data JPA** o **Spring Test**.
- Cuando en realidad no es de Spring sino de otra especificación integrada con Spring, la vas a ver en la sección **Jakarta**.

---

# 1. Spring Framework Core / IoC / Beans

Este módulo cubre el contenedor de inversión de control, la definición de beans, la inyección de dependencias y el escaneo de componentes.

## Configuración y registro de beans

### `@Configuration`
Marca una clase como fuente de configuración basada en Java. Se usa para declarar beans y componer configuración del contenedor.

### `@Bean`
Marca un método dentro de una clase de configuración como productor de un bean administrado por Spring.

### `@Import`
Permite importar clases de configuración adicionales dentro de otra configuración.

### `@ComponentScan`
Activa el escaneo de componentes en uno o más paquetes para detectar beans anotados.

### `@Profile`
Activa condicionalmente una configuración o componente según el perfil activo, por ejemplo `dev`, `test` o `prod`.

## Estereotipos de componentes

### `@Component`
Estereotipo genérico para registrar una clase como bean de Spring.

### `@Service`
Especialización semántica de `@Component` que suele usarse para clases de lógica de negocio.

### `@Repository`
Especialización semántica para componentes de acceso a datos. Además se usa como marcador para traducción de excepciones de persistencia.

### `@Controller`
Estereotipo para controladores MVC tradicionales.

## Inyección y selección de dependencias

### `@Autowired`
Solicita a Spring que resuelva e inyecte una dependencia.

### `@Qualifier`
Sirve para diferenciar entre varios beans candidatos del mismo tipo.

### `@Primary`
Indica cuál bean debe preferirse por defecto cuando hay varios del mismo tipo.

### `@Value`
Inyecta valores simples desde propiedades, expresiones o literales.

## Scope, carga y orden de inicialización

### `@Scope`
Define el alcance de un bean, por ejemplo singleton, prototype, request o session.

### `@Lazy`
Indica que un bean o una dependencia se inicialice de forma diferida.

### `@DependsOn`
Indica que un bean depende de otro y debe inicializarse después de él.

## Ciclo de vida e infraestructura

### `@Description`
Permite agregar una descripción textual a un bean.

### `@Role`
Asigna una categoría o rol al bean dentro de la infraestructura del contenedor.

### `@Order`
Permite establecer prioridad u orden relativo cuando Spring procesa colecciones ordenadas de componentes.

---

# 2. Spring AOP

Spring AOP se usa para aplicar comportamiento transversal, por ejemplo logging, métricas, auditoría o validaciones repetitivas.

## Declaración de aspectos

### `@Aspect`
Marca una clase como aspecto usando el estilo `@AspectJ`.

### `@EnableAspectJAutoProxy`
Habilita el soporte de Spring para aspectos declarados con `@Aspect`.

## Definición de pointcuts y advices

### `@Pointcut`
Declara un pointcut reutilizable.

### `@Before`
Ejecuta lógica antes del método interceptado.

### `@After`
Ejecuta lógica al finalizar el método, tanto si terminó bien como si lanzó excepción.

### `@AfterReturning`
Ejecuta lógica solo cuando el método devuelve normalmente.

### `@AfterThrowing`
Ejecuta lógica solo cuando el método termina lanzando una excepción.

### `@Around`
Rodea la ejecución del método y permite decidir si continuar, modificar parámetros, medir tiempos o alterar el resultado.

---

# 3. Spring Web MVC

Este módulo concentra las anotaciones para construir aplicaciones web sobre la pila Servlet.

## Controladores

### `@Controller`
Marca una clase como controlador MVC.

### `@RestController`
Combinación de `@Controller` y `@ResponseBody`. Se usa para APIs REST que devuelven datos en lugar de vistas.

## Mapeo de rutas

### `@RequestMapping`
Anotación base para mapear rutas, métodos HTTP, headers, consumes y produces.

### `@GetMapping`
Atajo para `@RequestMapping(method = GET)`.

### `@PostMapping`
Atajo para `@RequestMapping(method = POST)`.

### `@PutMapping`
Atajo para `@RequestMapping(method = PUT)`.

### `@DeleteMapping`
Atajo para `@RequestMapping(method = DELETE)`.

### `@PatchMapping`
Atajo para `@RequestMapping(method = PATCH)`.

## Parámetros, cuerpo y respuesta

### `@PathVariable`
Vincula un segmento de la URL a un parámetro del método.

### `@RequestParam`
Vincula un query parameter o parámetro de formulario a un parámetro del método.

### `@RequestBody`
Deserializa el cuerpo de la request y lo entrega como objeto Java.

### `@ResponseBody`
Indica que el valor retornado debe escribirse directamente en el cuerpo de la respuesta.

### `@ResponseStatus`
Asocia un estado HTTP a un método o a una excepción.

### `@RequestHeader`
Lee valores de headers HTTP.

### `@CookieValue`
Lee valores de cookies HTTP.

### `@ModelAttribute`
Se usa para exponer atributos al modelo o para poblar objetos a partir de parámetros de entrada.

## Binding, validación y conversión

### `@InitBinder`
Permite personalizar el proceso de binding y conversión para controladores.

## Manejo de errores

### `@ExceptionHandler`
Marca métodos que manejan excepciones lanzadas desde controladores.

### `@ControllerAdvice`
Define lógica global aplicable a muchos controladores, por ejemplo manejo centralizado de errores.

### `@RestControllerAdvice`
Versión REST de `@ControllerAdvice`. Combina `@ControllerAdvice` con `@ResponseBody`.

## Cross-Origin

### `@CrossOrigin`
Permite configurar CORS en controladores o métodos concretos.

## Estado de sesión y flujo web

### `@SessionAttributes`
Indica qué atributos del modelo deben mantenerse en sesión.

### `@SessionAttribute`
Permite leer un atributo ya presente en sesión.

### `@RequestAttribute`
Permite leer atributos de request ya establecidos en el ciclo de procesamiento.

---

# 4. Spring WebFlux

Spring WebFlux usa gran parte del mismo modelo anotado que MVC, pero para la pila reactiva.

## Anotaciones principales

En controladores anotados de WebFlux vas a volver a ver casi las mismas:

- `@Controller`
- `@RestController`
- `@RequestMapping`
- `@GetMapping`
- `@PostMapping`
- `@RequestBody`
- `@ResponseBody`
- `@ControllerAdvice`
- `@RestControllerAdvice`
- `@ExceptionHandler`

La diferencia principal no está tanto en las anotaciones sino en los tipos usados en las firmas de métodos, por ejemplo `Mono<T>` y `Flux<T>`.

---

# 5. Eventos de aplicación

Spring permite publicar y escuchar eventos dentro del contexto.

### `@EventListener`
Marca un método como listener de eventos de aplicación.

### `@TransactionalEventListener`
Versión de listener ligada al ciclo de vida de una transacción. Por defecto se ejecuta después del commit, aunque puede configurarse para otros momentos como `BEFORE_COMMIT`, `AFTER_ROLLBACK` o `AFTER_COMPLETION`.

---

# 6. Transacciones

Spring ofrece gestión transaccional declarativa.

### `@Transactional`
Define límites transaccionales a nivel de método o clase. Permite configurar propagación, aislamiento, timeout, solo lectura y reglas de rollback.

### `@EnableTransactionManagement`
Habilita el soporte de transacciones declarativas basadas en anotaciones.

---

# 7. Scheduling y ejecución asíncrona

Este módulo permite tareas periódicas y ejecución asíncrona.

### `@EnableScheduling`
Habilita el soporte para métodos anotados con `@Scheduled`.

### `@Scheduled`
Programa la ejecución de un método según `fixedRate`, `fixedDelay`, `initialDelay` o una expresión `cron`.

### `@EnableAsync`
Habilita el soporte para métodos anotados con `@Async`.

### `@Async`
Ejecuta un método de forma asíncrona.

---

# 8. Cache

Spring tiene una abstracción de caché basada en anotaciones.

### `@EnableCaching`
Habilita el procesamiento de anotaciones de caché.

### `@Cacheable`
Indica que el resultado de un método puede almacenarse en caché.

### `@CachePut`
Actualiza el caché sin evitar la ejecución del método.

### `@CacheEvict`
Elimina entradas del caché.

### `@Caching`
Agrupa varias operaciones de caché en una sola anotación.

### `@CacheConfig`
Permite compartir configuración común de caché a nivel de clase.

---

# 9. Spring Boot

Spring Boot agrega anotaciones para auto-configuración, arranque y binding de propiedades.

## Arranque

### `@SpringBootApplication`
Es la anotación principal de una aplicación Spring Boot. Reúne:
- `@EnableAutoConfiguration`
- `@ComponentScan`
- `@SpringBootConfiguration`

### `@EnableAutoConfiguration`
Activa el mecanismo de auto-configuración de Spring Boot.

### `@SpringBootConfiguration`
Variante especializada de `@Configuration` usada por Boot.

## Propiedades externas

### `@ConfigurationProperties`
Vincula propiedades externas a un objeto tipado.

### `@EnableConfigurationProperties`
Registra explícitamente clases anotadas con `@ConfigurationProperties`.

### `@ConfigurationPropertiesScan`
Activa el escaneo de clases anotadas con `@ConfigurationProperties`.

## Perfiles en Boot

### `@Profile`
Aunque `@Profile` pertenece al Framework base, en Boot se usa muchísimo para cargar configuraciones distintas por entorno.

---

# 10. Spring Test y Spring Boot Test

Estas anotaciones aparecen en pruebas unitarias, de integración o pruebas por capas.

## Base del ecosistema de testing de Spring

### `@ExtendWith(SpringExtension.class)`
Integra JUnit Jupiter con el contexto de Spring.

### `@ContextConfiguration`
Indica qué configuración debe usar Spring para crear el contexto del test.

### `@TestPropertySource`
Permite definir propiedades específicas para el test.

### `@ActiveProfiles`
Activa perfiles concretos durante la ejecución del test.

### `@DirtiesContext`
Marca el contexto como "sucio" para que Spring lo recree luego del test.

## Anotaciones de Spring Boot Test

### `@SpringBootTest`
Levanta el contexto completo de la aplicación Spring Boot.

### `@WebMvcTest`
Carga solo la capa web MVC para probar controladores.

### `@DataJpaTest`
Carga una porción centrada en persistencia JPA.

### `@JsonTest`
Carga soporte enfocado en serialización y deserialización JSON.

### `@RestClientTest`
Carga soporte para probar clientes HTTP.

### `@AutoConfigureMockMvc`
Configura `MockMvc` en tests Spring Boot.

---

# 11. Spring Security

Spring Security aporta anotaciones para configuración y autorización declarativa.

## Configuración

### `@EnableWebSecurity`
Habilita la configuración web de Spring Security.

### `@EnableMethodSecurity`
Activa la seguridad a nivel método mediante anotaciones.

## Autorización a nivel método

### `@PreAuthorize`
Evalúa una expresión antes de invocar el método.

### `@PostAuthorize`
Evalúa una expresión después de invocar el método.

### `@PreFilter`
Filtra colecciones de entrada antes de ejecutar el método.

### `@PostFilter`
Filtra colecciones de salida después de ejecutar el método.

### `@Secured`
Permite restringir acceso por roles de forma más simple.

### `@RolesAllowed`
Anotación del estándar Jakarta usada también por Spring Security para restricciones por roles.

## Testing de seguridad

### `@WithMockUser`
Ejecuta el test con un usuario simulado.

### `@WithAnonymousUser`
Ejecuta el test como usuario anónimo.

### `@WithUserDetails`
Carga un usuario real desde un `UserDetailsService`.

### `@WithSecurityContext`
Permite construir un contexto de seguridad personalizado para tests.

---

# 12. Spring Data Commons y Spring Data JPA

Acá aparecen anotaciones relacionadas con repositorios, queries y auditoría.

## Activación de repositorios

### `@EnableJpaRepositories`
Habilita el escaneo y registro de repositorios JPA.

## Consultas y comportamiento de repositorios

### `@Query`
Define una query JPQL o SQL nativa manualmente en un método del repositorio.

### `@Modifying`
Marca que una query anotada con `@Query` modifica datos.

### `@EntityGraph`
Permite controlar estrategias de carga para una consulta del repositorio.

### `@Lock`
Define el lock mode usado por una query del repositorio.

### `@Procedure`
Asocia un método del repositorio a un procedimiento almacenado.

## Auditoría

### `@EnableJpaAuditing`
Activa la infraestructura de auditoría de Spring Data JPA.

### `@CreatedBy`
Guarda quién creó la entidad.

### `@LastModifiedBy`
Guarda quién modificó por última vez la entidad.

### `@CreatedDate`
Guarda cuándo se creó la entidad.

### `@LastModifiedDate`
Guarda cuándo se modificó por última vez la entidad.

## Web support de Spring Data

### `@EnableSpringDataWebSupport`
Habilita soporte web para tipos de Spring Data, por ejemplo paginación y ordenamiento en controladores.

---

# 13. Mensajería, integración y otros módulos del ecosistema

Dependiendo del proyecto, pueden aparecer muchas más anotaciones fuera del núcleo que vimos arriba. Algunos ejemplos frecuentes:

- Spring Integration
- Spring Batch
- Spring Cloud
- Spring for GraphQL
- Spring AMQP
- Spring Kafka
- Spring Session
- Spring Modulith

No las detallo acá porque cada uno de esos proyectos merece su propia guía, pero es importante recordar que "anotaciones de Spring" puede abarcar muchísimo más que Spring Boot, MVC y JPA.

---

# 14. Anotaciones de Jakarta que suelen verse todo el tiempo en proyectos Spring

Estas anotaciones no son de Spring, pero en un proyecto Spring aparecen constantemente.

## Jakarta Persistence (JPA)

### `@Entity`
Marca una clase como entidad persistente.

### `@Table`
Configura la tabla asociada a una entidad.

### `@Id`
Marca la clave primaria.

### `@GeneratedValue`
Define la estrategia de generación del identificador.

### `@Column`
Configura una columna.

### `@Enumerated`
Indica cómo persistir un enum.

### `@Embedded`
Marca un objeto embebido.

### `@Embeddable`
Marca una clase como embebible.

### `@OneToOne`
### `@OneToMany`
### `@ManyToOne`
### `@ManyToMany`
Definen relaciones entre entidades.

### `@JoinColumn`
Configura la columna de unión.

### `@JoinTable`
Configura una tabla intermedia para relaciones.

### `@Version`
Activa locking optimista.

### `@MappedSuperclass`
Permite herencia de mapeo sin ser entidad concreta.

### `@Inheritance`
Configura la estrategia de herencia.

### `@Transient`
Indica que un atributo no debe persistirse.

## Jakarta Validation

### `@Valid`
Solicita validación recursiva sobre un objeto.

### `@NotNull`
### `@NotBlank`
### `@NotEmpty`
Restringen nulidad o vacíos.

### `@Size`
Valida tamaño mínimo y máximo.

### `@Min`
### `@Max`
Valida límites numéricos enteros.

### `@Positive`
### `@PositiveOrZero`
### `@Negative`
### `@NegativeOrZero`
Validan signo y rango.

### `@Email`
Valida formato de correo.

### `@Pattern`
Valida mediante expresión regular.

### `@Past`
### `@PastOrPresent`
### `@Future`
### `@FutureOrPresent`
Validan fechas y tiempos relativos.

## Jakarta Annotations

### `@PostConstruct`
Método a ejecutar después de la creación e inyección del bean.

### `@PreDestroy`
Método a ejecutar antes de destruir el bean.

### `@Resource`
Forma alternativa de inyección por nombre o tipo.

### `@Priority`
Permite establecer prioridad en ciertos contextos.

## Jakarta Transaction

### `@Transactional`
Existe también fuera de Spring. En proyectos Spring puede convivir conceptualmente con la variante de Spring, aunque normalmente conviene ser consistente y usar una sola estrategia.

---

# 15. Mapa mental rápido: qué anotaciones vas a ver más seguido

## Muy comunes en casi cualquier proyecto Spring Boot
- `@SpringBootApplication`
- `@Configuration`
- `@Bean`
- `@Component`
- `@Service`
- `@Repository`
- `@RestController`
- `@RequestMapping`
- `@GetMapping`
- `@PostMapping`
- `@PathVariable`
- `@RequestParam`
- `@RequestBody`
- `@Autowired`
- `@Value`
- `@Profile`
- `@Transactional`

## Muy comunes en APIs con validación
- `@Valid`
- `@NotNull`
- `@NotBlank`
- `@Size`
- `@Email`
- `@Pattern`

## Muy comunes en persistencia con JPA
- `@Entity`
- `@Id`
- `@GeneratedValue`
- `@Column`
- `@Table`
- `@OneToMany`
- `@ManyToOne`
- `@JoinColumn`
- `@Query`
- `@Modifying`
- `@EntityGraph`

## Muy comunes en seguridad
- `@EnableMethodSecurity`
- `@PreAuthorize`
- `@Secured`
- `@WithMockUser`

## Muy comunes en testing
- `@SpringBootTest`
- `@WebMvcTest`
- `@DataJpaTest`
- `@AutoConfigureMockMvc`

---

# 16. Consejos para estudiarlas mejor

## 1. No memorices todas juntas
Conviene estudiarlas por responsabilidad:
- configuración
- componentes
- web
- persistencia
- seguridad
- testing

## 2. Separá siempre Spring de Jakarta
Una de las confusiones más comunes es pensar que `@Entity`, `@Valid` o `@NotBlank` son de Spring. En realidad Spring las integra, pero no las define.

## 3. Prestá atención a las anotaciones compuestas
Por ejemplo:
- `@RestController` combina `@Controller` + `@ResponseBody`
- `@SpringBootApplication` combina varias anotaciones base de Boot y Framework
- `@RestControllerAdvice` combina `@ControllerAdvice` + `@ResponseBody`

## 4. Aprendé primero las que más ves
Para backend con Spring Boot, las primeras que conviene dominar son:
- `@SpringBootApplication`
- `@RestController`
- `@Service`
- `@Repository`
- `@RequestMapping` y sus variantes
- `@Configuration`
- `@Bean`
- `@Transactional`
- `@Entity`
- `@Id`
- `@Valid`

---

# 17. Fuentes oficiales recomendadas

## Spring Framework
- Core / IoC / Beans  
  https://docs.spring.io/spring-framework/reference/core/beans/
- AOP  
  https://docs.spring.io/spring-framework/reference/core/aop/
- Web MVC  
  https://docs.spring.io/spring-framework/reference/web/webmvc/
- WebFlux  
  https://docs.spring.io/spring-framework/reference/web/webflux/
- Transactions  
  https://docs.spring.io/spring-framework/reference/data-access/transaction/
- Scheduling y Async  
  https://docs.spring.io/spring-framework/reference/integration/scheduling.html
- Cache  
  https://docs.spring.io/spring-framework/reference/integration/cache/annotations.html

## Spring Boot
- `@SpringBootApplication`  
  https://docs.spring.io/spring-boot/reference/using/using-the-springbootapplication-annotation.html
- Configuración externa y `@ConfigurationProperties`  
  https://docs.spring.io/spring-boot/reference/features/external-config.html
- Profiles en Boot  
  https://docs.spring.io/spring-boot/reference/features/profiles.html
- Testing en Boot  
  https://docs.spring.io/spring-boot/reference/testing/

## Spring Security
- Method Security  
  https://docs.spring.io/spring-security/reference/servlet/authorization/method-security.html
- Testing  
  https://docs.spring.io/spring-security/reference/servlet/test/

## Spring Data JPA
- Repositorios  
  https://docs.spring.io/spring-data/jpa/reference/repositories/
- `@EnableJpaRepositories`  
  https://docs.spring.io/spring-data/jpa/reference/repositories/create-instances.html
- Query methods  
  https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html
- Auditoría  
  https://docs.spring.io/spring-data/jpa/reference/auditing.html

---

# 18. Cierre

Si querés usar esta guía como material de estudio, una progresión razonable sería:

1. Spring Core
2. Spring Web MVC
3. Spring Boot
4. Jakarta Validation
5. JPA / Spring Data JPA
6. Transactions
7. Testing
8. Security
9. Cache, Async, Events y AOP

Así vas entendiendo primero cómo se arma y se ejecuta una aplicación Spring, y después agregás persistencia, validación, seguridad y aspectos más avanzados.
