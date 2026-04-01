---
title: "Práctica integrada de hardening: usuario no-root, root filesystem controlado y mounts explícitos"
description: "Tema 76 del curso práctico de Docker: una práctica integrada donde combinás USER no-root, ownership correcto, read_only, tmpfs y mounts explícitos para construir un servicio mucho más deliberado, con menos privilegios y menos superficie de escritura."
order: 76
module: "Elegir bases e imágenes con criterio"
level: "intermedio"
draft: false
---

# Práctica integrada de hardening: usuario no-root, root filesystem controlado y mounts explícitos

## Objetivo del tema

En este tema vas a:

- juntar en una sola práctica varias ideas del bloque de hardening básico
- ejecutar el proceso final como usuario no-root
- dejar ownership correcto en archivos relevantes
- usar `read_only` para controlar el root filesystem
- usar `tmpfs`, volúmenes y mounts explícitos donde realmente haga falta escribir
- pensar el contenedor como algo más deliberado y menos permisivo

La idea es cerrar este mini bloque de hardening con una práctica concreta donde el servicio ya no se vea “abierto por defecto”, sino más restringido y razonable.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. partir de una imagen que “funciona” pero es demasiado permisiva
2. mejorar el Dockerfile con `USER` y ownership correcto
3. mejorar el `compose.yaml` con `read_only`
4. declarar puntos de escritura legítimos con `tmpfs` o volúmenes
5. revisar qué parte del contenedor realmente necesita ser mutable
6. cerrar el bloque con una imagen y un servicio bastante más endurecidos

---

## Idea central que tenés que llevarte

En los temas anteriores viste dos decisiones muy importantes:

- quién ejecuta el proceso
- dónde puede escribir el contenedor

Este tema las junta en una sola práctica con una idea muy clara:

> endurecer un contenedor no es una única bandera mágica,  
> sino combinar varias decisiones pequeñas que juntas reducen privilegios y superficies innecesarias.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker recomienda usar `USER` cuando el servicio puede correr sin privilegios, y sugiere considerar UID/GID explícitos si la identidad importa. También documenta `COPY --chown`, aclarando que sin esa opción los archivos copiados quedan con UID/GID 0. Compose documenta `read_only` para crear el contenedor con filesystem de solo lectura, y `tmpfs` para crear mounts temporales en memoria. Docker explica además que por defecto el contenedor escribe en una writable layer por encima de capas inmutables, que los volúmenes son la opción correcta para persistencia o escrituras intensivas, y que los bind mounts tienen acceso de escritura al host por defecto salvo que los montes en modo `readonly`. En hardening, Docker remarca que reducir writable surfaces y aplicar least privilege forma parte del endurecimiento de la imagen y del contenedor. citeturn731592search3turn602475view1turn394900view0turn394900view1turn731592search11turn784042view2turn207487search0turn784042view6turn763390view2

---

## Escenario del tema

Vas a imaginar una aplicación web simple que:

- sirve una app Node pequeña
- necesita leer su código y configuración
- usa `/tmp` para algún estado efímero
- no debería escribir libremente sobre todo el root filesystem
- y no necesita correr como root

Este es un caso muy bueno para practicar una imagen más deliberada.

---

## Primera versión: funciona, pero es demasiado permisiva

Imaginá este Dockerfile:

```Dockerfile
FROM node:22
WORKDIR /app
COPY . .
CMD ["node", "server.js"]
```

Y este Compose:

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
```

---

## Qué problema tiene esta primera versión

Puede funcionar, sí.

Pero deja demasiadas cosas abiertas:

- el proceso probablemente corre como root
- los archivos copiados quedaron como root
- el root filesystem sigue escribible
- no hay separación clara entre escritura temporal y persistente
- el contenedor puede modificar más de lo que realmente necesita

Este es un muy buen ejemplo de “funciona”, pero sin mínimos privilegios ni superficies bien controladas.

---

## Paso 1: mejorar la identidad del proceso

Ahora imaginá esta versión del Dockerfile:

```Dockerfile
FROM node:22

WORKDIR /app

RUN groupadd -g 1001 appgroup &&     useradd --no-log-init -u 1001 -g appgroup appuser

COPY package*.json ./
RUN npm install

COPY --chown=appuser:appgroup . .

USER appuser

CMD ["node", "server.js"]
```

---

## Qué mejora introduce esta versión

Introduce varias mejoras concretas:

- el proceso final ya no corre como root
- la identidad del usuario es explícita y más predecible
- los archivos de la app quedan con ownership correcto
- la imagen deja mucho más clara su intención de mínimos privilegios

Docker recomienda justamente usar `USER` cuando el servicio puede correr sin privilegios, y documenta `COPY --chown` para no dejar los archivos como root. citeturn731592search3turn602475view1

---

## Qué sigue faltando

Aunque esta versión mejora muchísimo la identidad del proceso, todavía deja otra pregunta abierta:

> ¿de verdad este contenedor necesita escribir libremente sobre todo su root filesystem?

Ahí entra la segunda parte del hardening.

---

## Paso 2: controlar la superficie de escritura

Ahora imaginá este `compose.yaml`:

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    read_only: true
    tmpfs:
      - /tmp
      - /run
```

