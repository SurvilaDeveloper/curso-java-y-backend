---
title: "Jackson polymorphic typing: cuándo abre demasiado poder"
description: "Cómo entender Jackson polymorphic typing en aplicaciones Java con Spring Boot. Cuándo puede ser útil, por qué se vuelve riesgoso frente a input no confiable y qué cambia cuando el payload empieza a influir la elección de subtipos dentro del runtime."
order: 188
module: "Deserialización insegura y materialización de objetos"
level: "base"
draft: false
---

# Jackson polymorphic typing: cuándo abre demasiado poder

## Objetivo del tema

Entender qué significa **polymorphic typing** en **Jackson**, por qué puede ser útil en algunos contextos y por qué se vuelve una superficie muy delicada cuando el input no confiable empieza a influir demasiado en la elección de subtipos dentro de una aplicación Java + Spring Boot.

La idea de este tema es continuar directamente el punto más importante del tema anterior.

Ya vimos que:

- JSON no vuelve segura a la deserialización por sí solo
- el problema aparece cuando el binding se vuelve demasiado expresivo
- el riesgo crece cuando el payload se acerca demasiado al sistema de tipos interno
- y en Java el classpath vuelve a importar mucho cuando el input ya no solo llena campos, sino que participa en la materialización de clases

Ahora toca ver una de las piezas más conocidas y más sensibles de este terreno:

- **Jackson polymorphic typing**

Porque acá el salto de comodidad a riesgo puede ser muy grande.

En muchos diseños, el equipo quiere algo como:

- una clase base
- varias implementaciones
- JSON flexible
- binding automático
- menos código manual
- menos `if` o factories explícitas

Y ahí aparece la tentación de dejar que Jackson resuelva subtipos a partir del payload.

En resumen:

> Jackson polymorphic typing puede ser útil cuando el dominio necesita polimorfismo real y bien acotado,  
> pero se vuelve una frontera muy delicada cuando el input no confiable gana demasiado poder para influir qué subtipo concreto va a vivir dentro del runtime, porque en ese punto JSON deja de describir solo datos y empieza a participar en el mapa real de tipos de la aplicación.

---

## Idea clave

La idea central del tema es esta:

> **polimorfismo** en Jackson no significa solo “más flexibilidad”.  
> Significa también que el payload puede entrar en la conversación sobre **qué clase concreta** debe materializar el backend.

Ese detalle cambia muchísimo la superficie de riesgo.

Porque una cosa es:

- el servidor define el tipo destino
- el payload llena datos
- el contrato es fijo

Y otra muy distinta es:

- el payload trae información que influye la elección de subtipo
- el binder resuelve la implementación concreta
- y el runtime termina materializando una clase más específica dentro de un universo real de tipos

### Idea importante

Cuanto más poder tiene el input para participar en la elección del subtipo, más cerca queda de la parte delicada del runtime y del classpath.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- ver el polymorphic typing solo como una comodidad de diseño
- creer que “si sigue siendo JSON” el riesgo no cambió demasiado
- no distinguir polimorfismo acotado de polimorfismo demasiado abierto
- dejar que el payload influya subtipos sin suficiente control
- subestimar cuánto cambia la superficie cuando Jackson deja de mapear a un tipo fijo
- pensar que la herencia del dominio siempre debería reflejarse directamente en la frontera de entrada

Es decir:

> el problema no es usar herencia o interfaces en el modelo interno.  
> El problema es dejar que input no confiable participe demasiado en la decisión de qué implementación concreta del backend va a ser creada.

---

## Error mental clásico

Un error muy común es este:

### “Tenemos una jerarquía de clases, así que lo natural es que Jackson decida el subtipo desde el JSON”

Eso puede ser cómodo.
Pero no siempre es la decisión más sana en una frontera de entrada.

Porque todavía importan preguntas como:

- ¿quién controla ese JSON?
- ¿qué subtipos están permitidos?
- ¿qué tan amplio es el conjunto real de clases materializables?
- ¿qué parte del classpath entra en juego?
- ¿el negocio realmente necesita que el payload elija la implementación?
- ¿esto está acotado o demasiado abierto?

### Idea importante

Que una jerarquía exista en el dominio no implica que el payload externo deba decidir cómo recorrerla.

---

# Parte 1: Qué significa polymorphic typing, a nivel intuitivo

## La intuición simple

La forma mental más útil es esta:

> Jackson polymorphic typing es una manera de deserializar no solo a una clase base fija, sino de permitir que el binding determine qué implementación concreta materializar según cierta información del input o cierta configuración asociada.

Eso puede ser útil cuando realmente tenés algo como:

- una interfaz
- varios subtipos legítimos
- y un contrato bien diseñado para distinguirlos

### Idea útil

El problema no es el polimorfismo como concepto.
El problema es cómo y cuánto controlás esa resolución de subtipos.

### Regla sana

En seguridad, la pregunta no es solo “¿hay polimorfismo?”.
La pregunta es:
- “¿quién lo está gobernando realmente: el servidor o el payload?”

---

# Parte 2: Por qué esto se siente tan cómodo para el developer

Hay una razón muy clara por la que esta superficie aparece tanto:
resuelve una incomodidad real del desarrollo.

Sin polymorphic typing, muchas veces el equipo tiene que hacer cosas como:

- leer un discriminador
- decidir un tipo manualmente
- mapear de forma explícita
- tener factories o lógica de selección
- transformar después a objetos internos

Con polymorphic typing, Jackson puede encargarse de gran parte de eso.
Y eso se siente elegantísimo.

### Idea importante

La comodidad técnica es real.
Justamente por eso la frontera se vuelve más traicionera:
porque una mejora de ergonomía puede esconder una cesión importante de control.

### Regla sana

Cada vez que una librería te ahorra decisiones explícitas sobre tipos, preguntate cuánto poder le acabás de devolver al input.

---

# Parte 3: Tipo fijo vs subtipo resuelto desde input

Esta comparación ayuda muchísimo.

## Tipo fijo
- el servidor decide la clase
- el payload llena campos
- el contrato es más cerrado
- el binding tiene menos libertad

## Subtipo resuelto desde input
- el payload influye qué implementación concreta se crea
- la frontera se vuelve más expresiva
- el classpath pesa más
- la revisión se vuelve más delicada

### Idea útil

La diferencia no es solo de estilo.
Es una diferencia fuerte en la distribución del poder entre:
- backend
y
- input externo.

### Regla sana

Cuanto más fija sea la forma del objeto materializado, más pequeña suele ser la superficie.

---

# Parte 4: Cuándo puede tener sentido usarlo

Tampoco conviene demonizar la herramienta.

Hay escenarios donde cierto polimorfismo puede ser razonable, por ejemplo cuando:

- el dominio realmente tiene variantes bien delimitadas
- el contrato externo está muy bien diseñado
- el conjunto de subtipos es chico y explícito
- el discriminador está controlado y auditado
- la frontera no acepta tipos arbitrarios ni cercanos al classpath completo
- el equipo entiende exactamente qué implementaciones pueden aparecer

### Idea importante

El problema no es “usar polimorfismo”.
El problema es usarlo con demasiada amplitud o con demasiada cercanía al runtime real.

### Regla sana

Polimorfismo acotado y explícito es una conversación.
Polimorfismo abierto y demasiado cómodo ya es otra mucho más peligrosa.

---

# Parte 5: Cuándo abre demasiado poder

Esta es la pregunta central del tema.

El polymorphic typing abre demasiado poder cuando:

- el payload decide demasiado sobre la implementación concreta
- el conjunto de subtipos permitidos es amplio o poco claro
- el binding se acerca demasiado al classpath real
- la app depende de defaults o configuraciones difíciles de explicar
- el equipo no puede enumerar fácilmente qué clases concretas podrían materializarse
- la frontera externa empieza a parecerse demasiado al sistema interno de tipos

### Idea importante

En ese punto, el JSON deja de ser solo datos y empieza a hablar un dialecto demasiado parecido al del runtime.

### Regla sana

Si el equipo no puede explicar de forma simple y cerrada qué subtipos exactos puede producir ese flujo, probablemente ya abrió más superficie de la necesaria.

---

# Parte 6: Por qué el classpath vuelve a importar tanto

Esto conecta directo con los temas 183 y 185.

Cuando el subtipo ya no está completamente decidido por el servidor, el universo de clases disponibles importa más.

Porque el riesgo ya no depende solo de:

- la clase base
- los campos visibles
- o la forma del JSON

También depende de:

- qué implementaciones están presentes
- qué librerías están cargadas
- qué clases participan de la jerarquía o del binding
- cómo evoluciona ese classpath con el tiempo

### Idea útil

El polymorphic typing vuelve a abrir la puerta a una pregunta muy Java:
- “¿qué mundo de clases real tiene disponible este runtime?”

### Regla sana

Cada vez que el input influye subtipos, el classpath deja de ser solo contexto y pasa a ser parte activa del riesgo.

---

# Parte 7: Herencia de dominio no siempre debería salir al borde externo

Este es un principio de diseño muy útil.

