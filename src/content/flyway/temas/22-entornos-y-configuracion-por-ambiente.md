---
title: "Entornos y configuración por ambiente"
description: "Cómo organizar Flyway para trabajar con desarrollo, testing y producción usando environments y archivos de configuración separados."
order: 22
module: "Trabajo profesional con Flyway"
level: "intermedio"
draft: false
---

# Entornos y configuración por ambiente

Cuando Flyway se usa en proyectos reales, rara vez alcanza con una sola conexión fija a una sola base de datos. Lo habitual es trabajar con varios ambientes: desarrollo, testing, staging, producción y, a veces, bases efímeras para validaciones o pruebas temporales.

Si no organizás bien esa configuración, aparece un problema serio: **terminás ejecutando comandos sensibles contra la base equivocada**.

Por eso, en este tema vamos a ordenar Flyway para que puedas trabajar con distintos entornos de forma clara, predecible y profesional.

## Objetivos del tema

Al finalizar este tema deberías poder:

- entender qué es un environment en Flyway;
- definir varios ambientes dentro de la configuración;
- seleccionar un entorno al ejecutar comandos;
- separar configuración compartida de secretos o datos locales;
- reducir el riesgo de apuntar por error a la base equivocada.

## Qué es un environment en Flyway

En Flyway, un **environment** es un conjunto de propiedades asociadas para conectarte a una base de datos.

Por ejemplo, podrías tener:

- un entorno `development` para tu base local;
- un entorno `test` para pruebas automáticas;
- un entorno `staging` para validaciones previas a producción;
- un entorno `production` para la base real.

La idea no es solo cambiar una URL: cada ambiente puede tener sus propias credenciales, esquemas por defecto y otras configuraciones relacionadas con la conexión.

## Por qué esto importa tanto

Trabajar con ambientes bien definidos te da varias ventajas:

- evitás editar la configuración manualmente cada vez;
- reducís errores humanos;
- hacés los comandos más claros;
- podés compartir parte de la configuración con el equipo;
- mantenés fuera del control de versiones los secretos locales.

En otras palabras: pasás de un uso “artesanal” de Flyway a un flujo mucho más seguro.

## El archivo `flyway.toml`

En las versiones actuales, Flyway usa **TOML** como formato principal de configuración. El nombre por defecto del archivo principal es:

```text
flyway.toml
```

Ese archivo define el proyecto y puede incluir tanto configuración general como definición de entornos.

## Ejemplo básico con varios ambientes

Un archivo simple podría verse así:

```toml
[flyway]
locations = ["filesystem:sql"]
environment = "development"

[environments.development]
url = "jdbc:postgresql://localhost:5432/app_dev"
user = "postgres"
password = "postgres"
defaultSchema = "public"

[environments.test]
url = "jdbc:postgresql://localhost:5432/app_test"
user = "postgres"
password = "postgres"
defaultSchema = "public"

[environments.production]
url = "jdbc:postgresql://db-prod:5432/app_prod"
user = "app_user"
password = "secreto-fuerte"
defaultSchema = "public"
```

Con esto, Flyway sabe que existen varios ambientes y cuál usar por defecto.

## Cómo elegir el ambiente al ejecutar un comando

Si querés ejecutar un comando contra un ambiente específico, podés indicarlo así:

```bash
flyway -environment=development info
```

O por ejemplo:

```bash
flyway -environment=test migrate
```

Esto evita que tengas que reescribir URL, usuario y contraseña en cada ejecución.

## Ambiente por defecto

Muchos comandos de Flyway apuntan a un solo ambiente. Si no configurás explícitamente cuál usar, Flyway asume por defecto un ambiente llamado `default`.

Eso significa que conviene ser prolijo:

- o bien definís un entorno `default`;
- o bien seteás explícitamente `environment = "development"` u otro nombre apropiado en `[flyway]`.

Ser explícito suele ser mejor, porque hace más legible la intención del proyecto.

## Una estrategia recomendable de organización

En equipos reales, una forma prolija de trabajar es esta:

### `flyway.toml` versionado

Guardás en Git solo lo que el equipo comparte:

```toml
[flyway]
locations = ["filesystem:sql"]

[environments.development]
defaultSchema = "public"

[environments.test]
defaultSchema = "public"
```

### `flyway.user.toml` local y fuera de Git

Dejás en un archivo local los datos sensibles o propios de tu máquina:

```toml
[environments.development]
url = "jdbc:postgresql://localhost:5432/app_dev"
user = "postgres"
password = "postgres"

[environments.test]
url = "jdbc:postgresql://localhost:5432/app_test"
user = "postgres"
password = "postgres"
```

Así conseguís dos cosas:

- compartir la estructura del proyecto;
- no subir secretos ni detalles locales al repositorio.

## Por qué separar lo compartido de lo local

Esta separación reduce varios problemas clásicos:

- credenciales expuestas en Git;
- archivos que cada desarrollador termina editando a mano;
- diferencias invisibles entre máquinas;
- dificultad para reproducir el proyecto en otro entorno.

Además, si más adelante integrás Flyway con CI/CD, este enfoque te deja mejor parado desde el principio.

## Uso de resolvers y secretos

La documentación actual también contempla el uso de **resolvers** para tomar valores desde variables de entorno o gestores de secretos.

La idea general es que no siempre necesitás dejar contraseñas en texto plano en un archivo TOML. En proyectos más serios, muchas veces se resuelven desde:

- variables de entorno;
- secretos del sistema de CI/CD;
- herramientas de secret management.

Ese salto no siempre es necesario al comienzo del curso, pero es importante que sepas que Flyway ya está preparado para este tipo de flujo.

## Ambientes temporales o efímeros

No todos los ambientes son permanentes.

En algunos equipos aparecen bases temporales para:

- correr validaciones automatizadas;
- probar una rama concreta;
- generar scripts o comparar estados;
- recrear una base desde cero con fines de testing.

Flyway contempla este tipo de uso, así que pensar en environments no es solo pensar en `dev` y `prod`: también podés modelar ambientes temporales cuando tu flujo lo necesite.

## Error común: copiar y pegar conexiones a mano

Un error muy frecuente al empezar con Flyway es trabajar así:

```bash
flyway -url=... -user=... -password=... migrate
```

Y luego repetir lo mismo cambiando parámetros manualmente según el ambiente.

Eso puede funcionar al principio, pero escala mal por varias razones:

- es fácil olvidarte de cambiar un valor;
- los comandos se vuelven largos y poco claros;
- aumenta el riesgo de correr algo en la base incorrecta;
- cuesta más automatizar el flujo.

Para pruebas rápidas sirve. Para trabajo habitual, conviene pasar a environments bien definidos.

## Otra buena práctica: dejar claro el ambiente en cada comando sensible

Aunque tengas un environment por defecto, en operaciones delicadas muchas veces conviene ser explícito.

Por ejemplo:

```bash
flyway -environment=development validate
flyway -environment=development migrate
flyway -environment=production info
```

Esto hace que el comando sea más legible y reduce ambigüedades cuando alguien revisa un script, un pipeline o una bitácora de despliegue.

## Ejercicio recomendado

Armá una carpeta de proyecto con esta estructura:

```text
mi-proyecto-flyway/
  flyway.toml
  flyway.user.toml
  sql/
    V1__crear_tabla_clientes.sql
    V2__crear_tabla_pedidos.sql
```

Luego hacé esto:

1. definí un entorno `development`;
2. definí un entorno `test`;
3. dejá `locations = ["filesystem:sql"]` en el archivo principal;
4. guardá las credenciales en el archivo local;
5. ejecutá `info` contra `development`;
6. ejecutá `migrate` contra `development`;
7. ejecutá `info` contra `test` y compará el estado.

La idea es que empieces a pensar Flyway como una herramienta de trabajo por ambientes y no solo como un comando suelto.

## Buenas prácticas

- usá nombres claros como `development`, `test`, `staging` y `production`;
- evitá dejar credenciales sensibles en archivos versionados;
- preferí configuración compartida en `flyway.toml` y datos locales en un archivo separado;
- para operaciones delicadas, indicá el environment explícitamente;
- tratá la configuración de ambientes como parte del diseño profesional del proyecto.

## Resumen

Trabajar con múltiples ambientes en Flyway no es un detalle accesorio: es una parte central de un flujo profesional y seguro.

Los **environments** te permiten modelar conexiones distintas dentro del mismo proyecto, elegir el destino correcto con `-environment=...` y organizar mejor la configuración. Si además separás lo compartido de lo local, reducís errores y dejás el proyecto listo para crecer hacia testing automatizado y CI/CD.

## Próximo tema

En el próximo tema vamos a ver **Flyway en tests y bases efímeras**, para usar migraciones en pruebas de integración y entender cómo recrear una base desde cero de forma confiable.
