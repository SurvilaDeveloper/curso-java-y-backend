---
title: "Versionado de API y evolución de contratos"
description: "Cómo hacer evolucionar una API sin romper a quienes la consumen, qué significa versionar y qué estrategias conviene conocer en backends reales."
order: 60
module: "Arquitectura y escalabilidad"
level: "intermedio"
draft: false
---

## Introducción

Hasta ahora ya recorriste una parte muy amplia del backend con Java y Spring Boot:

- controllers
- services
- DTOs
- validaciones
- manejo de errores
- seguridad
- persistencia
- testing
- observabilidad
- integraciones externas
- resiliencia
- documentación con OpenAPI

Eso ya te permite diseñar APIs bastante serias.

Pero cuando una API empieza a usarse de verdad, aparece una pregunta muy importante:

**¿cómo hacés para cambiarla sin romper a quienes ya la están consumiendo?**

Ahí entra el versionado de API y la evolución de contratos.

## La idea general

Diseñar una API no es solo crear endpoints que hoy funcionan.

También implica pensar que mañana quizás necesites:

- agregar campos
- cambiar nombres
- cambiar formatos
- dividir endpoints
- endurecer validaciones
- modificar reglas de seguridad
- reorganizar respuestas
- retirar funcionalidades viejas

Y todo eso puede afectar a:

- frontends
- apps móviles
- integraciones externas
- otros microservicios
- clientes internos

Por eso este tema es tan importante.

## Qué es un contrato de API

El contrato de una API es el conjunto de acuerdos implícitos o explícitos que existen entre tu backend y quien lo consume.

Por ejemplo:

- qué endpoints existen
- qué método HTTP usan
- qué parámetros esperan
- qué body reciben
- qué JSON devuelven
- qué errores pueden responder
- qué autenticación requieren

## Qué significa evolucionar un contrato

Significa cambiar ese acuerdo con el tiempo.

A veces para mejorarlo.
A veces para corregirlo.
A veces para sumar capacidades nuevas.

El problema es que no cualquier cambio es inocente.

## Qué problema resuelve el versionado

El versionado ayuda a gestionar cambios sin romper bruscamente a los consumidores existentes.

Sin una estrategia de evolución, pueden pasar cosas como:

- el frontend deja de funcionar
- una app móvil vieja rompe
- una integración externa falla
- un cliente no entiende la nueva respuesta
- un equipo se queda bloqueado por cambios incompatibles

## Cambios compatibles vs cambios incompatibles

Esta distinción es muy importante.

## Cambio compatible

Es un cambio que no rompe a los consumidores existentes si están usando el contrato actual.

Por ejemplo, muchas veces puede ser compatible:

- agregar un campo nuevo opcional en una response
- agregar un endpoint nuevo
- ampliar documentación
- sumar soporte adicional sin quitar lo anterior

## Cambio incompatible

Es un cambio que puede romper consumidores existentes.

Por ejemplo:

- renombrar un campo usado por clientes
- eliminar un endpoint
- cambiar tipo de dato de un campo
- hacer obligatorio algo que antes no lo era
- cambiar semántica de una respuesta
- modificar estructura JSON de forma no compatible

## Por qué esta distinción importa tanto

Porque no todo cambio necesita una nueva versión.
Pero algunos cambios sí exigen una estrategia más cuidadosa.

## Ejemplo mental

Supongamos esta respuesta:

```json
{
  "id": 1,
  "name": "Notebook",
  "price": 1250.50
}
```

Si mañana la cambiás a:

```json
{
  "id": 1,
  "title": "Notebook",
  "amount": 1250.50
}
```

podrías romper a cualquier cliente que esperaba `name` y `price`.

Ese es un cambio incompatible.

## Qué es versionar una API

Versionar una API significa distinguir formalmente distintas versiones del contrato para poder introducir cambios sin romper de golpe a todos los consumidores.

Dicho simple:

- mantenés una versión actual usada por ciertos clientes
- introducís una versión nueva con cambios
- das tiempo a migrar

## Estrategias comunes de versionado

Hay varias estrategias usadas en la práctica.

Por ejemplo:

- versión en URL
- versión en header
- versión en media type
- evolución sin versionado explícito en ciertos casos compatibles

No hay una única opción universalmente correcta.

## Versionado en URL

