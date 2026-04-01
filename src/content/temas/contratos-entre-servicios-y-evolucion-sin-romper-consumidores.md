---
title: "Contratos entre servicios y evolución sin romper consumidores"
description: "Cómo pensar contratos entre servicios, por qué se rompen, qué significa compatibilidad en sistemas distribuidos y cómo evolucionar APIs, eventos y mensajes sin dañar consumidores que dependen de ellos."
order: 157
module: "Microservicios y sistemas distribuidos"
level: "intermedio"
draft: false
---

## Introducción

Una vez que varios servicios empiezan a hablar entre sí, aparece una realidad que al principio puede pasar desapercibida:

**cada interacción distribuida crea un contrato.**

A veces ese contrato se ve clarísimo:

- un endpoint HTTP con request y response definidos
- un schema de evento en un broker
- un mensaje en una cola
- una interfaz gRPC

Y otras veces el contrato existe aunque el equipo no lo haya formalizado del todo:

- nombres de campos esperados
- significados implícitos
- códigos de error asumidos por costumbre
- reglas de orden o frecuencia de mensajes
- semántica de estados que varios consumidores interpretan igual

El problema es que en sistemas distribuidos **los contratos viven más de lo que uno imagina**.

Porque una vez que otro servicio, otro equipo o incluso un cliente externo empieza a depender de una forma concreta de interacción, cambiarla deja de ser un detalle interno.
Pasa a ser un problema de compatibilidad.

Y ahí aparece una de las lecciones más importantes de arquitectura distribuida:

**romper un contrato entre servicios suele ser mucho más caro que cambiar código interno.**

Por eso este tema no trata solo de “documentar bien una API”.
Trata de entender:

- qué es realmente un contrato entre servicios
- por qué evolucionarlo es delicado
- qué significa compatibilidad hacia atrás y hacia adelante
- cómo cambiar sin romper consumidores existentes
- qué prácticas ayudan a introducir versiones, transiciones y deprecaciones con criterio

Porque en microservicios no alcanza con que cada servicio funcione solo.
También tiene que poder **cambiar sin destruir a los demás**.

## Qué es un contrato entre servicios

Un contrato entre servicios es el conjunto de expectativas compartidas que permiten que dos piezas interactúen correctamente.

Eso incluye mucho más que un JSON bonito.

Un contrato puede abarcar:

- forma de request y response
- tipos de datos
- campos obligatorios y opcionales
- nombres y significado de estados
- códigos de error
- semántica temporal
- frecuencia esperada de mensajes
- comportamiento ante duplicados
- garantías de orden
- versionado
- políticas de reintento
- significado de un evento publicado

Dicho simple:

**el contrato no es solo la estructura del mensaje; también es el comportamiento que el otro lado espera.**

Por eso a veces un equipo cambia algo “menor” y rompe producción igual.
No porque haya cambiado un tipo de dato visible a simple vista, sino porque alteró una expectativa que un consumidor ya había incorporado.

## El error clásico: creer que como el servicio es mío, puedo cambiarlo libremente

En un monolito, muchas veces cambiar una función interna puede ser relativamente barato si todo se recompila junto y el impacto se detecta rápido.

En sistemas distribuidos, no.

Porque un servicio puede tener consumidores que:

- despliegan en otro momento
- pertenecen a otro equipo
- no están coordinados con el emisor
- no pueden migrar inmediatamente
- incluso ni sabés exactamente quiénes son en todos los casos

Entonces aparece una diferencia importante entre:

- **cambio interno**
- **cambio contractual**

Podés refactorizar fuerte por dentro y no generar ningún problema si el contrato externo sigue estable.
Pero un cambio pequeño en el contrato externo puede romper varios servicios aunque tu código interno haya mejorado mucho.

## Los contratos también existen en asincronía

A veces los equipos asocian la palabra “contrato” solo con APIs HTTP.
Pero en comunicación asíncrona también existen contratos, y muchas veces son todavía más delicados.

Por ejemplo, un evento como:

- `orden_confirmada`

puede ser consumido por:

- facturación
- notificaciones
- analítica
- antifraude
- backoffice
- integraciones externas

Si el productor cambia de golpe:

- el nombre del evento
- la estructura del payload
- el significado de un campo
- el momento exacto en que se emite
- la semántica del estado publicado

puede romper varios consumidores a la vez.

Y a veces eso ni siquiera se detecta rápido, porque el productor sigue funcionando desde su propia perspectiva.
El problema aparece aguas abajo.

Por eso, en sistemas distribuidos, un evento también es una interfaz pública.

## Qué significa “romper” un contrato

Romper un contrato no siempre significa que la llamada deja de compilar.
Muchas veces significa que un consumidor deja de comportarse correctamente.

Hay varias maneras de romper un contrato.

## 1. Cambios estructurales incompatibles

Por ejemplo:

- eliminar un campo que un consumidor usaba
- renombrar una propiedad
- cambiar un tipo de dato
- volver obligatorio algo que antes no lo era
- mover datos a otra parte del payload sin transición

## 2. Cambios semánticos

Éstos suelen ser todavía más peligrosos.

Por ejemplo:

- un campo sigue llamándose igual, pero ahora significa otra cosa
- un estado cambia de interpretación
- una fecha pasa de representar creación a confirmación
- un total deja de incluir impuestos, aunque el nombre no cambió

La estructura puede verse “igual”, pero el contrato real ya se rompió.

## 3. Cambios operativos

También puede romperse un contrato si cambian propiedades de comportamiento que el consumidor daba por sentadas.

Por ejemplo:

- una API que respondía en 100 ms ahora tarda varios segundos
- un evento que antes era único ahora puede duplicarse
- un endpoint que siempre devolvía cierto código ahora usa otro
- una operación que era idempotente deja de serlo

A veces el schema sigue intacto, pero la integración igual se rompe.

## Compatibilidad hacia atrás: la regla de oro más importante

Cuando un productor evoluciona un contrato, lo ideal es que los consumidores actuales sigan funcionando sin necesidad de migrar todos de golpe.

A eso solemos llamarlo **compatibilidad hacia atrás**.

En términos simples significa:

**las versiones nuevas del productor no deberían romper a consumidores viejos que todavía usan el contrato anterior válido.**

Ésta es una de las reglas más valiosas en sistemas distribuidos porque despliegue independiente y evolución segura dependen mucho de esto.

Sin compatibilidad hacia atrás, cada cambio contractual obliga a:

- coordinar despliegues entre varios equipos
- hacer migraciones sincronizadas
- aumentar riesgo operativo
- frenar velocidad de evolución

Y eso le saca muchísimo valor práctico a la separación en servicios.

## Compatibilidad hacia adelante: útil, pero no siempre suficiente

También existe la idea de compatibilidad hacia adelante.

Sería algo así como que un consumidor más nuevo pueda convivir razonablemente con un productor más viejo.

Esto puede importar en ciertos entornos, sobre todo cuando:

- hay despliegues graduales
- hay clientes móviles desincronizados
- conviven múltiples versiones
- existen procesos de lectura tolerantes a información incompleta

Pero en la práctica de backend distribuido, la prioridad más crítica suele ser otra:

**que el productor nuevo no rompa a consumidores ya desplegados.**

## Cambios que suelen ser relativamente seguros

No existe una regla universal, pero hay ciertos cambios que muchas veces son más seguros si el diseño acompaña.

## 1. Agregar campos opcionales

Si un consumidor ignora campos desconocidos, agregar información nueva suele ser una evolución razonable.

Por ejemplo, pasar de:

```json
{
  "orderId": "123",
  "status": "CONFIRMED"
}
```

a:

```json
{
  "orderId": "123",
  "status": "CONFIRMED",
  "salesChannel": "WEB"
}
```

suele ser tolerable si los consumidores no dependen de un schema cerrado rígido.

## 2. Agregar nuevos endpoints o nuevas capacidades

Sumar funcionalidad sin alterar la existente suele ser más seguro que mutar el comportamiento viejo de forma silenciosa.

