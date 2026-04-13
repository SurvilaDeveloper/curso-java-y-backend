---
title: "Invocaciones REST entre microservicios"
description: "Análisis de la comunicación REST entre microservicios en NovaMarket, sus ventajas, limitaciones y problemas frecuentes en entornos distribuidos antes de introducir OpenFeign."
order: 10
module: "Módulo 3 · Service Discovery e invocaciones REST"
level: "base"
draft: false
---

# Invocaciones REST entre microservicios

En la clase anterior configuramos **Eureka Server** y registramos los servicios de NovaMarket como clientes. Eso nos dio un punto central para el descubrimiento de instancias y nos permitió empezar a pensar en nombres lógicos de servicio en lugar de direcciones fijas.

Ahora toca avanzar un paso más: entender cómo se comunican realmente los microservicios cuando uno necesita datos o acciones de otro.

En esta clase vamos a centrarnos en la comunicación **sincrónica vía HTTP/REST**, que es una de las formas más comunes de interacción entre servicios en arquitecturas distribuidas.

---

## El escenario de NovaMarket que nos interesa

Nuestro flujo principal sigue siendo el mismo:

**consultar catálogo → crear orden → validar stock → registrar orden → publicar evento → notificar**

En ese recorrido hay una interacción muy clara que todavía no resolvimos del todo:

- `order-service` necesita consultar a `inventory-service` para saber si hay stock suficiente antes de confirmar una orden.

Ese caso es perfecto para introducir invocaciones REST entre microservicios, porque refleja una dependencia de negocio simple y muy realista.

---

## Qué significa una invocación REST entre servicios

En este contexto, una invocación REST es una llamada HTTP que un microservicio realiza hacia otro para:

- consultar información,
- validar una condición,
- ejecutar una operación,
- o enviar datos necesarios para continuar un flujo.

En NovaMarket, por ejemplo, `order-service` podría invocar a `inventory-service` para preguntar:

- si un producto existe,
- cuánta cantidad hay disponible,
- si una lista de ítems es aprobable,
- o incluso para reservar stock en una versión más avanzada.

A nivel conceptual no es muy distinto de consumir una API externa. La diferencia es que ahora la API consumida pertenece al mismo ecosistema distribuido.

---

## Por qué se usa tanto HTTP/REST entre microservicios

REST sigue siendo muy usado porque:

- es simple de entender,
- se apoya en HTTP,
- tiene herramientas muy maduras,
- encaja bien con operaciones de consulta y validación,
- y resulta bastante natural para muchos casos de negocio.

Para un curso como este, además, tiene una gran ventaja pedagógica: permite ver con claridad qué servicio depende de cuál y qué contrato existe entre ambos.

---

## Caso concreto: crear una orden

Pensemos el caso de uso principal.

Un usuario autenticado envía una solicitud para crear una orden. Esa solicitud llega a `order-service`.

Antes de registrar definitivamente la orden, `order-service` necesita saber si los productos pedidos tienen stock disponible. Para eso debe consultar a `inventory-service`.

Conceptualmente, el flujo podría ser:

1. `order-service` recibe la request,
2. extrae los ítems,
3. llama a `inventory-service`,
4. recibe una respuesta de disponibilidad,
5. decide si crea o rechaza la orden.

Ese es un ejemplo clásico de comunicación sincrónica: un servicio depende de la respuesta inmediata del otro para continuar.

---

## Qué información viaja en la llamada

La comunicación entre microservicios no debería pensarse solo como “hacer una request”.

También hay que pensar:

- qué contrato expone el servicio proveedor,
- qué datos se envían,
- qué forma tiene la respuesta,
- cómo se representan los errores,
- qué semántica tiene el endpoint.

Por ejemplo, `inventory-service` podría exponer una operación tipo:

- `POST /inventory/check`

Y recibir un body como este:

```json
{
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 2, "quantity": 1 }
  ]
}
```

La respuesta podría ser algo así:

```json
{
  "available": true,
  "details": [
    { "productId": 1, "requested": 2, "available": true },
    { "productId": 2, "requested": 1, "available": true }
  ]
}
```

Ese contrato va a ser parte importante de la calidad del sistema.

---

## Qué opciones existen en Spring para realizar la llamada

