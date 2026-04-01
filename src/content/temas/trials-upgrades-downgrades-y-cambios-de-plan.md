---
title: "Trials, upgrades, downgrades y cambios de plan"
description: "Cómo modelar la evolución comercial de una cuenta SaaS a lo largo del tiempo, separando acceso, suscripción, facturación y cambios programados para poder manejar pruebas gratis, mejoras de plan, reducciones de capacidad y transiciones sin romper la lógica del producto ni la trazabilidad operativa."
order: 174
module: "SaaS, billing y producto B2B"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior vimos algo fundamental:

- plan no es lo mismo que suscripción
- suscripción no es lo mismo que invoice
- invoice no es lo mismo que acceso al producto
- el proveedor de billing no debería definir por sí solo toda la verdad interna del sistema

Eso nos permitió separar mejor:

- catálogo comercial
- relación activa del tenant con un plan
- eventos de facturación
- estado de acceso

Pero todavía falta una parte muy importante.

Porque en un SaaS real la relación comercial con una cuenta casi nunca es estática.
No suele ser:

- elige plan
- paga
- queda igual para siempre

Lo normal es que la cuenta cambie en el tiempo.

Por ejemplo:

- empieza con trial
- activa un plan pago
- pasa de mensual a anual
- hace upgrade para sumar capacidad o features
- pide downgrade para ahorrar costo
- cancela pero sigue hasta fin de período
- cambia de add-ons
- negocia una excepción temporal
- entra en plan enterprise con reglas distintas

Y cada uno de esos movimientos tiene impacto en varias capas al mismo tiempo:

- estado comercial
- acceso al producto
- entitlements
- límites
- facturación
- trazabilidad
- soporte

Entonces aparece el verdadero desafío.

**No alcanza con guardar cuál es el plan actual. Hay que modelar correctamente las transiciones de una cuenta a lo largo del tiempo.**

## El error más común: tratar todos los cambios de plan como si fueran iguales

Éste es uno de los errores más típicos.

Se implementa algo así:

- el usuario cambia de plan
- se actualiza `plan = business`
- listo

Parece simple.
Pero en la práctica hay muchas preguntas escondidas atrás de ese "cambio de plan":

- ¿el cambio aplica ahora o en la próxima renovación?
- ¿hay que prorratear?
- ¿cambian los límites inmediatamente?
- ¿cambian solo algunas features o todas?
- ¿qué pasa con el período ya pago?
- ¿qué pasa con el stock de uso consumido en el plan anterior?
- ¿qué ve soporte si mañana hay un reclamo?
- ¿cómo se audita por qué la cuenta tenía cierto estado en cierta fecha?

Entonces conviene entender algo muy importante:

**upgrade, downgrade, trial, renovación, cancelación y cambio de intervalo no son un mismo tipo de transición.**

Cada una puede tener:

- momento efectivo distinto
- impacto comercial distinto
- impacto financiero distinto
- impacto funcional distinto

## Trial no es solo “gratis por unos días”

Muchas veces se piensa el trial como una simple bandera:

- `trial = true`

Pero un trial real suele necesitar bastante más contexto.

Por ejemplo:

- fecha de inicio
- fecha de fin
- plan o capacidades del trial
- si requiere tarjeta o no
- si auto-convierte a pago o no
- si se puede extender manualmente
- si fue trial estándar o trial negociado
- qué restricciones tiene frente a un plan pago

Además, el trial no es solamente un dato financiero.
También es una fase del ciclo de vida del cliente.

Porque durante el trial suelen importar mucho cosas como:

- onboarding
- activación de features clave
- límites especiales
- nudges comerciales
- fecha de expiración visible
- reglas de conversión a pago

Por eso conviene modelarlo como una situación real del sistema,
no como una nota suelta dentro del tenant.

## Qué preguntas debería responder bien el sistema sobre un trial

Un diseño sano debería poder responder preguntas como estas:

- ¿la cuenta está hoy en trial?
- ¿cuándo empezó el trial?
- ¿cuándo termina?
- ¿qué plan funcional tiene habilitado durante el trial?
- ¿qué límites especiales aplican durante esa fase?
- ¿al terminar se corta acceso, se degrada a free o se intenta convertir a pago?
- ¿la conversión fue automática o manual?
- ¿hubo una extensión excepcional?
- ¿cuántos trials ya tuvo este tenant?

