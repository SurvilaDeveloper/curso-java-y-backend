---
title: "Actores de amenaza y motivaciones"
description: "Qué tipos de actores de amenaza existen, qué suelen buscar y por qué entender sus motivaciones ayuda a analizar mejor los riesgos de seguridad."
order: 4
module: "Fundamentos de los ataques"
level: "intro"
draft: false
---

# Actores de amenaza y motivaciones

Cuando se estudian ataques, muchas veces toda la atención se pone en la técnica:

- qué vulnerabilidad se explotó
- qué servicio fue comprometido
- qué datos fueron afectados
- qué mecanismo se utilizó

Pero hay otra pregunta igual de importante:

**¿quién o qué está detrás del ataque, y qué busca conseguir?**

Esa pregunta nos lleva al concepto de **actor de amenaza**.

Entender los distintos actores y sus motivaciones no sirve solo para “ponerle nombre al atacante”. También ayuda a pensar mejor:

- qué ataques son más probables
- qué recursos tienen quienes atacan
- qué activos pueden interesarles
- qué nivel de persistencia pueden mostrar
- qué defensas conviene priorizar

---

## Qué es un actor de amenaza

Un **actor de amenaza** es una persona, grupo, organización o incluso mecanismo automatizado con capacidad o intención de causar daño, abusar de un sistema o comprometer información.

No todos los actores tienen el mismo nivel técnico, ni los mismos recursos, ni los mismos objetivos.

Por ejemplo, no actúa igual:

- un bot que prueba contraseñas de manera automatizada
- una banda de ransomware
- un empleado interno descontento
- un atacante que busca fama o reconocimiento
- una organización muy estructurada con objetivos persistentes

Por eso, hablar de “el atacante” como si fuera una sola figura genérica suele ser demasiado simplificador.

---

## Por qué importa conocer al actor de amenaza

En seguridad, el contexto importa mucho.

Una misma vulnerabilidad puede tener distinta prioridad según quién podría explotarla.

Por ejemplo:

- si un sistema está expuesto a bots masivos, importa mucho resistir ataques automatizados
- si protege información sensible de alto valor, puede volverse interesante para actores más persistentes
- si hay muchos usuarios internos con permisos, el riesgo interno también gana peso

Conocer al actor ayuda a responder mejor preguntas como estas:

- ¿el ataque sería oportunista o dirigido?
- ¿requiere mucho conocimiento técnico o poco?
- ¿es probable que el atacante insista mucho tiempo?
- ¿el objetivo es económico, político, ideológico o personal?

---

## Qué son las motivaciones

Las **motivaciones** son las razones por las cuales un actor intenta comprometer un sistema.

No todos atacan por el mismo motivo.

Algunas motivaciones frecuentes son:

- dinero
- espionaje
- sabotaje
- activismo
- venganza
- reputación dentro de una comunidad
- curiosidad o desafío técnico
- acceso a infraestructura ajena

La motivación influye mucho en el tipo de ataque, en el objetivo elegido y en el comportamiento posterior del actor.

---

## Tipos comunes de actores de amenaza

No existe una única clasificación universal, pero esta división es muy útil para empezar.

### 1. Ciberdelincuentes motivados por dinero

Son actores que buscan beneficio económico.

Pueden intentar:

- robar credenciales
- secuestrar cuentas
- vender datos filtrados
- extorsionar con ransomware
- realizar fraude
- usar infraestructura ajena para campañas maliciosas

### Características frecuentes

- priorizan objetivos rentables
- automatizan mucho
- suelen buscar escala
- aprovechan fallas conocidas o configuraciones débiles

### Ejemplos de interés

- tiendas online
- cuentas con medios de pago
- bases de datos de clientes
- servicios que puedan interrumpirse para exigir rescate

---

### 2. Atacantes oportunistas

No siempre tienen un objetivo específico desde el inicio.

Buscan sistemas expuestos, mal configurados o fáciles de comprometer. Si encuentran una oportunidad, avanzan.

### Características frecuentes

- escanean internet de forma masiva
- prueban credenciales filtradas o débiles
- aprovechan software desactualizado
- suelen automatizar sus intentos

