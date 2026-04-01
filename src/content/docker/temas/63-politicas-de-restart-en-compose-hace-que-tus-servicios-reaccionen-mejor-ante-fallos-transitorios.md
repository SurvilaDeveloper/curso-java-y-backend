---
title: "Políticas de restart en Compose: hacé que tus servicios reaccionen mejor ante fallos transitorios"
description: "Tema 63 del curso práctico de Docker: cómo usar restart en Docker Compose, qué diferencia hay entre reinicio manual y política automática, y cuándo conviene no, always, on-failure o unless-stopped para mejorar el comportamiento del stack ante errores o reinicios del daemon."
order: 63
module: "Healthchecks y readiness para stacks más confiables"
level: "intermedio"
draft: false
---

# Políticas de restart en Compose: hacé que tus servicios reaccionen mejor ante fallos transitorios

## Objetivo del tema

En este tema vas a:

- entender qué resuelven las políticas de restart
- distinguir reinicio manual de reinicio automático
- usar `restart` dentro de Compose con más criterio
- decidir entre `no`, `always`, `on-failure[:max-retries]` y `unless-stopped`
- pensar mejor cómo deberían reaccionar tus servicios ante fallos o reinicios del daemon

La idea es que tu stack no solo arranque con más criterio, sino que también se comporte mejor cuando algo falla o se corta.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender la diferencia entre reiniciar un servicio y definir una política de restart
2. ver qué valores admite `restart` en Compose
3. distinguir qué problema resuelve cada política
4. entender cuándo tiene sentido usarlas
5. construir una regla práctica para fallos transitorios y servicios continuos

---

## Idea central que tenés que llevarte

No todos los fallos de un contenedor significan lo mismo.

A veces el contenedor:

- falla una vez por una condición transitoria
- sale con error por un problema que puede recuperarse
- debería volver automáticamente si el daemon reinicia
- o no debería reiniciarse nunca sin intervención humana

Las políticas de restart existen para modelar eso mejor.

Dicho simple:

> una política de restart no “arregla” tu servicio,  
> pero sí define cómo querés que reaccione el runtime cuando el contenedor sale o cuando el daemon vuelve.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker Compose define `restart` como la política que la plataforma aplica cuando termina el contenedor del servicio, y enumera estos valores: `no`, `always`, `on-failure[:max-retries]` y `unless-stopped`. Docker Engine documenta además la semántica concreta de esas políticas: `on-failure` reinicia solo ante salida con error y permite límite de reintentos; `always` intenta reiniciar siempre; `unless-stopped` se comporta parecido a `always` salvo que deja de reiniciar si el contenedor fue detenido; y Docker añade un backoff creciente entre intentos de restart. La guía de Compose en producción también recomienda considerar una política como `restart: always` para evitar downtime en ciertos servicios. Por otro lado, `docker compose restart` es un comando manual distinto: reinicia servicios existentes, pero no aplica cambios nuevos del `compose.yml`. citeturn478724view0turn689723search10turn689723search1turn478724view2turn689723search0

---

## Primer concepto: reinicio manual no es política de restart

Mucha gente mezcla estas dos cosas:

### Reinicio manual
```bash
docker compose restart
```

### Política automática
```yaml
services:
  app:
    restart: unless-stopped
```

No son lo mismo.

Docker documenta que `docker compose restart` simplemente reinicia servicios ya existentes y, además, no aplica cambios nuevos del archivo Compose. citeturn689723search0

En cambio, `restart` en el YAML define qué debe hacer la plataforma automáticamente cuando el contenedor sale o cuando Docker vuelve.

---

## Qué problema resuelve una política de restart

Resuelve algo como esto:

- el servicio se cayó por un error momentáneo
- el daemon Docker se reinició
- querés que cierto contenedor vuelva automáticamente
- o querés que no vuelva automáticamente según el tipo de tarea

O sea:
describe un comportamiento **automático**, no una orden puntual.

---

## Sintaxis básica de restart en Compose

La forma general es esta:

```yaml
services:
  app:
    image: miusuario/app:dev
    restart: unless-stopped
```

La referencia oficial de servicios de Compose documenta justamente este atributo y esos valores posibles. citeturn478724view0

---

## Política 1: no

```yaml
restart: "no"
```

Docker documenta `no` como la política por defecto: no reinicia el contenedor bajo ninguna circunstancia. citeturn478724view0

### Cuándo puede tener sentido
- jobs one-shot
- tareas de migración
- contenedores que querés inspeccionar si fallan
- casos donde no querés que algo se relance automáticamente

Esto encaja muy bien con el tema 62: un job que debe correr y terminar no suele necesitar restart automático.

---

## Política 2: always

```yaml
restart: always
```

