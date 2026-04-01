---
title: "Ver contenedores, logs y procesos: empezá a observar qué está pasando de verdad"
description: "Sexto tema práctico del curso de Docker: cómo listar contenedores, ver cuáles están corriendo, consultar logs y observar los procesos de un contenedor para entender mejor qué está ocurriendo."
order: 6
module: "Fundamentos de Docker"
level: "intro"
draft: false
---

# Ver contenedores, logs y procesos: empezá a observar qué está pasando de verdad

## Objetivo del tema

En este tema vas a:

- listar contenedores en ejecución y detenidos
- distinguir mejor los estados de tus contenedores
- consultar logs para ver qué está haciendo un contenedor
- observar los procesos en ejecución dentro de un contenedor
- empezar a diagnosticar comportamientos simples con más criterio

La idea es que dejes de trabajar “a ciegas” y empieces a mirar qué está pasando realmente en el entorno Docker.

---

## Qué vas a hacer hoy

En este tema vas a seguir este flujo:

1. listar contenedores activos
2. listar también los detenidos
3. crear un contenedor que genere salida visible
4. consultar sus logs
5. seguir los logs en tiempo real
6. observar los procesos del contenedor
7. interpretar mejor el estado general

---

## Idea central que tenés que llevarte

Hasta ahora ya viste que un contenedor puede:

- crearse
- iniciarse
- detenerse
- eliminarse

Pero para trabajar bien con Docker no alcanza con ejecutar cosas.

También necesitás poder observar:

- qué contenedores existen
- cuáles están corriendo
- qué salida están produciendo
- qué proceso principal tienen activo

Ahí entran en juego comandos como:

- `docker ps`
- `docker ps -a`
- `docker logs`
- `docker top`

---

## Primer comando del tema: ver contenedores en ejecución

Ejecutá:

```bash
docker ps
```

---

## Qué hace

Muestra los contenedores que están corriendo en ese momento.

Esto es importante:

- **no** muestra, por defecto, los contenedores detenidos
- solo muestra los que siguen activos

Por eso, a veces podés ejecutar un contenedor y después no verlo en `docker ps` si ya terminó.

---

## Qué información suele mostrar

Cuando corrés `docker ps`, normalmente vas a ver columnas como estas:

- container ID
- image
- command
- created
- status
- ports
- names

No hace falta memorizar cada columna ahora.
Lo importante es empezar a leer la salida con naturalidad.

---

## Segundo comando del tema: ver también los detenidos

Ejecutá:

```bash
docker ps -a
```

---

## Qué hace

Muestra todos los contenedores:

- los que están corriendo
- los que están detenidos
- los que terminaron hace poco
- los que fueron creados pero no siguen activos

Este comando es clave para entender mejor el ciclo de vida real de los contenedores.

---

## Qué diferencia tenés que fijar desde ahora

### `docker ps`
Muestra solo los contenedores en ejecución.

### `docker ps -a`
Muestra todos, incluso los que ya terminaron.

Esta diferencia es básica y te va a ahorrar mucha confusión.

---

## Preparar un contenedor que genere logs

Para que este tema tenga sentido práctico, vamos a levantar un contenedor que emita mensajes cada pocos segundos.

Ejecutá:

```bash
docker run -d --name contenedor-logs alpine sh -c 'i=1; while true; do echo "Mensaje $i desde Docker"; i=$((i+1)); sleep 2; done'
```

---

## Qué hace este comando

- usa la imagen `alpine`
- crea un contenedor llamado `contenedor-logs`
- lo deja corriendo en segundo plano
- ejecuta una shell que imprime mensajes cada 2 segundos

Esto es ideal para practicar `docker logs`.

---

## Verificar que esté corriendo

Ahora ejecutá:

```bash
docker ps
```

Deberías ver `contenedor-logs` entre los contenedores activos.

---

## Tercer comando del tema: ver logs de un contenedor

Ejecutá:

```bash
docker logs contenedor-logs
```

---

