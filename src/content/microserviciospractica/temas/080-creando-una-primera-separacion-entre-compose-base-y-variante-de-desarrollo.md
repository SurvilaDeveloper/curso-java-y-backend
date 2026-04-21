---
title: "Creando una primera separación entre Compose base y variante de desarrollo"
description: "Primer paso práctico del nuevo subtramo del módulo 8. Separación inicial entre una definición base del sistema y una variante de desarrollo para volver más clara y sostenible la estructura del entorno de NovaMarket."
order: 80
module: "Módulo 8 · Docker Compose para NovaMarket"
level: "intermedio"
draft: false
---

# Creando una primera separación entre Compose base y variante de desarrollo

En la clase anterior dejamos algo bastante claro:

- el `compose.yaml` ya carga bastante de la arquitectura de NovaMarket,
- el entorno ya tiene suficiente tamaño como para que algunas decisiones empiecen a sentirse demasiado específicas de una modalidad de uso,
- y lo más sano ahora es empezar a distinguir mejor qué pertenece a la base común del sistema y qué pertenece a una variante más propia del desarrollo.

Ahora toca el paso concreto:

**crear una primera separación entre Compose base y variante de desarrollo.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mucho más clara la diferencia entre una definición central del sistema y una capa más específica de desarrollo,
- creado un primer archivo adicional o esquema equivalente para separar esa variante,
- más limpio el archivo Compose base,
- y NovaMarket mejor preparado para seguir creciendo sin volver rígida ni confusa la estructura del entorno.

La meta de hoy no es diseñar todos los archivos posibles del proyecto.  
La meta es mucho más concreta: **hacer la primera separación útil y razonable para que la estructura de Compose gane claridad real**.

---

## Estado de partida

Partimos de un sistema donde ya:

- el Compose describe infraestructura, núcleo y borde,
- la salud, la red y parte de la configuración externa ya están bastante mejor resueltas,
- y además el módulo ya dejó claro que no todo lo que hoy vive en el archivo principal pertenece necesariamente al mismo nivel de abstracción.

Eso significa que el problema ya no es si la separación base/variante tiene sentido.  
Ahora la pregunta útil es otra:

- **qué conviene dejar en la base y qué conviene empezar a mover a una variante de desarrollo sin sobrediseñar el proyecto**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- decidir qué parte del entorno conviene considerar base común,
- decidir qué parte conviene tratar como variante de desarrollo,
- crear una primera separación concreta entre esos niveles,
- y validar qué nueva claridad gana NovaMarket después de este cambio.

---

## Qué conviene dejar en la base

A esta altura del módulo, una base razonable suele conservar cosas como:

- servicios principales del sistema,
- redes,
- relaciones estructurales,
- healthchecks importantes,
- y la forma central de describir la arquitectura.

En otras palabras:

- lo que hace que NovaMarket sea NovaMarket como sistema
- y no solo como una modalidad particular de ejecución

Ese criterio es muy importante para no vaciar demasiado el archivo principal.

---

## Qué conviene mover primero a una variante de desarrollo

Para un primer recorte, suele tener muchísimo sentido mover cosas como:

- puertos publicados al host que sirven sobre todo para comodidad local,
- alguna configuración de debugging o desarrollo,
- y otros ajustes que no necesariamente forman parte del “ADN base” del sistema sino de la manera en que lo usamos mientras desarrollamos.

Ese tipo de elementos vuelve a esta primera separación muchísimo más clara y manejable.

---

## Paso 1 · Elegir una estrategia simple y muy comprensible

Para esta etapa del curso, una forma muy sana de empezar es:

- dejar una definición base en `compose.yaml`
- y crear una variante de desarrollo en algo como:

```txt
compose.dev.yaml
```

La idea no es complicar todavía el proyecto con demasiados archivos.

La idea es que:

- la base quede clara,
- la variante también,
- y la combinación entre ambas sea fácil de entender y ejecutar.

Ese criterio importa muchísimo.

---

## Paso 2 · Pensar qué puede quedar en la base y qué puede salir

Supongamos que hoy el archivo principal tiene muchos `ports` publicados así:

```yaml
ports:
  - "8888:8888"
  - "8761:8761"
  - "8081:8081"
  - "8082:8082"
  - "8083:8083"
  - "8080:8080"
```

Eso puede ser muy cómodo para desarrollo local.  
Pero también puede ser una buena señal de que varias de esas exposiciones pertenecen más a una variante de uso que a la base estricta del sistema.

Ese tipo de elemento es justamente un gran primer candidato para la separación.

---

## Paso 3 · Dejar la base más centrada en la arquitectura

Una primera base razonable podría quedarse con algo como:

```yaml
services:
  config-server:
    image: novamarket/config-server:dev
    networks:
      - novamarket-net
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:8888/actuator/health"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 20s

  discovery-server:
    image: novamarket/discovery-server:dev
    depends_on:
      config-server:
        condition: service_healthy
    networks:
      - novamarket-net
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:8761/actuator/health"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 20s

  catalog-service:
    image: novamarket/catalog-service:dev
    depends_on:
      config-server:
        condition: service_healthy
      discovery-server:
        condition: service_healthy
    env_file:
      - ./docker/common.env
    networks:
      - novamarket-net

  inventory-service:
    image: novamarket/inventory-service:dev
    depends_on:
      config-server:
        condition: service_healthy
      discovery-server:
        condition: service_healthy
    env_file:
      - ./docker/common.env
    networks:
      - novamarket-net

  order-service:
    image: novamarket/order-service:dev
    depends_on:
      config-server:
        condition: service_healthy
      discovery-server:
        condition: service_healthy
      inventory-service:
        condition: service_started
    env_file:
      - ./docker/common.env
    networks:
      - novamarket-net

  api-gateway:
    image: novamarket/api-gateway:dev
    depends_on:
      config-server:
        condition: service_healthy
      discovery-server:
        condition: service_healthy
      catalog-service:
        condition: service_started
      inventory-service:
        condition: service_started
      order-service:
        condition: service_started
    env_file:
      - ./docker/common.env
    networks:
      - novamarket-net

networks:
  novamarket-net:
```

