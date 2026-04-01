---
title: "Redes nombradas y segmentación en Compose: separá frontend y backend sin exponer de más"
description: "Tema 80 del curso práctico de Docker: cómo definir redes nombradas en Docker Compose, conectar servicios a una o varias redes, segmentar frontend y backend y usar redes internas para reducir exposición innecesaria dentro del stack."
order: 80
module: "Networking entre servicios y puertos con Compose"
level: "intermedio"
draft: false
---

# Redes nombradas y segmentación en Compose: separá frontend y backend sin exponer de más

## Objetivo del tema

En este tema vas a:

- dejar de depender solo de la red por defecto de Compose
- definir redes nombradas con más intención
- conectar servicios a una o varias redes según su rol
- segmentar frontend y backend dentro del mismo stack
- entender cuándo conviene una red `internal`

La idea es que, cuando tu proyecto empiece a crecer, no metas todo en una sola red “porque sí”, sino que empieces a pensar qué grupos de servicios realmente deberían verse entre sí.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. recordar qué aporta la red por defecto
2. ver cuándo conviene pasar a redes nombradas
3. conectar servicios a una o varias redes
4. segmentar un caso frontend/backend
5. entender qué aporta una red `internal`
6. construir una regla práctica para stacks que ya no son triviales

---

## Idea central que tenés que llevarte

La red por defecto de Compose está muy bien para empezar.

Pero cuando el stack crece, a veces querés algo más fino:

- que `proxy` vea a `app`, pero no a `db`
- que `db` solo sea visible desde `app`
- que ciertos servicios no salgan hacia afuera
- que un servicio “puente” se conecte a dos redes distintas

Dicho simple:

> cuando todos los servicios no deberían hablar con todos,  
> conviene dejar de pensar en una sola red y empezar a segmentar.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker Compose explica que, por defecto, Compose crea una sola red para la aplicación y cada servicio se une a esa red. También documenta que el top-level `networks` permite definir redes nombradas reutilizables y que cada servicio debe recibir acceso explícito a las redes que vaya a usar. La guía de networking en Compose muestra un ejemplo con dos redes donde `proxy` queda aislado de `db` porque no comparten ninguna red, y solo `app` se conecta a ambas. La referencia del Compose file documenta además el atributo `internal`, que crea una red aislada externamente, y `name`, que permite fijar un nombre personalizado a la red. Por otro lado, Docker Engine explica que los contenedores en una misma red definida por el usuario pueden comunicarse por nombre o alias y que redes distintas aíslan grupos de contenedores entre sí salvo que publiques puertos. citeturn781207search0turn781207search1turn781207search7turn781207search11

---

## Primer bloque: la red por defecto sigue siendo útil

Ya viste en el tema anterior que Compose crea por defecto una red para el proyecto y que los servicios se descubren por nombre dentro de esa red. citeturn781207search0turn781207search1

Para stacks chicos como:

- `app + db`
- `web + redis`
- `api + postgres`

eso muchas veces alcanza perfectamente.

No hace falta inventar complejidad donde todavía no hace falta.

---

## Entonces, ¿cuándo conviene usar redes nombradas?

Conviene cuando querés expresar algo más fino que:

> “todos los servicios están en la misma red y listo”.

Por ejemplo, cuando querés:

- separar frontend y backend
- dejar una base accesible solo desde la app
- evitar que servicios sin relación directa se vean entre sí
- crear un servicio puente que esté en dos redes distintas

Ahí `networks:` empieza a valer muchísimo la pena.

---

## Segundo bloque: redes nombradas en Compose

Docker documenta el top-level `networks` justamente para definir redes personalizadas que puedan compartirse entre servicios. citeturn781207search0

La forma mínima sería algo así:

```yaml
services:
  frontend:
    image: example/webapp
    networks:
      - front-tier

  backend:
    image: example/api
    networks:
      - back-tier

networks:
  front-tier:
  back-tier:
```

---

## Cómo se lee este ejemplo

La lectura conceptual sería:

- `frontend` solo ve su red `front-tier`
- `backend` solo ve `back-tier`
- como no comparten red, no se descubren entre sí directamente

Esto ya muestra algo muy valioso:
la red deja de ser “el aire que comparten todos” y pasa a ser una frontera explícita.

---

## Tercer bloque: un servicio conectado a dos redes

Ahora mirá este caso:

```yaml
services:
  proxy:
    image: nginx
    networks:
      - front-tier

  app:
    image: example/api
    networks:
      - front-tier
      - back-tier

  db:
    image: postgres:18
    networks:
      - back-tier

networks:
  front-tier:
  back-tier:
```

