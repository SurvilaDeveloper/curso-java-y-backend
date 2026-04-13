---
title: "Identificando una primera identidad técnica o permiso para reducir"
description: "Primer paso concreto del frente de mínimo privilegio dentro del módulo de seguridad. Identificación de una primera identidad técnica o permiso relevante de NovaMarket para empezar a ajustar con más criterio."
order: 171
module: "Módulo 15 · Seguridad y hardening básico"
level: "avanzado"
draft: false
---

# Identificando una primera identidad técnica o permiso para reducir

En la clase anterior dejamos algo bastante claro:

- los permisos técnicos ya no deberían seguir siendo una zona invisible del proyecto,
- y además NovaMarket ya está lo suficientemente maduro como para empezar a aplicar criterio de mínimo privilegio sobre sus propias piezas.

Ahora toca el paso concreto:

**identificar una primera identidad técnica o permiso relevante para reducir o ajustar.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- elegida una primera identidad técnica o permiso importante del sistema,
- mucho más claro qué criterio conviene usar para decidir por dónde empezar,
- y preparada una base muy buena para aplicar luego una primera reducción o ajuste concreto sobre esa parte del proyecto.

La meta de hoy no es rehacer toda la política de permisos.  
La meta es mucho más concreta: **elegir bien qué identidad o permiso conviene revisar primero**.

---

## Estado de partida

Partimos de un proyecto que ya:

- endureció parte del entorno,
- gobierna mejor algunas superficies visibles,
- protege mejor una parte sensible de su operación,
- y empieza a delimitar mejor algunas relaciones internas.

Eso significa que el problema ya no es si conviene revisar privilegios.

Ahora la pregunta útil es otra:

- **qué identidad técnica o qué permiso concreto conviene mirar primero para que el valor sea claro y el cambio tenga sentido real**.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué tipos de identidades y permisos existen dentro de NovaMarket,
- distinguir cuáles tienen más sentido para inaugurar esta etapa,
- elegir un primer caso concreto,
- y dejar un criterio reusable para extensiones posteriores.

---

## Qué queremos resolver exactamente

Queremos evitar dos errores bastante comunes:

### Error 1
Intentar revisar todos los permisos del sistema de una sola vez.

### Error 2
Elegir un caso demasiado secundario o demasiado artificial solo porque parece más fácil.

En lugar de eso, queremos algo más sano:

- empezar por una identidad o permiso real,
- importante,
- justificable,
- y que enseñe bien por qué mínimo privilegio agrega valor al sistema.

Ese cambio de enfoque es el corazón de esta clase.

---

## Paso 1 · Reconocer qué identidades y permisos existen en NovaMarket

A esta altura del proyecto, ya podemos distinguir varias cosas relevantes, por ejemplo:

- service accounts asociadas a piezas concretas,
- permisos que alguna pieza podría estar heredando por default,
- accesos a recursos del cluster,
- o capacidades del runtime que no necesariamente están justificadas.

No hace falta todavía revisarlo todo.

La prioridad ahora es ver claramente el mapa de identidades y permisos posibles.

---

## Paso 2 · Entender que no todos los permisos tienen la misma urgencia

Este punto importa mucho.

No toda identidad técnica merece ser el primer candidato.

Para una primera iteración, conviene buscar algo que combine varias cosas:

- relevancia real,
- visibilidad arquitectónica,
- valor didáctico,
- y una justificación clara de por qué no debería seguir con un margen tan amplio o tan poco revisado.

Ese criterio ayuda muchísimo a evitar decisiones arbitrarias.

---

## Paso 3 · Pensar una pieza central como candidato natural

A esta altura del módulo, un candidato muy razonable suele ser:

- una service account de una pieza importante,
- o una configuración de permisos de una parte central del sistema, como gateway, observabilidad o un servicio funcional clave.

¿Por qué?

Porque es una identidad que:

- representa bien la arquitectura,
- tiene impacto real,
- y hace visible por qué least privilege no significa complicar por complicar, sino ajustar mejor el sistema.

Por eso suele ser una gran puerta de entrada para esta etapa.

---

## Paso 4 · Entender por qué no conviene empezar por algo demasiado escondido

Esto también vale mucho.

Sí, hay permisos más oscuros o menos visibles que también podrían revisarse.

Pero si empezamos por algo demasiado periférico, corremos el riesgo de que el módulo se sienta abstracto o poco conectado con el sistema real.

Por eso conviene elegir una identidad o permiso que importe de verdad y que haga visible el valor de la decisión.

---

## Paso 5 · Entender qué cambia cuando elegimos bien el primer caso

A esta altura conviene fijar algo importante:

si la identidad o el permiso elegido es bueno, el módulo gana muchísimo porque:

- el valor del mínimo privilegio se entiende enseguida,
- la mejora se percibe como parte real del sistema,
- y el resto de la evolución futura se apoya sobre una decisión con mucho peso.

