---
title: "Cómo revisar una codebase Java buscando puntos reales de deserialización"
description: "Cómo revisar una codebase Java y Spring Boot buscando puntos reales de deserialización. Una guía conceptual para detectar dónde se materializan objetos, qué entradas alimentan esos flujos y qué partes del runtime, del classpath o de las dependencias vuelven más delicada esa superficie."
order: 189
module: "Deserialización insegura y materialización de objetos"
level: "base"
draft: false
---

# Cómo revisar una codebase Java buscando puntos reales de deserialización

## Objetivo del tema

Aprender a **revisar una codebase Java + Spring Boot buscando puntos reales de deserialización**, para no depender solo de intuiciones vagas, folklore técnico o búsquedas demasiado obvias como `ObjectInputStream` y nada más.

La idea de este tema es bajar todo el bloque a una práctica muy concreta:

- tenés una codebase
- sabés que la deserialización insegura existe
- ya entendiste que el problema no se limita a serialización nativa
- sabés que JSON, JAXB, colas, archivos y librerías también importan
- pero ahora querés responder la pregunta importante:

> ¿cómo encuentro, en una aplicación real, los lugares donde de verdad se están materializando objetos o estructuras de forma suficientemente poderosa como para merecer revisión?

Esa pregunta importa mucho porque en la práctica la deserialización rara vez aparece con un cartel enorme que diga:

- “hola, acá hay una vulnerabilidad”

Más seguido aparece disfrazada de:

- binding cómodo
- helper de infraestructura
- parser heredado
- consumidor de cola
- rehidratación de caché
- importación documental
- mapper flexible
- o configuración que nadie toca hace años

En resumen:

> revisar una codebase Java buscando deserialización real no consiste solo en encontrar una API famosa,  
> sino en aprender a seguir el camino por el cual bytes o estructuras externas terminan demasiado cerca del sistema de objetos del runtime, del classpath y de las librerías de la aplicación.

---

## Idea clave

La idea central del tema es esta:

> una buena review de deserialización no busca solo “formatos”, sino **momentos de materialización**.

Eso cambia bastante la forma de mirar una codebase.

Porque no alcanza con preguntar:

- ¿entra JSON?
- ¿entra XML?
- ¿hay archivos?
- ¿hay colas?

La pregunta más valiosa es otra:

- **¿en qué puntos de la app esos datos dejan de ser solo entrada y pasan a convertirse en objetos, subtipos, estructuras ricas o instancias cercanas al runtime?**

### Idea importante

La review madura no sigue solo el dato.
Sigue el salto:
- de input
- a materialización.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- revisar solo controllers y no seguir el flujo real de materialización
- buscar solo `ObjectInputStream` y olvidar JSON tipado, JAXB o librerías ocultas
- no distinguir parseo simple de reconstrucción rica
- mirar solo código propio y no librerías o capas de infraestructura
- creer que si una API no “suena” a deserialización entonces no importa
- no conectar classpath, dependencias y configuración con la superficie real del sistema

Es decir:

> el problema no es solo no conocer una API peligrosa.  
> El problema es no tener un método para detectar dónde el sistema está dejando que input externo o semiinterno se acerque demasiado al mundo interno de objetos.

---

## Error mental clásico

Un error muy común es este:

### “Para revisar deserialización alcanza con buscar `Serializable` o `ObjectInputStream`”

Esa búsqueda sirve y puede encontrar cosas muy importantes.
Pero si te quedás solo con eso, perdés una parte grande del mapa.

Porque también importan puntos como:

- JSON binding rico
- polimorfismo en Jackson
- JAXB y unmarshalling
- colas que rehidratan estructuras
- caches o blobs internos
- librerías documentales
- transformaciones opacas
- wrappers de infraestructura
- dependencias que materializan objetos sin que el código de negocio lo muestre

### Idea importante

La review buena no es solo un grep de APIs famosas.
Es una investigación de fronteras de materialización.

---

# Parte 1: Qué significa “punto real de deserialización”

## La intuición simple

Un punto real de deserialización es, a grandes rasgos, un lugar donde:

- entra información desde afuera o desde un medio intermedio
- una librería, framework o componente la interpreta
- y el sistema obtiene algo más que bytes o campos sueltos

Puede obtener, por ejemplo:

- un objeto Java
- una jerarquía
- un subtipo
- un DOM o árbol rico
- una estructura compleja
- una instancia reconstruida
- una representación cercana al dominio interno

