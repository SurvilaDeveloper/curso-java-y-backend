---
title: "Cómo restringir endpoints y acciones por rol con admin, user y permisos similares"
description: "Entender cómo modelar autorización por roles en Spring Security, cómo pensar diferencias entre admin y user y por qué autenticación sola no alcanza cuando distintas identidades pueden hacer acciones distintas dentro del sistema."
order: 61
module: "Seguridad con Spring Security"
level: "intermedio"
draft: false
---

En el tema anterior viste uno de los primeros pasos concretos de seguridad con Spring Security:

- distinguir rutas públicas
- distinguir rutas privadas
- decidir qué endpoints requieren autenticación
- entender por qué `permitAll()` y `authenticated()` ya cambian bastante el mapa de acceso del backend

Eso ya es muchísimo.

Pero muy rápido aparece una necesidad más fina:

> no alcanza con saber si alguien está autenticado; también importa **qué tipo de usuario es** y **qué acciones le corresponden**.

Porque una vez que una aplicación deja de ser totalmente abierta, muchas veces tampoco alcanza con esta lógica binaria:

- anónimo
- autenticado

Ahora aparecen diferencias entre usuarios autenticados.

Por ejemplo:

- un admin puede crear productos
- un user común puede ver el catálogo y comprar
- un moderador puede revisar contenido
- un vendedor puede administrar solo parte de los recursos
- un operador puede ver ciertos paneles internos pero no otros

Ahí entra una capa nueva de autorización:

**los roles** y, más en general, los permisos.

Este tema es clave porque te ayuda a pasar del esquema “público vs autenticado” a un backend que empieza a distinguir realmente qué puede hacer cada identidad dentro del sistema.

## Por qué autenticación sola no alcanza

Supongamos una API con estas rutas:

- `GET /productos`
- `POST /productos`
- `DELETE /productos/{id}`
- `GET /usuarios/me`
- `GET /admin/reportes`
- `PUT /pedidos/{id}/estado`

Si solo aplicás la regla:

- públicas algunas rutas
- el resto autenticadas

todavía queda un problema importante.

Porque con solo estar autenticado, todos los usuarios pasarían al mismo nivel de acceso base.

Y eso casi nunca representa bien el negocio real.

Por ejemplo:

- un cliente autenticado no debería poder entrar al panel admin
- un usuario común no debería poder borrar productos
- un operador de soporte quizá debería ver ciertos pedidos pero no administrar todo
- un admin sí debería tener más capacidades

Entonces autenticación responde:

> ¿quién sos?

Pero todavía falta otra pregunta:

> ¿qué tipo de acceso tenés?

Ahí entran los roles.

## Qué es un rol

Podés pensar un rol como una categoría de permisos amplios asociada a una identidad.

Por ejemplo:

- `USER`
- `ADMIN`
- `MODERATOR`
- `SELLER`
- `SUPPORT`

No es la única forma posible de autorización del universo, pero sí una de las más comunes y prácticas para empezar.

Dicho simple:

> un rol es una forma de agrupar capacidades o niveles de acceso del sistema.

## Por qué los roles ayudan tanto

Porque permiten expresar reglas de acceso bastante claras y legibles.

Por ejemplo:

- solo `ADMIN` puede crear o borrar productos
- `USER` puede consultar sus propios pedidos
- `MODERATOR` puede revisar contenido reportado
- `SELLER` puede administrar su catálogo
- `SUPPORT` puede ver cierta información operativa

Esto ayuda a que la autorización no quede como una serie de condiciones informales desperdigadas por todo el proyecto.

## Un ejemplo muy claro

Supongamos este endpoint:

```text
POST /productos
```

Ya viste que probablemente no debería ser público.
Eso significa que requiere autenticación.

Pero aún falta decidir:

- ¿cualquier usuario autenticado puede crear productos?
- ¿o solo un admin?
- ¿o admin y seller?
- ¿o solo un módulo interno específico?

Esa es exactamente la dimensión que abre la autorización por rol.

## Qué cambia mentalmente cuando aparecen roles

Antes podías pensar:

- ruta pública
- ruta autenticada

Ahora el mapa se enriquece:

- ruta pública
- ruta autenticada para cualquiera
- ruta autenticada solo para ciertos roles
- ruta autenticada para ciertos roles y además ciertas reglas del recurso

Este tema se enfoca especialmente en el tercer caso.

## Un ejemplo muy típico de mapa de acceso

### Público
- `POST /auth/login`
- `POST /auth/register`
- `GET /productos`

### Autenticado general
- `GET /usuarios/me`
- `GET /pedidos/mis-pedidos`
- `POST /pedidos`

