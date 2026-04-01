---
title: "Inicialización y seeds sin sorpresas: qué se ejecuta una sola vez y qué no cuando hay volúmenes"
description: "Tema 94 del curso práctico de Docker: cómo pensar scripts de inicialización, seeds y arranque de servicios cuando usás volúmenes persistentes, por qué ciertas inicializaciones solo corren con datos vacíos y cómo evitar confundir primer arranque con reinicios posteriores."
order: 94
module: "Bind mounts, named volumes y persistencia sin mezclar usos"
level: "intermedio"
draft: false
---

# Inicialización y seeds sin sorpresas: qué se ejecuta una sola vez y qué no cuando hay volúmenes

## Objetivo del tema

En este tema vas a:

- entender qué significa realmente “inicializar” un servicio con datos
- distinguir primer arranque de reinicios posteriores
- ver por qué algunos scripts de seed se ejecutan solo una vez
- entender cómo influyen los volúmenes vacíos o ya poblados
- evitar confusiones típicas con bases de datos, seeds y contenedores que se recrean

La idea es que dejes de pensar “el contenedor arrancó de nuevo, entonces debería reinicializar todo” y empieces a mirar qué datos ya existen y qué parte del arranque depende de eso.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender qué pasa cuando un servicio arranca con datos vacíos
2. ver qué cambia cuando el volumen ya tiene datos
3. aprender cómo funciona la inicialización del Official Image de PostgreSQL
4. entender qué scripts corren una sola vez
5. combinar esa lógica con healthchecks y startup order en Compose
6. construir una regla práctica para seeds y datos persistentes

---

## Idea central que tenés que llevarte

Cuando usás persistencia real, el contenedor puede morir y volver.
Pero los datos no necesariamente vuelven a estar vacíos.

Ahí aparece una diferencia muy importante:

- **primer arranque con datos vacíos**
- **arranque posterior con datos ya inicializados**

Y esa diferencia cambia totalmente qué debería ejecutarse.

Dicho simple:

> si el volumen ya tiene datos, muchas “inicializaciones” ya no deberían volver a correr.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker y del Official Image de PostgreSQL deja varias ideas muy claras para este tema:

- los named volumes persisten fuera del ciclo de vida del contenedor, así que destruir el contenedor no destruye automáticamente los datos. Si volvés a montar el mismo volumen, el contenido sigue ahí. Docker también documenta que, si montás un volumen vacío sobre una ruta del contenedor que ya tenía archivos, esos archivos se copian al volumen por defecto; pero si el volumen ya no está vacío, el contenido previo del contenedor queda oculto por el mount. citeturn803719view3turn803719view4turn803719view5
- el Official Image de PostgreSQL ejecuta scripts colocados en `/docker-entrypoint-initdb.d` durante la inicialización, pero **solo si el directorio de datos está vacío**. Soporta `*.sql`, `*.sql.gz` y `*.sh`. Si el directorio ya contiene una base inicializada, esos scripts no vuelven a correr al arrancar el contenedor. citeturn803719view0turn803719view1
- Docker Compose no espera automáticamente a que un servicio esté “listo”; solo espera a que esté corriendo. Para esperar readiness real, la documentación oficial recomienda `depends_on` con `condition: service_healthy` y un `healthcheck` apropiado, por ejemplo `pg_isready` para PostgreSQL. citeturn700681view0
- para PostgreSQL 18+, Docker recomienda montar el volumen en `/var/lib/postgresql`. citeturn700681view4

---

## Primer concepto: persistencia no es lo mismo que “volver a empezar”

Ya viste en el tema anterior que un named volume persiste aunque el contenedor se destruya.

Eso significa que si hacés algo así:

```yaml
services:
  db:
    image: postgres:18
    volumes:
      - db-data:/var/lib/postgresql

volumes:
  db-data:
```

y después recreás el contenedor, los datos del volumen siguen existiendo.

Entonces, al nuevo contenedor no le estás dando “un disco vacío”.
Le estás dando un almacenamiento persistente que ya puede venir con contenido.

---

## Qué cambia eso en la práctica

