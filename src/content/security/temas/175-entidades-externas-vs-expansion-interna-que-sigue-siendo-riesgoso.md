---
title: "Entidades externas vs expansión interna: qué sigue siendo riesgoso"
description: "Cómo distinguir entidades externas de expansión interna al analizar XXE y hardening XML en aplicaciones Java con Spring Boot. Qué riesgo corta cada medida, por qué no conviene mezclarlas mentalmente y qué superficies pueden seguir siendo problemáticas incluso después de bloquear resolución externa."
order: 175
module: "XML, parsers y procesamiento inseguro de documentos"
level: "base"
draft: false
---

# Entidades externas vs expansión interna: qué sigue siendo riesgoso

## Objetivo del tema

Entender la diferencia entre:

- **entidades externas**
- **expansión interna**
- y otras formas de comportamiento del parser que pueden seguir siendo riesgosas aunque parte de la resolución externa ya esté bloqueada

La idea de este tema es aclarar una confusión muy común cuando un equipo empieza a endurecer XML.

Muchas veces el razonamiento va así:

- deshabilitamos entidades externas
- o pusimos un resolver
- o activamos alguna mitigación contra XXE clásica
- entonces ya no debería quedar mucho problema

Y ahí aparece un error de modelado bastante frecuente.

Porque una cosa es cortar:
- la resolución hacia recursos externos o locales

y otra muy distinta es asumir que con eso:
- desapareció toda la complejidad asociada a entidades
- desapareció todo riesgo de expansión
- o desapareció toda posibilidad de consumo peligroso de recursos

En resumen:

> bloquear entidades externas suele ser una mejora muy importante,  
> pero no conviene mezclar eso con la idea de que ya no hay nada riesgoso en torno a entidades, expansión o comportamiento interno del parser.

---

## Idea clave

La idea central del tema es esta:

> no todo lo problemático en XML depende de que el parser salga del documento y consulte algo externo.  
> También puede haber riesgo en **cómo interpreta, expande o procesa contenido dentro del propio material XML** aunque no haya resolución externa.

Eso obliga a separar mejor dos planos:

### Plano 1: salir del documento
- leer recursos externos
- tocar filesystem
- hacer SSRF
- consultar el entorno

### Plano 2: trabajar demasiado o expandir demasiado dentro del propio procesamiento
- generar consumo excesivo
- volver impredecible el parseo
- aceptar una complejidad del formato que el flujo no necesitaba

### Idea importante

Si no hacés esa distinción, podés creer que el problema terminó cuando en realidad solo cambió de forma.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- asumir que bloquear entidades externas equivale a neutralizar todo el riesgo asociado a entidades
- no distinguir lectura externa de expansión interna
- subestimar DoS o complejidad innecesaria del parser
- pensar XXE solo como “el parser fue a buscar algo afuera”
- dejar viva una superficie de expansión que el caso de uso no necesita porque el equipo cree que ya hizo suficiente

Es decir:

> el problema no es solo qué resuelve el parser fuera del documento.  
> El problema también es cuánto poder de expansión, interpretación y trabajo interno sigue teniendo frente a input no confiable.

---

## Error mental clásico

Un error muy común es este:

### “Si ya no hay entidades externas, entonces el problema de entidades quedó resuelto”

Eso es demasiado fuerte como conclusión.

Porque todavía quedan preguntas como:

- ¿el parser sigue aceptando DTD?
- ¿el parser sigue expandiendo cosas que el flujo no necesita?
- ¿podría aparecer consumo excesivo de recursos?
- ¿el documento sigue teniendo demasiado poder estructural?
- ¿la superficie XML sigue siendo mucho más rica de lo que el caso de uso justifica?

### Idea importante

Cortar una familia de impacto muy importante no significa que la superficie restante sea automáticamente pequeña o inocua.

---

# Parte 1: Qué entendemos por entidades externas

## La intuición ya conocida

Ya vimos que las entidades externas son problemáticas porque llevan al parser fuera del documento base.

Eso puede significar cosas como:

- leer recursos locales
- resolver referencias externas
- tocar la red
- salir al entorno
- apoyarse en filesystem o servicios que el documento no debería poder influir

