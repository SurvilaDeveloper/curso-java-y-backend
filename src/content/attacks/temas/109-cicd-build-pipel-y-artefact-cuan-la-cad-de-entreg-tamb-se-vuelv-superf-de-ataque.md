---
title: "CI/CD, build pipelines y artefactos: cuando la cadena de entrega también se vuelve superficie de ataque"
description: "Por qué construir y desplegar software con herramientas potentes y altamente confiadas convierte la cadena de entrega en una zona crítica del riesgo, y cómo pensar sus superficies, actores y daños posibles."
order: 109
module: "Supply chain, terceros y confianza extendida"
level: "intermedio"
draft: false
---

# CI/CD, build pipelines y artefactos: cuando la cadena de entrega también se vuelve superficie de ataque

En el tema anterior vimos **qué terceros reciben poder real**, y por qué proveedores, integraciones y tooling externo pueden dejar de ser simples servicios auxiliares para convertirse en actores con autoridad, visibilidad y capacidad de daño muy concreta sobre el sistema.

Ahora vamos a estudiar una de las zonas más sensibles dentro de ese mapa: **CI/CD, build pipelines y artefactos**.

La idea general es esta:

> la cadena de entrega de software no es solo una comodidad operativa; también es una superficie de ataque extremadamente relevante porque concentra confianza, automatización, credenciales, capacidad de despliegue y poder sobre el resultado final que llega a producción.

Esto es especialmente importante porque muchas organizaciones piensan la seguridad sobre todo en:

- la app en producción
- la API
- el panel interno
- la base de datos
- los usuarios
- los permisos de runtime

Pero se detienen menos en otra pregunta crítica:

- ¿quién construye el artefacto?
- ¿qué herramientas intervienen?
- ¿qué credenciales usa el pipeline?
- ¿qué confianza recibe el resultado del build?
- ¿qué pasa si la cadena que fabrica y entrega el software se comporta mal o es manipulada?

La idea importante es esta:

> si el sistema confía mucho en lo que sale del pipeline, entonces el pipeline y sus artefactos se convierten en parte del corazón del riesgo, no en un detalle operativo secundario.

---

## Qué entendemos por cadena de entrega

En este contexto, la **cadena de entrega** incluye el conjunto de herramientas, procesos, credenciales, artefactos y automatizaciones que participan en:

- construir
- testear
- empaquetar
- firmar
- publicar
- promover
- desplegar
- distribuir

software o configuración hacia entornos reales.

Eso puede abarcar, por ejemplo:

- repositorios de código
- runners
- jobs de CI
- pipelines de build
- pipelines de deploy
- registries
- artefactos intermedios
- imágenes de contenedor
- secretos de build
- credenciales de despliegue
- tooling de promoción entre entornos
- sistemas que disparan releases

La clave conceptual es esta:

> la cadena de entrega no solo transporta software; también transporta confianza hacia lo que el sistema considera “válido para ejecutar”.

---

## Por qué esta zona merece tanta atención

Merece tanta atención porque tiene una combinación especialmente delicada de características:

- alto nivel de automatización
- alto nivel de confianza implícita
- acceso frecuente a secretos o credenciales
- capacidad de tocar varios entornos
- cercanía con producción
- poder para introducir cambios amplios
- capacidad de mover artefactos que después el resto del sistema acepta

Eso hace que un problema en esta capa pueda tener consecuencias enormes sobre:

- integridad del software
- integridad del despliegue
- separación entre entornos
- control de cambios
- trazabilidad
- capacidad de contención
- confianza sobre qué se está ejecutando realmente

La lección importante es esta:

> cuando la organización confía mucho en la salida de su cadena de entrega, esa cadena pasa a ser una de las superficies más valiosas de todo el sistema.

---

## Qué diferencia hay entre “desplegar software” y “controlar lo que el sistema considera legítimo”

Este matiz es muy importante.

A simple vista, un pipeline parece solo una herramienta para automatizar trabajo.

Pero en realidad muchas veces hace algo más profundo:

- decide qué artefacto se construye
- decide qué resultado se publica
- decide qué versión llega a qué entorno
- decide con qué credenciales se actúa
- decide qué parte del sistema recibe cambios
- deja o no deja trazabilidad suficiente de lo ocurrido

Podría resumirse así:

- desplegar software parece una función operativa
- controlar la cadena de entrega implica participar en la definición de qué software y qué configuración se vuelven legítimos para el sistema

La idea importante es esta:

> el pipeline no solo mueve bits; también mueve autoridad sobre qué entra en ejecución con confianza alta.

