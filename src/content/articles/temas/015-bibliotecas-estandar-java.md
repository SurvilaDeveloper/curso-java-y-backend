---
title: "Bibliotecas estándar de Java"
description: "Cuando se habla de biblioteca estándar de Java, normalmente se hace referencia al conjunto de APIs que forman parte de Java SE (Java Platform, Standard Edition) y que vienen definidas como parte de la plataforma. En la documentación oficial moderna, esas APIs se organizan principalmente en módulos cuyo nombre empieza con `java`."
order: 15
module: "Java  - 'biblioteca'"
level: "intro"
draft: false
---
# Bibliotecas estándar de Java

## Qué se entiende por “biblioteca estándar” en Java

Cuando se habla de **biblioteca estándar de Java**, normalmente se hace referencia al conjunto de APIs que forman parte de **Java SE (Java Platform, Standard Edition)** y que vienen definidas como parte de la plataforma. En la documentación oficial moderna, esas APIs se organizan principalmente en **módulos cuyo nombre empieza con `java`**.

Desde Java 9, la plataforma pasó a estar modularizada. Eso significa que ya no conviene pensar la biblioteca estándar solo como “paquetes sueltos”, sino como un conjunto de **módulos oficiales de Java SE**.

Este artículo enumera esas bibliotecas de forma práctica, agrupándolas por función, y además aclara qué cosas suelen confundirse con la biblioteca estándar aunque hoy ya no formen parte de ella.

---

## Cómo se organiza hoy la biblioteca estándar

Hay una distinción importante:

- **Módulos `java.*`**: forman parte de **Java SE**.
- **Módulos `jdk.*`**: son APIs y herramientas específicas del **JDK**. Muchas son útiles y vienen con el JDK, pero **no todas forman parte de la biblioteca estándar de Java SE**.

En otras palabras: si alguien pide una enumeración de la biblioteca estándar de Java, lo más correcto es empezar por los módulos `java.*`.

---

## Enumeración de los módulos estándar de Java SE

A continuación se listan los módulos principales de la biblioteca estándar de Java SE, con una explicación breve de para qué sirve cada uno.

### 1. `java.base`
Es el núcleo absoluto de Java. Todo programa Java depende de este módulo.

Incluye, entre otros, paquetes fundamentales como:

- `java.lang`: clases básicas del lenguaje (`String`, `Object`, `Math`, `System`, `Thread`, `Throwable`, etc.).
- `java.util`: colecciones, utilidades generales, `Optional`, `Scanner`, `UUID`, `Random`, etc.
- `java.util.concurrent`: concurrencia, ejecutores, locks, estructuras thread-safe.
- `java.util.regex`: expresiones regulares.
- `java.io`: entrada/salida clásica basada en streams.
- `java.nio`, `java.nio.file`, `java.nio.charset`: I/O moderno, buffers, channels, archivos, paths y codificaciones.
- `java.net`: redes básicas, sockets, URLs, URIs.
- `java.time`: fecha y hora moderna.
- `java.math`: `BigInteger` y `BigDecimal`.
- `java.security`: base del framework de seguridad.
- `java.text`: formateo y parsing de texto, números y fechas.
- `java.lang.reflect`: reflexión.
- `java.lang.annotation`: anotaciones.
- `java.lang.module`: soporte para módulos.
- `java.lang.invoke`: method handles e infraestructura de invocación avanzada.
- `java.lang.ref`: referencias suaves, débiles y fantasma.

Si alguien pregunta cuáles son las bibliotecas estándar más importantes para aprender primero, casi siempre la respuesta empieza por `java.base`.

---

### 2. `java.compiler`
Contiene las APIs relacionadas con el compilador y el modelo del lenguaje.

Se usa para:

- procesamiento de anotaciones,
- modelado del código fuente,
- compilación programática,
- herramientas que inspeccionan o generan código Java.

Paquetes conocidos:

- `javax.tools`
- `javax.lang.model.*`
- `javax.annotation.processing`

Muy importante para frameworks, generadores de código y tooling.

---

### 3. `java.datatransfer`
Define la API de transferencia de datos entre aplicaciones o dentro de una misma aplicación.

Se relaciona con:

- clipboard,
- drag and drop,
- intercambio de datos entre componentes de UI.

