---
title: "Levantando Zipkin para NovaMarket"
description: "Continuación del bloque de observabilidad distribuida en NovaMarket. Puesta en marcha de Zipkin como backend de trazas para comenzar a visualizar el recorrido de las requests."
order: 53
module: "Módulo 9 · Observabilidad de punta a punta"
level: "intermedio"
draft: false
---

# Levantando Zipkin para NovaMarket

En la clase anterior integramos **Micrometer Tracing** en los componentes principales del flujo distribuido de NovaMarket.

Eso dejó una base muy importante:

- el gateway,
- `order-service`,
- e `inventory-service`

ya quedaron preparados para participar de un contexto compartido de trazas.

Pero todavía nos falta algo clave para que ese trabajo se vuelva realmente visible:

**un backend de trazas.**

Porque una cosa es que el sistema esté técnicamente preparado para generar trazas.  
Y otra muy distinta es tener un lugar donde esas trazas puedan recibirse, almacenarse y visualizarse.

La pieza que vamos a usar para eso es:

**Zipkin**

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- Zipkin levantado y accesible,
- integrado como componente del entorno local de NovaMarket,
- y listo para recibir trazas desde los servicios del sistema.

Todavía no vamos a cerrar toda la configuración de exportación desde cada servicio.  
Primero queremos que el backend de trazas exista y esté disponible.

---

## Estado de partida

Partimos de este contexto:

- los servicios principales ya tienen Actuator,
- ya tenemos métricas,
- y ya integramos Micrometer Tracing en el flujo distribuido principal.

Pero hoy todavía no existe una pieza concreta donde las trazas puedan terminar y verse.

Eso significa que el sistema ya genera el contexto, pero todavía no tenemos la “pantalla” donde observarlo.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- preparar a Zipkin como parte de la infraestructura local,
- levantarlo de una forma simple y repetible,
- verificar acceso a su interfaz,
- y dejar listo el entorno para que los servicios empiecen a enviar trazas.

---

## Qué problema resuelve Zipkin

Zipkin funciona como backend de trazas distribuidas.

Eso significa que puede recibir información sobre spans y requests que atraviesan varios componentes del sistema, y mostrarnos cosas como:

- qué recorrido hizo una request,
- por qué servicios pasó,
- cuánto tardó cada tramo,
- y cómo se relacionan entre sí las partes del flujo.

Para un sistema como NovaMarket, esto tiene muchísimo valor porque el flujo principal ya pasa por varias piezas:

- gateway
- órdenes
- inventario

Y justo ahí es donde el tracing se vuelve especialmente útil.

---

## Cómo conviene levantar Zipkin en este curso

Para esta etapa del proyecto, una forma muy razonable es levantar Zipkin como contenedor.

Eso encaja muy bien con la forma en que ya venimos pensando piezas de infraestructura como:

- Keycloak
- y más adelante RabbitMQ

Además, para un curso práctico, usar un contenedor deja una experiencia bastante portable y fácil de repetir.

---

## Paso 1 · Preparar una carpeta dentro de `infrastructure/`

Dentro del monorepo, una buena idea es dejar identificado un espacio para Zipkin.

Por ejemplo:

```txt
novamarket/infrastructure/zipkin/
```

No hace falta llenar demasiado esa carpeta todavía, pero sí ayuda bastante a mantener claro que Zipkin es una pieza de infraestructura del proyecto y no un servicio de negocio.

---

## Paso 2 · Elegir un puerto claro para Zipkin

Conviene elegir un puerto visible y libre, sin chocar con lo que ya usamos.

Hasta acá venimos trabajando, por ejemplo, con:

- `8080` gateway
- `8081` catálogo
- `8082` inventario
- `8083` órdenes
- `8084` Keycloak
- `8761` Eureka
- `8888` Config Server

Por eso, para Zipkin conviene usar un puerto claramente separado y fácil de recordar.

Una opción muy común es:

```txt
9411
```

Y además tiene la ventaja de ser un puerto bastante habitual para esta herramienta.

---

## Paso 3 · Levantar el contenedor de Zipkin

Ahora levantá Zipkin con la estrategia que elijas para tu entorno local.

Para esta clase, el objetivo práctico es que:

- el contenedor quede arriba,
- el puerto quede expuesto,
- y la UI sea accesible.

