---
title: "Identificando una primera superficie clave para aplicar control de acceso"
description: "Primer paso concreto del frente de identidad y acceso. Identificación de una primera superficie relevante de NovaMarket para aplicar una capa básica de control de acceso."
order: 157
module: "Módulo 15 · Seguridad y hardening básico"
level: "avanzado"
draft: false
---

# Identificando una primera superficie clave para aplicar control de acceso

En la clase anterior dejamos claro algo importante:

- el primer hardening del entorno ya no alcanza por sí solo,
- y además NovaMarket ya está lo suficientemente maduro como para que identidad y control de acceso empiecen a tener sentido como siguiente frente natural.

Ahora toca el paso concreto:

**identificar una primera superficie importante del sistema para aplicar una capa básica de control de acceso.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- elegida una primera superficie relevante de NovaMarket para empezar a gobernar mejor el acceso,
- mucho más claro qué criterio conviene usar para elegir por dónde empezar,
- y preparada una base muy buena para aplicar luego una primera protección concreta sobre el sistema.

La meta de hoy no es resolver toda la capa de identidad.  
La meta es mucho más concreta: **elegir bien dónde conviene empezar**.

---

## Estado de partida

Partimos de un sistema que ya:

- tiene una arquitectura funcional clara,
- ya recibió un primer hardening básico del entorno,
- y ahora abre un frente nuevo: empezar a gobernar quién accede a qué.

Eso significa que el problema ya no es si hace falta control de acceso.

Ahora la pregunta útil es otra:

- **en qué superficie conviene aplicarlo primero para que el valor sea claro y el cambio tenga sentido real?**

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué tipos de superficies existen dentro de NovaMarket,
- distinguir cuáles tienen más sentido para empezar,
- elegir una primera superficie concreta,
- y dejar un criterio reusable para extensiones posteriores.

---

## Qué queremos resolver exactamente

Queremos evitar dos errores bastante comunes:

### Error 1
Intentar proteger “todo” de golpe.

### Error 2
Elegir una superficie poco representativa solo porque es fácil.

En lugar de eso, queremos algo más sano:

- empezar por una superficie importante,
- visible,
- justificable,
- y que enseñe bien por qué control de acceso agrega valor al sistema.

Ese cambio de enfoque es el corazón de esta clase.

---

## Paso 1 · Reconocer qué superficies existen en NovaMarket

A esta altura del proyecto, ya podemos distinguir varias superficies distintas, por ejemplo:

- entrada principal del sistema,
- endpoints funcionales relevantes,
- superficies internas entre servicios,
- herramientas operativas,
- y componentes de observabilidad o administración.

No hace falta todavía proteger todas.

La prioridad ahora es ver claramente el mapa de superficies posibles.

---

## Paso 2 · Entender que no todas tienen la misma urgencia

Este punto importa mucho.

No toda superficie merece ser el primer candidato para esta etapa.

Para una primera iteración, conviene buscar algo que combine varias cosas:

- importancia real,
- visibilidad,
- valor didáctico,
- y una justificación clara de por qué no debería seguir tan abierta como hasta ahora.

Ese criterio ayuda muchísimo a evitar decisiones arbitrarias.

---

## Paso 3 · Pensar la entrada principal como un candidato natural

A esta altura del módulo, un candidato muy razonable suele ser:

- `api-gateway`
- o una parte relevante de la entrada principal del sistema.

¿Por qué?

Porque es una superficie que:

- concentra acceso,
- representa muy bien el sistema,
- y hace evidente por qué control de acceso no es un lujo sino una evolución natural del proyecto.

Por eso suele ser una gran puerta de entrada para esta etapa.

---

## Paso 4 · Entender por qué no conviene empezar por superficies demasiado secundarias

Esto también vale mucho.

Sí, hay partes del sistema que podrían protegerse.

Pero si empezamos por algo demasiado periférico, corremos el riesgo de que el módulo se sienta artificial o poco conectado con el corazón real del proyecto.

Por eso conviene elegir una superficie que importe de verdad y que haga visible el valor de la decisión.

---

## Paso 5 · Entender qué cambia cuando elegimos bien la primera superficie

A esta altura conviene fijar algo importante:

si la superficie elegida es buena, el módulo gana muchísimo porque:

- el valor del control de acceso se entiende enseguida,
- la mejora se percibe como parte del sistema real,
- y el resto de la evolución futura se apoya sobre una decisión con mucho peso.

Ese valor estratégico es enorme.

---

## Paso 6 · Proponer una primera superficie concreta

Para este punto del recorrido, una opción muy razonable puede ser:

- una parte importante del acceso a través de `api-gateway`,
- o un conjunto claro de endpoints relevantes que hoy todavía no deberían seguir tan abiertos como en el curso base.

La idea es que la primera protección tenga:

- impacto real,
- visibilidad,
- y una justificación natural dentro del sistema.

---

## Paso 7 · Entender qué NO estamos haciendo todavía

Conviene dejar esto muy claro.

En esta etapa todavía no estamos:

- protegiendo todas las interacciones internas entre servicios,
- ni resolviendo autorización fina de todo el dominio,
- ni diseñando el mapa total de roles del sistema

La meta actual es mucho más concreta:

**elegir una primera superficie central y bien justificada para empezar a gobernar el acceso.**

Y eso ya aporta muchísimo valor.

---

## Paso 8 · Pensar por qué este criterio será reutilizable después

Otra ventaja importante de esta clase es que no solo resuelve “qué protegemos ahora”.

También deja instalado un criterio muy útil para el resto del módulo:

- primero superficies centrales,
- luego superficies secundarias,
- y después capas más finas o internas.

Ese orden hace que la seguridad siga creciendo con coherencia.

---

## Paso 9 · Pensar qué gana NovaMarket si empezamos por una superficie central

A esta altura conviene fijar algo importante:

si la primera capa de control de acceso cae sobre una superficie importante, NovaMarket gana enseguida varias cosas:

- más seriedad,
- más realismo,
- más coherencia entre arquitectura y seguridad,
- y una evolución mucho menos superficial del sistema.

Ese impacto vale muchísimo.

---

## Paso 10 · Entender por qué esta clase importa tanto

Puede parecer que esta clase solo “elige un lugar”.

Pero en realidad hace algo mucho más importante:

- define dónde va a empezar a cambiar de verdad la relación del sistema con el acceso,
- y condiciona mucho la claridad y el valor del resto del frente de identidad.

Por eso este paso, aunque parezca pequeño, es bastante decisivo.

---

## Qué estamos logrando con esta clase

Esta clase identifica la primera superficie clave sobre la que NovaMarket va a empezar a aplicar control de acceso.

Ya no estamos solo diciendo que identidad importa.  
Ahora también estamos eligiendo con criterio dónde empezar a volverlo real dentro del sistema.

Eso es un salto importante.

---

## Qué todavía no hicimos

Todavía no:

- aplicamos la protección concreta sobre esa superficie,
- ni validamos todavía cómo cambia el sistema después de ese primer control de acceso.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**elegir bien la primera superficie donde conviene empezar a gobernar el acceso en NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Querer proteger todo de una sola vez
Conviene empezar por una superficie clara y central.

### 2. Elegir algo demasiado secundario solo porque es más fácil
Eso le quitaría valor al módulo.

### 3. Empezar por una superficie interna compleja sin haber validado primero una externa o central
El orden importa muchísimo.

### 4. Pensar que la elección de superficie es un detalle menor
En realidad condiciona mucho la claridad del resto de la etapa.

### 5. No justificar por qué esa superficie vale la pena
La primera protección tiene que tener sentido arquitectónico y operativo.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener muy claro cuál es la primera superficie relevante de NovaMarket sobre la que conviene empezar a aplicar control de acceso y por qué esa elección es la más razonable para esta etapa.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- ya tenés un mapa bastante claro de superficies posibles,
- distinguís cuáles son centrales y cuáles son secundarias,
- elegiste una primera superficie con valor real,
- y sentís que esa decisión le da mucha más claridad al resto del frente de identidad y acceso.

Si eso está bien, ya podemos pasar a aplicar una primera capa concreta de control de acceso sobre NovaMarket.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a aplicar una primera capa básica de control de acceso sobre la superficie elegida y a validar cómo cambia el sistema después de esa protección inicial.

---

## Cierre

En esta clase identificamos una primera superficie clave para aplicar control de acceso.

Con eso, NovaMarket deja de hablar de identidad en abstracto y empieza a mover ese frente hacia una decisión concreta, visible y con mucho valor para la madurez real del sistema.
