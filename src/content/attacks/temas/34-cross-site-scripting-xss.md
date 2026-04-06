---
title: "Cross Site Scripting (XSS)"
description: "Qué es Cross Site Scripting, por qué ocurre, qué impacto puede tener en usuarios y aplicaciones, y qué principios defensivos ayudan a prevenirlo."
order: 34
module: "Ataques clásicos a aplicaciones web"
level: "intro"
draft: false
---

# Cross Site Scripting (XSS)

En el tema anterior vimos la **inyección SQL**, donde una entrada externa influía de manera indebida sobre una consulta a base de datos.

Ahora vamos a estudiar otra familia clásica de ataques web, pero con una diferencia muy importante:  
el problema ya no ocurre principalmente en la base de datos, sino en el **navegador de quien usa la aplicación**.

Esa familia se conoce como **Cross Site Scripting**, o **XSS**.

La idea general es esta:

> una aplicación incluye o refleja contenido no confiable de forma insegura y termina haciendo que el navegador lo interprete como si fuera parte legítima de la página.

Eso puede permitir que contenido controlado por una persona termine ejecutándose en el contexto de otra.

Por eso XSS es tan importante:  
no es solo un “problema visual” o de frontend, sino una falla que puede afectar:

- cuentas
- sesiones
- interacciones del usuario
- integridad de la interfaz
- confianza en la aplicación
- seguridad del navegador en relación con ese sitio

---

## Qué significa Cross Site Scripting

**Cross Site Scripting** es una categoría de vulnerabilidad en la que una aplicación permite que contenido no confiable termine ejecutándose o interpretándose de forma activa dentro del navegador.

En términos simples:

- la aplicación recibe o muestra contenido
- ese contenido debería tratarse como dato
- pero el navegador termina tratándolo como algo con capacidad de alterar o ejecutar comportamiento dentro de la página

La idea clave es esta:

> el problema aparece cuando el sistema no mantiene una separación segura entre contenido no confiable y contenido que el navegador puede interpretar activamente.

---

## Por qué se llama “scripting”

Históricamente se usa ese nombre porque uno de los grandes riesgos es la ejecución de código del lado cliente dentro de la página.

Pero el concepto útil para este curso es más amplio:

- no se trata solo de “scripts”
- se trata de contenido no confiable que altera el comportamiento esperado del navegador en el contexto de la aplicación

Esto puede afectar:

- la interfaz visible
- el comportamiento de formularios
- acciones del usuario
- lectura o envío de información desde la página
- interacción con la sesión o con el contexto autenticado

Por eso conviene pensar XSS como un problema de **contenido activo no confiable** dentro del navegador.

---

## Por qué este ataque es tan importante

Es muy importante porque las aplicaciones web modernas muestran muchísima información dinámica.

Por ejemplo:

- perfiles
- publicaciones
- comentarios
- búsquedas
- mensajes
- nombres de usuario
- descripciones
- títulos
- contenido generado por usuarios
- resultados devueltos por la propia aplicación

Siempre que una aplicación toma contenido y lo devuelve al navegador, surge una pregunta de seguridad fundamental:

> ¿ese contenido se está tratando como texto o como algo que el navegador puede interpretar activamente?

Si la aplicación falla en eso, una entrada no confiable puede terminar afectando a quien visualiza la página, no solo a quien la generó.

---

## Qué busca lograr un atacante con XSS

El objetivo puede variar mucho según el contexto y según qué parte de la aplicación esté afectada.

A nivel conceptual, un atacante puede buscar cosas como:

- alterar la interfaz que otra persona ve
- influir en acciones realizadas desde la página
- aprovechar el contexto de una sesión autenticada
- engañar al usuario dentro de una página legítima
- obtener información visible o manipulable desde ese contexto
- provocar acciones no previstas
- degradar la confianza en la aplicación

La idea importante es esta:

> el atacante busca aprovechar el hecho de que el navegador confía en el contexto del sitio legítimo.

Si el sitio incluye contenido inseguro, esa confianza puede volverse peligrosa.

---

## Por qué ocurre

XSS suele aparecer cuando una aplicación toma contenido no confiable y lo inserta en la respuesta o en la interfaz de forma insegura.

A nivel conceptual, eso puede pasar cuando:

- no se escapa correctamente el contenido al mostrarlo
- se inserta información en un contexto HTML sin protección adecuada
- se genera contenido dinámico sin separar bien dato y estructura
- se reutiliza contenido controlado por usuarios dentro de la página
- se construyen fragmentos del DOM de manera insegura
- se asume que un valor “solo será texto” cuando en realidad puede ser interpretado en otro contexto

El problema no está en mostrar contenido dinámico.  
Eso es completamente normal.

El problema está en que el navegador reciba ese contenido de una manera que le permita interpretarlo más allá de lo que el desarrollador quería.

---

## Qué relación tiene con la confianza del navegador

El navegador trata el contenido servido por una aplicación como parte de esa aplicación.

Eso significa que, si el contenido malicioso o no confiable se ejecuta o afecta la página dentro del contexto del sitio legítimo, puede heredar parte de esa confianza.

Ese es uno de los motivos por los que XSS es tan delicado.

No se trata solo de “mostrar algo raro”, sino de introducir comportamiento dentro de un contexto que el navegador y la persona usuaria asocian con una aplicación confiable.

---

## Dónde puede aparecer

XSS puede aparecer en muchos lugares donde la aplicación procesa o muestra contenido.

### Contenido generado por usuarios

Por ejemplo:

- comentarios
- publicaciones
- perfiles
- mensajes
- descripciones
- nombres visibles dentro de la interfaz

### Datos reflejados por la aplicación

Por ejemplo:

- resultados de búsqueda
- mensajes de error
- parámetros que se muestran en pantalla
- datos enviados y luego devueltos en la respuesta

### Contenido manipulado del lado cliente

Por ejemplo:

- construcción dinámica de interfaz
- inserción de fragmentos en el DOM
- actualización de vistas en el navegador con datos externos

### Paneles administrativos o internos

No es un problema exclusivo de páginas públicas.  
También puede afectar herramientas internas si muestran o procesan contenido no confiable.

---

## Qué impacto puede tener

El impacto depende del contexto afectado y de qué capacidad tenga el contenido inyectado dentro de la página.

### Sobre la cuenta o sesión del usuario

Si la persona está autenticada, el problema puede afectar el contexto de esa sesión.

### Sobre la integridad de la interfaz

El atacante puede alterar cómo se presenta el contenido o inducir acciones engañosas.

### Sobre la interacción del usuario

Puede influir en formularios, botones, mensajes o decisiones dentro de la aplicación.

### Sobre datos visibles en la página

Puede afectar información que la página muestra o usa en ese momento.

### Sobre la confianza en el sistema

Una aplicación que permite este tipo de manipulación puede volverse un vehículo de engaño hacia sus propios usuarios.

Por eso XSS no es solo un problema técnico del frontend: también es un problema de confianza, integridad de la UI y seguridad del usuario.

---

## Qué diferencia hay entre mostrar texto y renderizar contenido

Este es uno de los conceptos más importantes del tema.

No todo contenido dinámico es peligroso.  
De hecho, mostrar texto ingresado por personas es una necesidad completamente normal en muchísimas aplicaciones.

El problema aparece cuando la aplicación no deja suficientemente claro al navegador qué parte debe tratarse como:

- **texto**
- y qué parte podría tratarse como **estructura o contenido activo**

Cuando esa frontera no está bien resuelta, el navegador puede interpretar algo que debería haberse mostrado de forma inocua.

Podría resumirse así:

> en XSS, el dato deja de comportarse como dato y empieza a afectar la lógica o la estructura de la página.

