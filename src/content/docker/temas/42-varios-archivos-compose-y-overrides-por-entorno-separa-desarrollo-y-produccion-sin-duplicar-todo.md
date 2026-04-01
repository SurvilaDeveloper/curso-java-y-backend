---
title: "Varios archivos Compose y overrides por entorno: separá desarrollo y producción sin duplicar todo"
description: "Tema 42 del curso práctico de Docker: cómo trabajar con varios archivos Compose, qué hace compose.override.yaml por defecto, cómo usar -f para combinar configuraciones y qué reglas de merge conviene entender para separar entornos sin duplicar el stack completo."
order: 42
module: "Docker Compose como herramienta central"
level: "intermedio"
draft: false
---

# Varios archivos Compose y overrides por entorno: separá desarrollo y producción sin duplicar todo

## Objetivo del tema

En este tema vas a:

- entender por qué conviene usar varios archivos Compose
- ver qué hace `compose.override.yaml` por defecto
- usar `-f` para combinar archivos Compose
- entender las reglas básicas de merge
- separar mejor configuraciones de desarrollo y producción sin copiar todo el stack

La idea es que empieces a pensar tu stack en capas, en vez de intentar meter todos los escenarios posibles en un solo archivo gigantesco.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender qué problema aparece cuando un mismo stack necesita comportarse distinto según el entorno
2. ver cómo Compose combina varios archivos
3. conocer el rol de `compose.override.yaml`
4. usar `-f` para controlar qué configuración se aplica
5. entender qué atributos se reemplazan y cuáles se fusionan
6. construir una forma simple de separar base y entorno sin duplicar el proyecto entero

---

## Idea central que tenés que llevarte

A medida que un proyecto crece, aparece algo muy común:

- en desarrollo querés bind mounts, más logs, quizás un servicio auxiliar
- en producción querés otra imagen, menos puertos, otra política de reinicio, quizá otro archivo de variables

Si intentás resolver todo eso en un único `compose.yaml`, el archivo puede volverse confuso.

Compose resuelve esto permitiéndote combinar archivos.

Dicho simple:

> un archivo base define el stack principal  
> y uno o más archivos extra lo ajustan según el entorno

Eso te da mucha más claridad.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker indica que, por defecto, Compose lee un `compose.yaml` y opcionalmente un `compose.override.yaml`. También explica que podés usar `-f` para listar varios archivos Compose en el orden deseado, que Compose los combina siguiendo reglas de merge, y que los archivos posteriores pueden sobrescribir o ampliar la configuración de los anteriores. Además, Docker aclara que los paths relativos se resuelven respecto del primer archivo base al trabajar con múltiples archivos. citeturn868104search1turn868104search5turn868104search8turn868104search9turn868104search0

---

## Por qué esto importa tanto

Imaginá esta situación:

### En desarrollo querés
- bind mount del código
- puertos publicados
- un panel auxiliar
- variables más verbosas

### En producción querés
- build más cerrado
- sin bind mounts
- puertos más acotados
- menos servicios auxiliares

Si intentás poner todo junto en el mismo archivo, podés terminar con:

- demasiado ruido
- configuraciones mezcladas
- bloques comentados
- cosas “temporales” que quedan dando vueltas
- un `compose.yaml` difícil de leer

La idea de overrides evita eso.

---

## La forma más simple: compose.yaml + compose.override.yaml

Docker explica que, por convención, el archivo `compose.yaml` contiene la configuración base y el archivo `compose.override.yaml` agrega o modifica configuración para el entorno local o de desarrollo. citeturn868104search1

Pensalo así:

### `compose.yaml`
define la base del stack

### `compose.override.yaml`
ajusta la base para desarrollo o para el caso local por defecto

---

## Ejemplo mental simple

### compose.yaml

```yaml
services:
  web:
    build: .
    ports:
      - "8080:80"
```

### compose.override.yaml

```yaml
services:
  web:
    environment:
      APP_ENV: development
    volumes:
      - .:/app
```

### Qué significa

- el stack base ya define el servicio `web`
- el override le agrega variables y bind mount
- al usar Compose normalmente, ambas piezas se combinan

Ese es el corazón del patrón.

---

## Qué hace Compose por defecto con estos dos archivos

Si estás en una carpeta con:

- `compose.yaml`
- `compose.override.yaml`

entonces `docker compose up` toma ambos por defecto y los fusiona. Docker lo documenta explícitamente. citeturn868104search1

