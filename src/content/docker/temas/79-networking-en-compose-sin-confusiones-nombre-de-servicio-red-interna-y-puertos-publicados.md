---
title: "Networking en Compose sin confusiones: nombre de servicio, red interna y puertos publicados"
description: "Tema 79 del curso práctico de Docker: cómo funciona la red por defecto de Docker Compose, cómo se resuelven los servicios por nombre, qué diferencia hay entre comunicación interna y puertos publicados, y por qué exponer de más suele ser un error de diseño."
order: 79
module: "Networking entre servicios y puertos con Compose"
level: "intermedio"
draft: false
---

# Networking en Compose sin confusiones: nombre de servicio, red interna y puertos publicados

## Objetivo del tema

En este tema vas a:

- entender cómo funciona la red por defecto de Compose
- comunicar servicios por nombre en vez de pelearte con IPs
- distinguir red interna de puertos publicados al host
- evitar exponer de más servicios que solo necesita el propio stack
- construir un criterio mucho más claro para conectar `app`, `db`, `redis` y otros servicios

La idea es que dejes de mezclar “lo que un servicio escucha dentro del stack” con “lo que realmente querés publicar hacia afuera”.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender la red por defecto que crea Compose
2. ver cómo se descubren los servicios por nombre
3. distinguir comunicación interna y publicación de puertos
4. entender por qué `localhost` dentro de un contenedor no es “otro servicio”
5. construir una regla práctica para exponer menos y conectar mejor

---

## Idea central que tenés que llevarte

Cuando levantás un proyecto con Compose, no estás creando contenedores sueltos sin relación.

Estás creando, por defecto, una red propia del proyecto donde los servicios pueden hablarse entre sí por nombre.

Dicho simple:

> entre contenedores de Compose, lo normal es conectarte por **nombre de servicio** dentro de la red interna  
> y usar `ports` solo cuando realmente querés publicar algo hacia el host.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker Compose explica que, por defecto, Compose crea una sola red para tu aplicación y que cada contenedor de un servicio se une a esa red, siendo alcanzable por otros contenedores y descubrible por el nombre del servicio. También documenta que el nombre de la red por defecto depende del nombre del proyecto y que puede cambiarse con `--project-name` o `COMPOSE_PROJECT_NAME`. La Quickstart de Compose muestra explícitamente que un servicio puede alcanzar a otro usando el nombre del servicio como hostname. Además, Docker documenta que los puertos publicados se mapean al host mediante reglas de NAT/PAT y que los puertos no publicados quedan bloqueados por defecto. Y, en la guía de PostgreSQL, Docker advierte que publicar `5432:5432` lo expone a cualquier dispositivo que pueda alcanzar tu host, mientras que `127.0.0.1:5432:5432` lo limita al propio host. citeturn243875search2turn243875search6turn216843search3turn216843search11turn243875search7

---

## Primer concepto: Compose crea una red por defecto

Tomá este ejemplo:

```yaml
services:
  web:
    build: .
  db:
    image: postgres:18
```

Cuando ejecutás `docker compose up`, Compose crea una red por defecto para ese proyecto.

La documentación oficial lo describe así: cada contenedor del servicio se une a la red por defecto de la app y queda descubrible por el nombre del servicio. La red recibe un nombre basado en el project name, que por defecto toma el nombre del directorio. citeturn243875search2turn243875search6

---

## Cómo se lee esto en la práctica

La lectura conceptual sería:

- `web` y `db` quedan en la misma red interna
- `web` puede encontrar a `db`
- no necesitás inventar IPs fijas
- tampoco necesitás publicar el puerto de `db` solo para que `web` la alcance

Este último punto es uno de los más importantes del tema.

---

## Segundo concepto: el hostname normal es el nombre del servicio

La Quickstart oficial de Compose muestra un ejemplo donde el servicio `web` se conecta a Redis usando `redis` como hostname. citeturn216843search3

Eso te deja una regla muy útil:

- si tu servicio se llama `db`, el hostname interno normal será `db`
- si tu servicio se llama `redis`, el hostname interno normal será `redis`
- si tu servicio se llama `api`, el hostname interno normal será `api`

No hace falta ir a buscar la IP del contenedor.

---

## Un ejemplo típico

```yaml
services:
  app:
    build: .
  db:
    image: postgres:18
```

Dentro de `app`, lo razonable sería configurar algo como:

```text
DB_HOST=db
```

No algo como:

```text
DB_HOST=localhost
```

porque `localhost`, dentro de `app`, apunta al propio contenedor `app`, no al contenedor `db`.

---

## El error clásico de `localhost`

Este es probablemente el error más común del bloque.

Mucha gente piensa:

- “la base está corriendo”
- “está en mi stack”
- “entonces le pego a localhost”

Pero dentro de un contenedor, `localhost` significa **ese mismo contenedor**, no otro servicio del proyecto.

