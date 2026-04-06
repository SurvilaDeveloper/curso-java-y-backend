---
title: "`setExpandEntityReferences(false)`: cuándo suma y cuándo no alcanza"
description: "Cómo entender `setExpandEntityReferences(false)` en parsers DOM de Java y Spring Boot. Cuándo puede ayudar a reducir expansión automática, por qué no equivale a resolver XXE y qué límites tiene frente a DTD, entidades externas y otras capacidades XML innecesarias."
order: 177
module: "XML, parsers y procesamiento inseguro de documentos"
level: "base"
draft: false
---

# `setExpandEntityReferences(false)`: cuándo suma y cuándo no alcanza

## Objetivo del tema

Entender qué aporta realmente **`setExpandEntityReferences(false)`** cuando una aplicación Java + Spring Boot usa parseo **DOM**, y por qué esta opción puede ser útil pero no debería interpretarse como una solución completa frente a **XXE** o frente a la complejidad XML innecesaria.

La idea de este tema es seguir afinando una confusión bastante típica del hardening XML.

Cuando un equipo empieza a revisar DOM, suele encontrar varias banderas o configuraciones posibles.
Y una de las que más fácilmente se malinterpreta es esta:

- `setExpandEntityReferences(false)`

A primera vista suena muy prometedora.
Porque parece decir algo como:

- “no expandas entidades”
- “dejá de procesar eso”
- “reduzcamos la magia del parser”

Y eso puede disparar una lectura demasiado optimista:

- “si no expande entidades, entonces ya deberíamos estar bastante cubiertos”
- “esto reemplaza otras mitigaciones”
- “con esto no hace falta ser tan estricto con DTD”
- “esto ya debería cerrar XXE o el DoS por expansión”

Ese salto suele ser demasiado fuerte.

En resumen:

> `setExpandEntityReferences(false)` puede sumar porque reduce cierta expansión automática en el árbol DOM resultante,  
> pero no conviene leerla como una bandera mágica ni como sustituto de medidas más estructurales como bloquear `DOCTYPE`, deshabilitar entidades externas y reducir desde la raíz las capacidades XML que el flujo no necesita.

---

## Idea clave

La idea central del tema es esta:

> `setExpandEntityReferences(false)` trabaja sobre **cómo DOM representa o expande entidades en el resultado**, pero no debería confundirse con una garantía total sobre todo lo que el parser pudo haber aceptado, interpretado o intentado hacer durante el proceso XML completo.

Eso implica que esta opción puede ayudar en una dimensión concreta, pero no reemplaza preguntas como:

- ¿DTD sigue habilitada?
- ¿entidades externas siguen permitidas?
- ¿el parser puede resolver recursos fuera del documento?
- ¿`DOCTYPE` sigue viva?
- ¿qué parte del comportamiento peligroso ocurre antes de que el árbol DOM llegue a tu código?

### Idea importante

El punto fuerte de esta bandera está más cerca de:
- “cómo se construye o representa el resultado DOM”
que de:
- “qué superficie XML global sigue aceptando el parser”.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- asumir que “no expandir referencias” equivale a “no hay XXE”
- usar esta bandera como sustituto de deshabilitar DTD
- creer que reduce por sí sola toda la complejidad de entidades
- no distinguir entre representación DOM y comportamiento general del parser
- cerrar el análisis de seguridad demasiado pronto por ver esta opción en el código

Es decir:

> el problema no es usar `setExpandEntityReferences(false)`.  
> El problema es pedirle que resuelva cosas que, en realidad, dependen de otras decisiones más profundas del hardening XML.

---

## Error mental clásico

Un error muy común es este:

### “Si el parser no expande entidades, entonces el tema de entidades ya quedó bastante resuelto”

Eso puede parecer lógico, pero mezcla planos distintos.

Porque todavía quedan preguntas como:

- ¿qué entidades aceptó el parser?
- ¿qué tipo de entidad estaba en juego?
- ¿qué parte del trabajo se hizo antes de construir el árbol?
- ¿el parser sigue aceptando `DOCTYPE`?
- ¿entidades externas siguen siendo una posibilidad?
- ¿esta bandera afecta el mismo punto del problema que `disallow-doctype-decl` o no?

### Idea importante

No toda mitigación sobre entidades actúa en el mismo nivel del flujo XML.

---

# Parte 1: Qué intenta hacer intuitivamente esta opción

