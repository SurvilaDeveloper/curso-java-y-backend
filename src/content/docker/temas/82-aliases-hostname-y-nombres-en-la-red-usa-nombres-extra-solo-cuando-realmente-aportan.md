---
title: "Aliases, hostname y nombres en la red: usá nombres extra solo cuando realmente aportan"
description: "Tema 82 del curso práctico de Docker: cómo pensar hostname y aliases en Docker Compose, cuándo alcanza el nombre del servicio, qué significa que un alias sea network-scoped y por qué agregar nombres extra solo tiene sentido cuando aporta claridad o compatibilidad."
order: 82
module: "Networking entre servicios y puertos con Compose"
level: "intermedio"
draft: false
---

# Aliases, hostname y nombres en la red: usá nombres extra solo cuando realmente aportan

## Objetivo del tema

En este tema vas a:

- entender la diferencia entre nombre de servicio, `hostname` y `aliases`
- usar aliases solo cuando aportan claridad o compatibilidad
- entender que los aliases son **por red**
- evitar depender de nombres extra cuando el nombre del servicio ya resuelve bien el problema
- construir un criterio más fino para naming dentro del stack

La idea es que no agregues nombres adicionales “porque sí”, sino que entiendas cuándo realmente suman valor.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. recordar que Compose ya resuelve servicios por nombre
2. ver qué hace `hostname`
3. ver qué hacen los `aliases`
4. entender que los aliases son network-scoped
5. construir una regla práctica para naming más claro dentro del stack

---

## Idea central que tenés que llevarte

En Compose, el punto de partida normal ya es bastante bueno:

- cada servicio se descubre por su **nombre de servicio**
- dentro de la red compartida, los demás servicios pueden conectarse usando ese nombre

La documentación oficial lo explica así: por defecto, cualquier servicio puede alcanzar a otro por el nombre de ese servicio, y los aliases son hostnames alternativos dentro de una red compartida. citeturn728815view1turn209649view1

Dicho simple:

> el nombre del servicio suele alcanzar.  
> `hostname` y `aliases` existen para casos más finos, no como obligación básica.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker deja varias ideas muy claras para este tema:

- la guía de networking en Compose explica que, por defecto, los servicios ya pueden alcanzarse por su nombre de servicio. citeturn728815view1turn209649view2
- la referencia de servicios documenta `hostname` y dice que define un hostname custom para el contenedor, que debe ser válido según RFC 1123. citeturn209649view0
- la misma referencia documenta `aliases` dentro de `services.<name>.networks.<network>.aliases` y aclara que son hostnames alternativos **por red**. citeturn209649view1
- Docker también advierte que un alias puede compartirse entre múltiples contenedores o incluso múltiples servicios, y que en ese caso no está garantizado exactamente a cuál resolverá el nombre. citeturn209649view1
- la referencia de redes documenta `internal: true` para crear una red aislada externamente, lo cual importa cuando pensás nombres y conectividad dentro de un segmento cerrado. citeturn209649view4

---

## Primer concepto: el nombre del servicio ya suele resolver el problema

Tomá este stack simple:

```yaml
services:
  app:
    image: miusuario/app:dev

  db:
    image: postgres:18
```

Sin agregar nada más, lo normal es que `app` pueda alcanzar a `db` usando:

```text
db
```

como hostname.

La guía oficial de networking y la Quickstart de Compose trabajan justamente con esta idea: los servicios se encuentran por su nombre dentro de la red compartida. citeturn728815view1turn209649view2

---

## Qué enseñanza deja esto

Deja una regla muy sana:

> antes de inventar un alias o tocar `hostname`, preguntate si el nombre del servicio ya es suficientemente claro.

Muchas veces la respuesta es sí.

Por ejemplo:

- `db`
- `redis`
- `api`
- `proxy`

suelen ser nombres más que suficientes dentro del stack.

---

## Segundo concepto: qué hace `hostname`

La referencia de servicios documenta:

```yaml
hostname: my-host
```

y explica que `hostname` declara un nombre de host custom para el contenedor. citeturn209649view0

Un ejemplo:

```yaml
services:
  app:
    image: miusuario/app:dev
    hostname: app-runtime
```

---

## Cómo leer `hostname`

La lectura conceptual sería:

- el contenedor pasa a tener un hostname custom
- ese nombre aplica a ese contenedor
- pero no necesariamente cambia la forma más sana de descubrirlo desde otros servicios

Y acá está el punto importante:
`hostname` no debería usarse como reemplazo automático del nombre del servicio cuando el nombre del servicio ya encaja bien con el diseño.

---

## Cuándo podría tener sentido `hostname`

Puede tener sentido cuando:

- necesitás un hostname más específico para un software particular
- querés que el proceso dentro del contenedor se identifique con un nombre concreto
- tenés una necesidad de compatibilidad con tooling que mira el hostname local del contenedor

Pero para service discovery básico entre servicios Compose, muchas veces no hace falta tocarlo.

---

## Tercer concepto: qué hacen los `aliases`

