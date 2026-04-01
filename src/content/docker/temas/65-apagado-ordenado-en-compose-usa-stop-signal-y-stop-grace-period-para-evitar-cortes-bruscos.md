---
title: "Apagado ordenado en Compose: usá stop_signal y stop_grace_period para evitar cortes bruscos"
description: "Tema 65 del curso práctico de Docker: cómo funciona el apagado de contenedores en Docker Compose, qué papel cumplen stop_signal y stop_grace_period, y por qué un proceso bien configurado dentro del contenedor hace una gran diferencia al detener o recrear servicios."
order: 65
module: "Healthchecks y readiness para stacks más confiables"
level: "intermedio"
draft: false
---

# Apagado ordenado en Compose: usá stop_signal y stop_grace_period para evitar cortes bruscos

## Objetivo del tema

En este tema vas a:

- entender cómo apaga Docker un contenedor
- distinguir apagado ordenado de corte brusco
- usar `stop_signal` y `stop_grace_period` en Compose
- entender por qué la forma de `CMD` y `ENTRYPOINT` influye mucho
- evitar servicios que al detenerse pierden trabajo o se cierran mal

La idea es que no pienses solo en cómo arranca un stack, sino también en cómo se detiene de forma razonable.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender qué pasa cuando detenés un contenedor
2. ver qué señal envía Docker primero
3. ver qué ocurre si el proceso no sale a tiempo
4. usar `stop_signal` y `stop_grace_period`
5. entender por qué PID 1 y la forma exec de `CMD`/`ENTRYPOINT` importan tanto
6. construir una regla práctica para apagados más prolijos

---

## Idea central que tenés que llevarte

Cuando detenés un servicio, Docker no lo mata de golpe primero.

Lo que intenta hacer es:

1. enviar una señal de parada
2. esperar un tiempo de gracia
3. y recién si el proceso no salió, forzarlo

Dicho simple:

> un apagado prolijo depende de dos cosas:  
> que Docker envíe la señal correcta  
> y que el proceso dentro del contenedor la reciba y la maneje bien.

---

## Qué problema resuelve este tema

Imaginá estos casos:

- una app necesita cerrar conexiones antes de salir
- un worker necesita terminar una tarea en curso
- un servidor necesita flush de logs
- una base necesita un shutdown limpio
- un servicio tarda más de 10 segundos en cerrarse bien

Si no entendés cómo funciona el stop, podés terminar con:

- cortes bruscos
- datos a medio escribir
- timeouts molestos
- recreaciones lentas
- o procesos que no reaccionan a la señal correcta

Este tema existe para evitar eso.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker indica que al detener un contenedor, el proceso principal recibe primero `SIGTERM` y, después de un período de gracia, `SIGKILL`. También documenta que la señal inicial puede cambiarse con `STOPSIGNAL` en el Dockerfile o con `--stop-signal` al crear el contenedor. La referencia de servicios de Compose expone precisamente `stop_signal` y `stop_grace_period` para configurar esto a nivel de servicio, y la FAQ de Docker Compose aclara que por defecto Compose espera 10 segundos antes de forzar el corte. Además, Docker advierte que usar `CMD` o `ENTRYPOINT` en shell form hace que el ejecutable no sea PID 1 y no reciba señales Unix correctamente, mientras que la exec form es la recomendada. citeturn808903search1turn812770search0turn812770search1turn812770search2turn812770search8

---

## Qué pasa cuando detenés un contenedor

La secuencia básica es esta:

1. Docker envía una señal de stop al proceso principal
2. espera un tiempo de gracia
3. si el proceso no terminó, fuerza el corte

La documentación del comando `docker container stop` lo resume de forma muy directa:
primero `SIGTERM`, luego `SIGKILL` después del tiempo de gracia. citeturn808903search1turn812770search5

---

## Por qué esto importa tanto

Porque entre `SIGTERM` y `SIGKILL` está la oportunidad de cerrar bien.

Ese margen permite cosas como:

- terminar una solicitud en curso
- cerrar conexiones
- escribir buffers pendientes
- liberar recursos
- hacer un shutdown más limpio

Si ese margen no existe o no alcanza, el servicio puede cortarse de forma demasiado brusca.

---

## El timeout por defecto

La FAQ oficial de Docker Compose explica por qué a veces tus servicios tardan 10 segundos en detenerse o recrearse:
Compose intenta detenerlos con `SIGTERM`, espera 10 segundos por defecto y, si no salen, manda `SIGKILL`. citeturn812770search1

Esto significa que ese “delay molesto” muchas veces no es un bug:
es el tiempo de gracia funcionando.

---

## Qué es stop_grace_period

`stop_grace_period` es el tiempo que Compose le da al servicio para detenerse limpiamente antes de forzar el corte.

La referencia oficial de servicios de Compose documenta este atributo y explica justamente que es la duración del período de gracia antes de enviar la señal de fuerza. citeturn812770search0

Un ejemplo:

```yaml
services:
  app:
    image: miusuario/app:dev
    stop_grace_period: 30s
```

---

## Cómo se lee

La lectura conceptual sería:

- cuando Compose quiera detener `app`
- le dará hasta 30 segundos para salir limpiamente
- si no sale en ese tiempo, terminará forzándola

Esto puede ser muy útil en servicios que necesitan más tiempo que el default de 10 segundos.

---

## Cuándo puede convenir aumentar stop_grace_period

Suele tener sentido cuando:

- la app necesita cerrar conexiones con calma
- hay flush de logs o buffers
- el proceso hace cleanup real al apagar
- tenés workers que deben terminar trabajo corto antes de salir
- el default de 10 segundos se queda corto

No siempre hace falta tocarlo.
Pero cuando lo necesitás, importa bastante.

---

## Qué es stop_signal

`stop_signal` permite cambiar qué señal envía Compose al detener el servicio.

La referencia de Compose documenta este atributo y el comando `docker container stop` recuerda que la señal inicial puede configurarse con `STOPSIGNAL` en el Dockerfile o el equivalente al crear el contenedor. citeturn812770search0turn808903search1

Un ejemplo:

```yaml
services:
  app:
    image: miusuario/app:dev
    stop_signal: SIGINT
```

---

## Cómo se lee

La lectura conceptual sería:

- cuando Compose quiera detener `app`
- no mandará la señal por defecto
- mandará `SIGINT`

Esto puede servir si tu proceso espera otra señal para iniciar un shutdown limpio.

---

## Cuándo puede tener sentido cambiar stop_signal

Puede tener sentido cuando:

- el proceso maneja mejor otra señal distinta de `SIGTERM`
- estás usando una app o framework que documenta una señal preferida
- querés alinear el comportamiento del contenedor con cómo esa app espera apagarse

No es algo para cambiar “por costumbre”.
Conviene hacerlo solo si sabés qué señal tiene más sentido para ese proceso.

---

## Qué papel juega STOPSIGNAL en el Dockerfile

Docker también soporta la instrucción:

```Dockerfile
STOPSIGNAL SIGINT
```

La documentación oficial la presenta justamente como la forma de indicar qué señal usar para detener el contenedor desde la imagen misma. citeturn808903search1turn812770search5

Esto se parece bastante al tema 60 sobre healthchecks:
otra vez aparece la pregunta de si conviene que algo viaje con la imagen o se ajuste en Compose.

### Regla útil
- si es una propiedad natural del servicio, puede tener sentido en la imagen
- si querés ajustarla por stack o entorno, Compose te da más flexibilidad

---

## Por qué PID 1 importa tanto

Este es uno de los puntos más importantes del tema.

Docker advierte que cuando usás `CMD` o `ENTRYPOINT` en **shell form**, el ejecutable corre como hijo de `/bin/sh -c`, no como PID 1, y por eso no recibe señales Unix correctamente. La documentación lo dice de forma muy explícita. citeturn812770search8turn812770search2

Esto puede arruinar por completo un apagado prolijo.

---

## Shell form vs exec form

### Shell form
```Dockerfile
CMD npm run start
```

### Exec form
```Dockerfile
CMD ["npm", "run", "start"]
```

La referencia oficial del Dockerfile recomienda la exec form especialmente para `ENTRYPOINT` y explica que es la mejor forma de asegurar un comportamiento más correcto del proceso principal. citeturn812770search2turn812770search8

---

## Por qué la exec form ayuda tanto

Porque hace que el proceso correcto quede como proceso principal del contenedor.

Eso mejora mucho:

- recepción de señales
- shutdown limpio
- comportamiento como PID 1
- previsibilidad del stop

No resuelve mágicamente todos los problemas, pero sí elimina una fuente muy común de apagados torpes.

---

## Ejemplo poco sano

```Dockerfile
FROM node:22
WORKDIR /app
COPY . .
CMD npm run start
```

### Qué problema puede tener
La app puede no recibir bien la señal porque quien está adelante es `/bin/sh -c`.

---

## Ejemplo más sano

```Dockerfile
FROM node:22
WORKDIR /app
COPY . .
CMD ["npm", "run", "start"]
```

### Qué mejora
Ahora el proceso principal recibe señales de forma mucho más razonable.

---

## Un ejemplo integrado en Compose

Mirá este servicio:

```yaml
services:
  app:
    build: .
    stop_grace_period: 30s
    stop_signal: SIGTERM
```

### Cómo se lee
- la app tiene una señal de parada definida
- Compose le da 30 segundos para cerrar bien
- si no alcanza, recién después forzará el corte

Esto ya expresa bastante mejor la intención operativa del servicio.

---

## Cuándo no conviene exagerar

No todos los servicios necesitan tocar esto.

Si un servicio:

- responde bien a `SIGTERM`
- se cierra rápido
- no tiene cleanup complejo

quizá el default ya esté perfecto.