### Solo admin
- `POST /productos`
- `DELETE /productos/{id}`
- `GET /admin/reportes`

### Admin o moderator
- `GET /moderacion/reportes`
- `PUT /moderacion/publicaciones/{id}`

Ya se ve que la seguridad va ganando bastante riqueza.

## Cómo se expresa esto en Spring Security

A nivel conceptual, Spring Security permite definir reglas sobre rutas usando no solo:

- `permitAll()`
- `authenticated()`

sino también cosas del estilo:

- `hasRole(...)`
- `hasAnyRole(...)`
- `hasAuthority(...)`
- `hasAnyAuthority(...)`

Todavía no hace falta entrar en cada matiz profundo entre roles y authorities.
Primero conviene fijar bien la intuición más importante:

> además de exigir autenticación, Spring Security puede exigir que la identidad tenga cierto rol para pasar.

## Un ejemplo conceptual con roles

```java
@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/productos", "/categorias").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/productos/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            );

        return http.build();
    }
}
```

Más allá de que después podrás pulir mucho esta configuración, ya hay una idea muy importante acá.

## Cómo leer `hasRole("ADMIN")`

Podés leerlo así:

> para entrar a esta ruta, no alcanza con estar autenticado; además necesitás tener rol ADMIN.

Eso ya cambia muchísimo el tipo de backend que estás construyendo.

## Cómo leer `hasAnyRole(...)`

Por ejemplo:

```java
.requestMatchers("/moderacion/**").hasAnyRole("ADMIN", "MODERATOR")
```

Podés leerlo así:

> esta ruta está permitida si el usuario tiene rol ADMIN o rol MODERATOR.

Eso es muy útil cuando distintas identidades comparten ciertas capacidades.

## Un ejemplo concreto

Supongamos:

```java
.requestMatchers("/productos/**").hasRole("ADMIN")
```

Eso puede querer decir algo como:

- ver catálogo público puede estar abierto en `GET /productos`
- pero crear, editar o borrar productos bajo otras rutas ya requiere admin

Esto es muy común.
No todas las operaciones sobre un mismo recurso tienen el mismo nivel de acceso.

## Qué pasa si un usuario autenticado no tiene el rol correcto

Si la ruta exige autenticación y además cierto rol, pero el usuario autenticado no cumple ese rol, el acceso debería ser rechazado.

Desde el punto de vista HTTP, eso típicamente entra en el territorio de `403 Forbidden`.

Porque ahora el problema ya no es:

- “no sé quién sos”

sino:

- “sé quién sos, pero no tenés permiso suficiente para esto”

Esta distinción es central y aparece muchísimo al introducir roles.

## Un ejemplo mental claro

### Caso 1
Ruta requiere autenticación.
No hay usuario autenticado.
→ rechazo por falta de identidad.

### Caso 2
Ruta requiere rol admin.
Hay usuario autenticado con rol user.
→ rechazo por falta de permisos.

Esta diferencia ordena muchísimo el razonamiento del backend.

## Qué rol suele tener un USER

Depende totalmente del sistema, pero en muchos proyectos `USER` representa el acceso base del usuario común autenticado.

Por ejemplo:

- ver su perfil
- actualizar sus propios datos
- ver sus pedidos
- crear pedidos
- usar funcionalidades normales de cliente

Es decir, `USER` suele expresar la identidad estándar del sistema, no el acceso administrativo.

## Qué rol suele tener un ADMIN

Otra vez, depende del proyecto.
Pero normalmente `ADMIN` representa acceso ampliado a:

- ABM de recursos sensibles
- métricas o reportes internos
- moderación o administración
- gestión de usuarios
- configuración del sistema
- acciones de mantenimiento

No significa “puede hacer cualquier cosa del universo” necesariamente.
Pero sí suele representar un nivel de privilegio más alto.

## Un ejemplo muy común

### USER
- `GET /usuarios/me`
- `PUT /usuarios/me`
- `GET /pedidos/mis-pedidos`
- `POST /pedidos`

### ADMIN
- `POST /productos`
- `PUT /productos/{id}`
- `DELETE /productos/{id}`
- `GET /admin/reportes`
- `GET /admin/usuarios`

Este tipo de separación aparece una y otra vez en aplicaciones reales.

## Qué cambia en el diseño de endpoints

Antes, quizás pensabas solo en si la ruta debía estar abierta o cerrada.

Ahora además aparece la pregunta:

- ¿qué actor del sistema debería usar este endpoint?

Eso a veces hasta afecta el diseño mismo de la API.

Por ejemplo:

- rutas claramente administrativas bajo `/admin/**`
- rutas del propio usuario bajo `/usuarios/me`
- rutas operativas separadas de las públicas
- acciones de moderación agrupadas en un módulo propio

