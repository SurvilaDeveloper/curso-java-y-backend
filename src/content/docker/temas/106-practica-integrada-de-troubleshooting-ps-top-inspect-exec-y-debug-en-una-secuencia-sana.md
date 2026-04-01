---
title: "Práctica integrada de troubleshooting: ps, top, inspect, exec y debug en una secuencia sana"
description: "Tema 106 del curso práctico de Docker: una práctica integrada donde combinás docker ps, docker top, docker inspect, docker exec y docker debug para diagnosticar contenedores con una secuencia clara, sin entrar a ciegas ni depender solo de intuición."
order: 106
module: "Inspección, metadata y diagnóstico con criterio"
level: "intermedio"
draft: false
---

# Práctica integrada de troubleshooting: ps, top, inspect, exec y debug en una secuencia sana

## Objetivo del tema

En este tema vas a:

- juntar en una sola práctica varias ideas del bloque de inspección y diagnóstico
- confirmar primero si un contenedor está realmente corriendo
- mirar procesos antes de entrar
- inspeccionar metadata real antes de tocar cosas
- entrar con `exec` o `compose exec` solo cuando tenga sentido
- entender cuándo `docker debug` resuelve mejor que una shell tradicional

La idea es cerrar este bloque con una secuencia concreta de troubleshooting, para que ya no entres al contenedor por reflejo ni diagnostiques por intuición.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. partir de un contenedor o servicio que “parece raro”
2. confirmar si está running con `docker ps`
3. mirar procesos con `docker top`
4. inspeccionar estado y metadata con `docker inspect`
5. entrar con `docker exec` o `docker compose exec` si todavía hace falta
6. usar `docker debug` cuando la imagen sea demasiado mínima para una shell normal

---

## Idea central que tenés que llevarte

Docker documenta que:

- `docker ps` muestra contenedores running por defecto y `docker ps -a` muestra también detenidos
- `docker top` muestra procesos dentro del contenedor
- `docker inspect` devuelve metadata detallada de bajo nivel
- `docker exec` ejecuta un comando nuevo dentro de un contenedor en ejecución
- `docker compose exec` hace lo mismo orientado a servicios Compose
- `docker debug` permite abrir una shell de depuración incluso en imágenes sin shell ni herramientas habituales

Todo eso, junto, te deja una secuencia mucho mejor que “entro al contenedor a ver qué onda”. citeturn732735search20turn732735search2turn732735search3turn732735search0turn732735search1turn732735search7

Dicho simple:

> primero confirmá y mirá desde afuera;  
> después inspeccioná;  
> y recién al final entrá si de verdad hace falta.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker deja varias ideas muy claras para este tema:

- `docker container ls` (`docker ps`) muestra contenedores running por defecto; con `-a` ves también los detenidos. citeturn732735search20turn732735search2
- `docker container top` muestra los procesos que están corriendo dentro de un contenedor. citeturn732735search2
- `docker inspect` devuelve metadata detallada en JSON por defecto. citeturn732735search3
- `docker container exec` corre un comando nuevo dentro de un contenedor running; solo funciona mientras el proceso principal siga vivo y el comando no se reinicia con el contenedor. citeturn732735search0
- `docker compose exec` es el equivalente para servicios Compose y asigna TTY por defecto. citeturn732735search1
- `docker debug` permite abrir una shell de depuración en contenedores e imágenes, incluso si no traen shell ni herramientas. citeturn732735search7

---

## Escenario del tema

Vas a imaginar este caso:

- un servicio `app` “no responde como debería”
- no sabés si el contenedor está corriendo, reiniciando o caído
- tampoco sabés si el proceso principal sigue vivo
- quizás el problema sea de mounts, de variables, de puertos o de red
- y todavía no sabés si realmente vale la pena entrar al contenedor

Este es un caso ideal para practicar una secuencia sana.

---

## Paso 1: confirmar si el contenedor está running

El primer paso razonable suele ser:

```bash
docker ps
```

