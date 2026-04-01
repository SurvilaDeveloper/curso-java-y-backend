---
title: "Resiliencia: timeouts, reintentos y circuit breakers"
description: "Cómo hacer un backend más robusto frente a servicios lentos o caídos usando timeouts, reintentos y circuit breakers con criterio."
order: 59
module: "Arquitectura y escalabilidad"
level: "intermedio"
draft: false
---

## Introducción

En la lección anterior viste integraciones externas y clientes HTTP.

Eso te mostró una realidad muy importante del backend moderno:

tu sistema muchas veces depende de otros sistemas.

Por ejemplo:

- pasarelas de pago
- servicios de email
- logística
- facturación
- otros microservicios
- APIs de terceros

Y en cuanto eso pasa, aparece un problema inevitable:

**las dependencias externas pueden fallar, responder lento o comportarse de forma inestable**

Ahí entra la resiliencia.

## Qué es resiliencia

Resiliencia es la capacidad de un sistema para seguir funcionando razonablemente bien, o al menos degradarse de forma controlada, cuando algo falla.

Dicho simple:

un sistema resiliente no asume que todo siempre saldrá perfecto.

Se prepara para:

- lentitud
- caídas parciales
- errores transitorios
- timeouts
- sobrecarga
- comportamientos inestables

## La idea general

Supongamos que tu backend llama a un servicio externo para cotizar envíos.

Si ese servicio:

- tarda 20 segundos
- responde intermitentemente
- está temporalmente caído

y tu aplicación no tiene ningún mecanismo de resiliencia, pueden pasar cosas como:

- requests colgadas
- hilos ocupados demasiado tiempo
- mala experiencia de usuario
- cascada de fallos
- sobrecarga innecesaria

La resiliencia ayuda a limitar ese daño.

## Qué problema resuelve

La resiliencia busca resolver o amortiguar situaciones como:

- una dependencia lenta
- una dependencia caída
- una falla temporal de red
- demasiados reintentos mal pensados
- saturación de recursos
- errores repetidos que degradan toda la app

## Qué herramientas básicas conviene entender primero

Para una base sólida, conviene empezar con estas tres ideas:

- timeouts
- reintentos
- circuit breakers

No son lo único que existe, pero sí un núcleo muy importante.

## Timeouts

Un timeout define cuánto tiempo estás dispuesto a esperar por una operación antes de darla por fallida.

## Por qué es tan importante

Porque sin timeout, una integración lenta puede quedar esperando indefinidamente o demasiado tiempo.

Eso es peligroso porque consume recursos y degrada tu sistema.

## Ejemplo mental

Tu backend llama a una API externa.

Si esa API nunca responde o tarda muchísimo, ¿cuánto querés esperar?

- ¿1 segundo?
- ¿3 segundos?
- ¿30 segundos?
- ¿indefinidamente?

La respuesta correcta depende del caso, pero casi nunca debería ser “sin límite”.

## Qué pasa sin timeout

Sin timeout razonable, podés terminar con:

- requests colgadas
- threads bloqueados
- acumulación de espera
- menor capacidad del sistema para atender otras requests

## Timeouts no son pesimismo, son higiene

Poner timeouts no significa ser paranoico.

Significa diseñar con realismo.

En sistemas distribuidos, la lentitud y el fallo existen.
No son una rareza teórica.

## Tipos de timeout

A nivel conceptual, suele haber distintos tipos.

Por ejemplo:

- timeout de conexión
- timeout de lectura o respuesta
- timeout total de operación

No hace falta profundizar cada API concreta ahora.
Lo importante es entender que “esperar para siempre” rara vez es una buena idea.

## Reintentos

Pasemos a los reintentos.

Un reintento significa volver a intentar una operación que falló, porque existe la posibilidad de que el fallo haya sido transitorio.

## Cuándo puede tener sentido reintentar

Por ejemplo, cuando falla algo como:

- timeout momentáneo
- red inestable
- `503 Service Unavailable`
- error temporal del proveedor
- saturación breve

## Cuándo puede NO tener sentido reintentar

No todo error merece reintento.

Por ejemplo, muchas veces no tiene sentido reintentar:

- `400 Bad Request`
- credenciales inválidas
- request mal formada
- recurso inexistente si no hay razón para pensar que aparecerá mágicamente

## Por qué esto importa

Porque un reintento mal pensado no arregla nada y además puede empeorar el problema.

## Ejemplo de reintento malo

Si un servicio responde `401 Unauthorized` porque las credenciales son incorrectas, reintentar tres veces más no aporta valor.

Solo agrega ruido y carga.

## Ejemplo de reintento razonable

Si una dependencia responde timeout una vez por un problema transitorio, un pequeño reintento sí podría tener sentido.

## Cuántos reintentos conviene hacer

No hay número mágico universal.

Pero una intuición sana es:

- pocos reintentos
- bien justificados
- con espera entre intentos si hace falta

No conviene reintentar de forma infinita ni agresiva.

## Backoff

Una idea muy útil en reintentos es el backoff.

