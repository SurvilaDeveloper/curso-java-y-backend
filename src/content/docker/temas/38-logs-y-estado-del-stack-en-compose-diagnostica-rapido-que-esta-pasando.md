---
title: "Logs y estado del stack en Compose: diagnosticá rápido qué está pasando"
description: "Tema 38 del curso práctico de Docker: cómo usar docker compose ps, logs y logs -f para ver el estado de los servicios, seguir la salida del stack y detectar problemas de arranque o comunicación de forma mucho más ordenada."
order: 38
module: "Docker Compose como herramienta central"
level: "base"
draft: false
---

# Logs y estado del stack en Compose: diagnosticá rápido qué está pasando

## Objetivo del tema

En este tema vas a:

- ver el estado de un stack con `docker compose ps`
- consultar logs de todos los servicios o de uno puntual
- seguir los logs en tiempo real con `docker compose logs -f`
- entender mejor qué hacer cuando algo no arranca como esperabas
- construir un primer método simple de diagnóstico para stacks Compose

La idea es que dejes de mirar un stack como una caja cerrada y empieces a leer qué está pasando con bastante más criterio.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. levantar un stack Compose
2. ver el estado de sus servicios
3. revisar logs de todo el proyecto
4. filtrar logs por servicio
5. seguir logs en vivo
6. construir una checklist rápida de diagnóstico

---

## Idea central que tenés que llevarte

Cuando un stack no anda bien, normalmente necesitás responder preguntas como estas:

- ¿qué servicios están realmente corriendo?
- ¿qué servicio falló?
- ¿qué puerto quedó publicado?
- ¿qué mensaje mostró el contenedor al arrancar?
- ¿qué cambió justo antes del error?

Compose te da herramientas muy cómodas para eso.

Dicho simple:

> `docker compose ps` te muestra el estado  
> `docker compose logs` te muestra la salida  
> y juntos te permiten diagnosticar muchísimo mejor el stack

---

## Por qué este tema importa tanto

A medida que el stack crece, empieza a ser muy común que pase algo así:

- un servicio arranca bien
- otro falla
- el puerto no responde
- la base todavía no está lista
- la app muestra un error
- no sabés por dónde empezar

Si en ese momento no tenés una forma clara de mirar el estado y la salida de los servicios, todo se vuelve más confuso.

Por eso este tema es tan importante en el día a día con Compose.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker Compose indica que `docker compose ps` muestra una foto del estado actual de los servicios, incluyendo qué contenedores están corriendo, su estado y los puertos que usan. También documenta que `docker compose logs` muestra la salida de los servicios y que `-f` sigue esa salida en tiempo real, incluso intercalando logs de varios servicios en un mismo stream. Además, Docker explica que `docker compose up` en modo adjunto ya agrega las salidas de los contenedores, de forma parecida a `docker compose logs --follow`. citeturn592668search0turn592668search1turn592668search6turn592668search3turn592668search8

---

## Recordatorio rápido del tema anterior

En el tema 37 viste cómo iterar sobre un stack:

- cuándo rebuild
- cuándo recreate
- cuándo restart

Ahora necesitás la otra mitad del flujo diario:

- ver si quedó bien levantado
- inspeccionar qué servicio falló
- seguir la salida mientras se ejecuta
- diagnosticar rápido sin empezar a probar cosas a ciegas

---

## Un stack simple para practicar

