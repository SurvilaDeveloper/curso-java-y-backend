---
title: "Sumando inventory-service al Compose y extendiendo la red del sistema"
description: "Siguiente paso práctico del módulo 8. Incorporación de inventory-service al compose.yaml para ampliar la ejecución integrada del sistema y reforzar la lógica de comunicación entre contenedores."
order: 64
module: "Módulo 8 · Docker Compose para NovaMarket"
level: "intermedio"
draft: false
---

# Sumando `inventory-service` al Compose y extendiendo la red del sistema

En la clase anterior dimos un paso muy importante dentro del bloque de Docker Compose:

- creamos una base de infraestructura integrada,
- sumamos `catalog-service`,
- y validamos por primera vez una ejecución donde infraestructura más un servicio de negocio ya convivían dentro de la misma composición.

Eso ya tiene muchísimo valor.

Pero ahora toca el siguiente paso natural:

**sumar `inventory-service` al Compose y extender la red real del sistema.**

Ese es el objetivo de esta clase.

Porque una cosa es tener una primera ejecución integrada mínima.  
Y otra bastante distinta es empezar a expandirla con una segunda pieza de negocio relevante que haga que la composición empiece a parecerse más al sistema real que queremos levantar.

Ese salto es exactamente el que vamos a dar ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- agregado `inventory-service` al `compose.yaml`,
- mucho más claro cómo se amplía una composición sin volverla caótica,
- reforzada la idea de red compartida entre piezas del sistema,
- y NovaMarket más cerca de una ejecución integrada del núcleo funcional.

La meta de hoy no es tener todavía todo el proyecto dentro del Compose.  
La meta es mucho más concreta: **dar un nuevo paso serio en la ampliación de la composición y consolidar el patrón de crecimiento del archivo**.

---

## Estado de partida

Partimos de un proyecto donde ya:

- `config-server` está en Compose,
- `discovery-server` está en Compose,
- `catalog-service` ya forma parte de la composición,
- y además el archivo `compose.yaml` ya dejó de ser una simple prueba de infraestructura.

Eso significa que la pregunta útil ahora ya no es:

- “¿Compose sirve para NovaMarket?”

La pregunta útil es otra:

- **¿cómo seguimos creciendo desde una composición chica pero real sin romper claridad ni orden?**

Y eso es exactamente lo que vamos a resolver en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué necesita `inventory-service` para entrar a la composición,
- sumarlo al archivo,
- levantar la nueva versión integrada,
- validar que el servicio vive correctamente dentro de la red del sistema,
- y reforzar la lectura de Compose como una descripción creciente de la arquitectura.

---

## Qué problema queremos resolver exactamente

Hasta ahora ya logramos algo importante:

- la composición dejó de ser solo infraestructura
- y ya incluye una pieza del negocio.

Eso fue un gran paso.

Pero si el objetivo es acercarnos a una ejecución real de NovaMarket, necesitamos algo más:

**seguir ampliando la composición con servicios del dominio sin perder control ni convertir el archivo en una masa confusa.**

Ese cambio de escala es justamente el corazón de esta clase.

---

## Por qué `inventory-service` es el siguiente candidato natural

A esta altura del proyecto, `inventory-service` es una muy buena siguiente pieza porque:

- ya tiene identidad fuerte dentro del flujo del sistema,
- ya representa una parte más interesante del dominio que solo lectura de catálogo,
- y además ayuda a reforzar que el Compose no está creciendo con servicios “de relleno”, sino con piezas reales del negocio.

Eso vuelve a esta clase mucho más importante que una simple repetición mecánica del paso anterior.

---

## Qué cambia al sumar un segundo servicio de negocio

Este punto importa muchísimo.

Cuando teníamos infraestructura más un solo servicio, la composición ya era valiosa, pero todavía se sentía bastante mínima.

Ahora, al sumar inventario, el sistema empieza a ganar algo más fuerte:

- la red compartida ya sostiene varias piezas de negocio,
- la lectura del archivo ya se acerca más a una arquitectura real,
- y Compose empieza a parecerse menos a una demo y más a una descripción seria del proyecto.

Ese cambio vale muchísimo.

---

## Paso 1 · Confirmar que `inventory-service` ya tiene imagen disponible

Antes de tocar el `compose.yaml`, conviene recordar algo importante:

`inventory-service` ya fue dockerizado en el módulo anterior.

Eso significa que ya deberíamos tener disponible una imagen como:

```txt
novamarket/inventory-service:dev
```

Ese punto importa mucho porque Compose no reemplaza la necesidad de tener imágenes listas.  
Se apoya sobre ellas.

---

## Paso 2 · Agregar el servicio al archivo Compose

Ahora sumá `inventory-service` al `compose.yaml`.

Una versión razonable podría verse así:

```yaml
services:
  config-server:
    image: novamarket/config-server:dev
    ports:
      - "8888:8888"
    networks:
      - novamarket-net

  discovery-server:
    image: novamarket/discovery-server:dev
    ports:
      - "8761:8761"
    depends_on:
      - config-server
    networks:
      - novamarket-net

  catalog-service:
    image: novamarket/catalog-service:dev
    ports:
      - "8081:8081"
    depends_on:
      - config-server
      - discovery-server
    networks:
      - novamarket-net

  inventory-service:
    image: novamarket/inventory-service:dev
    ports:
      - "8082:8082"
    depends_on:
      - config-server
      - discovery-server
    networks:
      - novamarket-net

networks:
  novamarket-net:
```