---

## Qué actores suelen participar en esta superficie

Hay varios actores relevantes alrededor de CI/CD y artefactos.

### Actores humanos

Por ejemplo:
- desarrolladores
- operadores
- platform engineers
- administradores de repositorios
- personas con permisos sobre pipelines
- personas que aprueban promociones o despliegues

### Actores técnicos

Por ejemplo:
- runners
- cuentas de servicio
- herramientas de CI/CD
- registries
- orquestadores
- sistemas de firma o publicación
- servicios cloud conectados a deploy
- bots o automatizaciones

### Actores externos o semiexternos

Por ejemplo:
- proveedores SaaS de CI/CD
- registries externos
- herramientas de seguridad integradas
- plataformas de build
- sistemas que almacenan artefactos

La idea importante es esta:

> la cadena de entrega es un punto donde actores humanos, técnicos y de terceros se cruzan con mucho poder acumulado.

---

## Qué tipos de poder concentra un pipeline

Un pipeline o cadena de entrega puede concentrar varias clases de poder al mismo tiempo.

### Poder de construir

Determina qué binario, imagen o artefacto final se genera.

### Poder de publicar

Decide qué queda disponible para ser consumido por otros sistemas o entornos.

### Poder de desplegar

Puede tocar staging, producción u otros ambientes con cambios automáticos o semiautomáticos.

### Poder de usar credenciales

A menudo accede a:
- secretos
- tokens
- cuentas de servicio
- registries
- cloud APIs
- herramientas operativas

### Poder de amplificar confianza

Porque una vez que un artefacto sale por el camino “oficial”, muchas otras piezas del sistema lo aceptan con bastante legitimidad.

La idea importante es esta:

> pocas superficies reúnen al mismo tiempo construcción, publicación, despliegue y confianza como lo hace una cadena de entrega.

---

## Por qué los artefactos también importan como objeto de riesgo

No solo importa el pipeline; también importan los **artefactos**.

Porque el artefacto es, en muchos casos, la forma concreta en que el sistema termina ejecutando algo:

- una imagen
- un binario
- un paquete
- un release
- un build output
- una configuración empaquetada
- un manifiesto de despliegue

Y sobre ese artefacto suelen apoyarse preguntas muy delicadas:

- ¿de dónde salió?
- ¿qué lo construyó?
- ¿qué contiene realmente?
- ¿qué dependencias arrastra?
- ¿qué confianza merece?
- ¿en qué entorno terminó?
- ¿qué parte del sistema lo aceptó como válido?

La lección importante es esta:

> cuando la confianza sobre el artefacto es alta pero la visibilidad sobre su origen o recorrido es baja, la cadena de entrega se vuelve mucho más riesgosa.

---

## Por qué esta superficie suele subestimarse

Se suele subestimar por varias razones.

### Porque parece “solo DevOps”

Entonces se la piensa como eficiencia o automatización, no como núcleo de seguridad.

### Porque está fuera del flujo visible del usuario

No se ve en la interfaz, así que parece menos cercana al daño.

### Porque el pipeline exitoso da sensación de orden

Si “todo despliega bien”, puede parecer que la zona está controlada.

### Porque la confianza está muy naturalizada

Se asume algo como:
- “si viene del pipeline oficial, está bien”
- “si está en el registry, ya es confiable”
- “si pasó CI, ya quedó legitimado”

La lección importante es esta:

> la cadena de entrega se vuelve especialmente peligrosa cuando la organización la considera demasiado normal como para cuestionar cuánto poder acumuló.

---

## Relación con supply chain

Este tema está en el centro de la supply chain porque el pipeline es uno de los lugares donde muchas piezas de la cadena convergen:

- código propio
- dependencias
- transitivas
- imágenes base
- herramientas externas
- credenciales
- automatizaciones
- registries
- proveedores SaaS
- artefactos finales

Es decir:

> la cadena de entrega es uno de los puntos donde el riesgo heredado se convierte en software efectivamente construido, publicado y desplegado.

Y eso la vuelve especialmente crítica.

---

## Relación con confianza extendida

También se conecta directamente con la confianza extendida.

Porque la organización suele confiar en que:

- el pipeline ejecuta lo correcto
- el runner actúa como se espera
- el artefacto representa lo que creemos
- el registry almacena lo que debería
- la promoción entre entornos respeta fronteras
- las credenciales de deploy se usan solo con el alcance esperado

La idea importante es esta:

> toda esa confianza puede ser razonable, pero no deja de ser confianza delegada y altamente sensible, y por eso debe entrar de lleno en el análisis.

---

## Relación con arquitectura segura

Este tema también toca arquitectura segura de forma muy concreta.

Porque la forma en que diseñamos CI/CD afecta cuestiones como:

- separación entre entornos
- mínimo privilegio de cuentas técnicas
- aislamiento entre stages
- capacidad de revocar
- trazabilidad de cambios
- visibilidad de promociones
- dificultad para contener incidentes de build o deploy

La lección importante es esta:

> un pipeline no es solo una herramienta externa al sistema; también es una extensión operativa de su arquitectura y de su modelo de poder.

---

## Relación con detección y respuesta

CI/CD y artefactos también importan mucho para detección y respuesta.

Preguntas clave en incidentes reales suelen ser:

- ¿qué artefacto llegó realmente a producción?
- ¿quién lo promovió?
- ¿qué pipeline lo generó?
- ¿qué secretos o cuentas se usaron?
- ¿qué jobs tocaron qué entornos?
- ¿qué tan rápido podemos revocar o pausar esa cadena?
- ¿qué visibilidad tenemos sobre builds, promotions y despliegues?

La idea importante es esta:

> una mala trazabilidad en la cadena de entrega vuelve mucho más difícil reconstruir y contener cambios peligrosos o inesperados.

---

## Relación con contención

Este tema también es muy importante desde contención.

Porque si la cadena de entrega está demasiado centralizada o demasiado acoplada, cortar un problema puede ser muy costoso.

Por ejemplo, puede costar:
- pausar un pipeline sin frenar demasiado
- revocar una cuenta técnica sin romper varios flujos
- separar qué artefactos o promociones son confiables y cuáles no
- contener daño si un registry, un runner o una credencial de deploy se vuelven problemáticos

La lección importante es esta:

> cuanto más poder y menos separación tiene la cadena de entrega, más difícil puede ser contenerla sin gran daño operativo cuando algo sale mal.

---

## Ejemplo conceptual simple

Imaginá una organización que tiene buenas prácticas en su aplicación, pero cuya cadena de entrega:

- usa credenciales muy amplias
- promueve cambios entre entornos con pocas barreras
- confía mucho en tooling externo
- no deja suficiente trazabilidad
- y construye artefactos que luego todos aceptan casi automáticamente

A simple vista, la app puede parecer bien protegida.  
Pero el sistema real tiene una zona crítica adicional:

- la fábrica
- el canal de distribución
- y el mecanismo que decide qué entra en ejecución con confianza alta

Ese es el corazón del tema:

> proteger bien el software sin proteger bien la cadena que lo construye y lo entrega deja abierta una parte muy sensible del problema.

---

## Qué preguntas ayudan a mirar mejor esta superficie

Hay preguntas muy útiles para empezar.

### Sobre poder
- ¿qué puede construir, publicar o desplegar realmente este pipeline?

### Sobre alcance
- ¿qué entornos toca?
- ¿qué secretos usa?
- ¿qué cuentas técnicas emplea?

### Sobre confianza
- ¿qué artefactos aceptamos como legítimos y por qué?
- ¿qué parte de esa confianza está demasiado automatizada o poco visible?

### Sobre terceros
- ¿qué tooling o proveedor externo participa de esta cadena con autoridad sensible?

### Sobre contención
- si mañana esta cadena se volviera problemática, ¿qué podríamos cortar rápido y qué sería muy difícil?

La idea importante es esta:

> estas preguntas ayudan a dejar de ver CI/CD como “infraestructura de entrega” y empezar a verlo también como superficie crítica de confianza, autoridad y daño posible.

---

## Qué señales muestran que esta etapa está débil

Hay varias pistas bastante claras.

### Ejemplos conceptuales

- pipelines con credenciales demasiado amplias
- poca claridad sobre qué artefacto llegó a qué entorno
- tooling de deploy tratado como zona puramente operativa y no como riesgo crítico
- dificultad para explicar qué proveedores o servicios externos participan en builds y promotions
- separación débil entre etapas o entre entornos dentro de la cadena
- baja trazabilidad sobre quién aprobó, disparó o promovió cambios sensibles
- sensación de que “si pasó por CI/CD ya está bien” sin mirar demasiado cómo opera realmente esa confianza

La idea importante es esta:

> cuando la cadena de entrega concentra mucho poder pero recibe poco pensamiento adversarial, el sistema probablemente tiene una ceguera importante en una de sus zonas más delicadas.

---

## Qué puede hacer una organización para mejorar