No necesariamente apuntan a una organización concreta por su identidad. Muchas veces atacan “lo que encuentren abierto”.

---

### 3. Actores dirigidos o persistentes

Son actores que sí tienen un interés concreto en una organización, sector o tipo de información.

Pueden apuntar a:

- propiedad intelectual
- información estratégica
- comunicaciones internas
- credenciales de alto privilegio
- acceso prolongado a infraestructura crítica

### Características frecuentes

- planificación previa
- mayor paciencia
- mejor adaptación al entorno
- intención de mantenerse ocultos

No siempre aparecen primero con una acción ruidosa. A veces buscan permanencia silenciosa.

---

### 4. Insiders o amenazas internas

Un **insider** es una persona con algún nivel de acceso legítimo al entorno: empleado, contratista, proveedor o colaborador.

La amenaza interna puede ser:

- **maliciosa**, si hay intención de perjudicar
- **accidental**, si una mala práctica termina generando una exposición

### Ejemplos

- copia indebida de información
- abuso de permisos
- filtración deliberada de datos
- mala gestión de secretos
- errores operativos con gran impacto

Esto es importante porque no toda amenaza viene “desde afuera”.

---

### 5. Hacktivistas

Son actores motivados por razones ideológicas, políticas o sociales.

Sus acciones pueden apuntar a:

- visibilizar una causa
- afectar la reputación de una organización
- interrumpir servicios como forma de protesta
- filtrar información con intención de exposición pública

### Características frecuentes

- buscan impacto simbólico o mediático
- eligen objetivos asociados a un tema o conflicto
- valoran la visibilidad del ataque

---

### 6. Actores motivados por reputación, desafío o curiosidad

No siempre hay motivación económica o ideológica.

Algunas personas atacan o prueban sistemas por:

- desafío técnico
- curiosidad
- búsqueda de reconocimiento
- deseo de demostrar capacidad
- interés en “ver si se puede”

Esto no significa que el riesgo sea menor. Un actor inexperto pero insistente todavía puede causar daño, sobre todo si encuentra fallas simples.

---

### 7. Malware y automatizaciones hostiles

Aunque técnicamente detrás del malware suele haber un actor humano, en la práctica muchas amenazas operan de forma automatizada.

Por ejemplo:

- bots que prueban contraseñas
- scanners automáticos
- scripts que buscan paneles expuestos
- ransomware automatizado
- malware que se propaga sin intervención manual directa en cada paso

Esto importa porque la defensa no puede depender de imaginar siempre a una persona atacando “a mano”.

---

## La motivación cambia el tipo de ataque

Un mismo sistema puede interesar por razones distintas.

### Si la motivación es económica
Probablemente interesen:

- datos vendibles
- accesos reutilizables
- fraude
- extorsión

### Si la motivación es espionaje
Probablemente interesen:

- documentos internos
- comunicaciones
- credenciales privilegiadas
- persistencia silenciosa

### Si la motivación es sabotaje
Probablemente interesen:

- interrupción del servicio
- destrucción o alteración de datos
- daño reputacional

### Si la motivación es activista
Probablemente interesen:

- sitios visibles públicamente
- mensajes de alto impacto
- filtraciones con valor simbólico

Esto muestra que la motivación ayuda a anticipar el tipo de comportamiento del actor.

---

## No todos los actores tienen los mismos recursos

Además de la motivación, importa el nivel de capacidad.

Un actor puede tener:

- pocos recursos y poca sofisticación
- herramientas automatizadas listas para usar
- acceso a credenciales filtradas
- conocimiento técnico avanzado
- infraestructura para operar a escala
- tiempo y persistencia para sostener una campaña

La combinación de **motivación + capacidad** cambia mucho el análisis.

Una organización pequeña igual puede sufrir un incidente serio por un atacante poco sofisticado, si las fallas son simples y la exposición es alta.

---

## Qué relación hay entre actor de amenaza y riesgo

El riesgo no depende solo de que exista una vulnerabilidad.

También depende de:

- qué actor podría explotarla
- qué incentivo tendría para hacerlo
- qué tan fácil le resultaría
- qué recursos posee
- cuánto valor tiene el activo expuesto

### Ejemplo

