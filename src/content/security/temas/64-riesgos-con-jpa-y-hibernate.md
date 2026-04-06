---
title: "Riesgos con JPA y Hibernate"
description: "Qué riesgos de seguridad aparecen al usar JPA y Hibernate en aplicaciones Java con Spring Boot. Por qué un ORM no reemplaza la autorización, cómo se filtran datos por entidades mal modeladas y qué revisar en repositories, relaciones, cascadas, fetches y serialización."
order: 64
module: "SQL Injection, JPA y persistencia segura"
level: "base"
draft: false
---

# Riesgos con JPA y Hibernate

## Objetivo del tema

Entender qué riesgos de seguridad aparecen en aplicaciones Java + Spring Boot cuando se usa:

- JPA
- Hibernate
- Spring Data JPA
- entidades persistentes
- repositories
- relaciones entre entidades
- cascadas
- fetches
- serialización de objetos persistidos

La idea principal es desmontar otra falsa sensación de seguridad muy común:

> usar un ORM mejora productividad y ordena el acceso a datos,  
> pero no garantiza por sí solo seguridad, autorización correcta ni exposición mínima.

---

## Idea clave

JPA e Hibernate ayudan a abstraer la base de datos.
Eso está muy bien.

Pero una abstracción cómoda también puede esconder errores importantes, por ejemplo cuando el equipo asume cosas como:

- “si viene de un repository, entonces está bien”
- “si la entidad existe, se puede usar”
- “si el ORM arma la query, no hay problema”
- “si el controller devuelve la entidad, el framework se encarga”
- “si el cascade está puesto, ya resolverá todo”

Ese tipo de confianza excesiva suele abrir problemas reales.

En resumen:

> el ORM resuelve persistencia.  
> La seguridad sigue dependiendo de cómo modelás acceso, relaciones, filtros y exposición de datos.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- leer entidades sin verificar ownership
- usar `findById()` donde debería existir un filtro por usuario o tenant
- devolver entidades completas en responses
- exponer relaciones sensibles por serialización automática
- confiar en cascadas sin pensar impacto
- hacer updates sobre entidades demasiado poderosas
- olvidar filtros de estado, tenant o soft delete
- asumir que repository equivale a autorización
- usar fetches que traen más de lo necesario
- dejar que dirty checking persista cambios no planeados

Es decir:

> el problema no es JPA.  
> El problema es usarlo como si persistencia, exposición, negocio y seguridad fueran la misma cosa.

---

## Error mental clásico

Uno de los errores más comunes es este:

### “Como no estoy escribiendo SQL a mano, la capa de datos ya es segura”

Eso es falso por dos motivos.

### 1. Porque todavía podés introducir queries inseguras
Ya lo vimos con JPQL dinámica o native queries mal construidas.

### 2. Porque muchos riesgos de JPA no son injection
También hay riesgos como:

- acceso horizontal entre usuarios
- sobreexposición de datos
- mezcla entre entidad y contrato público
- filtros incompletos
- cambios persistidos por accidente
- relaciones que arrastran información sensible

Entonces este tema amplía la mirada:

> seguridad en persistencia no es solo “evitar SQL injection”.  
> También es controlar qué leés, qué modificás, qué devolvés y bajo qué condiciones.

---

## Repository no significa autorización

Este punto es central.

Supongamos que existe esto:

```java
orderRepository.findById(orderId)
```

Técnicamente funciona.
Pero desde seguridad puede ser insuficiente.

### ¿Qué falta pensar?

- ¿la orden pertenece al usuario autenticado?
- ¿es del tenant correcto?
- ¿está en un estado visible para este actor?
- ¿debería poder verla soporte pero no editarla?
- ¿debería estar excluida si está archivada o soft deleted?

Si usás un `findById()` genérico y después asumís que “ya está”, abrís la puerta a errores como IDOR, acceso horizontal o fuga entre tenants.

### Más sano

Buscar o validar con restricciones reales del contexto, por ejemplo:

- por `id` y `owner`
- por `id` y `tenant`
- por `id` y `estado permitido`
- o resolver autorización en service antes de actuar

La entidad encontrada no es igual a la entidad autorizada.

---

## findById suele traer más de lo que debería

Muchos problemas nacen de una costumbre práctica:

- buscar por ID
- si existe, usar
- si no existe, error

Ese patrón es cómodo, pero desde seguridad suele ser pobre.

