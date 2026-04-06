---
title: "Secure processing: qué promete y qué NO promete"
description: "Cómo entender secure processing en parsers XML de Java y Spring Boot. Qué intenta limitar, qué no garantiza por sí solo y por qué no reemplaza el hardening explícito contra XXE, entidades externas y otras capacidades XML innecesarias."
order: 173
module: "XML, parsers y procesamiento inseguro de documentos"
level: "base"
draft: false
---

# Secure processing: qué promete y qué NO promete

## Objetivo del tema

Entender qué significa **secure processing** en el ecosistema XML de Java, qué intenta aportar realmente y, sobre todo, **qué no deberíamos asumir** cuando aparece en una factory, parser o librería dentro de una aplicación Java + Spring Boot.

La idea de este tema es atacar una confusión muy común.

En cuanto alguien empieza a endurecer parseo XML, suele aparecer algo como:

- una flag de secure processing
- una opción de “modo seguro”
- una recomendación de activarla
- un snippet que la enciende
- o una librería que dice trabajar en modo seguro

Y eso puede producir una sensación peligrosa:

- “si está secure processing, ya deberíamos estar bien”
- “esto ya cubre XXE”
- “no hace falta tocar mucho más”
- “si la doc lo llama secure, entonces ya quedó razonablemente cerrado”

Ese salto es demasiado optimista.

En resumen:

> secure processing puede ayudar a limitar ciertos comportamientos peligrosos del procesamiento XML,  
> pero no debería entenderse como una garantía total ni como sustituto de desactivar explícitamente capacidades que el flujo no necesita, como DTD, entidades externas o resolución externa.

---

## Idea clave

La idea central de este tema es esta:

> secure processing no significa “el parser ya no puede hacer nada peligroso”.  
> Significa, más bien, que se intenta imponer una postura más defensiva o más restringida sobre ciertas operaciones del procesamiento XML.

Eso ya es valioso.
Pero no alcanza con quedarse en el nombre.

Porque la pregunta madura sigue siendo:

- ¿qué limita exactamente?
- ¿qué parser y qué factory lo interpretan?
- ¿qué comportamiento sigue activo igual?
- ¿qué riesgos de XXE o DoS quedan todavía fuera?
- ¿qué parte del hardening sigue dependiendo de otras flags o configuraciones explícitas?

### Idea importante

El nombre **secure processing** es más tranquilizador de lo que la realidad técnica permite asumir sin revisar contexto y configuración.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- asumir que secure processing equivale a “anti-XXE total”
- encender una sola opción y dejar de revisar DTD, entidades o resolvers
- no distinguir entre mitigaciones orientadas a recursos y mitigaciones orientadas a resolución externa
- creer que una librería en modo seguro ya resolvió sola toda la superficie XML
- usar secure processing como cierre prematuro del análisis

Es decir:

> el problema no es activar secure processing.  
> El problema es convertirlo en una etiqueta mágica que oculta cuánto del parser sigue todavía demasiado abierto para input no confiable.

---

## Error mental clásico

Un error muy común es este:

### “Si activamos secure processing, XXE ya debería quedar cubierta”

Eso puede sonar razonable, pero suele ser demasiado fuerte como conclusión.

Porque secure processing puede ayudar con algunas dimensiones del problema, especialmente las relacionadas con:

- límites
- restricciones
- reducción de ciertos comportamientos del parser
- menor tolerancia a operaciones costosas o peligrosas

Pero eso no significa automáticamente que:

- DTD esté realmente fuera
- entidades externas queden bloqueadas en todos los casos
- la resolución externa desaparezca
- todas las APIs y factories queden igual de endurecidas
- una librería de terceros herede exactamente la misma postura

### Idea importante

Secure processing puede ser una pieza útil del hardening.
No debería ser tu argumento único de cierre.

---

# Parte 1: Qué intuición conviene tener sobre secure processing

## La intuición simple

La forma mental más útil para arrancar es esta:

> secure processing es una señal de que el parser o la infraestructura XML intentan operar bajo restricciones más prudentes que las puramente funcionales.

Eso puede significar cosas como:

- recortar capacidad
- imponer límites
- evitar ciertos comportamientos costosos
- endurecer algunas decisiones históricamente demasiado permisivas

### Idea útil

No lo pienses como un escudo absoluto.
Pensalo como una **postura más defensiva** del motor XML.

### Regla sana

