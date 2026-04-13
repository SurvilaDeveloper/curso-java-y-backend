---
title: "Exponiendo el api-gateway dentro del entorno Kubernetes"
description: "Continuación del bloque de Kubernetes en NovaMarket. Definición de una forma razonable de acceso al api-gateway para empezar a validar el sistema entrando por su capa de entrada natural."
order: 93
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Exponiendo el `api-gateway` dentro del entorno Kubernetes

En la clase anterior logramos algo muy importante:

- `api-gateway` ya vive dentro del cluster,
- tiene su Deployment,
- y también tiene su Service interno.

Eso ya dejó a NovaMarket con una capa de entrada real dentro de Kubernetes.

Pero todavía falta un paso clave:

**definir una forma razonable de acceso a ese gateway dentro del entorno.**

Porque una cosa es que el gateway exista como recurso interno del cluster.  
Y otra bastante distinta es que podamos usarlo como puerta de entrada efectiva para validar el comportamiento del sistema en este nuevo entorno.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- definida una estrategia de exposición razonable para `api-gateway`,
- accesible el gateway dentro del entorno local de Kubernetes,
- y preparado el terreno para validar recorridos reales entrando por la capa natural de acceso del sistema.

No hace falta todavía construir una estrategia productiva completa de Ingress muy sofisticada.  
La meta de hoy es habilitar un acceso claro, práctico y coherente para las pruebas del bloque.

---

## Estado de partida

Partimos de este contexto:

- `api-gateway` ya está desplegado en Kubernetes,
- existe su Service interno,
- y el cluster ya aloja el núcleo base, una parte importante de la capa funcional y parte del circuito asincrónico del sistema.

Ahora necesitamos algo muy concreto:

**poder entrar al sistema por el gateway dentro del nuevo entorno.**

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar opciones de exposición para el gateway,
- elegir una estrategia razonable para esta etapa del curso,
- ajustar el Service si hace falta,
- y dejar al sistema listo para pruebas reales de entrada en la próxima clase.

---

## Qué problema queremos resolver exactamente

Hasta ahora, dentro del cluster tenemos varias piezas interesantes, pero la experiencia de acceso todavía puede sentirse demasiado interna o “de laboratorio”.

Lo que buscamos ahora es algo más natural:

- poder entrar por el gateway
- y usarlo como puerta de acceso unificada también en Kubernetes

Eso nos acerca bastante a una reconstrucción más real del sistema.

---

## Qué opciones tenemos para exponer el gateway

Para esta etapa del curso práctico, hay varias estrategias posibles.

### Opción 1 · `port-forward`
Muy útil para pruebas rápidas y controladas.

### Opción 2 · `NodePort`
Una forma simple y bastante visible de exponer el servicio dentro de un entorno local.

### Opción 3 · `Ingress`
Muy valiosa, pero suele agregar una capa más que quizás convenga introducir un poco más adelante.

Para esta clase, lo más razonable es elegir una estrategia simple, entendible y suficiente para validar el bloque.

---

## Por qué `NodePort` o una estrategia equivalente simple tiene sentido acá

Porque todavía estamos en un entorno local de aprendizaje.

No necesitamos resolver hoy:

- dominios completos,
- TLS,
- múltiples hosts,
- o una arquitectura de entrada de producción.

Lo que sí necesitamos es:

- una forma clara de llegar al gateway
- y usarlo para probar el sistema

Por eso, una exposición sencilla tiene mucho sentido.

---

## Paso 1 · Revisar el Service actual del gateway

En la clase anterior probablemente dejamos algo conceptual como:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
  namespace: novamarket
spec:
  selector:
    app: api-gateway
  ports:
    - port: 8080
      targetPort: 8080
  type: ClusterIP
```

Eso está perfecto para acceso interno, pero ahora necesitamos decidir si lo mantenemos así y usamos una estrategia de acceso auxiliar, o si lo adaptamos para esta etapa del bloque.

---

## Paso 2 · Elegir una estrategia concreta de exposición

Para esta clase, una estrategia razonable puede ser transformar temporalmente el Service a algo como `NodePort`, o usar un acceso controlado equivalente si tu entorno local lo favorece más.

La idea es simple:

- no buscamos la exposición definitiva del sistema,
- buscamos una exposición suficientemente clara como para usar el gateway como puerta de entrada del bloque.

---

## Paso 3 · Ajustar el Service si optás por `NodePort`

Una versión conceptual razonable podría verse así:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
  namespace: novamarket
spec:
  selector:
    app: api-gateway
  ports:
    - port: 8080
      targetPort: 8080
      nodePort: 30080
  type: NodePort
```

