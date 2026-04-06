---
title: "Secretos vs datos cifrados"
description: "Cómo diferenciar secretos de datos cifrados en una aplicación Java con Spring Boot. Por qué no son el mismo problema, qué riesgos cambia cada uno, cuándo un valor funciona como credencial en vez de simple información sensible y cómo pensar almacenamiento, acceso, rotación y exposición sin mezclar conceptos."
order: 77
module: "Datos sensibles y base de datos"
level: "base"
draft: false
---

# Secretos vs datos cifrados

## Objetivo del tema

Entender la diferencia entre **secretos** y **datos cifrados** en una aplicación Java + Spring Boot.

La idea es despejar una confusión muy común en proyectos reales:

- “si es sensible, lo tratamos como secreto”
- “si está cifrado, ya es un secreto”
- “si algo va cifrado en base, entonces lo estamos manejando como corresponde”
- “todo lo delicado entra en la misma bolsa”

Ese enfoque mezcla problemas distintos.

Porque no es lo mismo:

- un dato sensible del negocio o de una persona
- que una credencial que permite acceder, firmar, llamar a otro sistema o descifrar otra información

En resumen:

> un secreto no es solo un dato delicado.  
> Es un valor cuya posesión cambia capacidades del sistema.

Y eso obliga a pensar almacenamiento, acceso, rotación y exposición de otra manera.

---

## Idea clave

No todo dato sensible es un secreto.

Y no todo dato cifrado deja de ser un secreto o pasa a estar bien resuelto.

### Un dato sensible
puede requerir:

- exposición mínima
- control de acceso
- minimización
- retención razonable
- protección en tránsito y en reposo

### Un secreto
además de todo eso, suele requerir especialmente:

- acceso extremadamente limitado
- manejo cuidadoso del ciclo de vida
- rotación
- no exposición en logs ni respuestas
- protección frente a reutilización indebida
- estrategias claras de revocación o reemplazo
- almacenamiento y distribución más controlados

La idea central es esta:

> un dato sensible suele importar por lo que revela.  
> Un secreto suele importar por lo que permite hacer.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- tratar API keys como si fueran solo “otro campo sensible”
- guardar secretos junto a datos comunes sin distinguir riesgo
- confundir cifrado de un valor con gestión correcta del secreto
- no rotar credenciales porque “están cifradas”
- exponer tokens o claves en logs bajo la idea de que luego se borran
- persistir secretos completos cuando bastaba una referencia, un hash o una versión limitada
- diseñar controles de acceso iguales para datos personales y credenciales técnicas
- asumir que un valor cifrado en base ya está correctamente gestionado como secreto

Es decir:

> el problema no es solo proteger valores delicados.  
> El problema también es no distinguir entre información sensible y material que otorga poder operativo o de acceso.

---

## Error mental clásico

Un error muy común es este:

### “Si algo está cifrado, entonces ya lo estamos manejando como secreto”

Eso es incompleto.

Porque cifrar un valor puede ayudar a protegerlo en almacenamiento.
Pero un secreto bien gestionado requiere pensar además:

- quién lo conoce
- quién lo puede usar
- cómo se entrega al proceso que lo necesita
- cómo se rota
- cómo se revoca
- cómo se evita que aparezca en logs
- cómo se limita su reutilización
- qué pasa si se filtra

### Idea importante

El cifrado puede ser parte de la solución.
Pero no agota el problema de manejar secretos.

---

## Qué es un secreto

Podés pensar un secreto como un valor cuya posesión o conocimiento habilita una capacidad que no debería estar disponible libremente.

### Ejemplos típicos

- contraseñas
- API keys
- client secrets
- tokens de acceso
- refresh tokens
- claves privadas
- secretos de firma
- credenciales de base de datos
- secretos de integración
- claves de cifrado
- material para descifrar otros datos

### Qué tienen en común

No son solo información delicada.
Son valores que permiten:

- autenticarse
- firmar
- llamar a un sistema
- abrir una sesión
- recuperar acceso
- descifrar
- operar con otra identidad
- ejercer un permiso técnico relevante

Por eso merecen un tratamiento especial.

---

## Qué es un dato cifrado

Un dato cifrado, en cambio, describe principalmente **un estado de almacenamiento o protección**.

Es un dato que fue transformado para que no resulte legible sin cierto material de descifrado.

