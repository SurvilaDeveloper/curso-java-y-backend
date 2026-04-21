---
title: "Emitiendo las primeras trazas reales desde gateway y servicios hacia Zipkin en NovaMarket"
description: "Siguiente paso práctico del módulo 12. Emisión de una primera capa de trazas reales desde gateway y servicios hacia Zipkin para observar recorridos distribuidos concretos."
order: 134
module: "Módulo 12 · Observabilidad"
level: "intermedio"
draft: false
---

# Emitiendo las primeras trazas reales desde gateway y servicios hacia Zipkin en NovaMarket

En la clase anterior dejamos algo bastante claro:

- Zipkin ya forma parte del entorno,
- la trazabilidad distribuida ya dejó de ser una idea futura,
- y el siguiente paso lógico ya no es seguir hablando de observabilidad más rica en abstracto, sino empezar a hacer que gateway y servicios emitan trazas reales.

Ahora toca el paso concreto:

**emitir las primeras trazas reales desde gateway y servicios hacia Zipkin en NovaMarket.**

Ese es el objetivo de esta clase.

Porque una cosa es tener a Zipkin vivo dentro del entorno.

Y otra bastante distinta es conseguir que:

- gateway,
- `order-service`,
- y `inventory-service`

empiecen a enviar información suficiente como para reconstruir un recorrido distribuido real.

Ese es exactamente el primer gran valor práctico que vamos a construir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mucho más clara la relación entre servicios instrumentados y trazas distribuidas,
- visible una primera base real de emisión de trazas hacia Zipkin,
- mejorada la capacidad de NovaMarket para observar recorridos entre piezas del sistema,
- y el proyecto mejor preparado para seguir consolidando observabilidad después.

La meta de hoy no es todavía agotar todo el potencial del tracing distribuido.  
La meta es mucho más concreta: **hacer que NovaMarket deje de tener solo infraestructura de trazas y empiece a producir recorridos reales observables**.

---

## Estado de partida

Partimos de un sistema donde ya:

- Zipkin forma parte del entorno,
- gateway y servicios ya manejan correlation id y logs correlacionados,
- y el módulo ya dejó claro que ahora conviene pasar de señales básicas a trazabilidad distribuida más rica.

Eso significa que el problema ya no es cómo levantar la infraestructura.  
Ahora la pregunta útil es otra:

- **cómo hacemos que las piezas reales del sistema emitan trazas hacia Zipkin**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- preparar gateway y servicios para emitir trazas,
- configurar una salida razonable hacia Zipkin,
- ejecutar una request real que atraviese varias piezas,
- y dejar visible una primera cadena distribuida dentro del sistema.

---

## Paso 1 · Entender qué necesitamos en las aplicaciones

A esta altura del curso, la idea central es muy simple:

- gateway y servicios necesitan una instrumentación básica que produzca spans
- y una configuración que los envíe a Zipkin

No hace falta todavía una política gigantesca de sampling o una personalización muy avanzada.

La meta de hoy es mucho más concreta:

- que las piezas principales del laboratorio ya produzcan trazas reales.

---

## Paso 2 · Preparar gateway y servicios para tracing

Según la línea tecnológica que estés usando en el proyecto, una base razonable suele apoyarse en los componentes de observabilidad del ecosistema Spring.

Lo importante para esta etapa es fijar esta idea:

- no basta con tener Zipkin
- hace falta que las aplicaciones participen activamente emitiendo spans de sus requests y llamadas salientes

Ese matiz importa muchísimo.

---

## Paso 3 · Configurar el destino de las trazas

A esta altura del bloque, una configuración conceptual razonable suele verse como:

```yaml
management:
  tracing:
    sampling:
      probability: 1.0
  zipkin:
    tracing:
      endpoint: http://zipkin:9411/api/v2/spans
```

La forma exacta puede variar según el stack concreto que estés usando, pero la idea central es esta:

- las aplicaciones necesitan saber a dónde enviar la información de trazas.

Ese punto es uno de los más importantes de toda la clase.

---

## Paso 4 · Entender por qué conviene empezar con sampling alto

Este punto vale muchísimo.

Para una primera etapa didáctica y de laboratorio, suele tener mucho sentido una probabilidad alta de muestreo.

¿Por qué?

Porque queremos ver trazas reales de forma clara y consistente mientras aprendemos el bloque.

No hace falta todavía optimizar costos o volumen de producción.

La meta es mucho más concreta:

- ver el recorrido distribuido aparecer con claridad en Zipkin.

Ese criterio es muy sano para el curso práctico.

---

## Paso 5 · Ejecutar una request real del laboratorio

Ahora conviene volver a usar el mismo tipo de recorrido que ya venimos siguiendo:

- request entra por gateway
- llega a `order-service`
- y desde ahí toca `inventory-service`

Ese escenario vuelve a ser ideal porque ya lo conocemos y ya sabemos qué piezas participan.

La idea es observar cómo esa operación deja de existir solo en logs y empieza a materializarse como una traza distribuida real.

---

## Paso 6 · Entrar a Zipkin y buscar la traza

Ahora abrí Zipkin y buscá las trazas recientes.

Lo importante es observar si ya aparece una operación donde:

- se vea el paso por gateway,
- luego por `order-service`,
- y después por `inventory-service`

No hace falta todavía interpretar todos los spans con máxima profundidad.

La meta de hoy es algo más concreta:

- **ver que el sistema ya emite recorridos distribuidos reales**

Ese momento vale muchísimo.

---

## Paso 7 · Entender qué acabamos de ganar

Este punto importa muchísimo.

Hasta ahora, una request distribuida podía entenderse mejor con ids y logs.

Ahora, en cambio, además ya puede:

- aparecer como un recorrido estructurado,
- con tramos,
- relaciones entre servicios,
- y tiempos relativos.

Ese salto cambia muchísimo la utilidad real del bloque de observabilidad.

---

## Paso 8 · Pensar por qué esto mejora muchísimo el diagnóstico

A esta altura del módulo, conviene hacer una lectura muy concreta:

si algo tarda o falla en un recorrido distribuido, ya no dependemos solo de buscar mensajes y unirlos a mano.

Ahora el sistema empieza a ofrecer una lectura mucho más estructurada del camino real de la request.

Eso vale muchísimo porque vuelve mucho más operable al proyecto.

---

## Paso 9 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya tiene observabilidad completa”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene una primera capa real de trazas distribuidas visibles en Zipkin desde gateway y servicios.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase emite las primeras trazas reales desde gateway y servicios hacia Zipkin en NovaMarket.

Ya no estamos solo moviendo ids o mejorando mensajes.  
Ahora también estamos haciendo que una misma operación deje una huella distribuida mucho más rica, mucho más estructurada y mucho más útil para entender el comportamiento del sistema.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- consolidamos todavía este subbloque con un checkpoint fuerte,
- ni entramos aún en lectura más profunda de spans, latencias o cuellos de botella.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**hacer que NovaMarket deje de tener solo infraestructura de tracing y empiece a emitir trazas reales visibles en Zipkin.**

---

## Errores comunes en esta etapa

### 1. Tener Zipkin levantado pero no instrumentar las aplicaciones
Entonces nunca aparecen recorridos reales.

### 2. Bajar demasiado el sampling en esta etapa
Para el laboratorio conviene ver claramente lo que pasa.

### 3. Probar una request trivial que no atraviese varias piezas
El valor del tracing distribuido aparece justamente cuando la operación cruza varios servicios.

### 4. Querer interpretar todo en profundidad en la misma clase
Primero conviene confirmar que las trazas existen y representan el recorrido.

### 5. Creer que esto ya cierra todo el bloque
Todavía puede profundizarse bastante más.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- gateway y servicios ya emiten trazas hacia Zipkin,
- una request distribuida ya deja un recorrido real visible,
- y NovaMarket ya dio un primer paso serio hacia una observabilidad distribuida mucho más rica y mucho más operable.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- Zipkin ya recibe trazas,
- ves el paso de una misma request por varias piezas,
- entendés qué valor agrega esta lectura estructurada,
- y sentís que NovaMarket ya ganó una nueva capa concreta de madurez desde trazabilidad distribuida real.

Si eso está bien, ya podemos pasar al siguiente tema y consolidar esta nueva capa del módulo 12.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta primera capa de trazas distribuidas reales antes de decidir si seguimos profundizando observabilidad o pasamos al siguiente gran bloque del roadmap rehecho.

---

## Cierre

En esta clase emitimos las primeras trazas reales desde gateway y servicios hacia Zipkin en NovaMarket.

Con eso, el proyecto deja de observar sus requests distribuidas solo con ids y logs mejorados y empieza a sostener una forma mucho más rica, mucho más estructurada y mucho más madura de ver cómo una operación atraviesa el sistema.
