---
title: "Usá .dockerignore para achicar el contexto: menos ruido, menos transferencia y menos invalidaciones"
description: "Tema 86 del curso práctico de Docker: cómo usar .dockerignore para reducir el contexto de build, evitar enviar archivos innecesarios al builder, acelerar builds y disminuir invalidaciones de caché provocadas por contenido que la imagen no necesita."
order: 86
module: "Dockerfiles más mantenibles y builds más rápidas"
level: "intermedio"
draft: false
---

# Usá .dockerignore para achicar el contexto: menos ruido, menos transferencia y menos invalidaciones

## Objetivo del tema

En este tema vas a:

- entender qué es el build context
- usar `.dockerignore` para excluir archivos que la imagen no necesita
- reducir ruido enviado al builder
- evitar invalidaciones de caché por archivos irrelevantes
- escribir builds más rápidos y más previsibles

La idea es que no le mandes al builder “todo el proyecto porque sí”, sino solo lo que realmente hace falta para construir la imagen.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. recordar qué es el contexto de build
2. ver qué problema resuelve `.dockerignore`
3. aprender qué tipos de archivos conviene excluir
4. entender reglas básicas y excepciones
5. construir una regla práctica para contextos más chicos y builds más limpias

---

## Idea central que tenés que llevarte

Cuando hacés un build, Docker no trabaja mágicamente sobre cualquier archivo de tu disco.

Trabaja sobre el **build context**, o sea, el conjunto de archivos que le pasás al builder.

Si en ese contexto metés cosas innecesarias, pasan dos problemas muy comunes:

- mandás más archivos de los que hacían falta
- aumentás las chances de invalidar caché por cambios irrelevantes

Dicho simple:

> si el builder recibe menos ruido,  
> el build suele ser más rápido, más limpio y menos frágil.

---

## Qué es el build context

Si ejecutás algo como:

```bash
docker build .
```

el punto final (`.`) representa el contexto de build.

Eso significa que Docker toma como contexto el directorio actual.

La idea práctica importante es esta:

- si un archivo está dentro del contexto, puede influir en el build
- si un archivo queda excluido por `.dockerignore`, no forma parte del contexto real del build

---

## Qué problema resuelve `.dockerignore`

`.dockerignore` existe para decirle a Docker:

- qué archivos no querés enviar al builder
- qué carpetas no deberían formar parte del contexto
- qué ruido no debería afectar tu build

Esto ayuda mucho porque evita que entren al contexto cosas como:

- dependencias locales que no querés copiar
- artefactos de build previos
- logs
- basura temporal
- historial de git
- archivos sensibles que no deberían aparecer en la imagen

---

## Por qué esto importa tanto

Importa por tres razones muy concretas:

### 1. Menos transferencia
Si el contexto es más chico, se manda menos información al builder.

### 2. Menos invalidaciones innecesarias
Si cambiás un archivo que ni siquiera debería importar para la imagen, no querés que eso afecte el build.

### 3. Menos riesgo de meter cosas que no querías
Un `.env`, un log, una carpeta `node_modules` o un `dist/` local pueden terminar entrando al contexto aunque no los necesites.

---

## Un ejemplo típico

Imaginá un proyecto Node con esto:

```text
mi-app/
├── src/
├── node_modules/
├── dist/
├── .git/
├── logs/
├── package.json
├── package-lock.json
├── Dockerfile
└── .dockerignore
```

Si construís sin `.dockerignore`, el builder puede recibir muchísimo más de lo necesario.

Y eso te mete varios problemas:

- contexto más pesado
- más ruido
- más invalidaciones
- más chances de copiar cosas incorrectas a la imagen

---

## Un `.dockerignore` razonable para empezar

```text
node_modules
dist
.git
logs
*.log
tmp*
```

### Cómo se lee
- `node_modules` no entra al contexto
- `dist` tampoco
- `.git` tampoco
- logs y temporales quedan afuera

Esto ya suele mejorar bastante muchos proyectos.

---

## Regla práctica inicial

Tu `.dockerignore` suele ser un gran lugar para sacar del contexto cosas como:

- dependencias restauradas localmente
- artefactos generados
- caches locales
- archivos temporales
- logs
- `.git`
- secretos o archivos que no deberían viajar al builder

No significa copiar tu `.gitignore` sin pensar.
Pero muchas veces van a parecerse bastante.

---

## Qué tipo de archivos conviene excluir casi siempre

### Dependencias locales
Por ejemplo:

```text
node_modules
vendor
target
bin
```

según el stack.

### Artefactos de build
Por ejemplo:

```text
dist
build
out
coverage
```

### Archivos temporales o de editor
Por ejemplo:

```text
tmp*
*.swp
.DS_Store
```

### Historial o metadata de desarrollo
Por ejemplo:

```text
.git
.gitignore
```

### Logs
Por ejemplo:

```text
*.log
logs
```

---

