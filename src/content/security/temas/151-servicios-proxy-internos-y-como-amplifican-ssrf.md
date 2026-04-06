---
title: "Servicios proxy internos y cómo amplifican SSRF"
description: "Cómo pensar servicios proxy internos, gateways o componentes de reenvío como amplificadores de SSRF en una aplicación Java con Spring Boot. Por qué una feature saliente vulnerable se vuelve más peligrosa cuando puede encadenarse con otro servicio interno que reenvía requests o tiene más reachability que el proceso original."
order: 151
module: "Consumo saliente, SSRF y conexiones externas"
level: "base"
draft: false
---

# Servicios proxy internos y cómo amplifican SSRF

## Objetivo del tema

Entender por qué los **servicios proxy internos**, gateways o componentes de reenvío pueden **amplificar mucho el impacto de SSRF** en una aplicación Java + Spring Boot.

La idea de este tema es sumar una observación muy importante después de hablar de:

- SSRF básica
- localhost y red interna
- metadata cloud
- Actuator y paneles internos
- mínimo privilegio
- segmentación de red

Hasta ahí, el modelo mental venía siendo algo como:

- una feature vulnerable
- hace una request saliente
- y alcanza directamente algo que no debería

Eso ya puede ser serio.
Pero a veces el entorno tiene otra capa que empeora la historia:

- un proxy interno
- un gateway
- un “fetch service”
- un servicio de conectividad común
- un reenvío interno entre microservicios
- un componente que habla con más destinos o con otra identidad

Y entonces el problema cambia de tamaño.

En resumen:

> una SSRF no siempre termina donde llegó la primera request.  
> A veces se vuelve mucho más peligrosa cuando puede encadenarse con otro servicio interno que sabe reenviar, salir a más lugares o hablar con más privilegios que el proceso original.

---

## Idea clave

Un servicio proxy interno, en sentido amplio, es cualquier componente que:

- recibe una request o instrucción de otro servicio
- y luego hace una request adicional hacia otro destino

Eso puede presentarse como:

- un gateway interno
- un servicio genérico de integraciones
- un “HTTP fetcher”
- un image proxy
- un resolver de enlaces
- un servicio que descarga recursos por otros
- un reenvío entre microservicios
- un conector común con mucha reachability

La idea central es esta:

> si una feature con SSRF puede usar o alcanzar un servicio así, el impacto ya no depende solo de la reachability del proceso original, sino también de la reachability, identidad y políticas del servicio intermediario.

### Idea importante

La SSRF deja de ser solo:
- “qué puede tocar este proceso”

y pasa a ser también:
- “qué puede hacer este proceso si logra que otro servicio interno toque cosas por él”.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- pensar SSRF solo como request directa a un host interno
- no considerar servicios internos de reenvío o proxy como multiplicadores de impacto
- asumir que un gateway o fetch service interno no cambia mucho la severidad
- olvidar que otro servicio puede tener más reachability, más privilegios o más flexibilidad
- no modelar cadenas de requests entre servicios
- tratar el proxy interno como mera infraestructura y no como parte del camino de explotación

Es decir:

> el problema no es solo que una app vulnerable pueda salir a la red.  
> El problema también es que, una vez adentro, puede encontrarse con otros componentes que amplían enormemente su capacidad de alcance.

---

## Error mental clásico

Un error muy común es este:

### “Bueno, este proceso no ve tanto, así que la SSRF queda bastante contenida”

Eso puede ser verdad a medias.

Porque todavía queda una pregunta importante:

- **¿hay otro servicio interno al que sí pueda llegar este proceso, y que luego pueda reenviar o ampliar la salida?**

Si la respuesta es sí, la contención original puede ser mucho menos fuerte de lo que parecía.

### Idea importante

A veces un proceso no necesita ver directamente todo lo valioso.
Le alcanza con ver un intermediario que sí lo ve.

---

## Qué entendemos por “proxy” en este tema

No hace falta que el componente se llame formalmente proxy.
Nos sirve una definición amplia.

Nos referimos a cualquier servicio que, dado algún input o instrucción, pueda:

- ir a buscar algo a otro lado
- reenviar una request
- resolver un enlace
- descargar un recurso
- consultar otro sistema por vos
- actuar como paso intermedio entre un caller y un destino final

