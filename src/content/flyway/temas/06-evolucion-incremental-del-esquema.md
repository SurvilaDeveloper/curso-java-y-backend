---
title: "Evolución incremental del esquema con nuevas migraciones"
description: "Cómo encadenar cambios con V2, V3 y V4 para hacer crecer el esquema de forma ordenada y trazable."
order: 6
module: "Fundamentos de Flyway"
level: "base"
draft: false
---

# Evolución incremental del esquema con nuevas migraciones

En el tema anterior vimos una regla clave: **si una migración versionada ya fue aplicada, no conviene editarla; hay que avanzar con una nueva versión**.

Ahora vamos a trabajar esa idea de forma más práctica.

La meta de este tema es que puedas pensar la base de datos como una secuencia de cambios pequeños y ordenados. En lugar de imaginar “la tabla final perfecta”, vas a aprender a construirla paso a paso con nuevas migraciones versionadas.

Eso es exactamente lo que Flyway espera de un proyecto real.

## Objetivos

Al finalizar este tema deberías poder:

- entender qué significa evolucionar el esquema de forma incremental;
- encadenar varias migraciones versionadas sin romper el historial;
- decidir cuándo crear `V2`, `V3` o `V4`;
- separar cambios en pasos pequeños y trazables;
- aplicar una secuencia de migraciones y verificar su estado con Flyway.

## La idea central

Trabajar con Flyway no consiste en escribir una sola migración enorme con todo lo que imaginás que la base va a necesitar.

Consiste en hacer esto:

1. crear una primera versión del esquema;
2. detectar nuevos requisitos;
3. expresar cada cambio en una nueva migración;
4. dejar que Flyway ejecute los pasos pendientes en orden.

Esa forma de trabajar tiene varias ventajas:

- mantiene una historia clara;
- evita reescribir el pasado;
- hace que cada cambio sea revisable;
- facilita entender por qué el esquema llegó al estado actual.

## Pensar en versiones sucesivas

Supongamos que empezás con esta migración inicial:

```text
V1__crear_tabla_productos.sql
```

con un contenido como este:

```sql
CREATE TABLE productos (
    id INTEGER PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    precio DECIMAL(10,2) NOT NULL
);
```

Esa es tu primera versión del esquema.

Pero el proyecto evoluciona.

### Nuevo requisito 1

Ahora querés guardar el stock.

No editás `V1`.

Creás:

```text
V2__agregar_columna_stock.sql
```

```sql
ALTER TABLE productos
ADD COLUMN stock INTEGER NOT NULL DEFAULT 0;
```

### Nuevo requisito 2

Después querés clasificar productos.

Creás:

```text
V3__agregar_columna_categoria.sql
```

```sql
ALTER TABLE productos
ADD COLUMN categoria VARCHAR(80);
```

### Nuevo requisito 3

Más adelante necesitás mejorar búsquedas por nombre.

Creás:

```text
V4__crear_indice_en_nombre.sql
```

```sql
CREATE INDEX idx_productos_nombre
ON productos(nombre);
```

Fijate en la lógica:

- `V1` crea la tabla;
- `V2` agrega stock;
- `V3` agrega categoría;
- `V4` agrega un índice.

Cada archivo expresa **un paso concreto de evolución**.

## Qué gana tu proyecto con esta forma de trabajo

### 1. Historia entendible

Cualquier persona del equipo puede mirar las migraciones y reconstruir cómo fue creciendo la base.

### 2. Cambios acotados

Un cambio pequeño es más fácil de revisar y probar que una migración gigante.

### 3. Mejor trazabilidad

Si algo salió mal, es más simple detectar en qué paso se introdujo el cambio.

### 4. Entornos consistentes

Flyway compara lo que ya fue aplicado con lo que todavía falta y ejecuta las migraciones pendientes en orden.

## No pensar en “estado final”, sino en “próximo paso”

Este cambio mental es importante.

Muchas veces, cuando alguien diseña una tabla, intenta dejarla perfecta de una sola vez. En proyectos reales eso rara vez ocurre.

Lo normal es que aparezcan requisitos nuevos:

- una columna extra;
- un índice;
- una restricción nueva;
- una tabla relacionada;
- un ajuste de datos.

Con Flyway, cada una de esas necesidades se transforma en una migración nueva.

La pregunta correcta no es:

**“¿cómo debería verse la tabla ideal definitiva?”**

La pregunta correcta es:

**“¿cuál es el próximo cambio que debo registrar de forma clara y versionada?”**

## Ejemplo completo de evolución

Imaginá una aplicación simple de catálogo.

### Paso 1: estructura mínima

```text
V1__crear_tabla_productos.sql
```

```sql
CREATE TABLE productos (
    id INTEGER PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    precio DECIMAL(10,2) NOT NULL
);
```

### Paso 2: agregar stock

```text
V2__agregar_columna_stock.sql
```

```sql
ALTER TABLE productos
ADD COLUMN stock INTEGER NOT NULL DEFAULT 0;
```

### Paso 3: agregar categoría

```text
V3__agregar_columna_categoria.sql
```

```sql
ALTER TABLE productos
ADD COLUMN categoria VARCHAR(80);
```

### Paso 4: índice para búsquedas

```text
V4__crear_indice_en_nombre.sql
```

