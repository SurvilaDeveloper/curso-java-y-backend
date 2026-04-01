---
title: "De JSON enorme a respuestas rápidas: templates útiles con --format para inspect sin perder tiempo"
description: "Tema 104 del curso práctico de Docker: cómo pasar de docker inspect en JSON completo a consultas rápidas con --format, usando Go templates para extraer estado, IP, puertos, mounts, variables, labels y datos útiles de contenedores, imágenes y volúmenes."
order: 104
module: "Inspección, metadata y diagnóstico con criterio"
level: "intermedio"
draft: false
---

# De JSON enorme a respuestas rápidas: templates útiles con --format para inspect sin perder tiempo

## Objetivo del tema

En este tema vas a:

- pasar del JSON completo de `inspect` a consultas puntuales mucho más rápidas
- usar `--format` con más criterio
- extraer datos concretos de contenedores, imágenes y volúmenes
- dejar de perderte en árboles JSON gigantes cuando ya sabés qué necesitás
- construir una pequeña caja de herramientas mental para diagnóstico rápido

La idea es que `docker inspect` deje de sentirse como “mucho JSON imposible” y pase a ser una fuente de respuestas concretas.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. recordar por qué conviene mirar primero el JSON completo
2. usar `--format` cuando ya sabés qué dato querés
3. extraer estado, variables, mounts, puertos y redes de un contenedor
4. extraer metadata útil de imágenes y volúmenes
5. construir una regla práctica para combinar visión completa y foco puntual

---

## Idea central que tenés que llevarte

En el tema anterior viste que `docker inspect` te da el estado real de un objeto en JSON.

Eso es excelente como fuente de verdad.
Pero cuando ya sabés qué buscás, muchas veces querés ir directo al dato.

Docker documenta que `docker inspect`, `docker container inspect`, `docker image inspect` y `docker volume inspect` aceptan `--format`, y que Docker usa **Go templates** para formatear esa salida. La propia guía de formatting documenta funciones como `json`, `join`, `split`, `lower`, `upper`, `println` y otras que vuelven mucho más práctico extraer datos concretos. citeturn816277search2turn816277search5turn816277search0turn816277search3turn816277search1

Dicho simple:

> primero usá el JSON para orientarte;  
> después usá `--format` para dejar de leer de más.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker deja varias ideas muy claras para este tema:

- `docker inspect` devuelve información detallada de bajo nivel y, por defecto, la muestra como un array JSON. citeturn816277search2
- `docker container inspect`, `docker image inspect` y `docker volume inspect` admiten `--format` para ejecutar una template por cada resultado. citeturn816277search5turn816277search0turn816277search3
- Docker soporta Go templates para manipular la salida de comandos, incluyendo helpers como `json`, `join`, `split`, `lower`, `upper`, `pad`, `truncate` y `println`. citeturn816277search1
- los puertos publicados y la configuración de red pueden verificarse en la metadata del contenedor, y Docker documenta que los puertos publicados se mapean al host mediante NAT/PAT. citeturn816277search2turn816277search16turn816277search4
- los volúmenes son almacenamiento persistente administrado por Docker, y su metadata también puede inspeccionarse para confirmar nombre, driver y mountpoint. citeturn816277search6turn816277search3

---

## Primer concepto: no abandones el JSON completo demasiado pronto

La regla más sana sigue siendo esta:

### Primero
mirá el objeto completo:

```bash
docker inspect mi-contenedor
```

### Después
cuando ya entendiste el árbol o sabés qué campo te importa, recién ahí filtrá con `--format`.

Esto te evita intentar escribir templates “a ciegas” para campos que todavía no ubicás bien.

---

## Qué gana este orden

Gana dos cosas muy valiosas:

- el JSON te orienta
- `--format` te acelera

Si invertís ese orden demasiado pronto, muchas veces terminás probando templates por intuición y perdiendo tiempo.

---

## Segundo concepto: el caso más simple, estado

Uno de los campos más útiles para empezar es el estado del contenedor.

Por ejemplo:

```bash
docker inspect --format '{{.State.Status}}' mi-contenedor
```

### Qué suele devolver
- `running`
- `exited`
- `restarting`
- etc.

Este es un ejemplo perfecto de consulta pequeña y muy útil.

---

