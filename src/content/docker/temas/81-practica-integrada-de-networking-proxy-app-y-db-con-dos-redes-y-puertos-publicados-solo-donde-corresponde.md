---
title: "Práctica integrada de networking: proxy, app y db con dos redes y puertos publicados solo donde corresponde"
description: "Tema 81 del curso práctico de Docker: una práctica integrada donde usás proxy, app y db con dos redes en Docker Compose, segmentás frontend y backend y publicás puertos solo donde realmente hace falta para mantener el stack más claro y menos expuesto."
order: 81
module: "Networking entre servicios y puertos con Compose"
level: "intermedio"
draft: false
---

# Práctica integrada de networking: proxy, app y db con dos redes y puertos publicados solo donde corresponde

## Objetivo del tema

En este tema vas a:

- juntar varias ideas del bloque de networking en una sola práctica
- usar dos redes para separar frontend y backend
- conectar un servicio puente a ambas redes
- publicar puertos solo donde realmente corresponde
- entender mucho mejor quién habla con quién dentro del stack

La idea es bajar el bloque de networking a un caso bastante realista, donde la arquitectura ya no viva toda en una sola red compartida sin demasiado criterio.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. pensar un stack con `proxy`, `app` y `db`
2. separar frontend y backend en dos redes
3. publicar solo el puerto de entrada al stack
4. dejar la base accesible solo desde la app
5. usar un servicio puente entre ambas redes
6. cerrar el bloque con una práctica bastante más clara que “todo en una sola red”

---

## Idea central que tenés que llevarte

Hasta ahora viste dos ideas muy importantes:

- entre servicios de Compose, lo normal es conectarse por **nombre de servicio**
- publicar puertos es una decisión de exposición al host, no un requisito para que el stack se comunique internamente

Ahora aparece una práctica muy útil:

> no todos los servicios del stack deberían vivir en la misma red ni exponer puertos “por las dudas”.

Cuando separás `proxy`, `app` y `db` en redes con intención, el stack se vuelve mucho más claro.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker Compose explica que, por defecto, Compose crea una red para la aplicación y que los servicios en la misma red se descubren por nombre. También documenta el top-level `networks`, donde cada servicio recibe acceso explícito a las redes que deba usar. La guía de networking en Compose muestra un patrón con dos redes donde `proxy` queda aislado de `db` porque no comparten ninguna red y solo `app` puede hablar con ambos. La referencia del Compose file documenta además el atributo `internal`, que crea una red aislada externamente. Por su parte, Docker Engine documenta que la publicación de puertos mapea tráfico hacia el host mediante NAT/PAT y que los puertos no publicados quedan bloqueados por defecto. Y la guía oficial de PostgreSQL remarca que publicar `5432:5432` expone la base a cualquier dispositivo que pueda alcanzar tu host, mientras que `127.0.0.1:5432:5432` la limita al host local. citeturn844080view0turn844080view1turn844080view2

---

## Escenario del tema

Vas a imaginar este stack:

- `proxy`: recibe tráfico desde el host
- `app`: backend o aplicación principal
- `db`: base de datos

La intención arquitectónica es esta:

- `proxy` debe ver a `app`
- `app` debe ver a `proxy` y a `db`
- `db` no debería ver a `proxy`
- `db` no debería publicarse al host salvo necesidad muy concreta

Este patrón aparece muchísimo en proyectos reales.

---

## Estructura conceptual del stack

La idea es usar dos redes:

- `front-tier`
- `back-tier`

### `front-tier`
para la parte más cercana a la entrada del stack.

### `back-tier`
para la parte interna donde vive `db`.

El servicio `app` actúa como puente entre ambas.

---

## Stack final de la práctica

Mirá este `compose.yaml`:

```yaml
services:
  proxy:
    image: nginx
    ports:
      - "8080:80"
    depends_on:
      - app
    networks:
      - front-tier

  app:
    image: miusuario/app:dev
    environment:
      DB_HOST: db
      DB_PORT: 5432
    networks:
      - front-tier
      - back-tier

  db:
    image: postgres:18
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: mysecretpassword
    networks:
      - back-tier

networks:
  front-tier:
  back-tier:
    internal: true
```

---

## Cómo se lee este stack

La lectura conceptual sería:

- `proxy` expone `8080:80` al host
- `proxy` solo vive en `front-tier`
- `app` vive en `front-tier` y `back-tier`
- `db` solo vive en `back-tier`
- `back-tier` es una red marcada como `internal`

