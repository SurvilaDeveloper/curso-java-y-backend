---
title: "JSON no siempre significa seguridad: deserialización tipada peligrosa"
description: "Cómo entender por qué JSON no garantiza seguridad por sí solo en aplicaciones Java con Spring Boot. Qué vuelve peligrosa a la deserialización tipada, cómo cambia la superficie cuando el input puede influir tipos o subtipos y por qué el problema no desaparece solo por dejar atrás la serialización nativa."
order: 187
module: "Deserialización insegura y materialización de objetos"
level: "base"
draft: false
---

# JSON no siempre significa seguridad: deserialización tipada peligrosa

## Objetivo del tema

Entender por qué **JSON no garantiza seguridad por sí solo** en una aplicación Java + Spring Boot y qué significa realmente hablar de **deserialización tipada peligrosa**.

La idea de este tema es atacar una simplificación muy común en equipos modernos.

Cuando alguien escucha “deserialización insegura en Java”, muchas veces piensa enseguida en:

- serialización nativa
- `Serializable`
- `ObjectInputStream`
- blobs binarios viejos
- flujos heredados medio oscuros

Y, a partir de eso, saca una conclusión demasiado rápida:

- “nosotros ya no hacemos eso”
- “nosotros usamos JSON”
- “entonces este tema ya no debería pegarnos tanto”

Ese salto es peligroso.

Porque aunque JSON sea, en muchos contextos, más simple y más defendible que la serialización nativa clásica, todavía puede volverse una superficie riesgosa si el sistema permite que el input influya demasiado en cosas como:

- tipos
- subtipos
- jerarquías
- estructuras internas
- materialización automática demasiado rica

En resumen:

> el problema no desaparece por pasar a JSON,  
> porque la superficie de riesgo no depende solo del formato, sino de cuánto poder le das al mecanismo de deserialización para decidir qué clase de objeto o estructura interna va a materializar a partir de ese input.

---

## Idea clave

La idea central del tema es esta:

> JSON, por sí mismo, suele ser solo un formato de datos.  
> El riesgo aparece cuando el sistema le suma **tipado flexible, polimorfismo abierto o demasiada cercanía con el modelo interno de objetos**.

Eso cambia mucho la conversación.

Porque una cosa es decir:

- “recibo JSON y lo mapeo a un DTO simple, cerrado y conocido”

Y otra muy distinta es decir:

- “recibo JSON y dejo que el binding o la librería decidan demasiadas cosas sobre qué tipo concreto o subtipo materializar”

### Idea importante

La seguridad no está en el hecho de usar JSON.
Está en cuán **pequeño, explícito y cerrado** es el contrato que ese JSON puede describir dentro del runtime.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- pensar que JSON elimina automáticamente el problema de deserialización insegura
- no distinguir parseo de datos simples de materialización tipada peligrosa
- confiar demasiado en polymorphic typing o en binding flexible
- asumir que si no hay `ObjectInputStream` ya no hay riesgo serio de materialización
- acercar demasiado el payload JSON al modelo interno de objetos del sistema

Es decir:

> el problema no es usar JSON.  
> El problema es permitir que JSON describa demasiado del lenguaje de tipos del backend.

---

## Error mental clásico

Un error muy común es este:

### “Mientras sea JSON, el peor escenario debería ser solo validar mejor algunos campos”

Eso a veces es cierto en flujos muy cerrados.
Pero deja de ser suficiente cuando el binding empieza a permitir cosas como:

- tipos dinámicos
- resolución de subtipos
- estructuras ricas
- mayor cercanía al dominio interno
- deserialización guiada por metadatos tipados

### Idea importante

El riesgo ya no está solo en qué valor trae un campo.
También puede estar en **qué clase de objeto el sistema decide crear** a partir del input.

---

# Parte 1: Por qué JSON da una falsa sensación de seguridad

## El efecto cultural

JSON tiene una reputación de formato simple, moderno y “menos peligroso” que otras formas de serialización.
Y esa reputación tiene algo de verdad:
muchos usos de JSON efectivamente son más simples y más cerrados.

### Problema

Ese prestigio del formato puede generar una falsa sensación de seguridad cuando el equipo deja de hacerse preguntas sobre:

- tipos
- subtipos
- binding automático
- materialización rica
- uso de librerías que aceptan polimorfismo

### Idea útil

JSON puede ser simple.
Pero el pipeline que lo convierte en objetos Java puede no serlo en absoluto.

### Regla sana

No confundas simplicidad del formato con simplicidad de la materialización.

---

# Parte 2: Qué significa “deserialización tipada”

## La intuición útil

Deserialización tipada, en este contexto, apunta a flujos donde el sistema no solo recibe datos, sino que:

- los asocia a tipos concretos
- puede resolver subtipos
- o deja que parte del input influya qué clase exacta termina materializándose

### Idea importante

Eso ya es bastante distinto de:
- “llenar un DTO fijo con campos básicos”

Porque aparece una dimensión nueva:
- **el input empieza a participar en el mapa de tipos del backend**

### Regla sana

Cada vez que el payload no solo llena valores sino que también ayuda a decidir clases concretas, conviene levantar bastante la atención.

---

# Parte 3: JSON simple vs JSON demasiado expresivo

Esta distinción ayuda mucho.

## JSON simple
Suele ser:
- estructura chica
- contrato claro
- tipos conocidos
- DTO fijo
- poco acoplamiento al dominio

## JSON demasiado expresivo
Puede implicar:
- tipos dinámicos
- subtipos
- jerarquías
- metadatos tipados
- objetos ricos
- cercanía fuerte al mundo interno del backend

### Idea útil

El problema no es que JSON tenga llaves y arrays.
El problema es cuánto del modelo de objetos del backend le dejás describir.

### Regla sana

Mientras más expresivo sea el binding respecto del sistema de tipos interno, más cerca estás de una superficie de deserialización peligrosa.

---

# Parte 4: Por qué esto importa especialmente en Java

Java tiende a volver esto delicado por varias razones:

- ecosistema muy orientado a objetos
- librerías de binding potentes
- soporte para herencia y polimorfismo
- frameworks cómodos
- aplicaciones con muchos tipos, subtipos y jerarquías
- classpaths ricos y cargados de bibliotecas

### Idea importante

Cuando el binding tipado se vuelve demasiado flexible, el input ya no describe solo datos.
Empieza a describir demasiado del universo de clases del backend.

### Regla sana

En Java, cuanta más flexibilidad de tipos permitís desde input externo, más conviene pensar la deserialización como frontera seria y no como plumbing.

---

# Parte 5: Qué vuelve peligroso al tipado flexible

Sin entrar todavía en configuración concreta de librerías, conviene tener clara la intuición general.

El tipado flexible se vuelve peligroso cuando permite que el sistema:

- materialice subtipos no previstos
- se acerque demasiado al classpath real
- rehidrate objetos más ricos que los que el negocio necesitaba aceptar
- dependa demasiado de metadata del payload para decidir clases
- pierda control explícito sobre la transformación

### Idea útil

El problema no es solo “qué valor trae el JSON”.
Es también:
- “qué tipo concreto permite instanciar ese JSON”.

### Regla sana

Si el servidor deja de ser quien define completamente la forma del objeto y parte de esa decisión la toma el payload, la superficie ya merece mucha más atención.

---

# Parte 6: Por qué esto no se parece a un DTO cerrado

Un DTO cerrado es algo como:

- clase pequeña
- tipo fijo
- estructura conocida
- pocas sorpresas
- validación clara
- poca cercanía con el dominio interno

En cambio, una deserialización tipada peligrosa se acerca más a:

- clases ricas
- polimorfismo
- tipos o subtipos guiados por input
- más magia del framework
- más cercanía al runtime y al classpath

### Idea importante

No toda deserialización JSON es igual.
Hay mucha diferencia entre un contrato cerrado y una frontera que deja entrar demasiada expresividad tipada.

### Regla sana

DTO fijo y pequeño suele ser una conversación.
Polimorfismo amplio ya es otra conversación mucho más delicada.

---

# Parte 7: Por qué esto se conecta con el classpath

Igual que en serialización nativa, el classpath vuelve a importar.

Porque si el sistema permite que el binding se acerque demasiado al mapa real de tipos disponibles, entonces:

- las clases presentes importan
- las dependencias presentes importan
- los subtipos posibles importan
- la evolución del classpath importa

