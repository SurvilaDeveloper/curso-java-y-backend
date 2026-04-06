---
title: "Quiénes son los actores reales: usuarios, insiders, integraciones, cuentas técnicas y componentes internos"
description: "Por qué un buen modelado de amenazas necesita mapear no solo usuarios externos, sino también insiders, cuentas privilegiadas, automatizaciones, integraciones y componentes internos que pueden producir o amplificar daño."
order: 99
module: "Modelado de amenazas y pensamiento adversarial"
level: "intermedio"
draft: false
---

# Quiénes son los actores reales: usuarios, insiders, integraciones, cuentas técnicas y componentes internos

En el tema anterior vimos **qué estamos protegiendo realmente: activos, capacidades y daño posible**, y por qué un buen modelado de amenazas empieza por identificar qué parte del sistema vale más y qué pérdida sería realmente costosa.

Ahora vamos a estudiar la otra gran pregunta básica del modelado de amenazas:

> **¿quiénes interactúan realmente con el sistema y quiénes pueden producir o amplificar daño?**

La idea general es esta:

> un modelado de amenazas pobre suele imaginar solo “usuarios externos” y “atacantes”. Un modelado de amenazas maduro reconoce que también existen insiders, soporte, cuentas privilegiadas, integraciones, automatizaciones, pipelines y componentes internos con capacidad real de causar o amplificar incidentes.

Esto es especialmente importante porque muchos análisis se quedan con una imagen demasiado simplificada, por ejemplo:

- usuario legítimo
- atacante externo
- admin
- sistema

Y nada más.

Pero los sistemas reales suelen tener muchos más actores relevantes, como por ejemplo:

- usuarios comunes
- usuarios con privilegios especiales
- soporte y backoffice
- insiders con acceso legítimo
- integraciones con terceros
- cuentas de servicio
- pipelines
- bots
- workers
- paneles internos
- componentes que llaman a otros componentes
- herramientas operativas
- proveedores o partners con acceso parcial

La idea importante es esta:

> si no entendemos bien quiénes son los actores reales, es muy fácil subestimar caminos de abuso, puntos de expansión y relaciones de confianza que después resultan decisivas en incidentes concretos.

---

## Qué entendemos por actor en este contexto

En este bloque, un **actor** es cualquier entidad que puede interactuar con el sistema de una manera relevante para el riesgo.

Eso incluye entidades humanas, pero también entidades técnicas.

Por ejemplo, pueden ser actores:

- una persona usuaria
- una cuenta privilegiada
- una persona del equipo de soporte
- una integración con un partner
- un pipeline de despliegue
- una cuenta de servicio
- un worker que procesa tareas
- un servicio interno
- un bot
- un sistema de observabilidad con acceso a datos
- un proveedor con acceso a cierta superficie

La clave conceptual es esta:

> actor no significa solo “alguien que inicia sesión”. Significa cualquier entidad que tenga capacidad efectiva de observar, modificar, transmitir, autorizar o ejecutar algo dentro del sistema.

---

## Por qué esta pregunta es tan importante

Es importante porque muchas amenazas no nacen del actor más obvio.

A veces el problema no empieza con:

- un usuario externo desconocido
- un atacante anónimo
- una persona sin acceso

A veces empieza con algo mucho más “normal” o más cercano al sistema:

- una cuenta válida usada fuera de perfil
- un insider con incentivos extraños
- un soporte con demasiado poder
- una automatización sobredimensionada
- una integración con demasiado alcance
- un componente interno que confía demasiado en otro
- una cuenta técnica comprometida

La lección importante es esta:

> el riesgo real no depende solo de quién “debería” usar el sistema, sino también de quién **puede** usarlo, atravesarlo o mover cosas dentro de él con capacidad suficiente.

---

## Qué diferencia hay entre usuarios y actores

Conviene marcar esta diferencia con claridad.

### Usuario
Suele ser una persona o identidad diseñada explícitamente como parte del uso funcional del sistema.

### Actor
Es una categoría más amplia que incluye a cualquier entidad con capacidad relevante para seguridad.

Podría resumirse así:

- todo usuario relevante puede ser un actor
- pero no todo actor relevante es un usuario en el sentido habitual del producto

La idea importante es esta:

> si el modelado de amenazas se queda en “usuarios”, puede dejar fuera justo a las entidades técnicas y operativas que más poder concentran.

---

## Por qué no alcanza con pensar solo en “atacante externo”

Porque muchas veces el atacante externo no actúa solo ni llega directamente al activo más valioso.

Puede hacerlo a través de:

- una cuenta robada
- una sesión válida
- una integración expuesta
- un panel interno mal separado
- un insider descuidado o malicioso
- una automatización con privilegios excesivos
- una cuenta de servicio
- un componente interno demasiado confiado

Además, no todos los incidentes vienen de un atacante externo clásico.  
También existen:

- errores internos
- abuso por insiders
- integraciones mal configuradas
- automatizaciones que se descontrolan
- cuentas técnicas reutilizadas
- decisiones humanas bajo presión

La lección importante es esta:

> reducir el mapa de actores a “nosotros” contra “el atacante externo” deja fuera demasiadas fuentes reales de riesgo.

---

## Actores humanos: más variedad de la que parece

Conviene descomponer mejor los actores humanos.

### Usuarios comunes
Son importantes porque pueden:
- equivocarse
- ser engañados
- abusar funciones legítimas
- automatizar acciones aparentemente inocuas

### Usuarios privilegiados
Concentran más riesgo porque su error o compromiso produce más daño.

### Soporte y backoffice
Suelen interactuar con:
- cuentas de terceros
- datos ampliados
- estados sensibles
- funciones de recuperación o intervención

### Administración u operación
Pueden tocar:
- permisos
- entornos
- configuraciones
- despliegues
- integraciones
- credenciales

### Insiders
Pueden ser:
- maliciosos
- oportunistas
- negligentes
- o simplemente actores con acceso legítimo que, bajo ciertas condiciones, producen daño relevante

La idea importante es esta:

> dentro de “la gente interna” hay niveles de poder, visibilidad e incentivo muy distintos, y el modelado de amenazas necesita reflejar esa diversidad.

---

## Qué entendemos por insider

En este contexto, un **insider** no es necesariamente una persona “malvada desde el principio”.

Es cualquier actor interno o cercano al entorno con acceso legítimo o semilegítimo que podría producir daño relevante por:

- intención maliciosa
- frustración
- oportunidad
- negligencia
- abuso de conveniencia
- presión
- error con mucho alcance

La idea importante es esta:

> pensar en insiders no significa desconfiar paranoicamente de todo el mundo; significa reconocer que el acceso legítimo también puede producir incidentes graves y merece modelado realista.

---

## Actores técnicos: una parte del mapa que suele subestimarse

Este punto es central.

Muchísimas organizaciones modelan bastante bien a personas humanas, pero mucho peor a entidades técnicas como:

- cuentas de servicio
- integraciones
- pipelines
- bots
- workers
- procesos asíncronos
- servicios internos
- herramientas automáticas de soporte u operación

Y eso es un problema, porque muchas de esas entidades tienen:

- gran alcance
- mucha permanencia
- poca supervisión cotidiana
- privilegios heredados
- comportamiento automático
- capacidad transversal entre entornos o sistemas

La lección importante es esta:

> en muchos sistemas modernos, los actores técnicos concentran más poder efectivo que la mayoría de los usuarios humanos.

---

## Qué papel juegan las cuentas de servicio

Las **cuentas de servicio** suelen ser actores especialmente relevantes porque actúan en nombre de procesos, integraciones o componentes.

Pueden:

- leer datos
- escribir en sistemas
- disparar automatizaciones
- conectarse entre entornos
- acceder a secretos
- mover estados de negocio
- operar sin intervención humana directa

Eso las vuelve muy importantes para el modelado de amenazas.

Porque si una cuenta de servicio:

- tiene demasiado alcance
- se comparte demasiado
- no está bien trazada
- no puede revocarse fácil
- opera sobre muchos contextos

entonces se convierte en un actor de altísimo riesgo.

La idea importante es esta:

> una cuenta de servicio no es solo un detalle técnico; es un actor con poder operativo real que puede cambiar mucho el riesgo del sistema.

---

## Qué papel juegan las integraciones

Las **integraciones** también son actores, aunque a veces se las piense solo como conexiones técnicas.

Una integración puede ser:

- con otro producto interno
- con un partner
- con un proveedor
- con un sistema financiero
- con una herramienta de observabilidad
- con un sistema de autenticación
- con un motor de mensajería o automatización

El problema aparece cuando la integración:

- confía demasiado
- recibe demasiado acceso
- transmite demasiado contexto
- opera con privilegios amplios
- no está bien aislada
- se modela como si fuera “neutral” cuando en realidad actúa con autoridad real

La lección importante es esta:

> una integración no es solo un canal; es un actor compuesto que puede amplificar, mover o exponer poder entre sistemas distintos.

---

## Qué papel juegan los componentes internos

Los **componentes internos** también deben verse como actores relevantes.

Por ejemplo:

- APIs internas
- workers
- colas
- servicios de negocio
- servicios administrativos
- componentes de autenticación
- pipelines
- paneles operativos

¿Por qué importa verlos así?

Porque cada uno puede:

- confiar demasiado
- transmitir autoridad
- modificar estados
- amplificar daño
- abrir camino a otro componente
- actuar sobre recursos valiosos

La idea importante es esta:

> cuando un componente interno tiene capacidad de actuar y de afectar a otros, ya no es solo “infraestructura”; es un actor dentro del modelo de amenazas.

---

## Qué relación tiene esto con poder y alcance

Este tema se vuelve mucho más claro cuando lo miramos desde dos preguntas:

- ¿qué puede hacer este actor?
- ¿hasta dónde puede llegar si algo sale mal?

No todos los actores importan igual.

Un actor es más crítico cuanto más:

- ve
- modifica
- aprueba
- transmite
- conecta
- escala
- persiste
- opera sobre otros

La lección importante es esta:

> el valor de un actor para el modelado de amenazas no depende solo de su existencia, sino de su alcance efectivo sobre activos, capacidades y superficies sensibles.

---

## Qué relación tiene esto con confianza

Mapear actores también sirve para revisar **supuestos de confianza**.

Por ejemplo:

- ¿por qué confiamos en esta cuenta técnica?
- ¿por qué esta integración puede hacer tanto?
- ¿por qué este panel ve tanto?
- ¿por qué este componente interno actúa como si siempre fuera legítimo?
- ¿por qué este rol humano puede cruzar tantos contextos?

La idea importante es esta:

> cada actor relevante trae consigo una pregunta de confianza, y el modelado de amenazas sirve justamente para hacer visible si esa confianza está demasiado ampliada o mal ubicada.

---

## Qué errores aparecen cuando el mapa de actores es incompleto

Cuando se modelan pocos actores o se los simplifica demasiado, suelen aparecer errores como:

- subestimar insiders
- ignorar cuentas de servicio poderosas
- no modelar pipelines o automatizaciones como superficie de riesgo
- asumir que lo interno es homogéneamente confiable
- pensar que los partners o integraciones son solo “canales”
- diseñar monitoreo solo para usuarios externos y no para actores técnicos

La lección importante es esta:

> un mapa pobre de actores produce un mapa pobre de amenazas, porque deja fuera justamente varias de las entidades que más pueden amplificar daño.

---

## Ejemplo conceptual simple

Imaginá una organización que dice:

- “nuestros actores son el usuario y el admin”

A simple vista parece una simplificación razonable.

Pero si miramos mejor, también existen:

- soporte con acceso a cuentas ajenas
- pipeline que despliega a producción
- cuenta de servicio que conecta varios sistemas
- integración con un proveedor
- panel interno que toca estados sensibles
- worker que procesa eventos de negocio
- componente que emite credenciales o tokens

Si esos actores no aparecen en el análisis, el modelo queda ciego justo frente a piezas con mucho poder.

Ese es el corazón del tema:

> modelar amenazas bien requiere ver actores reales, no solo personajes obvios del flujo funcional.

---

## Por qué esta etapa mejora mucho la calidad del modelado

Mejora mucho porque vuelve más precisas preguntas como:

- ¿quién podría intentar esto?
- ¿quién podría hacerlo por error?
- ¿quién podría amplificar el daño?
- ¿quién tiene demasiado alcance?
- ¿quién depende de demasiada confianza?
- ¿quién tendría valor ofensivo alto si se compromete?

Eso permite decidir mejor:

- qué revisar primero
- qué cuentas reducir
- qué panel endurecer
- qué trazabilidad reforzar
- qué entornos aislar más
- qué integraciones tratar con más rigor

La idea importante es esta:

> cuando el mapa de actores mejora, también mejora la calidad de todo el resto del modelado: superficies, caminos de daño, controles y prioridades.

---

## Qué señales muestran que esta etapa está débil

Hay varias pistas bastante claras.

### Ejemplos conceptuales

- el modelo de riesgo habla casi solo de “usuarios” y “atacantes”
- cuentas técnicas e integraciones quedan fuera del radar principal
- soporte, backoffice o paneles internos se tratan como si fueran neutros
- se asume que lo interno es más o menos seguro sin analizar actores concretos
- incidentes reales involucran actores que nunca habían sido considerados explícitamente
- cuesta explicar qué cuentas, servicios o herramientas tienen más valor ofensivo

La idea importante es esta:

> cuando el sistema tiene muchos actores poderosos pero el análisis solo nombra a dos o tres, probablemente el modelado de amenazas esté quedándose corto.

---