Si el sistema no puede responder eso con claridad,
probablemente el trial está modelado como un parche y no como parte seria del producto.

## Upgrade y downgrade no deberían compartir la misma lógica por defecto

Ésta es una distinción crucial.

En muchos productos, un **upgrade** suele tener estas características:

- se desea aplicar rápido
- agrega valor inmediato al cliente
- puede requerir cobro adicional o prorrateo
- puede ampliar límites en el momento
- suele ser una transición comercialmente favorable

En cambio, un **downgrade** suele tener otras:

- muchas veces se programa para el próximo ciclo
- puede requerir reducir capacidad disponible
- puede impactar datos existentes, asientos o consumo acumulado
- puede necesitar avisos o validaciones previas
- suele exigir reglas para evitar dejar a la cuenta en un estado inválido

Por ejemplo,
si una cuenta tiene hoy:

- 50 usuarios activos
- 200 GB usados
- 12 automatizaciones corriendo

Y quiere bajar a un plan que soporta:

- 10 usuarios
- 20 GB
- 2 automatizaciones

la pregunta ya no es solo comercial.
También es funcional y operativa.

Entonces un downgrade real puede exigir cosas como:

- bloquear el cambio hasta que la cuenta se adecue
- permitir el cambio pero con período de ajuste
- aplicar el plan nuevo solo en la próxima renovación
- mantener ciertos recursos en modo lectura
- forzar decisión manual en casos enterprise

Por eso conviene asumir algo desde el principio:

**upgrade y downgrade son transiciones distintas, aunque ambas cambien el plan.**

## Cambiar de plan no siempre significa cambiar de acceso de una sola vez

En muchos SaaS, la transición comercial y la transición funcional no ocurren exactamente al mismo tiempo.

Por ejemplo:

- el pricing puede cambiar hoy, pero los límites mañana
- el upgrade puede habilitar features ahora, pero facturarse al cierre del ciclo con prorrateo
- el downgrade puede registrarse hoy, pero volverse efectivo en la próxima renovación
- la cancelación puede quedar programada aunque el acceso siga vigente hasta cierta fecha

Si el sistema no separa bien:

- cambio solicitado
- cambio aprobado
- cambio facturado
- cambio efectivo
- cambio reflejado en acceso

termina apareciendo confusión por todos lados.

Entonces suele ser mejor pensar las transiciones como algo con etapas.
No como una simple actualización instantánea de un campo.

## Una estructura mental útil: cambio solicitado, cambio programado y cambio efectivo

Para muchos SaaS ayuda pensar los cambios de plan con tres niveles.

### 1. Cambio solicitado

Es la intención expresada.
Por ejemplo:

- el usuario pide pasar de Pro a Business
- el equipo comercial promete un upgrade manual
- soporte agenda una extensión de trial

Todavía no necesariamente impactó en todo el sistema.

### 2. Cambio programado

Es la decisión ya aceptada por el backend,
pero pendiente de una condición temporal u operativa.

Por ejemplo:

- downgrade al final del período
- cambio sujeto a pago exitoso
- trial extendido hasta fecha específica
- cambio de intervalo en próxima renovación

### 3. Cambio efectivo

Es el momento a partir del cual la cuenta realmente opera bajo la nueva situación.

Por ejemplo:

- nuevos límites activos
- nuevas features habilitadas
- nuevo precio en vigor
- nuevo período comenzado

Separar estas capas ayuda muchísimo a evitar bugs lógicos.

## La gran pregunta operativa: ¿cuándo debería hacerse efectivo un cambio?

Ésta es una decisión central de producto y backend.

Porque no todos los cambios se resuelven igual.

Algunas opciones comunes son:

### Aplicación inmediata

Se usa mucho en upgrades.

Ejemplo:

- el cliente sube de plan
- accede enseguida a más capacidad
- se cobra diferencia o se registra ajuste

### Aplicación al final del ciclo actual

Se usa mucho en downgrades o cancelaciones.

Ejemplo:

- el cliente hoy tiene Business
- pide bajar a Pro
- mantiene Business hasta el cierre del período ya pago
- el plan nuevo entra al renovar

### Aplicación condicionada a un evento

Ejemplo:

- el upgrade queda pendiente hasta confirmar pago
- el trial convierte solo si hay método de pago válido
- el cambio enterprise requiere aprobación comercial previa

### Aplicación mixta