## 3. Extender enumeraciones con mucho cuidado

A veces agregar un nuevo estado o valor parece inocente, pero no siempre lo es.
Si un consumidor tiene un `switch` cerrado o asume que solo existen tres estados, agregar un cuarto puede romper lógica.

Entonces “agregar” no siempre equivale a “compatible”.
Compatibilidad depende también de cómo consumen los clientes.

## 4. Volver más flexible algo que ya era tolerante

Por ejemplo:

- permitir un campo adicional
- aceptar un formato extendido además del viejo
- soportar un header nuevo opcional

Eso puede ser una evolución sana si el comportamiento anterior sigue vigente.

## Cambios que suelen ser riesgosos

## 1. Eliminar campos o endpoints en caliente

Si alguien los usa, rompés integración.
Así de simple.

## 2. Renombrar cosas visibles externamente

Aunque a nivel interno el nombre nuevo sea mejor.

## 3. Cambiar semántica sin cambiar contrato visible

Éste es uno de los peores casos porque cuesta detectarlo.

## 4. Endurecer validaciones sin transición

Por ejemplo, empezar a rechazar requests que antes eran válidos sin una estrategia de migración puede romper consumidores viejos.

## 5. Reordenar eventos o cambiar momento de emisión sin advertirlo

Si otros servicios dependen del timing o de la secuencia, el impacto puede ser grande.

## 6. Convertir algo opcional en obligatorio

Eso obliga a todos los consumidores a migrar ya mismo.

## Una regla mental muy útil: ser estricto al producir, tolerante al consumir

Esta idea aparece mucho en integraciones robustas.

Del lado productor:

- emití contratos claros
- no improvises formatos inestables
- sé consistente

Del lado consumidor:

- no dependas de campos irrelevantes
- ignorá información extra que no necesitás
- evitá parseos frágiles
- no asumas orden o completitud perfecta si el contrato no lo garantiza

Dicho de otra forma:

**cuanto más rígido y frágil sea un consumidor, más cara será la evolución del sistema entero.**

Obviamente esto no significa aceptar cualquier cosa sin control.
Significa diseñar consumidores que dependan de lo importante, no de accidentes de implementación.

## El ownership del contrato importa muchísimo

Un contrato entre servicios necesita ownership claro.

Tiene que estar claro:

- quién lo define
- quién puede evolucionarlo
- qué parte es pública y estable
- qué parte es interna y no debería consumirse
- cómo se anuncian cambios
- qué políticas de deprecación existen

Cuando eso no está claro, aparecen problemas como:

- consumidores leyendo campos que nunca fueron públicos
- dependencias sobre detalles internos
- productores haciendo cambios sin enterarse del impacto
- discusiones eternas sobre qué estaba “permitido” usar

En una arquitectura distribuida sana, el contrato es un activo compartido, pero **su evolución no puede ser anárquica**.

## Contrato explícito vs contrato accidental

Hay contratos que fueron diseñados explícitamente.
Y hay otros que nacieron porque alguien expuso algo y otro lo empezó a usar.

Los contratos accidentales son peligrosos porque suelen tener:

- poca documentación
- nulo versionado
- semántica ambigua
- campos que “están porque sí”
- ausencia de ownership formal

Con el tiempo, esos contratos se vuelven difíciles de tocar.
No porque estén bien diseñados, sino porque ya hay dependencias escondidas.

Una buena práctica es revisar periódicamente:

- qué partes del payload son realmente públicas
- qué consumidores existen
- qué campos sobran o están ambiguos
- qué detalles internos conviene encapsular mejor

## Versionar no siempre significa poner `/v2` enseguida

Cuando el tema de evolución aparece, muchas veces la primera reacción es:

**hagamos una v2.**

A veces corresponde.
Pero no siempre.

Versionar es una herramienta útil, no una excusa para cambiar sin criterio.

Hay varias estrategias posibles.

## 1. Evolución compatible sin nueva versión mayor

Si el cambio es verdaderamente compatible, muchas veces conviene mantener la misma versión y evolucionar de manera aditiva.

