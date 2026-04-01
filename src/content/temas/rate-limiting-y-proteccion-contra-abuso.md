---
title: "Rate limiting y protección contra abuso"
description: "Qué es el rate limiting, por qué importa tanto en APIs y backends reales, y cómo pensar límites, defensas y controles para proteger un sistema frente a uso excesivo, errores, automatización abusiva y comportamientos maliciosos."
order: 77
module: "Backend real e integraciones"
level: "intermedio"
draft: false
---

## Introducción

Cuando una aplicación empieza a volverse real, no alcanza con que responda bien cuando todo el mundo la usa “correctamente”.

También hay que pensar qué pasa cuando el sistema recibe:

- demasiadas peticiones
- reintentos excesivos
- tráfico automático
- bots
- integraciones mal implementadas
- clientes que hacen polling agresivo
- ataques simples
- usuarios que fuerzan acciones repetidamente
- consumo accidental o malicioso

Ahí aparece un tema muy importante:

**rate limiting y protección contra abuso.**

La idea general es simple:

**un backend no solo tiene que funcionar.  
También tiene que protegerse.**

## Qué es rate limiting

El rate limiting es una técnica para limitar cuántas solicitudes puede hacer un cliente en un cierto período de tiempo.

Por ejemplo:

- 100 requests por minuto
- 10 intentos por minuto
- 1000 requests por hora
- 5 intentos de login por 10 minutos
- 1 operación sensible por segundo

La idea es poner límites razonables para evitar que una parte del sistema consuma recursos de forma desmedida o peligrosa.

## Qué problema intenta resolver

Sin límites, un backend puede sufrir por muchas razones.

Por ejemplo:

- un script mal hecho que hace requests en loop
- una integración externa que reintenta sin control
- un frontend con un bug que dispara muchas llamadas
- un bot que intenta fuerza bruta
- un scraper agresivo
- un usuario que refresca constantemente
- una API pública consumida sin criterio
- un ataque básico de saturación

No todos estos casos son “hackers sofisticados”.
Muchos son simplemente:

- errores de implementación
- mal uso
- automatización mal diseñada
- exceso de consumo no previsto

El rate limiting ayuda a poner orden y a reducir daño.

## Qué significa protección contra abuso

Es un concepto más amplio que rate limiting.

Incluye cualquier mecanismo que ayude a defender el sistema frente a:

- uso excesivo
- automatización abusiva
- consumo desbalanceado
- intentos repetidos
- scraping agresivo
- spam
- enumeración de recursos
- fuerza bruta
- degradación del servicio

Entonces:

- **rate limiting** es una herramienta
- **protección contra abuso** es el objetivo más general

## Por qué esto importa tanto

Porque un sistema puede romperse o degradarse no solo por complejidad interna, sino también por cómo lo usan desde afuera.

A veces el problema ni siquiera es un ataque intencional.
Puede ser:

- una app cliente con un bug
- una integración que no respeta tiempos
- un retry mal hecho
- un mal diseño del frontend
- un job que consulta demasiado
- una herramienta automática que recorre endpoints sin control

Si no ponés límites, ese comportamiento puede:

- saturar CPU
- saturar base de datos
- aumentar costos
- generar colas
- empeorar latencia
- afectar a otros usuarios
- volver inestable el sistema

## Dónde suele aplicarse

El rate limiting puede aparecer en muchos lugares.

Por ejemplo:

- endpoints públicos
- login
- recuperación de contraseña
- registro
- búsqueda
- APIs expuestas a terceros
- endpoints costosos
- acciones administrativas sensibles
- envío de emails o mensajes
- generación de reportes
- descarga de recursos
- webhooks salientes o entrantes en algunos diseños

No todos los endpoints necesitan el mismo límite.

## Ejemplos de uso razonable

### 1. Login

Podrías limitar intentos para reducir fuerza bruta.

### 2. Recuperación de contraseña

No querés que alguien dispare cientos de solicitudes.

### 3. Búsqueda

Puede ser un endpoint caro o abusado por scraping.

### 4. API pública

Necesita reglas claras por cliente o token.

### 5. Acciones costosas

Por ejemplo:

- exportaciones
- generación de PDFs
- cálculos pesados
- procesos que afectan stock o pagos

## Qué se puede limitar

No siempre se limita “por IP y listo”.

Se puede limitar según distintos criterios, por ejemplo:

- IP
- usuario autenticado
- API key
- token
- cliente
- tenant
- endpoint
- tipo de operación
- combinación de varios factores

Esto depende mucho del caso de uso.

## Ejemplo conceptual

No tiene sentido tratar igual:

- un endpoint público de login
- una API B2B autenticada por cliente
- una acción administrativa crítica
- una búsqueda pública
- una exportación pesada

Cada una puede necesitar reglas diferentes.

## Rate limiting no es solo seguridad

Mucha gente lo asocia solo a ataques.

Pero también cumple funciones de:

- estabilidad
- equidad
- control de capacidad
- protección de recursos caros
- previsibilidad operativa
- control de costos

Por eso es tanto un tema de seguridad como de arquitectura y operación.

## Ejemplo simple

Supongamos que un endpoint de búsqueda consulta varias tablas y hace filtros complejos.

Si un usuario o bot dispara 200 requests por segundo, puede degradar muchísimo el sistema.

Entonces un límite como:

- 30 requests por minuto por IP
- o 60 por minuto por usuario autenticado

puede proteger bastante.

## Acciones sensibles que conviene proteger especialmente

Hay ciertos flujos que suelen merecer atención especial.

### Login

Para mitigar fuerza bruta.

### Recuperación de contraseña

Para evitar abuso, spam o enumeración de cuentas.

### Registro

Para reducir automatización masiva.

### Envío de emails o códigos

Para evitar spam o costos innecesarios.

### Búsqueda y listado

Porque pueden ser usados para scraping o consumo intensivo.

### Operaciones administrativas

Porque pueden tener impacto alto en datos o infraestructura.

## Relación con temas anteriores

Este tema conecta con varios de los que ya viste.

### Idempotencia

Porque algunos clientes reintentan demasiado y hay que controlar no solo duplicados sino volumen.

### Tareas programadas y batch

Porque jobs internos también pueden dañar el sistema si consumen sin límites.

### Webhooks

Porque integraciones externas pueden reenviar demasiado o mal.

### Emails y notificaciones

Porque ciertos flujos de notificación pueden ser abusados o dispararse de forma excesiva.

Todo esto forma parte de diseñar backends más resistentes.

## Qué pasa cuando se supera el límite

Un sistema tiene que decidir cómo reaccionar.

Algunas posibilidades:

- rechazar temporalmente
- pedir esperar
- devolver un error específico
- registrar intento abusivo
- aumentar controles adicionales
- activar mecanismos de protección
- aplicar bloqueo temporal

Lo importante es que la reacción sea coherente y útil.

## Límites suaves y límites estrictos

No todos los escenarios necesitan la misma dureza.

### Límite suave

Se usa para ordenar consumo general.

Ejemplo:

- API pública con cuota razonable

### Límite estricto

Se usa para flujos sensibles.

Ejemplo:

- login
- recuperación de contraseña
- generación de códigos
- acciones de alto costo

Pensar criticidad ayuda a decidir esto.

## Protección contra abuso más allá del rate limiting

Como dijimos antes, limitar requests no es lo único.

También puede hacer falta pensar en:

- CAPTCHA en ciertos flujos
- bloqueo temporal
- verificación adicional
- detección de patrones raros
- límites por cuenta y por IP
- controles por tenant
- throttling
- circuit breakers en integraciones
- cuotas por plan
- monitoreo de comportamiento anómalo

O sea:

**la defensa suele ser por capas.**

## Fuerza bruta y enumeración

Dos casos muy típicos donde el tema importa mucho.

### Fuerza bruta

Intentos repetidos de adivinar credenciales o códigos.

### Enumeración

Intentos de descubrir información sensible a partir de respuestas del sistema.

Por ejemplo:

- saber si un email existe
- saber qué usuario está registrado
- recorrer ids o recursos
- probar muchos códigos o tokens

Los límites ayudan, pero también importa cómo responde el sistema.

## Protección en login y recuperación

Estos flujos merecen bastante cuidado.

Por ejemplo:

- limitar intentos por IP
- limitar intentos por cuenta
- agregar retrasos
- evitar mensajes demasiado reveladores
- registrar actividad sospechosa
- bloquear temporalmente
- escalar controles si el patrón es raro

No todo se resuelve con una sola regla.

## APIs para terceros

Cuando exponés una API a clientes externos, el tema cambia un poco.

Ya no solo querés protegerte.
También querés ofrecer reglas claras de consumo.

Por ejemplo:

- cuántos requests permite cada plan
- qué endpoints son más costosos
- si hay bursts tolerados
- qué pasa al excederse
- cómo se comunica el límite
- si hay cuotas diarias o mensuales

Acá el rate limiting también ayuda a construir un producto más previsible.

## Cuotas y fairness

Esto es importante en SaaS, APIs públicas o sistemas multiusuario.

La idea es evitar que un cliente o actor consuma desproporcionadamente y perjudique a los demás.

No se trata solo de “bloquear ataques”.
También de mantener equidad.

## Rate limiting y experiencia de usuario

Este tema también toca la UX.

Si se implementa mal, puede frustrar usuarios legítimos.

Por ejemplo:

- límites demasiado bajos
- reglas poco claras
- bloqueos sin explicación
- errores ambiguos
- controles excesivos en flujos normales

Entonces hay que buscar equilibrio:

- proteger el sistema
- sin romper la experiencia razonable

## Observabilidad

Conviene poder responder preguntas como:

- qué endpoint recibe más excesos
- qué IP o cliente supera más límites
- en qué horarios pasa
- si fue un bug, un bot o un abuso intencional
- cuántos rechazos hubo
- qué reglas se activaron
- si un flujo legítimo está siendo afectado

Esto ayuda mucho a ajustar políticas.

## Riesgo de límites mal diseñados

Un rate limiting mal pensado también puede ser problemático.

Por ejemplo:

- bloquear usuarios legítimos detrás de la misma IP
- dejar sin límite el criterio correcto
- aplicar reglas iguales a casos muy distintos
- generar falsos positivos
- no contemplar usuarios autenticados vs anónimos
- proteger poco los endpoints realmente sensibles

No se trata solo de “poner un número”.

## Buenas prácticas iniciales

## 1. Empezar por endpoints sensibles y costosos

No hace falta imponer todo de golpe sin criterio.

## 2. Diferenciar reglas por caso de uso

Login no es igual a búsqueda.
Búsqueda no es igual a exportación.

## 3. Pensar por identidad adecuada

Según el caso:
IP, usuario, token, cliente, tenant o combinación.

## 4. Registrar y observar antes de ajustar demasiado

Medir ayuda a no poner límites absurdos.

## 5. Complementar con otras defensas

Sobre todo en flujos sensibles.

## 6. Comunicar de forma razonable cuando se excede un límite

Eso mejora experiencia y diagnósticos.

## 7. Revisar periódicamente las reglas

Porque el uso real cambia con el tiempo.

## Errores comunes

### 1. No poner ningún límite “porque después vemos”

Después puede ser tarde o más difícil de corregir.

### 2. Proteger solo por IP en todos los casos

A veces no alcanza o genera problemas.

### 3. Poner límites iguales para todo

Cada flujo tiene criticidad y costo diferente.

### 4. Ignorar retries automáticos o bugs de clientes

Mucho abuso no es malicia sofisticada, sino mal diseño externo.

### 5. No medir impacto

Sin observabilidad cuesta saber si la regla ayuda o molesta.

### 6. Confiar solo en rate limiting

A veces hace falta sumar más capas de defensa.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. ¿qué endpoints de tu sistema son más sensibles al abuso?
2. ¿qué convendría limitar por IP y qué por usuario autenticado?
3. ¿qué flujo podría ser costoso aunque no sea de seguridad, como una búsqueda o exportación?
4. ¿qué pasaría si una integración externa reintenta sin control?
5. ¿qué información te gustaría ver en logs o métricas sobre excesos?

## Resumen

En esta lección viste que:

- el rate limiting limita cuántas solicitudes puede hacer un cliente en un período dado
- es una herramienta central para proteger APIs y backends frente a uso excesivo, errores y abuso
- no solo sirve para seguridad, también ayuda en estabilidad, costos, fairness y operación
- distintos endpoints necesitan reglas distintas según su criticidad y costo
- login, recuperación de contraseña, búsqueda, registro y APIs públicas suelen merecer especial atención
- la protección contra abuso es más amplia que el rate limiting e incluye otras capas defensivas
- medir, observar y ajustar políticas es tan importante como definir el límite inicial

## Siguiente tema

Ahora que ya entendés cómo proteger un backend frente a uso excesivo y comportamientos abusivos, el siguiente paso natural es aprender sobre **feature flags y configuración dinámica**, porque los sistemas reales también necesitan activar, desactivar o graduar comportamientos sin depender siempre de un redeploy completo.
