---
title: "Reducí superficie de escritura: read_only, tmpfs y mounts más controlados para endurecer el contenedor"
description: "Tema 75 del curso práctico de Docker: cómo usar read_only, tmpfs, volúmenes y mounts read-only para reducir la superficie de escritura del contenedor, separar datos persistentes del layer efímero y endurecer mejor tus servicios."
order: 75
module: "Elegir bases e imágenes con criterio"
level: "intermedio"
draft: false
---

# Reducí superficie de escritura: read_only, tmpfs y mounts más controlados para endurecer el contenedor

## Objetivo del tema

En este tema vas a:

- entender qué significa la capa escribible de un contenedor
- usar `read_only` en Compose con más criterio
- distinguir cuándo conviene un volumen, un bind mount o un `tmpfs`
- reducir la superficie de escritura del contenedor
- seguir endureciendo tus servicios más allá de simplemente no correr como root

La idea es que no solo controles **quién** corre el proceso, sino también **dónde** puede escribir y qué parte del filesystem realmente necesita ser mutable.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender cómo se escribe dentro de un contenedor por defecto
2. ver qué cambia cuando marcás el root filesystem como read-only
3. usar `tmpfs` para escrituras temporales
4. usar volúmenes para datos persistentes
5. usar mounts de solo lectura cuando el contenedor no debería modificar algo
6. construir una regla práctica para servicios más restringidos y previsibles

---

## Idea central que tenés que llevarte

Por defecto, Docker le da al contenedor una capa escribible por encima de las capas inmutables de la imagen.

Docker lo documenta claramente: los archivos creados dentro del contenedor van a una writable container layer situada sobre capas de imagen read-only e inmutables. citeturn784042view2

Eso es cómodo.
Pero también deja una superficie de escritura que no siempre necesitás.

Dicho simple:

> si tu servicio necesita escribir poco,  
> conviene decirlo explícitamente y no dejar todo el filesystem abierto “por las dudas”.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker deja varias piezas muy claras para este tema:

- por defecto, el contenedor tiene una writable layer por encima de las capas inmutables de la imagen. citeturn784042view2
- Compose documenta `read_only` para crear el contenedor con un filesystem de solo lectura. citeturn394900view0
- `tmpfs` monta un filesystem temporal en memoria dentro del contenedor, útil cuando querés escrituras no persistentes fuera de la writable layer. citeturn784042view1turn394900view1
- Docker recomienda usar volúmenes para datos persistentes o write-intensive, y los bind mounts se apoyan directamente en el host. citeturn784042view2turn207487search0turn784042view6
- los bind mounts tienen write access al host por defecto, pero podés marcarlos como `readonly` o `ro`. citeturn784042view6
- en hardening, Docker explica que endurecer una base incluye reducir writable surfaces y evitar cambios en runtime. citeturn784042view4

---

## Primer concepto: la writable layer no es un lugar ideal para todo

Docker explica que los datos escritos a la writable layer no persisten cuando destruís el contenedor y que, además, no son fáciles de extraer o compartir con otros procesos. citeturn784042view2

Eso ya te da una pista muy importante:

- si el dato tiene que persistir, probablemente no debería vivir ahí
- si el dato es temporal, quizá no necesitás dejar abierto todo el root filesystem
- si el servicio casi no escribe nada, quizá la writable layer debería minimizarse mucho

---

## Qué problema resuelve este tema

Imaginá estos casos:

- una API solo necesita leer su código y escribir un par de archivos temporales
- un NGINX sirve archivos estáticos y no debería tocar casi nada del root filesystem
- un servicio necesita persistir datos reales en un volumen, no en la writable layer
- un contenedor lee configuración montada desde el host y no debería modificarla

Si dejás todo escribible sin pensar, perdés una oportunidad muy clara de endurecimiento y previsibilidad.

---

## Segundo concepto: `read_only`

Compose documenta:

```yaml
read_only: true
```

y explica que esto configura el servicio para crear el contenedor con un filesystem de solo lectura. citeturn394900view0

Un ejemplo mínimo:

```yaml
services:
  app:
    image: miusuario/app:prod
    read_only: true
```

---

## Cómo se lee

La lectura conceptual sería:

- el contenedor no debería escribir libremente sobre el root filesystem
- el runtime va a tratar ese filesystem como de solo lectura
- si el servicio necesita escribir algo, vas a tener que declararlo de forma más explícita

Eso es justo lo valioso del enfoque:
pasás de “todo puede escribir” a “solo se escribe donde realmente hace falta”.

---

## Qué gana `read_only`

Gana varias cosas al mismo tiempo:

- reduce superficies de escritura accidentales
- hace más visible cuándo una app realmente necesita escribir
- desalienta cambios de runtime innecesarios
- se alinea con el principio de inmutabilidad del contenedor

