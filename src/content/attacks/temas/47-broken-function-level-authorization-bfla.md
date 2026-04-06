---
title: "Broken Function Level Authorization (BFLA)"
description: "Qué es Broken Function Level Authorization, por qué es una falla crítica en APIs y cómo permite que identidades sin el rol adecuado ejecuten funciones o acciones que no deberían estar a su alcance."
order: 47
module: "Ataques web más avanzados"
level: "intermedio"
draft: false
---

# Broken Function Level Authorization (BFLA)

En el tema anterior vimos **Broken Object Level Authorization (BOLA)**, una falla donde la API no valida correctamente si una identidad puede acceder a un objeto específico.

Ahora vamos a estudiar otra vulnerabilidad muy importante y muy frecuente en APIs modernas: **Broken Function Level Authorization**, o **BFLA**.

La idea general es esta:

> la API expone una función, operación o acción que sí existe legítimamente en el sistema, pero no valida correctamente si la identidad que la invoca tiene el nivel de autoridad necesario para ejecutarla.

Esto vuelve a BFLA especialmente delicada porque el problema ya no está solo en **qué objeto** se toca, sino en **qué función del sistema** queda disponible para quien no corresponde.

Por ejemplo, puede pasar que:

- una cuenta común invoque una acción reservada a soporte
- un rol de bajo privilegio ejecute funciones administrativas
- una identidad autenticada alcance operaciones de alto impacto
- una API permita acciones internas aunque la interfaz no las muestre

Por eso BFLA es una de las fallas más críticas en seguridad de APIs.

---

## Qué significa “function level authorization”

La **autorización a nivel de función** responde una pregunta como esta:

> ¿esta identidad puede ejecutar esta acción o función del sistema?

A diferencia de la autorización a nivel de objeto, que pregunta si la persona puede tocar un recurso concreto, acá el foco está en la **capacidad funcional**.

Por ejemplo:

- crear usuarios
- bloquear cuentas
- moderar contenido
- cambiar configuraciones
- aprobar operaciones
- usar herramientas de soporte
- ejecutar acciones administrativas
- acceder a vistas internas
- disparar procesos sensibles

La idea importante es esta:

> no toda identidad autenticada debería poder llamar cualquier función que exista en la API.

---

## Qué es Broken Function Level Authorization

**Broken Function Level Authorization (BFLA)** ocurre cuando la API no valida correctamente si la identidad solicitante tiene permiso para ejecutar una función determinada.

Dicho de forma simple:

- la función existe de verdad
- el endpoint responde
- la acción es parte legítima del sistema
- pero la verificación de autoridad es insuficiente o inconsistente
- entonces una identidad sin el privilegio adecuado puede ejecutarla igual

La clave conceptual es esta:

> el problema no está necesariamente en el recurso puntual, sino en que una función entera queda disponible para el rol incorrecto.

---

## Qué diferencia hay entre BFLA y BOLA

Estos dos conceptos están muy relacionados, pero no son lo mismo.

### BOLA
Pregunta:

> ¿esta identidad puede operar sobre este objeto específico?

Ejemplo conceptual:
- un usuario consulta el pedido de otra persona

### BFLA
Pregunta:

> ¿esta identidad puede ejecutar esta función del sistema?

Ejemplo conceptual:
- un usuario común accede a una función reservada a administración

Podría resumirse así:

- **BOLA** se centra en el objeto concreto
- **BFLA** se centra en la acción o capacidad funcional

Ambos son fallas de autorización, pero actúan en planos distintos.

---

## Por qué esta falla es tan grave

BFLA es especialmente grave porque las funciones de una API pueden concentrar mucho poder.

Si una identidad de bajo privilegio puede ejecutar funciones reservadas, el impacto puede incluir:

- acceso a herramientas internas
- uso de acciones administrativas
- modificación de usuarios
- cambio de configuraciones
- aprobación o rechazo de operaciones críticas
- alteración de estados de negocio
- impacto sobre muchos recursos a la vez
- escalada vertical de privilegios

En otras palabras:

> una sola función mal protegida puede ampliar muchísimo el alcance real de una cuenta aparentemente limitada.

---

## Por qué ocurre con tanta frecuencia en APIs

Esta falla aparece mucho en APIs por varias razones.

### Las funciones están expuestas de forma directa

Las APIs suelen ofrecer endpoints claros y accionables para operaciones concretas.

### El frontend puede ocultar una acción, pero la API igual la expone

Entonces el equipo cree que la función está “reservada”, aunque en realidad el backend no la protege bien.

### Los roles se modelan de forma ambigua

A veces el sistema sabe que existen admin, soporte, moderador y usuario, pero no valida de forma consistente qué puede hacer cada uno.

### Hay rutas internas, auxiliares o heredadas

Paneles, herramientas de soporte o flujos secundarios suelen recibir menos revisión que el camino principal.