La referencia de servicios documenta que `aliases` declara hostnames alternativos para el servicio **en una red concreta**, y que otros contenedores de esa red pueden usar tanto el nombre del servicio como cualquiera de esos aliases. citeturn209649view1

Un ejemplo sencillo:

```yaml
services:
  backend:
    image: example/backend
    networks:
      back-tier:
        aliases:
          - database

networks:
  back-tier:
```

---

## Cómo se lee esto

La lectura conceptual sería:

- el servicio sigue llamándose `backend`
- dentro de la red `back-tier`, otros servicios también pueden alcanzarlo como `database`
- el alias no reemplaza el nombre del servicio
- simplemente agrega un nombre alternativo

Esto es muy distinto de renombrar el servicio.

---

## Cuarto concepto: los aliases son por red

Este es el punto más importante del tema.

Docker lo documenta explícitamente: los aliases son **network-scoped**, por lo que el mismo servicio puede tener aliases distintos según la red. citeturn209649view1

Por ejemplo:

```yaml
services:
  backend:
    image: example/backend
    networks:
      back-tier:
        aliases:
          - database
      admin:
        aliases:
          - mysql

networks:
  back-tier:
  admin:
```

La propia referencia oficial da un ejemplo de este estilo: en una red el servicio `backend` puede ser alcanzado como `database`, y en otra como `mysql`. citeturn209649view1

---

## Qué enseñanza deja esto

Deja una idea muy útil:

> el alias no es una propiedad “global mágica” del servicio.  
> vive dentro del contexto de una red.

Eso significa que:

- un alias puede ser útil para un grupo de servicios
- y otro alias distinto puede ser útil para otro grupo
- sin que tengas que duplicar servicios ni cambiar sus nombres base

---

## Un ejemplo bastante realista

Imaginá este stack:

```yaml
services:
  frontend:
    image: example/webapp
    networks:
      - front-tier
      - back-tier

  monitoring:
    image: example/monitoring
    networks:
      - admin

  backend:
    image: example/backend
    networks:
      back-tier:
        aliases:
          - database
      admin:
        aliases:
          - mysql

networks:
  front-tier: {}
  back-tier: {}
  admin: {}
```

Docker muestra justamente esta idea en la referencia de servicios. citeturn209649view1

### Cómo se lee
- `frontend` ve a `backend` como `backend` o `database` dentro de `back-tier`
- `monitoring` ve a `backend` como `backend` o `mysql` dentro de `admin`

Eso muestra por qué los aliases son más finos que simplemente renombrar el servicio.

---

## Cuándo tiene sentido usar aliases

Suele tener mucho sentido cuando:

- un nombre alternativo mejora claridad en una red concreta
- querés mantener compatibilidad con un nombre esperado por otra parte del sistema
- un mismo servicio cumple un rol distinto según el segmento de red
- querés desacoplar un poco el nombre del servicio del nombre funcional con el que otros lo consumen

Por ejemplo:

- `backend` como servicio técnico
- `database` como nombre funcional en la red de app
- `mysql` como nombre esperado por otra herramienta de monitoreo o legacy

---

## Cuándo no hace falta usar aliases

No hace falta cuando el nombre del servicio ya es suficientemente claro.

Por ejemplo, si tenés:

```yaml
services:
  db:
    image: postgres:18
```

agregar:

```yaml
aliases:
  - db
```

no te da nada.

Y agregar algo como:

```yaml
aliases:
  - database
```

solo tiene sentido si de verdad mejora la lectura o compatibilidad.
Si no, suma ruido.

---

## Qué riesgo tiene abusar de aliases

Docker advierte algo importante: un alias puede compartirse entre varios contenedores o incluso múltiples servicios, y en ese caso no está garantizado exactamente a qué contenedor resolverá ese nombre. citeturn209649view1

Eso significa que no conviene:

- tirar aliases repetidos sin criterio
- usar el mismo alias para demasiadas cosas
- asumir que un alias compartido siempre va a resolver exactamente como esperabas

La regla sana es:
**un alias debería ayudar, no volver ambiguo el stack**.

---

## Qué relación tiene esto con `links`

La guía de networking en Compose menciona `links` y explica que permiten aliases extra, pero también deja claro que **no son necesarios** para que los servicios se comuniquen, porque por defecto ya pueden alcanzarse por nombre. citeturn209649view2

Eso es útil porque te deja una enseñanza muy simple:

- primero pensá en la red normal y el nombre del servicio
- después, si realmente necesitás un nombre alternativo, mirá aliases
- no arranques por mecanismos más viejos o más ruidosos si el caso ya está resuelto

---

## Qué relación tiene esto con redes `internal`

La referencia de redes documenta que `internal: true` crea una red aislada externamente. citeturn209649view4

Esto importa en este tema porque los aliases viven dentro de redes concretas.

Entonces, si una red además es `internal`, estás reforzando la idea de:

- nombres útiles dentro del segmento
- sin exposición externa innecesaria

No cambia la semántica de alias.
Pero sí mejora el contexto de aislamiento donde esos nombres viven.

---

## Una regla muy útil

Podés pensar así:

### ¿El nombre del servicio ya alcanza?
Usalo y no agregues nada más.

### ¿Necesitás un nombre alternativo dentro de una red concreta?
Pensá en `aliases`.

### ¿Necesitás cambiar el hostname local del contenedor por una razón puntual?
Pensá en `hostname`.

### ¿Estás agregando nombres solo “porque sí”?
Probablemente estás metiendo ruido innecesario.

Esta regla te evita sobrecomplicar el stack.

---

## Qué no tenés que confundir

### `hostname` no es lo mismo que `aliases`
Uno define el hostname del contenedor; el otro agrega nombres alternativos en una red. citeturn209649view0turn209649view1

### `aliases` no reemplaza el nombre del servicio
El nombre del servicio sigue existiendo y sigue siendo un punto de acceso normal. citeturn209649view1turn728815view1

### Un alias no es global a todo el proyecto
Es por red. citeturn209649view1

### `links` no son necesarios para comunicación básica
La comunicación básica por nombre ya existe por defecto. citeturn209649view2turn728815view1

---

## Error común 1: agregar aliases para todos los servicios sin una razón concreta

Eso suele hacer el stack más ruidoso, no más claro.

---

## Error común 2: creer que `hostname` reemplaza el nombre del servicio como forma estándar de descubrimiento

No es esa su función principal.

---

## Error común 3: olvidar que un alias es network-scoped

Eso puede llevarte a esperar que un nombre funcione en una red donde en realidad no fue definido. citeturn209649view1

---

## Error común 4: reutilizar el mismo alias en demasiados lugares

Docker advierte que el resultado puede volverse ambiguo. citeturn209649view1

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Mirá este ejemplo:

```yaml
services:
  backend:
    image: example/backend
    networks:
      back-tier:
        aliases:
          - database
      admin:
        aliases:
          - mysql

networks:
  back-tier: {}
  admin: {}
```

Respondé con tus palabras:

- cuál es el nombre del servicio
- qué alias tiene en `back-tier`
- qué alias tiene en `admin`
- por qué esos aliases no son globales a todas las redes

### Ejercicio 2
Ahora pensá este caso:

```yaml
services:
  db:
    image: postgres:18
```

Respondé:

- por qué muchas veces `db` ya alcanza como hostname interno
- en qué caso agregarías un alias como `database`
- en qué caso no lo harías

### Ejercicio 3
Respondé además:

- qué hace `hostname`
- qué hace `aliases`
- por qué no son la misma cosa
- por qué `links` no son necesarios para la comunicación básica entre servicios Compose

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué servicios hoy ya tienen nombres suficientemente claros
- si hay algún caso donde un alias sí mejoraría compatibilidad o legibilidad
- si hoy estás agregando nombres extra sin demasiado criterio
- en qué red concreta tendría sentido un alias diferente
- qué naming te gustaría simplificar primero

No hace falta escribir todavía el `compose.yaml` final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre nombre de servicio, hostname y alias?
- ¿en qué proyecto tuyo hoy estás metiendo más nombres de los necesarios?
- ¿qué alias te parecería realmente útil y cuál sería puro ruido?
- ¿qué parte del tema de network scope te parece más importante recordar?
- ¿qué mejora concreta te gustaría notar al simplificar el naming interno del stack?

Estas observaciones valen mucho más que memorizar claves YAML.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si el nombre del servicio ya es suficientemente claro, probablemente me conviene usar simplemente el ________ del servicio.  
> Si necesito un nombre alternativo dentro de una red concreta, probablemente me conviene usar ________.  
> Si necesito cambiar el hostname local del contenedor por una razón puntual, probablemente me conviene usar ________.

Y además respondé:

- ¿por qué este tema mejora la claridad del networking interno?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no agregar aliases de más?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- distinguir mejor nombre de servicio, `hostname` y `aliases`
- entender que los aliases son por red
- usar nombres alternativos solo cuando realmente aportan
- evitar naming innecesariamente ruidoso dentro del stack
- pensar la resolución de nombres de una forma bastante más clara

---

## Resumen del tema

- Por defecto, los servicios Compose ya pueden alcanzarse por su nombre de servicio dentro de la red compartida. citeturn728815view1turn209649view2
- `hostname` define un hostname custom para el contenedor. citeturn209649view0
- `aliases` agrega hostnames alternativos para el servicio dentro de una red concreta. citeturn209649view1
- Los aliases son network-scoped, así que el mismo servicio puede tener aliases distintos según la red. citeturn209649view1
- Docker advierte que aliases compartidos entre múltiples contenedores o servicios pueden volverse ambiguos. citeturn209649view1
- `links` no son necesarios para comunicación básica, porque el nombre del servicio ya resuelve ese problema por defecto. citeturn209649view2turn728815view1
- Este tema te deja una base mucho más clara para usar nombres extra solo cuando realmente suman.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque con otra capa muy práctica de networking:

- resolución estable
- IPs fijas
- cuándo evitarlas
- y por qué normalmente conviene seguir prefiriendo nombres y redes bien diseñadas antes que pelearte con direcciones manuales
