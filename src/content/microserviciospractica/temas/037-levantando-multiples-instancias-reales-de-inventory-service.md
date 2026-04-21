---
title: "Levantando múltiples instancias reales de inventory-service"
description: "Primer paso práctico para hacer visible el balanceo en NovaMarket. Ejecución de más de una instancia real de inventory-service manteniendo el mismo nombre lógico y registrándolas en Eureka."
order: 37
module: "Módulo 6 · API Gateway"
level: "intermedio"
draft: false
---

# Levantando múltiples instancias reales de `inventory-service`

En la clase anterior configuramos las primeras rutas reales del gateway con `lb://` y dejamos a NovaMarket con un punto de entrada unificado funcionando por nombres lógicos.

Eso ya tiene muchísimo valor.

Pero todavía hay algo importante que sigue estando medio “invisible”:

**el balanceo real todavía no se nota demasiado si solo existe una instancia por servicio.**

Por eso, ahora toca hacer el paso que vuelve este bloque completamente tangible:

**levantar múltiples instancias reales de `inventory-service`.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- más de una instancia de `inventory-service` corriendo al mismo tiempo,
- ambas registradas en Eureka bajo el mismo nombre lógico,
- el gateway listo para poder repartir tráfico entre ellas,
- y el entorno preparado para comprobar que Load Balancer no es solo una idea, sino algo visible dentro de NovaMarket.

Todavía no vamos a concentrarnos en el reparto de requests.  
La meta de hoy es dejar armado el escenario correcto para que ese reparto exista de verdad.

---

## Estado de partida

En este punto ya tenemos:

- `config-server`
- `discovery-server`
- `catalog-service`
- `inventory-service`
- `order-service`
- `api-gateway`

Además:

- `api-gateway` ya enruta con `lb://`,
- `inventory-service` ya se registra en Eureka,
- y el sistema ya funciona con una sola instancia de inventario.

Eso significa que el siguiente paso natural es dejar de pensar `inventory-service` como “una app en un puerto” y empezar a verlo como **un servicio lógico con más de una instancia real**.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué significa ejecutar dos instancias del mismo servicio,
- ajustar lo mínimo necesario para que no choquen entre sí,
- registrar ambas en Eureka,
- y dejar preparado el entorno para que el gateway pueda repartir requests en la próxima clase.

---

## Qué problema queremos resolver exactamente

Hasta ahora, el gateway ya enruta así:

```txt
lb://inventory-service
```

Eso está perfecto conceptualmente.

Pero mientras solo exista una única instancia de `inventory-service`, el balanceo todavía no se puede observar con claridad.

Para que el tema quede completo, necesitamos un escenario como este:

- instancia 1 de `inventory-service`
- instancia 2 de `inventory-service`
- ambas registradas en Eureka
- y el gateway apuntando al mismo nombre lógico

Recién ahí el sistema puede empezar a “elegir” realmente entre varias opciones.

---

## Qué significa correr múltiples instancias del mismo servicio

Este punto es importante.

Levantar dos instancias del mismo servicio **no significa** copiar el proyecto con otro nombre.

Significa algo mucho más preciso:

- el servicio sigue llamándose `inventory-service`,
- mantiene el mismo contrato HTTP,
- mantiene el mismo rol dentro de la arquitectura,
- pero ahora existe más de una instancia física ejecutándose al mismo tiempo.

O sea:

### Nombre lógico
```txt
inventory-service
```

### Instancias físicas
- instancia A
- instancia B

Esa diferencia entre servicio lógico e instancia real es uno de los puntos más importantes de todo el bloque.

---

## Qué condiciones tienen que cumplirse para que esto funcione

Para poder correr dos instancias del mismo servicio sin problemas, necesitamos al menos estas condiciones:

### 1. Mismo `spring.application.name`
Las dos instancias deben registrarse como:

```txt
inventory-service
```

### 2. Puertos distintos
No pueden intentar escuchar en el mismo puerto.

