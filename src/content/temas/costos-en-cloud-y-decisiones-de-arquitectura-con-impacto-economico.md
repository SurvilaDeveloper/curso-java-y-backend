---
title: "Costos en cloud y decisiones de arquitectura con impacto económico"
description: "Cómo pensar costos en cloud desde la arquitectura backend; qué rubros suelen crecer de verdad, por qué escalar técnicamente no siempre significa escalar de forma rentable y cómo tomar decisiones con criterio económico sin destruir confiabilidad ni velocidad de entrega."
order: 237
module: "Cloud, despliegue, carrera y proyecto final"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior vimos algo central:

**cuando un backend corre en cloud y además está distribuido, necesitás observabilidad real para entender qué está pasando.**

Ahora aparece una consecuencia natural de eso.

Una vez que podés observar el sistema, empezás a notar otra cosa:

**cada decisión técnica también tiene una traducción económica.**

Y esto cambia bastante la forma de pensar arquitectura.

Porque en etapas tempranas es muy común razonar así:

- “hagámoslo más robusto”
- “hagámoslo más escalable”
- “agreguemos otra base”
- “cacheemos todo”
- “separemos más servicios”
- “replicamos por las dudas”
- “guardemos todos los logs”

Todo eso puede sonar técnicamente razonable.
Pero en cloud, casi siempre termina significando también:

- más cómputo
- más almacenamiento
- más transferencia
- más servicios administrados
- más complejidad operativa
- más costo fijo mensual
- más costo variable por uso

Entonces aparece una idea muy importante para un backend profesional:

**no alcanza con que una arquitectura funcione bien; también tiene que ser económicamente sostenible para el negocio que la sostiene.**

Este tema trata justamente de eso.

## Por qué el costo en cloud no es “solo infraestructura”

A veces se piensa el costo cloud como si fuera un tema separado de la arquitectura.
Como si primero se diseñara el sistema y después alguien más “viera cuánto sale”.

En la práctica, no funciona así.

Porque el costo está incrustado en decisiones como:

- cuántas instancias mantenés vivas
- cuánto dimensionás de más por seguridad
- cuántas copias de datos conservás
- qué nivel de alta disponibilidad exigís
- cuántos ambientes levantás
- cuánta observabilidad retenés
- cuántas dependencias administradas agregás
- cuánto tráfico interno y externo mueve el sistema
- qué tanto procesamiento hacés online versus batch

O sea:

**la arquitectura define el perfil de costo del sistema.**

Y eso importa mucho, porque un backend puede ser técnicamente “muy bueno” y aun así ser económicamente pésimo para el contexto real del producto.

## Qué cambia cuando el costo pasa a ser una restricción real

Hay una etapa en la vida de muchos proyectos donde el costo parece secundario.

Por ejemplo:

- durante prototipos
- durante validación inicial
- en entornos muy chicos
- cuando el volumen todavía es bajo
- cuando el foco principal es salir al mercado

En esa etapa, priorizar velocidad puede tener sentido.

Pero a medida que el sistema crece, el costo empieza a volverse una restricción arquitectónica de verdad.

Y ahí cambia la pregunta.

Ya no alcanza con preguntarse:

- ¿esto funciona?
- ¿esto escala?
- ¿esto es robusto?

También hay que preguntarse:

- ¿cuánto cuesta sostenerlo mes a mes?
- ¿cómo crece ese costo si el tráfico se duplica?
- ¿este costo acompaña los ingresos o los destruye?
- ¿estamos pagando por complejidad que todavía no necesitamos?
- ¿qué parte del costo aporta valor y qué parte es desperdicio?

Ese cambio de mentalidad es muy importante.

Porque a partir de cierto punto, diseñar sin pensar costo ya no es una omisión menor.
Es diseñar sin una restricción fundamental del sistema.

## Los grandes rubros de costo en cloud

No hace falta memorizar catálogos de proveedores para entender lo esencial.
En casi cualquier plataforma cloud, los costos terminan concentrándose alrededor de unos pocos grupos grandes.

## Cómputo

Todo lo que corre consume cómputo:

- máquinas virtuales
- contenedores
- funciones serverless
- workers
- jobs batch
- pipelines de procesamiento

Acá el costo suele crecer por:

- sobredimensionamiento
- autoscaling mal calibrado
- procesos ociosos siempre encendidos
- workloads que podrían ejecutarse fuera de horario pico
- servicios duplicados por ambiente o por separación prematura

## Almacenamiento

Se paga por guardar:

- bases de datos
- backups
- objetos
- archivos
- snapshots
- logs
- métricas
- trazas
- data lake o warehouse

El almacenamiento parece barato al principio, pero puede crecer muchísimo cuando no hay política de retención, archivado o limpieza.

## Red y transferencia

Mucha gente subestima esto.

Pero en cloud también se paga por mover datos:

- salida hacia internet
- tráfico entre regiones
- tráfico entre zonas
- llamadas entre servicios
- cargas y descargas de archivos
- replicación y sincronización

En arquitecturas distribuidas, el costo de red puede pasar de invisible a relevante bastante rápido.

## Servicios administrados

Bases, colas, caches, balanceadores, observabilidad, CDN, secretos, mensajería, búsqueda, analítica.

Cada uno simplifica cosas.
Pero cada uno también agrega:

- costo directo
- dependencia operativa
- costo de integración
- costo de volumen

El problema no es usarlos.
El problema es agregarlos sin entender qué valor concreto justifican.

## Observabilidad y seguridad

Logs, métricas, trazas, escaneo, auditoría, retención, backups, cifrado, monitoreo.

Todo eso es importante.
Pero también consume presupuesto.

Una observabilidad mal diseñada puede terminar costando muchísimo.
Una seguridad mal operada también.

## La diferencia entre costo fijo y costo variable

Otra idea útil es distinguir dos tipos de costo.

### Costo fijo

Es el que pagás por tener capacidad disponible aunque el uso sea bajo.

Por ejemplo:

- instancias mínimas siempre encendidas
- bases administradas provisionadas a tamaño fijo
- ambientes permanentes
- servicios reservados aunque se usen poco

### Costo variable

Es el que crece con el uso.

Por ejemplo:

- requests procesadas
- minutos de ejecución
- almacenamiento consumido
- transferencia saliente
- eventos procesados
- logs indexados
- consultas analíticas

Esta diferencia es clave porque dos arquitecturas pueden costar parecido hoy pero comportarse muy distinto mañana.

Una puede tener costo fijo alto pero escalar bien en volumen.
Otra puede parecer barata al inicio y volverse cara muy rápido cuando aumenta el uso.

Por eso el costo no debe mirarse solo en valor absoluto actual.
También hay que mirar **la forma en que crece**.

## Escalar técnicamente no siempre significa escalar de forma rentable

Este es uno de los aprendizajes más importantes.

Un sistema puede escalar técnicamente y aun así escalar mal económicamente.

Por ejemplo:

- una arquitectura con demasiados servicios pequeños puede multiplicar costo base sin necesidad
- una estrategia de replicación agresiva puede mejorar disponibilidad pero disparar gasto prematuramente
- un uso intensivo de llamadas síncronas entre servicios puede aumentar latencia y costo de red a la vez
- una cache mal diseñada puede abaratar base de datos o puede sumar otra capa costosa sin resolver el problema principal
- una instrumentación excesiva puede volver carísima la observabilidad sin aportar capacidad real de diagnóstico

Entonces, cuando se habla de “escalabilidad real”, hay que pensar al menos tres dimensiones:

- escalabilidad técnica
- escalabilidad operativa
- escalabilidad económica

Las tres importan.
Y un backend profesional intenta equilibrarlas.

## El costo de la complejidad también existe

Hay costos que no vienen en la factura del proveedor pero igual son muy reales.

Por ejemplo:

- más tiempo para desplegar
- más tiempo para investigar incidentes
- más tiempo para onboardear gente nueva
- más riesgo de errores operativos
- más dependencia de especialistas
- más piezas que romper
- más fricción para evolucionar el sistema

Eso también es costo.

A veces una decisión reduce un rubro de infraestructura pero sube muchísimo el costo humano y operativo.
Y otras veces una decisión más cara en infraestructura ahorra suficiente complejidad como para compensarlo.

Por eso no conviene razonar costo solo como “la cuenta del proveedor”.

Conviene pensar:

**costo total de sostener esta arquitectura en el tiempo.**

## Dónde suelen aparecer desperdicios típicos

