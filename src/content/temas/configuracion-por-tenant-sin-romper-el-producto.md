---
title: "Configuración por tenant sin romper el producto"
description: "Cómo permitir configuración por tenant en un SaaS B2B sin convertir el sistema en una colección de excepciones difíciles de mantener, separando producto estándar, settings configurables, entitlements, integraciones y personalizaciones para conservar coherencia técnica y operativa a medida que crecen los clientes." 
order: 182
module: "SaaS, billing y producto B2B"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior vimos cómo pensar:

- onboarding de clientes B2B
- activación operativa
- configuración inicial
- estados de onboarding
- importaciones
- integraciones
- tiempo hasta valor
- activación útil y segura

Eso nos deja justo en una pregunta muy importante.

Porque una vez que el cliente:

- entra al producto
- activa su cuenta
- invita a su equipo
- configura lo básico
- empieza a operar

aparece casi siempre lo siguiente:

**“nosotros necesitamos que esto funcione un poco distinto”.**

Y ahí nace uno de los problemas más delicados de un SaaS B2B:

**la configuración por tenant.**

Porque un producto para múltiples clientes rara vez funciona bien si obliga a todos a operar exactamente igual.

Pero tampoco funciona si cada cliente termina teniendo “su propia versión especial” del sistema.

Entonces aparece la tensión real:

- querés flexibilidad
- pero no querés fragmentar el producto
- querés adaptarte a distintos clientes
- pero no querés volver inmantenible el backend
- querés vender a cuentas grandes
- pero no querés transformar cada venta en una rama paralela del sistema

De eso trata el tema de hoy:

**cómo permitir configuración por tenant sin romper el producto.**

## El error clásico: empezar a meter excepciones por cliente en cualquier lado

Éste es uno de los caminos más peligrosos en SaaS B2B.

El producto arranca bien.
Hay una lógica general.
Todos usan más o menos lo mismo.

Pero llega un cliente importante y pide algo como:

- un flujo apenas distinto
- una validación especial
- un campo extra
- una regla diferente de aprobación
- otro branding
- una integración específica
- una política particular de acceso

Entonces alguien resuelve rápido con algo como:

- `if tenant == X`
- `if companyId == Y`
- una columna extra solo para ese caso
- una excepción escondida en un service
- una variante en frontend sin modelo claro atrás
- una rama especial en la API

Al principio parece inofensivo.

El problema es que eso casi nunca se queda en una sola excepción.
Después aparece otra.
Y otra.
Y otra.

Y de golpe el producto deja de ser un producto coherente y pasa a ser una mezcla de:

- comportamiento estándar
- excepciones históricas
- acuerdos comerciales escondidos en código
- reglas por cliente que nadie recuerda del todo
- deuda técnica difícil de borrar

## Qué significa realmente configuración por tenant

Configuración por tenant no significa “hacer cualquier cosa distinta para cualquier cliente”.

Significa algo más sano:

**permitir variaciones previstas y modeladas dentro de un producto común.**

Es decir:

- el producto sigue siendo uno
- la arquitectura base sigue siendo compartida
- el código central sigue teniendo lógica general
- pero ciertos comportamientos, límites o apariencias pueden variar por tenant dentro de un marco controlado

La clave está en esa última parte:

**dentro de un marco controlado.**

No se trata de que cada cliente invente su propio software.
Se trata de que el producto pueda adaptarse en ejes que fueron pensados, modelados y mantenidos como parte del diseño.

## Personalización no es lo mismo que configuración

Esta distinción ayuda muchísimo.

### Configuración

Es una variación prevista por el producto.

Por ejemplo:

- idioma
- zona horaria
- branding visual acotado
- límites operativos
- features habilitadas
- reglas de aprobación parametrizables
- políticas de invitación
- integraciones activas o inactivas

### Personalización

Es un cambio específico que altera el comportamiento del producto de forma no estándar.

Por ejemplo:

- un flujo exclusivo para un cliente
- una pantalla que solo existe para una cuenta
- lógica de negocio distinta para un tenant concreto
- campos obligatorios que no existen para nadie más
- reglas comerciales propias embebidas en código

La configuración bien diseñada escala.
La personalización ad hoc suele romper el modelo de producto.

## Por qué los clientes B2B piden configuración

No piden configuración por capricho.
Normalmente la piden porque operan distinto.

Pueden diferir en:

- tamaño organizacional
- estructura interna
- políticas de seguridad
- regulaciones
- procesos de aprobación
- mercados o países
- branding y experiencia de usuario
- integraciones existentes
- restricciones contractuales
- límites de uso

Entonces la pregunta correcta no es:

**“¿aceptamos configuración o no?”**

La pregunta correcta es:

**“qué partes del producto conviene hacer configurables y cuáles deben seguir siendo estándar?”**

## Qué cosas suelen ser buenas candidatas a configuración por tenant

Hay varios tipos de configuración que suelen ser razonables.

### 1. Configuración visual o de presentación

Por ejemplo:

- nombre visible de la organización
- logo
- colores acotados
- dominio custom
- plantillas de comunicación
- idioma por defecto
- formato regional

### 2. Configuración de seguridad

Por ejemplo:

- política de invitaciones
- obligatoriedad de SSO
- MFA recomendado o requerido
- sesiones más estrictas
- allowlists
- retención de auditoría

### 3. Configuración de integraciones

Por ejemplo:

- qué proveedor está habilitado
- qué credenciales usa cada tenant
- endpoints propios
- webhooks activos
- mapeos de campos
- jobs sincronizados

### 4. Configuración operativa

Por ejemplo:

- límites por plan
- defaults de workflow
- reglas de aprobación parametrizables
- catálogos o taxonomías configurables
- horarios operativos
- formatos de numeración

### 5. Configuración de producto asociada a plan

Por ejemplo:

- cantidad máxima de usuarios
- acceso a módulos premium
- features enterprise
- capacidades avanzadas
- límites de almacenamiento o consumo

Todas estas variaciones pueden convivir sanamente si están bien modeladas.

## Qué cosas suelen ser una mala candidata a configuración

No todo conviene volver configurable.

Hay casos donde lo “configurable” termina siendo una forma elegante de ocultar complejidad estructural.

Suele ser mala idea configurar cosas como:

- reglas de dominio esenciales completamente distintas entre tenants
- modelos de datos incompatibles entre clientes
- flujos centrales con ramas arbitrarias infinitas
- permisos imposibles de razonar
- estados del sistema que cambian radicalmente según cliente
- múltiples semánticas distintas para la misma operación

Si dos tenants entienden de forma radicalmente distinta qué significa una operación central, quizá no hace falta “más configuración”.
Quizá hace falta:

- segmentar mejor el producto
- redefinir límites
- separar módulos
- o admitir que ciertas necesidades ya no entran bien en el mismo core

## El objetivo no es maximizar flexibilidad, sino maximizar control útil

Ésta es una idea central.

Muchos equipos creen que un producto B2B maduro es uno donde “todo se puede configurar”.

Eso no siempre es cierto.

Un producto sano no es el que permite cualquier combinación imaginable.
Es el que permite las variaciones correctas sin perder coherencia.

Por eso el objetivo real debería ser:

- ofrecer flexibilidad donde aporta valor
- limitar combinaciones peligrosas
- mantener defaults claros
- evitar estados imposibles
- poder razonar sobre el comportamiento de cada tenant

## Diferenciar entre settings, entitlements y feature flags

Éste es un punto técnico muy importante.

Muchas veces todo se mezcla en una misma bolsa llamada “config”.
Y eso genera caos.

Conviene separar al menos estas tres cosas.

### Settings

Son configuraciones operativas o de comportamiento parametrizable.

Por ejemplo:

- zona horaria
- idioma
- política de naming
- workflow por defecto
- branding visible

### Entitlements

Definen qué acceso o capacidad tiene un tenant según contrato, plan o acuerdo.

Por ejemplo:

- acceso a módulo avanzado
- cantidad máxima de usuarios
- exportaciones habilitadas
- auditoría extendida
- SSO disponible

### Feature flags

Sirven para controlar rollout, pruebas o activación progresiva de comportamiento.

Por ejemplo:

- habilitar una funcionalidad nueva para un subconjunto
- probar una UX distinta
- activar algo temporalmente antes de pasarlo a general availability

No conviene usar una feature flag como si fuera un entitlement permanente.
Tampoco conviene usar un setting para representar una restricción contractual.
Y menos todavía mezclar todo en una sola tabla sin semántica clara.

## Cómo modelar configuración por tenant sin perder control

Un enfoque sano suele incluir varias ideas.

