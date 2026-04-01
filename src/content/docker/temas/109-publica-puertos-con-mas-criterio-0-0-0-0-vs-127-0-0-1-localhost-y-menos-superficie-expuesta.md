---
title: "Publicá puertos con más criterio: 0.0.0.0 vs 127.0.0.1, localhost y menos superficie expuesta"
description: "Tema 109 del curso práctico de Docker: cómo publicar puertos con más criterio, qué diferencia hay entre exponer en todas las interfaces o solo en localhost, cómo hacerlo con docker run y Docker Compose, y cómo reducir superficie expuesta sin romper el acceso que realmente necesitás."
order: 109
module: "Exposición de puertos con criterio y menor superficie"
level: "intermedio"
draft: false
---

# Publicá puertos con más criterio: 0.0.0.0 vs 127.0.0.1, localhost y menos superficie expuesta

## Objetivo del tema

En este tema vas a:

- entender qué significa realmente publicar un puerto en Docker
- distinguir entre publicar en todas las interfaces y limitar a localhost
- usar `-p` y `ports:` con más criterio
- evitar exponer servicios más de lo necesario
- construir una regla práctica para reducir superficie expuesta sin romper el acceso que sí necesitás

La idea es que dejes de pensar “publicar puerto = abrirlo y listo” y empieces a decidir **dónde** querés publicarlo y **quién** debería poder alcanzarlo.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender qué pasa cuando publicás un puerto
2. ver qué significa publicar en `0.0.0.0`
3. ver qué cambia cuando lo limitás a `127.0.0.1`
4. trasladar esa lógica a Docker Compose
5. distinguir `ports` de `expose`
6. construir una regla práctica para exposición más segura

---

## Idea central que tenés que llevarte

Publicar un puerto no es solo “hacer accesible el contenedor”.

También es decidir **desde qué interfaces del host** va a quedar accesible.

Dicho simple:

> `-p 8080:80` no significa lo mismo que `-p 127.0.0.1:8080:80`.

La primera forma abre el puerto en todas las interfaces del host.
La segunda lo restringe al propio host.

Esa diferencia es una de las decisiones más útiles y más subestimadas del día a día con Docker.

---

## Qué dice la documentación oficial

Docker documenta que los puertos publicados se mapean a direcciones IP del host usando reglas de NAT/PAT, y que publicar puertos es **inseguro por defecto** porque el servicio pasa a estar disponible no solo para el host Docker sino también para el exterior. La documentación oficial aclara que, si incluís `127.0.0.1` o `::1` en la publicación, solo el propio host puede acceder al puerto publicado. También explica que, cuando publicás sin especificar una IP concreta, el daemon usa por defecto todas las direcciones del host (`0.0.0.0` y `[::]`). En Docker Compose, la referencia oficial documenta que `ports` en sintaxis corta acepta `[IP:]HOST:CONTAINER`, donde si no indicás IP se enlaza a todas las interfaces, y que en sintaxis larga podés usar `host_ip: 127.0.0.1`. La misma referencia distingue `ports` de `expose`: `ports` publica hacia el host, mientras que `expose` solo anuncia puertos internos accesibles para otros servicios de la red. Además, la referencia de Dockerfile recuerda que `EXPOSE` no publica puertos por sí solo; solo documenta intención. citeturn342794view5turn342794view4turn342794view1turn342794view0turn828861search4turn342794view3turn828861search20

---

## Primer concepto: qué significa publicar un puerto

Cuando hacés algo como:

```bash
docker run -p 8080:80 nginx
```

estás creando un mapeo entre:

- un puerto del host
- y un puerto del contenedor

Eso vuelve accesible el servicio del contenedor a través del host.

Hasta ahí, bien.

Pero la parte importante del tema no es solo **qué puerto** abrís.
También es **en qué direcciones del host** lo abrís.

---

## Segundo concepto: publicar en todas las interfaces

Cuando publicás así:

```bash
docker run -p 8080:80 nginx
```

Docker publica por defecto en todas las interfaces del host.

Conceptualmente, esto equivale a algo como:

```text
0.0.0.0:8080 -> 80
```

O, dicho de otra forma:

- el host escucha en ese puerto en todas sus direcciones IPv4
- y también puede aplicarse a IPv6 según el entorno

Esto es cómodo.
Pero también expone más superficie.

---

## Qué implica eso en la práctica

Implica que el servicio puede quedar accesible desde:

- tu propia máquina
- otras máquinas que alcancen la IP del host
- la red local o el entorno que corresponda según cómo esté conectado el host

Por eso Docker lo marca como algo inseguro por defecto si no lo necesitabas realmente.

---

## Tercer concepto: limitar a localhost

Ahora mirá esta variante:

```bash
docker run -p 127.0.0.1:8080:80 nginx
```

Acá el puerto queda enlazado solo a la interfaz loopback del host.

Eso significa, en práctica:

- lo podés abrir desde el mismo host
- pero no desde otra máquina de la red usando la IP del host

Esta es una diferencia enorme.

---