La forma normal de hablar con otro servicio en la red por defecto de Compose es por el **nombre del servicio**. La documentación oficial de Compose networking y la Quickstart apuntan exactamente en esa dirección. citeturn243875search2turn216843search3

---

## Tercer concepto: `ports` no es para que los servicios del stack se hablen

Esta es otra confusión muy común.

Mirá este ejemplo:

```yaml
services:
  app:
    build: .
  db:
    image: postgres:18
    ports:
      - "5432:5432"
```

Muchísima gente publica `5432:5432` pensando que eso hace falta para que `app` se conecte a `db`.

Pero si `app` y `db` ya están en la misma red de Compose, `app` puede hablar con `db` por nombre de servicio aunque **no publiques ningún puerto al host**. La documentación oficial de Compose networking deja claro que la alcanzabilidad entre servicios en la red por defecto no depende de publicar puertos al host. citeturn243875search2turn243875search6

---

## Entonces, ¿para qué sirve `ports`?

`ports` sirve para publicar un puerto del contenedor hacia el host.

Docker documenta que los puertos publicados se mapean al host usando reglas de NAT/PAT y que los puertos no publicados quedan bloqueados por defecto. citeturn216843search11

La traducción práctica es:

- `app` dentro del stack no necesita `ports` para hablar con `db`
- vos, desde tu navegador o desde una herramienta en tu host, sí podrías necesitar `ports` para entrar a un servicio

---

## Un ejemplo sano

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"

  db:
    image: postgres:18
```

### Cómo se lee
- `app` publica `3000` al host porque querés abrirla en el navegador o desde tu máquina
- `db` no publica nada porque solo la necesita `app` dentro del stack
- `app` se conecta a `db` usando `db` como hostname interno

Esto ya es mucho más sano que publicar todo “por las dudas”.

---

## Cuarto concepto: publicar menos también es mejor diseño

Docker documenta en su guía de PostgreSQL que `-p 5432:5432` expone la base a cualquier dispositivo que pueda alcanzar tu host, mientras que `-p 127.0.0.1:5432:5432` la limita al propio host. También advierte usar eso con cuidado. citeturn243875search7

Eso te enseña una idea muy valiosa:

> publicar un puerto no es inocente.  
> Cada puerto publicado amplía quién puede intentar llegar a ese servicio.

Entonces, si algo solo debe vivir dentro del stack, muchas veces **no lo publiques**.

---

## Un ejemplo aún más prudente

Si querés llegar a PostgreSQL desde tu máquina local, pero no desde otros dispositivos de la red, el patrón sería algo así:

```yaml
services:
  db:
    image: postgres:18
    ports:
      - "127.0.0.1:5432:5432"
```

### Cómo se lee
- el puerto queda accesible desde tu host local
- no desde toda la red que pueda ver tu máquina

La guía de PostgreSQL de Docker muestra justamente esta diferencia entre publicar en todas las interfaces y bindear solo a localhost. citeturn243875search7

---

## Quinto concepto: `EXPOSE` no publica puertos

Docker documenta que `EXPOSE` en el Dockerfile solo describe qué puerto escucha la aplicación en runtime, pero no publica ese puerto por sí mismo. También aclara que `EXPOSE` no debe incluir IP ni host-port mapping. citeturn216843search5turn216843search6

Entonces:

```Dockerfile
EXPOSE 3000
```

no significa:

- “ya está abierto al host”

Significa más bien:

- “esta imagen escucha en este puerto”

La publicación real al host la hacés con `ports`, no con `EXPOSE`.

---

## Sexto concepto: `expose` y el puerto interno

En Compose existe también `expose`, pero para este nivel del curso lo importante es no mezclarlo con `ports`.

La idea sana para arrancar es:

- si querés comunicación interna entre servicios, el punto de partida es la red de Compose y el nombre del servicio
- si querés acceso desde el host, ahí entran `ports`

No necesitás complicarte más hasta que realmente haga falta.

---

## El nombre del proyecto también importa

Docker documenta que la red por defecto usa un nombre basado en el project name, que a su vez suele venir del nombre del directorio. También explica que eso puede cambiarse con `--project-name` o `COMPOSE_PROJECT_NAME`. citeturn243875search2

Esto es útil porque te ayuda a entender por qué a veces ves redes con nombres como:

```text
miapp_default
```

o:

```text
backend_default
```

No es un detalle raro.
Es parte normal de cómo Compose encapsula el proyecto.

---

## Una regla muy útil

Podés pensar así:

### ¿Un servicio solo debe hablar con otros servicios del stack?
No publiques puertos. Usá la red interna y el nombre del servicio.

### ¿Necesitás entrar desde tu máquina host?
Publicá el puerto que haga falta.

### ¿Necesitás entrar desde otras máquinas de la red?
Recién ahí evaluá publicar en interfaces más amplias, con más cuidado.

Esta regla sola ya evita muchísimos errores de exposición innecesaria.

---

## Un patrón típico de aplicación + base

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DB_HOST: db

  db:
    image: postgres:18
```

