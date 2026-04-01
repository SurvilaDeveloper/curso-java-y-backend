---
title: "Cómo usar Spring Boot con PostgreSQL en un proyecto real paso a paso"
description: "Entender cómo integrar Spring Boot con PostgreSQL en un entorno real de desarrollo, qué piezas intervienen y cómo se conectan entidades, repositorios, configuración y base de datos en un flujo completo."
order: 51
module: "Persistencia con Spring Data JPA"
level: "base"
draft: false
---

En el tema anterior viste cómo conectar Spring Boot a una base de datos real usando `application.properties`, con piezas como:

- URL JDBC
- usuario
- contraseña
- driver
- dialecto
- propiedades JPA relacionadas

Eso te dio el mapa general.

Ahora toca bajar todo eso a un caso muy concreto y muy importante en proyectos reales:

**Spring Boot + PostgreSQL**

PostgreSQL es uno de los motores más usados en aplicaciones backend serias por varias razones:

- es robusto
- tiene muy buena reputación en entornos reales
- soporta muy bien SQL y modelados relacionales ricos
- se integra muy bien con el ecosistema Java
- aparece muchísimo en proyectos profesionales

Por eso este tema es clave.

Acá la idea es dejar de pensar la conexión a base como una configuración abstracta y verla como un flujo práctico completo donde intervienen:

- el motor PostgreSQL real
- la base creada
- el usuario
- la configuración de Spring Boot
- las entidades JPA
- los repositories
- las migraciones si las usás
- y la aplicación funcionando de verdad contra esa base

## Qué significa “usar Spring Boot con PostgreSQL”

Significa que tu aplicación Spring Boot:

- arranca
- abre conexión contra una base PostgreSQL real
- puede ejecutar migraciones
- puede persistir entidades
- puede consultar datos
- puede usar repositories de Spring Data JPA
- y puede trabajar con un esquema relacional real respaldado por PostgreSQL

Es decir:

> toda la capa de persistencia que venías viendo deja de ser solo estructura y pasa a ejecutarse contra un motor concreto muy usado en producción.

## Qué piezas necesitás para que esto funcione

A grandes rasgos, necesitás estas piezas:

1. un servidor PostgreSQL disponible
2. una base de datos creada
3. credenciales válidas
4. el driver JDBC de PostgreSQL en el proyecto
5. configuración de datasource en Spring Boot
6. entidades JPA
7. repositories o acceso a datos
8. opcionalmente, migraciones con Flyway

La integración no es una sola cosa.
Es un conjunto que tiene que encajar bien.

## Primera pieza: PostgreSQL real disponible

Antes de pensar en Spring Boot, tiene que existir PostgreSQL como motor real ejecutándose en algún entorno.

Por ejemplo:

- instalado localmente
- levantado con Docker
- ejecutándose en otro host de tu red
- disponible en un servicio cloud

Para un aprendizaje inicial, lo más común es empezar con un PostgreSQL local o en Docker.

Lo importante conceptualmente es esto:

> Spring Boot no “crea un PostgreSQL mágico”; necesita que el motor exista y esté accesible.

## Segunda pieza: la base de datos

Además del motor, necesitás una base concreta.

Por ejemplo:

- `miapp`
- `curso_springboot`
- `ecommerce`
- `socialnet`

La aplicación no apunta al servidor entero en abstracto.
Apunta a una base concreta dentro de ese motor.

Por eso la URL JDBC siempre termina incluyendo el nombre de la base.

## Tercera pieza: usuario y contraseña

La aplicación necesita autenticarse.

Entonces además de saber:

- host
- puerto
- nombre de base

también necesita:

- usuario
- contraseña

Por ejemplo:

- usuario: `postgres`
- contraseña: `123456`

o cualquier otra combinación que hayas definido en tu entorno.

Esto es básico, pero importantísimo:
si las credenciales no coinciden, la conexión no funciona.

## Cuarta pieza: dependencia del driver PostgreSQL

Para que Java pueda hablar con PostgreSQL, el proyecto necesita el driver JDBC correspondiente.

Conceptualmente, esa dependencia es la que le enseña a la aplicación a conectarse y comunicarse con ese motor.

