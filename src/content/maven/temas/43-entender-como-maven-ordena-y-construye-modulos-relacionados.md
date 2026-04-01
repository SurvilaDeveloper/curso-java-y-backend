---
title: "Entender cómo Maven ordena y construye módulos relacionados"
description: "Cuadragésimo tercer tema práctico del curso de Maven: aprender cómo Maven organiza el build de una estructura multi-módulo cuando existen dependencias entre módulos, entender por qué el orden lógico importa y cómo leer mejor la construcción del sistema como conjunto."
order: 43
module: "Herencia, parents y multi-módulo"
level: "intermedio"
draft: false
---

# Entender cómo Maven ordena y construye módulos relacionados

## Objetivo del tema

En este cuadragésimo tercer tema vas a:

- entender cómo Maven organiza el build cuando hay dependencias entre módulos
- ver por qué el orden lógico de construcción importa
- distinguir entre el orden visual de carpetas y el orden real del build
- leer mejor lo que pasa cuando Maven construye un sistema multi-módulo como conjunto
- reforzar la idea de que una estructura modular no solo agrupa piezas, sino que también impone relaciones de construcción

La idea es que entiendas mejor cómo Maven piensa el sistema cuando varios módulos dependen entre sí y cómo esa lógica afecta la compilación del conjunto.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear una raíz multi-módulo
- distinguir entre parent y agregador
- declarar módulos con `<modules>`
- crear módulos hijos
- declarar dependencias entre módulos
- construir el sistema desde la raíz
- usar `dependency:tree` para ver relaciones de dependencia

Si hiciste los temas anteriores, ya estás listo para este paso.

---

## Idea central del tema

En el tema anterior viste que un módulo puede depender de otro módulo del mismo sistema.

Por ejemplo:

- `modulo-app` depende de `modulo-core`

Eso ya introduce una relación real entre piezas del sistema.

Ahora aparece una pregunta muy importante:

> si un módulo necesita a otro para compilar, ¿cómo sabe Maven en qué orden construirlos?

La respuesta general es:

> Maven no construye módulos multi-módulo como si fueran carpetas sueltas; los construye respetando la lógica de sus relaciones.

Eso es exactamente lo que vas a entender mejor en este tema.

---

## Por qué este tema importa

Porque cuando empezás a trabajar con varios módulos,
ya no alcanza con saber:

- qué módulos existen
- quién depende de quién

También necesitás entender:

- cómo se coordina el build real
- qué módulo tiene que estar listo antes
- cómo leer la construcción del sistema como conjunto

Y esto es muy importante,
porque si no entendés esta parte,
el multi-módulo puede parecer magia o desorden cuando en realidad tiene una lógica bastante fuerte.

---

## Una intuición muy útil

Podés pensarlo así:

- las dependencias entre módulos no solo expresan reutilización
- también expresan una dirección de construcción

Si `modulo-app` depende de `modulo-core`,
entonces `modulo-core` tiene que estar en condiciones de servir al build antes que `modulo-app`.

Esa idea vale muchísimo.

---

## Primer ejemplo conceptual

Imaginá esta estructura:

```text
mi-sistema/
├── pom.xml
├── modulo-core/
├── modulo-api/
└── modulo-app/
```

Y estas relaciones:

- `modulo-app` depende de `modulo-core`
- `modulo-api` también depende de `modulo-core`

Entonces ya no alcanza con decir:
- “hay tres módulos”

Ahora también importa:
- `core` tiene un rol más basal
- `app` y `api` se apoyan en él

Eso ya sugiere una lógica de construcción.

---

## Qué orden NO conviene asumir

No conviene pensar que Maven necesariamente construye:

- por nombre alfabético
- por el orden visual de carpetas
- o por el simple orden en que vos imaginás los módulos sin mirar relaciones

Lo que más importa son las relaciones reales entre módulos.

Entonces aparece una idea muy importante:

> en multi-módulo, el orden lógico del build importa más que la simple apariencia de la estructura.

---

## Qué significa “orden lógico” en este contexto

Significa que Maven necesita respetar dependencias.

Si un módulo A necesita a un módulo B,
entonces no puede tratarse como si A fuera completamente independiente de B al momento de construir el sistema.

No hace falta que hoy bajes a todos los detalles internos del algoritmo de ordenamiento.
Lo importante es que entiendas esta idea general:

> la red de dependencias entre módulos influye en cómo tiene sentido construir el conjunto.

---

## Primer experimento práctico

Tomá la estructura que armaste en el tema anterior:

- raíz multi-módulo
- `modulo-core`
- `modulo-app`
- dependencia de `modulo-app` hacia `modulo-core`

