---
title: "Creando realm, cliente y usuario de prueba"
description: "Configuración inicial de Keycloak para NovaMarket. Creación del realm, del cliente para el gateway y de un usuario de prueba para empezar a trabajar con autenticación real."
order: 38
module: "Módulo 7 · Seguridad con Keycloak y JWT"
level: "intermedio"
draft: false
---

# Creando realm, cliente y usuario de prueba

En la clase anterior levantamos **Keycloak** y lo dejamos operativo como proveedor de identidad de NovaMarket.

Ahora sí vamos a empezar a configurarlo para que deje de ser solo una pieza de infraestructura levantada y pase a estar alineado con el proyecto real.

El objetivo de esta clase es crear la base mínima de identidad que vamos a necesitar para el resto del bloque:

- un **realm** para NovaMarket,
- un **cliente** que represente al sistema que va a pedir tokens,
- y un **usuario de prueba** con el que podamos hacer login y validar el flujo.

Todavía no vamos a proteger rutas en el gateway.  
Primero necesitamos que Keycloak tenga datos reales con los que trabajar.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creado un realm para NovaMarket,
- creado un cliente que podamos usar en las pruebas del gateway,
- creado un usuario de prueba,
- y validado que Keycloak puede emitir credenciales útiles para el resto del bloque.

---

## Estado de partida

Partimos de este contexto:

- Keycloak ya está levantado,
- la consola de administración es accesible,
- ya podés entrar como administrador,
- pero todavía no existe configuración propia de NovaMarket dentro de Keycloak.

Eso significa que todavía no hay ni realm, ni cliente, ni usuario de prueba específicos del proyecto.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- crear un realm dedicado al proyecto,
- crear un cliente para NovaMarket,
- definir parámetros básicos del cliente,
- crear un usuario de prueba,
- y dejar lista la base para pedir tokens en las próximas clases.

---

## Qué es un realm en este contexto

En Keycloak, un **realm** funciona como un espacio aislado de identidad.

Dentro de ese espacio viven cosas como:

- usuarios,
- clientes,
- roles,
- políticas,
- y configuración de autenticación.

Para el curso práctico conviene crear un realm específico para el proyecto y no mezclar todo dentro del realm maestro.

Eso ayuda bastante a mantener orden y a que el sistema se entienda mejor.

---

## Paso 1 · Crear el realm de NovaMarket

Entrá a la consola de administración de Keycloak y buscá la opción para crear un nuevo realm.

Un nombre razonable para el curso práctico es:

```txt
novamarket
```

La idea es mantener un nombre claro, simple y alineado con el proyecto.

Una vez creado, asegurate de cambiar la vista de administración al realm nuevo y no seguir trabajando dentro del realm maestro.

---

## Paso 2 · Confirmar que estás dentro del realm correcto

Este paso parece obvio, pero es importante.

Después de crear el realm, verificá que:

- la consola muestra `novamarket`,
- y todas las siguientes configuraciones se hagan dentro de ese espacio.

Es muy común seguir accidentalmente en el realm equivocado y terminar creando recursos donde no corresponde.

---

## Paso 3 · Crear el cliente para NovaMarket

Ahora vamos a crear el cliente que usaremos para las pruebas de autenticación.

Para este bloque del curso, una buena idea es representar al gateway o al punto de entrada del sistema con un cliente específico.

Un nombre razonable para ese cliente puede ser:

```txt
novamarket-gateway
```

Eso mantiene bastante clara la intención de uso.

---

## Paso 4 · Configuración inicial recomendada del cliente

Cuando crees el cliente, una configuración inicial razonable para esta etapa podría ser:

- **Client ID**: `novamarket-gateway`
- protocolo estándar del entorno de Keycloak
- cliente habilitado
- acceso con el tipo de flujo que vayas a usar para las pruebas del curso

Para este tramo práctico, conviene optar por una configuración que facilite obtener tokens de manera clara y repetible.

La idea es no entrar todavía en el árbol completo de opciones de Keycloak, sino dejar un cliente funcional para las pruebas inmediatas del curso.

---

## Paso 5 · Definir el tipo de acceso para la etapa del curso

En este punto conviene tomar una decisión didáctica simple.

Para el curso práctico, lo importante es que podamos:

- autenticar un usuario,
- obtener un token,
- y usar ese token para probar el gateway.

Eso significa que el cliente debería quedar configurado de una forma compatible con ese objetivo y con la manera en que planeamos interactuar con el sistema desde afuera.

