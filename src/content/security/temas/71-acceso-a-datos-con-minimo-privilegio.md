---
title: "Acceso a datos con mínimo privilegio"
description: "Cómo aplicar mínimo privilegio en el acceso a datos de una aplicación Java con Spring Boot. Qué puede salir mal cuando la app, sus cuentas técnicas o sus consultas tienen más alcance del necesario, y cómo pensar permisos, lectura, escritura, administración y segmentación para reducir impacto."
order: 71
module: "SQL Injection, JPA y persistencia segura"
level: "base"
draft: false
---

# Acceso a datos con mínimo privilegio

## Objetivo del tema

Entender cómo aplicar el principio de **mínimo privilegio** en el acceso a datos de una aplicación Java + Spring Boot.

La idea es mirar no solo:

- qué consulta hace la app
- qué endpoint expone
- qué filtros usa

sino también algo más profundo:

- con qué cuenta se conecta a la base
- qué permisos reales tiene esa cuenta
- qué podría leer, modificar o borrar si algo sale mal
- cuánto daño puede hacer una query incorrecta o una credencial comprometida

En resumen:

> no alcanza con escribir queries correctas.  
> También importa muchísimo cuánto poder tiene la aplicación sobre los datos.

---

## Idea clave

Una aplicación segura no debería poder hacer “de todo” solo porque le resulta más cómodo al equipo.

El principio de mínimo privilegio dice algo muy simple:

> cada componente debería tener solo los permisos necesarios para cumplir su función, y no más.

Llevado al acceso a datos, eso significa pensar:

- qué tablas necesita leer
- cuáles necesita escribir
- cuáles nunca debería tocar
- si necesita borrar físicamente o no
- si requiere permisos de administración o solo de uso normal
- si todos los módulos necesitan el mismo nivel de acceso

La meta no es volver imposible el desarrollo.
La meta es que un error, un abuso o una credencial filtrada tengan menos capacidad de daño.

---

## Qué problema intenta resolver este tema

Este tema busca evitar situaciones como:

- la app corre con una cuenta que puede leer y escribir todo
- el usuario de base puede alterar estructura sin necesidad
- cualquier bug en un módulo afecta tablas que no debería tocar
- un endpoint comprometido puede barrer todo el dataset
- una SQL injection tiene un impacto mucho mayor porque la cuenta tiene demasiado poder
- servicios distintos comparten una única cuenta con permisos enormes
- tareas de lectura usan la misma identidad que tareas administrativas
- nadie sabe exactamente qué privilegios necesita realmente la aplicación

Es decir:

> el problema no es solo “si hay una vulnerabilidad”.  
> El problema también es cuánto daño puede hacer esa vulnerabilidad una vez que existe.

---

## Error mental clásico

Un error muy común es este:

### “Como la app es nuestra, puede tener acceso total a la base”

Ese razonamiento parece práctico, pero es peligroso.

Porque la aplicación no es un actor mágico y perfecto.
La app puede fallar por:

- bugs
- malas validaciones
- endpoints mal autorizados
- queries incorrectas
- credenciales filtradas
- módulos inseguros
- terceros integrados
- abuso desde cuentas legítimas comprometidas

Si la cuenta técnica tiene poder excesivo, cualquier error se vuelve más caro.

### Idea importante

No diseñes los permisos pensando en “la app ideal”.
Diseñalos pensando en:

- fallos parciales
- módulos comprometidos
- consultas mal construidas
- credenciales expuestas
- incidentes reales

---

## Mínimo privilegio reduce impacto, no reemplaza otras defensas

Esto conviene remarcarlo.

Aplicar mínimo privilegio no evita por sí solo:

- SQL injection
- IDOR
- mala autorización
- sobreexposición en responses
- errores lógicos

Pero sí reduce bastante el impacto posible.

### Ejemplo mental

Si una consulta sale mal o alguien logra abusar un endpoint, no es lo mismo que la cuenta de base pueda:

- leer solo algunas tablas necesarias

a que pueda:

- leer todo
- escribir todo
- borrar todo
- alterar esquema
- ejecutar operaciones administrativas

Entonces mínimo privilegio no sustituye controles.
Los complementa.

---

## Qué significa “privilegio” en acceso a datos

Cuando hablamos de privilegio en este contexto, no hablamos solo de “ser admin” o “no ser admin”.

También hablamos de permisos concretos como:

- `SELECT`
- `INSERT`
- `UPDATE`
- `DELETE`
- creación o alteración de tablas
- ejecución de funciones
- acceso a esquemas enteros
- visibilidad sobre vistas o tablas sensibles
- capacidad de borrar registros históricos
- capacidad de tocar datos de auditoría o configuración

### Idea útil

A veces el problema no es tener acceso “total total”.
A veces ya es demasiado poder tener:

- escritura donde solo hacía falta lectura
- borrado físico donde alcanzaba con soft delete
- acceso a tablas sensibles que ese módulo ni usa
- permisos estructurales en una app que solo debería operar datos

---

## La cuenta de la app no debería ser dueña de todo

Un error frecuente en entornos pequeños o medianos es usar para la aplicación una cuenta que prácticamente es dueña de la base.

Eso puede significar permisos para:

- crear tablas
- alterar tablas
- borrar tablas
- modificar índices
- tocar esquemas completos
- leer tablas operativas y también internas
- usar funciones administrativas

### Por qué es mala idea

Porque una aplicación de negocio normal no debería necesitar ese nivel de poder para funcionar día a día.

Y si lo tiene, cualquier incidente escala muchísimo.

### Regla sana

La cuenta que usa la app en runtime debería estar pensada para operar el sistema, no para administrarlo.

---

## Runtime no es lo mismo que migraciones

Este punto es muy importante.

Muchas veces se mezclan dos necesidades distintas:

## 1. Ejecutar la aplicación en producción
Necesita leer y escribir ciertos datos.

## 2. Cambiar el esquema
Necesita permisos mucho más altos para:

- crear tablas
- modificar columnas
- cambiar índices
- tocar constraints

### Error típico

Usar la misma cuenta poderosa para ambas cosas.

### Más sano

Separar identidades o contextos:

- una cuenta para migraciones
- otra más limitada para la aplicación en runtime

Eso reduce mucho el impacto si se compromete la cuenta usada por la app todos los días.

---

## Lectura y escritura no siempre deberían vivir juntas

Otro principio útil es no asumir que todo módulo necesita el mismo tipo de acceso.

Por ejemplo, hay componentes que solo deberían:

- leer catálogos
- consultar listados
- generar reportes
- mostrar dashboards

y otros que sí necesitan:

- crear registros
- actualizar estado
- persistir eventos
- aplicar operaciones de negocio

### Pregunta sana

¿Realmente este componente necesita escribir?

Si la respuesta es no, darle escritura “por comodidad” ya es exceso de privilegio.

---

## DELETE merece especial atención

Muchos sistemas conceden `DELETE` como si fuera una capacidad normal más.
No siempre debería ser así.

### Preguntas útiles

- ¿este sistema realmente borra físicamente datos?
- ¿el dominio requiere conservación histórica?
- ¿alcanza con desactivar o archivar?
- ¿el borrado físico debería estar reservado a tareas muy controladas?

### Idea importante

Si una cuenta técnica puede borrar físicamente demasiadas cosas, cualquier bug, consulta incorrecta o abuso gana una capacidad destructiva enorme.

No siempre podrás evitar `DELETE`, pero cuando exista conviene justificarlo muy bien.

---

## Esquemas, tablas y vistas: no todo debería estar al alcance

Otra práctica floja es dar acceso amplio a todo el esquema “porque total es la misma base”.

Eso puede mezclar en la misma zona:

- tablas de negocio
- tablas internas
- auditoría
- configuración sensible
- sesiones
- colas
- secretos o referencias críticas
- datos históricos

### Más sano

Limitar el acceso a:

- lo que el módulo usa
- lo que el caso de uso necesita
- lo que realmente hace falta en runtime

