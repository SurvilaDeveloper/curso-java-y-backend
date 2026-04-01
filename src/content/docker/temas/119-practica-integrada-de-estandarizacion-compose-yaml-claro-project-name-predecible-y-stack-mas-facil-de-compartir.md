---
title: "Práctica integrada de estandarización: compose.yaml claro, project name predecible y stack más fácil de compartir"
description: "Tema 119 del curso práctico de Docker: una práctica integrada donde combinás un archivo Compose base claro, project name predecible, nombres de servicio sanos, ausencia de container_name innecesario y validación con docker compose config para dejar un proyecto más fácil de compartir y mantener."
order: 119
module: "Cierre operativo, documentación mínima y proyecto más compartible"
level: "intermedio"
draft: false
---

# Práctica integrada de estandarización: `compose.yaml` claro, project name predecible y stack más fácil de compartir

## Objetivo del tema

En este tema vas a:

- juntar en una sola práctica varias ideas del bloque de convenciones de equipo
- dejar un archivo Compose base claro y canónico
- volver más predecible el nombre del proyecto
- apoyarte en nombres de servicio claros en vez de `container_name` por costumbre
- validar la configuración real con `docker compose config`
- terminar con un proyecto más fácil de compartir, mantener y tocar entre varias personas

La idea es cerrar este bloque con una práctica concreta de estandarización, para que el proyecto no dependa tanto de costumbres informales ni de memoria implícita.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. partir de un proyecto con convenciones poco claras
2. definir un archivo base Compose canónico
3. hacer más predecible el project name
4. apoyarte en nombres de servicio simples y estables
5. evitar `container_name` si no aporta valor real
6. usar `docker compose config` como fuente de verdad del modelo final

---

## Idea central que tenés que llevarte

En los temas anteriores viste que un proyecto más compartible necesita:

- runtime razonable
- puertos y salud bien pensados
- README operativo mínimo

Este tema agrega otra capa muy importante:

> además de correr bien, el proyecto tiene que ser fácil de leer, nombrar y validar entre varias personas.

No hace falta una “arquitectura de convenciones” enorme.
Con unas pocas reglas simples ya se reduce muchísima fricción operativa.

---

## Escenario del tema

Vas a imaginar un proyecto con:

- `proxy`
- `app`
- `db`

y con este tipo de problemas típicos:

- hay varios archivos Compose y no está claro cuál es la base
- el nombre del proyecto cambia según la carpeta donde se clone
- alguien puso `container_name` “para que quede lindo”
- nadie mira el modelo final antes de ejecutar
- el README existe, pero no está alineado con estas decisiones

Este es un caso ideal para cerrar bien el bloque.

---

## Primera versión: funciona, pero deja convenciones ambiguas

Imaginá algo así:

```yaml
services:
  proxy:
    image: nginx
    container_name: mi-proxy

  app:
    build: .
    container_name: mi-app

  db:
    image: postgres:18
    container_name: mi-db
```

y además:

- el archivo principal se llama de una forma poco predecible
- a veces se usa `-f` y a veces no
- el nombre del proyecto depende de la carpeta local de cada persona

---

## Qué problema tiene esta primera versión

Puede funcionar.
Pero deja varias fricciones innecesarias:

- el archivo base no está claro
- los nombres dependen demasiado del entorno local
- `container_name` fija cosas que quizás no hacía falta fijar
- el equipo se acostumbra a hablar de “lo que debería pasar” sin ver el modelo real que Compose va a aplicar

No es un problema técnico grave.
Es un problema de **claridad compartida**.

---

## Paso 1: fijar un archivo base claro

La primera convención sana es muy simple:

- usar `compose.yaml` como archivo principal compartido
- reservar `compose.override.yaml` para overrides locales razonables cuando haga falta

Esto deja una base muy predecible.

### Qué gana esta decisión
- el archivo canónico del proyecto queda claro
- baja muchísimo la ambigüedad
- se alinea con la convención preferida por Compose actual

---

## Paso 2: dejar el stack base con nombres de servicio simples

Ahora pensá el stack así:

```yaml
name: miapp

services:
  proxy:
    image: nginx
    ports:
      - "8080:80"

  app:
    build: .
    expose:
      - "3000"

  db:
    image: postgres:18
    ports:
      - "127.0.0.1:5432:5432"
```

---

## Cómo se lee este stack

La lectura conceptual sería:

- `miapp` es el nombre del proyecto
- `proxy`, `app` y `db` son nombres de servicio claros y cortos
- no necesitás `container_name` para que el proyecto sea entendible
- el descubrimiento interno sigue funcionando por nombre de servicio

Esto ya da una base mucho más sana.

---

## Qué gana `name:` en este caso

