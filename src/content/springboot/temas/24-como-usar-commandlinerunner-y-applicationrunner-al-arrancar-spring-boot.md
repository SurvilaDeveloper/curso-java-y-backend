---
title: "Cómo usar CommandLineRunner y ApplicationRunner al arrancar Spring Boot"
description: "Entender qué son CommandLineRunner y ApplicationRunner, cómo permiten ejecutar lógica al inicio de la aplicación y en qué casos conviene usarlos sin volver caótico el arranque."
order: 24
module: "Arranque y ciclo de vida de la aplicación"
level: "base"
draft: false
---

Hasta ahora viste cómo Spring Boot:

- crea el contexto
- registra beans
- resuelve dependencias
- carga configuración
- aplica perfiles
- valida propiedades

Todo eso ocurre durante el arranque de la aplicación.

Pero a veces aparece una necesidad extra:

- querés ejecutar una acción justo después de que la app arranca
- querés mostrar información útil
- querés sembrar datos iniciales
- querés validar algo del entorno
- querés disparar una tarea de inicialización controlada

La pregunta entonces es:

> ¿cómo ejecutar lógica propia una vez que Spring Boot ya levantó la aplicación?

Spring Boot ofrece mecanismos muy conocidos para eso:

- `CommandLineRunner`
- `ApplicationRunner`

Ambos permiten ejecutar código al inicio, cuando el contexto ya está creado y los beans ya están disponibles.

## La idea general

Estas herramientas sirven para correr lógica una vez que la aplicación ya arrancó lo suficiente como para usar el contenedor de Spring.

Dicho de forma simple:

> son puntos de entrada para ejecutar código inmediatamente después del bootstrap del contexto.

Eso los vuelve útiles para muchas tareas de inicio.

## Cuándo puede hacer falta algo así

Hay muchos casos donde tiene sentido ejecutar lógica al arrancar:

- imprimir información relevante del entorno
- cargar datos iniciales en una base
- verificar presencia de ciertos recursos
- disparar una inicialización técnica
- lanzar una tarea única de preparación
- inspeccionar argumentos de arranque
- preparar caches
- ejecutar migraciones internas no críticas
- correr tareas de diagnóstico

No significa que toda app necesite esto, pero es una herramienta muy común y muy útil.

## Qué es `CommandLineRunner`

`CommandLineRunner` es una interfaz sencilla de Spring Boot que permite ejecutar lógica recibiendo los argumentos de arranque como un arreglo de strings.

Ejemplo básico:

```java
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class InicioRunner implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        System.out.println("La aplicación arrancó correctamente");
    }
}
```

Cuando la aplicación inicia, Spring Boot detecta este bean y ejecuta el método `run`.

## Qué significa eso en la práctica

No tenés que llamar el runner manualmente.

Spring Boot lo invoca como parte del proceso de arranque, después de que el contexto ya está listo para que uses beans inyectados.

Eso significa que dentro del runner podés apoyarte en servicios del sistema.

Por ejemplo:

```java
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class InicioRunner implements CommandLineRunner {

    private final UsuarioService usuarioService;

    public InicioRunner(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @Override
    public void run(String... args) {
        usuarioService.inicializar();
    }
}
```

Acá el runner usa un servicio como cualquier otro bean.

## Qué son esos `args`

`CommandLineRunner` recibe los argumentos pasados al arrancar la aplicación.

Por ejemplo, si conceptualmente arrancaras la app con algo como:

```text
--modo=demo --debug=true
```

esos argumentos llegarían al método `run(String... args)` como strings.

Eso puede ser útil si querés interpretar parámetros de arranque específicos.

## Qué es `ApplicationRunner`

`ApplicationRunner` es una interfaz muy parecida a `CommandLineRunner`, pero en lugar de recibir un arreglo simple de strings, recibe un objeto `ApplicationArguments`.

Ejemplo:

```java
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class InicioRunner implements ApplicationRunner {

    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println("La aplicación inició");
    }
}
```

La diferencia principal es que `ApplicationRunner` da una forma un poco más estructurada de trabajar con argumentos.

## Diferencia conceptual entre ambos

Podés pensarlo así:

### `CommandLineRunner`
- más simple
- recibe `String... args`
- útil para casos directos

