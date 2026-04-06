---
title: "Native queries peligrosas"
description: "Qué riesgos de seguridad aparecen al usar native queries en aplicaciones Java con Spring Boot. Cuándo están justificadas, por qué reabren errores clásicos de acceso a datos y cómo evitar injection, sobreexposición y filtros inseguros en SQL nativo."
order: 67
module: "SQL Injection, JPA y persistencia segura"
level: "base"
draft: false
---

# Native queries peligrosas

## Objetivo del tema

Entender qué riesgos aparecen cuando una aplicación Java + Spring Boot usa **native queries**, es decir, SQL escrito de forma más directa en vez de apoyarse solamente en:

- JPA
- Hibernate
- JPQL
- métodos derivados de repository

La idea no es demonizar las native queries.
A veces son necesarias y totalmente válidas.

Pero sí entender algo importante:

> cuanto más cerca volvés a SQL manual, más fácil es reintroducir errores clásicos de seguridad, autorización y exposición de datos.

---

## Idea clave

Una native query no es insegura por existir.

El problema aparece cuando se la usa sin disciplina y se convierte en un lugar donde vuelven patrones como:

- concatenación de strings
- filtros improvisados
- sorting libre
- joins excesivos
- consultas demasiado poderosas
- pérdida de restricciones de tenant o ownership
- exposición de columnas innecesarias
- confianza excesiva en que “solo es una query puntual”

En resumen:

> una native query da más control, pero también exige más responsabilidad.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- construir SQL nativo pegando input del usuario
- usar native queries para “resolver rápido” un caso complejo
- olvidar restricciones de seguridad que sí estaban presentes en otros caminos
- devolver más columnas o más joins de los necesarios
- perder consistencia con soft delete, tenant o estado
- usar SQL nativo en endpoints sensibles sin revisar alcance real
- confiar en escapes manuales en vez de parametrizar
- copiar consultas entre módulos sin revisar contexto de autorización

Es decir:

> el problema no es escribir SQL.  
> El problema es que una native query mal diseñada puede saltarse muchas de las protecciones implícitas o hábitos más sanos que el equipo tenía en otras capas.

---

## Error mental clásico

Un error muy común es este:

### “Es solo una native query para un caso especial”

Y con esa idea, muchas veces se aceptan cosas que en otro lugar no se aceptarían:

- concatenar un filtro
- dejar pasar un `ORDER BY` libre
- sumar condiciones desde request params
- usar `SELECT *`
- saltarse DTOs
- olvidarse de tenant o visibility
- devolver datos que ningún endpoint estándar expondría así

### El problema de fondo

Lo “puntual” suele terminar quedándose.
Y una query especial termina convirtiéndose en:

- un punto ciego
- una excepción no auditada
- una puerta de entrada para fallos clásicos
- una fuente de inconsistencias con el resto del sistema

---

## Cuándo puede tener sentido usar native queries

Hay casos donde usar SQL nativo puede estar justificado, por ejemplo:

- consultas muy específicas de performance
- funciones particulares del motor
- reportes complejos
- agregaciones avanzadas
- queries con CTE, window functions o features no cómodas en JPQL
- migraciones parciales de sistemas legados
- lectura optimizada para ciertos casos muy concretos

Eso puede ser razonable.

El problema empieza cuando “tiene sentido” se transforma en “entonces puedo relajar criterios”.

Y eso no debería pasar.

---

## Riesgo 1: volver a concatenar strings

El error más clásico reaparece enseguida:

```java
String sql = "SELECT * FROM users WHERE email = '" + email + "'";
return entityManager.createNativeQuery(sql).getResultList();
```

Aunque estés dentro de un proyecto moderno con Spring Boot, eso sigue siendo un patrón riesgoso.

### Qué está mal

Se mezclan:

- estructura de la consulta
- dato externo

Y el input deja de ser solo valor para pasar a influir en la lógica SQL.

### Más sano

```java
String sql = "SELECT * FROM users WHERE email = :email";
return entityManager
    .createNativeQuery(sql)
    .setParameter("email", email)
    .getResultList();
```

---

## Riesgo 2: `SELECT *` y sobreexposición

Con native queries, mucha gente vuelve a usar `SELECT *` por rapidez.

Eso puede parecer menor, pero desde seguridad es una mala señal porque:

- trae más columnas de las necesarias
- facilita exposición accidental
- hace menos explícito qué datos salen
- empeora auditoría del acceso
- complica el principio de mínimo dato

### Problema real

