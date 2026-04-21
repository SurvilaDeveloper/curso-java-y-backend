---
title: "Entendiendo por qué .dockerignore y el contexto de build ya importan en NovaMarket"
description: "Inicio del siguiente subtramo del módulo 9. Comprensión de por qué, después de introducir multi-stage build, ya conviene prestar atención al contexto de construcción y a .dockerignore."
order: 85
module: "Módulo 9 · Refinamiento de imágenes Docker"
level: "intermedio"
draft: false
---

# Entendiendo por qué `.dockerignore` y el contexto de build ya importan en NovaMarket

En las últimas clases del módulo 9 dimos un paso muy importante dentro del roadmap operativo de NovaMarket:

- entendimos por qué las imágenes ya no podían quedarse en un nivel meramente didáctico,
- introdujimos **multi-stage build**,
- y además empezamos a extender ese patrón al núcleo principal de servicios del sistema.

Eso ya tiene muchísimo valor.

Pero ahora aparece otra pregunta muy natural:

**si ya estamos refinando imágenes, cuándo empieza a tener sentido mirar no solo el Dockerfile, sino también qué cosas le estamos enviando al build como contexto?**

Ese es el terreno de esta clase.

Porque una cosa es mejorar la separación entre build y runtime.

Y otra bastante distinta es mirar qué archivos entran al proceso de construcción, cuánto ruido arrastra ese contexto y cómo eso afecta la limpieza general del empaquetado.

Ese es exactamente el siguiente problema que conviene abrir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- claro por qué `.dockerignore` ya tiene sentido en este punto del proyecto,
- entendida la diferencia entre “Dockerfile mejorado” y “proceso de build realmente más limpio”,
- alineado el modelo mental para empezar a reducir ruido en el contexto de construcción,
- y preparado el terreno para aplicar una primera mejora concreta en la próxima clase.

Todavía no vamos a rediseñar toda la estrategia de build del stack.  
La meta de hoy es entender por qué este nuevo frente aparece exactamente ahora.

---

## Estado de partida

Partimos de un sistema donde ya:

- varias imágenes importantes fueron refinadas con multi-stage build,
- Compose ya depende bastante de ellas como soporte operativo serio,
- y el proyecto ya dejó de estar en la etapa donde cualquier Dockerfile básico alcanzaba.

Eso significa que el problema ya no es solo:

- “cómo separo build y runtime”
- o
- “cómo mejoro la imagen final”

Ahora empieza a importar otra pregunta:

- **qué archivos y carpetas viajan al build aunque en realidad no deberían formar parte de ese proceso**

Y esa pregunta cambia bastante el nivel del módulo.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué significa realmente el contexto de build en Docker,
- entender por qué puede arrastrar ruido innecesario,
- conectar esta idea con el estado actual de NovaMarket,
- y dejar clara la lógica del siguiente subtramo del roadmap operativo.

---

## Qué problema queremos resolver exactamente

Hasta ahora ya logramos algo importante:

- las imágenes pueden construirse de una forma más profesional.

Eso fue un gran salto.

Pero a medida que el bloque madura, aparece otra necesidad muy concreta:

**que el build no arrastre sin necesidad archivos, carpetas o artefactos que no aportan valor y que solo ensucian o agrandan el contexto de construcción.**

Porque ahora conviene hacerse preguntas como:

- ¿qué le mando realmente a Docker cuando ejecuto `docker build`?
- ¿estoy incluyendo directorios que no deberían viajar?
- ¿hay archivos locales, temporales o de IDE que se meten en el contexto sin necesidad?
- ¿cómo evito que el refinamiento de imágenes se quede solo en el Dockerfile y no toque el proceso completo de construcción?  

Ese cambio de enfoque es justamente el corazón de esta etapa.

---

## Qué es el contexto de build

Para esta etapa del curso, una forma útil de pensarlo es esta:

**el contexto de build es el conjunto de archivos y carpetas que Docker recibe como material disponible para construir la imagen.**

Esa idea es central.

Cuando hacés algo como:

```bash
docker build -t novamarket/catalog-service:dev .
```

ese `.` significa mucho más que “esta carpeta”.

Significa algo más fuerte:

- “todo esto puede formar parte del contexto que Docker usa para construir”

Y ahí es donde empieza a importar `.dockerignore`.

---

## Qué papel cumple `.dockerignore`

`.dockerignore` sirve para decirle a Docker:

- “de todo este contexto posible, estas cosas no me las mandes al build”

Eso tiene muchísimo valor.

Porque así podés evitar que entren al proceso cosas como:

- archivos temporales,
- carpetas del IDE,
- artefactos locales irrelevantes,
- o contenido que no necesitás para construir la imagen.

Ese cambio ayuda muchísimo a que el build sea más limpio y más razonable.

---

## Por qué este paso tiene sentido justamente ahora

