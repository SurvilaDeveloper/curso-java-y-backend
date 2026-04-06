---
title: "Indicadores de compromiso"
description: "Qué son los indicadores de compromiso, por qué importan en seguridad y qué tipos de señales pueden sugerir que un sistema, una cuenta o un servicio fue afectado."
order: 7
module: "Fundamentos de los ataques"
level: "intro"
draft: false
---

# Indicadores de compromiso

En seguridad, no siempre se detecta un ataque en el momento exacto en que empieza.

Muchas veces lo que primero aparece no es el ataque en sí, sino una **señal** de que algo anormal ya ocurrió o está ocurriendo.

A esas señales se las suele llamar **indicadores de compromiso**, también conocidos como **IoC** por la expresión en inglés *Indicators of Compromise*.

Entender este concepto es muy importante porque ayuda a responder preguntas como estas:

- ¿hay señales de que un sistema fue comprometido?
- ¿una cuenta está siendo utilizada de forma anómala?
- ¿un servicio está mostrando comportamientos sospechosos?
- ¿hay rastros que sugieren actividad maliciosa pasada o presente?

---

## Qué es un indicador de compromiso

Un **indicador de compromiso** es una evidencia observable que puede sugerir que un sistema, una cuenta, una aplicación o una red fue afectada por una actividad maliciosa.

La idea clave es esta:

> un IoC no siempre prueba por sí solo todo el incidente, pero sí puede señalar que existe una intrusión, un abuso o una alteración sospechosa que merece análisis.

Un indicador puede aparecer en muchos lugares:

- logs
- archivos
- procesos
- tráfico de red
- cuentas de usuario
- configuraciones
- servicios
- endpoints
- bases de datos

---

## Por qué son importantes

Los indicadores de compromiso son valiosos porque permiten:

- detectar incidentes que pasaron desapercibidos
- iniciar investigaciones
- correlacionar eventos
- confirmar sospechas
- reconstruir secuencias de ataque
- responder más rápido
- contener daños antes de que escalen

En la práctica, muchas investigaciones de seguridad empiezan con algo así:

- un login inusual
- un proceso raro
- una conexión sospechosa
- un archivo que no debería estar
- un cambio inesperado de permisos
- una alerta de comportamiento anómalo

Ese tipo de señal no siempre explica todo, pero puede ser la puerta de entrada a un análisis mucho más profundo.

---

## Un indicador no es lo mismo que una vulnerabilidad

Este es un punto importante.

### Vulnerabilidad
Es una debilidad que podría ser aprovechada.

### Indicador de compromiso
Es una señal que sugiere que algo sospechoso ya pasó, está pasando o dejó rastros.

Ejemplo:

- tener un panel expuesto sin MFA es una vulnerabilidad
- ver múltiples accesos administrativos desde ubicaciones inusuales puede ser un indicador de compromiso

Una cosa es la **posibilidad de abuso**.  
Otra cosa es la **evidencia observable de actividad sospechosa o maliciosa**.

---

## Un indicador tampoco es lo mismo que una certeza absoluta

Otro error común es pensar que todo IoC confirma automáticamente un ataque.

No siempre es así.

Algunos indicadores son fuertes y otros son ambiguos.  
Por ejemplo:

- una tarea programada nueva y desconocida puede ser sospechosa
- pero también podría deberse a una acción legítima no documentada

Por eso un indicador debe analizarse en contexto.

Un IoC puede ser:

- muy confiable
- moderadamente sospechoso
- débil y necesitar correlación con otras señales

En seguridad, una sola evidencia rara vez alcanza por sí sola para entender todo el incidente.

---

## Tipos comunes de indicadores de compromiso

Los indicadores pueden agruparse de muchas maneras.  
Una forma útil de empezar es pensar en **qué tipo de señal observable aparece**.

---

## Indicadores en cuentas y autenticación

Algunas señales frecuentes aparecen en el uso de credenciales y sesiones.

### Ejemplos

- logins desde ubicaciones inesperadas
- intentos repetidos sobre una misma cuenta
- inicios de sesión fuera de horario habitual
- acceso simultáneo desde lugares incompatibles
- cambios repentinos en contraseñas o factores de autenticación
- creación de cuentas nuevas sin justificación clara
- elevación inesperada de privilegios

### Qué pueden sugerir

- compromiso de cuentas
- abuso de credenciales robadas
- reutilización de sesiones
- movimientos iniciales de un atacante

---

## Indicadores en sistemas y procesos

También puede haber señales visibles en el sistema operativo o en el comportamiento de procesos.

### Ejemplos

- procesos desconocidos o inesperados
- ejecución de comandos fuera del patrón habitual
- consumo inusual de CPU, memoria o disco
- servicios nuevos o modificados
- tareas programadas no reconocidas
- binarios o scripts en ubicaciones extrañas
- reinicios o caídas sin explicación clara