### Idea útil

No todo parseo es igual.
No todo binding es igual.
Lo que importa es el nivel de poder que gana la materialización.

### Regla sana

Cuanto más rica es la estructura resultante y cuanto más cerca queda del runtime interno, más merece revisión.

---

# Parte 2: Dónde suele arrancar la búsqueda

Una revisión práctica suele empezar por las entradas más obvias del sistema:

- endpoints HTTP
- consumers de colas
- jobs
- archivos importados
- blobs almacenados
- caches
- conectores con terceros
- integraciones legacy
- herramientas administrativas

### Idea importante

La review no debería terminar ahí.
Pero sí conviene arrancar identificando **qué flujos reciben o recuperan datos que luego podrían materializarse**.

### Regla sana

Primero ubicá dónde entra o reaparece el dato.
Después seguí dónde deja de ser dato y pasa a ser objeto o estructura rica.

---

# Parte 3: Revisar controllers no alcanza

Este punto conviene remarcarlo mucho.

En apps Spring, mucha gente empieza y termina la review en:

- controllers
- `@RequestBody`
- validaciones visibles
- DTOs de entrada

Eso puede servir para una primera pasada.
Pero la deserialización relevante muchas veces está más abajo o más al costado:

- converters
- consumers de mensajería
- adapters
- helpers de infraestructura
- loaders de archivos
- caches
- librerías documentales
- procesos batch
- servicios de integración

### Idea útil

El controller puede ser solo el borde visible de una cadena de materialización mucho más rica.

### Regla sana

Nunca des por terminada una review de deserialización en la capa web.

---

# Parte 4: Qué preguntas conviene hacer al ver un flujo de entrada

Cada vez que veas una entrada, conviene hacerte preguntas como:

- ¿esto se queda en datos simples o termina en objetos ricos?
- ¿la clase destino es fija o flexible?
- ¿hay polimorfismo o subtipos?
- ¿el framework está haciendo más trabajo del que parece?
- ¿se usa serialización nativa, binding JSON, JAXB, transformers o alguna librería propia?
- ¿hay otra capa que rehidrata más tarde lo que ahora solo se recibe?

### Idea importante

La clave no es solo “qué entra”.
La clave es:
- **qué termina existiendo dentro del runtime gracias a eso**.

---

# Parte 5: APIs y señales obvias que sí conviene buscar

Aunque no alcance con eso, sí conviene tener una lista mental de señales fuertes.

## Señales muy importantes
- `ObjectInputStream`
- `Serializable`
- `readObject`
- `ObjectMapper`
- `@RequestBody`
- `JAXBContext`
- `Unmarshaller`
- `MessageConverter`
- consumers de colas
- blobs binarios rehidratados
- loaders de archivos
- caches que devuelven objetos

### Idea útil

Estas no prueban vulnerabilidad por sí solas.
Pero sí marcan lugares donde vale la pena detenerse.

### Regla sana

En una codebase grande, la primera pasada sirve para construir mapa, no para sacar conclusiones instantáneas.

---

# Parte 6: Qué partes de Spring merecen atención especial

En Spring Boot, conviene mirar especialmente:

- endpoints con `@RequestBody`
- custom `HttpMessageConverters`
- configuración de `ObjectMapper`
- consumers de Kafka, RabbitMQ o colas similares
- caches con objetos complejos
- `RestTemplate` o clientes que recuperan datos que luego se materializan
- jobs con `@Scheduled`
- adaptadores de integración
- módulos de import/export
- flujos administrativos poco revisados

### Idea importante

Spring simplifica muchísimo la infraestructura.
Y esa comodidad puede volver menos visibles los puntos reales de materialización.

### Regla sana

En Spring, buscá siempre dónde una abstracción bonita te deja un objeto “ya listo”.
Ahí suele haber trabajo de deserialización que merece mirada propia.

---

# Parte 7: Cómo distinguir parseo simple de materialización delicada

Esta distinción del tema 182 vuelve a ser central.

## Parseo más simple
- DTO fijo
- tipos básicos
- estructura pequeña
- poca magia
- poca cercanía al dominio

## Materialización más delicada
- objetos ricos
- jerarquías
- polimorfismo
- binding cercano al dominio
- rehidratación desde archivos, colas o caches
- classpath que empieza a importar más

### Idea útil

La revisión madura no marca igual ambos escenarios.
Prioriza donde el input decide más estructura interna.

