---
title: "Cómo acceder al usuario autenticado y usarlo en endpoints como /me y recursos propios"
description: "Entender cómo obtener la identidad del usuario autenticado dentro de Spring Security y por qué ese contexto es clave para construir endpoints como /me, operaciones sobre recursos propios y validaciones de ownership."
order: 62
module: "Seguridad con Spring Security"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo restringir endpoints y acciones por rol con cosas como:

- `USER`
- `ADMIN`
- `MODERATOR`
- reglas como `hasRole(...)`
- rutas que requieren más que simple autenticación

Eso ya te permitió dar un paso muy importante:
entender que no todos los usuarios autenticados pueden hacer lo mismo.

Pero enseguida aparece una necesidad todavía más concreta:

> ¿cómo sabe el backend quién es el usuario autenticado actual?

Porque muchas reglas reales no dependen solo de tener login ni solo de tener cierto rol.

También dependen de la identidad concreta del usuario actual.

Por ejemplo:

- ver **mi** perfil
- editar **mis** datos
- consultar **mis** pedidos
- borrar **mi** publicación
- impedir que un usuario vea recursos de otro
- permitir que un admin vea cualquiera, pero que un user vea solo los propios

Ahí entra una idea central del backend con Spring Security:

**el contexto del usuario autenticado**

Este tema es clave porque marca el paso desde una seguridad basada solo en “rutas protegidas” hacia una seguridad que realmente usa la identidad actual para modelar casos de uso más realistas.

## El problema de saber solo que “hay un usuario autenticado”

Supongamos que ya protegiste esta ruta:

```text
GET /usuarios/me
```

y Spring Security exige autenticación.

Eso ya es bueno.
Pero todavía queda una pregunta fundamental:

> ¿cómo obtiene el controller o el service la identidad concreta del usuario autenticado para saber quién es “me”?

Porque decir “esta ruta requiere login” no alcanza por sí solo para implementar correctamente el caso de uso.

Todavía hace falta acceder a datos como:

- username
- email
- id del usuario
- roles
- principal actual
- información de autenticación asociada a la request

Esa necesidad aparece una y otra vez en apps reales.

## Qué significa “usuario autenticado actual”

Cuando una request entra autenticada, el backend suele tener disponible algún objeto o contexto que representa a la identidad actual.

Podés pensarlo así:

> además de recibir parámetros y body, el backend ahora también puede conocer quién está ejecutando la request.

Eso cambia muchísimo la lógica posible.

Porque ahora ya no solo procesás:

- `GET /pedidos/123`

Ahora procesás algo más parecido a:

- el usuario autenticado X quiere acceder al pedido 123

Y esa diferencia es enorme.

## Qué resuelve esto en la práctica

Permite construir cosas como:

- `/me`
- “mis pedidos”
- “mi carrito”
- “mi perfil”
- “mi cuenta”
- “mis publicaciones”
- “mis productos”, si sos vendedor
- validaciones de ownership
- restricciones por identidad concreta

Este tipo de endpoints y reglas aparece muchísimo en sistemas reales.

## Qué es el principal o principal autenticado

A nivel conceptual, en Spring Security suele existir la noción de **principal**.

No hace falta obsesionarse desde ya con todos los detalles de implementación.
Lo importante es captar la idea:

> el principal representa la identidad autenticada que Spring Security asocia a la request actual.

Ese principal puede contener o permitir acceder a información como:

- username
- email
- id
- roles
- otros datos de identidad

Según cómo esté modelada la autenticación en tu sistema.

## Qué cambia cuando el backend conoce el principal

Muchísimo.

Antes podías hacer cosas como:

- obtener recurso por id
- crear recurso
- listar cosas genéricas

Ahora también podés hacer:

- obtener el perfil del usuario actual
- filtrar datos por usuario actual
- validar que el recurso pertenece al usuario actual
- decidir si mostrar o no cierta información según identidad
- guardar autor o dueño de un recurso automáticamente

Eso hace que el backend se vuelva mucho más expresivo y también mucho más seguro.

## Un ejemplo muy claro: /me

Supongamos este endpoint:

```text
GET /usuarios/me
```

La idea de esta ruta es normalmente:

> devolver los datos del usuario autenticado actual.

Pero para implementarlo bien, el backend tiene que obtener de algún modo esa identidad actual.

Y ahí aparece una gran diferencia con un endpoint como:

```text
GET /usuarios/{id}
```

En `/me`, el cliente no manda el id del usuario objetivo como parámetro.
El sistema lo deduce a partir de la autenticación de la request.

Eso es muy potente.

## Por qué /me suele ser una buena idea

Porque evita que el cliente tenga que manejar o conocer siempre su propio id explícitamente para operaciones centradas en su identidad.