Es decir, la autorización también influye indirectamente en cómo organizás el mapa de rutas.

## Qué relación tiene esto con el dominio

Muchísima.

Porque los roles no salen solo de la técnica.
También expresan decisiones del negocio.

Por ejemplo:

- ¿existe figura de vendedor?
- ¿hay moderadores?
- ¿hay soporte?
- ¿hay backoffice?
- ¿el admin puede editar todo o solo ciertas cosas?
- ¿hay distinción entre editor y publicador?

Eso muestra que seguridad y dominio no están separados.
Se influyen bastante.

## Qué relación tiene esto con ownership

Acá aparece una aclaración importante.

Tener roles no resuelve automáticamente todos los permisos.

Porque a veces el problema no es solo “ser admin o user”, sino “ser dueño del recurso”.

Por ejemplo:

- `USER` puede ver sus propios pedidos
- pero no los de otros usuarios

Eso significa que incluso dentro del mismo rol puede haber límites según ownership.

Entonces conviene entender algo muy importante:

> los roles resuelven una parte de la autorización, pero no necesariamente toda.

Este tema se enfoca en la parte de roles.
Más adelante podés profundizar más en permisos por recurso concreto.

## Qué cambia en el controller

Muchas veces no querés llenar el controller de chequeos manuales del tipo:

- si no es admin, devolver error
- si no es moderator, cortar
- si no es seller, no seguir

Eso ensuciaría muchísimo la capa web.

La gran ventaja de Spring Security es que muchas de estas restricciones pueden declararse antes de entrar al método, dentro de la política de seguridad.

Eso deja el controller más limpio.

## Qué cambia en el service

Aunque mucha autorización de rol puede resolverse a nivel de rutas, el service a veces sigue necesitando decisiones más finas.

Por ejemplo:

- usuario autenticado con rol user
- quiere actualizar un recurso que no es suyo
- el endpoint dejó pasar porque es una ruta autenticada general
- el service debe decidir si ese recurso pertenece a esa identidad o no

O sea:

- roles ayudan mucho
- pero no reemplazan todos los chequeos de caso de uso

Es importante verlos como una capa muy fuerte de protección, no como solución mágica universal.

## Qué relación tiene esto con `hasRole` vs `hasAuthority`

Sin entrar todavía a todo el detalle fino, conviene dejar sembrada esta idea:

- los roles son una forma muy común de expresar permisos amplios
- las authorities pueden representar permisos más finos o más explícitos

Al empezar, pensar en `USER`, `ADMIN` y similares suele ser una muy buena base.

Después podrás sofisticarlo más si el proyecto lo necesita.

