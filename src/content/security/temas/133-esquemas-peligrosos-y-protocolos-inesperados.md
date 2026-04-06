---
title: "Esquemas peligrosos y protocolos inesperados"
description: "Cómo pensar esquemas peligrosos y protocolos inesperados al analizar SSRF en una aplicación Java con Spring Boot. Por qué no alcanza con validar solo host y dominio, y qué cambia cuando el backend o sus librerías aceptan destinos más allá de HTTP y HTTPS."
order: 133
module: "Consumo saliente, SSRF y conexiones externas"
level: "base"
draft: false
---

# Esquemas peligrosos y protocolos inesperados

## Objetivo del tema

Entender por qué, al analizar **SSRF** en una aplicación Java + Spring Boot, no alcanza con pensar solo en:

- host
- dominio
- IP
- redirects
- redes internas

También importa una pregunta anterior:

> **¿con qué esquema o protocolo está dispuesto a interpretar el destino el backend?**

La idea de este tema es corregir otra simplificación muy común.

Cuando se revisa una feature saliente, muchos equipos se enfocan en cosas como:

- si la URL apunta a un dominio permitido
- si no es localhost
- si no es una IP privada
- si parece externa
- si el callback se ve razonable

Pero a veces ni siquiera revisan algo básico:

- si la librería o el flujo aceptan solo `http` y `https`
- o si podrían interpretar otros esquemas inesperados

En resumen:

> en SSRF no solo importa **a dónde** se conecta el backend.  
> También importa **cómo interpreta** el destino que le pasaron y qué protocolos está dispuesto a usar en esa salida.

---

## Idea clave

Una URL o un destino remoto no está definido solo por el host.
También tiene un **esquema**, es decir, la parte que suele verse al comienzo, por ejemplo:

- `http://`
- `https://`

La intuición útil es esta:

> si una funcionalidad fue pensada para “consultar una web” o “descargar un recurso remoto”, normalmente debería trabajar con un conjunto muy acotado de esquemas, no con cualquier cosa que una librería acepte interpretar.

La idea central es esta:

> cada esquema adicional que el backend acepta amplía la superficie saliente y puede cambiar por completo el tipo de recurso o comportamiento que la aplicación termina consumiendo.

Y eso puede volver mucho más difícil razonar qué está permitido de verdad.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- asumir que toda URL relevante será `http` o `https`
- no validar explícitamente el esquema esperado
- dejar que una librería o cliente acepte protocolos no contemplados
- pensar que si el host es seguro entonces el destino completo ya lo es
- subestimar que un esquema diferente puede cambiar totalmente la naturaleza del recurso alcanzado
- revisar allowlists de dominio sin revisar antes si el protocolo mismo es el correcto
- olvidar que algunas librerías o componentes pueden soportar más de lo que el equipo cree

Es decir:

> el problema no es solo qué dominio o IP se usa.  
> El problema también es si el sistema está dispuesto a interpretar ese input como un tipo de recurso distinto del que el negocio realmente quería consumir.

---

## Error mental clásico

Un error muy común es este:

### “Si el host está bien validado, lo demás no debería cambiar tanto”

Eso es demasiado optimista.

Porque el host responde solo una parte de la pregunta.
Todavía importa:

- qué esquema se acepta
- qué hace la librería con ese esquema
- si el recurso sigue siendo realmente “una web externa”
- o si de repente el backend está tratando de leer otra clase de cosa

### Idea importante

Validar host sin validar esquema es parecido a validar “adónde vas” sin validar “por qué tipo de puerta estás entrando”.

---

## Por qué el esquema cambia tanto el riesgo

Muchos equipos piensan la salida del backend como si siempre fuera:

- una request HTTP/HTTPS
- a un servicio externo
- devolviendo un cuerpo que entendemos más o menos bien

Pero un esquema distinto puede cambiar radicalmente eso.

Puede hacer que la app o la librería intenten:

- leer otro tipo de recurso
- abrir una clase distinta de conexión
- tratar el destino con otra semántica
- salirse del modelo mental que el equipo estaba usando al diseñar la feature

### Idea importante

SSRF no se vuelve más riesgosa solo por llegar a otro host.
También puede volverse más riesgosa porque el **tipo de acceso** ya no es el que el sistema creía estar ofreciendo.

---

## No todo input con forma de URL debería aceptarse igual

Otra intuición útil es esta:

si una feature de negocio dice algo como:

- “traer una web”
- “hacer preview”
- “validar un callback HTTP”
- “descargar un archivo remoto por web”
- “consultar una API externa”

entonces normalmente el contrato de negocio ya está bastante cerca de decir:

- `http`
- `https`

No debería haber demasiada ambigüedad.

### Regla sana

Si el caso de uso es web, aceptar esquemas fuera de HTTP/HTTPS suele ser una señal de superficie innecesaria.

---

## El problema de los protocolos inesperados