Docker, en hardening, remarca justamente que reducir writable surfaces y evitar runtime drift es parte de endurecer bien la imagen. citeturn784042view4

---

## Qué no hace `read_only`

No significa que el contenedor ya no pueda escribir **nada** jamás.
Significa que el root filesystem del contenedor se crea de forma read-only.

Si tu servicio necesita escrituras legítimas, normalmente vas a canalizarlas con:

- volúmenes
- bind mounts específicos
- `tmpfs`

Esa separación es justamente una de las ganancias del tema.

---

## Tercer concepto: `tmpfs`

Docker documenta `tmpfs` como un filesystem temporal en memoria para el contenedor. También aclara que sirve cuando no querés persistir datos ni en el host ni dentro del contenedor, y cuando querés proteger performance o manejar estado efímero. citeturn784042view1

Compose también documenta `tmpfs` a nivel servicio, incluso con opciones como `mode`, `uid` y `gid`. citeturn394900view1turn394900view2

Ejemplo:

```yaml
services:
  app:
    image: miusuario/app:prod
    read_only: true
    tmpfs:
      - /tmp
      - /run
```

---

## Cómo se lee

La lectura conceptual sería:

- el root filesystem va de solo lectura
- pero `/tmp` y `/run` siguen siendo lugares válidos para escritura temporal
- esa escritura no persiste al detener el contenedor

Eso suele encajar muy bien con apps que:

- necesitan scratch space
- escriben sockets temporales
- usan caches efímeras
- generan estado que no debería persistir

---

## Qué ventaja real tiene `tmpfs`

Docker documenta que un tmpfs mount crea archivos fuera de la writable layer del contenedor y que se elimina al detener el contenedor. También destaca que puede ser útil por razones de seguridad o rendimiento cuando hay mucho estado no persistente. citeturn784042view1

Eso te da una idea muy útil:

> si un dato no debería persistir, quizá ni siquiera debería pasar por la writable layer “normal”.

---

## Qué límite tiene `tmpfs`

Docker también aclara varias limitaciones:

- es temporal
- no se comparte entre contenedores como un volumen
- en Linux puede incluso terminar apoyándose en swap, así que no hay que idealizarlo como “memoria pura y nada más” en todos los casos citeturn784042view1

Entonces, `tmpfs` no reemplaza a un volumen.
Resuelve otro problema.

---

## Cuarto concepto: volúmenes

Docker documenta que los volúmenes son almacenamiento persistente gestionado por el daemon y que son ideales para datos persistentes o de alto uso de escritura. También remarca que persisten más allá de la vida del contenedor. citeturn784042view2turn207487search0turn207487search18

Ejemplo:

```yaml
services:
  db:
    image: postgres:18
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

---

## Cómo se lee

La lectura conceptual sería:

- el contenedor no usa la writable layer para esos datos críticos
- los datos viven en un volumen administrado
- el contenedor puede destruirse y recrearse sin perder esa persistencia

Esta es una separación muy importante:

- root filesystem más controlado
- datos persistentes declarados explícitamente

---

## Quinto concepto: bind mounts read-only

Docker documenta que los bind mounts tienen write access al host por defecto, con implicancias de seguridad claras, porque procesos dentro del contenedor pueden modificar el filesystem del host. También aclara que podés montarlos como `readonly` o `ro`. citeturn784042view6

Ejemplo conceptual:

```yaml
services:
  app:
    volumes:
      - ./config:/app/config:ro
```

---

## Cuándo tiene mucho sentido eso

Tiene mucho sentido cuando:

- el contenedor solo necesita leer configuración
- el contenedor no debería modificar archivos del host
- querés exponer algo del host minimizando riesgo de escritura

Esto es especialmente valioso porque los bind mounts son poderosos, pero también más riesgosos que un volumen bien acotado.

---

## Una regla práctica muy útil

Podés pensar así:

### ¿El dato debe persistir?
Volumen.

### ¿El dato solo debe existir mientras el contenedor vive?
`tmpfs`.

### ¿El contenedor necesita leer algo del host y no debería escribirlo?
Bind mount `ro`.

### ¿El servicio casi no necesita escribir en el root filesystem?
`read_only: true`.

Esta regla sola ya ordena muchísimo.

---

## Un ejemplo sano de servicio endurecido

Mirá este servicio:

```yaml
services:
  web:
    image: nginx
    read_only: true
    tmpfs:
      - /run
      - /tmp
    volumes:
      - ./site:/usr/share/nginx/html:ro
