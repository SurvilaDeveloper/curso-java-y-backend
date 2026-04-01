---
title: "Cómo documentar decisiones técnicas y arquitectónicas para que el backend siga siendo entendible al crecer"
description: "Entender por qué un backend Spring Boot necesita dejar explícitas ciertas decisiones técnicas y arquitectónicas, y cómo documentarlas de forma práctica para que el crecimiento del proyecto no dependa solo de memoria informal o contexto perdido."
order: 88
module: "Arquitectura y crecimiento del backend"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo pensar los tradeoffs entre:

- monolito modular
- microservicios
- separación más fuerte entre servicios
- crecimiento interno del backend
- costos de operación
- testing
- seguridad
- equipos
- datos
- complejidad distribuida

Eso ya te dejó una idea muy importante:

> cuando el backend crece, muchas decisiones dejan de ser obvias, y elegir una forma de arquitectura u otra ya no depende solo de gusto personal sino de tradeoffs reales.

Pero ahí aparece un problema muy común en proyectos reales:

> aunque se hayan tomado buenas decisiones, muchas veces nadie deja realmente claro por qué se tomaron.

Y cuando eso pasa, el proyecto empieza a depender demasiado de cosas como:

- memoria oral
- contexto tácito
- “yo me acuerdo más o menos”
- una persona clave que un día no está
- intuiciones vagas
- discusiones repetidas una y otra vez
- refactors que rompen decisiones importantes sin saberlo

Entonces aparece una necesidad muy concreta:

- **documentar decisiones técnicas**
- **dejar explícitas decisiones arquitectónicas**
- **registrar por qué se eligió algo y no otra cosa**
- **hacer que el backend pueda seguir creciendo sin depender de contexto perdido**

Este tema es clave porque un proyecto grande no solo necesita código entendible.
También necesita que ciertas decisiones queden **visibles, justificadas y recuperables** con el tiempo.

## El problema de que la arquitectura viva solo en la cabeza de alguien

Cuando un backend todavía es chico, muchas decisiones parecen fáciles de recordar:

- usamos JWT
- organizamos por módulos
- pagos vive en su propio subdominio
- storage va por proveedor externo
- webhooks actualizan estados locales
- auth externa genera igual un usuario interno

Mientras el equipo es chico y el proyecto todavía no explotó en complejidad, eso puede sobrevivir un tiempo.

Pero a medida que el sistema crece, empiezan a pasar cosas como:

- alguien nuevo entra al proyecto
- alguien que conocía mucho se va
- una decisión tomada hace seis meses ya no se entiende
- aparece un bug y nadie recuerda por qué cierta cosa se hizo así
- se reabre una discusión ya resuelta porque no quedó registro
- se propone un cambio que choca con una restricción ya conocida, pero nadie la dejó escrita

Ahí es donde la falta de documentación de decisiones empieza a costar caro.

## Qué significa documentar decisiones técnicas

No significa llenar el proyecto de documentos eternos que nadie lee.

Tampoco significa explicar obviedades que el código ya muestra bastante bien.

Primero conviene entenderlo así:

> documentar decisiones técnicas significa dejar explícitas aquellas elecciones que afectan de manera importante la evolución del backend y que no se deducen del código con facilidad o que perderían contexto con el tiempo.

Esta definición es muy importante porque filtra muchísimo.

No se trata de documentar todo.
Se trata de documentar **lo que realmente conviene no perder**.

## Qué tipo de decisiones suelen valer la pena documentar

Por ejemplo:

- por qué usamos JWT y no sesión clásica
- por qué el login externo sigue generando usuario local
- por qué pagos queda en estado pendiente hasta webhook
- por qué ciertas tareas se desacoplan por eventos
- por qué storage usa proveedor externo y metadata local
- por qué no se expone cierta entidad directamente
- por qué se eligió monolito modular y no separar servicios todavía
- por qué cierta integración se encapsula detrás de un gateway
- por qué cierto módulo no depende directamente de otro
- por qué cierta API se versionó
- por qué cierta decisión de seguridad se implementó de esa forma

Fijate que muchas de estas cosas no se entienden del todo solo mirando código suelto.
Necesitan contexto.

## Qué cosas normalmente no hace falta documentar así

No hace falta crear una “decisión arquitectónica” por:

- cambiar el nombre de una variable
- mover una clase de paquete
- elegir entre dos helpers triviales
- detalles demasiado pequeños sin impacto real
- cosas que el código ya expresa perfectamente y no tienen tradeoff especial

La clave está en reconocer decisiones que tengan:

