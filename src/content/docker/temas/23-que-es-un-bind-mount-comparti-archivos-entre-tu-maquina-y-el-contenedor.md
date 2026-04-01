---
title: "Qué es un bind mount: compartí archivos entre tu máquina y el contenedor"
description: "Tema 23 del curso práctico de Docker: qué es un bind mount, cómo montarlo desde el host, en qué se diferencia de un volumen y por qué es muy útil para desarrollo y para compartir archivos concretos."
order: 23
module: "Datos y archivos"
level: "base"
draft: false
---

# Qué es un bind mount: compartí archivos entre tu máquina y el contenedor

## Objetivo del tema

En este tema vas a:

- entender qué es un bind mount
- montar una carpeta de tu host dentro de un contenedor
- comprobar que los cambios se reflejan entre host y contenedor
- distinguir mejor bind mounts y volúmenes
- empezar a ver por qué los bind mounts son tan útiles en desarrollo

La idea es que entiendas la segunda gran herramienta de este bloque, ahora pensada para compartir rutas concretas de tu máquina con un contenedor.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. crear una carpeta en tu máquina host
2. montarla dentro de un contenedor
3. escribir un archivo desde el contenedor
4. comprobar que aparece en tu host
5. modificar un archivo desde el host
6. comprobar que el contenedor ve el cambio
7. comparar esta forma de trabajo con los volúmenes

---

## Idea central que tenés que llevarte

Un bind mount conecta una ruta específica de tu máquina host con una ruta dentro del contenedor.

Dicho simple:

> el contenedor ve una carpeta real de tu máquina  
> y tu máquina ve los cambios que ocurren en esa carpeta

Eso lo vuelve especialmente útil cuando necesitás compartir archivos entre ambos mundos.

---

## Qué es un bind mount

Un bind mount es un montaje directo de un archivo o directorio del host dentro del contenedor.

Eso significa que vos elegís exactamente qué ruta de tu máquina querés compartir.

No es Docker quien decide dónde viven esos archivos.
La ruta la decidís vos.

---

## Qué dice la documentación oficial

La documentación oficial de Docker define los bind mounts como un enlace directo entre una ruta del host y una ruta del contenedor, y explica que se usan cuando necesitás compartir archivos entre ambos. También remarca que dependen de la estructura de archivos concreta del host y que Docker recomienda `--mount` como forma más explícita para crearlos. Además, Docker compara bind mounts y named volumes señalando que en los bind mounts vos decidís la ubicación del host, mientras que en los volúmenes la elige Docker. citeturn465632search0turn465632search7turn465632search11turn465632search1

---

## Cómo conviene pensar un bind mount

Pensalo así:

- volumen: Docker administra el almacenamiento
- bind mount: vos elegís una carpeta o archivo concreto del host

Esa diferencia cambia mucho el uso típico de cada uno.

---

## Cuándo suele convenir un bind mount

Un bind mount suele ser muy útil cuando:

- querés trabajar con archivos reales de tu máquina
- querés editar código en tu editor y que el contenedor lo vea
- querés compartir configuraciones o scripts concretos
- querés que el contenedor genere archivos directamente sobre el host

Esto lo vuelve especialmente atractivo para desarrollo.

---

## Diferencia conceptual rápida con un volumen

### Volumen
- Docker administra dónde vive
- está pensado muy fuerte para persistencia administrada
- suele ser ideal para datos de aplicación, bases de datos y almacenamiento desacoplado del host

### Bind mount
- vos elegís la ruta exacta del host
- sirve mucho para compartir archivos entre host y contenedor
- depende de que esa ruta exista y tenga sentido en esa máquina

La documentación oficial señala justamente que los volúmenes son una muy buena opción para persistencia y compartir entre contenedores, mientras que los bind mounts son la opción indicada cuando necesitás acceso desde host y contenedor al mismo archivo o directorio. citeturn465632search2turn465632search11turn465632search7

---

## Sintaxis recomendada con --mount

La forma más clara es esta:

```bash
docker run --mount type=bind,src=<ruta-host>,dst=<ruta-contenedor> imagen
```

Por ejemplo:

```bash
docker run -it --mount type=bind,src="$(pwd)/datos-host",dst=/datos alpine sh
```

En Windows puede variar un poco la sintaxis según uses PowerShell, CMD o Git Bash, pero la idea sigue siendo la misma:

- `src` es la ruta del host
- `dst` o `target` es la ruta dentro del contenedor

---

## Qué tenés que tener en cuenta sobre la ruta del host

La documentación oficial aclara algo importante:

- con `--mount`, si la ruta del host no existe, Docker da error
- con `-v`, Docker puede crear una carpeta si la ruta no existe, y la crea como directorio citeturn465632search0

Por eso, al empezar, conviene crear primero la carpeta del host de forma explícita.

