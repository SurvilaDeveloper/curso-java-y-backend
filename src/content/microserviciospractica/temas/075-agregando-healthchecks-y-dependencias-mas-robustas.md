---
title: "Agregando healthchecks y dependencias más robustas"
description: "Refinamiento del entorno Docker Compose de NovaMarket. Incorporación de healthchecks y mejora de la estrategia de arranque para lograr un stack más estable y predecible."
order: 75
module: "Módulo 11 · Despliegue operativo con Docker Compose"
level: "intermedio"
draft: false
---

# Agregando healthchecks y dependencias más robustas

En la clase anterior ajustamos algo muy importante:

- las configuraciones del sistema empezaron a pensar mejor en el mundo Docker,
- varias referencias dejaron de depender tanto de `localhost`,
- y el stack ganó coherencia interna.

Ahora toca otro paso muy importante dentro del bloque de despliegue operativo:

**hacer que el arranque del stack sea más robusto.**

Porque una cosa es que el compose tenga todos los servicios declarados.  
Y otra bastante distinta es que todos arranquen de una forma razonablemente ordenada y confiable.

En sistemas con varias piezas, estos problemas son muy comunes:

- un servicio arranca antes que Config Server esté listo
- otro intenta registrarse antes de que Eureka esté realmente operativo
- otro depende de RabbitMQ, pero el broker todavía está subiendo
- el stack “levantó”, pero varias piezas quedaron medio rotas en el primer intento

Ese es el terreno de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mejorada la estrategia de arranque del `docker-compose.yml`,
- definidos healthchecks básicos en piezas importantes,
- más expresivas las dependencias del stack,
- y más estable el entorno integrado de NovaMarket.

No hace falta todavía llegar a una orquestación perfecta de nivel producción.  
La meta es que el arranque deje de ser frágil.

---

## Estado de partida

Partimos de un entorno donde:

- el compose ya existe,
- los servicios principales ya están modelados,
- y varias referencias internas ya fueron ajustadas para funcionar mejor dentro de Docker.

Pero todavía es normal que el stack dependa demasiado de:

- el orden de suerte del arranque,
- tiempos manuales,
- o reinicios adicionales cuando alguna pieza intentó arrancar demasiado pronto.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- identificar los servicios más críticos para la readiness del entorno,
- agregar healthchecks básicos,
- revisar el uso de `depends_on`,
- y dejar el stack más robusto frente al arranque coordinado de sus piezas.

---

## Qué problema queremos resolver

En Docker Compose, declarar un servicio no garantiza que esté realmente **listo** para ser consumido por otros.

Y esa diferencia entre:

- “el proceso arrancó”
- y “el servicio está listo”

es justamente una de las fuentes principales de fragilidad operativa.

Esta clase apunta a atacar ese problema.

---

## Paso 1 · Identificar las piezas más sensibles del arranque

No todos los servicios tienen el mismo impacto cuando todavía no están listos.

Los candidatos más importantes son:

- `config-server`
- `discovery-server`
- `rabbitmq`
- `zipkin`
- `keycloak`

Y después, por dependencia, también:

- `order-service`
- `notification-service`
- `api-gateway`

La idea es empezar por las piezas más críticas del ecosistema.

---

## Paso 2 · Agregar un healthcheck a RabbitMQ

RabbitMQ es una dependencia muy importante del bloque asincrónico.

Por eso conviene que el compose tenga una forma de verificar que realmente está listo.

Conceptualmente, un bloque razonable podría verse así:

```yaml
rabbitmq:
  image: rabbitmq:management
  ports:
    - "5672:5672"
    - "15672:15672"
  healthcheck:
    test: ["CMD", "rabbitmq-diagnostics", "ping"]
    interval: 10s
    timeout: 5s
    retries: 10
```

No hace falta obsesionarse con cada número exacto.  
Lo importante es que el stack ya empiece a tener una noción explícita de salud del broker.

---

## Paso 3 · Agregar un healthcheck a Zipkin

Zipkin también conviene verificarlo si el entorno depende de él para trazas.

Una versión conceptual razonable podría ser:

```yaml
zipkin:
  image: openzipkin/zipkin
  ports:
    - "9411:9411"
  healthcheck:
    test: ["CMD", "wget", "--spider", "-q", "http://localhost:9411/"]
    interval: 10s
    timeout: 5s
    retries: 10
```

Esto deja una forma clara de saber cuándo la UI o el servicio están realmente accesibles.

---

## Paso 4 · Agregar un healthcheck a Keycloak

Keycloak suele tardar un poco más en arrancar que otras piezas, así que es un gran candidato para healthcheck.

Una versión conceptual podría ser algo como verificar que su endpoint principal esté accesible.

No hace falta que el healthcheck sea ultrafino.  
Con que nos ayude a distinguir entre:

- “el contenedor ya arrancó”
- y “la app ya responde”

ya aporta bastante.

---

## Paso 5 · Agregar healthchecks a `config-server` y `discovery-server`

Acá el valor es enorme.

Como muchos servicios del stack dependen de estas dos piezas, conviene que el compose tenga una forma de comprobarlas.

Si ambos exponen Actuator, una opción muy razonable es usar `/actuator/health`.

Por ejemplo, conceptualmente:

```yaml
config-server:
  build: ./services/config-server
  ports:
    - "8888:8888"
  healthcheck:
    test: ["CMD", "wget", "--spider", "-q", "http://localhost:8888/actuator/health"]
    interval: 10s
    timeout: 5s
    retries: 15
```

Y algo equivalente para `discovery-server`.

Esto es especialmente valioso porque ya venimos usando Actuator justamente para exponer salud operativa.

---

## Paso 6 · Revisar `depends_on`

Hasta ahora, `depends_on` seguramente ya expresaba relaciones básicas del stack.

Pero ahora conviene pensar en una versión más robusta.

No se trata solo de:

- que A dependa de B

sino, idealmente, de:

- que A espere a que B esté en un estado utilizable

La forma exacta disponible depende de la variante de Compose que estés usando, pero conceptualmente la mejora que queremos hacer es esta:

- el stack ya no solo expresa relaciones,
- también empieza a expresar cierta expectativa de readiness.

---

## Paso 7 · Pensar dependencias más realistas para los servicios

Por ejemplo:

### `order-service`
Conviene que dependa razonablemente de:
- `config-server`
- `discovery-server`
- `rabbitmq`

### `notification-service`
Conviene que dependa de:
- `config-server`
- `discovery-server`
- `rabbitmq`

### `api-gateway`
Conviene que dependa de:
- `config-server`
- `discovery-server`

No hace falta modelar una telaraña imposible de mantener.  
La idea es expresar lo que realmente sostiene el arranque básico del sistema.

---

## Paso 8 · Revisar si todos los servicios críticos ya exponen `health`

Para que los healthchecks sean cómodos y consistentes, ayuda muchísimo que los servicios importantes ya tengan Actuator con `/actuator/health`.

A esta altura del curso ya venimos trabajando bastante eso, así que esta clase también funciona como una gran oportunidad para usar esa inversión de forma operativa.

---

## Paso 9 · Refinar el compose

Con todo esto, el `docker-compose.yml` empieza a pasar de una forma “solo declarativa” a una forma más parecida a un stack con cierta conciencia de salud.

No hace falta que el archivo se vuelva gigantesco ni excesivamente sofisticado.  
Lo importante es que el arranque deje de depender tanto del azar o de la paciencia manual del operador.

---

## Paso 10 · Volver a levantar el stack

Ahora conviene bajar el stack si hace falta y volver a levantarlo con la nueva versión del compose.

La idea es observar si:

- el arranque se siente más ordenado,
- las piezas tardan menos en romperse por timing,
- y el entorno integrado se vuelve más estable.

No hace falta que quede perfecto a la primera.  
Pero esta clase debería mejorar bastante la experiencia operativa.

---

## Paso 11 · Observar logs y tiempos de arranque

Volvé a mirar los logs del stack.

Ahora queremos prestar atención a algo más fino que en la clase anterior:

- qué servicios esperan mejor a otros
- dónde todavía puede haber fricción
- y si el arranque general se siente más predecible

Este análisis es muy importante porque el valor de healthchecks y dependencias no es teórico: se nota mucho en la operación concreta.

---

## Qué estamos logrando con esta clase

Esta clase mejora bastante la madurez del entorno integrado.

Antes, el stack podía arrancar, pero con cierta fragilidad temporal.  
Después de esta clase, empieza a tener una forma más robusta de coordinar sus piezas críticas.

Eso es un cambio muy valioso desde el punto de vista operativo.

---

## Qué todavía no hicimos

Todavía no:

- afinamos imágenes
- optimizamos tiempos de build
- pensamos perfiles múltiples más serios
- ni hablamos todavía de CI/CD

Todo eso puede venir después.

La meta de hoy es mucho más concreta:

**que el arranque del stack sea bastante más confiable y menos frágil.**

---

## Errores comunes en esta etapa

### 1. Pensar que `depends_on` solo ya resuelve readiness real
Ayuda, pero no reemplaza healthchecks útiles.

### 2. No usar Actuator donde ya lo teníamos disponible
Es una herramienta excelente para este punto del curso.

### 3. Querer healthchecks perfectos desde el primer intento
Con checks simples y buenos ya se gana muchísimo.

### 4. Meter dependencias innecesarias entre todos los servicios
Conviene priorizar relaciones realmente importantes.

### 5. No volver a levantar el stack completo después del refactor
Es necesario para sentir el cambio operativo.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, el `docker-compose.yml` debería tener una estrategia más robusta de healthchecks y dependencias, y el entorno debería arrancar de una forma más estable y predecible.

Eso deja el bloque mucho mejor preparado para el siguiente checkpoint.

---

## Punto de control

Antes de seguir, verificá que:

- los servicios críticos tienen healthchecks,
- `depends_on` está mejor pensado,
- el stack vuelve a levantar,
- y la experiencia de arranque ya se siente más robusta.

Si eso está bien, ya podemos cerrar este tramo del bloque con una validación integral del entorno mejorado.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a volver a validar NovaMarket completo sobre este compose refinado, para comprobar que el entorno no solo está mejor modelado, sino también más estable en la práctica.

---

## Cierre

En esta clase agregamos healthchecks y una estrategia más robusta de dependencias al entorno Docker Compose de NovaMarket.

Con eso, el proyecto no solo tiene un stack integrado: también empieza a tener un stack que arranca con mucha más coherencia y estabilidad.
