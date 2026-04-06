---
title: "Dependencias directas y transitivas: el riesgo que heredamos aunque no lo veamos"
description: "Por qué una gran parte de la superficie real de un sistema está formada por componentes que no elegimos tan conscientemente como creemos, y cómo las dependencias transitivas amplían el riesgo más allá de lo visible."
order: 107
module: "Supply chain, terceros y confianza extendida"
level: "intermedio"
draft: false
---

# Dependencias directas y transitivas: el riesgo que heredamos aunque no lo veamos

En el tema anterior vimos **por qué la seguridad no termina en nuestro propio código ni en nuestra propia infraestructura**, y cómo dependencias, proveedores, integraciones y tooling externo también forman parte del riesgo real del sistema.

Ahora vamos a estudiar una de las piezas más importantes dentro de ese problema: las **dependencias directas y transitivas**.

La idea general es esta:

> una gran parte de la superficie real de un sistema está formada por componentes que no elegimos de manera tan consciente como creemos, y cuyo riesgo heredamos aunque no los hayamos escrito ni revisado en profundidad.

Esto es especialmente importante porque muchas veces un equipo piensa algo como:

- “nosotros usamos estas librerías”
- “estas son nuestras dependencias”
- “elegimos estos paquetes”
- “esto es lo que realmente entra al sistema”

Pero en la práctica suele haber una segunda capa mucho más amplia:

- dependencias de dependencias
- plugins traídos por otras librerías
- utilidades compartidas
- artefactos auxiliares
- subcomponentes incluidos indirectamente
- versiones heredadas por transitive resolution
- piezas que llegan al sistema sin una decisión explícita y consciente por parte del equipo

La idea importante es esta:

> lo que ejecuta o afecta al sistema real no siempre coincide con lo que el equipo cree haber elegido directamente.

Y esa diferencia importa muchísimo para seguridad.

---

## Qué entendemos por dependencia directa

Una **dependencia directa** es una pieza que el equipo incorpora de forma explícita.

Por ejemplo, cuando decide usar:

- una librería
- un framework
- un SDK
- un plugin
- una imagen base
- una herramienta de build
- una dependencia de infraestructura o de runtime

La clave es que existe una decisión visible y relativamente consciente de incluirla.

La idea importante es esta:

> la dependencia directa es la parte de la cadena que vemos mejor porque aparece cerca de nuestra intención original de diseño o implementación.

---

## Qué entendemos por dependencia transitiva

Una **dependencia transitiva** es una pieza que llega al sistema porque otra dependencia la trae consigo.

Es decir:

- nosotros elegimos A
- A depende de B
- B depende de C
- y C termina participando en nuestro sistema aunque jamás la hayamos elegido de manera explícita

La clave conceptual es esta:

> una dependencia transitiva puede influir en el sistema aunque el equipo ni siquiera la tenga presente como parte de su mapa mental principal.

Y justamente por eso merece atención especial.

---

## Por qué esta diferencia importa tanto

Importa porque cambia mucho la percepción del riesgo real.

Si el equipo piensa solo en dependencias directas, puede creer que su superficie heredada es relativamente pequeña y controlable.

Pero cuando suma también las transitivas, aparece otra realidad:

- más código heredado
- más comportamientos ajenos
- más relaciones de confianza
- más versiones y compatibilidades
- más caminos por los que entra riesgo
- más piezas cuyo mantenimiento no controlamos
- más complejidad en el árbol real del sistema

La lección importante es esta:

> una parte importante del riesgo de software no entra por lo que elegimos directamente, sino por todo lo que esa elección arrastra detrás.

---

## Qué diferencia hay entre “usar” y “heredar”

Este matiz ayuda mucho.

### Usar
Implica una relación más consciente y visible:
- el equipo sabe que la pieza está
- la menciona
- la integra
- la ve en el diseño

### Heredar
Implica que la pieza entra al sistema como parte de otra decisión, sin recibir siempre el mismo nivel de atención o revisión.

