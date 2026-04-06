---
title: "Queries seguras con parámetros"
description: "Cómo construir queries seguras en Java con Spring Boot usando parámetros en JDBC, JPA y Hibernate. Por qué separar estructura y valores reduce riesgo, qué errores siguen siendo comunes y cómo pensar filtros dinámicos, LIKE, IN y búsquedas más seguras."
order: 65
module: "SQL Injection, JPA y persistencia segura"
level: "base"
draft: false
---

# Queries seguras con parámetros

## Objetivo del tema

Entender cómo construir **queries seguras con parámetros** en aplicaciones Java + Spring Boot cuando trabajás con:

- JDBC
- JPA
- Hibernate
- JPQL
- native queries
- filtros dinámicos
- búsquedas con `LIKE`
- listas con `IN`

La idea es aprender una regla que parece simple, pero cambia muchísimo la seguridad de una aplicación:

> la estructura de la consulta debe quedar del lado del backend,  
> y los valores variables deben entrar como parámetros, no como texto pegado a la query.

---

## Idea clave

Una query segura separa dos cosas:

## 1. La estructura
Es la parte que define la lógica de la consulta:

- `SELECT`
- `FROM`
- `WHERE`
- `AND`
- `ORDER BY`
- joins
- condiciones fijas
- restricciones del negocio

## 2. Los valores
Es la parte variable que viene del contexto o del usuario:

- email
- id
- estado
- fecha
- término de búsqueda
- rango
- lista de IDs
- flags elegidos por el cliente

La regla sana es:

> los valores pueden variar; la estructura no debería quedar controlada por el cliente.

---

## Qué problema intenta resolver este tema

Este tema busca evitar patrones inseguros como:

- concatenar texto dentro de un `WHERE`
- armar búsquedas con strings pegadas
- construir `LIKE` de forma insegura
- pasar columnas o partes de la query desde request params
- hacer filtros “flexibles” con `StringBuilder`
- creer que poner comillas alcanza
- mezclar validación con armado inseguro de consultas

En resumen:

> parametrizar no es solo una prolijidad técnica.  
> Es una defensa fundamental para que el input siga siendo dato y no se convierta en parte de la consulta.

---

## Error mental clásico

Mucha gente piensa algo así:

- “validé el dato”
- “es un String normal”
- “no tiene por qué romper nada”
- “solo lo pego en la query y listo”

Ese razonamiento falla porque el problema no es si el input “parece normal”.
El problema es **dónde lo insertás**.

Si lo insertás dentro del texto de la consulta, abrís la puerta a que ese input afecte:

- condiciones
- operadores
- agrupaciones
- ordenamiento
- alcance de resultados

### Idea importante

No alcanza con validar.
También hay que decidir **cómo entra ese valor en la query**.

---

## Ejemplo inseguro con JDBC

```java
String sql = "SELECT * FROM users WHERE email = '" + email + "'";
Statement stmt = connection.createStatement();
ResultSet rs = stmt.executeQuery(sql);
```

### Qué está mal

La consulta queda armada a partir de texto concatenado.

Eso mezcla:

- la sintaxis SQL
- el valor variable

Y esa mezcla es justamente la base del problema.

---

## Corrección con `PreparedStatement`

```java
String sql = "SELECT * FROM users WHERE email = ?";
PreparedStatement stmt = connection.prepareStatement(sql);
stmt.setString(1, email);
ResultSet rs = stmt.executeQuery();
```

### Qué mejora esto

Ahora el backend define la estructura:

- `SELECT * FROM users WHERE email = ?`

y el valor entra por un canal separado:

- `stmt.setString(1, email)`

Eso hace que la base interprete el contenido como dato, no como parte de la lógica de la consulta.

---

## Parámetros también importan en JPA

A veces se piensa que parametrizar es algo de JDBC “viejo”.
Pero no.

En JPA también importa muchísimo.

### Ejemplo inseguro

```java
String jpql = "select u from User u where u.email = '" + email + "'";
return entityManager.createQuery(jpql, User.class).getResultList();
```

### Más sano

```java
String jpql = "select u from User u where u.email = :email";
return entityManager
    .createQuery(jpql, User.class)
    .setParameter("email", email)
    .getResultList();
```

### Idea clave

Aunque no sea SQL crudo, la regla sigue siendo la misma:

- la consulta se define del lado del backend
- el valor entra como parámetro

---

## Native queries también deben parametrizarse

Que una query sea nativa no significa que haya que volver a concatenar texto.

### Incorrecto

