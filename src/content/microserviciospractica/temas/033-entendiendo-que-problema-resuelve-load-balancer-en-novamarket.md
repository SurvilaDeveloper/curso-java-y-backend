---
title: "Entendiendo qué problema resuelve Load Balancer en NovaMarket"
description: "Primer tema rehaciendo el bloque posterior a la creación de api-gateway. Comprensión del rol de Load Balancer en la arquitectura actual de NovaMarket antes de definir rutas reales en el gateway."
order: 33
module: "Módulo 6 · API Gateway"
level: "intermedio"
draft: false
---

# Entendiendo qué problema resuelve Load Balancer en NovaMarket

En la clase anterior creamos **`api-gateway`** y lo dejamos listo como nuevo punto de entrada del sistema.

Eso ya es un paso muy importante, porque NovaMarket ahora tiene una pieza pensada para:

- concentrar acceso,
- representar la entrada al sistema,
- y más adelante enrutar requests hacia los microservicios correctos.

Pero si miramos la arquitectura con cuidado, todavía falta una pieza importante para que ese gateway quede realmente bien conectado con el resto del sistema:

**Load Balancer.**

Y este punto importa muchísimo, porque si no lo entendemos ahora, el bloque de gateway queda incompleto.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar claro:

- qué problema resuelve un Load Balancer dentro de NovaMarket,
- por qué no alcanza con tener `api-gateway` + Eureka + Feign,
- qué relación hay entre **service discovery** y **balanceo**,
- y por qué este tema tiene que entrar **antes** de empezar a definir rutas reales en el gateway.

Todavía no vamos a configurar rutas definitivas ni a repartir tráfico entre múltiples instancias.  
La meta de hoy es entender el problema arquitectónico correcto.

---

## Estado de partida

En este punto del curso ya tenemos:

- `config-server`
- `discovery-server`
- `catalog-service`
- `inventory-service`
- `order-service`
- y `api-gateway`

Además:

- los servicios principales ya se registran en Eureka,
- `order-service` ya consume a `inventory-service` por nombre lógico con Feign,
- y el sistema ya dejó atrás la URL fija para esa integración interna.

Eso significa que NovaMarket ya dio un salto importante:

**los servicios pueden encontrarse por nombre.**

Pero ese salto todavía no resuelve todo.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- mirar cómo está parada la arquitectura actual,
- detectar qué hueco aparece cuando el gateway quiere enrutar hacia servicios registrados,
- entender por qué discovery y load balancing no son exactamente lo mismo,
- y dejar listo el modelo mental correcto para las próximas clases.

---

## Qué problema queremos resolver exactamente

Hasta ahora, NovaMarket ya aprendió a resolver preguntas como esta:

- “¿dónde está `inventory-service`?”

Gracias a Eureka, el sistema puede encontrarlo por nombre lógico.

Pero cuando aparece `api-gateway`, empieza a surgir otra pregunta distinta:

- “si tengo un nombre lógico de servicio, ¿cómo se decide a qué instancia concreta mandar la request?”

Ahí aparece justamente el problema que resuelve Load Balancer.

---

## Por qué este tema entra justo después de crear `api-gateway`

Este punto es importantísimo.

Si el gateway recién creado fuera a enrutar usando direcciones fijas, por ejemplo:

```txt
http://localhost:8081
http://localhost:8082
http://localhost:8083
```

entonces estaríamos retrocediendo respecto de todo lo que ya construimos con Eureka.

Porque ya no tendría sentido:

- registrar servicios,
- resolver nombres lógicos,
- ni preparar la arquitectura para múltiples instancias,

si al final el gateway vuelve a depender de direcciones rígidas.

Por eso Load Balancer no es un tema lateral.

**Es la pieza que falta para que el gateway use correctamente la arquitectura que NovaMarket ya viene construyendo.**

---

## Qué resuelve realmente un Load Balancer

Un Load Balancer resuelve una idea central:

**recibir tráfico pensado para un servicio lógico y decidir a qué instancia concreta enviarlo.**

Eso permite que el sistema trabaje en dos niveles distintos:

### Nivel lógico
El consumidor piensa en:

```txt
inventory-service
catalog-service
order-service
```

### Nivel físico
La infraestructura resuelve qué instancia real responde:

- `inventory-service` instancia A
- `inventory-service` instancia B
- `inventory-service` instancia C

Ese desacople es uno de los pilares más importantes de una arquitectura de microservicios seria.

---

## Qué pasa si no tenemos Load Balancer

Si no tuviéramos Load Balancer, el gateway quedaría en una situación bastante incómoda.

Tendríamos dos caminos malos:

### Opción 1 · usar URLs fijas
Por ejemplo:

```txt
http://localhost:8082
```

Eso rompe la flexibilidad que venimos construyendo.

### Opción 2 · descubrir servicios, pero no saber cómo elegir instancia
Eso deja incompleta la resolución real del request.

En ambos casos, el gateway no queda apoyado correctamente sobre la arquitectura.

---

## Discovery no es lo mismo que Load Balancer

Este punto conviene fijarlo muy bien.

### Eureka / Discovery
Resuelve algo como:

- “existen estas instancias registradas para `inventory-service`”

### Load Balancer
Resuelve algo como:

- “de esas instancias registradas, voy a usar esta para esta request”

O sea:

- **Discovery encuentra**
- **Load Balancer decide y reparte**

Ambas piezas se complementan, pero no son lo mismo.

---

## Cómo se conecta esto con NovaMarket

Hasta ahora, en NovaMarket ya usamos nombres lógicos en una integración interna importante:

- `order-service`
- consume a
- `inventory-service`

