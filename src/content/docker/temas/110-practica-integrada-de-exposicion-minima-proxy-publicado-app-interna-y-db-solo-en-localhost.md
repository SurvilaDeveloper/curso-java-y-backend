---
title: "Práctica integrada de exposición mínima: proxy publicado, app interna y db solo en localhost"
description: "Tema 110 del curso práctico de Docker: una práctica integrada donde combinás un proxy publicado al host, una app expuesta solo dentro de la red interna y una base accesible únicamente por localhost para reducir superficie expuesta sin romper el acceso que realmente necesitás."
order: 110
module: "Exposición de puertos con criterio y menor superficie"
level: "intermedio"
draft: false
---

# Práctica integrada de exposición mínima: proxy publicado, app interna y db solo en localhost

## Objetivo del tema

En este tema vas a:

- juntar en una sola práctica varias ideas del bloque de publicación de puertos
- publicar solo el servicio que realmente debe salir al host
- dejar la app accesible solo dentro de la red del stack
- limitar la base a `127.0.0.1` cuando solo la necesitás desde el host
- entender mejor la diferencia entre `ports`, `expose` y puertos internos
- terminar con un stack mucho más razonable y menos expuesto

La idea es cerrar este bloque con una práctica concreta que te deje una intuición clara:
**no todo servicio necesita quedar publicado al host, y mucho menos a todas las interfaces**.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. partir de un stack donde todo está publicado de más
2. dejar publicado solo el proxy
3. mantener la app interna
4. limitar la base a localhost
5. comparar el antes y el después en términos de superficie expuesta
6. cerrar con un patrón muy reutilizable para proyectos reales

---

## Idea central que tenés que llevarte

En el tema anterior viste que:

- `-p 8080:80` publica en todas las interfaces del host
- `127.0.0.1:8080:80` limita el acceso al propio host
- `ports` no es lo mismo que `expose`
- `EXPOSE` no publica por sí solo

Este tema junta todo eso con una idea muy concreta:

> si un servicio no necesita salir al host, no lo publiques;  
> y si solo lo necesitás desde tu máquina, limitá el binding a localhost.

---

## Escenario del tema

Vas a imaginar este stack:

- `proxy`: puerta de entrada HTTP
- `app`: backend o servicio de aplicación
- `db`: PostgreSQL

Querés que:

- `proxy` sea accesible desde fuera del host
- `app` sea accesible solo desde otros servicios del stack
- `db` sea accesible solo desde el propio host para debugging o herramientas locales
- no haya puertos publicados “por costumbre”

Este es un caso muy común y muy útil.

---

## Primera versión: funciona, pero expone demasiado

Imaginá este Compose:

```yaml
services:
  proxy:
    image: nginx
    ports:
      - "8080:80"

  app:
    image: miusuario/app:dev
    ports:
      - "3000:3000"

  db:
    image: postgres:18
    ports:
      - "5432:5432"
```

---

## Qué problema tiene esta primera versión

Puede funcionar, sí.

Pero deja varias cosas abiertas de más:

- `proxy` está publicado al host
- `app` también está publicado al host
- `db` también está publicado al host y, si no limitaste IP, en todas las interfaces
- el stack no diferencia bien qué servicio es de entrada, cuál es interno y cuál solo necesitás localmente

Esto no siempre es “inseguro gravísimo”.
Pero sí suele ser **más superficie expuesta de la necesaria**.

---

## Paso 1: dejar publicado solo el proxy

Ahora empezá por esto:

```yaml
services:
  proxy:
    image: nginx
    ports:
      - "8080:80"
```

### Cómo se lee
- `proxy` queda publicado al host
- si no indicás IP del host, Compose lo enlaza a todas las interfaces del host
- este es el servicio que sí querés que otras máquinas o clientes puedan alcanzar

Acá publicar tiene sentido porque `proxy` es la puerta de entrada del stack.

---

## Paso 2: dejar `app` interna

Ahora pensá `app` así:

```yaml
services:
  app:
    image: miusuario/app:dev
    expose:
      - "3000"
```

### Cómo se lee
- `app` escucha en `3000` dentro del contenedor
- otros servicios de la red Docker pueden alcanzarla
- pero no la publicaste al host

Esto ya reduce bastante la superficie expuesta del stack.

---

## Qué gana esta decisión

Gana algo muy importante:

- `app` sigue estando disponible para `proxy`
- no hace falta abrir su puerto al host
- reducís la cantidad de puntos de entrada externos
- evitás el clásico hábito de “publicar todo porque sí”

Para muchísimos backends detrás de un proxy, esto es exactamente lo que querés.

---

## Paso 3: limitar `db` a localhost

Ahora dejá la base así:

```yaml
services:
  db:
    image: postgres:18
    ports:
      - "127.0.0.1:5432:5432"
```

### Cómo se lee
- el host local puede conectarse a la base
- pero otras máquinas no deberían poder alcanzarla usando la IP del host
- resolvés uso local sin abrir la base innecesariamente a la red

Esta decisión suele ser muy sana para desarrollo y debugging local.

---

## Qué gana esta decisión

Gana varias cosas a la vez:

- podés abrir la base desde tu propia máquina con una GUI o cliente SQL
- no dejás PostgreSQL publicado a toda la red local por costumbre
- reducís muchísimo la exposición innecesaria de un servicio sensible

En muchos proyectos, este pequeño cambio ya mejora mucho el diseño.

---

## Stack final de la práctica

Mirá el resultado integrado:

```yaml
services:
  proxy:
    image: nginx
    ports:
      - "8080:80"

  app:
    image: miusuario/app:dev
    expose:
      - "3000"

  db:
    image: postgres:18
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: mysecretpassword
    ports:
      - "127.0.0.1:5432:5432"
```

---

## Cómo se lee este stack final

La lectura conceptual sería:

- `proxy` es el punto de entrada visible hacia el host y la red
- `app` solo habla dentro del stack
- `db` se mantiene alcanzable desde tu propia máquina, pero no desde fuera del host
- el stack ahora expresa mucho mejor qué servicio debe estar expuesto y cuál no

Este patrón ya se siente bastante más maduro.

---

## Qué pasa si ni siquiera querés abrir `db` al host

También puede pasar que ni siquiera necesites acceder a PostgreSQL desde tu máquina.

En ese caso, podrías dejarla sin `ports` y solo accesible por red interna desde otros contenedores.

Por ejemplo:

```yaml
services:
  db:
    image: postgres:18
```

o, si querés dejar explícita la intención interna:

```yaml
services:
  db:
    image: postgres:18
    expose:
      - "5432"
```

### Qué gana esto
- todavía menos superficie expuesta
- el acceso queda exclusivamente dentro de la red del stack
- encaja perfecto si solo `app` necesita hablar con `db`

Este suele ser un diseño todavía más sano cuando no necesitás herramientas locales contra la base.

---

## Qué te enseña realmente esta práctica

Te enseña a pensar exposición así:

- servicio de entrada → `ports`
- servicio interno → `expose` o incluso nada si la red Docker ya alcanza
- servicio sensible solo para uso local → `127.0.0.1:HOST:CONTAINER`
- servicio que no necesita salir al host → no publicarlo

Esa clasificación simple ya evita muchísimo sobreexposición por costumbre.

---

## Qué no tenés que confundir

### `proxy` publicado no implica que todos los demás también deban publicarse
Justamente el proxy suele existir para evitar eso.

### `app` interna no significa “inaccesible”
Sigue siendo alcanzable desde otros servicios de la red del stack.

### `127.0.0.1:5432:5432` no es lo mismo que `5432:5432`
El primer caso limita el acceso al host local; el segundo publica en todas las interfaces del host.

### `EXPOSE 3000` en la imagen no reemplaza `ports`
Solo documenta intención, no publica hacia el host.

---

## Error común 1: publicar `app` al host aunque ya exista `proxy`