### El sistema confunde autenticación con autoridad

Se asume que “si está logueado, ya puede llamar esta función”, cuando en realidad la función requería un privilegio mucho más alto.

---

## Qué busca lograr un atacante con BFLA

El atacante puede intentar:

- ejecutar acciones que no le corresponden
- alcanzar herramientas de gestión
- modificar configuraciones o estados sensibles
- operar sobre otras cuentas
- ampliar su nivel de autoridad sin cambiar formalmente de rol
- usar funciones administrativas para facilitar ataques posteriores
- aprovechar que la API permite más de lo que la interfaz deja ver

La idea importante es esta:

> el atacante quiere convertir una cuenta de bajo privilegio en una palanca funcional mucho más poderosa.

---

## Qué tipos de funciones suelen ser más delicadas

Hay ciertas categorías de funciones que suelen ser especialmente críticas.

### Gestión de usuarios
- crear cuentas
- modificar roles
- bloquear o desbloquear usuarios
- restablecer accesos
- cambiar métodos de autenticación

### Configuración del sistema
- cambiar parámetros
- activar o desactivar funciones
- modificar integraciones
- tocar controles de seguridad

### Moderación y soporte
- aprobar o rechazar contenido
- consultar información ampliada
- intervenir cuentas o recursos de terceros
- usar vistas internas

### Acciones masivas o sensibles
- borrar múltiples recursos
- recalcular estados
- reprocesar operaciones
- lanzar tareas administrativas

### Herramientas internas
- paneles de mantenimiento
- utilidades de diagnóstico
- endpoints auxiliares
- funciones pensadas para operadores o personal interno

Mientras más poder tenga la función, más grave puede ser la falla.

---

## Ejemplo conceptual simple

Imaginá una API con roles:

- usuario
- moderador
- administrador

Y supongamos que existe una función legítima para gestionar cuentas o contenido.

Hasta ahí, todo es normal.

Ahora imaginá que:

- el endpoint existe
- la persona está autenticada
- la función responde
- pero el backend no valida correctamente que el rol sea el adecuado

Entonces una cuenta común podría invocar una operación que solo debía estar disponible para moderación o administración.

Eso es Broken Function Level Authorization:

> la identidad no tenía autoridad suficiente para esa función, pero la API igual la dejó pasar.

---

## Por qué no alcanza con ocultar la función en la interfaz

Este es uno de los errores más comunes.

A veces el equipo piensa:

- “el botón no aparece para usuarios comunes”
- “esa pantalla solo la ve administración”
- “la app móvil no expone esa opción”

Pero eso no resuelve el problema si la API:

- sigue publicando el endpoint
- procesa la acción
- y no valida correctamente el nivel de privilegio

La seguridad real no puede depender de la visibilidad en la UI.  
Tiene que depender de controles en el backend.

---

## Qué relación tiene con la escalada vertical

BFLA está profundamente relacionado con la **escalada vertical de privilegios**.

De hecho, muchas escaladas verticales en APIs ocurren justamente porque una identidad de bajo nivel puede ejecutar funciones de un nivel superior.

Por eso BFLA puede verse como una manifestación práctica de ese problema:

- no hace falta cambiar el rol declarado
- alcanza con poder usar funciones reservadas
- el poder real de la cuenta sube aunque la etiqueta visible no cambie

La seguridad no depende solo del nombre del rol, sino del conjunto de funciones que realmente puede ejecutar.

---

## Qué señales pueden sugerir esta falla

Algunas situaciones deberían hacer sospechar.

### Ejemplos conceptuales

- endpoints de alto impacto accesibles a cuentas de bajo privilegio
- diferencias entre lo que el frontend permite y lo que la API acepta
- funciones administrativas invocables con tokens de usuarios comunes
- auditorías donde acciones sensibles aparecen ejecutadas por identidades incorrectas
- rutas internas o auxiliares con menos validación que la UI principal
- operaciones exitosas que no encajan con el rol esperado del actor

Muchas veces el problema aparece no como un error técnico visible, sino como una acción demasiado poderosa ejecutada por la cuenta equivocada.

---

## Qué impacto puede tener

El impacto puede ser muy alto.

### Sobre privilegios

Permite a una cuenta limitada ejecutar acciones de mayor autoridad.

### Sobre confidencialidad

Puede dar acceso a información reservada para soporte, moderación o administración.

### Sobre integridad

Puede permitir cambios críticos en usuarios, configuraciones o procesos.

### Sobre operación

Puede afectar reglas de negocio, herramientas internas, aprobaciones o mantenimiento.

### Sobre seguridad general

Puede servir como puerta de entrada a persistencia, encubrimiento, abuso masivo o expansión del incidente.

En muchos sistemas, una sola función administrativa mal protegida puede tener más valor ofensivo que varios objetos expuestos aisladamente.

