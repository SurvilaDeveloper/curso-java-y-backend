---
title: "Práctica integrada de publicación: build, múltiples tags, login y push con una estrategia clara"
description: "Tema 100 del curso práctico de Docker: una práctica integrada donde combinás nombre publicable, múltiples tags, docker login y docker push para pasar de una imagen local a una imagen realmente distribuible con más claridad y menos errores."
order: 100
module: "Publicación de imágenes, tags y registries"
level: "intermedio"
draft: false
---

# Práctica integrada de publicación: build, múltiples tags, login y push con una estrategia clara

## Objetivo del tema

En este tema vas a:

- juntar en una sola práctica varias ideas del bloque de publicación
- construir una imagen ya pensada para publicarse
- aplicarle múltiples tags con más intención
- autenticarte y hacer push sin mezclar conceptos
- dejar mucho más claro qué estás publicando, con qué nombre y para qué sirve cada tag

La idea es cerrar este bloque con un flujo completo, para que publicar una imagen deje de ser “subir algo a Docker Hub” y pase a ser una secuencia clara y mantenible.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. partir de una imagen local con nombre poco útil para compartir
2. darle un nombre publicable correcto
3. agregar varios tags con propósitos distintos
4. autenticarte en el registry
5. empujar la imagen con una estrategia de tags más clara
6. cerrar con una práctica integrada de publicación real

---

## Idea central que tenés que llevarte

En este bloque ya viste varias ideas muy importantes:

- una imagen necesita una referencia bien formada para poder publicarse
- el nombre completo ya indica a qué registry y repositorio va a intentar subirse
- un tag no es un adorno: comunica versión o variante
- `latest` puede servir como comodidad, pero rara vez debería ser la única historia
- una misma imagen puede llevar varios tags útiles a la vez

Este tema junta todo eso con una idea muy simple:

> publicar bien no es solo hacer `docker push`;  
> es construir, nombrar, tagear y empujar con una intención clara.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker explica que una referencia de imagen tiene el formato conceptual `[HOST[:PORT]/]NAMESPACE/REPOSITORY[:TAG]`, y que si no especificás tag el default es `latest`. También documenta que `docker image tag` asigna un nuevo nombre/tag a una imagen local, que `docker login` autentica contra un registry y que `docker image push` publica la imagen en Docker Hub o en un registry self-hosted según la referencia que le hayas dado. Docker Hub organiza el contenido por repositories y tags, y Docker también soporta `docker image push -a` para empujar todos los tags locales de una imagen. Además, Docker Hub soporta immutable tags, donde un tag ya publicado no puede sobrescribirse con otra imagen nueva. citeturn893564search4turn893564search5turn893564search2turn893564search7turn893564search3turn893564search1

---

## Escenario del tema

Vas a imaginar este caso:

- ya tenés una imagen que construiste localmente
- querés publicarla en Docker Hub
- querés que tenga más de un tag útil
- no querés depender solo de `latest`
- querés entender exactamente qué hace cada paso del flujo

Este es un caso perfecto para cerrar el bloque con una práctica completa.

---

## Primera versión: imagen local útil para vos, pero no para publicar

Imaginá que construiste esto:

```bash
docker build -t mi-app-local .
```

Ese nombre puede servirte en tu máquina.

Pero no está listo para publicarse de forma clara porque:

- no expresa namespace público
- no expresa repository real
- no dice nada sobre versión
- no deja claro a qué registry debería ir

Puede ser un buen nombre local de trabajo.
Pero no es todavía una referencia pensada para distribución.

---

## Paso 1: pensar el nombre publicable

Ahora imaginá que querés publicar en Docker Hub bajo tu namespace de usuario.

Una referencia razonable sería algo como:

```text
gabriel/mi-app:1.0.0
```

### Cómo se lee
- registry implícito: Docker Hub
- namespace: `gabriel`
- repository: `mi-app`
- tag: `1.0.0`

Esto ya expresa muchísimo mejor el destino y la intención de la imagen.

---

## Paso 2: build directo con nombre publicable o tag después

Tenés dos caminos razonables.

### Opción A: build directo con nombre publicable

```bash
docker build -t gabriel/mi-app:1.0.0 .
```

### Opción B: build local primero, tag después

```bash
docker build -t mi-app-local .
docker image tag mi-app-local gabriel/mi-app:1.0.0
```

Ambos son válidos.

La diferencia es si querés decidir el nombre publicable:

- durante el build
- o después

---

## Qué gana `docker image tag`

`docker image tag` no sube nada.
Solo crea una nueva referencia local hacia la misma imagen.

Eso significa que podés partir de un nombre local de trabajo y recién después preparar la imagen para el registry de destino.

Esto es especialmente útil cuando:

- todavía no decidiste la versión exacta al construir
- querés varias referencias para la misma imagen
- querés dejar un flujo local más libre antes de publicar

---

## Paso 3: agregar más de un tag útil

Ahora aparece una parte muy importante del bloque.

Imaginá que no querés publicar solo con:

```text
gabriel/mi-app:1.0.0
```

sino también con otros tags útiles.

