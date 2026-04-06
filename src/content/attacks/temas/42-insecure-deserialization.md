---
title: "Insecure Deserialization"
description: "Qué es Insecure Deserialization, por qué ocurre, qué impacto puede tener en aplicaciones modernas y qué principios defensivos ayudan a evitar reconstrucciones inseguras de objetos o estructuras a partir de datos externos."
order: 42
module: "Ataques web más avanzados"
level: "intermedio"
draft: false
---

# Insecure Deserialization

En el tema anterior vimos **Server-Side Template Injection (SSTI)**, donde la aplicación podía terminar interpretando de forma insegura una plantilla del lado servidor a partir de entrada externa.

Ahora vamos a estudiar otra vulnerabilidad avanzada y muy importante: **Insecure Deserialization**.

La idea general es esta:

> una aplicación recibe datos serializados desde un contexto externo y los reconstruye como objetos, estructuras o estados internos sin controles suficientemente seguros.

Esto vuelve al problema especialmente delicado porque ya no estamos hablando solo de:

- mostrar contenido
- consultar una base de datos
- redirigir una navegación
- o renderizar una plantilla

Ahora el sistema puede estar intentando **reconstruir internamente algo complejo** a partir de datos que no debería confiar ciegamente.

Y cuando esa reconstrucción ocurre sin los controles adecuados, la entrada externa deja de ser solo “información recibida” y empieza a influir sobre estructuras profundas de la aplicación.

---

## Qué es serialización

La **serialización** es el proceso de convertir un objeto, estructura o estado interno en un formato que pueda almacenarse, transmitirse o persistirse.

Por ejemplo, una aplicación puede serializar datos para:

- guardarlos en sesión
- enviarlos entre componentes
- almacenarlos en caché
- transportarlos entre servicios
- persistir un estado temporal
- registrar información estructurada

La idea importante es esta:

> serializar significa transformar algo interno y estructurado en una representación transportable o almacenable.

Eso es completamente normal y muy útil en muchos sistemas.

---

## Qué es deserialización

La **deserialización** es el proceso inverso:  
tomar esa representación externa y reconstruir de nuevo una estructura u objeto que la aplicación pueda usar internamente.

En otras palabras:

- antes había un objeto o estado estructurado
- se convirtió en un formato transportable
- luego la aplicación intenta reconstruirlo

Hasta ahí, el concepto es normal y legítimo.

El problema aparece cuando el sistema olvida una pregunta fundamental:

> ¿debo confiar realmente en que esos datos externos representan una estructura segura y válida para reconstruir dentro de mi aplicación?

Si la respuesta debería haber sido “no” y aun así se deserializa sin cuidado, aparece el riesgo.

---

## Qué es Insecure Deserialization

**Insecure Deserialization** ocurre cuando una aplicación deserializa datos externos sin controles suficientes sobre:

- su origen
- su integridad
- su estructura
- su contenido
- el tipo de objeto que reconstruye
- el comportamiento que esa reconstrucción puede disparar

La idea clave es esta:

> el sistema no está solo leyendo datos; está reconstruyendo algo con significado interno a partir de una entrada que puede haber sido manipulada.

Eso vuelve a esta vulnerabilidad especialmente sensible, porque la aplicación deja que datos externos influyan sobre estructuras internas de alto valor.

---

## Por qué este problema es tan peligroso

Es peligroso porque la deserialización no siempre reconstruye una estructura inocente o puramente pasiva.

Dependiendo del lenguaje, del framework y del diseño, el proceso puede involucrar:

- objetos complejos
- relaciones entre entidades
- comportamientos asociados a clases o tipos
- estados internos sensibles
- lógica implícita del ciclo de vida del objeto
- decisiones automáticas sobre cómo interpretar el contenido

Eso significa que la aplicación no solo “lee un dato”, sino que puede volver a introducir dentro de sí misma una estructura que el atacante logró influir.

Por eso Insecure Deserialization puede tener impacto muy alto y, en ciertos contextos, escalar hacia problemas mucho más graves que una simple manipulación de valores.

---

## Qué busca lograr un atacante con esta vulnerabilidad

El objetivo depende muchísimo del ecosistema técnico y de cómo se use la deserialización, pero a nivel conceptual un atacante puede intentar:

- alterar el estado interno que la aplicación reconstruye
- influir sobre objetos o estructuras que el sistema considera confiables
- modificar lógica ligada a esa reconstrucción
- obtener acceso a información o comportamientos no previstos
- cambiar atributos, banderas o relaciones internas
- aprovechar el proceso de reconstrucción para ampliar el alcance del incidente

La idea importante es esta:

> el atacante no quiere solo enviar datos incorrectos; quiere que la aplicación los convierta en algo internamente valioso o peligroso.

---

## Por qué ocurre

Insecure Deserialization suele aparecer cuando la aplicación asume demasiado sobre los datos que deserializa.

A nivel conceptual, puede pasar cuando:

- se reciben estructuras serializadas desde un contexto no confiable
- se reconstruyen objetos sin verificar si el origen y el contenido son legítimos
- se confía en que “si antes fue serializado por la app, entonces ahora debe seguir siendo confiable”
- se usan mecanismos de deserialización demasiado poderosos para contextos expuestos
- no se limita qué tipos, estructuras o estados pueden reconstruirse
- se trata un dato transportado como si siguiera siendo una representación segura solo por su formato

La raíz del problema vuelve a ser conocida:

> la aplicación otorga demasiado poder semántico a datos externos.

No los trata solo como entrada.  
Los trata como piezas capaces de reingresar a la lógica interna con demasiado privilegio.

---

## Qué diferencia hay entre recibir datos y reconstruir objetos

Este punto es fundamental.

No es lo mismo:

- recibir un valor simple
- parsear una estructura controlada
- reconstruir un objeto interno con significado y comportamiento dentro de la aplicación

La deserialización insegura es más delicada que una simple validación de input porque la aplicación no está solamente interpretando texto o campos aislados.

Está reconstruyendo algo que puede afectar:

- estado
- lógica
- decisiones
- relaciones internas
- flujo de ejecución

Podría resumirse así:

- recibir datos es normal
- convertirlos en entidades internas de alto valor sin garantías suficientes, no

---

## Dónde puede aparecer

Este problema puede aparecer en distintos lugares donde la aplicación intercambia o persiste estructuras complejas.

### Sesiones o estados del lado cliente

Si el sistema serializa estados y luego los reconstruye sin suficiente protección.

### Intercambio entre servicios o componentes

Cuando se transmiten objetos o estructuras ricas entre partes del sistema.

### Cachés, colas, almacenamiento temporal o persistencia intermedia

Si luego esos datos vuelven a convertirse en objetos sin garantías de integridad.

### Cookies, parámetros o tokens que contienen estructuras serializadas

Si la aplicación reconstruye estados internos a partir de ellos con demasiada confianza.

### Funciones administrativas o herramientas internas

No es un problema exclusivo de superficies públicas; también puede aparecer en flujos de backend o soporte poco revisados.

---

## Qué impacto puede tener

El impacto depende mucho de qué reconstruye la aplicación, de cuánta confianza le otorga a esa reconstrucción y de qué comportamiento está ligado a esas estructuras.

### Sobre integridad del estado

Puede permitir que el sistema trabaje con un estado interno adulterado.

### Sobre control de acceso

Puede influir sobre atributos o decisiones que afectan privilegios, sesiones o contexto de usuario.

### Sobre lógica de negocio

Puede introducir estructuras que desvíen el flujo normal o alteren condiciones esperadas.

### Sobre seguridad general

Dependiendo del entorno, la vulnerabilidad puede abrir puertas a problemas mucho más profundos.

Ese último punto es importante:  
Insecure Deserialization suele ser especialmente delicada porque el impacto puede crecer mucho según el ecosistema y los componentes implicados.

---

## Relación con la confianza implícita

Este tema enseña una lección muy valiosa:

> una representación serializada no deja de ser datos externos solo porque “parece venir del sistema”.

A veces las aplicaciones caen en la trampa de pensar algo como:

- “esto fue serializado por nuestra aplicación alguna vez”
- “tiene el formato correcto”
- “parece una estructura válida”
- “si se puede parsear, entonces debe ser confiable”

Pero en seguridad eso no alcanza.

La confianza no debería venir del formato ni de la apariencia de la estructura, sino de controles reales sobre:

- origen
- integridad
- contenido
- tipo
- contexto de uso

---

## Ejemplo conceptual simple

Imaginá una aplicación que toma una estructura serializada y la reconstruye para recuperar un estado interno.

Hasta ahí, eso podría ser legítimo.

Ahora imaginá que la aplicación confía demasiado en esa estructura y la deserializa como si siguiera siendo una representación segura del estado original, sin preguntarse si fue alterada o si el objeto resultante sigue siendo adecuado para ese contexto.

Entonces el sistema ya no está solo leyendo datos:  
está aceptando que algo externo vuelva a entrar como estructura interna con demasiado poder.

Ese es el corazón de Insecure Deserialization:

> la aplicación deja que una representación externa influya indebidamente en el mundo interno de sus objetos, estados o decisiones.

---

## Diferencia con otras vulnerabilidades de inyección

Conviene ubicar bien este tema frente a otros ataques ya vistos.

### En SQL Injection
La entrada influye sobre una consulta.

### En XSS
La entrada influye sobre cómo el navegador interpreta contenido.

### En SSTI
La entrada influye sobre la lógica de una plantilla del lado servidor.

### En Insecure Deserialization
La entrada influye sobre cómo la aplicación reconstruye estructuras internas con significado y valor interno.

El patrón profundo es parecido:

- el dato externo se mezcla con algo que no debería controlar

Pero la superficie cambia mucho.

Acá no hablamos solo de consultas, HTML o plantillas, sino de **objetos y estados internos** del sistema.

---

## Qué señales pueden sugerir este problema

Detectarlo no siempre es sencillo a simple vista, pero algunas situaciones deberían encender alertas.

### Ejemplos conceptuales

- la aplicación deserializa estructuras provenientes de contextos no completamente confiables
- se reconstruyen objetos complejos a partir de datos externos
- hay confianza excesiva en sesiones, cookies o estructuras serializadas visibles o transportables
- el sistema usa mecanismos de deserialización muy poderosos sin fuertes restricciones
- revisión de diseño o código donde se restauran estados internos desde datos manipulables
- cambios de comportamiento que sugieren que un estado reconstruido influye demasiado en decisiones internas

Muchas veces el problema se descubre más claramente durante revisión de arquitectura o código que durante pruebas superficiales del flujo de usuario.

---

## Por qué no se resuelve solo “validando un par de campos”

Ese enfoque suele ser insuficiente.

El problema de fondo no es solo si algunos valores tienen el formato esperado, sino si la aplicación debería estar reconstruyendo ese objeto o estructura en primer lugar bajo ese nivel de confianza.

La pregunta importante no es solo:

- ¿los campos parecen correctos?

sino también:

- ¿esta estructura debería venir desde afuera?
- ¿qué parte del estado interno estamos reconstruyendo?
- ¿qué implica confiar en ella?
- ¿qué comportamiento o decisión se dispara por reconstruirla?

La defensa sólida requiere mirar la semántica completa de la reconstrucción, no solo la sintaxis superficial.

---

## Por qué sigue siendo un tema importante

Insecure Deserialization sigue siendo muy relevante porque:

- muchas aplicaciones modernas intercambian estructuras ricas
- el uso de serialización es común en sesiones, almacenamiento temporal y comunicación entre servicios
- los desarrolladores pueden olvidar cuánta confianza semántica implica reconstruir un objeto
- el impacto puede ser muy alto cuando la estructura reconstruida toca sesiones, privilegios o lógica sensible
- algunos mecanismos de deserialización ofrecen mucho poder y merecen un diseño especialmente cuidadoso

Además, estudiar este tema ayuda a reforzar una idea central del curso:

> cuanto más “inteligente” o rica es la estructura que la aplicación reconstruye, más peligrosa puede ser la confianza excesiva en datos externos.

---

## Qué puede hacer una organización para prevenir este problema

Desde una mirada defensiva, algunas ideas clave son:

- evitar deserializar datos no confiables siempre que sea posible
- no reconstruir objetos internos complejos a partir de entrada externa sin garantías fuertes
- revisar especialmente sesiones, estados transportados y estructuras persistidas fuera del control estricto del servidor
- limitar qué tipos y estructuras pueden reconstruirse
- tratar la deserialización como una operación de alta sensibilidad
- diseñar el sistema para confiar menos en estados serializados y más en datos controlados del lado servidor
- revisar con rigor toda frontera donde un objeto “sale” del sistema y luego vuelve a entrar

