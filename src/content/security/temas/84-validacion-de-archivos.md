---
title: "Validación de archivos"
description: "Cómo validar archivos de forma segura en una aplicación Java con Spring Boot. Qué conviene revisar realmente al recibir un upload, por qué extensión y MIME declarado no alcanzan, y cómo pensar tamaño, tipo, estructura, contexto de uso y costo de procesamiento sin caer en validaciones superficiales."
order: 84
module: "Archivos, serialización y procesamiento riesgoso"
level: "base"
draft: false
---

# Validación de archivos

## Objetivo del tema

Entender cómo hacer una **validación de archivos** razonablemente sana en una aplicación Java + Spring Boot.

La idea es revisar una confusión muy común:

- “validar archivo” parece significar
- mirar la extensión
- mirar el MIME que mandó el cliente
- poner un límite de tamaño
- y aceptar si “más o menos coincide”

Eso puede servir como primera capa.
Pero casi nunca alcanza.

Porque un archivo puede:

- llamarse de una forma engañosa
- declarar un tipo que no coincide
- ser técnicamente válido pero no apto para tu flujo
- ser demasiado costoso de procesar
- tener estructura inesperada
- traer contenido mezclado
- comportarse distinto de lo que el negocio suponía

En resumen:

> validar un archivo no es solo comprobar “qué dice ser”.  
> También es decidir si ese archivo encaja de verdad en el caso de uso, en el riesgo aceptable y en la capacidad real del sistema para manejarlo.

---

## Idea clave

La validación de archivos debería responder al menos estas preguntas:

- ¿este tipo de archivo está permitido para este flujo?
- ¿su tamaño es razonable?
- ¿su formato real coincide con lo esperado?
- ¿su estructura interna parece compatible con lo que el sistema sabe manejar?
- ¿su nombre, metadata o contexto generan riesgos?
- ¿el backend realmente necesita aceptarlo?
- ¿el costo de procesarlo es razonable?
- ¿qué pasa si el archivo es válido técnicamente, pero no válido para el negocio?

La idea central es esta:

> una validación sana no se limita a una etiqueta superficial.  
> Busca reducir incertidumbre sobre lo que está entrando y sobre lo que el sistema hará después con eso.

---

## Qué problema intenta resolver este tema

Este tema busca evitar patrones como:

- aceptar por extensión sin mirar nada más
- confiar en el `Content-Type` enviado por el cliente
- tratar “archivo válido” como sinónimo de “archivo seguro”
- permitir tamaños o cantidades sin relación con el caso de uso
- validar solo el nombre y no el contenido real
- dejar pasar formatos complejos que luego nadie controla bien
- olvidar que el mismo tipo de archivo puede tener variantes peligrosas o costosas
- aceptar un archivo técnicamente correcto pero absurdo para el flujo de negocio
- procesar archivos sin haber validado antes si vale la pena hacerlo
- creer que una validación genérica sirve igual para todos los endpoints de upload

Es decir:

> el problema no es no tener una validación perfecta.  
> El problema es conformarse con una validación tan superficial que en la práctica no reduce casi ningún riesgo real.

---

## Error mental clásico

Un error muy común es este:

### “Si termina en `.jpg` y el navegador mandó `image/jpeg`, entonces es una imagen válida”

Eso es una base floja.

Porque ni la extensión ni el MIME declarado por el cliente garantizan por sí solos:

- contenido real
- formato esperado
- inocuidad
- costo razonable
- compatibilidad con tu pipeline

### Idea importante

La validación sana mira varias capas.
No confía ciegamente en una sola pista superficial.

---

## La validación depende del caso de uso

No existe una “validación universal de archivos” que sirva igual para todo.

No es lo mismo validar un:

- avatar
- comprobante PDF
- imagen de producto
- CSV de importación
- archivo temporal para OCR
- documento adjunto de soporte
- evidencia privada de verificación
- archivo interno para un backoffice

### Porque cambia