## Un caso muy importante: `.git`

Excluir `.git` suele tener mucho sentido porque:

- reduce bastante el contexto
- evita mandar historial de versiones al builder
- reduce ruido para la caché

Pero hay una consecuencia importante:

si la excluís, no vas a poder depender de comandos git dentro del build para leer información del repositorio.

Entonces, otra vez, la regla sana es:
**excluí lo que no necesitás realmente durante el build**.

---

## Otro caso muy importante: `node_modules`

En muchísimos proyectos Node conviene excluir `node_modules` porque:

- esa carpeta puede ser enorme
- cambia muchísimo
- suele generarte invalidaciones innecesarias
- y muchas veces igual la reinstalás dentro de la imagen

Si tu Dockerfile instala dependencias con:

```Dockerfile
COPY package*.json ./
RUN npm install
```

entonces mandar tu `node_modules` local al contexto normalmente sobra.

---

## Otro caso importante: archivos sensibles

A veces `.dockerignore` también te ayuda a no mandar cosas delicadas al contexto, como:

```text
.env
*.pem
secrets/
```

Pero ojo:
no se trata solo de ocultarlos por costumbre.
También tenés que pensar **cómo** vas a inyectar la configuración o los secretos de forma correcta.

La enseñanza útil acá es:
si algo no tiene por qué viajar al builder, mejor que no viaje.

---

## Reglas básicas de `.dockerignore`

`.dockerignore` funciona parecido a `.gitignore`, pero aplicado al contexto de build.

Por ejemplo:

```text
node_modules
tmp*
*.log
```

### Cómo se interpreta
- `node_modules` excluye esa carpeta
- `tmp*` excluye archivos y directorios que empiecen con `tmp`
- `*.log` excluye logs que coincidan con ese patrón

Además, las reglas se aplican al contexto completo, incluyendo subdirectorios.

---

## El comodín `**`

Docker también soporta el patrón especial:

```text
**/*.go
```

o algo parecido para cualquier stack.

La idea de `**` es que puede atravesar cualquier cantidad de subdirectorios.

No hace falta abusar de esto al principio.
Pero está bueno saber que existe para patrones más amplios.

---

## Excepciones con `!`

Podés excluir algo y luego hacer una excepción.

Por ejemplo:

```text
*.md
!README.md
```

### Cómo se lee
- todos los `.md` quedan excluidos
- excepto `README.md`

Esto puede ser útil cuando querés excluir una familia de archivos, pero rescatar uno puntual.

---

## Regla importante: el último match gana

Cuando hay varias reglas que podrían aplicar al mismo archivo, lo importante es la última coincidencia relevante.

Eso significa que el orden de las reglas importa.

Por ejemplo, no es lo mismo:

```text
*.md
!README*.md
README-secret.md
```

que cambiar el orden de esas líneas.

La idea útil es:
si estás combinando exclusiones y excepciones, leé el archivo de arriba hacia abajo con cuidado.

---

## Qué pasa si ignorás algo y después querés copiarlo

Si un archivo coincide con `.dockerignore`, no está presente en el contexto del build.

Entonces, si después tu Dockerfile intenta hacer:

```Dockerfile
COPY archivo-ignorado .
```

el build va a fallar, porque para el builder ese archivo no existe en el contexto.

Esta es una consecuencia muy importante del tema:
`.dockerignore` no solo acelera o limpia; también define qué archivos son realmente accesibles durante el build.

---

## Un detalle curioso: Dockerfile y `.dockerignore`

Docker documenta que incluso si excluís `Dockerfile` o `.dockerignore`, esos archivos igual se envían al builder porque los necesita para ejecutar el build.

Pero hay una diferencia importante:
no podés copiarlos dentro de la imagen usando `COPY`, `ADD` o binds de build porque siguen siendo tratados como archivos especiales del proceso de construcción.

No es algo que necesites todos los días, pero está bueno saberlo.

---

## Relación directa con el tema anterior

En el tema 85 viste que el orden del Dockerfile afecta muchísimo la caché.

Acá aparece la otra mitad del problema:

- no solo importa **cómo ordenás capas**
- también importa **qué archivos entran al contexto**

Un Dockerfile bien ordenado con un contexto enorme y ruidoso sigue siendo menos eficiente de lo que podría ser.

---

## Un ejemplo sano junto al tema anterior

### Dockerfile
```Dockerfile
FROM node:22
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

CMD ["npm", "start"]
```

### `.dockerignore`
```text
node_modules
dist
.git
coverage
*.log
```

### Qué gana esta combinación
- menos ruido entra al contexto
- `COPY . .` copia menos basura
- menos archivos irrelevantes pueden invalidar caché
- la instalación de dependencias queda mejor protegida

Esto ya es muchísimo más sano que no usar `.dockerignore` o usar uno muy pobre.

---

## Una regla muy útil

Podés pensar así:

### Primero
sacá del contexto todo lo que sabés que no participa del build.

