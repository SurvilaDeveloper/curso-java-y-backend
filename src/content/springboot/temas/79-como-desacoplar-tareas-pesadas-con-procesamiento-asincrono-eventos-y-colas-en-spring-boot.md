---
title: "Cómo desacoplar tareas pesadas con procesamiento asíncrono, eventos y colas en Spring Boot"
description: "Entender por qué no todo conviene resolverse dentro de la misma request HTTP, y cómo usar procesamiento asíncrono, eventos y colas para desacoplar tareas pesadas, lentas o dependientes de sistemas externos."
order: 79
module: "Integraciones con servicios externos"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo recibir:

- webhooks
- callbacks
- notificaciones entrantes

desde servicios externos hacia tu backend Spring Boot.

Eso ya te mostró una idea muy importante:

> no todo ocurre dentro de la request original iniciada por tu frontend o tu cliente; muchas veces el sistema sigue recibiendo y procesando cosas más tarde.

Y enseguida aparece una pregunta muy natural:

> ¿qué pasa cuando una tarea no conviene hacerla completa dentro de la misma request HTTP?

Porque en backend real, muy rápido aparecen procesos que:

- tardan demasiado
- dependen de terceros
- pueden reintentarse
- no son críticos para responder de inmediato
- conviene ejecutar en segundo plano
- o directamente forman parte de un flujo más largo que una única request

Por ejemplo:

- enviar un email
- generar un PDF
- redimensionar imágenes
- sincronizar con un ERP
- procesar un webhook
- recalcular stock o métricas
- emitir una factura electrónica
- disparar notificaciones
- crear tareas de integración para un proveedor externo
- registrar eventos de auditoría pesados
- procesar un archivo grande

Ahí aparece un bloque muy importante del backend profesional:

- **procesamiento asíncrono**
- **eventos**
- **colas**
- **desacople del request principal**

Este tema es clave porque te ayuda a pasar de una mentalidad de “todo se resuelve en el mismo endpoint” a una arquitectura mucho más flexible y realista.

## El problema de querer hacer todo dentro de la misma request

Cuando uno empieza, es muy natural pensar así:

1. entra la request
2. hago todo lo que haya que hacer
3. recién respondo al cliente

Ese modelo sirve muy bien para muchísimos casos.
Pero empieza a romperse o a volverse incómodo cuando las tareas involucradas:

- tardan demasiado
- dependen de terceros lentos
- pueden fallar de forma intermitente
- no son necesarias para dar respuesta inmediata
- generan demasiado acoplamiento
- o simplemente hacen que el endpoint quede gigante y frágil

Entonces aparece una idea muy importante:

> no toda tarea del sistema tiene que completarse dentro del request principal para que el backend esté bien diseñado.

## Qué significa desacoplar una tarea

Dicho simple:

> significa separar una tarea del flujo inmediato de la request que la originó, para procesarla después o en otro componente, sin bloquear innecesariamente la respuesta principal.

Eso puede pasar de distintas formas.

Por ejemplo:

- ejecutar algo en segundo plano dentro del mismo sistema
- publicar un evento interno
- escribir una tarea para procesarla luego
- mandar un mensaje a una cola
- dejar registro de algo para que otro proceso lo tome

No hace falta que te cases todavía con una sola tecnología concreta.
Primero conviene entender bien el problema arquitectónico que querés resolver.

## Un ejemplo muy común: registro + email de bienvenida

Supongamos este caso de uso:

- el usuario se registra
- querés guardarlo en la base
- querés enviar email de bienvenida
- quizá además querés registrar auditoría
- quizá además querés crear integración con CRM

Si intentás hacer todo dentro del mismo request, el flujo puede quedar así:

1. validar request
2. guardar usuario
3. llamar proveedor de email
4. esperar respuesta
5. llamar integración externa
6. esperar respuesta
7. guardar auditoría
8. recién responder `201`

Eso puede volverse:

- lento
- frágil
- difícil de mantener
- demasiado sensible a fallos de terceros

Y ahí aparece una pregunta muy sana:

> ¿de verdad el cliente necesita esperar a que todo eso termine para considerar exitoso el registro?

Muchas veces la respuesta es no.

## Un ejemplo de mejor desacople

Podrías pensar algo así:

1. validar request
2. guardar usuario
3. registrar un evento o tarea interna
4. responder `201`
5. luego, por fuera del request principal:
   - enviar email
   - integrar con CRM
   - generar tareas complementarias

Eso ya cambia muchísimo la arquitectura del caso de uso.

## Qué gana el usuario final con esto

Muchas veces gana:

- menor latencia
- respuestas más rápidas
- menos riesgo de que una tarea secundaria rompa toda la operación principal
- una experiencia más fluida

Eso no significa que ahora “todo deba ser async”.
Significa que empezás a pensar mejor qué tareas son parte del núcleo inmediato del caso de uso y cuáles pueden vivir desacopladas.

