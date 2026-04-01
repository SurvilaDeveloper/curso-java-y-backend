---
title: "Dejá un README operativo mínimo: cómo levantar, reconstruir, ver logs y depurar sin depender de memoria"
description: "Tema 115 del curso práctico de Docker: cómo documentar lo mínimo útil de un proyecto Docker o Docker Compose para que levantarlo, bajarlo, reconstruirlo, ver logs y entrar a servicios no dependa de memoria, improvisación o contexto perdido."
order: 115
module: "Cierre operativo, documentación mínima y proyecto más compartible"
level: "intermedio"
draft: false
---

# Dejá un README operativo mínimo: cómo levantar, reconstruir, ver logs y depurar sin depender de memoria

## Objetivo del tema

En este tema vas a:

- entender por qué un proyecto Docker sin README operativo se vuelve difícil de retomar o compartir
- documentar los comandos mínimos realmente útiles del día a día
- distinguir qué conviene dejar escrito y qué no hace falta llenar de texto
- usar la semántica real de `docker compose up`, `down`, `logs`, `exec` y `ps`
- construir una plantilla simple de README operativo que te sirva de base en proyectos reales

La idea es que el proyecto no dependa de “acordarte cómo lo levantabas”, sino de una documentación mínima, clara y realmente usable.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender qué comandos mínimos valen la pena documentar
2. decidir qué explicar de `up`, `down`, `logs`, `exec` y `ps`
3. distinguir operaciones normales de operaciones destructivas
4. dejar comandos de debugging y rebuild a mano
5. construir un README operativo corto, pero muy útil

---

## Idea central que tenés que llevarte

Un proyecto Docker o Compose se vuelve mucho más reutilizable cuando alguien puede responder rápido estas preguntas:

- ¿cómo lo levanto?
- ¿cómo lo bajo?
- ¿cómo veo logs?
- ¿cómo entro a un servicio?
- ¿cómo reconstruyo?
- ¿qué comando uso para ver el estado actual?

Docker documenta que `docker compose up` crea, recrea, inicia y adjunta a los servicios del proyecto, que `docker compose down` detiene y elimina los recursos creados por `up` pero no elimina volúmenes por defecto, que `docker compose logs` sirve para inspeccionar la salida de los servicios, que `docker compose exec` permite correr comandos arbitrarios dentro de un servicio y que `docker compose ps` da una foto del estado actual del proyecto. Todo eso vuelve a estos comandos candidatos naturales para un README operativo mínimo. citeturn766965search0turn766965search1turn766965search2turn766965search3turn766965search11turn766965search22

Dicho simple:

> un buen README operativo no documenta todo;  
> documenta lo que te evita fricción real para usar y retomar el proyecto.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker deja varias ideas muy claras para este tema:

- `docker compose up` **builds, (re)creates, starts and attaches** a los servicios del proyecto, y agrega la salida de los contenedores de forma similar a `docker compose logs --follow`. citeturn766965search0
- `docker compose down` detiene y elimina contenedores y redes creadas por `up`; por defecto no elimina volúmenes externos ni los named volumes salvo que se use `--volumes`. citeturn766965search1turn766965search22
- `docker compose logs` soporta `--follow`, `--tail`, `--since`, `--timestamps` y filtrado por servicio, lo que lo vuelve ideal para documentación operativa básica. citeturn766965search2
- `docker compose exec` es el equivalente de `docker exec` orientado a un servicio Compose y asigna TTY por defecto. citeturn766965search3
- `docker compose ps` da una foto del estado actual de los servicios, incluyendo estado y puertos. citeturn766965search11
- La propia documentación de Compose y sus guías destacan Compose como una forma de definir, levantar y compartir entornos consistentes de desarrollo, testing o producción. citeturn766965search7turn766965search15turn766965search13

---

## Primer concepto: un README operativo no es un manual enciclopédico

No hace falta escribir veinte páginas.

De hecho, si el README operativo se vuelve demasiado largo, muchas veces deja de servir como referencia rápida.

La idea sana es otra:

- pocos comandos
- bien elegidos
- con intención clara
- y con advertencias donde realmente importa

Este tipo de README vale muchísimo más que una explicación interminable que nadie vuelve a leer.

---

## Segundo concepto: qué conviene documentar sí o sí

Para la mayoría de proyectos Docker/Compose, suele convenir documentar al menos:

- cómo levantar el proyecto
- cómo bajarlo
- cómo ver logs
- cómo entrar a un servicio
- cómo ver el estado actual
- cómo reconstruir si cambió la imagen o el Dockerfile
- qué comando es destructivo y cuál no

Esto ya cubre una enorme parte de la fricción cotidiana.

---

## Tercer concepto: `up` es el comando de arranque natural

Docker documenta que `docker compose up` crea, recrea, inicia y adjunta a los servicios del proyecto. Además, puede construir si hace falta. citeturn766965search0

Entonces, en un README operativo, suele tener mucho sentido dejar algo como:

```bash
docker compose up
```

y también una variante desacoplada:

```bash
docker compose up -d
```

### Qué conviene explicar
- que `up` es el comando normal para levantar el proyecto
- que `-d` lo deja corriendo en segundo plano
- que si querés ver la salida viva del stack, `up` sin `-d` ya adjunta logs del arranque

Esto evita muchísima improvisación.

---

## Cuarto concepto: `down` merece advertencia

Docker documenta que `docker compose down` detiene y elimina recursos creados por `up`, pero que por defecto no borra volúmenes; para eso hace falta `--volumes`. citeturn766965search1turn766965search22

Por eso, en un README operativo, no alcanza con poner solo:

```bash
docker compose down
```

También conviene aclarar algo como:

- `down` baja el proyecto
- no borra volúmenes por defecto
- `down --volumes` sí puede eliminar datos persistentes

Esa pequeña aclaración puede ahorrarte un disgusto real.

---

## Quinto concepto: logs rápidos y logs con foco

Docker documenta `docker compose logs` y sus opciones más útiles como `--follow`, `--tail` y `--since`. citeturn766965search2

Entonces, para un README operativo mínimo, tiene muchísimo sentido dejar algo como:

```bash
docker compose logs -f
docker compose logs -f app
docker compose logs --tail 100
```

### Qué gana esto
- te deja una ruta de debugging inmediata
- evita que alguien tenga que recordar flags de memoria
- reduce muchísimo el tiempo entre “algo anda raro” y “ya estoy viendo qué pasa”

En la práctica, esta parte del README se usa muchísimo.

---

## Sexto concepto: `exec` como puerta de entrada a debugging puntual

Docker documenta que `docker compose exec` permite correr comandos arbitrarios en tus servicios, asignando TTY por defecto. citeturn766965search3

En un README operativo, suele ser muy útil dejar ejemplos como:

```bash
docker compose exec app sh
docker compose exec db psql -U postgres -d appdb
```

### Qué conviene explicar
- qué servicio suele ser el que más conviene inspeccionar
- qué shell o comando sirve de entrada
- alguna tarea común de mantenimiento o debugging

Esto transforma el README en una herramienta de trabajo real, no solo en presentación del proyecto.

---

## Séptimo concepto: `ps` para ver el estado real del proyecto

Docker documenta que `docker compose ps` da una foto del estado actual de los servicios, incluyendo estado y puertos. citeturn766965search11

Entonces, en un README operativo mínimo, también conviene dejar algo como:

```bash
docker compose ps
```

### Qué gana esto
- te da un punto de partida rápido
- te dice si los servicios están levantados
- ayuda a no entrar directo a logs o exec sin confirmar primero el estado general

Es un comando pequeño, pero muy valioso.

---

## Octavo concepto: rebuild documentado, no implícito

Aunque `docker compose up` puede construir según el caso, en la práctica suele ser muy útil dejar explícita la forma de reconstruir.

Por ejemplo:

```bash
docker compose up --build
```

o, si querés separarlo:

```bash
docker compose build
docker compose up -d
```