Si ciertas tablas nunca deberían ser tocadas por la app o por un módulo concreto, mejor que la base también lo refleje.

---

## Módulos distintos, alcances distintos

En sistemas más grandes, no todos los servicios o módulos deberían compartir la misma cuenta con acceso total al mismo universo de datos.

### Porque eso trae varios problemas

- cualquier módulo comprometido hereda demasiado poder
- cuesta razonar quién accede a qué
- se pierde trazabilidad
- un bug en una parte afecta datos ajenos
- la segmentación lógica del sistema queda solo “en la cabeza del equipo”

### Idea útil

Si tenés componentes con responsabilidades claramente distintas, suele ser más sano pensar también en:

- identidades separadas
- permisos separados
- superficie separada

No siempre hace falta microsegmentar todo, pero sí evitar cuentas omnipotentes compartidas por inercia.

---

## SQL injection + cuenta poderosa = incidente mucho peor

Este es uno de los motivos más claros para aplicar mínimo privilegio.

Una inyección o una query mal construida puede ser grave de por sí.
Pero su impacto real cambia muchísimo según el poder de la cuenta.

### No es lo mismo que la cuenta pueda:

- leer unas pocas tablas necesarias

a que pueda:

- leer toda la base
- escribir en muchas tablas
- borrar masivamente
- alterar estructura
- tocar datos administrativos

### Conclusión práctica

Aunque no puedas garantizar cero bugs, sí podés diseñar para que un bug tenga menos poder cuando ocurra.

Y eso ya es una mejora enorme.

---

## También importa para errores lógicos y autorización rota

No hace falta llegar a una SQL injection para que mínimo privilegio sea útil.

También ayuda cuando hay problemas como:

- endpoints que devuelven más de la cuenta
- consultas que olvidan tenant
- servicios que actualizan estados incorrectos
- módulos que escriben en tablas que no les correspondían
- tareas batch con lógica defectuosa
- cuentas internas abusadas por scripts o integraciones

### Idea importante

Mínimo privilegio no protege solo contra atacantes “externos”.
También protege contra:

- errores propios
- automatizaciones rotas
- herramientas internas demasiado poderosas
- incidentes operativos

---

## Vistas y proyecciones pueden ayudar

En algunos contextos, una forma útil de reducir privilegio es no exponer directamente todo el modelo subyacente.

Por ejemplo, puede tener sentido usar:

- vistas de solo lectura
- proyecciones controladas
- tablas intermedias para reporting
- contratos de acceso más acotados

### Qué valor tienen

- reducen superficie
- limitan columnas accesibles
- evitan que ciertos módulos vean más de lo necesario
- simplifican el modelo disponible para ciertos casos

No siempre será la mejor solución, pero es una herramienta válida para pensar acceso con menos alcance.

---

## Auditoría y trazabilidad también mejoran

Cuando los accesos están mejor segmentados, también mejora la capacidad de responder preguntas como:

- qué módulo accedió a qué
- por qué identidad técnica pasó esa operación
- qué cuenta escribió ese dato
- qué componente pudo haber causado el incidente

En cambio, si todo entra a la base con:

- la misma cuenta
- el mismo alcance
- el mismo permiso amplio

entonces se pierde muchísima claridad operativa.

Y eso hace más difícil:

- investigar
- contener
- corregir
- justificar cambios

---

## Cuidado con “solo en desarrollo” que termina copiándose

Muchas veces se empieza con permisos amplios en dev “para no complicarse”.
Eso puede parecer razonable de forma temporal.

El problema aparece cuando:

- esa configuración se copia a staging
- luego llega a producción
- nadie vuelve a revisarla
- se normaliza como “la forma en que funciona la app”

### Idea útil

Lo que se tolera por apuro al principio suele quedarse mucho más de lo previsto.

Por eso conviene pensar los permisos bien desde temprano, aunque después ajustes detalles.

---

## Privilegios de base y privilegios de aplicación no son lo mismo

Este punto también conviene dejarlo claro.

