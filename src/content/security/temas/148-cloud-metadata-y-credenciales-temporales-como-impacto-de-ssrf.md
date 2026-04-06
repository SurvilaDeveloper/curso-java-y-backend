---
title: "Cloud metadata y credenciales temporales como impacto de SSRF"
description: "Cómo pensar endpoints de metadata y credenciales temporales del entorno cloud como impacto de SSRF en una aplicación Java con Spring Boot. Por qué no se trata solo de ver información de infraestructura y qué cambia cuando el backend puede alcanzar servicios de identidad o metadata desde su propia red."
order: 148
module: "Consumo saliente, SSRF y conexiones externas"
level: "base"
draft: false
---

# Cloud metadata y credenciales temporales como impacto de SSRF

## Objetivo del tema

Entender por qué los **endpoints de metadata del entorno cloud** y las **credenciales temporales del runtime** son uno de los impactos más clásicos y delicados de **SSRF** en una aplicación Java + Spring Boot.

La idea de este tema es bajar el riesgo de SSRF a una consecuencia muy concreta que aparece mucho en sistemas desplegados sobre infraestructura moderna.

Hasta ahora vimos que una feature saliente puede permitir que el backend llegue a:

- localhost
- red privada
- Actuator
- paneles internos
- servicios del cluster
- sidecars
- DNS internos
- herramientas operativas

Ahora toca mirar otra categoría muy importante:

- servicios de metadata del entorno
- información de identidad de la instancia o workload
- credenciales temporales asociadas al runtime
- configuración e información del contexto de nube

En resumen:

> en cloud, SSRF no siempre busca “leer una página interna”.  
> A veces busca algo mucho más valioso: **usar al backend para consultar la identidad y los privilegios del entorno donde corre**.

---

## Idea clave

Muchos entornos cloud o de plataforma exponen servicios especiales accesibles desde dentro del runtime para consultar cosas como:

- metadata de la instancia
- identidad del workload
- credenciales temporales
- configuración del entorno
- información de red
- datos de despliegue
- características del nodo o del contenedor

La idea central es esta:

> si una feature saliente puede alcanzar ese tipo de endpoint, SSRF puede dejar de ser solo una herramienta de reconocimiento de red y pasar a ser una vía hacia identidad, privilegios o información operativa muy sensible.

Eso es lo que vuelve a los metadata endpoints un caso tan citado y tan importante.

### Idea importante

No se trata solo de que el backend “vea más cosas”.
Se trata de que, en algunos entornos, **también puede consultar quién es dentro de la infraestructura y con qué capacidades opera**.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- pensar que la metadata cloud es solo información menor de infraestructura
- no incluir credenciales temporales dentro del impacto de SSRF
- asumir que bloquear internet pública ya cubre gran parte del riesgo
- olvidar que el backend puede hablar con servicios especiales accesibles solo desde dentro
- subestimar la relación entre identidad del runtime y permisos del sistema
- tratar cloud metadata como un detalle de DevOps y no como un objetivo claro para SSRF

Es decir:

> el problema no es solo que exista metadata del entorno.  
> El problema es que una app vulnerable puede terminar actuando como puente entre un actor externo y la identidad privilegiada del runtime donde corre.

---

## Error mental clásico

Un error muy común es este:

### “Eso como mucho mostraría información de la instancia, no parece tan grave”

Eso minimiza demasiado el riesgo.

Porque, según el entorno y cómo esté configurado, un servicio de metadata puede revelar o facilitar cosas como:

- identidad del runtime
- credenciales temporales
- información de red
- configuración del despliegue
- nombres de recursos asociados
- contexto operativo útil para pivot posterior

### Idea importante

La metadata no es solo “info”.
Muchas veces es una forma de exponer **quién es** el proceso dentro de la nube y **qué puede hacer** desde esa posición.

---

## Por qué estos endpoints son tan atractivos para SSRF

Los metadata endpoints aparecen tanto en discusiones de SSRF porque reúnen varias condiciones muy valiosas para un atacante:

- suelen estar accesibles desde dentro del entorno
- no están pensados para exposición pública directa
- la app puede alcanzarlos si tiene salida suficiente
- contienen información que el usuario externo no debería poder consultar
- pueden estar muy cerca de la identidad efectiva del runtime

### Idea útil

