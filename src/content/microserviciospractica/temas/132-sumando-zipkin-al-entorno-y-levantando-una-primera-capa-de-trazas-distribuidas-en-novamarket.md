---
title: "Sumando Zipkin al entorno y levantando una primera capa de trazas distribuidas en NovaMarket"
description: "Primer paso práctico del siguiente subtramo del módulo 12. Incorporación de Zipkin al entorno de NovaMarket para empezar a observar trazas distribuidas reales entre gateway y servicios."
order: 132
module: "Módulo 12 · Observabilidad"
level: "intermedio"
draft: false
---

# Sumando Zipkin al entorno y levantando una primera capa de trazas distribuidas en NovaMarket

En la clase anterior dejamos algo bastante claro:

- correlation id y logs correlacionados ya mejoraron mucho la lectura del sistema,
- pero todavía seguimos reconstruyendo bastante del recorrido a mano,
- y el siguiente paso lógico ya no es solo mejorar mensajes, sino empezar a levantar una forma más rica de trazabilidad distribuida.

Ahora toca el paso concreto:

**sumar Zipkin al entorno y levantar una primera capa de trazas distribuidas en NovaMarket.**

Ese es el objetivo de esta clase.

Porque una cosa es poder unir logs.

Y otra bastante distinta es poder ver:

- qué servicio llamó a cuál,
- cuánto tardó cada tramo,
- y cómo se armó la cadena completa de una operación distribuida.

Ese es exactamente el primer gran valor práctico que vamos a construir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- incorporado Zipkin al entorno de NovaMarket,
- mucho más clara la relación entre services, gateway y trazas distribuidas,
- visible una primera base para emitir trazas reales,
- y el proyecto mejor preparado para seguir profundizando observabilidad después.

La meta de hoy no es todavía exprimir toda la riqueza del tracing distribuido.  
La meta es mucho más concreta: **hacer que NovaMarket pase de correlación básica a una primera infraestructura real de trazabilidad distribuida**.

---

## Estado de partida

Partimos de un sistema donde ya:

- existen varios servicios reales,
- existe `api-gateway`,
- ya tenemos correlation id y logs correlacionados,
- y el módulo ya dejó claro que ahora conviene empezar a observar mejor los recorridos distribuidos del sistema.

Eso significa que el problema ya no es si observabilidad hace falta.  
Ahora la pregunta útil es otra:

- **cómo empezamos a levantar una infraestructura real que reciba y permita leer trazas distribuidas**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- sumar Zipkin al entorno,
- darle un lugar claro dentro de Compose,
- preparar a NovaMarket para emitir trazas hacia esa infraestructura,
- y validar que el sistema ya cuenta con una primera base real para observabilidad distribuida más rica.

---

## Paso 1 · Entender qué lugar ocupa Zipkin

A esta altura del curso, conviene pensarlo así:

- Zipkin no reemplaza al gateway
- no reemplaza a logs
- y no reemplaza a los servicios

Zipkin entra como:

- infraestructura de observabilidad,
- vecina del resto del stack,
- y receptora de información de trazas emitidas por distintas piezas del sistema.

Ese matiz importa muchísimo para ubicar bien la pieza dentro del proyecto.

---

## Paso 2 · Sumarlos a Compose

Una incorporación inicial razonable al entorno puede verse conceptualmente así:

```yaml
services:
  zipkin:
    image: openzipkin/zipkin:latest
    ports:
      - "9411:9411"
    networks:
      - novamarket-net
```

No hace falta todavía abrir demasiadas variantes de configuración.

La idea central es mucho más simple:

- darle a NovaMarket una primera pieza real de infraestructura para recibir y visualizar trazas.

Ese paso ya tiene muchísimo valor.

---

## Paso 3 · Entender por qué este paso importa tanto

Este punto vale muchísimo.

Hasta ahora, el bloque de observabilidad ya hablaba de recorridos distribuidos más ricos.

Pero todavía no había una pieza concreta del entorno donde eso pudiera vivir.

Ahora, en cambio, Zipkin le da al sistema:

- un lugar donde recolectar trazas,
- una pieza concreta del stack,
- y una base real para pasar del discurso a la observación efectiva.

Ese salto es uno de los más importantes de toda la clase.

---

## Paso 4 · Pensar qué piezas del sistema van a dialogar con Zipkin

A esta altura del bloque, las candidatas más naturales siguen siendo:

- `api-gateway`
- `order-service`
- `inventory-service`

¿Por qué?

Porque ya participan del mismo flujo distribuido que venimos usando como laboratorio.

Eso vuelve muy coherente que el primer subtramo de trazabilidad más rica se apoye exactamente sobre las piezas que ya venimos observando.

---

## Paso 5 · Preparar la emisión de trazas

No hace falta todavía mostrar todas las dependencias finales de cada servicio en esta clase, pero sí conviene dejar clara la idea:

- gateway y servicios necesitan estar listos para emitir spans o trazas hacia Zipkin

La meta de hoy es más concreta:

- que la infraestructura ya exista
- y que el sistema quede conceptualmente listo para empezar a usarla en la siguiente clase

Ese criterio es muy sano.

---

## Paso 6 · Levantar el entorno actualizado

Ahora levantá otra vez el stack con Zipkin incluido.

La idea es que NovaMarket ya no solo tenga:

- infraestructura,
- seguridad,
- resiliencia

sino también una primera pieza real de observabilidad distribuida más rica.

Ese es uno de los momentos más importantes de la clase.

---

## Paso 7 · Verificar que Zipkin esté vivo

Ahora probá entrar a algo como:

```txt
http://localhost:9411
```

Lo importante es confirmar que:

- Zipkin arranca,
- responde,
- y ya forma parte visible del entorno del sistema.

No hace falta todavía tener trazas completas en pantalla.  
La meta de hoy es mucho más concreta: validar la presencia real de esta nueva pieza.

---

## Paso 8 · Entender qué acabamos de ganar

Este punto importa muchísimo.

Hasta ahora, observabilidad más rica era una intención lógica del roadmap.

Ahora, en cambio, ya existe:

- una pieza concreta,
- viva,
- accesible,
- y sostenida por el mismo entorno donde viven gateway y servicios.

Eso cambia muchísimo la madurez del bloque, porque la trazabilidad distribuida deja de ser solo una idea futura y pasa a ser infraestructura real del sistema.

---

## Paso 9 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya tiene trazabilidad distribuida completa funcionando”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene la primera infraestructura real de trazas distribuidas integrada al entorno.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase suma Zipkin al entorno y levanta una primera capa real de trazabilidad distribuida en NovaMarket.

Ya no estamos solo hablando de observabilidad más rica.  
Ahora también estamos haciendo que la pieza que la va a sostener viva dentro del mismo entorno integrado del sistema.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- emitimos todavía trazas completas desde gateway y servicios,
- ni validamos aún recorridos distribuidos reales dentro de Zipkin.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dar el primer paso real para que la trazabilidad distribuida tenga infraestructura concreta dentro de NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Pensar que levantar Zipkin ya equivale a tener tracing completo
No. Este es solo el primer paso de infraestructura.

### 2. Tratar a Zipkin como si fuera un servicio más del negocio
No pertenece al dominio; pertenece a la infraestructura de observabilidad.

### 3. Querer resolver spans, exporters y visualización en la misma clase
Conviene ir bloque por bloque.

### 4. No validar que la pieza realmente arranca y responde
La verificación sigue siendo parte esencial de la clase.

### 5. No ver el cambio de escala del proyecto después de esta incorporación
Ahora el entorno ya sostiene también trazabilidad distribuida como infraestructura real.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- Zipkin ya forma parte del Compose,
- arranca correctamente,
- vive junto al resto de la arquitectura,
- y NovaMarket ya dio un primer paso serio hacia observabilidad distribuida más rica.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- Zipkin está agregado al entorno,
- el sistema actualizado levanta correctamente,
- la interfaz responde,
- y sentís que la trazabilidad distribuida ya dejó de ser una idea futura para convertirse en una pieza real del sistema.

Si eso está bien, ya podemos pasar al siguiente tema y empezar a emitir trazas reales desde gateway y servicios.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta incorporación inicial de Zipkin y a empezar a ver cómo gateway y servicios emiten una primera capa de trazas reales dentro de NovaMarket.

---

## Cierre

En esta clase sumamos Zipkin al entorno y levantamos una primera capa de trazas distribuidas en NovaMarket.

Con eso, el proyecto deja de preparar la observabilidad solo desde ids y logs correlacionados y empieza a sostenerla también con una pieza mucho más rica, mucho más visual y mucho más alineada con una arquitectura real de microservicios.
