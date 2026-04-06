---
title: "Validar después de redirects también importa"
description: "Por qué en SSRF no alcanza con validar solo la URL inicial en una aplicación Java con Spring Boot. Cómo los redirects pueden cambiar host, esquema o destino final, y por qué conviene pensar la validación sobre el recorrido completo de la request saliente."
order: 134
module: "Consumo saliente, SSRF y conexiones externas"
level: "base"
draft: false
---

# Validar después de redirects también importa

## Objetivo del tema

Entender por qué, al analizar **SSRF** en una aplicación Java + Spring Boot, **no alcanza con validar solo el destino inicial** si después el cliente HTTP o la librería está dispuesto a seguir redirects.

La idea de este tema es completar algo que ya veníamos insinuando en varios puntos del bloque.

Muchas veces el equipo revisa una feature saliente y concluye algo como:

- “la URL inicial pasa nuestra validación”
- “el host está en allowlist”
- “no es localhost”
- “no es una IP privada”
- “el esquema es correcto”

Y con eso se tranquiliza.

Pero si luego el backend hace esto:

- conecta al destino inicial
- recibe un redirect
- lo sigue automáticamente
- y termina en otro lugar

entonces el chequeo real quedó a mitad de camino.

En resumen:

> en SSRF no solo importa qué destino aprobaste al principio.  
> También importa qué destinos posteriores estás dispuesto a seguir sin volver a validar.

---

## Idea clave

Un redirect puede cambiar cosas muy importantes de una request saliente, por ejemplo:

- host
- esquema
- puerto
- path
- IP final
- segmento de red alcanzado
- tipo de recurso
- e incluso el nivel de confianza que creías tener sobre el destino

La idea central es esta:

> si tu validación mira solo la primera URL, pero tu cliente sigue redirects, en realidad tu sistema puede estar conectando a un destino distinto del que creíste aprobar.

Ese hueco entre:

- validar el primer paso
y
- aceptar el recorrido completo

es una de las trampas más comunes en SSRF.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- creer que la validación inicial alcanza aunque haya follow redirects
- no revisar qué hace la librería cuando recibe 3xx
- asumir que un redirect mantiene el mismo nivel de confianza que la URL original
- permitir que una URL “permitida” salte luego a localhost, red privada o metadata
- validar host y esquema solo antes del primer request
- no distinguir entre destino inicial y destino efectivo final
- tratar el redirect como detalle de UX o de HTTP y no como parte del modelo de seguridad saliente

Es decir:

> el problema no es solo aceptar una URL inicial.  
> El problema también es qué recorrido permitís que haga el backend después de esa primera conexión.

---

## Error mental clásico

Un error muy común es este:

### “Si el primer host está permitido, ya estamos bien”

Eso es demasiado optimista.

Porque todavía queda una pregunta decisiva:

- **¿qué pasa si ese host responde redirigiendo a otro lado?**

Y, más importante todavía:

- **¿tu backend está dispuesto a seguir ese redirect sin volver a pensar el destino?**

### Idea importante

Un host inicial aceptable no vuelve automáticamente aceptable todo lo que venga después.
La confianza no se hereda mágicamente a los redirects.

---

## Redirect no significa “mismo destino con otro path”

A veces se piensa el redirect como un cambio menor, por ejemplo:

- misma web
- mismo servicio
- solo otra ruta
- un salto técnico sin importancia

Pero eso no siempre es así.

Un redirect puede llevarte a:

- otro host
- otro subdominio
- otro esquema
- otra IP
- otra red
- otro sistema
- otro contexto de confianza

### Idea útil

Desde SSRF, cada redirect potencial es una bifurcación de destino.
No un detalle administrativo de HTTP.

---

## La validación inicial mira el punto de entrada, no el recorrido completo

Este es el corazón del tema.

Si la app hace algo como:

1. recibe una URL
2. valida el host
3. valida el esquema
4. conecta
5. sigue redirect
6. termina en otro destino

entonces la validación inicial solo cubrió el **punto de entrada**.
No el **destino efectivo final**.

### Idea importante

