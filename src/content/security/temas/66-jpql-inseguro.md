---
title: "JPQL inseguro"
description: "Cómo puede aparecer injection y otros errores de seguridad al construir JPQL de forma insegura en aplicaciones Java con Spring Boot. Qué patrones son peligrosos, por qué concatenar consultas sigue siendo un problema y cómo usar parámetros y filtros controlados."
order: 66
module: "SQL Injection, JPA y persistencia segura"
level: "base"
draft: false
---

# JPQL inseguro

## Objetivo del tema

Entender cómo puede aparecer **JPQL inseguro** en aplicaciones Java + Spring Boot cuando trabajás con:

- JPA
- Hibernate
- `EntityManager`
- queries dinámicas
- filtros opcionales
- búsquedas
- ordenamientos
- joins construidos a mano

La idea principal es romper una falsa sensación de seguridad muy común:

> que una consulta no sea SQL crudo no significa automáticamente que sea segura.

JPQL sigue siendo un lenguaje de consultas.
Y, como cualquier lenguaje de consultas, se vuelve riesgoso cuando el input externo empieza a participar en su estructura.

---

## Idea clave

El problema no es JPQL en sí.
El problema es **cómo la construís**.

JPQL se vuelve inseguro cuando mezclás:

- sintaxis de la consulta
- datos controlados por el usuario
- lógica dinámica improvisada

En otras palabras:

> si el usuario deja de aportar solo valores y pasa a influir en la forma de la consulta, el riesgo reaparece.

Eso puede pasar aunque no uses SQL nativo.

---

## Qué problema intenta resolver este tema

Este tema busca evitar patrones como:

- concatenar strings en un `WHERE`
- armar `LIKE` pegando texto
- construir `ORDER BY` desde request params
- elegir propiedades dinámicamente sin whitelist
- sumar fragmentos JPQL con `StringBuilder`
- dar por seguro cualquier cosa porque “la hace Hibernate”
- convertir un buscador flexible en una consulta controlada por el cliente

En resumen:

> JPQL inseguro no es un problema de tecnología vieja.  
> Es un problema de diseño incorrecto del acceso a datos.

---

## Error mental clásico

Mucha gente piensa algo así:

- “no estoy usando SQL, estoy usando entidades”
- “JPA entiende el modelo”
- “esto lo ejecuta Hibernate”
- “entonces injection ya no aplica”

Ese razonamiento es incompleto.

Porque JPQL sigue siendo una consulta textual.
Y si la armás así:

```java
String jpql = "select u from User u where u.email = '" + email + "'";
```

seguís teniendo el mismo error conceptual:

- la estructura y el dato quedaron mezclados

No importa que el lenguaje sea JPQL en vez de SQL.
La mala práctica sigue siendo mala práctica.

---

## Ejemplo inseguro básico

```java
String jpql = "select u from User u where u.email = '" + email + "'";
return entityManager.createQuery(jpql, User.class).getResultList();
```

### Qué está mal

La consulta se construye pegando directamente un valor externo dentro del texto.

Eso hace que el input deje de ser solo dato y empiece a formar parte de la lógica de la consulta.

### Problema de fondo

El backend debería definir:

- la consulta
- las condiciones estructurales
- el alcance de datos

y el usuario debería aportar solo valores.

---

## Corrección con parámetros

```java
String jpql = "select u from User u where u.email = :email";
return entityManager
    .createQuery(jpql, User.class)
    .setParameter("email", email)
    .getResultList();
```

### Qué mejora esto

Ahora la estructura queda fija del lado del backend y el valor entra como parámetro.

Eso hace que el motor trate el contenido como dato, no como parte de la consulta.

### Regla sana

Si un valor cambia request a request, preguntate:

> ¿lo estoy pasando como parámetro o lo estoy pegando en el string?

---

## `LIKE` en JPQL: error muy habitual

Cuando alguien arma una búsqueda textual, suele caer en algo así:

```java
String jpql = "select p from Product p where lower(p.name) like '%" + term.toLowerCase() + "%'";
```

Eso vuelve a mezclar dato con estructura.

### Más sano

