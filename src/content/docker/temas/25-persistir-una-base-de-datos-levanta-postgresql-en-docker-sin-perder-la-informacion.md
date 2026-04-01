---
title: "Persistir una base de datos: levantá PostgreSQL en Docker sin perder la información"
description: "Tema 25 del curso práctico de Docker: cómo correr PostgreSQL en un contenedor con un volumen nombrado, por qué eso evita perder datos al recrear el contenedor y cómo comprobar que la persistencia realmente funciona."
order: 25
module: "Datos y archivos"
level: "base"
draft: false
---

# Persistir una base de datos: levantá PostgreSQL en Docker sin perder la información

## Objetivo del tema

En este tema vas a:

- levantar PostgreSQL dentro de un contenedor
- montarle un volumen para persistir los datos
- comprobar que la base sigue teniendo información aunque recrees el contenedor
- ver un caso real donde la persistencia deja de ser teoría y pasa a ser necesidad concreta
- empezar a pensar mejor cómo correr servicios de datos en Docker

La idea es que uses todo lo que viste sobre volúmenes en un escenario mucho más real: una base de datos.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. crear un volumen para los datos de PostgreSQL
2. levantar un contenedor PostgreSQL usando ese volumen
3. conectarte a la base
4. crear una tabla y guardar un dato
5. eliminar el contenedor
6. volver a levantar otro contenedor con el mismo volumen
7. comprobar que los datos siguen ahí

---

## Idea central que tenés que llevarte

Una base de datos es uno de los casos donde la persistencia no es opcional.

Dicho simple:

> si corrés PostgreSQL en un contenedor sin una estrategia de persistencia, tarde o temprano vas a perder la información cuando ese contenedor desaparezca

Por eso este tema es tan importante.

---

## Qué dice la documentación oficial

La guía oficial actual de Docker para PostgreSQL explica que los contenedores son efímeros pero los datos no deberían serlo, y recomienda configurar persistencia para que la información sobreviva a reinicios y eliminaciones de contenedores. También muestra un arranque rápido con PostgreSQL y volumen nombrado, y en la guía de conectividad recomienda publicar el puerto en `127.0.0.1:5432:5432` para desarrollo local. citeturn519407search0turn608116view2turn608116view1

---

## Por qué PostgreSQL es un buen ejemplo para este tema

Porque una base de datos deja muy clara la diferencia entre:

- contenedor funcionando
- contenedor persistiendo datos correctamente

Podés hacer que PostgreSQL arranque muy fácil.

Pero si no montás persistencia, no alcanza para un uso real.

---

## Qué ruta se persiste en este ejemplo

La guía oficial de Docker para persistencia con PostgreSQL usa un volumen montado en:

```text
/var/lib/postgresql
```

y explica que ahí PostgreSQL guarda los archivos de la base dentro del contenedor para este flujo de aprendizaje. citeturn608116view1turn608116view2

Para este curso, vamos a seguir ese enfoque oficial para mantener el ejemplo alineado con la documentación actual.

---

## Paso 1: crear un volumen para la base

Ejecutá:

```bash
docker volume create postgres_data
```

---

## Qué hace

Crea un volumen nombrado llamado:

```text
postgres_data
```

Ahí van a quedar los datos persistentes de PostgreSQL.

Podés verificarlo con:

```bash
docker volume ls
```

---

## Paso 2: levantar PostgreSQL con volumen

Ahora ejecutá:

```bash
docker run -d   --name postgres-dev   -e POSTGRES_PASSWORD=mysecretpassword   -p 127.0.0.1:5432:5432   -v postgres_data:/var/lib/postgresql   postgres:18
```

---

## Qué significa este comando

### `-d`
Deja el contenedor corriendo en segundo plano.

### `--name postgres-dev`
Le da un nombre claro al contenedor.

### `-e POSTGRES_PASSWORD=mysecretpassword`
Configura la contraseña del usuario `postgres`.

### `-p 127.0.0.1:5432:5432`
Expone PostgreSQL solo en `localhost`, que es la opción recomendada en desarrollo por la guía oficial de Docker. citeturn608116view2

### `-v postgres_data:/var/lib/postgresql`
Monta el volumen `postgres_data` en la ruta usada en la guía oficial para persistir la base. citeturn608116view1turn608116view2

### `postgres:18`
Usa la imagen oficial de PostgreSQL versión 18.

---

## Qué deberías hacer después de arrancarlo

Primero comprobá que esté corriendo:

```bash
docker ps
```

Y si querés ver mensajes de arranque:

```bash
docker logs postgres-dev
```

