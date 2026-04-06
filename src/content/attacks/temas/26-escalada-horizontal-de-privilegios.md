---
title: "Escalada horizontal de privilegios"
description: "Qué es la escalada horizontal de privilegios, por qué es una de las fallas de autorización más comunes y cómo permite a un usuario acceder a recursos de otros usuarios del mismo nivel."
order: 26
module: "Ataques contra autorización y control de acceso"
level: "intro"
draft: false
---

# Escalada horizontal de privilegios

En el tema anterior vimos qué es una falla de autorización y por qué puede ser muy grave incluso cuando la autenticación funciona correctamente.

Ahora vamos a estudiar una de sus formas más comunes y más importantes: la **escalada horizontal de privilegios**.

La idea general de este problema es la siguiente:

> una persona ya autenticada logra acceder a recursos o acciones que pertenecen a otra persona del mismo nivel de privilegio.

Es decir, el atacante no se convierte en administrador ni obtiene un rol más alto.  
Sigue siendo, en teoría, un usuario “normal”.  
Pero el sistema le permite cruzar lateralmente hacia datos o funciones que corresponden a **otro usuario equivalente**.

Por eso se llama **horizontal**:

- no sube de nivel
- no escala hacia arriba en la jerarquía
- se mueve al costado, entre identidades del mismo rango

---

## Qué significa “escalada de privilegios”

Antes de centrarnos en la variante horizontal, conviene aclarar el término general.

Una **escalada de privilegios** ocurre cuando alguien consigue más acceso o más capacidad de acción de la que debería tener.

Eso puede pasar de distintas maneras.

### Escalada vertical
Cuando un usuario alcanza permisos de un nivel superior, como funciones administrativas.

### Escalada horizontal
Cuando un usuario accede a recursos de otro usuario del mismo nivel.

En ambos casos hay una ampliación indebida del alcance.  
La diferencia está en **hacia dónde** se amplía ese acceso.

---

## Qué es exactamente la escalada horizontal

La escalada horizontal ocurre cuando el sistema reconoce correctamente que la persona está autenticada, pero no valida bien que solo pueda acceder a **sus propios** recursos o a los que realmente le corresponden.

En otras palabras:

- el sistema sabe que el usuario existe
- pero falla al comprobar la relación entre ese usuario y el recurso solicitado

Entonces, alguien puede terminar viendo o modificando:

- perfiles ajenos
- pedidos de otras personas
- archivos de otro usuario
- historiales privados
- mensajes de terceros
- configuraciones ajenas
- recursos ligados a otra cuenta

La identidad no cambia.  
Lo que cambia es el alcance indebido sobre recursos equivalentes.

---

## Por qué este problema es tan frecuente

Es muy frecuente porque muchas aplicaciones trabajan continuamente con objetos asociados a usuarios:

- cuentas
- perfiles
- pedidos
- comentarios
- documentos
- tickets
- historiales
- archivos
- configuraciones
- publicaciones

En todos esos casos, el sistema necesita comprobar algo muy importante:

> no solo si el usuario está logueado, sino si ese recurso realmente le pertenece o si tiene derecho legítimo a actuar sobre él.

Cuando esa comprobación está ausente, es incompleta o es inconsistente, aparece el riesgo de escalada horizontal.

---

## Por qué puede ser tan grave

A veces se subestima este problema porque el atacante sigue siendo “solo un usuario normal”.

Pero justamente ahí está el peligro.

En muchas aplicaciones, un usuario normal ya tiene acceso a mucha funcionalidad.  
Si además puede alcanzar recursos de otros usuarios del mismo nivel, el impacto puede ser enorme.

Por ejemplo, podría permitir:

- ver datos personales ajenos
- leer contenido privado
- modificar información de terceros
- alterar estados u operaciones que no le pertenecen
- borrar recursos de otros usuarios
- descargar archivos privados
- manipular relaciones entre cuentas y objetos

Eso puede afectar directamente:

- confidencialidad
- integridad
- confianza de los usuarios
- cumplimiento normativo
- reputación del sistema

---

## Qué la diferencia de la escalada vertical

La diferencia principal es esta:

### En la escalada vertical
El atacante busca ir hacia un rol superior.

Por ejemplo:

- de usuario común a administrador
- de soporte a superadmin
- de visitante a moderador

### En la escalada horizontal
El atacante no busca subir de rol, sino usar su identidad para tocar recursos de otras personas equivalentes.

Por ejemplo:

- de “mi pedido” a “el pedido de otro usuario”
- de “mi archivo” a “el archivo de otra cuenta”
- de “mi perfil” a “el perfil editable de otra persona”

No hay cambio jerárquico, pero sí hay expansión indebida del alcance.

---

## Qué suele fallar en estos casos