En features salientes, el recorrido completo importa tanto como el input inicial.

---

## Redirects y allowlists: una tensión clásica

Esto conecta con los temas anteriores.

Supongamos que tu app tiene una allowlist razonable.
Eso puede ser bueno.

Pero si luego permitís redirects sin control, puede pasar algo conceptualmente así:

- el primer host sí está en allowlist
- pero el segundo ya no
- y aun así el backend termina allí porque siguió automáticamente la redirección

### Regla sana

Una allowlist fuerte pierde mucho valor si el flujo permite escapar de ella después del primer hop.

---

## Redirects y resolución: doble problema

Además, un redirect no solo puede cambiar el host visible.
También puede cambiar:

- la resolución DNS
- la IP final
- el segmento de red alcanzado
- la cercanía con recursos internos

### Idea importante

A veces el primer dominio se veía bien y resolvía a algo aceptable.
Pero el redirect lleva a una resolución totalmente distinta y más peligrosa.

---

## Esto no es solo teoría: es muy fácil que una librería siga redirects por default

Otra razón por la que este tema importa mucho es práctica.

En muchos stacks, clientes HTTP o componentes de descarga pueden:

- seguir redirects automáticamente
- ocultar ese comportamiento detrás de una configuración simple
- o hacerlo de forma distinta según método, biblioteca o versión

### Idea útil

Aunque tu código no diga explícitamente:
- “seguí redirects”

la librería puede estar haciéndolo igual.
Por eso conviene revisar comportamiento real, no solo intención del desarrollador.

---

## Un redirect puede cambiar el esquema

Esto conecta con el tema anterior.

Aunque la URL inicial use un esquema aceptable, el recorrido puede terminar en algo que ya no lo es.

### Entonces la pregunta no es solo
- “¿qué esquema tenía la primera URL?”

Sino también:
- “¿qué esquema termina usando la conexión efectiva después de los redirects?”

### Idea importante

Si el redirect cambia el tipo de destino, la validación original del esquema deja de ser suficiente.

---

## Un redirect puede llevar a localhost o red privada

Este es uno de los impactos más delicados.

El backend podría recibir una URL que parece totalmente externa y razonable.
Pero si sigue redirects sin volver a validar, puede terminar en:

- `localhost`
- loopback
- una IP privada
- un hostname interno
- un metadata endpoint
- una consola administrativa
- otro servicio del cluster

### Idea útil

Eso convierte al redirect en una especie de “puerta lateral” para escapar de la validación inicial.

---

## El caso típico: preview o importador que sigue lo que venga

Un patrón muy real en apps es este:

- el usuario manda una URL
- la app genera preview o descarga contenido
- el cliente sigue redirects automáticamente
- el equipo asume que el chequeo del primer host ya resolvía la seguridad

### Problema

La feature no está validando “la URL”.
Está validando solo el primer paso de una cadena que luego deja moverse al backend por otros destinos.

### Regla sana

Toda feature que consume recursos remotos y sigue redirects merece revisión explícita de SSRF.

---

## Qué significa “validar después del redirect”

No hace falta pensar esto como una mecánica exacta de implementación todavía.
La idea conceptual es más simple:

> cada vez que el backend acepta cambiar de destino por una redirección, debería volver a preguntarse si el nuevo destino sigue siendo legítimo para esa funcionalidad.

Eso implica volver a revisar cosas como:

- esquema
- host
- puerto
- resolución
- allowlist
- red alcanzada
- política de confianza de esa feature

### Idea importante

No es “validé una vez y listo”.
Es “sigo siendo coherente con lo que esta funcionalidad está autorizada a tocar”.

---

## Redirects y features multi-tenant

En apps enterprise o multi-tenant esto puede ser todavía más traicionero.

Por ejemplo, si aceptás:

- callback de cliente
- endpoint configurable
- integración por tenant
- dominio custom

y además seguís redirects, la relación de confianza ya no depende solo del host original que el cliente declaró.

### También depende de
- adónde puede mandarte después
- qué tanto controla esa cadena de redirect
- y si el backend la sigue ciegamente

