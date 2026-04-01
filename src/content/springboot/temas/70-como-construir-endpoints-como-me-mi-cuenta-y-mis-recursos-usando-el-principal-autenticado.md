---
title: "Cómo construir endpoints como /me, /mi-cuenta y /mis-recursos usando el principal autenticado"
description: "Entender cómo aprovechar el usuario autenticado actual dentro de Spring Security para construir endpoints centrados en la identidad del cliente, como /me, /mi-cuenta o listados de recursos propios."
order: 70
module: "Seguridad con Spring Security"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo validar el JWT en cada request con un filtro de seguridad y cómo ese filtro termina cargando correctamente la autenticación en el contexto de Spring Security.

Eso completa una parte central del sistema:

- el usuario hace login
- recibe un token
- el cliente lo manda en requests posteriores
- el backend valida el token
- Spring Security reconstruye la autenticación actual

Ahora aparece una pregunta muy natural y muy importante:

> una vez que el backend ya sabe quién es el usuario actual, ¿cómo se usa eso de forma práctica dentro de endpoints reales?

Porque toda esta infraestructura de seguridad no está para quedarse “guardada” en el framework.
Está para habilitar casos de uso reales como:

- ver mi perfil
- editar mi cuenta
- listar mis pedidos
- listar mis publicaciones
- crear recursos asociados automáticamente al usuario actual
- impedir que un usuario manipule recursos ajenos

Ahí aparecen endpoints como:

- `/me`
- `/mi-cuenta`
- `/mis-pedidos`
- `/mis-recursos`

Este tema es clave porque muestra cómo usar de verdad el principal autenticado para construir una API más segura, más expresiva y más alineada con la identidad real del usuario.

## El problema de depender siempre de ids enviados por el cliente

Supongamos que tenés un sistema con usuarios autenticados y recursos propios.

Sin usar bien el principal actual, podrías terminar diseñando cosas como:

- `GET /usuarios/{id}`
- `GET /pedidos?usuarioId=42`
- `POST /comentarios` con un body que trae `autorId`
- `PUT /usuarios/{id}` para que el propio usuario edite su cuenta

Todo eso puede funcionar técnicamente.
Pero en cuanto aparece seguridad real, estas formas empiezan a tener problemas:

- el cliente podría intentar usar ids ajenos
- el backend tiene que confiar demasiado en información que viene del request
- el caso de uso se vuelve menos expresivo
- ownership y seguridad quedan más frágiles
- el diseño del endpoint cuenta peor la historia real

Por eso, cuando el backend ya conoce la identidad autenticada actual, muchas veces conviene apoyarse en ella directamente.

## Qué significa “usar el principal autenticado”

Significa, en pocas palabras:

> usar la identidad actual que Spring Security ya reconstruyó para esta request, en lugar de pedirle al cliente que te diga manualmente quién es.

Esto es muy poderoso.

Porque hace posible cosas como:

- devolver el perfil del usuario actual sin pedir id
- listar solo sus recursos
- crear recursos asociados automáticamente a él
- editar su cuenta sin exponer el id en la ruta
- validar ownership con mucha más claridad

## Un ejemplo muy intuitivo: /me

Supongamos esta ruta:

```text
GET /usuarios/me
```

La idea de esta ruta es:

> devolveme los datos del usuario autenticado actual.

Este endpoint es muy común y muy valioso porque expresa un caso de uso real del cliente sin obligarlo a manejar su id explícitamente.

Es distinto de esto:

```text
GET /usuarios/{id}
```

porque en `/me` el backend no depende de un id arbitrario enviado por el cliente.
Depende de la autenticación actual.

Eso suele ser más seguro y más claro.

## Por qué /me suele ser mejor para el propio usuario

Porque evita varios problemas:

- el cliente no necesita conocer o enviar su propio id
- no puede “jugar” tan fácilmente con ids ajenos
- el endpoint comunica mejor la intención
- el backend usa la identidad real ya verificada
- el diseño del caso de uso queda mucho más expresivo

Esto es una gran mejora de contrato.

## Un primer ejemplo conceptual

Supongamos un controller así:

```java
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponse> me(Authentication authentication) {
        String username = authentication.getName();
        UsuarioResponse response = usuarioService.obtenerPerfilActual(username);
        return ResponseEntity.ok(response);
    }
}
```

Este ejemplo ya muestra muy bien el espíritu del tema.

## Cómo leer este ejemplo

Podés leerlo así:

- la request ya llega autenticada
- Spring Security ya conoce la identidad actual
- el controller recibe el objeto `Authentication`
- extrae el username
- delega al service
- devuelve el perfil correspondiente

Fijate lo importante que es esto:
el controller no necesita que el cliente mande un id propio en la ruta.

