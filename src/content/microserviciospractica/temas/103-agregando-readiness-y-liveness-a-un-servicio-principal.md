---
title: "Agregando readiness y liveness a un servicio principal"
description: "Primer paso concreto del endurecimiento operativo en Kubernetes. Aplicación de readiness y liveness probes a uno de los servicios principales de NovaMarket."
order: 103
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Agregando `readiness` y `liveness` a un servicio principal

En la clase anterior dejamos claro algo muy importante:

- NovaMarket ya está lo suficientemente reconstruido dentro del cluster,
- la configuración ya es más madura,
- la entrada también,
- y por eso ahora tiene sentido endurecer cómo Kubernetes interpreta la salud de los servicios.

Ese era el terreno conceptual.

Ahora toca el paso concreto:

**agregar `readiness` y `liveness` a uno de los servicios principales.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- elegido un servicio importante del sistema para inaugurar este refinamiento,
- agregado un `readinessProbe`,
- agregado un `livenessProbe`,
- y validado que el cluster ahora tiene una lectura más madura de la salud de esa pieza.

Todavía no vamos a aplicar esto a todo el stack.  
La meta de hoy es instalar bien el patrón en una pieza relevante del sistema.

---

## Estado de partida

Partimos de un entorno donde el cluster ya aloja una parte muy importante de NovaMarket y donde varios servicios ya exponen Actuator o algún endpoint razonable de salud.

Eso significa que ya existe una base excelente para empezar a convertir la teoría de la clase anterior en un refinamiento operativo real.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir un servicio importante del ecosistema,
- revisar su `Deployment`,
- agregar `readinessProbe` y `livenessProbe`,
- reaplicar el manifiesto,
- y observar el efecto de esta mejora dentro del cluster.

---

## Qué servicio conviene elegir primero

Para esta primera iteración, conviene tocar una pieza que:

- ya esté bien comprendida,
- tenga peso real en el sistema,
- y donde el valor de distinguir “arrancó” de “está realmente listo” sea bastante visible.

Buenos candidatos pueden ser:

- `api-gateway`
- `order-service`
- `config-server`
- `discovery-server`

Para esta clase, un muy buen ejemplo puede ser `api-gateway` o `order-service`, porque ambos tienen mucho peso operativo y son bastante representativos del sistema.

---

## Paso 1 · Revisar el `Deployment` actual del servicio elegido

Antes de tocar nada, conviene abrir el `Deployment` del servicio y mirar cómo está hoy definido.

La idea es identificar:

- el contenedor
- sus puertos
- sus variables de entorno
- y el lugar razonable donde vamos a insertar las probes

No hace falta cambiar nada más todavía.  
Primero queremos entender bien el punto de partida.

---

## Paso 2 · Elegir un endpoint razonable para las probes

Como el proyecto ya viene usando Actuator, una opción muy natural para esta etapa es apoyarse en:

```txt
/actuator/health
```

No hace falta todavía entrar en variantes mucho más sofisticadas del endpoint.

La idea es empezar por una estrategia clara, consistente y suficientemente buena para esta fase del curso.

---

## Paso 3 · Agregar un `readinessProbe`

Ahora incorporá algo conceptualmente parecido a esto dentro del contenedor:

```yaml
readinessProbe:
  httpGet:
    path: /actuator/health
    port: 8080
  initialDelaySeconds: 20
  periodSeconds: 10
```

No hace falta que estos números sean exactamente los definitivos para tu entorno.  
Lo importante es que ya exista una señal explícita de “este servicio solo debería recibir tráfico cuando realmente esté listo”.

Ese es el corazón del `readinessProbe`.

---

## Paso 4 · Agregar un `livenessProbe`

Ahora sumá algo como:

```yaml
livenessProbe:
  httpGet:
    path: /actuator/health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 15
```

De nuevo, los valores concretos pueden ajustarse según el entorno, pero la idea importante es que el cluster ya empiece a tener una señal explícita de cuándo esta pieza dejó de estar operativamente sana.

Ese es el corazón del `livenessProbe`.

---

## Paso 5 · Entender por qué no tienen necesariamente la misma intención

Aunque en esta primera etapa estemos usando el mismo endpoint de health como base, conviene recordar que:

- `readiness` le dice al cluster si debería mandar tráfico
- `liveness` le dice si el contenedor sigue sano o si conviene reiniciarlo

Ese matiz sigue siendo muy importante, incluso cuando la configuración inicial de ambos se parece.

---

