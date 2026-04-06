---
title: "SQL injection desde el mundo Java"
description: "Cómo aparece SQL injection en aplicaciones Java con Spring Boot, incluso cuando se usa JPA, Hibernate o JDBC. Qué patrones son riesgosos, por qué concatenar partes de una query sigue siendo peligroso y cómo diseñar acceso a datos más seguro."
order: 63
module: "SQL Injection, JPA y persistencia segura"
level: "base"
draft: false
---

# SQL injection desde el mundo Java

## Objetivo del tema

Entender cómo aparece **SQL injection** en aplicaciones Java + Spring Boot, incluso en proyectos que usan:

- JDBC
- JPA
- Hibernate
- JPQL
- native queries
- filtros dinámicos
- búsquedas armadas desde parámetros del cliente

La idea es sacar un malentendido muy común:

> usar Java, Spring o un ORM no elimina automáticamente el riesgo de SQL injection.  
> Lo que lo elimina es cómo construís y ejecutás las queries.

---

## Idea clave

SQL injection no depende del lenguaje.
Depende de una mala mezcla entre:

- datos controlados por el usuario
- estructura de la consulta
- ejecución en base de datos

En términos simples:

> hay SQL injection cuando el input del usuario deja de ser solo dato y pasa a influir en la lógica o estructura de la query.

Eso puede pasar en Java igual que en cualquier otro stack.

---

## Qué problema intenta resolver este tema

Muchos equipos creen algo como esto:

- “usamos Spring Boot”
- “usamos Hibernate”
- “ya no escribimos tanto SQL”
- “entonces injection ya no es un problema”

Ese razonamiento es peligroso.

Porque en la práctica el riesgo reaparece cuando alguien:

- concatena strings para construir una query
- arma filtros dinámicos sin whitelist
- mete un `ORDER BY` desde un parámetro libre
- usa native queries con partes variables
- compone fragmentos JPQL desde request params
- mezcla mal búsqueda flexible con acceso a datos

Entonces este tema busca fijar una idea simple:

> no alcanza con usar herramientas modernas.  
> También hay que usarlas de forma segura.

---

## Qué es exactamente SQL injection

Es una vulnerabilidad donde una entrada controlada por el atacante modifica la consulta que llega a la base.

No significa solamente “romper un login”.
También puede servir para:

- leer información no prevista
- alterar filtros
- saltar validaciones
- modificar datos
- borrar información
- ampliar resultados
- ejecutar operaciones no esperadas
- descubrir estructura interna de la base

La gravedad depende de:

- la query afectada
- los privilegios del usuario de base de datos
- el motor utilizado
- las defensas adicionales
- el contexto del endpoint

---

## Error mental clásico en Java

Un error común es pensar:

### “Como el tipo del parámetro en Java es String, Long o Integer, ya está controlado”

No necesariamente.

El problema no está en el tipo Java.
El problema está en cómo ese valor termina entrando en la query.

### Ejemplo mental

No importa tanto si el parámetro vino como `String`.
Lo importante es si después hacés algo como:

- concatenarlo en un SQL
- pegarlo dentro de un JPQL
- usarlo como parte de un `WHERE`
- usarlo como columna u ordenamiento sin control

El tipo Java no neutraliza por sí solo la inyección.

---

## Ejemplo inseguro con JDBC

### Código riesgoso

```java
String sql = "SELECT * FROM users WHERE email = '" + email + "'";
Statement stmt = connection.createStatement();
ResultSet rs = stmt.executeQuery(sql);
```

### Qué está mal

La consulta se arma mezclando:

- estructura SQL
- valor externo

Si `email` contiene contenido malicioso, puede alterar la lógica del `WHERE`.

### Problema de fondo

El usuario no debería participar en la sintaxis de la consulta.
Solo debería aportar datos.

---

## Corrección conceptual con parámetros

### Más sano

```java
String sql = "SELECT * FROM users WHERE email = ?";
PreparedStatement stmt = connection.prepareStatement(sql);
stmt.setString(1, email);
ResultSet rs = stmt.executeQuery();
```

### Qué mejora esto

La consulta mantiene separadas dos cosas:

- la estructura
- los valores

Eso reduce drásticamente el riesgo porque el motor trata ese input como dato y no como parte de la sintaxis SQL.

---

## El problema no termina en JDBC

Muchos sistemas no usan JDBC “a mano”, pero igual pueden caer en lo mismo.

### Ejemplo riesgoso en JPA o Hibernate

```java
String jpql = "select u from User u where u.email = '" + email + "'";
return entityManager.createQuery(jpql, User.class).getResultList();
```

Aunque eso no sea SQL crudo, sigue siendo una query armada por concatenación.

### Idea importante

