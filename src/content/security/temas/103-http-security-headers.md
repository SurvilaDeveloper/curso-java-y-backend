---
title: "HTTP security headers"
description: "Qué son los HTTP security headers en una aplicación Java con Spring Boot, qué problemas ayudan a reducir y por qué no conviene tratarlos como una checklist cosmética. Cómo pensar headers de seguridad como señales que endurecen la relación entre backend, navegador y superficie web expuesta."
order: 103
module: "HTTP, headers y superficie del navegador"
level: "base"
draft: false
---

# HTTP security headers

## Objetivo del tema

Entender qué son los **HTTP security headers** en una aplicación Java + Spring Boot y por qué vale la pena pensarlos como parte real de la postura de seguridad del backend.

La idea es revisar una confusión muy común:

- “eso es algo del frontend”
- “son headers que se ponen por compliance”
- “si la app ya está segura, eso no importa demasiado”
- “con poner un par de cabeceras ya cumplimos”

Esa mirada se queda corta.

Porque estos headers no arreglan una autorización rota, ni una validación floja, ni una mala gestión de secretos.
Pero sí ayudan a controlar mejor cómo:

- el navegador interpreta respuestas
- ciertas funciones del cliente quedan habilitadas o restringidas
- se reduce superficie frente a ataques web clásicos
- se limitan comportamientos inseguros por defecto
- se endurece la exposición de la app hacia el lado del navegador

En resumen:

> los HTTP security headers no reemplazan diseño seguro.  
> Pero sí pueden endurecer bastante la frontera entre tu backend y el entorno del navegador.

---

## Idea clave

Los security headers son **instrucciones que el backend envía al cliente** para influir en cómo el navegador debe tratar la respuesta.

Eso puede afectar cosas como:

- si el contenido puede embebirse
- si debe respetarse HTTPS estricto
- cómo se interpretan ciertos tipos de contenido
- qué recursos externos puede cargar la página
- cuánta información de origen se comparte
- qué capacidades del navegador quedan permitidas o restringidas

La idea central es esta:

> un header de seguridad no “arregla” el contenido.  
> Pero sí puede reducir qué tan fácil resulta abusar de ese contenido o del contexto en el que se entrega.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- tratar los headers de seguridad como decoración
- asumir que “si usa HTTPS, ya no hace falta mirar nada más”
- olvidar que ciertos comportamientos inseguros del navegador siguen activos si no se indican restricciones
- habilitar por defecto más superficie de la necesaria
- copiar headers sin entender qué protegen realmente
- confiar en defaults del servidor o del framework sin revisarlos
- dejar respuestas sensibles sin señales mínimas de endurecimiento
- aplicar headers de forma inconsistente según endpoint o entorno
- pensar headers aislados sin conectarlos con el tipo real de app que estás exponiendo

Es decir:

> el problema no es no tener todos los headers posibles.  
> El problema es no entender qué superficie del lado del cliente estás dejando abierta por omisión.

---

## Error mental clásico

Un error muy común es este:

### “Los security headers son una checklist cosmética”

Eso es injusto e incompleto.

Es cierto que a veces se usan solo para:

- pasar un scanner
- mejorar un reporte
- “quedar verdes” en una auditoría automática

Pero eso no agota su valor real.

### Porque bien pensados pueden ayudar a reducir
- clickjacking
- interpretaciones ambiguas de contenido
- navegación insegura hacia HTTP
- fuga de contexto vía referrer
- abuso de capacidades del navegador
- impacto de ciertos XSS o cargas inesperadas
- exposición de documentos o páginas en contextos no deseados

### Idea importante

No son maquillaje.
Pero tampoco son una varita mágica.
Son una capa de endurecimiento.

---

## No todos los headers importan igual para todas las apps

Esto conviene dejarlo claro desde el principio.

No es lo mismo una app que:

- solo expone una API JSON
- sirve SPA o páginas HTML
- mezcla panel admin y API
- entrega archivos descargables
- usa sesiones y navegador tradicional
- vive detrás de proxies o gateways
- embebe contenido o integra iframes
- corre en varios subdominios

### Idea útil

La discusión sobre security headers tiene más sentido cuando parte del contexto real de la aplicación y no de una lista genérica copiada.

---

## Qué protegen en términos generales

Sin entrar todavía en cada header puntual, podés pensar los HTTP security headers como una forma de endurecer algunas categorías de comportamiento:

### 1. Transporte
Por ejemplo, empujar al navegador a usar HTTPS de forma más estricta.

### 2. Interpretación de contenido
Evitar que el navegador “adivine” tipos de archivo o contenido de forma peligrosa.

### 3. Embebido y framing
Reducir que tu contenido se cargue en contextos no deseados.

### 4. Política de recursos
Acotar desde dónde se pueden cargar scripts, estilos, imágenes u otros recursos.

### 5. Privacidad y contexto
Limitar cuánto contexto del origen o de la navegación se revela.

### 6. Capacidades del navegador
Restringir APIs o features que no deberían estar habilitadas para ciertos contextos.

### Idea importante

Pensarlos por categoría ayuda más que memorizarlos como siglas aisladas.

