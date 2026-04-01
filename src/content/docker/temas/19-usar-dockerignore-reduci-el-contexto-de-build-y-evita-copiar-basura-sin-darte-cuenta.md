---
title: "Usar .dockerignore: reducí el contexto de build y evitá copiar basura sin darte cuenta"
description: "Tema 19 del curso práctico de Docker: qué es .dockerignore, por qué ayuda a reducir el contexto de build, cómo evita archivos innecesarios o sensibles y qué patrones básicos conviene usar desde el principio."
order: 19
module: "Primeros pasos reales con imágenes"
level: "base"
draft: false
---

# Usar .dockerignore: reducí el contexto de build y evitá copiar basura sin darte cuenta

## Objetivo del tema

En este tema vas a:

- entender qué es un archivo `.dockerignore`
- ver por qué ayuda a reducir el contexto de build
- evitar que Docker tenga en cuenta archivos innecesarios
- empezar a excluir basura común del proyecto
- mejorar builds, caché y orden general del entorno

La idea es que empieces a construir imágenes con un contexto más limpio y más intencional.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender qué problema resuelve `.dockerignore`
2. ver cómo influye en el contexto de build
3. crear un primer `.dockerignore`
4. excluir archivos y carpetas típicas que no conviene mandar al build
5. entender cómo esto ayuda a performance, orden y seguridad básica

---

## Idea central que tenés que llevarte

Cuando ejecutás un build, Docker trabaja con un **contexto de build**.

Ese contexto incluye archivos de tu proyecto a los que la construcción puede acceder.

Si no controlás bien ese contexto, puede terminar entrando al build un montón de cosas que no te sirven, por ejemplo:

- carpetas pesadas
- archivos temporales
- dependencias locales
- historial de Git
- archivos de entorno
- resultados de builds anteriores

Dicho simple:

> `.dockerignore` sirve para decirle a Docker qué archivos o carpetas no querés incluir en el contexto de build.

---

## Qué es .dockerignore

`.dockerignore` es un archivo donde definís patrones de exclusión para el contexto de build.

Se usa para evitar que Docker tome archivos innecesarios o no deseados cuando construís una imagen.

Se parece conceptualmente a `.gitignore`, aunque no cumple exactamente el mismo rol.

La idea útil para este curso es esta:

- `.gitignore` te ayuda a controlar qué entra a Git
- `.dockerignore` te ayuda a controlar qué entra al build de Docker

---

## Qué dice la documentación oficial

La documentación oficial de Docker explica que la forma más simple de mantener chico el contexto de build es crear un archivo `.dockerignore` en la raíz del contexto. También indica que este archivo funciona de forma parecida a `.gitignore` y permite excluir archivos y carpetas del contexto de build. citeturn570611search8turn570611search3turn570611search0

---

## Dónde se coloca

Lo habitual es que `.dockerignore` se ubique en la raíz del contexto de build.

Por ejemplo:

```text
mi-proyecto/
├── Dockerfile
├── .dockerignore
├── src/
├── package.json
└── ...
```

Esto importa porque Docker espera encontrarlo en el contexto que le pasás al build.

---

## Qué problema práctico resuelve

Sin `.dockerignore`, Docker puede incluir en el contexto cosas como:

- `node_modules`
- `.git`
- archivos `.env`
- directorios temporales
- artefactos generados
- logs
- carpetas pesadas de salida

Eso puede traer varios problemas:

- builds más lentos
- contexto más grande de lo necesario
- más ruido en `COPY . .`
- más chances de invalidar caché
- más riesgo de meter archivos sensibles sin querer

---

## Cómo se relaciona con el tema anterior

En el tema 18 viste que el contexto de build y el orden del Dockerfile influyen mucho en la velocidad del build y en el aprovechamiento de caché.

`.dockerignore` ayuda justo en eso porque:

- reduce el contexto
- baja el ruido
- evita que entren archivos irrelevantes
- puede reducir invalidaciones innecesarias

Es una herramienta muy simple, pero con mucho impacto.

---

## Qué tipos de cosas conviene ignorar

Docker muestra en su documentación y guías actuales que es común excluir elementos como:

- `.git`
- `node_modules`
- archivos `.env`
- binarios o artefactos generados
- archivos temporales
- logs
- carpetas de salida de builds citeturn570611search8turn570611search10turn570611search13turn570611search14turn570611search6