---

## Por qué esta falla puede pasar desapercibida

Pasa desapercibida porque el caso feliz suele funcionar bien:

- admin usa sus funciones
- soporte usa las suyas
- usuarios comunes ven solo su interfaz

Entonces nadie nota que la API detrás:

- expone la función
- acepta la llamada
- y no valida bien el privilegio

Además, en pruebas funcionales normales suele probarse:

- si la función funciona para quien debería usarla

pero no siempre se prueba con suficiente rigor:

- qué pasa si la invoca quien no debería.

---

## Qué puede hacer una organización para prevenir BFLA

Desde una mirada defensiva, algunas ideas clave son:

- validar en backend el privilegio necesario para cada función sensible
- no confiar en que ocultar opciones en la interfaz alcanza
- modelar claramente qué acciones corresponden a cada rol
- revisar endpoints administrativos, internos y auxiliares con especial cuidado
- aplicar mínimo privilegio no solo a objetos, sino también a capacidades funcionales
- testear explícitamente funciones críticas con roles inferiores
- auditar acciones de alto impacto y verificar qué identidades las están ejecutando
- mantener consistencia entre web, móvil, paneles y herramientas internas

La idea central es que la autorización funcional debe ser explícita, estricta y coherente en toda la API.

---

## Error común: pensar que si el rol existe, entonces la función ya está protegida

No.

Definir roles en teoría no garantiza que la función esté realmente protegida en la práctica.

Lo que importa es:

- dónde se valida
- cómo se valida
- si todas las rutas equivalentes aplican la misma regla
- si la API respeta de verdad el modelo de autoridad

Una función puede estar “pensada para admins” y aun así seguir expuesta si el backend no lo impone.

---

## Error común: creer que BFLA solo afecta endpoints “obviamente administrativos”

No necesariamente.

También puede aparecer en funciones menos obvias pero igual sensibles, como:

- acciones de workflow
- endpoints de soporte
- operaciones internas
- validaciones auxiliares
- cambios de estado con impacto de negocio
- herramientas de moderación
- funciones técnicas heredadas

Por eso conviene clasificar funciones por su impacto real, no solo por su apariencia.

---

## Idea clave del tema

Broken Function Level Authorization (BFLA) ocurre cuando una API no valida correctamente si la identidad solicitante tiene autoridad suficiente para ejecutar una función o acción determinada.

Este tema enseña que:

- no alcanza con autenticar bien
- no alcanza con ocultar funciones en la interfaz
- la API debe validar de forma estricta qué capacidades funcionales corresponden a cada rol
- una sola función mal protegida puede convertirse en una escalada vertical de alto impacto

---

## Resumen

En este tema vimos que:

- BFLA es una falla de autorización a nivel de función
- se diferencia de BOLA porque el foco está en la acción, no en el objeto concreto
- es muy frecuente en APIs porque las funciones se exponen de forma directa y programable
- puede permitir que cuentas de bajo privilegio ejecuten operaciones administrativas o sensibles
- la UI no protege una función si el backend no valida correctamente
- la defensa requiere autorización explícita y consistente para cada capacidad funcional crítica

---

## Ejercicio de reflexión

Pensá en una API que expone:

- gestión de usuarios
- funciones de soporte
- moderación
- cambios de configuración
- acciones de workflow
- panel administrativo y app móvil
- distintos roles internos y externos

Intentá responder:

1. ¿qué funciones deberían exigir validación de privilegio especialmente estricta?
2. ¿qué diferencia hay entre proteger objetos y proteger funciones?
3. ¿por qué una función oculta en la UI puede seguir siendo peligrosa?
4. ¿qué endpoints revisarías primero para buscar BFLA?
5. ¿qué evidencias buscarías en auditoría para detectar abuso de funciones reservadas?

---

## Autoevaluación rápida

### 1. ¿Qué es BFLA?

Es una falla donde la API no valida correctamente si una identidad tiene autoridad suficiente para ejecutar una función o acción determinada.

### 2. ¿En qué se diferencia de BOLA?

BOLA se centra en si podés acceder a un objeto concreto; BFLA se centra en si podés ejecutar una función o capacidad del sistema.

### 3. ¿Por qué puede ser tan grave?

Porque una sola función reservada mal protegida puede dar a una cuenta limitada acceso a capacidades administrativas o de alto impacto.

### 4. ¿Qué defensa ayuda mucho a prevenirla?

Validar en backend, de forma explícita y consistente, qué funciones puede ejecutar cada rol o identidad, sin confiar en la interfaz visual.

---

## Próximo tema

En el siguiente tema vamos a estudiar el **abuso de lógica de negocio en APIs**, un problema muy frecuente donde el atacante no rompe necesariamente autenticación ni autorización clásica, sino que encadena llamadas, estados o reglas funcionales de una forma que el diseño no anticipó.
