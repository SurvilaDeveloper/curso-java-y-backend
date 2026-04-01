---
title: "Qué pasa cuando falla una migración"
description: "Cómo reacciona Flyway ante una migración fallida, qué cambia según el motor de base de datos y cómo pensar el diagnóstico sin improvisar."
order: 12
module: "Control y recuperación de migraciones"
level: "base"
draft: false
---

# Qué pasa cuando falla una migración

Hasta acá vimos el flujo normal de Flyway:

- detectar migraciones pendientes;
- ejecutarlas en orden;
- registrar el resultado en `flyway_schema_history`;
- seguir avanzando de forma incremental.

Ese es el camino feliz.

Pero en proyectos reales tarde o temprano aparece el otro escenario:

- un `CREATE TABLE` tiene un error;
- un `ALTER TABLE` falla porque la estructura real no coincide con lo esperado;
- una migración intenta insertar datos que violan una restricción;
- el script funciona en desarrollo pero no en otro entorno;
- un cambio queda a mitad de camino.

Y ahí aparece una pregunta muy importante:

> ¿qué hace Flyway cuando una migración falla?

La respuesta corta es:

- **detiene la ejecución**;
- **marca la migración como fallida**;
- e **intenta hacer rollback si el motor lo permite y la migración estaba dentro de una transacción**.

Pero entender bien ese comportamiento requiere un poco más de detalle.

## Objetivos

Al finalizar este tema deberías poder:

- entender qué hace Flyway cuando una migración falla;
- distinguir entre motores con buen soporte transaccional y motores con commits implícitos;
- interpretar el efecto de una falla sobre `flyway_schema_history`;
- saber por qué no conviene improvisar sobre una base parcialmente modificada;
- preparar el terreno para el uso correcto de `repair` en el tema siguiente.

## La primera idea clave: Flyway se detiene

Cuando una migración falla, Flyway no sigue con la siguiente como si nada.

El proceso se corta en el punto del error.

Eso significa que, si tenías varias migraciones pendientes:

```text
V12__crear_tabla_clientes.sql
V13__agregar_columna_estado.sql
V14__cargar_datos_iniciales.sql
```

y falla `V13`, entonces:

- `V12` puede haber quedado aplicada con éxito;
- `V13` falla;
- `V14` no se ejecuta.

Esta decisión es muy importante porque evita que el proyecto siga avanzando sobre una base cuyo estado ya no es confiable.

## La segunda idea clave: Flyway intenta rollback si puede

Flyway ejecuta cada migración en una transacción separada por defecto.

Entonces, si una migración falla, intenta volver al estado anterior **si el motor de base de datos soporta correctamente transacciones DDL** o si el tipo de cambio realmente puede revertirse dentro de una transacción.

En motores donde esto funciona bien, una falla suele dejar la base como estaba antes de esa migración.

Esa es la situación más cómoda.

## Pero no todas las bases se comportan igual

Acá está uno de los puntos más importantes del tema.

No todos los motores manejan los cambios de esquema de la misma manera.

Hay motores que permiten ejecutar DDL dentro de una transacción con rollback razonable.

Y hay otros donde ciertos comandos hacen **commit implícito** antes o después de ejecutarse.

Eso cambia completamente la situación.

### Cuando el rollback funciona bien

En una base con buen soporte para DDL transaccional, si una migración falla:

- Flyway informa el error;
- hace rollback si corresponde;
- detiene el proceso;
- y el estado de la base suele quedar consistente respecto del punto anterior.

### Cuando no hay rollback limpio

En motores con commits implícitos o con soporte limitado para DDL transaccional, una migración fallida puede dejar:

- una tabla creada pero incompleta;
- una columna agregada aunque el resto del script falló;
- índices o constraints parcialmente aplicados;
- cambios reales en la base aunque la migración no haya terminado bien.

En ese escenario Flyway no puede “deshacer mágicamente” lo que el propio motor ya confirmó.

Por eso una migración fallida no siempre significa “no pasó nada”.

A veces significa exactamente lo contrario:

> pasó algo, pero quedó a medio camino.

## Qué pasa en el historial

Cuando una migración falla, lo que veas en `flyway_schema_history` depende del contexto técnico.

La idea general es esta:

- si la migración pudo revertirse limpiamente, el estado suele quedar mucho más simple de recuperar;
- si no pudo revertirse, Flyway puede dejar registrada una entrada fallida para señalar que la historia quedó inconsistente y que no debe continuarse como si nada hubiera pasado.

Eso es importante porque Flyway no quiere permitir que sigas migrando sobre una base en estado dudoso.

## Un ejemplo conceptual

Supongamos esta migración:

```sql
CREATE TABLE orders (
  id BIGINT PRIMARY KEY,
  status VARCHAR(30) NOT NULL
);

ALTER TABLE orders
ADD CONSTRAINT chk_orders_status
CHECK (status IN ('PENDING', 'PAID', 'CANCELLED'));

INSERT INTO orders (id, status)
VALUES (1, 'UNKNOWN');
```

El `INSERT` final viola la restricción.

¿Qué puede pasar?

### Escenario A: rollback limpio

Si el motor y la ejecución permiten rollback real:

- falla el `INSERT`;
- la migración completa se revierte;
- la tabla `orders` no queda creada;
- el proceso se detiene.

### Escenario B: cambios parciales

Si hubo commits implícitos o la base no soporta revertir bien ese DDL:

- puede fallar el `INSERT`;
- pero la tabla `orders` ya quedar creada;
- incluso el `CHECK` podría haber quedado aplicado;
- Flyway detiene el proceso y deja constancia del problema.

A partir de ahí, no deberías seguir ejecutando migraciones sin revisar qué quedó realmente en la base.

## Por qué esto importa tanto en la práctica

Porque una migración fallida no es solo “un error de consola”.

Es un evento que puede afectar tres cosas al mismo tiempo:

1. el estado real de la base;
2. el historial que Flyway tiene registrado;
3. la confianza del equipo en que ambos siguen alineados.

Cuando esas tres cosas dejan de coincidir, ya no alcanza con “corregir el SQL y volver a correr”.

Primero hay que entender qué ocurrió.

## Qué NO conviene hacer

Cuando una migración falla, hay varias reacciones impulsivas que suelen empeorar el problema.

### 1. Editar el script y volver a correr sin mirar nada

Si el archivo ya alcanzó a registrarse o si la base quedó parcialmente modificada, cambiar el contenido y ejecutar de nuevo puede agrandar la inconsistencia.

### 2. Aplicar arreglos manuales sin documentarlos

Cambiar tablas a mano para “destrabar” la situación puede desalinear todavía más la base respecto de las migraciones en disco.

### 3. Ignorar el historial

No alcanza con ver que “la tabla parece estar”. Hay que mirar también qué cree Flyway que pasó.

### 4. Seguir con migraciones nuevas

Agregar nuevas versiones encima de un estado incierto casi siempre complica el diagnóstico.

## Qué SÍ conviene hacer

Frente a una falla, lo más sano suele ser este enfoque:

1. **leer con calma el error exacto**;
2. **identificar qué migración falló**;
3. **revisar qué objetos llegaron a crearse o modificarse realmente**;
4. **consultar `flyway info` y la tabla `flyway_schema_history`**;
5. **decidir si corresponde limpiar cambios parciales, restaurar, reconstruir el entorno o reparar el historial**.

La idea es recuperar primero un estado consistente.

Recién después seguir avanzando.

## Un detalle importante sobre `group`

Flyway también puede agrupar todas las migraciones pendientes dentro de una sola transacción con la opción `group = true` en motores compatibles.

En ese caso, si algo falla dentro del grupo y la base soporta ese modelo de transacción, el rollback puede abarcar toda la corrida pendiente.

Eso cambia el alcance del retroceso.

Pero no elimina la limitación de fondo:

- si el motor no soporta bien DDL transaccional;
- o si alguna migración es no transaccional;
- entonces el rollback perfecto puede no ser posible.

## Diferencia entre “falló” y “quedó inconsistente”

Conviene separar estas dos ideas.

### Falló

Hubo un error y Flyway detuvo el proceso.

### Quedó inconsistente

Además del error, el estado real de la base y el historial de Flyway ya no están alineados de forma segura.

Muchas veces una falla trae ambas cosas juntas.

Y ahí es donde entra el tema siguiente: **cómo usar `repair` correctamente**.

## Cómo pensar la recuperación según el entorno

La estrategia no siempre es la misma.

### En desarrollo

Suele haber más margen para:

- borrar objetos parciales;
- reconstruir la base;
- usar `clean` si el entorno lo permite;
- rehacer el flujo desde una versión anterior.

### En testing o staging

Conviene ser más cuidadoso:

- revisar el impacto completo;
- confirmar el estado del esquema;
- decidir si reconstruir el entorno o repararlo.

### En producción

La prioridad pasa a ser:

- entender con precisión qué cambió;
- minimizar riesgo;
- evitar arreglos improvisados;
- recuperar consistencia con un procedimiento controlado.

## Buenas prácticas para reducir problemas cuando una migración falla

- mantené cada migración enfocada en un cambio claro;
- evitá scripts gigantes con demasiadas responsabilidades;
- probá las migraciones en una base parecida al entorno real;
- entendé si tu motor soporta rollback de DDL de forma confiable;
- revisá siempre el estado posterior a una falla antes de tocar nada;
- no asumas que “si falló, entonces no cambió nada”.

## Ejercicio práctico

1. Creá una migración de prueba que:
   - cree una tabla;
   - agregue una restricción;
   - y luego intente insertar un valor inválido.
2. Ejecutala sobre una base de desarrollo.
3. Observá el error que devuelve Flyway.
4. Revisá `flyway info`.
5. Inspeccioná manualmente la base para ver qué objetos quedaron creados y cuáles no.
6. Anotá si el comportamiento fue de rollback limpio o de cambio parcial.
7. Repetí el ejercicio con otra migración más pequeña para comparar.

## Cierre

Cuando una migración falla, Flyway no sigue avanzando a ciegas.

Detiene la ejecución, informa el error, intenta rollback cuando el motor lo permite y, si hace falta, deja evidencia de que el historial requiere atención antes de continuar.

La enseñanza importante no es solo técnica, sino operativa:

> una migración fallida no se resuelve apurándose, sino recuperando primero un estado consistente.

Esa consistencia puede depender de:

- lo que hizo realmente la base;
- lo que quedó registrado en `flyway_schema_history`;
- y la estrategia que elijas para volver a alinear ambos mundos.

## Próximo tema

En el siguiente tema vamos a ver **`repair`**, cuándo corresponde usarlo, qué problema resuelve de verdad y por qué nunca debería reemplazar la revisión del estado real de la base.
