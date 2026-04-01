---
title: "Documentación técnica y ADRs"
description: "Qué documentación técnica realmente vale la pena mantener en backend, cómo evitar documentos muertos, para qué sirven los ADRs y cómo usarlos para registrar decisiones de arquitectura, contexto, alternativas y trade-offs con criterio profesional."
order: 242
module: "Cloud, despliegue, carrera y proyecto final"
level: "intermedio"
draft: false
---

## Introducción

Cuando un sistema crece, aparece una tensión muy común:

- el código cambia rápido
- la arquitectura evoluciona
- entran personas nuevas
- se toman decisiones importantes
- y al poco tiempo nadie recuerda bien **por qué** ciertas cosas fueron hechas de cierta manera

Entonces empiezan las frases típicas:

- “esto se hizo así por algo, pero no me acuerdo por qué”
- “creo que habíamos descartado esa opción”
- “no sé si esto es una restricción real o una costumbre vieja”
- “el código actual no me deja claro cuál era la intención”
- “el diagrama está viejo”

Ahí es donde la documentación técnica deja de ser algo decorativo y pasa a tener valor real.

Pero también hay una trampa importante.

Mucha documentación termina siendo inútil porque:

- está desactualizada
- intenta documentarlo todo
- repite lo que ya dice el código
- nadie sabe dónde está
- nadie la usa para tomar decisiones

Entonces el punto no es “documentar mucho”.

El punto es **documentar lo correcto, con el nivel de detalle correcto, y para resolver problemas reales del trabajo técnico**.

Dentro de esa idea, los **ADRs (Architecture Decision Records)** son una herramienta especialmente valiosa.

Porque ayudan a registrar algo que suele perderse muy rápido:

**el razonamiento detrás de una decisión arquitectónica.**

De eso trata esta lección.

## Qué problema resuelve la documentación técnica

La documentación técnica existe para reducir fricción.

Fricción para:

- entender el sistema
- cambiarlo con seguridad
- operarlo correctamente
- incorporar gente nueva
- alinear equipos
- revisar decisiones
- y evitar que el conocimiento importante quede encerrado en unas pocas personas

Una buena documentación no reemplaza al código.

Lo complementa.

Sirve para responder preguntas que el código por sí solo no siempre responde bien, por ejemplo:

- cuál es la responsabilidad de cada módulo
- qué contratos externos existen
- qué flujo de negocio es crítico
- qué dependencias operativas tiene el sistema
- qué supuestos condicionan el diseño
- por qué se eligió una alternativa y no otra
- qué limitaciones actuales se aceptaron conscientemente

Cuando esta información no está, el costo aparece después:

- cambios más lentos
- más errores de interpretación
- discusiones repetidas
- onboarding más costoso
- y decisiones nuevas tomadas sin contexto previo

## Documentar no es comentar todo el código

Éste es un error clásico.

A veces se cree que “documentar” significa llenar el código de comentarios o escribir documentos larguísimos que describen cada clase.

Eso casi nunca funciona bien.

¿Por qué?

Porque hay cosas que el propio código ya expresa mejor:

- nombres de funciones
- firmas
- tipos
- estructura básica
- tests
- validaciones locales

Si la documentación repite eso, envejece rápido y aporta poco.

La documentación técnica útil suele enfocarse más en preguntas como:

- qué hace este subsistema dentro del producto
- cómo se relaciona con otros
- qué flujo atraviesa varios componentes
- dónde están los límites
- qué decisiones se tomaron y por qué
- qué riesgos o restricciones siguen vigentes

O sea:

**menos espejo del código, más contexto del sistema.**

## Qué cosas sí conviene documentar en backend

No existe una lista única universal, pero hay categorías que suelen tener mucho valor.

### 1. Visión general del sistema

Una explicación de alto nivel sobre:

- qué resuelve el sistema
- cuáles son sus componentes principales
- cómo se relacionan
- qué partes son core
- qué dependencias externas existen

Esto sirve muchísimo para onboarding y para conversaciones de arquitectura.

### 2. Flujos críticos

Algunos flujos merecen documentación específica, por ejemplo:

- login y gestión de identidad
- checkout
- creación y actualización de órdenes
- sincronización con ERP
- billing recurrente
- procesamiento de eventos
- exportaciones grandes

