---
title: "Cómo organizar paquetes y features en Spring Boot cuando el proyecto empieza a crecer"
description: "Entender cómo ordenar controllers, services, repositories, DTOs y demás clases en un proyecto Spring Boot, qué diferencias hay entre organizar por capa o por feature y cómo evitar que el backend se vuelva una bolsa caótica de archivos."
order: 58
module: "Arquitectura y organización del proyecto"
level: "intermedio"
draft: false
---

En el tema anterior viste cuándo conviene usar `@SpringBootTest` y tests más integrados para verificar colaboración real entre varias capas del sistema.

Eso ya te dio una mirada bastante madura sobre cómo probar un backend Spring Boot.

Pero enseguida aparece otra pregunta muy importante, especialmente cuando el proyecto deja de ser pequeño:

> ¿cómo conviene organizar el código para que el backend siga siendo entendible cuando empiezan a aparecer más entidades, más endpoints, más servicios, más DTOs y más reglas?

Porque al principio todo parece simple.

Tenés:

- un controller
- un service
- un repository
- dos DTOs
- una entidad
- un mapper

Y listo.

Pero después aparecen:

- 15 controllers
- 20 services
- 30 DTOs
- excepciones
- validadores
- configuraciones
- clases de seguridad
- eventos
- integraciones externas
- tests
- módulos de negocio distintos

Y si no ordenás bien la estructura, el proyecto puede volverse una bolsa bastante confusa.

Este tema es clave porque te ayuda a pensar la organización del código como una decisión de arquitectura, no como un detalle menor de carpetas.

## Por qué importa tanto cómo se organizan los paquetes

Porque la estructura del proyecto influye muchísimo en cosas como:

- legibilidad
- mantenibilidad
- onboarding
- facilidad para encontrar clases
- claridad del dominio
- escalabilidad del backend
- capacidad de refactorizar sin caos

Una mala estructura no siempre rompe el sistema técnicamente.
Pero sí puede volverlo mucho más difícil de entender, tocar y hacer crecer.

Y eso, a mediano plazo, pesa muchísimo.

## El problema de “tirar todo junto”

Al principio, cuando un proyecto es muy chico, es común tener algo así:

```text
src/main/java/com/ejemplo/app
  ProductoController.java
  ProductoService.java
  ProductoRepository.java
  Producto.java
  ProductoResponse.java
  CrearProductoRequest.java
  ProductoMapper.java
  UsuarioController.java
  UsuarioService.java
  UsuarioRepository.java
  Usuario.java
  UsuarioResponse.java
  CrearUsuarioRequest.java
  UsuarioMapper.java
  ...
```

Esto puede parecer tolerable con pocas clases.

Pero a medida que el proyecto crece, se vuelve difícil:

- navegar
- encontrar lo que buscás
- detectar qué pertenece a qué feature
- entender el alcance de un cambio
- trabajar en equipo sin pisarse

Ese desorden no siempre aparece de golpe.
A veces se instala lentamente y cuando querés ordenar ya hay demasiado ruido.

## La pregunta de fondo

La pregunta arquitectónica real no es solo “en qué carpeta pongo esta clase”.

La pregunta de fondo es:

> ¿cómo quiero que se lea y se entienda el backend cuando alguien lo abra dentro de seis meses?

Esa es una pregunta muy importante.
Porque el proyecto no debería estar organizado solo para que hoy “compile”.
También debería estar organizado para que siga siendo navegable.

## Dos enfoques muy comunes

En Spring Boot, dos estrategias muy comunes son:

- organizar **por capa**
- organizar **por feature** o por dominio funcional

No son las únicas del universo, pero sí dos de las más frecuentes y útiles para razonar.

## Organización por capa

La organización por capa agrupa clases según su rol técnico.

Por ejemplo:

```text
controller/
service/
repository/
entity/
dto/
mapper/
config/
exception/
```

Una estructura así podría verse más o menos así:

```text
src/main/java/com/ejemplo/app
  controller/
    ProductoController.java
    UsuarioController.java
    PedidoController.java
  service/
    ProductoService.java
    UsuarioService.java
    PedidoService.java
  repository/
    ProductoRepository.java
    UsuarioRepository.java
    PedidoRepository.java
  entity/
    Producto.java
    Usuario.java
    Pedido.java
  dto/
    CrearProductoRequest.java
    ProductoResponse.java
    CrearUsuarioRequest.java
    UsuarioResponse.java
  mapper/
    ProductoMapper.java
    UsuarioMapper.java
  exception/
    ProductoNoEncontradoException.java
    UsuarioDuplicadoException.java
```

