---
title: "Cómo probar repositories con @DataJpaTest sin levantar toda la aplicación"
description: "Entender para qué sirve @DataJpaTest, qué parte del contexto de Spring Boot levanta, por qué es ideal para probar persistencia y cómo ayuda a verificar repositories y consultas sin mezclar capas innecesariamente."
order: 54
module: "Testing en Spring Boot"
level: "base"
draft: false
---

En el tema anterior viste una idea muy importante: no conviene probar todo el backend siempre del mismo modo ni mezclar todas las capas dentro de una única prueba gigante.

Eso te dio un mapa mucho más claro:

- repository → persistencia y consultas
- service → lógica del caso de uso
- controller → contrato HTTP

Ahora toca bajar esa estrategia a una herramienta muy concreta y muy útil para la capa de persistencia:

`@DataJpaTest`

Este tema es clave porque te muestra una forma mucho más enfocada de probar repositories, entidades y consultas sin necesidad de levantar toda la aplicación completa como si cada test fuera un arranque full del sistema.

## El problema de probar persistencia levantando todo

Supongamos que querés verificar algo bastante puntual:

- que `findByTitulo("Notebook")` funciona
- que `existsByEmail(...)` devuelve lo correcto
- que una query derivada encuentra lo que debe
- que una query con `@Query` realmente devuelve el resultado esperado
- que la paginación devuelve el orden correcto

Todas esas preguntas pertenecen claramente a la capa de persistencia.

Sin embargo, si para responderlas levantás:

- controllers
- seguridad
- endpoints
- validación web
- manejo HTTP completo
- services que no necesitás
- todo el contexto entero

entonces estás pagando un costo de complejidad innecesario para una pregunta que era más específica.

Ahí es donde `@DataJpaTest` aporta muchísimo valor.

## Qué es `@DataJpaTest`

`@DataJpaTest` es una anotación pensada para probar la capa JPA de forma enfocada.

Dicho de forma simple:

> levanta un contexto reducido de Spring Boot orientado a persistencia, ideal para testear entities, repositories y consultas sin arrancar toda la aplicación completa.

Eso la convierte en una herramienta excelente para responder preguntas como:

- ¿mi repository guarda bien?
- ¿esta query derivada funciona?
- ¿esta query con `@Query` devuelve lo correcto?
- ¿este mapeo JPA básico está bien?
- ¿la paginación o el ordenamiento se comportan como espero?

## Qué significa que sea un “slice” o recorte

Aunque no hace falta obsesionarse con el término técnico desde el primer segundo, conviene entender la idea.

`@DataJpaTest` no levanta toda la app.
Levanta una **porción** del contexto centrada en:

- entidades
- repositories
- infraestructura JPA
- acceso a datos

Eso hace que el test sea más liviano y más alineado con la capa que realmente querés verificar.

## Por qué esto es tan útil

Porque mejora varias cosas al mismo tiempo:

- foco del test
- velocidad conceptual
- claridad de intención
- diagnóstico de fallos
- menor ruido del contexto completo

En otras palabras:

> si querés probar persistencia, tiene muchísimo sentido usar una herramienta pensada para persistencia y no mezclar toda la aplicación sin necesidad.

## Un primer ejemplo de repository

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
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Optional<Producto> findByTitulo(String titulo);

    boolean existsByTitulo(String titulo);
}
```

Este repository es un candidato perfecto para `@DataJpaTest`.

## Un primer test con @DataJpaTest

```java
import static org.assertj.core.api.Assertions.assertThat;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
class ProductoRepositoryTest {

    @Autowired
    private ProductoRepository productoRepository;

