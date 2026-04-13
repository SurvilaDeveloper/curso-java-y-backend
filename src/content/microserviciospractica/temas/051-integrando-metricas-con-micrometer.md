---
title: "Integrando métricas con Micrometer"
description: "Continuación del bloque de observabilidad en NovaMarket. Incorporación de métricas con Micrometer para empezar a medir comportamiento y no solo estado de los servicios."
order: 51
module: "Módulo 9 · Observabilidad de punta a punta"
level: "intermedio"
draft: false
---

# Integrando métricas con Micrometer

En la clase anterior dimos el primer paso del bloque de observabilidad agregando Actuator a los servicios principales.

Eso ya nos dejó algo muy valioso:

- endpoints de salud,
- información operativa básica,
- y una forma más clara de verificar si los servicios están vivos.

Pero todavía nos falta una pieza esencial para observar un sistema de manera más seria:

**las métricas.**

Porque saber que un servicio está “UP” es útil, pero no alcanza.  
También queremos empezar a responder preguntas como:

- ¿cuántas requests recibe?
- ¿cómo se comportan ciertos flujos?
- ¿qué está pasando con el tiempo de respuesta?
- ¿qué señales numéricas del sistema tenemos disponibles?

La herramienta base que vamos a incorporar para eso es **Micrometer**.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- integrada una base de métricas usando Micrometer,
- expuestas métricas útiles a través de Actuator,
- y listo el terreno para observar mejor comportamiento y no solo estado de los servicios.

No vamos a montar todavía dashboards completos.  
La meta de hoy es más concreta: empezar a medir.

---

## Estado de partida

Partimos de este contexto:

- los servicios principales ya tienen Actuator,
- `health` e `info` ya están disponibles,
- y NovaMarket ya tiene suficiente complejidad como para que empiece a tener mucho sentido hablar de métricas.

Además, en bloques anteriores ya trabajamos cosas como resiliencia, seguridad y gateway, que se benefician muchísimo de tener más señales numéricas visibles.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar la integración básica de Micrometer,
- exponer métricas mediante Actuator,
- consultar métricas disponibles,
- y empezar a pensar el sistema no solo en términos de “está vivo”, sino también de “cómo se está comportando”.

---

## Qué problema resuelve Micrometer

Micrometer funciona como una capa estándar para instrumentar y exponer métricas dentro de aplicaciones Spring.

Eso nos permite empezar a medir cosas como:

- cantidad de requests,
- tiempos,
- estados del sistema,
- y, según el caso, métricas propias o integradas con otros componentes.

Para el curso práctico, esto tiene mucho valor porque nos permite dar un paso intermedio muy útil antes de llegar a observabilidad distribuida más avanzada.

---

## Paso 1 · Revisar si ya tenés métricas disponibles por Actuator

En muchas configuraciones de Spring Boot, al agregar Actuator ya aparece una base de métricas disponible a través de:

```txt
/actuator/metrics
```

Entonces, antes de agregar más cosas, conviene verificar qué ya tenemos.

Por ejemplo, en `order-service`, probá:

```bash
curl http://localhost:8083/actuator/metrics
```

Si ya aparece una lista amplia de métricas, eso significa que la base está bien encaminada.

---

## Paso 2 · Asegurar la exposición de `metrics`

Si todavía no lo hiciste, en la configuración centralizada del servicio conviene exponer explícitamente `metrics`.

Por ejemplo, en:

```txt
novamarket/config-repo/order-service.yml
```