### Lectura correcta
- el navegador o tu host entra a `app` por `localhost:3000`
- `app` entra a `db` por el nombre `db`
- `db` no necesita `ports` si no querés accederla desde fuera del stack

Este patrón aparece una y otra vez en proyectos reales.

---

## Qué no tenés que confundir

### Red interna entre servicios no es lo mismo que puerto publicado al host
Una cosa es conectividad dentro del proyecto; otra, exposición hacia afuera. citeturn243875search2turn216843search11

### `localhost` dentro del contenedor no es “el otro servicio”
Es el propio contenedor. La comunicación normal entre servicios usa el nombre del servicio. citeturn243875search2turn216843search3

### `EXPOSE` no publica puertos
Solo describe qué puerto escucha la app. citeturn216843search5turn216843search6

### Publicar `5432:5432` no es inocente
Podés estar exponiendo la base a más gente de la que querías. citeturn243875search7

---

## Error común 1: publicar el puerto de la base solo para que la app le hable

Si ya están en la misma red de Compose, eso no hace falta. citeturn243875search2

---

## Error común 2: poner `localhost` como host de otro servicio del stack

Eso casi siempre apunta al contenedor equivocado. citeturn216843search3turn243875search2

---

## Error común 3: exponer demasiados servicios “por las dudas”

Cada puerto publicado es una decisión de exposición. Docker deja claro que lo no publicado queda bloqueado por defecto. citeturn216843search11

---

## Error común 4: creer que `EXPOSE` y `ports` hacen lo mismo

No resuelven el mismo problema. citeturn216843search5turn216843search6

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Mirá este stack:

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DB_HOST: db

  db:
    image: postgres:18
```

Respondé con tus palabras:

- cómo entra tu host a `app`
- cómo entra `app` a `db`
- por qué `db` no necesita `ports` en este caso

### Ejercicio 2
Ahora pensá este error:

```text
DB_HOST=localhost
```

Respondé:

- por qué está mal dentro de `app`
- qué hostname corresponde usar
- qué concepto de Compose networking explica esa diferencia

### Ejercicio 3
Respondé además:

- para qué sirve `ports`
- qué diferencia hay entre publicar `5432:5432` y `127.0.0.1:5432:5432`
- por qué `EXPOSE` no reemplaza a `ports`

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué servicios solo deberían hablar dentro del stack
- cuál realmente necesita un puerto publicado al host
- si hoy estás exponiendo algo que en realidad no hace falta exponer
- qué variable de conexión debería usar nombre de servicio y hoy quizás usa otra cosa
- qué decisión de networking te gustaría corregir primero

No hace falta escribir todavía el `compose.yaml` final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre red interna y puerto publicado?
- ¿en qué proyecto tuyo hoy estás exponiendo servicios de más?
- ¿qué parte del tema de `localhost` te parece más fácil de confundir?
- ¿qué servicio tuyo debería vivir solo dentro del stack y no hacia afuera?
- ¿qué mejora concreta te gustaría notar al publicar menos puertos?

Estas observaciones valen mucho más que memorizar sintaxis.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si un servicio solo debe ser accesible desde otros servicios del mismo proyecto, probablemente me conviene ________.  
> Si necesito entrar desde mi máquina host, probablemente me conviene usar ________.  
> Si quiero que un servicio interno encuentre a otro en Compose, probablemente me conviene usar como hostname el ________ del servicio.

Y además respondé:

- ¿por qué este tema impacta tanto en seguridad y claridad del stack?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no publicar puertos innecesarios?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar cómo funciona la red por defecto de Compose
- conectar servicios por nombre sin depender de IPs ni `localhost`
- distinguir mejor comunicación interna y puertos publicados
- evitar exponer de más servicios internos del stack
- pensar el networking del proyecto de forma bastante más clara

---

## Resumen del tema

- Por defecto, Compose crea una red para tu aplicación y cada servicio se une a ella, quedando alcanzable por otros servicios y descubrible por su nombre. citeturn243875search2turn243875search6
- La Quickstart oficial muestra que un servicio puede alcanzar a otro usando el nombre del servicio como hostname. citeturn216843search3
- Los puertos publicados se mapean al host mediante NAT/PAT, y los no publicados quedan bloqueados por defecto. citeturn216843search11
- Publicar `5432:5432` expone PostgreSQL a cualquier dispositivo que pueda alcanzar tu host, mientras que `127.0.0.1:5432:5432` lo limita al host local. citeturn243875search7
- `EXPOSE` en el Dockerfile solo describe qué puerto escucha la aplicación; no publica nada al host por sí solo. citeturn216843search5turn216843search6
- Este tema te deja una base muy sólida para pensar networking interno del stack sin exponer servicios innecesariamente.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque con otra decisión clave de networking:

- redes nombradas
- segmentación entre frontend y backend
- aislamiento entre grupos de servicios
- y cómo dejar de meter todo en una sola red cuando el stack empieza a crecer