```sql
CREATE INDEX idx_productos_nombre
ON productos(nombre);
```

### Resultado

La tabla final no apareció mágicamente en un solo script.

Apareció como resultado de una secuencia ordenada de decisiones.

Y eso deja una historia técnica muchísimo más profesional.

## Qué conviene poner en una migración

Una buena regla práctica es que cada migración tenga un propósito claro.

Por ejemplo:

- crear una tabla;
- agregar una columna;
- crear un índice;
- agregar una foreign key;
- insertar datos iniciales;
- mover o corregir ciertos datos.

No hace falta obsesionarse con que todas tengan exactamente el mismo tamaño, pero sí conviene evitar archivos que mezclen demasiadas cosas sin relación.

## Cuándo dividir en varias migraciones

Conviene separar migraciones cuando:

- los cambios responden a objetivos distintos;
- querés revisar cada paso con claridad;
- el cambio de datos depende de un cambio estructural previo;
- necesitás aislar mejor posibles errores.

Por ejemplo, esto suele ser más claro:

```text
V5__agregar_columna_slug.sql
V6__completar_slug_en_productos_existentes.sql
V7__crear_indice_unico_en_slug.sql
```

que meter todo en un único archivo enorme.

## Flujo práctico recomendado

Cuando agregás una nueva migración, un flujo simple y sano puede ser este:

1. crear el archivo con la próxima versión;
2. escribir un cambio puntual y claro;
3. ejecutar `flyway validate`;
4. ejecutar `flyway migrate`;
5. revisar el estado con `flyway info`.

Ejemplo:

```bash
flyway validate
flyway migrate
flyway info
```

## Qué deberías observar con `info`

Si ya aplicaste `V1`, `V2`, `V3` y `V4`, al ejecutar:

```bash
flyway info
```

deberías ver que esas migraciones figuran como aplicadas y que no quedan pendientes.

Si luego creás:

```text
V5__agregar_columna_slug.sql
```

antes de migrar, `info` debería mostrar esa nueva versión como pendiente.

Después de `migrate`, debería pasar a figurar como aplicada.

## Error común: juntar demasiadas decisiones en una sola migración

Supongamos que querés hacer todo esto junto:

- agregar columna `slug`;
- poblarla para registros existentes;
- crear índice único;
- corregir productos duplicados;
- insertar datos nuevos.

A veces todo eso dentro de un solo archivo vuelve más difícil:

- entender qué cambió;
- detectar el origen de un error;
- revisar el script;
- mantener la historia clara.

Muchas veces conviene partirlo en varios pasos.

## Error común: crear migraciones “por impulso” sin orden lógico

También puede pasar lo contrario: crear archivos sin una idea clara de secuencia.

Por ejemplo:

```text
V8__indice.sql
V9__tabla_categorias.sql
V10__foreign_key_categoria.sql
```

Ese orden puede ser correcto o no, según el caso. Lo importante es que la secuencia tenga sentido.

Si una migración depende de otra, el orden debe reflejar esa dependencia.

## Cómo pensar cambios dependientes

Un esquema útil es este:

### Primero

crear o modificar la estructura base;

### después

migrar o completar datos si hace falta;

### al final

agregar restricciones o índices que dependen del estado correcto de los datos.

Ese enfoque suele reducir fricciones.

## Ejercicio práctico

### Parte 1: construir una evolución simple

Partiendo de una base vacía:

1. creá `V1__crear_tabla_productos.sql`;
2. aplicala con `flyway migrate`;
3. creá `V2__agregar_columna_stock.sql`;
4. creá `V3__agregar_columna_categoria.sql`;
5. creá `V4__crear_indice_en_nombre.sql`.

Después ejecutá:

```bash
flyway validate
flyway migrate
flyway info
```

Y comprobá que Flyway registra cada paso en el historial.

### Parte 2: pensar una evolución realista

Inventá una tabla para una aplicación propia, por ejemplo:

- usuarios;
- órdenes;
- publicaciones;
- productos;
- clientes.

Luego diseñá una secuencia de tres o cuatro migraciones sucesivas.

La idea no es hacer una tabla perfecta desde el inicio, sino practicar cómo evoluciona.

## Buenas prácticas de este tema

- pensá cada migración como un paso de evolución;
- mantené las migraciones relativamente pequeñas y específicas;
- evitá mezclar demasiados cambios sin relación;
- creá nuevas versiones en lugar de reescribir las ya aplicadas;
- revisá siempre el estado del historial después de migrar.

## Resumen

En este tema viste que Flyway funciona mucho mejor cuando pensás la base como una historia incremental:

- `V1` crea la base inicial;
- `V2`, `V3`, `V4` y las siguientes expresan cambios posteriores;
- cada migración representa un paso concreto;
- el resultado final surge de la suma ordenada de esos pasos.

Esta forma de trabajar te ayuda a mantener trazabilidad, claridad y consistencia entre entornos.

Si te quedás con una sola idea, que sea esta:

**en Flyway no diseñás el esquema final de una sola vez; lo hacés crecer con migraciones pequeñas, ordenadas y versionadas.**

En el próximo tema vamos a pasar de la evolución estructural a otro tipo de cambio muy común: **las migraciones de datos** y cuándo conviene incluirlas.