## Otro ejemplo simple: PID o restart count

Si querés mirar algo muy puntual del runtime:

```bash
docker inspect --format '{{.State.Pid}}' mi-contenedor
docker inspect --format '{{.RestartCount}}' mi-contenedor
```

No hace falta memorizar estos campos hoy.
Lo importante es ver el patrón:
una vez que encontraste el campo en el JSON, `--format` te lo deja servido.

---

## Tercer concepto: variables de entorno reales

Cuando querés confirmar qué variables quedaron realmente en el contenedor, esta forma suele ser muy útil:

```bash
docker inspect --format '{{json .Config.Env}}' mi-contenedor
```

La función `json` está documentada en la guía oficial de formatting y sirve muchísimo para que estructuras complejas sigan siendo legibles. citeturn816277search1

---

## Por qué `json` ayuda tanto

Porque si mostrás arrays o maps directamente, a veces la salida queda fea o ambigua.

Con `json`, la estructura sale en un formato más claro y copiable.

Esto es especialmente útil para:

- `.Config.Env`
- `.Mounts`
- `.NetworkSettings.Ports`
- `.NetworkSettings.Networks`
- `.Config.Labels`

---

## Cuarto concepto: mounts

Si querés confirmar qué mounts reales tiene un contenedor, una de las consultas más útiles es:

```bash
docker inspect --format '{{json .Mounts}}' mi-contenedor
```

### Qué te ayuda a verificar
- si hay bind mount o volume
- source real
- destination real
- modo de acceso
- tipo del mount

Esto encaja perfecto con debugging de storage.

---

## Un paso más: solo el destination o el source

Cuando ya sabés qué campo querés y no necesitás toda la estructura, podrías ir más fino.

Por ejemplo, si querés imprimir una línea por mount:

```bash
docker inspect --format '{{range .Mounts}}{{println .Type .Source "->" .Destination}}{{end}}' mi-contenedor
```

Acá aparece `range` y `println`, ambos muy útiles en Go templates. La guía de formatting documenta precisamente helpers como `println`. citeturn816277search1

---

## Qué gana este formato

Gana legibilidad inmediata.

En vez de un bloque JSON grande, ves algo como:

```text
bind /ruta/del/host -> /app
volume proyecto_db-data -> /var/lib/postgresql
```

Eso suele ser mucho más práctico para el día a día.

---

## Quinto concepto: puertos publicados

Docker documenta que el mapping de puertos vive en la metadata de red del contenedor, y que el publishing usa NAT/PAT. citeturn816277search16turn816277search4

Una consulta razonable sería:

```bash
docker inspect --format '{{json .NetworkSettings.Ports}}' mi-contenedor
```

### Qué te ayuda a confirmar
- si un puerto está publicado
- a qué host/puerto quedó mapeado
- si realmente existe el binding que vos creías

Esto es ideal cuando el contenedor no responde donde esperabas.

---

## Sexto concepto: redes e IPs

Si querés ver las redes efectivas del contenedor:

```bash
docker inspect --format '{{json .NetworkSettings.Networks}}' mi-contenedor
```

Docker documenta que cada contenedor recibe una IP por cada red a la que se adjunta. citeturn816277search4turn816277search16

### Qué te ayuda a verificar
- a qué redes pertenece
- qué IP tiene en cada una
- si el problema era realmente de conectividad o de configuración de red

Esto conecta perfecto con troubleshooting de networking.

---

## Un formato más fino para una IP concreta

Si sabés exactamente qué red te importa, podés ir más fino.

Por ejemplo, conceptualmente:

```bash
docker inspect --format '{{.NetworkSettings.Networks.bridge.IPAddress}}' mi-contenedor
```

La idea importante no es memorizar “bridge”.
La idea importante es:
una vez que viste el JSON, podés bajar a ese dato puntual.

---

## Séptimo concepto: labels

Docker documenta que los labels son metadata de imágenes, contenedores, volúmenes y redes. citeturn816277search16

Entonces una consulta muy útil puede ser:

```bash
docker inspect --format '{{json .Config.Labels}}' mi-contenedor
```

o, para una imagen:

```bash
docker image inspect --format '{{json .Config.Labels}}' mi-imagen:tag
```