Significa esperar un poco entre intentos, en vez de reintentar instantáneamente y sin control.

## Ejemplo mental

En vez de hacer:

- intento 1
- intento 2 inmediatamente
- intento 3 inmediatamente

podrías hacer algo como:

- intento 1
- esperar 200 ms
- intento 2
- esperar 500 ms
- intento 3

Eso suele ser bastante más sano.

## Por qué el backoff ayuda

Porque si la dependencia está sobrecargada o inestable, reintentar sin respirar puede agravar la situación.

## Reintentos y idempotencia

Esto es muy importante.

Antes de reintentar, conviene pensar si la operación es idempotente o no.

## Qué significa idempotencia

Que ejecutar varias veces la misma operación no debería producir efectos peligrosamente distintos.

Por ejemplo:

- consultar una cotización puede ser más fácil de reintentar
- cobrar una tarjeta no siempre conviene reintentarlo alegremente sin mucho criterio

## Ejemplo mental

### Más seguro de reintentar

- `GET /shipping/quote`

### Mucho más delicado

- autorizar o capturar un pago
- crear una orden
- emitir una factura

Ahí los reintentos exigen muchísimo más cuidado.

## Circuit breaker

Ahora pasemos al circuit breaker.

Es una de las ideas más valiosas de resiliencia.

## Qué es un circuit breaker

Es un mecanismo que deja de intentar llamar a una dependencia que está fallando repetidamente, al menos durante un período de tiempo.

Dicho simple:

si un servicio externo está roto, tu sistema deja de insistirle ciegamente una y otra vez.

## Por qué eso es tan útil

Porque cuando algo está claramente fallando, seguir golpeándolo sin control puede:

- empeorar el problema
- consumir recursos propios
- aumentar latencia
- saturar aún más la dependencia

## Analogía mental

Pensalo como un disyuntor eléctrico.

Cuando detecta demasiadas fallas, “corta” temporalmente en vez de seguir forzando el circuito.

## Estados típicos del circuit breaker

A nivel conceptual, suele pensarse en tres estados:

- cerrado
- abierto
- semiabierto

## Cerrado

Todo funciona normalmente.
Las requests pasan.

## Abierto

El breaker detectó demasiados fallos.
Las requests dejan de intentar la llamada real por un tiempo.

## Semiabierto

Después de cierto tiempo, se permite probar algunas llamadas para ver si la dependencia ya se recuperó.

## Qué logra esto

Evita castigar una dependencia caída y protege a tu sistema del costo de seguir fallando sin control.

## Ejemplo mental

Supongamos que tu servicio de logística está respondiendo con timeout una y otra vez.

Sin circuit breaker:

- cada request sigue intentando la llamada
- todas esperan
- todo se degrada

Con circuit breaker:

- tras suficientes fallos, se abre el circuito
- nuevas requests ya no esperan inútilmente
- el sistema puede responder con degradación controlada o fallback

## Fallback

Otra idea importante es el fallback.

Un fallback es una respuesta alternativa cuando una dependencia no está disponible o no conviene seguir intentando.

## Ejemplos de fallback

- “cotización temporalmente no disponible”
- usar valor aproximado no crítico
- omitir una funcionalidad secundaria
- devolver un mensaje de degradación
- usar dato cacheado si aplica

## Por qué esto es valioso

Porque en algunos casos es mejor una degradación explícita que romper todo el flujo.

## Ejemplo sano

Si falla el servicio de analytics, probablemente no querés romper la compra entera.

Si falla un servicio de emails, probablemente tampoco querés anular una orden ya guardada correctamente.

Ahí el fallback o la separación asíncrona ayudan muchísimo.

## Qué no resuelve la resiliencia

Conviene dejarlo claro.

La resiliencia no reemplaza:

- buen modelado de negocio
- entender tus integraciones
- buen manejo de errores
- observabilidad
- testing
- diseño cuidadoso de operaciones críticas

No es magia.
Es una capa de defensa y control.

## Resiliencia y observabilidad

Esto conecta muy fuerte con la lección anterior sobre observabilidad.

Si tenés:

- timeouts
- reintentos
- circuit breakers

también necesitás observar cosas como:

- cuántos timeouts hubo
- cuántos retries ocurrieron
- si el breaker se abrió
- cuánto tarda la dependencia
- si el fallback se usa demasiado

Sin observabilidad, la resiliencia queda mucho más ciega.

## Resiliencia y arquitectura hexagonal

También conecta muy bien con arquitectura hexagonal.

La lógica resiliente suele vivir mejor en los adaptadores de salida o en capas técnicas de integración, no en el núcleo puro del dominio.

Eso ayuda a que el negocio no quede contaminado con demasiados detalles operativos.

## Ejemplo conceptual de puerto

```java
public interface ShippingQuotePort {
    ShippingQuoteResult getQuote(ShippingQuoteCommand command);
}
```

## Adaptador resiliente

```java
@Component
public class ShippingHttpAdapter implements ShippingQuotePort {

    @Override
    public ShippingQuoteResult getQuote(ShippingQuoteCommand command) {
        // timeout razonable
        // reintento si corresponde
        // circuit breaker o fallback
        return new ShippingQuoteResult("FastShip", 3500.00, "ARS");
    }
}
```

