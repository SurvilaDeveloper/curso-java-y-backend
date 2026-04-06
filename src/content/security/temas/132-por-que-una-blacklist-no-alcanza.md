---
title: "Por qué una blacklist no alcanza"
description: "Por qué una blacklist de destinos no suele ser suficiente para mitigar SSRF en una aplicación Java con Spring Boot. Qué limitaciones tiene bloquear solo algunos hosts, IPs o patrones obvios, y por qué conviene pensar primero en destinos permitidos y en el destino final real."
order: 132
module: "Consumo saliente, SSRF y conexiones externas"
level: "base"
draft: false
---

# Por qué una blacklist no alcanza

## Objetivo del tema

Entender por qué una **blacklist** de destinos, nombres o patrones no suele ser suficiente para mitigar riesgo de SSRF en una aplicación Java + Spring Boot.

La idea de este tema es revisar una reacción muy común cuando un equipo descubre que una funcionalidad saliente puede ser peligrosa:

- “bloqueemos `localhost`”
- “bloqueemos `127.0.0.1`”
- “bloqueemos redes privadas”
- “bloqueemos algunas IPs raras”
- “bloqueemos ciertos strings”
- “hagamos una blacklist y listo”

Eso puede aportar algo.
Pero casi nunca alcanza como estrategia central.

Porque en SSRF el problema no es solo que existan un par de destinos obviamente prohibidos.
El problema es mucho más amplio:

- cómo se expresa el destino
- cómo se resuelve
- cómo cambia
- cómo redirige
- qué ve el backend desde su red
- y qué parte del destino final estás dejando fuera del modelo

En resumen:

> una blacklist puede ayudar como capa auxiliar,  
> pero casi nunca debería ser la defensa principal frente a SSRF.

---

## Idea clave

Una blacklist funciona preguntándose:

> “¿qué destinos o patrones quiero prohibir?”

Eso parece razonable.
Pero tiene un problema estructural:

- vos intentás enumerar lo malo
- mientras el espacio de variantes posibles suele ser mucho más grande, más creativo y más cambiante que tu lista

La idea central es esta:

> en SSRF, es más fuerte definir con claridad qué destinos sí son legítimos que intentar adivinar todos los destinos peligrosos posibles.

Porque el backend no necesita conectarse a “todo menos unas pocas cosas”.
Normalmente necesita conectarse a un conjunto bastante más chico y justificable.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- confiar demasiado en bloquear algunos hosts obvios
- creer que una lista de IPs privadas ya cierra el riesgo
- pensar que bloquear ciertos strings del input equivale a controlar el destino real
- asumir que lo peligroso siempre se presenta de forma explícita
- no considerar resolución DNS, redirects o representación alternativa de destinos
- usar blacklists como si fueran una política completa y no una capa parcial
- no distinguir entre “bloqueé algunas cosas conocidas” y “entiendo realmente adónde puede conectarse el backend”

Es decir:

> el problema no es usar una blacklist.  
> El problema es creer que, por sí sola, ya modela bien la superficie de salida del servidor.

---

## Error mental clásico

Un error muy común es este:

### “Si bloqueamos `localhost` y algunas IPs privadas, ya cubrimos lo más importante”

Eso es demasiado optimista.

Porque todavía quedan preguntas como:

- ¿qué pasa con otras representaciones del destino?
- ¿qué pasa con nombres que resuelven a lo bloqueado?
- ¿qué pasa con redirects?
- ¿qué pasa con destinos que no habías pensado?
- ¿qué pasa con cambios en DNS?
- ¿qué pasa con servicios internos no expresados como esas IPs concretas?

### Idea importante

Bloquear algunos casos obvios puede reducir errores groseros.
Pero no equivale a tener control serio del destino final.

---

## Qué suele intentar bloquear una blacklist

Las blacklists suelen enfocarse en cosas como:

- `localhost`
- `127.0.0.1`
- rangos privados
- metadata endpoints conocidos
- ciertos puertos
- ciertos esquemas
- algunos dominios internos
- strings sospechosos

### Eso puede ayudar

Sí, como barrera parcial.
Pero la pregunta clave es:

- ¿qué porcentaje real de la superficie peligrosa está capturando eso?
- ¿y cuánto queda afuera simplemente porque no se te ocurrió enumerarlo o se expresa de otra forma?

### Idea útil

Una blacklist suele cubrir lo obvio mejor que lo flexible.

---

## El problema de enumerar “todo lo malo”

Este es el defecto estructural más importante.

Para que una blacklist fuera suficiente, tendrías que poder enumerar de forma bastante completa:

- hosts peligrosos
- redes privadas
- resoluciones peligrosas
- aliases internos
- nombres DNS privados
- endpoints especiales
- variantes de representación
- destinos posteriores por redirect
- cambios futuros de entorno

### Problema

Ese universo es demasiado grande, variable y dependiente del contexto real del backend.

### Idea importante

En SSRF, lo malo no es un conjunto pequeño y estático.
Por eso una blacklist pura envejece mal.

---

## String bloqueado no equivale a destino bloqueado

Esto conecta con el tema anterior.

Una blacklist muy superficial a veces solo mira:

- el texto de la URL
- ciertos patrones de string
- palabras prohibidas
- algunas IPs escritas de forma directa

### Problema

El destino real puede depender de:

- DNS
- IP final
- redirects
- resolución diferida
- nombres alternativos
- otras capas de construcción

### Idea importante

Bloquear strings es mucho más débil que controlar el destino final al que realmente se conecta el backend.

---

## Los destinos peligrosos no siempre “parecen peligrosos”

Este es otro motivo por el que las blacklists se quedan cortas.

Muchas veces el input riesgoso no se presenta como:

- `http://localhost:...`
- `http://127.0.0.1:...`
- `http://10....`

Puede parecer algo como:

- un hostname normal
- un dominio externo
- un subdominio permitido
- un callback legítimo
- un redirect aceptable
- un ID que luego resuelve a destino

### Idea útil

La blacklist funciona mejor contra lo obvio que contra lo engañoso.
Y SSRF vive bastante de lo engañoso.

---

## DNS y resolución hacen crecer el hueco

Una blacklist basada solo en texto se vuelve especialmente débil cuando entran en juego:

- resolución DNS
- cambios de IP
- hostnames que apuntan a cosas internas
- diferencias entre check y connect
- destinos persistidos que cambian de significado

### Regla sana

Si el destino final se decide después del chequeo textual, la blacklist del input inicial ya no alcanza para darte demasiada tranquilidad.

---

## Redirects: la blacklist suele mirar solo el primer paso

Este patrón aparece mucho.

La app puede bloquear algunos destinos iniciales.
Pero luego sigue redirects y termina conectando a algo que nunca estuvo realmente validado contra la misma lógica.

### Entonces el problema pasa a ser

- ¿qué pasa después del primer hop?
- ¿seguís bloqueando el destino real?
- ¿o la blacklist solo protegía el punto de entrada visible?

### Idea importante

Una blacklist que no modela el recorrido completo suele dejar huecos importantes.

---

## El entorno cambia y la blacklist envejece

Otra limitación muy práctica es que las blacklists dependen mucho del contexto actual del entorno.

Cambian cosas como:

- servicios internos
- metadata endpoints
- redes privadas
- subdominios
- infraestructura cloud
- DNS interno
- sidecars
- herramientas locales
- nuevos proveedores

### Idea útil

La lista que hoy parecía cubrir “lo importante” puede quedar vieja bastante rápido si la arquitectura cambia.

---

## Bloquear lo obvio suele producir falsa sensación de cierre

Este es quizá uno de los daños más peligrosos.

A veces el equipo agrega una blacklist, ve que ciertos payloads simples dejan de funcionar y concluye:

- “listo, quedó cubierto”

### Problema

Eso puede frenar la revisión más profunda de cosas como:

- allowlists reales
- validación del destino final
- resolución DNS
- redirects
- segmentación de funcionalidades
- límites de red e infraestructura

### Idea importante

Una blacklist parcial puede ser peor que nada si genera confianza excesiva y reemplaza defensas mejores.

---

## Qué suele pasar en el código real

En apps reales, las blacklists suelen aparecer como:

- `if url contains "localhost" -> reject`
- bloqueo de algunas IPs privadas
- listas de palabras prohibidas
- regex de exclusión
- filtro de puertos conocidos
- comparación con unos pocos hosts vetados

Eso puede capturar casos triviales.
Pero SSRF rara vez se agota en los casos triviales una vez que la funcionalidad es lo bastante flexible.

### Regla sana

Si tu defensa principal cabe en unas pocas condiciones negativas sobre strings, probablemente estés más cerca de una barrera mínima que de una mitigación robusta.

---

## Blacklist vs allowlist: diferencia de filosofía

Acá conviene contrastarlas con claridad.

### Blacklist
Pregunta:
- “¿qué destinos quiero negar?”

### Allowlist
Pregunta:
- “¿qué destinos sí son legítimos para esta funcionalidad?”

### Idea importante

La segunda pregunta suele ser mucho más alineada con cómo deberían diseñarse los consumos salientes en backend.

Porque la mayoría de las features no necesitan “todo internet menos algunas cosas”.
Necesitan:
- unos pocos destinos
- o una clase de destinos muy acotada
- bien entendida
- y auditada

---

## Hay casos donde la blacklist puede sumar

Esto también conviene decirlo para no caricaturizar.

Una blacklist puede servir como:

- capa complementaria
- red de contención básica
- protección contra errores groseros
- defensa adicional frente a destinos extremadamente conocidos y peligrosos

### Pero no conviene pedirle más de lo que puede dar

No debería ser:
- la única defensa
- la principal línea de confianza
- el sustituto de una allowlist o de validación del destino real

### Idea útil

Blacklist útil: sí.
Blacklist suficiente: casi nunca.

---

## Cuando una allowlist no es viable, igual no alcanza con negar unas pocas cosas

Hay casos donde la funcionalidad realmente necesita más flexibilidad y no podés tener una allowlist súper cerrada.

Incluso ahí, una blacklist sola sigue siendo floja.
Porque todavía importa:

- validar el esquema
- validar el destino real
- revisar resolución
- controlar redirects
- acotar puertos
- revisar tipos de contenido
- reducir alcance de red del backend
- pensar el feature mismo con más límites

### Idea importante

“No puedo tener una allowlist perfecta” no implica “entonces bloqueo algunas cosas obvias y con eso basta”.

---

## Localhost y metadata: buenos candidatos de blacklist, pero no suficientes

Este es un buen ejemplo práctico.

Claro que conviene sospechar y bloquear cosas como:

- localhost
- loopback
- metadata conocida
- redes privadas

Eso está bien como línea mínima.
Pero si te detenés ahí, te seguís perdiendo:

- resolución engañosa
- DNS interno
- redirects
- destinos intermedios
- nombres no obvios
- variaciones del entorno

### Regla sana

Bloquear esos destinos es una base.
No una conclusión.

---

## Lo importante es controlar el destino efectivo, no solo negar algunos inputs

Este es el corazón del tema.

Una defensa madura frente a SSRF se acerca más a preguntas como:

- ¿cuál es el destino final real?
- ¿es legítimo para esta feature?
- ¿qué red puede alcanzar?
- ¿qué redirects seguimos?
- ¿qué resolución tiene?
- ¿qué parte controla el usuario?
- ¿qué lista positiva de destinos sí aceptamos?

### Idea importante

La blacklist suele mirar el borde visible del input.
La defensa buena mira el recorrido completo de la salida.

---

## Qué revisar en una codebase Spring

En una app Spring, merece sospecha si ves defensas del tipo:

- exclusión de unos pocos strings
- bloqueo de algunas IPs obvias
- listas negativas cortas presentadas como “mitigación SSRF”
- mucho foco en negar y poco en modelar qué destinos son legítimos
- follow redirects combinado con una blacklist superficial
- validación textual sin resolución ni chequeo del destino final
- ausencia de una allowlist por feature cuando la funcionalidad sí podría soportarla

### Idea útil

No se trata de eliminar toda blacklist.
Se trata de no engañarte sobre su alcance real.

---

## Qué preguntas conviene hacer en revisión

Cuando veas una blacklist contra SSRF, preguntate:

- ¿qué cubre realmente?
- ¿qué deja afuera?
- ¿mira strings o destino real?
- ¿qué pasa con DNS y redirects?
- ¿qué funcionalidad podría trabajar con una allowlist más concreta?
- ¿la blacklist está como capa adicional o como defensa principal?
- ¿qué falsa tranquilidad le está dando al equipo?
- ¿qué caso no obvio escaparía fácilmente de esta lógica?
- ¿qué parte del riesgo depende del entorno y no está en esa lista?
- ¿qué control positivo falta además de esta negación?

### Regla sana

La pregunta clave no es “¿tenemos blacklist?”.
La pregunta es:
- “¿qué tan cerca estamos de controlar el destino real en vez de solo negar unos pocos casos obvios?”

---

## Qué conviene revisar en una app Spring

Cuando revises por qué una blacklist no alcanza en una aplicación Spring, mirá especialmente:

- validaciones negativas sobre strings de URL
- bloqueos de algunas IPs privadas o localhost
- reglas de exclusión sin allowlist equivalente
- follow redirects
- validación antes de resolución real
- features salientes muy flexibles sin destinos positivos definidos
- confianza excesiva en regex o palabras prohibidas
- si el equipo habla de la blacklist como “la mitigación SSRF” y no como una capa parcial

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- blacklist como defensa auxiliar y no como pilar central
- más foco en allowlists o destinos fijos
- revisión del destino final real
- más conciencia de DNS y redirects
- menos confianza en filtros textuales superficiales
- equipo que entiende bien qué cubre y qué no cubre esta capa

---

## Señales de ruido

Estas señales merecen revisión rápida:

- bloquear `localhost` y asumir que ya está
- lista corta de IPs vetadas presentada como solución
- regex negativa complicada pero sin destino positivo definido
- follow redirects coexistiendo con validación muy superficial
- nadie puede explicar qué casos no obvios se siguen escapando
- la blacklist es la defensa principal y casi única
- el equipo no distingue entre bloquear strings y controlar el destino real

---

## Checklist práctico

Cuando revises una blacklist frente a SSRF, preguntate:

- ¿qué está bloqueando exactamente?
- ¿qué variantes o destinos deja afuera?
- ¿mira el input textual o el destino efectivo?
- ¿qué pasa con DNS?
- ¿qué pasa con redirects?
- ¿existe una allowlist o no?
- ¿esta feature necesita tantos destinos o podría ser más fija?
- ¿qué falsa sensación de cobertura está generando esta blacklist?
- ¿qué control agregarías primero para pasar de negación parcial a confianza positiva real?
- ¿qué caso te preocupa más que esta lógica deje pasar?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Qué features tienen defensa SSRF basada en blacklist?
2. ¿Qué bloquean exactamente?
3. ¿Qué no están mirando todavía?
4. ¿Qué pasa con DNS y redirects en esos flujos?
5. ¿Existe alguna allowlist real o solo exclusiones?
6. ¿Qué falsa tranquilidad le puede estar dando al equipo esa defensa?
7. ¿Qué cambio harías primero para que deje de ser una barrera mínima y pase a integrarse en una defensa más sólida?

---

## Resumen

Una blacklist puede ayudar a bloquear algunos destinos obvios en SSRF, como localhost, ciertas IPs privadas o metadata conocida.
Pero rara vez alcanza por sí sola porque:

- lo peligroso no siempre se presenta de forma obvia
- el destino real puede diferir del string validado
- DNS y redirects complican el panorama
- el backend suele ver más de lo que la blacklist enumera
- el universo de “lo malo” es demasiado grande y cambiante

En resumen:

> un backend más maduro no se conforma con negar algunos destinos que “ya sabemos que son peligrosos” y dar por cerrado el problema.  
> Entiende que la defensa fuerte frente a SSRF no nace de adivinar todos los lugares malos posibles, sino de definir con mucha más precisión a qué destinos sí debería poder conectarse cada funcionalidad, cómo verificar el destino final real y cómo reducir al máximo la distancia entre lo que el sistema aprueba textual y el lugar donde el servidor termina conectando desde su posición privilegiada.

---

## Próximo tema

**Esquemas peligrosos y protocolos inesperados**
