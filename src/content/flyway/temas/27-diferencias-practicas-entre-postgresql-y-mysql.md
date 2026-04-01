---
title: "Diferencias prácticas entre PostgreSQL y MySQL al usar Flyway"
description: "Qué cambia al trabajar con Flyway sobre PostgreSQL o MySQL, qué diferencias importan de verdad en la práctica y cómo adaptar tus migraciones según el motor." 
order: 27
module: "Trabajo profesional con Flyway"
level: "intermedio"
draft: false
---

# Diferencias prácticas entre PostgreSQL y MySQL al usar Flyway

Hasta acá vimos Flyway como una herramienta bastante general.

Y en parte lo es: versionás migraciones, corrés `migrate`, inspeccionás con `info`, validás con `validate` y seguís evolucionando el esquema.

Pero cuando empezás a trabajar con bases reales aparece una verdad importante: **Flyway no se usa exactamente igual en todos los motores**.

No porque la herramienta cambie por completo, sino porque **cada base de datos tiene reglas, limitaciones y comportamientos propios**.

En este tema vamos a comparar dos motores muy comunes en proyectos reales: **PostgreSQL** y **MySQL**.

La idea no es decidir cuál es “mejor”, sino entender **qué cambia en la práctica cuando usás Flyway sobre uno u otro**.

## Objetivos del tema

Al finalizar este tema deberías poder:

- distinguir qué cosas de Flyway se mantienen iguales entre PostgreSQL y MySQL;
- reconocer diferencias importantes de comportamiento al ejecutar migraciones;
- entender por qué las transacciones no se sienten igual en ambos motores;
- adaptar scripts y configuración según el motor que estés usando;
- evitar errores comunes cuando cambiás de un entorno PostgreSQL a uno MySQL, o al revés.

## Lo que no cambia

Antes de mirar diferencias, conviene recordar algo.

Hay varias piezas de Flyway que **funcionan igual sin importar el motor**:

- las migraciones versionadas se aplican una sola vez y en orden;
- las repeatable se vuelven a ejecutar cuando cambia su checksum;
- `flyway_schema_history` registra qué pasó;
- `validate` sirve para detectar inconsistencias;
- `repair` no reemplaza una buena disciplina de trabajo.

En otras palabras: **la filosofía del flujo no cambia**.

Lo que cambia es el terreno donde ese flujo corre.

## La diferencia más importante: el comportamiento transaccional no es el mismo

Esta es, probablemente, la diferencia práctica más importante de todas.

Flyway envuelve cada migración en una transacción y las aplica en orden. Si una falla, hace rollback **si eso es posible**.

El detalle clave está justo ahí: **“si eso es posible”**.

### PostgreSQL

PostgreSQL tiene muy buen soporte para ejecutar DDL dentro de transacciones.

Eso hace que la experiencia con Flyway sea, en muchos casos, más predecible:

- una migración falla;
- Flyway detiene el proceso;
- y el rollback suele ser mucho más confiable para cambios estructurales.

### MySQL

En MySQL la historia cambia.

La documentación oficial de Flyway distingue este caso del de motores con sentencias que directamente no pueden ejecutarse en transacción. En MySQL puede ocurrir que una sentencia DDL provoque **commits implícitos** antes y después de ejecutarse.

Eso significa que, aunque uses Flyway, **no siempre vas a sentir el mismo nivel de reversibilidad que en PostgreSQL**.

## Qué impacto tiene eso en tu trabajo diario

En un proyecto PostgreSQL, una migración fallida suele dejarte una sensación de flujo más limpio.

En un proyecto MySQL, en cambio, conviene trabajar con una mentalidad un poco más conservadora:

- revisar mejor scripts potencialmente sensibles;
- evitar cambios muy grandes en una sola migración;
- y asumir que una falla puede requerir más intervención manual.

Por eso, cuando una migración falla en una base sin soporte fuerte de DDL transaccional, Flyway recomienda:

1. deshacer manualmente los cambios parciales si quedaron efectos en la base;
2. ejecutar `repair` sobre el historial;
3. corregir la migración;
4. y volver a intentar.

## PostgreSQL tiene un caso especial muy importante: `CREATE INDEX CONCURRENTLY`

PostgreSQL tiene una ventaja fuerte en transacciones, pero también trae sus propias particularidades.