### Qué pueden sugerir

- malware
- persistencia
- ejecución remota de comandos
- manipulación del sistema
- actividad posterior a una intrusión

---

## Indicadores en archivos y almacenamiento

Muchas intrusiones dejan rastros en archivos, carpetas o contenido almacenado.

### Ejemplos

- archivos nuevos que no deberían existir
- cambios no autorizados en configuraciones
- archivos renombrados o cifrados repentinamente
- aparición de scripts o herramientas desconocidas
- alteración de permisos sobre carpetas o documentos
- presencia de archivos ocultos o poco habituales
- eliminación inesperada de registros o contenido

### Qué pueden sugerir

- ransomware
- instalación de herramientas maliciosas
- intentos de ocultamiento
- exfiltración previa o manipulación de información

---

## Indicadores en red y comunicaciones

Muchas veces las señales más importantes aparecen en conexiones y tráfico.

### Ejemplos

- conexiones salientes hacia destinos inusuales
- tráfico a horarios anómalos
- comunicación persistente con hosts no reconocidos
- aumento repentino del volumen de tráfico
- conexiones internas entre sistemas que normalmente no interactúan
- uso extraño de puertos o protocolos
- patrones que sugieren exfiltración o control remoto

### Qué pueden sugerir

- comando y control
- movimiento lateral
- exfiltración de datos
- uso de infraestructura ajena para mantener acceso o comunicarse

---

## Indicadores en aplicaciones y APIs

Las aplicaciones también generan señales que pueden delatar abuso o intrusión.

### Ejemplos

- errores repetidos con patrones raros
- consultas o requests fuera de comportamiento normal
- múltiples accesos a rutas sensibles
- picos de uso sobre endpoints específicos
- parámetros manipulados de manera sospechosa
- respuestas anómalas o secuencias inusuales de acciones
- acceso a recursos de otros usuarios

### Qué pueden sugerir

- enumeración
- exploración de funcionalidades
- intentos de explotación
- abuso de autorización
- scraping malicioso
- automatización hostil

---

## Indicadores en privilegios y configuración

Otra categoría importante tiene que ver con cambios en permisos o configuraciones.

### Ejemplos

- roles modificados sin justificación
- permisos ampliados de forma extraña
- desactivación de controles de seguridad
- cambios en reglas de acceso
- modificación de políticas
- exclusiones extrañas en antivirus o monitoreo
- alteración de configuraciones críticas

### Qué pueden sugerir

- escalada de privilegios
- persistencia
- preparación para ataques posteriores
- intento de evasión o debilitamiento de defensas

---

## Indicadores de comportamiento

A veces el IoC no es un archivo ni una IP concreta, sino un patrón de comportamiento.

### Ejemplos

- un usuario accede a recursos que nunca había usado
- una cuenta de servicio empieza a interactuar con paneles administrativos
- un sistema envía más datos de lo habitual
- se observan secuencias poco compatibles con el uso legítimo
- una sesión realiza operaciones con velocidad o volumen atípicos

Estos indicadores son muy valiosos porque ayudan a detectar ataques que no siempre dejan firmas simples.

---

## Un mismo indicador puede no alcanzar por sí solo

Imaginá esta situación:

- un usuario inicia sesión desde una ubicación nueva

Eso puede ser sospechoso.  
Pero también puede tener una explicación legítima.

Ahora imaginá que, además:

- el acceso fue fuera del horario habitual
- después hubo un cambio de contraseña
- luego se descargaron muchos datos
- finalmente aparecieron nuevas sesiones desde otros dispositivos

Ahí ya no estás mirando una señal aislada, sino una **correlación de indicadores**.

Y esa correlación suele ser mucho más útil que analizar un evento solo.

---

## Indicadores simples y complejos

Podemos pensar los IoC de dos formas generales.

### Indicadores simples
Son evidencias puntuales, concretas y fáciles de observar.

Ejemplos:

- una IP sospechosa
- un hash de archivo malicioso
- un dominio conocido por actividad hostil
- un archivo extraño en una ruta sensible

### Indicadores más complejos
Son patrones que requieren contexto o análisis adicional.

Ejemplos:

- comportamiento inusual de una cuenta
- secuencia rara de accesos
- cambios progresivos de permisos
- tráfico lateral entre sistemas poco habitual

Ambos tipos son útiles.  
Los simples ayudan a detectar rápido; los complejos ayudan a detectar mejor en escenarios menos evidentes.

---

## Cómo se usan en una investigación

Cuando aparece un posible indicador, no alcanza con mirarlo de forma aislada.  
Lo habitual es tratar de responder preguntas como estas:

- ¿cuándo apareció?
- ¿en qué sistema o cuenta?
- ¿qué pasó antes?
- ¿qué pasó después?
- ¿hay otros eventos relacionados?
- ¿esto ya había ocurrido?
- ¿hay una explicación legítima?
- ¿qué impacto podría haber tenido?

Este tipo de análisis transforma una señal suelta en una línea de investigación útil.

---

## Ejemplo simple

Imaginá que un administrador revisa los logs de una aplicación y detecta esto:

- múltiples intentos de acceso fallido
- luego un login exitoso
- inmediatamente después, un cambio de email y contraseña
- más tarde, descargas masivas de información

Cada uno de esos eventos podría verse por separado.  
Pero juntos forman un conjunto claro de **indicadores de compromiso**.

No necesariamente explican por sí solos todo el ataque, pero sí señalan un incidente con suficiente peso como para actuar.

---

## Qué limitaciones tienen los IoC

Aunque son muy útiles, también tienen límites.

### Pueden aparecer tarde
A veces un indicador se detecta después de que el daño ya ocurrió.

### Pueden ser ambiguos
No toda anomalía es maliciosa.

### Pueden ser evitados
Un atacante cuidadoso puede intentar reducir rastros u ocultar actividad.

### Pueden depender del monitoreo disponible
Si no hay buenos logs, alertas o visibilidad, algunos indicadores nunca llegan a verse.

Por eso los IoC son importantes, pero no reemplazan una estrategia completa de seguridad.

---

## Relación con detección y respuesta

Los indicadores de compromiso cumplen un papel fuerte en dos áreas:

### Detección
Ayudan a descubrir actividad sospechosa o incidentes ya iniciados.

### Respuesta
Ayudan a delimitar alcance, reconstruir hechos y decidir medidas de contención.

Por ejemplo, pueden servir para responder:

- qué cuentas parecen afectadas
- qué sistemas fueron tocados
- si hubo persistencia
- si hay señales de movimiento lateral
- si hubo exfiltración o alteración de datos

---

## Error común: creer que un solo IoC cuenta toda la historia

Casi nunca pasa eso.

Lo más habitual es que el incidente se entienda mejor cuando se combinan:

- varios logs
- eventos de autenticación
- actividad de procesos
- cambios en configuración
- tráfico de red
- comportamiento de usuarios y aplicaciones

En seguridad, un indicador suele ser el principio del análisis, no su final.

---

## Error común: buscar solo “huellas conocidas”

Es útil tener listas de dominios, hashes o patrones conocidos, pero eso no alcanza.

Muchos incidentes se detectan por:

- comportamiento anómalo
- relaciones extrañas entre eventos
- desvíos del patrón habitual
- secuencias raras de acciones

Esto significa que observar el contexto también es una forma muy valiosa de detección.

---

## Idea clave del tema

Un indicador de compromiso es una señal observable que puede sugerir que un sistema, una cuenta o un servicio fue afectado por actividad maliciosa.

No siempre prueba todo por sí solo, pero puede:

- iniciar una investigación
- confirmar sospechas
- ayudar a contener un incidente
- revelar que una intrusión ya está en marcha o ya ocurrió

---

## Resumen

En este tema vimos que:

- un IoC es una evidencia observable de posible compromiso
- puede aparecer en cuentas, sistemas, archivos, red, aplicaciones o configuraciones
- no es lo mismo que una vulnerabilidad
- tampoco es siempre una prueba absoluta por sí sola
- gana mucho valor cuando se correlaciona con otras señales
- es muy útil tanto para detección como para respuesta

---

## Ejercicio de reflexión

Pensá en una aplicación con:

- login
- base de datos
- logs de acceso
- panel administrativo
- almacenamiento de archivos

Intentá imaginar al menos:

1. dos indicadores de compromiso en autenticación
2. dos indicadores en aplicación o API
3. dos indicadores en sistema o archivos
4. una combinación de señales que justificaría investigar un incidente

---

## Autoevaluación rápida

### 1. ¿Qué es un indicador de compromiso?

Una evidencia observable que puede sugerir que un sistema o cuenta fue afectado por actividad maliciosa.

### 2. ¿Un IoC siempre confirma por sí solo un ataque?

No. Muchas veces necesita contexto y correlación con otras señales.

### 3. ¿Dónde pueden aparecer IoC?

En logs, cuentas, archivos, procesos, red, aplicaciones, servicios y configuraciones.

### 4. ¿Por qué son valiosos?

Porque ayudan a detectar incidentes, investigar qué pasó y responder más rápido.

---

## Próximo tema

En el siguiente tema vamos a cerrar este bloque introductorio viendo el **impacto técnico, económico y operativo de un ataque**, para entender por qué estos incidentes importan tanto más allá del detalle técnico.
