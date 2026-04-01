---
title: "Migraciones en Java"
description: "Cuándo conviene usar migraciones en Java en Flyway, cómo crearlas y cómo conviven con las migraciones SQL dentro de un proyecto Java."
order: 18
module: "Integraciones y automatización"
level: "intermedio"
draft: false
---

# Migraciones en Java

Hasta ahora el curso estuvo muy centrado en migraciones SQL, que son la forma más común y más simple de trabajar con Flyway. Pero hay casos en los que SQL no alcanza o no resulta cómodo. Ahí entran las **migraciones en Java**.

La idea es sencilla: en lugar de escribir un archivo `.sql`, escribís una clase Java que Flyway detecta y ejecuta como una migración más. Eso te permite usar lógica imperativa, recorrer registros, transformar datos con reglas más complejas y apoyarte en todo el ecosistema del lenguaje.

## Qué vas a aprender

En este tema vas a ver:

- cuándo conviene usar migraciones en Java;
- qué diferencias tienen respecto de las migraciones SQL;
- cómo crear una clase de migración;
- cómo nombrarla para que Flyway la detecte;
- cómo convive este enfoque con migraciones SQL normales.

## Cuándo conviene usar migraciones en Java

Las migraciones SQL deberían seguir siendo tu primera opción cuando el cambio puede expresarse de forma clara en SQL.

Por ejemplo:

- crear tablas;
- agregar columnas;
- crear índices;
- insertar datos iniciales simples;
- actualizar pocos registros con reglas fáciles de expresar.

Las migraciones en Java empiezan a tener sentido cuando necesitás algo más elaborado, como por ejemplo:

- recalcular datos con lógica compleja;
- leer registros, transformarlos y volver a persistirlos;
- trabajar con BLOBs o CLOBs;
- aplicar reglas de negocio que serían muy difíciles de mantener en SQL puro;
- reutilizar utilidades Java dentro de una migración.

En resumen: **SQL para cambios declarativos y directos; Java para lógica compleja**.

## Qué necesita Flyway para detectar una migración en Java

Para que Flyway la reconozca, la migración debe:

- estar en una ubicación que Flyway escanee;
- compilarse antes de ejecutar `migrate`;
- respetar la convención de nombres;
- implementar la interfaz adecuada o extender una clase base de Flyway.

La opción más cómoda suele ser heredar de `BaseJavaMigration`.

## Convención de nombres

Las migraciones Java siguen la misma idea general que las migraciones SQL, pero sin el sufijo `.sql`.

Ejemplos válidos:

```text
V1__crear_tabla_cliente.sql
V2__agregar_columna_email.sql
V3__normalizar_codigos_de_producto.java
```

En Java, la clase y el archivo deben usar ese patrón de versión y descripción.

Por ejemplo:

```text
V3__normalizar_codigos_de_producto.java
```

Y la clase:

```java
public class V3__normalizar_codigos_de_producto extends BaseJavaMigration {
    ...
}
```

## Estructura típica dentro de un proyecto Maven o Gradle

Una organización muy común es esta:

```text
src/
├─ main/
│  ├─ java/
│  │  └─ db/
│  │     └─ migration/
│  │        └─ V3__normalizar_codigos_de_producto.java
│  └─ resources/
│     └─ db/
│        └─ migration/
│           ├─ V1__crear_tabla_producto.sql
│           └─ V2__insertar_productos_base.sql
```

Así, las migraciones SQL y Java conviven dentro del mismo proyecto.

## Ejemplo de una migración en Java

Supongamos que ya tenés una tabla `producto` y querés normalizar el código de cada producto para:

- quitar espacios al inicio y al final;
- pasarlo a mayúsculas;
- reemplazar espacios internos por guiones.

Podrías escribir una migración en Java como esta:

```java
package db.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

public class V3__normalizar_codigos_de_producto extends BaseJavaMigration {

    @Override
    public void migrate(Context context) throws Exception {
        try (
            Statement select = context.getConnection().createStatement();
            ResultSet rs = select.executeQuery("select id, codigo from producto where codigo is not null")
        ) {
            while (rs.next()) {
                long id = rs.getLong("id");
                String codigo = rs.getString("codigo");

                String normalizado = codigo
                    .trim()
                    .toUpperCase()
                    .replace(" ", "-");

                try (PreparedStatement update = context.getConnection().prepareStatement(
                    "update producto set codigo = ? where id = ?"
                )) {
                    update.setString(1, normalizado);
                    update.setLong(2, id);
                    update.executeUpdate();
                }
            }
        }
    }
}
```