Una de las más conocidas aparece con `CREATE INDEX CONCURRENTLY`.

Flyway usa por defecto un **transactional advisory lock** con PostgreSQL. La documentación oficial aclara que esto puede generar problemas con sentencias como `CREATE INDEX CONCURRENTLY`.

En esos casos, se puede cambiar a **session-level locks** configurando:

```bash
./flyway -postgresql.transactional.lock=false migrate
```

La idea importante no es memorizar el flag, sino entender esto:

**en PostgreSQL hay operaciones especiales que te obligan a pensar mejor la transaccionalidad y los locks**.

## MySQL tiene sus propios detalles de sintaxis

Con MySQL hay una diferencia muy práctica que suele aparecer rápido cuando trabajás con procedimientos almacenados.

La documentación oficial indica que Flyway respeta el uso de `DELIMITER` para cambiar el delimitador en scripts MySQL, algo muy útil cuando necesitás incluir varios `;` dentro de un procedimiento.

Ejemplo conceptual:

```sql
DELIMITER //

CREATE PROCEDURE actualizar_precios()
BEGIN
    UPDATE products SET price = price * 1.05;
    UPDATE products SET updated_at = CURRENT_TIMESTAMP;
END //

DELIMITER ;
```

Esto no es un detalle menor.

Si venís de PostgreSQL, donde muchas veces resolvés lógica procedural de otra forma, podés encontrarte con que en MySQL el script necesita una atención especial al delimitador.

## PostgreSQL también tiene su propia sintaxis “no compatible” con Flyway

En PostgreSQL hay otra advertencia práctica: la documentación oficial dice que Flyway **no soporta meta-comandos de `psql`** que no tengan equivalente JDBC, como `\set`.

Eso significa que un script que funciona en tu consola `psql` **no necesariamente es un script válido para Flyway**.

Este tipo de diferencia es muy importante cuando alguien del equipo prueba cosas manualmente en consola y luego copia ese mismo archivo al directorio de migraciones.

## No siempre alcanza con “saber SQL”

Un error común es pensar:

> “Si sé SQL para PostgreSQL o MySQL, entonces ya sé escribir migraciones para Flyway.”

No del todo.

Con Flyway no solo importa que el SQL sea válido para el motor. También importa:

- cómo se comporta dentro o fuera de una transacción;
- si necesita configuración especial;
- si depende de una herramienta interactiva como `psql`;
- y si su ejecución automática en pipeline va a comportarse igual que en tu consola local.

## Otra diferencia práctica: la dependencia del driver en proyectos Java

En proyectos Java, la integración también cambia un poco según el motor.

La documentación oficial actual indica que **MySQL requiere una dependencia específica** para acceder a sus capacidades en un proyecto Java:

- `org.flywaydb:flyway-mysql` en la variante Open Source;
- o `com.redgate.flyway:flyway-mysql` en la variante Redgate.

Además, la misma documentación aclara un detalle importante:

- si no hay un driver MySQL en el classpath, Flyway puede usar MariaDB como fallback;
- y si no querés ese comportamiento, podés deshabilitarlo;
- desde Flyway 10.7.0, la CLI ya no acepta por defecto URLs MySQL usando el driver MariaDB incluido, salvo que agregues `permitMysqlScheme=true` a la URL.

Este es un ejemplo perfecto de diferencia “chica” pero muy real:

**dos proyectos pueden tener el mismo esquema de migraciones y, aun así, diferir en cómo resuelven la conectividad según el motor**.

## PostgreSQL y MySQL no deberían mezclarse a la ligera entre ambientes

Hay una pregunta clásica:

> “¿Puedo desarrollar con un motor y desplegar en otro?”

Técnicamente, a veces podés hacer ciertas pruebas parciales.

Pero desde el punto de vista práctico, Flyway y su documentación sugieren una idea mucho más sana: **si podés, usá el mismo tipo de base en test y producción**.

¿Por qué?

Porque cambiar de motor introduce una nueva fuente de diferencia:

- cambia la sintaxis;
- cambia el comportamiento transaccional;
- cambian ciertas capacidades del SQL;
- cambian funciones, tipos y detalles del dialecto.

Y todo eso aumenta la probabilidad de que algo funcione en un ambiente y falle en otro.

## Cuando sí necesitás soportar ambos motores

A veces no queda otra.

Por ejemplo:

- tu producto soporta PostgreSQL y MySQL para clientes distintos;
- migraste de un motor a otro y todavía convivís con ambos;
- o querés ofrecer una aplicación portable entre motores.

En esos casos, una estrategia razonable es separar migraciones comunes y migraciones específicas por motor usando `locations`.

La propia FAQ de Flyway muestra esta idea con bases distintas en test y prod.

## Ejemplo conceptual de estructura por motor

```text
sql/
  common/
    V1__create_core_tables.sql
    V2__add_basic_indexes.sql
  postgresql/
    V3__create_search_function.sql
  mysql/
    V3__create_search_procedure.sql
```

Y luego podrías configurar algo conceptual como esto:

### Para PostgreSQL

```properties
flyway.locations=filesystem:sql/common,filesystem:sql/postgresql
```

### Para MySQL

```properties
flyway.locations=filesystem:sql/common,filesystem:sql/mysql
```

Eso sí: esta estrategia suma flexibilidad, pero también suma complejidad.

Cada vez que bifurcás el historial por motor, te obligás a pensar mejor:

- qué parte del cambio es realmente común;
- qué parte depende del dialecto;
- y cómo vas a mantener ambas variantes sin que se desordenen.

## Qué conviene hacer si trabajás con PostgreSQL

Si tu proyecto usa PostgreSQL, suele convenir prestar atención especial a:

- sentencias que no pueden ejecutarse cómodamente dentro de una transacción;
- operaciones como `CREATE INDEX CONCURRENTLY`;
- funciones, vistas materializadas y objetos avanzados del motor;
- scripts que fueron pensados para `psql` y no para ejecución vía JDBC.

Además, PostgreSQL suele prestarse muy bien a flujos donde querés aprovechar al máximo la previsibilidad transaccional.

## Qué conviene hacer si trabajás con MySQL

Si tu proyecto usa MySQL, suele convenir prestar atención especial a:

- cambios DDL que podrían dejar efectos parciales ante un error;
- procedimientos o scripts que necesiten `DELIMITER`;
- conectividad y dependencias del driver en proyectos Java;
- diferencias entre usar driver MySQL nativo o fallback con MariaDB.

En MySQL, muchas veces vale la pena ser todavía más disciplinado con el tamaño y la claridad de cada migración.

## Ni PostgreSQL ni MySQL “arruinan” Flyway

A veces estas comparaciones generan una falsa idea:

- que PostgreSQL hace que Flyway sea perfecto;
- o que MySQL hace que Flyway sea incómodo.

No es así.

Flyway funciona bien con ambos.

Lo importante es entender que **la ergonomía no es idéntica**.

PostgreSQL suele darte una sensación más fuerte de seguridad transaccional para ciertos cambios.
MySQL, en cambio, te pide más atención a detalles operativos y a la posibilidad de efectos parciales en operaciones DDL.

## Ejercicio recomendado

1. Creá una migración simple compatible con PostgreSQL y MySQL.
2. Después diseñá una segunda migración que ya no sea totalmente portable entre ambos motores.
3. Separá esas migraciones en `sql/common`, `sql/postgresql` y `sql/mysql`.
4. Probá ejecutar Flyway apuntando a cada motor con `locations` distintas.
5. Anotá qué diferencias encontraste en sintaxis, ejecución y comportamiento ante errores.

## Errores comunes

- asumir que PostgreSQL y MySQL se comportan igual frente a una migración fallida;
- copiar scripts de `psql` a Flyway sin revisar meta-comandos incompatibles;
- ignorar el uso de `DELIMITER` en scripts MySQL más complejos;
- mezclar motores entre test y producción como si no importara;
- no separar ubicaciones cuando realmente hay SQL específico por motor;
- olvidar dependencias o detalles de driver al integrar Flyway en Java.

## Idea clave para llevarte

Flyway mantiene el mismo modelo mental en PostgreSQL y MySQL.

Pero el motor **sí importa**.

- En PostgreSQL, mirá de cerca transacciones, locks y sentencias especiales.
- En MySQL, mirá de cerca DDL, delimitadores y detalles de conectividad.
- En ambos, mantené disciplina, scripts claros y ambientes lo más parecidos posible.

Cuando entendés esas diferencias, dejás de usar Flyway de forma genérica y empezás a usarlo de manera realmente profesional.
