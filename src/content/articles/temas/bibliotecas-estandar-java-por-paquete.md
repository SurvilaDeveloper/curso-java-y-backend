---
title: "Bibliotecas estándar de Java enumeradas por paquete"
description: "La referencia usada es la documentación oficial de Java SE 26, tomando como estándar los paquetes públicos documentados que forman parte de la plataforma Java SE. Eso incluye principalmente paquetes bajo `java.*`, muchos paquetes `javax.*` y algunos paquetes `org.*` que siguen formando parte de módulos estándar. Quedan fuera de esta enumeración los paquetes específicos del JDK (`jdk.*`) y las APIs internas o no portables (`com.sun.*`, `sun.*`, etc.)."
order: 16
module: "Java  - 'biblioteca'"
level: "intro"
draft: false
---
# Bibliotecas estándar de Java enumeradas por paquete

Este artículo enumera las **bibliotecas estándar de Java por paquete**, agrupadas por área funcional.

La referencia usada es la **documentación oficial de Java SE 26**, tomando como estándar los paquetes públicos documentados que forman parte de la plataforma Java SE. Eso incluye principalmente paquetes bajo `java.*`, muchos paquetes `javax.*` y algunos paquetes `org.*` que siguen formando parte de módulos estándar. Quedan **fuera** de esta enumeración los paquetes específicos del JDK (`jdk.*`) y las APIs internas o no portables (`com.sun.*`, `sun.*`, etc.).

## Cómo leer esta enumeración

- **Paquete**: nombre completamente calificado.
- **Descripción**: para qué sirve a grandes rasgos.
- **SPI**: indica un paquete pensado para proveedores/extensiones.
- **Legado**: indica APIs históricas que siguen documentadas, pero hoy rara vez se eligen para proyectos nuevos.

## Qué se considera “biblioteca estándar” aquí

En la documentación oficial, **Java SE** y **JDK** se distinguen explícitamente: las APIs de Java SE son las de la plataforma estándar, mientras que las APIs `jdk.*` son específicas del JDK y no necesariamente forman parte de cualquier implementación de Java SE. Además, la página **All Packages** lista todos los paquetes públicos documentados. A partir de esa base, esta guía deja únicamente los paquetes estándar y descarta los específicos del JDK.

## Resumen rápido

- **Versión de referencia**: Java SE 26
- **Cantidad total de paquetes estándar enumerados**: **187**
- **Incluye**: `java.*`, `javax.*`, `org.ietf.jgss`, `org.w3c.dom.*`, `org.xml.sax.*`
- **Excluye**: `jdk.*`, `com.sun.*`, `sun.*`, APIs incubating o específicas del JDK

---

## 1. Fundamentos del lenguaje, runtime y reflexión
- `java.lang`: clases base del lenguaje: Object, String, Math, System, Thread, etc.
- `java.lang.annotation`: soporte para anotaciones del lenguaje.
- `java.lang.constant`: descriptores nominales de entidades de runtime y class files.
- `java.lang.classfile`: API para parsear, generar y transformar class files.
- `java.lang.classfile.attribute`: modelado de atributos de class files.
- `java.lang.classfile.constantpool`: modelado de entradas del constant pool.
- `java.lang.classfile.instruction`: modelado de instrucciones de bytecode.
- `java.lang.foreign`: acceso a memoria y funciones fuera de la JVM.
- `java.lang.instrument`: instrumentación de programas en ejecución mediante agentes.
- `java.lang.invoke`: method handles, call sites y primitivas de invocación dinámica.
- `java.lang.management`: monitoreo y gestión de la JVM y del runtime.
- `java.lang.module`: descriptores de módulos y resolución de configuraciones.
- `java.lang.ref`: referencias soft, weak y phantom.
- `java.lang.reflect`: API de reflexión sobre clases, métodos, campos y tipos.
- `java.lang.runtime`: soporte de bajo nivel del runtime del lenguaje.
- `java.math`: aritmética de precisión arbitraria con BigInteger y BigDecimal.
- `java.beans`: componentes JavaBeans.
- `java.beans.beancontext`: infraestructura de bean contexts.

