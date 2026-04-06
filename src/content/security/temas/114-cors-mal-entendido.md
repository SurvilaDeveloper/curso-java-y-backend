---
title: "CORS mal entendido"
description: "Cómo pensar CORS correctamente en una aplicación Java con Spring Boot. Por qué no es un mecanismo general de autorización ni un firewall del backend, qué problema del navegador intenta resolver y qué errores aparecen cuando se lo usa como si protegiera más de lo que realmente protege."
order: 114
module: "HTTP, headers y superficie del navegador"
level: "base"
draft: false
---

# CORS mal entendido

## Objetivo del tema

Entender qué es **CORS** en una aplicación Java + Spring Boot y, sobre todo, qué **no es**.

La idea de este tema es desarmar una de las confusiones más frecuentes en APIs y backends modernos.

CORS suele escucharse en frases como:

- “abramos CORS para que funcione el frontend”
- “cerrá CORS para que nadie entre”
- “si el origin no está permitido, ya está protegido”
- “CORS evita que usen mi API”
- “CORS es seguridad del backend”

Todo eso mezcla cosas verdaderas con otras bastante equivocadas.

Porque CORS sí importa.
Y mucho.
Pero el error suele estar en atribuirle un poder que no tiene.

En resumen:

> CORS no es un sistema general de autorización ni una barrera universal de acceso al backend.  
> Es, sobre todo, una política del navegador sobre qué páginas de otros orígenes pueden leer ciertas respuestas de tu servidor.

---

## Idea clave

CORS significa **Cross-Origin Resource Sharing**.

Está relacionado con una regla base del navegador llamada, en términos generales, **same-origin policy**.

La intuición útil es esta:

- una página cargada desde un origen
- no debería poder leer libremente respuestas de otro origen
- salvo que ese otro origen lo permita explícitamente

Ahí aparece CORS.

La idea central es esta:

> CORS no le dice al mundo “quién puede llamar tu backend”.  
> Le dice al navegador “en qué casos una página de otro origen puede leer la respuesta”.

Ese matiz cambia muchísimo la conversación.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- usar CORS como si fuera autorización de API
- asumir que una API pública ya está “cerrada” porque no permite ciertos origins
- pensar que un atacante no puede usar el backend si el navegador bloquea la lectura
- abrir CORS a cualquier origen por comodidad sin entender impacto
- mezclar controles de navegador con controles reales del servidor
- no distinguir entre requests hechas por navegadores y requests hechas por otras herramientas o sistemas
- creer que un fallo de CORS equivale a un bloqueo completo del acceso
- diseñar confianza de frontend apoyándose solo en el header
- no entender por qué una app “funciona en Postman” aunque falle en el navegador

Es decir:

> el problema no es no usar CORS.  
> El problema es entender mal qué capa controla y creer que protege más de lo que realmente protege.

---

## Error mental clásico

Un error muy común es este:

### “Si CORS bloquea, entonces la API está protegida”

Eso es falso.

Porque CORS no impide, en términos generales, que alguien:

- haga requests desde otro backend
- use `curl`
- use Postman
- use scripts fuera del navegador
- use otro cliente HTTP
- consuma la API desde un servidor intermedio

### Lo que CORS afecta principalmente es

si **un navegador** permite que una página de otro origen lea la respuesta.

### Idea importante

Cuando CORS bloquea, muchas veces la request todavía salió.
Lo que cambia es qué puede hacer el navegador con esa respuesta dentro del contexto web.

---

## CORS no es autenticación

Esto conviene dejarlo muy claro.

CORS no responde preguntas como:

- ¿quién es este usuario?
- ¿está autenticado?
- ¿tiene permiso para esta acción?
- ¿puede ver este recurso?
- ¿puede modificar esto?

Eso lo resuelven otras capas:

- autenticación
- sesiones
- tokens
- autorización
- validación de ownership
- lógica de negocio

### Regla sana

Aunque el origin esté permitido por CORS, el backend igual debe verificar autenticación y autorización reales.

Y aunque el origin no esté permitido, eso no reemplaza esos controles.

---

## CORS no es autorización entre frontends y APIs

Otra confusión muy frecuente es pensar:

- “solo mi frontend puede usar esta API porque es el único origin permitido”

