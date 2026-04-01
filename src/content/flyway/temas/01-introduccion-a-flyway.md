---
title: "Introducción a Flyway"
description: "Qué es Flyway, qué problema resuelve y cómo encaja en un flujo profesional de migraciones de base de datos."
order: 1
module: "Fundamentos de Flyway"
level: "intro"
draft: false
---

# Introducción a Flyway

## Objetivo

Entender qué es Flyway, qué problema resuelve y por qué conviene usarlo para versionar la base de datos de una aplicación.

---

## Antes de empezar

Para aprovechar bien este tema, conviene que ya tengas una idea básica de:

- SQL
- bases de datos relacionales
- qué es una tabla
- qué significa crear, alterar o eliminar estructura en una base

No hace falta saber Flyway de antemano.

---

## El problema que Flyway viene a resolver

En muchos proyectos, la aplicación evoluciona y la base de datos también.

Al principio, cuando el proyecto es chico, suele pasar algo como esto:

- alguien crea tablas manualmente
- otro desarrollador modifica columnas a mano
- en otro entorno faltan cambios
- en producción no está exactamente la misma estructura que en desarrollo
- nadie sabe con certeza qué scripts ya se ejecutaron y cuáles no

Eso genera problemas muy comunes:

- inconsistencias entre entornos
- errores al desplegar
- dificultad para trabajar en equipo
- pérdida de trazabilidad
- cambios manuales que después nadie recuerda

Flyway existe justamente para evitar ese caos.

---

## Qué es Flyway

Flyway es una herramienta de migraciones de base de datos.

Su idea central es muy simple:

**los cambios de la base también forman parte del código del proyecto y, por lo tanto, deben versionarse**.

En lugar de cambiar la base manualmente, se crean archivos de migración que describen cada cambio de forma ordenada.

Por ejemplo:

- crear una tabla
- agregar una columna
- insertar datos iniciales
- crear un índice
- corregir una estructura existente

Esas migraciones quedan guardadas en el proyecto, normalmente dentro del control de versiones, y Flyway se encarga de ejecutarlas en el orden correcto. citeturn761189search3turn761189search1

---

## Idea mental correcta

Piensa Flyway así:

- el código fuente tiene una historia
- la base de datos también tiene una historia
- Flyway conecta ambas historias

Cada vez que el esquema cambia, ese cambio queda expresado en una migración.

Así, cualquier entorno puede reconstruirse siguiendo la misma secuencia de pasos.

---

## Qué son las migraciones

Una migración es un archivo que representa un cambio incremental en la base.

Flyway trabaja principalmente con estos tipos:

### 1. Migraciones versionadas

Son archivos numerados, por ejemplo:

```text
V1__crear_tabla_usuarios.sql
V2__agregar_columna_email.sql
V3__crear_indice_en_email.sql
```

Cada una tiene una versión única y se ejecuta una sola vez, en orden ascendente. citeturn761189search1turn761189search3

### 2. Migraciones repeatable

Se usan para objetos que conviene regenerar cuando su contenido cambia, como vistas, procedimientos o funciones.

Más adelante las veremos en detalle. Por ahora alcanza con saber que existen y que no reemplazan a las versionadas. citeturn761189search3

---

## Cómo sabe Flyway qué ya se ejecutó

Flyway crea y mantiene una tabla especial llamada, por defecto, `flyway_schema_history`.

Esa tabla funciona como historial y auditoría:

- registra qué migraciones fueron aplicadas
- en qué orden
- cuándo se ejecutaron
- si fueron exitosas
- qué checksum tenían

Gracias a eso, Flyway puede comparar:

- lo que existe en el proyecto
- lo que ya fue aplicado en la base

Y decidir qué falta ejecutar. citeturn761189search12turn761189search2turn761189search13

---

## Por qué Flyway es valioso en proyectos reales

### Reproducibilidad

Permite que desarrollo, testing y producción sigan el mismo historial de cambios.

### Trabajo en equipo

Cada cambio de base queda expresado en archivos que pueden revisarse, versionarse y compartirse.

### Menos errores manuales

Se reduce mucho la necesidad de entrar a la base a ejecutar SQL “a mano”.

### Trazabilidad

