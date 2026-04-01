---
title: "Tenants, planes y límites de producto"
description: "Cómo modelar tenants, organizaciones, planes comerciales y límites de uso en un backend SaaS sin mezclar conceptos, sin fragmentar el producto y sin convertir la lógica comercial en una fuente constante de acoplamiento y excepciones difíciles de operar."
order: 172
module: "SaaS, billing y producto B2B"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior vimos un cambio de mentalidad importante:

pasar de construir software que resuelve pedidos puntuales,
a construir un producto SaaS capaz de servir a muchos clientes de forma repetible.

Ahora toca entrar en una de las piezas más delicadas de ese cambio.

Porque en casi cualquier SaaS serio aparecen muy rápido preguntas como estas:

- ¿quién es realmente el cliente?
- ¿qué significa “cuenta” dentro del sistema?
- ¿un usuario pertenece a una empresa, a un workspace o a varias cosas?
- ¿qué capacidades dependen del plan?
- ¿qué límites tiene cada cliente?
- ¿qué pasa cuando se supera un límite?
- ¿qué parte del sistema depende del contrato comercial?
- ¿qué cosas deberían ser configuración técnica y cuáles deberían ser definición de producto?

Cuando esas preguntas no se modelan bien, el backend empieza a mezclarse.

Entonces aparecen síntomas muy comunes:

- permisos atados a reglas comerciales confusas
- cuentas con comportamientos especiales difíciles de explicar
- validaciones repartidas por todo el código
- límites que a veces se aplican y a veces no
- planes definidos en frontend pero no realmente protegidos en backend
- soporte manual para habilitar cosas “por excepción”
- lógica de facturación contaminando operaciones del dominio

Por eso este tema es central.

No alcanza con decir “tenemos planes Free, Pro y Enterprise”.
Lo importante es entender **cómo se modelan técnicamente tenants, planes y límites sin destruir la coherencia del sistema**.

## El primer problema: entender qué es un tenant

La palabra **tenant** se usa muchísimo en SaaS, pero a veces se usa de forma ambigua.

En términos simples, un tenant es una **unidad de aislamiento lógico dentro de la plataforma**.

Según el producto, puede representar por ejemplo:

- una empresa
- una organización
- un workspace
- una cuenta cliente
- una instancia lógica compartida por un grupo de usuarios

Lo importante no es el nombre.
Lo importante es la función.

Un tenant suele ser la entidad alrededor de la cual se organizan cosas como:

- ownership de datos
- permisos
- configuración
- facturación
- límites de uso
- auditoría
- integraciones
- exportaciones
- soporte

Dicho simple:

**el tenant suele ser el contenedor lógico del cliente dentro del sistema.**

Y eso significa que si modelás mal el tenant, después se complica todo lo demás.

## Usuario no es lo mismo que tenant

Éste es uno de los errores más frecuentes al empezar.

Muchos sistemas arrancan con una idea simple:

- hay usuarios
- cada usuario inicia sesión
- cada usuario hace cosas

Eso puede alcanzar para productos muy pequeños o de uso individual.
Pero en SaaS B2B suele quedarse corto.

Porque muchas veces:

- un tenant tiene muchos usuarios
- un usuario puede pertenecer a uno o más tenants
- distintos usuarios tienen distintos roles dentro del mismo tenant
- el tenant paga, no necesariamente el usuario individual
- los datos pertenecen al tenant, no a una persona aislada

Entonces conviene separar claramente:

- **identidad del usuario**
- **membresía dentro de un tenant**
- **roles o permisos dentro de ese tenant**
- **estado comercial del tenant**

Cuando todo eso se mete dentro del modelo de usuario, el sistema se vuelve rígido y confuso.

## Tenant no es plan

Otro error muy común es mezclar la existencia del tenant con su plan comercial.

Pero son cosas distintas.

Un tenant responde preguntas como:

- ¿a qué cliente pertenecen estos datos?
- ¿quién administra esta cuenta?
- ¿qué usuarios forman parte de esta organización?
- ¿qué configuraciones se aplican a esta entidad?

En cambio, el plan responde preguntas como:

- ¿qué capacidades están habilitadas?
- ¿qué límites de uso aplican?
- ¿qué features corresponden a este cliente?
- ¿qué restricciones comerciales existen?
- ¿cómo se comporta la cuenta frente al billing?

O sea:

- el **tenant** es una entidad del modelo de plataforma
- el **plan** es una política comercial aplicada sobre ese tenant

Parece un detalle semántico, pero no lo es.

Si plan y tenant quedan fusionados, después cambiar de plan, migrar clientes, probar promociones, dar trials o modelar excepciones controladas se vuelve mucho más difícil.

## Plan no es límite

También conviene separar bien estas dos ideas.

Un plan puede definir muchas cosas, por ejemplo:

- acceso a ciertas features
- volumen incluido
- cantidad máxima de usuarios
- retención histórica
- prioridad de soporte
- tipo de integraciones disponibles

Pero el límite concreto que aplica en tiempo de ejecución suele ser otra capa.

Por ejemplo:

- plan Pro permite hasta 50 usuarios activos
- tenant X hoy tiene límite efectivo de 100 usuarios por acuerdo comercial especial
- tenant Y tiene temporalmente un límite ampliado por promoción
- tenant Z tiene override aprobado por soporte enterprise

Entonces aparece una idea importante:

**el plan puede definir defaults comerciales, pero el límite efectivo puede requerir una representación separada.**

Esto evita volver el sistema demasiado rígido.

## Una estructura mental útil: tenant, suscripción, entitlements y límites

En muchos SaaS reales ayuda pensar el modelo en capas.

No como regla absoluta, pero sí como guía.

### 1. Tenant

Representa la cuenta cliente dentro del producto.

Suele contener o relacionarse con:

- identidad organizacional
- estado general de la cuenta
- configuración
- membresías
- ownership de datos
- integraciones propias

### 2. Suscripción o estado comercial

Representa la relación comercial actual.

Por ejemplo:

- plan actual
- trial activo
- vencimiento
- renovación
- estado de pago
- cancelación programada
- downgrade futuro

### 3. Entitlements

Representan qué capacidades están habilitadas para esa cuenta.

Por ejemplo:

- acceso a exportaciones avanzadas
- SSO empresarial
- API pública habilitada
- auditoría extendida
- dashboards premium

### 4. Límites

Representan restricciones cuantitativas o umbrales operativos.

Por ejemplo:

- máximo de usuarios
- máximo de proyectos
- máximo de requests por mes
- máximo de almacenamiento
- máximo de integraciones activas

Separar estas capas ayuda mucho.

Porque evita que todo termine modelado como una sola columna tipo `plan = enterprise` y una montaña de `if` repartidos por el sistema.

## Qué rompe un diseño demasiado simple

Muchos backends arrancan con algo como esto:

- columna `plan` en tabla de cuentas
- algunos `if plan == 'pro'`
- algunos `if plan == 'enterprise'`
- validaciones dispersas
- flags manuales para casos especiales

Al principio parece suficiente.

Después empiezan a aparecer casos reales:

- un cliente tiene plan Pro pero con más usuarios
- otro tiene trial con features de Enterprise
- otro conserva condiciones viejas por contrato anterior
- otro tiene add-ons extra
- otro paga anual y mantiene límites distintos
- otro necesita una feature específica habilitada por soporte

Y entonces el sistema empieza a degradarse:

- lógica comercial repartida por muchas capas
- condiciones difíciles de testear
- comportamientos inconsistentes
- soporte que no sabe exactamente qué corresponde a cada cuenta
- frontend mostrando una cosa y backend aplicando otra

El problema no era tener pocos planes.
El problema era **modelar una realidad dinámica como si fuera una etiqueta estática.**

## Tenants y aislamiento: una decisión técnica y también de producto

Cuando hablás de tenants, no solo pensás en negocio.
También pensás en aislamiento.

Y eso pega directo en arquitectura.

Las preguntas importantes son:

- ¿cómo se separan los datos entre tenants?
- ¿qué garantiza que un usuario de un tenant no vea datos de otro?
- ¿qué operaciones administrativas cruzan límites?
- ¿cómo se auditan accesos sensibles?
- ¿qué cosas se comparten y cuáles no?

