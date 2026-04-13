---
title: "Conectando servicios a Zipkin"
description: "Continuación del bloque de observabilidad distribuida en NovaMarket. Configuración de exportación de trazas desde gateway y microservicios hacia Zipkin."
order: 54
module: "Módulo 9 · Observabilidad de punta a punta"
level: "intermedio"
draft: false
---

# Conectando servicios a Zipkin

En la clase anterior levantamos **Zipkin** y lo dejamos accesible como backend de trazas para NovaMarket.

Ahora toca dar el paso realmente importante:

**hacer que los servicios empiecen a enviarle trazas.**

Hasta este momento, la arquitectura ya tiene:

- Actuator,
- métricas con Micrometer,
- y Micrometer Tracing integrado en el flujo principal.

Pero todavía falta cerrar el circuito:

- generar trazas
- y exportarlas a un backend visible.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- configurada la exportación de trazas hacia Zipkin,
- conectados al menos los servicios principales del flujo distribuido,
- y listo el entorno para ver en la UI de Zipkin requests reales atravesando varios componentes.

Todavía no vamos a hacer el gran recorrido de prueba final.  
Primero queremos dejar correctamente conectada la infraestructura.

---

## Estado de partida

Partimos de este contexto:

- Zipkin ya está levantado,
- su interfaz ya es accesible,
- `api-gateway`, `order-service` e `inventory-service` ya tienen Micrometer Tracing integrado,
- pero todavía no están exportando trazas hacia ese backend.

Eso significa que el contexto de tracing existe, pero todavía no está llegando a una herramienta útil de visualización.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- agregar la configuración necesaria de exportación,
- apuntar los servicios al backend de Zipkin,
- reiniciar los componentes relevantes,
- generar tráfico,
- y verificar que la UI empiece a poblarse con trazas reales.

---

## Qué servicios conviene conectar en esta etapa

Para esta parte del curso práctico, los más valiosos son:

- `api-gateway`
- `order-service`
- `inventory-service`

¿Por qué?

Porque esos tres componen el flujo distribuido principal que ya venimos trabajando:

- entrada por gateway
- paso por órdenes
- llamada hacia inventario

Si estas tres piezas exportan bien, el módulo de observabilidad ya da un salto enorme.

---

## Paso 1 · Revisar la configuración de exportación en los servicios

Como NovaMarket ya usa configuración centralizada, una forma muy razonable de manejar esto es a través de `config-repo`.

Vas a querer agregar propiedades relacionadas con tracing y exportación en:

- `api-gateway.yml`
- `order-service.yml`
- `inventory-service.yml`

La idea general es indicar dónde está Zipkin y cuál es la probabilidad de muestreo que queremos usar en esta etapa del curso.

---

## Paso 2 · Definir una base razonable de exportación

Una configuración conceptual razonable para esta etapa podría incluir algo como:

```yaml
management:
  tracing:
    sampling:
      probability: 1.0
```

Y además la configuración correspondiente del exporter hacia Zipkin según el stack que estés usando.

La razón para usar una probabilidad alta o total en esta etapa es simple:

**queremos ver trazas.**

En un entorno de laboratorio y aprendizaje, tiene mucho sentido que casi todas las requests del flujo principal queden visibles para facilitar la comprensión.

---

## Paso 3 · Apuntar a Zipkin

Ahora agregá la URL del backend de trazas para los servicios relevantes.

Conceptualmente, el sistema tiene que saber que debe exportar hacia la dirección donde levantaste Zipkin, por ejemplo:

```txt
http://localhost:9411
```

La propiedad exacta depende del stack y del bridge que estés usando con Micrometer Tracing, pero la idea es siempre la misma:

- el servicio genera spans,
- y los envía al backend de Zipkin.

Lo importante en esta clase no es memorizar cada propiedad, sino entender la arquitectura del flujo.

---

## Paso 4 · Repetir la configuración en `api-gateway`

En el gateway esta configuración es especialmente valiosa, porque marca el inicio del recorrido.

Queremos que desde el primer ingreso al sistema ya exista contexto de traza exportado.

Por eso, asegurate de que `api-gateway` también apunte a Zipkin y no solo los microservicios internos.

---

## Paso 5 · Repetir la configuración en `order-service`

Ahora hacé lo mismo en `order-service`.

Este servicio es central en el bloque, porque es el que toma el request principal del negocio y además llama a otro servicio.