Se usa sobre todo en aplicaciones desktop.

---

### 4. `java.desktop`
Agrupa las bibliotecas gráficas clásicas de Java para escritorio.

Incluye:

- AWT,
- Swing,
- Java 2D,
- impresión,
- audio,
- accesibilidad,
- imágenes,
- JavaBeans.

Paquetes representativos:

- `java.awt`
- `java.awt.event`
- `java.awt.image`
- `javax.swing`
- `javax.swing.table`
- `javax.imageio`
- `javax.sound.*`
- `java.beans`

Es estándar, pero no suele ser el foco principal en backend.

---

### 5. `java.instrument`
Permite que agentes instrumenten programas que están corriendo sobre la JVM.

Se usa para:

- profiling,
- observabilidad,
- bytecode instrumentation,
- agentes APM,
- herramientas de testing o monitoreo.

Paquete principal:

- `java.lang.instrument`

---

### 6. `java.logging`
Contiene la API estándar de logging de Java.

Paquete principal:

- `java.util.logging`

Aunque en muchos proyectos backend se usan bibliotecas externas como SLF4J + Logback o Log4j2, **`java.util.logging` pertenece a la biblioteca estándar**.

---

### 7. `java.management`
Contiene la API de **JMX (Java Management Extensions)** y otras interfaces de administración y monitoreo de la JVM.

Paquetes representativos:

- `java.lang.management`
- `javax.management`
- `javax.management.openmbean`
- `javax.management.monitor`
- `javax.management.timer`

Útil para métricas, gestión y observabilidad.

---

### 8. `java.management.rmi`
Extiende la administración remota de JMX mediante RMI.

Paquete importante:

- `javax.management.remote.rmi`

Hoy se usa menos en aplicaciones modernas que exponen métricas por HTTP, pero sigue siendo parte de Java SE.

---

### 9. `java.naming`
Implementa la API **JNDI (Java Naming and Directory Interface)**.

Sirve para:

- servicios de nombres,
- directorios,
- LDAP,
- búsqueda de recursos por nombre.

Paquetes representativos:

- `javax.naming`
- `javax.naming.directory`
- `javax.naming.event`
- `javax.naming.ldap`
- `javax.naming.spi`

---

### 10. `java.net.http`
Contiene el cliente HTTP moderno incorporado en Java.

Paquete principal:

- `java.net.http`

Incluye:

- `HttpClient`
- `HttpRequest`
- `HttpResponse`
- soporte para HTTP/2,
- WebSocket.

Para backend moderno, este módulo es de los más valiosos dentro de la biblioteca estándar.

---

### 11. `java.prefs`
Define la API de preferencias.

Paquete principal:

- `java.util.prefs`

Sirve para almacenar configuraciones ligeras de usuario o aplicación.

---

### 12. `java.rmi`
Contiene la API de **Remote Method Invocation**.

Paquetes representativos:

- `java.rmi`
- `java.rmi.registry`
- `java.rmi.server`
- `javax.rmi.ssl`

Fue muy importante históricamente. Hoy aparece menos en aplicaciones nuevas, pero sigue siendo parte de la plataforma estándar.

---

### 13. `java.scripting`
Define la API de scripting de Java.

Paquete principal:

- `javax.script`

Permite integrar motores de scripting bajo una interfaz común. Su presencia en la biblioteca estándar no implica que todos los motores vengan incluidos por defecto en cualquier distribución moderna.

---

### 14. `java.se`
Es un módulo agregador: representa la API global de Java SE.

No se aprende como una biblioteca “de uso directo”, sino como una forma de agrupar toda la plataforma estándar.

---

### 15. `java.security.jgss`
Implementa el binding Java de la **GSS-API** (Generic Security Services API).

Paquete principal:

- `org.ietf.jgss`

Se relaciona con autenticación y mecanismos como Kerberos.

---

### 16. `java.security.sasl`
Brinda soporte para **SASL (Simple Authentication and Security Layer)**.

Paquete principal:

- `javax.security.sasl`

Útil en autenticación y protocolos extensibles.

---

### 17. `java.smartcardio`
API para interacción con smart cards.

Paquete principal:

- `javax.smartcardio`

Es una parte específica y menos usada de la biblioteca estándar, pero sigue siendo oficial.

