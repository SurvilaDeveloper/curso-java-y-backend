---
title: "Cross Site Request Forgery (CSRF)"
description: "Qué es Cross Site Request Forgery, por qué ocurre, qué impacto puede tener en aplicaciones web y qué principios defensivos ayudan a prevenir que un navegador autenticado ejecute acciones no deseadas."
order: 35
module: "Ataques clásicos a aplicaciones web"
level: "intro"
draft: false
---

# Cross Site Request Forgery (CSRF)

En el tema anterior vimos **Cross Site Scripting (XSS)**, donde una aplicación termina incluyendo o interpretando contenido no confiable de forma insegura dentro del navegador.

Ahora vamos a estudiar otra familia clásica de ataques web, pero con una lógica distinta: **Cross Site Request Forgery**, o **CSRF**.

La idea general es esta:

> una aplicación acepta como legítima una solicitud que en realidad fue inducida o disparada desde un contexto no confiable, aprovechando que el navegador de la víctima ya tiene una sesión válida con el sitio.

Dicho de otra manera:

- la persona ya está autenticada en una aplicación
- el navegador conserva esa relación de confianza
- otra página o contexto consigue provocar una acción hacia ese sitio
- la aplicación la acepta como si realmente hubiera sido una decisión legítima de la persona usuaria

Por eso CSRF es tan importante:  
no “roba” necesariamente la contraseña ni rompe la sesión, sino que **abusa del hecho de que la sesión ya existe**.

---

## Qué significa Cross Site Request Forgery

**Cross Site Request Forgery** puede entenderse como una **falsificación de solicitud entre sitios**.

La expresión importante acá es **request forgery**, es decir, “solicitud falsificada”.

La idea no es que el atacante suplante el navegador técnicamente desde cero, sino que hace que el navegador de una persona autenticada envíe una solicitud que la aplicación destino interprete como válida.

Ese es el punto central del ataque:

> el sitio confía en la solicitud porque viene acompañada del contexto autenticado del navegador, aunque la acción no haya sido iniciada legítimamente por la persona usuaria.

---

## Por qué este ataque es posible

Para entender CSRF, hay que recordar una característica muy importante de la web:

- cuando una persona inicia sesión en un sitio, el navegador suele conservar elementos que representan ese acceso
- mientras esa sesión siga activa, futuras solicitudes al sitio pueden seguir considerándose autenticadas

Eso es completamente normal y necesario para que la persona no tenga que volver a iniciar sesión a cada paso.

El problema aparece cuando el sistema no distingue suficientemente bien entre:

- una acción realmente iniciada desde el flujo legítimo de la aplicación
- y una solicitud que el navegador envió en otro contexto, pero igual acompañada por la sesión autenticada

Entonces la aplicación puede terminar ejecutando acciones no deseadas.

---

## Qué busca lograr un atacante con CSRF

El atacante no siempre busca leer la respuesta ni controlar toda la sesión.  
Muchas veces busca algo más simple y muy potente:

> lograr que la aplicación ejecute una acción usando la identidad ya autenticada de la víctima.

Eso puede servir para provocar acciones como:

- cambiar configuraciones
- modificar datos de la cuenta
- iniciar operaciones sensibles
- alterar estados
- enviar formularios
- activar funciones dentro de la aplicación
- disparar acciones administrativas si la víctima tiene privilegios altos

La gravedad depende mucho del tipo de acción que el sitio permita ejecutar bajo esa sesión.

---

## Por qué no depende de “hackear” la contraseña

Este punto es muy importante.

En CSRF, el atacante no necesita necesariamente:

- robar la contraseña
- reutilizar credenciales filtradas
- hacer fuerza bruta
- romper MFA

En cambio, aprovecha algo que ya existe:

- la persona está autenticada
- el navegador ya tiene una relación válida con el sitio
- la aplicación no exige una señal adicional suficientemente fuerte para confirmar que esa acción vino realmente del flujo legítimo

Eso vuelve a CSRF una clase de ataque muy particular:

> no busca obtener la identidad desde cero, sino abusar de la confianza ya establecida entre navegador y aplicación.

---

## Qué tipo de acciones suelen ser más delicadas

No todas las solicitudes tienen el mismo valor.

CSRF suele ser especialmente relevante sobre acciones que cambian estado o producen efectos dentro del sistema.

Por ejemplo, conceptualmente:

- actualizar perfil
- cambiar correo
- modificar contraseña
- cambiar configuraciones
- crear o borrar recursos
- iniciar operaciones administrativas
- vincular o desvincular elementos
- ejecutar acciones con impacto sobre datos u operaciones

Cuanto más sensible sea la acción, más grave puede ser el problema.

Este punto es clave:

> una solicitud que solo consulta datos no tiene el mismo impacto que una que modifica el estado del sistema.

---

## Qué necesita el ataque para tener sentido

A nivel conceptual, CSRF suele apoyarse en varios factores juntos.

### La víctima ya tiene una sesión válida

Sin contexto autenticado previo, la solicitud no tendría el mismo valor.