### `ApplicationRunner`
- más expresivo
- recibe `ApplicationArguments`
- más cómodo si querés inspeccionar opciones y argumentos de forma estructurada

En muchos usos simples, cualquiera de los dos puede servir.

## Cuándo usar uno y cuándo el otro

Una guía práctica podría ser esta:

- si solo necesitás ejecutar una acción al iniciar y no te importan mucho los argumentos, `CommandLineRunner` suele alcanzar
- si querés trabajar mejor con argumentos nombrados u opciones, `ApplicationRunner` suele resultar más cómodo

No es una diferencia dramática, pero sí conviene conocer ambas variantes.

## Un ejemplo mínimo con `ApplicationRunner`

```java
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class ArgumentosRunner implements ApplicationRunner {

    @Override
    public void run(ApplicationArguments args) {
        System.out.println("Opciones: " + args.getOptionNames());
    }
}
```

Esto ya te deja entrever que `ApplicationArguments` permite una interacción más rica con los parámetros de arranque.

## Momento del ciclo de vida en que se ejecutan

Este punto es muy importante.

Los runners se ejecutan cuando la aplicación ya está bastante avanzada en el proceso de arranque:

- el contexto fue creado
- los beans fueron registrados
- las dependencias fueron inyectadas
- la configuración ya fue cargada

Eso hace que el runner sea un buen lugar para usar servicios o componentes del sistema.

Pero también significa que, si algo falla dentro del runner, el arranque puede verse afectado.

## Para qué usos encaja bien

Estas herramientas suelen encajar bien en casos como:

- inicializaciones pequeñas y claras
- mensajes de arranque útiles
- verificación de estado
- carga de datos de prueba o demo
- tareas únicas de setup interno
- arranque de procesos controlados
- validaciones técnicas después del bootstrap

Lo importante es que sean responsabilidades razonables para la fase de inicio.

## Un ejemplo típico: sembrar datos iniciales

Supongamos que querés cargar algunos datos cuando la aplicación arranca.

```java
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DatosInicialesRunner implements CommandLineRunner {

    private final CategoriaService categoriaService;

    public DatosInicialesRunner(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @Override
    public void run(String... args) {
        categoriaService.crearCategoriasIniciales();
    }
}
```

Esto puede ser útil en un entorno de demo, desarrollo o ciertas aplicaciones internas.

## Otro caso: imprimir información útil

```java
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class InfoArranqueRunner implements CommandLineRunner {

    private final Environment environment;

    public InfoArranqueRunner(Environment environment) {
        this.environment = environment;
    }

    @Override
    public void run(String... args) {
        System.out.println("Aplicación iniciada en puerto: " + environment.getProperty("server.port"));
    }
}
```

No es obligatorio hacerlo así, pero muestra un caso razonable y fácil de entender.

## Otro caso: chequeo de recursos

También puede servir para validar que alguna dependencia crítica esté lista.

Por ejemplo, verificar que:

- exista un directorio
- haya acceso a un recurso
- una configuración derivada tenga sentido
- un componente técnico esté operativo

Siempre con cuidado de no convertir el runner en un gran bloque confuso de lógica.

## Los runners son beans

Esto es clave.

Un runner no es un “script suelto”.

Sigue siendo un bean administrado por Spring.

Por eso podés:

- inyectarle dependencias
- aplicarle perfiles
- ordenarlo
- dividir responsabilidades
- integrarlo con el resto del sistema

Eso hace que la lógica de inicio siga formando parte del modelo general del contenedor.

## Puede haber más de un runner

Sí, pueden existir varios runners en la misma aplicación.

Por ejemplo:

- uno para logs iniciales
- otro para carga de datos
- otro para validación técnica
- otro para una tarea puntual de setup

No estás limitado a uno solo.

Pero justamente por eso conviene ordenar bien sus responsabilidades.

## Qué pasa si hay varios

Si existen varios runners, Spring Boot los ejecuta.

Y si necesitás controlar el orden, podés usar herramientas como `@Order`.

Por ejemplo:

```java
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.boot.CommandLineRunner;

@Component
@Order(1)
public class PrimerRunner implements CommandLineRunner {

    @Override
    public void run(String... args) {
        System.out.println("Primer runner");
    }
}
```

```java
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.boot.CommandLineRunner;

@Component
@Order(2)
public class SegundoRunner implements CommandLineRunner {

    @Override
    public void run(String... args) {
        System.out.println("Segundo runner");
    }
}
```

