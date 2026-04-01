---
title: "Práctica integrada de storage: bind mount para código y named volume para datos persistentes"
description: "Tema 93 del curso práctico de Docker: una práctica integrada donde combinás bind mounts para desarrollo con código del host y named volumes para persistencia real de datos, usando un stack app + db y aclarando por qué cada tipo de mount resuelve un problema distinto."
order: 93
module: "Bind mounts, named volumes y persistencia sin mezclar usos"
level: "intermedio"
draft: false
---

# Práctica integrada de storage: bind mount para código y named volume para datos persistentes

## Objetivo del tema

En este tema vas a:

- juntar en una sola práctica varias ideas del bloque de storage
- usar bind mount para compartir código del host con el contenedor
- usar named volume para persistir datos reales de la base
- evitar mezclar desarrollo editable con persistencia administrada por Docker
- entender mucho mejor por qué cada tipo de mount resuelve un problema distinto

La idea es cerrar este bloque con una práctica concreta donde se vea clarísimo qué va montado desde tu máquina y qué debe quedar persistido como dato del contenedor.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. partir de un stack simple donde todo está montado de forma poco clara
2. usar bind mount para el código de desarrollo
3. usar named volume para la base de datos
4. entender qué gana cada parte con esa decisión
5. evitar errores comunes como montar datos persistentes donde solo querías editar código
6. cerrar el bloque con un stack mucho más sano y razonable

---

## Idea central que tenés que llevarte

En este bloque ya viste que bind mounts y volumes no son “dos sintaxis para lo mismo”.

Este tema junta esa idea en una práctica muy concreta:

> el código que querés editar desde el host suele vivir mejor en un bind mount;  
> los datos que querés preservar más allá del contenedor suelen vivir mejor en un named volume.

Cuando aplicás esa separación, el stack se vuelve mucho más claro.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker explica que los bind mounts enlazan una ruta del host con una ruta del contenedor y son muy útiles cuando necesitás que host y contenedor accedan a los mismos archivos, como pasa en desarrollo. También documenta que un bind mount puede ocultar datos que ya existían en la ruta del contenedor mientras el mount esté activo. Por otro lado, Docker define los volumes como almacenamiento persistente administrado por Docker y los recomienda como el mecanismo preferido para datos generados y usados por contenedores. Compose documenta además la declaración top-level `volumes` para configurar named volumes reutilizables entre servicios. Finalmente, la documentación oficial del Postgres Docker Official Image para versiones 18 y superiores indica que el volumen debe montarse en `/var/lib/postgresql`, no en la ruta clásica anterior. citeturn104826search0turn104826search2turn104826search1turn104826search10turn104826search9

---

## Escenario del tema

Vas a imaginar este stack simple:

- `app`: una aplicación que querés desarrollar viendo cambios del host
- `db`: una base PostgreSQL cuyos datos querés conservar

Querés que:

- el código de `app` se edite desde tu máquina y el contenedor lo vea enseguida
- los datos de `db` persistan aunque destruyas o recrees el contenedor
- cada necesidad use el tipo de mount correcto
- no termines usando bind mounts para todo por inercia

Este es un caso excelente para fijar el criterio.

---

## Primera versión: funciona, pero mezcla usos

Imaginá este Compose:

```yaml
services:
  app:
    image: miusuario/app:dev
    volumes:
      - .:/app

  db:
    image: postgres:18
    volumes:
      - ./postgres-data:/var/lib/postgresql
```

---

## Qué problema tiene esta primera versión

Puede funcionar, sí.

Pero mezcla dos necesidades distintas bajo una misma lógica de “montá una carpeta del host y listo”.

Eso trae varios problemas posibles:

- `app` y `db` parecen usar el mismo enfoque aunque no resuelven el mismo caso
- la base queda acoplada a una ruta concreta del host
- la persistencia de `db` ya no queda administrada por Docker
- se pierde la diferencia entre “quiero editar desde el host” y “quiero persistencia sana de datos”

No está “roto”.
Pero todavía no expresa bien qué problema resuelve cada mount.

---

## Paso 1: bind mount para el código de la app

Ahora dejá `app` así:

```yaml
services:
  app:
    image: miusuario/app:dev
    working_dir: /app
    volumes:
      - .:/app
```

---

## Qué mejora introduce esta decisión

Introduce algo muy importante:

- el contenedor ve exactamente tu código local
- si guardás un archivo en tu host, la app dentro del contenedor puede verlo enseguida
- esto encaja perfecto con watchers, hot reload o ciclos rápidos de desarrollo