- impacto duradero
- consecuencias en varios módulos
- tradeoffs reales
- contexto que se perdería
- o una alta probabilidad de ser discutidas de nuevo más adelante

## Una intuición muy útil

Podés pensar así:

> si dentro de seis meses alguien podría preguntar “¿por qué hicimos esto así?”, probablemente haya una buena chance de que valga la pena dejarlo escrito.

Esta heurística es simple y muy poderosa.

## Qué problema resuelve documentar decisiones

Resuelve varias cosas a la vez.

Por ejemplo:

- evita rediscutir eternamente lo mismo
- acelera onboarding
- ayuda a entender límites del sistema
- hace más seguros ciertos refactors
- deja claras restricciones técnicas o de negocio
- mejora la continuidad del proyecto aunque cambien personas
- baja la dependencia de memoria informal

Es decir, no es un gesto decorativo.
Es una herramienta de continuidad.

## Qué forma puede tener esta documentación

No hace falta empezar con algo gigantesco.

Muchas veces una forma muy práctica es usar documentos cortos y concretos, por ejemplo:

- uno por decisión importante
- con fecha
- contexto
- decisión tomada
- alternativas consideradas
- consecuencias

Esto ya suele aportar muchísimo más que tener cero registro.

## Una estructura muy simple y útil

Podrías pensar algo así:

### Título
Qué decisión se tomó.

### Contexto
Qué problema o situación motivó la decisión.

### Decisión
Qué se eligió concretamente.

### Alternativas consideradas
Qué otras opciones había y por qué no se eligieron.

### Consecuencias
Qué ventajas, costos o restricciones trae esa decisión.

Esta estructura es simple, práctica y evita documentos llenos de humo.

## Un ejemplo muy claro

Supongamos una decisión así:

### Título
Autenticación principal con JWT y no con sesión de servidor.

### Contexto
El frontend está desacoplado del backend, habrá clientes web y posiblemente móvil, y necesitamos un esquema cómodo para API.

### Decisión
Usar JWT como mecanismo principal de autenticación operativa de la API.

### Alternativas consideradas
- sesión tradicional
- Basic Auth
- JWT

### Consecuencias
- buena integración con frontend separado
- necesidad de manejar refresh y expiración
- necesidad de filtro JWT y manejo de Bearer token
- mayor cuidado en almacenamiento y logout

Fijate lo útil que es esto para alguien que entre después al proyecto.

## Qué valor tiene dejar también las alternativas

Muchísimo.

Porque si solo escribís “decidimos X”, a veces todavía queda la duda de si fue una ocurrencia arbitraria o si realmente se pensó frente a otras opciones.

En cambio, cuando dejás algo como:

- consideramos A
- consideramos B
- elegimos C por estas razones

la decisión gana muchísimo más contexto y durabilidad.

## Qué valor tienen las consecuencias

También es muy importante.

Porque una buena decisión técnica casi nunca viene gratis.
Suele traer beneficios, pero también costos o restricciones.

Por ejemplo:

- JWT da flexibilidad para frontend desacoplado
- pero exige pensar refresh y expiración

- storage externo ayuda con archivos
- pero obliga a manejar metadata local y fallos parciales

- monolito modular simplifica operación
- pero exige cuidar mejor fronteras internas

Dejar explícitas las consecuencias evita que la documentación suene a propaganda.
Y la vuelve mucho más útil.

## Qué tipo de decisiones arquitectónicas del bloque que venís construyendo serían muy buenas candidatas

Por ejemplo:

### Seguridad
- JWT como auth principal
- refresh token o no
- `/me` como endpoint centrado en usuario autenticado
- roles locales aunque exista OAuth externo

### Integraciones
- storage externo con metadata local
- pagos confirmados por webhook y no por frontend
- gateway para proveedores externos
- emails desacoplados de la request principal

### Arquitectura interna
- modularización por dominio
- separación dominio/aplicación/infraestructura
- límites de contexto entre payments, orders, auth y storage
- monolito modular como estrategia actual

### API
- versionado solo ante cambios incompatibles
- contratos públicos no acoplados a entidades
- documentación de 401/403 y Bearer token

Todo esto tiene muchísimo sentido dejarlo explícito.

## Qué relación tiene esto con onboarding

Muy fuerte.

Cuando alguien nuevo entra a un proyecto, una de las preguntas más difíciles no suele ser:

- “qué clase hace tal cosa”

sino más bien:

- “por qué el sistema está pensado así”
- “por qué pagos funciona con estado pendiente”
- “por qué no se llama directo a notificaciones desde checkout”
- “por qué auth externa sigue creando usuario local”
- “por qué no usamos microservicios todavía”