La idea importante acá no es una bandera específica.
La idea es que el README te deje claro **cómo refrescar la imagen cuando cambió el Dockerfile o el código según el flujo del proyecto**.

---

## Qué conviene dejar claro sobre rebuild

Conviene aclarar algo como:

- cuándo alcanza con `up`
- cuándo conviene `up --build`
- si el proyecto usa imágenes ya publicadas o build local
- si hay pasos que tardan o regeneran dependencias

Ese pequeño contexto vale mucho.

---

## Noveno concepto: un README operativo también debería nombrar el archivo central

Docker y Compose documentan que Compose se apoya en `compose.yaml` como archivo central para definir servicios, redes, volúmenes, etc. citeturn766965search5turn766965search15

Entonces, suele ser útil dejar explícito algo como:

- “El entorno se levanta desde `compose.yaml`”
- “Los servicios principales son `proxy`, `app` y `db`”
- “Los comandos de este README asumen que estás parado en la raíz del proyecto”

Esto reduce errores bobos de contexto.

---

## Una plantilla corta y bastante sana

Acá tenés un ejemplo de README operativo mínimo:

```md
# Proyecto X

## Requisitos
- Docker
- Docker Compose

## Levantar el proyecto
```bash
docker compose up -d
```

## Ver estado
```bash
docker compose ps
```

## Ver logs
```bash
docker compose logs -f
docker compose logs -f app
```

## Entrar a la app
```bash
docker compose exec app sh
```

## Entrar a la base
```bash
docker compose exec db psql -U postgres -d appdb
```

## Reconstruir
```bash
docker compose up --build -d
```

## Bajar el proyecto
```bash
docker compose down
```

## Bajar y borrar volúmenes
```bash
docker compose down --volumes
```

> Atención: `--volumes` elimina datos persistentes.
```

Esta estructura es breve, pero muy útil.

---

## Qué hace buena a esta plantilla

La hace buena que:

- resuelve preguntas reales
- usa comandos oficiales y cotidianos
- deja una advertencia justo donde hace falta
- no intenta explicar todo Docker de nuevo
- sirve tanto para vos dentro de dos semanas como para otra persona mañana

Eso es exactamente lo que querés de un README operativo mínimo.

---

## Décimo concepto: documentar convenciones mínimas del equipo

Además de comandos, a veces conviene dejar 3 o 4 convenciones prácticas.

Por ejemplo:

- qué servicio actúa como entrada (`proxy`)
- qué servicio queda interno (`app`)
- si la base se publica solo a localhost o ni se publica
- si el proyecto espera `docker compose up -d` como flujo normal
- si para debugging se usa primero `docker compose ps` y luego `logs`

Esto no es “teoría”.
Es contexto operativo que ahorra preguntas repetidas.

---

## Qué no tenés que confundir

### README operativo no es lo mismo que tutorial completo
Su trabajo es ayudarte a usar el proyecto, no enseñarte Docker desde cero.

### Documentar más no siempre significa documentar mejor
A veces significa meter ruido.

### `docker compose down` no es automáticamente destructivo para datos
Por defecto no borra volúmenes, pero `--volumes` sí cambia el riesgo. citeturn766965search1turn766965search22

### `up` y `run` no son lo mismo
Docker documenta que `up` levanta el proyecto completo, mientras `run` se orienta a una tarea puntual sobre un servicio con sus dependencias. citeturn766965search21

---

## Error común 1: no dejar documentado cómo reconstruir

Eso obliga a recordar flujos de memoria o a improvisarlos cada vez.

---

## Error común 2: no advertir que `down --volumes` borra datos persistentes

Ese olvido puede costar caro. citeturn766965search22turn766965search1

---

## Error común 3: llenar el README de teoría, pero no poner comandos reales de uso diario

Eso lo vuelve menos útil justo cuando más se necesita.

---

## Error común 4: no dejar claro cuál es el servicio para logs o exec más común

Eso mete fricción en debugging básico.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Respondé con tus palabras:

- por qué un proyecto Docker sin README operativo se vuelve más difícil de retomar
- qué comandos te parecen mínimos e imprescindibles
- por qué `up`, `down`, `logs`, `exec` y `ps` forman una base tan buena

### Ejercicio 2
Imaginá que tenés que documentar este flujo mínimo:

- levantar
- ver estado
- ver logs
- entrar a `app`
- bajar el proyecto
- advertir sobre volúmenes

Respondé:

- qué comandos pondrías
- qué advertencia dejarías
- qué servicio te parece más útil documentar primero para `exec`

### Ejercicio 3
Respondé además:

- por qué conviene documentar el rebuild
- por qué conviene aclarar si el proyecto usa `compose.yaml` como punto de entrada
- por qué un README operativo corto puede ser mejor que uno enorme

### Ejercicio 4
Escribí mentalmente una mini estructura de README con:
- título
- requisitos
- levantar
- logs
- exec
- bajar
- advertencia de volúmenes

No hace falta que sea perfecta.
La idea es que te acostumbres a pensar documentación operativa útil.

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué parte hoy depende demasiado de tu memoria
- qué comando te gustaría dejar documentado primero
- si hoy te falta más documentación de logs, de rebuild o de cleanup
- qué advertencia te parecería más importante dejar visible
- qué cambio concreto harías primero para volver el proyecto más fácil de retomar o compartir

No hace falta escribir todavía el README final real.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre documentación útil y documentación de relleno?
- ¿en qué proyecto tuyo hoy te serviría más tener comandos de logs y exec bien visibles?
- ¿qué advertencia te parece más valiosa dejar cerca de `down`?
- ¿qué comando creés que más olvidaría alguien nuevo en el proyecto?
- ¿qué mejora concreta te gustaría notar al dejar una entrada operativa más clara?

Estas observaciones valen mucho más que memorizar una plantilla fija.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero levantar el proyecto completo, probablemente me conviene usar `docker compose ________`.  
> Si quiero verlo bajar y limpiar lo creado por `up`, probablemente me conviene usar `docker compose ________`.  
> Si quiero observar lo que está pasando, probablemente me conviene usar `docker compose ________`.  
> Si quiero ejecutar un comando puntual dentro de un servicio, probablemente me conviene usar `docker compose ________`.  
> Si quiero una foto rápida del estado actual, probablemente me conviene usar `docker compose ________`.

Y además respondé:

- ¿por qué este tema impacta tanto en mantenimiento y transferencia del proyecto?
- ¿qué proyecto tuyo te gustaría documentar primero con esta lógica?
- ¿qué riesgo evitás al no depender solo de memoria o contexto oral?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- decidir qué comandos mínimos conviene dejar documentados
- distinguir un README operativo útil de uno que solo hace ruido
- dejar advertencias importantes donde corresponde
- volver un proyecto Docker mucho más fácil de retomar o compartir
- pensar documentación operativa con bastante más criterio y foco

---

## Resumen del tema

- `docker compose up` crea, recrea, inicia y adjunta a los servicios del proyecto. citeturn766965search0
- `docker compose down` baja el proyecto y no elimina volúmenes por defecto; `--volumes` sí cambia el riesgo. citeturn766965search1turn766965search22
- `docker compose logs` sirve para observación rápida y soporta `--follow`, `--tail` y otras opciones muy útiles. citeturn766965search2
- `docker compose exec` permite ejecutar comandos arbitrarios en un servicio Compose. citeturn766965search3
- `docker compose ps` da una foto del estado actual del proyecto. citeturn766965search11
- Compose está pensado justamente para definir, levantar y compartir entornos consistentes. citeturn766965search7turn766965search15
- Este tema te deja una base mucho más clara para documentar lo mínimo útil y volver tu proyecto más compartible y más fácil de retomar.

---

## Próximo tema

En el próximo tema vas a seguir avanzando hacia el cierre del roadmap con una práctica integrada:

- stack pequeño
- README operativo mínimo
- comandos clave a mano
- advertencias útiles
- y una forma mucho más profesional de dejar un proyecto listo para volver mañana o compartir con otra persona
