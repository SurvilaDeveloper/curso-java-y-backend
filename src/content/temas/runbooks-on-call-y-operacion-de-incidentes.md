---
title: "Runbooks, on-call y operación de incidentes"
description: "Qué son los runbooks, por qué el on-call no debería depender de héroes ni memoria individual, cómo organizar la respuesta operativa ante incidentes, y qué prácticas ayudan a reducir improvisación, fatiga y errores cuando el sistema falla bajo presión."
order: 147
module: "Seguridad y operación avanzada"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior hablamos de **SLO, SLI, error budgets y confiabilidad**.

Ahí vimos que operar bien no consiste solamente en observar métricas o reaccionar cuando algo se rompe, sino en definir con claridad **qué nivel de servicio consideramos aceptable** y cómo medirlo con criterio.

Pero incluso cuando una organización tiene objetivos de confiabilidad razonables, sigue existiendo una realidad inevitable:

**los incidentes van a ocurrir igual.**

Puede fallar una dependencia externa.
Puede degradarse una base de datos.
Puede entrar una versión defectuosa.
Puede agotarse una cola.
Puede aparecer un bug que solo se manifiesta bajo carga.
Puede caer una región.
Puede romperse un proceso batch que alimenta otra parte del sistema.
Puede dispararse una combinación rara de permisos, caché y concurrencia.

Y en ese momento aparece una diferencia enorme entre dos tipos de equipos.

Unos operan el incidente de manera caótica:

- nadie sabe bien quién responde
- cada persona investiga por su cuenta
- se improvisan acciones riesgosas
- la comunicación es confusa
- se pierden minutos críticos buscando contexto
- las decisiones dependen demasiado de quién justo estaba conectado
- el aprendizaje posterior queda incompleto

Otros equipos, sin dejar de sentir presión, tienen algo mejor:

- guardias definidas
- procedimientos documentados
- criterios de escalamiento
- acciones iniciales conocidas
- canales de comunicación claros
- registro de decisiones
- aprendizaje posterior y mejora continua

Eso es justamente lo que estudia este tema.

Vamos a trabajar sobre tres ideas que están muy relacionadas:

- **runbooks**
- **on-call**
- **operación de incidentes**

En esta lección vamos a ver:

- qué es realmente un runbook y para qué sirve
- por qué la operación no debería depender de memoria heroica
- cómo organizar un esquema de on-call sano
- qué roles suelen aparecer durante un incidente
- cómo responder bajo presión sin empeorar el sistema
- qué diferencias hay entre alertar, escalar, mitigar y resolver
- cómo documentar incidentes y aprender después
- qué prácticas ayudan a bajar el costo humano y técnico de operar sistemas reales

## Operar incidentes no es solo “arreglar algo roto"

Cuando se habla de incidentes, muchas personas imaginan una escena muy simple:

algo falla, alguien encuentra el problema, lo arregla y listo.

Pero en sistemas reales la situación suele ser bastante más compleja.

Un incidente no es solamente una falla técnica.
También es un problema de:

- coordinación
- priorización
- comunicación
- gestión de riesgo
- presión temporal
- toma de decisiones con información incompleta

Y eso cambia mucho la dificultad.

Porque durante un incidente casi nunca tenés todo claro desde el principio.

Muchas veces no sabés todavía:

- cuál es la causa raíz
- qué alcance tiene el problema
- qué flacción de usuarios está afectada
- si el fallo es continuo o intermitente
- si el problema está en tu servicio o en un tercero
- si conviene rollback, mitigación parcial o espera controlada
- si el cambio más reciente realmente está relacionado
- si tocar algo más puede empeorar la situación

Por eso operar incidentes bien no es correr más rápido.

Es **reducir improvisación en condiciones donde la incertidumbre es alta y el costo de error también**.

## El problema de la operación heroica

Muchos equipos, sobre todo en etapas tempranas, funcionan durante bastante tiempo con un modelo implícito:

si algo importante falla, “alguno de los que más sabe” lo arregla.

Al principio puede parecer eficiente.

