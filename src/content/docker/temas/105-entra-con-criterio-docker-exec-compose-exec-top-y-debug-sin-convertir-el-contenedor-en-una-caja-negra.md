---
title: "Entrá con criterio: docker exec, compose exec, top y debug sin convertir el contenedor en una caja negra"
description: "Tema 105 del curso práctico de Docker: cómo entrar a un contenedor con docker exec o docker compose exec, cuándo conviene mirar procesos con docker top antes de entrar, y qué hacer cuando la imagen no trae shell usando docker debug."
order: 105
module: "Inspección, metadata y diagnóstico con criterio"
level: "intermedio"
draft: false
---

# Entrá con criterio: docker exec, compose exec, top y debug sin convertir el contenedor en una caja negra

## Objetivo del tema

En este tema vas a:

- entender qué problema resuelve `docker exec`
- usar `docker compose exec` cuando trabajás con servicios Compose
- mirar procesos con `docker top` antes de entrar a ciegas
- entender qué hacer cuando una imagen no trae shell
- entrar al contenedor con más criterio y menos improvisación

La idea es que pases de “me meto al contenedor a ver qué pasa” a una secuencia más sana: primero mirar desde afuera lo que puedas, y recién después entrar si de verdad hace falta.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender qué hace realmente `docker exec`
2. distinguirlo de `docker run` y de “reconstruir la imagen”
3. usar `-it`, `--env`, `--workdir` y `--user` con más intención
4. usar `docker compose exec` cuando trabajás con servicios
5. mirar procesos con `docker top`
6. entender el lugar de `docker debug` cuando no hay shell

---

## Idea central que tenés que llevarte

Docker documenta que `docker exec` ejecuta un comando nuevo dentro de un contenedor **en ejecución**. Ese comando solo vive mientras corre el proceso principal del contenedor (`PID 1`) y no se reinicia si el contenedor se reinicia. También aclara que el comando corre en el working directory por defecto del contenedor, y que el comando debe ser un ejecutable real. `docker compose exec` es el equivalente a nivel de servicio Compose y asigna TTY por defecto. Además, `docker top` permite ver procesos sin entrar, y `docker debug` ofrece una shell de depuración incluso para imágenes sin shell propia. citeturn298807search0turn298807search13turn298807search5turn298807search1turn298807search7

Dicho simple:

> `exec` no reemplaza diseño ni rebuild;  
> te deja ejecutar algo puntual dentro de un contenedor que ya está corriendo.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker deja varias ideas muy claras para este tema:

- `docker container exec` ejecuta un comando nuevo en un contenedor en ejecución. Solo funciona mientras el proceso principal (`PID 1`) está vivo y el comando lanzado no se reinicia con el contenedor. citeturn298807search0
- Docker documenta opciones útiles en `exec` como `-i`, `-t`, `--env`, `--workdir` y `--user`. citeturn298807search0
- `docker compose exec` es el equivalente de `docker exec` dirigido a un servicio Compose y asigna TTY por defecto. citeturn298807search13
- `docker top` muestra los procesos en ejecución dentro de un contenedor sin que tengas que entrar interactiva ni manualmente. citeturn298807search5
- `docker ps` muestra contenedores en ejecución por defecto y `docker ps -a` muestra también los detenidos, lo que ayuda a confirmar si un `exec` tiene sentido antes de intentarlo. citeturn298807search2turn298807search9
- `docker debug` te permite abrir una shell de depuración incluso en contenedores o imágenes que no traen shell ni herramientas típicas, sin modificar la imagen. citeturn298807search1turn298807search7turn298807search10

---

## Primer concepto: qué hace `docker exec`

El comando básico es:

```bash
docker exec mi-contenedor COMANDO
```

Por ejemplo:

```bash
docker exec mi-contenedor ls /app
```

### Qué significa realmente
- el contenedor ya existe
- el contenedor ya está corriendo
- lanzás un comando adicional adentro
- ese comando no redefine el contenedor
- ese comando no cambia mágicamente la imagen original

Esto parece obvio, pero es la base de todo el tema.