## Cuándo suele tener mucho sentido `127.0.0.1`

Suele tener mucho sentido cuando:

- estás desarrollando localmente
- querés probar algo solo desde tu máquina
- no necesitás exponer la app a tu red local
- querés abrir una base o panel solo para debugging local
- querés reducir superficie expuesta por defecto

En muchísimos casos de desarrollo, esto debería ser la primera opción que te preguntes.

---

## Un caso clásico: base de datos para uso local

Imaginá esto:

```bash
docker run -d   -e POSTGRES_PASSWORD=mysecretpassword   -p 127.0.0.1:5432:5432   postgres:18
```

### Qué gana esta decisión
- podés conectarte desde tu host
- no abrís PostgreSQL al resto de la red local
- resolvés la necesidad real con menos exposición innecesaria

Esto suele ser bastante más sano que publicar la base en todas las interfaces “porque sí”.

---

## Cuarto concepto: Compose hace exactamente la misma diferencia

En Compose, la diferencia sigue existiendo.

### Publicar en todas las interfaces
```yaml
services:
  app:
    image: nginx
    ports:
      - "8080:80"
```

### Limitar a localhost
```yaml
services:
  app:
    image: nginx
    ports:
      - "127.0.0.1:8080:80"
```

La referencia oficial de Compose documenta justamente esa sintaxis corta: `[IP:]HOST:CONTAINER`, donde si omitís IP se enlaza a todas las interfaces. También muestra ejemplos explícitos con `127.0.0.1`. 

---

## Sintaxis larga en Compose

Compose también soporta sintaxis larga.

Por ejemplo:

```yaml
services:
  app:
    image: nginx
    ports:
      - target: 80
        host_ip: 127.0.0.1
        published: "8080"
        protocol: tcp
        mode: host
```

Esta forma es más verbosa, pero deja más explícita la intención.

---

## Cuándo puede gustarte más la sintaxis larga

Suele gustarte más cuando:

- querés dejar la intención muy clara
- necesitás más campos explícitos
- querés un Compose más “autoexplicativo”
- estás enseñando, documentando o manteniendo un stack con más detalle

Para casos simples, la sintaxis corta suele alcanzar.
Pero está bueno saber que existe la larga.

---

## Quinto concepto: `ports` no es lo mismo que `expose`

Acá aparece una distinción muy útil.

### `ports`
publica puertos hacia el host.

### `expose`
solo declara puertos internos para comunicación entre servicios de la red.

Por ejemplo:

```yaml
services:
  app:
    image: miusuario/app:dev
    expose:
      - "3000"

  proxy:
    image: nginx
    ports:
      - "8080:80"
```

### Cómo se lee
- `app` no se publica al host
- `proxy` sí se publica al host
- otros servicios de la red pueden hablar con `app`
- pero desde afuera no abriste el puerto de `app` innecesariamente

Esto es exactamente el tipo de criterio que este bloque quiere reforzar.

---

## Sexto concepto: `EXPOSE` tampoco publica

Docker también recuerda en la referencia de Dockerfile que `EXPOSE` no publica puertos por sí solo.

Por ejemplo:

```Dockerfile
EXPOSE 3000
```

eso **no** abre `3000` al host.
Solo documenta que la imagen espera usar ese puerto.

Para publicar de verdad necesitás:

- `-p` / `--publish` en `docker run`
- o `ports:` en Compose

Esta confusión aparece muchísimo, así que vale oro dejarla bien separada.

---

## Un patrón muy sano para stacks pequeños

Un patrón bastante sano suele ser este:

- solo publicar al host lo que una persona o sistema externo realmente necesita
- limitar a `127.0.0.1` lo que es solo para uso local
- dejar internos los servicios que solo hablan entre contenedores

Por ejemplo:

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
    ports:
      - "127.0.0.1:5432:5432"