o, si querés ver también los detenidos:

```bash
docker ps -a
```

Docker documenta justamente que `docker ps` muestra solo running por defecto y `-a` agrega los detenidos. citeturn732735search20turn732735search2

---

## Qué gana este paso

Gana algo muy importante:

- confirmás si realmente existe un contenedor vivo para inspeccionar o entrar
- distinguís rápido entre “el servicio está mal” y “el contenedor ni siquiera está corriendo”
- evitás intentar un `exec` sobre algo que ya no está levantado

Esto parece básico, pero te ahorra muchísimo tiempo.

---

## Paso 2: mirar procesos con `docker top`

Si el contenedor está running, el siguiente paso muy sano suele ser:

```bash
docker top mi-contenedor
```

Docker documenta este comando justamente para mostrar los procesos en ejecución dentro del contenedor. citeturn732735search2

---

## Qué te ayuda a responder `top`

Te ayuda a responder preguntas como:

- ¿el proceso principal sigue ahí?
- ¿hay más procesos de los que esperaba?
- ¿parece que el entrypoint arrancó bien?
- ¿hay algo colgado o raro sin que yo tenga que entrar todavía?

Este paso es excelente porque te da señal rápida sin meter interacción ni shell.

---

## Qué gana `top` frente a entrar directo

Gana foco.

Porque muchas veces el dato que necesitabas era solo:
- qué proceso corre
- si sigue vivo
- o si hay algo obvio en ejecución

Y para eso no hacía falta abrir una shell.

---

## Paso 3: inspeccionar metadata real con `docker inspect`

Si el contenedor sigue generando dudas, el siguiente paso sano suele ser:

```bash
docker inspect mi-contenedor
```

o directamente con `--format` si ya sabés qué querés buscar.

Docker documenta que `inspect` devuelve metadata detallada en JSON por defecto. citeturn732735search3

---

## Qué preguntas responde bien `inspect`

Por ejemplo:

- ¿el estado real es `running`, `restarting` o `exited`?
- ¿qué variables de entorno quedaron?
- ¿qué mounts reales tiene?
- ¿qué puertos están publicados?
- ¿en qué redes está?
- ¿qué imagen exacta lo creó?

Acá pasás de mirar solo “si existe” a mirar “cómo quedó realmente”.

---

## Una mini secuencia muy útil

Por ejemplo, podrías hacer:

```bash
docker inspect --format '{{.State.Status}}' mi-contenedor
docker inspect --format '{{json .Mounts}}' mi-contenedor
docker inspect --format '{{json .Config.Env}}' mi-contenedor
docker inspect --format '{{json .NetworkSettings.Ports}}' mi-contenedor
```

No hace falta memorizar esto todo de una.
Lo importante es ver que `inspect` te deja validar hipótesis concretas.

---

## Paso 4: recién ahora entrar con `docker exec`

Si todavía necesitás mirar desde adentro, ahí sí tiene sentido algo como:

```bash
docker exec -it mi-contenedor sh
```

o, si corresponde:

```bash
docker exec -it mi-contenedor bash
```

Docker documenta que `exec` corre un comando nuevo dentro de un contenedor running y que ese comando vive mientras siga corriendo el proceso principal. citeturn732735search0

---

## Qué tipo de cosas resuelve bien `exec`

Resuelve bien tareas como:

- listar archivos puntuales
- probar un comando de red desde adentro
- revisar permisos o rutas
- ejecutar una tarea administrativa puntual
- mirar el entorno real desde el interior del contenedor

Pero ahora ya entrás con una hipótesis mejor formada, no “a ver qué encuentro”.

---

## Paso 5: si trabajás con Compose, usar `docker compose exec`

Si el problema vive dentro de un stack Compose, la forma más natural suele ser:

```bash
docker compose exec app sh
```

Docker documenta que es el equivalente de `docker exec` orientado a servicios y que asigna TTY por defecto. citeturn732735search1

---

## Qué gana `compose exec`

