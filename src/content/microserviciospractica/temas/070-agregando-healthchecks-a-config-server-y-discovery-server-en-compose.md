---
title: "Agregando healthchecks a config-server y discovery-server en Compose"
description: "Primer paso práctico del nuevo subtramo del módulo 8. Incorporación de healthchecks a la infraestructura base de NovaMarket para hacer visible la salud real de los servicios dentro del compose.yaml."
order: 70
module: "Módulo 8 · Docker Compose para NovaMarket"
level: "intermedio"
draft: false
---

# Agregando healthchecks a `config-server` y `discovery-server` en Compose

En la clase anterior dejamos algo bastante claro:

- NovaMarket ya está listo para una capa más seria de arranque,
- no alcanza siempre con que los contenedores simplemente se creen,
- y lo más sano ahora es empezar por una primera mejora concreta y visible sobre la infraestructura base del sistema.

Ahora toca el paso concreto:

**agregar healthchecks a `config-server` y `discovery-server` dentro de Compose.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- definida una primera noción explícita de salud dentro del `compose.yaml`,
- `config-server` y `discovery-server` con checks visibles y razonables,
- mucho más clara la diferencia entre “contenedor arriba” y “servicio sano”,
- y NovaMarket mejor preparado para un arranque integrado más serio.

La meta de hoy no es cerrar toda la historia de readiness del stack completo.  
La meta es mucho más concreta: **hacer visible y verificable la salud de la infraestructura base dentro de Compose**.

---

## Estado de partida

Partimos de un sistema donde ya:

- `compose.yaml` describe una porción bastante seria de NovaMarket,
- infraestructura, núcleo y borde del sistema ya pueden convivir en la misma composición,
- y además el módulo ya dejó claro que el arranque del entorno merece una lectura más fina.

Eso significa que el problema ya no es si Compose sirve.  
Ahora la pregunta útil es otra:

- **cómo empezamos a expresar mejor cuándo una pieza realmente está sana dentro de la composición**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir una estrategia simple de healthcheck para la infraestructura base,
- incorporarla a `config-server`,
- incorporarla a `discovery-server`,
- volver a levantar la composición,
- y validar qué nueva claridad gana el entorno después de esa mejora.

---

## Por qué conviene empezar por `config-server` y `discovery-server`

A esta altura del módulo, estas dos piezas son un gran primer paso porque:

- ya tienen un rol central dentro del sistema,
- su salud afecta a muchas otras piezas,
- y además suelen tener endpoints muy razonables para verificar si están realmente disponibles.

Eso las vuelve ideales para inaugurar este subbloque sin introducir todavía demasiada complejidad.

---

## Qué hace bueno a un healthcheck en esta etapa

Este punto importa muchísimo.

Para esta etapa del curso, no necesitamos un healthcheck sofisticadísimo.

Necesitamos algo que sea:

- claro,
- visible,
- relativamente confiable,
- y suficientemente bueno para distinguir entre “proceso arrancado” y “servicio usable”.

Eso significa que una muy buena estrategia inicial es apoyarse en endpoints HTTP del propio servicio, idealmente algo alineado con su salud o al menos con su disponibilidad básica.

Ese criterio es muy sano.

---

## Paso 1 · Revisar si los servicios ya exponen algo razonable para verificar salud

Antes de escribir nada en el Compose, conviene revisar qué expone cada servicio.

En una arquitectura Spring Boot como NovaMarket, una opción muy cómoda suele ser apoyarse en el actuator de salud si ya está disponible.  
Y si no lo está, usar al menos un endpoint básico que indique que el servicio realmente respondió.

La idea es evitar inventar una verificación artificial cuando el sistema ya puede darnos una señal razonable.

---

## Paso 2 · Agregar un `healthcheck` a `config-server`

Una primera forma bastante razonable de expresarlo en Compose podría ser algo como:

```yaml
config-server:
  image: novamarket/config-server:dev
  ports:
    - "8888:8888"
  networks:
    - novamarket-net
  healthcheck:
    test: ["CMD", "wget", "--spider", "-q", "http://localhost:8888/actuator/health"]
    interval: 10s
    timeout: 5s
    retries: 10
    start_period: 20s
```

La sintaxis exacta puede adaptarse a las herramientas disponibles en la imagen, pero lo importante es el concepto:

- existe una verificación explícita,
- se ejecuta periódicamente,
- y el contenedor ya puede declararse como saludable o no.

Ese cambio es muchísimo más valioso de lo que parece al principio.

---

## Paso 3 · Entender qué significan estos parámetros

Conviene leerlos con calma:

### `test`
Es el comando que se ejecuta para probar salud.

### `interval`
Cada cuánto se repite el chequeo.

### `timeout`
Cuánto tiempo esperamos antes de considerar fallido el intento.

### `retries`
Cuántos fallos consecutivos toleramos antes de marcarlo como no saludable.

### `start_period`
Cuánto tiempo le damos al servicio para arrancar antes de empezar a contar fallos reales.