## Un ejemplo de política más rica

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/auth/**").permitAll()
    .requestMatchers("/productos", "/categorias").permitAll()
    .requestMatchers("/admin/**").hasRole("ADMIN")
    .requestMatchers("/moderacion/**").hasAnyRole("ADMIN", "MODERATOR")
    .requestMatchers("/pedidos/**").authenticated()
    .anyRequest().authenticated()
)
```

Esta política ya muestra un backend mucho más expresivo en términos de acceso.

## Cómo leer esta política

### Público
- auth
- ciertas lecturas públicas

### Requiere admin
- `/admin/**`

### Requiere admin o moderator
- `/moderacion/**`

### Requiere usuario autenticado
- `/pedidos/**`

Esta lectura ya cuenta una historia bastante clara del sistema.

## Qué relación tiene esto con 403 Forbidden

Muy directa.

Apenas aparecen roles, el `403` empieza a cobrar muchísimo protagonismo.

Porque ahora una situación muy normal es:

- el usuario sí está autenticado
- pero no tiene el rol requerido

Y eso es exactamente un escenario clásico de acceso prohibido.

## Qué cambia en los tests

Muchísimo.

Antes de roles, un test web de seguridad podía preguntar:

- ¿esta ruta privada deja pasar solo si hay autenticación?

Ahora también puede preguntar:

- ¿un user común recibe 403 en una ruta admin?
- ¿un admin sí puede entrar?
- ¿moderator puede usar rutas de moderación?
- ¿user no puede borrar productos?

Es decir, la matriz de pruebas también se vuelve más rica.

## Un ejemplo mental de tests útiles

### Ruta admin
- anónimo → rechazo
- USER → 403
- ADMIN → 200

### Ruta de moderación
- USER → 403
- MODERATOR → 200
- ADMIN → 200

### Ruta autenticada general
- anónimo → rechazo
- USER → permitido
- ADMIN → permitido

Este tipo de matriz ordena muchísimo el testing de seguridad.

## Qué pasa si no pensás bien los roles

Puede pasar que:

- abras de más
- restrinjas de más
- mezcles capacidades de perfiles distintos
- vuelvas confusa la seguridad
- generes lógica inconsistente entre endpoints

Por eso conviene que los roles no se improvisen como etiquetas decorativas.
Deberían reflejar una idea razonable del dominio y del acceso.

## Una buena heurística

Podés preguntarte:

- ¿qué actores reales existen en el sistema?
- ¿qué acciones exclusivas tiene cada uno?
- ¿qué endpoints deberían ser solo administrativos?
- ¿qué rutas deberían ser generales para cualquier autenticado?
- ¿qué operaciones requieren rol y además chequeo de ownership?

Responder esto aclara muchísimo el diseño.

## Un ejemplo práctico sencillo

Imaginá un e-commerce.

### Público
- ver productos
- registrarse
- loguearse

### USER
- comprar
- ver sus pedidos
- editar su perfil

### ADMIN
- crear productos
- modificar stock
- borrar productos
- ver reportes
- gestionar usuarios

Este ejemplo es simple, pero muestra muy bien por qué la autorización por rol es tan natural.

## Qué no conviene pensar

No conviene pensar:

> “si está autenticado, ya está todo resuelto”

No.
Eso resuelve una parte.
Pero en sistemas reales suele hacer falta distinguir mucho mejor los permisos.

## Otro error común

Pensar que todos los roles deben implementarse desde el minuto uno con máxima sofisticación.

No hace falta.

Podés empezar con algo razonable y claro, por ejemplo:

- `USER`
- `ADMIN`

y crecer desde ahí cuando el dominio realmente lo necesite.

Es mejor eso que inventar una taxonomía gigante de roles sin una necesidad real.

## Otro error común

Meter toda la autorización de rol a mano en cada método del controller.

Eso suele generar muchísimo ruido y repetición.

Spring Security te ayuda justamente a declarar mucho de eso de forma más centralizada y coherente.

## Otro error común

Pensar que el frontend resuelve esto mostrando u ocultando botones según el rol.

El frontend puede ayudar a la UX, pero la decisión real de acceso debe seguir estando protegida del lado del backend.

Si el backend no valida roles, el sistema sigue siendo inseguro aunque la interfaz oculte opciones.

## Qué relación tiene esto con diseño del dominio

Muy fuerte.

A veces un rol no es solo un tecnicismo.
Puede reflejar un actor real del negocio.

Por ejemplo:

- cliente
- vendedor
- admin
- soporte
- moderador

Eso hace que seguridad y modelado del negocio se toquen mucho más de lo que parece al principio.

## Qué todavía no estás viendo del todo

Aunque este tema ya te da una base muy importante, todavía no estás entrando a fondo en cosas como:

- anotaciones a nivel de método
- autorización con ownership más fino
- permisos más granulares que roles
- JWT con claims de roles
- authorities específicas
- seguridad por recurso y no solo por ruta

Todo eso puede venir después.

Por ahora, lo importante es consolidar esta idea:

> una vez que distinguís rutas públicas y privadas, el siguiente paso natural es distinguir qué rutas o acciones pertenecen a qué roles.

## Relación con Spring Security

Spring Security hace muy natural expresar esta capa de autorización porque permite que el backend declare políticas bastante legibles como:

- público
- autenticado
- solo admin
- admin o moderator

Eso vuelve mucho más claro el mapa de acceso de la aplicación y evita meter decisiones dispersas o implícitas por todos lados.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> después de distinguir rutas públicas de rutas privadas, la autorización por roles en Spring Security permite expresar que no todos los usuarios autenticados pueden hacer lo mismo, haciendo que el backend modele de forma mucho más realista quién puede ejecutar cada acción sensible del sistema.

## Resumen

- Autenticación sola no alcanza cuando distintos usuarios tienen capacidades distintas.
- Los roles permiten modelar categorías amplias de acceso como USER, ADMIN o MODERATOR.
- Spring Security puede restringir rutas usando reglas como `hasRole(...)` o `hasAnyRole(...)`.
- Esto ayuda a proteger acciones sensibles como administración, moderación o ABM internos.
- Los roles resuelven una parte importante de la autorización, aunque no necesariamente toda.
- El testing también cambia y empieza a verificar escenarios como 403 para roles insuficientes.
- Este tema profundiza la seguridad del backend más allá del simple público vs autenticado.

## Próximo tema

En el próximo tema vas a ver cómo acceder al usuario autenticado dentro del backend y cómo usar ese contexto para construir endpoints como `/me`, operaciones sobre recursos propios y chequeos más finos ligados a la identidad actual.
