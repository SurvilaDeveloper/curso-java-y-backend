---
title: "Manipulación de roles y permisos"
description: "Qué significa manipular roles y permisos, por qué esta falla puede romper el modelo de autoridad de una aplicación y cómo suele aparecer por validaciones débiles o lógica de acceso mal resuelta."
order: 31
module: "Ataques contra autorización y control de acceso"
level: "intro"
draft: false
---

# Manipulación de roles y permisos

En los temas anteriores vimos varias fallas de control de acceso, como:

- escalada horizontal de privilegios
- escalada vertical de privilegios
- IDOR y acceso inseguro a recursos
- Broken Access Control
- exposición de funciones administrativas

Ahora vamos a estudiar otra categoría muy importante: la **manipulación de roles y permisos**.

La idea general es esta:

> el atacante logra influir, alterar o aprovechar de forma indebida la lógica que define qué autoridad tiene una identidad dentro del sistema.

Eso puede permitir, por ejemplo:

- actuar como si tuviera un rol superior
- ejecutar acciones reservadas
- heredar permisos que no le corresponden
- aprovechar asignaciones demasiado amplias
- modificar relaciones de autoridad
- obtener capacidades nuevas sin una autorización legítima

Este tema es especialmente importante porque los **roles** y **permisos** suelen ser la base del modelo de acceso de una aplicación.  
Si esa base se debilita, el impacto puede extenderse a casi cualquier parte del sistema.

---

## Qué son los roles

Un **rol** es una categoría o nivel de autoridad que agrupa capacidades dentro de una aplicación.

En muchas aplicaciones, los roles sirven para simplificar decisiones de acceso.

Por ejemplo, puede haber roles como:

- visitante
- usuario
- cliente
- moderador
- soporte
- operador
- administrador

La idea es que cada rol represente un conjunto de acciones permitidas o de recursos alcanzables.

En términos simples:

> el rol ayuda a decidir qué tipo de cosas puede hacer una identidad dentro del sistema.

---

## Qué son los permisos

Un **permiso** es una autorización concreta para realizar una acción o acceder a un recurso.

Mientras que el rol suele ser una categoría más amplia, el permiso suele ser una capacidad más específica, por ejemplo:

- leer un recurso
- editar un objeto
- borrar contenido
- aprobar una operación
- acceder a un panel
- gestionar usuarios
- modificar configuraciones

A veces el sistema trabaja solo con roles.  
Otras veces combina roles con permisos más finos.

Lo importante es que, de una forma u otra, estas estructuras definen la autoridad real de cada identidad.

---

## Qué significa manipular roles y permisos

La **manipulación de roles y permisos** ocurre cuando un atacante consigue alterar, influir o abusar de la lógica que asigna o interpreta la autoridad dentro del sistema.

Eso puede pasar, por ejemplo, si logra:

- que el sistema lo trate como si tuviera otro rol
- acceder a acciones porque los permisos están mal validados
- modificar una asignación de autoridad
- aprovechar permisos excesivos ya concedidos
- beneficiarse de una lógica que interpreta mal el alcance de un rol
- usar una ruta o flujo donde la verificación de permisos es más débil

La idea clave es esta:

> el atacante no siempre “rompe” el rol de frente; a veces basta con que el sistema interprete mal qué autoridad debería tener realmente.

---

## Por qué este problema es tan importante

Roles y permisos son una de las bases del control de acceso.

Si esa base se rompe, el sistema puede perder capacidad para responder correctamente preguntas como estas:

- ¿esta persona debería poder hacer esto?
- ¿este rol tiene autoridad sobre esta operación?
- ¿este permiso alcanza solo para leer o también para modificar?
- ¿este usuario debería llegar a esta herramienta?
- ¿esta identidad puede actuar sobre otras cuentas?

Cuando esos límites se vuelven ambiguos, demasiado flexibles o mal aplicados, el impacto puede extenderse rápidamente.

Por eso, una falla en roles y permisos no suele ser “solo un bug”.  
Muchas veces compromete el modelo central de autoridad de la aplicación.

---

## Qué busca lograr un atacante con esta manipulación

El objetivo puede variar según el sistema.

### Obtener más autoridad

Por ejemplo, actuar como si tuviera un rol superior o permisos más amplios.

### Acceder a funciones reservadas

Usar paneles, acciones o herramientas que deberían requerir otro nivel de privilegio.

### Cambiar el alcance del acceso

Pasar de un conjunto limitado de operaciones a uno mucho más poderoso.

### Alterar la estructura de control

Modificar roles, asignaciones o permisos para sostener acceso o ampliar el incidente.

### Aprovechar permisos excesivos ya presentes

A veces no hace falta cambiar nada: basta con detectar que el sistema ya otorga demasiado.

---

## Diferencia entre rol y permiso mal aplicado

Esta diferencia conviene tenerla clara.

### Problema de rol
El sistema asigna, interpreta o valida mal una categoría general de autoridad.