### Regla sana

No todo binding merece la misma alarma.
Pero todo binding rico merece preguntas más duras.

---

# Parte 8: Qué revisar alrededor del `ObjectMapper`

Si aparece Jackson, no alcanza con ver “usa JSON”.
Conviene preguntar:

- ¿qué clases materializa?
- ¿qué endpoints o consumers lo usan?
- ¿hay polymorphic typing?
- ¿hay subtipos?
- ¿hay configuración custom?
- ¿qué parte del payload decide estructura?
- ¿qué distancia hay entre DTO y dominio interno?

### Idea importante

Muchos puntos reales de deserialización moderna en Java viven alrededor de Jackson y no se parecen en nada al ejemplo clásico de serialización nativa.

### Regla sana

Siempre que veas `ObjectMapper`, preguntate si el sistema está leyendo datos o dejando que el payload participe demasiado en el sistema de tipos.

---

# Parte 9: Qué revisar alrededor de archivos, colas y caches

Esto conecta con el tema 186.

Cuando la fuente no es HTTP, conviene mirar:

- qué formato se guarda
- quién lo produce
- quién lo rehidrata
- con qué clase o librería
- cuánto tiempo pasa entre escritura y lectura
- si el classpath o versión cambió
- si la confianza es explícita o simplemente supuesta

### Idea útil

Estos flujos suelen estar lejos del radar del equipo y por eso mismo merecen revisión más intencional.

### Regla sana

Todo medio intermedio que luego vuelve a materializar objetos es una frontera de deserialización, no solo storage o transporte.

---

# Parte 10: Qué revisar en librerías de terceros

Una review de codebase seria no se queda solo en el código propio.
También conviene mirar:

- librerías que acepten input estructurado
- wrappers que materialicen objetos
- frameworks de mensajería
- parsers documentales
- importadores
- bindings automáticos
- SDKs que te “dan el objeto listo”

### Idea importante

La pregunta útil no es:
- “¿esta librería hace deserialización?”
sino:
- “¿esta librería materializa estructuras ricas a partir de input que el equipo no modeló bien?”

### Regla sana

Si una dependencia te devuelve objetos listos, no asumas que el problema desapareció.
Seguí preguntando qué maquinaria hay debajo.

---

# Parte 11: El classpath también se revisa

Este bloque ya dejó claro que el classpath importa mucho.
En una review, eso significa preguntarte:

- ¿qué dependencias están presentes?
- ¿qué módulos amplían materialización o polimorfismo?
- ¿hay frameworks o libs heredadas poco entendidas?
- ¿qué tan rico es el entorno de clases del proceso que rehidrata?

### Idea útil

No hace falta auditar todas las clases del proyecto.
Pero sí entender si el entorno hace que cierta frontera de deserialización sea más o menos peligrosa.

### Regla sana

Cuanto más opaco y más cargado es el classpath, más serio conviene tomarse cualquier punto de rehidratación rica.

---

# Parte 12: Cómo priorizar lo que encontrás

Una vez ubicados los puntos reales de deserialización, no todo vale igual.

Conviene priorizar más alto cuando ves cosas como:

- serialización nativa
- `ObjectInputStream`
- polimorfismo abierto
- objetos ricos o cercanos al dominio
- input no confiable
- classpath muy amplio
- workers con muchos permisos
- flujos heredados poco entendidos
- medios intermedios “internos” tratados con confianza excesiva

### Idea importante

La review no termina en “hay deserialización”.
Sigue con:
- “¿qué tan poderosa, opaca y cercana al runtime es esta materialización?”

### Regla sana

Priorizá por poder del binding, riqueza del runtime y claridad —o falta de claridad— de la frontera de confianza.

---

# Parte 13: Qué errores de review conviene evitar

Hay errores muy típicos:

- revisar solo HTTP
- revisar solo APIs famosas
- no seguir el flujo hasta el punto real de materialización
- no mirar librerías de terceros
- no mirar colas, caches y blobs
- no distinguir DTO cerrado de objeto rico
- no meter el classpath en la conversación

### Idea útil

La review floja suele ser superficial no por mala intención, sino porque el equipo se queda en la capa donde el framework hizo el problema más cómodo y menos visible.

### Regla sana

Si la app “te deja el objeto listo”, ahí no termina la investigación.
Ahí suele empezar.

---

# Parte 14: Qué preguntas conviene dejar respondidas al final de la review