## Qué papel cumple Authentication acá

`Authentication` representa el contexto de autenticación actual asociado a la request.

No hace falta obsesionarse con cada detalle interno ahora mismo.
Lo importante es captar esto:

> es una forma de acceder a la identidad autenticada actual dentro del flujo del backend.

Y un uso muy común al empezar es:

```java
authentication.getName()
```

que suele devolver el username o la identidad principal equivalente según cómo esté configurado el sistema.

## Qué relación tiene esto con el filtro JWT

Muy directa.

En el tema anterior viste que el filtro JWT carga la autenticación en `SecurityContextHolder`.

Eso significa que cuando el controller recibe algo como `Authentication authentication`, ese objeto existe justamente porque antes:

- el token fue leído
- el token fue validado
- se cargó el usuario actual
- el contexto quedó poblado

O sea, este tema es el uso práctico del trabajo que hizo el filtro.

## Un service razonable para /me

Podrías tener algo así:

```java
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;

    public UsuarioService(UsuarioRepository usuarioRepository, UsuarioMapper usuarioMapper) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioMapper = usuarioMapper;
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtenerPerfilActual(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsuarioNoEncontradoException("No existe el usuario autenticado"));

        return usuarioMapper.toResponse(usuario);
    }
}
```

Este flujo ya queda muy claro:

- el controller obtiene la identidad actual
- el service carga al usuario correspondiente
- se mapea a response
- se devuelve el perfil

## Por qué este diseño es mejor que GET /usuarios/{id} para el perfil propio

Porque expresa una diferencia muy importante entre dos casos de uso:

### Caso 1
“Quiero ver mi propio perfil”
→ `/me`

### Caso 2
“Quiero ver el perfil de un usuario concreto por id”
→ `/usuarios/{id}`

Esos dos casos de uso no son exactamente lo mismo.
Y el diseño de la API gana mucho cuando esa diferencia se expresa de forma clara.

## Otro ejemplo muy común: /mi-cuenta

A veces, en vez de `/me`, el proyecto usa algo como:

```text
GET /mi-cuenta
PUT /mi-cuenta
```

o variantes similares.

No es una cuestión de religión de naming.
Lo importante es la idea:

> el endpoint está centrado en el usuario actual y no en un id arbitrario enviado por el cliente.

El patrón es lo importante, más que el nombre exacto.

## Un ejemplo de actualización de cuenta propia

Por ejemplo:

```java
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PutMapping("/me")
    public ResponseEntity<UsuarioResponse> actualizarMiCuenta(
            @Valid @RequestBody ActualizarUsuarioRequest request,
            Authentication authentication
    ) {
        String username = authentication.getName();
        UsuarioResponse response = usuarioService.actualizarCuentaActual(username, request);
        return ResponseEntity.ok(response);
    }
}
```

Otra vez, la idea es fuertísima:
el backend no depende del id que el cliente mande sobre sí mismo.
Usa la identidad actual ya autenticada.

## Qué gana la seguridad con esto

Muchísimo.

Porque si el backend depende menos de ids del cliente para casos de uso del propio usuario, reduce varios riesgos y simplifica varias validaciones.

No significa que desaparezcan todos los problemas del mundo.
Pero sí mejora bastante el diseño y la seguridad.

## Un ejemplo del service para actualizar cuenta actual

```java
@Transactional
public UsuarioResponse actualizarCuentaActual(String username, ActualizarUsuarioRequest request) {
    Usuario usuario = usuarioRepository.findByUsername(username)
            .orElseThrow(() -> new UsuarioNoEncontradoException("No existe el usuario autenticado"));

    usuario.setEmail(request.getEmail());

    Usuario actualizado = usuarioRepository.save(usuario);

    return usuarioMapper.toResponse(actualizado);
}
```

Este flujo es muchísimo más directo para el caso de uso “actualizar mi cuenta” que pedirle al cliente un id arbitrario.

## Qué pasa con /mis-recursos

Acá el patrón se vuelve todavía más poderoso.

Supongamos recursos que pertenecen al usuario, por ejemplo:

- pedidos
- comentarios
- publicaciones
- tickets
- favoritos
- productos de vendedor
- direcciones guardadas

Entonces puede tener mucho sentido usar rutas como:

- `/mis-pedidos`
- `/mis-publicaciones`
- `/mis-direcciones`
- `/mis-productos`

o agrupaciones equivalentes.

La idea general es la misma:

> filtrar y operar sobre recursos propios a partir de la identidad actual.

## Un ejemplo clásico: mis pedidos