Gana comodidad.

Porque:
- pensás por servicio
- no perseguís el nombre exacto del contenedor
- el flujo encaja mejor con `app`, `db`, `worker`, etc.

En proyectos Compose, muchas veces esta debería ser tu herramienta base.

---

## Paso 6: si no hay shell, usar `docker debug`

Acá aparece un caso muy moderno y muy real.

Puede pasar que:

```bash
docker exec -it mi-contenedor sh
```

falle porque la imagen no tiene shell ni herramientas básicas.

Docker documenta justamente `docker debug` para este caso: te da una shell de depuración incluso en contenedores o imágenes que no la traen, sin modificar la imagen. citeturn732735search7

---

## Qué problema resuelve `docker debug`

Resuelve el caso donde:

- la imagen es minimalista
- no trae `sh`, `bash`, `ps`, `curl`, etc.
- pero igual necesitás inspeccionarla con herramientas de debugging

Eso lo vuelve una capa muy útil en imágenes endurecidas o extremadamente mínimas.

---

## Stack integrado de la práctica

Imaginá este caso conceptual:

```yaml
services:
  app:
    image: miusuario/app:dev
    environment:
      DB_HOST: db
    depends_on:
      - db

  db:
    image: postgres:18
```

Y supongamos que `app` “no está funcionando bien”.

Una secuencia integrada podría ser esta:

### 1. Ver si está running
```bash
docker compose ps
```

o a nivel general:
```bash
docker ps
docker ps -a
```

### 2. Mirar procesos del contenedor real
```bash
docker top nombre-real-del-contenedor
```

### 3. Inspeccionar estado y metadata
```bash
docker inspect nombre-real-del-contenedor
```

### 4. Si todavía hace falta, entrar por servicio
```bash
docker compose exec app sh
```

### 5. Si la imagen no trae shell
```bash
docker debug nombre-real-del-contenedor
```

---

## Cómo se lee esta secuencia

La lectura conceptual sería:

- primero verificás existencia y estado
- después mirás procesos
- después mirás metadata
- y solo después abrís una sesión interactiva
- si la imagen es demasiado mínima, usás una herramienta pensada para eso

Esto ya es muchísimo más sano que arrancar por el final.

---

## Qué gana esta práctica frente a entrar a ciegas

Gana varias cosas al mismo tiempo:

- menos improvisación
- menos tiempo perdido
- mejor separación entre “lo puedo ver desde afuera” y “lo tengo que mirar desde adentro”
- menos dependencia de que la imagen traiga shell
- una secuencia más repetible y más mantenible para troubleshooting

No es solo cuestión de estilo.
Es una mejora real de método.

---

## Qué no tenés que confundir

### `docker exec` no es una solución permanente
Es una acción puntual dentro de un contenedor running. citeturn732735search0

### `docker top` no reemplaza a `inspect`
Uno mira procesos; el otro metadata.

### `docker compose exec` no reemplaza a entender el estado real del contenedor
Primero conviene verificar si ese servicio está realmente corriendo.

### `docker debug` no significa que la imagen esté mal
Puede significar simplemente que es muy mínima y fue diseñada así. citeturn732735search7

---

## Error común 1: intentar `exec` antes de confirmar siquiera que el contenedor está running

Eso te hace diagnosticar mal el problema desde el primer paso.

---

## Error común 2: entrar al contenedor cuando `top` o `inspect` ya te daban la pista necesaria

Eso mete pasos de más.

---

## Error común 3: asumir que toda imagen trae `sh` o `bash`

Con imágenes modernas, muchas veces no. citeturn732735search7

---

## Error común 4: usar `exec` como parche de configuración en vez de arreglar Dockerfile, Compose o entrypoint

Eso suele dejar soluciones frágiles y manuales.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Tomá esta secuencia conceptual:

```bash
docker ps
docker top mi-contenedor
docker inspect mi-contenedor
docker exec -it mi-contenedor sh
docker debug mi-contenedor
```

