---
title: "Spring Security"
description: "Qué es Spring Security, cómo protege una aplicación Spring Boot y cuáles son sus conceptos más importantes al empezar."
order: 40
module: "Seguridad"
level: "intermedio"
draft: false
---

## Introducción

Hasta ahora ya recorriste una parte muy grande del camino para construir una API backend con Java y Spring Boot:

- controllers
- services
- DTOs
- validaciones
- manejo de errores
- repository
- JPA
- Hibernate
- consultas
- testing

Con todo eso ya podés construir una aplicación bastante seria.

Pero en una aplicación real aparece muy rápido una pregunta clave:

**¿quién puede acceder a qué?**

Por ejemplo:

- ¿cualquiera puede ver todos los endpoints?
- ¿ciertas rutas deberían requerir login?
- ¿solo un admin puede eliminar recursos?
- ¿cómo sabe el backend quién es el usuario?
- ¿cómo se protege una API frente a accesos no autorizados?

Ahí entra Spring Security.

## Qué es Spring Security

Spring Security es el framework de seguridad del ecosistema Spring.

Sirve para manejar cosas como:

- autenticación
- autorización
- protección de endpoints
- login
- manejo de usuarios
- roles y permisos
- integración con sesiones o tokens

Es una de las piezas más importantes del backend profesional con Spring Boot.

## La idea general

Sin seguridad, una API queda abierta por defecto o muy expuesta.

Eso puede permitir cosas peligrosas como:

- leer datos sensibles
- modificar recursos sin permiso
- eliminar información
- acceder a endpoints administrativos
- simular ser otro usuario

Spring Security ayuda a definir reglas claras sobre quién puede hacer qué dentro de la aplicación.

## Dos ideas fundamentales

Al empezar, conviene distinguir muy bien estas dos ideas:

- autenticación
- autorización

## Autenticación

La autenticación responde a esta pregunta:

**¿quién sos?**

Por ejemplo:

- usuario y contraseña
- token JWT
- sesión iniciada
- login exitoso

## Autorización

La autorización responde a esta otra pregunta:

**¿qué tenés permitido hacer?**

Por ejemplo:

- un usuario autenticado puede ver su perfil
- un admin puede eliminar usuarios
- un cliente común no puede acceder al panel administrativo

## Diferencia mental útil

Podés pensarlo así:

- autenticación = identidad
- autorización = permisos

## Qué pasa al agregar Spring Security

Una de las primeras cosas que sorprenden cuando agregás Spring Security a un proyecto Spring Boot es que muchas rutas dejan de estar abiertas libremente.

Eso pasa porque el framework asume una postura más segura por defecto.

O sea:
prefiere proteger antes que dejar todo abierto accidentalmente.

## Dependencia típica

En Maven, Spring Security suele agregarse con algo así:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

## Qué pasa después de agregarla

Una vez agregada, el comportamiento por defecto suele cambiar bastante.

Por ejemplo, muchas rutas pasan a requerir autenticación si no configurás reglas personalizadas.

Eso está bueno porque te obliga a pensar la seguridad explícitamente.

## Seguridad por defecto

Spring Security trae ciertas protecciones por defecto bastante útiles.

No hace falta memorizar todas ya, pero sí entender que el framework intenta proteger la aplicación de base, no dejarla abierta sin criterio.

## Configuración de seguridad

En proyectos modernos de Spring Security se suele definir una configuración explícita usando un bean de tipo `SecurityFilterChain`.

