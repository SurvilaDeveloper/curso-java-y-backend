---
title: "Recorriendo las decisiones arquitectónicas y operativas que convirtieron a NovaMarket en un sistema completo"
description: "Síntesis arquitectónica final del curso práctico de NovaMarket. Recorrido por las decisiones técnicas y operativas que le dieron forma al sistema dentro de Kubernetes."
order: 147
module: "Módulo 13 · Cierre operativo de NovaMarket"
level: "intermedio"
draft: false
---

# Recorriendo las decisiones arquitectónicas y operativas que convirtieron a NovaMarket en un sistema completo

En la clase anterior dejamos claro algo importante:

- el cierre del curso no queda completo solo con validaciones operativas,
- y además NovaMarket ya tiene suficiente sustancia como proyecto para merecer una lectura arquitectónica final seria.

Ahora toca el paso concreto:

**recorrer las decisiones arquitectónicas y operativas que le dieron forma a NovaMarket como sistema completo.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mucho más claro qué arquitectura quedó realmente construida,
- visibles las decisiones que ordenan el sistema y no solo sus componentes sueltos,
- y más firme la idea de NovaMarket como proyecto completo y no solo como recorrido de clases.

Todavía no vamos a cerrar el curso con una conclusión final breve.  
La meta de hoy es mucho más concreta: **hacer visible la forma final del sistema que construimos**.

---

## Estado de partida

Partimos de un entorno donde ya tenemos:

- el flujo principal del negocio
- infraestructura base
- entrada madura
- configuración externalizada
- probes
- recursos
- escalado
- actualizaciones controladas
- troubleshooting
- observabilidad cuantitativa
- Prometheus
- Grafana
- dashboards básicos
- alerting inicial
- validación end-to-end
- y checklist final operativo

Eso significa que el proyecto ya no necesita otra gran pieza técnica para justificarse como sistema.

Ahora lo importante es recorrer con claridad las decisiones que le dieron esta forma.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- ordenar NovaMarket por bloques arquitectónicos,
- revisar qué decisiones técnicas fueron centrales para su construcción,
- conectar negocio, infraestructura y operación como parte de una misma historia,
- y dejar una síntesis bastante clara del sistema completo.

---

## Qué queremos resolver exactamente

Queremos pasar de este estado:

- “sé que el proyecto tiene muchos componentes y muchas mejoras operativas”

a un estado mucho más fuerte como este:

- “entiendo con claridad por qué esos componentes existen, cómo se relacionan y qué tipo de sistema terminan construyendo”

Ese cambio es uno de los más importantes de todo el cierre del curso.

---

## Paso 1 · El centro del sistema: el flujo principal del negocio

La primera decisión fuerte del proyecto fue no construir microservicios en el vacío, sino alrededor de un flujo central claro.

Eso le dio a NovaMarket una columna vertebral muy importante:

- no era una colección de servicios inventados,
- era un sistema organizado alrededor de una historia de negocio real.

Ese punto importa muchísimo porque explica por qué el proyecto se siente bastante más serio que una simple demo técnica.

---

## Paso 2 · La separación en servicios con propósito claro

Otra decisión importante fue que cada pieza importante del sistema tuviera un papel reconocible, por ejemplo:

- servicios de negocio
- servicios de infraestructura
- capa de entrada
- y piezas de soporte operativo

Eso ayudó a que la arquitectura no se sintiera arbitraria.

No se trató de dividir por dividir.  
Se trató de construir un sistema donde las responsabilidades fueran razonablemente legibles.

---

## Paso 3 · La infraestructura base como soporte real del sistema

Otra decisión muy fuerte fue no quedarnos solo en “microservicios de negocio”, sino construir también una base de infraestructura coherente con el tipo de arquitectura que queríamos enseñar.

Eso incluyó piezas como:

- configuración central
- discovery
- gateway
- mensajería
- y, más adelante, operación y observabilidad

Ese punto fue clave para que NovaMarket se sintiera como sistema y no solo como API fragmentada.

---

## Paso 4 · La entrada al sistema como capa seria

El proyecto también ganó muchísimo cuando dejamos de pensar el acceso como algo improvisado y lo concentramos mejor a través de:

- `api-gateway`
- y luego una capa más madura con `Ingress`

Eso le dio al sistema una forma de entrada mucho más clara y mucho más propia de un entorno real.

Esa decisión vale mucho porque conecta arquitectura de acceso con operación del cluster.

---

## Paso 5 · La configuración como parte de la arquitectura, no como detalle secundario

Otro punto importante fue dejar de tratar la configuración como algo caótico o embebido en todos lados.

La introducción de:

- `ConfigMap`
- `Secret`
- y una organización más clara del entorno

hizo que NovaMarket dejara de sentirse como una aplicación desplegada “a presión” y empezara a verse como un sistema que también sabe vivir configurado dentro de Kubernetes.

Eso es parte real de la arquitectura del proyecto.

---