---

## Por qué no se limita solo a “comentarios públicos”

A veces se piensa en XSS como algo que solo afectaría un foro o una caja de comentarios.

Pero la superficie puede ser mucho más amplia.

Puede aparecer en:

- mensajes de error
- títulos
- campos de perfil
- historiales
- reportes internos
- resultados de filtros o búsquedas
- paneles de soporte
- descripciones administrativas
- integraciones que muestran contenido externo

En general, cualquier lugar donde la aplicación muestre contenido no completamente confiable merece atención.

---

## Tipos generales de XSS

Sin entrar en detalles demasiado operativos, a nivel conceptual suele ser útil distinguir tres grandes escenarios.

### XSS reflejado

La aplicación devuelve inmediatamente contenido recibido en la solicitud y ese contenido termina afectando la respuesta.

### XSS almacenado

El contenido no confiable queda guardado en algún lugar de la aplicación y luego afecta a quienes lo visualizan.

### XSS basado en DOM

El problema aparece principalmente en cómo el navegador o el código del lado cliente manipulan contenido dinámico una vez cargada la página.

No hace falta profundizar ahora en cada uno.  
Lo importante es entender que la raíz conceptual sigue siendo la misma:

> contenido no confiable termina tratándose como algo más que simple dato.

---

## Ejemplo conceptual simple

Imaginá una aplicación que muestra en pantalla contenido ingresado por usuarios.

Hasta ahí, eso es normal.

Ahora imaginá que la forma en que ese contenido se inserta en la página no lo trata como texto seguro, sino que deja margen a que el navegador lo interprete como parte activa de la interfaz.

Entonces, la persona que abre esa página ya no está viendo solo “el contenido del usuario”, sino una página afectada por algo que la aplicación no aisló correctamente.

Ese es el corazón del XSS:

> la aplicación presta su propio contexto para que contenido no confiable afecte la experiencia y la seguridad de otra persona.

---

## Qué señales pueden sugerir este problema

Detectarlo no siempre es sencillo desde el uso normal, pero algunas señales conceptuales pueden despertar sospechas.

### Ejemplos de señales

- contenido mostrado en pantalla cambia de forma extraña según la entrada
- partes de la interfaz se alteran inesperadamente
- mensajes, resultados o perfiles reaccionan de forma anómala ante ciertas entradas
- el navegador se comporta de manera distinta cuando se visualiza determinado contenido
- ciertos campos visibles parecen afectar más que solo el texto mostrado
- la aplicación mezcla contenido dinámico con estructura de la página de manera insegura

Muchas veces este problema se detecta durante revisión de código, diseño del frontend o pruebas específicas sobre manejo de contenido.

---

## Qué relación tiene con otras familias de inyección

XSS comparte una idea general con otras inyecciones:  
un dato no confiable termina influyendo donde no debería.

Pero el contexto cambia.

### En SQL injection
La entrada afecta una consulta a base de datos.

### En XSS
La entrada afecta cómo el navegador interpreta o ejecuta contenido dentro de la página.

Esto muestra algo valioso para el curso:

> muchas familias de ataques cambian de superficie, pero repiten un mismo principio de fondo: datos no confiables rompen la frontera con la lógica o con el contexto de ejecución.

---

## Qué puede hacer una organización para prevenir este problema

Desde una mirada defensiva, algunas ideas clave son:

- tratar el contenido no confiable como dato y no como estructura activa
- escapar correctamente la salida según el contexto en que se renderiza
- evitar construcciones inseguras en la interfaz o en el DOM
- revisar cómo se muestran datos generados por usuarios o reflejados por la aplicación
- prestar especial atención a paneles internos, no solo a páginas públicas
- reducir el uso de patrones que mezclan directamente entrada y renderizado sensible
- adoptar una disciplina consistente de manejo seguro de contenido dinámico

