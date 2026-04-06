---
title: "Transformers, XSLT y `Source`: otra superficie XML fácil de olvidar"
description: "Cómo pensar Transformers, XSLT y `Source` como otra superficie XML relevante en aplicaciones Java con Spring Boot. Por qué no son solo herramientas de transformación y qué riesgos siguen existiendo cuando el sistema procesa XML, plantillas o recursos asociados sin el hardening adecuado."
order: 179
module: "XML, parsers y procesamiento inseguro de documentos"
level: "base"
draft: false
---

# Transformers, XSLT y `Source`: otra superficie XML fácil de olvidar

## Objetivo del tema

Entender por qué **Transformers**, **XSLT** y tipos como **`Source`** siguen siendo una superficie XML importante en aplicaciones Java + Spring Boot, aunque muchas veces se los perciba más como herramientas de transformación o render que como parte del problema de **XXE** y del hardening XML.

La idea de este tema es seguir ampliando el mapa de lugares donde XML puede esconderse.

Ya vimos que XML no solo aparece en:

- endpoints explícitos
- parsers manuales
- DOM, SAX o StAX
- JAXB
- SAML, SOAP, SVG
- uploads y flujos documentales

Ahora toca otra zona muy típica del ecosistema Java que suele bajar la guardia del equipo:

- **transformaciones**
- **plantillas XSLT**
- **conversión entre representaciones XML**
- **uso de `Source`, `Result` y `Transformer`**
- **pipelines documentales donde se mezcla parseo con output derivado**

Y eso importa porque, otra vez, el riesgo cambia de disfraz.

En vez de sentirse como:
- “estamos parseando XML”

se siente como:
- “estamos transformando”
- “estamos formateando”
- “estamos convirtiendo”
- “estamos renderizando”
- “estamos aplicando una plantilla”

En resumen:

> Transformers, XSLT y `Source` importan porque vuelven a meter al sistema en una superficie XML donde puede haber parseo, resolución de recursos, acceso al entorno y consumo de recursos, aunque el equipo sienta que solo está haciendo una transformación funcional del documento.

---

## Idea clave

La idea central del tema es esta:

> una transformación XML no es solo una operación inocente sobre texto.  
> Suele implicar que alguna parte del sistema interpreta documentos, plantillas o recursos estructurados con suficiente poder como para que la seguridad del parser y del runtime siga importando muchísimo.

Eso significa que, cuando ves cosas como:

- `TransformerFactory`
- `Transformer`
- `Source`
- `Templates`
- XSLT

conviene activar preguntas como:

- ¿qué parser o motor está participando?
- ¿qué recursos podría intentar resolver?
- ¿el stylesheet o el XML de entrada son confiables?
- ¿qué defaults vienen activos?
- ¿qué parte del entorno ve el proceso que ejecuta la transformación?

### Idea importante

Transformar XML sigue siendo una forma de procesarlo.
Y procesarlo con demasiadas capacidades sigue siendo una superficie de seguridad.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- pensar que transformación XML es solo lógica de formato
- no revisar `TransformerFactory` con la misma seriedad que otros parsers
- creer que XSLT es solo “presentación” o “mapping”
- no considerar que tanto el input XML como la plantilla o los recursos asociados pueden afectar la superficie
- olvidar que `Source` suele marcar el inicio de una cadena donde aún hay parsing, resolución y comportamiento potencialmente peligroso

Es decir:

> el problema no es solo parsear XML para leerlo.  
> El problema también es transformarlo con herramientas que pueden activar una parte poderosa del ecosistema XML sin que el equipo lo modele con suficiente cuidado.

---

## Error mental clásico

Un error muy común es este:

### “Acá no parseamos XML para negocio; solo transformamos un `Source` a otro formato”

Eso suena tranquilo, pero es una simplificación demasiado fuerte.

Porque para transformar pueden entrar en juego cosas como:

- parsing del input
- parsing de la plantilla
- resolución de recursos asociados
- lectura de referencias externas
- complejidad de transformación
- consumo alto de CPU o memoria
- librerías o factories con defaults poco revisados

### Idea importante

El hecho de que el objetivo sea “transformar” no convierte automáticamente al pipeline en una zona XML pequeña, pasiva o libre de riesgo.

---

# Parte 1: Qué es un `Source`, a nivel intuitivo

## La intuición útil

En el ecosistema de transformación XML, tipos como **`Source`** suelen representar algo así como:

- una fuente de datos XML
- una entrada para parsear o transformar
- una abstracción sobre contenido que el motor va a consumir

Puede venir de:

- string
- stream
- archivo
- DOM ya construido
- SAX
- otras fuentes del ecosistema XML

### Idea importante

Aunque `Source` suene abstracto y elegante, sigue siendo una puerta de entrada a procesamiento XML real.

### Regla sana

Cuando veas un `Source`, no lo leas solo como “input genérico”.
Leelo también como:
- “esto puede activar parser, resolución o transformación XML”.

---

# Parte 2: Qué hace un `Transformer`, intuitivamente

## La idea simple

Un **`Transformer`** suele existir para convertir una representación XML en otra salida o en otra forma.

Eso puede ser:

- XML → XML
- XML → HTML
- XML → texto
- XML → otra estructura intermedia
- aplicación de una plantilla XSLT sobre un documento de entrada

### Idea útil

A simple vista eso suena como una operación posterior al parseo.
Pero, en la práctica, la transformación suele convivir con parsing, interpretación y resolución de recursos.

### Regla sana

No asumas que porque el nombre dice “transformer” el problema XML quedó atrás.
Muchas veces apenas cambió de capa.

---

# Parte 3: Por qué XSLT merece tanta atención

## La razón principal

XSLT introduce una idea poderosa:
- no solo tenés un documento de entrada
- también tenés una plantilla o lenguaje de transformación que le dice al sistema cómo procesarlo

Eso aumenta bastante la superficie mental del flujo.

Porque ahora importan al menos dos cosas:

- el XML de entrada
- la lógica o plantilla que guía la transformación

### Idea importante

Cuando aparece XSLT, la conversación deja de ser solo “cómo parseamos datos” y pasa también a “qué poder le damos a la transformación misma”.

### Regla sana

Toda vez que un sistema acepta o usa XSLT, conviene activar un nivel extra de cautela.

---

# Parte 4: Por qué esta superficie suele quedar fuera del radar

Transformers y XSLT suelen quedar fuera del radar por varias razones:

- el equipo los asocia con formato o presentación
- suelen vivir en utilidades o capas de infraestructura
- no se sienten como endpoint XML directo
- pueden estar encapsulados en librerías o frameworks
- los reviewers miran más el output que el proceso de transformación

### Idea útil

Eso los vuelve especialmente peligrosos desde el punto de vista organizacional:
no porque sean siempre peores, sino porque suelen ser menos revisados.

### Regla sana

Cuanto más “herramienta interna” parece una pieza XML, más fácil es que arrastre defaults o capacidades peligrosas fuera del radar.

---

# Parte 5: Qué tipos de riesgo pueden aparecer acá

En esta superficie conviene pensar al menos en varias familias de riesgo.

## A. Resolución de recursos
El motor puede intentar resolver cosas que el flujo no necesitaba.

## B. Lectura local o salida de red
Dependiendo de cómo se alimente la transformación y qué capacidades queden activas.

## C. Complejidad o DoS
La transformación puede ser costosa, especialmente con input o plantillas problemáticas.

## D. Opacidad
El equipo puede no entender bien qué parser o motor está participando.

### Idea importante

La transformación XML no solo mueve datos.
También puede ampliar mucho la superficie de procesamiento.

---

# Parte 6: Por qué `TransformerFactory` importa tanto

Así como vimos factories importantes en DOM, SAX o StAX, acá también hay una pieza equivalente:
**`TransformerFactory`**.

La intuición útil es esta:

> `TransformerFactory` no es solo un helper para obtener un transformador.  
> Es un punto donde se define buena parte del comportamiento del motor que hará la transformación.

Eso vuelve importantes preguntas como:

- ¿qué implementación hay debajo?
- ¿qué features soporta?
- ¿qué restricciones tiene?
- ¿qué defaults trae?
- ¿qué recursos externos puede tocar?
- ¿qué significa “secure processing” en este contexto?

### Regla sana

Si el flujo transforma XML, `TransformerFactory` merece revisión con la misma seriedad que otras factories XML.

---

# Parte 7: Input XML confiable vs plantilla confiable

Este es un matiz muy importante.

A veces el equipo piensa solo:
- “¿el XML de entrada lo controla un tercero?”

Pero en transformaciones también conviene preguntar:

- ¿quién controla el XSLT?
- ¿es fijo?
- ¿se sube?
- ¿se importa?
- ¿viene de config?
- ¿lo edita un admin?
- ¿se genera dinámicamente?
- ¿viene desde otra dependencia o repositorio?

### Idea importante

En esta superficie no siempre hay un solo input delicado.
Puede haber varios:
- documento
- plantilla
- recursos asociados
- y hasta configuración de la transformación.

### Regla sana

Cuando una transformación sale mal, no siempre el problema está solo en el XML de entrada.
A veces está en quién controla la lógica de transformación.

---

# Parte 8: Qué pasa cuando el equipo trata XSLT como “solo vista”

Eso es bastante común.

Una plantilla se percibe como:

- formateo
- presentación
- conversión
- una especie de template sofisticado

Y entonces baja la cautela.

### Problema

XSLT no es simplemente “texto con placeholders”.
Es una capa bastante más poderosa dentro del mundo XML.

### Idea útil

Cuanto más expresiva es la transformación, más importante se vuelve revisar:

- quién la controla
- qué puede resolver
- qué motor la ejecuta
- qué runtime la hospeda

### Regla sana

No trates XSLT como si fuera un motor de plantillas trivial.
Su superficie puede ser bastante más rica.

---

# Parte 9: Transformación y DoS: un punto muy subestimado

Este tema también conecta con el 176.

Una transformación puede traer costos altos no solo por parseo básico, sino por:

- complejidad del input
- complejidad de la plantilla
- cantidad de nodos procesados
- trabajo repetido
- materialización de resultados grandes
- consumo de CPU y memoria en el motor de transformación

### Idea importante

Incluso sin exfiltración ni salida de red, un pipeline XSLT o de transformación puede ser muy dañino para disponibilidad si acepta demasiada complejidad.

### Regla sana

Toda transformación XML sobre input no confiable merece evaluación también desde presupuesto de recursos.

---

# Parte 10: Qué se vuelve opaco en esta superficie

Hay varias cosas que tienden a esconderse cuando aparece `Transformer` o `Source`:

- qué parser preparó la entrada
- qué factory se usó
- qué implementación concreta de transformación está corriendo
- qué recursos externos o plantillas se pueden tocar
- qué capa hace el trabajo real
- qué defaults heredó el motor

### Idea útil

Eso hace que el equipo vea solo algo como:
- `transform(source, result)`
cuando por debajo hay bastante más comportamiento del que parece.

### Regla sana

Cuando una API luce demasiado limpia, conviene mirar qué complejidad está encapsulando.

---

# Parte 11: Qué preguntas conviene hacer en esta superficie

Cuando veas transformación XML, conviene preguntar:

- ¿qué controla el XML de entrada?
- ¿qué controla la plantilla XSLT, si existe?
- ¿qué factory crea el transformador?
- ¿hay secure processing o hardening explícito?
- ¿qué recursos podría intentar resolver el motor?
- ¿qué runtime ejecuta la transformación?
- ¿qué filesystem o red ve?
- ¿qué tan costosa puede volverse la operación?
- ¿qué parte del riesgo está oculta detrás de `Source` y `Transformer`?

### Idea importante

En esta superficie, el mapa de riesgo suele ser más rico que en un parseo “solo de lectura”, y por eso conviene hacer preguntas más amplias.

---

# Parte 12: Qué señales indican un uso sano

Hay buenas señales cuando:

- la `TransformerFactory` está configurada explícitamente
- el equipo sabe qué implementación usa
- input y plantilla tienen orígenes claros y acotados
- secure processing se entiende como complemento, no como magia
- el runtime que transforma es razonablemente contenido
- el equipo modela tanto integridad/seguridad como disponibilidad
- reviewers entienden que transformar XML sigue siendo procesar XML

### Regla sana

La madurez aquí se nota cuando la transformación deja de verse como una “caja negra de formato” y pasa a modelarse como otra superficie XML con poder real.

---

# Parte 13: Qué señales indican una postura floja

Estas señales merecen revisión fuerte:

- “solo convertimos”
- “solo aplicamos una plantilla”
- nadie sabe qué `TransformerFactory` hay debajo
- nadie revisó qué puede resolver el motor
- XSLT editable o importable sin mucho modelado
- input de terceros entrando a pipelines complejos
- workers con mucho acceso procesando transformaciones opacas
- secure processing usada como único argumento de tranquilidad

### Idea importante

