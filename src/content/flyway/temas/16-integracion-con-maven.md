---
title: "Integración de Flyway con Maven"
description: "Cómo integrar Flyway en un proyecto Maven para ejecutar migraciones desde el build y mantener la base de datos versionada junto al código."
order: 16
module: "Integraciones y automatización"
level: "intermedio"
draft: false
---

# Integración de Flyway con Maven

Hasta ahora venimos usando Flyway de forma conceptual y, en algunos temas, cerca de la línea de comandos. En un proyecto Java real, una forma muy común de trabajar es integrarlo con **Maven** para poder ejecutar migraciones desde el mismo ecosistema del proyecto.

La idea es simple: así como Maven compila, testea y empaqueta tu aplicación, también puede encargarse de correr las migraciones de base de datos. Esto hace que el esquema quede mucho más unido al código fuente y al flujo normal de trabajo del equipo.

## Qué vas a aprender

En este tema vas a ver:

- qué aporta integrar Flyway con Maven;
- cómo agregar el plugin al `pom.xml`;
- cómo configurar la conexión y la ubicación de migraciones;
- qué comandos básicos usar;
- en qué casos conviene Maven y en cuáles sigue siendo útil la CLI.

## Cuándo conviene usar Flyway con Maven

Integrar Flyway con Maven suele ser una buena decisión cuando:

- tu proyecto ya está construido con Maven;
- querés que las migraciones vivan dentro del repositorio de la aplicación;
- necesitás un flujo repetible para desarrollo, testing o CI;
- querés evitar depender siempre de una instalación separada de Flyway CLI.

No reemplaza todas las formas de uso de Flyway, pero sí encaja muy bien en proyectos Java tradicionales y en muchos backends con Spring o sin Spring.

## Estructura típica del proyecto

Una estructura habitual en un proyecto Maven que usa Flyway es esta:

```text
mi-proyecto/
├─ pom.xml
└─ src/
   └─ main/
      └─ resources/
         └─ db/
            └─ migration/
               ├─ V1__crear_tabla_producto.sql
               ├─ V2__agregar_columna_stock.sql
               └─ V3__insertar_datos_iniciales.sql
```

Ese directorio es una convención muy usada y te ayuda a mantener todo ordenado dentro del proyecto.

## Agregar el plugin al `pom.xml`

La integración básica empieza agregando el plugin de Flyway al archivo `pom.xml`.

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.flywaydb</groupId>
      <artifactId>flyway-maven-plugin</artifactId>
      <version>${flyway.version}</version>
    </plugin>
  </plugins>
</build>
```

Podés definir la versión en una propiedad para que quede más prolijo:

```xml
<properties>
  <flyway.version>12.3.0</flyway.version>
</properties>
```

## Configuración mínima

Además del plugin, necesitás indicarle a Flyway cómo conectarse a la base y dónde están las migraciones.

Un ejemplo simple sería este:

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.flywaydb</groupId>
      <artifactId>flyway-maven-plugin</artifactId>
      <version>${flyway.version}</version>
      <configuration>
        <url>jdbc:postgresql://localhost:5432/curso_flyway</url>
        <user>postgres</user>
        <password>postgres</password>
        <locations>
          <location>filesystem:src/main/resources/db/migration</location>
        </locations>
      </configuration>
    </plugin>
  </plugins>
</build>
```

Con eso ya tenés una base suficiente para empezar.

## Primera ejecución

Una vez configurado el plugin, podés correr Flyway desde Maven.

### Migrar la base

```bash
mvn flyway:migrate
```

Este comando:

- busca las migraciones disponibles;
- revisa `flyway_schema_history`;
- aplica las pendientes en orden;
- deja registrada cada ejecución.

### Ver información del estado actual

```bash
mvn flyway:info
```

### Validar consistencia

```bash
mvn flyway:validate
```

### Reparar historial cuando corresponde

```bash
mvn flyway:repair
```

### Crear baseline sobre una base existente

```bash
mvn flyway:baseline
```

## Ejemplo práctico paso a paso

Supongamos que partís de una base vacía.

### 1. Crear la migración inicial

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
mvn flyway:migrate
```

### 3. Agregar una nueva versión

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
mvn flyway:migrate
```

Flyway no vuelve a correr `V1`. Solo aplica `V2`, porque las versionadas se ejecutan una sola vez.

## Buenas prácticas al usar Flyway con Maven

### 1. No hardcodear secretos en proyectos reales

Para aprender está bien poner usuario y contraseña en el `pom.xml`, pero en un proyecto serio conviene usar variables de entorno, archivos externos o mecanismos seguros de configuración.

### 2. Mantener las migraciones dentro del repositorio

Eso te permite versionar base de datos y aplicación en el mismo flujo de trabajo.

### 3. No editar migraciones ya aplicadas

Si una migración ya corrió en otra base, lo correcto es crear una nueva versión y no reescribir la anterior.

### 4. Usar Maven como parte del flujo, no como excusa para mezclar responsabilidades

Que Flyway esté en Maven no significa que tengas que atarlo a cualquier fase del build sin pensar. Primero entendé bien cuándo querés migrar y sobre qué entorno.

## Errores comunes

### Configurar mal la ruta de migraciones

Si `locations` apunta a un directorio incorrecto, Flyway no va a encontrar archivos y va a parecer que “no hace nada”.

### Conectarse a la base equivocada

Este es uno de los errores más peligrosos. Siempre revisá la URL antes de ejecutar comandos que modifiquen el estado.

### Pensar que Maven reemplaza la comprensión del proceso

Maven solo te da una forma cómoda de ejecutar Flyway. La lógica de migraciones, validación, baseline y repair sigue siendo la misma.

## Maven vs CLI

Ambas opciones sirven, pero tienen enfoques distintos.

### Maven

Conviene cuando:

- trabajás dentro de un proyecto Java;
- querés que las migraciones formen parte del repositorio;
- buscás integrar todo con el build y con CI.

### CLI

Conviene cuando:

- querés una herramienta separada del proyecto;
- necesitás correr Flyway sobre varias bases sin depender de Maven;
- trabajás en entornos donde no siempre hay un proyecto Java detrás.

No se trata de elegir una para siempre. En muchos equipos conviven ambas.

## Resumen

Integrar Flyway con Maven te permite ejecutar las migraciones desde el mismo entorno del proyecto Java. La configuración básica vive en el `pom.xml`, las migraciones suelen guardarse en `src/main/resources/db/migration` y los comandos más usados son `migrate`, `info`, `validate`, `repair` y `baseline`.

La gran ventaja no es solo comodidad: también mejora la trazabilidad y hace más natural versionar la base junto con la aplicación.

## Ejercicio propuesto

1. Creá un proyecto Maven vacío.
2. Agregá el plugin de Flyway al `pom.xml`.
3. Configurá una base de prueba.
4. Creá `V1__crear_tabla_producto.sql`.
5. Ejecutá `mvn flyway:migrate`.
6. Creá `V2__agregar_columna_stock.sql`.
7. Ejecutá nuevamente `mvn flyway:migrate`.
8. Corré `mvn flyway:info` y verificá el historial.

## Lo que sigue

En el próximo tema vamos a ver la **integración de Flyway con Gradle**, para que puedas comparar ambos enfoques y entender cómo cambia el flujo según la herramienta de build.