Una postura más defensiva es buena noticia.
Una postura más defensiva no elimina la necesidad de entender qué sigue vivo y qué no.

---

# Parte 2: Por qué el nombre confunde tanto

## “Secure” suena demasiado completo

La palabra **secure** empuja a leer algo como:
- seguro
- endurecido
- protegido
- apto para input hostil

Pero en seguridad, muy pocas opciones hacen tanto por sí solas.

### Problema

El nombre puede tapar preguntas técnicas que siguen siendo imprescindibles:

- ¿qué API concreta interpreta esa opción?
- ¿qué implementaciones la respetan igual?
- ¿qué capacidades XML no dependen solo de eso?
- ¿qué parte del riesgo dominante de tu flujo sigue viva?

### Idea importante

El nombre es más fuerte que la garantía real.
Por eso conviene desconfiar un poco del alivio que produce.

---

# Parte 3: Qué clase de cosas suele intentar limitar

Sin meternos todavía en una taxonomía específica de implementación, conviene pensar que secure processing suele apuntar a cosas como:

- reducir capacidad sobrante del parser
- bajar exposición a comportamientos peligrosos
- poner límites a ciertas operaciones
- endurecer parte del procesamiento frente a input no confiable
- hacer menos probable que un documento fuerce trabajo o resolución excesiva

### Idea útil

Su espíritu suele estar más cerca de:
- “procesar con más restricciones”
que de
- “eliminar por completo toda superficie XML compleja”

### Regla sana

Pensá secure processing como una **línea defensiva general**, no como un reemplazo de controles específicos.

---

# Parte 4: Por qué no reemplaza deshabilitar DTD o entidades externas

Este es uno de los mensajes más importantes del tema.

Aun si secure processing mejora la postura del parser, sigue siendo crítico preguntarte:

- ¿DTD hace falta?
- ¿entidades externas hacen falta?
- ¿resolución externa hace falta?
- ¿expansión de entidades hace falta?

### Idea importante

Si la respuesta a esas preguntas es “no”, la postura más fuerte sigue siendo:
- desactivar explícitamente esa capacidad,
no simplemente confiar en que secure processing la vuelva suficientemente inocua.

### Regla sana

Cuando una capacidad XML sobra, conviene apagarla desde la raíz.
No asumir que un modo “seguro” ya la dejó en un estado aceptable por sí solo.

---

# Parte 5: Secure processing y DoS: donde suele entenderse mejor

Uno de los lugares donde la idea de secure processing suele tener más sentido intuitivo es en la dimensión de **recursos**.

Porque XML puede no solo intentar resolver cosas externas, sino también forzar:

- expansión excesiva
- consumo de memoria
- consumo de CPU
- procesamiento demasiado costoso

### Idea útil

Ahí sí resulta bastante natural pensar que un modo más restringido apunte a:

- limitar
- acotar
- frenar comportamientos peligrosos

### Idea importante

Eso lo vuelve valioso.
Pero incluso ahí conviene no saltar a:
- “entonces ya cubrimos todo XXE”
porque XXE no vive solo en DoS.

---

# Parte 6: XXE no es solo un problema de recursos

Esto conecta con el mapa de impactos del tema 164.

Recordemos que XXE puede traer:

- lectura local
- SSRF
- exposición del entorno
- DoS

### Problema

Secure processing puede ayudar más claramente en algunas dimensiones que en otras.
Y el equipo puede sobreextender esa ayuda a todo el mapa de riesgos.

### Regla sana

Cada vez que veas secure processing, preguntate:
- “¿qué parte del mapa de impactos está ayudando a reducir?”
y no:
- “¿ya quedó todo cubierto?”

### Idea importante

Una mitigación que ayuda bastante con recursos no necesariamente reemplaza otra que corta resolución externa o desactiva DTD.

---

# Parte 7: La misma opción no siempre significa lo mismo en todas las capas

En Java, este punto importa muchísimo.

Porque una cosa es la intención general de secure processing.
Otra es:

- en qué API aparece
- qué implementación concreta la soporta
- qué parser hay debajo
- qué librería la hereda o la ignora
- qué defaults siguen activos alrededor

### Idea útil

El equipo puede creer que activó una opción fuerte, pero no siempre entender igual:

- qué cubre en DOM
- qué cubre en SAX
- qué cubre en transformaciones
- qué cubre en librerías que envuelven el parseo

