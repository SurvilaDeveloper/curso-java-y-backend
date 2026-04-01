---
title: "Troubleshooting y diagnóstico de problemas frecuentes en Flyway"
description: "Cómo diagnosticar errores comunes en Flyway, qué comando mirar primero, cuándo usar repair y cómo resolver problemas sin empeorar el historial de migraciones."
order: 28
module: "Trabajo profesional con Flyway"
level: "avanzado"
draft: false
---

# Troubleshooting y diagnóstico de problemas frecuentes en Flyway

A esta altura del curso ya vimos casi todas las piezas principales de Flyway.

Sabés crear migraciones, ejecutar `migrate`, inspeccionar con `info`, validar con `validate`, reparar con `repair` y organizar tus scripts por ambiente o por herramienta.

Ahora toca una parte muy importante del trabajo real: **diagnosticar problemas cuando algo sale mal**.

Porque en proyectos reales no alcanza con saber correr comandos cuando todo está bien.

También necesitás poder responder preguntas como estas:

- ¿por qué `validate` está fallando?
- ¿por qué Flyway dice que una migración aplicada ya no coincide?
- ¿por qué una migración no se puede crear o no se encuentra?
- ¿cuándo corresponde usar `repair` y cuándo no?
- ¿cómo resolver un problema sin empeorar el estado de la base?

En este tema vamos a trabajar un enfoque práctico de troubleshooting.

La idea no es memorizar errores aislados, sino aprender un **método de diagnóstico**.

## Objetivos del tema

Al finalizar este tema deberías poder:

- identificar en qué parte del flujo está ocurriendo un problema;
- usar `info`, `validate` y `repair` con criterio de diagnóstico;
- distinguir entre errores de migración, errores de validación y errores de configuración;
- resolver problemas frecuentes sin dañar el historial de migraciones;
- seguir una rutina ordenada antes de tocar archivos o ejecutar comandos peligrosos.

## Regla principal: no diagnostiques a ciegas

Uno de los errores más comunes al trabajar con Flyway es entrar en modo “parche rápido”.

Por ejemplo:

- cambiar una migración ya aplicada para “hacerla coincidir”;
- correr `repair` sin entender qué pasó;
- borrar archivos del directorio de migraciones;
- o intentar limpiar la base sin verificar primero el entorno correcto.

Ese tipo de reacción puede empeorar la situación.

Con Flyway conviene pensar así:

1. primero entender el estado;
2. después identificar la causa;
3. recién entonces elegir la corrección.

## Primer paso: distinguir qué clase de problema tenés

No todos los errores de Flyway significan lo mismo.

En la práctica, muchos problemas entran en una de estas categorías:

### 1. Error al ejecutar una migración

Acá el problema ocurre mientras corrés `migrate`.

Ejemplos típicos:

- SQL inválido;
- tabla o columna inexistente;
- conflicto por objetos ya existentes;
- permisos insuficientes;
- dependencia faltante entre scripts;
- bloqueo o problema transaccional del motor.

### 2. Error de validación

Acá Flyway no está necesariamente diciendo que el SQL actual falla al ejecutarse.

Está diciendo que **el historial aplicado en la base no coincide con lo que hoy existe localmente**.

Ejemplos típicos:

- cambió el checksum;
- cambió el nombre;
- cambió el tipo de una migración;
- falta un archivo que antes existía;
- o hay una migración local que no fue aplicada todavía en esa base.

### 3. Error de configuración o entorno

En este caso el problema no está tanto en la migración como en la forma en que Flyway está apuntando a la base o buscando recursos.

Ejemplos comunes:

- URL o credenciales incorrectas;
- `locations` mal definidas;
- esquema por defecto equivocado;
- environment no seleccionado como creías;
- ausencia del esquema donde debería vivir `flyway_schema_history`.

## Segundo paso: mirar `info` antes de improvisar

Cuando no estás seguro de qué está pasando, una muy buena costumbre es correr:

```bash
flyway info
```

Este comando no arregla nada, pero te muestra mucho contexto útil:

- qué migraciones están pendientes;
- cuáles fueron aplicadas;
- cuáles aparecen como fallidas;
- y qué estado general ve Flyway en esa base.

