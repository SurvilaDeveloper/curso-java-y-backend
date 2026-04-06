---
title: "Motores de templates server-side: dónde aparece SSTI en Java"
description: "Cómo entender dónde aparece SSTI en Java y Spring Boot al usar motores de templates server-side. Por qué no son solo HTML con variables y qué cambia cuando input no confiable influye la plantilla, los fragmentos o el contexto que el motor interpreta."
order: 205
module: "Expresiones, templates y ejecución indirecta"
level: "base"
draft: false
---

# Motores de templates server-side: dónde aparece SSTI en Java

## Objetivo del tema

Entender qué son los **motores de templates server-side** dentro del ecosistema Java + Spring Boot, por qué se sienten tan naturales en el desarrollo web y dónde empieza a aparecer la superficie de **SSTI** cuando input no confiable influye demasiado lo que el motor termina interpretando.

La idea de este tema es continuar directamente el hilo del bloque.

Ya vimos que:

- no toda ejecución peligrosa se parece a una shell o a código explícito
- muchas veces el riesgo aparece cuando una cadena deja de ser dato y pasa a ser algo evaluable
- SpEL es un ejemplo claro de motor interpretativo dentro de Spring
- y los filtros dinámicos pueden convertirse en una forma de lógica declarativa demasiado influida por input externo

Ahora toca ver otra zona muy clásica de ejecución indirecta:

- **templates server-side**
- renderizado HTML del lado del servidor
- fragmentos, vistas y layouts
- motores de plantillas con expresiones, condiciones y navegación de datos

Y esto importa mucho porque, desde la experiencia del developer, un template se siente como algo muy inocente:

- HTML con placeholders
- condiciones simples
- loops
- textos dinámicos
- fragmentos reusables

Eso es cómodo y muy productivo.
Pero también significa que ya existe un motor del lado del servidor que:

- interpreta una sintaxis propia
- evalúa expresiones
- navega datos y contexto
- resuelve fragmentos o includes
- y produce una salida final a partir de lógica declarativa

En resumen:

> SSTI importa porque un motor de templates server-side no es solo una herramienta de presentación,  
> sino un intérprete del lado del backend, y el riesgo aparece cuando input no confiable deja de ser contenido para mostrar y empieza a influir la plantilla, el fragmento o la expresión que el motor va a evaluar.

---

## Idea clave

La idea central del tema es esta:

> un template server-side no es solo “HTML con variables”.  
> Es una forma de **programación declarativa** que el backend interpreta para producir la respuesta.

Eso cambia bastante la mirada.

Porque una cosa es:

- pasar un dato
- y mostrarlo en una vista ya controlada por el sistema

Y otra muy distinta es:

- dejar que el input influya el template
- el nombre del fragmento
- la ruta de vista
- la composición de la plantilla
- o expresiones que el motor va a resolver

### Idea importante

El problema no está solo en el dato que se renderiza.
Está también en **qué parte del template o del proceso de renderizado queda influida por input externo**.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- pensar que los templates server-side son solo HTML estático con variables
- no distinguir entre datos para render y lógica de render
- dejar que input no confiable influya plantillas, fragmentos o nombres de vista
- subestimar el poder real del motor de templates
- asumir que el riesgo aparece solo si el template completo viene del usuario
- olvidar que rutas, includes, layouts o componentes dinámicos también pueden formar parte de la superficie

Es decir:

> el problema no es usar templates del lado del servidor.  
> El problema es dejar que input externo influya demasiado la parte que el motor interpreta como plantilla, estructura o lógica declarativa.

---

## Error mental clásico

Un error muy común es este:

### “Los templates solo muestran datos; no ejecutan nada importante”

Eso es una descripción demasiado débil.

Porque todavía conviene preguntar:

- ¿qué motor usa la app?
- ¿qué expresiones entiende?
- ¿qué contexto le pasa el backend?
- ¿qué puede resolver además de variables simples?
- ¿qué parte del template se decide dinámicamente?
- ¿quién influye el nombre de vista, fragmento o include?

