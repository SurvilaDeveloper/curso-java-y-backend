---
title: "Adaptando configuración para el entorno Docker Compose"
description: "Refinamiento del despliegue operativo de NovaMarket. Ajuste de hosts, variables y referencias internas para que los servicios trabajen correctamente dentro de la red de Docker Compose."
order: 74
module: "Módulo 11 · Despliegue operativo con Docker Compose"
level: "intermedio"
draft: false
---

# Adaptando configuración para el entorno Docker Compose

En la clase anterior logramos algo muy importante:

- levantamos NovaMarket con Docker Compose,
- validamos que varias piezas del sistema podían arrancar juntas,
- y dimos el primer paso real hacia una operación local integrada.

Eso ya tiene muchísimo valor.

Pero después de ese primer arranque suele aparecer un problema muy típico en proyectos de microservicios:

**muchas configuraciones fueron pensadas originalmente para correr fuera de Docker, y no todas se llevan bien con el nuevo entorno integrado.**

Esto suele impactar en cosas como:

- hosts mal referenciados,
- servicios que todavía apuntan a `localhost`,
- URLs de infraestructura poco adecuadas para la red Docker,
- o configuraciones que sirven en desarrollo manual pero no en un stack orquestado.

Ese es el objetivo de esta clase:

**adaptar la configuración para que NovaMarket piense correctamente en modo Docker Compose.**

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- revisada la configuración de los servicios para el entorno Compose,
- reemplazadas referencias frágiles por nombres de servicio internos,
- más clara la separación entre el entorno local manual y el entorno Docker,
- y mejor alineado el stack con una operación integrada real.

Todavía no vamos a hablar de despliegue cloud ni de producción real.  
La meta de hoy es que el entorno Compose deje de sentirse “forzado” y pase a ser coherente.

---

## Estado de partida

Partimos de este contexto:

- `docker-compose.yml` ya existe,
- el stack puede arrancar,
- la infraestructura principal ya entra al entorno,
- y los microservicios también están declarados.

Pero todavía es muy normal que haya configuraciones como:

- `localhost:8888`
- `localhost:8761`
- `localhost:5672`
- `localhost:9411`

que funcionaban bien fuera de Docker, pero que dentro de la red del stack dejan de ser la mejor opción.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar referencias internas del sistema,
- adaptar hosts de infraestructura al mundo Compose,
- pensar mejor la configuración por entorno,
- y preparar una base más robusta para el arranque integrado.

---

## Qué problema queremos resolver exactamente

Cuando una aplicación corre dentro de un contenedor, `localhost` ya no significa “la máquina donde está todo el sistema”.

Significa:

**el propio contenedor.**

Ese detalle cambia muchísimo.

Por eso, una aplicación que antes usaba:

```txt
http://localhost:8888
```

para hablar con Config Server, dentro de Docker normalmente debería empezar a pensar más en algo como:

```txt
http://config-server:8888
```

Y lo mismo vale para:

- RabbitMQ
- Zipkin
- Discovery Server
- y otras piezas del stack

Ese cambio mental es el centro de la clase.

---

## Paso 1 · Identificar configuraciones sensibles a hosts

Conviene empezar haciendo un pequeño mapa de los puntos del sistema que suelen depender de hosts explícitos.

Los candidatos más claros son:

- `config-server`
- `discovery-server`
- `rabbitmq`
- `zipkin`
- `keycloak`

Y en consecuencia, también los servicios que dependen de ellos:

- `catalog-service`
- `inventory-service`
- `order-service`
- `notification-service`
- `api-gateway`

---

## Paso 2 · Revisar imports hacia Config Server

Muchos servicios pueden tener algo conceptual como esto en su configuración local:

```yaml
spring:
  config:
    import: "optional:configserver:http://localhost:8888"
```

Eso puede servir si el servicio corre directamente en tu máquina.  
Pero dentro de Docker Compose, una versión más coherente suele ser:

```yaml
spring:
  config:
    import: "optional:configserver:http://config-server:8888"
```

Este es uno de los ajustes más importantes del bloque.

---

## Paso 3 · Revisar Eureka

Algo parecido pasa con Eureka.

Si en la configuración remota o local de los servicios venías usando algo como:

```yaml
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka
```

para un entorno Docker Compose suele tener más sentido algo así:

```yaml
eureka:
  client:
    service-url:
      defaultZone: http://discovery-server:8761/eureka
```

Esto ayuda muchísimo a que los servicios se descubran correctamente dentro de la red del stack.

---

## Paso 4 · Revisar RabbitMQ

Ahora pensemos el broker.

Si antes la configuración era algo como:

```yaml
spring:
  rabbitmq:
    host: localhost
    port: 5672
```

dentro de Compose una variante mucho más razonable pasa a ser:

```yaml
spring:
  rabbitmq:
    host: rabbitmq
    port: 5672
```

Ese cambio es clave para `order-service` y `notification-service`.

---

## Paso 5 · Revisar Zipkin

Lo mismo aplica al tracing distribuido.

Si los servicios exportan trazas a algo pensado como:

```txt
http://localhost:9411
```

en el stack Compose suele tener mucho más sentido que apunten a:

```txt
http://zipkin:9411
```

Esto afecta a:

- `api-gateway`
- `order-service`
- `inventory-service`
- y cualquier otra pieza que exporte trazas

---

## Paso 6 · Revisar Keycloak

Keycloak merece una mención especial porque suele tener dos tipos de uso:

### Uso desde el navegador del desarrollador
Ahí `localhost` puede seguir teniendo sentido si exponés el puerto al host.

### Uso desde otros servicios dentro del stack
Ahí muchas veces conviene pensar en el nombre del servicio dentro de Docker.

Por eso esta clase también sirve para empezar a distinguir mejor entre:

- URLs pensadas para consumo interno del stack
- y URLs pensadas para acceso externo desde tu navegador o herramientas de prueba

Ese matiz es muy importante.

---

## Paso 7 · Pensar cómo organizar configuraciones por entorno

A esta altura ya aparece una pregunta natural:

**¿cómo conviene convivir entre configuración para ejecución local manual y configuración para Docker Compose?**

Hay varias estrategias posibles, pero para esta etapa del curso práctico conviene elegir una de estas dos:

### Opción 1 · Configuración específica para Docker
Tener variantes de configuración pensadas para el entorno Compose.

### Opción 2 · Variables de entorno desde Compose
Mantener una base común y sobreescribir hosts críticos desde `docker-compose.yml`.

No hace falta cerrar hoy el sistema perfecto de perfiles multi-entorno.  
Lo importante es que la arquitectura ya empiece a pensar sus diferencias de contexto de forma explícita.

---

## Paso 8 · Introducir variables de entorno en Compose

Una forma muy útil de empezar a resolver esto es que el `docker-compose.yml` inyecte variables concretas.

Por ejemplo, conceptualmente:

```yaml
order-service:
  build: ./services/order-service
  environment:
    CONFIG_SERVER_URL: http://config-server:8888
    EUREKA_SERVER_URL: http://discovery-server:8761/eureka
    RABBITMQ_HOST: rabbitmq
    ZIPKIN_URL: http://zipkin:9411
```

No hace falta que los nombres sean exactamente esos si tu implementación usa otros.  
La idea es que el stack deje de depender de valores rígidos embebidos en todos lados.

---

## Paso 9 · Pensar qué servicios necesitan más cuidado

No todos los servicios son igual de sensibles.

Por ejemplo:

- `notification-service` depende de RabbitMQ
- `order-service` depende de RabbitMQ, Zipkin, Config Server y Eureka
- `api-gateway` depende de Config Server, Eureka y quizás Keycloak según la integración
- `catalog-service` e `inventory-service` suelen ser más simples, pero igual dependen de Config Server y Eureka

Este mapa ayuda mucho a priorizar qué tocar primero.

---

## Paso 10 · Aplicar el mismo criterio de coherencia al stack entero

La clave de esta clase no es corregir solo un servicio aislado.

La clave es que **todo el ecosistema empiece a hablar el mismo idioma del entorno Docker**.

Eso significa que, a medida que revises cada pieza, conviene preguntarte:

- ¿este host tiene sentido dentro de la red Compose?
- ¿esta URL es para consumo interno o externo?
- ¿esto debería ir como variable?
- ¿esta referencia sigue demasiado atada al modo manual anterior?

Ese tipo de preguntas ordena muchísimo el proyecto.

---

## Qué estamos logrando con esta clase

Esta clase no cambia el negocio del sistema, pero sí mejora algo muy importante:

**la coherencia operativa del entorno integrado.**

Después de esta clase, NovaMarket deja de depender tanto de configuraciones “prestadas” del modo local manual y empieza a tener una forma mucho más consistente de correr dentro de Docker Compose.

Eso es una mejora enorme.

---

## Qué todavía no hicimos

Todavía no:

- afinamos healthchecks,
- mejoramos la readiness del stack,
- ni cerramos del todo el arranque robusto del entorno integrado.

Todo eso viene a continuación.

La meta de hoy es mucho más concreta:

**que las referencias internas del sistema sean coherentes con el mundo Docker.**

---

## Errores comunes en esta etapa

### 1. Seguir usando `localhost` dentro de contenedores
Es uno de los errores más clásicos.

### 2. No distinguir entre URLs internas y externas
Eso genera mucha confusión con herramientas como Keycloak.

### 3. Corregir un servicio y olvidarse de los demás
Conviene mirar el stack como conjunto.

### 4. Meter demasiadas decisiones de entorno de golpe
Para esta clase, conviene corregir lo crítico primero.

### 5. Pensar que si el stack “arranca” ya no hay nada que ajustar
Muchas veces arranca, pero con referencias operativamente frágiles.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, las configuraciones más importantes de NovaMarket deberían estar mejor adaptadas al entorno Docker Compose, especialmente en lo relacionado con hosts y servicios de infraestructura.

Eso deja mucho mejor preparado el siguiente paso del bloque.

---

## Punto de control

Antes de seguir, verificá que:

- Config Server ya no se referencia de forma frágil,
- Eureka tiene una URL coherente para Docker,
- RabbitMQ y Zipkin también,
- y el stack ya piensa más en nombres de servicio que en `localhost`.

Si eso está bien, ya podemos pasar a endurecer el arranque con healthchecks y dependencias más robustas.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a agregar **healthchecks** y una estrategia más robusta de `depends_on`.

Ese será el paso que le dé al entorno Compose un arranque mucho más confiable.

---

## Cierre

En esta clase adaptamos la configuración de NovaMarket al entorno Docker Compose.

Con eso, el proyecto deja atrás una parte importante de la fricción típica entre ejecución manual y ejecución orquestada, y queda mucho mejor alineado con una operación integrada real.
