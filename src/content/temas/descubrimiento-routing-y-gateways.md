---
title: "Descubrimiento, routing y gateways"
description: "Qué problemas aparecen cuando muchos servicios necesitan encontrarse entre sí, cómo pensar service discovery, routing y API gateways, y qué beneficios y costos traen estas piezas en una arquitectura distribuida." 
order: 158
module: "Microservicios y sistemas distribuidos"
level: "intermedio"
draft: false
---

## Introducción

Cuando un sistema empieza a separarse en varios servicios, aparece una pregunta muy concreta que en un monolito casi no existía:

**¿cómo encuentra un servicio a otro servicio correcto en el momento correcto?**

Al principio, en sistemas chicos, parece que la respuesta es trivial:

- se configura una URL
- se llama a esa dirección
- listo

Pero a medida que la arquitectura distribuida crece, ese enfoque empieza a mostrar límites muy rápido.

Porque en un sistema real:

- hay múltiples instancias del mismo servicio
- las instancias cambian con despliegues, reinicios o escalado
- puede haber tráfico interno y externo con reglas distintas
- no todos los consumidores deberían hablar con todos los servicios
- algunas rutas necesitan autenticación, rate limiting u observabilidad centralizada
- otras necesitan balanceo, retries o transformación de requests

Entonces el problema deja de ser solo “hacer una llamada HTTP”.
Pasa a ser un problema de **descubrimiento, direccionamiento y control del tráfico**.

Ahí entran tres ideas muy importantes:

- **service discovery**
- **routing**
- **gateways**

Estas piezas no existen porque sí.
Existen porque cuando la cantidad de servicios crece, el sistema necesita mecanismos claros para:

- saber dónde vive cada servicio
- decidir hacia dónde mandar cada request
- controlar qué tráfico entra, qué tráfico sale y bajo qué reglas

Este tema trata justamente de eso.
No de memorizar herramientas puntuales, sino de entender:

- qué problema resuelve el descubrimiento de servicios
- qué significa enrutar bien en un sistema distribuido
- para qué sirve un gateway
- qué ventajas trae
- qué costos y riesgos introduce

Porque en microservicios, tan importante como separar servicios es **hacer que puedan encontrarse y comunicarse sin convertir la red en caos**.

## El problema que aparece cuando ya no hay una sola aplicación

En un monolito, casi todo ocurre dentro del mismo proceso.
Una parte del sistema llama a otra con:

- una función
- una clase
- un módulo interno

No hay red, no hay balanceador, no hay lookup de instancias.

En cambio, cuando una operación depende de varios servicios, ya no alcanza con conocer una referencia de memoria.
Ahora hace falta saber:

- qué servicio presta la capacidad que necesito
- dónde está disponible en este momento
- qué instancia conviene usar
- por qué camino de red debería pasar la solicitud
- qué reglas de seguridad o control aplican

Y eso se vuelve más complejo cuando el sistema tiene propiedades como:

- despliegues frecuentes
- autoscaling
- contenedores efímeros
- múltiples ambientes
- zonas o regiones distintas
- tráfico interno y externo separados

La consecuencia es simple:

**en sistemas distribuidos, la ubicación de un servicio deja de ser estable.**

No podés asumir para siempre que “payments vive en esta IP” o que “inventory siempre responde en tal host fijo”.
La infraestructura cambia demasiado seguido para eso.

## Qué es service discovery

Service discovery es el mecanismo que permite que un consumidor encuentre la dirección correcta de un servicio sin depender de direcciones fijas cableadas por todos lados.

Dicho simple:

**en vez de recordar manualmente dónde está cada instancia, el sistema usa un mecanismo para resolver dinámicamente a qué destino llamar.**

Ese mecanismo puede apoyarse en:

- registros de servicios
- DNS interno
- service registry
- orquestadores
- service mesh
- balanceadores internos

La idea central es desacoplar:

- **identidad lógica del servicio**
- **ubicación física o concreta de sus instancias**

Por ejemplo, una aplicación no quiere saber:

- `10.0.31.42:8080`
- `10.0.31.43:8080`
- `10.0.31.44:8080`

Quiere saber algo más estable, como:

- `inventory-service`

Y dejar que otra capa resuelva cuál instancia específica atiende esa llamada.

## Por qué el descubrimiento de servicios importa tanto

Sin una estrategia razonable de discovery, aparecen varios problemas clásicos.

## 1. Configuración frágil

Cada servicio termina con listas de hosts, puertos y direcciones replicadas en múltiples lugares.
Entonces cualquier cambio de infraestructura obliga a tocar configuraciones por todos lados.

## 2. Acoplamiento innecesario a detalles de despliegue

