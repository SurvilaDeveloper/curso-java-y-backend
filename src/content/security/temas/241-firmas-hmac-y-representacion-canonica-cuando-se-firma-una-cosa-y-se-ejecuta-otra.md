---
title: "Firmas, HMAC y representación canónica: cuando se firma una cosa y se ejecuta otra"
description: "Cómo entender firmas, HMAC y representación canónica en aplicaciones Java con Spring Boot. Por qué no alcanza con verificar una firma si distintas capas firman, comparan y ejecutan representaciones distintas del mismo input."
order: 241
module: "Parsing diferencial y ambigüedad entre componentes"
level: "base"
draft: false
---

# Firmas, HMAC y representación canónica: cuando se firma una cosa y se ejecuta otra

## Objetivo del tema

Entender por qué **firmas**, **HMAC** y la **representación canónica** forman una superficie muy importante en aplicaciones Java + Spring Boot cuando el sistema firma, valida o compara una representación del input, pero luego otra capa:

- la decodea distinto
- la normaliza distinto
- la reordena
- la colapsa
- la canonicaliza de otra manera
- o directamente ejecuta una semántica diferente de la que la firma estaba cubriendo

La idea de este tema es continuar directamente lo que vimos sobre:

- parsing diferencial
- ambigüedad entre componentes
- canonicalización
- normalización
- parámetros duplicados
- headers repetidos
- URLs, paths y routing

Ahora toca mirar un caso especialmente delicado, porque mezcla dos cosas que suelen dar mucha confianza:

- un input firmado
- una verificación criptográfica correcta

Y justo ahí aparece una trampa fuerte.

Porque el equipo tiende a pensar algo así:

- “si el HMAC verifica, el request es el mismo”
- “si la firma es válida, lo que vamos a ejecutar es exactamente lo que se protegió”
- “si firmamos la URL o los parámetros, ya quedó fijada la operación”
- “si el payload validó, el significado está preservado”

Eso puede ser verdad.
Pero solo si todas las capas comparten exactamente la misma representación canónica de lo firmado.

En resumen:

> firmas, HMAC y representación canónica importan porque una firma no protege una semántica abstracta del input,  
> sino una representación concreta; y si otra capa ejecuta una representación distinta del mismo dato, el sistema puede terminar verificando una cosa y actuando sobre otra.

---

## Idea clave

La idea central del tema es esta:

> una firma valida sobre **la representación que se firmó**.  
> No garantiza automáticamente que el componente que actúa después esté usando exactamente esa misma representación canónica.

Eso cambia mucho la forma de revisar integridad firmada.

Porque una cosa es pensar:

- “firmamos estos parámetros”
- “validamos este HMAC”
- “la URL viene autenticada”
- “el callback trae firma correcta”

Y otra muy distinta es preguntarte:

- “¿sobre qué string exacto se calculó la firma?”
- “¿qué normalización se asumió?”
- “¿qué pasa con duplicados?”
- “¿qué pasa con encoding o decodings posteriores?”
- “¿qué pasa si el verificador firma una serialización y el ejecutor interpreta otra?”
- “¿la capa que consume comparte exactamente la misma forma canónica que la que firmó?”

### Idea importante

La firma protege una representación.
Si el sistema no fija una representación canónica única y compartida, la integridad puede volverse semánticamente ambigua.

### Regla sana

Cada vez que haya firma o HMAC sobre input transportado, preguntate no solo:
- “¿la firma valida?”
sino también:
- “¿qué representación exacta está quedando protegida y es la misma que luego se usa?”

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- pensar que firmar parámetros automáticamente fija su significado
- asumir que HMAC correcto implica ejecución correcta de la misma semántica
- no distinguir string firmado de semántica consumida
- olvidar canonicalización al firmar requests, callbacks o URLs
- firmar una serialización mientras el consumidor acepta otras equivalentes o ambiguas
- creer que una firma cierra el problema aunque el parsing posterior no esté alineado

Es decir:

> el problema no es solo calcular bien la firma.  
> El problema es **qué pasa si la firma cubre una forma del dato y la ejecución usa otra**.

---

## Error mental clásico

Un error muy común es este:

### “Si el HMAC dio bien, entonces esto es exactamente lo que se quiso enviar”

