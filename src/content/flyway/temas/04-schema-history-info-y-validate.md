---
title: "Schema history, info y validate"
description: "Cómo funciona la tabla flyway_schema_history, qué muestra el comando info y qué verifica validate en un flujo real con Flyway."
order: 4
module: "Fundamentos de Flyway"
level: "base"
draft: false
---

# Schema history, info y validate

En el tema anterior creaste y ejecutaste tu primera migración versionada.

Ahora toca entender **cómo sabe Flyway qué ya se aplicó**, **cómo inspeccionar el estado del proyecto** y **cómo detectar inconsistencias antes de que se conviertan en problemas**.

Este tema gira alrededor de tres piezas clave:

- la tabla `flyway_schema_history`;
- el comando `info`;
- el comando `validate`.

## Objetivos

Al finalizar este tema deberías poder:

- entender para qué existe `flyway_schema_history`;
- saber qué registra Flyway cuando aplica migraciones;
- usar `flyway info` para ver el estado del proyecto;
- usar `flyway validate` para detectar problemas de consistencia;
- comprender por qué no conviene editar migraciones ya aplicadas.

## La tabla `flyway_schema_history`

Cuando ejecutás `flyway migrate`, Flyway necesita dejar evidencia de lo que hizo.

Para eso crea una tabla especial llamada, por defecto:

```text
flyway_schema_history
```

Esa tabla funciona como el historial de migraciones de la base.

Su propósito no es guardar datos de negocio, sino registrar información técnica sobre:

- qué migraciones se aplicaron;
- en qué orden;
- cuándo se ejecutaron;
- si fueron exitosas o no;
- qué checksum tenían;
- qué estado tiene cada migración.

Dicho de forma simple: **es la memoria de Flyway**.

## Qué guarda esta tabla

Aunque los detalles pueden variar según versión y motor, la idea general es que Flyway registra cosas como:

- versión de la migración;
- descripción;
- tipo de migración;
- nombre del archivo;
- checksum;
- usuario que la ejecutó;
- fecha/hora de ejecución;
- tiempo que tardó;
- estado final.

Gracias a eso, cuando vuelves a correr Flyway, la herramienta puede comparar:

- lo que hay en tus archivos del proyecto;
- lo que ya figura como aplicado en la base.

Y así decidir si debe migrar, validar, informar un error o no hacer nada.

## Dónde se crea

Por defecto, Flyway crea `flyway_schema_history` en el esquema por defecto de la conexión o en el `defaultSchema` configurado.

Además, el nombre de la tabla puede personalizarse, pero para aprender conviene dejar el valor por defecto.

## Cómo verla en la base

Si tu motor lo permite, después de ejecutar migraciones podés inspeccionarla con una consulta simple:

```sql
SELECT *
FROM flyway_schema_history
ORDER BY installed_rank;
```

No hace falta memorizar todas las columnas ahora.

Lo importante es que entiendas que **Flyway no “adivina” el estado de la base**: lo controla mediante esta tabla.

## Qué hace `flyway info`

El comando:

```bash
flyway info
```

muestra el estado general de las migraciones conocidas por Flyway.

Es uno de los comandos más útiles para revisar rápidamente qué está pasando.

### Para qué sirve

Con `info` podés ver, por ejemplo:

- qué migraciones ya fueron aplicadas;
- cuáles están pendientes;
- si existe alguna migración que no se pudo resolver;
- si una repeatable está desactualizada;
- qué versión tiene actualmente la base.

No modifica nada. Solo informa.

## Cómo pensar `info`

Podés verlo como un panel de diagnóstico.

Si `migrate` ejecuta cambios, `info` te ayuda a responder preguntas como estas:

- ¿La versión 1 ya está aplicada?
- ¿La versión 2 sigue pendiente?
- ¿Flyway está viendo mis archivos?
- ¿Hay algo raro entre el proyecto y la base?

## Estados comunes que podés encontrar

Según el caso, `info` puede mostrar distintos estados. Algunos de los más importantes son:

- `Pending`: la migración existe, pero todavía no fue aplicada;
- `Success`: la migración se aplicó correctamente;
- `Failed`: la migración falló;
- `Missing`: figura en el historial, pero Flyway ya no la encuentra entre los archivos disponibles;
- `Future`: la base tiene una migración que tu entorno local todavía no conoce;
- `Outdated`: una repeatable cambió y debería volver a ejecutarse.

No hace falta dominar todos los estados desde ya, pero sí acostumbrarte a mirar `info` como primera herramienta de inspección.

## Qué hace `flyway validate`

El comando:

```bash
flyway validate
```

comprueba que las migraciones disponibles en tu proyecto sean consistentes con las que ya fueron aplicadas en la base.

En otras palabras, verifica que la historia de migraciones siga siendo confiable.

## Qué valida exactamente

En especial, `validate` revisa cosas como estas:

