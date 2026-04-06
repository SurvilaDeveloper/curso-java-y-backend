---
title: "Broken Access Control"
description: "Qué significa Broken Access Control, por qué es una categoría tan crítica en seguridad y cómo distintas fallas de autorización pueden formar parte del mismo problema de control de acceso mal resuelto."
order: 29
module: "Ataques contra autorización y control de acceso"
level: "intro"
draft: false
---

# Broken Access Control

En los temas anteriores vimos distintas fallas de autorización, como:

- escalada horizontal de privilegios
- escalada vertical de privilegios
- IDOR y acceso inseguro a recursos

Ahora vamos a estudiar una categoría más amplia y muy importante: **Broken Access Control**.

Este concepto puede traducirse de forma general como **control de acceso roto** o **control de acceso mal implementado**.

La idea central es esta:

> el sistema no aplica correctamente las reglas que deberían definir qué identidad puede acceder a qué recurso, función o acción.

Esto puede tomar muchas formas distintas, pero todas comparten un mismo problema de fondo:

- la autorización no está bien resuelta
- los límites entre identidades, recursos y permisos son inconsistentes
- el sistema concede acceso donde debería rechazarlo

Por eso Broken Access Control no es una sola falla puntual, sino una familia de fallas que afectan el corazón del modelo de seguridad de una aplicación.

---

## Qué entendemos por control de acceso

El **control de acceso** es el conjunto de reglas, decisiones y mecanismos que determinan quién puede hacer qué dentro de un sistema.

Eso incluye preguntas como:

- ¿quién puede ver este recurso?
- ¿quién puede modificarlo?
- ¿quién puede borrar este objeto?
- ¿quién puede usar esta función?
- ¿quién puede entrar a este panel?
- ¿quién puede actuar sobre datos de otros usuarios?
- ¿cuándo debe permitirse una operación y cuándo debe rechazarse?

En otras palabras, el control de acceso define los límites reales del sistema.

No alcanza con saber que una persona está autenticada.  
Hace falta decidir, de forma correcta y consistente, qué le corresponde hacer.

---

## Qué significa que esté “roto”

Cuando hablamos de **Broken Access Control**, no necesariamente hablamos de una sola falla enorme y evidente.

Muchas veces se trata de una combinación de problemas como:

- reglas mal definidas
- validaciones ausentes
- controles inconsistentes entre rutas o capas
- permisos demasiado amplios
- supuestos inseguros sobre identidades autenticadas
- falta de verificación de propiedad o contexto
- diferencias entre lo que la interfaz muestra y lo que el backend realmente permite

La idea importante es esta:

> el control de acceso está roto cuando la aplicación deja de imponer límites confiables sobre identidades, recursos y acciones.

Eso puede ocurrir por diseño, por implementación, por evolución desordenada del sistema o por una mezcla de todo eso.

---

## Por qué esta categoría es tan crítica

Broken Access Control es especialmente crítica porque afecta directamente la pregunta más importante de la seguridad funcional:

> ¿qué debería poder hacer realmente cada identidad?

Si esa pregunta se responde mal, el impacto puede extenderse a muchas áreas:

- datos privados expuestos
- recursos ajenos modificados
- funciones administrativas alcanzadas por usuarios comunes
- paneles internos visibles
- operaciones sensibles ejecutadas por quien no corresponde
- acciones de negocio alteradas
- abuso de lógica funcional
- expansión del incidente a escala mayor

Además, muchas de estas fallas pueden ser explotadas con muy poco ruido, precisamente porque el atacante ya está autenticado o parece operar dentro del comportamiento normal del sistema.

---

## Qué tipos de problemas puede incluir

Broken Access Control no se limita a un solo patrón.  
Puede abarcar muchos tipos de fallas que ya vimos o vamos a seguir viendo.

### Acceso a recursos ajenos

Por ejemplo:

- ver archivos de otro usuario
- leer pedidos ajenos
- consultar datos de otra cuenta

### Modificación indebida

Por ejemplo:

- editar contenido que no corresponde
- cambiar estados de objetos ajenos
- borrar recursos de terceros

### Escalada horizontal

Por ejemplo:

- acceder a objetos de otros usuarios del mismo nivel

### Escalada vertical

Por ejemplo:

- usar funciones administrativas sin tener el rol correcto

### Exposición de funciones internas

Por ejemplo:

- paneles o acciones reservadas accesibles para perfiles no autorizados

### Reglas inconsistentes entre capas

Por ejemplo:

- el frontend oculta una opción, pero el backend igual la permite

La variedad puede ser grande, pero el hilo conductor es siempre el mismo:  
los límites de acceso están mal implementados o mal aplicados.

