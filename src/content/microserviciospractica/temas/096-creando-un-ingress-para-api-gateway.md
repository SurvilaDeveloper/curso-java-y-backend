---
title: "Creando un Ingress para api-gateway"
description: "Primer paso concreto del refinamiento de entrada en Kubernetes. Creación del recurso Ingress para enrutar el acceso hacia api-gateway dentro del entorno de NovaMarket."
order: 96
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Creando un `Ingress` para `api-gateway`

En la clase anterior alineamos el modelo mental del siguiente paso del bloque:

- entendimos por qué una exposición simple del gateway fue útil,
- vimos por qué ya empieza a quedarse corta,
- y dejamos claro que ahora tiene sentido pasar a una capa de entrada más madura dentro de Kubernetes.

Ahora sí toca el paso concreto:

**crear el recurso `Ingress` para NovaMarket.**

La idea es muy clara:

- seguir manteniendo `api-gateway` como puerta de entrada lógica del sistema,
- pero darle una capa de acceso más expresiva, más declarativa y más propia del mundo Kubernetes.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creado un recurso `Ingress` para NovaMarket,
- conectado ese recurso al Service de `api-gateway`,
- expresada una primera regla clara de entrada,
- y preparada la infraestructura del bloque para validar el acceso al sistema a través de esta nueva capa.

Todavía no vamos a cerrar la validación fuerte del recorrido completo.  
La meta de hoy es instalar correctamente la nueva capa de entrada.

---

## Estado de partida

Partimos de un cluster donde ya tenemos:

- `api-gateway` desplegado
- su Service interno
- y una forma simple de acceso que nos permitió validar el flujo principal del negocio

Eso significa que el sistema ya tiene una puerta de entrada funcional.  
Ahora queremos volver esa entrada más madura y más coherente con Kubernetes.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- crear una carpeta o manifest específico para `Ingress`,
- definir una regla de entrada razonable,
- apuntarla al Service de `api-gateway`,
- aplicar el recurso al cluster,
- y dejarlo listo para la validación del bloque.

---

## Por qué el Ingress tiene sentido justamente ahora

Porque ya no estamos escribiendo un recurso en el vacío.

A esta altura del bloque ya tenemos:

- gateway desplegado
- servicios funcionales reales
- flujo principal validado
- y una experiencia previa de acceso simple que ya demostró su valor

Eso significa que ahora sí tenemos una arquitectura suficientemente madura como para que `Ingress` se apoye sobre algo real y útil.

---

## Paso 1 · Crear una carpeta o ubicación razonable para el recurso

Una organización razonable podría ser algo como:

```txt
k8s/base/ingress.yaml
```

o, si preferís mantenerlo más cerca del gateway:

```txt
k8s/services/api-gateway/ingress.yaml
```

Ambas opciones pueden tener sentido.  
Lo importante es que el recurso quede bien ubicado dentro de la estructura del proyecto.

---

## Paso 2 · Pensar la regla de entrada más simple y útil

Para esta etapa del curso práctico, no hace falta crear una arquitectura de entrada complejísima.

Una primera regla razonable puede ser simplemente:

- un host lógico del entorno local
- y una ruta base `/`
- apuntando al Service de `api-gateway`

La idea es empezar por algo claro y usable.

---

## Paso 3 · Crear el recurso `Ingress`

Ahora creá algo como:

```txt
k8s/services/api-gateway/ingress.yaml
```

Una base conceptual razonable podría verse así:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-gateway
  namespace: novamarket
spec:
  rules:
    - host: novamarket.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-gateway
                port:
                  number: 8080