- que una migración aplicada siga existiendo;
- que su nombre esperado coincida;
- que su versión y descripción sean correctas;
- que el checksum actual coincida con el checksum guardado cuando se aplicó.

Este último punto es clave.

## Qué es el checksum

Cuando Flyway ejecuta una migración SQL, calcula un checksum del contenido del archivo y lo guarda en `flyway_schema_history`.

Más adelante, si corrés `validate`, Flyway vuelve a calcular el checksum del archivo actual y lo compara con el que quedó registrado.

Si no coinciden, eso indica que el archivo fue modificado después de haberse aplicado.

Y ahí aparece una señal de alerta.

## La regla profesional más importante

**No edites migraciones versionadas que ya fueron aplicadas en una base compartida o importante.**

Si ya existe una `V1` aplicada y necesitás hacer un cambio, lo correcto es crear una nueva migración:

```text
V2__agregar_columna_stock.sql
```

No reescribir la historia.

## Ejemplo de problema típico

Supongamos que ya aplicaste:

```text
V1__crear_tabla_productos.sql
```

Después de eso, alguien cambia el archivo y le agrega una columna.

La base ya tiene registrada una versión anterior de `V1`, pero el archivo ahora tiene otro contenido.

Entonces `validate` detectará que el checksum cambió y marcará un error.

Eso es correcto: está protegiéndote de una inconsistencia.

## Secuencia práctica recomendada

Un flujo básico y sano puede verse así:

1. creás una nueva migración;
2. corrés `flyway validate`;
3. corrés `flyway migrate`;
4. corrés `flyway info` para revisar el estado.

En muchos proyectos, además, `validate` forma parte del flujo normal antes de migrar o desplegar.

## Ejemplo simple de trabajo

Imaginá que ya tenés estas migraciones en tu carpeta:

```text
migrations/
├─ V1__crear_tabla_productos.sql
└─ V2__agregar_columna_descripcion.sql
```

Después de aplicar ambas, `flyway info` debería mostrar algo equivalente a que:

- `V1` está aplicada;
- `V2` está aplicada;
- no hay migraciones pendientes.

Si luego agregás:

```text
V3__crear_indice_nombre.sql
```

antes de migrarla, `info` debería mostrar `V3` como pendiente.

## Diferencia entre `info` y `validate`

Es importante no mezclarlos.

### `info`

Sirve para **ver el estado** de las migraciones.

### `validate`

Sirve para **comprobar consistencia** entre archivos e historial.

Uno informa.
El otro verifica.

Los dos se complementan.

## Errores comunes en esta etapa

### 1. No mirar nunca `info`

Muchos problemas se detectan rápido simplemente revisando el estado antes de seguir avanzando.

### 2. Editar `V1`, `V2` o `V3` como si fueran archivos comunes

Una migración aplicada no debe tratarse como un archivo cualquiera. Pasa a formar parte de la historia del sistema.

### 3. Borrar scripts viejos del proyecto

Si los borrás pero siguen figurando en `flyway_schema_history`, después aparecerán inconsistencias.

### 4. Confiar solo en “si compila”

Que el proyecto arranque no significa que la historia de migraciones sea correcta.

## Ejercicio práctico

### Parte 1: inspeccionar el historial

1. Asegurate de haber aplicado al menos `V1` y `V2`.
2. Ejecutá:

```bash
flyway info
```

3. Observá qué migraciones aparecen como aplicadas y cuáles como pendientes.
4. Consultá la tabla `flyway_schema_history` desde tu motor de base de datos.

### Parte 2: agregar una nueva migración

1. Creá:

```text
V3__crear_indice_en_nombre.sql
```

2. Escribí un cambio simple, por ejemplo un índice.
3. Ejecutá:

```bash
flyway info
```

4. Confirmá que `V3` aparece como pendiente.
5. Ejecutá:

```bash
flyway migrate
```

6. Volvé a correr:

```bash
flyway info
```

7. Confirmá que ahora `V3` figura como aplicada.

### Parte 3: validar consistencia

En un entorno de práctica local y descartable:

1. modificá temporalmente una migración ya aplicada;
2. ejecutá:

```bash
flyway validate
```

3. observá el error de checksum;
4. restaurá el archivo a su estado original.

Este ejercicio no es para adoptar esa práctica, sino para **ver por qué Flyway la considera riesgosa**.

## Resumen

En este tema aprendiste tres piezas esenciales del trabajo con Flyway:

- `flyway_schema_history` registra la historia técnica de las migraciones;
- `info` te permite inspeccionar el estado del proyecto;
- `validate` detecta inconsistencias entre los archivos y lo que ya fue aplicado.

Si te quedás con una sola idea, que sea esta:

**en Flyway, la historia de migraciones importa tanto como el SQL que escribís.**

En el próximo tema vamos a profundizar en una regla clave del trabajo diario: por qué no conviene editar migraciones ya ejecutadas y cómo avanzar correctamente creando nuevas versiones.