- el tipo permitido
- el tamaño razonable
- el nivel de riesgo aceptable
- quién lo va a ver después
- si se procesará o no
- si quedará público o privado
- cuánto tiempo vivirá
- qué daño produce si falla o se filtra

### Regla sana

Primero definí el caso de uso.
Después definí la validación.
No al revés.

---

## Primera capa: permitir solo tipos explícitos

Una práctica básica y muy sana es no pensar en “aceptar archivos” en general, sino en aceptar solo una lista acotada por flujo.

### Ejemplos

- avatar: solo ciertos formatos de imagen
- comprobante: solo PDF
- importación: solo CSV bajo una estructura conocida
- evidencia: solo ciertos documentos, con límites más estrictos

### Idea útil

Cuanto más abierta es la política de tipos permitidos, más difícil es controlar el resto.

Validar bien empieza por no aceptar más de lo que el caso de uso necesita.

---

## Segunda capa: límite de tamaño razonable

Esto parece obvio, pero muchas implementaciones lo hacen mal o demasiado tarde.

### Preguntas útiles

- ¿cuál es el tamaño máximo razonable para este flujo?
- ¿qué pasa si llegan varios archivos al mismo tiempo?
- ¿el límite está en el cliente, en Spring, en el reverse proxy y en el procesamiento posterior?
- ¿ese tamaño sigue siendo razonable una vez descomprimido o interpretado?

### Idea importante

El límite no debería ser “lo más grande que aguante la infra”.
Debería ser “lo máximo que el caso de uso realmente necesita”.

---

## Tercera capa: no confiar solo en el MIME declarado

El cliente puede mandar un `Content-Type` que no representa fielmente el contenido real.

Entonces, usar el MIME declarado ayuda, pero no debería ser la única defensa.

### Por qué importa

Porque el MIME enviado:

- puede ser incorrecto
- puede ser manipulado
- puede estar ausente
- puede ser demasiado genérico
- puede no coincidir con la estructura real del archivo

### Regla útil

Tomá el MIME declarado como una señal inicial, no como verdad absoluta.

---

## Cuarta capa: no confiar solo en la extensión

La extensión también es una pista, no una garantía.

### Problemas típicos

- nombres renombrados a mano
- extensiones múltiples
- extensiones engañosas
- archivos con contenido no coherente
- usuarios o atacantes que prueban qué pasa si disfrazan el archivo

### Idea importante

La extensión sirve para UX, organización o ciertas validaciones simples.
No debería ser la base principal de seguridad.

---

## Quinta capa: contenido o firma real del archivo

Una validación más seria suele intentar reconocer el tipo real del archivo a partir de su contenido o firma.

No hace falta entrar todavía en detalle de implementación.
Lo importante es la idea:

> el backend debería intentar identificar mejor qué está recibiendo, no solo repetir lo que el cliente dijo.

### Qué gana esto

- más coherencia entre tipo esperado y contenido real
- menos dependencia de nombre o MIME
- más capacidad de rechazar disfraces obvios
- mejor base para decidir si conviene procesar o no

---

## Pero “reconocer el tipo” tampoco agota el problema

Esto también es importante.

Supongamos que el backend confirma que el archivo realmente es un PDF o una imagen.
Eso todavía no significa que sea seguro o adecuado.

Porque igual puede ser:

- demasiado grande
- demasiado complejo
- incorrecto para el negocio
- difícil de procesar
- innecesario para el flujo
- costoso en memoria o CPU
- apto para confundir usuarios o revisores

### Regla sana

Tipo real correcto no significa automáticamente “aceptable”.

---

## Validación de estructura y expectativa de negocio

A veces el problema no es el tipo técnico, sino la expectativa del flujo.

### Ejemplos

Un archivo puede ser técnicamente un PDF válido, pero:

- tener cientos de páginas
- ser un documento enorme cuando el caso esperaba un comprobante breve
- incluir contenido irrelevante o engañoso
- no servir para el proceso que se intenta completar

