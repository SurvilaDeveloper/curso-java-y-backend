---
title: "Estructura básica de compose.yaml: empezá a leer y escribir tu primer archivo Compose real"
description: "Tema 33 del curso práctico de Docker: cómo está organizado un compose.yaml, qué papel cumple services y cómo empezar a leer un archivo Compose real sin perderte entre YAML, puertos, imágenes y configuraciones."
order: 33
module: "Docker Compose como herramienta central"
level: "base"
draft: false
---

# Estructura básica de compose.yaml: empezá a leer y escribir tu primer archivo Compose real

## Objetivo del tema

En este tema vas a:

- entender la estructura básica de un `compose.yaml`
- ver qué papel cumple la sección `services`
- empezar a leer un archivo Compose real sin perderte
- identificar dónde aparecen puertos, imágenes, variables y mounts
- prepararte para escribir tu primer stack Compose en los próximos temas

La idea es que el archivo deje de parecerte un YAML extraño y empiece a sentirse como una forma ordenada de describir tu aplicación.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender la forma general de un `compose.yaml`
2. ver qué significa `services`
3. reconocer atributos básicos dentro de un servicio
4. entender dónde encajan `networks` y `volumes`
5. leer un ejemplo completo y simple con más criterio

---

## Idea central que tenés que llevarte

Un archivo Compose describe una aplicación como un conjunto de servicios relacionados.

La parte más importante del arranque suele ser esta:

```yaml
services:
  ...
```

A partir de ahí, cada servicio define su propia configuración.

Dicho simple:

> `compose.yaml` es el mapa general del stack  
> y `services` es el lugar donde definís los componentes que lo forman

---

## Qué dice la documentación oficial

La documentación oficial de Docker explica que el archivo `compose.yaml` sigue la Compose Specification y se usa para definir aplicaciones multi-contenedor. También indica que el modelo de aplicación se organiza alrededor de **services**, y que el archivo puede incluir además redes, volúmenes y otros recursos compartidos. Docker marca `compose.yaml` como el nombre recomendado hoy, y aclara que la propiedad top-level `version` quedó obsoleta y solo es informativa si se usa. citeturn915706search1turn915706search0turn915706search4turn915706search7

---

## La forma general de un compose.yaml

Un archivo muy simple puede verse así:

```yaml
services:
  web:
    image: nginx
    ports:
      - "8080:80"
```

Aunque sea mínimo, ya muestra algo importante:

- existe una aplicación
- tiene un servicio llamado `web`
- ese servicio usa una imagen
- ese servicio publica un puerto

Esto ya es Compose real.

---

## Qué significa services

La sección `services` es el corazón del archivo.

Ahí definís los componentes que componen la aplicación.

Por ejemplo:

- `web`
- `db`
- `redis`
- `api`
- `worker`

Cada nombre representa un servicio lógico del stack.

La documentación oficial describe un servicio como el componente principal del modelo de aplicación Compose, implementado normalmente por uno o más contenedores que comparten imagen y configuración. citeturn915706search1turn915706search2

---

## Cómo conviene pensar un servicio

No lo pienses solo como “un contenedor”.

Pensalo más bien como:

- una pieza de la aplicación
- una configuración declarada
- un componente con imagen, puertos, variables, volúmenes y red

Eso te ayuda a leer Compose como arquitectura y no solo como sintaxis.

---

## Un servicio mínimo

Por ejemplo:

```yaml
services:
  web:
    image: nginx
```

La lectura conceptual sería:

- mi aplicación tiene un servicio llamado `web`
- ese servicio usa la imagen `nginx`

Nada más.

A veces eso ya alcanza para ciertas pruebas simples.

---

## Atributo básico 1: image

`image` indica qué imagen va a usar el servicio.

Por ejemplo:

```yaml
services:
  web:
    image: nginx
```

o:

```yaml
services:
  db:
    image: postgres:18
```

Esto se parece mucho a lo que antes escribías a mano en `docker run`.

---

## Atributo básico 2: ports

`ports` sirve para publicar puertos del contenedor hacia el host.

Por ejemplo:

```yaml
services:
  web:
    image: nginx
    ports:
      - "8080:80"
```

La idea es exactamente la misma que ya conocés:

- host `8080`
- contenedor `80`

Esto permite entrar desde tu máquina, por ejemplo por `http://localhost:8080`.

