---
title: "Entendiendo por qué ConfigMap y Secret ya tienen sentido"
description: "Inicio del siguiente refinamiento del bloque de Kubernetes en NovaMarket. Comprensión de por qué, después de reconstruir el sistema y su entrada, ya conviene externalizar configuración con ConfigMap y Secret."
order: 98
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Entendiendo por qué `ConfigMap` y `Secret` ya tienen sentido

En las últimas clases del bloque de Kubernetes logramos algo muy importante:

- llevamos al cluster el núcleo base del sistema,
- reconstruimos buena parte de la capa funcional,
- validamos el flujo principal entrando por `api-gateway`,
- y además refinamos la entrada con `Ingress`.

Eso deja a NovaMarket en un punto muy interesante:

**el sistema ya vive de forma bastante real dentro del cluster.**

Y justamente por eso ahora aparece una necesidad nueva:

**ordenar mejor la configuración de los servicios.**

Porque una cosa es desplegar un `Deployment` con lo mínimo necesario para que la aplicación arranque.  
Y otra distinta es tener una estrategia más madura para manejar:

- configuración no sensible,
- configuración sensible,
- y diferencias razonables de entorno dentro de Kubernetes.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- claro por qué la configuración ya no conviene vivir dispersa dentro de los manifests,
- entendida la diferencia de rol entre `ConfigMap` y `Secret`,
- alineado el modelo mental del bloque para el siguiente paso práctico,
- y preparado el terreno para externalizar configuración de NovaMarket de una forma más propia del mundo Kubernetes.

Todavía no vamos a crear los recursos concretos.  
La meta de hoy es entender por qué ahora sí tiene sentido hacerlo.

---

## Estado de partida

Partimos de un cluster donde ya viven piezas muy importantes del sistema:

- `config-server`
- `discovery-server`
- `catalog-service`
- `inventory-service`
- `order-service`
- `notification-service`
- `api-gateway`

Además, el sistema ya fue usado entrando por su capa natural de acceso dentro del cluster.

Eso significa que Kubernetes ya dejó de ser una simple maqueta de despliegue.  
Ahora es un entorno donde realmente empieza a importar **cómo** configuramos los servicios.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué problema aparece cuando la configuración queda demasiado embebida en los `Deployment`,
- entender qué tipo de datos encajan mejor en `ConfigMap`,
- entender qué tipo de datos conviene mover a `Secret`,
- y dejar una estrategia coherente para aplicarlo a NovaMarket en las próximas clases.

---

## Qué problema queremos resolver exactamente

Hasta ahora, para poder avanzar en el bloque, es bastante natural que varios `Deployment` hayan quedado con:

- variables de entorno escritas directamente,
- referencias internas repetidas,
- o configuración sensible y no sensible todavía demasiado mezclada.

Eso sirve para avanzar rápido, pero a medida que el sistema madura empiezan a aparecer varias incomodidades:

- cuesta leer qué parte del manifiesto es despliegue y qué parte es configuración,
- se repiten valores entre servicios,
- se vuelve más incómodo cambiar configuraciones sin tocar demasiado el `Deployment`,
- y la separación entre datos sensibles y no sensibles empieza a quedar borrosa.

Esa es justamente la fricción que vamos a empezar a resolver.

---

## Por qué este paso tiene sentido justamente ahora

Porque antes de este punto del bloque todavía estábamos en una etapa bastante más básica:

- lograr que el servicio viva,
- lograr que el cluster lo sostenga,
- lograr que el flujo principal responda,
- lograr que el gateway y luego el `Ingress` funcionen.

Ahora, en cambio, ya conseguimos bastante de eso.

Eso hace que el siguiente refinamiento natural ya no sea “otro servicio más”, sino:

**hacer más madura la forma en que viven los que ya están desplegados.**

---

## Qué tipo de configuración ya empieza a aparecer en NovaMarket

A esta altura del proyecto ya tenemos varios ejemplos claros de configuración que los servicios pueden necesitar:

- URL de `config-server`
- URL de `discovery-server`
- host del broker
- referencias a `zipkin`
- perfiles activos
- nombres de servicios internos
- y, según la pieza, también datos más delicados relacionados con credenciales o secretos

No todo eso debe tratarse igual.  
Y ahí es donde empieza a tener mucho sentido separar `ConfigMap` de `Secret`.

---

## Qué rol cumple `ConfigMap`

Para este curso práctico, una forma muy útil de pensar `ConfigMap` es esta:

**un lugar para externalizar configuración no sensible que queremos mantener fuera del `Deployment`.**

Eso puede incluir cosas como:

- hosts internos
- nombres de servicios
- valores de configuración de aplicación
- perfiles
- parámetros operativos que no son secretos

El gran valor está en que el `Deployment` deja de cargar con toda esa información de forma embebida y empieza a enfocarse mejor en describir cómo corre el servicio.

---

## Qué rol cumple `Secret`

`Secret` entra a jugar cuando el tipo de dato cambia.

No estamos hablando de cualquier configuración.  
Estamos hablando de datos que conviene tratar con más cuidado, por ejemplo:

- credenciales
- passwords
- tokens
- client secrets
- datos sensibles de integración

No hace falta convertir esta clase en una discusión exhaustiva de seguridad avanzada.  
Lo importante es instalar una idea muy clara:

**no toda la configuración merece el mismo tratamiento.**

---

## Paso 1 · Separar mentalmente despliegue y configuración

Este es uno de los puntos más importantes de la clase.

Hasta ahora, muchos `Deployment` pueden haberse sentido como una mezcla de:

- contenedor
- puertos
- réplicas
- y un montón de variables de entorno

A medida que el sistema madura, conviene que empiecen a verse más así:

- el `Deployment` describe cómo corre el servicio
- y la configuración vive en recursos más apropiados

Ese cambio de orden vale muchísimo.

---

## Paso 2 · Identificar configuración no sensible en NovaMarket

Una forma razonable de empezar a mirar el proyecto es preguntarse:

**¿qué valores claramente no sensibles se están repitiendo o podrían vivir fuera del `Deployment`?**

Por ejemplo, suelen aparecer cosas como:

- `CONFIG_SERVER_URL`
- `EUREKA_SERVER_URL`
- `SPRING_PROFILES_ACTIVE`
- nombres o hosts internos de infraestructura

Todo eso es excelente candidato para `ConfigMap`.

---

## Paso 3 · Identificar configuración sensible en NovaMarket

La siguiente pregunta natural es:

**¿qué valores no deberían seguir tratados como texto común dentro de manifests o variables embebidas?**

Ahí empiezan a aparecer candidatos como:

- client secret de OAuth
- passwords de integración
- credenciales de infraestructura
- datos más delicados del ecosistema

Todo eso empieza a empujar naturalmente hacia `Secret`.

---

## Paso 4 · Entender por qué esto mejora el bloque

Este paso no es solo “orden estético”.

Aporta varias cosas muy valiosas:

- manifiestos más legibles,
- menos mezcla entre despliegue y configuración,
- una base mejor para seguir escalando el sistema en Kubernetes,
- y una separación más madura entre datos comunes y datos sensibles.

En otras palabras:

**hace que el cluster se sienta menos improvisado y más operable.**

---

## Paso 5 · Pensar qué servicios se beneficiarían primero

No todos los servicios necesitan exactamente el mismo nivel de refinamiento al mismo tiempo.

Pero, a esta altura del bloque, algunos candidatos muy naturales para empezar son:

- `api-gateway`
- `order-service`
- `notification-service`

¿Por qué?

Porque son piezas con más contexto de entorno, más integración con otras capas del sistema y más probabilidad de tener variables que convenga externalizar mejor.

---

## Paso 6 · Entender por qué no hicimos esto antes

Igual que con `Ingress`, este paso tiene mucho más sentido ahora que al principio del bloque.

Antes necesitábamos:

- que los servicios vivieran,
- que el flujo se reconstruyera,
- que el gateway funcionara,
- que el sistema fuera accesible.

Ahora que eso ya existe, recién ahí aparece con fuerza el refinamiento de configuración.

Eso mantiene la coherencia del curso y evita meter demasiadas preocupaciones a la vez demasiado pronto.

---

## Qué estamos logrando con esta clase

Esta clase no crea todavía un `ConfigMap` ni un `Secret`, pero hace algo muy importante:

**prepara el siguiente salto de madurez del bloque de Kubernetes.**

Ahora el foco ya no está solo en “qué servicios viven en el cluster”, sino también en:

- cómo se configuran,
- cómo se organizan sus datos,
- y cómo evitamos que el despliegue se vuelva desordenado.

---

## Qué todavía no hicimos

Todavía no:

- creamos el primer `ConfigMap`
- movimos variables concretas fuera de un `Deployment`
- ni introdujimos un `Secret` real dentro del bloque

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender bien por qué ahora sí tiene sentido hacerlo.**

---

## Errores comunes en esta etapa

### 1. Pensar que `ConfigMap` y `Secret` son solo “otra forma de poner variables”
En realidad ayudan a ordenar mucho mejor la arquitectura del despliegue.

### 2. Mezclar datos sensibles y no sensibles sin criterio
Justamente queremos empezar a separar eso.

### 3. Introducir estos recursos demasiado pronto
Ahora tienen sentido porque el sistema ya está bastante reconstruido.

### 4. Creer que este paso reemplaza a `config-server`
No; cumple otro rol dentro del entorno Kubernetes.

### 5. No distinguir despliegue de configuración
Ese cambio mental es el corazón de esta etapa.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener claro por qué NovaMarket ya está listo para empezar a externalizar mejor su configuración en Kubernetes usando `ConfigMap` y `Secret`.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué problema trae embutir demasiada configuración en los `Deployment`,
- distinguís datos sensibles de no sensibles,
- entendés el rol general de `ConfigMap`,
- entendés el rol general de `Secret`,
- y ves por qué este refinamiento tiene sentido ahora.

Si eso está bien, ya podemos crear el primer `ConfigMap` del bloque.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a crear un `ConfigMap` para NovaMarket y usarlo en uno de los servicios ya desplegados.

Ese será el primer paso concreto para externalizar configuración no sensible dentro del cluster.

---

## Cierre

En esta clase entendimos por qué `ConfigMap` y `Secret` ya tienen sentido en NovaMarket.

Con eso, el bloque de Kubernetes queda listo para dar un nuevo paso de madurez: dejar de pensar solo en servicios desplegados y empezar a pensar también en cómo viven configurados dentro del cluster.
