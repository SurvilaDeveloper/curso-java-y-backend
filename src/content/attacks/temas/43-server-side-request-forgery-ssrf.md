---
title: "Server-Side Request Forgery (SSRF)"
description: "Qué es Server-Side Request Forgery, por qué ocurre, qué impacto puede tener sobre servicios internos o recursos sensibles y qué principios defensivos ayudan a prevenir que una aplicación haga solicitudes inseguras desde el servidor."
order: 43
module: "Ataques web más avanzados"
level: "intermedio"
draft: false
---

# Server-Side Request Forgery (SSRF)

En el tema anterior vimos **Insecure Deserialization**, donde el problema aparecía cuando una aplicación reconstruía objetos o estados internos a partir de datos externos con demasiada confianza.

Ahora vamos a estudiar otra vulnerabilidad avanzada y muy importante: **Server-Side Request Forgery**, o **SSRF**.

La idea general es esta:

> una aplicación puede ser inducida a realizar solicitudes desde el servidor hacia destinos que la persona atacante no debería poder alcanzar directamente.

Eso vuelve a SSRF especialmente delicada porque el atacante ya no depende solo de lo que puede tocar desde su navegador o desde internet de forma directa.

En cambio, intenta aprovechar algo mucho más valioso:

- la posición de la aplicación dentro de la red
- la confianza que otros servicios depositan en ella
- el acceso del servidor a recursos internos o sensibles
- la capacidad del backend para hacer requests a otros destinos

Por eso SSRF es tan importante:  
la aplicación deja de ser solo el objetivo del ataque y pasa a convertirse en un **intermediario** que hace solicitudes en nombre del atacante.

---

## Qué significa “server-side request”

Una **server-side request** es una solicitud que la aplicación realiza desde el servidor hacia otro recurso o servicio.

Eso puede ser completamente legítimo y muy común.

Por ejemplo, muchas aplicaciones necesitan:

- descargar contenido desde una URL
- consultar APIs externas
- validar recursos remotos
- generar previsualizaciones
- recuperar archivos o imágenes
- hablar con servicios internos
- integrarse con otros componentes del sistema
- consultar metadatos o proveedores de infraestructura

La idea importante es esta:

> el servidor no solo responde solicitudes; también puede originarlas.

Eso es normal.  
El problema aparece cuando una persona externa puede influir indebidamente sobre **a dónde** o **cómo** hace esas solicitudes.

---

## Qué es SSRF

**Server-Side Request Forgery** ocurre cuando una aplicación acepta una entrada que termina influyendo de forma insegura sobre una solicitud emitida por el servidor.

La clave conceptual es esta:

- la persona atacante no llega directamente al recurso objetivo
- logra que la aplicación haga la solicitud por ella
- el servidor usa su propia posición, conectividad o confianza para llegar a ese destino
- la respuesta o el efecto de esa solicitud puede beneficiar al atacante

Dicho de forma simple:

> el atacante convence al servidor de pedir algo que no debería pedir o de pedírselo a quien no debería.

Esto puede ser especialmente grave cuando el servidor tiene acceso a recursos más internos, más confiables o más privilegiados que los que tendría una persona externa.

---

## Por qué este problema es tan peligroso

SSRF es peligroso porque el servidor suele ocupar una posición mucho más poderosa que una persona atacante externa.

Por ejemplo, el backend puede tener acceso a:

- servicios internos no expuestos públicamente
- APIs privadas
- paneles internos
- recursos en red local
- infraestructura en la nube
- metadatos del entorno
- servicios protegidos por reglas de red que confían en el propio servidor

Eso significa que una aplicación vulnerable puede convertirse en un puente hacia lugares que desde afuera parecen bien aislados.

La idea importante es esta:

> lo peligroso no es solo la request en sí, sino desde dónde se hace y con qué nivel de confianza es recibida.

---

## Qué busca lograr un atacante con SSRF

El objetivo varía según el entorno, pero conceptualmente el atacante puede intentar:

- alcanzar servicios internos
- consultar recursos que no están expuestos a internet
- descubrir información sobre la red o el entorno del servidor
- usar a la aplicación como proxy hacia destinos restringidos
- interactuar con APIs o componentes que confían en el backend
- ampliar el reconocimiento interno
- abrir la puerta a ataques posteriores más específicos

No siempre el objetivo inicial es “romper” algo de inmediato.  
A veces el valor está en que el servidor revela:

- qué puede alcanzar
- qué responde
- qué existe internamente
- qué otras piezas del sistema están detrás de la aplicación

---

## Por qué ocurre

SSRF suele aparecer cuando la aplicación permite que una entrada externa influya demasiado sobre una solicitud que el servidor va a emitir.

A nivel conceptual, puede pasar cuando:

- el usuario proporciona una URL o destino remoto
- la aplicación la usa sin una validación fuerte del destino permitido
- el sistema asume que “si es una URL, entonces está bien”
- se delega demasiado en el servidor para consultar recursos externos o remotos
- no se distingue bien entre destinos públicos, internos o sensibles
- se acepta un recurso remoto sin controlar con suficiente rigor hacia dónde apunta realmente

La raíz del problema es esta:

> una decisión sensible de conectividad queda demasiado controlada por datos externos.

Y como la decisión la ejecuta el servidor, el impacto puede ser mucho más serio que si la solicitud la hiciera directamente el navegador del usuario.

---

## Qué diferencia hay entre una solicitud del navegador y una del servidor

Este punto es fundamental.

### Solicitud del navegador
Sale desde la máquina o el entorno de la persona usuaria.

### Solicitud del servidor
Sale desde la infraestructura donde corre la aplicación.

Eso cambia muchísimo el riesgo porque el servidor puede tener:

- otra ubicación de red
- otros permisos
- otra visibilidad interna
- otras relaciones de confianza
- acceso a servicios que no están disponibles desde internet pública

Por eso una URL aparentemente “simple” puede volverse peligrosa si quien la consulta no es el navegador, sino el backend.

Podría resumirse así:

> no es lo mismo lo que puede pedir una persona desde afuera que lo que puede pedir el propio servidor desde adentro.

---

## Dónde puede aparecer

SSRF suele aparecer en funciones donde la aplicación hace requests a URLs o recursos remotos a partir de datos recibidos.

### Descarga o importación de contenido remoto

Por ejemplo:

- imágenes
- documentos
- feeds
- archivos
- recursos externos

### Generación de previews o enriquecimiento de enlaces

Cuando la aplicación consulta una URL para obtener metadatos o contenido resumido.

### Integraciones con APIs

Si una parte del destino o del recurso consultado queda controlada externamente.

### Funciones administrativas o de soporte

Herramientas internas que permiten “probar”, “consultar” o “validar” URLs pueden volverse muy delicadas.

### Automatizaciones o conectores

Sistemas que toman endpoints configurables y los consultan desde el backend.

En todos estos casos, la pregunta crítica es la misma:

> ¿quién decide realmente hacia dónde se conecta el servidor?

---

## Qué impacto puede tener

El impacto depende mucho de la red, de los servicios accesibles desde el backend y del nivel de control que la aplicación tenga sobre la respuesta.

### Sobre confidencialidad

Puede exponer:

- información interna
- servicios privados
- metadatos del entorno
- respuestas de APIs no públicas
- detalles de la red o infraestructura

### Sobre reconocimiento interno

Puede permitir descubrir:

- hosts o servicios disponibles
- puertos o rutas que responden
- componentes internos
- relaciones entre sistemas

### Sobre seguridad general

Puede abrir la puerta a encadenar ataques posteriores más específicos contra recursos que desde afuera no eran visibles.

### Sobre integridad u operación

Si el servidor puede enviar solicitudes a servicios con capacidad de cambio de estado, el impacto puede ir más allá de la mera lectura o reconocimiento.

Esto último depende mucho del entorno, pero por eso SSRF suele considerarse especialmente delicada en arquitecturas modernas y distribuidas.

