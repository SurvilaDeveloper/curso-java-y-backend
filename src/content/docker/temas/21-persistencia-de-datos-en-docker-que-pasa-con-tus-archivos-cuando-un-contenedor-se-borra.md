---
title: "Persistencia de datos en Docker: qué pasa con tus archivos cuando un contenedor se borra"
description: "Tema 21 del curso práctico de Docker: cómo funciona la capa escribible del contenedor, por qué ciertos datos se pierden al eliminarlo y por qué aparecen volúmenes y bind mounts como solución."
order: 21
module: "Datos y archivos"
level: "base"
draft: false
---

# Persistencia de datos en Docker: qué pasa con tus archivos cuando un contenedor se borra

## Objetivo del tema

En este tema vas a:

- entender qué pasa con los archivos creados dentro de un contenedor
- ver por qué ciertos datos se pierden al eliminarlo
- distinguir entre datos efímeros y datos persistentes
- entender por qué Docker necesita mecanismos de persistencia
- prepararte para usar volúmenes y bind mounts en los próximos temas

La idea es que veas primero el problema real antes de aprender la solución.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. crear un contenedor simple
2. escribir un archivo dentro del contenedor
3. comprobar que el archivo existe mientras el contenedor sigue ahí
4. eliminar el contenedor
5. ver que ese archivo ya no está
6. entender por qué pasa eso
7. preparar el terreno para volúmenes y bind mounts

---

## Idea central que tenés que llevarte

Un contenedor tiene una capa escribible donde puede generar o modificar datos mientras está en uso.

Pero esa capa no es el lugar correcto para guardar datos que querés conservar cuando el contenedor desaparece.

Dicho simple:

> si escribís datos solo dentro de la capa escribible del contenedor y después lo eliminás, esos datos también se pierden

Esa es una de las ideas más importantes de Docker.

---

## Qué problema resuelve este bloque del curso

Hasta ahora trabajaste mucho con:

- imágenes
- contenedores
- Dockerfile
- builds
- ejecución
- puertos

Pero ahora aparece una pregunta muy importante:

> ¿qué pasa con los datos de una aplicación cuando el contenedor se detiene o se elimina?

Esa pregunta es clave para cualquier proyecto real.

Porque una cosa es ejecutar un contenedor.
Otra muy distinta es conservar datos útiles entre ejecuciones.

---

## Qué dice la documentación oficial

Docker explica que los datos escritos en la capa escribible del contenedor se pierden cuando el contenedor es destruido. También documenta que los volúmenes existen fuera del ciclo de vida de un contenedor y que los bind mounts montan un archivo o directorio del host dentro del contenedor. citeturn894751search0turn894751search12turn894751search1

---

## Qué es la capa escribible del contenedor

Sin meterte todavía en detalles demasiado internos, pensalo así:

- la imagen aporta una base
- cuando creás un contenedor, Docker agrega una capa donde ese contenedor puede escribir cambios

Ahí pueden aparecer cosas como:

- archivos nuevos
- archivos modificados
- logs internos
- bases locales
- resultados generados por la aplicación

Mientras el contenedor existe, esos cambios pueden estar disponibles.

El problema aparece cuando ese contenedor desaparece.

---

## Datos efímeros y datos persistentes

Esta diferencia te tiene que quedar clara desde ahora.

### Datos efímeros
Son datos que no importa perder.

Por ejemplo:

- archivos temporales
- resultados descartables
- pruebas rápidas
- procesos de una sola vez

### Datos persistentes
Son datos que querés conservar.

Por ejemplo:

- archivos subidos por usuarios
- una base de datos
- contenido generado por la app
- configuraciones editables
- logs que necesitás guardar

Docker se lleva muy bien con datos efímeros dentro del contenedor.
Pero para datos persistentes necesitás otra estrategia.

---

## Primer ejemplo práctico: crear un archivo dentro de un contenedor

Ejecutá esto:

```bash
docker run -it --name prueba-datos alpine sh
```

---

## Qué hace

- usa la imagen `alpine`
- crea un contenedor llamado `prueba-datos`
- te deja entrar a una shell interactiva dentro del contenedor

Una vez dentro, ejecutá:

```sh
mkdir -p /datos
echo "Este archivo vive dentro del contenedor" > /datos/mensaje.txt
cat /datos/mensaje.txt
```

---

## Qué deberías ver

Deberías ver el contenido del archivo:

```text
Este archivo vive dentro del contenedor
```

Eso demuestra que el archivo fue creado correctamente dentro del contenedor.

