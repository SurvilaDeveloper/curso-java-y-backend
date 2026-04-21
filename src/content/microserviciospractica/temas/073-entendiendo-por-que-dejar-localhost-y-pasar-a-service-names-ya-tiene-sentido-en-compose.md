---
title: "Entendiendo por qué dejar localhost y pasar a service names ya tiene sentido en Compose"
description: "Inicio del siguiente subtramo del módulo 8. Comprensión de por qué, después de tener una composición fuerte, ya conviene dejar de pensar la configuración interna con localhost y pasar a nombres de servicio dentro de la red Compose."
order: 73
module: "Módulo 8 · Docker Compose para NovaMarket"
level: "intermedio"
draft: false
---

# Entendiendo por qué dejar `localhost` y pasar a service names ya tiene sentido en Compose

En la clase anterior cerramos una etapa bastante importante dentro del bloque de Compose:

- la composición ya tenía infraestructura, núcleo y borde,
- además ya contaba con una primera capa de healthchecks,
- y el entorno ya empezaba a coordinar mejor salud y arranque de sus piezas base.

Eso ya tiene muchísimo valor.

Pero ahora aparece otra pregunta muy natural:

**si el sistema ya vive bastante dentro de Compose, cuándo empieza a tener sentido dejar de pensar sus referencias internas con `localhost` y pasar a nombres de servicio dentro de la red Docker?**

Ese es el terreno de esta clase.

Porque una cosa es que los puertos publicados funcionen desde la máquina host.

Y otra bastante distinta es cómo se encuentran entre sí los contenedores **dentro** del entorno Compose.

Ese es exactamente el siguiente tipo de problema que conviene abrir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- claro por qué `localhost` deja de ser una buena referencia interna dentro de un entorno Compose serio,
- entendida la diferencia entre acceso desde el host y comunicación entre contenedores,
- alineado el modelo mental para empezar a usar nombres de servicio dentro de la red,
- y preparado el terreno para aplicar una primera mejora concreta de configuración en la próxima clase.

Todavía no vamos a reescribir toda la configuración del proyecto.  
La meta de hoy es entender por qué este nuevo frente aparece exactamente ahora.

---

## Estado de partida

Partimos de un sistema donde ya:

- el `compose.yaml` describe una porción muy seria de NovaMarket,
- la red `novamarket-net` ya sostiene infraestructura, negocio y borde,
- y además el módulo ya dejó claro que el entorno ya no puede seguir pensándose como una simple suma de procesos locales.

Eso significa que el problema ya no es solo:

- “cómo levantar contenedores”
- o
- “cómo ordenar su arranque”

Ahora empieza a importar otra pregunta:

- **cómo se nombran y se encuentran correctamente las piezas dentro del entorno Compose**

Y esa pregunta cambia bastante el nivel del módulo.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar por qué `localhost` deja de ser una referencia sana dentro de la red Compose,
- entender qué rol juegan los nombres de servicio,
- conectar esta idea con el estado actual de NovaMarket,
- y dejar clara la lógica del siguiente subtramo del módulo.

---

## Qué problema queremos resolver exactamente

Hasta ahora, muchas configuraciones del proyecto podían tener sentido en un mundo muy local, por ejemplo:

- cuando todo corría en la misma máquina,
- o cuando cada proceso resolvía al resto desde la perspectiva del host.

Eso estuvo bien durante bastante tiempo.

Pero a medida que Compose madura, aparece una necesidad muy concreta:

**que la configuración interna del sistema deje de apoyarse tanto en `localhost` y empiece a usar referencias coherentes con la red real donde ahora viven los contenedores.**

Porque ahora conviene hacerse preguntas como:

- si `api-gateway` corre dentro de un contenedor, ¿qué significa `localhost` para él?
- si `discovery-server` está en otro contenedor, ¿por qué una URL con `localhost` podría dejar de tener sentido?
- si Compose ya nos da nombres de servicio, ¿por qué seguir pensando el sistema como si todo fuera un único host local?

Ese cambio de enfoque es justamente el corazón de esta etapa.

---

## Qué significa `localhost` dentro de un contenedor

Este punto importa muchísimo.

Dentro de un contenedor, `localhost` no significa “mi máquina entera”.  
Significa básicamente:

- “este mismo contenedor”

Y esa diferencia, que al principio parece sutil, cambia muchísimo la forma correcta de configurar una arquitectura multicontenedor.

Porque si `api-gateway` dentro de su contenedor intenta resolver algo como:

```txt
http://localhost:8761
```

eso ya no significa “voy al discovery real del sistema”.  
Significa “voy a buscar ese puerto dentro de mí mismo”.

Y esa es justamente una de las razones por las que este subbloque ya tiene tanto sentido.