Eso también es una simplificación peligrosa.

### Porque en la práctica

un actor puede seguir intentando llamar la API fuera del navegador.
Y, si la API no tiene controles reales de autenticación/autorización, CORS no la salva.

### Idea importante

Permitir o negar un origin no equivale a definir qué clientes o actores están autorizados en términos de negocio.

Es una política de navegador, no un modelo de permisos del backend.

---

## Qué sí controla CORS

Una forma útil de decirlo es esta:

> CORS controla bajo qué condiciones un navegador acepta compartir con una página de un origen la respuesta que vino de otro origen.

Eso puede involucrar cosas como:

- qué origin está permitido
- qué métodos o headers se aceptan
- si se permiten credenciales
- cuándo el navegador necesita hacer preflight
- si la respuesta es visible para el frontend o queda bloqueada

### Idea útil

No es “quién puede hacer requests al servidor” en sentido absoluto.
Es “cómo coopera el navegador en un escenario cross-origin”.

---

## Same-origin policy: la base mental correcta

CORS se entiende mucho mejor si primero tenés clara la idea de base:

los navegadores no permiten libremente que cualquier página lea cualquier cosa desde cualquier otro origen.

### ¿Por qué?

Porque, si eso fuera completamente libre, una página maliciosa podría intentar leer respuestas de otros sitios donde el usuario ya tiene contexto, sesión o cookies.

Entonces la misma-origin policy pone una barrera base.
Y CORS es una forma de abrir, con reglas, ciertos casos donde esa lectura sí se quiere permitir.

### Idea importante

CORS no nace para proteger tu backend de todo el mundo.
Nace para modular una restricción del navegador sobre lectura cross-origin.

---

## “Funciona en Postman” y “falla en el navegador”: por qué pasa

Este es uno de los síntomas más típicos de no entender bien CORS.

Una API puede funcionar perfecto en:

- Postman
- curl
- tests backend
- scripts
- otros servidores

y fallar en un navegador.

### ¿Por qué?

Porque esas herramientas no están sujetas al mismo modelo de seguridad del navegador.
CORS aparece fuertemente cuando el cliente es una página web corriendo en un browser.

### Idea útil

Si algo “anda fuera del navegador pero no dentro”, muchas veces no es que el backend dejó de funcionar.
Es que el navegador no está permitiendo compartir la respuesta en ese contexto cross-origin.

---

## CORS no evita CSRF

Esta confusión también aparece muchísimo.

Algunos equipos creen que, como CORS está restringido, entonces ya no tienen que pensar tanto en:

- CSRF
- cookies
- requests automáticas del navegador
- acciones realizadas con contexto de sesión

Eso es una mala base.

### Porque CORS y CSRF son problemas distintos

- CORS trata de **lectura/control de respuesta cross-origin**
- CSRF trata de **requests hechas con el contexto del usuario sin que este lo quiera**

### Idea importante

Que una página no pueda leer la respuesta no significa necesariamente que no haya podido disparar la request.

Y ese detalle es clave.

---

## Request y lectura no son exactamente lo mismo

Esta es una de las ideas más importantes del tema.

Mucha gente imagina CORS así:

- “si no está permitido, la request no existe”

Pero no es una buena intuición general.

En muchos casos, la request puede ocurrir.
Lo que el navegador restringe es la capacidad de la página atacante o no autorizada para **leer** la respuesta de la forma que esperaría.

### Idea útil

Pensar “request” y “lectura de respuesta” como dos cosas distintas aclara muchísimo qué hace y qué no hace CORS.

---

## Qué pasa con cookies y credenciales

Acá la conversación se vuelve aún más delicada.

Cuando entran en juego:

- cookies
- sesiones
- credenciales del navegador
- frontends autenticados

CORS necesita pensarse con mucho más cuidado.

### Porque la pregunta ya no es solo

- “¿qué origin puede leer?”

sino también

- “¿qué origin podría intentar interactuar con un backend donde el navegador ya tiene contexto del usuario?”

### Idea importante

Cuando hay credenciales, una configuración floja de CORS puede ampliar mucho la confianza entre frontend y backend más de lo saludable.

---

## `Access-Control-Allow-Origin` no es una lista de usuarios confiables

