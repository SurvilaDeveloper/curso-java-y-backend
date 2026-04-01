---
title: "Arquitectura hexagonal y puertos y adaptadores"
description: "Qué es la arquitectura hexagonal, cómo pensar puertos y adaptadores dentro de un backend real y por qué esta mirada puede ayudar a separar mejor el dominio y los casos de uso de los detalles técnicos de infraestructura."
order: 98
module: "Arquitectura y organización del backend"
level: "intermedio"
draft: false
---

## Introducción

Cuando un backend empieza a crecer, una de las preocupaciones más importantes es esta:

**¿cómo evitamos que el negocio quede demasiado mezclado con los detalles técnicos?**

Porque en proyectos reales es muy común que se mezclen cosas como:

- reglas del dominio
- lógica de aplicación
- acceso a base de datos
- framework web
- clientes HTTP
- colas
- storage
- seguridad
- DTOs
- configuración

Al principio eso puede parecer tolerable.

Pero con el tiempo empieza a generar problemas como:

- dificultad para entender el negocio sin atravesar mucho ruido técnico
- código demasiado atado al framework
- tests incómodos
- lógica de dominio escondida entre detalles de infraestructura
- cambios técnicos que impactan demasiado en el centro del sistema
- poca claridad sobre qué parte depende de qué

Ahí aparece una forma de pensar que se hizo muy valiosa:

**la arquitectura hexagonal**, también conocida muchas veces como **puertos y adaptadores**.

## Qué intenta resolver esta arquitectura

No intenta “hacer el sistema más sofisticado”.
Intenta resolver una pregunta muy concreta:

**¿cómo logramos que el corazón del sistema dependa menos de detalles técnicos y más de conceptos propios del negocio y de los casos de uso?**

En otras palabras:

- que el dominio no quede dominado por la infraestructura
- que los casos de uso no queden atados a una base, un framework o un proveedor
- que lo externo se conecte al sistema sin contaminar tanto su centro

## Qué significa arquitectura hexagonal

La arquitectura hexagonal es una forma de organizar el sistema donde el núcleo de negocio y aplicación se separa de los mecanismos externos mediante puertos y adaptadores.

La imagen mental más importante no es el hexágono en sí.
Lo importante es esta idea:

**el centro del sistema debería expresar negocio y casos de uso, mientras que lo externo se conecta a través de fronteras más claras.**

Eso ayuda a que:

- el dominio sea más visible
- la infraestructura no invada todo
- las dependencias apunten mejor
- el sistema sea más testeable y mantenible

## Qué es un puerto

Un puerto es una abstracción que define una forma de interacción entre el núcleo del sistema y algo externo.

Dicho más simple:

es un contrato que expresa **qué necesita el sistema** o **cómo puede ser invocado**, sin depender directamente de una tecnología concreta.

Por ejemplo, podrían existir puertos como:

- guardar una orden
- consultar un usuario
- enviar una notificación
- obtener el estado de un pago
- publicar un evento
- recibir una orden de creación
- procesar una confirmación externa

Un puerto no es todavía la implementación técnica.
Es la frontera conceptual.

## Qué es un adaptador

Un adaptador es la pieza concreta que conecta ese puerto con una tecnología o mecanismo real.

Por ejemplo:

- un controlador HTTP puede ser adaptador de entrada
- una implementación JPA puede ser adaptador de salida
- un cliente HTTP hacia un proveedor externo puede ser adaptador de salida
- un listener de mensajes puede ser adaptador de entrada
- una implementación que envía emails reales puede ser adaptador de salida

El adaptador traduce entre el mundo técnico externo y el contrato que el núcleo entiende.

## La idea central: separar el centro de la periferia

Esta es probablemente la idea más importante de toda la lección.

En arquitectura hexagonal, el sistema tiene un **centro** y una **periferia**.

### Centro

- dominio
- casos de uso
- reglas importantes
- decisiones del sistema

### Periferia

- HTTP
- base de datos
- framework
- colas
- storage
- integraciones externas
- interfaces de entrada o salida concretas

La idea es que la periferia pueda cambiar más sin arrastrar al centro.

## Por qué esto importa tanto

Porque en muchos proyectos, la infraestructura termina decidiendo demasiado.

Por ejemplo:

- el modelo del dominio se diseña según la base
- los casos de uso se mezclan con el framework web
- las reglas viven dispersas entre DTOs, repositories y clientes externos
- la aplicación queda demasiado atada a cómo se persisten o transportan las cosas

Eso vuelve el sistema más frágil y menos expresivo.

La arquitectura hexagonal intenta invertir esa relación:

**lo técnico debería servir al negocio, no al revés.**

## Entrada y salida

Una forma simple de entender puertos y adaptadores es distinguir:

- adaptadores de entrada
- adaptadores de salida

### Adaptadores de entrada

Son formas en las que algo externo entra al sistema.

Por ejemplo:

- HTTP controller
- webhook entrante
- comando administrativo
- job disparado
- evento recibido

