---
title: "Resolver DNS una vez no siempre alcanza"
description: "Por qué en SSRF no siempre alcanza con resolver DNS una sola vez en una aplicación Java con Spring Boot. Cómo los cambios entre validación y uso, reintentos, redirects o reutilización de destinos pueden romper la confianza inicial sobre el host y llevar al backend a conectarse a un destino distinto del esperado."
order: 135
module: "Consumo saliente, SSRF y conexiones externas"
level: "base"
draft: false
---

# Resolver DNS una vez no siempre alcanza

## Objetivo del tema

Entender por qué, al analizar **SSRF** en una aplicación Java + Spring Boot, **resolver DNS una sola vez no siempre alcanza** para considerar seguro un destino saliente.

La idea de este tema es profundizar una intuición que ya apareció en los últimos temas:

- una cosa es el host que validás
- otra es la IP que resolvés
- y otra, todavía más importante, es el destino al que finalmente termina conectando el backend cuando la request se ejecuta de verdad

Muchos equipos, cuando empiezan a mejorar una defensa frente a SSRF, llegan a una solución intermedia como esta:

- “resolvemos el hostname”
- “vemos a qué IP apunta”
- “si no es privada, seguimos”
- “entonces ya está”

Eso puede ser una mejora real frente a validar solo el string.
Pero todavía puede quedarse corto.

En resumen:

> resolver DNS una vez mejora el análisis,  
> pero no garantiza por sí solo que la conexión real y todo el recorrido posterior sigan apuntando al mismo destino confiable.

---

## Idea clave

Resolver DNS una vez significa, en términos simples:

- tomar un hostname
- consultar a qué IP resuelve en ese momento
- usar ese resultado para decidir si el destino parece aceptable o no

Eso puede ayudar mucho a detectar cosas como:

- localhost disfrazado
- IPs privadas detrás de un nombre
- destinos que “se ven externos” pero no lo son

Pero la idea central de este tema es esta:

> la resolución DNS es una fotografía de un momento, no una garantía permanente sobre todo el flujo de conexión.

Porque después de esa foto pueden pasar cosas como:

- cambia la resolución
- la conexión real ocurre más tarde
- la librería vuelve a resolver
- hay reintentos
- hay redirects
- el destino persistido se usa en otro momento
- otro componente del stack interpreta o resuelve de nuevo

### Idea importante

La defensa madura no pregunta solo:
- “¿a qué resolvía en el momento del chequeo?”

También pregunta:
- “¿cómo me aseguro de que el destino efectivo siga siendo coherente con lo que aprobé?”

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- creer que resolver DNS una vez ya elimina gran parte del riesgo
- asumir que el chequeo y la conexión siempre usan exactamente el mismo resultado
- no considerar que el destino puede cambiar entre validación y uso
- confiar demasiado en una resolución hecha al guardar y no al conectar
- ignorar reintentos, redirects o nuevas resoluciones del cliente HTTP
- tratar DNS como una validación definitiva y no como una señal contextual
- no modelar que un hostname puede cambiar de significado con el tiempo

Es decir:

> el problema no es resolver DNS.  
> El problema es tratar esa resolución puntual como si fuese una verdad estable para todo el flujo saliente.

---

## Error mental clásico

Un error muy común es este:

### “Ya resolvimos el dominio y apuntaba a una IP permitida, así que estamos cubiertos”

Eso es demasiado optimista.

Porque todavía faltan preguntas como:

- ¿cuándo se hizo esa resolución?
- ¿cuándo se abrió la conexión real?
- ¿la misma librería volvió a resolver después?
- ¿hubo redirect a otro host?
- ¿el valor quedó persistido y se usó horas o días después?
- ¿el entorno de red puede cambiar lo que se resuelve?
- ¿el sistema toma decisiones distintas en retries o fallbacks?

### Idea importante

DNS puede servir para reducir incertidumbre.
Pero no convierte automáticamente un flujo complejo en un flujo controlado.

---

## Resolver una vez mejora, pero no congela el destino

Esta es una intuición muy útil para quedarte.

Resolver una vez puede darte más información que mirar solo el hostname textual.
Eso está bien.

Pero no deberías comportarte como si hubieras “congelado” el destino para siempre, a menos que realmente lo hayas hecho de forma explícita y segura en el diseño del flujo.

### Idea importante

Entre:
- “lo resolví”
y
- “sé con certeza a dónde terminó conectando el backend”
puede haber bastante distancia.

---

## El problema del tiempo vuelve a aparecer

Igual que en el tema anterior, acá vuelve una diferencia muy importante:

- **tiempo del chequeo**
- **tiempo del uso**

Si resolvés ahora pero conectás después, ya existe una ventana donde el significado del hostname puede cambiar o el flujo puede desviarse.

### Ejemplos conceptuales

- validás al guardar una integración
- conectás horas después
- resolvés en una capa
- el cliente HTTP resuelve otra vez en otra capa
- aprobás antes del primer hop
- luego seguís redirects o retries

