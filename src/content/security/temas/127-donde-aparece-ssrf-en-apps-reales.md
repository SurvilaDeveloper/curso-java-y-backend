---
title: "Dónde aparece SSRF en apps reales"
description: "En qué funcionalidades reales suele aparecer SSRF dentro de una aplicación Java con Spring Boot. Cómo reconocer superficies típicas como previews, callbacks, importaciones, scrapers, descargas remotas e integraciones configurables antes de entrar en mitigaciones más específicas."
order: 127
module: "Consumo saliente, SSRF y conexiones externas"
level: "base"
draft: false
---

# Dónde aparece SSRF en apps reales

## Objetivo del tema

Entender **dónde suele aparecer SSRF en aplicaciones reales** Java + Spring Boot, para dejar de pensarlo como una rareza teórica y empezar a verlo como un riesgo práctico asociado a features bastante comunes.

En el tema anterior vimos la idea base:

- el problema no es solo que el backend haga requests salientes
- el problema es **quién influye el destino**
- y qué puede alcanzar el servidor desde su posición de red

Ahora toca aterrizar eso en casos concretos.

Porque SSRF rara vez se presenta con un cartel gigante que diga:

- “acá hay una vulnerabilidad”

Muchas veces se esconde dentro de funciones que suenan perfectamente razonables, como:

- importar un recurso
- generar un preview
- validar una URL
- probar una integración
- descargar una imagen
- verificar un webhook
- consultar un endpoint externo
- sincronizar con un tercero

En resumen:

> SSRF suele aparecer donde el producto quiere “ser útil” consumiendo algo remoto,  
> y la seguridad no termina de delimitar qué destinos son legítimos y cuáles no.

---

## Idea clave

SSRF aparece en lugares donde el backend:

- construye
- resuelve
- sigue
- consulta
- descarga
- verifica
- o reenvía

requests hacia destinos externos o semi-externos influenciados por datos no confiables.

La idea central es esta:

> no busques SSRF solo en formularios con un campo “URL”.  
> Buscalo en cualquier feature donde el servidor salga a la red usando información que el usuario puede aportar, elegir o condicionar.

Eso incluye tanto influencia directa como indirecta.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- revisar SSRF solo en endpoints que aceptan una URL explícita
- no sospechar de integraciones “bonitas” o features UX
- tratar previews o importadores como funciones inofensivas
- olvidar que un callback configurable también es un destino remoto
- no detectar cuando el usuario controla solo una parte del host y aun así influye demasiado
- asumir que “si lo armamos nosotros en backend, entonces no hay riesgo”
- pensar que solo hay SSRF cuando se ve un `http://` escrito por el usuario

Es decir:

> el problema no es no saber qué es SSRF.  
> El problema es no reconocer sus disfraces en features comunes del producto.

---

## Error mental clásico

Un error muy común es este:

### “Eso no acepta una URL libre, así que no debería haber SSRF”

Eso es demasiado estrecho.

Porque el usuario puede influir el destino de muchas formas, por ejemplo mediante:

- una URL completa
- un host
- un subdominio
- un dominio callback
- un identificador que luego se transforma en URL
- un archivo con referencias remotas
- una redirección que el backend sigue
- un enlace del que la app extrae metadata
- una integración donde el usuario define a qué endpoint conectarse

### Idea importante

La superficie de SSRF no se define por el formato del input.
Se define por el **grado de influencia sobre el destino saliente**.

---

## Primera familia: previews de enlaces

Este es uno de los casos más clásicos.

Por ejemplo, cuando una app:

- recibe una URL
- la consulta desde backend
- y extrae título, imagen, descripción o metadata para mostrar un preview

Funcionalmente eso puede ser útil y hasta deseable.
Pero también significa que el backend está haciendo una request hacia un destino que vino, directa o indirectamente, del usuario.

### Preguntas sanas

- ¿qué URLs se aceptan?
- ¿qué redirects se siguen?
- ¿qué tipos de contenido se consultan?
- ¿qué hosts puede alcanzar el servidor?
- ¿qué devuelve luego esa preview al usuario?