    @Test
    void findByTitulo_deberiaEncontrarProductoGuardado() {
        Producto producto = new Producto();
        producto.setTitulo("Notebook");
        producto.setPrecio(2500);
        producto.setStock(10);

        productoRepository.save(producto);

        Optional<Producto> resultado = productoRepository.findByTitulo("Notebook");

        assertThat(resultado).isPresent();
        assertThat(resultado.get().getTitulo()).isEqualTo("Notebook");
    }
}
```

Este test ya muestra muy bien la idea central.

## Cómo leer este test

Podés leerlo así:

- Spring levanta un contexto enfocado en JPA
- tenés acceso al `ProductoRepository`
- guardás una entidad
- ejecutás una query del repository
- verificás el resultado

Todo esto ocurre sin necesidad de pasar por:

- controller
- service
- HTTP
- JSON
- validación web
- seguridad

Eso es justamente lo que lo hace tan valioso para esta capa.

## Qué preguntas responde bien @DataJpaTest

Responde muy bien preguntas como:

- ¿se guarda la entidad?
- ¿la búsqueda por un campo funciona?
- ¿la relación entre entidades se persiste razonablemente?
- ¿la query derivada devuelve lo esperado?
- ¿la query con `@Query` filtra bien?
- ¿el `existsBy...` responde correctamente?
- ¿la paginación devuelve orden y cantidad esperadas?

Es decir, preguntas de persistencia.

## Qué no conviene pedirle a @DataJpaTest

No conviene usarlo para probar cosas como:

- status HTTP
- validación de request body
- serialización JSON
- contrato de endpoint
- lógica compleja del service
- manejo global de errores HTTP

No porque sea una mala herramienta, sino porque esas preguntas pertenecen a otras capas.

Ese es justamente uno de los grandes aprendizajes del tema 53.

## Un ejemplo con existsBy...

```java
import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
class ProductoRepositoryTest {

    @Autowired
    private ProductoRepository productoRepository;

    @Test
    void existsByTitulo_deberiaDevolverTrue_siExisteProducto() {
        Producto producto = new Producto();
        producto.setTitulo("Teclado");
        producto.setPrecio(100);
        producto.setStock(5);

        productoRepository.save(producto);

        boolean existe = productoRepository.existsByTitulo("Teclado");

        assertThat(existe).isTrue();
    }

    @Test
    void existsByTitulo_deberiaDevolverFalse_siNoExisteProducto() {
        boolean existe = productoRepository.existsByTitulo("Mouse");

        assertThat(existe).isFalse();
    }
}
```

Estos tests son muy concretos, muy legibles y apuntan exactamente a la responsabilidad del repository.

## Qué gana el test con esta forma

Mucho.

Porque ahora el test responde una sola pregunta clara.

No intenta además probar:

- el JSON
- el controller
- el mapeo del endpoint
- las excepciones HTTP
- el comportamiento del service

Eso lo vuelve más preciso y mucho más fácil de diagnosticar si falla.

## Un ejemplo con query derivada que devuelve lista

Supongamos este repository:

```java
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    List<Pedido> findByEstado(String estado);
}
```

Un test razonable podría ser:

```java
import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
class PedidoRepositoryTest {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Test
    void findByEstado_deberiaTraerSoloPedidosConEseEstado() {
        Pedido pendiente = new Pedido();
        pendiente.setNumero("P-001");
        pendiente.setEstado("PENDIENTE");

        Pedido enviado = new Pedido();
        enviado.setNumero("P-002");
        enviado.setEstado("ENVIADO");

        pedidoRepository.save(pendiente);
        pedidoRepository.save(enviado);

        List<Pedido> resultado = pedidoRepository.findByEstado("PENDIENTE");

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getNumero()).isEqualTo("P-001");
    }
}
```

Esto ya muestra cómo un test de repository puede verificar filtrado real sin pasar por otras capas.

## Qué relación tiene esto con la base de datos de pruebas

Muy fuerte.

Cuando usás `@DataJpaTest`, el test necesita un entorno de persistencia donde guardar y consultar datos.

A nivel conceptual, esto significa que el test no es un “test puramente de objetos”:
sí está tocando persistencia.

La forma concreta de esa base de pruebas puede variar según cómo esté armado el proyecto, pero la idea importante es esta:

> `@DataJpaTest` está pensado para probar JPA y repositories en un entorno de persistencia controlado.

## Qué valor tiene eso frente a solo usar mocks

Un mock puede servir muchísimo para probar lógica del service.
Pero si querés saber si una query derivada o una query con `@Query` funciona de verdad, mockear el repository no te alcanza.

Porque el mock no verifica la persistencia real.
Solo verifica una simulación.

En cambio, `@DataJpaTest` te permite comprobar la capa JPA más de verdad.

## Un ejemplo con @Query

Supongamos este repository:

```java
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    @Query("select p from Producto p where p.precio >= :precioMinimo")
    List<Producto> buscarDesdePrecio(double precioMinimo);
}
```

Un test puede verificar si esa consulta realmente devuelve lo que esperás:

```java
import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
class ProductoRepositoryTest {

