---
title: "Cómo desarmar una zona caótica sin reescribir todo"
description: "Cómo intervenir en una parte desordenada del backend sin caer en la fantasía de la reescritura total, qué señales ayudan a recuperar control, y qué estrategia permite reducir riesgo mientras el sistema sigue vivo y sosteniendo negocio."
order: 128
module: "Calidad, evolución y mantenibilidad a largo plazo"
level: "intermedio"
draft: false
---

## Introducción

En casi cualquier backend real llega un momento incómodo.

No estás frente a una parte linda del sistema.
Estás frente a una zona que da miedo.

Una de esas partes donde:

- nadie entiende del todo qué pasa
- tocar una línea rompe otra cosa
- hay duplicación, parches y excepciones acumuladas
- los nombres no ayudan
- las reglas reales no están claras
- los tests son pocos, débiles o inexistentes
- cada cambio tarda demasiado
- todos dicen “mejor no tocar eso”

Y entonces aparece una tentación muy fuerte:

**“esto hay que tirarlo y hacerlo de nuevo.”**

A veces suena razonable.
Incluso elegante.
Pero en sistemas vivos, muchas veces no es la mejor decisión.

Porque esa zona caótica:

- probablemente todavía sostiene una parte del negocio
- probablemente está conectada con más cosas de las que parece
- probablemente contiene reglas implícitas que nadie documentó
- probablemente no puede apagarse sin costo real

Por eso, en muchos casos, el trabajo serio no consiste en reescribir todo.
Consiste en **recuperar control gradualmente sobre una parte confusa sin destruir lo que todavía funciona**.

Ese es el foco de este tema.

## Qué es una zona caótica

No toda parte fea del sistema es una “zona caótica”.

Acá hablamos de una porción del backend donde se combinan varias cosas a la vez:

- baja comprensión
- alto riesgo de cambio
- diseño erosionado
- responsabilidades mezcladas
- acoplamiento fuerte
- observabilidad pobre
- cobertura insuficiente
- presión de negocio para seguir tocándola igual

No es simplemente “código viejo”.

A veces hay código viejo bastante estable.
Y a veces hay código relativamente nuevo que ya nació caótico.

La clave no es la antigüedad.
La clave es que el equipo **perdió capacidad de razonar con confianza sobre esa parte**.

## Por qué reescribir todo suele ser más difícil de lo que parece

La fantasía de la reescritura total suele prometer alivio inmediato:

- limpiamos todo
- rediseñamos bien
- eliminamos deuda
- hacemos algo moderno

El problema es que en sistemas reales una reescritura completa rara vez reemplaza solo código.
También intenta reemplazar:

- comportamiento implícito
- edge cases históricos
- integraciones raras
- dependencias invisibles
- decisiones antiguas que nadie recuerda por qué existen
- suposiciones del negocio que viven enterradas en ramas extrañas

Entonces aparece un patrón clásico:

1. el equipo subestima lo que esa zona realmente hace
2. la reescritura tarda más de lo previsto
3. el sistema viejo sigue cambiando mientras tanto
4. el nuevo sistema nace incompleto
5. migrar se vuelve traumático
6. aparecen diferencias funcionales inesperadas

O sea:

**reescribir no elimina automáticamente el caos; muchas veces lo desplaza y le suma riesgo de reemplazo.**

## El problema no es solo el código, sino la falta de control

Cuando una zona duele, es común describirla con frases como:

- “está mal hecha”
- “es un desastre”
- “hay que limpiarla”

Eso puede ser cierto, pero no alcanza para actuar.

La pregunta más útil suele ser otra:

**¿qué es exactamente lo que hoy no podemos controlar?**

Por ejemplo:

- no entendemos el flujo principal
- no sabemos qué casos cubre realmente
- no tenemos tests que congelen comportamiento
- no podemos observar si un cambio lo empeora
- no sabemos qué dependencias lo usan
- no podemos separar responsabilidades sin romper todo
- no sabemos cuál es el borde del problema

Cuando formulás así el problema, la estrategia cambia.
Ya no pensás en “limpiar todo de una”.
Pensás en **recuperar capacidad de ver, entender, aislar y modificar con menos riesgo**.

## La primera meta no es embellecer, sino entender

Un error muy común es entrar a una zona caótica con impulso de ordenar nombres, mover archivos y “dejarlo lindo” enseguida.

Eso puede incluso empeorar las cosas si todavía no entendés:

- qué hace realmente
- qué entradas recibe
- qué salidas produce
- qué invariantes intenta sostener
- qué edge cases están enterrados
- qué otros módulos dependen de ese comportamiento

En una zona de alto riesgo, la primera meta suele ser:

**aumentar comprensión antes de aumentar ambición.**

A veces eso implica trabajo poco glamoroso, pero muy valioso:

- leer flujos completos
- mapear caminos principales
- listar dependencias
- registrar decisiones raras
- identificar reglas de negocio mezcladas con detalles técnicos
- distinguir comportamiento esencial de accidentes históricos

## Antes de cambiar, necesitás una línea de base

Si hoy una parte del sistema es difícil de tocar, necesitás alguna forma de congelar realidad.

No porque esa realidad sea perfecta.
Sino porque si no sabés cómo se comporta hoy, no vas a poder distinguir mejora de ruptura.

Esa línea de base puede construirse con varias herramientas:

- tests de caracterización
- logs puntuales
- métricas antes y después
- ejemplos reales de entradas y salidas
- comparación entre comportamiento actual y comportamiento esperado
- documentación corta de casos conocidos

La idea no es “validar que el diseño actual está bien”.
La idea es **capturar suficiente comportamiento como para poder mover algo sin quedar ciego**.

## Tests de caracterización: una herramienta muy útil en zonas confusas

Cuando una parte es difícil de entender, muchas veces no conviene empezar preguntando:

**“cómo debería ser idealmente?”**

A veces conviene empezar preguntando:

**“qué hace hoy, incluso si no me encanta?”**

Ahí ayudan mucho los tests de caracterización.

No son tests escritos porque el diseño te parezca hermoso.
Son tests escritos para capturar el comportamiento actual de una zona riesgosa.

Sirven para:

- congelar casos que hoy funcionan
- descubrir comportamientos inesperados
- documentar rarezas reales
- evitar romper sin darte cuenta algo que el negocio sí usa
- crear una red mínima antes de empezar a mover piezas

No reemplazan el rediseño posterior.
Pero muchas veces lo hacen posible.

## Observar primero, refactorizar después

En zonas caóticas, la falta de observabilidad complica todo.

Porque si tocás algo y no podés ver:

- si aumentaron errores
- si empeoró la latencia
- si cambió una salida funcional
- si afectaste solo a cierto tenant
- si apareció más retry o más backlog

entonces el cambio queda librado a intuición.

Por eso, antes de una intervención más profunda, suele convenir mejorar la visibilidad con cosas como:

- logs más útiles
- métricas del flujo que duele
- trazabilidad mínima
- eventos de negocio clave
- segmentación por endpoint, tenant o cohorte

A veces la mejor primera mejora no es estructural.
A veces es **hacer visible la zona para poder intervenir mejor después**.

## Cómo pensar una estrategia de intervención gradual

La idea central es simple:

**no intentes ganar control total de golpe. Recuperalo por capas.**

Una estrategia gradual suele incluir varias etapas.

### 1. Delimitar la zona

Primero necesitás contestar:

- ¿dónde empieza y dónde termina el problema?
- ¿qué archivos, módulos, jobs o endpoints están implicados?
- ¿qué dependencias entran y salen?

Si no delimitás la zona, terminás peleando contra una nube difusa.

### 2. Entender el flujo principal

No todos los caminos tienen el mismo peso.

Conviene identificar:

- caso más frecuente
- caso más valioso para negocio
- casos más riesgosos
- ramas históricas poco usadas

Eso evita invertir energía igual en todo desde el primer minuto.

### 3. Congelar comportamiento crítico

Con tests, ejemplos o validaciones que te permitan detectar si rompiste algo importante.

### 4. Reducir opacidad

Agregar observabilidad y documentación mínima.

### 5. Separar responsabilidades de a poco

No toda mezcla se desarma en una sola extracción.
A veces primero separás validación.
Después integración externa.
Después reglas de negocio.
Después persistencia.

### 6. Crear bordes más claros

El objetivo no siempre es “dejar perfecto adentro” de inmediato.
A veces primero conviene mejorar bordes:

- inputs más claros
- outputs más explícitos
- interfaces menos ambiguas
- contratos más entendibles

### 7. Mover comportamiento hacia zonas más sanas

En lugar de reescribir todo el corazón caótico de una vez, a veces podés empezar derivando nuevas reglas o nuevos casos hacia una estructura mejor.

Así el área desordenada deja de crecer mientras la vas vaciando.

## La importancia de dejar de empeorar la zona

Hay una regla práctica muy poderosa:

**antes de arreglar por completo una zona caótica, intentá al menos dejar de empeorarla.**

Eso significa cosas como:

- no seguir agregando lógica nueva en el mismo bloque inmanejable
- no meter más excepciones sin encapsular
- no seguir duplicando reglas
- no continuar expandiendo el acoplamiento

Muchas veces el primer éxito no es “quedó bien”.
Es algo más modesto y muy valioso:

**“al menos ya no la estamos deteriorando más.”**

## Extraer sin romper: cambios pequeños con intención clara

Cuando una zona da miedo, los cambios grandes suelen tener demasiadas variables al mismo tiempo.

