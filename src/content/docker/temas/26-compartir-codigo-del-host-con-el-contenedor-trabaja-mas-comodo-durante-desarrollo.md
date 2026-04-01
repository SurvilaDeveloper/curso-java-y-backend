---
title: "Compartir código del host con el contenedor: trabajá más cómodo durante desarrollo"
description: "Tema 26 del curso práctico de Docker: cómo compartir código fuente entre tu máquina y un contenedor usando bind mounts, por qué esto agiliza el desarrollo y qué cuidados conviene tener para evitar confusiones."
order: 26
module: "Datos y archivos"
level: "base"
draft: false
---

# Compartir código del host con el contenedor: trabajá más cómodo durante desarrollo

## Objetivo del tema

En este tema vas a:

- compartir código fuente entre tu máquina y un contenedor
- entender por qué eso agiliza muchísimo el desarrollo
- ver cómo los cambios del host se reflejan dentro del contenedor
- distinguir este flujo del caso donde copiás archivos dentro de una imagen
- empezar a pensar entornos locales de desarrollo más ágiles

La idea es que entiendas uno de los usos más valiosos de los bind mounts en el trabajo diario.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. crear una carpeta de proyecto local
2. montar esa carpeta dentro de un contenedor
3. comprobar que el contenedor ve los archivos del host
4. modificar archivos desde el host
5. ver esos cambios reflejados dentro del contenedor sin rebuild
6. entender por qué esto es tan útil durante desarrollo

---

## Idea central que tenés que llevarte

Cuando trabajás en desarrollo, muchas veces querés esto:

- editar código en tu editor local
- guardar cambios
- y que el contenedor pueda verlos enseguida

Ahí es donde el bind mount se vuelve especialmente útil.

Dicho simple:

> en desarrollo, un bind mount te permite trabajar sobre tus archivos reales del host sin tener que reconstruir la imagen por cada cambio.

---

## Qué problema resuelve este tema

Si todo tu flujo fuera así:

1. cambiar un archivo local
2. reconstruir la imagen
3. volver a crear el contenedor
4. probar otra vez

el desarrollo sería bastante más lento y torpe.

Con un bind mount, en cambio, muchas veces podés hacer esto:

1. cambiar un archivo local
2. guardar
3. el contenedor ve el cambio enseguida

Eso acelera muchísimo ciertos flujos.

---

## Qué dice la documentación oficial

Docker explica que los bind mounts son ideales para entornos de desarrollo donde el acceso y la compartición de archivos en tiempo real entre host y contenedor son importantes. También muestra que se usan justamente para montar código fuente dentro del contenedor, de modo que el contenedor vea los cambios apenas guardás el archivo. Además, Docker Desktop destaca el file sharing como una función útil para editar código en el host mientras lo ejecutás y probás dentro de un contenedor. citeturn280572search1turn280572search2turn280572search3turn280572search11

---

## Qué diferencia hay con copiar archivos dentro de una imagen

Esto es muy importante.

### Copiar archivos con Dockerfile
Por ejemplo:

```Dockerfile
COPY . .
```

Eso mete una **versión del código** dentro de la imagen al momento del build.

Si después cambiás un archivo local, la imagen no se actualiza sola.

### Compartir código con bind mount
El contenedor ve directamente una carpeta real de tu host.

Si cambiás un archivo local, el contenedor puede ver ese cambio sin necesidad de rebuild.

Esa diferencia cambia por completo la experiencia de desarrollo.

---

## Cuándo suele convenir este enfoque

Suele convenir mucho cuando:

- desarrollás una app y querés tocar archivos seguido
- usás una herramienta que observa cambios de archivos
- querés probar algo rápido sin rebuild constante
- necesitás editar desde tu IDE o editor local

Este tema no reemplaza el build final de producción.
Lo que hace es mejorar el flujo de trabajo local.

---

## Ejemplo práctico mínimo

Vas a hacer un ejemplo muy simple con HTML, para que la idea quede clarísima sin meter complejidad extra.

Vas a crear una carpeta local con un archivo y la vas a montar dentro de un contenedor Nginx.

---

## Paso 1: crear una carpeta local

Por ejemplo:

```bash
mkdir proyecto-live
cd proyecto-live
```

---

## Paso 2: crear un index.html local

Creá un archivo llamado:

```text
index.html
```