### Defaults globales

El producto debería tener una configuración estándar.

Eso evita que cada tenant necesite definir todo desde cero.
También permite que exista un comportamiento base entendible.

### Overrides acotados

Cada tenant puede cambiar ciertas claves específicas.
Pero no cualquier cosa.

La idea es que el sistema diga claramente:

- qué puede configurarse
- qué valores son válidos
- qué combinaciones están permitidas
- qué depende del plan
- qué requiere validación adicional

### Esquema claro de configuración

No alcanza con guardar JSON arbitrario y listo.

Conviene tener algo que permita:

- validación de claves
- validación de tipos
- restricciones de rangos
- compatibilidad con defaults
- evolución del esquema
- documentación entendible

### Lectura predecible

El sistema debería poder resolver fácilmente algo como:

- valor default global
- override por tenant
- override por workspace si aplica
- restricciones por plan
- estado final efectivo

La configuración útil no es solo “guardar valores”.
También es **resolver correctamente el valor efectivo**.

## Cuidado con los JSON mágicos sin contrato

Guardar config en JSON puede ser práctico.
No es malo por sí mismo.

Lo peligroso es cuando ese JSON se convierte en una caja negra donde vive cualquier cosa.

Por ejemplo:

- claves sin documentación
- nombres inconsistentes
- valores sin validación
- settings obsoletos que nadie limpia
- branches de código que dependen de strings mágicos
- imposibilidad de saber qué tenants usan qué opción

Si usás JSON, igual necesitás disciplina:

- contrato claro
- validaciones
- versionado
- migraciones
- naming consistente
- observabilidad

El problema no es el formato.
El problema es la falta de modelo.

## Configuración efectiva y herencia de niveles

En algunos SaaS no alcanza con configuración a nivel tenant.
Puede haber varios niveles.

Por ejemplo:

- default del producto
- configuración por plan
- configuración por tenant
- configuración por workspace
- preferencia por usuario

Eso obliga a definir una política clara de precedencia.

Por ejemplo:

- el producto define el default
- el plan habilita o limita ciertas opciones
- el tenant personaliza dentro de lo permitido
- el workspace ajusta lo local
- el usuario solo cambia preferencias personales

Si esta jerarquía no está clara, aparecen bugs difíciles como:

- UI mostrando un valor distinto al backend
- un tenant creyendo que tiene algo habilitado cuando el plan no lo permite
- un workspace rompiendo una política global
- settings que se pisan entre sí sin explicación

## Configuración y contratos comerciales

En SaaS B2B muchas veces aparecen acuerdos especiales.

Por ejemplo:

- un tenant tiene un límite distinto al plan estándar
- una cuenta enterprise accede a algo no público
- un cliente piloto prueba capacidades avanzadas
- una integración premium está incluida por negociación

Eso obliga a separar bien entre:

- lo que es producto general
- lo que es plan estándar
- lo que es excepción contractual explícita

La excepción contractual puede existir.
Pero debería estar modelada de forma visible y deliberada.
No escondida como parche técnico.

Un buen criterio es que el sistema pueda responder:

- qué tiene habilitado este tenant
- por qué lo tiene habilitado
- si viene del plan, de una excepción o de un rollout
- hasta cuándo aplica
- quién autorizó esa diferencia

## Configuración y migraciones

A medida que el producto evoluciona, también cambia la configuración.

Entonces aparecen necesidades como:

- renombrar claves
- eliminar settings viejos
- introducir nuevos defaults
- cambiar semántica de una opción
- partir una configuración en dos
- dejar de soportar combinaciones obsoletas

Por eso la configuración necesita evolucionar con disciplina.

No alcanza con “agregar otra key”.
También hace falta pensar:

- cómo se migran tenants existentes
- qué pasa con valores viejos
- cómo detectar configuraciones inválidas
- cómo comunicar cambios a soporte y operaciones

Un producto sano trata la configuración como parte del sistema vivo, no como una zona informal.

## Observabilidad: tenés que poder ver cómo está configurado el mundo

Cuando empiezan los problemas, muchas veces la primera pregunta es:

**“¿cómo está configurado este tenant?”**

Si responder eso lleva veinte minutos, buscar en base, revisar código y preguntar a tres personas, ya tenés un problema.

Conviene poder inspeccionar con claridad:

- settings efectivos
- features habilitadas
- entitlements del tenant
- excepciones contractuales
- estado de integraciones
- última modificación relevante
- quién cambió qué

Esto es importante para:

- soporte
- customer success
- ingeniería
- incidentes
- auditoría

## Configuración segura no significa editable por cualquiera

Otro error común es asumir que toda configuración por tenant debería ser editable desde un panel.

No siempre.

Hay configuraciones que pueden ser:

- autogestionables por el cliente
- administrables por un admin organizacional
- visibles pero no editables
- solo modificables por soporte interno
- controladas por contrato o por ingeniería

La clave es no confundir:

- **existencia de configuración**
- **capacidad de edición libre**

Que algo sea configurable no implica que cualquiera deba cambiarlo en producción sin control.

## Un producto B2B sano necesita una frontera clara entre core y variación

Ésta es probablemente la idea más importante del tema.

El producto necesita distinguir entre:

- el **core** que debería comportarse de manera consistente
- la **variación permitida** que puede cambiar por tenant

Si esa frontera no existe, todo termina siendo debatible y cada venta presiona para mover piezas centrales.

En cambio, cuando la frontera está clara, el equipo puede decir:

- esto sí es configurable
- esto depende del plan
- esto requiere rollout controlado
- esto no es configuración, es una customización que hoy no entra en el producto

Esa claridad protege al sistema.
Y también protege al negocio.

## Errores comunes

### 1. Mezclar configuración con excepciones improvisadas

Eso vuelve invisible qué es estándar y qué es parche.

### 2. Usar `if tenant == X` como estrategia de producto

Puede resolver algo urgente, pero acumulado destruye mantenibilidad.

### 3. No separar settings, entitlements y feature flags

Entonces el modelo pierde semántica y nadie entiende de dónde sale el comportamiento.

### 4. Permitir configuraciones sin validación ni límites

Eso abre la puerta a estados imposibles o difíciles de soportar.

### 5. Tratar toda necesidad enterprise como si debiera entrar en el core configurable

Algunas cosas son configuración sana.
Otras son customizaciones que conviene rechazar o rediseñar.

### 6. No tener defaults claros

Cuando cada tenant queda completamente distinto, el producto pierde coherencia.

### 7. No auditar cambios de configuración sensibles

Eso complica soporte, incidentes y análisis de regresiones.

## Buenas prácticas iniciales

## 1. Definir explícitamente qué ejes del producto son configurables

No dejes que eso surja solo por presión comercial o por urgencias.

## 2. Mantener un core estable y una capa de variación controlada

La flexibilidad debería vivir en lugares previstos, no dispersa por todo el código.

## 3. Separar settings, entitlements y feature flags

Cada cosa cumple un propósito distinto y conviene modelarlas diferente.

## 4. Usar defaults fuertes y overrides acotados

Eso reduce combinaciones caóticas y conserva comportamiento entendible.

## 5. Validar y versionar la configuración

La configuración también evoluciona y necesita disciplina de ingeniería.

## 6. Hacer visible la configuración efectiva de cada tenant

Soporte e ingeniería deberían poder entender rápidamente qué está activo y por qué.

## 7. Decidir qué es self-service, qué requiere permisos altos y qué debe quedar controlado internamente

No toda configuración debería ser editable por cualquier admin del cliente.

## Mini ejercicio mental

Pensá estas preguntas:

1. ¿qué partes de tu producto realmente necesitan variar por tenant?
2. ¿tenés diferencias por cliente modeladas como configuración o escondidas como excepciones en código?
3. ¿distinguís claramente entre settings, plan, entitlements y feature flags?
4. ¿podés saber cuál es la configuración efectiva de un tenant en un momento dado?
5. ¿qué variaciones de clientes aceptarías como configuración sana y cuáles ya serían una customización peligrosa?

## Resumen

En esta lección viste que:

- la configuración por tenant sirve para adaptar el producto a variaciones reales sin romper su coherencia
- configurar no es lo mismo que personalizar arbitrariamente
- conviene decidir qué partes del sistema son configurables y cuáles deben seguir siendo estándar
- settings, entitlements y feature flags cumplen funciones distintas y no conviene mezclarlos
- defaults claros, overrides acotados y validaciones fuertes reducen caos operativo
- la configuración necesita observabilidad, auditoría y evolución disciplinada
- un SaaS B2B sano permite variación útil sin transformarse en una colección de excepciones por cliente