La idea central es que la aplicación no debería reconstruir ciegamente su mundo interno a partir de datos externos.

---

## Error común: pensar que si el formato parece válido entonces ya es seguro

No.

Un formato correcto no garantiza que:

- el origen sea confiable
- el contenido sea legítimo
- la estructura deba reconstruirse
- el objeto resultante sea seguro para ese contexto

La seguridad no depende de que “parsee bien”, sino de si corresponde confiar en lo que se está reconstruyendo.

---

## Error común: creer que esto solo importa en sistemas grandes o muy complejos

No necesariamente.

Es cierto que cuanto más complejo es el sistema, más lugares puede haber donde se serializan y deserializan estructuras ricas.

Pero incluso aplicaciones más chicas pueden tener puntos delicados si:

- guardan sesiones complejas
- transportan estados internos
- intercambian objetos entre módulos
- usan mecanismos de reconstrucción con demasiada confianza

La complejidad amplifica el riesgo, pero no lo crea por sí sola.

---

## Idea clave del tema

Insecure Deserialization ocurre cuando una aplicación reconstruye objetos, estados o estructuras internas a partir de datos externos sin controles suficientemente seguros sobre origen, integridad, contenido y tipo de reconstrucción.

Este tema enseña que:

- deserializar no es solo “leer datos”; es reintroducir estructuras con significado interno
- la confianza en formatos o estados serializados puede ser muy peligrosa
- el impacto puede alcanzar lógica de negocio, control de acceso y seguridad general
- la prevención depende de reducir la confianza en datos externos y tratar la deserialización como una operación crítica

---

## Resumen

En este tema vimos que:

- serializar convierte estructuras internas en representaciones transportables o almacenables
- deserializar las reconstruye para volver a usarlas dentro de la aplicación
- Insecure Deserialization aparece cuando esa reconstrucción se hace con demasiada confianza en datos externos
- puede afectar estados internos, privilegios, lógica y seguridad general
- se diferencia de otras inyecciones porque el problema está en cómo el sistema reconstruye objetos o estructuras internas
- la defensa requiere reducir confianza, limitar reconstrucción y revisar cuidadosamente dónde se reingresan estados al sistema

---

## Ejercicio de reflexión

Pensá en una aplicación que:

- guarda sesiones
- intercambia datos entre servicios
- usa caché o almacenamiento temporal
- reconstruye estados internos
- tiene algunos flujos administrativos y objetos con privilegios distintos

Intentá responder:

1. ¿qué partes del sistema serializan y deserializan estructuras?
2. ¿cuáles serían más delicadas si la aplicación confiara demasiado en la reconstrucción?
3. ¿qué diferencia hay entre parsear datos y reconstruir objetos internos significativos?
4. ¿por qué un formato válido no alcanza como garantía de seguridad?
5. ¿qué principios aplicarías para reducir el riesgo de esta clase de vulnerabilidad?

---

## Autoevaluación rápida

### 1. ¿Qué es Insecure Deserialization?

Es una vulnerabilidad donde la aplicación reconstruye objetos, estados o estructuras internas a partir de datos externos sin controles suficientemente seguros.

### 2. ¿Por qué puede ser especialmente grave?

Porque no se limita a leer datos: puede reintroducir en el sistema estructuras con significado interno y alto impacto en lógica o privilegios.

### 3. ¿Cuál es la raíz conceptual del problema?

La confianza excesiva en datos serializados externos como si siguieran siendo representaciones internas seguras.

### 4. ¿Qué defensa ayuda mucho a prevenirla?

Evitar deserializar datos no confiables, limitar qué estructuras pueden reconstruirse y tratar la deserialización como una operación crítica de seguridad.

---

## Próximo tema

En el siguiente tema vamos a estudiar el **Server-Side Request Forgery (SSRF)**, una vulnerabilidad avanzada donde la aplicación puede ser inducida a hacer solicitudes desde el servidor hacia destinos internos o sensibles que la persona atacante no podría alcanzar directamente.
