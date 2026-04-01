---
title: "Testing de integración más profundo y Testcontainers"
description: "Cómo probar un backend Java de forma más cercana al entorno real usando tests de integración más completos y Testcontainers."
order: 67
module: "Calidad y testing avanzado"
level: "intermedio"
draft: false
---

## Introducción

En lecciones anteriores ya viste testing en Spring Boot, tests unitarios, tests web, tests de repository y una base bastante buena para validar partes del sistema.

Eso te dio herramientas importantes para comprobar:

- lógica de services
- controllers
- validaciones
- persistencia simple
- comportamiento general del contexto

Pero a medida que el backend crece y se vuelve más realista, aparece una pregunta muy importante:

**¿cómo probás el sistema de forma más cercana a cómo corre de verdad, sin depender tanto de mocks o entornos locales improvisados?**

Ahí entran los tests de integración más profundos y Testcontainers.

## La idea general

Un test unitario te ayuda a aislar piezas pequeñas.

Eso es muy valioso.

Pero no alcanza para todo.

A veces necesitás comprobar cosas como:

- si la aplicación se conecta bien a PostgreSQL real
- si una migración Flyway funciona
- si una query JPA se comporta como esperabas
- si Redis responde realmente
- si el arranque del contexto interactúa bien con infraestructura real
- si varias capas juntas funcionan de forma coherente

Ahí los tests de integración se vuelven especialmente importantes.

## Qué es un test de integración

Un test de integración prueba cómo interactúan varias piezas reales del sistema entre sí.

Por ejemplo:

- service + repository + base real
- controller + service + seguridad + persistencia
- aplicación + PostgreSQL
- aplicación + Redis
- aplicación + migraciones

## Diferencia con test unitario

### Test unitario

Aísla una pieza pequeña y suele usar mocks para dependencias.

### Test de integración

Prueba la interacción de varios componentes reales.

## Qué problema resuelve

Los tests de integración ayudan a detectar problemas que los tests unitarios no suelen ver fácilmente.

Por ejemplo:

- configuración incorrecta
- mapping JPA que falla en base real
- migraciones problemáticas
- errores en queries reales
- problemas de serialización
- diferencias entre H2 y PostgreSQL real
- integración incorrecta entre capas

## Por qué esto importa tanto

Porque en backend muchas veces los errores más molestos no viven en una función aislada.

Viven en la interacción entre:

- framework
- base
- configuración
- seguridad
- serialización
- migraciones
- infraestructura

## Qué tipos de integración podrías querer probar

Por ejemplo:

- persistencia real con PostgreSQL
- endpoint protegido con Spring Security
- consulta con filtros complejos
- migraciones Flyway al arrancar
- cache con Redis
- comportamiento de un controller usando DB real
- integración con servicio externo mockeado pero infraestructura real

## Qué no significa hacer integración

No significa necesariamente probar todo el sistema entero siempre.

Podés tener distintos niveles de integración.

Por ejemplo:

- integración de repository con DB real
- integración de service con DB real
- integración web completa con seguridad y persistencia
- integración con contenedores de infraestructura específicos

## Problema típico de los entornos de test tradicionales

Un problema clásico es cuando tus tests dependen de cosas como:

- una base local que “más o menos” existe
- una instalación manual en tu máquina
- datos de prueba armados a mano
- diferencias entre entornos de desarrollo

Eso hace los tests más frágiles y menos reproducibles.

## Ahí entra Testcontainers

Testcontainers es una librería que permite levantar contenedores reales, normalmente con Docker, para usarlos durante los tests.

Dicho simple:

podés correr tus tests usando infraestructura real y efímera como:

- PostgreSQL
- Redis
- Kafka
- RabbitMQ
- otros servicios

todo eso levantado automáticamente para la suite de tests.

## Qué gana el proyecto con eso

Muchísimo.

Porque los tests se acercan más a la realidad y además siguen siendo reproducibles.

En vez de depender de “tené PostgreSQL instalado y configurado así”, el test puede levantar un PostgreSQL real temporal.

## Ejemplo mental

En vez de hacer tests JPA contra una base distinta a producción o contra un entorno improvisado, podrías levantar:

- un contenedor PostgreSQL
- aplicar migraciones
- correr la aplicación o la parte necesaria
- validar comportamiento real

Eso es muy potente.

## Qué problema muy común evita

Uno especialmente molesto:

“en H2 andaba, pero en PostgreSQL real falla”

Testcontainers ayuda muchísimo a reducir esa clase de sorpresas.

## Por qué pasa eso

Porque una base embebida de test no siempre se comporta igual que la base real de producción.

Puede haber diferencias en:

- tipos de datos
- SQL
- índices
- constraints
- comportamiento del dialecto
- funciones específicas

Por eso probar contra el motor real suele dar mucha más confianza.

## Dependencia típica

A nivel conceptual, usar Testcontainers implica agregar dependencias del ecosistema Testcontainers y del módulo específico del servicio que querés levantar.

Por ejemplo, para PostgreSQL podrías usar el módulo correspondiente a PostgreSQL.

