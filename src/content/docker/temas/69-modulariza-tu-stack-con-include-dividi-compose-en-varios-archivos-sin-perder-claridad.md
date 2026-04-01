---
title: "Modularizá tu stack con include: dividí Compose en varios archivos sin perder claridad"
description: "Tema 69 del curso práctico de Docker: cómo usar include en Docker Compose para dividir un stack entre varios archivos, cuándo conviene frente a merge con -f o extends, y cómo mantener proyectos más grandes ordenados sin volver inmanejable el compose principal."
order: 69
module: "Organización avanzada del stack Compose"
level: "intermedio"
draft: false
---

# Modularizá tu stack con include: dividí Compose en varios archivos sin perder claridad

## Objetivo del tema

En este tema vas a:

- entender qué problema resuelve `include` en Compose
- dividir un stack en varios archivos de forma más clara
- distinguir `include` de `-f` merge y de `extends`
- entender cómo se resuelven paths y `.env` en archivos incluidos
- preparar mejor stacks grandes o compartidos entre equipos

La idea es que, cuando un solo `compose.yaml` ya empiece a quedar chico o demasiado cargado, tengas una forma más ordenada de modularizarlo sin perder claridad.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. detectar cuándo un solo archivo empieza a quedarse corto
2. ver qué hace `include`
3. distinguirlo de `-f` merge
4. distinguirlo de `extends`
5. entender la sintaxis corta y larga
6. construir una regla práctica para modularizar un stack sin hacerlo confuso

---

## Idea central que tenés que llevarte

Hasta ahora ya viste varias formas de organizar Compose:

- un solo archivo simple
- overrides con `-f`
- `compose.override.yaml`
- `x-` extensions dentro del mismo archivo
- `extends` para reutilizar configuración de servicios

Ahora aparece otro escalón:

> dividir el stack entre varios archivos completos y hacer que el principal los incorpore como bloques reutilizables.

Dicho simple:

> `include` te deja incorporar otros archivos Compose completos dentro del modelo final del proyecto, para modularizar un stack más grande sin meter todo en un solo archivo.

---

## Qué problema resuelve este tema

Imaginá un proyecto donde:

- el equipo A mantiene la base y sus auxiliares
- el equipo B mantiene una app web
- el equipo C mantiene un worker y un panel interno

Si todo termina en un solo `compose.yaml`, puede pasar que:

- el archivo crezca demasiado
- se mezcle infraestructura con aplicación
- sea difícil repartir ownership
- pequeñas modificaciones rompan cosas de otros equipos

`include` aparece justamente como una forma de trabajar mejor esa separación.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker indica que, cuando trabajás con múltiples archivos Compose, además del merge con `-f`, tenés dos mecanismos para gestionar complejidad: `extends` e `include`. Docker describe `include` como la forma de incorporar otros archivos Compose directamente dentro del archivo principal. La referencia oficial del top-level `include` documenta una sintaxis corta y una sintaxis larga, explica que los paths incluidos se resuelven con su propio directorio como base por defecto, y que cada archivo incluido puede usar su propio `.env` o un `env_file` específico para interpolación. La guía práctica también muestra que `include` permite referenciar fuentes remotas como artefactos OCI o repos Git, y explica cómo ajustar modelos incluidos con archivos de override. citeturn885865view2turn885865view0turn885865view1

---

## Primer concepto: include no es lo mismo que merge con -f

Ya viste que con `-f` podés hacer algo como:

```bash
docker compose -f compose.yaml -f compose.dev.yaml up
```

Eso sirve mucho, pero Docker remarca que las reglas de merge pueden volverse complejas bastante rápido. citeturn885865view2turn256153search12

### Merge con `-f`
Piensa más en:

- una base
- uno o más overrides
- una composición final por reglas de merge

### `include`
Piensa más en:

- “este stack principal incorpora otros Compose files completos como building blocks”

La diferencia conceptual es importante.

---

## Segundo concepto: include no es lo mismo que extends

