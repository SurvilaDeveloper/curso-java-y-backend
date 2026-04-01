---
title: "Red bridge por defecto vs red definida por el usuario: comprobá la diferencia en la práctica"
description: "Tema 29 del curso práctico de Docker: comparación práctica entre la red bridge por defecto y una red bridge definida por el usuario, para ver por qué la segunda suele ser la opción más clara y cómoda cuando necesitás que los contenedores se comuniquen."
order: 29
module: "Redes y comunicación entre contenedores"
level: "base"
draft: false
---

# Red bridge por defecto vs red definida por el usuario: comprobá la diferencia en la práctica

## Objetivo del tema

En este tema vas a:

- comparar la red `bridge` por defecto con una red bridge definida por el usuario
- ver por qué la comunicación por nombre cambia tanto la experiencia
- comprobar con una práctica real cómo se comportan ambas opciones
- entender mejor por qué una red propia suele ser más cómoda para apps con varios servicios
- prepararte para conectar backend y base de datos en los próximos temas

La idea es que no te quedes solo con la teoría de redes, sino que veas la diferencia en una práctica concreta.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. ejecutar contenedores en una red bridge definida por el usuario
2. comprobar la resolución por nombre entre ellos
3. comparar esa experiencia con lo que pasa en la red `bridge` por defecto
4. ver por qué la red definida por el usuario suele ser más ordenada
5. cerrar una regla práctica que te sirva para casi todos los proyectos simples

---

## Idea central que tenés que llevarte

Docker crea automáticamente una red `bridge` por defecto.

Eso permite que los contenedores tengan conectividad básica, pero no es la opción más cómoda para una app con varios servicios.

En cambio, una red bridge definida por el usuario te da algo muy valioso:

- mejor aislamiento
- resolución automática por nombre
- una organización más clara por proyecto o grupo de servicios

Dicho simple:

> si querés que tus contenedores se hablen de forma cómoda y previsible, una red definida por el usuario suele ser mucho mejor que depender de la red `bridge` por defecto.

---

## Recordatorio del tema anterior

Ya viste estas ideas:

- la red `bridge` por defecto existe automáticamente
- una red bridge definida por el usuario se crea explícitamente
- los nombres de contenedor son muy útiles cuando Docker puede resolverlos por DNS
- no conviene diseñar pensando en IPs cambiantes

Ahora vas a comprobar esa diferencia con una práctica concreta.

---

## Qué dice la documentación oficial

Docker explica que los contenedores conectados a una red bridge definida por el usuario pueden resolverse entre sí por nombre o alias. También indica que los contenedores en la red `bridge` por defecto solo pueden accederse por IP, salvo que uses `--link`, que se considera legado. Además, Docker destaca que las redes bridge definidas por el usuario ofrecen mejor aislamiento que la red por defecto. citeturn304453search0turn304453search1turn304453search7turn304453search12

---

## Preparar la práctica

Primero vas a crear una red definida por el usuario.

Ejecutá:

```bash
docker network create demo-net
```

Podés verificarla con:

```bash
docker network ls
```

Deberías ver algo como:

```text
demo-net
```

---

## Paso 1: levantar un contenedor “servidor” en la red propia

Ejecutá:

```bash
docker run -d --name servidor-demo --network demo-net nginx
```

---

## Qué hace

- crea un contenedor llamado `servidor-demo`
- lo conecta a la red `demo-net`
- arranca Nginx dentro de ese contenedor

Todavía no estás publicando puertos al host porque no hace falta para esta prueba.
Lo que querés probar es la comunicación interna entre contenedores.

---

## Paso 2: levantar un contenedor “cliente” en la misma red

Ahora ejecutá:

```bash
docker run -it --rm --name cliente-demo --network demo-net alpine sh
```

Esto te deja dentro de un contenedor Alpine conectado a la misma red `demo-net`.

---

## Paso 3: instalar una herramienta simple de prueba

Una vez dentro del contenedor Alpine, ejecutá:

```sh
apk add --no-cache curl
```

---

## Qué hace

Instala `curl` dentro del contenedor para que puedas hacer una petición HTTP al contenedor `servidor-demo`.

