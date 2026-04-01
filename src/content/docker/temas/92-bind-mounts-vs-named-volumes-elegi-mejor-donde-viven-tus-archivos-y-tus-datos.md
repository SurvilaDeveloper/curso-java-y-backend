---
title: "Bind mounts vs named volumes: elegí mejor dónde viven tus archivos y tus datos"
description: "Tema 92 del curso práctico de Docker: cómo distinguir bind mounts y named volumes, cuándo conviene usar cada uno, qué trade-offs hay entre desarrollo, persistencia y acoplamiento al host, y cómo evitar errores comunes al decidir dónde viven archivos y datos."
order: 92
module: "Bind mounts, named volumes y persistencia sin mezclar usos"
level: "intermedio"
draft: false
---

# Bind mounts vs named volumes: elegí mejor dónde viven tus archivos y tus datos

## Objetivo del tema

En este tema vas a:

- distinguir claramente bind mounts y named volumes
- entender cuándo conviene uno y cuándo conviene el otro
- pensar mejor persistencia, desarrollo local y acoplamiento al host
- evitar usar la misma solución para problemas distintos
- construir un criterio mucho más claro para decidir dónde viven archivos y datos

La idea es que dejes de pensar “montaje = montaje” y empieces a ver que bind mounts y volumes resuelven necesidades diferentes.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender qué resuelven en general los mounts
2. ver qué caracteriza a un bind mount
3. ver qué caracteriza a un named volume
4. comparar desarrollo local vs persistencia real
5. construir una regla práctica para elegir mejor según el caso

---

## Idea central que tenés que llevarte

Docker te da varias formas de trabajar con archivos y datos fuera de la writable layer del contenedor.

Pero no todas sirven para lo mismo.

La documentación oficial actual de Docker lo resume muy bien: los dos mecanismos principales para persistir o compartir archivos son **bind mounts** y **volumes**. Docker explica que los bind mounts crean un enlace directo entre una ruta del host y el contenedor, mientras que los volumes son administrados por Docker y son el mecanismo preferido para datos persistentes generados y usados por contenedores. citeturn365733search4turn365733search3turn365733search9turn365733search11

Dicho simple:

> si querés compartir archivos del host con el contenedor, pensá primero en bind mounts.  
> si querés persistencia administrada por Docker, pensá primero en named volumes.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker deja varias ideas muy claras para este tema:

- los bind mounts crean un vínculo directo entre una ruta del host y una ruta del contenedor. Son útiles cuando necesitás acceder a los archivos desde ambos lados: host y contenedor. citeturn365733search0turn365733search4turn365733search9
- los bind mounts no están aislados por Docker: procesos del host y del contenedor pueden modificar los archivos montados simultáneamente. citeturn365733search4
- los volumes son almacenamientos persistentes administrados por Docker y son el mecanismo preferido para datos generados y usados por contenedores. citeturn365733search3turn365733search1turn365733search20
- Docker recomienda volumes para datos write-intensive, persistencia real y datos que deban compartirse entre contenedores. También destaca que suelen ser más fáciles de respaldar o migrar que bind mounts. citeturn365733search3turn365733search15
- Docker documenta además que un bind mount sobre una ruta donde ya existían archivos en el contenedor **oculta** esos archivos mientras el mount esté activo. citeturn365733search0
- y en Compose, los named volumes se definen arriba en `volumes:` y luego se montan en servicios concretos. citeturn365733search1

---

## Primer concepto: qué problema resuelven los mounts en general

Cuando no querés depender de la writable layer del contenedor para guardar datos o compartir archivos, entran en juego los mounts.

Eso sirve para casos como:

- persistir datos más allá de la vida del contenedor
- compartir archivos entre host y contenedor
- compartir datos entre varios contenedores
- trabajar en desarrollo con código montado desde tu máquina

Hasta ahí, bind mounts y volumes parecen parecidos.
Pero a partir de acá sus objetivos se separan mucho.

---

## Segundo concepto: qué es un bind mount

Docker describe un bind mount como un enlace directo entre una ruta del host y una ruta del contenedor. citeturn365733search0turn365733search4

Un ejemplo conceptual sería:

```yaml
services:
  app:
    image: miusuario/app:dev
    volumes:
      - .:/app
```

### Cómo se lee
- el directorio actual del host se monta dentro de `/app`
- el contenedor ve directamente archivos del host
- si cambiás un archivo en tu máquina, el contenedor lo ve
- si el contenedor modifica esos archivos y el mount es writable, el host también lo ve

---

## Qué hace valioso a un bind mount

Su gran valor es este:

> host y contenedor comparten el mismo árbol de archivos.

Por eso Docker lo recomienda mucho para desarrollo.
La propia guía de bind mounts de Docker Workshop dice que son ideales para montar código fuente en el contenedor y ver cambios reflejados inmediatamente. citeturn365733search2

Eso es exactamente lo que suele querer alguien en desarrollo con hot reload o watchers.

---

## Cuándo suele convenir un bind mount

Suele tener mucho sentido cuando:

- querés montar tu código local dentro del contenedor
- necesitás editar archivos desde el host y que el contenedor los vea al instante
- querés compartir un archivo o carpeta exacta del host
- necesitás control explícito sobre dónde vive ese contenido en tu máquina

Este es el territorio natural del bind mount.

---

## Qué riesgo o costo trae un bind mount

También trae varios trade-offs:

- dependés de la estructura del host
- el stack queda más acoplado a rutas reales del sistema
- host y contenedor pueden tocar los mismos archivos al mismo tiempo
- podés exponer más del host de lo que querías si montás demasiado
- si montás sobre una ruta donde ya había archivos del contenedor, esos archivos quedan ocultos mientras el mount exista citeturn365733search0turn365733search4

Este último punto se olvida mucho y puede confundir bastante.

---

## El caso clásico del código en desarrollo

Imaginá esto:

```yaml
services:
  app:
    image: node:22
    working_dir: /app
    volumes:
      - .:/app
```

### Qué gana esto
- el contenedor ve tu proyecto local
- un watcher dentro del contenedor puede reaccionar a cambios del host
- no necesitás rebuild completo por cada cambio de código

Este patrón es buenísimo en desarrollo.

Pero no suele ser la mejor idea para persistencia “seria” de datos de aplicación.

---

## Tercer concepto: qué es un named volume

Docker define los volumes como almacenamiento persistente administrado por Docker. citeturn365733search3turn365733search20

En Compose, lo normal es declararlos así:

```yaml
services:
  db:
    image: postgres:18
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

---

## Cómo se lee esto

La lectura conceptual sería:

- el servicio `db` monta un volumen llamado `db-data`
- ese volumen no es “una carpeta cualquiera” elegida a mano en el host
- Docker lo administra como almacenamiento persistente del motor
- el contenedor puede destruirse y recrearse sin perder esos datos mientras el volumen siga existiendo

Este es justamente el territorio natural del volume.

---

## Qué hace valioso a un named volume

Su gran valor es este:

> los datos persisten más allá del contenedor y quedan gestionados por Docker, no atados a una ruta del host que vos elijas manualmente.

Docker destaca varias ventajas:

- son más fáciles de respaldar o migrar
- funcionan bien para compartir entre contenedores
- suelen ser la opción preferida para datos write-intensive
- están menos acoplados a la estructura del host citeturn365733search3turn365733search15

---

## Cuándo suele convenir un named volume

Suele tener mucho sentido cuando:

- querés persistir datos de una base
- querés guardar archivos generados por una app más allá del contenedor
- querés compartir un almacenamiento persistente entre contenedores
- querés evitar depender de una ruta concreta del host

Este es el territorio natural de un volume.

---

## Bind mount vs volume en una sola frase

Podrías resumirlo así:

### Bind mount
“Quiero que el contenedor vea exactamente estos archivos del host”.

### Named volume
“Quiero que Docker gestione un almacenamiento persistente para este contenedor”.

Esa diferencia mental vale oro.

---

## Cuarto concepto: no uses bind mount para todo por costumbre

Mucha gente empieza usando bind mounts para cualquier cosa porque son muy visibles y muy intuitivos.

Pero Docker es bastante claro: para datos persistentes generados y usados por contenedores, **volumes** suelen ser la opción preferida. citeturn365733search3turn365733search15

Eso significa que, si estás guardando cosas como:

- datos de PostgreSQL
- archivos internos de una app
- datos que deben sobrevivir a recreaciones del contenedor

muchas veces un named volume encaja mejor que un bind mount.

---

## Quinto concepto: bind mount y named volume no compiten por el mismo caso

No es que uno sea “mejor” siempre.

Resuelven problemas distintos.

### Desarrollo local con código editable
Bind mount suele ser excelente.

### Persistencia real de base de datos
Named volume suele ser mucho más sano.

### Carpeta del host que necesitás inspeccionar o editar manualmente
Bind mount.

### Datos generados por Docker que querés dejar administrados por Docker
Named volume.

Este mapa ya aclara muchísimo.

---

## Sexto concepto: publicar persistencia no es lo mismo que publicar acceso

Un volume persiste datos.
Un bind mount comparte archivos.
Ninguno de los dos significa automáticamente “publicar” algo hacia afuera como harías con `ports`.

Esto puede parecer obvio, pero conceptualmente ayuda mucho:
**storage y networking son capas distintas**.

---

## Un ejemplo bastante sano de desarrollo + persistencia

```yaml
services:
  app:
    image: miusuario/app:dev
    volumes:
      - .:/app

  db:
    image: postgres:18
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

### Cómo se lee
- `app` usa bind mount porque querés editar código desde tu host
- `db` usa named volume porque querés persistencia real de datos
- el stack ya refleja dos necesidades distintas con dos herramientas distintas

Este es un patrón muy sano y muy común.

---

## Qué pasa si montás sobre archivos existentes del contenedor

Docker documenta algo muy importante sobre bind mounts:
si montás una ruta del host sobre una ruta del contenedor que ya tenía archivos, esos archivos del contenedor quedan **ocultos** mientras el mount esté activo. citeturn365733search0

