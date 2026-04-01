---
title: "Eliminar contenedores e imágenes sin miedo: limpieza básica y segura en Docker"
description: "Décimo tema práctico del curso de Docker: cómo eliminar contenedores, imágenes y recursos no usados sin miedo, entendiendo qué se borra, qué no y qué conviene revisar antes de limpiar."
order: 10
module: "Fundamentos de Docker"
level: "intro"
draft: false
---

# Eliminar contenedores e imágenes sin miedo: limpieza básica y segura en Docker

## Objetivo del tema

En este tema vas a:

- eliminar contenedores detenidos con seguridad
- eliminar imágenes que ya no necesitás
- entender la diferencia entre borrar contenedores, imágenes y otros recursos
- usar comandos de limpieza automática con más criterio
- empezar a mantener tu entorno Docker más prolijo

La idea es que pierdas el miedo a limpiar, pero sin caer en borrar cosas a ciegas.

---

## Qué vas a hacer hoy

En este tema vas a seguir este flujo:

1. revisar qué contenedores e imágenes tenés
2. eliminar contenedores detenidos
3. eliminar imágenes que ya no necesitás
4. usar comandos de prune con criterio
5. entender qué pasa con redes, caché y volúmenes
6. cerrar el bloque inicial del curso con una limpieza consciente

---

## Idea central que tenés que llevarte

En Docker, no todo lo que creás desaparece solo.

Es común que te queden:

- contenedores detenidos
- imágenes que ya no usás
- redes sin uso
- caché de build
- volúmenes sin referencia

Eso no es un problema grave, pero si no limpiás nunca, tu entorno se va llenando y después cuesta entender qué está activo, qué está viejo y qué ocupa espacio.

Dicho simple:

> limpiar Docker no es “borrar por borrar”, sino entender qué recurso querés quitar y por qué.

---

## Primer paso: mirar antes de borrar

Antes de eliminar nada, conviene revisar qué existe.

### Ver contenedores

```bash
docker ps -a
```

### Ver imágenes

```bash
docker images
```

o:

```bash
docker image ls
```

---

## Por qué esto es importante

Muchos errores al principio no vienen por usar mal `rm` o `rmi`, sino por borrar sin mirar.

Primero conviene identificar:

- qué contenedor ya terminó y no lo necesitás
- qué imagen era solo de prueba
- qué recursos siguen siendo útiles para tu práctica

---

## Qué dice la documentación oficial sobre borrar contenedores

La referencia oficial de `docker container rm` indica que sirve para eliminar uno o más contenedores y remarca que, si querés borrar todos los detenidos de una sola vez, también existe `docker container prune`. citeturn541397search1turn541397search22

---

## Eliminar un contenedor detenido

Si tenés un contenedor ya parado, podés borrarlo con:

```bash
docker rm nombre_o_id
```

Por ejemplo:

```bash
docker rm mi-nginx
```

---

## Qué hace

- elimina el contenedor
- borra ese objeto de tu entorno local
- no elimina automáticamente la imagen sobre la que estaba basado

Esto es importante:

borrar el contenedor **no** significa borrar la imagen.

---

## Si el contenedor sigue corriendo

En general, para borrar un contenedor con `docker rm`, primero conviene detenerlo.

Por ejemplo:

```bash
docker stop mi-nginx
docker rm mi-nginx
```

También existe `docker rm -f`, pero al comienzo es mejor acostumbrarte a distinguir entre:

- detener
- eliminar

---

## Limpiar todos los contenedores detenidos

Si querés borrar de una sola vez todos los contenedores detenidos, podés usar:

```bash
docker container prune
```

---

## Qué hace

Elimina todos los contenedores que ya no están corriendo.

Esto puede ser muy útil después de muchos ejercicios de práctica.

Pero usalo con criterio:

si tenías un contenedor detenido que querías conservar para volver a arrancarlo, también se va a borrar.

---

## Qué dice la documentación oficial sobre borrar imágenes

La referencia oficial de `docker image rm` explica que elimina una o más imágenes del host y aclara varias cosas importantes:

- si una imagen tiene varias etiquetas, borrar una etiqueta no siempre borra toda la imagen
- si esa es la única etiqueta, se elimina la imagen y la etiqueta
- no elimina imágenes de un registro remoto
- no podés eliminar la imagen de un contenedor en ejecución salvo que fuerces la operación con `-f` citeturn541397search2

---

## Eliminar una imagen

La forma típica es esta:

```bash
docker rmi nombre_o_id
```

o equivalente:

```bash
docker image rm nombre_o_id
```

Por ejemplo:

```bash
docker rmi nginx
```

---

## Qué tenés que entender sobre esto

Esto elimina la imagen de tu máquina local.

No está borrando nada de Docker Hub ni de otro registry remoto.

Solo limpia tu entorno local.

---

## Diferencia entre borrar contenedor e imagen

Esta diferencia es clave.

### Borrar contenedor
Quitás una instancia creada a partir de una imagen.

### Borrar imagen
Quitás la plantilla local usada para crear contenedores.

Podrías tener esta situación:

- borraste todos los contenedores de `nginx`
- pero la imagen `nginx` sigue descargada

O al revés:

- tenés un contenedor existente
- pero no podés borrar la imagen mientras ese contenedor siga dependiendo de ella

---

## Error típico con imágenes

Si intentás borrar una imagen y Docker te dice que está siendo usada, normalmente significa que todavía hay un contenedor asociado.

En ese caso, conviene revisar:

```bash
docker ps -a
```

Y después decidir:

- detener el contenedor si está activo
- eliminar el contenedor si ya no lo necesitás
- recién después borrar la imagen

---

## Ver el espacio usado por Docker

Antes de hacer limpiezas más amplias, también puede ayudarte esto:

```bash
docker system df
```

---

## Qué hace

Muestra el uso de disco de Docker, incluyendo imágenes, contenedores, volúmenes y caché.

No borra nada.

Solo te ayuda a entender mejor qué está ocupando espacio.

---

## Limpiar imágenes sin uso con image prune

La referencia oficial de `docker image prune` indica que elimina imágenes sin uso y advierte que con `-a` elimina todas las imágenes que no estén asociadas al menos a un contenedor. citeturn541397search0

---

## Uso básico

```bash
docker image prune
```

### Qué hace
Elimina imágenes colgantes o sin referencia útil inmediata.

---

## Uso más agresivo

```bash
docker image prune -a
```

### Qué hace
Elimina todas las imágenes que no estén asociadas al menos a un contenedor.

Esto ya es una limpieza más fuerte.

Usala con más cuidado, porque puede borrar imágenes que no estabas usando en ese momento pero que pensabas reutilizar.

---

## Limpiar recursos no usados con system prune

La documentación oficial de `docker system prune` indica que elimina datos no usados y que, por defecto, puede limpiar:

- contenedores detenidos
- redes sin uso
- imágenes colgantes
- caché de build

También aclara que `-a` amplía la limpieza a imágenes no usadas, y que los volúmenes no se eliminan por defecto salvo que agregues `--volumes`. citeturn541397search3turn541397search6

---

## Uso básico

```bash
docker system prune
```

---

## Qué hace

Hace una limpieza general de recursos no usados.

Es práctico, pero ya no es una limpieza “quirúrgica”.
Es una limpieza más amplia.

---

## Uso más fuerte

```bash
docker system prune -a
```

---

## Qué cambia

Además de la limpieza básica, también remueve imágenes no usadas, no solo las colgantes.

Esto libera más espacio, pero también es más fácil que elimines cosas que luego tengas que volver a descargar.

---

## Qué pasa con los volúmenes

Acá tenés que ir con mucho cuidado.

La documentación oficial aclara dos cosas importantes:

- `docker system prune` **no** elimina volúmenes por defecto
- para incluirlos, hay que usar `--volumes` citeturn541397search3turn541397search6turn541397search10turn541397search13

---

## Por qué esto importa tanto

Los volúmenes suelen contener datos persistentes.

Por ejemplo:

- datos de una base
- archivos generados
- información que no querés perder por accidente

Por eso Docker no los elimina por defecto en una limpieza general.

Eso es una protección útil.

---

## Limpiar volúmenes sin uso

Si más adelante necesitás hacerlo, existe:

```bash
docker volume prune
```

La referencia oficial indica que elimina volúmenes locales no usados, y que por defecto apunta a volúmenes anónimos que no están referenciados por contenedores. citeturn541397search10

Y si querés eliminar un volumen puntual:

```bash
docker volume rm nombre_del_volumen
```

pero no vas a poder borrarlo si sigue en uso por un contenedor. citeturn541397search13

---

## Qué no tenés que confundir

### `docker rm` no borra imágenes
Solo elimina contenedores.

### `docker rmi` no borra contenedores
Solo elimina imágenes.