Podés usar un `compose.yaml` así:

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
```

Creá una carpeta de práctica, guardá este archivo y levantalo con:

```bash
docker compose up -d
```

---

## Primer comando clave: docker compose ps

Ahora ejecutá:

```bash
docker compose ps
```

---

## Qué hace

Te muestra una foto rápida del estado actual del proyecto Compose.

La idea es que puedas ver, de un vistazo:

- qué servicios están corriendo
- cuál está detenido
- qué nombres tienen los contenedores
- qué puertos están publicados

No reemplaza a los logs.
Pero te dice muy rápido “quién está vivo y en qué estado”.

---

## Qué deberías observar

En la salida suelen aparecer columnas como estas:

- NAME
- IMAGE
- COMMAND
- SERVICE
- CREATED
- STATUS
- PORTS

No hace falta memorizar cada una.
Lo importante es acostumbrarte a mirar especialmente:

- `SERVICE`
- `STATUS`
- `PORTS`

porque ahí suele estar la primera pista útil.

---

## Qué preguntas te ayuda a responder ps

`docker compose ps` te ayuda mucho a responder preguntas como estas:

- ¿el servicio `web` está realmente Up?
- ¿el servicio `db` se cayó?
- ¿qué puerto quedó publicado?
- ¿el stack sigue corriendo o ya se detuvo algo?

A veces con eso solo ya encontrás la mitad del problema.

---

## Segundo comando clave: docker compose logs

Ahora ejecutá:

```bash
docker compose logs
```

---

## Qué hace

Muestra la salida de los servicios del proyecto.

Esto es útil porque Compose junta los logs del stack en una vista centralizada.

En vez de ir contenedor por contenedor, podés mirar el proyecto completo.

Eso es especialmente cómodo cuando tenés varios servicios arrancando juntos.

---

## Qué deberías observar

Normalmente vas a ver líneas precedidas por el nombre del servicio o del contenedor, algo así como:

```text
db-1   | ...
web-1  | ...
```

Eso te ayuda a distinguir qué servicio está generando cada mensaje.

La guía oficial del workshop de Docker lo remarca explícitamente: Compose intercala los logs de todos los servicios en un único stream y muestra el nombre del servicio al principio de la línea para ayudarte a distinguirlos. citeturn592668search6

---

## Ver logs de un solo servicio

También podés pedir logs de un servicio puntual.

Por ejemplo:

```bash
docker compose logs db
```

o:

```bash
docker compose logs web
```

---

## Por qué esto es tan útil

Porque muchas veces ya sabés cuál es el sospechoso principal.

En vez de mirar toda la salida del stack, te enfocás en:

- la base
- la API
- el frontend
- o el servicio que falló

Eso reduce mucho el ruido.

---

## Seguir logs en tiempo real

Ahora probá esto:

```bash
docker compose logs -f
```

---

## Qué hace

Sigue los logs en tiempo real.

Es especialmente útil cuando:

- acabás de levantar el stack
- querés ver cómo evolucionan los mensajes
- querés detectar en qué momento aparece un error
- necesitás observar varios servicios juntos

Es una herramienta muy buena para problemas de timing.

---

## Seguir los logs de un solo servicio

También podés hacer:

```bash
docker compose logs -f db
```

o:

```bash
docker compose logs -f web
```

Esto es muy útil cuando el stack tiene muchos servicios y no querés mirar todo mezclado.

---

## Cómo salir de logs -f

Usá:

```text
Ctrl + C
```

Eso corta la visualización de logs, pero no baja automáticamente el stack.

Esto es importante:

- salir del stream de logs no significa apagar los servicios
- los contenedores pueden seguir corriendo perfectamente

---

## Usar logs cuando levantaste con up -d

Si corriste:

```bash
docker compose up -d
```

lo normal es que después quieras mirar el estado o la salida por separado.

Ahí aparece el flujo muy habitual:

```bash
docker compose ps
docker compose logs
docker compose logs -f
```

Esta combinación es probablemente una de las más usadas del día a día con Compose.

---

## Qué pasa con docker compose up sin -d

Recordá que si usás:

```bash
docker compose up
```

Compose ya se queda adjunto a la salida del stack y agrega los logs en la terminal.

La documentación oficial incluso dice que ese comportamiento es parecido a `docker compose logs --follow`. citeturn592668search3

Eso significa que:

- si querés mirar el arranque en vivo, `up` adjunto ya te sirve mucho
- si levantaste en background, después podés mirar con `logs` o `logs -f`

---

## Una checklist simple de diagnóstico

Cuando algo no anda, probá este orden:

### 1. Ver el estado
```bash
docker compose ps
```

### 2. Ver la salida general
```bash
docker compose logs
```

### 3. Enfocarte en el servicio sospechoso
```bash
docker compose logs servicio
```

### 4. Seguirlo en tiempo real si hace falta
```bash
docker compose logs -f servicio
```

Esta secuencia te ahorra muchísimo tiempo.

---

## Ejemplo de diagnóstico mental

Imaginá este caso:

- `http://localhost:8080` no responde

Podrías pensar así:

### Paso 1
```bash
docker compose ps
```
Ver si `web` está Up o si se cayó.

### Paso 2
```bash
docker compose logs web
```
Ver si Nginx o la app mostraron un error.

### Paso 3
Si el problema parece de dependencia:
```bash
docker compose logs db
```
para comprobar si la base arrancó.

Esta forma de razonar te ordena muchísimo.

---

## Qué no tenés que confundir

### `ps` no reemplaza a `logs`
Uno te muestra estado.
El otro te muestra salida.