Ese tipo de preguntas se resuelven mucho mejor con decisiones documentadas que con código aislado.

## Qué relación tiene esto con refactors

También muy fuerte.

Porque si una decisión no quedó escrita, alguien podría refactorizar algo pensando que solo está simplificando, cuando en realidad está rompiendo un tradeoff importante.

Por ejemplo:

- querer marcar la orden como pagada directamente desde la respuesta inicial del checkout
- sacar metadata local del storage porque “ya está la URL”
- meter pagos y órdenes en el mismo módulo otra vez
- eliminar eventos porque “parecen indirectos”
- volver a acoplar auth y users porque “es más rápido”

Si la razón de la separación original no quedó documentada, esos cambios se vuelven más probables.

## Qué relación tiene esto con decisiones ya superadas

Muy buena pregunta.

La documentación de decisiones no es sagrada ni eterna.
Puede pasar que una decisión:

- haya sido correcta en un momento
- pero luego el sistema haya cambiado
- y ahora convenga otra

Eso está perfecto.

La gracia no es congelar el proyecto.
La gracia es que, si cambiás una decisión importante, también quede explícito:

- qué cambió
- por qué cambió
- qué decisión anterior queda obsoleta

Eso mantiene mucha más continuidad que simplemente cambiar código en silencio.

## Qué pasa con decisiones obsoletas

Muchas veces conviene marcar algo como:

- reemplazada por tal decisión nueva
- obsoleta desde tal fecha
- ya no vigente por cambio de arquitectura

Esto es más útil que borrar toda huella del pasado, porque muchas veces entender la evolución también ayuda a entender el sistema actual.

## Qué relación tiene esto con PRs y discusiones del equipo

Muy fuerte.

Muchas veces las discusiones importantes quedan en:

- chats
- llamadas
- comentarios de PR
- mensajes sueltos

Y eso sirve durante unos días, pero después se pierde.

Entonces, cuando de una discusión sale una decisión arquitectónica importante, suele tener mucho sentido consolidarla en un documento corto y durable.

Eso evita depender de herramientas o conversaciones que se pierden rápido en el tiempo.

## Qué relación tiene esto con el código

También es importante aclararlo:

la documentación de decisiones no reemplaza al código bien escrito.

No se trata de usar documentos para tapar código incomprensible.

Lo ideal es:

- código claro
- nombres razonables
- estructura sana
- y además documentación breve para decisiones de alto impacto cuyo contexto no se ve completo solo en el código

Es una combinación, no una sustitución.

## Qué no conviene hacer

No conviene escribir documentos gigantescos llenos de teoría abstracta que no aterrizan en el proyecto real.

Tampoco conviene documentar cosas tan obvias o tan pequeñas que nadie nunca las consultaría.

La utilidad está en capturar decisiones con contexto real del sistema, no en producir burocracia.

## Un buen ejemplo de decisión útil del proyecto

Podrías tener algo como:

### Título
Los pagos se consideran confirmados únicamente a partir de confirmación del proveedor, preferentemente por webhook.

### Contexto
La respuesta inicial del checkout no garantiza aprobación final. El usuario puede abandonar el flujo, el proveedor puede confirmar más tarde y el frontend no debe ser fuente de verdad del estado de pago.

### Decisión
El backend mantendrá un estado local de intento de pago y actualizará pedido e intento solo a partir de confirmación confiable del proveedor, principalmente vía webhook.

### Alternativas consideradas
- marcar pagado desde la respuesta inicial del checkout
- confiar en lo que informa el frontend
- usar solo polling manual
- usar webhook como fuente principal

### Consecuencias
- existen estados pendientes
- el frontend debe tolerar consistencia eventual
- el módulo payments necesita webhook e idempotencia
- se reduce el riesgo de marcar pagos como aprobados sin confirmación real

Esto es extremadamente valioso para cualquier persona que toque pagos después.

## Otro ejemplo útil

### Título
Storage externo para archivos, metadata de negocio local en base relacional.

### Contexto
La aplicación maneja imágenes y archivos asociados a usuarios, productos y otros recursos del dominio. No conviene mezclar almacenamiento físico de blobs con semántica de negocio y relaciones del sistema.

### Decisión
El archivo real se almacena en proveedor externo y el backend persiste únicamente metadata local relevante: externalId, URL o referencia, relación con el recurso, estado, flags de visibilidad, etc.

### Alternativas consideradas
- guardar archivos completos en la base relacional
- guardar en disco local del servidor
- storage externo con metadata local

### Consecuencias
- mejor separación entre storage y dominio
- necesidad de manejar fallos parciales en upload/delete
- dependencia de proveedor externo encapsulada detrás de gateway
- la base conserva la semántica de negocio

