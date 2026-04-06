---
title: "Server-Side Template Injection (SSTI)"
description: "Qué es Server-Side Template Injection, por qué ocurre, qué impacto puede tener en aplicaciones web y qué principios defensivos ayudan a evitar que entradas externas influyan en plantillas del servidor."
order: 41
module: "Ataques web más avanzados"
level: "intermedio"
draft: false
---

# Server-Side Template Injection (SSTI)

En el tema anterior cerramos el bloque de ataques web clásicos con **Clickjacking**, donde el problema estaba en cómo una persona podía ser inducida a interactuar con una interfaz de forma engañosa.

Ahora vamos a entrar en los **ataques web más avanzados**, empezando por una vulnerabilidad muy importante: **Server-Side Template Injection**, o **SSTI**.

La idea general es esta:

> una aplicación permite que una entrada externa influya de forma insegura en una plantilla que el servidor procesa para construir una respuesta.

Esto vuelve a SSTI especialmente delicada porque la ejecución o interpretación del contenido ya no ocurre principalmente en:

- la base de datos
- el navegador
- o una redirección del flujo

sino dentro del **motor de plantillas del servidor**.

Y eso puede afectar algo mucho más sensible:  
la forma en que la aplicación genera sus respuestas internas.

---

## Qué es una plantilla en este contexto

Una **plantilla** es una estructura que la aplicación usa para construir contenido dinámico.

Por ejemplo, una plantilla puede servir para:

- renderizar una página HTML
- armar correos
- mostrar vistas dinámicas
- interpolar valores
- combinar diseño fijo con datos variables
- construir fragmentos reutilizables

La idea importante es esta:

> la plantilla define la estructura base, y luego el servidor completa partes dinámicas con datos.

Eso es completamente normal y muy común en el desarrollo web.

El problema aparece cuando la aplicación deja que una entrada externa influya más de lo que debería sobre esa plantilla o sobre cómo el motor la interpreta.

---

## Qué significa “server-side”

La expresión **server-side** indica que el procesamiento ocurre del lado del servidor, antes de que la respuesta llegue al navegador.

Esto es importante porque distingue SSTI de otras vulnerabilidades.

### En XSS
El problema aparece en cómo el navegador interpreta contenido no confiable.

### En SSTI
El problema aparece en cómo el **servidor** interpreta o procesa una plantilla.

Eso cambia muchísimo el riesgo.

Cuando el error está del lado servidor, el problema puede afectar no solo la página final que ve la persona usuaria, sino también:

- la lógica de renderizado
- el acceso a datos disponibles en el servidor
- el comportamiento interno de la aplicación
- el alcance de la ejecución en ese entorno

Por eso SSTI suele considerarse una vulnerabilidad especialmente seria.

---

## Qué es Server-Side Template Injection

Una **Server-Side Template Injection** ocurre cuando la aplicación trata una entrada no confiable como si pudiera formar parte de la lógica o de la sintaxis de una plantilla que el servidor procesa.

La idea clave es esta:

- la aplicación esperaba usar la entrada como dato
- pero termina dejándola influir sobre cómo la plantilla se interpreta o se evalúa

Dicho de forma simple:

> el servidor deja de ver la entrada solo como contenido y empieza a tratarla, en cierto grado, como parte activa de la plantilla.

Eso rompe una separación fundamental entre:

- dato
- y lógica de renderizado

Y ahí aparece el riesgo.

---

## Por qué este problema es tan peligroso

Es peligroso porque el motor de plantillas no es un componente cualquiera.

Dependiendo del framework, del motor y del contexto, una plantilla puede tener acceso a:

- variables internas
- objetos del entorno
- funciones auxiliares
- estructuras de datos del servidor
- información contextual de la aplicación

Eso significa que una SSTI puede permitir que una entrada externa altere o influya sobre una capa muy sensible del sistema.

A nivel conceptual, el impacto puede incluir:

- exposición de información interna
- manipulación del renderizado
- acceso a datos no previstos
- afectación del comportamiento del servidor
- ampliación hacia problemas más graves según el motor y el contexto