## 2. Entrada/salida, archivos, buffers y formatos binarios
- `java.io`: streams, readers/writers, archivos clásicos y serialización.
- `java.nio`: buffers y base del ecosistema NIO.
- `java.nio.channels`: canales, selectors y E/S no bloqueante.
- `java.nio.channels.spi`: SPI para canales.
- `java.nio.charset`: charsets, decoders y encoders.
- `java.nio.charset.spi`: SPI de charsets.
- `java.nio.file`: API moderna de archivos y sistemas de archivos.
- `java.nio.file.attribute`: atributos de archivos y file systems.
- `java.nio.file.spi`: SPI de file systems.
- `java.util.jar`: lectura y escritura de archivos JAR.
- `java.util.zip`: lectura y escritura de ZIP y GZIP.

## 3. Redes, HTTP y comunicación remota
- `java.net`: sockets, URLs/URIs y utilidades de red.
- `java.net.http`: cliente HTTP y WebSocket.
- `java.net.spi`: SPI para networking.
- `java.rmi`: API base de RMI.
- `java.rmi.dgc`: garbage collection distribuido para RMI.
- `java.rmi.registry`: registro de objetos remotos en RMI.
- `java.rmi.server`: soporte del lado servidor para RMI.
- `javax.net`: clases auxiliares para aplicaciones de red.
- `javax.net.ssl`: sockets seguros TLS/SSL.
- `javax.rmi.ssl`: factories RMI sobre SSL/TLS.
- `javax.naming`: API de naming services.
- `javax.naming.directory`: extensión para directory services.
- `javax.naming.event`: eventos sobre naming y directory services.
- `javax.naming.ldap`: operaciones y controles LDAPv3.
- `javax.naming.ldap.spi`: SPI para búsquedas DNS en operaciones LDAP.
- `javax.naming.spi`: SPI general de naming/directory services.

## 4. Colecciones, concurrencia, utilidades, texto y fechas
- `java.util`: collections, Optional, Scanner, Properties, Base64 y utilidades varias.
- `java.util.concurrent`: concurrencia de alto nivel: executors, futures, queues, synchronizers.
- `java.util.concurrent.atomic`: primitivas atómicas lock-free.
- `java.util.concurrent.locks`: locks y condiciones explícitas.
- `java.util.function`: interfaces funcionales para lambdas y method references.
- `java.util.logging`: logging estándar.
- `java.util.prefs`: preferencias y configuración por usuario/sistema.
- `java.util.random`: API moderna de generación aleatoria.
- `java.util.regex`: expresiones regulares.
- `java.util.spi`: SPI de java.util.
- `java.util.stream`: streams y procesamiento funcional de colecciones.
- `java.text`: formato y parseo de texto, números, fechas y mensajes.
- `java.text.spi`: SPI de java.text.
- `java.time`: API principal de fechas, horas, instantes y duraciones.
- `java.time.chrono`: sistemas de calendario alternativos.
- `java.time.format`: formato y parseo de fechas/horas.
- `java.time.temporal`: campos, unidades y adjusters temporales.
- `java.time.zone`: zonas horarias y reglas.

## 5. Seguridad, criptografía, autenticación y certificados
- `java.security`: framework de seguridad base.
- `java.security.cert`: certificados, CRLs y certification paths.
- `java.security.interfaces`: interfaces de claves como RSA y DSA.
- `java.security.spec`: especificaciones de claves y parámetros criptográficos.
- `javax.crypto`: operaciones criptográficas.
- `javax.crypto.interfaces`: interfaces criptográficas especializadas, como Diffie-Hellman.
- `javax.crypto.spec`: especificaciones de claves y parámetros.
- `javax.security.auth`: autenticación y autorización.
- `javax.security.auth.callback`: callbacks para pedir credenciales o mostrar mensajes.
- `javax.security.auth.kerberos`: soporte relacionado con Kerberos.
- `javax.security.auth.login`: framework autenticable y pluggable.
- `javax.security.auth.spi`: SPI para módulos de autenticación.
- `javax.security.auth.x500`: tipos X.500 para subjects y credenciales.
- `javax.security.cert`: API antigua de certificados públicos.
- `javax.security.sasl`: soporte SASL.
- `javax.smartcardio`: acceso a smart cards.
- `org.ietf.jgss`: API GSS-API unificada para mecanismos como Kerberos.

## 6. Base de datos, SQL y transacciones
- `java.sql`: API JDBC principal.
- `javax.sql`: datasources y APIs JDBC del lado servidor.
- `javax.sql.rowset`: interfaces y clases base para RowSet.
- `javax.sql.rowset.serial`: mapeos serializables entre tipos SQL y Java.
- `javax.sql.rowset.spi`: SPI de sincronización para RowSet.
- `javax.transaction.xa`: contrato XA entre transaction manager y resource manager.

