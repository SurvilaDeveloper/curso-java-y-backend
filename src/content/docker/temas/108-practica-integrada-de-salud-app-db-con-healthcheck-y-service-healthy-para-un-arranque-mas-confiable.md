---
title: "Práctica integrada de salud: app + db con HEALTHCHECK y service_healthy para un arranque más confiable"
description: "Tema 108 del curso práctico de Docker: una práctica integrada donde combinás healthchecks, estados healthy/unhealthy, docker ps, inspect y depends_on con service_healthy para que un stack app + db arranque con mucha menos carrera e incertidumbre."
order: 108
module: "Salud, readiness y arranque confiable"
level: "intermedio"
draft: false
---

# Práctica integrada de salud: app + db con HEALTHCHECK y service_healthy para un arranque más confiable

## Objetivo del tema

En este tema vas a:

- juntar en una sola práctica varias ideas del bloque de salud y readiness
- usar un healthcheck real para una base de datos
- diferenciar mejor entre contenedor corriendo y servicio listo
- usar `depends_on` con `service_healthy`
- mirar el estado de salud con `docker ps` e `inspect`
- terminar con un arranque app + db bastante más confiable

La idea es cerrar este bloque con un caso súper realista: una `app` que depende de `db` y que no debería arrancar “por fe”, sino cuando la base realmente está lista.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. partir de un stack `app + db` con una carrera de arranque clásica
2. agregar un healthcheck real a `db`
3. usar `service_healthy` para que `app` espere readiness real
4. mirar cómo cambia el arranque del stack
5. revisar el estado de salud desde Docker
6. construir una regla práctica para stacks más confiables

---

## Idea central que tenés que llevarte

Ya viste que:

- `running` no significa necesariamente “listo”
- `HEALTHCHECK` agrega una comprobación de salud real
- Compose no espera readiness por defecto
- `service_healthy` puede evitar carreras de arranque

Este tema junta todo eso en una práctica muy simple:

> si una app depende de una base, no alcanza con que la base “esté corriendo”;  
> conviene esperar a que esté realmente saludable antes de arrancar la app.

---

## Escenario del tema

Vas a imaginar este stack:

- `db`: PostgreSQL
- `app`: una aplicación que necesita conectarse a `db` al arrancar

Querés evitar el problema clásico:

- `db` ya está running como contenedor
- pero todavía no acepta conexiones
- `app` arranca igual
- falla o queda inestable
- y el problema parece raro aunque en realidad era solo una carrera de arranque

Este es exactamente el tipo de problema que este bloque busca corregir.

---

## Primera versión: funciona a veces, pero arranca por fe

Imaginá este Compose:

```yaml
services:
  db:
    image: postgres:18
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: mysecretpassword

  app:
    image: miusuario/app:dev
    environment:
      DB_HOST: db
      DB_PORT: 5432
    depends_on:
      - db
```

---

## Qué problema tiene esta primera versión

Puede funcionar algunas veces.
Pero también puede fallar por una razón muy simple:

- Compose arranca `db` antes que `app`
- pero eso no significa que `db` ya esté lista para aceptar conexiones
- `app` puede salir a hablarle demasiado pronto

O sea:
el orden básico de inicio no resuelve readiness real.

---

## Paso 1: agregar healthcheck a `db`

Ahora imaginá esta mejora:

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
      timeout: 10s
      retries: 5
      start_period: 30s
