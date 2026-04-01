---
title: "Integración de Flyway con Gradle"
description: "Cómo integrar Flyway en un proyecto Gradle para ejecutar migraciones desde el build y mantener la base de datos versionada junto al código."
order: 17
module: "Integraciones y automatización"
level: "intermedio"
draft: false
---

# Integración de Flyway con Gradle

En el tema anterior vimos cómo integrar Flyway con Maven. Ahora toca mirar el otro gran escenario habitual en proyectos Java y Kotlin: **Gradle**.

La idea de fondo es la misma: usar la herramienta de build para ejecutar las migraciones, validar el estado de la base y mantener el historial junto al código fuente. La diferencia está en la sintaxis, en el estilo de configuración y en algunos detalles del flujo diario.

## Qué vas a aprender

En este tema vas a ver:

- qué aporta integrar Flyway con Gradle;
- cómo agregar el plugin al proyecto;
- cómo configurar la conexión y las migraciones;
- qué tareas básicas usar;
- qué tener en cuenta si usás migraciones en Java;
- cuándo conviene Gradle frente a Maven o frente a la CLI.

## Cuándo conviene usar Flyway con Gradle

Integrar Flyway con Gradle tiene mucho sentido cuando:

- tu proyecto ya usa Gradle como herramienta de build;
- querés que las migraciones vivan dentro del repositorio de la aplicación;
- necesitás automatizar el flujo en desarrollo, testing o CI;
- trabajás con un stack Java o Kotlin donde Gradle ya es parte natural del proyecto.

No es una “forma distinta de Flyway”, sino otra manera de ejecutar el mismo motor de migraciones dentro del ecosistema del proyecto.

## Plugin de Flyway para Gradle

La documentación oficial actual muestra dos identificadores posibles para el plugin, según la edición que uses.

### Open Source

```gradle
plugins {
    id "org.flywaydb.flyway" version "12.3.0"
}
```

### Redgate

```gradle
plugins {
    id "com.redgate.flyway" version "12.3.0"
}
```

Para el curso y para entender la mecánica general, podés trabajar perfectamente con el enfoque Open Source.

## Estructura típica del proyecto

Una estructura muy común queda así:

```text
mi-proyecto/
├─ build.gradle
├─ settings.gradle
└─ src/
   └─ main/
      └─ resources/
         └─ db/
            └─ migration/
               ├─ V1__crear_tabla_producto.sql
               ├─ V2__agregar_columna_stock.sql
               └─ V3__insertar_datos_iniciales.sql
```

Esta convención mantiene las migraciones cerca del código y hace que el proyecto sea más fácil de entender para cualquier integrante del equipo.

## Configuración mínima en `build.gradle`

Una configuración básica puede verse así:

```gradle
plugins {
    id "org.flywaydb.flyway" version "12.3.0"
}

flyway {
    url = 'jdbc:postgresql://localhost:5432/curso_flyway'
    user = 'postgres'
    password = 'postgres'
    locations = ['filesystem:src/main/resources/db/migration']
}
```

Con esto ya tenés lo esencial para empezar a correr migraciones.

## Tareas principales de Flyway en Gradle

La documentación oficial del plugin Gradle incluye, entre otras, estas tareas:

- `flywayMigrate`
- `flywayClean`
- `flywayInfo`
- `flywayValidate`
- `flywayBaseline`
- `flywayRepair`

En la práctica diaria, las más usadas suelen ser `flywayMigrate`, `flywayInfo` y `flywayValidate`.

## Primera ejecución

Si ya tenés configurado el plugin y una migración inicial, podés correr:

```bash
./gradlew flywayMigrate
```

En algunos ejemplos de la documentación aparece `gradle flywayMigrate -i`, pero en proyectos reales suele convenir usar el wrapper del proyecto (`./gradlew` o `gradlew.bat`) para asegurar una versión consistente de Gradle.

### Ver el estado actual

```bash
./gradlew flywayInfo
```

### Validar consistencia

```bash
./gradlew flywayValidate
```

### Crear baseline sobre una base existente

```bash
./gradlew flywayBaseline
```

### Reparar historial cuando corresponde

```bash
./gradlew flywayRepair
```

## Ejemplo práctico paso a paso

Supongamos que arrancás con una base vacía.

### 1. Crear la primera migración

Archivo:

```text
src/main/resources/db/migration/V1__crear_tabla_producto.sql
```

Contenido:

```sql
create table producto (
    id bigint primary key,
    nombre varchar(120) not null,
    precio numeric(12, 2) not null
);
```

