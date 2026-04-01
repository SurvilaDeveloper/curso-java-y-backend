---
title: "Ciclo de vida de un contenedor: crear, iniciar, detener, reiniciar y eliminar"
description: "Quinto tema práctico del curso de Docker: cómo se mueve un contenedor entre distintos estados y qué comandos usar para crearlo, iniciarlo, detenerlo, reiniciarlo y eliminarlo con seguridad."
order: 5
module: "Fundamentos de Docker"
level: "intro"
draft: false
---

# Ciclo de vida de un contenedor: crear, iniciar, detener, reiniciar y eliminar

## Objetivo del tema

En este tema vas a:

- entender el ciclo de vida básico de un contenedor
- distinguir entre crear e iniciar un contenedor
- detener y reiniciar contenedores con intención
- eliminar contenedores que ya no necesitás
- empezar a trabajar con más control y menos improvisación

La idea es que dejes de pensar en los contenedores como algo que solo “se corre” y entiendas que tienen estados y transiciones concretas.

---

## Qué vas a hacer hoy

En este tema vas a seguir este flujo:

1. entender los estados básicos de un contenedor
2. crear un contenedor sin arrancarlo
3. iniciarlo manualmente
4. detenerlo
5. reiniciarlo
6. eliminarlo
7. mirar todo el recorrido completo

---

## Idea central que tenés que llevarte

Un contenedor no solo existe en dos estados, “anda” o “no anda”.

En la práctica, un contenedor puede pasar por distintas etapas, por ejemplo:

- creado
- en ejecución
- detenido
- eliminado

Y Docker te da comandos específicos para manejar cada paso.

---

## La visión general del ciclo de vida

La idea más simple del ciclo de vida es esta:

1. se crea un contenedor
2. se inicia
3. queda corriendo mientras su proceso principal siga activo
4. se detiene o termina
5. puede reiniciarse
6. puede eliminarse

Esto te ayuda a trabajar con más precisión.

---

## Qué diferencia hay entre crear e iniciar

Esta diferencia es clave.

### Crear
Significa preparar el contenedor a partir de una imagen, pero **sin arrancarlo todavía**.

### Iniciar
Significa arrancar un contenedor que ya existe.

Esto es importante porque mucha gente usa `docker run` y no ve que ahí Docker está haciendo más de una cosa al mismo tiempo.

---

## Recordatorio importante sobre docker run

Cuando hacés algo como:

```bash
docker run alpine echo "Hola"
```

Docker no solo ejecuta un comando.

En esencia:

- crea el contenedor
- y después lo inicia

Por eso `docker run` es tan cómodo al principio.

Pero para entender bien el ciclo de vida, conviene separar los pasos.

---

## Primer comando del tema: crear un contenedor sin arrancarlo

Probá esto:

```bash
docker create --name mi-alpine alpine echo "Hola desde un contenedor creado"
```

---

## Qué hace este comando

- usa la imagen `alpine`
- crea un contenedor llamado `mi-alpine`
- deja configurado el comando `echo "Hola desde un contenedor creado"`
- **no lo ejecuta todavía**

Esto es muy importante:

el contenedor existe, pero todavía no está corriendo.

---

## Cómo comprobarlo

Ejecutá:

```bash
docker ps -a
```

## Qué deberías ver

Deberías ver el contenedor `mi-alpine` en la lista.

Lo esperable es que aparezca en estado **Created** o luego cambie a otro estado si lo iniciás.

`docker ps -a` es muy útil porque muestra también los contenedores que no están corriendo.

---

## Segundo comando del tema: iniciar un contenedor ya creado

Ahora ejecutá:

```bash
docker start mi-alpine
```

---

## Qué hace

Arranca el contenedor que ya habías creado.

En este caso, como el comando principal del contenedor es un `echo`, el contenedor probablemente:

- arranque
- ejecute el comando
- termine enseguida

O sea: iniciar no garantiza que quede activo durante mucho tiempo.
Eso depende del proceso principal.

---

## Cómo ver el resultado si terminó rápido

Volvé a ejecutar:

```bash
docker ps -a
```

Ahora probablemente lo veas como **Exited**.

Eso no significa que algo salió mal.
Solo significa que el proceso principal ya terminó.

---

## Crear un contenedor que quede vivo más tiempo

Para practicar mejor el ciclo de vida, conviene usar un contenedor que no termine enseguida.

Probá esto:

```bash
docker run -d --name contenedor-lento alpine sleep 300
```

---

## Qué hace este comando

- usa la imagen `alpine`
- crea un contenedor llamado `contenedor-lento`
- ejecuta `sleep 300`
- lo deja corriendo en segundo plano

Como el proceso principal tarda 300 segundos en terminar, el contenedor queda activo durante ese tiempo salvo que lo detengas antes.

---

## Qué significa -d

La opción `-d` significa **detached mode**.

Eso hace que el contenedor se ejecute en segundo plano, en lugar de dejarte atado a la terminal.

Es muy común cuando querés levantar servicios o procesos que sigan funcionando.

---

## Cómo comprobar que está corriendo

Ejecutá:

```bash
docker ps
```

## Qué deberías ver

Deberías ver `contenedor-lento` en la lista de contenedores en ejecución.

A diferencia de `docker ps -a`, este comando muestra solo los que están corriendo.

---

## Tercer comando del tema: detener un contenedor

Ahora detenelo:

```bash
docker stop contenedor-lento
```

---

## Qué hace

Le pide al contenedor que termine su ejecución.

Después de eso, si ejecutás:

```bash
docker ps -a
```

deberías verlo con estado **Exited**.

---

## Detener no es lo mismo que eliminar

Esto te tiene que quedar muy claro:

### Detener
Hace que el contenedor deje de correr.

### Eliminar
Borra el contenedor.

Un contenedor detenido sigue existiendo hasta que vos lo elimines.

---

## Cuarto comando del tema: volver a iniciarlo

Como el contenedor sigue existiendo, podés volver a arrancarlo:

```bash
docker start contenedor-lento
```

---

## Qué demuestra esto

Demuestra que un contenedor puede:

- existir
- detenerse
- volver a iniciarse

Siempre que no lo hayas eliminado.

---

## Quinto comando del tema: reiniciar un contenedor

Ahora probá esto:

```bash
docker restart contenedor-lento
```

---

## Qué hace

Hace una secuencia simple:

- detiene el contenedor
- lo vuelve a iniciar

Es útil cuando querés reiniciar rápidamente algo que ya está corriendo o que querés relanzar con la misma configuración.

---

## Sexto comando del tema: eliminar un contenedor

Cuando ya no lo necesites, podés borrarlo con:

```bash
docker rm contenedor-lento
```

---

## Qué tenés que tener en cuenta

En general, para eliminar un contenedor con `docker rm`, el contenedor tiene que estar detenido.

Si sigue corriendo, primero detenelo.

Por ejemplo:

```bash
docker stop contenedor-lento
docker rm contenedor-lento
```

---

## Eliminar el contenedor creado antes

También podés limpiar el otro contenedor del ejemplo:

```bash
docker rm mi-alpine
```

Así vas dejando tu entorno más prolijo.

---

## Resumen mental de los comandos del ciclo de vida

### `docker create`
Crea un contenedor sin iniciarlo.

### `docker start`
Inicia un contenedor existente que está detenido o creado.

### `docker stop`
Detiene un contenedor en ejecución.

### `docker restart`
Reinicia un contenedor.

### `docker rm`
Elimina un contenedor detenido.

---

## Cómo leer el ciclo completo con un ejemplo simple

Podés imaginar este recorrido:

### Paso 1
Creás el contenedor:

```bash
docker create --name ejemplo alpine sleep 300
```

### Paso 2
Lo iniciás:

```bash
docker start ejemplo
```

### Paso 3
Comprobás que está corriendo:

```bash
docker ps
```

### Paso 4
Lo detenés:

```bash
docker stop ejemplo
```

### Paso 5
Lo volvés a iniciar:

```bash
docker start ejemplo
```

### Paso 6
Lo reiniciás:

```bash
docker restart ejemplo
```

### Paso 7
Lo detenés y lo eliminás:

```bash
docker stop ejemplo
docker rm ejemplo
```

Ese recorrido ya te da una base muy buena para manejar contenedores con intención.

---

## Qué no tenés que confundir

### `docker run` no reemplaza el concepto de ciclo de vida
Lo simplifica, pero por detrás sigue habiendo creación e inicio.

### Un contenedor detenido no desaparece
Solo deja de ejecutarse.

### Un contenedor eliminado ya no puede volver a iniciarse
Porque directamente dejó de existir.

---

## Error común 1: creer que stop y rm son lo mismo

No lo son.

- `stop` detiene
- `rm` elimina

Esa diferencia es básica y muy importante.

---

## Error común 2: pensar que si un contenedor aparece en ps -a sigue vivo

No necesariamente.

`docker ps -a` muestra también contenedores detenidos, finalizados o recién creados.

Para ver solo los que están activos, usá:

```bash
docker ps
```

---

## Error común 3: no darle nombre al contenedor

Podés trabajar con IDs, pero al comienzo conviene muchísimo usar nombres.

Por ejemplo:

```bash
--name contenedor-lento
```

Eso hace que todo el flujo sea más fácil de leer y recordar.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá un contenedor sin arrancarlo:

```bash
docker create --name prueba-ciclo alpine echo "Probando ciclo de vida"
```

### Ejercicio 2
Verificá que exista:

```bash
docker ps -a
```

### Ejercicio 3
Inicialo:

```bash
docker start prueba-ciclo
```

### Ejercicio 4
Volvé a mirar el estado:

```bash
docker ps -a
```

### Ejercicio 5
Ahora creá uno que dure más:

```bash
docker run -d --name prueba-lenta alpine sleep 300
```

### Ejercicio 6
Verificá que esté corriendo:

```bash
docker ps
```

### Ejercicio 7
Detenelo:

```bash
docker stop prueba-lenta
```

### Ejercicio 8
Volvé a iniciarlo:

```bash
docker start prueba-lenta
```

### Ejercicio 9
Reinicialo:

```bash
docker restart prueba-lenta
```

### Ejercicio 10
Detenelo y eliminá ambos contenedores:

```bash
docker stop prueba-lenta
docker rm prueba-lenta
docker rm prueba-ciclo
```

---

## Qué tenés que observar mientras practicás

Mientras hacés los ejercicios, prestá atención a estas preguntas:

- ¿cuándo el contenedor existe pero no corre?
- ¿cuándo aparece en `docker ps`?
- ¿cuándo aparece solo en `docker ps -a`?
- ¿qué diferencia viste entre un `echo` y un `sleep 300`?
- ¿en qué momento deja de ser posible reiniciarlo?

Estas observaciones valen mucho más que copiar comandos sin mirar el resultado.

---

## Mini desafío

Explicá con tus palabras este flujo:

1. crear
2. iniciar
3. detener
4. reiniciar
5. eliminar

Y además respondé:

- ¿por qué `docker run` a veces “oculta” parte del ciclo de vida?
- ¿qué ventaja tiene practicar con `docker create` y `docker start` por separado?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar el ciclo de vida básico de un contenedor
- distinguir entre crear e iniciar
- detener y reiniciar contenedores
- eliminar contenedores sin confundirlo con detenerlos
- leer el estado de tus contenedores con más criterio

---

## Resumen del tema

- Un contenedor pasa por estados concretos durante su ciclo de vida.
- `docker create` crea, pero no inicia.
- `docker start` inicia un contenedor existente.
- `docker stop` detiene un contenedor.
- `docker restart` lo detiene y lo vuelve a iniciar.
- `docker rm` elimina un contenedor detenido.
- Entender este flujo te da mucho más control sobre Docker.

---

## Próximo tema

En el próximo tema vas a empezar a observar mejor qué pasa con los contenedores mientras trabajan:

- ver contenedores
- listar activos y detenidos
- mirar información útil
- empezar a inspeccionar el entorno con más criterio
