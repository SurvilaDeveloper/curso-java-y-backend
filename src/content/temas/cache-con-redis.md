---
title: "Cache con Redis"
description: "Qué es Redis, cómo funciona una capa de cache y por qué puede mejorar rendimiento y escalabilidad en aplicaciones Spring Boot."
order: 53
module: "Operación y rendimiento"
level: "intermedio"
draft: false
---

## Introducción

En la lección anterior viste observabilidad básica con:

- logs
- métricas
- health checks

Eso te acercó bastante a una idea importante:
una aplicación real no solo debe funcionar, también debe poder entenderse mientras corre.

Ahora aparece otra preocupación muy natural cuando el sistema empieza a crecer:

**¿cómo mejorás rendimiento y reducís trabajo repetido cuando ciertas consultas o respuestas se piden una y otra vez?**

Ahí entra la cache.

Y una de las herramientas más usadas para eso en backend moderno es Redis.

## Qué es una cache

Una cache es una capa donde guardás temporalmente datos que son costosos o repetitivos de obtener, para poder responder más rápido la próxima vez.

Dicho simple:

- la primera vez calculás o consultás algo
- lo guardás en cache
- la próxima vez evitás repetir todo el trabajo

## La idea general

Supongamos que tenés un endpoint que lista productos destacados.

Si cada request hace siempre:

- consulta a base
- mapping
- armado de respuesta

aunque los datos cambien poco, estás repitiendo trabajo innecesario.

Con cache podés hacer algo como:

1. primera request → consultar y guardar resultado
2. siguientes requests → devolver resultado desde cache

Eso puede mejorar mucho tiempos de respuesta y carga sobre la base.

## Qué es Redis

Redis es un sistema de almacenamiento en memoria, extremadamente rápido, muy usado como:

- cache
- store temporal
- soporte para sesiones
- pub/sub
- colas simples en ciertos casos
- estructuras de datos rápidas

En esta lección nos vamos a enfocar sobre todo en su uso como cache.

## Por qué Redis se usa tanto para cache

Porque tiene varias ventajas muy fuertes:

- trabaja en memoria
- responde muy rápido
- es muy popular
- se integra bien con muchos ecosistemas
- sirve muy bien para datos temporales o reutilizables

## Qué problema resuelve una cache

La cache ayuda a reducir trabajo repetido en operaciones como:

- lecturas frecuentes
- catálogos
- búsquedas repetidas
- configuraciones casi estáticas
- respuestas costosas de construir
- datos consultados mucho más de lo que se actualizan

## Cuándo tiene sentido pensar en cache

No todo necesita cache.

Suele tener más sentido cuando:

- una lectura ocurre muchas veces
- el dato cambia poco comparado con lo que se consulta
- el costo de recalcular o volver a consultar es alto
- hay presión sobre la base o servicios externos
- querés mejorar tiempo de respuesta

## Cuándo no conviene pensar primero en cache

Tampoco conviene saltar a cache demasiado pronto si todavía no entendés bien:

- dónde está el cuello de botella
- si la consulta está bien diseñada
- si faltan índices
- si el problema es la lógica, no la lectura
- si la complejidad extra vale la pena

Una regla bastante sana es:
primero entendé bien el problema, después cacheá con criterio.

## Cómo funciona la idea de cache

La lógica mental más simple suele ser:

- si el dato está en cache → lo devolvés
- si no está → lo calculás o consultás, lo guardás y lo devolvés

En inglés a esto a veces se le llama cache-aside pattern.

## Ejemplo mental simple

Querés obtener un producto por id.

Flujo:

1. buscar `product:15` en Redis
2. si existe → devolverlo
3. si no existe → consultar base
4. guardar el resultado en Redis por un tiempo
5. devolverlo

## Qué gana el sistema con eso

- menos viajes a la base
- menor carga repetida
- respuestas más rápidas
- mejor experiencia para clientes en ciertos endpoints

## Redis como clave-valor