### 3. Registro correcto en Eureka
Las dos tienen que aparecer como instancias activas del mismo servicio lógico.

### 4. Una forma razonable de distinguirlas
Aunque ambas pertenezcan al mismo servicio, conviene poder diferenciarlas por:

- puerto,
- instance id,
- o logs visibles.

Esto va a ser muy importante en la próxima clase.

---

## Paso 1 · Revisar la configuración actual de `inventory-service`

Como `inventory-service` ya consume configuración centralizada, conviene recordar que en:

```txt
config-repo/inventory-service.yml
```

probablemente hoy exista algo como:

```yaml
spring:
  application:
    name: inventory-service

server:
  port: 8082
```

Eso está bien para una sola instancia, pero para correr dos al mismo tiempo necesitamos una forma de sobrescribir el puerto al arrancar una de ellas.

Y eso está perfecto: no hace falta romper la configuración centralizada.  
Solo necesitamos permitir que una instancia concreta use otro puerto en tiempo de ejecución.

---

## Paso 2 · Mantener el mismo nombre lógico

Esto es fundamental.

No queremos crear algo como:

- `inventory-service-2`

porque eso sería **otro servicio lógico**, no una segunda instancia del mismo.

Lo correcto es que las dos instancias mantengan:

```yaml
spring:
  application:
    name: inventory-service
```

Así Eureka las agrupa bajo la misma aplicación.

---

## Paso 3 · Arrancar la primera instancia normalmente

Primero levantá una instancia de `inventory-service` de la forma habitual.

Por ejemplo, si el puerto configurado por defecto sigue siendo `8082`, esa instancia puede quedarse con ese valor.

La idea es que esta sea nuestra primera referencia estable.

---

## Paso 4 · Arrancar una segunda instancia con otro puerto

Ahora levantá una segunda instancia del mismo servicio, pero sobrescribiendo el puerto.

Por ejemplo, podrías usar algo como:

```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments="--server.port=8084"
```

O una variante equivalente desde el IDE, definiendo un segundo run configuration con otro puerto.

Lo importante es esto:

- mismo servicio lógico
- distinto puerto
- misma aplicación
- segundo proceso vivo

Si querés, incluso podrías usar `8085` en vez de `8084`.  
Lo importante es evitar el choque con la primera instancia.

---

## Paso 5 · Entender por qué este override no rompe la arquitectura

Este punto vale mucho la pena.

Sobrescribir el puerto en tiempo de ejecución **no rompe** la idea de configuración centralizada.

Simplemente estamos ajustando un detalle de instancia concreta para poder construir un escenario de escalado local.

En un entorno más avanzado, esto podría resolverse con:

- perfiles,
- variables de entorno,
- orquestación,
- o despliegues replicados.

Pero para esta etapa del curso práctico, el override de puerto es totalmente razonable y muy didáctico.

---

## Paso 6 · Revisar Eureka

Una vez levantadas las dos instancias, entrá a:

```txt
http://localhost:8761
```

Y revisá la entrada correspondiente a:

```txt
INVENTORY-SERVICE
```

Si todo salió bien, deberías ver que ahora existe más de una instancia registrada bajo ese mismo nombre lógico.

Ese es el momento más importante de toda la clase.

Porque ahí NovaMarket deja de tener:

- “un servicio por nombre”

y pasa a tener:

- “un nombre lógico que representa varias instancias”

Eso cambia muchísimo la lectura de la arquitectura.

---

## Paso 7 · Verificar que las instancias se distinguen correctamente

Conviene mirar cómo las muestra Eureka.

Según tu configuración, probablemente las instancias se distingan por alguna combinación de:

- hostname
- puerto
- id interno
- o instance id

Lo importante no es el formato exacto, sino confirmar que:

- no colisionan,
- ambas aparecen vivas,
- y Eureka las reconoce como dos instancias distintas del mismo servicio.

---

## Paso 8 · Entender qué pasa con la base de datos en esta etapa