Eso hace que el flujo local sea muy cómodo, porque no tenés que escribir siempre dos `-f`.

---

## Usar -f para controlar archivos manualmente

También podés decirle a Compose exactamente qué archivos usar y en qué orden.

Por ejemplo:

```bash
docker compose -f compose.yaml -f compose.dev.yaml up -d
```

O:

```bash
docker compose -f compose.yaml -f compose.prod.yaml up -d
```

La documentación oficial explica que `-f` permite enumerar múltiples archivos Compose y que el orden importa, porque los archivos posteriores pueden sobrescribir o ampliar al primero. citeturn868104search5turn868104search13

---

## Qué significa “el orden importa”

Esto es clave.

Pensalo así:

- el primer archivo pone la base
- los siguientes archivos modifican esa base

Entonces:

```bash
docker compose -f compose.yaml -f compose.dev.yaml up
```

no es lo mismo que invertir el orden.

Los archivos posteriores tienen prioridad en la combinación cuando hay conflicto o override.

---

## Reglas básicas de merge

Docker explica que, al combinar archivos Compose:

- atributos simples y mapas suelen sobrescribirse con el valor del archivo de mayor orden
- listas suelen combinarse por append
- además existen reglas especiales y etiquetas como `!reset` y `!override` para casos avanzados citeturn868104search8turn868104search0

Para este curso, por ahora, te conviene quedarte con una idea práctica:

> los archivos posteriores ajustan o completan a los anteriores

No hace falta obsesionarse todavía con todos los casos límite.

---

## Un ejemplo más realista

### compose.yaml

```yaml
services:
  web:
    build: .
    environment:
      APP_ENV: production
    ports:
      - "8080:80"

  db:
    image: postgres:18
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
    env_file:
      - ./db.env
    volumes:
      - postgres_data:/var/lib/postgresql

volumes:
  postgres_data:
```

### compose.override.yaml

```yaml
services:
  web:
    environment:
      APP_ENV: development
    volumes:
      - .:/app

  admin:
    image: adminer
    ports:
      - "8081:8080"
```

---

## Cómo se lee este ejemplo

La lectura conceptual sería:

- `compose.yaml` define el stack base
- `compose.override.yaml` lo ajusta para desarrollo
- `web` cambia a `APP_ENV=development`
- `web` además recibe un bind mount del código local
- aparece un servicio auxiliar `admin` que no existía en la base

Esto muestra algo muy útil:

- no solo podés modificar servicios existentes
- también podés agregar servicios nuevos en un override

Docker lo documenta explícitamente: el override puede contener ajustes para servicios existentes o servicios completamente nuevos. citeturn868104search1

---

## Cuándo conviene usar compose.override.yaml

Suele convenir cuando:

- querés que el flujo local “normal” use automáticamente ajustes de desarrollo
- querés una convención simple sin tener que escribir `-f` todo el tiempo
- querés que tu base esté en `compose.yaml` y que el override local viva aparte

Es una opción muy cómoda para entornos de desarrollo.

---

## Cuándo conviene usar archivos separados con -f

Suele convenir cuando:

- querés nombrar explícitamente el entorno
- querés más control sobre qué archivos se combinan
- necesitás stacks distintos según CI, staging, producción o debugging
- no querés depender del override por defecto

Por ejemplo:

- `compose.yaml`
- `compose.dev.yaml`
- `compose.prod.yaml`

Eso suele escalar mejor cuando el proyecto crece.

---

## Qué pasa con las rutas relativas

La documentación oficial insiste en algo muy importante:

cuando trabajás con varios archivos Compose, las rutas relativas deben pensarse en relación al archivo base, es decir, al primer archivo de la lista. Esto también se remarca en `extends`, porque seguir rutas relativas distintas por fragmento se volvería confuso. citeturn868104search8turn868104search9

Traducido a práctica:

- no asumas que cada archivo “vive en su propio universo”
- si usás varios archivos, pensá los paths con respecto al archivo base

Esto evita muchos errores molestos.

---

## Qué lugar ocupa include

Docker también tiene una característica `include` para modularizar Compose en subarchivos más explícitos. La documentación la presenta como una forma de incorporar otros `compose.yaml` dentro del archivo actual, especialmente útil para modularización más estructurada. citeturn868104search2turn868104search4

No hace falta usarla todavía en este curso.
Por ahora el foco va a estar en:

- override por defecto
- combinación con `-f`

que son los mecanismos más útiles para arrancar y los más comunes.

---

## Qué no tenés que confundir

