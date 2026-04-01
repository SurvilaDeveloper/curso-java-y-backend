---
title: "Corré como no root: USER, least privilege y permisos sanos en la imagen final"
description: "Tema 111 del curso práctico de Docker: cómo usar USER para correr como usuario no root dentro del contenedor, por qué eso reduce superficie de ataque, qué problemas típicos aparecen con permisos y cómo resolverlos con ownership correcto y COPY --chown."
order: 111
module: "Imagen final más profesional y más segura"
level: "intermedio"
draft: false
---

# Corré como no root: USER, least privilege y permisos sanos en la imagen final

## Objetivo del tema

En este tema vas a:

- entender por qué conviene correr como usuario no root dentro del contenedor
- usar `USER` con más criterio en Dockerfile
- distinguir entre “Docker en modo rootless” y “proceso no root dentro del contenedor”
- evitar errores comunes de permisos al cambiar de usuario
- aprender a dejar archivos y directorios con ownership correcto para la etapa runtime

La idea es que empieces a tratar el usuario final del contenedor como una decisión de seguridad y diseño, no como un detalle secundario.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender qué problema resuelve correr como no root
2. ver qué hace la instrucción `USER`
3. separar bien “daemon rootless” de “proceso no root dentro del contenedor”
4. resolver permisos de archivos y directorios
5. usar `COPY --chown` y preparación de rutas con más intención
6. construir una regla práctica para imágenes más profesionales

---

## Idea central que tenés que llevarte

Muchísimas imágenes funcionan “porque sí” corriendo como `root`.
Pero eso no significa que sea la decisión más sana.

Docker recomienda explícitamente que, si el servicio puede correr sin privilegios, uses `USER` para cambiar a un usuario no root. En sus guías recientes de Node, React y Angular, Docker destaca correr como usuario no root en la imagen final como una mejora concreta de seguridad y hardening. Además, Docker explica que el **rootless mode** del daemon es otra cosa: ahí tanto el daemon como los contenedores corren sin root en el host, pero eso no reemplaza decidir bien el usuario del proceso dentro de la imagen. citeturn859649search2turn859649search1turn180906search13turn180906search16turn859649search6

Dicho simple:

> si tu app no necesita privilegios de root,  
> la imagen final debería correr como un usuario no privilegiado.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker deja varias ideas muy claras para este tema:

- En **Dockerfile best practices**, Docker recomienda usar `USER` para pasar a un usuario no root cuando el servicio no requiere privilegios. Incluso muestra como patrón crear el grupo/usuario explícitamente antes de cambiar de usuario. citeturn859649search2turn859649search0
- Las guías actuales de Docker para **Node**, **React** y **Angular** remarcan que una imagen final más segura corre como no root y que eso reduce superficie de ataque y alinea la imagen con mejores prácticas de producción. citeturn180906search18turn180906search13turn180906search16
- La guía de **Compose Watch** recuerda un detalle muy práctico: si copiás archivos a una ruta que luego va a usar el usuario final del contenedor, conviene usar `COPY --chown` para que esos archivos queden con ownership correcto desde el build. citeturn859649search11
- La documentación de **rootless mode** explica que ejecutar Docker sin privilegios de root a nivel daemon/host es una característica distinta, pensada para mitigar vulnerabilidades del daemon y del runtime. citeturn859649search6
- La documentación de seguridad de Docker resume la recomendación de forma muy directa: los contenedores son más seguros, especialmente si los procesos corren como usuarios no privilegiados dentro del contenedor. citeturn180906search3

---

## Primer concepto: por qué no root importa

Correr como `root` dentro del contenedor puede simplificar cosas al principio.
Pero también amplía el impacto potencial de errores de permisos, escrituras innecesarias o vulnerabilidades de la aplicación.

Docker no lo plantea como un detalle cosmético.
Lo plantea como parte de las prácticas recomendadas de seguridad y hardening. citeturn859649search2turn180906search3turn180906search13

### La idea útil
- menos privilegios
- menos superficie
- menos capacidad de hacer cosas que tu proceso no debería necesitar hacer

Este es el principio de **least privilege** llevado a la imagen final.

---

## Segundo concepto: qué hace `USER`

La instrucción es muy simple:

```Dockerfile
USER appuser
```

o:

```Dockerfile
USER 1001
```

### Qué cambia realmente
- a partir de ese punto, las instrucciones runtime relevantes y el proceso final del contenedor se ejecutan con ese usuario
- ya no estás corriendo como `root`
- el contenedor necesita que archivos, directorios y permisos estén preparados para ese usuario

El punto clave es este:
**cambiar el usuario no es solo poner una línea; es preparar la imagen para que ese usuario pueda vivir bien ahí adentro**.

