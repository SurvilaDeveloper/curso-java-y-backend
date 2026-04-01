---
title: "Docker"
description: "Qué es Docker, por qué se usa tanto en backend moderno y cómo ayuda a ejecutar aplicaciones Java de forma consistente entre entornos."
order: 43
module: "Despliegue y producción"
level: "intermedio"
draft: false
---

## Introducción

En la lección anterior viste despliegue, o sea, el paso de llevar una aplicación desde tu máquina a un entorno real y accesible.

Eso te permitió ver que el despliegue implica bastante más que simplemente correr un `.jar`.

Aparecen temas como:

- configuración externa
- puertos
- variables de entorno
- base de datos
- logs
- seguridad
- diferencias entre entornos

Ahora entra una herramienta que se volvió central en el backend moderno para reducir muchos de esos problemas: Docker.

Docker ayuda muchísimo a que una aplicación se ejecute de forma más consistente entre entornos distintos.

## Qué es Docker

Docker es una herramienta que permite empaquetar una aplicación junto con lo necesario para ejecutarla dentro de un contenedor.

Dicho simple:

- tu app no viaja sola
- viaja acompañada por un entorno definido
- eso reduce diferencias entre máquinas y despliegues

## La idea general

Uno de los problemas más clásicos del desarrollo es este:

**“En mi máquina funciona”**

Eso puede pasar por diferencias como:

- versión de Java distinta
- sistema operativo distinto
- configuraciones distintas
- dependencias faltantes
- comandos de arranque distintos

Docker ayuda a resolver esto definiendo un entorno reproducible.

## Qué es un contenedor

Un contenedor es una unidad ligera y aislada donde corre una aplicación junto con su entorno necesario.

No hace falta pensar un contenedor como una máquina virtual completa.

La idea más útil al empezar es esta:

un contenedor es una forma empaquetada y controlada de ejecutar tu aplicación.

## Qué gana el desarrollo con eso

Ganás cosas muy importantes como:

- más consistencia entre entornos
- despliegue más predecible
- arranques más repetibles
- menos diferencias entre desarrollo y producción
- mejor portabilidad

## Imagen y contenedor

Estas dos palabras aparecen todo el tiempo en Docker:

- imagen
- contenedor

## Imagen

Una imagen es una plantilla o snapshot que define cómo debe construirse el entorno.

## Contenedor

Un contenedor es una instancia en ejecución creada a partir de una imagen.

## Analogía útil

Podés pensarlo así:

- imagen = receta o plano
- contenedor = ejecución real de esa receta

## Docker y una app Spring Boot

Supongamos que tenés una app Java empaquetada como:

```text
target/mi-app-1.0.0.jar
```

Con Docker, podés construir una imagen que diga algo como:

- usar cierta versión de Java
- copiar el `.jar`
- ejecutar ese `.jar`

Y luego correr la app siempre de la misma forma dentro del contenedor.

## Qué problema resuelve en backend Java

En Java backend, Docker ayuda muchísimo porque evita depender de que cada entorno tenga todo configurado “a mano” exactamente igual.

Por ejemplo, en lugar de asumir que el servidor ya tiene:

- Java correcto
- variables bien puestas
- comandos correctos

podés definir gran parte de eso en una imagen.

## Dockerfile

La pieza central para construir una imagen suele ser un archivo llamado:

```text
Dockerfile
```

Ese archivo describe cómo construir la imagen.

## Ejemplo muy simple de Dockerfile para Spring Boot

```dockerfile
FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY target/mi-app-1.0.0.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
```

## Qué está pasando acá

### `FROM`

Define la imagen base.

En este caso, una imagen con Java 21.

### `WORKDIR /app`

Define el directorio de trabajo dentro del contenedor.

### `COPY`

Copia el `.jar` de tu proyecto al contenedor.

### `ENTRYPOINT`

Define el comando que se ejecutará al arrancar el contenedor.

## Qué logra este Dockerfile

Logra que tu aplicación Spring Boot pueda ejecutarse dentro de un entorno Docker de forma controlada.

En vez de depender del sistema host directamente, corrés la app dentro del contenedor.

## Construir una imagen

Una vez que tenés un `Dockerfile`, podés construir la imagen con un comando como:

```bash
docker build -t mi-app .
```

## Qué significa esto

- `docker build` → construir imagen
- `-t mi-app` → asignar nombre/tag
- `.` → usar el directorio actual como contexto de build

## Ejecutar un contenedor

Después podés correr la imagen así:

```bash
docker run -p 8080:8080 mi-app
```

## Qué significa `-p 8080:8080`

Es un mapeo de puertos.

La idea general es:

- exponer el puerto de la app dentro del contenedor
- y mapearlo al puerto de la máquina host

