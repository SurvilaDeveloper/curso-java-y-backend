---
title: "Publicación de puertos: conectá tu contenedor con el navegador y con tu máquina"
description: "Octavo tema práctico del curso de Docker: cómo publicar puertos con docker run, qué significa mapear un puerto del host a uno del contenedor y cómo acceder a servicios Docker desde tu navegador o desde tu máquina."
order: 8
module: "Fundamentos de Docker"
level: "intro"
draft: false
---

# Publicación de puertos: conectá tu contenedor con el navegador y con tu máquina

## Objetivo del tema

En este tema vas a:

- entender qué significa publicar un puerto
- mapear puertos del host hacia el contenedor con `-p`
- acceder a un servicio Docker desde el navegador o desde tu máquina
- distinguir entre puerto del host y puerto del contenedor
- empezar a leer con claridad una de las opciones más usadas de `docker run`

La idea es que dejes de ver los contenedores como “cajas cerradas” y entiendas cómo exponer un servicio para usarlo desde afuera.

---

## Qué vas a hacer hoy

En este tema vas a seguir este flujo:

1. entender qué significa publicar un puerto
2. levantar un servicio web dentro de un contenedor
3. mapear su puerto al host
4. abrir ese servicio desde el navegador
5. leer el mapeo de puertos con más claridad
6. practicar distintos escenarios básicos

---

## Idea central que tenés que llevarte

Un contenedor puede tener un servicio escuchando en un puerto interno.

Pero eso no significa automáticamente que vos puedas acceder a ese servicio desde tu navegador o desde tu sistema host.

Para hacerlo accesible desde afuera del contenedor, tenés que **publicar** el puerto.

Dicho simple:

> publicar un puerto es conectar un puerto de tu máquina con un puerto del contenedor.

---

## Qué significa puerto del host y puerto del contenedor

Esta diferencia es fundamental.

### Puerto del contenedor
Es el puerto donde la aplicación escucha **dentro** del contenedor.

### Puerto del host
Es el puerto de tu máquina desde el que vos te conectás.

Por ejemplo, si una aplicación dentro del contenedor escucha en el puerto `80`, vos podrías exponerla en tu máquina en el puerto `8080`.

Eso significa:

- adentro del contenedor: `80`
- afuera, en tu máquina: `8080`

---

## Cómo se publica un puerto

La forma más común es esta:

```bash
docker run -p puerto_host:puerto_contenedor imagen
```

Por ejemplo:

```bash
docker run -d --name mi-nginx -p 8080:80 nginx
```

---

## Qué significa este comando

### `docker run`
Crea e inicia un contenedor nuevo.

### `-d`
Lo deja corriendo en segundo plano.

### `--name mi-nginx`
Le asigna un nombre fácil de recordar.

### `-p 8080:80`
Mapea el puerto `8080` de tu máquina hacia el puerto `80` del contenedor.

### `nginx`
Es la imagen que se va a usar.

---

## Qué deberías entender al ver 8080:80

Leelo así:

- **izquierda**: puerto del host
- **derecha**: puerto del contenedor

O sea:

> entro por `localhost:8080` en mi máquina  
> y Docker redirige eso al puerto `80` dentro del contenedor

Esta lectura te tiene que quedar fija desde ahora.

---

## Primer ejemplo práctico real

Ejecutá:

```bash
docker run -d --name mi-nginx -p 8080:80 nginx
```

---

## Qué hace

- descarga `nginx` si hace falta
- crea un contenedor
- levanta Nginx dentro del contenedor
- publica el puerto `80` interno del contenedor en el puerto `8080` de tu máquina

---

## Cómo probarlo

Ahora abrí tu navegador y entrá a:

```text
http://localhost:8080
```

Si todo salió bien, deberías ver la página de bienvenida de Nginx.

También podrías probarlo desde terminal con algo como:

```bash
curl http://localhost:8080
```

---

## Qué está pasando realmente

Aunque desde afuera parezca simple, en realidad están pasando dos cosas:

1. Nginx escucha en el puerto `80` dentro del contenedor
2. Docker publica ese puerto hacia el `8080` del host

Eso permite que tu máquina pueda hablar con el servicio que vive adentro del contenedor.

---

## Cómo ver el mapeo de puertos

Ejecutá:

```bash
docker ps
```

---

## Qué deberías observar

En la columna de puertos, deberías ver algo parecido a esto:

```text
0.0.0.0:8080->80/tcp
```

La idea general es:

- tu host expone el `8080`
- Docker lo redirige al `80/tcp` del contenedor

---

## Leer correctamente 0.0.0.0:8080->80/tcp

No hace falta obsesionarte con cada detalle todavía.

Por ahora, quedate con esto:

- `8080` es el puerto publicado en el host
- `80` es el puerto interno del contenedor
- `tcp` es el protocolo

Más adelante vas a ver más sobre redes, interfaces y seguridad.

---

## Segundo ejemplo: usar otro puerto del host

Podrías hacer esto también:

```bash
docker run -d --name mi-nginx-2 -p 9090:80 nginx
```

---

## Qué cambia

Adentro del contenedor sigue siendo `80`.

Pero ahora desde tu máquina accedés por:

```text
http://localhost:9090
```

Esto demuestra algo muy importante:

> el puerto del host no tiene por qué coincidir con el del contenedor

---

## Por qué esto es útil

Esto sirve mucho cuando:

- querés correr varios servicios similares
- el puerto habitual del host ya está ocupado
- querés organizar mejor tu entorno local
- necesitás evitar conflictos entre proyectos

---

## Tercer ejemplo: qué pasa si no publicás el puerto

Probá levantar un contenedor así:

```bash
docker run -d --name nginx-sin-publicar nginx
```

---

## Qué pasa en este caso

Nginx sigue escuchando dentro del contenedor.

Pero como no publicaste ningún puerto, no vas a poder entrar desde tu navegador a través de `localhost`.

O sea:

- el servicio existe
- el contenedor corre
- pero no está accesible desde tu host por un puerto publicado

---

## Qué no tenés que confundir

### Que una aplicación escuche en un puerto no significa que ya esté publicada
Una cosa es escuchar dentro del contenedor.
Otra cosa es exponer el acceso hacia el host.

### EXPOSE no publica automáticamente
Más adelante vas a ver Dockerfile y `EXPOSE`, pero conviene adelantarte esto:
`EXPOSE` documenta puertos del contenedor, pero no reemplaza el uso de `-p` cuando querés acceder desde afuera.

### Contenedor activo no significa servicio accesible
Puede estar corriendo perfecto, pero sin un puerto publicado vos no necesariamente podés llegar desde el host.

---

## Error común 1: invertir el orden de los puertos

Esto es muy común al principio.

La forma correcta es:

```bash
-p host:contenedor
```

No al revés.

Por ejemplo:

```bash
-p 8080:80
```

significa:

- host `8080`
- contenedor `80`

---

## Error común 2: querer entrar por el puerto interno desde el host

Si corriste:

```bash
docker run -d --name mi-nginx -p 8080:80 nginx
```

desde tu máquina no vas a entrar por `localhost:80`, sino por:

```text
localhost:8080
```

Porque ese es el puerto publicado en el host.

---

## Error común 3: que el puerto del host ya esté ocupado

Si en tu máquina el puerto `8080` ya lo está usando otra aplicación, Docker no va a poder publicar correctamente ese puerto para el nuevo contenedor.

En ese caso, probá otro puerto del host, por ejemplo:

```bash
-p 9090:80
```

---

## Error común 4: creer que publicar puertos siempre hace falta

No siempre.

Si solo querés que un contenedor se comunique con otro dentro de una red Docker, muchas veces no hace falta publicar el puerto al host.

Más adelante vas a ver eso mejor cuando lleguemos a redes.

---

## Publicar todos los puertos expuestos

Docker también permite publicar automáticamente todos los puertos expuestos de una imagen usando `-P`.

Probá esto:

```bash
docker run -d --name nginx-random -P nginx
```