Respondé con tus palabras:

- qué resuelve cada paso
- cuál te parece más temprano en la secuencia
- cuál usarías solo si todavía hace falta mirar más de cerca
- cuál usarías si la imagen no trae shell

### Ejercicio 2
Imaginá un servicio Compose `app` que “anda raro”.

Respondé:

- por qué `docker compose exec app sh` puede ser más cómodo que `docker exec`
- por qué aun así no conviene empezar directamente por ahí
- qué mirarías antes: estado, procesos o metadata

### Ejercicio 3
Respondé además:

- por qué `docker top` es una buena herramienta antes de entrar
- por qué `docker inspect` ayuda a formar hipótesis mejores
- por qué `docker exec` no debería convertirse en solución persistente

### Ejercicio 4
Armá mentalmente un flujo de troubleshooting de 5 pasos para un contenedor o servicio “raro”, combinando:

- `docker ps` o `docker ps -a`
- `docker top`
- `docker inspect`
- `docker exec` o `docker compose exec`
- `docker debug`

No hace falta que sea único.
La idea es que te quede una secuencia razonable y repetible.

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- si hoy entrás al contenedor demasiado pronto
- qué dato podrías mirar primero desde afuera
- si te convendría más `docker compose exec` que `docker exec`
- si alguna de tus imágenes podría fallar con `sh` o `bash`
- qué mejora concreta te gustaría notar al diagnosticar con más método

No hace falta ejecutar nada todavía.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre ps, top, inspect y exec?
- ¿en qué proyecto tuyo hoy te convendría revisar procesos antes de entrar?
- ¿en qué caso te serviría más `docker debug`?
- ¿qué contenedor te gustaría revisar primero con esta secuencia?
- ¿qué mejora concreta te gustaría notar al dejar de entrar por reflejo?

Estas observaciones valen mucho más que memorizar comandos.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si primero quiero confirmar que el contenedor está corriendo, probablemente me conviene usar `docker ________`.  
> Si quiero ver procesos sin entrar, probablemente me conviene usar `docker ________`.  
> Si quiero mirar metadata real antes de tocar, probablemente me conviene usar `docker ________`.  
> Si recién después necesito ejecutar un comando adentro, probablemente me conviene usar `docker ________` o `docker compose ________`.  
> Si la imagen no trae shell ni herramientas, probablemente me conviene usar `docker ________`.

Y además respondé:

- ¿por qué esta práctica te parece mucho más sana que entrar a ciegas?
- ¿qué servicio o contenedor tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no convertir el troubleshooting en improvisación?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- combinar `ps`, `top`, `inspect`, `exec` y `debug` en una misma secuencia de troubleshooting
- distinguir mejor qué información conviene mirar desde afuera y cuál desde adentro
- apoyarte más en `docker compose exec` cuando trabajás con servicios
- resolver mejor el caso de imágenes minimalistas sin shell
- diagnosticar contenedores con bastante más método y bastante menos impulso

---

## Resumen del tema

- `docker ps` muestra contenedores running por defecto y `docker ps -a` agrega los detenidos. citeturn732735search20turn732735search2
- `docker top` muestra procesos en ejecución dentro de un contenedor. citeturn732735search2
- `docker inspect` devuelve metadata detallada de bajo nivel. citeturn732735search3
- `docker exec` ejecuta un comando nuevo dentro de un contenedor running, y `docker compose exec` hace lo mismo orientado a servicios. citeturn732735search0turn732735search1
- `docker debug` permite depurar incluso imágenes sin shell ni herramientas típicas. citeturn732735search7
- Esta práctica te deja una secuencia mucho más clara y repetible para troubleshooting real en Docker.

---

## Próximo tema

En el próximo bloque vas a empezar a moverte hacia otra capa muy importante del trabajo real con Docker:

- salud y readiness
- `HEALTHCHECK`
- contenedores que “están corriendo” pero todavía no están realmente listos
- y cómo detectar mejor esa diferencia
