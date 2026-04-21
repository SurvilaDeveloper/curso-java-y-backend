---
title: "Obteniendo el primer access token real de NovaMarket desde Keycloak"
description: "Siguiente paso práctico del módulo 10. Obtención del primer access token real desde Keycloak para un usuario de NovaMarket e inspección inicial de su contenido."
order: 98
module: "Módulo 10 · Seguridad real con Keycloak"
level: "intermedio"
draft: false
---

# Obteniendo el primer access token real de NovaMarket desde Keycloak

En la clase anterior dejamos algo bastante claro:

- Keycloak no emite “un solo token genérico”,
- el access token es el que más nos va a importar para proteger NovaMarket,
- y el siguiente paso lógico ya no es seguir agregando estructura administrativa, sino empezar a trabajar con una credencial real emitida por la infraestructura de identidad.

Ahora toca el paso concreto:

**obtener el primer access token real de NovaMarket desde Keycloak.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- obtenido un access token real para uno de los usuarios de ejemplo del sistema,
- mucho más claro cómo se pide ese token a Keycloak,
- visible el formato general de la respuesta,
- y lista una base muy concreta para empezar a leer claims e integrar el gateway después.

La meta de hoy no es todavía proteger rutas con Spring Security.  
La meta es mucho más concreta: **pasar de una identidad modelada en Keycloak a una credencial real emitida por esa infraestructura**.

---

## Estado de partida

Partimos de un sistema donde ya:

- Keycloak está corriendo dentro del entorno,
- existe el `realm` `novamarket`,
- existe al menos un `client` principal,
- y existen usuarios y roles de ejemplo dentro del sistema.

Eso significa que el problema ya no es cómo modelar identidad.  
Ahora la pregunta útil es otra:

- **cómo hacemos para que esa identidad emita una credencial concreta que podamos usar después en el sistema**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir un usuario de ejemplo,
- pedir un access token desde Keycloak,
- leer la respuesta general de autenticación,
- distinguir dónde aparece el token que realmente nos importa,
- y dejar lista la base para inspeccionar su contenido con más criterio.

---

## Qué problema queremos resolver exactamente

Hasta ahora ya logramos algo importante:

- la identidad del sistema existe y está modelada.

Eso fue un gran salto.

Pero si queremos integrar seguridad real, necesitamos algo más:

**que Keycloak deje de ser solo un panel de administración y empiece a emitir credenciales que el sistema pueda usar de verdad.**

Porque ahora conviene pasar de:

- “tengo usuarios cargados”
a
- “ya puedo obtener un token real para una identidad concreta del sistema”

Ese cambio es justamente el corazón de esta clase.

---

## Qué flujo vamos a usar primero

A esta altura del curso, para un primer paso práctico y controlado, una forma muy razonable suele ser usar un flujo directo y simple con usuario de ejemplo.

No hace falta todavía abrir un flujo completo de navegador o login sofisticado.

La meta es algo mucho más concreta:

- pedir el token,
- verlo aparecer,
- y entender la estructura básica de la respuesta.

Ese criterio es muy sano para inaugurar el bloque práctico.

---

## Paso 1 · Elegir el usuario de prueba

Tomemos por ejemplo al usuario:

```txt
cliente.demo
```

o el equivalente que hayas creado en el `realm` `novamarket`.

Conviene empezar por el usuario comprador porque eso deja muy claro que estamos trabajando con una identidad real del sistema y no con una cuenta administrativa de Keycloak.

Ese detalle importa muchísimo.

---

## Paso 2 · Ubicar el endpoint de token del `realm`

En Keycloak, la emisión de tokens ocurre sobre un endpoint del `realm`.

Conceptualmente, algo como:

```txt
http://localhost:8085/realms/novamarket/protocol/openid-connect/token
```

La URL exacta dependerá del puerto con el que expusiste Keycloak, pero la estructura general es esa.

Este punto vale muchísimo porque hace visible que:

- los tokens no aparecen “mágicamente” desde el panel,
- se obtienen a través de un endpoint real del sistema de identidad.

---

## Paso 3 · Pedir el token

Una forma razonable de hacerlo para esta etapa puede ser con `curl`.

Por ejemplo:

```bash
curl -X POST "http://localhost:8085/realms/novamarket/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=api-gateway" \
  -d "username=cliente.demo" \
  -d "password=tu_password" \
  -d "grant_type=password"
```

No estamos diciendo que este vaya a ser el flujo final de toda la aplicación.  
Estamos usando un camino simple y muy didáctico para obtener el primer token real.

Ese matiz es muy importante.

---

## Paso 4 · Leer la respuesta general