Esta estructura tiene una lógica bastante clara.

## Qué gana la organización por capa

Tiene varias ventajas, especialmente al empezar:

- es fácil de entender
- se alinea con lo que venís aprendiendo del stack
- deja bastante claro el rol técnico de cada clase
- suele ser cómoda en proyectos chicos o medianos
- para quien recién empieza, suele ser bastante intuitiva

Por eso aparece muchísimo en tutoriales, ejemplos y proyectos iniciales.

## Qué problema puede traer cuando el proyecto crece

Que las carpetas por capa empiezan a llenarse demasiado.

Por ejemplo:

- `controller/` con 20 o 30 clases
- `service/` con muchas clases sin contexto de negocio agrupado
- `dto/` convertido en una selva de requests y responses
- `exception/` mezclando errores de dominios totalmente distintos

Entonces el problema deja de ser “no sé dónde va una clase”.
Pasa a ser:

> sé dónde va técnicamente, pero ya me cuesta entender a qué feature pertenece todo esto.

Es decir, la organización por capa ayuda mucho al principio, pero puede empezar a perder expresividad del dominio cuando el sistema crece bastante.

## Organización por feature

La organización por feature agrupa clases según la funcionalidad o área de negocio a la que pertenecen.

Por ejemplo:

```text
producto/
usuario/
pedido/
categoria/
auth/
```

Y dentro de cada feature, podés tener sus propias subcapas o clases relacionadas.

Una estructura así podría verse por ejemplo así:

```text
src/main/java/com/ejemplo/app
  producto/
    ProductoController.java
    ProductoService.java
    ProductoRepository.java
    Producto.java
    ProductoMapper.java
    CrearProductoRequest.java
    ActualizarProductoRequest.java
    ProductoResponse.java
    ProductoNoEncontradoException.java
    ProductoDuplicadoException.java
  usuario/
    UsuarioController.java
    UsuarioService.java
    UsuarioRepository.java
    Usuario.java
    UsuarioMapper.java
    CrearUsuarioRequest.java
    UsuarioResponse.java
    UsuarioNoEncontradoException.java
  pedido/
    PedidoController.java
    PedidoService.java
    PedidoRepository.java
    Pedido.java
    CrearPedidoRequest.java
    PedidoResponse.java
  common/
    ApiErrorResponse.java
    GlobalExceptionHandler.java
```

Esta estructura cuenta otra historia del proyecto.

## Qué gana la organización por feature

Muchísimo en proyectos más grandes.

Porque ahora, cuando abrís una feature, tenés más reunido:

- controller
- service
- repository
- DTOs
- mapper
- excepciones
- entidad relacionada

Eso hace mucho más fácil entender una funcionalidad como unidad.

Por ejemplo, si querés trabajar en productos, vas a `producto/` y ahí ya encontrás casi todo lo importante de esa parte del sistema.

## Por qué esto suele sentirse más “de negocio”

Porque el árbol de paquetes empieza a reflejar más el dominio del sistema que las capas técnicas aisladas.

Ya no ves primero:

- controller
- service
- repository

Ahora ves primero:

- producto
- usuario
- pedido
- auth
- catalogo
- ordenes

Eso hace que la estructura le “hable” más al negocio.

## Un criterio muy útil

Podés pensar así:

### Organización por capa
Responde mejor a la pregunta:
> ¿qué tipo técnico de clase es esta?

### Organización por feature
Responde mejor a la pregunta:
> ¿a qué parte del sistema pertenece esta clase?

Las dos preguntas son válidas.
La cuestión es cuál te aporta más claridad según el tamaño y la forma del proyecto.

## Un ejemplo concreto de diferencia

Supongamos que querés cambiar todo lo relacionado con productos.

### En organización por capa
Tenés que ir saltando entre:

- `controller/ProductoController`
- `service/ProductoService`
- `repository/ProductoRepository`
- `dto/CrearProductoRequest`
- `dto/ProductoResponse`
- `mapper/ProductoMapper`
- `exception/ProductoNoEncontradoException`

