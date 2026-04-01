---
title: "Despliegue"
description: "Qué significa desplegar una aplicación Java, cuáles son las opciones más comunes y qué conceptos conviene dominar para pasar de desarrollo local a un entorno real."
order: 42
module: "Despliegue y producción"
level: "intermedio"
draft: false
---

## Introducción

Hasta ahora recorriste una parte muy importante del camino de backend con Java:

- lenguaje
- orientación a objetos
- Spring Boot
- APIs REST
- persistencia
- testing
- seguridad con Spring Security y JWT

Eso ya te permite construir aplicaciones reales.

Pero todavía falta una pregunta decisiva:

**¿cómo hacés para que esa aplicación funcione fuera de tu máquina?**

Ahí aparece el despliegue.

Desplegar una aplicación significa llevarla desde tu entorno local a un entorno donde otros puedan usarla.

## Qué es desplegar

Desplegar una aplicación es ponerla a correr en un entorno accesible y preparado para ejecutarla de forma estable.

Dicho simple:

- en desarrollo corre en tu máquina
- en despliegue corre en otro entorno listo para uso real

## La idea general

Mientras desarrollás, normalmente hacés cosas como:

- correr la app en `localhost`
- probar endpoints en tu máquina
- usar una base local
- reiniciar manualmente cuando querés

Pero una aplicación real necesita algo más:

- un servidor o plataforma donde correr
- configuración apropiada
- acceso a red
- variables de entorno
- conexión a una base de datos real
- logs
- reinicios controlados
- seguridad mínima

## Qué problema resuelve el despliegue

El despliegue resuelve el paso entre:

- “mi app funciona en local”
- y
- “mi app está disponible en un entorno real”

Ese salto es enorme.

Muchas aplicaciones “andan en mi máquina”, pero desplegarlas bien implica entender varios conceptos nuevos.

## Entornos

Una idea muy importante al hablar de despliegue es la de entornos.

Los más comunes son:

- desarrollo
- testing
- staging
- producción

## Desarrollo

Es tu entorno local.

Ahí programás, probás y cambiás cosas constantemente.

## Testing

Entorno usado para pruebas automáticas o verificaciones.

## Staging

Un entorno parecido a producción, usado para validar antes de publicar cambios reales.

## Producción

Es el entorno donde usan la aplicación los usuarios reales.

## Por qué importa distinguir entornos

Porque no deberías tratar igual:

- credenciales
- base de datos
- logs
- puertos
- seguridad
- datos reales

Lo que sirve en desarrollo no necesariamente sirve en producción.

## Despliegue en una app Spring Boot

Una gran ventaja de Spring Boot es que simplifica bastante el despliegue.

¿Por qué?

Porque una aplicación Spring Boot puede empaquetarse como un `.jar` ejecutable.

Eso facilita mucho moverla a otro entorno.

## Empaquetado

Con Maven, una aplicación Spring Boot suele empaquetarse con algo como:

```bash
mvn clean package
```

Eso genera un archivo `.jar`, normalmente dentro de:

```text
target/
```

Por ejemplo:

```text
target/mi-app-1.0.0.jar
```

## Qué significa esto

Ese `.jar` puede ejecutarse en otra máquina que tenga Java disponible.

Por ejemplo:

```bash
java -jar mi-app-1.0.0.jar
```

Y la aplicación arranca.

## Qué hace posible Spring Boot acá

Spring Boot incluye servidor embebido en muchos escenarios web.
Por eso, en vez de desplegar tu app dentro de un servidor externo manualmente como en épocas más viejas, muchas veces simplemente corrés el `.jar`.

Eso vuelve el despliegue mucho más directo.

## Requisitos típicos de un entorno de despliegue

Para correr una app backend Java real, normalmente necesitás:

- Java instalado o una imagen que lo incluya
- el `.jar` de la aplicación
- variables de entorno
- acceso a base de datos
- puertos disponibles
- reglas de seguridad razonables
- logs y monitoreo mínimos

## Variables de entorno

Nunca conviene hardcodear cosas sensibles dentro del código.

Por ejemplo, no deberías dejar fijos en el repo:

- contraseñas de base
- secretos JWT
- claves privadas
- configuraciones sensibles

Para eso suelen usarse variables de entorno.

## Ejemplo mental

En vez de hacer esto:

```properties
spring.datasource.password=mi-password-real
jwt.secret=mi-clave-real
```

en producción conviene que esos valores vengan desde afuera del código.

## Application properties y configuración externa

Spring Boot se lleva muy bien con configuración externa.

Podés usar:

- `application.properties`
- `application.yml`
- variables de entorno
- argumentos al iniciar la app

Esto es muy importante en despliegue porque cada entorno puede necesitar configuraciones distintas.

## Ejemplo conceptual

