---
title: "CSP y scripts inline"
description: "Cómo se relaciona Content-Security-Policy con los scripts inline en una aplicación Java con Spring Boot. Por qué el código JavaScript embebido directamente en HTML vuelve más difícil endurecer la política de ejecución del navegador y qué señales indican una superficie web demasiado permisiva."
order: 111
module: "HTTP, headers y superficie del navegador"
level: "base"
draft: false
---

# CSP y scripts inline

## Objetivo del tema

Entender cómo se relaciona **Content-Security-Policy** con los **scripts inline** en una aplicación Java + Spring Boot, y por qué esta combinación suele ser uno de los puntos donde más se nota si la superficie web está ordenada o demasiado permisiva.

La idea es bajar CSP a una fricción muy concreta del día a día.

Muchas aplicaciones, sobre todo cuando crecen rápido o vienen arrastrando historia, terminan teniendo cosas como:

- bloques `<script>` embebidos en el HTML
- handlers inline como `onclick`, `onchange` o similares
- pequeños fragmentos de JavaScript “solo para esta vista”
- datos y lógica mezclados en la plantilla
- código generado dinámicamente dentro de la página

Todo eso puede parecer práctico.
Y muchas veces lo fue, al menos al principio.

Pero desde seguridad introduce un problema importante:

> si querés que el navegador sea estricto con qué código puede ejecutarse, los scripts inline suelen empujarte justo en la dirección contraria.

En resumen:

> una CSP más fuerte y los scripts inline suelen llevarse mal porque uno intenta reducir ejecución ambigua y el otro depende bastante de permitirla.

---

## Idea clave

Content-Security-Policy intenta hacer más explícita la pregunta:

- **¿qué código JavaScript puede ejecutarse en esta página y desde dónde?**

Los scripts inline vuelven esa pregunta mucho más incómoda porque el código ya no viene solo desde archivos o recursos claramente ubicados.
También aparece **mezclado dentro del HTML**.

La idea central es esta:

> cuanto más código inline tiene una app, más difícil es pasar de una política de ejecución amplia a una política más explícita y restrictiva.

Y eso importa mucho porque, del lado del navegador, el código inline suele representar más ambigüedad, menos trazabilidad y más superficie si algún contenido de la página se vuelve influenciable.

---

## Qué problema intenta resolver este tema

Este tema busca evitar situaciones como:

- permitir ejecución inline por costumbre
- mezclar HTML, datos y lógica de forma difícil de endurecer
- depender de handlers inline repartidos por muchas vistas
- tener una CSP demasiado abierta solo para que la app siga “funcionando”
- asumir que los scripts pequeños embebidos no agregan riesgo real
- no distinguir entre comodidad de desarrollo y superficie de ejecución
- cargar la página con demasiada lógica ad hoc imposible de gobernar bien
- terminar con una política que ya no restringe casi nada porque la app depende de demasiadas excepciones

Es decir:

> el problema no es solo que exista JavaScript en la app.  
> El problema es qué tan libre, mezclado y difícil de delimitar queda ese JavaScript cuando vive incrustado en el HTML.

---

## Error mental clásico

Un error muy común es este:

### “Es solo un script chiquito embebido en la vista”

Eso minimiza demasiado el problema.

Porque el tamaño del script no es el punto central.
Lo importante es que, al estar inline:

- queda mezclado con el documento
- hace más laxa la política de ejecución
- complica distinguir mejor entre contenido y código
- aumenta la dependencia de excepciones en CSP
- vuelve más difícil endurecer la superficie con el tiempo

### Idea importante

Un inline “chiquito” puede costar poco en funcionalidad hoy, pero bastante en disciplina de seguridad mañana.

---

## Qué significa “inline” en este contexto

Cuando hablamos de scripts inline, estamos hablando en general de código JavaScript que no vive solamente en un archivo separado y servido como recurso explícito, sino incrustado directamente en la respuesta HTML.