A nivel conceptual, este problema suele aparecer cuando el sistema comete errores como estos.

### Validar autenticación pero no propiedad

El sistema verifica que existe una sesión válida, pero no que el recurso consultado pertenezca realmente a esa persona.

### Confiar en identificadores manipulables sin revisar relación

El sistema acepta un identificador de recurso, pero no comprueba bien si el usuario autenticado tiene derecho sobre él.

### Reutilizar lógica pensada para “cualquier usuario autenticado”

Algunas rutas se diseñan bajo el supuesto de que estar logueado ya es suficiente, aunque en realidad también debería comprobarse pertenencia o alcance.

### Aplicar controles en unas acciones y en otras no

Por ejemplo, una vista sí valida propiedad, pero otra operación de lectura, actualización o borrado equivalente no lo hace correctamente.

### Confundir “mismo tipo de recurso” con “mismo derecho sobre el recurso”

Que dos usuarios sean clientes, autores o miembros del sistema no significa que puedan tocar cualquier objeto de ese tipo.

---

## Qué busca lograr un atacante con esta falla

El atacante puede tener distintos objetivos.

### Obtener información ajena

Acceder a datos privados de otro usuario.

### Modificar recursos de terceros

Cambiar contenido, configuraciones, estados o registros que no le corresponden.

### Ampliar visibilidad del sistema

Usar acceso lateral para aprender más sobre estructura, usuarios, procesos o relaciones.

### Preparar ataques posteriores

La información o el control obtenido sobre recursos ajenos puede servir para pasos siguientes.

### Generar daño o fraude

En algunos contextos, tocar recursos de otros usuarios puede tener impacto económico, reputacional u operativo.

---

## Ejemplo conceptual simple

Imaginá una aplicación donde cada persona puede ver y editar su propio perfil.

El sistema permite:

- iniciar sesión
- consultar perfil
- actualizar algunos datos

Hasta ahí parece normal.

Ahora imaginá que, al consultar o actualizar un perfil, el sistema solo verifica que haya una sesión válida, pero no comprueba correctamente si ese perfil pertenece al usuario autenticado.

Entonces, alguien podría terminar viendo o modificando el perfil de otra persona del sistema.

Eso sería un caso clásico de escalada horizontal:

- no se volvió administrador
- no cambió de rol
- pero consiguió acceder a recursos de un par del mismo nivel

---

## Por qué este problema puede pasar desapercibido

Hay varias razones por las que suele pasar desapercibido.

### El uso parece “legítimo”

La persona ya estaba autenticada, así que muchas solicitudes se ven como tráfico normal.

### No siempre hay errores

El sistema puede responder exitosamente porque justamente no está validando bien la propiedad o el alcance.

### En el caso feliz todo funciona perfecto

Si cada usuario toca sus propios recursos, nadie nota el problema.  
El error aparece cuando alguien prueba salir de ese camino esperado.

### Puede esconderse en lógica de negocio compleja

En aplicaciones con muchos objetos y relaciones, es fácil que un recurso quede protegido de forma inconsistente respecto de otro.

---

## Relación con la propiedad del recurso

La noción de **propiedad** o **vinculación legítima** es central en este tema.

No alcanza con preguntar:

- ¿el usuario está autenticado?

También hay que preguntar:

- ¿este objeto le pertenece?
- ¿está autorizado a verlo?
- ¿puede modificarlo?
- ¿esa acción es válida sobre ese recurso concreto?

En muchas aplicaciones, la seguridad real depende de responder bien estas preguntas para **cada objeto**.

---

## Qué recursos suelen verse afectados

La escalada horizontal puede aparecer sobre muchísimos tipos de recurso.

### Datos de cuenta
- perfiles
- configuraciones
- información personal
- preferencias

### Recursos operativos
- pedidos
- facturas
- solicitudes
- tickets
- suscripciones

### Contenido
- archivos
- mensajes
- publicaciones
- borradores
- documentos

### Relaciones
- listas
- grupos
- membresías
- vínculos entre usuarios y objetos

El problema no está en el tipo de recurso, sino en que el sistema no comprueba correctamente quién puede acceder a él.

---

## Qué señales pueden sugerir este problema

Detectarlo puede no ser trivial, pero algunas situaciones deberían llamar la atención.

### Ejemplos conceptuales

- un usuario accede a objetos no asociados a su cuenta
- aparecen lecturas exitosas de recursos ajenos
- una cuenta común modifica estados de objetos que no deberían pertenecerle
- ciertos endpoints responden correctamente aunque el recurso no corresponda al usuario
- hay operaciones exitosas sobre identificadores de otros usuarios
- la trazabilidad muestra inconsistencias entre actor y recurso afectado

