---
title: "Keycloak + Spring Boot desde cero"
description: "Guía práctica para entender qué hace Keycloak y cómo conectarlo con una API Spring Boot paso a paso."
order: 21
module: "'Autenticación'"
level: "intro"
draft: false
---
# Keycloak + Spring Boot desde cero

Guía práctica para entender qué hace Keycloak y cómo conectarlo con una API Spring Boot paso a paso.

---

## 1. Qué vas a lograr con esta guía

Al terminar esta guía vas a tener:

- un servidor **Keycloak** corriendo localmente con Docker
- un **realm** creado
- un **usuario** creado dentro de ese realm
- una API **Spring Boot** protegida con JWT
- un endpoint público y un endpoint privado
- una prueba real con token

La idea es que entiendas no solo **qué copiar**, sino también **por qué cada pieza existe**.

---

## 2. Qué es Keycloak en palabras simples

Keycloak es un **servidor de identidad y acceso**.

Eso significa que se encarga de cosas como:

- login
- usuarios
- contraseñas
- roles
- permisos
- emisión de tokens
- inicio de sesión centralizado

En vez de programar todo eso dentro de tu backend, dejás que Keycloak lo haga por vos.

### Sin Keycloak

Tu aplicación tendría que resolver por su cuenta:

- cómo autenticar usuarios
- cómo guardar contraseñas de forma segura
- cómo emitir tokens
- cómo expiran las sesiones
- cómo manejar roles y permisos

### Con Keycloak

Tu aplicación delega la autenticación a Keycloak.

El flujo mental es este:

1. el usuario inicia sesión
2. Keycloak valida sus credenciales
3. Keycloak emite un token
4. tu backend recibe ese token
5. tu backend valida que el token sea correcto
6. si el token es válido, deja pasar la petición

---

## 3. Qué papel cumple Spring Boot en esta historia

En esta guía Spring Boot va a actuar como **Resource Server**.

Eso quiere decir que:

- **Keycloak** autentica y emite el token
- **Spring Boot** protege endpoints y valida el token

Spring Boot no va a "loguear" usuarios por sí mismo. Va a confiar en los JWT emitidos por Keycloak.

---

## 4. Conceptos mínimos que necesitás entender

### Realm

Un **realm** es como un espacio aislado dentro de Keycloak.

Podés pensarlo como un "mundo" propio con:

- usuarios
- roles
- clientes
- configuraciones de login

Un proyecto puede tener su propio realm.

### User

Es el usuario que va a iniciar sesión.

### Client

Es la aplicación que querés registrar en Keycloak.

Por ejemplo:

- un frontend React
- una API Spring Boot
- una app móvil

### Token

Es el documento que demuestra identidad y permisos.

En esta guía vas a usar **JWT**.

### Role

Es una etiqueta de autorización.

Ejemplos:

- `USER`
- `ADMIN`

---

## 5. Qué necesitás instalar antes

Para seguir esta guía necesitás:

- **Java 21** o una versión compatible con tu proyecto Spring Boot
- **Maven** o **Gradle**
- **Docker**
- un editor como IntelliJ IDEA o VS Code

No necesitás instalar Keycloak manualmente si lo levantás con Docker.

---

## 6. Paso 1: levantar Keycloak con Docker

Abrí una terminal y ejecutá:

```bash
docker run --name keycloak-dev \
  -p 127.0.0.1:8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin1234 \
  quay.io/keycloak/keycloak:26.6.0 start-dev
```

### Qué hace este comando

- crea un contenedor llamado `keycloak-dev`
- expone Keycloak en `http://localhost:8080`
- crea un usuario administrador inicial
- arranca Keycloak en modo desarrollo

### Importante

El modo `start-dev` sirve para **desarrollo y aprendizaje**. No es el modo correcto para producción.

---

## 7. Paso 2: entrar al panel de administración

Abrí en el navegador:

```text
http://localhost:8080
```

Entrá con:

- usuario: `admin`
- contraseña: `admin1234`

Cuando entres, vas a ver la consola de administración de Keycloak.

---

## 8. Paso 3: crear un realm

Dentro del panel:

1. buscá la opción para administrar realms
2. hacé clic en **Create realm**
3. escribí:

```text
myrealm
```

4. guardá

### Qué lográs con esto

Ya no vas a trabajar en el realm `master`, que se usa para administrar Keycloak. Vas a trabajar en tu propio realm.

---

## 9. Paso 4: crear un usuario

Dentro de `myrealm`:

1. andá a **Users**
2. hacé clic en **Create new user**
3. creá un usuario, por ejemplo:

- Username: `gabriel`
- First name: el que quieras
- Last name: el que quieras

Guardá.

Después:

1. entrá al usuario
2. andá a **Credentials**
3. asignale una contraseña
4. desactivá `Temporary` si no querés que cambie la clave en el primer login

Con eso ya tenés un usuario real dentro del realm.

---

## 10. Paso 5: crear el client para tu aplicación

Ahora tenés que registrar tu aplicación en Keycloak.

Dentro de `myrealm`:

1. andá a **Clients**
2. hacé clic en **Create client**
3. configurá:

- Client type: `OpenID Connect`
- Client ID: `spring-api`

4. continuá

### Para esta guía

Como queremos una prueba simple y local, lo más cómodo es usar un cliente que pueda pedir tokens para testear.

Una configuración práctica para laboratorio es:

- **Client authentication**: `ON`
- **Direct Access Grants**: `ON` solo para pruebas locales

> `Direct Access Grants` permite pedir un token con usuario y contraseña directamente desde `curl`. Es útil para laboratorio, pero no es el flujo recomendado para aplicaciones modernas en producción.

Guardá el cliente.

Después buscá el **Client secret**, porque lo vas a usar más adelante.

---

## 11. Paso 6: crear el proyecto Spring Boot

Podés generar un proyecto con Spring Initializr.

### Dependencias mínimas

- **Spring Web**
- **OAuth2 Resource Server**

Con eso alcanza para construir una API REST y validar JWT emitidos por Keycloak.

### `pom.xml` mínimo de ejemplo

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
    </dependency>
</dependencies>
```

---

## 12. Paso 7: configurar Spring Boot para que confíe en Keycloak

Creá o editá `src/main/resources/application.yml`:

```yaml
server:
  port: 8081

spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8080/realms/myrealm
```

### Qué significa `issuer-uri`

Es la dirección del emisor del token.

Cuando Spring ve eso:

- descubre automáticamente la metadata OIDC del realm
- obtiene las claves públicas de Keycloak
- valida la firma del JWT
- valida que el token pertenezca a ese emisor

En otras palabras: con esa sola propiedad, Spring Boot ya sabe **contra qué servidor de identidad confiar**.

---

## 13. Paso 8: crear la configuración de seguridad

Creá una clase como esta:

```java
package com.ejemplo.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/public").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt());

        return http.build();
    }
}
```

### Qué hace esta configuración

- desactiva CSRF para esta API simple
- marca la app como **stateless**
- deja `/public` libre
- exige autenticación para todo lo demás
- indica que la autenticación va a ser con JWT

---

## 14. Paso 9: crear un controlador para probar

```java
package com.ejemplo.demo.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/public")
    public String publicEndpoint() {
        return "endpoint publico";
    }

    @GetMapping("/private")
    public String privateEndpoint() {
        return "endpoint privado";
    }
}
```

Ahora tu API tiene:

- `/public` → libre
- `/private` → protegido

---

## 15. Paso 10: arrancar la aplicación

Ejecutá tu proyecto Spring Boot.

Si todo está bien, debería quedar en:

```text
http://localhost:8081
```

---

## 16. Paso 11: pedir un token a Keycloak

Para probar rápido desde terminal, podés pedir un token con `curl`.

> Este paso usa el grant de password solo como laboratorio. Para aplicaciones reales con interfaz de usuario, el flujo recomendado suele ser Authorization Code Flow.

```bash
curl -X POST "http://localhost:8080/realms/myrealm/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=spring-api" \
  -d "client_secret=TU_CLIENT_SECRET" \
  -d "username=gabriel" \
  -d "password=TU_PASSWORD" \
  -d "grant_type=password"