## La intuición útil

La forma mental más simple de pensar `setExpandEntityReferences(false)` es esta:

> le estás pidiendo a la construcción DOM que no expanda automáticamente ciertas referencias de entidad en la forma final en que el documento queda representado para tu código.

Eso ya puede tener valor porque:

- reduce opacidad
- baja cierta automatización de sustitución
- puede ayudar a que el árbol no llegue “más resuelto de la cuenta”
- y obliga a pensar mejor qué querés que el parser materialice

### Idea útil

No es una bandera inútil.
Tiene una intención razonable.
El problema aparece cuando se le adjudican efectos más amplios de los que realmente conviene asumir.

---

# Parte 2: Dónde actúa conceptualmente

Esto es importantísimo.

Conviene pensar esta opción como algo que actúa más cerca de:

- la **representación del árbol DOM**
- la **forma final** en que ciertas referencias aparecen ante el código consumidor

que de:

- la aceptación total del lenguaje XML
- la presencia de `DOCTYPE`
- el hecho de que existan entidades externas
- o la política completa de resolución del parser

### Idea importante

Eso la vuelve útil, pero también limitada.

### Regla sana

Siempre preguntate:
- “¿esta opción cambia qué acepta el parser?”
o
- “¿cambia más bien cómo se materializa el resultado que luego voy a leer?”

En este caso, la segunda intuición suele ser la más sana para empezar.

---

# Parte 3: Por qué puede sumar

No conviene irse al extremo de decir que “no sirve”.
Sí puede sumar en varios sentidos.

## Puede sumar porque:
- reduce expansión automática del resultado DOM
- hace más explícito que no querés que el árbol venga completamente materializado
- baja una parte del comportamiento implícito del parser
- puede ayudar a que el documento resultante sea menos “mágico” para el código que consume nodos

### Idea importante

Toda reducción de comportamiento automático innecesario suele ser una mejora.
El punto es no exagerar su alcance.

---

# Parte 4: Por qué no alcanza por sí sola

Acá está el corazón del tema.

Aunque esta bandera ayude, no reemplaza cosas como:

- bloquear `DOCTYPE`
- deshabilitar entidades externas
- endurecer la factory explícitamente
- revisar secure processing
- revisar el runtime
- revisar otras APIs XML hermanas
- contener el proceso donde corre el parseo

### Idea útil

Una forma muy sana de pensarlo es:

> esta bandera puede reducir una parte del “cómo se expande”,  
> pero no necesariamente elimina una parte importante del “qué tipo de documento o de capacidad XML sigo dejando entrar”.

### Regla sana

Cuando una mitigación cambia más la representación que la gramática aceptada por el parser, conviene no usarla como defensa única.

---

# Parte 5: Por qué no reemplaza `disallow-doctype-decl`

Esto merece una comparación directa con el tema anterior.

## `disallow-doctype-decl`
apunta a algo muy alto y muy estructural:
- “este flujo no acepta `DOCTYPE`”

## `setExpandEntityReferences(false)`
apunta a algo más cercano a:
- “si hay referencias de entidad, no quiero que el árbol DOM las expanda automáticamente de cierta manera”

### Idea importante

No están jugando en el mismo nivel.

Una actúa antes y más arriba sobre qué parte del lenguaje XML dejás entrar.
La otra actúa más abajo sobre cómo se representa una parte del resultado.

### Regla sana

Si el flujo no necesita DTD, bloquear `DOCTYPE` suele ser más fuerte y más simple de defender que confiar solo en una política sobre expansión posterior.

---

# Parte 6: Por qué no reemplaza bloquear entidades externas

La lógica es parecida.

## Bloquear entidades externas
apunta a:
- cortar resolución hacia recursos externos o locales

## `setExpandEntityReferences(false)`
no debería interpretarse automáticamente como:
- “entonces ya no importa si había una entidad externa”
o
- “entonces ya no hay riesgo de lectura local o SSRF”

### Idea importante

La expansión visible del árbol y la política de resolución externa no son la misma cosa.

### Regla sana

Nunca supongas que una bandera orientada a expansión DOM reemplaza revisar explícitamente si el parser puede seguir resolviendo recursos externos.

---

# Parte 7: Qué relación tiene con el DoS por expansión

Este tema conecta muy bien con el 176.

