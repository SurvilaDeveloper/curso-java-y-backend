---
title: "Feature flags y configuración dinámica"
description: "Qué son las feature flags y la configuración dinámica, por qué son tan útiles en sistemas reales y cómo ayudan a activar, desactivar o graduar comportamientos sin depender siempre de un redeploy."
order: 78
module: "Backend real e integraciones"
level: "intermedio"
draft: false
---

## Introducción

Cuando un proyecto es chico, muchas decisiones de comportamiento suelen quedar fijas en el código.

Por ejemplo:

- una funcionalidad está activa o no
- un límite tiene cierto valor
- una integración usa un proveedor determinado
- una validación está habilitada
- una regla de negocio se aplica siempre
- una ruta nueva se expone apenas se deploya

En etapas tempranas, eso puede parecer suficiente.

Pero cuando el sistema crece, aparece una necesidad muy importante:

**poder cambiar ciertos comportamientos sin tener que modificar código y redeployar cada vez.**

Ahí entran dos ideas muy valiosas:

- **feature flags**
- **configuración dinámica**

Estas herramientas ayudan a que el sistema sea más flexible, más controlable y menos riesgoso en producción.

## Qué es una feature flag

Una feature flag es una bandera o interruptor lógico que permite activar o desactivar una funcionalidad o comportamiento en tiempo de ejecución.

La idea básica es muy simple:

- si la flag está activa, ocurre algo
- si la flag está inactiva, ocurre otra cosa

Por ejemplo:

- habilitar un nuevo checkout
- activar una validación más estricta
- mostrar un flujo nuevo solo a ciertos usuarios
- encender temporalmente una integración
- deshabilitar una funcionalidad problemática sin redeploy

Es como poner un interruptor de control sobre partes del sistema.

## Qué es configuración dinámica

La configuración dinámica es una configuración cuyo valor puede cambiar sin necesidad de recompilar o redeployar toda la aplicación.

Por ejemplo:

- cantidad máxima permitida
- porcentaje de rollout
- tiempo de expiración
- endpoint de una integración
- límites operativos
- parámetros de un algoritmo
- lista de funcionalidades habilitadas

A diferencia de una constante rígida en el código, estos valores pueden ajustarse con más flexibilidad.

## Diferencia entre flag y configuración

Aunque están relacionadas, no son exactamente lo mismo.

### Feature flag

Suele responder preguntas del tipo:

- ¿esto está activo o no?
- ¿esta funcionalidad se muestra o no?
- ¿este flujo nuevo se usa o no?

### Configuración dinámica

Suele responder preguntas del tipo:

- ¿qué valor debe usar el sistema ahora?
- ¿cuál es el límite actual?
- ¿qué porcentaje de usuarios entra al nuevo flujo?
- ¿qué timeout o parámetro aplica?

Una flag suele ser binaria o casi binaria.
La configuración dinámica puede tener valores más amplios.

## Por qué esto importa tanto

Porque en sistemas reales, cambiar comportamiento con seguridad es una ventaja enorme.

Sin estas herramientas, muchas veces la alternativa es:

- cambiar código
- hacer commit
- esperar pipeline
- desplegar
- cruzar dedos

Eso puede ser demasiado costoso o riesgoso para cambios pequeños o urgentes.

En cambio, con flags y configuración dinámica, muchas decisiones pueden ajustarse de forma más controlada.

## Casos donde esto resulta muy útil

## 1. Activar una funcionalidad nueva gradualmente

No querés que algo nuevo impacte a todo el mundo al mismo tiempo.

## 2. Hacer rollout controlado

Primero lo ve un porcentaje pequeño.
Después más usuarios.

## 3. Desactivar algo problemático rápido

Si una funcionalidad genera errores, podés apagarla.

## 4. Separar despliegue de lanzamiento

Podés deployar código antes y activar después.

## 5. Probar variantes

Por ejemplo:

- estrategia A
- estrategia B

## 6. Ajustar parámetros sin redeploy

Muy útil para límites, thresholds o configuraciones operativas.

## 7. Habilitar funciones por cliente, entorno o segmento

Especialmente en SaaS o sistemas multiempresa.

## Ejemplo intuitivo

Supongamos que desarrollaste un nuevo flujo de checkout.