Cuando un backend crece sin demasiado control, hay patrones muy repetidos de gasto innecesario.

### Recursos sobredimensionados

Instancias, bases o colas configuradas para picos improbables durante todo el mes.

### Ambientes olvidados

Staging, entornos de prueba, sandboxes o demos que quedan vivos sin uso real.

### Observabilidad sin criterio

Retener demasiado:

- logs de bajo valor
- trazas completas de todo
- métricas con cardinalidad excesiva
- tableros que nadie usa

### Replicación y disponibilidad prematura

Diseñar como si el sistema ya fuese una plataforma crítica global cuando todavía no lo es.

### Microservicios antes de tiempo

Más servicios significan más pipelines, más monitoreo, más red, más configuración, más despliegues, más storage y más complejidad.

### Procesamiento online de cosas que podrían ser batch

No todo necesita resolverse en el request del usuario.
Mover trabajo fuera del camino crítico puede mejorar performance y también costo.

### Datos retenidos sin política clara

Guardar todo para siempre suele ser cómodo al principio y caro después.

## Qué decisiones arquitectónicas suelen tener impacto económico fuerte

Hay muchas, pero algunas aparecen todo el tiempo.

## Monolito modular vs muchos servicios

Separar servicios puede tener mucho sentido en ciertos contextos.
Pero hacerlo temprano o en exceso suele disparar:

- costo base
- complejidad operativa
- tráfico interno
- necesidad de observabilidad más sofisticada
- esfuerzo de despliegue y testing

A veces un monolito modular bien diseñado es económicamente mucho más eficiente durante bastante tiempo.

## Síncrono vs asíncrono

Lo asíncrono puede mejorar resiliencia y desacople.
Pero también agrega colas, workers, almacenamiento temporal, monitoreo y manejo de estados más complejos.

No siempre “más asíncrono” significa “mejor”.
Tiene que justificar su valor.

## Serverless vs servicios persistentes

Serverless puede bajar costo en workloads esporádicos y reducir operación.
Pero en cargas constantes o con patrones específicos puede no resultar la opción más barata.

Lo importante no es elegir por moda.
Lo importante es entender el patrón de uso.

## Base de datos única vs especialización prematura

Agregar motores distintos puede mejorar ciertas capacidades:

- búsqueda
- cache
- analítica
- documentos
- series temporales

Pero también multiplica costo y complejidad.

Muchas veces conviene exprimir más una arquitectura simple antes de sumar otra tecnología especializada.

## Multi-región y alta disponibilidad avanzada

Puede ser imprescindible en algunos productos.
Pero también puede duplicar o triplicar costos relevantes.

No siempre el negocio necesita ese nivel desde el día uno.

## Retención de telemetría

Guardar señales es útil.
Guardar demasiado detalle durante demasiado tiempo es carísimo.

La observabilidad también necesita políticas.

## Cómo evaluar una decisión con criterio económico

Una buena forma de pensar una decisión arquitectónica es salir del “me gusta / no me gusta” y pasar a preguntas más concretas.

Por ejemplo:

- qué problema real resuelve esta decisión
- qué costo directo introduce
- qué costo operativo introduce
- qué riesgo reduce y qué riesgo agrega
- qué volumen o escenario justificaría esta inversión
- qué alternativa más simple existe
- qué pasa si no la hacemos ahora
- qué señal nos indicaría que llegó el momento correcto

Este tipo de preguntas ayuda a evitar dos extremos muy comunes:

- gastar de más en sofisticación prematura
- ahorrar mal y romper algo importante

## El costo debe relacionarse con el valor del producto

Una arquitectura no existe en el vacío.
Existe para servir a un producto, un equipo y un modelo de negocio.

Por eso, el mismo costo puede ser razonable o absurdo según el contexto.

Por ejemplo:

- un costo alto puede ser aceptable si protege un flujo de ingresos crítico
- un costo moderado puede ser inaceptable si el producto todavía no monetiza bien
- una optimización compleja puede no valer la pena si ahorra poco
- una duplicación de infraestructura puede ser correcta si reduce un riesgo operacional que el negocio no tolera

Entonces, en backend profesional, pensar costo no es “ser barato”.
Es:

**alinear la arquitectura con la economía real del producto.**

## FinOps, sin volverlo una religión

