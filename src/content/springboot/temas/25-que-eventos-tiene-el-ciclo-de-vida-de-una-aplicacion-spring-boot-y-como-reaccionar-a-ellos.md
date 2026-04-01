---
title: "Qué eventos tiene el ciclo de vida de una aplicación Spring Boot y cómo reaccionar a ellos"
description: "Entender los principales eventos del ciclo de vida de una aplicación Spring Boot, en qué momento ocurren y cómo permiten ejecutar lógica en puntos más precisos que un runner."
order: 25
module: "Arranque y ciclo de vida de la aplicación"
level: "base"
draft: false
---

En el tema anterior viste que Spring Boot ofrece herramientas como `CommandLineRunner` y `ApplicationRunner` para ejecutar lógica al inicio de la aplicación.

Eso es muy útil, pero a veces aparece una necesidad más fina.

Por ejemplo:

- querés reaccionar antes de que el contexto esté completamente listo
- querés hacer algo justo cuando la aplicación ya está preparada
- querés escuchar el cierre del contexto
- querés ejecutar lógica ligada a un momento específico del arranque
- querés distinguir mejor entre distintas etapas del ciclo de vida

Ahí entra una idea muy importante dentro del ecosistema Spring:

> la aplicación emite eventos durante su ciclo de vida, y vos podés reaccionar a ellos.

Esto te da una forma más granular y expresiva de enganchar lógica al arranque, a la preparación del contexto y al cierre del sistema.

## Qué significa que la aplicación emita eventos

Cuando una aplicación Spring Boot arranca, no pasa todo “de una sola vez” como una caja negra indivisible.

Internamente ocurren distintas etapas:

- se inicia el proceso de arranque
- se prepara el entorno
- se crea y refresca el contexto
- se registran y crean beans
- la aplicación queda lista
- eventualmente puede fallar
- eventualmente también puede cerrarse

Spring Boot representa varios de esos momentos mediante **eventos**.

Podés pensar un evento así:

> una señal interna que indica que algo importante acaba de ocurrir en el ciclo de vida de la aplicación.

Si te interesa reaccionar a esa señal, podés escucharla.

## Por qué esto importa

Porque no toda lógica de arranque pertenece al mismo instante.

A veces querés hacer algo:

- muy temprano
- justo antes de que el contexto esté listo
- cuando ya todos los beans están disponibles
- cuando la app quedó completamente lista para operar
- o cuando se está cerrando

Si usás solo un runner para todo, esa granularidad se pierde.

Los eventos te permiten ubicar mejor la intención.

## Eventos como una forma más precisa de enganchar lógica

Una buena manera de pensarlo es esta:

- los runners son una herramienta práctica para ejecutar algo al inicio
- los eventos te permiten elegir con más precisión **en qué momento** reaccionar

No siempre vas a necesitar tanta precisión, pero cuando aparece, entender el sistema de eventos te da mucho más control.

## Cómo se escucha un evento

Una forma típica de reaccionar a eventos en Spring es usar `@EventListener`.

Por ejemplo:

```java
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class MiListener {

    @EventListener
    public void escuchar(Object evento) {
        System.out.println("Se recibió un evento: " + evento.getClass().getSimpleName());
    }
}
```

Ese ejemplo es demasiado general para usarlo así en la práctica, pero sirve para ver la idea:

- existe un evento
- existe un listener
- cuando el evento ocurre, Spring invoca el método correspondiente

## Qué tipo de eventos interesan en Spring Boot

Spring Boot tiene varios eventos asociados al ciclo de vida de la aplicación.

No hace falta aprenderlos todos de memoria ni profundizar en cada uno desde el primer día.

Lo importante es entender que representan diferentes momentos del arranque y del cierre.

Entre los más conocidos están eventos como:

- el inicio de la aplicación
- la preparación del entorno
- la preparación del contexto
- el momento en que la aplicación ya está lista
- los fallos de arranque
- el cierre del contexto

No todos se usan con la misma frecuencia, pero conviene conocer el mapa general.

## Un evento muy importante: cuando la aplicación está lista

Uno de los eventos más útiles para empezar a entender este sistema es `ApplicationReadyEvent`.

Este evento representa, conceptualmente, un momento muy importante:

> la aplicación ya terminó de arrancar y está lista para recibir trabajo.

Por ejemplo:

```java
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class ReadyListener {

    @EventListener
    public void onReady(ApplicationReadyEvent event) {
        System.out.println("La aplicación está lista");
    }
}
```

Esto suele ser bastante más expresivo que poner cierta lógica en un lugar ambiguo del arranque.

## Cuándo puede servir `ApplicationReadyEvent`

Suele ser útil cuando querés ejecutar algo solo cuando la aplicación ya está completamente inicializada.

Por ejemplo:

- loggear que la app quedó lista
- disparar una tarea secundaria de inicio
- emitir una señal operativa
- hacer una inicialización que depende de que todo ya esté cargado
- tomar métricas del arranque completo

Es una forma clara de decir:
“esto quiero hacerlo cuando la app ya está realmente lista”.

## Diferencia entre “arrancó” y “está lista”

Esa diferencia puede parecer sutil, pero es importante.

No es lo mismo:

- “el proceso de arranque empezó”
- “el contexto fue creado”
- “la aplicación ya quedó lista para usarse”

Por eso los eventos existen: para no mezclar todos esos momentos como si fueran equivalentes.

## Otro evento importante: fallo de arranque

También existen eventos para escenarios de error, como `ApplicationFailedEvent`.

La idea general es que, si la aplicación falla durante el proceso de inicio, ese momento también puede representarse como evento.

Eso puede ser útil para:

- registrar información
- disparar mecanismos de diagnóstico
- dejar trazas más claras
- reaccionar ante problemas de bootstrap

No siempre vas a usarlo desde el primer día, pero conceptualmente muestra algo importante:

> el ciclo de vida también contempla la posibilidad de fallar, y Spring Boot puede exponer ese momento como evento.

## El cierre también forma parte del ciclo de vida

A veces al pensar el ciclo de vida uno se enfoca solo en “cómo arranca”.

Pero el cierre también importa.

Cuando la aplicación se detiene, el contexto puede cerrarse y eso también da lugar a eventos del lado de Spring.

Eso permite ejecutar lógica asociada al apagado del sistema, liberación de recursos o tareas de cierre ordenado.

## Un evento clásico del contexto: cierre

Dentro del ecosistema Spring, un evento muy conocido es el cierre del contexto.

Conceptualmente, escuchar ese momento puede servir para:

- registrar que la app se está cerrando
- limpiar recursos propios
- detener procesos internos
- cerrar integraciones o tareas auxiliares

Por ejemplo:

```java
import org.springframework.context.event.ContextClosedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class CierreListener {

    @EventListener
    public void onClose(ContextClosedEvent event) {
        System.out.println("El contexto se está cerrando");
    }
}
```

No siempre hace falta usar este mecanismo si ya resolvés ciertas limpiezas con otras herramientas, pero es muy útil saber que existe.

## Eventos del contexto y eventos de Boot

Acá conviene hacer una distinción conceptual.

Hay eventos más ligados al **ApplicationContext** de Spring en general.
Y hay eventos más específicamente ligados al arranque de **Spring Boot**.

No hace falta obsesionarse ahora con clasificarlos todos, pero sí entender que el sistema de eventos mezcla:

- momentos del contenedor
- momentos del bootstrap de Boot
- momentos del cierre
- momentos de error

## Qué ventaja tienen frente a un runner

Los eventos tienen una ventaja central:

> te permiten reaccionar a un momento más específico del ciclo de vida.

En cambio, un runner suele ser una herramienta más general de “hacé esto cuando la app ya arrancó lo suficiente”.

Eso significa que:

- si solo querés ejecutar algo simple al inicio, un runner puede alcanzar
- si necesitás precisión sobre el momento exacto, los eventos suelen ser mejores

## Un ejemplo comparativo

### Con runner

```java
@Component
public class InicioRunner implements CommandLineRunner {

    @Override
    public void run(String... args) {
        System.out.println("Algo pasó al iniciar");
    }
}
```

Esto sirve, pero no expresa con tanta claridad **qué instante** representa dentro del ciclo de vida.

### Con evento

```java
@Component
public class ReadyListener {

    @EventListener
    public void onReady(ApplicationReadyEvent event) {
        System.out.println("La aplicación ya está lista");
    }
}
```

Acá la intención queda mucho más clara.

## Los eventos ayudan a modelar mejor la intención

Ese es uno de los mayores valores de este sistema.