Sin el driver correcto, aunque tu `application.properties` esté perfecto, Spring Boot no va a poder establecer la conexión real.

## Cómo pensar el driver

Podés pensar el driver como el traductor entre:

- tu aplicación Java
- y PostgreSQL

Sin ese traductor, la URL y las credenciales no alcanzan.

## Quinta pieza: configuración en application.properties

Una vez que el motor existe, la base existe y el driver está disponible, Spring Boot necesita saber cómo llegar ahí.

Ahí entra el bloque de configuración.

Para PostgreSQL, una forma típica podría ser:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/curso_springboot
spring.datasource.username=postgres
spring.datasource.password=123456
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.show-sql=true
```

Esto ya se parece bastante a una configuración real de desarrollo.

## Cómo leer esa configuración

### URL
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/curso_springboot
```

Le dice a la aplicación:

- usá JDBC
- contra PostgreSQL
- en `localhost`
- puerto `5432`
- base `curso_springboot`

### Usuario
```properties
spring.datasource.username=postgres
```

Indica el usuario con el que te vas a autenticar.

### Contraseña
```properties
spring.datasource.password=123456
```

Indica la contraseña de ese usuario.

### Driver
```properties
spring.datasource.driver-class-name=org.postgresql.Driver
```

Le dice qué clase JDBC usar para hablar con PostgreSQL.

### Dialecto
```properties
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

Le da contexto a Hibernate sobre el motor real.

### show-sql
```properties
spring.jpa.show-sql=true
```

Ayuda a ver por consola lo que se está ejecutando a nivel SQL.

## Un proyecto mínimo que ya encaja con PostgreSQL

Supongamos esta entidad:

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

Y este repository:

```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
}
```

Y este service:

```java
import org.springframework.stereotype.Service;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public Producto crear(String titulo, double precio, int stock) {
        Producto producto = new Producto();
        producto.setTitulo(titulo);
        producto.setPrecio(precio);
        producto.setStock(stock);

        return productoRepository.save(producto);
    }
}
```

Si PostgreSQL está bien configurado y el proyecto tiene el driver, esto ya puede persistir datos reales.

## Qué pasa cuando arranca la aplicación

Si todo está bien armado, el arranque real del proyecto implica cosas como:

- Spring Boot lee `application.properties`
- construye el datasource
- usa el driver PostgreSQL
- abre conexión contra la base
- Hibernate/JPA se prepara sobre ese datasource
- Flyway puede aplicar migraciones si está presente
- repositories y services quedan operativos

Ese flujo une muchísimos temas anteriores en una ejecución real.

## Qué relación tiene esto con Flyway

Muy fuerte.

Si además tenés Flyway, entonces al arrancar la aplicación puede pasar algo como:

1. se establece la conexión con PostgreSQL
2. Flyway detecta migraciones pendientes
3. las aplica sobre la base `curso_springboot`
4. deja el esquema listo
5. luego JPA y repositories operan sobre ese esquema real

Esto es muy potente porque hace que el proyecto pueda levantar su estructura persistente de forma mucho más controlada.

## Un ejemplo de migración inicial sobre PostgreSQL

Archivo:

```text
src/main/resources/db/migration/V1__crear_tabla_producto.sql
```

Contenido:

```sql
CREATE TABLE producto (
    id BIGINT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL
);
```

Y luego la app, conectada a PostgreSQL, puede aplicar esa migración al arrancar.

Este flujo ya representa un proyecto persistente serio, aunque sea pequeño.

## Qué relación tiene esto con el puerto 5432

En PostgreSQL, uno de los puertos más típicos por defecto es `5432`.

Por eso es tan frecuente ver URLs como:

```properties
jdbc:postgresql://localhost:5432/curso_springboot
```

No significa que tenga que ser siempre obligatoriamente ese puerto.
Pero sí es uno de los defaults más comunes y conviene reconocerlo.

## Qué significa `localhost`

`localhost` significa que la aplicación está intentando conectarse a un PostgreSQL que corre en la misma máquina donde se ejecuta Spring Boot.

Si la base estuviera en otro host, ese valor cambiaría.

Por ejemplo, más adelante podrías ver cosas como:

- otra IP
- otro nombre de host
- un contenedor específico
- una URL gestionada en cloud

Pero conceptualmente el rol del campo no cambia:
indica dónde está el servidor de base.

## Qué relación tiene esto con Docker

Muchísima.

Muchas veces PostgreSQL no está “instalado localmente” de forma clásica, sino levantado con Docker.

En ese caso, la lógica general sigue siendo la misma:

- hay host
- hay puerto
- hay base
- hay usuario
- hay contraseña

Lo que cambia es cómo levantaste el motor.

Eso muestra algo importante:
Spring Boot no necesita saber si PostgreSQL lo instalaste a mano o vive en Docker.
Solo necesita una conexión válida.

## Un ejemplo mental de entorno local con Docker

Podrías tener:

- contenedor PostgreSQL corriendo
- puerto 5432 expuesto
- base `curso_springboot`
- usuario `postgres`
- contraseña `123456`

Y en Spring Boot:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/curso_springboot
spring.datasource.username=postgres
spring.datasource.password=123456
```

