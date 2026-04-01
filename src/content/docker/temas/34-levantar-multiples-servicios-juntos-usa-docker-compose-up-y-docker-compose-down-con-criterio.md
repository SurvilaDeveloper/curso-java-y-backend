---
title: "Levantar múltiples servicios juntos: usá docker compose up y docker compose down con criterio"
description: "Tema 34 del curso práctico de Docker: cómo usar docker compose up y docker compose down para levantar y apagar varios servicios juntos, qué hace cada comando y qué recursos se crean o se eliminan por defecto."
order: 34
module: "Docker Compose como herramienta central"
level: "base"
draft: false
---

# Levantar múltiples servicios juntos: usá docker compose up y docker compose down con criterio

## Objetivo del tema

En este tema vas a:

- usar `docker compose up` para levantar varios servicios juntos
- usar `docker compose down` para apagar y limpiar el stack
- entender qué hace Compose por defecto al arrancar y al bajar una aplicación
- ver qué recursos se crean y cuáles se eliminan
- empezar a sentir por qué Compose cambia tanto la experiencia frente a varios `docker run`

La idea es que pases de tener un `compose.yaml` escrito a usarlo realmente como punto de arranque y apagado de tu aplicación.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. crear un `compose.yaml` simple
2. levantar los servicios con `docker compose up`
3. mirar qué contenedores y recursos aparecen
4. acceder a uno de los servicios desde el host
5. bajar todo con `docker compose down`
6. entender qué se elimina por defecto y qué no

---

## Idea central que tenés que llevarte

Compose empieza a mostrar su verdadero valor cuando podés hacer esto:

```bash
docker compose up
```

para levantar toda una aplicación, y esto:

```bash
docker compose down
```

para apagarla y limpiarla.

Dicho simple:

> `docker compose up` te arranca el stack  
> `docker compose down` te lo apaga y limpia de forma mucho más ordenada

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker indica que `docker compose up` construye cuando hace falta, crea, recrea, inicia y se adjunta a los contenedores de los servicios, y que en modo detached (`-d`) deja los servicios corriendo en segundo plano. También explica que `docker compose down` detiene y elimina por defecto los contenedores del proyecto y las redes creadas por `up`, incluida la red por defecto si se usó; además aclara que las redes y volúmenes declarados como externos nunca se eliminan, y que para borrar volúmenes anónimos o nombrados del archivo hay que usar opciones específicas. citeturn616604search0turn616604search1turn616604search13

---

## Recordatorio rápido del tema anterior

En el tema 33 viste la estructura básica de `compose.yaml` y entendiste que:

- `services` es el corazón del archivo
- cada servicio puede usar `image` o `build`
- puede tener puertos, variables, volúmenes y más
- Compose crea una red por defecto para la app si hace falta

Ahora toca usar eso en la práctica.

---

## Archivo de práctica

Creá una carpeta, por ejemplo:

```bash
mkdir practica-compose-up-down
cd practica-compose-up-down
```

Y adentro creá un archivo llamado:

```text
compose.yaml
```

Con este contenido:

```yaml
services:
  web:
    image: nginx
    ports:
      - "8080:80"

  db:
    image: postgres:18
    environment:
      POSTGRES_PASSWORD: mysecretpassword
    volumes:
      - postgres_data:/var/lib/postgresql

volumes:
  postgres_data:
```

---

## Cómo se lee este archivo

La lectura conceptual sería:

- hay dos servicios: `web` y `db`
- `web` usa Nginx y expone `8080:80`
- `db` usa PostgreSQL 18
- `db` necesita una variable `POSTGRES_PASSWORD`
- `db` además usa un volumen llamado `postgres_data`

Esto ya alcanza para empezar a usar Compose de verdad.

---

## Primer comando importante: docker compose up

La forma más directa de arrancar es esta:

```bash
docker compose up
```

---

## Qué hace

Compose lee el archivo, crea lo necesario e inicia los servicios definidos.

En modo normal, se queda adjunto a la salida de los contenedores, o sea que vas a ver logs en la terminal.

Esto es útil para mirar qué está pasando mientras arranca todo.

---

## Qué deberías observar

Cuando hagas `docker compose up`, normalmente vas a ver cosas como estas:

- creación de la red del proyecto
- creación del volumen
- descarga de imágenes si hace falta
- creación de contenedores
- arranque de servicios
- logs agregados de varios servicios

No hace falta entender cada línea al detalle todavía.
Lo importante es que ya no estás levantando todo por separado.

---

## Qué red crea Compose