Podría resumirse así:

- usamos lo que elegimos
- heredamos mucho de lo que esa elección trae consigo

La idea importante es esta:

> la superficie de riesgo heredada suele ser bastante mayor que la superficie de riesgo conscientemente elegida.

---

## Por qué el riesgo transitivo suele pasar desapercibido

Pasa desapercibido por varias razones.

### Porque no aparece en la decisión inicial

El equipo siente que “eligió una librería”, no veinte piezas encadenadas detrás de ella.

### Porque no se ve en el diseño funcional

No suele aparecer en diagramas, flujos ni conversaciones de producto.

### Porque parece demasiado indirecto

Y lo indirecto suele sentirse menos urgente que lo visible.

### Porque la confianza se delega en cascada

Se piensa algo como:
- “si confiamos en esta dependencia principal, también confiamos en lo que trae”

sin revisar cuánto poder o cuánto riesgo se está heredando realmente.

La lección importante es esta:

> el riesgo transitivo se esconde bien porque entra al sistema a través de decisiones legítimas y aparentemente pequeñas.

---

## Qué tipos de problemas pueden aparecer en dependencias transitivas

Sin entrar en detalles operativos finos, hay varias categorías generales de riesgo.

### Riesgo de seguridad heredado

Una pieza transitiva puede introducir debilidades que el equipo nunca evaluó directamente.

### Riesgo de mantenimiento

Puede quedar atada a versiones viejas, abandonadas o difíciles de actualizar.

### Riesgo de visibilidad pobre

El equipo puede no saber bien que esa pieza existe, para qué sirve o cuánto influye en runtime, build o tooling.

### Riesgo de actualización en cadena

Cambiar algo aparentemente simple puede tocar un árbol más grande de lo esperado.

### Riesgo de confianza excesiva

Se heredan comportamientos, supuestos o accesos sin una revisión proporcional al poder que esos componentes tienen.

La idea importante es esta:

> el riesgo transitivo no es solo “hay más piezas”; también es “hay más piezas influyentes que estamos viendo peor”.

---

## Por qué esto importa tanto en supply chain

Este tema está en el corazón de la supply chain porque muestra que la cadena de confianza no es lineal ni corta.

No se trata solo de:

- “yo confío en esta librería”

Sino de algo más amplio:

- confío en esta librería
- en sus dependencias
- en sus dependencias transitivas
- en las versiones resueltas
- en los artefactos que participan del build
- en las imágenes o componentes de base
- en decisiones que quizás el equipo ni siquiera inspeccionó una por una

La lección importante es esta:

> la cadena de software real es más profunda y más enredada que la lista de dependencias que solemos tener en la cabeza.

---

## Relación con confianza extendida

También se conecta directamente con la **confianza extendida**.

Porque cada dependencia directa suele funcionar como una puerta que amplía la confianza hacia muchas otras piezas.

Eso significa que cuando aceptamos una dependencia principal, a veces también estamos aceptando indirectamente:

- su criterio de selección
- sus versiones
- sus transitivas
- sus supuestos
- sus ciclos de mantenimiento
- sus limitaciones
- sus futuros cambios

La idea importante es esta:

> en supply chain, confiar en una sola pieza puede equivaler a extender la confianza a un conjunto mucho más grande de actores y componentes de lo que parece al principio.

---

## Relación con modelado de amenazas

Este tema mejora mucho el modelado de amenazas porque obliga a preguntar cosas como:

- ¿qué piezas realmente participan del sistema además de las que el equipo nombra?
- ¿qué parte del riesgo entra heredada en vez de diseñada?
- ¿qué dependencias concentran más influencia aunque no sean visibles para producto o negocio?
- ¿qué árbol de componentes toca funciones sensibles o críticas?
- ¿qué actor externo está representado indirectamente por este conjunto de dependencias?

La lección importante es esta:

> un modelado de amenazas que solo considera las piezas conscientemente elegidas puede dejar fuera buena parte de la superficie técnica heredada.

