---
title: "Introducción a client-side trust y decisiones peligrosas basadas en el frontend"
description: "Introducción a client-side trust y decisiones peligrosas basadas en el frontend en aplicaciones Java con Spring Boot. Qué significa realmente confiar de más en el cliente y por qué el problema no es solo que el usuario pueda modificar datos, sino que el backend tome como autoridad decisiones que la UI nunca debió sostener."
order: 243
module: "Client-side trust y decisiones peligrosas basadas en el frontend"
level: "base"
draft: false
---

# Introducción a client-side trust y decisiones peligrosas basadas en el frontend

## Objetivo del tema

Entender qué significa realmente **client-side trust** en aplicaciones Java + Spring Boot, y por qué esta categoría no debería pensarse solo como:

- “el usuario puede tocar el HTML”
- “el cliente puede cambiar JavaScript”
- “el navegador no es confiable”
- “nunca confíes en el frontend”

Todo eso apunta en la dirección correcta, pero suele quedarse corto.

La idea de este tema es abrir un nuevo bloque con una advertencia más precisa:

> el problema no es solo que el cliente pueda modificar datos,  
> sino que el backend empiece a tratar como **autoridad** decisiones que la UI nunca debió sostener.

Y eso aparece cuando el servidor toma como si fueran válidas o suficientes cosas como:

- precios enviados por el cliente
- descuentos calculados en frontend
- flags de visibilidad
- pasos del flujo marcados como “ya completados”
- roles, permisos o capacidades “inferidas” desde la UI
- identificadores de recurso que el cliente arma
- campos hidden que parecen “internos”
- checks ya hechos en frontend
- validaciones de negocio supuestamente resueltas del lado del navegador

Ahí empieza esta familia de problemas.

Porque una cosa es que el frontend sirva para:

- mostrar
- guiar
- pedir datos
- mejorar UX
- evitar errores comunes
- reducir roundtrips

Y otra muy distinta es que el backend empiece a asumir:

- “si la UI no mostró ese botón, entonces no pueden hacerlo”
- “si el campo vino oculto, entonces está bien”
- “si el frontend ya calculó el total, entonces lo aceptamos”
- “si el wizard llegó al paso 4, entonces ya hizo correctamente los pasos 1 a 3”
- “si la app móvil manda este flag, entonces la operación está autorizada”

En resumen:

> client-side trust importa porque el riesgo no nace solo de inputs manipulables,  
> sino de que el servidor delegue a la capa de presentación decisiones de negocio, de autorización o de integridad que debían permanecer bajo control del backend.

---

## Idea clave

La idea central del tema es esta:

> el frontend puede ayudar a **describir** la intención del usuario,  
> pero no debería convertirse en la fuente final de verdad sobre lo que el sistema está autorizado a hacer.

Eso cambia bastante la forma de revisar flujos.

Porque una cosa es pensar:

- “la UI ya validó esto”
- “el cliente ya calculó el importe”
- “el botón solo aparece si corresponde”
- “este campo lo manda la app y listo”

Y otra muy distinta es preguntarte:

- “¿qué parte de esta decisión sigue controlando realmente el servidor?”
- “¿si el cliente mintiera o se equivocara, el backend lo detectaría?”
- “¿esta información viene del cliente como dato o como policy?”
- “¿estamos usando el frontend para comodidad o para decidir algo que el backend debió reconstruir?”

### Idea importante

La UI puede guiar la interacción.
La autoridad final sobre seguridad, integridad y negocio sigue teniendo que vivir del lado del servidor.

### Regla sana

Cada vez que el backend consuma algo sensible proveniente del cliente, preguntate:
- “¿esto es una propuesta del usuario?”
o
- “¿lo estamos tratando como una decisión ya resuelta que el servidor solo acata?”

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- asumir que un campo hidden o deshabilitado es “seguro”
- tomar precios o descuentos del frontend como si fueran finales
- inferir autorización desde lo que la UI mostró o no mostró
- aceptar pasos de wizard como prueba de que el flujo previo se cumplió correctamente
- confiar en flags o atributos de presentación como si fueran policy real
- no distinguir entre dato aportado por el cliente y decisión que el backend debió recalcular

Es decir:

> el problema no es solo que el cliente pueda mandar cualquier cosa.  
> El problema es **qué parte del sistema el backend deja de decidir por confiar demasiado en lo que ya viene armado desde el frontend**.

---

## Error mental clásico

