---
title: "Autorización robusta y control fino de permisos"
description: "Qué cambia cuando la autorización deja de ser solo admin vs user, cómo modelar permisos reales en sistemas con tenants, recursos sensibles y operaciones de distinto riesgo, y qué decisiones de roles, políticas, ownership, alcance y auditoría importan de verdad en un backend profesional."
order: 133
module: "Seguridad y operación avanzada"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior hablamos de autenticación avanzada y gestión de identidad.

Ahí la pregunta central era:

**¿quién sos y con qué nivel de confianza aceptamos esa identidad?**

Ahora aparece la siguiente pregunta, igual de importante:

**aunque sepamos quién sos, exactamente qué estás autorizado a hacer?**

Y acá empieza un problema que en sistemas reales suele ser mucho más difícil de lo que parece.

Porque en proyectos chicos, la autorización muchas veces nace así:

- `isAdmin == true`
- `user.role == ADMIN`
- “si está logueado, puede entrar”
- “si es dueño del recurso, puede editar”

Eso a veces alcanza al principio.

Pero cuando el producto crece, empiezan a aparecer matices:

- usuarios con distintos roles
- permisos diferentes según tenant u organización
- recursos compartidos parcialmente
- acciones sensibles que no todos deberían poder ejecutar
- operaciones internas de soporte o backoffice
- delegación de acceso
- permisos temporales
- capacidades que dependen del plan contratado
- visibilidad distinta según estado del recurso
- acciones que requieren justificación, auditoría o aprobación

Entonces la autorización deja de ser un if simple.
Pasa a ser una **capa de control sobre capacidades, alcance y contexto**.

Dicho simple:

**autorización robusta es el arte de decidir correctamente qué actor puede hacer qué cosa, sobre qué recurso, en qué contexto, bajo qué condiciones y con qué trazabilidad.**

## Autorización no es solo roles

Éste es uno de los errores más comunes.

Mucha gente aprende autorización usando roles como:

- admin
- manager
- editor
- user
- guest

Los roles son útiles.
Pero no alcanzan para modelar todo.

Porque una autorización real suele depender de varias dimensiones al mismo tiempo:

- identidad del actor
- rol general
- pertenencia a una organización o tenant
- relación con el recurso
- estado del recurso
- acción específica que quiere ejecutar
- plan o licencia activa
- nivel de riesgo de la operación
- restricciones temporales o contextuales

Por eso conviene pensar así:

**los roles son una herramienta de modelado, no la autorización completa.**

## Qué responde realmente la autorización

Una decisión de autorización bien pensada responde algo más rico que un simple sí o no.

En el fondo intenta resolver:

- quién es el actor
- qué quiere hacer
- sobre qué recurso lo quiere hacer
- desde qué contexto actúa
- si tiene permiso directo, indirecto o derivado
- si hay condiciones adicionales para permitirlo
- si la acción debería quedar auditada
- si el sistema debe mostrar ese recurso o incluso ocultar que existe

No siempre se trata solo de permitir o negar.
A veces también se trata de decidir:

- qué campos puede ver
- qué subconjunto de datos puede consultar
- qué transición de estado puede ejecutar
- qué alcance tiene una búsqueda
- qué acciones puede delegar
- qué operación requiere reautenticación o aprobación

## El error de pensar autorización como un detalle de controller

En muchos backends aparece algo así:

- validación en el controller
- un if rápido por rol
- un chequeo aislado en el service
- algún filtro en frontend

Y listo.

El problema es que la autorización no debería quedar repartida sin criterio.

Porque cuando eso pasa, aparecen consecuencias como:

- reglas duplicadas
- inconsistencias entre endpoints
- bypass por rutas menos protegidas
- bugs donde un flujo sí valida y otro no
- incapacidad de auditar por qué algo fue permitido
- miedo enorme a tocar permisos porque nadie entiende el sistema

La autorización es una parte del dominio y también una parte de la seguridad.
Por eso necesita un diseño explícito.

## Niveles de madurez en autorización

### Etapa básica

- login obligatorio
- algunos endpoints públicos y otros privados
- roles globales simples
- checks dispersos

### Etapa intermedia

- permisos por rol más definidos
- ownership sobre recursos
- separación por tenant u organización
- validaciones más consistentes en servicios o políticas
- visibilidad condicionada por contexto
- auditoría de acciones sensibles