una base razonable podría ser:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
```

Y lo mismo, si querés homogeneizar, también en:

- `catalog-service.yml`
- `inventory-service.yml`
- `api-gateway.yml`

---

## Paso 3 · Reiniciar los servicios si hiciste cambios

Si ajustaste configuración remota o dependencias, reiniciá los servicios correspondientes.

Conviene validar primero en uno o dos servicios, y después extender si querés homogeneidad total en esta etapa.

---

## Paso 4 · Consultar la lista de métricas disponibles

Ahora probá:

```bash
curl http://localhost:8083/actuator/metrics
```

La respuesta debería mostrarte un conjunto de nombres de métricas disponibles.

No hace falta aprenderlas todas.

Lo importante en esta clase es que empieces a reconocer que el servicio ya ofrece señales cuantitativas útiles, no solo un estado binario de “vivo o muerto”.

---

## Paso 5 · Consultar una métrica concreta

Una vez que tenés la lista, elegí una métrica para inspeccionar.

Por ejemplo, alguna relacionada con:

- requests HTTP,
- JVM,
- memoria,
- hilos,
- o el servidor embebido.

La idea es hacer una segunda request del estilo:

```bash
curl http://localhost:8083/actuator/metrics/<nombre-de-metrica>
```

La respuesta debería incluir detalles y valores asociados.

Esto es muy importante porque transforma la idea abstracta de “métricas” en algo concreto y observable.

---

## Paso 6 · Generar tráfico y volver a medir

Ahora viene una de las partes más valiosas de la clase.

Primero consultá una métrica relevante.  
Después generá tráfico real en el sistema.  
Y finalmente volvé a consultar.

Por ejemplo, podés:

1. mirar métricas en `order-service`
2. crear varias órdenes autenticadas
3. volver a consultar las métricas

La idea es observar que ciertas señales cambian cuando el sistema trabaja.

Eso ayuda muchísimo a entender que las métricas no son decorativas: reflejan comportamiento real.

---

## Paso 7 · Probar métricas en el gateway

También conviene mirar qué pasa en `api-gateway`.

Por ejemplo:

```bash
curl http://localhost:8080/actuator/metrics
```

Esto es especialmente útil porque el gateway es el punto de entrada del sistema y, por lo tanto, una excelente pieza para observar el volumen y tipo de tráfico que entra a la arquitectura.

---

## Paso 8 · Probar métricas en `inventory-service`

Ahora probá algo similar en inventario:

```bash
curl http://localhost:8082/actuator/metrics
```

Y después generá algunas órdenes o consultas de inventario y volvé a revisar.

Esto ayuda a conectar una idea importante:

- cuando un flujo del negocio usa una dependencia,
- esa dependencia también deja señales observables.

---

## Paso 9 · Pensar el valor de las métricas en resiliencia

A esta altura del curso, conviene mirar este bloque en relación con el módulo anterior.

En resiliencia nos importaba entender:

- cuándo fallan las llamadas,
- cómo responde el sistema,
- y cómo se comporta el circuit breaker.

Las métricas son una ayuda enorme para ese tipo de lectura, porque permiten complementar:

- logs,
- responses del cliente,
- y estado operativo.

En otras palabras:  
la observabilidad empieza a darle herramientas más serias a la resiliencia.

---

## Paso 10 · Opcional: sumar una métrica propia simple

Si querés enriquecer esta clase un poco más, una opción muy didáctica es agregar una métrica custom sencilla.

Por ejemplo, podrías contar cuántas órdenes se intentan crear o cuántas órdenes exitosas se registran.

No es obligatorio para cerrar la clase, pero sí puede ser muy valioso si querés mostrar que Micrometer no solo expone métricas del framework, sino también métricas del dominio del sistema.

Una aproximación simple sería usar un contador inyectado desde `MeterRegistry` en `order-service`.

---

## Qué estamos logrando con esta clase

Después de esta clase, NovaMarket ya no solo expone salud y estado mínimo.  
También empieza a mostrar señales cuantitativas del comportamiento de sus componentes.

Eso es un cambio muy importante porque la observabilidad madura no se apoya solo en “alive/dead”, sino también en datos medibles.

---

## Qué todavía no estamos haciendo

Todavía no:

- enviamos métricas a una plataforma externa,
- armamos dashboards,
- ni cruzamos trazas distribuidas con métricas.

Todo eso puede venir después.

La meta de hoy es mucho más concreta:

**que los servicios ya expongan métricas útiles y que empecemos a leerlas con intención.**

---

## Errores comunes en esta etapa

### 1. Creer que con `health` ya alcanza
La salud es útil, pero no reemplaza métricas.

### 2. Consultar `/actuator/metrics` sin generar tráfico
Así cuesta ver el valor dinámico de las señales.

### 3. No exponer el endpoint `metrics`
Entonces parece que “Micrometer no está”.

### 4. Querer entender todas las métricas del framework de entrada
Para esta clase, conviene enfocarse en unas pocas y usarlas bien.

### 5. Olvidarse del gateway
Es una de las mejores piezas para observar cómo entra el tráfico al sistema.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, NovaMarket debería exponer métricas utilizables al menos en sus servicios principales, y vos deberías haber podido consultar alguna señal concreta y verla cambiar a medida que generás tráfico.

Eso deja mucho mejor preparado el bloque de observabilidad.

---

## Punto de control

Antes de seguir, verificá que:

- `metrics` está expuesto por Actuator,
- podés consultar la lista de métricas,
- probaste al menos una métrica concreta,
- generaste tráfico y volviste a medir,
- y ya entendés mejor el valor de Micrometer dentro del sistema.

Si eso está bien, ya podemos pasar al siguiente paso importante del módulo: el tracing distribuido.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a integrar **Micrometer Tracing** en NovaMarket.

Ese será el inicio del tramo donde ya no solo medimos servicios aislados, sino que empezamos a seguir el recorrido completo de una request a través de varios componentes.

---

## Cierre

En esta clase integramos y empezamos a usar métricas con Micrometer dentro de NovaMarket.

Con eso, la arquitectura gana una capa nueva de observabilidad: ya no solo sabemos si un servicio está vivo, sino que también empezamos a leer cómo se está comportando.
