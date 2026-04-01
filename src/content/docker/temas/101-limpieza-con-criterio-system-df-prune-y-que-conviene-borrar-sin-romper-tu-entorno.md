---
title: "Limpieza con criterio: system df, prune y qué conviene borrar sin romper tu entorno"
description: "Tema 101 del curso práctico de Docker: cómo limpiar imágenes, contenedores, redes, volúmenes y caché de build con más criterio, usando docker system df y los distintos prune commands para no borrar a ciegas ni perder datos importantes."
order: 101
module: "Limpieza, mantenimiento y entorno local sano"
level: "intermedio"
draft: false
---

# Limpieza con criterio: system df, prune y qué conviene borrar sin romper tu entorno

## Objetivo del tema

En este tema vas a:

- entender qué recursos de Docker suelen acumularse con el tiempo
- inspeccionar consumo antes de borrar
- distinguir qué limpian `image prune`, `volume prune`, `builder prune` y `system prune`
- evitar borrar datos persistentes o cachés útiles sin querer
- construir un criterio mucho más sano para mantener tu entorno local

La idea es que no uses `prune` como un martillo para todo, sino como un conjunto de herramientas con riesgos y alcances distintos.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. mirar primero cuánto espacio está usando Docker
2. distinguir imágenes, contenedores, redes, volúmenes y build cache
3. ver qué limpia cada comando `prune`
4. entender por qué `volume prune` merece más cuidado
5. construir una regla práctica para limpiar sin romper cosas útiles

---

## Idea central que tenés que llevarte

Docker va acumulando recursos con el tiempo:

- imágenes viejas
- contenedores detenidos
- redes sin uso
- volúmenes no referenciados
- caché de build

La documentación oficial lo deja bastante claro: `docker system df` muestra cuánto espacio usa Docker, `docker system prune` es un atajo para limpiar varios tipos de recursos no usados, y existen prunes más específicos para imágenes, volúmenes, redes y build cache. Volúmenes no se eliminan por defecto con `system prune` salvo que agregues `--volumes`, y Docker advierte que operaciones de borrado pueden causar pérdida permanente de datos si no sabés qué estás borrando. citeturn573045search2turn573045search5turn573045search7turn573045search3turn573045search1turn573045search16turn573045search23

Dicho simple:

> primero mirá qué está ocupando espacio;  
> después elegí el prune correcto;  
> y con volúmenes, pensá dos veces.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker deja varias ideas muy claras para este tema:

- `docker system df` muestra el uso de disco del daemon de Docker. citeturn573045search2
- `docker system prune` elimina contenedores detenidos, redes no usadas, imágenes dangling y build cache no usada; con `-a` amplía la limpieza a imágenes no usadas, y con `--volumes` también elimina volúmenes anónimos no usados. citeturn573045search0turn573045search5
- `docker image prune -a` elimina imágenes no usadas por al menos un contenedor. citeturn573045search7
- `docker volume prune` elimina volúmenes locales no usados; por defecto apunta a volúmenes anónimos no referenciados por contenedores. citeturn573045search3turn573045search10turn573045search17
- `docker network prune` elimina redes no usadas por ningún contenedor. citeturn573045search16
- `docker builder prune` limpia caché de build, con opciones como `-a`, filtros y `--keep-storage`; y Docker también documenta `docker buildx prune` para builders BuildKit/buildx. citeturn573045search1turn573045search8turn573045search21

---

## Primer concepto: mirá antes de borrar

El mejor primer comando del bloque es:

```bash
docker system df
```

Docker documenta que este comando muestra el uso de disco de Docker. citeturn573045search2

### Qué gana este comando
- te da una idea de cuánto pesan imágenes, contenedores, volúmenes y caché
- te evita borrar a ciegas
- te ayuda a elegir el `prune` correcto

Este es el punto de partida más sano.

---

## Segundo concepto: no todo lo que sobra es igual

No es lo mismo limpiar:

- imágenes viejas
- contenedores detenidos
- redes huérfanas
- volúmenes con datos
- caché de build

Cada una de esas categorías tiene riesgos distintos.

### Riesgo bajo típico
- redes no usadas
- contenedores detenidos que ya no te sirven

### Riesgo medio
- imágenes que quizás querías reutilizar sin rebuild

### Riesgo alto
- volúmenes con datos que después extrañás
- caché de build que te acelera mucho el trabajo diario