La guía oficial de Compose networking usa precisamente este patrón conceptual: `proxy` queda aislado de `db` porque no comparten red, y solo `app` puede hablar con ambos. citeturn781207search1

---

## Cómo se lee este ejemplo

- `proxy` puede hablar con `app`
- `app` puede hablar con `proxy` y con `db`
- `db` puede hablar con `app`
- `proxy` no puede hablar con `db` porque no comparten ninguna red

Este es un patrón excelente para stacks reales.

---

## Por qué este patrón es tan valioso

Porque expresa algo que en muchos proyectos es totalmente lógico:

- el frontend o proxy no necesita llegar directo a la base
- la app sí necesita hablar con ambos lados
- la red modela esa arquitectura

No es solo “una config más prolija”.
Es una forma de hacer visible la intención del diseño.

---

## Cuarto bloque: redes `internal`

La referencia oficial del Compose file documenta el atributo `internal` así:

```yaml
networks:
  mynet1:
    internal: true
```

y explica que eso permite crear una red aislada externamente. citeturn781207search0

---

## Qué significa “aislada externamente”

La idea práctica es:

- esa red sirve para comunicación interna entre los servicios que la comparten
- pero no está pensada para exposición hacia afuera de la misma forma que una red normal
- reduce la conectividad externa de ese segmento

No reemplaza todas las decisiones de exposición.
Pero suma una capa de intención y aislamiento muy útil.

---

## Cuándo conviene una red internal

Suele tener mucho sentido para cosas como:

- bases de datos
- caches
- colas
- servicios internos del backend
- cualquier grupo de servicios que no debería tener salida o exposición innecesaria

Por ejemplo, una `back-tier` interna puede ser una muy buena idea cuando querés que `db` y `app` se hablen, pero que ese segmento no quede abierto más de la cuenta.

---

## Un ejemplo con internal

```yaml
services:
  proxy:
    image: nginx
    networks:
      - front-tier

  app:
    image: example/api
    networks:
      - front-tier
      - back-tier

  db:
    image: postgres:18
    networks:
      - back-tier

networks:
  front-tier:
  back-tier:
    internal: true
```

### Cómo se lee
- `front-tier` es la red donde vive lo más cercano a la entrada
- `back-tier` queda como red interna
- `app` actúa como puente
- `db` queda todavía más contenida

Esto ya se siente mucho más deliberado que una sola red para todo.

---

## Quinto bloque: el nombre de la red

Docker documenta también el atributo `name` para fijar un nombre custom a una red. citeturn781207search0

Por ejemplo:

```yaml
networks:
  front-tier:
    name: mi-red-frontend
```

### Para qué puede servir
- para tener un nombre más estable o reconocible
- para integrarte con alguna convención externa
- para compartir una red con un nombre determinado

No siempre hace falta tocarlo.
Pero está bueno saber que existe.

---

## Qué gana una red nombrada frente a la red por defecto

Gana principalmente dos cosas:

### 1. Intención arquitectónica
Ya no es solo “todo junto”.
Ahora expresás grupos y fronteras.

### 2. Control más fino
Elegís exactamente qué servicio se conecta a qué red.

La documentación oficial insiste precisamente en esto: a una red definida en top-level solo acceden los servicios a los que se les concede acceso mediante `services.<name>.networks`. citeturn781207search0turn781207search1

---

## Qué no tenés que confundir

### Red nombrada no significa puerto publicado
Sigue siendo red interna del proyecto salvo que publiques puertos aparte. citeturn781207search0turn781207search1

### Dos servicios en el mismo Compose no siempre tienen que compartir red
Pueden estar en redes distintas y quedar aislados. citeturn781207search1turn781207search7

### `internal` no reemplaza todas las decisiones de seguridad
Suma aislamiento de red, pero no reemplaza otras capas como no-root, least privilege o no publicar puertos de más.

### Una sola red no siempre está mal
Para stacks chicos, puede seguir siendo la mejor opción por simplicidad.

---

## Una regla muy útil

Podés pensar así:

### ¿El stack sigue siendo chico y simple?
La red por defecto probablemente alcanza.

### ¿Hay grupos claros como frontend y backend?
Conviene pensar redes separadas.

### ¿Un servicio necesita hablar con ambos mundos?
Ese servicio puede conectarse a dos redes.

### ¿Hay una red que debería quedar más encerrada?
Mirala con `internal: true`.

