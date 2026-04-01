---
title: "Repeatable migrations en Flyway"
description: "Qué son las repeatable migrations, cuándo conviene usarlas y cómo se combinan con las migraciones versionadas en un flujo real."
order: 8
module: "Fundamentos de Flyway"
level: "base"
draft: false
---

# Repeatable migrations en Flyway

Hasta ahora trabajamos con la idea más clásica de Flyway: las **migraciones versionadas**.

Ese tipo de archivo se ejecuta **una sola vez** y queda registrado en el historial de la base. Es ideal para cambios incrementales como:

- crear tablas;
- agregar columnas;
- crear índices;
- endurecer restricciones;
- transformar datos en un momento puntual de la evolución del sistema.

Pero existe otro tipo de migración muy importante en Flyway: las **repeatable migrations**.

La meta de este tema es que entiendas:

- qué son;
- cuándo conviene usarlas;
- cómo se nombran;
- en qué se diferencian de las versionadas;
- cómo se ejecutan dentro de `migrate`.

## Objetivos

Al finalizar este tema deberías poder:

- reconocer una repeatable migration;
- nombrarla correctamente;
- entender por qué no usa número de versión;
- decidir cuándo conviene usarla en lugar de una versionada;
- combinar versionadas y repeatables en un mismo proyecto sin confundir sus responsabilidades.

## Qué es una repeatable migration

Una repeatable migration es una migración que **no se ejecuta una sola vez para siempre**.

Flyway la vuelve a aplicar en un `migrate` **cada vez que cambia su checksum**.

Eso la hace útil para objetos cuya definición querés mantener en **un solo archivo fuente** y volver a aplicar cuando el archivo cambie.

## Cómo se nombra

Con la configuración por defecto, una repeatable migration se nombra así:

```text
R__descripcion.sql
```

Por ejemplo:

```text
R__vista_pedidos_resumidos.sql
R__procedimiento_recalcular_totales.sql
R__datos_base_de_roles.sql
```

Fijate en la diferencia con una versionada:

```text
V1__crear_tabla_usuarios.sql
V2__agregar_columna_email.sql
R__vista_usuarios_activos.sql
```

Las repeatables:

- no llevan número de versión;
- usan el prefijo `R` por defecto;
- se identifican por su descripción y su checksum.

## Cuándo conviene usar repeatable migrations

Flyway las recomienda sobre todo para objetos que querés **recrear o actualizar completamente** a partir de una definición mantenida en un único archivo.

Los casos más comunes son:

- vistas;
- funciones;
- procedimientos almacenados;
- packages;
- reinserciones masivas de datos de referencia.

## Por qué no reemplazan a las versionadas

Este es un punto clave.

Las repeatable migrations **no sustituyen** a las versionadas.

Cada una resuelve un problema distinto.

### Versionadas

Sirven para la evolución incremental e histórica del esquema.

Ejemplos:

- crear una tabla;
- agregar una columna;
- mover datos una vez;
- imponer una restricción nueva;
- registrar un cambio puntual que forma parte del historial.

### Repeatables

Sirven para objetos o datos cuya definición querés conservar en un solo archivo y volver a aplicar cuando cambie.

Ejemplos:

- una vista que hoy tiene 4 columnas y mañana 6;
- un procedimiento que necesita una corrección;
- una función que se recompone desde su definición completa;
- una carga completa de datos base controlados.

## Ejemplo con una vista

Supongamos que querés mantener una vista con resumen de pedidos.

Podrías crear este archivo:

```text
R__vista_resumen_pedidos.sql
```

```sql
CREATE OR REPLACE VIEW vista_resumen_pedidos AS
SELECT
    p.id,
    p.numero,
    p.estado,
    p.total,
    c.nombre AS cliente
FROM pedidos p
JOIN clientes c ON c.id = p.cliente_id;
```

La primera vez que ejecutes `flyway migrate`, Flyway aplicará esa repeatable migration.

Si más adelante cambiás su contenido, por ejemplo para agregar una columna nueva:

```sql
CREATE OR REPLACE VIEW vista_resumen_pedidos AS
SELECT
    p.id,
    p.numero,
    p.estado,
    p.total,
    p.fecha_creacion,
    c.nombre AS cliente
FROM pedidos p
JOIN clientes c ON c.id = p.cliente_id;
```

al volver a correr `flyway migrate`, Flyway detectará que cambió el checksum del archivo y la volverá a aplicar.

## El archivo debe poder ejecutarse más de una vez

Este es el cuidado más importante.

Una repeatable migration debe estar escrita de forma que **pueda ejecutarse varias veces sin romper el entorno**.

Por eso suelen aparecer patrones como:

- `CREATE OR REPLACE VIEW ...`
- `CREATE OR REPLACE FUNCTION ...`
- `INSERT ...` en combinación con estrategias controladas de recarga;
- `DELETE + INSERT` o `TRUNCATE + INSERT` cuando realmente corresponde y es seguro.