Si todo salió bien, Keycloak debería devolverte una respuesta JSON con varias piezas.

Por ejemplo, algo conceptualmente así:

```json
{
  "access_token": "....",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "refresh_token": "....",
  "token_type": "Bearer",
  "id_token": "....",
  "session_state": "....",
  "scope": "..."
}
```

No hace falta todavía analizar cada campo a fondo.

Lo importante ahora es ver algo muy concreto:

- **el token ya existe**
- y viene acompañado por otras piezas del flujo de autenticación.

Ese momento vale muchísimo.

---

## Paso 5 · Identificar el campo que más nos importa

De toda la respuesta, el protagonista principal para el siguiente tramo del curso es:

```json
"access_token"
```

Ese es el token que vamos a querer mirar, inspeccionar y más adelante enviar hacia el gateway o recursos protegidos.

Este paso es central porque conecta directamente la teoría de la clase anterior con una credencial real obtenida desde el sistema.

---

## Paso 6 · Guardar el token para pruebas posteriores

Conviene que copies o guardes el valor del `access_token` en un lugar temporal.

No hace falta todavía un mecanismo sofisticado.

La idea es simplemente poder usarlo en la siguiente clase para:

- inspeccionar claims,
- entender mejor qué contiene,
- y preparar la integración posterior.

Ese detalle operativo ayuda muchísimo.

---

## Paso 7 · Entender qué acabamos de ganar

Este punto importa muchísimo.

Hasta ahora, la identidad del sistema ya estaba modelada y poblada.

Ahora, en cambio, además ya puede hacer algo mucho más fuerte:

- **emitir una credencial real para un usuario real del sistema**

Ese salto cambia muchísimo la madurez del bloque, porque la seguridad deja de ser estructura administrativa y empieza a convertirse en flujo real.

---

## Paso 8 · Entender por qué esta clase es tan importante aunque todavía no usemos el token contra el gateway

A primera vista, puede parecer que todavía falta “lo importante”.

Pero en realidad esta clase ya hace algo enorme:

- convierte al bloque de Keycloak en un flujo operativo real,
- porque el sistema ya no solo existe y está modelado,
- también emite credenciales con las que vamos a poder trabajar de verdad.

Ese valor puente es uno de los más fuertes de toda la clase.

---

## Paso 9 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya integró autenticación completa”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya obtuvo su primer access token real desde Keycloak para una identidad concreta del sistema.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase obtiene el primer access token real de NovaMarket desde Keycloak.

Ya no estamos solo modelando identidad o poblando usuarios y roles.  
Ahora también estamos haciendo que esa identidad emita una credencial concreta y usable, que es exactamente la materia prima con la que vamos a construir el resto del bloque de seguridad.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- inspeccionamos todavía a fondo el contenido del token,
- ni leímos claims concretos,
- ni lo usamos aún contra el gateway.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**obtener el primer access token real del sistema.**

---

## Errores comunes en esta etapa

### 1. Confundir el access token con cualquier otro campo de la respuesta
En este bloque, ese es el protagonista principal.

### 2. Ver la respuesta JSON como una caja negra
Conviene identificar claramente qué pieza cumple cada papel.

### 3. Pensar que pedir un token ya equivale a integrar seguridad completa
Todavía estamos construyendo la base.

### 4. No usar un usuario real del sistema para la prueba
Eso le quita muchísimo valor al paso.

### 5. No guardar el token para el análisis posterior
La continuidad del bloque depende de esa credencial concreta.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- Keycloak emite un access token real para un usuario de NovaMarket,
- sabés cómo pedirlo,
- sabés identificarlo dentro de la respuesta,
- y el bloque ya dejó atrás la pura configuración administrativa para entrar en un flujo real de autenticación.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- pudiste pedir el token,
- identificaste el `access_token`,
- entendés por qué es el token más importante para el siguiente tramo,
- y sentís que la identidad del sistema ya dejó de ser solo estructura para convertirse en una fuente real de credenciales.

Si eso está bien, ya podemos pasar al siguiente tema y empezar a leer con más criterio lo que ese token contiene.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a inspeccionar el contenido del primer access token real de NovaMarket para entender qué claims trae y cómo eso se conecta con usuarios, roles y autorización dentro del sistema.

---

## Cierre

En esta clase obtuvimos el primer access token real de NovaMarket desde Keycloak.

Con eso, el proyecto deja de tener solo usuarios, roles y clients modelados en una consola de administración y empieza a trabajar con credenciales reales, emitidas por su infraestructura de identidad, que después van a sostener de forma concreta la autenticación y autorización del sistema.