    @Autowired
    private ProductoRepository productoRepository;

    @Test
    void buscarDesdePrecio_deberiaTraerSoloProductosDesdeElMinimoIndicado() {
        Producto barato = new Producto();
        barato.setTitulo("Mouse");
        barato.setPrecio(50);
        barato.setStock(10);

        Producto caro = new Producto();
        caro.setTitulo("Notebook");
        caro.setPrecio(2500);
        caro.setStock(5);

        productoRepository.save(barato);
        productoRepository.save(caro);

        List<Producto> resultado = productoRepository.buscarDesdePrecio(1000);

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getTitulo()).isEqualTo("Notebook");
    }
}
```

Esto es exactamente el tipo de pregunta donde `@DataJpaTest` brilla.

## Qué pasa con paginación y ordenamiento

También son candidatos excelentes.

Supongamos este repository:

```java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Page<Producto> findByStockGreaterThan(int stock, Pageable pageable);
}
```

Podrías probar algo como:

```java
import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@DataJpaTest
class ProductoRepositoryTest {

    @Autowired
    private ProductoRepository productoRepository;

    @Test
    void findByStockGreaterThan_deberiaRespetarPaginacionYOrden() {
        Producto a = new Producto();
        a.setTitulo("A");
        a.setPrecio(100);
        a.setStock(10);

        Producto b = new Producto();
        b.setTitulo("B");
        b.setPrecio(200);
        b.setStock(20);

        productoRepository.save(a);
        productoRepository.save(b);

        Page<Producto> resultado = productoRepository.findByStockGreaterThan(
                0,
                PageRequest.of(0, 1, Sort.by("precio").descending())
        );

        assertThat(resultado.getContent()).hasSize(1);
        assertThat(resultado.getContent().get(0).getTitulo()).isEqualTo("B");
    }
}
```

Esto muestra que el slice también sirve muy bien para probar persistencia más rica.

## Por qué esto es mejor que probar paginación desde HTTP si solo querías validar la query

Porque si lo único que querés responder es:

- ¿la query paginada devuelve el contenido correcto?
- ¿el orden funciona como espero?

entonces no hace falta pasar por toda la capa web.

Ese enfoque más directo suele dar mejor diagnóstico.

## Qué suele inyectarse en estos tests

En el caso más típico, inyectás el repository que querés probar.

Por ejemplo:

```java
@Autowired
private ProductoRepository productoRepository;
```

Y trabajás directamente con esa capa.

No hace falta traer el service ni el controller si la pregunta pertenece al repository.

## Qué relación tiene esto con entidades y relaciones

También puede ser muy útil para probar cosas como:

- que una relación simple se persiste bien
- que una búsqueda por propiedad relacionada funciona
- que una entidad con referencia a otra se guarda y se recupera razonablemente

Por ejemplo, podrías tener `Producto` y `Categoria` y probar que:

- guardás una categoría
- guardás un producto asociado
- luego una búsqueda por título o por categoría funciona como esperás

Este tipo de test te da bastante confianza sobre tu modelo persistente.

## Qué relación tiene esto con Flyway o PostgreSQL real

A nivel de estrategia general, `@DataJpaTest` está muy orientado a persistencia.
Más adelante vas a profundizar en cómo se combina eso con distintas elecciones de entorno de test:

- base embebida
- configuración específica
- uso de PostgreSQL real o equivalente
- herramientas más avanzadas

Por ahora, lo importante es entender el rol del slice.
No hace falta mezclar todavía todas las decisiones de infraestructura de test del universo.

## Qué gana el proyecto al tener estos tests

Muchísimo.

Por ejemplo:

- si cambiás una query, sabés rápido si la rompiste
- si refactorizás el repository, tenés red de seguridad
- si cambiás nombres o criterios, el test te avisa
- si agregás paginación o filtros, podés verificar que de verdad devuelvan lo correcto

Esto mejora mucho la confianza en la capa de persistencia.

## Una intuición importante

Podés pensar `@DataJpaTest` así:

> es una forma de decir “quiero probar JPA de manera realista, pero sin cargar toda la aplicación y sin mezclar capas que no necesito”.

Esa intuición vale mucho.

## Qué no deberías esperar de estos tests

No deberías esperar que te prueben automáticamente:

- endpoints
- serialización JSON
- validación de `@RequestBody`
- status HTTP
- `@ControllerAdvice`
- lógica compleja del service
- interacciones de varias capas a la vez

Para eso vendrán otras herramientas y otros tipos de tests.

## Una muy buena pregunta antes de usar @DataJpaTest

Podés preguntarte:

> ¿la duda que quiero resolver es sobre persistencia real, mapeo JPA o consultas del repository?

Si la respuesta es sí, `@DataJpaTest` es muy candidato.

Si la duda es:

- “¿responde 400?”,
- “¿el endpoint serializa bien?”,
- “¿el service lanza la excepción correcta según mocks?”,

entonces probablemente necesitás otra herramienta.

## Qué pasa si todo lo probás con mocks

A veces alguien intenta probar repositories o queries solo con mocks.

Eso puede ser útil para otras capas, pero no sirve para verificar si la consulta real funciona.

Porque el mock no te dice si:

- el nombre derivado está bien
- la query JPQL está correcta
- el criterio encuentra lo que tiene que encontrar
- la paginación u orden se comportan como esperabas

Para eso necesitás persistencia de verdad, aunque sea en un contexto de test controlado.

## Qué relación tiene esto con la velocidad del feedback

Muy buena.

Como `@DataJpaTest` levanta solo una porción orientada a JPA, suele dar un feedback bastante más enfocado que arrancar toda la app completa para una pregunta de repository.

Eso lo vuelve muy valioso en el día a día.

## Error común: querer probar queries reales solo con tests de service

Eso puede dejar un hueco grande, porque el service no es la mejor capa para verificar si el repository realmente consulta bien.

## Error común: ir directo a tests enormes de integración para cualquier query sencilla

A veces parece más “completo”, pero también es menos preciso y más pesado.

No siempre hace falta el martillo más grande.

## Error común: usar @DataJpaTest para preguntas que son claramente HTTP

Si querés verificar:

- códigos de estado
- bodies JSON
- validación del request
- rutas

entonces estás en la capa web, no en persistencia.

## Error común: no escribir tests de repository porque “JpaRepository ya viene hecho”

Aunque `JpaRepository` traiga mucho listo, tus repositories pueden tener:

- métodos derivados propios
- `@Query`
- filtros
- ordenamientos
- paginación
- decisiones de mapeo

Eso sí merece pruebas cuando es relevante.

## Relación con Spring Boot

Spring Boot tiene un ecosistema de testing muy fuerte precisamente porque ofrece herramientas enfocadas por capa.

`@DataJpaTest` es uno de los mejores ejemplos de eso:
un slice muy útil para probar persistencia con intención clara y sin ruido innecesario.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> `@DataJpaTest` permite probar repositories, entidades y consultas JPA en un contexto reducido y enfocado en persistencia, ideal para verificar acceso a datos real sin levantar toda la aplicación ni mezclar responsabilidades que pertenecen a otras capas.

## Resumen

- `@DataJpaTest` está pensado para probar la capa JPA de forma enfocada.
- Es ideal para repositories, queries derivadas, `@Query`, paginación y comportamiento de persistencia.
- No conviene usarlo para probar HTTP, JSON o validación web.
- Aporta foco, mejor diagnóstico y menos ruido que levantar toda la app para preguntas de repository.
- Es muy valioso cuando querés verificar persistencia real y no solo mocks.
- Refuerza la estrategia de testing por capa.
- Este tema prepara el terreno para seguir con tests de service y después con tests de la capa web.

## Próximo tema

En el próximo tema vas a ver cómo probar la lógica del service con mocks y tests más enfocados en el caso de uso, para separar claramente lo que pertenece a persistencia de lo que pertenece a reglas y flujo del negocio.
