---
title: "Healthchecks en Dockerfile vs Compose: decidí bien dónde definir la señal de salud"
description: "Tema 60 del curso práctico de Docker: cuándo conviene definir un HEALTHCHECK en el Dockerfile, cuándo conviene sobreescribir o ajustar la salud desde Compose y cómo diseñar una señal reutilizable sin atarla demasiado a un entorno concreto."
order: 60
module: "Healthchecks y readiness para stacks más confiables"
level: "intermedio"
draft: false
---

# Healthchecks en Dockerfile vs Compose: decidí bien dónde definir la señal de salud

## Objetivo del tema

En este tema vas a:

- entender la diferencia entre `HEALTHCHECK` en Dockerfile y `healthcheck` en Compose
- decidir cuándo conviene que la señal de salud viaje con la imagen
- decidir cuándo conviene ajustarla desde el stack
- diseñar checks más reutilizables
- evitar healthchecks demasiado rígidos o demasiado dependientes del entorno

La idea es que no veas la salud del servicio como algo improvisado, sino como parte real del diseño de la imagen y del stack.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. recordar qué problema resuelven los healthchecks
2. ver qué aporta `HEALTHCHECK` en el Dockerfile
3. ver qué aporta `healthcheck` en Compose
4. comparar cuándo conviene cada uno
5. construir una regla práctica para hacer checks más reutilizables

---

## Idea central que tenés que llevarte

Ya viste que un contenedor puede estar **running** sin estar realmente **ready**.

Ahora aparece una pregunta más fina:

> ¿esa lógica de salud conviene vivir en la imagen o en el stack?

La respuesta depende de cuánto querés que esa señal sea:

- reutilizable
- específica del entorno
- portable
- ajustable por stack

Dicho simple:

> si la señal de salud es parte natural del servicio, muchas veces conviene que viaje con la imagen  
> si depende mucho del stack o del entorno, muchas veces conviene definirla o ajustarla en Compose.

---

## Recordatorio rápido del tema anterior

En el tema 59 viste que:

- `depends_on` corto no resuelve readiness real
- `healthcheck` permite expresar cuándo un servicio está healthy
- `condition: service_healthy` hace que Compose espere salud real antes de arrancar otro servicio

Ahora toca decidir **dónde** vive esa lógica.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker indica que el Dockerfile soporta la instrucción `HEALTHCHECK`, que le da al contenedor un estado de salud además del estado normal de ejecución y puede marcarlo como `starting`, `healthy` o `unhealthy`. También aclara que solo puede haber un `HEALTHCHECK` por etapa de Dockerfile y que el último es el que cuenta. Por otro lado, la referencia oficial de Compose documenta `healthcheck` como atributo del servicio, equivalente al `HEALTHCHECK` del Dockerfile y capaz de sobrescribirlo o incluso deshabilitarlo con `disable: true` o `NONE` según el caso. Además, la referencia de merge de Compose aclara que `healthcheck.test` se sobreescribe con el valor del archivo Compose más reciente cuando combinás varios archivos. citeturn812299search0turn812299search1turn812299search6turn812299search9

---

## Primer enfoque: HEALTHCHECK en Dockerfile

La forma general es esta:

```Dockerfile
HEALTHCHECK CMD curl -f http://localhost || exit 1
```

La referencia oficial del Dockerfile explica que `HEALTHCHECK` permite indicar al motor cómo probar si el contenedor sigue funcionando correctamente, y que el resultado alimenta el estado de salud del contenedor. citeturn812299search0

---

## Qué ventaja principal tiene

La gran ventaja es que la señal de salud viaja con la imagen.

Eso significa que:

- la imagen ya trae una forma razonable de decir “estoy sano”
- esa lógica no depende de un Compose específico
- cualquier stack o entorno que use esa imagen hereda ese comportamiento por defecto

Esto es muy valioso cuando la salud del servicio es parte natural del servicio mismo.

---

## Cuándo suele tener mucho sentido

Suele tener bastante sentido cuando:

- el servicio tiene una verificación clara y universal
- querés que la imagen sea reusable
- esa señal vale para casi cualquier entorno
- querés que la imagen ya venga con una definición básica de salud

Por ejemplo:

- una API que responde localmente en un endpoint simple
- un servicio HTTP con una ruta local de salud
- un binario que puede chequearse con un comando corto y estable

---

## Qué limitación tiene

La limitación es que el Dockerfile no siempre conoce bien el contexto del stack.

Por ejemplo:

- quizás querés otra frecuencia de chequeo
- quizás el stack local necesita más `start_period`
- quizás en un entorno de desarrollo querés deshabilitarlo
- quizás necesitás otra señal de salud según el servicio que lo consume