Desde una mirada defensiva, algunas ideas clave son:

- tratar CI/CD, runners, registries y artefactos como parte explícita del modelo de amenazas
- revisar qué cuentas técnicas, secretos y entornos participan en la cadena de entrega
- identificar qué tooling externo recibe poder real sobre builds, promotions o despliegues
- mejorar separación entre etapas, entornos y capacidades dentro del pipeline
- reforzar trazabilidad sobre construcción, publicación y despliegue
- pensar con anticipación cómo contener problemas en la cadena sin paralizar innecesariamente toda la operación
- asumir que una cadena de entrega muy confiada y muy automatizada merece tanto análisis como cualquier panel o API crítica

La idea central es esta:

> una organización madura no solo asegura lo que corre en producción; también asegura la cadena que decide qué llega a producción y con qué legitimidad.

---

## Error común: pensar que CI/CD es solo una cuestión de productividad

No.

También es una cuestión de:

- autoridad
- integridad
- confianza
- separación
- credenciales
- trazabilidad
- contención

La productividad importa, claro.  
Pero no agota ni de cerca el problema.

---

## Error común: creer que si el pipeline está automatizado, entonces es más seguro por definición

No necesariamente.

La automatización puede ayudar mucho, pero también puede:

- amplificar errores
- hacer más rápida una cadena peligrosa
- extender confianza sin suficiente fricción
- ocultar mejor el poder real que concentra el proceso

Automatizar no reemplaza modelar.

---

## Idea clave del tema

CI/CD, build pipelines y artefactos forman una superficie crítica de ataque porque concentran construcción, publicación, despliegue, credenciales y confianza sobre qué software o configuración se considera legítimo para entrar en ejecución.

Este tema enseña que:

- la cadena de entrega es parte del sistema real y de su riesgo real
- tooling de build y deploy puede recibir poder operativo muy alto
- los artefactos importan porque materializan confianza sobre lo que se ejecuta
- una organización madura modela amenazas también sobre cómo fabrica, promueve y entrega software, no solo sobre el software ya desplegado

---

## Resumen

En este tema vimos que:

- la cadena de entrega incluye herramientas, procesos, artefactos, cuentas y proveedores que construyen y despliegan software
- esta superficie concentra mucha autoridad y mucha confianza
- CI/CD y artefactos están en el centro del riesgo de supply chain
- la seguridad aquí se conecta con arquitectura, terceros, trazabilidad y contención
- el riesgo suele subestimarse cuando se lo mira solo como automatización o productividad
- la defensa madura protege también la fábrica y el camino de legitimación del software que llega a ejecución

---

## Ejercicio de reflexión

Pensá en un sistema con:

- repositorio
- CI/CD
- runners
- registries
- artefactos
- cuentas técnicas
- credenciales de despliegue
- staging y producción
- tooling externo de build o deploy

Intentá responder:

1. ¿qué parte de la cadena de entrega concentra más poder real?
2. ¿qué credenciales o secretos usados en build o deploy te parecen más delicados?
3. ¿qué diferencia hay entre proteger la app y proteger la cadena que decide qué app llega a ejecutarse?
4. ¿qué tercero o herramienta externa participa con más autoridad de la que parece?
5. ¿qué revisarías primero para mejorar separación, trazabilidad o contención en esta cadena?

---

## Autoevaluación rápida

### 1. ¿Qué es la cadena de entrega en este contexto?

Es el conjunto de procesos, herramientas, credenciales y artefactos que construyen, publican y despliegan software o configuración.

### 2. ¿Por qué CI/CD es una superficie crítica de riesgo?

Porque puede tocar entornos sensibles, usar credenciales potentes, introducir cambios amplios y decidir qué artefacto entra en ejecución con alta confianza.

### 3. ¿Por qué los artefactos también importan?

Porque representan el resultado concreto que el sistema acepta como legítimo para ejecutar, y su origen, recorrido y promoción influyen en integridad y trazabilidad.

### 4. ¿Qué defensa ayuda mucho a mejorar esta etapa?

Modelar la cadena de entrega como parte del sistema crítico, revisar su poder real y reforzar separación, visibilidad y capacidad de contención sobre builds, promociones y despliegues.

---

## Próximo tema

En el siguiente tema vamos a estudiar **servicios cloud gestionados: comodidad, delegación y nuevos supuestos de confianza**, para entender por qué usar servicios administrados no elimina el riesgo, sino que reubica parte del control, la visibilidad y la autoridad en capas que también necesitan modelado serio.