No hace falta todavía integrarlo a Docker Compose ni automatizar todo.  
Primero queremos simplemente tener la pieza viva y lista para recibir tráfico.

---

## Paso 4 · Esperar a que termine de iniciar

Igual que pasa con otras herramientas de infraestructura, conviene darle unos segundos para que complete correctamente su arranque.

No hace falta apurarse a abrir la interfaz de inmediato si el contenedor todavía está terminando de inicializar.

---

## Paso 5 · Verificar acceso a la UI de Zipkin

Ahora abrí en el navegador la URL correspondiente.

Si usaste el puerto habitual, una forma esperable sería:

```txt
http://localhost:9411
```

La idea es confirmar que la interfaz web carga correctamente.

En esta etapa es totalmente normal que todavía no veas trazas reales.  
Lo importante hoy es que la herramienta ya esté arriba y lista.

---

## Paso 6 · Entender qué deberías esperar ver por ahora

En esta clase, Zipkin todavía puede aparecer “vacío”.

Eso está bien.

Todavía no conectamos formalmente la exportación de trazas desde los servicios.  
Lo que estamos haciendo hoy es montar el backend, no poblarlo.

Este paso es importante porque evita una expectativa incorrecta:  
si la UI está accesible pero no hay trazas todavía, eso no significa que algo esté mal.

---

## Paso 7 · Verificar que Zipkin ya forma parte del entorno del proyecto

A partir de esta clase, conviene empezar a pensar Zipkin como una pieza más del ecosistema NovaMarket.

No es un microservicio de negocio, pero sí es parte del entorno técnico junto con:

- Config Server
- Discovery Server
- Keycloak
- y luego otros componentes como RabbitMQ

Ese cambio de mirada ayuda mucho a ordenar mentalmente la arquitectura.

---

## Qué estamos logrando con esta clase

Esta clase no cambia todavía el comportamiento visible del negocio, pero sí agrega algo muy importante:

**un destino real para las trazas distribuidas del sistema.**

Sin esta pieza, el tracing queda a medio camino.  
Con esta pieza, ya empezamos a tener la infraestructura necesaria para observar de verdad el recorrido de las requests.

---

## Qué todavía no hicimos

Todavía no:

- configuramos a los servicios para exportar trazas hacia Zipkin,
- verificamos la propagación completa,
- ni observamos spans del flujo de órdenes en la UI.

Todo eso viene en la próxima clase.

La meta de hoy es más concreta:

**dejar Zipkin arriba y accesible.**

---

## Errores comunes en esta etapa

### 1. Elegir un puerto ya ocupado
Conviene dejar claro y fijo el puerto antes de levantarlo.

### 2. Querer ver trazas inmediatamente
En esta clase todavía no conectamos exportación real desde los servicios.

### 3. No esperar a que el contenedor termine de iniciar
Eso puede hacer creer que la UI “no funciona”.

### 4. No ubicar conceptualmente a Zipkin dentro de `infrastructure/`
Ayuda bastante a mantener ordenada la arquitectura.

### 5. Tratar a Zipkin como una pieza opcional sin valor
En un sistema distribuido, el tracing puede volverse una de las herramientas más valiosas para diagnóstico.

---

## Resultado esperado al terminar la clase

Al terminar esta clase deberías tener:

- Zipkin levantado,
- su interfaz accesible,
- y una base real lista para recibir trazas desde NovaMarket.

Eso deja abierta la puerta para el siguiente paso natural del módulo: conectar los servicios a Zipkin.

---

## Punto de control

Antes de seguir, verificá que:

- Zipkin está levantado,
- podés abrir su interfaz web,
- ya definiste el puerto de trabajo,
- y lo entendés como parte del entorno de infraestructura de NovaMarket.

Si eso está bien, ya podemos pasar a conectar los servicios y empezar a poblar trazas reales.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a configurar a los servicios para exportar trazas hacia Zipkin.

Ese será el momento en que la observabilidad distribuida del sistema empiece a volverse verdaderamente visible.

---

## Cierre

En esta clase levantamos Zipkin y lo dejamos listo como backend de trazas para NovaMarket.

Con eso, la arquitectura suma otra pieza importante de infraestructura y queda preparada para dar un paso muy fuerte en observabilidad: dejar de intuir el recorrido de las requests y empezar a verlo.
