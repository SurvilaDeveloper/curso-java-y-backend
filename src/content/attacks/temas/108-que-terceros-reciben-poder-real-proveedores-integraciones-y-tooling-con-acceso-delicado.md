---
title: "Qué terceros reciben poder real: proveedores, integraciones y tooling con acceso delicado"
description: "Por qué el riesgo no depende solo del software que usamos, sino también de qué proveedores, integraciones y herramientas externas pueden observar, modificar u operar partes sensibles del sistema."
order: 108
module: "Supply chain, terceros y confianza extendida"
level: "intermedio"
draft: false
---

# Qué terceros reciben poder real: proveedores, integraciones y tooling con acceso delicado

En el tema anterior vimos las **dependencias directas y transitivas**, y por qué una parte importante del riesgo de software entra no solo por lo que elegimos conscientemente, sino también por lo que heredamos detrás de esas elecciones.

Ahora vamos a estudiar otro aspecto central del bloque: **qué terceros reciben poder real** dentro del sistema.

La idea general es esta:

> el riesgo no depende solo del software que usamos, sino también de qué proveedores, integraciones y herramientas externas pueden observar, modificar, desplegar, autenticar, operar o influir sobre partes sensibles del sistema.

Esto es especialmente importante porque muchas veces una organización piensa en terceros como si fueran apenas “servicios conectados” o “proveedores auxiliares”.

Pero en la práctica, algunos terceros reciben capacidades muy concretas y muy delicadas, por ejemplo:

- leer datos
- autenticar usuarios
- disparar flujos críticos
- desplegar cambios
- tocar infraestructura
- acceder a secretos
- operar sobre cuentas
- ver telemetría sensible
- enviar mensajes en nombre del sistema
- intervenir en procesos de negocio o soporte

La idea importante es esta:

> cuando un tercero recibe poder real, deja de ser un detalle periférico y se convierte en parte del modelo de confianza, del modelo de daño y del modelo de contención del sistema.

---

## Qué entendemos por tercero en este contexto

En este tema, un **tercero** es cualquier actor externo o semiexterno a la organización que participa de forma relevante en:

- construcción
- operación
- autenticación
- despliegue
- observabilidad
- integración
- soporte
- procesamiento
- comunicación
- almacenamiento
- ejecución de partes del sistema

Ese tercero puede ser, por ejemplo:

- un proveedor SaaS
- un partner
- una API externa
- una plataforma cloud
- un proveedor de identidad
- una herramienta de CI/CD
- una solución de monitoreo
- un servicio de email o mensajería
- una plataforma de pagos
- una herramienta administrativa conectada
- un servicio de soporte o analítica con acceso real a datos o eventos

La clave conceptual es esta:

> no todo tercero es igual de relevante; el que importa más para seguridad es el que recibe autoridad, visibilidad o capacidad operativa sobre algo importante.

---

## Por qué este tema importa tanto

Importa porque muchas veces la organización piensa el riesgo con una lógica demasiado interna:

- nuestras cuentas
- nuestros servicios
- nuestros paneles
- nuestra infraestructura
- nuestros permisos

Pero en paralelo puede haber terceros que:

- observan mucho más de lo que parece
- operan con identidades poderosas
- participan de despliegues
- procesan credenciales o sesiones
- actúan sobre datos sensibles
- intervienen en continuidad operativa
- sostienen flujos administrativos o de negocio críticos

La lección importante es esta:

> una parte del poder real del sistema puede estar distribuida fuera de los límites organizacionales más obvios, y eso cambia mucho el análisis de riesgo.

---

## Qué significa que un tercero reciba “poder real”

Significa que no solo está conectado o presente, sino que puede afectar de forma relevante:

- confidencialidad
- integridad
- disponibilidad
- autoridad
- trazabilidad
- continuidad operativa
- experiencia de usuario
- decisiones críticas del sistema

Ese poder puede expresarse de muchas maneras.

### Poder de ver
Por ejemplo:
- datos
- eventos
- logs
- métricas
- actividad de usuarios
- estados internos

### Poder de cambiar
Por ejemplo:
- configuración
- despliegues
- reglas
- estados
- permisos
- contenido o comportamiento

### Poder de autenticar o autorizar
Por ejemplo:
- emitir identidad
- validar sesiones
- habilitar acceso
- participar de recuperación de cuenta

### Poder de operar
Por ejemplo:
- disparar jobs
- administrar infraestructura
- interactuar con tooling sensible
- sostener flujos operativos de negocio

