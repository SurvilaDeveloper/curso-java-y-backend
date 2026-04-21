---
title: "Entendiendo por qué retry ya tiene sentido como siguiente paso de resiliencia en NovaMarket"
description: "Siguiente paso del módulo 11. Comprensión de por qué, después de introducir timeout, ya conviene pensar en retry como respuesta controlada frente a ciertos fallos transitorios."
order: 115
module: "Módulo 11 · Resiliencia y tolerancia a fallos"
level: "intermedio"
draft: false
---

# Entendiendo por qué retry ya tiene sentido como siguiente paso de resiliencia en NovaMarket

En la clase anterior cerramos una primera capa muy importante del bloque de resiliencia:

- ya existe un escenario real de lentitud entre servicios,
- ya agregamos un timeout real sobre una llamada crítica,
- y además NovaMarket ya dejó de aceptar esperas indefinidas frente a una dependencia degradada.

Eso ya tiene muchísimo valor.

Pero ahora aparece una pregunta muy natural:

**si una llamada falla porque la dependencia tardó demasiado o tuvo un problema transitorio, conviene darla por perdida de inmediato o a veces tiene sentido volver a intentarla?**

Ese es el terreno de esta clase.

Porque una cosa es decir:

- “no voy a esperar para siempre”.

Y otra bastante distinta es decidir:

- “ya sé que no puedo esperar indefinidamente, pero quizá una nueva oportunidad corta y controlada sí tenga sentido”.

Ese es exactamente el siguiente problema que conviene abrir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- claro qué es un retry en este contexto,
- entendida la diferencia entre timeout y retry,
- visible por qué reintentar a veces ayuda y a veces empeora la situación,
- y preparado el terreno para aplicar un primer retry real en la próxima clase.

Todavía no vamos a hablar de circuit breaker como si fuera lo mismo.  
La meta de hoy es mucho más concreta: **entender cuándo retry tiene sentido y cuándo deja de ser una buena idea**.

---

## Estado de partida

Partimos de un sistema donde ya:

- una dependencia lenta puede degradar otra pieza del sistema,
- la llamada crítica ya tiene timeout,
- y el bloque ya dejó claro que esperar sin límite ya no es una postura razonable.

Eso significa que el problema ya no es si limitar la espera era necesario.  
Ahora la pregunta útil es otra:

- **si después de cortar una llamada fallida conviene o no volver a intentarla**

Y eso es exactamente lo que vamos a resolver en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué significa retry dentro de un sistema distribuido,
- entender qué tipo de fallos podrían justificar un reintento,
- conectar esta idea con el escenario concreto de NovaMarket,
- y dejar clara la lógica del siguiente paso práctico del bloque.

---

## Qué problema queremos resolver exactamente

Hasta ahora ya logramos algo importante:

- el sistema ya no se queda esperando indefinidamente una dependencia degradada.

Eso fue un gran salto.

Pero a medida que el bloque madura, aparece otra necesidad muy concreta:

**que el sistema pueda distinguir entre un fallo que vale la pena reintentar y un fallo frente al cual insistir solo empeora todo.**

Porque ahora conviene hacerse preguntas como:

- ¿qué pasa si `inventory-service` tuvo una demora puntual pero la siguiente llamada podría salir bien?
- ¿vale la pena reintentar una vez?
- ¿cuántas veces?
- ¿con qué intervalo?
- ¿en qué escenarios insistir es resiliencia y en cuáles es torpeza?  

Ese cambio de enfoque es justamente el corazón de esta etapa.

---

## Qué es retry en este contexto

Para esta etapa del curso, una forma útil de pensarlo es esta:

**retry es una estrategia que vuelve a intentar una operación fallida bajo ciertas condiciones y con ciertos límites.**

Esa idea es central.

No estamos hablando de repetir ciegamente hasta el infinito.  
Estamos hablando de algo mucho más razonable:

- un número acotado de nuevos intentos,
- bajo reglas claras,
- y con la intención de tolerar fallos transitorios.

Ese matiz importa muchísimo.

---

## Por qué retry no es lo mismo que timeout

Este punto vale muchísimo.

A esta altura del módulo conviene fijar algo importante:

### Timeout
Pone un límite de espera.

### Retry
Decide si, después del fallo, vale la pena volver a intentar.

Eso significa que timeout y retry no compiten entre sí.  
Se complementan.

Primero el sistema puede decir:

- “no espero más de cierto tiempo”

y después:

- “si falló, decido si vale la pena intentarlo una vez más”.

Esa diferencia es una de las claves del bloque.

---

## Cuándo retry puede tener sentido

A esta altura del curso, retry puede tener bastante sentido cuando pensamos en fallos como:

- lentitud puntual,
- pequeños problemas transitorios de red,
- o respuestas fallidas que no necesariamente indican que la dependencia quedó en un estado persistentemente roto.

En esos casos, insistir una vez o pocas veces puede mejorar mucho el comportamiento del sistema sin agregar demasiado costo.