---

## No corrigen una app rota

Este punto merece repetirse.

Podés tener todos los headers “bonitos” y aun así una app insegura si sigue teniendo:

- XSS
- IDOR
- mala autorización
- exposición en responses
- secretos mal manejados
- CORS flojo
- endpoints internos abiertos
- archivos privados mal servidos

### Regla sana

Los headers de seguridad ayudan a endurecer.
No deben usarse como sustituto de:

- diseño de API
- validación
- autorización
- gestión de sesiones
- configuración segura
- observabilidad prudente

---

## Pero tampoco conviene subestimarlos

A veces aparece la reacción opuesta:

- “como no arreglan todo, no importan mucho”

Eso también es mala idea.

Porque hay protecciones que no deberían quedar libradas a defaults o a buena suerte del navegador.

### Idea útil

Entre “resuelven todo” y “no sirven” hay una posición mucho más sensata:

> son una capa importante de reducción de superficie, especialmente en apps web y paneles servidos por backend.

---

## Headers como contrato con el navegador

Una forma útil de pensarlo es esta:

cuando el backend responde, no solo manda datos.
También puede mandar reglas sobre **cómo espera que ese contenido sea tratado**.

Por ejemplo:

- si puede o no puede embeberse
- si debe respetarse HTTPS
- si el tipo debe interpretarse literalmente
- si ciertos recursos externos están permitidos
- si capacidades del navegador deben quedar restringidas

### Idea importante

Eso convierte a los headers en una parte del contrato de seguridad de la respuesta.
No son puro detalle de infraestructura.

---

## Cuidado con copiar y pegar configuraciones

Este es uno de los problemas más comunes.

Mucha gente copia una receta de headers desde:

- blog
- Stack Overflow
- plantilla vieja
- config de otro proyecto
- consejo genérico del scanner

y la deja tal cual.

### Problema

Eso puede llevar a dos extremos:

- headers demasiado débiles que no hacen casi nada
- headers demasiado rígidos que rompen flujos legítimos
- combinación incoherente con el tipo de app
- falsa sensación de “ya cubierto”

### Regla sana

Conviene entender qué superficie intenta endurecer cada header antes de decidir si corresponde, con qué valor y en qué endpoints.

---

## API pura vs app web servida por navegador

Esta distinción ayuda mucho.

### Si tu backend es mayormente una API JSON
algunos headers siguen siendo útiles, pero otros tienen menos protagonismo.

### Si tu backend sirve HTML, paneles o vistas
la conversación se vuelve mucho más relevante porque el navegador está interpretando contenido activo, cargando recursos y aplicando políticas web completas.

### Idea útil

No todos los headers tienen el mismo peso en un endpoint JSON que en una página HTML o en un backoffice con sesión y scripts.

---

## Endurecer por tipo de respuesta

También conviene pensar que no toda respuesta necesita el mismo conjunto de headers con la misma intención.

No es lo mismo una respuesta que sirve:

- HTML
- JSON
- un archivo descargable
- una imagen pública
- un endpoint de login
- una pantalla admin
- un recurso embebible
- una respuesta de error

### Idea importante

Los headers deberían responder al tipo de superficie expuesta, no solo a una plantilla universal ciega.

---

## Qué suele mirar un atacante o un scanner

Los scanners suelen buscar:

- presencia o ausencia de ciertos headers
- combinaciones débiles
- defaults inseguros
- políticas faltantes

Un atacante, en cambio, puede usar esa información para entender mejor:

- qué controles del lado del navegador existen
- si hay oportunidades de framing
- si ciertas cargas están muy abiertas
- si la política de transporte es laxa
- si el navegador podría interpretar contenido de forma peligrosa
- si hay huecos útiles para explotación web

### Idea útil

Aunque el scanner te ayude a detectar faltantes, el criterio real debería partir del riesgo del sistema, no solo del reporte automático.

---

## Qué headers suelen entrar en esta conversación

Sin profundizar todavía uno por uno, normalmente este bloque incluye cosas como:

- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `Content-Security-Policy`
- `Referrer-Policy`
- `X-Frame-Options`
- `Permissions-Policy`

### Idea importante

No hace falta memorizarlos todos ya.
Lo importante en este tema es entender que forman una familia de controles del lado HTTP/navegador que endurecen superficies distintas.

En los siguientes temas iremos bajando cada uno con más detalle.

---

## Seguridad “del lado del navegador” no significa que no sea asunto del backend

Esta es otra confusión frecuente.

Porque quien envía estos headers suele ser precisamente:

- el backend
- o la infraestructura que responde por él

Entonces, aunque el efecto final ocurra en el navegador, la decisión de seguridad sigue siendo parte del diseño del backend y del despliegue.

### Regla sana

No delegues estos temas al vacío entre frontend e infraestructura.
Alguien del lado del backend tiene que entender qué se está exponiendo y con qué políticas.

---

## Headers y proxies/gateways

En muchas arquitecturas, los headers pueden configurarse en:

- la app Spring
- el reverse proxy
- el ingress
- el gateway
- un CDN
- o combinaciones de varias capas

Eso tiene ventajas y riesgos.

