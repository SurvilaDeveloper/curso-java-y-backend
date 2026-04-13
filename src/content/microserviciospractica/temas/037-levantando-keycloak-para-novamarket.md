---
title: "Levantando Keycloak para NovaMarket"
description: "Inicio del bloque de seguridad en NovaMarket. Puesta en marcha de Keycloak como proveedor de identidad para comenzar a proteger el acceso al sistema."
order: 37
module: "Módulo 7 · Seguridad con Keycloak y JWT"
level: "intermedio"
draft: false
---

# Levantando Keycloak para NovaMarket

Hasta este punto, NovaMarket ya tiene una arquitectura bastante rica:

- servicios de negocio,
- persistencia real,
- configuración centralizada,
- discovery con Eureka,
- integración profesional con Feign,
- y un `api-gateway` funcionando como punto de entrada.

Pero todavía hay una ausencia muy importante:

**no hay seguridad real de acceso.**

Hoy cualquier cliente que conozca los endpoints puede entrar al sistema sin autenticarse.  
Eso puede servir para desarrollo temprano, pero ya llegó el momento de empezar a proteger la arquitectura.

La pieza que vamos a usar para eso es:

**Keycloak**

En esta clase vamos a levantarlo y dejarlo listo como proveedor de identidad para el resto del bloque de seguridad.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- Keycloak levantado y accesible,
- disponible como componente externo del entorno de NovaMarket,
- y listo para que en las próximas clases creemos realm, cliente y usuario de prueba.

Todavía no vamos a conectar el gateway ni proteger rutas.  
Primero necesitamos que el proveedor de identidad esté arriba y operativo.

---

## Estado de partida

Partimos de un sistema que ya tiene:

- `config-server`
- `discovery-server`
- `catalog-service`
- `inventory-service`
- `order-service`
- `api-gateway`

Y además el acceso al sistema ya está centralizado por el gateway.

Eso es muy bueno, porque hace que el siguiente paso tenga bastante sentido:  
si vamos a agregar seguridad, el punto natural donde empezar a concentrarla es el punto de entrada.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- decidir una forma práctica de levantar Keycloak,
- integrarlo como parte del entorno local,
- dejar una estructura mínima para su uso en el proyecto,
- y verificar que la consola administrativa quede accesible.

---

## Qué problema resuelve Keycloak

Keycloak nos permite externalizar la identidad del sistema.

En vez de inventar desde cero un mecanismo propio de login, tokens y control de acceso, vamos a apoyarnos en una herramienta especializada que puede encargarse de:

- autenticación,
- emisión de tokens,
- gestión de usuarios,
- clientes,
- realm,
- y más adelante roles o claims.

Para el curso práctico, esto tiene mucho valor porque nos deja una base mucho más realista de seguridad distribuida.

---

## Cómo conviene levantar Keycloak en este curso

Para esta etapa del proyecto, una opción muy razonable es levantarlo como contenedor.

¿Por qué?

Porque:

- es fácil de repetir,
- encaja muy bien con el tipo de infraestructura que ya venimos montando,
- y se va a integrar naturalmente con el bloque de Docker más adelante.

Además, para un curso práctico, trabajar con Keycloak en contenedor deja una experiencia bastante clara y portable.

---

## Paso 1 · Preparar una carpeta para soporte de Keycloak

Dentro del monorepo, una buena idea es crear o usar una carpeta como:

```txt
novamarket/infrastructure/keycloak/
```

Ahí más adelante vas a poder guardar:

- notas del entorno,
- exportaciones de realm,
- archivos auxiliares,
- o configuración relacionada con esta pieza.

Para esta clase, no hace falta llenar demasiado esa carpeta, pero sí conviene dejar claro que Keycloak forma parte del entorno de infraestructura del proyecto y no de un servicio de negocio.

---

## Paso 2 · Elegir un comando simple para levantar Keycloak

Una forma muy común y práctica de levantarlo localmente es con Docker.

Por ejemplo, una idea base podría ser usar un contenedor con:

- puerto expuesto,
- usuario administrador,
- password administrador,
- y modo de desarrollo.

El detalle exacto del comando puede variar según la versión de Keycloak que estés usando, pero conceptualmente lo importante es esto:

- contenedor levantado,
- acceso web habilitado,
- y credenciales administrativas listas para entrar.

Para el curso práctico, la recomendación es usar una convención clara y fácil de recordar.

Por ejemplo:

- usuario admin
- password admin
- puerto visible, como `8084` o el que decidas reservar

Lo importante es no pisar puertos de servicios ya existentes.

---

## Paso 3 · Elegir un puerto claro y libre

Este paso importa bastante.

Ya venimos usando, por ejemplo:

- `8080` para gateway
- `8081` catálogo
- `8082` inventario
- `8083` órdenes
- `8761` Eureka
- `8888` Config Server

Por eso, para Keycloak conviene elegir otro puerto que no choque con el resto.

Por ejemplo, algo como:

```txt
8084
```

No es obligatorio que sea ese, pero sí conviene dejarlo claro y sostenerlo en el curso.

---

## Paso 4 · Levantar el contenedor

Una vez definido el puerto y las credenciales, levantá el contenedor de Keycloak.

La meta de esta clase no es todavía automatizar todo con Compose, sino simplemente dejarlo arriba y accesible para que el resto del bloque de seguridad tenga base real.

Una vez levantado, conviene esperar a que complete bien su inicialización antes de intentar entrar.

---

## Paso 5 · Verificar acceso a la consola web

Ahora abrí en el navegador la URL correspondiente al puerto que elegiste.

Por ejemplo, si usaste `8084`, podrías revisar algo equivalente a:

```txt
http://localhost:8084
```

La idea es confirmar que la interfaz de Keycloak esté disponible.

En esta etapa, no hace falta todavía crear configuraciones internas.  
Alcanza con verificar que:

- el servicio está vivo,
- responde por web,
- y permite ingresar con las credenciales de administrador.

---

## Paso 6 · Ingresar con las credenciales de administración

Ahora entrá con el usuario administrador que definiste al levantar el contenedor.

Queremos verificar que:

- el login administrativo funciona,
- la consola se abre correctamente,
- y tenemos un entorno usable para las siguientes clases.

Este es un checkpoint importante porque sin esta base el resto del bloque de seguridad no puede avanzar.

---

## Paso 7 · Confirmar que Keycloak ya es parte del entorno del proyecto

A partir de esta clase, conviene empezar a pensar Keycloak como una pieza más del sistema NovaMarket.

No es un servicio de negocio, pero sí es parte del entorno operativo actual del proyecto, igual que:

- Config Server
- Discovery Server
- Gateway

Este cambio mental es importante porque nos ayuda a pensar la arquitectura como un ecosistema completo.

---

## Qué todavía no hicimos

Todavía no:

- creamos un realm,
- creamos un cliente para NovaMarket,
- creamos usuarios de prueba,
- conectamos el gateway a Keycloak,
- ni protegimos rutas.

Todo eso viene inmediatamente después.

La meta de hoy es mucho más concreta:

**que Keycloak esté arriba, accesible y listo para ser usado.**

---

## Qué estamos logrando con esta clase

Esta clase no agrega todavía seguridad efectiva al flujo del negocio, pero sí agrega la infraestructura clave que la va a hacer posible.

Eso es muy importante porque en seguridad distribuida no alcanza con “agregar una dependencia” en los servicios.  
Primero necesitamos una fuente real de identidad y emisión de tokens.

Ese rol lo empieza a cubrir Keycloak desde ahora.

---

## Errores comunes en esta etapa

### 1. Elegir un puerto ya ocupado
Conviene revisarlo antes de levantar el contenedor.

### 2. No esperar a que Keycloak termine de iniciar
A veces la consola tarda un poco más en quedar lista.

### 3. Olvidar las credenciales de admin elegidas
Para el curso práctico conviene usar una convención simple y consistente.

### 4. Pensar que esta clase ya “protege” el sistema
Todavía no.  
Primero estamos montando la infraestructura.

### 5. No separar Keycloak como parte de `infrastructure/`
Es útil mantener claro que no es un microservicio de negocio.

---

## Resultado esperado al terminar la clase

Al terminar esta clase deberías tener:

- Keycloak arriba,
- su consola web accesible,
- login administrativo funcionando,
- y una base real sobre la que vamos a construir seguridad en las siguientes clases.

Eso abre formalmente el bloque de seguridad de NovaMarket.

---

## Punto de control

Antes de seguir, verificá que:

- Keycloak está levantado,
- podés abrir la consola web,
- podés iniciar sesión como administrador,
- y ya tenés claro el puerto y la forma en que lo integraste al entorno local.

Si eso está bien, ya podemos pasar a la siguiente clase, donde sí vamos a crear realm, cliente y usuario de prueba.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a configurar Keycloak para NovaMarket:

- realm,
- cliente,
- y usuario de prueba.

Ahí sí vamos a empezar a construir la identidad real que después consumirá el gateway.

---

## Cierre

En esta clase levantamos Keycloak y lo dejamos listo como proveedor de identidad del proyecto.

Con eso, NovaMarket suma una pieza de infraestructura muy importante y prepara el terreno para que el bloque de seguridad sea algo real y no solo una idea teórica.