Ejemplo conceptual:

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/public/**").permitAll()
                        .anyRequest().authenticated()
                )
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }
}
```

## Qué está pasando acá

### `@Configuration`

Marca una clase de configuración.

### `SecurityFilterChain`

Define reglas de seguridad para las requests HTTP.

### `requestMatchers("/public/**").permitAll()`

Permite acceso libre a ciertas rutas públicas.

### `anyRequest().authenticated()`

Dice que cualquier otra request requiere autenticación.

### `httpBasic(...)`

Activa autenticación HTTP básica.

## Qué significa `permitAll()`

Significa:
“esta ruta puede ser accedida sin autenticación”.

## Qué significa `authenticated()`

Significa:
“para entrar acá, el usuario debe estar autenticado”.

## Ejemplo mental simple

Supongamos estas rutas:

- `/public/hello`
- `/products`
- `/admin/users`

Con una configuración como la anterior, podría pasar algo así:

- `/public/hello` → acceso libre
- `/products` → requiere autenticación
- `/admin/users` → también requiere autenticación, y quizás más adelante permiso especial

## HTTP Basic

Una forma simple de autenticación para empezar es HTTP Basic.

Con HTTP Basic, el cliente envía credenciales básicas en cada request.

No suele ser la solución ideal para una API moderna en producción, pero es muy útil para entender conceptos al principio.

## Usuario por defecto

Cuando recién agregás Spring Security sin mucha configuración, en algunos escenarios Spring puede generar un usuario por defecto para pruebas locales.

Eso es útil para experimentar, aunque en proyectos reales después vas a querer definir tu propio esquema de usuarios.

## Roles

Una de las piezas más importantes en autorización son los roles.

Por ejemplo:

- `USER`
- `ADMIN`

Un rol representa un nivel o grupo de permisos.

## Ejemplo de reglas por rol

```java
http
    .authorizeHttpRequests(auth -> auth
        .requestMatchers("/public/**").permitAll()
        .requestMatchers("/admin/**").hasRole("ADMIN")
        .anyRequest().authenticated()
    );
```

## Qué expresa esto

- todo lo que esté bajo `/public/**` es público
- todo lo que esté bajo `/admin/**` requiere rol `ADMIN`
- todo lo demás requiere estar autenticado

## `hasRole(...)`

Sirve para restringir acceso a un rol concreto.

Ejemplo:

```java
.requestMatchers("/admin/**").hasRole("ADMIN")
```

## `hasAnyRole(...)`

Permite varios roles posibles.

Ejemplo:

```java
.requestMatchers("/management/**").hasAnyRole("ADMIN", "MANAGER")
```

## Principio de mínimo privilegio

Una idea importante en seguridad es no dar más permisos de los necesarios.

Eso significa que no deberías dejar rutas abiertas o permisos amplios “por comodidad” si no hace falta.

## Usuarios en memoria

Para empezar, muchas veces se configuran usuarios en memoria.

Ejemplo conceptual:

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;

@Configuration
public class UserConfig {

    @Bean
    public InMemoryUserDetailsManager userDetailsService() {
        UserDetails user = User.withUsername("user")
                .password("{noop}1234")
                .roles("USER")
                .build();

        UserDetails admin = User.withUsername("admin")
                .password("{noop}admin123")
                .roles("ADMIN")
                .build();

        return new InMemoryUserDetailsManager(user, admin);
    }
}
```

## Qué muestra este ejemplo

Muestra una forma simple de definir usuarios para pruebas.

- `user` con rol `USER`
- `admin` con rol `ADMIN`

## Qué significa `{noop}`

En este contexto indica que la contraseña no se está codificando.

Eso puede servir para ejemplos didácticos muy iniciales, pero en aplicaciones reales conviene usar un encoder de contraseñas.

## Password encoding

En aplicaciones reales, las contraseñas no deberían guardarse ni compararse en texto plano.

Spring Security trabaja mucho con password encoders, por ejemplo `BCryptPasswordEncoder`.

Esto más adelante se vuelve muy importante cuando hacés autenticación real con base de datos.

## Endpoints públicos y privados

Una API suele tener una mezcla de rutas:

### Públicas

- login
- registro
- documentación pública
- health check, según caso

### Privadas

- perfil del usuario
- carrito
- órdenes
- administración
- endpoints sensibles

Spring Security ayuda a definir claramente esa frontera.

## Ejemplo de API con rutas públicas y privadas

```java
http
    .authorizeHttpRequests(auth -> auth
        .requestMatchers("/auth/login", "/auth/register").permitAll()
        .requestMatchers("/admin/**").hasRole("ADMIN")
        .anyRequest().authenticated()
    );
```

## Qué diseño expresa esto

- login y registro son públicos
- admin requiere rol `ADMIN`
- el resto requiere usuario autenticado

Eso ya representa una estrategia bastante realista.

## Filtros

Spring Security funciona mucho a través de filtros.

No hace falta dominar toda la cadena interna ahora, pero conviene saber que el framework intercepta requests y decide si permitirlas, autenticarlas o rechazarlas antes de que lleguen al controller.

## Por qué esto importa

Porque te ayuda a entender por qué a veces una request ni siquiera entra al controller si la seguridad la rechaza antes.

## Códigos de respuesta comunes en seguridad

Cuando la seguridad bloquea algo, suelen aparecer respuestas como:

- `401 Unauthorized`
- `403 Forbidden`

## `401 Unauthorized`

Suele indicar que falta autenticación o que la credencial no es válida.

## `403 Forbidden`

Suele indicar que el usuario sí está autenticado, pero no tiene permiso suficiente.

## Diferencia útil

- `401` → no estás autenticado correctamente
- `403` → sí estás autenticado, pero no tenés permiso

## Seguridad y controllers

Es importante entender que no conviene resolver toda la seguridad “a mano” dentro de cada controller.

Por ejemplo, esto sería una mala dirección:

```java
@GetMapping("/admin/users")
public String getAdminUsers() {
    // lógica manual rara para decidir si entra o no
    return "ok";
}
```

Lo más sano suele ser dejar que Spring Security proteja rutas y permisos desde una capa central de seguridad.

## Seguridad y service layer

Aunque mucha autorización de acceso a endpoints se configura arriba, a veces también pueden existir validaciones de seguridad o restricciones de negocio dentro de services.

Por ejemplo:

- un usuario solo puede modificar sus propios datos
- una orden solo puede verse si pertenece a quien la consulta
- un admin puede hacer más cosas que un usuario común

Eso muestra que seguridad y negocio a veces se cruzan, aunque no sean lo mismo.

## Autenticación con formularios, sesiones y tokens

Spring Security puede trabajar con distintos enfoques de autenticación.

Por ejemplo:

- form login
- sesiones
- HTTP Basic
- JWT
- OAuth2

No hace falta abarcar todo ahora.

Para esta etapa, lo más importante es entender el modelo general de protección y autenticación.

## JWT

En APIs modernas, especialmente frontends desacoplados y apps móviles, es muy común usar tokens JWT.

Más adelante esto merece una lección propia, porque cambia bastante cómo se maneja la autenticación respecto de sesiones tradicionales.

## CSRF

Otra palabra que aparece bastante en seguridad web es CSRF.

En APIs REST puras, muchas veces la estrategia frente a esto cambia según cómo esté diseñada la autenticación.

No hace falta profundizar todavía, pero conviene saber que Spring Security también toca este tipo de protección.

## Configuración mínima razonable para empezar

Un primer paso muy sano suele ser:

- abrir explícitamente rutas públicas necesarias
- proteger el resto
- empezar con usuarios simples o en memoria
- entender bien autenticación y roles
- recién después avanzar a JWT o base real de usuarios

## Ejemplo completo básico

### Configuración

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public InMemoryUserDetailsManager userDetailsService() {
        UserDetails user = User.withUsername("user")
                .password("{noop}1234")
                .roles("USER")
                .build();

        UserDetails admin = User.withUsername("admin")
                .password("{noop}admin123")
                .roles("ADMIN")
                .build();

        return new InMemoryUserDetailsManager(user, admin);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/public/**").permitAll()
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }
}
```

### Controller de ejemplo

```java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
public class DemoController {

    @GetMapping("/public/hello")
    public String publicHello() {
        return "Ruta pública";
    }

    @GetMapping("/profile")
    public String profile() {
        return "Ruta autenticada";
    }

    @GetMapping("/admin/panel")
    public String adminPanel() {
        return "Ruta solo admin";
    }
}
```

## Qué permite este ejemplo

- `/public/hello` → acceso libre
- `/profile` → requiere usuario autenticado
- `/admin/panel` → requiere rol `ADMIN`

Eso ya muestra bastante bien el corazón de Spring Security al empezar.

## Seguridad y testing

Cuando agregás seguridad, los tests también cambian.

Por ejemplo, ciertos endpoints ya no responderán `200` libremente si no simulás autenticación.

Más adelante esto se vuelve importante al testear controllers protegidos.

## Buenas prácticas iniciales

## 1. Abrir solo lo necesario

No dejar rutas sensibles abiertas por comodidad.

## 2. Diferenciar autenticación de autorización

Son cosas distintas y conviene pensarlas por separado.

## 3. No dejar contraseñas reales en texto plano

Aunque `{noop}` sirva para ejemplos, no es una solución real.

## 4. Centralizar reglas de seguridad

Mucho mejor que dispersarlas manualmente en cada controller.

## 5. Entender primero la base antes de saltar a JWT

Si no entendés bien autenticación y autorización, JWT se vuelve confuso rápido.

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede recordarte a middlewares de autenticación y autorización, pero en Spring Security esto está mucho más integrado al framework, a la cadena de filtros y a la configuración global.

### Si venís de Python

Puede parecerse a sistemas de autenticación y permisos en frameworks web, aunque Spring Security tiene una identidad muy fuerte propia y una integración especialmente profunda con el ecosistema Spring.

## Errores comunes

### 1. Confundir autenticación con autorización

Saber quién es el usuario no alcanza para saber qué puede hacer.

### 2. Abrir endpoints sin pensar la seguridad desde el principio

Después cuesta más ordenar todo.

### 3. Querer ir directo a JWT sin entender lo básico

Eso suele generar mucha confusión.

### 4. No distinguir `401` de `403`

Son respuestas distintas con significados distintos.

### 5. Dejar seguridad mezclada desordenadamente en controllers

Es mejor una estrategia central y coherente.

## Mini ejercicio

Diseñá una seguridad mínima para una API con estas reglas:

1. `/public/**` debe ser público
2. `/admin/**` debe requerir rol `ADMIN`
3. cualquier otra ruta debe requerir autenticación
4. definí dos usuarios en memoria:
   - `user` con rol `USER`
   - `admin` con rol `ADMIN`

Intentá escribir:

- una clase `SecurityConfig`
- y un controller con rutas públicas, privadas y admin

## Ejemplo posible

```java
@Configuration
public class SecurityConfig {

    @Bean
    public InMemoryUserDetailsManager userDetailsService() {
        UserDetails user = User.withUsername("user")
                .password("{noop}1234")
                .roles("USER")
                .build();

        UserDetails admin = User.withUsername("admin")
                .password("{noop}admin123")
                .roles("ADMIN")
                .build();

        return new InMemoryUserDetailsManager(user, admin);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/public/**").permitAll()
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }
}
```

## Resumen

En esta lección viste que:

- Spring Security es el framework de seguridad del ecosistema Spring
- sirve para manejar autenticación, autorización y protección de endpoints
- autenticación responde quién sos
- autorización responde qué podés hacer
- `SecurityFilterChain` permite definir reglas de acceso
- los roles ayudan a restringir rutas sensibles
- Spring Security se integra profundamente con Spring Boot y es una pieza central para proteger APIs reales

## Siguiente tema

En la próxima lección conviene pasar a **JWT**, porque después de entender la base de Spring Security y la protección de endpoints, el siguiente paso natural es aprender uno de los mecanismos más usados para autenticación stateless en APIs modernas.