---

## Paso 1: crear una carpeta en tu host

Creá una carpeta de práctica.

En Linux, macOS o Git Bash podrías hacer algo como:

```bash
mkdir -p datos-host
```

En PowerShell podrías usar una carpeta creada manualmente o con:

```powershell
mkdir datos-host
```

Lo importante es que exista una carpeta real en tu máquina.

---

## Paso 2: montar esa carpeta en un contenedor

Si estás dentro de la carpeta que contiene `datos-host`, ejecutá:

```bash
docker run -it --name contenedor-bind --mount type=bind,src="$(pwd)/datos-host",dst=/datos alpine sh
```

---

## Qué hace este comando

- usa Alpine
- crea un contenedor interactivo
- monta la carpeta `datos-host` del host en `/datos` dentro del contenedor
- te deja entrar a una shell

A partir de ahora, `/datos` y tu carpeta local `datos-host` están conectadas.

---

## Paso 3: escribir desde el contenedor

Una vez dentro del contenedor, ejecutá:

```sh
echo "Hola desde el contenedor" > /datos/mensaje.txt
cat /datos/mensaje.txt
```

---

## Qué deberías ver

Deberías ver:

```text
Hola desde el contenedor
```

Pero lo importante no es solo eso.

Lo importante es que ese archivo debería aparecer también en tu carpeta real del host.

---

## Comprobar desde tu host

Sin borrar todavía la carpeta, salí del contenedor con:

```sh
exit
```

Y después mirá el contenido de `datos-host` desde tu máquina.

Por ejemplo:

```bash
ls datos-host
cat datos-host/mensaje.txt
```

Deberías encontrar el archivo creado desde el contenedor.

Esto demuestra algo clave:

- el archivo no quedó “solo dentro del contenedor”
- quedó en tu host, porque la ruta estaba compartida

---

## Paso 4: cambiar algo desde el host

Ahora modificá el archivo desde tu máquina.

Por ejemplo:

```bash
echo "Hola desde el host" > datos-host/mensaje.txt
```

---

## Paso 5: volver a mirar desde el contenedor

Como el contenedor todavía existe, podés volver a iniciarlo y entrar:

```bash
docker start contenedor-bind
docker exec -it contenedor-bind sh
```

Luego ejecutá:

```sh
cat /datos/mensaje.txt
```

Deberías ver:

```text
Hola desde el host
```

Esto muestra la otra mitad del bind mount:

- el host modifica
- el contenedor ve el cambio

---

## Qué demuestra este ejercicio

Demuestra que un bind mount sirve para compartir una ruta concreta entre host y contenedor.

Eso significa que:

- el contenedor puede escribir en la carpeta del host
- el host puede editar archivos
- el contenedor ve esos cambios
- no dependés de reconstruir la imagen para cada cambio de archivo

Por eso es tan útil en desarrollo.

---

## Por qué esto es tan útil para desarrollo

La documentación oficial de Docker muestra ejemplos de bind mounts para compartir archivos locales con un contenedor, especialmente en escenarios donde querés cambiar contenido local y verlo reflejado sin reconstruir toda la imagen. citeturn465632search12turn465632search9

Eso hace que un bind mount sea muy útil para casos como:

- una app frontend en desarrollo
- una carpeta de código fuente
- archivos de configuración editables
- assets que querés tocar desde tu editor

---

## Bind mount de solo lectura

La documentación oficial también explica que podés montar un bind mount en modo solo lectura usando `readonly` o `ro`. citeturn465632search0

Por ejemplo:

```bash
docker run --mount type=bind,src="$(pwd)/datos-host",dst=/datos,readonly alpine ls /datos
```

Esto es útil cuando querés que el contenedor vea archivos del host, pero no querés que pueda modificarlos.

---

## Qué tener en cuenta sobre portabilidad

Docker advierte que los bind mounts dependen de la estructura de archivos del host. Eso significa que un contenedor que usa bind mounts puede no funcionar igual en otra máquina si esa ruta no existe o no tiene la misma estructura. citeturn465632search0

Esto es una diferencia importante con los volúmenes.

Por eso, para datos de aplicación más “desacoplados” y portables, los volúmenes suelen ser una opción más robusta.

---

## Qué no tenés que confundir

### Bind mount no es lo mismo que volumen
Ambos son mounts, pero no tienen el mismo propósito principal ni el mismo grado de dependencia del host.

### Eliminar el contenedor no borra la carpeta del host
Porque el dato vive en tu máquina, no en la capa escribible del contenedor.

### Cambiar archivos del host no implica reconstruir la imagen
Justamente el bind mount evita esa necesidad en muchos escenarios de desarrollo.

### Un bind mount no vuelve tu proyecto “más portable” por sí mismo
Depende de rutas concretas del host, así que puede ser más frágil entre máquinas distintas.