Si escribís una repeatable que solo sirve la primera vez, probablemente estás usando mal este mecanismo.

## Orden de ejecución dentro de migrate

Dentro de una misma corrida de `migrate`, Flyway sigue una regla clara:

1. primero ejecuta las migraciones versionadas pendientes;
2. después ejecuta las repeatables que hayan cambiado.

Eso es muy útil porque permite que una repeatable dependa de cambios de esquema aplicados justo antes.

Por ejemplo:

- `V10__agregar_columna_fecha_creacion_a_pedidos.sql`
- `R__vista_resumen_pedidos.sql`

Si la vista usa esa columna nueva, el orden natural de `migrate` evita inconsistencias.

## En qué orden se ejecutan las repeatables

Si hay varias repeatables pendientes de reaplicación, Flyway las ejecuta según su **descripción**, es decir, en orden alfabético por la parte descriptiva del nombre.

Por eso conviene poner nombres claros y previsibles.

Ejemplo:

```text
R__datos_base_de_roles.sql
R__funcion_calcular_descuento.sql
R__vista_resumen_pedidos.sql
```

## Cuándo no conviene usar una repeatable

No conviene usar este tipo de migración para todo.

Por ejemplo, suele ser mala idea usarla para:

- cambios históricos que deben quedar fijados una sola vez;
- alteraciones estructurales incrementales del esquema;
- correcciones de datos que solo debían ocurrir en un momento específico;
- scripts que no toleran una segunda ejecución.

En esos casos, lo correcto suele ser una migración versionada.

## Regla práctica para decidir

Podés usar esta regla mental:

### Usá versionada si...

- el cambio forma parte del historial paso a paso;
- debe ejecutarse una sola vez;
- representa una evolución concreta del esquema o de los datos.

### Usá repeatable si...

- querés mantener una definición completa en un solo archivo;
- ese archivo puede cambiar con el tiempo;
- necesitás que Flyway lo reaplique cuando cambie;
- el contenido puede ejecutarse varias veces de forma segura.

## Ejemplo de combinación sana

Un flujo muy razonable podría ser este:

```text
V1__crear_tablas_iniciales.sql
V2__agregar_relacion_entre_clientes_y_pedidos.sql
V3__agregar_columna_fecha_creacion.sql
R__vista_resumen_pedidos.sql
R__funcion_total_con_impuestos.sql
```

Las versionadas construyen el historial.

Las repeatables mantienen actualizados objetos derivados o reutilizables.

## Errores comunes

### 1. Usar repeatables para todo

Eso borra la idea de evolución histórica y hace más difícil entender cómo llegó la base a su estado actual.

### 2. Escribir una repeatable que no soporta una segunda ejecución

Por ejemplo, un `CREATE VIEW` sin `OR REPLACE`, o inserciones que duplican datos en cada reaplicación.

### 3. Mezclar datos transitorios con datos de referencia estables

Las repeatables pueden servir para recargar datos base, pero no para cualquier dato de negocio que cambie día a día.

### 4. Suponer que el orden entre repeatables es arbitrario

No lo es. Conviene nombrarlas de forma clara porque Flyway las ordena por descripción.

## Buenas prácticas

- mantené las versionadas para la evolución histórica del esquema;
- reservá las repeatables para definiciones completas que puedan reaplicarse;
- escribí repeatables idempotentes o seguras para múltiples ejecuciones;
- usá `CREATE OR REPLACE` cuando el motor lo permita;
- evitá meter lógica ambigua o dependencias frágiles entre repeatables;
- revisá `flyway info` para ver cómo Flyway interpreta el estado de cada migración.

## Ejercicio práctico

1. Creá una base de prueba.
2. Prepará dos migraciones versionadas:
   - `V1__crear_tabla_clientes.sql`
   - `V2__crear_tabla_pedidos.sql`
3. Creá una repeatable:
   - `R__vista_resumen_pedidos.sql`
4. Ejecutá `flyway migrate`.
5. Consultá la vista y verificá que exista.
6. Editá la repeatable para agregar una columna más en el `SELECT`.
7. Ejecutá otra vez `flyway migrate`.
8. Confirmá que Flyway detectó el cambio y reaplicó la migración.

## Cierre

Las repeatable migrations son una herramienta muy útil cuando querés mantener ciertos objetos o conjuntos de datos en **un único archivo vivo**, sin inventar una nueva versión numérica cada vez que cambia su definición.

La clave es no confundirlas con las versionadas.

- Las **versionadas** cuentan la historia.
- Las **repeatables** mantienen actualizadas definiciones reaplicables.

Cuando entendés bien esa diferencia, el diseño de tus migraciones se vuelve mucho más claro y profesional.

## Próximo tema

En el siguiente tema vamos a profundizar en **el orden de ejecución entre migraciones versionadas y repeatables**, para que entiendas cómo piensa Flyway cuando encuentra varios cambios pendientes en una misma corrida.