Esto ya expresa una arquitectura mucho más clara que una sola red compartida por todos los servicios.

---

## Qué servicio publica puerto y por qué

En este stack, solo `proxy` publica un puerto:

```yaml
ports:
  - "8080:80"
```

Docker documenta que publicar puertos es un mapeo desde el host hacia el contenedor. Los puertos no publicados quedan bloqueados por defecto. citeturn844080view2

Eso significa:

- tu navegador o tu host entra por `localhost:8080`
- no hace falta publicar la app si el acceso normal va por el proxy
- no hace falta publicar la base para que la app la use

Este punto es uno de los más valiosos de toda la práctica.

---

## Cómo entra `proxy` a `app`

Como ambos comparten `front-tier`, `proxy` puede alcanzar a `app` por nombre de servicio.

O sea, el hostname lógico dentro del stack sería:

```text
app
```

No hace falta una IP manual.
La guía oficial de Compose networking y la Quickstart refuerzan justamente esta idea de service discovery por nombre dentro de la red compartida. citeturn844080view0

---

## Cómo entra `app` a `db`

Como ambos comparten `back-tier`, `app` puede alcanzar a `db` por nombre de servicio.

Por eso en el ejemplo aparece algo como:

```yaml
environment:
  DB_HOST: db
  DB_PORT: 5432
```

Esta es la forma sana de pensar la conexión interna.

No:

```text
DB_HOST=localhost
```

porque `localhost`, dentro de `app`, apuntaría al propio contenedor `app`, no a `db`.

---

## Por qué `proxy` no ve a `db`

Porque no comparten ninguna red.

La documentación oficial de Compose muestra justamente un patrón donde `proxy` y `db` quedan aislados entre sí porque no comparten red, mientras que `app` hace de puente entre ambas. citeturn844080view0turn844080view1

Esta es una de las grandes ventajas de la segmentación:

- no todos los servicios pueden hablar con todos
- la red empieza a reflejar la arquitectura

---

## Qué aporta `internal: true` en `back-tier`

La referencia del Compose file documenta que `internal: true` crea una red aislada externamente. citeturn844080view1

La idea práctica es:

- `back-tier` sirve para tráfico interno del stack
- queda más claramente delimitada como red interna
- eso encaja perfecto con una base de datos o servicios de backend que no deberían abrirse más de la cuenta

No reemplaza todas las decisiones de seguridad.
Pero sí expresa una intención de aislamiento muy útil.

---

## Qué gana esta práctica frente a “todo en una sola red”

Gana varias cosas al mismo tiempo:

- más claridad
- menos exposición innecesaria
- menos conectividad lateral entre servicios que no deberían verse
- mejor alineación con la arquitectura real del sistema

Esto es muy distinto de un stack donde todos viven en una sola red y varios puertos se publican “por costumbre”.

---

## Qué pasa si querés acceder a `db` desde tu máquina

En esta práctica, `db` no publica ningún puerto.
Eso es totalmente correcto si solo la necesita `app`.

Pero si quisieras entrar a PostgreSQL desde tu host local para debug o administración, ahí sí podrías agregar algo como:

```yaml
services:
  db:
    ports:
      - "127.0.0.1:5432:5432"
```

La guía oficial de PostgreSQL documenta exactamente esta diferencia y advierte que `5432:5432` expone mucho más que `127.0.0.1:5432:5432`. citeturn844080view2

La enseñanza útil no es “siempre publicá 127.0.0.1”.
La enseñanza útil es:

- si la base no necesita salir del stack, no la publiques
- si la necesitás desde tu host, publicala de la forma más acotada posible

---

## Qué te enseña realmente esta práctica

Te enseña a pensar networking así:

- un servicio de entrada
- un servicio puente
- un servicio interno
- dos redes con responsabilidades distintas
- puertos publicados solo donde hace falta

Eso ya es una forma bastante más madura de modelar conectividad.

---

## Qué no tenés que confundir

### `proxy` no necesita estar en la red de `db`
Eso solo ampliaría conectividad sin necesidad.

### `db` no necesita `ports` para que `app` la use
La red interna y el nombre del servicio alcanzan. citeturn844080view0turn844080view2

### `internal: true` no significa que nunca más haya que pensar seguridad
Suma aislamiento de red, pero no reemplaza otras capas como no-root, least privilege o no publicar puertos de más.

### Publicar el puerto de `app` además del de `proxy` puede ser innecesario
Depende de si querés entrar directamente a `app` o no.

