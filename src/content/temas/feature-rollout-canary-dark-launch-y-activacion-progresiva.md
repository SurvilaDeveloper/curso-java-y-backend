---
title: "Feature rollout, canary, dark launch y activación progresiva"
description: "Cómo introducir cambios en producción sin exponerlos de golpe a todos los usuarios, qué diferencia hay entre rollout, canary y dark launch, y por qué la evolución segura de un backend depende tanto de cómo activás una nueva capacidad como de cómo la desarrollás."
order: 126
module: "Calidad, evolución y mantenibilidad a largo plazo"
level: "intermedio"
draft: false
---

## Introducción

Una idea bastante peligrosa en backend es esta:

**si el código ya pasó tests, entonces ya está listo para salir para todos.**

En sistemas reales, eso muchas veces no alcanza.

Porque entre “el cambio funciona en un ambiente controlado” y “el cambio está listo para impactar a toda la base de usuarios” hay una distancia importante.

Y cuanto más importante es el sistema, más caro puede salir asumir que ese salto se puede hacer de una sola vez.

Ahí aparece un conjunto de prácticas muy valiosas:

- feature rollout
- activación progresiva
- dark launch
- canary release
- flags de activación
- exposición parcial por usuario, tenant o segmento

Todas estas ideas apuntan a algo parecido:

**cambiar sin apostar todo en un único momento irreversible.**

No se trata solo de desplegar.
Se trata de **controlar la exposición del cambio**.

## El problema de hacer releases “todo o nada”

Cuando un cambio se publica de golpe para todos los usuarios, el sistema queda expuesto a una dinámica riesgosa:

- si sale bien, perfecto
- si sale mal, falla para todos al mismo tiempo

Y eso agrava muchas cosas:

- el impacto es mayor
- la reversión suele tener más urgencia
- el diagnóstico es más difícil bajo presión
- la base afectada crece demasiado rápido
- la ventana para aprender antes del daño real desaparece

En otras palabras:

**publicar de golpe reduce el margen de maniobra.**

En sistemas chicos puede tolerarse más.
En sistemas con tráfico real, integraciones, dinero o clientes importantes, esa forma de cambiar se vuelve cada vez menos razonable.

## Desplegar no es lo mismo que activar

Ésta es una distinción central.

Muchas veces se mezclan dos cosas distintas:

- poner una nueva versión del software en producción
- activar un nuevo comportamiento para los usuarios

Pero no son lo mismo.

Podés:

- desplegar código sin activarlo todavía
- activar solo para un subconjunto
- activar gradualmente
- activar según tenant, país, rol o plan
- desactivar rápido sin rehacer todo el deploy

Esa separación entre **deploy** y **release** cambia muchísimo la capacidad de operar con seguridad.

## Qué es un feature rollout

Un feature rollout es una estrategia para exponer una nueva funcionalidad o comportamiento de manera controlada.

En lugar de pasar de 0 a 100 instantáneamente, el cambio puede avanzar por etapas.

Por ejemplo:

- primero solo para uso interno
- después para testers o staff
- luego para 1% de usuarios
- después para 10%
- más tarde para algunos tenants específicos
- finalmente para toda la plataforma

La idea no es solo “ir más lento”.
La idea es **ganar información y capacidad de reacción en cada etapa**.

## Qué significa activación progresiva

Activación progresiva es el patrón general de introducir un cambio de forma incremental.

Eso puede hacerse de varias maneras:

- por porcentaje de tráfico
- por usuario
- por tenant
- por región
- por plan
- por entorno
- por cohorte seleccionada
- por operadores internos antes que por clientes

La lógica es simple:

**cuanto más gradual es la exposición, más chances tenés de detectar problemas antes de que escalen.**

## Qué es un dark launch

Un dark launch consiste en desplegar una capacidad nueva en producción, pero sin mostrarla todavía a los usuarios finales o sin convertirla todavía en el camino principal del sistema.

Según el caso, eso puede significar cosas distintas:

- el código está desplegado pero la UI o el flujo siguen ocultos
- el backend procesa en paralelo pero su resultado no se usa como respuesta oficial
- una nueva ruta lógica corre “en sombra” para comparar comportamiento
- un nuevo motor calcula resultados pero todavía no decide la operación real

La idea es observar comportamiento real sin comprometer aún la experiencia principal.

