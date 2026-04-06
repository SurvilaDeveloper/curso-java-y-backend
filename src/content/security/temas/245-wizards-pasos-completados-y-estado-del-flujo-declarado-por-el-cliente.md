---
title: "Wizards, pasos completados y estado del flujo declarado por el cliente"
description: "Cómo entender los riesgos de confiar en pasos completados y estado de flujo declarado por el cliente en aplicaciones Java con Spring Boot. Por qué no alcanza con que la UI guíe un wizard y qué cambia cuando el backend toma como verdad del proceso lo que el frontend dice que ya ocurrió."
order: 245
module: "Client-side trust y decisiones peligrosas basadas en el frontend"
level: "base"
draft: false
---

# Wizards, pasos completados y estado del flujo declarado por el cliente

## Objetivo del tema

Entender por qué los **wizards**, los **pasos completados** y el **estado del flujo declarado por el cliente** pueden convertirse en una superficie muy importante de **client-side trust** en aplicaciones Java + Spring Boot.

La idea de este tema es continuar directamente lo que vimos sobre:

- client-side trust
- decisiones peligrosas basadas en el frontend
- precios, descuentos y totales enviados por el cliente
- y la diferencia entre una UI que guía al usuario y un backend que conserva la autoridad real sobre negocio, autorización e integridad del proceso

Ahora toca mirar un caso extremadamente común en productos reales:

- onboarding paso a paso
- checkout de varios pasos
- formularios largos
- alta de cuentas
- activación de servicios
- verificación documental
- flujos de suscripción
- procesos de aprobación
- journeys administrativos
- configuraciones guiadas por wizard

Y justo ahí aparece una trampa muy común.

Porque desde UX un wizard necesita cosas como:

- mostrar en qué paso está el usuario
- habilitar o deshabilitar pantallas
- recordar progreso
- indicar qué pasos ya completó
- decidir qué botones mostrar
- permitir volver atrás o seguir adelante

Todo eso está perfecto para experiencia.
El problema aparece cuando el backend empieza a aceptar eso como si fuera la verdad del proceso.

Por ejemplo, cuando recibe cosas como:

- `currentStep=4`
- `step1Completed=true`
- `step2Validated=true`
- `paymentDone=false`
- `kycApproved=true`
- `shippingConfirmed=true`
- `wizardState=review`
- `canContinue=true`

y a partir de ahí actúa como si el flujo ya estuviera efectivamente en ese punto.

En resumen:

> los wizards, los pasos completados y el estado del flujo declarado por el cliente importan porque el riesgo no está solo en “saltear pantallas”,  
> sino en que el backend deje que la UI le declare qué validaciones ya ocurrieron, qué estado del proceso es el actual y qué transición toca ahora, convirtiendo a la capa de presentación en una pseudo máquina de estados que nunca debió tener esa autoridad.

---

## Idea clave

La idea central del tema es esta:

> un wizard del frontend puede **representar** el progreso del usuario,  
> pero el backend tiene que **determinar** el progreso real del proceso.

Eso cambia bastante la forma de revisar flujos multi-step.

Porque una cosa es pensar:

- “la UI ya sabe en qué paso estamos”
- “este wizard ya bloquea el paso siguiente”
- “si llegó al paso 4, entonces pasó por los anteriores”
- “el cliente ya marcó qué pasos están completos”

Y otra muy distinta es preguntarte:

- “¿qué parte de ese progreso reconstruye el backend?”
- “¿qué validaciones dependen de estado real y no solo de la pantalla?”
- “¿qué ocurre si el cliente declara un paso como completado sin haber cumplido las condiciones?”
- “¿qué pasa si un estado viejo del wizard llega al servidor?”
- “¿estamos aceptando una navegación de UI o una transición de negocio?”

### Idea importante

La UI puede narrar el flujo.
La autoridad final sobre el estado del proceso sigue teniendo que vivir del lado del servidor.

### Regla sana

Cada vez que el cliente mande algo que describa progreso, paso actual o validación ya hecha, preguntate si el backend lo verifica o si simplemente lo cree.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- aceptar `currentStep` o flags de progreso como si fueran verdad del proceso
- tratar pantallas vistas como evidencia suficiente de validaciones realizadas
- inferir que un paso previo se cumplió porque el usuario llegó a una vista posterior
- confiar en estados del wizard serializados en el cliente
- no reconstruir qué validaciones o requisitos siguen vigentes en el backend
- convertir el frontend en la máquina de estados real del flujo sin reconocerlo

Es decir:

> el problema no es solo que el cliente pueda decir “voy por este paso”.  
> El problema es **qué parte del proceso el backend deja de decidir por aceptar esa declaración como si ya representara una transición de negocio legítima**.

