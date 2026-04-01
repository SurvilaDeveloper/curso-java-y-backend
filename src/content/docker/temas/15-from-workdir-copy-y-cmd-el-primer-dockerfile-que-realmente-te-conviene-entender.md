---
title: "FROM, WORKDIR, COPY y CMD: el primer Dockerfile que realmente te conviene entender"
description: "Tema 15 del curso práctico de Docker: cómo funcionan FROM, WORKDIR, COPY y CMD dentro de un Dockerfile y cómo combinarlas para definir una imagen simple, clara y útil."
order: 15
module: "Primeros pasos reales con imágenes"
level: "base"
draft: false
---

# FROM, WORKDIR, COPY y CMD: el primer Dockerfile que realmente te conviene entender

## Objetivo del tema

En este tema vas a:

- entender para qué sirve `FROM`
- entender para qué sirve `WORKDIR`
- entender para qué sirve `COPY`
- entender para qué sirve `CMD`
- ver cómo se combinan estas instrucciones dentro de un Dockerfile simple y útil

La idea es que dejes de ver estas palabras como sintaxis aislada y empieces a leerlas como una receta coherente.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. elegir una imagen base con `FROM`
2. definir una carpeta de trabajo con `WORKDIR`
3. copiar archivos del proyecto con `COPY`
4. indicar qué comando debería ejecutarse al arrancar con `CMD`
5. leer un Dockerfile completo y simple con intención

---

## Idea central que tenés que llevarte

Estas cuatro instrucciones te dan un primer esqueleto muy sólido para muchísimas imágenes simples:

- `FROM`
- `WORKDIR`
- `COPY`
- `CMD`

Dicho simple:

- `FROM` define desde dónde partís
- `WORKDIR` define desde dónde vas a trabajar
- `COPY` mete archivos dentro de la imagen
- `CMD` define qué debería ejecutarse por defecto al arrancar el contenedor

Si esto te queda claro, ya empezás a leer Dockerfiles de verdad.

---

## Recordatorio importante sobre Dockerfile, imagen y contenedor

Antes de seguir, fijá bien esta relación:

### Dockerfile
Es la receta escrita por vos.

### Imagen
Es el resultado construido a partir del Dockerfile.

### Contenedor
Es la ejecución concreta de esa imagen.

Esto no cambia.
Solo que ahora vas a empezar a dominar las instrucciones más comunes de esa receta.

---

## Qué dice Docker sobre estas instrucciones

