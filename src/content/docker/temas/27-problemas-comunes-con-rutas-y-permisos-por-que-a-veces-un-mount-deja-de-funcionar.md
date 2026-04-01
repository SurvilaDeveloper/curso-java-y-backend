---
title: "Problemas comunes con rutas y permisos: por qué a veces un mount deja de funcionar"
description: "Tema 27 del curso práctico de Docker: errores frecuentes con rutas, permisos y file sharing al usar volúmenes o bind mounts, cómo detectarlos y cómo razonar mejor qué está fallando."
order: 27
module: "Datos y archivos"
level: "base"
draft: false
---

# Problemas comunes con rutas y permisos: por qué a veces un mount deja de funcionar

## Objetivo del tema

En este tema vas a:

- detectar problemas comunes de rutas al usar mounts
- entender por qué a veces aparece un error de permisos
- ver cómo Docker Desktop influye en el acceso a archivos del host
- evitar errores típicos con bind mounts y volúmenes
- construir una forma más ordenada de diagnosticar mounts que “no funcionan”

La idea es que dejes de ver estos problemas como algo misterioso y empieces a leerlos con más criterio.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. identificar errores comunes con rutas
2. entender qué pasa cuando montás sobre una carpeta que ya tenía archivos
3. distinguir problemas de file sharing en Docker Desktop
4. revisar permisos y mounts de solo lectura
5. construir una checklist simple para diagnosticar fallas

---

## Idea central que tenés que llevarte

Cuando un mount “no anda”, muchas veces el problema no está en Docker en general, sino en una de estas cosas:

- la ruta origen está mal
- la ruta no existe
- el mount está tapando contenido que ya existía en el contenedor
- el contenedor no tiene permiso para escribir
- Docker Desktop no tiene compartida esa carpeta del host
- el mount fue declarado como solo lectura

Dicho simple:

> mounts, rutas y permisos forman un conjunto de detalles chicos que, si no los mirás bien, parecen errores raros aunque tengan una causa bastante concreta.

---

## Qué dice la documentación oficial

La documentación oficial de Docker explica varios puntos clave que están detrás de estos problemas:

- en bind mounts, el origen del host y el destino del contenedor deben estar bien definidos
- con `--mount`, si la ruta del host no existe, Docker da error
- si montás sobre una ruta del contenedor que ya tenía archivos, esos archivos quedan ocultos mientras el mount exista
- los bind mounts tienen escritura al host por defecto, pero pueden declararse como `readonly`
- en Docker Desktop el acceso a archivos del host depende del file sharing configurado citeturn607267search0turn607267search1turn607267search5turn607267search8turn607267search14turn607267search19

---

## Problema 1: la ruta del host no existe

Este es uno de los errores más comunes al principio.

Por ejemplo, si hacés algo así con `--mount`:

```bash
docker run --mount type=bind,src=/ruta/que/no/existe,dst=/datos alpine
```

Docker no va a poder montar esa ruta correctamente si no existe.

Por eso conviene muchísimo crear la carpeta antes y no confiar en rutas improvisadas.

---

## Qué hacer en la práctica

Antes de correr el contenedor, verificá:

- que la carpeta exista realmente en tu host
- que estés parado en la ruta correcta si usás `$(pwd)`
- que no estés mezclando una terminal con otra carpeta distinta

Muchas veces el problema es simplemente una ruta mal resuelta.

---

## Problema 2: montaste sobre una carpeta del contenedor que ya tenía contenido

Docker documenta esto de forma muy clara:
si hacés un bind mount sobre una ruta del contenedor que ya tenía archivos, esos archivos quedan **ocultos** por el contenido montado mientras el mount existe.

Eso puede generar mucha confusión.

Por ejemplo, podrías pensar:

> “Nginx venía con ciertos archivos y ahora desaparecieron”

Pero no necesariamente desaparecieron.
Quedaron tapados por el mount.

---

## Ejemplo mental simple

Imaginá esto:

```bash
docker run -d --mount type=bind,src="$(pwd)",dst=/usr/share/nginx/html nginx
```

Si tu carpeta local no tiene los archivos que antes estaban en `/usr/share/nginx/html`, entonces el contenido original del contenedor queda oculto por lo que montaste.

Eso explica por qué a veces el servicio parece “vacío” o distinto de lo esperado.

---

## Problema 3: el contenedor no puede escribir

Docker recuerda que los bind mounts tienen acceso de escritura al host por defecto, pero si montás algo como solo lectura o si el proceso del contenedor no puede escribir en esa ruta, vas a encontrar errores del tipo:

- `Permission denied`
- archivo no modificable
- cambios que no se guardan

Esto no siempre significa “Docker está roto”.
A veces significa simplemente que el mount es de solo lectura o que el proceso no tiene permiso práctico para escribir en esa ubicación.

