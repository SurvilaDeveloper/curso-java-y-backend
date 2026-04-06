---
title: "Inyección SQL"
description: "Qué es la inyección SQL, por qué ocurre, qué impacto puede tener sobre datos y operaciones, y qué principios defensivos ayudan a prevenirla."
order: 33
module: "Ataques clásicos a aplicaciones web"
level: "intro"
draft: false
---

# Inyección SQL

Cuando una aplicación web trabaja con datos, muy a menudo necesita consultar una base de datos.

Eso es completamente normal.  
El problema aparece cuando la aplicación toma datos ingresados por una persona y los usa para construir consultas de forma insegura.

Ahí entra en juego una de las familias de problemas más conocidas de la seguridad web: la **inyección SQL**.

La idea general es esta:

> una entrada controlada por el usuario influye de manera indebida en la consulta que la aplicación envía a la base de datos.

Dicho de otro modo, el sistema espera recibir “datos”, pero termina interpretando parte de esa entrada como si afectara la estructura o el comportamiento de la consulta.

Por eso la inyección SQL es tan importante de estudiar:  
no se trata solo de un error técnico puntual, sino de una falla de separación entre:

- lo que debería ser dato
- y lo que debería ser lógica de consulta

---

## Qué es SQL

**SQL** significa *Structured Query Language*.  
Es un lenguaje ampliamente usado para interactuar con bases de datos relacionales.

Con SQL, una aplicación puede hacer operaciones como:

- consultar registros
- insertar datos
- actualizar información
- borrar filas
- filtrar resultados
- ordenar
- agrupar
- relacionar tablas

En sí mismo, SQL no es el problema.  
El problema aparece cuando una aplicación compone consultas de manera insegura y deja que una entrada externa altere la lógica de esas operaciones.

---

## Qué es una inyección SQL

Una **inyección SQL** ocurre cuando la aplicación no maneja correctamente entradas controladas por el usuario y esas entradas terminan influyendo sobre la consulta SQL de manera no prevista por el diseño.

La idea importante es esta:

> el atacante no debería poder cambiar la intención lógica de la consulta, pero la aplicación le deja demasiado margen para hacerlo.

Eso puede afectar distintas partes del comportamiento del sistema, por ejemplo:

- qué registros se consultan
- qué condiciones se aplican
- si una validación funciona o no
- qué datos terminan devolviéndose
- si se alteran o eliminan registros
- qué operaciones acepta la base de datos a través de la aplicación

No siempre el impacto es el mismo, pero el patrón de fondo sí:  
la entrada del usuario se mezcla indebidamente con la lógica de la consulta.

---

## Por qué este problema es tan peligroso

La base de datos suele contener información central del sistema.

Por ejemplo:

- cuentas
- perfiles
- pedidos
- historiales
- documentos
- configuraciones
- relaciones entre entidades
- registros de negocio
- metadatos internos

Si una falla de inyección permite alterar o ampliar lo que la aplicación consulta o ejecuta sobre esa base, el impacto puede ser enorme.

Eso puede comprometer:

- **confidencialidad**, si se exponen datos
- **integridad**, si se alteran registros
- **disponibilidad**, si se dañan operaciones o se afecta la base
- **control de acceso**, si una validación de identidad o autorización depende de consultas inseguras

Por eso la inyección SQL no es solo “un bug de consultas”: puede transformarse en un problema sistémico.

---

## Qué busca lograr un atacante con una inyección SQL

Depende mucho del punto vulnerable y del nivel de acceso que tenga la aplicación hacia la base de datos.

Pero, a nivel conceptual, un atacante podría intentar cosas como:

- alterar el resultado de una consulta
- saltar una validación lógica
- acceder a información que no debería devolverse
- influir sobre filtros o condiciones
- leer más datos de los previstos
- modificar registros
- borrar información
- afectar el comportamiento del sistema

La idea importante es esta:

> el atacante busca que la aplicación haga con la base de datos algo distinto de lo que el desarrollador quería.

---

## Por qué ocurre

La inyección SQL suele aparecer cuando la aplicación construye consultas de forma insegura a partir de entradas externas.

Eso puede pasar, conceptualmente, cuando:

- se concatena entrada del usuario con la consulta
- no se separa correctamente la estructura SQL de los valores
- se confía demasiado en validaciones superficiales
- se asume que el dato ingresado “solo será texto”
- se arma lógica dinámica sin suficiente protección
- se dejan decisiones estructurales de la consulta demasiado cerca de la entrada externa

El problema no está en que el usuario envíe datos.  
Eso es normal.

El problema está en que el sistema no preserve de forma robusta la frontera entre:

- la consulta como instrucción
- y el valor como dato

---

## Qué tipos de partes del sistema suelen verse afectadas

La inyección SQL puede aparecer en muchos lugares donde la aplicación interactúa con la base.

