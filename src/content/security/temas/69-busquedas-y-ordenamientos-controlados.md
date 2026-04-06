---
title: "Búsquedas y ordenamientos controlados"
description: "Cómo diseñar búsquedas y ordenamientos controlados en aplicaciones Java con Spring Boot para evitar enumeración, fuga de datos, sorting inseguro y consultas demasiado poderosas. Qué campos conviene exponer, cuáles deberían pasar por whitelist y cómo mantener límites sanos en filtros, sort y alcance real de los resultados."
order: 69
module: "SQL Injection, JPA y persistencia segura"
level: "base"
draft: false
---

# Búsquedas y ordenamientos controlados

## Objetivo del tema

Entender cómo diseñar **búsquedas y ordenamientos controlados** en una aplicación Java + Spring Boot cuando el backend ofrece endpoints como:

- listados
- filtros
- búsquedas parciales
- ordenamiento asc/desc
- paneles administrativos
- backoffice
- exports
- búsquedas internas de soporte

La idea es ver que este tema no es solo una cuestión de comodidad funcional o UX.

También es una cuestión de seguridad.

Porque un endpoint que deja buscar, filtrar y ordenar sin control puede transformarse en una herramienta para:

- enumerar datos
- inferir existencia de recursos
- descubrir estructura del sistema
- recorrer información sensible
- amplificar abuso funcional
- exponer demasiado contexto a actores que no lo necesitaban

---

## Idea clave

Buscar y ordenar no debería significar:

- “el cliente puede pedir cualquier campo”
- “puede ordenar por cualquier propiedad”
- “puede combinar filtros arbitrarios”
- “puede recorrer el dataset como quiera”

Una API sana define con claridad:

- qué campos son buscables
- qué campos son ordenables
- qué combinaciones son razonables
- qué restricciones se agregan siempre
- qué resultados puede ver realmente cada actor

En resumen:

> una búsqueda útil no tiene por qué ser una búsqueda ilimitada.

---

## Qué problema intenta resolver este tema

Este tema busca evitar patrones como:

- sort por texto libre desde request params
- búsquedas sobre campos sensibles sin necesidad
- filtros que revelan demasiado sobre el modelo interno
- combinaciones que permiten enumerar registros
- listados demasiado poderosos para usuarios comunes
- endpoints donde soporte o admin ven más de lo necesario
- búsquedas que arrastran datos de otros tenants
- ordenamiento sobre propiedades internas o no preparadas para exposición
- filtros que nacieron como funcionalidad y terminan siendo una interfaz de exploración ofensiva

Es decir:

> el problema no es permitir buscar.  
> El problema es dejar que el buscador se convierta en una herramienta de reconocimiento del sistema.

---

## Error mental clásico

Un error muy común es este:

### “Si el dato ya existe en la base, no pasa nada por permitir buscarlo”

Eso es engañoso.

Porque una cosa es que un dato exista internamente.
Y otra muy distinta es que el sistema ofrezca una interfaz cómoda para:

- descubrirlo
- recorrerlo
- ordenarlo
- correlacionarlo
- inferirlo a partir de resultados

### Ejemplo mental

Tal vez un usuario no puede ver todos los registros directamente.
Pero si puede:

- filtrar por demasiados atributos
- ordenar por campos internos
- paginar a voluntad
- combinar criterios sensibles

entonces el endpoint empieza a revelar mucho más de lo que parecía.

---

## Búsqueda útil vs búsqueda demasiado poderosa

No toda capacidad de búsqueda tiene el mismo nivel de riesgo.

### Búsquedas razonables

Suelen ser cosas como:

- nombre visible
- número de orden propio
- estado del recurso
- fecha dentro de un rango acotado
- categoría pública
- email propio del usuario autenticado en su contexto

### Búsquedas más delicadas

Suelen ser cosas como:

- hashes o identificadores internos
- flags técnicos
- datos archivados
- estados internos no visibles
- atributos de auditoría
- tenantId
- propiedades del modelo que el cliente ni siquiera debería conocer
- relaciones internas que facilitan exploración del dataset

### Idea útil

Que algo exista como columna no significa que deba existir como criterio de búsqueda expuesto.

---

## Ordenamiento: parece inocente, pero no siempre lo es

Mucha gente subestima el impacto de permitir ordenar.

Piensa algo así:

- “solo cambia el orden”
- “no cambia qué registros salen”
- “no debería ser un problema”

Pero en la práctica el ordenamiento puede ayudar a:

- inferir estructura interna
- descubrir campos disponibles
- explorar datasets
- hacer enumeración más eficiente
- provocar errores o paths raros
- amplificar abuso en listados grandes

### Ejemplo conceptual

No es lo mismo permitir ordenar por:

- `createdAt`
- `updatedAt`
- `name`

que por:

- flags internos
- score técnico
- estado de revisión interna
- prioridad operativa
- tenantId
- atributos que el usuario no debería ni conocer

Entonces el sort también forma parte del diseño de exposición.

---

## Regla básica: whitelist explícita

Una práctica muy sana es definir listas cerradas de campos permitidos.

Por ejemplo:

- buscables: `name`, `status`, `createdAt`
- ordenables: `createdAt`, `updatedAt`, `name`

Y todo lo demás queda fuera.

### Qué mejora esto

- evita improvisación
- reduce superficie
- hace el endpoint más predecible
- evita que el cliente pruebe campos arbitrarios
- fuerza a pensar qué está realmente soportado
- ayuda a mantener la API estable

### Regla práctica

Si un campo no fue decidido explícitamente como buscable u ordenable, no debería estar disponible “por las dudas”.

---

## No mezclar nombres internos del modelo con contrato externo

Otro error común es exponer directamente al cliente los nombres de propiedades internas del dominio o de la entidad.

Por ejemplo, cosas como:

- `sort=deletedAt`
- `sort=tenantId`
- `sort=internalScore`
- `filter=reviewState`
- `filter=adminNotes`

Eso genera dos problemas:

### 1. Expone demasiado del modelo interno
El cliente aprende cómo está estructurado el sistema.

### 2. Acopla la API al modelo persistente
Después cualquier refactor interno rompe el contrato externo o te obliga a sostener decisiones feas por compatibilidad.

### Más sano

Ofrecer opciones controladas y pensadas como contrato público.

No “pasame el nombre del campo real de la entidad”.

---

## Búsqueda textual libre: también necesita límites

Las búsquedas por texto parcial son útiles, pero si se diseñan mal pueden volverse demasiado amplias.

### Riesgos comunes

- buscar sobre demasiadas columnas a la vez
- incluir campos sensibles
- permitir búsquedas muy costosas
- facilitar enumeración
- devolver demasiados resultados correlacionables
- dar pistas sobre existencia de registros delicados

### Ejemplo mental

No es lo mismo permitir:

- buscar productos por nombre público

que permitir:

- buscar usuarios por nombre, email, teléfono, documento, flags internos y observaciones administrativas todo junto

Lo segundo puede ser funcionalmente tentador, pero desde seguridad es mucho más delicado.

---

## Búsquedas administrativas: cuidado con “ya que es admin”

En paneles de administración o soporte, mucha gente relaja demasiado las restricciones con la idea de que:

- “esto lo ve personal interno”
- “es una herramienta operativa”
- “cuanto más flexible mejor”

Y ahí aparecen endpoints excesivamente poderosos.

### Problemas típicos

- soporte puede explorar más de lo necesario
- admin ve campos que no necesitaba para esa tarea
- se mezclan datos sensibles con filtros amplios
- el sistema facilita consultas casi investigativas
- una cuenta comprometida gana demasiada capacidad de exploración

### Idea importante

Que un actor tenga más permisos no significa que toda búsqueda deba ser irrestricta.

También en admin conviene pensar:

- propósito concreto
- mínimo dato
- mínimo campo buscable
- mínimo campo ordenable

---

## Tenant, ownership y visibilidad siguen aplicando

Un endpoint de búsqueda no deja de necesitar restricciones reales solo porque tenga filtros opcionales.

Esto es clave.

Podés tener un buscador muy prolijo y aun así inseguro si olvida:

- tenant actual
- ownership
- soft delete
- estados visibles
- organización
- límites por rol o scope

### Error típico

El equipo piensa que los filtros del buscador son “la parte importante” y deja las restricciones de acceso como algo secundario.

No debería ser así.

### Regla sana

Primero se define:

- qué universo de datos puede ver el actor

y recién después:

- cómo puede buscar dentro de ese universo

No al revés.

---

## Combinar demasiados filtros puede facilitar enumeración

Aunque cada filtro por separado parezca inocente, la combinación puede volver el endpoint mucho más poderoso.

### Ejemplos de combinaciones delicadas

- nombre + fecha + estado + rango + orden
- email + tenant + flags + antigüedad
- varios filtros que permiten acotar progresivamente hasta identificar registros específicos

Eso puede facilitar:

- enumeración de cuentas
- confirmación de existencia
- exploración progresiva del dataset
- correlación de datos que individualmente parecían poco sensibles

### Idea útil

La revisión sana no mira solo “cada filtro”.
También mira el poder total que surge de combinarlos.

---

## Respuestas vacías, conteos y paginación también filtran

No solo filtra el contenido del resultado.

También pueden dar señal cosas como:

- total de resultados
- cantidad de páginas
- si el sort cambia mucho la distribución
- diferencias de respuesta entre criterios similares
- mensajes distintos según exista o no el recurso buscado

Esto importa especialmente cuando la búsqueda toca datos sensibles o recursos cuya existencia no conviene confirmar tan fácilmente.

### Ejemplo mental

Tal vez el endpoint no devuelve el registro.
Pero si responde con un conteo preciso o con diferencias muy marcadas entre combinaciones de filtros, igual puede ayudar a inferir demasiado.

---

## Ordenamientos costosos o raros también son un riesgo operativo

Además de la fuga de información, un sort demasiado flexible puede ser un problema operativo.

Por ejemplo, si permite ordenar por:

- campos no indexados
- relaciones complejas
- columnas costosas
- expresiones no previstas

Eso puede degradar:

- performance
- estabilidad
- previsibilidad del endpoint

Y una API difícil de predecir también es más difícil de defender.

### Idea práctica

Los campos ordenables deberían elegirse no solo por valor funcional, sino también por:

- seguridad
- estabilidad
- costo operativo
- claridad del contrato

---

## Mapear opciones públicas a campos internos

Una práctica muy útil es desacoplar la opción pública del campo interno real.

Por ejemplo, en vez de aceptar:

- `sort=createdAt`
- `sort=internalPriority`

podrías aceptar opciones públicas como:

- `sort=recientes`
- `sort=antiguos`
- `sort=nombre`

y mapear eso a la lógica interna correspondiente.

### Qué gana esto

- menos exposición del modelo real
- más libertad para refactor interno
- contrato más simple
- menos chances de que el cliente “explore” nombres de propiedades

No siempre hace falta llegar tan lejos, pero es una idea valiosa.

---

## Búsquedas pensadas para el caso de uso, no para el dataset

Otro error frecuente es diseñar el endpoint como si el objetivo fuera “dar acceso flexible a la base”.

No.

El objetivo debería ser resolver un caso de uso concreto.

### Preguntas más sanas

- ¿qué necesita encontrar realmente este actor?
- ¿qué criterios le sirven de verdad?
- ¿qué campos le aportan valor real?
- ¿qué opciones de orden tiene sentido ofrecer?
- ¿qué combinaciones son razonables para ese flujo?

### Pregunta menos sana

- “¿qué tan genérico podemos hacer este buscador?”

Cuanto más genérico se vuelve, más se parece a una herramienta de exploración del sistema.

---

## Qué conviene revisar en una codebase

Cuando revises búsquedas y ordenamientos, mirá especialmente:

- request params como `sort`, `order`, `field`, `filterBy`
- nombres de propiedades expuestos directo al cliente
- búsquedas sobre campos sensibles
- listados admin demasiado flexibles
- ausencia de whitelist explícita
- búsquedas que ignoran tenant u ownership
- combinaciones de filtros demasiado poderosas
- conteos o paginación que dan demasiada señal
- endpoints donde nadie puede explicar por qué cierto campo es ordenable
- búsquedas reutilizadas en contextos distintos sin revisar alcance

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- campos buscables definidos explícitamente
- campos ordenables definidos explícitamente
- whitelist para sort y filtros estructurales
- separación entre contrato público y modelo interno
- restricciones de tenant, ownership y visibilidad siempre presentes
- búsqueda pensada para un caso de uso real
- límites razonables en combinaciones y amplitud
- respuestas consistentes y menos útiles para enumeración

---

## Señales de ruido

Estas señales merecen revisión rápida:

- `sort` libre
- `field` o `filterBy` arbitrario
- nombres de columnas o propiedades reales expuestos al cliente
- búsquedas sobre demasiados campos internos
- admin tools con poder casi irrestricto
- filtros que facilitan acotar hasta identificar registros sensibles
- conteos muy precisos donde no hacían falta
- endpoints de búsqueda que parecen un explorador general del dataset
- nadie sabe qué campos deberían estar realmente expuestos

---

## Checklist práctico

Cuando revises un endpoint de búsqueda u ordenamiento, preguntate:

- ¿qué campos son realmente buscables y por qué?
- ¿qué campos son realmente ordenables y por qué?
- ¿existe una whitelist explícita?
- ¿el contrato público expone nombres internos del modelo?
- ¿tenant, ownership y visibilidad se aplican siempre?
- ¿la combinación de filtros puede facilitar enumeración?
- ¿el sort revela algo interno o cuesta demasiado operativamente?
- ¿este actor necesita realmente toda esta flexibilidad?
- ¿el endpoint está pensado para un caso de uso o para explorar la base?
- ¿qué quitarías sin romper valor real para el usuario legítimo?

---

## Mini ejercicio de reflexión

Tomá un endpoint de listado de tu proyecto y respondé:

1. ¿Qué filtros permite hoy?
2. ¿Qué campos acepta para ordenar?
3. ¿Cuáles de esos campos realmente aportan valor al caso de uso?
4. ¿Cuáles exponen demasiado del modelo o del dataset?
5. ¿El actor puede ver solo su universo de datos antes de buscar?
6. ¿La combinación de filtros podría facilitar enumeración?
7. ¿Qué simplificarías para hacerlo más seguro y más claro?

---

## Resumen

Diseñar búsquedas y ordenamientos controlados significa decidir con intención:

- qué se puede buscar
- qué se puede ordenar
- qué combinaciones tienen sentido
- qué restricciones siempre aplican
- qué parte del modelo conviene mantener interna

No se trata de hacer endpoints pobres o inútiles.
Se trata de evitar que una funcionalidad legítima se convierta en una interfaz de exploración excesiva.

En resumen:

> un buscador sano no es el que expone todo lo que la base puede hacer.  
> Es el que ayuda al actor correcto a encontrar lo que realmente necesita,  
> sin regalarle un mapa del sistema ni una herramienta cómoda para enumerar datos.

---

## Próximo tema

**Paginación segura**