---

## Tercer concepto: crear el usuario antes de usarlo

Docker, en best practices, muestra justamente el patrón de crear usuario y grupo antes de hacer `USER`. citeturn859649search2

Por ejemplo, conceptualmente:

```Dockerfile
RUN groupadd -r app && useradd -r -g app app
USER app
```

No hace falta obsesionarse hoy con una receta única por distro.
La enseñanza importante es:

- primero creás el usuario/grupo
- después cambiás con `USER`

---

## Un ejemplo razonable y simple

```Dockerfile
FROM node:22-slim

WORKDIR /app

RUN groupadd -r app && useradd -r -g app app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

USER app

CMD ["node", "dist/server.js"]
```

### Qué tiene de bueno
- la imagen final ya no corre como root
- la intención de seguridad está explícita
- se empieza a parecer más a una imagen de runtime profesional

---

## Cuarto concepto: el problema típico de permisos

Acá aparece el primer choque real cuando alguien cambia a no root:

- la app ya no puede escribir en cierta carpeta
- no puede leer un archivo que antes sí
- no puede crear logs, uploads o temporales
- `WORKDIR` o lo copiado quedó con ownership equivocado

Este no es un “problema” de `USER`.
Es una consecuencia normal de correr con menos privilegios.

Y, bien resuelto, es una mejora.

---

## Qué enseñanza deja esto

Te deja una idea muy importante:

> si vas a correr como no root,  
> prepará los archivos y directorios para ese usuario.

No alcanza con cambiar el usuario y esperar que todo siga andando igual.

---

## Quinto concepto: `COPY --chown`

Acá aparece una herramienta muy práctica que Docker documenta y que las guías modernas vuelven a remarcar.

Por ejemplo:

```Dockerfile
COPY --chown=app:app . .
```

o usando UID:GID cuando corresponda.

La guía de Compose Watch destaca justamente que, si el contenido inicial se copia al contenedor y el usuario final no es root, `COPY --chown` ayuda a garantizar ownership correcto desde el build. citeturn859649search11

---

## Qué problema resuelve `COPY --chown`

Resuelve algo muy concreto:

- en vez de copiar como root y después arreglar permisos a mano
- copiás ya con ownership correcto para el usuario final

### Qué gana esto
- menos pasos
- menos sorpresas
- menos necesidad de `chown -R` después
- Dockerfile más claro

Es una herramienta muy valiosa para que el cambio a no root sea realmente prolijo.

---

## Sexto concepto: preparar directorios de escritura

Si tu app necesita escribir en:

- `/app/uploads`
- `/tmp` especial del proyecto
- `/data`
- una carpeta de cache
- una ruta de runtime propia

entonces esa ruta debe quedar accesible al usuario final.

Un patrón razonable sería algo como:

```Dockerfile
RUN mkdir -p /app/data && chown -R app:app /app
```

o hacer la preparación más fina según las rutas que de verdad hagan falta.

La idea importante no es el comando exacto.
La idea es:
**si el usuario final tiene que escribir ahí, preparalo durante el build**.

---

## Séptimo concepto: multi-stage y usuario final

Esto conversa perfecto con lo que ya viste de multi-stage.

Una estrategia muy sana suele ser:

- build stage con más tooling y, si hace falta, más privilegios
- runtime final más mínima
- runtime final corriendo como no root

Eso encaja muy bien con las guías modernas de Docker y con la idea de una etapa final más limpia y más segura. citeturn180906search18turn180906search13turn180906search16

---

## Un ejemplo bastante más sano

```Dockerfile
FROM node:22 AS build
WORKDIR /src

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-slim AS runtime
WORKDIR /app

RUN groupadd -r app && useradd -r -g app app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build --chown=app:app /src/dist /app/dist

USER app

CMD ["node", "dist/server.js"]
```

### Qué gana esta versión
- build y runtime separados
- runtime más chica
- artefactos finales con ownership correcto
- proceso final no root

Esto ya se parece mucho más a una imagen bien pensada.

---

## Octavo concepto: rootless mode no es lo mismo

Acá aparece una confusión muy común.

### Correr el proceso como no root dentro del contenedor
Se resuelve con `USER` y con una imagen preparada para eso.

### Ejecutar Docker en rootless mode
Es otra capa: el daemon y los contenedores se ejecutan sin root a nivel host/daemon. Docker lo documenta como una característica para mitigar vulnerabilidades del daemon y del runtime. citeturn859649search6

Estas dos cosas **se complementan**, pero no son lo mismo.

---

## Qué no tenés que confundir

### “Mi host usa Docker rootless” no significa automáticamente “mi app corre como no root dentro del contenedor”
No son la misma decisión. citeturn859649search6