La documentación oficial actual de Docker explica que el `Dockerfile` se ejecuta en orden y que `FROM` define la imagen base. También indica que `WORKDIR` fija el directorio de trabajo para las instrucciones siguientes como `RUN`, `CMD`, `ENTRYPOINT`, `COPY` y `ADD`, que `COPY` copia archivos del contexto de build a la imagen, y que `CMD` define el comando por defecto del contenedor. ([docs.docker.com](https://docs.docker.com/reference/dockerfile/?utm_source=chatgpt.com), [docs.docker.com](https://docs.docker.com/build/concepts/dockerfile/?utm_source=chatgpt.com), [docs.docker.com](https://docs.docker.com/build/concepts/context/?utm_source=chatgpt.com))

---

## Primera instrucción: FROM

`FROM` define la imagen base desde la que vas a construir la tuya.

Por ejemplo:

```Dockerfile
FROM alpine:3.20
```

o:

```Dockerfile
FROM nginx:latest
```

o:

```Dockerfile
FROM node:22-alpine
```

---

## Cómo conviene pensar FROM

No arrancás desde cero absoluto.

Arrancás desde una base que ya trae algo preparado.

Esa base puede ser, por ejemplo:

- una imagen mínima como `alpine`
- un runtime como `node`
- un servidor web como `nginx`

Por eso `FROM` es el punto de partida del Dockerfile.

---

## Qué tenés que recordar sobre FROM

- define la base
- suele ser la primera instrucción real del Dockerfile
- condiciona muchísimo lo que viene después
- elegir bien la imagen base importa bastante

Más adelante vas a profundizar mejor en cómo elegirla, pero por ahora lo importante es captar que `FROM` fija el piso sobre el que construís.

---

## Segunda instrucción: WORKDIR

`WORKDIR` define el directorio de trabajo dentro de la imagen para las instrucciones siguientes.

Por ejemplo:

```Dockerfile
WORKDIR /app
```

---

## Cómo conviene pensar WORKDIR

Es como decir:

> “a partir de ahora, trabajá desde esta carpeta”

Eso afecta instrucciones posteriores como:

- `COPY`
- `RUN`
- `CMD`

Si el directorio no existe, Docker lo crea.

Esto es muy útil porque te evita trabajar con rutas confusas o repetir caminos completos todo el tiempo.

---

## Qué ventaja te da WORKDIR

Te ayuda a:

- ordenar mejor la imagen
- evitar rutas largas o desprolijas
- escribir Dockerfiles más claros
- dejar más explícito dónde vive tu aplicación dentro de la imagen

En vez de hacer todo en cualquier parte, definís un lugar de trabajo concreto.

---

## Tercera instrucción: COPY

`COPY` copia archivos desde tu proyecto hacia el sistema de archivos de la imagen que se está construyendo.

Por ejemplo:

```Dockerfile
COPY . .
```

O también:

```Dockerfile
COPY index.html .
```

O:

```Dockerfile
COPY src/ ./src/
```

---

## Cómo conviene pensar COPY

`COPY` toma archivos del contexto de build y los mete dentro de la imagen.

Esto es importantísimo porque si querés construir una imagen de tu proyecto, en algún momento necesitás llevar adentro de la imagen cosas como:

- código fuente
- archivos HTML
- scripts
- configuración
- recursos estáticos

Sin `COPY`, tu imagen no tendría acceso a esos archivos del proyecto.

---

## Qué significa eso de “contexto de build”

Cuando más adelante ejecutes algo como:

```bash
docker build .
```

el punto final `.` representa el contexto de build.

Ese contexto es el conjunto de archivos a los que Docker puede acceder durante la construcción.

Entonces, si hacés:

```Dockerfile
COPY . .
```

la idea general es:

- copiá desde el contexto actual
- hacia el directorio de trabajo actual dentro de la imagen

Más adelante vas a profundizar en esto y en `.dockerignore`, pero por ahora esta idea alcanza.

---

## Cuarta instrucción: CMD

`CMD` define el comando por defecto que va a ejecutarse cuando el contenedor arranque.

Por ejemplo:

```Dockerfile
CMD ["echo", "Hola desde mi imagen"]
```

o:

```Dockerfile
CMD ["node", "app.js"]
```

---

## Cómo conviene pensar CMD

`CMD` responde, en gran parte, a esta pregunta:

> cuando alguien ejecute un contenedor basado en esta imagen, ¿qué debería pasar por defecto?

Eso no ocurre durante el build.

Ocurre cuando la imagen ya fue construida y después la usás para crear y ejecutar un contenedor.

---

## Diferencia clave entre COPY y CMD

Esto te tiene que quedar claro.

### `COPY`
Actúa durante la construcción de la imagen.

### `CMD`
Define el comportamiento por defecto al ejecutar el contenedor.

O sea:

- una cosa participa del armado
- la otra define el arranque

Esa distinción entre build y runtime aparece todo el tiempo en Docker.

---

## Un Dockerfile mínimo con estas cuatro instrucciones

Mirá este ejemplo:

```Dockerfile
FROM alpine:3.20
WORKDIR /app
COPY mensaje.txt .
CMD ["cat", "mensaje.txt"]
```

---

## Cómo se lee este Dockerfile

La lectura conceptual sería esta:

1. partí de la imagen `alpine:3.20`
2. trabajá dentro de `/app`
3. copiá el archivo `mensaje.txt` del proyecto a ese directorio
4. cuando el contenedor arranque, ejecutá `cat mensaje.txt`

Esa lectura ya es muchísimo más valiosa que solo memorizar palabras clave.

---

## Qué tendría que existir en el proyecto

Para que ese ejemplo tenga sentido, en tu carpeta de trabajo deberías tener algo así:

```text
mi-practica/
├── Dockerfile
└── mensaje.txt
```

Y dentro de `mensaje.txt`, por ejemplo:

```text
Hola desde un archivo copiado con Dockerfile
```

---

## Otro ejemplo mental: app estática mínima

Imaginá esto:

```Dockerfile
FROM nginx:latest
WORKDIR /usr/share/nginx/html
COPY index.html .
CMD ["nginx", "-g", "daemon off;"]
```

No hace falta que lo construyas ahora si no querés adelantarte.
La idea es que veas que ya podés empezar a describir una imagen real con muy pocas instrucciones:

- una base
- una carpeta de trabajo
- un archivo copiado
- un comando por defecto

---

## Qué no tenés que confundir

### `WORKDIR` no copia archivos
Solo define dónde vas a trabajar.

### `COPY` no ejecuta nada
Solo mueve archivos al momento del build.

### `CMD` no construye la imagen
Define qué se ejecutará por defecto al arrancar el contenedor.

### `FROM` no significa “imagen final”
Solo define la base desde la que empezás.

---

## Error común 1: no entender desde dónde copia COPY

`COPY` toma archivos desde el contexto de build, no desde cualquier lugar arbitrario de tu disco.

Por eso la ubicación desde la que ejecutás el build y el contexto que le pasás importan mucho.

---

## Error común 2: creer que WORKDIR es solo decorativo

No.

Afecta muchísimo cómo se interpretan rutas posteriores y te ahorra mucho desorden en el Dockerfile.

---

## Error común 3: poner CMD pensando que corre durante el build

No.

`CMD` define el comando por defecto para el momento en que el contenedor arranque.

No para el proceso de construcción de la imagen.

---

## Error común 4: leer COPY . . sin entender los dos lados

En:

```Dockerfile
COPY . .
```

la idea general es:

- copiá todo desde el contexto actual
- hacia el directorio actual dentro de la imagen

Si no tenés claro cuál es el contexto y cuál es el directorio de trabajo, esa línea puede prestarse a mucha confusión.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá una carpeta de práctica:

```bash
mkdir practica-from-workdir-copy-cmd
cd practica-from-workdir-copy-cmd
```

### Ejercicio 2
Creá un archivo llamado:

```text
mensaje.txt
```

Con este contenido:

```text
Hola desde Dockerfile
```

### Ejercicio 3
Creá un archivo llamado:

```text
Dockerfile
```

Y pegá esto:

```Dockerfile
FROM alpine:3.20
WORKDIR /app
COPY mensaje.txt .
CMD ["cat", "mensaje.txt"]
```

### Ejercicio 4
Sin adelantarte demasiado al tema siguiente, respondé con tus palabras:

- ¿qué base usa?
- ¿qué carpeta de trabajo define?
- ¿qué archivo copia?
- ¿qué comando ejecutaría por defecto?

### Ejercicio 5
Si querés dejar todo listo para el próximo tema, guardá estos archivos en la misma carpeta.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué hace cada instrucción por separado?
- ¿qué instrucciones pertenecen más al build y cuáles al arranque?
- ¿por qué `WORKDIR` te ordena mentalmente el Dockerfile?
- ¿por qué `COPY` depende del contexto de build?
- ¿por qué estas cuatro instrucciones ya te permiten describir una imagen útil?

Estas observaciones valen mucho más que memorizar una lista de palabras.

---

## Mini desafío

Intentá explicar con tus palabras este Dockerfile:

```Dockerfile
FROM alpine:3.20
WORKDIR /app
COPY mensaje.txt .
CMD ["cat", "mensaje.txt"]
```

Respondé:

- qué parte define la base
- qué parte organiza el lugar de trabajo
- qué parte mete contenido dentro de la imagen
- qué parte define el comportamiento por defecto al arrancar

Y además respondé:

- ¿qué diferencia hay entre copiar un archivo y ejecutarlo?
- ¿qué relación hay entre `WORKDIR` y `COPY . .`?
- ¿qué esperás que pase en el próximo tema cuando uses `docker build`?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar para qué sirve `FROM`
- explicar para qué sirve `WORKDIR`
- explicar para qué sirve `COPY`
- explicar para qué sirve `CMD`
- leer un Dockerfile mínimo con mucho más criterio

---

## Resumen del tema

- `FROM` define la imagen base.
- `WORKDIR` fija el directorio de trabajo para las instrucciones siguientes.
- `COPY` copia archivos del contexto de build a la imagen.
- `CMD` define el comando por defecto del contenedor.
- Estas cuatro instrucciones forman un primer esqueleto muy útil para empezar a construir imágenes propias.
- Entender bien su rol te prepara para usar `docker build` con mucha más claridad.

---

## Próximo tema

En el próximo tema vas a hacer el paso que convierte esta receta en algo real:

- construir imágenes con `docker build`
- entender qué significa el contexto
- ver nacer tu primera imagen propia
