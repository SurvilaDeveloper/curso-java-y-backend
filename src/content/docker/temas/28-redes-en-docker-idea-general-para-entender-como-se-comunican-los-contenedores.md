---
title: "Redes en Docker: idea general para entender cómo se comunican los contenedores"
description: "Tema 28 del curso práctico de Docker: introducción a redes en Docker, qué papel cumplen, qué diferencia hay entre la red bridge por defecto y una red bridge definida por el usuario, y por qué los nombres de contenedor importan tanto."
order: 28
module: "Redes y comunicación entre contenedores"
level: "base"
draft: false
---

# Redes en Docker: idea general para entender cómo se comunican los contenedores

## Objetivo del tema

En este tema vas a:

- entender para qué existen las redes en Docker
- ver cómo se comunican los contenedores entre sí
- distinguir la red `bridge` por defecto de una red definida por el usuario
- entender por qué los nombres de contenedor importan mucho en redes personalizadas
- prepararte para conectar aplicaciones y bases de datos en los próximos temas

La idea es que entres al bloque de redes con una base clara y sin confusiones raras.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender qué papel cumple una red en Docker
2. ver qué pasa con la red por defecto
3. entender por qué las redes bridge definidas por el usuario suelen ser mejores
4. empezar a pensar la comunicación entre servicios por nombre
5. construir una base mental útil para los próximos temas del bloque

---

## Idea central que tenés que llevarte

Cuando tenés varios contenedores, tarde o temprano aparece esta pregunta:

> ¿cómo se comunican entre sí?

Docker resuelve eso con redes.

Dicho simple:

- una red permite que contenedores puedan hablarse
- no todas las redes se comportan igual
- la red por defecto existe, pero muchas veces conviene una red definida por vos
- en una red bien elegida, los contenedores pueden encontrarse por nombre

Eso es fundamental para app + base de datos, backend + cache, frontend + API y muchísimos casos reales.

---

## Qué es una red en Docker

Una red en Docker es el mecanismo que define cómo se conectan los contenedores entre sí y con otros puntos del sistema.

No hace falta pensarlo como algo demasiado abstracto.

Para este curso, quedate con esta idea:

- si dos contenedores están en la misma red adecuada, pueden comunicarse
- si no lo están, esa comunicación puede no existir o volverse más incómoda
- la forma en que los descubrís importa mucho

---

## Por qué este bloque es importante

Hasta ahora ya viste:

- imágenes
- contenedores
- Dockerfile
- builds
- puertos
- volúmenes
- bind mounts

Pero una app real no suele vivir sola.

Muy seguido tenés algo como:

- backend + base de datos
- app + Redis
- frontend + API
- varios servicios trabajando juntos

Ahí la red deja de ser un detalle y se vuelve una pieza central.

---

## Qué dice la documentación oficial

La documentación oficial de Docker explica que los contenedores pueden comunicarse entre sí usando redes Docker y que, en redes bridge definidas por el usuario, los contenedores pueden resolverse por nombre o alias. También aclara que la red `bridge` por defecto existe automáticamente, pero que las redes bridge creadas por el usuario son superiores porque ofrecen mejor aislamiento y resolución DNS automática entre contenedores. citeturn729929search0turn729929search1turn729929search3

---

## La red bridge por defecto

Cuando arrancás Docker, existe automáticamente una red llamada:

```text
bridge
```

Si ejecutás un contenedor sin indicar otra red, normalmente se conecta ahí.

Por eso muchas veces los primeros contenedores que probás terminan en esa red sin que lo pienses demasiado.

---

## Qué problema tiene la red por defecto

Docker explica que, en la red `bridge` por defecto, los contenedores pueden comunicarse usando direcciones IP, pero no se resuelven automáticamente por nombre de la misma manera que en una red bridge definida por el usuario. También remarca que esta red no es la recomendada para producción y que las redes definidas por el usuario ofrecen mejor aislamiento. citeturn729929search1turn729929search0

Eso significa que:

- puede funcionar para pruebas simples
- pero no suele ser la opción más clara ni más cómoda para una app real con varios servicios

---

## Qué es una red bridge definida por el usuario

Es una red bridge que vos creás explícitamente.

Por ejemplo:

```bash
docker network create --driver bridge mi-red
```

A partir de ahí, podés conectar contenedores a esa red.

La ventaja importante es que esos contenedores pueden encontrarse por nombre y además la red queda más “acotada” a ese grupo de servicios.

