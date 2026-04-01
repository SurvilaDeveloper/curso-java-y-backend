---
title: "Comunicación por nombre entre contenedores: conectá una app con una base sin perseguir IPs"
description: "Tema 30 del curso práctico de Docker: cómo aprovechar una red definida por el usuario para que una aplicación y una base de datos se comuniquen por nombre, evitando depender de IPs que pueden cambiar."
order: 30
module: "Redes y comunicación entre contenedores"
level: "base"
draft: false
---

# Comunicación por nombre entre contenedores: conectá una app con una base sin perseguir IPs

## Objetivo del tema

En este tema vas a:

- conectar contenedores usando una red definida por el usuario
- comprobar que pueden encontrarse por nombre
- entender por qué esto es ideal para una app y su base de datos
- dejar atrás la idea de depender de IPs cambiantes
- preparar el terreno para trabajar después con Compose de una forma mucho más natural

La idea es que veas un caso muy real: un servicio hablando con otro usando el nombre del contenedor como host.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. crear una red propia
2. levantar un contenedor de base de datos dentro de esa red
3. levantar otro contenedor en la misma red
4. conectarte a la base usando el nombre del contenedor
5. comprobar que la comunicación funciona sin usar IPs
6. entender por qué esta práctica cambia mucho la forma de diseñar servicios

---

## Idea central que tenés que llevarte

Cuando dos contenedores están en una red bridge definida por el usuario, Docker puede resolverlos por nombre.

Dicho simple:

> si tu base se llama `db` y tu app está en la misma red, la app puede usar `db` como host.

Eso evita un problema muy molesto:

- buscar IPs manualmente
- cambiar connection strings cada vez que recreás contenedores
- diseñar algo frágil y difícil de mantener

---

## Qué dice la documentación oficial

La documentación oficial de Docker explica que, una vez conectados a una red definida por el usuario, los contenedores pueden comunicarse por nombre o alias. La guía actual de PostgreSQL en Docker incluso lo recomienda explícitamente: cuando tu aplicación corre en otro contenedor, lo mejor es usar una red bridge definida por el usuario y conectarse a PostgreSQL usando el nombre del contenedor como hostname. También aclara que en la red `bridge` por defecto tendrías que depender de IPs, que pueden cambiar si los contenedores se reinician. citeturn634654search1turn634654search0turn634654search2turn634654search8turn634654search9

---

## Por qué este tema importa tanto

En una app real, no querés esto:

- backend apuntando a `172.17.0.2`
- cache apuntando a `172.18.0.4`
- base apuntando a otra IP que puede cambiar

Querés algo así:

- backend apunta a `db`
- backend apunta a `redis`
- frontend apunta a `api`

Eso es muchísimo más legible, más estable y más fácil de mantener.

---

## Escenario del tema

Vas a simular esta situación:

- un contenedor PostgreSQL llamado `db`
- otro contenedor cliente que se conecta a PostgreSQL usando `db` como host
- ambos dentro de una red llamada `app-net`

No hace falta tener una app Java, Node o Python para entender el concepto.
Con que un segundo contenedor pueda hablar con la base usando el nombre, ya queda demostrado.

---

## Paso 1: crear una red propia

Ejecutá:

```bash
docker network create app-net
```

Podés verificarla con:

```bash
docker network ls
```

Deberías ver `app-net` en la lista.

---

## Paso 2: levantar PostgreSQL dentro de esa red

Ahora ejecutá:

```bash
docker run -d   --name db   --network app-net   -e POSTGRES_PASSWORD=mysecretpassword   postgres:18
```

---

## Qué hace este comando

- crea un contenedor PostgreSQL
- lo llama `db`
- lo conecta a `app-net`
- define la contraseña del usuario `postgres`

Fijate en algo importante:

no hace falta publicar puertos al host para esta prueba.

¿Por qué?

Porque no estás probando acceso desde tu máquina.
Estás probando comunicación entre contenedores dentro de la misma red.

---

## Paso 3: esperar a que PostgreSQL termine de arrancar

Podés mirar los logs si querés confirmar que la base está lista:

```bash
docker logs db
```