Eso incluye cosas como:

- bloques `<script>` dentro de la página
- atributos de eventos tipo `onclick`, `onload`, `onsubmit`
- generación dinámica de código dentro del HTML
- pequeñas rutinas embebidas en templates
- vistas que mezclan render y ejecución de forma poco separada

### Idea útil

No todo inline tiene el mismo peso técnico exacto.
Pero desde el punto de vista de CSP, todos comparten una misma incomodidad:
**hacen más difícil cerrar la ejecución a fuentes más controladas.**

---

## Por qué a CSP no le gusta demasiado el inline

La intuición de CSP es:

- hacer explícito qué código está permitido
- reducir ejecución inesperada
- limitar desde dónde puede venir contenido activo

Los scripts inline tensan esa lógica porque el código ya no viene desde un recurso claramente delimitado, sino “pegado” al documento.

### Entonces aparecen preguntas incómodas como

- ¿cómo distinguís el inline legítimo del que no?
- ¿cuánto código embebido estás aceptando sin una política clara?
- ¿qué pasa si una parte del HTML se vuelve manipulable?
- ¿cómo evitás que una excepción amplia permita demasiado?

### Idea importante

Cuanto más dependés del inline, más difícil es que la política de ejecución sea limpia, explícita y fuerte.

---

## El problema no es solo estético o arquitectónico

A veces se habla contra el inline como si fuera solo una cuestión de “código prolijo”.

No es solo eso.

Desde seguridad importa porque:

- mezcla datos y ejecución
- reduce claridad sobre qué puede correr
- hace más costoso endurecer CSP
- aumenta el valor ofensivo de ciertas inyecciones del lado del cliente
- empuja a permitir comportamientos más amplios de lo deseable

### Idea importante

No se trata solo de elegancia de frontend.
Se trata de superficie ejecutable.

---

## Scripts inline y XSS: por qué se relacionan tanto

Este es uno de los vínculos más importantes del tema.

Si una aplicación tiene alguna forma de inyección del lado del cliente, cuanto más permisiva sea la política sobre ejecución inline, más margen puede tener ese problema para transformarse en ejecución real en el navegador.

### Regla sana

CSP no reemplaza arreglar XSS.
Pero una app que depende mucho de scripts inline suele estar peor posicionada para usar CSP como capa de contención razonable.

### Idea útil

No es que “inline = XSS automático”.
Es que **inline + política laxa** suele dejar menos barreras cuando algo del HTML se contamina.

---

## Handlers inline: una fuente muy subestimada

Muchos equipos piensan en “scripts inline” solo como bloques `<script>...</script>`.
Pero los atributos inline de eventos también importan mucho.

### Ejemplos conceptuales

- `onclick`
- `onchange`
- `onsubmit`
- `onload`
- y otros atributos similares

### ¿Por qué importan?

Porque también representan lógica embebida en el markup y refuerzan un patrón donde la ejecución queda demasiado pegada al HTML.

### Idea importante

Cuando estos atributos están muy dispersos por la app, la migración hacia una política más estricta suele doler bastante más.

---

## Inline como deuda acumulativa

Este es un punto muy realista.

Muchas apps no nacen con un gran caos inline.
Empiezan con:

- un pequeño script para una vista
- un handler para una interacción rápida
- un ajuste “temporal”
- una solución de plantilla
- una integración copiada

Y así, de a poco, el HTML se vuelve cada vez más ejecutable.

### Resultado

Cuando querés endurecer CSP, descubrís que la app depende de muchas pequeñas piezas inline repartidas por todos lados.

### Idea importante

El inline rara vez explota por una sola gran decisión.
Suele acumularse por comodidad incremental.

---

## “Funciona” no significa que esté bien preparado para endurecerse

Este patrón aparece mucho.

La página:

- renderiza bien
- responde rápido
- cumple el flujo
- nadie ve un bug obvio

Entonces parece que no hay problema.

Pero si para funcionar necesita:

- mucho script inline
- handlers por todos lados
- plantillas con lógica embebida
- políticas amplias de CSP

entonces el costo aparece más tarde, cuando querés endurecer.

### Regla sana

Una superficie web madura no se evalúa solo por si “anda”.
También por qué tan fácil es explicitar y restringir lo que ejecuta.

---

## Qué suele pasar cuando intentás endurecer CSP en una app con mucho inline

En la práctica, muchas veces pasa esto:

- activás una política más estricta
- se rompen partes del frontend
- el equipo descubre dependencias inline por todos lados
- entonces empieza a abrir excepciones
- y la CSP termina siendo mucho más permisiva de lo que se quería

### Idea importante

Cuando CSP “se complica”, muchas veces no es culpa de CSP.
Es la app mostrándote cuánto dependía de una ejecución más difusa de la cuenta.

---

## Inline y templates del servidor

En aplicaciones Java con Spring, esto suele verse bastante en templates servidos desde backend, donde se mezclan:

- markup
- datos
- condiciones
- y pequeños fragmentos de lógica del lado del cliente

### Problema

Cuanto más se mezcla esa capa, más difícil se vuelve distinguir:

- qué es dato
- qué es presentación
- qué es código
- qué debería ejecutarse
- qué podría terminar siendo un punto de inyección o de apertura excesiva

### Idea útil

Las vistas generadas en servidor no son “menos CSP-problemáticas” por el hecho de no ser una SPA.
También pueden acumular bastante lógica inline si no se las disciplina.

---

## Menos inline suele significar CSP más entendible

Este es un criterio práctico muy útil.

Cuando el código activo está más concentrado en recursos separados y más explícitos, suele pasar que:

- la política se entiende mejor
- la ejecución es más trazable
- hay menos excepciones
- es más fácil saber qué está permitido
- cuesta menos endurecer gradualmente

### Idea importante

No todo el beneficio está en “seguridad pura”.
También mejora la capacidad de razonar sobre la app.

---

## No siempre hace falta refactorizar todo de golpe

También conviene evitar la caricatura de que la única salida es reescribir toda la interfaz.

Muchas veces el valor está en:

- identificar las zonas con más inline
- separar primero lo más sensible
- reducir handlers dispersos
- mover lógica donde esté mejor delimitada
- bajar progresivamente la dependencia de excepciones amplias

### Regla sana

El objetivo no es pureza arquitectónica instantánea.
Es reducir la mezcla entre HTML y ejecución hasta que la política deje de necesitar tanta permisividad.

---

## Inline y terceros: mezcla todavía más delicada

Si además de código propio la página carga:

- widgets
- SDKs
- analytics
- chat
- iframes
- scripts externos

entonces la dependencia de inline empeora el cuadro.
Porque la CSP tiene que acomodar:

- código propio disperso
- dependencias externas
- excepciones adicionales

### Idea importante

Una política ya compleja por terceros se vuelve aún más difícil de fortalecer si además el HTML local trae mucha lógica embebida.

---

## No es solo un problema de JavaScript “grande”

A veces el equipo piensa:

- “esto no es un frontend complejo”
- “solo tenemos un par de comportamientos”
- “no hay tanta lógica”

Y, aun así, puede haber suficiente inline como para volver incómoda una CSP sana.

### Idea útil

No importa solo cuánto JavaScript hay.
Importa **cómo** está distribuido y qué parte depende de ejecución embebida directamente en el documento.

---

## Cómo pensar el beneficio de quitar inline

Una forma sana de mirarlo es esta:

cada trozo de inline que lográs eliminar o reducir puede ayudarte a:

- hacer la política más estricta
- entender mejor qué código corre
- separar mejor responsabilidades
- bajar superficie si algo del HTML se contamina
- reducir dependencias de excepciones poco claras

### Regla práctica

No pienses “quitar inline” solo como refactor de frontend.
Pensalo también como **preparar mejor el terreno para una política de ejecución más fuerte**.