Eso sirve mucho cuando querés validar:

- performance real
- comportamiento con tráfico verdadero
- consistencia de resultados
- compatibilidad con datos reales
- consumo de recursos
- integraciones en contexto real

Un dark launch te deja aprender antes de exponer.

## Qué es un canary release

Un canary release es una forma de rollout donde una nueva versión o comportamiento se expone primero a una porción pequeña del tráfico o de los usuarios.

La metáfora del “canario” viene de la idea de detectar problemas temprano en una zona acotada antes de comprometer todo el sistema.

Por ejemplo:

- 1% de requests va a la nueva versión
- solo algunos tenants usan el nuevo flujo
- una región pequeña consume primero la nueva lógica
- un subconjunto de pods corre una versión distinta y recibe tráfico controlado

Si algo sale mal, el daño queda contenido.
Si la observación es buena, el porcentaje puede aumentar.

## Dark launch, canary y feature flag no son lo mismo

A veces estos conceptos se usan como si fueran sinónimos.
No lo son.

### Feature flag

Es un mecanismo de control.
Permite activar o desactivar comportamiento sin redeploy completo.

### Rollout progresivo

Es la estrategia de exposición gradual del cambio.

### Canary

Es una forma concreta de rollout parcial, usualmente sobre una porción pequeña de tráfico o usuarios.

### Dark launch

Es una forma de desplegar y observar sin exponer todavía el resultado como funcionalidad visible o camino oficial.

En la práctica, muchas veces se combinan.
Por ejemplo:

- deployás una nueva versión
- la dejás detrás de un flag
- hacés dark launch para medir
- después activás canary al 1%
- luego escalás el rollout según métricas

## Por qué estas prácticas importan tanto

Porque bajar el riesgo del cambio no depende solo de programar mejor.

También depende de:

- cómo introducís el cambio
- cuánta gente queda expuesta al principio
- qué métricas mirás
- qué capacidad de rollback o desactivación tenés
- cuánto podés aprender antes del impacto masivo

Un backend sano no es solo el que puede desplegar seguido.
También es el que puede **liberar cambios sin convertir cada release en un acto de fe**.

## Casos donde esto tiene muchísimo valor

Estas estrategias son especialmente útiles cuando el cambio afecta:

- pagos
- pricing
- permisos
- cálculo de impuestos o comisiones
- checkout
- búsqueda o ranking
- integraciones externas
- autenticación
- migraciones de backend sensibles
- performance crítica
- comportamiento de colas o workers
- experiencia de clientes enterprise

En todos esos casos, “probar en staging y prender para todos” puede ser demasiado frágil.

## Qué ganás con una activación gradual

Entre otras cosas, ganás:

- detección temprana de bugs reales
- menor blast radius
- rollback más simple
- validación con tráfico real
- aprendizaje antes de exposición total
- mejor coordinación entre producto, ingeniería y operación
- posibilidad de comparar resultados entre viejo y nuevo comportamiento
- más confianza para hacer cambios frecuentes

La activación progresiva no elimina el riesgo.
Pero lo vuelve mucho más manejable.

## El concepto de blast radius

Una idea muy útil acá es pensar en el **radio de impacto**.

Cuando activás un cambio, no deberías pensar solo:

- “¿funciona o no funciona?”

También conviene pensar:

- “si sale mal, ¿a cuántos usuarios alcanza?”
- “¿a cuántos tenants compromete?”
- “¿qué operaciones toca?”
- “¿cuánto tiempo podría pasar hasta detectarlo?”
- “¿cuánto cuesta volver atrás?”

Una buena estrategia de rollout reduce el blast radius inicial.

## Activar por porcentaje no siempre es suficiente

A veces se habla de rollout progresivo y se piensa enseguida en porcentajes.

Eso sirve, pero no siempre es la mejor dimensión.

Muchas veces conviene activar por:

- clientes internos primero
- tenants de bajo riesgo
- región pequeña
- cuentas de prueba
- usuarios staff
- cohortes bien observables
- clientes que aceptaron participar del piloto

¿Por qué?

Porque 1% del tráfico puede seguir siendo demasiado riesgoso si justo incluye operaciones críticas, mientras que una cohorte elegida con intención puede darte mejor observabilidad y menor impacto.

## Rollout técnico vs rollout funcional