Ahí Compose gana flexibilidad.

---

## Segundo enfoque: healthcheck en Compose

En Compose podés escribir algo así:

```yaml
services:
  api:
    image: miusuario/api:dev
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 20s
```

La referencia oficial de Compose lo presenta como el equivalente a `HEALTHCHECK` a nivel servicio y aclara que puede sobrescribir el valor que traiga la imagen. citeturn812299search1

---

## Qué ventaja principal tiene

La gran ventaja es la adaptación al stack.

Esto te permite:

- ajustar timings según el entorno
- adaptar el check al servicio dentro de ese stack
- sobreescribir un check heredado
- incluso desactivarlo si hace falta

Es decir:
no estás atando toda la lógica de salud a la imagen.

---

## Cuándo suele tener mucho sentido

Suele tener bastante sentido cuando:

- el mismo servicio se usa en entornos distintos
- querés afinar `interval`, `timeout` o `start_period`
- el stack necesita una señal más específica
- querés que el Dockerfile quede más genérico y el stack más expresivo

---

## Regla práctica inicial

Podés pensar así:

### Si la señal de salud es una propiedad bastante natural del servicio
Puede tener sentido `HEALTHCHECK` en Dockerfile.

### Si la señal o sus parámetros dependen mucho del entorno o del stack
Puede tener sentido `healthcheck` en Compose.

Esta regla no resuelve todos los casos, pero suele orientar bastante bien.

---

## Un ejemplo de healthcheck reusable en Dockerfile

Por ejemplo:

```Dockerfile
FROM nginx:latest
HEALTHCHECK CMD curl -f http://localhost || exit 1
```

### Cómo se lee
- esta imagen web ya sabe probar si responde localmente
- la imagen no depende de un `compose.yaml` concreto para tener salud básica

Esto vuelve la imagen más completa como artefacto.

---

## Un ejemplo de ajuste en Compose

Ahora imaginá que esa misma imagen se usa en un stack donde querés otro comportamiento:

```yaml
services:
  web:
    image: miusuario/web:prod
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 40s
```

### Qué está pasando
- la imagen trae una idea base de salud
- el stack la adapta a este entorno concreto

La referencia de Compose documenta justamente que el archivo Compose puede sobrescribir el healthcheck heredado. citeturn812299search1

---

## Deshabilitar un healthcheck heredado

Docker Compose documenta incluso la posibilidad de deshabilitar un `HEALTHCHECK` heredado con algo como:

```yaml
services:
  app:
    healthcheck:
      disable: true
```

o usando `NONE` en el caso correspondiente. citeturn812299search1turn812299search0

Esto no debería ser tu primera opción siempre, pero está bueno saber que existe.

---

## Qué pasa cuando hay varios archivos Compose

La referencia oficial de merge documenta que, al combinar archivos Compose, `healthcheck.test` se sobrescribe con el valor del archivo más reciente, en lugar de combinarse como lista acumulativa. citeturn812299search9

Esto importa muchísimo si tenés, por ejemplo:

- `compose.yaml`
- `compose.override.yaml`

porque te ayuda a razonar bien qué check final terminó aplicándose.

---

## Un criterio muy útil para diseñar buenos healthchecks

Preguntate esto:

> “¿Este chequeo representa bien que el servicio está sano en casi cualquier entorno, o depende mucho del contexto?”

### Si representa salud básica del servicio casi siempre
Quizás conviene Dockerfile.

### Si depende mucho de timings, entorno o stack
Quizás conviene Compose.

Esa pregunta suele destrabar bastante bien la decisión.

---

## Qué hace que un healthcheck sea reusable

Suele ser más reusable cuando:

- chequea algo local al contenedor
- no depende de demasiadas piezas externas
- es rápido
- es estable
- expresa una salud razonable del servicio, no del stack entero

Por ejemplo, para una API suele ser mejor un endpoint local de salud que una verificación muy compleja contra media infraestructura.

---

## Qué hace que un healthcheck sea demasiado rígido

Suele volverse rígido cuando:

- asume un entorno muy específico
- depende de timings que solo sirven en un caso
- chequea algo que cambia entre stacks
- obliga a todos los entornos a usar exactamente la misma señal sin adaptación

Ese tipo de check a veces conviene más en Compose que en la imagen.

---

## Un ejemplo sano de reparto de responsabilidades

### En el Dockerfile
Una verificación local, básica y reusable:

```Dockerfile
HEALTHCHECK CMD curl -f http://localhost:3000/health || exit 1
```

### En Compose
El stack decide si la deja así, la afina, o la usa como base para `service_healthy`.

Esto te da una muy buena combinación entre:

- portabilidad de la imagen
- flexibilidad del stack

---

## Qué no tenés que confundir

### HEALTHCHECK en Dockerfile no reemplaza al healthcheck de Compose
Compose puede sobrescribirlo. citeturn812299search1

### Que una imagen tenga healthcheck no significa que automáticamente el stack espere readiness
Eso depende también de cómo uses `depends_on` y `condition`. citeturn812299search2turn812299search1

### Deshabilitar un healthcheck no debería ser un parche por costumbre
Conviene entender primero por qué ese check no sirve en ese entorno.

### Tener un healthcheck no reemplaza por completo la robustez interna de la app
La app igual debería manejar errores o reconexiones cuando corresponda.

---

## Error común 1: meter siempre el healthcheck solo en Compose aunque la imagen sea muy reusable

A veces perdés la oportunidad de que la imagen ya viaje con una señal de salud razonable.

---

## Error común 2: meter siempre el healthcheck solo en el Dockerfile aunque cambie mucho por entorno

Eso puede volverlo demasiado rígido.

---

## Error común 3: olvidar que solo cuenta el último HEALTHCHECK en una etapa

Docker lo documenta explícitamente. citeturn812299search6turn812299search0

---

## Error común 4: no pensar cómo se comporta el merge entre archivos Compose

Si un override cambia `healthcheck.test`, el valor anterior no se acumula: se reemplaza. citeturn812299search9

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Leé este Dockerfile:

```Dockerfile
FROM nginx:latest
HEALTHCHECK CMD curl -f http://localhost || exit 1
```

Respondé:

- qué ventaja te da que la imagen ya traiga una señal de salud
- por qué eso puede volverla más reusable
- en qué tipo de servicio esto te parece razonable

### Ejercicio 2
Ahora mirá este Compose:

```yaml
services:
  web:
    image: miusuario/web:prod
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 40s
```

Respondé:

- qué ventaja te da mover o ajustar el check en Compose
- por qué esto puede ser mejor en un stack específico
- qué parte del comportamiento te permite adaptar

### Ejercicio 3
Respondé además:

- cuándo te parece mejor Dockerfile
- cuándo te parece mejor Compose
- qué criterio usarías para decidir

---

## Segundo ejercicio de análisis

Pensá en uno de tus servicios propios y respondé:

- cuál sería una señal de salud básica reusable
- si te gustaría que viaje con la imagen
- qué timings o ajustes preferirías dejar al stack
- si hoy tu healthcheck está demasiado acoplado a un entorno concreto
- cómo mejorarías esa separación

No hace falta escribir todavía el archivo final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre salud reusable y salud adaptada al stack?
- ¿qué servicio tuyo se beneficiaría más de llevar un HEALTHCHECK en la imagen?
- ¿qué servicio tuyo necesitaría más bien un ajuste desde Compose?
- ¿qué parte del tema de merge te parece más importante recordar?
- ¿qué te parece más elegante: una imagen que ya trae una señal razonable o un stack que la define por completo?

Estas observaciones valen mucho más que copiar sintaxis.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si la señal de salud es una propiedad bastante natural y reusable del servicio, probablemente me conviene ________.  
> Si la señal o sus timings dependen mucho del entorno o del stack, probablemente me conviene ________.

Y además respondé:

- ¿por qué Compose puede sobrescribir un healthcheck heredado?
- ¿qué ventaja te da que una imagen ya tenga una señal básica de salud?
- ¿qué servicio tuyo te gustaría revisar primero con este criterio?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- distinguir mejor `HEALTHCHECK` en Dockerfile y `healthcheck` en Compose
- decidir cuándo conviene que la señal viaje con la imagen
- decidir cuándo conviene ajustarla en el stack
- entender mejor cómo afecta el merge de Compose a `healthcheck.test`
- diseñar checks más reutilizables y menos rígidos

---

## Resumen del tema

- El Dockerfile soporta `HEALTHCHECK` y la imagen puede viajar con una señal de salud propia. citeturn812299search0turn812299search6
- Compose soporta `healthcheck` a nivel servicio y puede sobrescribir o deshabilitar el healthcheck heredado de la imagen. citeturn812299search1
- Solo puede haber un `HEALTHCHECK` efectivo por etapa, y el último es el que cuenta. citeturn812299search6turn812299search0
- En merges de Compose, `healthcheck.test` se sobrescribe con el valor más reciente. citeturn812299search9
- Este tema te ayuda a diseñar señales de salud más portables, más adaptables y mucho menos improvisadas.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en esta capa más operativa con una práctica integrada:

- app + db
- healthcheck real
- `service_healthy`
- y un stack que ya no solo sube, sino que además arranca de forma bastante más confiable
