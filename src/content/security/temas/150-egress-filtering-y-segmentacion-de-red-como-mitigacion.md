---
title: "Egress filtering y segmentación de red como mitigación"
description: "Cómo usar egress filtering y segmentación de red para reducir el impacto de SSRF en una aplicación Java con Spring Boot. Por qué no alcanza con validar destinos en código y cómo la infraestructura puede impedir que un proceso vulnerable alcance hosts, puertos o servicios que nunca debería poder tocar."
order: 150
module: "Consumo saliente, SSRF y conexiones externas"
level: "base"
draft: false
---

# Egress filtering y segmentación de red como mitigación

## Objetivo del tema

Entender por qué el **egress filtering** y la **segmentación de red** son mitigaciones muy valiosas para reducir el impacto de **SSRF** en una aplicación Java + Spring Boot.

La idea de este tema es cerrar la secuencia anterior con una lección importante:

- validar destinos ayuda
- usar allowlists ayuda
- controlar redirects ayuda
- bajar privilegios del proceso ayuda

Pero a veces conviene sumar una capa más básica y brutal:

> hacer que ciertos destinos simplemente **no sean alcanzables** desde ese proceso, aunque el código intente ir hacia allá.

Eso es justamente lo que aportan el egress filtering y la segmentación de red.

En resumen:

> una buena mitigación de SSRF no vive solo en el código.  
> También puede vivir en la infraestructura, haciendo que el proceso vulnerable tenga un universo de salida mucho más pequeño que “todo lo que la red permita por default”.

---

## Idea clave

Una request saliente no depende solo de:

- la URL
- el cliente HTTP
- la validación del código
- los redirects
- el worker que la ejecuta

También depende de una pregunta muy física:

- **¿la red realmente deja que ese proceso llegue a ese destino?**

La idea central es esta:

> si una feature saliente corre en un entorno donde solo puede salir hacia un conjunto muy acotado de hosts, puertos o servicios, entonces muchas rutas de abuso de SSRF quedan cortadas aunque la lógica de aplicación no sea perfecta.

Eso no reemplaza las defensas de aplicación.
Pero sí baja mucho el radio de daño.

### Idea importante

Una validación puede fallar.
Una regex puede quedarse corta.
Un wrapper puede abrirse demasiado.
Pero si la red igual no deja salir hacia localhost, metadata, segmentos internos o destinos no autorizados, el impacto práctico puede reducirse muchísimo.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- confiar solo en validaciones de aplicación para frenar SSRF
- dejar que todos los procesos tengan salida amplia por default
- permitir que workers pequeños alcancen redes internas ricas sin necesidad
- asumir que el backend necesita hablar con “casi cualquier cosa”
- diseñar mitigaciones puramente lógicas sin pensar en la topología real
- no usar la red como límite duro de alcance
- creer que la única forma de defender SSRF es encontrar la validación perfecta

Es decir:

> el problema no es solo que el backend pueda construir una request indebida.  
> El problema también es que la infraestructura le deje camino libre hacia demasiados destinos aunque el negocio jamás necesitó ese alcance.

---

## Error mental clásico

Un error muy común es este:

### “Eso lo resolvemos con allowlists en código; la red no hace falta tocarla”

Eso es demasiado optimista.

Porque el código puede fallar por:

- un caso borde
- una nueva feature
- un wrapper mal usado
- un redirect
- una resolución inesperada
- una omisión futura
- una integración que se abrió de más

En todos esos casos, la red puede ser la diferencia entre:

- un bug incómodo
y
- una SSRF con bastante capacidad lateral

### Idea importante

La infraestructura puede actuar como red de contención cuando la lógica de aplicación no alcanza.

---

## Qué significa egress filtering

En términos simples, **egress filtering** significa controlar **hacia dónde puede salir** un proceso, servicio, contenedor, pod o máquina.

Eso puede incluir restricciones sobre:

- hosts
- IPs
- rangos de red
- puertos
- protocolos
- destinos internos
- destinos externos
- rutas específicas según entorno o rol