Ahora, desde la raíz, corré:

```bash
mvn clean compile
```

## Qué deberías observar

Mirando la salida de Maven, intentá detectar:

- cuándo aparece `modulo-core`
- cuándo aparece `modulo-app`

La idea no es solo que “compiló todo”,
sino empezar a mirar el build como secuencia estructurada.

---

## Qué aprendiste con esto

Que cuando los módulos ya no son independientes,
la construcción conjunta ya no es una simple suma lineal sin sentido.

Hay una lógica de relación detrás.

Y eso ya es muy importante para entrar en multi-módulo real.

---

## Qué relación tiene esto con la arquitectura del sistema

Muchísima.

Si tenés una arquitectura donde:

- unas piezas son base
- otras consumen esas piezas

entonces Maven termina reflejando eso también en el build.

Por eso este tema no es solo “sobre orden”.
Es también sobre cómo la arquitectura se expresa en la construcción del sistema.

Entonces aparece una verdad importante:

> en una estructura Maven multi-módulo, el build empieza a revelar la arquitectura del sistema.

Esa frase vale muchísimo.

---

## Ejercicio 1 — dibujar dependencias entre módulos

Quiero que hagas esto en papel o texto:

### Dibujá una mini red como esta:
- `modulo-core`
- `modulo-api`
- `modulo-app`

y definí:
- qué módulo depende de cuál

Después respondé:
- ¿cuál parece más basal?
- ¿cuál parece más “de arriba” en la arquitectura?
- ¿qué módulo debería estar resuelto antes para que otro pueda compilar?

### Objetivo
Conectar dependencias Maven con lectura arquitectónica.

---

## Qué diferencia hay entre módulo basal y módulo consumidor

Conviene empezar a sentir esta diferencia.

### Módulo basal
Es uno que ofrece algo reutilizable y que suele ser consumido por otros.

### Módulo consumidor
Es uno que se apoya en otros módulos para construir su comportamiento.

Por ejemplo:
- `core` puede ser basal
- `app` puede ser consumidor

Esa distinción no es una regla eterna,
pero es muy útil para leer sistemas modulares.

---

## Una intuición muy útil

Podés pensarlo así:

- más abajo en la arquitectura = más reutilizable, más base
- más arriba en la arquitectura = más dependiente de piezas previas

Eso te ayuda muchísimo a leer el orden lógico del sistema.

---

## Qué relación tiene esto con dependency:tree

Muy fuerte.

Si te ubicás en `modulo-app` y corrés:

```bash
mvn dependency:tree
```

vas a ver que `modulo-core` aparece como dependencia.

Eso te da una pista de arquitectura,
pero también una pista de build:
- `modulo-app` no está solo
- necesita algo anterior o al menos disponible

Entonces `dependency:tree` sigue siendo muy valioso.

---

## Ejercicio 2 — mirar el árbol del módulo consumidor con otros ojos

Quiero que hagas esto:

### Paso 1
Ubicate en `modulo-app`.

### Paso 2
Corré:

```bash
mvn dependency:tree
```

### Paso 3
Buscá `modulo-core`.

### Paso 4
Respondé:
- ¿qué implica esa dependencia para el código?
- ¿qué implica también para la construcción del módulo?

### Objetivo
Ver que el árbol no habla solo de uso de librerías,
sino también del contexto estructural del módulo.

---

## Qué relación tiene esto con construir desde la raíz vs construir un módulo aislado

Muy importante.

Cuando construís desde la raíz,
Maven conoce:

- el conjunto
- la relación entre módulos
- la estructura compartida

Eso hace que la experiencia sea mucho más coherente.

En cambio, si te aislás demasiado de la raíz,
podés perder parte de esa visión de sistema.

Entonces aparece otra idea importante:

> el multi-módulo se entiende mucho mejor cuando pensás el build desde la raíz del sistema, no solo desde módulos aislados.

---

## Qué pasa si la relación entre módulos está mal pensada

No hace falta hoy entrar en todos los problemas posibles,
pero sí conviene empezar a sentir esto:

- si las dependencias entre módulos son desordenadas
- o van en direcciones raras
- el build del sistema también se vuelve más difícil de leer y sostener

Entonces Maven te obliga un poco a pensar mejor la forma del sistema.

Eso es muy valioso.

---

## Ejercicio 3 — pensar una mala dirección de dependencia

Respondé esta pregunta:

> Si `modulo-core` es la base compartida y `modulo-app` es la aplicación concreta, ¿qué sensación te da que `modulo-core` dependa de `modulo-app` en vez de al revés?

