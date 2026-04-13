---
title: "Verificando resiliencia con Actuator"
description: "Checkpoint práctico del bloque de resiliencia. Uso de Actuator para observar el comportamiento de retry y circuit breaker en NovaMarket."
order: 49
module: "Módulo 8 · Resiliencia aplicada"
level: "intermedio"
draft: false
---

# Verificando resiliencia con Actuator

En las últimas clases construimos un bloque de resiliencia bastante importante dentro de NovaMarket:

- simulamos fallas reales en `inventory-service`,
- agregamos timeout,
- mejoramos el manejo del error,
- integramos Resilience4j,
- incorporamos retry,
- y trabajamos explícitamente con circuit breaker.

Eso ya nos dejó una arquitectura bastante más robusta.

Pero todavía falta una parte muy importante para cerrar bien este módulo:

**observar mejor lo que está pasando.**

Porque una cosa es configurar resiliencia.  
Y otra muy distinta es poder verificar, diagnosticar y entender el estado real de esos mecanismos.

Ese es el rol de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- `order-service` expone información útil vía Actuator,
- podemos observar mejor el estado de resiliencia,
- y el comportamiento del retry y del circuit breaker deja de ser una “caja negra”.

No buscamos todavía una observabilidad perfecta de producción.  
Queremos una base muy útil para el curso práctico.

---

## Estado de partida

En este punto del curso:

- `order-service` ya tiene resiliencia aplicada,
- el flujo principal depende de `inventory-service`,
- y ya probamos caídas, retries y apertura del circuit breaker.

Pero gran parte de ese aprendizaje todavía se apoyó en:

- la respuesta visible al cliente,
- y los logs.

Ahora vamos a sumar otra herramienta muy importante: **Actuator**.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar la configuración de Actuator en `order-service`,
- exponer endpoints útiles,
- consultar información del sistema,
- y usar esos datos para entender mejor el estado actual del bloque de resiliencia.

---

## Qué valor aporta Actuator en este contexto

Actuator ayuda muchísimo porque expone información operativa de los servicios.

En este bloque nos interesa especialmente porque nos puede servir para:

- ver el estado de ciertos componentes,
- confirmar que el servicio está vivo,
- y, según la configuración, observar aspectos útiles del comportamiento de resiliencia.

Aunque más adelante el curso también va a trabajar con métricas, tracing y observabilidad más rica, Actuator ya nos da una base muy potente para diagnosticar.

---

## Paso 1 · Verificar dependencias de Actuator en `order-service`

Primero asegurate de que `order-service` ya tenga la dependencia de:

- **Spring Boot Actuator**

Si en el proyecto ya estaba agregada desde antes, perfecto.  
Si no, este es el momento de incorporarla.

La idea es que el servicio exponga endpoints operativos útiles para el resto de la clase.

---

## Paso 2 · Configurar endpoints expuestos en `order-service.yml`

Como `order-service` ya consume configuración centralizada, conviene revisar o agregar en:

```txt
novamarket/config-repo/order-service.yml
```

un bloque razonable de exposición de endpoints.