Ejemplo:

- algunas features se activan ya
- el precio nuevo corre desde el siguiente ciclo
- algunos límites suben en el acto y otros al renovar

Esto muestra algo importante:

**la semántica de un cambio de plan no debería quedar implícita. Debería definirse explícitamente.**

## Prorrateo: donde la lógica comercial se vuelve más delicada

Cuando un cliente cambia de plan en medio del período,
aparece una decisión frecuente: el prorrateo.

Eso implica ajustar el costo según el tiempo restante del ciclo.

Por ejemplo:

- si pasa de Pro a Business a mitad de mes,
  tal vez se cobra solo la diferencia proporcional por los días restantes
- si baja de plan,
  tal vez se da crédito futuro
- en algunos productos no se prorratea nada
- en otros se hace siempre
- en enterprise puede resolverse fuera del flujo estándar

El punto importante no es solo financiero.
Es también de diseño.

Porque el backend debería saber distinguir entre:

- cambio funcional de acceso
- ajuste económico del período actual
- precio que regirá en el siguiente ciclo

Si eso se mezcla, después es difícil explicar:

- por qué se cobró lo que se cobró
- por qué cambió el acceso cuando cambió
- qué precio corresponde en la próxima renovación

## Límites y consumo: la parte que suele romper downgrades

En SaaS B2B el plan no solo habilita features.
También suele imponer límites.

Por ejemplo:

- cantidad de usuarios
- proyectos activos
- workflows automáticos
- almacenamiento
- uso mensual
- cantidad de integraciones
- volumen de API calls

Entonces un cambio de plan no puede pensarse solo desde facturación.
También necesita mirar el estado actual de la cuenta.

Preguntas típicas:

- ¿qué pasa si el tenant ya excede el límite del plan nuevo?
- ¿se bloquea el cambio?
- ¿se permite pero se restringe creación futura?
- ¿se pasa a modo lectura?
- ¿se da período de regularización?
- ¿se requiere intervención manual?

Esta parte es clave porque evita que el sistema diga una cosa comercialmente y otra funcionalmente.

## Qué conviene separar en el modelo

En muchos sistemas ayuda separar al menos estas piezas:

- **plan catalog**: la definición comercial del plan
- **pricing**: precios y condiciones vigentes
- **subscription**: estado actual de la relación comercial
- **subscription change**: solicitud o programación de transición
- **entitlements**: features habilitadas
- **limits policy**: límites según plan o contrato
- **access state**: cómo opera realmente la cuenta hoy
- **billing events**: lo que pasó financieramente
- **audit trail**: por qué y cuándo ocurrió cada cambio

No hace falta que todo sea una tabla separada desde el primer día.
Pero sí conviene que mentalmente sean conceptos distintos.

## Un error muy común: mutar la suscripción y perder la historia

Otro problema típico es este:

- la cuenta estaba en Pro
- pasa a Business
- se pisan los datos viejos
- nadie guarda cuándo cambió, quién lo pidió ni desde cuándo fue efectivo

Después aparecen preguntas imposibles de responder:

- ¿por qué se cobró distinto ese mes?
- ¿desde cuándo tenía habilitada tal feature?
- ¿el downgrade se aplicó ya o estaba programado?
- ¿el cambio lo hizo el usuario o soporte?
- ¿hubo extensión de trial?
- ¿el problema fue comercial, técnico o humano?

Por eso conviene guardar historia de transiciones.
No solo el estado final.

En otras palabras:

**en SaaS, el pasado comercial de una cuenta importa.**

## Un ejemplo conceptual sano

Imaginá este escenario:

- tenant en plan Pro mensual
- estado activo
- 20 usuarios permitidos
- 14 usuarios usados
- renovación el día 30

El 12 del mes pide upgrade a Business.

El backend podría registrar algo así:

1. solicitud de cambio de plan
2. validación de elegibilidad
3. definición de semántica del cambio: inmediata
4. cálculo de ajuste económico del período actual
5. actualización de límites y entitlements efectivos
6. trazabilidad del motivo y origen del cambio
7. nueva configuración para próxima renovación

Ahora otro caso:

- tenant en Business anual
- 85 usuarios activos
- quiere pasar a Pro

El backend podría resolverlo así:

1. solicitud de downgrade
2. verificación de incompatibilidad con límites del plan destino
3. cambio marcado como pendiente
4. aviso de acciones necesarias para adecuarse
5. aplicación programada recién cuando el tenant cumpla condiciones o al cierre del ciclo, según política