La guía oficial incluso sugiere mirar logs cuando PostgreSQL no arranca bien, sobre todo en escenarios de permisos o de bind mounts. citeturn608116view0

---

## Paso 3: conectarte a la base

La forma más cómoda para este tema es usar `psql` dentro del propio contenedor.

Ejecutá:

```bash
docker exec -it postgres-dev psql -U postgres
```

La guía oficial de persistencia usa precisamente este enfoque para entrar a la base con `docker exec`. citeturn608116view1

---

## Qué deberías ver

Deberías entrar a la consola interactiva de PostgreSQL.

Ahí podés ejecutar SQL real.

---

## Paso 4: crear una tabla y guardar un dato

Una vez dentro de `psql`, ejecutá esto:

```sql
CREATE TABLE mensajes (
  id SERIAL PRIMARY KEY,
  texto TEXT NOT NULL
);

INSERT INTO mensajes (texto)
VALUES ('Hola, este dato debería sobrevivir al contenedor');

SELECT * FROM mensajes;
```

---

## Qué deberías ver

Deberías ver una fila con el texto insertado.

Eso significa que la base está funcionando y que ya guardaste información real.

---

## Salí de psql

Cuando termines, salí con:

```sql
\q
```

---

## Paso 5: eliminar el contenedor

Ahora vas a hacer la parte importante del ejercicio.

Ejecutá:

```bash
docker stop postgres-dev
docker rm postgres-dev
```

---

## Qué pasa ahora

El contenedor desapareció.

Pero el volumen `postgres_data` no.

Ese es justamente el punto que querés comprobar.

---

## Paso 6: volver a levantar PostgreSQL con el mismo volumen

Ejecutá otra vez un contenedor nuevo, usando el mismo volumen:

```bash
docker run -d   --name postgres-dev-2   -e POSTGRES_PASSWORD=mysecretpassword   -p 127.0.0.1:5432:5432   -v postgres_data:/var/lib/postgresql   postgres:18
```

---

## Qué cambia y qué no cambia

### Cambia
- el contenedor
- el nombre del contenedor
- la instancia concreta que está corriendo

### No cambia
- el volumen
- los datos guardados en ese volumen

Ahí está el corazón de la persistencia.

---

## Paso 7: volver a consultar el dato

Entrá otra vez a PostgreSQL:

```bash
docker exec -it postgres-dev-2 psql -U postgres
```

Y una vez dentro ejecutá:

```sql
SELECT * FROM mensajes;
```

---

## Qué deberías ver

Deberías volver a ver la fila insertada antes.

Eso demuestra que el dato sobrevivió al contenedor porque estaba persistido en el volumen.

Ese es el resultado más importante del tema.

---

## Qué demuestra este ejercicio

Demuestra que:

- PostgreSQL puede correr en un contenedor efímero
- los datos no tienen por qué depender de la vida de ese contenedor
- un volumen permite recrear el contenedor sin perder la información
- persistir una base ya no es teoría: es una necesidad real y comprobable

---

## Por qué Docker recomienda localhost para desarrollo

La guía oficial de conectividad de PostgreSQL explica que publicar en:

```text
127.0.0.1:5432:5432
```

hace que la base sea accesible solo desde tu máquina local, no desde otros dispositivos de la red, y la presenta como la opción más segura para desarrollo. citeturn608116view2

Eso es una muy buena práctica para adoptar desde temprano.

---

## Qué no tenés que confundir

### Persistencia no es lo mismo que “el contenedor sigue vivo”
Acá el contenedor desapareció y aun así los datos sobrevivieron.

### El volumen no es la base de datos
El volumen es el almacenamiento persistente.
La base es el servicio que usa ese almacenamiento.

### Eliminar el contenedor no elimina automáticamente el volumen
Eso es justamente lo que permite que el dato siga existiendo.

### Cambiar de contenedor no significa empezar de cero
Si usás el mismo volumen, podés retomar la información previa.

---

## Error común 1: correr una base sin volumen

Eso puede parecer que funciona al principio, pero si eliminás el contenedor, podés perder la información.

---

## Error común 2: exponer PostgreSQL a toda la red sin necesidad

La documentación oficial advierte que `-p 5432:5432` expone el servicio en todas las interfaces del host y que eso debe usarse con cuidado. Para desarrollo local, recomienda `127.0.0.1:5432:5432`. citeturn608116view2

---

## Error común 3: confundir detener con eliminar

Detener no borra.
Eliminar sí.

Pero incluso si eliminás el contenedor, el volumen puede seguir ahí.

---

