---
title: "Moviendo un primer bloque de variables fuera del compose y ordenando mejor el entorno"
description: "Primer paso práctico del nuevo subtramo del módulo 8. Extracción de un primer bloque de variables del cuerpo principal del compose.yaml para volver más limpio y mantenible el entorno de NovaMarket."
order: 77
module: "Módulo 8 · Docker Compose para NovaMarket"
level: "intermedio"
draft: false
---

# Moviendo un primer bloque de variables fuera del Compose y ordenando mejor el entorno

En la clase anterior dejamos algo bastante claro:

- NovaMarket ya empezó a usar variables de entorno con más sentido,
- esa capa ya tiene suficiente peso como para merecer más orden,
- y seguir amontonando bloques `environment` sin criterio dentro del `compose.yaml` puede volver el entorno bastante más difícil de mantener a medida que el sistema crece.

Ahora toca el paso concreto:

**mover un primer bloque de variables fuera del cuerpo principal del Compose y ordenar mejor el entorno.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- identificado un primer bloque razonable de variables para externalizar mejor,
- mucho más limpio el `compose.yaml`,
- introducida una forma más ordenada de sostener parte de la configuración del entorno,
- y NovaMarket mejor preparado para que la configuración externa crezca sin volver caótica la composición.

La meta de hoy no es diseñar la estrategia final de todos los entornos posibles.  
La meta es mucho más concreta: **hacer el primer recorte serio y útil para que el Compose deje de cargar demasiado ruido de configuración dentro de su cuerpo principal**.

---

## Estado de partida

Partimos de un sistema donde ya:

- el `compose.yaml` describe infraestructura, núcleo, borde, salud y parte de la configuración interna,
- algunas variables ya empezaron a aparecer para expresar mejor URLs y referencias del entorno,
- y además el módulo ya dejó claro que esa capa puede crecer rápido si no la empezamos a ordenar.

Eso significa que el problema ya no es si externalizar algo tiene sentido.  
Ahora la pregunta útil es otra:

- **qué bloque conviene mover primero y cómo hacerlo sin perder claridad**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir un primer bloque razonable de variables del entorno,
- moverlo a una forma más limpia de configuración externa,
- dejar el `compose.yaml` más legible,
- y validar qué nueva claridad gana NovaMarket después de ese cambio.

---

## Qué bloque conviene mover primero

A esta altura del módulo, una muy buena primera candidata suele ser la configuración repetida relacionada con:

- `CONFIG_SERVER_URL`
- `EUREKA_SERVER_URL`

¿Por qué?

Porque:

- ya aparecen en varias piezas del sistema,
- son valores estructurales,
- y además encajan muy bien como bloque coherente.

Eso las vuelve un gran primer recorte para ordenar el entorno sin meterse todavía en demasiadas excepciones.

---

## Paso 1 · Detectar repetición en el `compose.yaml`

Supongamos que el archivo ya tiene algo como esto repetido en varios servicios:

```yaml
environment:
  CONFIG_SERVER_URL: http://config-server:8888
  EUREKA_SERVER_URL: http://discovery-server:8761/eureka
```

Esto ya es mucho mejor que dejar esos valores hardcodeados por todos lados dentro del proyecto.

Pero aun así, a medida que la composición crece, empieza a aparecer un problema:

- el archivo principal acumula ruido,
- el mismo bloque se repite,
- y cualquier cambio exige tocar muchos lugares.

Ese es justamente el tipo de señal que indica que ya conviene ordenar mejor.

---

## Paso 2 · Elegir entre `.env` y `env_file` para este primer recorte

Para esta etapa, una opción muy razonable suele ser `env_file`, porque nos permite:

- asociar a uno o varios servicios un archivo con variables de entorno,
- sin obligarnos todavía a convertir todo en interpolación global del Compose.

Ese matiz importa mucho.

¿Por qué?

Porque hoy queremos ordenar un bloque de variables de servicios, no necesariamente rediseñar toda la semántica del archivo principal.

Ese criterio vuelve a `env_file` una gran primera herramienta práctica.

---

## Paso 3 · Crear un archivo de entorno base

Podés crear algo como:

```txt
docker/common.env
```

o un nombre parecido que deje clara su intención.

Por ejemplo, su contenido podría ser:

```env
CONFIG_SERVER_URL=http://config-server:8888
EUREKA_SERVER_URL=http://discovery-server:8761/eureka
```

Este archivo tiene muchísimo valor porque empieza a concentrar un bloque estructural del entorno en un lugar mucho más claro.

---

## Paso 4 · Reemplazar el bloque repetido por `env_file`

Ahora, en servicios como `catalog-service`, `inventory-service`, `order-service` y `api-gateway`, en vez de repetir las dos variables, podés hacer algo como:

```yaml
catalog-service:
  image: novamarket/catalog-service:dev
  ports:
    - "8081:8081"
  depends_on:
    config-server:
      condition: service_healthy
    discovery-server:
      condition: service_healthy
  env_file:
    - ./docker/common.env
  networks:
    - novamarket-net
```

Y repetir el mismo patrón donde corresponda.