Esto puede explicar muchos comportamientos raros del estilo:

- “¿por qué no veo los archivos que venían en la imagen?”
- “¿por qué desapareció lo que copié en el Dockerfile?”

A veces no desapareció.
Simplemente quedó tapado por el mount.

---

## Qué no tenés que confundir

### Bind mount no es lo mismo que volume
Uno comparte una ruta concreta del host; el otro es almacenamiento administrado por Docker. citeturn365733search4turn365733search3

### Volume no significa “más visible desde el host”
Justamente suele ser menos dependiente de rutas manuales del host. citeturn365733search3

### Bind mount no es la mejor opción para todos los datos persistentes
Para datos generados y usados por contenedores, Docker suele preferir volumes. citeturn365733search3turn365733search15

### Un mount sobre una ruta existente puede ocultar lo que había dentro del contenedor
No lo olvides. citeturn365733search0

---

## Error común 1: usar bind mounts para la base por costumbre

Puede funcionar, sí.
Pero muchas veces named volume es más sano para persistencia real.

---

## Error común 2: usar named volume para código fuente que querés editar desde el host

Ahí probablemente querías bind mount.

---

## Error común 3: no pensar que host y contenedor pueden modificar el mismo bind mount

Eso puede traer comportamientos inesperados. citeturn365733search4

---

## Error común 4: montar una carpeta del host sobre `/app` o similar y sorprenderte porque “desapareció” el contenido que venía en la imagen

Docker documenta exactamente ese efecto de ocultamiento. citeturn365733search0

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Compará estos dos casos.

#### Caso A
```yaml
services:
  app:
    image: miusuario/app:dev
    volumes:
      - .:/app
```

#### Caso B
```yaml
services:
  db:
    image: postgres:18
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

### Ejercicio 2
Respondé con tus palabras:

- cuál usa bind mount
- cuál usa named volume
- cuál te parece mejor para desarrollo con código local
- cuál te parece mejor para persistencia real de datos
- por qué no conviene tratarlos como si resolvieran el mismo problema

### Ejercicio 3
Respondé además:

- qué pasa si montás un bind mount sobre una ruta que ya tenía archivos en la imagen
- qué ventaja te da que un volume esté administrado por Docker
- qué trade-off trae acoplarte a una ruta concreta del host

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué parte del stack hoy es claramente “código del host” y debería ser bind mount
- qué parte del stack hoy es claramente “dato persistente del contenedor” y debería ser volume
- si hoy estás usando una sola de las dos herramientas para todo
- qué servicio te gustaría corregir primero
- qué decisión de storage te gustaría volver más clara hoy mismo

No hace falta escribir todavía el `compose.yaml` final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre compartir archivos del host y persistir datos gestionados por Docker?
- ¿en qué proyecto tuyo hoy estás usando bind mounts donde quizá convendría un volume?
- ¿qué parte del stack se beneficiaría más de dejar de depender de rutas del host?
- ¿qué parte del tema de ocultamiento por mount te parece más fácil de olvidar?
- ¿qué mejora concreta te gustaría notar al separar mejor estos dos usos?

Estas observaciones valen mucho más que memorizar sintaxis.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero compartir una carpeta concreta del host con el contenedor, probablemente me conviene usar un ________ mount.  
> Si quiero persistir datos generados y usados por Docker de forma más sana, probablemente me conviene usar un named ________.  
> Si monto una ruta del host sobre una ruta que ya tenía contenido en el contenedor, ese contenido queda ________ mientras el mount esté activo.

Y además respondé:

- ¿por qué este tema impacta tanto en desarrollo y persistencia?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no usar la misma solución para código del host y datos persistentes?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- distinguir claramente bind mounts y named volumes
- elegir mejor entre compartir archivos del host o persistir datos administrados por Docker
- entender por qué Docker suele preferir volumes para datos persistentes de contenedores
- evitar el error de usar la misma herramienta para problemas distintos
- pensar storage del stack de una forma bastante más clara

---

## Resumen del tema

- Los dos mecanismos principales para compartir o persistir archivos son bind mounts y volumes. citeturn365733search9turn365733search11
- Los bind mounts enlazan una ruta del host con una ruta del contenedor y son ideales cuando necesitás ver los mismos archivos desde ambos lados, como en desarrollo. citeturn365733search0turn365733search2turn365733search4
- Los volumes son almacenamiento persistente administrado por Docker y suelen ser la opción preferida para datos generados y usados por contenedores. citeturn365733search1turn365733search3turn365733search20
- Docker recomienda volumes para datos write-intensive, persistencia real y datos compartidos entre contenedores. citeturn365733search3turn365733search15
- Un bind mount sobre una ruta existente en el contenedor oculta el contenido previo mientras el mount esté activo. citeturn365733search0
- Este tema te deja una base muy sólida para elegir mejor dónde viven archivos y datos dentro de tu stack.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque con una práctica integrada:

- bind mount para código
- named volume para base o datos persistentes
- un stack desarrollo + persistencia
- y una decisión mucho más clara sobre dónde conviene guardar cada cosa
