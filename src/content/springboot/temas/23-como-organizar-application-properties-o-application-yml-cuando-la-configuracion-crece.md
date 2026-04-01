---
title: "Cómo organizar application.properties o application.yml cuando la configuración crece"
description: "Entender cómo estructurar la configuración en Spring Boot para que siga siendo legible, mantenible y clara a medida que la aplicación incorpora más módulos, integraciones y entornos."
order: 23
module: "Configuración en Spring Boot"
level: "base"
draft: false
---

Hasta ahora viste que Spring Boot puede leer configuración desde distintos lugares, aplicar perfiles, validar propiedades y resolver precedencias.

Todo eso está muy bien.

Pero en una aplicación real aparece rápidamente otro problema, más terrenal y más cotidiano:

- el archivo de configuración empieza siendo corto
- después le agregás base de datos
- después logging
- después integraciones externas
- después flags
- después storage
- después seguridad
- después jobs o schedulers
- después propiedades de módulos internos

Y sin darte cuenta, `application.properties` o `application.yml` se transforma en un bloque enorme, difícil de leer y más difícil todavía de mantener.

Entonces aparece una necesidad muy concreta:

> ¿cómo organizar la configuración para que siga siendo clara cuando la aplicación crece?

Ese es el foco de este tema.

## El problema de fondo

Al principio, un archivo de configuración puede ser algo como esto:

```properties
spring.application.name=miapp
server.port=8080
miapp.mensaje=hola
```

Eso es fácil de leer.

Pero cuando el proyecto crece, podés terminar con cosas de este estilo:

```properties
spring.application.name=miapp
server.port=8080
spring.datasource.url=...
spring.datasource.username=...
spring.datasource.password=...
logging.level.root=INFO
logging.level.com.ejemplo=DEBUG
miapp.storage.base-path=/tmp
miapp.storage.max-size=200
miapp.integracion.erp.url=...
miapp.integracion.erp.token=...
miapp.integracion.email.from=...
miapp.integracion.email.timeout=...
miapp.jobs.limpieza.enabled=true
miapp.jobs.limpieza.intervalo=3600
miapp.seguridad.jwt.secret=...
miapp.seguridad.jwt.expiration=3600000
...
```

No está mal en sí mismo, pero empieza a volverse difícil responder preguntas como estas:

- ¿qué parte de esta configuración corresponde a cada módulo?
- ¿qué propiedades son del framework y cuáles son mías?
- ¿qué cosas son sensibles?
- ¿qué cosas son defaults y cuáles cambian por perfil?
- ¿qué configuración ya no se usa?
- ¿cómo encuentra otro desarrollador lo que necesita?

La app sigue funcionando, sí. Pero la mantenibilidad empieza a deteriorarse.

## Por qué este tema importa tanto

La configuración no es un detalle accesorio.

Con el tiempo, una aplicación grande puede depender fuertemente de su configuración para:

- conectarse a servicios
- arrancar en el entorno correcto
- tener logs razonables
- definir límites operativos
- activar o desactivar features
- establecer timeouts
- configurar seguridad
- determinar integraciones

Si esa configuración está desordenada, el problema no es solo “que el archivo se vea feo”.

El problema real es que:

- cuesta entender el sistema
- cuesta operarlo
- cuesta diagnosticar errores
- cuesta evolucionarlo
- cuesta sumarle nuevos módulos sin generar caos

Por eso, aprender a organizar bien la configuración es una habilidad importante en proyectos reales.

## Qué significa “organizar bien” la configuración

No significa solamente poner comentarios o dejar líneas en blanco.

Organizar bien implica, sobre todo:

- agrupar propiedades por responsabilidad
- usar nombres consistentes
- separar lo que es del framework de lo que es de la aplicación
- reflejar la estructura del sistema
- evitar duplicaciones innecesarias
- dejar claro qué pertenece a qué módulo o integración

En otras palabras:

> un archivo de configuración bien organizado debería permitir entender la forma general del sistema con solo leerlo.

## Primera decisión: properties o YAML

Tanto `application.properties` como `application.yml` son válidos.

Pero cuando la configuración empieza a crecer, YAML suele resultar más cómodo para ver jerarquías.

### Ejemplo en `properties`

```properties
miapp.integracion.erp.base-url=https://erp.ejemplo.com
miapp.integracion.erp.timeout=5000
miapp.integracion.erp.reintentos=3
miapp.integracion.email.from=no-reply@ejemplo.com
miapp.integracion.email.timeout=3000
```

### Ejemplo en YAML

```yaml
miapp:
  integracion:
    erp:
      base-url: https://erp.ejemplo.com
      timeout: 5000
      reintentos: 3
    email:
      from: no-reply@ejemplo.com
      timeout: 3000
```

En configuraciones más grandes, YAML suele dejar más visible la agrupación.

Eso no significa que siempre debas usar YAML, pero sí que puede ser una muy buena elección cuando la jerarquía empieza a importar mucho.

## Primer criterio fuerte: agrupar por dominio configuracional

Una de las reglas más útiles es esta:

> las propiedades deberían agruparse según el área del sistema a la que pertenecen.

Por ejemplo:

- base de datos
- logging
- storage
- seguridad
- integraciones externas
- jobs
- features internas
- parámetros propios del negocio

No conviene mezclar todo sin estructura.

## Un ejemplo de mala organización

```properties
miapp.erp.url=...
miapp.email.timeout=...
miapp.storage.base-path=...
miapp.erp.token=...
miapp.seguridad.jwt.secret=...
miapp.email.from=...
miapp.storage.max-size=...
miapp.jobs.cleanup.enabled=...
```

Todo está “correcto”, pero el orden es arbitrario y cuesta leerlo.

## Un ejemplo más ordenado

```properties
miapp.integracion.erp.url=...
miapp.integracion.erp.token=...

miapp.integracion.email.from=...
miapp.integracion.email.timeout=...

miapp.storage.base-path=...
miapp.storage.max-size=...

miapp.seguridad.jwt.secret=...

miapp.jobs.cleanup.enabled=...
```

Solo con agrupar y dejar bloques por responsabilidad, la claridad mejora muchísimo.

## Segundo criterio: usar prefijos coherentes

Este punto es muy importante.

Cuando una aplicación crece, el nombre de las propiedades ya no puede ser improvisado.

Conviene que sigan una convención estable.

Por ejemplo, si todo lo propio de la app usa el prefijo `miapp`, eso ayuda mucho:

```properties
miapp.storage.base-path=...
miapp.storage.max-size=...
miapp.integracion.erp.url=...
miapp.integracion.erp.token=...
miapp.seguridad.jwt.secret=...
```

Eso permite distinguir rápido:

- qué propiedades son de Spring Boot o librerías
- qué propiedades son tuyas

## Por qué conviene un prefijo raíz propio

Porque evita colisiones conceptuales y organiza mejor el espacio de nombres.

Cuando usás un prefijo raíz estable:

- el proyecto se vuelve más navegable
- las propiedades propias quedan identificadas
- es más fácil agrupar con `@ConfigurationProperties`
- la configuración crece de forma más ordenada

En muchos proyectos, esto termina siendo una de las mejores decisiones a mediano plazo.

## Tercer criterio: reflejar módulos reales del sistema

La configuración debería parecerse a la arquitectura real de la aplicación.

Por ejemplo, si tu sistema tiene:

- módulo de pagos
- módulo de email
- módulo de storage
- integración con ERP
- jobs internos

entonces es sano que eso también se vea en la configuración.

Por ejemplo:

```yaml
miapp:
  pagos:
    timeout: 4000
    sandbox: true

  email:
    from: no-reply@ejemplo.com
    timeout: 3000

  storage:
    base-path: /tmp
    max-size: 200

  integracion:
    erp:
      url: https://erp.ejemplo.com
      token: demo-token

  jobs:
    limpieza:
      enabled: true
      intervalo: 3600
```

Esto es mucho más legible que una lista plana sin relación visible.

## Cuarto criterio: separar propiedades del framework y de la app

Otra práctica sana es no mezclar visualmente en desorden:

- propiedades de Spring Boot
- propiedades de la aplicación

Por ejemplo, puede ser buena idea dejar un bloque para Spring y otro para lo propio.

```properties
spring.application.name=miapp
server.port=8080
logging.level.root=INFO

miapp.storage.base-path=/tmp
miapp.storage.max-size=200
miapp.integracion.erp.url=https://erp.ejemplo.com
```

Esto ayuda a leer mejor el archivo.

## Una estructura posible en application.properties

Por ejemplo:

```properties
# Spring Boot / framework
spring.application.name=miapp
server.port=8080

# Logging
logging.level.root=INFO
logging.level.com.ejemplo=DEBUG

# Configuración propia
miapp.storage.base-path=/tmp
miapp.storage.max-size=200

miapp.integracion.erp.url=https://erp.ejemplo.com
miapp.integracion.erp.timeout=5000

miapp.jobs.cleanup.enabled=true
miapp.jobs.cleanup.intervalo=3600
```

No es la única forma posible, pero ya muestra un orden mucho más sostenible.

## En YAML esto puede quedar todavía más claro

```yaml
spring:
  application:
    name: miapp

server:
  port: 8080

logging:
  level:
    root: INFO
    com.ejemplo: DEBUG

miapp:
  storage:
    base-path: /tmp
    max-size: 200

  integracion:
    erp:
      url: https://erp.ejemplo.com
      timeout: 5000

  jobs:
    cleanup:
      enabled: true
      intervalo: 3600
```

La estructura queda mucho más visible.

## Quinto criterio: evitar archivos base monstruosos

Aunque la configuración base puede crecer, conviene que no se vuelva un depósito de todo lo imaginable.

Una buena práctica general es preguntarte:

- ¿esto realmente debería estar en la base?
- ¿esto pertenece más a un perfil?
- ¿esto debería venir desde variables de entorno?
- ¿esto es secreto sensible?
- ¿esto es una configuración temporal o permanente?

Esa reflexión evita que el archivo base se convierta en un mezcladero.

## Qué conviene dejar en la base

Suele tener sentido dejar en el archivo base:

- defaults razonables
- configuración compartida
- estructura general de propiedades
- cosas que casi siempre están presentes
- propiedades técnicas no sensibles que rara vez cambian

## Qué conviene mover a perfiles

Suele tener sentido mover a perfiles:

- diferencias claras entre desarrollo, test y producción
- URLs específicas del entorno
- puertos alternativos
- niveles de log particulares
- settings de infraestructura que cambian según contexto

## Qué conviene manejar desde entorno

Suele tener sentido dejar para variables de entorno o sistemas de despliegue:

- credenciales sensibles
- secretos
- valores que la infraestructura decide
- parámetros propios de producción
- configuraciones que no querés versionar directamente

## Sexto criterio: comentarios sí, pero con intención

Los comentarios pueden ayudar, pero no deben ser el único método de organización.

Por ejemplo, está bien usar comentarios como:

```properties
# Integración con ERP
miapp.integracion.erp.url=...
miapp.integracion.erp.timeout=...

# Jobs internos
miapp.jobs.cleanup.enabled=true
```

Eso mejora la lectura.

Pero si el archivo está estructuralmente mal, los comentarios no lo van a salvar por sí solos.

Primero importa la agrupación lógica. Después ayudan los comentarios.

## Séptimo criterio: no repetir innecesariamente

Cuando una propiedad existe en base, perfil, variables de entorno y scripts sin necesidad real, la configuración se vuelve difícil de seguir.

