---
title: "Variables de entorno básicas: configurá contenedores sin tocar la imagen"
description: "Noveno tema práctico del curso de Docker: cómo pasar variables de entorno con docker run, cómo usar --env-file y cómo cambiar el comportamiento de un contenedor sin modificar la imagen."
order: 9
module: "Fundamentos de Docker"
level: "intro"
draft: false
---

# Variables de entorno básicas: configurá contenedores sin tocar la imagen

## Objetivo del tema

En este tema vas a:

- entender qué son las variables de entorno dentro de un contenedor
- pasar configuración al arrancar un contenedor con `-e` y `--env`
- usar `--env-file` para no escribir todo en la línea de comandos
- verificar variables desde adentro del contenedor
- empezar a configurar contenedores de una forma más flexible y prolija

La idea es que aprendas a cambiar comportamiento y configuración sin tener que reconstruir la imagen cada vez.

---

## Qué vas a hacer hoy

En este tema vas a seguir este flujo:

1. entender qué papel cumplen las variables de entorno
2. pasar una variable explícita con `-e`
3. leerla dentro del contenedor
4. reutilizar variables del entorno local
5. cargar variables desde un archivo
6. empezar a pensar configuración y aplicación como cosas separadas

---

## Idea central que tenés que llevarte

Muchas aplicaciones necesitan configuración para funcionar.

Por ejemplo:

- un puerto
- un modo de ejecución
- un usuario
- una URL de base de datos
- una bandera de debug
- un nombre de entorno

En Docker, una forma muy común de pasar esa configuración es usando variables de entorno.

Dicho simple:

> las variables de entorno te permiten parametrizar un contenedor al momento de ejecutarlo, sin modificar la imagen.

---

## Qué dice la documentación oficial

La referencia oficial de `docker run` documenta `-e`, `--env` y `--env-file` como opciones para establecer variables de entorno simples dentro del contenedor o para sobrescribir variables definidas en el Dockerfile de la imagen. También aclara que, si pasás una variable sin `=`, Docker toma el valor desde tu entorno local; y si esa variable no está exportada localmente, queda sin valor dentro del contenedor. citeturn635178view0

---

## Qué es una variable de entorno

Una variable de entorno es un par clave-valor disponible para los procesos que corren dentro del contenedor.

Por ejemplo:

```text
APP_ENV=dev
```

o:

```text
PORT=8080
```

Muchas aplicaciones leen estas variables al arrancar para saber cómo comportarse.

---

## Por qué esto es tan útil

Esto te permite usar una misma imagen para distintos casos.

Por ejemplo, la misma imagen podría correr con:

- `APP_ENV=dev`
- `APP_ENV=test`
- `APP_ENV=prod`

Sin tocar el código ni reconstruir la imagen.

Eso hace que la imagen sea más reutilizable y que la configuración quede desacoplada.

---

## Primer ejemplo: pasar una variable explícita

Ejecutá:

```bash
docker run --rm -e MENSAJE="Hola Docker" alpine sh -c 'echo $MENSAJE'
```

---

## Qué hace este comando

- usa la imagen `alpine`
- crea un contenedor temporal
- le pasa la variable `MENSAJE`
- ejecuta una shell
- imprime el valor de esa variable
- termina
- elimina el contenedor automáticamente con `--rm`

---

## Qué deberías ver

Deberías ver algo como:

```text
Hola Docker
```

Eso confirma que la variable fue recibida correctamente dentro del contenedor.

---

## Qué significa -e o --env

Las opciones:

```bash
-e
```

y

```bash
--env
```

sirven para lo mismo.

Podés usar cualquiera de estas dos formas:

```bash
docker run -e APP_ENV=dev alpine env
```

o:

```bash
docker run --env APP_ENV=dev alpine env
```

---

## Segundo ejemplo: pasar varias variables

Probá esto:

```bash
docker run --rm -e APP_ENV=dev -e PORT=3000 alpine sh -c 'echo "APP_ENV=$APP_ENV | PORT=$PORT"'
```

---

## Qué hace

Pasa dos variables al contenedor:

- `APP_ENV=dev`
- `PORT=3000`

Y después imprime ambas.

Esto es muy común cuando una aplicación necesita varias configuraciones al arrancar.

---

## Tercer ejemplo: ver todas las variables del contenedor

Ejecutá:

```bash
docker run --rm -e APP_ENV=dev alpine env
```

---

