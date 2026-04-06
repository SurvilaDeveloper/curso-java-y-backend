---
title: "Criteria API y filtros dinámicos seguros"
description: "Cómo construir filtros dinámicos de forma más segura en aplicaciones Java con Spring Boot usando Criteria API, Specifications y patrones similares. Qué riesgos resuelven, qué errores siguen siendo posibles y cómo mantener control sobre parámetros, sorting, tenant, ownership y alcance real de los datos."
order: 68
module: "SQL Injection, JPA y persistencia segura"
level: "base"
draft: false
---

# Criteria API y filtros dinámicos seguros

## Objetivo del tema

Entender cómo construir **filtros dinámicos seguros** en una aplicación Java + Spring Boot cuando necesitás búsquedas flexibles con:

- múltiples criterios opcionales
- rangos de fecha
- estado
- texto parcial
- tenant
- ownership
- paginación
- ordenamiento
- combinaciones distintas según el contexto

La idea es resolver una necesidad muy real del backend moderno:

> poder buscar y filtrar con flexibilidad sin volver a caer en concatenaciones frágiles, parámetros inseguros o consultas que nadie entiende bien.

---

## Idea clave

Cuando una aplicación crece, aparecen endpoints como estos:

- búsqueda de órdenes
- filtros de productos
- listados administrativos
- reportes operativos
- dashboards
- backoffice con varios campos opcionales

Y ahí surge una tensión muy común:

- si hacés todo fijo, el endpoint queda limitado
- si hacés todo libre, el endpoint queda riesgoso

Herramientas como **Criteria API**, **Specifications** o builders similares ayudan a encontrar un punto intermedio más sano, porque permiten:

- componer filtros
- mantener separadas estructura y valores
- agregar condiciones de forma más controlada
- evitar concatenaciones improvisadas

En resumen:

> la consulta puede ser dinámica sin que el cliente controle la sintaxis.

---

## Qué problema intenta resolver este tema

Este tema busca evitar patrones como:

- armar JPQL con `StringBuilder`
- concatenar `WHERE`, `AND` y `ORDER BY`
- meter filtros del request como texto dentro de la query
- perder restricciones de tenant o ownership en caminos opcionales
- mezclar lógica de negocio con texto de consulta
- convertir un buscador flexible en una mini gramática controlada por el cliente
- terminar con queries imposibles de auditar

Es decir:

> el objetivo no es solo evitar injection.  
> También es construir consultas dinámicas que sigan siendo legibles, predecibles y consistentes con la autorización real.

---

## Error mental clásico

Un error muy común es pensar:

### “Como la búsqueda tiene muchos filtros, necesariamente hay que armar texto dinámico”

No.

Lo que suele hacer falta es componer condiciones.
No pegar strings.

### Diferencia importante

Una cosa es esto:

- sumar predicados
- combinar criterios opcionales
- agregar restricciones según el actor

Y otra muy distinta es esto:

- construir una consulta textual a base de concatenación
- dejar que el request decida propiedades libres
- cerrar la query “a mano”

La primera opción puede ser sana.
La segunda suele degradar seguridad muy rápido.

---

## Dónde suele aparecer este problema

Lo vas a ver mucho en endpoints como:

- `/orders?status=PAID&from=...&to=...`
- `/products?name=...&category=...&sort=...`
- `/admin/users?role=...&active=...`
- listados con varios filtros opcionales
- reportes por rango y estado
- búsquedas internas de soporte
- exportaciones CSV o Excel
- paneles con filtros combinables

Cuantos más filtros aparecen, más tentador se vuelve hacer algo así:

```java
String jpql = "select o from Order o where 1=1";

if (status != null) {
    jpql += " and o.status = '" + status + "'";
}

if (from != null) {
    jpql += " and o.createdAt >= '" + from + "'";
}
```

Y ahí empiezan los problemas.

---

## Qué aporta Criteria API

Criteria API permite construir consultas de forma programática, expresando condiciones como objetos en vez de como texto concatenado.

Eso ayuda porque:

- la consulta se arma con estructura controlada
- los valores se incorporan como datos
- se vuelve más difícil caer en concatenación insegura
- es más fácil agregar filtros opcionales sin improvisar strings
- la composición de condiciones queda más explícita

### Idea útil

No hace falta enamorarse de la sintaxis de Criteria API para entender su valor.

El punto importante es este:

> si la búsqueda es dinámica, conviene que la dinámica viva en objetos y condiciones controladas, no en texto armado a mano.

---

## Un ejemplo conceptual

Supongamos un listado de órdenes que admite:

- estado
- email del cliente
- fecha desde
- fecha hasta
- tenant actual
- usuario dueño en algunos casos
- exclusión de borrados lógicos

Una construcción más sana pensaría algo así:

- si viene `status`, agrego un predicado por estado
- si viene `customerEmail`, agrego un predicado por email
- siempre agrego tenant
- siempre excluyo soft delete
- según el actor, agrego ownership o permisos ampliados

La clave es que cada condición se agrega como parte de una estructura controlada por el backend.

---

## Dynamic no significa libre

Esto conviene remarcarlo.

Que una consulta sea dinámica no significa que todo pueda venir libre desde el cliente.

Por ejemplo, sigue siendo mala idea dejar que el request decida sin control:

- el nombre exacto de la propiedad a filtrar
- la columna del `ORDER BY`
- relaciones arbitrarias
- fragmentos enteros de condición
- combinaciones de operadores irrestrictos

Una consulta dinámica más sana sigue teniendo límites claros.

### Regla práctica

La dinámica debería vivir en estas decisiones:

- qué filtros opcionales soporta el backend
- qué combinación permite
- qué campos son ordenables
- qué condiciones se agregan siempre
- qué restricciones son obligatorias por seguridad

No en texto libre enviado por el cliente.

---

## Specifications en Spring Data

En proyectos Spring Boot, mucha gente termina usando **Specifications** sobre Spring Data JPA.

Eso suele ser útil porque permite:

- encapsular condiciones reutilizables
- combinar filtros con `and()` y `or()`
- separar mejor cada criterio
- hacer búsquedas más modulares
- mantener la query menos acoplada al controller

### Ejemplo conceptual

Podrías tener piezas como:

- `hasStatus(status)`
- `belongsToTenant(tenantId)`
- `createdAfter(from)`
- `emailContains(term)`
- `notDeleted()`

y luego combinarlas según el caso.

### Qué valor tiene eso

Ayuda a que el código diga con más claridad:

- qué restricciones siempre aplican
- cuáles son opcionales
- cuáles dependen del contexto de autorización

Eso mejora seguridad y también mantenibilidad.

---

## Criteria API no es una defensa mágica

Este punto es importante.

Usar Criteria API no garantiza automáticamente que la consulta sea segura.

También podés cometer errores si:

- elegís campos estructurales sin whitelist
- armás rutas de propiedades demasiado abiertas
- olvidás tenant u ownership
- agregás filtros opcionales pero no los obligatorios
- combinás mal `OR` y `AND`
- devolvés demasiados datos aunque la consulta esté “bien construida”

Entonces conviene pensar así:

> Criteria API ayuda a construir mejor.  
> Pero sigue haciendo falta criterio de seguridad.

---

## Tenant, ownership y estado no deberían ser “opcionales”

Uno de los beneficios de un armado más estructurado es que te obliga a pensar qué filtros son realmente opcionales y cuáles no.

### Ejemplos de filtros que muchas veces no deberían faltar nunca

- tenant actual
- exclusión de soft delete
- estado visible para ese actor
- ownership del recurso
- restricciones de organización
- visibilidad del registro

### Error típico

El backend trata todo como si fuera un filtro opcional del buscador.
Y entonces alguien termina omitiendo algo que en realidad era una restricción de seguridad.

### Idea clave

No todo predicado es “un filtro más”.
Algunos son parte del **modelo de acceso**.

Y esos deberían agregarse siempre.

---

## `OR` mal usado puede abrir más de lo debido