En el ecosistema Spring suelen aparecer varias posibilidades para invocar servicios HTTP:

- `RestTemplate`
- `WebClient`
- clientes declarativos como **OpenFeign**

En esta clase todavía no vamos a profundizar en Feign. Primero queremos entender el problema general.

Lo importante por ahora es asumir algo simple:

**hacer una llamada REST entre servicios no es solo “tirar un GET o un POST”**. Implica diseñar contratos, aceptar dependencia de red y lidiar con fallas distribuidas.

---

## La diferencia con una llamada local

En un monolito, cuando un módulo necesita otro, muchas veces se trata de una invocación en memoria.

Eso suele ser rápido, predecible y con poca fricción técnica.

En cambio, cuando `order-service` llama a `inventory-service`, aparece una realidad muy distinta:

- la red puede fallar,
- el servicio remoto puede tardar,
- el puerto o la instancia pueden cambiar,
- puede haber varias instancias,
- pueden devolverse errores HTTP,
- puede existir inconsistencia temporal.

Esto significa que una operación de negocio aparentemente simple empieza a tener un componente operativo mucho más fuerte.

---

## Acoplamiento funcional vs. acoplamiento temporal

Este es un punto muy importante.

`order-service` puede necesitar funcionalmente la información de `inventory-service`. Eso es razonable.

Pero además, al hacer una invocación sincrónica, queda acoplado temporalmente a que `inventory-service`:

- esté levantado,
- responda a tiempo,
- y devuelva un resultado utilizable.

Ese acoplamiento temporal es una de las tensiones centrales de la arquitectura distribuida.

No siempre está mal, pero hay que reconocerlo.

---

## Cuándo una llamada sincrónica tiene sentido

Una llamada REST sincrónica suele tener sentido cuando:

- el flujo necesita la respuesta para continuar,
- la operación es rápida,
- el contrato es claro,
- el servicio remoto es una dependencia razonable,
- y la experiencia del usuario o del proceso necesita resultado inmediato.

En NovaMarket, validar stock antes de crear una orden es un caso bastante natural para este tipo de interacción.

---

## Cuándo conviene desconfiar de una llamada sincrónica

Conviene mirarla con cuidado cuando:

- el servicio remoto puede tardar mucho,
- la dependencia es frágil,
- el resultado no necesita ser inmediato,
- el flujo puede tolerar procesamiento diferido,
- o una caída del servicio remoto bloquearía demasiado al sistema.

Más adelante, cuando introduzcamos RabbitMQ, vamos a ver que ciertos problemas se resuelven mejor con mensajería asincrónica que con dependencia directa vía HTTP.

---

## Primer enfoque: consumo por URL directa

Antes de aprovechar Eureka o Feign, el enfoque más simple consiste en consumir un endpoint remoto por su URL concreta.

Por ejemplo, `order-service` podría conocer algo como:

```txt
http://localhost:8082/inventory/check
```

Eso sirve pedagógicamente para arrancar, porque permite entender:

- cómo se arma la llamada,
- qué contrato se consume,
- qué request y response se intercambian,
- y qué errores aparecen.

Pero esta forma tiene límites muy claros.

---

## Problemas del consumo por URL fija

Consumir por dirección directa empieza a generar problemas casi de inmediato:

### 1. Cambio de puerto o host
Si cambia la ubicación del servicio, hay que tocar configuración o código.

### 2. Ambientes diferentes
Lo que funciona en local no necesariamente coincide con test o producción.

### 3. Escalado horizontal
Si hay varias instancias del mismo servicio, una única URL fija ya no representa bien la realidad.

### 4. Mantenimiento incómodo
Las dependencias entre servicios quedan atadas a detalles operativos concretos.

Por eso el descubrimiento de servicios y el balanceo aparecen tan naturalmente después.

---

## Cómo mejora esto con Service Discovery

Gracias a Eureka, la ubicación física del servicio puede dejar de ser el centro de la conversación.

En lugar de pensar en:

```txt
http://localhost:8082
```

podemos empezar a pensar en:

```txt
inventory-service
```

Eso no resuelve por sí mismo toda la llamada HTTP, pero sí mejora el desacoplamiento operativo.

El servicio consumidor ya no necesita conocer una dirección fija. Puede conocer un nombre lógico y dejar que la infraestructura lo ayude a encontrar instancias reales.