### 2. Ejecutar la migración

```bash
./gradlew flywayMigrate
```

### 3. Crear una segunda migración

Archivo:

```text
src/main/resources/db/migration/V2__agregar_columna_stock.sql
```

Contenido:

```sql
alter table producto
add column stock integer not null default 0;
```

### 4. Ejecutar nuevamente

```bash
./gradlew flywayMigrate
```

Flyway no vuelve a correr `V1`. Solo aplica `V2`, porque las migraciones versionadas se ejecutan una sola vez.

## Qué pasa con el driver y módulos específicos de base de datos

En algunos motores, la documentación actual indica que hay que agregar un módulo adicional del motor de base de datos. Por ejemplo, para PostgreSQL aparece el módulo `flyway-database-postgresql` también en Gradle.

Eso significa que, además del plugin principal, a veces vas a necesitar dependencias específicas según la base que estés usando.

## Migraciones en Java con Gradle

Si más adelante usás **migraciones Java** o callbacks en Java, hay un detalle importante: la documentación oficial aclara que las clases deben estar compiladas antes de correr `flywayMigrate`.

Por eso es común ejecutar:

```bash
./gradlew classes flywayMigrate
```

O bien hacer que la tarea de migración dependa de `classes`.

Este punto no afecta a las migraciones SQL puras, pero es importante recordarlo para no sorprenderte cuando el proyecto empiece a crecer.

## Buenas prácticas al usar Flyway con Gradle

### 1. Usar el wrapper del proyecto

Trabajar con `./gradlew` o `gradlew.bat` ayuda a que todos ejecuten el mismo Gradle.

### 2. No guardar secretos sensibles directamente en el build

Para practicar está bien, pero en proyectos reales conviene usar variables de entorno o mecanismos externos de configuración.

### 3. Mantener las migraciones dentro del repositorio

Eso mejora la trazabilidad y hace que la evolución de la base viaje junto a la aplicación.

### 4. No editar migraciones ya aplicadas

Gradle no cambia las reglas de Flyway. Si una migración ya fue aplicada, lo correcto es avanzar con una nueva versión.

## Errores comunes

### Configurar mal `locations`

Si la ruta es incorrecta, Flyway no va a encontrar migraciones y puede parecer que no hay nada para aplicar.

### Conectarse a la base equivocada

Este error sigue siendo igual de peligroso que con la CLI o con Maven. Siempre revisá la URL antes de ejecutar tareas que cambian el estado.

### Pensar que Gradle resuelve por sí solo la estrategia de migraciones

Gradle solo integra Flyway al build. Las decisiones sobre versionado, baseline, validación y reparación siguen dependiendo de vos y del equipo.

## Gradle vs Maven vs CLI

### Gradle

Conviene cuando:

- tu proyecto ya usa Gradle;
- querés integrar las migraciones al build del proyecto;
- trabajás con stacks donde Gradle es la herramienta principal.

### Maven

Conviene cuando:

- tu proyecto ya está montado sobre Maven;
- buscás una integración clásica dentro del ecosistema Java.

### CLI

Conviene cuando:

- querés una herramienta separada del build;
- necesitás correr migraciones sin depender de un proyecto Java;
- trabajás sobre varias bases o varios repositorios.

Ninguna opción invalida a las demás. En muchos equipos conviven sin problema.

## Resumen

Integrar Flyway con Gradle te permite ejecutar migraciones desde el mismo entorno del proyecto, usando tareas como `flywayMigrate`, `flywayInfo`, `flywayValidate`, `flywayBaseline` y `flywayRepair`. La configuración vive en `build.gradle`, las migraciones suelen mantenerse dentro de `src/main/resources/db/migration`, y el enfoque encaja muy bien en proyectos Java y Kotlin que ya usan Gradle.

La ventaja principal no es solo técnica: también mejora el orden del proyecto y vuelve más natural tratar la base de datos como una parte versionada del sistema.

## Ejercicio propuesto

1. Creá un proyecto Gradle simple.
2. Agregá el plugin de Flyway.
3. Configurá una base de prueba.
4. Creá `V1__crear_tabla_producto.sql`.
5. Ejecutá `./gradlew flywayMigrate`.
6. Creá `V2__agregar_columna_stock.sql`.
7. Ejecutá nuevamente `./gradlew flywayMigrate`.
8. Corré `./gradlew flywayInfo` y verificá el historial.

## Lo que sigue

En el próximo tema vamos a ver las **migraciones en Java**, para entender cuándo conviene salir del SQL puro y cómo manejar casos más avanzados desde código.