## Qué es procesamiento asíncrono

Dicho de forma simple:

> es ejecutar una tarea sin obligar al request actual a esperar necesariamente a que termine toda esa tarea para responder.

La idea clave es la separación temporal:

- la request principal ocurre ahora
- cierta tarea se sigue procesando después o en paralelo
- el cliente no necesariamente espera ese resultado completo

Esto puede hacerse con distintos mecanismos, desde algo simple hasta algo más avanzado.

## Qué es un evento en este contexto

A nivel conceptual, un evento es una forma de expresar que:

> algo relevante pasó dentro del sistema.

Por ejemplo:

- `UsuarioRegistrado`
- `PedidoCreado`
- `PagoAprobado`
- `ArchivoSubido`
- `WebhookRecibido`
- `FacturaEmitida`

El valor de esto es que te permite modelar el sistema no solo por comandos directos, sino también por hechos ocurridos que otras partes pueden escuchar o procesar.

## Por qué los eventos ayudan tanto

Porque permiten desacoplar.

Por ejemplo, el caso de uso principal puede decir:

> se registró un usuario

Y luego otras partes pueden reaccionar a eso sin que el service principal tenga que saber todos los detalles.

Por ejemplo:

- enviar email
- registrar auditoría
- crear contacto en CRM
- emitir métrica
- disparar onboarding

Todo eso puede quedar menos acoplado si parte de un evento claro.

## Qué es una cola

A nivel simple, una cola es una estructura o mecanismo donde dejás trabajo pendiente para que otro proceso o componente lo consuma después.

Podés pensarlo así:

- alguien produce una tarea o mensaje
- esa tarea queda en espera
- otro consumidor la procesa después

Esto es muy útil cuando querés desacoplar aún más el productor del consumidor y hacer el sistema más resiliente o escalable.

No hace falta todavía entrar a todas las tecnologías posibles.
Lo importante es captar el patrón.

## Una intuición muy útil

Podés pensar estos tres niveles así:

### Procesamiento inmediato
Todo ocurre dentro del request.

### Evento interno
Algo pasó y otras partes del sistema reaccionan.

### Cola o mensajería
La tarea o mensaje queda desacoplado para ser procesado después por otro consumidor.

No son exactamente lo mismo, pero sí forman una familia de soluciones al mismo problema:
**no hacer todo pegado al request principal**.

## Cuándo conviene considerar desacople

Muchas veces conviene cuando la tarea es:

- secundaria respecto de la respuesta principal
- lenta
- propensa a fallos externos
- reintentable
- costosa
- no estrictamente necesaria para responder ya
- derivada de un hecho del dominio que puede disparar varias reacciones

Estas señales aparecen muchísimo en proyectos reales.

## Cuándo quizá no conviene desacoplar

No conviene desacoplar por reflejo todo.

Si una tarea es:

- pequeña
- crítica para la respuesta
- necesaria para garantizar consistencia inmediata
- simple y rápida

entonces meter eventos, colas o procesamiento asíncrono puede agregar complejidad innecesaria.

Este punto es muy importante:
no se trata de “hacer todo async”, sino de elegir bien.

## Un primer ejemplo conceptual con evento

Supongamos que después de registrar un usuario querés disparar un evento:

```java
public class UsuarioRegistradoEvent {

    private final Long usuarioId;
    private final String email;
    private final String username;

    public UsuarioRegistradoEvent(Long usuarioId, String email, String username) {
        this.usuarioId = usuarioId;
        this.email = email;
        this.username = username;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public String getEmail() {
        return email;
    }

    public String getUsername() {
        return username;
    }
}
```

Este objeto expresa claramente algo que ocurrió en tu dominio.

## Qué gana el sistema con un evento así

Que el caso de uso de registro puede quedar más enfocado en:

- validar
- crear usuario
- persistir
- publicar el hecho relevante

y otras partes pueden reaccionar después.

Eso evita que el service de registro tenga que convertirse en “el lugar donde vive todo”.

## Un service conceptual que publica el evento

```java
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final ApplicationEventPublisher eventPublisher;

    public AuthService(
            UsuarioRepository usuarioRepository,
            ApplicationEventPublisher eventPublisher
    ) {
        this.usuarioRepository = usuarioRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        Usuario usuario = new Usuario();
        usuario.setUsername(request.getUsername());
        usuario.setEmail(request.getEmail());

        Usuario guardado = usuarioRepository.save(usuario);

        eventPublisher.publishEvent(
                new UsuarioRegistradoEvent(
                        guardado.getId(),
                        guardado.getEmail(),
                        guardado.getUsername()
                )
        );

        RegisterResponse response = new RegisterResponse();
        response.setId(guardado.getId());
        response.setUsername(guardado.getUsername());
        response.setEmail(guardado.getEmail());
        response.setActivo(guardado.isActivo());

        return response;
    }
}
```

