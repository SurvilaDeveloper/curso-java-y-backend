---
title: "URLs completas vs fragmentos controlados por el usuario"
description: "Cómo pensar el riesgo de SSRF cuando el usuario no controla una URL completa, pero sí fragmentos que terminan influyendo el destino saliente en una aplicación Java con Spring Boot. Por qué subdominios, hosts, rutas o identificadores también pueden abrir esta superficie."
order: 128
module: "Consumo saliente, SSRF y conexiones externas"
level: "base"
draft: false
---

# URLs completas vs fragmentos controlados por el usuario

## Objetivo del tema

Entender por qué, en SSRF, **no hace falta que el usuario controle una URL completa** para que exista riesgo en una aplicación Java + Spring Boot.

La idea de este tema es corregir una intuición que aparece muchísimo cuando se revisa código:

- “acá no hay SSRF porque el usuario no manda una URL entera”
- “la URL la armamos nosotros”
- “solo nos pasa una parte”
- “solo elige el subdominio”
- “solo elige el tenant”
- “solo elige la ruta”
- “solo manda un identificador y luego nosotros resolvemos”

Todo eso puede sonar tranquilizador.
Pero muchas veces no alcanza.

Porque, desde el punto de vista de SSRF, la pregunta importante no es:

- “¿el usuario escribe `http://algo` completo?”

La pregunta importante es:

- “¿cuánto influye el usuario en el destino final al que se conecta el backend?”

En resumen:

> SSRF no exige control total de la URL.  
> Puede aparecer igual cuando el usuario controla fragmentos suficientes como para cambiar el host, la ruta, la resolución o el recorrido real de la request saliente.

---

## Idea clave

Una request saliente del backend puede construirse a partir de piezas como:

- esquema
- host
- puerto
- path
- query
- identificador
- subdominio
- tenant
- redirect posterior
- configuración almacenada

La idea central es esta:

> si una parte controlada por el usuario termina decidiendo a qué destino se conecta el backend, ya existe una superficie de SSRF que merece análisis.

No hace falta que el usuario controle todas las piezas.
Alcanza con que controle las que más pesan sobre el destino efectivo.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- descartar SSRF porque “no hay una URL libre”
- confiar demasiado en que la app “arma” la URL por su cuenta
- no revisar subdominios, hosts o rutas influenciadas por el usuario
- asumir que un identificador interno no puede terminar resolviendo un destino peligroso
- perder de vista que la decisión real del destino puede estar fragmentada en varias capas
- revisar solo strings que empiezan con `http` y no toda la cadena de construcción del request saliente

Es decir:

> el problema no es solo aceptar una URL textual.  
> El problema es cualquier mecanismo por el cual el usuario termina afectando el destino o el recorrido de la conexión que hará el backend.

---

## Error mental clásico

Un error muy común es este:

### “Como la URL final la construye el backend, no hay SSRF”

Eso es demasiado optimista.

Porque el backend puede estar construyendo esa URL a partir de piezas que vienen de afuera, por ejemplo:

- un subdominio elegido por el usuario
- un host guardado en base
- un tenant que decide el dominio
- una ruta remota configurable
- un nombre de servidor
- un callback registrado previamente
- un identificador que luego se traduce a endpoint

### Idea importante

Que el backend concatene o formatee la URL no elimina el riesgo.
Solo lo vuelve menos obvio.

---

## Qué significa “fragmentos controlados por el usuario”

Cuando hablamos de fragmentos, hablamos de cualquier parte del destino o del recorrido que el usuario puede:

- elegir
- influir
- guardar
- modificar
- hacer resolver indirectamente
- o hacer llegar desde un flujo anterior

Eso puede incluir cosas como:

- host
- subdominio
- path
- puerto
- parámetros
- nombre de tenant
- nombre de región
- callback
- alias que luego se resuelve
- redirect intermedio

### Idea útil

Desde SSRF importa la influencia efectiva, no si el input parecía “solo un pedacito”.

---

## Control total vs control suficiente

Esta es una distinción muy útil.

### Control total
El usuario define toda la URL o casi toda.

### Control suficiente
El usuario no define toda la URL, pero sí una parte capaz de cambiar significativamente el destino o el alcance de la request.

### Idea importante

Para SSRF, muchas veces el control suficiente alcanza.
No hace falta llegar al caso más evidente para que el riesgo sea real.

---

## Caso clásico: subdominio controlado por el usuario

Este es uno de los patrones más comunes y engañosos.

La app hace algo como:

- construir `https://{subdominio}.ejemplo.com/...`

y el usuario elige:

- `{subdominio}`

A primera vista puede parecer acotado.
Pero la pregunta real es:

- ¿qué infraestructura vive detrás de esos subdominios?
- ¿están todos igual de controlados?
- ¿alguno podría resolver hacia algo peligroso?
- ¿la regla que define qué es un subdominio válido es estricta o solo “parecida”?

### Idea importante

El usuario no necesitó mandar una URL completa.
Pero sí pudo influir algo decisivo del destino.

