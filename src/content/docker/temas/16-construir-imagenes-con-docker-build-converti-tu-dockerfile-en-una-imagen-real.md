---
title: "Construir imágenes con docker build: convertí tu Dockerfile en una imagen real"
description: "Tema 16 del curso práctico de Docker: cómo usar docker build para construir una imagen propia, qué papel cumple el contexto de build y cómo etiquetar la imagen resultante con -t."
order: 16
module: "Primeros pasos reales con imágenes"
level: "base"
draft: false
---

# Construir imágenes con docker build: convertí tu Dockerfile en una imagen real

## Objetivo del tema

En este tema vas a:

- usar `docker build` por primera vez con intención
- entender qué papel cumple el contexto de build
- etiquetar la imagen construida con `-t`
- transformar un Dockerfile simple en una imagen real
- verificar que la imagen resultante quedó disponible localmente

La idea es que hagas el paso que convierte una receta escrita en una imagen concreta que después sí vas a poder ejecutar.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. preparar una carpeta con un Dockerfile y un archivo simple
2. construir una imagen con `docker build`
3. usar `-t` para darle nombre y tag a la imagen
4. entender qué significa el `.` al final del comando
5. verificar la imagen creada con `docker image ls`
6. dejar todo listo para ejecutarla en el tema siguiente

---

## Idea central que tenés que llevarte

Hasta ahora venías trabajando con Dockerfiles como recetas.

Ahora vas a hacer el paso que faltaba:

> usar `docker build` para convertir un Dockerfile en una imagen real

Dicho simple:

- el Dockerfile describe cómo construir
- `docker build` ejecuta esa construcción
- la imagen resultante queda disponible localmente
- después vas a poder usarla para crear contenedores

---

## Qué dice la documentación oficial

La documentación oficial de Docker indica que `docker build` empaqueta tu aplicación dentro de una imagen usando las instrucciones del Dockerfile, y que el argumento posicional del comando define el **build context**, es decir, el conjunto de archivos a los que la construcción puede acceder. También documenta `-t` o `--tag` para asignar nombre y etiqueta a la imagen construida. citeturn437412search19turn437412search1turn437412search5turn437412search2turn437412search10

---

## Recordatorio rápido sobre el punto de partida

En el tema anterior preparaste o viste algo como esto:

```text
practica-from-workdir-copy-cmd/
├── Dockerfile
└── mensaje.txt
```

Con un Dockerfile de este estilo:

```Dockerfile
FROM alpine:3.20
WORKDIR /app
COPY mensaje.txt .
CMD ["cat", "mensaje.txt"]
```

Y con un archivo `mensaje.txt` así:

```text
Hola desde Dockerfile
```

Ahora sí vas a construir una imagen real a partir de eso.

---

## El comando base

La forma más común de empezar es esta:

```bash
docker build -t nombre:tag .
```

Por ejemplo:

```bash
docker build -t mi-mensaje:1.0 .
```

---

## Qué significa cada parte

### `docker build`
Le dice a Docker que querés construir una imagen.

### `-t mi-mensaje:1.0`
Le asigna un nombre y un tag a la imagen resultante.

### `.`
Define el contexto de build.

Y esto último es muy importante.

---

## Qué significa el punto final

Cuando escribís:

```bash
docker build -t mi-mensaje:1.0 .
```

ese punto `.` representa el directorio actual como contexto de build.

Eso significa:

- Docker puede acceder a los archivos de esa carpeta
- el Dockerfile suele estar ahí
- instrucciones como `COPY mensaje.txt .` toman archivos desde ese contexto

Esta idea del contexto te tiene que quedar clara desde ahora, porque después influye muchísimo en cómo funcionan `COPY`, `.dockerignore` y la organización del proyecto.

---

## Primer ejemplo práctico completo

Ubicate dentro de la carpeta de práctica y ejecutá:

```bash
docker build -t mi-mensaje:1.0 .
```

---

## Qué deberías ver