Gana algo muy útil:

- no dependés tanto del nombre de la carpeta donde cada persona clonó el proyecto
- los recursos Compose quedan más previsibles
- baja la fricción al hablar del proyecto o depurarlo

No es obligatorio usarlo siempre.
Pero cuando el proyecto lo toca más de una persona, puede ser muy valioso.

---

## Paso 3: evitar `container_name` salvo necesidad real

Ahora la práctica integrada toma una decisión consciente:

- **no** usar `container_name` por costumbre

### Por qué
- Compose ya nombra bien los recursos a partir de `project name + service`
- el servicio ya se descubre por su nombre interno
- fijar `container_name` puede bloquear flexibilidad futura

La idea no es “prohibirlo”.
La idea es dejar de usarlo como maquillaje innecesario.

---

## Qué gana esta decisión

Gana varias cosas al mismo tiempo:

- menos acoplamiento
- mejor portabilidad
- menos sorpresas si querés escalar o duplicar entornos
- menos necesidad de recordar nombres personalizados

En un proyecto compartido, eso suma muchísimo.

---

## Paso 4: dejar un override local cuando realmente haga falta

Si querés que alguien tenga un ajuste local, la forma sana sería algo como:

```yaml
# compose.override.yaml
services:
  app:
    environment:
      APP_ENV: development
```

o cualquier ajuste local razonable.

### Qué gana esto
- el archivo base sigue limpio
- el override no confunde cuál es la verdad compartida
- cada persona puede ajustar lo suyo sin reescribir el stack base

Esto es mucho más sano que tener varios archivos “base” compitiendo entre sí.

---

## Paso 5: validar el modelo real con `docker compose config`

Ahora aparece el paso más importante del tema.

Antes de ejecutar o discutir cómo quedó la configuración, corrés:

```bash
docker compose config
```

### Qué gana esto
- ves la configuración ya fusionada
- ves variables resueltas
- ves sintaxis expandida
- ves el modelo real que Compose va a aplicar

Esto vuelve muchísimo más concreta la conversación del equipo.

---

## Qué cosas conviene revisar ahí

Por ejemplo:

- el `name` efectivo del proyecto
- puertos finales
- imágenes o builds reales
- variables resueltas
- merges entre base y override
- si el stack quedó como creías o no

En muchos casos, esto evita discusiones enteras.

---

## Stack final de la práctica

Mirá una versión integrada bastante sana:

```yaml
name: miapp

services:
  proxy:
    image: nginx
    ports:
      - "8080:80"

  app:
    build: .
    expose:
      - "3000"

  db:
    image: postgres:18
    ports:
      - "127.0.0.1:5432:5432"
```

Y, si hace falta, un override local corto:

```yaml
services:
  app:
    environment:
      APP_ENV: development
```

Más un README operativo alineado con esto:

```md
## Archivo principal
- `compose.yaml`

## Levantar
```bash
docker compose up -d
```

## Ver modelo final
```bash
docker compose config
```

## Ver estado
```bash
docker compose ps
```

## Ver logs
```bash
docker compose logs -f app
```
```

---

## Cómo se lee este cierre

La lectura conceptual sería:

- hay una base clara
- hay un nombre de proyecto predecible
- los servicios tienen nombres útiles por sí mismos
- los overrides locales no pisan la convención base
- la configuración final puede verificarse antes de ejecutar
- la operación cotidiana queda alineada con estas reglas

Esto ya se siente bastante más profesional.

---

## Qué te enseña realmente esta práctica

Te enseña a juntar estas capas:

### Archivo base claro
`compose.yaml`

### Proyecto más predecible
`name:` o una convención equivalente

### Servicios mejor nombrados
`proxy`, `app`, `db`

### Menos personalización innecesaria
sin `container_name` por costumbre

### Fuente de verdad del modelo final
`docker compose config`

### Operación alineada
README corto y coherente con todo lo anterior

Lo valioso no es una sola convención.
Lo valioso es que todas juntas reducen fricción real.

---

## Qué no tenés que confundir

### Archivo base claro no significa que no pueda haber overrides
Significa que la base compartida ya no es discutible.

### `name:` no reemplaza a buenos nombres de servicio
Se complementan.

### `container_name` no hace automáticamente mejor al proyecto
A veces solo lo vuelve más rígido.

### `docker compose config` no reemplaza a `up`
Pero sí te dice con mucha más claridad qué va a ejecutar realmente Compose.

---

## Error común 1: tener más de un archivo “base” y no dejar claro cuál manda

Eso genera confusión inmediata.

---

## Error común 2: depender del nombre de la carpeta para todo sin hacerlo explícito

Eso vuelve menos predecibles nombres y recursos entre máquinas.