```

No hace falta que el host sea exactamente ese si tu entorno local usa otra convención, pero sí conviene que quede claro, simple y fácil de recordar.

---

## Qué expresa este recurso

Este recurso está diciendo algo conceptualmente muy importante:

- cuando una request entre por ese host
- y por esa ruta
- Kubernetes debe enrutarla hacia el Service de `api-gateway`

Eso deja mucho más explícita la capa de entrada del sistema que una exposición simple del Service.

---

## Paso 4 · Pensar el rol del Ingress Controller

Igual que marcamos en la clase anterior, este recurso necesita convivir con un Ingress Controller dentro del entorno.

No hace falta que esta clase se convierta todavía en una guía exhaustiva del controlador.  
Lo importante es asumir que:

- el manifest ya expresa la intención
- y el controlador es la pieza que hace operativa esa intención dentro del cluster

Ese vínculo es fundamental para entender el bloque.

---

## Paso 5 · Aplicar el recurso

Ahora aplicá el manifest de `Ingress` dentro del namespace `novamarket`.

La idea es que el cluster ya no tenga solo un gateway desplegado y un Service interno, sino también una regla explícita de entrada que lo apunte como backend.

Este es un paso muy importante del bloque.

---

## Paso 6 · Verificar que el recurso exista

Después de aplicarlo, comprobá que el `Ingress` ya forme parte real del namespace.

No hace falta todavía hacer una validación completa del recorrido.  
Primero queremos confirmar que la nueva capa de entrada ya existe como recurso del cluster.

---

## Paso 7 · Pensar cómo convive esto con el Service del gateway

Este punto importa bastante.

No estamos eliminando el Service de `api-gateway`.  
Al contrario:

- el Service sigue siendo el punto estable de acceso interno
- y el Ingress pasa a ser la capa declarativa que enruta tráfico de entrada hacia ese Service

Ese encastre es una de las ideas más importantes de esta etapa.

---

## Paso 8 · Entender por qué esta capa es más madura

A esta altura del curso, una lectura útil sería esta:

- antes exponíamos la pieza directamente
- ahora describimos cómo se entra al sistema y hacia qué backend se enruta

Ese cambio es muy importante porque vuelve la entrada del sistema:

- más clara
- más declarativa
- y más alineada con el modo de pensar propio de Kubernetes

Eso es justamente lo que queríamos lograr.

---

## Paso 9 · Pensar qué todavía no estamos resolviendo

Conviene mantener esto muy claro.

### Sí estamos resolviendo
- una capa de entrada más rica
- una regla explícita hacia el gateway
- una arquitectura más madura de acceso al sistema

### Todavía no estamos resolviendo
- una estrategia final de producción
- TLS completo
- múltiples reglas más complejas
- ni todas las variantes posibles de exposición

Eso está bien.  
Para este momento del curso, esta primera capa ya aporta muchísimo valor.

---

## Qué estamos logrando con esta clase

Esta clase le da a NovaMarket una nueva capa real dentro del cluster:

**un `Ingress` que empieza a describir de forma mucho más madura cómo se entra al sistema.**

Ya no estamos resolviendo el acceso solo con una solución directa de prueba.  
Ahora el entorno empieza a tener una arquitectura de entrada más propia del mundo Kubernetes.

---

## Qué todavía no hicimos

Todavía no:

- validamos de punta a punta el sistema entrando por esta nueva capa
- comparamos operativamente el resultado con la exposición simple anterior
- ni cerramos todavía el nuevo checkpoint del bloque

Todo eso viene en la próxima clase.

La meta de hoy es mucho más concreta:

**instalar el recurso y dejar la nueva capa lista.**

---

## Errores comunes en esta etapa

### 1. Pensar que el Ingress reemplaza el Service
En realidad se apoya sobre él.

### 2. Escribir una regla demasiado compleja para la primera versión
Conviene empezar simple y útil.

### 3. Olvidar el namespace
Eso rompe la coherencia del bloque rápidamente.

### 4. Aplicar el recurso y no verificar que existe
Siempre conviene revisar el estado real en el cluster.

### 5. Perder de vista por qué este paso tiene valor
No se trata de “otro YAML más”, sino de una capa más madura de entrada.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, NovaMarket debería tener un recurso `Ingress` que enruta el acceso hacia `api-gateway`, dejando al sistema listo para una validación mucho más madura de su capa de entrada dentro de Kubernetes.

Eso prepara perfectamente el siguiente checkpoint.

---

## Punto de control

Antes de seguir, verificá que:

- el recurso `Ingress` existe,
- apunta al Service de `api-gateway`,
- está en el namespace correcto,
- y ya representa una capa de entrada más madura del sistema.

Si eso está bien, ya podemos validar el entorno entrando por esta nueva capa.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar el acceso al sistema usando el `Ingress`, y vamos a comparar el resultado con la estrategia de entrada anterior.

Ese será un checkpoint muy valioso para consolidar esta nueva etapa del bloque.

---

## Cierre

En esta clase creamos un `Ingress` para `api-gateway`.

Con eso, NovaMarket empieza a tener dentro de Kubernetes una capa de entrada mucho más expresiva y alineada con la forma en que este entorno suele organizar el acceso al sistema.