Una imagen puede ser técnicamente válida, pero:

- tener resolución absurda
- dimensiones fuera del rango útil
- formato aceptable pero impráctico
- peso excesivo para un avatar

### Idea importante

La validación real no termina en el formato.
También tiene que mirar si el archivo es coherente con el uso esperado.

---

## Cantidad de archivos: otra validación que suele olvidarse

No solo importa validar cada archivo por separado.
También importa validar:

- cuántos archivos permite el flujo
- si se aceptan reintentos
- si puede reemplazarse el anterior
- si el usuario está abusando el canal como storage
- si hay riesgo de flood aunque cada archivo individual sea válido

### Regla útil

Validar uploads también significa poner límites de volumen y frecuencia, no solo de tipo y tamaño.

---

## El orden importa: validar antes de procesar profundo

Otra mala práctica común es procesar demasiado pronto.

Por ejemplo:

- generar thumbnail
- leer metadata compleja
- indexar texto
- convertir formato
- pasar OCR
- abrir librerías pesadas

antes de haber validado lo suficiente.

### Problema

Si procesás antes de validar, ya abriste exposición a:

- consumo de recursos
- librerías frágiles
- errores innecesarios
- archivos que igual ibas a rechazar

### Regla sana

Primero descartá lo claramente no permitido con validaciones baratas y tempranas.
Solo después pensá en procesamiento más costoso.

---

## Validación y nombre del archivo

Aunque el nombre no sirva como prueba de tipo, igual merece validación.

### Qué conviene revisar

- longitud
- caracteres extraños o conflictivos
- intención de usarlo en paths o URLs
- ambigüedad
- exposición de información personal en el nombre
- intento de manipular rutas o almacenamiento
- necesidad real de conservar el nombre original

### Idea útil

El nombre del archivo no debería ser tratado como dato inocente solo porque no es el contenido binario.

---

## Validación y contexto del actor

No toda validación depende solo del archivo en sí.
También depende de quién lo sube y en qué contexto.

### Ejemplos

- cierto rol puede subir un tipo, otro no
- un tenant puede tener más cuota o menos
- un usuario nuevo no debería poder subir demasiados archivos
- un flujo de verificación requiere más controles que un avatar
- un entorno admin puede necesitar otra política, pero no ilimitada

### Idea importante

La validación del archivo también puede depender del contexto de autorización y del modelo de abuso.

---

## Lo “válido” debería ser lo mínimo útil, no lo máximo tolerable

Este cambio mental ayuda muchísimo.

Mucha gente valida preguntándose:

- “¿qué es lo máximo que podemos soportar?”

Una pregunta mejor es:

- “¿qué es lo mínimo suficientemente útil para este flujo?”

### Porque eso suele llevar a

- menos tipos permitidos
- menos tamaño
- menos complejidad
- menos superficie
- menos procesamiento
- menos ambigüedad

Y todo eso reduce riesgo.

---

## Archivos que luego se servirán a otros usuarios

Si el archivo luego será:

- descargado por otros
- mostrado en UI
- abierto por operadores
- usado como preview
- compartido externamente

la validación debería ser todavía más cuidadosa.

Porque ya no protegés solo al backend.
También protegés a:

- otros usuarios
- soporte
- admin
- herramientas del ecosistema
- navegadores o visores que consumirán ese archivo después

### Idea útil

Cuanto más reutilización o exposición posterior tenga el archivo, más importante es la calidad de la validación inicial.

---

## Archivos temporales también necesitan validación real

Aunque el archivo no vaya a quedar permanente, igual puede:

- consumir recursos
- pasar por parsers
- tocar disco
- activar conversiones
- quedar en temporales
- detonar errores

### Regla práctica

Temporal no justifica validación floja.
Solo cambia parte del impacto posterior, no el hecho de que el archivo puede dañar el flujo actual.

---

## Validación y feedback al cliente