### `logs -f` no baja el stack cuando salís
Solo deja de mostrarte la salida en vivo.

### Ver muchos logs no significa entender el problema
Conviene aprender a filtrar y a hacer preguntas concretas.

### Que el stack tenga contenedores no significa que todos estén realmente bien
Podés tener servicios corriendo mal, reiniciándose o mostrando errores en logs.

---

## Error común 1: abrir el navegador y quedarse solo con “no anda”

Eso no te da ninguna pista útil.

`ps` y `logs` son el siguiente paso natural.

---

## Error común 2: mirar todos los servicios a la vez cuando ya sabés cuál falla

A veces eso agrega ruido innecesario.

Mejor enfocarte en:

```bash
docker compose logs servicio
```

---

## Error común 3: confundir salir de logs -f con apagar la app

No.

El stack sigue corriendo salvo que ejecutes `docker compose down` o detengas los servicios de otra manera.

---

## Error común 4: no usar ps como primera foto del stack

`docker compose ps` es una de las formas más rápidas de orientarte antes de mirar nada más detallado.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá una carpeta con este `compose.yaml`:

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
```

### Ejercicio 2
Levantá el stack en background:

```bash
docker compose up -d
```

### Ejercicio 3
Mirá el estado:

```bash
docker compose ps
```

### Ejercicio 4
Mirá los logs del proyecto:

```bash
docker compose logs
```

### Ejercicio 5
Mirá solo los logs de la base:

```bash
docker compose logs db
```

### Ejercicio 6
Seguí los logs en vivo:

```bash
docker compose logs -f
```

### Ejercicio 7
Salí con `Ctrl + C` y comprobá que el stack sigue corriendo:

```bash
docker compose ps
```

### Ejercicio 8
Bajá el stack:

```bash
docker compose down
```

### Ejercicio 9
Respondé con tus palabras:

- ¿qué diferencia viste entre `ps` y `logs`?
- ¿qué diferencia viste entre `logs` y `logs -f`?
- ¿qué comando usarías primero si un servicio no responde?
- ¿por qué te ayuda tanto tener los logs centralizados?

---

## Segundo ejercicio de análisis

Imaginá esta situación:

- `web` debería responder en `localhost:8080`
- el navegador no carga nada

Respondé qué harías en este orden y por qué:

1. `docker compose ps`
2. `docker compose logs web`
3. `docker compose logs db`
4. `docker compose logs -f`

La idea no es adivinar un error concreto, sino practicar la lógica de diagnóstico.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué te resultó más útil para orientarte rápido: `ps` o `logs`?
- ¿qué valor práctico viste en poder filtrar por servicio?
- ¿por qué `logs -f` te parece útil para problemas de timing o de arranque?
- ¿cómo cambia tu forma de mirar un stack después de este tema?
- ¿qué parte te imaginás usando más seguido en tus proyectos?

Estas observaciones valen mucho más que ejecutar comandos de memoria.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si primero quiero saber **qué está corriendo**, uso ________.  
> Si quiero ver **qué mensaje mostró un servicio**, uso ________.  
> Si quiero seguir la salida **en vivo**, uso ________.

Y además respondé:

- ¿por qué Compose vuelve más cómodo mirar logs de varios servicios a la vez?
- ¿por qué conviene empezar por `ps` antes de sacar conclusiones raras?
- ¿qué ventaja tiene poder enfocarte en un solo servicio?
- ¿qué parte de este flujo te parece más importante para el día a día?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- usar `docker compose ps` para ver el estado del stack
- usar `docker compose logs` para leer la salida de los servicios
- usar `docker compose logs -f` para seguir la salida en tiempo real
- filtrar logs por servicio
- construir un flujo simple y útil para diagnosticar stacks Compose

---

## Resumen del tema

- `docker compose ps` muestra una foto del estado de los servicios, incluyendo estado y puertos. citeturn592668search0turn592668search8
- `docker compose logs` muestra la salida de los servicios del proyecto. citeturn592668search1turn592668search6
- `docker compose logs -f` sigue esa salida en tiempo real. citeturn592668search1turn592668search6
- `docker compose up` en modo adjunto ya agrega los logs del stack de forma parecida a `logs --follow`. citeturn592668search3
- Estos comandos son una base muy fuerte para diagnosticar problemas de arranque y comunicación en tu aplicación Compose.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en el trabajo diario con Compose:

- ejecutar comandos puntuales dentro del stack
- entrar a un servicio
- usar `docker compose exec`
- depurar mejor desde adentro de los servicios
