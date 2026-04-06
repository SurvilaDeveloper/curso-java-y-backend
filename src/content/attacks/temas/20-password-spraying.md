---
title: "Password spraying"
description: "Qué es el password spraying, cómo se diferencia de la fuerza bruta y del credential stuffing, y por qué puede ser efectivo cuando existen contraseñas comunes y controles débiles de autenticación."
order: 20
module: "Ataques contra autenticación"
level: "intro"
draft: false
---

# Password spraying

En los temas anteriores vimos dos lógicas importantes de ataque contra autenticación:

- **fuerza bruta**, donde se prueban muchas combinaciones hasta acertar una válida
- **credential stuffing**, donde se reutilizan credenciales filtradas previamente en otros servicios

Ahora vamos a estudiar otra técnica muy relevante: el **password spraying**.

La idea general de este ataque es distinta a la de insistir mucho sobre una sola cuenta.

En este caso, el atacante suele hacer algo más estratégico:

> probar una pequeña cantidad de contraseñas comunes sobre muchas cuentas distintas, en lugar de probar muchas contraseñas sobre una sola cuenta.

Eso vuelve al password spraying especialmente interesante en entornos donde existen:

- muchas cuentas accesibles desde un mismo punto de autenticación
- contraseñas débiles o frecuentes
- falta de MFA
- monitoreo insuficiente
- políticas de bloqueo centradas en una sola cuenta
- controles que castigan la insistencia local, pero no detectan el patrón distribuido

---

## Qué es un password spraying

Un **password spraying** es un ataque contra autenticación en el que se prueban unas pocas contraseñas probables o comunes sobre una gran cantidad de cuentas distintas.

La lógica ofensiva es esta:

- elegir una contraseña o un conjunto muy reducido de contraseñas
- aplicarlas sobre muchas identidades diferentes
- evitar insistir demasiado sobre una sola cuenta
- reducir el riesgo de activar bloqueos tempranos o alertas demasiado obvias

La idea importante es que el atacante no busca tanto agotar posibilidades sobre una cuenta, sino aprovechar el hecho de que, dentro de un conjunto grande de usuarios, siempre puede existir alguien que use una clave débil o común.

---

## Por qué se diferencia de otros ataques

Este punto es clave, porque muchas veces se mezclan ataques de autenticación distintos.

### Fuerza bruta
Prueba muchas combinaciones sobre una cuenta o recurso hasta encontrar una válida.

### Dictionary attack
Prueba listas de contraseñas probables, normalmente apoyadas en hábitos humanos previsibles.

### Credential stuffing
Reutiliza credenciales filtradas previamente en otro contexto.

### Password spraying
Prueba pocas contraseñas comunes sobre muchas cuentas diferentes.

La diferencia central del password spraying es esta:

> en lugar de concentrar la presión sobre una sola identidad, distribuye el intento entre muchas.

Eso cambia bastante tanto la lógica ofensiva como las señales defensivas que conviene observar.

---

## Por qué este ataque puede ser efectivo

Puede ser efectivo porque muchas organizaciones tienen simultáneamente varios problemas:

- una gran cantidad de cuentas
- login accesible desde internet
- usuarios con hábitos previsibles
- controles de bloqueo pensados para insistencia local sobre una sola cuenta
- poca visibilidad sobre patrones distribuidos
- ausencia de MFA o controles adaptativos

En ese contexto, el atacante no necesita acertar muchas cuentas.  
A veces le alcanza con comprometer una o unas pocas que tengan valor suficiente.

Esto hace que el password spraying sea una técnica de alta relación entre esfuerzo y recompensa cuando la madurez defensiva es baja.

---

## Qué busca lograr un atacante con este ataque

El objetivo inicial suele ser conseguir **al menos una cuenta válida** con el menor ruido posible.

A partir de esa primera cuenta comprometida, el atacante puede:

- acceder a información privada
- aprender más sobre el entorno
- moverse hacia recursos internos
- escalar privilegios
- usar la cuenta como punto de apoyo para nuevas acciones
- preparar ataques más dirigidos
- intentar pivotear hacia identidades de mayor valor

Esto muestra algo importante:

> el atacante no necesita comprometer muchas cuentas para que el ataque valga la pena.

A veces una sola cuenta correcta ya cambia por completo el panorama.

---

## Por qué este ataque intenta evitar bloqueos tempranos

Muchas defensas básicas de autenticación fueron pensadas para detectar algo como esto:

- muchos intentos fallidos
- sobre una sola cuenta
- en poco tiempo

Eso sirve bastante bien contra ciertos ataques de fuerza bruta más directos.

Pero el password spraying intenta rodear justamente ese patrón.

En lugar de insistir demasiado sobre un mismo usuario, el atacante reparte pocos intentos entre muchos.

Eso puede ayudarlo a:

- evitar bloqueos inmediatos por cuenta
- reducir señales demasiado obvias
- mezclarse mejor con el volumen total de autenticaciones
- generar menos ruido concentrado sobre un único objetivo

No significa que sea invisible, pero sí que puede ser más difícil de detectar si el monitoreo no está preparado.

---

## Qué papel juegan las contraseñas comunes

El password spraying depende mucho de que existan contraseñas frecuentes o suficientemente previsibles dentro de una población amplia de usuarios.

La lógica del atacante no es:

> “voy a encontrar la contraseña de esta persona en particular”.

La lógica suele ser más bien:

> “si pruebo una contraseña muy común sobre suficientes cuentas, es probable que alguna la use”.

Esto se vuelve especialmente relevante cuando:

- la organización no exige buenas políticas de contraseña
- los usuarios reutilizan patrones simples
- existen claves corporativas débiles
- hay hábitos colectivos de elección insegura
- se permite mantener contraseñas previsibles durante mucho tiempo

---

## Por qué una sola cuenta comprometida puede ser suficiente

En entornos reales, comprometer una sola cuenta puede ser suficiente para generar mucho daño, dependiendo de cuál sea y qué permisos tenga.

Por ejemplo, una cuenta comprometida podría permitir:

- leer correos o mensajes internos
- acceder a recursos compartidos
- aprender estructura organizacional
- consultar datos de clientes o usuarios
- encontrar documentación interna
- descubrir paneles o procesos críticos
- lanzar nuevas acciones desde una identidad legítima

Y si esa cuenta tiene valor especial, el impacto crece todavía más.

---

## Qué cuentas suelen ser más valiosas

No todas las cuentas interesan por igual.

Un atacante puede encontrar mucho más valor en:

- administradores
- soporte
- moderadores
- operadores
- cuentas con acceso a datos sensibles
- identidades con privilegios extendidos
- usuarios que funcionan como puente hacia otros sistemas

Pero incluso una cuenta de bajo privilegio puede ser muy útil si sirve para:

- hacer reconocimiento interno
- entender flujos de acceso
- descubrir información adicional
- preparar un paso posterior

---

## Qué señales puede dejar el password spraying

Aunque intente ser menos ruidoso que otras variantes, este ataque sí puede dejar señales.

Algunas posibles huellas son:

- muchos intentos fallidos distribuidos entre muchas cuentas
- una misma contraseña o un mismo patrón aplicado a múltiples usuarios
- actividad de login anómala sobre un conjunto grande de identidades
- intentos repartidos en el tiempo para evitar bloqueos
- accesos fallidos coordinados desde pocas fuentes o desde fuentes cambiantes
- combinación de varios fallos dispersos seguida por uno o más accesos exitosos

La clave es que el patrón puede no ser evidente si se observa cuenta por cuenta.  
A veces solo aparece cuando se mira el conjunto.

---

## Por qué puede ser difícil de detectar

Puede ser difícil de detectar si la organización solo monitorea eventos de autenticación de forma aislada.

Por ejemplo, si se mira solamente:

- cuántos fallos tuvo una cuenta
- si una cuenta quedó bloqueada
- si hubo muchos intentos consecutivos sobre un único usuario

entonces puede pasarse por alto un patrón distribuido.

El password spraying exige mirar correlaciones como:

- muchas cuentas distintas
- pocas contraseñas comunes
- actividad coordinada en ventanas de tiempo
- intentos similares repetidos en bloque o en campañas

Eso requiere una mirada más contextual y menos local.

---

## Relación con el reconocimiento previo

Como en muchos otros ataques, el reconocimiento previo puede mejorar bastante esta técnica.

Por ejemplo, si el atacante ya conoce:

- qué usuarios existen
- cómo se forman las cuentas
- qué parte del entorno expone autenticación
- qué identidades parecen más valiosas
- qué políticas débiles podría tener la organización

entonces puede enfocar mejor:

- a qué cuentas apuntar primero
- en qué sistemas vale la pena insistir
- qué accesos podrían abrir más puertas

Esto conecta muy bien el bloque anterior del curso con el inicio de los ataques de autenticación.

---

## Ejemplo conceptual

Imaginá una organización con:

- muchas cuentas corporativas
- login expuesto a internet
- contraseñas no demasiado robustas
- ausencia de MFA
- bloqueo temporal solo cuando una misma cuenta acumula muchos fallos seguidos

En ese entorno, un atacante no necesita probar muchas contraseñas sobre una sola cuenta.

Le basta con tomar una contraseña muy probable y distribuir su prueba sobre muchas identidades.

Si una sola cuenta la usa, ya consiguió un punto de entrada.

Ese es el corazón del password spraying:

> explotar la debilidad estadística de un conjunto amplio, no insistir en una víctima individual.

---

## Qué defensas reducen mucho su efectividad

Hay varias defensas que pueden reducir de forma importante la efectividad de este ataque.