Otra vez, esto ahorra muchísimo contexto perdido.

## Qué relación tiene esto con equipos chicos

Algunas personas piensan que esto solo sirve para empresas gigantes.

Pero incluso en equipos chicos puede aportar mucho, porque el problema no es solo el tamaño del equipo.
También importan cosas como:

- el tiempo
- los olvidos
- los cambios de prioridades
- los meses que pasan
- los refactors
- las decisiones que ya nadie recuerda bien

Un equipo chico también se beneficia mucho de no depender de memoria informal.

## Qué relación tiene esto con proyectos personales serios

También bastante.

Si un proyecto personal empieza a crecer y querés que siga evolucionando de manera profesional, dejar claras algunas decisiones fuertes puede ayudarte muchísimo más adelante.

Especialmente cuando el proyecto ya tiene:

- auth
- frontend real
- pagos
- storage
- webhooks
- varios módulos
- integraciones externas

A esa altura, el sistema ya merece un poco más de memoria explícita.

## Qué relación tiene esto con arquitectura viva

Muy fuerte.

La arquitectura no es solo un dibujo inicial ni una promesa abstracta.
Es también el conjunto de decisiones que se van tomando con el tiempo.

Entonces documentar decisiones es una forma muy concreta de mantener la arquitectura viva y legible, en vez de dejar que se vuelva una masa de cambios acumulados sin relato.

## Qué no conviene olvidar

Una decisión documentada debería ser:

- concreta
- breve
- situada en el contexto real del proyecto
- con tradeoffs honestos
- fácil de encontrar
- fácil de actualizar si cambia

No hace falta más que eso para que ya aporte muchísimo.

## Otro error común

Usar documentación para justificar cualquier cosa a posteriori, en vez de realmente capturar el problema y el criterio de decisión.

La documentación útil no es propaganda.
Es memoria técnica con contexto.

## Otro error común

No revisitar nunca esas decisiones.
Algunas siguen vigentes por años.
Otras quedan viejas.
Lo sano es poder marcarlo explícitamente.

## Otro error común

Guardar documentación de arquitectura en lugares demasiado escondidos o dispersos, donde nadie la encuentra cuando la necesita.

Si el objetivo es continuidad, también importa la encontrabilidad.

## Una buena heurística

Podés preguntarte:

- ¿esta decisión tiene impacto grande o duradero?
- ¿el código por sí solo cuenta bien el porqué?
- ¿existen tradeoffs reales que conviene no olvidar?
- ¿esto podría rediscutirse o malinterpretarse más adelante?
- ¿si alguien nuevo entra al proyecto, esta decisión le ahorraría bastante tiempo?

Si la respuesta es sí, probablemente valga la pena documentarla.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque a esta altura del backend ya pasaste por decisiones importantes de:

- seguridad
- frontend
- pagos
- storage
- notificaciones
- integraciones
- modularización
- límites internos
- crecimiento del sistema

Y el valor de dejar eso explícito crece muchísimo con el tiempo.

## Relación con Spring Boot

Spring Boot te da mucha libertad y velocidad para construir.
Pero cuanto más rápido y flexible es el desarrollo, más fácil es que las decisiones importantes se pierdan entre commits, PRs y memoria informal.

Por eso esta práctica se vuelve tan valiosa:
complementa la velocidad del framework con una memoria arquitectónica más consciente.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> documentar decisiones técnicas y arquitectónicas importantes ayuda a que el crecimiento de un backend Spring Boot no dependa solo de memoria informal, dejando explícitos contexto, alternativas y consecuencias de elecciones que afectan seguridad, pagos, storage, modularización y otras partes sensibles del sistema.

## Resumen

- Un backend grande necesita memoria explícita de ciertas decisiones importantes.
- No hace falta documentarlo todo, sino lo que tenga impacto duradero o contexto difícil de deducir del código.
- Contexto, decisión, alternativas y consecuencias forman una estructura muy útil y práctica.
- Esta documentación ayuda muchísimo en onboarding, refactors y continuidad del proyecto.
- No reemplaza al código claro, sino que lo complementa.
- También sirve en equipos chicos o proyectos personales serios cuando el sistema ya creció bastante.
- Este tema suma una capa muy importante de madurez al backend: no solo tomar buenas decisiones, sino dejar claro por qué existen.

## Próximo tema

En el próximo tema vas a ver cómo preparar mejor un backend para producción desde el punto de vista de configuración, secretos, entornos y despliegue, porque cuando el sistema ya tiene varias piezas serias, la forma de operarlo empieza a importar tanto como la forma de programarlo.