### Etapa avanzada

- políticas compuestas por actor, acción, recurso y contexto
- permisos contextuales por tenant
- delegación y permisos temporales
- step-up auth para acciones de alto riesgo
- aprobaciones o dual control para operaciones críticas
- soporte interno con acceso acotado y auditado
- autorización a nivel de campo, colección y transición de estado

No todo sistema necesita lo máximo.
Pero sí conviene saber en qué nivel estás y qué complejidad ya no podés seguir resolviendo con parches.

## Tipos de control de acceso que suelen aparecer

### RBAC: role-based access control

Permisos según rol.

Ejemplo:

- admin puede gestionar usuarios
- operador puede ver órdenes
- editor puede publicar contenido

Sirve muchísimo cuando las capacidades son relativamente estables.

Problema:
si todo se intenta meter dentro de roles, el sistema termina con roles inflados, ambiguos o imposibles de mantener.

### ABAC: attribute-based access control

La decisión depende de atributos del actor, del recurso o del contexto.

Ejemplo:

- puede ver la orden si pertenece al mismo tenant
- puede editar si el recurso está en borrador
- puede reembolsar si el monto es menor a cierto umbral y tiene permiso financiero

Da más flexibilidad, pero también exige más cuidado para no volver ilegible la lógica.

### ReBAC o autorización basada en relaciones

La decisión depende de la relación entre actor y recurso.

Ejemplo:

- puede comentar porque es miembro del proyecto
- puede editar porque es owner del documento
- puede ver el tablero porque fue invitado con acceso de lectura

Muy útil en productos colaborativos.

### Políticas híbridas

En backend real, lo común es combinar varios enfoques.

Por ejemplo:

- rol general del usuario
- pertenencia al tenant
- ownership del recurso
- estado actual del recurso
- operación concreta

Eso suele reflejar mejor la realidad que elegir una sola etiqueta teórica.

## El problema de los roles globales

Uno de los errores más frecuentes es modelar roles como si fueran absolutos en todo el sistema.

Ejemplo pobre:

- `ADMIN`
- `EDITOR`
- `USER`

Y listo.

Pero en sistemas multi-tenant o B2B, una misma persona puede:

- ser admin en una organización
- ser viewer en otra
- no tener acceso en una tercera

Entonces el rol efectivo casi nunca debería pensarse solo a nivel global.
Muchas veces debe pensarse como:

- usuario autenticado
- organización activa
- rol dentro de esa organización
- permisos derivados en ese contexto

Si esto se modela mal, aparecen errores clásicos:

- acceso cruzado entre tenants
- permisos aplicados globalmente cuando debían ser locales
- usuarios viendo recursos de otra organización
- soporte de incidentes confuso porque no se entiende desde qué contexto actuó alguien

## Ownership no siempre significa permiso total

Otro error muy común:

- “si es dueño del recurso, puede hacer cualquier cosa”

A veces sí.
Pero muchas veces no.

Ejemplos:

- el creador de una orden no debería poder marcarla como pagada
- el autor de un documento no debería poder publicarlo si falta revisión
- quien creó un usuario no debería poder elevarle permisos arbitrariamente
- el dueño de un archivo quizás puede verlo, pero no compartirlo fuera de su tenant

Ownership ayuda, pero no reemplaza el resto de las políticas.

## Autorización por acción, no solo por recurso

Otro patrón útil:

no pensar “acceso al recurso” como algo único,
sino separar por acciones.

Por ejemplo, sobre `Invoice` quizás existan permisos distintos para:

- ver
- listar
- crear
- editar borrador
- aprobar
- emitir
- anular
- exportar
- reenviar por email

Si todo se resume en “puede acceder a invoice”, el modelo queda demasiado grueso y termina generando puertas de más o de menos.

En backend real conviene pensar autorización en términos de:

**actor + acción + recurso + contexto**

## Visibilidad y descubribilidad también son autorización

A veces el error es pensar que autorización entra solo al momento de ejecutar una acción.

Pero hay una capa anterior:

**¿ese actor siquiera debería enterarse de que ese recurso existe?**

Ejemplos:

- una búsqueda no debería devolver datos de otros tenants
- un usuario no debería poder inferir IDs válidos por mensajes distintos
- un panel no debería mostrar acciones que nunca va a poder ejecutar
- un endpoint no debería filtrar tarde después de traer demasiados datos

Esto toca algo muy importante:

la autorización también afecta:

- queries
- filtros
- listado de resultados
- joins
- paginación
- estructura de respuestas

No es solo una validación al final.

## Autorización a nivel de datos y campos

En algunos sistemas no alcanza con decir si un recurso puede verse o no.
También importa qué parte del recurso puede verse.

Ejemplo:

- soporte puede ver la orden pero no los últimos 4 dígitos de la tarjeta
- un manager puede ver métricas agregadas pero no datos personales detallados
- un usuario interno puede leer una cuenta pero no su secreto API
- un operador puede editar estado logístico pero no cambiar precios

Esto introduce autorización a nivel de:

- campo
- vista
- proyección
- respuesta serializada

Si el sistema crece, esta granularidad se vuelve muy importante.

## Transiciones de estado y permisos especiales

Muchas operaciones sensibles no son simplemente “editar”.
En realidad son transiciones de estado.

Ejemplo en e-commerce:

- `CREATED -> PAID`
- `PAID -> REFUNDED`
- `PACKED -> SHIPPED`
- `PENDING -> APPROVED`

No cualquier actor debería poder ejecutar cualquier transición.
Y muchas veces el permiso depende de:

- estado actual
- rol operativo
- monto o criticidad
- justificación
- tenant
- políticas de negocio

Éste es un punto donde la autorización se mezcla fuerte con las reglas del dominio.

## Entitlements, planes y autorización de producto

En productos SaaS aparece otra capa:

**no solo importa el rol del usuario, sino también qué permite el plan contratado.**

Por ejemplo:

- el plan básico no puede exportar CSV
- el plan enterprise sí permite SSO
- el plan pro puede tener más proyectos activos
- el plan free no puede usar ciertas automatizaciones

Acá aparece la diferencia entre:

- permisos del actor
- capacidades del producto habilitadas para ese tenant

Ambas cosas juntas definen lo que realmente puede ocurrir.

Un usuario puede tener rol de admin,
pero si el tenant no contrató cierta capacidad, igualmente no debería poder usarla.

## Soporte interno, impersonation y acceso operativo

En sistemas reales suele aparecer una necesidad incómoda pero frecuente:

- soporte necesita ayudar a un cliente
- operaciones necesita inspeccionar un caso
- fraude necesita revisar actividad
- un administrador interno necesita actuar sobre cuentas ajenas

Acá el error sería resolverlo con accesos omnipotentes sin control.

Buenas preguntas:

- ¿quién puede impersonar a quién?
- ¿queda auditado que se hizo?
- ¿se muestra visualmente que está actuando en modo soporte?
- ¿hay acciones prohibidas incluso bajo impersonation?
- ¿se requiere justificación o ticket asociado?
- ¿hay expiración o alcance acotado?

El acceso interno sin límites suele convertirse en un riesgo enorme.

## Permisos temporales, delegación y acceso acotado

No todo permiso tiene que ser permanente.

A veces conviene modelar:

- acceso por tiempo limitado
- aprobación puntual
- delegación temporal de funciones
- links firmados para una operación específica
- permisos de emergencia con expiración automática

Esto reduce superficie de riesgo y mejora operación.

El problema es que muchos sistemas no lo modelan.
Entonces la única manera de resolver excepciones termina siendo:

- dar más permisos permanentes de los necesarios
- compartir credenciales
- hacer bypass manual por soporte

Y eso degrada la seguridad muy rápido.

## Dónde debería vivir la lógica de autorización

No hay una única respuesta perfecta,
pero sí hay un principio muy sano:

**la autorización debe vivir donde pueda mantenerse consistente, entendible y reutilizable.**

Algunas ideas prácticas:

- el controller puede autenticar y derivar contexto, pero no debería cargar toda la lógica fina
- el service o caso de uso suele ser mejor lugar para aplicar decisiones cercanas a la operación
- políticas explícitas o authorization services ayudan a centralizar reglas repetidas
- el acceso a datos también debería respetar alcance y filtrado, no solo traer todo y decidir después

Señal de mal diseño:

- reglas desperdigadas por todos lados
- algunos endpoints validan y otros no
- frontend “oculta” acciones que backend igual permitiría
- repositorios traen datos fuera de alcance y luego se filtran en memoria

## Fallar seguro: deny by default y mínima capacidad

Dos ideas clásicas siguen siendo extremadamente valiosas.

### Deny by default

Si no hay razón explícita para permitir,
se niega.

No se parte de “todo permitido hasta que agreguemos reglas”.
Se parte del criterio contrario.

### Least privilege

Cada actor, servicio o integración debería tener solo la capacidad mínima necesaria.

Esto aplica a:

- usuarios
- admins
- soporte
- jobs
- servicios internos
- integraciones externas
- claves API

Muchísimos incidentes graves se vuelven peores porque algo tenía bastante más permiso del que necesitaba.

## Errores comunes en autorización

### 1. Reducir todo a admin vs user

Sirve muy poco cuando el producto madura.

### 2. Mezclar autenticación con autorización

Estar logueado no significa poder hacer cualquier cosa.

### 3. Aplicar roles globales donde hacía falta contexto por tenant

Muy peligroso en SaaS y B2B.

### 4. Validar tarde, después de consultar datos fuera de alcance

Eso puede generar fugas o comportamiento inconsistente.

### 5. Duplicar reglas en frontend y backend sin fuente clara de verdad

Después divergen y nadie sabe cuál manda.

### 6. No auditar acciones sensibles ni accesos internos

Entonces investigar incidentes se vuelve muy difícil.

### 7. Conceder permisos permanentes para resolver excepciones temporales

Rápido al principio, carísimo después.

### 8. No modelar transiciones de estado críticas como permisos especiales

Y tratar todo como “editar”.

## Qué preguntas conviene hacerse al diseñar autorización

1. ¿qué actores existen en el sistema?
2. ¿qué recursos y acciones sensibles hay?
3. ¿qué permisos dependen del tenant, del ownership o del estado del recurso?
4. ¿qué cosas deberían ocultarse, no solo negarse?
5. ¿qué operaciones requieren auditoría, reautenticación o aprobación?
6. ¿qué capacidades dependen del plan o entitlement del producto?
7. ¿qué accesos internos existen y cómo se controlan?
8. ¿qué parte del modelo hoy está demasiado simplificada y puede romperse cuando el sistema crezca?

## Relación con autenticación avanzada

Este tema continúa de forma directa al anterior.

La autenticación te dice:

- quién es el actor
- qué sesión tiene
- qué nivel de confianza presenta

La autorización usa eso como entrada,
pero además necesita considerar:

- contexto activo
- rol o permisos
- recurso objetivo
- estado del negocio
- restricciones del tenant
- nivel de sensibilidad de la operación

En otras palabras:

**autenticación prueba identidad; autorización decide capacidades.**

## Qué deberías llevarte de esta lección

Si tuvieras que quedarte con una sola idea, que sea ésta:

**autorización no es un if suelto ni una columna role; es un modelo de decisiones sobre capacidades, alcance y contexto.**

Cuando el producto crece, esta capa se vuelve estructural.

Si está mal pensada, el costo aparece en:

- incidentes de seguridad
- accesos indebidos entre tenants
- lógica duplicada
- producto inflexible
- soporte riesgoso
- miedo a cambiar permisos
- operación difícil de auditar

## Cierre

En backend real, autorizar bien no significa inventar complejidad innecesaria.
Significa aceptar que los sistemas de verdad tienen actores distintos, recursos sensibles, contextos variables y operaciones que no deberían tratarse todas igual.

Un backend profesional necesita poder responder con claridad:

- quién actúa
- sobre qué recurso
- en qué contexto
- con qué permiso
- bajo qué condiciones
- con qué alcance
- y con qué trazabilidad

Ésa es la diferencia entre tener un par de checks sueltos,
y tener una **capa de autorización madura**.

Y una vez que esa capa existe, el siguiente paso natural es endurecer todavía más la superficie del sistema:

**cómo validar entradas de manera defensiva y cómo evitar que datos o requests hostiles atraviesen el backend aunque pasen los controles funcionales.**

Ahí entramos en el próximo tema: **validación defensiva y hardening de entrada**.