### MFA

Es una de las más importantes.  
Aunque la contraseña sea correcta, un segundo factor puede bloquear el acceso final.

### Políticas de contraseña más sólidas

Si las personas no usan claves comunes o demasiado previsibles, cae mucho la probabilidad de acierto.

### Detección de patrones distribuidos

No alcanza con mirar solo cuenta por cuenta.  
Conviene correlacionar actividad entre múltiples identidades.

### Protección especial para cuentas sensibles

Las cuentas privilegiadas deberían tener controles más fuertes y monitoreo más fino.

### Fricción adaptativa

Controles que reaccionan según contexto, origen, velocidad o comportamiento pueden dificultar campañas automatizadas.

### Monitoreo y respuesta temprana

Una buena visibilidad puede detectar el patrón antes de que el atacante consiga acceso útil.

---

## Qué puede hacer una organización para defenderse mejor

Desde una mirada defensiva, algunas ideas clave son:

- aplicar MFA, especialmente en cuentas críticas y, si es posible, de forma más amplia
- exigir contraseñas más robustas y menos previsibles
- revisar políticas que permiten claves demasiado comunes
- monitorear patrones distribuidos entre muchas cuentas
- no depender solo del bloqueo local de una cuenta
- proteger especialmente login públicos expuestos
- revisar actividad de autenticación fuera de patrón
- clasificar y reforzar cuentas de alto valor

La defensa madura contra este ataque depende mucho de mirar el sistema como conjunto y no solo como cuentas aisladas.

---

## Error común: pensar que pocos intentos no son peligrosos

Sí pueden serlo.

En password spraying, justamente el atacante evita muchos intentos sobre una sola cuenta.

Eso significa que, si la organización solo busca “muchos fallos en un usuario”, puede no detectar nada relevante aunque el ataque esté en curso.

A veces el riesgo no está en el volumen local, sino en el patrón global.

---

## Error común: creer que si la cuenta no es privilegiada entonces no importa

No necesariamente.

Una cuenta común puede seguir siendo útil para:

- reconocimiento interno
- acceso a información privada
- preparación de otros ataques
- suplantación del usuario
- descubrimiento de recursos y flujos
- escalada posterior

Por eso conviene no subestimar accesos “intermedios”.

---

## Idea clave del tema

Password spraying es un ataque contra autenticación en el que se prueban pocas contraseñas comunes sobre muchas cuentas distintas para aumentar la probabilidad de acierto y reducir bloqueos tempranos sobre una sola identidad.

Su eficacia crece cuando existen:

- contraseñas comunes
- muchas cuentas accesibles
- ausencia de MFA
- monitoreo débil
- controles que observan solo el caso individual y no el patrón distribuido

---

## Resumen

En este tema vimos que:

- el password spraying distribuye pocos intentos sobre muchas cuentas distintas
- se diferencia de la fuerza bruta, del dictionary attack y del credential stuffing
- busca evitar bloqueos locales y aprovechar contraseñas comunes dentro de una población amplia
- puede comprometer una cuenta útil con relativamente poco esfuerzo
- requiere monitoreo distribuido para detectarse bien
- MFA, contraseñas robustas y mejor correlación de eventos reducen mucho su efectividad

---

## Ejercicio de reflexión

Pensá en una organización con:

- cientos de cuentas corporativas
- login expuesto a internet
- políticas de contraseña mejorables
- bloqueo por cuenta, pero poco monitoreo global
- ausencia de MFA para parte de los usuarios

Intentá responder:

1. ¿por qué este entorno podría favorecer un password spraying?
2. ¿qué señales serían visibles solo si se mira el conjunto y no una cuenta aislada?
3. ¿qué cuentas serían más delicadas si fueran comprometidas?
4. ¿qué defensa tendría más impacto inmediato?
5. ¿qué parte del monitoreo mejorarías primero?

---

## Autoevaluación rápida

### 1. ¿Qué es el password spraying?

Es un ataque que prueba pocas contraseñas comunes sobre muchas cuentas distintas para buscar accesos válidos.

### 2. ¿En qué se diferencia de la fuerza bruta?

En que no insiste mucho sobre una sola cuenta, sino que distribuye el intento entre muchas identidades.

### 3. ¿Por qué puede evitar algunos bloqueos tempranos?

Porque muchos controles básicos reaccionan a muchos fallos sobre una sola cuenta, no a pocos fallos repartidos entre muchas.

### 4. ¿Qué defensa reduce mucho su efectividad?

MFA, contraseñas robustas, monitoreo distribuido y protección reforzada de cuentas sensibles.

---

## Próximo tema

En el siguiente tema vamos a estudiar los **ataques contra preguntas de recuperación**, una categoría muy importante porque muestra cómo mecanismos secundarios de acceso pueden debilitar toda la autenticación si se apoyan en información demasiado fácil de obtener o inferir.