---

## Otro caso clásico: host configurable

A veces la app deja configurar algo como:

- `apiHost`
- `webhookHost`
- `baseDomain`
- `callbackHost`

y luego el backend arma la URL final con:

- esquema fijo
- path fijo
- método fijo

### Trampa mental típica

- “el path es nuestro”
- “el protocolo es nuestro”
- “solo cambian el host”

Pero el host es justo una de las piezas más críticas del destino.

### Regla sana

Si el usuario controla el host, ya deberías pensar en SSRF aunque el resto de la URL esté “bajo control de la app”.

---

## Path controlado también puede importar

A veces el host es fijo, pero el usuario controla el path o parte del recurso remoto.

Eso no siempre es igual de crítico que controlar el host.
Pero sigue pudiendo importar mucho según el contexto.

### Por ejemplo, si el backend consulta

- un servicio interno fijo
- pero el usuario decide qué ruta tocar
- o qué recurso pedir
- o qué query enviar

### Idea importante

Aunque eso a veces se parece más a “abuso de cliente interno” que a SSRF clásico puro, desde el punto de vista de diseño el problema sigue siendo parecido:
- el usuario influye qué request saliente hace el backend hacia algo que él no debería poder alcanzar directamente.

---

## Identificadores que luego resuelven a destino

Este patrón es muy importante porque rompe todavía más la intuición de “busco URLs”.

La app puede recibir algo como:

- un tenant ID
- un integration ID
- un provider name
- un callback alias
- un nombre lógico de región
- un código de instancia

y luego usar eso para resolver:

- un host
- una URL base
- un endpoint

### Idea útil

Aunque el input no “parezca una URL”, puede seguir siendo la llave que define a dónde sale el backend.

---

## Datos persistidos también cuentan como influencia del usuario

Otra trampa común es pensar:

- “esto no viene en el request actual”
- “sale de la base”
- “es configuración”

Eso no elimina el riesgo si esa configuración fue:

- cargada por un usuario
- importada desde afuera
- elegida por un tenant
- editable por admin con poca validación
- persistida en un flujo anterior

### Idea importante

La influencia del usuario puede ser inmediata o diferida.
Desde SSRF, ambas importan.

---

## Redirects: control indirecto del destino final

A veces el usuario solo controla el primer destino.
Pero si la app sigue redirecciones, puede terminar influyendo el destino real de forma indirecta.

### Entonces la pregunta no es solo
- “¿qué URL inicial aceptamos?”

Sino también:
- “¿qué recorridos estamos dispuestos a seguir después?”

### Idea útil

Un control parcial del inicio puede convertirse en un control más fuerte del final si la app sigue redirects sin suficiente criterio.

---

## “Solo elegís tu tenant” también merece sospecha

En apps multi-tenant o white-label es común ver cosas como:

- el usuario elige tenant
- el backend busca el dominio o endpoint asociado
- y luego hace la request

Eso puede ser legítimo.
Pero la revisión de SSRF sigue siendo necesaria si:

- esos mappings son dinámicos
- el cliente puede configurarlos
- no están bien acotados
- hay demasiado poder en esa resolución

### Regla sana

No descartes SSRF solo porque el usuario elige una entidad lógica y no una URL textual.

---

## Cuanto más indirecta es la construcción, más fácil es subestimarla

Esto pasa mucho en code review.

Si el código se ve así:

- `fetch(urlDelUsuario)`

la sospecha es inmediata.

Pero si se ve así:

- `resolverTenant(tenantId)`
- `armarPath(slug)`
- `obtenerHostDeConfig(integrationId)`
- `seguirRedirects()`
- `llamarRecurso(hostFijo + pathVariable)`

entonces el riesgo puede quedar escondido detrás de varias capas de abstracción.

### Idea importante

SSRF real muchas veces se esconde mejor en construcción indirecta que en URL libre explícita.

---

## Lo importante es rastrear el destino final

Una forma muy sana de revisar este tema es olvidarte un momento del formato del input y preguntarte:

> ¿qué determina realmente el destino final de la request saliente?

Y responder:

- ¿qué parte es fija?
- ¿qué parte es variable?
- ¿qué parte controla el usuario?
- ¿qué parte viene de config influida por el usuario?
- ¿qué parte puede cambiar por redirects?
- ¿qué validaciones hay en cada tramo?

### Regla sana

Si el análisis no termina en el destino final, se puede escapar el riesgo.

---

## No todo fragmento controlado implica el mismo riesgo

También conviene ser precisos.

No es igual controlar:

- solo un path bajo un host muy cerrado y seguro

que controlar:

- un host entero
- un subdominio flexible
- una resolución de tenant a dominio
- un callback guardado en base
- o un redirect que termina saliendo a cualquier lado

### Idea importante

La revisión buena no es paranoica ni ingenua.
Mide cuánto poder real da cada fragmento sobre la request final.

---

## El backend puede amplificar una influencia pequeña

Este es otro punto clave.

A veces el usuario aporta poco.
Pero el backend hace mucho con eso:

- concatena
- resuelve
- enriquece
- sigue redirects
- agrega credenciales
- llama desde red interna
- reintenta
- transforma el input

### Idea útil

Una influencia de entrada pequeña puede terminar convirtiéndose en una request saliente poderosa por cómo actúa el backend.

---

## Cómo reconocer estos casos en una codebase Spring

En una app Spring, estos patrones suelen aparecer alrededor de:

- parámetros como `host`, `domain`, `subdomain`, `slug`, `tenant`, `provider`, `integrationId`, `callbackName`
- servicios que resuelven una URL final a partir de varias capas
- configs por cliente o tenant
- repositorios que guardan destinos remotos
- servicios que concatenan `baseUrl + path`
- importadores que transforman IDs en endpoints
- follow redirects automático
- helpers genéricos que abstraen demasiado el origen del destino final

### Idea importante

No busques solo “campos url”.
Buscá toda lógica que termina determinando adónde conecta el backend.

---

## Qué preguntas conviene hacer en revisión

Cuando sospeches de un caso con fragmentos controlados, conviene preguntar:

- ¿qué parte exacta del destino controla el usuario?
- ¿es suficiente para cambiar host o ruta crítica?
- ¿esa parte viene directa del request o de config persistida?
- ¿hay redirecciones?
- ¿qué termina resolviendo el backend?
- ¿qué red puede alcanzar desde ahí?
- ¿la allowlist valida el destino final o solo el input superficial?
- ¿qué tan escondida está esta influencia detrás de helpers o servicios?

### Regla sana

La revisión de SSRF mejora mucho cuando dejás de buscar formatos y empezás a seguir decisiones de destino.

---

## Qué conviene revisar en una app Spring

Cuando revises URLs completas vs fragmentos controlados por el usuario en una aplicación Spring, mirá especialmente:

- construcción de URLs con `baseUrl + path`
- subdominios elegidos por usuario o tenant
- hosts configurables
- callbacks persistidos
- resoluciones de IDs a endpoints
- redirects automáticos
- paths o queries remotas influenciadas por input
- servicios con mucha abstracción sobre destinos salientes
- dónde se valida realmente el destino final
- qué parte de la confianza está puesta en que “la URL la arma el backend”

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- destinos salientes más fijos
- menos fragmentos peligrosos controlados por usuarios
- mejores controles sobre host y resolución final
- menos lógica saliente enterrada en abstracciones difíciles de seguir
- validación más cerca del destino real y no solo del input superficial
- más claridad sobre cómo se arma cada request saliente

---

## Señales de ruido

Estas señales merecen revisión rápida:

- “no hay URL libre” como argumento principal
- concatenación de hosts, subdominios o paths a partir de input
- callbacks configurables poco acotados
- resoluciones dinámicas por tenant o integración
- redirects seguidos automáticamente
- helpers que esconden demasiado el destino real
- nadie puede explicar bien qué parte del destino controla el usuario y cuál no

---

## Checklist práctico

Cuando revises este tema, preguntate:

- ¿el usuario controla la URL completa o solo fragmentos?
- ¿esos fragmentos alcanzan para cambiar el destino final?
- ¿qué parte del destino arma el backend con datos no confiables?
- ¿hay hosts, subdominios o callbacks configurables?
- ¿hay redirects que cambian el recorrido?
- ¿la validación mira el destino final o solo el input inicial?
- ¿qué influencia está escondida en config persistida?
- ¿qué helper o servicio te obliga a seguir varias capas para entender adónde conecta?
- ¿qué fragmento te preocupa más aunque no “parezca una URL”?
- ¿qué revisarías primero para confirmar cuánto control real tiene el usuario sobre la request saliente?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Qué requests salientes se construyen a partir de piezas y no de URLs fijas?
2. ¿Qué parte de esas piezas controla el usuario o el tenant?
3. ¿Hay subdominios, hosts o callbacks configurables?
4. ¿Qué input no parece una URL, pero igual termina resolviendo un destino?
5. ¿Dónde se siguen redirects?
6. ¿Qué validación te da una falsa sensación de seguridad porque mira solo el input superficial?
7. ¿Qué flujo revisarías primero para entender el destino final real?

---

## Resumen

En SSRF, no hace falta que el usuario controle una URL completa.
Puede bastar con que controle fragmentos suficientes para influir el destino final al que se conecta el backend.

Eso incluye cosas como:

- subdominios
- hosts
- paths
- callbacks
- resoluciones por tenant
- identificadores que se transforman en endpoints
- redirects

En resumen:

> un backend más maduro no se tranquiliza solo porque “la URL la arma el servidor”.  
> También revisa cuánto del destino final sigue dependiendo de datos no confiables, porque entiende que la superficie real de SSRF no se define por el formato visible del input, sino por quién termina decidiendo adónde sale la request saliente, cuánto controla el usuario sobre esa decisión y qué tan privilegiada es la posición desde la que el servidor la ejecuta.

---

## Próximo tema

**URLs internas, localhost y metadata endpoints**