Es, probablemente, la pieza más interesante de observar desde el punto de vista de trazas.

---

## Paso 6 · Repetir la configuración en `inventory-service`

Finalmente, replicá el patrón en `inventory-service`.

Queremos que cuando `order-service` consulte inventario, esa parte del recorrido también quede trazada y visible.

Ahí es donde realmente el tracing distribuido empieza a mostrar su valor.

---

## Paso 7 · Reiniciar los servicios relevantes

Después de agregar la configuración, reiniciá:

- `api-gateway`
- `order-service`
- `inventory-service`

Y mantené arriba también:

- Zipkin
- `config-server`
- `discovery-server`
- Keycloak si querés seguir probando el flujo autenticado

Este reinicio es importante para asegurarte de que todos los servicios ya estén exportando según la nueva configuración.

---

## Paso 8 · Generar tráfico distribuido real

Ahora necesitamos producir un request que atraviese el sistema.

Una excelente opción es el flujo autenticado de creación de orden:

```bash
curl -i -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 1 }
    ]
  }'
```

Este request es ideal porque:

- entra por `api-gateway`,
- pasa por `order-service`,
- y dispara una llamada a `inventory-service`.

Es decir, genera justo el tipo de recorrido que más nos interesa ver en Zipkin.

---

## Paso 9 · Abrir la UI de Zipkin

Ahora entrá a la interfaz de Zipkin.

Por ejemplo, si lo levantaste en el puerto habitual:

```txt
http://localhost:9411
```

La idea es empezar a revisar si ya aparecen trazas reales del sistema.

En esta etapa, incluso una sola traza correctamente visible ya tiene muchísimo valor.

---

## Paso 10 · Buscar las primeras señales correctas

No hace falta que en esta clase hagamos todavía la interpretación más profunda de cada span.  
Eso lo vamos a trabajar más claramente en la próxima.

Por ahora, queremos comprobar al menos esto:

- que la request generó una traza,
- que esa traza llegó a Zipkin,
- y que el backend ya está viendo actividad real de NovaMarket.

Ese es el verdadero cierre técnico de esta integración.

---

## Qué estamos logrando con esta clase

Esta clase completa el circuito de tracing distribuido:

- el sistema ya genera contexto,
- el sistema ya lo exporta,
- y Zipkin ya lo recibe.

Eso es un avance enorme respecto de mirar solo logs o métricas locales.

Ahora el recorrido distribuido del sistema empieza a volverse visible de verdad.

---

## Qué todavía no hicimos

Todavía no:

- analizamos detalladamente una traza completa,
- interpretamos bien los spans,
- ni usamos Zipkin como herramienta de diagnóstico comparando latencias y recorridos.

Todo eso viene en la próxima clase.

La meta de hoy es mucho más concreta:

**dejar la exportación a Zipkin funcionando.**

---

## Errores comunes en esta etapa

### 1. Configurar tracing en los servicios pero no apuntarlos a Zipkin
Entonces la infraestructura parece lista, pero no se ve nada.

### 2. Olvidarse de reiniciar los servicios después de cambiar configuración
Es una de las causas más comunes de confusión.

### 3. Generar solo tráfico local dentro de un servicio aislado
Conviene usar un flujo distribuido real.

### 4. No incluir al gateway en la exportación
Eso corta una parte muy valiosa del recorrido.

### 5. Esperar trazas sin haber hecho requests nuevas
Zipkin no se llena solo; necesita tráfico real.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, NovaMarket debería estar exportando trazas a Zipkin y la interfaz debería empezar a mostrar actividad real del sistema.

Eso deja preparado el paso más interesante del módulo: interpretar el recorrido de una request distribuida de punta a punta.

---

## Punto de control

Antes de seguir, verificá que:

- Zipkin sigue arriba,
- configuraste exportación en los servicios relevantes,
- reiniciaste el entorno correspondiente,
- generaste tráfico real,
- y la UI de Zipkin ya muestra trazas de NovaMarket.

Si eso está bien, ya podemos pasar al cierre fuerte del módulo de observabilidad distribuida.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a seguir una request completa dentro de Zipkin.

Ese será el momento en que el tracing deje de ser solo “algo configurado” y pase a convertirse en una herramienta concreta de lectura del sistema.

---

## Cierre

En esta clase conectamos a los servicios principales de NovaMarket con Zipkin.

Con eso, la observabilidad distribuida del sistema ya dejó de estar solo preparada y pasó a estar realmente activa y visible.