Ejemplo conceptual:
- un usuario común es tratado como si fuera moderador o administrador

### Problema de permiso
El sistema permite una capacidad concreta que no debería estar habilitada para esa identidad.

Ejemplo conceptual:
- un usuario no admin puede ejecutar una acción de gestión específica

En la práctica, ambas cosas suelen mezclarse.  
A veces el fallo está en el rol completo.  
Otras veces en una acción puntual mal protegida.

---

## Cómo puede aparecer esta falla

Sin entrar en procedimientos ofensivos, esta clase de problema suele aparecer por errores como estos.

### Roles demasiado amplios

Un rol tiene más poder del necesario y expone acciones que no todos sus integrantes deberían poder usar.

### Validaciones débiles o inconsistentes

La aplicación revisa correctamente algunos permisos, pero no todos.

### Confianza excesiva en datos que no deberían decidir autoridad

El sistema toma decisiones de acceso basándose en información insuficiente o fácilmente manipulable.

### Flujos alternativos con menos controles

Una acción está protegida en un panel, pero no en una API auxiliar o en una ruta secundaria.

### Asignaciones cambiables sin suficiente protección

El sistema permite modificar o influir sobre la autoridad sin controles fuertes.

### Confusión entre categorías

Por ejemplo, mezclar “usuario autenticado” con “usuario autorizado a administrar”, o dar por equivalente una capacidad local con una global.

---

## Por qué puede ser más grave que un problema puntual de acceso

A veces una falla de acceso afecta solo una acción concreta.

Pero cuando el problema toca roles o permisos, la consecuencia puede ser más amplia porque impacta el **modelo de autoridad** del sistema.

Eso puede producir efectos como:

- acceso a múltiples funciones reservadas
- uso indebido de herramientas internas
- cambios sobre otros usuarios
- ampliación del alcance sobre muchos recursos
- persistencia a través de permisos mal asignados
- nuevas rutas para otros ataques posteriores

Es decir:

> si se rompe la lógica que decide “quién puede qué”, el daño puede expandirse mucho más allá de una sola pantalla o endpoint.

---

## Relación con la escalada vertical

Este tema se conecta directamente con la **escalada vertical de privilegios**.

De hecho, muchas escaladas verticales ocurren justamente porque el atacante logra:

- que el sistema le reconozca un rol superior
- o que ejecute permisos reservados a un nivel más alto

Por eso, la manipulación de roles y permisos suele ser una de las formas más claras en que una cuenta limitada termina adquiriendo autoridad superior.

---

## Relación con mínimo privilegio

El principio de **mínimo privilegio** dice que cada identidad debería tener solo lo necesario para cumplir su función.

La manipulación de roles y permisos suele aparecer cuando ese principio falla, por ejemplo porque:

- un rol agrupa demasiado poder
- una identidad recibe más permisos de los necesarios
- los permisos no están bien segmentados
- no se diferencia bien entre lectura, modificación y administración
- el sistema mantiene privilegios heredados que ya no corresponden

Esto vuelve muy importante no solo la validación técnica, sino también el diseño del modelo de autoridad.

---

## Ejemplo conceptual simple

Imaginá una aplicación donde existe el rol “usuario” y el rol “administrador”.

Además, ciertas acciones permiten:

- gestionar cuentas
- moderar contenido
- ver reportes internos
- cambiar configuraciones

Ahora imaginá que, por un error en la lógica del sistema, una cuenta común puede terminar ejecutando alguna de esas funciones porque el permiso no se valida bien o porque la asignación de rol se interpreta de forma inconsistente.

Ese sería un caso de manipulación de roles o permisos:

- el usuario no debería tener esa autoridad
- pero el sistema igual se la concede o la reconoce indebidamente

---

## También puede ocurrir sin cambiar formalmente el rol

Este punto es importante.

No siempre el problema implica que el sistema muestre explícitamente un rol distinto.

A veces la identidad sigue figurando como “usuario común”, pero en la práctica puede ejecutar acciones reservadas.

Eso significa que:

- el rol visible no cambió
- pero los permisos efectivos sí

Y desde el punto de vista de seguridad, lo que importa es el **poder real** que el sistema concede, no solo la etiqueta que muestra.

---

## Qué señales pueden sugerir este problema

Algunas situaciones deberían llamar la atención.

### Ejemplos conceptuales

- usuarios comunes ejecutan acciones reservadas
- aparecen cambios de alto privilegio hechos por cuentas que no deberían poder hacerlos
- ciertas funciones responden correctamente a identidades con rol insuficiente
- los logs muestran operaciones administrativas desde perfiles ordinarios
- una cuenta adquiere acceso a herramientas o vistas que no encajan con su categoría
- el sistema trata de forma distinta la misma acción según la ruta desde la que se invoque

A veces la señal no es que “algo falló”, sino que **algo funcionó demasiado bien para quien lo ejecutó**.

---

## Qué impacto puede tener

El impacto depende de qué tan poderosa sea la autoridad alcanzada o abusada.

