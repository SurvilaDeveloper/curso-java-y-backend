---
title: "Migraciones de datos: cuándo conviene incluirlas"
description: "Qué son las migraciones de datos, cuándo conviene versionarlas junto al esquema y qué cuidados prácticos tener."
order: 7
module: "Fundamentos de Flyway"
level: "base"
draft: false
---

# Migraciones de datos: cuándo conviene incluirlas

En los temas anteriores trabajamos sobre todo con **cambios de esquema**:

- crear tablas;
- agregar columnas;
- crear índices;
- evolucionar la estructura paso a paso.

Pero en proyectos reales no todo es estructura.

Muchas veces también necesitás cambiar los **datos**:

- cargar valores iniciales;
- corregir registros existentes;
- completar una nueva columna;
- transformar datos para que encajen con un cambio de esquema;
- actualizar catálogos o tablas de referencia.

Flyway también sirve para eso.

La meta de este tema es que entiendas **cuándo conviene incluir cambios de datos en migraciones versionadas** y cuándo tenés que ser más cuidadoso para no mezclar cosas de forma desordenada.

## Objetivos

Al finalizar este tema deberías poder:

- distinguir entre una migración de esquema y una migración de datos;
- reconocer casos en los que conviene versionar cambios de datos;
- escribir migraciones simples con `INSERT`, `UPDATE` o `DELETE` de forma intencional;
- decidir cuándo separar un cambio estructural y un cambio de datos en archivos distintos;
- evitar errores comunes al tocar datos con Flyway.

## Qué es una migración de datos

Una migración de datos es un script que no cambia la forma de la base, sino **el contenido que ya existe dentro de ella**.

Por ejemplo:

- insertar categorías iniciales;
- completar un campo nuevo en filas viejas;
- corregir estados inválidos;
- mover datos de una columna a otra;
- normalizar valores que antes estaban escritos de forma inconsistente.

En Flyway, estos cambios pueden vivir en migraciones SQL igual que los cambios de esquema.

## Esquema y datos no siempre viajan separados

En la práctica, muchas veces un cambio de esquema obliga a hacer luego un cambio de datos.

Por ejemplo:

1. agregás una columna `slug` a una tabla;
2. esa columna queda vacía para los registros ya existentes;
3. necesitás completar su valor;
4. recién después podés crear una restricción `UNIQUE` o un índice útil.

Ahí aparece una idea importante:

**hay cambios de datos que forman parte natural de la evolución del esquema.**

No son “parches sueltos”.

Son parte del cambio versionado del sistema.

## Cuándo sí conviene incluir una migración de datos

Hay varios casos muy comunes.

### 1. Datos iniciales necesarios para que el sistema funcione

Supongamos que tu aplicación necesita una tabla `roles` con ciertos valores mínimos desde el principio.

Podrías crear algo así:

```text
V5__insertar_roles_iniciales.sql
```

```sql
INSERT INTO roles (id, nombre) VALUES (1, 'ADMIN');
INSERT INTO roles (id, nombre) VALUES (2, 'CLIENTE');
INSERT INTO roles (id, nombre) VALUES (3, 'OPERADOR');
```

Eso tiene sentido si esos datos son parte del comportamiento básico del sistema.

### 2. Correcciones necesarias después de un cambio estructural

Supongamos que agregaste una nueva columna:

```text
V6__agregar_columna_activo_a_usuarios.sql
```

```sql
ALTER TABLE usuarios
ADD COLUMN activo BOOLEAN;
```

Ahora necesitás completar el valor para los usuarios ya existentes:

```text
V7__completar_columna_activo_en_usuarios_existentes.sql
```

```sql
UPDATE usuarios
SET activo = TRUE
WHERE activo IS NULL;
```

Después incluso podrías endurecer la estructura:

```text
V8__hacer_activo_not_null.sql
```

```sql
ALTER TABLE usuarios
ALTER COLUMN activo SET NOT NULL;
```

Este es un caso muy sano y frecuente.

### 3. Transformaciones necesarias para conservar consistencia

Imaginá que antes guardabas estados así:

- `pendiente`
- `PENDIENTE`
- `en proceso`
- `En proceso`

Y querés normalizarlos.

Podrías registrar esa corrección en una migración:

```text
V9__normalizar_estados_de_pedidos.sql
```

```sql
UPDATE pedidos
SET estado = 'PENDIENTE'
WHERE estado IN ('pendiente');

UPDATE pedidos
SET estado = 'EN_PROCESO'
WHERE estado IN ('en proceso', 'En proceso');
```

Eso evita que la corrección quede hecha “a mano” y sin trazabilidad.

## Cuándo conviene tener cuidado

Que Flyway permita cambiar datos no significa que cualquier cambio de datos deba ir alegremente a una migración.

Hay casos donde conviene pensar mejor.

### 1. Datos que cambian por entorno

Por ejemplo:

- usuarios reales de producción;
- claves o secretos;
- configuraciones sensibles distintas por ambiente;
- datos de prueba que solo sirven en desarrollo.

Esos casos suelen requerir otro tratamiento.

No conviene meter en una migración común datos que no deberían viajar igual a todos los entornos.

### 2. Datos masivos o muy delicados

Si la modificación afecta millones de filas o tiene impacto operativo fuerte, conviene planificarla con especial cuidado.

La pregunta no es solo “si Flyway puede ejecutarlo”, sino también:

- cuánto tarda;
- qué bloqueos genera;
- si el cambio es seguro;
- si necesita ventanas de mantenimiento;
- cómo validar el resultado.

### 3. Datos puramente transitorios o manuales