No hace falta una teoría completa.
Lo importante es que empieces a sentir cuándo una dirección de dependencia parece más sana o más extraña.

---

## Qué no conviene asumir todavía

No hace falta que hoy te metas en:

- ciclos entre módulos
- estrategias complejas de reactor
- compilación parcial muy avanzada
- optimizaciones finas de orden

Todo eso puede venir después.

Por ahora, el objetivo es una comprensión fuerte y sana:

- los módulos tienen relaciones
- esas relaciones importan para el build
- Maven construye un sistema, no solo carpetas

Eso ya es muchísimo.

---

## Qué relación tiene esto con effective POM

Sigue siendo importante,
aunque ahora el foco del tema esté más en la coordinación del build.

El effective POM de cada módulo te sigue ayudando a entender:
- qué heredó
- qué declaró
- qué configuración real usa

Mientras que el build desde la raíz te ayuda a entender:
- cómo ese módulo se integra en el conjunto

Entonces tenés dos planos:

- effective POM = configuración efectiva por módulo
- build multi-módulo = coordinación efectiva del sistema

Esa diferencia también es muy útil.

---

## Error común 1 — creer que todos los módulos pueden tratarse como independientes aunque dependan entre sí

No.
Una vez que hay dependencia real,
la lectura del sistema cambia.

---

## Error común 2 — no mirar nunca la salida del build multi-módulo

La salida es una gran fuente de comprensión para ver cómo Maven recorre el sistema.

---

## Error común 3 — asumir que el orden visual del filesystem ya explica el orden del build

No necesariamente.
Las relaciones reales pesan más.

---

## Error común 4 — pensar que este tema es solo “de Maven” y no de arquitectura

En realidad es las dos cosas.
Maven te está obligando a expresar arquitectura modular de una forma coherente.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Tomá tu estructura multi-módulo actual.

### Ejercicio 2
Definí al menos una dependencia real entre módulos, por ejemplo:
- `modulo-app` depende de `modulo-core`

### Ejercicio 3
Desde la raíz, corré:
```bash
mvn clean compile
```

### Ejercicio 4
Mirá la salida y anotá qué módulo aparece como base y cuál como consumidor.

### Ejercicio 5
Ubicate en el módulo consumidor y corré:
```bash
mvn dependency:tree
```

### Ejercicio 6
Escribí con tus palabras qué te mostró este tema sobre la relación entre:
- arquitectura
- dependencias entre módulos
- build del sistema

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Por qué las dependencias entre módulos afectan el build conjunto?
2. ¿Qué diferencia hay entre orden visual de módulos y orden lógico del build?
3. ¿Qué módulo parece más basal en una relación típica `core -> app`?
4. ¿Qué te ayuda a ver `dependency:tree` en este contexto?
5. ¿Por qué este tema también tiene que ver con arquitectura y no solo con Maven?

---

## Mini desafío

Hacé una práctica completa:

1. armá o usá tu sistema multi-módulo
2. definí una relación clara entre módulos
3. construí desde la raíz
4. observá el build
5. corré `dependency:tree` en el módulo consumidor
6. escribí una nota breve explicando:
   - qué módulo actúa como base
   - qué módulo actúa como consumidor
   - y cómo Maven te ayudó a leer mejor esa relación

Tu objetivo es que el multi-módulo deje de parecer una colección de proyectos y pase a verse como una red de piezas con dependencias reales y con lógica de construcción coherente.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este cuadragésimo tercer tema, ya deberías poder:

- entender que las dependencias entre módulos afectan el build conjunto
- distinguir orden visual de orden lógico del sistema
- leer mejor la salida de un build multi-módulo
- usar `dependency:tree` para entender relaciones entre módulos
- y ver Maven como una herramienta que expresa arquitectura modular viva

---

## Resumen del tema

- Los módulos relacionados no solo comparten raíz; también pueden imponer una lógica de construcción.
- Las dependencias entre módulos revelan dirección arquitectónica y orden lógico.
- Maven construye el sistema como conjunto teniendo en cuenta esas relaciones.
- `dependency:tree` sigue siendo una gran herramienta para leer la relación desde un módulo consumidor.
- Este tema conecta Maven y arquitectura de forma muy directa.
- Ya diste otro paso importante hacia una comprensión más profunda del multi-módulo real.

---

## Próximo tema

En el próximo tema vas a aprender a usar un módulo como librería interna reutilizable dentro del sistema y a empaquetarlo de forma más consciente, porque después de entender que los módulos pueden depender entre sí, el siguiente paso natural es tratar uno de ellos claramente como pieza reusable del sistema y reforzar esa idea en el build y en el diseño.