---

## Relación con redes internas y confianza implícita

SSRF enseña muy bien una lección importante:

> la seguridad de un recurso no depende solo de “no estar expuesto a internet”, sino también de quién dentro del sistema puede alcanzarlo.

Muchas arquitecturas asumen algo como:

- este servicio solo acepta tráfico interno
- esta API es privada
- este panel no sale a internet
- este recurso solo es accesible desde la red del backend

Eso puede ser una defensa útil, pero se debilita mucho si una aplicación expuesta públicamente puede ser inducida a pedir recursos en nombre del atacante.

En otras palabras:

> el backend puede convertirse en una puerta hacia la red interna si no controla bien sus solicitudes salientes.

---

## Ejemplo conceptual simple

Imaginá una aplicación que permite cargar una URL para obtener una vista previa de un recurso remoto.

Hasta ahí, eso podría ser completamente legítimo.

Ahora imaginá que la aplicación no restringe bien qué destinos puede consultar y acepta prácticamente cualquier URL que le llegue.

Entonces la persona atacante no necesita acceder directamente a todos los recursos desde su navegador.  
Le alcanza con hacer que el servidor los consulte por ella.

Ese es el corazón de SSRF:

> el servidor, que tiene más alcance y más confianza, termina haciendo solicitudes bajo control parcial de una entrada externa.

---

## Qué señales pueden sugerir este problema

Detectarlo no siempre es fácil desde el uso superficial, pero algunas situaciones deberían hacer sospechar.

### Ejemplos conceptuales

- funciones que aceptan URLs externas y las consultan desde el backend
- generadores de preview, fetchers, importadores o validadores remotos sin lista permitida fuerte
- integraciones donde el destino se define demasiado libremente
- herramientas de soporte o administrativas que permiten “probar URLs”
- revisión de código donde el servidor hace requests a destinos derivados de entrada externa
- diferencias de comportamiento según el destino consultado por la aplicación

Muchas veces el hallazgo aparece durante revisión de arquitectura o código, especialmente en sistemas con muchas integraciones externas o internas.

---

## Por qué no se resuelve solo “validando que sea una URL”

Eso no alcanza.

El problema no es solo que el valor tenga forma de URL.  
La pregunta importante es:

- ¿a qué destinos está permitido conectarse realmente?
- ¿la aplicación distingue entre recursos públicos y sensibles?
- ¿qué pasa si el destino apunta a una red o servicio interno?
- ¿hay una lista explícita de orígenes válidos?
- ¿el backend puede terminar actuando como puente hacia recursos de alto valor?

La defensa sólida no depende de confirmar que “parece una URL válida”, sino de controlar rigurosamente **qué clase de destino es aceptable**.

---

## Relación con microservicios, nubes e integraciones

SSRF se volvió especialmente relevante en arquitecturas modernas porque hoy muchas aplicaciones viven rodeadas de:

- microservicios
- APIs internas
- servicios de infraestructura
- metadatos de nube
- conectores
- componentes con relaciones de confianza basadas en red

En entornos así, el backend suele tener más capacidad de acceso interno que antes.

Eso hace que una SSRF pueda ser mucho más valiosa para un atacante, incluso si la aplicación externa parece relativamente simple.

Por eso este tema no es solo una curiosidad teórica:  
está muy ligado a cómo funcionan arquitecturas modernas.

---

## Qué puede hacer una organización para prevenir este problema

Desde una mirada defensiva, algunas ideas clave son:

- evitar que entradas externas definan libremente destinos que el servidor va a consultar
- usar listas permitidas de hosts o servicios válidos
- separar claramente recursos externos legítimos de destinos internos o sensibles
- limitar la capacidad de salida del backend cuando sea posible
- revisar con especial cuidado funciones de preview, importación, fetch y validación remota
- tratar las solicitudes salientes del servidor como una superficie sensible de seguridad
- diseñar el sistema para que incluso una función vulnerable tenga el menor alcance posible

