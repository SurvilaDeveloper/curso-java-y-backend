---
title: "App + base de datos conectadas: red interna para la base y puertos solo donde hacen falta"
description: "Tema 31 del curso práctico de Docker: cómo organizar una app y una base de datos en una red Docker, conectarlas por nombre, persistir los datos de PostgreSQL y entender cuándo realmente hace falta publicar puertos al host."
order: 31
module: "Redes y comunicación entre contenedores"
level: "base"
draft: false
---

# App + base de datos conectadas: red interna para la base y puertos solo donde hacen falta

## Objetivo del tema

En este tema vas a:

- conectar una aplicación con una base de datos dentro de una red Docker
- usar el nombre del contenedor de base como host
- combinar red interna y persistencia en un caso real
- entender cuándo realmente hace falta publicar puertos al host
- empezar a ver una estructura de servicios mucho más parecida a la de una app real

La idea es que juntes varias piezas que ya aprendiste en un escenario integrado y muy útil.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. crear una red para la app
2. crear un volumen para la base
3. levantar PostgreSQL sin exponerlo al host
4. levantar un segundo contenedor que actúe como cliente o app
5. conectarte a la base usando `db` como host
6. entender por qué este patrón es más limpio que depender de puertos o IPs innecesarias

---

## Idea central que tenés que llevarte

En una app real, no todo servicio necesita exponerse al host.

Muy seguido conviene esta separación:

- la base de datos vive solo en la red interna
- la app o el servicio que de verdad necesitás usar desde el host es el que publicás
- entre contenedores, la comunicación ocurre por nombre dentro de la red Docker

Dicho simple:

> la base puede quedarse interna  
> la app puede hablarle por nombre  
> y solo publicás al host lo que de verdad necesitás exponer

Ese patrón es mucho más limpio y más cercano a un entorno real.

---

## Qué problema resuelve este tema

Hasta ahora ya viste por separado:

- volúmenes
- bind mounts
- redes
- publicación de puertos
- comunicación por nombre

Ahora toca ver cómo se combinan en algo más completo.

Porque una app real suele necesitar, al menos:

- una red para que los servicios se encuentren
- persistencia para que la base no pierda datos
- y una decisión clara sobre qué se expone al host y qué no

---

## Escenario del tema

Vas a armar algo así:

- una red llamada `app-net`
- un volumen llamado `postgres_data`
- un contenedor PostgreSQL llamado `db`
- un segundo contenedor temporal que actúa como cliente o “mini app”
- conexión del cliente a PostgreSQL usando `db` como hostname

No hace falta una app Java, Node o Python completa para entender el patrón.
Con que otro contenedor pueda conectarse por nombre y ejecutar una consulta, el concepto ya queda muy claro.

---

## Paso 1: crear la red de la app

Ejecutá:

```bash
docker network create app-net
```

Podés verificarla con:

```bash
docker network ls
```

---

## Paso 2: crear el volumen de PostgreSQL

Ejecutá:

```bash
docker volume create postgres_data
```

Podés verificarlo con:

```bash
docker volume ls
```

---

## Qué idea hay detrás de estos dos recursos

Antes de correr nada, ya estás separando dos preocupaciones distintas:

### `app-net`
Define cómo se comunican los servicios.

### `postgres_data`
Define dónde persisten los datos de la base.

Esa separación es muy buena práctica.

---

## Paso 3: levantar PostgreSQL dentro de la red interna

Ahora ejecutá:

```bash
docker run -d   --name db   --network app-net   -e POSTGRES_PASSWORD=mysecretpassword   -v postgres_data:/var/lib/postgresql   postgres:18
```

---

## Qué hace este comando

- crea un contenedor PostgreSQL llamado `db`
- lo conecta a la red `app-net`
- le asigna una contraseña al usuario `postgres`
- monta un volumen para persistencia
- no publica ningún puerto al host

Y esta última decisión es importante.

---

## Por qué no publicaste la base al host

Porque en este ejemplo la base solo necesita ser consumida por otro contenedor.

Eso significa que el acceso interno por red Docker ya alcanza.

No hace falta hacer esto:

```bash
-p 5432:5432
```

si tu objetivo principal es que otros contenedores hablen con la base.

Esto te ayuda a razonar mejor qué servicios realmente necesitan salir al host y cuáles pueden quedarse internos.

---

## Paso 4: esperar a que PostgreSQL esté listo

Podés mirar logs si querés comprobar el arranque:

```bash
docker logs db
```