Si Docker expuso ese puerto en tu máquina, para la app el uso sigue siendo muy parecido al de un PostgreSQL local.

## Un detalle importante sobre el nombre de base

No siempre la base se crea sola.
Muchas veces tenés que asegurarte primero de que la base exista realmente.

Por ejemplo, si tu configuración apunta a:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/curso_springboot
```

pero `curso_springboot` no existe dentro del PostgreSQL real, la app no va a poder operar como esperás.

Esto parece obvio, pero al empezar es uno de los tropiezos más frecuentes.

## Qué pasa si PostgreSQL no está corriendo

Aunque todo lo demás esté bien, la conexión fallará.

Eso te recuerda algo fundamental:

> Spring Boot no solo necesita la configuración correcta; también necesita que el entorno real esté disponible.

Es decir:

- motor levantado
- puerto accesible
- base existente
- usuario válido
- contraseña válida

Todo tiene que alinear.

## Qué pasa si el driver no coincide

Si la URL dice PostgreSQL pero el proyecto no tiene el driver de PostgreSQL, o intenta usar un driver incorrecto, la app no podrá conectarse correctamente.

Esto también recuerda que hay dos dimensiones simultáneas:

- configuración
- dependencias

No basta con una sola.

## Una configuración bastante típica para desarrollo con PostgreSQL

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/curso_springboot
spring.datasource.username=postgres
spring.datasource.password=123456
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.show-sql=true
```

Esta configuración tiene una virtud muy grande: es fácil de leer y te deja bastante claro qué está pasando.

## Qué conviene mirar cuando algo falla

Si la aplicación no logra levantar la persistencia, suele valer la pena revisar:

- ¿PostgreSQL está corriendo?
- ¿la base existe?
- ¿el puerto es correcto?
- ¿la URL JDBC está bien escrita?
- ¿el usuario existe?
- ¿la contraseña coincide?
- ¿el driver está en el proyecto?
- ¿el perfil activo está usando otro `application-*.properties` distinto?
- ¿Flyway está fallando por una migración y no por la conexión en sí?

Ese tipo de chequeo ordenado ayuda mucho más que tocar cosas al azar.

## Qué relación tiene esto con perfiles por entorno

Muy directa.