La idea central es que el backend no debería ser un proxy abierto bajo control parcial de una entrada externa.

---

## Error común: pensar que si el recurso atacado no está en internet pública ya está protegido

No necesariamente.

Si el servidor puede alcanzarlo y la aplicación puede ser inducida a hacer la request, entonces ese recurso sigue estando en riesgo.

La visibilidad pública no es el único factor.  
También importa muchísimo qué puede alcanzar el backend desde su posición interna.

---

## Error común: creer que este problema solo afecta “grandes infraestructuras”

No necesariamente.

Es cierto que en arquitecturas complejas SSRF puede tener más impacto.  
Pero incluso aplicaciones más pequeñas pueden verse afectadas si:

- hacen requests salientes
- consultan URLs externas
- integran servicios remotos
- corren en entornos con recursos internos de valor
- tienen herramientas administrativas o auxiliares con funciones de fetch

La complejidad puede amplificar el riesgo, pero no lo crea por sí sola.

---

## Idea clave del tema

Server-Side Request Forgery (SSRF) ocurre cuando una aplicación puede ser inducida a realizar solicitudes desde el servidor hacia destinos no previstos o no suficientemente controlados, aprovechando la posición y la confianza del backend.

Este tema enseña que:

- no basta con validar que el destino “parezca una URL”
- el backend no debería poder convertirse en un proxy libre hacia recursos internos o sensibles
- la seguridad de un recurso no depende solo de no estar expuesto públicamente, sino también de quién dentro del sistema puede alcanzarlo
- la prevención depende de restringir destinos, reducir alcance y tratar las requests salientes como una superficie crítica

---

## Resumen

En este tema vimos que:

- SSRF es una vulnerabilidad donde una entrada externa influye sobre solicitudes que el servidor realiza
- se vuelve peligrosa porque el backend puede acceder a recursos internos o más confiables que el atacante no puede alcanzar directamente
- puede afectar confidencialidad, reconocimiento interno y seguridad general
- aparece en funciones como previews, importaciones, conectores e integraciones remotas
- la raíz del problema está en ceder demasiado control del destino a una entrada externa
- la defensa requiere listas permitidas, restricción de destinos y reducción del alcance del backend

---

## Ejercicio de reflexión

Pensá en una aplicación que:

- genera previews de URLs
- importa archivos o imágenes remotas
- consulta APIs externas
- se integra con servicios internos
- corre dentro de una red con otros componentes privados
- tiene herramientas administrativas o de soporte para validar endpoints

Intentá responder:

1. ¿qué funciones hacen solicitudes desde el servidor?
2. ¿cuáles serían más delicadas si una entrada externa controlara el destino?
3. ¿por qué una request del backend puede ser más peligrosa que una del navegador?
4. ¿qué diferencia hay entre “URL válida” y “destino permitido”?
5. ¿qué principios aplicarías para evitar que el servidor se vuelva un proxy inseguro hacia recursos internos?

---

## Autoevaluación rápida

### 1. ¿Qué es SSRF?

Es una vulnerabilidad donde una aplicación puede ser inducida a hacer solicitudes desde el servidor hacia destinos no previstos o no suficientemente controlados.

### 2. ¿Por qué puede ser especialmente grave?

Porque el backend suele tener acceso a recursos internos o más confiables que la persona atacante no puede alcanzar directamente.

### 3. ¿Cuál es la raíz conceptual del problema?

Que una entrada externa influye demasiado sobre el destino de una request que ejecuta el servidor.

### 4. ¿Qué defensa ayuda mucho a prevenirlo?

Restringir explícitamente los destinos permitidos, controlar qué recursos puede consultar el backend y reducir el alcance de sus conexiones salientes.

---

## Próximo tema

En el siguiente tema vamos a estudiar los **ataques a APIs**, una superficie cada vez más importante en aplicaciones modernas, donde muchos de los problemas vistos hasta ahora reaparecen con variantes particulares en autenticación, autorización, exposición de datos y lógica de negocio.