Que una aplicación tenga lógica de autorización en services o controllers está bien.
Pero eso no vuelve irrelevante la capa de permisos de base de datos.

Ambas cosas operan en niveles distintos:

- la autorización de aplicación decide qué puede hacer cada actor del negocio
- los privilegios de base limitan qué poder técnico tiene la app o el módulo sobre los datos

### Idea importante

No hay que elegir una u otra.
Se complementan.

Si una falla, la otra puede ayudar a contener daño.

---

## Qué conviene revisar en una codebase o despliegue

Cuando revises mínimo privilegio en acceso a datos, mirá especialmente:

- qué usuario usa la app en runtime
- si esa cuenta también se usa para migraciones
- si tiene permisos estructurales innecesarios
- si puede leer tablas sensibles que no usa
- si tiene `DELETE` donde no hacía falta
- si módulos distintos comparten una sola cuenta demasiado poderosa
- si existen contextos de solo lectura que podrían separarse
- si hay vistas o contratos acotados para reporting o lectura
- si se puede explicar claramente por qué cada permiso existe
- si el equipo sabe cuál sería el impacto de comprometer esa cuenta hoy

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- cuenta de runtime separada de migraciones
- permisos ajustados al caso real
- menos alcance sobre esquemas y tablas
- escritura solo donde hace falta
- borrado físico muy acotado o justificado
- mejor separación entre módulos o componentes con responsabilidades distintas
- más claridad operativa sobre quién accede a qué
- menor impacto posible ante bugs o credenciales comprometidas

---

## Señales de ruido

Estas señales merecen revisión inmediata:

- la app corre como si fuera dueña total de la base
- misma cuenta para runtime y cambios de esquema
- permisos amplios “porque así es más fácil”
- acceso a tablas que ningún caso de uso necesita
- `DELETE` habilitado por inercia
- servicios distintos con la misma identidad omnipotente
- nadie sabe exactamente qué privilegios tiene la app
- una credencial filtrada daría acceso enorme al sistema
- la segmentación existe en el código, pero no en los permisos reales

---

## Checklist práctico

Cuando revises acceso a datos con mínimo privilegio, preguntate:

- ¿qué cuenta usa la aplicación en runtime?
- ¿esa cuenta también sirve para migraciones o tareas administrativas?
- ¿qué permisos concretos tiene?
- ¿realmente necesita lectura y escritura sobre todo lo que alcanza?
- ¿puede borrar físicamente más de lo razonable?
- ¿accede a tablas o esquemas que no forman parte de su función?
- ¿módulos distintos podrían tener identidades separadas?
- ¿hay formas de dar acceso de solo lectura a ciertos casos?
- ¿qué pasaría hoy si esa credencial se filtrara?
- ¿cuánto daño podría hacer un bug con los permisos actuales?

---

## Mini ejercicio de reflexión

Tomá la cuenta de base que hoy usa una de tus aplicaciones y respondé:

1. ¿Para qué fue creada originalmente?
2. ¿Qué permisos concretos tiene hoy?
3. ¿Cuáles de esos permisos son realmente necesarios?
4. ¿Qué tablas o esquemas toca que no debería tocar?
5. ¿Se usa también para migraciones o tareas administrativas?
6. ¿Qué incidente sería mucho peor de lo necesario por culpa de esos permisos?
7. ¿Qué reducirías primero sin romper la operación normal?

---

## Resumen

Acceso a datos con mínimo privilegio significa diseñar la relación entre aplicación y base de datos con una pregunta central:

> ¿cuál es el menor nivel de poder que permite que este sistema funcione bien?

Eso implica pensar:

- lectura vs escritura
- runtime vs migraciones
- tablas necesarias vs tablas sobrantes
- borrado físico vs conservación
- módulos distintos con alcances distintos
- impacto real de un bug o una credencial comprometida

En resumen:

> una app más madura no asume que necesita acceso total para trabajar cómoda.  
> Diseña sus permisos para que, si algo falla, el daño posible sea menor y más fácil de contener.

---

## Próximo tema

**Cómo no exponer más información de la necesaria desde repositorios**