### Idea útil

Desde SSRF importa el comportamiento, no el nombre.
Si un componente puede ampliar reachability o hacer requests en nombre de otro, ya entra en esta conversación.

---

## Por qué estos servicios amplifican tanto el riesgo

Un proxy interno puede amplificar SSRF por varias razones, por ejemplo porque:

- ve otra red
- tiene otra identidad
- tiene más permisos
- tiene menos restricciones de egress
- sigue redirects
- acepta más protocolos
- reenvía headers
- habla con servicios internos privilegiados
- tiene allowlists más amplias
- fue diseñado para “llegar a casi todo”

### Idea importante

No es solo una request más.
Es una request desde un contexto potencialmente más poderoso que el proceso original.

---

## El patrón de encadenamiento

Este tema se entiende muy bien como una cadena.

### Paso 1
Una feature con SSRF alcanza un servicio interno.

### Paso 2
Ese servicio interno acepta una instrucción o un destino.

### Paso 3
El servicio interno hace otra request, quizá:
- a más destinos
- con más red
- con más identidad
- con mejores permisos
- o con otra lógica de confianza

### Resultado
La SSRF inicial gana alcance lateral o profundidad gracias a ese intermediario.

### Idea útil

La primera request no siempre busca directamente el secreto.
A veces busca el “brazo largo” dentro de la arquitectura.

---

## Un servicio interno “de conectividad” merece sospecha especial

Hay componentes que, por diseño, nacen para hablar con muchos destinos, por ejemplo:

- gateway de integraciones
- servicio de webhooks
- fetcher genérico
- descargador común
- proxy de imágenes
- normalizador de links
- extractor de metadata
- servicio central de APIs salientes

### Problema

Justamente porque son componentes útiles, suelen tener:

- mucho egress
- bastante flexibilidad
- clientes HTTP genéricos
- menos segmentación de red
- más permisos o secretos asociados a integraciones

### Regla sana

Si existe un servicio interno cuya misión es “llegar a otros lados”, ya es un candidato natural a amplificar SSRF si queda al alcance de otro proceso vulnerable.

---

## El proceso original puede tener poco egress, pero igual ser peligroso

Esto conecta con el tema anterior.

Podrías pensar:
- “bien, recortamos el egress del worker vulnerable”

Eso ayuda mucho.
Pero si ese worker todavía puede llamar a:

- un gateway interno
- un servicio de integración
- un proxy corporativo
- un microservicio que reenvía

entonces la pregunta cambia a:
- “¿qué puede hacer a través de ese intermediario?”

### Idea importante

La mitigación de red es fuerte, pero hay que mirar también si quedó un camino indirecto hacia un componente más poderoso.

---

## La identidad del proxy también importa

A veces el proxy o servicio intermedio no solo tiene más reachability.
También puede tener:

- otra cuenta de servicio
- otro rol de plataforma
- secretos adicionales
- autenticación hacia terceros
- acceso a recursos internos más sensibles

### Idea útil

En ese caso, la SSRF inicial no solo gana alcance de red.
También puede quedar más cerca de otra identidad operativa del sistema.

### Regla sana

Cada vez que un servicio interno reenvía con otra identidad, merece modelado fuerte de abuso lateral.

---

## Un proxy puede normalizar o enriquecer requests de forma peligrosa

Otro motivo por el que amplifica riesgo es que puede hacer más que reenviar “igual”.

Puede, por ejemplo:

- agregar headers
- agregar auth
- seguir redirects
- transformar la URL
- resolver hosts
- leer el body
- reintentar
- interpretar respuestas
- devolver errores ricos

### Idea importante

Eso significa que el intermediario no solo amplía reachability.
También puede añadir capacidad lógica que el proceso original no tenía.

---

## Proxies de imágenes, previews y downloaders internos

Este es un caso muy real.

Muchas plataformas crean servicios internos dedicados a cosas como:

- bajar imágenes remotas
- hacer thumbnails
- resolver previews
- extraer metadata
- normalizar adjuntos
- proteger al frontend de CORS o mixed content

Todo eso puede ser legítimo.
Pero esos componentes suelen terminar viendo:

- más destinos
- más tamaños
- más formatos
- más redirects
- y más tráfico saliente

### Idea útil

Si una SSRF puede interactuar con uno de esos servicios, hereda un amplificador muy valioso.

---

## Gateways internos y BFFs con endpoints genéricos

Otra variante común aparece cuando hay:

- gateways internos
- servicios “backend for backend”
- wrappers de integración
- endpoints del tipo “call provider”, “test endpoint”, “fetch remote resource”

### Problema

Como existen para simplificar arquitectura, a veces se les da una interfaz bastante genérica y potente.

Entonces un servicio vulnerable que pueda alcanzarlos puede terminar usándolos como proxy con más flexibilidad del sistema.

### Regla sana

Cada endpoint interno que “hace requests por vos” merece pensarse como posible amplificador de SSRF.

---

## SSRF y proxy interno no siempre significan exploit sofisticado

No hace falta imaginar una cadena ultra avanzada.
A veces el problema nace de algo sencillo:

- una app vulnerable llama a un servicio interno de previews
- o a un downloader
- o a un endpoint admin de “test external endpoint”
- o a un conector de integraciones

Y ese segundo componente tiene menos controles o más alcance del que nadie estaba modelando.

### Idea importante

La amplificación puede surgir por composición cotidiana de features normales, no solo por bugs exóticos.

---

## El proxy puede exponer mensajes aún más ricos

Además del alcance, a veces el servicio intermedio también devuelve:

- errores muy detallados
- status específicos
- redirects vistos
- metadata parcial
- resultados de reachability
- diferencias entre tipos de fallo

### Idea útil

Eso puede combinar dos problemas:

- más reachability
- más capacidad de reconocimiento

### Regla sana

Un proxy interno no solo puede tocar más cosas.
También puede contarte mejor qué vio.

---

## Encadenar servicios internos hace más difícil la revisión mental

Otra razón por la que este caso importa es organizacional.

Cuando el análisis se queda solo en la app vulnerable, el equipo puede concluir:
- “no ve tanto, no parece gravísimo”

Pero quizá no está viendo que:

- sí puede llamar a otro servicio
- que ese servicio sí ve mucho
- y que la cadena completa cambia por completo la severidad

### Idea importante

SSRF se vuelve más peligrosa cuando la arquitectura permite componer capacidades entre servicios que por separado parecían razonables.

---

## No todo servicio intermedio debería aceptar inputs tan libres

Esto conecta con temas anteriores de clientes genéricos.

Muchas veces el servicio proxy interno existe para casos legítimos, pero su API termina siendo demasiado abierta:

- acepta URL completa
- acepta headers arbitrarios
- acepta método configurable
- acepta puertos arbitrarios
- sigue redirects
- reintenta
- devuelve body o errores ricos

### Regla sana

Un intermediario interno debería ser más específico y más aburrido que un mini-proxy universal.
No más poderoso.

---

## Segmentación de red también aplica acá

Este tema cierra muy bien con el anterior.

No alcanza con segmentar el proceso vulnerable.
También conviene preguntarte:

- ¿qué servicios internos puede alcanzar ese proceso?
- ¿esos servicios a su vez tienen mucho egress?
- ¿hay un camino indirecto hacia algo más poderoso?

### Idea importante

La segmentación buena no mira solo el primer salto.
Mira también los puentes internos que pueden ampliar alcance.

---

## Qué preguntas conviene hacer sobre un proxy interno

Cuando revises una arquitectura con SSRF potencial, conviene preguntar:

- ¿hay servicios internos que hacen requests por otros?
- ¿qué reachability tienen?
- ¿qué identidad usan?
- ¿qué inputs aceptan?
- ¿aceptan URL completa o destinos muy flexibles?
- ¿siguen redirects?
- ¿agregan auth o headers?
- ¿devuelven errores ricos?
- ¿qué procesos pueden llamarlos?
- ¿qué pasaría si una feature saliente vulnerable pudiera usarlos como siguiente salto?

### Regla sana

Cada servicio interno que “sale a la red” o “consulta recursos por otros” debería analizarse también como posible amplificador lateral.

---

## Cómo reconocer este problema en una codebase Spring

En una app Spring, conviene sospechar especialmente cuando veas:

- `RemoteFetchService`
- `IntegrationGateway`
- `ExternalCallService`
- `ProxyController`
- `ImageProxyService`
- `PreviewService`
- `FileDownloadService`
- `WebhookDeliveryService`
- endpoints internos de “fetch”, “test”, “download”, “resolve”, “proxy”
- wrappers o microservicios cuya misión es hacer requests por otros servicios

### Idea útil

Si un componente interno existe para “ir a buscar algo a otro lado”, no lo mires solo como infraestructura de soporte. Míralo también como posible multiplicador de SSRF.

---

## Qué conviene revisar en una app Spring

Cuando revises servicios proxy internos y cómo amplifican SSRF en una aplicación Spring, mirá especialmente:

- qué servicios internos hacen requests salientes
- qué procesos vulnerables pueden llamarlos
- qué identidad y reachability tiene cada uno
- si aceptan destinos flexibles
- si agregan auth, headers o retries
- si siguen redirects
- qué información devuelven en éxito y en error
- qué segmentación de red separa o no a esos componentes
- cuánto aumentaría el impacto de una SSRF si logra usar ese intermediario

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- servicios intermedios más específicos
- menos inputs arbitrarios
- menos capacidad de proxy genérico
- mejor segmentación entre componentes
- menos identidad potente en servicios de conectividad
- menos errores ricos hacia otros servicios
- más conciencia de cadenas laterales entre componentes

### Idea importante

La madurez acá se nota cuando cada componente interno de conectividad tiene un contrato estrecho y no se convierte en brazo largo universal para el resto del sistema.

---

## Señales de ruido

Estas señales merecen revisión rápida:

- un servicio interno que “puede consultar cualquier URL”
- gateways con mucha flexibilidad
- proxies de imágenes o downloads con poco control
- clientes HTTP genéricos dentro de servicios de integración
- componentes con más reachability que el proceso original
- poca segmentación entre app vulnerable y servicio saliente potente
- nadie modeló el segundo salto de la SSRF

### Regla sana

Si la arquitectura tiene un componente que “llega a más lados”, asumí que vale la pena preguntarte qué pasaría si una feature vulnerable pudiera apoyarse en él.

---

## Checklist práctico

Cuando revises este tema, preguntate:

- ¿qué servicios internos reenvían o consultan destinos por otros?
- ¿qué procesos vulnerables podrían llamarlos?
- ¿qué reachability adicional aportan?
- ¿qué identidad adicional aportan?
- ¿qué tan genérica es su API?
- ¿siguen redirects o hacen retries?
- ¿qué mensajes ricos devuelven?
- ¿la segmentación corta o permite ese encadenamiento?
- ¿qué servicio interno sería el mejor amplificador de una SSRF hoy?
- ¿qué restricción agregarías primero para cortar ese segundo salto?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Existe algún servicio interno que haga requests por otros?
2. ¿Qué inputs acepta?
3. ¿Qué reachability tiene?
4. ¿Qué identidad usa?
5. ¿Qué proceso vulnerable podría llamarlo hoy?
6. ¿Qué lo vuelve un amplificador de impacto?
7. ¿Qué cambio harías primero para que deje de parecer un mini-proxy demasiado poderoso?

---

## Resumen

Los servicios proxy internos, gateways o componentes de reenvío pueden amplificar mucho SSRF porque permiten que una request saliente vulnerable se encadene con otro componente que:

- ve más red
- tiene más identidad
- sigue más lógica
- agrega más headers
- o devuelve más información

Eso hace que el impacto ya no dependa solo del proceso original, sino también del poder del intermediario.

En resumen:

> un backend más maduro no analiza SSRF solo como una línea recta entre una feature vulnerable y un destino remoto.  
> También revisa los puentes internos que pueden convertir esa línea en una cadena mucho más peligrosa, porque entiende que en arquitecturas reales el daño no siempre nace de que el primer proceso vea demasiado, sino muchas veces de que pueda apoyarse en otro servicio que fue creado para integrar, descargar, resolver o reenviar con más alcance y menos fricción, y que justamente por eso se convierte en el amplificador perfecto de una superficie saliente que por sí sola quizá parecía bastante más contenida.

---

## Próximo tema

**Cómo modelar trust boundaries en consumo saliente**