Cuando PostgreSQL ya terminó de iniciar, seguís con el paso siguiente.

---

## Paso 4: levantar un contenedor cliente en la misma red

Ahora vas a usar otro contenedor PostgreSQL solo como cliente, dentro de la misma red.

Ejecutá:

```bash
docker run --rm -it   --network app-net   -e PGPASSWORD=mysecretpassword   postgres:18   psql -h db -U postgres
```

---

## Qué hace este comando

- crea un contenedor temporal
- lo conecta a la red `app-net`
- define `PGPASSWORD` para autenticar sin que te la pida manualmente
- usa `psql`
- intenta conectarse a PostgreSQL usando:

```text
-h db
```

Ese `db` es el punto clave del tema.

No es una IP.
Es el nombre del contenedor PostgreSQL.

---

## Qué deberías ver

Si todo salió bien, deberías entrar a la consola de PostgreSQL.

Eso demuestra que:

- ambos contenedores estaban en la misma red
- Docker resolvió `db` como hostname válido
- no necesitaste averiguar ninguna IP manualmente

Y ésa es exactamente la ventaja que estás buscando en una app real.

---

## Qué demuestra esta práctica

Demuestra algo muy importante:

- el contenedor cliente no necesitó saber una IP
- solo necesitó saber el nombre del servicio destino
- Docker resolvió ese nombre dentro de la red definida por el usuario

Esa idea es la base de muchísimos stacks reales con múltiples servicios.

---

## Qué diferencia hay con la red bridge por defecto

La guía oficial de PostgreSQL lo explica de forma muy directa:

### En la red por defecto
tendrías que encontrar la IP del contenedor y usar esa IP para conectarte.

### En una red definida por el usuario
podés usar directamente el nombre del contenedor como host. citeturn634654search0turn634654search1turn634654search2

Esto no es un detalle menor.
Es una diferencia enorme en comodidad y estabilidad.

---

## Qué pasaría en una app backend real

Imaginá un backend con una cadena de conexión como esta:

```text
postgresql://postgres:mysecretpassword@db:5432/postgres
```

Si `db` es el nombre del contenedor PostgreSQL y ambos están en la misma red definida por el usuario, esa referencia tiene muchísimo sentido.

La parte importante no es memorizar la URL exacta.
La parte importante es entender que:

- `db` funciona como hostname
- Docker lo resuelve dentro de la red
- eso hace que tu configuración sea mucho más clara

---

## Qué papel juega el nombre del contenedor

Docker documenta que si asignás un nombre con `--name`, podés usarlo como identificador cuando el contenedor está en una red definida por el usuario. citeturn634654search8turn634654search9

Por eso este comando:

```bash
--name db
```

no es una decoración.
Le está dando al servicio un nombre útil para la red.

---

## Qué pasa si recreás el contenedor

Si recreás el contenedor PostgreSQL y seguís llamándolo `db`, la aplicación puede seguir usando el host `db`.

Eso es muchísimo más estable que perseguir IPs que cambian.

La documentación oficial de PostgreSQL en Docker usa exactamente este contraste para mostrar por qué no conviene diseñar con IPs manuales. citeturn634654search0

---

## Qué no tenés que confundir

### Nombre de contenedor no es lo mismo que puerto publicado al host
Una cosa es cómo otro contenedor lo encuentra dentro de la red.
Otra es si vos querés entrar desde tu máquina.

### Que dos contenedores estén corriendo no significa que ya puedan hablarse como querés
Importa mucho que estén en la misma red adecuada.

### Comunicación interna no requiere necesariamente -p
Para esta prueba no publicaste PostgreSQL al host y aun así otro contenedor pudo conectarse.

### Resolver por nombre no significa que Docker use magia
Hay una red definida por el usuario y un DNS interno que hace ese trabajo.

---

## Error común 1: publicar un puerto pensando que eso ya resuelve la comunicación interna

No.

Publicar puertos sirve para acceso desde el host.

La comunicación entre contenedores depende sobre todo de la red compartida.

---

## Error común 2: diseñar con IPs en vez de nombres

La documentación oficial deja bastante claro que eso vuelve frágil tu configuración, porque las IPs pueden cambiar al recrear contenedores. citeturn634654search0turn634654search1