Estos adaptadores traducen una interacción externa hacia un caso de uso o puerto de entrada del sistema.

### Adaptadores de salida

Son formas en las que el sistema necesita interactuar con algo externo.

Por ejemplo:

- persistencia en base de datos
- cliente de pagos
- proveedor de emails
- almacenamiento de archivos
- publicación de eventos
- integración con servicios externos

Estos adaptadores implementan necesidades del núcleo.

## Ejemplo intuitivo

Supongamos un caso de uso:

- confirmar un pago

El núcleo del sistema puede tener la lógica de:

- validar si la orden corresponde
- decidir transición de estado
- aplicar reglas del negocio
- registrar consecuencias importantes

Pero para lograrlo quizá necesite:

- leer una orden desde persistencia
- guardar cambios
- consultar un proveedor externo
- publicar un evento interno o externo

En arquitectura hexagonal, esas dependencias externas se expresan a través de puertos.
Y luego aparecen adaptadores concretos que resuelven técnicamente cada una.

## Qué gana el sistema con esto

Gana varias cosas valiosas.

### 1. Más claridad conceptual

El centro del sistema se parece más al negocio y menos a la infraestructura.

### 2. Menos acoplamiento técnico

El dominio no depende tan directamente de tecnologías concretas.

### 3. Más flexibilidad para cambiar infraestructura

Cambiar persistencia, proveedor o mecanismo de entrada puede ser menos traumático.

### 4. Mejor testeo

El núcleo puede probarse con menos ruido técnico alrededor.

### 5. Fronteras más explícitas

Se vuelve más claro qué pertenece al sistema y qué es adaptación al mundo externo.

## Qué no significa

También es muy importante entender lo que **no** significa.

No significa necesariamente:

- meter interfaces por absolutamente todo
- complicar cada clase simple
- crear una ceremonia arquitectónica vacía
- volver todo abstracto por deporte
- hacer un sistema imposible de leer

La arquitectura hexagonal es una forma de pensar dependencias y fronteras.
No debería convertirse en un ritual burocrático.

## Dependencias hacia adentro

Una idea muy fuerte de este enfoque es que las dependencias importantes deberían apuntar hacia el centro, no al revés.

Por ejemplo:

- un controller depende de un caso de uso
- una implementación concreta de repositorio depende del contrato que necesita implementar
- un cliente HTTP concreto depende del puerto o necesidad expresada por el sistema

Pero el dominio no debería depender directamente de:

- annotations del framework web
- detalles de transporte HTTP
- clases específicas del ORM
- clientes técnicos de terceros
- objetos de infraestructura que no le pertenecen

No siempre se logra pureza total, pero la dirección conceptual importa mucho.

## Puertos como contratos del núcleo

Los puertos ayudan a que el núcleo diga cosas como:

- “necesito guardar una orden”
- “necesito obtener un usuario”
- “necesito enviar una notificación”
- “necesito consultar el estado de algo externo”

sin decir todavía:

- “lo haré con esta librería”
- “lo haré con este ORM”
- “lo haré con este proveedor específico”

Eso protege bastante el diseño.

## Adaptadores como traductores

Los adaptadores cumplen una función muy importante:

traducen entre el lenguaje del sistema y el lenguaje técnico del entorno externo.

Por ejemplo:

- de un request HTTP a un caso de uso
- de una entidad de dominio a una fila persistida
- de una necesidad de notificación a una API real de email
- de una consulta del dominio a una implementación técnica concreta

Son puentes, no el centro del negocio.

## Relación con arquitectura por capas

Este tema se conecta mucho con la lección anterior.

La arquitectura por capas ya te ayudaba a distinguir:

- entrada
- aplicación
- dominio
- infraestructura

La arquitectura hexagonal refuerza eso, pero hace más foco en:

- las fronteras explícitas
- los contratos
- el sentido de las dependencias
- el desacople entre núcleo y tecnología

No son ideas enemigas.
Muchas veces se combinan muy bien.

## Relación con casos de uso

Los casos de uso suelen vivir muy cómodamente en esta forma de pensar.

Porque un caso de uso puede:

- representar la intención del sistema
- coordinar el flujo principal
- depender de puertos para acceder a persistencia o integraciones
- mantenerse más limpio de detalles técnicos concretos

Eso suele mejorar mucho la legibilidad del backend.

## Relación con monolito modular

La arquitectura hexagonal no exige microservicios.

Puede aplicarse perfectamente dentro de un monolito modular.

Por ejemplo:

- cada módulo puede tener su lógica más central
- sus puertos relevantes
- sus adaptadores de entrada y salida
- sus dependencias externas más encapsuladas

Eso puede fortalecer muchísimo la modularidad interna.

## Ejemplo con órdenes

Imaginemos una operación de crear orden.

Podrías tener:

### En el núcleo

- reglas de creación
- invariantes
- caso de uso
- necesidad de guardar y quizá publicar algo

### Como puertos

- `OrderRepository`
- `EventPublisher`
- quizá `InventoryChecker`

