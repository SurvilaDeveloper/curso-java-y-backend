---
title: "Observabilidad básica: logs, métricas y health checks"
description: "Cómo empezar a observar una aplicación Spring Boot en ejecución usando logs, métricas y health checks para entender mejor su estado y detectar problemas."
order: 52
module: "Operación y mantenimiento"
level: "intermedio"
draft: false
---

## Introducción

Hasta ahora ya recorriste una parte muy fuerte del backend con Java y Spring Boot:

- controllers
- services
- DTOs
- validaciones
- manejo de errores
- repository
- JPA
- Hibernate
- testing
- seguridad
- JWT
- refresh tokens
- despliegue
- Docker

Eso ya te permite construir una aplicación bastante seria.

Pero cuando una aplicación empieza a correr de verdad, aparece una pregunta muy importante:

**¿cómo sabés qué está pasando dentro de ella?**

Por ejemplo:

- ¿arrancó bien?
- ¿está respondiendo?
- ¿falló la conexión a la base?
- ¿hay errores repetidos?
- ¿está lenta?
- ¿está viva pero degradada?

Ahí entra la observabilidad.

## Qué es observabilidad

Observabilidad es la capacidad de entender qué está ocurriendo dentro de un sistema a partir de señales que ese sistema emite.

Dicho simple:

observabilidad te ayuda a mirar tu aplicación mientras está corriendo y a razonar mejor sus problemas, su estado y su comportamiento.

## La idea general

En desarrollo local muchas veces resolvés cosas así:

- corrés la app
- mirás la consola
- hacés requests
- intuís qué pasa

Eso alcanza al principio.

Pero en una aplicación real, eso no basta.

Necesitás herramientas y señales más claras para responder preguntas como:

- si la app está sana
- si un endpoint está fallando
- si una dependencia externa se cayó
- si algo está tardando demasiado
- si un error empezó a crecer

## Tres pilares introductorios

En esta etapa conviene enfocarse en tres pilares básicos:

- logs
- métricas
- health checks

No son lo único que existe en observabilidad, pero sí una base excelente para empezar.

## Logs

Los logs son mensajes que la aplicación emite para registrar lo que está ocurriendo.

Por ejemplo:

- arranque exitoso
- error al conectar a la base
- login fallido
- excepción inesperada
- operación importante del negocio
- advertencias

## Métricas

Las métricas son valores numéricos que ayudan a medir comportamiento del sistema.

Por ejemplo:

- cantidad de requests
- tiempo de respuesta
- uso de memoria
- cantidad de errores
- cantidad de conexiones activas

## Health checks

Los health checks son chequeos de salud de la aplicación.

Sirven para responder preguntas como:

- ¿la app está levantada?
- ¿la base responde?
- ¿el sistema está listo para recibir tráfico?
- ¿alguna dependencia importante está caída?

## Por qué esto importa tanto

Porque una app real no solo tiene que existir:
también tiene que poder observarse.

Si no podés ver qué pasa, diagnosticar se vuelve mucho más difícil.

## Logs: la primera señal básica

La puerta más natural de entrada a observabilidad suelen ser los logs.

Un log es una línea o conjunto de líneas que registra algo relevante del sistema.

Por ejemplo:

- inicio de aplicación
- carga de configuración
- error de negocio
- excepción
- request importante
- warning

## Qué hace valioso a un log

No cualquier mensaje suma valor.

Un buen log suele ser:

- claro
- útil
- contextual
- específico
- proporcional al evento

## Mal log vs buen log

### Malo

```text
Error
```

### Mejor

```text
Error al crear la orden: stock insuficiente para productId=15
```

El segundo ayuda mucho más a entender qué pasó.

## Niveles de log

En Java y Spring Boot es muy común trabajar con niveles como:

- `TRACE`
- `DEBUG`
- `INFO`
- `WARN`
- `ERROR`

## `INFO`

Se usa para eventos normales importantes.

Por ejemplo:

- app arrancó
- operación completada
- login exitoso, según criterio

## `DEBUG`

Se usa para detalle técnico útil en debugging, pero que suele ser demasiado verboso para producción constante.

