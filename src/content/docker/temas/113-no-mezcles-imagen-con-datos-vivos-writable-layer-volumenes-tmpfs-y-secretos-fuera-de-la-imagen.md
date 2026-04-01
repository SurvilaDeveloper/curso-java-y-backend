---
title: "No mezcles imagen con datos vivos: writable layer, volúmenes, tmpfs y secretos fuera de la imagen"
description: "Tema 113 del curso práctico de Docker: cómo separar artefacto inmutable de runtime mutable, qué datos no conviene escribir dentro de la imagen, cuándo usar volúmenes, cuándo usar tmpfs y por qué los secretos no deben quedar baked-in en la imagen."
order: 113
module: "Imagen final más profesional y más segura"
level: "intermedio"
draft: false
---

# No mezcles imagen con datos vivos: writable layer, volúmenes, tmpfs y secretos fuera de la imagen

## Objetivo del tema

En este tema vas a:

- entender mejor la diferencia entre imagen inmutable y datos vivos de runtime
- decidir qué sí debería quedar dentro de la imagen y qué no
- distinguir writable layer, volúmenes y `tmpfs`
- evitar meter secretos dentro de la imagen
- construir una regla mucho más sana para temporales, uploads, caches y persistencia

La idea es que dejes de tratar la imagen como si fuera “el lugar para guardar cualquier cosa” y empieces a ver claramente la frontera entre **artefacto de build** y **estado de ejecución**.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender qué parte de un contenedor viene de la imagen y qué parte es mutable
2. ver qué pasa si escribís en la writable layer
3. decidir cuándo convienen volúmenes
4. decidir cuándo conviene `tmpfs`
5. entender por qué los secretos no deben quedar baked-in
6. construir una regla práctica para una runtime más prolija y más segura

---

## Idea central que tenés que llevarte

Docker documenta que todos los archivos creados dentro de un contenedor se escriben por defecto en una **writable container layer** montada encima de las capas de imagen, que son de solo lectura e inmutables. También explica que esa capa writable **no persiste** cuando el contenedor se destruye, que no es fácil extraerla ni compartirla, y que para datos persistentes o write-heavy suelen convenir volúmenes. Además, Docker documenta `tmpfs` para datos temporales en memoria, y advierte que `ARG` y `ENV` son inapropiados para secretos porque quedan expuestos en la imagen final; para eso recomienda build secrets o mecanismos específicos de secrets. citeturn471965search1turn471965search0turn471965search4turn337896search2turn471965search2turn337896search16turn337896search1turn337896search3

Dicho simple:

> la imagen debería contener lo necesario para correr;  
> los datos vivos deberían ir fuera de la imagen, en el mecanismo correcto.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker deja varias ideas muy claras para este tema:

- las capas de imagen son de solo lectura e inmutables; por defecto, lo que el contenedor escribe va a una writable layer efímera encima de ellas. citeturn471965search1turn471965search0
- esa writable layer no persiste al destruir el contenedor, y tampoco es una forma cómoda ni eficiente de compartir o extraer datos. citeturn471965search1turn471965search5
- los volúmenes son el mecanismo preferido para datos persistentes generados y usados por contenedores, y además suelen rendir mejor que escribir directamente en la writable layer. citeturn337896search2turn471965search4turn471965search6
- `tmpfs` sirve para datos temporales: vive en memoria, no persiste después de detener el contenedor y puede evitar que información sensible termine en la capa writable o en el host. citeturn471965search2
- los bind mounts pueden ser read-only con `:ro` o `readonly`, lo que ayuda a limitar escritura innecesaria sobre archivos del host. citeturn471965search8turn471965search3
- Docker advierte explícitamente que `ARG` y `ENV` no son adecuados para secretos porque quedan expuestos en la imagen final; recomienda build secrets o SSH mounts durante el build, y Docker secrets para secretos en runtime. citeturn337896search16turn337896search1turn337896search3
- `docker run --read-only` permite montar el root filesystem del contenedor como read-only, lo que ayuda a reforzar la idea de imagen inmutable si preparás bien las rutas de escritura necesarias. citeturn471965search13

---

## Primer concepto: la imagen no es tu disco de trabajo

Es muy tentador pensar algo así:

- compilo la app
- la corro
- y lo que vaya generando “queda ahí” adentro

Pero Docker documenta que lo que se escribe por defecto va a la writable layer del contenedor, no a las capas de imagen, y que esa capa es efímera respecto del ciclo de vida del contenedor. citeturn471965search1turn471965search0

### Qué enseñanza deja esto
- la imagen no es el lugar natural para estado mutable
- la writable layer no es una estrategia seria de persistencia
- si el dato importa, pensalo fuera de esa capa

Esto cambia muchísimo cómo diseñás una runtime.

---

## Segundo concepto: qué sí pertenece a la imagen

Suele pertenecer a la imagen:

- el ejecutable o artefacto final
- dependencias de runtime
- configuración estática no sensible
- usuarios, permisos y estructura base del filesystem
- el entrypoint o command

O sea:
la imagen debería ser el **artefacto reproducible** que necesitás para arrancar el servicio.

