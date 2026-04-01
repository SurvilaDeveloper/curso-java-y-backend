---
title: "Convenciones de nombre y validación de migraciones"
description: "Cómo nombrar correctamente migraciones versionadas y repeatable, qué nombres considera válidos Flyway y cómo detectar archivos mal nombrados antes de que generen confusión."
order: 9
module: "Fundamentos de Flyway"
level: "base"
draft: false
---

# Convenciones de nombre y validación de migraciones

En el tema anterior vimos las **repeatable migrations** y cómo conviven con las migraciones versionadas.

Ahora vamos a trabajar algo que parece pequeño, pero en la práctica evita muchos problemas: **nombrar bien los archivos de migración**.

En Flyway, el nombre del archivo no es decorativo.

Del nombre salen datos clave como:

- el tipo de migración;
- la versión;
- la descripción;
- el orden en que se aplicará;
- la posibilidad de que Flyway la detecte o la ignore.

La meta de este tema es que entiendas la convención de nombres por defecto, sepas reconocer errores comunes y puedas configurar una validación más estricta para detectar archivos mal nombrados cuanto antes.

## Objetivos

Al finalizar este tema deberías poder:

- nombrar correctamente migraciones versionadas;
- nombrar correctamente repeatable migrations;
- entender qué partes del nombre interpreta Flyway;
- reconocer archivos inválidos o confusos;
- usar `validateMigrationNaming` para fallar rápido cuando haya nombres incorrectos.

## La idea central

Flyway descubre migraciones leyendo las ubicaciones configuradas y analizando el **nombre de cada archivo**.

Para migraciones SQL, la estructura general del nombre sigue este patrón:

```text
prefixVERSIONseparatorDESCRIPTIONsuffix
```

Con la configuración por defecto, eso se traduce en algo como:

```text
V1__crear_tabla_usuarios.sql
```

Ese nombre no está armado al azar.

Tiene estas partes:

- `V` → prefijo de migración versionada;
- `1` → versión;
- `__` → separador entre versión y descripción;
- `crear_tabla_usuarios` → descripción;
- `.sql` → sufijo.

## Convención por defecto para migraciones versionadas

Con los valores por defecto de Flyway, una migración versionada suele verse así:

```text
V1__crear_tabla_usuarios.sql
V2__agregar_columna_email.sql
V3__crear_indice_por_email.sql
```

### Qué exige Flyway

Una migración versionada tiene que cumplir al menos con estas ideas:

- usar el prefijo correcto;
- tener una **versión única**;
- usar el separador correcto;
- tener un sufijo permitido;
- respetar una forma de versión que Flyway pueda interpretar.

## Cómo puede ser la versión

La versión no tiene que ser obligatoriamente un entero simple.

Flyway admite versiones en notación con puntos o con guiones bajos, por ejemplo:

```text
V1__inicial.sql
V2__agregar_tabla_roles.sql
V1_1__ajuste_menor.sql
V1.2__agregar_indice.sql
V001.002__nuevo_campo.sql
```

Lo importante es que la versión sea **única** y que el equipo mantenga una convención consistente.

Para un curso y para muchos proyectos reales, una secuencia simple como `V1`, `V2`, `V3` suele ser más que suficiente.

## Convención por defecto para repeatable migrations

Las repeatable migrations usan otra convención.

Con la configuración por defecto, se nombran así:

```text
R__descripcion.sql
```

Ejemplos:

```text
R__vista_usuarios_activos.sql
R__funcion_calcular_totales.sql
R__datos_base_de_roles.sql
```

Fijate en la diferencia importante:

- las versionadas tienen versión;
- las repeatable no tienen versión;
- las repeatable se identifican por su descripción y por su checksum.

## Ejemplos correctos e incorrectos

### Correctos

```text
V1__crear_tabla_clientes.sql
V2__agregar_columna_telefono.sql
V3__normalizar_estados.sql
R__vista_clientes_activos.sql
```

### Incorrectos o problemáticos

```text
V1_crear_tabla_clientes.sql
V__crear_tabla_clientes.sql
1__crear_tabla_clientes.sql
V1__crear tabla clientes.sql
R_vista_clientes.sql
```

### Por qué están mal

- `V1_crear_tabla_clientes.sql` → le falta el separador por defecto `__`;
- `V__crear_tabla_clientes.sql` → no tiene versión válida;
- `1__crear_tabla_clientes.sql` → no tiene prefijo;
- `V1__crear tabla clientes.sql` → aunque a veces ciertos caracteres pueden funcionar, conviene evitar espacios para no generar ruido innecesario;
- `R_vista_clientes.sql` → no respeta la forma por defecto de una repeatable.

## Qué pasa si el nombre es inválido

Acá hay un detalle muy importante.

Flyway puede **ignorar archivos mal nombrados** si no activás una validación más estricta.