### Varios archivos Compose no significa duplicar todo
La idea es compartir base y modificar solo lo necesario.

### `compose.override.yaml` no reemplaza todos los demás enfoques
Es una convención útil, no la única posibilidad.

### `-f` no solo “agrega archivos”
También define el orden de merge.

### Los paths no se resuelven “cada uno por su cuenta”
Hay una lógica de archivo base que conviene respetar.

---

## Error común 1: copiar y pegar todo el stack entre archivos

Eso destruye el beneficio principal del enfoque.

La idea es separar base y override, no mantener dos stacks casi idénticos.

---

## Error común 2: no prestar atención al orden de -f

El orden importa porque define cómo se aplican los overrides.

---

## Error común 3: usar overrides sin una lógica clara de entorno

Si no sabés qué va en la base y qué va en desarrollo o producción, el archivo puede quedar igual de caótico.

---

## Error común 4: meter bind mounts o servicios auxiliares “por siempre” en la base

Muchas veces esos ajustes pertenecen mejor a un override de desarrollo.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá un `compose.yaml` así:

```yaml
services:
  web:
    build: .
    environment:
      APP_ENV: production
    ports:
      - "8080:80"

  db:
    image: postgres:18
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
    env_file:
      - ./db.env
    volumes:
      - postgres_data:/var/lib/postgresql

volumes:
  postgres_data:
```

### Ejercicio 2
Creá un `compose.override.yaml` así:

```yaml
services:
  web:
    environment:
      APP_ENV: development
    volumes:
      - .:/app

  admin:
    image: adminer
    ports:
      - "8081:8080"
```

### Ejercicio 3
Respondé con tus palabras:

- qué parte pertenece al stack base
- qué parte pertenece al entorno local o de desarrollo
- qué servicio nuevo agrega el override
- qué servicio existente modifica el override

### Ejercicio 4
Ahora imaginá este comando:

```bash
docker compose up -d
```

Y respondé:

- qué archivos Compose tomaría por defecto
- por qué eso es útil para desarrollo
- qué cambio principal recibiría el servicio `web`

---

## Segundo ejercicio de análisis

Imaginá que en vez de usar el override por defecto querés controlar todo con archivos explícitos.

Respondé cómo pensarías esta estructura:

- `compose.yaml`
- `compose.dev.yaml`
- `compose.prod.yaml`

Y además respondé:

- qué dejarías en la base
- qué pondrías solo en desarrollo
- qué pondrías solo en producción
- por qué eso te evita duplicar el stack completo

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tipo de configuración te parece claramente “base”?
- ¿qué tipo de configuración te parece claramente “de desarrollo”?
- ¿qué parte del merge te resulta más intuitiva?
- ¿por qué te ayuda tanto pensar el stack en capas?
- ¿qué proyecto tuyo te beneficiaría mucho de separar así los entornos?

Estas observaciones valen mucho más que memorizar una convención.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> En `compose.yaml` conviene dejar ________.  
> En un archivo override conviene dejar ________.  
> Si quiero elegir explícitamente qué combinación de archivos usar, conviene usar ________.

Y además respondé:

- ¿por qué esto evita duplicar todo el stack?
- ¿qué error te parece más fácil cometer con el orden de `-f`?
- ¿qué ventaja te da `compose.override.yaml` en desarrollo?
- ¿qué te gustaría separar primero en uno de tus proyectos reales?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar por qué conviene usar varios archivos Compose
- distinguir base y override por entorno
- entender qué hace `compose.override.yaml`
- usar `-f` con una lógica más clara
- separar desarrollo y producción sin duplicar todo el stack

---

## Resumen del tema

- Compose permite combinar varios archivos para definir una misma aplicación. citeturn868104search5turn868104search8
- Por defecto, Compose lee `compose.yaml` y opcionalmente `compose.override.yaml`. citeturn868104search1
- Los archivos posteriores pueden sobrescribir o ampliar la configuración de los anteriores según reglas de merge. citeturn868104search8turn868104search0
- El orden de `-f` importa. citeturn868104search5turn868104search13
- Los paths relativos se resuelven respecto del archivo base. citeturn868104search8turn868104search9
- Este tema te da una base muy útil para organizar desarrollo y producción con mucho más criterio.

---

## Próximo tema

En el próximo tema vas a seguir profesionalizando el flujo Compose:

- perfiles
- activar servicios opcionales
- stacks más flexibles sin multiplicar archivos
- decidir qué corre siempre y qué corre solo cuando lo pedís