### Idea importante

Aunque el resultado sea HTML, el proceso que lo produce ya es una forma de evaluación dentro del backend.

---

# Parte 1: Qué es un motor de templates server-side, a nivel intuitivo

## La intuición simple

Un motor de templates server-side es una pieza del backend que toma algo como:

- una plantilla
- un contexto de datos
- una sintaxis de expresiones o directivas
- y reglas de composición

y produce una salida final, normalmente HTML.

Eso puede incluir:

- placeholders
- condiciones
- iteraciones
- includes
- fragmentos
- layouts
- navegación de propiedades
- helpers o funciones del motor

### Idea útil

Eso ya implica bastante más que “string replacement”.
Implica un motor que **interpreta** una pequeña sintaxis declarativa.

### Regla sana

Cada vez que uses templates del lado del servidor, recordá que ya hay un intérprete corriendo dentro de tu backend.

---

# Parte 2: Qué significa SSTI, a nivel intuitivo

## La intuición útil

Podés pensar **SSTI** como una situación donde input no confiable influye algo que el motor de templates termina interpretando como:

- parte de la plantilla
- expresión
- fragmento
- ruta de vista
- include
- bloque dinámico
- o estructura declarativa de render

No hace falta imaginar enseguida el caso más extremo.
Lo importante es entender la forma del problema:

1. entra input no confiable
2. ese input deja de tratarse solo como dato visible
3. el motor lo usa en algo que interpreta
4. la frontera de presentación se vuelve una frontera de evaluación

### Idea importante

El riesgo no empieza solo cuando el usuario “sube una plantilla”.
Puede empezar mucho antes, en cualquier punto donde la app deje que el input toque la lógica del motor.

### Regla sana

Si una cadena ya no solo se imprime, sino que afecta lo que el motor decide evaluar, la categoría cambió.

---

# Parte 3: Dato para mostrar vs lógica para renderizar

Esta distinción es central en todo el tema.

## Dato para mostrar
- título
- nombre
- precio
- mensaje
- descripción
- lista de elementos ya preparada por el backend

## Lógica para renderizar
- qué vista usar
- qué fragmento incluir
- qué condición evaluar
- qué expresión resolver
- qué layout componer
- qué parte de la plantilla activar

### Idea útil

El motor de templates es seguro o más defendible cuando el backend controla la lógica y el input solo alimenta datos.

### Regla sana

No confundas:
- “mostrar datos dinámicos”
con
- “hacer dinámico el template mismo”.

---

# Parte 4: Por qué esto aparece tanto en Java

En el ecosistema Java esta superficie es muy natural porque históricamente hubo mucho uso de:

- motores de templates server-side
- MVC clásico
- renderizado del lado del servidor
- composición de vistas
- layouts y fragmentos
- expresiones embebidas en HTML
- helpers y utilities del framework

### Idea importante

Eso hace que SSTI no sea una rareza “de laboratorio”.
Es una posibilidad bastante natural allí donde el proyecto usa render server-side con suficiente flexibilidad.

### Regla sana

Cuanto más “inteligente” y más expresivo es el motor de templates, más importante se vuelve mantener bien separadas presentación y evaluación influida por input.

---

# Parte 5: El problema no es solo “template controlado por usuario”

A veces se enseña SSTI como si solo ocurriera cuando el usuario escribe directamente una plantilla completa.
Eso existe, pero es una versión muy obvia y no la única.

También puede aparecer cuando input influye cosas como:

- nombre de template
- nombre de fragmento
- path de vista
- composición dinámica de includes
- expresiones que se terminan concatenando
- bloques o partes del template que el backend trata como evaluables

### Idea útil

La frontera delicada no es solo “plantilla entera”.
Puede ser cualquier pieza que el motor use para decidir qué interpretar.