Los equipos de aplicación quedan demasiado atados a cómo está desplegado hoy el sistema.
Eso vuelve más costoso mover servicios, escalar o reorganizar infraestructura.

## 3. Errores de disponibilidad bajo cambios normales

Una instancia se cae, otra arranca, una IP cambia, un contenedor rota.
Si el descubrimiento no acompaña, el sistema falla aunque la capacidad real siga existiendo.

## 4. Complejidad duplicada en cada consumidor

Cada cliente termina resolviendo por su cuenta:

- a qué host llamar
- cómo balancear
- qué hacer si una instancia desaparece

Eso dispersa mucha lógica operacional por todo el sistema.

## Descubrimiento del lado cliente y del lado servidor

Hay dos modelos mentales bastante útiles para entender cómo se resuelve este problema.

## Client-side discovery

En este enfoque, el consumidor:

- consulta un registro o fuente de verdad
- obtiene instancias disponibles
- elige a cuál llamar
- muchas veces también participa del balanceo

Ventajas:

- más control del lado cliente
- puede tomar decisiones más inteligentes según contexto
- evita agregar una capa intermedia obligatoria para cada request

Costos:

- cada cliente necesita incorporar más lógica
- la complejidad de discovery se replica
- actualizar políticas puede volverse más difícil

## Server-side discovery

En este enfoque, el cliente llama a un punto más estable:

- balanceador
- proxy
- gateway
- componente de infraestructura

Y esa capa intermedia decide a qué instancia real enviar la solicitud.

Ventajas:

- menos lógica en los clientes
- políticas más centralizadas
- más uniformidad operativa

Costos:

- más dependencia de la infraestructura intermedia
- más riesgo de cuello de botella si se diseña mal
- a veces menos flexibilidad desde el consumidor

No hay una respuesta universal.
Lo importante es entender qué complejidad querés poner en el cliente y cuál querés absorber en infraestructura.

## Qué significa routing en una arquitectura distribuida

Routing es la lógica que determina **por dónde viaja una solicitud y a qué destino concreto termina llegando**.

No es solo “enviar al servicio correcto”.
También puede implicar decidir:

- qué instancia concreta recibe el tráfico
- qué versión del servicio se usa
- si el tráfico va a un cluster u otro
- si una ruta requiere autenticación adicional
- si cierto tráfico debe pasar por un canary
- si una request externa entra por un camino distinto al tráfico interno

En otras palabras:

**routing es aplicar reglas al flujo de solicitudes dentro del sistema.**

## El routing no es solo un detalle de red

Muchas veces se lo piensa como un problema puramente infra, pero en realidad tiene mucho impacto arquitectónico.

Porque las decisiones de routing afectan:

- disponibilidad
- latencia
- aislamiento
- seguridad
- rollout de versiones
- observabilidad
- experiencia de clientes externos

Por ejemplo, enrutar mal puede significar:

- mandar tráfico interno por un camino innecesariamente largo
- exponer servicios que debían permanecer privados
- mezclar tráfico de producción con pruebas
- romper una migración gradual
- concentrar demasiado tráfico en pocas instancias

Entonces no es exagerado decir que el routing es parte del diseño del sistema, no solo de su cableado técnico.

## Casos típicos donde el routing se vuelve importante

## 1. Balanceo entre múltiples instancias

Si un servicio tiene varias réplicas, alguien tiene que decidir cómo distribuir las solicitudes.

## 2. Versionado y rollout progresivo

Tal vez querés mandar:

- 95 % del tráfico a v1
- 5 % a v2

Eso ya es una política de routing.

## 3. Separación entre tráfico interno y externo

No todo servicio debería ser accesible directamente desde afuera.
Algunos caminos son públicos, otros estrictamente internos.

## 4. Routing por región, zona o tenant

A veces necesitás enviar tráfico según:

- ubicación geográfica
- afinidad de datos
- aislamiento por cliente
- cercanía operativa

## 5. Degradación controlada

En incidentes, puede convenir redirigir tráfico, apagar ciertos caminos o enrutar a capacidades alternativas.

## Qué es un gateway

Un gateway es un punto de entrada o intermediación que concentra ciertas reglas de acceso y tráfico hacia servicios de backend.

En términos simples, suele actuar como una puerta organizada entre un conjunto de consumidores y un conjunto de servicios.

Dependiendo del contexto, un gateway puede encargarse de cosas como:

- recibir tráfico externo
- enrutar requests al servicio correcto
- validar autenticación o autorización básica
- aplicar rate limiting
- centralizar observabilidad
- transformar requests o responses
- ocultar topología interna
- exponer una interfaz más ordenada hacia clientes

La idea importante no es el nombre, sino el rol:

**el gateway ayuda a controlar cómo entra el tráfico y cómo se distribuye hacia adentro.**