En esos casos ayuda documentar:

- qué dispara el flujo
- qué componentes participan
- dónde se persiste el estado principal
- qué parte es síncrona y cuál asíncrona
- qué errores o compensaciones existen

### 3. Contratos e integraciones

Cuando un sistema depende de otros o expone interfaces a terceros, conviene dejar claro:

- qué contrato existe
- qué versión está vigente
- qué supuestos tiene
- qué comportamiento es estable
- qué incompatibilidades pueden romper consumidores

### 4. Operación

Hay conocimiento operativo que conviene dejar escrito:

- cómo se despliega
- cómo se configura por ambiente
- cómo se hacen migraciones
- cómo se hace rollback
- qué alertas importan
- cómo diagnosticar fallos comunes

### 5. Decisiones importantes

Y acá entran los ADRs.

Porque muchas decisiones no viven bien ni en comentarios de código ni en un README general.

## El problema de las decisiones que nadie registra

En sistemas vivos se toman muchísimas decisiones como:

- usar cola o request síncrono
- separar o no un servicio
- introducir cache o evitarlo
- elegir PostgreSQL o un motor distinto
- mantener consistencia fuerte en una operación
- partir reporting hacia otro almacenamiento
- versionar un contrato
- usar polling o webhooks
- centralizar autenticación
- adoptar multitenancy de cierto tipo

El problema es que, si esas decisiones no se registran, a los pocos meses suelen pasar dos cosas.

La primera:

**la decisión sigue existiendo en el sistema, pero desaparece su justificación.**

La segunda:

**la discusión vuelve a abrirse sin contexto, como si nunca hubiera ocurrido.**

Eso no siempre es malo.
Revisar decisiones a veces es correcto.

Lo malo es revisarlas sin saber:

- qué problema original resolvían
- qué alternativas se evaluaron
- qué restricciones existían
- y qué trade-offs se aceptaron conscientemente

## Qué es un ADR

ADR significa **Architecture Decision Record**.

Es un documento breve que registra una decisión técnica importante.

No intenta describir todo el sistema.

Registra algo más puntual:

- una decisión
- su contexto
- las alternativas consideradas
- y la razón por la cual se eligió una opción

Un ADR no es un ensayo.
Tampoco un ticket suelto.
Y no debería ser un documento gigante.

Su valor está en capturar lo esencial de manera clara y durable.

## Para qué sirven los ADRs

Los ADRs sirven para varias cosas al mismo tiempo.

### 1. Preservar contexto

Cuando alguien vea una decisión meses después, puede entender:

- qué problema había
- qué opciones se pensaron
- por qué ganó una opción concreta

### 2. Reducir discusiones repetidas

No porque “el ADR cierre todo para siempre”, sino porque evita reiniciar desde cero una conversación ya recorrida.

### 3. Facilitar onboarding

Una persona nueva entiende mucho mejor el sistema si puede leer no solo lo que existe, sino también las decisiones que lo moldearon.

### 4. Mejorar la calidad de las decisiones

Saber que una decisión va a quedar escrita suele obligar a pensarla mejor.

Hace más visible:

- el problema real
- las alternativas
- los riesgos
- y los criterios de elección

### 5. Hacer trazable la evolución

Con el tiempo, los ADRs muestran cómo fue cambiando el sistema.

Eso ayuda a ver:

- qué decisiones siguen vigentes
- cuáles fueron superadas
- qué supuestos cambiaron
- y qué tensiones fueron apareciendo

## Qué decisiones merecen un ADR

No todo merece un ADR.

Si registraras absolutamente todo, el sistema se llenaría de ruido.

Suelen merecer ADR las decisiones que:

- afectan arquitectura o diseño global
- condicionan varios módulos o equipos
- introducen una dependencia importante
- cambian cómo se opera el sistema
- tienen trade-offs relevantes
- podrían ser discutidas de nuevo más adelante
- o serían difíciles de reconstruir solo leyendo el código

Por ejemplo, sí podría merecer ADR:

- adoptar arquitectura monolítica modular en lugar de microservicios
- elegir estrategia de multitenancy
- separar read models para reporting
- usar eventos para integraciones externas críticas
- introducir un API Gateway
- definir política de versionado de contratos
- mover archivos a almacenamiento externo
- elegir mecanismo de autenticación centralizado

