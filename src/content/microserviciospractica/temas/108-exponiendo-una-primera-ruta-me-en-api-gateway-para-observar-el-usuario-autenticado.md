---
title: "Exponiendo una primera ruta /me en api-gateway para observar el usuario autenticado"
description: "Primer paso práctico del siguiente subtramo del módulo 10. Creación de una ruta simple en api-gateway para exponer de forma controlada información útil del usuario autenticado a partir del JWT validado."
order: 108
module: "Módulo 10 · Seguridad real con Keycloak"
level: "intermedio"
draft: false
---

# Exponiendo una primera ruta `/me` en `api-gateway` para observar el usuario autenticado

En la clase anterior dejamos algo bastante claro:

- la identidad autenticada puede servir para algo más que abrir o cerrar rutas,
- el gateway ya valida JWT reales,
- y el siguiente paso lógico ya no es seguir trabajando solo sobre autorización, sino empezar a aprovechar de forma controlada el contexto del usuario autenticado.

Ahora toca el paso concreto:

**exponer una primera ruta `/me` en `api-gateway` para observar el usuario autenticado.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creada una primera ruta simple en el gateway que devuelva información útil del usuario autenticado,
- mucho más claro cómo acceder al principal validado por Spring Security,
- visible la relación entre claims del JWT e identidad efectiva dentro del sistema,
- y NovaMarket mejor preparado para usar esa información después en flujos más ricos.

La meta de hoy no es todavía rediseñar la identidad del dominio ni propagar todos los claims a todos los servicios.  
La meta es mucho más concreta: **dar un primer paso observable y controlado para usar la identidad autenticada dentro del sistema**.

---

## Estado de partida

Partimos de un sistema donde ya:

- Keycloak emite JWT reales,
- `api-gateway` los valida,
- existen reglas por roles para algunas rutas,
- y el módulo ya dejó claro que el siguiente paso lógico es aprovechar mejor la identidad autenticada.

Eso significa que el problema ya no es cómo autenticar.  
Ahora la pregunta útil es otra:

- **cómo hacemos visible y usable el usuario autenticado dentro del gateway sin complicar demasiado el sistema**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- crear una ruta simple como `/me`,
- leer el principal autenticado,
- extraer algunos datos útiles del JWT,
- devolverlos en una respuesta controlada,
- y validar que el gateway ya puede exponer identidad autenticada de una forma observable.

---

## Qué problema queremos resolver exactamente

Hasta ahora ya logramos algo importante:

- el gateway puede autenticar y autorizar.

Eso fue un gran salto.

Pero a medida que el bloque madura, aparece otra necesidad muy concreta:

**que la identidad autenticada pueda empezar a verse y reutilizarse explícitamente dentro del sistema.**

Porque ahora conviene hacerse preguntas como:

- ¿cómo sé quién soy una vez que ya estoy autenticado?
- ¿qué username me reconoce el sistema?
- ¿qué roles ve el gateway para este token?
- ¿cómo convierto los claims del JWT en una respuesta útil para depuración, observación o integración futura?

Ese cambio de enfoque es justamente el corazón de esta clase.

---

## Paso 1 · Decidir qué datos conviene devolver

A esta altura del curso, no conviene devolver todo el JWT crudo.

Lo más sano es algo mucho más razonable y controlado, por ejemplo:

- `subject`
- `username`
- `roles`
- quizá `issuer`

No hace falta más para un primer paso útil.

Ese recorte importa muchísimo porque deja visible la identidad sin convertir la ruta en un volcado desordenado del token.

---

## Paso 2 · Crear un DTO simple para la respuesta

Una opción muy razonable puede ser algo como:

```java
package com.novamarket.gateway.api;

import java.util.List;

public record MeResponse(
        String subject,
        String username,
        List<String> roles,
        String issuer
) {
}
```

No hace falta que el DTO sea más complejo en esta etapa.

La idea es que exprese de forma clara y didáctica qué datos útiles del usuario autenticado queremos observar.

---

## Paso 3 · Crear una ruta o handler en el gateway

Como el gateway es WebFlux, una opción muy simple puede ser crear un controller que reciba el `JwtAuthenticationToken`.

Por ejemplo:

```java
package com.novamarket.gateway.api;

import java.util.List;
import java.util.Map;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MeController {

    @GetMapping("/me")
    public MeResponse me(JwtAuthenticationToken authentication) {
        Map<String, Object> realmAccess = authentication.getToken().getClaim("realm_access");

        List<String> roles = List.of();
        if (realmAccess != null && realmAccess.get("roles") instanceof List<?> rawRoles) {
            roles = rawRoles.stream().map(String::valueOf).toList();
        }

        return new MeResponse(
                authentication.getToken().getSubject(),
                authentication.getToken().getClaimAsString("preferred_username"),
                roles,
                authentication.getToken().getIssuer() != null
                        ? authentication.getToken().getIssuer().toString()
                        : null
        );
    }
}
```

No hace falta que esta sea la única forma válida de implementarlo.  
Lo importante es que:

- el gateway ya puede leer el principal autenticado,
- extraer datos útiles,
- y devolverlos de una forma clara.

