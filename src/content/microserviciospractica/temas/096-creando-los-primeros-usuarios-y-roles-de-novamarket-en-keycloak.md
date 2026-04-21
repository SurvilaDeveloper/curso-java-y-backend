---
title: "Creando los primeros usuarios y roles de NovaMarket en Keycloak"
description: "Siguiente paso práctico del módulo 10. Creación de los primeros usuarios y roles dentro del realm de NovaMarket para completar la base mínima de identidad del sistema."
order: 96
module: "Módulo 10 · Seguridad real con Keycloak"
level: "intermedio"
draft: false
---

# Creando los primeros usuarios y roles de NovaMarket en Keycloak

En la clase anterior dimos otro paso muy importante dentro del bloque de Keycloak:

- creamos el `realm` `novamarket`,
- creamos un primer `client` principal para `api-gateway`,
- y con eso la infraestructura de identidad dejó de estar vacía y empezó a modelarse de verdad para el sistema.

Eso ya tiene muchísimo valor.

Pero ahora toca el siguiente paso natural:

**crear los primeros usuarios y roles de NovaMarket dentro de Keycloak.**

Ese es el objetivo de esta clase.

Porque una cosa es tener:

- un `realm`,
- un `client`,
- y una pieza de identidad viva.

Y otra bastante distinta es que esa pieza ya contenga identidades concretas y perfiles de acceso que después vamos a usar de verdad al proteger el sistema.

Ese es exactamente el siguiente problema que conviene resolver ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creados los primeros usuarios de ejemplo dentro del `realm` `novamarket`,
- definidos los primeros roles básicos del sistema,
- mucho más clara la relación entre identidad y autorización,
- y lista la base mínima para pasar después a emisión de tokens e integración con el gateway.

La meta de hoy no es todavía hacer validación JWT en Spring Security.  
La meta es mucho más concreta: **completar el modelo mínimo de identidad de NovaMarket dentro de Keycloak con usuarios reales y roles reales**.

---

## Estado de partida

Partimos de un sistema donde ya:

- Keycloak está levantado dentro del entorno,
- existe un `realm` `novamarket`,
- existe un `client` principal,
- y el módulo ya dejó claro qué lugar ocupan usuarios y roles dentro del modelo.

Eso significa que el problema ya no es conceptual.  
Ahora la pregunta útil es otra:

- **qué usuarios y roles conviene crear primero para que el sistema tenga una base mínima pero realista**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- definir una primera estrategia simple de roles,
- crear un par de usuarios representativos,
- asignar los roles adecuados,
- y dejar a Keycloak con una base mínima suficientemente real como para pasar después a tokens y protección de rutas.

---

## Qué roles conviene crear primero

A esta altura del curso, una base muy razonable suele ser:

- `customer`
- `admin`

¿Por qué?

Porque con esos dos roles ya podemos representar bastante bien dos perfiles iniciales del sistema:

- alguien que usa la plataforma como usuario comprador
- y alguien con privilegios administrativos o de gestión

No hace falta todavía un catálogo enorme de permisos.  
Lo importante es empezar con una estructura pequeña, clara y muy conectada con el negocio real.

---

## Paso 1 · Crear el rol `customer`

Dentro del `realm` `novamarket`, creá un rol llamado:

```txt
customer
```

Este rol representa a un usuario normal de la plataforma.

Es una muy buena primera pieza porque nos permite pensar desde ya que no todo usuario tendrá el mismo nivel de acceso.

Ese matiz nos acerca bastante a autorización real.

---

## Paso 2 · Crear el rol `admin`

Ahora creá un rol llamado:

```txt
admin
```

Este rol representa una identidad con más privilegios.

No hace falta todavía definir cada permiso en detalle.

La meta es mucho más concreta:

- tener ya una distinción fuerte entre perfiles básicos del sistema,
- para que el siguiente bloque pueda empezar a proteger cosas con sentido.

---

## Paso 3 · Entender por qué no conviene arrancar con demasiados roles

Este punto importa muchísimo.

Cuando alguien descubre roles por primera vez, es muy tentador crear muchos.

Pero en esta etapa eso suele ser contraproducente.

¿Por qué?

Porque todavía estamos construyendo la base del bloque y necesitamos algo:

- legible,
- justificable,
- y fácil de usar en la integración posterior.

Por eso, empezar con `customer` y `admin` es una muy buena decisión para NovaMarket.

---

## Qué usuarios conviene crear primero

A esta altura del módulo, una estructura muy razonable suele ser crear al menos:

- un usuario cliente
- un usuario administrador

Por ejemplo:

```txt
cliente.demo
admin.demo
```