---

## Salí del contenedor

Ahora salí con:

```sh
exit
```

---

## Qué pasa ahora

El contenedor ya no está corriendo, pero todavía existe.

Por eso, si querés, podés volver a mirarlo con:

```bash
docker ps -a
```

Y deberías encontrar `prueba-datos` en la lista.

---

## Verificar que el archivo sigue existiendo mientras el contenedor existe

Como el contenedor todavía no fue eliminado, podés volver a entrar así:

```bash
docker start prueba-datos
docker exec -it prueba-datos sh
```

Y después verificar:

```sh
cat /datos/mensaje.txt
```

Deberías volver a verlo.

Esto muestra algo importante:

- detener el contenedor no borra automáticamente su capa escribible
- mientras el contenedor siga existiendo, esos cambios pueden seguir ahí

---

## El momento importante: borrar el contenedor

Salí otra vez del contenedor con:

```sh
exit
```

Y después ejecutá:

```bash
docker stop prueba-datos
docker rm prueba-datos
```

---

## Qué pasa después

Ahora ese contenedor ya no existe.

Y con él desaparece también la capa escribible donde estaba tu archivo `/datos/mensaje.txt`.

Ese es el punto clave del tema.

---

## Qué demuestra este ejercicio

Demuestra que:

- un contenedor puede generar archivos
- esos archivos pueden seguir existiendo mientras el contenedor exista
- pero si eliminás el contenedor, lo que estaba solo en su capa escribible se pierde

Esto es exactamente lo que te obliga a pensar en persistencia para aplicaciones reales.

---

## Por qué esto importa tanto

Si tu aplicación guarda dentro del contenedor cosas como estas:

- una base SQLite
- archivos subidos
- configuraciones editadas
- resultados importantes

y después eliminás el contenedor, podrías perderlos.

Por eso no alcanza con “hacer que el contenedor funcione”.
También tenés que pensar dónde viven los datos.

---

## La solución general: montar almacenamiento externo a la vida del contenedor

Docker ofrece mecanismos justamente para evitar este problema.

Los dos que más te interesan ahora son:

- volúmenes
- bind mounts

No los vas a profundizar del todo en este tema.
Primero quiero que te quedes con la razón por la que existen.

---

## Qué es un volumen, a nivel idea

Un volumen es una forma de persistir datos fuera del ciclo de vida del contenedor.

La documentación oficial de Docker dice justamente que el contenido de un volumen existe fuera del ciclo de vida de un contenedor y que usar un volumen permite conservar datos incluso si el contenedor se elimina. citeturn894751search0turn894751search2turn894751search3

---

## Qué es un bind mount, a nivel idea

Un bind mount conecta un archivo o directorio del host con una ruta dentro del contenedor.

La documentación oficial lo define como el montaje de un archivo o directorio de la máquina host dentro del contenedor. También lo presenta como una opción muy útil para compartir código fuente o generar archivos desde el contenedor directamente sobre el filesystem del host. citeturn894751search1turn894751search4turn894751search6

---

## Diferencia conceptual rápida

Por ahora, sin adelantarte demasiado, pensalo así:

### Volumen
Docker lo administra como mecanismo de persistencia.

### Bind mount
Vos elegís una carpeta concreta de tu host y la compartís con el contenedor.

Más adelante vas a trabajar cada uno con calma.

---

## Qué pasa con una base de datos

Este punto es muy importante para proyectos reales.

La documentación oficial de Docker sobre bases de datos remarca que los datos de una base deben persistirse en un volumen si querés que sobrevivan a reinicios o eliminación de contenedores. citeturn894751search11

Eso significa que si más adelante corrés:

- PostgreSQL
- MySQL
- MongoDB
- SQLite en ciertos casos

vas a tener que pensar muy bien dónde vive el dato.

---

## Qué no tenés que confundir

### Detener no es lo mismo que eliminar
Si detenés un contenedor, puede seguir conservando su capa escribible.
Si lo eliminás, esa capa desaparece con él.

### Persistencia no significa “el contenedor sigue vivo”
Significa que el dato vive fuera de la vida de un contenedor puntual.

### Que una app funcione no significa que esté guardando bien sus datos
Podría estar funcionando perfecto y aun así estar escribiendo en un lugar efímero.

### Imagen no es lo mismo que almacenamiento persistente
La imagen es base de ejecución, no almacenamiento dinámico para conservar datos de usuarios.

---

## Error común 1: guardar datos importantes solo dentro del contenedor

