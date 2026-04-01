---
title: "Multi-stage builds en Compose: separá build y runtime para lograr imágenes más chicas y prolijas"
description: "Tema 53 del curso práctico de Docker: cómo usar multi-stage builds dentro de servicios Compose, por qué ayudan a reducir tamaño y dependencias, y cómo separar claramente la etapa de construcción de la etapa final de ejecución."
order: 53
module: "Imágenes propias y flujos más cercanos a despliegue"
level: "intermedio"
draft: false
---

# Multi-stage builds en Compose: separá build y runtime para lograr imágenes más chicas y prolijas

## Objetivo del tema

En este tema vas a:

- entender qué es un multi-stage build
- ver por qué mejora mucho la calidad de una imagen
- separar la etapa de construcción de la etapa de ejecución
- usar un Dockerfile multi-stage dentro de un servicio Compose
- empezar a producir imágenes más livianas, más limpias y más razonables

La idea es que dejes de pensar el Dockerfile como una sola secuencia lineal y empieces a verlo como varias etapas con responsabilidades distintas.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender qué problema tienen muchos Dockerfile “de una sola etapa”
2. ver cómo funcionan los multi-stage builds
3. separar build y runtime dentro del mismo Dockerfile
4. usar ese Dockerfile desde Compose
5. entender por qué esto mejora muchísimo el resultado final

---

## Idea central que tenés que llevarte

Muchas aplicaciones necesitan herramientas pesadas para construirse, pero no para ejecutarse.

Por ejemplo:

- Node para compilar frontend
- Maven o Gradle para construir Java
- gcc para compilar binarios
- herramientas de test o de build que no deberían viajar al runtime final

Un multi-stage build resuelve eso.

Dicho simple:

> usás una etapa para construir  
> y otra etapa para ejecutar  
> y al final la imagen solo se queda con lo que realmente necesita para correr.

---

## Qué problema resuelve este tema

Cuando un Dockerfile mezcla todo en una sola etapa, suele pasar algo como esto:

- la imagen final queda más grande
- viajan dependencias que solo servían para construir
- queda más superficie de ataque
- cuesta más entender qué parte era build y qué parte era runtime

Multi-stage builds separa esas responsabilidades.

---

## Qué es un multi-stage build

Un multi-stage build usa múltiples instrucciones `FROM` dentro del mismo Dockerfile.

Cada `FROM` inicia una nueva etapa.

La idea es que en una etapa construís o preparás artefactos y en otra etapa final copiás solo lo necesario desde la etapa anterior.

Eso te permite dejar atrás herramientas, caches y dependencias intermedias que no tienen sentido en la imagen final.

---

## Cómo conviene pensarlo

Pensalo así:

### Etapa 1
Construyo, compilo o preparo artefactos.

### Etapa 2
Tomo solo el resultado final y lo ejecuto en una base más pequeña o más limpia.

Eso ya ordena muchísimo el Dockerfile.

---

## Un ejemplo mental muy simple

Imaginá una app frontend.

### Etapa de build
- instala Node
- instala dependencias
- ejecuta el build
- genera archivos estáticos

### Etapa final
- usa Nginx
- copia solo los archivos estáticos construidos
- sirve el resultado

Al final:

- Node no viaja a producción
- las dependencias de build tampoco
- la imagen queda mucho más limpia

---

## Por qué esto mejora tanto una imagen

Un multi-stage build suele ayudar a:

- reducir tamaño
- reducir dependencias innecesarias
- separar mejor build y runtime
- dejar una imagen más mantenible
- evitar que el entorno final cargue cosas que no debería

No es una técnica “decorativa”.
Cambia bastante la calidad del resultado.

---

## Qué dice la documentación oficial

La documentación oficial de Docker explica que los multi-stage builds usan múltiples instrucciones `FROM`, que cada una inicia una nueva etapa y que podés copiar selectivamente artefactos de una etapa a otra, dejando atrás todo lo que no querés en la imagen final. Docker también los recomienda como buena práctica porque reducen el tamaño final de la imagen, separan mejor la salida final del proceso de build y pueden incluso mejorar eficiencia de construcción. Además, la guía actual de conceptos de build dice que los multi-stage builds son recomendables para todo tipo de aplicaciones. citeturn758581search0turn787090search5turn787090search3turn758581search11

---

## Primer ejemplo práctico: frontend estático

Imaginá esta estructura:

```text
mi-frontend/
├── compose.yaml
├── Dockerfile
├── package.json
├── package-lock.json
└── src/
```

### Dockerfile

```Dockerfile
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:latest
COPY --from=build /app/dist /usr/share/nginx/html
```

---

## Cómo se lee este Dockerfile

### Primera etapa: build
- usa `node:22`
- instala dependencias
- copia el proyecto
- ejecuta el build

### Segunda etapa: runtime
- usa `nginx:latest`
- copia solo la carpeta `dist` generada por la etapa `build`

Esto es exactamente la lógica central del multi-stage build.

---

## Qué ventaja tiene este ejemplo

La imagen final ya no arrastra:

- Node
- npm
- dependencias de compilación
- archivos intermedios innecesarios del proyecto

Eso hace una diferencia enorme respecto a un Dockerfile monolítico donde todo quedaba mezclado.

---

## Cómo entra Compose en esta historia

Compose no “hace” el multi-stage build por sí mismo.

Lo que hace es construir el servicio usando el Dockerfile que vos definís.

Por ejemplo:

```yaml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    image: miusuario/frontend:dev
    ports:
      - "8080:80"
```

La lectura conceptual sería:

- el servicio `web` se construye usando este Dockerfile
- como ese Dockerfile es multi-stage, el build final ya queda optimizado
- Compose solo integra ese build dentro del stack

---

## Qué rol cumple cada pieza

### Dockerfile
Define las etapas del build.

### Compose
Integra ese Dockerfile al servicio y lo vuelve parte del flujo del stack.

Esto es importante porque muestra otra vez que Compose no reemplaza al Dockerfile.
Lo usa.

---

## Qué diferencia hay con un Dockerfile de una sola etapa

Imaginá una versión menos prolija:

```Dockerfile
FROM node:22
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm install -g serve
CMD ["serve", "-s", "dist"]
```

### Qué problema tiene
- el runtime sigue teniendo Node
- sigue teniendo dependencias de build
- puede quedar más pesado
- mezcla la lógica de construcción con la lógica de ejecución

No siempre es “incorrecto”, pero suele ser una solución menos limpia.

---

## Otro ejemplo mental: app compilada

Este patrón también aplica muy bien a apps compiladas.

Por ejemplo:

### Etapa 1
- usar una imagen con compilador o toolchain
- compilar el binario

### Etapa 2
- usar una imagen mucho más pequeña
- copiar solo el binario final

Docker usa justamente este patrón como ejemplo clásico en su documentación de multi-stage builds. citeturn758581search0

---

## Nombres de etapa

Es muy común poner nombres a las etapas.

Por ejemplo:

```Dockerfile
FROM node:22 AS build
...
FROM nginx:latest AS runtime
...
```

Esto vuelve mucho más legible el Dockerfile y permite referencias como:

```Dockerfile
COPY --from=build ...
```

La documentación oficial usa este patrón de nombres explícitos en sus ejemplos y es una práctica muy saludable. citeturn758581search0turn787090search3

---

## Qué pasa si no nombrás las etapas

Se puede hacer igual, pero el Dockerfile suele quedar menos claro y más frágil para mantener.

Cuando el archivo crece, poner nombres como:

- `build`
- `runtime`
- `test`
- `production`

ayuda muchísimo a leer intención y no solo sintaxis.

---

## Una regla práctica muy útil

Podés pensar así:

### Si una dependencia solo sirve para construir
Debería quedarse en una etapa de build.

### Si algo hace falta para ejecutar
Debería terminar en la etapa final.

Esto no resuelve todos los casos por sí solo, pero ordena muchísimo la mirada.

---

## Qué pasa con Compose y la etapa final

Cuando usás un Dockerfile multi-stage y no indicás otra cosa, el build normal termina en la etapa final del Dockerfile.

Docker documenta que, en builds multi-stage, la etapa final es la que se construye por defecto si no seleccionás un target específico. citeturn787090search4

Para este tema, con eso alcanza.

Más adelante ya vas a poder profundizar en cómo apuntar a una etapa concreta si hace falta.

---

## Por qué esto mejora seguridad y mantenimiento

Docker remarca que multi-stage builds puede ayudar a reducir la superficie de ataque y a dejar la imagen final con menos componentes innecesarios. También lo presenta como una forma más clara de separar la salida final del proceso de build. citeturn787090search3turn787090search5