### Idea importante

Una preview es una forma bastante elegante de decir:
- “hacé que el servidor visite este lugar y me cuente qué ve”.

Y eso ya merece sospecha de SSRF.

---

## Segunda familia: importación desde URL

Otro patrón muy común es importar algo desde un enlace remoto.

Por ejemplo:

- un CSV
- una imagen
- un PDF
- un avatar
- un archivo de configuración
- un feed
- una lista
- un recurso de sincronización

### Problema

La app puede estar pensando:
- “solo voy a descargar un archivo”

Pero desde seguridad sigue ocurriendo:
- el backend elige resolver y conectar con un destino remoto influido por el usuario

### Idea importante

Importar desde URL suele ser un caso de SSRF muy realista porque además mezcla:
- conexión saliente
- descarga
- tipo de contenido
- redirecciones
- y a veces almacenamiento posterior

---

## Tercera familia: descarga o proxy de imágenes remotas

Esto aparece muchísimo en apps modernas.

Por ejemplo, cuando el sistema:

- baja una imagen remota para guardarla
- genera miniaturas
- valida que el recurso exista
- la sirve después desde su propio storage
- o actúa como un “image proxy” para un frontend

### Idea útil

Como las imágenes parecen inocentes, este caso se subestima bastante.
Pero sigue siendo un escenario donde el backend:
- resuelve
- conecta
- y descarga desde un destino no totalmente controlado

### Regla sana

Si la funcionalidad dice “traer una imagen desde esta URL”, ya deberías pensar SSRF.

---

## Cuarta familia: validación de webhooks o callbacks

Otro caso muy real es cuando la app permite configurar un callback y luego hace algo como:

- enviar una request de prueba
- validar que el endpoint responda
- verificar conectividad
- guardar el webhook solo si responde cierto status
- confirmar handshake con un destino dado por el usuario o por un tenant

### Problema

Ese “test de conectividad” ya es una request saliente del backend hacia un destino influenciado por quien configura la integración.

### Idea importante

SSRF no necesita una gran función de importación.
A veces alcanza con un simple:
- “probar conexión”
- “validar endpoint”
- “hacer ping lógico a la URL”

---

## Quinta familia: conectores o integraciones configurables

Este grupo es especialmente delicado en apps B2B, admin panels o sistemas multi-tenant.

Por ejemplo, features donde un usuario o un cliente configura:

- URL base de su API
- endpoint de callback
- host de integración
- webhook saliente
- destino de sincronización
- servidor remoto al que conectarse

### Idea importante

Cuanto más “genérico” es el conector, más fuerte suele ser la superficie de SSRF.
Porque el producto, por diseño, está dejando que el usuario determine adónde sale el backend.

### Regla sana

Las integraciones configurables merecen revisión fuerte aunque parezcan una feature enterprise totalmente legítima.

---

## Sexta familia: scrapers, fetchers y extractores

Muchas apps tienen componentes que:

- leen contenido remoto
- extraen metadata
- procesan HTML
- siguen enlaces
- parsean feeds
- consultan páginas para mostrar información resumida

### Problema

Todo eso convierte al backend en un agente que visita destinos en nombre del usuario o del negocio.

### Idea útil

Si una funcionalidad “va a buscar algo afuera para mostrarlo adentro”, SSRF debería estar en tu radar.

---

## Séptima familia: follow redirects automático

Este caso no siempre inicia con un input totalmente libre.
A veces la app conecta a un destino que cree legítimo, pero luego sigue redirecciones hacia otros destinos.

### Entonces el riesgo puede aparecer porque

- el primer host parecía aceptable
- pero el recorrido final no lo era
- o el backend terminó yendo a un lugar que el equipo no consideró

### Idea importante

No siempre el problema está en el primer destino.
A veces está en lo que la app está dispuesta a seguir después.

---

## Octava familia: parámetros parciales que terminan armando una URL

Este punto es muy importante porque rompe la intuición de “URL libre”.

Hay apps donde el usuario no manda una URL completa, pero sí controla cosas como:

- subdominio
- nombre de host
- slug que se concatena a un host
- ruta remota
- identificador que se transforma en endpoint
- valor que decide a qué región o dominio ir

### Idea útil

Aunque el backend “arme la URL”, puede seguir existiendo SSRF si la influencia del usuario sobre el destino es suficientemente fuerte.

---

## Novena familia: validadores de dominio, reachability o “health checks”

Este patrón también aparece mucho.

La app deja que alguien cargue un host, dominio o endpoint y luego hace algo como:

- resolver DNS
- verificar que responda
- revisar cierto path
- confirmar reachability
- medir latencia
- comprobar certificado
- “test connection”

### Problema

Todo eso sigue siendo una request saliente o una interacción de red que el backend realiza hacia un destino elegido o influido por el usuario.

### Idea importante

Un chequeo “solo técnico” puede ser una superficie de SSRF totalmente válida.

---

## Décima familia: features internas y administrativas

A veces SSRF no vive en la interfaz pública, sino en herramientas internas o de administración, como:

- paneles de soporte
- consolas de diagnóstico
- herramientas de sincronización manual
- jobs disparados desde admin
- importadores de backoffice
- utilidades internas de verificación

### Regla sana

No asumas que SSRF es solo un riesgo de cara al usuario final.
Las features internas con mucha capacidad y poca revisión a veces son incluso más peligrosas.

---

## Features “de conveniencia” suelen ser terreno fértil

Hay una categoría de funcionalidades que conviene mirar con sospecha especial:
las que existen para “hacerle la vida más fácil” al usuario.

Por ejemplo:

- “pegá la URL y te autocompletamos”
- “traemos el logo por vos”
- “probamos el endpoint”
- “importamos el archivo remotamente”
- “hacemos preview del enlace”
- “validamos la integración”
- “detectamos automáticamente los datos”

### Idea importante

La conveniencia de producto muchas veces se apoya justo en que el backend haga trabajo de red por el usuario.
Y eso es, conceptualmente, el corazón de muchas superficies SSRF.

---

## Multi-tenant y B2B: donde esto se vuelve todavía más importante

En productos multi-tenant, white-label o enterprise, suele ser bastante normal permitir que clientes configuren destinos remotos.

Eso puede incluir:

- APIs de terceros
- callbacks
- endpoints propios del cliente
- dominios por tenant
- servidores del cliente
- recursos remotos customizados

### Idea útil

En esos contextos, SSRF no es una rareza.
Es una consecuencia muy plausible de permitir configurabilidad saliente.

---

## No toda superficie devuelve el cuerpo de la respuesta

Esto también conviene remarcarlo.

Algunas features:

- muestran el contenido
- guardan el archivo
- exponen la preview

Otras solo:

- validan que responda
- miden status
- confirman conectividad
- registran “ok / fail”

### Idea importante

Aunque el backend no le devuelva el cuerpo remoto al usuario, igual puede existir SSRF.
Porque el riesgo no es solo leer contenido:
también es **alcanzar destinos** y obtener señales desde la red del servidor.

---

## Cómo reconocerlas en una codebase Spring

En una app Spring, estas superficies suelen aparecer alrededor de cosas como:

- endpoints que aceptan `url`, `host`, `domain`, `endpoint`, `callbackUrl`, `imageUrl`, `webhookUrl`
- servicios que usan `RestTemplate`, `WebClient` o clientes similares con inputs dinámicos
- jobs de importación o sincronización
- lógica de preview o parsing remoto
- paneles admin para “testear conexión”
- configuraciones guardadas en base que luego se consumen como destinos salientes
- seguimiento automático de redirects
- wrappers o helpers genéricos para llamar destinos configurables

### Idea útil

Si ves que una request saliente se arma con datos de negocio, config de usuario o inputs externos, ya vale la pena revisar más.

---

## Qué preguntas conviene hacer por cada feature sospechosa

Cuando identifiques una funcionalidad candidata, conviene preguntar:

- ¿quién define el destino?
- ¿cuánta parte del destino controla?
- ¿qué protocolos o esquemas se aceptan?
- ¿hay redirects?
- ¿qué red puede alcanzar el backend?
- ¿el contenido remoto se devuelve al usuario o solo se usa internamente?
- ¿hay allowlists reales?
- ¿el usuario recibe errores ricos que ayudan a mapear la red?
- ¿esta funcionalidad existe por conveniencia y nunca fue revisada de forma profunda?

### Regla sana

La superficie de SSRF se descubre mejor preguntando por flujos, no solo por clases utilitarias.

---

## Qué conviene revisar en una app Spring

Cuando revises dónde aparece SSRF en una aplicación Spring, mirá especialmente:

- previews de enlaces
- importaciones remotas
- descarga de imágenes o archivos desde URL
- validación de webhooks y callbacks
- conectores configurables
- scrapers o extractores
- follow redirects
- herramientas admin de test de conexión
- jobs batch que resuelven destinos guardados en base
- construcción dinámica de endpoints a partir de input o configuración del usuario

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- menos features genéricas que aceptan destinos arbitrarios
- más claridad sobre qué requests salientes existen
- menos conectividad “mágica” en nombre del usuario
- mejor segmentación entre negocio y conectividad remota
- sospecha sana frente a previews, importadores y callbacks
- menos dependencia de inputs libres para definir destinos

---

## Señales de ruido

Estas señales merecen revisión rápida:

- muchas features “pegá una URL”
- callbacks configurables sin controles claros
- test de conexión genéricos
- integraciones multi-tenant muy abiertas
- image proxies o downloaders remotos sin revisión fuerte
- follow redirects automático y poco pensado
- paneles admin que pueden apuntar a casi cualquier destino
- el equipo cree que SSRF solo aplica a una URL pegada en un formulario público

---

## Checklist práctico

Cuando revises dónde aparece SSRF, preguntate:

- ¿qué funcionalidades hacen requests salientes?
- ¿cuáles aceptan o derivan destinos a partir de input del usuario?
- ¿qué parte del destino controla el usuario?
- ¿qué features de conveniencia podrían esconder esta superficie?
- ¿hay callbacks, webhooks o conectores configurables?
- ¿hay previews, scrapers, importadores o proxies de imágenes?
- ¿se siguen redirects?
- ¿hay herramientas internas con más poder todavía?
- ¿qué feature parecía inocente y ya no tanto?
- ¿qué superficie revisarías primero porque combina entrada de usuario + request saliente + backend con mucho alcance de red?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Qué features hacen requests salientes?
2. ¿Cuál de ellas acepta más influencia del usuario sobre el destino?
3. ¿Cuál existe por conveniencia de producto?
4. ¿Hay callbacks, previews o importación remota?
5. ¿Qué herramienta interna o admin podría ser más peligrosa?
6. ¿Dónde sospechás que se siguen redirects sin demasiado control?
7. ¿Qué feature revisarías primero si quisieras encontrar SSRF real en vez de solo teoría?

---

## Resumen

SSRF aparece en apps reales mucho más a menudo de lo que parece, especialmente en funciones donde el backend consume recursos remotos en nombre del usuario o del negocio.

Los lugares más típicos incluyen:

- previews
- importaciones
- descarga de imágenes o archivos
- validación de callbacks
- integraciones configurables
- scrapers
- proxies
- herramientas admin de test
- construcción dinámica de endpoints
- follow redirects

En resumen:

> un backend más maduro no busca SSRF solo en un endpoint que recibe una URL explícita y se queda tranquilo si no lo encuentra ahí.  
> También revisa todas las features donde el producto le pide al servidor que “vaya a buscar algo afuera”, porque entiende que la superficie real de SSRF suele estar escondida en funcionalidades perfectamente normales, convenientes y legítimas desde negocio, pero peligrosas desde seguridad si nadie delimita bien qué destinos puede alcanzar el backend, cuánto controla el usuario sobre ellos y qué tan privilegiada es la posición de red desde la que el servidor hace esa salida.

---

## Próximo tema

**URLs completas vs fragmentos controlados por el usuario**