Por ejemplo:

- `1.0.0` para versión exacta
- `1.0` para una rama menor
- `latest` como comodidad
- `sha-a1b2c3d` como referencia técnica exacta del build

Entonces podrías hacer algo así:

```bash
docker image tag gabriel/mi-app:1.0.0 gabriel/mi-app:1.0
docker image tag gabriel/mi-app:1.0.0 gabriel/mi-app:latest
docker image tag gabriel/mi-app:1.0.0 gabriel/mi-app:sha-a1b2c3d
```

---

## Cómo se lee esta estrategia

La lectura conceptual sería:

- una sola imagen local
- varias referencias útiles
- cada tag cuenta una parte distinta de la historia

### `1.0.0`
te da versión exacta legible.

### `1.0`
te da una serie menor útil.

### `latest`
te da comodidad como alias general.

### `sha-a1b2c3d`
te da trazabilidad técnica más fuerte.

Esta combinación suele ser muchísimo más clara que depender solo de `latest`.

---

## Paso 4: autenticarte

Antes de empujar, necesitás autenticarte.

El comando normal es:

```bash
docker login
```

Docker documenta que la autenticación puede hacerse con username y password o con access token, y que en Docker Hub el CLI usa por defecto un flujo basado en device code salvo que especifiques `--username`. También documenta el uso de personal access tokens como opción recomendada en muchos casos. citeturn893564search2turn893564search17

Para este tema alcanza con entender:

- si no estás autenticado, el push no va a funcionar como esperás
- y si el repository no es tuyo o no tenés permisos, tampoco

---

## Paso 5: empujar la imagen

Podés empujar un tag puntual:

```bash
docker push gabriel/mi-app:1.0.0
```

o, si ya preparaste varios tags sobre la misma imagen, podés empujarlos todos:

```bash
docker image push -a gabriel/mi-app
```

Docker documenta explícitamente la opción `-a` para empujar todos los tags locales de una imagen. citeturn893564search7

---

## Qué gana `push -a`

Gana algo muy práctico:

- no tenés que empujar cada tag por separado
- el flujo se vuelve más corto
- reducís la chance de olvidarte uno

Eso encaja perfecto cuando ya decidiste una estrategia de múltiples tags.

---

## Flujo integrado final de la práctica

Mirá este flujo completo:

```bash
docker build -t mi-app-local .
docker image tag mi-app-local gabriel/mi-app:1.0.0
docker image tag gabriel/mi-app:1.0.0 gabriel/mi-app:1.0
docker image tag gabriel/mi-app:1.0.0 gabriel/mi-app:latest
docker image tag gabriel/mi-app:1.0.0 gabriel/mi-app:sha-a1b2c3d
docker login
docker image push -a gabriel/mi-app
```

---

## Cómo se lee este flujo

La lectura conceptual sería:

1. construís la imagen local
2. le das una referencia publicable exacta
3. le agregás varios tags útiles
4. te autenticás
5. empujás todas las referencias que preparaste

Esto ya se parece bastante más a una publicación real que a “subir una imagen cualquiera”.

---

## Qué gana esta práctica frente a un flujo improvisado

Gana varias cosas a la vez:

- más claridad
- más trazabilidad
- mejor legibilidad humana
- menos dependencia de `latest`
- menos chance de errores de destino o permisos
- una base más sana para después automatizar en CI/CD

No es una mejora cosmética.
Es una mejora de criterio.

---

## Qué pasa si el registry no es Docker Hub

Si quisieras publicar a otro registry, el principio es el mismo.

Lo que cambia es el nombre.

Por ejemplo:

```text
ghcr.io/gabriel/mi-app:1.0.0
```

o:

```text
myregistryhost:5000/gabriel/mi-app:1.0.0
```

La documentación oficial de `docker image tag` remarca justamente que, si el registry es privado o distinto del default, el hostname y el puerto deben aparecer en la referencia. citeturn893564search4

La lógica del flujo no cambia.
Cambia la referencia completa.

---

## Qué pasa con immutable tags

Docker Hub soporta immutable tags.

Cuando están habilitados para el repository:

- no podés sobrescribir un tag ya publicado
- cada actualización necesita un tag nuevo citeturn893564search1

Esto refuerza muchísimo la idea de publicar con tags explícitos y con intención.
Porque deja de existir la “comodidad peligrosa” de reusar siempre el mismo tag sin pensar.

---

## Un error muy común: `requested access to the resource is denied`

Este error suele aparecer cuando:

- no hiciste `docker login`
- el namespace del nombre no es tuyo
- el repository no existe o no tenés permisos
- el nombre de la imagen no apunta a donde vos creías

La guía oficial de build/tag/publish justamente sugiere revisar login y username/repository cuando aparece este problema. citeturn893564search0

---

## Qué no tenés que confundir

### `docker image tag` no empuja nada
Solo crea otra referencia local. citeturn893564search0turn893564search4

### `docker push` no “elige destino”
El destino ya viene en la referencia completa. citeturn893564search7turn893564search4

### Un tag no reemplaza a otro automáticamente salvo que vos lo uses así
Podés tener muchos tags para la misma imagen local.

