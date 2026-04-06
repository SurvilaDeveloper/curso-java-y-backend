---
title: "CSP y recursos externos"
description: "Cómo pensar Content-Security-Policy cuando una aplicación Java con Spring Boot carga scripts, estilos, imágenes o widgets desde orígenes externos. Por qué cada dependencia remota amplía superficie, cómo afecta la política CSP y qué preguntas conviene hacerse antes de permitir recursos de terceros."
order: 110
module: "HTTP, headers y superficie del navegador"
level: "base"
draft: false
---

# CSP y recursos externos

## Objetivo del tema

Entender cómo pensar **Content-Security-Policy** cuando una aplicación Java + Spring Boot depende de **recursos externos** cargados por el navegador.

La idea es bajar CSP a un problema muy concreto y cotidiano.

Muchas aplicaciones web terminan cargando cosas como:

- scripts desde CDNs
- estilos externos
- fuentes remotas
- analítica
- widgets de chat
- mapas
- SDKs de terceros
- iframes
- librerías embebidas
- recursos desde otros subdominios o proveedores

Todo eso puede parecer normal.
Y muchas veces lo es.
Pero cada origen adicional al que le permitís participar en tu página cambia bastante la superficie real.

En resumen:

> una CSP se vuelve mucho más importante —y también mucho más difícil— cuando la página depende de recursos externos.  
> Porque cada dominio permitido es, en la práctica, otro lugar al que le estás confiando parte del comportamiento del navegador.

---

## Idea clave

CSP intenta responder preguntas como:

- ¿desde dónde puede cargar scripts esta página?
- ¿desde dónde puede cargar estilos?
- ¿qué imágenes o fuentes acepta?
- ¿qué conexiones puede abrir?
- ¿qué frames o contenido embebido son válidos?

Cuando tu app depende de recursos externos, la respuesta deja de ser algo como:

- “solo desde nuestro propio origen”

y pasa a ser una lista más larga, más compleja y más delicada.

La idea central es esta:

> cada recurso externo permitido no solo agrega funcionalidad.  
> También agrega confianza delegada.

Y esa confianza rara vez es gratis.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- permitir muchos dominios externos por comodidad
- agregar excepciones a la CSP sin revisar el costo real
- tratar CDNs, SDKs o widgets como si fueran invisibles desde seguridad
- abrir demasiado `script-src`, `style-src`, `img-src`, `connect-src` o `frame-src`
- aceptar dependencias remotas solo porque “todo el mundo las usa”
- olvidar que cada tercero puede cambiar, fallar o introducir comportamiento inesperado
- diseñar una política tan laxa que ya no restrinja casi nada
- no distinguir entre un recurso externo realmente necesario y otro agregado por inercia

Es decir:

> el problema no es solo “tener CSP”.  
> El problema también es qué tan amplia termina siendo cuando la página confía en demasiados lugares externos.

---

## Error mental clásico

Un error muy común es este:

### “Es solo un script externo” o “es solo un CDN”

Eso minimiza demasiado el problema.

Porque un recurso externo, sobre todo si es activo, no es “solo un archivo”.
Es una parte del comportamiento de tu página que ahora depende de otro origen.

### Eso puede implicar

- confianza en otro dominio
- dependencia de otro proveedor
- más superficie de ejecución
- más impacto si ese recurso cambia o se compromete
- más excepciones en tu CSP
- más dificultad para entender qué está permitiendo realmente la página

### Idea importante

Cada vez que abrís una directiva para un tercero, estás ampliando el perímetro de confianza del navegador.

---

## No todos los recursos externos pesan igual

Esta distinción ayuda mucho.

No es lo mismo permitir:

- una imagen estática desde un CDN

que permitir:

- un script remoto que participa activamente de la página

### Porque el impacto cambia muchísimo

Un recurso activo puede:

- ejecutar lógica
- manipular DOM
- observar eventos
- hacer requests
- influir en UX
- cambiar flujos
- abrir más superficie del lado del cliente

### Idea útil

En CSP, no todos los “orígenes externos” equivalen al mismo nivel de riesgo.
Los scripts y otros recursos activos suelen ser mucho más delicados que contenidos meramente decorativos.

---

## Scripts externos: donde la confianza se vuelve más seria

Cuando una app permite scripts desde orígenes externos, la conversación ya no es solo de carga de recursos.
Pasa a ser una conversación de:

- ejecución
- integridad
- confianza
- dependencia operativa
- superficie del navegador

### Preguntas útiles

- ¿ese script necesita existir?
- ¿qué hace realmente?
- ¿quién lo controla?
- ¿cuánto cambia?
- ¿qué pasaría si se comprometiera?
- ¿qué tan difícil sería quitarlo?

### Idea importante

Permitir `script-src` hacia terceros es una de las decisiones más sensibles dentro de CSP.

---

## Styles externos y laxa dependencia visual

Los estilos externos parecen menos peligrosos que los scripts.
Y, en general, pueden serlo.
Pero igual amplían superficie y dependencia.

### Porque también pueden implicar

- apertura de `style-src`
- carga desde terceros
- comportamiento visual dependiente de otro origen
- más complejidad para razonar qué entra en la página y desde dónde