Además, muchas veces:

- es más claro
- reduce errores
- expresa mejor el caso de uso
- evita que el cliente “juegue” con ids ajenos

Es un endpoint muy común y muy natural en APIs con autenticación.

## Un ejemplo conceptual de controller

Una forma común de acceder al usuario autenticado es recibir algo del contexto de seguridad dentro del controller.

Por ejemplo, conceptualmente:

```java
@GetMapping("/me")
public ResponseEntity<UsuarioResponse> miPerfil(Authentication authentication) {
    String username = authentication.getName();
    UsuarioResponse response = usuarioService.obtenerPerfilPorUsername(username);
    return ResponseEntity.ok(response);
}
```

No hace falta que ahora te aprendas todas las variantes posibles.
Lo importante es entender la idea:

- Spring Security puede inyectarte información sobre la identidad actual
- el controller la usa para delegar al service
- el service construye el caso de uso correspondiente

## Cómo leer ese ejemplo

```java
Authentication authentication
```

representa algo así como el objeto de autenticación actual asociado a la request.

Y:

```java
authentication.getName()
```

suele darte una forma básica de identificar al usuario actual, muchas veces como username o equivalente según la configuración.

Podés leer el flujo así:

- entra request autenticada
- Spring Security ya conoce la identidad
- el controller la recibe
- la usa para pedir el perfil correspondiente

## Qué gana el diseño con esto

Muchísimo.

Porque ahora ya no necesitás que el cliente haga algo como:

```text
GET /usuarios/42
```

y espere que el backend interprete que ese 42 coincide con el usuario logueado.

Con `/me`, el backend parte directamente de la identidad autenticada.
Eso suele ser más seguro y más expresivo.

## Otro ejemplo clásico: mis pedidos

Supongamos este endpoint:

```text
GET /pedidos/mis-pedidos
```

Podría implementarse conceptualmente así:

```java
@GetMapping("/mis-pedidos")
public ResponseEntity<List<PedidoResponse>> misPedidos(Authentication authentication) {
    String username = authentication.getName();
    List<PedidoResponse> response = pedidoService.listarPedidosDelUsuario(username);
    return ResponseEntity.ok(response);
}
```

La idea otra vez es muy clara:

- no pedís todos los pedidos del mundo
- no dejás que el cliente te mande arbitrariamente “de qué usuario”
- usás la identidad actual para acotar el caso de uso

Esto es muy típico en APIs seguras.

## Qué relación tiene esto con ownership

Acá aparece una de las ideas más importantes del backend con seguridad real:

**ownership** o pertenencia.

Significa, en este contexto, que un recurso pertenece a un usuario o actor concreto.

Por ejemplo:

- un pedido pertenece a un cliente
- una publicación pertenece a un autor
- una cuenta pertenece a un usuario
- un producto puede pertenecer a un vendedor
- una dirección guardada pertenece a una cuenta

Cuando el backend conoce la identidad actual, puede empezar a validar si el recurso pertenece a ese usuario.

## Un ejemplo típico de ownership

Supongamos:

```text
GET /pedidos/123
```

El problema ya no es solo:

- si el pedido existe

Ahora también es:

- ¿el pedido 123 pertenece al usuario autenticado actual?
- si no le pertenece, ¿hay que bloquearlo?
- si es admin, ¿sí debería poder verlo?

Esto ya muestra cómo la autorización se vuelve más rica que simple autenticación o simple rol.

## Un ejemplo de service con ownership

Podrías tener algo conceptual como:

```java
public PedidoResponse obtenerPedidoDelUsuarioActual(Long pedidoId, String usernameActual) {
    Pedido pedido = pedidoRepository.findById(pedidoId)
            .orElseThrow(() -> new PedidoNoEncontradoException("No existe el pedido " + pedidoId));

    if (!pedido.getUsuario().getUsername().equals(usernameActual)) {
        throw new AccesoDenegadoException("No podés acceder a este pedido");
    }

    return pedidoMapper.toResponse(pedido);
}
```

Más allá de cómo termines refinando luego esta lógica, la idea central es importantísima:

- el backend conoce quién es el usuario actual
- compara esa identidad contra el dueño del recurso
- decide si la operación está permitida

Eso es seguridad real aplicada al caso de uso.

## Por qué esto no se resuelve solo con roles

Porque una regla como:

- `hasRole("USER")`

puede dejar pasar a cualquier usuario autenticado con rol USER.

Pero eso no significa que todos esos usuarios deban ver el mismo pedido o editar la misma cuenta.

Por eso conviene entender algo muy importante:

> roles y ownership son dimensiones distintas de la autorización.

### Roles
Responden:
- ¿qué tipo de actor sos?

### Ownership
Responde:
- ¿este recurso te pertenece a vos?

