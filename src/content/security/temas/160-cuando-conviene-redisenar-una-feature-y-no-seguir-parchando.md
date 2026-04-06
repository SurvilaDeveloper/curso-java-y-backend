---
title: "Cuándo conviene rediseñar una feature y no seguir parchando"
description: "Cómo reconocer cuándo una feature con riesgo de SSRF en una aplicación Java con Spring Boot necesita rediseño y no más parches. Qué señales muestran que el problema ya no es una validación puntual, sino un contrato saliente demasiado amplio, genérico o difícil de defender."
order: 160
module: "Consumo saliente, SSRF y conexiones externas"
level: "base"
draft: false
---

# Cuándo conviene rediseñar una feature y no seguir parchando

## Objetivo del tema

Entender **cuándo conviene rediseñar una feature** con riesgo de **SSRF** y no seguir acumulando parches en una aplicación Java + Spring Boot.

La idea de este tema es continuar naturalmente lo que vimos en el tema anterior.

Ya vimos que hay muchos fixes que:

- bloquean una variante
- rompen un PoC
- agregan una regex
- endurecen una blacklist
- esconden un error
- o suman una validación puntual

y, aun así, dejan al feature con casi la misma forma riesgosa.

Entonces aparece una pregunta muy importante:

> ¿en qué momento deja de tener sentido seguir parchando y pasa a ser más sano rediseñar el feature?

Esa pregunta importa muchísimo porque, en seguridad, no todo problema merece una reescritura.
Pero tampoco todo problema se deja corregir bien con una colección infinita de condiciones locales.

En resumen:

> conviene rediseñar una feature cuando el riesgo ya no vive principalmente en una omisión puntual, sino en el contrato mismo del feature: demasiada libertad de destino, demasiada genericidad, demasiada confianza implícita o demasiada dependencia de que todo se use siempre de forma perfecta.

---

## Idea clave

La diferencia entre **parchar** y **rediseñar** no está en el tamaño del cambio.
Está en **qué capa del problema estás corrigiendo**.

### Parche
Apunta a:
- una variante
- una omisión
- una representación concreta
- un punto local del flujo

### Rediseño
Apunta a:
- la forma del feature
- el contrato saliente
- la cantidad de libertad que tiene
- la separación de responsabilidades
- el contexto donde corre
- la confianza que se le da a cada paso

La idea central es esta:

> si el problema reaparece cada vez con otra cara, probablemente ya no tengas un bug aislado: tenés un diseño demasiado flexible o demasiado poderoso para el tipo de feature que estás intentando ofrecer.

### Idea importante

Un rediseño no significa “tirar todo”.
Significa reconocer que el riesgo ya no se arregla bien tocando solo el borde visible del caso más reciente.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- seguir sumando fixes locales sobre una feature estructuralmente riesgosa
- postergar indefinidamente un rediseño necesario por comodidad de corto plazo
- interpretar cada nuevo hallazgo como una excepción aislada
- no ver que la complejidad defensiva está creciendo más rápido que el valor del feature
- mantener vivo un contrato saliente que el sistema no puede defender bien de forma estable
- confundir “todavía se puede parchear” con “todavía conviene parchear”

Es decir:

> el problema no es parchar alguna vez.  
> El problema es seguir parchando una feature cuyo diseño base sigue entregando demasiada libertad, demasiada red o demasiada confianza para lo que el negocio realmente necesita.

---

## Error mental clásico

Un error muy común es este:

### “Todavía podemos arreglarlo con una validación más”

Técnicamente, muchas veces eso es cierto.
Siempre se puede intentar una validación más.

El problema es otro:
- **¿sigue siendo una estrategia razonable?**

Porque llega un punto donde el feature depende de demasiadas cosas al mismo tiempo:

- parseo correcto
- allowlist bien mantenida
- redirects controlados
- DNS considerado
- worker correcto
- cliente HTTP bien usado
- logs prudentes
- errores sobrios
- budgets acotados
- egress correcto
- privilegios mínimos

### Idea importante

Cuando sostener la seguridad del feature exige acertar demasiadas decisiones a la vez, el diseño ya empezó a pedir rediseño.

---

## Primera gran señal: el hallazgo reaparece con variantes hermanas