Es una de las estrategias más conocidas y fáciles de entender.

Ejemplo:

```text
/api/v1/products
/api/v2/products
```

## Qué ventaja tiene

Es muy explícito y muy visible.

Tanto para humanos como para tooling, es fácil ver qué versión se está usando.

## Qué desventaja tiene

Puede duplicar rutas y controllers si no se maneja con cuidado.

También puede tentar a crear “versiones gigantes” en vez de una evolución más fina.

## Versionado en header

Otra estrategia es mandar la versión por header.

Ejemplo conceptual:

```text
API-Version: 2
```

## Qué ventaja tiene

Mantiene la URL más limpia.

## Qué desventaja tiene

Es menos visible a simple vista y a veces más incómodo de inspeccionar o probar manualmente.

## Versionado por media type

Otra estrategia es usar el `Accept` header con media types versionados.

Ejemplo conceptual:

```text
Accept: application/vnd.myapp.v2+json
```

## Qué ventaja tiene

Se alinea con ideas más puristas del versionado de representaciones.

## Qué desventaja tiene

Puede resultar más complejo y menos amigable para muchos equipos o consumidores.

## Qué suele ser razonable al empezar

Para muchos proyectos backend reales, especialmente al aprender o construir un proyecto integrador, el versionado en URL suele ser una forma bastante clara y práctica de empezar.

Ejemplo:

```text
/api/v1/products
```

## Cuándo conviene no versionar enseguida todo

También conviene entender esto.

No hace falta crear una `v2` cada vez que agregás una mejora compatible.

Si el cambio no rompe contratos existentes, muchas veces podés evolucionar sin partir la API inmediatamente.

## Ejemplos de cambios que muchas veces pueden ser compatibles

- agregar un campo nuevo en una response
- agregar un endpoint nuevo
- agregar soporte adicional opcional
- hacer más rica una respuesta sin quitar lo anterior
- sumar metadata extra que clientes viejos puedan ignorar

## Ejemplos de cambios que suelen ser incompatibles

- eliminar campos
- renombrar campos
- cambiar el tipo de un campo
- cambiar radicalmente la estructura JSON
- mover lógica semántica de forma inesperada
- hacer obligatoria una entrada que antes era opcional

## Qué conviene hacer antes de versionar

Antes de crear una nueva versión, conviene preguntarte:

1. ¿el cambio realmente rompe consumidores?
2. ¿podría introducirlo de manera compatible?
3. ¿puedo deprecar algo primero?
4. ¿cómo comunicaré el cambio?
5. ¿qué clientes lo están usando hoy?

Estas preguntas importan mucho.

## Deprecación

Una idea muy importante en evolución de APIs es la deprecación.

Deprecar algo significa marcarlo como obsoleto o en camino de retiro, pero no eliminarlo inmediatamente.

## Por qué esto es tan útil

Porque le da tiempo a los consumidores para migrar.

En vez de romperlos de un día para otro, podés comunicar algo como:

- este endpoint seguirá funcionando por ahora
- pero será retirado más adelante
- usá esta nueva alternativa

## Ejemplo mental

Supongamos que querés reemplazar:

```text
GET /api/v1/products
```

por una versión mejor en:

```text
GET /api/v2/products
```

Podrías:

- mantener `v1` un tiempo
- documentarla como deprecada
- comunicar la fecha o plan de migración
- dar una `v2` clara
- luego retirar `v1` cuando corresponda

## Por qué una migración ordenada vale mucho

Porque una API es una interfaz pública o semipública del sistema.

Cambiarla sin criterio puede tener bastante costo operativo y de reputación técnica.

## Qué relación tiene esto con OpenAPI y Swagger

Mucha.

Porque si documentás bien tu API, también necesitás documentar bien:

- qué versión existe
- qué endpoints están vigentes
- cuáles están deprecados
- qué cambió entre versiones
- cómo migrar

Una documentación buena facilita muchísimo la evolución de contratos.

## Qué relación tiene con DTOs

También mucha.

Los DTOs son parte central del contrato externo.

Cuando cambia un DTO de request o response, el contrato cambia.

Por eso es importante tratar esos cambios con mucho más cuidado que a una simple clase interna del sistema.

## Qué relación tiene con arquitectura

Versionar bien una API también mejora si el sistema está bien separado internamente.

