---
title: "DNS rebinding y resolución engañosa"
description: "Cómo pensar DNS rebinding y otros problemas de resolución engañosa en una aplicación Java con Spring Boot al analizar riesgo de SSRF. Por qué no alcanza con validar solo el hostname textual y qué cambia cuando el destino real se decide en tiempo de resolución."
order: 130
module: "Consumo saliente, SSRF y conexiones externas"
level: "base"
draft: false
---

# DNS rebinding y resolución engañosa

## Objetivo del tema

Entender cómo **DNS rebinding** y otros problemas de **resolución engañosa** afectan el análisis de SSRF en una aplicación Java + Spring Boot.

La idea de este tema es corregir otra intuición peligrosa:

- “validamos el hostname”
- “el dominio parece externo”
- “no dice `localhost`”
- “no es una IP privada”
- “el string de la URL se ve razonable”

Todo eso puede sonar tranquilizador.
Pero no siempre alcanza.

Porque en SSRF no importa solo **cómo se ve el destino escrito**.
Importa mucho también:

- cómo se resuelve
- cuándo se resuelve
- a qué IP termina apuntando
- si esa resolución puede cambiar
- y qué hace el backend entre validar y conectar

En resumen:

> una validación basada solo en el nombre textual del host puede ser insuficiente si el destino real se decide después, al resolver DNS o al seguir un recorrido de red que el backend no está controlando con suficiente rigor.

---

## Idea clave

Cuando una aplicación hace una request saliente, muchas veces no conecta directamente con “el string del host”.
Antes de conectar, suele ocurrir algo como:

- resolver el nombre vía DNS
- obtener una o más IPs
- elegir una
- abrir conexión
- quizá seguir redirects
- quizá volver a resolver o reintentar

La idea central es esta:

> el host que validás y el destino real al que conectás no siempre son lo mismo.

Y ahí aparece una zona muy delicada para SSRF.

Porque un atacante puede intentar jugar con esa diferencia entre:

- lo que la aplicación cree estar validando
- y lo que termina conectando de verdad

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- validar solo el hostname textual y dar por cerrado el problema
- asumir que un dominio “bonito” o externo no puede resolver a un destino interno
- no pensar en el momento de resolución DNS
- no considerar que una resolución puede cambiar entre validación y uso
- revisar allowlists solo a nivel de string y no de IP final
- confiar demasiado en que “si el dominio es correcto, el destino también lo será”
- no modelar que la infraestructura DNS también forma parte del recorrido de una request saliente

Es decir:

> el problema no es solo qué host recibió tu app.  
> El problema también es qué IP o destino termina usando realmente después de resolver ese host.

---

## Error mental clásico

Un error muy común es este:

### “Si bloqueo `localhost` y redes privadas en la URL, ya cubrí bastante”

Eso puede ser útil como primera capa.
Pero es insuficiente si el análisis termina ahí.

Porque un hostname como:

- `algo.ejemplo.com`

puede, según cómo esté controlado o resuelto, terminar apuntando a algo muy distinto de lo que el equipo imagina.

### Idea importante

No alcanza con mirar si el string contiene:
- `localhost`
- `127.0.0.1`
- `10.x.x.x`
- `192.168.x.x`

También importa si el nombre resuelve a algo equivalente o peligroso en tiempo de ejecución.

---

## Qué significa “resolución engañosa”

Acá usamos esa expresión de forma amplia para hablar de situaciones donde:

- el nombre parece aceptable
- pero la resolución o el recorrido real no lo son
- o cambia entre validación y conexión
- o termina apuntando a un destino inesperado
- o aprovecha una diferencia entre el momento del chequeo y el momento del uso

### Idea útil

No hace falta obsesionarse todavía con una técnica concreta.
La intuición importante es:

> validar nombres sin pensar en su resolución real deja huecos.

---

## DNS rebinding: intuición general

Sin entrar en ultra detalle de bajo nivel, la intuición más útil es esta:

> un mismo nombre puede no ser tan estable o inocente como parece si la resolución DNS termina cambiando o siendo aprovechada para que el backend conecte a un destino distinto del que el validador creyó aprobar.

