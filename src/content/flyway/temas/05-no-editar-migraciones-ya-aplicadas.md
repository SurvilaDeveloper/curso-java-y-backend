---
title: "No editar migraciones ya aplicadas y cómo avanzar correctamente"
description: "Por qué no conviene modificar migraciones versionadas ya ejecutadas y cuál es la forma profesional de avanzar creando nuevas versiones."
order: 5
module: "Fundamentos de Flyway"
level: "base"
draft: false
---

# No editar migraciones ya aplicadas y cómo avanzar correctamente

En el tema anterior vimos que Flyway guarda el historial de migraciones en `flyway_schema_history` y que `validate` compara el checksum actual de cada archivo con el que quedó registrado cuando la migración fue ejecutada.

Eso nos lleva a una de las reglas más importantes de todo el trabajo con Flyway:

**si una migración versionada ya fue aplicada, no conviene editarla; lo correcto es crear una nueva migración y avanzar.**

Este principio parece simple, pero en la práctica evita muchísimos problemas.

## Objetivos

Al finalizar este tema deberías poder:

- entender por qué editar una migración ya aplicada genera inconsistencias;
- saber qué problema detecta `validate` cuando cambia un archivo histórico;
- distinguir entre “corregir la historia” y “avanzar con una nueva versión”;
- adoptar una forma profesional de trabajar con cambios de esquema;
- resolver cambios posteriores sin romper el historial.

## La idea central

Flyway trata a las migraciones versionadas como una **historia técnica confiable**.

Por ejemplo:

```text
V1__crear_tabla_productos.sql
V2__agregar_columna_descripcion.sql
V3__crear_indice_en_nombre.sql
```

Cada archivo representa un paso del recorrido de la base.

Cuando una migración versionada ya fue aplicada:

- Flyway registra su versión;
- registra su descripción;
- registra su tipo;
- registra su checksum;
- registra que ese paso ya ocurrió.

Por eso, si más adelante cambiás el contenido de ese archivo, el historial deja de coincidir con la realidad que ya se ejecutó.

## Qué pasa si editás una migración ya aplicada

Supongamos que ya ejecutaste esta migración:

```text
V1__crear_tabla_productos.sql
```

con este contenido:

```sql
CREATE TABLE productos (
    id INTEGER PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    precio DECIMAL(10,2) NOT NULL
);
```

Flyway la aplica y guarda el checksum en `flyway_schema_history`.

Hasta ahí, todo bien.

Pero después decidís editar ese mismo archivo y agregar una columna nueva:

```sql
CREATE TABLE productos (
    id INTEGER PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0
);
```

Ahora aparece un problema:

- la base ya tiene registrada la versión anterior de `V1`;
- el archivo actual ya no es el mismo que se ejecutó;
- el checksum calculado hoy ya no coincide con el checksum guardado en el historial.

Entonces, cuando ejecutes:

```bash
flyway validate
```

Flyway marcará una inconsistencia.

## Por qué Flyway hace esto

No es un capricho.

Flyway protege la integridad del historial.

Si permitiera cambiar libremente migraciones ya aplicadas sin avisar nada, perderías trazabilidad. Ya no sabrías con seguridad:

- qué SQL se ejecutó realmente en cada entorno;
- si desarrollo y producción pasaron por la misma historia;
- si un archivo fue “retocado” después;
- si el equipo está mirando el mismo estado del proyecto.

Justamente por eso existen los checksums.

## La forma correcta de avanzar

Si querés cambiar algo después de haber aplicado `V1`, no modifiques `V1`.

Creá otra migración.

Por ejemplo:

```text
V2__agregar_columna_stock.sql
```

con contenido como este:

```sql
ALTER TABLE productos
ADD COLUMN stock INTEGER NOT NULL DEFAULT 0;
```

De esta forma:

- `V1` sigue representando exactamente lo que pasó;
- `V2` expresa el cambio nuevo;
- el historial sigue siendo verdadero;
- cualquier entorno puede reproducir los pasos en orden.

## Pensar en términos de evolución, no de corrección retroactiva

Una buena forma de internalizar Flyway es esta:

- no estás editando “el estado final ideal” de la base;
- estás construyendo una secuencia de cambios reales;
- cada migración cuenta una parte de la historia.

Eso se parece mucho a cómo pensás el código en Git:

- no reescribís arbitrariamente el pasado compartido;
- agregás nuevos commits;
- el historial mantiene contexto y trazabilidad.

Con Flyway pasa algo muy parecido.

## Caso típico de trabajo diario

Imaginá este flujo:

### Día 1

Creás y aplicás:

```text
V1__crear_tabla_productos.sql
```

### Día 2

Descubrís que también necesitás una descripción.

La opción correcta es:

```text
V2__agregar_columna_descripcion.sql
```

### Día 3

Querés optimizar búsquedas por nombre.

La opción correcta es:

```text
V3__crear_indice_en_nombre.sql
```

Ese recorrido deja una historia clara y profesional.

## Qué problemas genera “arreglar” archivos viejos

Editar migraciones ya aplicadas suele traer problemas como estos:

### 1. Falla la validación

El caso más común.

`validate` detecta que el checksum actual ya no coincide con el aplicado.

### 2. Confusión entre entornos

Quizás en tu máquina local existe un archivo modificado, pero en otro entorno ya se había ejecutado una versión anterior.

Entonces dos bases pueden terminar con historias incompatibles.

### 3. Confusión en el equipo

Otro desarrollador puede bajar el proyecto y asumir que `V1` siempre fue así, cuando en realidad la base compartida ejecutó otra cosa.

### 4. Dificultad para auditar

Si una migración histórica fue cambiada varias veces, deja de ser una fuente confiable de qué pasó realmente.

## ¿Y si todavía nadie la ejecutó?

Acá hay un matiz importante.

Si una migración versionada **todavía no fue aplicada en ningún entorno relevante ni compartido**, en una etapa muy temprana de trabajo puede llegar a corregirse antes de ejecutar nada.

Pero una vez que ya fue aplicada en un entorno persistente o compartido, la práctica recomendada es dejarla intacta y avanzar con otra versión.

## ¿Qué pasa si cambiás el nombre o la descripción?

No solo cambiar el SQL puede causar problemas.

También puede generar validación fallida si alterás:

- la descripción;
- ciertos metadatos ligados al archivo;
- la resolución esperada por Flyway.

Por eso la regla práctica sigue siendo la misma:

**si ya forma parte del historial aplicado, no lo reescribas.**

## Cómo resolver cambios posteriores de manera limpia

Cuando aparece un nuevo requisito, pensá así:

### Cambios estructurales

- agregar columna;
- eliminar columna;
- crear índice;
- agregar clave foránea;
- crear tabla nueva.

Todo eso va naturalmente en una nueva migración versionada.

### Cambios de datos

También pueden resolverse con nuevas migraciones cuando tiene sentido, por ejemplo:

- completar valores nulos;
- migrar datos a una estructura nueva;
- insertar datos de referencia;
- corregir registros concretos.

La clave no es “modificar el pasado”, sino “agregar el próximo paso”.

## Ejemplo correcto vs incorrecto

### Incorrecto

Ya aplicaste:

```text
V2__agregar_columna_descripcion.sql
```

Después decidís que también querías `categoria` y editás el mismo archivo.

Eso rompe la consistencia histórica.

### Correcto

Dejás `V2` intacta y creás:

```text
V3__agregar_columna_categoria.sql
```

Así cada cambio queda separado, revisable y trazable.

## ¿Y si ya cometiste el error?

En un entorno local de práctica, podés revertir el archivo a su contenido original y volver a validar.

En escenarios más delicados, la prioridad no es “forzar que pase”, sino entender primero qué diferencia existe entre:

- el archivo actual del proyecto;
- el historial registrado en la base.

Más adelante veremos `repair`, pero es importante entender algo:

**`repair` no convierte en buena práctica el hecho de haber editado migraciones históricas.**

Primero hay que entender el problema; después, recién si corresponde, evaluar cómo reparar el historial en un entorno controlado.

## Regla mental útil

Podés quedarte con esta frase:

**una migración versionada aplicada es un hecho histórico, no un borrador.**

Cuando adoptás esa forma de pensar, el flujo con Flyway se vuelve mucho más claro.

## Buenas prácticas concretas

- mantené las migraciones versionadas pequeñas y específicas;
- no mezcles demasiados cambios en un solo archivo;
- no renombres ni edites migraciones ya aplicadas en entornos compartidos;
- agregá nuevas versiones para cambios nuevos;
- usá `validate` para detectar inconsistencias antes de seguir avanzando.

## Ejercicio práctico

### Parte 1: flujo correcto

1. asegurate de tener aplicadas `V1` y `V2`;
2. creá una nueva migración:

```text
V3__agregar_columna_stock.sql
```

3. escribí un `ALTER TABLE` simple;
4. ejecutá:

```bash
flyway validate
flyway migrate
flyway info
```

5. comprobá que la nueva migración se aplicó sin alterar la historia previa.

### Parte 2: ver el problema en un entorno descartable

Solo en una base de práctica:

1. modificá temporalmente una migración ya aplicada;
2. ejecutá:

```bash
flyway validate
```

3. observá el error;
4. restaurá el archivo original.

La idea no es adoptar esa práctica, sino ver por qué Flyway la detecta como inconsistencia.

## Resumen

En este tema viste una de las reglas más importantes del trabajo con Flyway:

- las migraciones versionadas se tratan como parte del historial confiable de la base;
- si una migración ya fue aplicada, no conviene editarla;
- los cambios nuevos deben expresarse en nuevas migraciones;
- `validate` ayuda a detectar cuando alguien reescribió parte de esa historia.

Si te quedás con una sola idea, que sea esta:

**en Flyway se avanza hacia adelante; no se corrige el pasado editando archivos ya ejecutados.**

En el próximo tema vamos a seguir profundizando en la evolución incremental del esquema creando nuevas migraciones y encadenando cambios de manera ordenada.
