---
title: "Backups, restauración y recuperación ante desastres"
description: "Cómo diseñar backups útiles de verdad, por qué respaldar no es lo mismo que poder recuperar, qué diferencia hay entre alta disponibilidad y disaster recovery, y cómo preparar restauración, continuidad operativa y resiliencia real ante pérdida de datos, errores humanos, fallas de infraestructura o incidentes graves."
order: 144
module: "Seguridad y operación avanzada"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior hablamos de **gestión de incidentes y respuesta ante compromisos**.

Ahí vimos que cuando algo serio ocurre no alcanza con reaccionar rápido.
Hace falta detectar, clasificar, contener, investigar, comunicar y recuperar con criterio.

Pero hay una clase de incidente que obliga a pensar todavía más en profundidad.

No es solamente una caída transitoria.
No es solo un deploy defectuoso.
No es solo una integración externa que tarda más de lo normal.

Es el tipo de situación en la que aparece una pregunta brutalmente concreta:

**si perdemos datos, si se corrompen, si alguien los borra, si una región cae, si una cuenta se compromete o si la infraestructura queda inutilizable, ¿podemos volver?**

Y acá muchos sistemas descubren una verdad incómoda.

Creían estar protegidos porque “había backups”.
Pero en realidad:

- nadie había probado restaurar
- no estaba claro cuánto dato se perdía
- no se sabía cuánto tardaría la recuperación
- los backups no incluían todo lo necesario
- la restauración dependía de una sola persona
- el entorno restaurado no podía arrancar la aplicación
- las claves para desencriptar no estaban disponibles
- los procedimientos estaban desactualizados
- la copia existía, pero no servía para operar otra vez

Ésa es una de las distinciones más importantes de este tema:

**tener backups no es lo mismo que tener recuperación.**

En esta lección vamos a estudiar:

- qué problema resuelven realmente los backups
- qué diferencia hay entre backup, alta disponibilidad y disaster recovery
- qué tipos de pérdida de datos o interrupciones existen
- cómo pensar RPO y RTO sin humo
- qué conviene respaldar y qué no olvidar
- por qué restaurar es más importante que respaldar
- cómo diseñar pruebas reales de recuperación
- qué errores son muy comunes
- cómo construir continuidad operativa seria en un backend real

## El error más común: creer que backup equivale a seguridad

Muchos equipos se tranquilizan apenas escuchan algo como:

- “la base se replica sola”
- “el proveedor hace snapshots”
- “la nube guarda versiones”
- “hay un backup nocturno”
- “tenemos alta disponibilidad”

Todo eso puede ayudar.
Pero ninguna de esas frases, por sí sola, garantiza recuperación real.

¿Por qué?

Porque los problemas que querés resistir no son todos iguales.

No es lo mismo:

- que falle una instancia
- que se borren registros por error
- que una migración rompa datos
- que un atacante cifre o elimine información
- que una región entera quede inaccesible
- que un bug lógico corrompa datos y replique la corrupción a todos lados
- que se pierdan secretos o claves necesarios para restaurar

La lección importante es ésta:

**resiliencia no se logra con una sola técnica.**

Necesitás distinguir problemas distintos y diseñar defensas distintas.

## Backup, replicación, alta disponibilidad y disaster recovery no son lo mismo

Ésta es una confusión clásica en backend real.

### Backup

Un backup es una copia utilizable para recuperar información o estado en un punto razonablemente conocido.

Sirve para casos como:

- borrado accidental
- corrupción detectada a tiempo
- error humano
- fallo lógico
- incidente de seguridad con destrucción o manipulación de datos
- recuperación histórica

### Replicación

La replicación copia cambios entre nodos o sistemas.

Ayuda para:

- disponibilidad
- tolerancia a fallos de nodo
- lecturas distribuidas
- reducción de downtime técnico

Pero no siempre ayuda contra:

- borrado lógico replicado
- corrupción replicada
- cambios malos propagados
- ransomware o destrucción coordinada

### Alta disponibilidad

Busca que el servicio siga funcionando o se recupere rápido ante ciertos fallos de infraestructura.

Puede incluir:

- múltiples instancias
- balanceadores
- failover automático
- componentes redundantes

Sirve para continuidad frente a fallos técnicos comunes.
Pero no reemplaza backup ni plan de recuperación.

### Disaster recovery

Es la capacidad de recuperar operación y datos frente a incidentes graves.

Incluye más que respaldos:

- procedimientos
- responsabilidades
- infraestructura alternativa
- acceso a secretos
- restauración validada
- decisiones de priorización
- pruebas periódicas
- tiempos objetivos definidos

Dicho simple:

**replicar no es respaldar, alta disponibilidad no es disaster recovery, y respaldar sin poder restaurar no es recuperar.**