---

## Paso 4: probar la resolución por nombre

Ahora ejecutá esto dentro del contenedor cliente:

```sh
curl http://servidor-demo
```

---

## Qué deberías ver

Deberías recibir la página HTML de bienvenida de Nginx.

Y ese es el resultado más importante del tema.

Porque significa que:

- `cliente-demo` pudo resolver el nombre `servidor-demo`
- ambos contenedores estaban en la misma red definida por el usuario
- no tuviste que buscar ninguna IP manualmente
- Docker resolvió el nombre automáticamente dentro de esa red

---

## Qué demuestra esta parte de la práctica

Demuestra exactamente por qué una red bridge definida por el usuario es tan valiosa.

Te permite pensar los servicios así:

- `db`
- `backend`
- `redis`
- `api`
- `nginx`

y usarlos como nombres reales dentro de la red.

Eso simplifica muchísimo el diseño y la configuración.

---

## Comparación con la red bridge por defecto

Ahora no hace falta que repitas una demo enredada con IPs.

La documentación oficial de Docker ya deja claro el contraste:

### En la red bridge por defecto
Los contenedores pueden comunicarse usando IPs, pero no se resuelven automáticamente por nombre de la misma manera. Docker incluso menciona que necesitarías el mecanismo legado `--link` o arreglos manuales poco cómodos. citeturn304453search0turn304453search7

### En una red bridge definida por el usuario
Los contenedores pueden resolverse por nombre o alias automáticamente. citeturn304453search0turn304453search1turn304453search12

Esa diferencia es enorme.

---

## Por qué la red definida por el usuario es más cómoda

Porque te deja pensar la app con nombres estables.

Por ejemplo:

- un backend puede conectarse a `db`
- una app puede hablar con `redis`
- una API puede llamar a `auth-service`

y no hace falta perseguir direcciones IP que pueden cambiar si recreás los contenedores.

Docker incluso usa este tipo de ejemplo para PostgreSQL y explica que una red definida por el usuario hace que los connection strings sean más estables justamente porque evitás depender de IPs variables. citeturn304453search2

---

## Qué papel juega el aislamiento

Docker también resalta que las redes definidas por el usuario ofrecen mejor aislamiento.

Eso significa que no mezclás todos tus contenedores “porque sí” en la red por defecto.

Podés armar redes por proyecto o por grupo de servicios.

Por ejemplo:

- `ecommerce-net`
- `dev-net`
- `blog-net`

Eso hace que la comunicación quede más acotada y más clara.

---

## Qué pasa con publicar puertos

Recordá algo importante:

- la comunicación interna entre contenedores no necesita necesariamente `-p`
- la publicación de puertos sirve para acceder desde el host

En esta práctica no publicaste Nginx al host y aun así otro contenedor pudo acceder a él.

Eso demuestra una vez más que:

- red interna
- y acceso desde tu máquina

son dos cosas distintas.

---

## Qué pasaría en una app real

Imaginá esta situación:

- `backend`
- `db`
- `redis`

Todos podrían estar en una red llamada `app-net`.

Y el backend podría configurar:

- host de base: `db`
- host de cache: `redis`

Mientras tanto, quizá solo el backend o el frontend tendrían puertos publicados hacia el host.

Esa separación es muy útil.

---

## Qué no tenés que confundir

### Que un contenedor tenga nombre no significa que siempre se resuelva en cualquier red
La ventaja fuerte aparece cuando está en una red bridge definida por el usuario.

### Poder entrar desde el navegador no es lo mismo que poder comunicar contenedores entre sí
Son dos mecanismos diferentes.

### Red por defecto no significa “mejor porque ya viene lista”
Suele ser más limitada para apps con varios servicios.

### Comunicación por IP no es lo mismo que comunicación por nombre
La segunda es mucho más cómoda y estable para diseño de servicios.

---

## Error común 1: no crear una red propia cuando ya tenés varios servicios

Eso te empuja a usar configuraciones más frágiles o menos claras de lo necesario.

---

## Error común 2: creer que `-p` hace que dos contenedores se hablen mejor

