---
title: "Versionado y evolución de contratos de integración"
description: "Cómo pensar el versionado y la evolución de contratos cuando una integración cambia con el tiempo, y por qué este tema es clave para mantener compatibilidad, reducir rupturas y sostener sistemas reales."
order: 86
module: "Integraciones y sistemas reales"
level: "intermedio"
draft: false
---

## Introducción

Cuando una aplicación empieza a integrarse con otros sistemas, aparece una realidad inevitable:

**los contratos cambian.**

Cambian porque:

- el negocio evoluciona
- aparecen nuevos campos
- cambian validaciones
- se agregan estados
- se renombra información
- se introducen nuevas reglas
- se corrigen errores del diseño original
- se reemplazan proveedores
- cambian expectativas de los consumidores

Al principio, esto puede parecer un detalle técnico.

Pero en sistemas reales, la evolución de contratos es un tema muy importante porque una integración no vive congelada en el tiempo.

Si no pensás bien cómo cambian los contratos, pueden aparecer problemas como:

- clientes rotos
- incompatibilidades silenciosas
- fallos difíciles de diagnosticar
- despliegues riesgosos
- integraciones externas que dejan de funcionar
- evolución bloqueada por miedo a romper compatibilidad

Por eso en esta lección vamos a trabajar una idea clave:

**cómo evolucionar integraciones sin convertir cada cambio en una ruptura.**

## Qué es un contrato de integración

Un contrato de integración es el acuerdo implícito o explícito entre dos sistemas sobre cómo se comunican.

Ese contrato incluye cosas como:

- endpoints
- métodos HTTP
- estructura del request
- estructura del response
- campos obligatorios
- campos opcionales
- tipos de datos
- status codes
- headers
- reglas de autenticación
- semántica de ciertos valores
- comportamiento esperado ante errores

En otras palabras:

**el contrato es la forma en que ambos sistemas esperan hablarse y entenderse.**

## Por qué los contratos importan tanto

Porque una integración no se rompe solo cuando un servidor cae.

También se rompe cuando un sistema cambia su forma de hablar y el otro no estaba preparado.

Por ejemplo:

- un campo deja de existir
- un nombre cambia
- un valor nuevo aparece y nadie lo contempló
- un campo antes opcional pasa a ser obligatorio
- la API empieza a responder una estructura distinta
- un código de error cambia de significado
- una URL cambia sin transición

Estos cambios pueden ser muy peligrosos si no se gestionan bien.

## El problema de cambiar “sin pensar compatibilidad”

En proyectos chicos, a veces se cambia una API como si solo la usara el propio desarrollador.

Pero en una integración real puede haber:

- frontend consumiendo esa API
- otros servicios internos
- jobs
- herramientas administrativas
- sistemas de terceros
- clientes externos
- versiones viejas todavía activas

Entonces un cambio aparentemente pequeño puede romper mucho más de lo que parece.

## Qué significa versionar

Versionar significa reconocer que una interfaz o contrato puede tener distintas etapas de evolución y que no siempre todos los consumidores van a migrar al mismo tiempo.

La idea general es:

- permitir evolución
- sin obligar a una ruptura caótica e inmediata
- manteniendo cierta estrategia de compatibilidad

No se trata solo de poner `v1` o `v2` en una URL.
Se trata de pensar cómo cambia el acuerdo entre sistemas.

## Qué significa evolución de contrato

La evolución de contrato es el proceso de modificar una integración con el tiempo.

Por ejemplo:

- agregar nuevos campos
- incorporar nuevos estados
- cambiar reglas de validación
- introducir un comportamiento nuevo
- deprecar algo viejo
- mantener compatibilidad por un tiempo
- planificar transición a una nueva versión

Versionar es una herramienta.
Evolucionar bien es el objetivo más amplio.

## Cambios compatibles y cambios incompatibles

Esta distinción es fundamental.

### Cambio compatible

Es uno que, en principio, no rompe a consumidores existentes si están razonablemente diseñados.

Por ejemplo, muchas veces:

- agregar un campo opcional
- devolver información adicional sin cambiar lo previo
- sumar un endpoint nuevo
- agregar un estado nuevo documentado con cierta tolerancia del consumidor

### Cambio incompatible

Es uno que puede romper directamente a los consumidores actuales.

Por ejemplo:

- eliminar un campo esperado
- renombrar una propiedad sin transición
- cambiar tipo de dato
- volver obligatorio algo que antes no lo era
- modificar semántica central de una respuesta
- remover un endpoint usado

No todos los cambios tienen el mismo riesgo.

## Ejemplo intuitivo

Supongamos que tu API devuelve:

```json
{
  "orderId": 15,
  "status": "PAID"
}
```

Si mañana agregás:

```json
{
  "orderId": 15,
  "status": "PAID",
  "paymentMethod": "CARD"
}
```

muchas veces eso puede ser compatible si el consumidor ignora campos desconocidos.

Pero si cambiás:

```json
{
  "id": 15,
  "state": "PAYMENT_CONFIRMED"
}
```

ahí el impacto puede ser mucho mayor.