## `WARN`

Se usa para situaciones anómalas que no rompen todo, pero merecen atención.

## `ERROR`

Se usa para errores reales que impiden o dañan una operación.

## `TRACE`

Es aún más detallado que `DEBUG` y suele usarse muy poco fuera de diagnósticos específicos.

## Logging en Spring Boot

Spring Boot trae soporte muy cómodo para logging.

Es muy común usar un logger así:

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ProductService {
    private static final Logger log = LoggerFactory.getLogger(ProductService.class);
}
```

## Ejemplo simple

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);

    public void createProduct(String name, double price) {
        log.info("Creando producto con name={} y price={}", name, price);

        if (price < 0) {
            log.warn("Se intentó crear un producto con precio negativo: {}", price);
            throw new IllegalArgumentException("El precio no puede ser negativo");
        }

        log.info("Producto creado correctamente");
    }
}
```

## Qué tiene de bueno este ejemplo

Muestra varias ideas útiles:

- log informativo al iniciar una operación
- log de advertencia ante un caso inválido
- log final de operación exitosa

## Por qué usar placeholders

En vez de concatenar strings así:

```java
log.info("Creando producto " + name);
```

es mejor usar placeholders:

```java
log.info("Creando producto {}", name);
```

Eso suele ser más limpio y más eficiente.

## Qué no conviene loguear

No conviene loguear sin cuidado datos sensibles como:

- contraseñas
- tokens JWT completos
- refresh tokens
- secretos
- datos privados innecesarios
- información que pueda comprometer seguridad

Esto es muy importante.

## Dónde conviene poner logs

No conviene loguear absolutamente todo.

Conviene priorizar cosas como:

- inicio y fin de operaciones importantes
- errores
- warnings relevantes
- interacciones críticas con dependencias
- eventos importantes de negocio
- arranque y apagado de la app

## Qué pasa si logueás demasiado

Demasiados logs pueden volver más difícil ver lo importante.

La observabilidad no mejora solo por “más ruido”.
Mejora por señales útiles.

## Métricas

Pasemos a métricas.

Las métricas ayudan a medir el comportamiento del sistema con números.

Eso es muy útil porque permite ver tendencias, no solo eventos sueltos.

## Ejemplos típicos de métricas

- cantidad total de requests
- requests por segundo
- errores por segundo
- latencia promedio
- uso de memoria
- uso de CPU
- tiempo de respuesta por endpoint
- cantidad de usuarios activos, según el caso

## Qué ventaja tienen sobre logs

Los logs cuentan historias puntuales.
Las métricas muestran comportamiento agregado.

Por ejemplo:

- un log te dice que hubo un error
- una métrica te puede mostrar que los errores subieron 20 veces en los últimos minutos

Ambas cosas se complementan muy bien.

## Spring Boot Actuator

En el ecosistema Spring Boot, una de las herramientas más importantes para observabilidad básica es:

**Spring Boot Actuator**

Actuator expone endpoints útiles para monitoreo y operación.

## Qué suele ofrecer Actuator

Dependiendo de configuración, Actuator puede exponer cosas como:

- health
- metrics
- info
- env
- beans
- mappings
- entre otros

## Dependencia típica

En Maven suele agregarse algo así:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

## Qué gana tu proyecto con eso

Gana una base muy valiosa de observabilidad sin tener que construir todo desde cero.

## Health checks

Uno de los endpoints más importantes de Actuator es el de health.

Suele estar en algo como:

```text
/actuator/health
```

## Qué responde

De forma simple, puede responder si la aplicación está:

- `UP`
- `DOWN`
- o en algún otro estado según configuración y componentes

## Ejemplo conceptual de respuesta

```json
{
  "status": "UP"
}
```

## Qué utilidad tiene eso

Muchísima.

Permite que:

- vos mismo verifiques salud básica
- una plataforma sepa si la app está viva
- un balanceador o sistema de despliegue detecte si puede enrutar tráfico
- una herramienta de monitoreo vea estado general

## Health y dependencias

Un health check puede incluir no solo “la app vive”, sino también si ciertas dependencias responden.

Por ejemplo:

- base de datos
- disco
- servicios auxiliares
- cache, según integración

## Ejemplo mental

Puede pasar algo así:

- app arrancó
- pero la base no responde

En ese caso, un health check más completo podría reflejar que el sistema no está realmente sano.

## Liveness y readiness

En entornos más avanzados, especialmente con contenedores y orquestación, aparece mucho esta distinción:

- liveness
- readiness

## Liveness

Pregunta:
**¿la app está viva?**

## Readiness

Pregunta:
**¿la app está lista para recibir tráfico?**

No siempre significan lo mismo.

Una app puede estar viva pero no lista, por ejemplo si todavía no terminó de inicializar o si una dependencia crítica está caída.

## Métricas con Actuator

Actuator también puede exponer métricas.

Por ejemplo, según configuración e integración, podés observar cosas como:

- memoria
- threads
- requests HTTP
- tiempo de respuesta
- garbage collection
- uso del sistema

## Endpoint de métricas

Suele haber algo como:

```text
/actuator/metrics
```

Y desde ahí consultar métricas específicas.

## Ejemplo mental de métricas

Podrías encontrar cosas relacionadas con:

- `jvm.memory.used`
- `http.server.requests`
- `system.cpu.usage`

No hace falta memorizar nombres concretos ahora.
Lo importante es entender el tipo de información disponible.

## Qué valor tiene esto en un proyecto real

Muchísimo.

Porque te empieza a permitir responder preguntas como:

- ¿la app está lenta?
- ¿hay un endpoint problemático?
- ¿el uso de memoria subió?
- ¿están creciendo los errores?

## Info endpoint

Otro endpoint útil suele ser:

```text
/actuator/info
```

Ahí podés exponer información general de la aplicación.

Por ejemplo:

- nombre
- versión
- entorno
- build info

Eso puede ser muy útil para debugging operativo.

## Configuración de exposición

No todos los endpoints de Actuator deberían exponerse sin pensar.

Es importante decidir qué exponer y en qué entorno.

Ejemplo conceptual en `application.properties`:

```properties
management.endpoints.web.exposure.include=health,info,metrics
```

## Qué expresa esto

Que querés exponer esos endpoints concretos por web.

## Por qué hay que pensarlo bien

Porque algunos endpoints pueden revelar demasiada información si se exponen sin control, especialmente en producción.

## Logs + métricas + health checks juntos

Estos tres elementos se complementan muy bien:

### Logs

Te ayudan a entender eventos puntuales y errores concretos.

### Métricas

Te ayudan a ver tendencias y comportamiento agregado.

### Health checks

Te ayudan a saber si el sistema está vivo y sano.

Juntos forman una base muy buena de observabilidad inicial.

## Ejemplo de problema real

Supongamos que usuarios dicen:
“La API está lenta”.

Con solo intuición eso es difícil de diagnosticar.

Pero con observabilidad podrías mirar cosas como:

- logs de errores o timeouts
- métricas de latencia
- health de la base
- uso de memoria o CPU
- comportamiento del endpoint afectado

Ahí la app se vuelve mucho más legible operativamente.

## Logging estructurado mentalmente

No hace falta ir enseguida a setups super avanzados, pero conviene empezar a pensar los logs con cierta estructura.

Por ejemplo:

- qué operación pasa
- qué recurso está implicado
- qué identificador es relevante
- qué resultado hubo
- si hubo error, cuál

Eso mejora mucho el valor del log.

## Ejemplo mejorado

```java
log.info("Creando orden para userId={} con {} items", userId, items.size());
```

Eso aporta mucho más contexto que un simple:

```java
log.info("Creando orden");
```

## Observabilidad y errores globales

Tu manejo global de errores también puede integrarse con observabilidad.

Por ejemplo:

- registrar ciertos errores relevantes
- evitar silenciar problemas
- distinguir errores esperados de errores inesperados

Eso mejora muchísimo la capacidad de diagnóstico.

## Observabilidad y seguridad

También hay que pensar observabilidad con criterio de seguridad.

Por ejemplo:

sí conviene loguear:

- intentos fallidos de autenticación, con contexto razonable
- accesos denegados importantes
- errores de autorización relevantes