A veces el equipo no “decide” aceptar esquemas extra.
Simplemente no los bloquea, o asume que la librería no los soporta, o nunca revisa qué pasa si aparecen.

Ahí nacen los **protocolos inesperados**:

- no porque el negocio los quisiera
- sino porque nadie limitó explícitamente la interpretación del destino

### Idea importante

Una buena parte de la superficie peligrosa nace más de omisión que de intención.

---

## Esquema esperado vs esquema efectivamente soportado

Este contraste ayuda mucho a auditar.

### Esquema esperado
Lo que el producto realmente necesita para esa funcionalidad.

### Esquema efectivamente soportado
Lo que acepta:
- el parser
- la librería
- el cliente HTTP
- el componente de descarga
- el runtime
- o la cadena completa hasta llegar a la conexión

### Idea útil

Muchas veces el riesgo aparece justo cuando la segunda lista es más amplia que la primera y nadie lo había advertido.

---

## HTTP y HTTPS: la base razonable en muchos casos

Para la enorme mayoría de features web orientadas a integrar o consultar recursos remotos, lo razonable suele ser:

- permitir solo `http`
- o preferentemente `https`
- según el caso de uso real

### ¿Por qué?

Porque eso mantiene más estable el modelo mental:
- web
- request saliente clara
- comportamiento esperable
- controles más entendibles

### Idea importante

No es que otros esquemas sean “malos” por definición.
Es que, si no son necesarios para el negocio, suelen ser superficie gratis.

---

## Qué vuelve peligrosos a los esquemas no esperados

Los esquemas no esperados importan porque pueden hacer que la aplicación deje de interactuar con:

- una web remota clásica

y empiece a interactuar con:

- otro tipo de recurso
- otra semántica de acceso
- otro entorno
- otra fuente de datos
- otra clase de endpoint

### Idea útil

El problema no es solo “otro protocolo”.
Es que ese protocolo puede sacar la request del terreno que el equipo había pensado al diseñar el feature.

---

## No se trata de memorizar todos los esquemas raros

Para este curso no hace falta construir un catálogo exhaustivo ni recordar todos los nombres posibles.

La intuición importante es mucho más simple:

> si una funcionalidad solo necesita web externa, todo lo que quede fuera de ese contrato debería partir con sospecha.

### Regla sana

No diseñes defensas pensando:
- “¿qué esquemas raros me faltó listar?”

Diseñalas pensando:
- “¿qué esquemas necesito realmente para este caso de uso?”

---

## “El parser lo acepta” no significa “el negocio lo necesita”

Esto pasa mucho cuando el equipo usa una librería genérica que sabe interpretar URLs o URIs y luego concluye, sin querer, que cualquier esquema parseable entra dentro de la feature.

### Problema

Que una herramienta pueda parsear algo no significa que tu producto deba aceptarlo.
Y que una librería pueda intentar resolverlo no significa que tu backend deba permitirlo.

### Idea importante

Capacidad técnica del framework no equivale a permiso de negocio.

---

## Esquema y host son dos controles distintos

Otra mejora mental importante es dejar de pensar que todo se reduce a la validación del host.

Conviene separar dos preguntas:

## 1. ¿Qué tipo de destino aceptamos?
Eso lo define mucho el esquema.

## 2. ¿A qué lugar concreto aceptamos salir?
Eso lo definen más host, resolución, redirects y red real.

### Idea útil

Si uno de esos dos controles falta, la defensa queda incompleta.

---

## Allowlists de dominio no compensan esquemas flojos

Esto conecta con el tema anterior.

Una feature podría tener allowlist de hosts bastante razonable.
Pero si no limita bien el esquema, igual puede estar dejando pasar interpretaciones del destino que el negocio nunca quiso soportar.

### Regla sana

Primero preguntate:
- ¿qué esquemas son válidos?

Después:
- ¿qué destinos concretos dentro de esos esquemas son válidos?

### Idea importante

La allowlist de host no reemplaza la allowlist implícita o explícita de protocolo.

---

## Redirects pueden cambiar también el esquema

No solo cambia el host con redirects.
A veces también puede cambiar el tipo de recurso o el esquema con el que termina tratándose el destino.

### Entonces la pregunta ya no es solo
- “¿a qué host redirigió?”

Sino también:
- “¿seguimos dentro de los esquemas que la feature estaba autorizada a usar?”

### Idea útil

El recorrido completo de la request importa tanto en host como en esquema.

---

## Parsing, normalización y confianza excesiva

Otro lugar donde este tema se vuelve delicado es en cómo el sistema:

- parsea
- normaliza
- reescribe
- reconstruye
- o serializa

el destino antes de usarlo.

### Porque a veces el equipo valida una cosa
pero luego el cliente o la librería interpreta otra con más flexibilidad de la prevista.

### Idea importante

En SSRF, las diferencias entre:
- “lo que creímos leer”
- y “lo que el sistema terminó usando”
también pueden aparecer a nivel de esquema.

---

## Features típicas donde esto importa mucho