Por eso conviene afinar el bisturí antes de sacar la motosierra.

---

## Tercer concepto: `docker system prune`

Docker documenta `docker system prune` como un atajo para limpiar varios tipos de recursos no usados. citeturn573045search0turn573045search5

### Qué limpia por defecto
- contenedores detenidos
- redes no usadas por al menos un contenedor
- imágenes dangling
- build cache no usada citeturn573045search0turn573045search5

### Qué no limpia por defecto
- volúmenes, salvo que agregues `--volumes` citeturn573045search5

---

## Cómo leer `system prune`

La lectura conceptual sería:

- “quiero una limpieza general relativamente segura”
- “no quiero tocar volúmenes todavía”
- “quiero recuperar espacio básico sin entrar en detalle fino”

Eso lo vuelve útil.
Pero no siempre es la mejor primera herramienta si querés más control.

---

## Cuarto concepto: `docker image prune`

Docker documenta que `docker image prune -a` elimina imágenes no usadas por al menos un contenedor. citeturn573045search7

### Cuándo ayuda
- acumulaste muchas imágenes viejas
- reconstruiste mucho
- tenés tags o layers que ya no está usando nada

### Qué riesgo tiene
- quizás borres imágenes que te habría convenido conservar para arrancar rápido o comparar algo

No es un riesgo gravísimo.
Pero vale la pena saberlo.

---

## Quinto concepto: `docker volume prune`

Acá empieza la parte donde más cuidado conviene tener.

Docker documenta que `docker volume prune` elimina volúmenes locales no usados, y la documentación de volumes recuerda que los volúmenes son la opción preferida para datos persistentes de contenedores. citeturn573045search3turn573045search10turn573045search17

### Qué significa eso en práctica
- si un volumen ya no está referenciado por contenedores, puede parecer “sobrante”
- pero podría contener datos que sí te importan

Entonces, aunque sea técnicamente “unused”, no siempre es “descartable”.

---

## Qué merece más cuidado que `system prune`

Sin duda:

```bash
docker volume prune
```

y también:

```bash
docker system prune --volumes
```

porque ahí ya entrás en terreno de posible pérdida de datos persistentes. Docker advierte de forma general que operaciones como `docker system prune` o `docker volume rm` pueden causar pérdida permanente de datos. citeturn573045search23

---

## Sexto concepto: `docker network prune`

Docker documenta que `docker network prune` elimina redes no usadas por ningún contenedor. citeturn573045search16

En general, este suele ser de los prunes menos dramáticos, porque las redes huérfanas son bastante comunes en entornos donde levantás y bajás stacks seguido.

Igual, como siempre:
mejor saber qué estás limpiando que dispararlo por reflejo.

---

## Séptimo concepto: `docker builder prune`

Docker documenta `docker builder prune` para limpiar build cache, con opciones como:

- `-a`
- `--filter`
- `--keep-storage` citeturn573045search1

Y también documenta `docker buildx prune` cuando trabajás con buildx/BuildKit. citeturn573045search21

---

## Qué enseñanza deja esto

Deja una idea muy útil:

> si el problema principal es espacio tomado por builds y caché,  
> muchas veces el comando correcto no es `system prune`, sino `builder prune`.

Eso te da una limpieza más enfocada.

---

## Qué riesgo tiene limpiar build cache

El riesgo no suele ser pérdida de datos de negocio.
El riesgo suele ser otro:

- builds más lentas después
- necesidad de reconstruir capas que estaban cacheadas

O sea:
más costo de tiempo que de información.

Por eso muchas veces conviene limpiar cache con más criterio que impulsividad.

---

## Un flujo sano de limpieza

Un flujo razonable podría ser:

### 1. Mirar uso
```bash
docker system df
```

### 2. Si sobran contenedores/redes/imágenes dangling
```bash
docker system prune
```

### 3. Si el problema principal son imágenes no usadas
```bash
docker image prune -a
```

### 4. Si el problema principal es build cache
```bash
docker builder prune
```

### 5. Si realmente sabés que hay volúmenes descartables
```bash
docker volume prune
```

Este orden mental suele ser mucho más sano que empezar por `system prune --volumes`.

---

## Qué no tenés que confundir

### “Unused” no siempre significa “sin valor”
Especialmente con volúmenes.

### `system prune` no limpia todo por defecto
No toca volúmenes salvo `--volumes`. citeturn573045search5