Cuando veas que PostgreSQL terminó de iniciar, pasás al siguiente paso.

---

## Paso 5: levantar un cliente temporal que actúe como “app”

Ahora vas a crear un segundo contenedor en la misma red, y lo vas a usar para conectarte a la base.

Ejecutá:

```bash
docker run --rm -it   --network app-net   -e PGPASSWORD=mysecretpassword   postgres:18   psql -h db -U postgres
```

---

## Qué hace este comando

- crea un contenedor temporal
- lo conecta a la red `app-net`
- usa la herramienta `psql`
- se conecta a PostgreSQL usando:

```text
-h db
```

Y ese `db` es la parte clave.

No es una IP.
No es `localhost`.
Es el nombre del contenedor PostgreSQL dentro de la red.

---

## Qué deberías ver

Si todo salió bien, deberías entrar a la consola interactiva de PostgreSQL.

Eso demuestra que:

- la red interna está funcionando
- el cliente pudo encontrar la base por nombre
- no necesitaste exponer la base al host
- no necesitaste perseguir ninguna IP manualmente

---

## Paso 6: crear una tabla y guardar un dato

Una vez dentro de `psql`, ejecutá:

```sql
CREATE TABLE notas (
  id SERIAL PRIMARY KEY,
  texto TEXT NOT NULL
);

INSERT INTO notas (texto)
VALUES ('Esta app se conectó a la base usando el nombre del contenedor');

SELECT * FROM notas;
```

---

## Qué demuestra esta parte

Demuestra que la conexión no solo existe:
realmente podés trabajar con la base.

Eso hace mucho más tangible la idea de “app + base conectadas”.

---

## Paso 7: salir del cliente

Salí con:

```sql
\q
```

El contenedor cliente desaparece porque lo ejecutaste con `--rm`.

La base, en cambio, sigue viva.

---

## Qué está pasando realmente en este escenario

La lectura conceptual completa sería esta:

1. creaste una red para los servicios
2. creaste un volumen para los datos
3. levantaste PostgreSQL dentro de esa red
4. levantaste un segundo contenedor en la misma red
5. el segundo contenedor usó `db` como hostname
6. Docker resolvió el nombre
7. la base respondió
8. los datos quedaron persistidos en el volumen

Este flujo ya se parece bastante a una arquitectura simple real.

---

## Qué pasaría si quisieras que el host también entre a la base

En desarrollo, a veces puede tener sentido publicar PostgreSQL solo en `localhost`.

Eso sería algo como:

```bash
-p 127.0.0.1:5432:5432
```

Pero lo importante del tema es esta idea:

- **para la comunicación entre contenedores no hace falta publicar el puerto**
- publicar al host es una necesidad aparte, no la base de la comunicación interna

Esto te ayuda a no mezclar responsabilidades.

---

## Diferencia entre acceso interno y acceso desde tu máquina

### Acceso interno entre contenedores
Usa la red Docker y el nombre del servicio.

Ejemplo:

```text
db
```

### Acceso desde tu host
Usa puertos publicados.

Ejemplo:

```text
localhost:5432
```

Estas dos cosas se parecen, pero no son lo mismo.

---

## Qué ventaja te da este patrón

Te da varias ventajas importantes:

- la base no necesita exponerse si no hace falta
- la app puede hablarle por nombre
- la configuración es más legible
- la red queda más limpia
- la persistencia queda separada del contenedor

Es una forma mucho más razonable de pensar servicios que lo que suele hacer alguien al principio cuando publica todo “por las dudas”.

---

## Qué no tenés que confundir

### Que la base no esté publicada no significa que no sea accesible
Puede ser perfectamente accesible desde otros contenedores de la misma red.

### `db` no es un alias mágico global
Funciona porque ese contenedor está en la red correcta y Docker puede resolverlo ahí.

### Persistencia y red son problemas distintos
Una cosa resuelve cómo se comunican los servicios.
La otra resuelve dónde viven los datos.

### La app cliente de este tema no es una app completa
Es una simulación mínima del patrón real de “otro servicio que necesita conectarse a la base”.

---

## Error común 1: publicar la base al host pensando que eso es obligatorio

No lo es.

Si solo la van a consumir otros contenedores, puede quedarse perfectamente interna.

---

## Error común 2: usar localhost dentro del contenedor para conectarte a la base

Si un contenedor intenta usar `localhost`, está apuntando a sí mismo, no al otro contenedor.

