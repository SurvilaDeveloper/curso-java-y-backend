---
title: "Práctica integrada de limpieza: mirar uso, elegir el prune correcto y mantener Docker más sano"
description: "Tema 102 del curso práctico de Docker: una práctica integrada donde combinás docker system df, image prune, builder prune, volume prune y system prune para limpiar con criterio sin borrar datos persistentes o cachés útiles por reflejo."
order: 102
module: "Limpieza, mantenimiento y entorno local sano"
level: "intermedio"
draft: false
---

# Práctica integrada de limpieza: mirar uso, elegir el prune correcto y mantener Docker más sano

## Objetivo del tema

En este tema vas a:

- juntar en una sola práctica varias ideas del bloque de limpieza
- mirar primero qué está ocupando espacio antes de borrar
- distinguir imágenes, contenedores, redes, volúmenes y caché de build
- elegir el `prune` correcto según el problema real
- evitar borrar volúmenes o cachés útiles sin pensar
- terminar con una forma mucho más sana de mantener tu entorno Docker

La idea es cerrar este bloque con un flujo integrado: primero observar, después decidir, y recién al final limpiar.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. partir de un entorno Docker que ya acumuló bastante “resto”
2. inspeccionar el uso de espacio con `docker system df`
3. identificar si el problema parece ser de imágenes, contenedores, volúmenes o build cache
4. elegir el prune más preciso posible
5. tratar los volúmenes con mucho más cuidado que el resto
6. cerrar con una rutina de limpieza mucho más razonable

---

## Idea central que tenés que llevarte

Ya viste en el tema anterior que Docker acumula cosas con el tiempo:

- imágenes viejas
- contenedores detenidos
- redes huérfanas
- volúmenes no referenciados
- caché de build

Este tema junta todo eso con una idea muy concreta:

> limpiar bien no es “borrar mucho”;  
> es borrar lo correcto, con el alcance correcto y después de mirar primero qué está ocupando espacio.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker documenta que `docker system df` muestra el uso de disco del daemon, y que `docker system prune` es un atajo para eliminar contenedores detenidos, redes no usadas, imágenes dangling y build cache no usada. También documenta que `docker system prune -a` amplía la limpieza a imágenes no usadas, mientras que los volúmenes **no** se eliminan por defecto salvo que agregues `--volumes`. Docker documenta comandos más específicos como `docker image prune -a`, `docker volume prune`, `docker network prune`, `docker builder prune` y `docker buildx prune`, y advierte que ciertas limpiezas pueden causar pérdida permanente de datos si no sabés bien qué estás borrando. Además, recuerda que los volúmenes son mecanismos persistentes gestionados por Docker y que conservan datos incluso después de remover los contenedores que los usaban. citeturn346903search7turn346903search0turn346903search1turn346903search5turn346903search2turn346903search9turn346903search16turn346903search8turn346903search12turn346903search23

---

## Escenario del tema

Vas a imaginar este caso:

- venís construyendo mucho
- levantaste y bajaste varios stacks
- tenés imágenes viejas, redes sueltas y bastante cache acumulada
- además, hay volúmenes con datos que no querés perder por accidente

Querés recuperar espacio, pero sin romper tu entorno ni llevarte datos útiles por delante.

Este es un caso perfecto para practicar limpieza con criterio.

---

## Primera reacción típica: borrar a ciegas

La reacción impulsiva más común suele ser algo así:

```bash
docker system prune -a --volumes
```

Sí, eso puede liberar bastante.

Pero también puede ser demasiado agresivo si no sabés qué estaba ocupando espacio ni qué recursos te importaba conservar.

En especial, el problema aparece cuando:

- el verdadero peso estaba en la build cache
- o había volúmenes que parecían “no usados”, pero contenían datos valiosos

Entonces, aunque ese comando exista, no conviene convertirlo en reflejo.

---

## Paso 1: mirar primero con `docker system df`

El punto de partida sano es:

```bash
docker system df
```

Docker documenta que este comando muestra el uso de disco del daemon. citeturn346903search7turn346903search2

### Qué te da
- una vista resumida del espacio ocupado por imágenes
- contenedores
- volúmenes locales
- build cache

Esto ya cambia muchísimo la calidad de la decisión que viene después.

---

## Qué enseñanza deja este primer paso

Deja una idea muy útil:

> si no miraste qué pesa, todavía no sabés qué limpiar.

Esto parece obvio, pero en la práctica evita muchísimos borrados torpes.

---

## Paso 2: reconocer el tipo de “suciedad”

Después de `docker system df`, el siguiente paso no es todavía borrar.
Es preguntar:

- ¿sobran contenedores detenidos?
- ¿sobran imágenes no usadas?
- ¿sobran redes huérfanas?
- ¿el gran problema es la build cache?
- ¿hay volúmenes que ya no quiero o que no estoy seguro de tocar?

Ese diagnóstico cambia completamente el comando correcto.

---

## Caso A: sobra “resto general” bastante inocente

Si el problema es algo general como:

- contenedores detenidos
- redes no usadas
- imágenes dangling
- build cache no usada

el comando razonable suele ser:

```bash
docker system prune
```

Docker documenta justamente ese alcance por defecto. citeturn346903search0turn346903search1

---

## Cómo se lee este comando

La lectura conceptual sería:

- quiero una limpieza general
- no quiero meterme todavía con volúmenes
- quiero sacar basura obvia del entorno

Este es un muy buen comando de mantenimiento general cuando el entorno ya juntó polvo, pero no querés entrar todavía en la parte delicada.

---

## Caso B: el problema principal son imágenes viejas

Si el problema es que acumulaste muchas imágenes no usadas, ahí el comando más preciso puede ser:

```bash
docker image prune -a
```

Docker documenta que esto elimina imágenes no usadas por al menos un contenedor. citeturn346903search5

---

## Qué gana este camino

Gana foco.

Porque en vez de hacer un prune general, estás atacando justamente la categoría que parece estar ocupando espacio.

### Qué trade-off tiene
- quizá después tengas que volver a descargar o reconstruir algunas imágenes
- pero el riesgo principal suele ser de tiempo, no de datos persistentes

---

## Caso C: el problema principal es la build cache

Acá aparece un matiz muy importante.

Si lo que pesa de verdad es el trabajo acumulado de builds, el comando más lógico puede no ser `system prune`, sino:

```bash
docker builder prune
```

Docker documenta este comando para limpiar build cache y ofrece opciones como `-a`, filtros y `--keep-storage`. citeturn346903search2

Si trabajás con buildx/BuildKit más explícitamente, Docker también documenta:

```bash
docker buildx prune
```

citeturn346903search12

---

## Qué gana este camino

Gana precisión.

Porque no estás tocando imágenes, contenedores o volúmenes si el verdadero problema era solo la caché de build.

### Qué costo puede tener
- próximos builds más lentos
- pérdida de capas cacheadas que venías reutilizando

O sea:
normalmente el riesgo acá es productividad, no datos de negocio.

---

## Caso D: el problema parecen ser volúmenes

Acá es donde más cuidado conviene tener.

Docker documenta que los volúmenes son almacenamiento persistente administrado por Docker y que conservan datos aunque elimines los contenedores que los usaban. También documenta que `docker volume prune` elimina volúmenes locales no usados, y que por defecto apunta a volúmenes anónimos no referenciados por contenedores. citeturn346903search8turn346903search9turn346903search3

Entonces, aunque un volumen aparezca como “unused”, eso no significa automáticamente que sea descartable.

---

## Qué hace delicado a `docker volume prune`

Hace delicada esta idea:

> un volumen puede no estar conectado hoy a ningún contenedor,  
> y aun así contener datos que sí querías conservar.

Por eso, incluso si el comando correcto fuera:

```bash
docker volume prune
```

conviene pensar bastante más antes de correrlo que en el caso de redes huérfanas o contenedores detenidos.

---

## Un flujo sano integrado

Mirá este flujo razonable de punta a punta:

### 1. Mirar uso
```bash
docker system df
```

### 2. Si el problema parece general, pero no querés tocar volúmenes
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

o, si corresponde:

```bash
docker buildx prune
```

### 5. Si sabés muy bien lo que hacés y el problema son volúmenes realmente descartables
```bash
docker volume prune
```

Este flujo ya se siente mucho más profesional que empezar por el comando más destructivo.

---

## Qué pasa con `docker system prune -a`

Docker documenta que `-a` amplía la limpieza para incluir imágenes no usadas, no solo dangling. citeturn346903search0turn346903search5

Eso lo vuelve más agresivo que el `system prune` básico.

### Cuándo podría tener sentido
- el entorno está realmente muy sucio
- sabés que no te importa conservar imágenes no usadas
- querés recuperar espacio rápido y aceptás el costo de volver a descargar o reconstruir

### Cuándo conviene pensarlo dos veces
- si el verdadero problema era otra categoría
- si esas imágenes todavía te ahorraban tiempo de trabajo

---

## Qué pasa con `docker system prune --volumes`

Docker documenta que `--volumes` suma la limpieza de volúmenes anónimos no usados. citeturn346903search0turn346903search1

Esto importa muchísimo porque cambia el nivel de riesgo.
Ya no estás solo limpiando “resto general”.
Ahora entrás en almacenamiento persistente.

Ese es justo el punto donde conviene dejar de actuar por reflejo.

---

## Qué te enseña realmente esta práctica

Te enseña a pensar limpieza así:

- observar primero
- diagnosticar categoría
- limpiar con el comando más preciso posible
- tratar volúmenes como almacenamiento valioso hasta demostrar lo contrario
- aceptar que limpiar cache o imágenes puede ahorrarte espacio pero costarte tiempo después

Ese cambio mental vale muchísimo más que recordar una lista de prunes.

---

## Qué no tenés que confundir

### Más espacio recuperado no siempre significa mejor decisión
Podría significar que borraste más de lo que necesitabas.