Entender esto importa muchísimo porque evita que healthcheck se vuelva “una receta mágica” dentro del archivo.

---

## Paso 4 · Agregar un `healthcheck` a `discovery-server`

Ahora repetimos la lógica para Eureka.

Por ejemplo:

```yaml
discovery-server:
  image: novamarket/discovery-server:dev
  ports:
    - "8761:8761"
  depends_on:
    - config-server
  networks:
    - novamarket-net
  healthcheck:
    test: ["CMD", "wget", "--spider", "-q", "http://localhost:8761/actuator/health"]
    interval: 10s
    timeout: 5s
    retries: 10
    start_period: 20s
```

Otra vez, lo importante no es memorizar una receta exacta, sino entender que:

- la salud ya no queda implícita,
- empieza a describirse explícitamente dentro del entorno.

Ese cambio vuelve a Compose mucho más serio.

---

## Paso 5 · Revisar qué hace falta dentro de la imagen para que esto funcione

Este punto importa muchísimo.

Si el contenedor no tiene la herramienta que usás en `test` —por ejemplo `wget` o `curl`— el healthcheck puede fallar no porque el servicio esté mal, sino porque la imagen no tiene cómo ejecutar esa prueba.

Eso obliga a pensar mejor el contenido real de la imagen y vuelve el bloque mucho más interesante desde el punto de vista operativo.

Conviene entonces:

- revisar qué utilidades hay dentro de la imagen,
- o adaptar el comando del check a algo que realmente exista.

Ese matiz vale mucho.

---

## Paso 6 · Levantar nuevamente la composición

Ahora levantá otra vez la composición:

```bash
docker compose up
```

o:

```bash
docker compose up -d
```

La idea es que el sistema ya no solo cree contenedores, sino que además empiece a reflejar explícitamente una noción de salud en las piezas base.

Ese es uno de los momentos más importantes de la clase.

---

## Paso 7 · Inspeccionar el estado de salud

Ahora conviene mirar el estado de la composición con algo como:

```bash
docker compose ps
```

Lo ideal es observar que `config-server` y `discovery-server` no solo aparecen como “up”, sino también con una indicación de salud o con un estado más rico que simplemente “está corriendo”.

Ese cambio es exactamente el corazón de la clase.

---

## Paso 8 · Entender qué acabamos de ganar

Este punto importa muchísimo.

Hasta ahora, la composición podía decirte que el contenedor estaba arriba.

Ahora, en cambio, empieza a decirte algo bastante mejor:

- si el servicio parece realmente sano o no

Ese salto cambia bastante la lectura del entorno.

Porque ya no alcanza con que el proceso exista.  
Ahora importa más claramente si la pieza está disponible de forma usable.

---

## Paso 9 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya resolvió completamente el arranque fino del stack”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene una primera capa explícita de healthchecks sobre la infraestructura base del sistema.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase agrega healthchecks a `config-server` y `discovery-server` y deja a Compose con una noción mucho más seria de salud sobre las piezas base.

Ya no estamos solo levantando infraestructura.  
Ahora también estamos haciendo visible cuándo esa infraestructura parece realmente sana.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- usamos todavía esa salud para refinar mejor el arranque de los demás servicios,
- ni consolidamos aún este subbloque con un checkpoint fuerte.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**hacer visible y verificable la salud de la infraestructura base dentro de Compose.**

---

## Errores comunes en esta etapa

### 1. Elegir un comando de healthcheck que la imagen no puede ejecutar
Entonces el problema no es el servicio, sino la herramienta elegida.

### 2. Usar un endpoint que no representa bien la disponibilidad real
Conviene elegir una señal razonable y explícita.

### 3. Configurar tiempos demasiado agresivos
El servicio puede tardar en arrancar y ser marcado mal.

### 4. Pensar que healthcheck ya resuelve por sí solo toda la orquestación del entorno
Todavía estamos en una primera capa.

### 5. No inspeccionar el estado después del arranque
La verificación es parte esencial de la clase.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- `config-server` y `discovery-server` ya tienen `healthcheck`,
- la composición expone mejor la salud de esas piezas,
- y NovaMarket ya ganó una primera noción explícita de servicios sanos dentro del Compose.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- ambos servicios tienen `healthcheck`,
- el archivo Compose sigue levantando correctamente,
- `docker compose ps` muestra una lectura más rica del estado,
- y sentís que el entorno ya dejó de ser tan opaco respecto de la salud real de su infraestructura base.

Si eso está bien, ya podemos pasar al siguiente tema y usar esta mejora para refinar mejor el arranque del resto del sistema.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a usar healthchecks y dependencias más expresivas para refinar el orden de arranque del entorno y reducir la fragilidad del startup de NovaMarket en Compose.

---

## Cierre

En esta clase agregamos healthchecks a `config-server` y `discovery-server` en Compose.

Con eso, NovaMarket deja de tratar a su infraestructura base como piezas que simplemente “arrancan” y empieza a mirarlas como servicios cuya salud real ya puede describirse, observarse y usarse como parte del entorno integrado.