A veces el modelo interno del sistema tiene una jerarquía válida y elegante.
Pero eso no significa que el contrato externo deba exponer esa misma flexibilidad.

### Ejemplo conceptual

Podés tener internamente:

- una interfaz
- varias implementaciones
- bastante riqueza de comportamiento

Y aun así decidir que, desde afuera:

- entra un DTO más simple
- con un discriminador pequeño
- validado explícitamente
- y recién después el servidor transforma eso hacia la jerarquía interna

### Idea importante

Separar frontera externa de modelo interno suele ser mucho más sano que dejar que el binding una ambas cosas casi sin fricción.

### Regla sana

No le regales al payload el mismo lenguaje de tipos que usás adentro.

---

# Parte 8: Qué vuelve engañoso al polimorfismo “bien tipado”

Otra trampa es esta:
como el código sigue siendo tipado, el equipo siente que está todo bajo control.

Se ve algo así como:

- interfaz base
- subclases claras
- annotations
- `ObjectMapper`
- JSON ordenado
- objetos válidos

Eso se siente prolijo.
Pero no responde todavía la pregunta clave:

- ¿quién decide el subtipo?
- ¿qué tan cerrada está esa decisión?
- ¿qué parte del classpath entra en juego?
- ¿qué pasa si mañana cambia el conjunto de clases disponibles?

### Idea importante

El tipado estático del lenguaje no te salva si la frontera de materialización sigue siendo demasiado expresiva.

### Regla sana

Código tipado no equivale automáticamente a deserialización pequeña y defendible.

---

# Parte 9: Qué riesgos conviene tener presentes

Todavía no estamos entrando en configuración fina, pero ya conviene pensar al menos en estas familias de riesgo:

### 1. Materialización de subtipos no previstos
El sistema crea implementaciones que el equipo no quería aceptar desde input externo.

### 2. Superficie ampliada por dependencias
El riesgo cambia si el classpath cambia.

### 3. Acoplamiento excesivo entre payload y modelo interno
El contrato externo deja de ser pequeño.

### 4. Opacidad del binding
El equipo no sabe bien qué decide el servidor y qué decide el input.

### Idea importante

Aunque el JSON parezca simple, la frontera de materialización puede volverse bastante más poderosa de lo que se ve en la request.

---

# Parte 10: Por qué esto no se arregla solo “validando campos”

Otra intuición engañosa es:
- “después validamos y listo”

La validación de campos es valiosa.
Pero llega tarde para algunas dimensiones del problema si:

- el subtipo ya fue elegido
- el objeto ya fue materializado
- el binding ya hizo demasiado trabajo
- el riesgo ya estaba en qué clase se creó, no solo en qué valores trajo

### Idea útil

La pregunta crítica a veces no es:
- “¿qué campos tiene?”
sino:
- “¿qué clase dejamos que exista?”

### Regla sana

Validar contenido no reemplaza acotar la materialización de tipos.

---

# Parte 11: Qué preguntas conviene hacer en una review

Cuando revises un flujo con polymorphic typing, conviene preguntar:

- ¿quién decide el subtipo?
- ¿qué subtipos concretos están permitidos?
- ¿el conjunto es pequeño y explícito?
- ¿qué parte del classpath podría ampliar esa superficie?
- ¿el negocio realmente necesita este nivel de flexibilidad?
- ¿podría resolverse con DTOs o discriminadores más pequeños y mapping manual?
- ¿qué parte del riesgo se esconde detrás de la comodidad de Jackson?

### Idea importante

Estas preguntas suelen separar muy bien un diseño razonable de uno que cedió demasiado control al payload.

---

# Parte 12: Qué señales indican una postura más sana

Una postura más sana suele mostrar:

- pocos subtipos y bien conocidos
- discriminadores pequeños y explícitos
- poca magia
- más decisión del lado del servidor
- menos cercanía entre JSON y jerarquía interna real
- menor dependencia en classpath amplio
- reviewers que pueden enumerar con claridad qué implementaciones materiales acepta el flujo

### Regla sana

La madurez aquí se nota cuando el polimorfismo está al servicio del diseño, no de la comodidad del binding.

---

# Parte 13: Qué señales indican una postura floja

Estas señales merecen revisión fuerte:

- el payload elige demasiado del subtipo
- nadie sabe exactamente qué implementaciones puede crear Jackson
- el classpath no entra en la conversación
- la jerarquía interna se expone demasiado directo
- la app depende de configuración poco comprendida
- el equipo asume que “como sigue siendo JSON, no debería ser tan grave”

### Idea importante

Una postura floja no siempre usa serialización nativa.
A veces usa tooling moderno, pero con demasiada libertad de tipos.

