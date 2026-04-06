---
title: "Variables de entorno y límites"
description: "Cómo pensar el uso de variables de entorno en una aplicación Java con Spring Boot. Por qué suelen ser una mejora frente a hardcodear secretos en archivos o código, qué problemas siguen existiendo y cuáles son sus límites reales en términos de exposición, distribución, rotación y observabilidad."
order: 95
module: "Secretos, configuración y entorno"
level: "base"
draft: false
---

# Variables de entorno y límites

## Objetivo del tema

Entender cómo pensar el uso de **variables de entorno** en una aplicación Java + Spring Boot, sin caer ni en el rechazo exagerado ni en la falsa sensación de seguridad.

En muchos equipos, las variables de entorno aparecen como la respuesta automática a todo problema de secretos:

- “sacalo del código y ponelo en una env var”
- “si está en env, ya está bien”
- “mejor que esté en variables y listo”
- “eso ya resuelve el tema”

Esa reacción tiene algo de verdad.
Pero también puede simplificar demasiado el problema.

Porque usar variables de entorno suele ser una mejora importante frente a:

- hardcodear credenciales
- dejarlas en `application.properties`
- commitearlas en el repo
- empaquetarlas en el artefacto

Pero no resuelve por sí solo:

- quién puede leerlas
- cómo se inyectan
- cómo se rotan
- cómo se filtran por logs o debugging
- cuánto tiempo viven
- en qué entornos circulan
- qué pasa con procesos, hosts, contenedores y pipelines

En resumen:

> una variable de entorno es un canal de entrega.  
> No es, por sí sola, una política completa de manejo de secretos.

---

## Idea clave

Las variables de entorno sirven para separar valores del código y de la configuración versionada.

Eso ya es muy valioso.

Pero sigue siendo importante recordar que una env var:

- contiene un valor real
- accesible desde algún entorno de ejecución
- leído por algún proceso
- potencialmente visible en debugging, tooling o despliegues
- con un lifecycle que alguien debe gobernar

La idea central es esta:

> pasar un secreto a una variable de entorno mejora mucho dónde vive,  
> pero no resuelve automáticamente quién lo conoce, cómo se rota ni cómo se evita que se derrame por otros caminos.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- creer que “usar env vars” agota la discusión de secretos
- mover una credencial del repo al entorno y pensar que ya quedó bien gobernada
- exponer variables en logs, dumps o paneles de despliegue
- compartir archivos `.env` como si fueran material inocuo
- usar el mismo valor en demasiados entornos o servicios
- no tener estrategia de rotación porque “al menos ya no está en el código”
- olvidar que desarrolladores, procesos y herramientas pueden leer el entorno
- convertir el entorno en otro lugar de acumulación desordenada de secretos
- no distinguir entre variables de entorno útiles y secretos que requerirían un manejo más fino todavía

Es decir:

> el problema no es usar variables de entorno.  
> El problema es usarlas como respuesta automática y dejar de pensar el resto del lifecycle del secreto.

---

## Error mental clásico

Un error muy común es este:

### “Si está en una env var, entonces está seguro”

Eso es demasiado optimista.

Porque la variable de entorno sigue pudiendo aparecer en:

- logs de arranque
- errores
- herramientas de debugging
- paneles de orquestación
- scripts locales
- shells compartidas
- dumps de procesos
- herramientas de observabilidad
- CI/CD
- documentación improvisada
- archivos `.env` mal distribuidos

### Idea importante

La env var suele ser mejor que el repo.
Pero mejor no significa automáticamente seguro.

---

## Qué resuelven bien las variables de entorno

Conviene reconocer su valor real.

### Suelen ayudar mucho a:

- sacar credenciales del código fuente
- evitar que ciertos secretos queden en `application.properties`
- desacoplar configuración entre entornos
- hacer más fácil variar valores sin recompilar
- reducir exposición en el historial de Git
- permitir despliegues más limpios entre local, staging y prod

### Idea útil