No hace falta memorizar todo el `pom.xml` ahora.
Lo importante es entender el propósito.

## Requisito práctico importante

Normalmente Testcontainers necesita Docker disponible en el entorno donde corren los tests.

Eso es parte central de su modelo.

## Ejemplo conceptual con PostgreSQL

Supongamos que querés probar un repository real contra PostgreSQL.

La idea general sería:

1. levantar un contenedor PostgreSQL
2. configurar la app de test para apuntar a ese contenedor
3. correr migraciones
4. ejecutar tests reales

## Ejemplo conceptual de test

```java
@Testcontainers
@SpringBootTest
public class ProductRepositoryIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @Test
    void shouldPersistAndReadProduct() {
        // test real contra PostgreSQL del contenedor
    }
}
```

## Qué muestra este ejemplo

Que el test declara un contenedor que se levanta para la ejecución de la suite o del conjunto correspondiente.

## `@Testcontainers`

Indica que el test trabaja con Testcontainers.

## `@Container`

Marca el contenedor que debe ser administrado por Testcontainers.

## Qué todavía falta en ese ejemplo

Falta conectar la aplicación de test a los datos del contenedor:

- URL
- username
- password

Eso se suele resolver con propiedades dinámicas o configuración específica del test.

## La idea importante

Lo importante no es memorizar la API exacta ya, sino entender que:

- el contenedor se levanta automáticamente
- el test usa esa infraestructura real
- la prueba se vuelve más parecida al mundo real

## Ejemplo mental de flujo completo

Podrías probar:

- `@SpringBootTest`
- PostgreSQL real con Testcontainers
- Flyway corriendo al inicio
- repository real
- service real
- DTOs y mapping reales

Eso da una confianza mucho más fuerte que varios mocks juntos.

## Relación con Flyway

Esto conecta muy fuerte con la lección de migraciones.

Si usás Testcontainers con PostgreSQL real, también podés verificar que:

- las migraciones corren bien
- el esquema queda correcto
- la aplicación realmente arranca con esa base

Eso es muy valioso.

## Relación con seguridad

También podés probar:

- endpoints protegidos
- login
- autorización
- filtros
- flujos con JWT
- restricciones de acceso

de forma bastante más realista si el sistema se levanta con infraestructura más cercana a producción.

## Relación con Redis

Además de PostgreSQL, podrías querer probar cache con Redis real.

El patrón conceptual es parecido:

- levantar Redis en un contenedor
- configurar el entorno de test
- ejecutar operaciones que interactúan con cache real

## Qué tipos de tests se benefician mucho

Suelen beneficiarse especialmente:

- persistencia compleja
- filtros y búsquedas
- migraciones
- seguridad real
- caches
- integraciones entre varias capas del backend

## Qué no conviene hacer

No conviene reemplazar todos los tests unitarios por tests de integración gigantes.

Los tests unitarios siguen siendo valiosos.

Lo sano suele ser una estrategia combinada.

## Estrategia equilibrada

Una combinación bastante sana suele ser:

- muchos tests unitarios para lógica acotada
- tests web para endpoints importantes
- tests de integración más profundos para infraestructura real
- algunos tests más costosos pero muy valiosos para flujos críticos

## Por qué esto es mejor

Porque:

- los unitarios son rápidos y precisos
- los de integración capturan problemas reales de configuración e infraestructura
- no dependés de un solo tipo de prueba para todo

## Coste de los tests de integración profundos

También tienen costo.

Por ejemplo:

- son más lentos que los unitarios
- requieren más setup
- pueden necesitar Docker
- son más pesados para ejecutar masivamente

Por eso conviene elegir bien qué flujos o componentes merecen ese nivel de prueba.

## Qué suele ser buena inversión probar así

Suele ser muy buena inversión probar con Testcontainers cosas como:

- repositories importantes
- migraciones
- operaciones con stock
- creación de órdenes
- seguridad crítica
- búsquedas complejas
- cache o infraestructura clave

## Ejemplo conceptual de repository real

```java
@DataJpaTest
@Testcontainers
public class ProductRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @Test
    void shouldFindProductByName() {
        // guardar entidad
        // ejecutar query real
        // validar comportamiento
    }
}
```

## Qué idea transmite

Que incluso un test bastante enfocado puede ganar mucho realismo si la base es el motor real y no una simulación distinta.

## Ejemplo conceptual con `@SpringBootTest`

```java
@Testcontainers
@SpringBootTest
public class OrderFlowIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @Test
    void shouldCreateOrderAndPersistItems() {
        // probar flujo más completo
    }
}
```

## Qué diferencia hay con el repository test

Acá ya podrías estar levantando una porción mucho más amplia de la aplicación y validando un flujo de negocio real.

## Integraciones externas y Testcontainers

Testcontainers no reemplaza todos los mocks externos del mundo.

Por ejemplo, si una API de terceros de pago es ajena a tu entorno, quizá sigas queriendo mockear o simular ese proveedor.

Pero sí podés usar infraestructura real para tus piezas controlables como:

- DB
- cache
- mensajería
- colas
- servicios auxiliares propios

## Qué combinación suele ser sana

Por ejemplo:

- PostgreSQL real con Testcontainers
- Redis real con Testcontainers
- proveedor de pagos mockeado o stub
- aplicación corriendo con configuración realista

Eso ya da muchísimo valor.

## Test de integración y datos de prueba

Otro punto importante es cómo preparar datos de prueba.

Conviene que los tests armen lo que necesitan de forma explícita y controlada, en vez de depender de datos misteriosos del entorno.

Eso vuelve a los tests más legibles y reproducibles.

## Limpieza y aislamiento

También conviene cuidar que un test no contamine a otro.

La reproducibilidad importa mucho.

Esto puede implicar:

- reset de datos
- transacciones de test según enfoque
- fixtures claros
- contenedores aislados
- datasets mínimos

## Qué gana el proyecto profesionalmente

Muchísimo.

Un proyecto que combina:

- unit tests
- integration tests
- infraestructura realista con Testcontainers

demuestra una madurez técnica bastante fuerte.

## Por qué es tan valioso en portfolio o trabajo real

Porque muestra que no solo sabés programar el backend, sino también verificarlo de forma seria.

Y en muchos equipos eso tiene muchísimo valor.

## Limitaciones prácticas

También conviene ser honesto con las limitaciones:

- los tests tardan más
- requieren Docker
- pueden consumir más recursos
- exigen más disciplina de setup

Pero en muchísimos casos el valor compensa.

## Ejemplo mental de flujo muy valioso

Podrías probar algo como:

1. levantar PostgreSQL real
2. aplicar Flyway
3. crear usuario
4. crear producto
5. crear orden
6. verificar que stock y DB quedaron como corresponde

Eso da una confianza muchísimo mayor que varios mocks aislados.

## Relación con CI/CD

Esto conecta muy bien con la lección de CI/CD.

Si tu pipeline puede correr tests importantes con Testcontainers, ganás una validación mucho más seria antes de mergear o desplegar.

Eso eleva bastante la calidad del proyecto.

## Buenas prácticas iniciales

## 1. No reemplazar todos los tests por integración pesada

Combinar estrategias suele ser mejor.

## 2. Usar Testcontainers donde el realismo aporte valor fuerte

Especialmente DB, cache y mensajería.

## 3. Probar motores reales cuando eso evite sorpresas

PostgreSQL real suele ser un gran candidato.

## 4. Mantener los tests claros y reproducibles

No depender de magia local.

## 5. Integrar esto progresivamente

No hace falta que todo el proyecto lo use desde el minuto uno.

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede recordarte a tests que levantan servicios reales con Docker para evitar mocks excesivos. En Java y Spring Boot esto es especialmente valioso porque muchas sorpresas viven en la interacción real con PostgreSQL, Redis o la configuración del framework.

### Si venís de Python

Puede hacerte pensar en pruebas más cercanas a integración real usando contenedores efímeros. En Java, Testcontainers se volvió especialmente importante porque permite validar muy bien persistencia, migraciones e infraestructura de forma bastante profesional.

## Errores comunes

### 1. Confiar solo en H2 o bases alternativas si producción usa otra cosa

Eso puede esconder problemas reales.

### 2. Intentar probar todo solo con mocks

También deja huecos importantes.

### 3. Hacer tests de integración enormes, lentos y difíciles de entender

Conviene que incluso los tests profundos sigan siendo claros.

### 4. No controlar bien datos de prueba y aislamiento

Después aparecen falsos positivos o inestabilidad.

### 5. No aprovechar Testcontainers para piezas críticas donde realmente aporta

Se pierde bastante valor.

## Mini ejercicio

Pensá un flujo importante de tu proyecto integrador y definí:

1. qué componentes reales querrías probar juntos
2. qué infraestructura real levantarías con Testcontainers
3. qué cosas seguirías mockeando
4. qué datos prepararías
5. qué resultado final te gustaría validar

## Ejemplo posible

Caso:
crear orden

- probar juntos:
  - service
  - repository
  - PostgreSQL real
  - Flyway
- mockear:
  - pasarela de pagos externa
- validar:
  - orden creada
  - items persistidos
  - stock actualizado
  - auditoría guardada si aplica

## Resumen

En esta lección viste que:

- los tests de integración prueban cómo interactúan varias piezas reales del sistema
- Testcontainers permite levantar infraestructura real con Docker durante los tests
- esto ayuda mucho a probar PostgreSQL, Redis y otros servicios de forma más cercana a producción
- combina muy bien con Flyway, seguridad, persistencia compleja y CI/CD
- usar Testcontainers con criterio mejora bastante la confianza en el backend y reduce sorpresas entre desarrollo y producción

## Siguiente tema

La siguiente natural es **performance y profiling básico en backend Java**, porque después de recorrer bastante testing serio, arquitectura y operación realista, el siguiente paso muy valioso es aprender a detectar cuellos de botella y entender mejor cómo se comporta la aplicación bajo carga.
