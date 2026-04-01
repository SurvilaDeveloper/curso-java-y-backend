---
title: "Práctica integrada de networking: nombres claros, dos redes y cero dependencia de IPs fijas"
description: "Tema 84 del curso práctico de Docker: una práctica integrada donde combinás nombres de servicio, aliases útiles, dos redes segmentadas y puertos publicados solo donde corresponde, evitando depender de IPs fijas para la conectividad interna del stack."
order: 84
module: "Networking entre servicios y puertos con Compose"
level: "intermedio"
draft: false
---

# Práctica integrada de networking: nombres claros, dos redes y cero dependencia de IPs fijas

## Objetivo del tema

En este tema vas a:

- juntar en una sola práctica varias ideas del bloque de networking
- usar nombres de servicio como forma principal de resolución
- segmentar el stack con dos redes
- usar un alias solo donde realmente aporte
- publicar puertos solo donde haga falta
- evitar depender de IPs fijas para que el stack sea menos frágil

La idea es cerrar este bloque con un stack que ya se vea mucho más deliberado: nombres claros, redes con intención y nada de direccionamiento manual innecesario.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. partir de un stack simple pero demasiado plano
2. separar frontend y backend en dos redes
3. usar nombres de servicio como resolución principal
4. agregar un alias solo donde aporte claridad
5. dejar la base sin puerto publicado
6. cerrar con un stack mucho menos frágil que uno basado en IPs fijas

---

## Idea central que tenés que llevarte

En este bloque ya viste varias cosas importantes:

- Compose crea redes para la aplicación
- los servicios se descubren por nombre
- los puertos publicados son para acceso desde el host
- las redes nombradas ayudan a segmentar
- los aliases existen, pero no hacen falta siempre
- las IPs fijas existen, pero suelen ser un último recurso

Este tema junta todo eso con una idea muy concreta:

> un stack bien diseñado normalmente se entiende y funciona con **nombres de servicio, redes claras y exposición mínima**, sin necesidad de andar clavando IPs manuales.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker Compose explica que, por defecto, cada servicio es alcanzable por otros contenedores y descubrible por el nombre del servicio dentro de la red compartida. También documenta que las redes nombradas permiten conectar explícitamente cada servicio solo a las redes que use, y que `internal: true` crea una red aislada externamente. La referencia de servicios documenta además `aliases` como hostnames alternativos por red, y aclara que siguen siendo network-scoped. Por su parte, Docker Engine documenta que los puertos publicados se mapean al host y que los puertos no publicados quedan bloqueados por defecto. Y la guía de networking de PostgreSQL remarca que publicar `5432:5432` expone la base a cualquier dispositivo que pueda alcanzar el host, mientras que `127.0.0.1:5432:5432` la limita al host local. Finalmente, Compose sí soporta `ipv4_address`, pero esa opción exige una red con `ipam` que cubra la subred configurada. citeturn655300view0turn655300view1turn655300view2

---

## Escenario del tema

Vas a imaginar este stack:

- `proxy`
- `app`
- `db`

Querés que:

- `proxy` reciba tráfico desde tu host
- `proxy` hable con `app`
- `app` hable con `db`
- `db` no quede publicada al host por defecto
- `db` viva solo en la red de backend
- `app` funcione como puente entre frontend y backend
- todo se resuelva por nombre, no por IP fija

Este patrón es muy común y muy útil.

---

## Primera versión: funciona, pero es demasiado plana

Imaginá algo así:

```yaml
services:
  proxy:
    image: nginx
    ports:
      - "8080:80"

  app:
    image: miusuario/app:dev
    environment:
      DB_HOST: db

  db:
    image: postgres:18
    ports:
      - "5432:5432"
```

---

## Qué problema tiene esta primera versión

Puede funcionar, sí.

Pero deja varias cosas poco cuidadas:

- todo cae en la red por defecto sin intención clara
- `db` queda publicada al host aunque quizá solo la necesita `app`
- no hay segmentación entre frontend y backend
- el stack no expresa bien quién debería ver a quién
- es fácil que alguien termine pensando en IPs o `localhost` para resolver algo que en realidad Compose ya resuelve por nombre

No está “roto”.
Pero todavía está demasiado abierto y demasiado plano.

---

## Paso 1: segmentar el stack en dos redes

Ahora imaginá este enfoque:

```yaml
services:
  proxy:
    image: nginx
    ports:
      - "8080:80"
    networks:
      - front-tier

  app:
    image: miusuario/app:dev
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

---

## Qué mejora introduce esta versión

Introduce varias mejoras a la vez:

- `proxy` y `db` ya no comparten red
- `app` queda como servicio puente
- `back-tier` se declara como red interna
- la base ya no vive “al mismo nivel” de exposición que el proxy

La guía oficial de networking de Compose muestra justamente el patrón donde un servicio puente puede estar en dos redes y `proxy` queda aislado de `db` porque no comparten ninguna red. citeturn655300view0turn655300view1

---

## Cómo se lee este stack

La lectura conceptual sería:

- tu host entra a `proxy`
- `proxy` alcanza a `app` dentro de `front-tier`
- `app` alcanza a `db` dentro de `back-tier`
- `db` no ve a `proxy`
- `proxy` no ve a `db`

Esto ya expresa una arquitectura mucho más razonable.

---

## Paso 2: usar nombre de servicio como resolución principal

Ahora agregá la parte de aplicación:

```yaml
services:
  app:
    image: miusuario/app:dev
    environment:
      DB_HOST: db
      DB_PORT: 5432
    networks:
      - front-tier
      - back-tier