Compose documenta `read_only` para crear el contenedor con filesystem de solo lectura, y `tmpfs` para montar un filesystem temporal en memoria. citeturn394900view0turn394900view1

---

## Cómo se lee esta mejora

La lectura conceptual sería:

- el root filesystem del contenedor ya no debería modificarse libremente
- `/tmp` y `/run` quedan como lugares explícitos para escritura temporal
- cualquier necesidad de persistencia o escritura extra ahora tendría que declararse de forma más consciente

Esto cambia muchísimo la postura del servicio.

---

## Qué problema resuelve `read_only`

`read_only` ayuda a reducir writable surfaces.

Docker documenta que endurecer una imagen y su uso implica justamente reducir superficies de escritura y evitar cambios en runtime cuando no hacen falta. citeturn763390view2

En la práctica, te ayuda a:

- evitar escrituras accidentales sobre el root filesystem
- hacer más visibles las necesidades reales de escritura
- alinear mejor la idea de “imagen inmutable”
- disminuir comportamientos “abiertos por defecto”

---

## Qué problema resuelve `tmpfs`

`tmpfs` resuelve el caso de la escritura **temporal** que no debería persistir.

Docker explica que `tmpfs` crea un filesystem temporal fuera de la writable layer del contenedor y lo elimina al detenerlo. citeturn731592search2turn394900view1

Eso lo hace ideal para:

- archivos temporales
- sockets
- caches efímeras
- estado transitorio que no querés persistir

---

## Paso 3: separar persistencia real

Imaginá ahora que la app necesita persistir uploads o datos generados.

En vez de dejarlos caer en la writable layer, sería más sano declarar algo así:

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    read_only: true
    tmpfs:
      - /tmp
      - /run
    volumes:
      - app-data:/app/data

volumes:
  app-data:
```

Docker documenta que los volúmenes son la opción correcta para persistencia y para escrituras intensivas. citeturn207487search0turn784042view2

---

## Cómo se lee esta mejora

La lectura conceptual sería:

- el root filesystem sigue controlado
- lo temporal va a `tmpfs`
- lo persistente va a un volumen explícito
- la writable layer ya no carga con responsabilidades que no le corresponden

Esto ya se parece mucho más a un servicio bien pensado.

---

## Paso 4: mounts read-only del host cuando haga falta

Si además querés montar configuración o contenido del host, podés hacerlo en modo read-only.

Por ejemplo:

```yaml
services:
  app:
    build: .
    read_only: true
    tmpfs:
      - /tmp
    volumes:
      - ./config:/app/config:ro
      - app-data:/app/data
```

Docker advierte que los bind mounts tienen write access al host por defecto, pero soportan `readonly` o `ro`. citeturn784042view6

Esto es muy útil cuando:

- el contenedor debe leer algo del host
- pero no debería modificarlo

---

## Stack final integrado de la práctica

Un ejemplo integrado y razonable podría quedar así:

### Dockerfile

```Dockerfile
FROM node:22

WORKDIR /app

RUN groupadd -g 1001 appgroup &&     useradd --no-log-init -u 1001 -g appgroup appuser

COPY package*.json ./
RUN npm install

COPY --chown=appuser:appgroup . .

USER appuser

CMD ["node", "server.js"]
```

### compose.yaml

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    read_only: true
    tmpfs:
      - /tmp
      - /run
    volumes:
      - ./config:/app/config:ro
      - app-data:/app/data

volumes:
  app-data:
```

---

## Qué gana este stack final

Gana varias cosas al mismo tiempo:

- el proceso final corre con menos privilegios
- los archivos de la app tienen ownership razonable
- el root filesystem queda controlado
- la escritura temporal va a `tmpfs`
- la persistencia real va a volumen
- la configuración del host entra como read-only

Esto ya se ve muchísimo menos permisivo que el punto de partida.

---

## Qué te enseña realmente esta práctica

Te enseña a pensar un contenedor así:

- identidad del proceso explícita
- filesystem más cercano a inmutable
- puntos de escritura declarados
- persistencia sacada del layer efímero
- mounts más restringidos

Ese cambio mental es muy importante.
Porque te saca de la lógica de:

> “dejo todo abierto y después veo”

y te lleva a algo bastante más profesional:

> “declaro exactamente qué necesita el servicio para correr y nada mucho más”.

---

## Qué no tenés que confundir

### `read_only` no significa que el contenedor ya no pueda escribir en ningún lado
Puede seguir escribiendo en volúmenes, bind mounts o `tmpfs` declarados explícitamente. citeturn394900view0turn394900view1

### `tmpfs` no reemplaza a la persistencia
Justamente es temporal y se pierde al parar el contenedor. citeturn731592search2

### Volumen no es lo mismo que writable layer
El volumen persiste; la writable layer no es el lugar ideal para datos duraderos. citeturn784042view2turn207487search0