Los nombres exactos pueden variar, pero lo importante es que representen perfiles claros del sistema.

Eso ayuda muchísimo a probar después tokens, claims y autorización con ejemplos muy visibles.

---

## Paso 4 · Crear el primer usuario comprador

Creá un usuario como:

```txt
cliente.demo
```

o un equivalente similar.

Asignale una contraseña simple para desarrollo y marcá la credencial de una forma que te permita usarlo cómodamente durante el bloque.

La idea no es perfección final de seguridad de credenciales en esta etapa.  
La idea es poder avanzar con una identidad real de prueba dentro del sistema.

---

## Paso 5 · Crear el primer usuario administrador

Ahora creá un usuario como:

```txt
admin.demo
```

otra vez con una contraseña manejable para el bloque práctico.

Este usuario va a ser especialmente útil más adelante cuando empecemos a distinguir entre accesos públicos, autenticados y administrativos.

---

## Paso 6 · Asignar roles a cada usuario

Ahora hacé la asociación más importante de toda la clase:

- `cliente.demo` → `customer`
- `admin.demo` → `admin`

Y, si querés, podrías incluso asignar también `customer` al administrador según cómo quieras pensar la relación entre perfiles, aunque para esta etapa no es obligatorio.

Lo importante es que la identidad ya empiece a reflejar no solo quién es cada usuario, sino también **qué tipo de acceso representa**.

Ese cambio es central.

---

## Paso 7 · Entender qué acabamos de modelar realmente

Este punto importa muchísimo.

Hasta la clase anterior, Keycloak ya tenía:

- un `realm`
- y un `client`

Ahora, en cambio, además ya tiene:

- roles
- y usuarios concretos asociados a esos roles

Eso significa que la identidad del sistema ya no está solo estructurada.  
Empieza a estar **poblada** con ejemplos reales que después van a hacer posible el resto del bloque.

Ese salto vale muchísimo.

---

## Paso 8 · Entender por qué esta clase prepara el terreno para tokens y autorización

A primera vista, esta clase puede parecer administrativa.

Pero en realidad vale muchísimo porque deja listo algo fundamental:

- identidades concretas
- con perfiles concretos

Y eso es exactamente lo que después necesitamos para:

- emitir tokens,
- leer claims,
- y tomar decisiones reales de acceso dentro del gateway o de los servicios.

Ese valor puente es uno de los más fuertes de toda la clase.

---

## Paso 9 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya tiene seguridad completa”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene una base mínima real de identidad dentro de Keycloak:
  - un `realm`
  - un `client`
  - usuarios
  - y roles

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase crea los primeros usuarios y roles de NovaMarket dentro de Keycloak.

Ya no estamos solo modelando estructura.  
Ahora también estamos llenando esa estructura con identidades reales y perfiles de acceso que van a sostener el resto del bloque.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- emitimos todavía tokens,
- ni validamos todavía claims,
- ni integramos aún el gateway o los servicios con esa identidad real.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dejar completa la base mínima de identidad del sistema dentro de Keycloak.**

---

## Errores comunes en esta etapa

### 1. Crear demasiados roles demasiado pronto
En esta etapa, una base pequeña y clara vale muchísimo más.

### 2. Crear usuarios sin una traducción clara al sistema real
Eso vuelve artificial todo el bloque.

### 3. No asignar roles después de crear usuarios
Entonces la identidad queda incompleta para los siguientes pasos.

### 4. Pensar que esta clase es solo “cargar datos”
En realidad prepara la autorización real del sistema.

### 5. Confundir esta base mínima con integración completa de seguridad
Todavía estamos construyendo la base.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- el `realm` ya tiene roles básicos,
- ya existen usuarios de ejemplo,
- esos usuarios tienen perfiles claros,
- y NovaMarket ya tiene una base mínima real de identidad lista para pasar al siguiente tramo del bloque.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- existen roles como `customer` y `admin`,
- existen usuarios de ejemplo,
- esos usuarios tienen roles asignados,
- y sentís que la identidad del sistema ya dejó de ser estructura vacía para convertirse en una base real sobre la que vamos a trabajar autenticación y autorización.

Si eso está bien, ya podemos pasar al siguiente tema y empezar a emitir y leer tokens de forma controlada.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta base mínima de identidad en Keycloak antes de pasar a la emisión de tokens y a la integración real con el gateway.

---

## Cierre

En esta clase creamos los primeros usuarios y roles de NovaMarket en Keycloak.

Con eso, el proyecto deja de tener solo una infraestructura de identidad vacía o puramente estructural y empieza a sostener una base real de usuarios y perfiles de acceso directamente conectada con las necesidades concretas del sistema.