La idea del tema no es que cambies todo siempre.
La idea es que sepas **cuándo** hace falta.

---

## Qué no tenés que confundir

### stop_grace_period no cambia la señal
Cambia el tiempo de gracia antes del corte forzado.

### stop_signal no cambia cuánto espera Docker
Cambia la señal inicial que se envía.

### usar exec form no reemplaza una mala política de apagado
Pero sí evita un problema muy común de entrega de señales.

### que Compose espere 10 segundos no significa que algo esté roto
Puede ser simplemente el timeout por defecto actuando. citeturn812770search1turn812770search4

---

## Error común 1: usar shell form sin saber que las señales pueden no llegar al proceso real

Docker lo documenta claramente y es una fuente muy típica de apagados torpes. citeturn812770search8turn812770search2

---

## Error común 2: bajar demasiado el tiempo de gracia por impaciencia

Eso puede convertir un shutdown prolijo en un corte brusco.

---

## Error común 3: cambiar stop_signal sin saber qué espera realmente la app

No toda app maneja cualquier señal igual.

---

## Error común 4: pensar que restart policy y shutdown ordenado son la misma cosa

Una política de restart modela qué pasa **después** de que el contenedor sale.
Este tema modela **cómo** sale.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Compará estos dos Dockerfiles.

#### Opción A
```Dockerfile
FROM node:22
WORKDIR /app
COPY . .
CMD npm run start
```

#### Opción B
```Dockerfile
FROM node:22
WORKDIR /app
COPY . .
CMD ["npm", "run", "start"]
```

### Ejercicio 2
Respondé con tus palabras:

- cuál te parece más sana respecto a señales
- por qué
- qué problema puede traer la shell form
- qué ventaja tiene la exec form

### Ejercicio 3
Ahora mirá este servicio:

```yaml
services:
  app:
    image: miusuario/app:dev
    stop_grace_period: 30s
    stop_signal: SIGTERM
```

Respondé:

- qué resuelve `stop_grace_period`
- qué resuelve `stop_signal`
- por qué no son la misma cosa
- en qué tipo de servicio te parecería razonable usar algo así

### Ejercicio 4
Respondé además:

- por qué Compose a veces espera 10 segundos al detener o recrear un servicio
- cuándo tendría sentido aumentar ese tiempo

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué servicio necesita cerrar mejor antes de apagarse
- si hoy usa shell form o exec form
- si te parece que el tiempo por defecto de stop le alcanza
- si alguna señal distinta a `SIGTERM` tendría sentido para ese proceso
- qué mejora concreta te gustaría notar al apagar o recrear el stack

No hace falta escribir el archivo final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre señal y tiempo de gracia?
- ¿qué servicio de tus proyectos hoy probablemente corta demasiado brusco?
- ¿qué parte del tema PID 1 te pareció más importante?
- ¿qué mejora te gustaría ver al hacer `docker compose down` o al recrear servicios?
- ¿en qué proyecto tuyo esto te ahorraría más confusión?

Estas observaciones valen mucho más que copiar una sintaxis.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero cambiar la señal con la que se detiene un servicio, probablemente me conviene ________.  
> Si quiero darle más tiempo para apagarse limpiamente antes de forzarlo, probablemente me conviene ________.  
> Y si quiero que el proceso reciba mejor las señales, probablemente me conviene usar la forma ________ de `CMD` o `ENTRYPOINT`.

Y además respondé:

- ¿por qué este tema te parece importante para un stack real?
- ¿qué servicio tuyo te gustaría revisar primero con este criterio?
- ¿qué problema evita entender bien PID 1?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar cómo apaga Docker un contenedor
- usar `stop_signal` y `stop_grace_period` con más criterio
- distinguir señal y tiempo de gracia
- entender por qué exec form ayuda tanto con señales
- diseñar apagados bastante más prolijos para servicios continuos

---

## Resumen del tema

- Docker envía primero una señal de stop y luego fuerza el corte si el proceso no sale a tiempo. citeturn808903search1turn812770search5
- Compose expone `stop_signal` y `stop_grace_period` para configurar ese comportamiento a nivel de servicio. citeturn812770search0
- La FAQ oficial de Compose explica que por defecto suele esperar 10 segundos antes de forzar el corte. citeturn812770search1
- La shell form de `CMD`/`ENTRYPOINT` puede impedir que el ejecutable reciba señales correctamente porque no queda como PID 1. citeturn812770search8turn812770search2
- La exec form mejora muchísimo el comportamiento del proceso principal frente a señales. citeturn812770search2
- Este tema te ayuda a evitar apagados bruscos y a entender mucho mejor qué pasa cuando Compose detiene o recrea servicios.

---

## Próximo tema

En el próximo tema vas a empezar a entrar a otra capa muy importante del día a día con Compose:

- logs más interpretables
- eventos del stack
- qué mirar cuando algo arranca, falla o se detiene
- y cómo observar mejor lo que está haciendo realmente tu composición
