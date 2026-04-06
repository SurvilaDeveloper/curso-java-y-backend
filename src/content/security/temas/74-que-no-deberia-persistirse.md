---
title: "Qué no debería persistirse"
description: "Cómo decidir qué datos no deberían persistirse en una aplicación Java con Spring Boot. Por qué guardar de más aumenta superficie de riesgo, qué tipos de información conviene evitar almacenar, y cómo pensar minimización, retención, sensibilidad y daño posible antes de convertir un dato en parte permanente del sistema."
order: 74
module: "Datos sensibles y base de datos"
level: "base"
draft: false
---

# Qué no debería persistirse

## Objetivo del tema

Entender **qué datos no deberían persistirse** en una aplicación Java + Spring Boot.

La idea es revisar una decisión que muchos equipos toman demasiado rápido:

- llegó un dato
- el flujo lo usa
- parece útil
- entonces lo guardamos

Ese reflejo es peligroso.

Porque cada dato que persistís pasa a convertirse en algo que luego deberás:

- proteger
- controlar
- no exponer
- no loguear
- no filtrar
- retener con criterio
- borrar cuando corresponda
- justificar frente a incidentes, auditorías o migraciones

En resumen:

> si no necesitás guardar un dato, muchas veces la decisión más segura no es cifrarlo mejor ni esconderlo más.  
> Es directamente no persistirlo.

---

## Idea clave

Persistir no es una decisión neutra.

Cuando un dato pasa a base de datos, archivos, colas persistentes, cachés duraderas o almacenes similares, gana una nueva vida dentro del sistema.

Y eso cambia mucho el riesgo.

Porque ahora ese dato puede:

- filtrarse más adelante
- reaparecer en una query
- quedar en backups
- viajar en migraciones
- ser leído por otros módulos
- aparecer en logs o exports
- ser visto por soporte, admin o integraciones
- quedarse años aunque solo servía durante minutos

La idea central es esta:

> el primer control de seguridad sobre un dato es decidir si realmente merece existir de forma persistente.

---

## Qué problema intenta resolver este tema

Este tema busca evitar patrones como:

- guardar payloads completos “por las dudas”
- persistir tokens temporales innecesarios
- almacenar información que solo hacía falta en tránsito
- conservar datos sensibles más allá de su función real
- guardar respuestas externas completas sin revisar qué traen
- acumular metadata operativa que luego nadie usa
- retener información solo porque “quizá sirva algún día”
- convertir datos efímeros en parte permanente del sistema
- mezclar trazabilidad útil con acumulación excesiva de datos delicados

Es decir:

> el problema no es solo cómo proteger lo que guardás.  
> El problema también es guardar cosas que nunca debieron convertirse en parte estable del sistema.

---

## Error mental clásico

Un error muy común es este:

### “Guardar de más no hace daño; total después vemos si se usa”

Eso suele ser falso.

Guardar de más sí hace daño porque:

- aumenta superficie de ataque
- amplía el impacto de una fuga
- obliga a proteger más cosas
- complica cumplimiento, retención y borrado
- facilita sobreexposición futura
- multiplica la cantidad de lugares donde ese dato puede aparecer
- vuelve más difícil razonar qué información existe realmente en el sistema

### Idea importante

Un dato que nunca se persistió es un dato que:

- no puede reaparecer en una consulta futura
- no puede quedar olvidado en backups
- no puede salir por un export accidental
- no puede ser filtrado por un endpoint nuevo dentro de seis meses

---

## Persistir no es lo mismo que procesar

Hay datos que el backend necesita **usar**, pero no necesariamente **guardar**.

Por ejemplo:

- un token temporal para validar algo en el momento
- una respuesta externa que solo se necesita para completar una operación
- un payload parcial usado para una verificación puntual
- un dato sensible que sirve durante el request, pero no después
- un archivo transitorio antes de una validación o transformación
- campos auxiliares que solo existen para decidir una regla

### Regla sana

Preguntate siempre:

> ¿necesito este dato para procesar el flujo, o también necesito conservarlo después?

No es lo mismo.

---

## Qué tipos de datos suelen no merecer persistencia

No hay una lista universal perfecta, pero hay categorías que suelen merecer sospecha.