Eso puede ser peligroso, porque da la sensación de que el archivo “está en la carpeta”, pero en realidad no forma parte del flujo real de migración.

En otras palabras: el archivo existe en disco, pero Flyway no lo toma como una migración válida.

## validateMigrationNaming

Flyway tiene una configuración muy útil para este problema: `validateMigrationNaming`.

Si está en `false`, los archivos con nombres inválidos se ignoran y Flyway sigue normalmente.

Si está en `true`, Flyway falla rápido y te muestra cuáles son los archivos que no cumplen la convención esperada.

Eso es muy valioso en equipos, ramas largas o proyectos donde varias personas agregan migraciones.

## Activarlo en flyway.toml

Podés activarlo así:

```toml
[flyway]
validateMigrationNaming = true
```

También podrías usarlo desde línea de comandos:

```bash
flyway -validateMigrationNaming=true info
```

Una práctica muy sana es dejarlo activado desde temprano para evitar archivos “fantasma” que quedaron en la carpeta pero nunca entraron realmente en el ciclo de migración.

## Qué partes del nombre se pueden configurar

Flyway permite cambiar partes de la convención de nombres.

Por ejemplo, se pueden configurar:

- el prefijo de migraciones versionadas;
- el separador;
- los sufijos permitidos.

Con eso podrías apartarte del estilo clásico `V1__descripcion.sql`, pero en general conviene no hacerlo salvo que tengas una necesidad concreta.

Mientras más estándar sea la convención, más fácil será leer el proyecto, incorporar gente nueva y detectar errores visualmente.

## Buenas prácticas de nombres

### 1. Usar descripciones cortas pero claras

Esto:

```text
V7__agregar_indice_a_pedidos_por_fecha.sql
```

suele ser mejor que esto:

```text
V7__cambio.sql
```

La descripción no define la lógica técnica de Flyway, pero sí mejora muchísimo la legibilidad del historial.

### 2. Mantener un estilo uniforme

Por ejemplo, elegir una sola forma y sostenerla:

- todo en minúsculas;
- palabras separadas por guiones bajos;
- verbos claros como `crear`, `agregar`, `normalizar`, `actualizar`.

### 3. No usar nombres demasiado ambiguos

Evitá cosas como:

```text
V8__fix.sql
V9__update.sql
V10__cambios.sql
```

Funcionan peor cuando meses después intentás entender qué hizo cada paso.

### 4. No cambiar nombres de migraciones ya aplicadas sin entender el impacto

Si renombrás una migración ya aplicada, podés generar inconsistencias entre los archivos del repositorio y lo que quedó registrado en `flyway_schema_history`.

Por eso, antes de renombrar algo ya ejecutado en entornos permanentes, hay que entender bien el efecto y, si corresponde, usar herramientas como `repair` con criterio.

## Ejemplo práctico

Supongamos esta carpeta:

```text
sql/
  V1__crear_tabla_usuarios.sql
  V2__agregar_columna_email.sql
  V3_agregar_indice_email.sql
  R__vista_usuarios_activos.sql
```

A simple vista parece que hay cuatro migraciones.

Pero en realidad la tercera está mal nombrada porque usa un solo guion bajo después de la versión.

Si no tenés una validación estricta, podrías pasar bastante tiempo sin darte cuenta de que ese archivo no estaba entrando en el flujo como esperabas.

Con `validateMigrationNaming = true`, Flyway te ayuda a detectarlo enseguida.

## Una regla práctica muy útil

Cuando agregues una migración nueva, revisá mentalmente estas preguntas:

1. ¿Es versionada o repeatable?
2. ¿Tiene el prefijo correcto?
3. ¿Tiene versión válida si corresponde?
4. ¿Usa el separador correcto?
5. ¿La descripción es clara?
6. ¿El sufijo está dentro de los permitidos?

Si respondés bien esas seis cosas, el nombre del archivo casi seguro estará en buen estado.

## Errores comunes en equipos

En equipos reales aparecen mucho estos problemas:

- dos personas crean `V12` al mismo tiempo;
- alguien sube un archivo con un nombre mal escrito;
- se cambia el separador sin querer;
- se usan descripciones demasiado parecidas;
- se renombran migraciones ya aplicadas sin evaluar consecuencias.

Por eso no alcanza con “saber la convención”.

También conviene incorporar validaciones y revisar los nombres como parte normal del trabajo diario.

## Cierre

En Flyway, el nombre del archivo forma parte del contrato de la migración.

No es un detalle cosmético.

De él dependen el reconocimiento del script, su orden, su tipo y la claridad del historial.

Trabajar con una convención simple, consistente y validada te evita muchos errores silenciosos.

En el próximo tema vamos a meternos en otro escenario muy común en proyectos reales: **cómo empezar a usar Flyway sobre una base que ya existe**, es decir, cómo funciona el concepto de **baseline**.
