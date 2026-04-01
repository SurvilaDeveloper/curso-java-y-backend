---
title: "Reconstrucción de servicios en Compose: cuándo hace falta rebuild y cuándo alcanza con reiniciar"
description: "Tema 37 del curso práctico de Docker: cómo iterar sobre un stack Compose sin rehacer todo siempre, cuándo usar docker compose build, cuándo usar docker compose up --build, cuándo alcanza con restart y cómo reconstruir un solo servicio sin tocar el resto."
order: 37
module: "Docker Compose como herramienta central"
level: "base"
draft: false
---

# Reconstrucción de servicios en Compose: cuándo hace falta rebuild y cuándo alcanza con reiniciar

## Objetivo del tema

En este tema vas a:

- entender cuándo hace falta reconstruir una imagen en Compose
- distinguir reconstrucción, recreación y reinicio
- usar `docker compose build`
- usar `docker compose up --build`
- usar `docker compose restart` con más criterio
- aprender a iterar sobre un servicio sin tocar innecesariamente todo el stack

La idea es que empieces a trabajar sobre un stack Compose con una lógica más realista y más cómoda para el día a día.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender qué cambió cuando modificás código, Dockerfile o configuración
2. distinguir cuándo hay que rebuild y cuándo no
3. reconstruir un servicio
4. recrearlo sin bajar todo el stack
5. reiniciar un servicio cuando el problema no es la imagen
6. aprender una regla práctica para iterar más rápido

---

## Idea central que tenés que llevarte

Cuando trabajás con Compose, no todo cambio exige la misma respuesta.

A veces alcanza con reiniciar.
A veces hace falta recrear el contenedor.
Y a veces necesitás reconstruir la imagen porque cambiaste el código o el Dockerfile.

Dicho simple:

- si cambió la imagen o cómo se construye, probablemente necesitás **build**
- si cambió la configuración del contenedor, probablemente necesitás **recreate**
- si solo querés volver a arrancar el mismo contenedor sin aplicar cambios de configuración, puede alcanzar con **restart**

Saber distinguir eso te ahorra muchísimo tiempo.

---

## Qué dice la documentación oficial

La documentación oficial de Docker indica que `docker compose build` sirve para construir o reconstruir servicios, y que deberías usarlo si cambiaste el Dockerfile o el contenido del directorio de build del servicio. También explica que `docker compose up` recrea contenedores si cambió la configuración o la imagen desde que fueron creados, que `docker compose up --build` construye antes de iniciar, y que `docker compose restart` reinicia servicios pero **no** aplica cambios hechos en `compose.yaml`, por ejemplo cambios en variables de entorno. Además, la guía de producción de Compose recomienda para redeploy de un solo servicio usar `docker compose build <servicio>` seguido de `docker compose up --no-deps -d <servicio>`. citeturn805636search0turn805636search1turn805636search2turn805636search11turn805636search12

---

## El problema real que resuelve este tema

Cuando ya tenés un stack corriendo, tarde o temprano pasa algo de esto:

- cambiaste un archivo de tu app
- tocaste el Dockerfile
- cambiaste una variable en `compose.yaml`
- modificaste un puerto
- querés aplicar el cambio sin bajar todo a mano
- no sabés si alcanza con reiniciar o si hay que reconstruir

Este tema te da una brújula simple para decidir.

---

## Tres ideas que no conviene mezclar

### 1. Reiniciar
Volver a arrancar el mismo contenedor.

### 2. Recrear
Eliminar y volver a crear el contenedor con la configuración actual.

### 3. Reconstruir
Volver a construir la imagen usada por el servicio.

Estas tres cosas se parecen, pero no son lo mismo.

---

## Cuándo suele hacer falta rebuild

Suele hacer falta reconstruir cuando cambiaste cosas que afectan la imagen.

Por ejemplo:

- el `Dockerfile`
- archivos copiados dentro de la imagen
- dependencias incluidas durante el build
- código fuente que forma parte de la imagen final

En esos casos, solo reiniciar el contenedor no alcanza, porque el contenedor seguiría usando la imagen vieja.

---

## Cuándo puede alcanzar con restart

Puede alcanzar con reiniciar cuando:

- la imagen no cambió
- la configuración no cambió
- simplemente querés volver a arrancar el servicio

Por ejemplo, si el proceso quedó en mal estado y querés reiniciarlo, `restart` puede servir.

Pero esto es muy importante:

`docker compose restart` no toma cambios nuevos del `compose.yaml`.

La documentación oficial lo dice explícitamente. Si cambiaste variables de entorno o configuración del servicio, un restart solo no refleja esos cambios. citeturn805636search2