Eso suele ser demasiado fuerte.

Porque todavía conviene preguntar:

- ¿exactamente qué fue lo que se quiso firmar?
- ¿el orden importa?
- ¿los duplicados importan?
- ¿el path firmado es el raw o el normalized?
- ¿la query firmada es textual o semántica?
- ¿el consumidor final interpreta igual esa misma estructura?

### Idea importante

La firma puede ser correcta y aun así el sistema puede no estar protegiendo el significado operativo que realmente termina ejecutando.

---

# Parte 1: Qué protege realmente una firma o un HMAC

## La intuición simple

Una firma o un HMAC suelen proteger algo como:

- bytes
- string
- payload serializado
- conjunto ordenado de campos
- request canonicalizada
- representación textual de una URL
- cuerpo exacto recibido

### Idea útil

Eso significa que la protección vive sobre una forma concreta del dato, no sobre cualquier interpretación futura que otra capa pueda hacer de él.

### Regla sana

Cada vez que digas “esto está firmado”, completá mentalmente la frase:
- “está firmada **esta representación exacta**”.

---

# Parte 2: Firma de representación no siempre equivale a firma de semántica

Este es uno de los aprendizajes más importantes del tema.

Podés firmar perfectamente algo como:

- `path=/files/%2e%2e/report`
- `redirect=/safe&redirect=/evil`
- `amount=100&currency=ARS`
- `user=abc`
- `scope=read,write`
- `resource=/public//file`

y tener integridad total sobre ese string o esa serialización.

### Problema

Si otra capa después:

- decodea
- colapsa
- reordena
- toma otro duplicado
- interpreta distinta la lista
- resuelve el path de otra forma
- aplica otra canonicalización

entonces la firma sigue siendo válida sobre la representación original, pero la acción real puede nacer de otra semántica.

### Idea importante

La firma no une automáticamente todas las interpretaciones futuras en una sola verdad.
Eso lo tiene que hacer el diseño del sistema.

### Regla sana

No confundas:
- “este string fue autenticado”
con
- “la semántica final que ejecutará la app quedó fijada de forma inequívoca”.

---

# Parte 3: La canonicalización es parte del contrato de firma

Otra razón por la que este tema importa es que muchas firmas dependen de un acuerdo implícito sobre cosas como:

- orden de parámetros
- encoding
- uso de mayúsculas o minúsculas
- espacios
- slashes
- representación de listas
- tratamiento de duplicados
- normalización Unicode
- inclusión o exclusión de campos vacíos
- path exacto a firmar
- host o query incluidos o no

### Idea útil

Eso significa que la canonicalización no es un detalle “antes” de la firma.
Es parte del **contrato de integridad**.

### Regla sana

Cada vez que diseñes una firma, preguntate:
- “¿qué representación exacta acepta el verificador?”
y también:
- “¿la capa que ejecuta consume exactamente esa misma representación?”

### Idea importante

Sin canonicalización compartida, la firma valida bytes; no necesariamente protege decisiones.

---

# Parte 4: Una capa puede firmar raw y otra ejecutar normalized

Este patrón aparece muchísimo conceptualmente.

## Capa A
- firma o verifica el raw path, raw query o payload textual

## Capa B
- decodea
- colapsa
- normaliza
- resuelve segmentos
- interpreta duplicados

### Problema

La capa A siente que protegió el request.
La capa B siente que está ejecutando el mismo request.
Pero quizás no están hablando de la misma ruta o de los mismos parámetros.

### Idea útil

Eso se parece mucho a:
- “se firmó una cosa y se ejecutó otra”
aunque ninguna capa se sienta incorrecta por sí sola.

### Regla sana

Cada vez que una firma se aplique antes de una transformación semántica importante, revisá si la capa posterior está consumiendo exactamente la misma semántica ya fijada.

---

# Parte 5: Parámetros duplicados + HMAC = superficie clásica

Esto conecta directo con el tema 239.

Supongamos un request con campos repetidos.
Pueden pasar cosas como:

- la firma canónica toma el primero
- el framework expone el último
- la app usa el array completo
- el gateway firma una query reordenada
- la app ejecuta la primera coincidencia relevante
- una capa ignora duplicados y otra no