En una tabla puede haber campos como:

- hashes
- flags internos
- estados técnicos
- columnas de auditoría
- datos sensibles
- referencias que no deberían salir

Y si la query trae todo “por comodidad”, ya perdiste control fino.

### Regla sana

Pedir solo las columnas necesarias para el caso de uso real.

---

## Riesgo 3: sorting libre desde el cliente

Otro clásico:

```java
String sql = "SELECT id, email, created_at FROM users ORDER BY " + sortBy;
```

Mucha gente cree que el `ORDER BY` no importa tanto.
Sí importa.

Porque vuelve a dejar que el cliente influya en una parte estructural de la consulta.

### Más sano

Si el cliente puede ordenar, esa decisión debe pasar por:

- whitelist
- enum interno
- mapeo cerrado
- elección explícita del backend

Nunca por texto libre pegado al SQL.

---

## Riesgo 4: filtros dinámicos mal resueltos

Native queries suelen aparecer mucho en:

- buscadores
- listados complejos
- dashboards
- reportes administrativos
- exports

Y justo ahí el equipo suele querer mucha flexibilidad.

Entonces aparecen cosas como:

- `if` que agregan `AND ...`
- `StringBuilder`
- bloques de `WHERE 1=1`
- fragmentos opcionales
- joins que se suman según parámetros

La dinámica no es el problema en sí.
El problema es resolverla de una forma donde:

- los valores se concatenan
- lo estructural queda demasiado abierto
- nadie sabe con claridad qué restricciones se aplican siempre

---

## Riesgo 5: perder restricciones de tenant, ownership o estado

Este punto es muy importante.

Muchas veces una native query nace para resolver algo rápido y termina olvidando restricciones que en el resto del sistema estaban presentes.

### Ejemplo conceptual

Tal vez el flujo normal respeta:

- tenant actual
- usuario dueño
- recurso visible
- no eliminado
- estado permitido

Pero la native query usada para:

- exportar
- filtrar
- contar
- reportar
- listar en admin

se olvida una de esas condiciones.

Y entonces un endpoint aparentemente inocente empieza a:

- contar registros de más
- mostrar datos de otro tenant
- traer recursos archivados
- ignorar ownership
- romper aislamiento lógico

### Idea clave

Una query puede estar perfecta desde SQL y aun así ser insegura desde autorización.

---

## Riesgo 6: joins que arrastran más información de la necesaria

Con SQL nativo es fácil sumar joins “porque ya que estamos hace falta tal dato”.

Así una consulta termina trayendo:

- datos del usuario
- organización
- direcciones
- historial
- flags internos
- estados relacionados
- métricas auxiliares

aunque el caso de uso necesitaba bastante menos.

### Qué problema trae eso

- más superficie de exposición
- más datos en memoria
- más columnas que pueden terminar serializadas o exportadas
- más difícil revisar qué sale y qué no
- más riesgo de fuga accidental

En seguridad, pedir de más ya es una mala práctica.

---

## Riesgo 7: mapear resultados sin pensar contrato público

Otra mala práctica común es usar native queries y luego devolver el resultado casi crudo al cliente.

Eso puede pasar con:

- arrays de columnas
- maps
- proyecciones poco controladas
- entidades llenadas parcialmente
- respuestas armadas rápido “para salir”

### Problema

Una query nativa puede estar trayendo datos válidos para el backend, pero no necesariamente listos para exposición pública.

Entonces conviene mantener una separación clara entre:

- datos obtenidos
- contrato de respuesta

No todo lo que la query trae debería salir tal cual.

---

## Riesgo 8: copiar y pegar SQL entre contextos distintos

Como una native query suele verse autocontenida, es común copiarla entre:

- endpoints
- módulos
- servicios
- pantallas de admin
- reportes

Y ahí aparece otro problema:

> la misma consulta no necesariamente es segura en todos los contextos.

Porque puede cambiar:

- quién la ejecuta
- qué datos debería ver
- qué filtros obligatorios existen
- si el caso de uso es interno o externo
- si el actor es admin, soporte o usuario final

Una query reutilizada sin revisar contexto puede abrir fugas silenciosas.

---

## Parametrizar ayuda, pero no alcanza

Esto conviene remarcarlo.

Usar parámetros es fundamental para no mezclar valor con estructura.
Pero incluso una native query bien parametrizada puede seguir estando mal si:

- pide columnas de más
- ignora tenant
- ignora ownership
- ignora soft delete
- trae datos innecesarios
- expone más de lo que corresponde
- permite ordenar por campos no controlados