Como mejora de diseño, suelen ser bastante sanas.
Especialmente cuando el problema era tener secretos pegados al proyecto.

---

## Qué no resuelven por sí solas

También conviene ser muy explícitos con sus límites.

Una variable de entorno no resuelve automáticamente:

- control fino de acceso al secreto
- rotación ordenada
- revocación
- auditoría de uso
- distribución segura entre muchos actores
- lifecycle del valor
- exposición en herramientas de infraestructura
- segmentación por servicio o proceso
- borrado de copias viejas
- reducción de derrame lateral

### Regla sana

Pensá las env vars como un mejor punto de entrega, no como una solución total.

---

## Variables de entorno no cambian la naturaleza del valor

Esto conecta con el tema anterior.

Una API key en una env var sigue siendo una API key.
Un JWT signing secret en una env var sigue siendo un secreto de firma crítico.
Una password de base en una env var sigue otorgando acceso real.

### Idea importante

Mover el valor de un archivo a una env var no reduce mágicamente:

- su poder operativo
- su impacto si se filtra
- la necesidad de rotación
- la necesidad de restringir acceso

Solo cambia el canal por el que llega a la app.

---

## Un canal mejor no elimina la necesidad de lifecycle

Este es uno de los mensajes más importantes del tema.

Un secreto sano necesita pensar:

- creación
- distribución
- uso
- lectura
- rotación
- reemplazo
- revocación
- retiro

Si lo único que cambiaste fue “ahora va por env var”, todavía faltan varias piezas.

### Idea útil

No confundas distribución con gobierno.
Una env var distribuye o expone el valor al proceso.
No lo gobierna de punta a punta.

---

## Los archivos `.env` no son mágicos

En muchos entornos locales, aparecen archivos tipo:

- `.env`
- `.env.local`
- `.env.dev`
- `.env.production`
- `.env.backup`

Eso puede ser práctico.
Pero no conviene tratarlos como si fueran automáticamente inocuos.

### Porque esos archivos pueden terminar en:

- repositorios por accidente
- copias locales
- chats internos
- scripts de onboarding
- capturas
- respaldos
- carpetas compartidas
- máquinas no endurecidas

### Regla sana

Un archivo `.env` con secretos reales sigue siendo material sensible.
Cambiar la extensión no cambia el riesgo.

---

## Local, staging y producción no tienen el mismo nivel de exigencia, pero ninguno merece descuido total

Es cierto que no todos los entornos pesan igual.
Pero eso no justifica cualquier cosa.

### Errores típicos

- usar credenciales reales de staging o incluso producción en máquinas locales
- compartir `.env` por canales informales
- dejar secretos válidos mucho tiempo en laptops
- reutilizar el mismo secreto en varios entornos
- tratar staging como si fuera “casi desarrollo” cuando ya mueve datos sensibles

### Idea importante

Las variables de entorno locales también forman parte del modelo de riesgo.
No solo las de producción.

---

## Variables de entorno y observabilidad

Otro punto muy importante: el valor no vive solo en la variable.
También puede derramarse durante el runtime.

### Ejemplos

- logs de arranque que imprimen configuración
- errores o dumps
- endpoints de diagnóstico
- herramientas APM
- paneles de infraestructura
- descripciones de procesos
- documentación o scripts que hacen echo de variables

### Regla sana

Si usás env vars, también necesitás revisar que el ecosistema no las exponga por comodidad.

---

## El proceso que corre la app puede leerlas… y quizá otros también

Esto parece obvio, pero a veces se subestima.

Una env var está disponible para el proceso que ejecuta la aplicación.
Y según el entorno, también puede quedar accesible o visible para:

- operadores
- procesos auxiliares
- shells de troubleshooting
- herramientas del host
- orquestadores
- contenedores vecinos mal aislados
- volcados de memoria o debugging

### Idea importante

Cuanto más amplio sea el acceso al entorno de ejecución, más tenue se vuelve la ventaja de “lo saqué del código”.

---