---

## Qué problema resuelve bien `docker exec`

Resuelve cosas como:

- inspeccionar un archivo puntual
- probar conectividad desde adentro
- ver variables de entorno reales del proceso
- listar procesos, rutas o permisos
- ejecutar una tarea administrativa puntual

No está pensado para “arreglar” conceptualmente una imagen mal diseñada.
Está pensado para **operar o inspeccionar algo puntual** dentro de un contenedor que ya corre.

---

## Segundo concepto: `docker exec` no vive más que el contenedor

Docker documenta algo muy importante:

- el comando ejecutado con `docker exec` corre solo mientras el proceso principal (`PID 1`) del contenedor sigue vivo
- si el contenedor se reinicia, ese comando no se reinicia con él citeturn298807search0

### Qué enseñanza deja esto
- `exec` es una intervención puntual, no una configuración persistente
- no deberías pensar `exec` como parte del arranque normal
- si algo tiene que existir siempre, no debería depender de que vos lo lances a mano con `exec`

Esto ayuda mucho a no usar `exec` como parche permanente.

---

## Tercer concepto: `-it` para interacción real

Uno de los usos más comunes es entrar con una shell interactiva:

```bash
docker exec -it mi-contenedor sh
```

o si tiene bash:

```bash
docker exec -it mi-contenedor bash
```

Docker Desktop incluso explica que su pestaña Exec equivale justamente a algo como `docker exec -it <container-id> /bin/sh` para contenedores Linux. citeturn298807search16

### Qué hacen estas opciones
- `-i`: mantiene STDIN abierto
- `-t`: asigna TTY

En práctica, cuando querés “entrar al contenedor”, casi siempre pensás en `-it`.

---

## Un detalle importante: no todas las imágenes traen shell

Docker documenta que el comando de `docker exec` debe ser un ejecutable real.
Si la imagen no trae `sh` ni `bash`, algo como:

```bash
docker exec -it mi-contenedor sh
```

puede fallar con un error tipo:

```text
exec: "sh": executable file not found in $PATH
```

La documentación de Docker Debug usa justamente este caso como ejemplo de motivación para `docker debug`. citeturn298807search0turn298807search7

---

## Qué enseñanza deja esto

Deja una idea muy útil:

> si no podés entrar con shell, no siempre significa que el contenedor esté roto.  
> Puede significar simplemente que la imagen es minimalista.

Este matiz es importante, sobre todo en imágenes endurecidas, distroless o muy mínimas.

---

## Cuarto concepto: `docker top` antes de entrar

Docker documenta `docker top` como comando para mostrar procesos en ejecución dentro del contenedor. citeturn298807search5

Por ejemplo:

```bash
docker top mi-contenedor
```

### Qué problema resuelve
- ver qué se está ejecutando realmente
- confirmar si el proceso principal existe
- mirar procesos sin necesidad de abrir una shell
- validar rápido si el contenedor sigue vivo y con qué procesos

Esto es un muy buen hábito:
**mirar primero con `top` cuando solo necesitás procesos, y no entrar porque sí**.

---

## Quinto concepto: confirmá que el contenedor está corriendo antes de hacer exec

Docker documenta que `docker ps` solo muestra contenedores en ejecución por defecto, mientras que `docker ps -a` muestra también los detenidos. citeturn298807search2turn298807search9

Entonces, antes de un `exec`, muchas veces conviene algo como:

```bash
docker ps
```

o:

```bash
docker ps -a
```

### Qué gana esto
- evitás intentar `exec` sobre algo que ya está detenido
- entendés mejor si el problema es “no puedo entrar” o “el contenedor no está corriendo”

Esto te ahorra mucho tiempo tonto.

---

## Sexto concepto: `--env`, `--workdir` y `--user`

Docker documenta varias opciones muy útiles de `exec`. citeturn298807search0

### `--env`
Para pasar variables solo al comando que vas a ejecutar.

```bash
docker exec --env FOO=bar mi-contenedor env
```

### `--workdir`
Para ejecutar desde un directorio concreto.