Muchas veces `info` evita que tomes una mala decisión por apuro.

Por ejemplo, puede mostrarte que el problema no es “Flyway no ve mis archivos”, sino que en realidad la base quedó detenida en una migración intermedia.

## Tercer paso: usar `validate` para confirmar si el conflicto es de historial

Si sospechás que hubo cambios sobre migraciones ya aplicadas o que el repositorio quedó desalineado respecto de la base, el comando natural es:

```bash
flyway validate
```

Este comando compara lo aplicado en la base con lo disponible localmente.

No es un verificador superficial. Se apoya en el historial y en los checksums guardados cuando cada migración fue ejecutada.

## Problema frecuente 1: “checksum mismatch”

Este es uno de los clásicos.

Situación típica:

1. corriste una migración en una base;
2. después editaste ese archivo;
3. más tarde ejecutaste `validate`;
4. Flyway detectó que el checksum ya no coincide.

El error real no es que Flyway “se puso estricto”.

El error real es que **se modificó un archivo que ya formaba parte del historial aplicado**.

### Cómo pensar este caso

Primero preguntate:

- ¿el cambio fue intencional?
- ¿el archivo fue editado por error?
- ¿ya se aplicó en otros entornos?

### Qué hacer si fue un cambio accidental

La opción más sana suele ser:

- restaurar el archivo original desde control de versiones;
- verificar con `validate`;
- y seguir trabajando con una migración nueva.

### Qué hacer si el cambio fue intencional y aceptado

Solo después de entender el impacto, puede tener sentido usar `repair` para realinear checksums.

Pero ojo: **eso no convierte una mala práctica en una buena práctica**.

`repair` no debería ser tu forma habitual de trabajar.

## Problema frecuente 2: migración aplicada pero archivo faltante

Otro caso común es este:

- una migración figura en `flyway_schema_history`;
- pero el archivo ya no está en las `locations` actuales.

Esto puede pasar porque:

- alguien borró el archivo;
- alguien movió carpetas y dejó mal configuradas las `locations`;
- cambiaste de rama;
- o el proyecto local no está completo.

Antes de hacer nada, revisá:

- si el archivo existe en otra rama;
- si la configuración de `locations` es la misma que usó `migrate`;
- si no estás validando con una copia incompleta del proyecto.

En varios casos el problema no se resuelve con `repair`, sino con **volver a tener el conjunto correcto de migraciones disponible**.

## Problema frecuente 3: falló una migración durante `migrate`

Este es otro escenario central.

Cuando una migración falla, Flyway corta la ejecución.

A partir de ahí, lo importante es no saltear pasos.

### Método recomendado

1. leer el error completo;
2. identificar qué objeto o sentencia falló;
3. entender si quedaron efectos parciales en la base;
4. corregir la causa;
5. recién después decidir si hace falta `repair`.

### Lo que no conviene hacer

- editar el historial manualmente sin criterio;
- relanzar comandos repetidamente “a ver si ahora anda”; 
- tocar varias migraciones a la vez sin aislar la causa;
- asumir que hubo rollback completo si el motor no garantiza ese comportamiento en todos los casos.

## Problema frecuente 4: Flyway no puede crear la tabla de historial

Este problema suele confundir bastante porque no siempre parece una falla de migraciones.

A veces el problema es que Flyway no tiene dónde crear `flyway_schema_history`.

Esto se vuelve especialmente importante si estás trabajando con:

- `createSchemas=false`;
- un `defaultSchema` mal definido;
- o una lista de `schemas` donde el primer esquema esperado todavía no existe.

En estos casos, la solución suele pasar por revisar la configuración del esquema de historial y, si hace falta, usar `initSql` para asegurarte de que ese esquema exista antes de migrar.

## Problema frecuente 5: el error no es de SQL, sino del entorno

Hay errores que parecen “de Flyway”, pero en realidad son de contexto:

- estás apuntando a otra base;
- cambiaste de environment sin darte cuenta;
- usaste otra URL;
- o la configuración local no coincide con la del pipeline.