## Variables de entorno compartidas por demasiados servicios

Otra mala práctica frecuente es usar el mismo valor en:

- varios microservicios
- distintos jobs
- herramientas manuales
- procesos batch
- staging y producción
- distintos clientes o tenants

### Problema

Eso hace más difícil:

- rotar
- revocar
- acotar impacto
- investigar incidentes
- saber qué se comprometió realmente

### Regla útil

Un secreto compartido entre demasiados procesos es un secreto más frágil, aunque viva en variables de entorno.

---

## Rotación: donde suele aparecer el límite operativo

Muchos equipos mejoran la distribución de secretos usando env vars, pero siguen teniendo problemas para rotarlos.

### Porque la pregunta ya no es solo “dónde está”
sino:

- ¿quién lo cambia?
- ¿cuántos despliegues dependen de él?
- ¿se puede convivir con dos versiones un tiempo?
- ¿qué pasa con los procesos vivos?
- ¿hay rollback?
- ¿qué se rompe si cambia hoy?

### Idea importante

La env var puede facilitar separar el valor del código.
Pero la rotación sigue siendo un problema operativo real que hay que diseñar.

---

## Variables de entorno y perfiles de Spring

En Spring Boot es muy común usar perfiles y placeholders como:

```properties
spring.datasource.password=${DB_PASSWORD}
```

Eso suele ser sano.
Pero no debería llevar a una falsa conclusión tipo:

- “como usamos placeholders, ya manejamos secretos bien”

### Porque todavía hay que pensar

- quién define `DB_PASSWORD`
- dónde se almacena ese valor en cada entorno
- quién puede leerlo
- cómo se rota
- si se reutiliza entre ambientes
- cómo se evita su exposición indirecta

### Regla sana

Spring ayuda a consumir secretos desde el entorno.
No reemplaza la estrategia sobre el entorno.

---

## Cuándo las env vars suelen ser una buena mejora

Sin exagerar sus virtudes, sí suele ser una buena señal usarlas cuando el problema actual es alguno de estos:

- credenciales hardcodeadas
- secrets en repo
- config versionada con valores reales
- build que incrusta secretos
- diferencias de entorno acopladas al código

### Idea útil

Como paso de hardening básico, mover secretos reales fuera del proyecto y hacia un canal de entorno controlado suele ser una mejora neta.

---

## Cuándo pueden quedarse cortas

También conviene reconocer que, en ciertos contextos, las variables de entorno pueden quedarse cortas como mecanismo principal.

Por ejemplo cuando necesitás:

- acceso más fino
- auditoría de lectura
- rotación más frecuente
- entrega dinámica
- menos exposición en tooling de infraestructura
- mejor gobierno centralizado
- distinción más fuerte entre servicios o actores

### Idea importante

No porque algo funcione con env vars significa que sea el mejor modelo a medida que la criticidad o complejidad crecen.

---

## Variables de entorno y secretos de firma o cifrado

Este caso merece atención especial.

Poner en una env var cosas como:

- `JWT_SECRET`
- `SIGNING_KEY`
- `ENCRYPTION_KEY`
- material criptográfico similar

puede ser mejor que hardcodearlo.
Pero sigue siendo muy sensible porque esos valores pueden:

- emitir o validar tokens
- descifrar datos
- comprometer la confianza de varios flujos
- afectar más de un servicio

### Regla útil

No todos los secretos en env vars tienen el mismo peso.
Algunos merecen todavía más cuidado por su impacto sistémico.

---

## Los secretos también viajan por scripts y tooling

Muchas veces la env var no se filtra por la app, sino por el ecosistema:

- scripts de despliegue
- docker compose
- manifests
- wrappers de arranque
- tareas manuales
- shells
- documentación interna
- comandos pegados por chat

### Idea importante

La seguridad de una env var no depende solo de la app que la lee.
Depende también del camino que recorre para llegar ahí.

---

## Qué no deberías asumir solo porque usás env vars

Usarlas no significa automáticamente que ya resolviste:

- separación de secretos y config
- exposición en CI/CD
- higiene de máquinas locales
- rotación
- revocación
- trazabilidad
- principio de menor privilegio
- reducción de compartición innecesaria
- gestión de incidentes si el valor se filtra

### Regla sana

Las env vars mejoran mucho un problema concreto.
No resuelven todos los demás por arrastre.

---

## Qué conviene revisar en una app Spring

Cuando revises uso de variables de entorno en una aplicación Spring, mirá especialmente:

- qué secretos llegan por env vars
- de dónde se inyectan realmente
- quién puede leerlos en cada entorno
- si aparecen en logs de arranque o debugging
- si existen archivos `.env` con valores reales
- si el mismo valor se reutiliza entre servicios o entornos
- qué tan difícil sería rotarlo
- si hay secretos más críticos que quizá merecen un mecanismo más fuerte
- qué scripts o pipelines tocan esas variables
- si la app asume que “estar en env” ya las vuelve seguras

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- secretos fuera del repo y del artefacto
- placeholders en config sin valores reales embebidos
- menos dependencia de archivos locales compartidos
- mejor separación entre configuración común y credenciales
- más claridad sobre de dónde llega cada valor
- menor derrame a logs y tooling
- base más razonable para rotación futura
- menos tentación de dejar secrets hardcodeados “solo por esta vez”

---

## Señales de ruido

Estas señales merecen revisión rápida:

- “ya usamos env vars” como cierre de toda discusión
- `.env` con secretos reales circulando informalmente
- variables críticas visibles en tooling, scripts o logs
- el mismo secreto en varios entornos y servicios
- nadie sabe bien cómo rotarlo
- credenciales de producción accesibles desde contextos locales o de staging
- valores críticos expuestos en documentación de onboarding
- el equipo confunde “no está en Git” con “está gobernado”

---

## Checklist práctico

Cuando revises el uso de variables de entorno, preguntate:

- ¿qué secretos reales estamos entregando por env vars?
- ¿de dónde provienen en cada entorno?
- ¿quién puede leerlas o volcarlas?
- ¿aparecen en logs, dumps o tooling?
- ¿hay archivos `.env` reales circulando?
- ¿qué secretos comparten demasiado alcance entre servicios?
- ¿qué tan difícil sería rotarlos hoy?
- ¿qué parte del lifecycle sigue sin resolverse aunque estén fuera del repo?
- ¿qué valor crítico estamos subestimando solo porque “ya no está hardcodeado”?
- ¿qué mejorarías primero para que el entorno sea menos un canal informal y más una capa gobernada?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Qué secretos vienen hoy por variables de entorno?
2. ¿Qué mejora trajeron respecto del estado anterior?
3. ¿Qué problemas siguen existiendo igual?
4. ¿Qué secretos se comparten entre demasiados procesos o entornos?
5. ¿Cuál sería más difícil de rotar hoy?
6. ¿Qué derrame lateral existe fuera de la app: `.env`, scripts, CI, docs, shells?
7. ¿Qué cambio harías primero para que el uso de env vars sea una mejora real y no solo cosmética?

---

## Resumen

Las variables de entorno suelen ser una mejora importante frente a hardcodear secretos en código o config versionada.
Pero no deberían tratarse como una solución mágica.

Ayudan especialmente a:

- sacar secretos del repo
- separar valores del código
- variar credenciales por entorno
- reducir exposición en artefactos

Pero no resuelven por sí solas:

- acceso
- observabilidad
- rotación
- revocación
- derrame lateral
- compartición excesiva
- gobierno del lifecycle

En resumen:

> un backend más maduro no desprecia las variables de entorno, pero tampoco les atribuye poderes mágicos.  
> Las usa como un mejor canal de entrega, sabiendo que el verdadero problema sigue siendo quién conoce el secreto, cómo circula, cuánto dura y qué pasa cuando toca cambiarlo o cuando se filtra.

---

## Próximo tema

**Secret managers**