### En organización por feature
Podrías tenerlo casi todo reunido en:

- `producto/...`

Eso reduce muchísimo el costo mental de navegar.

## ¿Entonces la organización por feature es siempre mejor?

No necesariamente.

No conviene caer en recetas rígidas del tipo:

- “por capa está mal”
- “por feature está bien”

La realidad es más matizada.

La organización por capa puede ser excelente cuando:

- el proyecto es chico
- estás aprendiendo
- querés una estructura muy clara al inicio
- el dominio todavía no creció demasiado

La organización por feature empieza a lucirse más cuando:

- el sistema tiene varias áreas de negocio
- hay muchas clases por feature
- querés que el árbol del proyecto hable más del dominio que de la técnica
- ya sentís que las carpetas por capa se volvieron demasiado grandes

## Una estrategia intermedia muy sana

Muchas veces aparece una mezcla saludable entre ambas ideas.

Por ejemplo:

```text
src/main/java/com/ejemplo/app
  common/
    config/
    exception/
    util/
  producto/
    controller/
    service/
    repository/
    dto/
    mapper/
    entity/
  usuario/
    controller/
    service/
    repository/
    dto/
    mapper/
    entity/
  pedido/
    controller/
    service/
    repository/
    dto/
    mapper/
    entity/
```

Acá la organización principal es por feature, pero dentro de cada feature hay subcarpetas por capa.

Esto puede ser una solución muy buena cuando:

- el proyecto ya creció bastante
- no querés controllers gigantes juntos en una sola carpeta global
- tampoco querés meter demasiadas clases distintas mezcladas dentro de una sola carpeta de feature

Es una forma muy razonable de equilibrar ambas miradas.

## Qué suele ir en common, shared o similar

Hay clases que no pertenecen a una única feature concreta.

Por ejemplo:

- `GlobalExceptionHandler`
- `ApiErrorResponse`
- configuración general
- utilidades compartidas
- seguridad común
- helpers técnicos
- clases de infraestructura transversal

Ese tipo de cosas muchas veces viven mejor en algo como:

- `common/`
- `shared/`
- `infra/`
- `config/`

según el estilo del proyecto.

La idea importante es no forzar que todo pertenezca a una feature si en realidad es transversal.

## Un ejemplo razonable de estructura mixta

```text
src/main/java/com/ejemplo/app
  common/
    exception/
      ApiErrorResponse.java
      GlobalExceptionHandler.java
    config/
      SecurityConfig.java
      JacksonConfig.java
  producto/
    controller/
      ProductoController.java
    service/
      ProductoService.java
    repository/
      ProductoRepository.java
    dto/
      CrearProductoRequest.java
      ActualizarProductoRequest.java
      ProductoResponse.java
    mapper/
      ProductoMapper.java
    entity/
      Producto.java
    exception/
      ProductoDuplicadoException.java
      ProductoNoEncontradoException.java
  usuario/
    controller/
      UsuarioController.java
    service/
      UsuarioService.java
    repository/
      UsuarioRepository.java
    dto/
      CrearUsuarioRequest.java
      UsuarioResponse.java
    mapper/
      UsuarioMapper.java
    entity/
      Usuario.java
```

Esta estructura ya se parece bastante a algo que podrías ver en un proyecto real que quiere mantenerse ordenado.

## Qué señales te muestran que la estructura actual ya no está ayudando

Por ejemplo:

- te cuesta encontrar clases de una misma feature
- tenés carpetas globales enormes llenas de archivos heterogéneos
- para tocar una funcionalidad saltás por demasiados lugares
- los DTOs están todos mezclados sin contexto
- las excepciones ya no se entienden por dominio
- los paquetes crecieron de forma accidental más que intencional
- abrir el proyecto no te cuenta una historia clara

Si pasa eso, probablemente sea momento de repensar la organización.

## Qué relación tiene esto con el tamaño del proyecto

Muy fuerte.

Un proyecto pequeño puede vivir bastante bien con organización por capa.

Pero a medida que el proyecto crece y suma features, el costo de no reorganizar suele aumentar.

No se trata de sobrediseñar desde el día uno.
Se trata de detectar cuándo la estructura actual dejó de ayudarte.

## Qué relación tiene esto con el equipo

También muy importante.