Conviene que cada capa tenga una razón clara para existir.

Por ejemplo:

- base como default
- perfil para cambios de entorno
- variables para despliegue
- argumentos para override puntual

No conviene definir todo en todos lados “por las dudas”.

## Octavo criterio: usar @ConfigurationProperties como espejo de la estructura

Una señal muy buena de organización es cuando la estructura de `application.yml` o `application.properties` conversa bien con tus clases de configuración agrupada.

Por ejemplo:

```yaml
miapp:
  integracion:
    erp:
      url: https://erp.ejemplo.com
      timeout: 5000
      token: demo-token
```

puede reflejarse con algo como:

```java
@ConfigurationProperties(prefix = "miapp.integracion.erp")
public class ErpProperties {
    ...
}
```

Esto hace que:

- la configuración tenga identidad
- el código tenga una clase clara para representarla
- sea más fácil encontrar dónde vive cada cosa

## Noveno criterio: nombrar pensando a largo plazo

Este punto muchas veces se subestima.

A veces al principio uno pone nombres como:

```properties
miapp.url=...
miapp.timeout=...
miapp.enabled=true
```

Eso puede servir cuando el proyecto es diminuto.

Pero cuando crece, esos nombres empiezan a quedarse cortos, porque ya no está claro:

- ¿url de qué?
- ¿timeout de qué?
- ¿enabled de qué?

Entonces conviene usar nombres más expresivos y más contextuales:

```properties
miapp.integracion.erp.url=...
miapp.integracion.erp.timeout=...
miapp.jobs.cleanup.enabled=true
```

Eso evita ambigüedad y mejora muchísimo la legibilidad futura.

## Décimo criterio: no meter secretos sin estrategia

Cuando la configuración crece, suele aparecer la tentación de dejar cosas como:

```properties
miapp.seguridad.jwt.secret=secreto-super-real
miapp.integracion.erp.token=token-real
```

Eso puede ser cómodo al principio, pero no suele ser una buena práctica si se trata de valores sensibles reales.

Organizar bien la configuración también implica decidir qué cosas no deberían vivir tranquilamente en el archivo versionado.

## Un ejemplo de estructura sana en properties

```properties
# Framework
spring.application.name=miapp
server.port=8080

# Logging
logging.level.root=INFO
logging.level.com.ejemplo=DEBUG

# Storage
miapp.storage.base-path=/tmp/app
miapp.storage.max-size-mb=200

# Integración ERP
miapp.integracion.erp.url=https://erp.ejemplo.com
miapp.integracion.erp.timeout=5000
miapp.integracion.erp.reintentos=3

# Email
miapp.integracion.email.from=no-reply@ejemplo.com
miapp.integracion.email.timeout=3000

# Jobs
miapp.jobs.cleanup.enabled=true
miapp.jobs.cleanup.intervalo-segundos=3600
```

Ya solo con esta estructura, la configuración se vuelve mucho más navegable.

## Un ejemplo equivalente en YAML

```yaml
spring:
  application:
    name: miapp

server:
  port: 8080

logging:
  level:
    root: INFO
    com.ejemplo: DEBUG

miapp:
  storage:
    base-path: /tmp/app
    max-size-mb: 200

  integracion:
    erp:
      url: https://erp.ejemplo.com
      timeout: 5000
      reintentos: 3

    email:
      from: no-reply@ejemplo.com
      timeout: 3000

  jobs:
    cleanup:
      enabled: true
      intervalo-segundos: 3600
```

Para configuraciones jerárquicas, YAML suele verse muy bien.

## Cuándo YAML puede ser mejor

YAML suele resultar especialmente cómodo cuando:

- hay jerarquías profundas
- hay muchos bloques agrupados
- querés una visualización más limpia de la estructura
- la configuración empieza a parecer un árbol y no una lista plana

