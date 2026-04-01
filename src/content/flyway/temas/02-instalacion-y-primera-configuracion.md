---
title: "Instalación y primera configuración de Flyway CLI"
description: "Cómo instalar Flyway CLI, preparar un proyecto mínimo y configurar la conexión inicial a una base de datos."
order: 2
module: "Fundamentos de Flyway"
level: "intro"
draft: false
---

# Instalación y primera configuración de Flyway CLI

En el tema anterior vimos qué problema resuelve Flyway y por qué conviene versionar la base de datos.

Ahora vamos a dar el primer paso práctico: **instalar Flyway CLI**, crear una estructura mínima de trabajo y dejar lista la configuración para conectarnos a una base de datos.

La idea de este tema es que termines con un entorno preparado para empezar a correr migraciones reales en el siguiente tema.

## Objetivos

Al finalizar este tema deberías poder:

- entender qué variante de Flyway vas a usar en el curso;
- preparar una carpeta de trabajo simple;
- ubicar el archivo de configuración principal;
- configurar `locations` y una conexión inicial a una base de datos;
- ejecutar un primer comando para comprobar que Flyway responde.

## Qué vamos a usar

En este curso vamos a trabajar principalmente con **Flyway CLI**.

¿Por qué?

Porque es una forma directa y práctica de aprender cómo funciona Flyway sin depender todavía de Maven, Gradle ni código Java. Más adelante veremos esas integraciones, pero primero conviene dominar la base.

## Instalación de Flyway CLI

Flyway puede usarse de distintas maneras, pero para este curso vamos a enfocarnos en la línea de comandos.

Una vez instalado, la idea es poder ejecutar comandos como:

```bash
flyway -v
```

Si ese comando responde mostrando la versión, entonces Flyway ya está disponible desde tu terminal.

## Estructura mínima de trabajo

Una forma simple de empezar es crear una carpeta para practicar, por ejemplo:

```text
flyway/
├─ conf/
│  └─ flyway.toml
└─ migrations/
```

Esta estructura es suficiente para arrancar:

- `conf/flyway.toml` contendrá la configuración principal;
- `migrations/` contendrá los scripts SQL versionados que iremos creando.

## Archivo de configuración inicial

Flyway puede recibir parámetros por línea de comandos, pero para trabajar de forma ordenada conviene dejar la configuración en archivo.

Un ejemplo mínimo de `conf/flyway.toml` es este:

```toml
[flyway]
locations = ["filesystem:migrations"]

[environments.default]
url = "jdbc:sqlite:FlywayQuickStartCLI.db"
user = ""
password = ""
```

### Qué significa cada parte

#### `[flyway]`

Es la sección general de configuración.

#### `locations`

Le indica a Flyway dónde buscar las migraciones.

En este caso:

```toml
locations = ["filesystem:migrations"]
```

significa que Flyway debe buscar scripts en la carpeta `migrations` del proyecto.

#### `[environments.default]`

Define el entorno por defecto con el que va a trabajar Flyway.

#### `url`

Es la URL JDBC de la base de datos.

En el ejemplo se usa SQLite porque es cómoda para un primer contacto y no exige levantar un servidor aparte.

#### `user` y `password`

Son las credenciales de conexión.

En SQLite quedan vacías, pero en motores como PostgreSQL o MySQL normalmente tendrás que completarlas.

## Primer chequeo desde consola

Una vez preparada la carpeta y el archivo de configuración, podés comprobar que Flyway está accesible con:

```bash
flyway -v
```

Y más adelante, cuando existan migraciones, usarás comandos como:

```bash
flyway info
flyway migrate
```

Todavía no los vamos a explotar en profundidad en este tema. Lo importante acá es dejar el entorno listo.

## Alternativa: pasar parámetros por consola

También podrías ejecutar Flyway pasando la conexión directamente por línea de comandos, por ejemplo:

```bash
flyway migrate -url=... -user=... -password=...
```

Eso puede servir para pruebas rápidas, pero para el curso vamos a priorizar el archivo `flyway.toml`, porque mantiene la configuración más ordenada y legible.

## Recomendaciones prácticas

### 1. Usá una carpeta dedicada

No mezcles al principio Flyway con un proyecto grande. Primero dominá el flujo en una carpeta chica de práctica.

### 2. No pongas las migraciones fuera de `locations`

Si Flyway no encuentra tus scripts, muchas veces el problema está en la ruta configurada.

### 3. Empezá con una base simple

Para aprender, conviene usar una base fácil de levantar o una configuración mínima. Lo importante ahora no es la complejidad del motor, sino entender el flujo.

### 4. Validá el entorno antes de escribir muchas migraciones

Primero confirmá que Flyway responde, que la ruta existe y que la conexión está bien configurada. Después recién avanzá con scripts reales.

## Errores comunes al empezar

### Flyway no se reconoce como comando

Suele indicar que la instalación no quedó accesible desde la terminal o que falta ajustar el entorno.

### La ruta de migraciones no existe

Si configurás `filesystem:migrations`, esa carpeta debe existir.

### La conexión a la base está mal

Un error en la URL, el usuario o la contraseña impide avanzar, incluso aunque el resto esté bien.

### Querer aprender todo junto

Primero CLI y flujo básico. Después integración con Maven, Gradle y proyectos reales.

## Ejercicio práctico

1. Creá una carpeta llamada `flyway-practica`.
2. Dentro, creá las carpetas `conf` y `migrations`.
3. Agregá un archivo `conf/flyway.toml` con una configuración mínima.
4. Verificá que Flyway responda desde la terminal.
5. Dejá todo listo para crear tu primera migración en el siguiente tema.

## Resumen

En este tema preparaste el terreno:

- elegiste trabajar con **Flyway CLI**;
- viste una estructura mínima de proyecto;
- configuraste `flyway.toml`;
- definiste una primera `location` para las migraciones;
- dejaste lista la conexión inicial a una base de datos.

En el próximo tema vamos a crear la **primera migración versionada** y ejecutar `flyway migrate` por primera vez.
