---
title: "DoS por expansión y bomb payloads: intuición sin folklore"
description: "Cómo entender ataques de denegación de servicio por expansión y bomb payloads en XML dentro de aplicaciones Java con Spring Boot. Una explicación conceptual para razonar consumo excesivo de recursos sin depender de folklore ni de nombres famosos."
order: 176
module: "XML, parsers y procesamiento inseguro de documentos"
level: "base"
draft: false
---

# DoS por expansión y bomb payloads: intuición sin folklore

## Objetivo del tema

Entender cómo aparece el **DoS por expansión** en XML y por qué conviene pensar los llamados **bomb payloads** desde una intuición técnica clara, sin depender demasiado de nombres famosos o de ejemplos repetidos fuera de contexto.

La idea de este tema es continuar directamente lo que vimos en el tema anterior.

Ya diferenciamos:

- entidades externas
- expansión interna
- lectura local
- SSRF
- y complejidad innecesaria del parser

Ahora toca profundizar una de las consecuencias más importantes de esa complejidad interna:

- **denegación de servicio por expansión**
- **consumo excesivo de recursos**
- **trabajo desproporcionado del parser frente a un input relativamente pequeño**

En muchos lugares esto se explica con nombres muy conocidos, demostraciones vistosas o payloads “clásicos”.
Eso puede servir para recordar el tema.
Pero también trae un problema:

- a veces el equipo memoriza el nombre
- pero no entiende bien el mecanismo
- y entonces termina creyendo que el riesgo solo existe si aparece exactamente ese ejemplo famoso

En resumen:

> el punto importante no es recordar el nombre de un bomb payload,  
> sino entender que un parser XML puede terminar haciendo muchísimo más trabajo del que el tamaño aparente del documento sugería, si se le deja expandir y procesar estructuras internas demasiado potentes sobre input no confiable.

---

## Idea clave

La idea central del tema es esta:

> en XML, un documento pequeño puede obligar al parser a producir, expandir o procesar una cantidad de trabajo muy superior a su tamaño original si ciertas capacidades de expansión siguen activas.

Eso vuelve al problema especialmente traicionero porque rompe una intuición muy común del equipo:

- “si el archivo no pesa mucho, no debería costar tanto procesarlo”

Con XML eso no siempre es cierto.

Porque el costo real puede depender no solo de:

- cuántos bytes entraron
- cuántos nodos visibles parece haber

sino también de:

- cuánto trabajo de expansión hace el parser
- cuántas sustituciones encadena
- cuánta memoria necesita para representar el resultado
- cuánta CPU consume mientras produce esa representación

### Idea importante

El riesgo no está solo en “qué contiene” el documento.
Está también en **cuánto obliga a trabajar al parser**.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- pensar que XML DoS solo existe en payloads famosos de laboratorio
- creer que bloquear entidades externas elimina todo riesgo de disponibilidad
- suponer que el tamaño del archivo basta para estimar su costo real
- tratar expansión interna como un detalle menor
- no modelar el parser como posible consumidor desproporcionado de recursos
- reducir el análisis a folklore sin entender la raíz del comportamiento

Es decir:

> el problema no es solo que exista un payload famoso.  
> El problema es permitir que un documento no confiable provoque un volumen de expansión o de trabajo interno muy superior al valor de negocio que el flujo necesitaba.

---

## Error mental clásico

Un error muy común es este:

### “Mientras el archivo sea chico, el impacto de DoS no debería ser tan serio”

Eso es una mala intuición para XML.

Porque el tamaño de entrada no siempre se parece al tamaño o al costo del procesamiento resultante.

### Puede haber casos donde
- el documento recibido sea relativamente pequeño
- pero el parser deba expandir mucho
- duplicar mucho
- encadenar referencias
- construir estructuras grandes
- y consumir CPU o memoria de forma muy superior a lo esperado

### Idea importante

En este tema, “input pequeño” no garantiza “trabajo pequeño”.

---

# Parte 1: Qué significa expansión, visto desde disponibilidad

## La intuición simple

Ya vimos que una entidad o una referencia puede hacer que el parser sustituya una cosa por otra.

Desde el punto de vista de disponibilidad, lo que importa es esto:

> si el parser sigue expandiendo contenido una y otra vez, el costo total del procesamiento puede crecer muchísimo.

Eso puede pegar en:

- memoria
- CPU
- tiempo de parseo
- tamaño de estructuras intermedias
- presión sobre workers
- latencia de requests
- colas de background
- throughput del sistema