---

## Error mental clásico

Un error muy común es este:

### “No se puede llegar a este paso sin haber hecho los anteriores”

Eso puede ser cierto para la navegación normal de la UI.
Pero no alcanza como garantía del sistema.

Porque todavía conviene preguntar:

- ¿qué pasa si igual llega un request del paso 4?
- ¿qué pasa si se reenvía un estado viejo del wizard?
- ¿qué pasa si un campo oculto indica pasos completos que el backend nunca reconstruye?
- ¿qué pasa si cambió el contexto desde que la UI marcó ese paso como listo?
- ¿qué pasa si la validación previa era temporal y ya no sigue vigente?

### Idea importante

Llegar visualmente a una pantalla no equivale a haber ganado legítimamente la transición que esa pantalla representa.

---

# Parte 1: Qué significa “estado del flujo declarado por el cliente”

## La intuición simple

Podés pensar este problema así:

1. la UI representa un proceso en varias etapas
2. el cliente guarda o envía alguna forma de progreso
3. el backend recibe esa representación
4. y en vez de reconstruir el estado real, la trata como si ya fuera el estado del proceso

Eso puede ocurrir con cosas como:

- número de paso actual
- flags de completitud
- pantallas ya vistas
- tabs habilitados
- subformularios marcados como listos
- confirmaciones intermedias
- “ya aceptó términos”
- “ya verificó identidad”
- “ya eligió plan”
- “ya cargó método de pago”

### Idea útil

El cliente no solo manda datos.
A veces manda una **historia del proceso**.

### Regla sana

Cada vez que el frontend mande historia del proceso, preguntate si el backend la reconstruye o si simplemente la acepta.

---

# Parte 2: Un wizard de UX no es una máquina de estados de negocio

Este es uno de los aprendizajes más importantes del tema.

Una UI puede necesitar:

- dividir un flujo complejo
- evitar saturar al usuario
- mostrar avance
- dar sensación de control
- permitir guardar y seguir después
- ocultar pasos irrelevantes

Todo eso es UX.
Pero una **máquina de estados de negocio** responde cosas como:

- qué condiciones ya se cumplieron realmente
- qué validaciones siguen vigentes
- qué transiciones están habilitadas ahora
- qué efectos ya ocurrieron
- qué restricciones deben sostenerse antes de pasar al siguiente estado

### Idea importante

El wizard visual puede parecerse a una máquina de estados, pero no debería reemplazarla.

### Regla sana

No confundas secuencia de pantallas con secuencia legítima de estados del dominio.

### Idea útil

La UX puede contar un proceso.
El dominio tiene que gobernarlo.

---

# Parte 3: Paso completado no equivale a condición todavía válida

Otra razón por la que este tema importa es que incluso si una validación ocurrió realmente en un momento, eso no implica que siga valiendo después.

Por ejemplo, entre un paso y otro pueden cambiar cosas como:

- stock
- elegibilidad
- precio
- descuento
- método de envío disponible
- identidad verificada o no
- permisos del actor
- ownership
- estado del recurso
- política del negocio
- información del usuario
- documentos cargados

### Idea importante

El wizard puede decir “paso 2 completo”.
Pero el backend todavía necesita preguntarse:
- “¿esa condición sigue siendo cierta ahora?”

### Regla sana

No uses progreso de UI como sustituto de validación viva cuando las condiciones pueden cambiar entre pasos.

---

# Parte 4: Multi-step forms también sufren TOCTOU, pero en clave de frontend

Esto conecta muy bien con el bloque anterior.

Un flujo de varios pasos puede generar esta situación:

1. el usuario completa una pantalla
2. la UI marca ese paso como listo
3. pasan minutos o más
4. el usuario continúa o envía el paso final
5. el backend actúa como si las validaciones iniciales siguieran vigentes

### Idea útil

Eso se parece mucho a TOCTOU:
- el check ocurrió en un momento
- el uso ocurre después
- y el sistema actúa como si nada hubiera cambiado.

### Regla sana

Cada vez que un wizard pueda durar más que la estabilidad del contexto que valida, asumí que el backend necesita revalidar más de una cosa.

### Idea importante

El estado del wizard puede quedar viejo igual que cualquier snapshot.

---

# Parte 5: Saltarse pantallas es solo la versión más obvia del problema

A veces se enseña este tema como:
- “el usuario puede ir directo al paso 4”

Eso existe, sí.
Pero el problema real es más amplio.

También importa cuando:

- el usuario no salta pasos, pero el backend igual no reconstruye nada
- la UI llega legítimamente al paso 4, pero el contexto ya cambió
- el estado guardado en cliente está desfasado
- el mismo flujo se reanuda después con datos viejos
- dos tabs del wizard divergen
- una app móvil y web comparten progreso de manera distinta
- el servidor acepta flags de completitud como si fueran pruebas del dominio