---

## Error común 3: olvidarte de poner ambos servicios en la misma red

Si el cliente y la base no comparten red, esta idea de resolver por nombre no va a funcionar como esperás.

---

## Error común 4: no darle un nombre claro al contenedor que querés usar como dependencia

Si tu servicio de base se va a usar como host, conviene llamarlo de forma clara, por ejemplo:

- `db`
- `postgres`
- `redis`
- `api`

Eso hace que la configuración de otros servicios sea mucho más legible.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá una red propia:

```bash
docker network create app-net
```

### Ejercicio 2
Levantá PostgreSQL en esa red:

```bash
docker run -d   --name db   --network app-net   -e POSTGRES_PASSWORD=mysecretpassword   postgres:18
```

### Ejercicio 3
Esperá a que arranque y, si querés, mirá logs:

```bash
docker logs db
```

### Ejercicio 4
Levantá un cliente temporal en la misma red y conectate por nombre:

```bash
docker run --rm -it   --network app-net   -e PGPASSWORD=mysecretpassword   postgres:18   psql -h db -U postgres
```

### Ejercicio 5
Una vez dentro de `psql`, ejecutá una consulta simple:

```sql
SELECT version();
```

### Ejercicio 6
Salí con:

```sql
\q
```

### Ejercicio 7
Respondé con tus palabras:

- ¿por qué funcionó `-h db`?
- ¿qué ventaja te dio la red definida por el usuario?
- ¿por qué esto sería mejor que usar una IP?

### Ejercicio 8
Cuando termines, limpiá:

```bash
docker stop db
docker rm db
docker network rm app-net
```

---

## Segundo ejercicio de análisis

Imaginá una app con estos tres servicios:

- `api`
- `db`
- `redis`

Respondé:

- qué host usaría la API para conectarse a la base
- qué host usaría la API para conectarse al cache
- por qué eso sería más claro que guardar IPs manuales
- qué servicios además necesitarían publicar puertos al host y cuáles no necesariamente

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan natural te resultó usar `db` como host?
- ¿qué parte de esta práctica te hizo entender mejor el valor de las redes Docker?
- ¿por qué esto simplifica tanto una app con varios servicios?
- ¿qué diferencia ves entre “mi máquina se conecta a la base” y “otro contenedor se conecta a la base”?
- ¿cómo te imaginás usando esta idea en tus proyectos?

Estas observaciones valen mucho más que recordar un comando suelto.

---

## Mini desafío

Intentá explicar con tus palabras esta idea:

> En una red Docker bien armada, una app puede conectarse a la base usando el nombre del servicio, sin preocuparse por IPs manuales.

Y además respondé:

- ¿qué hace posible eso?
- ¿por qué la red definida por el usuario es tan valiosa?
- ¿qué problema concreto te evita esta forma de trabajar?
- ¿qué te parece que Compose va a simplificar todavía más después de esto?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- conectar contenedores por nombre dentro de una red definida por el usuario
- entender por qué eso es ideal para app + base de datos
- explicar por qué no conviene depender de IPs cambiantes
- distinguir mejor acceso interno entre contenedores y acceso desde el host
- prepararte mucho mejor para el bloque donde aparezca Compose

---

## Resumen del tema

- En una red definida por el usuario, los contenedores pueden comunicarse por nombre. citeturn634654search1turn634654search0
- Docker recomienda esta estrategia para conectar una aplicación con PostgreSQL cuando ambos corren en contenedores. citeturn634654search0
- La red `bridge` por defecto te empuja a pensar en IPs, que son más frágiles porque pueden cambiar. citeturn634654search0turn634654search2
- Publicar puertos al host no es lo mismo que tener comunicación interna entre contenedores.
- Este tema te muestra una de las prácticas más importantes para diseñar servicios Docker de forma limpia.

---

## Próximo tema

En el próximo tema vas a cerrar este bloque con un ejemplo todavía más integrado:

- backend + base de datos
- puertos al host donde sí hagan falta
- red interna para lo que no haga falta exponer
- una vista más completa de cómo se organiza una app simple en Docker
