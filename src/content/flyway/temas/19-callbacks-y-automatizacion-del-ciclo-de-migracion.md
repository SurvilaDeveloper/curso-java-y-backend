---
title: "Callbacks y automatización del ciclo de migración"
description: "Cómo usar callbacks en Flyway para ejecutar tareas antes o después de una operación y automatizar acciones repetitivas dentro del ciclo de migración."
order: 19
module: "Integraciones y automatización"
level: "intermedio"
draft: false
---

# Callbacks y automatización del ciclo de migración

Hasta acá trabajaste con el flujo principal de Flyway: escribir migraciones, validarlas, ejecutarlas y reparar problemas cuando hace falta. Pero en proyectos reales a veces necesitás hacer algo **antes** o **después** de una operación.

Por ejemplo:

- refrescar una vista materializada;
- ejecutar una tarea de housekeeping;
- dejar un registro de auditoría;
- lanzar una acción de soporte alrededor de `migrate`;
- automatizar pasos repetitivos del ciclo de despliegue.

Para eso existen los **callbacks**.

Un callback es una pieza de código o un script que Flyway ejecuta en determinados momentos de su ciclo de vida.

## Qué vas a aprender

En este tema vas a ver:

- qué es un callback en Flyway;
- en qué momentos puede ejecutarse;
- cómo crear callbacks SQL;
- cuándo tiene sentido pasar a callbacks Java;
- buenas prácticas para automatizar sin volver frágil el proceso.

## Qué es un callback

Un callback es una acción asociada a un evento del ciclo de Flyway.

La idea es simple:

- ocurre un evento;
- Flyway detecta si existe un callback asociado;
- si existe, lo ejecuta.

Ejemplos de eventos comunes:

- `beforeMigrate`
- `afterMigrate`
- `afterMigrateError`
- `beforeEachMigrate`
- `afterEachMigrate`

Esto te permite insertar lógica de soporte alrededor de las migraciones sin mezclarla dentro de cada archivo versionado.

## Casos de uso típicos

Los callbacks suelen usarse para tareas como estas:

- recompilar procedimientos;
- refrescar vistas materializadas;
- ejecutar mantenimiento posterior a cambios;
- registrar eventos de despliegue;
- correr pasos repetitivos de preparación o limpieza.

No son para reemplazar migraciones normales, sino para acompañarlas.

## SQL callbacks: el punto de partida más simple

La forma más simple de empezar es con **callbacks SQL**.

En este enfoque, creás archivos con el nombre del evento.

Por ejemplo:

```text
beforeMigrate.sql
afterMigrate.sql
afterMigrateError.sql
```

Cuando Flyway entra en ese punto del ciclo, ejecuta el script correspondiente.

## Dónde se ubican

Los callbacks pueden ubicarse en rutas configuradas específicamente para callbacks. Si no configurás `callbackLocations`, Flyway busca callbacks en las mismas `locations` donde busca migraciones.

Una estructura posible sería:

```text
flyway/
├─ sql/
│  ├─ V1__crear_tablas.sql
│  └─ V2__agregar_indices.sql
└─ callbacks/
   ├─ beforeMigrate.sql
   └─ afterMigrate.sql
```

Y en la configuración:

```toml
[flyway]
locations = ["filesystem:sql"]
callbackLocations = ["filesystem:callbacks"]
```

## Primer ejemplo práctico

Supongamos que querés dejar un registro cada vez que termina una migración.

Podrías crear un archivo:

```text
afterMigrate.sql
```

Con contenido como este:

```sql
insert into auditoria_operaciones (evento, fecha)
values ('MIGRATE_OK', current_timestamp);
```

La idea no es que copies exactamente este ejemplo para cualquier motor, sino que entiendas el patrón:

- Flyway termina `migrate`;
- detecta `afterMigrate.sql`;
- ejecuta el callback.

## Un ejemplo antes de migrar

También podrías querer preparar algo antes del proceso.

Por ejemplo:

```text
beforeMigrate.sql
```

```sql
insert into auditoria_operaciones (evento, fecha)
values ('MIGRATE_START', current_timestamp);
```

Esto puede servir para trazabilidad o monitoreo.

## Callbacks con descripción

Además del nombre simple del evento, Flyway permite agregar una descripción.

Por ejemplo:

```text
beforeRepair__limpieza_previa.sql
```

Eso ayuda a que el propósito del callback sea más claro cuando empezás a tener varios.

## Orden de ejecución

Si existen varios callbacks para el mismo evento, Flyway los ejecuta en orden alfanumérico.

Ejemplo:

```text
beforeMigrate__1_preparacion.sql
beforeMigrate__2_log.sql
beforeMigrate__3_validacion.sql
```

Eso te permite controlar una secuencia sin tener que meter todo en un único archivo gigante.

## Diferencia entre callback y migración

Es importante no confundirlos.