Una forma simple de pensar Redis es como un store clave-valor muy rápido.

Por ejemplo:

- clave: `product:15`
- valor: JSON o representación serializada del producto

O:

- clave: `featured-products`
- valor: lista serializada de productos destacados

## TTL

Una idea muy importante en cache es el TTL.

TTL significa:

**time to live**

Es el tiempo durante el cual un dato queda válido en cache antes de expirar.

## Por qué importa el TTL

Porque la cache no debería vivir para siempre sin criterio.

Si guardás datos eternamente, corrés el riesgo de servir información muy vieja.

El TTL ayuda a equilibrar:

- velocidad
- frescura de datos

## Ejemplo mental de TTL

Podrías decidir algo como:

- productos destacados → 5 minutos
- configuración general → 1 hora
- perfil de usuario → 1 minuto
- resultados muy sensibles al cambio → quizá no cachear

No hay tiempos universales.
Depende del caso de uso.

## Cache y consistencia

Uno de los temas más importantes en cache es la consistencia.

Porque en cuanto guardás datos duplicados temporalmente, aparece una pregunta clave:

**¿qué pasa si el dato original cambia?**

Por ejemplo:

- actualizás un producto en base
- pero el producto viejo sigue en cache

Ahí aparece el problema de cache stale, o sea, cache desactualizada.

## Estrategias frente a eso

Suele haber varias estrategias:

- dejar que expire por TTL
- invalidar la cache cuando el dato cambia
- actualizar la cache al escribir
- combinar enfoques según el caso

## Cache-aside

Ya la nombramos recién y es una de las estrategias más comunes.

Flujo:

1. leer cache
2. si no está, leer origen real
3. guardar en cache
4. devolver

Y cuando el dato cambia:

- invalidás o actualizás la cache

Es un patrón muy usado y bastante fácil de razonar.

## Write-through y write-behind

Existen otras estrategias más avanzadas, pero para esta etapa alcanza con conocerlas de nombre.

### Write-through

Cuando escribís, actualizás inmediatamente también la cache.

### Write-behind

La actualización de cache o persistencia puede diferirse.

Para empezar, cache-aside suele ser la idea más natural.

## Redis y Spring Boot

Spring Boot puede integrarse con Redis de forma muy cómoda.

Una forma común es usar soporte de cache del ecosistema Spring.

Eso permite declarar cache de forma bastante expresiva.

## Dependencias típicas

En Maven podrías encontrar cosas como:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

y también el soporte de cache del ecosistema Spring si lo necesitás.

No hace falta memorizar toda la configuración ahora.
Lo importante es entender el rol de la herramienta.

## `@EnableCaching`

En Spring es común habilitar cache con algo así:

```java
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {
}
```

## Qué hace esto

Activa el mecanismo de cache anotado dentro de la aplicación.

## `@Cacheable`

Una de las anotaciones más conocidas es:

```java
@Cacheable
```

Sirve para decir:
“el resultado de este método puede guardarse en cache”.

## Ejemplo conceptual

```java
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    @Cacheable("products")
    public ProductResponseDto getProductById(Long id) {
        // consulta costosa o repetida
        return findProductSomehow(id);
    }
}
```

## Qué significa esto

Cuando se llama a ese método:

- si el resultado ya está cacheado para esa clave, se reutiliza
- si no está, se ejecuta el método y se guarda el resultado

## Qué clave usa

Por defecto, Spring construye una clave a partir de los parámetros del método.

En este ejemplo, el `id` participa naturalmente en la clave.

## Ejemplo mental

Primera llamada:

```java
getProductById(15L)
```

- no está en cache
- se ejecuta lógica real
- se guarda el resultado

Segunda llamada con el mismo id:

```java
getProductById(15L)
```

- ahora sí está en cache
- se devuelve sin repetir toda la lógica

## `@CacheEvict`

Cuando un dato cambia, muchas veces querés invalidar la cache.

Para eso existe:

```java
@CacheEvict
```

