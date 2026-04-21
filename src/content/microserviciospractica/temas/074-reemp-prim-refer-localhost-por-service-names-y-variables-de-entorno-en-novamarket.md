---
title: "Reemplazando primeras referencias localhost por service names y variables de entorno en NovaMarket"
description: "Primer paso práctico del nuevo subtramo del módulo 8. Reemplazo de referencias internas críticas basadas en localhost por nombres de servicio y variables de entorno para alinear la configuración del sistema con la red Compose."
order: 74
module: "Módulo 8 · Docker Compose para NovaMarket"
level: "intermedio"
draft: false
---

# Reemplazando primeras referencias `localhost` por service names y variables de entorno en NovaMarket

En la clase anterior dejamos algo bastante claro:

- Compose ya no puede pensarse como si fuera simplemente “mi máquina local con varios procesos”,
- dentro de la red Docker los contenedores se encuentran mejor por nombre de servicio,
- y seguir apoyando demasiada configuración interna en `localhost` empieza a quedar cada vez menos sano a medida que NovaMarket madura como entorno multicontenedor.

Ahora toca el paso concreto:

**reemplazar las primeras referencias internas críticas basadas en `localhost` por nombres de servicio y variables de entorno.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mucho más clara la diferencia entre una URL pensada para el host y una URL pensada para la red Compose,
- reemplazadas al menos algunas referencias críticas de `localhost` por nombres de servicio reales,
- introducida una primera capa razonable de variables de entorno para no rigidizar la configuración,
- y NovaMarket mejor alineado con la red real donde ya vive el sistema dentro de Docker Compose.

La meta de hoy no es reescribir toda la configuración del proyecto de una sola vez.  
La meta es mucho más concreta: **hacer el primer recorte serio y coherente para que el sistema deje de mirarse a sí mismo como si todo siguiera corriendo en un único host local**.

---

## Estado de partida

Partimos de un sistema donde ya:

- el `compose.yaml` describe infraestructura, núcleo y borde,
- la red de Compose ya sostiene varias piezas reales del sistema,
- y el módulo ya dejó claro que `localhost` dentro de un contenedor no significa lo mismo que desde la máquina host.

Eso significa que el problema ya no es conceptual.  
Ahora la pregunta útil es otra:

- **qué referencias conviene cambiar primero y cómo lo hacemos sin volver caótica la configuración**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- identificar algunas referencias internas críticas que ya no conviene dejar en `localhost`,
- mover esas referencias a nombres de servicio dentro de la red Compose,
- introducir variables de entorno para desacoplar mejor la configuración,
- y validar qué nueva coherencia gana NovaMarket después de ese cambio.

---

## Qué problema queremos resolver exactamente

Hasta ahora, muchas configuraciones del proyecto podían tener sentido en una etapa local, por ejemplo:

- `http://localhost:8888`
- `http://localhost:8761/eureka`

Eso estuvo bien durante bastante tiempo.

Pero ahora que varias piezas del sistema ya corren dentro de Compose, aparece un problema muy concreto:

**esas referencias dejan de describir correctamente la realidad interna del entorno multicontenedor.**

Porque si `catalog-service`, `order-service` o `api-gateway` viven dentro de la red Docker, ya no tiene sentido que sigan buscando a `config-server` o `discovery-server` como si estuvieran hablando consigo mismos o con el host local.

Ese cambio de lectura es justamente el corazón de esta clase.

---

## Qué referencias conviene cambiar primero

A esta altura del módulo, las mejores primeras candidatas suelen ser las más estructurales:

- la URL del Config Server
- y la URL base de Eureka

¿Por qué?

Porque:

- son piezas centrales,
- muchas otras capas dependen de ellas,
- y si siguen mal expresadas, el entorno Compose completo queda conceptualmente torcido.

Eso las vuelve el mejor primer recorte para ordenar el sistema.

---

## Paso 1 · Identificar una configuración típica que todavía huele a local

Supongamos que en alguna parte del proyecto todavía existe algo conceptualmente así:

```yaml
spring:
  config:
    import: optional:configserver:http://localhost:8888

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka
```

Esto pudo haber tenido muchísimo sentido en una etapa local.

Pero dentro de un contenedor Compose ya empieza a oler a una suposición vieja:

- que las otras piezas están en el mismo host lógico que el proceso que está leyendo esa configuración.

Y eso ya no es una buena lectura del sistema.

---

## Paso 2 · Reemplazar esas referencias por nombres de servicio

Dentro de la red Compose, una idea mucho más sana sería algo como:

```yaml
spring:
  config:
    import: optional:configserver:http://config-server:8888

eureka:
  client:
    service-url:
      defaultZone: http://discovery-server:8761/eureka
```

Este cambio tiene muchísimo valor porque ahora la configuración ya refleja mucho mejor el entorno real donde viven los contenedores.

Eso vuelve a NovaMarket bastante más coherente con su propia arquitectura.

---

## Paso 3 · Entender por qué no conviene dejar estos valores hardcodeados así para siempre

Aunque cambiar de `localhost` a nombres de servicio ya mejora muchísimo el sistema, también conviene dar un paso más sano:

- no dejar esos valores demasiado rígidos en un archivo fijo si podemos empezar a externalizarlos mejor.

Y ahí aparecen las variables de entorno como siguiente mejora natural.

Ese paso importa mucho porque nos deja sostener dos necesidades a la vez:

- coherencia con Compose
- y flexibilidad razonable de configuración

---

## Paso 4 · Introducir variables de entorno para estas URLs

Una forma razonable de empezar a hacerlo es pensar algo como:

```yaml
spring:
  config:
    import: optional:configserver:${CONFIG_SERVER_URL:http://localhost:8888}

eureka:
  client:
    service-url:
      defaultZone: ${EUREKA_SERVER_URL:http://localhost:8761/eureka}
```