### Problema real

El hecho de que una fila exista en base no implica que el actor actual deba:

- verla
- editarla
- borrarla
- exportarla
- cambiar su estado

### Idea importante

En muchos casos la consulta correcta no es:

```java
findById(id)
```

sino algo más cercano a:

- “buscar este recurso si pertenece al actor”
- “buscarlo dentro del tenant actual”
- “buscarlo solo si está visible”
- “buscarlo solo si no está eliminado”
- “buscarlo con el scope correcto”

Eso cambia completamente el nivel de seguridad del acceso a datos.

---

## Entidades no deberían ser contratos públicos

Otro error muy frecuente es devolver entidades JPA directamente desde controllers.

### Por qué es riesgoso

Porque una entidad suele mezclar:

- persistencia
- relaciones internas
- campos técnicos
- flags de negocio
- datos que no deberían salir
- asociaciones que pueden cargar mucho más de lo esperado

Entonces, si devolvés una entidad tal cual, corrés el riesgo de exponer:

- campos sensibles
- relaciones internas
- IDs de referencia innecesarios
- estados internos
- información histórica
- datos de auditoría
- estructura que el cliente no necesitaba ver

### Más sano

Usar DTOs de salida pensados para el caso de uso.

Eso permite decidir conscientemente:

- qué sale
- qué no sale
- qué nombres se exponen
- qué relaciones se resumen
- qué datos quedan internos

---

## Lazy loading y serialización: una combinación peligrosa

Un caso clásico aparece cuando una entidad tiene relaciones lazy y luego se serializa a JSON.

### Qué puede salir mal

- se cargan relaciones que nadie quería exponer
- aparecen consultas inesperadas
- se serializa una cadena grande de objetos
- se revelan estructuras internas
- se incluyen datos sensibles de entidades relacionadas
- el endpoint se vuelve impredecible

A veces el problema no es solo performance.
También es seguridad y control de exposición.

### Ejemplo mental

Querías devolver:

- una orden

y terminás devolviendo además:

- cliente
- dirección
- historial
- ítems
- descuentos
- usuario creador
- tenant
- flags internos

porque la serialización terminó recorriendo relaciones.

### Regla sana

No depender de la serialización automática de entidades persistentes como contrato de API.

---

## EAGER tampoco es una solución mágica

Algunos equipos, para evitar problemas de lazy loading, terminan marcando demasiadas relaciones como eager.

Eso puede empeorar otras cosas:

- traer demasiados datos
- aumentar superficie de exposición
- cargar información sensible “por las dudas”
- hacer más difícil razonar qué sale y qué no
- volver costosas operaciones simples

Desde seguridad, pedir de más también es una mala práctica.

### Idea útil

Un acceso a datos más sano suele traer:

- solo lo necesario
- para el caso de uso concreto
- con una forma de salida controlada

---

## Dirty checking puede persistir cambios no planeados

Hibernate tiene algo muy útil: el contexto de persistencia detecta cambios y puede sincronizarlos automáticamente.

Eso es cómodo.
Pero también puede sorprender.

### Riesgo conceptual

Si una entidad cargada queda viva durante una transacción y alguien modifica campos que no debía tocar, esos cambios podrían persistirse aunque nadie haya querido hacer un “update completo” explícito.

### Esto empeora si:

- se mezclan responsabilidades en el service
- la entidad circula demasiado
- el mapper modifica más campos de los debidos
- el input del usuario termina copiándose sobre la entidad sin control fino
- se trabaja con objetos muy ricos y poco acotados

### Conclusión

Dirty checking no es inseguro por sí mismo.
Lo inseguro es no tener claro:

- qué campos pueden cambiar
- quién los cambia
- cuándo se persisten
- cuál es el límite entre input externo y estado interno

---

## Cascadas: comodidad que puede amplificar daño

Las cascadas (`CascadeType.ALL`, `REMOVE`, etc.) son útiles, pero merecen mucha atención.

### ¿Qué puede salir mal?

- borrar más de lo previsto
- persistir relaciones que no correspondían
- actualizar asociaciones por arrastre
- crear o eliminar objetos vinculados sin revisar autorización
- permitir que una operación aparentemente simple tenga demasiado alcance

### Ejemplo conceptual

Un actor puede editar una entidad principal.
Pero eso no implica automáticamente que deba poder:

- crear hijos
- borrar hijos
- reasignar relaciones
- tocar entidades asociadas
- arrastrar cambios a otras partes del modelo

Si el diseño confunde “puede modificar este recurso” con “puede modificar todo su grafo”, el riesgo sube mucho.

---

## orphanRemoval y borrados silenciosos

Otra comodidad peligrosa aparece con `orphanRemoval`.

Puede ser útil.
Pero si no está muy bien entendido, puede provocar:

- eliminaciones silenciosas
- pérdida de registros relacionados
- inconsistencias de negocio
- acciones difíciles de auditar
- borrados que el usuario nunca quiso de verdad

Desde seguridad y trazabilidad, cualquier automatismo de borrado merece revisión.

Especialmente cuando los datos:

- son sensibles
- deberían conservar historial
- requieren auditoría
- están sujetos a reglas de negocio
- no deberían desaparecer sin más

---

## Soft delete: si olvidás el filtro, reaparece el dato

Muchos sistemas usan soft delete para no eliminar físicamente registros.

Eso puede estar bien.
Pero introduce otro riesgo:

> si una consulta olvida filtrar correctamente, los datos “borrados” reaparecen.

Eso puede generar:

- exposición accidental
- resultados inconsistentes
- acceso a datos archivados
- confusión entre estados activos e inactivos
- bypass parcial de reglas del negocio

### Idea práctica

Si tu modelo usa soft delete, revisá con especial cuidado:

- repositories
- búsquedas custom
- reportes
- exports
- endpoints admin
- relaciones que traen datos asociados

Porque es muy fácil que un camino quede sin el filtro correcto.

---

## Multi-tenant: JPA no aísla mágicamente

En sistemas multi-tenant, este punto es crítico.

A veces el equipo cree que porque cada entidad tiene un `tenantId`, ya está resuelto.
No.

### Riesgo real

Si las consultas no incorporan siempre el contexto del tenant, una simple llamada a repository puede terminar trayendo:

- recursos de otro cliente
- conteos globales
- datos cruzados
- relaciones que apuntan fuera del tenant
- resultados mezclados

Y eso ya es un incidente serio.

### Regla sana

El aislamiento entre tenants no puede depender de recordar “a mano” el filtro una vez sí y otra no.

Tiene que formar parte del diseño normal del acceso a datos.

---

## Métodos derivados pueden parecer más inocentes de lo que son

Spring Data JPA hace muy fácil crear métodos como:

- `findByEmail`
- `findByStatus`
- `findByOrderNumber`
- `findByUserId`

Eso acelera mucho.
Pero también puede ocultar preguntas importantes:

- ¿falta tenant?
- ¿falta ownership?
- ¿falta estado visible?
- ¿falta excluir soft delete?
- ¿falta limitar por organización?
- ¿ese método sirve para más de un contexto donde no debería?

Lo cómodo no siempre es lo correcto.

Un método derivado muy genérico puede terminar siendo reutilizado en lugares donde la seguridad requerida era distinta.

---

## Queries correctas desde datos, pero incorrectas desde negocio

A veces una consulta está bien escrita técnicamente y aun así es insegura.

### Ejemplo conceptual

Una query puede ser perfectamente válida y parametrizada, pero seguir estando mal si devuelve:

- todos los pedidos de todos los usuarios
- todas las cuentas del sistema
- recursos de cualquier tenant
- datos archivados
- registros que el actor no debería poder ver

Eso muestra algo importante:

> una consulta puede estar bien desde SQL y mal desde autorización.

La persistencia segura no se agota en la sintaxis.
También incluye el alcance correcto de los datos.

---

## Relaciones bidireccionales: exposición y complejidad

Las relaciones bidireccionales pueden ser útiles en el modelo.
Pero hacia afuera suelen traer problemas como:

- serialización recursiva
- exposición innecesaria
- objetos demasiado grandes
- dificultad para controlar qué ve el cliente
- lógica de negocio acoplada al grafo completo

No siempre son un problema de seguridad directo.
Pero sí aumentan complejidad y superficie de fuga.

Y en seguridad, más complejidad suele significar:

- más lugares donde equivocarse
- más difícil revisar qué sale
- más difícil probar acceso correcto

---

## Open Session in View puede tapar errores de diseño

Cuando el contexto de persistencia sigue abierto hasta la capa web, muchas cosas “parecen funcionar”.
Pero eso también puede ocultar problemas.