No hace falta que esta base sea perfecta desde el primer intento.  
Lo importante es que empiece a verse más como definición central del sistema y menos como un archivo lleno de decisiones de comodidad local.

---

## Paso 4 · Crear una variante de desarrollo con puertos publicados

Ahora podés crear un archivo como:

```txt
compose.dev.yaml
```

con algo como:

```yaml
services:
  config-server:
    ports:
      - "8888:8888"

  discovery-server:
    ports:
      - "8761:8761"

  catalog-service:
    ports:
      - "8081:8081"

  inventory-service:
    ports:
      - "8082:8082"

  order-service:
    ports:
      - "8083:8083"

  api-gateway:
    ports:
      - "8080:8080"
```

Esta capa no redefine el sistema.  
Solo agrega una modalidad muy cómoda para desarrollo.

Y ese matiz importa muchísimo.

---

## Paso 5 · Entender qué acabamos de separar realmente

Este punto vale muchísimo.

No estamos separando “infraestructura” de “negocio”.  
Estamos separando algo bastante más fino:

- **base común del sistema**
- de
- **comodidades o decisiones específicas de una modalidad de ejecución**

Ese criterio mejora muchísimo la claridad estructural del entorno.

---

## Paso 6 · Levantar ambas capas juntas

Ahora podés ejecutar algo como:

```bash
docker compose -f compose.yaml -f compose.dev.yaml up
```

o en segundo plano:

```bash
docker compose -f compose.yaml -f compose.dev.yaml up -d
```

La idea es que Compose combine:

- la definición base
- con
- la variante de desarrollo

y que el sistema siga funcionando como antes, pero con una estructura mucho más sana.

Ese es uno de los momentos más importantes de toda la clase.

---

## Paso 7 · Validar que el sistema sigue respondiendo

Después del cambio, probá:

```bash
curl http://localhost:8080/catalog/products
curl http://localhost:8080/inventory/inventory
```

y revisá Eureka si corresponde.

Lo importante es confirmar que:

- la separación no rompió la ejecución,
- la combinación entre base y variante funciona,
- y el sistema ahora ya no depende de que todo viva pegado al mismo archivo principal.

---

## Paso 8 · Entender qué acabamos de ganar

Este punto importa muchísimo.

Hasta ahora, el Compose ya describía bastante bien el sistema.

Ahora, en cambio, además empieza a describir mejor **en qué nivel vive cada decisión**:

- qué pertenece a la base del sistema
- y qué pertenece a una modalidad específica de desarrollo

Eso vuelve al entorno mucho más sostenible a medida que siga creciendo.

---

## Paso 9 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya tiene su estrategia final de múltiples archivos Compose”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene una primera separación real y útil entre base del sistema y variante de desarrollo.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase crea una primera separación entre Compose base y variante de desarrollo.

Ya no estamos solo limpiando configuración externa o afinando arranque.  
Ahora también estamos haciendo que la estructura misma del entorno multicontenedor gane un nuevo nivel de claridad.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- consolidamos aún este subbloque con un checkpoint fuerte,
- ni decidimos todavía qué otros refinamientos conviene hacer después sobre la estrategia de Compose.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dar el primer paso real para que la estructura del entorno Compose deje de depender de un único archivo cada vez más cargado de decisiones mezcladas.**

---

## Errores comunes en esta etapa

### 1. Mover cosas a una variante sin entender por qué pertenecen ahí
El criterio base vs entorno importa muchísimo.

### 2. Vaciar demasiado el archivo principal
La base tiene que seguir representando el sistema de forma clara.

### 3. Crear demasiadas capas de una sola vez
En esta etapa, una sola separación útil ya aporta muchísimo.

### 4. No validar que ambas capas combinadas sigan funcionando
La verificación sigue siendo parte esencial de la clase.

### 5. Pensar que esto es solo prolijidad
En realidad mejora bastante la sostenibilidad del entorno multicontenedor.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- existe una primera separación entre base y variante de desarrollo,
- el sistema sigue levantando correctamente combinando ambas,
- el archivo principal quedó más centrado en la arquitectura,
- y NovaMarket ya dio un primer paso serio hacia una estrategia Compose más clara y sostenible.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué quedó en la base y qué pasó a la variante de desarrollo,
- ves por qué esta separación mejora la claridad del entorno,
- entendés qué cosas sí mejora este cambio y cuáles todavía quedan abiertas,
- y sentís que NovaMarket ya dejó de depender tanto de un único archivo que cargaba decisiones de niveles distintos.

Si eso está bien, ya podemos pasar al siguiente tema y consolidar este nuevo subbloque del módulo 8.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta primera separación entre Compose base y variante de desarrollo, leyendo con más claridad qué nueva postura ganó NovaMarket después de empezar a ordenar también la estructura de sus archivos de ejecución.

---

## Cierre

En esta clase creamos una primera separación entre Compose base y variante de desarrollo.

Con eso, NovaMarket deja de tratar toda su ejecución multicontenedor como si debiera vivir mezclada al mismo nivel dentro de un único archivo y empieza a sostener su entorno de una forma mucho más clara, mucho más ordenada y mucho más compatible con el crecimiento futuro del proyecto.