Por eso SSTI no es solo “una página que se muestra mal”.  
Puede ser un problema profundo de confianza y ejecución del lado servidor.

---

## Qué busca lograr un atacante con SSTI

El objetivo depende mucho del motor de plantillas y del grado de influencia que la aplicación permita, pero conceptualmente un atacante puede intentar:

- alterar cómo se genera la respuesta
- descubrir información interna del entorno
- acceder a variables o datos no previstos
- entender mejor la lógica de la plantilla
- aumentar el alcance de la interacción con el motor
- escalar hacia comportamientos más sensibles del lado servidor

La idea importante es esta:

> el atacante quiere que la aplicación procese su entrada como algo más que simple texto o valor dinámico.

Y cuanto más poder tenga el motor de plantillas dentro del servidor, más delicado puede ser el problema.

---

## Por qué ocurre

SSTI suele aparecer cuando la aplicación mezcla de forma insegura:

- el contenido dinámico aportado desde afuera
- con la lógica o sintaxis que el motor de plantillas usa para renderizar

A nivel conceptual, esto puede pasar cuando:

- se inserta entrada externa dentro de una plantilla sin separación segura
- se construyen plantillas dinámicamente a partir de datos no confiables
- se permite demasiada flexibilidad en cómo se arma la vista
- se asume que cierto valor será tratado solo como texto
- se delega demasiado poder al motor de plantillas sin restringir bien qué parte puede variar

La raíz del problema vuelve a ser una idea ya repetida en el curso:

> el dato externo no debe poder transformarse en control sobre la lógica interna del sistema.

---

## Qué diferencia hay entre usar plantillas y usarlas de forma insegura

Este punto es muy importante.

No hay nada malo en usar motores de plantillas.  
Son herramientas normales y valiosas en muchísimas aplicaciones.

El problema no es “usar plantillas”.  
El problema aparece cuando la aplicación permite que una entrada externa influya de manera insegura sobre:

- la sintaxis
- la estructura
- o el contexto lógico del renderizado

Podría resumirse así:

- renderizar datos dinámicos es normal
- dejar que el dato externo influya como si fuera lógica de plantilla, no

La seguridad no depende de evitar plantillas, sino de respetar bien la frontera entre:

- contenido variable
- y lógica de renderizado

---

## Dónde puede aparecer

SSTI puede aparecer en distintos lugares donde el servidor usa plantillas o mecanismos equivalentes para construir respuestas.

### Páginas HTML dinámicas

Cuando el backend renderiza vistas con contenido variable.

### Correos o mensajes generados por plantillas

A veces estas superficies reciben menos revisión que la web principal.

### Paneles administrativos o internos

No es un problema exclusivo de páginas públicas.

### Generación de reportes o documentos

Cuando la salida se arma con estructuras dinámicas del lado servidor.

### Funciones que construyen fragmentos o vistas de forma muy flexible

Cuanta más libertad tenga la entrada sobre el renderizado, más importante es revisar este riesgo.

---

## Qué impacto puede tener

El impacto depende mucho del motor de plantillas, de cómo se use y de qué acceso tenga a contexto interno.

### Sobre confidencialidad

Puede exponer:

- variables internas
- datos de contexto
- partes del entorno del servidor
- información que la plantilla no debería revelar

### Sobre integridad del renderizado

Puede alterar cómo se construye la respuesta, qué contenido aparece y cómo se comporta la salida generada.

### Sobre seguridad general

Puede convertirse en un punto de entrada hacia fallas más graves si la plantilla tiene demasiado poder o demasiado acceso dentro del servidor.

### Sobre diseño de la aplicación

Revela que el sistema no aisló correctamente la lógica del renderizado respecto de la entrada externa.

Este último punto es importante:  
SSTI suele ser síntoma de una separación muy débil entre la entrada del usuario y una capa interna altamente sensible.

---

## Diferencia entre SSTI y XSS

