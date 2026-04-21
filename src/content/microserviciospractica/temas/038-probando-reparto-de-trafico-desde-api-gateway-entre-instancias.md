---
title: "Probando reparto de tráfico desde api-gateway entre instancias"
description: "Segundo paso práctico del balanceo visible en NovaMarket. Envío de múltiples requests a través del gateway para comprobar que lb:// puede repartir tráfico entre distintas instancias registradas de inventory-service."
order: 38
module: "Módulo 6 · API Gateway"
level: "intermedio"
draft: false
---

# Probando reparto de tráfico desde `api-gateway` entre instancias

En la clase anterior dejamos armado el escenario que realmente necesitábamos para que este bloque cobre vida:

- más de una instancia real de `inventory-service`,
- ambas registradas en Eureka,
- mismo nombre lógico,
- y `api-gateway` ya enroutando con `lb://inventory-service`.

Eso ya tiene muchísimo valor.

Ahora sí toca el momento más visible de todo este bloque rehecho:

**probar el reparto de tráfico desde `api-gateway` entre instancias reales.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- comprobado que el gateway sigue resolviendo `inventory-service` por nombre lógico,
- enviadas múltiples requests al mismo endpoint público,
- observado que el tráfico no siempre llega a la misma instancia,
- y validado que Load Balancer ya no es solo una pieza conceptual dentro de NovaMarket.

Este es uno de los momentos más satisfactorios de todo el bloque, porque por fin vamos a ver en acción lo que veníamos preparando desde la creación del gateway.

---

## Estado de partida

En este punto ya tenemos:

- `config-server`
- `discovery-server`
- `catalog-service`
- `inventory-service` instancia A
- `inventory-service` instancia B
- `order-service`
- `api-gateway`

Además:

- ambas instancias de inventario están registradas como `INVENTORY-SERVICE`,
- el gateway ya tiene rutas con `lb://`,
- y la ruta hacia inventario ya entra por algo como:

```txt
/inventory/**
```

Eso significa que el entorno ya está listo para observar reparto de tráfico real.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar la ruta pública de inventario en el gateway,
- hacer requests repetidas al mismo endpoint,
- observar si la respuesta puede venir de distintas instancias,
- y preparar el terreno para una verificación todavía más explícita por logs en la siguiente clase.

---

## Qué problema queremos resolver exactamente

Hasta ahora ya sabemos que:

- existe más de una instancia,
- Eureka las muestra,
- y el gateway usa `lb://inventory-service`

Pero todavía nos falta cerrar la pregunta más importante:

**¿se está repartiendo realmente el tráfico o solo parece que sí?**

Esa es la duda que vamos a atacar ahora.

---

## Qué hace falta para que el reparto sea observable

Este punto importa mucho.

Si las dos instancias responden exactamente lo mismo y no dejan ninguna pista visible, el balanceo puede estar ocurriendo, pero nosotros no lo vamos a notar fácilmente.

Por eso, en esta clase conviene preparar una señal observable mínima.

Una forma muy simple es lograr que cada instancia pueda devolver o mostrar alguna diferencia visible, por ejemplo:

- el puerto en el que está corriendo,
- un identificador textual,
- o una respuesta auxiliar de diagnóstico.

No hace falta cambiar el contrato central del servicio para siempre.  
Con una pequeña señal temporal alcanza.

---

## Paso 1 · Agregar una forma de distinguir la instancia que respondió

Para esta etapa, una opción muy práctica es exponer temporalmente en `inventory-service` un endpoint auxiliar que devuelva algo como:

- nombre del servicio
- puerto actual
- y, si querés, una etiqueta de instancia

Por ejemplo, algo conceptualmente equivalente a:

```java
@GetMapping("/inventory/instance-info")
public Map<String, String> instanceInfo() {
    return Map.of(
        "service", "inventory-service",
        "port", serverPort
    );
}
```

donde `serverPort` puede inyectarse desde la configuración.

No hace falta que este endpoint quede como parte permanente del diseño final del servicio.  
En esta etapa es una herramienta excelente para visualizar el balanceo.

---

## Paso 2 · Verificar que cada instancia responde distinto por su puerto directo

Antes de pasar por el gateway, conviene confirmar que el endpoint de diagnóstico realmente distingue las dos instancias.

Por ejemplo, si levantaste una en `8082` y otra en `8084`, podrías probar:

```bash
curl http://localhost:8082/inventory/instance-info
curl http://localhost:8084/inventory/instance-info
```

La respuesta ideal sería algo como:

```json
{"service":"inventory-service","port":"8082"}
```

y

```json
{"service":"inventory-service","port":"8084"}
```

Si eso funciona, ya tenemos una forma muy clara de saber quién respondió.

---

## Paso 3 · Pasar ahora por el gateway

Una vez que el endpoint auxiliar distingue claramente a cada instancia, ahora sí probalo entrando por el gateway.

Por ejemplo:

```bash
curl http://localhost:8080/inventory/inventory/instance-info
```

La respuesta debería venir de una de las instancias registradas.

Todavía con una sola request no alcanza para sacar conclusiones fuertes.  
Pero ya es la primera prueba de que el gateway puede resolver el servicio lógico hacia una instancia concreta.

