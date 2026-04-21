---
title: "Observando el patrón de reparto entre instancias y qué significa"
description: "Lectura guiada del reparto de tráfico visible en NovaMarket. Análisis práctico del patrón observado entre instancias y de qué conclusiones sí y no conviene sacar en esta etapa."
order: 40
module: "Módulo 6 · API Gateway"
level: "intermedio"
draft: false
---

# Observando el patrón de reparto entre instancias y qué significa

En la clase anterior hicimos una verificación muy importante:

- levantamos más de una instancia real de `inventory-service`,
- entramos por `api-gateway`,
- mandamos varias requests al mismo endpoint,
- y confirmamos por logs que distintas instancias respondían requests distintas.

Eso ya tiene muchísimo valor.

Pero ahora conviene hacer otra pausa útil:

**leer mejor el patrón de reparto que estamos observando y entender qué significa realmente.**

Ese es el objetivo de esta clase.

Porque una cosa es ver que “a veces responde una y a veces responde otra”.  
Y otra bastante distinta es entender:

- si eso parece un reparto ordenado,
- qué tipo de comportamiento estamos viendo,
- qué conclusiones son razonables,
- y cuáles todavía serían exageradas.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mucho más claro qué patrón de reparto se observa entre las instancias,
- entendida la diferencia entre “hay balanceo” y “entiendo cómo se está comportando”,
- fijado qué conclusiones son válidas en este punto del curso,
- y preparado el terreno para comparar después distintas maneras de definir rutas en el gateway.

Todavía no vamos a cambiar configuración del gateway.  
La meta de hoy es leer mejor lo que ya está pasando.

---

## Estado de partida

En este punto ya tenemos:

- `api-gateway` enroutando con `lb://inventory-service`,
- múltiples instancias reales de `inventory-service`,
- evidencia por logs de que requests distintas llegan a procesos distintos,
- y una arquitectura donde el balanceo ya dejó de ser una idea abstracta.

Eso significa que ya no estamos tratando de “hacer que funcione”.  
Ahora estamos tratando de **entender mejor cómo está funcionando**.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- repetir algunas requests de forma más ordenada,
- observar el patrón de alternancia o reparto,
- distinguir entre observación empírica y conclusión técnica,
- y dejar bien ubicado el alcance real de esta prueba dentro de NovaMarket.

---

## Qué problema queremos resolver exactamente

Queremos evitar dos errores muy comunes:

### Error 1
Ver que responden distintas instancias y no mirar nada más.

### Error 2
Ver una secuencia corta y afirmar demasiado pronto:
- “ya sé exactamente el algoritmo”
- o
- “esto ya garantiza comportamiento de producción”

Ninguna de las dos cosas es sana.

Lo correcto en esta etapa es algo más equilibrado:

- observar,
- comparar,
- sacar conclusiones razonables,
- y no exagerar.

Ese equilibrio es el corazón de esta clase.

---

## Paso 1 · Repetir una secuencia un poco más larga de requests

En vez de mandar solo 3 o 4 requests, conviene ahora mandar una secuencia algo más larga al endpoint auxiliar o a uno funcional donde puedas distinguir la instancia.

Por ejemplo:

```bash
curl http://localhost:8080/inventory/inventory/instance-info
curl http://localhost:8080/inventory/inventory/instance-info
curl http://localhost:8080/inventory/inventory/instance-info
curl http://localhost:8080/inventory/inventory/instance-info
curl http://localhost:8080/inventory/inventory/instance-info
curl http://localhost:8080/inventory/inventory/instance-info
curl http://localhost:8080/inventory/inventory/instance-info
curl http://localhost:8080/inventory/inventory/instance-info
```

La idea no es automatizar todavía demasiado, sino mirar con más calma el comportamiento.

---

## Paso 2 · Anotar mentalmente la secuencia que aparece

Ahora observá algo como:

- `8082`
- `8084`
- `8082`
- `8084`

o alguna variante parecida.

Si ves algo relativamente alternado, eso sugiere un reparto ordenado entre instancias.

No hace falta todavía usar lenguaje demasiado rígido.  
Lo importante es notar que:

- el gateway no está pegado a una sola,
- y la selección parece seguir una lógica estable.

---

## Paso 3 · Entender qué suele sugerir esa alternancia

Si la secuencia observada parece ir alternando entre las instancias, eso suele ser coherente con una estrategia de reparto tipo:

- round robin
- o una lógica equivalente de selección secuencial entre instancias disponibles