Este ejemplo ya muestra bastante bien el valor del patrón.

## Cómo leer este service

Podés leerlo así:

1. se ejecuta el caso de uso principal
2. se persiste el usuario
3. se publica el hecho “usuario registrado”
4. el service responde
5. otras partes del sistema pueden reaccionar a ese hecho

Esto es mucho más desacoplado que meter email, CRM, auditoría y métricas dentro del mismo método.

## Un listener conceptual

Por ejemplo, podrías tener algo así:

```java
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class UsuarioRegistradoListener {

    private final EmailGateway emailGateway;

    public UsuarioRegistradoListener(EmailGateway emailGateway) {
        this.emailGateway = emailGateway;
    }

    @EventListener
    public void onUsuarioRegistrado(UsuarioRegistradoEvent event) {
        emailGateway.enviarBienvenida(event.getEmail(), event.getUsername());
    }
}
```

Este ejemplo es muy simple, pero ya muestra algo valiosísimo:

- el registro no conoce los detalles del email
- el email reacciona al hecho del dominio
- el sistema queda mejor separado

## Qué problema podría seguir existiendo con esto

Aunque este patrón ya mejora bastante el desacople conceptual, si el procesamiento ocurre todavía demasiado pegado al flujo principal, puede que ciertos fallos sigan impactando.

Por eso conviene entender que hay niveles de desacople.
Publicar un evento interno ya ayuda mucho, pero no siempre resuelve todos los problemas de latencia o resiliencia que resolvería una cola real o un procesamiento más robusto.

Este matiz es importante.

## Un ejemplo muy típico donde conviene más desacople

Supongamos que recibís un webhook de pago.

El proveedor te llama.
Vos querés:

- validar la autenticidad
- registrar que llegó el evento
- actualizar orden
- emitir factura
- enviar email
- notificar a otro sistema
- registrar auditoría
- recalcular métricas

Hacer todo eso dentro del mismo request del webhook puede ser bastante riesgoso.

Ahí muchas veces tiene mucho sentido:

1. recibir rápido
2. persistir lo mínimo necesario
3. encolar o disparar procesamiento desacoplado
4. responder rápido al proveedor
5. seguir el trabajo luego

Este es uno de los grandes casos de uso del procesamiento asíncrono.

## Qué relación tiene esto con latencia

Total.

Una de las grandes razones para desacoplar tareas es no hacer que el usuario o el proveedor externo espere innecesariamente por procesos secundarios o pesados.

Por ejemplo:

- el usuario no quiere esperar 8 segundos para ver “registro exitoso”
- el proveedor de webhook no quiere esperar demasiado para considerar tu endpoint saludable
- tu sistema no quiere bloquear recursos por tareas que podrían correr después

La latencia real mejora muchísimo cuando separás bien responsabilidades temporales.

## Qué relación tiene esto con fallos externos

También muy fuerte.

Si una tarea secundaria depende de:

- email
- ERP
- storage
- facturación
- otro microservicio

y la metés dentro del request principal, el caso de uso entero puede volverse más frágil.

En cambio, si desacoplás, podés decidir mejor:

- reintentar luego
- marcar pendiente
- seguir sin bloquear la respuesta
- degradar el comportamiento
- separar éxito principal de tareas complementarias

Eso es una mejora enorme de diseño.

## Qué relación tiene esto con colas

Las colas suelen aparecer cuando querés un desacople más fuerte y explícito entre:

- quien produce la tarea
- y quien la consume

Por ejemplo:

- el request principal produce un mensaje
- otro consumidor procesa ese mensaje después

Esto ayuda mucho cuando necesitás:

- reintentos más controlados
- separación más fuerte
- procesamiento más robusto
- consumidores independientes
- mejor tolerancia a picos o fallos temporales

No hace falta todavía implementar una cola concreta en este tema.
Lo importante es entender qué problema arquitectónico resuelve.

## Un ejemplo mental sencillo de cola

Podés pensar algo así:

1. `PedidoCreado`
2. se escribe una tarea “emitir factura”
3. esa tarea queda pendiente
4. otro proceso o componente la consume
5. si falla, puede reintentarse sin romper el pedido principal

Este patrón aparece muchísimo en sistemas reales.

## Qué relación tiene esto con consistencia

Muy fuerte.

Cuando desacoplás, aceptás algo importante:

> no todo el sistema va a reflejar el estado final absoluto en el mismo milisegundo.

Es decir, pueden existir estados intermedios razonables como:

- usuario registrado, email pendiente
- pedido creado, factura pendiente
- pago aprobado, notificación pendiente
- webhook recibido, procesamiento completo pendiente

Esto introduce una noción más rica de consistencia y estado del sistema.