### Imagen no usada no es lo mismo que volumen no usado
El riesgo asociado es totalmente distinto.

### `system prune` no es lo mismo que `builder prune`
Uno limpia varias categorías; el otro apunta a build cache.

### `volume prune` no es un paso “de rutina” tan inocente como limpiar redes
Suele merecer bastante más cuidado.

---

## Error común 1: usar siempre `docker system prune -a --volumes` como receta universal

Eso mezcla demasiadas categorías y demasiado riesgo en un solo gesto.

---

## Error común 2: limpiar build cache cuando el problema real eran imágenes viejas o contenedores detenidos

Ahí solo empeoraste tiempos de build sin resolver del todo el problema.

---

## Error común 3: tratar los volúmenes “no usados” como si fueran basura obvia

A veces ahí vive justo la data que querías conservar.

---

## Error común 4: no mirar nunca con `docker system df`

Sin observación previa, el prune se vuelve adivinanza.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Tomá este flujo:

```bash
docker system df
docker system prune
docker image prune -a
docker builder prune
docker volume prune
```

Respondé con tus palabras:

- qué rol cumple cada comando
- cuál usarías primero siempre
- cuál te parece más general
- cuál te parece más específico
- cuál te parece más peligroso para datos

### Ejercicio 2
Imaginá tres escenarios:

#### Escenario A
El entorno acumuló contenedores detenidos, redes huérfanas e imágenes dangling.

#### Escenario B
El entorno tiene muchísima build cache acumulada.

#### Escenario C
El entorno tiene volúmenes que parecen “no usados”, pero no estás seguro si guardaban datos valiosos.

Respondé:

- qué comando elegirías primero en cada caso
- por qué
- qué evitarías hacer de entrada

### Ejercicio 3
Respondé además:

- por qué `docker system df` mejora tanto la toma de decisiones
- por qué el costo de limpiar build cache suele ser distinto del costo de borrar volúmenes
- por qué este bloque insiste tanto en no borrar a ciegas

---

## Segundo ejercicio de análisis

Pensá en uno de tus entornos Docker y respondé:

- qué categoría creés que más te consume hoy: imágenes, volúmenes o caché
- si tu impulso hoy sería usar un prune demasiado general
- qué recurso te daría más miedo borrar
- qué comando te gustaría empezar a usar primero con más criterio
- qué cambio concreto harías para mantener ese entorno más sano sin destruir cosas valiosas

No hace falta ejecutar nada todavía.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre observar y limpiar?
- ¿en qué proyecto tuyo hoy el problema parece más de build cache que de imágenes?
- ¿qué recurso hoy tratarías con más cautela?
- ¿qué prune te parece más fácil de usar mal si estás apurado?
- ¿qué mejora concreta te gustaría notar al limpiar con más método?

Estas observaciones valen mucho más que memorizar flags.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si primero quiero mirar qué está ocupando espacio, probablemente me conviene usar `docker system ________`.  
> Si quiero una limpieza general relativamente segura sin tocar volúmenes por defecto, probablemente me conviene usar `docker system ________`.  
> Si el problema principal es la caché de build, probablemente me conviene usar `docker builder ________` o `docker buildx ________`.  
> Si el recurso que voy a tocar puede contener datos persistentes, probablemente me conviene tener mucho más cuidado con los ________.

Y además respondé:

- ¿por qué esta práctica te parece mucho más sana que borrar por impulso?
- ¿qué parte de tu entorno te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no usar siempre el prune más agresivo?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- combinar observación y limpieza en una misma rutina mucho más sana
- elegir mejor entre `system prune`, `image prune`, `volume prune` y `builder prune`
- distinguir mejor cuándo el riesgo es más de tiempo y cuándo es más de datos
- mantener tu entorno local más limpio sin usar comandos destructivos por reflejo
- pensar la limpieza de Docker con bastante más criterio de punta a punta

---

## Resumen del tema

- `docker system df` sirve para ver uso de disco antes de decidir qué limpiar. citeturn346903search7turn346903search2
- `docker system prune` limpia contenedores detenidos, redes no usadas, imágenes dangling y build cache no usada; con `-a` amplía la limpieza de imágenes y con `--volumes` también puede tocar volúmenes anónimos no usados. citeturn346903search0turn346903search1
- `docker image prune -a` apunta a imágenes no usadas por contenedores. citeturn346903search5
- `docker builder prune` y `docker buildx prune` apuntan a caché de build. citeturn346903search2turn346903search12
- `docker volume prune` merece más cuidado porque los volúmenes son almacenamiento persistente administrado por Docker. citeturn346903search9turn346903search8
- Esta práctica te deja una forma mucho más clara de mantener Docker limpio sin confundir basura técnica con datos que todavía importan.

---

## Próximo tema

En el próximo bloque vas a empezar a moverte hacia otra capa muy importante del trabajo real con Docker:

- inspección más profunda
- metadata de contenedores e imágenes
- `inspect`
- y cómo mirar mejor lo que Docker ya sabe de tus recursos antes de actuar