Las dos pueden convivir y muchas veces hacen falta ambas.

## Un ejemplo muy claro de combinación

Supongamos esta regla:

- un `USER` puede ver solo sus propios pedidos
- un `ADMIN` puede ver cualquier pedido

Eso implica una lógica algo así:

- si es admin → permitido
- si no es admin, verificar ownership
- si no le pertenece → prohibido

Este tipo de regla aparece muchísimo en sistemas reales.

## Otro uso importante: guardar autor o dueño automáticamente

Acceder al usuario autenticado no solo sirve para filtrar lectura.
También sirve mucho en operaciones de creación.

Por ejemplo:

- crear comentario
- crear publicación
- crear pedido
- crear reseña
- crear ticket

En muchos casos, el cliente no debería mandar libremente “quién es el autor”.
Eso debería venir del contexto autenticado.

## Un ejemplo conceptual

Supongamos:

```java
@PostMapping("/comentarios")
public ResponseEntity<ComentarioResponse> crearComentario(
        @RequestBody CrearComentarioRequest request,
        Authentication authentication
) {
    String username = authentication.getName();
    ComentarioResponse response = comentarioService.crearComentario(username, request);
    return ResponseEntity.status(201).body(response);
}
```

Y en el service:

```java
public ComentarioResponse crearComentario(String username, CrearComentarioRequest request) {
    Usuario usuario = usuarioRepository.findByUsername(username)
            .orElseThrow(() -> new UsuarioNoEncontradoException("No existe el usuario autenticado"));

    Comentario comentario = new Comentario();
    comentario.setTexto(request.getTexto());
    comentario.setAutor(usuario);

    Comentario guardado = comentarioRepository.save(comentario);

    return comentarioMapper.toResponse(guardado);
}
```

Esto muestra otra ventaja enorme:
la identidad actual se usa para poblar correctamente el dominio.

## Por qué esto suele ser mejor que confiar en un userId del body

Porque si el cliente pudiera mandar libremente algo como:

```json
{
  "usuarioId": 42,
  "texto": "Hola"
}
```

podría intentar crear recursos “en nombre de otro” si el backend no lo valida bien.

En cambio, usar la identidad autenticada actual suele ser mucho más seguro y coherente.

## Qué cambia en los DTOs

A veces, cuando introducís identidad autenticada, ciertos datos dejan de tener sentido en el request.

Por ejemplo:

- `usuarioId`
- `autorId`
- `clienteId`

Si el caso de uso depende del usuario autenticado actual, muchas veces esos campos deberían dejar de venir del cliente y pasar a resolverse del lado del backend.

Eso es una mejora importante de diseño y de seguridad.

## Un ejemplo útil: actualizar mi perfil

En vez de tener algo como:

```text
PUT /usuarios/{id}
```

para uso del propio usuario, muchas veces tiene sentido tener:

```text
PUT /usuarios/me
```

o algo equivalente.

Y el backend toma la identidad del contexto de seguridad.

Eso evita varios problemas:

- que el cliente intente editar ids ajenos
- que el controller tenga que confiar demasiado en datos externos
- que el flujo sea menos expresivo

## Qué cambia en el diseño de rutas

Muchísimo.

Cuando el usuario autenticado se vuelve una pieza central, empiezan a aparecer rutas o patrones como:

- `/me`
- `/mi-cuenta`
- `/mis-pedidos`
- `/mis-publicaciones`
- `/mi-carrito`

Estas rutas son muy naturales cuando el backend puede trabajar con identidad actual.

Y además hacen que la API cuente mejor la historia del caso de uso.

## Qué cambia en el testing

Otra vez, muchísimo.

Ahora los tests no solo preguntan:

- ¿hay autenticación?
- ¿hay rol suficiente?

También preguntan:

- ¿qué pasa si el recurso pertenece al usuario actual?
- ¿qué pasa si no le pertenece?
- ¿qué pasa si el usuario autenticado es admin?
- ¿qué pasa si la identidad actual y el recurso objetivo no coinciden?

Esto hace que la seguridad se vuelva mucho más rica en las pruebas.

## Un ejemplo mental de matriz de pruebas

Para un endpoint tipo `GET /pedidos/{id}`:

### Caso 1
Pedido existe y pertenece al usuario actual
→ permitido

### Caso 2
Pedido existe pero no pertenece al usuario actual
→ prohibido

### Caso 3
Pedido existe y el usuario actual es admin
→ permitido

### Caso 4
Pedido no existe
→ not found

Esta matriz ya mezcla:

- existencia
- identidad
- rol
- ownership

y muestra por qué la seguridad real es más que una sola capa de filtros.

## Qué relación tiene esto con el service

Muy fuerte.

