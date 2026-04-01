---
title: "Trabajo en equipo, ramas y conflictos entre migraciones"
description: "Cómo organizar migraciones cuando varias personas trabajan en paralelo, qué conflictos aparecen entre ramas y qué estrategias usar para resolverlos sin romper el historial de Flyway."
order: 25
module: "Trabajo profesional con Flyway"
level: "intermedio"
draft: false
---

# Trabajo en equipo, ramas y conflictos entre migraciones

Cuando aprendés Flyway por primera vez, casi todo parece lineal: creás una migración, corrés `migrate`, verificás el resultado y seguís avanzando.

Pero en un proyecto real aparece un problema nuevo: **varias personas cambian la base al mismo tiempo**.

Ahí entran en juego las ramas de Git, los merges, los cambios que llegan en distinto orden y los conflictos entre migraciones.

Este tema no trata sobre un comando aislado, sino sobre una habilidad mucho más importante: **usar Flyway sin que el trabajo en equipo rompa el historial ni vuelva impredecible el despliegue**.

## Objetivos del tema

Al finalizar este tema deberías poder:

- entender por qué trabajar con ramas complica las migraciones;
- reconocer conflictos típicos entre cambios hechos en paralelo;
- aplicar estrategias para reducir choques entre versiones;
- decidir cuándo conviene reordenar trabajo y cuándo usar `outOfOrder`;
- organizar un flujo más sano para equipos que comparten una misma base de código.

## El problema real: la base no mergea sola

Git sabe fusionar archivos de texto. La base de datos, no.

Eso significa que dos desarrolladores pueden crear migraciones válidas por separado y, aun así, producir un conflicto cuando ambas ramas se unen.

Por ejemplo:

- una rama agrega la tabla `customers`;
- otra rama agrega una columna a `customers` asumiendo que esa tabla ya existe;
- una rama usa `V5__...` y otra también;
- una rama crea una constraint con un nombre que choca con otra;
- una rama ya aplicó una migración localmente y la otra modifica el mismo objeto con una versión incompatible.

Cada cambio, por sí solo, puede verse bien. El problema aparece cuando querés combinarlos.

## Qué recomienda la documentación oficial sobre branching

La documentación de Flyway es bastante clara con esto: recomienda **ser cuidadoso con las ramas**, empezar simple y evitar complejidad innecesaria.

También recomienda generar migraciones desde la misma rama para reducir conflictos, porque de otro modo puede tocarte corregir números de versión y ordenar manualmente el historial.

Dicho de forma práctica: **cuanto más paralela y desordenada sea la generación de migraciones, más trabajo de integración vas a tener después**.

## Un conflicto muy común: dos migraciones con la misma versión

Supongamos esto:

- rama A crea `V12__crear_tabla_orders.sql`;
- rama B crea `V12__agregar_tabla_coupons.sql`.

Cuando ambas ramas se mergean, no pueden coexistir así como están. Flyway espera una secuencia coherente de versiones.

En este caso, alguien va a tener que renumerar una de las dos migraciones antes de integrar el cambio.

Ese problema parece pequeño, pero en equipos activos pasa bastante.

## Por qué no alcanza con "arreglarlo después"

El problema de renumerar tarde no es solo estético.

Si una migración ya fue aplicada en una base local o compartida, cambiarle versión, nombre o contenido puede generar:

- fallos de `validate`;
- diferencias entre entornos;
- dudas sobre qué se ejecutó realmente;
- necesidad de reparar historial o rehacer una base de desarrollo.

Por eso conviene detectar estos choques **antes** de que lleguen a ambientes compartidos.

## Estrategia sana: ramas cortas y cambios chicos

Una de las mejores defensas contra conflictos no es técnica, sino de proceso.

En Flyway suelen funcionar mejor estas prácticas:

- ramas cortas;
- cambios pequeños;
- merges frecuentes contra la rama principal;
- revisión temprana de migraciones;
- evitar que dos personas modifiquen el mismo sector del esquema durante demasiado tiempo sin coordinarse.

Cuanto más tiempo vive una rama aislada, más chances hay de que choque con lo que avanzó el resto del equipo.

## Otra estrategia útil: una base de desarrollo por rama