```

---

## Cómo se lee este healthcheck

La lectura conceptual sería:

- Docker va a ejecutar `pg_isready` dentro del contenedor
- el check pregunta si PostgreSQL ya está aceptando conexiones de forma razonable
- mientras eso no ocurra, el servicio puede seguir en `starting`
- si varias comprobaciones fallan seguidas, puede quedar `unhealthy`
- cuando una comprobación tiene éxito, pasa a `healthy`

Este ya es un criterio de salud mucho mejor que “el proceso existe”.

---

## Qué aporta `start_period`

`start_period` es especialmente útil porque PostgreSQL puede necesitar tiempo real para inicializarse.

En vez de penalizarlo de inmediato por no responder durante el bootstrap, le das una ventana razonable para levantar antes de contar fallos en serio.

Eso evita muchos `unhealthy` prematuros en servicios que en realidad solo estaban tardando en arrancar.

---

## Paso 2: hacer que `app` espere salud real

Ahora mejorás `depends_on` así:

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
      timeout: 10s
      retries: 5
      start_period: 30s

  app:
    image: miusuario/app:dev
    environment:
      DB_HOST: db
      DB_PORT: 5432
    depends_on:
      db:
        condition: service_healthy
```

---

## Qué mejora introduce esto

Introduce algo muy importante:

- `app` ya no arranca solo porque `db` se creó o pasó a running
- `app` arranca cuando `db` ya superó su check de salud
- el stack deja de depender tanto de la suerte del timing

Esto vuelve muchísimo más confiable el arranque.

---

## Stack final de la práctica

Mirá el resultado integrado:

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
      timeout: 10s
      retries: 5
      start_period: 30s

  app:
    image: miusuario/app:dev
    environment:
      DB_HOST: db
      DB_PORT: 5432
    depends_on:
      db:
        condition: service_healthy
```

---

## Cómo se lee este stack final

La lectura conceptual sería:

- `db` no solo existe: también se mide su disponibilidad real
- `app` no sale a conectarse “por reflejo”
- Compose espera una señal mucho más útil que simple running
- el orden de arranque ya se acerca más a la realidad operativa del stack

Este patrón ya se siente muchísimo más sólido.

---

## Paso 3: cómo mirar el estado de salud

Una vez levantado el stack, hay dos formas muy útiles de mirar qué está pasando.

### Ver pista rápida en `docker ps`

```bash
docker ps
```

Si el contenedor tiene healthcheck, Docker puede mostrar algo como:

- `Up ... (health: starting)`
- `Up ... (healthy)`
- `Up ... (unhealthy)`

### Ver detalle real en `inspect`

```bash
docker inspect --format '{{.State.Health.Status}}' nombre-del-contenedor
```

Y si querés más detalle:

```bash
docker inspect --format '{{json .State.Health}}' nombre-del-contenedor
```

---

## Qué gana `inspect` en este tema

Gana muchísimo porque no solo te da el estado final.

También te deja ver:

- historial de checks
- salida corta del probe
- racha de fallos

Eso te ayuda a responder mejor cosas como:

- ¿está fallando porque el timeout es corto?
- ¿todavía está en bootstrap?
- ¿el comando del healthcheck está mal?
- ¿el servicio realmente no está listo?

---

## Qué te enseña realmente esta práctica

Te enseña a pensar arranque así:

- proceso vivo
- salud real
- readiness real
- dependencia esperando de forma explícita

O sea:
**la confiabilidad del stack mejora cuando el orden de arranque se apoya en salud real y no solo en “ya se levantó el contenedor”**.

---

## Qué no tenés que confundir

### `depends_on` solo no resuelve readiness
Ordena el arranque, pero no garantiza que el servicio ya acepte conexiones.

### `running` no es lo mismo que `healthy`
Un contenedor puede estar vivo y aun así no estar listo.

### Un healthcheck no reemplaza buen diseño de bootstrap
Ayuda muchísimo, pero no arregla una app mal pensada por completo.

### `service_healthy` tampoco reemplaza observabilidad
Sigue siendo útil mirar `docker ps` e `inspect` para entender qué pasó realmente.

---

## Error común 1: dejar `depends_on` simple y asumir que alcanza

Ese es justamente el origen de muchas carreras del tipo `app` vs `db`.

---

## Error común 2: usar un probe que no representa salud real

Por ejemplo, un comando que siempre da éxito aunque el servicio todavía no esté usable.

---

## Error común 3: no darle tiempo de arranque con `start_period`

Eso puede marcar unhealthy demasiado pronto en servicios que en realidad solo tardan un poco más.

---

## Error común 4: mirar solo “running” y no revisar `.State.Health`

Ahí te perdés la mitad de la historia.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Tomá este stack final:

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
      timeout: 10s
      retries: 5
      start_period: 30s

  app:
    image: miusuario/app:dev
    environment:
      DB_HOST: db
      DB_PORT: 5432
    depends_on:
      db:
        condition: service_healthy
```