Eso ya fue un avance enorme.

Pero cuando el gateway empiece a enrutar requests externas hacia:

- `catalog-service`
- `inventory-service`
- `order-service`

vamos a necesitar exactamente la misma lógica, pero ahora desde el punto de entrada del sistema.

Ese es el puente natural entre:

- el bloque anterior de Eureka + Feign,
- y el nuevo bloque de API Gateway.

---

## Qué cambia cuando pensamos en múltiples instancias

Por ahora, NovaMarket suele levantar una sola instancia por servicio en local.

Eso puede hacer que Load Balancer parezca innecesario a primera vista.

Pero arquitectónicamente igual importa, porque incluso con una sola instancia ya conviene construir el sistema con la lógica correcta:

- gateway apunta al **servicio lógico**
- no a una ubicación fija

Y además, en cuanto levantemos dos instancias del mismo servicio, el problema aparece de forma mucho más visible.

Por ejemplo:

- dos instancias de `inventory-service`
- ambas registradas en Eureka
- y un gateway que tiene que decidir cómo repartir tráfico

Ese escenario es justamente el que vuelve imprescindible al balanceo.

---

## Qué papel cumple Spring Cloud LoadBalancer

Dentro del stack que estamos usando, la pieza que viene a resolver esto del lado de Spring es:

**Spring Cloud LoadBalancer**

Su función es permitir que un cliente o un gateway pueda trabajar con nombres lógicos y resolver instancias registradas para repartir requests de forma controlada.

En otras palabras:

- Eureka aporta el registro,
- Spring Cloud LoadBalancer aporta la selección de instancia.

Esa combinación es la que hace posible rutas del tipo:

```txt
lb://inventory-service
```

Más adelante las vamos a usar de verdad en el gateway.

---

## Por qué `lb://` importa tanto

Esta notación resume muchísimo de lo que queremos lograr.

Cuando escribimos algo como:

```txt
lb://catalog-service
```

no estamos diciendo:

- “andá a este host y este puerto exactos”

Estamos diciendo algo mucho más arquitectónicamente correcto:

- “andá al servicio lógico `catalog-service`, y resolvé la instancia usando el mecanismo de load balancing”

Esa diferencia es enorme.

Porque deja al gateway integrado con discovery y listo para crecer hacia escenarios con múltiples instancias reales.

---

## Qué ventaja nos da esto incluso antes de escalar

Aunque por ahora levantemos una sola instancia por servicio, usar la arquitectura correcta desde el comienzo ya nos da varias ventajas:

- evita hardcodear direcciones,
- mantiene coherencia con Eureka,
- deja al gateway alineado con el resto del sistema,
- y prepara a NovaMarket para escalado horizontal sin necesidad de rehacer la lógica después.

Ese valor didáctico y técnico es enorme.

---

## Qué todavía no estamos haciendo en esta clase

Todavía no vamos a:

- agregar rutas definitivas en el gateway,
- probar `lb://...` en funcionamiento,
- levantar múltiples instancias de un servicio,
- ni observar reparto de tráfico real.

Todo eso viene en las próximas clases.

La meta de hoy es mucho más concreta:

**entender por qué Load Balancer es la pieza que faltaba para cerrar correctamente el bloque de gateway.**

---

## Qué estamos logrando con esta clase

Esta clase corrige el eje arquitectónico del curso justo en el punto correcto.

En vez de pasar directamente de “gateway creado” a “rutas hacia servicios”, primero dejamos claro algo fundamental:

**el gateway no debería pensar en puertos fijos, sino en servicios lógicos resueltos mediante discovery y balanceo.**

Eso cambia muchísimo la calidad del bloque que viene después.

---

## Errores conceptuales comunes en este punto

### 1. Pensar que Eureka ya resuelve todo por sí sola
No. Eureka registra y descubre, pero no reemplaza la necesidad de balancear.

### 2. Pensar que Load Balancer solo importa si hay muchas instancias
Importa todavía más cuando hay muchas, pero conviene construir la arquitectura correcta desde antes.

### 3. Seguir pensando el gateway con URLs fijas
Eso rompe la coherencia con el resto del sistema.

### 4. Confundir nombre lógico con dirección real
No son lo mismo, y esa diferencia es justamente el corazón de este tema.

### 5. Querer definir rutas del gateway sin resolver antes este modelo mental
Eso dejaría el bloque incompleto.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener mucho más claro:

- qué problema resuelve Load Balancer,
- por qué aparece exactamente ahora en el curso,
- cómo se relaciona con Eureka,
- y por qué `api-gateway` necesita esta pieza para enrutar correctamente hacia los servicios de NovaMarket.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés por qué no conviene enrutar desde el gateway usando puertos fijos,
- distinguís discovery de load balancing,
- ves por qué `lb://` representa mejor la arquitectura real,
- y sentís que el bloque de gateway ahora sí tiene una base conceptual correcta para seguir.

Si eso está bien, ya podemos pasar al siguiente tema y explicar con claridad los tipos de balanceo que aparecen en esta arquitectura.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a distinguir **client-side** y **server-side load balancing** y a ubicar exactamente dónde cae NovaMarket dentro de esos dos modelos antes de empezar a configurar rutas reales en el gateway.

---

## Cierre

En esta clase entendimos qué problema resuelve Load Balancer en NovaMarket.

Con eso, `api-gateway` deja de ser solo un punto de entrada recién creado y empieza a ubicarse correctamente dentro de una arquitectura donde los servicios ya no deberían encontrarse por direcciones rígidas, sino por nombres lógicos apoyados en discovery y balanceo.