## 2. Versiones paralelas cuando hay ruptura real

Si necesitás cambiar algo de forma incompatible, puede tener sentido exponer dos versiones durante una transición:

- v1 sigue operativa
- v2 incorpora el nuevo contrato
- los consumidores migran gradualmente
- recién después se depreca y retira v1

## 3. Versionado en mensajes o schemas

En eventos o mensajería, la estrategia puede incluir:

- versionar el nombre del evento
- versionar el schema
- incluir metadata de versión
- registrar compatibilidad en un schema registry

La mejor opción depende del contexto.
La peor opción suele ser otra:

**hacer cambios incompatibles sin una estrategia de convivencia.**

## Deprecar bien es parte de diseñar bien

En sistemas vivos, a veces sí necesitás retirar cosas.
Eso no está mal.
Lo que importa es cómo lo hacés.

Una deprecación sana suele implicar:

- anunciar que algo dejará de usarse
- explicar alternativa o reemplazo
- medir quién todavía depende de eso
- dar una ventana razonable de migración
- monitorear adopción
- recién después retirar

Sacar un endpoint o mutar un evento sin saber quién lo usa es una receta para incidentes.

## Consumer-driven contracts: una idea muy valiosa

Cuando varios consumidores dependen de un productor, una práctica útil es validar el contrato desde la perspectiva de los consumidores.

La idea es simple:

- el consumidor declara qué espera realmente
- el productor verifica que sigue cumpliendo esas expectativas

Esto ayuda a evitar dos extremos malos:

- productores que cambian sin saber a quién rompen
- consumidores que dependen de demasiado más allá de lo que necesitan

Las pruebas de contrato no reemplazan todo el testing distribuido, pero ayudan muchísimo a detectar rupturas tempranas.

## Ejemplo intuitivo

Supongamos que un servicio de pagos expone esta respuesta:

```json
{
  "paymentId": "p_123",
  "status": "AUTHORIZED",
  "amount": 15000,
  "currency": "ARS"
}
```

Y varios consumidores usan eso para:

- marcar órdenes como pagadas
- emitir comprobantes
- actualizar dashboards

Ahora el equipo de pagos decide que `amount` pase a ser string porque “en frontend quedaba más cómodo”, o cambia `AUTHORIZED` por `APPROVED` porque “suena mejor”.

Desde adentro quizá parezca menor.
Pero afuera puede romper:

- parseo
- lógica de estados
- reglas de conciliación
- métricas derivadas

El problema no es solo el cambio técnico.
Es olvidar que ese contrato ya era parte del sistema de otros.

## El problema de campos compartidos con semántica confusa

Uno de los mayores focos de dolor contractual aparece cuando se exponen campos ambiguos como:

- `status`
- `type`
- `state`
- `date`
- `total`
- `source`

Si no está clarísimo qué significan, cada consumidor los interpreta a su manera.
Y después cambiar algo se vuelve peligrosísimo.

Por eso un contrato bueno no solo define estructura.
También define significado.

Por ejemplo:

- qué representa exactamente ese estado
- en qué momento del flujo aparece
- si puede retroceder
- si es final o transitorio
- si la fecha es creación, autorización o liquidación
- si el total incluye impuestos, descuentos o envío

## Eventos de dominio: especial cuidado con la semántica

En eventos, el nombre y el momento del hecho importan muchísimo.

No es lo mismo publicar:

- `orden_creada`
- `orden_confirmada`
- `orden_lista_para_despacho`

Aunque todas hablen “de la orden”.

Si el evento no expresa con precisión **qué pasó de verdad**, los consumidores terminan:

- adivinando semántica
- metiendo lógica acoplada al productor
- reaccionando a hechos que en realidad no estaban garantizados

Un evento claro y estable reduce mucho el costo de evolución.

## Cómo pensar una evolución segura de contrato

Una secuencia razonable suele verse así.

## 1. Detectar si el cambio es realmente contractual

Primero hay que separar:

- cambio interno
- cambio visible para consumidores

No todo merece plan de migración.
Pero si toca expectativas externas, sí.