No.
`-p` sirve para exponer un servicio al host.

La comunicación entre contenedores depende mucho más de cómo están conectados a las redes Docker.

---

## Error común 3: pensar que las IPs son una solución aceptable a largo plazo

Docker deja claro que esas IPs pueden cambiar, y por eso no conviene diseñar pensando en ellas. citeturn304453search2turn304453search13

---

## Error común 4: usar la red `bridge` por defecto por costumbre

Puede servir para algo muy básico, sí.
Pero cuando ya te importa claridad, aislamiento y resolución por nombre, una red definida por el usuario suele ser mejor opción.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá una red propia:

```bash
docker network create demo-net
```

### Ejercicio 2
Levantá un contenedor Nginx dentro de esa red:

```bash
docker run -d --name servidor-demo --network demo-net nginx
```

### Ejercicio 3
Levantá un contenedor Alpine dentro de la misma red:

```bash
docker run -it --rm --name cliente-demo --network demo-net alpine sh
```

### Ejercicio 4
Dentro del contenedor Alpine, instalá `curl`:

```sh
apk add --no-cache curl
```

### Ejercicio 5
Probá la comunicación por nombre:

```sh
curl http://servidor-demo
```

### Ejercicio 6
Respondé con tus palabras:

- ¿por qué funcionó `curl http://servidor-demo`?
- ¿qué ventaja te dio usar una red definida por el usuario?
- ¿por qué esto sería más cómodo que depender de una IP?

### Ejercicio 7
Salí del contenedor y limpiá:

```bash
docker stop servidor-demo
docker rm servidor-demo
docker network rm demo-net
```

---

## Segundo ejercicio de análisis

Pensá en una app con:

- backend
- base de datos
- cache

Y respondé:

- qué nombre usarías para cada servicio
- por qué te convendría que el backend apunte a `db` y `redis` en vez de IPs
- qué servicios necesitarían además publicar puertos hacia el host
- cuáles podrían vivir solo en red interna

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué parte de la red definida por el usuario te resultó más valiosa?
- ¿por qué usar nombres cambia tanto la comodidad?
- ¿qué diferencia concreta ves entre esta práctica y depender de la red por defecto?
- ¿qué papel juega el aislamiento?
- ¿cómo te imaginás usando esto en una app real con varios servicios?

Estas observaciones valen mucho más que recordar un solo comando de memoria.

---

## Mini desafío

Intentá explicar con tus palabras esta idea:

> la red `bridge` por defecto te da conectividad básica, pero una red bridge definida por el usuario te da una forma mucho más cómoda y clara de diseñar la comunicación entre servicios.

Y además respondé:

- ¿por qué Docker considera superiores a las redes bridge definidas por el usuario?
- ¿qué ventaja te da la resolución por nombre?
- ¿qué diferencia concreta ves entre “entrar desde el navegador” y “hablarse entre contenedores”?
- ¿qué tipo de proyecto tuyo se beneficiaría mucho de esta práctica?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar la diferencia práctica entre la red `bridge` por defecto y una red definida por el usuario
- comprobar la resolución por nombre entre contenedores
- entender mejor por qué una red propia suele ser la mejor opción para varios servicios
- distinguir comunicación interna y publicación de puertos
- prepararte mucho mejor para el tema de app + base de datos

---

## Resumen del tema

- La red `bridge` por defecto existe automáticamente, pero es menos cómoda para apps con varios servicios. citeturn304453search0turn304453search7
- Las redes bridge definidas por el usuario permiten resolución automática por nombre o alias. citeturn304453search0turn304453search1turn304453search12
- También ofrecen mejor aislamiento entre grupos de contenedores. citeturn304453search0turn304453search7
- Publicar puertos al host y permitir comunicación interna entre contenedores son cosas distintas.
- Este tema te muestra con una práctica real por qué la red definida por el usuario suele ser la mejor base para conectar servicios.

---

## Próximo tema

En el próximo tema vas a usar esta base en un escenario muy típico y muy importante:

- app + base de datos
- conexión entre servicios por nombre
- primer ejemplo real de backend hablando con una base dentro de Docker
