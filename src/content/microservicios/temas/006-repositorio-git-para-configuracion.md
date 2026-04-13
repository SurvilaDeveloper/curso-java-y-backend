---
title: "Repositorio Git para configuración"
description: "Uso de un repositorio Git como backend del Config Server de NovaMarket, organización por aplicación y entorno, y criterios prácticos para versionar configuración compartida y específica."
order: 6
module: "Módulo 2 · Configuración centralizada"
level: "base"
draft: false
---

# Repositorio Git para configuración

En la clase anterior dimos el paso más importante a nivel conceptual: dejamos de pensar la configuración como un archivo interno de cada microservicio y empezamos a centralizarla a través de un **Config Server**.

Ahora vamos a resolver una pregunta clave:

**¿de dónde obtiene esa configuración el Config Server?**

La respuesta más habitual y más didáctica para este curso es: **desde un repositorio Git**.

No se trata solo de una decisión técnica cómoda. También es una decisión muy útil para enseñar una forma de trabajo profesional. Cuando la configuración vive en Git, gana varias propiedades importantes:

- queda versionada,
- puede auditarse,
- puede organizarse por servicio y por ambiente,
- puede modificarse sin tocar el código de los microservicios,
- y se vuelve más fácil de mantener a medida que la arquitectura crece.

En esta clase vamos a integrar esa idea con **NovaMarket**, para que el sistema empiece a tomar una forma más real.

---

## El problema que estamos resolviendo

Hasta este punto, ya sabemos que los microservicios no deberían depender de configuraciones desparramadas y repetidas en archivos locales.

Pero centralizar la configuración en un servidor no alcanza por sí solo.

Todavía necesitamos una fuente confiable para almacenar esa configuración.

Si esa fuente no está bien organizada, reaparecen problemas como estos:

- dificultad para saber qué cambió,
- mezcla de propiedades de varios servicios,
- confusión entre configuración de desarrollo y producción,
- cambios manuales difíciles de rastrear,
- y pérdida de coherencia entre ambientes.

Git resuelve bien buena parte de ese escenario porque nos da:

- historial,
- versionado,
- ramas si hicieran falta,
- revisión de cambios,
- y una estructura simple para trabajar con archivos de propiedades o YAML.

---

## Qué vamos a construir en NovaMarket

A partir de esta clase vamos a asumir que `config-server` obtiene la configuración de un repositorio dedicado.

Una estructura posible para el curso sería trabajar con dos repositorios o dos áreas claramente separadas:

- `novamarket/` para el código de los microservicios,
- `novamarket-config/` para la configuración centralizada.

Esa separación tiene un valor pedagógico fuerte:

- el código del sistema queda en un lugar,
- la configuración operativa queda en otro,
- y se vuelve muy claro que son preocupaciones distintas.

---

## Por qué Git encaja tan bien en esta capa

Un repositorio Git como backend del Config Server resulta conveniente porque permite tratar la configuración como un recurso vivo y trazable.

Por ejemplo, si alguien cambia:

- un puerto,
- una URL,
- un perfil,
- un nivel de logging,
- o una configuración de cliente,

ese cambio queda registrado.

Eso ayuda mucho cuando una arquitectura distribuida empieza a tener más piezas, porque uno de los primeros problemas reales en microservicios no es solo el código: es **entender con qué configuración está corriendo cada cosa**.

En otras palabras, Git no se usa acá solamente porque “Spring Cloud Config lo soporta”, sino porque operativamente tiene mucho sentido.

---

## Estructura base del repositorio de configuración

Para NovaMarket conviene usar una estructura simple, clara y estable.

Por ejemplo:

```txt
novamarket-config/
  application.yml
  catalog-service.yml
  inventory-service.yml
  order-service.yml
  config-server.yml
  discovery-server.yml
  api-gateway.yml
```

Esta organización transmite una idea importante:

- `application.yml` sirve para propiedades compartidas,
- y luego cada servicio puede tener su archivo específico.

Más adelante podremos incorporar variantes por perfil, por ejemplo:

```txt
novamarket-config/
  application.yml
  application-dev.yml
  application-prod.yml
  catalog-service.yml
  catalog-service-dev.yml
  catalog-service-prod.yml
  inventory-service.yml
  order-service.yml
```

Eso permite separar:

- configuración global,
- configuración específica de servicio,
- y configuración específica de ambiente.