Un error muy común es este:

### “Eso no debería llegar porque la UI no lo permite”

Eso puede ser verdad desde la experiencia normal del usuario.
Pero no alcanza como garantía del sistema.

Porque todavía conviene preguntar:

- ¿qué pasa si igual llega?
- ¿qué pasa si otra app lo manda?
- ¿qué pasa si se toca el request?
- ¿qué pasa si se repite un paso del flujo?
- ¿qué pasa si cambian un hidden field o un valor calculado?
- ¿qué parte del backend sigue pudiendo decidir por sí mismo?

### Idea importante

La ausencia de una opción en la UI no equivale a prohibición real en el sistema.

---

# Parte 1: Qué significa “client-side trust”, a nivel intuitivo

## La intuición simple

Podés pensar **client-side trust** como cualquier situación donde el servidor otorga a datos, decisiones o validaciones del cliente más autoridad de la que deberían tener.

Eso puede implicar confiar en:

- valores visibles
- campos ocultos
- parámetros de UI
- estados de wizard
- claims de la app cliente
- checks ya “hechos” en JavaScript
- totales, subtotales o descuentos
- atributos de visibilidad
- decisiones de selección o filtrado
- identificadores montados desde el frontend

### Idea útil

El problema no es que el cliente participe.
Tiene que participar.
El problema es cuando el backend deja de reconstruir o verificar partes del dominio que nunca debieron depender de la buena conducta del cliente.

### Regla sana

El cliente puede proponer.
El servidor debe decidir.

---

# Parte 2: Presentación no es policy

Este es uno de los aprendizajes más importantes del bloque que empieza acá.

La UI puede:

- ocultar botones
- deshabilitar inputs
- bloquear pasos
- mostrar mensajes
- guiar acciones
- simplificar opciones

Todo eso es útil.
Pero ninguna de esas cosas, por sí sola, constituye una policy real del sistema.

### Idea importante

Que algo no esté visible en la pantalla no significa que el backend deba asumir que “no puede pasar”.

### Regla sana

Nunca trates decisiones de presentación como si fueran enforcement real.

### Idea útil

La UI modela experiencia.
La policy la tiene que modelar el servidor.

---

# Parte 3: Hidden fields y valores “internos” no son internos

Otra trampa muy clásica:
campos como:

- `price`
- `discount`
- `role`
- `stepCompleted`
- `isAdmin`
- `canEdit`
- `finalAmount`
- `resourceOwner`
- `approved`
- `status`

viajan desde el cliente como si fueran parte natural del formulario o del estado de la app.

### Problema

El hecho de que estén en un input hidden, en el store del frontend o en un request “normal” no los vuelve confiables.

### Idea útil

Todo lo que cruza la frontera del cliente sigue siendo input del cliente, incluso si el equipo lo llama “campo interno” o “dato de UI”.

### Regla sana

No confundas:
- “la UI lo generó”
con
- “el backend puede tratarlo como verdad de sistema”.

---

# Parte 4: Lo calculado en frontend es especialmente tentador y especialmente peligroso

Esto aparece muchísimo en flujos de negocio:

- subtotal
- total final
- envío
- impuestos
- descuento
- comisiones
- score
- resultado de validaciones
- elegibilidad para promoción
- ordenamiento o priorización
- selección de la versión “correcta” del recurso

### Idea importante

El frontend puede ayudar a mostrar esos cálculos.
Pero el backend no debería tratarlos como autoridad final si sostienen dinero, permisos, estados o invariantes del negocio.

### Regla sana

Cada vez que el cliente mande un valor derivado importante, preguntate si el servidor lo recalcula o solo lo acepta.

### Idea útil

Mostrar un cálculo en pantalla no es lo mismo que fijar la verdad contable o de negocio del sistema.

---

# Parte 5: Multi-step forms y wizards también pueden esconder trust mal puesto

Este caso es muy común y muy subestimado.

Un flujo de varios pasos suele hacer sentir al equipo que:

- el usuario ya pasó por ciertas validaciones
- ciertos campos ya quedaron establecidos
- cierta elegibilidad ya fue chequeada
- cierto estado del proceso ya está ganado

### Problema

Si el backend luego acepta algo como:

- `currentStep=4`
- `step1Done=true`
- `eligibilityChecked=true`
- `paymentConfirmed=false`
- `reviewAccepted=true`

sin reconstruir qué pasos o condiciones siguen siendo válidos, la UI deja de ser guía y pasa a convertirse en autoridad sobre el workflow.