---

## Atributo básico 3: environment

`environment` permite definir variables de entorno del servicio.

Por ejemplo:

```yaml
services:
  db:
    image: postgres:18
    environment:
      POSTGRES_PASSWORD: mysecretpassword
```

O también puede aparecer en formato de lista.

La idea importante es que Compose te deja declarar esa configuración directamente dentro del archivo, en vez de dispersarla en comandos sueltos.

---

## Atributo básico 4: volumes

Dentro de un servicio, `volumes` sirve para montar almacenamiento.

Por ejemplo:

```yaml
services:
  db:
    image: postgres:18
    volumes:
      - postgres_data:/var/lib/postgresql
```

Esto conecta muy bien con todo lo que ya viste sobre persistencia.

La documentación oficial aclara que para que un volumen pueda usarse entre servicios, debe definirse y luego darse acceso desde la sección `services`. citeturn915706search4

---

## Atributo básico 5: build

Un servicio no siempre usa una imagen remota ya hecha.

También puede construirse desde tu proyecto local.

Por ejemplo:

```yaml
services:
  app:
    build: .
```

La documentación oficial de servicios en Compose explica justamente que cada servicio puede incluir una sección `build` para construir su propia imagen. citeturn915706search2

Esto te permite combinar muy bien:

- servicios que usan imágenes oficiales
- servicios que construís desde tu propio código

---

## Dónde encajan networks y volumes top-level

Además de `services`, Compose puede tener otras secciones arriba de todo, como:

- `networks`
- `volumes`

Por ejemplo:

```yaml
services:
  db:
    image: postgres:18
    volumes:
      - postgres_data:/var/lib/postgresql

volumes:
  postgres_data:
```

O también:

```yaml
services:
  web:
    image: nginx
    networks:
      - app-net

networks:
  app-net:
```

La documentación oficial explica que Compose puede definir redes y volúmenes a nivel top-level, y luego cada servicio recibe acceso explícito a los que necesita. citeturn915706search8turn915706search4

---

## Qué red crea Compose por defecto

Docker documenta que, por defecto, Compose crea una red para la aplicación y conecta ahí todos los servicios, haciéndolos alcanzables por el nombre del servicio. citeturn915706search8turn915706search9

Eso significa que muchas veces ni siquiera necesitás declarar una red explícita para un caso simple.

Más adelante vas a ver cuándo vale la pena declarar una red propia de forma explícita.

---

## Ejemplo completo y simple

Mirá este archivo:

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

## Cómo se lee este ejemplo

La lectura conceptual sería esta:

- mi aplicación tiene dos servicios: `web` y `db`
- `web` usa Nginx y expone el puerto `8080`
- `db` usa PostgreSQL 18
- `db` necesita una contraseña de entorno
- `db` además usa un volumen llamado `postgres_data`
- ese volumen se declara al final del archivo

Aunque todavía no lo levantes, este archivo ya comunica muchísimo mejor la estructura de la aplicación que una lista de comandos sueltos.

---

## Qué diferencia hay con varios docker run

Antes, algo parecido podía quedar repartido en varios comandos.

Ahora, en cambio:

- la imagen está declarada en el servicio
- el puerto está declarado en el servicio
- la variable está declarada en el servicio
- el volumen está declarado en el mismo archivo

Eso hace que el stack sea más fácil de:

- leer
- repetir
- revisar
- compartir
- versionar en el repositorio

---

## Qué pasa con version

Esto merece una mención breve porque aparece muchísimo en tutoriales viejos.

La documentación oficial actual explica que la propiedad top-level `version` está obsoleta, que Compose usa siempre el schema más reciente para validar el archivo y que, si la incluís, hoy solo genera un warning informativo. citeturn915706search7

Para este curso, entonces, no la vamos a usar.

---

## Qué nombre conviene usar para el archivo

La documentación oficial recomienda `compose.yaml` como nombre preferido del archivo. Compose sigue aceptando variantes históricas, pero este curso va a trabajar con el nombre recomendado actual. citeturn915706search4

---

## Qué no tenés que confundir

### El nombre del servicio no es automáticamente el nombre del archivo
El archivo describe todo el stack.
Los servicios son partes de ese stack.

### Definir un servicio no es lo mismo que publicarlo al host
Solo los servicios con `ports` quedan expuestos hacia tu máquina.

