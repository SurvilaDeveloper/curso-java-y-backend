---
title: "Exponiendo api-gateway en Kubernetes como primera entrada real externa de NovaMarket"
description: "Siguiente paso práctico del módulo 15. Exposición inicial de api-gateway en Kubernetes como primera entrada real externa del sistema dentro del cluster."
order: 162
module: "Módulo 15 · Kubernetes y orquestación final"
level: "intermedio"
draft: false
---

# Exponiendo `api-gateway` en Kubernetes como primera entrada real externa de NovaMarket

En la clase anterior dejamos algo bastante claro:

- `api-gateway` ya vive dentro del cluster,
- el sistema ya tiene una puerta de entrada real representada en Kubernetes,
- y el siguiente paso lógico ya no es seguir pensando solo en networking interno, sino hacer visible una primera entrada externa real del sistema.

Ahora toca el paso concreto:

**exponer `api-gateway` en Kubernetes como primera entrada real externa de NovaMarket.**

Ese es el objetivo de esta clase.

Porque una cosa es tener:

- un gateway desplegado,
- un `Service` interno,
- y una lectura razonable de la arquitectura dentro del cluster.

Y otra bastante distinta es conseguir que:

- el tráfico externo pueda llegar a la puerta de entrada del sistema,
- esa entrada se vuelva visible,
- y NovaMarket deje de ser una arquitectura orquestada solo “por dentro”.

Ese es exactamente el primer gran valor práctico que vamos a construir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mucho más clara la relación entre gateway y exposición externa en Kubernetes,
- visible una primera entrada real del sistema desde fuera del cluster,
- mejor entendida la diferencia entre recursos internos y acceso externo,
- y NovaMarket mejor preparado para el cierre final del bloque de Kubernetes.

La meta de hoy no es todavía resolver la estrategia final más sofisticada de entrada al cluster.  
La meta es mucho más concreta: **hacer que `api-gateway` ya pueda ser alcanzado desde fuera del cluster como primera entrada real externa de NovaMarket**.

---

## Estado de partida

Partimos de un sistema donde ya:

- `api-gateway` existe como Deployment y Service dentro del namespace,
- el bloque ya dejó claro que ahora hay que resolver la entrada externa,
- y el sistema ya tiene suficiente presencia en Kubernetes como para que esa exposición tenga sentido real.

Eso significa que el problema ya no es cómo correr el gateway dentro del cluster.  
Ahora la pregunta útil es otra:

- **cómo hacemos para que esa puerta de entrada sea realmente accesible desde fuera**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir una primera forma concreta de exposición externa,
- aplicarla a `api-gateway`,
- verificar que el sistema ya tenga una entrada visible desde fuera del cluster,
- y dejar mucho más clara la lectura de NovaMarket como arquitectura ya parcialmente expuesta en Kubernetes.

---

## Qué enfoque conviene usar primero

A esta altura del curso, no conviene empezar por la opción más sofisticada posible si todavía no consolidamos bien la base.

Lo más sano es una primera exposición:

- clara,
- visible,
- fácil de verificar,
- y suficientemente coherente con la etapa del curso.

Según el entorno que estés usando, eso puede apoyarse en un tipo de `Service` adecuado para exposición externa o en una primera aproximación equivalente.

La idea central es más importante que la variante exacta:

- **la puerta de entrada del sistema ya deja de ser solo interna**.

---

## Paso 1 · Ajustar el Service del gateway para exposición externa

A esta altura del módulo, una primera opción razonable puede ser hacer explícita una exposición de este estilo:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
  namespace: novamarket
spec:
  type: NodePort
  selector:
    app: api-gateway
  ports:
    - port: 8080
      targetPort: 8080
      nodePort: 30080
```

No hace falta todavía discutir aquí todas las variantes avanzadas.

La meta de hoy es mucho más concreta:

- convertir el gateway en una primera puerta de entrada visible desde fuera del cluster.

Ese paso ya tiene muchísimo valor.

---

## Paso 2 · Aplicar el cambio y verificar recursos

Ahora conviene aplicar los manifests y revisar algo como:

```bash
kubectl apply -f k8s/api-gateway/