Este punto es importante porque estamos trabajando localmente.

Como `inventory-service` viene usando H2 en memoria, si levantás dos instancias completamente separadas, cada una puede terminar con su propia base en memoria y sus propios datos cargados al arranque.

Para esta etapa del curso, eso **no es un problema**.

¿Por qué?

Porque lo que queremos mostrar ahora no es consistencia de datos distribuida, sino **balanceo entre instancias reales**.

Más adelante, si el curso avanzara mucho en despliegue, este tema podría requerir una base compartida o una estrategia distinta.  
Pero hoy no es la prioridad.

---

## Paso 9 · Confirmar que ambas instancias siguen funcionando

Antes de pasar al gateway, conviene verificar que cada instancia de `inventory-service` responde correctamente si la consultás por su puerto directo.

Por ejemplo:

```bash
curl http://localhost:8082/inventory
curl http://localhost:8084/inventory
```

La idea es confirmar que:

- ambas están vivas,
- ambas responden,
- y ambas están listas para ser consumidas desde el gateway.

Esto te evita mezclar problemas de arranque con problemas de balanceo.

---

## Paso 10 · Entender qué habilita esta clase

Una vez que hay dos instancias reales del mismo servicio registradas en Eureka, el escenario cambia por completo.

Ahora sí tiene sentido esperar que:

- `api-gateway`
- usando `lb://inventory-service`
- pueda repartir requests entre más de una instancia real

Ese es el puente perfecto hacia la próxima clase.

---

## Qué estamos logrando con esta clase

Esta clase convierte a Load Balancer en algo observable dentro de NovaMarket.

Hasta ahora era una necesidad arquitectónica correcta.  
Ahora además ya tiene el entorno real que necesita para poder mostrarse en acción.

Eso le da muchísimo valor al bloque rehecho.

---

## Qué todavía no hicimos

Todavía no vamos a:

- mandar varias requests desde el gateway para observar reparto,
- confirmar qué instancia respondió cada vez,
- ni mirar logs para verificar el balanceo real.

Todo eso viene enseguida.

La meta de hoy es mucho más concreta:

**dejar múltiples instancias reales de `inventory-service` vivas y registradas bajo el mismo nombre lógico.**

---

## Errores comunes en esta etapa

### 1. Cambiar el nombre lógico de la segunda instancia
Eso crea otro servicio distinto y rompe el objetivo de la clase.

### 2. Intentar levantar las dos en el mismo puerto
La segunda no va a poder arrancar.

### 3. Pensar que dos instancias implican dos servicios distintos
No. Son dos procesos del mismo servicio lógico.

### 4. No revisar Eureka después del arranque
Sin esa verificación, el bloque pierde gran parte de su valor didáctico.

### 5. Querer probar balanceo sin confirmar primero que ambas responden individualmente
Conviene validar el entorno paso a paso.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener:

- una instancia de `inventory-service` en un puerto, por ejemplo `8082`,
- otra instancia del mismo servicio en otro puerto, por ejemplo `8084`,
- ambas registradas en Eureka como `INVENTORY-SERVICE`,
- y el entorno listo para observar balanceo real desde el gateway.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- las dos instancias usan el mismo `spring.application.name`,
- corren en puertos distintos,
- ambas aparecen en Eureka,
- y ambas responden correctamente si las consultás por separado.

Si eso está bien, ya podemos pasar al siguiente tema y comprobar cómo el gateway empieza a repartir tráfico entre ellas.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a mandar varias requests hacia inventario entrando por `api-gateway` y a comprobar si el tráfico empieza a repartirse entre las distintas instancias registradas.

---

## Cierre

En esta clase levantamos múltiples instancias reales de `inventory-service`.

Con eso, NovaMarket deja de preparar Load Balancer solo desde la teoría y pasa a tener el escenario real que necesita para observar cómo una arquitectura basada en nombres lógicos puede repartir tráfico entre más de una instancia concreta del mismo servicio.
