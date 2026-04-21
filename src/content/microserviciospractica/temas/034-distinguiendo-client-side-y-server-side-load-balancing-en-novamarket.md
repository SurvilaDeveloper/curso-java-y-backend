---
title: "Distinguiendo client-side y server-side load balancing en NovaMarket"
description: "Segundo tema del bloque rehecho de API Gateway. Diferencia entre client-side y server-side load balancing, y ubicación exacta de NovaMarket dentro de esos modelos."
order: 34
module: "Módulo 6 · API Gateway"
level: "intermedio"
draft: false
---

# Distinguiendo client-side y server-side load balancing en NovaMarket

En la clase anterior dejamos claro algo muy importante:

- `api-gateway` no debería pensar en puertos fijos,
- Eureka por sí sola no alcanza para resolver el viaje completo hacia una instancia,
- y **Load Balancer** es la pieza que falta para que el gateway quede bien apoyado sobre la arquitectura actual de NovaMarket.

Ahora toca ordenar mejor el mapa conceptual.

Porque cuando se habla de balanceo en microservicios, aparecen dos modelos que conviene distinguir muy bien:

- **client-side load balancing**
- **server-side load balancing**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar claro:

- qué significa client-side load balancing,
- qué significa server-side load balancing,
- qué ventajas y límites tiene cada enfoque,
- y dónde cae exactamente NovaMarket con el stack que ya venimos construyendo.

Todavía no vamos a tocar configuración real del gateway.  
La meta de hoy es ubicar correctamente la arquitectura actual antes de empezar a implementarla.

---

## Estado de partida

En este punto ya tenemos:

- `config-server`
- `discovery-server`
- `catalog-service`
- `inventory-service`
- `order-service`
- `api-gateway`

Además:

- `catalog-service`, `inventory-service` y `order-service` ya se registran en Eureka,
- `order-service` ya consume a `inventory-service` por nombre lógico,
- y el gateway ya existe, aunque todavía no enruta tráfico real.

Eso significa que la arquitectura ya tiene casi todas las piezas necesarias para trabajar con balanceo serio.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- separar con claridad los dos grandes modelos de balanceo,
- relacionarlos con lo que ya hicimos en `order-service`,
- relacionarlos con lo que viene en `api-gateway`,
- y dejar claro por qué NovaMarket, en este punto del curso, cae principalmente en el modelo **client-side**.

---

## Por qué esta distinción importa

A veces se dice “hay balanceo” como si fuera una sola cosa.

Pero no es lo mismo:

- que un cliente reciba la lista de instancias y elija una,
- a que exista un componente intermedio que reciba el tráfico y lo reparta él mismo.

La diferencia parece sutil al principio, pero cambia bastante cómo entendemos la arquitectura.

---

## Qué es server-side load balancing

En **server-side load balancing**, el cliente no decide a qué instancia concreta va.

El cliente le pega a un punto intermedio, y ese punto intermedio reparte.

Por ejemplo:

1. el cliente manda la request a un balanceador
2. el balanceador conoce varias instancias del servicio
3. el balanceador elige una
4. la request llega a esa instancia

En este modelo, la inteligencia principal del reparto está del lado del servidor o del proxy intermediario.

---

## Ejemplo mental de server-side balance balancing

Imaginemos algo así:

```txt
Cliente -> Balanceador -> inventory-service instancia A
                       -> inventory-service instancia B
                       -> inventory-service instancia C
```

El cliente no sabe nada de A, B o C.

Solo sabe que le pega a un punto estable.

Ese punto estable puede ser, por ejemplo:

- un reverse proxy,
- un load balancer externo,
- un ingress,
- o una pieza de infraestructura equivalente.

---

## Qué es client-side load balancing

En **client-side load balancing**, la decisión no la toma un balanceador central externo al cliente.

La toma el propio consumidor de la request o una librería dentro de él.

El flujo mental sería algo así:

1. el cliente resuelve qué instancias existen para un servicio lógico
2. el cliente elige una
3. la request sale directamente hacia esa instancia

En este modelo, parte importante de la inteligencia del balanceo vive del lado consumidor.

---

## Ejemplo mental de client-side load balancing

Sería algo así:

```txt
Cliente -> descubre inventory-service
Cliente -> ve A, B y C
Cliente -> elige B
Cliente -> llama directamente a B
```

Acá ya no hay un balanceador “en el medio” tomando la decisión principal.

La decisión vive del lado del cliente o de la librería que usa ese cliente.

---

## Qué modelo ya apareció en NovaMarket antes del gateway

Este punto es muy importante.

Cuando `order-service` pasó a consumir `inventory-service` por nombre lógico con Feign, la arquitectura ya se acercó bastante al modelo de **client-side load balancing**.

¿Por qué?

Porque `order-service` no quedó dependiendo de una URL fija.

En cambio, quedó apoyado en:

- un nombre lógico,
- discovery,
- y una pieza de balanceo/resolución del lado del cliente.

O sea: incluso antes de tocar el gateway, NovaMarket ya venía caminando hacia ese modelo.

---

## Dónde cae `api-gateway` dentro de esta discusión

Esto es lo que más importa para el curso ahora.

Aunque `api-gateway` reciba tráfico “desde afuera” y parezca una pieza intermedia, dentro del sistema sigue comportándose como un **cliente** de los microservicios downstream.

Por ejemplo, cuando enrute a:

- `catalog-service`
- `inventory-service`
- `order-service`

el gateway está actuando como consumidor de esos servicios.

Entonces, si el gateway usa rutas como:

```txt
lb://catalog-service
```

la lógica que entra en juego sigue siendo client-side load balancing:

- el gateway descubre instancias,
- elige una,
- y envía la request.

Esa idea es importantísima.

---

## Entonces, ¿NovaMarket usa client-side o server-side?

En el punto del curso donde estamos ahora, la respuesta correcta es:

**principalmente client-side load balancing.**

¿Por qué?

Porque tanto:

- `order-service` cuando consume a `inventory-service`
- como `api-gateway` cuando enrute a los servicios

van a usar una lógica donde el consumidor resuelve el nombre lógico y selecciona instancia apoyado en Spring Cloud LoadBalancer.

Eso encaja claramente mejor con el modelo client-side.

---

## ¿Eso significa que server-side no importa?

No.

Significa solamente que **no es el modelo principal que estamos construyendo ahora mismo dentro de la aplicación Spring**.

Más adelante, cuando el proyecto entre con más fuerza en:

- Kubernetes,
- Services,
- Ingress,
- o balanceadores externos,

puede aparecer también una capa de server-side load balancing a otro nivel de la arquitectura.

Pero eso es otra capa del problema.

En este bloque del curso, la pieza que estamos construyendo con Spring Cloud es principalmente client-side.

---

## Por qué esta distinción mejora el entendimiento del gateway

Si no hacemos esta distinción, el gateway puede quedar mal entendido.

Podría parecer que:

- “como el gateway recibe requests externas, entonces automáticamente ya es el balanceador”

Y no necesariamente.

Dentro de NovaMarket, el gateway sigue necesitando:

- descubrir servicios,
- resolver instancias,
- y apoyarse en una librería de balanceo para elegir a cuál mandar cada request.

Eso es exactamente el tipo de comportamiento que nos importa entender ahora.

---

## Cómo encaja Spring Cloud LoadBalancer en este mapa

Spring Cloud LoadBalancer encaja precisamente como la pieza de **client-side load balancing** dentro del stack Spring.

Su función es ayudar a componentes consumidores, como:

- Feign
- Gateway
- u otros clientes

a trabajar con nombres lógicos y elegir instancias registradas.

Eso es lo que convierte algo como:

```txt
lb://inventory-service
```

en una resolución concreta hacia una instancia real.

---

## Qué pasa cuando hay una sola instancia

A veces se piensa:

- “si solo tengo una instancia, entonces esto da igual”

Pero no da igual.

Incluso con una sola instancia, seguir usando el modelo correcto ya tiene muchísimo valor:

- evita hardcodear ubicaciones,
- deja el gateway alineado con Eureka,
- y hace que escalar después no implique reescribir todo.

Cuando haya dos o más instancias, el balanceo se vuelve más visible.  
Pero la decisión de arquitectura correcta conviene tomarla desde antes.

---

## Qué gana NovaMarket al entender esto ahora

Entender bien esta distinción antes de tocar configuración real del gateway tiene muchísimo valor porque:

- evita meter rutas correctas por casualidad pero mal entendidas,
- deja claro qué papel juega cada pieza,
- y hace que el bloque de Load Balancer no quede como un parche, sino como una continuidad natural del bloque de Eureka + Feign.

Eso mejora mucho la calidad del curso.

---

## Qué todavía no estamos haciendo en esta clase

Todavía no vamos a:

- agregar dependencia de LoadBalancer al gateway,
- configurar `lb://` en `api-gateway.yml`,
- probar rutas a catálogo, inventario y órdenes,
- ni levantar múltiples instancias reales.

Todo eso viene enseguida.

La meta de hoy es mucho más concreta:

**ubicar con precisión qué tipo de balanceo estamos construyendo en NovaMarket.**

---

## Qué estamos logrando con esta clase

Esta clase ordena el mapa conceptual del bloque rehecho.

Ya no solo sabemos que “falta Load Balancer”.  
Ahora también sabemos **qué clase de balanceo** estamos incorporando y por qué encaja exactamente con la arquitectura que ya venimos construyendo.

Eso deja la base mucho más firme para la parte práctica.

---

## Errores conceptuales comunes en este punto

### 1. Pensar que todo load balancing es igual
No. Client-side y server-side cambian bastante dónde vive la decisión.

### 2. Creer que el gateway ya resuelve todo por existir
No. El gateway necesita apoyarse en discovery y balanceo para enrutar bien.

### 3. No reconocer que `order-service` ya anticipó este modelo
El bloque de Feign por nombre lógico ya preparó parte del terreno.

### 4. Pensar que server-side queda descartado para siempre
No; simplemente no es el foco principal del bloque actual.

### 5. Querer configurar rutas con `lb://` sin entender antes este modelo
Eso dejaría la práctica mucho más frágil conceptualmente.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder decir con claridad:

- qué diferencia hay entre client-side y server-side load balancing,
- por qué NovaMarket cae ahora principalmente en el modelo client-side,
- y por qué eso importa antes de empezar a configurar el gateway de verdad.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- distinguís discovery de balanceo,
- distinguís client-side de server-side,
- entendés que el gateway actúa como cliente de los microservicios downstream,
- y ves por qué Spring Cloud LoadBalancer entra exactamente ahora en el curso.

Si eso está bien, ya podemos pasar a integrarlo de forma real en `api-gateway`.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a integrar **Spring Cloud LoadBalancer** en `api-gateway` y dejar al gateway listo para empezar a usar rutas con `lb://` apoyadas en Eureka.

---

## Cierre

En esta clase distinguimos client-side y server-side load balancing en NovaMarket.

Con eso, el bloque rehecho del gateway gana una base conceptual mucho más sólida y deja preparado el paso práctico más importante que viene ahora: integrar el balanceo real en el punto de entrada del sistema.