Docker va a leer el Dockerfile, procesar las instrucciones en orden y construir la imagen.

Vas a ver una salida de build que muestra pasos como:

- cargar el Dockerfile
- preparar el contexto
- resolver la imagen base
- copiar archivos
- exportar la imagen final

No hace falta entender cada línea en profundidad todavía.
Lo importante es que entiendas el proceso general.

---

## Qué está pasando realmente durante el build

La lectura conceptual de este build sería algo así:

1. Docker toma el contexto actual
2. encuentra el `Dockerfile`
3. lee las instrucciones en orden
4. parte desde `alpine:3.20`
5. define `/app` como directorio de trabajo
6. copia `mensaje.txt` dentro de la imagen
7. deja `cat mensaje.txt` como comando por defecto
8. construye la imagen final
9. la guarda localmente con el nombre `mi-mensaje:1.0`

Esa secuencia mental vale muchísimo.

---

## Cómo verificar que la imagen quedó creada

Después del build, ejecutá:

```bash
docker image ls
```

---

## Qué deberías buscar

Deberías ver algo parecido a esto:

```text
mi-mensaje   1.0   ...
```

Eso confirma que la imagen resultante quedó disponible localmente.

---

## Qué papel cumple -t

La opción `-t` sirve para etiquetar la imagen construida.

Por ejemplo:

```bash
docker build -t mi-mensaje:1.0 .
```

hace que la imagen quede identificada como:

- repositorio: `mi-mensaje`
- tag: `1.0`

Esto es muy útil porque después vas a poder:

- identificar mejor la imagen
- ejecutarla con claridad
- reconstruir nuevas versiones
- distinguir una variante de otra

---

## Qué pasa si no usás -t

Podés construir una imagen sin `-t`, pero al principio no conviene.

¿Por qué?

Porque la imagen puede quedar sin un nombre amigable y después se vuelve más incómodo trabajar con ella.

Al empezar, casi siempre conviene construir así:

```bash
docker build -t algo:alguna-version .
```

Eso te ordena muchísimo.

---

## Relación entre Dockerfile y contexto

Este tema importa mucho porque te obliga a unir dos ideas que ya venías viendo por separado:

### Dockerfile
Es la receta.

### Contexto de build
Es el conjunto de archivos a los que el build puede acceder.

Por ejemplo, si tu Dockerfile hace esto:

```Dockerfile
COPY mensaje.txt .
```

entonces `mensaje.txt` tiene que estar dentro del contexto de build.

Si no está, el build falla.

---

## Error clásico con el contexto

Este es uno de los errores más comunes al empezar.

Si ejecutás `docker build` desde una carpeta equivocada o con un contexto mal elegido, Docker no va a encontrar lo que querías copiar.

Por eso conviene muchísimo:

- ubicarte en la carpeta correcta
- entender qué representa el `.` final
- pensar bien qué archivos forman parte del contexto

---

## Qué dice Docker sobre el contexto

Docker define el build context como el conjunto de archivos al que el build puede acceder, y explica que el argumento posicional del comando puede ser una ruta local, una URL o incluso entrada estándar. Para el flujo básico del curso, lo habitual es usar `.` para indicar “la carpeta actual”. citeturn437412search1turn437412search5

---

## Qué diferencia hay entre construir y ejecutar

Esta comparación te tiene que quedar muy clara.

### Construir
```bash
docker build -t mi-mensaje:1.0 .
```

Esto crea una imagen.

### Ejecutar
Más adelante vas a hacer algo como esto:

```bash
docker run --rm mi-mensaje:1.0
```

Eso crea un contenedor a partir de la imagen y lo ejecuta.

O sea:

- `build` produce la imagen
- `run` produce y ejecuta el contenedor

---

## Qué no tenés que confundir

### `docker build` no ejecuta el contenedor final
Construye la imagen.

### El punto `.` no significa “cualquier lado”
Significa la carpeta actual usada como contexto.