### Idea útil

Resolver una vez ayuda menos cuando la conexión real ocurre en otro momento, por otra ruta o con otra semántica.

---

## DNS como instantánea, no como contrato estable

Otra forma de decir lo mismo:

- la resolución DNS te informa algo sobre **este momento**
- no necesariamente sobre **todos los momentos futuros**
- ni sobre **todos los pasos del flujo**
- ni sobre **cómo otras capas del stack van a usar ese hostname**

### Regla sana

No confundas:
- “en este instante resolvía bien”
con
- “el destino saliente quedó suficientemente controlado”.

---

## Qué pasa si el valor se persiste

Este es uno de los casos más importantes en apps reales.

Supongamos que una feature permite guardar algo como:

- webhook URL
- callback host
- endpoint de integración
- dominio por tenant
- URL base de proveedor

La app puede validar y resolver DNS en el momento del alta.
Pero luego ese valor queda persistido.

### Problema

Días después, cuando se use:
- puede resolverse a otra cosa
- puede redirigir distinto
- puede haber cambiado ownership del dominio
- puede cambiar la IP o el significado operativo del destino

### Idea importante

Validar y resolver al guardar no equivale a validar y resolver de forma suficiente al usar.

---

## Reintentos y clientes HTTP también complican la historia

No todo flujo saliente es una sola conexión lineal.

A veces el cliente HTTP o el componente de integración puede:

- reintentar
- abrir nueva conexión
- volver a resolver
- intentar otra IP
- cambiar estrategia según timeout o error

### Idea útil

Aunque tu validación haya ocurrido una vez, el comportamiento real del cliente puede no limitarse a ese único resultado inicial.

### Regla sana

Cuanto más comportamiento automático tenga el cliente saliente, menos prudente es confiar en una única resolución previa como garantía total.

---

## Redirects vuelven a importar

Esto conecta directamente con el tema anterior.

Aunque hayas resuelto y validado correctamente la IP del primer host, si luego seguís redirects:

- volvés a entrar en el problema del destino final
- quizá con otro host
- otra resolución
- otra red
- otro esquema

### Idea importante

Resolver bien el primer hostname no salva un flujo que después acepta irse a otra parte sin revalidar.

---

## Nombre aprobado, IP aprobada… pero ¿quién conecta al final?

Otra pregunta importante es:
- ¿qué parte del stack usa realmente ese resultado?

Porque una cosa es tu código de validación.
Y otra puede ser:

- la librería HTTP final
- un proxy intermedio
- un cliente reutilizable
- una capa de infraestructura
- un servicio auxiliar

### Problema

Podrías creer que aprobaste cierta IP, pero el componente que termina conectando puede usar otra resolución, otro momento o otra ruta.

### Idea útil

La defensa fuerte no se queda en la validación preliminar.
Se preocupa también por qué componente realiza la conexión efectiva y con qué información.

---

## Esto también debilita allowlists ingenuas

Las allowlists de dominio o hostname se vuelven más débiles si el equipo cree que resolver una vez ya cierra toda la historia.

Porque todavía queda por resolver:

- cómo se usa esa resolución
- si se vuelve a resolver
- si el destino cambia con el tiempo
- si el flujo sigue siendo el mismo en cada uso

### Regla sana

Una allowlist por nombre mejora mucho más cuando está acompañada por controles sobre destino efectivo y momento de conexión.

---

## Qué pasa en entornos dinámicos

En infraestructuras modernas, la resolución puede ser especialmente dinámica por cosas como:

- service discovery
- rotación de IPs
- balanceo
- cambios de tenant
- cloud infra
- DNS interno mutable
- despliegues efímeros
- migraciones

### Idea importante

Cuanto más dinámico es el entorno, menos sentido tiene tratar una resolución puntual como garantía suficiente por sí sola.

---

## Resolver “antes” no siempre coincide con resolver “como lo hará el cliente”

Esto también merece su propio punto.

A veces el equipo hace una resolución usando una librería o helper propio y luego asume que el cliente real se comportará igual.

Pero podría no coincidir exactamente en:

- cuándo resuelve
- qué cachea
- qué reintenta
- qué familia de IP prioriza
- cómo maneja timeouts
- si resuelve otra vez antes de conectar

### Idea útil

No alcanza con que “nosotros” resolvamos bien si el componente que termina conectando puede abrir otra historia.

---

## El diseño sano no depende de una única verificación suelta

Todo este tema empuja a una idea general muy valiosa:

> cuanto más crítica es la confianza sobre el destino saliente, menos prudente es depositarla en una única verificación aislada que ocurre temprano y luego no vuelve a confrontarse con el uso real.

### Regla sana

Mejor pensar en:
- destino permitido
- control del recorrido
- control de redirects
- validación cerca del uso
- reducción de variabilidad

que en:
- “resuelvo una vez y listo”

---

## No todo caso necesita paranoia extrema, pero sí claridad