La documentación actual de Flyway explica algo importante: cuando cambiás de rama, el estado de los archivos cambia, pero tu base de desarrollo sigue igual que antes.

Eso significa que podés quedar con una base local que ya no representa lo que hay en la rama actual.

Flyway plantea dos enfoques:

1. usar una base distinta por rama;
2. usar una sola base y recrearla o ajustarla al cambiar de rama.

En términos prácticos, **una base por rama** suele ser la opción más limpia cuando el proyecto crece, porque evita mezclar estados incompatibles.

## Qué pasa si usás una sola base y cambiás mucho de rama

Se vuelve muy fácil caer en estados confusos.

Por ejemplo:

- aplicaste `V15` y `V16` en la rama feature-a;
- cambiás a feature-b, donde esas migraciones no existen;
- tu base ya tiene objetos que no corresponden al estado del código que estás viendo.

Desde ahí, cualquier prueba local puede darte resultados engañosos.

Por eso, si trabajás con una sola base de desarrollo y usás migraciones, muchas veces conviene **recrear la base** al pasar de una rama a otra.

## El rol de la numeración de versiones

La numeración también influye mucho en los conflictos.

En la documentación de Flyway sobre generación de migraciones se menciona que, por defecto, se incluye un **timestamp** en el versionado generado para reducir la probabilidad de merge conflicts.

No significa que sea la única estrategia posible, pero sí muestra una idea útil: **versiones más únicas reducen choques entre personas trabajando en paralelo**.

En un curso práctico como este, la enseñanza importante es la siguiente:

- si el equipo usa numeración manual simple (`V1`, `V2`, `V3`), tiene que coordinar mejor;
- si usa un esquema de numeración más granular o asistido, puede reducir conflictos.

## Conflicto semántico: las versiones no chocan, pero el esquema sí

A veces no hay conflicto de numeración y, aun así, hay problema.

Por ejemplo:

- una rama crea `V21__agregar_columna_status.sql`;
- otra crea `V22__renombrar_tabla_orders.sql`.

Las versiones son distintas, así que Git no protesta. Pero tal vez la segunda migración vuelve inválida a la primera, o la primera asume un nombre de tabla que la segunda ya cambió.

Estos son los conflictos más peligrosos, porque no siempre se ven a simple vista.

## Cómo detectar estos problemas antes del merge

Hay varias defensas razonables:

- revisar las migraciones en pull request;
- correr `validate` en CI;
- levantar una base efímera y ejecutar todas las migraciones desde cero;
- correr tests de integración sobre el esquema resultante;
- observar `info` para entender qué queda pendiente y qué fue aplicado.

En otras palabras: **no confíes solo en que el SQL “parece correcto”**. Probalo dentro del flujo real.

## Cuándo aparece el problema de las migraciones fuera de orden

Supongamos que en una base ya se aplicaron `V1` y `V3`, y más tarde aparece una `V2` porque otra rama se integró después.

Por defecto, Flyway no aplica esa migración faltante como si nada. Para ese caso existe la opción `outOfOrder`.

La documentación oficial actual la describe así: permite ejecutar migraciones “fuera de orden”. Si ya tenés `1.0` y `3.0` aplicadas y aparece `2.0`, Flyway puede aplicarla también en lugar de ignorarla.

## Qué tenés que saber sobre `outOfOrder`

Hay dos ideas clave:

1. su valor por defecto es `false`;
2. no es una excusa para trabajar desordenado.

`outOfOrder` sirve como herramienta de recuperación o de integración controlada cuando una migración llegó tarde, pero no debería reemplazar una buena estrategia de ramas.

Si lo usás sin criterio, podés terminar con entornos que llegaron al mismo estado por caminos distintos, y eso complica la trazabilidad mental del equipo.

## Ejemplo práctico de `outOfOrder`

Imaginá este caso:

- producción ya tiene `V1` y `V3`;
- una rama retrasada trae `V2`;
- necesitás incorporar esa migración porque todavía es válida.

Ahí podrías usar algo como:

```bash
flyway -outOfOrder=true migrate
```

Pero antes de hacer eso deberías responder preguntas importantes:

- ¿`V2` sigue teniendo sentido con el estado actual del esquema?
- ¿no quedó absorbida por una migración posterior?
- ¿no va a duplicar cambios que ya existen?
- ¿todos los ambientes deberían aplicarla, o solo algunos?

La opción existe, pero el criterio sigue siendo humano.

## Cuándo conviene renumerar y cuándo no

Regla práctica:

- **si la migración todavía no salió de tu rama o no fue aplicada en entornos relevantes**, renumerarla antes del merge suele ser lo más sano;
- **si ya fue aplicada y forma parte de un historial real**, renumerar puede ser peor que el problema original.

En ese segundo caso, normalmente hay que evaluar una estrategia de integración más cuidadosa: nueva migración correctiva, baseline en algún entorno particular, o uso controlado de configuraciones avanzadas.

## Un flujo razonable para equipos

Un flujo bastante sano podría ser este:

1. cada desarrollador trabaja en una rama corta;
2. crea migraciones pequeñas y claras;
3. valida localmente contra una base limpia o dedicada;
4. abre pull request;
5. CI ejecuta `validate`, `migrate` y tests;
6. antes del merge se revisan conflictos de numeración y de sentido del esquema;
7. luego del merge, las migraciones viajan por los ambientes en el orden esperado.

No elimina todos los problemas, pero baja muchísimo la cantidad de sorpresas.

## Qué lugar ocupa `cherryPick`

La documentación actual también describe `cherryPick`, pero lo hace como una característica de **Flyway Teams**.

Sirve para indicar explícitamente qué migraciones considerar al migrar, deshacer o reparar, e incluso puede combinarse con `outOfOrder` en ciertos casos avanzados.

Para este curso base, lo importante no es memorizarlo, sino entender que existe como herramienta más específica cuando el flujo del equipo necesita seleccionar migraciones concretas.

## Buenas prácticas concretas para evitar dolores

Quedate con estas reglas:

- no edites migraciones versionadas ya aplicadas;
- no dejes ramas vivas demasiado tiempo;
- no acumules migraciones enormes si podés separarlas;
- revisá conflictos de versión antes del merge;
- usá una base por rama o recreá la base al cambiar de contexto;
- probá el conjunto completo de migraciones en CI;
- usá `outOfOrder` como excepción, no como costumbre.

## Error frecuente: pensar que el problema es solo de Git

En realidad, el conflicto no suele ser de Git.

Git solo te muestra el choque de archivos. El problema real está en la **historia de evolución del esquema**.

Dos archivos pueden mergear sin conflictos y, aun así, construir una secuencia de migraciones que no tenga sentido técnico.

Por eso, en Flyway, el trabajo en equipo no consiste solo en escribir SQL. También consiste en **coordinar la evolución de la base como un sistema compartido**.

## Resumen

Trabajar en equipo con Flyway exige más disciplina que trabajar solo.

Las ramas introducen problemas de numeración, orden, estado local de la base y compatibilidad entre cambios de esquema. La documentación oficial recomienda ser prudente con branching, generar migraciones desde la misma rama cuando sea posible y cuidar el estado de la base al cambiar de contexto.

Cuando una migración válida llega tarde, `outOfOrder` puede ayudarte, pero su valor por defecto es `false` y no reemplaza una estrategia sana de integración.

En pocas palabras: **Flyway funciona mejor en equipo cuando el proceso es claro, las ramas son cortas y las migraciones se prueban temprano**.

## Ejercicio práctico

Imaginá este escenario:

- `main` ya tiene aplicada `V10__crear_tabla_products.sql`;
- una rama A crea `V11__agregar_columna_stock.sql`;
- una rama B crea `V11__crear_tabla_categories.sql`;
- además, una rama C llega tarde con `V9_1__normalizar_nombres.sql`.

Respondé:

1. ¿qué conflicto aparece al mergear A y B?
2. ¿qué revisarías antes de decidir si `V9_1` debe aplicarse con `outOfOrder`?
3. ¿qué estrategia de equipo propondrías para reducir este tipo de problemas a futuro?

## Próximo paso

Ahora que ya viste cómo se complica Flyway en equipos, el siguiente tema natural es **buenas prácticas para desarrollo, testing, staging y producción**, para convertir todo esto en una estrategia operativa más estable.