Pero en realidad ese modelo acumula varios riesgos.

### Riesgo 1: dependencia excesiva de personas específicas

Cuando todo depende de una o dos personas clave, el sistema operativo del equipo es frágil.

Si esas personas no están disponibles, están cansadas, cambiaron de rol o simplemente no recuerdan detalles importantes, la calidad de respuesta cae mucho.

### Riesgo 2: conocimiento no transferido

Hay equipos donde la operación vive en chats viejos, recuerdos personales, comandos sueltos, intuiciones y pequeñas costumbres internas no documentadas.

Eso vuelve muy costoso responder y entrenar a otros.

### Riesgo 3: acciones manuales peligrosas

Si las respuestas operativas se ejecutan “como alguien se acuerda”, crece la probabilidad de:

- correr comandos erróneos
- hacerlo en el ambiente equivocado
- saltearse validaciones
- olvidar pasos de rollback
- omitir comunicación crítica

### Riesgo 4: desgaste humano

La operación heroica suele glorificar algo dañino:

que ciertas personas vivan apagando incendios todo el tiempo.

Eso no es madurez operativa.
Eso es una forma cara y poco sostenible de sostener el sistema.

## Qué es un runbook

Un **runbook** es una guía operativa que documenta cómo ejecutar una tarea, responder a una condición conocida o actuar frente a un tipo de incidente.

No tiene por qué ser larguísimo ni burocrático.

Su objetivo principal es simple:

**hacer que una acción operativa importante pueda ejecutarse de forma más segura, repetible y menos dependiente de memoria individual.**

### Algunos ejemplos de runbooks

- cómo responder a saturación de cola de procesamiento
- qué revisar cuando la latencia del login sube de cierto umbral
- cómo rotar credenciales comprometidas
- cómo deshabilitar un proveedor externo y conmutar al secundario
- cómo pausar un job que está generando duplicados
- cómo recuperar un consumidor atrasado
- cómo reconstruir un índice o recalcular una vista derivada
- cómo aplicar un rollback seguro de una versión
- cómo actuar ante error masivo en checkout
- cómo proceder frente a caída de un nodo de base de datos

Fijate que un runbook no existe solo para fallas catastróficas.

También sirve para operaciones delicadas o frecuentes cuyo costo de error es alto.

## Un runbook no es solo una lista de comandos

Este es un punto importante.

Un mal runbook es una receta suelta tipo:

- corré este comando
- reiniciá esto
- limpiá aquello
- avisá por Slack

Eso ayuda un poco, pero suele quedarse corto.

Un runbook realmente útil debería responder varias preguntas.

### 1. ¿Para qué situación aplica?

Tiene que quedar claro:

- qué síntoma o condición lo dispara
- qué señales lo justifican
- qué tipo de incidente cubre
- qué casos parecidos pero distintos no cubre

### 2. ¿Qué riesgo intenta mitigar?

No alcanza con explicar qué hacer.
También conviene explicar qué se está tratando de proteger.

Por ejemplo:

- evitar duplicación de cobros
- reducir backlog antes de perder SLA interno
- frenar corrupción de datos
- aislar una dependencia degradada
- restaurar capacidad de login

### 3. ¿Qué precondiciones o validaciones previas existen?

Antes de tocar algo crítico, muchas veces hay que verificar:

- si el problema realmente coincide con el escenario
- si el cambio reciente está involucrado
- si hay tráfico desviado
- si ya existe otro incidente abierto relacionado
- si la región o tenant afectado es parcial

### 4. ¿Qué pasos concretos hay que ejecutar?

Acá sí van instrucciones operativas.
Pero idealmente ordenadas, claras y seguras.

### 5. ¿Qué riesgos tienen esos pasos?

Algunas acciones pueden:

- producir pérdida temporal de servicio
- reintentar operaciones sensibles
- duplicar eventos
- borrar estado temporal
- disparar carga extra
- empeorar consistencia

Eso tiene que estar explicitado.

### 6. ¿Cómo verificar si funcionó?

Un runbook serio siempre debería indicar cómo validar el resultado:

- qué métricas mirar
- qué logs revisar
- qué dashboard usar
- qué endpoint o flujo probar
- cuánto tiempo esperar para ver efecto

### 7. ¿Qué hacer si no funciona?

Muchas guías fallan porque solo describen el camino feliz.

Pero la operación real necesita también:

- criterio de escalamiento
- plan B
- rollback
- siguiente investigación sugerida

## Qué debería incluir un buen runbook

No existe un formato universal, pero una estructura práctica suele incluir algo así.

### Título claro

Que permita saber rápido qué cubre.

Ejemplo:

- “Backlog anormal en cola de emails salientes”
- “Error elevado en proveedor principal de pagos”
- “Rollback de release web con impacto en checkout”

### Descripción breve del escenario

Qué síntoma aparece y por qué importa.

### Severidad o criticidad típica

No como verdad absoluta, sino como orientación.

### Señales de disparo

Alertas, métricas, logs, dashboards o síntomas funcionales.

### Hipótesis frecuentes

Causas probables o categorías de causa.

### Pasos iniciales de verificación

Antes de ejecutar mitigaciones más agresivas.

### Pasos de mitigación o recuperación

Acciones concretas, con cuidado y orden.

### Validaciones posteriores

Cómo confirmar que la situación mejoró.

### Criterios de escalamiento

Cuándo involucrar más personas o cambiar de estrategia.

### Riesgos conocidos

Qué puede salir mal al aplicar el procedimiento.

### Referencias útiles

Dashboards, paneles, repositorios, comandos, links internos, historial de incidentes similares.

## Los runbooks no eliminan el juicio técnico

Otro error común es imaginar que documentar procesos resuelve todo automáticamente.

No.

Un runbook no reemplaza criterio.
No reemplaza experiencia.
No reemplaza razonamiento.

Lo que hace es **bajar el costo cognitivo inicial** y reducir la improvisación innecesaria.

Eso ya es muchísimo.

Durante un incidente, el cerebro humano funciona peor que en calma:

- olvidás pasos
- asumís causas demasiado rápido
- leés mal una señal
- tocás más de lo debido
- comunicás menos de lo necesario

Un buen runbook actúa como apoyo.

No te vuelve infalible.
Pero sí te vuelve menos vulnerable a errores evitables.

## Qué es on-call

**On-call** es el esquema por el cual una persona o un grupo de personas asume la responsabilidad de responder cuando ocurre cierto tipo de alerta o incidente fuera del flujo normal de trabajo.

No significa solamente “estar disponible”.

Significa que existe una expectativa explícita de:

- monitorear o recibir alertas
- evaluar si son reales o ruido
- iniciar respuesta
- mitigar o escalar
- coordinar acciones iniciales

En equipos pequeños, el on-call a veces es informal.
En equipos más maduros suele organizarse con:

- rotación
- horarios
- cobertura primaria y secundaria
- políticas de escalamiento
- herramientas de paging
- compensaciones o guardias remuneradas
- límites de carga razonables

## Un buen esquema de on-call no debería castigar al equipo

Hay implementaciones de on-call que en la práctica son una mala idea.

Por ejemplo:

- guardias eternas
- alertas ruidosas a cualquier hora
- una sola persona responsable de todo
- falta de documentación
- obligación de responder sin contexto
- incidentes recurrentes que nadie corrige de fondo

Eso genera cansancio, frustración y rotación.

Por eso un sistema sano de guardias suele cuidar varias cosas.

### Cobertura clara

Debe saberse quién está de guardia, para qué servicios y en qué ventana.

### Escalamiento razonable

La persona de primera línea no tiene que cargar sola con todo el peso si el problema supera cierto umbral.

### Alertas con calidad

No cualquier anomalía merece despertar a alguien.

### Herramientas y accesos preparados

No tiene sentido pedir respuesta rápida si faltan permisos, dashboards o procedimientos.

### Aprendizaje posterior

Si el mismo incidente despierta a gente todas las semanas, el problema no es la guardia.
El problema es que el sistema o la instrumentación no está mejorando.