---

## Diferencia entre autenticación y control de acceso

Este punto sigue siendo fundamental.

### Autenticación
Responde:

> ¿quién es esta persona?

### Control de acceso
Responde:

> ¿qué puede hacer esta persona en esta parte del sistema, sobre este recurso, en este contexto?

Una aplicación puede autenticar perfectamente a un usuario y, aun así, tener un control de acceso roto.

Eso hace que Broken Access Control sea especialmente peligroso:  
no necesita necesariamente “romper el login” para causar daño.

Le alcanza con que el sistema no sepa limitar correctamente a sus propios usuarios.

---

## Por qué muchas veces aparece por acumulación

A veces una aplicación no tiene “una gran falla” única, sino muchas pequeñas inconsistencias de control de acceso.

Por ejemplo:

- una ruta no valida propiedad
- otra acción no valida rol
- una API auxiliar aplica menos controles
- una función heredada quedó abierta
- una operación de borrado protege menos que la de lectura
- un panel interno asume confianza excesiva
- un flujo alternativo omite verificaciones

Cada una puede parecer aislada.  
Pero juntas forman un patrón mucho más grave: el sistema no tiene un modelo de acceso sólido y consistente.

Por eso esta categoría suele verse mejor cuando se analiza la aplicación como un conjunto y no como endpoints aislados.

---

## Qué busca lograr un atacante en presencia de este problema

El atacante puede intentar distintos caminos según qué parte del control de acceso esté debilitada.

### Ampliar alcance sobre objetos

Ver, modificar o borrar recursos de otras personas.

### Usar funciones más poderosas

Acceder a acciones reservadas a roles superiores.

### Atravesar límites funcionales

Ejecutar operaciones pensadas para otro tipo de usuario o proceso.

### Aprovechar rutas o paneles menos protegidos

Buscar caminos alternativos donde la validación sea más laxa.

### Encadenar fallas pequeñas

Usar varias debilidades menores para construir un acceso mucho más amplio.

Este último punto es especialmente importante:

> Broken Access Control muchas veces no depende de una sola puerta abierta, sino de varias puertas mal cerradas.

---

## Qué lo vuelve tan difícil de detectar

Hay varias razones.

### El atacante puede tener sesión válida

Entonces muchas solicitudes parecen “normales” desde el punto de vista superficial.

### El sistema responde exitosamente

No aparece un error, porque justamente la aplicación cree que esa acción está permitida.

### Los casos felices funcionan bien

Si todos los usuarios hacen solo lo esperado, el problema puede no verse nunca.

### Los controles pueden ser inconsistentes

Una funcionalidad parece segura en un flujo y vulnerable en otro, lo que hace difícil detectar el patrón completo.

### Las fallas viven en la lógica, no solo en la infraestructura

No es algo que siempre se detecte con escaneos simples.  
Hace falta entender cómo deberían funcionar realmente los permisos.

---

## Ejemplo conceptual

Imaginá una aplicación con:

- usuarios comunes
- documentos privados
- panel administrativo
- API para consultar y modificar objetos
- distintos roles
- funciones internas de soporte

Ahora imaginá que:

- algunos endpoints validan bien propiedad
- otros no
- algunas acciones administrativas revisan rol
- otras equivalentes no
- ciertas rutas internas se apoyan en que “la interfaz no las muestra”
- algunos objetos se procesan si existen, sin revisar bien la relación con el usuario

Tal vez no haya una única falla gigante.  
Pero el resultado final es que el control de acceso está claramente roto.

Eso es Broken Access Control en sentido amplio:

> no un error aislado, sino un sistema que no impone bien sus propios límites.

---

## Relación con mínimo privilegio

Broken Access Control está muy relacionado con el principio de **mínimo privilegio**.

Ese principio dice que cada identidad debería tener solo los permisos necesarios para cumplir su función.

Cuando el control de acceso está roto, suele pasar lo contrario:

- los permisos efectivos superan lo que debería permitirse
- las validaciones no sostienen el límite teórico
- el sistema concede más capacidad de la necesaria
- los roles o relaciones no se verifican con suficiente precisión

Es decir, el modelo puede decir “mínimo privilegio”, pero la implementación real lo contradice.

---

## Qué impacto puede tener

El impacto depende del alcance de la falla y del tipo de recurso comprometido, pero puede ser enorme.

### Sobre confidencialidad
Exposición de información privada, sensible, interna o masiva.

### Sobre integridad
Modificación o borrado indebido de datos, configuraciones o estados de negocio.

### Sobre privilegios
Acceso a funciones administrativas, herramientas internas o acciones de alto impacto.