### Idea importante

Ahí el HMAC no resuelve por sí solo el problema.
Solo autentica una política de interpretación que quizá el consumidor final no comparte.

### Regla sana

Nunca des por sentado que una firma sobre parámetros repetibles fija automáticamente cuál valor manda.
Eso tiene que estar definido explícitamente y de manera consistente.

### Idea útil

La integridad de una resolución ambigua sigue siendo ambigua.

---

# Parte 6: URLs firmadas también sufren esto

Esto es especialmente importante porque muchas signed URLs o callbacks HMACeados se basan en:

- path
- query
- expiry
- método
- host
- recurso
- y parámetros de control

Si distintas capas no coinciden en cómo representar:

- slashes
- `%2f`
- trailing slash
- orden de query params
- parámetros duplicados
- casing del host o del path
- caracteres escapados

entonces la firma puede seguir siendo correcta mientras la operación real ya cambió de semántica.

### Idea importante

La signed URL no es más segura que la canonicalización compartida entre quien firma, quien verifica y quien consume.

### Regla sana

Cada vez que firmes una URL, preguntate qué forma de esa URL es la que gobierna de verdad la operación final.

---

# Parte 7: Firmar antes del proxy y ejecutar después del proxy puede ser dos mundos distintos

En arquitecturas reales esto se complica más porque puede haber:

- CDN
- reverse proxy
- gateway
- rewrites
- header injection controlada
- cambios de host/path
- prefijos virtuales
- normalización de upstream

### Idea útil

Si la firma se calcula en un punto del pipeline y la operación real ocurre en otro, la integridad depende de que ambas etapas compartan exactamente la misma visión del request firmado.

### Regla sana

Cada vez que el request firmado cruce varias capas antes del uso real, asumí que la representación canónica es parte crítica del diseño y no mero plumbing.

### Idea importante

En pipelines largos, la firma puede terminar protegendo la request “antes del viaje”, mientras el backend ejecuta la request “después de varias reinterpretaciones”.

---

# Parte 8: Firmar JSON, formularios o payloads estructurados tampoco te salva si la semántica diverge

No hace falta quedarse solo en URLs.

También puede pasar con:

- JSON
- formularios
- payloads webhook
- claims serializados
- blobs autocontenidos
- objetos ordenados de distintas maneras
- campos opcionales o nulos
- claves repetidas o estructuras ambiguas

### Idea útil

Si una capa firma una serialización específica y otra interpreta la estructura con reglas distintas, el problema vuelve a aparecer.

### Regla sana

No des por hecho que “payload firmado” significa “significado único”.
Eso depende también de cómo cada parser reconstruye la estructura semántica.

### Idea importante

La integridad estructural requiere más que bytes: requiere semántica compartida.

---

# Parte 9: Qué patrones merecen sospecha inmediata

Conviene sospechar especialmente cuando veas cosas como:

- HMAC sobre query strings sin política clara de canonicalización
- firmas sobre URLs que luego pasan por proxies o rewrites
- validación de callbacks firmados antes de parsing final por otra capa
- signed URLs con parámetros repetibles
- firmas sobre strings armados manualmente
- canonicalización “casera” previa a delegar a framework o storage
- comparación de request firmado sobre una forma textual y consumo sobre forma parseada distinta

### Idea útil

No hace falta un bypass famoso para detectar la clase de problema.
Alcanza con ver que firma, verificación y ejecución no comparten una representación inequívoca.

### Regla sana

Cada vez que una firma se apoya en strings construidos o transformados por varias capas, exigí una canonicalización única y verificablemente compartida.

---

# Parte 10: Qué preguntas conviene hacer en una review

Cuando revises firmas, HMAC y representación canónica, conviene preguntar:

- ¿qué bytes o string exactos se firman?
- ¿qué canonicalización se aplica?
- ¿qué pasa con duplicados?
- ¿qué pasa con encoding y decoding?
- ¿qué orden de parámetros se asume?
- ¿el verificador usa la misma representación que el emisor?
- ¿el consumidor final usa la misma representación que el verificador?
- ¿qué parte de la semántica podría desviarse aun con firma válida?

### Idea importante

