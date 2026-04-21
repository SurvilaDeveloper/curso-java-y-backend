---
title: "Creando el primer compose y levantando config-server y discovery-server juntos"
description: "Primer paso práctico del módulo 8. Creación del primer compose.yaml real de NovaMarket para levantar la infraestructura base del sistema de forma integrada."
order: 62
module: "Módulo 8 · Docker Compose para NovaMarket"
level: "intermedio"
draft: false
---

# Creando el primer Compose y levantando `config-server` y `discovery-server` juntos

En la clase anterior dejamos algo bastante claro:

- NovaMarket ya está listo para entrar en Docker Compose,
- no hace falta todavía levantar todo el sistema de golpe,
- y lo más sano ahora es empezar por una primera versión chica y muy controlada del archivo de composición.

Ahora toca el paso concreto:

**crear el primer `compose.yaml` real de NovaMarket y usarlo para levantar juntos `config-server` y `discovery-server`.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creado el primer archivo `compose.yaml` del proyecto,
- descrita en él una primera porción real de la arquitectura,
- levantadas juntas las dos piezas base de infraestructura,
- y mucho más claro qué significa pasar de contenedores sueltos a una ejecución declarativa integrada.

La meta de hoy no es levantar todavía toda la aplicación.  
La meta es mucho más concreta: **hacer bien el primer Compose para que el resto del bloque quede mucho más claro y mucho más sólido**.

---

## Estado de partida

Partimos de un proyecto donde ya:

- varios servicios de negocio están dockerizados,
- la necesidad de una ejecución integrada ya quedó clara,
- y además NovaMarket ya tiene dos piezas de infraestructura que hacen muchísimo sentido como primer caso de Compose:

- `config-server`
- `discovery-server`

¿Por qué estas dos primero?

Porque forman una base muy clara del sistema y ayudan muchísimo a entender el valor de Compose antes de meter todavía el resto de la arquitectura.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- decidir dónde ubicar el archivo Compose dentro del proyecto,
- definir los primeros dos servicios,
- configurar puertos y red de forma razonable,
- levantar la composición,
- y validar que `config-server` y `discovery-server` ya pueden vivir juntos en una ejecución integrada.

---

## Qué problema queremos resolver exactamente

Hasta ahora, aunque ya existieran varias imágenes, seguir levantando infraestructura con comandos separados seguía dejando varios problemas:

- demasiados comandos manuales,
- más chance de olvidar flags o puertos,
- más dependencia de recordar el orden,
- y menos claridad sobre qué piezas forman la base del sistema.

Con Compose, queremos empezar a resolver justamente eso:

- dejar explícito qué servicios componen esta primera capa,
- cómo se llaman,
- cómo se exponen,
- y cómo se ejecutan juntos.

Ese cambio de enfoque es justamente el corazón de esta clase.

---

## Paso 1 · Elegir dónde ubicar el archivo

Para esta etapa del proyecto, lo más razonable suele ser poner el archivo Compose en la raíz de NovaMarket, con un nombre como:

```txt
compose.yaml
```

o

```txt
docker-compose.yml
```

Hoy Docker recomienda `compose.yaml`, y además encaja muy bien con la idea de dejar esta definición como parte natural del repositorio.

Eso importa mucho porque empieza a convertir la ejecución integrada del sistema en algo visible y versionable dentro del proyecto.

---

## Paso 2 · Pensar qué queremos que exprese esta primera versión

La primera versión del archivo no debería intentar expresar todo el sistema.

Conviene que diga algo mucho más concreto:

- “esta es la capa mínima de infraestructura que quiero levantar de forma integrada”

En esta etapa, eso significa:

- `config-server`
- `discovery-server`

Ese recorte es muy sano porque permite aprender el patrón Compose sin mezclar demasiado todavía.

---

## Paso 3 · Crear una primera estructura de `compose.yaml`

Una base bastante razonable para esta primera clase podría verse así:

```yaml
services:
  config-server:
    image: novamarket/config-server:dev
    ports:
      - "8888:8888"

  discovery-server:
    image: novamarket/discovery-server:dev
    ports:
      - "8761:8761"
```

Esta primera versión ya tiene muchísimo valor.

¿Por qué?

Porque describe de forma declarativa:

- qué servicios existen,
- qué imágenes usa cada uno,
- y qué puertos expone hacia afuera.

Eso ya es un cambio enorme respecto de una lista de `docker run`.

---

## Paso 4 · Entender qué piezas faltan para que esta primera versión sea real

Este punto importa mucho.

Como venimos de dockerizar servicios de negocio, ahora conviene notar algo:

para que este Compose funcione de verdad, necesitamos tener también listas las imágenes de:

- `config-server`
- `discovery-server`

Si todavía no las construiste, esta clase también te obliga a cerrar esa brecha.

Eso no es un problema.  
Al contrario: es una muy buena señal de que el módulo está empezando a ordenar mejor toda la ejecución del sistema.

---

## Paso 5 · Dockerizar `config-server` y `discovery-server` con el mismo patrón

En esta etapa no hace falta reinventar nada.

Podés seguir el mismo patrón que ya venimos usando para los otros servicios:

- generar el `.jar`
- crear el Dockerfile
- construir la imagen
- y nombrarla con una convención clara