Por eso, cuando un comportamiento te sorprende, conviene revisar antes de nada:

- qué environment estás usando;
- qué URL está tomando Flyway;
- qué usuario se está conectando;
- y qué `locations` está leyendo realmente.

## Cuándo usar `repair`

`repair` es útil, pero tiene que entrar **después del diagnóstico**, no antes.

Pensalo como una herramienta para corregir el historial cuando ya entendiste la causa del problema.

Ejemplos razonables:

- una migración falló y ya limpiaste manualmente los restos que dejó;
- una migración aplicada fue modificada de forma intencional y necesitás realinear el checksum;
- hay migraciones faltantes que fueron retiradas deliberadamente y querés reflejar ese estado en el historial.

## Cuándo no usar `repair`

No conviene usarlo para:

- ocultar un error que todavía no entendiste;
- compensar un `locations` mal configurado;
- arreglar una base a la que apuntaste por error;
- o como reemplazo de una estrategia sana con control de versiones.

## Checklist práctico de troubleshooting

Cuando Flyway falle, seguí esta secuencia:

### Paso 1. Frená y leé el mensaje completo

No te quedes solo con la primera línea del error.

Muchas veces el detalle útil está más abajo: sentencia, línea, objeto, esquema, SQL state o código del motor.

### Paso 2. Confirmá el contexto

Verificá:

- entorno;
- base de datos;
- usuario;
- URL;
- `locations`;
- versión del proyecto en tu rama actual.

### Paso 3. Corré `info`

Querés saber qué estado ve Flyway antes de tocar nada.

### Paso 4. Corré `validate` si sospechás inconsistencia de historial

Especialmente si hubo cambios en archivos, merges de ramas o refactors de carpetas.

### Paso 5. Corregí la causa real

Recién acá conviene tocar SQL, restaurar archivos, ajustar configuración o limpiar restos parciales.

### Paso 6. Usá `repair` solo si sigue siendo necesario

Y si lo usás, hacelo con el mismo criterio de `locations` con el que corriste `migrate`.

### Paso 7. Volvé a validar

La salida final ideal no es solo “ahora migró”, sino:

- estado entendible en `info`;
- `validate` consistente;
- y un proyecto que otro integrante del equipo también pueda correr.

## Un ejemplo de rutina corta y segura

Supongamos este caso:

- corrés `migrate`;
- falla `V12__agregar_indices.sql`;
- después `validate` también empieza a marcar inconsistencias.

Una secuencia razonable sería:

```bash
flyway info
flyway validate
```

Luego:

1. inspeccionás la migración que falló;
2. revisás si quedaron objetos parciales;
3. corregís el SQL o el problema de contexto;
4. si corresponde, corrés `repair`;
5. y volvés a ejecutar `validate` y `migrate`.

## Qué señal da un equipo maduro con Flyway

Un equipo maduro no es el que nunca tiene errores.

Es el que, cuando aparece uno:

- no entra en pánico;
- no reescribe historia sin pensar;
- no usa `repair` como curita universal;
- y deja el proyecto en un estado explicable para cualquier otra persona del equipo.

Eso vale mucho más que “hacer que funcione” a cualquier precio.

## Buenas prácticas finales para troubleshooting

- no edites migraciones ya aplicadas salvo que entiendas perfectamente el impacto;
- usá `info` como primera herramienta de lectura;
- reservá `validate` para confirmar si el problema es de historial o de consistencia local;
- usá `repair` con criterio, no por impulso;
- revisá `locations` y environment antes de asumir que el problema está en el SQL;
- y documentá el incidente si el equipo podría volver a caer en el mismo caso.

## Cierre

Flyway no se vuelve difícil cuando aparecen errores.

Se vuelve más profesional.

Y ahí es donde cambia la calidad de uso.

No alcanza con saber crear migraciones.

También necesitás saber leer estados, distinguir causas y corregir problemas sin romper la trazabilidad del esquema.

Ese es el paso que convierte a Flyway en una herramienta realmente confiable dentro de un proyecto serio.

En el próximo tema podemos cerrar con una guía de **buenas prácticas finales y flujo recomendado de trabajo con Flyway**.
