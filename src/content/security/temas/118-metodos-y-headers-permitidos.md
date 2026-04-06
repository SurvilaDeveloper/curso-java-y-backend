---
title: "Métodos y headers permitidos"
description: "Cómo pensar los métodos y headers permitidos en CORS dentro de una aplicación Java con Spring Boot. Por qué no conviene abrirlos de forma genérica, qué confianza expresa cada permiso cross-origin y cómo evitar que una configuración amplia termine habilitando más interacción de la necesaria entre frontend y backend."
order: 118
module: "HTTP, headers y superficie del navegador"
level: "base"
draft: false
---

# Métodos y headers permitidos

## Objetivo del tema

Entender cómo pensar los **métodos y headers permitidos en CORS** dentro de una aplicación Java + Spring Boot.

La idea de este tema es tomar algo que en la práctica se vuelve muy mecánico y devolverle sentido.

Cuando una integración cross-origin falla, muchas veces la reacción del equipo es:

- agreguemos más métodos
- permitamos más headers
- abramos todo lo que pide el navegador
- “después vemos”

Eso suele resolver el síntoma técnico.
Pero también puede dejar una política bastante más abierta de lo que el caso de uso realmente necesitaba.

En resumen:

> cada método y cada header que permitís en CORS no es solo una línea más de configuración.  
> Es una parte de la conversación cross-origin que el navegador va a aceptar entre un frontend y tu backend.

Y por eso conviene pensarlos con más criterio.

---

## Idea clave

Cuando el navegador hace una operación cross-origin más compleja, puede preguntar cosas como:

- ¿este método está permitido?
- ¿estos headers están permitidos?
- ¿puedo seguir adelante con esta request en nombre de esta página de otro origen?

La respuesta del backend define qué tipo de interacción cross-origin está dispuesto a dejar que el navegador habilite.

La idea central es esta:

> permitir más métodos y más headers amplía la forma en que un frontend de otro origen puede conversar con tu backend.

Eso no es automáticamente malo.
Pero sí debería ser deliberado.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- permitir `GET, POST, PUT, PATCH, DELETE, OPTIONS` por reflejo
- aceptar headers arbitrarios sin revisar si realmente se usan
- abrir toda la lista “hasta que deje de fallar”
- no distinguir entre métodos seguros, métodos de modificación y métodos más sensibles
- tratar los headers permitidos como detalle técnico irrelevante
- no entender qué expresa cada permiso cross-origin en términos de confianza
- dejar configuraciones heredadas y amplias que nadie vuelve a revisar
- copiar listas completas de métodos y headers entre entornos o servicios muy distintos

Es decir:

> el problema no es permitir métodos o headers.  
> El problema es hacerlo sin conectar esa decisión con el tipo de frontend, la sensibilidad del recurso y el modelo real de confianza.

---

## Error mental clásico

Un error muy común es este:

### “Si el navegador lo pide, lo permitimos y listo”

Eso es una mala base.

Porque el navegador no está evaluando tu modelo de riesgo.
Solo está diciendo:

- “para esta operación cross-origin necesito que me confirmes estos métodos o estos headers”

Si respondés que sí a todo por costumbre, terminás con una política que ya no expresa una decisión consciente.
Solo expresa cansancio de debugging.

### Idea importante

El hecho de que algo sea técnicamente necesario para una integración no significa que debas abrirlo más allá de lo estrictamente requerido.

---

## Métodos permitidos: no todos pesan igual

Desde CORS, un método permitido define parte del tipo de interacción que el navegador podrá intentar en un escenario cross-origin.

No es lo mismo permitir:

- una lectura acotada
- que operaciones de creación
- o actualización
- o borrado
- o acciones con efectos más delicados

### Idea útil

Aunque CORS no sea autorización de negocio, la lista de métodos permitidos sigue diciendo bastante sobre cuánta interacción cross-origin estás aceptando.