```java
String sql = "SELECT * FROM orders WHERE status = '" + status + "'";
return entityManager.createNativeQuery(sql).getResultList();
```

### Mejor

```java
String sql = "SELECT * FROM orders WHERE status = :status";
return entityManager
    .createNativeQuery(sql)
    .setParameter("status", status)
    .getResultList();
```

### Regla práctica

Si el valor cambia, debería preguntarte:

> ¿esto está entrando como parámetro o lo estoy pegando dentro del string?

Esa pregunta sola evita muchísimos errores.

---

## `LIKE` seguro: no hace falta concatenar la query

Un caso muy habitual es la búsqueda parcial.

### Inseguro

```java
String sql = "SELECT * FROM products WHERE name LIKE '%" + term + "%'";
```

### Seguro con parámetro

```java
String sql = "SELECT * FROM products WHERE name LIKE ?";
PreparedStatement stmt = connection.prepareStatement(sql);
stmt.setString(1, "%" + term + "%");
```

O en JPA:

```java
String jpql = "select p from Product p where lower(p.name) like :term";
return entityManager
    .createQuery(jpql, Product.class)
    .setParameter("term", "%" + term.toLowerCase() + "%")
    .getResultList();
```

### Qué importa acá

La wildcard puede formar parte del valor parametrizado.
No hace falta construir la query a mano para usar `LIKE`.

---

## `IN` con listas: también requiere cuidado

Otro caso común es buscar por varias opciones.

### Ejemplo conceptual

- estados permitidos
- IDs seleccionados
- categorías
- tenants
- tipos de evento

En JPA suele poder resolverse parametrizando una colección.

```java
String jpql = "select o from Order o where o.status in :statuses";
return entityManager
    .createQuery(jpql, Order.class)
    .setParameter("statuses", statuses)
    .getResultList();
```

### Qué importa

Otra vez, los valores cambian.
La estructura no.

No debería venir del cliente algo como:

- “te paso el contenido textual del `IN (...)`”
- “te paso la condición entera”
- “te paso el filtro armado”

El backend recibe datos y decide cómo insertarlos de forma segura.

---

## Parametrizar no resuelve todo

Esto es muy importante.

Parametrizar protege muy bien los **valores**.
Pero no resuelve automáticamente partes estructurales como:

- nombre de columna
- dirección del sorting
- fragmentos de `ORDER BY`
- nombres de tabla
- joins opcionales
- funciones SQL dinámicas
- pedazos enteros de `WHERE`

### Ejemplo de algo todavía riesgoso

```java
String sql = "SELECT * FROM users ORDER BY " + sortBy;
```

Aunque el resto de la query use parámetros, esa parte sigue siendo estructural y sigue siendo peligrosa si entra libremente desde el cliente.

### Regla sana

Las partes estructurales no se parametrizan como dato común.
Se controlan con:

- whitelist
- enums internos
- mapeos cerrados
- lógica fija del backend

---

## Validar ayuda, pero no reemplaza parametrizar

Podés validar que un email tenga formato correcto.
Eso está bien.

Podés validar que un ID sea numérico.
Eso también está bien.

Pero eso no reemplaza la necesidad de usar parámetros.

### Porque la seguridad sana combina:

- validación de contrato
- restricciones del negocio
- parametrización correcta
- control de estructura

No es una sola capa.
Son varias.

---

## Queries dinámicas: dónde se complica de verdad

El problema suele aparecer cuando el equipo necesita flexibilidad.

Por ejemplo:

- filtros opcionales
- búsqueda avanzada
- reportes
- múltiples criterios
- distintos rangos
- distinto orden

Entonces alguien empieza a hacer algo como:

- si vino nombre, concateno una condición
- si vino estado, agrego otra
- si vino fecha, sumo una más
- si vino sort, lo pego al final

Y esa dinámica mal resuelta es donde vuelven los errores.

### Más sano

Construir la lógica dinámica manteniendo estas reglas:

- condiciones estructurales decididas por el backend
- valores variables pasados como parámetros
- campos de ordenamiento controlados con whitelist
- filtros opcionales armados con criterio, no con texto libre del cliente

---

## Criteria API y builders: utilidad real

Cuando la query tiene muchos filtros opcionales, suele ser más sano usar mecanismos pensados para eso, por ejemplo:

- Criteria API
- Specifications
- QueryDSL
- builders controlados
- repositorios custom bien acotados

No porque sean mágicos, sino porque ayudan a:

- componer condiciones de forma más estructurada
- separar mejor valores y lógica
- evitar concatenaciones improvisadas
- razonar mejor qué parte es fija y cuál variable

