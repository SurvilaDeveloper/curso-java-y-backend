---
title: "Verificando por logs que el balanceo ya está funcionando"
description: "Checkpoint práctico del nuevo bloque de Load Balancer. Confirmación por logs y señales de ejecución de que las requests que entran por el gateway ya se reparten entre distintas instancias reales."
order: 39
module: "Módulo 6 · API Gateway"
level: "intermedio"
draft: false
---

# Verificando por logs que el balanceo ya está funcionando

En la clase anterior hicimos una de las pruebas más importantes de todo este bloque rehecho:

- levantamos múltiples instancias reales de `inventory-service`,
- entramos por `api-gateway`,
- mandamos varias requests al mismo endpoint,
- y observamos que las respuestas podían venir de distintas instancias.

Eso ya tiene muchísimo valor.

Pero ahora conviene hacer lo que venimos haciendo cada vez que el proyecto gana una nueva capacidad importante:

**un checkpoint de verificación más serio.**

Porque una cosa es ver una señal superficial de que el reparto parece existir.  
Y otra bastante distinta es confirmar por logs y por ejecución real que el balanceo está ocurriendo de verdad.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- las distintas instancias de `inventory-service` reciben requests reales entrando por el gateway,
- esa recepción puede observarse claramente en logs,
- el sistema ya no está pegando siempre al mismo proceso,
- y el bloque de Load Balancer quedó consolidado como una mejora real dentro de NovaMarket.

Esta clase funciona como checkpoint práctico del balanceo visible.

---

## Estado de partida

En este punto ya tenemos:

- `api-gateway` enroutando con `lb://inventory-service`,
- más de una instancia real de `inventory-service`,
- ambas registradas en Eureka,
- y pruebas previas donde el reparto ya parecía observable.

Eso significa que ahora ya no estamos construyendo el escenario.  
Ahora estamos validando con más rigor que el escenario realmente funciona.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- preparar mejor los logs de cada instancia,
- mandar varias requests al mismo endpoint público,
- observar qué proceso atendió cada una,
- y consolidar la lectura correcta de lo que está pasando dentro del sistema.

---

## Qué queremos comprobar exactamente

No queremos quedarnos con una sensación vaga del tipo:

- “parece que a veces cambia de instancia”

Queremos algo bastante más fuerte:

- poder mirar la consola o los logs de cada proceso
- y ver que requests distintas llegaron realmente a procesos distintos.

Ese es el verdadero valor del checkpoint.

---

## Paso 1 · Hacer visibles los logs de cada instancia

Para que esta clase sea cómoda de seguir, conviene tener levantadas las dos instancias de `inventory-service` en consolas separadas o con una forma fácil de distinguir sus logs.

Por ejemplo:

- consola A → instancia en `8082`
- consola B → instancia en `8084`

No hace falta todavía observabilidad sofisticada.  
Con logs bien visibles ya alcanza para esta etapa del curso.

---

## Paso 2 · Agregar una línea de log útil en el endpoint de diagnóstico o en el endpoint real

Ahora conviene dejar una señal clara cada vez que una instancia recibe una request.

Por ejemplo, en el endpoint de diagnóstico podrías loguear algo conceptual como:

```java
log.info("Inventory instance on port {} atendió /inventory/instance-info", serverPort);
```

Y si querés reforzarlo todavía más, también podrías loguear llamadas al endpoint real de inventario.

La idea no es llenar de ruido el proyecto para siempre.  
La idea es tener una prueba didáctica muy clara del reparto.

---

## Paso 3 · Verificar primero logs por acceso directo

Antes de pasar por el gateway, hacé una prueba corta por puertos directos.

Por ejemplo:

```bash
curl http://localhost:8082/inventory/instance-info
curl http://localhost:8084/inventory/instance-info
```

Y confirmá que:

- la instancia A loguea su request,
- la instancia B loguea la suya,
- y cada proceso se identifica claramente.

Esto deja muy saneado el entorno antes de pasar a la prueba importante.

---

## Paso 4 · Mandar varias requests entrando por el gateway

Ahora sí, ejecutá varias veces algo como:

```bash
curl http://localhost:8080/inventory/inventory/instance-info
curl http://localhost:8080/inventory/inventory/instance-info
curl http://localhost:8080/inventory/inventory/instance-info
curl http://localhost:8080/inventory/inventory/instance-info
curl http://localhost:8080/inventory/inventory/instance-info
```

Lo ideal es hacer varias requests seguidas y después mirar:

- la respuesta visible,
- y los logs en ambas consolas.

Ahí debería empezar a verse con mucha más claridad cuál recibió cada una.

---

## Paso 5 · Observar distribución real entre procesos

Este es el momento central de toda la clase.

Lo que queremos comprobar es algo como esto:

- una request llegó a la instancia en `8082`
- otra request llegó a la instancia en `8084`
- otra volvió a `8082`
- y así sucesivamente o con una lógica equivalente

No hace falta todavía imponer una lectura ultra rígida del algoritmo exacto.

Lo importante es confirmar que:

- no siempre responde la misma,
- y el balanceo realmente está participando en el trayecto.

---

## Paso 6 · Entender qué nos dicen esos logs

Si los logs muestran recepción alternada o repartida entre procesos, eso confirma varias cosas al mismo tiempo:

- Eureka no solo registra instancias; también las expone para resolución real,
- el gateway no solo enruta; también selecciona instancias apoyado en LoadBalancer,
- y NovaMarket ya no está acoplado a una sola ubicación física para el servicio de inventario.

Ese es un cambio enorme de madurez dentro del proyecto.

---

## Paso 7 · Probar también con un endpoint funcional real

Después de la validación con el endpoint auxiliar, conviene hacer algunas llamadas a algo más cercano al uso funcional normal.

Por ejemplo:

```bash
curl http://localhost:8080/inventory/inventory/1
curl http://localhost:8080/inventory/inventory/1
curl http://localhost:8080/inventory/inventory/1
```

Aunque la respuesta sea la misma desde afuera, ahora ya podés mirar los logs para confirmar que distintas instancias están participando detrás del mismo endpoint público.

Eso hace que la prueba gane muchísimo valor.

---

## Paso 8 · No exagerar todavía lo que logramos

Como siempre, conviene ser honestos con el alcance.

Después de esta clase, todavía no deberíamos afirmar cosas como:

- “ya tenemos una estrategia completa de alta disponibilidad”
- o “ya resolvimos toda la resiliencia del sistema”

Eso sería demasiado.

Lo correcto es algo más preciso y mucho más valioso:

- ya demostramos de forma visible que el gateway puede repartir requests entre varias instancias reales de un mismo servicio lógico.

Eso ya es un avance muy fuerte.

---

## Paso 9 · Entender por qué este checkpoint vale tanto

Este checkpoint importa muchísimo porque transforma una promesa arquitectónica en una evidencia observable.

Antes decíamos:

- “el gateway usa `lb://inventory-service`”

Ahora además podemos decir:

- “y vimos por logs que distintas instancias reales atendieron requests entrando por ese mismo nombre lógico”.

Ese salto entre teoría y evidencia vale muchísimo.

---

## Qué estamos logrando con esta clase

Esta clase consolida el primer tramo verdaderamente visible del balanceo dentro de NovaMarket.

Ya no estamos solo apoyados en conceptos correctos y configuración sana.  
Ahora también estamos mostrando que el sistema efectivamente reparte tráfico entre procesos distintos.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- discutimos si el patrón que vemos se parece a round robin,
- comparamos rutas explícitas contra discovery locator,
- ni revisamos errores frecuentes del gateway cuando esto falla.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**confirmar por logs que el balanceo ya está funcionando de verdad dentro de NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Mirar solo la respuesta HTTP y no los logs
Entonces la prueba queda demasiado superficial.

### 2. No distinguir bien las consolas de cada instancia
Eso vuelve muy difícil interpretar qué pasó.

### 3. No agregar ninguna señal de log útil
Conviene dejar una evidencia visible mientras hacemos este bloque.

### 4. Querer deducir un algoritmo exacto con muy pocas requests
En esta etapa no hace falta ese nivel de conclusión.

### 5. Confundir reparto observable con solución completa de resiliencia
Todavía estamos consolidando un bloque inicial de balanceo, no cerrando toda la historia de disponibilidad.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder afirmar con bastante confianza que:

- más de una instancia real de `inventory-service` está participando,
- el gateway entra por un único endpoint público,
- y el tráfico ya no queda pegado siempre al mismo proceso.

Eso deja perfectamente preparado el siguiente tema.

---

## Punto de control

Antes de seguir, verificá que:

- los logs de cada instancia son distinguibles,
- varias requests entrando por el gateway llegan a procesos distintos,
- la resolución por nombre lógico sigue funcionando,
- y sentís que Load Balancer ya dejó de ser una idea abstracta dentro del proyecto.

Si eso está bien, ya podemos pasar al siguiente tema y empezar a mirar qué patrón de reparto estamos viendo y qué otras formas de definir rutas nos ofrece el gateway.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a observar con más calma el patrón de reparto que aparece entre instancias y a usar ese análisis como puente hacia otras opciones de configuración del gateway.

---

## Cierre

En esta clase verificamos por logs que el balanceo ya está funcionando.

Con eso, NovaMarket deja este tramo del bloque rehecho con una evidencia muy fuerte de que `api-gateway`, Eureka y Spring Cloud LoadBalancer ya están trabajando juntos para repartir requests entre distintas instancias reales de un mismo servicio lógico.