### La aplicación confía demasiado en la sola presencia de esa sesión

Si la sesión basta como prueba total de legitimidad para acciones sensibles, el riesgo crece.

### La acción puede ejecutarse sin una validación adicional fuerte

Es decir, el sistema no exige algo que ate claramente esa acción al flujo legítimo de la aplicación.

### El navegador de la víctima puede enviar la solicitud en un contexto inducido

La aplicación termina viendo una request autenticada, aunque no haya sido generada por una interacción legítima dentro del sitio.

---

## Diferencia entre CSRF y XSS

Conviene distinguir bien estos dos temas porque ambos involucran navegador, pero no son lo mismo.

### En XSS
La aplicación incluye contenido no confiable de forma insegura y ese contenido afecta o se ejecuta dentro de la página.

### En CSRF
El problema central no es que se ejecute contenido dentro de la página, sino que la aplicación acepte una solicitud no legítima aprovechando el contexto autenticado del navegador.

Podría resumirse así:

- **XSS** rompe la seguridad del contenido y del contexto dentro de la página
- **CSRF** rompe la confianza sobre quién inició realmente una acción autenticada

Ambos pueden ser muy graves, pero operan con lógicas distintas.

---

## Qué relación tiene con la sesión

CSRF está muy ligado al manejo de sesión porque depende de que el navegador ya tenga un acceso activo al sitio.

Eso significa que, si la aplicación basa decisiones sensibles únicamente en:

- la presencia de una sesión válida
- una cookie asociada a la cuenta
- un contexto autenticado mantenido por el navegador

entonces puede quedar expuesta si no exige alguna señal adicional que confirme que la acción vino del flujo legítimo.

Por eso este tema se conecta directamente con lo que vimos sobre:

- sesiones
- estado autenticado
- confianza del navegador
- acciones ejecutadas bajo contexto válido

---

## Qué impacto puede tener

El impacto depende muchísimo de qué acciones acepte la aplicación bajo la sesión de la víctima.

### Sobre la cuenta de la persona usuaria

Puede permitir cambios de:

- perfil
- preferencias
- configuraciones
- relaciones con otros recursos
- credenciales auxiliares
- métodos de contacto

### Sobre datos y recursos

Puede provocar:

- creación
- modificación
- eliminación
- envío
- aprobación
- cancelación
- alteración de estados

### Sobre funciones sensibles o administrativas

Si la víctima tiene privilegios altos, el ataque puede volverse mucho más grave.

Por ejemplo, podría afectar:

- herramientas internas
- paneles de gestión
- acciones administrativas
- operaciones de soporte
- configuraciones globales

Eso significa que el impacto de CSRF depende no solo del sitio, sino también del **valor de la sesión de la víctima**.

---

## Ejemplo conceptual simple

Imaginá una aplicación donde una persona ya inició sesión y mantiene una sesión activa en su navegador.

Ahora imaginá que existe una acción sensible, como cambiar una configuración importante de la cuenta.

Si la aplicación acepta esa acción solo porque la solicitud viene acompañada por una sesión válida, sin verificar suficientemente que provino del flujo legítimo del sitio, entonces aparece el riesgo.

En ese escenario, el atacante no necesita conocer la contraseña de la víctima ni iniciar sesión por su cuenta.

Le alcanza con intentar que el navegador autenticado de la persona emita una solicitud que el sistema acepte.

Ese es el corazón de CSRF:

> aprovechar la confianza del sitio en el navegador autenticado de la víctima.

---

## Por qué el caso feliz puede ocultar el problema

En uso normal, la aplicación parece comportarse perfectamente:

- la persona inicia sesión
- usa formularios
- cambia configuraciones
- realiza operaciones
- todo parece legítimo

El problema aparece cuando alguien se pregunta:

- ¿cómo sabe el sistema que esta acción vino realmente del flujo esperado?
- ¿qué valida además de la sesión?
- ¿qué evita que una solicitud equivalente se dispare desde otro contexto?
- ¿cómo diferencia el backend entre “usuario autenticado” y “acción legítimamente iniciada desde la aplicación”?

Si la respuesta es “solo porque hay una sesión válida”, puede haber un problema serio.

---

## Qué señales pueden sugerir esta vulnerabilidad

Detectar CSRF no siempre es simple mirando solo logs genéricos, pero algunas ideas deberían encender alertas.

### Ejemplos conceptuales

- acciones sensibles que dependen solo de sesión sin una validación adicional clara
- cambios importantes realizados sin suficiente señal de intención del usuario
- solicitudes de modificación aceptadas con confianza excesiva en el navegador
- funciones críticas que no diferencian bien origen o contexto de la acción
- operaciones que podrían dispararse sin una interacción legítima dentro del sitio

Muchas veces el hallazgo aparece más claramente durante revisión de diseño o pruebas específicas que durante el uso diario.

---

## Qué principios ayudan a prevenirlo

Desde una mirada defensiva, este tema enseña varios principios importantes.

### No confiar solo en la sesión para acciones sensibles

La sesión puede decir que la persona está autenticada, pero no siempre demuestra que esa acción particular fue iniciada legítimamente.