```

### Cómo se lee
- `proxy` queda accesible desde fuera del host
- `app` no se publica, solo se usa internamente
- `db` se abre solo al host local para debugging o uso puntual

Este tipo de diseño ya reduce bastante la superficie expuesta.

---

## Séptimo concepto: cuando sí tiene sentido publicar en todas las interfaces

Tampoco se trata de “todo siempre a localhost”.

Tiene sentido publicar en todas las interfaces cuando:

- realmente querés servir la app a otras máquinas
- el host actúa como servidor para otros clientes
- estás haciendo una demo o despliegue donde la red sí debe alcanzarlo
- el servicio tiene que ser accesible desde fuera del host

La clave no es prohibir `0.0.0.0`.
La clave es **que sea una decisión consciente**.

---

## Octavo concepto: mirar el resultado real

Si querés confirmar cómo quedó publicado un contenedor real, podés usar `docker ps` o `inspect`.

Por ejemplo, con `inspect`:

```bash
docker inspect --format '{{json .NetworkSettings.Ports}}' mi-contenedor
```

Eso te permite ver si el binding real quedó:

- en todas las interfaces
- o en `127.0.0.1`
- o en otra IP puntual

Esto viene perfecto para cerrar el círculo entre intención y resultado real.

---

## Qué no tenés que confundir

### Publicar en `0.0.0.0` no es lo mismo que publicar en localhost
La diferencia de alcance es enorme.

### `ports` no es lo mismo que `expose`
Uno publica al host; el otro solo ayuda a la comunicación interna entre servicios.

### `EXPOSE` no abre nada hacia afuera
Solo documenta intención en la imagen.

### Menos puertos publicados suele significar menos superficie expuesta
Y muchas veces también menos ruido mental.

---

## Error común 1: publicar bases de datos o paneles internos en todas las interfaces “porque funciona”

Sí, funciona.
Pero suele exponer de más sin necesidad.

---

## Error común 2: usar `ports` en todos los servicios de un stack aunque varios solo se necesitan internamente

Eso agranda superficie expuesta por costumbre.

---

## Error común 3: creer que `EXPOSE 3000` ya publicó el puerto al host

No lo hace.

---

## Error común 4: olvidarte de que Compose sin IP explícita enlaza a todas las interfaces

Ahí puede quedar algo más abierto de lo que querías.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Compará estos dos casos:

```bash
docker run -p 8080:80 nginx
docker run -p 127.0.0.1:8080:80 nginx
```

Respondé con tus palabras:

- cuál expone más superficie
- cuál te parece más sano para desarrollo local
- qué cambia realmente entre uno y otro

### Ejercicio 2
Compará estos dos Compose:

#### Opción A
```yaml
services:
  app:
    image: nginx
    ports:
      - "8080:80"
```

#### Opción B
```yaml
services:
  app:
    image: nginx
    ports:
      - "127.0.0.1:8080:80"
```

Respondé:

- cuál enlaza en todas las interfaces
- cuál limita al host local
- cuándo te parecería razonable usar cada uno

### Ejercicio 3
Mirá este ejemplo:

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
    ports:
      - "127.0.0.1:5432:5432"
```

Respondé:

- por qué `proxy` usa `ports`
- por qué `app` usa `expose`
- por qué `db` podría limitarse a `127.0.0.1`
- qué superficie evitás exponer con esta estrategia

### Ejercicio 4
Respondé además:

- por qué `EXPOSE` no reemplaza a `ports`
- cómo verificarías con `inspect` el binding real de un contenedor
- por qué este tema es más de criterio que de sintaxis

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué servicio hoy está publicado de más
- qué servicio debería quedar solo interno
- qué servicio te gustaría limitar a localhost
- si hoy estás usando `ports` donde en realidad bastaba `expose`
- qué cambio concreto harías primero para reducir superficie expuesta

No hace falta escribir todavía el Compose final real.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre 0.0.0.0 y 127.0.0.1?
- ¿en qué proyecto tuyo hoy estás publicando más puertos de los necesarios?
- ¿qué servicio debería quedar solo en la red interna?
- ¿qué servicio te gustaría seguir accediendo desde tu host pero no desde fuera?
- ¿qué mejora concreta te gustaría notar al exponer menos por defecto?

Estas observaciones valen mucho más que memorizar sintaxis.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si publico un puerto sin especificar IP del host, normalmente queda enlazado a ________ y expone más superficie.  
> Si quiero limitarlo solo al propio host, probablemente me conviene usar ________.  
> Si un servicio solo necesita ser accesible por otros contenedores, probablemente me conviene usar ________ en vez de `ports`.  
> Si quiero documentar puertos en la imagen pero no publicarlos, probablemente me conviene usar ________.

Y además respondé:

- ¿por qué este tema impacta tanto en exposición segura y debugging local?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no publicar todo en todas las interfaces por costumbre?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- distinguir mucho mejor entre publicar en todas las interfaces y limitar a localhost
- usar `ports` con más criterio en Docker CLI y Compose
- entender cuándo `expose` alcanza y cuándo no
- evitar abrir servicios de más por inercia
- diseñar stacks con bastante menos superficie expuesta sin perder acceso útil

---

## Resumen del tema

- Publicar puertos es inseguro por defecto si no lo necesitabas realmente, porque el servicio puede quedar accesible más allá del host. citeturn342794view5turn828861search4
- Si incluís `127.0.0.1` o `::1` en la publicación, limitás el acceso al propio host. citeturn342794view5turn342794view4
- Si no especificás IP del host en Compose, la referencia oficial documenta que se enlaza a todas las interfaces (`0.0.0.0`). citeturn342794view1
- Compose también soporta sintaxis larga con `host_ip: 127.0.0.1`. citeturn342794view0
- `ports` publica al host; `expose` solo anuncia puertos internos para servicios de la red. citeturn342794view1
- `EXPOSE` en Dockerfile no publica puertos; solo documenta intención. citeturn828861search20
- Este tema te deja una base mucho más clara para exponer solo lo necesario y en la interfaz correcta.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque con otra práctica integrada:

- proxy publicado
- app interna
- db solo en localhost
- y un stack con mucha menos exposición innecesaria de punta a punta
