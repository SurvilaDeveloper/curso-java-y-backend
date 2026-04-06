---
title: "HSTS y HTTPS estricto"
description: "Cómo funciona HSTS en una aplicación Java con Spring Boot y por qué ayuda a reforzar el uso estricto de HTTPS en navegadores. Qué problema intenta resolver, qué no resuelve por sí solo y qué decisiones conviene entender antes de activarlo."
order: 104
module: "HTTP, headers y superficie del navegador"
level: "base"
draft: false
---

# HSTS y HTTPS estricto

## Objetivo del tema

Entender qué hace **HSTS** y por qué importa cuando querés que una aplicación Java + Spring Boot use **HTTPS de forma realmente estricta** desde la perspectiva del navegador.

La idea es revisar una simplificación muy común:

- “ya tenemos HTTPS”
- “el certificado está bien”
- “si alguien entra por HTTP, lo redirigimos”
- “entonces ya está resuelto”

Eso mejora mucho, pero no agota el problema.

Porque mientras el navegador siga considerando válido intentar una conexión inicial insegura, todavía existe una ventana donde ciertas degradaciones o desvíos pueden jugar a favor del atacante.

Ahí entra HSTS.

En resumen:

> HSTS no cifra más fuerte el canal por sí mismo.  
> Lo que hace es decirle al navegador que, para ese sitio, deje de tratar HTTP como una opción razonable.

---

## Idea clave

HSTS significa **HTTP Strict Transport Security**.

Es un mecanismo por el cual el backend le indica al navegador algo parecido a esto:

> “A partir de ahora, para este sitio, no quiero que vuelvas a intentar HTTP.  
> Usá siempre HTTPS durante el tiempo que te indico.”

Eso cambia el comportamiento del navegador en futuras visitas.

La idea central es esta:

> HTTPS protege la conexión cuando ya se usa HTTPS.  
> HSTS ayuda a evitar que el navegador vuelva a bajar al terreno inseguro de HTTP por costumbre, error o manipulación.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- creer que redirigir de HTTP a HTTPS ya alcanza siempre
- olvidar la primera visita o el primer intento inseguro
- permitir que el navegador siga tratando HTTP como una opción válida
- subestimar ataques de degradación o desvío en contextos inseguros
- activar HTTPS pero dejar una política de transporte demasiado laxa
- asumir que el navegador “ya va a preferir lo seguro” sin una instrucción explícita y persistente
- habilitar HSTS sin entender consecuencias operativas
- no diferenciar bien entre “tener HTTPS” y “hacer que el navegador lo trate como obligatorio”

Es decir:

> el problema no es solo cifrar el tráfico.  
> El problema también es qué tan fácil sigue siendo para el navegador caer otra vez en una ruta insegura.

---

## Error mental clásico

Un error muy común es este:

### “Si hay redirect de HTTP a HTTPS, listo”

Eso es bastante mejor que no tener nada.
Pero sigue dejando una idea débil:

- el navegador todavía puede intentar HTTP primero
- y recién después ser redirigido

### ¿Por qué importa?

Porque si la primera parte del recorrido ocurre en un contexto inseguro, todavía puede existir una oportunidad para:

- manipular
- desviar
- impedir la redirección
- hacer downgrade
- o generar una experiencia insegura antes de que llegue la protección del canal cifrado

### Idea importante

La redirección mejora el flujo.
HSTS endurece la política del navegador para que ese flujo inseguro deje de ser el comportamiento esperado.

---

## HTTPS y HSTS no son lo mismo

Conviene distinguirlos con mucha claridad.

## HTTPS
Proporciona el canal cifrado y autenticado cuando el navegador ya habla por HTTPS.

## HSTS
Le dice al navegador que, durante cierto tiempo, para ese sitio no vuelva a intentar HTTP.

### Idea útil

Uno protege el canal seguro.
El otro ayuda a que el navegador insista en usar ese canal seguro de forma obligatoria.

---

## Qué cambia en el navegador

Cuando el navegador recibe correctamente la política HSTS desde una respuesta HTTPS válida, recuerda durante un período definido que:

- ese host debe usarse por HTTPS
- no debe intentarse HTTP
- y, si el usuario o un link pide `http://`, el navegador debería reconvertirlo internamente a `https://` antes de hacer la conexión

### Idea importante

El efecto fuerte de HSTS no está solo en esa respuesta puntual.
Está en el comportamiento futuro del navegador.

---

## La primera visita sigue importando

Este es uno de los puntos conceptualmente más importantes.

HSTS ayuda mucho **después** de que el navegador ya recibió la política.
Pero en el caso general, existe una primera vez en la que todavía no la conoce.

### Entonces conviene entender esto bien

- HSTS reduce mucho riesgo en visitas posteriores
- pero no elimina mágicamente todos los riesgos de una primera conexión antes de aprender la política

### Idea útil

Eso no le quita valor.
Solo evita una interpretación exagerada del tipo “con HSTS ya no existe ningún problema de transporte jamás”.

---

## Qué tipo de problema ayuda a reducir

Pensado de forma simple, HSTS ayuda a reducir escenarios donde alguien intenta aprovechar que el navegador todavía acepte HTTP como posibilidad razonable.

### Por ejemplo, ayuda a dificultar

- degradación a HTTP
- navegación inicial insegura por costumbre del usuario
- intentos de mantener al cliente fuera del canal seguro
- exposición innecesaria a redirecciones desde un canal inicialmente inseguro
- ciertas oportunidades de manipulación en redes no confiables

### Idea importante

HSTS no es una defensa universal para toda la seguridad web.
Es una forma de endurecer la política de transporte del lado del navegador.

---

## No reemplaza el buen uso de HTTPS

Esto merece repetirse.

Podés tener HSTS y aun así estar mal si:

- el sitio sirve contenido mixto
- hay configuración TLS floja
- el certificado está mal
- ciertos recursos siguen yendo por HTTP
- la app o el proxy no fuerzan bien HTTPS
- existen endpoints sensibles mal expuestos

### Regla sana

HSTS mejora una capa concreta.
No reemplaza:

- una buena configuración HTTPS
- certificados correctos
- proxies bien configurados
- cookies seguras
- ni el resto de los headers de seguridad

---

## HSTS es especialmente valioso para apps con sesión o navegador tradicional

Aunque cualquier sitio servido a navegador puede beneficiarse, se vuelve especialmente importante cuando tu app maneja cosas como:

- login
- sesión
- cookies
- paneles administrativos
- navegación web tradicional
- backoffice
- contenido sensible servido por navegador

### ¿Por qué?

Porque ahí hay más valor en evitar que el navegador siquiera intente transitar por HTTP.

### Idea útil

Cuanto más web-browser-centric es tu superficie, más relevante suele volverse esta política.

---

## API pura vs app web

Si tu backend expone sobre todo una API consumida por otros clientes no navegador, HSTS tiene menos protagonismo práctico porque su efecto principal es sobre el comportamiento del navegador.

### En cambio, si servís
- HTML
- paneles
- login web
- sesiones
- vistas de usuario
- admin

la discusión gana mucho más peso.

### Idea importante

HSTS no es “menos importante” por ser del navegador.
Simplemente su impacto depende del tipo de cliente que consume tu superficie.

---

## Qué comunica realmente este header

El header HSTS suele expresar ideas como:

- durante cuánto tiempo recordar la política
- si aplica también a subdominios
- y, en ciertos casos, si se aspira a políticas más estrictas como preload

No hace falta memorizar todavía todos los parámetros.
Lo importante en este tema es comprender el sentido:

> no es un header ornamental.  
> Es una instrucción persistente al navegador sobre transporte obligatorio.

---

## Duración: una decisión importante

Una política HSTS no se envía “al aire” sin consecuencias.
El navegador la recuerda por un tiempo.

### Eso significa que elegir la duración importa

Porque una vez recordada:

- el navegador insistirá en HTTPS
- incluso si alguien intenta usar HTTP
- hasta que venza la política o se reemplace

### Idea útil