### Idea útil

No hace falta usar `ObjectInputStream` para que el universo de clases disponible empiece a pesar en el riesgo.

### Regla sana

Cada vez que el input puede influir tipos o subtipos, preguntate qué parte del classpath deja de ser simplemente contexto y pasa a ser superficie.

---

# Parte 8: Qué tipo de impacto conviene imaginar

Todavía no estamos en configuración específica, pero ya conviene tener presentes varias familias de impacto:

### 1. Materialización de tipos no esperados
El sistema crea más clase de objeto de la que el negocio necesitaba aceptar.

### 2. Superficie heredada de dependencias
El riesgo se amplía por bibliotecas presentes en el classpath.

### 3. Comportamiento inesperado del binding
La librería hace más trabajo del que el equipo imaginaba.

### 4. Diseño demasiado acoplado al modelo interno
El payload se acerca demasiado al lenguaje interno del sistema.

### Idea importante

Aunque JSON suene “solo datos”, la deserialización tipada puede volver a acercar el problema al runtime real y a sus clases disponibles.

---

# Parte 9: Por qué esto suele esconderse en frameworks muy cómodos

Esta superficie suele crecer cuando el equipo piensa:

- “qué bueno, no tengo que mapear tanto”
- “el framework me resuelve subtipos”
- “puedo aceptar estructuras más flexibles”
- “el binding se adapta”

Todo eso es productivo.
Pero también desplaza decisiones delicadas desde el código explícito del servidor hacia la configuración y la librería.

### Idea útil

La comodidad del binding puede ser casi inversamente proporcional a la claridad de la frontera de seguridad.

### Regla sana

Cuando una librería te ahorra mucho código en deserialización tipada, preguntate cuánto control explícito acabás de ceder.

---

# Parte 10: Por qué “es solo JSON” no alcanza como defensa mental

Porque “es solo JSON” responde a una pregunta equivocada.

Responde a:
- “¿qué formato vino?”

Pero deja sin responder:
- “¿qué hicimos con ese formato?”
- “¿qué tipo decidimos crear?”
- “¿qué tan cerca quedó del dominio o del classpath?”
- “¿quién definió esa forma final?”

### Idea importante

La seguridad no la define el contenedor del dato.
La define el contrato de materialización que el backend le ofrece.

### Regla sana

Cada vez que te escuches pensar “es solo JSON”, completá la frase con:
- “¿y qué tanto poder le dimos para materializar objetos?”

---

# Parte 11: Qué preguntas conviene hacer en una review

Cuando revises un flujo JSON que materializa objetos, conviene preguntar:

- ¿el tipo destino es fijo o flexible?
- ¿hay polimorfismo?
- ¿el payload puede influir subtipos?
- ¿qué librería hace la deserialización?
- ¿qué tanto del modelo interno está expuesto al binding?
- ¿qué parte del classpath vuelve más rica la superficie?
- ¿el diseño sigue siendo pequeño o ya dejó entrar demasiada expresividad?

### Idea importante

Estas preguntas suelen separar muy bien un uso sano de JSON de una frontera demasiado poderosa disfrazada de comodidad moderna.

---

# Parte 12: Qué señales indican una postura más sana

Una postura más sana suele mostrar:

- DTOs pequeños y fijos
- poco o nulo polimorfismo desde input externo
- separación clara entre JSON de entrada y modelo interno
- menos magia de binding
- menos cercanía al classpath real
- menos dependencia en metadata tipada del payload
- reviewers capaces de explicar qué tipos exactos puede materializar cada flujo

### Regla sana

La madurez aquí se nota cuando el backend define claramente la forma del objeto y no la negocia con el payload.

---

# Parte 13: Qué señales indican una postura floja

Estas señales merecen revisión fuerte:

- “es JSON, así que no debería ser tan serio”
- nadie sabe qué subtipos puede materializar el sistema
- el binding está demasiado cerca del dominio interno
- el equipo depende de magia de la librería
- el classpath no se modela
- el payload decide más estructura de la necesaria
- se confunde comodidad de deserialización con frontera segura

### Idea importante

Una postura floja no siempre usa serialización nativa.
A veces usa JSON moderno, pero con demasiada libertad de tipos.