A veces la clave no está en un error, sino en un **éxito indebido**.

---

## Qué impacto puede tener

El impacto depende del tipo de objeto y de la acción permitida.

### Sobre confidencialidad
Puede exponer datos privados de otros usuarios.

### Sobre integridad
Puede permitir alteración o eliminación de recursos ajenos.

### Sobre confianza
Puede hacer que los usuarios perciban que sus datos no están aislados correctamente.

### Sobre operación
Puede afectar procesos si los recursos comprometidos participan en flujos importantes.

### Sobre cumplimiento y reputación
Si involucra datos personales o información sensible, el daño puede salir del plano técnico y volverse legal o reputacional.

---

## Qué puede hacer una organización para reducir este riesgo

Desde una mirada defensiva, algunas ideas clave son:

- validar en el backend la relación entre usuario, acción y recurso
- no asumir que “estar logueado” alcanza
- aplicar controles de propiedad en lectura, escritura, borrado y operaciones derivadas
- revisar consistencia entre distintas rutas o endpoints sobre el mismo recurso
- testear explícitamente casos donde un usuario intenta acceder a objetos de otro
- aplicar principio de mínimo privilegio también a nivel de objeto
- auditar operaciones exitosas sobre recursos sensibles
- diseñar modelos de acceso claros y verificables

La idea central es que la autorización debe bajar hasta el nivel del recurso concreto, no quedarse solo en el rol general.

---

## Error común: pensar que si dos usuarios tienen el mismo rol pueden acceder a los mismos objetos

No necesariamente.

Dos personas pueden compartir el mismo rol general —por ejemplo, “cliente” o “usuario”— y aun así solo deberían poder acceder a **sus propios** recursos.

El rol por sí solo no resuelve la autorización completa.  
Hace falta también comprobar la relación específica con cada objeto.

---

## Error común: proteger bien la vista, pero no la acción

A veces una aplicación valida correctamente el acceso al recurso cuando se muestra en pantalla, pero no al:

- actualizar
- borrar
- descargar
- exportar
- cambiar estado
- operar por API

Eso genera una defensa parcial e inconsistente.

La protección real debe existir en todas las operaciones relevantes sobre el recurso.

---

## Idea clave del tema

La escalada horizontal de privilegios ocurre cuando un usuario autenticado accede a recursos o acciones que corresponden a otro usuario del mismo nivel, debido a una falla de autorización.

Este problema enseña que:

- autenticación válida no alcanza
- compartir rol no implica compartir recursos
- la autorización debe comprobar también propiedad y alcance sobre cada objeto
- un usuario común puede transformarse en una amenaza grave si el sistema no aísla correctamente sus recursos de los de otros

---

## Resumen

En este tema vimos que:

- la escalada horizontal es una forma de falla de autorización
- permite a un usuario tocar recursos de otro usuario del mismo nivel
- no implica volverse administrador ni subir jerárquicamente
- aparece cuando el sistema valida login pero no valida bien propiedad o alcance
- puede afectar lectura, modificación y borrado de objetos ajenos
- la defensa requiere controles explícitos de relación entre identidad, recurso y acción

---

## Ejercicio de reflexión

Pensá en una aplicación con:

- perfiles de usuario
- documentos privados
- pedidos o solicitudes
- API para leer y actualizar objetos
- usuarios del mismo rol general

Intentá responder:

1. ¿qué recursos deberían comprobar propiedad estricta?
2. ¿qué operaciones además de “ver” podrían ser peligrosas?
3. ¿qué diferencia hay entre tener el mismo rol y tener derecho sobre el mismo objeto?
4. ¿qué casos de prueba harías para detectar escalada horizontal?
5. ¿qué señales revisarías en auditoría o logs?

---

## Autoevaluación rápida

### 1. ¿Qué es la escalada horizontal de privilegios?

Es cuando un usuario autenticado accede a recursos o acciones de otro usuario del mismo nivel debido a una falla de autorización.

### 2. ¿En qué se diferencia de la escalada vertical?

En que no busca subir de rol, sino moverse lateralmente hacia recursos de pares equivalentes.

### 3. ¿Por qué puede ser muy grave aunque el atacante siga siendo “usuario común”?

Porque puede exponer o modificar datos ajenos, afectando confidencialidad, integridad y confianza del sistema.

### 4. ¿Qué defensa ayuda mucho a prevenirla?

Validar en el backend la relación entre usuario, recurso y acción en cada operación relevante.

---

## Próximo tema

En el siguiente tema vamos a estudiar la **escalada vertical de privilegios**, donde el objetivo ya no es acceder a recursos de otros usuarios equivalentes, sino alcanzar funciones o permisos de un nivel superior, como áreas administrativas o capacidades reservadas.
