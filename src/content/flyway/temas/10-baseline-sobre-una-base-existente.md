---
title: "Baseline sobre una base existente"
description: "Qué significa baselinar una base ya creada, cuándo hace falta hacerlo y cómo empezar a usar Flyway sin reejecutar toda la historia anterior."
order: 10
module: "Fundamentos de Flyway"
level: "base"
draft: false
---

# Baseline sobre una base existente

Hasta acá venimos trabajando con una idea bastante limpia: tenemos migraciones, Flyway las detecta y las aplica en orden.

Eso funciona perfecto cuando empezás desde cero.

Pero en proyectos reales aparece un escenario muy común:

- la base de datos ya existe;
- ya tiene tablas, índices, vistas o datos importantes;
- quizás incluso está en producción;
- y recién ahora querés empezar a usar Flyway.

En ese punto aparece un concepto clave: **baseline**.

La meta de este tema es que entiendas qué significa baselinar una base existente, cuándo hace falta hacerlo y qué efecto tiene sobre el flujo de migraciones.

## Objetivos

Al finalizar este tema deberías poder:

- entender qué problema resuelve el baseline;
- reconocer cuándo hace falta usarlo;
- saber qué hace exactamente el comando `baseline`;
- elegir una `baselineVersion` coherente;
- distinguir entre baselinar una base existente y ejecutar migraciones normales.

## La idea central

Cuando Flyway empieza a gestionar una base existente, necesita un **punto de partida reconocido**.

Ese punto de partida es el **baseline state**.

Dicho de forma simple:

> Flyway necesita saber desde qué versión lógica empieza a hacerse cargo del historial.

Si no marcás ese punto de arranque, Flyway no tiene forma de saber cuáles cambios pertenecen al pasado de la base y cuáles son migraciones nuevas que todavía deberían ejecutarse.

## Cuándo aparece este problema

Imaginá esta situación:

- tu sistema ya tiene una base en producción;
- esa base fue creciendo sin Flyway;
- hoy ya existen las tablas `usuarios`, `roles` y `pedidos`;
- a partir de ahora querés empezar a versionar los cambios con migraciones.

Sin baseline, Flyway ve una base con objetos ya creados pero sin historial registrado en `flyway_schema_history`.

Entonces no sabe si:

- debe crear todo desde cero;
- debe ejecutar migraciones viejas;
- o debe asumir que la base ya está en cierto punto del recorrido.

El baseline resuelve justamente esa ambigüedad.

## Qué hace realmente el comando baseline

El comando `baseline` le dice a Flyway algo así:

> “Esta base ya está en un estado válido. A partir de ahora, tomá este punto como comienzo del historial.”

En términos prácticos, Flyway:

- crea la tabla `flyway_schema_history` si todavía no existe;
- registra una entrada de baseline;
- marca a la base como ubicada en una versión determinada;
- deja listas las condiciones para que futuras migraciones se apliquen por encima de ese punto.

Lo importante no es memorizar la frase exacta, sino entender la consecuencia:

**las migraciones hasta esa versión se consideran anteriores al inicio administrado por Flyway**.

## Qué no hace baseline

Este punto es clave.

El comando `baseline` **no recrea la base**.

Tampoco:

- ejecuta todas las migraciones viejas;
- compara automáticamente cada objeto contra tus scripts;
- “adivina” si tus archivos representan con precisión el estado actual;
- convierte mágicamente una base desordenada en una base prolija.

El baseline no corrige el pasado.

Lo que hace es **marcar un punto de partida oficial** para que Flyway pueda empezar a trabajar de forma controlada desde ahora en adelante.

## Cuándo conviene usarlo

Conviene usar baseline cuando se da este escenario:

- la base no es greenfield;
- ya tiene objetos y posiblemente datos;
- todavía no tiene historial de Flyway;
- querés empezar a administrar cambios futuros con migraciones.

En cambio, si estás arrancando un proyecto desde cero y todavía no hay bases pobladas en entornos reales, normalmente no necesitás preocuparte por baseline.

Ahí simplemente empezás con `V1__...sql` y seguís el flujo normal.

## Ejemplo mental sencillo

Supongamos que tenés una base existente con este estado:

- tabla `usuarios`;
- tabla `roles`;
- tabla `pedidos`.

Y además definís en tu proyecto estas migraciones:

```text
V1__crear_usuarios.sql
V2__crear_roles.sql
V3__crear_pedidos.sql
V4__agregar_columna_telefono.sql
```

Ahora imaginá que la base real ya está como si `V1`, `V2` y `V3` hubieran ocurrido, aunque en ese momento todavía no usabas Flyway.

Entonces lo razonable sería marcar esa base con una versión de baseline equivalente a ese estado.

Por ejemplo, si querés considerar que la base ya está en la versión 3, el flujo conceptual sería:

1. baselinar la base en versión 3;
2. dejar que Flyway registre ese punto inicial;
3. ejecutar `migrate`;
4. permitir que Flyway aplique recién `V4` y las posteriores.

Ese es el corazón del baseline.

## baselineVersion

La configuración más importante en este tema es `baselineVersion`.

Esa propiedad define la versión con la que vas a etiquetar la base existente al ejecutar `baseline`.

En otras palabras:

- todo lo que esté **hasta esa versión inclusive** se considera previo al arranque administrado por Flyway;
- todo lo que esté **por encima** de esa versión queda habilitado para aplicarse después con `migrate`.

### Ejemplo conceptual

Si elegís:

```text
baselineVersion = 3
```

entonces Flyway tratará la base como si ya estuviera en la versión 3.

Por lo tanto:

- `V1`, `V2` y `V3` no deberían ejecutarse sobre esa base;
- `V4`, `V5` y siguientes sí podrán aplicarse cuando corresponda.

## Elegir bien la versión de baseline

Acá está una de las decisiones más delicadas.

No se trata de elegir “un número lindo”.

Se trata de elegir una versión que realmente represente el estado actual de la base que vas a registrar.

### Una regla práctica

Preguntate esto:

> Si esta base ya estuviera dentro de mi historia de migraciones, ¿hasta qué versión diría honestamente que llegó?

La respuesta a esa pregunta te orienta sobre la `baselineVersion`.

### Un error típico

Un error común es marcar una base con una versión demasiado alta o demasiado baja.

- Si la dejás **demasiado baja**, Flyway podría querer ejecutar scripts que en la práctica ya están reflejados en la base.
- Si la dejás **demasiado alta**, podrías saltarte migraciones que en realidad sí necesitabas aplicar después.

Por eso el baseline no debería decidirse “a ojo”.

Conviene revisar el estado real de la base y compararlo con la historia de scripts que querés adoptar.

## Ejemplo de uso desde línea de comandos

El comando más simple es:

```bash
flyway baseline
```

Pero en una adopción real normalmente vas a querer controlar la versión.

Por ejemplo:

```bash
flyway -baselineVersion=3 baseline
```

También podrías dejarlo en `flyway.toml`:

```toml
[flyway]
baselineVersion = "3"
```

Y luego ejecutar:

```bash
flyway baseline
```

## baselineDescription

Además de la versión, Flyway permite registrar una descripción para ese punto inicial.

Eso puede servirte para que la entrada del historial sea más legible, por ejemplo:

- `Baseline inicial`;
- `Inicio de control con Flyway`;
- `Estado productivo previo a migraciones`.

Ejemplo:

```bash
flyway -baselineVersion=3 -baselineDescription="Inicio controlado por Flyway" baseline
```

No cambia la lógica de ejecución, pero sí ayuda a que el historial sea más claro.

## Qué vas a ver en schema history

Después de ejecutar `baseline`, la tabla `flyway_schema_history` ya no estará vacía.

Aparecerá una entrada que representa ese punto inicial.

Y cuando consultes `info`, la base ya no se verá como una base “sin historia”, sino como una base reconocida por Flyway desde una versión determinada.

Eso es importante porque, desde ese momento, Flyway ya puede decidir con claridad qué está pendiente y qué no.

## Flujo práctico recomendado

Un flujo simple para empezar a adoptar Flyway sobre una base existente puede ser este:

### 1. Revisar el estado actual de la base

Antes de tocar nada, entendé qué objetos existen realmente.

### 2. Alinear tu historia de migraciones