Esta suele ser una de las señales más claras.

Hoy corregís:
- `localhost`

mañana aparece:
- un redirect

después:
- otra representación del destino

después:
- otro flujo hermano con el mismo wrapper

después:
- un worker distinto que hace casi lo mismo

### Qué te está diciendo eso

No necesariamente que el equipo “trabaja mal”.
Sino que la clase de problema sigue viva porque el feature o la infraestructura siguen demasiado abiertos.

### Regla sana

Si el mismo riesgo reaparece en formas emparentadas, probablemente estás viendo un problema de diseño, no solo de validación puntual.

---

## Segunda gran señal: el feature necesita demasiadas excepciones para seguir funcionando

Otra alarma muy fuerte es esta:

- hay que permitir algunos redirects, pero no otros
- algunos subdominios sí, otros no
- algunos puertos sí, otros solo en ciertos tenants
- algunos headers pueden pasar, otros no
- algunas URLs sirven solo si no hacen tal cosa
- algunos flows usan otro worker “porque este no alcanza”

### Idea importante

Cuando defender una feature requiere una matriz de excepciones cada vez más rara, suele ser señal de que el contrato original es demasiado amplio o demasiado ambiguo.

### Regla sana

Si el sistema necesita demasiadas reglas especiales para que un feature siga siendo usable y seguro a la vez, quizás el problema sea el feature, no solo la política que lo rodea.

---

## Tercera gran señal: el cliente HTTP se volvió una navaja suiza

Esto conecta con varios temas anteriores.

Un patrón muy claro de necesidad de rediseño es cuando el equipo intenta sostener el riesgo agregando controles arriba de un cliente o wrapper que sigue siendo capaz de:

- ir a cualquier URL
- usar cualquier método
- pasar casi cualquier header
- seguir redirects
- reintentar
- hablar con muchos tipos de destinos
- funcionar para webhooks, previews y downloads al mismo tiempo

### Idea útil

Si todo depende de que cada llamador use bien una herramienta demasiado poderosa, el diseño ya se volvió frágil por definición.

### Regla sana

Cuando el problema principal es la genericidad del brazo saliente, el rediseño suele pasar por dividirlo, no por seguir poniéndole guardias encima.

---

## Cuarta gran señal: el impacto alto viene del runtime, no del string

A veces la severidad del hallazgo depende mucho más de:

- el worker
- la identidad
- la reachability
- la metadata cloud
- el egress
- los servicios internos alcanzables

que del detalle puntual del input.

En esos casos, seguir parcheando la URL o el parseo ayuda, pero toca solo una parte del problema.

### Idea importante

Si el riesgo alto existe porque la feature corre en un proceso demasiado poderoso, quizá el cambio correcto no sea “otra validación más”, sino mover la feature, separarla o redimensionar su contexto de ejecución.

---

## Quinta gran señal: la review ya no entra en una sola cabeza

Esto también es muy real.

Hay features que llegan a un punto donde para saber si siguen siendo “seguras” alguien tiene que tener presente al mismo tiempo:

- parseo
- DNS
- redirects
- allowlists
- workers
- proxies internos
- feedback de error
- logging
- identities
- egress
- pipelines posteriores

### Idea útil

Cuando el análisis del feature ya depende de demasiada memoria distribuida, el diseño está perdiendo claridad operativa.

### Regla sana

Si sostener el feature exige demasiada coordinación mental entre app, infraestructura y seguridad para no romperse, un rediseño puede ser más barato que seguir acumulando complejidad invisible.

---

## Sexta gran señal: el valor de negocio no justifica tanta libertad

Esto es clave y a veces se olvida.

Muchos features nacen con una promesa implícita demasiado grande:

- “pegá cualquier link y te mostramos algo”
- “cargá cualquier callback”
- “descargamos cualquier archivo por vos”
- “probá cualquier endpoint”
- “llamá cualquier proveedor desde esta configuración”

y luego el equipo intenta defender toda esa amplitud.

### Pregunta sana

- ¿el negocio realmente necesita tanto?
- ¿o solo quedó así porque parecía más cómodo, más genérico o más “flexible”?

### Idea importante

Si el valor real del feature es chico pero la libertad que exige defender es enorme, rediseñarlo para hacerlo más estrecho suele ser mejor negocio y mejor seguridad.

