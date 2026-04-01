---
title: "Cómo conectar Spring Boot a una base de datos real con application.properties"
description: "Entender cómo configurar Spring Boot para conectarse a una base de datos real usando URL JDBC, usuario, contraseña y propiedades relacionadas, y por qué este paso vuelve operativa toda la capa de persistencia."
order: 50
module: "Persistencia con Spring Data JPA"
level: "base"
draft: false
---

En los temas anteriores viste cómo:

- modelar entidades con JPA
- usar `JpaRepository`
- crear consultas derivadas y con `@Query`
- paginar resultados
- modelar relaciones
- entender `@Transactional`
- usar migraciones con Flyway

Todo eso arma una base muy fuerte.

Pero aparece un momento decisivo:

> ya no alcanza con entender entidades, repositories y migraciones en abstracto; ahora la aplicación tiene que conectarse de verdad a una base de datos concreta.

Ese es el foco de este tema.

Acá vas a ver cómo Spring Boot se conecta a una base real usando configuración en `application.properties`, y cómo piezas como:

- URL JDBC
- usuario
- contraseña
- driver
- dialecto
- configuración JPA básica

forman parte del puente entre tu aplicación Java y el motor de base de datos real.

Este paso es muy importante porque marca el momento en que la capa de persistencia deja de ser solo diseño y empieza a operar de verdad contra PostgreSQL, MySQL, MariaDB, H2 u otro motor.

## Qué problema resuelve esta configuración

Hasta ahora podías escribir cosas como:

- entidades con `@Entity`
- repositories con `JpaRepository`
- servicios que guardan o buscan datos
- migraciones Flyway

Pero todo eso necesita una pieza fundamental para funcionar:

> ¿a qué base de datos concreta debe conectarse la aplicación?

Spring Boot necesita saber:

- dónde está la base
- qué driver usar
- con qué usuario entrar
- con qué contraseña autenticarse
- cómo interpretar ciertas decisiones del motor
- cómo comportarse con JPA o con el esquema

Sin esa información, la capa de persistencia no tiene un destino real.

## Qué es `application.properties`

`application.properties` es uno de los lugares más comunes donde Spring Boot carga configuración de la aplicación.

Ya lo viste antes para:

- puertos
- perfiles
- propiedades propias
- configuración general

Ahora aparece también como lugar natural para definir la configuración de la base de datos.

Por ejemplo, ahí pueden vivir cosas como:

- URL JDBC
- usuario
- contraseña
- driver
- propiedades JPA
- configuración de Flyway

Es decir:

> `application.properties` suele funcionar como el punto central donde Spring Boot aprende cómo conectarse a la base y cómo comportarse respecto de la persistencia.

## Qué es una URL JDBC

Una de las piezas más importantes es la URL JDBC.

JDBC es el mecanismo clásico por el cual una aplicación Java se conecta a una base de datos relacional mediante un driver compatible.

La URL JDBC expresa, conceptualmente:

- qué motor estás usando
- dónde está la base
- qué nombre de base querés usar
- eventualmente puerto y otros parámetros

Podés pensarla así:

> la URL JDBC le dice a Java y a Spring Boot cómo llegar a la base de datos concreta.

## Ejemplo conceptual de URL JDBC

Para PostgreSQL, una forma típica se ve así:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/mi_basedatos
```

Podés leerla así:

- `jdbc` → protocolo JDBC
- `postgresql` → motor de base
- `localhost` → host
- `5432` → puerto
- `mi_basedatos` → nombre de la base

Ese es uno de los formatos más comunes y reconocibles.

## Otro ejemplo conceptual: MySQL

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/mi_basedatos
```

La lógica general es parecida:

- protocolo JDBC
- motor MySQL
- host
- puerto
- nombre de base

Esto muestra que la forma de la URL depende del motor concreto que estés usando.

## Qué significa `spring.datasource.username`

Otra propiedad muy importante es el usuario.

Por ejemplo:

```properties
spring.datasource.username=postgres
```

o:

```properties
spring.datasource.username=root
```

Esto representa el usuario con el que la aplicación intentará autenticarse en la base.

## Qué significa `spring.datasource.password`

También necesitás indicar la contraseña correspondiente.

Por ejemplo:

```properties
spring.datasource.password=123456
```

Esa es la credencial asociada al usuario elegido.

En desarrollo local puede ser algo simple.
En entornos más serios, esto se maneja con mucho más cuidado y normalmente no conviene dejar secretos reales versionados sin criterio.

Pero conceptualmente, esta propiedad es clara:

> la aplicación necesita una contraseña válida para conectarse a la base si el motor y el usuario la exigen.

## Un ejemplo básico completo

Para PostgreSQL, algo muy típico al empezar podría ser:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/mi_basedatos
spring.datasource.username=postgres
spring.datasource.password=123456
```

Con estas tres propiedades, Spring Boot ya tiene una base muy importante para intentar conectarse a la base.

## Qué hace `spring.datasource.driver-class-name`

A veces también conviene o hace falta indicar explícitamente el driver JDBC.

Por ejemplo:

```properties
spring.datasource.driver-class-name=org.postgresql.Driver
```

o para MySQL:

```properties
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

Esto le dice a la aplicación qué clase de driver JDBC usar para hablar con ese motor.

En algunos casos Spring Boot puede inferir bastante a partir de la URL y la dependencia disponible.
Pero conceptualmente es útil entender que:

> el driver es la pieza Java que sabe hablar con ese motor de base de datos.

## Qué pasa si falta el driver adecuado

Aunque la configuración esté bien escrita, si el proyecto no tiene la dependencia del driver correspondiente, la conexión no podrá establecerse correctamente.

Esto es importante porque la conexión real depende de dos cosas distintas:

- configuración correcta
- dependencia JDBC compatible disponible en el proyecto

Es decir, no alcanza con poner la URL si al proyecto le falta la pieza que sabe hablar con ese motor.

## Un ejemplo más completo para PostgreSQL

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/mi_basedatos
spring.datasource.username=postgres
spring.datasource.password=123456
spring.datasource.driver-class-name=org.postgresql.Driver
```

Este conjunto ya se parece bastante a una configuración real de desarrollo.

## Qué relación tiene esto con `spring-boot-starter-data-jpa`

Cuando agregás el starter de Spring Data JPA al proyecto, Spring Boot empieza a preparar infraestructura asociada a persistencia.

Pero para que esa infraestructura se vuelva operativa, necesita saber cómo conectarse a una base real.

Ahí es donde `spring.datasource.*` toma protagonismo.

Podés pensarlo así:

- el starter agrega capacidades
- la configuración dice contra qué base concreta deben funcionar esas capacidades

## Qué es el dialecto

Cuando trabajás con JPA e Hibernate, aparece otra idea importante: el **dialecto**.

El dialecto expresa, conceptualmente, qué variante de SQL y qué comportamiento específico del motor debe tener en cuenta Hibernate.

Por ejemplo, no es exactamente lo mismo hablar con:

- PostgreSQL
- MySQL
- MariaDB
- H2
- Oracle

Cada motor tiene particularidades.

El dialecto ayuda a que Hibernate entienda mejor con qué motor está trabajando.

## Ejemplo conceptual de dialecto

Para PostgreSQL, una forma típica puede verse así:

```properties
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

Y para MySQL podría cambiar según el motor y la versión.

La idea importante no es memorizar cada nombre exacto de memoria, sino entender para qué existe:

> el dialecto le dice a Hibernate qué sabor de base de datos tiene enfrente.

## ¿Siempre hace falta configurar el dialecto a mano?

No siempre.

En muchos escenarios, Spring Boot e Hibernate pueden inferir bastante correctamente el motor a partir de la URL y del driver.

Pero conviene conocer el concepto porque:

- aparece mucho en documentación
- puede ser útil en ciertos ajustes
- ayuda a entender que el motor concreto importa
- explica por qué no todas las bases se comportan exactamente igual