Por eso conviene favorecer movimientos pequeños y legibles.

Por ejemplo:

- extraer una validación puntual a una función con nombre claro
- encapsular una llamada externa detrás de una interfaz más limpia
- separar el armado de respuesta del cálculo de reglas
- aislar una transformación repetida
- mover una política de negocio fuera del controller

Cada paso chico debería tener una intención comprensible.

No “refactoricé un poco”.
Sino algo como:

- “separé la lógica de decisión del acceso a datos”
- “congelé el comportamiento de descuentos actuales”
- “aislé el adapter del proveedor externo”
- “evité que nuevas reglas sigan entrando a este método gigante”

## Estrangular una zona, no pelearla de frente

En algunos casos ayuda pensar con una lógica parecida al strangler pattern.

No necesariamente para reemplazar un sistema entero.
También puede servir dentro de un módulo.

La idea sería algo así:

- dejar la parte vieja viva por ahora
- crear una ruta mejor para ciertos casos nuevos
- derivar progresivamente comportamiento hacia la nueva estructura
- comparar resultados
- reducir dependencia de la parte vieja con el tiempo

Eso baja el riesgo frente a una reescritura “big bang”.

En vez de apostar todo a una fecha de reemplazo total, vas ganando terreno de forma incremental.

## Documentar decisiones mientras intervenís

En zonas caóticas, la información suele perderse rápido.

Si entendiste algo importante, conviene registrarlo.

No hace falta escribir tratados gigantes.
Pero sí cosas concretas como:

- qué hace realmente este flujo
- qué casos raros descubrimos
- qué no entendemos todavía
- qué parte quedó congelada y por qué
- qué se aisló y con qué criterio
- qué no conviene tocar por ahora

Esa documentación corta tiene mucho valor porque evita que la comprensión vuelva a evaporarse.

## Cuándo conviene atacar bordes en lugar del centro

A veces el corazón del caos es demasiado delicado para tocarlo primero.

En esos casos puede ser mejor intervenir en los bordes:

- validar mejor las entradas
- normalizar datos antes de entrar
- estabilizar la salida
- encapsular dependencias externas
- reducir variedad de casos antes de llegar al núcleo

¿Por qué sirve esto?

Porque muchas veces el caos interno se vuelve más manejable cuando recibe menos variabilidad y expone menos ambigüedad.

No siempre tenés que empezar por el centro del problema.
A veces conviene empezar por el perímetro.

## Qué hacer cuando no entendés una regla rara

En una zona caótica suelen aparecer fragmentos extraños.

Un `if` raro.
Una corrección histórica.
Una transformación que parece ilógica.

La reacción impulsiva suele ser:

- borrarlo
- simplificarlo
- “limpiarlo”

Pero si no entendés para qué existe, eso puede ser peligroso.

Frente a una rareza, conviene preguntarse:

- ¿qué problema histórico intentó resolver?
- ¿hay datos reales donde todavía importe?
- ¿hay clientes o integraciones que dependan de esto?
- ¿puedo caracterizar el comportamiento antes de tocarlo?
- ¿puedo aislarlo aunque todavía no lo elimine?

No toda rareza merece vivir para siempre.
Pero tampoco toda rareza puede borrarse sin más.

## Recuperar nombres es recuperar capacidad de pensar

En zonas deterioradas, los nombres suelen estar rotos:

- métodos demasiado genéricos
- variables ambiguas
- clases con nombres que ya no representan lo que hacen
- flags que esconden múltiples comportamientos

Mejorar nombres parece cosmético, pero no siempre lo es.

Muchas veces un buen nombre:

- aclara intención
- revela una responsabilidad
- muestra una regla de negocio oculta
- expone una mezcla indebida
- permite discutir diseño con más precisión

En ese sentido, **nombrar mejor también es una forma de recuperar control**.

## Señales de que la intervención va bien

No siempre vas a sentir “ahora esta parte quedó limpia”.

Pero sí podés notar señales concretas de progreso:

- entendés mejor el flujo principal
- hay menos miedo a tocar casos acotados
- existen tests sobre comportamiento crítico
- hay mejores bordes e interfaces
- la observabilidad permite detectar degradaciones
- la lógica nueva ya no entra en el bloque viejo
- ciertas responsabilidades están más separadas
- el tiempo para hacer cambios pequeños empieza a bajar

Eso ya es mucho.

La mejora real en sistemas vivos suele sentirse como **recuperación gradual de maniobrabilidad**, no como perfección instantánea.

## Errores comunes al intentar ordenar una zona caótica

### 1. Querer entender todo antes de tocar nada

A veces nunca llega esa comprensión total.
Necesitás avanzar mientras entendés.

### 2. Hacer cambios demasiado grandes

