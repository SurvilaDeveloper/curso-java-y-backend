---
title: "Qué diferencia hay entre parsear datos y reconstruir objetos"
description: "Cómo distinguir parsear datos de reconstruir objetos en aplicaciones Java con Spring Boot. Por qué esta diferencia importa para seguridad, qué cambia cuando el runtime materializa estructuras internas y cómo eso modifica la superficie de deserialización."
order: 182
module: "Deserialización insegura y materialización de objetos"
level: "base"
draft: false
---

# Qué diferencia hay entre parsear datos y reconstruir objetos

## Objetivo del tema

Entender qué diferencia hay entre **parsear datos** y **reconstruir objetos** en una aplicación Java + Spring Boot, y por qué esa diferencia importa muchísimo cuando analizamos **deserialización insegura**.

La idea de este tema es consolidar la intuición principal del bloque anterior.

Ya vimos que la deserialización insegura no conviene pensarla como si fuera solo:

- leer un JSON
- parsear un XML
- convertir un archivo
- o “hacer binding” de forma cómoda

Ahora toca afinar la distinción más importante de todo este bloque:

> no es lo mismo extraer datos simples de una entrada que permitir que esa entrada participe en la reconstrucción de objetos dentro del runtime.

A simple vista, ambas cosas pueden parecer muy parecidas:

- entra un payload
- el framework hace su trabajo
- obtenés algo usable en Java
- seguís con la lógica del negocio

Pero desde seguridad, el salto entre una cosa y otra es enorme.

En resumen:

> parsear datos suele implicar leer valores dentro de un contrato relativamente cerrado,  
> mientras que reconstruir objetos puede implicar darle mucho más poder al input para describir estructura interna, tipos, relaciones o materialización dentro del runtime, y eso cambia por completo la superficie de riesgo.

---

## Idea clave

La idea central del tema es esta:

> **parsear** es, en general, interpretar datos;  
> **reconstruir objetos** es, además, materializar estructura interna del programa.

Ese matiz cambia mucho.

Porque cuando parseás datos, lo normal es que el sistema haga algo como:

- leer campos
- convertir tipos primitivos
- validar formato
- copiar a una estructura simple
- y recién después decidir qué objeto interno crear

En cambio, cuando reconstruís objetos, el sistema se acerca más a algo como:

- el input describe una estructura
- el runtime decide cómo materializarla
- el framework crea instancias
- resuelve tipos o subtipos
- y termina generando objetos mucho más cercanos a la forma interna del sistema

### Idea importante

Cuanto más cerca está el input externo de la estructura real de objetos del programa, más delicada se vuelve la deserialización.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- tratar toda deserialización como si fuera solo parseo inocente
- no distinguir DTOs simples de objetos ricos
- pensar que si el output “se ve como clase Java” entonces el riesgo es el mismo en todos los casos
- confiar demasiado en binding automático
- no ver cuándo el framework está materializando más estructura de la necesaria

Es decir:

> el problema no es solo recibir datos.  
> El problema es cuánto del modelo interno del programa dejamos que el input externo describa o reconstruya.

---

## Error mental clásico

Un error muy común es este:

### “En ambos casos estoy recibiendo datos del usuario, así que el riesgo debería ser más o menos el mismo”

Eso suena razonable, pero mezcla dos planos distintos.

Sí, en ambos casos hay input externo.
Pero no es lo mismo que ese input diga:

- “este campo vale 42”

a que diga, de forma más o menos implícita:

- “materializá esta estructura”
- “instanciá este tipo”
- “reconstruí esta forma de objeto”
- “dejame llegar más cerca del runtime que solo a un DTO simple”

### Idea importante

La diferencia no está solo en que haya datos.
Está en **cuánto control estructural** obtiene el input sobre la materialización del lado del servidor.

---

# Parte 1: Qué significa parsear datos, a nivel intuitivo

## La intuición simple

Parsear datos suele significar algo como:

- recibir texto o bytes
- interpretar campos
- convertir tipos básicos
- y obtener una representación relativamente simple

Por ejemplo, en una app Spring, esto muchas veces se siente así:

- llega JSON
- se leen strings, números, booleanos, listas cerradas
- se llenan DTOs relativamente tontos
- se valida
- y luego la lógica interna decide qué hacer

### Idea útil

Acá el input todavía está bastante lejos del modelo interno profundo del sistema.

### Regla sana

Cuanto más acotado y simple es el contrato de entrada, más cerca estás de “parsear datos” y menos de “reconstruir objetos ricos”.

---

# Parte 2: Qué significa reconstruir objetos, a nivel intuitivo

## La intuición simple

Reconstruir objetos implica algo más fuerte:

- el input no solo trae valores
- también guía cómo se forma una estructura dentro del runtime
- el framework o la librería crean instancias
- enlazan campos
- pueden resolver tipos
- y terminan rehidratando algo más parecido al mundo interno del programa

### Idea importante

Acá el input se acerca mucho más al lenguaje de objetos del backend.

### Regla sana

Cada vez que el sistema “rearma” algo más rico que un DTO simple, conviene preguntarse si el input ganó demasiado poder sobre la forma interna del programa.

---

# Parte 3: DTO simple vs objeto rico

Esta distinción ayuda muchísimo.

## DTO simple
Suele tener:
- pocos campos
- tipos básicos
- estructura cerrada
- poca lógica
- poco comportamiento
- poco parecido al mundo interno profundo del sistema

## Objeto rico
Puede tener:
- más estructura
- más relaciones
- tipos anidados
- cercanía al dominio interno
- más comportamiento asociado
- más dependencia del runtime o del framework

### Idea útil

No todo objeto Java materializado desde input externo es igual de delicado.
Pero, en general, cuanto más rico y más cercano al dominio interno, más cuidadosa debe ser la revisión.

### Regla sana

La seguridad suele mejorar cuando mantenés una buena distancia entre:
- datos externos
y
- objetos internos ricos del sistema.

---

# Parte 4: Por qué esta diferencia importa tanto para seguridad

Porque parsear datos y reconstruir objetos no le piden lo mismo al runtime.

### Parsear datos
suele pedir:
- conversión
- validación
- lectura estructural

### Reconstruir objetos
puede pedir además:
- instanciación
- binding más profundo
- resolución de tipos
- uso de reflection
- materialización más cercana al classpath y al modelo interno

### Idea importante

Eso aumenta la superficie no solo por complejidad, sino porque hace que el input participe más en decisiones que antes quedaban del lado del código del backend.

### Regla sana

Si el sistema hace demasiadas decisiones de materialización “por vos”, conviene revisar con más cautela lo que el input puede llegar a describir.

---

# Parte 5: La confianza se mueve de lugar

En un parseo de datos cerrado, la confianza suele estar más acá:

- el servidor define los tipos
- el servidor define la forma del objeto útil
- el input solo llena casilleros

En una reconstrucción de objetos más potente, parte de la confianza se mueve hacia:

- cómo el framework interpreta el input
- qué tipo de estructura deja materializar
- qué tan cerca del modelo interno deja llegar al payload

### Idea útil

No es solo “más automatización”.
Es también **más poder delegado al mecanismo de deserialización**.

### Regla sana

Cada vez que ganás comodidad de mapping, preguntate si también estás perdiendo control explícito sobre la materialización.

---

# Parte 6: Por qué el problema se esconde tan bien en frameworks cómodos

Una razón por la que esta categoría se subestima es que el código luce prolijo.

El developer ve algo así:

- un `@RequestBody`
- una clase
- un mapper
- un `ObjectMapper`
- un `Unmarshaller`
- un framework que “te da el objeto listo”

Eso se siente natural y elegante.

### Problema

La elegancia puede ocultar cuánto trabajo interno hizo el runtime para construir ese resultado.

### Idea importante

El riesgo no siempre se ve en el objeto final.
Muchas veces vive en cómo llegaste hasta él.

### Regla sana

Cuanto más cómodo sea el binding, más vale la pena preguntarte qué parte del proceso dejó de ser explícita para vos.

---

# Parte 7: Reconstruir objetos no siempre implica RCE inmediata