Podrías pensar:
- “si no expando referencias, entonces ya no debería haber tanto riesgo de DoS”

Eso puede sonar lógico, pero conviene ser prudente.

Porque el riesgo de consumo excesivo no depende solo de cómo ves el árbol al final.
También depende de:

- cuánto trabajo hizo el parser durante el procesamiento
- qué complejidad aceptó
- qué estructuras interpretó
- qué parte de la expansión o del análisis ocurrió antes de producir el resultado final

### Idea importante

No conviene concluir automáticamente que esta bandera neutraliza por sí sola el DoS por expansión.

### Regla sana

Cuando el impacto dominante te preocupa por disponibilidad, seguí revisando:
- `DOCTYPE`
- complejidad XML aceptada
- budgets
- runtime
y no te quedes solo con esta bandera.

---

# Parte 8: El problema de mirar solo el `Document` final

En DOM, esta es una trampa recurrente.

El desarrollador ve:

- un `Document`
- nodos
- texto
- atributos

y piensa desde ahí.

Pero mucha parte de la seguridad XML se juega antes:
- mientras el parser interpreta el documento
- acepta o rechaza DTD
- decide resolver o no
- expande o no
- y construye esa representación final

### Idea útil

`setExpandEntityReferences(false)` vive más cerca del resultado visible.
Muchos de los riesgos más graves se deciden un poco antes.

### Regla sana

No juzgues la postura XML solo por cómo luce el árbol final.
Mirá también qué tuvo permiso de hacer el parser antes de entregártelo.

---

# Parte 9: Cuándo conviene verla como complemento sano

Esta opción suele encajar mejor cuando aparece así:

- factory endurecida explícitamente
- `DOCTYPE` fuera si no hace falta
- entidades externas fuera
- secure processing bien entendida como complemento
- runtime acotado
- y además, en DOM, querés evitar expansión automática de referencias en el resultado

### Idea importante

En ese lugar, la bandera suma.
No porque cierre sola el problema, sino porque refina una postura de parseo ya bastante más prudente.

### Regla sana

Las banderas que no alcanzan solas igual pueden valer mucho dentro de una configuración bien pensada.

---

# Parte 10: Cuándo conviene desconfiar de su uso

Conviene sospechar cuando veas algo así:

- `setExpandEntityReferences(false)` está
- pero `DOCTYPE` sigue viva
- entidades externas no se revisaron
- nadie sabe qué parser real hay debajo
- el equipo cree que “con eso basta”
- el runtime sigue siendo poderoso
- otras factories hermanas no tienen postura equivalente

### Idea importante

Ahí la bandera puede estar funcionando más como placebo técnico que como hardening suficiente.

### Regla sana

Una opción útil se vuelve riesgosa culturalmente cuando su presencia interrumpe demasiado pronto la conversación de seguridad.

---

# Parte 11: Qué preguntas conviene hacer cuando aparece esta bandera

Cuando la veas en una codebase, conviene preguntar:

- ¿qué quería resolver el equipo con esto?
- ¿qué parser DOM la está usando?
- ¿`DOCTYPE` sigue habilitada?
- ¿entidades externas siguen habilitadas?
- ¿qué impacto se intentó recortar: exfiltración, SSRF, DoS o representación DOM?
- ¿la bandera se usa como complemento o como argumento principal?
- ¿qué parte del comportamiento del parser ocurre igual antes del árbol final?
- ¿qué otras rutas XML de la app no tienen postura equivalente?

### Idea importante

La respuesta a esas preguntas te dice mucho más que la mera presencia de la línea en el código.

---

# Parte 12: Qué diferencia hay entre “sumar” y “alcanzar”

El título del tema juega justamente con esa distinción.

## Sumar
significa:
- ayudar
- reducir una parte del comportamiento
- volver el resultado más controlado
- aportar a un diseño mejor

## Alcanzar
significa:
- cerrar por sí sola el problema relevante

### Regla sana

Con esta bandera, la lectura madura suele ser:
- **suma**
pero
- **no alcanza sola**

### Idea importante

Esa diferencia es muy importante porque evita dos errores:
- despreciarla injustamente
- o sobrevalorarla peligrosamente.

---

# Parte 13: Cómo reconocer esto en una codebase Spring

En una app Spring o Java, conviene sospechar de lectura exageradamente optimista cuando veas:

- `setExpandEntityReferences(false)` como única línea “anti-XXE”
- factories DOM sin revisión clara de `DOCTYPE`
- falta de control explícito sobre entidades externas
- reviewers que consideran resuelto el problema por esa sola bandera
- documentación interna que la presenta como protección completa
- otras rutas XML sin el mismo nivel de hardening

### Idea útil

En revisión real, esta bandera debería abrir preguntas.
No cerrarlas automáticamente.

---

## Qué revisar en una app Spring

Cuando revises `setExpandEntityReferences(false)` en una aplicación Spring o Java, mirá especialmente:

- qué parser DOM la usa
- si aparece junto con bloqueo de `DOCTYPE`
- si se deshabilitaron entidades externas explícitamente
- qué parte del hardening intenta cubrir
- qué parte del riesgo sigue viva en el parser
- si el runtime donde corre el parseo es rico o acotado
- si el equipo entiende la diferencia entre representación DOM y aceptación general del lenguaje XML

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- esta bandera como complemento y no como defensa única
- `DOCTYPE` fuera cuando no hace falta
- entidades externas fuera
- hardening explícito de la factory
- reviewers que entienden qué superficie recorta y qué no
- menos fe en que la representación final del árbol cuenta toda la historia del parseo

### Idea importante

La madurez aquí se nota cuando el equipo ubica esta opción en el mapa correcto del hardening DOM.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- “con esto ya cubrimos entidades”
- `DOCTYPE` sigue viva
- entidades externas no revisadas
- esta línea aparece sola y nadie puede explicar su alcance
- el equipo mezcla representación DOM con política global del parser
- secure processing, resolvers y esta bandera se apilan sin mucha claridad conceptual
- el runtime sigue siendo poderoso y quedó fuera de la conversación

### Regla sana

Si la bandera tranquiliza más de lo que el equipo puede explicar, probablemente se la está leyendo con demasiado optimismo.

---

## Checklist práctica

Cuando veas `setExpandEntityReferences(false)`, preguntate:

- ¿qué parte del problema intenta recortar?
- ¿qué parte del parser sigue viva igual?
- ¿`DOCTYPE` sigue habilitada?
- ¿entidades externas siguen habilitadas?
- ¿el flujo necesita realmente esa parte del lenguaje XML?
- ¿esto suma como complemento o se usa como cierre prematuro?
- ¿qué riesgo dominante sigue abierto después de esta línea?

---

## Mini ejercicio de reflexión

Tomá un flujo DOM de tu app Spring y respondé:

1. ¿Usa `setExpandEntityReferences(false)`?
2. ¿Qué quería lograr el equipo con esa decisión?
3. ¿`DOCTYPE` sigue permitida?
4. ¿Entidades externas siguen siendo una posibilidad?
5. ¿Qué impacto te preocuparía más igual: lectura local, SSRF o DoS?
6. ¿Qué otra medida pondrías primero antes de confiar demasiado en esta bandera?
7. ¿Cómo explicarías al equipo por qué esta línea suma pero no alcanza?

---

## Resumen

`setExpandEntityReferences(false)` puede ser una medida útil en parseo DOM porque ayuda a reducir cierta expansión automática de referencias en el árbol resultante y, con eso, puede hacer menos opaco o menos agresivo parte del comportamiento del parser.

Pero no conviene interpretarla como:

- sustituto de bloquear `DOCTYPE`
- sustituto de deshabilitar entidades externas
- defensa completa frente a XXE
- solución suficiente para DoS por expansión
- ni garantía de que el parser ya no acepte demasiada complejidad

En resumen:

> un backend más maduro no desprecia `setExpandEntityReferences(false)` ni la idolatra, sino que la ubica en su lugar correcto: una bandera que puede mejorar una dimensión concreta del parseo DOM, especialmente en cómo se materializa el resultado, pero que no reemplaza el trabajo más importante de reducir desde la raíz las capacidades XML que el flujo no necesita.  
> Y justamente por eso este tema importa tanto: porque ayuda a evitar un error muy común en hardening XML, que es confundir una mejora real pero acotada con una solución estructural completa, y enseña a seguir preguntando qué parte del lenguaje XML sigue viva, qué comportamiento del parser ocurre antes del árbol final y qué riesgo dominante seguiría presente aunque esta línea ya esté en el código.

---

## Próximo tema

**JAXB, unmarshalling y objetos: cuando XML ya viene envuelto en clases**