Cuando varias personas trabajan sobre el mismo backend, una estructura clara ayuda muchísimo a:

- encontrar código
- repartir trabajo
- revisar PRs
- detectar ownership de features
- no pisarse tanto
- entender más rápido el alcance de un cambio

Una mala estructura no solo molesta técnicamente.
También complica la colaboración.

## Qué relación tiene esto con testing

Muy directa.

Cuando la estructura está bien pensada, también suele ser más fácil ubicar y pensar los tests.

Por ejemplo, en una organización por feature podrías tener tests que sigan esa misma lógica:

- tests de producto cerca del módulo producto
- tests de usuario cerca del módulo usuario
- tests de pedido cerca del módulo pedido

Eso ayuda a que el proyecto se sienta coherente también desde el punto de vista de la verificación.

## Qué pasa con los DTOs cuando el proyecto crece

Los DTOs son uno de los primeros lugares donde el caos suele explotar si no organizás bien.

Porque empezás con:

- `CrearProductoRequest`
- `ProductoResponse`

y después aparecen:

- `ActualizarProductoRequest`
- `ProductoResumenResponse`
- `ProductoDetalleResponse`
- `CambiarStockRequest`
- `ProductoAdminResponse`
- etc.

Si todos viven juntos en una carpeta global `dto/`, a veces eso se vuelve bastante incómodo.

En proyectos más grandes, agrupar DTOs por feature suele ayudar muchísimo.

## Qué pasa con las excepciones

También es un lugar donde el desorden crece rápido.

Por ejemplo:

- `ProductoNoEncontradoException`
- `UsuarioDuplicadoException`
- `PedidoCanceladoException`
- `StockInsuficienteException`
- `CategoriaEnUsoException`

Si todas están mezcladas en una sola carpeta global y el proyecto sigue creciendo, puede costar más entender qué excepción pertenece a qué parte del sistema.

Muchas veces tiene sentido que ciertas excepciones vivan dentro de su feature y otras, más generales, vivan en `common/`.

## Qué pasa con los mappers

Lo mismo.

Al principio puede parecer cómodo tener:

```text
mapper/
  ProductoMapper.java
  UsuarioMapper.java
  PedidoMapper.java
```

Pero si el proyecto ya se entiende mejor por feature, a veces tiene mucho más sentido que el mapper esté junto a los DTOs y la lógica del recurso que transforma.

## Una pregunta muy buena para decidir dónde poner una clase

Podés preguntarte:

> si alguien busca esta clase dentro de seis meses, ¿la va a buscar por su rol técnico o por la feature a la que pertenece?

Por ejemplo:

- `ProductoMapper` probablemente se busque dentro de producto
- `GlobalExceptionHandler` probablemente se busque dentro de algo común o transversal
- `SecurityConfig` probablemente se busque en configuración o seguridad compartida

Esa pregunta suele ordenar mucho.

## Qué relación tiene esto con el dominio

Muchísima.

Cuanto más importante es el dominio de negocio del sistema, más sentido suele tener que la estructura del proyecto lo refleje.

Porque si el árbol de paquetes no refleja de ningún modo el dominio, el proyecto puede volverse demasiado “técnico” en su presentación y poco expresivo del negocio real.

## Qué pasa con módulos muy grandes

A veces una feature crece tanto que ya deja de ser una sola feature simple.

Por ejemplo, “pedido” podría terminar teniendo subáreas como:

- checkout
- pagos
- facturación
- envíos

Ahí puede hacer falta refinar aún más la estructura.

Y eso está bien.
No hay una única estructura eterna.
La organización del proyecto también evoluciona con su complejidad.

## Un buen principio general

La estructura debería ayudarte a responder rápidamente preguntas como:

- ¿dónde vive la lógica de productos?
- ¿dónde están los DTOs de pedidos?
- ¿dónde están las excepciones de auth?
- ¿dónde está la configuración común?
- ¿qué clases forman parte de esta feature?

Si el proyecto responde eso fácilmente, suele ser buena señal.

## Qué no conviene hacer

No conviene dejar que la estructura crezca solo por inercia.

Por ejemplo:

- copiar y pegar paquetes sin criterio
- meter todo en `service/`, `dto/`, `util/`
- crear carpetas porque sí, sin una lógica clara
- reorganizar compulsivamente cada semana
- o no reorganizar nunca aunque ya todo esté incómodo