```java
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @GetMapping("/mis-pedidos")
    public ResponseEntity<List<PedidoResponse>> misPedidos(Authentication authentication) {
        String username = authentication.getName();
        List<PedidoResponse> response = pedidoService.listarPedidosDelUsuarioActual(username);
        return ResponseEntity.ok(response);
    }
}
```

Este patrón aparece muchísimo en sistemas reales y es muy natural cuando el backend trabaja correctamente con el principal autenticado.

## Un service razonable para mis pedidos

```java
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final PedidoMapper pedidoMapper;

    public PedidoService(PedidoRepository pedidoRepository, PedidoMapper pedidoMapper) {
        this.pedidoRepository = pedidoRepository;
        this.pedidoMapper = pedidoMapper;
    }

    @Transactional(readOnly = true)
    public List<PedidoResponse> listarPedidosDelUsuarioActual(String username) {
        List<Pedido> pedidos = pedidoRepository.findByUsuarioUsername(username);

        return pedidos.stream()
                .map(pedidoMapper::toResponse)
                .toList();
    }
}
```

Esto muestra muy bien cómo se conecta:

- principal actual
- repository
- filtro por ownership
- response

## Por qué esto es mejor que GET /pedidos?usuarioId=...

Porque de nuevo, en el caso de uso “mis pedidos”, el backend ya sabe quién sos.

No necesita que el cliente le diga manualmente el `usuarioId`.
Y cuanto menos dependa de eso, más claro y más seguro suele quedar el contrato.

## Qué pasa con creación de recursos propios

Otra aplicación muy importante del principal autenticado es la creación.

Por ejemplo:

- crear comentario
- crear reseña
- crear ticket
- crear publicación
- crear pedido
- crear dirección

En esos casos, muchas veces el cliente no debería mandar `usuarioId` o `autorId` libremente.
El backend debería deducirlo del contexto autenticado.

## Un ejemplo concreto: crear comentario

```java
@PostMapping("/comentarios")
public ResponseEntity<ComentarioResponse> crearComentario(
        @Valid @RequestBody CrearComentarioRequest request,
        Authentication authentication
) {
    String username = authentication.getName();
    ComentarioResponse response = comentarioService.crearComentario(request, username);
    return ResponseEntity.status(201).body(response);
}
```

Y el service:

```java
@Transactional
public ComentarioResponse crearComentario(CrearComentarioRequest request, String username) {
    Usuario usuario = usuarioRepository.findByUsername(username)
            .orElseThrow(() -> new UsuarioNoEncontradoException("No existe el usuario autenticado"));

    Comentario comentario = new Comentario();
    comentario.setTexto(request.getTexto());
    comentario.setAutor(usuario);

    Comentario guardado = comentarioRepository.save(comentario);

    return comentarioMapper.toResponse(guardado);
}
```

Esto es muy fuerte porque:

- el cliente no elige arbitrariamente el autor
- el backend asocia el recurso a la identidad real
- el ownership nace bien desde el principio

## Qué relación tiene esto con ownership

Total.

Los endpoints centrados en el principal autenticado son una de las formas más naturales de expresar ownership.

Por ejemplo:

- “mis pedidos”
- “mi cuenta”
- “mis comentarios”
- “mis publicaciones”

Todo eso se apoya en la idea de que el backend sabe quién sos y puede asociar recursos o filtrarlos en consecuencia.

## Qué pasa cuando no alcanza con /me y además existe acceso admin

También aparece un caso interesante.

A veces tenés dos niveles de uso:

### Usuario común
- `/me`
- `/mis-pedidos`

### Admin
- `/usuarios/{id}`
- `/pedidos/{id}` de cualquiera

Y eso está perfecto.
No son endpoints equivalentes.
Responden a casos de uso distintos.

El backend puede convivir con:

- rutas centradas en el propio usuario
- rutas administrativas para acceso ampliado

Eso es muy común y muy sano.

## Un ejemplo claro de convivencia

Podrías tener:

### Para usuario actual
- `GET /usuarios/me`
- `PUT /usuarios/me`

### Para admin
- `GET /usuarios/{id}`
- `PUT /usuarios/{id}`

Este diseño expresa muy bien dos realidades distintas del sistema.

## Qué pasa con Authentication vs Principal vs UserDetails

Al empezar, muchas veces alcanza con trabajar con `Authentication` y `getName()`.

Más adelante podrías usar enfoques más ricos para acceder al principal completo, al `UserDetails` específico o a una clase personalizada del usuario autenticado.

No hace falta entrar ahora en todas las variantes.
Lo importante es entender la idea base:

> Spring Security puede darte acceso a la identidad actual dentro del endpoint y eso habilita casos de uso mucho más ricos.

Primero conviene fijar eso.

## Qué relación tiene esto con DTOs

Muy fuerte.

