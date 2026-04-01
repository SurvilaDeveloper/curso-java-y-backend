---
title: "Evitá depender de IPs fijas: preferí nombres de servicio y redes bien diseñadas"
description: "Tema 83 del curso práctico de Docker: cuándo existen las IPs estáticas en Docker Compose, por qué normalmente conviene evitarlas, y cómo preferir nombres de servicio, aliases y redes bien diseñadas para lograr resolución más estable y stacks menos frágiles."
order: 83
module: "Networking entre servicios y puertos con Compose"
level: "intermedio"
draft: false
---

# Evitá depender de IPs fijas: preferí nombres de servicio y redes bien diseñadas

## Objetivo del tema

En este tema vas a:

- entender cuándo Docker Compose permite IPs estáticas
- ver por qué normalmente no conviene depender de ellas
- preferir nombres de servicio y aliases antes que direcciones manuales
- entender el papel de `ipam` y `ipv4_address`
- construir un criterio más sano para resolución estable dentro del stack

La idea es que no resuelvas conectividad interna “clavando IPs” si el problema ya se puede resolver mucho mejor con la red y el naming de Compose.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. recordar cómo resuelve servicios Compose por defecto
2. ver dónde aparecen las IPs estáticas en la documentación
3. entender por qué suelen ser una mala primera opción
4. comparar IP fija vs nombre de servicio
5. construir una regla práctica para stacks más estables y menos frágiles

---

## Idea central que tenés que llevarte

Docker y Compose ya te dan algo muy potente por defecto:

- redes del proyecto
- descubrimiento por nombre
- aliases por red
- segmentación entre servicios

Eso hace que, en la mayoría de los casos, no necesites pelearte con IPs fijas.

Dicho simple:

> si lo que querés es resolución estable dentro del stack,  
> normalmente te conviene más un buen nombre de servicio o un alias claro que una IP manual.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker Compose explica que, por defecto, Compose crea una red para la aplicación y que cada servicio es alcanzable por otros contenedores y descubrible por su nombre. También documenta que las redes pueden configurarse con direcciones IP estáticas usando `ipv4_address` y/o `ipv6_address` para cada red conectada, siempre que la configuración `ipam` de esa red cubra la dirección asignada. Por otro lado, Docker Engine documenta que en una red definida por el usuario los contenedores pueden comunicarse usando nombre o IP, y en la guía de conceptos de contenedores remarca que en redes custom los contenedores se resuelven por nombre o alias. Además, Docker documenta cómo habilitar subredes IPv6 en Compose, lo que muestra que la asignación explícita de direcciones existe, pero depende de una configuración más avanzada del network. citeturn459463view1turn459463view0turn459463view3turn459463view2turn459463view4

---

## Primer concepto: Compose ya resuelve por nombre

La referencia oficial de redes de Compose dice que, por defecto, cada contenedor para un servicio se une a la red por defecto y es:

- alcanzable por otros contenedores de esa red
- descubrible por el nombre del servicio citeturn459463view1

Eso ya te da una regla muy útil:

```text
app -> db
app -> redis
proxy -> app
```

sin tener que fijar direcciones manuales.

---

## Qué problema resuelve ya el nombre del servicio

Resuelve algo muy importante:

- no dependés de recordar IPs
- no te peleás con direcciones que cambian
- no convertís el stack en algo más rígido de lo necesario
- el networking queda mucho más legible

Ese valor suele subestimarse bastante.

---

## Segundo concepto: sí, Docker Compose soporta IPs estáticas

La guía oficial de networking en Compose lo dice explícitamente: podés configurar redes con direcciones IP estáticas usando `ipv4_address` y/o `ipv6_address` para cada red conectada. citeturn459463view0

La referencia de servicios también documenta `ipv4_address` y aclara que la red correspondiente debe tener un bloque `ipam` con subred que cubra esa dirección. citeturn99626search0

Un ejemplo conceptual sería:

```yaml
services:
  db:
    image: postgres:18
    networks:
      backend:
        ipv4_address: 172.28.0.10

networks:
  backend:
    ipam:
      config:
        - subnet: 172.28.0.0/16
```

---

## Cómo se lee ese ejemplo

La lectura conceptual sería:

- la red `backend` tiene una subred explícita
- el servicio `db` recibe una IP concreta dentro de esa subred
- el stack deja de apoyarse solo en naming y pasa a depender también de direccionamiento manual

Y ahí aparece la pregunta importante del tema:

> ¿realmente necesitabas hacer esto?

---

## Tercer concepto: una IP fija suele ser más frágil que un nombre

Un nombre de servicio como:

```text
db
```

expresa una intención clara y estable.

Una IP como:

```text
172.28.0.10
```

expresa un detalle de implementación mucho más bajo nivel.

Eso suele volver el stack más frágil porque:

- acopla más las piezas
- cuesta más leerlo
- cuesta más cambiarlo
- obliga a mantener subredes y direcciones como parte del diseño normal

Compose ya te da resolución por nombre precisamente para que no tengas que caer en eso salvo que haya una necesidad concreta. citeturn459463view1turn459463view2

---

## Cuarto concepto: una red bien diseñada suele reemplazar la necesidad de IP fija

Muchas veces, cuando alguien cree que necesita IP fija, el problema real es otro.

Por ejemplo:

- un nombre de servicio poco claro
- falta de alias en una red concreta
- una segmentación de redes mal resuelta
- una integración externa que todavía no pensaste bien

En varios de esos casos, la solución sana suele ser:

- mejor naming
- mejor segmentación
- alias por red
- exposición controlada al host

y no `ipv4_address`.

---

## Qué te da un alias que una IP no te da

Un alias te da algo como:

- un nombre funcional
- legibilidad
- flexibilidad por red
- menos acoplamiento al direccionamiento

Y Docker documenta justamente que en redes custom los contenedores pueden resolverse por nombre o alias. citeturn459463view2turn459463view3

Por eso, cuando lo que querés es “un nombre estable más cómodo”, normalmente el candidato correcto es `aliases`, no una IP fija.

---

## Quinto concepto: IP fija implica IPAM explícito

La referencia de servicios aclara que para usar `ipv4_address`, la red debe tener una configuración `ipam` con subredes que cubran esa dirección. citeturn99626search0

Eso ya te muestra que no es una opción trivial ni casual.

No es:

- “le pongo una IP y listo”

Es:

- “ahora estoy diseñando subredes explícitas y acoplando el stack a ese direccionamiento”

Eso puede tener sentido, pero claramente es una decisión más pesada.

---

## Cuándo podría tener sentido una IP fija

Puede tener sentido en casos más especiales, como:

- integración con software legacy que exige una IP concreta
- reglas muy específicas de allowlist donde de verdad no podés resolverlo mejor
- laboratorios o entornos de prueba donde el objetivo justamente es practicar direccionamiento
- escenarios donde el naming no alcanza porque el requisito externo ya viene atado a IP

La clave no es decir “nunca”.
La clave es decir:

> que exista no significa que deba ser tu primer recurso.

---

## Cuándo normalmente no hace falta

Normalmente no hace falta cuando:

- todos los servicios viven dentro del mismo stack
- la comunicación es interna entre contenedores
- podés usar nombre de servicio
- podés usar alias por red
- el verdadero problema era de segmentación o exposición al host

En esos casos, una IP fija suele ser una complicación innecesaria.

---

## Un ejemplo sano sin IP fija

```yaml
services:
  app:
    image: miusuario/app:dev
    environment:
      DB_HOST: db
    networks:
      - backend

  db:
    image: postgres:18
    networks:
      backend:
        aliases:
          - database

networks:
  backend:
```

### Cómo se lee
- `app` puede hablar con `db` por `db`
- o incluso por `database` si eso ayuda a la claridad
- no hubo que fijar ninguna IP
- la resolución sigue siendo estable y legible

Este enfoque suele ser bastante más sano que:

```text
DB_HOST=172.28.0.10
```

---

## Qué pasa con IPv6

Docker documenta también cómo habilitar redes IPv6 en Compose usando:

```yaml
networks:
  ip6net:
    enable_ipv6: true
    ipam:
      config:
        - subnet: 2001:db8::/64
```

citeturn459463view4

Esto es útil para ver que el mundo de direcciones explícitas existe y puede ser válido, pero también refuerza una idea:
cuando te metés en direccionamiento manual, ya estás entrando en una capa bastante más avanzada y menos necesaria para el día a día de muchos stacks Compose.

---

## Una regla muy útil

Podés pensar así:

### ¿Solo necesitás que un servicio encuentre a otro?
Usá el nombre del servicio.

### ¿Necesitás un nombre más claro o compatible en una red concreta?
Usá un alias.

### ¿El problema es que frontend y backend no deberían mezclarse?
Diseñá mejor las redes.

### ¿Solo después de todo eso seguís necesitando una dirección fija?
Recién ahí evaluá `ipv4_address` con `ipam`.

Esta secuencia te evita mucha complejidad innecesaria.

---

## Qué no tenés que confundir

### IP fija no es lo mismo que resolución estable
La resolución estable ya la podés lograr con nombre o alias. citeturn459463view1turn459463view2

### `ipv4_address` no funciona “solo”
Necesita una red con `ipam` que cubra esa dirección. citeturn99626search0

### Que Docker permita comunicarse por IP no significa que sea la mejor forma
La misma documentación remarca que en redes custom los contenedores también pueden resolverse por nombre o alias. citeturn459463view2turn459463view3