---

## Qué hace

En vez de decirle exactamente qué puerto del host usar, Docker publica los puertos expuestos del contenedor en puertos aleatorios del host.

Después podés ver qué asignó con:

```bash
docker ps
```

o con:

```bash
docker port nginx-random
```

---

## Cuándo conviene y cuándo no

`-P` puede servir para pruebas rápidas.

Pero en desarrollo y en documentación clara suele ser mejor usar `-p` con puertos explícitos, porque así sabés exactamente por dónde entrar.

---

## Ver un mapeo de puertos con docker port

Ejecutá:

```bash
docker port mi-nginx
```

---

## Qué hace

Te muestra cómo quedaron mapeados los puertos publicados para ese contenedor.

Es útil cuando:

- querés confirmar el mapeo
- usaste `-P`
- no recordás qué puerto del host quedó asociado

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Levantá Nginx publicando `8080` hacia `80`:

```bash
docker run -d --name mi-nginx -p 8080:80 nginx
```

### Ejercicio 2
Verificá que esté corriendo:

```bash
docker ps
```

### Ejercicio 3
Abrí el navegador en:

```text
http://localhost:8080
```

### Ejercicio 4
Consultá el mapeo con:

```bash
docker port mi-nginx
```

### Ejercicio 5
Levantá otro contenedor usando otro puerto del host:

```bash
docker run -d --name mi-nginx-2 -p 9090:80 nginx
```

### Ejercicio 6
Entrá a:

```text
http://localhost:9090
```

### Ejercicio 7
Probá publicar puertos automáticamente:

```bash
docker run -d --name nginx-random -P nginx
```

### Ejercicio 8
Mirá qué puerto quedó asignado:

```bash
docker ps
docker port nginx-random
```

### Ejercicio 9
Detené y eliminá los contenedores:

```bash
docker stop mi-nginx mi-nginx-2 nginx-random
docker rm mi-nginx mi-nginx-2 nginx-random
```

---

## Qué tenés que observar mientras practicás

Mientras hacés los ejercicios, fijate especialmente en estas preguntas:

- ¿qué diferencia viste entre puerto del host y puerto del contenedor?
- ¿qué te resultó más claro al leer `8080:80`?
- ¿qué pasó cuando usaste `-P`?
- ¿qué valor te dio `docker port`?
- ¿por qué a veces conviene más `-p` que `-P`?
- ¿qué cambia cuando el servicio está corriendo pero no publicaste ningún puerto?

Estas observaciones son mucho más importantes que aprenderte una sintaxis sin entenderla.

---

## Mini desafío

Intentá explicar con tus palabras este comando:

```bash
docker run -d --name web-demo -p 3000:80 nginx
```

Respondé:

- qué imagen usa
- qué contenedor crea
- qué puerto usa el host
- qué puerto usa el contenedor
- por qué la URL correcta sería `http://localhost:3000`

Y además respondé:

- ¿en qué caso te convendría usar otro puerto del host?
- ¿cuándo tendría sentido usar `-P`?
- ¿por qué no todo contenedor necesita publicar puertos?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- publicar puertos con `-p`
- leer correctamente un mapeo `host:contenedor`
- acceder a un servicio Docker desde tu navegador o desde tu máquina
- usar `docker ps` y `docker port` para verificar el mapeo
- distinguir cuándo hace falta publicar un puerto y cuándo no

---

## Resumen del tema

- Publicar un puerto conecta un puerto del host con uno del contenedor.
- La forma base es `-p host:contenedor`.
- El puerto del host no tiene que coincidir con el del contenedor.
- `-P` publica puertos expuestos en puertos aleatorios del host.
- `docker port` ayuda a ver el mapeo real.
- Un servicio puede correr dentro del contenedor sin estar accesible desde el host si no publicaste un puerto.

---

## Próximo tema

En el próximo tema vas a trabajar con otra pieza muy usada en contenedores reales:

- variables de entorno
- pasar configuración al arrancar un contenedor
- cambiar comportamiento sin modificar la imagen