La idea central es que la prevención de XSS depende mucho de cómo se diseña el flujo de renderizado y presentación de contenido.

---

## Error común: pensar que “limpiar un poco el input” ya alcanza

No suele alcanzar como defensa general.

El problema de fondo no es simplemente “qué caracteres tiene el valor”, sino:

- en qué contexto se inserta
- cómo lo interpreta el navegador
- si se trata como texto o como estructura activa
- qué construcciones usa la aplicación para renderizarlo

Por eso, las defensas sólidas suelen depender más de un diseño correcto del tratamiento de salida que de bloqueos superficiales y aislados sobre el input.

---

## Error común: creer que XSS es solo una molestia visual

No.

Aunque a veces pueda parecer un problema “de interfaz”, el impacto puede ir mucho más lejos porque ocurre dentro del contexto de una página legítima.

Eso puede afectar:

- sesiones
- interacción del usuario
- confianza en la aplicación
- operaciones hechas desde la cuenta
- integridad del contenido mostrado

Es un problema serio de seguridad, no solo de presentación.

---

## Idea clave del tema

Cross Site Scripting (XSS) ocurre cuando una aplicación permite que contenido no confiable termine afectando o ejecutándose dentro del navegador en el contexto del sitio legítimo.

Este tema enseña que:

- mostrar contenido dinámico no es el problema; el problema es tratarlo de forma insegura
- la frontera entre dato y contenido activo debe protegerse con mucho cuidado
- una falla de este tipo puede comprometer la interfaz, la sesión y la confianza del usuario
- la defensa depende de renderizar de forma segura según el contexto y no confiar en tratamiento superficial del input

---

## Resumen

En este tema vimos que:

- XSS es una vulnerabilidad donde contenido no confiable afecta la página en el navegador
- puede aparecer en contenido generado por usuarios, datos reflejados o manipulación del DOM
- su impacto puede alcanzar sesiones, acciones del usuario, integridad de la interfaz y confianza en la aplicación
- comparte con otras inyecciones la ruptura entre dato y lógica o contexto
- el problema no es usar contenido dinámico, sino tratarlo de forma insegura
- la prevención requiere disciplina en cómo se renderiza y presenta el contenido

---

## Ejercicio de reflexión

Pensá en una aplicación con:

- perfiles
- comentarios
- resultados de búsqueda
- panel administrativo
- mensajes internos
- frontend dinámico con contenido que cambia en el navegador

Intentá responder:

1. ¿qué partes de la aplicación muestran contenido no completamente confiable?
2. ¿dónde podría romperse la frontera entre texto y contenido activo?
3. ¿qué impacto tendría si una persona visualiza contenido mal manejado estando autenticada?
4. ¿por qué este problema no se resuelve solo “filtrando caracteres”?
5. ¿qué principios de diseño aplicarías para que el navegador trate ese contenido de forma segura?

---

## Autoevaluación rápida

### 1. ¿Qué es XSS?

Es una vulnerabilidad en la que contenido no confiable termina afectando o ejecutándose dentro del navegador en el contexto de una aplicación legítima.

### 2. ¿Cuál es la raíz conceptual del problema?

La ruptura de la frontera entre dato no confiable y contenido que el navegador puede interpretar activamente.

### 3. ¿Puede afectar más que la apariencia de la página?

Sí. Puede afectar sesiones, acciones del usuario, confianza e integridad del contexto autenticado.

### 4. ¿Qué defensa ayuda mucho a prevenirlo?

Renderizar contenido de forma segura según el contexto, tratar la salida correctamente y evitar construcciones inseguras en el navegador.

---

## Próximo tema

En el siguiente tema vamos a estudiar el **Cross Site Request Forgery (CSRF)**, otra familia clásica de ataques web, pero enfocada en cómo una aplicación puede aceptar acciones no deseadas aprovechando que el navegador de una persona ya autenticada envía solicitudes válidas al sitio.