En transformación XML, la frase “solo convertimos” puede ser tan engañosa como “solo parseamos”.

---

# Parte 14: Cómo reconocer esta superficie en una codebase Spring

En una app Spring o Java, conviene sospechar especialmente cuando veas:

- `TransformerFactory`
- `Transformer`
- `Source`
- `Result`
- `Templates`
- XSLT
- conversión XML→HTML o XML→texto
- renderizado o normalización documental
- librerías de reportes, plantillas o validación que usen XSLT por debajo
- workers documentales que generan output a partir de XML

### Idea útil

En revisión real, el punto débil puede no estar en el XML original ni en el resultado, sino en el motor de transformación que quedó escondido entre ambos.

---

## Qué revisar en una app Spring

Cuando revises transformers, XSLT y `Source` en una aplicación Spring o Java, mirá especialmente:

- dónde se crean factories de transformación
- qué input XML entra
- si hay XSLT y quién la controla
- si existe hardening explícito
- qué procesos ejecutan la transformación
- qué filesystem o red ven
- qué tan costoso puede volverse el pipeline
- qué parte de la superficie XML quedó enterrada detrás de una abstracción de transformación

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- factories de transformación configuradas explícitamente
- XSLT fija o muy controlada
- poca fe en defaults del motor
- revisión de costos operativos además de XXE clásica
- runtime más acotado para flujos de transformación
- reviewers que entienden que `Source` y `Transformer` siguen marcando superficies XML reales

### Idea importante

La madurez aquí se nota cuando el equipo deja de tratar transformación como simple plumbing técnico y la incorpora al mapa de hardening XML.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- nadie sabe qué motor de transformación hay debajo
- XSLT controlada por terceros o admins sin mucho modelado
- secure processing como único escudo mental
- pipelines documentales opacos
- input XML no confiable entrando a transformaciones complejas
- workers ricos ejecutando transformaciones con poca visibilidad
- revisión centrada solo en output, no en el proceso de transformación

### Regla sana

Si el motor puede hacer más de lo que el negocio necesita, el hecho de llamarlo “transformer” no lo vuelve menos riesgoso.

---

## Checklist práctica

Cuando veas transformers, XSLT o `Source`, preguntate:

- ¿qué XML entra?
- ¿qué XSLT o lógica de transformación existe?
- ¿quién controla cada una?
- ¿qué factory crea el motor?
- ¿qué puede resolver o hacer el motor?
- ¿qué runtime ejecuta la transformación?
- ¿qué costo operativo puede tener?
- ¿qué parte del riesgo XML está quedando escondida por la abstracción?

---

## Mini ejercicio de reflexión

Tomá un flujo de transformación XML de tu app Spring y respondé:

1. ¿Qué input XML entra?
2. ¿Hay XSLT o plantillas?
3. ¿Quién controla esa lógica de transformación?
4. ¿Qué factory o motor ejecuta el proceso?
5. ¿El equipo modela este flujo como superficie XML o solo como conversión?
6. ¿Qué riesgo te preocupa más: resolución, DoS u opacidad?
7. ¿Qué revisarías primero después de este tema?

---

## Resumen

Transformers, XSLT y `Source` siguen siendo una superficie XML importante porque convierten al sistema en algo más que un simple lector de documentos: lo vuelven un procesador o transformador activo de XML, plantillas y recursos asociados.

Eso implica que siguen importando:

- el parser o motor subyacente
- la factory que lo crea
- qué input controla un tercero
- qué plantillas existen
- qué recursos puede resolver
- qué runtime ejecuta el trabajo
- y qué costo operativo puede dispararse

En resumen:

> un backend más maduro no deja que la palabra “transformación” lo haga olvidar que sigue habiendo XML, parsing, motores de procesamiento y una superficie de seguridad concreta debajo de APIs elegantes como `Source`, `Result` o `Transformer`.  
> Entiende que convertir, renderizar o aplicar XSLT no elimina el problema; solo cambia su forma y su lugar dentro del flujo.  
> Y justamente por eso este tema importa tanto: porque enseña a mirar esas capas como otra frontera real del hardening XML, donde todavía puede haber resolución no deseada, complejidad excesiva y demasiada opacidad si el equipo se queda solo con la comodidad de la abstracción y deja de revisar qué capacidades concretas siguen vivas en el motor que hace la transformación.

---

## Próximo tema

**Cierre del bloque XXE: principios duraderos para parsers XML seguros**