---

## Relación con arquitectura y operación

También impacta mucho en arquitectura y operación.

Porque a veces una pieza transitiva termina influyendo en:

- autenticación
- manejo de datos
- logs
- build
- empaquetado
- despliegue
- parsing
- serialización
- redes
- archivos
- imágenes base
- runtime

Y el problema no es solo técnico.  
También afecta cosas como:

- capacidad de actualización
- previsibilidad de cambios
- velocidad de respuesta ante incidentes
- claridad del inventario real
- dificultad de contención si una parte del árbol resulta problemática

La idea importante es esta:

> una dependencia transitiva no necesita ser visible para arquitectura para afectar fuertemente la seguridad y la operación de la arquitectura.

---

## Relación con visibilidad e inventario

Este punto es crucial.

No se puede razonar bien sobre riesgo heredado si no existe cierta idea del inventario real de piezas que participan del sistema.

Eso no significa una ilusión de control absoluto sobre cada detalle.  
Pero sí implica reconocer que el árbol real importa.

Porque si no:

- el análisis queda incompleto
- la priorización se vuelve débil
- la reacción ante problemas se vuelve más lenta
- el equipo descubre piezas críticas recién cuando ya hay presión

La lección importante es esta:

> parte de la seguridad de supply chain consiste en ver mejor qué estamos ejecutando, construyendo y heredando realmente.

---

## Ejemplo conceptual simple

Imaginá que un equipo dice:

- “nuestras dependencias principales son pocas”

A simple vista parece una buena noticia.

Pero si cada una de esas dependencias principales arrastra múltiples transitivas, y algunas de ellas participan en:

- build
- autenticación
- parsing
- despliegue
- acceso a datos
- runtime crítico

entonces la superficie real ya no es “pocas piezas”.  
Es un ecosistema bastante mayor que el visible en la primera capa.

Ese es el corazón del tema:

> el riesgo real de dependencias no se mide solo por lo que elegimos nombrar, sino también por todo lo que se esconde detrás de lo que elegimos.

---

## Qué preguntas ayudan a mirar mejor este problema

Hay preguntas muy útiles para empezar.

### Sobre visibilidad
- ¿qué piezas directas elegimos explícitamente?
- ¿qué otras piezas llegan por arrastre?

### Sobre influencia
- ¿qué dependencias heredadas tocan build, runtime o funciones críticas?

### Sobre confianza
- ¿qué estamos aceptando indirectamente cuando incorporamos esta dependencia principal?

### Sobre concentración de riesgo
- ¿qué árbol de dependencias sostiene más poder o más criticidad?

### Sobre respuesta
- si una pieza del árbol diera problemas, ¿qué tan bien sabríamos ubicarla, dimensionarla y actuar?

La idea importante es esta:

> estas preguntas ayudan a sacar el riesgo transitivo de la sombra y a tratarlo como parte real del sistema.

---

## Qué señales muestran que este enfoque está débil

Hay varias pistas bastante claras.

### Ejemplos conceptuales

- el equipo habla solo de las dependencias “conocidas” y casi nunca de las transitivas
- se asume que el árbol heredado ya está cubierto por haber elegido una dependencia principal confiable
- cuesta explicar qué piezas participan realmente en build o runtime más allá de la primera capa
- los incidentes o problemas revelan componentes que nadie tenía muy presentes
- el análisis de riesgo se centra solo en código propio y no en software heredado que efectivamente corre o interviene en la cadena

La idea importante es esta:

> cuando el sistema hereda mucho software pero el análisis casi no lo refleja, la superficie real de supply chain probablemente esté subestimada.

---

## Qué puede hacer una organización para mejorar

Desde una mirada defensiva, algunas ideas clave son:

- distinguir mejor entre lo que el equipo elige directamente y lo que hereda transitivamente
- ampliar el mapa mental del sistema para incluir el árbol real de piezas relevantes
- prestar especial atención a dependencias heredadas que tocan build, despliegue, autenticación, datos o runtime sensible
- tratar el inventario y la visibilidad como parte del problema de seguridad, no solo de mantenimiento
- asumir que aceptar una dependencia principal implica aceptar también una parte del riesgo arrastrado por su ecosistema
- conectar este análisis con priorización, arquitectura y capacidad de respuesta ante problemas de supply chain

La idea central es esta:

> una organización madura no solo pregunta “qué dependencias usamos”, sino también “qué riesgo estamos heredando detrás de lo que creemos que usamos”.

---

## Error común: pensar que si el equipo no eligió explícitamente una pieza, entonces esa pieza no merece demasiada atención

No.

Puede merecer mucha atención justamente porque:

- participa en runtime
- participa en build
- influye en integridad
- influye en despliegue
- influye en funciones sensibles
- puede ser difícil de ver o de cambiar rápidamente

Lo heredado también importa.

---

## Error común: creer que este problema es solo de tamaño del árbol de dependencias

No solamente.

No es solo cuántas piezas hay, sino:

- qué poder tienen
- qué parte del sistema tocan
- cuánto confiamos en ellas
- qué tan visibles son
- qué tan difícil sería reaccionar si una de ellas se volviera problemática

La cantidad importa, pero la criticidad importa más.

---

## Idea clave del tema

Las dependencias directas y transitivas muestran que una parte importante del riesgo de software no entra solo por lo que elegimos conscientemente, sino también por lo que heredamos detrás de esas elecciones, a veces con mucha menos visibilidad de la que creemos.

Este tema enseña que:

- la superficie real de dependencias es más grande que la lista mental del equipo
- lo transitivo también participa del riesgo, aunque no haya sido elegido explícitamente
- la confianza extendida en software se propaga en cadena
- una organización madura intenta ver mejor qué está heredando además de lo que está adoptando directamente

---

## Resumen

En este tema vimos que:

- una dependencia directa es la que elegimos explícitamente
- una dependencia transitiva es la que entra por arrastre a través de otra
- gran parte del riesgo de supply chain se amplía por esas relaciones heredadas
- este análisis mejora modelado de amenazas, visibilidad, inventario y priorización
- no alcanza con pensar solo en las piezas conocidas o elegidas de manera consciente
- la defensa madura trata el árbol real de dependencias como parte del sistema real

---

## Ejercicio de reflexión

Pensá en un sistema con:

- librerías principales
- frameworks
- SDKs
- imágenes base
- pipeline de build
- runtime en producción
- integraciones críticas
- herramientas operativas

Intentá responder:

1. ¿qué piezas cree el equipo que usa directamente?
2. ¿qué otras piezas importantes llegan por arrastre detrás de esas decisiones?
3. ¿qué dependencia transitiva podría tener más influencia real de la que aparenta?
4. ¿qué diferencia hay entre elegir una pieza y heredar su ecosistema?
5. ¿qué revisarías primero para entender mejor la superficie real de software heredado?

---

## Autoevaluación rápida

### 1. ¿Qué es una dependencia directa?

Es una pieza que el equipo incorpora de manera explícita y consciente.

### 2. ¿Qué es una dependencia transitiva?

Es una pieza que llega al sistema porque otra dependencia la trae consigo.

### 3. ¿Por qué esto importa para seguridad?

Porque una parte importante del riesgo real viene de software heredado que participa en build, runtime o funciones sensibles aunque no haya sido elegido directamente.

### 4. ¿Qué defensa ayuda mucho a mejorar esta etapa?

Ampliar visibilidad e inventario sobre el árbol real de dependencias y tratar lo transitivo como parte del sistema y de su riesgo.

---

## Próximo tema

En el siguiente tema vamos a estudiar **qué terceros reciben poder real: proveedores, integraciones y tooling con acceso delicado**, para entender por qué el riesgo no depende solo del software que usamos, sino también de quién puede observar, modificar o operar partes sensibles del sistema desde fuera de nuestro control directo.