Esto hace que el `compose.yaml` quede bastante más limpio sin perder expresividad.

---

## Paso 5 · Entender qué no estamos ganando todavía

Conviene ser muy precisos.

Con este cambio **no** estamos resolviendo todavía:

- secretos reales,
- múltiples entornos completos,
- ni una jerarquía final de configuración del stack.

Lo que sí estamos logrando es algo mucho más concreto y muy valioso:

- reducir repetición,
- ordenar mejor un bloque estructural,
- y volver mucho más legible el archivo principal.

Ese alcance ya justifica muchísimo la mejora.

---

## Paso 6 · Ver cómo queda el `compose.yaml` después del recorte

Lo importante ahora es mirar el efecto general.

Antes, el archivo podía empezar a verse así:

- más largo
- más repetitivo
- más ruidoso

Después del recorte, debería verse algo más limpio:

- los servicios mantienen su intención principal
- y la configuración repetida ya empieza a vivir fuera del cuerpo principal

Ese cambio visual importa muchísimo porque mejora bastante la mantenibilidad del proyecto.

---

## Paso 7 · Levantar nuevamente la composición

Ahora levantá otra vez el entorno:

```bash
docker compose up
```

o:

```bash
docker compose up -d
```

La idea es confirmar que el sistema sigue funcionando, pero con una organización mejor de la configuración externa.

Ese punto es central, porque deja claro que este orden nuevo no es solo “cosmético”: también es operativo.

---

## Paso 8 · Validar que el sistema sigue respondiendo

Después del cambio, conviene probar de nuevo:

```bash
curl http://localhost:8080/catalog/products
curl http://localhost:8080/inventory/inventory
```

y, si querés, revisar Eureka.

Lo importante es confirmar que:

- la composición sigue sana,
- los servicios siguen encontrando Config Server y Eureka,
- y la nueva organización ya no es solo una idea, sino una mejora real del entorno.

---

## Paso 9 · Entender qué acabamos de ganar

Este punto importa muchísimo.

Hasta ahora, Compose ya describía la red, la salud y parte de la configuración interna del sistema.

Ahora, en cambio, además empieza a describir mejor **cómo se organiza** esa configuración externa.

Eso vuelve al entorno mucho más sostenible a medida que sigue creciendo.

---

## Paso 10 · Entender por qué este paso es pequeño pero muy importante

A primera vista, mover dos variables a un archivo externo puede parecer algo menor.

Pero en realidad es uno de esos cambios que mejoran muchísimo la salud del proyecto a largo plazo porque:

- baja ruido,
- reduce repetición,
- mejora legibilidad,
- y deja un patrón reutilizable para lo que venga después.

Ese valor acumulativo importa muchísimo.

---

## Qué estamos logrando con esta clase

Esta clase mueve un primer bloque de variables fuera del cuerpo principal del Compose y ordena mejor el entorno de NovaMarket.

Ya no estamos solo usando variables de entorno.  
Ahora también estamos empezando a administrarlas de una forma más limpia, más legible y más sostenible.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- consolidamos aún este subbloque con un checkpoint fuerte,
- ni decidimos todavía qué otros bloques del entorno conviene ordenar después.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dar el primer paso real para que la configuración externa del sistema deje de crecer de forma desordenada dentro del `compose.yaml`.**

---

## Errores comunes en esta etapa

### 1. Mover variables a un archivo externo sin criterio
Conviene empezar por bloques coherentes y repetidos.

### 2. Confundir `env_file` con una solución total de configuración
Es una herramienta útil, no la respuesta final a todo.

### 3. Querer mover absolutamente todo de una sola vez
En esta etapa, lo sano es recortar primero un bloque bien entendido.

### 4. No validar que el sistema siga funcionando después del cambio
La verificación sigue siendo parte esencial de la clase.

### 5. Pensar que esto solo mejora estética
En realidad mejora bastante la sostenibilidad del entorno.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- un primer bloque de variables ya salió del cuerpo principal del Compose,
- el archivo quedó más limpio,
- el sistema sigue levantando correctamente,
- y NovaMarket ya dio un primer paso serio hacia una configuración externa mejor organizada.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué bloque conviene externalizar primero,
- ves por qué `env_file` ayuda a limpiar el Compose,
- entendés qué cosas sí mejora este cambio y cuáles todavía quedan abiertas,
- y sentís que el entorno ya dejó de crecer de forma tan improvisada en su capa de variables.

Si eso está bien, ya podemos pasar al siguiente tema y consolidar este nuevo subbloque del módulo 8.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta primera capa de configuración externa más ordenada, leyendo con más claridad qué nueva postura ganó NovaMarket después de empezar a limpiar el `compose.yaml`.

---

## Cierre

En esta clase movimos un primer bloque de variables fuera del Compose y ordenamos mejor el entorno.

Con eso, NovaMarket deja de tratar la configuración externa como una suma improvisada de bloques repetidos dentro del archivo principal y empieza a sostenerla de una forma mucho más clara, mucho más limpia y mucho más alineada con la madurez que ya ganó su entorno multicontenedor.