## Qué puede hacer una organización para mejorar

Desde una mirada defensiva, algunas ideas clave son:

- mapear no solo personas usuarias, sino también identidades técnicas y componentes con poder real
- distinguir mejor entre usuarios comunes, privilegiados, soporte, administración e insiders posibles
- tratar integraciones y cuentas de servicio como actores completos y no solo como accesorios técnicos
- revisar qué actores tienen más alcance, más autoridad o más capacidad de propagación
- usar incidentes y casi-incidentes como evidencia de qué actores estaban subestimados
- asumir que lo interno también está lleno de actores con distintos niveles de riesgo y no es una masa homogénea
- construir el resto del modelado a partir de un mapa de actores más honesto y menos simplificado

La idea central es esta:

> una organización madura deja de pensar el sistema como “usuarios versus atacantes” y empieza a ver el ecosistema real de entidades que pueden producir, facilitar o amplificar daño.

---

## Error común: pensar que los actores más importantes siempre son los más visibles

No.

Muchas veces los actores más peligrosos son justamente los menos visibles para el usuario final, como:

- cuentas de servicio
- pipelines
- paneles internos
- integraciones
- herramientas operativas
- componentes administrativos

La visibilidad no equivale a criticidad.

---

## Error común: creer que un actor técnico no necesita modelado porque “solo hace lo que se le programó”

No.

Puede:

- tener demasiado alcance
- operar con identidades potentes
- interactuar con otros sistemas
- ser abusado
- comportarse mal por error
- amplificar daño automáticamente
- convertirse en pivote de propagación

Lo técnico también necesita pensamiento adversarial.

---

## Idea clave del tema

Un buen modelado de amenazas necesita mapear actores reales: no solo usuarios externos, sino también insiders, soporte, cuentas privilegiadas, integraciones, cuentas técnicas y componentes internos con capacidad efectiva de producir o amplificar daño.

Este tema enseña que:

- actor es cualquier entidad con poder relevante sobre el sistema
- muchas amenazas importantes pasan por actores internos o técnicos, no solo por usuarios externos
- mapear bien actores mejora muchísimo la calidad del análisis posterior
- la seguridad madura reconoce que el ecosistema real de riesgo es mucho más amplio que el flujo funcional visible

---

## Resumen

En este tema vimos que:

- los actores relevantes incluyen personas, cuentas técnicas, integraciones y componentes internos
- un mapa pobre de actores produce un modelado de amenazas pobre
- el valor de un actor depende de su poder, alcance y capacidad de amplificar daño
- soporte, insiders, cuentas de servicio e integraciones merecen análisis explícito
- este mapeo ayuda a revisar confianza, privilegio, superficies y caminos de riesgo con más realismo
- la defensa madura parte de un mapa de actores más completo y menos ingenuo

---

## Ejercicio de reflexión

Pensá en un sistema con:

- usuarios comunes
- soporte
- administración
- insiders posibles
- cuentas privilegiadas
- cuentas de servicio
- integraciones
- pipelines
- servicios internos

Intentá responder:

1. ¿qué actores del sistema suelen quedar fuera del análisis habitual?
2. ¿qué actores técnicos tienen hoy más poder del que intuitivamente se les atribuye?
3. ¿qué diferencia hay entre un usuario visible y un actor realmente crítico para seguridad?
4. ¿qué incidente sería más probable si un actor poco considerado tuviera demasiado alcance?
5. ¿qué mapa de actores harías primero para revisar mejor confianza, poder y superficies de abuso?

---

## Autoevaluación rápida

### 1. ¿Qué es un actor en este contexto?

Es cualquier entidad humana o técnica con capacidad relevante para observar, modificar, ejecutar o transmitir poder dentro del sistema.

### 2. ¿Por qué no alcanza con pensar solo en usuarios externos?

Porque muchas amenazas relevantes pasan por insiders, soporte, cuentas privilegiadas, integraciones, pipelines y componentes internos.

### 3. ¿Qué papel tienen las cuentas de servicio e integraciones?

Son actores técnicos con poder operativo real, capaces de conectar sistemas, mover datos y amplificar daño si están mal diseñadas o comprometidas.

### 4. ¿Qué defensa ayuda mucho a mejorar esta etapa?

Construir un mapa explícito de actores humanos y técnicos con foco en alcance, confianza y capacidad de producir o amplificar daño.

---

## Próximo tema

En el siguiente tema vamos a estudiar **por dónde puede entrar o crecer el problema: superficies, puntos de entrada y caminos de expansión**, para entender cómo un buen modelado de amenazas conecta actores y activos con rutas concretas de abuso, propagación y daño.