No siempre vas a ignorar exactamente lo mismo en todos los proyectos, pero esta lista te da una muy buena base.

---

## Primer ejemplo simple de .dockerignore

Podrías crear un archivo así:

```dockerignore
node_modules
.git
.env
dist
build
tmp
*.log
```

---

## Cómo leerlo

La idea general sería:

- no incluyas `node_modules`
- no incluyas `.git`
- no incluyas `.env`
- no incluyas directorios de salida como `dist` o `build`
- no incluyas temporales
- no incluyas logs

Esto ya te limpia bastante un proyecto típico.

---

## Qué pasa con COPY . .

Recordá esta instrucción:

```Dockerfile
COPY . .
```

Sin `.dockerignore`, eso puede terminar copiando un montón de cosas que no querías meter en la imagen.

Con `.dockerignore`, Docker filtra antes qué entra al contexto.

Entonces, aunque sigas usando `COPY . .`, el conjunto real de archivos disponibles para copiar puede quedar mucho más limpio.

---

## Por qué eso ayuda tanto

Esto te ayuda a:

- evitar copiar basura
- reducir peso del contexto
- acelerar builds
- reducir superficie de errores
- mejorar la claridad de lo que realmente entra a la imagen

Y además hace más probable que `COPY . .` sea menos destructivo o menos torpe en proyectos chicos.

---

## Un detalle importante sobre el builder actual

La documentación oficial actual explica que con BuildKit solo se transmiten al builder los archivos que el build necesita, mientras que el builder legado enviaba el contexto completo al daemon. Aun así, Docker sigue recomendando usar `.dockerignore` para mantener el contexto pequeño y excluir archivos irrelevantes. citeturn570611search2turn570611search8

---

## Qué tenés que llevarte de esto

No conviene pensar:

> “Como Docker moderno ya optimiza cosas, entonces `.dockerignore` no importa”

Sí importa.

Sigue siendo muy útil para:

- orden
- claridad
- seguridad básica
- excluir cosas innecesarias
- evitar que ciertos archivos entren al build

---

## Patrones y comodines

La documentación oficial indica que `.dockerignore` usa patrones de exclusión similares a `.gitignore`, y que además Docker soporta el comodín especial `**` para coincidir con cualquier cantidad de directorios. Por ejemplo, `**/*.go` puede excluir archivos `.go` en cualquier nivel del árbol. citeturn570611search0turn570611search3

---

## Ejemplos útiles de patrones

```dockerignore
node_modules
*.log
.env*
tmp*
**/*.tmp
```

### Qué significan conceptualmente

- `node_modules` excluye esa carpeta
- `*.log` excluye archivos `.log`
- `.env*` excluye variantes de archivos de entorno
- `tmp*` excluye nombres que arrancan con `tmp`
- `**/*.tmp` excluye archivos `.tmp` en cualquier subdirectorio

No hace falta volverte experto en patrones hoy.
Lo importante es empezar con un conjunto sensato y entender para qué sirve.

---

## Detalle útil sobre Dockerfile y .dockerignore

La documentación oficial aclara algo interesante: podés excluir `Dockerfile` y `.dockerignore` del contexto, pero Docker igualmente los envía al builder porque los necesita para ejecutar el build. También indica que no podés copiarlos dentro de la imagen usando `COPY`, `ADD` o bind mounts cuando están excluidos de esa manera. citeturn570611search0

---

## Qué implica esto en la práctica

No hace falta que hagas eso al empezar.

La idea útil acá es otra:

- Docker tiene un comportamiento especial con esos archivos porque son parte del build
- no conviene tratarlos como archivos comunes más sin pensar

Esto te muestra que el contexto de build tiene algunas reglas particulares.

---

## Ejemplo práctico para proyecto Node

En una app Node, un `.dockerignore` inicial bastante razonable podría ser este:

```dockerignore
node_modules
npm-debug.log*
yarn-error.log*
.pnpm-store
dist
build
.git
.gitignore
.env*
```

No siempre va a ser exactamente así, pero te da una muy buena base.

---

## Ejemplo práctico para proyecto Java

En un proyecto Java o Maven, algo sensato podría ser:

```dockerignore
target
.git
.gitignore
.env*
*.log
```

---

