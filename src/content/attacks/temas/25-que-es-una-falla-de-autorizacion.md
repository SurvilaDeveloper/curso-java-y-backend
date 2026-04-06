---
title: "Qué es una falla de autorización"
description: "Qué significa una falla de autorización, en qué se diferencia de un problema de autenticación y por qué puede permitir acceso indebido incluso a usuarios ya autenticados."
order: 25
module: "Ataques contra autorización y control de acceso"
level: "intro"
draft: false
---

# Qué es una falla de autorización

Hasta ahora vimos muchos ataques centrados en un problema clave:  
**cómo obtener acceso a una cuenta o a un sistema**.

Eso nos llevó a estudiar temas como:

- fuerza bruta
- credential stuffing
- password spraying
- bypass de autenticación
- mecanismos MFA
- sesiones y tokens inseguros

Pero una vez que alguien ya está dentro, aparece otra pregunta igual de importante:

> ¿a qué debería poder acceder realmente esa persona?

Ahí entra en juego la **autorización**.

Y cuando esa parte falla, el sistema puede permitir que alguien haga cosas que no le corresponden, aunque ya esté autenticado de manera legítima.

A eso lo llamamos, en términos generales, **falla de autorización**.

Este tema es especialmente importante porque muchas veces el problema no está en “entrar”, sino en que, una vez adentro, el sistema no controla bien **qué puede hacer cada identidad**.

---

## Qué es la autorización

La **autorización** es la parte del sistema que decide qué acciones, recursos o funciones están permitidos para una identidad determinada.

En términos simples:

- la **autenticación** responde quién sos
- la **autorización** responde qué podés hacer

Por ejemplo, un sistema puede saber correctamente que una persona es un usuario válido, pero aun así debería seguir decidiendo:

- qué datos puede ver
- qué recursos puede modificar
- qué funciones puede ejecutar
- qué zonas del sistema puede usar
- qué acciones están permitidas según su rol, contexto o relación con el recurso

La autorización existe justamente para limitar el alcance del acceso.

---

## Qué es una falla de autorización

Una **falla de autorización** ocurre cuando el sistema permite a una identidad realizar una acción o acceder a un recurso que no debería tener permitido.

Eso puede pasar aunque:

- la persona esté correctamente autenticada
- la sesión sea válida
- el login haya sido legítimo
- el sistema haya identificado bien al usuario

La clave del problema no está en “quién es”, sino en que el sistema se equivoca al responder:

> “¿qué debería poder hacer esta persona?”

Dicho de otra forma:

> la autenticación puede estar bien y, aun así, la seguridad fallar porque la autorización está mal resuelta.

---

## Por qué este tema es tan importante

Muchas aplicaciones modernas tienen usuarios que ya están autenticados casi todo el tiempo.

Entonces, en la práctica, una gran parte de la seguridad real depende no de si el usuario “puede entrar”, sino de si el sistema controla correctamente lo que puede hacer después.

Por eso una falla de autorización puede ser muy grave, porque puede permitir:

- ver datos ajenos
- modificar recursos de otras personas
- usar funciones administrativas sin ser administrador
- actuar fuera de los límites del propio rol
- alcanzar recursos internos o sensibles
- abusar de relaciones lógicas mal controladas

Y todo eso puede ocurrir sin necesidad de romper el login.

---

## Diferencia entre autenticación y autorización

Esta distinción es fundamental y conviene fijarla muy bien.

### Autenticación
Es el proceso que valida la identidad.

Pregunta:

> ¿quién es esta persona o entidad?

### Autorización
Es el proceso que decide qué puede hacer esa identidad.

Pregunta:

> ¿qué le está permitido hacer acá?

### Ejemplo simple

Una persona entra correctamente con su usuario y contraseña.

Eso resuelve autenticación.

Pero si después puede ver los pedidos, archivos o datos privados de otros usuarios sin que eso corresponda, entonces el problema está en autorización.

---

## Por qué muchas fallas de autorización pasan desapercibidas

A diferencia de otros problemas más visibles, una falla de autorización puede ser difícil de detectar por varias razones.

### El acceso parece legítimo

La persona ya estaba autenticada, así que desde afuera puede parecer “un usuario normal usando el sistema”.

### No siempre genera errores evidentes

Muchas veces el sistema responde exitosamente, porque justamente cree que la acción está permitida.

### Puede confundirse con lógica funcional

Si los controles están mal distribuidos entre frontend, backend, roles o estados, el problema puede esconderse dentro del flujo normal.

### Puede afectar relaciones entre recursos

No siempre se trata de un “panel admin abierto”.  
A veces el fallo está en cosas más sutiles, como qué recurso pertenece a quién y cómo se comprueba eso.

---

## Qué formas puede tomar una falla de autorización

Hay muchas variantes posibles, pero a nivel general una falla de autorización puede expresarse como:

- acceso a recursos de otro usuario
- ejecución de acciones reservadas a otro rol
- lectura de información fuera del alcance permitido
- modificación no autorizada de datos
- uso indebido de funciones administrativas
- abuso de flujos donde el sistema no valida correctamente propiedad o permisos
- acceso lateral entre recursos del mismo nivel
- acceso vertical hacia funciones de más privilegio

En los próximos temas vas a ver varias de estas formas con más detalle.

---

## Qué busca lograr un atacante con este tipo de falla

El atacante puede buscar cosas distintas según el contexto.

### Leer información que no le corresponde

Por ejemplo:

- datos personales
- historiales
- archivos
- registros
- contenido privado
- información interna

### Modificar recursos ajenos

Por ejemplo:

- cambiar datos
- borrar contenido
- alterar configuraciones
- manipular operaciones
- actualizar estados que no debería tocar

### Alcanzar funciones más poderosas

Por ejemplo:

- herramientas administrativas
- paneles internos
- funciones de soporte
- acciones reservadas a privilegios superiores

### Expandir el impacto sin romper la autenticación

Una vez que tiene una cuenta válida, el atacante puede intentar llegar mucho más lejos de lo que ese rol debería permitir.

---

## Por qué puede ser más peligrosa que un problema clásico de autenticación

Esta es una idea muy importante.

A veces se piensa que el gran objetivo de un atacante es “entrar al sistema”.  
Pero en muchas aplicaciones es relativamente fácil conseguir una cuenta legítima:

- registrándose
- comprometiendo una cuenta común
- reutilizando accesos
- usando una identidad con pocos privilegios

Entonces, si la autorización está mal diseñada, el atacante ya no necesita convertirse en otro usuario desde el inicio.  
Le alcanza con ser **cualquier usuario válido** y luego aprovechar que el sistema no controla bien los límites.

Por eso una falla de autorización puede convertir una cuenta común en un punto de entrada de mucho más valor del esperado.

---

## Relación con el control de acceso

La autorización forma parte de algo más amplio: el **control de acceso**.

Ese control incluye decisiones como:

- quién puede ver qué
- quién puede modificar qué
- qué acciones requiere cada rol
- cómo se valida la relación entre usuario y recurso
- qué funciones están disponibles según contexto
- cuándo hace falta revalidar permisos
- cómo se restringen recursos sensibles

Una falla de autorización suele ser, en el fondo, una falla en ese control de acceso.

---

## Qué errores de diseño suelen favorecer estas fallas

Sin entrar todavía en variantes específicas, hay varios errores generales que favorecen estos problemas.

### Confiar demasiado en el cliente

El sistema asume que si el frontend no muestra una opción, entonces el usuario no podrá usarla.

### No validar propiedad del recurso

El sistema procesa la acción sin comprobar correctamente si ese recurso pertenece realmente al usuario autenticado.

### Aplicar controles solo en algunas partes

Una ruta o función valida permisos, pero otra equivalente no.

### Mezclar autenticación con autorización

El sistema piensa algo como:

> “como ya está logueado, entonces puede hacer esto”.

Pero estar logueado no implica permiso universal.

### Roles mal definidos o mal aplicados

Existen permisos, pero están mal asignados, mal interpretados o demasiado amplios.

### Falta de consistencia entre capas

Frontend, backend, API y paneles no aplican exactamente las mismas reglas.

---

## Ejemplo conceptual simple

Imaginá una aplicación de gestión de documentos.

Dos personas tienen cuenta:

- Usuario A
- Usuario B

Ambas pueden iniciar sesión correctamente.

Eso significa que la autenticación funciona.

Ahora imaginá que Usuario A, ya autenticado, puede acceder a un documento de Usuario B cambiando un identificador o recorriendo un flujo que el sistema no valida correctamente.

Ahí el problema no es “entrar”.  
El problema es que el sistema no controla bien **a qué recurso puede acceder cada usuario una vez dentro**.

Ese es el corazón de una falla de autorización.

---

## Qué señales pueden sugerir este tipo de problema

Detectar fallas de autorización no siempre es sencillo, pero algunas situaciones deberían hacerte sospechar.

### Ejemplos conceptuales

- un usuario accede a recursos que no están vinculados a su cuenta
- acciones sobre objetos ajenos resultan exitosas
- un rol común puede ejecutar funciones esperadas solo para otro rol
- el backend responde correctamente donde debería rechazar
- ciertas rutas o acciones dependen demasiado de lo que muestra el frontend
- cambios de identificadores o contexto producen acceso indebido
- recursos privados son visibles desde una cuenta equivocada

Lo difícil es que, desde el punto de vista del sistema, estas operaciones pueden parecer solicitudes normales si no hay buenas validaciones.

---

## Qué impacto puede tener una falla de autorización

El impacto depende mucho del tipo de recurso y del alcance del fallo.

### Impacto sobre confidencialidad

Puede exponer datos privados, documentos, historiales, información interna o detalles de otros usuarios.

### Impacto sobre integridad

Puede permitir modificar, borrar o manipular recursos ajenos.

### Impacto sobre privilegios