Porque muchas veces el service es donde mejor se expresa la combinación entre:

- identidad actual
- ownership
- reglas de negocio
- excepciones

Por ejemplo:

- usuario actual quiere modificar un recurso
- si no le pertenece y no es admin, bloquear
- si sí le pertenece, seguir
- si no existe, lanzar not found

Este tipo de lógica suele vivir mejor en la capa de caso de uso que totalmente dispersa por la web.

## Qué relación tiene esto con roles

También sigue siendo muy importante.

Acceder al usuario autenticado no reemplaza los roles.
Los complementa.

Por ejemplo:

- un user usa `/me`
- un admin puede además acceder a `/admin/**`
- un user puede ver solo lo suyo
- un admin puede ver todo
- un moderator puede ver cierta parte

Eso muestra que el contexto de seguridad real suele combinar:

- identidad
- roles
- recurso concreto

## Qué relación tiene esto con Spring Security

Spring Security provee justamente el contexto y la infraestructura para que el backend tenga acceso a la autenticación actual.

Eso evita que tengas que inventar manualmente toda una solución para propagar la identidad por cada request.

En otras palabras:

> no solo protege rutas; también te da acceso a la identidad protegida para construir casos de uso basados en el usuario actual.

## Una aclaración importante

No todo acceso a identidad tiene que resolverse exactamente igual en todos los proyectos.

Dependiendo de cómo autentiques, el principal puede representar distintas cosas:

- username
- email
- objeto de usuario más rico
- claims de token
- etc.

No hace falta resolver toda esa variedad ahora.
Lo importante primero es entender la idea general:

> el backend puede acceder a la identidad autenticada actual y usarla para diseñar casos de uso más seguros y expresivos.

## Qué no conviene hacer

No conviene confiar ciegamente en que el cliente te diga quién es el usuario objetivo cuando el caso de uso debería salir de la autenticación.

Por ejemplo, para “mis datos” o “mis recursos”, suele ser mucho más sano partir del contexto autenticado.

## Otro error común

Pensar que con roles ya alcanza y olvidarse de ownership.

Eso puede dejar huecos muy serios donde cualquier usuario con cierto rol base accede a recursos de otros sin querer.

## Otro error común

Meter toda la lógica de ownership solo en el controller con ifs manuales enormes.

Eso suele ensuciar mucho la capa web.
Muchas veces conviene que la regla viva mejor en el service o en una capa de autorización más cuidada.

## Otro error común

Exponer endpoints demasiado genéricos cuando en realidad el caso de uso es “del usuario actual”.

Por ejemplo, a veces `/me` o `/mis-pedidos` comunica mucho mejor la intención y reduce riesgos de diseño comparado con rutas más ambiguas que aceptan ids arbitrarios.

## Una buena heurística

Podés preguntarte:

- ¿este caso de uso depende del usuario actual?
- ¿el recurso le pertenece al usuario autenticado?
- ¿el cliente debería mandar el userId o el backend debería deducirlo?
- ¿hace falta combinar rol y ownership?
- ¿una ruta tipo `/me` expresaría mejor el caso?

Responder eso aclara muchísimo el diseño.

## Qué relación tiene esto con APIs reales

Muy directa.

Porque en casi cualquier app con cuentas de usuario aparecen cosas como:

- perfil actual
- configuración actual
- recursos propios
- historial propio
- acciones “mías”
- restricciones de acceso a recursos ajenos

Por eso esta parte de Spring Security no es un detalle raro.
Es absolutamente central en backend real.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> acceder al usuario autenticado dentro del backend permite construir endpoints como `/me`, asociar recursos al autor correcto y aplicar reglas de ownership sobre recursos propios, haciendo que la seguridad deje de ser solo protección de rutas y pase a integrarse de verdad con los casos de uso del sistema.

## Resumen

- No alcanza con saber que hay autenticación; muchas veces también importa quién es el usuario actual.
- El principal o contexto autenticado permite acceder a la identidad asociada a la request.
- Eso habilita endpoints como `/me`, `/mis-pedidos` y otras operaciones centradas en recursos propios.
- Roles y ownership son dimensiones distintas y complementarias de la autorización.
- El backend suele ser más seguro cuando deduce la identidad desde la autenticación en lugar de confiar en un `userId` enviado por el cliente.
- Esta idea impacta mucho en controllers, services, DTOs y testing.
- Este tema profundiza la integración entre seguridad e identidad real dentro del diseño del backend.

## Próximo tema

En el próximo tema vas a ver cómo elegir entre sesión, Basic Auth y JWT para autenticar usuarios, porque una vez que entendés cómo usar la identidad actual dentro del backend, aparece naturalmente la pregunta de cómo llega y se mantiene esa identidad en cada request.