Por eso en redes Docker el host correcto suele ser el nombre del servicio, por ejemplo:

```text
db
```

---

## Error común 3: no separar red y persistencia

A veces alguien levanta la base y cree que con que “arranque” ya está.

Pero una base real necesita pensar dos cosas por separado:

- cómo la alcanzan otros servicios
- cómo persisten los datos

---

## Error común 4: mezclar acceso del host con acceso interno

Una app dentro de Docker y tu laptop no llegan al servicio de la misma manera.

Eso conviene tenerlo muy claro desde temprano.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá la red:

```bash
docker network create app-net
```

### Ejercicio 2
Creá el volumen:

```bash
docker volume create postgres_data
```

### Ejercicio 3
Levantá PostgreSQL dentro de la red, sin publicar puertos:

```bash
docker run -d   --name db   --network app-net   -e POSTGRES_PASSWORD=mysecretpassword   -v postgres_data:/var/lib/postgresql   postgres:18
```

### Ejercicio 4
Esperá a que arranque y, si querés, mirá logs:

```bash
docker logs db
```

### Ejercicio 5
Levantá un cliente temporal y conectate por nombre:

```bash
docker run --rm -it   --network app-net   -e PGPASSWORD=mysecretpassword   postgres:18   psql -h db -U postgres
```

### Ejercicio 6
Dentro de `psql`, ejecutá:

```sql
CREATE TABLE notas (
  id SERIAL PRIMARY KEY,
  texto TEXT NOT NULL
);

INSERT INTO notas (texto)
VALUES ('Esta app se conectó a la base usando el nombre del contenedor');

SELECT * FROM notas;
```

### Ejercicio 7
Salí con:

```sql
\q
```

### Ejercicio 8
Respondé con tus palabras:

- ¿por qué funcionó usar `db` como host?
- ¿por qué no hizo falta publicar PostgreSQL al host?
- ¿qué papel jugó la red?
- ¿qué papel jugó el volumen?

### Ejercicio 9
Cuando termines, limpiá:

```bash
docker stop db
docker rm db
docker network rm app-net
```

No elimines el volumen si querés conservar lo que escribiste.

---

## Segundo ejercicio de análisis

Pensá en una app tuya o posible y respondé:

- ¿qué servicio sería el “backend”?
- ¿qué servicio sería la base?
- ¿qué nombre le pondrías a la base dentro de la red?
- ¿qué cosas deberían quedar internas?
- ¿qué cosas sí publicarías al host?
- ¿por qué no conviene exponer todo por costumbre?

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan natural te resultó separar red interna y puertos al host?
- ¿qué te enseñó este ejemplo sobre el valor de usar nombres?
- ¿por qué esta estructura ya se parece bastante a una app real?
- ¿qué parte del flujo te hizo sentir que red y persistencia son problemas distintos?
- ¿en qué proyecto tuyo podrías aplicar este mismo patrón?

Estas observaciones valen mucho más que simplemente lograr la conexión.

---

## Mini desafío

Intentá explicar con tus palabras este patrón:

> la base de datos queda interna en la red Docker, la aplicación se conecta por nombre, y solo se publican al host los servicios que realmente necesitás usar desde afuera.

Y además respondé:

- ¿por qué esta forma de organizar servicios es más limpia?
- ¿qué problema evita respecto a IPs y puertos innecesarios?
- ¿qué te parece que Compose va a simplificar cuando llegues a esa parte?
- ¿qué parte de este patrón te parece más útil para proyectos reales?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- combinar red interna y persistencia en un caso real
- conectar una app o cliente con PostgreSQL usando el nombre del contenedor
- distinguir claramente acceso interno y acceso desde el host
- entender por qué no conviene exponer más puertos de los necesarios
- prepararte muy bien para el bloque donde aparezca Docker Compose

---

## Resumen del tema

- En una red definida por el usuario, una app puede conectarse a la base usando el nombre del contenedor como host.
- Para la comunicación interna no hace falta publicar la base al host.
- Persistencia y red resuelven problemas distintos, pero en una app real trabajan juntas.
- Este patrón se parece mucho más a cómo se organizan servicios reales en Docker que levantar todo de forma aislada.
- Es una base excelente para entender después por qué Compose resulta tan cómodo.

---

## Próximo tema

En el próximo bloque vas a pasar a una herramienta que justamente simplifica todo esto:

- varios servicios
- red compartida
- volúmenes
- variables
- arranque conjunto

En otras palabras:

- Docker Compose como herramienta central