Una duración muy corta puede volver la protección demasiado débil.
Una duración muy larga exige más confianza en que el sitio y sus subdominios realmente están preparados para sostener esa política.

---

## Subdominios: cuidado con asumir demasiado

Uno de los puntos delicados de HSTS es que ciertas configuraciones pueden extender la política a subdominios.

Eso puede ser bueno cuando querés endurecer toda una familia de hosts.
Pero también exige mucha disciplina.

### Preguntas sanas

- ¿todos los subdominios relevantes están realmente preparados para HTTPS estricto?
- ¿hay alguno heredado o viejo que rompería?
- ¿todos tienen certificados y routing correctos?
- ¿hay superficies olvidadas?

### Idea importante

A veces el error no es “usar HSTS”.
El error es expandir su alcance más allá de lo que realmente controlás bien.

---

## Preload: aún más compromiso

Existe también la idea de **HSTS preload**, que lleva el endurecimiento un paso más allá, porque ciertos navegadores pueden traer pregrabada la instrucción de usar HTTPS para determinados dominios.

### Conceptualmente, eso significa
- reducir aún más la ventana de la primera visita
- pero también asumir un compromiso más fuerte y con más rigor operativo

### Idea útil

No hace falta entrar todavía en el detalle técnico fino.
Alcanza con entender que preload no es “poner un check más”.
Es comprometerse con una política estricta y sostenida.

---

## No activar HSTS a ciegas

Esto también es importante.

HSTS es valioso.
Pero no debería activarse sin revisar cosas como:

- si HTTPS está bien resuelto de verdad
- si todos los caminos relevantes soportan canal seguro
- si ciertos subdominios o superficies quedarían problemáticos
- si hay dependencias operativas o legacy que todavía esperan HTTP
- si el comportamiento del proxy y del backend está alineado

### Regla sana

No lo pienses como “un header más”.
Pensalo como una política que el navegador va a recordar y obedecer.

---

## HSTS y proxies

En muchas arquitecturas, la terminación TLS ocurre en:

- reverse proxy
- load balancer
- ingress
- gateway

Entonces conviene saber bien dónde se agrega HSTS y bajo qué condiciones.

### Porque si no
- la app puede creer una cosa y el proxy otra
- el header puede no salir donde pensabas
- ciertas respuestas pueden quedar inconsistentes
- el sitio puede parecer endurecido cuando no lo está de forma homogénea

### Idea importante

No alcanza con decir “lo ponemos en algún lado”.
Conviene saber exactamente qué capa lo emite y para qué respuestas.

---

## No sirve sobre HTTP

Este punto parece obvio, pero conviene fijarlo.

HSTS debe llegar al navegador a través de una respuesta HTTPS válida.
No tiene sentido confiar en anunciar “HTTPS obligatorio” desde un canal ya inseguro.

### Idea útil

El header fortalece futuras decisiones del navegador.
No reemplaza la necesidad de que la respuesta que lo entrega ya venga por un canal correcto.

---

## HSTS y cookies seguras se refuerzan

Este punto conecta con temas anteriores.

Si tu app usa:

- sesiones
- cookies
- login web

entonces HSTS ayuda a que el navegador no vuelva a intentar un trayecto HTTP donde esa interacción sería más frágil.

### Idea importante

No es la única defensa.
Pero sí mejora el contexto en el que las cookies seguras y la sesión se mueven.

---

## HSTS no arregla contenido mixto ni recursos mal cargados

Otra confusión frecuente es pensar que, con HSTS, todo ya queda automáticamente bien respecto al contenido cargado por la página.

No es así.

Si tu sitio:

- referencia recursos inseguros
- mezcla HTTP y HTTPS
- depende de cargas flojas
- tiene HTML o scripts con prácticas débiles

todavía hay cosas que revisar.

### Regla sana

HSTS endurece la navegación y el transporte principal.
No reemplaza otras políticas web ni corrige decisiones débiles en el contenido mismo.

---

## Qué suele salir mal cuando no lo entendés bien

Hay algunas malas prácticas típicas:

- no usar HSTS nunca “porque con redirect alcanza”
- activarlo sin revisar subdominios
- copiar valores largos sin saber qué implican
- asumir que ya está funcionando cuando solo lo pone un entorno
- confiar en él para resolver problemas que pertenecen a otras capas
- tratarlo como una casilla más del scanner

### Idea importante

Como con otros headers, el valor real aparece cuando entendés la superficie concreta que endurece.

---

## Qué conviene revisar en una app Spring

Cuando revises HSTS en una aplicación Spring, mirá especialmente:

- si la app realmente depende de navegador y navegación web
- si HTTPS está bien resuelto end to end
- qué capa agrega el header
- si sale en las respuestas correctas
- si el sitio tiene dependencias que todavía esperan HTTP
- si hay subdominios heredados o problemáticos
- si la duración es razonable para el nivel de madurez del entorno
- si el equipo entiende qué implicaría extender la política a subdominios o preload
- si se está usando HSTS como defensa complementaria y no como reemplazo de otras correcciones
- si la política cambia inconsistente entre entornos

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- HTTPS bien resuelto de base
- HSTS entendido como política persistente del navegador
- decisión consciente sobre duración
- más prudencia antes de extender a subdominios o preload
- mejor coherencia entre backend, proxy y despliegue
- menos dependencia de redirecciones inseguras como único mecanismo
- integración razonable con cookies seguras y navegación web

---

## Señales de ruido

Estas señales merecen revisión rápida:

- “con redirect alcanza”
- nadie sabe si HSTS sale realmente hoy
- el equipo no distingue entre tener HTTPS y tener política estricta
- subdominios con estado incierto
- configuraciones copiadas sin entender duración o alcance
- uso de HSTS para “pasar auditoría” sin revisar si la app está preparada
- asumir que HSTS corrige contenido mixto, mala configuración TLS o problemas de sesión por sí solo

---

## Checklist práctico

Cuando revises HSTS, preguntate:

- ¿mi app sirve contenido a navegadores o es casi solo API?
- ¿HTTPS está bien resuelto de verdad hoy?
- ¿estamos confiando demasiado en redirects desde HTTP?
- ¿el navegador recibe una política estricta persistente?
- ¿qué capa agrega ese header?
- ¿qué implicaría extender la política a subdominios?
- ¿la duración elegida tiene sentido para nuestro nivel de confianza?
- ¿qué superficie seguiría débil aunque HSTS esté bien puesto?
- ¿el equipo entiende el compromiso que implica preload?
- ¿qué revisarías primero antes de endurecer más esta política?

---

## Mini ejercicio de reflexión

Tomá una app web Spring tuya y respondé:

1. ¿Qué partes de la app dependen realmente del navegador?
2. ¿Hoy el usuario podría llegar por HTTP y luego ser redirigido?
3. ¿El navegador recibe una política HSTS o solo un redirect?
4. ¿Qué subdominios quedarían involucrados si endurecieras más la política?
5. ¿Qué dependencias legacy podrían romperse?
6. ¿Qué falsa sensación de seguridad podrías estar teniendo con “ya usamos HTTPS”?
7. ¿Qué paso harías primero para pasar de canal seguro “opcional” a política más estricta y consciente?

---

## Resumen

HSTS es una forma de decirle al navegador que deje de tratar HTTP como una opción aceptable para un sitio determinado y use HTTPS de manera estricta durante un tiempo.

Su valor principal está en:

- reducir la dependencia de redirecciones desde un canal inicialmente inseguro
- endurecer la navegación futura del navegador
- reforzar la postura web de apps con login, sesión, paneles y contenido sensible

Pero no resuelve por sí solo:

- mala configuración TLS
- contenido mixto
- autorización rota
- problemas de sesión
- otras políticas web ausentes

En resumen:

> un backend más maduro no se conforma con que HTTPS “exista” y luego espera que el navegador se comporte bien por intuición.  
> Usa HSTS cuando corresponde para convertir el canal seguro en política recordada, entendiendo tanto el valor que agrega como el compromiso operativo que exige.

---

## Próximo tema

**X-Content-Type-Options**