## 2. Identificar consumidores reales

No alcanza con asumir.
Hay que saber, en lo posible:

- quién consume
- qué versión usa
- qué campos necesita
- qué tan rápido puede migrar

## 3. Elegir estrategia de transición

Por ejemplo:

- cambio aditivo compatible
- convivencia v1/v2
- doble publicación temporal
- alias de campo durante transición
- soporte de ambos formatos por un tiempo

## 4. Medir adopción y uso

Antes de retirar lo viejo, conviene tener evidencia:

- tráfico por versión
- consumidores activos
- campos realmente leídos si existe esa observabilidad
- error rate de integraciones

## 5. Retirar solo cuando la transición está cerrada

No cuando “en teoría ya deberían haber migrado”.

## Doble escritura o doble publicación: útil, pero costosa

A veces, para migrar contratos, se publica durante un tiempo:

- formato viejo
- formato nuevo

O se soportan ambos caminos en paralelo.

Eso puede ser útil para hacer una transición segura.
Pero también tiene costos:

- más complejidad temporal
- riesgo de inconsistencias
- más superficie que mantener
- tentación de dejar coexistencia infinita

Por eso la convivencia paralela sirve como etapa transitoria, no como estado permanente por defecto.

## Documentación viva, no decorativa

En contratos entre servicios, la documentación sí importa mucho.

Pero tiene que ser útil de verdad.

Debería dejar claro, al menos:

- qué expone el contrato
- qué campos son obligatorios y cuáles opcionales
- semántica de cada estado relevante
- errores posibles
- garantías y no garantías
- políticas de versionado
- estrategia de deprecación

La documentación que muestra solo ejemplos felices y no aclara semántica suele ser insuficiente para evoluciones reales.

## La observabilidad también ayuda a evolucionar contratos

No solemos pensar observabilidad y contratos juntos, pero están muy conectados.

Para evolucionar sin romper, ayuda mucho poder ver:

- qué endpoints o versiones se usan realmente
- qué consumidores siguen leyendo ciertos eventos
- errores de parseo o validación
- adopción de nuevas versiones
- tráfico residual sobre contratos viejos

Sin esa visibilidad, retirar compatibilidad vieja es casi un acto de fe.

## Preguntas que conviene hacerse antes de tocar un contrato

## 1. ¿Este cambio lo ve algún consumidor externo o interno?

Si sí, ya no es solo un refactor.

## 2. ¿Es compatible con consumidores actuales?

Si no lo es, necesitás estrategia de transición.

## 3. ¿Cambió solo la estructura o también la semántica?

Los cambios semánticos suelen ser los más peligrosos.

## 4. ¿Quién usa hoy este contrato realmente?

No supongas. Verificalo.

## 5. ¿Cómo voy a medir migración y adopción?

Sin medición, la deprecación es ciega.

## 6. ¿Estoy agregando capacidad o rompiendo expectativas existentes?

La diferencia es clave.

## 7. ¿Qué pasa si un consumidor tarda semanas en actualizar?

La respuesta debería existir antes del cambio, no después.

## Idea final

En microservicios, los contratos entre servicios son parte central de la arquitectura.
No son un detalle administrativo ni un documento accesorio.
Son el punto donde la autonomía de un servicio choca con la necesidad de que el sistema completo siga funcionando.

Por eso evolucionarlos bien requiere disciplina.

No alcanza con que un equipo diga:

- “en mi servicio esto quedó mejor”
- “solo renombré un campo”
- “la nueva versión es más limpia”

La pregunta importante es otra:

**¿qué impacto tiene este cambio en quienes dependen de mí?**

Cuando eso se toma en serio, aparecen prácticas sanas:

- cambios aditivos cuando se puede
- versionado cuando hace falta
- deprecaciones reales y no sorpresivas
- ownership claro del contrato
- pruebas de contrato
- observabilidad de uso y adopción

Y eso permite lo más valioso de todo en una arquitectura distribuida:

**que los servicios puedan evolucionar sin obligar al sistema entero a moverse al mismo tiempo.**