Por eso no conviene tratar todos los métodos como si fueran equivalentes.

---

## “Permitir todos los métodos” suele ser pereza, no diseño

Muchas configuraciones quedan amplias con algo cercano a:

- “aceptemos todos los métodos comunes”
- “así no nos vuelve a molestar”

Eso puede ser práctico a corto plazo.
Pero suele romper dos cosas:

### 1. Claridad
Ya no sabés qué estaba realmente justificado.

### 2. Precisión
La política deja de expresar el caso de uso real.

### Regla sana

Si un frontend solo necesita unos pocos métodos, la política debería reflejarlo.
No una lista genérica heredada.

---

## Headers permitidos: por qué importan más de lo que parece

Con los headers suele pasar algo parecido, pero más subestimado todavía.

Muchos equipos piensan:

- “es solo metadata”
- “son headers del request”
- “¿qué tanto cambia?”

Pero permitir headers cross-origin también es permitir formas más ricas de interacción entre el frontend y el backend.

### Porque esos headers pueden estar relacionados con

- autenticación
- contenido
- control del request
- trazabilidad
- contexto de negocio
- APIs personalizadas
- comportamiento del servidor

### Idea importante

No todos los headers son igual de inocentes.
Y no todos deberían quedar abiertos “por las dudas”.

---

## El navegador pregunta por headers porque quiere usarlos

Esta obviedad ayuda mucho.

Si el navegador está preguntando por determinados headers en preflight, eso significa que la página quiere mandar esa información en la request real.

Entonces conviene preguntarte:

- ¿ese header es realmente necesario?
- ¿ese frontend debería enviarlo?
- ¿qué implica que pueda usarlo?
- ¿qué otros orígenes permitidos podrían aprovecharlo también?

### Regla sana

No respondas a la preflight solo con lógica de compatibilidad.
Respondé también con lógica de mínima apertura.

---

## Métodos y headers dibujan una capacidad cross-origin

Una forma muy buena de pensar este tema es así:

el origin permitido no define solo “quién puede leer”.
También, junto con los métodos y headers permitidos, define **cómo** puede interactuar.

### Ejemplo conceptual

No es lo mismo permitir que un frontend cross-origin:

- haga un `GET` sencillo

que permitir que:

- haga un `PATCH`
- con headers personalizados
- con cookies
- y lea la respuesta autenticada

### Idea importante

La política completa de CORS es una especie de mini contrato de capacidad cross-origin.
Y métodos + headers son una parte central de ese contrato.

---

## Headers amplios + credentials = conversación más sensible

Esto conecta directamente con los temas anteriores.

Cuando además de métodos y headers tenés:

- cookies
- sesión
- credentials
- respuestas privadas

la lista de headers permitidos deja de ser todavía más un detalle.

### Porque ahora puede influir en
- cómo se identifica la request
- qué contexto adicional manda el frontend
- qué tan rica es la interacción autenticada

### Idea útil

Cuanto más sensible es la API y más estado del usuario viaja, más precisión deberías tener con los headers permitidos.

---

## No conviene abrir headers personalizados sin preguntarse por qué existen

En muchos proyectos aparecen headers como:

- cabeceras internas del frontend
- metadata de tracing
- marcas de cliente
- flags de entorno
- headers heredados
- nombres personalizados del negocio
- cosas que nadie recuerda bien por qué están

### Problema

Con el tiempo, la lista crece y nadie puede responder:

- cuál sigue siendo necesario
- cuál es legado
- cuál expone más superficie
- cuál solo está por arrastre histórico

### Regla sana

Cada header permitido debería poder explicarse en una oración simple.
Si no, probablemente conviene revisarlo.

---

## “Abramos Authorization y Content-Type” no debería ser reflejo ciego

Estos dos aparecen muchísimo en configuraciones CORS.

A veces tiene sentido.
A veces se ponen por plantilla y nadie vuelve a pensar.

### Conviene preguntarse