### Idea importante

Un wizard del frontend no es una máquina de estados confiable del backend.

### Regla sana

No aceptes que el cliente te declare “en qué punto del proceso está” si eso afecta negocio, autorización o integridad del flujo.

---

# Parte 6: La ausencia de botón no es una defensa de autorización

Esto conviene remarcarlo mucho porque sigue pasando muchísimo.

La UI puede esconder acciones como:

- editar
- borrar
- aprobar
- exportar
- ver datos sensibles
- cambiar estado
- invitar usuarios
- tocar configuraciones

Eso está bien para UX.
Pero no alcanza como control.

### Idea útil

Que la UI no muestre la acción solo significa que el cliente “normal” no la expone.
No significa que el backend esté realmente protegido frente a esa operación.

### Regla sana

Cada vez que el equipo diga:
- “pero ese botón no aparece”
respondé mentalmente:
- “¿y qué hace el backend si igual llega la operación?”

### Idea importante

Las autorizaciones reales no pueden depender de la interfaz disponible.

---

# Parte 7: La app móvil o el cliente oficial tampoco son frontera de confianza

Otra simplificación peligrosa:
como el request viene de:

- la app oficial
- el frontend corporativo
- el cliente SPA
- la app móvil
- un wizard propio

el equipo siente que el input “ya viene bien”.

### Problema

Eso no cambia la naturaleza del dato.
Sigue siendo cliente.
Sigue estando fuera de la autoridad final del servidor.
Sigue pudiendo ser alterado, repetido, mezclado o usado fuera del camino esperado.

### Idea útil

El branding del cliente no lo convierte en backend.

### Regla sana

No subas el nivel de confianza del input solo porque provenga de una app que el equipo controla visualmente.

---

# Parte 8: El backend a veces confía no solo en valores, sino en interpretaciones del cliente

Esto es muy importante.

No siempre el cliente manda un dato crudo.
A veces manda una interpretación ya hecha, por ejemplo:

- qué recurso corresponde
- qué fila eligió como “la correcta”
- qué precio aplica
- qué promoción ganó
- qué resultado del wizard vale
- qué subset de permisos “cree” tener
- qué branch del flujo corresponde

### Idea importante

Ahí el cliente no está solo proponiendo datos.
Está proponiendo **semántica**.

### Regla sana

Cada vez que el frontend llegue con una decisión ya cocinada sobre negocio o seguridad, preguntate si el backend podría reconstruirla solo o si simplemente la está aceptando.

### Idea útil

Cuanto más interpretación trae el cliente, más importante se vuelve verificar cuánto de esa interpretación el backend vuelve a construir.

---

# Parte 9: Qué patrones merecen sospecha inmediata

Conviene sospechar especialmente cuando veas cosas como:

- montos, descuentos o scores enviados desde frontend
- flags de visibilidad, rol o permiso en requests
- wizards que informan pasos ya completados
- endpoints que aceptan `status`, `approved`, `isOwner`, `isAdmin`, `canEdit`
- recursos derivados desde la UI en vez de resolverse del lado servidor
- diferencias entre lo que se muestra y lo que se controla realmente
- validaciones de negocio “solo en JavaScript”

### Idea útil

No hace falta que haya un payload raro.
Basta con que el backend tome como autoridad algo que el frontend nunca debió cargar con tanto peso.

### Regla sana

Cada vez que una decisión sensible venga “ya resuelta” por el cliente, exigí preguntarte si el servidor la está verificando o solo acatando.

---

# Parte 10: Qué preguntas conviene hacer desde el inicio del bloque

Cada vez que veas un flujo donde el frontend manda algo importante a una app Spring, conviene empezar a preguntarte:

- ¿esto es dato del usuario o decisión del sistema?
- ¿qué parte del negocio está siendo propuesta por el cliente?
- ¿qué parte el backend recalcula?
- ¿qué pasaría si el cliente mintiera en este campo?
- ¿qué pasaría si mandara un valor que la UI nunca muestra?
- ¿el servidor está validando una intención o aceptando una conclusión ya hecha?
- ¿qué parte del flujo hoy depende demasiado de que el frontend “se porte bien”?

### Idea importante

La review madura no termina en:
- “la UI no permite eso”
Sigue hasta:
- “¿qué hace el backend si igual llega?”

---

# Parte 11: Qué revisar en una app Spring