pero no conviene exponer:

- secretos
- tokens completos
- credenciales

## Observabilidad y testing

Incluso en tests o debugging local, los logs y los endpoints de Actuator pueden ayudarte a entender mejor si el sistema se comporta como esperabas.

No reemplazan tests, pero ayudan mucho a diagnosticar.

## Qué no hacer

No conviene pensar observabilidad como algo que “se agrega recién cuando explota todo en producción”.

Cuanto antes tengas señales mínimas sanas, mejor.

No hace falta una plataforma enorme de monitoreo desde el día uno, pero sí una base razonable.

## Ejemplo conceptual de configuración útil

```properties
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=always
```

## Qué muestra esto

Que estás permitiendo observar:

- salud
- información básica
- métricas

Y que el endpoint de health puede mostrar más detalle.

## Cuidado con `show-details`

En producción conviene pensar bien cuánto detalle mostrar y a quién, porque demasiada información puede no ser buena idea si queda pública.

## Cómo se conecta con Docker y despliegue

Esto conecta muy fuerte con lo anterior.

Cuando desplegás una app y la corrés en Docker o en otro entorno real, necesitás saber:

- si arrancó
- si responde
- si algo está fallando
- si puede recibir tráfico
- si consume recursos de forma razonable

La observabilidad te da justamente esa visibilidad.

## Buenas prácticas iniciales

## 1. Empezar con logs claros

No hace falta loguear todo, pero sí lo importante.

## 2. Usar Actuator al menos para health e info

Eso ya suma muchísimo.

## 3. Exponer métricas con criterio

Y entender qué estás mirando.

## 4. No loguear secretos ni datos sensibles

Esto es crítico.

## 5. Pensar observabilidad como parte del diseño operativo

No como un parche tardío.

## Comparación con otros lenguajes

### Si venís de JavaScript

Probablemente ya viste logs, health checks y métricas en servicios Node o APIs modernas. En Spring Boot, Actuator vuelve esto especialmente cómodo y muy integrado al ecosistema.

### Si venís de Python

Puede recordarte a endpoints de salud, logging y monitoreo básico en apps web. En Java y Spring Boot, la diferencia fuerte es que tenés una integración muy directa y estandarizada con Actuator y con el ecosistema de métricas.

## Errores comunes

### 1. No tener health check

Eso dificulta muchísimo operación y despliegue.

### 2. Loguear sin contexto o con mensajes pobres

Después cuesta entender qué pasó.

### 3. Loguear datos sensibles

Puede ser un problema serio de seguridad.

### 4. Exponer endpoints de Actuator sin criterio

No todo debería quedar abierto públicamente.

### 5. Esperar a tener problemas grandes para recién pensar observabilidad

Conviene empezar antes.

## Mini ejercicio

Diseñá una observabilidad básica para una API Spring Boot con:

1. logs en un service importante
2. Actuator agregado al proyecto
3. exposición de `health`, `info` y `metrics`
4. al menos un criterio de qué no loguear
5. una idea de qué mirarías si la app “anda lenta”

## Ejemplo posible

- log de creación de orden con userId e itemCount
- Actuator con `health`, `info`, `metrics`
- no loguear contraseñas ni tokens
- si la app está lenta, revisar:
  - latencia de requests
  - salud de base
  - errores en logs
  - uso de memoria

## Resumen

En esta lección viste que:

- la observabilidad ayuda a entender qué está pasando dentro de una aplicación en ejecución
- logs, métricas y health checks son una base excelente para empezar
- Spring Boot Actuator facilita mucho la observabilidad básica
- los logs deben ser claros, útiles y cuidadosos con la información sensible
- health checks ayudan a saber si la app está viva y sana
- las métricas ayudan a entender el comportamiento agregado del sistema
- una app real no solo debe funcionar: también debe poder observarse

## Siguiente tema

La siguiente natural es **cache con Redis**, porque después de aprender a observar mejor una aplicación en ejecución, el siguiente paso muy valioso es empezar a mejorar rendimiento y respuesta en ciertos casos usando una capa de cache bien pensada.