Las dos puntas pueden ser problemáticas:
el caos total o la hiperobsesión estructural sin necesidad.

## Una estrategia muy sana para aprender

Podés empezar con algo más simple, por ejemplo por capa, si el proyecto todavía es chico.

Y cuando sientas síntomas claros de crecimiento, pasar a algo más orientado por feature.

Lo importante es no pensar la estructura como una cárcel, sino como una herramienta para mantener claridad.

## Un ejemplo comparativo pequeño

### Organización por capa

```text
controller/
service/
repository/
dto/
mapper/
entity/
```

### Organización por feature

```text
producto/
usuario/
pedido/
common/
```

### Organización híbrida

```text
producto/controller/
producto/service/
producto/repository/
producto/dto/
...
```

No hace falta casarte ciegamente con una sola para siempre.
Lo importante es entender qué problema resuelve cada una.

## Qué relación tiene esto con refactorizar

Muy fuerte.

Una estructura bien pensada reduce bastante el costo mental de refactorizar porque:

- encontrás antes lo que toca cambiar
- entendés mejor el alcance
- navegás más fácil
- evitás tocar clases dispersas sin contexto claro

Eso hace que la organización de paquetes sea mucho más que una decisión cosmética.

## Qué relación tiene esto con Clean Architecture o estilos más avanzados

Muy directa.

Más adelante podrías estudiar estilos más sofisticados donde aparecen conceptos como:

- dominio
- aplicación
- infraestructura
- adaptadores
- puertos

Pero incluso antes de entrar ahí, este tema ya te entrena en algo muy importante:

> que la estructura del proyecto transmite una visión de arquitectura.

No es solo dónde cae el archivo.
Es cómo se cuenta el sistema.

## Error común: copiar una estructura “pro” sin entender si resuelve tu problema real

A veces alguien ve un árbol de paquetes enorme y lo copia porque “se ve profesional”.

Pero si el proyecto todavía es chico, eso puede agregar complejidad innecesaria.

La estructura tiene que servirte.
No hace falta sobrediseñarla desde el minuto cero.

## Error común: dejar el proyecto chato demasiado tiempo

El problema opuesto también existe.

A veces el proyecto ya creció mucho y sigue con una organización pensada para cinco clases.

Ahí empieza a costar cada vez más encontrar cosas y mantener claridad.

## Error común: crear carpetas genéricas tipo util, helper, misc para meter cualquier cosa

Esas carpetas suelen convertirse en cajones de sastre peligrosos.

No significa que jamás puedan existir utilidades compartidas.
Pero conviene usar esos nombres con mucho criterio y no como basurero arquitectónico.

## Error común: no distinguir entre cosas transversales y cosas de feature

No todo pertenece a una feature.
Y no todo es transversal.

Hacer bien esa diferencia ayuda muchísimo a que la estructura sea más expresiva.

## Relación con Spring Boot

Spring Boot no te impone una única estructura rígida, y eso es una gran ventaja.

Te da libertad para que el proyecto evolucione hacia una organización más adecuada a su tamaño y a su dominio.

Pero justamente por esa libertad, conviene pensar estas decisiones con intención.
Porque si no, la estructura termina creciendo por accidente.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> organizar un proyecto Spring Boot por capa, por feature o con un enfoque híbrido no es una decisión cosmética, sino una forma de hacer que el backend siga siendo entendible, navegable y mantenible a medida que crece, reflejando mejor ya sea sus responsabilidades técnicas o su dominio de negocio.

## Resumen

- La estructura de paquetes influye muchísimo en legibilidad y mantenibilidad.
- Organizar por capa agrupa por rol técnico.
- Organizar por feature agrupa por funcionalidad o dominio.
- La organización híbrida puede equilibrar ambas visiones.
- A medida que el proyecto crece, conviene revisar si la estructura actual sigue ayudando.
- DTOs, excepciones y mappers suelen ser lugares donde el desorden aparece rápido si no hay criterio.
- Este tema te ayuda a pensar la organización del backend como parte real de la arquitectura.

## Próximo tema

En el próximo tema vas a ver cómo empiezan a cambiar las decisiones de diseño cuando aparece seguridad con Spring Security, y por qué autenticación, autorización y contexto de usuario modifican bastante la forma de pensar controllers, services y endpoints.