Este error aparece mucho en equipos chicos.

Se tiende a pensar que poner ahí un origin es más o menos equivalente a decir:

- “confío en esta aplicación”
- “autorizo este cliente”
- “solo este frontend está legitimado”

Eso es más fuerte de lo que realmente expresa el header.

### Lo que expresa mejor es algo así

- “si una página cargada desde este origen hace esta request en el navegador, estoy dispuesto a que el browser le permita leer la respuesta bajo estas condiciones”

### Idea importante

Es una confianza de navegador y de origen web.
No una identidad fuerte de actor en términos de negocio.

---

## Abrir CORS a `*` no siempre significa lo mismo

Otra confusión frecuente es pensar que “poner todo abierto” tiene un impacto simple y uniforme.

No es tan lineal.

El efecto depende de cosas como:

- qué tipo de API es
- si hay credenciales
- qué datos devuelve
- quién la consume
- si realmente es pública
- qué orígenes deberían estar permitidos

### Regla sana

No conviene usar `*` como reflejo automático para “que funcione”.
Primero preguntate:

- ¿esta API es realmente pública?
- ¿qué se está permitiendo leer?
- ¿qué pasa si cualquier página del mundo puede consumir esto desde el navegador?

---

## Una API pública no siempre necesita CORS amplio

Esto también merece claridad.

Si una API es genuinamente pública, puede ser razonable permitir más.
Pero aun así conviene preguntarse:

- ¿es pública en datos, en lectura o también en uso intensivo?
- ¿hay límites de volumen?
- ¿qué frontends deberían consumirla?
- ¿qué exposición adicional crea desde browsers de terceros?

### Idea útil

Pública no significa automáticamente “abramos CORS a todo sin pensar”.
Depende del modelo de consumo y del abuso esperado.

---

## CORS también es una conversación de producto y arquitectura

No es solo una línea en un config.

Cuando decidís CORS, estás respondiendo preguntas como:

- ¿qué frontend habla con qué backend?
- ¿qué dominios son legítimos?
- ¿qué relación existe entre entornos?
- ¿qué parte de la app vive en otro origen?
- ¿qué confianza querés establecer entre ellos?
- ¿qué cambios de dominio o despliegue esperás soportar?

### Idea importante

Una mala configuración de CORS suele revelar una arquitectura web confusa o una relación frontend-backend poco explicitada.

---

## Staging, local y producción: otra fuente de errores

CORS se rompe mucho en la práctica por cosas como:

- habilitar origins locales de más en producción
- dejar dominios viejos
- abrir staging por comodidad
- copiar configuraciones entre entornos
- permitir muchos subdominios “por si acaso”
- no limpiar orígenes heredados

### Regla sana

Igual que con secretos y entornos, CORS también debería seguir una política de separación y mínima apertura.

---

## Preflight: síntoma útil, no magia

No hace falta entrar todavía en detalle de implementación, pero sí conviene nombrar una idea:

en ciertos casos el navegador hace una request previa para preguntar si ciertas operaciones cross-origin están permitidas.

Eso suele llamarse **preflight**.

### Idea útil

No lo pienses como “la seguridad real”.
Pensalo como parte del protocolo por el cual el navegador negocia si va a permitir la operación cross-origin en ese contexto.

### Idea importante

Que el preflight exista no vuelve automáticamente segura la API.
Sigue siendo una política del browser, no autorización del backend.

---

## CORS flojo + cookies + frontend confiado = mala combinación

Este suele ser uno de los escenarios más delicados.

Si una app:

- usa cookies o sesiones
- expone recursos sensibles
- y además abre CORS con demasiada amplitud hacia ciertos orígenes

entonces puede estar ampliando la superficie entre orígenes más de lo prudente.

### Regla sana

Cuanto más credencial y más sesión haya en juego, menos sentido tiene pensar CORS como “detalle para que el frontend ande”.

Se vuelve una decisión seria de confianza entre superficies web.

---

## No mezcles “origen permitido” con “acción permitida”

Otra vez: que un origin esté permitido no debería significar que:

- la acción es válida
- el usuario puede hacerla
- el recurso le pertenece
- la request es sana
- el dato es público

### Idea importante