---

## La idea detrás de `application.yml`

En Spring Cloud Config, un archivo compartido como `application.yml` puede utilizarse para centralizar propiedades comunes a varias aplicaciones.

En NovaMarket podría usarse, por ejemplo, para cosas como:

- formato común de logs,
- convenciones de observabilidad,
- configuración compartida de actuator,
- o propiedades genéricas del ecosistema.

Ejemplo conceptual:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics

logging:
  pattern:
    level: "%5p [NovaMarket]"
```

La idea no es meter todo ahí.

La idea es que ese archivo contenga **solo lo verdaderamente común**.

Un error muy frecuente es usar `application.yml` como si fuera un cajón general donde termina cayendo cualquier propiedad. Cuando eso pasa, la centralización deja de ordenar y empieza a confundir.

---

## La idea detrás de los archivos por servicio

Cada servicio de NovaMarket tiene responsabilidades distintas. Por lo tanto, también necesita configuración específica.

### Ejemplo: `catalog-service.yml`

Este archivo podría contener propiedades como:

- nombre lógico del servicio,
- puerto,
- configuración de base de datos del catálogo,
- logs específicos,
- parámetros propios del dominio.

Ejemplo:

```yaml
server:
  port: 8081

spring:
  application:
    name: catalog-service
```

### Ejemplo: `inventory-service.yml`

```yaml
server:
  port: 8082

spring:
  application:
    name: inventory-service
```

### Ejemplo: `order-service.yml`

```yaml
server:
  port: 8083

spring:
  application:
    name: order-service
```

Estos ejemplos son deliberadamente simples. Lo importante en esta etapa es ver la lógica de organización.

---

## Cómo piensa Spring Cloud Config esta estructura

Cuando un microservicio arranca y conoce la ubicación del Config Server, puede solicitar su configuración usando su nombre lógico y, si corresponde, su perfil activo.

Eso hace que la resolución de propiedades siga una lógica bastante natural:

- primero se tiene en cuenta la identidad de la aplicación,
- luego el perfil,
- y además se pueden sumar propiedades compartidas.

Esto encaja muy bien con una arquitectura como NovaMarket, donde varios servicios comparten convenciones, pero también tienen diferencias claras.

---

## Primer criterio de diseño: un repositorio solo para configuración

Para el curso conviene dejar fija esta idea:

**la configuración centralizada vive en un repositorio propio**.

No significa que no existan otras estrategias posibles. Pero como base didáctica, esta decisión tiene muchas ventajas:

- simplifica la explicación,
- muestra mejor la separación de responsabilidades,
- ordena el sistema desde temprano,
- y prepara mejor al alumno para una arquitectura real.

Además, cuando más adelante aparezcan temas como seguridad, gateway, mensajería u observabilidad, ese repositorio se volverá todavía más valioso.

---

## Qué conviene guardar y qué no conviene guardar

Acá aparece una decisión muy importante.

Que Git sea una buena base para configuración **no significa** que cualquier cosa deba ir al repositorio.

### Conviene guardar

- propiedades funcionales no sensibles,
- puertos,
- nombres de aplicación,
- exposición de endpoints técnicos,
- flags no críticos,
- convenciones compartidas,
- configuraciones de entorno que no comprometen seguridad.

### No conviene guardar directamente

- contraseñas en texto plano,
- secretos sensibles,
- tokens privados,
- credenciales expuestas,
- material que requiera una estrategia más segura de manejo.

Esta distinción es importante desde ahora porque uno de los errores clásicos al hablar de configuración centralizada es confundir **configuración** con **secreto**.

No son lo mismo.

En esta etapa del curso podemos trabajar con ejemplos simples, pero conviene dejar clara la idea desde el principio.

---

## Una propuesta concreta para NovaMarket

Como columna vertebral del curso, podés asumir esta organización base:

```txt
novamarket/
  config-server/
  discovery-server/
  api-gateway/
  catalog-service/
  inventory-service/
  order-service/
  notification-service/

novamarket-config/
  application.yml
  config-server.yml
  discovery-server.yml
  api-gateway.yml
  catalog-service.yml
  inventory-service.yml
  order-service.yml
  notification-service.yml