---

## Paso 4 · Repetir varias veces la misma request

Ahora repetí varias veces exactamente la misma llamada:

```bash
curl http://localhost:8080/inventory/inventory/instance-info
curl http://localhost:8080/inventory/inventory/instance-info
curl http://localhost:8080/inventory/inventory/instance-info
curl http://localhost:8080/inventory/inventory/instance-info
```

O hacelo en un pequeño loop si preferís.

La idea es observar si la respuesta alterna entre valores como:

- `8082`
- `8084`

Si eso ocurre, entonces el reparto de tráfico ya está quedando visible.

---

## Paso 5 · Entender qué estamos observando realmente

Si ves que la respuesta cambia entre instancias, eso significa varias cosas al mismo tiempo:

- Eureka conoce más de una instancia de `inventory-service`,
- el gateway está resolviendo el nombre lógico,
- Spring Cloud LoadBalancer está seleccionando una instancia,
- y el tráfico no está pegando siempre al mismo proceso por accidente.

Ese es un salto arquitectónico muy importante.

---

## Paso 6 · Probar también el endpoint funcional real

Después de la prueba con el endpoint auxiliar, conviene volver a algo funcional de verdad.

Por ejemplo:

```bash
curl http://localhost:8080/inventory/inventory
curl http://localhost:8080/inventory/inventory/1
```

Aunque la respuesta funcional sea la misma en ambas instancias, ahora ya tenés mucha más confianza en que detrás del gateway existe una resolución real entre procesos distintos.

Ese paso sirve para no perder de vista que lo importante no es el endpoint de diagnóstico, sino el servicio real.

---

## Paso 7 · Entender por qué esto no rompe `order-service`

Este punto también vale mucho la pena.

En esta clase estamos observando balanceo entrando por `api-gateway`, pero la arquitectura también quedó mejor preparada para cualquier consumidor interno que resuelva `inventory-service` por nombre lógico.

O sea: no es solo un truco del gateway.  
Es una propiedad más fuerte de cómo el sistema ya entiende a ese servicio.

Eso vuelve muchísimo más serio el estado actual de NovaMarket.

---

## Paso 8 · No sacar conclusiones exageradas todavía

Conviene ser honestos con el alcance de esta clase.

Aunque ahora veamos tráfico repartido entre instancias, eso **no significa todavía** que:

- ya tengamos tolerancia total a fallos,
- ya hayamos resuelto observabilidad avanzada,
- o el balanceo esté completamente afinado para producción.

Lo que sí significa es algo mucho más valioso y realista:

- la arquitectura ya dejó atrás el modelo de “un servicio = un puerto fijo”
- y pasó a uno donde un nombre lógico puede representar varias instancias reales.

Ese cambio ya pesa muchísimo.

---

## Qué estamos logrando con esta clase

Esta clase hace visible una de las promesas centrales del bloque rehecho:

**`lb://inventory-service` no es solo una forma linda de escribir una URI, sino una forma real de enrutar tráfico hacia distintas instancias de un mismo servicio.**

Eso completa de una forma muy fuerte el sentido de haber rehecho este tramo del curso.

---

## Qué todavía no hicimos

Todavía no vamos a:

- verificar esto con calma desde logs de cada instancia,
- observar con más detalle cuál respondió en cada request,
- comparar si el patrón parece round robin,
- ni revisar todavía discovery locator.

Todo eso viene enseguida.

La meta de hoy es mucho más concreta:

**probar que el gateway ya puede repartir tráfico entre distintas instancias reales de `inventory-service`.**

---

## Errores comunes en esta etapa

### 1. Probar el reparto sin una forma visible de distinguir instancias
Entonces el balanceo puede estar pasando, pero no se ve.

### 2. No verificar primero cada instancia por su puerto directo
Conviene asegurarse de que el entorno base está bien.

### 3. Probar solo una vez y asumir conclusiones fuertes
Con una sola request no alcanza.

### 4. Confundir cambio de instancia con error aleatorio
Por eso conviene usar una señal explícita, como el puerto.

### 5. Pensar que esta prueba reemplaza observabilidad real
No; es una verificación práctica y didáctica, no una solución final de monitoreo.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías haber observado que:

- el gateway sigue entrando por un solo endpoint público,
- `inventory-service` sigue siendo un solo nombre lógico,
- pero las respuestas pueden venir de más de una instancia real.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- existe una forma visible de distinguir las instancias,
- ambas responden por sus puertos directos,
- el gateway resuelve correctamente el endpoint público,
- y varias requests muestran que puede alternar entre instancias.

Si eso está bien, ya podemos pasar al siguiente tema y confirmar el reparto también desde los logs de cada proceso.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a verificar por logs qué instancia respondió cada request y a consolidar formalmente que el balanceo ya está funcionando de verdad dentro de NovaMarket.

---

## Cierre

En esta clase probamos reparto de tráfico desde `api-gateway` entre instancias reales.

Con eso, NovaMarket deja atrás definitivamente la idea de que un servicio es solo un puerto fijo y pasa a mostrar, de manera visible y práctica, cómo un nombre lógico puede representar varias instancias concretas detrás del gateway.
