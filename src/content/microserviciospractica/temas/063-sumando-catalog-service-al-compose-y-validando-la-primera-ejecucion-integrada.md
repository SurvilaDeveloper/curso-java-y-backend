---
title: "Sumando catalog-service al Compose y validando la primera ejecución integrada"
description: "Segundo paso práctico del módulo 8. Incorporación de catalog-service al compose.yaml para validar la primera ejecución integrada de infraestructura más un servicio de negocio."
order: 63
module: "Módulo 8 · Docker Compose para NovaMarket"
level: "intermedio"
draft: false
---

# Sumando `catalog-service` al Compose y validando la primera ejecución integrada

En la clase anterior hicimos un paso muy importante dentro del nuevo módulo:

- creamos el primer `compose.yaml` real de NovaMarket,
- levantamos juntos `config-server` y `discovery-server`,
- y además dejamos una primera base declarativa de infraestructura mucho más seria que una secuencia de comandos sueltos.

Eso ya tiene muchísimo valor.

Pero ahora toca el siguiente paso natural:

**sumar `catalog-service` al Compose y validar la primera ejecución integrada de infraestructura más un servicio de negocio.**

Ese es el objetivo de esta clase.

Porque una cosa es tener la base de infraestructura dentro de Compose.  
Y otra bastante distinta es comprobar que ese mismo archivo ya puede empezar a levantar también una pieza real del dominio de NovaMarket.

Ese cambio es exactamente el que vuelve a este bloque mucho más potente.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- agregado `catalog-service` al `compose.yaml`,
- mucho más claro cómo un servicio de negocio se apoya sobre la infraestructura base,
- validada la primera ejecución integrada de infraestructura más negocio,
- y NovaMarket bastante más cerca de una ejecución full-stack realmente coordinada.

La meta de hoy no es levantar todavía todo el sistema completo.  
La meta es mucho más concreta: **dar el primer paso serio desde “infraestructura en Compose” hacia “aplicación real en Compose”.**

---

## Estado de partida

Partimos de un sistema donde ya:

- `config-server` está en Compose,
- `discovery-server` está en Compose,
- el archivo base ya existe,
- y además `catalog-service` ya tiene su imagen creada desde el módulo anterior.

Eso significa que ya no hace falta discutir si Compose sirve para NovaMarket.

Ahora la pregunta útil es otra:

- **cómo empezamos a incorporar servicios de negocio reales a esa ejecución integrada sin convertir el archivo en un caos demasiado pronto**

Y esa pregunta es justamente la que vamos a resolver en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué necesita `catalog-service` para vivir dentro del Compose,
- agregarlo al archivo,
- conectarlo correctamente con la red del sistema,
- levantar la nueva versión de la composición,
- y validar que el servicio responde dentro de este entorno integrado.

---

## Qué problema queremos resolver exactamente

Hasta ahora ya logramos algo importante:

- la infraestructura base puede vivir como una composición integrada.

Eso fue un gran salto.

Pero a medida que el bloque avanza, aparece otra necesidad muy clara:

**que el Compose deje de describir solo infraestructura y empiece a describir también la aplicación real.**

Porque ahora conviene hacerse preguntas como:

- ¿cómo se ve `catalog-service` cuando ya vive dentro del mismo entorno que `config-server` y `discovery-server`?
- ¿cómo empezamos a reemplazar una ejecución artesanal por una más integrada?
- ¿cómo damos el primer paso hacia una arquitectura realmente levantable como conjunto?

Ese cambio de enfoque es justamente el corazón de esta clase.

---

## Por qué conviene empezar por `catalog-service`

A esta altura del curso, `catalog-service` sigue siendo una gran primera pieza de negocio para sumarse a Compose porque:

- ya tiene identidad clara,
- ya tiene endpoints visibles,
- y suele ser una pieza bastante cómoda para validar el patrón antes de meter servicios más acoplados al flujo de compra.

Eso vuelve a esta clase mucho más limpia y mucho más didáctica que si empezáramos directamente por todo el sistema a la vez.

---

## Paso 1 · Revisar qué ya tiene `catalog-service`

Antes de tocar el Compose, conviene recordar que `catalog-service` ya aporta varias cosas importantes:

- Dockerfile creado,
- imagen construida,
- puerto claro,
- y endpoints visibles para validar rápidamente si el servicio está vivo.

Eso hace que sea una pieza ideal para esta primera integración.

---

## Paso 2 · Agregar `catalog-service` al `compose.yaml`

Tomando como base el archivo anterior, ahora podemos agregar algo como:

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

networks:
  novamarket-net:
```

Esta versión ya tiene muchísimo valor porque deja de describir solo infraestructura y empieza a incluir una pieza real del negocio.

---

## Paso 3 · Entender por qué `depends_on` aparece ahora en `catalog-service`

Este punto importa mucho.

`catalog-service` ya forma parte de una arquitectura donde:

- usa configuración centralizada,
- y además se integra con discovery.

Por eso tiene muchísimo sentido expresar que depende, al menos conceptualmente, de que:

- `config-server`
- y `discovery-server`

formen parte de la composición.

Esto no resuelve todavía toda la historia fina de readiness, pero sí hace muchísimo más legible la intención del sistema.

---

## Paso 4 · Pensar qué pasa con la configuración remota dentro del contenedor

Este punto vale muchísimo la pena.

Una vez que `catalog-service` corre dentro de Compose, ya no conviene pensar sus URLs igual que cuando todo corría desde localhost puro.

Dentro de la red de Compose, el servicio debería empezar a resolver otras piezas por el nombre del servicio definido en la composición, no por `localhost`.

Eso significa que, en esta etapa, probablemente ya convenga empezar a revisar si configuraciones como las del Config Server usan referencias apropiadas al nombre del servicio dentro de la red Docker.

Ese matiz es muy importante porque Compose no solo junta contenedores: también cambia la forma en que se encuentran entre sí.

---

## Paso 5 · Levantar nuevamente la composición

Ahora levantá la composición actualizada:

```bash
docker compose up
```

o:

```bash
docker compose up -d
```

La idea es que ahora la composición ya levante:

- `config-server`
- `discovery-server`
- `catalog-service`

y que el arranque completo ya se sienta un poco más cercano a “aplicación real integrada”.

Ese es uno de los momentos más importantes de toda la clase.

---

## Paso 6 · Verificar que `catalog-service` esté vivo

Ahora probá:

```bash
curl http://localhost:8081/products
```

y también:

```bash
curl http://localhost:8081/products/1
```

Lo esperable es que el servicio siga respondiendo correctamente, pero ahora como parte de una composición y no como un contenedor suelto levantado a mano.

Ese cambio importa muchísimo, porque marca el paso de:

- “servicio dockerizado”
a
- “servicio integrado dentro de una composición real”

---

## Paso 7 · Verificar Eureka

Si el sistema ya quedó bien alineado en esta etapa, también conviene mirar:

```txt
http://localhost:8761
```

y comprobar si `catalog-service` aparece correctamente registrado dentro del entorno Compose.

Ese paso vale muchísimo porque confirma no solo que el servicio vive, sino que vive dentro de la arquitectura completa.

---

## Paso 8 · Entender qué acabamos de ganar

Este punto importa muchísimo.

Hasta la clase anterior, Compose describía una base de infraestructura.

Ahora, en cambio, ya empieza a describir:

- infraestructura
- más
- al menos un servicio real del dominio

Ese cambio vuelve al bloque mucho más potente y mucho más cercano al sistema que de verdad queremos ejecutar.

---

## Paso 9 · Entender qué todavía no resolvimos

También conviene ser honestos.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya corre completo en Compose”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene su primera ejecución integrada de infraestructura más un servicio de negocio real.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase suma `catalog-service` al Compose y valida la primera ejecución integrada del sistema.

Ya no estamos solo levantando infraestructura.  
Ahora también estamos demostrando que una pieza real del dominio ya puede vivir dentro de esa composición de forma bastante más seria.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- sumamos `inventory-service`,
- sumamos `order-service`,
- sumamos `api-gateway`,
- ni armamos todavía una ejecución full-stack realmente completa.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dar el primer paso real desde infraestructura Compose hacia aplicación Compose en NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Pensar que sumar un servicio al Compose es solo copiar otra sección
En realidad cambia bastante la lectura del proyecto.

### 2. Olvidar que dentro de Compose las piezas se encuentran de otra manera
La red compartida cambia mucho el modelo mental.

### 3. No revisar Eureka además del endpoint del servicio
La integración arquitectónica importa tanto como el endpoint vivo.

### 4. Exagerar lo logrado
Todavía no estamos en ejecución completa del sistema.

### 5. No ver el valor del primer servicio de negocio dentro de Compose
Ese paso es justamente el puente hacia una ejecución full-stack real.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- `catalog-service` ya forma parte del `compose.yaml`,
- la composición puede levantar infraestructura más negocio,
- el servicio responde correctamente,
- y NovaMarket ya dio su primer paso serio hacia una ejecución integrada real.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- `catalog-service` está agregado al Compose,
- la composición levanta correctamente,
- el servicio responde por sus endpoints,
- y sentís que el proyecto ya dejó atrás la fase de “solo infraestructura en Compose”.

Si eso está bien, ya podemos pasar al siguiente tema y seguir extendiendo la composición al resto de NovaMarket.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a sumar más servicios de negocio a la composición para acercar todavía más a NovaMarket a una ejecución integrada completa con Docker Compose.

---

## Cierre

En esta clase sumamos `catalog-service` al Compose y validamos la primera ejecución integrada.

Con eso, NovaMarket deja de usar Docker Compose solo para infraestructura y empieza a mostrar, de forma concreta, cómo una parte real del dominio ya puede vivir junto a su base de soporte dentro de una aplicación multicontenedor mucho más seria.