### Después
revisá si hay archivos enormes o muy cambiantes que solo meten ruido.

### Después
preguntate si algún archivo sensible o local no debería viajar al builder.

Esta secuencia suele producir un `.dockerignore` bastante razonable.

---

## Qué no tenés que confundir

### `.dockerignore` no decide qué queda en la imagen final por arte de magia
Decide qué entra al build context. Después, el Dockerfile define qué copiás.

### `.dockerignore` no es exactamente lo mismo que `.gitignore`
Pueden parecerse mucho, pero tienen propósitos distintos.

### Excluir mucho no siempre es mejor
Si excluís algo que el build necesita, después `COPY` o `ADD` puede fallar.

### Un contexto chico no reemplaza un Dockerfile bien ordenado
Se complementan. No son la misma mejora.

---

## Error común 1: no tener `.dockerignore`

Eso suele significar mandar demasiado ruido al builder.

---

## Error común 2: olvidarte de excluir `node_modules`, `dist`, `.git` o logs

Son de las fuentes más típicas de contexto innecesario.

---

## Error común 3: excluir archivos sin pensar si el Dockerfile los necesita

Después aparecen errores de `COPY` difíciles de entender.

---

## Error común 4: creer que `.dockerignore` ya resolvió todo el rendimiento del build

Ayuda muchísimo, pero funciona mucho mejor junto con un Dockerfile bien ordenado.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Imaginá este árbol:

```text
mi-app/
├── src/
├── node_modules/
├── dist/
├── .git/
├── logs/
├── package.json
├── package-lock.json
├── Dockerfile
└── .dockerignore
```

Respondé:

- qué carpetas o archivos te parece sensato excluir del contexto
- por qué
- cuál de esos elementos podría meter más ruido o peso al build

### Ejercicio 2
Escribí mentalmente un `.dockerignore` razonable para ese proyecto con al menos:

- `node_modules`
- `dist`
- `.git`
- logs

### Ejercicio 3
Respondé además:

- qué problema resuelve `.dockerignore`
- por qué ayuda a la caché
- qué pasa si ignorás un archivo y luego intentás copiarlo con `COPY`

### Ejercicio 4
Ahora pensá esta excepción:

```text
*.md
!README.md
```

Respondé:

- qué archivos quedarían fuera
- cuál quedaría incluido
- por qué el orden de las reglas importa

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué archivos enormes o ruidosos hoy entran al contexto sin necesidad
- si tu `.dockerignore` existe o todavía no
- qué secreto, artefacto o carpeta local no debería viajar al builder
- qué mejora concreta te gustaría notar primero: menos tiempo de build, menos ruido o menos invalidaciones
- qué cambio puntual harías hoy mismo en ese archivo

No hace falta escribir todavía el `.dockerignore` final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre contexto de build y contenido final de la imagen?
- ¿en qué proyecto tuyo hoy estás mandando más ruido del necesario al builder?
- ¿qué carpeta excluirías primero?
- ¿qué patrón de excepción con `!` te parece más fácil de romper si no prestás atención?
- ¿qué mejora concreta te gustaría notar después de ajustar `.dockerignore`?

Estas observaciones valen mucho más que memorizar patrones.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero que el builder no reciba archivos innecesarios, probablemente me conviene usar ________.  
> Si quiero reducir ruido y probabilidad de invalidación, probablemente me conviene mantener el ________ lo más chico posible.  
> Si excluyo un archivo y después intento copiarlo durante el build, probablemente el ________ va a fallar.

Y además respondé:

- ¿por qué este tema impacta tanto en velocidad y limpieza del build?
- ¿qué proyecto tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no mandar secretos, logs o basura local al builder?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar qué es el build context
- usar `.dockerignore` para reducir ruido y peso en el build
- excluir carpetas y archivos comunes que no deberían entrar al contexto
- entender reglas básicas, excepciones y el efecto del último match
- complementar mucho mejor la optimización de caché que viste en el tema anterior

---

## Resumen del tema

- `.dockerignore` sirve para excluir archivos y directorios del build context.
- Reducir el contexto ayuda a enviar menos datos al builder y a disminuir invalidaciones innecesarias.
- Las reglas aplican al contexto completo, incluyendo subdirectorios.
- Docker soporta excepciones con `!` y el último patrón que coincide es el que define si algo queda incluido o excluido.
- Si un archivo está ignorado, no existe para `COPY` o `ADD` durante el build.
- Dockerfile y `.dockerignore` siguen enviándose al builder aunque los excluyas, pero no se pueden copiar a la imagen de la forma habitual.
- Este tema te deja una base muy sólida para construir imágenes más limpias, más rápidas y menos ruidosas.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque con otra mejora súper práctica de Dockerfiles y builds:

- multi-stage builds
- separar build y runtime
- imágenes finales más chicas
- y una forma mucho más limpia de llevar solo lo necesario al resultado final