## Ejemplo conceptual

```java
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    @CacheEvict(value = "products", key = "#id")
    public void deleteProduct(Long id) {
        // borrar producto real
    }
}
```

## Qué hace esto

Después de borrar o modificar el dato real, elimina la entrada correspondiente de cache.

Eso ayuda a evitar devolver información vieja.

## `@CachePut`

Otra anotación útil es:

```java
@CachePut
```

Sirve para actualizar la cache con el resultado del método en vez de solo invalidarla.

## Cuándo conviene usarla

Puede servir cuando querés que la cache quede sincronizada con el nuevo valor inmediatamente después de una operación.

## Ejemplo conceptual

```java
import org.springframework.cache.annotation.CachePut;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    @CachePut(value = "products", key = "#result.id")
    public ProductResponseDto updateProduct(Long id, UpdateProductRequestDto request) {
        // actualizar en base y devolver dto actualizado
        return updatedDto;
    }
}
```

## Qué idea muestra esto

Que la cache no solo sirve para guardar lecturas, sino también puede formar parte del flujo de actualización si lo diseñás así.

## Cache de listas

No solo podés cachear por id.

También podrías cachear listas o resultados agregados.

Por ejemplo:

- productos destacados
- categorías visibles
- settings públicos
- top ventas de la semana

Ejemplo:

```java
@Cacheable("featured-products")
public List<ProductResponseDto> getFeaturedProducts() {
    return productRepository.findFeaturedProducts()
            .stream()
            .map(productMapper::toDto)
            .toList();
}
```

## Qué riesgo tiene cachear listas

Que si la lista cambia mucho o depende de muchos filtros distintos, la invalidación y la utilidad de la cache se vuelven más delicadas.

Por eso conviene elegir bien qué cosas cachear.

## Cache y personalización por usuario

También hay que tener cuidado con datos específicos por usuario.

Por ejemplo:

- carrito
- perfil
- permisos
- órdenes propias

Cachear eso puede requerir claves bien construidas y mucho criterio.

No conviene mezclar resultados de un usuario con otro por un diseño pobre de claves.

## Ejemplo mental de clave peligrosa

Si cachearas algo como:

```text
/orders/me
```

sin distinguir usuario, podrías terminar sirviendo órdenes equivocadas.

En casos así, la clave debería incorporar identidad del usuario.

## Cache y serialización

Cuando usás Redis, los datos deben poder serializarse.

Eso significa que el sistema necesita transformar objetos Java en un formato almacenable y luego reconstruirlos.

No hace falta profundizar todos los detalles ahora, pero conviene saber que la cache no guarda mágicamente objetos “tal cual”.

## Qué tipo de cosas cachear primero

Una estrategia sana para empezar suele ser elegir algo como:

- catálogos
- datos públicos o casi estáticos
- configuraciones
- listados destacados
- consultas muy repetidas y poco cambiantes

Eso reduce bastante complejidad inicial.

## Qué no cachear al principio sin mucho cuidado

Evitaría empezar cacheando directamente cosas como:

- operaciones muy sensibles
- datos muy dinámicos
- permisos complejos
- transacciones críticas
- resultados que cambian cada segundo

No porque sea imposible, sino porque exigen más criterio y control.

## Ejemplo completo conceptual

### Configuración

```java
@Configuration
@EnableCaching
public class CacheConfig {
}
```

### Service

```java
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public ProductService(ProductRepository productRepository,
                          ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
    }

    @Cacheable(value = "products", key = "#id")
    public ProductResponseDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        return productMapper.toDto(product);
    }

    @CacheEvict(value = "products", key = "#id")
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
```

## Qué demuestra este ejemplo

Demuestra la idea base más importante:

- lecturas repetidas pueden cachearse
- cambios importantes deben invalidar o actualizar la cache

## Redis y Docker

Redis encaja muy bien con Docker.

Por ejemplo, podrías levantarlo como un servicio extra en `docker-compose.yml`.