CORS puede permitir que un frontend lea una respuesta.
Eso no reemplaza la lógica de seguridad del backend sobre **qué** debería responder realmente.

---

## Qué señales muestran que el equipo entendió mal CORS

Hay varios síntomas bastante claros.

### Ejemplos

- “si no está en CORS, nadie puede usar la API”
- “ya no hace falta preocuparse tanto por auth”
- “abramos `*` para salir del paso”
- “si falla en el navegador, la API está mal”
- “como está bloqueado por CORS, no hay riesgo”
- “permitamos todos los entornos para no renegar”
- “nuestro frontend está autorizado porque su origin figura ahí”

### Idea importante

Todas esas frases mezclan el modelo del navegador con el modelo de seguridad del backend.

---

## Qué conviene revisar en una app Spring

Cuando revises CORS en una aplicación Spring, mirá especialmente:

- qué frontends reales consumen la API
- qué orígenes están permitidos hoy
- si hay diferencias entre local, staging y producción
- si la app usa cookies o credenciales
- si el equipo entiende que CORS no reemplaza auth
- qué endpoints sensibles se exponen cross-origin
- si hay `*` por comodidad
- si quedaron origins viejos o heredados
- si la confianza entre orígenes está explícitamente justificada
- si la respuesta del navegador final coincide con lo que el equipo cree haber configurado

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- origins permitidos bien justificados
- menos amplitud por costumbre
- mejor separación entre entornos
- comprensión clara de que CORS es política del navegador
- backend con auth y autorización reales independientemente de CORS
- menos dependencia de “abramos más para que funcione”
- mejor claridad entre qué frontend consume qué API y bajo qué confianza

---

## Señales de ruido

Estas señales merecen revisión rápida:

- usar CORS como sustituto de autorización
- origins abiertos de más
- `*` puesto sin análisis
- credenciales y cookies en juego con política laxa
- copiar configuración entre entornos
- orígenes heredados que nadie recuerda
- frases del equipo que tratan CORS como firewall del backend
- no distinguir entre request realizada y respuesta leída

---

## Checklist práctico

Cuando revises CORS, preguntate:

- ¿qué frontends realmente necesitan consumir esta API desde navegador?
- ¿qué orígenes están permitidos hoy y por qué?
- ¿estamos usando CORS como si fuera auth?
- ¿hay cookies o credenciales involucradas?
- ¿qué endpoints sensibles están expuestos cross-origin?
- ¿qué pasaría si el navegador permite leer estas respuestas desde otro origen?
- ¿qué configuración quedó abierta solo para desarrollo y nunca se limpió?
- ¿qué parte del equipo sigue confundiendo request con lectura de respuesta?
- ¿qué política estamos expresando realmente al navegador?
- ¿qué reducirías primero para hacer CORS más preciso y menos cosmético?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Qué frontends la consumen realmente desde navegador?
2. ¿Qué orígenes tiene permitidos hoy?
3. ¿Qué parte de esa lista sobra?
4. ¿La app usa cookies, sesiones o credenciales?
5. ¿Qué endpoint sensible te preocuparía más si una página de otro origen pudiera leerlo?
6. ¿Qué creencia equivocada sobre CORS aparece más en tu equipo?
7. ¿Qué cambio harías primero para que CORS exprese una confianza más precisa y menos improvisada?

---

## Resumen

CORS es una política del navegador sobre qué páginas de otros orígenes pueden leer ciertas respuestas de tu backend.

No es:

- autenticación
- autorización
- firewall general
- control absoluto de quién puede usar la API

Sí es:

- una forma de modular la same-origin policy
- una decisión de confianza entre superficies web
- una capa importante cuando hay frontends en otros orígenes, cookies o respuestas sensibles

En resumen:

> un backend más maduro no usa CORS como si fuera un escudo general y tampoco lo abre por reflejo para “que ande el frontend”.  
> Lo configura entendiendo que está negociando con el navegador qué relaciones cross-origin quiere permitir, sabiendo que la seguridad real del recurso sigue dependiendo de autenticación, autorización y diseño correcto del backend, no del hecho de que cierto origin figure o no en un header.

---

## Próximo tema

**Credentials y Access-Control-Allow-Origin**
