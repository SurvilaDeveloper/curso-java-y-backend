---
title: "Arquitectura por capas y organización por casos de uso"
description: "Cómo pensar la separación entre entrada, aplicación, dominio e infraestructura, y por qué organizar el backend también alrededor de casos de uso ayuda a que el sistema sea más claro, mantenible y expresivo."
order: 94
module: "Arquitectura y organización del backend"
level: "intermedio"
draft: false
---

## Introducción

Cuando un backend empieza a crecer y ya no alcanza con “poner todo en services”, aparece una necesidad muy concreta:

**ordenar mejor cómo se reparte el trabajo dentro del sistema.**

Hasta ahora viste ideas como:

- límites de contexto
- módulos
- separación de responsabilidades
- monolito modular

Todo eso ayuda a pensar **qué partes del sistema existen** y **cómo se agrupan**.

Pero también hace falta pensar otra cosa:

**cómo se organiza el flujo interno de responsabilidades dentro de cada parte.**

Ahí aparecen dos ideas muy útiles:

- **arquitectura por capas**
- **organización por casos de uso**

La primera ayuda a separar tipos de responsabilidad.
La segunda ayuda a pensar el sistema desde acciones significativas del negocio, y no solo desde entidades o detalles técnicos.

## Por qué este tema importa tanto

Porque muchos proyectos intermedios tienen un problema muy repetido:

- controllers demasiado cargados
- services que hacen de todo
- lógica de negocio mezclada con acceso a datos
- integración externa mezclada con validaciones
- código difícil de seguir
- cambios que obligan a tocar muchas capas sin criterio
- poca claridad sobre dónde debería vivir cada decisión

Ese desorden no siempre se resuelve solo con más clases.
Muchas veces se resuelve mejor con una idea más clara de:

- qué tipo de responsabilidad tiene cada pieza
- y cómo se articula un caso de uso de punta a punta

## Qué es arquitectura por capas

La arquitectura por capas es una forma de organizar el backend separando distintas responsabilidades en niveles o capas conceptuales.

No existe una única variante rígida, pero en general suele ayudar a distinguir cosas como:

- entrada o interfaz
- aplicación
- dominio
- infraestructura

La idea no es hacer burocracia.
La idea es que no todo tenga que vivir mezclado en el mismo lugar.

## Qué es organización por casos de uso

Organizar por casos de uso significa pensar el sistema a partir de acciones relevantes que el negocio o el usuario necesitan realizar.

Por ejemplo:

- crear orden
- cancelar orden
- confirmar pago
- registrar producto
- generar exportación
- actualizar stock
- procesar webhook
- enviar notificación
- reconciliar estado pendiente

Esto cambia bastante la mirada.

En vez de pensar solo en:

- `OrderService`
- `PaymentService`
- `ProductService`

empezás a pensar en:

- ¿qué acción concreta está resolviendo esta parte?
- ¿qué reglas y pasos necesita?
- ¿qué coordina?
- ¿qué depende de qué?

Eso suele volver el sistema más expresivo.

## El problema de pensar solo por entidades

Un error muy común es diseñar todo alrededor de entidades estáticas.

Por ejemplo:

- `OrderService`
- `UserService`
- `ProductService`
- `PaymentService`

Y dentro de cada uno terminar metiendo cualquier cosa relacionada “más o menos” con esa entidad.

El problema es que los sistemas reales no viven solo de entidades.
Viven de flujos y acciones.

Por ejemplo:

- una compra no es solo “orden”
- también involucra carrito, checkout, pago, stock, notificación y estados
- una cancelación no es solo cambiar un campo
- puede implicar validaciones, side effects, devoluciones, auditoría, compensaciones

Pensar por casos de uso ayuda a capturar mejor esa realidad.

## Capa de entrada

La capa de entrada es la que recibe interacción desde afuera.

Por ejemplo:

- HTTP controllers
- endpoints
- webhooks entrantes
- handlers de mensajes
- comandos administrativos
- tareas disparadas externamente

Su responsabilidad no debería ser resolver todo el negocio.
Más bien suele encargarse de:

- recibir input
- validar formato básico
- traducir datos de entrada
- invocar el caso de uso adecuado
- devolver respuesta en el formato correspondiente

En general, una buena señal es que el controller no “piense demasiado negocio”.

## Capa de aplicación

La capa de aplicación suele encargarse de coordinar casos de uso.

Por ejemplo:

- crear una orden
- iniciar un pago
- cancelar un pedido
- confirmar una operación
- disparar una exportación

No necesariamente contiene toda la lógica de negocio profunda, pero sí coordina el flujo de la acción.

Suele ocuparse de cosas como:

- orquestar pasos
- llamar a componentes del dominio
- coordinar persistencia
- invocar integraciones
- disparar efectos secundarios controlados
- delimitar el flujo principal del caso de uso

Es una capa muy importante porque conecta intención de negocio con ejecución concreta.

## Capa de dominio