Esto permite un poco más de control cuando el arranque necesita pasos ordenados.

## Cuándo el orden importa

El orden puede importar si:

- un runner prepara datos que otro usa
- uno valida algo antes de permitir otra acción
- una inicialización depende de otra
- querés una secuencia clara de bootstrap

De todos modos, si el orden empieza a volverse demasiado delicado, puede ser una señal de que la estrategia de arranque necesita simplificarse.

## `ApplicationRunner` y argumentos nombrados

Una ventaja interesante de `ApplicationRunner` es que trabaja mejor con argumentos nombrados.

Por ejemplo, conceptualmente podrías inspeccionar si se pasó algo como:

```text
--seed=true
--modo=demo
```

Y decidir ejecutar cierta lógica solo si ese flag existe.

Eso lo vuelve especialmente útil para tareas de arranque opcionales o modos especiales de ejecución.

## Un ejemplo conceptual con argumentos

```java
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class SeedRunner implements ApplicationRunner {

    @Override
    public void run(ApplicationArguments args) {
        if (args.containsOption("seed")) {
            System.out.println("Ejecutando carga inicial");
        }
    }
}
```

Esto muestra una idea muy práctica: no toda lógica de arranque tiene por qué correr siempre.

## Relación con perfiles

Los runners también pueden condicionarse por perfil.

Por ejemplo:

```java
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.boot.CommandLineRunner;

@Component
@Profile("dev")
public class DatosDemoRunner implements CommandLineRunner {

    @Override
    public void run(String... args) {
        System.out.println("Cargando datos demo");
    }
}
```

Esto es muy útil para evitar que ciertas tareas de inicio se ejecuten en producción cuando solo tenían sentido en desarrollo.

## Un uso muy razonable: seed en desarrollo

Uno de los usos más típicos es cargar datos demo solo en `dev` o `test`.

Por ejemplo:

- usuarios de prueba
- categorías base
- productos de ejemplo
- configuración de demostración

Eso puede ahorrar muchísimo tiempo al desarrollar, siempre que esté bien aislado por perfil.

## Cuándo conviene ser prudente

Aunque estas herramientas son muy prácticas, también son fáciles de abusar.

El arranque de la aplicación puede volverse frágil si ahí empezás a meter:

- demasiada lógica de negocio
- procesos largos
- integraciones pesadas
- operaciones riesgosas
- secuencias muy complejas
- condiciones difíciles de entender

Entonces, una buena pregunta siempre es:

> ¿esto realmente pertenece al arranque de la app?

## Señales de buen uso

Suelen ser señales de buen uso cuando el runner:

- hace una tarea acotada
- tiene una responsabilidad clara
- no es excesivamente largo
- depende de pocos componentes
- no está lleno de condiciones enredadas
- se puede explicar en una frase simple

Por ejemplo:

- “carga datos demo si está en dev”
- “muestra info de arranque”
- “valida un recurso local”
- “ejecuta una preparación puntual”

## Señales de mal uso

Suelen ser señales problemáticas cuando el runner:

- concentra demasiadas decisiones
- dispara lógica de negocio pesada
- intenta reemplazar un scheduler
- hace procesamiento largo de fondo
- depende de medio sistema
- requiere orden frágil entre muchos runners
- se vuelve difícil de testear o entender

En esos casos, probablemente el arranque está cargando responsabilidades que deberían vivir en otro lugar.

## Un ejemplo de runner demasiado pesado

Imaginá un runner que:

- valida treinta cosas
- llama varias APIs externas
- crea datos de negocio
- recalcula reportes
- dispara colas
- depende del perfil, de flags y de múltiples argumentos
- tarda minutos en completar

Eso ya no suena como una inicialización liviana y controlada.

Suena más bien como un subsistema entero metido dentro del arranque.

## Qué pasa si un runner falla

Este punto es clave.

Si un runner lanza una excepción y no se maneja adecuadamente, la aplicación puede fallar en su arranque.

Eso a veces está bien, si la tarea era realmente esencial.

Pero otras veces puede ser demasiado costoso si el runner solo hacía algo secundario.

Entonces conviene pensar:

- ¿esta tarea es obligatoria para que la app arranque?
- ¿o es conveniente, pero no crítica?