Eso puede aplicar a:

- datos personales
- datos de negocio
- documentos
- tokens
- secretos
- metadata sensible
- archivos

### Idea importante

“Dato cifrado” no te dice por sí solo:

- qué rol cumple ese valor
- si es un secreto o no
- quién debería accederlo
- si hace falta rotarlo
- si otorga capacidades

Solo te dice que hay una capa criptográfica aplicada sobre su almacenamiento o uso.

---

## Un secreto puede estar cifrado, pero sigue siendo un secreto

Este punto conviene remarcarlo mucho.

Supongamos que guardás una API key cifrada en base.
Eso puede estar bien o mal según contexto.
Pero aunque esté cifrada, esa API key sigue siendo:

- una credencial
- un secreto
- un valor que otorga acceso o poder operativo

Entonces hay preguntas que siguen vigentes:

- ¿quién puede descifrarla?
- ¿quién puede usarla?
- ¿cuánto tiempo vive?
- ¿cómo se rota?
- ¿cómo se revoca?
- ¿aparece en logs o debugging?
- ¿se comparte entre demasiados módulos?
- ¿realmente había que guardarla completa?

### Regla útil

El cifrado no cambia la naturaleza del valor.
Solo agrega una capa de protección.

---

## Un dato sensible cifrado no necesariamente es un secreto

También vale el caso inverso.

Podés tener un dato personal o de negocio cifrado en reposo, por ejemplo:

- dirección
- documento
- nota administrativa
- score interno
- dato contractual

Eso puede ser muy sensible.
Pero no necesariamente es un secreto en el mismo sentido que una credencial.

### Porque su compromiso cambia algo distinto

- expone privacidad
- daña reputación
- permite correlación
- ayuda a fraude
- muestra demasiado del negocio

pero no necesariamente permite autenticarse o asumir una identidad.

### Idea útil

No mezclar ambos conceptos ayuda a elegir mejor los controles.

---

## Qué cambia cuando algo es secreto

Cuando un valor es un secreto, aparecen preguntas que no siempre aplican igual a otros datos sensibles.

### 1. Rotación
¿Podemos cambiarlo sin romper todo?

### 2. Revocación
¿Qué hacemos si se filtra?

### 3. Distribución
¿Cómo llega al proceso o módulo que lo necesita?

### 4. Exposición operacional
¿Dónde podría quedar copiado?

### 5. Observabilidad
¿Cómo evitamos que aparezca en logs, errores, métricas o APM?

### 6. Alcance
¿Qué capacidades habilita exactamente?

### 7. Compartición
¿Está siendo reutilizado por demasiados sistemas, entornos o actores?

Estas preguntas vuelven al secreto un objeto operativo, no solo informativo.

---

## Sensible por revelación vs sensible por capacidad

Esta diferencia mental ayuda mucho.

## Sensible por revelación
Importa porque si se expone revela demasiado.

### Ejemplos
- dirección
- email
- historial
- score interno
- nota de soporte
- dato de negocio

## Sensible por capacidad
Importa porque si se expone permite hacer cosas.

### Ejemplos
- password
- token
- API key
- secret de OAuth
- clave privada
- key de cifrado

### Idea clave

Ambos tipos son delicados.
Pero el segundo suele exigir controles todavía más estrictos porque habilita acciones, no solo exposición.

---

## No todos los secretos viven igual

Otro error común es tratar todos los secretos como si tuvieran el mismo ciclo de vida.

Y no es así.

### Algunos pueden ser:

- efímeros
- de un solo uso
- ligados a una sesión
- ligados a una operación puntual
- válidos por minutos

### Otros pueden ser:

- persistentes
- compartidos por servicios
- usados por integraciones
- difíciles de rotar
- críticos para infraestructura

### Idea importante

Cuanto más persistente y más poderoso es un secreto, más grave suele ser su compromiso y más importante es poder gestionarlo bien.

---

## Cifrado no reemplaza rotación

Este es uno de los errores más peligrosos.

A veces un equipo dice:

- “la clave está cifrada en base”
- “entonces estamos bien”
- “no hace falta tocarla por ahora”

Eso es mala señal.

Porque un secreto puede seguir necesitando:

- rotación programada
- rotación por incidente
- expiración
- reemplazo gradual
- compatibilidad entre versiones
- capacidad de revocación