---

# Parte 14: Cómo reconocer esta superficie en una codebase Spring

En una app Spring o Java, conviene sospechar especialmente cuando veas:

- `@RequestBody` sobre jerarquías ricas
- soporte de subtipos o metadata tipada
- binding automático a modelos complejos
- `ObjectMapper` con configuración flexible
- clases base que aceptan múltiples implementaciones desde input
- poca separación entre payload y modelo de dominio
- developers que hablan de JSON como si eso agotara el análisis de seguridad

### Idea útil

En revisión real, la señal más fuerte suele ser que el input ya no solo llena campos, sino que empieza a influir demasiado la forma del objeto final.

---

## Qué revisar en una app Spring

Cuando revises deserialización tipada peligrosa en una aplicación Spring, mirá especialmente:

- qué clases acepta cada endpoint o flujo
- si son tipos fijos o jerarquías abiertas
- qué librería hace el binding
- qué configuración de tipos o subtipos existe
- qué tan cerca está el payload del dominio interno
- qué dependencias vuelven más rica la superficie
- qué parte del diseño podría volver más chico el contrato de entrada

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- JSON usado como datos y no como lenguaje de tipos
- contratos de entrada pequeños
- DTOs explícitos
- poca o nula deserialización polimórfica desde input externo
- menor cercanía al classpath real
- reviewers que no se dejan tranquilizar solo por el formato JSON

### Idea importante

La madurez aquí se nota cuando el equipo deja de pensar “JSON = seguro” y empieza a pensar “¿qué materialización exacta habilita este flujo?”.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- JSON usado para reconstruir tipos ricos
- polimorfismo abierto o poco entendido
- confianza excesiva en la librería de binding
- input demasiado cerca del dominio
- el classpath nunca entra en la conversación
- el formato se usa como excusa para no revisar la materialización

### Regla sana

Si el payload ya participa demasiado en la decisión de qué tipo concreto va a vivir dentro del runtime, la superficie dejó de ser “solo JSON”.

---

## Checklist práctica

Cuando revises JSON en una app Spring, preguntate:

- ¿estamos leyendo datos o materializando tipos?
- ¿el tipo destino es fijo?
- ¿hay subtipos o polimorfismo?
- ¿qué parte del objeto final decide el payload?
- ¿qué parte del classpath importa acá?
- ¿qué haría el contrato más pequeño y explícito?
- ¿qué riesgo sigue escondido detrás de la frase “es solo JSON”?

---

## Mini ejercicio de reflexión

Tomá un flujo JSON de tu app Spring y respondé:

1. ¿Qué clase o jerarquía recibe?
2. ¿El tipo destino es fijo o flexible?
3. ¿Qué parte de la estructura decide el payload?
4. ¿Qué librería hace el binding?
5. ¿Qué dependencias vuelven más rica la superficie?
6. ¿Qué parte del riesgo te parecía menos importante antes de este tema?
7. ¿Qué cambio harías primero para achicar el contrato?

---

## Resumen

JSON no siempre significa seguridad porque el riesgo no está solo en el formato, sino en cuánto poder le da el backend al mecanismo de deserialización para decidir qué objetos, tipos o subtipos materializar a partir del input.

La gran intuición del tema es esta:

- JSON puede ser simple
- pero la materialización puede no serlo
- el problema reaparece cuando el binding se vuelve demasiado expresivo
- el classpath vuelve a importar
- y el payload se acerca demasiado al lenguaje de tipos interno del sistema

En resumen:

> un backend más maduro no usa el hecho de “estar en JSON” como atajo mental para dejar de pensar la deserialización, sino que entiende que el formato solo es la superficie visible de una pregunta más importante: cuánto del sistema de tipos y del modelo interno dejamos que el input externo describa.  
> Y justamente por eso este tema importa tanto: porque ayuda a romper una falsa tranquilidad muy común en sistemas modernos, la de creer que ya no hay riesgo serio mientras todo viaje en JSON, cuando en realidad la deserialización tipada puede volver a abrir una frontera poderosa, compleja y demasiado cercana al runtime aunque el payload se vea limpio, moderno y familiar.

---

## Próximo tema

**Jackson polymorphic typing: cuándo abre demasiado poder**