`extends` está pensado para reutilizar la configuración de un servicio concreto desde otro servicio o archivo.

La documentación oficial lo explica así: seleccionás un servicio fuente y reusás sus propiedades, con posibilidad de override. Además aclara que el servicio extendido desde otro archivo no pasa automáticamente a formar parte del proyecto final, a menos que lo incluyas explícitamente. citeturn885865view3

### `extends`
Reutiliza configuración de **un servicio**.

### `include`
Trae **Compose files completos** al modelo final.

Eso hace que sirvan para problemas distintos.

---

## Qué es include en la práctica

La forma más simple es esta:

```yaml
include:
  - ../commons/compose.yaml
  - ../another_domain/compose.yaml

services:
  webapp:
    depends_on:
      - included-service
```

La referencia oficial lo muestra explícitamente y aclara que, en este caso, podés usar servicios incluidos como si hubieran sido declarados en el archivo local. citeturn885865view0turn885865view1

---

## Cómo se lee esto

La lectura conceptual sería:

- el archivo principal no define todo el stack
- importa otros Compose files
- esos archivos aportan servicios y otros recursos al modelo final
- el archivo principal puede depender de esos servicios como si fueran propios

Esto ya te da una forma mucho más modular de pensar Compose.

---

## Cuándo conviene mucho include

Suele tener mucho sentido cuando:

- un stack grande ya no entra cómodamente en un solo archivo
- distintos equipos mantienen distintos dominios del sistema
- querés tratar partes del stack como building blocks reutilizables
- querés consumir un Compose file de otro equipo sin copiarlo entero
- no querés depender siempre de pasar muchos `-f` manualmente

La guía práctica de Docker enfatiza justamente que include permite consumir un Compose file como un bloque reutilizable sin que el equipo consumidor tenga que conocer todos los detalles internos del componente incluido. citeturn885865view1

---

## Sintaxis corta de include

La documentación oficial define una sintaxis corta donde solo indicás paths:

```yaml
include:
  - ../commons/compose.yaml
  - ../another_domain/compose.yaml
```

Y aclara algo muy importante:

- el archivo incluido se carga con su carpeta padre como `project_directory`
- y con un `.env` opcional de ese mismo proyecto para interpolación
- el entorno local del proyecto principal puede sobrescribir esos valores. citeturn885865view0

---

## Qué significa eso de project_directory

Significa que los paths relativos dentro del Compose file incluido se resuelven respecto del archivo incluido, no respecto del archivo principal.

Esto es una diferencia muy importante frente a otros mecanismos y hace que cada subproyecto conserve su propio contexto de paths de una forma bastante natural. La referencia de `include` lo aclara explícitamente. citeturn885865view0

---

## Por qué esto es tan útil

Porque evita que el archivo principal “rompa” la lógica interna del subproyecto incluido.

Por ejemplo:

- volúmenes relativos
- build contexts
- rutas internas

siguen pudiendo pensarse desde el módulo incluido.

Eso hace que la modularización sea bastante más limpia.

---

## Sintaxis larga de include

La referencia oficial también documenta una sintaxis larga:

```yaml
include:
  - path: ../commons/compose.yaml
    project_directory: ..
    env_file: ../another/.env
```

Y explica estos campos:

- `path`: ubicación del archivo o lista de archivos a incluir
- `project_directory`: base para resolver paths relativos
- `env_file`: archivo o archivos de entorno para interpolación de ese Compose incluido citeturn885865view0

---

## Cuándo conviene la sintaxis larga

Conviene cuando:

- querés más control sobre cómo se resuelven rutas
- querés usar un `env_file` distinto del `.env` por defecto
- querés componer varios archivos como un subproyecto incluido
- necesitás una modularización un poco más explícita

---

## include con varios archivos por módulo

Docker documenta que `path` también puede ser una lista, lo que permite definir un subproyecto incluido a partir de varios Compose files que se mergean entre sí antes de entrar al modelo principal. citeturn885865view0

