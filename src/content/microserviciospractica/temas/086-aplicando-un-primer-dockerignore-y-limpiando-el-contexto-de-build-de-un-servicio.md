---
title: "Aplicando un primer .dockerignore y limpiando el contexto de build de un servicio"
description: "Primer paso práctico del siguiente subtramo del módulo 9. Creación de un primer .dockerignore real para reducir ruido en el contexto de construcción de un servicio de NovaMarket."
order: 86
module: "Módulo 9 · Refinamiento de imágenes Docker"
level: "intermedio"
draft: false
---

# Aplicando un primer `.dockerignore` y limpiando el contexto de build de un servicio

En la clase anterior dejamos algo bastante claro:

- el refinamiento de imágenes ya no puede quedarse solo en multi-stage build,
- el contexto de construcción también importa,
- y lo más sano ahora es empezar por una primera mejora simple y visible que vuelva más limpio el build de un servicio real.

Ahora toca el paso concreto:

**aplicar un primer `.dockerignore` y limpiar el contexto de build de un servicio de NovaMarket.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creado un primer `.dockerignore` real para un servicio del proyecto,
- mucho más claro qué archivos conviene dejar fuera del contexto de build,
- más limpio el proceso de construcción,
- y NovaMarket mejor preparado para sostener imágenes refinadas desde una lógica más completa, no solo desde el Dockerfile.

La meta de hoy no es optimizar exhaustivamente todos los módulos del proyecto.  
La meta es mucho más concreta: **hacer el primer recorte serio de ruido dentro del contexto de build para fijar un patrón reutilizable**.

---

## Estado de partida

Partimos de un sistema donde ya:

- varios Dockerfiles importantes usan multi-stage build,
- Compose ya depende bastante de esas imágenes,
- y el módulo ya dejó claro que ahora conviene cuidar mejor qué entra a la construcción.

Eso significa que el problema ya no es si `.dockerignore` sirve.  
Ahora la pregunta útil es otra:

- **qué conviene ignorar primero y cómo hacerlo sin romper el build**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir un servicio adecuado para inaugurar el patrón,
- detectar qué ruido evidente entra hoy al contexto,
- crear un `.dockerignore` razonable,
- volver a construir la imagen,
- y validar que el servicio sigue funcionando después del cambio.

---

## Qué servicio conviene elegir primero

A esta altura del curso, una muy buena primera opción vuelve a ser:

- `catalog-service`

¿Por qué?

Porque:

- ya fue usado en otros refinamientos,
- tiene un Dockerfile que ya conocemos bien,
- y permite concentrarnos en el contexto de build sin mezclar demasiados detalles extra.

Eso lo vuelve un gran primer candidato para esta mejora.

---

## Qué tipo de ruido conviene atacar primero

Este punto importa muchísimo.

En una primera pasada, lo más sano no es intentar una lista inmensa de exclusiones.

Conviene empezar por ruido muy claro y muy común, por ejemplo:

- `target/`
- `.idea/`
- `.vscode/`
- archivos `.log`
- `.DS_Store`
- `Thumbs.db`

Ese recorte inicial ya aporta muchísimo valor sin meternos todavía en optimizaciones demasiado finas.

---

## Paso 1 · Crear un archivo `.dockerignore`

Dentro de `catalog-service`, creá un archivo:

```txt
.dockerignore
```

Una primera versión razonable y muy didáctica podría verse así:

```txt
target
.idea
.vscode
*.log
.DS_Store
Thumbs.db
```

Esta versión ya tiene muchísimo valor porque ataca varias fuentes de ruido evidentes sin tocar nada delicado del build.

---

## Paso 2 · Entender por qué estas entradas son buenas primeras candidatas

Conviene leerlas con calma:

### `target`
No conviene meter al contexto artefactos de build previos si el Dockerfile ya construye adentro con multi-stage.

### `.idea` y `.vscode`
Son carpetas del editor o del IDE; no pertenecen al build real del servicio.

### `*.log`
Logs locales no aportan nada útil a la construcción de la imagen.

### `.DS_Store` y `Thumbs.db`
Son ruido del sistema operativo, no parte del proyecto.

Este análisis importa muchísimo porque evita que `.dockerignore` se convierta en una lista memorizada sin criterio.

---

## Paso 3 · Entender qué cambia con `target` si usás multi-stage build

Este punto vale muchísimo.