Ese es uno de los corazones prácticos de toda la clase.

---

## Paso 4 · Proteger la ruta `/me`

Ahora conviene ajustar la `SecurityWebFilterChain` para que `/me` no quede pública.

Por ejemplo, podríamos dejarla simplemente como:

- accesible para cualquier autenticado

Eso puede verse algo así dentro de tus reglas:

```java
.pathMatchers("/me").authenticated()
```

No hace falta todavía pedir `admin` para esta ruta.

La idea es que cualquier usuario con JWT válido pueda consultar su propia identidad reconocida por el sistema.

Ese criterio es muy sano.

---

## Paso 5 · Levantar nuevamente el gateway

Ahora reconstruí y levantá de nuevo `api-gateway`.

La idea es que el sistema ya no solo valide el token y autorice rutas, sino que además pueda hacer visible de una forma controlada la identidad que acaba de autenticar.

Ese es uno de los momentos más importantes de la clase.

---

## Paso 6 · Probar `/me` sin token

Primero hacé una request simple:

```bash
curl -i http://localhost:8080/me
```

Lo esperable es que sin un JWT válido la ruta no sea accesible.

Este paso importa muchísimo porque muestra que `/me` forma parte del bloque de seguridad real y no es un endpoint suelto sin protección.

---

## Paso 7 · Probar `/me` con token de `customer`

Ahora usá el access token de `cliente.demo`:

```bash
curl -i http://localhost:8080/me \
  -H "Authorization: Bearer TU_TOKEN_CUSTOMER"
```

Lo importante es observar que la respuesta ya devuelve algo legible y útil sobre la identidad autenticada:

- quién es,
- qué subject tiene,
- qué roles trae,
- y qué emisor reconoció el gateway.

Ese paso vale muchísimo porque vuelve observable una parte real de la autenticación del sistema.

---

## Paso 8 · Repetir con `admin`

Ahora hacé la misma prueba con el token de `admin.demo`.

La idea es observar que:

- la ruta es la misma,
- pero la identidad devuelta cambia,
- y los roles también cambian según el JWT presentado.

Ese contraste es muy valioso porque deja claro que el endpoint no está “inventando” usuarios, sino leyendo la identidad autenticada real desde el token validado por el gateway.

---

## Paso 9 · Entender qué acabamos de ganar

Este punto importa muchísimo.

Hasta ahora, el gateway ya podía:

- validar JWT,
- y autorizar según roles.

Ahora, en cambio, además puede:

- **hacer visible de forma controlada quién es el usuario autenticado y qué contexto trae**

Ese salto cambia muchísimo la madurez del bloque, porque la identidad ya deja de usarse solo de forma invisible dentro del filtro de seguridad y pasa a ser un contexto observable y útil.

---

## Paso 10 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya resolvió completamente la relación entre identidad y dominio”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene una primera forma controlada de exponer y aprovechar identidad autenticada dentro del gateway.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase expone una primera ruta `/me` en `api-gateway` para observar el usuario autenticado.

Ya no estamos solo validando y autorizando tokens.  
Ahora también estamos haciendo que la identidad autenticada se vuelva visible, legible y utilizable dentro del sistema de una forma controlada y muy concreta.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- propagamos todavía identidad aguas abajo a otros servicios,
- ni conectamos todavía esta identidad con modelos de dominio más profundos.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dar un primer paso real para usar la identidad autenticada como contexto observable dentro del gateway.**

---

## Errores comunes en esta etapa

### 1. Devolver el JWT completo sin criterio
Conviene exponer solo un conjunto pequeño y útil de datos.

### 2. Dejar `/me` pública
La ruta tiene sentido precisamente porque refleja identidad autenticada.

### 3. Confundir esta ruta con una solución final de perfil de usuario
Es un primer paso útil y controlado.

### 4. No probar con usuarios distintos
La comparación entre `customer` y `admin` aporta muchísimo valor.

### 5. No ver el cambio conceptual del paso
Ahora la identidad autenticada ya no vive solo en filtros de seguridad; también es visible y utilizable.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- el gateway ya expone una ruta protegida como `/me`,
- esa ruta refleja la identidad real del JWT validado,
- y NovaMarket ya dio un primer paso serio para aprovechar identidad autenticada dentro del sistema.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- `/me` existe y está protegida,
- la respuesta cambia según el token presentado,
- entendés qué datos conviene exponer y cuáles no,
- y sentís que la identidad autenticada ya dejó de ser solo una condición de acceso para convertirse también en un contexto útil del sistema.

Si eso está bien, ya podemos pasar al siguiente tema y decidir si seguimos profundizando seguridad interna o si abrimos el siguiente gran bloque del roadmap.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta primera capa de aprovechamiento de identidad autenticada antes de decidir si seguimos profundizando seguridad hacia adentro o si pasamos al siguiente gran bloque del roadmap rehecho.

---

## Cierre

En esta clase expusimos una primera ruta `/me` en `api-gateway` para observar el usuario autenticado.

Con eso, NovaMarket deja de limitar la identidad validada a decisiones invisibles de acceso y empieza a convertirla en un contexto legible, controlado y realmente utilizable dentro del comportamiento concreto del sistema.
