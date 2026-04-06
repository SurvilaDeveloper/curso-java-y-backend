---
title: "DocumentBuilderFactory y flags críticos contra XXE"
description: "Cómo pensar DocumentBuilderFactory y los flags críticos contra XXE en aplicaciones Java con Spring Boot. Qué rol cumple esta factory, por qué su configuración importa tanto y qué principios conviene entender antes de endurecer el parseo XML con DOM."
order: 166
module: "XML, parsers y procesamiento inseguro de documentos"
level: "base"
draft: false
---

# DocumentBuilderFactory y flags críticos contra XXE

## Objetivo del tema

Entender por qué **`DocumentBuilderFactory`** es una pieza central al mitigar **XXE** cuando una aplicación Java + Spring Boot usa **DOM** para procesar XML.

La idea de este tema es bajar el bloque anterior a un punto muy concreto del ecosistema Java.

Ya vimos que:

- XML puede traer capacidades de DTD y entidades
- XXE puede derivar en lectura local, SSRF o DoS
- DOM, SAX y StAX no son “seguros” o “inseguros” por nombre
- el problema real depende de la configuración efectiva del parser

Ahora toca mirar una pieza muy importante del mundo DOM:

- `DocumentBuilderFactory`

Porque muchas veces el equipo hace algo así:

- crea la factory
- crea el builder
- parsea el XML
- obtiene un `Document`
- sigue trabajando feliz con el árbol

Y el riesgo real quedó varios pasos antes, justo donde la factory decidió qué capacidades XML quedaban activas.

En resumen:

> si usás DOM, gran parte de la postura frente a XXE se juega en cómo configurás `DocumentBuilderFactory`, porque ahí decidís si el parser seguirá aceptando DTD, entidades externas y otras capacidades que el flujo probablemente no necesitaba en primer lugar.

---

## Idea clave

La intuición más importante del tema es esta:

> `DocumentBuilderFactory` no es solo una fábrica “de conveniencia”.  
> Es el lugar donde se define una parte muy importante del comportamiento de seguridad del parseo DOM.

Eso importa porque la factory influye en cosas como:

- qué features XML quedan habilitadas
- si se aceptan DTD
- si se permiten entidades externas
- si se expanden entidades
- si el parser va a intentar resolver recursos que viven fuera del documento base

### Idea importante

Cuando una app recibe XML no confiable, la línea verdaderamente crítica no suele ser donde navegás nodos del `Document`.
Suele ser bastante antes:
- donde se crea y configura la factory.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- pensar que `DocumentBuilderFactory` es una pieza neutra
- usarla con defaults sin revisar
- copiar una configuración parcial sin entender qué protege
- creer que “usar DOM” ya describe suficientemente la superficie
- endurecer una parte del parseo pero dejar otra abierta
- no ver que distintas flags apuntan a dimensiones distintas del riesgo

Es decir:

> el problema no es solo usar DOM.  
> El problema es usar una factory cuya configuración deja activas capacidades XML que el documento no confiable no debería poder explotar.

---

## Error mental clásico

Un error muy común es este:

### “Creamos un `DocumentBuilder`, parseamos y listo; no debería haber mucha historia”

Eso es justo lo que vuelve traicionero al tema.

Porque el código de negocio ve algo sencillo:

- llega XML
- se transforma en `Document`
- se leen nodos

Pero entre el XML y ese `Document`, hubo un parser que tomó decisiones muy importantes sobre:

- DTD
- entidades
- resolución externa
- expansión
- y otras capacidades del formato

### Idea importante

DOM te entrega una estructura ya construida.
Y eso puede hacer que olvides que la parte más delicada ocurrió antes y, muchas veces, con muy poca visibilidad si nadie configuró explícitamente la factory.

---

# Parte 1: Qué hace `DocumentBuilderFactory`, a nivel intuitivo

## El rol conceptual

A nivel práctico, `DocumentBuilderFactory` existe para configurar y crear builders DOM.

La forma mental útil es esta:

> la factory define cómo se va a comportar el parser que construye el árbol DOM.

Es decir, no es solo un helper para instanciar objetos.
Es un punto donde decidís el **contrato de parseo**.