Hay varias estrategias posibles:

- aislamiento lógico por `tenant_id`
- esquemas separados por tenant
- bases separadas por tenant
- modelos híbridos según tamaño o tier del cliente

Cada una tiene trade-offs.

Pero incluso si elegís aislamiento lógico simple, hay una regla que no cambia:

**el tenant debe ser una parte explícita y seria del modelo, no un detalle decorativo.**

Si no lo es, tarde o temprano aparecen fugas de datos, permisos mal resueltos o comportamientos cruzados peligrosos.

## Los límites no deberían ser magia escondida

En muchos productos los límites existen, pero están mal expresados.

Por ejemplo:

- el frontend oculta un botón cuando se supera cierto umbral
- un servicio rechaza crear usuarios desde cierto número
- otro endpoint todavía permite crear invitaciones
- soporte “habilita un poco más” editando algo a mano

Eso genera una experiencia caótica.

Los límites sanos deberían ser:

- explícitos
- consistentes
- auditables
- fáciles de consultar
- aplicados desde backend
- razonablemente observables

Además, conviene decidir bien el comportamiento ante exceso.

Porque no todos los límites se gestionan igual.

### Algunos límites son de bloqueo duro

Por ejemplo:

- no se pueden crear más usuarios que el máximo permitido
- no se pueden activar más integraciones que las contratadas

### Otros pueden ser de aviso o degradación suave

Por ejemplo:

- se puede exceder temporalmente el almacenamiento, pero se avisa
- se permite terminar el mes por encima del cupo y se factura exceso

### Otros funcionan mejor como límites negociables

Por ejemplo:

- rate limits más altos en enterprise
- retención ampliada por contrato
- lotes más grandes para exportaciones premium

La clave es que el sistema lo modele con claridad.
No como una mezcla de decisiones implícitas repartidas en distintos lugares.

## El backend debería ser la fuente de verdad de entitlements y límites

Éste es un principio muy importante.

Frontend puede mostrar estados, hints y mensajes.
Pero el backend debería ser quien realmente sepa:

- qué puede hacer el tenant
- qué no puede hacer
- qué límite tiene
- si está en trial
- si la cuenta está suspendida
- si una feature está habilitada

¿Por qué?
Porque si esa lógica queda repartida o solo “sugerida” desde UI:

- aparecen inconsistencias
- cambian pantallas pero no reglas reales
- integraciones por API eluden restricciones
- soporte no sabe cuál es la verdad operativa

En SaaS, los entitlements y límites son parte de la lógica central del producto.
No un detalle visual.

## Configuración por tenant: útil, pero con límites

En un SaaS real suele existir configuración por tenant.
Y eso está bien.

Por ejemplo:

- branding
- zonas horarias
- defaults operativos
- reglas de aprobación
- integraciones activas
- políticas de retención

El problema aparece cuando “configuración por tenant” empieza a usarse como excusa para permitir cualquier divergencia.

Entonces el backend termina teniendo:

- reglas distintas por cliente sin modelo claro
- flags históricos difíciles de eliminar
- comportamiento impredecible
- testing explosivo por combinaciones

Por eso conviene una regla simple:

**configuración sí; bifurcación ilimitada del producto, no.**

Una buena configuración por tenant debería:

- estar modelada explícitamente
- tener alcance acotado
- ser visible para soporte y auditoría
- no reemplazar reglas base del producto sin control
- no introducir combinaciones imposibles de sostener

## Qué conviene evitar al modelar planes

### 1. Codificar toda la lógica del plan en condicionales dispersos

Si cada servicio decide por su cuenta qué significa Pro o Enterprise, la coherencia se pierde rápido.

### 2. Usar el nombre comercial del plan como única fuente de verdad

El nombre sirve para negocio y comunicación, pero muchas veces no alcanza para representar capacidades reales.

### 3. Mezclar billing con permisos de dominio sin una capa clara

Pagar, facturar y cobrar no son exactamente lo mismo que autorizar acciones funcionales.

### 4. Resolver excepciones comerciales con hacks permanentes

El sistema termina lleno de overrides invisibles y nadie sabe bien qué aplica a cada cuenta.