## Qué no tenés que confundir

### `.dockerignore` no borra archivos de tu proyecto
Solo evita que entren al contexto de build.

### `.dockerignore` no reemplaza a `.gitignore`
Cumplen funciones distintas.

### Ignorar algo no significa que mágicamente desaparezca de todos lados
Solo deja de formar parte del contexto de build según corresponda.

### `.dockerignore` no arregla un Dockerfile mal pensado
Ayuda mucho, pero no reemplaza una buena estructura de build.

---

## Error común 1: no crear .dockerignore al empezar

Eso hace que muchos builds arranquen con un contexto innecesariamente grande y desordenado.

---

## Error común 2: copiar todo el proyecto sin filtrar nada

Si usás `COPY . .` y no controlás el contexto, podés meter cosas pesadas, inútiles o delicadas dentro de la imagen.

---

## Error común 3: olvidar archivos sensibles

Las guías actuales de Docker remarcan justo este punto: `.dockerignore` ayuda a evitar que cosas como `.env`, `.git` o dependencias locales terminen entrando al build sin querer. citeturn570611search13turn570611search14turn570611search10

---

## Error común 4: asumir que el mismo .gitignore ya resuelve todo

No.

Aunque se parezcan, `.dockerignore` y `.gitignore` no son lo mismo ni apuntan al mismo problema.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá una carpeta de práctica o usá una de las que venís usando para build.

### Ejercicio 2
Creá un archivo llamado:

```text
.dockerignore
```

### Ejercicio 3
Pegá este contenido inicial:

```dockerignore
node_modules
.git
.env
dist
build
tmp
*.log
```

### Ejercicio 4
Respondé con tus palabras:

- ¿qué intenta excluir cada línea?
- ¿por qué te conviene que esas cosas no entren al contexto?
- ¿qué relación tiene esto con `COPY . .`?

### Ejercicio 5
Si tu proyecto actual tiene carpetas o archivos que sabés que no deberían entrar a una imagen, agregalos también al archivo.

---

## Segundo ejercicio de análisis

Tomá este Dockerfile:

```Dockerfile
FROM node:22
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]
```

Y respondé:

- ¿qué cosas peligrosas o innecesarias podrían entrar con `COPY . .`?
- ¿qué patrones pondrías en `.dockerignore` para reducir ruido?
- ¿por qué esto también puede ayudar al caché?

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué archivos o carpetas de tus proyectos no deberían entrar nunca a una imagen?
- ¿qué valor práctico le ves a excluir `node_modules`, `.git` o `.env`?
- ¿por qué un contexto más chico ayuda a trabajar mejor?
- ¿qué relación ves entre `.dockerignore` y builds más ordenados?
- ¿por qué esto no reemplaza pensar bien el Dockerfile?

Estas observaciones valen mucho más que copiar una lista de patrones sin entenderla.

---

## Mini desafío

Intentá explicar con tus palabras esta idea:

> `.dockerignore` no construye la imagen, pero sí ayuda a controlar qué archivos pueden participar del build.

Y además respondé:

- ¿por qué eso influye en `COPY . .`?
- ¿por qué puede ayudar al rendimiento del build?
- ¿por qué puede ayudar a no meter archivos sensibles?
- ¿qué pondrías en `.dockerignore` de uno de tus proyectos actuales?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar qué es `.dockerignore`
- entender por qué reduce y ordena el contexto de build
- excluir archivos y carpetas típicas que no conviene incluir
- relacionar mejor `.dockerignore` con caché, contexto y claridad
- empezar a crear builds más limpios desde el principio

---

## Resumen del tema

- `.dockerignore` sirve para excluir archivos y carpetas del contexto de build.
- Se usa normalmente en la raíz del contexto.
- Ayuda a mantener chico el contexto y a evitar archivos innecesarios o sensibles.
- Funciona de forma parecida a `.gitignore`, aunque no cumple el mismo rol.
- Puede ayudar a mejorar builds, reducir ruido y evitar problemas con `COPY . .`.
- Es una herramienta simple, pero muy valiosa desde etapas tempranas del proyecto.

---

## Próximo tema

En el próximo tema vas a poner todo esto en una práctica más concreta:

- primer proyecto real con una app estática
- Dockerfile simple pero útil
- imagen propia lista para ejecutarse