### 1. Datos extremadamente sensibles que no aportan valor permanente
Por ejemplo:

- contraseñas en texto claro
- secretos de terceros
- códigos MFA
- tokens temporales completos cuando no hace falta
- recovery links crudos
- credenciales de sesión

En muchos casos, si hace falta persistir algo relacionado, debería ser:

- un hash
- una referencia
- una marca mínima
- una expiración
- o directamente nada

---

### 2. Datos temporales que solo servían durante un paso
Por ejemplo:

- resultados intermedios
- estados transitorios sin valor histórico real
- confirmaciones ya consumidas
- payloads de validación
- respuestas externas completas para una decisión que ya fue tomada

### Idea útil

Lo que solo sirvió para decidir algo no siempre merece quedarse almacenado junto con el resultado final.

---

### 3. Datos “por si acaso”
Este grupo es peligrosísimo.

Incluye cosas como:

- guardar el request completo “por las dudas”
- persistir headers enteros
- almacenar respuestas completas de terceros
- guardar campos opcionales que nadie usa
- conservar metadata muy detallada sin caso de uso real
- registrar todo “para futura analítica” sin diseño concreto

Ese “por si acaso” suele ser una fuente enorme de acumulación innecesaria.

---

### 4. Información derivable
A veces se persisten datos que pueden reconstruirse o derivarse cuando hace falta.

No siempre está mal persistir derivados, pero conviene cuestionarlo.

### Preguntas útiles

- ¿de verdad necesito guardar esto?
- ¿o puedo derivarlo desde otra información menos delicada?
- ¿estoy duplicando datos sensibles sin necesidad?
- ¿ese derivado se vuelve otra superficie que también debo proteger?

Persistir datos derivados puede multiplicar riesgo sin aportar tanto valor.

---

## No deberías persistir secretos si no hay una razón muy fuerte

Este punto conviene dejarlo claro.

Hay secretos que el sistema necesita usar.
Pero usar no siempre implica guardar.

### Ejemplos delicados

- claves API de terceros
- tokens de acceso
- refresh tokens
- secretos temporales de activación
- recovery tokens
- material criptográfico
- credenciales técnicas

### Pregunta central

¿Realmente necesitás persistir el valor completo?

A veces no.

Y si la respuesta es sí, entonces el nivel de protección requerido sube muchísimo.

### Idea práctica

La mejor forma de proteger un secreto innecesario es no persistirlo en absoluto.

---

## Cuidado con guardar payloads enteros

Este es uno de los errores más comunes en sistemas modernos.

Por rapidez, muchos equipos guardan:

- request bodies completos
- respuestas completas de APIs externas
- eventos enteros
- formularios completos aunque solo usan una parte
- snapshots gigantes del estado “por trazabilidad”

### Problema

Esos payloads pueden contener:

- datos sensibles inesperados
- campos que nadie pensó proteger
- información de terceros
- metadata técnica
- secretos temporales
- PII que el modelo principal ni siquiera necesitaba

### Regla sana

Antes de persistir un payload completo, preguntate:

- ¿qué campos necesito realmente conservar?
- ¿cuáles podría descartar?
- ¿qué daño me generaría guardar todo?

Muchas veces conviene extraer solo el subconjunto útil.

---

## Persistir para auditoría no significa persistir todo

A veces aparece esta justificación:

- “lo guardamos por auditoría”
- “lo guardamos por trazabilidad”
- “lo guardamos por si hay que investigar”

Eso puede ser válido en parte.
Pero no significa que debas almacenar:

- todo el payload
- todos los headers
- todos los datos originales
- todos los detalles sensibles
- todos los valores completos

### Una auditoría sana suele necesitar más bien

- quién hizo algo
- cuándo
- sobre qué recurso
- qué acción ocurrió
- en qué contexto relevante
- cuál fue el resultado

No necesariamente necesita volverse un archivo histórico completo de información sensible.

---

## Logs persistentes también cuentan

Persistir no es solo guardar en una tabla.

También cuentan cosas como:

- logs en disco
- eventos almacenados
- colas duraderas
- snapshots
- archivos temporales que quedan
- auditoría retenida demasiado tiempo
- backups con contenido innecesario

### Idea importante

