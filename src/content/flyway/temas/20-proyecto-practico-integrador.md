---
title: "Proyecto práctico integrador con Flyway"
description: "Un proyecto final para aplicar migrate, info, validate, errores y repair en un flujo real de evolución de una base de datos."
order: 20
module: "Proyecto final integrador"
level: "avanzado"
draft: false
---

# Proyecto práctico integrador con Flyway

Llegó el momento de cerrar el curso con un ejercicio completo.

Hasta acá viste las piezas por separado:

- migraciones versionadas;
- repeatable migrations;
- `info`;
- `validate`;
- `baseline`;
- fallas de migración;
- `repair`;
- `locations`;
- integración con Maven y Gradle;
- callbacks y automatización.

Ahora vas a unir varias de esas piezas en un único flujo de trabajo.

La idea de este tema no es aprender un comando nuevo, sino practicar **cómo se trabaja con Flyway en un proyecto real**.

## Qué vas a aprender

En este tema vas a:

- crear una base desde cero usando migraciones;
- evolucionar el esquema en varias versiones;
- consultar el estado del proyecto con `info`;
- validar integridad con `validate`;
- provocar una inconsistencia controlada;
- corregir el problema con el enfoque correcto;
- usar `repair` solo cuando realmente corresponde.

## Objetivo del proyecto

Vas a construir una base simple para una aplicación de ventas.

El proyecto va a pasar por estas etapas:

1. crear tablas iniciales;
2. agregar nuevas columnas y restricciones;
3. incorporar datos de referencia;
4. ejecutar una repeatable migration;
5. inspeccionar el historial;
6. romper deliberadamente una migración ya aplicada;
7. detectar el problema con `validate`;
8. corregirlo sin perder el control del historial.

## Estructura sugerida

Podés trabajar con una estructura como esta:

```text
flyway-proyecto-final/
├─ flyway.toml
├─ sql/
│  ├─ V1__crear_tablas_iniciales.sql
│  ├─ V2__agregar_estado_a_orders.sql
│  ├─ V3__crear_tabla_categorias.sql
│  ├─ V4__insertar_datos_iniciales.sql
│  └─ R__vista_resumen_de_ventas.sql
└─ callbacks/
   └─ afterMigrate.sql
```

## Configuración base

Un ejemplo simple de `flyway.toml` podría ser este:

```toml
[flyway]
url = "jdbc:postgresql://localhost:5432/flyway_demo"
user = "postgres"
password = "postgres"
locations = ["filesystem:sql"]
callbackLocations = ["filesystem:callbacks"]
```

Adaptalo al motor y credenciales que estés usando.

## Paso 1: crear la primera versión

Creá una migración inicial:

```text
V1__crear_tablas_iniciales.sql
```

```sql
create table customers (
    id bigint generated always as identity primary key,
    full_name varchar(120) not null,
    email varchar(150) not null unique,
    created_at timestamp not null default current_timestamp
);

create table orders (
    id bigint generated always as identity primary key,
    customer_id bigint not null,
    total numeric(12,2) not null,
    created_at timestamp not null default current_timestamp,
    constraint fk_orders_customer
        foreign key (customer_id)
        references customers(id)
);
```

Después ejecutá:

```bash
flyway migrate
```

### Qué deberías observar

- Flyway crea la tabla `flyway_schema_history` si todavía no existe.
- Se aplica `V1`.
- La base queda versionada desde el primer cambio.

## Paso 2: consultar el estado

Ahora corré:

```bash
flyway info
```

El objetivo es que empieces a leer el estado del proyecto como parte del flujo normal, no solo cuando algo falla.

## Paso 3: evolucionar el esquema

Agregá una nueva migración:

```text
V2__agregar_estado_a_orders.sql
```

```sql
alter table orders
add column status varchar(30) not null default 'PENDING';
```

Luego ejecutá otra vez:

```bash
flyway migrate
```

## Paso 4: agregar una tabla nueva

Creá:

```text
V3__crear_tabla_categorias.sql
```

```sql
create table categories (
    id bigint generated always as identity primary key,
    name varchar(80) not null unique
);
```

Y otra migración para datos iniciales:

```text
V4__insertar_datos_iniciales.sql
```

```sql
insert into categories (name) values ('Hardware');
insert into categories (name) values ('Software');
insert into categories (name) values ('Servicios');
```

Aplicalas con:

```bash
flyway migrate
```

## Paso 5: incorporar una repeatable migration

Ahora agregá una repeatable migration:

```text
R__vista_resumen_de_ventas.sql
```

```sql
create or replace view sales_summary as
select
    o.id,
    c.full_name as customer_name,
    o.total,
    o.status,
    o.created_at
from orders o
join customers c on c.id = o.customer_id;
```

Ejecutá otra vez:

```bash
flyway migrate
```

### Qué deberías entender acá

- las versionadas se ejecutan una sola vez;
- la repeatable se ejecuta cuando corresponde dentro del ciclo de `migrate`;
- el historial te permite ver qué quedó aplicado y en qué orden.