Conviene distinguirlas bien porque ambas pueden involucrar plantillas, contenido dinámico o salida visible, pero no son lo mismo.

### En XSS
La aplicación envía contenido al navegador de forma insegura y el problema aparece en cómo el navegador lo interpreta.

### En SSTI
La aplicación procesa una plantilla de forma insegura y el problema aparece **antes**, en el servidor.

Podría resumirse así:

- **XSS** rompe la frontera entre dato y contenido activo en el cliente
- **SSTI** rompe la frontera entre dato y lógica de plantilla en el servidor

Las dos son graves, pero SSTI suele ser especialmente delicada porque toca una capa más interna y poderosa del sistema.

---

## Ejemplo conceptual simple

Imaginá una aplicación que usa una plantilla para renderizar una página con datos dinámicos.

Hasta ahí, eso es completamente normal.

Ahora imaginá que, por una decisión insegura, parte del contenido proveniente de una entrada externa no se incorpora como simple dato, sino de una forma que el motor de plantillas interpreta activamente.

Entonces el servidor deja de tratar ese valor como contenido inocuo.  
Empieza a procesarlo dentro de una capa que debería haber permanecido bajo control estricto de la aplicación.

Ese es el corazón de SSTI:

> el dato deja de ser solo dato y empieza a influir sobre la lógica del renderizado del lado servidor.

---

## Qué señales pueden sugerir este problema

Detectarlo no siempre es sencillo desde el uso normal, pero algunas situaciones deberían generar sospecha.

### Ejemplos conceptuales

- construcción dinámica de plantillas a partir de entrada externa
- uso del motor de plantillas sobre contenido que no debería considerarse confiable
- vistas o respuestas cuyo comportamiento cambia de forma extraña ante ciertos valores
- funciones que interpolan o ensamblan plantillas con demasiada libertad
- revisión de código donde la plantilla se arma o procesa con contenido no controlado
- separación poco clara entre “dato que se muestra” y “lógica que renderiza”

Muchas veces el hallazgo aparece más claramente en revisión de diseño o código que en pruebas superficiales de la interfaz.

---

## Por qué no se resuelve solo “filtrando caracteres”

Como en otras vulnerabilidades del curso, ese enfoque suele ser frágil.

La defensa sólida no depende solo de bloquear ciertos símbolos, sino de diseñar correctamente la relación entre:

- el motor de plantillas
- la estructura de la plantilla
- y los datos externos

La pregunta importante no es solamente:

- ¿qué string puede entrar?

sino también:

- ¿la aplicación trata siempre la entrada como dato?
- ¿el motor de plantillas queda aislado de contenido no confiable?
- ¿se evita construir plantillas dinámicamente a partir de entrada externa?

La raíz del problema no es un carácter puntual.  
La raíz es una mala separación entre dato y lógica interna de renderizado.

---

## Por qué sigue siendo un tema importante

SSTI sigue siendo muy relevante porque:

- muchas aplicaciones usan renderizado del lado servidor
- algunos motores de plantillas tienen mucho poder contextual
- hay módulos internos, paneles o correos templados que reciben menos revisión
- la flexibilidad en el renderizado puede volverse peligrosa si no se diseña con rigor
- el impacto potencial puede ser muy alto comparado con otros errores de presentación

Además, estudiar SSTI ayuda a reforzar una idea central del curso:

> cuanto más interna y poderosa es la capa que interpreta una entrada, más crítica es la separación entre dato y lógica.

---

## Qué puede hacer una organización para prevenir este problema

Desde una mirada defensiva, algunas ideas clave son:

- tratar siempre la entrada externa como dato y no como parte de la lógica de la plantilla
- evitar construir o modificar plantillas dinámicamente con contenido no confiable
- mantener control estricto sobre qué parte del renderizado puede variar
- revisar especialmente vistas, correos, reportes y paneles internos generados por plantillas
- limitar el poder y el contexto expuesto al motor de plantillas cuando sea posible
- tratar el sistema de templating como una capa sensible del servidor, no solo como una comodidad de presentación

