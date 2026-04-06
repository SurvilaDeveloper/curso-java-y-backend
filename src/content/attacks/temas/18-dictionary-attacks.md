---
title: "Dictionary attacks"
description: "Qué son los dictionary attacks, cómo se diferencian de la fuerza bruta pura y por qué siguen siendo efectivos cuando las contraseñas reflejan hábitos previsibles de las personas."
order: 18
module: "Ataques contra autenticación"
level: "intro"
draft: false
---

# Dictionary attacks

En el tema anterior vimos los ataques de fuerza bruta, donde un atacante intenta acertar una credencial probando múltiples combinaciones hasta dar con una válida.

Ahora vamos a ver una variante muy importante y muy frecuente: los **dictionary attacks**.

La idea general de este ataque es sencilla:

> en lugar de probar combinaciones completamente arbitrarias, el atacante prueba palabras, patrones y contraseñas que tienen altas probabilidades de haber sido elegidas por personas reales.

Eso vuelve el ataque mucho más eficiente en muchos contextos, porque no todas las contraseñas posibles son igual de probables.

Muchas personas repiten hábitos previsibles:

- palabras comunes
- nombres propios
- fechas
- combinaciones simples
- pequeñas variaciones sobre términos conocidos
- patrones fáciles de recordar

Y justamente ahí es donde el dictionary attack gana fuerza.

---

## Qué es un dictionary attack

Un **dictionary attack** es un ataque contra autenticación basado en probar listas de contraseñas probables en lugar de recorrer el espacio completo de combinaciones posibles.

Esas listas pueden incluir:

- palabras frecuentes
- contraseñas comunes
- variantes simples
- patrones culturales o de idioma
- combinaciones relacionadas con hábitos humanos

La lógica del ataque no es “intentar todo”, sino:

> intentar primero lo que tiene más probabilidad de funcionar.

Por eso, aunque se relaciona con la fuerza bruta, no es exactamente lo mismo.

---

## Por qué se llama “dictionary”

Se usa ese nombre porque históricamente este ataque se apoyaba en listas de palabras, como si el atacante trabajara con un “diccionario” de términos frecuentes.

Hoy el concepto es más amplio.

No se limita a palabras del idioma.  
También puede incluir:

- contraseñas reutilizadas
- combinaciones previsibles
- secuencias cortas
- patrones derivados de comportamiento humano
- listas reales extraídas de hábitos frecuentes

La idea importante es que el ataque se basa en **probabilidad**, no en exhaustividad total.

---

## Diferencia con la fuerza bruta pura

Esta distinción conviene dejarla clara.

### Fuerza bruta pura
Busca acertar una credencial a través de intentos sistemáticos, sin depender necesariamente de palabras probables.

### Dictionary attack
Prioriza contraseñas que las personas suelen usar o construir con frecuencia.

Podría decirse así:

- la fuerza bruta confía más en la repetición sistemática
- el dictionary attack confía más en la previsibilidad humana

Esto hace que, en muchos escenarios reales, el dictionary attack sea más práctico y rentable que la fuerza bruta pura.

---

## Por qué este ataque sigue siendo tan relevante

Sigue siendo muy relevante porque mucha gente todavía elige contraseñas que son:

- cortas
- fáciles de recordar
- culturalmente previsibles
- relacionadas con nombres, fechas o palabras conocidas
- ligeramente modificadas para “parecer seguras” aunque no lo sean demasiado

Por ejemplo, una persona puede pensar que una contraseña es suficientemente fuerte porque:

- mezcla mayúsculas y minúsculas
- agrega un número al final
- usa un símbolo simple
- parte de una palabra conocida

Pero desde la lógica de un dictionary attack, muchos de esos patrones siguen siendo bastante previsibles.

---

## Qué busca lograr un atacante con este ataque

El objetivo suele ser el mismo que en otros ataques contra autenticación:

- obtener acceso a una cuenta
- hacerse pasar por un usuario legítimo
- acceder a información privada
- usar la cuenta como punto de partida para otras acciones
- llegar a recursos de mayor valor

La diferencia está en el modo de aproximación.

El atacante no intenta todo lo posible.  
Intenta primero lo más probable.

Y eso puede reducir mucho el tiempo, el ruido y la cantidad de intentos necesarios.

---

## Por qué suele ser más eficiente que la fuerza bruta total

Probar todas las combinaciones posibles puede ser inviable si el espacio es muy grande.

En cambio, si muchas personas usan contraseñas previsibles, al atacante le conviene empezar por las más comunes o razonables.

Eso vuelve al dictionary attack especialmente útil cuando:

- las contraseñas son elegidas por humanos sin mucha disciplina
- no hay MFA
- faltan límites de intentos
- el sistema no detecta bien patrones repetidos
- existen cuentas expuestas a internet
- hay poca conciencia sobre la calidad real de una contraseña

En esos contextos, atacar el hábito humano puede ser mucho más rentable que intentar cubrir todo el espacio matemático de posibilidades.

---

## Qué tipos de contraseñas favorecen este ataque

Sin dar ejemplos operativos específicos, podemos decir que este ataque se ve favorecido por contraseñas que siguen patrones muy comunes.

Por ejemplo, cuando una contraseña se basa en:

- una palabra reconocible
- una estructura simple
- información personal o contextual
- una pequeña variación sobre algo obvio
- costumbres compartidas por muchas personas

La idea clave es esta:

> cuanto más humana, cómoda y predecible sea la construcción de la contraseña, más útil puede volverse este tipo de ataque.

---

## Qué papel juega el conocimiento del contexto

Este ataque se vuelve todavía más peligroso cuando el atacante sabe algo sobre la víctima o el entorno.

Por ejemplo, si ya obtuvo información previa sobre:

- idioma
- contexto cultural
- nombres relevantes
- marcas o proyectos
- hábitos organizacionales
- estructura de usuarios
- estilo general de contraseñas usadas por una comunidad

No hace falta conocer la contraseña exacta.  
A veces alcanza con entender mejor **cómo podría pensar quien la eligió**.

Esto conecta directamente con los temas anteriores de reconocimiento y preparación.

---

## Relación con la ingeniería social y la huella pública

La huella pública de una persona u organización puede aumentar la utilidad de este ataque.

Si hay mucha información visible sobre:

- nombres
- equipos
- marcas
- proyectos
- fechas
- costumbres
- formas de nombrar recursos

eso no significa que la contraseña esté publicada, pero sí puede ayudar a que el atacante construya una mejor idea de qué tipo de patrones podrían haber sido usados.

Es decir:

> el dictionary attack no siempre se apoya solo en listas genéricas; también puede mejorar cuando hay contexto.

---

## Qué factores reducen su efectividad

Como en el caso de la fuerza bruta, este ataque pierde mucha fuerza cuando el sistema aplica buenas defensas.

### Contraseñas realmente robustas

Cuando una contraseña no sigue hábitos previsibles, el valor de probar listas comunes cae mucho.

### MFA

Aunque el atacante acierte la contraseña, el acceso final puede quedar bloqueado por un segundo factor.

### Rate limiting y fricción progresiva

Si el sistema limita intentos o agrega demoras, el ataque se vuelve mucho menos rentable.

### Monitoreo

Si los intentos repetidos generan alertas o investigación temprana, el ataque puede detectarse antes de que tenga éxito.

### Educación de usuarios

Si las personas entienden por qué una contraseña “cómoda” suele ser débil, disminuye la tasa de éxito de este tipo de ataque.

---

## Qué señales puede dejar un dictionary attack

Este tipo de ataque puede parecerse bastante a otros intentos repetidos sobre autenticación.

Algunas señales posibles son:

- muchos intentos fallidos sobre una cuenta
- pruebas consecutivas con patrones de acceso previsibles
- actividad de login desde ubicaciones o fuentes anómalas
- secuencias repetitivas de fallos
- intentos sobre cuentas de alto valor
- patrones repetidos concentrados sobre el punto de acceso

No siempre es sencillo distinguirlo de otras variantes solo por los logs, pero sí puede formar parte de una actividad de autenticación sospechosa que merece revisión.

---

## Diferencia con credential stuffing

Esta distinción también conviene dejarla clara.

### Dictionary attack
Prueba contraseñas probables construidas a partir de hábitos o listas de términos frecuentes.

### Credential stuffing
Usa pares de usuario y contraseña filtrados previamente en otros incidentes.

En el dictionary attack el atacante **estima** qué contraseñas podrían funcionar.  
En credential stuffing el atacante ya parte de credenciales que alguna vez fueron válidas en otro contexto.

Ambos ataques pueden ser peligrosos, pero su lógica no es la misma.

---

## Diferencia con password spraying

También es útil distinguirlo de otra técnica cercana.

### Dictionary attack
Suele concentrarse más en probar listas de contraseñas probables sobre una cuenta o conjunto reducido de cuentas.

### Password spraying
Suele probar pocas contraseñas comunes sobre muchas cuentas distintas para evitar bloquear rápidamente una sola.

La frontera práctica a veces puede mezclarse, pero conceptualmente es útil separarlas porque los patrones defensivos y de detección pueden variar.