En una app Spring, conviene sospechar especialmente cuando veas:

- DTOs con campos sensibles que parecen venir “naturales” desde el frontend
- valores calculados del lado cliente aceptados sin recomputar
- roles, flags o permisos derivados desde la UI
- multi-step flows donde el cliente informa progreso o estados intermedios
- endpoints que aceptan `status`, `finalPrice`, `discount`, `ownerId`, `tenantId`, `approved`, `step`
- controles de seguridad apoyados en lo que el frontend muestra o no muestra
- lógica de negocio con validación fuerte en JS y verificación débil en backend

### Idea útil

Si el backend está dejando que el cliente le diga no solo qué quiere hacer, sino también bajo qué reglas debería permitirse, ya conviene revisar client-side trust con mucha atención.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- frontend usado para UX, no para enforcement final
- backend que recalcula o reconstruye lo importante
- menor cantidad de campos sensibles aceptados “tal cual”
- distinción clara entre input del usuario y verdad del sistema
- menos confianza en estados de wizard o flags de presentación
- equipos que entienden que el cliente describe intención, pero no define policy

### Idea importante

La madurez aquí se nota cuando el servidor no delega decisiones críticas a la capa que solo debía presentar y recolectar interacción.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- “la UI no deja hacer eso”
- “ese campo viene hidden”
- “la app ya lo calcula”
- “el paso anterior ya estaba validado”
- “el cliente oficial no mandaría eso”
- “el botón no existe para ese usuario”
- el backend usa campos del frontend como si fueran verdad de negocio o de autorización

### Regla sana

Si una operación sensible depende de que el cliente no cambie algo que el backend nunca reconstruye por su cuenta, probablemente ya hay demasiada confianza puesta en el frontend.

---

## Checklist práctica

Para arrancar este bloque, cuando veas un request desde frontend preguntate:

- ¿qué parte es intención del usuario?
- ¿qué parte parece decisión ya resuelta?
- ¿qué campos sostienen precio, permiso, estado o recurso?
- ¿qué recalcula el servidor?
- ¿qué acepta sin reconstruir?
- ¿qué pasaría si la UI nunca mostrara ese valor pero igual se enviara?
- ¿qué revisarías si asumieras que el cliente puede mentir sin esfuerzo?

---

## Mini ejercicio de reflexión

Tomá un flujo real de tu app Spring y respondé:

1. ¿Qué valores importantes manda hoy el frontend?
2. ¿Cuáles son simples datos de entrada y cuáles parecen decisiones ya cocinadas?
3. ¿Qué recalcula el backend?
4. ¿Qué acepta casi tal cual?
5. ¿Qué campo sería más peligroso si alguien lo alterara?
6. ¿Qué parte del equipo sigue defendiendo el flujo con “la UI no deja”?
7. ¿Qué revisarías primero después de este tema?

---

## Resumen

El client-side trust y las decisiones peligrosas basadas en el frontend importan porque muchos problemas no nacen del hecho trivial de que el cliente pueda mandar cualquier cosa, sino de que el backend le delegue, por comodidad o por costumbre, partes de la autoridad que debían seguir viviendo del lado del servidor.

La gran intuición de este inicio es esta:

- el frontend puede describir intención
- pero no debería fijar policy
- hidden fields, flags de UI y pasos de wizard no son verdad del sistema
- cálculos del cliente pueden servir para mostrar, pero no para decidir solos
- y la pregunta importante no es si la UI “normal” haría algo, sino qué hace el backend cuando igualmente llega

En resumen:

> un backend más maduro no trata al frontend como un socio confiable que ya resolvió precios, permisos, estados o elegibilidad, sino como una capa útil para interacción cuyo output sigue siendo, en esencia, propuesta de cliente hasta que el servidor la reconstruye, la valida y la encuadra dentro de sus propias reglas.  
> Entiende que la pregunta importante no es solo qué datos trae el request, sino cuánto del negocio, de la autorización o del flujo ya viene decidido desde una capa que nunca debió ser la fuente final de autoridad.  
> Y justamente por eso este tema importa tanto: porque abre un bloque donde la atención deja de estar solo en el input manipulable y pasa también a qué decisiones el backend está dejando de tomar por confiar demasiado en la interfaz, que es una de las formas más comunes y más silenciosas de convertir UX en pseudo-seguridad.

---

## Próximo tema

**Precios, descuentos y totales enviados por el cliente: cuando la UI cotiza por el backend**