## Agregar no siempre rompe, cambiar sí rompe más seguido

Una regla mental bastante útil es esta:

- agregar cosas suele ser menos peligroso
- cambiar o quitar cosas suele ser más riesgoso

No es una verdad absoluta.
Pero ayuda mucho a pensar evolución con más cuidado.

## Por qué las integraciones envejecen

Con el tiempo, una integración puede necesitar cambiar por muchas razones.

Por ejemplo:

- nuevas reglas de negocio
- mayor precisión en datos
- soporte a más casos
- seguridad reforzada
- simplificación de errores viejos
- necesidad de nuevos flujos
- cambios del proveedor
- migración tecnológica
- nueva forma de representar estados

Es normal que pase.

El problema no es que cambie.
El problema es cambiar sin estrategia.

## Tolerancia del consumidor

Este concepto es muy importante.

Un consumidor sano no debería romperse por detalles menores si el contrato evoluciona de forma razonable.

Por ejemplo, suele ser deseable que pueda tolerar:

- campos extra
- cierto orden distinto
- metadata adicional
- ampliación de datos opcionales

Pero no siempre todos los consumidores están bien preparados.
Por eso conviene diseñar y documentar con realismo.

## Productor y consumidor

En una integración suele haber:

### Productor

El sistema que expone el contrato o genera la respuesta.

### Consumidor

El sistema que depende de ese contrato.

Ambos tienen responsabilidad.

El productor debería evolucionar con cuidado.
El consumidor debería ser razonablemente tolerante donde corresponda.

## Versionar no es solo poner números en la URL

Este es un punto importante.

Mucha gente asocia versionado únicamente a algo como:

- `/api/v1/...`
- `/api/v2/...`

Eso puede ser útil, pero no agota el problema.

Porque también importa:

- qué cambios hacés
- cómo los comunicás
- cuánto tiempo conviven versiones
- cómo deprecás lo viejo
- qué compatibilidad sostenés
- cómo migran los consumidores

Dos APIs pueden tener `v1` y `v2` y aun así estar mal gestionadas.

## Deprecación

Deprecar significa marcar algo como todavía disponible, pero destinado a ser reemplazado o retirado en el futuro.

Por ejemplo:

- un endpoint viejo sigue funcionando
- pero ya no se recomienda para nuevos consumidores
- se documenta su reemplazo
- se comunica una ventana de transición
- eventualmente se retira

La deprecación bien hecha ayuda a evitar rupturas bruscas.

## Transición gradual

En sistemas reales, muchas veces conviene que convivan dos formas durante un tiempo.

Por ejemplo:

- versión vieja y versión nueva
- campo viejo y campo nuevo
- estado anterior y estado expandido
- endpoint legacy y endpoint nuevo

Eso permite:

- migrar con menos riesgo
- probar consumidores
- reducir impacto operativo
- evitar big-bang changes

## Ejemplo conceptual de transición

Supongamos que querés reemplazar `status` por algo más rico.

En vez de:

- quitar `status` hoy
- romper todo

quizá hacés algo como:

1. mantener `status`
2. agregar `detailedStatus`
3. documentar la transición
4. migrar consumidores
5. deprecar `status`
6. retirar más adelante con aviso suficiente

Ese tipo de evolución suele ser mucho más sana.

## Contratos internos y contratos externos

No todos los contratos tienen el mismo costo de cambio.

### Contrato interno

Entre componentes o servicios dentro de tu organización.

### Contrato externo

Con clientes, partners o terceros fuera de tu control directo.

En general, romper un contrato externo suele ser más delicado y costoso.

Por eso conviene ser todavía más cuidadoso.

## Versionado en APIs externas que consumís

Este tema no aplica solo a APIs que vos exponés.
También importa cuando consumís APIs ajenas.

Porque el proveedor puede:

- introducir una versión nueva
- deprecar endpoints viejos
- cambiar formatos
- anunciar fechas de retiro
- exigir migraciones

Entonces tu sistema también necesita estrategia para adaptarse sin caos.

## Qué pasa si el proveedor cambia sin avisar bien

Pasa más seguido de lo deseable.

Puede haber:

- cambios documentados tarde
- cambios no documentados
- nuevas validaciones
- nuevos estados
- ajustes de formato
- rarezas entre sandbox y producción

Por eso conviene que tus consumidores sean razonablemente defensivos y que haya observabilidad para detectar cambios anómalos.

## Versionado y modelos internos

Una buena práctica general es no hacer que todo tu dominio dependa directamente del contrato crudo.

Si tu sistema traduce o adapta la frontera, te resulta más fácil:

- absorber cambios
- mantener compatibilidad
- convivir con dos versiones
- reducir impacto en el resto del código

Eso conecta directamente con lo que viste sobre abstracciones de integración.

## Estados nuevos y compatibilidad

Un error muy común es asumir que un enum o estado nunca va a crecer.

Por ejemplo, si hoy existe:

- `PENDING`
- `APPROVED`
- `REJECTED`

mañana puede aparecer:

- `REVIEW_REQUIRED`
- `PARTIALLY_APPROVED`
- `EXPIRED`