**JPQL inseguro también puede introducir injection**.

No hace falta usar `SELECT * FROM ...` para cometer el error.
Alcanza con construir dinámicamente una consulta sin separar estructura y parámetros.

---

## Native queries: potencia y riesgo

Las native queries no son malas por sí mismas.
A veces son necesarias.

El problema aparece cuando se usan así:

```java
String sql = "SELECT * FROM orders WHERE status = '" + status + "'";
return entityManager.createNativeQuery(sql).getResultList();
```

Eso vuelve a abrir el mismo problema.

### Regla práctica

Si usás native query:

- parametrizá valores
- evitá concatenar input
- controlá muy bien fragmentos dinámicos
- revisá con más atención que en JPA estándar

Porque cuanto más te acercás a SQL manual, más fácil es reintroducir errores clásicos.

---

## Dónde suele reaparecer en proyectos Spring reales

SQL injection no siempre entra por un campo obvio como `email` o `password`.

Muy seguido aparece en cosas como:

- filtros dinámicos
- buscadores
- reportes
- exports
- endpoints de administración
- listados con ordenamiento
- queries con múltiples criterios opcionales
- pantallas “avanzadas” de backoffice

Justamente porque ahí alguien suele pensar:

- “esto hay que armarlo flexible”
- “concatenemos según lo que venga”
- “después lo acomodamos”

Y esa flexibilidad mal diseñada es terreno ideal para inyección.

---

## ORDER BY, columnas y sorting: riesgo subestimado

Uno de los errores más comunes es este:

```java
String sql = "SELECT * FROM users ORDER BY " + sortBy;
```

Mucha gente piensa:

- “eso no toca el WHERE”
- “solo define el orden”
- “no es tan grave”

Pero sigue siendo peligroso porque el atacante puede influir en la estructura de la consulta.

### Regla sana

Cuando el cliente elige algo estructural como:

- nombre de columna
- dirección del sort
- campo de agrupación
- filtro avanzado
- nombre de tabla o relación

no se debe pasar directo.

Hay que usar:

- whitelist explícita
- mapeo controlado
- opciones cerradas del backend

---

## Filtros dinámicos: la trampa habitual

Supongamos un endpoint que permite buscar por:

- nombre
- estado
- fecha
- rol
- tenant
- orden

Si todo eso se transforma en strings pegadas una atrás de otra, el riesgo sube muchísimo.

### Patrón mental incorrecto

- “si el parámetro viene vacío, no lo agrego”
- “si viene algo, concateno ese fragmento”
- “al final cierro la query y listo”

Eso suele terminar en consultas frágiles y difíciles de auditar.

### Más sano

- parámetros para valores
- Criteria API o builder controlado
- listas permitidas para campos estructurales
- lógica de negocio separada del armado técnico

---

## Injection no siempre significa destrucción total

Otro error mental es creer que solo importa si alguien puede hacer algo extremo.

Pero incluso una inyección “menor” ya es grave si permite:

- saltar una restricción
- ampliar resultados
- ver registros de otro usuario
- ignorar un filtro de tenant
- acceder a datos archivados
- romper paginación o conteos
- alterar el orden para inferir cosas

A veces el impacto real no es “borrar toda la base”, sino:

> romper los límites lógicos del sistema y acceder a datos que no correspondían.

Y eso ya puede ser un incidente serio.

---

## El ORM ayuda, pero no piensa por vos

Herramientas como JPA e Hibernate ayudan porque promueven patrones más seguros.
Pero no pueden protegerte si vos mismo:

- armás JPQL concatenando strings
- usás native queries inseguras
- exponés sorting libre
- construís fragmentos desde input externo
- convertís una búsqueda flexible en un mini lenguaje que el cliente controla

En resumen:

> el ORM reduce superficie de error, pero no reemplaza criterio de seguridad.

---

## Qué conviene revisar primero en una codebase Java

Cuando revises una aplicación, buscá rápidamente cosas como:

- `createNativeQuery(`
- `createQuery(` con string dinámica
- `Statement` en vez de `PreparedStatement`
- concatenaciones cerca de `WHERE`, `ORDER BY`, `LIKE`
- filtros opcionales construidos con `StringBuilder`
- repositorios custom con SQL manual
- endpoints de búsqueda avanzada
- exports CSV o Excel basados en filtros complejos
- backoffice con ordenamiento configurable
- uso libre de nombres de columnas desde request params

Eso suele encontrar bastante rápido los puntos más delicados.

---

## Cuidado con LIKE y búsquedas parciales

`LIKE` no vuelve insegura una query por sí mismo.

El problema aparece cuando se construye así:

```java
String sql = "SELECT * FROM products WHERE name LIKE '%" + term + "%'";
```