Supongamos que una aplicación expone públicamente un endpoint sensible.

El riesgo puede subir mucho si:

- el acceso es fácil de automatizar
- el dato tiene valor económico
- el sistema está en internet
- no hay monitoreo ni límites

¿Por qué? Porque muchos actores distintos podrían sentirse atraídos por esa oportunidad.

---

## Ejemplo comparativo

Imaginá una plataforma con miles de usuarios y pagos en línea.

### Actor 1: bot automatizado
Motivación: encontrar cuentas con contraseñas débiles.

### Actor 2: ciberdelincuente
Motivación: robar datos o abusar de medios de pago.

### Actor 3: insider malicioso
Motivación: extraer información interna o alterar registros.

### Actor 4: hacktivista
Motivación: afectar la reputación pública de la plataforma.

El sistema es el mismo, pero los riesgos concretos cambian según el actor y su motivación.

---

## Cómo pensar defensivamente a partir de esto

Cuando analices un sistema, no pienses solo:

> “¿qué vulnerabilidades tiene?”

También conviene preguntar:

- ¿quién podría interesarse en este activo?
- ¿qué valor tiene para distintos actores?
- ¿qué ataques serían más razonables según su motivación?
- ¿qué tan visible o expuesto está el sistema?
- ¿qué controles frenan ataques automatizados?
- ¿qué controles limitan abusos internos?

Este enfoque hace que el análisis de seguridad sea más realista.

---

## Errores comunes al empezar

### Pensar que todos los atacantes son iguales
No. Cambian sus objetivos, recursos, paciencia y nivel técnico.

### Suponer que toda amenaza es externa
No siempre. Un usuario interno también puede convertirse en actor de amenaza.

### Creer que solo importa la técnica
La técnica importa, pero la motivación también. Saber qué busca el actor ayuda a priorizar defensas.

### Imaginar siempre ataques muy sofisticados
Muchos incidentes reales ocurren por automatización masiva y fallas simples, no por técnicas extraordinarias.

---

## Idea clave del tema

Un **actor de amenaza** es quien o lo que puede intentar comprometer un sistema.

Sus **motivaciones** explican por qué le interesaría hacerlo.

Comprender ambos elementos ayuda a:

- analizar mejor riesgos
- priorizar controles
- entender qué ataques son más probables
- diseñar defensas más adecuadas al contexto

---

## Resumen

En este tema vimos que:

- un actor de amenaza puede ser una persona, grupo, insider o automatización hostil
- no todos los actores buscan lo mismo
- las motivaciones más comunes incluyen dinero, espionaje, sabotaje, activismo, reputación y curiosidad
- la motivación cambia el tipo de ataque que resulta más probable
- el riesgo depende también de quién podría explotar una vulnerabilidad y con qué objetivo

---

## Ejercicio de reflexión

Pensá en una aplicación que almacene usuarios, contraseñas, compras y datos personales.

Intentá responder:

1. ¿qué actores de amenaza podrían interesarse en ella?
2. ¿qué motivación podría tener cada uno?
3. ¿qué activos serían atractivos para ellos?
4. ¿qué controles serían más importantes según ese contexto?

---

## Autoevaluación rápida

### 1. ¿Qué es un actor de amenaza?
Una persona, grupo, organización o mecanismo automatizado con capacidad o intención de causar daño o abuso sobre un sistema.

### 2. ¿Qué son las motivaciones?
Las razones por las que un actor intenta comprometer un sistema, como dinero, espionaje, sabotaje o activismo.

### 3. ¿Una amenaza interna también cuenta como actor de amenaza?
Sí. Un insider con acceso legítimo puede convertirse en una amenaza maliciosa o accidental.

### 4. ¿Por qué es útil entender las motivaciones?
Porque ayuda a anticipar qué activos podrían ser atacados, qué técnicas son más probables y qué defensas conviene priorizar.

---

## Próximo tema

En el siguiente tema vamos a estudiar la diferencia entre:

- ataques oportunistas
- ataques dirigidos

Esa distinción te va a ayudar a entender por qué algunos ataques buscan cualquier objetivo vulnerable, mientras que otros se preparan específicamente para una víctima concreta.