### Sobre operación
Manipulación de procesos, aprobaciones, flujos críticos o relaciones entre objetos.

### Sobre reputación y cumplimiento
Si afecta datos de terceros, puede derivar en incidentes mucho más amplios que un simple bug funcional.

---

## Qué puede hacer una organización para reducir este riesgo

Desde una mirada defensiva, algunas ideas clave son:

- definir claramente el modelo de roles, permisos y relaciones entre usuarios y objetos
- validar autorización en el backend para cada operación relevante
- no confiar en que ocultar opciones en el frontend alcanza
- revisar consistencia entre API, backend, paneles y flujos auxiliares
- aplicar mínimo privilegio de verdad
- probar explícitamente acceso indebido horizontal y vertical
- auditar funciones administrativas y recursos sensibles
- revisar sistemas heredados, flujos alternativos y operaciones menos frecuentes
- tratar autorización como una capa central de diseño, no como lógica dispersa agregada al final

La idea central es que la seguridad de acceso no puede quedar repartida en supuestos implícitos.

---

## Error común: pensar que cada falla es un caso aislado

A veces sí lo es, pero muchas veces no.

Cuando aparecen varias fallas relacionadas con:

- propiedad mal validada
- roles inconsistentes
- rutas auxiliares débiles
- paneles poco protegidos
- acciones sin verificación suficiente

ya no conviene pensar en “bugs sueltos”.  
Conviene reconocer que existe un problema estructural de control de acceso.

Y eso exige una revisión más amplia del modelo, no solo un parche puntual.

---

## Error común: tratar el control de acceso como detalle de implementación

No lo es.

El control de acceso define:

- límites entre identidades
- alcance real de cada rol
- protección de cada objeto
- defensa de funciones críticas
- aislamiento entre usuarios

Si eso está mal resuelto, el resto del sistema queda expuesto aunque otras capas estén razonablemente bien.

Por eso no debe verse como un detalle técnico menor, sino como una parte central de la arquitectura.

---

## Idea clave del tema

Broken Access Control es una categoría amplia que agrupa fallas donde la aplicación no impone correctamente las reglas que definen qué identidad puede acceder a qué recurso o acción.

Este tema enseña que:

- muchas fallas distintas de autorización forman parte del mismo problema de fondo
- autenticación correcta no garantiza límites correctos
- el acceso debe controlarse por rol, contexto, relación con el objeto y acción concreta
- una aplicación puede funcionar bien en apariencia y, sin embargo, tener un control de acceso estructuralmente roto

---

## Resumen

En este tema vimos que:

- Broken Access Control significa que las reglas reales de acceso están mal implementadas o mal aplicadas
- incluye problemas como escalada horizontal, vertical e IDOR
- puede aparecer por acumulación de inconsistencias pequeñas
- suele ser difícil de detectar si se analizan solo casos felices
- puede afectar confidencialidad, integridad, privilegios y operación
- la defensa requiere un modelo de autorización claro, backend estricto y revisión sistemática

---

## Ejercicio de reflexión

Pensá en una aplicación con:

- usuarios comunes
- distintos roles internos
- API
- panel de administración
- documentos privados
- herramientas auxiliares de soporte
- funciones heredadas

Intentá responder:

1. ¿qué decisiones forman parte del control de acceso en ese sistema?
2. ¿qué errores dispersos podrían indicar un problema estructural y no solo un bug aislado?
3. ¿qué recursos o acciones deberían revisarse primero?
4. ¿cómo distinguirías entre un problema puntual y un Broken Access Control más amplio?
5. ¿qué pruebas o auditorías harías para evaluar la consistencia real del modelo de acceso?

---

## Autoevaluación rápida

### 1. ¿Qué es Broken Access Control?

Es una categoría de fallas en la que la aplicación no impone correctamente las reglas que deberían definir qué identidad puede acceder a qué recurso o acción.

### 2. ¿Incluye solo una clase de problema?

No. Puede incluir escalada horizontal, vertical, IDOR y otras fallas de autorización o control de acceso.

### 3. ¿Por qué puede ser tan grave?

Porque afecta el corazón del modelo de permisos del sistema y puede exponer datos, funciones críticas y privilegios elevados.

### 4. ¿Qué defensa ayuda mucho a reducir este riesgo?

Diseñar un modelo claro de permisos, validar autorización en backend de forma consistente y revisar explícitamente casos de acceso indebido.

---

## Próximo tema

En el siguiente tema vamos a estudiar la **exposición de funciones administrativas**, una manifestación especialmente peligrosa de Broken Access Control, donde acciones o interfaces de alto privilegio quedan accesibles para identidades que no deberían poder alcanzarlas.