Cambia muchísimo.

Porque si el servicio ve datos ya inicializados, muchas tareas de bootstrap ya no deberían repetirse, como por ejemplo:

- crear la base inicial
- crear usuarios iniciales
- correr scripts de seed pensados para una base vacía
- aplicar archivos de inicialización de primer arranque

Este es el corazón del tema.

---

## Segundo concepto: volumen vacío vs volumen ya poblado

Docker documenta algo muy importante sobre volumes:

### Si montás un volumen vacío
y la ruta del contenedor ya tenía contenido, Docker copia ese contenido al volumen por defecto.

### Si montás un volumen no vacío
sobre una ruta que ya tenía contenido en la imagen, el contenido previo del contenedor queda oculto por el mount. citeturn803719view3turn803719view4turn803719view5

---

## Qué enseñanza deja esto

Deja una idea muy útil:

> el comportamiento de arranque no depende solo del contenedor,  
> también depende del estado previo del volumen.

Por eso dos arranques “del mismo servicio” pueden comportarse distinto:

- uno con volumen nuevo
- otro con volumen reutilizado

Y ambos pueden ser correctos.

---

## Tercer concepto: cómo inicializa PostgreSQL la primera vez

El Official Image de PostgreSQL documenta que, si querés hacer inicialización adicional, podés colocar scripts bajo:

```text
/docker-entrypoint-initdb.d
```

y el entrypoint los ejecuta después de crear el usuario y la base por defecto con `initdb`. Los tipos soportados incluyen:

- `*.sql`
- `*.sql.gz`
- `*.sh` ejecutables
- `*.sh` no ejecutables, que se sourcean citeturn803719view0turn803719view1

---

## Qué significa esto realmente

Significa que podés preparar seeds o scripts de primer arranque, por ejemplo:

- crear otra base
- crear usuarios extra
- cargar esquema inicial
- insertar datos semilla básicos
- correr lógica shell de preparación

Pero hay una condición fundamental:
**eso está pensado para el momento de inicialización con directorio de datos vacío**.

---

## Cuarto concepto: esos scripts no corren siempre

La documentación del Official Image es muy explícita:

> los scripts de `/docker-entrypoint-initdb.d` solo se ejecutan si el contenedor arranca con un data directory vacío. Si la base ya existía, no se ejecutan nuevamente. citeturn803719view0

Este es uno de los puntos que más confusión generan.

Porque mucha gente hace esto:

1. arranca PostgreSQL con un volumen
2. se ejecutan los scripts
3. reinicia o recrea el contenedor
4. espera que los scripts corran otra vez

Pero si el volumen ya tiene datos, eso no va a pasar.

---

## Qué problema típico aparece acá

Aparece algo como:

- “agregué un script nuevo a `/docker-entrypoint-initdb.d` y no corrió”
- “reinicié el stack y no volvió a seedear”
- “cambié el SQL y no se aplicó al recrear el contenedor”

Y muchas veces la respuesta es:
**el volumen ya no estaba vacío**.

Entonces el sistema no estaba “ignorando” tu script por capricho.
Estaba siguiendo la lógica normal de inicialización una sola vez.

---

## Un detalle importante si un script falla

La documentación del Official Image también advierte algo muy útil:

si uno de los scripts en `/docker-entrypoint-initdb.d` falla y el entrypoint sale con error, un reinicio posterior con el directorio de datos ya inicializado no “continúa” donde quedó. citeturn803719view0

Eso deja una enseñanza muy práctica:

- los scripts de init deberían ser muy cuidadosos
- no conviene tratarlos como si fueran migraciones reintentables infinitamente
- si fallan a mitad de una inicialización, el estado puede quedar en un punto intermedio

---

## Quinto concepto: scripts de init no son lo mismo que migraciones

Esto es muy importante aunque la documentación no lo diga con esas palabras exactas.

Pensalo así:

### Script de init
Está pensado para cuando el sistema arranca desde cero.

### Migración
Está pensada para aplicarse sobre una base ya existente.

Entonces, si querés cambios evolutivos sobre una base persistida, muchas veces eso ya es un problema más de migraciones que de `docker-entrypoint-initdb.d`.

