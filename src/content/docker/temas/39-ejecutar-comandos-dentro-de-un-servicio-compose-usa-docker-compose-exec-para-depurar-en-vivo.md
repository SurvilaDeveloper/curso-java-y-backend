---
title: "Ejecutar comandos dentro de un servicio Compose: usá docker compose exec para depurar en vivo"
description: "Tema 39 del curso práctico de Docker: cómo usar docker compose exec para entrar a un servicio ya corriendo, ejecutar comandos puntuales, revisar variables o archivos y entender cuándo conviene exec frente a run."
order: 39
module: "Docker Compose como herramienta central"
level: "base"
draft: false
---

# Ejecutar comandos dentro de un servicio Compose: usá docker compose exec para depurar en vivo

## Objetivo del tema

En este tema vas a:

- usar `docker compose exec` con intención
- ejecutar comandos dentro de un servicio ya corriendo
- entrar a una shell interactiva dentro del stack
- revisar variables, rutas y archivos desde adentro
- entender cuándo conviene `exec` y cuándo conviene `run`

La idea es que aprendas a depurar servicios Compose sin crear contenedores nuevos innecesariamente.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. levantar un stack Compose simple
2. ejecutar un comando puntual dentro de un servicio que ya está corriendo
3. entrar a una shell interactiva
4. revisar variables y archivos desde adentro
5. distinguir `docker compose exec` de `docker compose run`
6. construir una lógica de debugging más útil para el día a día

---

## Idea central que tenés que llevarte

Cuando un servicio ya está corriendo y querés inspeccionarlo o ejecutar un comando puntual, la herramienta natural es:

```bash
docker compose exec
```

Dicho simple:

> `docker compose exec` entra a un servicio que ya está vivo  
> y ejecuta un comando dentro del contenedor en ejecución

Eso lo vuelve ideal para depuración en vivo.

---

## Qué dice la documentación oficial