### Limpiar build cache no es lo mismo que limpiar imágenes
Son categorías distintas.

### Ver poco espacio libre no significa automáticamente que el culpable sea una sola categoría
Primero conviene mirar con `docker system df`. citeturn573045search2

---

## Error común 1: arrancar por `docker system prune --volumes` sin mirar nada antes

Ahí podés llevarte por delante datos que querías conservar.

---

## Error común 2: usar `image prune -a` o `builder prune -a` como rutina automática sin pensar en el costo de reconstrucción

A veces liberás espacio a costa de ralentizar bastante tu flujo.

---

## Error común 3: pensar que `volume prune` es tan inocente como limpiar redes huérfanas

No lo es.
Los volúmenes suelen ser donde viven datos importantes.

---

## Error común 4: no distinguir cache de build, imágenes no usadas y datos persistentes

Eso lleva a usar el prune equivocado para el problema equivocado.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Respondé con tus palabras:

- para qué sirve `docker system df`
- por qué conviene usarlo antes de borrar
- qué diferencia conceptual ves entre imágenes, volúmenes y build cache

### Ejercicio 2
Compará estos comandos:

```bash
docker system prune
docker image prune -a
docker volume prune
docker builder prune
```

Respondé:

- qué limpia cada uno
- cuál te parece más general
- cuál te parece más peligroso para datos
- cuál usarías si el problema principal fueran builds viejas

### Ejercicio 3
Respondé además:

- por qué `docker system prune` no toca volúmenes por defecto
- por qué `docker volume prune` merece más respeto
- qué costo podrías pagar al limpiar demasiado la build cache

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué suele acumularse más en tu entorno: imágenes, caché o volúmenes
- si hoy te convendría más `system df` que un prune directo
- qué categoría te da más miedo limpiar
- qué comando te gustaría usar primero con más criterio
- qué cambio concreto harías para mantener el entorno más sano sin borrar cosas valiosas

No hace falta ejecutar nada todavía.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre limpiar espacio y borrar datos?
- ¿en qué proyecto tuyo hoy el problema parece más de caché que de imágenes?
- ¿qué parte del entorno local te parece más delicada de tocar?
- ¿qué prune te parece más fácil de usar mal?
- ¿qué mejora concreta te gustaría notar al limpiar con más método?

Estas observaciones valen mucho más que memorizar flags.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero mirar primero qué está ocupando espacio, probablemente me conviene usar `docker system ________`.  
> Si quiero una limpieza general sin tocar volúmenes por defecto, probablemente me conviene usar `docker system ________`.  
> Si quiero limpiar caché de build, probablemente me conviene usar `docker builder ________`.  
> Si quiero limpiar volúmenes, debería hacerlo con más cuidado porque podría perder ________.

Y además respondé:

- ¿por qué este tema impacta tanto en mantener un entorno local sano?
- ¿qué recurso tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no borrar a ciegas?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- mirar primero el uso de disco de Docker antes de borrar
- distinguir mejor qué limpia cada familia de `prune`
- identificar cuándo el riesgo es más de tiempo y cuándo es más de datos
- usar con mucho más criterio `system prune`, `image prune`, `volume prune` y `builder prune`
- mantener tu entorno bastante más limpio sin romper cosas valiosas por reflejo

---

## Resumen del tema

- `docker system df` muestra el uso de disco del daemon de Docker. citeturn573045search2
- `docker system prune` limpia contenedores detenidos, redes no usadas, imágenes dangling y build cache no usada; con `--volumes` también puede limpiar volúmenes anónimos no usados. citeturn573045search0turn573045search5
- `docker image prune -a` elimina imágenes no usadas por al menos un contenedor. citeturn573045search7
- `docker volume prune` elimina volúmenes locales no usados y merece más cuidado porque los volúmenes suelen contener datos persistentes. citeturn573045search3turn573045search10turn573045search17
- `docker network prune` elimina redes no usadas y `docker builder prune` limpia caché de build. citeturn573045search16turn573045search1
- Docker advierte que operaciones de borrado pueden causar pérdida permanente de datos si no sabés bien qué estás eliminando. citeturn573045search23
- Este tema te deja una base mucho más clara para limpiar Docker con criterio en vez de borrar a ciegas.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque con una práctica integrada:

- mirar uso
- distinguir categorías
- elegir el prune correcto
- y limpiar un entorno Docker de forma mucho más razonable de punta a punta