## Qué hace

Muestra la salida que el contenedor fue enviando a `STDOUT` y `STDERR`.

En este caso, deberías ver varios mensajes como estos:

```text
Mensaje 1 desde Docker
Mensaje 2 desde Docker
Mensaje 3 desde Docker
...
```

---

## Qué tenés que entender sobre los logs

En Docker, los logs más fáciles de consultar son los que el contenedor escribe en su salida estándar.

O sea:

- lo que la aplicación imprime normalmente
- mensajes de error
- mensajes de arranque
- trazas simples

Eso hace que `docker logs` sea una herramienta muy útil para inspección rápida.

---

## Cuarto comando del tema: seguir logs en tiempo real

Ahora ejecutá:

```bash
docker logs -f contenedor-logs
```

---

## Qué significa -f

La opción `-f` significa **follow**.

Eso hace que Docker no solo te muestre los logs ya existentes, sino también los nuevos a medida que van apareciendo.

Es como “quedarte mirando” la salida del contenedor en vivo.

---

## Cómo salir del seguimiento de logs

Para dejar de seguirlos, usá:

```text
Ctrl + C
```

Eso corta la visualización de logs, pero no necesariamente detiene el contenedor.

Esa diferencia es importante.

---

## Quinto comando del tema: ver solo las últimas líneas

Probá esto:

```bash
docker logs --tail 5 contenedor-logs
```

---

## Qué hace

Te muestra solamente las últimas 5 líneas del log.

Esto es muy útil cuando:

- el contenedor lleva mucho tiempo corriendo
- no querés revisar toda la salida
- solo te interesan los mensajes más recientes

---

## También podés combinar follow y tail

Por ejemplo:

```bash
docker logs -f --tail 5 contenedor-logs
```

Eso hace dos cosas:

- te muestra las últimas 5 líneas disponibles
- y después sigue mostrando las nuevas en tiempo real

Es una combinación muy práctica en el trabajo diario.

---

## Sexto comando del tema: ver procesos del contenedor

Ahora ejecutá:

```bash
docker top contenedor-logs
```

---

## Qué hace

Muestra los procesos que están corriendo dentro del contenedor.

Esto te ayuda a responder preguntas como estas:

- ¿qué proceso principal está vivo?
- ¿hay más de un proceso?
- ¿qué está ejecutando realmente el contenedor?

---

## Qué deberías observar

En este ejemplo, deberías ver algo relacionado con:

- la shell `sh`
- el proceso de `sleep`
- o el comando que mantiene vivo el loop

No hace falta analizarlo como un experto en procesos todavía.
La idea es empezar a mirar el contenedor como algo que realmente ejecuta procesos concretos.

---

## Qué relación hay entre logs y proceso principal

Esto es muy importante desde ahora.

Un contenedor vive mientras su proceso principal siga activo.

Y muchas veces, los logs que vos ves vienen de lo que ese proceso principal está escribiendo en pantalla o error estándar.

Por eso, cuando un contenedor falla, mirar:

- el estado
- los logs
- y los procesos

te da una primera capa muy buena de diagnóstico.

---

## Ejemplo práctico completo

Este podría ser un flujo típico:

### Paso 1
Levantás un contenedor:

```bash
docker run -d --name contenedor-logs alpine sh -c 'i=1; while true; do echo "Mensaje $i desde Docker"; i=$((i+1)); sleep 2; done'
```

### Paso 2
Comprobás que está corriendo:

```bash
docker ps
```

### Paso 3
Mirás sus logs:

```bash
docker logs contenedor-logs
```

### Paso 4
Seguís la salida en vivo:

```bash
docker logs -f contenedor-logs
```

### Paso 5
Inspeccionás sus procesos:

```bash
docker top contenedor-logs
```

Ese flujo ya es muy representativo de cómo se empieza a observar contenedores en situaciones reales.

---

## Qué no tenés que confundir

### Ver logs no es meterte dentro del contenedor
Solo estás mirando la salida que produjo.