Una buena review debería poder dejar respondido algo como:

- ¿qué puntos reales de deserialización tiene esta app?
- ¿qué flujos son solo parseo simple y cuáles son materialización rica?
- ¿qué mecanismos usa cada uno?
- ¿qué entradas o medios intermedios los alimentan?
- ¿qué classpath y runtime los rodean?
- ¿qué partes están bien acotadas y cuáles abren demasiado poder?
- ¿qué cosas convendría rediseñar, cerrar o simplificar?

### Idea importante

El objetivo final no es encontrar “cosas feas”.
Es producir un mapa claro de dónde el sistema deja que input externo o semiinterno toque demasiado de cerca su mundo interno de objetos.

---

## Qué revisar en una app Spring

Cuando revises una codebase Spring buscando puntos reales de deserialización, mirá especialmente:

- controllers con `@RequestBody`
- configuración y uso de `ObjectMapper`
- colas y consumers
- jobs programados
- blobs y archivos rehidratados
- caches con objetos ricos
- JAXB y unmarshalling
- librerías documentales o de integración
- cualquier punto donde el framework o una dependencia deje objetos “listos” a partir de datos externos o intermedios

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- contratos de entrada pequeños
- DTOs cerrados
- poca serialización nativa
- poco polimorfismo en el borde
- menos magia de binding
- menor dependencia en rehidratación desde storage intermedio
- reviewers capaces de explicar con claridad qué puntos reales de deserialización existen y por qué

### Idea importante

La madurez aquí se nota cuando el equipo ya no revisa por intuición difusa, sino por mapa claro de materialización.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- el equipo no sabe dónde se rehidratan objetos
- solo se revisaron controllers
- hay serialización nativa heredada
- Jackson o JAXB están configurados con demasiada flexibilidad
- colas y caches quedaron fuera del análisis
- el classpath nunca entra en la conversación
- se confunde comodidad del framework con ausencia de superficie riesgosa

### Regla sana

Si no podés señalar con precisión dónde el sistema deja de tener bytes y pasa a tener objetos ricos, todavía te falta la parte importante de la review.

---

## Checklist práctica

Cuando revises una codebase Java buscando deserialización, preguntate:

- ¿dónde entra o reaparece el dato?
- ¿dónde se materializa realmente?
- ¿qué mecanismo hace esa materialización?
- ¿qué tan rico es el objeto resultante?
- ¿qué parte del payload decide estructura?
- ¿qué medios intermedios participan?
- ¿qué classpath y runtime rodean el flujo?
- ¿qué puntos tienen más poder del que el negocio necesita?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya o una codebase conocida y respondé:

1. ¿Cuáles son sus tres puntos más claros de entrada o reentrada de datos?
2. ¿En qué lugares esos datos se convierten en objetos ricos?
3. ¿Qué mecanismos usan: Jackson, serialización nativa, JAXB, colas, caches, archivos?
4. ¿Qué punto te parece más opaco hoy?
5. ¿Qué punto te parece más cercano al classpath real?
6. ¿Qué flujo creías inocente antes de este tema?
7. ¿Qué revisarías primero si tuvieras una hora para auditar deserialización?

---

## Resumen

Revisar una codebase Java buscando puntos reales de deserialización significa aprender a detectar no solo formatos o APIs famosas, sino lugares donde datos externos o semiinternos pasan a materializar estructuras ricas dentro del runtime.

La gran idea del tema es esta:

- la review buena sigue momentos de materialización
- no se queda en el controller
- no se queda en HTTP
- no se queda en APIs famosas
- sigue también colas, caches, blobs, archivos, librerías y classpath
- y prioriza donde el input decide más estructura interna de la que el negocio realmente necesita

En resumen:

> un backend más maduro no audita deserialización como si fuera una lista corta de funciones “malas” para grep, sino como una investigación sobre dónde exactamente el sistema permite que datos externos o intermedios se conviertan en objetos con demasiado poder, demasiada cercanía al runtime o demasiada dependencia del classpath.  
> Y justamente por eso este tema importa tanto: porque deja un método práctico para revisar código real y no solo ejemplos de laboratorio, y ayuda a pasar de una intuición abstracta sobre deserialización insegura a una capacidad concreta de recorrer una codebase Spring y decir con claridad qué puntos de materialización existen, cuáles son realmente delicados y por qué.

---

## Próximo tema

**Cierre del bloque: principios duraderos para evitar deserialización insegura**