## 7. XML, DOM, SAX y firmas XML
- `javax.xml`: constantes base para procesamiento XML.
- `javax.xml.catalog`: implementación de catálogos XML.
- `javax.xml.crypto`: clases comunes de criptografía XML.
- `javax.xml.crypto.dom`: clases DOM para javax.xml.crypto.
- `javax.xml.crypto.dsig`: firmas digitales XML.
- `javax.xml.crypto.dsig.dom`: implementación DOM para XML Digital Signature.
- `javax.xml.crypto.dsig.keyinfo`: procesamiento de estructuras KeyInfo.
- `javax.xml.crypto.dsig.spec`: parámetros para firmas XML.
- `javax.xml.datatype`: mapeos entre tipos XML y Java.
- `javax.xml.namespace`: procesamiento de namespaces XML.
- `javax.xml.parsers`: parsers SAX y builders DOM.
- `javax.xml.stream`: StAX: API de streaming para XML.
- `javax.xml.stream.events`: eventos para StAX.
- `javax.xml.stream.util`: utilidades para StAX.
- `javax.xml.transform`: transformaciones XML genéricas.
- `javax.xml.transform.dom`: transformaciones específicas para DOM.
- `javax.xml.transform.sax`: transformaciones específicas para SAX.
- `javax.xml.transform.stax`: transformaciones específicas para StAX.
- `javax.xml.transform.stream`: transformaciones específicas para streams.
- `javax.xml.validation`: validación de documentos XML.
- `javax.xml.xpath`: evaluación de expresiones XPath.
- `org.w3c.dom`: interfaces del Document Object Model.
- `org.w3c.dom.bootstrap`: obtención de implementaciones DOM.
- `org.w3c.dom.css`: DOM Level 2 Style.
- `org.w3c.dom.events`: DOM Level 2 Events.
- `org.w3c.dom.html`: DOM Level 2 HTML.
- `org.w3c.dom.ls`: DOM Level 3 Load and Save.
- `org.w3c.dom.ranges`: DOM Level 2 Range.
- `org.w3c.dom.stylesheets`: DOM Level 2 StyleSheets.
- `org.w3c.dom.traversal`: DOM Level 2 Traversal.
- `org.w3c.dom.views`: DOM Level 2 Views.
- `org.w3c.dom.xpath`: DOM Level 3 XPath.
- `org.xml.sax`: interfaces SAX.
- `org.xml.sax.ext`: extensiones SAX2.
- `org.xml.sax.helpers`: helpers para aplicaciones SAX.

## 8. Compilador, modelo del lenguaje, procesamiento de anotaciones y scripting
- `javax.annotation.processing`: procesamiento de anotaciones.
- `javax.lang.model`: modelo del lenguaje Java.
- `javax.lang.model.element`: modelado de elementos del lenguaje.
- `javax.lang.model.type`: modelado de tipos.
- `javax.lang.model.util`: utilidades para el language model.
- `javax.script`: API de scripting embebido.
- `javax.tools`: interfaces para invocar herramientas como compiladores.

## 9. Gestión y monitoreo (JMX)
- `javax.management`: núcleo de JMX.
- `javax.management.loading`: carga dinámica avanzada.
- `javax.management.modelmbean`: ModelMBeans.
- `javax.management.monitor`: monitores JMX.
- `javax.management.openmbean`: tipos abiertos y descriptores Open MBean.
- `javax.management.relation`: Relation Service.
- `javax.management.remote`: acceso remoto a servidores MBean.
- `javax.management.remote.rmi`: conector remoto JMX sobre RMI.
- `javax.management.timer`: Timer MBean.