Puede abrir la puerta a funciones administrativas o a acciones reservadas a roles superiores.

### Impacto operativo

Puede afectar procesos internos, aprobaciones, estados de negocio, flujos críticos o configuraciones importantes.

### Impacto reputacional y legal

Si la falla expone o altera datos de terceros, el daño puede salir del plano técnico y volverse mucho más amplio.

---

## Por qué los tests superficiales muchas veces no la encuentran

Muchas fallas de autorización no se descubren mirando solo si el sistema “anda”.

Una aplicación puede verse perfectamente funcional en el uso normal y aun así tener problemas graves.

¿Por qué?

Porque el error aparece cuando alguien hace preguntas más incómodas, como:

- ¿este recurso realmente le pertenece a quien lo está pidiendo?
- ¿este rol debería poder ejecutar esta acción?
- ¿esta ruta aplica el mismo control que otra equivalente?
- ¿qué pasa si cambio el contexto, el identificador o el orden del flujo?
- ¿el backend valida o solo confía en el frontend?

Este tipo de análisis exige pensar más allá del caso feliz.

---

## Qué puede hacer una organización para reducir este riesgo

Desde una mirada defensiva, algunas ideas clave son:

- validar permisos en el backend y no solo en la interfaz
- comprobar siempre la relación entre usuario, recurso y acción
- definir roles y permisos con más precisión
- aplicar el principio de mínimo privilegio
- revisar flujos alternativos y no solo el uso principal
- mantener consistencia entre API, frontend y paneles
- testear explícitamente casos de acceso indebido
- tratar la autorización como una decisión central de diseño, no como un detalle accesorio

La idea importante es esta:

> la autorización debe ser explícita, consistente y verificable, no implícita ni asumida.

---

## Error común: pensar que si una opción no aparece en pantalla ya está protegida

No.

Ocultar una opción en el frontend no equivale a impedir la acción.

Si el backend no valida correctamente, una persona puede seguir intentando esa operación por otros caminos.

La seguridad real no puede depender de “lo que la interfaz deja ver”.

---

## Error común: creer que un usuario autenticado ya es “de confianza”

No necesariamente.

Autenticado no significa autorizado para todo.

Una gran parte de la seguridad real consiste justamente en limitar qué puede hacer cada identidad después de entrar.

Si el sistema confunde “estar logueado” con “poder hacer casi cualquier cosa”, la superficie de riesgo crece mucho.

---

## Idea clave del tema

Una falla de autorización ocurre cuando el sistema permite a una identidad acceder a recursos o ejecutar acciones que no le corresponden, aunque ya esté correctamente autenticada.

Este tema enseña que:

- autenticación y autorización no son lo mismo
- una cuenta válida no debería implicar acceso amplio
- muchas fallas graves aparecen después del login
- el control de acceso debe comprobar no solo quién es el usuario, sino también qué está intentando hacer y sobre qué recurso

---

## Resumen

En este tema vimos que:

- la autenticación valida identidad y la autorización define permisos
- una falla de autorización permite acceso o acciones indebidas aun con sesión válida
- estos problemas pueden afectar lectura, modificación o privilegios
- muchas veces pasan desapercibidos porque el usuario ya estaba logueado
- una buena defensa requiere validar propiedad, rol, contexto y acción en cada caso
- el backend debe ser la fuente real de decisión, no la interfaz

---

## Ejercicio de reflexión

Pensá en una aplicación con:

- cuentas de usuario comunes
- documentos o recursos privados
- panel de administración
- API para consultar y modificar objetos
- distintos roles con permisos diferentes

Intentá responder:

1. ¿qué diferencia habría entre “saber quién es el usuario” y “saber qué puede hacer”?
2. ¿qué recursos deberían comprobar propiedad o relación con el usuario?
3. ¿qué acciones requerirían validaciones por rol?
4. ¿qué riesgos aparecerían si solo el frontend ocultara opciones?
5. ¿qué casos de acceso indebido probarías primero?

---

## Autoevaluación rápida

### 1. ¿Qué es una falla de autorización?

Es un error por el que el sistema permite a una identidad acceder a recursos o ejecutar acciones que no debería tener permitidos.

### 2. ¿En qué se diferencia de un problema de autenticación?

La autenticación valida quién es la persona; la autorización decide qué puede hacer esa persona.

### 3. ¿Puede haber una falla de autorización aunque el login funcione perfectamente?

Sí. De hecho, muchas de estas fallas ocurren justamente después de un login correcto.

### 4. ¿Qué defensa ayuda mucho a reducir este riesgo?

Validar permisos, propiedad y contexto en el backend de forma consistente, aplicando mínimo privilegio y pruebas explícitas de acceso indebido.

---

## Próximo tema

En el siguiente tema vamos a estudiar la **escalada horizontal de privilegios**, una de las formas más comunes y peligrosas de falla de autorización, donde un usuario logra acceder a recursos de otro usuario del mismo nivel sin necesidad de volverse administrador.