La enseñanza útil del tema es:
**no le pidas al mecanismo de init one-shot que haga el trabajo de un sistema de migraciones**.

---

## Sexto concepto: Compose no espera readiness real por defecto

Docker Compose documenta algo muy importante:

- Compose sí arranca servicios en orden de dependencia
- pero no espera automáticamente a que estén realmente listos
- solo espera a que estén corriendo citeturn700681view0

Esto puede generar el clásico problema:

- `app` arranca
- `db` ya “existe” como contenedor
- pero todavía no está lista para aceptar conexiones

---

## Qué recomienda Docker para eso

La documentación oficial recomienda:

- `healthcheck`
- y `depends_on` con `condition: service_healthy` citeturn700681view0

Por ejemplo, con PostgreSQL:

```yaml
services:
  db:
    image: postgres:18
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 10s
      retries: 5
      start_period: 30s
      timeout: 10s

  app:
    image: miusuario/app:dev
    depends_on:
      db:
        condition: service_healthy
```

---

## Qué te enseña esto junto con los scripts de init

Te enseña algo muy importante:

- una cosa es que `db` ya tenga los datos inicializados
- otra cosa es que esté lista para aceptar conexiones

O sea:
**inicialización de datos** y **readiness del servicio** no son exactamente lo mismo.

Y las dos cosas importan para que el stack arranque bien.

---

## Stack integrado de la práctica

Mirá este ejemplo conceptual:

```yaml
services:
  db:
    image: postgres:18
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: mysecretpassword
    volumes:
      - db-data:/var/lib/postgresql
      - ./db-init:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 10s
      retries: 5
      start_period: 30s
      timeout: 10s

  app:
    image: miusuario/app:dev
    depends_on:
      db:
        condition: service_healthy

volumes:
  db-data:
```

---

## Cómo se lee este stack

La lectura conceptual sería:

- `db-data` persiste los datos reales de PostgreSQL
- `./db-init` monta scripts de inicialización como solo lectura
- esos scripts se ejecutan únicamente si el data directory está vacío
- `app` no arranca hasta que `db` esté healthy
- la inicialización de datos y la readiness quedan tratadas como problemas distintos pero relacionados

Este stack ya expresa una lógica bastante sana.

---

## Qué gana esta práctica

Gana varias cosas a la vez:

- más claridad sobre qué se ejecuta solo la primera vez
- más claridad sobre qué persiste entre recreaciones
- menos sorpresas con seeds que “no volvieron a correr”
- mejor arranque coordinado entre `app` y `db`

Esto te evita muchísimos diagnósticos errados.

---

## Qué no tenés que confundir

### Reiniciar un contenedor no significa reinicializar datos
Si el volumen sigue ahí, los datos siguen ahí.

### `docker-entrypoint-initdb.d` no es un mecanismo para correr seeds en cada arranque
Está pensado para inicialización con directorio de datos vacío. citeturn803719view0

### Que la base exista no significa que ya esté lista
Compose no espera readiness real salvo que vos lo configures. citeturn700681view0

### Un script de init no reemplaza un sistema de migraciones
No resuelve el mismo problema.

---

## Error común 1: agregar un nuevo script a `/docker-entrypoint-initdb.d` y esperar que corra sobre una base ya inicializada

Normalmente no va a pasar porque el directorio de datos ya no está vacío. citeturn803719view0

---

## Error común 2: usar bind mount o volume sin pensar si el dato ya existe o no

El estado del volumen cambia completamente la historia del arranque. citeturn803719view3turn803719view4turn803719view5

---

## Error común 3: creer que `depends_on` por sí solo garantiza que la base ya acepta conexiones

La documentación oficial dice que no; necesitás healthchecks para readiness real. citeturn700681view0

---

## Error común 4: copiar ejemplos viejos de PostgreSQL con rutas antiguas para el volumen

Para PostgreSQL 18+ la ruta recomendada cambió a `/var/lib/postgresql`. citeturn700681view4

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Mirá este servicio:

```yaml
services:
  db:
    image: postgres:18
    volumes:
      - db-data:/var/lib/postgresql
      - ./db-init:/docker-entrypoint-initdb.d:ro

volumes:
  db-data:
```

Respondé con tus palabras:

- qué persiste realmente entre recreaciones del contenedor
- para qué sirve `./db-init`
- qué condición tiene que cumplirse para que esos scripts corran
- por qué no conviene pensar que van a ejecutarse siempre

### Ejercicio 2
Ahora agregá esto:

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
  interval: 10s
  retries: 5
  start_period: 30s
  timeout: 10s
```

y en `app`:

```yaml
depends_on:
  db:
    condition: service_healthy
```

Respondé:

- qué problema resuelve esto
- por qué es distinto del problema de inicialización de datos
- por qué `depends_on` solo no alcanzaba

### Ejercicio 3
Respondé además:

- qué diferencia hay entre un script de init y una migración
- por qué un volumen ya poblado cambia totalmente el comportamiento del arranque
- qué te parece más frágil: asumir que los scripts correrán siempre o diseñar sabiendo que son one-shot

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- si hoy tenés seeds o scripts que deberían correr solo una vez
- si hoy estás confundiendo inicialización con migraciones
- si tu base usa volumen persistente o todavía no
- si tu app espera readiness real o solo arranca “cuando puede”
- qué cambio concreto harías primero para que el arranque sea más predecible

No hace falta escribir todavía el `compose.yaml` final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre primer arranque y reinicio con datos persistidos?
- ¿en qué proyecto tuyo hoy estás esperando que seeds de init corran más veces de las que deberían?
- ¿qué parte del arranque necesita healthcheck y no solo `depends_on`?
- ¿qué script hoy en realidad se comporta más como migración que como init?
- ¿qué mejora concreta te gustaría notar al separar mejor inicialización y readiness?

Estas observaciones valen mucho más que memorizar una ruta de PostgreSQL.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si el directorio de datos ya no está vacío, los scripts de `/docker-entrypoint-initdb.d` normalmente ya no deberían ________.  
> Si quiero que la app espere a que la base realmente acepte conexiones, probablemente me conviene usar ________ y `depends_on` con `condition: ________`.  
> Si necesito cambios evolutivos sobre una base ya existente, probablemente estoy más cerca de un problema de ________ que de un script de init.

Y además respondé:

- ¿por qué este tema impacta tanto en previsibilidad del arranque?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no confundir “primer init” con “cada arranque”?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar qué parte del arranque depende de un volumen vacío y qué parte no
- entender por qué ciertos scripts de init corren solo una vez
- combinar persistencia, init scripts y healthchecks en un mismo stack
- distinguir mejor inicialización de datos, readiness del servicio y migraciones
- pensar el arranque de servicios con bastante más criterio y menos sorpresas

---

## Resumen del tema

- Los named volumes persisten fuera del ciclo de vida del contenedor, así que recrear el contenedor no reinicia automáticamente los datos. citeturn803719view3turn803719view4
- Si montás un volumen vacío sobre una ruta del contenedor que ya tenía archivos, Docker copia ese contenido al volumen por defecto; si el volumen ya no está vacío, el contenido previo del contenedor queda oculto. citeturn803719view3turn803719view4turn803719view5
- El Official Image de PostgreSQL ejecuta scripts en `/docker-entrypoint-initdb.d`, pero solo cuando el directorio de datos está vacío. citeturn803719view0turn803719view1
- Compose no espera readiness real por defecto; para eso conviene usar `healthcheck` y `depends_on` con `condition: service_healthy`. citeturn700681view0
- Para PostgreSQL 18+, la ruta recomendada del volumen es `/var/lib/postgresql`. citeturn700681view4
- Este tema te deja una base mucho más clara para pensar seeds, scripts de init y arranque de servicios con datos persistentes.

---

## Próximo tema

En el próximo bloque vas a empezar a moverte hacia otra capa muy importante del trabajo real con Docker:

- logs
- stdout/stderr
- `docker logs`
- drivers de logging
- y cómo observar mejor lo que realmente está pasando dentro de tus contenedores