---

## Ejemplo conceptual

Imaginá una aplicación con login expuesto, sin MFA y sin una política fuerte de contraseñas.

Además, los usuarios tienden a elegir claves que:

- sean fáciles de recordar
- partan de palabras conocidas
- agreguen una mínima variación

En ese contexto, un atacante no necesita una estrategia totalmente exhaustiva.  
Le alcanza con apoyarse en la previsibilidad humana.

Ese es el corazón del dictionary attack:

> usar la costumbre humana como ventaja ofensiva.

---

## Qué puede hacer una organización para defenderse mejor

Desde una mirada defensiva, algunas medidas importantes son:

- exigir contraseñas más robustas y menos previsibles
- aplicar MFA
- limitar intentos de autenticación
- monitorear patrones de fallos repetidos
- proteger especialmente cuentas privilegiadas
- educar sobre malas prácticas frecuentes al elegir contraseñas
- revisar políticas que incentiven variaciones triviales en lugar de fortaleza real
- no confiar solo en complejidad superficial, sino en calidad real del secreto

La idea no es solo endurecer el sistema técnicamente, sino también reducir la dependencia de hábitos inseguros de las personas.

---

## Error común: pensar que una pequeña variación ya vuelve segura a una contraseña

No siempre.

Agregar una mínima modificación a algo muy previsible no necesariamente cambia mucho el panorama.

Si la estructura sigue siendo muy humana y reconocible, el ataque puede seguir siendo viable.

Ese es uno de los motivos por los que las reglas de contraseña basadas solo en “poner una mayúscula y un número” no siempre alcanzan.

---

## Error común: creer que este ataque solo funciona contra usuarios inexpertos

No necesariamente.

Incluso personas con experiencia técnica pueden caer en hábitos como:

- reutilizar estructuras conocidas
- construir contraseñas memorables pero predecibles
- aplicar variaciones pequeñas a un patrón viejo
- depender demasiado de comodidad y repetición

El problema no es solo “falta de conocimientos”, sino la tensión entre seguridad y facilidad de recordar.

---

## Idea clave del tema

Un dictionary attack es un ataque contra autenticación que prueba listas de contraseñas probables en lugar de recorrer exhaustivamente todas las combinaciones posibles.

Su fuerza está en aprovechar la previsibilidad humana.

Por eso sigue siendo relevante cuando existen:

- contraseñas débiles o demasiado humanas
- controles de autenticación pobres
- falta de MFA
- poca conciencia sobre cómo construir secretos realmente fuertes

---

## Resumen

En este tema vimos que:

- un dictionary attack prueba contraseñas probables en vez de recorrer todas las combinaciones
- se basa en hábitos y patrones humanos previsibles
- se diferencia de la fuerza bruta pura, del credential stuffing y del password spraying
- puede ser muy eficiente cuando las contraseñas son fáciles de anticipar
- su efectividad baja mucho con contraseñas robustas, MFA, límites de intentos y monitoreo
- el reconocimiento previo puede mejorar aún más este tipo de ataque

---

## Ejercicio de reflexión

Pensá en una organización con:

- login público
- cuentas comunes
- cuentas administrativas
- políticas de contraseña poco exigentes
- ausencia de MFA en parte del sistema

Intentá responder:

1. ¿qué prácticas de los usuarios favorecerían un dictionary attack?
2. ¿qué parte del contexto organizacional podría ayudar a construir mejores hipótesis de contraseña?
3. ¿qué señales aparecerían si este ataque se intentara?
4. ¿qué controles bajarían más su probabilidad de éxito?
5. ¿qué diferencia habría entre defender una cuenta común y una privilegiada?

---

## Autoevaluación rápida

### 1. ¿Qué es un dictionary attack?

Es un ataque que prueba listas de contraseñas probables en lugar de intentar todas las combinaciones posibles.

### 2. ¿En qué se diferencia de la fuerza bruta pura?

En que prioriza patrones humanos frecuentes en lugar de basarse principalmente en la exhaustividad total.

### 3. ¿Por qué sigue siendo efectivo?

Porque muchas personas siguen eligiendo contraseñas previsibles o con variaciones triviales.

### 4. ¿Qué defensa reduce mucho su efectividad?

Contraseñas robustas, MFA, rate limiting, monitoreo y mejores prácticas de gestión de acceso.

---

## Próximo tema

En el siguiente tema vamos a estudiar el **credential stuffing**, una técnica en la que el atacante ya no intenta adivinar credenciales probables, sino reutilizar credenciales reales filtradas previamente en otros servicios o incidentes.