### `-t` no cambia el contenido de la imagen
Solo le asigna una referencia útil.

### Que el build termine bien no significa que ya ejecutaste la app
Solo significa que la imagen quedó construida.

---

## Error común 1: correr build desde la carpeta equivocada

Si el contexto no contiene los archivos que tu Dockerfile espera, el build puede fallar o comportarse distinto de lo que querías.

---

## Error común 2: no usar -t y después no reconocer la imagen

Cuando recién empezás, poner un nombre claro a la imagen te ayuda muchísimo.

---

## Error común 3: no entender qué archivo se está copiando

Si tu Dockerfile dice:

```Dockerfile
COPY mensaje.txt .
```

pero el archivo no existe dentro del contexto, el build no puede completarse como esperás.

---

## Error común 4: creer que el Dockerfile alcanza por sí solo

No alcanza con tener un Dockerfile bien escrito.
También importa:

- desde dónde ejecutás el build
- qué archivos hay en el contexto
- cómo nombrás la imagen resultante

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá o reutilizá esta carpeta de práctica:

```text
practica-build/
├── Dockerfile
└── mensaje.txt
```

### Ejercicio 2
Asegurate de que el `Dockerfile` tenga esto:

```Dockerfile
FROM alpine:3.20
WORKDIR /app
COPY mensaje.txt .
CMD ["cat", "mensaje.txt"]
```

### Ejercicio 3
Asegurate de que `mensaje.txt` tenga, por ejemplo:

```text
Hola desde mi imagen construida
```

### Ejercicio 4
Ubicate en esa carpeta y ejecutá:

```bash
docker build -t mi-mensaje:1.0 .
```

### Ejercicio 5
Verificá la imagen resultante:

```bash
docker image ls
```

### Ejercicio 6
Respondé con tus palabras:

- ¿qué hizo `docker build`?
- ¿qué representa `-t mi-mensaje:1.0`?
- ¿qué representa el `.` final?
- ¿por qué `COPY mensaje.txt .` depende del contexto?

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué diferencia concreta notaste entre tener un Dockerfile y construir realmente una imagen?
- ¿qué te ayudó a entender mejor el punto `.`?
- ¿qué información te dio `docker image ls` después del build?
- ¿por qué conviene etiquetar la imagen desde el comienzo?
- ¿qué parte del proceso pertenece al build y qué parte todavía no ocurrió?

Estas observaciones valen mucho más que copiar el comando sin pensarlo.

---

## Mini desafío

Intentá explicar con tus palabras este comando:

```bash
docker build -t mi-mensaje:1.0 .
```

Respondé:

- qué acción principal realiza
- qué nombre y tag le da a la imagen
- qué carpeta está usando como contexto
- por qué Docker necesita ese contexto para resolver `COPY`

Y además respondé:

- ¿qué pasaría si ejecutaras el build desde otra carpeta?
- ¿qué ventaja tiene usar `mi-mensaje:1.0` en vez de dejar la imagen sin una referencia clara?
- ¿qué esperás poder hacer en el próximo tema con esta imagen ya construida?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- usar `docker build` con intención
- entender para qué sirve `-t`
- entender qué representa el contexto de build
- verificar que una imagen quedó construida localmente
- explicar mejor la relación entre Dockerfile, contexto e imagen resultante

---

## Resumen del tema

- `docker build` construye una imagen a partir de un Dockerfile.
- El argumento posicional, como `.`, define el contexto de build.
- `-t` permite asignar nombre y tag a la imagen construida.
- El build necesita acceder a los archivos que usa el Dockerfile, por eso el contexto importa tanto.
- Después del build, la imagen queda disponible localmente y puede verse con `docker image ls`.
- Construir una imagen no es lo mismo que ejecutar un contenedor.

---

## Próximo tema

En el próximo tema vas a usar esa imagen que acabás de construir:

- ejecutar una imagen propia
- comprobar que el contenedor hace lo esperado
- cerrar el ciclo completo Dockerfile → build → run