### `prune` limpia en lote
No apunta necesariamente a un recurso puntual.

### `system prune` no borra volúmenes por defecto
Eso requiere `--volumes`.

---

## Flujo seguro recomendado al principio

Cuando estés aprendiendo, este orden suele ser bastante sano:

### Paso 1
Mirar qué existe:

```bash
docker ps -a
docker image ls
docker system df
```

### Paso 2
Eliminar contenedores de prueba que ya no necesitás:

```bash
docker rm nombre_o_id
```

### Paso 3
Eliminar imágenes que realmente no querés conservar:

```bash
docker rmi nombre_o_id
```

### Paso 4
Si querés una limpieza más amplia, usar con criterio:

```bash
docker container prune
docker image prune
docker system prune
```

Así evitás borrar de más.

---

## Error común 1: usar prune demasiado pronto

Cuando recién empezás, a veces conviene borrar recursos puntuales antes de usar una limpieza masiva.

Eso te ayuda a entender mejor qué estás haciendo.

---

## Error común 2: creer que borrar una imagen elimina también datos persistentes

No necesariamente.

Los datos persistentes suelen estar en volúmenes, que tienen su propia lógica.

Más adelante, cuando llegues a persistencia, esto te va a quedar todavía más claro.

---

## Error común 3: pensar que borrar una imagen remota

`docker rmi nginx` no borra la imagen oficial del mundo.

Solo la elimina de tu máquina local. citeturn541397search2

---

## Error común 4: usar --volumes sin mirar

Agregar `--volumes` a una limpieza global puede hacerte perder datos que querías conservar.

No es algo para correr por costumbre sin revisar.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Listá contenedores e imágenes:

```bash
docker ps -a
docker image ls
```

### Ejercicio 2
Si tenés un contenedor detenido de pruebas, eliminá uno puntual:

```bash
docker rm nombre_del_contenedor
```

### Ejercicio 3
Si tenés una imagen de pruebas que ya no necesitás, eliminála:

```bash
docker rmi nombre_de_la_imagen
```

### Ejercicio 4
Mirá el uso de disco de Docker:

```bash
docker system df
```

### Ejercicio 5
Probá limpiar todos los contenedores detenidos:

```bash
docker container prune
```

### Ejercicio 6
Probá limpiar imágenes sin uso inmediato:

```bash
docker image prune
```

### Ejercicio 7
Leé la advertencia antes de confirmar cada limpieza y prestá atención a qué te informa Docker.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué diferencia concreta viste entre borrar contenedores e imágenes?
- ¿qué te mostró `docker system df` que no estabas viendo antes?
- ¿qué te generó más confianza: borrar puntual o usar `prune`?
- ¿por qué Docker protege más a los volúmenes en limpiezas globales?
- ¿en qué casos te convendría evitar `system prune -a`?

Estas observaciones valen mucho más que aprenderte comandos de memoria.

---

## Mini desafío

Intentá explicar con tus palabras este flujo de limpieza:

1. revisar recursos
2. borrar contenedores detenidos
3. borrar imágenes puntuales
4. limpiar en lote con prune
5. evitar tocar volúmenes sin pensar

Y además respondé:

- ¿por qué `docker rm` y `docker rmi` no hacen lo mismo?
- ¿qué ventaja tiene `docker system df` antes de limpiar?
- ¿por qué `docker system prune` no borra volúmenes por defecto?
- ¿cuándo conviene una limpieza puntual y cuándo una limpieza general?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- eliminar contenedores detenidos con `docker rm`
- eliminar imágenes con `docker rmi` o `docker image rm`
- usar `docker container prune` y `docker image prune` con criterio
- entender qué hace `docker system prune`
- distinguir mejor entre limpieza segura, limpieza agresiva y recursos persistentes

---

## Resumen del tema

- `docker rm` elimina contenedores.
- `docker rmi` o `docker image rm` elimina imágenes locales.
- `docker container prune` elimina contenedores detenidos.
- `docker image prune` limpia imágenes sin uso inmediato.
- `docker system prune` hace una limpieza más amplia.
- Los volúmenes no se eliminan por defecto en `system prune`.
- Limpiar bien Docker es entender qué recurso querés borrar antes de ejecutar el comando.

---

## Próximo tema

En el próximo bloque vas a pasar de consumir imágenes ya hechas a empezar a crear las tuyas:

- qué es una imagen Docker
- cómo se construye
- por qué el Dockerfile pasa a ser protagonista