## Qué clase de desastres o pérdidas deberías contemplar

No todo escenario necesita el mismo nivel de preparación.
Pero un backend profesional debería pensar al menos en estas familias de problemas.

### 1. Error humano

Ejemplos:

- delete masivo por accidente
- script mal ejecutado
- actualización incorrecta
- borrado de bucket
- rotación de secreto mal hecha
- migración aplicada donde no correspondía

Ésta es una de las causas más comunes y menos glamorosas.

### 2. Corrupción lógica de datos

Ejemplos:

- bug que recalcula mal saldos
- proceso batch que pisa estados válidos
- job que duplica o elimina relaciones
- transformación defectuosa que sobreescribe información

Acá la dificultad extra es que el sistema puede seguir “arriba”, pero con datos malos.

### 3. Falla de infraestructura

Ejemplos:

- caída de disco
- pérdida de nodo
- base inutilizable
- región cloud degradada
- almacenamiento inaccesible

### 4. Compromiso de seguridad

Ejemplos:

- atacante borra información
- ransomware cifra datos
- cuenta privilegiada comprometida modifica recursos
- bucket expuesto o eliminado
- snapshots o backups también afectados

### 5. Pérdida operativa ampliada

Ejemplos:

- error en IaC que destruye recursos críticos
- cambio masivo en networking que deja el sistema aislado
- proveedor clave con interrupción prolongada
- dependencia central caída que impide operar restauraciones

Pensar estos escenarios obliga a madurar.
Porque deja de alcanzarte la idea abstracta de “tener una copia”.

## RPO y RTO: dos preguntas que obligan a bajar a tierra

Cuando un sistema necesita recuperación seria, hay dos conceptos que aparecen enseguida.

### RPO: Recovery Point Objective

Es cuánto dato estás dispuesto a perder como máximo.

Ejemplo:

- si tu RPO es 24 horas, podrías perder hasta un día de datos
- si tu RPO es 15 minutos, necesitás mecanismos mucho más exigentes

La pregunta real es:

**¿hasta qué punto del pasado necesitamos poder volver?**

### RTO: Recovery Time Objective

Es cuánto tiempo puede pasar hasta restablecer un servicio o capacidad crítica.

Ejemplo:

- si tu RTO es 8 horas, tu plan puede ser bastante manual
- si tu RTO es 15 minutos, el nivel de automatización y preparación tiene que ser muchísimo mayor

La pregunta real es:

**¿cuánto tiempo podemos tolerar estar fuera o degradados?**

Lo importante es que RPO y RTO no son deseos poéticos.
Tienen costo.

Cuanto menor querés el RPO:

- más frecuente o continua debe ser la protección de datos
- más compleja puede ser la arquitectura
- más caro suele ser operar

Cuanto menor querés el RTO:

- más automatización necesitás
- más ensayada debe estar la restauración
- más preparada debe estar la infraestructura alternativa
- menos dependencia puede haber de pasos manuales heroicos

Un gran error es definir objetivos irreales solo para “quedar bien”.

## Qué deberías respaldar realmente

Cuando se habla de backups, muchos piensan solo en la base de datos principal.

Eso suele ser insuficiente.

Según el sistema, podrías necesitar respaldar o versionar correctamente:

- base de datos transaccional
- archivos subidos por usuarios
- objetos en buckets
- configuraciones críticas
- infraestructura declarativa o estados asociados
- claves de cifrado o material de recuperación protegido
- colas persistentes o eventos importantes
- índices reconstruibles o no reconstruibles
- metadatos de autenticación o sesiones, si el producto lo requiere
- artefactos operativos necesarios para volver a levantar el servicio

### No todo merece el mismo tratamiento

Conviene distinguir entre:

#### Datos fuente irremplazables

Ejemplos:

- órdenes
- pagos reconciliados
- perfiles de usuario
- documentos cargados
- configuraciones de tenant
- evidencia de auditoría

Estos merecen máxima atención.

#### Datos derivados reconstruibles

Ejemplos:

- cachés
- read models recreables
- índices de búsqueda regenerables
- materializaciones temporales

Éstos no siempre necesitan backup igual de costoso, pero sí un plan claro de reconstrucción.

La pregunta útil es:

**si esto desaparece, lo recupero desde una fuente de verdad o lo perdí de verdad?**

## Tipos de backup y cómo pensar su utilidad

No hace falta ponerse dogmático con una sola técnica.
Lo importante es entender trade-offs.

### Backups completos

Copian el conjunto total relevante.

Ventajas:

- simples de entender
- más directos de restaurar

Desventajas:

- pueden ser costosos
- tardan más
- ocupan más almacenamiento

### Incrementales o diferenciales

Guardan cambios respecto de otro punto.

Ventajas:

- más eficientes en espacio y tiempo