La idea de esta estructura es muy valiosa:

- si no hay variable de entorno, seguís teniendo un fallback razonable para etapas locales,
- pero dentro de Compose ya podés inyectar valores correctos con nombres de servicio.

Ese patrón es uno de los más importantes de toda la clase.

---

## Paso 5 · Pasar esos valores desde el `compose.yaml`

Ahora, en el `compose.yaml`, podés empezar a inyectar algo como:

```yaml
catalog-service:
  image: novamarket/catalog-service:dev
  ports:
    - "8081:8081"
  depends_on:
    config-server:
      condition: service_healthy
    discovery-server:
      condition: service_healthy
  environment:
    CONFIG_SERVER_URL: http://config-server:8888
    EUREKA_SERVER_URL: http://discovery-server:8761/eureka
  networks:
    - novamarket-net
```

Y después repetir la misma idea en:

- `inventory-service`
- `order-service`
- `api-gateway`

según corresponda.

Esto hace que el Compose ya no sea solo un archivo de puertos y nombres de imagen.  
Ahora también empieza a inyectar la lógica correcta del entorno.

---

## Paso 6 · Entender por qué esto mejora mucho más que solo “una URL”

Este punto importa muchísimo.

A primera vista, esto puede parecer un cambio chico.

Pero en realidad cambia bastante la postura general del sistema porque:

- Compose deja de ser solo la forma de “levantar contenedores”
- y empieza a ser también la forma de expresar con qué referencias internas reales debe vivir cada pieza del sistema

Ese salto es enorme.

---

## Paso 7 · Aplicarlo primero sobre una o dos piezas y no sobre todo de golpe

Conviene hacerlo con bastante criterio.

No hace falta reescribir absolutamente todas las configuraciones del sistema en una sola clase.

De hecho, lo más sano en esta etapa suele ser:

1. corregir primero las referencias más estructurales
2. aplicarlo sobre uno o dos servicios clave
3. validar que el patrón funciona
4. y recién después extenderlo con calma al resto

Ese orden hace que el bloque sea muchísimo más claro.

---

## Paso 8 · Levantar nuevamente la composición

Ahora levantá otra vez la composición con los cambios:

```bash
docker compose up
```

o:

```bash
docker compose up -d
```

La idea es que el entorno ya no solo levante muchas piezas, sino que además lo haga con referencias internas mucho más coherentes con la red donde esas piezas viven de verdad.

Ese es uno de los momentos más importantes de toda la clase.

---

## Paso 9 · Validar que el sistema sigue respondiendo

Ahora conviene probar de nuevo:

```bash
curl http://localhost:8080/catalog/products
curl http://localhost:8080/inventory/inventory
```

y también revisar Eureka si corresponde.

Lo importante es confirmar que:

- el sistema sigue levantando,
- las piezas siguen encontrándose,
- y la configuración ahora está mucho mejor alineada con el entorno Compose que antes.

Ese cambio vale muchísimo.

---

## Paso 10 · Entender qué acabamos de ganar

Este punto importa muchísimo.

Hasta ahora, el Compose ya describía servicios, red, salud y arranque.

Ahora, en cambio, además empieza a describir algo todavía más fino:

- **cómo deben encontrarse internamente las piezas del sistema dentro de ese entorno**

Eso vuelve a la composición mucho más coherente con la realidad de NovaMarket.

---

## Qué estamos logrando con esta clase

Esta clase reemplaza las primeras referencias críticas basadas en `localhost` por nombres de servicio y variables de entorno.

Ya no estamos solo diciendo que Compose tiene red propia.  
Ahora también estamos haciendo que la configuración del sistema empiece a vivir de acuerdo con esa red.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- extendimos todavía este patrón a toda la configuración del proyecto,
- ni consolidamos aún este subbloque con un checkpoint fuerte.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dar el primer paso real para que la configuración interna del sistema deje de depender de una mirada demasiado localista basada en `localhost`.**

---

## Errores comunes en esta etapa

### 1. Cambiar de `localhost` a service names sin entender por qué
El valor real está en comprender mejor la red Compose.

### 2. Reescribir toda la configuración del proyecto de una sola vez
Conviene empezar por referencias críticas y bien entendidas.

### 3. No usar variables de entorno cuando ya tienen sentido
Eso deja demasiado rígido el sistema.

### 4. Confundir URLs internas de Compose con URLs expuestas al host
Son dos planos distintos y conviene separarlos bien.

### 5. No validar después del cambio
La verificación sigue siendo parte esencial de la clase.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- algunas referencias críticas ya dejaron de apuntar a `localhost`,
- el Compose ya inyecta valores más coherentes con la red real del sistema,
- y NovaMarket ya dio un primer paso serio hacia una configuración mucho más alineada con su entorno multicontenedor.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué referencias conviene cambiar primero,
- ves por qué usar service names mejora la coherencia interna del sistema,
- entendés el valor de las variables de entorno en esta transición,
- y sentís que el Compose ya dejó de ser solo arranque para empezar a ser también una forma más seria de expresar configuración interna.

Si eso está bien, ya podemos pasar al siguiente tema y consolidar este nuevo subbloque del módulo 8.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta primera capa de configuración interna coherente con Compose, leyendo con más claridad qué nueva postura ganó NovaMarket después de dejar atrás parte de su dependencia de `localhost`.

---

## Cierre

En esta clase reemplazamos primeras referencias `localhost` por service names y variables de entorno en NovaMarket.

Con eso, el sistema deja de pensar su configuración interna como si todavía viviera dentro de un único host local y empieza a alinearse mucho mejor con la red real y con la ejecución multicontenedor que Compose ya viene sosteniendo.