---

## Cómo conviene pensar una red definida por el usuario

Pensala así:

- armás una red para un proyecto o grupo de servicios
- conectás ahí solo los contenedores que deberían hablarse
- esos contenedores pueden comunicarse por nombre
- evitás mezclar todo en la red por defecto

Esta forma de trabajo es mucho más ordenada.

---

## Por qué el nombre del contenedor importa

Docker documenta que, en una red definida por el usuario, los contenedores pueden resolverse por nombre. También explica que si definís un nombre con `--name`, podés usarlo cuando el contenedor está en una red definida por el usuario. citeturn729929search1turn729929search11

Eso significa que podés hacer algo como esto mentalmente:

- un contenedor se llama `db`
- otro contenedor en la misma red quiere conectarse a la base
- puede usar `db` como hostname

Esto es muchísimo más cómodo que perseguir IPs que pueden cambiar.

---

## Por qué las IPs no son la mejor base mental

Podrías pensar:

> “Bueno, si Docker le da una IP al contenedor, uso esa IP.”

El problema es que las IPs pueden cambiar cuando los contenedores se recrean o reinician.

La documentación oficial actual de Docker para PostgreSQL lo dice muy claro: en la red bridge por defecto terminarías dependiendo de IPs, y como esas IPs cambian, tus connection strings se vuelven frágiles. En una red definida por el usuario, en cambio, usás el nombre del contenedor y Docker lo resuelve automáticamente. citeturn729929search13

---

## Ejemplo mental simple: backend + base

Imaginá este caso:

- un contenedor backend
- un contenedor PostgreSQL
- ambos en una red definida por el usuario llamada `app-net`

Si el contenedor de base se llama:

```text
db
```

el backend podría pensar su conexión así:

```text
host=db
```

sin preocuparse por una IP fija.

Ese es uno de los usos más valiosos de las redes Docker.

---

## Qué diferencia hay entre publicar puertos y poner contenedores en red

Esto te tiene que quedar clarísimo.

### Publicar puertos
Sirve para acceder desde tu host a un servicio del contenedor.

Ejemplo:

```bash
-p 8080:80
```

### Conectar contenedores a una red
Sirve para que se hablen entre ellos dentro del ecosistema Docker.

No son lo mismo.

Podrías tener:

- una base de datos accesible solo desde otros contenedores
- un backend accesible desde otros contenedores y además publicado al host
- un frontend publicado al navegador

La red interna y la publicación de puertos son dos piezas distintas.

---

## Ver las redes disponibles

Podés listar redes con:

```bash
docker network ls
```

---

## Qué deberías ver

Deberías encontrar cosas como:

- `bridge`
- `host`
- `none`

y las redes que vos mismo vayas creando.

No hace falta profundizar hoy en todos los drivers.
Lo importante es que empieces a ver que la red es un recurso real en Docker, no un detalle oculto.

---

## Crear una red bridge personalizada

Podés crear una red así:

```bash
docker network create --driver bridge app-net
```

O también:

```bash
docker network create app-net
```

si querés usar el driver bridge por defecto para la red creada.

---

## Qué hace

Crea una red aislada donde después podés correr contenedores.

Por ejemplo:

```bash
docker run -d --name servicio1 --network app-net nginx
```

```bash
docker run -d --name servicio2 --network app-net alpine sleep 300
```

No hace falta hacer una demo profunda todavía.
La idea es que empieces a leer la sintaxis con naturalidad.

---

## Qué ventaja tiene conectar contenedores a la misma red

Docker documenta que una vez que dos contenedores están conectados a la misma red definida por el usuario, pueden comunicarse usando nombre o alias. citeturn729929search0turn729929search5

Esa es exactamente la base que después usarás para:

- conectar una app con su base
- conectar un backend con un cache
- conectar servicios de una misma solución

---

## Qué otros drivers existen

La documentación oficial lista varios drivers de red, entre ellos:

- `bridge`
- `host`
- `none`
- `overlay`
- `ipvlan`
- `macvlan` citeturn729929search0turn729929search3

Pero para este curso, por ahora, el foco va a estar en:

- `bridge` por defecto
- `bridge` definido por el usuario

Porque es lo que más vas a usar al principio y en muchos proyectos reales de un solo host.

---

## Qué no tenés que confundir

### Red interna entre contenedores no es lo mismo que acceso desde el navegador
Para el navegador seguís necesitando publicación de puertos si querés entrar desde el host.