Docker documenta justamente este caso como uno de los grandes valores del bind mount: compartir archivos entre host y contenedor en tiempo real, especialmente en desarrollo. citeturn104826search0turn104826search10

---

## Cómo se lee esta parte

La lectura conceptual sería:

- `app` necesita trabajar sobre el código que vive en tu máquina
- por eso el host y el contenedor comparten el mismo árbol de archivos
- el bind mount encaja perfecto porque el problema no es persistir datos internos de Docker
- el problema es editar código desde el host

Este es exactamente el territorio natural del bind mount.

---

## Paso 2: named volume para la base

Ahora cambiá `db` a algo así:

```yaml
services:
  db:
    image: postgres:18
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: mysecretpassword
    volumes:
      - db-data:/var/lib/postgresql

volumes:
  db-data:
```

---

## Qué mejora introduce esta decisión

Introduce otra cosa muy distinta:

- los datos de PostgreSQL ya no dependen de una carpeta concreta del host
- la persistencia queda administrada por Docker
- podés destruir y recrear el contenedor sin perder la data, mientras el volume siga existiendo
- el uso ya encaja mucho mejor con lo que Docker recomienda para datos generados y usados por contenedores

Docker documenta que los volumes son el mecanismo preferido para persistencia real de datos de contenedores. citeturn104826search2turn104826search5

---

## Un detalle importante con PostgreSQL 18

La documentación actual del Postgres Official Image indica algo importante para 18 y superiores:

- el `VOLUME` cambió a `/var/lib/postgresql`
- y los mounts/volumes deberían apuntar a esa ruta actualizada citeturn104826search9

Por eso, en este tema, el ejemplo usa:

```yaml
- db-data:/var/lib/postgresql
```

y no la ruta clásica vieja que muchos ejemplos usaban en versiones anteriores.

Este detalle vale muchísimo para no arrastrar ejemplos desactualizados.

---

## Stack final de la práctica

Un resultado integrado y sano podría quedar así:

```yaml
services:
  app:
    image: miusuario/app:dev
    working_dir: /app
    volumes:
      - .:/app

  db:
    image: postgres:18
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: mysecretpassword
    volumes:
      - db-data:/var/lib/postgresql

volumes:
  db-data:
```

---

## Cómo se lee este stack final

La lectura conceptual sería:

- `app` usa bind mount porque querés desarrollar con tu código local
- `db` usa named volume porque querés persistencia real de datos
- host y contenedor comparten el código de `app`
- Docker administra la persistencia de `db`
- ya no estás usando “un mount cualquiera” para resolver dos problemas distintos

Esto es justo lo que buscaba enseñarte el bloque.

---

## Qué gana esta práctica frente a “todo con bind mounts”

Gana varias cosas al mismo tiempo:

- menos acoplamiento innecesario de la base al host
- más claridad sobre qué es código del host y qué es dato persistente del contenedor
- una persistencia más alineada con lo que Docker recomienda
- mejor separación entre desarrollo y estado persistente

Esto vuelve al stack bastante más razonable.

---

## Qué pasa si montaras un bind mount sobre una ruta donde la imagen ya tenía contenido

Docker documenta que, cuando hacés un bind mount sobre una ruta del contenedor que ya tenía archivos, esos archivos quedan ocultos mientras el mount está activo. citeturn104826search0

Esto importa mucho porque explica errores típicos como:

- “copié algo en `/app` en la imagen y no lo veo”
- “la carpeta parece vacía o distinta”
- “desapareció lo que venía en la imagen”

A veces no desapareció.
Simplemente quedó tapado por el bind mount del host.

---

## Qué te enseña realmente esta práctica

Te enseña a pensar storage así:

- código editable desde el host → bind mount
- datos persistentes del contenedor → named volume

Esa separación mental ya evita una enorme cantidad de errores de diseño.

También te enseña otra idea importante:
**no todo lo que persiste debería depender de una carpeta elegida a mano en tu máquina**.

---

## Qué no tenés que confundir

### El bind mount no es “más persistente” por apuntar al host
Simplemente comparte una ruta concreta del host con el contenedor. citeturn104826search0turn104826search4

### El named volume no es “mejor para desarrollo con código local”
Ahí normalmente querés bind mount. citeturn104826search10

### El volume no significa que no exista físicamente en el host
Sí existe, pero lo administra Docker, no vos con una ruta elegida manualmente. citeturn104826search2turn104826search3

### El mount correcto depende del problema
No hay uno “ganador” universal.

---