```java
String jpql = "select p from Product p where lower(p.name) like :term";
return entityManager
    .createQuery(jpql, Product.class)
    .setParameter("term", "%" + term.toLowerCase() + "%")
    .getResultList();
```

### Idea importante

La wildcard puede formar parte del valor parametrizado.
No hace falta concatenar el término dentro del texto de la query.

---

## Filtros opcionales: donde se complica de verdad

El riesgo aparece mucho cuando la consulta es “flexible”.

Por ejemplo, si un endpoint permite filtrar por:

- estado
- rango de fechas
- nombre
- categoría
- tenant
- usuario
- orden

Entonces alguien termina haciendo algo como:

```java
String jpql = "select o from Order o where 1=1";

if (status != null) {
    jpql += " and o.status = '" + status + "'";
}

if (customerEmail != null) {
    jpql += " and o.customer.email = '" + customerEmail + "'";
}
```

Eso puede parecer práctico, pero acumula varios problemas:

- mezcla estructura y dato
- hace más difícil auditar la query
- vuelve frágil el código
- facilita errores de seguridad
- favorece bypass de reglas del negocio

---

## Query dinámica no es igual a query insegura

Esto es importante.

No toda query dinámica está mal.
A veces necesitás construir consultas según:

- filtros opcionales
- permisos del actor
- tipo de recurso
- estado de negocio
- contexto del tenant

El problema no es la dinámica.
El problema es hacerla **por concatenación insegura**.

### Una dinámica más sana mantiene:

- la estructura bajo control del backend
- los valores como parámetros
- los campos sensibles bajo whitelist
- las restricciones de autorización embebidas correctamente

---

## `ORDER BY` en JPQL: riesgo subestimado

Otro error muy común es este:

```java
String jpql = "select u from User u order by u." + sortField;
```

Mucha gente cree que eso “no es tan grave” porque solo cambia el orden.
Pero el problema sigue siendo real:

- el cliente influye en la estructura
- el backend deja de decidir completamente la consulta
- pueden aparecer comportamientos no previstos
- se vuelve difícil razonar qué campos son realmente seguros

### Regla sana

Si el cliente puede elegir ordenar, eso debe pasar por:

- una whitelist explícita
- un mapeo interno
- un enum controlado
- una selección cerrada del backend

Nunca por texto libre.

---

## Propiedades del modelo no deberían venir libres del cliente

JPQL trabaja con propiedades de entidades, por ejemplo:

- `u.email`
- `o.status`
- `p.createdAt`

Eso a veces genera una falsa confianza, como si usar nombres del modelo fuera automáticamente más seguro.

No.

También es peligroso permitir que el cliente elija libremente cosas como:

- qué propiedad usar en `ORDER BY`
- qué campo filtrar
- qué relación recorrer
- qué propiedad comparar

### Porque el problema sigue siendo el mismo

El cliente está participando en la estructura de la consulta.

Y eso debería quedar decidido del lado del backend.

---

## JPQL segura desde injection, pero insegura desde negocio

Una consulta puede estar bien parametrizada y aun así ser incorrecta desde seguridad.

### Ejemplo conceptual

```java
String jpql = "select o from Order o where o.id = :id";
```

Eso está mejor que concatenar.
Pero puede seguir siendo inseguro si falta:

- ownership
- tenant
- visibilidad
- estado permitido
- exclusión de soft delete

Es decir:

> una JPQL puede estar bien escrita técnicamente y aun así devolver datos que el actor no debería ver.

Entonces conviene recordar siempre:

- seguridad de construcción
- y seguridad de alcance

no son exactamente lo mismo.

---

## Concatenar fragmentos también degrada mantenibilidad

Más allá de la vulnerabilidad puntual, la JPQL concatenada suele empeorar mucho el código.

### Problemas frecuentes

- cuesta leer la consulta final
- es difícil revisar qué filtros se aplican siempre y cuáles no
- se vuelven comunes bugs de lógica
- se mezclan reglas del negocio con armado textual
- aumenta la chance de olvidar tenant, estado u ownership
- cuesta probar combinaciones de filtros

Y cuando una consulta se vuelve difícil de entender, también se vuelve más probable que quede insegura.

---

## `StringBuilder` no soluciona el problema

A veces alguien “mejora” el código inseguro pasando de concatenación simple a `StringBuilder`.