## 10. Interfaces gráficas, escritorio, medios, impresión y accesibilidad
- `java.applet`: API histórica de applets; hoy es legado.
- `java.awt`: UI base, gráficos e imágenes.
- `java.awt.color`: espacios de color.
- `java.awt.datatransfer`: transferencia de datos y portapapeles.
- `java.awt.desktop`: integración con capacidades del escritorio.
- `java.awt.dnd`: drag and drop.
- `java.awt.event`: eventos de AWT.
- `java.awt.font`: fuentes y tipografía.
- `java.awt.geom`: geometría 2D.
- `java.awt.im`: input method framework.
- `java.awt.im.spi`: SPI para métodos de entrada.
- `java.awt.image`: creación y modificación de imágenes.
- `java.awt.image.renderable`: imágenes independientes del render.
- `java.awt.print`: API general de impresión.
- `javax.accessibility`: accesibilidad para tecnologías asistivas.
- `javax.imageio`: API principal de Image I/O.
- `javax.imageio.event`: eventos durante lectura/escritura de imágenes.
- `javax.imageio.metadata`: metadatos de imágenes.
- `javax.imageio.plugins.bmp`: clases públicas del plug-in BMP.
- `javax.imageio.plugins.jpeg`: clases del plug-in JPEG.
- `javax.imageio.plugins.tiff`: clases públicas de plug-ins TIFF.
- `javax.imageio.spi`: SPI de Image I/O.
- `javax.imageio.stream`: I/O de bajo nivel para imágenes.
- `javax.print`: API principal de Java Print Service.
- `javax.print.attribute`: tipos de atributos de impresión.
- `javax.print.attribute.standard`: atributos estándar de impresión.
- `javax.print.event`: eventos y listeners de impresión.
- `javax.sound`: API general de sonido.
- `javax.sound.midi`: MIDI: I/O, secuenciación y síntesis.
- `javax.sound.midi.spi`: SPI para MIDI.
- `javax.sound.sampled`: audio muestreado: captura, procesamiento y reproducción.
- `javax.sound.sampled.spi`: SPI para audio muestreado.
- `javax.swing`: componentes UI ligeros de Swing.
- `javax.swing.border`: bordes de componentes Swing.
- `javax.swing.colorchooser`: componentes auxiliares de JColorChooser.
- `javax.swing.event`: eventos de Swing.
- `javax.swing.filechooser`: componentes auxiliares de JFileChooser.
- `javax.swing.plaf`: pluggable look and feel.
- `javax.swing.plaf.basic`: UI del look and feel Basic.
- `javax.swing.plaf.metal`: UI del look and feel Metal.
- `javax.swing.plaf.multi`: UI para múltiples look and feel.
- `javax.swing.plaf.nimbus`: UI del look and feel Nimbus.
- `javax.swing.plaf.synth`: look and feel skinnable Synth.
- `javax.swing.table`: soporte para JTable.
- `javax.swing.text`: componentes y modelos de texto.
- `javax.swing.text.html`: soporte HTML en Swing.
- `javax.swing.text.html.parser`: parser HTML por defecto.
- `javax.swing.text.rtf`: soporte RTF en Swing.
- `javax.swing.tree`: soporte para JTree.
- `javax.swing.undo`: undo/redo.

## Observaciones importantes

### 1. No todo lo que viene con un JDK es “biblioteca estándar”
Es común confundir “lo que trae mi instalación de Java” con “lo que pertenece a Java SE”. No es lo mismo. Por eso esta lista excluye paquetes `jdk.*` y `com.sun.*`, aunque aparezcan documentados o distribuidos junto con ciertas instalaciones.

### 2. `javax.*` no significa “Java EE”
Muchos paquetes `javax.*` **sí** forman parte de Java SE y siguen siendo estándar: por ejemplo `javax.sql`, `javax.crypto`, `javax.xml`, `javax.swing` o `javax.management`. El prefijo `javax` por sí solo no alcanza para decidir si algo es estándar o no.

### 3. Hay paquetes históricos que siguen apareciendo
Paquetes como `java.applet` o partes del ecosistema RMI siguen documentados, pero hoy suelen considerarse APIs de legado. Que estén en la documentación no implica que sean la primera opción para desarrollo moderno.

### 4. La lista puede cambiar entre versiones
La biblioteca estándar de Java evoluciona. Nuevas versiones pueden agregar paquetes, ajustar el estatus de ciertas APIs o mover capacidades entre “estándar”, “incubating”, “preview” o “JDK-specific”. Por eso siempre conviene contrastar con la versión exacta de la documentación que se esté usando.

## Fuentes oficiales

- Documentación general de la API de Java SE 26: https://docs.oracle.com/en/java/javase/26/docs/api/index.html
- Índice oficial de todos los paquetes: https://docs.oracle.com/en/java/javase/26/docs/api/allpackages-index.html