Con algo simple como esto:

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Prueba con bind mount</title>
  </head>
  <body>
    <h1>Hola desde mi carpeta local</h1>
    <p>Este archivo está siendo compartido con el contenedor.</p>
  </body>
</html>
```

---

## Paso 3: montar esa carpeta dentro de Nginx

Ubicado en la carpeta del proyecto, ejecutá algo como esto:

```bash
docker run -d   --name nginx-live   -p 8080:80   --mount type=bind,src="$(pwd)",dst=/usr/share/nginx/html   nginx
```

---

## Qué hace este comando

- usa la imagen `nginx`
- deja el contenedor corriendo en segundo plano
- publica el puerto `80` del contenedor en el `8080` del host
- monta tu carpeta actual del host dentro de la carpeta donde Nginx sirve el contenido estático

Eso significa que Nginx va a servir directamente los archivos que están en tu carpeta local.

---

## Qué deberías ver

Abrí el navegador en:

```text
http://localhost:8080
```

Y deberías ver tu `index.html`.

Pero lo importante viene ahora.

---

## Paso 4: cambiar el archivo local

Abrí tu `index.html` en el editor y cambiá, por ejemplo, el título principal:

```html
<h1>Ahora este cambio vino desde el host</h1>
```

Guardá el archivo.

---

## Paso 5: recargar el navegador

Volvé a cargar:

```text
http://localhost:8080
```

Ahora deberías ver el cambio reflejado.

Y eso es justamente el valor del bind mount en desarrollo:

- no reconstruiste imagen
- no recreaste contenedor
- solo cambiaste un archivo local
- el contenedor ya estaba viendo esa carpeta

---

## Qué demuestra este ejercicio

Demuestra que:

- el contenedor está leyendo una carpeta real del host
- los cambios se reflejan enseguida
- no dependés de `docker build` para cada prueba simple de archivo
- el bind mount puede darte una experiencia mucho más ágil para desarrollo

---

## Qué dice Docker sobre esto en desarrollo

Docker tiene guías actuales para desarrollo con Node y otros stacks donde usa bind mounts para montar source code dentro del contenedor y permitir que procesos como `nodemon` u observadores de archivos reaccionen a los cambios apenas guardás. citeturn280572search3turn280572search12turn280572search9

Esto no es un truco raro.
Es una práctica muy común.

---

## Qué diferencia hay entre “flujo de desarrollo” y “imagen final”

Esto te tiene que quedar clarísimo.

### En desarrollo
Podés usar bind mounts para trabajar de forma más dinámica.

### En producción
Normalmente querés una imagen bien construida, autosuficiente y reproducible.

O sea:

- bind mount ayuda mucho para desarrollo
- no reemplaza la necesidad de construir una imagen final bien armada

Ambos enfoques cumplen roles distintos.

---

## Qué cuidados conviene tener

La documentación oficial recuerda varios puntos importantes sobre bind mounts:

- por defecto tienen acceso de escritura al host
- dependen de rutas concretas del host
- si usás un daemon remoto, no podés montar archivos del cliente local
- en Docker Desktop el acceso al filesystem del host pasa por mecanismos de compartición de archivos del entorno Desktop citeturn280572search0turn280572search10turn280572search14

Traducido a práctica:

- montá solo lo que necesitás
- no compartas rutas sensibles porque sí
- recordá que esto está muy ligado a tu máquina concreta
- en Windows/macOS con Docker Desktop, el sistema de file sharing importa

---

## Por qué a veces puede sentirse más lento en proyectos grandes

Docker Desktop documenta una función llamada **Synchronized file shares** pensada para mejorar el rendimiento de acceso a archivos cuando trabajás con repositorios grandes o monorepos usando bind mounts. citeturn280572search5

No hace falta que lo uses ahora.
Solo quiero que te quede esta idea:

- bind mounts son muy útiles
- pero en proyectos muy grandes puede aparecer una cuestión de rendimiento
- Docker Desktop ya tiene opciones pensadas para mejorar eso

---

## Qué no tenés que confundir

### Ver cambios en vivo no significa que la imagen cambió
Lo que cambió fue el archivo del host que el contenedor está leyendo.

### Bind mount no reemplaza el build final
Sirve mucho para desarrollo, no para cerrar una imagen de producción por sí solo.

### Nginx no está sirviendo “mágicamente desde tu editor”
Está sirviendo la ruta montada del host que vos le compartiste.

### Eliminar el contenedor no borra tu carpeta local
Porque el dato vive en tu máquina.

---

## Error común 1: cambiar archivos y esperar que eso modifique la imagen construida

No.

La imagen sigue siendo la misma.
Lo que pasa es que el contenedor está leyendo archivos montados desde el host.

---

## Error común 2: montar más de lo necesario

Si compartís rutas demasiado grandes o sensibles, aumentás riesgos y ruido innecesario.

---

## Error común 3: confundir desarrollo con producción

Que algo funcione con bind mount en local no significa automáticamente que ésa sea la estrategia adecuada para un despliegue final.

---

## Error común 4: no entender que esto depende del host

Los bind mounts dependen de rutas reales del host. Docker lo marca explícitamente como una limitación frente a opciones más desacopladas. citeturn280572search0turn280572search6

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá una carpeta local:

```bash
mkdir proyecto-live
cd proyecto-live
```

### Ejercicio 2
Creá un archivo `index.html` con contenido simple.

### Ejercicio 3
Levantá Nginx montando la carpeta actual:

```bash
docker run -d   --name nginx-live   -p 8080:80   --mount type=bind,src="$(pwd)",dst=/usr/share/nginx/html   nginx
```

### Ejercicio 4
Abrí:

```text
http://localhost:8080
```

### Ejercicio 5
Modificá `index.html` desde tu editor local.

### Ejercicio 6
Recargá el navegador y comprobá el cambio.

### Ejercicio 7
Detenelo y eliminá el contenedor al terminar:

```bash
docker stop nginx-live
docker rm nginx-live
```

### Ejercicio 8
Respondé con tus palabras:

- ¿por qué no necesitaste rebuild?
- ¿qué estaba viendo realmente Nginx?
- ¿por qué esto mejora el flujo de desarrollo?

---

## Segundo ejercicio de análisis

Compará estas dos formas de trabajo:

### Flujo A
- cambiar archivo local
- `docker build`
- `docker run`
- probar

### Flujo B
- cambiar archivo local
- guardar
- recargar navegador

Respondé:

- cuál se parece más a trabajar con bind mount
- en qué contexto te sirve más cada uno
- por qué ambos siguen siendo útiles, pero para etapas distintas

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre compartir código y copiar código?
- ¿qué valor práctico le ves a no tener que rebuild por cada cambio?
- ¿qué limitación viste o imaginás al depender de la carpeta local del host?
- ¿en qué proyecto tuyo esto te ahorraría más tiempo?
- ¿cómo cambia tu idea de “desarrollo dentro de contenedores” después de este ejercicio?

Estas observaciones valen mucho más que solo hacer que el ejemplo funcione.

---

## Mini desafío

Intentá explicar con tus palabras este flujo:

1. crear archivos locales
2. montar la carpeta en el contenedor
3. arrancar el servicio
4. editar archivos en tu editor
5. ver los cambios desde el contenedor sin rebuild

Y además respondé:

- ¿qué problema práctico resuelve esto?
- ¿por qué es tan útil para desarrollo?
- ¿por qué no reemplaza una imagen final bien construida?
- ¿qué riesgos o cuidados te parece importante recordar?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- compartir código local con un contenedor usando bind mounts
- ver por qué eso acelera el desarrollo
- distinguir entre copiar archivos a la imagen y compartir archivos del host
- entender mejor cuándo conviene este flujo
- prepararte para usarlo con apps más reales en los próximos bloques

---

## Resumen del tema

- Los bind mounts son muy útiles para compartir código o archivos entre host y contenedor en tiempo real. citeturn280572search1turn280572search2
- Permiten ver cambios locales sin rebuild constante.
- Esto mejora muchísimo el flujo de desarrollo.
- La imagen no cambia por usar bind mounts; lo que cambia es el archivo montado desde el host.
- Siguen existiendo límites y cuidados: dependencia del host, acceso de escritura por defecto y temas de file sharing en Docker Desktop. citeturn280572search0turn280572search11turn280572search14
- Este tema te muestra una de las prácticas más valiosas para trabajar cómodo en local.

---

## Próximo tema

En el próximo tema vas a empezar a ver otro problema muy real cuando compartís archivos entre host y contenedor:

- rutas
- permisos
- diferencias entre sistemas
- por qué a veces algo simple deja de funcionar