Una base conceptual podría ser:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
```

Si querés hacer la clase más rica, también podés evaluar exponer endpoints adicionales relacionados con resiliencia, siempre que el stack y las integraciones lo soporten claramente en tu proyecto.

Para esta etapa del curso, con `health`, `info` y `metrics` ya tenemos una base bastante útil.

---

## Paso 3 · Reiniciar `order-service`

Después de ajustar Actuator, reiniciá `order-service`.

Queremos asegurarnos de que:

- levanta correctamente,
- sigue funcionando el flujo principal,
- y además ya expone endpoints de Actuator.

Conviene tener también arriba:

- `config-server`
- `discovery-server`
- `api-gateway`
- Keycloak
- `inventory-service` al menos para las primeras pruebas

---

## Paso 4 · Probar el endpoint de health

Empecemos por lo más básico.

Probá algo como:

```bash
curl http://localhost:8083/actuator/health
```

La idea es confirmar que:

- el servicio expone Actuator,
- responde correctamente,
- y el entorno operativo básico ya es accesible.

Este punto es simple, pero es una gran base para el resto del diagnóstico.

---

## Paso 5 · Probar el endpoint de metrics

Ahora probá:

```bash
curl http://localhost:8083/actuator/metrics
```

La respuesta debería mostrarte una lista de métricas disponibles.

No hace falta memorizar todo lo que aparece.  
Lo importante es entender que el servicio ya tiene una superficie operativa mucho más útil para observación.

---

## Paso 6 · Buscar señales relacionadas con resiliencia

Dependiendo de cómo esté integrado tu stack de Resilience4j y Actuator, puede haber métricas o señales observables relacionadas con:

- circuit breaker,
- retry,
- o comportamiento de llamadas.

Incluso si la visibilidad todavía no es súper refinada, esta clase sirve para empezar a acostumbrarse a una idea muy importante:

**la resiliencia no se configura solo para que “ande”; también se necesita observar.**

---

## Paso 7 · Probar el sistema en estado sano

Antes de volver a fallar el sistema, conviene consultar los endpoints operativos con inventario funcionando.

La idea es tener una fotografía base de un estado saludable.

También podés ejecutar una orden válida autenticada y luego volver a revisar métricas o health, para ver el sistema en comportamiento normal antes de romperlo nuevamente.

---

## Paso 8 · Apagar o degradar `inventory-service` otra vez

Ahora repetí la estrategia de las clases anteriores:

- apagá `inventory-service`,
- o generá una falla equivalente,
- y ejecutá varias requests autenticadas hacia `/orders`.

La idea no es solo ver fallar el request, sino luego volver a Actuator y observar si el estado operativo del servicio consumidor deja pistas útiles del comportamiento de resiliencia.

---

## Paso 9 · Revisar de nuevo health y metrics

Después de las fallas, volvé a consultar:

```bash
curl http://localhost:8083/actuator/health
curl http://localhost:8083/actuator/metrics
```

La meta de esta clase no es que todos los datos sean perfectos o profundos, sino que empieces a trabajar con una pregunta muy importante:

**¿qué puedo observar del comportamiento resiliente del servicio desde afuera?**

Ese cambio de enfoque vale muchísimo.

---

## Paso 10 · Cruzar Actuator con logs y comportamiento visible

Esta es probablemente la parte más valiosa de la clase.

Queremos que combines tres fuentes de lectura:

### 1. Lo que responde el cliente
Por ejemplo:
- `201`
- `400`
- `503`

### 2. Lo que muestran los logs
Por ejemplo:
- fallas remotas
- reintentos
- fallback
- degradación controlada

### 3. Lo que expone Actuator
Por ejemplo:
- health
- métricas
- endpoints operativos

Esa combinación ya se parece muchísimo más a la manera seria de diagnosticar sistemas distribuidos.

---

## Qué estamos logrando con esta clase

Esta clase le agrega observabilidad operativa básica al bloque de resiliencia.

Eso importa mucho porque, a esta altura, NovaMarket ya no es una arquitectura donde las fallas se observan solo “a ojo” o por intuición.

Ahora también empieza a tener una capa explícita de información operativa que ayuda a leer mejor el sistema.

---

## Qué todavía no estamos haciendo

Todavía no:

- trabajamos con tracing distribuido,
- dashboards más ricos,
- o visualización más completa del comportamiento de resiliencia.

Todo eso puede venir después.

La meta de hoy es mucho más concreta:

**que el bloque de resiliencia ya no sea opaco y tenga una forma básica de observación vía Actuator.**

---

## Errores comunes en esta etapa

### 1. No exponer los endpoints correctos de Actuator
Entonces parece que “no hay nada para ver”.

### 2. No reiniciar el servicio después de cambiar configuración
Eso suele dejarte mirando un estado viejo.

### 3. Esperar una visualización perfecta de entrada
Actuator ayuda mucho, pero esta es todavía una etapa inicial de observabilidad.

### 4. Mirar solo Actuator y no cruzarlo con logs ni requests reales
El valor fuerte aparece cuando combinás esas fuentes.

### 5. Creer que resiliencia termina con la configuración técnica
En realidad, sin observación operativa, cuesta muchísimo gestionarla bien.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `order-service` debería:

- exponer Actuator,
- dejar consultar endpoints operativos básicos,
- y permitirte observar mejor el estado general del servicio y del bloque de resiliencia.

Eso deja bastante mejor cerrado este tramo del curso.

---

## Punto de control

Antes de seguir, verificá que:

- Actuator está agregado en `order-service`,
- `/actuator/health` responde,
- `/actuator/metrics` responde,
- probaste el sistema en estado sano y en estado degradado,
- y entendiste mejor cómo observar el comportamiento resiliente.

Si eso está bien, el bloque de resiliencia ya queda bastante bien consolidado.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a empezar el bloque de observabilidad más amplia del sistema, comenzando por Actuator en los servicios de forma más general.

Eso nos va a permitir pasar de resiliencia observada localmente a una visión operativa más completa de NovaMarket.

---

## Cierre

En esta clase usamos Actuator para hacer más visible el comportamiento resiliente de `order-service`.

Con eso, NovaMarket ya no solo tolera mejor ciertas fallas: también empieza a ofrecer una superficie operativa más útil para entender qué está pasando cuando el sistema se comporta bien, y también cuando se degrada.