No hace falta que ahora te metas en toda la teoría.
Pero sí conviene notar que el desacople temporal cambia la forma de pensar consistencia.

## Qué relación tiene esto con el dominio

Muchísima.

Porque para desacoplar bien conviene pensar qué hechos del dominio son realmente relevantes.

Por ejemplo:

- `UsuarioRegistrado`
- `PedidoCreado`
- `PagoAprobado`
- `WebhookDePagoRecibido`
- `ArchivoImportado`

Estos eventos hablan el lenguaje de tu sistema.
Y eso es muchísimo mejor que disparar tareas sueltas sin una semántica clara.

## Qué relación tiene esto con testing

Muy fuerte también.

Aparecen preguntas nuevas como:

- ¿el caso de uso publica el evento correcto?
- ¿el listener reacciona bien?
- ¿si la tarea desacoplada falla, no rompe el caso principal?
- ¿el estado queda bien marcado como pendiente cuando corresponde?
- ¿qué pasa si el mismo evento se procesa dos veces?
- ¿cómo verifico el comportamiento asíncrono sin volver locos los tests?

Esto muestra que el testing de estos patrones también tiene su propia complejidad y valor.

## Qué relación tiene esto con observabilidad

Muchísima.

Cuando el trabajo ya no ocurre todo dentro del mismo request, se vuelve más importante poder ver cosas como:

- qué evento se publicó
- qué tarea quedó pendiente
- qué consumidor la tomó
- cuánto tardó
- si falló
- si se reintentó
- qué entidad local estaba involucrada

Porque si no, el sistema puede volverse una caja negra difícil de seguir.

## Qué no conviene hacer

No conviene desacoplar por moda cualquier cosa pequeña.

Tampoco conviene dejar todo síncrono por costumbre cuando ya claramente está causando:

- latencia alta
- fragilidad
- acoplamiento
- timeouts
- y requests gigantes

La clave está en elegir bien.

## Otro error común

Usar eventos o tareas asíncronas sin semántica clara, como si fueran simples “disparos mágicos”.
Eso después vuelve el sistema más difícil de entender y depurar.

## Otro error común

Pensar que porque una tarea es secundaria, entonces no importa si falla y nadie se entera.
No.
Las tareas desacopladas también necesitan:

- logs
- estados
- visibilidad
- estrategia de retry o manejo de error

## Otro error común

No distinguir entre:
- tarea crítica inmediata
- tarea complementaria desacoplable

Esa distinción es una de las decisiones de arquitectura más importantes del tema.

## Una buena heurística

Podés preguntarte:

- ¿el usuario realmente necesita esperar esta tarea?
- ¿esta tarea depende de terceros lentos o frágiles?
- ¿si falla, debe romper la operación principal?
- ¿conviene modelarla como reacción a un evento?
- ¿tendría sentido ponerla en una cola?
- ¿necesito un estado intermedio como pendiente?

Responder esto te ayuda muchísimo a decidir si el desacople tiene sentido.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque apenas el backend empieza a crecer y a hablar con terceros, muy rápido aparecen tareas que no conviene resolver enteras dentro del request original.

Entonces este bloque no es una rareza avanzada.
Es uno de los caminos más naturales hacia un backend más robusto y profesional.

## Relación con Spring Boot

Spring Boot te da una base muy cómoda para modelar eventos, listeners y procesamiento interno.
Y después, según cómo evolucione tu sistema, podés ir combinando eso con estrategias más avanzadas de mensajería, colas y procesamiento desacoplado.

Lo importante primero no es la herramienta puntual.
Es entender por qué **desacoplar temporalmente** una tarea puede ser una mejora enorme de arquitectura.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> cuando una tarea es pesada, lenta, reintentable o secundaria respecto de la respuesta principal, muchas veces conviene desacoplarla del request HTTP usando eventos, procesamiento asíncrono o colas, para reducir latencia, bajar acoplamiento y diseñar un backend que tolere mejor fallos y flujos más largos que una sola request.

## Resumen

- No todo conviene resolverse dentro del mismo request HTTP.
- Eventos ayudan a expresar hechos relevantes del dominio y a desacoplar reacciones secundarias.
- Procesamiento asíncrono y colas permiten separar temporalmente tareas pesadas o frágiles.
- Esto suele mejorar latencia, resiliencia y claridad del caso de uso principal.
- También introduce nuevas preguntas sobre consistencia, observabilidad y testing.
- No conviene usar estos patrones por moda, sino donde realmente resuelven un problema.
- Este tema marca una transición muy importante hacia arquitecturas backend más maduras y realistas.

## Próximo tema

En el próximo tema vas a ver cómo usar Spring Boot para enviar emails o notificaciones como una integración externa concreta, porque es uno de los primeros casos prácticos donde se nota muchísimo el valor de encapsular, desacoplar y manejar bien tareas secundarias.
