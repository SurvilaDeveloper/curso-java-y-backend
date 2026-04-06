---
title: "Por qué la seguridad no termina en nuestro propio código ni en nuestra propia infraestructura"
description: "Cómo dependencias, proveedores, integraciones y servicios de terceros amplían la superficie real de riesgo, y por qué la confianza extendida obliga a pensar la seguridad más allá de los límites internos del sistema."
order: 106
module: "Supply chain, terceros y confianza extendida"
level: "intro"
draft: false
---

# Por qué la seguridad no termina en nuestro propio código ni en nuestra propia infraestructura

Hasta ahora recorrimos varios bloques del curso:

- vulnerabilidades técnicas
- errores de configuración
- abuso de APIs
- ingeniería social
- arquitectura insegura
- detección y respuesta
- defensa en profundidad
- modelado de amenazas y pensamiento adversarial

Ahora vamos a entrar en otro bloque muy importante: **supply chain, terceros y confianza extendida**.

Y este bloque parte de una idea clave:

> la seguridad de un sistema no termina en el código que escribimos ni en la infraestructura que operamos directamente.

Esto es especialmente importante porque muchas organizaciones piensan la seguridad con una frontera demasiado cómoda:

- “nuestro backend”
- “nuestra base”
- “nuestro panel”
- “nuestro deploy”
- “nuestro código”

Todo eso importa muchísimo, claro.

Pero en sistemas reales también existen muchas dependencias externas o semiexternas, por ejemplo:

- librerías
- paquetes
- frameworks
- imágenes base
- servicios cloud
- CI/CD de terceros
- proveedores de autenticación
- herramientas de observabilidad
- integraciones con partners
- SDKs
- APIs externas
- servicios de mensajería, pagos o email
- repositorios, registries y artefactos

La idea importante es esta:

> aunque no controlemos completamente esas piezas, igual forman parte del riesgo real del sistema porque participan en su funcionamiento, en su confianza y en su poder operativo.

---

## Qué entendemos por supply chain en este contexto

En este bloque, **supply chain** no se refiere solo a logística o cadenas físicas.

Se refiere a la red de componentes, dependencias, herramientas, proveedores y relaciones externas que participan de forma directa o indirecta en la construcción, despliegue, operación o ejecución del sistema.

Eso puede incluir, por ejemplo:

- código de terceros
- infraestructura gestionada por otros
- pipelines y herramientas externas
- dependencias transitivas
- proveedores con acceso o visibilidad
- integraciones que actúan con autoridad real
- artefactos que consumimos sin haberlos producido nosotros
- servicios que sostienen autenticación, despliegue, monitoreo o negocio

La clave conceptual es esta:

> el sistema real es más grande que el código propio; incluye también muchas piezas externas o compartidas de las que depende para existir y operar.

---

## Por qué este tema merece un bloque propio

Merece un bloque propio porque el riesgo cambia mucho cuando la confianza se extiende fuera del perímetro más obvio de la organización.

En otras palabras:

- no todo el poder está en nuestro código
- no toda la exposición está en nuestros endpoints
- no toda la autoridad vive en nuestras cuentas humanas
- no toda la seguridad depende solo de “hacer buen código”

A veces un problema serio puede venir de cosas como:

- una dependencia comprometida
- una imagen base insegura
- una integración demasiado confiada
- un proveedor con demasiado alcance
- una herramienta externa con acceso delicado
- una actualización que introduce comportamiento inesperado
- una cadena de build o deploy más frágil de lo que parecía

La lección importante es esta:

> si el sistema depende de algo para funcionar, desplegarse, autenticarse, integrarse o observarse, entonces ese algo también forma parte del paisaje real de seguridad.

---

## Qué diferencia hay entre “externo” y “irrelevante”

Este matiz es muy importante.

A veces algo externo se trata mentalmente como si estuviera “fuera de nuestro problema”.

Pero eso no siempre tiene sentido.

Porque una cosa puede ser externa y, al mismo tiempo:

- crítica para autenticación
- crítica para despliegue
- crítica para pagos
- crítica para disponibilidad
- crítica para datos
- crítica para visibilidad operativa
- crítica para integridad del código o de los artefactos