También conviene separar dos tipos de rollout.

### Rollout técnico

Cambia infraestructura o implementación, aunque el comportamiento funcional para el usuario supuestamente sea el mismo.

Ejemplos:

- migrar a un nuevo proveedor
- cambiar estrategia de cache
- mover una cola a otra tecnología
- cambiar una consulta o modelo interno
- reemplazar un servicio por otro

### Rollout funcional

Cambia el comportamiento visible del producto.

Ejemplos:

- nuevo checkout
- nueva regla de promociones
- nuevo motor de búsqueda
- nueva política de permisos
- nueva pantalla o flujo de activación

Ambos necesitan cuidado, pero a veces requieren señales distintas para decidir si avanzar o frenar.

## Dark launch como validación en sombra

Una modalidad muy poderosa es correr el comportamiento nuevo en paralelo sin que impacte todavía la respuesta principal.

Por ejemplo:

- el motor nuevo calcula resultados y se comparan con el viejo
- una nueva integración recibe tráfico espejo pero no define el estado final
- un sistema nuevo procesa eventos en paralelo para medir divergencias
- un nuevo algoritmo puntúa, pero su output todavía no se sirve al usuario

Esto permite detectar:

- diferencias semánticas
- problemas de datos
- costos inesperados
- latencias nuevas
- incompatibilidades sutiles

El dark launch es especialmente valioso cuando la pregunta no es solo “se cae o no se cae”, sino también:

**¿produce resultados equivalentes o aceptables frente al sistema actual?**

## Métricas que deberían acompañar un rollout

No alcanza con activar por etapas.
También necesitás saber qué mirar.

Algunas señales importantes pueden ser:

- tasa de error
- latencia
- timeouts
- consumo de CPU o memoria
- retries anormales
- divergencia entre resultado viejo y nuevo
- tasa de conversión
- abandono de flujo
- pagos rechazados
- tickets o reclamos
- eventos de negocio clave
- métricas por tenant o cohorte

Lo importante es que el rollout tenga **criterios observables**, no solo intuición.

## Rollout sin observabilidad es casi actuar a ciegas

Si no sabés qué señales van a indicar deterioro, el rollout gradual pierde gran parte de su valor.

Porque sí, expusiste el cambio solo al 5%.
Pero si no detectás:

- que subió la latencia
- que cayeron conversiones
- que aumentaron errores en una ruta concreta
- que una cohorte específica quedó peor

entonces la gradualidad sirve poco.

La exposición parcial debe ir acompañada por capacidad real de observar y decidir.

## El valor del apagado rápido

Una gran ventaja de trabajar con flags o activaciones controladas es que muchas veces podés apagar el comportamiento nuevo sin tener que hacer rollback completo del deploy.

Eso reduce muchísimo el tiempo de reacción.

Especialmente útil cuando:

- el deploy trae varias cosas y solo una falla
- el rollback completo es costoso
- hay migraciones en curso
- revertir binarios no alcanza para deshacer exposición funcional

A veces la mejor respuesta operativa no es “volver a la versión anterior”, sino simplemente:

**desactivar la feature problemática ahora y seguir investigando con el resto estable.**

## Qué riesgos aparecen si abusás de los flags

Hasta ahora todo suena ideal.
Pero también hay costos.

Si abusás de feature flags o activaciones parciales, podés generar:

- código más difícil de leer
- caminos lógicos duplicados
- combinaciones de comportamiento difíciles de testear
- deuda de flags nunca removidos
- comportamiento distinto entre tenants difícil de razonar
- incidentes por configuración inconsistente

O sea:

**los flags ayudan a cambiar con seguridad, pero también agregan complejidad operativa y de diseño.**

## Flags temporales vs flags permanentes

No todos los flags deberían vivir igual.

### Flags temporales

Sirven para introducir, observar y estabilizar un cambio.
Después deberían retirarse.

### Flags permanentes

Representan variaciones reales del producto.
Por ejemplo:

- features por plan
- capacidades enterprise
- módulos opcionales
- configuración por tenant

Mezclar ambas cosas sin criterio puede generar bastante confusión.

Un flag de rollout no debería quedarse para siempre si ya no cumple función operativa real.

## Qué hace sano a un rollout

Un rollout sano suele tener varias de estas propiedades:

- objetivo claro
- cohorte inicial elegida con criterio
- métricas definidas de antemano
- criterios de avance y de freno
- capacidad de apagar rápido
- ownership claro
- comunicación entre producto, ingeniería y operación
- plan de limpieza posterior

No es solo “prender de a poco”.
Es **introducir cambio con capacidad deliberada de aprendizaje y control**.

## Ejemplo mental: nuevo proveedor de pagos

Imaginá que migrás parte del procesamiento a un nuevo proveedor.

Hacerlo de golpe sería riesgoso porque podés descubrir tarde problemas como:

- rechazos anómalos
- timeouts en ciertos métodos
- diferencias en conciliación
- errores con monedas o cuotas
- edge cases regionales

Una estrategia más sana podría ser:

1. desplegar integración nueva detrás de un flag
2. correr pruebas internas o transacciones controladas
3. hacer dark launch para observar respuestas en paralelo
4. activar para un subconjunto de merchants o tenants
5. medir errores, latencia y tasa de aprobación
6. aumentar gradualmente la exposición
7. dejar capacidad de fallback al proveedor anterior

Esa secuencia no elimina problemas.
Pero hace mucho más probable detectarlos antes de que comprometan todo el negocio.

## Ejemplo mental: nuevo motor de búsqueda

En búsqueda o ranking, el riesgo muchas veces no es solo técnico.
También es de negocio.

Tal vez el sistema no falle con error 500.
Pero puede degradar:

- relevancia
- conversión
- descubrimiento de productos
- engagement

Ahí un dark launch o una comparación en paralelo puede ser muy valioso para medir:

- diferencia de resultados
- CTR
- conversión posterior
- latencia
- impacto por categoría o tenant

No todo bug viene en forma de excepción.
A veces el problema es que el sistema “funciona”, pero peor.

## Rollout y compatibilidad hacia atrás

Este tema se conecta fuerte con el anterior.

Muchas veces la activación progresiva requiere convivir temporalmente con:

- comportamiento viejo y nuevo
- contratos previos y contratos nuevos
- datos producidos por dos versiones
- consumidores mezclados
- workers heterogéneos

Por eso un rollout seguro muchas veces depende de haber diseñado antes cierta compatibilidad transitoria.

Sin eso, la activación gradual puede ser mucho más difícil o directamente inviable.

## Qué errores son comunes en este terreno

Uno muy común es creer que rollout progresivo es solo “una herramienta de flags”.

No.
Es una capacidad de ingeniería y operación que combina:

- diseño del cambio
- observabilidad
- estrategia de exposición
- capacidad de apagado
- seguimiento de métricas
- limpieza posterior

Otro error común es hacer rollout parcial pero sin definir qué condición justificaría frenarlo.

Entonces el equipo termina mirando dashboards sin saber bien qué significa “va bien” o “hay que apagar”.

## Cómo decidir el orden de exposición

No siempre conviene crecer así:

- 1%
- 5%
- 10%
- 25%
- 50%
- 100%

A veces conviene este tipo de secuencia:

- staff interno
- sandbox o cuentas de prueba
- uno o dos tenants muy acompañados
- segmento pequeño de bajo riesgo
- cohorte regional
- crecimiento escalonado más amplio
- disponibilidad general

La estrategia correcta depende del tipo de cambio y del costo de un error.

## Señales de que un cambio merece rollout controlado

No todo cambio necesita el mismo nivel de ritual.

Pero suele convenir rollout progresivo cuando el cambio:

- toca dinero
- toca permisos o seguridad
- cambia comportamiento muy usado
- altera una integración crítica
- cambia un camino de alta carga
- introduce infraestructura nueva
- afecta tenants grandes o clientes sensibles
- es difícil de revertir completamente
- tiene incertidumbre de performance o equivalencia funcional

Cuanto mayor es la incertidumbre o el costo de fallar, más valiosa se vuelve la activación gradual.

## Señales de que el equipo todavía no domina bien esta práctica

Algunas señales son:

- todos los cambios salen para todos de una vez
- hay flags, pero sin disciplina de limpieza
- no existen cohortes claras de prueba en producción
- no se sabe qué métricas mirar por cambio
- rollback depende siempre de redeploy urgente
- producto, backend y operación no comparten criterios de avance
- después de una activación nadie revisa impacto real