Ese valor estratégico es enorme.

---

## Paso 6 · Proponer un primer caso concreto

Para este punto del recorrido, una opción muy razonable puede ser:

- una service account ligada a una pieza central del sistema,
- o un permiso técnico asociado a una herramienta importante del entorno o a un servicio clave del negocio.

La idea es que este primer ajuste tenga:

- impacto real,
- visibilidad,
- y una justificación natural dentro de una arquitectura que ya vale la pena afinar mejor.

Esa elección suele ser especialmente buena para esta etapa.

---

## Paso 7 · Entender qué NO estamos haciendo todavía

Conviene dejar esto muy claro.

En esta etapa todavía no estamos:

- revisando todas las service accounts del proyecto,
- ni auditando cada permiso del cluster,
- ni cerrando toda la política de mínimo privilegio del sistema.

La meta actual es mucho más concreta:

**elegir una primera identidad técnica o permiso central y bien justificado para empezar a ajustar mejor los privilegios de NovaMarket.**

Y eso ya aporta muchísimo valor.

---

## Paso 8 · Pensar por qué este criterio será reutilizable después

Otra ventaja importante de esta clase es que no solo resuelve “qué permiso tocamos ahora”.

También deja instalado un criterio muy útil para el resto del módulo:

- primero identidades o permisos centrales y visibles,
- luego casos secundarios,
- y después capas más finas o más distribuidas.

Ese orden hace que la seguridad siga creciendo con coherencia.

---

## Paso 9 · Pensar qué gana NovaMarket si empezamos por una identidad o permiso central

A esta altura conviene fijar algo importante:

si el primer ajuste de mínimo privilegio cae sobre una pieza importante, NovaMarket gana enseguida varias cosas:

- más seriedad,
- más realismo,
- más coherencia entre arquitectura y seguridad,
- y una disciplina bastante menos ingenua sobre qué puede hacer cada componente.

Ese impacto vale muchísimo.

---

## Paso 10 · Entender por qué esta clase importa tanto

Puede parecer que esta clase solo “elige un permiso”.

Pero en realidad hace algo mucho más importante:

- define dónde va a empezar a cambiar de verdad la postura del sistema respecto de sus privilegios técnicos,
- y condiciona mucho la claridad y el valor del resto de esta nueva etapa del módulo.

Por eso este paso, aunque parezca pequeño, es bastante decisivo.

---

## Qué estamos logrando con esta clase

Esta clase identifica la primera identidad técnica o el primer permiso sobre el que NovaMarket va a empezar a aplicar una lógica más explícita de mínimo privilegio.

Ya no estamos solo diciendo que los privilegios técnicos también importan.  
Ahora también estamos eligiendo con criterio dónde empezar a volverlo real dentro de la arquitectura.

Eso es un salto importante.

---

## Qué todavía no hicimos

Todavía no:

- aplicamos una reducción concreta de privilegios sobre ese caso,
- ni validamos todavía cómo cambia el sistema después de ese primer ajuste.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**elegir bien la primera identidad técnica o permiso donde conviene empezar a aplicar mínimo privilegio en NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Querer revisar todos los permisos del sistema de una sola vez
Conviene empezar por una identidad o permiso claro y central.

### 2. Elegir algo demasiado secundario solo porque es más fácil
Eso le quitaría valor a esta etapa.

### 3. Empezar por un caso muy escondido sin haber validado primero uno visible y justificable
El orden importa muchísimo.

### 4. Pensar que la elección del permiso es un detalle menor
En realidad condiciona mucho la claridad del resto del frente.

### 5. No justificar por qué esa identidad o permiso vale la pena
El primer ajuste de mínimo privilegio tiene que tener sentido arquitectónico y operativo.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener muy claro cuál es la primera identidad técnica o permiso relevante de NovaMarket sobre el que conviene empezar a aplicar mínimo privilegio y por qué esa elección es la más razonable para esta etapa.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- ya tenés un mapa bastante claro de identidades y permisos posibles,
- distinguís cuáles son centrales y cuáles son secundarios,
- elegiste un primer caso con valor real,
- y sentís que esa decisión le da mucha más claridad al resto de este nuevo frente del módulo.

Si eso está bien, ya podemos pasar a aplicar una primera reducción concreta de privilegios sobre NovaMarket.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a aplicar una primera reducción o ajuste básico de privilegios técnicos sobre el caso elegido y a validar cómo cambia la postura general del sistema después de esa decisión.

---

## Cierre

En esta clase identificamos una primera identidad técnica o permiso para reducir.

Con eso, NovaMarket deja de tratar sus privilegios internos como una zona invisible o heredada por comodidad y empieza a mover este frente hacia una decisión concreta, visible y con mucho valor para la madurez real de la arquitectura.