### Idea útil

Acá el gran riesgo viene de:
- **expandir algo que no vive completamente dentro del propio documento recibido**

### Regla sana

Cuando hablás de entidades externas, pensá siempre en:
- recursos que el parser intenta obtener fuera del texto base.

---

# Parte 2: Qué entendemos por expansión interna

## La intuición útil

La expansión interna es otra cosa.

Acá el parser no necesariamente va a buscar algo afuera.
En cambio, trabaja dentro del propio universo del documento y sus definiciones, expandiendo referencias o procesando estructuras internas.

### Idea importante

Eso puede seguir siendo problemático aunque no haya:
- filesystem
- red
- recursos externos
- ni SSRF

Porque el riesgo ya no está en salir del documento.
Está en:
- cuánto trabajo se le deja hacer al parser
- cuánta complejidad se acepta
- y cuánto poder estructural tiene el input no confiable.

---

# Parte 3: Por qué esta diferencia importa tanto

Si no separás estas dos cosas, te pueden pasar dos errores de análisis:

## Error A
sobreestimar una mitigación parcial:
- “ya bloqueamos lo externo, así que listo”

## Error B
subestimar un riesgo remanente:
- “si no hubo SSRF ni lectura local, entonces no quedó nada relevante”

### Idea útil

La diferencia importa porque cada medida corta partes distintas del problema.

### Regla sana

En seguridad XML no conviene preguntar solo:
- “¿sale afuera?”
También conviene preguntar:
- “¿qué complejidad interna seguimos dejando viva y para qué?”

---

# Parte 4: Qué riesgos quedan aunque no haya resolución externa

Aunque la resolución externa esté apagada, todavía pueden quedar superficies como:

- expansión innecesaria
- trabajo excesivo del parser
- mayor consumo de memoria o CPU
- estructuras del formato demasiado ricas para el caso de uso
- DTD aún habilitada sin necesidad
- complejidad que vuelve más difícil razonar el parseo
- diferencias entre parsers o implementaciones que el equipo no modela bien

### Idea importante

La seguridad XML no termina en “ya no toca la red”.
También importa si el parser sigue siendo demasiado poderoso para lo que el flujo necesita.

---

# Parte 5: XXE clásica vs comportamiento peligroso del parser

Este es un matiz útil.

A veces se usa “XXE” de forma muy amplia para casi cualquier problema asociado a entidades.
Pero desde diseño conviene distinguir:

### XXE clásica
Cuando hay resolución de entidades externas y el parser interactúa con recursos fuera del documento.

### Problemas de expansión o complejidad interna
Cuando el parser no necesariamente sale, pero igual procesa una estructura innecesaria o costosa.

### Idea útil

No hace falta pelear por taxonomía perfecta.
Lo importante es no perder de vista que ambas dimensiones pueden importar, aunque una ya esté mitigada.

### Regla sana

Si querés diseñar bien defensas, separá:
- riesgo por resolución externa
de
- riesgo por expansión o complejidad interna.

---

# Parte 6: Por qué el DoS suele vivir más de este lado

Cuando pensamos en expansión interna, una de las primeras dimensiones de impacto que aparece es **disponibilidad**.

Porque aunque el parser no esté leyendo nada externo, igual puede terminar:

- expandiendo demasiado
- consumiendo demasiada memoria
- usando demasiada CPU
- tardando demasiado
- degradando workers o servicios

### Idea importante

Ahí el problema ya no es:
- “qué recurso externo tocó”
sino
- “cuánto trabajo le dejamos forzar al parser dentro del propio procesamiento”.

### Regla sana

Si el flujo no necesita estructuras XML complejas, aceptar esa complejidad solo para luego lidiar con sus efectos es un mal intercambio.

---

# Parte 7: Por qué `disallow-doctype-decl` ayuda también acá

Esto conecta muy bien con el tema anterior.

Una de las razones por las que bloquear `DOCTYPE` suele ser tan valioso es que no solo recorta la puerta hacia entidades externas.
También suele ayudar a recortar la superficie de:

- definiciones innecesarias
- expansión
- complejidad del formato
- y parte del trabajo extra que el parser podría hacer