Si todo está muy acoplado, cualquier cambio externo puede ser doloroso.

En cambio, si tu dominio y tus casos de uso están mejor aislados, es más fácil ofrecer distintas representaciones externas sin reventar el corazón del sistema.

## Cómo pensar una `v2`

Una `v2` no debería existir “porque sí”.

Debería aparecer cuando hay una razón real, por ejemplo:

- una mejora importante incompatible
- una reorganización fuerte del contrato
- una simplificación necesaria
- una corrección profunda que no puede introducirse de forma compatible

## Qué conviene evitar

No conviene:

- crear versiones nuevas por cambios triviales
- mantener diez versiones eternamente sin criterio
- romper el contrato actual sin aviso
- versionar solo como decoración sin una política clara

## Política de evolución

Aunque el proyecto no sea gigante, conviene tener al menos una idea simple de política.

Por ejemplo:

- cambios compatibles se introducen dentro de la misma versión
- cambios incompatibles generan nueva versión
- endpoints deprecados se mantienen cierto tiempo
- la documentación siempre indica la versión vigente y la deprecada

Eso ya da bastante orden.

## Ejemplo con versionado en URL

```java
@RestController
@RequestMapping("/api/v1/products")
public class ProductV1Controller {

    @GetMapping("/{id}")
    public ProductV1ResponseDto getById(@PathVariable Long id) {
        return null;
    }
}
```

Y otra versión:

```java
@RestController
@RequestMapping("/api/v2/products")
public class ProductV2Controller {

    @GetMapping("/{id}")
    public ProductV2ResponseDto getById(@PathVariable Long id) {
        return null;
    }
}
```

## Qué muestra este ejemplo

Que pueden convivir dos contratos distintos mientras los consumidores migran.

## Coste de mantener versiones múltiples

Esto también conviene entenderlo.

Cada versión extra tiene costo:

- más código
- más testing
- más documentación
- más soporte
- más decisiones operativas

Por eso no conviene versionar de forma inflacionaria.

## Añadir campos con cuidado

A veces una forma de evolucionar sin romper es agregar en vez de reemplazar inmediatamente.

Por ejemplo, si querés migrar de `name` a `displayName`, podrías durante un tiempo devolver ambos y deprecar uno.

Eso no siempre aplica, pero es una estrategia útil en algunos casos.

## Validaciones y cambios de contrato

También hay que cuidar esto.

Si endurecés una validación de request de forma que ahora rechaza cosas antes aceptadas, podrías estar introduciendo una incompatibilidad.

Por eso no solo cambian los JSON; también cambian las reglas del contrato.

## Versionado y clientes móviles

Esto es especialmente importante con apps móviles, porque no todos los usuarios actualizan de inmediato.

Ahí romper compatibilidad puede tener impacto durante mucho tiempo.

## Versionado y microservicios

En arquitecturas con varios servicios, cambiar contratos sin criterio puede romper comunicación interna entre equipos o componentes.

Por eso el versionado no es solo un tema “de API pública a frontend”.
También puede ser muy importante dentro de sistemas distribuidos.

## Versionado y datos

A veces el cambio no está solo en el endpoint, sino en la semántica del dato.

Por ejemplo:

- antes `status` significaba una cosa
- ahora significa otra

Eso también puede romper consumidores aunque la forma JSON parezca similar.

## Comunicación del cambio

La evolución de API no es solo técnica.
También es comunicación.

Conviene dejar claro:

- qué cambió
- qué versión nueva existe
- qué está deprecado
- hasta cuándo seguirá
- cómo migrar

Eso reduce muchísimo el dolor.

## Buenas prácticas iniciales

## 1. Distinguir bien cambios compatibles de incompatibles

Esto es la base de todo el tema.

## 2. No crear nuevas versiones por cambios mínimos si no hace falta

Más versiones también cuesta mantenerlas.

## 3. Deprecar antes de retirar

Siempre que sea razonable.

## 4. Documentar versiones y cambios claramente

Swagger/OpenAPI y README ayudan mucho acá.

## 5. Tratar DTOs y validaciones como parte del contrato

No como simples detalles internos.

## Ejemplo mental de política sana

Imaginá esta política para tu proyecto:

- `v1` es la versión estable pública
- cambios compatibles se agregan dentro de `v1`
- si hay cambio incompatible serio, nace `v2`
- `v1` se marca como deprecada cuando `v2` ya está lista
- se mantiene `v1` un tiempo razonable
- luego se retira

Eso ya es bastante profesional.

## Qué no conviene hacer

No conviene:

- renombrar campos a mitad de camino sin estrategia
- eliminar endpoints usados sin aviso
- dejar versiones viejas vivas para siempre sin mantenimiento
- introducir cambios incompatibles camuflados como “pequeños”
- no pensar en quién consume la API

## Ejemplo de cambio compatible

Antes:

```json
{
  "id": 1,
  "name": "Notebook"
}
```

Después:

```json
{
  "id": 1,
  "name": "Notebook",
  "description": "Notebook de 14 pulgadas"
}
```

En muchos casos esto puede ser compatible si los clientes viejos ignoran el nuevo campo.

## Ejemplo de cambio incompatible

Antes:

```json
{
  "id": 1,
  "name": "Notebook"
}
```

Después:

```json
{
  "id": 1,
  "productName": "Notebook"
}
```

Eso puede romper consumidores que esperaban `name`.

## Relación con testing

Cuando versionás una API, también conviene testear:

- la versión actual
- la nueva versión
- la compatibilidad esperada
- endpoints deprecados si siguen vigentes

O sea:
evolucionar una API también implica disciplina de testing.

## Relación con proyecto integrador

Si tu proyecto integrador ya creció bastante, este tema le agrega una capa muy madura de pensamiento.

Muestra que no solo sabés hacer endpoints, sino también pensar cómo sostenerlos cuando el sistema evoluciona.

Eso es muy valioso.

## Comparación con otros lenguajes

### Si venís de JavaScript

Probablemente ya viste APIs con `/v1`, `/v2` o con contratos que cambian con el tiempo. En Java y Spring Boot el problema es exactamente el mismo: cómo crecer sin romper consumidores. La diferencia suele estar en que el ecosistema se presta muy bien a formalizar DTOs, documentación y control de versiones.

### Si venís de Python

Puede recordarte a la necesidad de mantener compatibilidad en APIs web usadas por clientes diversos. En Java, este tema suele tomar mucha importancia en sistemas empresariales, integraciones internas y servicios que viven bastante tiempo.

## Errores comunes

### 1. Romper contratos sin considerar consumidores existentes

Eso es uno de los errores más costosos.

### 2. Versionar por todo o por nada

Ni inflar versiones sin razón ni ignorar cambios incompatibles importantes.

### 3. No deprecar antes de retirar

Eso complica migraciones.

### 4. No documentar qué cambió entre versiones

La migración se vuelve opaca.

### 5. Pensar solo en el endpoint y no en la semántica del dato o en las validaciones

El contrato es más amplio que la URL.

## Mini ejercicio

Tomá un endpoint de tu proyecto integrador y pensá cómo lo evolucionarías si mañana necesitás cambiar la forma de respuesta.

Definí:

1. qué parte del contrato cambiaría
2. si el cambio sería compatible o incompatible
3. si harías una nueva versión o no
4. cómo deprecarías la versión vieja
5. cómo documentarías la migración

## Ejemplo posible

Endpoint:
`GET /api/v1/products/{id}`

Cambio:
la response ahora necesita separar mejor precios y metadata.

- si solo agregás campos → posiblemente compatible
- si renombrás o reestructurás fuerte → probablemente incompatible
- en ese caso podrías crear:
  - `/api/v2/products/{id}`
- documentar:
  - qué cambia
  - qué se depreca
  - cómo migrar

## Resumen

En esta lección viste que:

- una API también necesita poder evolucionar con el tiempo
- el contrato incluye endpoints, DTOs, validaciones, errores y semántica de datos
- conviene distinguir cambios compatibles de incompatibles
- versionar ayuda a introducir cambios sin romper consumidores existentes
- la deprecación y la documentación clara son claves para migraciones ordenadas
- pensar en evolución de contratos vuelve a una API mucho más profesional y sostenible

## Siguiente tema

La siguiente natural es **multitenancy y separación de datos por cliente**, porque después de profundizar bastante en arquitectura, robustez y evolución de API, otro paso muy interesante en sistemas más avanzados es pensar cómo servir a múltiples clientes o contextos dentro de una misma plataforma.