No querés reemplazar el anterior de golpe.

Entonces hacés algo así:

- la aplicación ya contiene ambos flujos
- una flag decide cuál usar
- primero activás el nuevo solo para testing interno
- después para 5% de usuarios
- después para todos

Eso reduce mucho riesgo.

## Separar deploy de release

Este es uno de los beneficios más importantes.

### Deploy

El código ya está en producción.

### Release

La funcionalidad realmente se habilita para usuarios.

Sin flags, muchas veces deploy y release son casi lo mismo.

Con flags, podés separar ambas cosas.

Eso permite:

- desplegar antes
- validar mejor
- activar en el momento adecuado
- retroceder más fácil
- coordinar mejor con negocio u operaciones

## Kill switch

Una idea muy poderosa es usar una flag como “kill switch”.

Es decir, un interruptor para apagar rápidamente una función problemática.

Por ejemplo:

- una integración externa empieza a fallar
- una búsqueda nueva degrada rendimiento
- un flujo experimental rompe algo
- una característica nueva genera errores

Si hay una flag bien diseñada, podés desactivar ese comportamiento sin tocar código.

## Rollout gradual

No todo tiene que salir para el 100% de usuarios de una vez.

A veces conviene hacer rollout por etapas:

- equipo interno
- testers
- usuarios beta
- 1%
- 10%
- 50%
- 100%

Esto ayuda a detectar problemas antes de expandir impacto.

## Segmentación

Las flags también pueden aplicarse según criterios.

Por ejemplo:

- entorno
- usuario
- rol
- país
- cliente
- tenant
- plan
- cohorte
- porcentaje aleatorio controlado

Esto vuelve el sistema mucho más flexible.

## Ejemplo conceptual

Supongamos que tenés una nueva integración de cálculo de envíos.

Podrías decidir:

- usarla solo en producción
- activarla solo para un tenant específico
- habilitarla solo en cierto porcentaje
- dejar la vieja como fallback
- apagarla rápidamente si aparece un problema

Sin flags, ese control fino sería mucho más difícil.

## Configuración dinámica en lugar de “números mágicos”

No solo hablamos de activar o desactivar funciones.

También importa poder cambiar parámetros sin tocar código.

Por ejemplo:

- máximo de reintentos
- timeout de una integración
- porcentaje de descuento permitido
- límite de intentos
- tamaño máximo de archivo
- intervalo de polling
- thresholds de alertas
- cupos por plan

Si esos valores están rígidos en el código, cada ajuste requiere redeploy.

A veces eso no es deseable.

## Dónde puede vivir esta configuración

Depende del sistema.

Puede venir de:

- variables de entorno
- archivos de configuración
- base de datos
- servicios de configuración
- paneles administrativos internos
- herramientas específicas de flags

Lo importante no es la herramienta puntual.
Lo importante es entender el propósito y los trade-offs.

## Riesgos de usar muchas flags

Aunque son muy útiles, también pueden volverse peligrosas si se usan mal.

Por ejemplo:

- demasiadas combinaciones de comportamiento
- código difícil de entender
- ramas muertas que nadie limpia
- flags olvidadas
- reglas confusas
- entornos inconsistentes
- bugs que aparecen solo con ciertas combinaciones

Entonces:

**las flags dan poder, pero también agregan complejidad.**

## Feature flag no significa “dejar código duplicado para siempre”

Una mala práctica común es crear una flag para una migración o experimento y nunca retirarla.

Entonces queda algo así:

- flujo viejo
- flujo nuevo
- lógica condicional eterna
- nadie sabe qué sigue activo realmente

Eso degrada mucho mantenibilidad.

Muchas flags deberían ser temporales.

Después de que una decisión queda estable, conviene limpiar.

## Tipos de flags

Conceptualmente, puede servir pensar algunos tipos.

### Release flags

Sirven para lanzar funcionalidades de manera controlada.

### Experiment flags

Sirven para probar variantes.

### Ops flags

Sirven para apagar, encender o ajustar comportamientos operativos.

### Permission flags

Sirven para habilitar algo según usuario, rol, plan o cliente.

No siempre hace falta usar estas categorías formalmente, pero ayudan a pensar.

## Relación con temas anteriores