### Idea útil

Por eso esa medida vale tanto:
- porque simplifica en varias direcciones a la vez.

### Regla sana

Cuando el caso de uso no necesita DTD, bloquearla no solo ayuda con SSRF o lectura local.
También ayuda a que el parser tenga menos oportunidades de hacer trabajo innecesario dentro del propio documento.

---

# Parte 8: Deshabilitar entidades externas no equivale a “el XML ya es simple”

Otra confusión muy común es esta:

- “apagamos entidades externas”
- entonces
- “el parser ya está trabajando sobre algo bastante simple”

Eso no siempre es cierto.

Porque todavía puede haber:

- DTD viva
- otras formas de expansión
- complejidad estructural innecesaria
- diferencias entre implementaciones
- dependencias que siguen aceptando más de lo que el flujo necesita

### Idea importante

La simplicidad del XML aceptado no se deduce solo de haber cortado resolución externa.
Se deduce del conjunto completo de capacidades que siguen activas.

---

# Parte 9: Qué preguntas conviene hacer después de bloquear lo externo

Una vez que el equipo corta entidades externas, todavía conviene seguir preguntando:

- ¿qué parte del parser sigue sobrando?
- ¿DTD sigue activa?
- ¿hay expansión innecesaria?
- ¿el flujo necesita realmente esa parte del lenguaje XML?
- ¿podría todavía haber consumo peligroso de recursos?
- ¿el parser sigue aceptando estructuras que el caso de uso no necesita?
- ¿qué parte de la complejidad restante solo existe por compatibilidad heredada o defaults?

### Regla sana

Bloquear lo externo es un paso muy importante.
No debería ser el último pensamiento.

### Idea importante

La pregunta madura después de una mitigación parcial es:
- “¿qué parte del contrato del parser todavía puedo achicar?”

---

# Parte 10: Por qué el equipo suele olvidar esta dimensión

Hay varias razones culturales por las que esto se olvida.

## Porque XXE se enseña muchas veces con demos de lectura local
Entonces el equipo asocia el tema solo a eso.

## Porque SSRF es visualmente más fácil de imaginar
Entonces todo el foco se va a “salir del sistema”.

## Porque expansión interna parece menos dramática
Hasta que aparece un problema de disponibilidad o una superficie innecesariamente compleja.

### Idea útil

Lo más peligroso de esta dimensión no es que sea invisible técnicamente.
Es que suele ser invisible en el modelo mental del equipo.

### Regla sana

Si el parser sigue aceptando más complejidad de la que el negocio necesita, hay deuda aunque no haya explotación espectacular.

---

# Parte 11: Qué revisar en código y configuración

Cuando audites una superficie XML ya parcialmente endurecida, conviene mirar:

- si se bloqueó solo resolución externa o también DTD
- si el parser sigue expandiendo entidades
- si el caso de uso necesita algo de eso
- qué límites de recursos o processing siguen vigentes
- si secure processing se está usando como complemento o como excusa
- si DOM, SAX y StAX están alineados o no
- si librerías de terceros mantienen una postura distinta

### Idea importante

En seguridad XML, una mitigación correcta no es siempre la que ya existe, sino la que deja menos superficie sobrante después de aplicarla.

---

# Parte 12: Qué señales indican una postura madura

Una postura más madura suele mostrar:

- capacidad de distinguir claramente “externo” de “interno”
- bloqueo explícito de lo que no hace falta
- menos fe en mitigaciones únicas
- menos complejidad XML permitida por costumbre
- menos dependencia en DTD o entidades donde el negocio no las necesita
- revisión de disponibilidad además de lectura local y SSRF

### Regla sana

La madurez se nota cuando el equipo no se conforma con cortar lo más obvio, sino que sigue achicando la superficie hasta alinearla con el valor real del flujo.

---

# Parte 13: Qué señales indican una postura floja

Estas señales merecen revisión fuerte:

- “ya apagamos entidades externas, así que listo”
- nadie sabe si DTD sigue viva
- nadie revisa expansión o complejidad interna
- secure processing se usa como argumento de cierre
- el parser sigue aceptando más lenguaje XML del necesario
- el equipo solo piensa en exfiltración y no en DoS o complejidad sobrante