En desarrollo podrías usar:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/dev_db
```

Y en producción algo distinto, proveniente del entorno real.

## Base de datos en producción

Una app backend real casi siempre necesita una base de datos accesible desde el entorno donde corre.

Eso implica pensar cosas como:

- host
- puerto
- nombre de base
- usuario
- contraseña
- red y permisos de conexión

## Puerto de la aplicación

Por defecto, una app Spring Boot suele arrancar en el puerto:

```text
8080
```

Pero en despliegue ese puerto puede cambiar.

Por ejemplo:

```properties
server.port=8081
```

O incluso dejarse configurable desde variables de entorno según la plataforma.

## Exponer la aplicación

Para que otros consuman tu backend, no alcanza con que la app esté corriendo.

También hace falta que:

- el entorno permita tráfico entrante
- el puerto esté accesible
- exista una URL o dominio
- haya configuración de red o reverse proxy si corresponde

## Opciones comunes de despliegue

Hoy existen varias formas comunes de desplegar una app Java/Spring Boot.

Por ejemplo:

- VPS o servidor propio
- plataformas cloud
- contenedores con Docker
- servicios tipo PaaS
- despliegue detrás de reverse proxy

## VPS

Un VPS es un servidor virtual donde vos controlás bastante del entorno.

Ventajas:

- control alto
- flexibilidad

Desventajas:

- más responsabilidad operativa
- más cosas para configurar manualmente

## PaaS

Una plataforma como servicio simplifica bastante el despliegue.

La idea suele ser:

- subís tu app
- configurás variables
- conectás base
- la plataforma se ocupa de bastante infraestructura

Ventajas:

- más simple para empezar
- menos carga operativa

Desventajas:

- menos control fino
- costos o limitaciones según el proveedor

## Docker

Docker permite empaquetar la aplicación junto con su entorno de ejecución en una imagen portable.

Eso ayuda muchísimo a que el despliegue sea más consistente.

No hace falta dominarlo ahora mismo, pero es una herramienta muy importante y muy conectada con despliegue moderno.

## Qué hace Docker conceptualmente

Te permite definir algo como:

- qué Java usa la app
- qué archivo `.jar` correr
- cómo arrancarla

Eso reduce el típico problema de:

“en mi máquina funciona, pero en el servidor no”.

## Reverse proxy

Muchas veces la aplicación no queda expuesta directamente al mundo en bruto.

Puede haber delante un reverse proxy como Nginx.

Eso puede ayudar con cosas como:

- HTTPS
- redirecciones
- manejo de dominios
- balanceo simple
- forward a la app que corre en otro puerto

## HTTPS

En producción, una API o backend serio debería considerar HTTPS.

HTTPS protege la comunicación cifrando el tráfico.

Esto es especialmente importante si hay:

- login
- tokens
- datos sensibles
- credenciales

## Dominio

En vez de acceder por IP y puerto crudos, normalmente querés algo como:

```text
https://api.midominio.com
```

Eso hace la app más usable y profesional.

## Logs

Cuando la app corre en otro entorno, necesitás poder entender qué está pasando.

Por eso los logs importan mucho.

Por ejemplo:

- errores de arranque
- fallos de conexión a base
- requests que fallan
- excepciones inesperadas

En local podés mirar la consola.
En despliegue necesitás una estrategia más seria o, al menos, clara.

## Monitoreo

A medida que una aplicación crece, también conviene mirar cosas como:

- si está levantada
- cuánta memoria usa
- si responde lento
- si tiene errores frecuentes
- si se cayó

No hace falta montar observabilidad avanzada de entrada, pero sí entender que desplegar no es solo “subir el código y olvidarse”.

## Reinicio y proceso vivo

Una app desplegada tiene que mantenerse corriendo.

Eso implica pensar:

- cómo arranca
- cómo reinicia si falla
- cómo se actualiza
- cómo evitar caídas silenciosas

En ciertos entornos esto lo maneja la plataforma.
En otros, lo tenés que manejar vos.

## Build y artefacto

Una buena práctica es tener claro qué artefacto estás desplegando.

Por ejemplo:

- rama principal actualizada
- build exitoso
- tests razonablemente pasados
- `.jar` correcto
- variables configuradas

No conviene desplegar “cualquier cosa que compila medio así”.

## Flujo conceptual simple de despliegue

Un flujo muy simplificado podría ser:

1. desarrollás en local
2. corrés tests
3. ejecutás `mvn clean package`
4. obtenés el `.jar`
5. lo movés al entorno de despliegue
6. configurás variables
7. corrés la app
8. verificás que responde
9. revisás logs y conexión a base

## Ejemplo conceptual de ejecución

```bash
java -jar target/mi-app-1.0.0.jar
```

## Qué puede fallar al desplegar

Este punto es muy importante.

No todo error de despliegue es un error del código en sí.
Puede fallar por muchas razones:

- Java no está instalado o la versión no coincide
- faltan variables de entorno
- la base de datos no responde
- el puerto está ocupado
- la app no tiene permisos necesarios
- el secreto JWT no existe
- la URL de base es incorrecta

Por eso, desplegar también implica aprender a diagnosticar.

## Diferencia entre local y producción

Algo que en local quizás “más o menos funciona” puede romperse en producción por diferencias como:

- sistema operativo distinto
- configuración distinta
- red distinta
- base distinta
- secretos ausentes
- puertos distintos
- recursos más limitados

Por eso conviene diseñar la app para ser configurable y predecible.

## Despliegue y seguridad

No conviene subir una aplicación a producción sin pensar mínimamente en seguridad.

Por ejemplo:

- no dejar secretos hardcodeados
- no dejar endpoints administrativos abiertos
- no correr con configuración insegura de prueba
- no usar contraseñas triviales reales
- no exponer detalles internos innecesarios

## Despliegue y base de datos

Una parte muy delicada del despliegue es la conexión a base.

Conviene tener claro:

- si la base ya existe
- cómo se conectará la app
- qué usuario usará
- qué permisos tendrá
- cómo se manejarán cambios de esquema

Esto se vuelve más importante a medida que el proyecto madura.

## Migraciones

Más adelante probablemente aparezca una necesidad clara:

**versionar cambios del esquema de base de datos**

Ahí suelen entrar herramientas como Flyway o Liquibase.

No hace falta profundizar ahora, pero conviene saber que en proyectos serios no todo el manejo del esquema se deja librado al azar.

## `ddl-auto` y cuidado en producción

En entornos de aprendizaje quizá veas propiedades como:

```properties
spring.jpa.hibernate.ddl-auto=update
```

Eso puede ser cómodo para empezar, pero en producción conviene entender bien sus implicancias y no depender ciegamente de ello.

## Despliegue y CI/CD

A medida que avanzás, aparece otra idea muy importante:

CI/CD

Eso significa automatizar parte del camino de:

- test
- build
- deploy

No hace falta implementarlo ya, pero sí entender que el despliegue manual total no es la única forma posible, ni siempre la mejor.

## Ejemplo mental de configuración mínima

Supongamos una app Spring Boot con:

- PostgreSQL
- JWT
- puerto configurable

En producción probablemente necesites, como mínimo:

- URL de base
- usuario de base
- contraseña de base
- secreto JWT
- puerto
- perfil o configuración adecuada

## Despliegue como habilidad real

Desplegar no es solo “saber un comando”.

Es una habilidad que mezcla:

- backend
- configuración
- sistema operativo
- red
- seguridad
- diagnóstico
- disciplina de proyecto

Por eso es tan importante en el roadmap.

## Buenas prácticas iniciales

## 1. Separar configuración de código

Usar variables de entorno y configuración externa.

## 2. No subir secretos al repositorio

Esto es crítico.

## 3. Probar la build antes de desplegar

Idealmente con tests razonables.

## 4. Revisar logs después del despliegue

No asumir que “si arrancó, ya está perfecto”.

## 5. Pensar en producción desde el diseño

No solo al final.

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede recordarte al despliegue de backends Node o servicios web, pero en Java y Spring Boot es muy típico trabajar con artefactos `.jar`, configuración externa y plataformas que ejecutan aplicaciones empaquetadas.

### Si venís de Python

Puede parecerse al despliegue de apps web con dependencias, entorno y variables, aunque en Java el flujo de build y empaquetado suele estar mucho más centrado en herramientas como Maven y artefactos ejecutables.

## Errores comunes

### 1. Hardcodear secretos

Después eso se vuelve un problema grave de seguridad.

### 2. Creer que desplegar es solo correr `java -jar`

Eso es una parte, no todo el trabajo.

### 3. No distinguir desarrollo de producción

Eso lleva a configuraciones riesgosas o frágiles.

### 4. No mirar logs ni diagnosticar fallos

Te puede dejar ciego ante problemas reales.

### 5. Depender de configuraciones mágicas sin entenderlas

Después cuesta muchísimo mantener la app.

## Mini ejercicio

Diseñá conceptualmente el despliegue de una API Spring Boot que usa:

- PostgreSQL
- JWT
- puerto configurable

Respondé:

1. qué variables de entorno necesitarías
2. qué archivo generarías con Maven
3. cómo arrancarías la app
4. qué cosas revisarías si la app no responde
5. qué datos no deberían quedar hardcodeados en el repo

## Ejemplo posible

Variables:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`
- `SERVER_PORT`

Artefacto:

- `.jar` generado con `mvn clean package`

Arranque:

```bash
java -jar target/mi-app-1.0.0.jar
```

## Resumen

En esta lección viste que:

- desplegar significa llevar una aplicación a un entorno real y accesible
- Spring Boot facilita mucho el despliegue gracias a su empaquetado ejecutable
- el despliegue requiere pensar en configuración, variables de entorno, base de datos, puertos, logs y seguridad
- producción no debería tratarse igual que desarrollo
- entender despliegue es una parte central del camino profesional en backend Java

## Siguiente tema

En la próxima lección conviene pasar a **Docker**, porque después de entender el despliegue a nivel conceptual, el siguiente paso natural es aprender una de las herramientas más importantes para empaquetar y ejecutar aplicaciones de forma consistente entre entornos.