Desventajas:

- restauración potencialmente más compleja
- dependencia entre múltiples piezas

### Snapshots

Útiles para capturar estado de volúmenes o bases administradas.

Ayudan mucho, pero conviene recordar:

- no siempre son suficientes para recuperación lógica fina
- no reemplazan necesariamente otras capas de protección
- deben tener políticas de retención y validación

### Versionado en almacenamiento de objetos

Muy útil para protegerse de:

- borrados accidentales
- sobrescrituras indebidas

Pero también requiere:

- controles de acceso serios
- políticas de retención
- protección contra borrado malicioso

### Point-in-time recovery

Cuando existe, permite volver a un punto cercano en el tiempo.
Es poderosísimo para ciertos escenarios, especialmente error humano o corrupción detectada temprano.

Pero no elimina la necesidad de:

- saber a qué punto volver
- validar consistencia
- entender impacto de los eventos posteriores

## La regla de oro: restaurar importa más que respaldar

Un backup no vale por el hecho de existir.
Vale si puede restaurarse de manera útil.

Eso implica validar cosas como:

- que el backup realmente se genera
- que no está corrupto
- que puede leerse
- que incluye lo necesario
- que la restauración funciona
- que el tiempo de restauración es compatible con el RTO
- que el punto recuperable cumple el RPO
- que el sistema resultante puede operar

Muchos equipos descubren problemas recién el día del desastre:

- faltaban tablas o adjuntos
- la restauración necesitaba versiones exactas de software
- las claves estaban inaccesibles
- el procedimiento dependía de personas que no estaban
- la base restauraba, pero la app no levantaba
- las relaciones entre sistemas no quedaban coherentes

Por eso la pregunta no es:

**“¿tenemos backups?”**

La pregunta correcta es:

**“¿podemos restaurar de forma verificable y dentro de tiempos aceptables?”**

## Probar restauraciones debería ser una práctica periódica

No alcanza con monitorear que el job de backup terminó en verde.
Eso verifica generación, no recuperación.

Las pruebas más útiles suelen incluir:

- restaurar una base en un entorno aislado
- verificar integridad mínima de datos
- arrancar la aplicación contra la restauración
- comprobar accesos, migraciones y compatibilidad
- validar que archivos relacionados también estén presentes
- medir cuánto tardó realmente
- detectar pasos manuales ocultos

### Distintos niveles de prueba

#### Prueba técnica básica

Se restaura una copia y se valida que sea legible.

#### Prueba operativa

Se restaura y se levanta el sistema asociado.

#### Simulación parcial de desastre

Se ejecuta un escenario concreto:

- pérdida de tabla
- borrado de bucket
- caída de base principal
- restauración a punto anterior

#### Ejercicio más completo de disaster recovery

Se prueba recuperación de una capacidad crítica con roles, tiempos y comunicación.

No hace falta hacer siempre ejercicios gigantes.
Pero sí hace falta practicar algo.

## Backups también tienen requisitos de seguridad

Un backup puede salvarte.
Pero también puede exponerte muchísimo.

Porque muchas veces contiene:

- datos personales
- secretos operativos
- información financiera
- auditoría histórica
- documentos sensibles

Por eso conviene pensar en:

- cifrado en reposo y en tránsito
- control estricto de accesos
- separación de privilegios
- registro de accesos y restauraciones
- retención definida
- copias inmutables cuando el contexto lo justifica
- protección frente a borrado o modificación maliciosa
- aislamiento respecto del entorno primario comprometido

Un error peligroso es dejar backups accesibles con las mismas credenciales amplias del sistema operativo normal.
Si un atacante compromete el entorno principal y puede borrar también las copias, la situación empeora muchísimo.

## La recuperación no es solo de datos: también es de capacidad operativa

Aun si podés restaurar información, puede faltarte la capacidad real de volver a operar.

Por ejemplo:

- no tenés infraestructura lista donde levantar el servicio
- no recordás la secuencia correcta de arranque
- faltan secretos o certificados
- no están los DNS o endpoints necesarios
- el sistema restaurado no puede hablar con servicios dependientes
- los jobs empiezan a correr en un orden peligroso
- se reenvían eventos duplicados y generás más daño

Esto muestra algo importante:

**disaster recovery no es solo “recuperar bits”; es recuperar una operación utilizable.**

Por eso sirven tanto:

- runbooks actualizados
- infraestructura reproducible
- configuración versionada
- automatización de bootstrap
- validaciones post-restauración
- criterios de prioridad por capacidades críticas

## Qué capacidades recuperar primero

En una crisis seria, no siempre restaurás todo al mismo tiempo.

Necesitás priorizar.

Preguntas útiles:

- ¿qué flujo de negocio no puede esperar?
- ¿qué capacidad afecta ingresos inmediatamente?
- ¿qué función evita más daño adicional?
- ¿qué sistema necesita soporte o atención primero?
- ¿qué puede quedar degradado temporalmente sin destruir la operación?

Ejemplo de orden posible en un producto transaccional:

1. autenticación mínima y acceso administrativo controlado
2. base transaccional principal
3. creación y consulta de órdenes
4. pagos o conciliación prioritaria
5. notificaciones secundarias
6. analítica y reportes derivados
7. funciones no críticas o convenientes

No existe un orden universal.
Lo importante es que esté pensado antes.

## Errores muy comunes en backups y recuperación

### 1. Confiar en defaults del proveedor sin entender límites

Los managed services ayudan mucho.
Pero hay que entender:

- retención real
- granularidad de recuperación
- cobertura regional
- costos de restaurar
- permisos necesarios
- qué queda afuera del servicio administrado

### 2. Respaldar solo la base y olvidar archivos o estado asociado

Esto produce restauraciones incompletas.

### 3. No probar nunca

Es probablemente el error más clásico.

### 4. No definir RPO ni RTO

Entonces nadie sabe si la estrategia actual sirve o no.

### 5. No proteger backups del mismo plano de compromiso

Si el atacante puede borrar producción y copias desde el mismo acceso, el riesgo es enorme.

### 6. No documentar procedimientos

Y depender de memoria oral o de una sola persona.

### 7. No pensar en corrupción lógica silenciosa

Si detectás tarde el problema, quizás ya propagaste datos malos a varias copias.

### 8. No validar post-restauración

Restaurar no garantiza consistencia ni operabilidad.

### 9. No priorizar servicios críticos

Querer recuperar todo al mismo tiempo puede hacer más lenta la vuelta de lo realmente importante.

### 10. Tratar disaster recovery como un check de compliance

Y no como una capacidad operativa real.

## Relación con los temas anteriores

Este tema conecta muy fuerte con **gestión de incidentes y respuesta ante compromisos**, porque una parte importante de responder bien consiste en saber si podés restaurar y bajo qué condiciones.

Conecta con **auditoría de seguridad y trazabilidad de acciones sensibles**, porque en escenarios de borrado, corrupción o compromiso necesitás reconstruir qué pasó y sobre qué recursos.

Conecta con **secretos, rotación, credenciales efímeras y gestión operativa segura**, porque muchas restauraciones dependen de claves, certificados y accesos que también deben estar protegidos y disponibles.

Conecta con **seguridad en integraciones externas y supply chain**, porque algunas recuperaciones fallan no por la base principal, sino por dependencias externas necesarias para volver a operar.

Conecta con **logging seguro y manejo de datos sensibles**, porque backups y restauraciones también exigen pensar protección, minimización y acceso controlado sobre información muy delicada.

Y conecta con toda la dimensión de operación madura del backend: respaldar no es un ritual administrativo, sino parte de la continuidad real del producto.

## Qué deberías llevarte de esta lección

Si tuvieras que quedarte con una sola idea, que sea ésta:

**un backup vale por su capacidad de restauración útil, no por su mera existencia.**

Eso implica aprender a pensar en:

- escenarios de pérdida y corrupción distintos
- diferencia entre backup, replicación, HA y disaster recovery
- RPO y RTO reales
- protección de datos fuente irremplazables
- restauraciones probadas
- seguridad de las copias
- recuperación de operación, no solo de almacenamiento
- priorización de capacidades críticas

Un backend profesional no se limita a esperar que nada grave ocurra.
También se prepara para volver cuando igual algo importante se pierde, se rompe o se compromete.

## Cierre

La madurez operativa se nota mucho en estos temas.

Cuando un equipo no piensa recuperación en serio, vive de una ilusión:

“seguro no va a pasar”

o bien:

“si pasa, algo haremos”.

Pero los sistemas reales terminan enfrentando:

- errores humanos
- fallos técnicos
- corrupción lógica
- incidentes de seguridad
- problemas de proveedores
- decisiones apuradas que salen mal

Y en ese contexto, la diferencia entre sufrir una interrupción dura y sufrir una catástrofe prolongada suele estar en la preparación.

Backups útiles.
Restauraciones ensayadas.
Objetivos realistas.
Procedimientos claros.
Accesos seguros.
Prioridades definidas.

Ésa es la diferencia entre “tener una copia” y **tener continuidad operativa real**.

Y cuando esa base empieza a estar madura, el paso siguiente también es natural:

**cómo observar de forma más completa la salud operativa del sistema, cómo pasar de reaccionar a entender tendencias, capacidad, degradaciones y comportamiento sistémico, y cómo construir una visión más profesional de la operación cotidiana.**

Ahí entramos en el próximo tema: **observabilidad operativa avanzada**.