La idea de “rebinding” ayuda justamente a pensar este riesgo:
un nombre aparentemente legítimo o externo puede terminar resolviendo hacia algo mucho más delicado.

### Idea importante

No necesitas memorizar una explotación específica para llevarte la lección correcta:
**hostname aceptable no implica destino final aceptable**.

---

## Hostname bonito, IP peligrosa

Esta es una buena forma de resumir el problema.

Muchas validaciones ingenuas confían en algo como:

- si el host se ve bien, está bien
- si termina en un dominio permitido, está bien
- si parece externo, está bien

Pero el peligro real puede estar en que ese host:

- resuelva a una IP privada
- resuelva a `localhost`
- resuelva a infraestructura interna
- cambie su resolución después del chequeo
- rote entre destinos
- o termine redirigiendo a algo peor

### Regla sana

No confundas “nombre aceptable” con “ruta de red aceptable”.

---

## Validación textual vs validación del destino real

Esto marca un salto de madurez muy importante.

### Validación textual
Mira el input como string:
- host
- dominio
- esquema
- formato

### Validación del destino real
Se pregunta además:
- ¿a qué IP resuelve?
- ¿esa IP es aceptable?
- ¿sigue siendo aceptable al momento de conectar?
- ¿hay redirects posteriores?
- ¿estamos conectando al mismo destino que aprobamos?

### Idea importante

Para SSRF, quedarse solo en la primera suele ser demasiado poco.

---

## El problema del tiempo: check vs connect

Uno de los puntos más importantes de este tema es la diferencia entre:

- **cuando validás**
y
- **cuando conectás**

Si entre esos dos momentos puede cambiar algo relevante, aparece una zona de riesgo.

### Por ejemplo, si la app hace algo así:

1. recibe un hostname
2. lo valida
3. resuelve
4. guarda o espera
5. conecta después
6. sigue redirects
7. reintenta o usa otro cliente

### Idea útil

Cuantas más etapas haya entre el check y la conexión efectiva, más importante es preguntarte si el destino real sigue siendo el mismo que aprobaste.

---

## TOCTOU aplicado a SSRF

Sin necesidad de usar demasiada jerga, este tema toca una idea clásica:

- **Time Of Check**
- **Time Of Use**

Es decir:

- una cosa es lo que aprobás en el chequeo
- otra cosa es lo que terminás usando al ejecutar la request

### Idea importante

En SSRF, ese hueco entre “lo validé” y “me conecté” puede ser justo donde la resolución engañosa mete el problema.

---

## Allowlists por dominio: útiles, pero no mágicas

Muchas defensas arrancan por permitir solo ciertos dominios o patrones.
Eso puede ser razonable.
Pero no alcanza con eso si no pensás también:

- quién controla DNS de esos dominios
- qué IPs pueden resolver
- si hay subdominios delegados o flexibles
- si la validación del nombre es más débil que la del destino real
- si puede haber redirect o cambio de resolución después

### Regla sana

Una allowlist de dominio ayuda.
Pero no reemplaza revisar:
- resolución
- IP final
- coherencia entre check y connect

---

## Subdominios y resolución cambiante

Esto conecta con el tema anterior.

Un sistema puede decir:

- “permito `*.cliente-ejemplo.com`”
- “permito subdominios del tenant”
- “permito cualquier host bajo este dominio”

Eso puede sonar controlado.
Pero la pregunta importante es:

- ¿qué tan controlado está realmente el DNS detrás de esos nombres?
- ¿quién puede cambiarlo?
- ¿puede apuntar a destinos internos o inesperados?
- ¿el backend valida solo el sufijo o también el destino real?

### Idea importante

Cuanto más flexible es el control del subdominio, más delicada se vuelve la confianza basada solo en nombre.

---

## Redirects empeoran este problema

Aunque este tema es sobre resolución, vale conectar otra vez con redirects.

Porque incluso si el primer hostname resolvía a algo aceptable, la request puede luego:

- seguir una redirección
- resolver otro host
- llegar a otra IP
- terminar en un destino que el validador nunca aprobó

### Idea útil

La seguridad del destino no termina en la primera resolución.
También importa el recorrido completo que la app acepta seguir.

---

## DNS interno y nombres “legítimos” para la red del backend

Otra cosa importante es que el backend puede resolver nombres que para el usuario externo ni siquiera existen o no significan nada.

Eso incluye:

- dominios internos
- service discovery
- aliases privados
- hosts del cluster
- zonas DNS privadas

### Problema

Un nombre que “no parece una IP privada” puede igual llevar al backend a una infraestructura interna muy sensible.

### Idea importante

En SSRF, la frontera no es solo pública vs privada por apariencia.
También importa qué sabe resolver realmente el runtime.

---

## “No usamos IPs directas” no alcanza como defensa

Algunos equipos se tranquilizan si bloquean inputs tipo:

- `127.0.0.1`
- `169.254.x.x`
- `10.x.x.x`

y obligan a usar hostnames.

Eso puede mejorar algo, pero no cierra el problema.
Porque el hostname puede resolver a algo equivalente o peligroso.

### Regla sana

Bloquear IPs directas puede ser útil.
Pero no debería convertirse en la ilusión de que el destino ya es seguro solo porque se escribió como nombre.

---

## Resolución múltiple y comportamiento de cliente HTTP

Sin entrar a demasiado detalle de implementación, también conviene recordar que:

- un hostname puede resolver a varias IPs
- el cliente HTTP puede elegir una
- puede reintentar
- puede variar entre librerías
- puede comportarse distinto según timeout o red

### Idea útil

Eso hace todavía más importante no confiar ciegamente en la simple inspección del string original.

---

## Metadata endpoints y resolución disfrazada

Esto conecta con el tema anterior.

Un riesgo clásico es creer que un dominio o ruta parecen externos o neutros, cuando en realidad terminan resolviendo o redirigiendo hacia recursos como:

- localhost
- red privada
- metadata endpoints
- servicios internos

### Idea importante

La resolución engañosa es peligrosa justamente porque puede ocultar destinos que, si aparecieran textual y explícitamente, el equipo bloquearía enseguida.

---

## Validar solo antes de persistir tampoco alcanza

A veces la app valida el destino cuando el usuario lo guarda, por ejemplo:

- webhook URL
- callback
- integración externa
- host remoto

pero luego, días después, usa ese valor ya persistido para conectarse.

### Problema

Entre el momento del alta y el momento del uso pueden haber cambiado cosas como:

- DNS
- redirects
- ownership del dominio
- resolución efectiva
- entorno de red

### Idea importante

Una validación puntual al guardar no reemplaza la necesidad de pensar el destino real al momento de usarlo.

---

## Features multi-tenant y white-label: terreno delicado

En sistemas donde cada tenant puede traer:

- su propio dominio
- su callback
- su API base
- su subdominio
- su endpoint de integración

la resolución engañosa merece especial atención.

### Porque ahí el equipo suele confiar en:
- configuración “legítima del cliente”

pero esa confianza puede no traducirse automáticamente en:
- destino de red sano para el backend

### Regla sana

Tenant legítimo no implica destino saliente seguro por default.

---

## Qué revisar en código Spring

En una codebase Spring, este tema debería dispararte sospecha cuando veas cosas como:

- allowlists basadas solo en suffix del dominio
- regex sobre hostnames
- bloqueos de IP textual pero no de resolución final
- validación al guardar y no al usar
- construcción de URLs a partir de hosts o tenants
- follow redirects
- clientes HTTP que resuelven y conectan en momentos separados
- caching o persistencia de destinos remotos
- mucha confianza en “el dominio se ve bien”

### Idea útil

La revisión buena no termina en el parser de URL.
Sigue hasta la conexión efectiva.

---

## Qué preguntas conviene hacer en revisión

Cuando sospeches de resolución engañosa, preguntate:

- ¿qué estamos validando: el string o el destino real?
- ¿cuándo se valida y cuándo se conecta?
- ¿qué pasa si el hostname resuelve a IP privada o localhost?
- ¿qué pasa si la resolución cambia después?
- ¿hay redirects?
- ¿el destino persistido puede cambiar de significado con el tiempo?
- ¿qué capa verifica la IP final?
- ¿qué nombres internos puede resolver este entorno?
- ¿qué allowlist parece más fuerte de lo que realmente es?
- ¿qué parte del diseño asume que el hostname es una identidad estable?

### Regla sana

En SSRF, toda confianza basada en “nombre que parece bueno” merece ser puesta a prueba.

---

## Qué conviene revisar en una app Spring

Cuando revises DNS rebinding y resolución engañosa en una aplicación Spring, mirá especialmente:

- validaciones de hostname o dominio
- allowlists basadas en nombres
- subdominios permitidos
- hosts persistidos en base
- callbacks o endpoints guardados y usados después
- follow redirects
- resolución DNS implícita del cliente HTTP
- diferencias entre validar al guardar y validar al conectar
- potencial acceso a localhost, redes privadas o metadata vía resolución
- cuánto del análisis se apoya solo en strings y no en destino efectivo

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- menos confianza ciega en el hostname textual
- más conciencia del destino real al conectar
- menos allowlists superficiales basadas solo en nombre
- sospecha sana frente a resoluciones dinámicas o persistidas
- mejor entendimiento del hueco entre check y connect
- menos dependencia de “el dominio se ve bien” como argumento principal

---

## Señales de ruido

Estas señales merecen revisión rápida:

- bloquear IPs directas y creer que ya está
- confiar solo en suffix del dominio
- permitir subdominios amplios sin revisar resolución
- validar una vez y usar mucho después sin más controles
- seguir redirects sin revisar el destino final
- nadie puede explicar cuándo se resuelve realmente el hostname
- el equipo no conectó DNS y SSRF como parte del mismo problema

---

## Checklist práctico

Cuando revises este tema, preguntate:

- ¿qué validamos exactamente antes de salir a la red?
- ¿el hostname puede resolver a algo interno o peligroso?
- ¿qué pasa entre la validación y la conexión?
- ¿hay redirects o reintentos?
- ¿los destinos se guardan y luego se reutilizan?
- ¿hay allowlists basadas solo en nombre?
- ¿qué nombres internos resuelve este entorno?
- ¿qué parte del diseño confía demasiado en apariencia textual?
- ¿qué flujo podría cambiar de significado si el DNS cambia?
- ¿qué revisarías primero para verificar el destino real en vez del nombre declarado?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Qué features usan hosts o dominios configurables?
2. ¿La validación mira el nombre o también el destino real?
3. ¿Hay callbacks persistidos que se usan tiempo después?
4. ¿Se siguen redirects?
5. ¿Qué hostname “bonito” te preocuparía si pudiera terminar resolviendo a algo interno?
6. ¿Dónde ves más riesgo de check y use separados?
7. ¿Qué flujo revisarías primero si quisieras descubrir si el dominio aprobado sigue siendo el destino conectado de verdad?

---

## Resumen

DNS rebinding y resolución engañosa recuerdan una lección muy importante de SSRF:

- el host que aprobás
no siempre es
- el destino real al que conectás

Por eso, validar solo el nombre textual, bloquear algunas IPs o confiar en dominios “que se ven bien” puede ser insuficiente si no pensás también en:

- resolución DNS
- IP final
- redirects
- tiempo entre check y connect
- nombres internos accesibles desde el backend
- cambios de significado de destinos persistidos

En resumen:

> un backend más maduro no trata el hostname como si fuera una identidad estable y suficiente para confiar.  
> También revisa qué pasa cuando ese nombre se resuelve, cambia, redirige o se reutiliza en otro momento, porque entiende que en SSRF el verdadero riesgo no está en cómo luce el input original, sino en adónde termina conectando el servidor desde su posición privilegiada y cuánto control real tiene el atacante sobre ese recorrido aunque el string inicial pareciera inocente.

---

## Próximo tema

**Allowlists de destino: qué sí y qué no**