A veces un equipo “no guarda” cierto dato en el modelo principal, pero sí termina persistiendo lo mismo en:

- logs
- errores
- colas
- trazas
- archivos auxiliares

Desde riesgo, el problema sigue existiendo.

---

## Lo temporal debería expirar de verdad

Hay datos que sí pueden requerir almacenamiento temporal.
Por ejemplo:

- tokens de un solo uso
- links de activación
- verificaciones transitorias
- estados intermedios de flujos

Eso puede estar bien.

Pero temporal no significa:

- “lo guardamos y algún día vemos”
- “queda por si acaso”
- “nunca limpiamos porque no molesta”

### Regla sana

Si el dato es temporal, debería tener:

- propósito claro
- ventana clara
- expiración clara
- eliminación o invalidez clara

Persistir temporalmente sin cleanup real termina pareciéndose demasiado a persistir indefinidamente.

---

## Minimización: menos datos, menos riesgo futuro

Este tema conecta directamente con minimización.

Cada dato extra persistido:

- expande superficie
- amplía el impacto de una fuga
- complica backups y restauraciones
- agrega costo de cumplimiento
- vuelve más difícil el derecho al borrado o la retención razonable
- multiplica lugares donde puede reaparecer

### Idea útil

Minimizar no es “guardar poco por filosofía”.
Es guardar lo suficiente para cumplir el caso de uso real, y nada más.

---

## Persistencia y ciclo de vida del dato

Otra pregunta muy sana es esta:

> ¿durante cuánto tiempo necesito este dato?

No todos los datos que justifican persistencia justifican persistencia prolongada.

### Ejemplos

- un token puede justificar minutos
- un registro operativo puede justificar días o semanas
- una factura puede justificar años
- una nota transitoria de moderación puede justificar mucho menos que un contrato formal

### Idea importante

No pienses solo en:

- ¿guardar o no guardar?

Pensá también en:

- ¿guardar cuánto tiempo?
- ¿con qué nivel de detalle?
- ¿en qué forma?
- ¿para qué actor o proceso?

---

## Guardar menos también reduce el valor del sistema para un atacante

Esto a veces no se discute lo suficiente.

Un sistema que acumula muchísima información sensible o innecesaria se vuelve más atractivo como objetivo.

Porque una sola brecha puede dar acceso a:

- mucha identidad
- mucha historia
- mucha metadata
- muchos tokens
- muchos datos derivados
- mucha capacidad de correlación

### En cambio

Si el sistema guarda menos, también ofrece menos botín.

No elimina el riesgo.
Pero reduce bastante el atractivo y el impacto posible.

---

## Persistir datos de terceros requiere todavía más cuidado

Muchas aplicaciones consumen APIs externas o reciben información de socios, proveedores o integraciones.

Ahí aparece otro riesgo:

guardar datos de terceros que el sistema realmente no necesitaba conservar.

### Ejemplos

- respuestas completas de onboarding
- payloads de pago
- metadatos de verificación
- resultados enriquecidos de scoring
- documentos o campos auxiliares que solo servían para una decisión puntual

### Pregunta sana

¿Estamos guardando esto porque es indispensable para operar, o porque vino en la respuesta y era más fácil almacenarlo entero?

La segunda opción suele ser peligrosa.

---

## Cuidado con duplicar información sensible

Otro patrón riesgoso es guardar la misma información delicada en múltiples lugares:

- tabla principal
- tabla histórica
- auditoría
- cache
- export temporal
- evento persistido
- log estructurado

### Problema

Aunque cada copia parezca tener sentido por separado, en conjunto estás:

- multiplicando superficie
- multiplicando vectores de fuga
- multiplicando trabajo de saneamiento futuro

### Regla útil

Antes de persistir una copia adicional, preguntate:

- ¿qué necesidad concreta resuelve?
- ¿podría resolverse con una referencia, resumen o derivado menos sensible?
- ¿vale realmente el costo de riesgo adicional?

---

## Lo que no deberías persistir en texto claro

Hay datos que, aun si justifican almacenamiento, no deberían quedar en texto claro.
Pero incluso ahí vale una doble pregunta:

- ¿de verdad debo guardarlo?
- si debo guardarlo, ¿debo guardarlo así?