Por ejemplo:

```java
StringBuilder jpql = new StringBuilder("select u from User u where 1=1");
jpql.append(" and u.email = '").append(email).append("'");
```

Eso puede ser más cómodo para programar.
Pero no resuelve nada desde seguridad.

### Idea clave

El problema no es la herramienta usada para pegar strings.
El problema es que seguís pegando strings donde deberías usar parámetros.

---

## Criteria API, Specifications y QueryDSL

Cuando la consulta necesita mucha flexibilidad, suele convenir usar herramientas más estructuradas como:

- Criteria API
- Spring Specifications
- QueryDSL
- builders bien acotados

No porque sean mágicas, sino porque ayudan a:

- separar mejor condiciones y valores
- evitar improvisación textual
- componer filtros con más claridad
- controlar mejor qué parte es fija y cuál variable

Igual, ninguna herramienta reemplaza criterio.

Si el diseño lógico está mal, la herramienta sola no lo arregla.

---

## Qué conviene revisar en una codebase

Cuando busques JPQL inseguro en un proyecto, revisá especialmente:

- `createQuery(` con strings dinámicas
- uso de `+` cerca de una JPQL
- `StringBuilder` armando consultas
- `LIKE` con texto concatenado
- `ORDER BY` construido desde request params
- filtros avanzados en backoffice
- consultas de reportes
- endpoints de búsqueda
- métodos custom de repository
- queries donde falta tenant, ownership o estado aunque estén parametrizadas

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- `setParameter()` para valores variables
- queries con estructura clara
- filtros opcionales construidos con mecanismos más seguros
- whitelists para sorting o campos seleccionables
- restricciones de negocio incluidas en la consulta correcta
- separación entre acceso a datos y contrato de API
- código más fácil de auditar

---

## Señales de ruido

Estas señales merecen revisión rápida:

- `createQuery("..." + algo + "...")`
- `LIKE '%" + term + "%'`
- `ORDER BY` con texto libre
- propiedades del modelo elegidas por el cliente
- queries gigantes construidas por partes
- `StringBuilder` con input externo
- confianza excesiva en que “como es JPQL no pasa nada”
- autorización resuelta después de traer demasiados datos

---

## Checklist práctico

Cuando revises JPQL, preguntate:

- ¿los valores variables entran como parámetros?
- ¿hay concatenación de input dentro del texto?
- ¿`LIKE` está resuelto con parámetro?
- ¿hay `ORDER BY` o propiedades libres desde el cliente?
- ¿la query incluye tenant, ownership y estado cuando corresponde?
- ¿la dinámica está controlada por el backend o por texto libre?
- ¿la consulta es fácil de leer y auditar?
- ¿se mezcló lógica de negocio con armado textual?
- ¿hay métodos custom de repository poco revisados?
- ¿esta query devuelve exactamente lo que el actor debería poder ver?

---

## Mini ejercicio de reflexión

Tomá dos o tres JPQL reales de tu proyecto y respondé:

1. ¿Qué parte de la consulta es fija?
2. ¿Qué parte cambia por input externo?
3. ¿Ese cambio entra como parámetro o como string?
4. ¿Hay `LIKE`, sorting o filtros opcionales inseguros?
5. ¿La consulta respeta tenant, ownership y visibilidad?
6. ¿Qué parte te costaría más auditar dentro de unos meses?
7. ¿Cuál reescribirías primero para reducir riesgo?

---

## Resumen

JPQL no elimina por sí sola los riesgos de construcción insegura.

El problema reaparece cuando:

- concatenás valores dentro del string
- dejás que el cliente influya en la estructura
- armás filtros flexibles sin control
- usás `ORDER BY` libre
- olvidás restricciones de negocio aunque parametrices bien

La práctica sana consiste en:

- dejar fija la estructura del lado del backend
- pasar los valores como parámetros
- controlar por whitelist lo estructural
- asegurar también el alcance correcto de los datos

En resumen:

> una JPQL segura no es la que “parece más prolija”.  
> Es la que mantiene separado lo que es consulta de lo que es dato,  
> y además devuelve solo lo que el actor realmente debe poder ver.

---

## Próximo tema

**Native queries peligrosas**