Queda claro qué cambio se hizo, cuándo y en qué versión del proyecto apareció.

### Despliegues más confiables

La evolución del esquema pasa a ser parte del proceso normal de entrega.

---

## Qué comandos vas a usar mucho en Flyway

Aunque en este primer tema todavía no vamos a profundizar en todos, estos son algunos de los comandos más importantes:

- `migrate`: aplica las migraciones pendientes
- `info`: muestra el estado de las migraciones
- `validate`: comprueba si las migraciones aplicadas coinciden con las disponibles
- `baseline`: marca un punto de partida para bases ya existentes
- `repair`: repara ciertos problemas del historial
- `clean`: elimina objetos del esquema configurado

`migrate` es el centro del flujo de trabajo, y además Flyway crea automáticamente la tabla de historial si todavía no existe. `validateOnMigrate` está activado por defecto, así que normalmente la validación acompaña a la migración. citeturn761189search11turn761189search2turn761189search5turn761189search10

---

## Qué no hace Flyway por sí solo

Es importante tener expectativas correctas.

Flyway no decide por ti:

- cómo diseñar bien una base
- qué estrategia de modelado conviene
- cómo escribir buen SQL
- cómo resolver automáticamente cualquier conflicto entre ramas

Flyway ordena y automatiza la ejecución de cambios, pero la calidad del diseño sigue dependiendo del equipo.

---

## Ejemplo mental simple

Imagina una aplicación de e-commerce.

Versión inicial:

- tabla `users`
- tabla `products`
- tabla `orders`

Luego el proyecto crece y necesitas:

- agregar `phone` a `users`
- crear `order_items`
- agregar índice a `products.slug`

Sin Flyway, alguien podría hacer eso manualmente en una base sí y en otra no.

Con Flyway, cada cambio queda escrito en archivos como:

```text
V1__crear_tablas_iniciales.sql
V2__agregar_phone_a_users.sql
V3__crear_order_items.sql
V4__crear_indice_slug_en_products.sql
```

Entonces cualquier entorno puede avanzar exactamente por el mismo camino.

---

## Buenas prácticas desde el día uno

Aunque después las veremos mejor, conviene empezar con estas ideas:

1. No hagas cambios manuales en la base si ese cambio debería vivir en una migración.
2. Guarda las migraciones dentro del proyecto.
3. Usa nombres claros y consistentes.
4. Piensa en cambios pequeños e incrementales.
5. Trata la base como parte del sistema, no como algo separado.

---

## Lo más importante que tienes que llevarte de este tema

Si recuerdas solo una idea, que sea esta:

> **La estructura de la base de datos también debe versionarse.**

Flyway te ayuda a convertir esa idea en un flujo de trabajo concreto, repetible y profesional. citeturn761189search3turn761189search12

---

## Ejercicio conceptual

Antes de pasar al siguiente tema, responde mentalmente estas preguntas:

1. ¿Qué problema aparece cuando cada entorno tiene cambios manuales distintos?
2. ¿Por qué conviene que los cambios de base vivan en archivos versionados?
3. ¿Para qué sirve `flyway_schema_history`?
4. ¿Qué diferencia general hay entre “cambiar la base a mano” y “hacerlo con migraciones”?

---

## Mini práctica sugerida

Todavía sin instalar nada, haz este ejercicio en una carpeta de prueba:

1. Crea una carpeta llamada `migrations`.
2. Dentro, imagina tres archivos SQL con nombres como:

```text
V1__crear_tabla_clientes.sql
V2__agregar_columna_telefono.sql
V3__crear_tabla_pedidos.sql
```

3. Escribe al lado de cada uno qué cambio representaría.
4. Piensa en qué orden deberían ejecutarse y por qué.

La idea no es correr Flyway todavía, sino empezar a pensar con mentalidad de migraciones.

---

## Resumen

En este tema viste que:

- Flyway sirve para versionar y ejecutar cambios de base de datos
- trabaja con migraciones que representan cambios incrementales
- registra el historial en `flyway_schema_history`
- ayuda a mantener consistencia entre entornos
- vuelve más profesional y repetible la evolución del esquema

---

## Próximo tema

En el siguiente tema vas a instalar Flyway y hacer tu primera configuración para conectarlo a una base de datos real.
