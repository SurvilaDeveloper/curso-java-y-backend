---
title: "Cómo pensar pruebas más realistas cuando el backend ya tiene contratos, colas, jobs y varios módulos"
description: "Entender por qué un backend Spring Boot con varios módulos, contratos, eventos, jobs y concurrencia necesita una estrategia de pruebas más amplia que simples tests aislados, y cómo pensar mejor qué validar en cada nivel del sistema."
order: 104
module: "Microservicios y sistemas distribuidos"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo pensar:

- despliegue continuo
- releases
- cambios seguros
- compatibilidad temporal
- migraciones en etapas
- rollouts graduales
- feature flags
- readiness
- convivencia entre versiones

Eso ya te dejó una idea muy importante:

> cuando el backend ya es un sistema con varias piezas vivas, cambiarlo con seguridad no depende solo de escribir buen código, sino también de introducir los cambios de forma compatible, observable y operativamente razonable.

Pero en cuanto el sistema llega a ese nivel de complejidad, aparece una pregunta igual de importante:

> ¿cómo probás de verdad que ese backend se va a comportar bien?

Porque al principio puede parecer que con algunos tests unitarios alcanza:

- probás un service
- probás un mapper
- probás un repository
- corrés build
- listo

Y eso aporta muchísimo.
Pero a medida que el backend empieza a tener:

- varios módulos
- contratos internos
- APIs
- colas
- jobs
- eventos
- concurrencia
- caché
- integraciones
- webhooks
- consumers
- distintas formas de despliegue

la pregunta de “qué significa probar bien” se vuelve bastante más rica.

Ahí aparecen ideas muy importantes como:

- **tests unitarios**
- **tests de integración**
- **tests de contrato**
- **tests de flujo**
- **tests de concurrencia**
- **pruebas de jobs y asincronía**
- **estrategia de confianza por niveles**

Este tema es clave porque un backend maduro ya no puede apoyarse solo en la esperanza de que, si cada clase aislada pasa sus tests, entonces todo el sistema completo se comportará bien por arte de magia.

## El problema de confiar solo en pruebas demasiado pequeñas

Cuando uno empieza, es muy común pensar algo así:

- si mis métodos funcionan
- y mis services pasan
- entonces el backend debería estar bien

Ese enfoque sirve mucho para empezar.
Pero empieza a quedarse corto cuando los errores reales viven en lugares como:

- integración entre módulos
- contratos incompatibles
- jobs que corren en otro momento
- consumers que procesan mensajes después
- payloads mal entendidos
- estados concurrentes
- cambios de versionado
- caches viejas
- migraciones
- deploys con convivencia entre versiones

En todos esos casos, puede pasar algo muy incómodo:

> cada pieza aislada parece correcta, pero el sistema falla igual en la interacción.

Y ahí aparece la necesidad de una estrategia de pruebas más amplia.

## Qué significa una estrategia de pruebas más realista

No significa testear absolutamente todo en todos los niveles.
Tampoco significa llenar el proyecto de tests lentos e inútiles.

Primero conviene entenderlo así:

> una estrategia de pruebas más realista reconoce que distintos tipos de riesgo viven en distintos niveles del sistema, y que no todos se detectan con la misma clase de test.

Esa idea es importantísima.

Porque te obliga a preguntar:

- ¿qué riesgo quiero detectar?
- ¿en qué nivel vive ese riesgo?
- ¿qué tipo de prueba lo ve mejor?

No toda prueba sirve para todo.

## Una intuición muy útil

Podés pensar así:

### Test unitario
Me ayuda a validar lógica pequeña y aislada.

### Test de integración
Me ayuda a validar que varias piezas reales colaboran correctamente.

### Test de contrato
Me ayuda a validar que productor y consumidor siguen entendiendo lo mismo.

### Test de flujo o end-to-end más acotado
Me ayuda a validar que una historia relevante del sistema no se rompe al recorrer varias capas.

### Test de concurrencia o asincronía
Me ayuda a detectar problemas que no aparecen en ejecución lineal feliz.

Esta clasificación mental ya ordena muchísimo.

## Qué siguen aportando los tests unitarios

Siguen siendo muy valiosos.

Por ejemplo, sirven mucho para:

- reglas del dominio
- validaciones
- mappers
- lógica de transiciones
- cálculos
- decisiones puras
- pequeñas piezas donde querés feedback rápido

Esto sigue siendo importantísimo.
No se trata de abandonar los tests unitarios.