No hace falta todavía afinar settings avanzados si no aportan valor a esta etapa.

---

## Paso 6 · Revisar y guardar el cliente

Una vez creado el cliente, revisá:

- que el `Client ID` sea el esperado,
- que esté habilitado,
- y que haya quedado dentro del realm `novamarket`.

Guardar y revisar esto ahora evita bastante confusión cuando empecemos a pedir tokens.

---

## Paso 7 · Crear el usuario de prueba

Ahora vamos a crear un usuario de prueba dentro del realm.

Un ejemplo simple y consistente podría ser:

- username: `testuser`

Podés elegir otro nombre, pero conviene que sea claro y fácil de recordar para todo el bloque de seguridad.

La idea es que este usuario represente a un usuario autenticado de NovaMarket durante las pruebas.

---

## Paso 8 · Asignar credenciales al usuario

Después de crear el usuario, definile una contraseña.

Para el curso práctico, conviene usar una convención clara y simple de laboratorio, por ejemplo una contraseña fácil de recordar durante las pruebas.

Lo importante es:

- que el usuario quede habilitado,
- que tenga una contraseña válida,
- y que puedas usarlo para pedir tokens más adelante.

Además, revisá si necesitás dejar marcada alguna opción relacionada con el cambio obligatorio de contraseña en el primer login.  
Para pruebas del curso, generalmente conviene evitar que eso interfiera en el flujo.

---

## Paso 9 · Confirmar que el usuario está habilitado

Ahora verificá que el usuario:

- existe en el realm `novamarket`,
- está habilitado,
- y tiene credenciales asignadas.

Este paso es importante porque, si algo falla más adelante al pedir un token, una de las primeras cosas que hay que revisar es justamente esto.

---

## Paso 10 · Revisar el mapa mínimo que ya tenemos en Keycloak

Al terminar esta clase, dentro del realm `novamarket` deberíamos tener al menos:

- un cliente: `novamarket-gateway`
- un usuario de prueba: `testuser` o el nombre que hayas elegido

Eso ya es suficiente para empezar a construir el flujo de autenticación del curso.

---

## Qué estamos logrando con esta clase

Esta clase convierte a Keycloak en algo mucho más útil para NovaMarket.

Antes teníamos:

- Keycloak levantado,
- pero vacío desde el punto de vista del proyecto.

Después de esta clase tenemos:

- un realm propio,
- un cliente alineado con el sistema,
- y un usuario real de prueba.

Eso significa que la seguridad ya empieza a tener materia prima concreta para trabajar.

---

## Qué todavía no hicimos

Todavía no:

- pedimos tokens,
- configuramos el gateway como Resource Server,
- protegimos endpoints,
- ni propagamos identidad a servicios internos.

Todo eso viene a continuación.

La meta de hoy es mucho más concreta:

**dejar preparado el espacio de identidad de NovaMarket dentro de Keycloak.**

---

## Errores comunes en esta etapa

### 1. Crear el cliente en el realm maestro por error
Conviene revisar bien en qué realm estás trabajando.

### 2. No habilitar correctamente el usuario
Después el login falla y cuesta diagnosticarlo.

### 3. Olvidar asignar la contraseña
Entonces el usuario existe, pero no puede autenticarse.

### 4. Usar nombres inconsistentes
Conviene que el cliente y el realm tengan nombres claros y alineados con el proyecto.

### 5. Querer configurar demasiadas opciones avanzadas de entrada
Para esta etapa, lo mejor es dejar un setup mínimo pero funcional.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, Keycloak debería tener dentro del realm `novamarket`:

- un cliente listo para pruebas del gateway,
- y un usuario de prueba habilitado.

Eso deja preparada la base de identidad real del proyecto.

---

## Punto de control

Antes de seguir, verificá que:

- existe el realm `novamarket`,
- existe el cliente `novamarket-gateway`,
- existe un usuario de prueba,
- el usuario está habilitado,
- y la contraseña quedó configurada.

Si eso está bien, ya podemos pasar a integrar el gateway con Keycloak como Resource Server.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a configurar `api-gateway` como **Resource Server**.

Ese será el primer paso real para que la arquitectura deje de estar abierta y empiece a exigir tokens válidos para ciertas rutas.

---

## Cierre

En esta clase configuramos la base mínima de identidad de NovaMarket dentro de Keycloak.

Con eso, el proveedor de identidad ya dejó de estar vacío y quedó listo para entrar en el flujo real de autenticación que vamos a construir a partir de ahora.