## Error común 1: usar bind mount para la base solo por costumbre

Docker suele preferir volumes para datos persistentes generados y usados por contenedores. citeturn104826search2turn104826search3

---

## Error común 2: usar named volume para código fuente que querés editar desde el host

Ahí normalmente querías un bind mount.

---

## Error común 3: ignorar que un bind mount puede ocultar contenido preexistente del contenedor

Eso explica muchos comportamientos raros. citeturn104826search0

---

## Error común 4: copiar ejemplos viejos de PostgreSQL con rutas de volumen desactualizadas para la versión 18+

La documentación actual del Official Image ya marca el cambio a `/var/lib/postgresql`. citeturn104826search9

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Tomá este stack final:

```yaml
services:
  app:
    image: miusuario/app:dev
    working_dir: /app
    volumes:
      - .:/app

  db:
    image: postgres:18
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: mysecretpassword
    volumes:
      - db-data:/var/lib/postgresql

volumes:
  db-data:
```

### Ejercicio 2
Respondé con tus palabras:

- cuál servicio usa bind mount
- cuál servicio usa named volume
- por qué `app` usa una solución distinta de `db`
- qué gana `app` al compartir el código con el host
- qué gana `db` al usar un volume administrado por Docker

### Ejercicio 3
Respondé además:

- por qué no te parece sano usar bind mount para todo
- qué podría pasar si montás el host sobre una ruta donde la imagen ya tenía contenido
- qué detalle importante cambia en PostgreSQL 18 respecto a la ruta del volumen

### Ejercicio 4
Imaginá que además querés inspeccionar los datos de PostgreSQL “a mano” desde el host en una ruta exacta.
Respondé:

- por qué eso podría tentarte hacia un bind mount
- por qué, aun así, named volume sigue siendo una decisión muy razonable para persistencia normal

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué parte del stack hoy es claramente “código que vive en tu host”
- qué parte del stack hoy es claramente “dato que debería persistir aunque el contenedor muera”
- si hoy estás usando una sola estrategia para ambas cosas
- qué servicio te gustaría corregir primero
- qué decisión de storage te gustaría volver más clara y más sana

No hace falta escribir todavía el `compose.yaml` final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre desarrollo con código montado y persistencia real de datos?
- ¿qué servicio tuyo hoy está usando el tipo de mount equivocado?
- ¿qué parte del stack hoy depende demasiado de una ruta del host?
- ¿qué parte del tema de ocultamiento por bind mount te parece más fácil de olvidar?
- ¿qué mejora concreta te gustaría notar al separar mejor estos dos casos?

Estas observaciones valen mucho más que memorizar YAML.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero trabajar con archivos del host dentro del contenedor, probablemente me conviene usar un ________ mount.  
> Si quiero persistir datos del contenedor de una forma más alineada con Docker, probablemente me conviene usar un named ________.  
> Si monto el host sobre una ruta que ya tenía contenido en el contenedor, ese contenido queda ________ mientras el mount esté activo.

Y además respondé:

- ¿por qué esta práctica te parece mucho más clara que usar una sola estrategia para todo?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no mezclar código editable con datos persistentes del contenedor?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- combinar bind mounts y named volumes en una misma práctica sin mezclar usos
- decidir mejor cuándo compartir archivos del host y cuándo persistir datos administrados por Docker
- entender mejor por qué una base suele beneficiarse de volumes
- evitar el error de usar bind mounts para cualquier persistencia por costumbre
- pensar storage del stack de una forma bastante más madura

---

## Resumen del tema

- Los bind mounts enlazan rutas concretas del host con rutas del contenedor y son excelentes para desarrollo con archivos compartidos. citeturn104826search0turn104826search10
- Los volumes son almacenamiento persistente administrado por Docker y suelen ser la opción preferida para datos generados y usados por contenedores. citeturn104826search2turn104826search3turn104826search5
- Compose permite definir named volumes reutilizables en el top-level `volumes:`. citeturn104826search1
- Un bind mount sobre una ruta existente del contenedor oculta el contenido previo mientras está activo. citeturn104826search0
- Para PostgreSQL 18 y superiores, la ruta de mounts/volumes recomendada cambió a `/var/lib/postgresql`. citeturn104826search9
- Esta práctica te deja una forma mucho más clara de combinar desarrollo con código local y persistencia real de datos sin mezclar herramientas.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque con otra capa muy importante:

- inicialización de datos
- seeds
- scripts de arranque
- y cómo pensar qué se monta, qué se persiste y qué se crea automáticamente al iniciar un servicio