## Qué muestra esto

Que la resiliencia puede ser parte del adaptador externo sin invadir el corazón del caso de uso.

## Casos donde la resiliencia importa muchísimo

Suele ser especialmente importante en:

- pagos
- logística
- email
- facturación
- identidad
- catálogos externos
- microservicios internos
- cualquier dependencia crítica o inestable

## Qué no conviene hacer

No conviene:

- no poner timeout
- reintentar todo ciegamente
- reintentar operaciones delicadas sin pensar idempotencia
- dejar que una dependencia caída arrastre todo el sistema
- agregar circuit breaker sin entender el flujo y el fallback

## Ejemplo mental completo

Caso:
crear orden y consultar cotización de envío externa.

### Sin resiliencia

- se llama al proveedor
- tarda muchísimo
- la request del usuario queda colgada
- se acumulan hilos
- el sistema empieza a degradarse

### Con resiliencia razonable

- timeout corto
- quizá uno o dos retries con backoff si tiene sentido
- si falla demasiado, breaker abierto
- fallback controlado o respuesta específica

Resultado:
menos daño, más control.

## Qué decisiones conviene pensar por integración

Para cada integración externa, conviene preguntarte:

1. ¿cuánto tiempo estoy dispuesto a esperar?
2. ¿qué errores merecen retry?
3. ¿cuántos retries tendría sentido hacer?
4. ¿esta operación es idempotente?
5. ¿qué pasa si la dependencia sigue caída?
6. ¿hay fallback razonable?
7. ¿cómo voy a observar este comportamiento?

## Resiliencia y experiencia de usuario

Esto también impacta mucho la UX.

Una integración lenta o frágil sin control puede hacer que la aplicación se sienta caótica.

En cambio, una degradación controlada, un timeout razonable o un fallback claro suelen dar una experiencia mucho más profesional.

## Buenas prácticas iniciales

## 1. Definir timeouts razonables

Casi nunca conviene esperar sin límite.

## 2. Reintentar solo cuando tenga sentido

No por reflejo automático.

## 3. Considerar idempotencia antes de reintentar

Especialmente en operaciones con efectos reales.

## 4. Usar circuit breakers donde una dependencia pueda arrastrar al resto

Eso protege bastante al sistema.

## 5. Diseñar fallbacks con criterio

No siempre existen, pero cuando existen pueden ser muy valiosos.

## 6. Medir y loguear lo que pasa

La resiliencia sin observabilidad queda incompleta.

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede recordarte a clientes HTTP robustos, retries y circuit breakers en entornos Node o servicios distribuidos. En Java y Spring Boot estas ideas toman mucha fuerza porque suelen aparecer en integraciones empresariales y arquitecturas con varios servicios.

### Si venís de Python

Puede hacerte pensar en resiliencia frente a APIs externas o microservicios frágiles. En Java, este tema se vuelve especialmente importante porque el ecosistema enterprise y distribuido tiende a requerir bastante disciplina en timeouts, retries y degradación controlada.

## Errores comunes

### 1. No poner timeouts

Es uno de los errores más peligrosos y más comunes.

### 2. Reintentar cualquier cosa

No todo error merece retry.

### 3. Ignorar idempotencia

Puede llevar a duplicados o efectos muy graves.

### 4. No usar circuit breaker cuando una dependencia claramente arrastra al sistema

Eso deja tu backend más expuesto.

### 5. Implementar resiliencia sin observabilidad

Después no entendés cuándo ni por qué se activa.

## Mini ejercicio

Tomá una integración externa imaginaria o real de tu proyecto integrador y definí:

1. qué timeout le pondrías
2. si la reintentarías o no
3. qué errores merecerían retry
4. si usarías circuit breaker
5. qué fallback tendría sentido
6. qué métricas o logs mirarías

## Ejemplo posible

Caso:
cotización de envío

- timeout: 2 segundos
- retries: sí, máximo 2
- errores reintentables:
  - timeout
  - `503`
- circuit breaker: sí
- fallback:
  - “cotización temporalmente no disponible”
- observar:
  - latencia
  - timeouts
  - errores por proveedor
  - aperturas del breaker

## Resumen

En esta lección viste que:

- la resiliencia ayuda a que un backend soporte mejor fallos y lentitud de dependencias externas
- los timeouts evitan esperas excesivas
- los reintentos pueden ayudar frente a fallos transitorios, pero deben usarse con criterio
- la idempotencia es central para decidir retries seguros
- los circuit breakers ayudan a proteger al sistema cuando una dependencia está fallando demasiado
- fallbacks y observabilidad completan muy bien una estrategia de resiliencia madura

## Siguiente tema

La siguiente natural es **versionado de API y evolución de contratos**, porque después de haber profundizado bastante arquitectura, integraciones y robustez operativa, el siguiente paso muy valioso es aprender cómo hacer que una API evolucione sin romper a quienes la consumen.