No hace falta que el puerto sea exactamente ese si tu entorno usa otra estrategia, pero sí conviene que la exposición quede muy clara y fácil de recordar.

---

## Paso 4 · Aplicar el cambio

Ahora aplicá la nueva versión del Service o la estrategia de exposición equivalente que hayas elegido.

La meta es que el gateway pase de ser una pieza accesible solo desde dentro del cluster a una pieza que ya podamos usar cómodamente en las próximas validaciones del bloque.

---

## Paso 5 · Verificar que el Service quedó correctamente actualizado

Después del cambio, comprobá que el Service siga existiendo y que la exposición elegida haya quedado realmente reflejada en el recurso.

No hace falta todavía hacer pruebas funcionales profundas.  
La prioridad es confirmar que la puerta de entrada ya quedó operativamente disponible.

---

## Paso 6 · Pensar qué significa este paso dentro del bloque

Hasta ahora, el cluster ya tenía una parte importante del sistema reconstruida, pero el acceso seguía sintiéndose bastante interno.

Con este paso, eso cambia bastante.

Ahora el sistema empieza a recuperar también una forma natural de entrada, y eso hace que el entorno Kubernetes se parezca mucho más a un ecosistema utilizable y no solo desplegado.

---

## Paso 7 · Verificar el acceso básico al gateway

Ahora probá llegar al gateway usando la estrategia de exposición que elegiste.

La meta es confirmar que:

- el gateway responde
- y ya puede utilizarse como punto real de entrada para las próximas pruebas del sistema

No hace falta todavía disparar el flujo protegido completo.  
Eso lo vamos a hacer en la próxima clase.

---

## Paso 8 · Pensar qué todavía no estamos resolviendo

Conviene dejar esto bien claro.

### Sí estamos resolviendo
- acceso práctico al gateway
- una puerta de entrada usable para pruebas
- continuidad del bloque de Kubernetes

### Todavía no estamos resolviendo
- una estrategia final de Ingress
- dominios
- TLS
- reglas avanzadas de entrada

Eso está bien.  
Para este punto del curso, una solución simple y clara ya aporta muchísimo.

---

## Qué estamos logrando con esta clase

Esta clase le da al cluster algo muy valioso:

**una forma práctica de entrada al sistema a través del gateway.**

Eso cambia mucho el peso del entorno, porque ya no estamos pensando solo en servicios vivos dentro del cluster, sino también en cómo usarlos desde una puerta de acceso razonable.

---

## Qué todavía no hicimos

Todavía no:

- validamos el flujo principal completo entrando por el gateway dentro del cluster
- ni cerramos el tramo fuerte de reconstrucción del sistema en Kubernetes

Todo eso viene inmediatamente después.

La meta de hoy es mucho más concreta:

**dejar el gateway accesible para esas pruebas.**

---

## Errores comunes en esta etapa

### 1. Querer resolver Ingress completo demasiado pronto
Para esta etapa, una exposición simple suele ser mejor.

### 2. Cambiar el Service sin revisar cómo quedó aplicado
Siempre conviene validar el recurso final.

### 3. Pensar que el gateway ya estaba “usable” solo por tener ClusterIP
Para pruebas desde fuera del cluster eso no necesariamente alcanza.

### 4. Elegir una estrategia de exposición poco práctica para el entorno local
Conviene priorizar claridad y facilidad de prueba.

### 5. Confundir esta clase con la validación funcional completa
Hoy la prioridad es dejar la puerta de entrada disponible.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `api-gateway` debería estar expuesto de una forma razonable dentro del entorno local de Kubernetes y listo para ser usado como puerta de acceso en las siguientes validaciones del sistema.

Eso deja el bloque muy bien preparado para uno de sus próximos checkpoints más fuertes.

---

## Punto de control

Antes de seguir, verificá que:

- el gateway sigue sano,
- su Service quedó correctamente ajustado,
- existe una forma razonable de acceder a él,
- y ya puede usarse como puerta de entrada para las pruebas del entorno.

Si eso está bien, ya podemos pasar a validar el sistema entrando por el gateway dentro del cluster.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar el flujo principal entrando por `api-gateway` dentro del entorno Kubernetes.

Ese será uno de los pasos más importantes del bloque porque va a demostrar que ya no solo reconstruimos piezas internas del sistema, sino también una forma razonable de acceso al stack dentro del cluster.

---

## Cierre

En esta clase expusimos `api-gateway` dentro del entorno Kubernetes.

Con eso, NovaMarket ya no solo tiene una capa de entrada desplegada en el cluster: también empieza a tener una forma práctica de usarla para validar el sistema desde su puerta natural de acceso.