### Ese contrato incluye preguntas como:
- ¿qué cosas del XML acepto?
- ¿qué cosas rechazo?
- ¿qué cosas expando?
- ¿qué cosas resuelvo?
- ¿qué comportamiento del formato dejo vivo?

### Idea importante

En seguridad, la factory es menos “fábrica de builders” y más “punto de control del comportamiento XML”.

---

## Por qué esta pieza pesa tanto en XXE

Porque muchas de las capacidades que vuelven peligroso el parseo XML no se controlan navegando el `Document`, sino antes, cuando definís cómo se construye.

Eso significa que si la factory queda permisiva:

- el builder hereda esa permisividad
- el parser hace trabajo de más
- y el `Document` final puede ya venir como resultado de una interacción con recursos que el equipo jamás quiso permitir

### Regla sana

Si el XML no es plenamente confiable, `DocumentBuilderFactory` no debería tratarse como una línea de infraestructura transparente.
Debería tratarse como una superficie de seguridad explícita.

---

# Parte 2: Por qué los defaults no bastan

## La trampa de los defaults

Uno de los mayores problemas con XML en Java es que muchas veces el equipo no configura explícitamente la factory.

Entonces queda algo como:

- crear la factory
- usarla con valores por defecto
- asumir que “seguro hoy viene bastante sana”
- o ni siquiera pensar el tema porque el código “solo parsea un documento”

### Problema

Los defaults pueden variar, ser poco evidentes o no estar alineados con el nivel de endurecimiento que necesitás para input no confiable.

### Idea importante

En XXE, confiar en defaults es mala estrategia porque el riesgo no está en que la API compile.
Está en si dejó activas capacidades que tu caso de uso nunca pidió.

---

## Qué significa “configurar explícitamente”

Configurar explícitamente no es solo “poner algunas flags”.

También significa que el código deja claro:

- que el equipo sabe que el parser puede hacer más de lo necesario
- que eligió qué deshabilitar
- y que no está delegando esa decisión a la suerte de la implementación o del entorno

### Idea útil

La explicitud en seguridad vale mucho.
No porque haga mágico al código, sino porque reduce ambigüedad y hace más auditables las decisiones importantes.

---

# Parte 3: Qué familias de flags o controles importan

No hace falta que memorices todas las APIs hoy.
Lo importante es entender **qué clase de problemas intenta cortar cada grupo de configuración**.

Pensalo en familias.

## Familia A: evitar DTD cuando no hace falta
Si el flujo no necesita DTD, esta es una de las primeras cosas que conviene cuestionar.

## Familia B: impedir entidades externas
Acá se corta justamente una de las raíces más directas de XXE.

## Familia C: evitar expansión peligrosa de entidades
Aun si el documento trae ciertas referencias, la app no siempre necesita que el parser las expanda de forma automática.

## Familia D: endurecer acceso a recursos externos
Esto busca impedir que el parser se ponga a consultar recursos fuera del documento base.

### Idea importante

Las flags no son “hechizos anti-XXE”.
Son formas de ir apagando capacidades XML que sobran para la mayoría de los flujos de negocio.

---

# Parte 4: DTD: por qué suele ser de las primeras cosas en la mira

Ya vimos que la DTD habilita una capa adicional de definición e interpretación del documento.

En muchos casos modernos de aplicación, esa capa:

- no aporta nada al caso de uso
- complica la seguridad
- y abre la puerta a entidades y resolución externa

### Idea útil

Por eso, una de las primeras preguntas sanas suele ser:
- “¿realmente necesitamos DTD para este flujo?”

### Regla sana

Si la respuesta es no, la postura madura suele ser:
- no dejarla habilitada “por si acaso”.

### Idea importante

Muchos controles de seguridad sobre `DocumentBuilderFactory` empiezan justo por ahí: quitarle al parser una capacidad que el negocio no necesitaba pero que el formato traía disponible.

---

# Parte 5: Entidades externas: la dimensión más obvia de XXE

Este es probablemente el corazón más directo del problema.

Si el parser puede resolver entidades externas, entonces el documento puede llegar a influir para que el runtime:

- mire afuera del texto base
- consulte recursos externos o locales
- y se meta en una clase de interacción que el flujo no quería habilitar

### Idea importante

Por eso, otra gran familia de controles críticos en `DocumentBuilderFactory` es la que busca desactivar o bloquear ese tipo de resolución.