Si SSRF te deja hacer que el backend mire “hacia adentro”, los servicios de metadata están entre las primeras cosas que vale la pena intentar desde una perspectiva ofensiva.

---

## No hace falta memorizar una nube concreta para entender el riesgo

En la práctica, distintos proveedores y plataformas tienen mecanismos distintos.
Pero la intuición importante del curso no depende de memorizar uno en particular.

La idea general es esta:

> algunos entornos exponen servicios internos que le dicen al proceso que corre allí cosas sobre su identidad, su configuración y, a veces, sus credenciales temporales.

### Regla sana

No pienses esto como “un caso raro de un proveedor específico”.
Pensalo como una clase de superficie interna muy valiosa allí donde exista.

---

## Metadata de infraestructura: por qué ya es sensible

Incluso antes de hablar de credenciales, la metadata puede enseñar mucho.

Por ejemplo, puede ayudar a inferir:

- tipo de entorno
- nombre o rol del workload
- región o zona
- interfaces de red
- identificadores de instancia o recurso
- configuración del despliegue
- relaciones con otros componentes del sistema

### Idea importante

Aunque no hubiera credenciales, ya puede ser una gran fuente de contexto para:

- reconocimiento
- priorización del ataque
- comprensión de la arquitectura
- movimientos posteriores más precisos

---

## Credenciales temporales: donde el impacto sube fuerte

El punto más delicado aparece cuando el entorno expone o facilita credenciales temporales asociadas al runtime.

Eso cambia bastante la gravedad porque ya no hablamos solo de:
- “saber dónde estoy”

sino de algo más cercano a:
- “con qué identidad puedo actuar desde aquí”

### Idea importante

Si SSRF alcanza un punto donde el backend puede consultar una identidad o credencial temporal, el problema puede escalar desde reconocimiento a acceso operativo mucho más serio.

### Regla sana

Cada vez que una identidad de workload o credencial de entorno pueda estar al alcance de una request saliente, el análisis de SSRF merece máxima prioridad.

---

## “Temporales” no significa “poco peligrosas”

A veces la palabra “temporales” tranquiliza de más.

Sí, una credencial temporal puede expirar.
Pero mientras es válida, puede seguir teniendo muchísimo valor si permite:

- leer recursos
- consultar APIs de plataforma
- enumerar infraestructura
- acceder a storage
- hablar con otros servicios
- obtener más contexto o incluso encadenar nuevas acciones

### Idea importante

Que una credencial no sea permanente no la vuelve irrelevante.
En incidentes reales, una ventana temporal puede ser más que suficiente.

---

## La identidad del runtime importa más de lo que parece

En muchos despliegues modernos, la aplicación corre con alguna identidad asociada al entorno:

- una cuenta de servicio
- un rol del workload
- una identidad del nodo o contenedor
- permisos acotados o no tan acotados

### Problema

El equipo puede pensar:
- “la app no tiene credenciales hardcodeadas, así que estamos mejor”

Eso suele ser una buena mejora.
Pero también significa que la identidad vive más del lado del entorno y, por lo tanto, puede volverse objetivo claro de SSRF si existe un metadata endpoint o un mecanismo accesible desde la red interna del runtime.

### Idea útil

Mover secretos fuera del código es bueno.
Pero no elimina la necesidad de proteger los caminos por los que el runtime obtiene o usa su identidad.

---

## SSRF aquí ya no es solo lectura: puede ser salto de privilegio indirecto

Cuando entran en juego credenciales temporales o identidades del entorno, SSRF deja de parecer solo una request rara hacia un host interno.

Puede transformarse en algo más serio:

- acceso a APIs de plataforma
- enumeración de recursos
- lectura de información sensible
- movimiento lateral
- pivot hacia storage, colas, secretos o servicios internos
- explotación del alcance real de la identidad del backend

### Idea importante

El daño no depende solo del endpoint de metadata.
Depende también de qué permisos tiene la identidad asociada al proceso que corre tu app.

---

## El principio de mínimo privilegio también vive acá

Este tema conecta con una lección general de seguridad de plataforma.

Si la identidad del runtime tiene demasiado poder, una SSRF que llegue a metadata o a mecanismos de identidad puede explotar ese exceso.

### Regla sana