```bash
docker exec --workdir /app mi-contenedor ls
```

### `--user`
Para correr el comando con otro usuario.

```bash
docker exec --user root mi-contenedor id
```

---

## Qué te enseñan estas opciones

Te enseñan algo muy útil:

> `exec` no es solo “entrar con sh”.  
> También sirve para ejecutar un comando puntual con el contexto exacto que necesitás.

Esto lo vuelve mucho más versátil para debugging fino.

---

## Séptimo concepto: `docker compose exec`

Cuando trabajás con Compose, la forma más natural suele ser:

```bash
docker compose exec app sh
```

Docker documenta que `docker compose exec` es el equivalente de `docker exec` orientado a servicios y que asigna TTY por defecto. citeturn298807search13

### Qué gana esto
- no tenés que perseguir el nombre exacto del contenedor
- pensás por servicio, no por ID
- encaja mejor con stacks multi-servicio

En entornos Compose, esta suele ser la herramienta más cómoda.

---

## Qué diferencia práctica tiene con `docker exec`

La diferencia más útil del día a día es:

- `docker exec` apunta a un contenedor específico
- `docker compose exec` apunta al servicio Compose

Cuando estás trabajando en un proyecto con `app`, `db`, `worker`, etc., eso te ahorra bastante fricción.

---

## Octavo concepto: `docker debug`

Docker documenta `docker debug` como una forma de obtener una shell de depuración en cualquier contenedor o imagen, incluso si no contienen shell. No modifica la imagen y aporta un toolbox temporal con herramientas estándar como `vim`, `nano`, `htop` y `curl`. citeturn298807search1turn298807search7

Por ejemplo, si esto falla:

```bash
docker exec -it myapp sh
```

podrías usar:

```bash
docker debug myapp
```

---

## Qué problema resuelve `docker debug`

Resuelve justo el caso moderno y muy real donde:

- la imagen es minimalista
- no tiene shell
- no trae `ps`, `cat`, `curl`, etc.
- y aun así necesitás inspeccionarla sin modificarla

Esto no reemplaza a `exec`, pero sí cubre un caso donde `exec` solo ya no alcanza.

---

## Un flujo muy sano de troubleshooting

Podrías pensar así:

### 1. Confirmar que el contenedor está corriendo
```bash
docker ps
```

### 2. Mirar procesos sin entrar
```bash
docker top mi-contenedor
```

### 3. Inspeccionar metadata desde afuera si hace falta
```bash
docker inspect mi-contenedor
```

### 4. Entrar con un comando puntual o con shell si realmente lo necesitás
```bash
docker exec -it mi-contenedor sh
```

### 5. Si no hay shell ni herramientas
```bash
docker debug mi-contenedor
```

Este flujo ya es mucho más sano que “me meto al contenedor a ver qué onda” como primer reflejo.

---

## Qué no tenés que confundir

### `docker exec` no crea un contenedor nuevo
Ejecuta un comando nuevo dentro de uno que ya existe y está corriendo. citeturn298807search0

### `docker exec` no persiste una solución
Si algo tiene que quedar fijo, probablemente no se resuelve con un `exec` manual.

### `docker top` no reemplaza a `exec`
Te da procesos, pero no te mete interactivo al contenedor. citeturn298807search5

### `docker debug` no significa que la imagen esté mal
A veces significa que la imagen es minimalista o endurecida, y justamente por eso necesitás una capa de depuración aparte. citeturn298807search1turn298807search7

---

## Error común 1: usar `exec` como parche permanente

Eso suele ocultar que la solución real estaba en la imagen, el entrypoint o la configuración.

---

## Error común 2: intentar `docker exec` sobre un contenedor detenido

Primero conviene confirmar con `docker ps` o `docker ps -a`. citeturn298807search2turn298807search9

---

## Error común 3: asumir que toda imagen trae `sh` o `bash`

Docker Debug existe justamente porque eso no siempre es cierto. citeturn298807search1turn298807search7

---

## Error común 4: entrar al contenedor a ciegas cuando `docker top` o `inspect` ya te daban la pista que necesitabas