Probablemente no merezca ADR:

- renombrar una clase
- mover una carpeta
- cambiar un mapper menor
- ajustar un timeout pequeño sin impacto sistémico

## Una estructura simple y muy útil para ADRs

No hay un único formato obligatorio, pero una estructura simple suele alcanzar muy bien:

### Título

Una frase clara sobre la decisión.

Por ejemplo:

- “Adoptar PostgreSQL como base transaccional principal”
- “Usar outbox pattern para publicación de eventos externos”
- “Mantener monolito modular en esta etapa del producto”

### Estado

Puede ser algo como:

- propuesto
- aceptado
- reemplazado
- deprecado

Esto ayuda mucho a entender si la decisión sigue vigente.

### Contexto

Qué problema, restricción o situación motivó la decisión.

Acá conviene escribir:

- qué estaba pasando
- qué necesidades existían
- qué limitaciones había
- por qué hacía falta decidir algo

### Decisión

La decisión concreta, escrita sin rodeos.

### Alternativas consideradas

Qué otras opciones se evaluaron y por qué no fueron elegidas.

### Consecuencias

Qué beneficios, costos, riesgos o implicancias trae la decisión.

Esta parte es clave.

Porque evita que el ADR parezca una afirmación arbitraria.

## Ejemplo conceptual de ADR

### Título

Separar read models analíticos del workload transaccional principal.

### Estado

Aceptado.

### Contexto

Las consultas analíticas de negocio empezaron a competir con operaciones críticas de checkout, órdenes y stock. La base transaccional seguía siendo correcta para OLTP, pero cada vez sufría más por agregaciones pesadas y reportes operativos frecuentes.

### Decisión

Se crearán read models derivados para reporting y dashboards operativos, alimentados por eventos y procesos batch/incrementales, evitando que las consultas analíticas se ejecuten directamente sobre el modelo transaccional principal.

### Alternativas consideradas

- seguir consultando la base transaccional con más índices
- replicar lectura sin cambiar el modelo
- separar la capa analítica en estructuras derivadas

### Consecuencias

- mejora del aislamiento entre operación y reporting
- mayor complejidad de pipeline y observabilidad
- aparición de consistencia eventual en vistas derivadas
- necesidad de re-procesamiento e idempotencia en la capa analítica

Fijate que no hace falta que el ADR sea enorme.

Lo importante es que capture bien el razonamiento.

## Errores comunes al escribir ADRs

### 1. Escribirlos demasiado tarde

Si el ADR se redacta mucho después de tomada la decisión, suele perder contexto real o convertirse en una racionalización retrospectiva.

### 2. Escribirlos como documentos gigantes

Un ADR largo y barroco desincentiva lectura y mantenimiento.

### 3. No registrar alternativas

Entonces parece que la decisión cayó del cielo.

### 4. No explicitar consecuencias

Eso le quita valor práctico.
Porque justamente una decisión arquitectónica siempre trae costos además de beneficios.

### 5. No marcar estado vigente

Sin estado, después cuesta saber si esa decisión sigue activa o ya fue superada.

### 6. Usarlos como sustituto de diseño detallado

El ADR registra una decisión.
No reemplaza diagramas, contratos, runbooks o documentación operativa cuando esos artefactos hacen falta.

## Dónde encajan los ADRs dentro de la documentación general

Una buena práctica es no pensar ADRs aislados del resto, sino como parte de un sistema documental más chico pero más útil.

Por ejemplo, un backend maduro podría tener:

- un README o documento de visión general
- uno o dos diagramas de contexto y componentes principales
- documentación de flujos críticos
- documentación operativa o runbooks
- y un directorio de ADRs

Cada cosa cumple un rol distinto.

### El README o visión general

Ayuda a entender rápido qué es el sistema.

### Los diagramas

Ayudan a visualizar estructura y relaciones.

### Los flujos críticos

Ayudan a entender comportamiento real.

### Los runbooks

Ayudan a operar y responder incidentes.

### Los ADRs

Ayudan a entender **por qué** el sistema terminó siendo así.

## Qué hace que una documentación técnica sea realmente útil