---

## Tercer concepto: qué no conviene tratar como parte de la imagen

No conviene tratar como parte fija de la imagen cosas como:

- datos de base
- uploads de usuarios
- logs persistentes
- archivos temporales de ejecución
- caches que no querés hornear
- secretos
- estado mutable que debe sobrevivir a recreaciones del contenedor

Estas cosas pertenecen a otra capa del diseño.

---

## Cuarto concepto: la writable layer sirve, pero no para todo

Docker documenta que la writable layer sirve para datos efímeros generados en runtime, pero que no persiste cuando el contenedor se destruye y no es la forma ideal para write-heavy workloads. citeturn471965search0turn471965search1turn471965search6

### Cuándo puede tolerarse
- archivos temporales pequeños
- runtime ephemeral que no te importa perder
- pruebas o procesos transitorios

### Cuándo suele ser una mala idea
- persistencia real
- datos de negocio
- uploads
- caches pesadas
- anything que querés conservar o compartir

La clave no es “nunca escribir”.
La clave es **saber qué clase de dato estás escribiendo**.

---

## Quinto concepto: volúmenes para persistencia y escritura seria

Docker documenta que los volúmenes son la opción preferida para datos generados y usados por contenedores, y que además suelen rendir mejor que escribir directo en la writable layer. citeturn337896search2turn471965search4turn471965search6

### Cuándo suele convenir un volumen
- bases de datos
- uploads persistentes
- almacenamiento write-heavy
- datos que deben sobrevivir al contenedor
- datos compartidos entre contenedores

Acá ya no estás hablando de “archivos que sobran”.
Estás hablando de **estado real del sistema**.

---

## Sexto concepto: `tmpfs` para temporales y datos sensibles transitorios

Docker documenta `tmpfs` como un mount que vive en memoria y que no persiste después de detener el contenedor. También remarca que puede ayudar a evitar que datos sensibles terminen escritos en la capa writable o en el host. citeturn471965search2

### Cuándo suele convenir `tmpfs`
- archivos temporales
- sesiones efímeras
- material sensible que no querés persistir
- buffers de runtime
- scratch data que no te importa perder

Esto es muy útil cuando querés reforzar la idea de “nada persistente innecesario dentro del contenedor”.

---

## Séptimo concepto: bind mounts read-only cuando solo necesitás leer

Docker documenta que bind mounts son read-write por defecto, pero que podés marcarlos `:ro` o `readonly`. citeturn471965search8turn471965search3

Por ejemplo:

```bash
docker run -v ./config:/app/config:ro mi-app
```

### Qué gana esto
- el contenedor puede leer esa configuración
- no puede modificarla desde adentro
- reducís escrituras accidentales sobre archivos del host

Esto ayuda muchísimo cuando solo querés inyectar configuración o contenido estático.

---

## Octavo concepto: secretos no van en la imagen

Docker es muy explícito con esto:
`ARG` y `ENV` son inapropiados para secretos porque terminan expuestos en la imagen final. citeturn337896search16

### Qué alternativas documenta Docker
- **build secrets** o **SSH mounts** para secretos necesarios durante el build citeturn337896search1
- **Docker secrets** para gestión de secretos en runtime (por ejemplo en Swarm) citeturn337896search3

La enseñanza útil es muy clara:

> si el dato es secreto,  
> no debería quedar baked-in en la imagen.

---

## Un ejemplo de mala idea

```Dockerfile
ARG NPM_TOKEN=mi-token
ENV DB_PASSWORD=supersecreto
```

Aunque “funcione”, Docker advierte justamente que esos mecanismos exponen el valor en la imagen final o su metadata. citeturn337896search16

La solución sana es otra:
- build secret si lo necesitás durante el build
- mecanismo de secrets/runtime adecuado si lo necesitás al correr

---

## Noveno concepto: root filesystem read-only

Docker documenta la opción `--read-only` en `docker run`, que monta el root filesystem del contenedor como read-only. citeturn471965search13

### Qué enseñanza deja esto
- refuerza la idea de imagen inmutable
- te obliga a pensar explícitamente dónde se puede escribir
- vuelve más visibles los lugares donde tu app realmente necesita escritura

No siempre es el primer paso a dar.
Pero conceptualmente te empuja a un diseño mucho más limpio.

---

## Qué hace falta para usar bien un rootfs read-only

Normalmente hace falta preparar:

- directorios persistentes como volúmenes
- directorios temporales como `tmpfs`
- rutas de logs o uploads fuera del rootfs si aplica

O sea:
**read-only no es magia**.
Es una mejora que se vuelve fuerte cuando la runtime ya estaba bien separada de sus datos vivos.

---

## Un patrón bastante sano

Podés pensar así:

### Imagen
- artefacto final
- dependencias
- configuración estática no sensible
- usuario final
- healthcheck

### Volumen
- datos persistentes
- write-heavy
- uploads
- base de datos

### tmpfs
- temporales
- scratch
- datos sensibles efímeros

### Secret management
- credenciales reales
- tokens
- claves

Esta clasificación sola ya ordena muchísimo el diseño.

---

## Qué no tenés que confundir

