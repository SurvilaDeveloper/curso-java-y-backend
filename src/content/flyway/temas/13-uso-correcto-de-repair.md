---
title: "Uso correcto de repair"
description: "Cuándo conviene usar flyway repair, qué corrige realmente y qué límites tiene al trabajar con fallas o cambios en migraciones ya aplicadas."
order: 13
module: "Operación y recuperación"
level: "intermedio"
draft: false
---

# Uso correcto de `repair`

En el tema anterior viste qué pasa cuando una migración falla. Ahora toca una herramienta que suele generar dudas: `flyway repair`.

`repair` **no ejecuta migraciones**, **no arregla tu SQL** y **no deshace cambios hechos en la base**. Su trabajo está centrado en la tabla `flyway_schema_history`: repara metadatos del historial para que Flyway pueda volver a trabajar de forma consistente.

Entender esto es importante porque mucha gente intenta usar `repair` como si fuera una solución mágica. No lo es. Primero hay que corregir el problema real. Después, si el historial quedó inconsistente, recién ahí tiene sentido reparar.

---

## Qué hace realmente `flyway repair`

Según la documentación oficial, `repair` repara la tabla de historial y puede hacer estas acciones:

- eliminar migraciones fallidas del historial
- realinear checksums, descripciones y tipos de migraciones aplicadas con los archivos disponibles
- marcar como **deleted** las migraciones que ya no existen en las `locations` configuradas

Eso último tiene una consecuencia importante: `repair` debe ejecutarse con las **mismas `locations`** que usás en `migrate`, para que Flyway compare contra el mismo conjunto de archivos.

---

## Cuándo conviene usarlo

### 1. Falló una migración y el historial quedó sucio

Supongamos que ejecutás una migración y falla por un error de sintaxis, por una tabla inexistente o por una restricción violada.

Dependiendo del motor de base de datos y del manejo transaccional del DDL, puede quedar una entrada fallida en `flyway_schema_history`. En ese caso, el flujo correcto suele ser:

1. analizar el error
2. corregir la causa real
3. dejar la base en un estado consistente si quedaron objetos a medio crear
4. ejecutar `flyway repair` si hace falta limpiar el historial
5. volver a ejecutar `flyway migrate`

El punto clave es este: **`repair` viene después de entender el problema**, no antes.

### 2. Cambiaste un archivo ya aplicado en un entorno de práctica

En ambientes de aprendizaje o laboratorio puede pasar que cambies el contenido de una migración ya aplicada y luego `validate` falle por checksum distinto.

`repair` puede realinear ese checksum en la tabla de historial, pero eso no significa que sea buena práctica. En entornos serios, lo correcto sigue siendo **no editar migraciones versionadas ya aplicadas**. Lo normal es crear una migración nueva.

### 3. Eliminaste o moviste migraciones y el historial quedó desalineado

Si Flyway ya registró una migración, pero después el archivo desaparece de las `locations` actuales, `repair` puede marcarla como `deleted` en el historial.

Esto no debería formar parte del flujo habitual de trabajo. Más bien sirve para corregir una situación excepcional y dejar trazabilidad del cambio.

---

## Cuándo no deberías usarlo

### No lo uses para ocultar malas prácticas

Si modificaste una migración ya aplicada en un proyecto compartido y corrés `repair` para que deje de fallar `validate`, probablemente estés tapando un problema de proceso.

La pregunta correcta no es “¿cómo hago para que Flyway no se queje?”, sino “¿por qué cambié una migración que ya formaba parte del historial compartido?”.

### No lo uses como reemplazo de revisar la base

Si una migración falló y dejó objetos creados parcialmente, `repair` no limpia esos objetos. La documentación oficial aclara que los objetos de usuario que hayan quedado atrás deben limpiarse manualmente.

Por eso, antes de reparar, conviene revisar qué quedó realmente en la base.

### No lo uses sin entender las `locations`

Como `repair` compara contra los archivos disponibles, ejecutar el comando con `locations` incorrectas puede producir resultados engañosos. Podrías marcar migraciones como faltantes simplemente porque apuntaste al lugar equivocado.

---

## Ejemplo práctico

Imaginá este historial:

- `V1__crear_tabla_clientes.sql`
- `V2__agregar_email.sql`
- `V3__crear_tabla_pedidos.sql`

Ejecutás `migrate` y `V3` falla.

### Flujo incorrecto

1. correr `repair` sin revisar nada
2. volver a correr `migrate`
3. repetir hasta que algo funcione

Ese enfoque puede empeorar la confusión.

### Flujo correcto

1. leer el error de `V3`
2. revisar si la base quedó parcialmente modificada
3. corregir el script o el estado de la base
4. usar `info` y `validate` para entender la situación
5. ejecutar `repair` solo si el historial quedó inconsistente
6. volver a lanzar `migrate`

---

## Comando básico

```bash
flyway repair
```

Si trabajás con archivo de configuración, Flyway usará lo definido ahí. Si no, tendrás que pasar conexión y otras opciones como en los temas anteriores.

---

## Relación con `validate`

Muchas veces `repair` aparece después de un `validate` fallido.

Por ejemplo:

- `validate` detecta checksum distinto
- confirmás que ese cambio fue intencional en un entorno controlado
- usás `repair` para realinear el historial

Pero ojo: que **se pueda** hacer no significa que **convenga** hacerlo en un proyecto profesional compartido.

---

## Buen criterio profesional

Una forma sana de pensar `repair` es esta:

- **corrige historial**, no lógica de negocio
- **corrige metadatos**, no diseño de migraciones
- **ayuda a continuar**, pero no reemplaza el análisis del problema

Usado con criterio, es útil. Usado para esconder errores de proceso, termina deteriorando la confianza en el historial.

---

## Buenas prácticas

- ejecutá `repair` solo después de entender qué pasó
- revisá primero `info`, `validate` y el error real
- usá las mismas `locations` que en `migrate`
- no lo conviertas en una excusa para editar migraciones ya aplicadas
- verificá si quedaron objetos o cambios parciales en la base
- documentá por qué se usó `repair` si trabajás en equipo

---

## Ejercicio práctico

1. Creá una base de prueba.
2. Aplicá `V1` y `V2` correctamente.
3. Prepará una `V3` con un error intencional.
4. Ejecutá `migrate` y observá el fallo.
5. Revisá el estado con `info`.
6. Corregí la causa del error.
7. Ejecutá `repair` si el historial lo requiere.
8. Volvé a correr `migrate`.
9. Escribí con tus palabras qué corrigió `repair` y qué tuviste que arreglar vos manualmente.

---

## Cierre

`repair` es una herramienta útil, pero hay que ubicarla en el lugar correcto del flujo. No resuelve el problema de fondo: solo recompone el historial para que Flyway pueda seguir operando con coherencia.

Cuando la usás bien, te ayuda a recuperar el control. Cuando la usás para esconder errores, te deja una base más difícil de entender.