Eso no significa que el equipo trabaje mal.
Pero sí que probablemente está perdiendo una herramienta importante para cambiar con menos riesgo.

## Estrategia gradual para incorporar esto sin burocracia excesiva

No hace falta convertir cada cambio en un operativo gigante.

Una estrategia inicial razonable puede ser:

1. identificar qué tipos de cambios son de alto riesgo
2. separar deploy de activación cuando tenga sentido
3. introducir flags simples para cambios sensibles
4. definir cohortes internas o tenants piloto
5. acordar métricas mínimas por tipo de rollout
6. practicar apagado rápido y fallback
7. remover flags temporales una vez estabilizado el cambio

Eso ya mejora mucho la madurez operativa.

## Buenas prácticas iniciales

## 1. Separar mentalmente deploy de release

No todo lo desplegado debe quedar activo para todos al instante.

## 2. Usar activación progresiva cuando el costo de un error sea alto

Especialmente en pagos, permisos, pricing o flujos críticos.

## 3. Definir de antemano qué métricas indicarían éxito o deterioro

Un rollout sin criterios de lectura es demasiado intuitivo.

## 4. Elegir bien la cohorte inicial

No siempre el porcentaje más chico es la mejor opción.

## 5. Tener una forma rápida de apagar o volver atrás

La velocidad de reacción importa mucho.

## 6. Limpiar flags temporales después de estabilizar

Si no, la complejidad queda acumulada.

## 7. Usar dark launch cuando necesitás validar comportamiento real antes de exponer resultados

Es muy valioso para cambios complejos o comparativos.

## Errores comunes

### 1. Creer que pasar tests ya justifica salida total para todos

Entre validar y exponer hay un paso operativo importante.

### 2. Hacer rollout parcial sin observabilidad útil

Eso reduce bastante el valor de la gradualidad.

### 3. Introducir flags sin estrategia de retiro

La deuda crece silenciosamente.

### 4. Activar por porcentaje aunque otra segmentación sería más segura

No todo problema se resuelve con “1% del tráfico”.

### 5. No definir criterios explícitos para avanzar o frenar

El equipo queda reaccionando por intuición.

### 6. Hacer dark launch sin comparar ni mirar resultados relevantes

Entonces corrés en sombra, pero no aprendés nada valioso.

### 7. No pensar en blast radius antes de liberar un cambio sensible

La exposición masiva prematura sale cara cuando algo falla.

## Mini ejercicio mental

Pensá estas preguntas:

1. ¿qué cambio reciente de tu backend habría sido menos riesgoso si hubiera tenido activación progresiva?
2. ¿hoy distinguís claramente entre desplegar código y activar comportamiento?
3. ¿qué métricas mirarías si lanzaras una nueva lógica de checkout o pagos?
4. ¿qué tipos de cambios en tu sistema justifican cohortes piloto antes de salir para todos?
5. ¿tenés flags temporales viejos que ya nadie sabe bien por qué siguen existiendo?

## Resumen

En esta lección viste que:

- desplegar una nueva versión y activar una nueva funcionalidad no son la misma cosa
- feature rollout y activación progresiva permiten introducir cambios en producción de forma controlada, aprendiendo antes de exponer a toda la base de usuarios
- dark launch sirve para observar comportamiento real sin convertir todavía la nueva lógica en el camino principal del sistema
- canary release es una forma de exposición parcial, útil para detectar problemas temprano en una porción reducida del tráfico o de los usuarios
- estas prácticas ayudan a reducir blast radius, mejorar la capacidad de rollback y validar comportamiento bajo condiciones reales
- feature flags son un mecanismo valioso, pero también agregan complejidad si se usan sin disciplina o sin estrategia de limpieza
- un rollout sano necesita cohortes bien elegidas, observabilidad útil, criterios de avance y capacidad de apagado rápido
- evolucionar un backend de manera segura no depende solo de escribir buen código, sino también de cómo se libera, observa y controla ese cambio en producción

## Siguiente tema

Ahora que ya entendés cómo introducir cambios de manera gradual y con menor radio de impacto, el siguiente paso natural es meterse en **observabilidad para detectar regresiones después de cambios**, porque liberar de forma progresiva mejora mucho la seguridad operativa, pero solo genera aprendizaje real cuando el sistema te permite ver con claridad qué empeoró, dónde, para quiénes y desde qué momento.