---

## No conviene abrir la política sin entender por qué

Cuando algo se rompe al activar CSP, el camino fácil suele ser:

- abrir la política
- permitir más inline
- agregar excepciones
- seguir

Eso puede ser necesario como transición en algunos casos.
Pero si se vuelve costumbre, la política pierde mucha fuerza.

### Idea importante

Cada apertura para sostener inline debería sentirse como deuda explícita, no como estado cómodo permanente.

---

## Qué conviene revisar en una app Spring

Cuando revises CSP y scripts inline en una aplicación Spring, mirá especialmente:

- bloques `<script>` embebidos en HTML
- atributos `on...` inline en templates
- vistas con lógica mezclada en el markup
- pantallas más sensibles con ejecución incrustada
- dependencias de scripts inline para login, admin o acciones críticas
- cuánta parte del frontend se rompería si la política se volviera más estricta
- qué excepciones existen hoy solo por inline
- si el equipo entiende dónde está la deuda real
- qué partes podrían separarse primero con menor costo

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- menos JavaScript embebido directamente en el HTML
- menos handlers inline dispersos
- lógica del lado del cliente más concentrada y delimitada
- menor dependencia de aperturas amplias en CSP
- más facilidad para entender qué se ejecuta y por qué
- mejor capacidad de endurecer la política sin romper todo

---

## Señales de ruido

Estas señales merecen revisión rápida:

- muchos bloques `<script>` en templates
- handlers inline repartidos por la UI
- el equipo no sabe cuánta lógica depende de inline
- CSP demasiado laxa solo para que la app siga andando
- cada endurecimiento “se arregla” agregando excepciones
- pantallas sensibles con mucha ejecución pegada al markup
- mezcla difícil de separar entre datos, vista y comportamiento

---

## Checklist práctico

Cuando revises CSP y scripts inline, preguntate:

- ¿cuánto JavaScript embebido tiene la app hoy?
- ¿qué parte vive en bloques `<script>` y qué parte en handlers inline?
- ¿qué vistas más sensibles dependen de eso?
- ¿qué se rompería si quisiera una política más estricta?
- ¿qué apertura actual existe solo por sostener inline?
- ¿qué fragmento inline aporta poco y cuesta mucho en seguridad?
- ¿qué parte podría separarse primero con menos esfuerzo?
- ¿qué deuda está escondida detrás de “así funciona hace tiempo”?
- ¿estoy usando CSP para endurecer de verdad o solo para acompañar una superficie ya demasiado permisiva?
- ¿qué cambio haría primero para reducir mezcla entre HTML y ejecución?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Qué vistas tienen más scripts inline?
2. ¿Qué handlers `on...` siguen en el HTML?
3. ¿Qué pantalla crítica depende más de esa mezcla?
4. ¿Qué parte del inline es puro legado?
5. ¿Qué excepción de CSP existe solo para sostener esa deuda?
6. ¿Qué fragmento podrías sacar primero del documento sin gran costo funcional?
7. ¿Qué ganarías en claridad y hardening si lo hicieras?

---

## Resumen

CSP y scripts inline están muy relacionados porque una política de ejecución más fuerte choca enseguida con la costumbre de mezclar JavaScript directamente dentro del HTML.

Los scripts inline no son solo un problema de estilo.
También dificultan:

- endurecer qué puede ejecutarse
- delimitar el origen del código
- reducir impacto de ciertas inyecciones
- mantener una CSP clara y relativamente estricta

En resumen:

> un backend más maduro no se conforma con que la vista “ande” aunque lleve mucha lógica pegada al HTML.  
> También intenta reducir scripts inline y handlers embebidos porque entiende que cada trozo de ejecución mezclado con el documento hace más difícil decirle al navegador, con una política clara, qué código es realmente legítimo y qué no debería correr ahí.

---

## Próximo tema

**CSP como defensa adicional frente a XSS**
