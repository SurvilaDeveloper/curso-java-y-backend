---
title: "IDOR y acceso inseguro a recursos"
description: "Qué es un IDOR, por qué representa una falla de autorización a nivel de objeto y cómo puede permitir acceso indebido a recursos ajenos incluso con autenticación válida."
order: 28
module: "Ataques contra autorización y control de acceso"
level: "intro"
draft: false
---

# IDOR y acceso inseguro a recursos

En los temas anteriores vimos dos problemas muy importantes:

- la **escalada horizontal de privilegios**
- la **escalada vertical de privilegios**

Ahora vamos a entrar en una categoría muy conocida que suele materializar muchas de esas fallas en aplicaciones reales: el **IDOR**, o acceso inseguro a recursos.

La idea general es esta:

> el sistema expone o acepta una referencia a un recurso, pero no valida correctamente si la persona que lo solicita tiene derecho real a acceder a ese objeto concreto.

Eso puede permitir que alguien autenticado vea, modifique o elimine recursos que no le corresponden.

Este tema es especialmente importante porque aparece con frecuencia en aplicaciones que trabajan con objetos como:

- perfiles
- pedidos
- documentos
- archivos
- publicaciones
- tickets
- mensajes
- facturas
- historiales
- configuraciones ligadas a usuarios

Y porque muchas veces el problema no parece “dramático” en el código, pero sí puede ser muy grave en el impacto.

---

## Qué significa IDOR

**IDOR** viene de **Insecure Direct Object Reference**.

En español, la idea puede entenderse como una **referencia directa e insegura a un objeto**.

### Qué significa eso en términos simples

Que el sistema usa una referencia directa a un recurso, por ejemplo un identificador, pero no protege correctamente el acceso a ese recurso.

Entonces, si una persona puede indicar o influir sobre qué objeto quiere consultar u operar, y el sistema no comprueba bien si le corresponde, aparece la falla.

La idea importante es esta:

> el problema no es que exista un identificador, sino que el sistema trate esa referencia como suficiente sin validar adecuadamente la autorización sobre el objeto apuntado.

---

## Por qué este problema es tan común

Es muy común porque muchas aplicaciones se organizan alrededor de objetos identificables.

Por ejemplo:

- un pedido tiene un identificador
- un documento tiene un identificador
- una factura tiene un identificador
- un mensaje tiene un identificador
- un archivo tiene un identificador
- un usuario tiene un identificador

Y eso es completamente normal.

El problema aparece cuando el sistema implementa algo como:

- “si me pedís este objeto, te lo devuelvo”
- “si enviás este identificador, lo actualizo”
- “si ese recurso existe, lo proceso”

sin validar correctamente algo esencial:

> ¿esta identidad tiene derecho legítimo sobre ese objeto concreto?

Como muchísimas aplicaciones trabajan con objetos y referencias, esta clase de error aparece con bastante frecuencia.

---

## Qué relación tiene con la autorización

Un IDOR es, en el fondo, una **falla de autorización a nivel de objeto**.

Eso quiere decir que el sistema puede autenticar bien a la persona, pero falla al responder:

- ¿este usuario puede ver este objeto?
- ¿puede modificarlo?
- ¿puede borrarlo?
- ¿puede descargarlo?
- ¿puede cambiar su estado?
- ¿puede siquiera saber que existe?

Por eso IDOR y acceso inseguro a recursos están muy relacionados con:

- escalada horizontal
- control de acceso
- propiedad del recurso
- validación de alcance
- seguridad a nivel de objeto

---

## Qué busca lograr un atacante con un IDOR

Depende del tipo de recurso y de la operación que el sistema permita.

### Acceso a información ajena

El atacante puede intentar leer datos privados de otra persona.

### Modificación de recursos de terceros

Puede cambiar estados, configuraciones, contenido o datos que no le pertenecen.

### Eliminación de objetos ajenos

En algunos casos puede borrar recursos de otras cuentas.

### Descarga o exfiltración

Puede obtener archivos, documentos o historiales privados.

### Expansión del conocimiento sobre el sistema

Incluso si no puede modificar, a veces el solo hecho de confirmar la existencia de ciertos objetos ya aporta mucho valor.

En todos los casos, el hilo conductor es el mismo:

> usar una referencia a un objeto para acceder más allá de lo permitido.

---

## Por qué no depende necesariamente de “hackear” algo complejo

Este punto es muy importante.

A veces se imagina una falla de seguridad como algo muy sofisticado.  
Pero en un IDOR el problema puede ser conceptualmente más simple:

- el usuario ya está logueado
- el sistema ya tiene una forma de pedir objetos
- el atacante solo necesita lograr que el sistema procese una referencia a un objeto ajeno
- el sistema no valida correctamente la autorización sobre ese objeto

O sea, el problema no siempre está en romper un mecanismo complejo, sino en que el sistema no comprueba bien la relación entre:

- identidad
- objeto
- acción