Al contrario:
son una base excelente.

Pero no conviene pedirles que detecten problemas que no viven en su nivel.

## Qué tipo de errores detectan muy bien

Por ejemplo:

- una transición de estado inválida
- un cálculo mal hecho
- un mapper roto
- una validación de negocio incorrecta
- una política de autorización local mal aplicada
- una regla de expiración mal expresada
- una semántica de dominio equivocada

Todo eso es oro.
Y cuanto más claro esté el dominio, más valor suelen darte estas pruebas.

## Qué tipo de errores suelen escapárseles

Por ejemplo:

- un contrato JSON incompatible
- un job que se pisa con otro
- un consumer que ya no entiende el mensaje nuevo
- un endpoint que serializa distinto a lo esperado
- una configuración real mal cargada
- una query o transacción con comportamiento distinto al imaginado
- un flujo que falla por timing
- un problema de caché o concurrencia
- una migración que rompe convivencia entre versiones

Ahí ya necesitás otras clases de prueba.

## Qué es un test de integración, en este contexto

Dicho simple:

> es una prueba que deja colaborar a varias piezas reales del sistema para verificar que juntas funcionan como se espera.

Eso puede significar, por ejemplo:

- controller + service + repository
- service + base real o controlada
- producer + contrato real
- job + persistencia
- endpoint + serialización
- módulo + dependencia interna real

No hace falta que un test de integración levante “todo el universo”.
La idea importante es que prueba interacción real entre componentes relevantes.

## Por qué estos tests ganan valor cuando el backend crece

Porque muchas roturas reales aparecen justo en la fricción entre capas.

Por ejemplo:

- el controller recibe bien, pero serializa raro
- el service calcula bien, pero la persistencia no refleja lo esperado
- la query funciona distinto sobre base real
- el DTO no coincide con lo que el consumidor asumía
- el evento se publica con una forma distinta a la esperada

Todo eso suele aparecer mucho mejor en integración que en un test demasiado aislado.

## Un ejemplo muy claro

Supongamos un flujo de checkout.

Quizá no alcanza con probar:

- el cálculo del total
- el mapper del payment command
- el cambio de estado del pedido

por separado.

También puede ser muy valioso probar algo como:

1. entra request de iniciar checkout
2. se carga pedido real
3. se valida estado
4. se persiste intento
5. se genera response
6. queda el estado esperado en base

Ese tipo de prueba te da una confianza distinta y muy útil.

## Qué son los tests de contrato

Este punto se vuelve especialmente valioso en sistemas más distribuidos.

Podés pensarlo así:

> un test de contrato ayuda a validar que dos partes que se comunican siguen compartiendo el mismo entendimiento del mensaje, request o respuesta.

Por ejemplo:

- un producer emite un evento
- un consumer lo entiende
- un servicio expone un payload interno
- un BFF lo consume
- un módulo espera cierta estructura
- una API interna devuelve cierta semántica

Ya viste que estos contratos pueden romper bastante aunque todo “compile”.
Por eso este tipo de pruebas gana tanto valor.

## Un ejemplo simple de contrato

Supongamos que `orders` emite:

```json
{
  "orderId": 1042,
  "status": "PENDING"
}
```

y `notifications` depende de eso.

Un test de contrato puede ayudarte a detectar antes si alguien cambió:

- nombres
- tipos
- estructura
- semántica básica esperada

Eso es muchísimo mejor que enterarte en producción.

## Qué relación tiene esto con compatibilidad entre versiones

Muy fuerte.

En los temas anteriores viste que puede haber convivencia entre:

- producer viejo y consumer nuevo
- producer nuevo y consumer viejo
- payloads viejos y nuevos
- instancias de distintas versiones durante un rollout

Entonces probar compatibilidad ya no es un lujo.
Empieza a ser una parte real de la seguridad del cambio.

## Qué relación tiene esto con jobs y procesos periódicos

También muy fuerte.

Muchos bugs importantes no viven en endpoints públicos, sino en:

- jobs que se pisan
- jobs que fallan a mitad
- jobs que procesan más de una vez
- jobs que dejan estados inconsistentes
- batches que no respetan filtros
- tareas de limpieza que borran demasiado
- reconciliaciones que no distinguen estados

Ese tipo de cosas no suele quedar bien cubierto si solo probás controllers o servicios aislados.

Entonces conviene pensar pruebas que validen:

- qué procesa el job
- qué no procesa
- qué pasa si vuelve a correr
- qué pasa si falla a mitad
- qué deja persistido
- qué métrica o estado refleja

Eso ya es una visión mucho más realista del backend.

## Qué relación tiene esto con concurrencia

Absolutamente central.

Una prueba lineal feliz rara vez te va a mostrar:

- lost updates
- carreras
- pisado de estados
- conflictos de locking
- transiciones simultáneas inválidas

Y sin embargo esos son riesgos muy reales en backend serio.

No significa que vayas a tener mil tests complejísimos de concurrencia.
Pero sí conviene identificar flujos donde una prueba más agresiva o al menos más pensada tenga valor real.

Por ejemplo:

- stock
- reservas
- pagos
- cambios de estado sensibles
- jobs + requests tocando el mismo recurso
- webhooks + procesos internos sobre la misma entidad

## Un ejemplo mental útil

No alcanza con preguntar:

- “¿este método funciona?”

A veces también tenés que preguntar:

- “¿qué pasa si dos operaciones válidas intentan hacer esto casi al mismo tiempo?”

Esa pregunta ya te lleva a otro nivel de prueba.

## Qué relación tiene esto con colas, brokers y consumidores

Muy fuerte también.

Porque en mensajería hay riesgos como:

- mensaje duplicado
- retry
- consumidor lento
- backlog
- mensaje mal formado
- evento fuera de orden
- payload incompatible
- dead letter

Muchos de esos riesgos necesitan pruebas distintas a las típicas de request-response.

Por ejemplo, puede tener mucho valor probar:

- que el consumer sea idempotente
- que el mensaje repetido no duplique efecto
- que un payload incompleto se maneje bien
- que un mensaje viejo no rompa transiciones
- que cierta incompatibilidad se detecte antes

## Qué relación tiene esto con caché y proyecciones

También importa bastante.

Si una pantalla o un endpoint depende de una proyección o caché, puede ser muy valioso probar cosas como:

- se invalida cuando corresponde
- no muestra datos imposibles
- la proyección converge correctamente
- una actualización importante se refleja con el delay esperado
- una recomputación no rompe ownership ni semántica

Estos riesgos tampoco aparecen siempre en un test puramente local o de método.

## Qué pasa con los tests end-to-end

A nivel intuitivo, son pruebas más cercanas a una historia real completa del sistema.

Pueden ser muy valiosas, porque validan si una funcionalidad de punta a punta realmente funciona.

Pero también suelen ser:

- más lentas
- más frágiles
- más caras de mantener
- más difíciles de diagnosticar cuando fallan

Por eso muchas veces conviene usarlas con criterio:
no para cubrir todo el sistema, sino para cubrir flujos muy importantes donde una validación de punta a punta aporta muchísimo.

## Una estrategia mental sana

Podés pensar algo así:

- muchas pruebas unitarias para reglas pequeñas y feedback rápido
- algunas pruebas de integración muy bien elegidas
- pruebas de contrato donde haya comunicación entre piezas sensibles
- algunas pruebas más cercanas a flujo completo para historias críticas
- pruebas específicas para concurrencia o asincronía donde el riesgo lo justifique

Esto suele ser mucho más sano que:

- probar solo clases aisladas
- o querer probar todo por end-to-end

## Qué relación tiene esto con velocidad del feedback

Muy importante.

No todas las pruebas deberían tardar lo mismo ni correr en el mismo momento.

Conviene valorar mucho:

- feedback rápido para errores pequeños
- confianza más profunda para integraciones sensibles
- un equilibrio entre costo y cobertura de riesgo

Porque una suite de pruebas que tarda una eternidad y nadie confía también es un problema.

## Qué relación tiene esto con releases seguros

Absolutamente total.

En el tema anterior viste que desplegar seguro implica convivencias, compatibilidad y cambios graduales.

Bueno:
toda esa estrategia necesita pruebas que reflejen esos riesgos.

Por ejemplo:

- ¿el payload viejo y nuevo conviven?
- ¿el consumer viejo tolera el producer nuevo?
- ¿la migración de base no rompe lectura?
- ¿el job sigue funcionando con estados intermedios?
- ¿el rollout parcial mantiene consistencia razonable?

Sin eso, el release seguro se apoya demasiado en intuición.

## Qué relación tiene esto con observabilidad

Muy fuerte.