### La red `bridge` por defecto no es lo mismo que una red bridge definida por vos
Tienen diferencias importantes en aislamiento y resolución por nombre.

### Nombre de contenedor no siempre implica descubrimiento automático en cualquier situación
Lo valioso aparece especialmente en redes definidas por el usuario.

### IP del contenedor no es una base estable para diseñar tu app
Conviene pensar por nombres cuando Docker te lo permite.

---

## Error común 1: usar la red por defecto para todo sin pensarlo

Puede funcionar al principio, pero después te complica más de lo necesario.

---

## Error común 2: intentar resolver servicios por nombre en la red equivocada

Si no estás usando una red definida por el usuario, la experiencia puede no ser la que esperás.

---

## Error común 3: creer que si dos contenedores existen ya pueden hablarse como vos querés

No alcanza con que existan.
Importa mucho cómo están conectados.

---

## Error común 4: mezclar mentalmente “publicar puertos” con “estar en la misma red”

Son dos mecanismos distintos y cumplen roles distintos.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Listá las redes existentes:

```bash
docker network ls
```

### Ejercicio 2
Creá una red bridge definida por el usuario:

```bash
docker network create app-net
```

### Ejercicio 3
Volvé a listar redes y verificá que aparezca:

```text
app-net
```

### Ejercicio 4
Levantá dos contenedores simples conectados a esa red:

```bash
docker run -d --name servicio-a --network app-net alpine sleep 300
docker run -d --name servicio-b --network app-net alpine sleep 300
```

### Ejercicio 5
Respondé con tus palabras:

- ¿qué ventaja tiene haber creado una red propia?
- ¿por qué el nombre de un contenedor empieza a ser útil acá?
- ¿por qué no conviene pensar la comunicación entre servicios en términos de IP fija?

### Ejercicio 6
Cuando termines, limpiá:

```bash
docker stop servicio-a servicio-b
docker rm servicio-a servicio-b
docker network rm app-net
```

---

## Segundo ejercicio de análisis

Pensá en una app con:

- backend
- base de datos
- frontend

Y respondé:

- qué servicios deberían poder hablarse entre sí
- cuáles necesitarían solo red interna
- cuáles además necesitarían publicación de puertos al host
- por qué esto ya te obliga a pensar en redes como una pieza de diseño y no como un detalle

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre red interna y publicación de puertos?
- ¿por qué una red definida por el usuario te parece más ordenada que la red por defecto?
- ¿qué valor práctico le ves a la resolución por nombre?
- ¿por qué esto te prepara tan bien para conectar una app con una base?
- ¿qué parte del comportamiento de Docker te parecía “mágica” y ahora te quedó más entendible?

Estas observaciones valen mucho más que memorizar el comando de creación de red.

---

## Mini desafío

Intentá explicar con tus palabras esta idea:

> En Docker, los servicios de una misma app conviene que compartan una red pensada para ellos, y no depender de la red por defecto ni de IPs cambiantes.

Y además respondé:

- ¿por qué una red definida por el usuario mejora el aislamiento?
- ¿por qué los nombres importan tanto en este contexto?
- ¿qué diferencia concreta ves entre “el navegador entra por un puerto” y “dos contenedores se comunican por red interna”?
- ¿qué escenario de tus proyectos te parece que se beneficiaría mucho de esto?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar qué papel cumple una red en Docker
- distinguir la red `bridge` por defecto de una red bridge definida por el usuario
- entender por qué la comunicación por nombre es tan útil
- diferenciar publicación de puertos y comunicación interna entre contenedores
- prepararte mucho mejor para los temas prácticos de app + base de datos

---

## Resumen del tema

- Las redes Docker permiten que los contenedores se comuniquen entre sí. citeturn729929search0
- La red `bridge` por defecto existe automáticamente, pero no suele ser la mejor opción para una app real con varios servicios. citeturn729929search1turn729929search0
- Las redes bridge definidas por el usuario ofrecen mejor aislamiento y resolución automática por nombre o alias. citeturn729929search1turn729929search5
- Publicar puertos y compartir red interna son cosas distintas.
- Este tema te da la base mental que necesitás para conectar contenedores con más criterio.

---

## Próximo tema

En el próximo tema vas a bajar esta idea a una práctica muy concreta:

- red bridge por defecto
- red bridge definida por el usuario
- prueba real de comunicación
- ver con tus propios ojos por qué la red definida por el usuario suele ser mejor