### Ejemplos típicos

- secretos
- credenciales
- ciertos identificadores
- material sensible de recuperación o verificación
- datos extremadamente delicados del negocio

Este tema no reemplaza el de cifrado o hashing.
Pero sí ayuda a llegar mejor a esa decisión.

---

## Casos donde guardar sí puede estar justificado

Este tema no propone una filosofía de “no guardar nada”.

Persistir sí puede estar perfectamente justificado cuando hay una necesidad real como:

- evidencia operativa razonable
- contratos o registros legales
- historial necesario del negocio
- conciliación
- auditoría bien diseñada
- soporte con criterio
- analítica definida y minimizada
- reconstrucción imprescindible del dominio

### La clave

La pregunta no es si persistir es malo.
La pregunta es:

> ¿qué valor concreto aporta guardar esto, y justifica realmente el riesgo que agrega?

---

## Qué conviene revisar en una codebase o modelo

Cuando revises si se está persistiendo de más, mirá especialmente:

- tablas con payloads JSON completos
- columnas “rawRequest”, “rawResponse”, “metadata”, “extraData”
- tokens o secretos guardados completos
- estados temporales que nunca se limpian
- registros históricos que nadie sabe por qué existen
- respuestas de integraciones persistidas enteras
- auditoría que captura demasiado detalle
- archivos temporales que quedan en disco
- caches duraderos con datos sensibles
- duplicación de campos delicados en varias capas del sistema

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- criterio claro sobre qué datos merecen persistencia
- menos payloads completos guardados por costumbre
- menor acumulación de datos temporales
- secretos minimizados o directamente no persistidos cuando no hacía falta
- auditoría más intencional y menos invasiva
- limpieza real de información efímera
- menor duplicación de datos delicados
- mejor balance entre trazabilidad y minimización

---

## Señales de ruido

Estas señales merecen revisión rápida:

- “guardamos todo por si acaso”
- payloads completos persistidos sin selección de campos
- tokens o secretos almacenados enteros sin necesidad fuerte
- datos temporales que se vuelven permanentes
- nadie puede explicar por qué se guarda cierto campo
- el sistema conserva muchísimo más de lo que usa
- varias copias de la misma información sensible
- auditoría usada como excusa para acumular todo
- la persistencia creció por comodidad, no por diseño

---

## Checklist práctico

Cuando evalúes si un dato debería persistirse, preguntate:

- ¿este dato es realmente necesario después de terminar el flujo?
- ¿o solo hacía falta durante el procesamiento?
- ¿qué daño podría causar si se filtra más adelante?
- ¿qué actores o módulos podrían verlo una vez persistido?
- ¿realmente necesito el valor completo?
- ¿podría guardar menos, resumir, hashear o referenciar?
- ¿durante cuánto tiempo necesito conservarlo?
- ¿estoy persistiendo un payload completo cuando solo uso una parte?
- ¿estoy duplicando datos sensibles innecesariamente?
- ¿qué ganaría en seguridad si simplemente no lo guardara?

---

## Mini ejercicio de reflexión

Tomá una entidad, tabla o store auxiliar de tu proyecto y respondé:

1. ¿Qué campos guarda hoy?
2. ¿Cuáles de esos campos son realmente necesarios para operar?
3. ¿Cuáles se están guardando “por si acaso”?
4. ¿Qué datos son temporales pero siguen ahí?
5. ¿Qué secretos o tokens completos aparecen sin una razón muy fuerte?
6. ¿Qué campos podrías minimizar, derivar o eliminar?
7. ¿Qué parte de esa persistencia hoy agregarías distinto si diseñaras el sistema desde cero?

---

## Resumen

Decidir qué no debería persistirse es una de las formas más potentes de reducir riesgo en un backend.

Porque cada dato que no guardás:

- no tenés que proteger después
- no puede fugarse más tarde
- no aparece en backups o exports
- no complica retención ni borrado
- no aumenta el valor del sistema para un atacante

En resumen:

> un backend más maduro no convierte todo dato útil en dato permanente.  
> Decide con criterio qué merece existir más allá del request, durante cuánto tiempo y con qué nivel de detalle.

---

## Próximo tema

**Cifrado en tránsito en un backend Spring**