La idea importante es esta:

> lo que vuelve crítico a un tercero no es solo su existencia, sino el tipo de capacidad concreta que se le delega o se le confía.

---

## Qué diferencia hay entre “usar un servicio” y “darle poder sobre el sistema”

Este matiz es muy importante.

### Usar un servicio
Puede significar una relación relativamente limitada, donde el tercero cumple una función acotada y con poco alcance.

### Darle poder sobre el sistema
Significa que ese tercero participa en alguna parte sensible de:
- la autoridad
- la operación
- los datos
- el despliegue
- la identidad
- la continuidad

Podría resumirse así:

- no todo uso de terceros es crítico
- pero algunos terceros dejan de ser meros servicios y pasan a ser actores con poder efectivo sobre riesgos relevantes

La idea importante es esta:

> la pregunta útil no es solo “qué tercero usamos”, sino “qué parte del sistema quedaría afectada si ese tercero se equivocara, cambiara, fallara o fuera comprometido”.

---

## Qué tipos de terceros suelen merecer más atención

Hay varias familias especialmente relevantes.

### Proveedores de identidad y acceso

Por ejemplo:
- login federado
- autenticación externa
- recuperación o validación de cuentas
- manejo de sesiones o tokens

### Herramientas de CI/CD y despliegue

Porque pueden:
- construir artefactos
- desplegar a producción
- tocar infraestructura
- usar credenciales sensibles
- actuar con mucha autoridad

### Herramientas de observabilidad y monitoreo

Porque a veces pueden ver:
- datos
- errores
- trazas
- tráfico
- eventos internos
- actividad de usuarios o cuentas privilegiadas

### Integraciones de negocio

Por ejemplo:
- pagos
- mensajería
- emailing
- CRM
- plataformas externas conectadas a flujos críticos

### Tooling administrativo o de soporte

Porque puede interactuar con:
- cuentas de usuarios
- estados delicados
- datos ampliados
- procesos internos

La idea importante es esta:

> algunos terceros importan menos por el volumen de uso y más por la cercanía al poder, a la identidad o a los activos sensibles.

---

## Por qué este riesgo suele subestimarse

Se suele subestimar por varias razones.

### Porque la relación parece contractual y no técnica

Se piensa:
- “es un proveedor serio”
- “es una plataforma conocida”
- “esto lo usan todos”
- “ya viene resuelto por ellos”

y eso puede dar una sensación de seguridad heredada demasiado amplia.

### Porque el acceso real está escondido

A veces el equipo no ve fácilmente:
- qué puede leer
- qué puede cambiar
- qué identidad usa
- qué secretos toca
- qué entorno alcanza
- qué continuidad sostiene

### Porque el tercero parece solo “un servicio más”

Y no una pieza con poder real sobre:
- autenticación
- despliegue
- datos
- soporte
- negocio
- infraestructura

La lección importante es esta:

> el riesgo de terceros se subestima mucho cuando se analiza por reputación o costumbre de uso, en vez de por capacidad efectiva sobre el sistema.

---

## Relación con confianza extendida

Este tema está directamente conectado con la **confianza extendida**.

Porque cuando un tercero recibe poder real, la organización está extendiendo parte de su modelo de confianza hacia algo que no controla totalmente.

Eso puede ser razonable e inevitable en muchos casos.

Lo importante es reconocer preguntas como:

- ¿cuánto poder se está extendiendo?
- ¿qué parte del sistema depende de esa confianza?
- ¿qué barreras sobreviven si esa confianza falla?
- ¿qué daño sería posible si el comportamiento esperado cambia?

La idea importante es esta:

> la confianza extendida no es solo una decisión comercial o técnica; es una decisión de seguridad con consecuencias estructurales.

---

## Relación con modelado de amenazas

Este tema mejora mucho el modelado de amenazas porque obliga a incluir a terceros no solo como “integraciones”, sino como actores con:

- alcance
- autoridad
- visibilidad
- dependencia funcional
- capacidad de amplificar daño

Eso ayuda a responder mejor preguntas como:

- ¿qué actor externo tiene más poder del que aparenta?
- ¿qué tercero toca activos críticos?
- ¿qué tercero participa de autenticación, despliegue o soporte?
- ¿qué superficie de confianza se extiende fuera de nuestros límites?
- ¿qué escenario crecería mucho si este tercero falla o se compromete?

La lección importante es esta:

> si los terceros relevantes no aparecen explícitamente como actores poderosos dentro del análisis, el modelo de amenazas queda demasiado optimista.

---

## Relación con arquitectura segura

También se conecta fuertemente con arquitectura segura.

Porque una buena arquitectura no solo decide:

- cómo se separan componentes internos
- cómo se distribuyen permisos
- cómo se trazan eventos

También decide:

- cuánto poder se entrega a tooling externo
- qué tercero puede operar sobre qué entorno
- qué integraciones reciben qué nivel de autoridad
- qué proveedor ve o toca qué datos
- qué barreras existen si un tercero falla o actúa fuera de lo esperado

La idea importante es esta:

> una arquitectura madura no trata a los terceros críticos como apéndices, sino como partes explícitas del reparto de poder del sistema.

---

## Relación con defensa en profundidad

Este tema también obliga a mirar la defensa en profundidad con otra lente.

Porque si un tercero concentra demasiado poder y no hay capas suficientes alrededor, entonces la organización queda muy expuesta a:

- error del tercero
- compromiso del tercero
- abuso de una cuenta asociada al tercero
- cambio inesperado del servicio
- indisponibilidad
- visibilidad excesiva
- autoridad mal acotada

La lección importante es esta:

> una dependencia fuerte de terceros sin límites claros ni capas complementarias convierte conveniencia en fragilidad.

---

## Relación con contención y respuesta

Este punto es muy importante.

Cuando un tercero tiene acceso o capacidad delicada, también cambia preguntas de respuesta como:

- ¿qué tan rápido podemos revocar o limitar ese acceso?
- ¿qué partes del sistema se ven afectadas si cortamos la integración?
- ¿qué modo degradado existe si ese tercero deja de ser confiable o disponible?
- ¿qué trazabilidad tenemos sobre lo que hizo?
- ¿qué tan visible es su actividad sobre activos críticos?

La idea importante es esta:

> un tercero con poder real no solo aumenta superficie de riesgo; también puede complicar mucho la contención si la organización no pensó esos límites de antemano.

---

## Ejemplo conceptual simple

Imaginá una organización que usa varios servicios externos.

A simple vista, parecen “herramientas” o “plataformas”.

Pero algunas de ellas:

- autentican usuarios
- despliegan a producción
- tienen acceso a logs sensibles
- procesan pagos
- tocan estados de negocio
- participan en soporte
- usan credenciales con mucho alcance

En ese punto ya no estamos hablando solo de servicios auxiliares.  
Estamos hablando de terceros que reciben partes del poder real del sistema.

Ese es el corazón del tema:

> un tercero deja de ser periférico cuando participa de identidad, autoridad, despliegue, datos o continuidad de forma material.

---

## Qué preguntas ayudan a mirar mejor este problema

Hay preguntas muy útiles para empezar.

### Sobre poder
- ¿qué terceros pueden ver, cambiar, desplegar, autenticar u operar algo importante?

### Sobre alcance
- ¿hasta dónde llega su acceso real?
- ¿qué entornos, cuentas o activos tocan?

### Sobre dependencia
- ¿qué pasaría si mañana ese tercero cambia, falla o deja de comportarse como esperamos?

### Sobre contención
- ¿podemos limitar, revocar o degradar esa relación sin colapso mayor?

### Sobre trazabilidad
- ¿qué tan bien vemos lo que hace ese tercero sobre nuestras superficies sensibles?

La idea importante es esta:

> estas preguntas ayudan a mover la conversación desde “qué servicio usamos” hacia “qué poder real tiene ese servicio sobre nuestro sistema”.

---

## Qué señales muestran que esta etapa está débil

Hay varias pistas bastante claras.

### Ejemplos conceptuales

- integraciones o proveedores tratados como si fueran neutrales
- tooling externo con acceso sensible pero poca revisión de alcance
- poca claridad sobre qué terceros tocan datos, entornos o credenciales críticas
- dificultad para explicar qué pasaría si cierto proveedor se comprometiera o quedara indisponible
- trazabilidad limitada sobre acciones realizadas por servicios externos
- dependencia operativa alta sin planes claros de limitación o degradación

La idea importante es esta:

> cuando un tercero tiene mucho poder pero el equipo lo piensa poco, la confianza extendida probablemente esté mal modelada.

---

## Qué puede hacer una organización para mejorar

Desde una mirada defensiva, algunas ideas clave son:

- mapear terceros no por nombre o popularidad, sino por poder efectivo sobre activos y capacidades
- revisar qué proveedores e integraciones participan en identidad, despliegue, soporte, datos o infraestructura
- limitar lo más posible el alcance real que se entrega a tooling externo
- mejorar visibilidad y trazabilidad sobre actividad de terceros con acceso delicado
- pensar con anticipación cómo contener, revocar o degradar relaciones externas importantes
- conectar este análisis con privilegios, arquitectura, aislamiento y continuidad operativa
- asumir que un tercero muy confiable también puede ser un tercero muy crítico y por eso merece más modelado, no menos

La idea central es esta:

> una organización madura no pregunta solo “qué terceros usamos”, sino “qué partes del poder real del sistema están pasando por manos ajenas y cómo limitamos el daño posible si eso falla”.

---

## Error común: pensar que el riesgo de terceros depende solo de si el proveedor es “bueno” o “famoso”

No.

Eso puede influir, pero no reemplaza preguntas como:

- qué acceso tiene
- qué autoridad ejerce
- qué daño puede producir
- qué visibilidad existe
- qué capacidad de contención queda

La reputación no sustituye al análisis de poder real.

---

## Error común: creer que una integración es solo un canal de datos

No siempre.

Puede ser también un actor que:
- autentica
- modifica
- decide
- despliega
- transmite autoridad
- observa demasiado
- conecta contextos que deberían estar más separados

Lo que parece “canal” a veces en realidad es una superficie de poder.

---

## Idea clave del tema

El riesgo de terceros no depende solo del software que usamos, sino también de qué proveedores, integraciones y herramientas externas reciben poder real sobre identidad, datos, despliegue, soporte, operación o continuidad del sistema.

Este tema enseña que:

- no todos los terceros son igual de críticos; importan más los que reciben autoridad o visibilidad sensible
- la confianza extendida debe analizarse en términos de poder real y daño posible
- proveedores e integraciones pueden ser actores centrales del modelo de amenazas
- una organización madura modela no solo qué terceros existen, sino qué parte del sistema queda realmente en sus manos

---

## Resumen

En este tema vimos que:

- un tercero relevante es aquel que recibe autoridad, visibilidad o capacidad operativa sobre algo importante
- proveedores, integraciones y tooling pueden concentrar poder mucho más alto del que aparentan
- este análisis se conecta con confianza extendida, modelado de amenazas, arquitectura y contención
- el riesgo de terceros suele subestimarse cuando se lo mira por reputación y no por alcance real
- la defensa madura pregunta qué poder se delega, cómo se limita y qué pasa si esa confianza falla

---

## Ejercicio de reflexión

Pensá en un sistema con:

- autenticación externa
- CI/CD
- cloud provider
- observabilidad de terceros
- integraciones de negocio
- soporte o tooling externo
- cuentas técnicas con acceso a entornos sensibles

Intentá responder:

1. ¿qué tercero hoy tiene más poder real sobre el sistema?
2. ¿qué acceso o autoridad de ese tercero te incomoda más si lo mirás desde daño posible?
3. ¿qué diferencia hay entre usar un servicio y entregarle poder sobre una parte crítica del sistema?
4. ¿qué relación externa sería más difícil de contener si mañana se volviera problemática?
5. ¿qué revisarías primero para reducir alcance o mejorar trazabilidad sobre terceros críticos?

---

## Autoevaluación rápida

### 1. ¿Qué significa que un tercero reciba poder real?

Que puede ver, cambiar, autenticar, desplegar u operar algo relevante para la seguridad del sistema.

### 2. ¿Por qué esto importa tanto?

Porque ese tercero pasa a formar parte del modelo de confianza y del daño posible, aunque no pertenezca a la organización.

### 3. ¿La popularidad o reputación del proveedor reemplaza el análisis?

No. El análisis debe centrarse en el alcance, la autoridad, la trazabilidad y la contención posibles.

### 4. ¿Qué defensa ayuda mucho a mejorar esta etapa?

Mapear qué terceros tocan identidad, datos, despliegue, soporte o producción, y limitar su poder real con mejor separación, visibilidad y capacidad de revocación.

---

## Próximo tema

En el siguiente tema vamos a estudiar **CI/CD, build pipelines y artefactos: cuando la cadena de entrega también se vuelve superficie de ataque**, para entender por qué construir y desplegar software con herramientas potentes y altamente confiadas puede convertir la cadena de entrega en una de las zonas más críticas de todo el sistema.