## Qué hace

Ejecuta el comando `env` dentro del contenedor y muestra todas las variables de entorno visibles para ese proceso.

Entre ellas deberías poder ver `APP_ENV=dev`.

Esto es muy útil para verificar rápidamente si Docker recibió bien la configuración.

---

## Reutilizar variables de tu entorno local

Docker también permite tomar variables que ya están exportadas en tu máquina local.

La documentación oficial muestra este comportamiento: si pasás `--env VAR1` sin `=valor`, la CLI busca `VAR1` en tu entorno local y lo transmite al contenedor. citeturn635178view0

---

## Ejemplo en Linux o macOS

Primero exportá una variable:

```bash
export APP_ENV=local
```

Después ejecutá:

```bash
docker run --rm --env APP_ENV alpine sh -c 'echo $APP_ENV'
```

Deberías ver:

```text
local
```

---

## Ejemplo equivalente en PowerShell

Si estás en PowerShell, podrías hacer algo así:

```powershell
$env:APP_ENV="local"
docker run --rm --env APP_ENV alpine sh -c 'echo $APP_ENV'
```

---

## Qué tenés que entender sobre esto

En este caso no escribiste:

```bash
--env APP_ENV=local
```

Igual funcionó porque Docker tomó el valor de tu entorno local.

Eso puede ser cómodo, pero también exige atención para no asumir valores que en realidad no están definidos.

---

## Qué pasa si la variable no existe localmente

La referencia oficial aclara que, si pasás una variable sin `=` y esa variable no está exportada en tu entorno local, entonces queda sin valor dentro del contenedor. citeturn635178view0

Por eso, si hacés esto:

```bash
docker run --rm --env VARIABLE_QUE_NO_EXISTE alpine sh -c 'echo "[$VARIABLE_QUE_NO_EXISTE]"'
```

es esperable que veas un valor vacío entre corchetes.

---

## Usar un archivo de variables

Cuando tenés muchas variables, escribirlas todas en la línea de comandos puede ser incómodo.

Para eso existe:

```bash
--env-file
```

La documentación oficial indica que este archivo acepta líneas con formato `VARIABLE=valor`, líneas con solo `VARIABLE` para tomar el valor desde el entorno local, y comentarios iniciados con `#`. citeturn635178view0

---

## Crear un archivo de ejemplo

Creá un archivo llamado:

```text
app.env
```

Con este contenido:

```env
# Archivo de variables
APP_ENV=dev
APP_NAME=mi-app
PORT=8080
```

---

## Usarlo al levantar un contenedor

Ahora ejecutá:

```bash
docker run --rm --env-file app.env alpine sh -c 'echo "$APP_NAME | $APP_ENV | $PORT"'
```

---

## Qué hace

- lee variables desde `app.env`
- las pasa al contenedor
- ejecuta un comando que las imprime

Esto es mucho más prolijo que meter muchas variables a mano en la terminal.

---

## Qué ventaja tiene --env-file

Sirve mucho cuando:

- tenés varias variables
- querés repetir la misma configuración varias veces
- querés tener la configuración separada del comando
- querés un flujo más prolijo y más cercano al trabajo real

---

## Qué relación hay entre esto y el Dockerfile

La documentación oficial también aclara que las variables pasadas con `-e`, `--env` o `--env-file` pueden sobrescribir variables definidas en la imagen mediante Dockerfile. citeturn635178view0

Eso significa que una imagen puede traer ciertos valores por defecto, pero vos podés cambiarlos al momento de ejecutar el contenedor.

---

## Ejemplo mental simple

Imaginá una imagen de aplicación que ya trae algo como esto internamente:

```text
APP_ENV=prod
```

Si después ejecutás el contenedor con:

```bash
docker run -e APP_ENV=dev mi-imagen
```

la aplicación vería `APP_ENV=dev` dentro del contenedor que acabás de crear.

Eso te da mucha flexibilidad.

---

## Qué no tenés que confundir

### Variable de entorno no es lo mismo que argumento de build
Las variables de entorno del contenedor se usan al ejecutar.
Más adelante vas a ver que `ARG` se usa durante el build.

### Pasar variables no significa cambiar la imagen
Solo cambia la configuración del contenedor que estás creando.

### Tener variables no significa que tu aplicación las use
Docker puede pasarlas perfectamente, pero después la aplicación tiene que leerlas.

---

## Error común 1: escribir mal la sintaxis