```

Con esta estructura, el alumno entiende rápidamente que:

- el código y la configuración no viven mezclados,
- cada servicio tiene identidad propia,
- y la configuración del ecosistema entero puede inspeccionarse en un lugar claro.

---

## Cómo se conecta el Config Server al repositorio

Desde el punto de vista conceptual, `config-server` necesita saber dónde está el repositorio remoto o local desde donde va a leer la configuración.

En una primera etapa del curso, puede usarse un repositorio Git local o un repositorio remoto sencillo.

La configuración típica del `config-server` incluirá la referencia al backend Git y el branch con el que se va a trabajar.

Ejemplo conceptual:

```yaml
spring:
  cloud:
    config:
      server:
        git:
          uri: https://github.com/tu-organizacion/novamarket-config
          default-label: main
```

No hace falta obsesionarse todavía con todos los parámetros. Lo importante es entender el rol de esta pieza:

- `config-server` no inventa la configuración,
- la obtiene desde Git,
- y la expone a los demás servicios.

---

## Ventajas pedagógicas de este enfoque

Trabajar así en el curso tiene varias ventajas.

### 1. Hace visible la evolución de la arquitectura

Cada vez que agreguemos un nuevo servicio o una nueva capacidad, también podremos mostrar cómo cambia su configuración en el repositorio central.

### 2. Ayuda a enseñar ambientes

Más adelante, cuando introduzcamos perfiles como `dev` y `prod`, el alumno ya tendrá una base clara para entender dónde se expresa esa diferencia.

### 3. Reduce ruido dentro de cada microservicio

Si cada servicio vive cargado de propiedades internas, el foco del código se diluye.

Separar configuración permite que los proyectos de código se lean mejor.

### 4. Acerca el curso a una práctica profesional real

El objetivo del curso no es que NovaMarket sea un juguete, sino un proyecto didáctico con decisiones coherentes.

---

## Errores comunes al organizar la configuración en Git

Vale la pena dejar asentados algunos errores que conviene evitar.

### Error 1: mezclar todo en un solo archivo enorme

Eso hace difícil entender qué pertenece a cada servicio.

### Error 2: repetir propiedades compartidas innecesariamente

Si una convención es realmente común, conviene centralizarla.

### Error 3: usar nombres inconsistentes

Si en código el servicio se llama `order-service` pero en configuración aparece con otro nombre, la arquitectura empieza a perder claridad.

### Error 4: guardar secretos sin criterio

Eso puede volver insegura una estrategia que, bien usada, es muy útil.

### Error 5: tratar el repositorio de configuración como una carpeta técnica secundaria

En una arquitectura distribuida, la configuración centralizada no es un detalle menor. Es parte del sistema.

---

## Cómo encaja esto con el flujo principal de NovaMarket

Recordemos el flujo central del curso:

**consultar catálogo → crear orden → validar stock → registrar orden → publicar evento → notificar**

Aunque todavía no implementamos toda esa cadena, esta clase ya agrega una mejora real a la base del sistema.

Antes:
- cada servicio dependía de sus archivos locales.

Ahora:
- el ecosistema empieza a tener una fuente central de configuración,
- con identidad por servicio,
- y preparada para crecer con el proyecto.

Ese es exactamente el tipo de mejora estructural que hace valioso el roadmap del curso: cada clase deja algo visible y coherente.

---

## Qué vamos a hacer después

En la próxima clase vamos a profundizar en un punto muy importante: **cómo manejar repositorios privados y cómo pensar la configuración por entornos**.

Eso nos va a permitir responder preguntas como estas:

- ¿cómo se organiza `dev` frente a `prod`?
- ¿qué diferencias conviene centralizar por ambiente?
- ¿qué riesgos aparecen cuando un mismo sistema corre con configuraciones distintas?
- ¿cómo evitar mezclar configuración funcional con información sensible?

---

## Cierre

Usar un repositorio Git como backend del Config Server es una decisión muy natural en una arquitectura de microservicios porque convierte la configuración en un recurso versionado, trazable y organizado.

En NovaMarket, esta decisión nos permite establecer una base profesional desde temprano:

- un repositorio específico para configuración,
- archivos por servicio,
- posibilidad de configuración compartida,
- y una estructura preparada para manejar ambientes distintos.

Todavía estamos en una etapa inicial del curso, pero ya dimos un paso importante: la configuración dejó de ser un detalle interno de cada proyecto y empezó a convertirse en una capa explícita de la arquitectura.