Si el consumidor no tolera bien nuevos valores, puede romperse.

Esto muestra que la evolución no solo pasa por endpoints o JSON completos.
También pasa por detalles aparentemente chicos.

## Documentación y comunicación

Una evolución sana de contrato necesita comunicación clara.

Por ejemplo:

- qué cambia
- desde cuándo
- qué sigue vigente
- qué se depreca
- qué reemplaza a qué
- qué impacto tiene
- cuándo se retira lo viejo
- qué deben hacer los consumidores

Sin comunicación, incluso un cambio técnicamente razonable puede causar mucho daño.

## Observabilidad de migración

Cuando hay transición entre versiones o contratos, conviene saber:

- quién sigue usando lo viejo
- qué volumen tiene cada versión
- si aparecen errores nuevos
- si la migración está funcionando
- qué consumidores faltan adaptar

Esto ayuda mucho a evitar retiros prematuros o rupturas invisibles.

## Qué errores comunes aparecen

Algunos muy frecuentes son:

- cambiar un contrato sin pensar en consumidores reales
- quitar campos demasiado rápido
- renombrar cosas sin transición
- usar versionado como parche para cualquier cambio menor
- no documentar deprecaciones
- mantener versiones viejas eternamente sin plan
- asumir que todos migran al instante
- no medir quién usa qué

## Cuándo hace falta una versión nueva

No hay una única regla universal, pero suele ser más razonable cuando:

- el cambio es claramente incompatible
- la semántica cambia bastante
- no hay transición simple posible
- mantener compatibilidad sería demasiado confuso
- el modelo nuevo necesita una frontera más clara

No todo cambio requiere una nueva versión.
Pero algunos sí.

## Cuándo quizá alcanza con evolución compatible

A veces alcanza con:

- agregar campos opcionales
- sumar endpoints nuevos
- ampliar metadata
- tolerar estados nuevos
- documentar mejor sin romper

Eso puede evitar explosión innecesaria de versiones.

## Relación con temas anteriores

Este tema conecta con varios anteriores.

### Clientes HTTP avanzados

Porque un cliente maduro tiene que tolerar cierta evolución del contrato.

### Abstracciones de integración

Porque ayudan a absorber cambios sin contaminar todo el dominio.

### Integraciones reales

Porque los proveedores cambian con el tiempo y eso impacta operación.

### Consistencia eventual

Porque algunos cambios de contrato también afectan estados y sincronización.

### Diseño para producto real

Porque sostener evolución sin romper es parte de la madurez del sistema.

## Buenas prácticas iniciales

## 1. Distinguir cambios compatibles de incompatibles

Eso ayuda a elegir mejor la estrategia.

## 2. Evolucionar agregando antes que quitando cuando sea posible

Suele reducir riesgo.

## 3. Usar deprecación y transición gradual

Especialmente en contratos importantes.

## 4. No acoplar todo el dominio al contrato crudo

Eso hace más fácil absorber cambios.

## 5. Comunicar y documentar bien los cambios

La técnica sola no alcanza.

## 6. Medir uso de versiones o contratos viejos

Muy útil para migraciones reales.

## 7. No mantener legacy eterno sin plan

La compatibilidad también tiene costo.

## Errores comunes

### 1. Romper contratos “porque total era un cambio chico”

Para el consumidor puede no ser chico.

### 2. Crear versiones nuevas para cualquier detalle menor

Eso también puede complicar innecesariamente.

### 3. No anunciar deprecaciones

Después la ruptura parece repentina.

### 4. Asumir consumidores rígidos o perfectos sin verificar

La realidad suele ser más desordenada.

### 5. No observar quién sigue usando lo viejo

Entonces retirás a ciegas.

### 6. Mezclar evolución técnica con cambios semánticos sin claridad

Eso confunde mucho.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. ¿qué cambio en una API de órdenes sería compatible y cuál claramente incompatible?
2. ¿qué harías si necesitás renombrar un campo importante muy usado?
3. ¿cómo migrarías de un estado simple a uno más detallado sin romper todo?
4. ¿qué consumidores de tu sistema podrían verse afectados por una nueva versión?
5. ¿qué información te gustaría medir antes de retirar una versión vieja?

## Resumen

En esta lección viste que:

- un contrato de integración es el acuerdo sobre cómo dos sistemas se comunican
- con el tiempo, los contratos evolucionan y eso exige una estrategia consciente
- no todos los cambios tienen el mismo impacto: algunos son compatibles y otros rompen consumidores
- versionar ayuda, pero no se reduce a poner números en una URL
- deprecación, transición gradual, comunicación y observabilidad son piezas clave
- una buena frontera de integración ayuda a absorber cambios sin propagar caos al resto del sistema

## Siguiente tema

Ahora que ya entendés cómo pensar el versionado y la evolución de contratos para sostener integraciones sin romper consumidores, el siguiente paso natural es aprender sobre **observabilidad de integraciones: logs, métricas y trazabilidad**, porque cuando varios sistemas hablan entre sí, ver qué pasó realmente se vuelve tan importante como diseñar bien el contrato.