### `latest` no es “la versión correcta por definición”
Solo es el default si omitís tag. citeturn893564search5turn893564search1

---

## Error común 1: construir con un nombre local y después olvidar el paso de tag publicable

Ahí suele faltar `docker image tag`.

---

## Error común 2: publicar solo `latest`

Es cómodo, pero suele ser demasiado ambiguo.

---

## Error común 3: no verificar si el namespace del repository realmente es tuyo

Eso suele terminar en errores de acceso.

---

## Error común 4: crear múltiples tags pero empujar solo uno

Si querés que todos estén en el registry, o los empujás uno por uno o usás `push -a`. citeturn893564search7

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Tomá este flujo:

```bash
docker build -t mi-app-local .
docker image tag mi-app-local gabriel/mi-app:1.0.0
docker image tag gabriel/mi-app:1.0.0 gabriel/mi-app:1.0
docker image tag gabriel/mi-app:1.0.0 gabriel/mi-app:latest
docker image tag gabriel/mi-app:1.0.0 gabriel/mi-app:sha-a1b2c3d
docker login
docker image push -a gabriel/mi-app
```

Respondé con tus palabras:

- qué hace cada paso
- qué parte vuelve a la imagen “publicable”
- qué ventaja tiene usar varios tags
- qué ventaja tiene `push -a`

### Ejercicio 2
Respondé además:

- por qué `gabriel/mi-app:1.0.0` ya define el destino lógico del push
- por qué `mi-app-local` por sí sola no expresa bien un destino publicable
- qué error esperarías si no tuvieras permisos sobre `gabriel/mi-app`

### Ejercicio 3
Ahora imaginá que querés usar otro registry.
Respondé:

- qué debería cambiar en la referencia
- por qué el hostname del registry tendría que aparecer explícitamente
- qué parte del flujo seguiría igual

### Ejercicio 4
Respondé también:

- qué problema resuelve immutable tags
- por qué `latest` no debería ser tu única historia de publicación
- qué combinación de tags te parecería sana para uno de tus proyectos reales

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué nombre local le estás dando hoy a la imagen
- qué referencia publicable te gustaría usar
- qué tag exacto te gustaría publicar primero
- si además le pondrías `latest`
- si te gustaría sumar un tag por commit o build
- qué parte del flujo te gustaría dejar más clara antes de automatizarlo

No hace falta publicar nada todavía.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la secuencia build → tag → login → push?
- ¿en qué proyecto tuyo hoy el naming de la imagen todavía es demasiado local?
- ¿qué combinación de tags te daría mejor equilibrio entre claridad y trazabilidad?
- ¿qué parte del push te parece más fácil de romper: permisos, namespace o naming?
- ¿qué mejora concreta te gustaría notar al volver tu publicación más explícita?

Estas observaciones valen mucho más que memorizar cuatro comandos.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si construyo una imagen con un nombre solo local, probablemente me conviene después usar `docker image ________` para darle una referencia publicable.  
> Si quiero subirla al registry, probablemente me conviene hacer `docker ________`.  
> Si quiero publicar varias referencias útiles para la misma imagen, probablemente me conviene crear varios ________.  
> Si quiero empujarlos todos de una vez, probablemente me conviene usar `docker image push ________`.  
> Si quiero que un tag no pueda sobrescribirse accidentalmente, debería pensar en tags ________.

Y además respondé:

- ¿por qué esta práctica te parece mucho más clara de punta a punta?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no improvisar nombre, namespace y tags al momento de publicar?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- pasar de una imagen local a una imagen publicable con un flujo claro
- usar `docker image tag`, `docker login` y `docker image push` con más criterio
- crear múltiples tags útiles sobre una misma imagen
- empujar varios tags sin confusión
- entender mejor cómo el nombre completo de la imagen ya define el destino de publicación
- pensar una estrategia de publicación mucho más explícita y mantenible

---

## Resumen del tema

- Una referencia de imagen tiene la forma conceptual `[HOST[:PORT]/]NAMESPACE/REPOSITORY[:TAG]`. citeturn893564search4
- Si no especificás tag, Docker usa `latest`. citeturn893564search5turn893564search1
- `docker image tag` asigna nuevos nombres/tags a una imagen local. citeturn893564search0turn893564search4
- Antes de poder hacer push, necesitás autenticarte con `docker login`. citeturn893564search2turn893564search17
- `docker image push` publica la imagen en Docker Hub o en otro registry según la referencia completa, y `-a` permite empujar todos los tags locales. citeturn893564search7turn893564search3
- Docker Hub soporta immutable tags, donde un tag ya publicado no puede sobrescribirse. citeturn893564search1
- Esta práctica te deja una base mucho más madura para publicar imágenes con una estrategia clara y mucho menos improvisada.

---

## Próximo tema

En el próximo bloque vas a empezar a moverte hacia otra capa muy importante del trabajo real con Docker:

- limpieza
- recursos que sobran
- imágenes, contenedores, volúmenes y cachés viejas
- y cómo mantener tu entorno local razonablemente sano mientras trabajás