---

## Error común 1: usar una ruta del host que no existe con --mount

Con `--mount`, Docker da error si la ruta fuente no existe. Por eso conviene crearla antes. citeturn465632search0

---

## Error común 2: pensar que un bind mount es ideal para todo

No siempre.

Si querés persistencia administrada por Docker o un almacenamiento más desacoplado del host, muchas veces un volumen es mejor.

---

## Error común 3: escribir fuera de la ruta montada

Si montaste el host en `/datos` pero escribís en `/tmp` o en otra ruta del contenedor, esos cambios no van a tu carpeta compartida.

---

## Error común 4: olvidar que host y contenedor pueden modificar lo mismo

La documentación oficial remarca que tanto procesos del contenedor como procesos no-Docker del host pueden modificar los archivos montados. Eso puede ser útil, pero también exige cuidado. citeturn465632search7

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá una carpeta en tu host:

```bash
mkdir -p datos-host
```

### Ejercicio 2
Montala en un contenedor interactivo:

```bash
docker run -it --name contenedor-bind --mount type=bind,src="$(pwd)/datos-host",dst=/datos alpine sh
```

### Ejercicio 3
Dentro del contenedor, ejecutá:

```sh
echo "Hola desde el contenedor" > /datos/mensaje.txt
cat /datos/mensaje.txt
```

### Ejercicio 4
Salí y comprobá desde el host:

```bash
ls datos-host
cat datos-host/mensaje.txt
```

### Ejercicio 5
Modificá el archivo desde el host:

```bash
echo "Hola desde el host" > datos-host/mensaje.txt
```

### Ejercicio 6
Volvé a entrar al contenedor:

```bash
docker start contenedor-bind
docker exec -it contenedor-bind sh
```

### Ejercicio 7
Leé el archivo desde el contenedor:

```sh
cat /datos/mensaje.txt
```

### Ejercicio 8
Salí y limpiá el contenedor:

```bash
docker stop contenedor-bind
docker rm contenedor-bind
```

### Ejercicio 9
Respondé con tus palabras:

- ¿por qué el archivo siguió existiendo aunque borraste el contenedor?
- ¿por qué eso es distinto de guardar un archivo solo dentro del contenedor?
- ¿qué ventaja práctica le ves a esta técnica para desarrollo?

---

## Segundo ejercicio de análisis

Compará estas dos situaciones:

### Caso A
Guardar un archivo importante solo en `/datos` dentro de un contenedor sin mounts.

### Caso B
Montar `./datos-host` del host en `/datos` dentro del contenedor.

Respondé:

- qué pasa si eliminás el contenedor en cada caso
- dónde vive realmente el archivo en cada situación
- en cuál te conviene trabajar si querés editar desde tu máquina y ver cambios enseguida

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿en qué momento se te hizo más clara la diferencia con un volumen?
- ¿qué valor práctico viste en editar desde el host y leer desde el contenedor?
- ¿por qué esto puede ahorrar rebuilds en desarrollo?
- ¿qué desventaja le ves respecto a la dependencia de rutas del host?
- ¿en qué tipo de proyecto tuyo usarías bind mounts?

Estas observaciones valen mucho más que aprenderte solo la sintaxis.

---

## Mini desafío

Intentá explicar con tus palabras este flujo:

1. crear una carpeta en el host
2. montarla dentro del contenedor
3. escribir un archivo desde el contenedor
4. leerlo desde el host
5. modificarlo desde el host
6. volver a verlo dentro del contenedor

Y además respondé:

- ¿qué demuestra eso sobre el bind mount?
- ¿qué diferencia principal ves con un volumen?
- ¿cuándo te parece más natural usar bind mount?
- ¿por qué Docker dice que depende de la estructura del host?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar qué es un bind mount
- montarlo con `--mount type=bind`
- compartir archivos entre host y contenedor
- entender mejor la diferencia entre bind mounts y volúmenes
- reconocer por qué bind mounts son tan usados en desarrollo

---

## Resumen del tema

- Un bind mount conecta una ruta concreta del host con una ruta del contenedor.
- Vos elegís exactamente la ubicación del host.
- Los cambios hechos desde el contenedor aparecen en el host y viceversa.
- Es muy útil para compartir código, configuraciones o archivos durante desarrollo.
- Docker recomienda `--mount` como forma más explícita de declararlo.
- Los bind mounts dependen de la estructura del host, por eso son menos desacoplados que los volúmenes.
- Este tema te muestra la segunda gran herramienta de persistencia y compartición de archivos en Docker.

---

## Próximo tema

En el próximo tema vas a cerrar la comparación entre ambas estrategias:

- volumen vs bind mount
- cuándo conviene uno
- cuándo conviene el otro
- cómo tomar una decisión razonable según el caso