Podría resumirse así:

- externo no significa irrelevante
- ajeno no significa inocuo
- tercerizado no significa fuera del modelo de amenazas

La idea importante es esta:

> una dependencia externa puede no pertenecer a nuestra organización, pero sí pertenecer claramente a nuestro riesgo.

---

## Qué tipos de terceros o dependencias suelen importar más

Hay varias familias especialmente relevantes.

### Dependencias de software

Por ejemplo:
- librerías
- paquetes
- frameworks
- plugins
- extensiones
- dependencias transitivas

### Artefactos de ejecución o build

Por ejemplo:
- imágenes base
- contenedores
- artefactos descargados
- binarios de terceros
- templates o scaffolds con código incluido

### Proveedores operativos

Por ejemplo:
- servicios cloud
- CI/CD
- repositorios de artefactos
- herramientas de observabilidad
- email, mensajería o pagos

### Integraciones de negocio o identidad

Por ejemplo:
- proveedores de autenticación
- APIs de partners
- conectores con terceros
- herramientas administrativas externas
- CRMs o plataformas conectadas al flujo real

### Herramientas de desarrollo y operación

Por ejemplo:
- gestores de secretos
- scanners
- registries
- herramientas de soporte
- tooling con permisos en entornos sensibles

La idea importante es esta:

> algunas dependencias son solo comodidad; otras son portadoras directas de confianza, autoridad o capacidad de daño.

---

## Por qué este riesgo suele subestimarse

Se suele subestimar por varias razones.

### Porque no lo “escribimos nosotros”

Entonces se asume algo como:
- “si lo usa mucha gente, debe estar bien”
- “si viene del proveedor, debe ser confiable”
- “si es oficial, alcanza”
- “si nunca dio problemas, no hace falta mirarlo tanto”

### Porque parece demasiado indirecto

El equipo siente más cercanas:
- sus APIs
- sus pantallas
- sus permisos
- su base

y menos cercanas:
- sus paquetes
- sus builds
- sus proveedores
- sus imágenes
- sus integraciones

### Porque el poder está escondido

Algunas dependencias no parecen críticas hasta que se analiza cuánto influyen en:
- autenticación
- despliegue
- ejecución
- privilegios
- secretos
- disponibilidad
- integridad

La lección importante es esta:

> el riesgo de terceros suele quedar subestimado no porque sea menor, sino porque está más distribuido, más implícito o más naturalizado.

---

## Qué relación tiene esto con el modelado de amenazas

Este bloque conecta directamente con lo que venimos trabajando.

Si el modelado de amenazas pregunta:

- qué estamos protegiendo
- qué actores existen
- por dónde puede entrar el problema
- qué supuestos de confianza estamos aceptando
- qué cadenas convierten una debilidad menor en un daño mayor

entonces las dependencias y terceros aparecen enseguida.

¿Por qué?

Porque muchos de ellos son al mismo tiempo:

- actores
- superficies
- puntos de entrada
- pivotes de expansión
- portadores de confianza
- concentradores de poder

La idea importante es esta:

> un modelado de amenazas que no incluye seriamente dependencias, herramientas y terceros suele quedarse corto frente al sistema real que de verdad opera.

---

## Relación con confianza extendida

Este concepto es central en todo el bloque.

La **confianza extendida** aparece cuando una organización deposita parte de su seguridad en componentes o actores que no controla completamente, pero de los que depende funcionalmente.

Eso puede pasar, por ejemplo, cuando confiamos en:

- una librería
- un proveedor
- un SDK
- una integración
- una imagen base
- un servicio cloud
- una herramienta de despliegue
- un flujo automatizado sostenido por terceros

La pregunta importante no es si esa confianza existe.  
Muchas veces es inevitable.

La pregunta importante es otra:

> ¿qué parte del sistema, del poder o del daño posible estamos delegando o heredando a partir de esa confianza?

La lección importante es esta:

> no toda confianza extendida es mala, pero sí necesita modelado explícito, porque puede arrastrar mucho más riesgo del que parece.

---

## Relación con arquitectura segura

Este tema también se conecta con arquitectura segura.

Porque una buena arquitectura no solo piensa:

- qué hace el sistema
- cómo se separan los componentes
- qué cuentas tienen privilegios

También piensa:

- qué dependencias sostienen funciones críticas
- cuánto poder se entrega a integraciones
- qué secretos o entornos toca tooling externo
- qué parte del pipeline depende de piezas ajenas
- qué ocurriría si una dependencia deja de ser confiable

La idea importante es esta:

> una arquitectura madura no trata a los terceros como detalle periférico, sino como parte del reparto real de poder y riesgo dentro del sistema.

---

## Relación con defensa en profundidad

También está muy ligado a la defensa en profundidad.

¿Por qué?

Porque si una dependencia, proveedor o integración concentra demasiado poder, entonces el sistema puede quedar excesivamente expuesto ante:

- compromiso
- error
- comportamiento inesperado
- indisponibilidad
- abuso de confianza
- cambio no anticipado

La defensa en profundidad obliga a preguntar:

- si este tercero falla, ¿qué nos protege todavía?
- si esta integración actúa mal, ¿qué puede contener el daño?
- si esta cadena de build se ve afectada, ¿qué otras barreras sobreviven?
- si esta cuenta externa tiene demasiado alcance, ¿qué límites reales quedan?

La lección importante es esta:

> una confianza extendida sin profundidad ni contención se convierte en una dependencia de alto riesgo, no solo en una comodidad operativa.

---

## Ejemplo conceptual simple

Imaginá una organización que cuida bastante bien su backend y sus permisos internos.

Pero al mismo tiempo:

- usa dependencias con poco criterio de revisión
- deja que una integración toque demasiado
- tiene tooling externo con mucho acceso
- confía demasiado en una parte del pipeline
- hereda mucho poder desde imágenes, artefactos o cuentas externas

A simple vista, “su sistema” parece bien protegido.

Pero en realidad el sistema real incluye muchas piezas externas o semiexternas con impacto directo sobre:

- integridad
- disponibilidad
- autoridad
- despliegue
- visibilidad
- producción

Ese es el corazón del tema:

> la seguridad del sistema real incluye también la seguridad de las piezas que el sistema decide usar, heredar o delegar.

---

## Qué preguntas ayudan a abrir bien este bloque

Hay preguntas muy útiles para empezar.

### Sobre dependencia
- ¿de qué cosas externas o compartidas depende este sistema para funcionar o desplegarse?

### Sobre poder
- ¿qué terceros o herramientas tienen acceso, autoridad o visibilidad importante?

### Sobre confianza
- ¿qué estamos asumiendo sobre esta dependencia o proveedor sin validarlo demasiado?

### Sobre propagación
- si esta pieza falla o se compromete, ¿hasta dónde llega el daño?

### Sobre contención
- ¿qué barreras tenemos si esta dependencia deja de comportarse como esperamos?

La idea importante es esta:

> estas preguntas ayudan a sacar a los terceros del margen del análisis y ponerlos donde corresponden: dentro del mapa real de riesgo.

---

## Qué señales muestran que este enfoque está débil

Hay varias pistas bastante claras.

### Ejemplos conceptuales

- el modelo de amenazas casi no menciona proveedores, tooling, imágenes o dependencias
- se habla mucho del código propio y poco de los componentes heredados
- integraciones con mucho alcance aparecen tratadas como si fueran “solo conexiones”
- tooling externo con poder sensible no recibe el mismo rigor que un sistema propio
- se asume que un proveedor “de confianza” no necesita demasiado análisis adicional
- cuesta explicar qué pasaría si una dependencia o servicio crítico se comportara mal, se comprometiera o quedara indisponible

La idea importante es esta:

> cuando el sistema real depende de muchos terceros pero el análisis casi no los nombra, probablemente la superficie real de riesgo esté submodelada.

---

## Qué puede hacer una organización para mejorar

Desde una mirada defensiva, algunas ideas clave son:

- ampliar el modelado de amenazas más allá del código propio y de la infraestructura más visible
- identificar qué dependencias, proveedores e integraciones concentran más poder, visibilidad o continuidad
- revisar qué confianza extendida existe y qué daño sería posible si falla
- tratar tooling, cuentas externas y supply chain como parte del sistema real y no como anexos
- conectar este análisis con arquitectura, privilegios, separación y contención
- asumir que un sistema moderno casi nunca es “solo nuestro código”, y que el riesgo debe modelarse a la misma escala que la dependencia real

La idea central es esta:

> una organización madura entiende que la seguridad no termina en lo que produce internamente, sino que también incluye todo lo que adopta, integra, ejecuta o delega para poder operar.

---

## Error común: pensar que si una dependencia o proveedor es conocido, entonces ya no hace falta incluirlo demasiado en el análisis

No.

Que algo sea conocido o ampliamente usado no elimina preguntas como:

- qué poder tiene
- qué acceso recibe
- qué confianza heredamos
- qué daño produce si falla
- qué barreras quedan si deja de ser confiable

La popularidad no reemplaza el modelado.

---

## Error común: creer que la supply chain es solo un problema de librerías vulnerables

Tampoco.

También incluye:

- imágenes
- artefactos
- CI/CD
- tooling externo
- proveedores cloud
- integraciones de negocio
- cuentas técnicas de terceros
- servicios que participan en autenticación, despliegue, observabilidad o pagos

La cadena de confianza es mucho más amplia que un `package.json`.

---

## Idea clave del tema

La seguridad no termina en nuestro propio código ni en nuestra propia infraestructura porque los sistemas reales dependen de librerías, imágenes, herramientas, proveedores e integraciones que también concentran confianza, autoridad y capacidad de daño.

Este tema enseña que:

- lo externo no queda fuera del riesgo solo por no ser “nuestro”
- la confianza extendida necesita modelado explícito
- supply chain, tooling y terceros forman parte del sistema real y de su amenaza real
- una organización madura amplía su análisis hasta incluir las piezas de las que depende para construir, operar y ejecutar

---

## Resumen

En este tema vimos que:

- la supply chain incluye dependencias, artefactos, tooling, proveedores e integraciones relevantes
- la seguridad real del sistema abarca también esas piezas externas o compartidas
- la confianza extendida debe analizarse porque puede arrastrar poder y daño posible
- este bloque conecta directamente con modelado de amenazas, arquitectura segura y defensa en profundidad
- el riesgo de terceros suele subestimarse por parecer más indirecto o menos visible
- la defensa madura trata a dependencias y proveedores como parte del mapa real de seguridad

---

## Ejercicio de reflexión

Pensá en un sistema con:

- librerías y paquetes
- imágenes base
- CI/CD
- cloud provider
- observabilidad externa
- autenticación de terceros
- integraciones de negocio
- paneles o tooling con acceso operativo

Intentá responder:

1. ¿qué piezas externas o compartidas están más cerca del poder real del sistema?
2. ¿qué confianza extendida hoy está menos cuestionada?
3. ¿qué diferencia hay entre usar una dependencia y delegarle parte del riesgo del sistema?
4. ¿qué daño sería más costoso si una de esas piezas fallara, se comprometiera o actuara distinto?
5. ¿qué revisarías primero para ampliar el modelo de amenazas más allá del código propio?

---

## Autoevaluación rápida

### 1. ¿Qué significa que la seguridad no termina en nuestro propio código?

Que dependencias, tooling, proveedores e integraciones también participan del riesgo real del sistema.

### 2. ¿Qué es confianza extendida?

Es la confianza que depositamos en piezas externas o compartidas que sostienen funciones, acceso o autoridad relevantes para el sistema.

### 3. ¿La supply chain incluye solo librerías?

No. También incluye imágenes, artefactos, CI/CD, tooling, cloud, integraciones y servicios de terceros con impacto operativo o de seguridad.

### 4. ¿Qué defensa ayuda mucho a mejorar esta etapa?

Incluir dependencias, proveedores y tooling en el modelado de amenazas según el poder, la visibilidad y el daño posible que concentran.

---

## Próximo tema

En el siguiente tema vamos a estudiar **dependencias directas y transitivas: el riesgo que heredamos aunque no lo veamos**, para entender por qué una gran parte de la superficie real de un sistema está formada por componentes que no elegimos de manera tan consciente como creemos.