### Regla sana

No asumas equivalencia total entre:
- “activé secure processing”
y
- “mi cadena completa de parseo ahora quedó igual de endurecida en todos lados”.

---

# Parte 8: Secure processing puede ser parte del diseño bueno, no su reemplazo

Tampoco se trata de despreciarlo.
Sería un error irse al extremo contrario y pensar:

- “como no alcanza solo, entonces no sirve”

Sí sirve.
Pero en el lugar correcto.

Un uso sano de secure processing suele verse como parte de una postura más completa que también incluye:

- factories configuradas explícitamente
- DTD deshabilitada cuando no hace falta
- entidades externas fuera
- resolvers bien entendidos o innecesarios
- runtimes más acotados
- workers con menos privilegio
- menor confianza en defaults

### Idea importante

Secure processing puede sumar mucho cuando acompaña una reducción explícita de capacidades.
Confunde cuando intenta reemplazarla.

---

# Parte 9: La trampa del snippet corto

Hay muchísimos ejemplos donde la mitigación XML queda reducida mentalmente a:

- “poné secure processing”
- “ya con eso mejorás”
- “eso es lo importante”

Y entonces se deja de mirar el resto.

### Problema

La consecuencia típica es una postura de seguridad así:

- una bandera tranquilizadora
- varias capacidades XML todavía activas
- poca claridad sobre el parser real
- y reviewers que dan por cerrado un problema que solo quedó parcialmente mitigado

### Regla sana

Si un snippet muy corto te genera demasiada tranquilidad para un problema XML complejo, conviene volver a hacer preguntas más duras.

---

# Parte 10: Qué preguntas conviene hacer cuando aparece secure processing

Cuando veas esa opción o su equivalente en una app Java/Spring, conviene preguntar:

- ¿qué parser o factory concreta la usa?
- ¿qué capacidad intenta limitar?
- ¿qué riesgos XML quedan todavía fuera?
- ¿DTD sigue habilitada?
- ¿entidades externas siguen habilitadas?
- ¿hay otras factories o librerías sin la misma postura?
- ¿el runtime sigue siendo rico aunque el parser esté más acotado?
- ¿esto se usa como complemento o como argumento único de seguridad?

### Idea importante

La calidad de la respuesta a estas preguntas suele decirte enseguida si secure processing se está usando con madurez o con fe.

---

# Parte 11: Qué señales indican un uso sano

Hay señales bastante buenas de que secure processing está en su lugar correcto:

- aparece junto con otras decisiones explícitas de hardening
- el equipo puede explicar qué cubre y qué no
- no se usa como única respuesta a XXE
- se combina con una factory bien configurada
- reviewers siguen mirando DTD, entidades y runtime además de esa opción
- el flujo no depende de defaults ambiguos

### Regla sana

Cuando secure processing aparece como parte de un diseño claro, suma.
Cuando aparece como talismán, confunde.

---

# Parte 12: Qué señales indican un uso engañoso

Estas señales merecen revisión fuerte:

- “ya activamos secure processing, así que estamos bien”
- nadie sabe qué parte del riesgo cubre
- DTD o entidades externas siguen sin revisarse
- otras factories del mismo sistema no están igual de endurecidas
- reviewers dejan de mirar el parser después de ver esa bandera
- la dependencia XML sigue opaca pero se da por resuelto el tema
- el runtime sigue siendo muy poderoso y nadie lo incluye en la conversación

### Idea importante

La falsa sensación de cierre es uno de los efectos más peligrosos de cualquier opción de seguridad con nombre tranquilizador.

---

# Parte 13: Secure processing y librerías de terceros

Esto también importa mucho cuando el parser vive dentro de una dependencia.

Una librería puede decir:

- que usa secure processing
- que viene hardened
- que tiene safe mode
- o que aplica buenas prácticas XML

Eso es mejor que nada.
Pero todavía conviene preguntar:

- ¿qué parser usa debajo?
- ¿qué parte del hardening implementa realmente?
- ¿qué versión?
- ¿qué input le llega?
- ¿qué runtime lo ejecuta?
- ¿qué cosas siguen dependiendo de otras flags o configuraciones?

### Regla sana

La frase “la librería usa secure processing” es un dato útil.
No es una auditoría terminada.

---

# Parte 14: Qué revisar en una codebase Spring

Cuando revises secure processing en una aplicación Spring o Java, conviene mirar:

- dónde aparece la opción
- qué factories o transformadores la usan
- si aparece sola o junto a hardening más explícito
- si el equipo sabe qué parser real está debajo
- si hay otros flujos XML sin la misma postura
- qué workers o librerías procesan XML de terceros
- qué impacto dominante te preocupa más: lectura local, SSRF o DoS
- qué parte de ese impacto sigue viva incluso con secure processing activado

### Idea útil

A veces lo más valioso de revisar secure processing no es confirmar que está, sino descubrir qué otras preguntas el equipo dejó de hacerse porque confió demasiado en esa bandera.

---

## Qué revisar en una app Spring

Cuando revises secure processing en una aplicación Spring, mirá especialmente:

- `DocumentBuilderFactory`, `SAXParserFactory`, `XMLInputFactory` o transformadores donde aparezca
- si el uso está documentado o fue copiado sin mucha comprensión
- si el flujo además deshabilita capacidades XML innecesarias
- si las librerías de terceros mencionan esta opción y cómo la combinan con otros controles
- qué input no confiable llega a ese parser
- qué proceso lo ejecuta y qué puede ver

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- secure processing como complemento, no como parche único
- entendimiento claro de su alcance
- combinación con hardening explícito de DTD y entidades
- revisión del runtime además del parser
- menos confianza en el nombre de la opción y más foco en el contrato real del flujo
- reviewers que saben explicar qué problema sigue vivo aunque esta bandera exista

### Idea importante

La madurez aquí se nota cuando secure processing pierde su aura mágica y gana contexto técnico real.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- “con eso ya está”
- nadie sabe qué cubre
- no se revisó DTD ni entidades externas
- el parser sigue demasiado abierto
- se copia la flag sin comprenderla
- la librería dice usarla y el equipo deja de auditar
- el runtime sigue siendo rico y nadie lo mete en la conversación

### Regla sana

Si secure processing corta la discusión antes de tiempo, probablemente se está usando más como placebo organizacional que como parte de una defensa bien entendida.

---

## Checklist práctica

Cuando veas secure processing, preguntate:

- ¿qué intenta limitar?
- ¿qué parser o factory concreta lo usa?
- ¿qué riesgo XML sigue todavía vivo?
- ¿DTD y entidades externas siguen bajo revisión?
- ¿es complemento o sustituto de hardening?
- ¿qué runtime ejecuta ese parseo?
- ¿el equipo puede explicar qué NO promete esta opción?

---

## Mini ejercicio de reflexión

Tomá un flujo XML de tu app Spring y respondé:

1. ¿Usa secure processing en alguna capa?
2. ¿Sabés qué parser lo interpreta realmente?
3. ¿Qué parte del riesgo creés que ayuda a reducir?
4. ¿Qué parte del riesgo sigue viva igual?
5. ¿El equipo lo usa como complemento o como argumento de cierre?
6. ¿Qué revisarías después de ver esa bandera?
7. ¿Qué te gustaría dejar documentado para que no se interprete como “modo seguro total”?

---

## Resumen

Secure processing puede ser una pieza útil dentro del hardening XML porque ayuda a imponer una postura más restringida frente a ciertos comportamientos del parser, especialmente los más costosos o innecesarios.

Pero no debería interpretarse como:

- garantía total
- anti-XXE universal
- reemplazo de deshabilitar DTD
- reemplazo de deshabilitar entidades externas
- ni sustituto de revisar runtime, librerías y contención

En resumen:

> un backend más maduro no se deja seducir por el nombre de secure processing ni lo convierte en un atajo mental para dejar de pensar el resto del problema XML, sino que lo ubica en su lugar correcto: una capa valiosa de restricción que puede sumar bastante, pero que sigue necesitando convivir con decisiones más explícitas sobre qué capacidades del parser sobran para ese flujo y con una revisión honesta del entorno donde ese parseo ocurre.  
> Y justamente por eso este tema importa tanto: porque enseña a no confundir una bandera tranquilizadora con una postura completa de seguridad, y a seguir preguntando qué promete realmente esa opción, qué NO promete y cuánto del mapa de XXE seguiría existiendo si mañana el XML no confiable llegara a un parser que, aun en modo más prudente, sigue teniendo más libertad de la que el caso de uso necesitaba.

---

## Próximo tema

**`disallow-doctype-decl`: por qué suele ser tan valioso**