### Idea útil

Si un valor es secreto, pensar solo en cómo se guarda es insuficiente.
También hay que pensar cómo se renueva y cómo se invalida.

---

## Cifrado no reemplaza control de acceso al secreto

Supongamos que un secreto está cifrado en almacenamiento.
Eso puede ser útil.

Pero si demasiados procesos, operadores o servicios tienen capacidad de descifrarlo o usarlo, el problema sigue siendo serio.

### Regla sana

El acceso a secretos debería estar más restringido que el acceso a datos sensibles comunes.

Porque quien accede al secreto no solo ve información.
Puede ganar poder operativo.

---

## Secretos y logs: tolerancia casi nula

Hay datos sensibles que quizá puedan aparecer parcialmente en ciertos logs controlados y con mucho criterio.
Con secretos, la tolerancia suele ser muchísimo menor.

### Porque un secreto logueado puede implicar:

- acceso indebido inmediato
- secuestro de sesión
- abuso de API externa
- uso fraudulento de integraciones
- descifrado de otros datos
- persistencia involuntaria del secreto en varios sistemas derivados

### Regla práctica

Si algo es un secreto, deberías asumir que su presencia en logs, errores o trazas es especialmente grave.

---

## Un token no siempre es “solo otro dato”

Muchos equipos tratan tokens como si fueran strings cualquiera.

Eso es una mala idea.

Un token puede comportarse como:

- credencial
- session handle
- acceso delegado
- llave temporal
- material de autorización
- prueba de que cierta acción es válida

### Entonces conviene preguntarse

- ¿este token da acceso?
- ¿por cuánto tiempo?
- ¿qué daño hace si se filtra?
- ¿hay que persistirlo completo?
- ¿hay que hashearlo?
- ¿hay que rotarlo?
- ¿hay que invalidarlo al usarlo?

Todo eso lo acerca mucho más al mundo de los secretos que al de “datos cualquiera”.

---

## Secretos de terceros: todavía más delicados

Cuando el backend maneja secretos para hablar con otros sistemas, el riesgo crece porque la fuga no solo compromete tu sistema.
También puede comprometer:

- proveedores
- integraciones
- socios
- cuentas externas
- flujos de facturación
- servicios de identidad
- infraestructura cloud

### Ejemplos

- API key de pagos
- secreto de OAuth
- credenciales SMTP
- token de storage
- credenciales de verificación externa

### Idea importante

Estos secretos merecen especial cuidado porque su compromiso puede abrir incidentes más allá de tu propia base de datos.

---

## Datos cifrados de usuario: riesgo distinto

En cambio, si hablamos de un dato cifrado del usuario, el análisis cambia.

Por ejemplo:

- documento cifrado
- dirección cifrada
- observación interna cifrada

Eso puede ser gravísimo si se expone.
Pero el tipo de daño suele ir más por:

- privacidad
- reputación
- cumplimiento
- fraude
- correlación

y no tanto por asumir una capacidad técnica inmediata.

### Idea útil

Eso no lo hace menos importante.
Solo muestra que no todos los valores delicados requieren exactamente el mismo modelo mental.

---

## Secretos, hashes y almacenamiento

Otra distinción útil:

no todo secreto que necesita verificación requiere almacenarse reversible.

### Ejemplo clásico

Una contraseña no debería guardarse como un valor cifrado para luego descifrarla.
Lo normal es guardarla como hash y verificarla.

### ¿Por qué importa?

Porque ese patrón muestra que a veces la pregunta correcta no es:

- “¿cómo guardo este secreto?”

sino:

- “¿necesito volver a conocerlo o solo necesito verificarlo?”

Cuando la respuesta es “solo verificar”, el diseño cambia mucho y suele ser más sano.

---

## Manejar un secreto también implica pensar exposición lateral

Un secreto no solo puede filtrarse desde la tabla donde vive.

También puede salir por:

- logs
- variables de entorno mal tratadas
- trazas
- volcados de memoria
- debugging
- errores
- requests salientes
- herramientas de soporte
- tickets internos
- scripts auxiliares

### Idea clave

La gestión de secretos es un problema de recorrido completo, no solo de almacenamiento.

---

## Secretos compartidos por demasiados actores