Si la app escucha en `8080` dentro del contenedor, con eso podés acceder desde afuera por ese mismo puerto del host.

## Por qué esto importa tanto

Porque una app backend no sirve de mucho si queda encerrada dentro del contenedor sin posibilidad de recibir tráfico correctamente.

El mapeo de puertos es clave para exponerla.

## Flujo típico con Docker en una app Java

Un flujo simplificado podría ser:

1. compilás la app
2. generás el `.jar`
3. construís una imagen Docker
4. corrés un contenedor desde esa imagen
5. accedés a la app a través del puerto expuesto

## Ejemplo

```bash
mvn clean package
docker build -t mi-app .
docker run -p 8080:8080 mi-app
```

## Variables de entorno en Docker

Igual que en despliegue general, las variables de entorno siguen siendo muy importantes.

Por ejemplo, podrías querer pasar:

- URL de base
- usuario
- contraseña
- secreto JWT
- puerto
- perfil activo

## Ejemplo conceptual

```bash
docker run -p 8080:8080   -e SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/appdb   -e SPRING_DATASOURCE_USERNAME=postgres   -e SPRING_DATASOURCE_PASSWORD=secret   -e JWT_SECRET=mi-clave   mi-app
```

## Qué muestra esto

Que Docker no reemplaza la necesidad de configuración.
La organiza mejor y la hace más portable.

## Docker y base de datos

Una app backend rara vez vive sola.

Muchas veces necesitás también una base de datos.

Ahí puede aparecer otra gran ventaja del ecosistema Docker: correr varios servicios separados y coordinados.

Por ejemplo:

- app Spring Boot
- PostgreSQL
- Redis
- otro servicio auxiliar

## Docker Compose

Cuando necesitás levantar varios servicios juntos, aparece una herramienta muy importante:

**Docker Compose**

Permite definir varios contenedores relacionados en un solo archivo.

## Ejemplo conceptual de `docker-compose.yml`

```yaml
version: "3.9"

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/appdb
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: secret
    depends_on:
      - db

  db:
    image: postgres:16
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"
```

## Qué expresa esto

Que querés levantar juntos:

- la aplicación
- la base de datos

Y que la app depende de la base.

## Por qué Docker Compose es tan útil

Porque simplifica muchísimo escenarios reales donde una app no corre sola.

En vez de arrancar todo manualmente, podés definir una composición coherente de servicios.

## Docker y consistencia entre entornos

Una de las mayores fortalezas de Docker es la consistencia.

Por ejemplo:

- en local usás la misma imagen base que en otro entorno
- la forma de arrancar la app es parecida
- la configuración se vuelve más explícita
- el salto a staging o producción se vuelve más controlado

## Docker no elimina toda diferencia entre entornos

Esto también conviene entenderlo.

Docker ayuda muchísimo, pero no hace magia total.

Todavía pueden existir diferencias por:

- variables distintas
- recursos de hardware
- red
- políticas de seguridad
- volumen de tráfico
- storage
- orquestación

O sea: ayuda mucho, pero no resuelve todo por sí solo.

## Docker y capas

Las imágenes Docker se construyen en capas.

No hace falta dominar todos los detalles ahora, pero sí saber que el orden del `Dockerfile` influye en cómo se cachean y reconstruyen esas capas.

Esto importa para eficiencia de build.

## Ejemplo simple de buena intuición

Si copiás todo el proyecto antes de instalar o preparar dependencias, a veces forzás rebuilds innecesarios.

Más adelante, cuando optimices imágenes, esta idea se vuelve muy útil.

## Imágenes base

Elegir la imagen base importa bastante.

Por ejemplo:

```dockerfile
FROM eclipse-temurin:21-jdk
```

Eso ya define cosas críticas como:

- versión de Java
- sistema base
- compatibilidad general

## `jdk` vs `jre`

Algunas imágenes tienen JDK completo.
Otras pueden usar un runtime más acotado.

A nivel inicial:

- JDK trae herramientas más completas
- una imagen más chica puede ser útil en producción si solo necesitás correr la app

Más adelante esto puede conectarse con optimización.

## Logs en Docker

Cuando una app corre en Docker, los logs suelen seguir siendo muy importantes.

Muchas veces se leen desde la salida estándar del contenedor.

Eso hace que observar logs siga siendo una parte crítica del diagnóstico.

## Persistencia y volúmenes

Cuando corrés servicios como bases de datos en contenedores, aparece otro concepto importante: volúmenes.

Los volúmenes sirven para conservar datos fuera del ciclo de vida efímero del contenedor.

No hace falta profundizar a fondo ahora, pero conviene saber que un contenedor no debería asumirse automáticamente como almacenamiento persistente para todo.

## Docker en desarrollo y en producción