---

# Parte 14: Cómo reconocer esta superficie en una codebase Spring

En una app Spring o Java, conviene sospechar especialmente cuando veas:

- Jackson configurado para resolver subtipos desde input
- clases base o interfaces expuestas en la frontera de entrada
- annotations o metadata que permiten múltiples implementaciones
- `ObjectMapper` con configuración flexible o poco explicada
- poco mapping manual entre payload y modelo interno
- developers que celebran que “el JSON ya me decide el tipo”
- dificultad para enumerar qué clases concretas pueden materializarse

### Idea útil

En revisión real, la señal más fuerte suele ser esta:
- el input ya no solo llena un objeto, sino que ayuda a decidir qué clase concreta va a vivir dentro del runtime.

---

## Qué revisar en una app Spring

Cuando revises Jackson polymorphic typing en una aplicación Spring, mirá especialmente:

- qué endpoints o flujos aceptan jerarquías o clases base
- qué subtipos exactos pueden materializarse
- qué configuración usa `ObjectMapper`
- qué parte de la decisión la toma el payload
- qué tan cerca está esa frontera del dominio interno
- qué dependencias amplían el classpath relevante
- si el diseño podría volverse más explícito, pequeño y predecible

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- polimorfismo muy acotado o ausente en input externo
- DTOs más cerrados
- subtipos explícitos y bien entendidos
- menos magia del binder
- menor exposición del modelo interno
- reviewers que saben explicar por qué ese flujo necesita o no polymorphic typing

### Idea importante

La madurez aquí se nota cuando el equipo no usa polimorfismo en el borde solo porque “queda elegante”.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- nadie sabe qué subtipos se aceptan realmente
- el payload manda demasiado en la elección del tipo
- el classpath está fuera del análisis
- el dominio interno y el contrato externo casi se confunden
- se delega demasiado a Jackson sin explicación clara
- el equipo usa JSON como excusa para bajar la guardia

### Regla sana

Si el input ya participa demasiado en la elección de qué clase concreta va a vivir en el backend, el poder que abriste es probablemente mayor del que el negocio necesitaba.

---

## Checklist práctica

Cuando revises polymorphic typing, preguntate:

- ¿quién decide el subtipo?
- ¿qué subtipos exactos están permitidos?
- ¿qué parte del classpath vuelve más rica la superficie?
- ¿el negocio necesita esta flexibilidad?
- ¿puedo reemplazar esto por un contrato más pequeño?
- ¿qué parte del riesgo no se arregla validando campos?
- ¿qué poder estoy dándole al payload sobre el sistema de tipos interno?

---

## Mini ejercicio de reflexión

Tomá un flujo JSON de tu app Spring y respondé:

1. ¿Acepta una clase base o interfaz?
2. ¿Qué subtipos concretos puede materializar?
3. ¿Quién decide esa lista de subtipos: el servidor o el payload?
4. ¿Qué dependencias vuelven más delicada esa superficie?
5. ¿Qué parte del diseño ganaría claridad con menos polimorfismo en el borde?
6. ¿Qué riesgo te preocupa más acá: opacidad, classpath o acoplamiento al dominio?
7. ¿Qué revisarías primero después de este tema?

---

## Resumen

Jackson polymorphic typing puede ser una herramienta útil cuando el dominio necesita variantes reales y bien acotadas, pero se vuelve una superficie muy delicada cuando el input no confiable gana demasiado poder para influir qué subtipo concreto materializa el backend.

La gran intuición del tema es esta:

- el problema no es herencia
- el problema no es JSON
- el problema no es Jackson por sí mismo
- el problema aparece cuando la frontera externa se vuelve demasiado expresiva y deja que el payload entre demasiado cerca del sistema de tipos real del runtime

En resumen:

> un backend más maduro no confunde la elegancia del polimorfismo con una frontera segura de entrada, ni deja que el hecho de estar trabajando con JSON o con una librería popular como Jackson le tape cuánto poder de materialización de tipos está cediendo al input externo.  
> Entiende que, cuando el payload participa demasiado en la elección de subtipos, la conversación deja de ser solo de “campos y validación” y pasa a ser una conversación sobre classpath, contratos demasiado expresivos y cercanía peligrosa entre el borde público del sistema y su mundo interno de objetos.  
> Y justamente por eso este tema importa tanto: porque ayuda a reconocer uno de los lugares donde la comodidad moderna del binding puede abrir más poder del necesario sin que el equipo lo note enseguida.

---

## Próximo tema

**Cómo revisar una codebase Java buscando puntos reales de deserialización**