Eso significa que la ganancia no es solo de tamaño.

También ganás en:

- prolijidad
- separación de responsabilidades
- mantenimiento
- razonabilidad del runtime final

---

## Qué no tenés que confundir

### Multi-stage build no es lo mismo que tener varios servicios en Compose
Una cosa es el Dockerfile.
La otra es el stack.

### Compose no reemplaza las etapas del Dockerfile
Solo las integra al servicio.

### Una imagen más chica no significa automáticamente mejor si le faltan cosas necesarias
La etapa final tiene que quedar mínima, pero funcional.

### Multi-stage no es solo para frontend
También aplica a binarios, apps compiladas, herramientas y muchos otros casos.

---

## Error común 1: dejar herramientas de build en la imagen final

Ese es exactamente el problema que multi-stage viene a resolver.

---

## Error común 2: pensar que multi-stage solo sirve para “ahorrar espacio”

También mejora separación entre build y runtime y suele hacer más clara la intención del Dockerfile.

---

## Error común 3: no nombrar etapas cuando el Dockerfile empieza a crecer

Capaz al principio no pasa nada, pero más adelante te hace perder legibilidad.

---

## Error común 4: mezclar demasiadas responsabilidades en una sola etapa

Eso vuelve más difícil entender qué parte construye y qué parte ejecuta.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Leé este Dockerfile:

```Dockerfile
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:latest
COPY --from=build /app/dist /usr/share/nginx/html
```

### Ejercicio 2
Respondé con tus palabras:

- qué hace la etapa `build`
- qué hace la etapa final
- qué archivos viajan a la imagen final
- qué herramientas se quedan afuera

### Ejercicio 3
Ahora mirá este `compose.yaml`:

```yaml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    image: miusuario/frontend:dev
    ports:
      - "8080:80"
```

Y respondé:

- qué parte resuelve el Dockerfile
- qué parte resuelve Compose
- por qué este flujo te parece más limpio que usar una sola etapa

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué parte sería la etapa de build
- qué parte sería la etapa final
- qué dependencias o herramientas te gustaría dejar fuera del runtime
- qué servicio tuyo se beneficiaría mucho de multi-stage builds
- qué te parece que cambiaría más: tamaño, prolijidad o claridad del Dockerfile

No hace falta escribir el archivo final completo.
La idea es empezar a pensar el diseño.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la separación entre build y runtime?
- ¿qué tipo de servicio tuyo te parece mejor candidato para multi-stage?
- ¿qué herramientas de build hoy están viajando más de la cuenta en tus imágenes?
- ¿por qué este enfoque te parece más profesional?
- ¿qué parte del Dockerfile te gustaría empezar a ordenar mejor a partir de ahora?

Estas observaciones valen mucho más que repetir la sintaxis de memoria.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si algo solo sirve para construir, probablemente debería quedar en la etapa de ________.  
> Si algo hace falta para ejecutar, probablemente debería terminar en la etapa ________.

Y además respondé:

- ¿por qué multi-stage reduce tamaño y dependencias?
- ¿qué ventaja te da nombrar etapas?
- ¿qué servicio tuyo te gustaría convertir primero a multi-stage?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar qué es un multi-stage build
- entender por qué mejora el resultado final de una imagen
- separar mejor build y runtime dentro del Dockerfile
- integrar ese Dockerfile dentro de un servicio Compose
- pensar tus imágenes propias de una forma bastante más madura

---

## Resumen del tema

- Los multi-stage builds usan múltiples `FROM`, donde cada una abre una nueva etapa. citeturn758581search0turn787090search3
- Permiten copiar selectivamente artefactos de una etapa a otra y dejar atrás herramientas y archivos innecesarios. citeturn758581search0
- Docker los recomienda como buena práctica porque reducen tamaño, separan mejor build y runtime y pueden mejorar eficiencia. citeturn787090search5turn787090search3turn758581search11
- Compose puede construir servicios usando Dockerfiles multi-stage sin problema, igual que cualquier otro build. citeturn758581search1turn787090search9
- Este tema te ayuda a producir imágenes más limpias, más pequeñas y mucho más razonables para un flujo real.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque con una herramienta muy útil sobre multi-stage:

- build target
- elegir una etapa concreta
- usar variantes de desarrollo y producción
- y cómo eso te da aún más control sin duplicar Dockerfiles innecesariamente