---

## Séptima gran señal: los parches ya empeoran mantenibilidad

Hay un punto donde seguir corrigiendo localmente empieza a dejar señales como:

- más ramas condicionales
- más flags
- más listas de excepciones
- más validaciones desparramadas
- más diferencias entre flujos casi iguales
- más confusión en logs y errores
- más riesgo de romper otra cosa al tocar una regla

### Regla sana

Si cada nuevo fix vuelve más difícil razonar el feature, el costo de seguir parchando está subiendo.
Y eso también entra en la decisión de rediseñar.

### Idea importante

La seguridad no se degrada solo cuando falta un control.
También cuando el sistema se vuelve tan difícil de entender que los controles empiezan a contradecirse, a duplicarse o a olvidarse.

---

## Octava gran señal: el hallazgo ya se volvió sistémico, no local

Esto aparece cuando no hay un solo lugar afectado, sino un patrón como:

- varios previews parecidos
- varios downloads remotos
- varios endpoints de test connection
- varios workers usando el mismo wrapper
- varios tenants persistiendo destinos flexibles

### Idea útil

En ese punto, arreglar una pantalla o un service puntual probablemente ya no sea suficiente.

### Regla sana

Cuando el problema se repite por familia de feature, conviene pensar en rediseño por patrón, no en corrección por instancia.

---

## Cuándo sí suele alcanzar con un parche

Tampoco se trata de concluir que todo merece rediseño.

Un parche bien hecho suele alcanzar más cuando:

- el destino ya era bastante fijo
- el caso inseguro fue una omisión puntual
- no hay redirects ni DNS complejos
- el worker tiene poco privilegio
- la red ya contiene bien
- el cliente saliente ya era bastante específico
- la lógica del feature no depende de mucha flexibilidad
- el hallazgo no se repite en flows hermanos

### Idea importante

No hace falta rediseñar por deporte.
Hace falta saber reconocer cuándo el problema vive en el borde y cuándo vive en el centro del feature.

---

## Qué preguntas conviene hacer antes de decidir rediseño

Cuando un hallazgo reaparece o un fix se siente insuficiente, conviene preguntar:

- ¿esto es una omisión puntual o una propiedad del feature?
- ¿cuántas validaciones especiales necesita para sobrevivir?
- ¿cuántas variantes hermanas del problema ya vimos?
- ¿cuánto depende de que cada dev recuerde usar bien la infraestructura saliente?
- ¿el cliente o wrapper sigue siendo demasiado genérico?
- ¿el worker o runtime siguen sobredimensionados?
- ¿el valor de negocio justifica esta flexibilidad?
- ¿seguir parchando hace el sistema más seguro o solo más enredado?
- ¿qué parte del contrato del feature podríamos achicar?
- ¿qué rediseño reduciría más superficie con menos complejidad global?

### Regla sana

La pregunta no es solo:
- “¿podemos parchearlo?”

La pregunta madura es:
- “¿sigue siendo responsable seguir parchándolo?”

---

## Qué formas puede tomar un rediseño

Rediseñar no siempre implica rehacer todo desde cero.
Puede significar, por ejemplo:

- pasar de URL libre a destinos predefinidos
- dividir un wrapper genérico en clientes específicos
- separar preview, webhook y download en componentes distintos
- mover la feature a un worker con menos privilegio
- sacar follow redirects por default
- recortar el tipo de contenido aceptado
- dejar de persistir tanta confianza
- cambiar un “test connection” libre por un flujo mucho más acotado
- reemplazar una promesa general por una más modesta pero defendible

### Idea importante

Rediseñar es volver el feature más chico, más explícito y más defendible.
No necesariamente volverlo más complejo.

---

## Cómo reconocer esta necesidad en una codebase Spring

En una app Spring, conviene sospechar que ya tocó rediseño cuando veas:

- muchos `if` y excepciones alrededor del mismo fetch
- wrappers HTTP usados por demasiadas features distintas
- `RestTemplate` o `WebClient` con múltiples modos y flags
- servicios que mezclan parseo, validación, download y procesamiento
- callbacks, previews y downloads viviendo sobre la misma infraestructura flexible
- workers con mucho poder y poco aislamiento
- fixes repetidos en varios PRs sobre la misma familia de problemas