Este tema merece sospecha especial en funcionalidades como:

- importación desde URL
- descarga remota de archivos
- previews
- scrapers
- validación de callbacks
- conectores configurables
- proxys de contenido
- utilidades admin de test de conexión
- cualquier flujo donde se use una librería genérica sobre un input con forma de URL

### Idea útil

Cuanto más genérica es la funcionalidad, más importante es cortar temprano los esquemas no necesarios.

---

## Qué preguntas conviene hacer en una revisión

Cuando revises una superficie de SSRF, conviene preguntar:

- ¿qué esquemas espera realmente esta feature?
- ¿eso está explicitado o se asume?
- ¿qué esquemas acepta el parser?
- ¿qué esquemas acepta el cliente o la librería final?
- ¿qué pasa en redirects?
- ¿el control de esquema ocurre antes de resolver o conectar?
- ¿hay algún comportamiento “sorpresa” si llega un esquema no esperado?
- ¿el equipo confunde “parseable” con “permitido”?

### Regla sana

Si nadie puede responder claramente cuáles son los esquemas válidos de una feature, ya hay una superficie innecesariamente borrosa.

---

## No toda flexibilidad es buena

A veces el equipo piensa:
- “cuanto más genérico sea el componente, mejor”

Eso puede ser útil desde reutilización.
Pero también puede ser peligroso si el componente pasa a aceptar destinos de formas demasiado amplias sin que el negocio lo necesite.

### Idea importante

En consumo saliente, la genericidad mal controlada suele ampliar la superficie de SSRF.

---

## Qué conviene revisar en una codebase Spring

Cuando revises esquemas peligrosos y protocolos inesperados en una aplicación Spring, mirá especialmente:

- dónde se parsean `URI` o `URL`
- qué clientes HTTP o librerías consumen el destino final
- si hay validación explícita de esquema
- si el negocio realmente necesita algo más que `http` o `https`
- qué pasa con redirects
- si el flujo acepta inputs con forma de URL pero nunca explicita el protocolo permitido
- si existen componentes genéricos reutilizados en muchas features salientes
- si la confianza está puesta en la librería y no en un contrato claro del negocio

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- esquemas explícitos y acotados
- menos confianza en defaults del parser o del cliente
- contrato funcional claro sobre qué tipo de recurso se permite
- menos genericidad innecesaria
- validación temprana del esquema esperado
- más alineación entre caso de uso y tipo de destino realmente aceptado

---

## Señales de ruido

Estas señales merecen revisión rápida:

- nadie sabe qué esquemas acepta realmente la feature
- se valida solo el host
- el equipo asume que solo se usará HTTP/HTTPS pero nunca lo explicitó
- la librería es mucho más flexible que el negocio
- redirects no controlados
- inputs con forma de URL aceptados por conveniencia sin contrato claro
- el parser o cliente puede interpretar más cosas de las que el diseño había imaginado

---

## Checklist práctico

Cuando revises este tema, preguntate:

- ¿qué esquemas necesita realmente esta feature?
- ¿están explícitamente permitidos o solo asumidos?
- ¿qué acepta el parser?
- ¿qué acepta el cliente final?
- ¿qué cambia si el esquema no es el esperado?
- ¿qué pasa con redirects?
- ¿la allowlist valida host antes de validar esquema?
- ¿qué parte del diseño confía demasiado en defaults de librería?
- ¿qué componente genérico me preocupa más?
- ¿qué restringirías primero para volver el contrato saliente más claro?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Qué features aceptan entradas con forma de URL?
2. ¿Qué esquemas necesitan de verdad?
3. ¿Dónde se valida eso hoy?
4. ¿Qué esquemas podría aceptar la librería aunque el negocio no los quiera?
5. ¿Qué pasa si hay redirects?
6. ¿Qué flujo está más expuesto a “protocolo inesperado”?
7. ¿Qué cambio harías primero para reducir esa ambigüedad?

---

## Resumen

En SSRF, no basta con revisar host, dominio o IP.
También importa el esquema con el que el backend está dispuesto a interpretar el destino.

Si una feature fue pensada para consumir contenido web, normalmente debería aceptar solo un conjunto muy acotado de esquemas, porque cada protocolo adicional:

- amplía superficie
- cambia el tipo de recurso alcanzable
- vuelve más borroso el contrato del negocio
- y puede exponer comportamientos que el equipo nunca quiso habilitar

En resumen:

> un backend más maduro no se conforma con que la URL “se vea bien” o el dominio “parezca correcto”.  
> También define con claridad qué tipo de destino acepta cada funcionalidad, porque entiende que en SSRF la pregunta no es solo adónde sale el servidor, sino también bajo qué protocolo o semántica está dispuesto a hacerlo, y que dejar eso librado a parsers genéricos, defaults de librería o supuestos tácitos es regalar superficie innecesaria antes incluso de empezar a discutir hostnames, IPs o red interna.

---

## Próximo tema

**Validar después de redirects también importa**