## Error común 4: borrar el volumen por accidente

Si después hacés algo como:

```bash
docker volume rm postgres_data
```

entonces sí estarías eliminando el almacenamiento persistente.

Por eso el volumen merece más cuidado que el contenedor cuando ya contiene datos reales.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá el volumen:

```bash
docker volume create postgres_data
```

### Ejercicio 2
Levantá PostgreSQL con persistencia:

```bash
docker run -d   --name postgres-dev   -e POSTGRES_PASSWORD=mysecretpassword   -p 127.0.0.1:5432:5432   -v postgres_data:/var/lib/postgresql   postgres:18
```

### Ejercicio 3
Entrá a la base:

```bash
docker exec -it postgres-dev psql -U postgres
```

### Ejercicio 4
Dentro de `psql`, ejecutá:

```sql
CREATE TABLE mensajes (
  id SERIAL PRIMARY KEY,
  texto TEXT NOT NULL
);

INSERT INTO mensajes (texto)
VALUES ('Hola, este dato debería sobrevivir al contenedor');

SELECT * FROM mensajes;
```

### Ejercicio 5
Salí con:

```sql
\q
```

### Ejercicio 6
Eliminá el contenedor:

```bash
docker stop postgres-dev
docker rm postgres-dev
```

### Ejercicio 7
Volvé a crear otro usando el mismo volumen:

```bash
docker run -d   --name postgres-dev-2   -e POSTGRES_PASSWORD=mysecretpassword   -p 127.0.0.1:5432:5432   -v postgres_data:/var/lib/postgresql   postgres:18
```

### Ejercicio 8
Entrá de nuevo y verificá el dato:

```bash
docker exec -it postgres-dev-2 psql -U postgres
```

Luego:

```sql
SELECT * FROM mensajes;
```

### Ejercicio 9
Respondé con tus palabras:

- ¿por qué el dato seguía existiendo?
- ¿qué papel cumplió el volumen?
- ¿qué habría pasado si no hubieras montado persistencia?

---

## Segundo ejercicio de análisis

Pensá en una app tuya real o posible y respondé:

- ¿qué datos guardarías en PostgreSQL?
- ¿qué impacto tendría perderlos al recrear el contenedor?
- ¿qué diferencia ves entre “recrear la app” y “recrear la base con el mismo volumen”?
- ¿por qué esto cambia completamente la forma de usar Docker con servicios de datos?

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿en qué momento se volvió evidente la utilidad del volumen?
- ¿qué te enseñó este ejemplo que no se veía tan claro con archivos sueltos?
- ¿por qué una base de datos obliga a pensar seriamente en persistencia?
- ¿qué valor práctico tiene poder recrear el contenedor sin perder los datos?
- ¿qué otras herramientas o servicios tuyos necesitarían este mismo enfoque?

Estas observaciones valen mucho más que copiar el comando y nada más.

---

## Mini desafío

Intentá explicar con tus palabras este flujo:

1. crear un volumen
2. correr PostgreSQL usando ese volumen
3. insertar datos
4. borrar el contenedor
5. volver a crear otro contenedor con el mismo volumen
6. reencontrar los datos

Y además respondé:

- ¿por qué esto demuestra persistencia real?
- ¿por qué una base de datos es uno de los mejores ejemplos para entender volúmenes?
- ¿qué ventaja tiene publicar solo en `127.0.0.1` durante desarrollo?
- ¿qué error grave evitarías a partir de ahora cuando uses Docker con bases?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- correr PostgreSQL en Docker con persistencia real
- montar un volumen nombrado para la base
- comprobar que los datos sobreviven a la eliminación del contenedor
- entender por qué Docker y las bases de datos necesitan estrategia de almacenamiento
- aplicar este patrón a otros servicios con datos duraderos

---

## Resumen del tema

- Una base de datos es uno de los casos más claros donde la persistencia es obligatoria.
- Docker recomienda tratar los contenedores como efímeros, pero no los datos.
- Un volumen nombrado permite que PostgreSQL conserve información aunque el contenedor se elimine. citeturn519407search0turn608116view1
- Publicar PostgreSQL en `127.0.0.1:5432:5432` es la opción recomendada por Docker para desarrollo local. citeturn608116view2
- Este tema convierte la idea de persistencia en una práctica concreta y muy cercana a proyectos reales.

---

## Próximo tema

En el próximo tema vas a ver otro uso muy común y valioso de este bloque:

- compartir código del host con el contenedor
- trabajar más cómodo durante desarrollo
- empezar a pensar entornos locales más ágiles con bind mounts
