---
title: "Patrones de refactor para reducir superficie SSRF"
description: "Patrones de refactor para reducir superficie SSRF en una aplicación Java con Spring Boot. Cómo pasar de features salientes demasiado genéricas a diseños con destinos más fijos, clientes más específicos, menos redirects, menos privilegio y contratos de red mucho más claros."
order: 157
module: "Consumo saliente, SSRF y conexiones externas"
level: "base"
draft: false
---

# Patrones de refactor para reducir superficie SSRF

## Objetivo del tema

Entender qué **patrones de refactor** ayudan a **reducir superficie SSRF** en una aplicación Java + Spring Boot.

La idea de este tema es pasar del diagnóstico a la corrección estructural.

Hasta ahora vimos:

- cómo detectar SSRF
- cómo revisar features salientes
- cómo priorizar hallazgos por impacto real
- qué papel juegan workers, proxies, metadata, errores, red e identidad

Ahora toca una pregunta muy práctica:

> cuando encontrás una superficie saliente riesgosa, ¿cómo la mejorás sin limitarte a poner un parche aislado?

Porque muchas veces la primera reacción es:

- agregar una regex
- bloquear `localhost`
- sumar un `if`
- meter una blacklist
- dejar un comentario
- o envolver la llamada con una validación rápida

Eso puede ayudar a corto plazo.
Pero no siempre reduce bien la superficie.

En resumen:

> muchas superficies SSRF no se corrigen de verdad agregando una condición más,  
> sino **refactorizando el diseño del feature** para que el backend tenga menos libertad de salida, menos genericidad y menos poder implícito.

---

## Idea clave

Los bugs de SSRF suelen aparecer cuando una feature saliente tiene alguna combinación de estas cosas:

- destinos demasiado libres
- clientes HTTP demasiado genéricos
- demasiada confianza en input externo
- redirects poco controlados
- workers o servicios con demasiado poder
- mezcla entre negocio y conectividad
- contenido remoto procesado sin una frontera clara

La idea central es esta:

> un buen refactor reduce el problema desde la estructura, no solo desde el filtro.

Eso suele significar cosas como:

- menos destinos variables
- menos decisiones salientes delegadas al usuario
- más clientes específicos por caso de uso
- más límites claros de red, tamaño y tiempo
- menos mezcla entre “input remoto” y “objeto de negocio”

### Idea importante

El refactor bueno no es el que “bloquea justo este payload”.
Es el que hace que el feature entero tenga menos superficie de abuso aunque aparezcan variantes nuevas o un dev futuro no recuerde todos los casos raros.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- arreglar una SSRF con un parche aislado que deja intacto el diseño riesgoso
- confiar demasiado en blacklists o checks textuales
- no aprovechar el hallazgo para reducir genericidad estructural
- mantener wrappers demasiado poderosos y solo agregar controles arriba
- corregir el destino pero no el worker, el proxy o la identidad
- creer que remediar SSRF es siempre una cuestión de validación y no de arquitectura

Es decir:

> el problema no es solo que exista una superficie saliente vulnerable.  
> El problema es que muchas veces esa superficie fue diseñada con demasiada flexibilidad, y mientras eso no cambie, seguirán apareciendo nuevos puntos flojos.

---

## Error mental clásico

Un error muy común es este:

### “Con una validación un poco más estricta ya debería quedar bien”

A veces sí alcanza.
Pero muchas veces no.

Porque si el diseño sigue siendo algo como:

- “recibo una URL”
- “la reviso un poco”
- “la paso a un cliente HTTP bastante genérico”
- “sigo redirects”
- “descargo lo que venga”
- “si falla, doy buen feedback”

entonces la superficie de fondo sigue muy parecida.

### Idea importante

El parche puntual tapa una variante.
El refactor estructural reduce la clase de problema.

---

# Patrón 1: pasar de destino libre a destino más fijo

## Qué significa

En vez de aceptar:

- una URL completa
- un host configurable casi libre
- o un endpoint muy abierto

el sistema pasa a aceptar algo más acotado, por ejemplo:

- un proveedor conocido
- un identificador interno
- una opción de integración predefinida
- una ruta bajo un host ya controlado
- un callback bajo reglas mucho más estrechas

### Ejemplo conceptual

Antes:
- “pasame la URL”

Después:
- “elegí uno de estos destinos válidos”
o
- “registrá un destino dentro de este modelo mucho más controlado”

### Por qué reduce SSRF

Porque reduce drásticamente:
- quién decide adónde sale el backend
- cuánto varía el destino
- y cuántas ramas debe cubrir tu validación

### Idea importante

Cada grado menos de libertad en el destino suele ser una gran reducción de superficie.

---

# Patrón 2: pasar de cliente genérico a cliente específico por caso de uso