Por ejemplo:

```yaml
include:
  - path:
      - ../commons/compose.yaml
      - ./commons-override.yaml
```

Esto te da una forma interesante de:

- incluir un módulo
- y a la vez ajustarlo con un override local específico de ese módulo

---

## include con fuentes remotas

La guía práctica de Docker también documenta que `include` puede referenciar Compose files desde fuentes remotas, como artefactos OCI o repositorios Git. citeturn885865view1

Por ejemplo, conceptualmente:

```yaml
include:
  - oci://docker.io/username/my-compose-app:latest
```

Esto es muy poderoso porque ya te mete en una idea de distribución y reutilización entre equipos bastante más seria.

No hace falta usarlo todavía en la práctica cotidiana, pero está muy bueno saber que existe.

---

## Qué pasa si hay conflictos

La documentación práctica de Docker aclara que Compose reporta error si algún recurso incluido entra en conflicto con recursos definidos por el archivo incluido, justamente para evitar conflictos inesperados con el modelo traído desde terceros. citeturn885865view1

Eso es importante porque muestra que `include` no está pensado como un merge salvaje sin control.

Está pensado más como:

- incorporar módulos
- con fronteras más claras
- y evitar colisiones silenciosas

---

## Cómo ajustar algo incluido

Docker documenta dos caminos principales:

### Opción 1
Agregar un override dentro del propio `include`, manteniendo un archivo dedicado por cada módulo incluido. citeturn885865view1

### Opción 2
Usar un `compose.override.yaml` global que modifique el modelo resultante completo. La guía oficial lo muestra como alternativa práctica para evitar mantener demasiados archivos por include. citeturn885865view1

Esto te da bastante flexibilidad.

---

## Un ejemplo mental más realista

Imaginá esta estructura:

```text
plataforma/
├── compose.yaml
├── team-app/
│   └── compose.yaml
└── team-data/
    └── compose.yaml
```

El archivo principal podría hacer algo así:

```yaml
include:
  - ./team-app/compose.yaml
  - ./team-data/compose.yaml

services:
  gateway:
    image: miusuario/gateway:dev
    depends_on:
      - api
      - db
```

### Cómo se lee
- `api` puede venir del módulo de aplicación
- `db` puede venir del módulo de datos
- `gateway` vive en el archivo principal
- el stack final une todo eso

Este patrón ya se parece bastante a un proyecto de verdad con ownership distribuido.

---

## Cuándo no hace falta include

No hace falta meter `include` demasiado pronto.

Si tu stack:

- sigue siendo chico
- tiene pocos servicios
- entra cómodo en un solo archivo
- o se resuelve bien con `x-` extensions

quizá todavía no haga falta subir a este nivel de modularización.

La idea no es usarlo por moda.
La idea es usarlo cuando realmente ayuda.

---

## Un criterio muy útil

Preguntate esto:

> “¿Estoy tratando de reutilizar un bloque pequeño de configuración o un módulo Compose completo?”

### Si es un bloque pequeño
Probablemente te alcanza con `x-` extensions y anchors.

### Si es un servicio base concreto
Quizá `extends`.

### Si es un módulo completo o un substack
Ahí `include` suele tener mucho más sentido.

Esta pregunta sola ordena bastante bien el mapa mental.

---

## Qué no tenés que confundir

### include no reemplaza todo
Sigue conviviendo con `-f`, `extends` y `x-` extensions.

### include no es un simple override
Su intención es más modular y estructural.

### incluir archivos no significa perder control de overrides
Docker documenta formas de ajustar el modelo incluido. citeturn885865view1

### modularizar no significa repartir el caos en más archivos
La calidad de la separación sigue importando mucho.

---

## Error común 1: querer resolver con include algo que era solo repetición pequeña dentro de un archivo

Ahí muchas veces `x-` extensions ya alcanzaban.

---

## Error común 2: seguir metiendo todo en un único compose.yaml cuando el ownership ya está claramente dividido