### Regla sana

No trates los estilos externos como si fueran automáticamente inocentes.
Suelen ser menos delicados que scripts, pero igual ensanchan la política.

---

## Imágenes externas: menos riesgo activo, más fuga y más superficie

Las imágenes externas muchas veces se ven como inofensivas.
Pero también tienen implicancias.

### Por ejemplo

- más dominios permitidos
- más metadata de navegación expuesta
- más dependencias de terceros
- más complejidad en `img-src`
- posibilidad de tracking o correlación
- más superficie difícil de auditar a largo plazo

### Idea útil

No hace falta demonizar toda imagen externa.
Pero sí conviene reconocer que cada excepción también cuesta en control y claridad.

---

## Fuentes, medios y otros recursos

Lo mismo vale para:

- fuentes web
- audio
- video
- archivos auxiliares
- media desde orígenes remotos

### Idea importante

Aunque no todos tengan el mismo peso que los scripts, cada tipo de recurso externo:

- amplía directivas
- agrega confianza
- complica la política
- y hace más difícil mantener una CSP corta, explícita y fuerte

---

## Widgets y SDKs: el lugar donde la CSP suele empezar a ensancharse demasiado

Muchas apps modernas cargan cosas como:

- analytics
- chat
- mapas
- widgets de pagos
- scripts de marketing
- captchas
- feedback tools
- reproductores
- embeds

Cada uno de esos agregados suele venir con exigencias de CSP.

### Y ahí aparece el patrón típico

- se agrega un proveedor
- se abre una excepción
- luego otro
- luego otro
- y la política se vuelve una lista enorme de dominios y permisos difícil de justificar

### Idea importante

La CSP mala no suele nacer de una sola gran apertura.
Suele degradarse por acumulación de pequeñas excepciones cómodas.

---

## Cada tercero también es una dependencia de seguridad

Esto conviene decirlo de frente.

Cuando tu página depende de un tercero para cargar algo, no solo estás aceptando una dependencia funcional.
También aceptás una dependencia de seguridad.

### Porque si ese tercero

- cambia
- falla
- queda comprometido
- sirve algo inesperado
- agrega nuevos comportamientos
- redirecciona o migra dominios

la política de tu página y su comportamiento real pueden cambiar bastante.

### Regla sana

Cada dominio permitido debería ser defendible no solo por utilidad, sino por confianza razonable.

---

## Más recursos externos = CSP más compleja

Este punto es simple, pero muy real.

Cuantos más recursos externos necesita tu app:

- más larga tiende a ser la política
- más difícil es entenderla
- más excepciones acumula
- más difícil es mantenerla
- más chances hay de que alguien la abra demasiado “porque algo se rompía”
- más difícil es auditar si cada permiso sigue teniendo sentido

### Idea importante

Una buena CSP suele correlacionar con una superficie web más ordenada y con menos dependencias externas innecesarias.

---

## La política no debería crecer por inercia

Muchas veces el proceso real es este:

- algo no carga
- alguien mira la consola
- agrega un dominio a la directiva correspondiente
- “anda”
- y nadie vuelve a revisar si era necesario o si había otra forma mejor

Ese ciclo, repetido muchas veces, produce CSPs muy frágiles.

### Regla sana

No abras directivas solo porque “lo pidió la consola”.
Preguntate siempre:

- ¿qué es este recurso?
- ¿por qué lo necesitamos?
- ¿qué riesgo agrega?
- ¿hay una alternativa menos amplia?

---

## No todos los dominios de un proveedor significan lo mismo

Otro error frecuente es abrir de forma demasiado amplia porque “es del mismo proveedor”.

Por ejemplo, pensar:

- “si usamos un recurso de X, abramos todo X”
- “si usamos un CDN de Y, dejemos muchos subdominios por las dudas”

### Problema

Eso puede convertir una necesidad puntual en una política demasiado abierta.

### Idea importante

La granularidad importa.
Cuanto más amplio sea el permiso, más terreno le estás cediendo a contenido externo.

---

## CSP también obliga a conocer mejor el frontend real

Una política buena no puede diseñarse solo desde teoría.
Necesita entender qué carga de verdad la página.

Por eso, cuando revisás recursos externos, conviene saber:

- qué orígenes se usan
- para qué se usan
- en qué pantallas aparecen
- si son críticos o accesorios
- si están vivos o son legado
- si podrían eliminarse
- qué directiva exacta están ensanchando

### Idea útil

CSP y recursos externos obligan al equipo a dejar de pensar el frontend como “caja negra que ya traerá lo que necesite”.

---

## A veces el mejor endurecimiento es quitar un tercero

Esto es muy importante.

No siempre la mejor mejora es escribir una política más ingeniosa.
A veces la mejor mejora es:

- dejar de usar ese script
- quitar ese widget
- autoalojar cierto recurso
- unificar dependencias
- reducir CDNs
- sacar un proveedor de marketing que aporta poco y abre mucho

### Regla sana

La CSP más fuerte suele aparecer cuando el producto depende de menos sitios ajenos, no cuando la lista de excepciones está mejor maquillada.

---