## Qué significa

En vez de tener un wrapper del estilo:

- `fetch(url, method, headers, body, options)`

conviene refactorizar hacia clientes más estrechos, por ejemplo:

- cliente de preview
- cliente de webhook delivery
- cliente de proveedor X
- cliente de descarga de imágenes
- cliente de metadata pública

### Por qué reduce SSRF

Porque cada cliente puede codificar:

- host o tipo de destino esperado
- esquema permitido
- límites de tamaño
- redirects tolerados
- timeouts
- headers aceptables
- comportamiento específico

### Idea útil

La genericidad técnica suele ser enemiga del contrato saliente claro.

### Idea importante

Un cliente más específico no solo es más fácil de auditar.
También es más difícil de usar mal.

---

# Patrón 3: separar validación, fetch y procesamiento

## Qué significa

Muchas veces una feature mezcla en el mismo flujo:

- parseo del destino
- validación
- request saliente
- lectura del contenido
- transformación
- persistencia
- logging
- respuesta al usuario

Eso vuelve más difícil ver dónde cambia la confianza.

### El refactor sano

separa al menos estas fases:

1. interpretar destino
2. validar contrato saliente
3. ejecutar fetch bajo límites claros
4. decidir si el contenido es apto
5. recién entonces procesar o persistir

### Por qué reduce SSRF

Porque hace más visible:
- qué se valida
- cuándo se valida
- y qué parte del contenido remoto entra realmente al sistema

### Idea importante

Cuando todo pasa junto, la confianza se hereda de forma borrosa.
Cuando separás fases, la podés cuestionar mejor.

---

# Patrón 4: cortar redirects como default y habilitarlos solo donde haga falta

## Qué significa

Muchos flows nacen con follow redirects “porque así funciona mejor”.
Eso suele ampliar bastante la superficie.

Un refactor sano puede hacer:

- no seguir redirects por default
- o seguirlos solo en ciertos casos
- o tratarlos como una nueva validación explícita

### Por qué reduce SSRF

Porque evita que la confianza del primer destino se extienda automáticamente al recorrido completo.

### Idea útil

Los redirects no deberían ser una comodidad silenciosa del cliente HTTP.
Deberían ser una decisión del contrato del feature.

---

# Patrón 5: mover features salientes riesgosas a procesos más pequeños y menos privilegiados

## Qué significa

Si una feature es especialmente flexible o expuesta, a veces conviene sacarla de un proceso demasiado poderoso y llevarla a:

- un worker dedicado
- un servicio más chico
- un componente con menos identidad
- un entorno con menos egress
- una red más contenida

### Por qué reduce SSRF

Porque aunque la lógica siga siendo imperfecta, el impacto potencial ya corre en un proceso más acotado.

### Ejemplo conceptual

Antes:
- preview corre dentro del backend principal con mucha reachability

Después:
- preview corre en un worker con menos privilegio y menos salida de red

### Idea importante

A veces el mejor refactor no está en la línea del `WebClient`, sino en **dónde vive el feature**.

---

# Patrón 6: pasar de “importar lo que venga” a “aceptar solo un contrato chico de contenido”

## Qué significa

Muchos downloads o previews aceptan más contenido del necesario por comodidad.

Un refactor sano hace preguntas como:

- ¿necesitamos HTML completo o solo algunos metadatos?
- ¿necesitamos cualquier imagen o solo ciertos tipos y tamaños?
- ¿necesitamos descargar el PDF entero o alcanza con otra interacción?
- ¿de verdad hace falta bajar el archivo desde backend?

### Por qué reduce SSRF

Porque corta superficie no solo del destino, sino también de:
- tamaño
- tipo
- persistencia
- pipeline posterior

### Idea útil

Reducir el contrato de contenido también es reducir superficie SSRF y de ingestión.

---

# Patrón 7: dejar de persistir confianza implícita

## Qué significa

A veces el problema no está en la request inmediata, sino en que el sistema persiste:

- callback URLs
- endpoints remotos
- hosts de integración
- metadata de previews
- recursos descargados
- decisiones de confianza tomadas una vez

Un refactor sano revisa:

- qué se guarda
- por cuánto tiempo
- bajo qué validación
- con qué revalidación posterior
- y qué parte de eso debería ser más efímera o más acotada

### Por qué reduce SSRF

Porque evita que una validación floja de hoy se convierta en confianza duradera mañana.

### Idea importante

Persistir destinos es persistir decisiones de confianza.
Eso merece diseño explícito, no solo un campo más en la base.

---

# Patrón 8: reducir feedback ofensivamente útil

## Qué significa

Otra forma de refactor útil no cambia tanto el fetch, sino la interfaz del feature hacia afuera.