### Agregar señales que vinculen la acción al flujo legítimo

Las operaciones que cambian estado deberían exigir mecanismos adicionales que permitan distinguir mejor solicitudes legítimas de solicitudes forzadas.

### Diseñar con más cuidado las acciones de alto impacto

No todas las solicitudes deberían tratarse igual.  
Las más sensibles merecen controles más fuertes.

### Reducir confianza implícita del navegador

La relación autenticada con el sitio no debería ser la única base para aceptar acciones críticas.

### Revisar especialmente formularios, cambios de estado y paneles internos

Los flujos que modifican información o disparan operaciones importantes son los más delicados.

---

## Por qué este tema sigue siendo valioso hoy

Incluso cuando ciertas plataformas modernas incorporan mejores mecanismos de defensa, estudiar CSRF sigue siendo muy útil porque enseña una lección fundamental:

> una acción autenticada no siempre es una acción legítimamente intencionada por la persona usuaria.

Esa distinción es muy importante para cualquier sistema web, especialmente los que manejan:

- sesiones
- formularios
- configuraciones
- acciones críticas
- cuentas privilegiadas
- operaciones internas

Además, ayuda a pensar mejor en cómo diseñar flujos donde el backend no solo vea una sesión, sino también una señal razonable de intención y contexto.

---

## Error común: pensar que si el usuario está logueado, toda acción enviada desde su navegador es legítima

No necesariamente.

Ese es justamente el supuesto que CSRF intenta explotar.

La existencia de una sesión válida responde:

- quién está autenticado

pero no siempre responde:

- quién decidió iniciar esta acción concreta
- desde qué contexto
- con qué señal de intención legítima

Confundir ambas cosas debilita mucho el sistema.

---

## Error común: creer que toda protección del login resuelve también CSRF

No.

Podés tener:

- buena contraseña
- MFA
- recuperación segura
- sesiones correctamente protegidas

y aun así seguir siendo vulnerable si las acciones sensibles dependen únicamente de que el navegador esté autenticado.

CSRF afecta una parte distinta del problema:  
la legitimidad de las solicitudes emitidas bajo una sesión ya válida.

---

## Idea clave del tema

CSRF ocurre cuando una aplicación acepta como legítima una solicitud disparada desde un contexto no confiable, aprovechando que el navegador de la víctima ya tiene una sesión válida con el sitio.

Este tema enseña que:

- autenticación no es lo mismo que intención legítima sobre una acción
- la sola presencia de sesión no debería bastar para aceptar toda operación sensible
- una aplicación debe distinguir mejor entre estar logueado y haber iniciado legítimamente una solicitud crítica
- el riesgo crece mucho cuando la sesión de la víctima tiene alto valor o privilegios elevados

---

## Resumen

En este tema vimos que:

- CSRF es una falsificación de solicitud entre sitios
- aprovecha la confianza que la aplicación deposita en un navegador ya autenticado
- no necesita necesariamente robar la contraseña ni la sesión
- puede afectar acciones que cambian estado, configuraciones u operaciones sensibles
- el problema aparece cuando el sistema confía demasiado en la sola presencia de la sesión
- la defensa requiere diseñar acciones sensibles con validaciones adicionales y mejor vínculo con el flujo legítimo

---

## Ejercicio de reflexión

Pensá en una aplicación con:

- login basado en sesión
- formularios de cambio de perfil
- actualización de correo
- panel privado
- algunas funciones administrativas
- usuarios que suelen mantener la sesión abierta en el navegador

Intentá responder:

1. ¿qué acciones serían más delicadas frente a CSRF?
2. ¿por qué una sesión válida no alcanza para considerar legítima cualquier solicitud?
3. ¿qué diferencia harías entre “usuario autenticado” y “acción iniciada legítimamente”?
4. ¿qué impacto tendría si la víctima fuese un administrador?
5. ¿qué principios aplicarías para que las acciones sensibles no dependan solo de la sesión?

---

## Autoevaluación rápida

### 1. ¿Qué es CSRF?

Es un ataque en el que una aplicación acepta una solicitud no legítima aprovechando que el navegador de la víctima ya está autenticado en ese sitio.

### 2. ¿Qué lo diferencia de XSS?

En XSS el problema está en contenido no confiable dentro de la página; en CSRF el problema está en aceptar solicitudes no deseadas bajo una sesión válida.

### 3. ¿Por qué no basta con “tener login seguro”?

Porque CSRF no rompe el login, sino que abusa del contexto autenticado que ya existe en el navegador.

### 4. ¿Qué defensa conceptual ayuda mucho?

Diseñar acciones sensibles para que no dependan solo de la sesión, sino también de señales adicionales que vinculen la solicitud al flujo legítimo.

---

## Próximo tema

En el siguiente tema vamos a estudiar la **Command Injection**, otra familia clásica de ataques donde el problema ya no está en la base de datos ni en el navegador, sino en cómo una aplicación puede terminar invocando comandos del sistema operativo de forma insegura a partir de entradas externas.