## Por qué muchas arquitecturas usan gateways

Cuando los servicios empiezan a multiplicarse, exponer cada uno directamente suele traer varios problemas.

## 1. Demasiados puntos expuestos

Si cada servicio queda visible hacia afuera, la superficie operativa y de seguridad crece mucho.

## 2. Inconsistencia transversal

Cada servicio podría terminar resolviendo por su cuenta:

- autenticación
n- headers comunes
- rate limiting
- manejo de errores de borde
- logging de acceso

Eso produce duplicación y diferencias innecesarias.

## 3. Topología interna demasiado visible

Los clientes externos terminan conociendo demasiado sobre cómo está dividido el backend internamente.
Eso hace más difícil evolucionar la arquitectura sin impactarlos.

## 4. Mayor acoplamiento entre clientes y microservicios internos

Si un frontend o integrador externo depende de demasiados endpoints internos separados, cada cambio de partición entre servicios puede repercutir directamente en el cliente.

Por eso, muchas veces el gateway funciona como una capa de estabilización.

## Qué beneficios puede aportar un gateway

## 1. Punto de entrada más ordenado

Permite presentar una cara más simple hacia afuera aunque internamente existan muchos servicios.

## 2. Centralización de políticas transversales

Puede concentrar capacidades como:

- autenticación de borde
- rate limiting
- TLS termination
- logging de acceso
- tracing inicial
- validaciones básicas de entrada

## 3. Encapsulamiento de la topología interna

El cliente no necesita conocer cuántos servicios hay ni cómo están particionados exactamente.

## 4. Facilita ciertos cambios internos

Si mañana cambiás cómo se reparte la lógica entre servicios, muchas veces podés mantener estable la entrada externa y reorganizar por detrás.

## 5. Ayuda con versionado y migraciones

Un gateway puede colaborar en transiciones como:

- mantener rutas viejas y nuevas
- derivar ciertos clientes a una versión distinta
- hacer rollout progresivo

## Pero el gateway también tiene costos

Acá aparece una trampa común:
creer que poner un gateway siempre simplifica todo.

No necesariamente.

## 1. Puede convertirse en cuello de botella

Si todo pasa por ahí y la capacidad no acompaña, el gateway se vuelve un punto sensible de performance y disponibilidad.

## 2. Puede convertirse en punto único de fallo

Si el diseño no contempla redundancia y operación seria, una falla en el gateway afecta mucho más que una falla en un servicio puntual.

## 3. Puede inflarse con demasiada lógica de negocio

Éste es uno de los errores más comunes.
El gateway empieza haciendo:

- autenticación
- routing
- rate limiting

Y termina además:

- componiendo reglas complejas de negocio
- decidiendo procesos enteros
- acoplando conocimiento funcional de múltiples dominios

Cuando eso pasa, el gateway deja de ser infraestructura de borde y empieza a convertirse en un pseudo-monolito mal ubicado.

## 4. Puede ocultar demasiado y volver opaca la arquitectura

Si nadie entiende bien qué reglas están en el gateway y cuáles en los servicios, diagnosticar problemas se vuelve difícil.

## Una regla sana: el gateway no debería transformarse en el cerebro del sistema

El gateway suele ser valioso para responsabilidades transversales y de entrada.
Pero en general conviene evitar que concentre la lógica principal del dominio.

Porque cuando el gateway empieza a decidir demasiadas cosas del negocio, aparecen problemas como:

- fuerte acoplamiento entre dominios
- despliegues riesgosos
- dificultad para testear
- frontera borrosa entre edge y core
- duplicación de reglas que también viven en servicios

Dicho simple:

**un gateway puede ordenar el acceso al sistema, pero no debería absorber el corazón del negocio.**

## API Gateway vs gateway interno

No todos los gateways cumplen exactamente el mismo rol.

## API gateway de borde

Suele estar orientado al tráfico externo:

- frontend web
- apps móviles
- partners
- clientes externos

Su foco principal suele ser:

- entrada al sistema
- seguridad de borde
- políticas comunes
- estabilizar la interfaz pública

## Gateways o proxies internos

A veces existen capas similares para tráfico interno, service-to-service o este-oeste.
En esos casos el foco puede estar más en:

- routing interno
- descubrimiento
- observabilidad
- mTLS
- retries controlados
- políticas de red

La diferencia importa porque no siempre conviene resolver con la misma pieza los problemas de borde externo y los problemas de comunicación interna.

## Relación entre gateways y BFF

En algunos sistemas también aparece el patrón **Backend for Frontend**.
Eso no es exactamente lo mismo que un gateway genérico.

Un BFF suele estar más orientado a un cliente particular, por ejemplo:

- web pública
- app móvil
- panel administrativo