La referencia oficial de Docker explica que `docker compose exec` ejecuta un comando dentro de un contenedor **en ejecución** de un servicio Compose. También aclara que es el equivalente de `docker exec` orientado a servicios Compose, y que por defecto entra en modo interactivo y asigna TTY, así que podés abrir una shell sin tener que pasar `-it` como en `docker exec`. Además documenta opciones como `-e`, `-u`, `-w`, `-d`, `--index` y `-T`. ([docs.docker.com](https://docs.docker.com/reference/cli/docker/compose/exec/?utm_source=chatgpt.com))

---

## Por qué este tema importa tanto

A medida que una app crece, es muy común que necesites hacer cosas como estas:

- revisar una variable de entorno dentro de la app
- comprobar si un archivo existe
- entrar a una shell para mirar rutas
- correr una consulta o comando auxiliar
- probar conectividad desde el servicio mismo

Y si el servicio ya está corriendo, no querés necesariamente crear otro contenedor ad hoc.

Ahí es donde `docker compose exec` se vuelve una herramienta central.

---

## Recordatorio rápido del tema anterior

En el tema 38 viste cómo mirar:

- estado del stack con `docker compose ps`
- salida con `docker compose logs`
- seguimiento en vivo con `docker compose logs -f`

Ahora sumás la otra mitad del debugging:

- entrar dentro del servicio
- ejecutar comandos reales desde adentro
- inspeccionar el entorno mientras el stack sigue corriendo

---

## Stack de práctica

Podés usar este archivo:

```yaml
services:
  web:
    image: nginx
    ports:
      - "8080:80"

  db:
    image: postgres:18
    environment:
      POSTGRES_PASSWORD: mysecretpassword
```

Guardalo como:

```text
compose.yaml
```

Y levantalo con:

```bash
docker compose up -d
```

---

## Primer uso real de docker compose exec

Ahora ejecutá:

```bash
docker compose exec web ls /usr/share/nginx/html
```

---

## Qué hace

- no crea un contenedor nuevo
- usa el servicio `web` que ya está corriendo
- ejecuta `ls /usr/share/nginx/html` dentro de ese contenedor
- muestra el resultado en tu terminal

Esto ya es depuración útil de verdad.

---

## Qué deberías observar

Deberías ver archivos del directorio estático de Nginx.

Eso confirma varias cosas al mismo tiempo:

- el servicio `web` está corriendo
- `docker compose exec` pudo entrar al contenedor correcto
- el comando se ejecutó dentro del servicio, no en tu host

---

## Entrar a una shell interactiva

Ahora probá esto:

```bash
docker compose exec web sh
```

---

## Qué tiene de especial

Como la referencia oficial aclara que `docker compose exec` ya asigna TTY e interactividad por defecto, esto normalmente te deja entrar directo a una shell sin necesidad de escribir `-it`. ([docs.docker.com](https://docs.docker.com/reference/cli/docker/compose/exec/?utm_source=chatgpt.com))

Eso hace que el debugging interactivo sea muy cómodo.

---

## Qué podés hacer dentro de la shell

Una vez adentro, podrías ejecutar cosas como:

```sh
pwd
ls
env
```

La idea no es explorar absolutamente todo, sino sentir que ya podés inspeccionar un servicio del stack desde adentro mientras sigue vivo.

---

## Salir de la shell

Cuando termines, usá:

```sh
exit
```

Eso cierra la shell interactiva, pero no necesariamente detiene el servicio.

Esa diferencia es muy importante.

---

## Revisar variables de entorno con exec

También podés usar `exec` para verificar variables del servicio.

Por ejemplo, con el servicio `db`:

```bash
docker compose exec db env
```

O si querés filtrar una puntual dentro de una shell:

```bash
docker compose exec db sh -c 'echo $POSTGRES_PASSWORD'
```

Esto es muy útil cuando querés comprobar si Compose realmente inyectó la configuración que esperabas.

---

## Revisar conectividad desde adentro del stack

Uno de los usos más interesantes es probar conectividad entre servicios desde el propio servicio que consume la dependencia.

La guía rápida oficial de Compose muestra justamente este tipo de debugging en vivo, usando `docker compose exec` para verificar variables y probar que un servicio puede resolver otro por nombre dentro del stack. ([docs.docker.com](https://docs.docker.com/compose/gettingstarted/?utm_source=chatgpt.com))

Aunque hoy no armes un caso complejo, conviene que te quede la idea:

- logs te dicen qué pasó
- exec te deja comprobar desde adentro por qué pasó

---

## Qué diferencia hay entre exec y run

Esta comparación te tiene que quedar clara.

### `docker compose exec`
Ejecuta un comando dentro de un contenedor de servicio que **ya está corriendo**.

### `docker compose run`
Ejecuta un comando one-off contra un servicio y crea un contenedor nuevo para esa tarea ad hoc.

La documentación oficial de Docker lo diferencia así: `exec` va a un contenedor ya vivo, mientras que `run` arranca un contenedor nuevo usando la configuración del servicio para tareas puntuales. ([docs.docker.com](https://docs.docker.com/reference/cli/docker/compose/exec/?utm_source=chatgpt.com), [docs.docker.com](https://docs.docker.com/reference/cli/docker/compose/run/?utm_source=chatgpt.com))

---

## Cuándo conviene exec

Conviene mucho cuando:

- el servicio ya está corriendo
- querés inspeccionar su estado real
- querés entrar a una shell
- querés revisar archivos, variables o conectividad sin alterar el flujo normal del stack

Es la herramienta natural para debugging vivo.

---

## Cuándo puede convenir run

Puede convenir cuando:

- querés una tarea one-off
- querés ejecutar algo sin depender del contenedor ya corriendo
- querés lanzar un comando ad hoc con la configuración del servicio

Pero para el foco del día a día de observación y diagnóstico, `exec` suele ser la herramienta más directa.

---

## Opciones útiles de exec

La referencia oficial documenta varias opciones muy útiles:

### `-e`
Permite pasar variables al proceso ejecutado.

### `-w`
Permite definir un directorio de trabajo para ese comando.

### `-u`
Permite ejecutar como otro usuario.

### `-T`
Desactiva la pseudo-TTY, algo útil en scripts.

### `--index`
Sirve para elegir qué réplica querés atacar si un servicio tiene múltiples contenedores. ([docs.docker.com](https://docs.docker.com/reference/cli/docker/compose/exec/?utm_source=chatgpt.com))

No hace falta usar todo eso ya.
Lo importante es saber que `exec` no es solo “abrir una shell”.

---

## Ejemplos útiles con opciones

### Ejecutar en otro directorio
```bash
docker compose exec -w /usr/share/nginx/html web pwd
```

### Pasar una variable al proceso puntual
```bash
docker compose exec -e MENSAJE="hola" web sh -c 'echo $MENSAJE'
```

### Usarlo mejor en scripts
```bash
docker compose exec -T db env
```

Esto es especialmente útil cuando no querés comportamiento interactivo.

---

## Qué no tenés que confundir

### `exec` no crea un contenedor nuevo
Usa uno que ya está corriendo.

### Salir de la shell no baja el servicio
Solo termina la shell que abriste.

### `exec` no reemplaza a `logs`
Uno te deja entrar y ejecutar comandos.
El otro te muestra la salida del servicio.

### `exec` no sirve si el servicio no está corriendo
Primero necesitás tener el stack levantado.

---

## Error común 1: usar exec sobre un servicio caído

Si el servicio no está corriendo, `exec` no te va a resolver el problema.
Primero necesitás mirar `docker compose ps` y quizá `docker compose logs`.

---

## Error común 2: usar run cuando en realidad querías inspeccionar el contenedor ya vivo

Eso puede confundirte, porque estarías entrando a otro contenedor distinto y no al que querías depurar.

---

## Error común 3: salir de la shell y creer que el stack se apagó

No.
El servicio puede seguir perfectamente vivo.

---

## Error común 4: olvidar que algunas imágenes no traen bash

Como ya viste antes con Docker “normal”, muchas imágenes mínimas traen `sh` pero no `bash`.

Por eso conviene probar primero:

```bash
docker compose exec servicio sh
```

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá este `compose.yaml`:

```yaml
services:
  web:
    image: nginx
    ports:
      - "8080:80"

  db:
    image: postgres:18
    environment:
      POSTGRES_PASSWORD: mysecretpassword
```

### Ejercicio 2
Levantá el stack:

```bash
docker compose up -d
```

### Ejercicio 3
Ejecutá un comando puntual dentro de `web`:

```bash
docker compose exec web ls /usr/share/nginx/html
```

### Ejercicio 4
Entrá a una shell interactiva en `web`:

```bash
docker compose exec web sh
```

Ya dentro, probá:

```sh
pwd
ls
exit
```

### Ejercicio 5
Revisá variables en `db`:

```bash
docker compose exec db env
```

### Ejercicio 6
Probá una opción útil:

```bash
docker compose exec -w /usr/share/nginx/html web pwd
```

### Ejercicio 7
Bajá el stack:

```bash
docker compose down
```

### Ejercicio 8
Respondé con tus palabras:

- ¿qué diferencia viste entre `exec` y `logs`?
- ¿qué diferencia viste entre `exec` y `run`?
- ¿por qué `exec` es tan útil para debugging?
- ¿por qué no necesitaste `-it` para entrar a la shell?

---

## Segundo ejercicio de análisis

Imaginá que tu servicio `api` no puede conectarse a `db`.

Respondé qué te parece más razonable hacer primero y por qué:

- mirar `docker compose logs api`
- mirar `docker compose ps`
- entrar con `docker compose exec api sh`
- probar desde adentro si `db` se resuelve por nombre

La idea es que empieces a armar un flujo mental real de depuración.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tipo de problema te imaginás resolviendo con `exec`?
- ¿qué valor práctico le ves a entrar al servicio real en ejecución?
- ¿por qué es tan importante no confundir `exec` con `run`?
- ¿qué parte del debugging te parece más fuerte con `logs` y cuál con `exec`?
- ¿cómo cambia tu idea del trabajo diario con Compose después de este tema?

Estas observaciones valen mucho más que aprenderte una sola sintaxis.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero mirar qué pasa **desde adentro del servicio que ya está corriendo**, uso ________.  
> Si quiero correr una tarea **ad hoc en un contenedor nuevo basado en el servicio**, uso ________.

Y además respondé:

- ¿por qué `exec` es tan valioso para depuración viva?
- ¿qué ventaja tiene que ya asigne TTY por defecto?
- ¿qué parte de tus proyectos creés que más vas a inspeccionar con `exec`?
- ¿qué comando complementarías primero con `exec`: `ps` o `logs`?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- usar `docker compose exec` para ejecutar comandos dentro de un servicio ya corriendo
- entrar a una shell interactiva dentro del stack
- revisar archivos, rutas y variables desde adentro
- distinguir claramente `exec` de `run`
- complementar mejor `ps`, `logs` y `exec` en tu flujo de debugging

---

## Resumen del tema

- `docker compose exec` ejecuta comandos dentro de un contenedor de servicio que ya está corriendo. citeturn995754search0turn995754search6
- Por defecto entra en modo interactivo y asigna TTY, a diferencia de `docker exec`, que suele requerir flags explícitas. citeturn995754search0turn995754search2
- Es ideal para debugging vivo: revisar archivos, variables, conectividad o abrir una shell.
- `docker compose run` sirve para tareas ad hoc en contenedores nuevos, no para inspeccionar el servicio ya vivo. citeturn995754search3turn995754search10
- Este tema completa muy bien el flujo diario Compose de estado, logs y depuración desde adentro del stack.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en el trabajo real con Compose:

- variables de entorno en Compose
- cómo declararlas mejor
- cómo separar configuración del archivo principal
- y cómo empezar a usar `.env` con más criterio
