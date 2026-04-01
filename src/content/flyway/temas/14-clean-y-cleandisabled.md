---
title: "clean y cleanDisabled: por qué hay que tener cuidado"
description: "Qué hace flyway clean, por qué puede ser útil en entornos de prueba y cómo usar cleanDisabled para evitar errores graves en bases importantes."
order: 14
module: "Control y recuperación de migraciones"
level: "intermedio"
draft: false
---

# `clean` y `cleanDisabled`: por qué hay que tener cuidado

Después de ver `repair`, toca otra herramienta de Flyway que hay que entender muy bien: `clean`.

Es un comando poderoso, útil en ciertos entornos, pero peligroso si se usa sin criterio.

La idea principal de este tema es simple:

- `clean` **borra objetos de la base** dentro de los esquemas configurados;
- `cleanDisabled` existe para reducir el riesgo de ejecutar ese comando por accidente;
- en un flujo profesional, `clean` suele quedar reservado para **desarrollo, laboratorio y pruebas controladas**, no para producción.

---

## Qué hace `flyway clean`

`clean` elimina todos los objetos de los esquemas configurados para Flyway.

Eso significa que puede borrar tablas, vistas, índices, secuencias, procedimientos y otros objetos que formen parte del esquema de trabajo. Si Flyway creó automáticamente esos esquemas, también puede eliminarlos al limpiar.

Dicho de forma directa: **`clean` deja la base lista para reconstruirse desde cero**, siempre que después vuelvas a ejecutar tus migraciones con `migrate`.

Por eso sirve mucho en entornos descartables, donde querés volver al punto inicial una y otra vez.

---

## Por qué es una operación delicada

A diferencia de `info`, `validate` o incluso `repair`, acá no estás analizando ni corrigiendo metadatos: estás destruyendo objetos reales de la base.

Por eso conviene pensar `clean` como una herramienta de reinicio controlado, no como un comando cotidiano.

### Casos donde sí puede tener sentido

- una base local de pruebas que querés reconstruir desde cero;
- un entorno temporal usado para experimentar migraciones;
- ejercicios de laboratorio en los que querés repetir el flujo completo varias veces;
- automatizaciones de testing donde el entorno está diseñado para ser descartable.

### Casos donde deberías evitarlo

- bases con datos reales;
- entornos compartidos por varias personas;
- servidores donde una mala configuración podría apuntar a una base importante;
- cualquier ambiente donde “volver a empezar” no sea una opción razonable.

---

## `cleanDisabled`: la red de seguridad

Flyway incorpora una protección muy importante: la opción `cleanDisabled`.

Su idea es sencilla: impedir que `clean` se ejecute salvo que vos lo habilites de forma explícita.

Esto existe justamente porque `clean` puede ser destructivo. En otras palabras, Flyway asume que lo más seguro es **bloquearlo por defecto**.

---

## Valor por defecto

Actualmente, `cleanDisabled` tiene valor por defecto en `true`.

Eso significa que, si no cambiás la configuración, `clean` no debería ejecutarse.

Esta decisión es muy sana para un flujo profesional: primero te protege, después te deja habilitar la limpieza si realmente la necesitás.

---

## Cómo habilitar `clean` de forma explícita

### Desde línea de comandos

```bash
flyway -cleanDisabled=false clean
```

### Desde `flyway.toml`

```toml
[flyway]
cleanDisabled = false
```

La idea no es dejar esto activo “porque sí”, sino habilitarlo conscientemente cuando el entorno lo justifique.

---

## Un flujo típico en entorno local

Un ejemplo razonable en desarrollo puede ser este:

1. tenés una base de prueba local;
2. querés verificar que todas tus migraciones reconstruyen el sistema desde cero;
3. habilitás `clean` en ese entorno;
4. ejecutás `clean`;
5. ejecutás `migrate`;
6. comprobás que la base vuelve a quedar completa y consistente.

