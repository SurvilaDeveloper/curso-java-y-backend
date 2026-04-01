---
title: "Práctica integrada de operación en Compose: app, base, readiness y restart para un stack más robusto"
description: "Tema 64 del curso práctico de Docker: una práctica integrada donde combinás una aplicación, una base de datos, healthchecks, condition: service_healthy y políticas de restart para lograr un arranque más confiable y una mejor reacción ante fallos transitorios."
order: 64
module: "Healthchecks y readiness para stacks más confiables"
level: "intermedio"
draft: false
---

# Práctica integrada de operación en Compose: app, base, readiness y restart para un stack más robusto

## Objetivo del tema

En este tema vas a:

- combinar varias ideas del bloque operativo en una sola práctica
- usar una app que depende de una base de datos
- agregar un `healthcheck` real a la base
- usar `condition: service_healthy`
- definir una política de `restart` razonable para la app
- pensar mejor qué decisiones hacen que un stack sea más confiable

La idea es cerrar este subbloque con una práctica donde no solo importe que el stack “suba”, sino también que arranque con más criterio y reaccione mejor si algo falla.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. crear un stack `app + db`
2. comparar un arranque ingenuo con uno más robusto
3. agregar readiness real a la base
4. elegir una política de restart razonable para la app
5. pensar qué pasaría ante fallos transitorios
6. cerrar el bloque con una práctica bastante realista

---

## Idea central que tenés que llevarte

Ya viste varias piezas importantes por separado:

- `depends_on`
- `healthcheck`
- `condition: service_healthy`
- `restart`

Este tema las junta con una idea muy simple pero poderosa:

> un stack más robusto no solo arranca en mejor orden,  
> también expresa mejor cuándo una dependencia está lista  
> y cómo debería comportarse el servicio si falla después.

---

## Escenario del tema

Vas a trabajar con este caso:

- `db` → PostgreSQL
- `app` → una app que necesita la base

La app tiene dos necesidades distintas:

1. no arrancar antes de que la base esté realmente lista
2. comportarse mejor si falla por un problema transitorio

Eso hace que este tema sea una práctica muy útil y bastante realista.

---

## Primera versión: stack básico

Mirá esta versión:

```yaml
services:
  app:
    build: .
    depends_on:
      - db

  db:
    image: postgres:18
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: mysecretpassword
```

---

## Qué resuelve esta versión

Resuelve un orden básico de arranque:

- `db` arranca antes que `app`

Eso está bien, pero nada más.

---

## Qué problemas deja sin resolver

Sigue dejando dos problemas importantes:

### Problema 1
`db` puede estar corriendo pero todavía no lista.

### Problema 2
Si `app` falla por una condición transitoria, no definiste qué debería hacer después.

Ese es el hueco que este tema viene a completar.

---

## Segunda versión: stack más robusto

Ahora mirá esta variante:

```yaml
services:
  app:
    build: .
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

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
    restart: unless-stopped
```

---

## Qué cambia en esta versión

Cambian dos cosas clave:

### 1. La base ahora expresa salud real
Con `healthcheck`, `db` ya no es solo “un contenedor running”.
Ahora tiene una señal de readiness bastante más útil.

### 2. La app ahora tiene una política de restart
Con `restart: unless-stopped`, el stack expresa mejor qué debería pasar si la app se corta o si Docker vuelve.

Estas dos piezas juntas mejoran bastante el comportamiento real del sistema.

---

## Cómo se lee el healthcheck de db

La idea del check es:

- ejecutar `pg_isready`
- usar el usuario y la base definidos
- confirmar que PostgreSQL ya acepta conexiones

Esto representa mucho mejor el momento en que la app realmente puede empezar a usar la base.

---

## Cómo se lee condition: service_healthy

La idea es:

- `app` depende de `db`
- pero no alcanza con que `db` haya arrancado
- `app` espera a que la base esté healthy

Esa diferencia es central para evitar carreras de arranque.

---

## Cómo se lee restart: unless-stopped

La idea es:

- si `app` o `db` se cortan, Docker intentará relanzarlos
- pero si alguien los detuvo a propósito, no deberían reaparecer solos como si nada

Esto hace que el stack sea más tolerante a ciertos fallos sin perder del todo el control manual.

---

## Por qué esta combinación es tan útil

Porque resuelve dos momentos distintos del ciclo de vida:

### Momento de arranque
`service_healthy` mejora readiness.

### Momento posterior
`restart` mejora reacción ante ciertos cortes o fallos.

Eso ya te hace pensar en el stack no solo como “algo que sube”, sino como algo que:

- arranca mejor
- y además se comporta mejor si algo sale mal

---

## Qué hace que esta práctica sea realista

Porque este patrón aparece muchísimo en aplicaciones de verdad:

- una base que tarda en estar lista
- una app que no debería arrancar demasiado pronto
- un backend o servicio continuo que conviene reponer si falla
- un stack donde no alcanza con puro orden de creación de contenedores

Esta práctica junta justo esas preocupaciones.

---

## Qué servicio debería tener restart y cuál no siempre

Acá ya podés empezar a distinguir mejor.

### `app`
Suele tener sentido que tenga `restart`, porque es un servicio continuo.

### `db`
Muchas veces también, según el caso, porque también es un servicio continuo del stack.