### No-root y root filesystem controlado se complementan
No resuelven exactamente lo mismo.

---

## Error común 1: pasar a no-root pero seguir dejando todo el filesystem escribible

Eso mejora una parte, pero deja otra superficie abierta sin necesidad.

---

## Error común 2: activar `read_only` sin prever `/tmp`, `/run` o rutas de escritura legítimas

La idea no es romper la app, sino hacer explícitas esas rutas.

---

## Error común 3: dejar persistencia real en la writable layer

Docker explica que esa no es la herramienta correcta para persistencia o sharing. citeturn784042view2

---

## Error común 4: montar configuración del host en modo escritura solo por costumbre

Si el contenedor solo necesita leerla, `ro` suele ser mucho más sano. citeturn784042view6

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Compará mentalmente estas dos versiones.

#### Versión A
```Dockerfile
FROM node:22
WORKDIR /app
COPY . .
CMD ["node", "server.js"]
```

#### Versión B
```Dockerfile
FROM node:22

WORKDIR /app

RUN groupadd -g 1001 appgroup &&     useradd --no-log-init -u 1001 -g appgroup appuser

COPY package*.json ./
RUN npm install

COPY --chown=appuser:appgroup . .

USER appuser

CMD ["node", "server.js"]
```

Respondé:

- qué mejora introduce la versión B
- por qué tiene más mínimos privilegios
- qué papel cumple `COPY --chown`

### Ejercicio 2
Ahora compará estos dos Compose.

#### Versión A
```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
```

#### Versión B
```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    read_only: true
    tmpfs:
      - /tmp
      - /run
    volumes:
      - ./config:/app/config:ro
      - app-data:/app/data

volumes:
  app-data:
```

Respondé:

- qué gana la versión B
- qué rol cumple `read_only`
- qué rol cumple `tmpfs`
- qué rol cumple el volumen
- qué rol cumple el bind mount `ro`

### Ejercicio 3
Respondé además:

- por qué esta práctica es más segura que dejar todo root y escribible
- qué parte del diseño te parece más importante: identidad del proceso o control de escritura
- por qué en realidad ambas se complementan

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- si el proceso final corre hoy como root o no
- si el root filesystem realmente necesita seguir escribible
- qué rutas podrían pasar a `tmpfs`
- qué datos deberían ir sí o sí a un volumen
- qué mounts del host podrías volver de solo lectura
- qué cambio concreto harías primero para endurecerlo sin romper el flujo

No hace falta escribir todavía el Dockerfile o Compose final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la relación entre identidad del proceso y superficies de escritura?
- ¿qué servicio tuyo hoy se ve más permisivo de lo que debería?
- ¿qué ruta de tus contenedores hoy probablemente está escribible “porque sí”?
- ¿qué mounts del host podrías restringir más?
- ¿qué mejora concreta te gustaría notar al volver un servicio más deliberado?

Estas observaciones valen mucho más que memorizar opciones de Compose.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero bajar privilegios del proceso final, probablemente me conviene usar ________.  
> Si quiero que el root filesystem no quede abierto por defecto, probablemente me conviene usar ________.  
> Si necesito escritura temporal no persistente, probablemente me conviene usar ________.  
> Si necesito persistencia real, probablemente me conviene usar ________.  
> Si el contenedor solo debe leer algo del host, probablemente me conviene montarlo en modo ________.

Y además respondé:

- ¿por qué esta práctica te parece más cercana a un contenedor “deliberado”?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no dejar root y escritura abierta más de lo necesario?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- combinar `USER`, ownership correcto, `read_only`, `tmpfs` y mounts explícitos en una misma práctica
- distinguir mejor identidad del proceso, persistencia y escritura temporal
- endurecer un servicio sin volverlo inmanejable
- declarar con más precisión qué necesita escribir realmente tu contenedor
- pensar una imagen y un servicio con bastante más criterio de hardening

---

## Resumen del tema

- Docker recomienda usar `USER` cuando el servicio puede correr sin privilegios. citeturn731592search3
- `COPY --chown` evita dejar archivos como root y ayuda a que el proceso no-root tenga ownership correcto. citeturn602475view1
- Compose documenta `read_only` para crear el contenedor con filesystem de solo lectura. citeturn394900view0
- `tmpfs` sirve para escrituras temporales no persistentes fuera de la writable layer. citeturn731592search2turn394900view1
- Los volúmenes son la opción correcta para persistencia real y los bind mounts pueden montarse en modo `ro` cuando solo querés lectura. citeturn207487search0turn784042view6
- Hardening también implica reducir writable surfaces y evitar drift en runtime. citeturn763390view2
- Esta práctica te deja una forma bastante más madura de diseñar un contenedor con menos privilegios y menos superficie de escritura.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque con una capa todavía más operativa:

- capacidades
- privilegios extra
- qué no agregar
- y cómo evitar contenedores que reciben más permisos del runtime de los que realmente necesitan