### Regla sana

Si el XML viene de una fuente no confiable y no hay necesidad clara de entidades externas, dejarlas activas suele ser una apuesta innecesaria.

---

# Parte 6: Expansión de entidades: por qué también importa

A veces el equipo se concentra solo en “externo” y pierde de vista otra pieza:

- qué hace el parser con las entidades en general
- cuánto expande
- en qué momento
- y cómo eso afecta tanto seguridad como recursos

### Idea útil

La expansión puede afectar no solo confidencialidad o salida de red, sino también disponibilidad y previsibilidad del parseo.

### Idea importante

Por eso, endurecer DOM no consiste solo en “que no haga requests”.
También consiste en limitar comportamientos de expansión que el flujo no necesita para convertir el XML en datos útiles.

---

# Parte 7: `DocumentBuilderFactory` y la ilusión del `Document` ya “inocente”

Este es un punto muy importante cuando revisás código.

El desarrollador que consume el `Document` muchas veces ve algo así:

- elementos
- nodos
- texto
- atributos

y siente que está trabajando sobre una estructura ya pasiva.

### Problema

Ese `Document` puede ser el resultado de un parseo que ya:

- aceptó DTD
- expandió entidades
- intentó resolver recursos
- y tomó decisiones que no eran obvias en la parte “bonita” del código

### Regla sana

Nunca audites DOM solo desde la etapa de navegación del árbol.
La pregunta crítica casi siempre está en cómo se construyó ese árbol.

---

# Parte 8: Qué hace crítico a un flag “crítico”

Conviene aclarar algo: no porque una configuración sea famosa significa que sea una receta mágica.

Un flag o control es crítico cuando corta una capacidad que:

- el caso de uso no necesita
- y que, si queda abierta, cambia mucho la superficie del parser

### Por eso los controles importantes suelen ser los que:
- reducen interpretación innecesaria
- reducen resolución externa
- reducen expansión
- reducen dependencia del entorno

### Idea importante

La lógica correcta no es:
- “activo flags porque sí”

La lógica madura es:
- “desactivo capacidades del parser que sobran para este flujo y que aumentan la superficie XML”.

---

# Parte 9: Qué pasa cuando la configuración queda incompleta

Esto también es muy real.

A veces el equipo endurece una parte y cree que ya cerró el tema.
Por ejemplo:

- toca una feature
- pero deja otra activa
- o usa una factory segura en un lado y otra no en otro
- o endurece DOM, pero otra librería sigue parseando XML con otra configuración
- o copia una configuración parcial sin entender qué falta

### Idea útil

En XXE, una postura medio endurecida puede mejorar algo, pero seguir dejando huecos importantes si el equipo cree que “ya quedó todo”.

### Regla sana

Más importante que memorizar una línea exacta es entender qué familias de capacidad querés cortar y verificar que realmente quedaron fuera en ese flujo.

---

# Parte 10: Por qué la configuración debería vivir cerca de la creación del parser

Otra buena práctica conceptual es esta:

si la seguridad depende de cómo se crea la factory, entonces esa decisión no debería quedar:

- escondida
- implícita
- repartida entre muchas capas
- o delegada enteramente a defaults de terceros

### Idea importante

Cuanto más visible y centralizada está la creación del parser, más fácil es:

- auditarla
- reutilizarla bien
- evitar inconsistencias
- y razonar sobre qué quedó activo y qué no

### Regla sana

Las decisiones de seguridad críticas conviene que vivan donde realmente se define el comportamiento del parser, no en supuestos informales del equipo.

---

# Parte 11: `DocumentBuilderFactory` no vive sola

Esto también importa.

Aunque `DocumentBuilderFactory` sea central para DOM, el análisis no termina ahí.
Siempre conviene seguir preguntando:

- ¿quién controla el XML?
- ¿qué proceso lo parsea?
- ¿qué filesystem ve?
- ¿qué red ve?
- ¿qué librerías usan esta factory?
- ¿qué hace luego el sistema con el `Document` resultante?

### Idea útil

La factory endurecida es muy importante.
Pero no reemplaza el análisis del runtime y del flujo completo.

### Regla sana

Un parser bien configurado reduce mucho riesgo.
Un parser bien configurado dentro de un proceso sobredimensionado sigue mereciendo mirada completa.