Eso suele duplicar superficie sin necesidad real.

---

## Error común 2: publicar `db` en todas las interfaces cuando solo querías usar un cliente local

Eso expone de más un servicio que suele ser sensible.

---

## Error común 3: usar `ports` por inercia en todos los servicios

Muchas veces `expose` o incluso ningún publish alcanzaban.

---

## Error común 4: pensar que un stack chico “no importa” y por eso abrir todo

Los malos hábitos de diseño se vuelven costumbre muy rápido.

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

  app:
    image: miusuario/app:dev
    expose:
      - "3000"

  db:
    image: postgres:18
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: mysecretpassword
    ports:
      - "127.0.0.1:5432:5432"
```

### Ejercicio 2
Respondé con tus palabras:

- por qué `proxy` usa `ports`
- por qué `app` usa `expose`
- por qué `db` se limita a `127.0.0.1`
- qué diferencia de superficie expuesta hay respecto a publicar los tres servicios en todas las interfaces

### Ejercicio 3
Respondé además:

- cuándo te parecería razonable dejar `db` sin `ports` por completo
- por qué este stack expresa mejor la intención de cada servicio
- qué hábito corrige esta práctica respecto a “publicar todo”

### Ejercicio 4
Imaginá que querés verificar el binding real de `db`.
Respondé:

- qué mirarías en `docker ps`
- qué mirarías en `docker inspect`
- por qué eso te ayuda a confirmar si de verdad quedó limitado a localhost

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué servicio hoy cumple rol de proxy o entrada
- qué servicio hoy debería quedar solo interno
- qué servicio hoy te gustaría seguir usando desde tu host, pero no desde fuera
- si hoy estás publicando más puertos de los necesarios
- qué cambio concreto harías primero para reducir superficie expuesta

No hace falta escribir todavía tu Compose real final.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre servicio publicado, servicio interno y servicio solo local?
- ¿en qué proyecto tuyo hoy hay un backend publicado de más?
- ¿qué base o panel te gustaría limitar a localhost?
- ¿qué servicio hoy ya debería estar detrás de otro y no publicado directamente?
- ¿qué mejora concreta te gustaría notar al exponer menos por defecto?

Estas observaciones valen mucho más que memorizar YAML.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si un servicio es la puerta de entrada del stack, probablemente me conviene usar ________.  
> Si un servicio solo necesita hablar con otros contenedores, probablemente me conviene usar ________ o dejarlo solo en la red interna.  
> Si un servicio sensible solo lo necesito desde mi máquina, probablemente me conviene limitarlo a ________.  
> Si quiero todavía menos superficie expuesta, probablemente me conviene no publicar ________ innecesarios al host.

Y además respondé:

- ¿por qué esta práctica te parece mucho más razonable que publicar todo?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no abrir por costumbre servicios internos o sensibles?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- combinar `ports`, `expose` y localhost binding en una sola práctica coherente
- distinguir mejor entre puerta de entrada, servicio interno y servicio solo local
- reducir superficie expuesta sin perder acceso útil
- diseñar un stack mucho más limpio y razonable de cara a la red
- pensar exposición de puertos con bastante más criterio de punta a punta

---

## Resumen del tema

- Publicar solo el proxy suele tener mucho más sentido que publicar todos los servicios del stack.
- `app` puede quedar accesible solo dentro de la red del proyecto sin necesidad de `ports`.
- Limitar `db` a `127.0.0.1` permite acceso local sin abrirla a toda la red.
- `ports`, `expose` y `EXPOSE` no resuelven el mismo problema.
- Menos puertos publicados suele significar menos superficie expuesta y un diseño más claro.
- Esta práctica te deja una base mucho más madura para exponer solo lo que realmente necesitás.

---

## Próximo tema

En el próximo bloque vas a empezar a moverte hacia otra capa muy importante del trabajo real con Docker:

- imagen final más profesional
- buenas prácticas integradas
- patrones de trabajo más completos
- y un cierre más redondo del roadmap con stacks cada vez más sólidos