### 5. No dejar trazabilidad de cambios de plan o de límites

Después cuesta muchísimo explicar por qué una cuenta tiene cierto comportamiento hoy.

### 6. Hacer que todo dependa del plan y nada de entitlements reales

A veces dos cuentas del mismo plan no tienen exactamente las mismas capacidades efectivas.
Y eso debería poder expresarse sin romper el modelo.

## Un ejemplo conceptual sano

Imaginá un SaaS B2B de gestión operativa.

Podrías modelar algo así:

- `tenant`
- `tenant_membership`
- `subscription`
- `plan`
- `feature_entitlement`
- `usage_limit`
- `usage_snapshot` o métricas de consumo
- `tenant_configuration`

Entonces una operación como “crear nuevo usuario” podría evaluarse así:

1. verificar identidad y permisos del actor
2. verificar que actúe dentro del tenant correcto
3. consultar límite efectivo de usuarios del tenant
4. consultar consumo actual
5. decidir si se permite, se bloquea o se permite con advertencia
6. registrar evento o auditoría si corresponde

Fijate que ahí no alcanza con preguntar “¿es plan Pro?”.
La decisión real es un poco más rica.

## Qué preguntas conviene hacerse antes de implementar esto

1. ¿qué representa exactamente el tenant en nuestro producto?
2. ¿el cliente real es una persona o una organización?
3. ¿un usuario puede pertenecer a varios tenants?
4. ¿qué parte del producto depende del plan y cuál no?
5. ¿qué capabilities conviene modelar como entitlements explícitos?
6. ¿qué límites deben ser duros, cuáles blandos y cuáles negociables?
7. ¿qué cambios de plan deben surtir efecto inmediato y cuáles al renovar?
8. ¿cómo se auditan cambios en límites o habilitaciones especiales?
9. ¿qué excepciones comerciales podrían aparecer y cómo evitar que destruyan el diseño?
10. ¿qué parte del sistema hoy depende demasiado de nombres de planes en vez de reglas bien modeladas?

## Señales de que el modelo actual está deteriorándose

- para saber qué puede hacer una cuenta hay que mirar varios lugares del código
- soporte necesita preguntar a desarrollo por cada caso especial
- frontend y backend no coinciden en restricciones o habilitaciones
- cambiar un plan rompe validaciones inesperadas
- las promociones o trials obligan a meter parches rápidos
- los overrides no tienen trazabilidad clara
- la lógica comercial está metida dentro de servicios del dominio sin separación
- nadie puede explicar con precisión por qué una cuenta tiene ciertos permisos efectivos

Si eso pasa, probablemente no falten más `if`.
Probablemente falte **mejor modelado**.

## Lo que deberías llevarte de esta lección

Si tuvieras que quedarte con una sola idea, que sea ésta:

**en un SaaS, tenant, plan y límite no son lo mismo; son capas distintas del sistema, y separarlas bien hace que el producto sea mucho más coherente, operable y evolutivo.**

Cuando todo eso se mezcla:

- el dominio se ensucia
- la lógica comercial se vuelve opaca
- las excepciones proliferan
- el soporte se complica
- el crecimiento del producto se vuelve caro

Cuando se separa bien:

- cambia mejor el pricing
- cambian mejor las capacidades
- se operan mejor los clientes
- se audita mejor el comportamiento
- se sostiene mejor el crecimiento

## Cierre

Modelar tenants, planes y límites no es un detalle administrativo.
Es una parte central del backend SaaS.

Porque ahí se define:

- cómo se representa el cliente dentro de la plataforma
- cómo se aísla su información
- cómo se habilitan capacidades
- cómo se expresan restricciones
- cómo se conecta el producto con la realidad comercial

Si esta base está bien pensada, el resto del sistema gana claridad.
Si está mal resuelta, muchas decisiones futuras se vuelven confusas y costosas.

Y una vez que entendés esta base, el siguiente paso natural es avanzar hacia otra pieza crítica del mundo SaaS:

**cómo modelar billing recurrente y suscripciones sin que la lógica de cobro termine contaminando todo el backend.**

Ahí entramos en el próximo tema: **billing recurrente y suscripciones**.