```

Si todo salió bien, Keycloak responde con un JSON parecido a este:

```json
{
  "access_token": "eyJ...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJ...",
  "token_type": "Bearer"
}
```

El valor que te interesa ahora es `access_token`.

---

## 17. Paso 12: probar los endpoints

### Probar el endpoint público

```bash
curl http://localhost:8081/public
```

Deberías recibir algo como:

```text
endpoint publico
```

### Probar el endpoint privado sin token

```bash
curl http://localhost:8081/private
```

Debería responder con error de autenticación.

### Probar el endpoint privado con token

```bash
curl http://localhost:8081/private \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

Ahora sí debería responder correctamente:

```text
endpoint privado
```

---

## 18. Qué pasó realmente detrás de escena

Cuando llamaste al endpoint protegido:

1. Spring recibió el header `Authorization: Bearer ...`
2. leyó el JWT
3. buscó la configuración del emisor usando `issuer-uri`
4. obtuvo las claves públicas de Keycloak
5. validó la firma del token
6. validó que el token no estuviera vencido
7. dejó pasar la petición

Eso es exactamente el corazón de la integración entre Keycloak y Spring Boot.

---

## 19. Paso siguiente: roles y autorización

Hasta acá solo protegiste endpoints con autenticación.

El siguiente nivel es proteger por **roles**.

Por ejemplo:

- `/user/**` para usuarios comunes
- `/admin/**` solo para administradores

Para eso necesitás:

1. crear roles en Keycloak
2. asignar esos roles a usuarios
3. hacer que Spring los lea del token
4. usar reglas como `hasRole("ADMIN")`

---

## 20. Error común: pensar que Keycloak reemplaza todo Spring Security

No.

Keycloak y Spring Security no compiten.

Se complementan.

- **Keycloak** autentica y emite identidad
- **Spring Security** protege tus endpoints dentro de la aplicación

Keycloak no reemplaza la seguridad de tu backend. Le entrega a tu backend una identidad confiable para que Spring pueda decidir qué hacer.

---

## 21. Error común: querer guardar sesiones propias igual que antes

Cuando trabajás con JWT y Resource Server, normalmente tu backend no necesita mantener una sesión de usuario tradicional en memoria.

La idea es:

- el token viaja en cada request
- el backend lo valida
- el backend responde

Por eso en la configuración usamos:

```java
SessionCreationPolicy.STATELESS
```

---

## 22. Error común: usar Direct Grant como solución final

El uso de usuario + contraseña directo contra el endpoint de token sirve para:

- pruebas locales
- scripts de laboratorio
- entender rápido cómo fluye un token

Pero en una aplicación web real, lo normal es que el usuario sea redirigido al login de Keycloak usando un flujo de navegador, no que tu frontend maneje credenciales de esa forma.

---

## 23. Resumen final

En esta guía hiciste esto:

- levantaste Keycloak con Docker
- creaste un realm
- creaste un usuario
- registraste una aplicación como client
- levantaste una API Spring Boot
- configuraste `issuer-uri`
- protegiste endpoints con JWT
- obtuviste un token
- probaste un endpoint privado

### Idea central que tenés que recordar

**Keycloak autentica. Spring Boot protege recursos. El token conecta ambas partes.**

---

## 24. Qué conviene aprender después de esto

El siguiente orden lógico sería:

1. **roles en Keycloak**
2. **autorización por endpoint en Spring Boot**
3. **flujo con frontend y redirección al login**
4. **refresh tokens**
5. **logout**
6. **integración en microservicios**
7. **despliegue con PostgreSQL y Docker Compose**

---

## 25. Mini mapa mental

```text
Usuario -> Keycloak -> Token JWT -> Spring Boot -> Endpoint protegido
```

---

## 26. Conclusión

Si recién empezás, la forma correcta de mirar Keycloak no es como "otra cosa rara más", sino como una pieza especializada.

Tu backend no tiene por qué convertirse en un gestor completo de identidad.

Con Keycloak delegás:

- autenticación
- usuarios
- roles
- emisión de tokens

Y con Spring Boot hacés lo tuyo:

- lógica de negocio
- endpoints
- validación de permisos
- reglas de acceso

Eso hace que la arquitectura quede más limpia, más estándar y mucho más fácil de escalar.