### Regla sana

No revises solo si el usuario “edita templates”.
Revisá también qué partes del flujo de renderizado se vuelven demasiado dinámicas.

---

# Parte 6: Por qué el motor de templates se parece a SpEL y a otros motores del bloque

La conexión conceptual es muy fuerte.

## Con SpEL
vimos que el problema aparece cuando una cadena influye un motor de expresiones.

## Con filtros dinámicos
vimos que el input puede describir lógica declarativa y no solo datos.

## Con templates
vuelve a pasar lo mismo:
- una cadena deja de ser solo contenido
- y pasa a influir el proceso interpretativo que produce la salida

### Idea importante

La familia del problema es la misma:
- demasiada interpretación
- demasiado cerca del backend
- demasiado influida por input no confiable

### Regla sana

Cada vez que un motor de templates hace más que reemplazar texto, conviene tratarlo con la misma seriedad que cualquier otro motor interpretativo.

---

# Parte 7: Qué vuelve engañoso al HTML server-side

El HTML generado baja mucho la guardia del equipo porque parece “solo presentación”.

Pero eso confunde:

- el **resultado** del motor
con
- la **maquinaria** que generó ese resultado

### Idea útil

El navegador ve HTML final.
Pero antes de llegar ahí, el backend pudo haber:

- resuelto expresiones
- evaluado condiciones
- decidido fragmentos
- cargado vistas
- combinado layouts
- o interpretado sintaxis propia del motor

### Regla sana

No evalúes la peligrosidad del motor por la inocencia aparente del output final.

---

# Parte 8: Qué tipos de impacto conviene imaginar

Todavía no estamos entrando a motores concretos de Java, pero sí conviene tener presentes varias familias de riesgo:

### 1. Evaluación no prevista
Una cadena influye algo que el motor interpreta.

### 2. Acceso inesperado a contexto
El template o la expresión navega más datos u objetos de los previstos.

### 3. Composición peligrosa
El sistema arma vistas, fragmentos o includes de forma demasiado flexible.

### 4. Opacidad
El equipo no sabe bien qué parte es dato y qué parte es lógica declarativa del motor.

### 5. Cercanía al runtime
El motor de templates queda demasiado cerca de objetos, helpers o mecanismos del framework.

### Idea importante

SSTI no es solo una curiosidad del mundo web.
Es otra forma de ejecución indirecta disfrazada de rendering.

---

# Parte 9: El problema de los nombres de vista y fragmentos dinámicos

Esta es una superficie especialmente común y especialmente subestimada.

Muchos sistemas hacen cosas como:

- elegir vista según parámetro
- elegir fragmento según tipo
- componer layouts de forma flexible
- armar includes desde strings
- construir templates o subtemplates dinámicamente

Desde producto eso suena elegante.
Pero puede acercarse mucho a una lógica de evaluación si el control del backend es flojo.

### Idea útil

El nombre de la vista no siempre es “solo routing visual”.
Puede convertirse en una parte delicada del mecanismo de interpretación del motor.

### Regla sana

Cada vez que una vista, fragmento o include deja de estar completamente decidido por el backend, preguntate cuánto de esa decisión estás externalizando.

---

# Parte 10: Qué preguntas conviene hacer en una review

Cuando revises templates server-side, conviene preguntar:

- ¿qué motor usa la app?
- ¿qué expresiones o directivas entiende?
- ¿qué contexto recibe el template?
- ¿qué parte del template, fragmento o vista puede variar?
- ¿quién controla esos nombres o strings?
- ¿hay concatenación o composición dinámica?
- ¿el input se imprime como dato o influye lo que el motor interpreta?

### Idea importante

La pregunta útil no es solo:
- “¿hay templates?”
La pregunta útil es:
- “¿qué parte del proceso de renderizado puede ser influida por input no confiable?”

---

# Parte 11: Qué revisar en una app Spring