### Regla sana

Si cada nuevo PR toca el mismo rincón riesgoso para tapar otra variante, probablemente el sistema ya te está pidiendo una solución más estructural.

---

## Qué conviene revisar en una app Spring

Cuando revises si conviene rediseñar una feature y no seguir parchando en una aplicación Spring, mirá especialmente:

- cuántas variantes del problema ya aparecieron
- cuánto creció la complejidad defensiva del flujo
- qué tan genérico sigue siendo el cliente o wrapper saliente
- si el worker o runtime siguen siendo demasiado poderosos
- si el valor de negocio del feature justifica tanta amplitud
- si hay patrones repetidos en otras features hermanas
- qué rediseño achicaría más superficie con mejor mantenibilidad
- qué parte del problema sigue viva aunque el último PoC ya no funcione

---

## Señales de que conviene rediseñar

Estas señales suelen empujar fuerte hacia rediseño:

- hallazgos recurrentes
- demasiadas excepciones
- wrapper demasiado genérico
- dependencia excesiva en “uso correcto”
- impacto alto por worker o runtime
- flexibilidad de negocio difícil de defender
- mantenibilidad en caída
- patrón sistémico y no local

### Idea importante

Cuando varias de estas señales se acumulan, seguir parchando suele ser más una forma de postergar el rediseño que de evitarlo.

---

## Señales de que un parche todavía puede ser suficiente

Estas señales suelen indicar que un parche bien pensado puede alcanzar:

- caso borde aislado
- cliente ya bastante específico
- poco privilegio y poca red
- feature acotada y poco flexible
- buena contención infra
- poca repetición del problema
- corrección pequeña que realmente achica el riesgo sin multiplicar complejidad

### Regla sana

No sobrerreacciones.
Pero tampoco subreacciones cuando el problema ya dejó de ser local.

---

## Checklist práctica

Cuando dudes entre parchear o rediseñar, preguntate:

- ¿el problema es puntual o estructural?
- ¿cuántas variantes hermanas ya vimos?
- ¿cuántas excepciones necesita el feature?
- ¿el wrapper o cliente sigue siendo demasiado genérico?
- ¿el runtime sigue teniendo demasiado poder?
- ¿seguir parchando complica más el sistema?
- ¿el valor del negocio justifica tanta flexibilidad?
- ¿hay un rediseño que vuelva el contrato más chico y claro?
- ¿el hallazgo reaparece en más de un flujo?
- ¿esto necesita un fix o necesita una forma distinta de existir?

---

## Mini ejercicio de reflexión

Tomá una feature saliente real de tu app Spring y respondé:

1. ¿Cuántos fixes de seguridad ya recibió?
2. ¿Qué parte del riesgo sigue viva?
3. ¿El problema está en una omisión o en el contrato del feature?
4. ¿Cuántas excepciones o flags necesita hoy?
5. ¿El worker o wrapper siguen demasiado poderosos?
6. ¿Qué promesa del feature podrías hacer más chica?
7. ¿Qué rediseño reduciría más superficie con menos deuda futura?

---

## Resumen

Conviene rediseñar una feature y no seguir parchando cuando el riesgo ya no vive principalmente en un detalle puntual, sino en la forma misma del feature:

- demasiada libertad de destino
- demasiada genericidad
- demasiadas excepciones
- demasiado poder en el runtime
- demasiada dependencia en “uso correcto”
- demasiada repetición de hallazgos hermanos

En resumen:

> un backend más maduro no mide el éxito de una remediación solo por cuántas variantes del último caso logra bloquear, sino también por cuánto se simplifica, se estrecha y se vuelve defendible el contrato real del feature.  
> Y cuando ese contrato sigue pidiendo demasiada flexibilidad para demasiado poco valor, o cuando los parches se acumulan sin cambiar la forma del problema, la decisión más responsable deja de ser “agregar un control más” y pasa a ser rediseñar la feature para que deje de depender de una conectividad, una genericidad o una confianza que el sistema claramente no está pudiendo sostener de forma sana con el paso del tiempo.

---

## Próximo tema

**Cierre del bloque: principios duraderos para consumo saliente seguro**
