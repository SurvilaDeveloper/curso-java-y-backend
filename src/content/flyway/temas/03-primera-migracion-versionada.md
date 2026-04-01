---
title: "Primera migración versionada"
description: "Cómo crear una migración versionada en Flyway, nombrarla correctamente y ejecutarla por primera vez con migrate."
order: 3
module: "Fundamentos de Flyway"
level: "intro"
draft: false
---

# Primera migración versionada

En el tema anterior dejamos listo el entorno de trabajo con Flyway CLI.

Ahora vamos a dar el paso más importante del curso: **crear y ejecutar la primera migración versionada**.

Este es el momento en el que Flyway deja de ser solo una herramienta instalada y empieza a convertirse en parte real del flujo de trabajo de tu base de datos.

## Objetivos

Al finalizar este tema deberías poder:

- entender qué es una migración versionada;
- nombrarla correctamente;
- escribir un primer script SQL;
- ejecutar `flyway migrate`;
- comprender qué hace Flyway al aplicar la migración.

## Qué es una migración versionada

Una **migración versionada** es un script que representa un cambio concreto en la base de datos y que Flyway aplicará **una sola vez**, en el orden definido por su versión.

En términos prácticos, una migración versionada sirve para:

- crear tablas;
- agregar columnas;
- modificar restricciones;
- crear índices;
- insertar ciertos datos iniciales o de referencia.

La idea es que cada cambio importante del esquema quede registrado como parte de la historia del proyecto.

## Cómo se nombra

Flyway espera que las migraciones versionadas sigan un patrón como este:

```text
V1__crear_tabla_productos.sql
```

Ese nombre tiene tres partes:

- `V`: indica que es una migración versionada;
- `1`: es la versión;
- `crear_tabla_productos`: es la descripción.

Podés usar otras versiones como `V2__...sql`, `V3__...sql` o incluso formatos más detallados como `V1_1__...sql`, pero para empezar conviene usar una numeración simple y creciente.

## Nuestra primera migración

Dentro de la carpeta `migrations/`, creá este archivo:

```text
migrations/
└─ V1__crear_tabla_productos.sql
```

Y adentro escribí algo así:

```sql
CREATE TABLE productos (
    id INTEGER PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    precio DECIMAL(10,2) NOT NULL
);
```

Este script crea una tabla simple llamada `productos`.

No hace falta que la tabla sea compleja. Lo importante acá es entender el mecanismo.

## Ejecutar la migración

Con el archivo creado, ejecutá:

```bash
flyway migrate
```

Cuando Flyway corre este comando, hace varias cosas:

1. busca migraciones en las `locations` configuradas;
2. detecta cuáles todavía no fueron aplicadas;
3. las ordena por versión;
4. ejecuta las pendientes;
5. registra el resultado en su historial.

## Qué pasa al correr `migrate`

La primera vez que ejecutes `flyway migrate`, normalmente va a ocurrir esto:

- Flyway detectará la migración `V1__crear_tabla_productos.sql`;
- ejecutará el SQL;
- creará su tabla de historial si todavía no existe;
- registrará que la versión `1` ya fue aplicada.

Ese registro es clave, porque evita que la misma migración vuelva a ejecutarse en futuros `migrate`.

## La idea central: una vez aplicada, no se toca

Este punto es muy importante.

Si una migración versionada ya fue aplicada en una base real, **no conviene editarla**.

¿Por qué?

Porque Flyway guarda información para verificar que el archivo siga siendo el mismo. Si cambiás una migración ya aplicada, después aparecerán inconsistencias de validación.

La práctica profesional correcta no es “corregir la historia”, sino **crear una nueva migración** que avance desde el estado actual.

Por ejemplo, si después querés agregar una columna `stock`, no deberías editar `V1__crear_tabla_productos.sql`. Deberías crear otra migración, por ejemplo:

```text
V2__agregar_columna_stock.sql
```

## Cómo pensar las migraciones

Una migración no debería representar “todo el proyecto”, sino **un cambio puntual y entendible**.

Buenas ideas para una migración:

- crear una tabla;
- agregar una columna;
- crear un índice;
- cargar datos de referencia bien delimitados.

Malas ideas para una migración:

- meter cambios enormes y difíciles de revisar;
- combinar demasiadas responsabilidades en un solo archivo;
- editar migraciones ya ejecutadas en entornos compartidos.

## Qué ocurre si ejecutás `migrate` otra vez

Si volvés a correr:

```bash
flyway migrate
```

sin haber creado nuevas migraciones, Flyway no debería volver a ejecutar `V1`.

Eso justamente demuestra que la herramienta lleva control de qué ya fue aplicado y qué no.

## Errores comunes en este punto

### 1. Nombrar mal el archivo

Por ejemplo:

```text
crear_tabla.sql
```

Ese archivo no sigue la convención esperada y Flyway no lo tratará como una migración versionada válida.

### 2. Usar una versión repetida

Si ya existe una `V1`, la siguiente no puede volver a ser `V1`.

### 3. Editar la migración después de aplicarla

Esto suele traer problemas cuando más adelante uses validación o compartas el proyecto con otros entornos.

### 4. Crear una migración demasiado grande

Cuanto más concreto es el cambio, más fácil resulta entenderlo, revisarlo y mantenerlo.

## Ejercicio práctico

1. Asegurate de tener configurado tu proyecto Flyway.
2. Creá el archivo `V1__crear_tabla_productos.sql` dentro de `migrations`.
3. Escribí el `CREATE TABLE` de ejemplo.
4. Ejecutá `flyway migrate`.
5. Verificá que la tabla se haya creado.
6. Ejecutá `flyway migrate` una segunda vez y observá que no vuelva a aplicar la misma migración.

## Ejercicio extra

Creá una segunda migración:

```text
V2__agregar_columna_descripcion.sql
```

con este contenido:

```sql
ALTER TABLE productos ADD COLUMN descripcion VARCHAR(255);
```

Después ejecutá otra vez:

```bash
flyway migrate
```

De esa manera vas a ver el flujo natural de evolución de la base: no se reescribe `V1`, se avanza con `V2`.

## Resumen

En este tema viste el núcleo del trabajo con Flyway:

- una migración versionada representa un cambio concreto;
- se nombra siguiendo una convención clara;
- se ejecuta con `flyway migrate`;
- Flyway la aplica una sola vez;
- lo correcto es avanzar con nuevas versiones, no editar las ya aplicadas.

En el próximo tema vamos a profundizar en el historial de migraciones y en cómo inspeccionar el estado del proyecto con herramientas como `info`.