### Ventajas
- centralizar
- estandarizar
- evitar repetición

### Riesgos
- aplicar políticas sin entender el caso de uso
- inconsistencias entre capas
- creer que la app “ya lo hace” cuando en realidad depende del proxy
- roturas difíciles de rastrear

### Idea útil

No alcanza con saber que “algún lugar” pone el header.
Conviene saber dónde, por qué y con qué alcance.

---

## Seguridad por defecto vs excepciones justificadas

Una práctica sana suele ser:

- tener un baseline razonable
- y hacer excepciones cuando de verdad un flujo lo necesita

### No al revés
- dejar casi todo abierto
- y endurecer solo algunos endpoints “importantes”

### Porque eso suele producir
- inconsistencias
- huecos olvidados
- superficies desalineadas
- más dificultad para revisar

### Regla sana

Mejor una base prudente y pocas excepciones explícitas que una apertura general con endurecimientos ad hoc.

---

## Si rompés la app con un header, el problema no es “el header”

A veces un equipo prueba endurecer algo y rompe:

- una integración
- un iframe legítimo
- una carga de recursos
- un script inline
- una funcionalidad antigua

Y la conclusión apresurada es:

- “estos headers molestan”
- “mejor no ponerlos”

Eso suele ser una lectura superficial.

### Muchas veces el problema real es que
- la app dependía de defaults inseguros
- el frontend estaba demasiado laxo
- se cargaban recursos de forma poco controlada
- la superficie ya venía mal delimitada

### Idea importante

Un header que “molesta” a veces está señalando justo una deuda que conviene entender, no simplemente desactivar.

---

## Qué conviene revisar en una app Spring

Cuando revises HTTP security headers en una aplicación Spring, mirá especialmente:

- qué tipo de contenido sirve la app
- si hay HTML o paneles, no solo JSON
- qué headers se envían realmente hoy
- si los pone Spring, el proxy o ambos
- qué respuestas más críticas están sin endurecer
- si hay inconsistencias entre entornos
- si se copió una política sin entenderla
- si el equipo sabe por qué existe cada header y qué problema intenta reducir
- si ciertos endpoints deberían diferenciarse por tipo de superficie
- si la ausencia o debilidad del header deja al navegador con comportamientos demasiado abiertos

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- conciencia clara de que los headers son parte de la superficie web
- baseline razonable de endurecimiento
- diferenciación entre API pura y contenido HTML o admin
- menos confianza en defaults del navegador
- políticas entendidas, no solo copiadas
- mejor trazabilidad de qué capa pone qué header
- menos excepciones abiertas “por costumbre”
- menor brecha entre observación del scanner y entendimiento real del riesgo

---

## Señales de ruido

Estas señales merecen revisión rápida:

- no saber qué headers salen hoy
- copiar recetas enteras sin entenderlas
- asumir que “es cosa del frontend”
- depender de que el navegador se comporte bien por defecto
- políticas distintas según entorno sin razón clara
- no saber si la app o el proxy pone los headers
- romper algo y resolver quitando el header sin revisar la deuda subyacente
- confiar solo en auditorías automáticas sin modelo mental del riesgo

---

## Checklist práctico

Cuando revises HTTP security headers, preguntate:

- ¿mi app sirve HTML, paneles o solo JSON?
- ¿qué headers de seguridad salen realmente hoy?
- ¿qué capa los está agregando?
- ¿qué superficie concreta endurece cada uno?
- ¿estamos confiando demasiado en defaults del navegador?
- ¿hay endpoints más sensibles que deberían estar mejor cubiertos?
- ¿copiamos políticas sin entender su impacto?
- ¿qué ausencia me preocuparía más en esta app concreta?
- ¿qué parte de la app depende hoy de comportamientos demasiado laxos?
- ¿qué header debería revisar primero para reducir más riesgo con menos complejidad?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Qué tipo de respuestas sirve: JSON, HTML, archivos, admin?
2. ¿Qué headers de seguridad salen hoy realmente?
3. ¿Quién los agrega: la app o la infraestructura?
4. ¿Cuál de ellos está bien configurado y cuál ni siquiera miraste todavía?
5. ¿Qué superficie web o de navegador te preocupa más en tu app concreta?
6. ¿Qué header probablemente falta o está demasiado flojo?
7. ¿Qué revisarías primero para pasar de “checklist cosmética” a endurecimiento real?

---

## Resumen

Los HTTP security headers son una capa importante de endurecimiento entre el backend y el navegador.

No arreglan por sí solos:

- XSS
- IDOR
- secretos mal gestionados
- autorización floja
- diseño web pobre

Pero sí ayudan a controlar mejor:

- transporte
- interpretación de contenido
- framing
- políticas de recursos
- referrers
- capacidades del navegador

En resumen:

> un backend más maduro no trata los security headers como adorno ni como checklist vacía.  
> Los trata como parte del contrato de seguridad de cada respuesta, entendiendo que el navegador también es una superficie de ataque y que dejarlo con defaults demasiado abiertos suele ser una invitación innecesaria al abuso.

---

## Próximo tema

**HSTS y HTTPS estricto**