La review buena no termina en:
- “la firma valida”
Sigue hasta:
- “¿la operación final está realmente atada a la misma representación que quedó firmada?”

---

# Parte 11: Qué revisar en una app Spring

En una app Spring, conviene sospechar especialmente cuando veas:

- HMAC sobre request params o query string
- signed URLs para descargas, callbacks o acciones sensibles
- validadores custom de firmas
- filtros que validan integridad antes de delegar a controllers
- proxies o gateways delante de endpoints firmados
- canonicalización manual de rutas o parámetros
- payloads estructurados firmados y luego parseados por librerías distintas

### Idea útil

Si la app firma o verifica requests y además hay varias capas que transforman el input, ya conviene revisar si la firma está atando bytes o semántica real.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- representación canónica explícita y bien documentada
- misma canonicalización en emisor, verificador y consumidor
- rechazo claro de ambigüedades como duplicados sensibles
- menor cantidad de transformaciones entre firma y ejecución
- equipos que entienden que HMAC sin semántica compartida no cierra del todo el problema

### Idea importante

La madurez aquí se nota cuando la integridad cubre no solo la forma textual, sino la misma semántica que el sistema terminará usando.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- “la firma da bien, así que estamos cubiertos”
- nadie sabe exactamente qué string canónico se firma
- el proxy toca la request después de firmada
- el framework reinterpreta lo firmado con otras reglas
- duplicados o decoding ambiguo siguen permitidos en requests firmados
- la canonicalización está distribuida entre varias capas sin contrato claro

### Regla sana

Si el sistema no puede explicar con precisión qué representación firma, cuál verifica y cuál ejecuta, probablemente ya tiene suficiente desalineación como para que la firma proteja una cosa y la app haga otra.

---

## Checklist práctica

Para revisar firmas, HMAC y representación canónica, preguntate:

- ¿qué representación exacta se firma?
- ¿qué representación exacta se verifica?
- ¿qué representación exacta se usa al ejecutar?
- ¿hay transformaciones en el medio?
- ¿qué pasa con duplicados, encoding o normalización?
- ¿todas las capas comparten el mismo contrato canónico?
- ¿qué daño aparece si la firma cubre una semántica y el sistema consume otra?

---

## Mini ejercicio de reflexión

Tomá un flujo real firmado de tu app Spring y respondé:

1. ¿Qué se firma exactamente?
2. ¿Quién verifica esa firma?
3. ¿Quién consume el dato después?
4. ¿Qué transformaciones ocurren entre verificación y uso?
5. ¿Qué parte de la semántica podría desviarse aunque la firma siga validando?
6. ¿Qué parte del equipo sigue pensando que “HMAC correcto” ya cierra todo?
7. ¿Qué revisarías primero después de este tema?

---

## Resumen

Las firmas, los HMAC y la representación canónica importan porque una firma no protege una semántica abstracta del input, sino una representación concreta, y si otra capa termina interpretando otra representación distinta del mismo dato, el sistema puede verificar una cosa y ejecutar otra.

La gran intuición del tema es esta:

- firmar bytes no siempre fija significado
- canonicalización es parte del contrato de integridad
- duplicados, encoding y normalización importan también bajo firma
- proxy, verificador y consumidor pueden no compartir la misma semántica
- y el riesgo aparece cuando la firma válida hace creer que la operación ya quedó inequívocamente fijada, aunque no sea así

En resumen:

> un backend más maduro no trata las firmas y los HMAC como si bastara con que la verificación criptográfica salga bien para asegurar que la acción posterior está necesariamente atada al mismo input significativo, sino como mecanismos cuyo valor real depende de que todas las capas relevantes compartan exactamente la misma representación canónica del dato firmado.  
> Entiende que la pregunta importante no es solo si la firma valida, sino si lo que valida es efectivamente lo mismo que el sistema terminará ejecutando.  
> Y justamente por eso este tema importa tanto: porque muestra una de las formas más peligrosas de parsing diferencial, la de sistemas donde la integridad está impecablemente implementada sobre una representación que dejó de ser la verdad operativa del flujo, que es una de las maneras más directas de convertir una firma correcta en una protección semánticamente incompleta.

---

## Próximo tema

**Cierre del bloque: principios duraderos para parsing diferencial y ambigüedad entre capas**