- ¿este frontend necesita realmente mandar ese header?
- ¿qué tipo de autenticación usa?
- ¿qué endpoints lo usan?
- ¿qué pasa en entornos distintos?
- ¿qué combinación de métodos + headers está quedando habilitada?

### Idea importante

No porque un header sea común significa que siempre deba habilitarse sin revisar contexto.

---

## Métodos permitidos no son una lista del controlador

Otra confusión útil de desmontar:

el hecho de que un endpoint backend soporte ciertos métodos no significa que todos deban quedar habilitados cross-origin desde navegador.

### Porque una cosa es
- que el backend exista y los soporte

y otra
- que quieras permitir esa interacción desde un frontend de otro origen

### Idea útil

CORS es una política sobre la relación browser-origin-backend.
No una mera repetición automática de las capacidades HTTP del endpoint.

---

## Headers permitidos no deberían convertirse en “acepto cualquier cosa”

Igual que con los métodos, a veces la política se termina pareciendo a:

- “mandá lo que quieras mientras venga del origin permitido”

Eso es cómodo.
Pero deja demasiada holgura.

### Regla sana

Mejor una lista más chica y consciente que un permiso amplio que nadie revisa.

No porque el header permitido en sí sea siempre explosivo, sino porque una política laxa suele volverse más difícil de auditar y más fácil de heredar sin sentido.

---

## Más precisión también ayuda a debuggear mejor

Este es un beneficio práctico que a veces se pasa por alto.

Cuando la política es más precisa:

- entendés mejor qué contrato espera el frontend
- detectás más fácil cuándo aparece un header nuevo e inesperado
- podés distinguir mejor entre necesidad real y deuda acumulada
- es más claro qué cambió cuando algo deja de funcionar

### Idea importante

Una política minimalista no solo es más segura.
También suele ser más comprensible operativamente.

---

## Entornos y métodos/headers heredados

En muchos sistemas, la configuración CORS de métodos y headers se copia entre:

- local
- staging
- QA
- producción

### Resultado típico

terminás con listas que incluyen de todo porque en algún entorno, alguna vez, algo lo necesitó.

### Problema

Eso deja una política más amplia de la necesaria en lugares donde el riesgo es mayor.

### Regla sana

Igual que con origins, métodos y headers también merecen limpieza por entorno y por caso real de uso.

---

## No toda amplitud es mala, pero debería ser consciente

Tampoco conviene caricaturizar.
Habrá casos donde permitir varios métodos o ciertos headers sea totalmente legítimo.

La pregunta no es “cuánto podés prohibir por deporte”.
La pregunta es:

- ¿esto es necesario?
- ¿para qué frontend?
- ¿en qué entorno?
- ¿con qué credenciales?
- ¿para qué endpoints?
- ¿qué riesgo agrega?

### Idea útil

La buena política no es la más chica posible a ciegas.
Es la más precisa y justificable.

---

## Qué señales indican que tu lista está sobredimensionada

Hay síntomas bastante claros.

### Ejemplos

- nadie sabe por qué están permitidos ciertos headers
- la lista de métodos es siempre la misma en todas las apps
- cada error de integración se resuelve sumando algo más
- aparecen headers personalizados viejos o heredados
- staging y prod comparten exactamente la misma apertura por costumbre
- el equipo no distingue qué es requisito real y qué es arrastre histórico

### Idea importante

Una lista inflada rara vez nace de un diseño sofisticado.
Suele nacer de excepciones acumuladas.

---

## Lo que deberías preguntarte por cada método permitido

Una forma práctica de revisar métodos es preguntar:

- ¿qué frontend necesita este método?
- ¿para qué endpoint o flujo?
- ¿qué operación habilita en el navegador?
- ¿es lectura, creación, actualización o borrado?
- ¿hay credenciales o cookies en juego?
- ¿está permitido por necesidad real o por plantilla?

### Idea útil