Docker documenta que Compose crea una red por defecto para la aplicación si no definiste otra, y conecta allí todos los servicios para que puedan hablarse por nombre. citeturn616604search13turn616604search4

Esto conecta muy bien con todo el bloque anterior de redes.

Aunque no la declares explícitamente, Compose te da esa red compartida.

---

## Acceder al servicio web

Con el stack levantado, abrí:

```text
http://localhost:8080
```

Deberías ver la página de bienvenida de Nginx.

Eso confirma que:

- el servicio `web` está funcionando
- el puerto quedó publicado correctamente
- Compose realmente levantó el stack definido en el archivo

---

## Ver el estado del stack

En otra terminal, podés ejecutar:

```bash
docker compose ps
```

---

## Qué hace

Muestra los servicios del proyecto y su estado actual.

La documentación oficial actual lo presenta justamente como el comando para listar los servicios y su estado dentro del proyecto Compose. citeturn616604search13

Esto es muy útil para comprobar rápido qué sigue corriendo.

---

## Ver logs del stack

También podés usar:

```bash
docker compose logs
```

O seguirlos en vivo con:

```bash
docker compose logs -f
```

Compose centraliza los logs del proyecto, lo que hace mucho más cómodo observar varios servicios juntos.

---

## Modo detached

Si no querés que la terminal quede ocupada mostrando logs, podés usar:

```bash
docker compose up -d
```

La documentación oficial aclara que en detached mode Compose arranca los servicios y luego sale, dejando los contenedores corriendo en background. citeturn616604search0turn616604search2

Esto es muy útil para seguir trabajando en la terminal sin perder el stack.

---

## Qué pasa si repetís docker compose up

Compose compara el estado actual con lo definido en el archivo y recrea o reutiliza según haga falta.

No hace falta aprender todos los detalles de recreación hoy.
Lo importante es entender que `up` no es solo “arrancá siempre desde cero”, sino el comando principal para converger al estado que describe el archivo.

---

## Segundo comando importante: docker compose down

Cuando querés apagar y limpiar el stack, usás:

```bash
docker compose down
```

---

## Qué hace

Por defecto:

- detiene los contenedores del proyecto
- elimina esos contenedores
- elimina las redes creadas por `up`
- elimina también la red por defecto del proyecto si se estaba usando

La documentación oficial actual lo deja explícito. citeturn616604search1

---

## Qué no elimina por defecto

Esto es muy importante.

`docker compose down` **no** elimina por defecto todos los volúmenes y datos asociados.

Docker documenta que, por defecto, solo elimina contenedores y redes creadas por `up`. Para eliminar volúmenes nombrados declarados en el archivo, necesitás usar la opción `-v` o `--volumes`. citeturn616604search1

Eso es buenísimo, porque evita que pierdas datos por costumbre.

---

## Qué pasa con los volúmenes externos

La documentación oficial también aclara que los volúmenes y redes marcados como externos nunca son eliminados por `docker compose down`. citeturn616604search1

Esto refuerza una idea importante:

- Compose limpia el entorno del proyecto
- pero cuida no borrar sin más recursos externos o persistencia compartida

---

## Cuándo usar down -v

Si querés bajar el stack **y además** eliminar los volúmenes nombrados del proyecto, podés usar:

```bash
docker compose down -v
```

Esto ya es una limpieza más agresiva.

No es algo para usar sin pensar si tu stack contiene datos que querés conservar.

---

## Diferencia entre up y down

### `docker compose up`
- crea o recrea lo necesario
- inicia los servicios
- puede adjuntarse a logs o correr en background con `-d`

### `docker compose down`
- detiene el proyecto
- elimina contenedores y redes del proyecto por defecto
- puede además borrar volúmenes si usás `-v`

Esta pareja de comandos es la base del flujo diario con Compose.

---

## Qué no tenés que confundir

### `docker compose up` no es lo mismo que `docker compose build`
`up` arranca el stack; si hay build implicado, puede construir, pero no es exactamente el mismo propósito.

### `docker compose down` no equivale a perder todos los datos
Por defecto no borra todos los volúmenes.

### Ver logs en la terminal no significa que los servicios estén “pegados” a la terminal
Con `up -d`, los dejás corriendo aparte.

### Que el stack baje no significa que el archivo desaparezca
`compose.yaml` sigue siendo la fuente de verdad del proyecto.

---

## Error común 1: pensar que down siempre borra la persistencia

No.

Por defecto no elimina todos los volúmenes nombrados del proyecto.