### Más control de direccionamiento no siempre significa mejor diseño
A veces solo significa más acoplamiento.

---

## Error común 1: usar IP fija para resolver un problema de naming

Muchas veces un buen nombre o alias ya resolvía el caso.

---

## Error común 2: usar IP fija para resolver un problema de segmentación

Si dos grupos de servicios están mal conectados, quizá el problema es de redes, no de direcciones.

---

## Error común 3: fijar IPs sin pensar cómo vas a mantener subredes y direcciones con el tiempo

Eso vuelve el stack más rígido y más delicado de tocar.

---

## Error común 4: creer que “más bajo nivel” siempre significa “más profesional”

A veces la decisión más profesional es justamente usar la abstracción correcta: nombre de servicio y redes bien pensadas.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Compará estas dos ideas para que `app` llegue a la base:

#### Opción A
```text
DB_HOST=db
```

#### Opción B
```text
DB_HOST=172.28.0.10
```

Respondé con tus palabras:

- cuál te parece más legible
- cuál te parece más flexible
- cuál te acopla más a detalles de red
- cuál elegirías como punto de partida normal

### Ejercicio 2
Mirá este ejemplo con IP fija:

```yaml
services:
  db:
    image: postgres:18
    networks:
      backend:
        ipv4_address: 172.28.0.10

networks:
  backend:
    ipam:
      config:
        - subnet: 172.28.0.0/16
```

Respondé:

- por qué acá hace falta `ipam`
- qué costo de mantenimiento agrega esta decisión
- en qué tipo de caso excepcional te la imaginarías justificada

### Ejercicio 3
Ahora comparalo con este ejemplo:

```yaml
services:
  app:
    image: miusuario/app:dev
    environment:
      DB_HOST: db
    networks:
      - backend

  db:
    image: postgres:18
    networks:
      backend:
        aliases:
          - database

networks:
  backend:
```

Respondé:

- qué ventaja te da usar nombre y alias
- por qué esto suele ser más sano que una IP fija
- qué problema real creés que resuelve mejor este enfoque

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- si hoy estás tentado a usar IPs fijas en algún lado
- si ese problema en realidad podría resolverse con nombre de servicio o alias
- si la dificultad real hoy es de naming, de redes o de exposición al host
- qué servicio tuyo te gustaría dejar de “direccionar” manualmente
- qué decisión te gustaría simplificar primero en el networking

No hace falta escribir todavía el `compose.yaml` final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre estabilidad de resolución y direccionamiento fijo?
- ¿en qué proyecto tuyo hoy estarías complicando algo con IPs que quizás no hacen falta?
- ¿qué parte del stack se beneficiaría más de nombres mejores en vez de direcciones manuales?
- ¿qué caso realmente sí te parecería candidato a `ipv4_address`?
- ¿qué mejora concreta te gustaría notar al evitar más direccionamiento manual?

Estas observaciones valen mucho más que memorizar la sintaxis de `ipam`.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si solo necesito que un servicio encuentre a otro dentro del stack, probablemente me conviene usar el ________ del servicio.  
> Si necesito un nombre alternativo más claro dentro de una red concreta, probablemente me conviene usar un ________.  
> Si después de eso todavía necesito una dirección fija por una razón externa real, recién ahí me conviene evaluar ________ junto con ________.

Y además respondé:

- ¿por qué este tema ayuda tanto a evitar stacks frágiles?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no depender de IPs manuales sin necesidad?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar cuándo Compose ya resuelve bien por nombre
- entender qué implica usar `ipv4_address`
- distinguir mejor entre resolución estable y direccionamiento fijo
- preferir nombres, aliases y redes bien diseñadas antes que IPs manuales
- identificar mejor cuándo una IP fija es realmente excepcional

---

## Resumen del tema

- Compose, por defecto, crea redes donde los servicios son alcanzables y descubribles por nombre. citeturn459463view1turn459463view0
- Docker documenta que las redes pueden configurarse con IPs estáticas usando `ipv4_address` y/o `ipv6_address`. citeturn459463view0
- Para usar `ipv4_address`, la red correspondiente debe tener `ipam` con una subred que cubra esa dirección. citeturn99626search0
- En redes definidas por el usuario, los contenedores pueden comunicarse por nombre o alias, no solo por IP. citeturn459463view2turn459463view3
- Docker también documenta cómo habilitar subredes IPv6 en Compose, lo que muestra que el direccionamiento explícito existe pero pertenece a una capa más avanzada. citeturn459463view4
- Este tema te deja una base mucho más madura para preferir nombres estables y redes bien pensadas antes que IPs fijas por costumbre.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque con una práctica integrada de networking más completa:

- nombres
- redes
- segmentación
- sin IPs fijas
- y un stack donde la resolución ya se vea mucho más deliberada y menos frágil