## Qué hace este ejemplo

La migración:

1. consulta todos los productos con código no nulo;
2. recorre los resultados uno por uno;
3. transforma el valor en memoria;
4. actualiza cada registro.

Esto se podría intentar hacer en SQL, pero dependiendo de la lógica y de la portabilidad que busques, Java puede resultar mucho más claro.

## Cómo se ejecuta

Desde el punto de vista de Flyway, una migración Java participa del flujo normal.

Si su versión está pendiente, `migrate` la ejecuta igual que una migración SQL.

Por ejemplo:

```bash
mvn flyway:migrate
```

O en Gradle:

```bash
gradle flywayMigrate
```

Flyway la registra en `flyway_schema_history`, igual que al resto de las migraciones.

## Diferencias frente a SQL

### Ventajas

- permite lógica más compleja;
- da más control sobre la transformación de datos;
- puede resultar más mantenible para ciertos casos;
- permite reutilizar herramientas del lenguaje Java.

### Desventajas

- es más verbosa que SQL;
- exige compilación previa;
- puede ser menos transparente para revisar rápidamente;
- si abusás de este enfoque, el historial de migraciones puede volverse más difícil de auditar.

## Cuándo no conviene usar Java

No conviene pasar a Java por costumbre o por comodidad personal si el cambio se resuelve fácilmente con SQL.

Por ejemplo, esto **no** justificaría una migración Java:

- crear una tabla;
- agregar una columna simple;
- crear un índice común;
- insertar un pequeño conjunto de datos fijos;
- actualizar registros con una sentencia SQL clara.

En esos casos, SQL sigue siendo la mejor opción por simplicidad y legibilidad.

## Buenas prácticas

### 1. Usar Java solo cuando realmente aporta valor

No conviertas todas las migraciones en clases. Reservá este recurso para los casos donde mejora de verdad la claridad o la capacidad de implementación.

### 2. Mantener nombres descriptivos

La descripción de la clase tiene que dejar claro qué hace la migración.

### 3. No mezclar demasiada lógica de negocio

La migración tiene que resolver una necesidad de evolución de datos o estructura, no transformarse en una mini aplicación paralela.

### 4. Probar la migración sobre una base de desarrollo

Antes de correrla en un entorno serio, verificá cómo se comporta con datos reales o parecidos a los reales.

### 5. Seguir tratando la migración como inmutable

Aunque esté escrita en Java, una migración versionada ya aplicada no debería reescribirse. Si necesitás corregir algo, lo correcto es crear una nueva versión.

## Errores comunes

### Poner la clase en un paquete que Flyway no escanea

Si la ubicación no está dentro del classpath que Flyway revisa, la migración no se va a detectar.

### Olvidar compilar antes de migrar

Una migración Java necesita existir como clase compilada para poder ejecutarse.

### Usar Java para cosas que eran más simples en SQL

Eso agrega complejidad innecesaria.

### Hacer migraciones demasiado grandes

Si una sola migración intenta resolver demasiadas cosas, se vuelve difícil de entender, testear y depurar.

## Ejercicio recomendado

1. Creá una tabla `cliente` con una migración SQL.
2. Insertá algunos registros con nombres en distintos formatos.
3. Escribí una migración Java que normalice esos nombres.
4. Ejecutá `info` antes y después.
5. Revisá cómo quedó registrada la migración en `flyway_schema_history`.

## Idea clave

Las migraciones en Java son una herramienta muy útil cuando el cambio no encaja bien en SQL. No reemplazan a las migraciones SQL, sino que las complementan.

La regla práctica más sana es esta:

- **si SQL lo resuelve bien, usá SQL**;
- **si la lógica es demasiado compleja o incómoda en SQL, evaluá Java**.

En el próximo tema vamos a ver cómo usar **callbacks y automatizaciones del ciclo de migración** para ejecutar tareas en momentos específicos del proceso de Flyway.