### “Mi imagen corre como no root” no significa que el daemon esté en rootless mode
Otra vez: capas distintas.

### “Cambiar a USER rompe cosas” no significa que no convenga
Normalmente significa que te faltó preparar permisos y ownership.

---

## Error común 1: agregar `USER app` al final y nada más

Eso suele terminar en errores de escritura o lectura porque la imagen no quedó preparada para ese usuario.

---

## Error común 2: copiar archivos como root y olvidarte del ownership final

Ahí `COPY --chown` suele resolver bastante. citeturn859649search11

---

## Error común 3: usar no root en build stage donde todavía necesitabas privilegios de instalación, y frustrarte

Muchas veces el lugar correcto para no root es **la etapa runtime final**, no necesariamente cada línea del build.

---

## Error común 4: mezclar Docker rootless con usuario no root dentro del contenedor

Se complementan, pero no se sustituyen. citeturn859649search6

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Respondé con tus palabras:

- por qué Docker recomienda usar `USER` si el servicio no necesita privilegios
- qué mejora te da correr como no root
- por qué esto no es solo “una línea más” en el Dockerfile

### Ejercicio 2
Compará estas dos ideas:

#### Opción A
```Dockerfile
FROM node:22-slim
WORKDIR /app
COPY . .
CMD ["node", "dist/server.js"]
```

#### Opción B
```Dockerfile
FROM node:22-slim
WORKDIR /app

RUN groupadd -r app && useradd -r -g app app
COPY --chown=app:app . .

USER app

CMD ["node", "dist/server.js"]
```

Respondé:

- cuál te parece más profesional para runtime
- por qué
- qué problema práctico intenta resolver `COPY --chown`
- qué problema podría aparecer si cambiás a `USER app` pero dejás todo ownership como root

### Ejercicio 3
Respondé además:

- por qué multi-stage conversa bien con esta práctica
- en qué etapa te parece más importante correr como no root
- por qué rootless mode del daemon no reemplaza esta decisión

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- si hoy tu imagen final corre como root
- qué directorio o archivo podría romperse si cambiaras a no root sin preparar permisos
- si te convendría usar `COPY --chown`
- qué parte de tu runtime realmente necesita escritura
- qué cambio concreto harías primero para acercarte a una imagen más segura

No hace falta escribir todavía tu Dockerfile final real.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre seguridad por diseño y “que funcione nomás”?
- ¿en qué proyecto tuyo hoy sería más valioso correr como no root?
- ¿qué error de permisos intuís que aparecería primero?
- ¿qué directorio te gustaría preparar mejor para el usuario final?
- ¿qué mejora concreta te gustaría notar al endurecer mejor la imagen final?

Estas observaciones valen mucho más que memorizar una receta única.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si mi servicio no necesita privilegios especiales, probablemente me conviene usar ________ para correr como un usuario no root.  
> Si voy a copiar archivos que el usuario final tiene que poder leer o escribir, probablemente me conviene usar `COPY --________`.  
> Si la app necesita escribir en ciertas rutas, probablemente me conviene prepararlas con permisos y ________ correctos durante el build.  
> Si estoy hablando del daemon de Docker corriendo sin root, probablemente estoy hablando de ________ mode, que no es exactamente lo mismo que el usuario final del proceso dentro del contenedor.

Y además respondé:

- ¿por qué este tema impacta tanto en seguridad real de la imagen final?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no dejar todo corriendo como root por costumbre?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar por qué conviene correr como no root en la imagen final
- usar `USER` con mucho más criterio
- preparar ownership y permisos con más intención
- apoyarte en `COPY --chown` cuando corresponda
- distinguir mejor entre rootless mode y no root dentro del contenedor
- diseñar una imagen final bastante más profesional y más segura

---

## Resumen del tema

- Docker recomienda usar `USER` para pasar a un usuario no root cuando el servicio no necesita privilegios. citeturn859649search2turn859649search0
- Las guías actuales de Docker para Node, React y Angular remarcan que correr como no root mejora la seguridad y el hardening de la imagen final. citeturn180906search18turn180906search13turn180906search16
- `COPY --chown` ayuda a dejar ownership correcto para el usuario final del contenedor. citeturn859649search11
- Rootless mode del daemon es otra capa distinta: ejecuta Docker y contenedores sin root a nivel host/daemon. citeturn859649search6
- Este tema te deja una base mucho más clara para preparar una runtime final con menos privilegios y menos sorpresas de permisos.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque con otra capa muy útil:

- usuario no root + salud + puertos mínimos
- varias buenas prácticas combinadas
- y una imagen final bastante más profesional de punta a punta