Docker documenta que `always` intenta reiniciar siempre el contenedor si se detiene. También aclara que, si el contenedor fue detenido manualmente, se reinicia cuando el daemon Docker vuelva a arrancar o cuando el propio contenedor sea reiniciado manualmente. citeturn478724view0turn689723search10

### Cuándo puede tener sentido
- servicios continuos que querés mantener arriba
- entornos donde preferís alta disponibilidad básica antes que intervención manual
- stacks simples en un solo host

La guía de Compose en producción menciona justamente `restart: always` como una opción razonable para evitar downtime. citeturn478724view2

---

## Política 3: on-failure

```yaml
restart: on-failure
```

o con límite:

```yaml
restart: on-failure:3
```

Docker documenta que `on-failure` reinicia el contenedor cuando sale con código de error distinto de cero. También aclara que podés limitar la cantidad de intentos con `:max-retries`, y que esta política no reinicia el contenedor si el daemon Docker se reinicia. citeturn478724view0turn689723search10

### Cuándo suele tener mucho sentido
- servicios que pueden fallar de forma transitoria
- procesos donde querés algunos reintentos, pero no infinitos
- contenedores donde el fallo permanente debería notarse y no esconderse para siempre

---

## Política 4: unless-stopped

```yaml
restart: unless-stopped
```

Docker documenta `unless-stopped` como una política similar a `always`, pero con una diferencia importante: si el contenedor fue detenido, no vuelve automáticamente ni siquiera después de que el daemon reinicie. citeturn478724view0turn689723search10

### Cuándo suele tener mucho sentido
- servicios continuos en desarrollo o staging
- servicios que querés reponer automáticamente salvo que alguien los haya detenido a propósito
- entornos donde querés equilibrio entre resiliencia y control manual

---

## Qué hace el daemon cuando reintenta

Docker Engine documenta que aplica un delay creciente entre intentos de restart para evitar inundar el sistema:

- empieza en 100 ms
- se va duplicando
- puede crecer hasta un máximo de 1 minuto
- y se resetea si el contenedor logra arrancar y mantenerse al menos 10 segundos citeturn689723search10turn689723search1

Esto importa porque muestra que restart no es simplemente “loop loco inmediato”.
Hay una lógica de backoff.

---

## Qué significa esto en la práctica

Si un servicio falla repetidamente al instante:

- Docker no lo va a relanzar sin pausa infinita a máxima velocidad
- va a aplicar un backoff creciente
- si alguna vez logra sostenerse por un rato razonable, el delay vuelve a su estado base

Eso hace que el comportamiento sea bastante más sensato de lo que mucha gente imagina.

---

## Un criterio práctico rápido

Podés pensar así:

### ¿Es un job puntual?
Probablemente `restart: "no"`.

### ¿Es un servicio continuo y querés que vuelva casi siempre?
Probablemente `always` o `unless-stopped`.

### ¿Querés reintentos solo si falla con error y quizá con límite?
Probablemente `on-failure[:max-retries]`.

Esta regla sola ya ordena bastante bien.

---

## Ejemplo 1: base de datos o API en desarrollo

```yaml
services:
  api:
    image: miusuario/api:dev
    restart: unless-stopped
```

### Cómo se lee
- la API debería volver si se corta o si Docker reinicia
- pero si la detuviste a propósito, no querés que reaparezca sola

Este caso suele ser bastante razonable para desarrollo o entornos intermedios.

---

## Ejemplo 2: servicio continuo más “agresivo”

```yaml
services:
  web:
    image: miusuario/web:prod
    restart: always
```

### Cómo se lee
- querés que el servicio vuelva sí o sí siempre que sea posible
- priorizás continuidad simple del contenedor

La guía de producción de Compose sugiere justamente considerar una política como `restart: always` en ese tipo de escenario. citeturn478724view2

---

## Ejemplo 3: worker con fallos transitorios

```yaml
services:
  worker:
    image: miusuario/worker:dev
    restart: on-failure:5
```

### Cómo se lee
- si el worker sale con error, intentá levantarlo otra vez
- pero no lo hagas infinitamente
- después de cierto punto, preferís ver el problema

Esto suele tener mucho sentido cuando un fallo puede recuperarse, pero tampoco querés esconder errores permanentes.

---

## Ejemplo 4: migración one-shot

```yaml
services:
  migrate:
    image: miusuario/app:dev
    command: npm run migrate
    restart: "no"
```

### Cómo se lee
- esta tarea tiene que correr y terminar
- no querés que se reinicie automáticamente como si fuera un servicio continuo

Este patrón conversa muy bien con lo que ya viste sobre `service_completed_successfully`.

---

## Qué no tenés que confundir

### restart no reemplaza healthchecks
Una política de restart define qué hacer cuando el contenedor sale.
No define readiness ni salud detallada.

### restart no arregla una app mal diseñada
Solo modela cómo reaccionar al fallo.

### always y unless-stopped se parecen, pero no son idénticos
La diferencia aparece especialmente cuando hubo una detención intencional y luego reinicia el daemon. citeturn689723search10