Ese es justamente el problema que este tema te quiere mostrar.

Mientras el contenedor existe, parece que todo está bien.
Pero cuando lo eliminás, podés perder esos datos.

---

## Error común 2: creer que detener el contenedor ya borra todo

No siempre.

Detener no elimina.
Eliminar sí.

Por eso a veces un archivo “sigue ahí” si el contenedor todavía existe aunque esté parado.

---

## Error común 3: pensar que la imagen guarda tus cambios dinámicos

No.

Los cambios que hacés dentro del contenedor no se convierten mágicamente en parte de la imagen original.

---

## Error común 4: no diferenciar entre persistir datos y compartir archivos de desarrollo

Ambos problemas se parecen, pero no son exactamente iguales.

Más adelante vas a ver que:

- volumen suele ser una opción muy buena para persistencia
- bind mount suele ser muy útil para desarrollo y para compartir archivos concretos del host

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Levantá un contenedor interactivo:

```bash
docker run -it --name prueba-datos alpine sh
```

### Ejercicio 2
Dentro del contenedor, ejecutá:

```sh
mkdir -p /datos
echo "Este archivo vive dentro del contenedor" > /datos/mensaje.txt
cat /datos/mensaje.txt
```

### Ejercicio 3
Salí con:

```sh
exit
```

### Ejercicio 4
Comprobá que el contenedor sigue existiendo:

```bash
docker ps -a
```

### Ejercicio 5
Volvé a entrar:

```bash
docker start prueba-datos
docker exec -it prueba-datos sh
```

### Ejercicio 6
Volvé a leer el archivo:

```sh
cat /datos/mensaje.txt
```

### Ejercicio 7
Salí otra vez y ahora eliminá el contenedor:

```bash
docker stop prueba-datos
docker rm prueba-datos
```

### Ejercicio 8
Respondé con tus palabras:

- ¿por qué el archivo seguía existiendo mientras el contenedor no se había eliminado?
- ¿por qué el problema aparece cuando lo borrás?
- ¿por qué esto te obliga a pensar en persistencia?

---

## Segundo ejercicio de análisis

Pensá en alguno de tus proyectos y respondé:

- ¿qué datos de ese proyecto serían efímeros?
- ¿qué datos necesitarían persistir?
- ¿qué se rompería si esos datos se perdieran al eliminar un contenedor?
- ¿te convendría más un volumen o un bind mount? No hace falta resolverlo perfecto todavía; solo pensalo.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué diferencia concreta viste entre detener y eliminar?
- ¿por qué el archivo parecía “persistir” al principio?
- ¿en qué momento entendiste que en realidad no era persistencia real?
- ¿qué tipo de datos de tus proyectos no tolerarían ese comportamiento?
- ¿por qué volúmenes y bind mounts empiezan a tener sentido después de este ejercicio?

Estas observaciones valen mucho más que aprenderte una definición seca.

---

## Mini desafío

Intentá explicar con tus palabras esta idea:

> el contenedor puede escribir datos, pero eso no garantiza que esos datos sobrevivan cuando el contenedor desaparece.

Y además respondé:

- ¿qué papel cumple la capa escribible del contenedor?
- ¿por qué un volumen resuelve un problema distinto del simple “guardar dentro del contenedor”?
- ¿qué ventaja te da un bind mount cuando querés trabajar con archivos del host?
- ¿por qué este tema es clave antes de tocar bases de datos en Docker?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar qué pasa con los archivos escritos dentro de un contenedor
- distinguir entre detener y eliminar un contenedor
- entender por qué eso no equivale a persistencia real
- visualizar por qué existen volúmenes y bind mounts
- prepararte mucho mejor para los próximos temas del bloque

---

## Resumen del tema

- Los contenedores pueden escribir datos en su capa escribible.
- Esa capa puede seguir existiendo mientras el contenedor exista, incluso si está detenido.
- Cuando el contenedor se elimina, esa capa se pierde con él.
- Por eso guardar datos importantes solo dentro del contenedor es una mala estrategia.
- Los volúmenes permiten persistir datos fuera del ciclo de vida del contenedor.
- Los bind mounts conectan rutas del host con rutas del contenedor.
- Este tema te muestra el problema real que los mecanismos de persistencia vienen a resolver.

---

## Próximo tema

En el próximo tema vas a empezar con la primera solución concreta de este bloque:

- qué es un volumen
- cómo crearlo
- cómo montarlo
- cómo comprobar que el dato sobrevive aunque el contenedor desaparezca