### Login

Si la autenticación depende de consultas inseguras, el impacto puede ser especialmente serio.

### Búsquedas y filtros

Muchas aplicaciones dejan al usuario buscar o filtrar datos; eso puede volverse delicado si la consulta se compone mal.

### Formularios administrativos o internos

Paneles con filtros complejos, reportes o búsquedas avanzadas pueden convertirse en superficies sensibles.

### APIs

No es un problema exclusivo de formularios HTML.  
También puede afectar endpoints que construyen consultas a partir de parámetros.

### Funciones de ordenamiento, paginación o criterios dinámicos

Cuando el sistema permite mucha flexibilidad en la consulta, el diseño seguro se vuelve todavía más importante.

---

## Qué diferencia hay entre una consulta dinámica legítima y una insegura

Esto es importante.

No toda consulta dinámica es mala.  
Hay muchos casos legítimos donde una aplicación necesita:

- filtrar según búsqueda
- ordenar por criterios válidos
- paginar
- aplicar condiciones opcionales
- consultar distintos recursos

El problema no es el dinamismo en sí mismo.

El problema aparece cuando esa flexibilidad no está limitada por reglas seguras y termina permitiendo que la entrada externa influya indebidamente sobre la estructura de la consulta.

Dicho de otro modo:

> una consulta puede ser dinámica y segura si el sistema controla bien qué parte es variable y cómo se incorpora esa variación.

---

## Qué impacto puede tener

El impacto depende del contexto, del tipo de consulta vulnerable y de los privilegios con los que la aplicación accede a la base de datos.

### Sobre confidencialidad

Puede exponer:

- datos de usuarios
- información privada
- registros internos
- datos sensibles
- contenido que la aplicación no debería devolver

### Sobre integridad

Puede permitir:

- modificar registros
- alterar estados
- cambiar relaciones
- tocar configuraciones
- corromper datos

### Sobre disponibilidad

Puede afectar:

- consultas críticas
- funcionamiento de módulos
- estabilidad del servicio
- acceso normal a datos

### Sobre control de acceso

Si una parte del login, de la sesión o de la autorización depende de consultas inseguras, la inyección puede influir sobre mecanismos centrales de seguridad.

---

## Ejemplo conceptual simple

Imaginá una aplicación que permite buscar registros en la base de datos.

Hasta ahí, eso es completamente normal.

Ahora imaginá que la forma en que construye la consulta mezcla de manera insegura:

- la estructura SQL
- con lo que la persona ingresó como búsqueda

En ese escenario, la aplicación ya no está usando la entrada solo como dato.  
Le está dando la posibilidad de influir sobre cómo se interpreta la consulta.

Ese es el corazón de la inyección SQL:

> el sistema pierde control sobre la intención original de la consulta.

No hace falta bajar al detalle técnico para entender por qué eso es peligroso.

---

## Por qué no depende solo de “campos de texto”

A veces se piensa que la inyección SQL aparece solo en cajas de texto simples.

Pero el problema puede involucrar distintos tipos de entradas o decisiones del sistema, por ejemplo:

- filtros
- parámetros
- formularios
- valores de búsqueda
- criterios de orden
- identificadores
- operaciones administrativas
- funciones avanzadas de reporte o consulta

La cuestión no es el tipo visual del campo.  
La cuestión es si esa entrada termina afectando la consulta de forma insegura.

---

## Por qué sigue siendo un tema tan importante

Aunque hoy existen más herramientas, frameworks y prácticas seguras que antes, la inyección SQL sigue siendo un tema muy importante por varias razones:

- sigue apareciendo en código heredado
- puede existir en módulos menos revisados
- aparece cuando se rompe la disciplina de acceso seguro a datos
- no siempre todas las partes del sistema usan el mismo estándar
- puede esconderse en filtros, reportes o funciones “avanzadas”
- tiene impacto muy alto cuando afecta funciones sensibles

Además, estudiar SQL injection ayuda a entender una lección más general:

> nunca hay que permitir que la entrada de un usuario decida la lógica de una operación interna sin separación fuerte y controlada.

Eso vale no solo para SQL, sino para muchas otras familias de inyección.

---

## Relación con el principio de separación entre datos y código

Este tema enseña un principio muy importante de seguridad de software:

> los datos externos deben tratarse como datos, no como parte de la lógica que el sistema ejecuta.

Cuando esa frontera se rompe, aparecen muchas familias de problemas.

En SQL, esa frontera separa:

- la consulta
- de los valores que la alimentan

Y cuando no se respeta, el sistema deja de decidir plenamente qué consulta ejecuta realmente.

---

## Qué señales pueden sugerir este problema

Detectar una inyección SQL no siempre es trivial, pero algunas señales conceptuales pueden encender alertas.

### Ejemplos de señales