Docker puede ser útil tanto en:

- desarrollo local
- testing
- staging
- producción

Pero el modo de uso puede variar bastante según el entorno.

En local puede ayudarte a levantar dependencias rápido.
En producción puede ayudarte a empaquetar y desplegar con más previsibilidad.

## Docker y CI/CD

Docker se integra muy bien con pipelines de CI/CD porque permite producir artefactos consistentes que luego se ejecutan en distintos entornos.

Por eso aparece muchísimo en flujos modernos de build y deploy.

## Docker y seguridad

También conviene tener cierto criterio de seguridad.

Por ejemplo:

- no meter secretos hardcodeados dentro de la imagen
- no usar imágenes dudosas sin revisar origen
- no correr configuraciones inseguras por comodidad
- minimizar superficie innecesaria cuando el proyecto crece

## Ejemplo completo simple

### Dockerfile

```dockerfile
FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY target/mi-app-1.0.0.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Flujo

```bash
mvn clean package
docker build -t mi-app .
docker run -p 8080:8080 mi-app
```

## Qué demuestra este ejemplo

Demuestra el caso base más importante:

- empaquetar una app Spring Boot
- construir una imagen
- ejecutar la aplicación dentro de un contenedor

Eso ya es un paso enorme en despliegue moderno.

## Docker Compose y app + base

### `docker-compose.yml`

```yaml
version: "3.9"

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/appdb
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: secret
    depends_on:
      - db

  db:
    image: postgres:16
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"
```

## Qué valor tiene este ejemplo

Te muestra un escenario muy realista para backend:

- app Java
- base PostgreSQL
- configuración conectada entre ambos servicios

## Buenas prácticas iniciales

## 1. No hardcodear secretos dentro de la imagen

Usar variables de entorno o mecanismos adecuados.

## 2. Tener claro qué puerto usa la app

Y mapearlo correctamente.

## 3. Mantener el Dockerfile simple al principio

No hace falta optimizar todo desde el minuto uno.

## 4. Entender qué parte pertenece al contenedor y cuál al host

Eso evita mucha confusión.

## 5. Usar Docker para reducir diferencias entre entornos, no para dejar de entender el sistema

Sigue siendo importante saber qué está pasando.

## Comparación con otros lenguajes

### Si venís de JavaScript

Docker probablemente te resulte familiar como forma de empaquetar servicios Node, frontends o bases. En Java backend cumple un rol muy similar, con la particularidad de que encaja muy bien con apps empaquetadas como `.jar`.

### Si venís de Python

Puede recordarte al uso de contenedores para apps web y servicios auxiliares. En Java y Spring Boot, Docker también se volvió extremadamente común para despliegue y desarrollo consistente.

## Errores comunes

### 1. Pensar que Docker reemplaza entender despliegue

Ayuda mucho, pero no reemplaza comprender puertos, variables, red y diagnóstico.

### 2. Hardcodear secretos en el Dockerfile

Eso es una mala práctica muy seria.

### 3. No entender el mapeo de puertos

Después la app parece “no responder” aunque esté corriendo.

### 4. No separar claramente app y base de datos como servicios distintos

Eso suele complicar el diseño.

### 5. Creer que si corre en un contenedor ya está lista para producción automáticamente

Todavía hay que pensar logs, seguridad, base, configuración, escalabilidad, etc.

## Mini ejercicio

Diseñá el empaquetado Docker de una app Spring Boot que:

- se construye con Maven
- genera un `.jar`
- corre en puerto 8080
- usa PostgreSQL
- necesita variables de entorno para base y JWT

Intentá escribir:

1. un `Dockerfile`
2. un `docker-compose.yml` conceptual
3. el comando para construir la imagen
4. el comando o flujo para correrla

## Ejemplo posible

### Dockerfile

```dockerfile
FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY target/mi-app-1.0.0.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Build

```bash
docker build -t mi-app .
```

### Run

```bash
docker run -p 8080:8080 mi-app
```

## Resumen

En esta lección viste que:

- Docker permite empaquetar una aplicación junto con su entorno de ejecución
- una imagen define cómo se construye ese entorno
- un contenedor es una instancia en ejecución de esa imagen
- Docker ayuda mucho a reducir diferencias entre entornos
- en backend Java encaja muy bien con apps Spring Boot empaquetadas como `.jar`
- Docker Compose permite coordinar varios servicios como app + base
- entender Docker te prepara muy bien para despliegues más consistentes y modernos

## Siguiente tema

En la próxima lección conviene pasar a **buenas prácticas y roadmap de profundización**, porque después de recorrer una enorme base de lenguaje, backend, persistencia, seguridad y despliegue, el siguiente paso natural es ordenar prioridades y decidir cómo seguir profundizando de forma inteligente.