### `docker ps` no muestra todo
Solo muestra lo que está corriendo.

### `docker top` no es lo mismo que logs
Uno muestra procesos.
El otro muestra salida generada por el contenedor.

---

## Error común 1: creer que si no aparece en docker ps no existió

No necesariamente.

Puede haber terminado y seguir existiendo como contenedor detenido.

Por eso, cuando tengas dudas, revisá también:

```bash
docker ps -a
```

---

## Error común 2: pensar que Ctrl + C detiene el contenedor cuando usás logs -f

No siempre.

Cuando estás siguiendo logs con:

```bash
docker logs -f contenedor-logs
```

y presionás `Ctrl + C`, normalmente solo dejás de seguir la salida.

El contenedor puede seguir corriendo perfectamente.

---

## Error común 3: mirar logs esperando encontrar cualquier archivo del sistema

`docker logs` no sirve para leer cualquier archivo interno del contenedor.

Sirve para ver lo que el contenedor escribió a salida estándar y error estándar.

Más adelante vas a ver otras formas de entrar al contenedor y revisar cosas internas.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Levantá el contenedor de práctica:

```bash
docker run -d --name contenedor-logs alpine sh -c 'i=1; while true; do echo "Mensaje $i desde Docker"; i=$((i+1)); sleep 2; done'
```

### Ejercicio 2
Verificá que esté corriendo:

```bash
docker ps
```

### Ejercicio 3
Listá todos los contenedores:

```bash
docker ps -a
```

### Ejercicio 4
Consultá los logs:

```bash
docker logs contenedor-logs
```

### Ejercicio 5
Seguí los logs en vivo:

```bash
docker logs -f contenedor-logs
```

### Ejercicio 6
Mostrá solo las últimas 5 líneas:

```bash
docker logs --tail 5 contenedor-logs
```

### Ejercicio 7
Mostrá los procesos del contenedor:

```bash
docker top contenedor-logs
```

### Ejercicio 8
Detenelo y eliminá el contenedor:

```bash
docker stop contenedor-logs
docker rm contenedor-logs
```

---

## Qué tenés que observar mientras practicás

Mientras hacés el ejercicio, preguntate:

- ¿qué diferencia viste entre `docker ps` y `docker ps -a`?
- ¿qué tipo de información te dio `docker logs`?
- ¿qué valor tuvo `--tail 5`?
- ¿qué te mostró `docker top` que no veías con logs?
- ¿qué pasó cuando saliste de `docker logs -f` con `Ctrl + C`?

Estas observaciones son más importantes que memorizar opciones aisladas.

---

## Mini desafío

Intentá explicar con tus palabras este flujo:

1. levantar contenedor
2. confirmar que corre
3. ver su salida
4. seguir sus mensajes en vivo
5. inspeccionar sus procesos

Y además respondé:

- ¿cuándo usarías `docker ps -a` en vez de `docker ps`?
- ¿cuándo usarías `docker logs --tail 5`?
- ¿qué tipo de duda te ayuda a resolver `docker top`?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- listar contenedores activos y detenidos
- usar `docker logs` para observar salida útil
- seguir logs en tiempo real
- limitar la salida de logs a las últimas líneas
- usar `docker top` para ver procesos del contenedor
- mirar un contenedor con más criterio y menos intuición difusa

---

## Resumen del tema

- `docker ps` muestra contenedores en ejecución.
- `docker ps -a` muestra todos los contenedores.
- `docker logs` muestra la salida del contenedor.
- `docker logs -f` sigue la salida en tiempo real.
- `docker logs --tail` permite mirar solo las últimas líneas.
- `docker top` muestra los procesos del contenedor.
- Estos comandos te ayudan a observar mejor qué está pasando realmente.

---

## Próximo tema

En el próximo tema vas a dar un paso más:

- ejecutar comandos dentro de un contenedor
- entrar a una shell de un contenedor ya corriendo
- empezar a inspeccionar el entorno desde adentro