Este tema conecta con varios anteriores.

### Rate limiting

Porque ciertos límites pueden venir de configuración dinámica.

### Integraciones externas

Porque podés cambiar proveedores, endpoints o habilitar fallback.

### Tareas programadas y background jobs

Porque a veces querés ajustar frecuencias o apagar procesos.

### Webhooks

Porque podés habilitar o deshabilitar recepción o procesamiento bajo ciertas condiciones.

### Emails y notificaciones

Porque podés activar mensajes o canales según estrategia.

Todo esto hace al sistema más gobernable.

## Cuándo conviene usar una flag

Suele tener sentido cuando:

- querés rollout gradual
- querés separar deploy de release
- querés una salida rápida ante problemas
- querés segmentar usuarios o clientes
- querés probar un comportamiento nuevo
- la decisión puede cambiar en producción

## Cuándo no conviene usar una flag

No todo merece una flag.

Puede no convenir cuando:

- la decisión es totalmente estable
- solo agrega ruido y complejidad
- el cambio es interno y no necesita control operativo
- la funcionalidad no requiere rollout ni fallback
- la supuesta flexibilidad no tiene valor real

Crear flags “por las dudas” puede ser una mala idea.

## Observabilidad

Cuando un sistema usa flags y configuración dinámica, conviene saber:

- qué valor tenía una flag en cierto momento
- para quién estaba activa
- quién cambió una configuración
- cuándo se hizo el cambio
- qué versión o comportamiento quedó aplicado
- cómo impactó ese cambio

Esto es importante para depuración y auditoría operativa.

## Buenas prácticas iniciales

## 1. Usar flags para problemas reales, no por moda

Cada flag debería tener una razón clara.

## 2. Nombrarlas bien

El nombre debe expresar intención.

## 3. Definir si será temporal o permanente

Eso ayuda a evitar acumulación.

## 4. Tener estrategia de limpieza

Las flags viejas generan deuda técnica.

## 5. Evitar demasiadas combinaciones difíciles de probar

La flexibilidad excesiva también rompe.

## 6. Separar flags de release de configuración operativa

Aunque puedan convivir, no siempre cumplen el mismo rol.

## 7. Registrar cambios importantes

Especialmente en producción.

## Errores comunes

### 1. Crear flags y nunca eliminarlas

Después el sistema queda lleno de ramas difíciles de entender.

### 2. Usar flags para esconder mal diseño

No deberían ser parche permanente de problemas estructurales.

### 3. No observar quién cambió qué

Eso complica mucho soporte.

### 4. Meter demasiada lógica de negocio en combinaciones de flags

Después probar todo se vuelve una pesadilla.

### 5. No separar rollout, experimento y configuración

Cada cosa tiene necesidades distintas.

### 6. Guardar valores críticos sin una estrategia clara de consistencia

La flexibilidad también requiere control.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. ¿qué funcionalidad nueva de un e-commerce te gustaría lanzar con rollout gradual?
2. ¿qué comportamiento querrías poder apagar rápido sin redeploy?
3. ¿qué límites o parámetros de tu sistema tendría sentido volver dinámicos?
4. ¿qué flags deberían ser temporales y cuáles podrían ser más permanentes?
5. ¿qué riesgo aparece si nadie limpia flags viejas?

## Resumen

En esta lección viste que:

- una feature flag permite activar o desactivar comportamientos en tiempo de ejecución
- la configuración dinámica permite cambiar valores sin redeployar siempre
- estas herramientas ayudan a separar deploy de release, hacer rollout gradual y reducir riesgo
- también permiten apagar funciones problemáticas, segmentar comportamiento y ajustar parámetros operativos
- mal usadas, agregan complejidad, deuda técnica y combinaciones difíciles de mantener
- por eso conviene usarlas con intención clara, buen nombre, observabilidad y estrategia de limpieza

## Siguiente tema

Ahora que ya entendés cómo usar feature flags y configuración dinámica para controlar mejor el comportamiento de una aplicación en producción, el siguiente paso natural es aprender sobre **jobs distribuidos y colas de trabajo**, porque muchos sistemas reales necesitan repartir tareas, desacoplar procesamiento y manejar trabajo asíncrono de forma más robusta.