### Como adaptadores

- controller HTTP que recibe la request
- implementación JPA del repositorio
- adaptador concreto que publica eventos
- adaptador de integración con inventario

El caso de uso central no necesita depender directamente del controller ni del ORM concreto.

## Cuándo esta idea ayuda mucho

Suele ser especialmente útil cuando:

- el sistema ya tiene cierta complejidad
- querés separar mejor negocio de infraestructura
- la lógica importante está demasiado mezclada con detalles técnicos
- querés testear mejor el centro del sistema
- hay varias integraciones externas
- querés sostener evolución sin que todo dependa del framework

## Cuándo no conviene exagerar

Como siempre, no hay que convertir una buena idea en sobreingeniería.

No hace falta:

- crear cinco puertos triviales por una operación ridículamente simple
- meter interfaces artificiales sin valor real
- esconder todo detrás de capas incomprensibles
- transformar el proyecto en una ceremonia abstracta imposible de mantener

La clave es usar la idea para clarificar, no para impresionar.

## Qué errores comunes aparecen

Algunos muy frecuentes son:

- creer que “hexagonal” significa solo crear muchas interfaces
- abstraer todo aunque no tenga sentido
- dejar el dominio igual de contaminado, pero con más carpetas
- usar nombres rimbombantes sin mejorar realmente el diseño
- no distinguir el núcleo de la periferia
- hacer depender el dominio de tecnología concreta aunque el diagrama diga otra cosa
- convertir la arquitectura en una carga innecesaria

## Cómo darte cuenta de que este enfoque te serviría

Algunas señales:

- la lógica importante está muy mezclada con framework o infraestructura
- cuesta testear casos de uso sin levantar demasiadas cosas técnicas
- cambiar un proveedor afecta demasiado al corazón del sistema
- el dominio se parece demasiado a tablas, DTOs o endpoints
- hay poca claridad sobre qué parte es negocio y qué parte es adaptación técnica
- necesitás ordenar mejor los puntos de entrada y salida del backend

## Buenas prácticas iniciales

## 1. Distinguir el núcleo del sistema de sus mecanismos externos

Esa es la idea más importante.

## 2. Usar puertos para expresar necesidades del núcleo, no para decorar el código

La abstracción debe tener sentido real.

## 3. Tratar adaptadores como traductores entre el sistema y el mundo externo

No como centro del negocio.

## 4. Hacer que las dependencias importantes apunten hacia adentro

Eso fortalece el diseño.

## 5. Aplicar este enfoque donde aporte claridad y desacople reales

No como ceremonia obligatoria universal.

## 6. Combinarlo con módulos y casos de uso

Suele dar muy buenos resultados.

## 7. Recordar que el objetivo es proteger el dominio, no multiplicar archivos sin valor

La claridad sigue siendo la meta.

## Errores comunes

### 1. Pensar que arquitectura hexagonal es solo una moda de nombres

En realidad propone una relación distinta entre negocio e infraestructura.

### 2. Crear puertos donde no existe una verdadera necesidad de frontera

Eso puede agregar ruido.

### 3. Dejar igual de mezclada la lógica, pero con más capas

Entonces la arquitectura es solo cosmética.

### 4. Atar el dominio a detalles del framework o del ORM aunque “en teoría” no debería

Muy común si no se cuida la práctica.

### 5. Volver ilegible el proyecto por exceso de abstracción

La solución no puede ser peor que el problema.

### 6. Creer que esto solo aplica a sistemas enormes

Puede aportar mucho también en proyectos medianos si se usa con criterio.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. ¿qué parte de tu backend hoy sentís demasiado contaminada por detalles técnicos?
2. ¿qué caso de uso importante te gustaría poder leer con menos ruido de infraestructura?
3. ¿qué dependencia externa actual podría representarse mejor como un puerto?
4. ¿qué adaptador de entrada y qué adaptador de salida distinguís hoy en tu proyecto?
5. ¿en qué lugar estarías creando abstracción útil y en cuál estarías exagerando?

## Resumen

En esta lección viste que:

- la arquitectura hexagonal busca separar mejor el núcleo del sistema de los detalles técnicos externos
- los puertos expresan contratos o necesidades del núcleo, y los adaptadores conectan esas necesidades con mecanismos concretos
- esta forma de pensar ayuda a desacoplar negocio, casos de uso, persistencia, HTTP e integraciones
- no se trata de agregar interfaces por deporte, sino de clarificar dependencias y fronteras
- combinada con módulos y casos de uso, esta arquitectura puede volver mucho más claro y mantenible un backend real

## Siguiente tema

Ahora que ya entendés cómo la arquitectura hexagonal y la idea de puertos y adaptadores ayudan a separar mejor el núcleo del sistema de su infraestructura, el siguiente paso natural es aprender sobre **persistencia desacoplada, repositorios y el costo de modelar demasiado según la base de datos**, porque ahí se juega una parte muy importante de cuánto domina la infraestructura al resto del backend.