Aumenta el riesgo y dificulta aprender qué funcionó o qué rompiste.

### 3. Embellecer sin congelar comportamiento

Podés dejar más prolijo algo que ya no se comporta igual.

### 4. Reescribir impulsivamente sin delimitar alcance

La reescritura absorbe más de lo previsto y pierde foco.

### 5. No mejorar observabilidad antes de intervenir

Entonces no sabés si vas mejorando o degradando.

### 6. Seguir agregando lógica nueva en la parte vieja mientras intentás sanearla

Eso hace que el objetivo se mueva todo el tiempo.

### 7. No registrar lo que se va entendiendo

La comprensión ganada se vuelve a perder.

## Ejemplo mental: módulo de pricing lleno de excepciones

Imaginá un módulo de pricing tocado durante años.

Tiene:

- descuentos mezclados con impuestos
- promociones por canal
- excepciones por cliente
- flags viejos
- lógica duplicada entre checkout y backoffice
- resultados difíciles de explicar

La peor idea podría ser intentar reescribir todo pricing en una sola movida.

Una estrategia más realista sería:

- identificar flujos de cálculo más frecuentes
- caracterizar casos reales con tests
- medir divergencias actuales
- separar lectura de configuración de cálculo efectivo
- encapsular promociones nuevas en una capa más clara
- dejar de meter más reglas en el bloque heredado
- migrar ciertos casos hacia una ruta nueva y más explícita

No resolvés todo en una semana.
Pero empezás a transformar una zona ingobernable en una zona intervenible.

## Ejemplo mental: controller gigante que decide demasiado

Supongamos un controller que:

- valida
- transforma
- consulta base
- llama a otro servicio
- decide reglas de negocio
- maneja errores especiales
- arma response
- dispara side effects

Ahí no hace falta rehacer el mundo entero para empezar.

Podrías:

- capturar casos principales con tests
- extraer validación
- mover reglas de decisión a un servicio más explícito
- encapsular la integración externa
- separar el armado de respuesta
- observar latencia y errores por tramo

Cada paso reduce mezcla.
Y esa reducción ya baja el costo de futuros cambios.

## El objetivo final no es pureza, sino capacidad de evolución

Este punto es importante.

Si trabajás sobre sistemas reales, no siempre vas a llegar a una arquitectura soñada.

Pero sí podés aspirar a algo extremadamente valioso:

- que la zona sea más entendible
- que se rompa menos al cambiarla
- que el comportamiento crítico esté más protegido
- que el diseño deje de deteriorarse tan rápido
- que el equipo pueda intervenir con mejor criterio

Eso es muchísimo más útil que una fantasía de pureza que nunca llega a producción.

## Mini ejercicio mental

Pensá estas preguntas:

1. ¿qué parte de tu backend hoy genera más miedo cuando hay que tocarla?
2. ¿el problema principal ahí es mala estructura, falta de tests, baja observabilidad o desconocimiento del comportamiento real?
3. ¿qué podrías hacer esta semana para aumentar comprensión sin intentar reescribir todo?
4. ¿qué comportamiento crítico convendría congelar primero con tests de caracterización o ejemplos reales?
5. ¿qué decisión simple podrías tomar para que esa zona al menos deje de empeorar?

## Resumen

En esta lección viste que:

- una zona caótica no es solo código feo, sino una parte del backend donde el equipo perdió capacidad de entender, observar y cambiar con confianza
- reescribir todo suele ser más riesgoso de lo que parece porque intenta reemplazar también reglas implícitas, edge cases y dependencias mal comprendidas
- el objetivo inicial no es embellecer, sino recuperar control sobre el comportamiento, los bordes y las responsabilidades
- antes de intervenir fuerte conviene construir una línea de base con tests de caracterización, ejemplos reales, métricas y observabilidad mínima
- una estrategia gradual ayuda a delimitar la zona, congelar comportamiento crítico, mejorar visibilidad y separar responsabilidades paso a paso
- dejar de empeorar una parte desordenada ya es un avance importante, porque evita que el costo futuro siga creciendo
- muchas veces conviene atacar bordes, encapsular dependencias y desviar comportamiento nuevo hacia estructuras más sanas en lugar de pelear el caos de frente
- el verdadero progreso en sistemas vivos suele sentirse como recuperación de maniobrabilidad y capacidad de evolución, no como perfección instantánea

## Siguiente tema

Ahora que ya viste cómo intervenir en una parte caótica sin caer automáticamente en la reescritura total, el siguiente paso natural es trabajar **criterios para decidir entre parche, refactor o rediseño**, porque no todos los problemas justifican el mismo tipo de respuesta: a veces conviene contener rápido, a veces ordenar gradualmente y a veces sí replantear más a fondo, pero la diferencia está en saber elegir con criterio y no solo por impulso.