Otra mala señal frecuente es cuando el mismo secreto lo usa:

- toda la aplicación
- varios microservicios
- múltiples entornos
- procesos batch
- herramientas manuales
- operadores
- integraciones auxiliares

### Problema

Cuanta más gente o más componentes dependen del mismo secreto:

- más difícil rotarlo
- más difícil revocarlo
- más superficie de fuga
- más difícil investigar incidentes
- más impacto si se compromete

### Regla útil

Un secreto más reutilizado suele ser un secreto más riesgoso.

---

## Qué conviene revisar en una codebase o arquitectura

Cuando revises secretos vs datos cifrados, mirá especialmente:

- qué valores realmente funcionan como credenciales o llaves
- qué datos sensibles se están tratando como si fueran secretos y viceversa
- si los secretos están pensados solo como “campos cifrados”
- dónde aparecen tokens o claves completas
- si existen mecanismos de rotación o revocación
- si los secretos viven demasiado tiempo
- si múltiples sistemas comparten el mismo valor
- si datos cifrados de usuario se están mezclando con material criptográfico o credenciales
- si el equipo puede explicar claramente qué valores otorgan capacidad y cuáles solo revelan información
- si los logs o errores están cerca de exponer secretos operativos

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- distinción clara entre credenciales y datos sensibles comunes
- menos secretos persistidos sin necesidad fuerte
- secretos con acceso más restringido
- mejor criterio sobre qué puede hashearse y qué necesita cifrado reversible
- mecanismos de rotación o invalidez
- menor presencia de secretos en el recorrido normal del sistema
- comprensión más clara del poder operativo que habilita cada valor
- menos mezcla conceptual entre almacenamiento cifrado y gestión de secretos

---

## Señales de ruido

Estas señales merecen revisión rápida:

- “secreto” usado como sinónimo de “dato sensible”
- API keys, tokens y claves tratados como strings comunes
- secretos guardados completos sin preguntar si hacía falta
- “está cifrado” usado como cierre de discusión
- ausencia total de rotación o revocación
- el mismo secreto compartido por demasiados componentes
- logs, errores o debugging con riesgo de exponer credenciales
- nadie puede explicar qué valores otorgan capacidad y cuáles solo exponen información
- datos sensibles y secretos almacenados con la misma estrategia por comodidad

---

## Checklist práctico

Cuando evalúes un valor delicado, preguntate:

- ¿este valor solo revela información o también otorga capacidad?
- ¿sirve para autenticarse, firmar, llamar a otro sistema o descifrar?
- ¿debo volver a conocerlo o solo verificarlo?
- ¿realmente necesito persistirlo completo?
- ¿quién puede accederlo o usarlo?
- ¿cómo se rota o revoca?
- ¿qué daño hace si se filtra hoy?
- ¿aparece en logs, errores o trazas?
- ¿estamos confiando demasiado en “está cifrado”?
- ¿qué cambiaría si tratáramos este valor como secreto de verdad y no como un simple campo sensible?

---

## Mini ejercicio de reflexión

Tomá cinco valores de tu sistema, por ejemplo:

- password hash
- refresh token
- API key de tercero
- dirección del usuario
- nota interna de soporte

y respondé para cada uno:

1. ¿Es un secreto o un dato sensible no secreto?
2. ¿Qué daño produce si se filtra?
3. ¿Otorga capacidad o solo revela información?
4. ¿Hay que persistirlo?
5. ¿Hay que poder recuperarlo en claro?
6. ¿Requiere rotación o revocación?
7. ¿Qué error de diseño sería más probable con ese valor hoy?

---

## Resumen

Distinguir secretos de datos cifrados ayuda a pensar mejor la seguridad del backend.

Porque no es lo mismo proteger un valor delicado por lo que revela que proteger uno por lo que permite hacer.

En términos simples:

- un dato sensible suele importar por exposición
- un secreto suele importar por capacidad

Y por eso los secretos suelen requerir además:

- acceso más restringido
- menos circulación
- más cuidado en logs
- rotación
- revocación
- mejor control de uso

En resumen:

> un backend más maduro no mete todo lo delicado en la misma categoría.  
> Distingue entre información sensible y material de acceso o control,  
> y diseña cada uno según el daño real que puede producir su compromiso.

---

## Próximo tema

**Logs que filtran información sensible**