Esto también conviene aclararlo para evitar caricaturas.

A veces, cuando se habla de deserialización insegura, todo el mundo piensa enseguida en:
- ejecución remota de código

Eso puede ser una posibilidad importante en ciertos contextos.
Pero no hace falta saltar directamente a ese escenario para que la diferencia entre parsear y reconstruir ya importe mucho.

Porque incluso sin llegar a ese extremo, ya podés tener:

- materialización de tipos no previstos
- estructuras demasiado complejas
- comportamiento inesperado del framework
- confusión entre datos externos y modelo interno
- mayor superficie heredada de dependencias
- mayor opacidad del flujo

### Idea importante

La categoría es relevante mucho antes de llegar al caso más espectacular.

---

# Parte 8: El classpath empieza a importar más

Cuando el sistema solo parsea datos simples, el classpath pesa, sí, pero de otra manera.

Cuando el sistema reconstruye objetos, el classpath puede volverse mucho más relevante porque:

- amplía tipos disponibles
- amplía comportamiento posible
- amplía superficie heredada de librerías
- y puede acercar más el input a estructuras reales presentes en la app

### Idea útil

Eso hace que el análisis ya no dependa solo de tu DTO, sino también del ecosistema real de clases y dependencias cargadas.

### Regla sana

Cuanto más objeto reconstruís, más te conviene mirar no solo el payload, sino también el mundo de clases que el runtime tiene a mano.

---

# Parte 9: Por qué el contrato de entrada importa tanto

Este tema conecta muy bien con decisiones de diseño.

Una postura más sana suele intentar que el contrato de entrada sea:

- pequeño
- cerrado
- explícito
- poco expresivo
- poco capaz de describir estructura interna

### Idea importante

El problema no es solo qué librería usás.
También es cuánto del modelo interno dejaste que el input pueda describir.

### Regla sana

La mejor defensa muchas veces no es “parsear mejor cualquier cosa”, sino **aceptar menos clase de cosa desde el principio**.

---

# Parte 10: Qué señales te acercan más al lado peligroso

Estas señales suelen empujar un flujo más hacia “reconstrucción riesgosa” que hacia “parseo simple”:

- tipos dinámicos
- polimorfismo demasiado abierto
- binding directo a objetos ricos
- deserialización de estructuras complejas desde terceros
- poca separación entre DTO y dominio
- demasiada magia automática del framework
- input que describe demasiado del objeto resultante
- formatos o librerías que rehidratan estructuras enteras

### Idea útil

No hace falta que estén todas para que valga la pena revisar.
Con que aparezcan varias, ya conviene levantar la alerta.

---

# Parte 11: Qué señales te dejan más cerca de parseo seguro de datos

Estas señales suelen empujar el flujo hacia un parseo más defendible:

- DTOs cerrados
- tipos básicos y estructuras simples
- poco o nulo polimorfismo desde input externo
- separación clara entre entrada y dominio
- validación explícita
- mapping controlado por código del servidor
- poca cercanía entre payload y modelo interno real

### Idea importante

Mientras más trabajo consciente hace el servidor para transformar datos en objetos útiles, menos trabajo sensible le delega al mecanismo de deserialización.

---

# Parte 12: Qué preguntas conviene hacer en una review

Cuando revises un flujo que “deserializa”, conviene preguntar:

- ¿estamos parseando valores o rehidratando objetos más ricos?
- ¿el input llena casilleros o describe estructura interna?
- ¿qué librería hace la materialización?
- ¿qué tipos puede crear?
- ¿el objeto resultante está demasiado cerca del dominio interno?
- ¿hay polimorfismo o tipos dinámicos?
- ¿qué parte del trabajo de transformación debería volver a ser explícita del lado del servidor?

### Regla sana

La review madura no pregunta solo:
- “¿anda?”
Pregunta también:
- “¿le dimos demasiado poder al input para construir mundo interno?”

---

# Parte 13: Cómo reconocer esto en una codebase Spring

En una app Spring o Java, conviene sospechar especialmente cuando veas:

- `@RequestBody` sobre tipos demasiado ricos
- binding directo a entidades o modelos internos
- Jackson con soporte tipado amplio
- unmarshalling a clases de dominio
- uso de serialización nativa
- caches, colas o archivos que rehidratan objetos complejos
- poca separación entre capa externa y modelo interno
- frases del equipo como “el framework ya nos deja el objeto listo”

### Idea útil

En revisión real, la señal más fuerte suele ser esta:
- el input ya se parece demasiado al objeto interno final.

---

## Qué revisar en una app Spring

Cuando revises qué diferencia hay entre parsear datos y reconstruir objetos en una app Spring, mirá especialmente:

- qué clases recibe cada endpoint o flujo
- si son DTOs cerrados o modelos ricos
- qué framework hace el binding
- qué tanto del objeto final viene decidido por el input
- si hay tipos dinámicos o polimorfismo
- qué dependencias amplían la superficie
- qué parte del diseño podría mover más lógica de materialización al lado del servidor

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- contratos de entrada pequeños
- DTOs simples
- poca magia de materialización
- menos cercanía entre input y dominio interno
- menos tipos dinámicos
- más transformación explícita del lado del servidor
- reviewers capaces de explicar qué parte del flujo es parseo y qué parte ya es reconstrucción de objetos

### Idea importante

La madurez aquí se nota cuando el equipo mantiene una frontera clara entre datos externos y objetos internos.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- el input llega directo a clases ricas
- nadie distingue parseo de reconstrucción
- el framework hace demasiado trabajo invisible
- se trata el binding cómodo como si fuera neutro
- el equipo no sabe qué tipos o estructuras pueden materializarse
- hay demasiada cercanía entre payload y modelo interno

### Regla sana

Si el input ya casi “habla el idioma interno” del sistema, probablemente convenga recortar bastante más la superficie.

---

## Checklist práctica

Cuando veas deserialización en una app Spring, preguntate:

- ¿estamos leyendo datos o reconstruyendo objetos?
- ¿qué tan rico es el objeto resultante?
- ¿qué parte del objeto la define el input?
- ¿hay tipos dinámicos?
- ¿hay demasiada cercanía entre input y dominio?
- ¿qué parte del binding debería volverse más explícita?
- ¿qué superficie del runtime estamos exponiendo de más?

---

## Mini ejercicio de reflexión

Tomá un endpoint o flujo real de tu app Spring y respondé:

1. ¿Recibe DTO simple o algo más rico?
2. ¿Qué framework lo materializa?
3. ¿Qué parte del objeto final depende directamente del input?
4. ¿Hay polimorfismo o tipos dinámicos?
5. ¿Qué parte del riesgo se parece más a parseo y cuál a reconstrucción?
6. ¿Qué cambio haría el contrato de entrada más chico?
7. ¿Qué punto del flujo revisarías primero después de este tema?

---

## Resumen

La diferencia entre parsear datos y reconstruir objetos importa muchísimo porque marca cuánto poder le damos al input externo sobre la materialización interna del sistema.

En un extremo, tenemos parseo más cerrado:

- valores simples
- DTOs acotados
- transformación explícita
- poca cercanía con el dominio interno

En el otro, tenemos reconstrucción más riesgosa:

- objetos ricos
- más magia del framework
- más decisión delegada al runtime
- más cercanía al modelo interno
- más superficie heredada de tipos y dependencias

En resumen:

> un backend más maduro no mete todo bajo la misma palabra “deserialización” como si fuera una operación uniforme e inocente, sino que aprende a distinguir cuándo está simplemente leyendo datos bajo un contrato pequeño y cuándo, en cambio, está dejando que input externo se acerque demasiado al lenguaje de objetos del sistema.  
> Y justamente por eso este tema importa tanto: porque esa distinción cambia por completo la forma de revisar el riesgo, y ayuda a ver que el verdadero problema no empieza recién cuando aparece una cadena espectacular de explotación, sino mucho antes, en el momento en que el framework o la librería empiezan a reconstruir más estructura de la que el negocio realmente necesitaba aceptar desde afuera.

---

## Próximo tema

**Riesgo real en Java: de objetos cómodos a comportamiento inesperado**