---

## Bind mount de solo lectura

Podés declarar un mount como solo lectura.

Por ejemplo:

```bash
docker run --mount type=bind,src="$(pwd)/config",dst=/app/config,readonly alpine
```

Eso es útil cuando querés que el contenedor lea archivos del host sin modificarlos.

Pero si después intentás escribir ahí, el error es esperable.

---

## Qué tenés que revisar si aparece un error de permisos

Cuando veas algo como “permission denied”, revisá al menos estas preguntas:

- ¿la ruta montada era realmente escribible?
- ¿la declaraste como `readonly`?
- ¿estás intentando escribir en la ruta montada o en otra?
- ¿el problema está en Docker o en la forma en que montaste la ruta?
- ¿esa carpeta del host está correctamente compartida con Docker Desktop?

Esto último importa mucho en Windows y macOS.

---

## Problema 4: file sharing en Docker Desktop

Docker Desktop documenta que el acceso del contenedor a archivos del host pasa por el sistema de file sharing del entorno Desktop. También explica que hay configuraciones para mejorar rendimiento y que, si una carpeta no está disponible para Docker, pueden aparecer errores de acceso.

Además, la guía de troubleshooting indica revisar Settings → Resources → File Sharing y asegurarte de que la ruta del workspace o una carpeta padre esté compartida. citeturn607267search5turn607267search8turn607267search19

---

## Qué significa esto en la práctica

Si estás en Docker Desktop y montás una carpeta del host, no alcanza solo con escribir bien la ruta.

También importa que Docker tenga permiso para acceder a esa carpeta desde la configuración del entorno Desktop.

Esto explica errores donde la ruta parece correcta, pero igual falla el acceso.

---

## Problema 5: confusión con rutas relativas y absolutas

Este es muy cotidiano.

Por ejemplo, no es lo mismo:

```bash
src="$(pwd)/proyecto"
```

que escribir una ruta pensada para otra terminal, otra unidad o otra carpeta.

Si cambiás de terminal o de carpeta sin darte cuenta, `$(pwd)` ya apunta a otro lado.

Por eso conviene:

- verificar tu carpeta actual
- usar rutas claras
- no dar por supuesto que estás parado donde creés

---

## Problema 6: creer que el host y el contenedor “ven” lo mismo de la misma manera

No necesariamente.

Docker Desktop aclara que los directorios compartidos desde el host mantienen sus permisos originales, pero se exponen a través de una capa de file sharing entre el host y el entorno Linux donde corre Docker. citeturn607267search14turn607267search5

Eso significa que el comportamiento puede no sentirse exactamente igual al de un proceso local puro fuera de Docker.

No hace falta entrar en demasiada teoría acá.
Lo importante es aceptar que hay una traducción entre entornos, sobre todo en Windows y macOS.

---

## Problema 7: montar demasiado y después no entender qué quedó realmente adentro

Si usás mounts muy amplios como:

```bash
--mount type=bind,src="$(pwd)",dst=/app
```

y después el contenedor no encuentra archivos esperados, tenés que preguntarte:

- ¿qué había originalmente en `/app`?
- ¿qué está entrando realmente desde el host?
- ¿estoy tapando archivos del contenedor con el contenido local?

Esta pregunta resuelve mucha confusión.

---

## Problema 8: usar bind mounts en casos donde un volumen sería más razonable

A veces el problema no es una ruta mal escrita.
El problema es haber elegido la herramienta menos conveniente.

Si querías:

- persistir datos de aplicación
- desacoplarte del host
- no depender de una ruta concreta

muchas veces un volumen encaja mejor que un bind mount.

En esos casos, seguir peleando con rutas del host puede ser una mala elección de base.

---

## Una checklist muy útil para diagnosticar mounts

Cuando un mount no funciona, revisá esto en este orden:

### 1. ¿La ruta del host existe?
Si usás `--mount`, esto es obligatorio para bind mounts.

### 2. ¿La ruta del contenedor es la correcta?
Capaz montaste en otro destino.

### 3. ¿Estás tapando contenido que ya existía?
Esto pasa mucho con carpetas como `/usr/share/nginx/html` o `/app`.

### 4. ¿El mount es de solo lectura?
Si sí, escribir va a fallar.

### 5. ¿Docker Desktop tiene acceso a esa carpeta?
Muy importante en Windows y macOS.

### 6. ¿En realidad necesitabas un volumen y no un bind mount?
A veces el problema empieza por ahí.

---

## Qué no tenés que confundir

### “No veo los archivos del contenedor” no siempre significa que se borraron
Puede que hayan quedado ocultos por el mount.

### “Permission denied” no siempre significa problema interno del contenedor
Puede venir de la forma en que declaraste o compartiste la ruta.