Si tu Dockerfile simple anterior copiaba el `.jar` desde `target/`, ignorar `target` habría sido problemático.

Pero ahora que el Dockerfile multi-stage construye el artefacto **dentro** de la etapa de build, ya no necesitás depender del `target/` local como parte del contexto.

Ese cambio muestra muy bien cómo distintos refinamientos del módulo se conectan entre sí.

---

## Paso 4 · Reconstruir la imagen

Ahora construí de nuevo la imagen:

```bash
docker build -t novamarket/catalog-service:dev .
```

La idea es validar que el servicio sigue construyéndose correctamente, pero ahora con un contexto más limpio.

Ese es uno de los momentos más importantes de la clase, porque demuestra que `.dockerignore` no es una decoración: cambia de verdad el material que entra al build.

---

## Paso 5 · Levantar el contenedor refinado

Ahora ejecutá el contenedor como venías haciendo:

```bash
docker run --rm -p 8081:8081 novamarket/catalog-service:dev
```

La idea sigue siendo la misma:

- el refinamiento ocurre en cómo construimos,
- pero el servicio debería seguir siendo funcionalmente el mismo desde afuera.

Ese contraste tiene muchísimo valor.

---

## Paso 6 · Probar el endpoint del catálogo

Ahora verificá:

```bash
curl http://localhost:8081/products
curl http://localhost:8081/products/1
```

Lo importante es confirmar que:

- el `.dockerignore` no rompió el build,
- el contenedor arranca,
- y el refinamiento del contexto ya es una mejora real y no solo una intención bonita.

---

## Paso 7 · Entender qué acabamos de ganar

Este punto importa muchísimo.

Hasta ahora, el refinamiento de imágenes ya trabajaba sobre:

- Dockerfile
- build stages
- runtime final

Ahora, en cambio, también empieza a trabajar sobre:

- **qué entra al proceso de construcción**

Ese salto vuelve al bloque mucho más completo y mucho más profesional.

---

## Paso 8 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya tiene perfectamente resuelto el contexto de build de todos sus servicios”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene un primer `.dockerignore` útil y un patrón inicial para limpiar contexto de build sin romper el servicio.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase aplica un primer `.dockerignore` real sobre un servicio de NovaMarket.

Ya no estamos solo refinando la imagen final.  
Ahora también estamos haciendo que el proceso de construcción reciba un contexto bastante más limpio y más razonable.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- extendimos todavía este patrón al resto de los servicios,
- ni consolidamos aún este subbloque con un checkpoint fuerte.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dar el primer paso real para que el build de NovaMarket deje de arrastrar parte del ruido local más evidente.**

---

## Errores comunes en esta etapa

### 1. Ignorar archivos sin entender si el Dockerfile los necesita
El criterio importa muchísimo.

### 2. Olvidar que multi-stage build cambia qué cosas ya no necesitás mandar al contexto
Ese punto es parte central del valor del bloque.

### 3. Querer escribir un `.dockerignore` gigantesco de una sola vez
En esta etapa, lo sano es empezar por ruido claro y evidente.

### 4. No reconstruir ni volver a probar el servicio
La verificación sigue siendo parte esencial de la clase.

### 5. Pensar que esto solo mejora estética del proyecto
En realidad mejora bastante la limpieza del build.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- `catalog-service` ya tiene un `.dockerignore` útil,
- la imagen sigue construyéndose correctamente,
- el servicio sigue funcionando,
- y NovaMarket ya dio un primer paso serio hacia un contexto de build más limpio.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué entradas conviene ignorar primero,
- ves por qué el contexto ahora está más limpio,
- el servicio sigue respondiendo correctamente,
- y sentís que el proyecto ya dejó de refinar imágenes solo desde el Dockerfile final.

Si eso está bien, ya podemos pasar al siguiente tema y consolidar este nuevo subbloque del roadmap operativo.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta primera capa de limpieza del contexto de build, leyendo con más claridad qué nueva postura ganó NovaMarket después de empezar a cuidar también `.dockerignore`.

---

## Cierre

En esta clase aplicamos un primer `.dockerignore` y limpiamos el contexto de build de un servicio.

Con eso, NovaMarket deja de tratar la construcción de imágenes como si cualquier archivo local pudiera viajar sin costo ni criterio al build y empieza a sostener un proceso bastante más limpio, bastante más claro y mucho más alineado con una práctica seria de Docker.