Por ejemplo:

```bash
docker build -t novamarket/config-server:dev .
docker build -t novamarket/discovery-server:dev .
```

Lo importante no es repetir archivos por repetirlos, sino reconocer que el proyecto ya tiene una convención bastante clara de empaquetado.

---

## Paso 6 · Agregar una red explícita

Aunque Compose ya puede crear una red por defecto, en esta etapa vale mucho la pena hacerla visible.

Una versión algo más explícita del archivo podría verse así:

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
    networks:
      - novamarket-net

networks:
  novamarket-net:
```

Esto tiene muchísimo valor didáctico porque deja visible que:

- los contenedores no viven aislados,
- sino que ya empiezan a pertenecer a una red de aplicación.

Ese detalle importa bastante.

---

## Paso 7 · Pensar qué pasa con el arranque entre estas dos piezas

En esta primera etapa del Compose, no hace falta todavía resolver toda la historia fina de readiness o healthchecks.

Pero sí conviene leer algo importante:

- `discovery-server` depende conceptualmente de que `config-server` esté disponible si está cargando configuración remota,
- por lo tanto, ya empieza a importar el orden lógico de arranque.

Una forma inicial y razonable de expresarlo en Compose puede ser:

```yaml
depends_on:
  - config-server
```

Eso no resuelve toda la salud real del sistema, pero sí deja mejor documentada la intención del arranque.

---

## Paso 8 · Completar una primera versión razonable del archivo

Una versión bastante sana para esta etapa podría verse así:

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

networks:
  novamarket-net:
```

Esta versión todavía es pequeña, pero ya expresa algo muy importante:

- infraestructura base
- definida declarativamente
- y lista para levantarse como conjunto

Eso ya tiene muchísimo valor.

---

## Paso 9 · Levantar la composición

Ahora sí, desde la raíz del proyecto, levantá esta primera composición con:

```bash
docker compose up
```

o si preferís desacoplarla de la terminal:

```bash
docker compose up -d
```

La idea es observar que por primera vez NovaMarket ya puede levantar una primera capa de infraestructura desde un único archivo y un único comando.

Ese es uno de los momentos más importantes de toda la clase.

---

## Paso 10 · Verificar que ambos servicios están vivos

Ahora comprobá que:

- `config-server` responde en `http://localhost:8888`
- `discovery-server` responde en `http://localhost:8761`

No hace falta todavía meter todo el sistema atrás.

La meta de hoy es confirmar que la infraestructura base ya puede vivir como una composición integrada.

---

## Paso 11 · Entender qué acabamos de ganar

Este punto importa muchísimo.

Lo que ganamos no es solo comodidad.

Ganamos algo bastante más importante:

- el proyecto ya empieza a describir su ejecución como sistema,
- no como una colección de comandos manuales.

Ese cambio parece pequeño al principio, pero vale muchísimo desde el punto de vista operativo y pedagógico.

---

## Qué estamos logrando con esta clase

Esta clase crea el primer `compose.yaml` real de NovaMarket y lo usa para levantar juntos `config-server` y `discovery-server`.

Ya no estamos solo empaquetando piezas por separado.  
Ahora también estamos empezando a describir cómo se ejecutan juntas como parte de una aplicación multicontenedor.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- sumamos servicios de negocio al Compose,
- ni integramos aún `api-gateway`,
- ni ejecutamos todavía el sistema completo con esta composición.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dejar la primera base de infraestructura integrada dentro de un `compose.yaml` real.**

---

## Errores comunes en esta etapa

### 1. Querer meter todos los servicios en el primer Compose
Conviene empezar por una base chica y clara.

### 2. No reconocer que `config-server` y `discovery-server` también necesitan su imagen
Compose no reemplaza la necesidad de tener imágenes disponibles.

### 3. No hacer visible la red
Aunque haya una implícita, mostrarla ayuda muchísimo a entender el sistema.

### 4. Pensar que `depends_on` ya resuelve toda la salud del arranque
Todavía no estamos cerrando esa historia.

### 5. No validar los endpoints después del `docker compose up`
La verificación sigue siendo parte esencial de la clase.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- existe un `compose.yaml` real en NovaMarket,
- define al menos `config-server` y `discovery-server`,
- puede levantarlos juntos con `docker compose up`,
- y el proyecto ya ganó una primera capa de ejecución integrada declarativa.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- el archivo Compose existe y se entiende,
- las imágenes necesarias están disponibles,
- `docker compose up` funciona,
- `config-server` y `discovery-server` responden,
- y sentís que NovaMarket ya empezó a comportarse como aplicación multicontenedor real.

Si eso está bien, ya podemos pasar al siguiente tema y empezar a sumar el primer servicio de negocio a esta ejecución integrada.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a sumar `catalog-service` al Compose y validar la primera ejecución integrada de infraestructura más un servicio de negocio dentro de NovaMarket.

---

## Cierre

En esta clase creamos el primer Compose y levantamos juntos `config-server` y `discovery-server`.

Con eso, NovaMarket deja de depender de una ejecución manual de infraestructura y empieza a mostrar, de forma concreta y declarativa, cómo sus piezas base pueden vivir juntas como parte de una aplicación multicontenedor mucho más seria.