A veces hay cambios que responden a una necesidad puntual de negocio y no forman parte de la evolución normal del sistema.

En esos casos hay que pensar si realmente querés que queden en el historial permanente de migraciones.

## Una regla práctica útil

Podés usar esta guía mental:

### Sí suele convenir versionar

- datos iniciales imprescindibles;
- correcciones necesarias para acompañar un cambio de esquema;
- normalizaciones reproducibles;
- datos de referencia controlados.

### Conviene pensarlo mejor

- datos sensibles o distintos por entorno;
- operaciones muy pesadas sobre grandes volúmenes;
- cambios manuales excepcionales sin relación clara con la evolución del sistema.

## Ejemplo completo: esquema + datos + restricción

Imaginá una tabla `productos` que ya existe.

Querés agregar un `slug` único.

### Paso 1: agregar la columna

```text
V10__agregar_columna_slug.sql
```

```sql
ALTER TABLE productos
ADD COLUMN slug VARCHAR(160);
```

### Paso 2: completar el valor en registros existentes

```text
V11__completar_slug_en_productos_existentes.sql
```

```sql
UPDATE productos
SET slug = LOWER(REPLACE(nombre, ' ', '-'))
WHERE slug IS NULL;
```

### Paso 3: agregar restricción

```text
V12__hacer_slug_not_null_y_unico.sql
```

```sql
ALTER TABLE productos
ALTER COLUMN slug SET NOT NULL;

ALTER TABLE productos
ADD CONSTRAINT uq_productos_slug UNIQUE (slug);
```

Este ejemplo muestra algo importante:

- primero cambiás la estructura;
- después adaptás los datos existentes;
- al final agregás la restricción.

Ese orden suele ser mucho más robusto que intentar hacer todo junto sin separar responsabilidades.

## ¿Conviene mezclar esquema y datos en el mismo archivo?

A veces sí, pero muchas veces **es más claro separarlos**.

Por ejemplo, esto:

```text
V13__agregar_columna_codigo.sql
V14__completar_codigo_en_registros_existentes.sql
V15__hacer_codigo_not_null.sql
```

suele ser más entendible que un único archivo enorme que:

- agrega la columna;
- hace varios `UPDATE`;
- corrige excepciones;
- crea índices;
- agrega restricciones.

Separar pasos ayuda a:

- revisar mejor;
- detectar errores;
- entender dependencias;
- dejar una historia más profesional.

## Error común: hacer correcciones manuales fuera de Flyway

Uno de los errores más frecuentes es este:

1. alguien aplica la migración estructural;
2. nota que faltan datos o que hay que corregir filas existentes;
3. entra a la base y ejecuta `UPDATE` manualmente;
4. el cambio nunca queda registrado en el proyecto.

Eso genera varios problemas:

- pérdida de trazabilidad;
- diferencias entre entornos;
- dificultad para reproducir el estado real;
- sorpresas cuando otra persona monta la base desde cero.

Si el cambio debía formar parte de la evolución del sistema, conviene versionarlo.

## Error común: suponer que todos los datos son “semilla”

No todo dato debe cargarse como si fuera inicial.

Una cosa es tener una tabla de estados fijos:

- `PENDIENTE`
- `PAGADO`
- `CANCELADO`

Y otra muy distinta es querer meter en migraciones:

- clientes reales;
- pedidos históricos;
- datos operativos del negocio.

No hay que confundir **datos de referencia controlados** con **datos vivos del sistema**.

## Flujo recomendado para este tipo de cambios

Cuando una nueva versión necesita tocar datos, un flujo sano puede ser:

1. definir qué parte es estructura y qué parte es datos;
2. crear una migración por cada paso importante;
3. ejecutar `flyway validate`;
4. ejecutar `flyway migrate`;
5. revisar con `flyway info`;
6. verificar manualmente que los datos quedaron como esperabas.

Ejemplo:

```bash
flyway validate
flyway migrate
flyway info
```

## Ejercicio práctico

### Parte 1: datos iniciales

Creá una tabla simple para roles o categorías y luego agregá una migración versionada que inserte datos iniciales.

Por ejemplo:

```text
V1__crear_tabla_roles.sql
V2__insertar_roles_iniciales.sql
```

### Parte 2: completar datos existentes

Tomá una tabla ya creada y simulá este flujo:

1. agregá una columna nueva que admita `NULL`;
2. completá su valor con un `UPDATE`;
3. endurecé la restricción con `NOT NULL`.

La meta del ejercicio no es solo que funcione, sino que entiendas por qué el orden importa.

## Buenas prácticas de este tema

- versioná los cambios de datos que formen parte real de la evolución del sistema;
- separá estructura y datos cuando eso mejore claridad;
- evitá correcciones manuales que después nadie pueda reconstruir;
- no metas en migraciones datos sensibles o dependientes de entorno sin pensarlo bien;
- verificá siempre el efecto real de un `UPDATE` o `DELETE` antes de darlo por bueno.

## Resumen

En este tema viste que Flyway no sirve solo para cambiar la estructura de la base.

También puede registrar **cambios de datos** cuando esos cambios forman parte del avance normal del sistema.

La idea importante es esta:

- no todo cambio de datos merece una migración;
- pero los cambios de datos importantes, reproducibles y ligados al esquema sí conviene versionarlos.

Si te quedás con una sola idea, que sea esta:

**cuando un cambio de datos es necesario para que la evolución del sistema sea consistente y repetible, suele valer la pena registrarlo en Flyway.**

En el próximo tema vamos a ver otro recurso muy útil cuando ciertos objetos o datos conviene regenerarlos en lugar de tratarlos como cambios únicos: **las repeatable migrations**.