Si no podés contestar eso, el permiso probablemente merece revisión.

---

## Lo que deberías preguntarte por cada header permitido

Y para cada header:

- ¿quién lo manda?
- ¿por qué lo manda?
- ¿qué cambia en el request gracias a ese header?
- ¿es estándar, sensible o legado?
- ¿qué otros origins permitidos podrían usarlo?
- ¿qué rompería realmente si lo quitáramos?
- ¿sigue siendo necesario hoy?

### Idea importante

La pregunta clave es siempre la misma:
**¿esto expresa una necesidad actual o solo un permiso histórico acumulado?**

---

## Qué conviene revisar en una app Spring

Cuando revises métodos y headers permitidos en CORS dentro de una aplicación Spring, mirá especialmente:

- qué methods están habilitados hoy
- cuáles usa realmente cada frontend
- qué headers están habilitados
- cuáles son estándar y cuáles personalizados
- qué endpoints más sensibles quedan cubiertos por esa apertura
- si hay cookies o credentials en juego
- si la lista cambió por debugging incremental
- si existen valores heredados que nadie justifica
- si local, staging y prod comparten más apertura de la necesaria
- si la política actual expresa el caso real o solo una plantilla genérica

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- pocos métodos realmente necesarios
- pocos headers realmente necesarios
- mejor justificación por permiso
- menos arrastre histórico
- más alineación entre frontend real y política CORS
- menor amplitud por costumbre
- mayor capacidad de explicar qué se está permitiendo y por qué

---

## Señales de ruido

Estas señales merecen revisión rápida:

- lista larga de methods “por si acaso”
- lista larga de headers que nadie entiende
- cada incidente de integración termina abriendo más
- mismas listas en todos los proyectos
- cookies y sesión combinadas con política amplia
- headers personalizados viejos sin dueño claro
- el equipo trata la configuración como boilerplate que no vale la pena pensar

---

## Checklist práctico

Cuando revises métodos y headers permitidos, preguntate:

- ¿qué methods necesita realmente cada frontend?
- ¿cuáles están permitidos solo por costumbre?
- ¿qué headers son realmente imprescindibles?
- ¿cuáles son legado o ruido?
- ¿qué pasa si combino esta apertura con credentials o cookies?
- ¿qué endpoint sensible queda más expuesto por esta configuración?
- ¿qué parte de la lista fue creciendo por troubleshooting?
- ¿qué permiso ya no podría defender con claridad?
- ¿qué quitaría primero para ganar precisión sin romper lo legítimo?
- ¿esta política describe el producto real o describe nuestra pereza histórica?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Qué methods están permitidos hoy en CORS?
2. ¿Cuáles usa realmente el frontend?
3. ¿Qué headers están permitidos hoy?
4. ¿Cuáles no sabés bien por qué siguen ahí?
5. ¿Qué combinación de method + header + credentials te parece más delicada?
6. ¿Qué parte de la política fue creciendo “hasta que anduvo”?
7. ¿Qué eliminarías primero para volverla más precisa?

---

## Resumen

En CORS, los methods y headers permitidos no son relleno técnico.
Definen parte de la capacidad cross-origin que el navegador va a aceptar entre un frontend y tu backend.

Cuanto más amplias son esas listas:

- más rica es la interacción permitida
- más difícil es auditar la política
- más fácil es heredar permisos innecesarios
- y más superficie dejás abierta por costumbre

En resumen:

> un backend más maduro no responde a la preflight con una lista genérica de methods y headers solo para que “deje de molestar”.  
> También usa esa configuración para expresar una confianza precisa sobre qué tipo de requests cross-origin quiere permitir realmente, sabiendo que cada método y cada header habilitado amplían un poco más la conversación que el navegador aceptará entre frontend y backend, y que esa amplitud debería existir por necesidad consciente, no por inercia acumulada.

---

## Próximo tema

**Origins dinámicos y listas blancas**