### Sobre privilegios
Puede ampliar muchísimo el alcance de una cuenta común.

### Sobre confidencialidad
Puede abrir acceso a datos internos, masivos o sensibles.

### Sobre integridad
Puede permitir cambios en usuarios, permisos, configuraciones o contenido de otros.

### Sobre operación
Puede afectar moderación, soporte, administración y procesos críticos.

### Sobre seguridad general
Puede servir para sostener persistencia, encubrir acciones o abrir caminos posteriores.

En muchos sistemas, controlar roles y permisos correctamente es lo que evita que una cuenta limitada se convierta en una palanca de alto impacto.

---

## Qué puede hacer una organización para reducir este riesgo

Desde una mirada defensiva, algunas ideas importantes son:

- diseñar roles con alcance claro y no excesivo
- revisar permisos específicos y no asumir que el rol general alcanza para todo
- aplicar mínimo privilegio de forma real
- validar autorización en el backend para cada acción sensible
- evitar que el cliente decida o sugiera autoridad relevante
- revisar consistencia entre paneles, APIs, flujos alternativos y herramientas internas
- auditar cambios de rol, permisos y acciones administrativas
- probar explícitamente si identidades de bajo privilegio pueden alcanzar funciones reservadas

La idea central es que la autoridad debe ser:

- explícita
- verificable
- mínima
- coherente
- protegida en todas las capas

---

## Error común: pensar que definir roles ya resuelve el problema

No.

Tener nombres como “admin”, “moderador” o “usuario” no garantiza que la seguridad esté bien implementada.

Lo que importa es:

- qué acciones reales habilita cada uno
- cómo se valida eso en backend
- si la asignación es correcta
- si todas las rutas respetan el mismo criterio
- si existen permisos excepcionales mal controlados

Un modelo de roles mal implementado puede ser tan peligroso como no tenerlo.

---

## Error común: creer que el rol visible en pantalla refleja siempre el poder real

No necesariamente.

Una cuenta puede seguir mostrándose como “usuario”, pero tener acceso efectivo a acciones que no le corresponden.

Desde la mirada de seguridad, el dato decisivo no es la etiqueta, sino la capacidad real que el sistema concede.

Por eso conviene auditar no solo “qué rol tiene”, sino también “qué puede hacer realmente”.

---

## Idea clave del tema

La manipulación de roles y permisos ocurre cuando un atacante logra alterar, aprovechar o atravesar indebidamente la lógica que define la autoridad dentro del sistema.

Este tema enseña que:

- el modelo de acceso no depende solo de autenticar
- también depende de asignar y validar bien la autoridad
- una cuenta puede volverse mucho más peligrosa si el sistema interpreta mal sus roles o permisos
- el mínimo privilegio y la validación consistente en backend son esenciales

---

## Resumen

En este tema vimos que:

- los roles agrupan autoridad y los permisos definen capacidades concretas
- manipularlos o abusarlos puede ampliar mucho el poder efectivo de una cuenta
- el problema puede estar en la asignación, en la validación o en la interpretación de la autoridad
- muchas escaladas verticales nacen de fallas en esta lógica
- no alcanza con definir roles; hay que validarlos y aplicarlos con consistencia
- la defensa requiere diseño claro, mínimo privilegio y control riguroso de acciones sensibles

---

## Ejercicio de reflexión

Pensá en una aplicación con:

- usuarios comunes
- soporte
- moderadores
- administradores
- permisos finos para ciertas acciones
- panel interno
- API con operaciones sensibles

Intentá responder:

1. ¿qué diferencia harías entre rol general y permiso específico?
2. ¿qué acciones deberían exigir validación especialmente estricta?
3. ¿qué errores de diseño podrían hacer que una cuenta común tenga demasiado poder?
4. ¿qué eventos convendría auditar para detectar abuso de autoridad?
5. ¿cómo revisarías si el poder real de una cuenta coincide con su rol declarado?

---

## Autoevaluación rápida

### 1. ¿Qué es manipular roles y permisos?

Es influir, alterar o aprovechar indebidamente la lógica que define qué autoridad tiene una identidad dentro del sistema.

### 2. ¿Qué diferencia hay entre rol y permiso?

El rol es una categoría general de autoridad; el permiso es una capacidad concreta para realizar una acción o acceder a un recurso.

### 3. ¿Puede haber abuso aunque el rol visible no cambie?

Sí. Una cuenta puede seguir figurando como “usuario” pero tener permisos efectivos que no le corresponden.

### 4. ¿Qué defensa ayuda mucho a prevenir este problema?

Diseñar bien el modelo de autoridad, aplicar mínimo privilegio y validar en backend cada acción sensible de manera consistente.

---

## Próximo tema

En el siguiente tema vamos a estudiar los **casos reales de fallas de autorización**, para entender por qué estos problemas aparecen con tanta frecuencia en aplicaciones modernas y cómo distintos errores concretos suelen responder a un mismo patrón de control de acceso mal resuelto.