Por ejemplo:

- menos detalle de DNS
- menos distinción entre tipos de error
- menos status ricos
- menos redirects expuestos
- menos timing útil
- mejor separación entre logs internos y respuesta externa

### Por qué reduce SSRF

Porque, aunque no elimine toda capacidad de salida, reduce el valor de la feature como herramienta de reconocimiento.

### Idea útil

A veces el refactor correcto no es “que deje de salir”, sino “que deje de contar tan bien lo que aprendió al salir”.

---

# Patrón 9: reemplazar pruebas libres por flujos de validación más acotados

## Qué significa

Los “test connection” muchas veces son mini-sondas de red.
Un refactor sano puede transformarlos en algo más específico, por ejemplo:

- validar solo el tipo de integración declarado
- probar contra condiciones más limitadas
- no aceptar destinos tan libres
- no devolver detalles tan ricos
- separar setup de troubleshooting profundo

### Por qué reduce SSRF

Porque saca del sistema una capacidad de exploración demasiado genérica disfrazada de soporte.

### Idea importante

No todo botón de prueba necesita parecer una herramienta de diagnóstico completa.

---

# Patrón 10: sacar la política de seguridad del “uso correcto esperado” y meterla en el diseño

## Qué significa

Hay sistemas donde la defensa depende de que el dev que use el wrapper recuerde:

- pasar el host correcto
- no habilitar redirects
- poner timeouts
- no loguear headers
- no devolver ciertos errores
- no usar ese worker poderoso

Eso es una mala base.

Un refactor sano intenta que:

- el camino seguro sea el camino natural
- el cliente ya venga restringido
- el proceso ya tenga poco privilegio
- el egress ya esté contenido
- el contrato del feature ya limite lo esperable

### Por qué reduce SSRF

Porque deja menos seguridad crítica apoyada en memoria, disciplina o buena voluntad.

### Idea importante

La mejor remediación suele ser la que hace más difícil equivocarse, no la que exige acordarse siempre de no equivocarse.

---

## Cómo elegir qué patrón aplicar primero

No hace falta aplicar todos juntos.
Podés priorizar según el hallazgo.

### Si el mayor problema es el destino
- fijar más el destino
- pasar de URL libre a opciones más controladas
- cortar redirects
- mejorar parseo y normalización

### Si el mayor problema es el cliente
- pasar de wrapper genérico a cliente específico
- sacar headers, métodos y opciones arbitrarias
- endurecer defaults

### Si el mayor problema es el contexto de ejecución
- separar worker
- bajar privilegios
- recortar egress
- segmentar red

### Si el mayor problema es el contenido
- reducir tipo y tamaño
- separar fetch de procesamiento
- cortar persistencia innecesaria

### Si el mayor problema es reconocimiento
- bajar riqueza de errores
- revisar logs
- reducir timing y feedback expuesto

### Idea útil

El refactor más útil es el que corta la dimensión dominante del riesgo en ese feature concreto.

---

## Qué NO conviene hacer como “remediación” insuficiente

Hay algunos pseudo-arreglos que suelen quedarse cortos si el diseño sigue igual:

- blacklist de `localhost` y listo
- regex más grande sobre la URL
- meter una allowlist vaga pero seguir con cliente genérico
- mantener redirects libres “porque algunos links reales lo necesitan”
- dejar el worker demasiado privilegiado
- loguear todo pero esconderlo solo en nivel debug
- decir “esto solo lo usa admin”
- validar al guardar y olvidarse del uso posterior

### Regla sana

Si el diseño estructural sigue regalando flexibilidad y poder, el fix probablemente quedó débil aunque tape una variante puntual.

---

## Qué preguntas conviene hacer antes de refactorizar

Cuando tengas un hallazgo de SSRF o consumo saliente riesgoso, conviene preguntar:

- ¿qué parte del riesgo nace del destino?
- ¿qué parte nace del cliente?
- ¿qué parte nace del worker o del contexto?
- ¿qué parte nace del contenido remoto?
- ¿qué parte nace del feedback y logging?
- ¿cuál de estas dimensiones puedo cortar más barato con un refactor de diseño?
- ¿qué mejora vuelve más pequeño el contrato del feature?
- ¿qué cambio hace que el camino seguro sea más natural?
- ¿qué dependencia actual en “uso correcto” puedo eliminar?

### Idea importante

El mejor refactor no siempre toca la línea del bug.
A veces toca la forma en que el feature fue concebido.

---

## Cómo reconocer oportunidades de refactor en una codebase Spring

En una app Spring, conviene sospechar que hace falta refactor cuando veas:

- `RestTemplate` o `WebClient` recibiendo destinos dinámicos en muchas capas
- wrappers genéricos usados por todo
- workers con demasiada responsabilidad
- servicios que mezclan parseo, fetch, validación y procesamiento
- clientes de preview, webhook y download compartiendo la misma infraestructura lógica
- callbacks o endpoints persistidos sin mucho modelado
- demasiados flags para “adaptar” un mismo cliente a casos muy distintos

### Idea útil

Cuanto más flags y ramificaciones necesita un mismo componente saliente, más probable es que el diseño esté pidiendo separación y especificidad.

---

## Qué conviene revisar en una app Spring

Cuando revises patrones de refactor para reducir superficie SSRF en una aplicación Spring, mirá especialmente:

- qué features usan destinos demasiado libres
- qué wrappers HTTP son más genéricos
- qué procesos salientes están sobredimensionados en privilegios
- qué flows mezclan fetch y procesamiento
- dónde se siguen redirects por default
- qué confianza queda persistida sin mucho control
- qué tipo de feedback ofensivo devuelve la app
- qué cambio estructural reduciría más superficie con menos complejidad añadida

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- destinos más acotados
- clientes más específicos
- menos genericidad
- menos redirects libres
- workers más pequeños y menos poderosos
- contratos de contenido más claros
- menos confianza persistida sin revisión
- menos logging y feedback peligrosamente ricos
- menos dependencia en que cada dev “use bien” la infraestructura saliente

### Idea importante

La madurez acá se nota cuando la superficie saliente se vuelve más aburrida, más específica y más difícil de abusar.

---

## Señales de ruido

Estas señales merecen refactor fuerte:

- URL libre + cliente genérico + worker poderoso
- muchas features distintas sobre el mismo wrapper
- callbacks, previews y downloads resueltos con la misma lógica flexible
- redirects y retries por default
- demasiada mezcla entre red, parseo y negocio
- workers con egress y privilegios amplios
- demasiadas decisiones de seguridad apoyadas en “uso correcto”
- el sistema parece más un toolkit de conectividad que un conjunto de features con contratos acotados

### Regla sana

Cuanto más se parezca tu capa saliente a una navaja suiza, más probable es que el mejor fix sea un refactor y no otro parche.

---

## Checklist práctica

Cuando pienses un refactor para reducir superficie SSRF, preguntate:

- ¿puedo fijar más el destino?
- ¿puedo pasar de cliente genérico a uno específico?
- ¿puedo separar validación, fetch y procesamiento?
- ¿puedo cortar redirects por default?
- ¿puedo mover esta feature a un proceso más pequeño?
- ¿puedo reducir tipo, tamaño o variedad del contenido remoto?
- ¿puedo dejar de persistir tanta confianza?
- ¿puedo reducir feedback y logging ofensivamente útiles?
- ¿puedo hacer que el camino seguro sea el default del diseño?
- ¿qué patrón corta mejor la dimensión principal del riesgo en este caso?

---

## Mini ejercicio de reflexión

Tomá una feature saliente real de tu app Spring y respondé:

1. ¿Cuál es su mayor dimensión de riesgo hoy?
2. ¿El problema principal está en el destino, el cliente, el worker o el contenido?
3. ¿Qué patrón de refactor le aplica mejor?
4. ¿Qué cambio reduciría más superficie con menos complejidad?
5. ¿Qué parte hoy depende demasiado de “que el dev lo use bien”?
6. ¿Qué haría el contrato del feature más chico y claro?
7. ¿Qué refactor priorizarías primero?

---

## Resumen

Reducir superficie SSRF muchas veces requiere refactorizar el diseño del feature y no solo tapar una variante puntual con una validación más.

Los patrones más útiles suelen ser:

- fijar más el destino
- usar clientes específicos
- separar validación, fetch y procesamiento
- cortar redirects por default
- mover features riesgosas a workers menos privilegiados
- reducir tipo y tamaño de contenido remoto
- persistir menos confianza
- bajar feedback y logging ofensivamente útiles
- hacer que el camino seguro sea el camino natural

En resumen:

> un backend más maduro no corrige una superficie saliente riesgosa únicamente agregando un filtro nuevo donde falló el último caso detectado, sino que aprovecha el hallazgo para preguntarse qué parte del diseño hizo posible que esa feature tuviera tanta libertad, tanta reachability o tanta confianza implícita en primer lugar.  
> Y justamente ahí aparece el valor de estos patrones de refactor: en que transforman una remediación frágil y reactiva en un cambio más estructural donde el backend deja de parecer una herramienta general de conectividad y vuelve a parecer lo que debería ser: un conjunto de features específicas, con contratos acotados, procesos menos poderosos y mucha menos superficie disponible para que la próxima variante de SSRF encuentre camino libre.

---

## Próximo tema

**Cómo escribir hallazgos SSRF accionables para un equipo**