## Qué relación tiene esto con Flyway

Muy directa.

Si querés que Flyway aplique migraciones al arrancar, también necesita conectarse a la base correcta.

Entonces la configuración de datasource no solo le sirve a JPA.
También le sirve, directa o indirectamente, al trabajo de migración.

Eso muestra que la conexión a base es una pieza transversal:

- la necesita el repository
- la necesita JPA
- la necesita Hibernate
- la necesita Flyway
- la necesita toda la capa persistente

## Qué es `spring.jpa.hibernate.ddl-auto`

Acá aparece una propiedad muy conocida:

```properties
spring.jpa.hibernate.ddl-auto=...
```

Esta propiedad está relacionada con cómo Hibernate trata el esquema de base de datos.

Según el valor, la aplicación puede comportarse de distintas formas respecto de la estructura del esquema.

Sin entrar todavía en todas las variantes profundas, lo importante es entender que esta propiedad toca una decisión delicada:

> ¿qué quiero que Hibernate haga con el esquema cuando arranca la aplicación?

## Por qué esta propiedad merece cuidado

Porque no es una configuración inocente.

Tocar el esquema automáticamente puede ser útil en ciertos contextos de aprendizaje o prototipo, pero en aplicaciones más serias hay que pensar muy bien la estrategia elegida, especialmente si ya estás usando migraciones versionadas como Flyway.

Por eso, más que memorizar una receta rígida, conviene entender el principio:

- hay una configuración que influye en cómo Hibernate trata el esquema
- esa decisión afecta el comportamiento real del proyecto
- no conviene usarla a ciegas

## Un ejemplo común en desarrollo o pruebas simples

A veces podés encontrar cosas como:

```properties
spring.jpa.hibernate.ddl-auto=update
```

o:

```properties
spring.jpa.hibernate.ddl-auto=create-drop
```

La existencia de estos valores ya muestra que Hibernate puede intervenir sobre el esquema.

Pero como vienes construyendo una mirada más profesional con migraciones, conviene ir entendiendo desde ya que mezclar esto sin criterio puede traer confusión.

## Una idea muy sana respecto de Flyway y ddl-auto

Si el proyecto evoluciona hacia migraciones versionadas serias, normalmente tiene mucho sentido que la evolución del esquema esté controlada principalmente por Flyway y no por cambios automáticos difusos del esquema sin trazabilidad.

No hace falta convertir esto en dogma rígido ahora mismo, pero sí conviene que te quede la intuición correcta:

> cuanto más serio es el control del esquema, más importante es evitar estrategias que vuelvan opaco qué cambió realmente y cómo.

## Qué es `spring.jpa.show-sql`

Otra propiedad muy conocida es:

```properties
spring.jpa.show-sql=true
```

Esto se usa frecuentemente en desarrollo para mostrar por consola el SQL que Hibernate va ejecutando.

Es muy útil para:

- entender qué está pasando
- aprender
- depurar
- ver consultas generadas
- detectar comportamiento inesperado

No es una propiedad “de conexión” en el sentido estricto, pero sí suele aparecer muy cerca de este bloque de configuración porque ayuda mucho a trabajar con persistencia.

## Qué aporta ver el SQL

Muchísimo.

Por ejemplo, podés empezar a notar:

- cuándo se ejecuta un insert
- cuándo se hace un select
- cuándo se carga una relación
- si una operación genera más consultas de las que esperabas
- cómo se comporta una consulta derivada o una paginación

Eso la vuelve muy didáctica, especialmente mientras estás aprendiendo JPA.

## Un ejemplo de configuración bastante típica para desarrollo

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/mi_basedatos
spring.datasource.username=postgres
spring.datasource.password=123456
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

Esto ya se parece bastante a una base real de trabajo local.

## Qué relación tiene esto con perfiles

Acá conecta muy bien con lo que viste antes sobre perfiles y configuración.

No siempre querés usar la misma base en todos los entornos.

Por ejemplo:

- desarrollo → una base local
- test → otra base o una base efímera
- producción → una base real distinta, con credenciales distintas

Entonces tiene mucho sentido que cierta configuración viva en archivos de perfil como:

- `application-dev.properties`
- `application-test.properties`
- `application-prod.properties`

Esto permite que el mismo proyecto cambie de base según el entorno activo.

## Un ejemplo conceptual con perfil dev

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/miapp_dev
spring.datasource.username=postgres
spring.datasource.password=123456
```

Y en producción podrías tener otra configuración distinta, más seria y protegida.

La idea importante es que la conexión a base también forma parte de la configuración por entorno.

## Qué relación tiene esto con variables de entorno

Muy fuerte.

Especialmente cuando el proyecto sale del entorno local, muchas veces:

- URL
- usuario
- contraseña

no conviene dejarlos fijos directamente en el archivo versionado.

Ahí las variables de entorno o mecanismos equivalentes ganan mucho protagonismo.

Por ahora no hace falta profundizar todo eso al detalle, pero sí conviene entender esta intuición:

> en local podés empezar con una configuración directa para aprender; en entornos más serios suele ser mejor externalizar credenciales y datos sensibles.

## Una lectura mental muy útil

Podés pensar la configuración de base así:

### URL JDBC
Dónde está la base y qué motor es.

### Username
Con qué usuario te conectás.

### Password
Qué credencial usa ese usuario.

### Driver
Qué pieza Java sabe hablar con ese motor.

### Dialect
Cómo debe comportarse Hibernate frente a ese tipo de base.

### Otras propiedades JPA
Cómo querés que se vea o se gestione el comportamiento persistente.

Ese mapa ordena muchísimo.

## Un ejemplo práctico con H2

En contextos de aprendizaje o test, también es común ver una base embebida como H2.

Un ejemplo conceptual podría verse así:

```properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.username=sa
spring.datasource.password=
spring.datasource.driver-class-name=org.h2.Driver
```

Esto muestra que la lógica de conexión existe incluso cuando el motor es liviano o embebido.

No hace falta que elijas H2 para todo.
Lo importante es entender que el patrón general de conexión sigue siendo el mismo.

## Qué significa que “todo lo anterior ahora se vuelve real”

Antes de tener datasource configurado, muchas cosas de persistencia eran:

- modelo
- teoría
- estructura
- intención

Cuando la aplicación ya apunta a una base real, entonces:

- las entidades pueden persistirse de verdad
- los repositories pueden consultar de verdad
- las migraciones pueden aplicarse de verdad
- los errores de base son errores reales
- los datos sobreviven entre ejecuciones según el entorno

Ese es un salto importante de madurez del proyecto.

## Un ejemplo de flujo completo

1. definís entidad `Producto`
2. definís `ProductoRepository`
3. creás migraciones Flyway para la tabla
4. configurás `application.properties`
5. arrancás la app
6. Flyway aplica migraciones
7. JPA queda conectado a la base
8. el service guarda y consulta productos reales

Ese flujo une muchos de los temas que venís viendo.
Y la configuración de datasource está justo en el medio de esa conexión entre teoría y práctica real.

## Qué pasa si la URL está mal

Si la URL JDBC es incorrecta, la aplicación no va a poder conectarse correctamente.

Por ejemplo, podrían estar mal:

- host
- puerto
- nombre de base
- motor indicado
- formato general de la URL

Esto muestra que la configuración no es un detalle menor.
Una sola propiedad mal puede impedir que toda la capa persistente arranque.

## Qué pasa si el usuario o contraseña están mal

La aplicación puede intentar conectarse, pero la autenticación fallará.

Eso también es bastante común al principio cuando recién se arma el entorno de base local.

Por eso suele ser útil revisar cuidadosamente:

- nombre de base
- usuario
- contraseña
- puerto
- driver

cuando una conexión no levanta como esperabas.

## Qué pasa si falta la base o no existe el esquema

También puede ocurrir que:

- el motor esté corriendo
- la URL apunte bien al host
- pero la base concreta no exista todavía

En ese caso, la app igualmente no podrá operar como se espera.

Esto recuerda algo muy importante:

> conectarse a base de datos no es solo tener una URL bonita; también implica que el entorno real exista y esté bien preparado.

## Qué relación tiene esto con Docker, cloud o producción

Más adelante seguramente vas a ver escenarios como:

- PostgreSQL en Docker
- bases manejadas en cloud
- entornos de staging
- despliegues con variables de entorno
- credenciales secretas
- URLs de conexión más complejas

Todo eso es una evolución natural de este mismo tema.

Por eso conviene entender muy bien primero el caso base en `application.properties`.
Después esa lógica se traslada y crece hacia entornos más serios.

## Un criterio muy sano para empezar

Podés pensar así:

- primero conectá el proyecto a una base local real
- entendé bien URL, usuario, contraseña y driver
- verificá que JPA y Flyway puedan operar
- luego refiná configuración por perfiles y entornos

Ese orden suele ser mucho más pedagógico y estable que querer complicar todo desde el minuto uno.

## Qué no conviene hacer

No conviene copiar bloques de configuración sin entender para qué sirve cada propiedad.

Porque después, cuando algo falla, no sabés bien si el problema está en:

- URL
- driver
- usuario
- contraseña
- dialect
- schema management
- perfil activo
- entorno real

Entender qué función cumple cada pieza vuelve mucho más fácil depurar.

## Error común: pensar que JPA “se conecta sola” mágicamente

Spring Boot ayuda muchísimo, sí.
Pero la base sigue necesitando una configuración correcta y concreta.

La magia útil del framework funciona apoyándose en datos reales de conexión.

## Error común: mezclar Flyway y manejo automático del esquema sin criterio

Ya lo insinuamos antes, pero vale insistir.

Si el esquema lo estás versionando seriamente con migraciones, conviene ser muy consciente de qué papel querés que juegue Hibernate respecto de cambios estructurales automáticos.

No es buena idea combinar cosas poderosas sin entender bien cómo se pisan o se solapan.

## Error común: dejar credenciales reales sensibles hardcodeadas sin pensar el entorno

Para aprender en local, está bien empezar simple.
Pero cuanto más real sea el entorno, más importante se vuelve manejar credenciales de forma más segura y externa.

Conviene que esta intuición esté presente desde temprano.

## Error común: no usar perfiles y terminar apuntando al entorno equivocado

Si el proyecto crece, separar bien:

- dev
- test
- prod

se vuelve muy importante.

No querés que un arranque local termine apuntando a una base que no correspondía por una configuración descuidada.

## Relación con Spring Boot

Spring Boot hace muy fácil centralizar esta configuración y conectar la aplicación con una base real, lo cual es una de las grandes razones por las que la experiencia de arranque de proyectos persistentes resulta tan fluida.

Pero justamente por esa comodidad, conviene entender bien qué está pasando.
No para complicarlo, sino para poder dominarlo.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> conectar Spring Boot a una base real con `application.properties` implica decirle a la aplicación dónde está la base, cómo autenticarse y cómo comportarse frente al motor elegido, convirtiendo toda la infraestructura de entidades, repositories y migraciones en persistencia realmente operativa.

## Resumen

- `application.properties` suele ser el lugar central para configurar la conexión a base de datos.
- La URL JDBC indica motor, host, puerto y nombre de base.
- Usuario, contraseña y driver completan la información básica de conexión.
- El dialecto ayuda a Hibernate a comportarse según el motor concreto.
- Propiedades como `show-sql` ayudan mucho a aprender y depurar.
- Esta configuración conecta todo lo anterior con una base real.
- Es un paso esencial para que JPA, repositories y migraciones funcionen de verdad en un proyecto Spring Boot.

## Próximo tema

En el próximo tema vas a ver cómo usar Spring Boot con PostgreSQL de forma más concreta y práctica, porque es uno de los motores más usados en proyectos reales y vale la pena consolidar un ejemplo completo sobre él antes de seguir avanzando.