---

## Cuándo hace falta recreate

Si cambiaste algo en `compose.yaml`, como por ejemplo:

- variables de entorno
- puertos
- volúmenes
- mounts
- configuración del servicio

entonces normalmente lo que necesitás no es solo restart.
Necesitás que Compose recree el contenedor con esa nueva definición.

Y ahí `docker compose up` vuelve a ser tu herramienta principal.

---

## Primer comando importante: docker compose build

La forma base es esta:

```bash
docker compose build
```

O para un servicio concreto:

```bash
docker compose build web
```

---

## Qué hace

Reconstruye la imagen del servicio o de los servicios indicados.

Esto es ideal cuando:

- cambiaste el Dockerfile
- cambiaste archivos que entran al build
- querés regenerar la imagen antes de volver a correr el stack

---

## Cuándo usar docker compose up --build

También podés hacer esto:

```bash
docker compose up --build
```

O en background:

```bash
docker compose up --build -d
```

---

## Qué hace

Le dice a Compose:

- construí si hace falta
- y después levantá o recreá los servicios

Es muy cómodo cuando sabés que cambiaste algo que afecta la imagen y querés un solo comando para todo.

---

## Diferencia entre build y up --build

### `docker compose build`
Solo construye imágenes.

### `docker compose up --build`
Construye cuando hace falta y además arranca o recrea servicios.

Ambos son útiles.
La diferencia está en si querés solo reconstruir o ya dejar el stack levantado.

---

## Qué hace docker compose up cuando ya hay contenedores existentes

La documentación oficial explica que, si hay contenedores ya existentes para un servicio y cambió la configuración o la imagen usada por esos contenedores, `docker compose up` los detiene y los recrea, preservando los volúmenes montados. También menciona `--no-recreate` para evitarlo y `--force-recreate` para forzarlo. citeturn805636search1

Esto es muy importante porque muestra que `up` no es solo “encender lo que ya está”.
También sirve para aplicar cambios del archivo y del estado del proyecto.

---

## Qué hace docker compose restart

La forma base es esta:

```bash
docker compose restart
```

O para un servicio puntual:

```bash
docker compose restart web
```

---

## Qué hace

Reinicia el contenedor del servicio.

Pero no aplica cambios nuevos en `compose.yaml`.

Por eso, si cambiaste algo como:

```yaml
environment:
  DEBUG: "true"
```

y solo corrés:

```bash
docker compose restart web
```

el cambio no se refleja.

Ahí necesitás recreate con `docker compose up` o un redeploy del servicio.

---

## Regla práctica simple

Podés pensar así:

### Cambié el Dockerfile o lo que entra en la imagen
Usá:

```bash
docker compose build servicio
docker compose up --no-deps -d servicio
```

o directamente:

```bash
docker compose up --build -d
```

### Cambié compose.yaml
Usá:

```bash
docker compose up -d
```

para que Compose recree lo necesario.

### Solo quiero reiniciar el mismo contenedor
Usá:

```bash
docker compose restart servicio
```

---

## Una forma muy útil de iterar sobre un solo servicio

La guía oficial de Docker para Compose en producción sugiere este flujo para redeploy de un servicio concreto:

```bash
docker compose build web
docker compose up --no-deps -d web
```

---

## Qué ventaja tiene

- reconstruís solo `web`
- recreás solo `web`
- no tocás innecesariamente servicios como `db` o `redis`
- el stack sigue siendo más ágil y menos invasivo

Esto es muy útil cuando la app tiene varios servicios y solo cambiaste uno.

---

## Ejemplo mental simple

Imaginá este stack:

- `web`
- `db`
- `redis`

Si solo cambiaste el Dockerfile o el código que entra en la imagen de `web`, no tiene mucho sentido reconstruir `db` ni `redis`.

Ahí este flujo encaja perfecto:

```bash
docker compose build web
docker compose up --no-deps -d web
```

---

## Qué papel puede jugar up --watch

Docker también tiene `docker compose up --watch` y `docker compose watch` para ciertos flujos de desarrollo, donde Compose observa cambios y puede sincronizar, reiniciar o reconstruir según la configuración `develop/watch`. No hace falta usarlo todavía en el curso, pero es bueno saber que existe como evolución del flujo de iteración. citeturn805636search8turn805636search10

Por ahora, para consolidar bien la base, nos vamos a quedar con:

- `build`
- `up --build`
- `up -d`
- `restart`

---

## Qué no tenés que confundir