Este tema también toca cómo responder.

Conviene que el backend pueda decir con suficiente claridad cosas como:

- tipo no permitido
- archivo demasiado grande
- cantidad excedida
- formato no aceptado para este flujo

sin regalar detalles innecesarios sobre detección interna o librerías.

### Idea importante

La validación debe ayudar a clientes legítimos a corregir, pero sin convertir la API en una guía de prueba ofensiva demasiado detallada.

---

## Qué conviene revisar en una implementación real

Cuando revises validación de archivos en una app Spring, mirá especialmente:

- lista de tipos permitidos por endpoint
- límites de tamaño y cantidad
- uso del MIME declarado
- uso de la extensión
- verificación del tipo real
- validaciones de nombre o metadata
- momento en que se hace cada validación
- qué procesamiento ocurre antes de validar
- diferencias de política según actor o flujo
- mensajes de error
- casos donde “válido técnicamente” no equivale a “válido para el negocio”

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- tipos permitidos acotados por caso de uso
- límites razonables de tamaño y cantidad
- menos confianza ciega en cliente, extensión o MIME
- validaciones tempranas antes de procesamiento costoso
- mejor coherencia entre tipo real y uso esperado
- controles distintos según exposición del archivo
- menor tolerancia a archivos “aceptables técnicamente” pero absurdos para el flujo
- mensajes de error útiles sin sobreexplicar

---

## Señales de ruido

Estas señales merecen revisión rápida:

- validar solo por extensión
- confiar totalmente en el MIME del cliente
- “aceptamos casi cualquier cosa y vemos después”
- límites demasiado amplios por costumbre
- procesamiento pesado antes de validar
- ausencia total de control de cantidad
- nombres de archivo sin revisión
- el mismo criterio de validación para avatar, documento, importación y adjunto admin
- nadie puede explicar qué significa exactamente “archivo válido” para ese flujo

---

## Checklist práctico

Cuando revises validación de archivos, preguntate:

- ¿qué tipos de archivo necesita realmente este endpoint?
- ¿qué tamaño máximo tiene sentido de negocio y de infraestructura?
- ¿se valida cantidad además de tamaño?
- ¿estamos confiando demasiado en extensión o MIME del cliente?
- ¿tenemos una señal mejor sobre el tipo real?
- ¿el archivo es válido solo técnicamente o también para el flujo de negocio?
- ¿se valida antes de procesar más profundo?
- ¿qué pasa con el nombre y la metadata?
- ¿qué diferencia haría una cuenta abusiva usando este endpoint muchas veces?
- ¿qué simplificaría para reducir superficie sin romper el caso de uso?

---

## Mini ejercicio de reflexión

Tomá un endpoint real de upload de tu proyecto y respondé:

1. ¿Qué archivos acepta hoy?
2. ¿Qué criterios usa para validarlos?
3. ¿En qué confía demasiado?
4. ¿Qué archivo técnicamente “válido” podría igual ser problemático para el negocio?
5. ¿Qué procesamiento hace antes de validar a fondo?
6. ¿Qué límites de tamaño y cantidad tiene?
7. ¿Qué cambio harías primero para que esa validación fuera más real y menos superficial?

---

## Resumen

Validar archivos bien significa reducir incertidumbre sobre lo que entra y sobre lo que el sistema hará después con eso.

No alcanza con mirar:

- extensión
- MIME
- o un tamaño aislado

Hace falta pensar también:

- tipo permitido por flujo
- tipo real
- tamaño y cantidad razonables
- estructura o coherencia con el negocio
- costo de procesamiento
- exposición posterior
- contexto del actor

En resumen:

> una validación madura no intenta adivinar si el archivo “parece bien”.  
> Intenta asegurarse de que ese archivo encaja realmente en el caso de uso, en el riesgo aceptable y en la capacidad del sistema para manejarlo sin abrir superficie innecesaria.

---

## Próximo tema

**MIME, extensión y contenido real**