- comportamientos extraños en consultas o filtros
- respuestas inesperadas de la aplicación ante ciertas entradas
- errores relacionados con acceso a base de datos
- diferencias anómalas entre entradas similares
- resultados demasiado amplios o demasiado raros
- operaciones que parecen saltarse lógica de negocio
- consultas administrativas o internas que reaccionan de forma anómala frente a entradas externas

Desde el lado defensivo, también puede aparecer como hallazgo durante revisión de código o diseño, incluso antes de que haya un incidente visible.

---

## Qué puede hacer una organización para prevenir este problema

Desde una mirada defensiva, algunas ideas clave son:

- separar correctamente la lógica de consulta de los datos externos
- evitar construir consultas inseguras a partir de entradas sin control
- usar mecanismos seguros para incorporar valores
- validar y restringir con claridad los elementos que pueden variar
- reducir privilegios de la conexión a base de datos
- revisar con especial cuidado módulos heredados, filtros avanzados y funciones administrativas
- tratar el acceso a datos como una parte crítica del diseño, no como un detalle secundario

La idea importante es esta:

> la defensa no empieza “limpiando” entradas al final, sino diseñando el acceso a datos de forma que la entrada nunca tenga control indebido sobre la estructura de la consulta.

---

## Error común: pensar que el problema se resuelve solo “filtrando caracteres”

No alcanza.

Aunque restringir ciertas entradas pueda ayudar en algunos casos, la defensa real no debería depender de intentar adivinar qué caracteres o combinaciones podrían ser peligrosos.

Ese enfoque suele ser frágil porque el problema de fondo no es “qué símbolo aparece”, sino **cómo se construye la consulta**.

La solución sólida pasa por diseñar bien la interacción con la base de datos, no por confiar en bloqueos superficiales.

---

## Error común: creer que solo afecta sistemas viejos

No necesariamente.

Es cierto que muchos casos famosos aparecen en código heredado o en sistemas antiguos.  
Pero el riesgo sigue existiendo si una aplicación moderna:

- rompe buenas prácticas
- mezcla lógica y entrada de forma insegura
- implementa consultas personalizadas sin suficiente control
- deja módulos menos mantenidos fuera del estándar general

La antigüedad aumenta el riesgo en muchos casos, pero no es la única causa.

---

## Idea clave del tema

La inyección SQL ocurre cuando una entrada controlada por el usuario influye indebidamente sobre la consulta que la aplicación ejecuta contra la base de datos.

Este tema enseña que:

- el problema no está en usar SQL, sino en construir consultas de forma insegura
- los datos externos no deben poder alterar la lógica de la consulta
- una falla en este punto puede comprometer confidencialidad, integridad, disponibilidad y control de acceso
- el diseño seguro del acceso a datos es una parte central de la seguridad web

---

## Resumen

En este tema vimos que:

- SQL se usa para interactuar con bases de datos relacionales
- la inyección SQL aparece cuando la entrada del usuario influye indebidamente en la consulta
- puede afectar lectura, modificación, borrado y lógica de negocio
- no es un problema limitado a formularios simples
- la raíz del problema está en romper la separación entre estructura de consulta y datos
- la defensa requiere diseñar el acceso a base de datos con separación segura, validación sólida y menor privilegio

---

## Ejercicio de reflexión

Pensá en una aplicación con:

- login
- búsquedas
- filtros
- panel administrativo
- API
- reportes con criterios variables

Intentá responder:

1. ¿qué partes del sistema construyen consultas a base de datos?
2. ¿cuáles serían más delicadas si mezclaran mal entrada y lógica?
3. ¿qué impacto tendría una falla en login o reportes internos?
4. ¿por qué no alcanza con “filtrar caracteres” como defensa general?
5. ¿qué principios de diseño aplicarías para reducir este riesgo desde el comienzo?

---

## Autoevaluación rápida

### 1. ¿Qué es la inyección SQL?

Es una falla en la que una entrada del usuario influye indebidamente sobre una consulta SQL que la aplicación ejecuta contra la base de datos.

### 2. ¿Por qué puede ser tan grave?

Porque puede comprometer datos, lógica de negocio, control de acceso y operaciones críticas del sistema.

### 3. ¿Cuál es la raíz conceptual del problema?

La mezcla insegura entre la estructura de la consulta y los datos externos.

### 4. ¿Qué defensa ayuda mucho a prevenirla?

Diseñar el acceso a datos de forma segura, separando correctamente la lógica SQL de los valores controlados por el usuario y aplicando menor privilegio en la base.

---

## Próximo tema

En el siguiente tema vamos a estudiar el **Cross Site Scripting (XSS)**, otra familia clásica de ataques web, pero esta vez centrada en cómo una aplicación puede terminar ejecutando contenido no confiable en el navegador de otra persona.