A veces dos soluciones “funcionan”, pero una comunica mejor la intención del código.

No es lo mismo decir:

- “corré esto en algún momento del arranque”
- que decir
- “corré esto cuando la aplicación ya esté lista”
- o
- “corré esto cuando el contexto se cierre”

Los eventos hacen más legible ese tipo de decisiones.

## Cómo escribir un listener limpio

Una práctica sana es que el listener tenga una responsabilidad bien acotada.

Por ejemplo:

- escuchar `ApplicationReadyEvent`
- delegar a un servicio concreto
- mantener la lógica del listener breve y comprensible

Ejemplo:

```java
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class StartupListener {

    private final StartupService startupService;

    public StartupListener(StartupService startupService) {
        this.startupService = startupService;
    }

    @EventListener
    public void onReady(ApplicationReadyEvent event) {
        startupService.registrarArranque();
    }
}
```

Esto suele ser mejor que meter mucha lógica directamente dentro del listener.

## Cuándo conviene delegar

Casi siempre conviene delegar cuando la tarea escuchada:

- tiene cierta complejidad
- necesita testeo aislado
- podría crecer con el tiempo
- forma parte de una responsabilidad más grande

El listener debería ser, en muchos casos, una puerta de entrada al evento, no el lugar donde vive toda la lógica.

## Eventos y perfiles

Igual que pasa con otros beans, un listener también puede condicionarse por perfil.

Por ejemplo:

```java
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
public class DevReadyListener {

    @EventListener
    public void onReady(ApplicationReadyEvent event) {
        System.out.println("Listener activo solo en desarrollo");
    }
}
```

Eso es muy útil cuando una reacción al arranque tiene sentido solo en ciertos entornos.

## Eventos y orden conceptual

No hace falta memorizar toda la línea temporal exacta del bootstrap, pero sí conviene entender que los eventos forman una secuencia.

Algunos ocurren muy temprano, otros después, otros al final y otros al fallar o cerrar.

Eso significa que elegir mal el evento puede llevar a ejecutar lógica demasiado pronto o demasiado tarde.

Por eso, más que aprender nombres sueltos, conviene preguntarte:

> ¿en qué momento real necesito reaccionar?

## Un caso muy útil: tareas no críticas cuando la app ya está lista

Supongamos que querés lanzar algo que no debería interferir con la preparación interna del contexto, pero sí correr una vez que todo quedó estable.

Ese tipo de necesidad encaja muy bien con algo como `ApplicationReadyEvent`.

Por ejemplo:

- precalentar una cache
- publicar un mensaje operativo
- hacer una verificación secundaria
- registrar un “startup complete”

No significa que siempre tenga que hacerse ahí, pero conceptualmente suele ser un buen lugar.

## Un caso útil: cerrar algo ordenadamente

Escuchar el cierre puede ser útil si tu aplicación mantiene:

- recursos propios
- conexiones no triviales
- hilos o tareas auxiliares
- adaptadores que querés apagar con prolijidad

Esto no reemplaza otras herramientas como callbacks de destrucción de beans, pero sí te da otra forma de reaccionar a ese momento global del sistema.

## Eventos como forma de desacoplar

Otra ventaja interesante es que los eventos ayudan a desacoplar ciertas reacciones.

En vez de que una parte del sistema llame manualmente a otra durante el arranque, podés dejar que una señal del ciclo de vida dispare el comportamiento.

Eso puede dar diseños más limpios, siempre que no se abuse de esta flexibilidad.

## Cuándo conviene ser prudente

Igual que con los runners, también es posible usar mal los eventos.

Por ejemplo, si empezás a meter en listeners:

- demasiada lógica
- demasiadas dependencias
- tareas largas
- side effects difíciles de rastrear
- secuencias muy acopladas

entonces el sistema de arranque puede volverse difícil de entender.

El hecho de que una lógica pueda reaccionar a un evento no significa automáticamente que deba vivir ahí.

## Señales de buen uso

Suelen ser señales de buen uso cuando el listener:

- escucha un evento claro
- tiene una responsabilidad acotada
- comunica bien su intención
- delega la lógica compleja a un servicio
- no oculta comportamiento importante de forma confusa

## Señales de mal uso

Suelen ser señales problemáticas cuando el listener:

- hace demasiado
- encadena demasiadas acciones
- se vuelve difícil de testear
- depende de medio sistema
- reacciona a eventos de forma poco predecible
- contiene lógica de negocio pesada

En esos casos conviene revisar si el evento realmente es el mejor lugar.

## Eventos del ciclo de vida no son eventos de negocio

Este punto es muy importante.

Los eventos de arranque o cierre pertenecen al **ciclo de vida técnico de la aplicación**.

No son lo mismo que eventos de negocio del tipo:

- pedido creado
- usuario registrado
- pago confirmado

No conviene mezclar ambas ideas.

Los primeros hablan de cómo vive la aplicación.
Los segundos hablan de cosas que pasan dentro del dominio del negocio.

## Una pregunta muy útil para elegir herramienta

Podés guiarte con esta pregunta:

> ¿quiero ejecutar algo al inicio en general o necesito reaccionar a un momento específico del ciclo de vida?

Si la respuesta es “al inicio en general”, quizá un runner alcance.

Si la respuesta es “a un momento específico”, probablemente el sistema de eventos sea más adecuado.

## Diferencia con `@PostConstruct`

También puede surgir la duda sobre `@PostConstruct`.

`@PostConstruct` vive más ligado al ciclo de vida de un bean individual.

En cambio, los eventos del ciclo de vida de la aplicación te dejan reaccionar a momentos globales del sistema.

Esa diferencia importa mucho.

- `@PostConstruct` → después de crear un bean
- evento de aplicación → en una etapa del ciclo global de la app

No compiten directamente. Resuelven necesidades distintas.

## Error común: usar eventos cuando un bean simple bastaba

A veces alguien descubre los eventos y empieza a resolver todo con listeners, incluso cosas que podrían haberse dejado de forma más directa en otra parte del sistema.

No toda necesidad de inicialización requiere escuchar un evento.

A veces una solución más sencilla es mejor.

## Error común: meter tareas pesadas en ApplicationReadyEvent sin pensar impacto

Que la aplicación ya esté lista no significa que sea buena idea disparar automáticamente procesos largos o costosos sin una estrategia clara.

Hay que seguir aplicando criterio.

## Error común: confundir “escuchar un evento” con “tener arquitectura desacoplada mágicamente”

Los eventos pueden ayudar a desacoplar, sí, pero si se usan sin orden también pueden hacer que el flujo del sistema quede demasiado disperso y difícil de seguir.

Por eso conviene que su uso sea intencional y no compulsivo.

## Un criterio práctico muy sano

Podés resumirlo así:

- si necesitás algo simple al inicio → runner puede servir
- si necesitás reaccionar a un momento técnico específico del ciclo de vida → evento
- si necesitás inicializar un bean individual → mirar el ciclo de vida del bean
- si la lógica crece demasiado → delegar y revisar el diseño

## Relación con Spring Boot

Spring Boot hace muy accesible la reacción a eventos del ciclo de vida, y eso encaja perfecto con su filosofía de dar herramientas listas para necesidades comunes del arranque, la preparación y el cierre.

Entender estos eventos te da una visión más madura del bootstrap de la aplicación.

Ya no pensás “la app arranca o no arranca” como si fuera un único instante.
Empezás a ver que hay etapas distintas, y que Spring puede exponértelas de forma útil.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> los eventos del ciclo de vida de Spring Boot permiten reaccionar a momentos específicos del arranque, la preparación, la disponibilidad, el fallo o el cierre de la aplicación, dando una precisión mayor que la de un runner para ubicar lógica técnica en el momento correcto.

## Resumen

- Spring Boot emite eventos durante distintas etapas del ciclo de vida.
- `@EventListener` permite reaccionar a esos eventos.
- `ApplicationReadyEvent` es uno de los más útiles para detectar que la app ya está lista.
- También hay eventos relacionados con fallos y cierre del contexto.
- Los eventos ofrecen más granularidad que `CommandLineRunner` o `ApplicationRunner`.
- Conviene usarlos con intención y delegar la lógica compleja.
- Son una herramienta muy útil para entender y modelar mejor el arranque de una aplicación real.

## Próximo tema

En el próximo tema vas a ver cómo crear un endpoint HTTP básico con `@RestController`, y ahí empieza el bloque donde Spring Boot deja de ser solo arranque y configuración para convertirse en una aplicación web que expone una API.