Tampoco se trata de concluir que toda resolución DNS es inútil.
No lo es.

Resolver y mirar IP final puede ser muy valioso.
Solo que no debería sobreinterpretarse.

### Idea importante

La postura sana no es:
- “DNS no sirve”

La postura sana es:
- “DNS sirve, pero no siempre basta por sí solo para garantizar el destino efectivo de todo el flujo”.

---

## Qué preguntas conviene hacer en revisión

Cuando revises una feature saliente, conviene preguntar:

- ¿cuándo se resuelve el hostname?
- ¿cuándo se conecta realmente?
- ¿es el mismo componente el que resuelve y conecta?
- ¿hay retries?
- ¿hay redirects?
- ¿el destino se guarda y se usa después?
- ¿se resuelve otra vez en otro momento?
- ¿el entorno es dinámico?
- ¿la validación se apoya demasiado en una única instantánea DNS?
- ¿qué garantiza que la conexión efectiva coincida con lo que aprobamos?

### Regla sana

La pregunta clave es:
- “¿el destino que aprobé es realmente el mismo destino que voy a usar cuando más importa?”

---

## Cómo reconocer este problema en una codebase Spring

En una app Spring, conviene sospechar especialmente cuando veas:

- validación de host o IP al guardar una configuración
- uso posterior del mismo destino horas o días después
- callbacks persistidos
- integraciones por tenant
- clients HTTP reutilizables con comportamiento automático
- follow redirects
- reintentos o fallback
- helpers de resolución separados de la ejecución real de la request
- mucha confianza expresada con frases como “ya lo resolvimos y daba bien”

### Idea útil

Cuando la validación vive lejos del uso real, siempre conviene desconfiar un poco más.

---

## Qué conviene revisar en una app Spring

Cuando revises por qué resolver DNS una vez no siempre alcanza en una aplicación Spring, mirá especialmente:

- dónde se resuelven hosts o dominios
- si esa resolución ocurre al guardar o al usar
- qué componente realiza la conexión efectiva
- si hay reintentos o follow redirects
- si el destino queda persistido
- si la infraestructura es dinámica
- si la validación está demasiado desacoplada de la request real
- si la defensa depende de una sola instantánea DNS
- cuánto cambia el riesgo si el hostname resuelve distinto más tarde

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- menos separación entre validación y uso real
- menos confianza ciega en una única resolución temprana
- más control del destino final efectivo
- mejor entendimiento de qué componente conecta de verdad
- menos flows persistidos sin reconsiderar el destino
- mayor conciencia del tiempo como factor de riesgo en SSRF

---

## Señales de ruido

Estas señales merecen revisión rápida:

- “ya resolvía bien cuando lo guardamos”
- nadie sabe si la librería vuelve a resolver
- callbacks o integraciones viven mucho tiempo sin revalidación adecuada
- follow redirects combinado con validación temprana
- demasiada confianza en el hostname aprobado una vez
- la defensa depende de una fotografía DNS y no del uso real
- el equipo no puede explicar la relación entre check y connect en ese flujo

---

## Checklist práctico

Cuando revises este tema, preguntate:

- ¿cuándo validamos el host?
- ¿cuándo resolvemos DNS?
- ¿cuándo se conecta realmente el backend?
- ¿es el mismo momento o no?
- ¿hay persistencia entre check y use?
- ¿hay redirects o retries?
- ¿qué componente conecta finalmente?
- ¿la infraestructura puede cambiar la resolución con el tiempo?
- ¿qué parte del diseño depende demasiado de una sola instantánea?
- ¿qué flujo revisarías primero para acercar más la validación al uso real?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Qué destinos salientes se guardan y se usan más tarde?
2. ¿Dónde se resuelven hoy?
3. ¿Dónde se conectan de verdad?
4. ¿Hay follow redirects o retries?
5. ¿Qué parte del flujo confía demasiado en una resolución temprana?
6. ¿Qué hostname aprobado hoy podría cambiar de significado mañana?
7. ¿Qué cambio harías primero para acercar más el control del destino al momento real de la conexión?

---

## Resumen

Resolver DNS una vez puede ser una mejora útil frente a validar solo el string del hostname.
Pero no siempre alcanza porque la conexión efectiva puede depender de cosas como:

- tiempo entre check y use
- persistencia del destino
- reintentos
- redirects
- nuevas resoluciones
- comportamiento real del cliente HTTP
- dinamismo del entorno

En resumen:

> un backend más maduro no toma una única resolución DNS temprana como si fuera una garantía definitiva del destino saliente.  
> La usa como una señal valiosa, pero entiende que en SSRF el control real del riesgo depende de cuánto coinciden el chequeo y el uso efectivo, de si el recorrido cambia después y de si la request termina conectando, en el momento que importa, al mismo lugar que el sistema creyó haber aprobado cuando todavía todo parecía tranquilo.

---

## Próximo tema

**Normalización y parseo de URLs antes de validar**
