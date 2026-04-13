---
title: "Balanceo de carga con Spring Cloud LoadBalancer"
description: "Cómo distribuir requests entre múltiples instancias de un servicio en una arquitectura con Eureka, OpenFeign y Spring Cloud LoadBalancer, aplicándolo al flujo principal de NovaMarket."
order: 12
module: "Módulo 3 · Service Discovery e invocaciones REST"
level: "base"
draft: false
---

# Balanceo de carga con Spring Cloud LoadBalancer

En la clase anterior incorporamos **OpenFeign** para que `order-service` pueda consumir a `inventory-service` usando un cliente declarativo, sin hardcodear URLs en cada llamada.

Ese avance ya nos permitió escribir una comunicación más limpia y más alineada con la idea de microservicios. Pero todavía falta responder una pregunta fundamental:

**¿qué pasa cuando un mismo servicio tiene varias instancias corriendo al mismo tiempo?**

En una arquitectura distribuida real, eso es completamente normal.

Por ejemplo, en NovaMarket podríamos tener:

- dos o tres instancias de `inventory-service`,
- varias instancias de `catalog-service`,
- una o más instancias de `order-service`,
- y un gateway enviando tráfico a esos servicios según disponibilidad.

En ese contexto, no alcanza con “descubrir” que un servicio existe. También hace falta decidir **a qué instancia concreta** se le va a mandar cada request.

Ahí entra en juego el **balanceo de carga del lado cliente**.

---

## Qué problema resuelve el balanceo de carga

Supongamos que `inventory-service` tiene tres instancias registradas en Eureka:

- `inventory-service:8081`
- `inventory-service:8082`
- `inventory-service:8083`

Cuando `order-service` necesita consultar stock, no debería elegir una instancia fija para siempre.

Si hiciera eso:

- una instancia recibiría toda la carga,
- las demás quedarían subutilizadas,
- una caída puntual rompería el flujo,
- y la arquitectura perdería parte del beneficio de tener varias instancias.

El balanceo de carga permite repartir las requests entre instancias disponibles según una estrategia determinada.

---

## Balanceo del lado servidor vs. balanceo del lado cliente

Conviene distinguir dos enfoques.

### Balanceo del lado servidor
Un componente externo recibe tráfico y decide a qué instancia enviarlo.

Ejemplos típicos:

- Nginx
- HAProxy
- balanceadores cloud
- ingress controllers

### Balanceo del lado cliente
El propio cliente que va a hacer la llamada resuelve qué instancia usar.

Eso significa que:

- consulta el registro de servicios,
- conoce las instancias disponibles,
- elige una según cierta estrategia,
- y realiza la request directamente.

En el ecosistema Spring Cloud, cuando combinamos:

- **Eureka**
- **OpenFeign**
- **Spring Cloud LoadBalancer**

estamos trabajando con balanceo **del lado cliente**.

---

## Qué es Spring Cloud LoadBalancer

`Spring Cloud LoadBalancer` es el componente que se encarga de seleccionar una instancia concreta de un servicio cuando el cliente llama por nombre lógico.

Por ejemplo, si desde `order-service` hacemos una llamada hacia:

```text
http://inventory-service/api/inventory/check
```

el nombre `inventory-service` no representa una URL única ni una sola máquina. Representa un **servicio lógico** con una o varias instancias registradas.

LoadBalancer toma ese nombre lógico, obtiene las instancias disponibles y elige una.

---

## Relación entre Eureka, Feign y LoadBalancer

Estas tres piezas cumplen roles distintos.

### Eureka
Se encarga de registrar y exponer qué instancias existen.

### OpenFeign
Permite declarar clientes HTTP de manera expresiva y limpia.

### Spring Cloud LoadBalancer
Decide qué instancia concreta va a atender la request.

Una forma simple de verlo es esta:

1. `order-service` quiere llamar a `inventory-service`,
2. Feign construye la llamada,
3. LoadBalancer pide las instancias disponibles,
4. Eureka devuelve la lista,
5. LoadBalancer elige una,
6. Feign ejecuta la request contra esa instancia.

---

## Por qué esto es importante en NovaMarket

Nuestro flujo principal sigue siendo el mismo:

**consultar catálogo → crear orden → validar stock → registrar orden → publicar evento → notificar**

En ese flujo, `order-service` depende de `inventory-service` para saber si hay stock disponible.

Si `inventory-service` tiene varias instancias, queremos que:

- la carga se reparta,
- las requests no se concentren en un único nodo,
- y la arquitectura soporte mejor el crecimiento.

Eso convierte al balanceo en una mejora real del sistema, no en un agregado decorativo.

---

## Estrategias de selección de instancias

El balanceo no significa solamente “mandar requests a distintas máquinas”. También implica definir **cómo** se eligen.

### Round Robin
Es la estrategia más conocida.

Si hay tres instancias:

1. la primera request va a la instancia A,
2. la segunda a la instancia B,
3. la tercera a la instancia C,
4. la cuarta vuelve a A.

Es simple, predecible y suficiente para muchos casos.

### Random
Cada request se envía a una instancia elegida aleatoriamente entre las disponibles.

Puede ser útil para ciertos escenarios sencillos, aunque no ofrece un reparto tan ordenado como Round Robin.

### Estrategias personalizadas
En sistemas más complejos se puede querer:

- elegir por zona,
- priorizar ciertas instancias,
- usar metadata,
- o aplicar pesos.

Pero eso ya pertenece a un nivel más avanzado.

En este curso vamos a concentrarnos primero en lo que realmente aporta comprensión arquitectónica: **entender la necesidad del balanceo y su integración con discovery**.