### Qué te ayuda a verificar
- si una label se aplicó realmente
- si Compose o tu Dockerfile dejó la metadata que esperabas
- si una automatización puede apoyarse en esas labels

---

## Octavo concepto: `image inspect`

Docker documenta `docker image inspect` como comando especializado para imágenes, también con salida JSON o `--format`. citeturn816277search0

### Ejemplos útiles
Ver labels:

```bash
docker image inspect --format '{{json .Config.Labels}}' mi-imagen:tag
```

Ver variables baked-in:

```bash
docker image inspect --format '{{json .Config.Env}}' mi-imagen:tag
```

Ver entrypoint o command:

```bash
docker image inspect --format '{{json .Config.Entrypoint}}' mi-imagen:tag
docker image inspect --format '{{json .Config.Cmd}}' mi-imagen:tag
```

Esto es muy útil cuando querés entender la imagen antes de siquiera crear un contenedor.

---

## Noveno concepto: `volume inspect`

Docker documenta `docker volume inspect` para mostrar información de uno o más volúmenes. citeturn816277search3turn816277search6

### Ejemplos útiles
Ver metadata completa:

```bash
docker volume inspect db-data
```

Ver el mountpoint real:

```bash
docker volume inspect --format '{{.Mountpoint}}' db-data
```

Ver driver y labels:

```bash
docker volume inspect --format '{{.Driver}}' db-data
docker volume inspect --format '{{json .Labels}}' db-data
```

Esto conecta perfecto con decisiones de limpieza o troubleshooting de persistencia.

---

## Décimo concepto: formatear mejor la salida

La guía de formatting de Docker documenta helpers muy útiles además de `json`, por ejemplo:

- `join`
- `split`
- `lower`
- `upper`
- `println`
- `truncate`
- `pad` citeturn816277search1

Para este nivel, no hace falta que los memorices todos.
La enseñanza útil es:

> `--format` no solo recorta; también puede volver la salida mucho más legible.

---

## Un ejemplo con `join`

Si tuvieras una lista y quisieras unirla más cómodo, helpers como `join` pueden ayudarte.
No hace falta que hoy lo apliques a todos los campos.
Solo vale la pena recordar que no estás limitado a “imprimir el campo crudo”.

---

## Una mini caja de herramientas muy útil

Acá tenés una lista corta y práctica para arrancar:

### Ver estado
```bash
docker inspect --format '{{.State.Status}}' mi-contenedor
```

### Ver variables
```bash
docker inspect --format '{{json .Config.Env}}' mi-contenedor
```

### Ver mounts
```bash
docker inspect --format '{{json .Mounts}}' mi-contenedor
```

### Ver puertos
```bash
docker inspect --format '{{json .NetworkSettings.Ports}}' mi-contenedor
```

### Ver redes
```bash
docker inspect --format '{{json .NetworkSettings.Networks}}' mi-contenedor
```

### Ver labels del contenedor
```bash
docker inspect --format '{{json .Config.Labels}}' mi-contenedor
```

### Ver labels de la imagen
```bash
docker image inspect --format '{{json .Config.Labels}}' mi-imagen:tag
```

### Ver mountpoint del volumen
```bash
docker volume inspect --format '{{.Mountpoint}}' db-data
```

Esta caja ya resuelve un montón de preguntas cotidianas.

---

## Qué no tenés que confundir

### `--format` no reemplaza al JSON completo
Lo complementa.

### Que un campo exista en un ejemplo no significa que lo sepas ubicar sin mirar el objeto real
Primero orientate.

### `json` no es lo mismo que el JSON completo de salida por defecto
Es una ayuda para serializar un subárbol dentro de una template.

### `inspect` sigue mostrando la verdad del objeto real, no “lo que debería haber quedado”
Ese sigue siendo el corazón del tema anterior y de este.

---

## Error común 1: intentar hacer templates complejas sin haber visto el árbol JSON primero

Eso suele llevar a mucha frustración innecesaria.

---

## Error común 2: imprimir arrays o maps sin `json` y después no entender bien la salida

La función `json` suele mejorar mucho la legibilidad. citeturn816277search1

---

## Error común 3: seguir revisando Compose o Dockerfile cuando el contenedor real ya existe y podés inspeccionarlo

El objeto real tiene más autoridad para diagnóstico.

