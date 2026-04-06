---
title: "Deserialización insegura: idea general"
description: "Qué es la deserialización insegura en aplicaciones Java con Spring Boot y por qué representa un riesgo serio cuando el backend reconstruye objetos, estructuras o estados a partir de datos controlados por el usuario. Cómo pensar el problema sin quedarse solo con gadgets, librerías o casos extremos."
order: 87
module: "Archivos, serialización y procesamiento riesgoso"
level: "base"
draft: false
---

# Deserialización insegura: idea general

## Objetivo del tema

Entender la idea general de **deserialización insegura** en una aplicación Java + Spring Boot.

La meta de este tema no es entrar todavía en una librería puntual ni en una lista de payloads famosos.
La idea es fijar primero el modelo mental correcto.

Porque mucha gente escucha “deserialización insegura” y piensa algo así:

- “es un problema raro”
- “solo pasa en sistemas viejos”
- “solo afecta a Java serializable clásico”
- “si parseo JSON ya no aplica”
- “es una vulnerabilidad esotérica de laboratorios”

Ese enfoque es pobre.

La pregunta de fondo es mucho más útil:

> ¿qué pasa cuando el backend toma datos controlados desde afuera y los usa para reconstruir objetos, estructuras o estados en los que luego confía demasiado?

En resumen:

> deserializar no es solo leer datos.  
> Es decidir cuánto poder le das al input para influir en la forma interna en que el sistema representa y procesa ese contenido.

---

## Idea clave

Serializar, en términos simples, es convertir algo interno del sistema a un formato intercambiable o almacenables, por ejemplo:

- bytes
- JSON
- XML
- YAML
- objetos binarios
- mensajes
- documentos
- blobs

Deserializar es el camino inverso:

- tomar ese formato externo
- interpretarlo
- reconstruir una estructura interna
- y seguir trabajando con ella como si fuera un objeto o estado válido

La idea central es esta:

> cuanto más rica, poderosa o automática es esa reconstrucción, más peligroso se vuelve confiar en datos externos sin límites claros.

Porque el problema no es solo “leer información”.
El problema es **qué comportamiento, qué estructura o qué decisiones internas se activan al reconstruirla**.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- tratar cualquier formato serializado como si fuera solo un contenedor pasivo de datos
- reconstruir objetos complejos desde input externo sin pensar alcance
- confiar en tipos, clases o estructuras elegidas por el emisor
- asumir que parsear equivale a validar
- permitir que librerías o frameworks materialicen demasiado poder desde datos no confiables
- mezclar conveniencia de desarrollo con reconstrucción demasiado flexible
- olvidar que deserializar también puede disparar lógica, no solo mapear campos
- pensar solo en “remote code execution” y no ver otros daños igual de serios

Es decir:

> el problema no es usar formatos o parseadores.  
> El problema es dejar que el input controle demasiado sobre qué objeto nace, cómo nace y qué pasa cuando nace.

---

## Error mental clásico

Un error muy común es este:

### “Si solo estamos parseando datos, no estamos ejecutando nada”

Eso puede ser engañoso.

Porque en muchos casos deserializar no significa solo:

- leer un string
- convertir un número
- poblar un map simple

Puede significar también:

- crear instancias
- elegir tipos
- recorrer grafos
- materializar relaciones
- activar setters
- disparar conversiones
- tocar hooks de inicialización
- invocar comportamientos de librerías
- reconstruir estados que luego el sistema da por válidos

### Idea importante

A veces el riesgo no aparece porque “corriste código del atacante” de una forma obvia.
Aparece porque el sistema dejó que el atacante influya demasiado en cómo se construye su modelo interno.

---

## Qué significa deserializar en la práctica

En una app real, deserialización puede aparecer cuando el backend:

- lee un objeto serializado
- parsea XML o YAML muy flexible
- reconstruye estructuras desde JSON
- recibe mensajes en colas
- procesa cachés u objetos guardados
- acepta datos binarios de otro sistema
- consume formatos complejos desde uploads o integraciones
- restaura estados desde storage o sesiones
- rehidrata objetos ricos desde información externa