### Idea útil

La pregunta que responde es:

> “aunque el proceso intente hacer una conexión, ¿la red debería dejarlo salir hacia ese lugar?”

---

## Qué significa segmentación de red

La **segmentación de red** apunta a dividir mejor qué partes del sistema pueden hablar con cuáles.

En vez de pensar la red interna como un espacio plano donde todos ven todo, se busca algo más acotado:

- ciertos workers ven ciertos servicios
- otros no
- ciertos entornos no llegan a ciertos panels
- ciertos pods o máquinas no pueden tocar metadata o segmentos operativos
- ciertos servicios solo hablan con dependencias mínimas

### Idea importante

La segmentación baja el valor de SSRF porque reduce la cantidad de cosas interesantes que el proceso vulnerable puede ver.

---

## Validación en código vs límite de red

No conviene pensar estas capas como alternativas.
Se potencian entre sí.

### Validación en código
sirve para:
- filtrar temprano
- expresar intención de negocio
- bloquear input no legítimo
- controlar redirects, esquemas y puertos

### Límite de red
sirve para:
- contener escapes
- cortar caminos no previstos
- reducir impacto de bugs
- bajar la riqueza del entorno alcanzable

### Regla sana

La postura madura no es elegir una u otra.
Es combinar ambas.

---

## Una red demasiado plana vuelve más cara cualquier SSRF

Esto es muy importante.

Si el proceso vulnerable puede alcanzar:

- casi toda la red interna
- todos los namespaces
- puertos operativos
- metadata
- paneles
- servicios auxiliares
- APIs privadas

entonces una SSRF tiene mucho espacio para explorar y escalar.

### Idea útil

Una red plana no crea la SSRF, pero sí multiplica su impacto.

### Regla sana

Cuanto más densa y abierta es la red visible para el proceso, más conviene pensar segmentación como mitigación seria y no como lujo de infraestructura.

---

## No todo worker necesita salida irrestricta a internet

Otra idea práctica muy útil.

Muchos procesos salientes realmente necesitan muy poco.
Por ejemplo:

- un worker de preview
- un validador de callback
- un importador pequeño
- un servicio de webhooks a unos pocos dominios
- una integración con un proveedor fijo

Sin embargo, en la práctica a veces corren con:

- salida total a internet
- acceso a redes privadas
- visibilidad de servicios internos
- poca separación de puertos o segmentos

### Idea importante

Si el caso de uso es acotado, el egress también debería ser acotado.

---

## “Todo internet” ya suele ser demasiado amplio para muchas features

A veces se piensa que el problema de SSRF es solo llegar a la red interna.
Pero incluso la salida irrestricta a internet puede ser más de lo que una feature necesita.

Por ejemplo, si el caso de uso real es:
- hablar con dos proveedores fijos
o
- notificar callbacks previamente aprobados bajo reglas estrictas

entonces un egress totalmente abierto sigue dejando un margen muy grande e innecesario.

### Regla sana

El mínimo privilegio de red aplica también hacia afuera, no solo hacia adentro.

---

## Bloquear acceso a localhost, metadata y rangos internos vale mucho

Una de las utilidades más claras de estas mitigaciones es impedir que ciertos destinos sensibles sean directamente inalcanzables desde procesos que no los necesitan.

Eso puede incluir, por ejemplo:

- localhost
- loopback
- metadata endpoints
- segmentos privados
- puertos de administración
- redes del cluster que no deberían ser visibles
- panels o métricas internas

### Idea importante

Si el proceso nunca debió llegar ahí, la mejor política de red es justamente que no pueda.

---

## La segmentación ayuda aunque el actor sea “interno”

Esto también importa cuando la superficie vulnerable no está abierta al público general sino a:

- admins
- tenants
- soporte
- usuarios enterprise
- herramientas internas

Porque el riesgo sigue siendo real si cualquiera de esos actores puede disparar una feature saliente desde un proceso con demasiada visibilidad lateral.

### Regla sana

