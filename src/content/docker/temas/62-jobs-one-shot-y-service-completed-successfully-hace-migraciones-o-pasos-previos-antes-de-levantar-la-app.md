---
title: "Jobs one-shot y service_completed_successfully: hacé migraciones o pasos previos antes de levantar la app"
description: "Tema 62 del curso práctico de Docker: cómo usar servicios one-shot en Docker Compose para tareas como migraciones o inicializaciones, y cómo combinar depends_on con condition: service_completed_successfully para que la aplicación espere a que esos pasos terminen correctamente."
order: 62
module: "Healthchecks y readiness para stacks más confiables"
level: "intermedio"
draft: false
---

# Jobs one-shot y service_completed_successfully: hacé migraciones o pasos previos antes de levantar la app

## Objetivo del tema

En este tema vas a:

- entender qué problema resuelven los servicios one-shot
- distinguir un servicio de larga vida de un job que debe terminar
- usar `condition: service_completed_successfully`
- pensar migraciones o pasos previos con más criterio
- evitar stacks donde la app arranca antes de que un paso previo termine bien

La idea es que no todo en Compose te parezca “un contenedor que queda corriendo”, porque algunos servicios tienen más sentido como tareas que ejecutan algo y terminan.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender qué es un job one-shot en Compose
2. ver por qué `service_started` o `service_healthy` no siempre resuelven el problema correcto
3. usar `service_completed_successfully`
4. modelar un caso de migración previa al arranque de la app
5. construir una regla práctica para decidir cuándo una dependencia tiene que estar sana y cuándo tiene que terminar bien

---

## Idea central que tenés que llevarte

Hasta ahora viste dependencias que tenían que estar listas para seguir corriendo:

- base de datos
- cache
- API auxiliar

Pero hay otro tipo de dependencia muy común:

- una migración
- una inicialización
- una tarea de seed
- un job que prepara algo y termina

En esos casos, no alcanza con que el servicio “esté running” ni siempre con que “esté healthy”.

Dicho simple:

> a veces una dependencia no tiene que quedar viva,  
> tiene que **terminar correctamente** antes de que el siguiente servicio arranque.

---

## Qué problema resuelve este tema

Imaginá este caso:

- `db` arranca
- `migrate` ejecuta migraciones
- `app` depende de que esas migraciones hayan terminado bien

Si la app arranca antes, puede pasar que:

- las tablas todavía no existan
- falten cambios de esquema
- la app rompa al iniciar
- el stack “suba”, pero quede mal preparado

Este es un caso muy común en aplicaciones reales.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker Compose explica que `depends_on` en sintaxis larga admite varias condiciones, entre ellas `service_started`, `service_healthy` y `service_completed_successfully`. Docker define `service_completed_successfully` como la condición donde la dependencia debe ejecutarse y terminar con éxito antes de arrancar el servicio dependiente. También documenta que el comando `docker compose wait` bloquea hasta que uno o más servicios terminen, y que `docker compose up --wait` espera a que los servicios estén running o healthy, lo cual sirve para otros escenarios pero no reemplaza la idea de una tarea one-shot que debe completar su trabajo. citeturn854796view0turn854796view1turn544123search1turn854796view2

---

## Primer concepto: no todo servicio debe vivir para siempre

En Compose solemos pensar en servicios como:

- `db`
- `redis`
- `web`
- `api`

o sea, contenedores que arrancan y siguen vivos.

Pero una migración no siempre pertenece a esa categoría.

A veces lo correcto es pensarla como:

- corre
- hace su trabajo
- termina
- deja al stack listo para seguir

Ese cambio mental es muy importante.

---

## Qué diferencia hay entre un servicio normal y un job one-shot

### Servicio normal
- arranca
- sigue corriendo
- representa algo que atiende tráfico, conexiones o trabajo continuo

### Job one-shot
- arranca
- ejecuta una tarea puntual
- termina
- su éxito o fracaso importa para lo que viene después

Esto hace que `service_completed_successfully` tenga un rol muy distinto de `service_healthy`.

---

## Por qué service_healthy no resuelve este caso

`service_healthy` sirve cuando una dependencia debe seguir viva y además estar lista.

Eso encaja perfecto con:

- bases de datos
- caches
- servicios HTTP
- brokers

Pero una migración no necesita “quedar saludable”.
Necesita:

- correr
- terminar bien
- y recién entonces dejar pasar a la app

Ahí entra `service_completed_successfully`.

---

## Qué significa service_completed_successfully

Docker lo documenta explícitamente dentro de `depends_on`: esta condición expresa que la dependencia debe correr hasta completarse con éxito antes de arrancar el servicio dependiente. citeturn854796view0turn854796view1