Esta secuencia te ayuda a no sobrediseñar demasiado pronto, pero también a no quedarte corto cuando el stack crece.

---

## Qué relación tiene esto con el tema anterior

En el tema 79 viste:

- red interna por defecto
- nombre de servicio
- puertos publicados al host

Ahora das un paso más:

- no solo entendés la red
- también la usás para segmentar mejor el stack

Es una evolución natural muy importante.

---

## Error común 1: dejar todo en una sola red aunque la arquitectura ya pida separación

Eso funciona, pero expresa menos y aísla peor.

---

## Error común 2: publicar puertos para “conectar” servicios que ya podrían verse por red interna

La conectividad interna y la publicación al host son problemas distintos. citeturn781207search0turn781207search1

---

## Error común 3: conectar un servicio a dos redes sin necesidad

Tener un servicio “puente” tiene sentido, pero no conviene convertir a todos los servicios en puentes por costumbre.

---

## Error común 4: usar `internal` sin entender qué parte del tráfico querés limitar

La red tiene que modelar una intención real, no ser solo otra opción puesta porque sí.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Mirá este stack:

```yaml
services:
  proxy:
    image: nginx
    networks:
      - front-tier

  app:
    image: example/api
    networks:
      - front-tier
      - back-tier

  db:
    image: postgres:18
    networks:
      - back-tier

networks:
  front-tier:
  back-tier:
```

Respondé con tus palabras:

- qué servicios pueden hablar entre sí
- por qué `proxy` no ve a `db`
- por qué `app` sí ve a ambos
- qué intención arquitectónica expresa esta segmentación

### Ejercicio 2
Ahora agregá esto:

```yaml
networks:
  front-tier:
  back-tier:
    internal: true
```

Respondé:

- qué cambia conceptualmente en `back-tier`
- por qué eso podría tener sentido para `db`
- qué tipo de red del stack te parecería buena candidata a `internal`

### Ejercicio 3
Respondé además:

- cuándo te quedarías con la red por defecto
- cuándo pasarías a redes nombradas
- cuándo un servicio debería conectarse a dos redes

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- si hoy todo vive en una sola red sin demasiado criterio
- si hay una separación natural tipo frontend/backend o app/data
- qué servicio sería tu puente entre dos redes
- qué red te gustaría mantener más interna
- qué parte del stack hoy probablemente está más expuesta de lo necesario

No hace falta escribir todavía el `compose.yaml` final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre red por defecto y red nombrada?
- ¿en qué proyecto tuyo te convendría más separar frontend y backend?
- ¿qué servicio hoy está en demasiadas redes “por costumbre”?
- ¿qué red te gustaría volver `internal` primero?
- ¿qué mejora concreta te gustaría notar al segmentar más el stack?

Estas observaciones valen mucho más que memorizar la clave `networks:`.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si mi stack sigue siendo chico y simple, probablemente me alcance con la ________ por defecto.  
> Si quiero separar frontend y backend, probablemente me conviene definir redes ________.  
> Si un servicio necesita hablar con dos segmentos distintos, probablemente me conviene conectarlo a ________ redes.  
> Si una red debería quedar aislada externamente, probablemente me conviene marcarla como ________.

Y además respondé:

- ¿por qué este tema mejora tanto la claridad del stack?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no meter todo en la misma red sin pensar?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- definir redes nombradas en Compose con más intención
- conectar servicios a una o varias redes según su rol
- segmentar mejor frontend y backend
- usar redes `internal` cuando el caso lo justifique
- dejar de meter todo en una sola red cuando el stack ya pide más estructura

---

## Resumen del tema

- Compose permite definir redes nombradas con el top-level `networks`, y cada servicio debe recibir acceso explícito a las redes que use. citeturn781207search0
- La documentación oficial muestra un patrón con dos redes donde `proxy` queda aislado de `db` y solo `app` habla con ambos. citeturn781207search1
- Los contenedores conectados a la misma red definida por el usuario pueden comunicarse por nombre o alias. citeturn781207search7turn781207search11
- El atributo `internal` permite crear una red aislada externamente. citeturn781207search0
- El atributo `name` permite fijar un nombre custom para la red. citeturn781207search0
- Este tema te deja una base mucho más clara para segmentar un stack que ya creció y no debería vivir todo en una sola red compartida.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque con una práctica integrada de networking:

- proxy
- app
- db
- dos redes
- puertos publicados solo donde corresponde
- y un stack mucho más claro en cómo se conectan sus partes