### Idea útil

No hace falta que uses `ObjectInputStream` para que exista el riesgo conceptual.
La idea general es más amplia:

> hay riesgo cada vez que datos externos se convierten en estructuras internas con más poder o semántica de la que deberían tener.

---

## Por qué es especialmente delicado en Java

Java tiene una larga historia con mecanismos de serialización ricos y con ecosistemas donde objetos, clases y librerías pueden tener comportamientos relativamente complejos al ser reconstruidos.

Eso hizo que históricamente se vieran muchos problemas donde:

- un payload controlado por un atacante
- recorría caminos inesperados
- activaba comportamientos no pensados
- y llevaba a daños graves

### Pero cuidado

No hace falta quedarse solo con “gadgets” o casos clásicos.
La enseñanza importante es otra:

> si un sistema reconstruye objetos complejos desde input no confiable, el riesgo sube muchísimo.

Y esa idea sigue siendo válida incluso cuando cambia la tecnología o el formato.

---

## No todo parseo es deserialización peligrosa, pero el límite importa

Esto también conviene aclararlo.

No todo parseo de datos es automáticamente un desastre.
No es lo mismo:

- leer un entero
- mapear un DTO simple
- validar un JSON con esquema estricto

que:

- aceptar tipos arbitrarios
- rehidratar objetos complejos
- reconstruir jerarquías profundas
- dejar que el input decida clases o comportamientos
- revivir objetos desde formatos binarios ricos

### Regla útil

El riesgo crece cuando el sistema pasa de “leer datos simples y acotados” a “reconstruir estructuras ricas y flexibles con demasiada confianza”.

---

## El problema no es solo ejecución remota

Cuando se habla de deserialización insegura, mucha gente piensa enseguida en el peor caso posible:

- ejecución remota de código

Eso puede pasar en ciertos escenarios históricos o mal diseñados.
Pero no es el único daño posible.

También pueden aparecer problemas como:

- denegación de servicio
- consumo excesivo de recursos
- lectura o acceso indebido a información
- materialización de estados no válidos
- bypass de reglas del negocio
- inyección de estructuras inesperadas
- ampliación de superficie para otras vulnerabilidades
- corrupción lógica del flujo

### Idea importante

Si te quedás esperando solo el “exploit cinematográfico”, te perdés muchos riesgos reales y más frecuentes.

---

## ¿Dónde está el exceso de confianza?

Esta es una muy buena pregunta para revisar cualquier caso.

La deserialización se vuelve peligrosa cuando el sistema confía demasiado en cosas como:

- el tipo del objeto reconstruido
- la forma del grafo
- la profundidad o complejidad
- la validez semántica del estado
- la inocuidad de la librería usada
- la legitimidad del emisor
- la idea de que “si pudo parsearse, entonces es aceptable”

### Regla sana

Poder reconstruir algo no significa deber confiar en eso.

---

## Formato externo no confiable, modelo interno poderoso

Este es probablemente el resumen más útil del problema.

Tenés, por un lado:

- un formato externo controlado parcial o totalmente por otro actor

y, por el otro:

- un modelo interno del sistema
- con objetos
- clases
- reglas
- estados
- relaciones
- comportamientos

La zona peligrosa aparece cuando el puente entre ambos lados es demasiado automático y demasiado permisivo.

### Idea útil

Cuanto más cerca esté el input no confiable de tus objetos internos ricos, más cuidado necesitás.

---

## Deserializar no reemplaza validar

Otro error clásico es este:

- “ya quedó mapeado al objeto”
- “entonces ya es válido”

Eso es falso.

Una cosa es que el formato pueda convertirse técnicamente en una estructura.
Otra cosa muy distinta es que esa estructura:

- tenga sentido
- esté autorizada
- represente un estado permitido
- respete límites del negocio
- sea segura de procesar después

### Regla importante

Deserializar es, como mucho, una traducción técnica.
La validación sigue siendo otra etapa.

---

## El input no debería elegir clases o tipos libres

Uno de los lugares donde históricamente el riesgo se dispara es cuando el input externo puede influir demasiado en:

- qué clase concreta se instancia
- qué subtipo se acepta
- qué estructura polimórfica se reconstruye
- qué objetos complejos participan del proceso

### Idea importante

Cuanto más libre sea el sistema para materializar tipos desde datos externos, más superficie le das al atacante para encontrar combinaciones peligrosas.

No hace falta conocer todavía un caso puntual para entender por qué eso ya es mala idea como principio general.

---

## Objetos ricos, ganchos y efectos laterales

Otra razón por la que la deserialización puede ser peligrosa es que muchos objetos o librerías no son completamente “pasivos”.

Pueden tener:

- inicialización
- setters con lógica
- validaciones parciales
- efectos secundarios
- carga diferida
- comportamiento especial al reconstruirse
- interacción con otros componentes

### Idea útil

Si el sistema deja que el input cree o moldee objetos ricos, no solo está trayendo datos adentro.
También puede estar activando caminos internos difíciles de predecir.

---

## Datos simples mejor que objetos ricos

Esta es una regla muy sana a nivel de diseño.

Siempre que sea razonable, es más seguro recibir y procesar:

- DTOs simples
- estructuras explícitas
- tipos acotados
- campos limitados
- contratos estrictos

y no:

- objetos internos del dominio
- jerarquías complejas
- estructuras arbitrarias
- formatos que intentan “rehidratar” demasiado de tu modelo interno

### Idea importante

Cuanto menos poder tenga el formato de entrada sobre tu estructura interna, mejor.

---

## Persistencia y deserialización también se tocan

Este tema no solo aplica a requests HTTP.
También puede aparecer cuando el sistema guarda y luego revive información desde:

- cachés
- colas
- blobs
- archivos
- sesiones
- stores auxiliares
- integraciones entre servicios

### Problema

A veces el equipo dice:

- “eso no viene del usuario directo”

pero igual puede venir de:

- otra app menos confiable
- un sistema comprometido
- un archivo subido
- una cola manipulable
- una restauración vieja
- un store auxiliar contaminado

### Regla útil

No confundas “no vino por el controller principal” con “es confiable”.

---

## Datos de confianza parcial también merecen cautela

A veces la entrada no viene de un atacante anónimo, sino de:

- otro servicio
- un partner
- una integración
- una cola interna
- un archivo generado por otro equipo

Eso puede bajar algo el riesgo en algunos casos.
Pero no lo elimina.

Porque igual puede haber:

- errores
- contaminación
- desajustes de versión
- abuso interno
- compromisos parciales
- supuestos falsos de confianza

### Idea importante

La deserialización segura no depende solo de “quién lo envió”.
También depende de cuánto poder le das a lo recibido.

---

## El formato importa, pero el diseño importa más

Sí, algunos formatos y mecanismos son históricamente más peligrosos que otros.
Pero aun así, la lección más valiosa es de diseño:

> cuanto más automática, rica y permisiva es la reconstrucción, más peligroso se vuelve el proceso.

Esto ayuda a no quedarse atrapado en una lista de tecnologías “malas”.
La pregunta más potente es:

- ¿qué poder semántico le doy al input al reconstruirlo?

---

## Señales tempranas de que el diseño va mal

Hay ciertas ideas que suelen oler mal aunque todavía no conozcas el detalle técnico exacto.

Por ejemplo:

- “guardamos objetos completos y los revivimos tal cual”
- “el cliente puede decidir el tipo”
- “aceptamos estructuras arbitrarias”
- “rehidratamos el objeto de dominio directamente”
- “si parsea, debe estar bien”
- “la librería se encarga sola”
- “esto viene de un sistema interno, así que confiemos”
- “después validamos, primero creemos el objeto”

### Idea útil

Todas esas frases muestran exceso de confianza en el puente entre input y modelo interno.

---

## Qué suele tener sentido en una estrategia más sana

Sin entrar todavía en implementación puntual, una dirección más segura suele incluir cosas como:

- formatos más simples
- DTOs explícitos
- menos polimorfismo desde input externo
- validación posterior clara
- límites de tamaño y complejidad
- menos reconstrucción directa de objetos ricos
- menor dependencia de serialización mágica
- separación clara entre contrato externo y modelo interno

### Regla sana

El objetivo no es “no parsear nada”.
El objetivo es que el parseo no se convierta en una forma de darle demasiado control al input.

---

## Qué conviene revisar en una aplicación real

Cuando revises riesgo de deserialización insegura, mirá especialmente:

- mecanismos de serialización binaria o rica
- formatos complejos consumidos desde fuentes no confiables
- reconstrucción directa de objetos de dominio
- uso de tipos dinámicos o polimórficos desde input
- mensajes de colas o stores auxiliares rehidratados con demasiada fe
- uploads que luego se interpretan en estructuras complejas
- sesiones, caches o blobs que reviven objetos ricos
- validación que ocurre demasiado tarde
- librerías que hacen magia excesiva entre bytes y objetos
- supuestos de confianza poco justificados entre sistemas internos

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- contratos externos más explícitos
- datos simples en vez de objetos ricos rehidratados
- menos magia entre input y modelo interno
- validación separada de la mera reconstrucción técnica
- menor dependencia de tipos elegidos por el emisor
- límites de complejidad más claros
- menos reutilización de objetos de dominio como formatos de entrada
- mejor conciencia de que parsear no equivale a confiar

---

## Señales de ruido

Estas señales merecen revisión rápida:

- objetos completos revividos desde fuentes externas
- input capaz de influir en clases concretas o jerarquías
- “si se deserializa, entonces es válido”
- demasiado polimorfismo desde afuera
- confianza excesiva en librerías automáticas
- datos de colas, archivos o caches tratados como si fueran intrínsecamente seguros
- nadie puede explicar qué parte del modelo interno está quedando controlada por el input
- el equipo piensa la deserialización solo en términos de sintaxis y no de semántica o comportamiento

---

## Checklist práctico

Cuando revises un flujo de deserialización, preguntate:

- ¿qué fuente controla este contenido?
- ¿qué tipo de estructura interna estamos reconstruyendo?
- ¿el input puede influir en clases, tipos o jerarquías?
- ¿estamos reviviendo objetos ricos cuando bastaría un DTO simple?
- ¿validamos después de deserializar o asumimos que parsear alcanza?
- ¿qué efectos laterales o comportamientos podrían activarse?
- ¿qué daño podría causar aunque no exista ejecución remota?
- ¿esta fuente es realmente confiable o solo “parece interna”?
- ¿qué parte del modelo podría simplificarse para recibir menos poder desde afuera?
- ¿dónde está hoy el exceso de confianza?

---

## Mini ejercicio de reflexión

Tomá un flujo real de tu proyecto donde se reciba o reconstruya información desde afuera, por ejemplo:

- request compleja
- mensaje de cola
- archivo importado
- blob persistido
- cache rehidratada

y respondé:

1. ¿Qué se reconstruye realmente?
2. ¿Qué parte de eso es simple dato y qué parte ya es objeto rico?
3. ¿El input decide tipos o estructura?
4. ¿Qué confianza se está dando por supuesta?
5. ¿Qué validación ocurre después?
6. ¿Qué daño podría producir un objeto “bien parseado” pero semánticamente peligroso?
7. ¿Qué simplificarías para quitarle poder al input?

---

## Resumen

La deserialización insegura aparece cuando el sistema deja que datos externos influyan demasiado en cómo se construyen objetos, estructuras o estados internos.

No se trata solo de formatos o de casos famosos.
Se trata de entender que:

- parsear no es igual a validar
- reconstruir no es igual a confiar
- datos simples son más sanos que objetos ricos
- el input no debería decidir libremente tipos o comportamientos
- el daño posible va mucho más allá de la ejecución remota

En resumen:

> un backend más maduro no convierte bytes o documentos externos directamente en objetos internos ricos sin fricción.  
> Primero reduce el poder del formato, limita la reconstrucción y recién después decide qué parte de eso merece confianza real.

---

## Próximo tema

**Procesamiento de documentos y archivos**