### Idea importante

Un destino aprobado por tenant no debería poder convertirse en una puerta abierta a destinos no aprobados simplemente por redirección.

---

## “Pero el primer dominio era nuestro” no alcanza

A veces el equipo intenta tranquilizarse diciendo:

- “empezamos en un dominio que controlamos”
- “la primera request fue al proveedor correcto”
- “el host inicial estaba en allowlist”

Eso puede ser bueno como punto de partida.
Pero no responde todavía:

- ¿qué otros destinos puede introducir ese mismo dominio vía redirect?
- ¿qué pasa si algo del flujo está comprometido?
- ¿el cliente sigue cualquier `Location`?
- ¿se revalida el destino siguiente?

### Idea útil

La confianza inicial no debería extenderse automáticamente a la cadena completa.

---

## Redirects y contenido: leer no es lo único

Igual que en otros temas de SSRF, no hace falta que el backend termine devolviendo el cuerpo remoto al usuario para que el redirect importe.

A veces ya es suficiente con que:

- siga la redirección
- alcance el recurso
- exponga señales de red
- devuelva status
- confirme existencia
- cambie su comportamiento según lo encontrado

### Idea importante

Aunque la app “solo verifique conectividad” o “solo descargue metadata”, el redirect puede seguir abriendo una superficie muy valiosa para un atacante.

---

## Validar al guardar no alcanza si luego seguís redirects al usar

Esto conecta con callbacks e integraciones persistidas.

Puede pasar algo así:

1. el usuario registra una URL o endpoint
2. la app la valida en ese momento
3. la guarda
4. días después la usa
5. al usarla, sigue redirects sin revalidar

### Problema

La validación inicial ya no protege el recorrido actual.
Y el destino final puede ser otro.

### Regla sana

Validar una vez al guardar no reemplaza revisar el destino real al usar, especialmente si el flujo sigue redirects.

---

## Redirects y diferencia entre intención de negocio y comportamiento de librería

A veces el producto no “quiso” soportar redirects.
Simplemente la librería lo hace.

Eso genera una brecha peligrosa entre:

- contrato de negocio pensado
y
- comportamiento real del cliente HTTP

### Idea importante

En seguridad saliente, importa lo que la librería efectivamente hace, no solo lo que el equipo cree haber diseñado.

---

## ¿Siempre hay que prohibir redirects?

No necesariamente.
Hay casos donde un redirect legítimo puede formar parte de la integración.

Pero incluso en esos casos, conviene pensar con mucho más rigor:

- qué tipos de redirects aceptás
- entre qué destinos
- bajo qué reglas
- con qué revalidación
- y hasta cuántos saltos

### Idea útil

La postura sana no es “seguir todo” ni “prohibir todo sin pensar”.
Es asegurarte de que el recorrido permitido siga dentro del modelo de confianza de la feature.

---

## El recorrido también forma parte del destino

Esta es una buena forma de resumir la idea.

A veces pensamos el destino como una única URL.
Pero, cuando hay redirects, el destino real es más parecido a una cadena o recorrido.

### Entonces la pregunta cambia de forma

Ya no es solo:
- “¿esta URL es válida?”

Sino:
- “¿este recorrido completo de destinos seguiría siendo válido para esta funcionalidad?”

### Idea importante

En SSRF, validar el recorrido puede ser tan importante como validar el primer punto.

---

## Qué revisar en una codebase Spring

En una app Spring, este tema merece sospecha especial cuando veas:

- uso de `RestTemplate`, `WebClient`, `HttpClient` o utilidades similares sin claridad sobre redirects
- features de preview, importación o descarga
- callbacks y webhooks validados una vez pero usados muchas
- allowlists de host que no revisan el destino tras un 3xx
- lógica que confía demasiado en el primer host permitido
- clientes HTTP con configuración por defecto poco revisada
- mucha dependencia de proveedores o integraciones que redirigen

### Regla sana

Si la librería puede cambiar de destino sola, tu validación debería contemplarlo explícitamente.

---

## Qué preguntas conviene hacer en revisión