## Cuándo properties puede seguir siendo suficiente

`application.properties` sigue siendo perfectamente válido cuando:

- la configuración es moderada
- el equipo lo prefiere
- el estilo plano no molesta
- la jerarquía no es tan compleja
- ya existe una convención consolidada

Lo importante no es elegir “el formato más elegante” en abstracto, sino mantener claridad y consistencia.

## Error común: dejar todo desordenado “porque total Spring lo lee igual”

Sí, Spring lo lee igual.

Pero una cosa es que la máquina lo entienda y otra muy distinta es que el archivo sea legible para las personas.

El problema de una configuración caótica no es técnico en el sentido estricto de compilación.
Es un problema de mantenimiento, operación y evolución del proyecto.

## Error común: usar nombres demasiado genéricos

Ya lo vimos, pero vale insistir.

Nombres como:

- `url`
- `enabled`
- `timeout`
- `path`

sin contexto suficiente pueden volverse muy confusos en un proyecto grande.

La claridad semántica paga muchísimo a mediano plazo.

## Error común: mezclar todo lo de todos los módulos sin criterio

Otro problema frecuente es que el archivo termine siendo una bolsa donde cualquier módulo agrega cosas donde encuentra lugar.

Con el tiempo eso genera:

- pérdida de estructura
- dificultad para buscar
- duplicación de conceptos
- propiedades casi iguales con nombres distintos

Por eso es tan importante definir una convención y respetarla.

## Error común: duplicar bloques entre perfiles sin necesidad

Cuando trabajás con perfiles, puede pasar que copies y pegues demasiada configuración entre `dev`, `test` y `prod`.

Si la base ya representa defaults sanos, muchos perfiles deberían sobrescribir solo lo necesario.

Eso mantiene la configuración más corta y más comprensible.

## Una buena estrategia de lectura

Cuando un archivo crece, conviene que alguien nuevo pueda leerlo así:

1. primero entiende lo general del framework
2. después ve los módulos propios
3. luego encuentra integraciones
4. luego encuentra jobs o features
5. si necesita detalle, puede ir a la clase `@ConfigurationProperties` correspondiente

Si el archivo permite ese recorrido mental, es una muy buena señal.

## Relación con la arquitectura del proyecto

La organización de la configuración debería acompañar la arquitectura general del sistema.

Si tu aplicación está ordenada por módulos claros, eso debería reflejarse también en:

- prefijos
- agrupaciones
- nombres
- clases de configuración

Cuando eso ocurre, el proyecto se siente coherente.

## Relación con Spring Boot

Spring Boot te da un sistema muy flexible de configuración, pero la calidad del resultado final depende mucho de cómo estructures tus propiedades.

El framework no va a imponer por sí solo una buena organización semántica.
Eso sigue dependiendo de decisiones humanas de diseño.

Por eso, saber configurar no alcanza: también hay que saber **ordenar** la configuración.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> cuando la configuración crece, deja de ser suficiente que “funcione”; también necesita estar organizada con prefijos coherentes, bloques claros y una estructura que refleje los módulos reales de la aplicación.

## Resumen

- La configuración pequeña puede ser simple, pero al crecer necesita estructura.
- Conviene agrupar propiedades por responsabilidad o módulo.
- Un prefijo raíz propio ayuda a distinguir configuración de la aplicación.
- YAML suele ser cómodo para jerarquías, aunque properties sigue siendo válido.
- Es sano separar visualmente lo del framework de lo propio.
- No todo debe ir al archivo base; perfiles y entorno también cumplen un rol.
- Una configuración bien organizada mejora la legibilidad, la operación y el mantenimiento del sistema.

## Próximo tema

En el próximo tema vas a ver cómo usar `CommandLineRunner` y `ApplicationRunner` para ejecutar lógica al arrancar una aplicación Spring Boot, y en qué casos eso resulta útil sin convertir el arranque en un lugar caótico.