---

## Qué cambia cuando dejamos de pensar en una sola instancia

Mientras trabajamos con una única instancia de cada servicio, es fácil caer en una ilusión:

“el servicio” parece ser una sola cosa concreta.

Pero en producción, normalmente un servicio es:

- un nombre lógico,
- varias instancias posibles,
- direcciones que cambian,
- y un estado dinámico.

Eso cambia nuestra forma de diseñar.

Ya no pensamos en:

- “llamar a `localhost:8081`”

Sino en:

- “llamar a `inventory-service` y dejar que la infraestructura resuelva la instancia correcta”.

Ese cambio mental es una parte central de la arquitectura distribuida.

---

## Una evolución típica en el curso

En NovaMarket, la comunicación entre servicios va madurando paso a paso.

### Etapa 1
Llamadas directas con URLs fijas.

### Etapa 2
Discovery con Eureka.

### Etapa 3
Clientes declarativos con Feign.

### Etapa 4
Balanceo automático entre instancias del mismo servicio.

Esa progresión es valiosa porque permite entender que cada herramienta aparece para resolver una limitación de la etapa anterior.

---

## Ejemplo conceptual en NovaMarket

Supongamos que `order-service` recibe esta solicitud:

```json
{
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 2, "quantity": 1 }
  ]
}
```

Antes de registrar la orden, tiene que verificar stock.

Si existen varias instancias de `inventory-service`, el flujo podría verse así:

1. `order-service` invoca a `inventory-service` por nombre lógico,
2. LoadBalancer resuelve las instancias registradas,
3. elige una según la estrategia configurada,
4. la request se ejecuta contra esa instancia,
5. `order-service` recibe la respuesta y continúa.

Desde el punto de vista del código del cliente, el servicio sigue siendo uno solo. Pero desde el punto de vista operativo, ya existe una **distribución real de carga**.

---

## Qué beneficios aporta

### Mejor aprovechamiento de instancias
Si hay varias instancias, las requests no quedan pegadas a una sola.

### Mayor tolerancia operativa
Si una instancia desaparece del registro, las demás siguen disponibles.

### Mejor escalabilidad
Podemos agregar instancias de un servicio sin tener que reescribir clientes para cada dirección nueva.

### Menor acoplamiento a infraestructura concreta
El cliente no necesita conocer puertos, hosts ni topología exacta.

---

## Qué no resuelve por sí solo

El balanceo no reemplaza otros mecanismos importantes.

No resuelve por sí mismo:

- timeouts,
- retry,
- circuit breaker,
- errores de negocio,
- saturación severa,
- observabilidad,
- seguridad.

Es una pieza importante, pero no completa la robustez del sistema por sí sola.

Por ejemplo, si todas las instancias de `inventory-service` están lentas o fallando, balancear entre ellas no arregla el problema. Solo distribuye tráfico entre instancias con dificultades.

---

## Cuándo consumir por URL y cuándo por nombre lógico

Esta es una distinción que conviene tener muy clara.

### Consumir por URL fija
Puede servir en:

- pruebas locales rápidas,
- ejemplos simples,
- integraciones temporales,
- escenarios muy controlados.

Pero escala mal cuando hay:

- varias instancias,
- cambios de infraestructura,
- discovery dinámico,
- despliegues frecuentes.

### Consumir por nombre lógico de servicio
Es el enfoque natural cuando ya tenemos:

- un servidor de descubrimiento,
- clientes distribuidos,
- varias instancias,
- una arquitectura más madura.

En NovaMarket, a partir de este punto, ese debería ser el camino principal.

---

## Cómo se conecta esto con lo que viene después

Hasta ahora, nuestros servicios todavía pueden estar siendo accedidos de manera bastante directa.

Pero en una arquitectura real, tarde o temprano aparece otra necesidad:

**tener un punto de entrada único para todo el sistema**.

¿Por qué?

Porque no queremos que cada cliente externo conozca:

- todos los servicios internos,
- sus rutas,
- sus puertos,
- y su topología.

Además, queremos un lugar donde centralizar:

- seguridad,
- logging,
- filtros,
- reescritura de paths,
- correlación,
- políticas transversales.

Ese problema nos va a llevar al siguiente gran componente de la arquitectura: el **API Gateway**.

---

## Errores conceptuales comunes

### Pensar que Eureka ya “balancea” por sí solo
Eureka registra y expone instancias. La selección concreta la hace el cliente junto con el mecanismo de load balancing.

### Creer que el balanceo solo importa en producción
Importa sobre todo cuando pensamos arquitectura. Aunque en local haya una sola instancia, el diseño tiene que prepararse para más de una.

### Asociar balanceo únicamente con herramientas externas
En microservicios, el balanceo del lado cliente es una estrategia muy importante y muy común.

### Confundir disponibilidad con resiliencia completa
Tener varias instancias ayuda, pero no reemplaza mecanismos como Circuit Breaker o Retry.

---

## Cierre

Spring Cloud LoadBalancer permite que una aplicación cliente distribuya requests entre varias instancias de un mismo servicio usando su **nombre lógico** en lugar de una dirección fija.

En combinación con Eureka y OpenFeign, esto hace que NovaMarket avance desde llamadas simples hacia una comunicación más realista y más propia de una arquitectura distribuida.

La idea importante de esta clase no es solo “aprender una librería”, sino entender que en microservicios un servicio no es una máquina concreta, sino una capacidad representada por un nombre y sostenida por múltiples instancias posibles.

En la próxima clase vamos a dar otro paso importante: incorporar un **API Gateway** para que NovaMarket tenga un punto de entrada único y más controlado.
