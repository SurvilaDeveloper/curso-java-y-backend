---
title: "baselineOnMigrate: utilidad y riesgos"
description: "Qué hace baselineOnMigrate, cuándo conviene usarlo y por qué puede ser cómodo pero también peligroso si la configuración apunta a la base equivocada."
order: 11
module: "Fundamentos de Flyway"
level: "base"
draft: false
---

# baselineOnMigrate: utilidad y riesgos

En el tema anterior vimos el concepto de **baseline** sobre una base ya existente.

La forma más explícita de hacerlo es esta:

1. revisar la base existente;
2. definir una `baselineVersion` coherente;
3. ejecutar `flyway baseline`;
4. recién después correr `flyway migrate`.

Ese flujo es claro y seguro.

Pero Flyway ofrece una opción más cómoda para ciertos casos: **`baselineOnMigrate`**.

La idea general es simple:

> cuando ejecutás `migrate`, Flyway puede hacer el baseline automáticamente si detecta una base no vacía sin historial.

Suena práctico, y muchas veces lo es.

Pero también es una de esas opciones que conviene entender muy bien antes de activarla en un entorno real.

## Objetivos

Al finalizar este tema deberías poder:

- entender qué hace `baselineOnMigrate`;
- diferenciarlo del uso manual de `baseline`;
- reconocer en qué casos puede ahorrar trabajo;
- entender por qué también puede quitar una capa importante de seguridad;
- decidir cuándo activarlo y cuándo evitarlo.

## Qué hace baselineOnMigrate

`baselineOnMigrate` es una configuración booleana.

Cuando está activada, Flyway puede **invocar automáticamente el baseline** durante `migrate` si se da esta situación:

- el esquema no está vacío;
- no existe todavía la tabla de historial de Flyway;
- la corrida está intentando empezar a administrar esa base.

En ese caso, Flyway toma la `baselineVersion` configurada, registra el punto de arranque y luego sigue con la migración normal.

Dicho de forma práctica:

- en vez de hacer `baseline` y después `migrate`;
- hacés directamente `migrate`;
- y Flyway resuelve el baseline por vos cuando corresponde.

## Qué pasa después del baseline automático

El efecto conceptual es el mismo que vimos en el tema anterior.

Si una base queda baselinada en una versión determinada, entonces:

- las migraciones **hasta esa versión** se consideran previas al arranque administrado por Flyway;
- las migraciones **por encima de esa versión** sí podrán ejecutarse.

### Ejemplo mental

Supongamos este conjunto de migraciones:

```text
V1__crear_tabla_usuarios.sql
V2__crear_tabla_roles.sql
V3__crear_tabla_pedidos.sql
V4__agregar_columna_telefono.sql
```

Y supongamos también que tu base real ya contiene el estado equivalente a `V1`, `V2` y `V3`, pero todavía no tiene `flyway_schema_history`.

Si configurás:

```toml
[flyway]
baselineVersion = "3"
baselineOnMigrate = true
```

entonces al ejecutar:

```bash
flyway migrate
```

Flyway podrá:

1. reconocer que el esquema no está vacío;
2. ver que no hay historial todavía;
3. hacer el baseline automático en la versión 3;
4. aplicar recién `V4` y las migraciones posteriores.

## Diferencia con ejecutar baseline manualmente

El resultado puede ser parecido, pero el flujo operativo no es igual.

### Con baseline manual

Vos separás el proceso en dos pasos visibles:

1. `flyway baseline`
2. `flyway migrate`

Eso te obliga a pensar conscientemente:

- a qué base estás apuntando;
- qué versión vas a marcar;
- si realmente querés empezar a administrar esa base con Flyway;
- si ese entorno está listo para entrar al flujo versionado.

### Con baselineOnMigrate

Todo eso queda condensado dentro de una sola corrida de `migrate`.

Es más cómodo, pero también menos explícito.

## Por qué puede ser útil

Hay escenarios donde `baselineOnMigrate` tiene sentido.

### 1. Primera adopción controlada en un entorno existente

Si ya revisaste bien la base, sabés cuál es la `baselineVersion` correcta y querés simplificar el primer despliegue, puede ahorrarte un paso.

### 2. Automatizaciones o pipelines simples

En ciertos flujos automatizados puede resultar conveniente que el propio `migrate` resuelva el baseline inicial sin requerir un paso manual separado.

### 3. Menos fricción en entornos bien conocidos

Si el equipo tiene muy claro el estado de los entornos y la configuración está cerrada, puede ser una forma práctica de iniciar Flyway sobre una base existente.

## Por qué puede ser riesgoso

Acá está la parte importante del tema.

`baselineOnMigrate` no es peligroso porque “rompa Flyway”.

Es riesgoso porque **reduce una barrera de seguridad**.

Cuando usás baseline manual, Flyway no avanza hasta que vos hagas explícitamente esa operación.

Cuando activás `baselineOnMigrate`, una simple corrida de `migrate` puede baselinar una base no vacía automáticamente.

Eso significa que, si la configuración apunta a la base equivocada, podrías:

- registrar un baseline donde no querías hacerlo;
- dar por válido un estado que no revisaste;
- empezar a administrar una base incorrecta como si fuera el punto de partida correcto.

## La advertencia mental que conviene recordar

Podés pensar esta opción así:

> `baselineOnMigrate` es cómoda, pero saca del medio una confirmación operativa que muchas veces te protege de errores de entorno.

En ambientes delicados, esa comodidad puede salir cara.

## Un escenario de error bastante real

Imaginá que tenés estas bases:

- `app_dev`
- `app_test`
- `app_prod`

Tu intención era correr el primer baseline sobre `app_test`.

Pero por un error en la URL, una variable de entorno o un archivo de configuración, terminás apuntando a otra base no vacía.

Si `baselineOnMigrate` está activado, `migrate` podría:

- detectar que esa base no está vacía;
- crear el historial;
- baselinarla;
- y seguir adelante.

Es decir: el error inicial no necesariamente se detiene con una pausa humana intermedia.

Por eso esta opción exige una disciplina mayor con:

- credenciales;
- URLs de conexión;
- archivos de configuración;
- separación por entorno;
- revisión previa del destino.

## El caso de una base aparentemente vacía

Hay otro detalle fino que vale la pena conocer.

Flyway decide si la base está vacía o no revisando los esquemas configurados.

Y si la base **parece vacía** y además existe una baseline migration relevante, Flyway puede intentar ejecutarla como parte de `migrate`.

Eso no cambia la idea principal del tema, pero sí muestra que Flyway toma decisiones en función del estado que observa en los esquemas configurados.

Por eso una buena configuración de `schemas`, `defaultSchema` y `locations` sigue siendo muy importante.

## Valor por defecto

`baselineOnMigrate` tiene un detalle revelador: su valor por defecto es **`false`**.

Eso ya te da una pista del enfoque recomendado.

Flyway no la activa por defecto porque el baseline inicial sobre una base existente es una operación sensible y conviene que no ocurra de manera implícita salvo que vos lo decidas.

## Cómo se configura

### Línea de comandos

```bash
flyway -baselineOnMigrate="true" migrate
```

### flyway.toml

```toml
[flyway]
baselineOnMigrate = true
baselineVersion = "3"
```

### En Maven

```xml
<configuration>
  <baselineOnMigrate>true</baselineOnMigrate>
  <baselineVersion>3</baselineVersion>
</configuration>
```

## Cuándo conviene usarlo

Podés considerarlo cuando se cumplan estas condiciones:

- la base existente ya fue revisada;
- la `baselineVersion` está clara;
- el entorno destino está bien identificado;
- el equipo entiende qué va a pasar en la primera corrida;
- la comodidad operativa compensa la pérdida de esa verificación manual extra.

## Cuándo conviene evitarlo

Suele ser mejor evitarlo cuando:

- estás adoptando Flyway por primera vez en producción y querés máxima explicitud;
- todavía no estás seguro de la versión correcta de baseline;
- los entornos no están bien ordenados;
- las configuraciones cambian mucho entre máquina local, CI y servidores;
- querés que el alta inicial en Flyway sea una decisión humana separada y visible.

## Regla práctica

Una regla simple puede ser esta:

### Preferí baseline manual si...

- es la primera vez que incorporás una base importante a Flyway;
- querés revisar cada paso;
- necesitás una operación más segura y explícita.

### Considerá baselineOnMigrate si...

- ya entendés bien el estado de la base;
- el entorno está controlado;
- querés simplificar la automatización inicial;
- aceptás conscientemente el riesgo de quitar esa barrera extra.

## Errores comunes

### 1. Activarlo “porque sí”

No debería activarse solo para escribir menos comandos.

### 2. No definir bien la baselineVersion

`baselineOnMigrate` no resuelve una mala elección de versión. Solo automatiza el momento del baseline.

### 3. Confiar en que Flyway “adivina” el contexto correcto

Flyway aplica reglas. No entiende la intención del equipo ni el valor del entorno al que estás apuntando.

### 4. Usarlo en entornos desordenados

Si tus bases downstream no están alineadas, el problema no se arregla activando esta opción.

## Buenas prácticas

- usá `baselineOnMigrate` solo cuando entiendas perfectamente su efecto;
- configurá explícitamente la `baselineVersion`;
- verificá muy bien la conexión antes de la primera corrida;
- mantené separadas las configuraciones por entorno;
- en producción, preferí operaciones deliberadas y fáciles de auditar;
- revisá `flyway info` después de la ejecución para confirmar que el historial quedó como esperabas.

## Ejercicio práctico

1. Prepará una base de prueba que ya tenga algunas tablas creadas manualmente.
2. Creá migraciones `V1`, `V2`, `V3` y `V4` que representen la evolución lógica de esa base.
3. Configurá `baselineVersion = "3"`.
4. Ejecutá primero el flujo clásico:
   - `flyway baseline`
   - `flyway migrate`
5. Observá el resultado en `flyway_schema_history`.
6. Reiniciá la base de prueba.
7. Ahora configurá `baselineOnMigrate = true`.
8. Ejecutá solo `flyway migrate`.
9. Compará el resultado final con el caso anterior.
10. Anotá qué cambia en la operación y qué riesgo operativo desaparece o aparece en cada enfoque.

## Cierre

`baselineOnMigrate` es una comodidad útil para ciertos flujos de adopción de Flyway sobre bases existentes.

Su valor está en que simplifica el primer arranque administrado: un solo `migrate` puede reconocer la base, baselinarla y seguir con las migraciones nuevas.

Pero justamente por eso hay que usarla con criterio.

Cuando la activás, estás cambiando esto:

- de una operación explícita en dos pasos;
- a una operación más automática y menos visible.

A veces eso es una ventaja.

Otras veces, especialmente en entornos sensibles, es una forma innecesaria de perder una protección útil.

## Próximo tema

En el siguiente tema vamos a ver **qué pasa cuando falla una migración**, cómo se refleja en el historial y cómo pensar el diagnóstico sin improvisar sobre una base a medio cambiar.