## Paso 6 · Reaplicar el `Deployment`

Después de agregar ambas probes, reaplicá el manifiesto del servicio.

La idea es que el cluster ahora ya no vea a esta pieza solo como:

- un Pod vivo

sino como un servicio cuya disponibilidad y salud se interpretan de una forma más madura.

Este es el verdadero momento importante de la clase.

---

## Paso 7 · Observar el comportamiento del Pod

Ahora revisá cómo se comporta el Pod después del cambio.

Queremos mirar cosas como:

- si arranca normalmente,
- si tarda un poco más en considerarse listo,
- y si el cluster empieza a distinguir de forma más explícita el estado operativo del servicio.

No hace falta todavía provocar fallos artificiales.  
Con observar la nueva dinámica ya estamos aprendiendo muchísimo.

---

## Paso 8 · Revisar logs del servicio

Ahora mirá los logs.

La idea es comprobar que:

- el servicio sigue sano,
- las probes no quedaron apuntando a algo roto,
- y la aplicación realmente expone el endpoint esperado para que el cluster pueda usarlo como criterio de salud.

Este punto es muy importante porque una probe mal configurada puede romper el comportamiento operativo aunque el servicio en sí esté bien.

---

## Paso 9 · Pensar qué ganó el cluster con este cambio

A esta altura del bloque ya conviene fijar algo muy importante:

el cluster ahora ya no depende solo de “el proceso arrancó”.

Ahora tiene una señal más rica para entender:

- cuándo mandar tráfico
- y cuándo considerar que una pieza ya no está sana

Ese cambio es pequeño en YAML, pero enorme en madurez operativa.

---

## Paso 10 · Pensar qué servicios deberían seguir después

Después de esta primera implementación ya debería empezar a quedar claro que el patrón podría extenderse a otras piezas importantes como:

- `order-service`
- `notification-service`
- `config-server`
- `discovery-server`

No hace falta hacerlo todo hoy.  
Lo importante es instalar bien el criterio en una pieza principal y entender su valor.

---

## Qué estamos logrando con esta clase

Esta clase agrega uno de los refinamientos más propios del mundo Kubernetes dentro de todo el bloque.

Ya no estamos solo desplegando servicios, ni solo organizando su configuración.

Ahora el cluster empieza a leer mejor su salud real.

Eso es una mejora muy importante en la calidad operativa del entorno.

---

## Qué todavía no hicimos

Todavía no:

- extendimos las probes al resto del stack
- las ajustamos con una estrategia más fina por servicio
- ni observamos todavía el efecto del refinamiento sobre varias piezas a la vez

Todo eso puede venir después.

La meta de hoy es mucho más concreta:

**instalar correctamente el patrón de `readiness` y `liveness` en un servicio importante.**

---

## Errores comunes en esta etapa

### 1. Usar probes sin verificar que el endpoint realmente existe
Eso puede volver inestable al Pod aunque la app esté bien.

### 2. Poner tiempos demasiado agresivos
Conviene empezar razonable y ajustar después.

### 3. Olvidar que `readiness` y `liveness` no responden exactamente a la misma pregunta
Ese matiz sigue siendo clave.

### 4. Reaplicar el `Deployment` y no observar el comportamiento posterior
La clase vale por el cambio real del entorno.

### 5. Querer extenderlo a todo el stack antes de validar una primera pieza
Primero conviene instalar bien el patrón.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, al menos uno de los servicios principales de NovaMarket debería tener `readinessProbe` y `livenessProbe` aplicadas y funcionando razonablemente dentro del cluster.

Eso deja al bloque listo para seguir extendiendo este refinamiento.

---

## Punto de control

Antes de seguir, verificá que:

- elegiste un servicio relevante,
- agregaste ambas probes,
- el Pod sigue arrancando,
- los logs no muestran problemas obvios,
- y el cluster ya interpreta mejor la salud de esa pieza.

Si eso está bien, ya podemos empezar a pensar cómo extender este refinamiento al resto del entorno.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a revisar cómo se ve NovaMarket después de introducir probes en el cluster y qué servicios conviene endurecer después.

Eso nos va a permitir consolidar esta nueva etapa operativa del bloque.

---

## Cierre

En esta clase agregamos `readiness` y `liveness` a un servicio principal de NovaMarket.

Con eso, el bloque de Kubernetes da otro paso fuerte de madurez: el cluster ya no solo aloja una parte muy importante del sistema, sino que además empieza a interpretarla de forma mucho más inteligente en términos de salud y disponibilidad.