Y puede adaptar datos, composición y experiencia para ese consumidor específico.

En cambio, un gateway más clásico suele enfocarse más en:

- entrada genérica
- políticas transversales
- routing
- seguridad

A veces ambos conviven.
El problema es confundir sus responsabilidades.

## Cuándo un gateway ayuda de verdad

Suele aportar mucho valor cuando necesitás:

- una entrada consistente hacia múltiples servicios
- concentrar políticas de autenticación, rate limiting u observabilidad
- ocultar topología interna
- exponer una interfaz pública más estable
- soportar migraciones y rollout con control

## Cuándo puede ser exagerado o mal usado

Puede ser una mala idea cuando:

- el sistema todavía es muy chico y agrega más complejidad que beneficio
- se empieza a meter lógica de negocio pesada en el borde
- se pretende resolver con el gateway problemas que deberían modelarse mejor en los servicios
- se usa como parche para una mala separación de dominios

## Ejemplo intuitivo

Imaginemos un sistema con:

- `users-service`
- `catalog-service`
- `orders-service`
- `payments-service`
- `shipping-service`

Un cliente externo no necesariamente debería conocer ni invocar libremente cada una de esas piezas.
Tal vez lo más razonable sea que entre por un punto controlado que:

- valide autenticación
- aplique rate limiting
- enrute `/catalog` a catálogo
- enrute `/orders` a órdenes
- enrute `/payments` a pagos
- registre trazas iniciales
- oculte hosts e instancias internas

Mientras tanto, por dentro, los servicios siguen encontrándose mediante mecanismos de discovery y rutas internas separadas.

Eso reduce exposición innecesaria y ordena bastante la arquitectura.

## Descubrimiento, routing y observabilidad están muy conectados

En sistemas distribuidos, estas cosas no viven aisladas.

Para operar bien, conviene poder observar:

- qué servicio resolvió a qué instancia
- qué rutas reciben más tráfico
- dónde aparece latencia extra
- qué porcentaje del tráfico fue a una versión canary
- qué gateways o proxies están devolviendo errores
- si hay rutas inesperadas o abusivas

Sin esa visibilidad, discovery y routing pueden funcionar “en teoría”, pero ser muy difíciles de diagnosticar en producción.

## Riesgos comunes en esta parte de la arquitectura

## 1. Hardcodear destinos por todos lados

Funciona al principio y duele muchísimo después.

## 2. Exponer servicios internos innecesariamente

Aumenta superficie de ataque y acoplamiento externo.

## 3. Convertir el gateway en una capa de negocio gigante

Suele empezar como conveniencia y termina complicando mucho la evolución.

## 4. No pensar el routing como parte del rollout

Después cuesta muchísimo hacer canary, migraciones graduales o rollback controlado.

## 5. No tener ownership claro de reglas de tráfico

Cuando nadie sabe bien quién define qué rutas, qué políticas o qué límites, la operación se vuelve frágil.

## Preguntas que conviene hacerse

## 1. ¿Quién necesita encontrar a quién realmente?

No todas las piezas deberían llamarse entre sí.

## 2. ¿Qué servicios deben ser públicos y cuáles privados?

Esto define bastante del diseño de borde.

## 3. ¿Dónde conviene poner la complejidad: en clientes, en proxies o en infraestructura?

No hay respuesta única, pero la decisión debería ser consciente.

## 4. ¿El gateway está resolviendo un problema real o estamos agregando una moda?

Buena pregunta para evitar sobrediseño.

## 5. ¿Estamos usando el gateway para reglas transversales o para esconder una mala arquitectura de negocio?

Importa mucho distinguir una cosa de la otra.

## 6. ¿Cómo vamos a observar y depurar el tráfico cuando algo falle?

Sin trazabilidad, estas capas se vuelven cajas negras incómodas.

## Idea final

En microservicios, separar responsabilidades no alcanza.
Después hay que lograr que los servicios se encuentren, que el tráfico llegue al lugar correcto y que la entrada al sistema tenga reglas claras.

Ahí es donde service discovery, routing y gateways se vuelven piezas importantes.

No porque sean sofisticadas por sí mismas, sino porque resuelven problemas muy concretos:

- ubicación cambiante de servicios
- múltiples instancias
- balanceo y caminos de tráfico
- control de acceso
- estabilidad de la interfaz pública
- evolución operativa sin caos

Bien pensados, ayudan a que la arquitectura distribuida sea operable.
Mal usados, agregan acoplamiento, opacidad y puntos frágiles.

Por eso la pregunta no es solo “qué herramienta usamos”, sino:

**qué complejidad de comunicación y tráfico tiene nuestro sistema, y cuál es la forma más sana de gobernarla sin perder claridad.**