### Ejercicio 2
Respondé con tus palabras:

- qué problema resuelve el healthcheck de `db`
- por qué `service_healthy` es mejor que solo `depends_on: - db`
- qué gana `app` al esperar una base healthy en vez de solo running

### Ejercicio 3
Respondé además:

- qué rol cumplen `interval`, `timeout`, `retries` y `start_period`
- cómo mirarías el estado de salud en `docker ps`
- cómo mirarías el detalle real en `inspect`
- qué te diría un `healthy` que no te dice simplemente `running`

### Ejercicio 4
Imaginá que `db` tarda más de lo esperado en levantar.
Respondé:

- qué parámetro tocarías primero si el problema fuera bootstrap lento
- por qué eso sería mejor que sacar el healthcheck por frustración

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué dependencia hoy te genera más carreras de arranque
- qué comando usarías como healthcheck representativo
- si hoy te falta más un healthcheck o más un `service_healthy`
- qué servicio te gustaría volver más confiable primero
- qué mejora concreta te gustaría notar al aplicar esta lógica

No hace falta escribir todavía tu Compose final real.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre “corre” y “está listo”?
- ¿en qué proyecto tuyo hoy `service_healthy` te ahorraría más errores?
- ¿qué probe te parece más representativo de salud real?
- ¿qué parte del tuning te parece más delicada: timeout, retries o start period?
- ¿qué mejora concreta te gustaría notar al tener un arranque más confiable?

Estas observaciones valen mucho más que memorizar YAML.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero medir readiness real de un servicio, probablemente me conviene usar un ________.  
> Si una app depende de otra que todavía puede estar arrancando, probablemente me conviene usar `depends_on` con `condition: ________`.  
> Si quiero dar tiempo de bootstrap antes de contar fallos serios, probablemente me conviene ajustar `________`.  
> Si quiero ver por qué un contenedor quedó unhealthy, probablemente me conviene inspeccionar `________.Health`.

Y además respondé:

- ¿por qué esta práctica te parece mucho más confiable que arrancar “por fe”?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no confundir contenedor vivo con servicio listo?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- combinar healthcheck y `service_healthy` en una misma práctica real
- distinguir mejor `running`, `starting`, `healthy` y `unhealthy`
- mirar salud desde `docker ps` e `inspect`
- evitar muchas carreras de arranque típicas de `app + db`
- diseñar stacks bastante más confiables de punta a punta

---

## Resumen del tema

- `HEALTHCHECK` agrega una comprobación de salud real al contenedor y le da un estado adicional de salud. citeturn331647view0
- Los estados principales son `starting`, `healthy` y `unhealthy`. citeturn331647view0
- Compose puede definir `healthcheck` a nivel de servicio y usar `depends_on.condition: service_healthy` para esperar readiness real. citeturn331647view1turn444871view1
- `docker ps` da una pista útil del estado de salud, y `docker inspect` permite ver el detalle completo bajo `.State.Health`. citeturn331647view2turn331647view0
- Esta práctica te deja una forma mucho más madura y confiable de arrancar stacks donde un servicio depende de otro.

---

## Próximo tema

En el próximo bloque vas a empezar a moverte hacia otra capa muy importante del trabajo real con Docker:

- networking y exposición segura más fina
- publicación de puertos con más criterio
- localhost vs 0.0.0.0
- y cómo reducir superficie expuesta sin romper el acceso que sí necesitás