A veces cierta clase de fallos es tan difícil de reproducir que ni siquiera una prueba te va a cubrir todo.
Por eso, en sistemas más complejos, pruebas y observabilidad se vuelven muy complementarias.

Las pruebas te ayudan a prevenir mucho.
La observabilidad te ayuda a descubrir lo que igual se escapó o solo ocurre bajo condiciones reales.

No conviene pensar una sin la otra.

## Qué no conviene hacer

No conviene:

- confiar solo en tests unitarios cuando los riesgos reales viven en integración o asincronía
- hacer solo tests end-to-end gigantes y frágiles
- no testear contratos internos porque “son internos”
- ignorar jobs, colas o concurrencia en la estrategia de pruebas
- medir valor de una prueba solo por cantidad y no por el riesgo real que cubre
- simular tanto todo que nunca pruebes interacción real donde más importa

Ese tipo de decisiones suele dejar huecos justo en las zonas más delicadas.

## Otro error común

Pensar que “si compila y los tests unitarios pasan”, entonces el backend complejo está cubierto.
A esta altura del sistema, eso ya suele ser una confianza demasiado optimista.

## Otro error común

Querer una cobertura perfecta uniforme de todo.
No todos los puntos del sistema tienen el mismo riesgo.
La clave está en probar mejor donde más duele romperse.

## Otro error común

No distinguir entre:
- probar lógica del dominio
- probar colaboración entre piezas
- probar compatibilidad de contratos
- probar comportamiento bajo concurrencia o asincronía

Cada una de esas cosas merece un tipo de prueba distinto.

## Una buena heurística

Podés preguntarte:

- ¿qué riesgo real estoy intentando detectar con esta prueba?
- ¿este riesgo vive en una clase aislada o en la interacción entre varias?
- ¿hay contratos internos sensibles que deberían validarse explícitamente?
- ¿este flujo tiene riesgo de concurrencia, retries o asincronía?
- ¿qué historia crítica del sistema merece una prueba de punta a punta?
- ¿estoy teniendo feedback rápido y también confianza realista, o solo una de las dos cosas?

Responder eso te ayuda muchísimo a construir una estrategia de pruebas más madura.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque a esta altura del backend ya no estás probando una app simple con pocos endpoints y poca infraestructura alrededor.
Estás probando un sistema con:

- varios módulos
- varios tipos de comunicación
- jobs
- colas
- contratos internos
- caches
- eventos
- releases graduales
- estado concurrente
- cambios sensibles

Y en ese contexto, una estrategia de pruebas pobre deja demasiadas zonas críticas libradas a la suerte.

## Relación con Spring Boot

Spring Boot puede ayudarte muchísimo a estructurar y ejecutar muchas de estas pruebas.
Pero, otra vez, el framework no decide por vos:

- qué nivel de riesgo tiene cada parte
- qué flujos merecen integración real
- qué contratos necesitan protección
- dónde conviene invertir pruebas de concurrencia
- qué jobs o consumers son demasiado críticos como para no probarlos en serio

Eso sigue siendo diseño de backend y criterio de ingeniería.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> cuando el backend ya tiene contratos, concurrencia, colas, jobs y varios módulos, probar bien deja de significar solo testear clases aisladas y pasa a exigir una estrategia por niveles, donde cada tipo de prueba cubra el riesgo que realmente vive en ese nivel del sistema: reglas del dominio, integración entre piezas, compatibilidad de contratos, asincronía y flujos críticos de punta a punta.

## Resumen

- Un backend complejo necesita una estrategia de pruebas más amplia que simples tests unitarios.
- Los riesgos reales del sistema viven en distintos niveles y no todos se detectan igual.
- Tests unitarios siguen siendo muy valiosos, pero no cubren por sí solos integración, contratos o concurrencia.
- Jobs, colas, consumidores y eventos también deben entrar en la estrategia de prueba.
- Los tests de contrato y de integración ganan mucho valor cuando hay varias piezas comunicándose.
- No conviene ni confiar solo en lo pequeño ni intentar cubrir todo con end-to-end gigantes.
- Este tema cierra muy bien la idea de backend como sistema: no solo hay que diseñarlo y operarlo, también hay que construir confianza realista sobre su comportamiento.

## Próximo tema

En el próximo tema vas a ver cómo seguir creciendo hacia observabilidad, operación y debugging más profesional cuando ya existen varios servicios o flujos complejos, porque después de probar mejor el sistema, todavía necesitás saber entenderlo cuando algo raro pasa en producción.