Por eso este tipo de falla puede ser tan peligrosa:  
a veces requiere muy poco ruido y muy poca complejidad ofensiva.

---

## Qué tipos de recursos suelen verse afectados

Prácticamente cualquier recurso individualizable puede sufrir este problema si la autorización no está bien implementada.

### Recursos ligados a usuarios
- perfiles
- configuraciones
- historiales
- credenciales auxiliares
- preferencias

### Recursos de negocio
- pedidos
- facturas
- solicitudes
- tickets
- reservas
- transacciones

### Contenido y archivos
- documentos
- imágenes
- adjuntos
- mensajes
- publicaciones
- comentarios privados

### Recursos administrativos o internos
- paneles
- reportes
- elementos de soporte
- configuraciones
- registros ligados a otros actores

El problema no depende del tipo de objeto, sino del hecho de que exista una referencia que el sistema procese sin validar bien los permisos correspondientes.

---

## Diferencia entre IDOR y una ruta simplemente oculta

No es lo mismo.

Una ruta poco visible o no enlazada puede ser un hallazgo de descubrimiento o exposición.

Un IDOR aparece cuando existe un recurso accesible mediante una referencia y el sistema falla al controlar si esa referencia corresponde al usuario que realiza la acción.

Podría decirse así:

- descubrir una ruta es saber que algo existe
- un IDOR es poder usar una referencia a un objeto sin la autorización correcta

Esto hace que IDOR no sea solo un problema de descubrimiento, sino de **autorización efectiva sobre el objeto**.

---

## Relación con la escalada horizontal

Este tema se conecta muchísimo con la escalada horizontal de privilegios.

De hecho, en muchos sistemas un IDOR es una forma concreta de materializar una escalada horizontal.

¿Por qué?

Porque el usuario no sube de rol.  
Sigue siendo un usuario común.  
Pero accede a recursos de otro usuario del mismo nivel.

Por ejemplo, si alguien puede ver el pedido o documento de otra persona simplemente porque el sistema no valida bien la propiedad del recurso, eso encaja perfectamente con una escalada horizontal.

---

## Puede afectar también integridad, no solo lectura

A veces se piensa en IDOR solo como “ver algo que no corresponde”.

Pero puede ser mucho más que eso.

Si el sistema permite operar sobre el objeto, el impacto puede incluir:

- edición
- borrado
- cambio de estado
- aprobación indebida
- reasignación
- descarga
- compartición
- alteración de metadatos o relaciones

Eso significa que un IDOR puede afectar tanto:

- **confidencialidad**, si expone datos
- como **integridad**, si permite cambios indebidos

En algunos casos también puede afectar disponibilidad u operación si el recurso era crítico.

---

## Qué suele fallar exactamente

A nivel conceptual, este tipo de problema suele aparecer cuando el sistema comete errores como estos.

### Confunde existencia con autorización

El backend procesa el objeto si existe, pero no valida bien si el usuario tiene derecho sobre él.

### Usa identificadores sin comprobar propiedad

La referencia llega correctamente, pero no se cruza con la identidad que hace la solicitud.

### Aplica controles en unas operaciones y en otras no

Quizá protege la lectura, pero no la modificación.  
O protege la vista web, pero no la API.

### Confiar demasiado en el frontend

La interfaz solo muestra recursos “propios”, pero el servidor no valida correctamente si le mandan otro identificador.

### Reglas de acceso difusas

El sistema no define con claridad qué relación debe existir entre usuario, objeto y acción.

---

## Ejemplo conceptual simple

Imaginá una aplicación donde cada persona puede ver sus propias facturas.

El sistema permite consultar una factura usando una referencia concreta al recurso.

Hasta ahí, eso es normal.

Ahora imaginá que, al procesar la solicitud, el backend solo verifica:

- que la persona esté autenticada
- que la factura exista

pero no valida correctamente si esa factura pertenece realmente a esa cuenta.

Entonces un usuario podría terminar viendo la factura de otra persona.

Eso sería un caso clásico de acceso inseguro a recursos.

La identidad es válida, pero el sistema no protege bien el objeto.

---

## Qué señales pueden sugerir este problema

Detectarlo puede ser difícil porque las solicitudes pueden parecer normales si solo se mira que el usuario estaba autenticado.

Algunas señales que deberían llamar la atención son:

- accesos exitosos a objetos no vinculados con la cuenta
- modificaciones sobre recursos ajenos
- consultas de objetos con relaciones inconsistentes
- lecturas o descargas de recursos fuera del alcance esperado
- auditoría que muestra actor y recurso sin correspondencia lógica
- endpoints que responden correctamente aunque el objeto no debería ser visible para ese usuario

A veces el problema aparece no como un error, sino como una respuesta demasiado exitosa para una relación que no debería existir.

---

## Qué impacto puede tener

El impacto depende del valor del recurso y de la operación permitida.

### Sobre confidencialidad
Puede exponer datos personales, privados, comerciales o internos.