Reducir permisos del workload no arregla SSRF, pero sí puede bajar muchísimo el impacto si algo llega a salir mal.

### Idea importante

La severidad real de este caso es:
- superficie SSRF
multiplicada por
- alcance de la identidad del entorno.

---

## No hace falta obtener un “gran secreto” para que ya sea problema

Otra trampa mental es pensar solo en el peor caso absoluto.

Sí, obtener credenciales temporales puede ser gravísimo.
Pero incluso sin llegar tan lejos, ya hay daño si la app puede revelar:

- detalles de la identidad del runtime
- características del despliegue
- regiones o recursos usados
- nombres de roles o cuentas
- estructura del entorno
- endpoints internos de plataforma

### Idea útil

A veces el primer valor ofensivo es de contexto, no de acceso directo.
Y ese contexto luego facilita pasos posteriores.

---

## Metadata endpoint + mensajes ricos de error = combinación peligrosa

Esto conecta con los últimos temas.

Una feature saliente puede no devolver el contenido completo del metadata endpoint, pero igual puede dar señales como:

- respondió / no respondió
- hubo timeout
- devolvió cierto status
- el backend llegó a ese destino
- el servicio existe en ese entorno

### Idea importante

Incluso confirmar la existencia y reachability de servicios de metadata ya puede ser muy valioso para un atacante.

---

## El worker o proceso que hace la salida es clave

No siempre la app web principal hace la request saliente.
A veces la hace:

- un worker
- un job
- un proceso de importación
- un servicio auxiliar
- un microservicio de integraciones

Eso importa porque el proceso que hace la salida puede tener:

- otra identidad
- más permisos
- otra reachability
- otra topología
- otro acceso a servicios de metadata o credenciales

### Regla sana

Cuando analices este impacto, preguntate siempre:
- “¿qué proceso exacto hace la request saliente y con qué identidad corre?”

---

## El entorno de ejecución real importa más que la teoría del código

En este tema, todavía más que en otros, el riesgo depende mucho del entorno real.

No alcanza con leer el código y concluir:
- “hay una URL configurable”

También importa saber:
- qué metadata endpoint existe
- qué identidad usa el runtime
- qué permisos tiene
- qué reachability hay
- qué mecanismos de plataforma están accesibles desde ese proceso

### Idea importante

SSRF contra cloud metadata es un punto donde aplicación e infraestructura se tocan de lleno.
No se puede analizar bien mirando solo una de las dos capas.

---

## El mismo feature puede tener impactos muy distintos según dónde corra

Una preview, un webhook o una descarga remota pueden parecer la misma feature en código.
Pero el impacto cambia muchísimo si corre en:

- un entorno local de desarrollo
- un worker sin permisos
- un runtime con identidad mínima
- un servicio de producción con permisos amplios
- un job administrativo con mucho acceso a la nube

### Idea útil

La severidad de SSRF no vive solo en la feature.
También vive en el contexto donde esa feature se ejecuta.

---

## Qué preguntas conviene hacer sobre este impacto

Cuando sospeches de SSRF en cloud o plataforma, conviene preguntar:

- ¿el proceso puede alcanzar metadata endpoints?
- ¿existen servicios internos de identidad del runtime?
- ¿qué credenciales o contexto podría obtener desde allí?
- ¿qué permisos tiene la identidad del workload?
- ¿qué procesos hacen las requests salientes?
- ¿qué features podrían usarlos como puente?
- ¿qué señales de error ya bastarían para confirmar que el servicio existe?
- ¿qué parte del riesgo se reduce con menor privilegio?
- ¿qué parte se reduce con mejor control de destinos?
- ¿qué parte del equipo nunca había metido la identidad de cloud dentro del impacto de SSRF?

### Regla sana

En este punto del análisis, la pregunta ya no es solo:
- “¿qué host puede tocar?”
sino también:
- “¿qué identidad de plataforma podría llegar a consultar o explotar desde allí?”

---

## Cómo reconocer este problema en una codebase Spring

En una app Spring, conviene sospechar especialmente cuando veas:

- features salientes flexibles
- previews, importaciones, callbacks o test connections
- workers con mucha reachability
- despliegues en cloud con identidad de workload
- procesos que heredan permisos de plataforma
- poca claridad sobre qué endpoints internos de metadata o identidad existen
- el equipo tratando SSRF como simple networking y no como potencial acceso a identidad del runtime