Ese es el costado más valioso del patrón.

---

## Cuándo retry puede empeorar las cosas

Este punto importa muchísimo.

Retry no siempre ayuda.

De hecho, en algunos casos puede empeorar bastante una situación ya mala.

Por ejemplo:

- si la dependencia está realmente caída,
- si está saturada,
- o si cada reintento vuelve a cargar todavía más a una pieza ya degradada,

entonces insistir puede transformar un problema puntual en una degradación aún más grande.

Ese matiz es exactamente lo que vuelve importante a este tema.  
Retry no es una receta automática. Requiere criterio.

---

## Cómo se traduce esto a NovaMarket

A esta altura del bloque, nuestro escenario sigue siendo muy claro:

- `order-service` depende de `inventory-service`
- y ya sabemos que una llamada puede fallar por lentitud

La nueva pregunta ahora es:

- si una consulta a inventario falla por timeout, ¿conviene intentar una vez más antes de dar la operación por perdida?

Esa pregunta ya no es teórica.  
Está directamente conectada con un flujo real del sistema.

---

## Qué gana NovaMarket con retry bien usado

Aunque todavía no lo apliquemos en esta clase, el valor ya se puede ver con claridad.

A partir de un retry controlado, NovaMarket puede ganar cosas como:

- mejor tolerancia frente a fallos transitorios,
- menos errores visibles al usuario cuando el problema era puntual,
- y una reacción un poco más elástica del sistema frente a ciertas degradaciones breves.

Eso vuelve al proyecto bastante más maduro desde el punto de vista de resiliencia.

---

## Por qué conviene abrir retry antes que circuit breaker

Esto también importa mucho.

Si fuéramos directamente a circuit breaker, nos saltaríamos un matiz muy importante:

- no todos los fallos ameritan cortar enseguida
- a veces una segunda oportunidad corta y bien controlada sí tiene sentido

Por eso retry aparece muy bien después de timeout y antes de circuit breaker.

Ese orden es muy sano y didácticamente muy fuerte.

---

## Qué todavía no estamos haciendo en esta etapa

Conviene dejar esto muy claro.

En este punto todavía no estamos:

- configurando todavía retry en una llamada real,
- ni decidiendo todavía reglas finales de cantidad de intentos,
- ni combinando aún retry con circuit breaker.

La meta actual es mucho más concreta:

**abrir correctamente el bloque de retry como respuesta controlada a ciertos fallos transitorios.**

Y eso ya aporta muchísimo valor.

---

## Qué estamos logrando con esta clase

Esta clase no aplica todavía retry en código, pero hace algo muy importante:

**abre explícitamente el siguiente frente lógico del módulo 11: darle al sistema una segunda oportunidad controlada frente a ciertos fallos, sin volverlo ingenuo ni destructivo.**

Eso importa muchísimo, porque NovaMarket deja de madurar solo desde “esperar menos” y empieza a prepararse para otra mejora clave: decidir con criterio cuándo insistir una vez más puede ser útil.

---

## Qué todavía no hicimos

Todavía no:

- elegimos todavía cuántos reintentos convienen,
- ni aplicamos todavía retry a la llamada crítica del laboratorio.

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender por qué retry ya tiene sentido como siguiente paso de resiliencia en NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Pensar que retry siempre mejora la resiliencia
No. A veces empeora bastante el problema.

### 2. Confundir retry con esperar más tiempo
Retry y timeout resuelven cosas distintas.

### 3. Insistir demasiadas veces sin criterio
Eso puede sobrecargar más a una dependencia degradada.

### 4. Abrir circuit breaker sin pasar antes por este matiz
Retry explica una parte muy importante del bloque.

### 5. Reducir la clase a teoría
En realidad prepara el siguiente paso práctico del mismo escenario real que ya estamos usando.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener claro qué es retry, por qué no es lo mismo que timeout y por qué en NovaMarket puede ser una respuesta razonable frente a ciertos fallos transitorios, pero no frente a cualquier degradación.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué aporta retry,
- ves por qué timeout y retry se complementan,
- entendés cuándo insistir puede ayudar y cuándo puede empeorar la situación,
- y sentís que el proyecto ya está listo para aplicar un primer retry real con criterio.

Si eso está bien, ya podemos pasar a integrarlo en la llamada crítica de NovaMarket.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a agregar un primer retry real a la llamada crítica entre `order-service` e `inventory-service` para observar cómo cambia el comportamiento del sistema frente a fallos transitorios.

---

## Cierre

En esta clase entendimos por qué retry ya tiene sentido como siguiente paso de resiliencia en NovaMarket.

Con eso, el proyecto deja de reaccionar a los fallos solo con límites de espera y empieza a prepararse para otra mejora muy valiosa: decidir con criterio cuándo una nueva oportunidad controlada puede ayudar a sostener mejor el comportamiento del sistema.