Esta versión ya tiene muchísimo valor porque el Compose empieza a describir más de una pieza real del dominio dentro del mismo entorno.

---

## Paso 3 · Entender qué se mantiene y qué se repite

Este paso vale mucho la pena.

Al sumar un nuevo servicio, conviene notar qué partes del patrón se repiten:

- imagen
- puertos
- red compartida
- relación conceptual con `config-server`
- relación conceptual con `discovery-server`

Ese reconocimiento importa mucho porque muestra que el archivo empieza a tener estructura, no solo acumulación.

---

## Paso 4 · Pensar la red del sistema con más seriedad

Ahora que la composición ya tiene:

- infraestructura
- catálogo
- inventario

la red `novamarket-net` deja de ser un detalle didáctico menor y empieza a verse como una parte mucho más central del sistema.

¿Por qué?

Porque ya no une solo dos contenedores.  
Empieza a sostener varias piezas que forman una parte real de la aplicación.

Ese cambio importa muchísimo para la lectura del bloque.

---

## Paso 5 · Levantar nuevamente la composición

Ahora levantá la nueva versión del archivo:

```bash
docker compose up
```

o:

```bash
docker compose up -d
```

La idea es observar cómo el sistema ya empieza a crecer como aplicación multicontenedor real y no solo como una base mínima de infraestructura.

Este es uno de los momentos más importantes de la clase, porque ya se empieza a sentir que Compose está describiendo NovaMarket de verdad.

---

## Paso 6 · Verificar que `inventory-service` responde

Ahora probá:

```bash
curl http://localhost:8082/inventory
curl http://localhost:8082/inventory/1
```

Lo esperable es que el servicio siga respondiendo correctamente, pero ahora ya como parte de una composición con infraestructura más otras piezas del dominio.

Ese matiz importa muchísimo.

---

## Paso 7 · Revisar Eureka

También conviene verificar en:

```txt
http://localhost:8761
```

que `inventory-service` aparezca correctamente registrado junto con el resto de las piezas ya levantadas.

Este paso es muy importante porque confirma que no solo levantaste otro contenedor, sino otra pieza correctamente integrada en la arquitectura.

---

## Paso 8 · Entender qué acabamos de ganar

A esta altura, Compose ya no describe solamente:

- la base del sistema
- más un ejemplo de negocio

Ahora empieza a describir una porción más reconocible de NovaMarket:

- infraestructura
- catálogo
- inventario

Ese crecimiento vuelve al archivo muchísimo más interesante y mucho más cercano a una ejecución real del proyecto.

---

## Paso 9 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya corre completo en Compose”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene una composición integrada bastante más rica, donde infraestructura más dos servicios de negocio reales ya conviven correctamente.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase suma `inventory-service` al Compose y hace crecer de forma seria la ejecución integrada del sistema.

Ya no estamos solo agregando una sección más al archivo.  
Ahora también estamos ampliando el alcance real de lo que la composición representa dentro de NovaMarket.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- sumamos `order-service`,
- ni sumamos `api-gateway`,
- ni levantamos todavía el flujo principal completo dentro de Compose.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dar un segundo paso real y sólido en la ampliación del `compose.yaml` del proyecto.**

---

## Errores comunes en esta etapa

### 1. Pensar que sumar un servicio es solo copiar y pegar
En realidad cambia bastante la lectura del sistema como conjunto.

### 2. No revisar Eureka además del endpoint del servicio
La integración arquitectónica sigue siendo clave.

### 3. No valorar la red compartida
A esta altura ya es una pieza muy importante de la composición.

### 4. Exagerar lo logrado
Todavía no estamos en la ejecución completa del sistema.

### 5. No notar que el archivo ya empieza a mostrar una arquitectura real
Ese cambio es justamente el corazón del bloque.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- `inventory-service` ya forma parte del Compose,
- la composición creció correctamente,
- el servicio responde dentro del entorno integrado,
- y NovaMarket ya tiene una base multicontenedor bastante más rica que en la clase anterior.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- `inventory-service` está agregado al Compose,
- la composición levanta correctamente,
- el servicio responde,
- aparece en Eureka,
- y sentís que el archivo ya empieza a describir una parte bastante real del sistema.

Si eso está bien, ya podemos pasar al siguiente tema y sumar la tercera pieza del núcleo del negocio.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a sumar `order-service` al Compose para completar la primera ejecución integrada del núcleo de negocio de NovaMarket dentro de Docker Compose.

---

## Cierre

En esta clase sumamos `inventory-service` al Compose y extendimos la red del sistema.

Con eso, NovaMarket deja atrás una composición todavía demasiado mínima y empieza a mostrar, de forma mucho más clara, una aplicación multicontenedor donde varias piezas reales del negocio ya conviven dentro de la misma ejecución integrada.