## Recursos externos y privacidad

Además del lado de ejecución, los recursos externos también pueden implicar:

- más tracking
- más correlación
- más referrers
- más carga hacia terceros
- más exposición del comportamiento del usuario

### Idea importante

Permitir recursos externos no solo afecta seguridad técnica del navegador.
También puede afectar privacidad y exposición de navegación.

---

## No es solo “qué se carga”, también “qué se conecta”

Otra parte importante de CSP suele tocar conexiones salientes hechas por la página.

Eso importa cuando el frontend o la SPA habla con:

- APIs
- websockets
- endpoints de analítica
- servicios de terceros
- backends auxiliares

### Idea útil

La política de recursos no es solo visual o estática.
También define con qué destinos puede conversar la página desde el navegador.

---

## Frames y recursos externos

Cuando la app embebe contenido de terceros o permite ser embebida, la conversación se vuelve todavía más sensible.

Porque ya no hablamos solo de scripts o imágenes, sino de:

- documentos completos
- interfaces ajenas
- contextos de navegación mixtos
- confianza visual y operativa delegada

### Regla sana

Si hay iframes o contenido embebido, las preguntas de CSP y de framing deberían revisarse juntas, no por separado.

---

## Si la política se vuelve enorme, quizá la app te está diciendo algo

Esto es una observación práctica muy valiosa.

Una CSP larguísima y llena de excepciones puede ser señal de:

- demasiados terceros
- frontend poco disciplinado
- integraciones acumuladas sin depuración
- dependencia fuerte de defaults o scripts remotos
- poca claridad sobre qué es realmente necesario

### Idea importante

La política no solo protege.
También revela el nivel de orden o desorden de la superficie web.

---

## Qué conviene revisar en una app Spring

Cuando revises CSP y recursos externos en una aplicación Spring, mirá especialmente:

- qué scripts externos carga la app
- qué estilos, imágenes y fuentes vienen de terceros
- qué widgets o SDKs están presentes
- qué servicios de analítica o marketing participan
- qué iframes o embeds existen
- qué conexiones externas realiza la página
- qué orígenes aparecen en la política actual
- cuáles son realmente indispensables
- qué terceros podrían eliminarse o acotarse
- qué excepciones fueron agregadas por costumbre y no por necesidad clara

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- pocos terceros realmente necesarios
- política relativamente corta y entendible
- mejor distinción entre recursos activos y pasivos
- menos apertura de `script-src` por costumbre
- menos widgets o SDKs agregados sin revisión
- más conciencia sobre el costo de confiar en otros orígenes
- mejor alineación entre producto real y CSP enviada

---

## Señales de ruido

Estas señales merecen revisión rápida:

- muchos dominios externos agregados “porque sí”
- nadie sabe por qué ciertos orígenes están permitidos
- scripts de terceros con justificación floja
- política enorme y difícil de leer
- cada problema de carga se resuelve agregando más dominios
- dependencias externas que nadie se anima a quitar
- el equipo no distingue cuáles recursos externos son críticos y cuáles son puro legado
- la CSP parece más un cementerio de excepciones que una política de seguridad

---

## Checklist práctico

Cuando revises CSP y recursos externos, preguntate:

- ¿qué terceros carga realmente mi página?
- ¿cuáles de esos terceros ejecutan contenido activo?
- ¿cuáles podrían eliminarse sin mucho costo?
- ¿qué directivas se están abriendo por cada recurso externo?
- ¿estamos confiando demasiado en CDNs, SDKs o widgets?
- ¿qué apertura de la política es la más riesgosa y menos justificada?
- ¿qué tercero tendría más impacto si se comprometiera?
- ¿qué parte del equipo entiende de verdad por qué cada dominio está permitido?
- ¿la política actual es una decisión consciente o el resultado de sumar excepciones?
- ¿qué reducirías primero para hacer la CSP más corta, más clara y más fuerte?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Qué recursos externos carga hoy?
2. ¿Cuáles son scripts activos y cuáles no?
3. ¿Qué tercero te da menos confianza?
4. ¿Qué dominio permitido no sabés bien por qué sigue ahí?
5. ¿Qué widget o SDK aporta poco y abre mucho?
6. ¿Qué parte de tu CSP actual existe solo porque se fue acumulando?
7. ¿Qué recurso externo quitarías primero para mejorar más tu postura de seguridad?

---

## Resumen

CSP y recursos externos están profundamente conectados porque cada origen adicional permitido en la política amplía el perímetro de confianza del navegador.

No todos los recursos externos tienen el mismo riesgo, pero en general:

- más terceros
- más scripts remotos
- más widgets
- más excepciones

significa también:

- más complejidad
- más dependencia
- más superficie
- y una CSP más difícil de volver realmente restrictiva

En resumen:

> un backend más maduro no usa CSP solo para listar todo lo que el frontend ya venía cargando y resignarse a ello.  
> También la usa como excusa sana para preguntarse qué terceros y qué recursos externos son realmente necesarios, porque entiende que cada dominio permitido no es una línea más de configuración: es otra frontera de confianza que la página le pide al navegador que acepte.

---

## Próximo tema

**CSP y scripts inline**