### Idea útil

No hace falta que el parser salga a la red para hacer daño.
Alcanza con que se quede “trabajando adentro” demasiado tiempo o con demasiado volumen.

---

# Parte 2: Por qué los bomb payloads llaman tanto la atención

Llaman la atención porque muestran de forma muy visual algo que a veces cuesta ver en diseño:

- un documento relativamente chico
- dispara una expansión enorme
- y el sistema termina gastando mucho más de lo que parecía razonable

### Idea importante

El valor pedagógico de esos payloads está en mostrar un principio:
- **el parser puede amplificar brutalmente el costo del input**

### Regla sana

No te quedes con el nombre del payload.
Quedate con la idea de amplificación de trabajo interno.

---

# Parte 3: Por qué conviene pensar esto sin folklore

El folklore trae dos problemas.

## Problema A
Hace que el equipo piense:
- “si no vi exactamente esa forma clásica, entonces quizá no aplica”

## Problema B
Hace que la mitigación se piense como:
- “bloquear ese caso famoso”
en vez de:
- “reducir la capacidad general de expansión innecesaria”

### Idea útil

Como en SSRF, la defensa madura no persigue una demo puntual.
Recorta la clase de comportamiento que la vuelve posible.

### Regla sana

Con XML DoS, la pregunta buena no es:
- “¿ya bloqueamos el payload famoso?”
sino:
- “¿qué capacidad de expansión innecesaria sigue viva en este parser?”

---

# Parte 4: Cómo se produce el daño, a nivel intuitivo

Sin meternos en payloads específicos, la lógica suele ser algo así:

1. el documento define o usa mecanismos de expansión
2. el parser los acepta
3. esa expansión se encadena o se multiplica
4. el trabajo interno crece mucho
5. el proceso empieza a consumir recursos de forma desproporcionada

### Ese crecimiento puede impactar en:
- tiempo de respuesta
- memoria del proceso
- estabilidad del worker
- saturación de CPU
- colas o jobs atrasados
- otras requests del mismo servicio

### Idea importante

El daño no llega porque el documento “trae mucha data”.
Llega porque el parser genera mucha más de la que parecía haber, o hace mucho más trabajo para materializarla.

---

# Parte 5: Por qué esto no es solo un problema de memoria

Mucha gente piensa primero en:
- “se llena la RAM”

Eso puede pasar.
Pero no es la única dimensión.

También puede haber:

- CPU alta por expansión
- tiempos de parseo exagerados
- presión en GC
- timeouts aguas arriba
- workers ocupados demasiado tiempo
- servicios encadenados que esperan el resultado
- efecto cascada sobre colas o pipelines

### Idea útil

El DoS por expansión es un problema de **presupuesto total de procesamiento**, no solo de un recurso aislado.

### Regla sana

Cuando modeles impacto, pensá en:
- memoria
- CPU
- tiempo
- y capacidad operativa del sistema.

---

# Parte 6: Por qué Java y Spring pueden sentirlo fuerte

En el ecosistema Java esto importa especialmente porque no es raro que XML se procese en contextos como:

- workers documentales
- autenticación
- integraciones enterprise
- librerías de firma
- conversión de documentos
- importaciones batch
- servicios internos con bastante memoria y CPU asignadas

### Problema

Es fácil que el equipo piense:
- “este worker es robusto”
- “este servicio tiene recursos”
- “esto corre en background”

Y entonces subestime cuánto daño operativo puede hacer un parseo descontrolado si se repite o si compite con otros trabajos.

### Idea importante

Que el servicio tenga recursos no vuelve aceptable que un documento pequeño fuerce muchísimo trabajo innecesario.

---

# Parte 7: El tamaño del upload no basta como defensa

Esto merece sección propia porque es una trampa muy común.

Un equipo puede decir:
- “limitamos archivos a X MB”
- y creer que con eso ya contuvo bien el riesgo documental

Eso ayuda para muchos problemas.
Pero no resuelve por sí solo el DoS por expansión.

### ¿Por qué?

Porque el costo puede crecer dentro del parser después de recibido el archivo.

### Idea útil

Un archivo pequeño puede seguir siendo caro si obliga al sistema a expandirlo de forma muy costosa.

### Regla sana

Límites de tamaño son útiles.
No sustituyen limitar las capacidades XML que vuelven posible la amplificación interna.

---

# Parte 8: DoS por expansión y DTD: por qué siguen tan conectados