Eso suele volver el archivo mucho más difícil de mantener.

---

## Error común 3: no pensar cómo se resuelven paths relativos de los módulos incluidos

La referencia oficial aclara que se resuelven respecto del archivo incluido o del `project_directory` definido. citeturn885865view0

---

## Error común 4: olvidar que include y merge con -f son herramientas distintas

Pueden convivir, pero no conviene pensarlas como si fueran exactamente lo mismo.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Imaginá esta estructura:

```text
plataforma/
├── compose.yaml
├── team-app/
│   └── compose.yaml
└── team-data/
    └── compose.yaml
```

### Ejercicio 2
Pensá un archivo principal así:

```yaml
include:
  - ./team-app/compose.yaml
  - ./team-data/compose.yaml

services:
  gateway:
    image: miusuario/gateway:dev
    depends_on:
      - api
      - db
```

### Ejercicio 3
Respondé con tus palabras:

- qué aporta `include`
- por qué este enfoque es más modular que meter todo en el mismo archivo
- qué ventaja da para equipos o ownership separados
- por qué `gateway` puede depender de servicios incluidos como si fueran propios

### Ejercicio 4
Respondé además:

- cuándo usarías `x-` extensions en vez de `include`
- cuándo usarías `extends`
- cuándo seguirías usando `-f` merge

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- si ya tiene módulos o dominios que podrían vivir en Compose files separados
- qué parte del stack podría ser un buen candidato para `include`
- si el problema actual es repetición interna o modularización entre equipos/áreas
- qué te cuesta más hoy: mantener un archivo enorme o coordinar varios overrides
- qué enfoque te gustaría probar primero

No hace falta escribir todavía el stack final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre bloque reusable y módulo reusable?
- ¿en qué proyecto tuyo `include` te ayudaría más?
- ¿qué parte de tus archivos Compose hoy está creciendo de una forma poco sana?
- ¿qué ventaja te parece más fuerte: separar ownership o reducir flags manuales con `-f`?
- ¿qué te parece más limpio: un archivo enorme o un stack modular con fronteras claras?

Estas observaciones valen mucho más que memorizar sintaxis.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero reutilizar un módulo Compose completo, probablemente me conviene ________.  
> Si quiero reutilizar un bloque pequeño dentro del mismo archivo, probablemente me conviene ________.  
> Si quiero reutilizar la configuración de un servicio concreto, probablemente me conviene ________.

Y además respondé:

- ¿por qué este enfoque ayuda a que stacks grandes sean más mantenibles?
- ¿qué parte de tu stack te gustaría modularizar primero?
- ¿qué riesgo evitás al dejar ownership más claro entre archivos?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar qué es `include` en Compose
- distinguirlo mejor de `-f` merge y de `extends`
- usar la sintaxis corta y entender cuándo conviene la larga
- pensar módulos Compose más reutilizables
- organizar mejor stacks que ya empezaron a crecer de verdad

---

## Resumen del tema

- Docker documenta `include` como una forma de incorporar otros Compose files directamente dentro del archivo principal. citeturn885865view0turn885865view1
- La documentación de múltiples Compose files ubica `include` junto a `extends` como alternativa al merge con `-f` cuando la complejidad crece. citeturn885865view2
- La sintaxis corta usa paths; la larga permite controlar `path`, `project_directory` y `env_file`. citeturn885865view0
- Los paths relativos de un Compose incluido se resuelven respecto de su propio archivo o del `project_directory` configurado. citeturn885865view0
- `include` también puede trabajar con fuentes remotas como OCI o Git y admite estrategias de override para ajustar el modelo incluido. citeturn885865view1
- Este tema te da una herramienta mucho más seria para modularizar stacks grandes sin meter todo en un solo archivo gigante.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en esta línea de organización, pero ya con una práctica integrada:

- módulo compartido
- include real
- overrides locales
- y una forma bastante más madura de mantener un stack grande sin perder claridad