Eso te hace gastar más tiempo del necesario.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Respondé con tus palabras:

- qué hace `docker exec`
- por qué solo funciona mientras el proceso principal del contenedor siga vivo
- por qué no deberías pensar `exec` como solución persistente

### Ejercicio 2
Compará estos comandos:

```bash
docker exec -it mi-contenedor sh
docker compose exec app sh
docker top mi-contenedor
docker debug mi-contenedor
```

Respondé:

- qué resuelve mejor cada uno
- cuál usarías primero si solo querés ver procesos
- cuál usarías si trabajás con Compose
- cuál usarías si la imagen no tiene shell

### Ejercicio 3
Respondé además:

- por qué conviene mirar `docker ps` antes de intentar un `exec`
- qué ventaja te da `--workdir`
- qué ventaja te da `--user`
- qué ventaja te da `--env` para una prueba puntual

### Ejercicio 4
Armá mentalmente un flujo de 4 o 5 pasos para diagnosticar un contenedor que “parece raro”, combinando:

- `docker ps`
- `docker top`
- `docker inspect`
- `docker exec`
- o `docker debug`

No hace falta que sea único.
La idea es que empieces a usar estas herramientas con secuencia y no por impulso.

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- si hoy te convendría más `docker compose exec` que `docker exec`
- si alguna imagen tuya es tan mínima que podría no tener shell
- si hoy entrás al contenedor demasiado pronto sin mirar primero procesos o metadata
- qué contenedor te gustaría revisar primero con esta lógica
- qué mejora concreta te gustaría notar al entrar con más criterio

No hace falta ejecutar nada todavía.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre mirar desde afuera y entrar al contenedor?
- ¿en qué proyecto tuyo hoy `docker top` te ahorraría más tiempo?
- ¿en qué caso te serviría más `docker compose exec`?
- ¿qué imagen tuya podría beneficiarse de `docker debug` si fuera demasiado mínima?
- ¿qué mejora concreta te gustaría notar al dejar de entrar a ciegas?

Estas observaciones valen mucho más que memorizar flags.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero ejecutar un comando puntual dentro de un contenedor en ejecución, probablemente me conviene usar `docker ________`.  
> Si estoy trabajando con un servicio Compose, probablemente me conviene usar `docker compose ________`.  
> Si solo quiero ver procesos sin entrar, probablemente me conviene usar `docker ________`.  
> Si la imagen no trae shell ni herramientas, probablemente me conviene usar `docker ________`.  
> Si quiero confirmar antes que el contenedor sigue vivo, probablemente me conviene usar `docker ________`.

Y además respondé:

- ¿por qué este tema impacta tanto en troubleshooting del día a día?
- ¿qué contenedor tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no convertir el contenedor en una caja negra?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- usar `docker exec` con mucho más criterio
- distinguir cuándo conviene `docker compose exec`
- apoyarte más en `docker top` antes de entrar
- entender el lugar de `docker debug` en imágenes minimalistas
- diagnosticar contenedores con bastante menos improvisación y bastante más método

---

## Resumen del tema

- `docker exec` ejecuta un comando nuevo en un contenedor en ejecución; ese comando solo vive mientras el proceso principal del contenedor siga corriendo. citeturn298807search0
- `docker compose exec` es el equivalente orientado a servicios Compose y asigna TTY por defecto. citeturn298807search13
- `docker top` muestra procesos en ejecución dentro del contenedor sin necesidad de entrar interactivamente. citeturn298807search5
- `docker ps` muestra contenedores running por defecto y `docker ps -a` muestra también los detenidos. citeturn298807search2turn298807search9
- `docker debug` permite abrir una shell de depuración incluso en imágenes sin shell ni herramientas, sin modificar la imagen. citeturn298807search1turn298807search7
- Este tema te deja una base mucho más clara para entrar a contenedores con intención y no por simple reflejo.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque con una práctica integrada:

- ps
- top
- inspect
- exec
- y una secuencia de troubleshooting mucho más clara de punta a punta