Ejemplo conceptual:

```yaml
version: "3.9"

services:
  app:
    build: .
    ports:
      - "8080:8080"
    depends_on:
      - db
      - redis

  db:
    image: postgres:16

  redis:
    image: redis:7
    ports:
      - "6379:6379"
```

## Qué valor tiene esto

Te permite correr una arquitectura bastante realista en local:

- app
- base
- cache

todo junto.

## Observabilidad y cache

Esto conecta muy bien con la lección anterior.

Cuando agregás cache, conviene observar cosas como:

- si realmente baja la carga a la base
- si mejora latencia
- si hay errores de conexión a Redis
- si la invalidación funciona bien
- si no estás sirviendo datos demasiado viejos

O sea:
la cache también debería observarse.

## Cache no reemplaza optimización de base

Esto es muy importante.

La cache puede ayudar mucho, pero no debería usarse como excusa para ignorar:

- queries malas
- índices ausentes
- relaciones mal diseñadas
- endpoints poco pensados

Primero entendé el problema real.
Después cacheá con criterio.

## Buenas prácticas iniciales

## 1. Empezar por cachear lecturas muy repetidas y bastante estables

No todo a la vez.

## 2. Definir bien claves y TTL

Son centrales para un buen diseño.

## 3. Invalidar o actualizar cache cuando los datos cambian

No confiar solo en la suerte.

## 4. No cachear datos sensibles sin mucho cuidado

Menos todavía si son específicos por usuario.

## 5. Medir si la cache realmente aporta

No asumir que toda cache mejora todo.

## Comparación con otros lenguajes

### Si venís de JavaScript

Probablemente ya viste Redis como cache en backends Node o servicios web. En Spring Boot cumple un rol muy parecido, pero con una integración muy cómoda mediante anotaciones y el sistema de cache del ecosistema Spring.

### Si venís de Python

Puede recordarte al uso de Redis para resultados temporales, sesiones o cache de lecturas repetidas. En Java y Spring Boot, la gran ventaja es que podés integrar cache de forma muy declarativa y clara con servicios y repositorios.

## Errores comunes

### 1. Cachear demasiado pronto sin entender el problema

Primero medí y razoná.

### 2. No invalidar la cache cuando cambia el dato real

Eso genera respuestas viejas.

### 3. Construir claves pobres o ambiguas

Eso puede mezclar datos incorrectamente.

### 4. Usar cache como sustituto de queries bien pensadas

No debería ser el parche universal.

### 5. No poner límites o expiración razonable

La cache también necesita control.

## Mini ejercicio

Elegí un endpoint de tu proyecto integrador que se consulte mucho y cambie poco.

Respondé:

1. ¿qué dato cachearías?
2. ¿qué clave usarías?
3. ¿qué TTL te parecería razonable?
4. ¿qué operación debería invalidar esa cache?
5. ¿cómo sabrías si la cache realmente está ayudando?

## Ejemplo posible

Endpoint:
`GET /products/{id}`

- cachear producto por id
- clave: `products::15`
- TTL: 5 minutos
- invalidación al actualizar o eliminar producto
- medir impacto viendo latencia y carga sobre base

## Resumen

En esta lección viste que:

- una cache guarda temporalmente datos repetidos para responder más rápido
- Redis es una herramienta muy usada para cache en backend moderno
- Spring Boot permite integrar cache de forma cómoda con anotaciones como `@Cacheable`, `@CacheEvict` y `@CachePut`
- TTL, claves e invalidación son ideas centrales para usar cache correctamente
- la cache puede mejorar mucho rendimiento, pero debe usarse con criterio y observarse bien

## Siguiente tema

La siguiente natural es **documentación y README profesional del proyecto**, porque después de haber construido una base muy rica en backend, seguridad, persistencia, despliegue y rendimiento, el siguiente paso muy útil es aprender a presentar y explicar bien el proyecto para que otra persona pueda entenderlo, correrlo y evaluarlo.