### “La ruta está bien escrita” no siempre significa que Docker pueda acceder
En Docker Desktop también importa la configuración de file sharing.

### “Cambió el contenido del directorio” no siempre significa que Nginx o la app estén fallando
Puede que el mount haya reemplazado visualmente lo que había en esa ruta.

---

## Error común 1: montar sobre la carpeta equivocada

Esto puede hacer que la app deje de encontrar archivos, o que desaparezca contenido que en realidad quedó tapado.

---

## Error común 2: no revisar si la ruta fuente existe

Con `--mount`, si la ruta fuente no existe, Docker falla.
Conviene revisar eso antes de perder tiempo buscando otras causas.

---

## Error común 3: olvidar el modo solo lectura

Si usaste `readonly` o `ro`, no deberías sorprenderte si no podés escribir.

---

## Error común 4: ignorar Docker Desktop cuando el problema está ahí

En Windows y macOS, a veces el problema práctico no está en la sintaxis del `docker run`, sino en la compartición de archivos del entorno Desktop.

---

## Ejercicio práctico obligatorio

Quiero que hagas este recorrido de análisis.

### Ejercicio 1
Creá una carpeta local de prueba.

### Ejercicio 2
Montala correctamente en un contenedor Alpine con:

```bash
docker run -it --rm --mount type=bind,src="$(pwd)/tu-carpeta",dst=/datos alpine sh
```

### Ejercicio 3
Dentro del contenedor, verificá qué ves en `/datos`.

### Ejercicio 4
Ahora pensá en estos tres escenarios y respondé qué revisarías primero:

#### Caso A
El contenedor arranca, pero no ves los archivos esperados dentro de la ruta montada.

#### Caso B
Intentás escribir en la ruta montada y aparece un error de permisos.

#### Caso C
En Docker Desktop la ruta parece correcta, pero el contenedor no puede acceder.

### Ejercicio 5
Respondé con tus palabras:

- ¿qué significa que un mount “tape” contenido existente?
- ¿por qué `readonly` cambia por completo el comportamiento?
- ¿por qué una ruta bien escrita puede igual fallar en Docker Desktop?

---

## Segundo ejercicio de análisis

Tomá este comando:

```bash
docker run -d   --name web-live   -p 8080:80   --mount type=bind,src="$(pwd)",dst=/usr/share/nginx/html   nginx
```

Y respondé:

- qué parte del host se está montando
- qué parte del contenedor queda afectada
- por qué el contenido original de esa carpeta del contenedor puede dejar de verse
- qué revisarías si el navegador no muestra lo que esperabas

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué errores de mounts te parecen ahora menos misteriosos?
- ¿qué tan clara te quedó la idea de “tapar” contenido existente?
- ¿por qué una checklist te puede ahorrar mucho tiempo?
- ¿qué diferencias entre Linux puro y Docker Desktop sentís importante recordar?
- ¿cuándo sospecharías primero de la ruta y cuándo primero de permisos?

Estas observaciones valen mucho más que aprender una lista de síntomas sin criterio.

---

## Mini desafío

Intentá armar tu propia mini guía de diagnóstico para mounts en no más de 5 pasos.

Por ejemplo:

1. verificar ruta host
2. verificar destino contenedor
3. revisar si el mount es readonly
4. revisar file sharing en Docker Desktop
5. preguntarme si no debería ser un volumen

Y además respondé:

- ¿qué error te parece más fácil cometer al principio?
- ¿qué idea te resultó más útil para entender por qué desaparecen archivos “sin desaparecer”?
- ¿qué vas a revisar primero la próxima vez que un bind mount no funcione como esperabas?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- detectar problemas comunes de rutas y permisos con mounts
- entender por qué un mount puede ocultar contenido existente
- revisar mounts de solo lectura con más criterio
- considerar el papel de Docker Desktop en el acceso a archivos del host
- diagnosticar mejor por qué un bind mount o volumen parece no funcionar

---

## Resumen del tema

- Muchos problemas de mounts vienen de rutas mal definidas, permisos o file sharing mal resuelto. citeturn607267search0turn607267search19
- En bind mounts, si montás sobre una ruta del contenedor que ya tenía archivos, esos archivos quedan ocultos mientras el mount exista. citeturn607267search0
- Un mount puede ser de solo lectura, y eso cambia totalmente si el contenedor puede escribir o no. citeturn607267search2turn607267search4
- En Docker Desktop importa mucho qué carpetas del host están compartidas. citeturn607267search5turn607267search19
- Tener una checklist simple ayuda muchísimo a dejar de diagnosticar mounts “por intuición”.

---

## Próximo tema

En el próximo bloque vas a empezar a trabajar con otro pilar muy importante de Docker real:

- redes
- comunicación entre contenedores
- por qué los servicios pueden hablarse por nombre
- cómo empezar a conectar app y base de datos