## Paso 6: validar el estado

Corré:

```bash
flyway validate
```

En este punto debería salir todo bien.

Ese es el escenario ideal: migraciones aplicadas, historial consistente y validación limpia.

## Paso 7: provocar una inconsistencia controlada

Ahora hacé algo **a propósito** para entender un error típico.

Editá una migración versionada ya aplicada. Por ejemplo:

```text
V2__agregar_estado_a_orders.sql
```

Y cambiá el valor por defecto:

```sql
alter table orders
add column status varchar(30) not null default 'NEW';
```

Guardá el archivo y ejecutá:

```bash
flyway validate
```

### Qué debería pasar

Flyway debería detectar que el checksum actual del archivo ya no coincide con el checksum registrado cuando la migración fue aplicada.

Ese error es intencional y es una de las lecciones más importantes del curso:

**una migración versionada aplicada no se reescribe**.

## Paso 8: resolver bien el problema

La forma correcta de resolver esto no es correr `repair` automáticamente.

Primero tenés que decidir qué querías hacer de verdad.

### Caso A: editaste el archivo por error

Entonces lo correcto es:

- restaurar el contenido original del archivo;
- volver a ejecutar `flyway validate`.

### Caso B: querías cambiar el comportamiento de verdad

Entonces lo correcto es:

- dejar intacta la migración ya aplicada;
- crear una nueva migración versionada.

Por ejemplo:

```text
V5__cambiar_default_de_status.sql
```

```sql
alter table orders
alter column status set default 'NEW';
```

Después:

```bash
flyway migrate
```

Este es el patrón profesional:

- no reescribís historia;
- avanzás con una nueva versión;
- dejás trazabilidad completa.

## Paso 9: usar repair solo cuando corresponde

Ahora supongamos que, además de haber editado el archivo, decidiste que ese cambio debía quedar como nueva referencia del historial porque la migración aplicada y el archivo disponible tienen que volver a alinearse.

En ese contexto, `repair` puede realinear checksums, descripciones y tipos en `flyway_schema_history` con los archivos disponibles.

Pero hay que entender bien esto:

- `repair` no sustituye una corrección conceptual;
- `repair` no modifica automáticamente objetos de usuario rotos;
- `repair` no debería ser el primer reflejo ante cualquier error.

Un uso controlado sería:

```bash
flyway repair
```

Y luego:

```bash
flyway validate
flyway info
```

## Paso 10: agregar un callback sencillo

Para cerrar el proyecto, podés sumar un callback simple.

Archivo:

```text
afterMigrate.sql
```

Ejemplo conceptual:

```sql
insert into audit_log(event_name, created_at)
values ('AFTER_MIGRATE', current_timestamp);
```

Si querés usar este ejemplo literal, primero necesitás una tabla compatible. También podés reemplazarlo por una acción sencilla específica de tu motor.

La idea es ver cómo una automatización acompaña el flujo principal sin mezclarse con las migraciones versionadas.

## Secuencia completa recomendada

Una práctica muy buena para este proyecto sería repetir varias veces esta secuencia:

```bash
flyway info
flyway validate
flyway migrate
flyway info
```

Eso te acostumbra a trabajar con Flyway como una herramienta de flujo y no solo como un comando aislado.

## Qué debería quedarte claro al terminar

Si este proyecto salió bien, deberías haber incorporado estas ideas:

- la base también se versiona;
- el historial importa tanto como los scripts;
- no se deben reescribir migraciones versionadas ya aplicadas;
- `validate` sirve para detectar inconsistencias temprano;
- `repair` existe, pero se usa con criterio;
- las repeatable migrations y callbacks complementan el flujo, no lo reemplazan.

## Ejercicio final

Hacé este cierre por tu cuenta:

1. creá una nueva migración `V6` que agregue una columna `updated_at` en `orders`;
2. modificá la repeatable migration para incluir esa columna;
3. corré `flyway migrate`;
4. verificá el estado con `flyway info`;
5. explicá con tus palabras qué se ejecutó una vez y qué pudo reejecutarse.

## Error común a evitar

Uno de los peores hábitos al empezar con Flyway es este:

- cambiar una migración ya aplicada;
- ejecutar `repair` sin pensar;
- seguir adelante sin entender qué quedó realmente en la base.

Ese patrón puede dejar el historial “prolijamente roto”.

Flyway funciona mejor cuando respetás esta lógica:

- cambios nuevos, migraciones nuevas;
- validación frecuente;
- reparaciones solo con criterio.

## Cierre

Con este tema completaste el recorrido base de Flyway desde una perspectiva práctica.

Ya no lo estás viendo como una herramienta para “correr scripts SQL”, sino como un sistema de **evolución controlada de base de datos**.

Y esa es la idea correcta.

A partir de acá, el siguiente paso natural es usar Flyway dentro de proyectos más grandes:

- con Maven o Gradle;
- dentro de pipelines de CI/CD;
- con múltiples entornos;
- con bases ya existentes;
- junto a aplicaciones reales en Spring Boot o arquitecturas más completas.