Entonces la revisión sana no termina en “usa parámetros, listo”.
También hay que mirar:

- alcance real
- datos devueltos
- restricciones aplicadas
- contexto del actor

---

## Escapes manuales y “sanitización” no son la solución

Cuando alguien detecta el riesgo, a veces responde con:

- reemplazar comillas
- bloquear caracteres
- limpiar strings
- usar regex
- asumir que un número parseado ya resolvió todo

Eso no es una defensa sólida.

### Regla práctica

La defensa principal sigue siendo:

- parametrizar valores
- no concatenar estructura
- controlar por whitelist lo estructural
- revisar autorización y exposición

No “limpiar texto hasta que parezca seguro”.

---

## Native queries y mínimo privilegio

Acá también importa mucho el usuario de base de datos con el que corre la aplicación.

Porque si una query falla en diseño, el impacto depende bastante de si esa cuenta puede:

- leer pocas tablas
- leer todo
- escribir en muchas tablas
- borrar masivamente
- alterar estructura
- ejecutar acciones administrativas

### Idea útil

Las native queries deberían revisarse con todavía más atención cuando corren sobre cuentas con mucho poder.

Porque un error ahí puede escalar mucho más.

---

## Qué conviene revisar en una codebase

Cuando revises native queries en un proyecto Spring, buscá especialmente:

- `createNativeQuery(`
- `@Query(nativeQuery = true)`
- concatenaciones con `+`
- `StringBuilder` armando SQL
- `ORDER BY` dinámico
- `SELECT *`
- queries de exportación
- reportes administrativos
- queries que ignoran soft delete
- consultas que no incluyen tenant u ownership
- respuestas donde las columnas vuelven casi crudas al cliente

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- native queries justificadas, no por comodidad automática
- parámetros para todos los valores variables
- columnas seleccionadas explícitamente
- sorting controlado por whitelist
- restricciones de tenant, ownership y estado presentes
- mapeo de salida más consciente
- queries acotadas al caso de uso real
- revisión clara del impacto y alcance de cada consulta

---

## Señales de ruido

Estas señales merecen revisión rápida:

- SQL nativo construido por concatenación
- `SELECT *`
- filtros dinámicos pegados con texto
- `ORDER BY` libre desde request params
- joins excesivos “por las dudas”
- queries copiadas entre contextos distintos
- reportes que devuelven demasiada información
- native query usada para saltear capas de negocio
- nadie sabe exactamente qué datos devuelve esa consulta

---

## Checklist práctico

Cuando revises una native query, preguntate:

- ¿por qué existe esta query y está realmente justificada?
- ¿los valores variables entran como parámetros?
- ¿hay alguna parte estructural controlada por el cliente?
- ¿pide solo las columnas necesarias?
- ¿respeta tenant, ownership, soft delete y estado?
- ¿hay joins que amplían demasiado el alcance?
- ¿el contrato de respuesta está controlado o sale casi crudo?
- ¿esta misma query sería segura en todos los contextos donde se usa?
- ¿el usuario de base de datos amplifica mucho el impacto?
- ¿la consulta es fácil de auditar o parece un parche viejo que nadie quiere tocar?

---

## Mini ejercicio de reflexión

Tomá dos native queries reales de tu proyecto y respondé:

1. ¿Por qué se eligió SQL nativo en ese caso?
2. ¿Qué valores entran como parámetros y cuáles no?
3. ¿Hay `ORDER BY`, filtros o joins que merecen revisión?
4. ¿La query respeta tenant, ownership y estado?
5. ¿Pide más columnas de las necesarias?
6. ¿Qué parte podría terminar filtrándose al cliente o a un export?
7. ¿Cuál de las dos revisarías primero si sospecharas una fuga de datos?

---

## Resumen

Las native queries no son malas por sí mismas.
Pero sí son un lugar donde vuelven fácilmente errores clásicos si el equipo baja la guardia.

Los riesgos más comunes aparecen cuando:

- se concatena input en SQL
- se usan partes estructurales libres
- se piden columnas de más
- se olvidan restricciones de negocio o autorización
- se copian queries entre contextos distintos
- se expone demasiado del resultado

En resumen:

> una native query puede ser necesaria y correcta,  
> pero justamente por darte más control también te exige más rigor.  
> Si no, se convierte en un atajo que rompe límites que el resto del sistema sí estaba respetando.

---

## Próximo tema

**Criteria API y filtros dinámicos seguros**