Por ejemplo:

- el controller accede a relaciones que no debería tocar
- la vista o serialización dispara queries extra
- se exponen datos por comodidad
- nadie sabe realmente qué se cargó y por qué

Desde un punto de vista de seguridad y diseño, eso puede volver más borrosos los límites entre:

- persistencia
- negocio
- presentación
- exposición pública

Cuanto más claros sean esos límites, mejor.

---

## Qué conviene revisar primero en una codebase Spring con JPA

Cuando revises seguridad alrededor de JPA/Hibernate, mirá con prioridad:

- controllers que devuelven entidades
- `findById()` usados en operaciones sensibles
- repositories sin filtros por tenant o ownership
- relaciones lazy que llegan a la respuesta
- cascadas amplias como `CascadeType.ALL`
- uso de `orphanRemoval`
- entidades con demasiados campos editables
- métodos derivados demasiado genéricos
- soft delete implementado de forma inconsistente
- servicios donde la autorización ocurre después de cargar demasiado
- endpoints admin que reutilizan repositories comunes

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- DTOs de salida bien pensados
- entidades separadas del contrato público
- acceso a datos con filtros de contexto reales
- repositorios menos genéricos y más intencionales
- relaciones modeladas con criterio
- cascadas justificadas y acotadas
- cambios de estado controlados desde service
- multi-tenant tratado como parte del diseño
- soft delete revisado con consistencia
- autorización resuelta antes de operar con amplitud

---

## Señales de ruido

Estas señales merecen atención inmediata:

- devolver entidades JPA directo al cliente
- usar `findById()` como paso universal
- confiar en que “si existe en base, se puede usar”
- serialización automática de relaciones
- `CascadeType.ALL` por defecto en todas partes
- métodos repository reutilizados en contextos distintos
- datos soft deleted reapareciendo
- repositorios que ignoran tenant o ownership
- controllers con lógica de persistencia y exposición mezclada
- nadie puede explicar qué campos de una entidad son realmente públicos

---

## Checklist práctico

Cuando revises riesgos con JPA y Hibernate, preguntate:

- ¿las consultas respetan usuario, tenant y estado?
- ¿hay `findById()` donde debería haber filtros de autorización?
- ¿se devuelven entidades o DTOs?
- ¿la serialización puede arrastrar relaciones sensibles?
- ¿hay cascadas con demasiado alcance?
- ¿dirty checking puede persistir cambios no planeados?
- ¿soft delete está bien aplicado en todos los caminos?
- ¿los métodos de repository son demasiado genéricos?
- ¿la capa service controla realmente lo que se puede hacer?
- ¿el modelo está pensado para persistencia o también se lo está usando como API pública?

---

## Mini ejercicio de reflexión

Tomá una entidad importante de tu proyecto, por ejemplo:

- User
- Order
- Invoice
- Product
- Ticket

y respondé:

1. ¿Qué campos nunca deberían salir al cliente?
2. ¿Qué relaciones podrían exponerse por accidente?
3. ¿Un `findById()` simple sería suficiente para leerla?
4. ¿Qué filtros de tenant, ownership o estado faltan?
5. ¿Qué cambios podrían persistirse sin querer por dirty checking?
6. ¿Hay cascadas que amplifican demasiado una operación?
7. ¿Esa entidad está siendo usada como modelo interno y también como contrato externo?

Ese ejercicio ayuda mucho a descubrir riesgos que suelen pasar desapercibidos porque “el ORM lo hace fácil”.

---

## Resumen

JPA e Hibernate son herramientas muy valiosas.
Pero también pueden dar una falsa sensación de seguridad si se usan sin criterio.

Los riesgos más comunes no vienen solo por SQL injection.
También aparecen cuando:

- repository se confunde con autorización
- entidad se confunde con DTO público
- relaciones se exponen sin control
- cascadas amplifican operaciones
- dirty checking persiste cambios no planeados
- soft delete o tenant quedan mal filtrados
- el modelo de datos se usa sin pensar alcance real

En resumen:

> un ORM no reemplaza diseño seguro.  
> Solo vuelve más cómodo el acceso a datos.  
> La seguridad sigue dependiendo de qué datos traés, bajo qué filtros, cómo los modificás y qué terminás exponiendo.

---

## Próximo tema

**Queries seguras con parámetros**