## Alertar mal destruye el on-call

Éste es uno de los grandes problemas operativos.

Si alertás demasiado, todo parece urgente y nada lo es realmente.

Consecuencias típicas:

- fatiga de alertas
- habituación al ruido
- respuestas más lentas
- menor confianza en la señal
- burnout
- más errores humanos

### Buenas alertas suelen ser:

- accionables
- relevantes
- vinculadas a impacto real o riesgo serio
- lo bastante precisas como para orientar la primera investigación
- calibradas para evitar falso positivo constante

### Malas alertas suelen ser:

- puramente informativas pero tratadas como urgentes
- disparadas por métricas demasiado sensibles
- sin contexto suficiente
- duplicadas entre sistemas
- sin owner claro
- sin runbook asociado

Una forma práctica de evaluarlas es preguntar:

**si esta alerta dispara a las 3 de la mañana, ¿realmente queremos despertar a alguien por esto?**

Si la respuesta es no, probablemente no deba paginarse de esa manera.

## Roles durante un incidente

No todos los incidentes necesitan una estructura formal pesada.

Pero cuando el impacto crece, conviene separar algunos roles para no mezclar todo en la misma persona.

### Incident commander

Coordina la respuesta.
No necesariamente ejecuta cada cambio, sino que:

- prioriza
- asigna tareas
- decide próximos pasos
- evita que todos hagan cosas al mismo tiempo sin coordinación
- mantiene foco en mitigación y estado general

### Investigadores o responders técnicos

Profundizan hipótesis, revisan métricas, aplican mitigaciones, validan cambios.

### Responsable de comunicación

En incidentes grandes, conviene que alguien se ocupe de actualizar:

- stakeholders internos
- soporte
- producto
- a veces clientes o status page

### Escalados especialistas

Personas con conocimiento puntual de cierta base, servicio, proveedor o componente.

No hace falta formalizar esto siempre, pero separar coordinación de ejecución suele ayudar muchísimo.

## Mitigar no es lo mismo que resolver

Durante un incidente existe una tentación común:

querer encontrar la causa raíz completa antes de hacer nada.

Eso a veces es correcto, pero muchas veces no.

En operación real suele ser muy importante distinguir entre:

### Mitigación

Reducir impacto ahora.

Por ejemplo:

- desactivar una feature problemática
- desviar tráfico
- bajar concurrencia
- apagar un job que corrompe datos
- hacer rollback
- cambiar a proveedor secundario
- degradar una capacidad no crítica

### Resolución completa

Eliminar la causa raíz o corregir el problema de fondo.

Por ejemplo:

- corregir el bug real
- reprocesar datos dañados
- rediseñar una dependencia inestable
- reparar un modelo defectuoso de concurrencia

En muchos incidentes, **mitigar primero** es la decisión más sana.

Porque recuperar servicio vale más que perseguir elegantemente la teoría perfecta mientras el sistema sigue degradado.

## La operación bajo presión necesita priorizar seguridad de cambio

En incidentes serios es fácil caer en lo siguiente:

- hacer muchos cambios a la vez
- probar ideas sin validación mínima
- aplicar acciones no reversibles sin medir impacto
- mezclar investigación con cambios productivos improvisados

Eso es peligroso.

Bajo presión, conviene sostener algunas reglas simples.

### Cambios pequeños siempre que sea posible

Cuanto más grande la maniobra, más difícil entender su efecto.

### Una hipótesis por vez cuando se pueda

Si cambiás cinco cosas juntas, no vas a saber cuál ayudó o empeoró.

### Registrar decisiones importantes

Aunque sea en un canal de incidente o un documento liviano.

### Evitar acciones irreversibles sin criterio fuerte

Sobre todo si hay riesgo de pérdida de datos o corrupción.

### Confirmar efecto con señales explícitas

No por intuición ni porque “parece haber mejorado”.

## Qué hace valioso un canal de incidente bien llevado

En incidentes reales muchas veces se abre un canal dedicado.

Eso sirve para:

- concentrar contexto
- evitar ruido disperso
- registrar cronología
- dejar decisiones visibles
- facilitar handoff entre personas

Un buen canal de incidente no es solo chat ansioso.

Idealmente va dejando trazas útiles:

- hora de detección
- síntoma inicial
- impacto observado
- hipótesis activas
- mitigaciones aplicadas
- resultado de esas mitigaciones
- escalamiento hecho
- estado actual

Después, ese registro ayuda mucho para el análisis posterior.

## Postmortem: aprender después del incidente

Responder bien durante el incidente importa mucho.

Pero aprender después importa casi igual.

Si cada incidente se atiende y luego se olvida, el sistema operativo del equipo no madura.

Por eso muchas organizaciones hacen algún tipo de **postmortem** o revisión posterior.

No tiene que ser un ritual vacío.

Su valor está en responder preguntas como:

- qué pasó exactamente
- cuándo empezó
- cómo se detectó
- cuánto tardamos en entenderlo
- cuánto tardamos en mitigarlo
- qué señales faltaron
- qué partes del proceso funcionaron mal
- qué decisiones fueron buenas
- qué mejoras concretas surgen de esto

## Un buen postmortem no busca culpables

Si el análisis posterior se convierte en juicio personal, el equipo va a ocultar errores y la calidad del aprendizaje va a empeorar.

La idea no es absolver todo indiscriminadamente.
La idea es entender el sistema completo:

- decisiones técnicas
- diseño existente
- procesos de despliegue
- alertas insuficientes
- permisos mal resueltos
- documentación ausente
- fatiga operativa
- acoplamientos peligrosos

A veces hubo un error humano, sí.
Pero incluso ahí la pregunta madura no es solo “quién se equivocó”, sino:

**¿qué condiciones hicieron más probable ese error y cómo las reducimos?**

## Qué debería salir de un postmortem útil

No solo una narración del desastre.

También deberían salir acciones concretas, por ejemplo:

- mejorar una alerta
- crear o corregir un runbook
- automatizar una validación previa al despliegue
- reducir permisos excesivos
- separar un flujo crítico
- mejorar rollback
- agregar dashboards por tenant o región
- documentar ownership de componentes
- bajar ruido de paging
- rediseñar parte del proceso operativo

Si después de varios incidentes los postmortems no producen cambios reales, entonces probablemente se están usando como documentación decorativa y no como herramienta de mejora.

## Runbooks y automatización

Otro punto interesante es la relación entre runbooks y automatización.

A veces un procedimiento manual muy repetido indica que conviene automatizar.

Por ejemplo:

- reinicio seguro de un consumidor con validaciones previas
- conmutación controlada entre proveedores
- limpieza de estado temporal inválido
- reprocesamiento de mensajes atascados
- rollback asistido de una versión

Pero automatizar no siempre significa eliminar el runbook.

Muchas veces lo correcto es:

- automatizar lo repetible y peligroso
- dejar documentado cuándo usarlo
- dejar claras las validaciones previas y posteriores

En otras palabras:

la automatización madura suele convivir con buen material operativo.

## Qué cosas suelen romper una operación de incidentes

Hay patrones que aparecen una y otra vez.

### Falta de ownership claro

Nadie sabe quién responde primero ni quién decide.

### Exceso de personas hablando a la vez

Mucho ruido y poca coordinación.

### Alertas pobres

Se dispara tarde o demasiado temprano, o sin contexto.

### Ausencia de runbooks

Todo depende de memoria o intuición.

### Accesos insuficientes durante la guardia

La persona recibe el incidente pero no puede actuar.

### Comunicación deficiente

Soporte, producto o liderazgo no saben realmente qué está pasando.

### No distinguir mitigación de resolución

Se pierde tiempo intentando cerrar elegantemente algo que primero había que contener.

### No aprender después

El sistema vuelve a fallar de formas muy parecidas.

## Ejemplo conceptual: incidente en checkout

Imaginá un e-commerce donde sube abruptamente el error rate en `POST /checkout`.

Un enfoque inmaduro sería:

- varias personas empiezan a tocar cosas al mismo tiempo
- alguien reinicia servicios sin validar nada
- otro cambia configuración sin avisar
- nadie documenta decisiones
- soporte no sabe qué responder
- se intenta “arreglar del todo” antes de estabilizar

Un enfoque mejor podría verse así:

### 1. Se activa la guardia

La persona on-call confirma que la alerta es real y abre incidente.

### 2. Se evalúa alcance

- porcentaje de errores
- regiones afectadas
- versiones involucradas
- relación con despliegues recientes
- impacto en órdenes creadas versus intentadas

### 3. Se consulta runbook

El runbook de checkout indica:

- dashboards críticos
- verificación de proveedor de pagos
- validación de stock/reservas
- pasos para desactivar cierta integración opcional
- criterio para rollback
- validación posterior

### 4. Se mitiga

Si el problema se relaciona con una release reciente, se hace rollback controlado.
Si el proveedor principal falla, se conmuta al secundario.
Si hay cola trabada, se estabiliza el procesamiento.

### 5. Se comunica

Soporte y stakeholders reciben estado claro.

### 6. Se verifica

Bajan errores, mejora latencia, vuelve la creación de órdenes.

### 7. Se analiza después

Se documenta causa raíz, puntos ciegos y mejoras necesarias.

No siempre será tan prolijo.
Pero ese tipo de estructura baja mucho el costo del caos.

## El on-call sano también es una señal de madurez de arquitectura

Esto es importante.

Si una organización necesita guardias heroicas permanentes para sostener el sistema, eso suele indicar problemas más profundos:

- arquitectura frágil
- observabilidad insuficiente
- automatización pobre
- despliegues inseguros
- deuda operativa acumulada
- ownership borroso
- demasiada dependencia de cambios manuales

Un on-call bien diseñado no es el fin de la historia.
También funciona como sensor.

Si las guardias viven explotadas, el sistema está comunicando algo.

## Qué deberías llevarte de esta lección

Si tuvieras que quedarte con una idea, que sea ésta:

**operar incidentes bien no significa depender de personas heroicas que recuerdan todo, sino construir procedimientos, guardias y formas de coordinación que reduzcan improvisación cuando el sistema falla.**

Eso implica aprender a pensar en:

- runbooks como apoyo operativo serio y no como burocracia
- on-call como responsabilidad organizada y no como castigo difuso
- alertas accionables y con buena calidad
- diferencia entre mitigar y resolver
- coordinación explícita durante incidentes
- registro de decisiones y comunicación clara
- postmortems como aprendizaje sistémico
- operación sostenible también en términos humanos

Un backend maduro no solo implementa features seguras.
También sabe cómo reaccionar cuando la realidad rompe el plan.

## Cierre

La diferencia entre un equipo que sobrevive incidentes y uno que madura con ellos no está solo en la calidad del código.

También está en cómo responde bajo presión.

Cuando no hay guardias claras, documentación útil ni coordinación, cada incidente se vuelve más caro, más lento y más dependiente de las mismas pocas personas.

Cuando sí existen runbooks razonables, on-call bien pensado y prácticas operativas más sanas, el sistema sigue pudiendo fallar, pero la respuesta se vuelve menos improvisada, menos frágil y más repetible.

Eso no elimina la complejidad.
No evita toda madrugada difícil.
No reemplaza arquitectura, observabilidad ni diseño cuidadoso.

Pero sí construye algo fundamental:

**capacidad operativa real para responder, contener, aprender y mejorar sin que cada incidente dependa de memoria heroica o caos colectivo.**

Y después de esto aparece el siguiente paso lógico.

Porque una vez que sabés responder incidentes y operar con más disciplina, necesitás empezar a pensar no solo en el presente, sino en el futuro próximo del sistema:

cuánta carga va a soportar, dónde se van a tensar los recursos, cómo prever crecimiento, qué capacidad conviene reservar y cómo tomar decisiones antes de que el problema explote en producción.

Ahí entramos en el próximo tema: **capacity planning y forecasting técnico**.