```

La guía oficial de networking de Compose deja claro que los servicios son descubribles por nombre dentro de la red compartida. citeturn655300view0

---

## Qué mejora introduce esto

Introduce algo muy importante:

- la resolución ya no depende de direcciones manuales
- la app expresa su dependencia usando el nombre del servicio
- el stack queda más legible
- si el contenedor cambia, el nombre lógico sigue siendo el mismo

Esto suele ser muchísimo más sano que algo como:

```text
DB_HOST=172.28.0.10
```

---

## Paso 3: usar un alias solo donde aporte

Ahora imaginá que en la red de backend querés que la base también pueda ser conocida como `database`, porque ese nombre te resulta más expresivo desde la app o coincide con una convención interna.

Podrías hacer algo así:

```yaml
services:
  db:
    image: postgres:18
    networks:
      back-tier:
        aliases:
          - database
```

La referencia de servicios documenta `aliases` como hostnames alternativos por red. citeturn655300view2

---

## Cómo se lee este alias

La lectura conceptual sería:

- el nombre del servicio sigue siendo `db`
- dentro de `back-tier`, `app` podría alcanzar a la base como `db` o como `database`
- el alias no reemplaza el nombre del servicio
- solo suma un nombre alternativo si realmente aporta

Esto encaja perfecto con la regla del tema 82:
**usar nombres extra solo cuando realmente suman**.

---

## Cuándo este alias sí aporta

Aporta cuando:

- `database` te parece más claro en la capa de aplicación
- querés una convención más expresiva
- tenés tooling o configuración que espera ese nombre
- querés desacoplar un poco el nombre técnico del servicio del nombre funcional dentro de una red concreta

No hace falta agregarlo siempre.
Pero este es un caso razonable.

---

## Paso 4: dejar `db` sin puerto publicado

En la versión final de esta práctica, la base no publica puerto:

```yaml
services:
  db:
    image: postgres:18
    networks:
      back-tier:
        aliases:
          - database
```

Docker Engine documenta que los puertos no publicados quedan bloqueados por defecto. Y la guía de PostgreSQL advierte que publicar `5432:5432` expone la base a cualquier dispositivo que alcance el host. citeturn655300view0turn655300view2

---

## Qué gana esta decisión

Gana algo muy valioso:

- la base solo es accesible dentro del stack
- no se expone innecesariamente al host ni a otros equipos de la red
- el acceso a `db` queda mediado por la arquitectura interna, no por publicar el puerto “por las dudas”

Esto es muchísimo más sano que publicar la base solo porque sí.

---

## Stack final de la práctica

Mirá este resultado integrado:

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
      DB_HOST: database
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
      back-tier:
        aliases:
          - database

networks:
  front-tier:
  back-tier:
    internal: true
```

---

## Cómo se lee este stack final

La lectura conceptual sería:

- `proxy` es el único servicio publicado al host
- `app` hace de puente entre ambas redes
- `db` vive solo en la red interna de backend
- la app llega a la base por el alias `database`
- no hubo necesidad de usar ninguna IP fija
- la segmentación de redes y el naming ya resuelven el problema

Este stack ya se ve muchísimo más deliberado que uno donde todo comparte red y varios puertos se publican por inercia.

---

## Qué gana esta práctica frente a una solución con IP fija

Gana varias cosas al mismo tiempo:

- más legibilidad
- menos acoplamiento
- menos mantenimiento manual
- menos dependencia de subredes explícitas
- menos fragilidad si el stack cambia

Compose sí soporta IPs estáticas, pero para eso necesitás `ipam` y una subred explícita que cubra esa dirección. citeturn655300view1turn655300view2

En la mayoría de los casos de app + db + proxy, eso es mucha más complejidad de la necesaria.

---

## Qué pasa si querés entrar a `db` desde tu host por debugging

En esta práctica no hace falta.

Pero si quisieras hacerlo de manera prudente, podrías agregar algo como:

```yaml
ports:
  - "127.0.0.1:5432:5432"
```

La guía oficial de PostgreSQL muestra precisamente que eso es más acotado que `5432:5432`. citeturn655300view2

La enseñanza útil es:

- primero preguntate si realmente hace falta publicar `db`
- y solo si la respuesta es sí, hacelo de la forma más limitada posible

---

## Qué te enseña realmente esta práctica

Te enseña a pensar networking así:

- servicio de entrada
- servicio puente
- servicio interno
- red frontal
- red de backend interna
- nombres claros
- alias solo cuando aporta
- cero dependencia innecesaria de IPs fijas