En desarrollo local podrías tener:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/curso_springboot_dev
spring.datasource.username=postgres
spring.datasource.password=123456
```

Mientras que en test o producción podrías tener otras bases distintas.

Esto refuerza una idea que ya viste:

- la conexión a base también forma parte de la configuración por entorno
- no todo entorno debería apuntar a la misma base

## Qué relación tiene esto con seguridad

En un entorno local para aprender, está bien arrancar simple.

Pero a medida que el proyecto se vuelve más real, las credenciales y datos de conexión dejan de ser algo que convenga dejar hardcodeado sin criterio.

Ahí entran en juego:

- variables de entorno
- secrets
- archivos no versionados
- sistemas de configuración por entorno

No hace falta que lo resuelvas todo ahora mismo, pero conviene que la intuición quede firme desde ya.

## Qué relación tiene esto con la persistencia “real”

Este tema marca un punto de inflexión porque ahora ya no se trata solo de:

- pensar entidades
- escribir repositories
- imaginar consultas

Ahora la aplicación puede de verdad:

- guardar datos en PostgreSQL
- leerlos después
- modificar registros persistentes
- usar migraciones reales
- operar con un motor robusto

Eso hace que todo lo anterior se sienta mucho más concreto.

## Un ejemplo de flujo completo con PostgreSQL

1. PostgreSQL está corriendo localmente
2. existe la base `curso_springboot`
3. Spring Boot tiene el driver JDBC
4. `application.properties` apunta a esa base
5. Flyway aplica migraciones
6. JPA/Hibernate inicializa el modelo persistente
7. `ProductoRepository.save(...)` persiste un producto real
8. una consulta posterior lo recupera desde PostgreSQL

Este flujo resume muy bien por qué este tema es tan importante.

## Qué relación tiene esto con aprendizaje progresivo

PostgreSQL es un muy buen motor para consolidar conceptos porque combina:

- uso real en proyectos
- modelo relacional fuerte
- buena integración con Java
- mucha documentación
- presencia frecuente en backend profesional

Por eso aprender Spring Boot con PostgreSQL como caso concreto suele ser una muy buena inversión.

## Una buena heurística

Podés pensar así:

- primero entendé bien el patrón general de datasource
- después consolidalo con un motor real como PostgreSQL
- una vez que eso te funcione, todo JPA y Flyway empieza a tener mucho más sentido práctico

Ese orden suele ser muchísimo más claro que querer aprender todo mezclado de golpe.

## Error común: pensar que si la app compila entonces la persistencia está lista

No.
Compilar no significa que la conexión real esté bien.

Podés tener:

- entidades correctas
- repositories bien escritos
- services bien estructurados

y aun así fallar porque la conexión a PostgreSQL real no está bien resuelta.

## Error común: tocar propiedades al azar sin entender qué hace cada una

La configuración de base no conviene improvisarla.
Cada propiedad tiene un rol distinto:

- URL
- usuario
- contraseña
- driver
- dialect
- JPA
- Flyway

Cuanto más clara tengas esa separación, más fácil será depurar.

## Error común: usar la misma base para todo sin separar entornos

Al principio puede pasar.
Pero a medida que el proyecto crece, conviene separar mejor:

- desarrollo
- test
- producción

Porque no querés que pruebas locales y entornos reales se pisen sin querer.

## Error común: no revisar si la base y el usuario realmente existen en PostgreSQL

A veces el error no está en Spring Boot.
Está en que el entorno PostgreSQL todavía no está preparado como la app espera.

Recordar esto evita perder tiempo buscando solo del lado del código.

## Relación con Spring Boot

Spring Boot hace que conectar una app a PostgreSQL se sienta mucho más fluido que en stacks más manuales, porque integra datasource, JPA, Hibernate y herramientas como Flyway bajo una configuración bastante clara.

Pero esa comodidad no elimina la necesidad de entender lo que estás configurando.
Al contrario: entenderlo te da muchísimo más control.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> usar Spring Boot con PostgreSQL implica conectar entidades, repositories, migraciones y configuración real de datasource contra un motor concreto, convirtiendo toda la capa de persistencia en algo verdaderamente operativo y no solo estructural.

## Resumen

- PostgreSQL es uno de los motores relacionales más usados en proyectos reales con Spring Boot.
- Para conectarte necesitás motor disponible, base creada, usuario, contraseña, driver y configuración correcta.
- `application.properties` centraliza buena parte de esa conexión.
- Flyway y JPA dependen de que el datasource esté bien configurado.
- Entender bien URL JDBC, driver y dialecto vuelve mucho más clara toda la capa persistente.
- Este tema aterriza todo lo anterior en un caso real y muy usado.
- Es un paso clave para que la persistencia deje de ser teoría y empiece a funcionar de verdad contra una base concreta.

## Próximo tema

En el próximo tema vas a ver cómo diseñar un CRUD completo de punta a punta con Spring Boot, JPA, DTOs, validación, service, repository y PostgreSQL, para consolidar todo este bloque en una estructura más parecida a una feature real de aplicación.