---

## Contratos claros: una obligación del sistema

Cuando dos microservicios se hablan por REST, el contrato tiene muchísimo peso.

Hay que definir con claridad:

- qué endpoint existe,
- qué verbo HTTP se usa,
- qué payload espera,
- qué devuelve en éxito,
- qué devuelve en error,
- y qué invariantes de negocio protege.

Por ejemplo, una validación de stock no debería ser un endpoint ambiguo que mezcle:

- consulta,
- reserva,
- modificación,
- y aceptación final de la orden.

Cuanto más clara sea la responsabilidad del endpoint, más mantenible será el ecosistema.

---

## Diseño de errores en la comunicación REST

Una parte especialmente importante es decidir cómo se comporta el servicio remoto cuando algo sale mal.

No es lo mismo:

- “no hay stock suficiente”,
- “el producto no existe”,
- “el servicio está caído”,
- “la request está mal formada”,
- “hay un error interno inesperado”.

Si todo termina devolviendo una respuesta confusa o un error genérico, el servicio consumidor va a tener muy poca capacidad de reaccionar correctamente.

Por eso la comunicación entre microservicios necesita contratos de error bastante pensados.

---

## El costo real de la simplicidad aparente

A primera vista, una llamada REST entre servicios parece algo muy simple.

Pero en la práctica, esa llamada arrastra decisiones sobre:

- disponibilidad,
- semántica del negocio,
- diseño de contratos,
- manejo de excepciones,
- timeouts,
- logging,
- seguridad,
- trazabilidad.

Esta es una de las razones por las que los microservicios exigen más disciplina arquitectónica que una simple separación por paquetes.

---

## Seguridad en llamadas internas

Aunque todavía no entramos formalmente al módulo de seguridad, conviene ir anticipando algo.

Cuando un servicio llama a otro, tarde o temprano aparecen preguntas como estas:

- ¿la llamada necesita autenticación?
- ¿se propaga el token original del usuario?
- ¿se valida el JWT en el servicio downstream?
- ¿qué identidad representa la llamada interna?

Estas cuestiones van a tomar forma más adelante con gateway, resource servers y token relay. Pero ya desde ahora conviene asumir que una llamada interna entre servicios no está exenta de diseño de seguridad.

---

## Qué rol cumple esta clase antes de Feign

Esta clase prepara el terreno conceptual para OpenFeign.

Antes de usar un cliente declarativo más cómodo, es importante entender bien:

- por qué existe la llamada,
- qué dependencia crea,
- qué contrato necesita,
- y qué problemas introduce.

Si uno salta demasiado rápido a una abstracción cómoda, puede perder de vista la naturaleza distribuida del problema.

---

## Dónde encaja esta comunicación en NovaMarket

Durante varias clases, el flujo principal del curso va a depender de esta interacción:

- `order-service` consume a `inventory-service`

Más adelante esa misma relación nos va a permitir introducir:

- OpenFeign,
- LoadBalancer,
- Circuit Breaker,
- Retry,
- trazas distribuidas,
- métricas,
- fallas controladas.

En otras palabras, esta llamada se va a convertir en uno de los ejes técnicos del curso.

---

## Una mirada prudente

No toda interacción entre servicios debe ser sincrónica.

Pero cuando sí lo es, conviene asumir desde el principio que estamos creando una dependencia fuerte entre dos piezas del sistema.

Eso obliga a diseñar bien:

- el contrato,
- los errores,
- los tiempos de respuesta esperados,
- y la evolución de esa integración.

Esa prudencia es la que separa una demo rápida de una arquitectura que empieza a pensarse con seriedad.

---

## Cierre

Las invocaciones REST entre microservicios son una herramienta central en muchas arquitecturas distribuidas, y en NovaMarket cumplen un papel fundamental dentro del flujo de creación de órdenes.

En esta clase vimos que una llamada entre servicios no es solo una cuestión técnica de HTTP: también implica contratos, acoplamiento temporal, manejo de errores y decisiones de diseño que afectan directamente la robustez del sistema.

En la próxima clase vamos a dar un paso más cómodo y más profesional: usar **OpenFeign** para definir clientes REST declarativos que mejoren la forma en la que `order-service` consume a `inventory-service` dentro de NovaMarket.