### Writable layer no es persistencia seria
Docker documenta que se pierde al destruir el contenedor. citeturn471965search1turn471965search5

### Volumen no es lo mismo que bind mount
Uno es Docker-managed; el otro depende del host. citeturn337896search2turn337896search10

### tmpfs no es persistencia
Justamente vive en memoria y desaparece al detener el contenedor. citeturn471965search2

### `ARG` y `ENV` no son mecanismos de secretos
Docker lo desaconseja explícitamente. citeturn337896search16

---

## Error común 1: dejar uploads o datos valiosos en la writable layer del contenedor

Eso suele terminar mal cuando el contenedor se recrea.

---

## Error común 2: hornear secretos en la imagen “porque era más simple”

Docker lo desaconseja de forma explícita. citeturn337896search16turn337896search1

---

## Error común 3: escribir muchísimo en la writable layer aunque el caso pedía volumen

Eso suele ser peor en persistencia y también en performance. citeturn471965search4turn471965search6

---

## Error común 4: no separar temporales de persistencia real

Ahí terminás tratando todo igual cuando no lo es.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Respondé con tus palabras:

- qué diferencia hay entre las capas de imagen y la writable layer
- por qué la writable layer no es una buena estrategia de persistencia seria
- qué clase de datos sí podría tolerarse ahí

### Ejercicio 2
Compará estos destinos para un dato:

- writable layer
- volumen
- tmpfs

Respondé:

- cuándo usarías cada uno
- cuál elegirías para una base
- cuál elegirías para temporales
- cuál elegirías para un upload que debe sobrevivir al contenedor

### Ejercicio 3
Respondé además:

- por qué `ARG` y `ENV` no son adecuados para secretos
- qué alternativa documenta Docker para secretos de build
- qué alternativa documenta Docker para secretos de runtime

### Ejercicio 4
Imaginá una app que necesita:
- un artefacto final
- una carpeta `/uploads`
- una carpeta temporal de trabajo
- credenciales para hablar con un servicio externo

Respondé:

- qué parte pondrías en la imagen
- qué parte mandarías a volumen
- qué parte mandarías a tmpfs
- qué parte no debería quedar baked-in

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué dato hoy estás dejando vivir en el lugar equivocado
- si hoy tu app escribe demasiado en la writable layer
- si algún secreto hoy está demasiado cerca de la imagen
- qué directorio te convendría mover a volumen
- qué directorio te convendría tratar como temporal
- qué cambio concreto harías primero para separar mejor build, runtime y datos vivos

No hace falta escribir todavía tu stack final real.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la frontera entre artefacto inmutable y estado vivo?
- ¿en qué proyecto tuyo hoy los uploads o caches están en el lugar equivocado?
- ¿qué dato te parece más natural mover a volumen?
- ¿qué dato te parece más natural mandar a tmpfs?
- ¿qué mejora concreta te gustaría notar al no hornear ni persistir de más?

Estas observaciones valen mucho más que memorizar banderas.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si un dato debe sobrevivir al contenedor, probablemente me conviene usar un ________.  
> Si un dato es temporal y no quiero persistirlo, probablemente me conviene usar ________.  
> Si un valor es secreto, probablemente no debería dejarlo en ________ ni en ________.  
> Si quiero reforzar que el root filesystem del contenedor no se escriba, probablemente me conviene usar `--________`.

Y además respondé:

- ¿por qué este tema impacta tanto en diseño profesional de runtime?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no mezclar imagen con datos vivos y secretos?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- separar mucho mejor imagen inmutable de datos vivos de runtime
- decidir cuándo usar writable layer, volumen o tmpfs
- evitar meter secretos dentro de la imagen
- pensar la runtime con mucha más claridad respecto a persistencia y mutabilidad
- diseñar contenedores bastante más prolijos y más seguros

---

## Resumen del tema

- Las capas de imagen son de solo lectura e inmutables; por defecto, lo que el contenedor escribe va a una writable layer efímera. citeturn471965search1turn471965search0
- La writable layer no persiste al destruir el contenedor y no es la mejor opción para datos persistentes o write-heavy. citeturn471965search1turn471965search5turn471965search6
- Los volúmenes son el mecanismo preferido para datos persistentes generados y usados por contenedores. citeturn337896search2turn471965search4
- `tmpfs` vive en memoria y es útil para temporales o datos sensibles efímeros. citeturn471965search2
- Docker advierte que `ARG` y `ENV` son inapropiados para secretos y recomienda build secrets o secretos de runtime según el caso. citeturn337896search16turn337896search1turn337896search3
- `--read-only` ayuda a reforzar una runtime más inmutable cuando preparás correctamente las rutas de escritura necesarias. citeturn471965search13
- Este tema te deja una base mucho más clara para decidir qué debe ir en la imagen y qué debe vivir fuera de ella.

---

## Próximo tema

En el próximo tema vas a seguir avanzando hacia el cierre del roadmap con una práctica integrada:

- imagen inmutable
- no root
- healthcheck
- puertos mínimos
- datos vivos fuera de la imagen
- y un stack pequeño pero bastante más profesional de punta a punta