Esto conecta muy bien con el tema 174.

Una de las razones por las que `disallow-doctype-decl` suele ser tan valioso es que muchas superficies de expansión problemática viven justamente en la parte del formato que se introduce o habilita alrededor de DTD y definiciones similares.

### Idea importante

Cuando el caso de uso no necesita esa complejidad, dejarla viva es regalar una palanca de amplificación al documento.

### Regla sana

Bloquear `DOCTYPE` cuando no hace falta no solo ayuda con lectura local o SSRF.
También corta una parte muy importante del espacio donde nacen ciertos DoS por expansión.

---

# Parte 9: Entidades externas apagadas no siempre alcanzan

Esto conecta directo con el tema 175.

Un equipo puede haber hecho algo muy razonable:
- bloquear entidades externas

Y aun así seguir expuesto a ciertas formas de consumo peligroso si:

- DTD sigue activa
- expansión interna sigue activa
- el parser sigue aceptando demasiada complejidad
- el flujo no limita bien el trabajo que el documento puede forzar

### Idea útil

Cortar “lo externo” es una mejora grande.
No equivale automáticamente a cortar “lo costoso”.

### Regla sana

Después de mitigar XXE clásica, todavía conviene revisar si el parser sigue pudiendo amplificar demasiado trabajo interno.

---

# Parte 10: Qué señales operativas puede dejar este problema

Desde el lado de observabilidad o síntomas, un DoS por expansión puede aparecer como:

- parseos lentos
- uso alto de memoria
- uso alto de CPU
- workers que se cuelgan o tardan muchísimo
- requests que expiran
- timeouts en componentes vecinos
- caídas por presión de recursos
- colas que se atrasan
- comportamiento errático en servicios documentales

### Idea importante

A veces el equipo investiga esto como “performance rara” o “worker que se quedó consumiendo”, sin conectar enseguida que la raíz puede estar en XML y en expansión innecesaria.

### Regla sana

Si un flujo XML genera degradación desproporcionada, conviene mirar también la complejidad del parser, no solo el tamaño del archivo o la infraestructura.

---

# Parte 11: Por qué los workers de background no te salvan solos

Otro error común es pensar:
- “esto corre fuera del request principal, así que no es tan grave”

Eso puede contener algo de impacto sobre UX inmediata.
Pero el problema sigue siendo serio si:

- bloquea workers
- atrasa colas
- aumenta costos
- compite con otros jobs
- degrada throughput
- satura recursos compartidos
- afecta procesos críticos del backend

### Idea útil

Mover el parseo a background cambia el lugar donde duele.
No elimina el dolor.

### Regla sana

El procesamiento async también necesita presupuestos y parsers más modestos.

---

# Parte 12: Qué preguntas conviene hacer sobre este riesgo

Cuando audites un flujo XML desde la dimensión de DoS, conviene preguntar:

- ¿el parser puede expandir estructuras que el flujo no necesita?
- ¿DTD sigue activa?
- ¿hay límites claros de procesamiento?
- ¿qué tan costoso puede volverse el parseo respecto del tamaño del input?
- ¿qué worker o proceso lo ejecuta?
- ¿qué otros trabajos comparten esos recursos?
- ¿el equipo modeló disponibilidad o solo confidencialidad/SSRF?
- ¿qué mitigación actual reduce realmente la amplificación interna?

### Idea importante

El análisis maduro de XML no termina en “¿puede leer archivos o salir a la red?”.
También incluye:
- “¿puede hacer trabajar demasiado al sistema?”

---

# Parte 13: Qué clase de mitigaciones suelen ayudar más

Todavía no estamos en una guía completa de fixes, pero ya conviene entender qué cosas suelen mover más la aguja:

- bloquear `DOCTYPE` cuando no hace falta
- desactivar capacidades XML innecesarias
- reducir expansión y complejidad aceptada
- usar configuraciones explícitas y no defaults heredados
- acotar el runtime que procesa XML
- imponer límites razonables de recursos y budgets de procesamiento
- revisar librerías documentales y parsers de terceros
- no tratar preview o metadata como operaciones “gratis”

### Regla sana

La mejor defensa contra bomb payloads no es memorizar uno famoso.
Es achicar la cantidad de trabajo que el parser está autorizado a hacer para ese flujo.

---

# Parte 14: Por qué este tema sigue siendo muy actual

Aunque algunos ejemplos clásicos vengan de hace años, la lógica sigue vigente porque los sistemas todavía:

- procesan XML
- aceptan documentos complejos
- usan librerías heredadas
- tienen workers documentales
- y a veces siguen confiando en defaults o hardening parcial

### Idea útil

La antigüedad del ejemplo no hace viejo al principio técnico.
Mientras haya parseo XML con demasiada capacidad, sigue habiendo margen para este tipo de DoS.

### Regla sana

No subestimes un riesgo solo porque su demo más famosa tenga nombre de otra década.

---

## Qué revisar en una app Spring

Cuando revises DoS por expansión en una aplicación Spring o Java, mirá especialmente:

- qué flujos aceptan XML o formatos derivados
- si `DOCTYPE` sigue habilitada
- si el parser acepta más complejidad de la necesaria
- qué workers procesan esos documentos
- qué budgets o límites operativos existen
- qué dependencia documental o XML se usa
- si la conversación interna del equipo sobre XXE omite disponibilidad
- qué impacto tendría que un documento pequeño forzara trabajo enorme

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- parsers con menos capacidad sobrante
- `DOCTYPE` fuera cuando no hace falta
- menor expansión aceptada
- workers documentales más acotados
- límites de recursos y tiempos razonables
- revisión explícita de disponibilidad además de SSRF o lectura local
- menos confianza en que “como el archivo es chico, todo está bien”

### Idea importante

La madurez aquí se nota cuando el equipo mide también cuánto trabajo deja forzar al parser, no solo qué recursos externos podría tocar.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- el equipo solo piensa XXE como exfiltración
- nadie modeló DoS por expansión
- el tamaño del upload se usa como defensa principal
- DTD sigue viva por costumbre
- workers con mucha carga documental no tienen límites claros
- el parser sigue aceptando más complejidad de la necesaria
- se habla de bomb payloads como folklore, no como propiedad del parseo

### Regla sana

Si el sistema todavía permite que un documento pequeño provoque trabajo enorme, sigue habiendo superficie que recortar aunque la resolución externa ya esté bloqueada.

---

## Checklist práctica

Cuando pienses en DoS por expansión, preguntate:

- ¿qué capacidad XML permite amplificación interna?
- ¿`DOCTYPE` sigue habilitada?
- ¿el flujo necesita esa complejidad?
- ¿qué tan caro puede volverse el parseo?
- ¿qué proceso lo ejecuta?
- ¿qué otros trabajos o usuarios dependen de ese proceso?
- ¿qué límites de recursos existen?
- ¿qué mitigación recortaría mejor el trabajo interno innecesario?

---

## Mini ejercicio de reflexión

Tomá un flujo XML o documental de tu app Spring y respondé:

1. ¿Qué parser o librería usa?
2. ¿DTD sigue activa?
3. ¿Qué parte del procesamiento podría amplificarse internamente?
4. ¿Qué recurso te preocupa más: memoria, CPU o tiempo?
5. ¿Qué worker o servicio absorbería ese costo?
6. ¿Qué mitigación actual solo corta lo externo pero no la complejidad interna?
7. ¿Qué cambio harías primero para achicar el trabajo que el parser puede forzar?

---

## Resumen

El DoS por expansión y los bomb payloads conviene entenderlos como un problema de **amplificación de trabajo interno** del parser.

La idea central no es memorizar nombres famosos, sino recordar que:

- un input pequeño puede forzar trabajo enorme
- bloquear entidades externas no siempre corta esta dimensión
- `DOCTYPE` y la complejidad sobrante del formato suelen ser piezas importantes del problema
- el impacto real depende de memoria, CPU, tiempo y del runtime donde corre el parseo

En resumen:

> un backend más maduro no trata los bomb payloads como folklore simpático de seguridad XML ni como una colección de demos viejas que solo importan en entornos raros, sino como una advertencia muy vigente sobre una propiedad profunda del parseo: que un documento pequeño puede obligar al sistema a hacer mucho más trabajo del que parecía razonable si el parser conserva capacidades de expansión que el caso de uso nunca necesitó.  
> Y justamente por eso este tema importa tanto: porque enseña a mirar disponibilidad con la misma seriedad con la que ya mirábamos lectura local o SSRF, y a entender que endurecer XML no consiste solo en impedir que el parser salga hacia afuera, sino también en impedir que el documento lo haga explotar desde adentro a fuerza de complejidad innecesaria.

---

## Próximo tema

**`setExpandEntityReferences(false)`: cuándo suma y cuándo no alcanza**