---

### 18. `java.sql`
Contiene la API estándar de acceso a bases de datos relacionales: **JDBC**.

Paquetes representativos:

- `java.sql`
- `javax.sql`

Incluye conceptos como:

- `Connection`
- `PreparedStatement`
- `ResultSet`
- `DriverManager`
- `DataSource`

Para backend, esta es una de las bibliotecas estándar más relevantes.

---

### 19. `java.sql.rowset`
Complementa JDBC con la API **RowSet**.

Paquetes representativos:

- `javax.sql.rowset`
- `javax.sql.rowset.serial`
- `javax.sql.rowset.spi`

Es menos usada que JDBC directo o que los frameworks ORM, pero forma parte de Java SE.

---

### 20. `java.transaction.xa`
Proporciona soporte para transacciones distribuidas en JDBC mediante **XA**.

Paquete principal:

- `javax.transaction.xa`

Es útil en escenarios empresariales específicos donde participan múltiples recursos transaccionales.

---

### 21. `java.xml`
Agrupa las APIs estándar de procesamiento XML.

Incluye, entre otros:

- DOM,
- SAX,
- StAX,
- validación,
- transformación XML,
- XPath.

Paquetes representativos:

- `javax.xml.parsers`
- `javax.xml.stream`
- `javax.xml.transform`
- `javax.xml.validation`
- `javax.xml.xpath`
- `org.w3c.dom`
- `org.xml.sax`

Aunque JSON domina muchas APIs modernas, XML sigue teniendo peso en integración, configuración y tooling.

---

### 22. `java.xml.crypto`
API para criptografía XML.

Paquetes representativos:

- `javax.xml.crypto`
- `javax.xml.crypto.dom`
- `javax.xml.crypto.dsig`
- `javax.xml.crypto.dsig.keyinfo`
- `javax.xml.crypto.dsig.spec`

Se usa en firmas XML y escenarios de interoperabilidad específicos.

---

## Bibliotecas estándar más importantes dentro de `java.base`

Como `java.base` es muy grande, conviene separarlo por áreas. Esta es una mini enumeración práctica de sus partes más importantes.

### Lenguaje y runtime
- `java.lang`
- `java.lang.annotation`
- `java.lang.invoke`
- `java.lang.module`
- `java.lang.ref`
- `java.lang.reflect`
- `java.lang.runtime`

### Colecciones y utilidades
- `java.util`
- `java.util.concurrent`
- `java.util.concurrent.atomic`
- `java.util.concurrent.locks`
- `java.util.function`
- `java.util.stream`
- `java.util.regex`
- `java.util.spi`
- `java.util.random`
- `java.util.zip`

### Entrada/salida y archivos
- `java.io`
- `java.nio`
- `java.nio.channels`
- `java.nio.charset`
- `java.nio.file`
- `java.nio.file.attribute`

### Red
- `java.net`
- `java.net.spi`

### Fecha, hora, internacionalización y texto
- `java.time`
- `java.time.chrono`
- `java.time.format`
- `java.time.temporal`
- `java.time.zone`
- `java.text`
- `java.text.spi`

### Matemática y números
- `java.math`

### Seguridad y criptografía base
- `java.security`
- `java.security.cert`
- `java.security.interfaces`
- `java.security.spec`
- `javax.crypto`
- `javax.crypto.interfaces`
- `javax.crypto.spec`
- `javax.net`
- `javax.net.ssl`
- `javax.security.auth`
- `javax.security.auth.callback`
- `javax.security.auth.login`
- `javax.security.auth.spi`
- `javax.security.auth.x500`
- `javax.security.cert`

### Formatos y utilidades varias
- `java.util.jar`
- `java.util.logging` *(en realidad módulo `java.logging`)*
- `java.util.prefs` *(en realidad módulo `java.prefs`)*

---

## Bibliotecas del JDK que suelen confundirse con la biblioteca estándar

Además de Java SE, el JDK incluye módulos `jdk.*` que son oficiales y muy útiles, pero que no deben confundirse automáticamente con “biblioteca estándar de Java SE”. Algunos ejemplos importantes son:

- `jdk.httpserver`: servidor HTTP liviano embebido.
- `jdk.jfr`: Java Flight Recorder.
- `jdk.jshell`: soporte para JShell.
- `jdk.javadoc`: APIs relacionadas con Javadoc.
- `jdk.compiler`: implementación del compilador.
- `jdk.crypto.ec`: soporte criptográfico adicional.
- `jdk.charsets`: charsets extra no incluidos en `java.base`.
- `jdk.unsupported`: APIs especiales por compatibilidad.

Estas APIs pueden venir con el JDK y ser muy útiles, pero conceptualmente conviene distinguir entre:

- **plataforma estándar (`java.*`)**, y
- **componentes específicos del JDK (`jdk.*`)**.

---

## Cosas que muchas personas creen que siguen siendo estándar, pero ya no lo son

### JavaFX
JavaFX ya no viene incluido dentro del JDK moderno como antes. Hoy se distribuye por separado.

### JAXB, JAX-WS, CORBA y módulos relacionados
A partir de JDK 11 se removieron varios módulos que habían estado disponibles en versiones anteriores, entre ellos:

- `java.xml.ws`
- `java.xml.bind`
- `java.xml.ws.annotation`
- `java.corba`
- `java.transaction`
- `java.activation`
- `java.se.ee`
- `jdk.xml.ws`
- `jdk.xml.bind`

Por eso, en Java moderno no conviene enseñar esas APIs como si siguieran siendo parte normal de la biblioteca estándar disponible por defecto.

---

## Qué partes de la biblioteca estándar son más importantes para backend

Si el objetivo es backend, las áreas más importantes de la biblioteca estándar suelen ser estas:

1. **Fundamentos del lenguaje y utilidades**
   - `java.lang`
   - `java.util`
   - `java.math`
   - `java.time`

2. **Colecciones y procesamiento de datos**
   - `java.util`
   - `java.util.stream`
   - `java.util.function`

3. **Concurrencia**
   - `java.util.concurrent`
   - `java.util.concurrent.atomic`
   - `java.util.concurrent.locks`

4. **I/O y archivos**
   - `java.io`
   - `java.nio`
   - `java.nio.file`

5. **Red y HTTP**
   - `java.net`
   - `java.net.http`

6. **Base de datos**
   - `java.sql`
   - `javax.sql`

7. **Seguridad**
   - `java.security`
   - `javax.crypto`
   - `javax.net.ssl`

8. **XML y formatos estructurados**
   - `java.xml`

9. **Logging y observabilidad básica**
   - `java.util.logging`
   - `java.lang.management`
   - `javax.management`

---

## Resumen final

La biblioteca estándar de Java no es una sola librería monolítica, sino un conjunto amplio de APIs oficiales agrupadas en módulos.

La forma más correcta de enumerarla hoy es esta:

- **Núcleo**: `java.base`
- **Compilación e instrumentación**: `java.compiler`, `java.instrument`
- **Desktop y transferencia de datos**: `java.desktop`, `java.datatransfer`
- **Logging y administración**: `java.logging`, `java.management`, `java.management.rmi`
- **Red y nombres**: `java.net.http`, `java.naming`, `java.rmi`
- **Preferencias y scripting**: `java.prefs`, `java.scripting`
- **Seguridad**: `java.security.jgss`, `java.security.sasl`, `java.smartcardio`
- **Datos y transacciones**: `java.sql`, `java.sql.rowset`, `java.transaction.xa`
- **XML**: `java.xml`, `java.xml.crypto`
- **Agregador general**: `java.se`

Si se busca una respuesta práctica, la parte realmente imprescindible para casi cualquier desarrollador Java está concentrada en:

- `java.lang`
- `java.util`
- `java.io`
- `java.nio`
- `java.time`
- `java.net`
- `java.net.http`
- `java.sql`
- `java.security`
- `java.util.concurrent`
- `java.xml`

---

## Fuentes oficiales recomendadas

- Oracle Java SE 21 API Overview: https://docs.oracle.com/en/java/javase/21/docs/api/index.html
- Oracle JDK 26 Documentation: https://docs.oracle.com/en/java/javase/26/
- Oracle Java Core Libraries Developer Guide: https://docs.oracle.com/en/java/javase/21/core/
- Oracle Migration Guide (removed modules in JDK 11 and later): https://docs.oracle.com/en/java/javase/21/migrate/removed-tools-and-components.html