Ese flujo es muy útil porque te obliga a validar que el proyecto no depende de “parches manuales” ni de estados ocultos en la base.

Si todo está bien, cualquier desarrollador debería poder levantar el esquema desde cero usando solo migraciones.

---

## Lo que no deberías hacer

### No lo uses como atajo cuando no entendés un error

Si una migración falla y tu primera reacción es borrar todo con `clean`, probablemente estés evitando aprender qué pasó realmente.

En laboratorio puede servir para reiniciar, pero en un proyecto serio primero conviene entender el error.

### No lo dejes habilitado en cualquier ambiente

Si `cleanDisabled=false` queda activo en una configuración que después se reutiliza en el entorno equivocado, el riesgo sube muchísimo.

Por eso es mejor tratar esta opción como una excepción controlada, no como una configuración general del proyecto.

### No confundas “puedo reconstruir” con “puedo perder datos”

Una cosa es poder rehacer una base desde cero en desarrollo.
Otra muy distinta es borrar una base que contiene datos que no querías perder.

La existencia de migraciones no vuelve inocua una operación destructiva.

---

## Relación con `migrate`

`clean` suele tener sentido cuando trabajás junto con `migrate`.

La lógica es esta:

- `clean` vacía el entorno;
- `migrate` lo reconstruye aplicando la historia de migraciones.

Cuando este ciclo funciona bien, ganás mucha confianza en tu proyecto porque sabés que el esquema no depende de intervenciones manuales escondidas.

---

## Diferencia entre `clean` y `repair`

Es importante no mezclar estas dos herramientas:

### `repair`

- repara la tabla `flyway_schema_history`;
- corrige metadatos del historial;
- no borra objetos funcionales de la base.

### `clean`

- elimina objetos reales de los esquemas configurados;
- reinicia el entorno;
- puede implicar pérdida total del contenido de ese esquema.

Una corrige historial.
La otra destruye estructura para volver a empezar.

---

## Ejemplo mental sencillo

Imaginá una base local con estas migraciones:

- `V1__crear_tablas_base.sql`
- `V2__agregar_indices.sql`
- `V3__crear_vistas.sql`

Si ejecutás:

```bash
flyway clean
flyway migrate
```

el objetivo es que, al final del proceso, la base vuelva a quedar como si acabaras de construir todo desde cero usando únicamente esas migraciones.

Ese ejercicio vale mucho porque revela problemas como:

- scripts que dependen de datos cargados manualmente;
- objetos creados fuera del historial;
- migraciones incompletas;
- orden incorrecto de cambios.

---

## Buenas prácticas

- mantené `cleanDisabled=true` por defecto;
- habilitá `clean` solo en entornos controlados;
- evitá usarlo en bases con datos reales;
- usalo para validar que tu proyecto puede reconstruirse desde cero;
- no lo conviertas en una salida automática ante cualquier error;
- revisá siempre a qué base estás apuntando antes de ejecutar comandos destructivos.

---

## Ejercicio práctico

1. Creá una base de prueba local.
2. Aplicá varias migraciones con `migrate`.
3. Verificá que los objetos existan.
4. Intentá ejecutar `clean` con la configuración por defecto y observá qué pasa.
5. Habilitá `cleanDisabled=false` solo en ese entorno de prueba.
6. Ejecutá `clean`.
7. Volvé a lanzar `migrate`.
8. Confirmá que el esquema se reconstruyó completamente.
9. Escribí qué ventaja tiene este flujo en desarrollo y por qué sería riesgoso en producción.

---

## Cierre

`clean` no es “malo”; simplemente es una herramienta que hay que ubicar en el contexto correcto.

En desarrollo y testing puede ser muy útil para reconstruir entornos y verificar que tus migraciones realmente representan toda la historia de la base.

Pero justo por su capacidad destructiva, Flyway lo bloquea por defecto con `cleanDisabled=true`. Esa decisión no estorba: te protege.