### Sobre integridad
Puede permitir alterar objetos de terceros, con consecuencias de negocio o reputacionales.

### Sobre confianza
Puede hacer que los usuarios sientan que sus recursos no están realmente aislados.

### Sobre cumplimiento
Si involucra información personal o sensible, puede generar problemas legales, contractuales o regulatorios.

### Sobre operación
Puede afectar procesos enteros si el recurso comprometido participa en flujos críticos.

---

## Por qué los tests superficiales muchas veces no lo detectan

Porque en el flujo normal todo parece funcionar bien.

Cada usuario:

- ve sus recursos
- modifica lo suyo
- descarga lo suyo

Entonces el sistema parece correcto.

El problema aparece cuando alguien prueba deliberadamente algo como:

- ¿qué pasa si apunto a otro objeto?
- ¿qué valida realmente el backend?
- ¿la API protege igual que la vista?
- ¿la autorización depende solo de que exista una sesión?
- ¿el sistema verifica propiedad o solo procesa el identificador?

Ese tipo de pruebas exige mirar más allá del caso feliz.

---

## Qué puede hacer una organización para reducir este riesgo

Desde una mirada defensiva, algunas ideas clave son:

- validar en el backend la relación entre identidad, recurso y acción
- no asumir que estar logueado alcanza
- aplicar el mismo rigor en lectura, edición, borrado y descarga
- revisar consistencia entre frontend, backend y API
- diseñar modelos de autorización a nivel de objeto
- testear explícitamente acceso a recursos ajenos
- auditar operaciones sobre objetos sensibles
- evitar que la simple existencia del recurso determine la respuesta positiva

La idea central es que cada acceso a un objeto debería responder a una pregunta clara:

> ¿esta identidad puede operar legítimamente sobre este recurso específico?

---

## Error común: pensar que cambiar el formato del identificador resuelve el problema

No necesariamente.

Si el sistema no valida autorización correctamente, el problema sigue existiendo aunque la referencia sea más difícil de adivinar o menos legible.

Cambiar el formato puede dificultar algo, pero no reemplaza el control de acceso.

La defensa real no es “que el identificador sea raro”, sino que el backend valide correctamente si la operación corresponde.

---

## Error común: proteger solo la interfaz visual

No alcanza con mostrar en pantalla únicamente los objetos correctos.

Si el servidor procesa recursos ajenos cuando recibe una referencia indebida, la aplicación sigue siendo vulnerable.

La seguridad tiene que estar donde se toma la decisión real:

- en el backend
- en la API
- en la lógica que une usuario, objeto y acción

---

## Idea clave del tema

Un IDOR o acceso inseguro a recursos ocurre cuando una aplicación permite usar una referencia a un objeto sin validar correctamente si la identidad que la usa tiene derecho real sobre ese recurso.

Este tema enseña que:

- autenticación válida no alcanza
- la autorización debe operar también a nivel de objeto
- la simple existencia de un recurso no implica permiso sobre él
- una referencia mal protegida puede abrir lectura, modificación o borrado indebido de recursos ajenos

---

## Resumen

En este tema vimos que:

- IDOR significa referencia directa e insegura a un objeto
- representa una falla de autorización a nivel de recurso
- suele materializar problemas de escalada horizontal
- puede afectar lectura, modificación, borrado y descarga
- no depende de romper la autenticación, sino de que falle el control sobre el objeto
- la defensa requiere validar siempre identidad, recurso y acción en el backend

---

## Ejercicio de reflexión

Pensá en una aplicación con:

- perfiles
- facturas
- archivos privados
- API para consultar y actualizar objetos
- distintos usuarios con el mismo rol general

Intentá responder:

1. ¿qué recursos deberían validar propiedad estricta?
2. ¿qué operaciones además de leer podrían ser peligrosas?
3. ¿qué diferencia hay entre “el objeto existe” y “el usuario puede usarlo”?
4. ¿qué pruebas harías para detectar un IDOR?
5. ¿qué señales te ayudarían a detectarlo en auditoría?

---

## Autoevaluación rápida

### 1. ¿Qué es un IDOR?

Es una falla donde el sistema procesa una referencia a un objeto sin validar correctamente si el usuario tiene derecho real sobre ese recurso.

### 2. ¿Qué relación tiene con la autorización?

Es una falla de autorización a nivel de objeto, porque el problema está en quién puede usar o ver ese recurso concreto.

### 3. ¿Puede afectar más que la lectura de datos?

Sí. También puede permitir modificar, borrar, descargar o cambiar estados de recursos ajenos.

### 4. ¿Qué defensa ayuda mucho a prevenirlo?

Validar en el backend la relación entre identidad, recurso y acción para cada operación relevante.

---

## Próximo tema

En el siguiente tema vamos a estudiar el **Broken Access Control**, una categoría más amplia que engloba muchas fallas de autorización y control de acceso, para entender cómo distintos errores dispersos pueden formar parte del mismo problema de seguridad de fondo.