### on-failure no cubre reinicios del daemon
Docker lo documenta explícitamente. citeturn689723search10

---

## Qué lugar ocupa deploy.restart_policy

La referencia de la Compose Deploy Specification documenta también `deploy.restart_policy`, con campos como `condition`, `delay`, `max_attempts` y `window`, y aclara que si no está configurado se considera el `restart` del servicio. citeturn478724view1

Para este curso, por ahora, el foco principal va a seguir siendo el campo `restart` del servicio, porque es la entrada más directa y útil para stacks Compose de este tipo.

---

## Error común 1: usar always para jobs one-shot

Eso suele ser una mala combinación, porque un job puntual no debería comportarse como un servicio continuo.

---

## Error común 2: usar on-failure esperando que el servicio vuelva también tras reinicio del daemon

Docker documenta que `on-failure` no cubre ese caso. citeturn689723search10

---

## Error común 3: creer que docker compose restart y restart: always son la misma cosa

No.
Uno es un comando manual.
Lo otro es una política automática. citeturn689723search0turn478724view0

---

## Error común 4: usar restart para “ocultar” fallos permanentes

Si el servicio está mal configurado o falla siempre, una política agresiva puede volver el problema menos visible en vez de resolverlo.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Compará estos servicios:

#### Servicio A
```yaml
services:
  migrate:
    image: miusuario/app:dev
    command: npm run migrate
    restart: "no"
```

#### Servicio B
```yaml
services:
  api:
    image: miusuario/api:dev
    restart: unless-stopped
```

#### Servicio C
```yaml
services:
  worker:
    image: miusuario/worker:dev
    restart: on-failure:3
```

### Ejercicio 2
Respondé con tus palabras:

- cuál se parece más a un job puntual
- cuál se parece más a un servicio continuo
- cuál debería reintentarse solo si falla
- por qué no conviene tratarlos igual

### Ejercicio 3
Respondé además:

- qué diferencia hay entre `always` y `unless-stopped`
- qué diferencia hay entre una política `restart` y el comando `docker compose restart`
- por qué `on-failure` puede ser útil para fallos transitorios

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué servicio tuyo debería tener una política de restart
- cuál no debería reiniciarse automáticamente
- si tenés algún worker o proceso donde limitar reintentos sería útil
- qué política te parece más razonable para tu backend principal
- qué riesgo evitarías eligiendo bien esta parte del stack

No hace falta escribir todavía el archivo final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre job puntual y servicio continuo?
- ¿qué servicio de tus proyectos hoy tiene una política de restart mal elegida o inexistente?
- ¿en qué caso usarías `on-failure` en vez de `always`?
- ¿qué te parece más peligroso: no reiniciar algo que debería volver o reiniciar sin parar algo que está mal?
- ¿qué valor práctico le ves a `unless-stopped`?

Estas observaciones valen mucho más que memorizar cuatro valores.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si el contenedor es un job puntual, probablemente me conviene ________.  
> Si es un servicio continuo que quiero reponer salvo que alguien lo detenga, probablemente me conviene ________.  
> Si quiero reintentos solo ante error y quizá con límite, probablemente me conviene ________.

Y además respondé:

- ¿por qué una política de restart no reemplaza healthchecks?
- ¿qué servicio tuyo te gustaría revisar primero con este criterio?
- ¿qué ventaja te da distinguir bien entre fallo transitorio y fallo permanente?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- distinguir reinicio manual de política automática de restart
- usar `restart` con más criterio en Compose
- decidir mejor entre `no`, `always`, `on-failure[:max-retries]` y `unless-stopped`
- pensar mejor jobs puntuales vs servicios continuos
- modelar de forma más sana la reacción del stack frente a fallos o reinicios del daemon

---

## Resumen del tema

- Compose documenta `restart` como la política aplicada cuando el contenedor del servicio termina. citeturn478724view0
- Los valores disponibles son `no`, `always`, `on-failure[:max-retries]` y `unless-stopped`. citeturn478724view0
- Docker Engine documenta la semántica precisa de esas políticas, incluyendo backoff creciente y límite opcional en `on-failure`. citeturn689723search10turn689723search1
- La guía de producción de Compose sugiere considerar una política como `restart: always` para evitar downtime en ciertos servicios. citeturn478724view2
- `docker compose restart` es un comando manual distinto y no aplica cambios nuevos del archivo Compose. citeturn689723search0
- Este tema te ayuda a diseñar stacks que reaccionen mejor a fallos sin mezclar jobs, servicios continuos y reintentos automáticos.

---

## Próximo tema

En el próximo tema vas a seguir avanzando hacia una capa más operativa y madura con una práctica integrada:

- app + db + readiness + restart
- combinación de varias decisiones del stack
- y una forma de pensar servicios más cercana a operación real