La respuesta cambia la forma en que deberías diseñarla.

## Diferencia entre tarea obligatoria y tarea opcional

### Tarea obligatoria
Si falla, la app no debería seguir.

Por ejemplo:
- validación crítica del entorno
- requisito indispensable para operar

### Tarea opcional
Si falla, quizá podés loguearlo o degradar el comportamiento sin tirar abajo toda la app.

Por ejemplo:
- carga de datos demo
- mensaje de arranque especial
- inicialización no esencial

Entender esa diferencia ayuda a decidir qué lugar debería ocupar realmente la tarea.

## Runner no es sinónimo de “startup event” universal

Aunque mucha gente resuelve cosas con runners, no son la única manera de reaccionar al arranque.

Más adelante vas a ver que Spring también tiene eventos del ciclo de vida de la aplicación.

Por ahora, los runners son un excelente primer punto para entender la idea de ejecutar lógica al inicio de forma simple y concreta.

## Cómo se relaciona esto con el diseño general

Un principio muy sano sería este:

> el arranque debería preparar la aplicación para trabajar, no convertirse en un segundo sistema paralelo.

Eso significa que los runners pueden ayudar mucho, pero conviene usarlos con foco.

La aplicación debería seguir manteniendo sus responsabilidades principales en servicios, componentes, jobs o mecanismos adecuados, no apilar todo en el bootstrap.

## Error común: meter lógica de negocio pesada en un runner

Esto es muy frecuente.

Como el runner “funciona”, alguien empieza a poner ahí cosas que en realidad pertenecen a otro flujo.

Eso puede volver el inicio:

- lento
- frágil
- impredecible
- difícil de mantener

## Error común: cargar datos demo también en producción

Si usás runners para seed de datos, casi siempre conviene protegerlos con perfil, flags o ambas cosas.

No querés que por accidente una lógica pensada para desarrollo corra en producción.

## Error común: depender de ordenes demasiado enredados entre runners

Si necesitás cinco runners encadenados con dependencias implícitas delicadas, puede ser una señal de diseño mejorable.

A veces es preferible:
- simplificar
- consolidar
- mover responsabilidades
- o usar otro mecanismo más adecuado

## Error común: hacer tareas largas que bloquean el arranque sin necesidad

No toda tarea que corre al principio debe ejecutarse obligatoriamente antes de que la app quede disponible.

A veces conviene pensar si cierta tarea no debería dispararse de otra forma o con otro mecanismo.

## Un criterio práctico muy sano

Podés resumirlo así:

- tareas pequeñas y claras al inicio → runner
- tareas opcionales condicionadas por perfil o argumentos → runner puede servir muy bien
- tareas pesadas, repetitivas o de negocio complejo → probablemente convenga otro enfoque

## Relación con Spring Boot

`CommandLineRunner` y `ApplicationRunner` encajan muy bien con la filosofía de Spring Boot de ofrecer mecanismos simples para necesidades comunes del ciclo de vida de la aplicación.

No están pensados para reemplazar toda otra forma de orquestación, pero sí resuelven muy bien esa necesidad concreta de:

- “la app ya arrancó, ahora quiero ejecutar algo propio”

Entenderlos te ayuda a pasar de una app que simplemente levanta a una app que también puede prepararse mejor al iniciar.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> `CommandLineRunner` y `ApplicationRunner` permiten ejecutar lógica propia una vez que Spring Boot ya levantó el contexto, y son muy útiles para tareas de inicio acotadas, siempre que no conviertas el arranque en un lugar sobrecargado y difícil de mantener.

## Resumen

- `CommandLineRunner` y `ApplicationRunner` ejecutan lógica al iniciar la aplicación.
- Ambos son beans administrados por Spring.
- `CommandLineRunner` trabaja con `String... args`.
- `ApplicationRunner` usa `ApplicationArguments`, más estructurados.
- Sirven para inicialización, logs, seeds, chequeos o tareas de bootstrap acotadas.
- Puede haber varios runners y ordenarse con `@Order`.
- Conviene usarlos con criterio para no sobrecargar el arranque ni mezclar responsabilidades.

## Próximo tema

En el próximo tema vas a ver los eventos principales del ciclo de vida de una aplicación Spring Boot y cómo permiten reaccionar a distintos momentos del arranque y del cierre con más granularidad que un runner.