Esto también importa mucho.

Si todavía no hubiéramos madurado los Dockerfiles, este tema podría sentirse prematuro.

Pero ahora el proyecto ya:

- construye imágenes,
- usa multi-stage build,
- corre en Compose,
- y depende bastante del build como una parte seria del stack operativo.

Eso significa que ahora sí tiene muchísimo más sentido volver sobre el contexto y decir:

- **no alcanza solo con un Dockerfile mejor; también conviene cuidar qué entra al build**

Ese orden es muy sano.

---

## Qué cosas suelen ensuciar el contexto en proyectos como NovaMarket

A esta altura del curso, algunos sospechosos bastante habituales suelen ser:

- `target/`
- `.idea/`
- `.vscode/`
- logs temporales
- archivos locales del sistema operativo
- documentación o recursos que no forman parte del build real del servicio
- y a veces incluso archivos de otros módulos si estamos parados en un nivel demasiado amplio del proyecto

No hace falta todavía decidir toda la lista final.  
Lo importante hoy es instalar el mapa mental correcto.

---

## Qué gana NovaMarket con este cambio

Aunque todavía no apliquemos la mejora, el valor ya se puede ver con claridad.

A partir de `.dockerignore` y de un contexto de build más cuidado, NovaMarket puede ganar cosas como:

- builds más limpios,
- menos ruido innecesario,
- menor arrastre de archivos locales,
- y una forma bastante más profesional de tratar la construcción de imágenes.

Eso vuelve al proyecto más serio también desde el punto de vista del build, no solo del runtime.

---

## Por qué este subbloque complementa muy bien a multi-stage build

Este punto importa muchísimo.

`multi-stage build` mejora mucho la imagen final.

Pero `.dockerignore` mejora otro frente igual de importante:

- **qué le damos de comer al proceso de build**

Esa diferencia es muy valiosa, porque muestra que refinar imágenes no es una sola cosa.  
Es una combinación de mejoras en distintas capas del proceso.

---

## Qué todavía no estamos haciendo en esta etapa

Conviene dejar esto muy claro.

En este punto todavía no estamos:

- escribiendo todavía un `.dockerignore` real,
- ni midiendo todavía con detalle el cambio de contexto en todos los servicios,
- ni cerrando la estrategia final de build del proyecto.

La meta actual es mucho más concreta:

**abrir correctamente el bloque de `.dockerignore` y contexto de build.**

Y eso ya aporta muchísimo valor.

---

## Qué estamos logrando con esta clase

Esta clase no crea todavía un archivo `.dockerignore`, pero hace algo muy importante:

**abre explícitamente el siguiente frente lógico del módulo 9: cuidar no solo la imagen final, sino también el material que entra al proceso de construcción.**

Eso importa muchísimo, porque NovaMarket deja de refinar imágenes solo desde el Dockerfile y empieza a prepararse para otra mejora clave: que el build mismo sea más limpio y más razonable.

---

## Qué todavía no hicimos

Todavía no:

- elegimos todavía qué archivos conviene ignorar primero,
- ni aplicamos todavía una mejora práctica sobre el contexto de build de un servicio real.

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender por qué `.dockerignore` y el contexto de build ya importan en NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Pensar que refinar imágenes termina en multi-stage build
Todavía queda mirar qué entra al build.

### 2. Creer que el contexto de construcción no importa si la imagen final quedó bien
Sí importa, y bastante.

### 3. Abrir este frente demasiado pronto
Antes de consolidar el patrón multi-stage, habría quedado prematuro.

### 4. Querer escribir un `.dockerignore` gigantesco sin entender qué problema resuelve
En esta etapa, lo importante es empezar por ruido claro y evidente.

### 5. No ver el valor de separar “Dockerfile mejor” de “build mejor”
Ese matiz es justamente el corazón del paso que viene.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener claro por qué NovaMarket ya está listo para empezar a cuidar mejor el contexto de build y por qué `.dockerignore` aparece ahora como siguiente evolución natural del bloque de refinamiento de imágenes.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué es el contexto de build,
- ves por qué puede arrastrar ruido innecesario,
- entendés qué valor puede aportar `.dockerignore`,
- y sentís que el proyecto ya está listo para una primera mejora concreta de este tipo.

Si eso está bien, ya podemos pasar a aplicarla sobre un servicio real.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a crear y aplicar un primer `.dockerignore` sobre un servicio de NovaMarket para reducir ruido en el contexto de construcción y volver más limpio el proceso de build.

---

## Cierre

En esta clase entendimos por qué `.dockerignore` y el contexto de build ya importan en NovaMarket.

Con eso, el proyecto deja de refinar sus imágenes solo desde el Dockerfile final y empieza a prepararse para otra mejora muy valiosa: que el proceso de construcción en sí mismo también se vuelva más limpio, más claro y mucho más profesional.
