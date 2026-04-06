---
title: "Preflight requests"
description: "Qué son las preflight requests en CORS dentro de una aplicación Java con Spring Boot, por qué el navegador las envía antes de ciertas operaciones cross-origin y qué errores aparecen cuando se las trata como si fueran autenticación o seguridad adicional del backend."
order: 117
module: "HTTP, headers y superficie del navegador"
level: "base"
draft: false
---

# Preflight requests

## Objetivo del tema

Entender qué son las **preflight requests** dentro de CORS en una aplicación Java + Spring Boot y por qué no conviene tratarlas como si fueran una capa mágica de seguridad adicional.

La idea de este tema es aclarar una parte de CORS que genera muchísima confusión en la práctica.

Muchos equipos ven que el navegador, antes de ciertas requests cross-origin, manda otra request previa y entonces piensan cosas como:

- “ahí se valida si puede entrar”
- “eso ya agrega seguridad”
- “si pasa el preflight, entonces la operación está autorizada”
- “el preflight protege la API”
- “si falla el preflight, nadie pudo tocar nada”

Todo eso mezcla cosas distintas.

En resumen:

> una preflight request no es autenticación ni autorización del backend.  
> Es una consulta previa del navegador para saber si, en ese contexto cross-origin, debería permitir la request principal.

---

## Idea clave

Una **preflight request** es una request preliminar que el navegador puede enviar antes de la request real cuando considera que la operación cross-origin tiene características que requieren una negociación previa.

Esa request previa suele preguntar, en términos simples:

- ¿este método está permitido?
- ¿estos headers están permitidos?
- ¿este origin puede hacer esta operación cross-origin?
- ¿el navegador debería seguir adelante con la request real?

La idea central es esta:

> la preflight no existe para “proteger tu backend del mundo”.  
> Existe para que el navegador resuelva si va a cooperar con esa operación cross-origin bajo la política CORS que declaraste.

Eso cambia totalmente cómo hay que interpretarla.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- creer que la preflight reemplaza autenticación o autorización
- pensar que si la preflight falla entonces el backend quedó “inaccesible”
- confundir la request previa del navegador con una validación de negocio
- no distinguir entre request preliminar y request real
- diseñar seguridad del backend apoyándose demasiado en CORS
- no entender por qué el navegador a veces manda primero `OPTIONS`
- abrir CORS “para que pase la preflight” sin revisar qué se está autorizando realmente
- asumir que Postman o curl deberían comportarse igual que el navegador
- tratar la preflight como si fuera una barrera de acceso general y no una negociación del browser

Es decir:

> el problema no es que exista la preflight.  
> El problema es entender mal su rol y atribuirle una seguridad que pertenece a otras capas.

---

## Error mental clásico

Un error muy común es este:

### “La preflight protege mi endpoint”

Eso es demasiado optimista.

Porque la preflight es, principalmente, parte del comportamiento del navegador en un escenario cross-origin.

No significa que:

- el endpoint solo exista si pasa la preflight
- otro cliente HTTP no pueda intentar llamar igual
- la autorización del recurso ya esté resuelta
- la operación de negocio ya esté validada

### Idea importante

La preflight ayuda al navegador a decidir si avanzará con la request real.
No convierte automáticamente al endpoint en una fortaleza.

---

## Qué suele enviar el navegador primero

En muchos casos, el navegador manda una request previa de tipo:

- `OPTIONS`

No hace falta obsesionarse todavía con la mecánica exacta.
Lo importante es el modelo mental:

> antes de hacer cierta operación cross-origin que no considera “simple”, el navegador consulta si el servidor declara que esa combinación de origin, método y headers está permitida.

### Idea útil

No es una operación de negocio.
Es una negociación de protocolo y de política entre navegador y servidor.

---

## Cuándo suele aparecer una preflight

No toda request cross-origin genera una preflight.
Aparece sobre todo cuando el navegador detecta que la operación no entra en la categoría más simple o trivial.

### Por ejemplo, cuando intervienen cosas como:

- métodos menos triviales que un GET básico
- ciertos headers personalizados
- combinaciones que el navegador considera más sensibles
- escenarios con más complejidad cross-origin

### Idea importante

No hace falta memorizar cada regla exacta para entender lo esencial:
**la preflight aparece cuando el navegador quiere negociar antes de permitir una operación cross-origin menos simple**.

---

## Request previa y request real no son lo mismo

Este es uno de los puntos más importantes del tema.

A veces el equipo las mezcla mentalmente y piensa:

- “ya llegó la request”
- “ya pasó seguridad”
- “ya validamos lo importante”

Pero no.

### La preflight
pregunta si el navegador debería permitir el siguiente paso.

### La request real
es la que intenta hacer efectivamente la operación que importa para el negocio.

### Idea útil

La preflight es como una consulta de capacidad o permiso del navegador.
No es la ejecución de la lógica de negocio.

---

## Qué responde el backend en una preflight

El backend, frente a esa request previa, suele devolver headers CORS que le dicen al navegador algo como:

- qué origin está permitido
- qué métodos acepta
- qué headers permite
- si hay credenciales
- cuánto tiempo puede recordar esta decisión en ciertos casos

### Idea importante

Esa respuesta no dice:

- “el usuario puede borrar esto”
- “el recurso pertenece a esta cuenta”
- “la sesión está autorizada para esta operación”

Dice algo más cercano a:

- “esta operación cross-origin, vista desde el navegador, entra o no en la política que declaré”

---

## No es autenticación

Otra vez: esto conviene repetirlo mucho.

La preflight no responde preguntas como:

- ¿quién es el usuario?
- ¿la sesión es válida?
- ¿este token es correcto?
- ¿el actor tiene permiso real?

Eso lo resuelven otras capas del backend.

### Regla sana

Que la preflight salga bien no implica que la request real vaya a estar autenticada ni autorizada correctamente.

Y que salga mal tampoco convierte al recurso en intrínsecamente inaccesible para todo el mundo.

---

## No es autorización de negocio

Tampoco responde preguntas como:

- ¿puede este usuario editar?
- ¿puede borrar?
- ¿es dueño del recurso?
- ¿pertenece al tenant correcto?
- ¿esta operación está permitida en este estado?

### Idea importante

La preflight nunca debería reemplazar:
- autorización
- ownership
- reglas de dominio
- validación contextual

Confundir esas capas es una receta para sobrestimar CORS y debilitar la seguridad real.

---

## “Funciona en Postman” y “falla por preflight”: por qué

Este es uno de los síntomas más típicos en proyectos web.

La API puede responder bien en:

- Postman
- curl
- pruebas backend

pero el navegador puede fallar por preflight.

### ¿Qué significa eso?

No que la API “no funcione”.
Sino que el navegador, en ese contexto cross-origin, no recibió la negociación CORS que necesitaba para seguir adelante con la request real.

### Idea útil

La preflight es parte de la lógica de seguridad del navegador.
No de todas las herramientas cliente del universo.

---

## Request real bloqueada por el navegador no equivale a endpoint protegido del todo

Este también es un matiz muy importante.

Si el navegador no sigue adelante porque la preflight falla, eso significa que, en ese contexto browser-based, la operación no fue autorizada por la política CORS.

Pero no significa necesariamente que:

- otros clientes no puedan intentar la llamada
- el backend esté protegido por eso de forma general
- el recurso no necesite auth real

### Regla sana

Nunca apoyes la seguridad central del recurso en el hecho de que “el navegador hace preflight y falla si algo está mal”.

---

## Preflight y seguridad percibida: una falsa sensación frecuente

A veces el equipo ve muchas requests `OPTIONS`, headers CORS y respuestas negociadas, y siente que hay “más seguridad” de la que realmente hay.

### Porque parece que

- hay una validación previa
- el navegador consulta antes
- algo está filtrando o aprobando
- “no cualquiera puede pasar”

Eso puede inducir a sobrevalorar la capa.

### Idea importante

La preflight sí agrega una barrera en el modelo del navegador.
Pero no sustituye las barreras reales del backend.

---

## Qué pasa cuando la app usa cookies o credenciales

Esto se conecta con los dos temas anteriores.

Cuando hay:

- cookies
- sesión
- credenciales cross-origin

la preflight se vuelve parte de una negociación más sensible.
Pero sigue sin ser autorización real.

### Lo que cambia es que ahora la pregunta del navegador es más delicada:
- “¿voy a permitir que esta página de otro origin intente esta operación con un backend donde puede haber contexto autenticado?”

### Idea importante

Con cookies en juego, la importancia del CORS sube.
Pero la naturaleza de la preflight no cambia:
sigue siendo una negociación de browser, no una decisión de negocio.

---

## También puede aparecer confusión con métodos y headers

En la práctica, muchas veces la preflight falla porque:

- el método no está permitido
- cierto header no fue contemplado
- la política no coincide con lo que el frontend intenta mandar
- la configuración entre frontend y backend está desalineada

### Problema típico

El equipo, apurado, abre todo para que “deje de fallar”.

### Regla sana

No conviertas el preflight en una molestia a apagar.
Tomalo como una señal de que el navegador está pidiendo claridad sobre una operación cross-origin que el backend todavía no definió con precisión suficiente.

---

## Abrir más por comodidad puede agrandar demasiado la política

Esto pasa muchísimo.

Como la preflight molesta en desarrollo, algunos equipos responden con algo como:

- permitir más methods
- permitir más headers
- abrir más origins
- agregar excepciones por reflejo

### Problema

Eso puede transformar una negociación puntual en una política CORS mucho más amplia y riesgosa de lo que realmente necesitabas.

### Idea importante

La preflight duele menos cuando la política es clara.
Duele más cuando se usa a los golpes como debugging de integración.

---

## No toda complejidad cross-origin merece ser aceptada

Otra intuición útil es esta:

si una operación cross-origin requiere demasiadas aperturas, conviene preguntarse:

- ¿este frontend realmente necesita hacer esto?
- ¿ese header personalizado era necesario?
- ¿ese método cross-origin tiene sentido?
- ¿ese caso de uso debería existir así?

### Idea útil

La preflight no solo te muestra qué abrir.
A veces también te hace preguntar si el flujo mismo estaba bien planteado.

---

## Qué rol tiene el cache de preflight

Sin entrar en detalle fino, conviene saber que el navegador puede recordar por un tiempo ciertas decisiones de preflight según lo que el backend indique.

### Eso sirve para
- no repetir la negociación en cada request
- reducir ruido
- mejorar eficiencia

### Pero no cambia lo conceptual
No transforma la preflight en auth, ni en permiso de negocio, ni en una protección general del endpoint.

### Idea importante

El cache mejora comportamiento operativo del navegador.
No cambia la naturaleza de la capa.

---

## Apps con múltiples frontends: más razones para entender bien esto

Si una API Spring es consumida por:

- frontend principal
- backoffice
- app de soporte
- staging frontend
- previews
- dominios locales

entonces la política de preflight puede volverse más compleja.
Y más fácil de abrir de más por cansancio.

### Regla sana

Cuantos más consumers browser-based tengas, más importante es entender preflight como una negociación precisa, no como un obstáculo genérico a desactivar.

---

## Qué conviene revisar en una app Spring

Cuando revises preflight requests en una aplicación Spring, mirá especialmente:

- qué operaciones cross-origin disparan preflight
- qué origins están involucrados
- qué methods y headers se están negociando
- si la respuesta CORS realmente coincide con el contrato esperado
- si el equipo abrió demasiado por resolver rápido
- si se está confundiendo preflight con seguridad real del recurso
- qué cookies o credenciales pueden entrar en juego
- qué entornos o frontends están agregando complejidad innecesaria
- si la política expresa una decisión consciente o solo una serie de ajustes acumulados

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- entendimiento claro de qué operaciones generan preflight
- menor confusión entre request previa y request real
- configuración CORS más precisa
- menos aperturas por desesperación
- mejor alineación entre frontend y backend sobre methods y headers
- comprensión clara de que auth y autorización viven en otras capas
- menos mito alrededor de “la preflight protege la API”

---

## Señales de ruido

Estas señales merecen revisión rápida:

- creer que la preflight es seguridad fuerte del backend
- abrir methods y headers “hasta que ande”
- no distinguir entre navegador y otros clientes HTTP
- frases como “si falla el preflight, nadie puede usar la API”
- usar CORS para suplir auth o autorización
- no saber qué request es la previa y cuál la real
- tratar el `OPTIONS` como ruido incomprensible en vez de como negociación explícita

---

## Checklist práctico

Cuando revises preflight requests, preguntate:

- ¿qué operaciones cross-origin de mi app están generando preflight?
- ¿por qué la generan?
- ¿qué método real y qué headers se están negociando?
- ¿qué origin está pidiendo esa operación?
- ¿qué parte de la política abrimos solo para que “funcione”?
- ¿estamos confundiendo esta negociación con auth o permiso de negocio?
- ¿qué cliente falla: el navegador o todos?
- ¿qué cookies o credenciales podrían entrar después en la request real?
- ¿qué parte de la configuración CORS quedó demasiado amplia por troubleshooting?
- ¿qué ajuste haría la política más precisa sin romper el caso de uso legítimo?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Qué operación cross-origin te genera más preflights hoy?
2. ¿Qué método y qué headers usa?
3. ¿Qué origin la invoca?
4. ¿La política actual está abierta solo para resolver ese caso o ya quedó demasiado amplia?
5. ¿Qué parte del equipo sigue pensando que la preflight “protege” el endpoint?
6. ¿Qué pasaría si mañana probás la misma llamada desde Postman o curl?
7. ¿Qué cambio harías primero para que la negociación CORS sea más consciente y menos acumulativa?

---

## Resumen

Las preflight requests son una negociación previa del navegador antes de ciertas operaciones cross-origin.
Sirven para decidir si el browser va a permitir la request real según la política CORS que el backend declara.

No son:

- autenticación
- autorización
- una barrera general para todos los clientes
- una defensa suficiente del recurso

Sí son:

- una parte importante del modelo de seguridad del navegador
- una negociación sobre origin, methods, headers y contexto cross-origin
- una fuente común de confusión cuando el equipo mezcla frontend plumbing con seguridad real

En resumen:

> un backend más maduro no mira la preflight como una molestia a desactivar ni como una muralla que ya lo protege de todo.  
> La entiende como lo que realmente es: una conversación previa del navegador sobre si debería dejar avanzar una operación cross-origin, sabiendo que la seguridad del recurso sigue dependiendo de autenticación, autorización y diseño correcto del backend, no del hecho de que haya existido un `OPTIONS` antes de la request importante.

---

## Próximo tema

**Métodos y headers permitidos**