### Idea útil

No reduzcas el riesgo a “deep linking” o navegación indebida.
El problema es aceptar como verdad del proceso algo que el cliente solo debía presentar.

### Regla sana

Preguntate no solo si el usuario puede saltarse pantallas, sino también si el backend sabe explicar por qué el proceso está realmente en el estado que el cliente declara.

---

# Parte 6: Estados intermedios visibles no son evidencia fuerte

Otra trampa frecuente:
la UI puede conservar o enviar cosas como:

- `reviewReady=true`
- `canSubmit=true`
- `paymentStepUnlocked=true`
- `kycPassed=true`
- `termsAccepted=true`
- `selectionConfirmed=true`

### Problema

Esos flags pueden ser útiles para render o navegación.
Pero no deberían funcionar como evidencia suficiente de:

- aprobación de KYC
- aceptación contractual real
- elegibilidad comercial
- validación documental
- compatibilidad de plan
- completitud de identidad
- integridad del carrito

### Idea importante

Un flag de UI puede describir experiencia, no necesariamente estado del dominio.

### Regla sana

No conviertas marcadores de navegación o de render en pruebas de cumplimiento de reglas reales.

---

# Parte 7: El backend debe poder reconstruir “por qué estamos acá”

Este principio organiza mucho el tema.

Si el cliente dice:
- “estamos en el paso final”

el servidor debería poder responder por sí mismo:

- qué pasos previos están efectivamente completados
- qué validaciones se realizaron
- cuáles siguen vigentes
- qué datos fueron persistidos
- qué transiciones ocurrieron de verdad
- qué dependencias siguen satisfechas
- qué side effects ya se ejecutaron o no

### Idea útil

Si el backend no puede contar esa historia sin mirar el estado enviado por la UI, probablemente ya está confiando demasiado en el frontend.

### Regla sana

Cada vez que un flujo tenga varios pasos, exigí que el servidor pueda reconstruir el estado real del proceso y no solo leer el progreso reportado por el cliente.

### Idea importante

El backend debería poder explicar el estado del proceso sin tener que “creerle” a la interfaz.

---

# Parte 8: Drafts, guardado parcial y reanudación hacen el problema más serio

Esto se vuelve más delicado cuando existen cosas como:

- save draft
- continue later
- resume onboarding
- carrito persistido
- sesión de wizard retomable
- progreso guardado en frontend o mobile storage

### Problema

Ahí el sistema corre más riesgo de tratar como actual algo que en realidad ya quedó viejo o desalineado con:

- catálogo
- permisos
- policy
- estado del recurso
- elegibilidad
- documentación
- identidad
- restricciones del negocio

### Idea útil

La persistencia de progreso de UX no debería convertirse automáticamente en persistencia de verdad de negocio.

### Regla sana

Cada vez que un wizard sea retomable, preguntate qué parte del progreso puede reusarse para UX y qué parte debe revalidarse como estado real del dominio.

---

# Parte 9: Qué patrones merecen sospecha inmediata

Conviene sospechar especialmente cuando veas cosas como:

- DTOs con `currentStep`, `stepDone`, `wizardState`, `canSubmit`
- flags `approved`, `validated`, `confirmed` enviados desde cliente
- endpoints que aceptan paso actual como verdad del flujo
- multi-step forms donde cada paso depende de checks previos que el backend no reconstruye
- `status` del proceso enviado o persistido desde el frontend
- formularios largos que asumen que “si llegaste acá, está todo bien”
- equipos que justifican con “la UI no te deja avanzar si eso no se cumplió”

### Idea útil

No hace falta que haya un payload raro.
Basta con que el backend use la navegación del cliente como si fuera la orquestación legítima del proceso.

### Regla sana

Cada vez que una transición de negocio parezca estar guiada por el wizard más que por el servidor, ya conviene revisar client-side trust con atención.

---

# Parte 10: Qué preguntas conviene hacer en una review

Cuando revises wizards, pasos completados y estado del flujo declarado por el cliente, conviene preguntar:

- ¿qué parte del flujo vive solo en la UI?
- ¿qué parte del progreso informa el cliente?
- ¿qué estado real puede reconstruir el servidor?
- ¿qué validaciones o checks previos se vuelven a verificar?
- ¿qué condiciones pueden haber cambiado entre pasos?
- ¿qué pasa si llega un request “de paso 4” sin historia previa válida?
- ¿qué pasa si el progreso guardado es viejo o inconsistente?
- ¿el servidor procesa un workflow real o una narración de la UI?