Más que la cantidad, importa la calidad y el mantenimiento.

Una documentación útil suele tener estas características:

- es fácil de encontrar
- tiene dueño o al menos responsables claros
- está cerca del trabajo real del equipo
- se actualiza cuando el cambio importa
- distingue lo estable de lo transitorio
- y evita llenar páginas con obviedades

También ayuda muchísimo que la documentación esté integrada al flujo del equipo.

Por ejemplo:

- ADR al tomar una decisión importante
- actualización de runbook al cambiar una operación sensible
- revisión de diagramas cuando cambia un límite arquitectónico
- documentación de contrato al versionar una integración

Cuando documentar forma parte del trabajo normal, deja de sentirse como una tarea artificial.

## Documentación viva vs documentación muerta

Ésta es una distinción clave.

### Documentación viva

Es la que sigue siendo consultada porque:

- responde preguntas reales
- acompaña decisiones importantes
- se actualiza cuando cambia el sistema
- y está escrita con foco práctico

### Documentación muerta

Es la que nadie mira porque:

- está vieja
- es genérica
- es demasiado larga
- repite el código
- o no ayuda a resolver nada concreto

El objetivo no es llenar una wiki.

El objetivo es tener un conjunto pequeño pero valioso de artefactos vivos.

## ADRs y madurez profesional

Saber usar ADRs y documentación técnica con criterio dice bastante sobre tu nivel.

Porque muestra que entendés que backend profesional no es solo:

- escribir endpoints
- modelar tablas
- integrar servicios
- o desplegar cosas

También es:

- dejar rastro de decisiones
- reducir dependencia de conocimiento tribal
- facilitar evolución del sistema
- mejorar conversaciones de arquitectura
- y pensar en el equipo, no solo en tu código local

Esto tiene mucho valor en equipos reales.

Sobre todo cuando el sistema ya no es chico y las decisiones empiezan a afectar a varias personas al mismo tiempo.

## Mini ejercicio mental

Pensá en alguno de estos casos:

- separar reporting del workload transaccional
- introducir colas para procesamiento asíncrono
- elegir multitenancy por columna vs por esquema
- usar proveedor secundario para una integración crítica
- mantener monolito modular en vez de separar microservicios

Ahora intentá escribir mentalmente un ADR mínimo respondiendo:

1. ¿qué problema obliga a decidir?
2. ¿qué alternativas reales existen?
3. ¿cuál elegirías?
4. ¿qué consecuencias trae la elección?
5. ¿qué riesgo o costo aceptarías conscientemente?

Ese ejercicio ayuda mucho a entrenar claridad arquitectónica.

## Relación con la lección anterior

La lección anterior trató sobre:

- cómo presentar una arquitectura backend profesionalmente

Eso se enfocó en explicar sistemas con claridad frente a otras personas.

Esta lección extiende esa idea hacia algo más duradero.

Porque no alcanza con saber explicar bien una arquitectura en una reunión.
También hace falta:

- dejar registro
- capturar decisiones
- preservar contexto
- y facilitar que el sistema siga siendo entendible con el tiempo

## Relación con lo que viene

Esto conecta directamente con la próxima lección sobre:

- cómo justificar decisiones de diseño en entrevistas

Porque los ADRs, bien usados, entrenan exactamente esa habilidad.

Te obligan a pensar y expresar:

- problema
- contexto
- alternativas
- decisión
- trade-offs
- consecuencias

Y eso después aparece de forma directa cuando tenés que defender una arquitectura frente a un entrevistador o un reviewer técnico.

## Lo que deberías llevarte de esta lección

Si tuvieras que quedarte con una sola idea, que sea ésta:

**la documentación técnica útil no intenta describirlo todo, sino conservar el contexto correcto para entender, operar y evolucionar el sistema; y dentro de eso, los ADRs son una herramienta especialmente valiosa para registrar decisiones importantes y sus trade-offs antes de que ese razonamiento se pierda.**

Cuando esto se hace bien, el backend deja de depender tanto de la memoria informal del equipo.

Y pasa a apoyarse más en algo mucho más sano:

- conocimiento compartido
- decisiones trazables
- discusión técnica con contexto
- y evolución arquitectónica más consciente