## Paso 6 · La salud del sistema como parte del diseño

Las probes, la lectura del estado del cluster y el cuidado por la disponibilidad no fueron un agregado menor.

Fueron una decisión arquitectónica importante en sentido amplio, porque implicaron que el sistema ya no se pensara solo como código desplegado, sino como algo que también necesita ser:

- interpretable
- saludable
- y sostenible dentro del entorno

Ese salto fue una de las grandes marcas de madurez del proyecto.

---

## Paso 7 · Recursos, escalado y actualizaciones como parte de la forma final del sistema

Otra decisión muy importante fue que NovaMarket no quedara congelado en una lógica de:

- una sola réplica
- recursos indefinidos
- y cambios hechos de cualquier manera

La introducción de:

- `requests` y `limits`
- múltiples réplicas
- `HPA`
- y `rolling updates`

hizo que el sistema ya no se viera solo como “algo que corre”, sino como algo que empieza a comportarse y evolucionar con criterios mucho más serios.

Eso también forma parte del cierre arquitectónico.

---

## Paso 8 · La observabilidad como capa real del sistema

Este punto importa muchísimo.

NovaMarket no se quedó solo en negocio + infraestructura.  
También incorporó una capa de lectura del sistema que hoy incluye, al menos de forma inicial:

- troubleshooting básico
- observabilidad operativa
- métricas
- Prometheus
- Grafana
- dashboards
- y alerting simple

Eso le da al proyecto una profundidad enorme, porque lo acerca bastante a cómo se piensa un sistema real una vez que ya está vivo dentro del entorno.

---

## Paso 9 · La integración de todo eso como proyecto y no como lista de temas

A esta altura del curso ya conviene fijar algo muy importante:

el verdadero logro de NovaMarket no fue solo “tener muchos temas”.

El verdadero logro fue que esos temas terminaran formando un sistema coherente:

- con flujo central
- con infraestructura base
- con operación razonable
- y con una observación bastante madura

Ese encastre es una de las razones más fuertes por las que el proyecto termina sintiéndose tan completo.

---

## Paso 10 · Lo que NovaMarket representa al final del curso

Después de todo este recorrido, NovaMarket ya no queda como:

- una demo vacía
- ni una colección de YAMLs
- ni una suma de microservicios sueltos

Queda bastante más cerca de esto:

- un sistema práctico de microservicios
- con flujo principal real
- con entrada coherente
- con infraestructura reconocible
- con operación bastante madura
- y con una base real de observabilidad dentro de Kubernetes

Ese es probablemente el punto más importante de toda la síntesis.

---

## Qué estamos logrando con esta clase

Esta clase hace visible la forma final del sistema que construimos.

Ya no estamos solo diciendo que NovaMarket “quedó funcionando”.  
Ahora también estamos mostrando qué decisiones lo convirtieron en un sistema completo dentro de Kubernetes.

Eso es un cierre conceptual muy fuerte.

---

## Qué todavía no hicimos

Todavía no:

- cerramos el curso con una clase final breve de síntesis y proyección
- ni transformamos esta recapitulación en una conclusión explícita del recorrido completo

Eso viene en la próxima clase.

La meta de hoy es mucho más concreta:

**recorrer las decisiones que convirtieron a NovaMarket en un sistema completo.**

---

## Errores comunes en esta etapa

### 1. Mirar el proyecto solo como lista de herramientas
La idea es entender qué sistema construyen juntas.

### 2. Pensar que la arquitectura final se reduce a “hay varios servicios”
El valor está en las relaciones, decisiones y madurez operativa.

### 3. Reducir la síntesis a un resumen superficial
A esta altura ya vale la pena leer el sistema con más profundidad.

### 4. Separar demasiado negocio e infraestructura
En NovaMarket, ambos terminaron construyendo una sola historia técnica.

### 5. Cerrar el curso sin hacer visible la arquitectura final
Eso le quitaría mucha fuerza al proyecto completo.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener una visión bastante más clara de qué arquitectura terminó siendo NovaMarket dentro de Kubernetes y por qué el proyecto ya se siente como un sistema práctico bastante completo.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- el flujo principal sigue siendo el corazón del sistema,
- la infraestructura base se entiende como soporte real y no como adorno,
- la operación y la observabilidad forman parte del proyecto final,
- y sentís que NovaMarket ya puede leerse como una arquitectura completa y no solo como una suma de clases.

Si eso está bien, ya podemos pasar al cierre final del curso práctico.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a cerrar el curso práctico con una síntesis final de NovaMarket y una lectura clara de los próximos pasos posibles para seguir evolucionándolo.

Ese será el cierre definitivo del recorrido.

---

## Cierre

En esta clase recorrimos las decisiones arquitectónicas y operativas que convirtieron a NovaMarket en un sistema completo.

Con eso, el curso práctico deja de verse solo como un recorrido técnico y empieza a cerrarse también como una arquitectura concreta, entendible y bastante madura dentro de Kubernetes.