```

### Cómo se lee
- el root filesystem va read-only
- `/run` y `/tmp` quedan para escrituras temporales
- los archivos del sitio se montan desde el host como solo lectura
- el servicio queda con una superficie de escritura mucho más controlada

Este tipo de diseño ya se siente bastante más deliberado y menos “abierto por defecto”.

---

## Qué relación tiene esto con el tema anterior

En el tema 74 viste quién ejecuta el proceso.
Acá ves otra capa igual de importante:

- no solo **quién** corre
- también **dónde** puede escribir

Las dos cosas juntas se complementan muy bien para endurecer el contenedor.

---

## Qué no tenés que confundir

### `read_only` no reemplaza volúmenes
Si necesitás persistencia, el volumen sigue siendo la herramienta correcta. citeturn784042view2turn207487search0

### `tmpfs` no reemplaza persistencia
Justamente sirve para lo contrario: estado temporal. citeturn784042view1

### Un bind mount no es inocente
Por defecto puede escribir sobre el host. Docker lo advierte explícitamente. citeturn784042view6

### Hardenear no es solo “hacer más pequeña” la imagen
También es reducir writable surfaces y drift en runtime. citeturn784042view4

---

## Error común 1: dejar todo escribible aunque el servicio casi no escribe nada

Eso desperdicia una oportunidad clara de endurecimiento.

---

## Error común 2: usar la writable layer para datos que deberían ir en volumen

Docker explica que esos datos no persisten bien y son difíciles de compartir o extraer. citeturn784042view2

---

## Error común 3: montar configuración del host en modo escritura por costumbre

Si el contenedor solo necesita leerla, un bind mount `ro` suele ser mucho más sano. citeturn784042view6

---

## Error común 4: activar `read_only` sin pensar dónde van `/tmp`, `/run` u otras escrituras legítimas

La idea no es romper la app, sino hacer explícitos los puntos de escritura necesarios.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Respondé con tus palabras:

- qué es la writable layer del contenedor
- por qué no es el mejor lugar para datos que deben persistir
- qué gana un servicio cuando activás `read_only`

### Ejercicio 2
Compará estos casos y decí qué usarías en cada uno:

- datos de base que deben persistir
- archivos temporales que no deben sobrevivir al stop
- un directorio de configuración del host que la app solo necesita leer
- un servicio que casi no necesita escribir en su root filesystem

Elegí entre:
- volumen
- `tmpfs`
- bind mount `ro`
- `read_only: true`

### Ejercicio 3
Respondé además:

- por qué `tmpfs` no reemplaza a un volumen
- por qué un bind mount read-only puede ser mejor que uno writable
- qué parte del hardening aporta reducir superficies de escritura

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- si hoy el servicio escribe demasiado “por defecto”
- qué rutas podrían pasar a ser `tmpfs`
- qué datos deberían ir sí o sí a un volumen
- qué mounts del host podrías volver de solo lectura
- si te animarías a probar `read_only: true` y qué ruta tendrías que hacer explícitamente writable

No hace falta escribir todavía el `compose.yaml` final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre root filesystem, writable layer, volumen y tmpfs?
- ¿qué servicio tuyo hoy probablemente escribe más de la cuenta?
- ¿qué parte de tus mounts del host hoy está demasiado permisiva?
- ¿qué dato de tus contenedores no debería vivir en la writable layer?
- ¿qué mejora concreta te gustaría notar al volver un servicio más read-only?

Estas observaciones valen mucho más que memorizar opciones.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si un servicio casi no necesita escribir en su root filesystem, probablemente me conviene ________.  
> Si necesito escritura temporal no persistente, probablemente me conviene ________.  
> Si necesito persistencia real, probablemente me conviene ________.  
> Si el contenedor solo debe leer algo del host, probablemente me conviene un bind mount en modo ________.

Y además respondé:

- ¿por qué este tema endurece el contenedor más allá de simplemente no correr como root?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no dejar mounts y capas escribibles más de lo necesario?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar qué es la writable layer del contenedor
- usar `read_only` con más criterio en Compose
- distinguir mejor entre volumen, bind mount y tmpfs
- reducir superficies de escritura del contenedor
- seguir endureciendo tus servicios sin volverlos inmanejables

---

## Resumen del tema

- Por defecto, el contenedor escribe en una writable layer situada sobre capas de imagen inmutables y read-only. citeturn784042view2
- Compose documenta `read_only` para crear el contenedor con un filesystem de solo lectura. citeturn394900view0
- `tmpfs` monta un filesystem temporal en memoria útil para estado efímero no persistente. citeturn784042view1turn394900view1
- Los volúmenes son la opción correcta para persistencia real o datos de alto uso de escritura. citeturn784042view2turn207487search0turn207487search18
- Los bind mounts pueden escribir sobre el host por defecto, pero soportan `readonly` o `ro`. citeturn784042view6
- Hardening también significa reducir writable surfaces y evitar drift en runtime. citeturn784042view4
- Este tema te deja una capa muy útil de criterio para endurecer mejor el filesystem del contenedor.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque con otra práctica integrada de hardening:

- usuario no-root
- root filesystem más controlado
- mounts explícitos
- y una imagen/servicio que ya se vea mucho más deliberado y menos permisivo