---

## Error común 1: publicar `db` al host solo para que `app` pueda conectarse

Eso no hace falta si ya comparten red interna. citeturn844080view0

---

## Error común 2: dejar `proxy`, `app` y `db` todos en una sola red cuando ya sabés que cumplen roles distintos

Funciona, pero expresa menos y aísla peor.

---

## Error común 3: poner `localhost` como host de la base dentro de `app`

Ese es el clásico error de contenedor pensando como host.

---

## Error común 4: conectar un servicio a dos redes sin una razón clara

Un servicio puente tiene sentido.
Pero no todos los servicios deberían ser puente.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Tomá este stack:

```yaml
services:
  proxy:
    image: nginx
    ports:
      - "8080:80"
    depends_on:
      - app
    networks:
      - front-tier

  app:
    image: miusuario/app:dev
    environment:
      DB_HOST: db
      DB_PORT: 5432
    networks:
      - front-tier
      - back-tier

  db:
    image: postgres:18
    networks:
      - back-tier

networks:
  front-tier:
  back-tier:
    internal: true
```

### Ejercicio 2
Respondé con tus palabras:

- cómo entra tu host a `proxy`
- cómo entra `proxy` a `app`
- cómo entra `app` a `db`
- por qué `proxy` no puede hablar con `db`
- qué servicio actúa como puente entre ambas redes

### Ejercicio 3
Respondé además:

- por qué `db` no necesita `ports` en este caso
- qué aporta `internal: true` en `back-tier`
- qué problema evitarías al no publicar la base de datos “por las dudas”

### Ejercicio 4
Ahora imaginá que querés usar una herramienta local para inspeccionar PostgreSQL desde tu host.
Respondé:

- qué publicación de puerto te parecería más prudente
- por qué `127.0.0.1:5432:5432` es más acotado que `5432:5432`

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- si hoy todos los servicios viven en una sola red
- qué grupo sería tu “front-tier”
- qué grupo sería tu “back-tier”
- qué servicio funcionaría como puente
- qué servicio hoy estás exponiendo al host y quizás no haría falta
- qué parte del networking te gustaría ordenar primero

No hace falta escribir todavía el `compose.yaml` final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la lógica de servicio de entrada, servicio puente y servicio interno?
- ¿qué servicio tuyo hoy está demasiado expuesto?
- ¿qué red te gustaría volver más “backend” y menos visible?
- ¿qué parte del stack hoy vive en la misma red solo por inercia?
- ¿qué mejora concreta te gustaría notar al segmentar mejor el proyecto?

Estas observaciones valen mucho más que memorizar bloques YAML.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero que un servicio reciba tráfico desde el host, probablemente me conviene ________ un puerto.  
> Si quiero que dos servicios se hablen solo dentro del stack, probablemente me conviene ponerlos en una red ________.  
> Si un servicio necesita hablar con frontend y backend, probablemente me conviene conectarlo a ________ redes.  
> Si una red debería quedar más aislada externamente, probablemente me conviene marcarla como ________.

Y además respondé:

- ¿por qué esta práctica te parece más cercana a un stack real?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no publicar `db` innecesariamente?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- combinar proxy, app y db en dos redes con intención clara
- publicar puertos solo donde corresponde
- usar un servicio puente entre frontend y backend
- dejar una base más protegida dentro de la red interna del stack
- pensar el networking del proyecto de una forma bastante más madura

---

## Resumen del tema

- Compose permite definir redes nombradas y conectar cada servicio solo a las que necesite. citeturn844080view1turn844080view0
- Un patrón muy útil es dejar `proxy` en la red frontal, `db` en la red de backend y `app` como puente entre ambas. citeturn844080view0turn844080view1
- Los servicios se descubren por nombre dentro de las redes que comparten. citeturn844080view0
- Los puertos publicados son para acceso desde el host; no hacen falta para la comunicación interna entre servicios. citeturn844080view0turn844080view2
- Una red marcada como `internal` queda aislada externamente. citeturn844080view1
- Publicar `127.0.0.1:5432:5432` es más acotado que `5432:5432` si necesitás acceso local a la base desde tu host. citeturn844080view2
- Esta práctica te deja una forma mucho más clara de pensar networking real dentro de un stack Compose.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque con una capa muy útil de naming y resolución:

- aliases
- hostnames
- nombres estables dentro de la red
- y cómo usarlos con criterio sin volverte dependiente de trucos innecesarios