### Un servicio puede usar image o build
No todos tienen que usar la misma estrategia.

### El archivo Compose no reemplaza entender redes, volúmenes o variables
Los reúne y ordena, pero los conceptos siguen siendo importantes.

---

## Error común 1: creer que todo va dentro de services

No.

`services` es la parte central, pero a veces vas a tener también secciones top-level como `volumes` o `networks`.

---

## Error común 2: copiar ejemplos viejos con version sin entenderlo

La documentación oficial actual ya no la recomienda para el flujo moderno. citeturn915706search7

---

## Error común 3: no distinguir entre image y build

Algunos servicios usan una imagen ya existente.
Otros se construyen desde tu código local.

Ambas cosas son válidas, pero no significan lo mismo.

---

## Error común 4: creer que compose.yaml “ejecuta magia”

No.

Simplemente declara de forma ordenada:

- qué servicios existen
- qué usan
- cómo se conectan
- qué puertos exponen
- qué almacenamiento necesitan

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá una carpeta de práctica, por ejemplo:

```bash
mkdir practica-compose
cd practica-compose
```

### Ejercicio 2
Creá un archivo llamado:

```text
compose.yaml
```

### Ejercicio 3
Pegá este contenido:

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

### Ejercicio 4
Respondé con tus palabras:

- cuántos servicios hay
- qué imagen usa cada uno
- qué servicio publica puerto al host
- qué servicio usa un volumen
- dónde se declara ese volumen

### Ejercicio 5
Señalá dentro del archivo:

- qué parte pertenece a `services`
- qué parte pertenece a `volumes`
- qué campo usarías si quisieras construir una imagen propia en vez de usar una ya hecha

---

## Segundo ejercicio de análisis

Tomá este bloque:

```yaml
services:
  api:
    build: .
    ports:
      - "3000:3000"
```

Y respondé:

- qué servicio define
- qué diferencia hay entre `build: .` e `image: nginx`
- qué puerto expone
- qué relación ves con lo que antes hacías con `docker build` y `docker run`

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué parte del archivo te resultó más intuitiva?
- ¿qué parte todavía te obliga a pensar un poco más?
- ¿por qué `services` empieza a sentirse como el corazón del stack?
- ¿qué ventaja concreta ves en tener puertos, variables y volúmenes declarados en un solo archivo?
- ¿qué te imaginás que se va a volver mucho más fácil en el próximo tema cuando uses `docker compose up`?

Estas observaciones valen mucho más que memorizar la forma del YAML de memoria.

---

## Mini desafío

Intentá explicar con tus palabras esta idea:

> Un `compose.yaml` organiza una aplicación como un conjunto de servicios, y cada servicio declara la imagen o build que usa, los puertos que expone y el almacenamiento o configuración que necesita.

Y además respondé:

- ¿por qué `services` es la sección más importante del arranque?
- ¿por qué `volumes` aparece a veces fuera de los servicios?
- ¿qué ventaja te da que Compose cree una red por defecto para la app?
- ¿qué servicio de uno de tus proyectos te gustaría describir primero en Compose?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- leer la estructura básica de un `compose.yaml`
- entender qué papel cumple `services`
- reconocer atributos básicos como `image`, `build`, `ports`, `environment` y `volumes`
- ubicar secciones top-level como `volumes` y `networks`
- prepararte para escribir y levantar tu primer archivo Compose real

---

## Resumen del tema

- `compose.yaml` es el archivo central donde describís tu aplicación Compose. citeturn915706search1turn915706search4
- La sección `services` es el corazón del archivo. citeturn915706search1turn915706search2
- Cada servicio puede usar `image` o `build`, además de puertos, variables y mounts. citeturn915706search2
- Las secciones top-level como `volumes` y `networks` permiten declarar recursos compartidos. citeturn915706search8turn915706search4
- Compose crea una red por defecto para la app y los servicios pueden alcanzarse por nombre dentro de esa red. citeturn915706search8turn915706search9
- Este tema te deja listo para empezar a usar Compose de verdad en el siguiente paso.

---

## Próximo tema

En el próximo tema vas a usar este archivo para lo que más valor le da a Compose:

- levantar varios servicios juntos
- usar `docker compose up`
- apagar todo con `docker compose down`
- empezar a sentir por qué Compose cambia tanto la experiencia