---

## Error común 4: no usar `volume inspect` antes de tocar un volumen que puede ser importante

Eso conecta directo con los riesgos del bloque de limpieza.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Respondé con tus palabras:

- por qué conviene mirar primero el JSON completo
- por qué después conviene bajar a `--format`
- qué te aporta la función `json` dentro de una template

### Ejercicio 2
Imaginá que querés responder estas preguntas de un contenedor:

- ¿está running?
- ¿qué variables tiene?
- ¿qué mounts tiene?
- ¿qué puertos están publicados?
- ¿en qué redes está?

Respondé:

- por qué `inspect --format` te parece útil para cada una
- por qué esto te ahorra tiempo frente a leer siempre todo el JSON

### Ejercicio 3
Respondé además:

- cuándo usarías `docker image inspect`
- cuándo usarías `docker volume inspect`
- qué dato de un volumen te parecería valioso ver antes de borrarlo
- qué dato de una imagen te parecería valioso ver antes de correrla

### Ejercicio 4
Elegí dos de estas consultas y explicá qué problema resuelven:

```bash
docker inspect --format '{{.State.Status}}' mi-contenedor
docker inspect --format '{{json .Mounts}}' mi-contenedor
docker inspect --format '{{json .NetworkSettings.Ports}}' mi-contenedor
docker inspect --format '{{json .Config.Env}}' mi-contenedor
docker volume inspect --format '{{.Mountpoint}}' db-data
```

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué dato puntual te gustaría sacar con `--format` primero
- si hoy estás leyendo demasiado JSON cuando ya sabías qué querías mirar
- qué contenedor te gustaría revisar mejor
- qué volumen te gustaría inspeccionar antes de tocarlo
- qué mejora concreta te gustaría notar al pasar de JSON enorme a consultas puntuales

No hace falta ejecutar nada todavía.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la secuencia JSON completo primero, `--format` después?
- ¿qué campo de un contenedor te gustaría aprender a leer primero con soltura?
- ¿qué uso de `json` te parece más práctico para el día a día?
- ¿qué problema cotidiano tuyo se resolvería más rápido con una template corta?
- ¿qué mejora concreta te gustaría notar al diagnosticar con más foco?

Estas observaciones valen mucho más que memorizar una docena de campos.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si primero quiero entender el objeto entero, probablemente me conviene mirar la salida de `inspect` en ________.  
> Si después quiero extraer solo un dato concreto, probablemente me conviene usar `--________`.  
> Si quiero que un array o un mapa salga más legible dentro de una template, probablemente me conviene usar la función ________.  
> Si quiero revisar dónde vive realmente un volumen antes de tocarlo, probablemente me conviene usar `docker volume ________`.

Y además respondé:

- ¿por qué este tema impacta tanto en debugging rápido?
- ¿qué objeto tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no seguir adivinando datos que Docker ya te puede mostrar?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- pasar de `inspect` completo a consultas más puntuales sin perder contexto
- usar `--format` con mucha más soltura
- apoyarte mejor en `json` y otras helpers de templates
- extraer datos útiles de contenedores, imágenes y volúmenes con menos esfuerzo
- diagnosticar bastante más rápido cuando ya sabés qué querés comprobar

---

## Resumen del tema

- `docker inspect` y sus variantes especializadas aceptan `--format` para extraer datos puntuales. citeturn816277search2turn816277search5turn816277search0turn816277search3
- Docker usa Go templates para formatear la salida, con funciones como `json`, `join`, `split` y `println`. citeturn816277search1
- La metadata del contenedor permite corroborar estado, mounts, variables, puertos y redes reales. citeturn816277search2turn816277search16turn816277search4
- `docker image inspect` sirve para revisar metadata de imágenes y `docker volume inspect` para revisar metadata de volúmenes. citeturn816277search0turn816277search3turn816277search6
- Este tema te deja una base mucho más práctica para pasar de un JSON gigante a respuestas concretas sin perderte en el detalle.

---

## Próximo tema

En el próximo bloque vas a empezar a moverte hacia otra capa muy importante del trabajo real con Docker:

- procesos dentro del contenedor
- `docker exec`
- inspección interactiva
- y cómo entrar a un contenedor con criterio cuando mirar metadata ya no alcanza