### Idea importante

Una defensa floja no siempre es la que no hizo nada.
A veces es la que hizo algo importante y luego dejó de mirar demasiado pronto.

---

## Qué revisar en una app Spring

Cuando revises entidades externas vs expansión interna en una aplicación Spring o Java, mirá especialmente:

- si el parser aún acepta `DOCTYPE`
- si hay entidades externas deshabilitadas pero otras capacidades XML siguen vivas
- si el flujo necesita realmente esas capacidades
- qué impacto te preocupa más: lectura local, SSRF o DoS
- qué workers o librerías procesan ese XML
- qué límites de recursos existen
- si el equipo puede explicar claramente qué parte del riesgo ya cortó y cuál sigue abierta

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- separación mental clara entre resolución externa y expansión interna
- menos lenguaje XML aceptado por default
- bloqueo de `DOCTYPE` cuando no hace falta
- parsers más estrechos
- mejor atención a DoS y complejidad interna
- menos cierre prematuro después de una mitigación parcial

### Idea importante

La madurez aquí se nota cuando el equipo no confunde “ya no sale afuera” con “ya no hay nada importante que revisar”.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- el equipo usa “entidades” como si todo fuera lo mismo
- no se distingue qué parte del riesgo es externa y cuál interna
- la mitigación se declara completa demasiado pronto
- nadie sabe si el parser sigue expandiendo cosas innecesarias
- la dimensión de DoS quedó fuera del análisis
- el caso de uso sigue aceptando más complejidad XML de la necesaria

### Regla sana

Si no podés explicar qué superficie quedó viva después de bloquear entidades externas, probablemente todavía te falte modelar mejor el parser.

---

## Checklist práctica

Cuando bloquees entidades externas, preguntate:

- ¿qué riesgo estoy cortando exactamente?
- ¿qué parte del parser sigue viva igual?
- ¿DTD sigue activa?
- ¿hay expansión o complejidad interna innecesaria?
- ¿el flujo necesita realmente esa parte del lenguaje XML?
- ¿qué riesgo de DoS o procesamiento excesivo queda todavía?
- ¿qué otra reducción de superficie podría hacer ahora?

---

## Mini ejercicio de reflexión

Tomá un flujo XML de tu app Spring y respondé:

1. ¿Qué mitigación actual bloquea resolución externa?
2. ¿Qué parte del riesgo sigue viva igual?
3. ¿DTD sigue habilitada?
4. ¿El parser acepta más complejidad de la necesaria?
5. ¿Qué impacto te preocuparía más ahora: SSRF, lectura local o DoS?
6. ¿Qué reducción de superficie podrías hacer después de bloquear lo externo?
7. ¿Qué parte de este tema te faltaba modelar mejor antes?

---

## Resumen

Distinguir entidades externas de expansión interna ayuda a no sobrerreaccionar ni subestimar mitigaciones parciales.

Bloquear entidades externas corta una parte muy valiosa del riesgo porque evita que el parser:

- lea recursos locales
- haga SSRF
- salga del documento base

Pero eso no significa automáticamente que:

- DTD ya no importe
- la expansión interna haya dejado de existir
- el parser ya sea simple
- ni que el riesgo de DoS o complejidad innecesaria haya desaparecido

En resumen:

> un backend más maduro no confunde el hecho de haber bloqueado resolución externa con haber convertido al parser en una pieza pequeña, pasiva y perfectamente alineada con el caso de uso, sino que sigue preguntándose qué parte del lenguaje XML permanece activa y qué complejidad interna sigue sobrando para ese flujo.  
> Y justamente por eso este tema importa tanto: porque ayuda a distinguir una mitigación muy valiosa de una conclusión demasiado optimista, y a entender que el camino hacia un parseo realmente más seguro no termina cuando el documento deja de sacar al parser hacia afuera, sino cuando también deja de tener permiso para empujarlo a hacer dentro del propio procesamiento mucho más de lo que el negocio realmente necesitaba.

---

## Próximo tema

**DoS por expansión y bomb payloads: intuición sin folklore**