---

## Error común 2: usar up en modo normal y creer que “se quedó trabado”

No está trabado.
Está adjunto a los logs de los servicios.

Si querés volver rápido a la terminal, usá:

```bash
docker compose up -d
```

---

## Error común 3: no usar ps o logs para entender qué pasó

Compose ya te da herramientas muy cómodas para eso:

```bash
docker compose ps
docker compose logs
```

Conviene usarlas.

---

## Error común 4: bajar el stack y después sorprenderte porque el puerto ya no responde

Eso es totalmente esperable: los contenedores fueron detenidos y eliminados por `down`.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá una carpeta de práctica y un `compose.yaml` con este contenido:

```yaml
services:
  web:
    image: nginx
    ports:
      - "8080:80"

  db:
    image: postgres:18
    environment:
      POSTGRES_PASSWORD: mysecretpassword
    volumes:
      - postgres_data:/var/lib/postgresql

volumes:
  postgres_data:
```

### Ejercicio 2
Levantá el stack:

```bash
docker compose up
```

### Ejercicio 3
En otra terminal, verificá el estado:

```bash
docker compose ps
```

### Ejercicio 4
Abrí:

```text
http://localhost:8080
```

### Ejercicio 5
Detené el stack con:

```bash
docker compose down
```

### Ejercicio 6
Volvé a levantarlo, ahora en background:

```bash
docker compose up -d
```

### Ejercicio 7
Miralo con:

```bash
docker compose ps
docker compose logs
```

### Ejercicio 8
Apagalo otra vez:

```bash
docker compose down
```

### Ejercicio 9
Respondé con tus palabras:

- ¿qué sentiste más cómodo respecto a varios `docker run`?
- ¿qué diferencia viste entre `up` y `up -d`?
- ¿qué elimina `down` por defecto?
- ¿por qué no conviene usar `down -v` sin pensar?

---

## Segundo ejercicio de análisis

Tomá este stack mental:

- `web`
- `db`
- `redis`

Respondé:

- ¿por qué conviene levantarlo con un solo `docker compose up`?
- ¿por qué conviene apagarlo con un solo `docker compose down`?
- ¿qué ventajas tiene que la red y el volumen estén integrados en el mismo archivo?
- ¿por qué esto mejora la repetibilidad del entorno?

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué parte del flujo Compose te resultó más cómoda?
- ¿qué tan clara te quedó la diferencia entre “adjunto a logs” y “background”?
- ¿por qué down te parece más limpio que apagar contenedor por contenedor?
- ¿qué valor práctico tiene que Compose gestione red y volumen junto con los servicios?
- ¿qué parte del bloque anterior te hizo entender mejor por qué Compose se vuelve tan poderoso acá?

Estas observaciones valen mucho más que solo ejecutar los comandos.

---

## Mini desafío

Intentá explicar con tus palabras esta idea:

> Compose vuelve mucho más simple levantar y apagar una aplicación completa porque trata al stack como una unidad, no como una suma de comandos sueltos.

Y además respondé:

- ¿qué ventaja te da `docker compose up` sobre varios `docker run`?
- ¿qué ventaja te da `docker compose down` sobre bajar todo manualmente?
- ¿por qué el modo `-d` cambia bastante la experiencia del día a día?
- ¿qué tipo de proyecto tuyo te gustaría empezar a manejar así?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- usar `docker compose up` para levantar varios servicios juntos
- usar `docker compose down` para apagar y limpiar el stack
- distinguir el modo adjunto del modo detached
- entender qué recursos se crean y cuáles se eliminan por defecto
- sentir con más claridad por qué Compose cambia tanto la experiencia

---

## Resumen del tema

- `docker compose up` crea, recrea, inicia y puede adjuntarse a los servicios del proyecto. citeturn616604search0turn616604search13
- `docker compose up -d` deja los servicios corriendo en background. citeturn616604search0turn616604search2
- `docker compose down` detiene y elimina por defecto los contenedores y redes creados por `up`. citeturn616604search1
- Los volúmenes nombrados no se eliminan por defecto con `down`; para eso hace falta `-v`. citeturn616604search1
- Compose te permite tratar varios servicios como una sola unidad de trabajo.
- Este tema te deja listo para construir stacks cada vez más reales con mucha más comodidad.

---

## Próximo tema

En el próximo tema vas a seguir profundizando en el corazón del archivo Compose:

- servicios
- cómo declararlos mejor
- diferencias entre usar `image` y `build`
- cómo pensar cada componente del stack con más intención