En esta etapa del curso, no hace falta todavía formalizar demasiado el algoritmo exacto.

La lectura sana es esta:

- **el sistema está repartiendo**
- y el patrón parece suficientemente ordenado como para no ser azar puro

Eso ya es una conclusión muy valiosa.

---

## Paso 4 · Entender por qué no conviene concluir demasiado con pocas requests

Esto también importa mucho.

Aunque veas algo como:

- `8082`
- `8084`
- `8082`
- `8084`

no conviene afirmar demasiado rápido:

- “está garantizado que siempre será exactamente así”
- o
- “ya entendimos toda la política de balanceo”

¿Por qué?

Porque una secuencia corta solo te da:

- una buena evidencia práctica
- pero no una garantía total sobre todos los casos posibles

Ese matiz es muy importante.

---

## Paso 5 · Pensar qué cambia si una instancia deja de estar disponible

Este punto vale mucho la pena.

Si apagás temporalmente una de las instancias y repetís las requests, lo esperable es que:

- el tráfico deje de repartirse,
- y la instancia restante absorba las requests disponibles

Eso ayuda a entender que el patrón de reparto no vive aislado de la salud del entorno.

Depende de:

- qué instancias están registradas,
- cuáles siguen activas,
- y cuáles están disponibles para ser elegidas.

Eso vuelve el modelo mucho más real.

---

## Paso 6 · Entender qué valor tiene esta observación en el curso

A esta altura, lo más importante no es memorizar un algoritmo.

Lo más importante es consolidar esta idea:

- un servicio lógico ya no equivale a una sola ubicación física,
- y el gateway ya puede repartir tráfico entre varias instancias reales de ese mismo servicio.

Esa comprensión arquitectónica vale muchísimo más que una obsesión temprana con los detalles finos del algoritmo.

---

## Paso 7 · Entender qué todavía no estamos midiendo

Conviene dejar esto muy claro.

En esta etapa todavía no estamos midiendo cosas como:

- latencia por instancia,
- tiempo de respuesta,
- políticas avanzadas de selección,
- peso por instancia,
- afinidad,
- ni estrategias de recuperación avanzada.

Todo eso pertenece a etapas mucho más avanzadas.

La meta de hoy es más concreta:

- observar el reparto real,
- y leerlo con madurez suficiente para no subestimar ni exagerar.

---

## Qué estamos logrando con esta clase

Esta clase le agrega una capa de comprensión al bloque de Load Balancer.

Ya no solo vimos que “cambia de instancia”.  
Ahora además entendemos mejor qué tipo de comportamiento parece mostrar el sistema y cómo conviene leerlo dentro del alcance real de NovaMarket.

Eso fortalece muchísimo el bloque rehecho.

---

## Qué todavía no hicimos

Todavía no:

- comparamos rutas explícitas con discovery locator,
- ni revisamos todavía los errores más comunes de Gateway + Eureka + LoadBalancer.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**entender mejor el patrón de reparto que ya estamos observando entre instancias.**

---

## Errores comunes en esta etapa

### 1. No repetir suficientes requests
Entonces el patrón queda demasiado difuso.

### 2. Ver alternancia y asumir una garantía total
Una secuencia corta no alcanza para tanto.

### 3. Obsesionarse con el algoritmo exacto demasiado temprano
Lo importante ahora es consolidar la arquitectura, no cerrar toda una teoría de scheduling.

### 4. No relacionar el reparto con la disponibilidad real de instancias
El entorno vivo importa muchísimo.

### 5. Pensar que esta observación ya equivale a observabilidad avanzada
Todavía estamos en una verificación práctica local, no en un sistema de monitoreo completo.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder leer con más criterio el reparto entre instancias y entender mejor qué está demostrando realmente NovaMarket en esta etapa del curso.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- ya observaste una secuencia de requests suficientemente clara,
- entendés que el reparto parece ordenado,
- no estás exagerando todavía el alcance de la prueba,
- y sentís que el balanceo ya quedó no solo visible, sino también mejor interpretado.

Si eso está bien, ya podemos pasar al siguiente tema y comparar dos maneras distintas de enrutar servicios desde el gateway.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a comparar **rutas explícitas** y **discovery locator** en `api-gateway` para entender qué ventajas y límites tiene cada enfoque dentro de NovaMarket.

---

## Cierre

En esta clase observamos el patrón de reparto entre instancias y qué significa.

Con eso, NovaMarket deja este tramo del bloque rehecho con una comprensión mucho más madura de cómo se está comportando realmente el balanceo que acabamos de volver visible.