Eso ya se parece bastante a un stack real y bien pensado.

---

## Qué no tenés que confundir

### El alias no reemplaza al nombre del servicio
Suma un nombre alternativo en una red concreta. citeturn655300view2

### `internal: true` no reemplaza no publicar puertos
Suma aislamiento de red, pero sigue siendo buena idea no publicar lo que no hace falta. citeturn655300view1turn655300view2

### Publicar un puerto no es un requisito para que dos servicios del stack se hablen
La red interna ya resuelve esa comunicación. citeturn655300view0

### IP fija no significa automáticamente mejor networking
Muchas veces solo significa más acoplamiento y más mantenimiento. citeturn655300view1turn655300view2

---

## Error común 1: publicar `db` al host solo para que `app` pueda conectarse

Eso no hace falta si ya comparten red interna. citeturn655300view0

---

## Error común 2: usar `database` o `db` y después clavarlo con una IP fija “para estar seguros”

Si el nombre ya resuelve bien, la IP manual suele sobrar.

---

## Error común 3: meter a `proxy`, `app` y `db` todos en la misma red por inercia

Funciona, pero expresa menos y aísla peor. citeturn655300view0turn655300view1

---

## Error común 4: agregar aliases en todas partes aunque el nombre del servicio ya alcance

Eso vuelve el stack más ruidoso, no más claro. citeturn655300view2

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Tomá este stack final:

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
      DB_HOST: database
      DB_PORT: 5432
    networks:
      - front-tier
      - back-tier

  db:
    image: postgres:18
    networks:
      back-tier:
        aliases:
          - database

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
- por qué `db` no necesita `ports`
- qué aporta el alias `database`
- qué aporta `internal: true`

### Ejercicio 3
Comparalo conceptualmente con una solución de IP fija y respondé:

- por qué este stack te parece más legible
- por qué depende menos de detalles de red
- por qué suele ser más sano para mantenimiento

### Ejercicio 4
Imaginá que querés inspeccionar PostgreSQL desde tu host local.
Respondé:

- qué publicación te parecería prudente
- por qué no te irías directo a `5432:5432` salvo necesidad real

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- si hoy el stack ya tiene un servicio de entrada, uno de aplicación y uno interno
- si hoy todos viven en la misma red
- qué nombre de servicio ya alcanza perfectamente sin alias extra
- dónde un alias sí podría mejorar claridad
- qué servicio hoy probablemente está expuesto de más
- qué parte del networking te gustaría ordenar primero con esta lógica

No hace falta escribir todavía el `compose.yaml` final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la relación entre redes, nombres, alias y exposición al host?
- ¿qué servicio tuyo hoy está demasiado plano en networking?
- ¿qué red de backend te gustaría volver más interna?
- ¿qué alias te parece realmente útil y cuál sería puro ruido?
- ¿qué mejora concreta te gustaría notar al dejar de depender de IPs fijas?

Estas observaciones valen mucho más que memorizar bloques YAML.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero que un servicio reciba tráfico desde el host, probablemente me conviene ________ un puerto.  
> Si quiero que un servicio interno encuentre a otro en la red, probablemente me conviene usar el ________ del servicio o un ________ si realmente aporta.  
> Si quiero separar frontend y backend, probablemente me conviene usar redes ________.  
> Si una red debería quedar más contenida, probablemente me conviene marcarla como ________.  
> Si estoy tentado a usar una IP fija, primero debería preguntarme si no lo resuelvo mejor con ________ y ________.

Y además respondé:

- ¿por qué esta práctica te parece mucho más cercana a un stack real?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no publicar la base ni depender de IPs manuales sin necesidad?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- combinar nombres de servicio, alias útil, dos redes y exposición mínima en una sola práctica
- segmentar mejor frontend y backend
- evitar depender de IPs fijas para conectividad interna
- publicar puertos solo donde corresponde
- pensar el networking del stack de una forma bastante más clara y menos frágil

---

## Resumen del tema

- Compose permite segmentar el stack con redes nombradas y conectar cada servicio solo a las redes que use. citeturn655300view0turn655300view1
- Los servicios se descubren por nombre en la red compartida, y los aliases agregan hostnames alternativos por red cuando realmente aportan. citeturn655300view0turn655300view2
- Una red marcada como `internal` queda aislada externamente. citeturn655300view1
- Los puertos publicados son para acceso desde el host, no para la comunicación interna entre servicios. citeturn655300view0turn655300view2
- Compose sí soporta IPs estáticas, pero eso exige `ipam` y suele agregar complejidad innecesaria cuando nombres y redes ya resuelven el problema. citeturn655300view1turn655300view2
- Esta práctica te deja una forma mucho más madura de diseñar un stack legible, segmentado y menos expuesto.

---

## Próximo tema

En el próximo bloque vas a empezar a moverte hacia otra capa muy importante del trabajo real con Docker:

- Dockerfiles más mantenibles
- orden de instrucciones
- invalidación de caché
- y cómo escribir imágenes que no solo funcionen, sino que además construyan mejor