---

## Error común 3: usar `container_name` por costumbre estética

Eso suele aportar menos de lo que parece.

---

## Error común 4: no correr nunca `docker compose config` y discutir variables o merges a ciegas

Ahí falta una fuente de verdad concreta.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Tomá este stack conceptual:

```yaml
name: miapp

services:
  proxy:
    image: nginx
    ports:
      - "8080:80"

  app:
    build: .
    expose:
      - "3000"

  db:
    image: postgres:18
    ports:
      - "127.0.0.1:5432:5432"
```

y este override local:

```yaml
services:
  app:
    environment:
      APP_ENV: development
```

Respondé con tus palabras:

- qué archivo te parece la base compartida
- qué archivo te parece más razonable para overrides locales
- qué mejora aporta `name: miapp`
- por qué los nombres de servicio ya alcanzan bastante bien por sí solos

### Ejercicio 2
Compará estas dos ideas:

#### Opción A
```yaml
services:
  app:
    image: nginx
```

#### Opción B
```yaml
services:
  app:
    image: nginx
    container_name: mi-app
```

Respondé:

- cuál te parece más flexible
- cuál te parece más sana como convención base
- por qué
- qué problema futuro puede traerte `container_name`

### Ejercicio 3
Respondé además:

- por qué `docker compose config` te parece valioso antes de ejecutar
- qué cosas revisarías ahí primero
- por qué esto ayuda a reducir fricción en equipo
- cómo lo conectarías con un README operativo corto

### Ejercicio 4
Imaginá que alguien nuevo entra al proyecto.
Respondé:

- qué dos o tres convenciones te parece más importante que vea primero
- qué comando le mostrarías para validar el modelo final
- qué parte del README le dejarías más visible

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- si hoy el archivo Compose base está claro o no
- si hoy el nombre del proyecto depende demasiado de la carpeta
- si hoy hay `container_name` que podrías sacar
- si hoy el README menciona el archivo canónico o no
- si hoy usás `docker compose config` muy poco
- qué cambio concreto harías primero para reducir fricción en ese proyecto

No hace falta reescribir todavía tu stack real.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la relación entre archivo base, override, project name y service name?
- ¿en qué proyecto tuyo hoy hay más fricción de convenciones?
- ¿qué `container_name` hoy te parece más prescindible?
- ¿qué valor concreto te daría revisar el Compose final antes de ejecutar?
- ¿qué mejora concreta te gustaría notar al dejar reglas simples más explícitas?

Estas observaciones valen mucho más que memorizar una receta fija.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero un archivo Compose base claro y canónico, probablemente me conviene usar ________.  
> Si quiero overrides locales sin ensuciar la base, probablemente me conviene usar ________.  
> Si quiero que el nombre del proyecto sea más predecible, probablemente me conviene fijar el ________ del proyecto.  
> Si quiero evitar rigidez innecesaria, probablemente me conviene evitar ________ salvo necesidad real.  
> Si quiero ver el modelo final realmente aplicado por Compose, probablemente me conviene usar `docker compose ________`.

Y además respondé:

- ¿por qué esta práctica te parece mucho más compartible que un proyecto con convenciones implícitas?
- ¿qué proyecto tuyo te gustaría ordenar primero con esta lógica?
- ¿qué riesgo evitás al no dejar nombres, archivos y configuración librados a la costumbre?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- definir una base Compose más clara y compartible
- entender mejor cuándo conviene fijar el project name
- decidir con más criterio si `container_name` suma o molesta
- usar `docker compose config` como fuente de verdad antes de ejecutar
- dejar un proyecto bastante más predecible y fácil de mantener entre varias personas

---

## Resumen del tema

- `compose.yaml` es el archivo Compose preferido y puede fusionarse con un opcional `compose.override.yaml`. citeturn322559search1turn322559search8
- El project name por defecto depende del directorio, pero puede fijarse con `-p`, `COMPOSE_PROJECT_NAME` o `name:`. citeturn322559search0turn322559search19
- Los servicios se descubren por nombre dentro de la red del proyecto. citeturn322559search21
- Si usás `container_name`, Compose no puede escalar ese servicio más allá de una instancia. citeturn322559search2
- `docker compose config` renderiza el modelo final resolviendo variables, merges y sintaxis corta. citeturn322559search3
- Esta práctica te deja una base mucho más clara para compartir y mantener un proyecto sin depender tanto de convenciones tácitas.

---

## Próximo tema

En el próximo tema vas a seguir avanzando hacia el cierre final del roadmap con una práctica integrada de cierre general:

- runtime más profesional
- Compose más predecible
- README operativo mínimo
- y un proyecto Docker mucho más fácil de retomar, compartir y mantener