---

# Parte 12: Qué preguntas conviene hacer sobre `DocumentBuilderFactory`

Cuando veas esta API en una app Java/Spring, conviene preguntar:

- ¿se configura explícitamente?
- ¿qué capacidades XML quedaron activas?
- ¿se permite DTD?
- ¿se permiten entidades externas?
- ¿se expande contenido que el flujo no necesita?
- ¿la configuración vive en un lugar claro o está dispersa?
- ¿hay varias factories distintas con posturas distintas?
- ¿el equipo sabe explicar por qué cada capacidad sigue activa o está deshabilitada?

### Idea importante

La calidad de la respuesta a estas preguntas suele decirte bastante sobre la madurez real del manejo XML en esa codebase.

---

## Qué revisar en una app Spring

Cuando revises `DocumentBuilderFactory` en una aplicación Spring, mirá especialmente:

- dónde se instancia
- si se configura explícitamente
- si esa configuración está duplicada o centralizada
- qué features relacionadas con DTD y entidades siguen activas
- si hay otros componentes DOM creados por bibliotecas auxiliares
- qué input llega a ese parser
- qué runtime ejecuta el parseo
- qué podría tocar ese proceso si la factory quedó demasiado permisiva

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- creación explícita de la factory
- hardening claro y visible
- pocas capacidades XML activas y justificadas
- entendimiento del equipo sobre qué se está deshabilitando y por qué
- menor dependencia en defaults
- revisión del runtime además del parser

### Idea importante

La madurez acá se nota cuando el equipo trata a `DocumentBuilderFactory` como una superficie de seguridad, no como un detalle mecánico del parseo.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- factory creada sin configuración visible
- defaults asumidos como suficientes
- nadie sabe si DTD sigue activa
- nadie sabe si hay entidades externas habilitadas
- configuración copiada sin comprender qué cubre
- varias factories con reglas distintas
- revisión centrada solo en el `Document` final y no en cómo se creó

### Regla sana

Si el equipo no puede explicar por qué esa factory está configurada así, probablemente todavía no domina realmente la superficie XXE de ese flujo.

---

## Checklist práctica

Cuando veas `DocumentBuilderFactory`, preguntate:

- ¿está configurada explícitamente?
- ¿el flujo realmente necesita DTD?
- ¿el flujo realmente necesita entidades externas?
- ¿se están deshabilitando capacidades sobrantes?
- ¿la configuración es consistente en toda la app?
- ¿qué proceso usa ese parser y qué puede ver?
- ¿qué cambiaría si esta factory fuera mucho más estricta?

---

## Mini ejercicio de reflexión

Tomá una parte XML de tu app Spring y respondé:

1. ¿Usa `DocumentBuilderFactory`?
2. ¿Dónde se instancia?
3. ¿Está endurecida de forma explícita?
4. ¿Qué capacidad XML creés que sobraría seguro para ese flujo?
5. ¿Qué parte del riesgo vendría del parser y cuál del runtime?
6. ¿La configuración está clara para cualquier reviewer?
7. ¿Qué revisarías primero después de este tema?

---

## Resumen

`DocumentBuilderFactory` importa mucho en XXE porque es uno de los lugares más críticos donde se define cómo se comportará el parseo DOM:

- si acepta DTD
- si permite entidades externas
- si expande más de la cuenta
- y, en general, si deja activo un conjunto de capacidades XML que el flujo no necesita

En resumen:

> un backend más maduro no trata `DocumentBuilderFactory` como una simple API de construcción de parsers ni como una pieza invisible del boilerplate XML, sino como un punto central de decisión de seguridad.  
> Entiende que, cuando el XML no es plenamente confiable, gran parte del riesgo de XXE se decide justo ahí: en si el parser seguirá teniendo permiso para interpretar, expandir o resolver más de lo necesario.  
> Y justamente por eso este tema importa tanto: porque ayuda a mover la atención desde el `Document` ya construido hacia el lugar donde realmente se jugó la seguridad del parseo, que es la configuración de la factory y las capacidades que el equipo decidió —o dejó de decidir— habilitar en ella.

---

## Próximo tema

**SAXParserFactory y XMLInputFactory: paralelos importantes**