Definí qué versiones representan el pasado que querés dar por asumido y a partir de cuál versión empezarás a avanzar con cambios nuevos.

### 3. Elegir la baselineVersion

Tomá una decisión explícita y coherente con el estado real.

### 4. Ejecutar baseline

Registrá el punto de arranque.

### 5. Verificar con info

Chequeá cómo quedó interpretado el historial.

### 6. Seguir trabajando con nuevas migraciones versionadas

A partir de ahí, lo sano es continuar con `V4`, `V5`, `V6` o la numeración que corresponda.

## Ejemplo completo

Imaginá este caso:

### Estado real de la base hoy

Ya existen:

- `usuarios`;
- `roles`;
- `productos`.

### Archivos del proyecto

```text
V1__crear_usuarios.sql
V2__crear_roles.sql
V3__crear_productos.sql
V4__agregar_stock.sql
```

### Decisión

Considerás que la base existente equivale a la versión 3.

### Flujo

```bash
flyway info
flyway -baselineVersion=3 -baselineDescription="Inicio con Flyway" baseline
flyway info
flyway migrate
```

### Resultado esperado

- Flyway reconoce a la base como baselined en la versión 3;
- `V1`, `V2` y `V3` no se vuelven a ejecutar sobre esa base;
- `V4` sí puede entrar como cambio nuevo.

## Qué pasa si tus entornos no están en sync

Este es un detalle importante en proyectos reales.

A veces producción, staging y test no tienen exactamente el mismo estado.

Si querés empezar con Flyway y esos entornos están desalineados, la decisión no siempre es trivial.

En general, antes de adoptar migraciones de forma seria, conviene que los entornos que vas a administrar estén razonablemente sincronizados o que definas una estrategia más cuidadosa para cada uno.

Si no, el número de baseline elegido podría representar bien a un entorno y mal a otro.

## No confundir baseline con baseline migration

Acá hay una confusión muy común.

### El comando `baseline`

Sirve para **marcar una base existente** como punto de partida del historial.

### Una baseline migration `B...`

Es otra cosa.

Es un archivo acumulativo que representa el estado de una base para nuevos entornos y participa del proceso de `migrate`.

No es lo mismo que ejecutar el comando `baseline`.

De hecho, Flyway los trata como mecanismos distintos.

En este tema estamos hablando del **comando `baseline` sobre una base ya existente**.

## Buenas prácticas

### 1. Baselinar con criterio, no por apuro

Si elegís mal la versión, arrastrás una interpretación equivocada del historial.

### 2. Dejar documentado el motivo

Conviene que el equipo sepa por qué esa base fue marcada con cierta versión.

### 3. Verificar con `info` antes y después

Eso ayuda a confirmar que Flyway entendió el estado como vos esperabas.

### 4. No usar baseline para esconder desorden

Si la base está inconsistente, el baseline no arregla el problema de fondo.

### 5. A partir del baseline, seguir con migraciones nuevas

La idea no es vivir baselinando todo el tiempo, sino usarlo como puerta de entrada para adoptar un flujo ordenado.

## Errores comunes

Estos errores aparecen bastante seguido:

- elegir una `baselineVersion` sin revisar el estado real;
- creer que baseline ejecuta scripts viejos;
- pensar que baseline reemplaza el diseño correcto de migraciones futuras;
- confundir el comando `baseline` con una baseline migration `B...`;
- baselinar varios entornos distintos como si todos estuvieran iguales cuando no lo están.

## Una regla práctica para recordar

Si la base **ya existe** y querés que Flyway empiece a administrarla **sin rehacer todo su pasado**, probablemente necesitás pensar en baseline.

Si la base **arranca desde cero**, normalmente no.

## Cierre

El baseline no sirve para “migrar todo lo viejo”.

Sirve para **declarar oficialmente desde qué punto Flyway empieza a registrar la historia** de una base que ya venía existiendo.

Ese paso es el puente entre un esquema heredado y un flujo moderno de migraciones controladas.

En el próximo tema vamos a ver una variante muy usada en la práctica: **`baselineOnMigrate`**, es decir, cuándo conviene automatizar ese primer baseline al ejecutar `migrate` y qué riesgos tiene hacerlo sin cuidado.