### Una migración

- cambia la estructura o los datos versionados del sistema;
- queda registrada en `flyway_schema_history`;
- forma parte del historial evolutivo de la base.

### Un callback

- acompaña una operación del ciclo de Flyway;
- no reemplaza el versionado del esquema;
- sirve para automatizaciones alrededor del proceso.

En otras palabras: **la migración cambia la base; el callback acompaña el proceso**.

## Cuándo conviene usar un callback

Conviene usarlo cuando la tarea:

- está asociada a un momento del ciclo;
- se repite siempre de la misma forma;
- no pertenece al historial versionado principal;
- tiene sentido como automatización transversal.

Ejemplos razonables:

- registrar inicio o fin de una ejecución;
- refrescar objetos derivados;
- ejecutar housekeeping después de migrar;
- disparar acciones técnicas auxiliares.

## Cuándo no conviene usarlo

No conviene usar callbacks para:

- esconder cambios de esquema que deberían ir en migraciones versionadas;
- meter lógica de negocio central;
- reemplazar una buena secuencia de migraciones;
- introducir acciones riesgosas difíciles de auditar.

Si el cambio forma parte de la evolución de la base, normalmente debería estar en una **migración versionada** o, en algunos casos, en una **repeatable migration**.

## SQL callbacks y transacciones

Un punto importante: los callbacks SQL se ejecutan en sus **propias transacciones**, separadas de las transacciones usadas por los comandos SQL de Flyway.

Eso significa que no conviene asumir que forman una sola unidad transaccional con toda la migración.

## Java callbacks

Si SQL no alcanza, también podés usar **callbacks en Java**.

En ese caso implementás la interfaz `Callback`.

Este enfoque tiene más flexibilidad porque una sola clase puede responder a varios eventos del ciclo.

Eso resulta útil cuando necesitás:

- lógica más compleja;
- integración con otros servicios;
- notificaciones;
- manejo más sofisticado del contexto de ejecución.

## Ejemplo conceptual de Java callback

```java
public class NotificadorMigracion implements Callback {

    @Override
    public boolean supports(Event event, Context context) {
        return event.equals(Event.AFTER_MIGRATE)
            || event.equals(Event.AFTER_MIGRATE_ERROR);
    }

    @Override
    public boolean canHandleInTransaction(Event event, Context context) {
        return true;
    }

    @Override
    public void handle(Event event, Context context) {
        if (event.equals(Event.AFTER_MIGRATE)) {
            System.out.println("Migración exitosa");
        } else {
            System.out.println("Migración con error");
        }
    }

    @Override
    public String getCallbackName() {
        return "NotificadorMigracion";
    }
}
```

No hace falta memorizar esta interfaz ahora. Lo importante es entender que Java te da una capa extra de potencia cuando el callback deja de ser un simple script.

## Dónde se detectan los callbacks Java

Flyway puede detectar callbacks Java desde el classpath. Por defecto escanea `db/callback`, y además se pueden registrar callbacks o paquetes adicionales por configuración.

## Buenas prácticas

### 1. Empezar por SQL cuando alcance

Si la automatización es simple, un callback SQL suele ser suficiente y más fácil de mantener.

### 2. No ocultar migraciones dentro de callbacks

Un callback no debería convertirse en una forma indirecta de cambiar el esquema sin versionado claro.

### 3. Mantenerlos pequeños y claros

Un callback debería tener un propósito puntual.

### 4. Evitar efectos secundarios innecesarios

Cuanta más lógica externa metas, más difícil se vuelve depurar el proceso.

### 5. Probarlos en desarrollo

Como se ejecutan automáticamente en eventos del ciclo, conviene validarlos bien antes de llevarlos a un entorno serio.

## Errores comunes

### Mezclar responsabilidades

Usar callbacks para cambios que debían estar en migraciones normales.

### Crear demasiados callbacks para todo

Eso puede volver opaco el flujo de despliegue.

### No controlar el orden

Si hay varios callbacks para un mismo evento, el orden importa.

### Suponer que todo ocurre en la misma transacción

Esa suposición puede llevar a errores de diseño.

## Ejercicio recomendado

1. Creá una tabla simple de auditoría.
2. Agregá un `beforeMigrate.sql` que registre el inicio.
3. Agregá un `afterMigrate.sql` que registre el final exitoso.
4. Ejecutá `migrate` y revisá el resultado.
5. Probá qué pasa si forzás un error y agregás un `afterMigrateError.sql`.

## Idea clave

Los callbacks te permiten **automatizar acciones alrededor del ciclo de Flyway** sin contaminar tus migraciones principales.

La regla práctica más útil es esta:

- **migraciones para evolucionar la base**;
- **callbacks para acompañar y automatizar el proceso**.

En el próximo tema vamos a cerrar el curso con un **proyecto final integrando todo el flujo de trabajo con Flyway**.