La capa de dominio representa las reglas, conceptos y decisiones más propias del negocio.

Por ejemplo:

- qué estados son válidos
- cuándo una orden se puede cancelar
- qué significa que un pago esté confirmado
- qué invariantes deben sostenerse
- qué relaciones importan de verdad
- qué transiciones son legales y cuáles no

La idea del dominio no es “ser complicado”.
Es dar un lugar más claro a las reglas que definen el comportamiento real del sistema.

## Capa de infraestructura

La infraestructura incluye piezas técnicas que permiten que el sistema interactúe con el mundo real.

Por ejemplo:

- base de datos
- repositorios concretos
- clientes HTTP
- providers externos
- storage
- colas
- envío de emails
- configuración
- frameworks y librerías de soporte

La idea no es despreciar esta capa.
Es reconocer que estas piezas son necesarias, pero no deberían absorber arbitrariamente la lógica del negocio.

## Qué problema resuelve esta separación

Resuelve varios al mismo tiempo.

### 1. Hace más claro dónde vive cada decisión

No todo se resuelve en el controller ni todo cae en un service gigante.

### 2. Reduce mezcla de responsabilidades

Negocio, infraestructura y orquestación no deberían estar totalmente fundidos.

### 3. Hace más expresivo el flujo

Se entiende mejor qué está pasando y por qué.

### 4. Mejora mantenibilidad

Cuando querés cambiar algo, suele estar más claro dónde hacerlo.

### 5. Facilita testeo conceptual

Podés testear reglas de negocio y casos de uso con menos ruido técnico.

## Ejemplo intuitivo: crear una orden

Supongamos el caso de uso “crear una orden”.

Podría pensarse así:

### Entrada

- un controller recibe la request

### Aplicación

- coordina el caso de uso de creación
- valida precondiciones de flujo
- llama a componentes necesarios

### Dominio

- decide cómo nace la orden
- valida reglas importantes
- define estados iniciales
- asegura coherencia de negocio

### Infraestructura

- persiste la orden
- tal vez interactúa con servicios externos
- registra eventos o dispara tareas secundarias

Si todo eso cae en un solo método dentro de un controller o service, el sistema se vuelve mucho más opaco.

## Las capas no son paredes absolutas

Esto es importante.

Hablar de capas no significa crear una rigidez artificial donde nada puede respirar.

Se trata más bien de una guía para separar responsabilidades con criterio.

No siempre hace falta:

- diez interfaces
- cuatro capas físicas por cada mínima clase
- ceremonias excesivas

La idea es que el sistema sea más claro, no más pesado.

## Organización por casos de uso vs por CRUD

Otra diferencia importante es esta:

pensar por casos de uso no es lo mismo que pensar solo por operaciones CRUD.

CRUD ayuda a:

- crear
- leer
- actualizar
- borrar

Pero los sistemas reales muchas veces necesitan expresar acciones más ricas, como:

- confirmar pago
- cerrar orden vencida
- reintentar sincronización
- emitir reembolso
- aprobar documento
- reconciliar estado externo
- generar reporte
- activar promoción

Esas acciones tienen más intención de negocio que un simple “update”.

## Por qué esto mejora la expresividad

Porque leer algo como:

- `ConfirmPaymentUseCase`
- `CancelOrderUseCase`
- `GenerateShipmentLabelUseCase`
- `ReconcilePendingPaymentUseCase`

comunica mucho mejor la intención que meter todo en métodos genéricos de un service enorme.

No es solo cuestión de nombres.
Es una forma distinta de modelar la aplicación.

## Casos de uso como unidad de conversación

Esto también ayuda mucho al equipo.

Es más natural discutir:

- “el caso de uso de cancelar orden”
- “el caso de uso de registrar producto”
- “el caso de uso de confirmar pago”

que discutir solamente:

- “tocá UserService”
- “cambiá OrderService”
- “agregá un método más”

Los casos de uso se acercan más al lenguaje del negocio y al flujo real.

## Qué suele vivir en un caso de uso

Depende del sistema, pero muchas veces un caso de uso coordina cosas como:

- validación del flujo
- búsqueda de entidades necesarias
- llamada a reglas del dominio
- persistencia
- publicación de eventos
- disparo de efectos secundarios
- interacción con integraciones
- manejo general del resultado del caso

No siempre todo el negocio está dentro del caso de uso.
Pero sí suele ser una buena unidad de coordinación.

## Dominio rico vs dominio anémico

Sin entrar todavía en discusiones demasiado avanzadas, este tema también toca una distinción clásica.

### Dominio anémico

Las entidades casi no tienen comportamiento y todo vive afuera en services enormes.

### Dominio con más comportamiento

Parte de las reglas e invariantes vive más cerca de los conceptos del negocio.

No hace falta ir a extremos.
Pero sí conviene evitar que todo el sistema sea pura orquestación vacía y que el dominio no exprese nada.

## Qué errores comunes aparecen

Algunos muy frecuentes son:

- controllers con demasiada lógica
- casos de uso inexistentes o difusos
- services gigantes donde entra todo
- entidades mudas que no expresan reglas
- infraestructura metida en el centro del negocio
- capas creadas solo por moda, sin intención real
- demasiada ceremonia para acciones simples
- falta de claridad sobre quién coordina y quién decide

## Cuándo este enfoque ayuda muchísimo

Suele ayudar mucho cuando:

- el sistema ya tiene cierta complejidad
- hay varios flujos de negocio importantes
- querés hacer más mantenible el backend
- los cambios empiezan a impactar demasiado
- querés que el código comunique mejor intención
- el equipo necesita discutir el sistema en términos más claros
- querés separar mejor negocio de detalles técnicos

## Cuándo no conviene exagerar

Como siempre, no hay que sobreactuar.

No hace falta convertir una operación trivial en una arquitectura ceremonial absurda.

Hay que encontrar equilibrio.

La idea no es:

- agregar capas por deporte
- crear cien clases para una acción mínima
- complicar el código solo por “ser más arquitecto”

La idea es que la estructura ayude de verdad.

## Relación con lo que ya viste

Este tema conecta mucho con lo anterior.

### Límites de contexto y módulos

Porque los casos de uso viven dentro de módulos o áreas del dominio.

### Monolito modular

Porque dentro de un monolito modular también importa cómo se organizan internamente las responsabilidades.

### Integraciones reales

Porque muchos casos de uso coordinan jobs, webhooks, clientes externos y reconciliaciones.

### Diseño para producto real

Porque separar mejor aplicación, dominio e infraestructura mejora evolución y operación.

## Qué señales muestran que te haría bien este enfoque

Por ejemplo:

- no sabés dónde debería vivir una nueva regla
- los controllers están inflados
- los services son demasiado grandes
- un cambio chico requiere recorrer demasiadas clases
- cuesta encontrar el flujo principal de una funcionalidad
- el negocio está escondido entre detalles técnicos
- el código no comunica bien la intención real

Si te pasa eso, esta forma de organizar puede ayudarte mucho.

## Buenas prácticas iniciales

## 1. Diferenciar entrada, aplicación, dominio e infraestructura con criterio

No como dogma, sino como ayuda real de diseño.

## 2. Pensar en acciones de negocio concretas como casos de uso

Eso vuelve el sistema más expresivo.

## 3. Evitar controllers y services gigantes

Suelen ser señal de responsabilidades mezcladas.

## 4. Hacer que la orquestación viva en un lugar claro

Alguien tiene que coordinar el flujo.

## 5. Darle al dominio un lugar real para expresar reglas importantes

No todo debería vivir en servicios genéricos.

## 6. Mantener la infraestructura cerca de sus responsabilidades técnicas

Sin dejar que invada todo el negocio.

## 7. No exagerar capas si la acción es demasiado simple

La claridad sigue siendo el objetivo.

## Errores comunes

### 1. Crear capas solo por imitación sin entender para qué

Entonces aparecen estructuras vacías.

### 2. Poner todo en services genéricos aunque se llamen distinto

El problema de fondo sigue igual.

### 3. Hacer casos de uso que solo delegan sin expresar nada útil

Eso puede volverse burocracia.

### 4. Dejar el dominio completamente mudo

Después toda regla queda dispersa.

### 5. Mezclar infraestructura y negocio sin control

Eso vuelve el sistema más frágil.

### 6. Buscar pureza absoluta y volver imposible el trabajo cotidiano

También hay que ser pragmático.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. ¿qué caso de uso importante distinguís hoy en tu proyecto?
2. ¿qué controller o service actual está coordinando demasiado y debería repartirse mejor?
3. ¿qué parte de la lógica pertenece realmente al dominio y cuál es más de aplicación o infraestructura?
4. ¿qué acción de negocio hoy está escondida detrás de un CRUD demasiado genérico?
5. ¿qué ganaría tu sistema si una funcionalidad importante se pudiera leer como un flujo más explícito?

## Resumen

En esta lección viste que:

- la arquitectura por capas ayuda a distinguir responsabilidades entre entrada, aplicación, dominio e infraestructura
- organizar por casos de uso permite modelar mejor acciones reales del negocio en lugar de pensar solo en entidades o CRUD
- esta forma de estructurar el backend puede volver el sistema más claro, expresivo y mantenible
- no se trata de agregar burocracia, sino de repartir mejor quién recibe, quién coordina, quién decide y quién ejecuta detalles técnicos
- cuando un sistema crece, esta claridad interna ayuda mucho a sostener evolución sin que todo termine mezclado en services gigantes

## Siguiente tema

Ahora que ya entendés cómo pensar arquitectura por capas y organización por casos de uso para volver más claro el flujo interno del backend, el siguiente paso natural es aprender sobre **reglas de negocio, invariantes y dónde debería vivir la lógica importante**, porque ahí se juega una de las diferencias más grandes entre un sistema que solo “mueve datos” y uno que realmente expresa su dominio.