Fijate que en ambos casos “cambiar de plan” significa algo distinto.
Y ésa es justamente la idea.

## Trial + upgrade + downgrade + cancelación: por qué las combinaciones importan

La complejidad real no aparece solo en cada transición aislada.
Aparece en las combinaciones.

Por ejemplo:

- trial que convierte automáticamente a plan pago
- trial extendido manualmente por ventas
- upgrade hecho antes de terminar el trial
- downgrade pedido después de una renovación automática
- cancelación programada que luego se revierte
- cambio de mensual a anual junto con upgrade de plan

Si el modelo no soporta secuencias de transición,
el sistema se vuelve frágil.

Entonces conviene pensar menos en:

- "qué plan tiene hoy"

Y más en:

- "qué transición ocurrió"
- "desde cuándo aplica"
- "qué impacto tiene"
- "qué quedó programado para después"

## Qué conviene decidir explícitamente antes de implementar

Antes de tocar código, suele ser muy útil responder preguntas como estas:

1. ¿qué tipos de transición existen en nuestro producto?
2. ¿qué cambios aplican inmediatamente y cuáles al renovar?
3. ¿cómo se comporta el trial al vencer?
4. ¿puede haber trial sin método de pago?
5. ¿cómo se resuelve un upgrade en mitad del ciclo?
6. ¿cómo se resuelve un downgrade cuando la cuenta excede límites?
7. ¿qué parte del cambio afecta precio y cuál afecta acceso?
8. ¿cómo se representan cambios pendientes o programados?
9. ¿qué historia necesitamos conservar para soporte y auditoría?
10. ¿cómo explicaría el sistema por qué una cuenta tiene cierto estado hoy?

Estas decisiones evitan que la lógica comercial quede repartida entre:

- frontend
- provider webhooks
- tablas ambiguas
- parches de soporte
- ifs sueltos en el backend

## Señales de que la evolución comercial está mal modelada

- cambiar de plan es solo actualizar un string
- el sistema no distingue entre cambio solicitado y cambio efectivo
- los downgrades rompen límites o datos de la cuenta
- soporte necesita revisar manualmente el proveedor para entender qué pasó
- nadie puede reconstruir la línea de tiempo comercial de un tenant
- trial, cancelación y upgrade se pisan entre sí de forma confusa
- el acceso al producto cambia antes o después de lo que promete negocio
- no existe forma clara de programar transiciones futuras

Si eso pasa, probablemente el problema no sea solo de billing.
Probablemente sea que el backend todavía no modela bien el ciclo de vida comercial de la cuenta.

## Lo que deberías llevarte de esta lección

Si tuvieras que quedarte con una sola idea, que sea ésta:

**en un SaaS real no alcanza con saber cuál es el plan actual; hay que modelar con claridad cómo una cuenta entra, cambia, crece, reduce o sale de una relación comercial a lo largo del tiempo.**

Trials, upgrades, downgrades y cambios de plan no son detalles accesorios.
Son parte central del comportamiento del producto.

Cuando eso está mal modelado:

- el acceso se vuelve inconsistente
- el billing se vuelve opaco
- soporte pierde contexto
- los cambios comerciales requieren parches manuales
- la experiencia del cliente se vuelve difícil de explicar

Cuando está bien modelado:

- las transiciones son previsibles
- el sistema conserva historia útil
- los cambios se pueden auditar
- el producto y la facturación quedan alineados
- la operación comercial escala mejor

## Cierre

En SaaS, el valor no está solo en tener planes.
Está en poder gestionar correctamente la evolución comercial de cada cuenta.

Eso implica saber modelar:

- trials
- conversiones
- upgrades
- downgrades
- cambios programados
- impacto en límites y entitlements
- trazabilidad histórica

Cuando esta capa está bien diseñada, el backend deja de ver a cada tenant como una foto estática,
y empieza a tratarlo como lo que realmente es:

**una relación comercial viva que cambia en el tiempo.**

Y una vez que eso está claro, el siguiente paso natural es avanzar hacia otra pieza central del SaaS moderno:

**cómo medir el uso real del producto para cobrar no solo por suscripción fija, sino también por consumo, volumen o actividad efectiva.**

Ahí entramos en el próximo tema: **metering y usage-based billing**.