Cuando revises redirects en una superficie de SSRF, preguntate:

- ¿esta librería sigue redirects?
- ¿cuántos?
- ¿los sigue siempre o según método?
- ¿qué pasa con host, esquema y puerto en cada salto?
- ¿el nuevo destino se vuelve a validar?
- ¿la allowlist cubre solo el primer host o toda la cadena?
- ¿puede terminar en localhost, red privada o metadata?
- ¿la feature realmente necesita aceptar redirects?
- ¿qué parte del comportamiento depende de defaults de librería que nadie revisó?
- ¿qué flujo persistido podría cambiar radicalmente por un redirect posterior?

### Idea útil

Toda pregunta sobre redirects te ayuda a convertir un chequeo superficial de entrada en un análisis real del recorrido saliente.

---

## Qué conviene revisar en una app Spring

Cuando revises por qué validar después de redirects también importa en una aplicación Spring, mirá especialmente:

- clientes HTTP y su política de follow redirects
- features que consumen URLs remotas
- callbacks o endpoints persistidos
- allowlists de host
- validación de esquema solo en URL inicial
- riesgo de saltar a localhost o redes privadas
- diferencia entre validación al guardar y validación al usar
- qué respuesta o señales obtiene el usuario si el backend sigue el redirect
- si el equipo conoce el destino final real de la request saliente

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- claridad sobre si se siguen redirects o no
- más conciencia del recorrido completo de la request
- revalidación del destino al cambiar de host o contexto
- menos confianza ciega en la URL inicial
- menos defaults de librería asumidos sin revisión
- mejor alineación entre contrato de negocio y comportamiento del cliente HTTP

---

## Señales de ruido

Estas señales merecen revisión rápida:

- “el primer host estaba permitido” como argumento principal
- nadie sabe si la librería sigue redirects
- allowlist de host sin control de cadena posterior
- callbacks o previews con follow redirects automático
- validación al guardar, pero no al usar
- falta de revisión del destino final
- confianza excesiva en defaults de cliente HTTP

---

## Checklist práctico

Cuando revises este tema, preguntate:

- ¿mi cliente HTTP sigue redirects?
- ¿la feature realmente necesita eso?
- ¿qué validamos antes de la primera conexión?
- ¿qué validamos después de cada redirect?
- ¿puede cambiar el host?
- ¿puede cambiar el esquema?
- ¿podría terminar en localhost, red privada o metadata?
- ¿la allowlist cubre la cadena completa o solo el primer salto?
- ¿qué parte del riesgo viene de defaults de librería?
- ¿qué flujo revisarías primero para descubrir si estamos aprobando un inicio pero consumiendo un final totalmente distinto?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Qué features siguen redirects hoy?
2. ¿Quién definió que eso era necesario?
3. ¿Qué parte de la validación ocurre solo antes del primer salto?
4. ¿Qué destino te preocuparía más si apareciera solo después de un 3xx?
5. ¿Hay callbacks o endpoints guardados que luego siguen redirects?
6. ¿Qué librería te genera menos confianza por sus defaults?
7. ¿Qué cambio harías primero para validar mejor el recorrido completo?

---

## Resumen

En SSRF, validar solo la URL inicial no alcanza si después el backend sigue redirects sin revalidar el nuevo destino.

Los redirects pueden cambiar:

- host
- esquema
- puerto
- red alcanzada
- IP final
- y, en definitiva, el nivel de confianza que la funcionalidad debería tolerar

En resumen:

> un backend más maduro no da por resuelto el riesgo saliente solo porque la primera URL pasó una allowlist o parecía legítima.  
> También revisa qué ocurre después de cada redirección, porque entiende que en SSRF el destino efectivo puede no coincidir con el destino inicial aprobado, y que seguir redirects sin volver a pensar el nuevo host, el nuevo esquema y la nueva red alcanzada es una forma muy común de convertir una validación aparentemente razonable en una puerta lateral hacia recursos que la funcionalidad nunca debió poder tocar.

---

## Próximo tema

**Resolver DNS una vez no siempre alcanza**