La segmentación no se justifica solo frente a atacantes totalmente externos.
También sirve contra abuso o error en superficies internas o semiprivilegiadas.

---

## Egress filtering y workers dedicados se potencian

Esto conecta con el tema anterior.

Si ya separaste:

- worker de previews
- servicio de webhooks
- importador documental
- job de callbacks
- admin connector

entonces el siguiente paso lógico es que cada uno tenga una política de salida más acotada.

### Idea útil

Separar procesos sin separar red deja una mejora a mitad de camino.
Separarlos y además recortarles el egress baja mucho más el impacto.

---

## Menos reachability también reduce valor de reconocimiento

Esto conecta directo con los temas de errores, timeouts y reachability.

Si una feature saliente puede alcanzar menos cosas, entonces:

- hay menos hosts para mapear
- menos puertos para diferenciar
- menos servicios internos para descubrir
- menos metadata que confirmar
- menos señales operativas que traducir en errores

### Idea importante

No solo bajás riesgo de exfiltración o movimiento lateral.
También bajás la capacidad de reconocimiento de red.

---

## La red como “última palabra” sobre el alcance real

Otra forma útil de pensarlo es esta:

el código puede intentar cosas.
Pero la red puede decir:

- hasta acá sí
- más allá no

### Idea útil

Esa propiedad es muy valiosa porque introduce un límite duro que no depende de que cada desarrollador use siempre bien un wrapper, recuerde cada allowlist o modele todos los casos borde.

### Regla sana

Cuando un proceso saliente es especialmente riesgoso, conviene que la última palabra sobre su alcance no quede solo en la lógica de aplicación.

---

## Segmentación mala o inexistente: síntomas clásicos

Hay ciertos olores muy típicos de una postura floja:

- todos los pods o servicios ven casi todo
- misma política de salida para procesos muy distintos
- workers pequeños con acceso a redes muy amplias
- localhost y metadata accesibles desde procesos que no lo necesitan
- ningún equipo sabe con claridad qué egress real tiene cada componente
- la red “por default” es mucho más abierta que el contrato del negocio

### Idea importante

Cuando nadie puede describir bien a qué puede salir cada proceso, SSRF suele tener mucho más espacio del necesario.

---

## No reemplaza el diseño de aplicación

También conviene dejar algo muy claro.

Egress filtering y segmentación:

- no reemplazan allowlists
- no reemplazan validación de esquema, host y puerto
- no reemplazan revisar redirects
- no reemplazan clientes HTTP bien diseñados
- no reemplazan mínimo privilegio de identidad

### Regla sana

Son una capa muy potente, pero siguen siendo una capa.
No una excusa para dejar el código desordenado.

### Idea importante

La mejor mitigación es cuando la política del código y la política de red cuentan la misma historia.

---

## Qué preguntas conviene hacer sobre una feature saliente

Cuando revises una superficie de SSRF, conviene preguntar:

- ¿qué hosts o redes necesita realmente esta feature?
- ¿la red actual le deja ver bastante más?
- ¿puede alcanzar localhost?
- ¿puede alcanzar metadata?
- ¿puede alcanzar segmentos internos sensibles?
- ¿tiene salida total a internet aunque no la necesite?
- ¿qué worker o servicio hace la request?
- ¿ese proceso comparte la misma política de egress que otros mucho más poderosos?
- ¿qué parte del riesgo bajarías solo cortando camino de red?
- ¿qué feature concreta se beneficiaría más de una segmentación mejor?

### Idea útil

Si la respuesta frecuente es “no debería necesitar ese alcance”, ya tenés un gran candidato para recortar egress.

---

## Cómo reconocer este problema en una codebase Spring

En una app Spring, este tema no siempre se ve solo leyendo clases.
Pero sí podés detectarlo por señales como:

- muchas features salientes distintas viviendo juntas
- workers con roles o despliegues poco diferenciados
- fuerte dependencia de validaciones de aplicación y casi nada de contención de red
- suposición de que todos los componentes pueden salir a casi cualquier destino
- poca claridad sobre qué puede alcanzar realmente cada proceso