### Idea importante

La review buena no termina en:
- “es un wizard”
Sigue hasta:
- “¿quién es realmente la máquina de estados: el backend o el frontend?”

---

# Parte 11: Qué revisar en una app Spring

En una app Spring, conviene sospechar especialmente cuando veas:

- DTOs con campos de paso actual o flags de completitud
- endpoints distintos por paso que no verifican transición real del flujo
- guardado parcial o drafts largos
- reanudación de procesos con mucho estado de cliente
- progresos de onboarding, KYC, checkout o setup informados por la UI
- lógica que depende de `step`, `confirmed`, `validated`, `accepted`, `finished`
- backend que usa casi tal cual el estado serializado por el wizard

### Idea útil

Si el servidor no puede explicar por sí mismo por qué el flujo está donde el cliente dice que está, ya conviene revisar si la UI se volvió demasiado autoritativa.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- UI usada para navegación y UX
- backend que reconstruye el estado real del proceso
- revalidación de condiciones importantes entre pasos
- menor cantidad de flags de completitud aceptados desde cliente
- distinción clara entre progreso de pantalla y transición de negocio
- equipos que entienden que el wizard visual no es la policy del flujo

### Idea importante

La madurez aquí se nota cuando el sistema no confunde “pantalla alcanzada” con “estado del proceso legítimamente ganado”.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- “si llegó a este paso es porque hizo los anteriores”
- `currentStep` o `stepDone` tratados como verdad del proceso
- flags `validated` o `approved` enviados desde la UI
- drafts o reanudaciones sin revalidación suficiente
- backend que acata el flujo narrado por el cliente
- el equipo defiende con “la UI no deja”

### Regla sana

Si una operación sensible depende de que el frontend relate correctamente en qué punto del proceso está el usuario y el backend no puede reconstruirlo por sí mismo, probablemente ya hay demasiada confianza puesta en la UI.

---

## Checklist práctica

Para revisar wizards, pasos completados y estado del flujo declarado por el cliente, preguntate:

- ¿qué parte del progreso vive en el cliente?
- ¿qué parte del proceso reconstruye el servidor?
- ¿qué validaciones siguen siendo necesarias entre pasos?
- ¿qué cambia si el flujo se retoma más tarde?
- ¿qué flags de la UI se están usando como si fueran estado del dominio?
- ¿qué haría el backend si llegara directo una request del paso final?
- ¿quién manda realmente sobre la transición del proceso?

---

## Mini ejercicio de reflexión

Tomá un wizard real de tu app Spring y respondé:

1. ¿Qué pasos tiene?
2. ¿Qué estado de progreso manda hoy el frontend?
3. ¿Qué parte de ese progreso puede reconstruir el backend?
4. ¿Qué condición importante podría dejar de ser válida entre pasos?
5. ¿Qué campo sería más peligroso si el cliente lo alterara?
6. ¿Qué parte del equipo sigue diciendo “si llegó ahí, ya hizo lo anterior”?
7. ¿Qué revisarías primero después de este tema?

---

## Resumen

Los wizards, los pasos completados y el estado del flujo declarado por el cliente importan porque el riesgo no está solo en que el usuario pueda navegar raro o saltearse pantallas, sino en que el backend deje que la UI le describa qué validaciones ya ocurrieron, qué estado del proceso es el actual y qué transición corresponde ahora.

La gran intuición del tema es esta:

- un wizard puede guiar el proceso, pero no gobernarlo
- progreso de pantalla no equivale a estado del dominio
- flags de completitud o validación de la UI no son evidencia fuerte
- los flujos largos también sufren snapshots viejos y TOCTOU
- y la pregunta importante no es si la interfaz ya “pasó” por un paso, sino si el backend puede demostrar por sí mismo por qué esa transición sigue siendo legítima ahora

En resumen:

> un backend más maduro no trata los wizards y formularios multi-step como si la interfaz pudiera actuar como máquina de estados confiable del proceso, sino como una ayuda de UX cuya narración del progreso todavía debe ser reconstruida y validada por el servidor antes de volverse verdad de negocio.  
> Entiende que la pregunta importante no es solo en qué pantalla está el usuario, sino qué condiciones reales del dominio ya se cumplieron, cuáles siguen vigentes y qué transición corresponde efectivamente ahora.  
> Y justamente por eso este tema importa tanto: porque muestra una de las formas más comunes de client-side trust no obvio, la de dejar que el frontend describa el workflow como si describiera el estado real del proceso, que es una de las maneras más silenciosas de convertir navegación de UI en autoridad indebida sobre negocio y autorización.

---

## Próximo tema

**Cierre del bloque: principios duraderos para no delegar autoridad al frontend**