La idea central es que la aplicación debería controlar completamente la plantilla, y dejar que el usuario influya solo en los datos previstos, nunca en la lógica de renderizado.

---

## Error común: pensar que porque “solo renderiza HTML” entonces el riesgo es bajo

No necesariamente.

La gravedad no depende solo del formato visible final, sino de **qué hace el servidor para construirlo**.

Si el error ocurre en una capa de plantilla del lado servidor, puede afectar mucho más que la apariencia de la página.

Ese es uno de los motivos por los que SSTI suele ser una vulnerabilidad tan sensible.

---

## Error común: creer que una plantilla es solo presentación y no una parte crítica de seguridad

Eso puede ser un error serio.

En muchas aplicaciones, el motor de plantillas forma parte del núcleo de cómo se generan respuestas y de qué contexto interno participa en ese proceso.

Si esa capa interpreta contenido no confiable de forma insegura, el problema no es meramente visual:  
es una falla en una parte central del servidor.

---

## Idea clave del tema

Server-Side Template Injection (SSTI) ocurre cuando una aplicación permite que una entrada externa influya indebidamente sobre la lógica o la interpretación de una plantilla del lado servidor.

Este tema enseña que:

- usar plantillas no es el problema; mezclar de forma insegura datos no confiables con la lógica del motor sí lo es
- la separación entre dato y renderizado debe mantenerse con mucho rigor
- el impacto puede ser especialmente grave porque la vulnerabilidad ocurre en una capa interna y sensible del servidor
- la prevención depende de tratar la entrada siempre como dato y de mantener control estricto sobre la plantilla

---

## Resumen

En este tema vimos que:

- SSTI es una vulnerabilidad donde la entrada externa influye de forma insegura sobre plantillas del lado servidor
- se diferencia de XSS porque el problema ocurre en el servidor y no en el navegador
- puede afectar confidencialidad, integridad del renderizado y seguridad general de la aplicación
- la raíz del problema está en romper la separación entre datos y lógica de plantilla
- no se resuelve solo filtrando caracteres; requiere diseño seguro del renderizado
- la defensa pasa por controlar estrictamente la plantilla y limitar la influencia externa a datos previstos

---

## Ejercicio de reflexión

Pensá en una aplicación que:

- renderiza HTML del lado servidor
- genera correos con plantillas
- arma reportes dinámicos
- tiene panel administrativo
- muestra contenido personalizado
- usa motores de plantillas en distintas partes del sistema

Intentá responder:

1. ¿qué partes del sistema usan plantillas del lado servidor?
2. ¿cuáles serían más delicadas si la entrada externa influyera sobre la lógica del renderizado?
3. ¿qué diferencia hay entre permitir datos variables y permitir lógica variable?
4. ¿por qué SSTI puede ser más grave que un problema puramente visual?
5. ¿qué principios aplicarías para que la plantilla siga bajo control estricto de la aplicación?

---

## Autoevaluación rápida

### 1. ¿Qué es SSTI?

Es una vulnerabilidad donde una entrada externa influye indebidamente sobre una plantilla que el servidor procesa para construir una respuesta.

### 2. ¿En qué se diferencia de XSS?

En que SSTI afecta la interpretación de plantillas en el servidor, mientras que XSS afecta cómo el navegador interpreta contenido en el cliente.

### 3. ¿Por qué puede ser especialmente grave?

Porque ocurre en una capa interna del servidor que puede tener acceso a contexto, datos o lógica más sensibles.

### 4. ¿Qué defensa ayuda mucho a prevenirla?

Tratar siempre la entrada externa como dato, no construir plantillas dinámicamente con contenido no confiable y mantener control estricto sobre el motor de renderizado.

---

## Próximo tema

En el siguiente tema vamos a estudiar la **Insecure Deserialization**, otra vulnerabilidad avanzada donde el problema aparece cuando una aplicación reconstruye objetos o estructuras complejas a partir de datos externos sin controles suficientemente seguros.