La forma correcta es algo así:

```bash
-e NOMBRE=valor
```

o:

```bash
--env NOMBRE=valor
```

No te olvides del `=` cuando querés asignar un valor explícito.

---

## Error común 2: creer que --env-file acepta cualquier formato

No.

La referencia oficial espera líneas del tipo:

```text
VARIABLE=valor
```

o simplemente:

```text
VARIABLE
```

para tomar el valor desde el entorno local, además de permitir comentarios con `#`. citeturn635178view0

---

## Error común 3: pensar que esto es una forma segura de manejar secretos

Docker recomienda no usar variables de entorno para información sensible en ciertos contextos, especialmente cuando después avances a Compose y despliegues más serios. La documentación oficial de Compose, por ejemplo, sugiere usar secretos para datos sensibles en lugar de variables de entorno. citeturn414987search0turn414987search8

Para este curso, por ahora, usalas para configuración simple y aprendizaje.

---

## Error común 4: asumir que la variable “queda guardada para siempre”

No.

La variable pertenece al contenedor que acabás de crear con esa configuración.

Si levantás otro contenedor distinto, tenés que pasarle la configuración otra vez o usar un mecanismo que la defina nuevamente.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Pasá una variable explícita:

```bash
docker run --rm -e MENSAJE="Hola Docker" alpine sh -c 'echo $MENSAJE'
```

### Ejercicio 2
Pasá dos variables:

```bash
docker run --rm -e APP_ENV=dev -e PORT=3000 alpine sh -c 'echo "APP_ENV=$APP_ENV | PORT=$PORT"'
```

### Ejercicio 3
Listá variables visibles dentro del contenedor:

```bash
docker run --rm -e APP_ENV=dev alpine env
```

### Ejercicio 4
Si estás en Linux o macOS, exportá una variable local:

```bash
export APP_ENV=local
docker run --rm --env APP_ENV alpine sh -c 'echo $APP_ENV'
```

### Ejercicio 5
Creá un archivo `app.env` con este contenido:

```env
APP_ENV=dev
APP_NAME=mi-app
PORT=8080
```

### Ejercicio 6
Usá ese archivo:

```bash
docker run --rm --env-file app.env alpine sh -c 'echo "$APP_NAME | $APP_ENV | $PORT"'
```

---

## Qué tenés que observar mientras practicás

Mientras hacés los ejercicios, fijate especialmente en estas preguntas:

- ¿qué diferencia viste entre pasar una variable explícita y reutilizar una local?
- ¿qué valor práctico tuvo `env` dentro del contenedor?
- ¿qué ventaja viste en `--env-file`?
- ¿qué pasaría si quisieras repetir esa misma configuración varias veces?
- ¿por qué esto ayuda a separar imagen y configuración?

Estas observaciones son mucho más importantes que memorizar solo la sintaxis.

---

## Mini desafío

Intentá explicar con tus palabras este comando:

```bash
docker run --rm -e APP_ENV=prod -e PORT=8080 alpine sh -c 'echo "$APP_ENV - $PORT"'
```

Respondé:

- qué imagen usa
- qué variables recibe el contenedor
- qué comando ejecuta
- por qué el contenedor se elimina al terminar

Y además respondé:

- ¿cuándo te convendría usar `--env-file`?
- ¿qué ventaja tiene no reconstruir la imagen para cambiar una configuración?
- ¿por qué no deberías confiar ciegamente en variables locales implícitas?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- pasar variables de entorno con `-e` y `--env`
- verificar esas variables dentro del contenedor
- reutilizar variables del entorno local cuando tenga sentido
- usar `--env-file` para configuraciones más prolijas
- entender que la imagen y la configuración del contenedor no son la misma cosa

---

## Resumen del tema

- Las variables de entorno permiten parametrizar un contenedor al ejecutarlo.
- `-e` y `--env` sirven para pasar variables explícitas.
- También podés reutilizar variables exportadas en tu entorno local.
- `--env-file` permite cargar varias variables desde un archivo.
- Estas variables pueden sobrescribir valores definidos en la imagen.
- Cambiar variables no implica reconstruir la imagen.

---

## Próximo tema

En el próximo tema vas a cerrar este bloque inicial con una tarea muy importante para trabajar con más orden:

- eliminar contenedores
- eliminar imágenes
- limpiar recursos sin miedo
- entender qué se puede borrar y qué conviene conservar