En una app Spring, conviene sospechar especialmente cuando veas:

- render server-side con motores de templates
- nombres de vista construidos dinámicamente
- fragmentos elegidos por input
- includes o layouts variables
- helpers que mezclan strings externas con plantillas
- features de personalización visual o de correo que terminan componiendo templates de manera flexible
- datos que el equipo cree que “solo se muestran”, pero en realidad participan de algo evaluable

### Idea útil

Si el backend no controla completamente la forma de la plantilla y el input ya influye algo más que valores visibles, la superficie merece atención seria.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- templates definidas internamente
- nombres de vista y fragmentos controlados por el servidor
- input usado solo como dato visible
- poca o nula composición dinámica innecesaria
- menor poder interpretativo expuesto
- equipos que distinguen claramente contenido para mostrar de estructura del render

### Idea importante

La madurez aquí se nota cuando la UI dinámica no se construye regalándole al input el lenguaje del motor de templates.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- nombres de vista, fragmento o include influidos por input
- composición de templates demasiado flexible
- el equipo habla de “HTML con variables”, pero el motor hace bastante más
- nadie sabe bien qué contexto tiene disponible la plantilla
- cadenas externas que dejan de ser texto y pasan a influir lógica de render
- el proyecto trata el motor de templates como mero string builder

### Regla sana

Si el sistema ya no puede decir claramente qué parte del template está bajo control total del backend, probablemente la superficie ya se agrandó demasiado.

---

## Checklist práctica

Para revisar templates server-side en una app Java, preguntate:

- ¿qué motor de templates se usa?
- ¿qué sintaxis y capacidades tiene?
- ¿quién define las plantillas?
- ¿qué nombres de vista o fragmentos pueden variar?
- ¿qué parte del input se imprime como dato y qué parte influye render lógico?
- ¿qué contexto del backend queda disponible para el motor?
- ¿qué parte del diseño podría hacerse más fija y explícita?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Usa templates server-side?
2. ¿Qué motor usa?
3. ¿Qué parte del render está completamente controlada por el backend?
4. ¿Hay nombres de vista o fragmentos dinámicos?
5. ¿Qué cadenas externas podrían influir más de lo debido el proceso de render?
6. ¿Qué parte del equipo sigue pensando esto como “solo HTML”?
7. ¿Qué revisarías primero después de este tema?

---

## Resumen

Los motores de templates server-side importan porque convierten la presentación en una superficie de interpretación del lado del backend, y el riesgo aparece cuando input no confiable deja de ser solo contenido para mostrar y empieza a influir la plantilla, el fragmento o la lógica declarativa que el motor evalúa.

La gran intuición del tema es esta:

- el output puede ser “solo HTML”
- pero el proceso que lo produce ya es interpretación real
- dato y lógica de render no son lo mismo
- el problema no requiere que el usuario edite una plantilla completa
- alcanza con que influya demasiado una parte que el motor va a interpretar

En resumen:

> un backend más maduro no trata los templates server-side como si fueran simples documentos estáticos con placeholders inocentes, sino como motores de render declarativo que pueden volverse una frontera de ejecución indirecta si nadie controla con cuidado qué partes de la plantilla, del contexto o de la composición quedan del lado del sistema y cuáles empiezan a abrirse demasiado al input externo.  
> Entiende que la pregunta importante no es solo si el usuario ve una página correcta, sino qué tuvo que interpretar el backend para producirla y quién pudo influir esa interpretación.  
> Y justamente por eso este tema importa tanto: porque introduce de lleno la lógica de SSTI dentro del mundo Java mostrando que el riesgo no está solo en “ejecutar código”, sino también en permitir que una plantilla del lado del servidor deje de ser un artefacto controlado por la aplicación y pase a ser, aunque sea en parte, una estructura evaluable influida por el exterior.

---

## Próximo tema

**Thymeleaf, FreeMarker y compañía: qué revisar sin paranoia vacía**