En muchos equipos aparece el término FinOps.
No hace falta convertirlo en una disciplina misteriosa para captar la idea principal.

Lo que importa es esto:

- entender en qué se gasta
- atribuir costo a sistemas o equipos
- detectar desperdicio
- tomar decisiones con visibilidad
- conectar arquitectura, operación y negocio

Eso ya mejora mucho la calidad de las decisiones.

No hace falta empezar con procesos gigantes.
A veces alcanza con algo mucho más simple:

- etiquetar recursos bien
- saber qué servicio consume qué
- revisar costos por componente
- mirar tendencias mensuales
- detectar outliers
- relacionar deploys o cambios con subas de costo

## Qué señales conviene mirar

Así como antes hablábamos de observabilidad técnica, acá también conviene tener señales mínimas de costo.

Por ejemplo:

- costo por servicio o componente
- costo por ambiente
- costo por tenant o cliente importante si aplica
- costo de base de datos
- costo de observabilidad
- costo de salida de red
- costo por job o pipeline pesado
- tendencia mensual y variación por cambio reciente

Esto no significa que el backend engineer tenga que convertirse en contador.
Significa que debería poder leer estas señales y conectarlas con decisiones técnicas.

## Cuándo optimizar y cuándo no

Otra trampa frecuente es obsesionarse demasiado temprano con el costo.

No toda optimización vale la pena.

A veces es mejor pagar un poco más y ganar:

- velocidad de desarrollo
- menos carga operativa
- menos riesgo
- mejor foco del equipo

Otras veces, en cambio, seguir pagando “por comodidad” deja de tener sentido y el sistema necesita rediseño u optimización.

Entonces conviene evitar dos extremos:

### Extremo 1: ignorar costo

Resultado:
una arquitectura sobredimensionada, cara y difícil de sostener.

### Extremo 2: optimizar costo de manera obsesiva

Resultado:
un sistema frágil, subinvertido y lleno de decisiones que traban al equipo.

El punto sano está en el medio:

**gastar donde aporta valor y simplificar donde el costo no compra nada importante.**

## Algunos principios prácticos bastante sanos

Sin convertir esto en una receta rígida, hay algunos principios que suelen ayudar.

### 1. Empezá simple

No compres complejidad antes de que el problema la justifique.

### 2. Medí antes de optimizar

Muchas decisiones costosas se toman por intuición equivocada.

### 3. Revisá el costo de las “buenas prácticas”

Algunas buenas prácticas son excelentes.
Otras son excelentes en cierto contexto y un exceso en otro.

### 4. Tratá la retención como una política, no como un accidente

Logs, backups, archivos y datos viejos necesitan ciclo de vida.

### 5. Conectá arquitectura con ingresos y criticidad

No todo flujo merece la misma inversión.

### 6. Diferenciá pico de promedio

Diseñar el 100% del tiempo para el pico máximo suele salir caro.

### 7. Recordá que simplicidad también ahorra

Menos piezas suele significar menos costo directo y menos costo operativo.

## Una conexión importante con lo que sigue

Este tema prepara muy bien los próximos.

Porque una vez que entendés que la arquitectura también tiene impacto económico, se vuelve más natural entrar en:

- infraestructura como código
- entornos efímeros y preview environments
- estrategias de despliegue avanzadas
- cómo justificar decisiones de diseño profesionalmente

En otras palabras:

**cloud no se trata solo de poder aprovisionar recursos; se trata también de decidir qué recursos conviene tener, cuánto tiempo, para qué problema y con qué costo total.**

## Lo que deberías llevarte de esta lección

Si tuvieras que quedarte con una sola idea, que sea ésta:

**en cloud, casi toda decisión arquitectónica relevante tiene impacto económico, y diseñar bien un backend profesional implica equilibrar escalabilidad, resiliencia, complejidad operativa y costo total de forma coherente con el producto y su modelo de negocio.**

Cuando esto se entiende bien, el backend gana:

- decisiones más realistas
- menos sofisticación prematura
- mejor relación entre arquitectura y negocio
- más capacidad de crecer sin disparar gasto innecesario
- mejor uso de servicios administrados
- más claridad para priorizar optimizaciones
- una base más sana para operar y evolucionar en cloud

Y eso, en productos reales, no es un detalle financiero aislado.
Es parte del criterio técnico de verdad.