kubectl get services -n novamarket
```

Lo importante es comprobar que:

- el Service refleja la nueva intención,
- la exposición cambió,
- y el sistema ya no depende solo del networking interno para alcanzar el gateway.

Ese momento vale muchísimo.

---

## Paso 3 · Probar la entrada externa

Ahora conviene verificar una llamada real hacia el gateway expuesto, por ejemplo usando la IP del nodo o el acceso equivalente que corresponda a tu entorno.

La idea no es todavía hacer una batería gigantesca de pruebas.

La meta es mucho más concreta:

- confirmar que NovaMarket ya tiene una primera entrada externa real hacia su puerta de entrada dentro de Kubernetes.

Ese paso es el corazón práctico de toda la clase.

---

## Paso 4 · Entender qué cambia realmente con este paso

Conviene leerlo con calma.

Antes:

- el gateway ya existía dentro del cluster,
- pero la entrada del sistema seguía siendo sobre todo interna.

Ahora, en cambio, además ya existe algo mucho más fuerte:

- una forma visible y concreta de alcanzar la puerta de entrada del sistema desde fuera del cluster.

Ese cambio parece chico, pero conceptualmente es enorme.

---

## Paso 5 · Pensar por qué esto importa tanto para el bloque final

A esta altura del módulo, conviene hacer una lectura muy concreta:

si el sistema ya tiene piezas internas representadas, pero no tiene una entrada visible desde afuera, el bloque final todavía queda a mitad de camino.

Con esta exposición inicial, en cambio:

- NovaMarket empieza a parecerse mucho más a una arquitectura realmente accesible,
- y el cluster deja de ser solo un lugar donde las piezas “están”, para convertirse también en un entorno donde el sistema empieza a ser alcanzable.

Ese cambio vale muchísimo.

---

## Paso 6 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya tiene toda su estrategia final de entrada a producción resuelta”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene una primera entrada externa real hacia `api-gateway` dentro de Kubernetes.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase expone `api-gateway` en Kubernetes como primera entrada real externa de NovaMarket.

Ya no estamos solo representando piezas dentro del cluster.  
Ahora también estamos haciendo que el sistema pueda empezar a ser alcanzado desde fuera de él a través de su puerta de entrada real.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- consolidamos todavía este subbloque con un checkpoint fuerte,
- ni definimos todavía la forma final más madura de exposición del sistema.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**hacer que NovaMarket deje de tener solo entrada interna y empiece a sostener una primera entrada externa real en Kubernetes.**

---

## Errores comunes en esta etapa

### 1. Pensar que con el Service interno ya estaba resuelto el borde del sistema
Todavía faltaba abrir el tráfico desde fuera del cluster.

### 2. Querer abrir una solución final más compleja sin esta base
Eso vuelve confuso el aprendizaje.

### 3. Reducir el problema a “abrir un puerto”
El valor real está en que el sistema ya empieza a ser accesible desde afuera a través de su gateway.

### 4. No verificar el acceso real después del cambio
La validación externa es parte central del paso.

### 5. No leer el cambio conceptual
Ahora el cluster ya no contiene solo piezas internas: empieza a exponer el borde del sistema.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que `api-gateway` ya tiene una primera exposición externa real en Kubernetes y que NovaMarket ya empezó a volverse accesible desde fuera del cluster de una forma concreta y entendible.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- `api-gateway` ya no está solo como pieza interna,
- existe una primera forma concreta de acceso externo,
- entendés qué cambia con este paso en la lectura del sistema,
- y sentís que NovaMarket ya dejó de ser una arquitectura solo interna al cluster para empezar a volverse accesible desde afuera.

Si eso está bien, ya podemos pasar al siguiente tema y consolidar esta nueva capa del bloque final.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta primera entrada externa real de NovaMarket en Kubernetes antes de decidir cómo cerrar el tramo final del curso.

---

## Cierre

En esta clase expusimos `api-gateway` en Kubernetes como primera entrada real externa de NovaMarket.

Con eso, el proyecto deja de pensar el cluster solo como un entorno interno para workloads y empieza a sostener una puerta de entrada visible, accesible y mucho más madura hacia la arquitectura final del sistema.