### Un job de migración
No necesariamente. Ahí ya viste que un one-shot suele encajar mejor con `restart: "no"`.

Esto muestra algo muy importante:
no todos los servicios deben reaccionar igual.

---

## Un ejemplo con una app mínima

Podrías imaginar una app muy simple así:

### Dockerfile

```Dockerfile
FROM node:22
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "src/index.js"]
```

### package.json

```json
{
  "name": "app-db-robusta",
  "version": "1.0.0",
  "scripts": {
    "start": "node src/index.js"
  }
}
```

### src/index.js

```javascript
console.log("La app arrancó con una base healthy y una política de restart razonable");
```

No hace falta complejizar el código.
Lo importante sigue siendo el comportamiento del stack.

---

## Qué te enseña esta práctica

Te enseña a pensar algo así:

- la base debe estar realmente lista
- la app no debería adelantarse
- la app además debería tener una política razonable si se corta
- el stack no se modela solo con “quién depende de quién”, sino también con “cuándo está listo” y “cómo reacciona si falla”

Eso ya es un salto importante de madurez.

---

## Qué no tenés que confundir

### readiness y restart no resuelven lo mismo
Uno mejora el arranque.
El otro mejora la reacción ante salidas del contenedor.

### restart no reemplaza healthcheck
Si una dependencia todavía no está lista, reiniciar la app no expresa bien el problema.

### service_healthy no reemplaza toda la robustez interna de la app
La app sigue pudiendo necesitar manejo de errores o reintentos internos.

### no todos los servicios deberían tener la misma política
Un job one-shot no se comporta igual que una API o una base.

---

## Error común 1: creer que con restart ya no hace falta readiness

No.
Podrías terminar relanzando la app varias veces cuando el problema real era que la base todavía no estaba lista.

---

## Error común 2: usar readiness pero olvidarte de qué pasa si la app se corta después

Ese es justamente el lugar donde `restart` empieza a importar.

---

## Error común 3: poner la misma política de restart en todo por costumbre

Eso puede hacer que jobs, migraciones y servicios continuos queden todos modelados de forma demasiado plana.

---

## Error común 4: pensar que un stack robusto es solo uno que “eventualmente arranca”

La idea es que arranque mejor y de forma más explícita, no que dependa de suerte o de reintentos desordenados.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Compará estas dos versiones.

#### Versión A

```yaml
services:
  app:
    build: .
    depends_on:
      - db

  db:
    image: postgres:18
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: mysecretpassword
```

#### Versión B

```yaml
services:
  app:
    build: .
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

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
    restart: unless-stopped
```

### Ejercicio 2
Respondé con tus palabras:

- qué mejora la versión B respecto a la A
- qué problema resuelve `service_healthy`
- qué problema resuelve `restart: unless-stopped`
- por qué ambas cosas resuelven momentos distintos del ciclo de vida del stack

### Ejercicio 3
Respondé además:

- por qué `app` se beneficia de una política de restart
- por qué readiness no alcanza para todo
- por qué restart no alcanza para todo

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué servicio depende críticamente de otro para arrancar bien
- cuál necesitaría un healthcheck más serio
- cuál debería tener una política de restart
- si alguno no debería reiniciarse automáticamente
- qué fallo real te gustaría volver menos problemático con esta combinación

No hace falta escribir todavía el stack final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre “arranca bien” y “se recupera mejor”?
- ¿qué servicio de tus proyectos hoy necesita mejor readiness?
- ¿qué servicio hoy necesita mejor restart policy?
- ¿qué parte del arranque o de la operación estás dejando implícita y te gustaría volver más explícita?
- ¿qué valor práctico ves en combinar ambas cosas?

Estas observaciones valen mucho más que copiar YAML.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero que una dependencia esté realmente lista antes de arrancar otra, probablemente me conviene ________ junto con ________.  
> Si quiero que un servicio continuo vuelva automáticamente salvo que alguien lo haya detenido a propósito, probablemente me conviene ________.

Y además respondé:

- ¿por qué esta práctica te parece más cercana a un stack real?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué parte del comportamiento del stack te parece más importante hacer explícita?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- combinar readiness y restart dentro de un mismo stack
- distinguir qué problema resuelve cada pieza
- pensar mejor app + db como un sistema y no como contenedores aislados
- evitar algunas carreras de arranque y algunos fallos transitorios molestos
- diseñar stacks bastante más confiables desde Compose

---

## Resumen del tema

- `service_healthy` mejora readiness real en dependencias como una base de datos.
- `restart` modela cómo debería reaccionar la plataforma cuando un servicio se corta.
- Ambas piezas resuelven momentos distintos del ciclo de vida del stack.
- Un servicio continuo como una app o una base suele requerir decisiones distintas de las de un job puntual.
- Esta práctica muestra cómo pasar de un stack “que sube” a uno que arranca y reacciona con más criterio.
- El valor del tema está en combinar decisiones pequeñas que juntas vuelven al stack mucho más robusto.

---

## Próximo tema

En el próximo tema vas a seguir avanzando hacia una capa todavía más práctica del día a día:

- señales de salida
- `stop_grace_period`
- apagado ordenado
- y cómo evitar cortes bruscos cuando detenés o recreás servicios