La herramienta no reemplaza criterio.
Pero puede reducir errores si se usa bien.

---

## Parametrizar también mejora mantenibilidad

No es solo seguridad.

Una query con parámetros suele ser:

- más legible
- más estable
- más fácil de revisar
- menos propensa a parches raros
- más fácil de testear
- más coherente entre distintas capas

Y eso importa mucho, porque el código confuso tiende a degradar seguridad con el tiempo.

---

## Qué no hacer para “solucionarlo”

Cuando alguien detecta el problema, a veces intenta parches como:

- reemplazar comillas simples
- remover ciertos caracteres
- hacer blacklist de símbolos
- trim del input
- confiar solo en regex
- escapar manualmente texto

Eso no es una defensa principal confiable.

### Regla práctica

La solución correcta no es “limpiar” suficiente texto para que parezca inofensivo.
La solución correcta es:

- separar estructura y datos
- parametrizar valores
- controlar por whitelist lo estructural

---

## Autorización y parámetros

Una query parametrizada puede seguir siendo insegura si le faltan restricciones de negocio o autorización.

### Ejemplo conceptual

Esto puede estar bien parametrizado:

- buscar una orden por `id`

pero seguir estando mal si no filtra también por:

- usuario dueño
- tenant actual
- estado permitido
- visibilidad real

Entonces conviene recordar:

> una query segura desde injection no siempre es segura desde autorización.

Hay que pensar ambas cosas.

---

## Qué conviene revisar en una codebase

Cuando revises queries seguras con parámetros, buscá cosas como:

- `Statement` en vez de `PreparedStatement`
- `createQuery(` con concatenación
- `createNativeQuery(` con strings variables
- `LIKE` armado con texto pegado
- `ORDER BY` desde request params
- `StringBuilder` cerca de SQL o JPQL
- filtros avanzados construidos a mano
- parámetros validados pero luego concatenados
- repositorios custom muy flexibles
- código donde el valor parece separado, pero no lo está realmente

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- uso consistente de parámetros
- `PreparedStatement` o equivalente
- `setParameter()` en JPQL y native queries
- `LIKE` resuelto con valores parametrizados
- listas `IN` tratadas como datos
- sorting controlado con whitelist
- filtros dinámicos construidos con herramientas o patrones más seguros
- autorización incorporada en consultas sensibles

---

## Señales de ruido

Estas señales merecen atención rápida:

- texto concatenado dentro de queries
- `ORDER BY` libre desde el cliente
- `LIKE '%" + term + "%'`
- “sanitización” manual como defensa principal
- filtros opcionales pegados con strings
- queries que cambian demasiado según input externo
- mezcla entre validación superficial y armado inseguro
- confianza excesiva en que JPA “ya se encarga”

---

## Checklist práctico

Cuando revises si una query está construida de forma sana, preguntate:

- ¿los valores entran como parámetros?
- ¿hay alguna parte concatenada dentro de SQL o JPQL?
- ¿`LIKE` está resuelto sin pegar el input al texto?
- ¿las listas `IN` están tratadas como datos?
- ¿el sorting pasa por whitelist?
- ¿alguna parte estructural quedó controlada por el cliente?
- ¿la query también respeta tenant, ownership y estado?
- ¿hay builders dinámicos improvisados?
- ¿alguien está confiando en escapes manuales?
- ¿el código se entiende rápido o es una cadena de parches?

---

## Mini ejercicio de reflexión

Tomá tres consultas reales de tu proyecto y respondé:

1. ¿Qué parte de la query es fija?
2. ¿Qué parte cambia por input externo?
3. ¿Ese valor entra como parámetro o como texto concatenado?
4. ¿Hay `LIKE`, `IN` o sorting que merezcan revisión?
5. ¿La consulta también respeta restricciones de negocio?
6. ¿Qué tan fácil sería auditar esa query dentro de seis meses?
7. ¿Cuál cambiarías primero para reducir riesgo?

---

## Resumen

Construir queries seguras con parámetros significa mantener una frontera clara entre:

- la estructura definida por el backend
- los valores variables que entran como datos

Eso reduce muchísimo el riesgo porque evita que el input modifique la sintaxis de la consulta.

Pero además hay que recordar:

- parametrizar no controla lo estructural
- sorting, columnas y joins deben pasar por whitelist o diseño fijo
- la autorización sigue siendo otro problema distinto
- validar no reemplaza parametrizar

En resumen:

> una query más segura no es la que “limpia” mejor el input.  
> Es la que impide que el input participe en la estructura de la consulta.

---

## Próximo tema

**JPQL inseguro**