Traducido a la práctica:

- el job previo no tiene que seguir corriendo
- lo que importa es su finalización exitosa
- la app arranca solo después de eso

---

## Ejemplo mental del flujo correcto

Podés imaginar el flujo así:

1. arranca `db`
2. `db` se pone healthy
3. arranca `migrate`
4. `migrate` corre migraciones y termina con éxito
5. recién ahí arranca `app`

Esto ya se parece muchísimo a una aplicación real.

---

## Un stack integrado con db + migrate + app

Mirá este ejemplo:

```yaml
services:
  db:
    image: postgres:18
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: mysecretpassword
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 10s
      retries: 5
      start_period: 30s
      timeout: 10s

  migrate:
    image: miusuario/app:dev
    depends_on:
      db:
        condition: service_healthy
    command: npm run migrate

  app:
    image: miusuario/app:dev
    depends_on:
      migrate:
        condition: service_completed_successfully
    command: npm run start
```

---

## Cómo se lee este stack

La lectura conceptual sería:

- `db` tiene que estar realmente lista
- `migrate` espera a que `db` esté healthy
- `migrate` ejecuta una tarea puntual y termina
- `app` no arranca hasta que `migrate` termine bien

Esto junta perfectamente dos tipos distintos de dependencia:

- una dependencia que debe estar saludable
- una dependencia que debe completarse con éxito

---

## Qué ventaja tiene este patrón

Te da varias ventajas importantes:

- modela mejor el flujo real del sistema
- evita que la app arranque demasiado pronto
- separa claramente “infraestructura lista” de “paso previo completado”
- hace más explícita la intención del stack

Esto es mucho mejor que tratar de resolver todo con puro orden de arranque.

---

## Qué pasa si migrate falla

Si `migrate` no termina correctamente, la condición `service_completed_successfully` no se satisface.

Entonces:

- `app` no debería arrancar como si nada
- el stack te obliga a reconocer que faltó un paso previo crítico

Eso es justamente lo que querés en muchos casos de migración o inicialización.

---

## Qué papel juega db en esta historia

Fijate que `db` resuelve un problema distinto de `migrate`.

### `db`
tiene que estar **healthy** porque es un servicio continuo.

### `migrate`
tiene que **terminar bien** porque es un job puntual.

Esta diferencia es una de las enseñanzas más valiosas del tema.

---

## Qué no tenés que confundir

### service_started
Significa “arrancó”.

### service_healthy
Significa “arrancó y pasó su healthcheck”.

### service_completed_successfully
Significa “corrió y terminó con éxito”. citeturn854796view0turn854796view1

Parecen parecidas, pero resuelven problemas distintos.

---

## Cuándo conviene service_completed_successfully

Suele tener mucho sentido para:

- migraciones de base
- seeding inicial
- jobs de preparación
- tareas de generación previa
- pasos que deben ejecutarse una vez y terminar bien antes de seguir

En general, todo lo que conceptualmente sea un “paso previo” más que un “servicio continuo”.

---

## Cuándo no conviene usarlo

No conviene para cosas que deberían quedar vivas atendiendo trabajo.

Por ejemplo:

- PostgreSQL
- Redis
- una API web
- un broker
- un backend normal

Para ese tipo de dependencia tiene mucho más sentido pensar en `service_started` o `service_healthy`.

---

## Qué relación tiene esto con docker compose wait

Docker documenta `docker compose wait` como un comando que bloquea hasta que uno o más servicios terminen. citeturn544123search1

Está bueno conocerlo porque encaja naturalmente con el mundo de jobs y servicios one-shot.

Pero no reemplaza la lógica declarativa dentro del `compose.yaml`.

La idea de este tema sigue siendo que el propio stack exprese la dependencia entre:

- job previo
- y servicio final

---

## Qué relación tiene esto con docker compose up --wait

Docker documenta `docker compose up --wait` como una forma de esperar a que los servicios estén running o healthy. citeturn854796view2

Eso puede ser útil para ciertos flujos, pero no resuelve por sí solo la semántica de:

- “este job debe terminar exitosamente antes de arrancar otro servicio”

Ahí la pieza central sigue siendo `service_completed_successfully`.

---

## Un criterio muy útil

Preguntate esto:

> “¿Esta dependencia tiene que seguir viva o tiene que terminar bien?”

### Si tiene que seguir viva
Pensá en `service_started` o `service_healthy`.

### Si tiene que terminar bien
Pensá en `service_completed_successfully`.

Esta pregunta sola ordena muchísimo.

---

## Una versión todavía más clara del patrón

Podrías pensarlo así:

```yaml
services:
  db:
    ...

  migrate:
    depends_on:
      db:
        condition: service_healthy
    ...

  app:
    depends_on:
      migrate:
        condition: service_completed_successfully
    ...
```

Esta cadena de dependencias expresa algo muy cercano a un flujo real:

- base lista
- migración completada
- app arrancando después

---

## Qué no tenés que confundir

### service_completed_successfully no significa “quedó healthy”
Significa que el contenedor terminó con éxito.

### Un job one-shot no es “un servicio roto porque se apagó”
En este patrón, que termine es justamente lo esperable.

### docker compose up --wait no reemplaza la idea de una tarea previa que debe finalizar
Sirve para otros tipos de espera.

### Un stack bien modelado no trata todos los servicios como si fueran iguales
Algunos deben quedar vivos; otros deben completar un paso y terminar.

---

## Error común 1: tratar una migración como si fuera un servicio continuo

Eso suele volver confuso el stack.

---

## Error común 2: usar service_healthy para algo que en realidad tendría que terminar

La salud no siempre representa bien el objetivo de un job one-shot.

---

## Error común 3: arrancar la app apenas la base está sana, olvidando que falta un paso previo crítico

Ese es exactamente el caso donde `service_completed_successfully` aporta valor.

---

## Error común 4: pensar que un contenedor que terminó siempre significa error

En un job puntual, terminar bien puede ser el comportamiento correcto y esperado.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Leé este stack:

```yaml
services:
  db:
    image: postgres:18
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: mysecretpassword
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 10s
      retries: 5
      start_period: 30s
      timeout: 10s

  migrate:
    image: miusuario/app:dev
    depends_on:
      db:
        condition: service_healthy
    command: npm run migrate

  app:
    image: miusuario/app:dev
    depends_on:
      migrate:
        condition: service_completed_successfully
    command: npm run start
```

### Ejercicio 2
Respondé con tus palabras:

- qué problema resuelve `service_healthy` en `db`
- qué problema resuelve `service_completed_successfully` en `migrate`
- por qué `app` no debería arrancar antes de que `migrate` termine bien
- por qué este stack expresa mejor la realidad del sistema

### Ejercicio 3
Respondé además:

- cuándo usarías `service_started`
- cuándo usarías `service_healthy`
- cuándo usarías `service_completed_successfully`

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- si tenés algún paso previo que debería correr antes de levantar la app
- si ese paso es más parecido a una migración o a un servicio continuo
- qué dependencia debería estar healthy antes
- qué job debería completarse con éxito antes
- qué valor práctico te daría modelarlo así en Compose

No hace falta escribir todavía el stack final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre salud y finalización exitosa?
- ¿qué paso previo de tus proyectos hoy está implícito y te gustaría volver explícito?
- ¿qué servicio de tus stacks hoy estás tratando como continuo cuando en realidad es un job?
- ¿qué parte del arranque te gustaría volver más declarativa?
- ¿qué te parece más valioso de este patrón?

Estas observaciones valen mucho más que copiar YAML.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si una dependencia tiene que seguir viva y lista, probablemente me conviene ________.  
> Si una dependencia tiene que ejecutar un paso y terminar bien antes de seguir, probablemente me conviene ________.

Y además respondé:

- ¿por qué este patrón te parece más cercano a un sistema real?
- ¿qué job de tus proyectos te gustaría modelar primero así?
- ¿qué ventaja te da separar “servicio continuo” de “tarea previa”?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- distinguir mejor un servicio continuo de un job one-shot
- usar `service_completed_successfully` con más criterio
- combinar `service_healthy` y `service_completed_successfully` en un mismo stack
- modelar migraciones o pasos previos de forma más realista
- hacer que el arranque de tu stack represente mejor la lógica real del sistema

---

## Resumen del tema

- `service_completed_successfully` sirve para dependencias que deben correr y terminar bien antes de arrancar otra. citeturn854796view0turn854796view1
- `service_started`, `service_healthy` y `service_completed_successfully` resuelven necesidades distintas. citeturn854796view0turn854796view1
- Un patrón muy útil es combinar base healthy + migración completada + app final.
- `docker compose wait` encaja naturalmente con servicios one-shot, pero no reemplaza la lógica declarativa del stack. citeturn544123search1
- `docker compose up --wait` espera running o healthy, pero no expresa por sí solo la necesidad de que un job previo termine exitosamente. citeturn854796view2
- Este tema te ayuda a modelar arranques bastante más cercanos a sistemas reales.

---

## Próximo tema

En el próximo tema vas a seguir avanzando hacia una capa más operativa y robusta:

- reinicios
- políticas de restart
- fallos transitorios
- y cómo hacer que tus servicios se comporten mejor cuando algo sale mal
