---
title: "Refinando los Dockerfile de los servicios"
description: "Continuación del bloque de despliegue operativo. Revisión y mejora de los Dockerfile de NovaMarket para lograr imágenes más claras, coherentes y sostenibles."
order: 77
module: "Módulo 11 · Despliegue operativo con Docker Compose"
level: "intermedio"
draft: false
---

# Refinando los Dockerfile de los servicios

En las clases anteriores conseguimos algo muy importante:

- NovaMarket ya puede levantarse como stack integrado con Docker Compose,
- ajustamos mejor la configuración al mundo Docker,
- y además mejoramos el arranque con healthchecks y dependencias más robustas.

Eso ya deja al entorno bastante bien parado.

Pero todavía queda una parte importante del despliegue operativo que conviene mejorar:

**los Dockerfile de los servicios.**

Porque una cosa es que el stack funcione.  
Y otra distinta es que las imágenes estén construidas de una manera razonable, clara y mantenible.

En esta etapa del curso ya tiene mucho sentido empezar a mirar cosas como:

- qué estamos copiando a cada imagen,
- qué comando usa cada servicio para arrancar,
- cuánto se repite entre Dockerfile,
- y si la forma actual de construir imágenes acompaña o no la madurez del proyecto.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- revisado el enfoque actual de Dockerfile en los servicios principales,
- más clara la estructura de build y runtime de cada imagen,
- y definida una base más prolija para el empaquetado del stack.

Todavía no vamos a optimizar al extremo cada imagen.  
La meta de hoy es dejar los Dockerfile en una forma más profesional y coherente.

---

## Estado de partida

Partimos de un proyecto donde los servicios ya pueden entrar al `docker-compose.yml`, lo cual implica que existe alguna estrategia de imagen para cada uno.

Pero a esta altura del curso es muy común encontrar cosas como:

- Dockerfile muy parecidos pero copiados sin criterio,
- imágenes que arrastran demasiados archivos,
- builds poco claras,
- o comandos de arranque que funcionan pero no expresan bien la intención.

Eso es normal en una primera etapa.  
Ahora toca refinar.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar la forma actual de construir imágenes,
- identificar una estructura base más limpia para los servicios,
- definir una estrategia consistente para empaquetar jars,
- y dejar Dockerfile más claros y sostenibles para NovaMarket.

---

## Qué problema queremos resolver exactamente

Cuando un proyecto crece, los Dockerfile pueden convertirse en una fuente de fricción si quedan demasiado improvisados.

Algunos síntomas típicos son:

- cuesta entender qué hace cada imagen,
- los builds tardan más de lo necesario,
- los cambios pequeños fuerzan reconstrucciones grandes,
- y aparecen diferencias arbitrarias entre servicios que conceptualmente deberían seguir el mismo criterio.

La idea de esta clase es atacar justamente ese desorden.

---

## Paso 1 · Revisar qué servicios conviene refinar primero

Para esta etapa del curso práctico, conviene enfocarse al menos en:

- `config-server`
- `discovery-server`
- `catalog-service`
- `inventory-service`
- `order-service`
- `notification-service`
- `api-gateway`

No hace falta que absolutamente todos queden optimizados de forma idéntica, pero sí conviene que todos respondan a una lógica de empaquetado bastante coherente.

---

## Paso 2 · Pensar una estructura base común

A esta altura del proyecto, una imagen razonable para un servicio Spring Boot suele responder a una idea bastante simple:

1. tener el jar ya generado
2. copiarlo a la imagen
3. arrancarlo con Java dentro del contenedor

Eso se puede expresar con un Dockerfile claro, pequeño y directo.

Por ejemplo, una base conceptual mínima y razonable podría verse así:

```dockerfile
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY target/app.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

No hace falta que todos usen exactamente ese nombre ni ese puerto, pero la estructura general ya marca una dirección mucho más clara.

---

## Paso 3 · Evitar copiar demasiado contexto innecesario

Uno de los problemas clásicos en Dockerfile es copiar demasiados archivos al contenedor sin necesidad.

Si la imagen final solo necesita ejecutar un jar, conviene evitar arrastrar:

- código fuente completo
- archivos del IDE
- directorios temporales
- documentación
- o cualquier otra cosa irrelevante para runtime

Esta clase es un buen momento para reforzar esa idea.

---

## Paso 4 · Alinear el nombre del jar o la estrategia de copia

Hay dos opciones razonables:

### Opción 1
Dejar un nombre estándar de salida para el jar antes de construir la imagen.

### Opción 2
Copiar el jar generado con un patrón y renombrarlo dentro de la imagen.

Para un curso práctico, la segunda suele ser muy cómoda.  
Conceptualmente, algo como:

```dockerfile
COPY target/*.jar app.jar
```

Esto simplifica bastante el Dockerfile y reduce fricción entre servicios.

---

## Paso 5 · Ajustar el `EXPOSE` por servicio

Aunque `EXPOSE` no publica el puerto por sí mismo, ayuda bastante a la claridad de la imagen.

Conviene que cada servicio exponga el puerto que realmente usa. Por ejemplo:

- `8888` para `config-server`
- `8761` para `discovery-server`
- `8081` catálogo
- `8082` inventario
- `8083` órdenes
- `8085` notificaciones
- `8080` gateway

Esto mejora mucho la legibilidad operativa del proyecto.

---

## Paso 6 · Revisar el comando de arranque

A veces el contenedor arranca con comandos demasiado improvisados o poco claros.

Para esta etapa del curso, conviene que el arranque sea explícito y uniforme.

Por ejemplo:

```dockerfile
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

Si más adelante quisieras sumar flags de memoria, perfiles o variables, ya tendrás una base limpia sobre la cual hacerlo.

---

## Paso 7 · Pensar el rol de `.dockerignore`

Este punto vale mucho.

Si el proyecto todavía no tiene un `.dockerignore` claro por servicio o en el contexto correspondiente, este es un gran momento para introducirlo.

Conviene excluir cosas como:

- `.git`
- `node_modules` si existieran en otro contexto
- `.idea`
- `target` que no corresponda según la estrategia
- logs
- archivos temporales

La idea es que la construcción de imagen no arrastre ruido innecesario.

---

## Paso 8 · Aplicar un criterio consistente a varios servicios

No hace falta que todos los Dockerfile sean idénticos, pero sí deberían responder a un patrón reconocible.

Eso significa que, cuando abras varios servicios del proyecto, deberías sentir algo así:

- mismo tipo de imagen base
- mismo estilo de `WORKDIR`
- misma lógica de copia
- mismo estilo de arranque

Ese tipo de consistencia vale muchísimo más de lo que parece.

---

## Paso 9 · Revisar si alguna pieza necesita un trato especial

Algunos servicios pueden requerir una pequeña atención particular.

Por ejemplo:

- `config-server` y `discovery-server` tienen puertos y roles específicos
- `api-gateway` puede terminar teniendo variables más sensibles
- `notification-service` puede depender de RabbitMQ de forma más visible

No hace falta sobrediseñar eso ahora, pero sí conviene detectar si alguno no encaja exactamente en la plantilla general.

---

## Paso 10 · Dejar un ejemplo concreto para un servicio

Por ejemplo, un Dockerfile razonable para `order-service` podría verse así:

```dockerfile
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY target/*.jar app.jar

EXPOSE 8083

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

Este tipo de estructura es:

- corta,
- clara,
- suficiente para esta etapa,
- y bastante alineada con un despliegue operativo limpio.

---

## Qué estamos logrando con esta clase

Esta clase mejora mucho la prolijidad del despliegue.

Antes, las imágenes podían existir, pero quizás de una forma demasiado improvisada.  
Después de esta clase, NovaMarket empieza a tener un criterio más uniforme y legible para empaquetar sus servicios.

Eso es una gran mejora operativa.

---

## Qué todavía no hicimos

Todavía no:

- optimizamos tamaños de imagen en profundidad,
- separamos build y runtime en dos etapas,
- ni afinamos estrategias más avanzadas de cache.

Todo eso viene después.

La meta de hoy es mucho más concreta:

**dejar los Dockerfile en una forma más clara, coherente y mantenible.**

---

## Errores comunes en esta etapa

### 1. Copiar demasiado contexto al contenedor
La imagen final debería llevar solo lo necesario para runtime.

### 2. Tener un Dockerfile distinto en estilo para cada servicio sin motivo claro
La consistencia ayuda muchísimo.

### 3. Olvidarse de `.dockerignore`
Eso suele inflar y ensuciar los builds.

### 4. Hardcodear nombres de jar demasiado frágiles
Conviene una estrategia más flexible.

### 5. Optimizar demasiado pronto sin una base clara
Primero orden, después fine-tuning.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, los Dockerfile principales de NovaMarket deberían verse bastante más prolijos y coherentes, dejando una base mejor para seguir profesionalizando el empaquetado del stack.

Eso prepara muy bien la siguiente mejora.

---

## Punto de control

Antes de seguir, verificá que:

- los Dockerfile de los servicios principales siguen una lógica común,
- el runtime está más limpio,
- el jar se copia de forma razonable,
- el arranque es claro,
- y el empaquetado general del proyecto se siente más coherente.

Si eso está bien, ya podemos pasar a una mejora todavía más fuerte: separar build y runtime.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a introducir una estrategia de **multi-stage build**.

Ese será el paso que permita mejorar todavía más las imágenes de NovaMarket, separando construcción y ejecución en etapas distintas.

---

## Cierre

En esta clase refinamos los Dockerfile de los servicios de NovaMarket.

Con eso, el proyecto gana una base mucho más clara y profesional para su empaquetado, lo que vuelve mucho más sostenible el bloque de despliegue operativo.