En búsquedas dinámicas, un error lógico muy común aparece al combinar predicados con `OR`.

### Ejemplo mental

Querías algo como:

- pertenece al tenant actual
- y además coincide con el término de búsqueda

Pero terminás haciendo algo equivalente a:

- pertenece al tenant actual
- o coincide con el término

Eso puede ampliar muchísimo el alcance de la consulta.

### Regla práctica

En seguridad, `OR` merece todavía más atención que `AND`, porque puede:

- relajar restricciones
- mezclar casos incompatibles
- abrir acceso a datos que no correspondían
- producir resultados sorprendentemente amplios

La consulta puede estar “bien escrita” y aun así estar mal desde lógica de acceso.

---

## Sorting: sigue necesitando whitelist

Aunque uses Criteria API o Specifications, el ordenamiento sigue siendo un punto delicado.

No porque la herramienta sea insegura, sino porque el cliente puede querer elegir:

- campo
- dirección asc/desc
- combinaciones de orden

Eso no debería pasar de forma libre.

### Más sano

Definir una lista cerrada de campos ordenables, por ejemplo:

- `createdAt`
- `updatedAt`
- `status`
- `email`

y mapear cada opción a una propiedad conocida del modelo.

### Regla útil

La dinámica del sort puede existir.
Lo que no debería existir es el sort arbitrario.

---

## Búsquedas parciales y `LIKE`

Con filtros dinámicos suele aparecer también la búsqueda textual parcial.

Ahí la idea sana sigue siendo la misma:

- decidir el campo del lado del backend
- pasar el término como valor
- no armar una mini query textual desde el request

Por ejemplo, está bien querer:

- buscar por nombre
- buscar por email
- buscar por order number

Pero esas opciones deberían estar definidas por el backend, no por texto libre que el cliente inventa.

---

## Criteria API puede ayudar a no duplicar lógica sensible

Otro valor interesante es que permite centralizar predicados importantes.

Por ejemplo, si en muchas búsquedas siempre hace falta:

- excluir borrados lógicos
- filtrar por tenant
- restringir por visibilidad
- limitar por ownership

tener eso encapsulado reduce la chance de olvidarlo.

### Idea útil

Cuando una restricción de seguridad depende de que una persona “se acuerde” de agregarla manualmente en cada query, tarde o temprano alguien se la va a olvidar.

Cuanto más reusable y visible sea esa restricción, mejor.

---

## Builders útiles vs builders peligrosos

No todo builder es bueno por definición.

Hay builders que ayudan a expresar condiciones.
Y hay builders que terminan siendo solo una forma elegante de concatenar cosas.

### Builder sano

- expone operaciones cerradas
- sabe qué filtros existen
- controla campos permitidos
- agrega restricciones obligatorias
- diferencia valor de estructura

### Builder peligroso

- acepta strings arbitrarias
- permite pasar nombres de propiedad libres
- deja combinar cualquier cosa sin control
- transforma el backend en un intérprete del cliente

La diferencia es grande.

---

## Cuidado con búsquedas “demasiado poderosas”

A veces el problema no es técnico, sino de alcance funcional.

Un buscador puede quedar peligrosamente poderoso si permite combinar:

- demasiados filtros sensibles
- demasiados campos internos
- demasiada visibilidad sobre el dataset
- criterios que facilitan enumeración

Aunque la consulta esté bien construida, igual puede ser una mala idea desde seguridad.

### Ejemplos

- soporte buscando usuarios por demasiados atributos sensibles
- backoffice filtrando datos que deberían estar segmentados
- listados exportables con campos internos
- búsquedas que permiten inferir existencia de registros delicados

Entonces conviene preguntar no solo:

- ¿está bien construida?

sino también:

- ¿debería existir con ese poder?

---

## Performance y seguridad a veces van juntas

Cuando una búsqueda dinámica está mejor diseñada, muchas veces también mejora:

- claridad del plan de consulta
- previsibilidad de filtros
- control sobre joins
- cantidad de datos traídos
- facilidad para paginar

Y eso ayuda a la seguridad porque reduce:

- consultas monstruosas difíciles de auditar
- paths raros que nadie entiende
- exposición accidental de datos
- comportamiento inesperado en reportes o listados

No siempre performance y seguridad se oponen.
Muchas veces se ayudan.

---

## Qué conviene revisar en una codebase

Cuando revises filtros dinámicos en Spring, buscá especialmente:

- `StringBuilder` armando consultas
- JPQL o SQL concatenada según request params
- Specifications que olvidan tenant o ownership
- combinaciones de `OR` poco claras
- sort libre desde el cliente
- filtros opcionales que en realidad deberían ser obligatorios
- builders que aceptan nombres de campo arbitrarios
- backoffice con búsqueda excesivamente amplia
- queries de exportación reutilizando filtros sin revisar alcance
- métodos donde nadie puede explicar qué restricciones siempre aplican

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- filtros dinámicos construidos con estructura controlada
- valores incorporados como datos y no como texto
- Specifications o predicados reutilizables
- tenant, ownership y soft delete incorporados como parte normal del acceso
- campos ordenables definidos por whitelist
- distinción clara entre filtros opcionales y restricciones obligatorias
- búsquedas más auditables
- código que permite entender rápido qué datos puede ver cada actor

---

## Señales de ruido

Estas señales merecen atención rápida:

- `where 1=1` combinado con concatenación
- request params que controlan propiedades o caminos del modelo
- sort libre
- builders que aceptan cualquier string
- `OR` que afloja restricciones sin querer
- Specifications reutilizadas en contextos incompatibles
- consultas dinámicas que nadie entiende completas
- filtros de seguridad modelados como opcionales
- endpoints de búsqueda que parecen demasiado poderosos para el actor que los usa

---

## Checklist práctico

Cuando revises filtros dinámicos, preguntate:

- ¿la consulta dinámica está construida con estructura controlada o con texto concatenado?
- ¿qué filtros son opcionales y cuáles deberían ser obligatorios?
- ¿tenant, ownership y soft delete se agregan siempre?
- ¿hay `OR` que pueda ampliar demasiado el alcance?
- ¿el sort pasa por whitelist?
- ¿el cliente controla nombres de propiedad o solo elige entre opciones cerradas?
- ¿la búsqueda devuelve solo lo que ese actor realmente necesita?
- ¿los predicados sensibles están reutilizados de forma consistente?
- ¿el código es auditable o parece un parche acumulado?
- ¿este endpoint ganó flexibilidad a costa de perder límites?

---

## Mini ejercicio de reflexión

Tomá un endpoint real de búsqueda de tu proyecto y respondé:

1. ¿Qué filtros soporta hoy?
2. ¿Cuáles son filtros funcionales y cuáles son restricciones de seguridad?
3. ¿El tenant y el ownership están integrados o alguien los agrega “si se acuerda”?
4. ¿El sort está controlado?
5. ¿Hay alguna combinación con `OR` que podría ampliar demasiado los resultados?
6. ¿La búsqueda es más poderosa de lo que el actor necesita?
7. ¿Qué cambiarías para que sea más fácil de auditar y más difícil de abusar?

---

## Resumen

Criteria API, Specifications y patrones similares ayudan mucho cuando una búsqueda necesita ser flexible sin volverse caótica.

Su valor principal no es “hacer magia”, sino permitir que la dinámica viva en una estructura más segura y controlada.

Aun así, lo importante sigue siendo:

- mantener separados estructura y valores
- no dejar que el cliente controle lo estructural
- incorporar tenant, ownership y visibilidad como parte normal del acceso
- usar whitelist para sorting
- revisar con cuidado las combinaciones lógicas
- no convertir un buscador útil en una herramienta demasiado poderosa

En resumen:

> una búsqueda dinámica sana no es la que acepta cualquier combinación imaginable.  
> Es la que ofrece flexibilidad suficiente para el caso real,  
> pero manteniendo límites claros sobre qué se puede filtrar, ordenar y ver.

---

## Próximo tema

**Búsquedas y ordenamientos controlados**