Ahí otra vez se mezcla estructura con input.

### Más sano

Parametrizar también el valor buscado:

```java
String sql = "SELECT * FROM products WHERE name LIKE ?";
stmt.setString(1, "%" + term + "%");
```

La wildcard puede formar parte del valor parametrizado.
No hace falta pegar el contenido en la consulta.

---

## Autorización e injection pueden mezclarse

Este punto es muy importante.

A veces la inyección no afecta solo a la query.
Afecta también a la autorización real.

### Ejemplo conceptual

Si una consulta debería estar limitada por:

- usuario actual
- tenant actual
- estado permitido
- ownership del recurso

y el atacante logra alterar filtros, puede terminar viendo datos fuera de su alcance.

Entonces SQL injection no es solo un problema de base de datos.
También puede convertirse en:

- bypass de reglas de negocio
- bypass de ownership
- fuga horizontal entre usuarios
- ruptura de aislamiento entre tenants

---

## Mínimo privilegio también importa

Aunque una query tenga un problema, el impacto puede variar muchísimo según el usuario de base de datos.

No es lo mismo que la cuenta usada por la aplicación pueda:

- leer algunas tablas
- leer y escribir todo
- alterar estructura
- borrar masivamente
- ejecutar operaciones administrativas

Por eso SQL injection siempre debe pensarse junto con:

- parametrización correcta
- diseño de queries
- permisos mínimos en base
- segmentación de responsabilidades

No es una sola defensa.
Son varias capas.

---

## Qué no hacer al “solucionarlo”

A veces alguien descubre el riesgo y responde con parches flojos como:

- reemplazar comillas manualmente
- hacer `.trim()`
- bloquear algunos caracteres
- usar regex incompleta
- “sanitizar” con listas negras
- asumir que un `Long.parseLong()` ya resuelve todo

Eso no es una estrategia confiable.

### Regla simple

La defensa principal no es “limpiar texto raro”.
La defensa principal es:

- parametrizar valores
- no concatenar estructura controlada por el cliente
- usar listas permitidas para opciones estructurales

---

## Checklist práctico

Cuando revises riesgo de SQL injection en Java/Spring, preguntate:

- ¿hay concatenación de strings en queries?
- ¿se usa `PreparedStatement` cuando corresponde?
- ¿hay JPQL o native queries armadas desde input?
- ¿sorting, columnas o filtros vienen libres desde request params?
- ¿hay whitelists para opciones estructurales?
- ¿se usan búsquedas parciales con parámetros seguros?
- ¿las restricciones de usuario o tenant viven dentro de la query correcta?
- ¿el usuario de base tiene más privilegios de los necesarios?
- ¿hay repositorios custom o reportes poco revisados?
- ¿alguien está “sanitizando” en vez de parametrizar?

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- parámetros separados de la consulta
- `PreparedStatement` o equivalente seguro
- uso prudente de native queries
- sorting controlado por whitelist
- filtros dinámicos construidos con mecanismos seguros
- restricciones de tenant y ownership bien integradas
- repositorios más predecibles
- cuenta de base con privilegios mínimos

---

## Señales de ruido

Estas señales suelen merecer revisión inmediata:

- `" ... " + param + " ... "` cerca de una query
- uso libre de `ORDER BY` desde el cliente
- `LIKE` armado por concatenación
- `StringBuilder` para montar SQL
- `createNativeQuery` con partes variables
- consultas de reportes copiadas y pegadas
- endpoints de búsqueda “muy flexibles”
- parámetros que controlan columnas o tablas
- fixes basados en blacklist de caracteres

---

## Mini ejercicio de reflexión

Tomá tres queries reales de tu proyecto y respondé:

1. ¿Qué parte de la consulta es fija?
2. ¿Qué parte viene del usuario?
3. ¿Ese input entra como dato o como estructura?
4. ¿Hay algún `ORDER BY`, `LIKE` o filtro dinámico peligroso?
5. ¿La query preserva tenant, ownership y estado?
6. ¿La cuenta de base de datos podría amplificar el daño?
7. ¿Qué cambiarías para que esa consulta sea más segura y más predecible?

---

## Resumen

SQL injection en Java no desaparece por usar Spring o Hibernate.

Desaparece cuando:

- los valores se parametrizan correctamente
- el cliente no controla partes estructurales de la query
- los filtros dinámicos se diseñan con cuidado
- sorting y campos variables pasan por whitelist
- los permisos de base reducen el impacto posible

En resumen:

> el problema no es escribir queries.  
> El problema es dejar que el usuario participe en la sintaxis de la consulta en vez de limitarlo a aportar datos.

---

## Próximo tema

**Riesgos con JPA y Hibernate**