### Regla sana

Si el diseño del software distingue features sensibles, la infraestructura debería empezar a distinguir también sus necesidades de salida.

---

## Qué conviene revisar en una app Spring

Cuando revises egress filtering y segmentación de red como mitigación en una aplicación Spring, mirá especialmente:

- qué procesos hacen requests salientes
- qué redes, hosts y puertos necesitan de verdad
- si pueden alcanzar localhost, metadata o segmentos internos
- si comparten política de salida con otros procesos sin necesitarlo
- si hay separación entre workers y servicios con distinto riesgo
- qué parte del daño de SSRF bajaría solo recortando reachability
- si la política de red refleja el contrato de negocio o solo defaults amplios
- qué feature saliente está más sobredimensionada en alcance real

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- procesos con egress más acotado
- menos red plana
- menos acceso innecesario a segmentos internos
- más separación entre funciones con distinto perfil de riesgo
- bloqueo de destinos sensibles donde no hacen falta
- más alineación entre caso de uso y alcance real de red
- mejor contención si una validación de app falla

### Idea importante

La madurez acá se nota cuando el proceso vulnerable, incluso si se equivoca, ya vive en un entorno mucho más angosto.

---

## Señales de ruido

Estas señales merecen revisión rápida:

- salida amplia por default
- todos los workers comparten la misma red visible
- localhost o metadata alcanzables sin necesidad
- nadie sabe el alcance real de egress por componente
- la única mitigación pensada está en código
- procesos chicos con visibilidad lateral enorme
- features salientes flexibles corriendo en una red demasiado rica

### Regla sana

Cuanto más abierta está la red, más cara se vuelve cualquier superficie imperfecta de SSRF.

---

## Checklist práctico

Cuando revises este tema, preguntate:

- ¿qué egress necesita realmente esta feature?
- ¿qué egress tiene hoy en la práctica?
- ¿puede alcanzar localhost o metadata?
- ¿puede ver más red interna de la necesaria?
- ¿su proceso comparte política con otros sin necesidad?
- ¿qué rango o destino podrías bloquear ya sin romper el negocio?
- ¿qué worker es el más expuesto y a la vez el menos justificado en alcance?
- ¿qué parte del daño de SSRF bajaría solo con segmentación?
- ¿qué política de red hoy contradice el contrato real del feature?
- ¿qué recorte de reachability tendría mejor relación costo/beneficio?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Qué procesos hacen requests salientes?
2. ¿Qué hosts o redes necesitan realmente?
3. ¿Qué más pueden alcanzar hoy?
4. ¿Pueden llegar a localhost, metadata o servicios internos sensibles?
5. ¿Qué worker tiene el egress más amplio sin justificarlo bien?
6. ¿Qué parte del riesgo actual bajarías solo con segmentación?
7. ¿Qué cambio harías primero para que la red acompañe mejor el contrato de la aplicación?

---

## Resumen

Egress filtering y segmentación de red son mitigaciones muy valiosas para SSRF porque permiten que la infraestructura limite el alcance real de un proceso incluso cuando el código no fue perfecto.

Eso ayuda a reducir:

- reachability hacia destinos internos
- acceso a localhost y metadata
- visibilidad lateral
- capacidad de reconocimiento
- radio de daño de una request indebida

En resumen:

> un backend más maduro no deposita toda la defensa contra SSRF en validar bien un string o en esperar que cada wrapper del código aplique siempre la política correcta.  
> También usa la red como mecanismo de contención, porque entiende que una feature saliente puede equivocarse, un redirect puede abrirse o una integración nueva puede heredar demasiada flexibilidad, y que cuando eso pase, tener procesos segmentados y con egress realmente mínimo puede ser la diferencia entre una request rara de poco alcance y una superficie con demasiado camino libre hacia hosts, servicios y privilegios que el negocio nunca quiso poner al alcance de esa parte del sistema.

---

## Próximo tema

**Servicios proxy internos y cómo amplifican SSRF**