### Idea útil

Si la app puede hacer requests salientes y corre en un entorno cloud moderno, este impacto merece estar explícitamente sobre la mesa.

---

## Qué conviene revisar en una app Spring

Cuando revises cloud metadata y credenciales temporales como impacto de SSRF en una aplicación Spring, mirá especialmente:

- qué features pueden disparar requests salientes
- qué procesos las ejecutan
- qué identidad o cuenta de servicio usa cada proceso
- qué permisos reales tiene esa identidad
- si el entorno expone servicios de metadata o identidad accesibles desde la red del runtime
- si la feature podría alcanzar localhost, red privada o endpoints de plataforma
- qué mensajes o diferencias de error revelarían reachability
- qué impacto tendría consultar la identidad o las credenciales temporales de ese entorno
- qué tan alineado está el mínimo privilegio con la severidad de la superficie SSRF existente

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- más conciencia de que SSRF y cloud identity están conectados
- menor privilegio por workload
- mejor control de destinos salientes
- menos features genéricas con mucha reachability
- mejor entendimiento del entorno real donde corre cada proceso
- menos suposición de que “como no está publicado, no cuenta”
- más coordinación entre seguridad de aplicación y seguridad de plataforma

### Idea importante

La madurez acá está en ver que el impacto real de SSRF depende mucho de lo que la nube le presta a tu proceso por dentro.

---

## Señales de ruido

Estas señales merecen revisión rápida:

- nadie sabe si el proceso puede alcanzar metadata
- el workload tiene permisos amplios y nadie lo conecta con SSRF
- features salientes flexibles corriendo con identidades potentes
- el equipo cree que metadata es “solo info”
- la seguridad de ese endpoint depende solo de no estar expuesto públicamente
- poca claridad sobre qué workers o jobs heredan qué identidad
- SSRF se modela solo como lectura de hosts y no como acceso a credenciales del entorno

### Regla sana

Cuanto más poderosa es la identidad del runtime, más importante es tratar SSRF como posible camino hacia esa identidad.

---

## Checklist práctico

Cuando revises este tema, preguntate:

- ¿qué features salientes existen hoy?
- ¿qué procesos las ejecutan?
- ¿qué identidad usa cada uno?
- ¿qué permisos tiene esa identidad?
- ¿hay metadata endpoints o servicios de identidad accesibles desde su red?
- ¿qué daño causaría que una feature SSRF pudiera consultarlos?
- ¿qué señales de error ya revelarían demasiado?
- ¿qué parte del impacto bajarías con menor privilegio?
- ¿qué parte bajarías con mejor control de destinos?
- ¿qué revisarías primero para entender si el backend puede tocar la identidad del entorno donde corre?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Qué features hacen requests salientes?
2. ¿Qué proceso las ejecuta?
3. ¿Con qué identidad corre ese proceso?
4. ¿Esa identidad tiene permisos amplios o acotados?
5. ¿El entorno tiene metadata o servicios de identidad accesibles desde dentro?
6. ¿Qué impacto tendría que esa feature pudiera consultarlos?
7. ¿Qué cambio harías primero para reducir esa cadena de riesgo?

---

## Resumen

Cloud metadata y credenciales temporales son uno de los impactos más delicados de SSRF porque conectan una feature saliente vulnerable con algo mucho más profundo que una simple request interna: la identidad y los privilegios del entorno donde corre la aplicación.

Eso puede exponer:

- metadata operativa
- contexto de despliegue
- identidad del runtime
- credenciales temporales
- y, en el peor caso, acceso a otras capacidades de plataforma

En resumen:

> un backend más maduro no analiza SSRF pensando solo en si el atacante podrá leer una página o tocar un host interno, sino también en si podrá usar a la aplicación como puente hacia la identidad del entorno cloud donde corre.  
> Entiende que cuando una feature saliente se combina con metadata accesible y con un workload más privilegiado de la cuenta, el problema deja de ser solo de reachability y pasa a ser una posible vía de descubrimiento, de obtención de credenciales temporales o de explotación de permisos de plataforma que nunca estuvieron pensados para quedar al alcance de una simple URL configurable o de un test connection demasiado libre.

---

## Próximo tema

**Principio de mínimo privilegio para workers y servicios salientes**