---

## Qué aporta usar nombres de servicio

Docker Compose nos da algo muy valioso:

- cada servicio del archivo ya tiene un nombre lógico dentro de la red compartida.

Eso significa que dentro de la red `novamarket-net`, piezas como:

- `config-server`
- `discovery-server`
- `catalog-service`
- `inventory-service`
- `order-service`
- `api-gateway`

pueden empezar a encontrarse por esos nombres, no por referencias a `localhost`.

Ese cambio vuelve a la composición mucho más coherente con la realidad del entorno.

---

## Qué gana NovaMarket con este cambio

Aunque todavía no apliquemos toda la mejora, el valor ya se puede ver con claridad.

A partir de usar nombres de servicio y no `localhost`, NovaMarket puede ganar cosas como:

- configuración más coherente con Compose,
- menos sorpresas al mover piezas fuera del host local,
- y una forma mucho más sana de pensar la red real del sistema.

Eso vuelve al proyecto bastante más serio desde el punto de vista operativo.

---

## Por qué conviene abrir este frente recién ahora

Esto también importa mucho.

Si todavía no hubiéramos llegado a una composición bastante seria, este tema se sentiría prematuro.

¿Por qué?

Porque primero convenía que:

- el sistema ya viviera dentro de una red compartida real,
- Compose ya sostuviera infraestructura, negocio y borde,
- y el proyecto ya dejara de parecer una suma de procesos locales.

Ahora que esa base ya existe, sí tiene muchísimo más sentido decir:

- **dejemos de pensar la configuración interna como si todo corriera desde el mismo host local**

Ese orden es muy sano.

---

## Qué todavía no estamos haciendo en esta etapa

Conviene dejar esto muy claro.

En este punto todavía no estamos:

- reescribiendo toda la configuración del proyecto,
- ni estandarizando todavía todas las variables de entorno,
- ni cerrando toda la historia de externalización del Compose.

La meta actual es mucho más concreta:

**abrir correctamente el bloque de service names y configuración interna coherente con la red Docker.**

Y eso ya aporta muchísimo valor.

---

## Qué estamos logrando con esta clase

Esta clase no cambia todavía archivos concretos del sistema, pero hace algo muy importante:

**abre explícitamente el siguiente frente lógico del módulo 8: dejar de pensar el entorno multicontenedor como si siguiera siendo un único host local.**

Eso importa muchísimo, porque NovaMarket deja de madurar solo desde Compose, healthchecks y dependencias y empieza a prepararse para otra mejora clave: que sus referencias internas sean realmente coherentes con la red donde vive el sistema.

---

## Qué todavía no hicimos

Todavía no:

- movimos todavía configuraciones concretas de `localhost` a nombres de servicio,
- ni empezamos a apoyarnos de verdad en variables de entorno para dejar esa transición más limpia.

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender por qué dejar `localhost` y pasar a service names ya tiene sentido dentro del Compose de NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Pensar que `localhost` siempre significa “la máquina donde corre todo”
Dentro de un contenedor, significa el mismo contenedor.

### 2. Confundir acceso desde el host con comunicación entre servicios
Son dos planos distintos y conviene separarlos bien.

### 3. No ver el valor de los nombres de servicio que ya nos da Compose
Es una de las mejores partes del entorno.

### 4. Abrir este frente demasiado pronto
Antes de una composición seria, este tema habría quedado prematuro.

### 5. Querer cambiar toda la configuración de una sola vez
En esta etapa, lo sano es empezar por piezas concretas y bien entendidas.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener claro por qué NovaMarket ya está listo para dejar de pensar parte de su configuración interna con `localhost` y por qué usar nombres de servicio aparece ahora como siguiente evolución natural del bloque Compose.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué significa realmente `localhost` dentro de un contenedor,
- ves por qué Compose ya ofrece una forma mejor de nombrar piezas del sistema,
- entendés que el cambio afecta la configuración interna y no necesariamente los puertos publicados al host,
- y sentís que el módulo ya está listo para una primera mejora concreta de este tipo.

Si eso está bien, ya podemos pasar a aplicarla dentro de NovaMarket.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a reemplazar las primeras referencias críticas basadas en `localhost` por nombres de servicio y variables de entorno, para volver más coherente la configuración interna de NovaMarket dentro de Compose.

---

## Cierre

En esta clase entendimos por qué dejar `localhost` y pasar a service names ya tiene sentido en Compose.

Con eso, NovaMarket deja de pensar su entorno multicontenedor como si siguiera corriendo dentro de un único host local y empieza a prepararse para otra mejora muy valiosa: que sus piezas se encuentren y se configuren de una forma mucho más coherente con la red real donde viven.