### `restart` no aplica cambios nuevos del compose.yaml
Solo reinicia el contenedor existente.

### `build` no arranca el stack
Solo reconstruye imágenes.

### `up` no siempre es lo mismo que “encender lo que ya está”
También puede recrear servicios si detecta cambios.

### `up --build` no siempre significa reconstruir todo desde cero por capricho
Significa que Compose construirá donde haga falta antes de iniciar.

---

## Error común 1: cambiar código o Dockerfile y usar solo restart

Eso deja al servicio corriendo sobre una imagen vieja.

---

## Error común 2: cambiar variables de entorno en compose.yaml y usar solo restart

La documentación oficial dice explícitamente que esos cambios no se reflejan con `restart`. citeturn805636search2

---

## Error común 3: bajar y subir todo el stack para cualquier cambio mínimo

A veces no hace falta tocar todo.
Podés reconstruir y recrear solo el servicio afectado.

---

## Error común 4: usar up sin entender si querés recreate o no

Por defecto, `up` intenta converger al estado correcto del proyecto.
Pero también existen opciones como:

- `--no-recreate`
- `--force-recreate`

Conviene saber que están, aunque al comienzo no las uses todo el tiempo. citeturn805636search1

---

## Ejercicio práctico obligatorio

Quiero que hagas este recorrido de análisis.

### Ejercicio 1
Imaginá este stack:

- `web` se construye con `build: ./web`
- `db` usa `image: postgres:18`

### Ejercicio 2
Respondé qué harías en cada caso:

#### Caso A
Cambiaste el Dockerfile de `web`.

#### Caso B
Cambiaste una variable de entorno de `web` en `compose.yaml`.

#### Caso C
No cambiaste la imagen ni el archivo Compose, pero querés reiniciar `web`.

### Ejercicio 3
Proponé para cada caso un comando razonable entre estos:

```bash
docker compose build web
docker compose up --no-deps -d web
docker compose up --build -d
docker compose up -d
docker compose restart web
```

### Ejercicio 4
Explicá por qué elegiste cada uno.

---

## Segundo ejercicio de análisis

Tomá este flujo:

```bash
docker compose build web
docker compose up --no-deps -d web
```

Y respondé:

- qué reconstruye
- qué recrea
- qué evita tocar
- por qué puede ser mejor que bajar todo el stack
- en qué tipo de proyecto te sería especialmente útil

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué diferencia concreta ves entre reiniciar y recrear?
- ¿qué parte te resultó más clara entre `build`, `up` y `restart`?
- ¿por qué te conviene no tocar todo el stack para cambios chicos?
- ¿qué te ayuda más a decidir: pensar si cambió la imagen o si cambió la configuración?
- ¿qué flujo te imaginás usando más en tus proyectos?

Estas observaciones valen mucho más que aprender comandos aislados.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si cambia ________, probablemente necesito rebuild.  
> Si cambia ________, probablemente necesito recreate.  
> Si no cambió ninguna de esas dos cosas y solo quiero reiniciar el proceso, probablemente alcanza con ________.

Y además respondé:

- ¿por qué `restart` no es suficiente para todo?
- ¿qué ventaja te da `up --no-deps -d servicio`?
- ¿qué papel juega `up --build` cuando querés una solución rápida de un solo comando?
- ¿qué parte de este tema te parece más útil para el trabajo real del día a día?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- distinguir rebuild, recreate y restart
- saber cuándo conviene `docker compose build`
- saber cuándo conviene `docker compose up --build`
- saber cuándo conviene `docker compose restart`
- iterar sobre un servicio sin tocar innecesariamente el resto del stack

---

## Resumen del tema

- `docker compose build` reconstruye servicios cuando cambió su Dockerfile o el contenido del contexto de build. citeturn805636search0
- `docker compose up` recrea servicios si cambió la configuración o la imagen desde la creación del contenedor. citeturn805636search1
- `docker compose restart` reinicia servicios, pero no aplica cambios nuevos de `compose.yaml`. citeturn805636search2
- `docker compose up --build` construye y levanta en un solo flujo. citeturn805636search1turn805636search11
- Para redeploy de un solo servicio, Docker recomienda una secuencia como `docker compose build servicio` seguido de `docker compose up --no-deps -d servicio`. citeturn805636search12
- Este tema te da una base muy útil para iterar más rápido y con más criterio sobre stacks Compose.

---

## Próximo tema

En el próximo tema vas a meterte con otra pieza clave del día a día con Compose:

- logs
- estado de servicios
- diagnóstico rápido del stack
- cómo leer mejor qué está pasando cuando algo no arranca como esperabas