Cuando empezás a usar el principal autenticado, muchas veces ciertos campos dejan de tener sentido en los DTOs de entrada.

Por ejemplo, en un request de crear comentario o crear ticket, quizá ya no deberías aceptar:

- `usuarioId`
- `autorId`
- `clienteId`

porque eso no debería venir del cliente si el caso depende del usuario autenticado actual.

Entonces seguridad también influye en el shape de los requests.

## Qué relación tiene esto con testing

Muchísima.

Ahora los tests pueden empezar a preguntar cosas como:

- ¿`GET /usuarios/me` devuelve el perfil del autenticado?
- ¿`GET /mis-pedidos` filtra correctamente por el usuario actual?
- ¿al crear comentario se usa el autor autenticado y no uno mandado por el cliente?
- ¿si el usuario no está autenticado, la ruta se rechaza?
- ¿si está autenticado, el principal se usa correctamente?

Esto muestra otra vez que seguridad y testing se mezclan cada vez más a medida que el backend madura.

## Un ejemplo mental de ventajas del patrón /me

### Sin /me
- el cliente debe saber su id
- el backend depende de un parámetro más manipulable
- el caso de uso se cuenta peor

### Con /me
- el backend usa identidad ya validada
- el contrato es más expresivo
- el diseño se alinea mejor con la autenticación actual

Eso resume muy bien por qué este patrón es tan común.

## Qué no conviene hacer

No conviene seguir diseñando todos los casos de uso del usuario actual como si no existiera el principal autenticado.

Por ejemplo, pedir siempre ids explícitos para acciones que claramente son “mías” suele generar diseños más débiles y menos expresivos.

## Otro error común

Permitir que el cliente mande libremente ids de autor o usuario en requests que deberían inferirse del contexto autenticado.

Eso puede abrir huecos de seguridad o al menos complicar mucho el backend innecesariamente.

## Otro error común

Meter toda la lógica de ownership solo en el controller.

El controller puede obtener la identidad actual, sí.
Pero muchas veces la lógica real de permiso sobre el recurso vive mejor en el service o en una capa más propia del caso de uso.

No conviene convertir el controller en una selva de chequeos manuales.

## Otro error común

Pensar que `/me` reemplaza todos los endpoints por id.

No.
Lo que hace es convivir con ellos para cubrir mejor los casos de uso del usuario actual.

Admin, soporte o flujos internos pueden seguir necesitando rutas por id.
Y eso está bien.

## Una buena heurística

Podés preguntarte:

- ¿este caso de uso es del usuario actual?
- ¿el cliente realmente debería mandar un userId acá?
- ¿hay un patrón tipo `/me` o `/mis-recursos` que exprese mejor la intención?
- ¿el ownership del recurso puede resolverse mejor con la identidad actual?
- ¿estoy aprovechando bien el contexto de seguridad que ya construyó Spring Security?

Responder eso ordena muchísimo el diseño.

## Qué relación tiene esto con una API real

Muy directa.

Porque casi cualquier sistema con autenticación real termina necesitando:

- perfil actual
- configuración actual
- recursos propios
- listados propios
- creación de recursos asociados al autor correcto

Entonces este tema no es accesorio.
Es una de las aplicaciones más prácticas e inmediatas del contexto de seguridad.

## Relación con Spring Security

Spring Security hace posible esto porque ya dejó cargada la autenticación actual dentro del flujo de la request.

Eso permite que el backend deje de operar solo con parámetros externos y empiece a operar también con identidad validada.

Y esa es una de las razones más fuertes por las que vale tanto la pena integrarlo bien.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> construir endpoints como `/me`, `/mi-cuenta` o `/mis-recursos` usando el principal autenticado permite que el backend aproveche la identidad ya validada por Spring Security para diseñar contratos más seguros, más expresivos y mejor alineados con ownership y recursos propios.

## Resumen

- El principal autenticado permite construir endpoints centrados en el usuario actual.
- Patrones como `/me` o `/mis-recursos` suelen ser más claros y seguros que depender siempre de ids enviados por el cliente.
- También son muy útiles para asociar automáticamente recursos al autor correcto.
- Seguridad, ownership y diseño de API se conectan fuertemente en este punto.
- Esto no reemplaza todos los endpoints por id; los complementa según el caso de uso.
- El contexto cargado por el filtro JWT es la base que hace posible este diseño.
- Este tema muestra uno de los usos más prácticos y potentes de Spring Security en una API real.

## Próximo tema

En el próximo tema vas a ver cómo manejar logout, expiración y refresh de tokens a nivel conceptual y práctico, porque una vez que el sistema ya autentica y reconoce al usuario actual, aparece naturalmente la pregunta de cómo se renueva o termina esa autenticación en el tiempo.
