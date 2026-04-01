---
title: "Práctica integrada de runtime hardening: no-root, filesystem controlado y capabilities mínimas"
description: "Tema 78 del curso práctico de Docker: una práctica integrada donde combinás usuario no-root, root filesystem más controlado y capabilities recortadas para ejecutar un servicio con menos privilegios, menos superficies abiertas y una postura de runtime mucho más deliberada."
order: 78
module: "Elegir bases e imágenes con criterio"
level: "intermedio"
draft: false
---

# Práctica integrada de runtime hardening: no-root, filesystem controlado y capabilities mínimas

## Objetivo del tema

En este tema vas a:

- juntar varias ideas del bloque de hardening en una sola práctica
- ejecutar el proceso final como usuario no-root
- controlar mejor la superficie de escritura del contenedor
- restringir privileges de runtime con `cap_drop` y, si hace falta, `cap_add`
- evitar el uso de `privileged` como atajo
- pensar el servicio final como algo bastante más cerrado y deliberado

La idea es cerrar este bloque con una práctica donde ya no veas el hardening como piezas aisladas, sino como un conjunto de decisiones que se refuerzan entre sí.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. partir de un servicio que funciona pero está demasiado abierto
2. mejorar el Dockerfile para correr como no-root
3. controlar mejor el filesystem con `read_only`, `tmpfs` y mounts explícitos
4. restringir capabilities del runtime
5. evitar `privileged` salvo que haya una necesidad muy excepcional
6. comparar el antes y el después como postura de ejecución

---

## Idea central que tenés que llevarte

Ya viste tres ejes importantes:

- **quién** ejecuta el proceso
- **dónde** puede escribir
- **qué privilegios extra** recibe en runtime

Este tema junta todo eso con una idea muy clara:

> un contenedor más seguro no suele surgir de una única opción mágica,  
> sino de combinar menos privilegios, menos superficies de escritura y menos poderes extra en ejecución.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker recomienda usar `USER` cuando el servicio puede correr sin privilegios y sugiere considerar UID/GID explícitos cuando la identidad importe. La referencia de Dockerfile también documenta `COPY --chown` y aclara que, sin ese flag, los archivos copiados quedan como UID/GID 0. Compose documenta `read_only`, `tmpfs`, `cap_add`, `cap_drop` y `privileged` como atributos del servicio. Docker Engine explica que los contenedores arrancan con un conjunto reducido de capabilities por defecto y que la mejor práctica es quitar todas las capabilities salvo las estrictamente necesarias. También documenta que `--privileged` otorga todas las capabilities, acceso a todos los dispositivos y relaja mecanismos de seguridad. Y la documentación de hardening refuerza que endurecer implica correr como no-root, reducir writable surfaces y mantener consistencia e inmutabilidad donde sea posible. citeturn517460search1turn517460search4turn517460search0turn517460search2turn517460search22turn517460search3turn517460search6

---

## Escenario del tema

Vas a imaginar una app web simple que:

- sirve HTTP
- no necesita privilegios elevados para correr
- necesita algo de escritura temporal en `/tmp`
- lee configuración montada desde afuera
- no debería modificar libremente su root filesystem
- y no necesita capabilities extra salvo casos muy puntuales

Este es un caso muy bueno para juntar hardening de imagen y de runtime.

---

## Primera versión: funciona, pero está demasiado abierta

Imaginá este Dockerfile:

```Dockerfile
FROM node:22
WORKDIR /app
COPY . .
CMD ["node", "server.js"]
```

Y este Compose:

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
```

---

## Qué problema tiene esta versión

Puede funcionar, sí.

Pero deja demasiadas cosas abiertas:

- el proceso probablemente corre como root
- los archivos copiados quedaron como root
- el root filesystem sigue escribible
- la app puede apoyarse en la writable layer para cualquier cosa
- el runtime no explicita ni recorta privileges adicionales

No es que esté “rota”.
Es que está demasiado permisiva para lo que realmente necesita.

---

## Paso 1: endurecer el Dockerfile

Ahora imaginá esta versión:

```Dockerfile
FROM node:22

WORKDIR /app

RUN groupadd -g 1001 appgroup &&     useradd --no-log-init -u 1001 -g appgroup appuser

COPY package*.json ./
RUN npm install

COPY --chown=appuser:appgroup . .

USER appuser

CMD ["node", "server.js"]
```

---

## Qué mejora introduce esta versión

Introduce varias mejoras concretas:

- el proceso final ya no corre como root
- la identidad es explícita y más predecible
- los archivos de la app quedan con ownership correcto
- la imagen deja mucho más clara su intención de mínimos privilegios

Docker recomienda explícitamente usar `USER` cuando el servicio puede correr sin privilegios, y documenta `COPY --chown` justo para evitar que los archivos queden como root. citeturn517460search1turn517460search4

---

## Qué sigue faltando

Aunque esta imagen ya mejora mucho, todavía faltan dos preguntas importantes:

1. ¿de verdad el root filesystem debería seguir escribible?
2. ¿de verdad el runtime necesita todas las capabilities por defecto que no sean imprescindibles?

Ahí entra la segunda mitad del tema.

---

## Paso 2: controlar mejor la escritura

Ahora imaginá este Compose:

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    read_only: true
    tmpfs:
      - /tmp
      - /run
    volumes:
      - ./config:/app/config:ro
      - app-data:/app/data

volumes:
  app-data:
```

---

## Cómo se lee esta mejora

La lectura conceptual sería:

- el root filesystem queda de solo lectura
- la escritura temporal va a `/tmp` y `/run` mediante `tmpfs`
- la configuración del host entra como bind mount read-only
- la persistencia real se declara con un volumen explícito

Compose documenta `read_only` para crear el contenedor con filesystem de solo lectura y `tmpfs` para mounts temporales en memoria; Docker también documenta que los bind mounts son escribibles por defecto salvo que los montes como `readonly`. citeturn517460search0turn517460search6turn517460search3

---

## Qué gana este paso

Gana varias cosas al mismo tiempo:

- menos superficie de escritura
- menos cambios accidentales sobre el root filesystem
- puntos de escritura mucho más explícitos
- mejor separación entre estado efímero, persistencia y lectura de configuración

Docker hardening remarca justamente que reducir writable surfaces forma parte del endurecimiento básico. citeturn517460search3

---

## Paso 3: revisar capabilities

Ahora llega la parte de runtime más fina.

Docker Engine documenta que los contenedores arrancan con un conjunto reducido de capabilities y que la mejor práctica general es **remove all capabilities except those explicitly required**. citeturn517460search22turn517460search2

Entonces, un enfoque duro pero muy claro podría ser:

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    read_only: true
    tmpfs:
      - /tmp
      - /run
    volumes:
      - ./config:/app/config:ro
      - app-data:/app/data
    cap_drop:
      - ALL
```

---

## Cómo se lee esta mejora

La lectura conceptual sería:

- además de correr como no-root
- además de restringir el filesystem
- ahora el runtime deja de asumir que el contenedor necesita capabilities adicionales si no está demostrado

Este paso es muy importante porque te obliga a pensar de forma inversa:

> “¿qué necesita realmente esta app?”  
> y no  
> “¿qué le dejo abierto por si acaso?”

---

## ¿Y si realmente necesito una capability puntual?

En ese caso, el patrón sano sería:

```yaml
services:
  web:
    build: .
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

Docker documenta exactamente esta lógica general de quitar capacidades y devolver solo las mínimas necesarias. citeturn517460search2turn517460search22

---

## Cuándo tendría sentido algo así

Tendría sentido cuando tenés una necesidad concreta y podés nombrarla.

Por ejemplo:

- bindear un puerto bajo
- una capability de red muy específica
- una operación puntual que sin ese permiso no funciona

La clave no es memorizar todas las capabilities.
La clave es evitar dar permisos “por reflejo”.

---

## Qué pasa con `privileged`

Compose documenta `privileged` como atributo del servicio, y Docker Engine documenta que `--privileged` otorga todas las capabilities, acceso a todos los dispositivos del host y relaja mecanismos de seguridad. citeturn517460search0turn517460search2

Eso es un cambio enorme.

No es “un ajuste más”.
Es una apertura muy grande del contenedor.

---

## Por qué `privileged` no debería ser tu salida por defecto

Porque muchas veces el problema real no es:

> “necesito casi todo el poder del host”

sino algo mucho más acotado.

Usar `privileged` como parche rápido suele ser señal de que:

- no identificaste bien el permiso que falta
- o estás resolviendo un problema pequeño con una apertura demasiado grande

La documentación de seguridad y la de enhanced isolation dejan claro que un contenedor con privilegios elevados representa una superficie de riesgo muy superior. citeturn517460search22turn517460search15turn517460search6

---

## Stack final integrado de la práctica

Un ejemplo integrado y bastante sano podría quedar así:

### Dockerfile

```Dockerfile
FROM node:22

WORKDIR /app

RUN groupadd -g 1001 appgroup &&     useradd --no-log-init -u 1001 -g appgroup appuser

COPY package*.json ./
RUN npm install

COPY --chown=appuser:appgroup . .

USER appuser

CMD ["node", "server.js"]
```

### compose.yaml

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    read_only: true
    tmpfs:
      - /tmp
      - /run
    volumes:
      - ./config:/app/config:ro
      - app-data:/app/data
    cap_drop:
      - ALL

volumes:
  app-data:
```

---

## Qué gana esta práctica integrada

Gana varias cosas a la vez:

- el proceso no corre como root
- los archivos de la app tienen ownership correcto
- el root filesystem no queda escribible por defecto
- las escrituras legítimas se hacen explícitas
- la persistencia sale de la writable layer
- el runtime evita capacidades innecesarias

Esto ya se ve muchísimo más deliberado que el punto de partida.

---

## Qué te enseña realmente esta práctica

Te enseña a pensar el runtime así:

- identidad del proceso explícita
- filesystem más restringido
- mounts declarados según propósito
- capabilities recortadas
- `privileged` fuera de la ruta por defecto

Ese cambio mental es muy importante porque deja de tratar al contenedor como algo “abierto hasta que falle” y pasa a tratarlo como algo **cerrado salvo donde realmente necesita abrirse**.

---

## Qué no tenés que confundir

### `USER` no reemplaza `cap_drop`
Una cosa es la identidad del proceso.
Otra son los privilegios finos del runtime. citeturn517460search1turn517460search2

### `read_only` no reemplaza volúmenes o `tmpfs`
Solo controla el root filesystem. Las escrituras legítimas siguen necesitando sus mounts correctos. citeturn517460search0turn517460search3

### `cap_drop: [ALL]` no significa que siempre vaya a funcionar sin ajustes
Significa partir de una postura más conservadora y devolver solo lo que realmente haga falta. citeturn517460search22turn517460search2

### `privileged` no es equivalente a una capability puntual
Abre muchísimo más el contenedor. citeturn517460search2turn517460search15

---

## Error común 1: bajar a no-root pero dejar el runtime abierto de más

Eso endurece una parte, pero deja otra demasiado permisiva.

---

## Error común 2: volver read-only el root filesystem pero olvidarte de rutas temporales o persistentes

La idea no es romper la app, sino declarar mejor lo que sí necesita escribir.

---

## Error común 3: usar `privileged` como atajo antes de entender si bastaba una capability puntual

Eso suele ampliar demasiado el riesgo sin necesidad. citeturn517460search2turn517460search15

---

## Error común 4: tratar hardening como una sola decisión aislada

Este tema existe justamente para mostrar que las capas se complementan.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Compará mentalmente estas dos configuraciones.

#### Versión A
```Dockerfile
FROM node:22
WORKDIR /app
COPY . .
CMD ["node", "server.js"]
```

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
```

#### Versión B
```Dockerfile
FROM node:22

WORKDIR /app

RUN groupadd -g 1001 appgroup &&     useradd --no-log-init -u 1001 -g appgroup appuser

COPY package*.json ./
RUN npm install

COPY --chown=appuser:appgroup . .

USER appuser

CMD ["node", "server.js"]
```

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    read_only: true
    tmpfs:
      - /tmp
      - /run
    volumes:
      - ./config:/app/config:ro
      - app-data:/app/data
    cap_drop:
      - ALL

volumes:
  app-data:
```

### Ejercicio 2
Respondé con tus palabras:

- qué parte endurece el Dockerfile de la versión B
- qué parte endurece el Compose de la versión B
- qué gana el servicio al combinar ambas capas
- por qué esto es más sano que dejar todo root, writable y con privilegios por defecto

### Ejercicio 3
Ahora pensá este ajuste:

```yaml
cap_drop:
  - ALL
cap_add:
  - NET_BIND_SERVICE
```

Y respondé:

- qué lógica de mínimos privilegios ves ahí
- por qué es mejor que `privileged: true`
- qué pregunta deberías hacerte antes de agregar una capability

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- si el proceso final corre como root o no
- si el root filesystem realmente necesita seguir abierto
- qué rutas podrían pasar a `tmpfs`
- qué datos deberían ir a un volumen
- si alguna capability extra sería realmente necesaria
- si alguna vez resolviste algo con permisos más grandes de los que correspondían

No hace falta escribir todavía el Dockerfile o Compose final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la relación entre identidad, escritura y privilegios de runtime?
- ¿qué servicio tuyo hoy se ve más abierto de lo necesario?
- ¿qué parte del runtime te cuesta más endurecer: usuario, filesystem o capabilities?
- ¿en qué caso te imaginás que `cap_drop: [ALL]` sería una prueba interesante?
- ¿qué mejora concreta te gustaría notar al volver un servicio más deliberado?

Estas observaciones valen mucho más que memorizar opciones.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero bajar privilegios del proceso final, probablemente me conviene ________.  
> Si quiero que el root filesystem no quede abierto por defecto, probablemente me conviene ________.  
> Si quiero restringir más los privilegios finos del runtime, probablemente me conviene ________.  
> Si necesito una capability puntual, probablemente me conviene ________.  
> Si estoy tentado a usar `privileged`, primero debería preguntarme ________.

Y además respondé:

- ¿por qué esta práctica te parece mucho más cercana a un contenedor “deliberado”?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no dejar root, escritura y privilegios extra abiertos a la vez?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- combinar no-root, filesystem más controlado y capabilities mínimas en una misma práctica
- distinguir qué problema resuelve cada capa
- endurecer mejor un servicio sin volverlo inmanejable
- evitar `privileged` como solución por defecto
- pensar el runtime del contenedor con bastante más criterio y menos permisos implícitos

---

## Resumen del tema

- Docker recomienda correr como no-root cuando el servicio puede hacerlo y usar ownership correcto en archivos. citeturn517460search1turn517460search4
- Compose permite volver read-only el root filesystem y declarar escrituras temporales con `tmpfs`. citeturn517460search0turn517460search3
- Docker documenta que los contenedores ya arrancan con un conjunto limitado de capabilities y recomienda quitar todas las que no sean necesarias. citeturn517460search22turn517460search2
- `privileged` abre muchísimo más el contenedor que una capability puntual. citeturn517460search2turn517460search15turn517460search6
- Hardening también implica reducir writable surfaces y mantener consistencia e inmutabilidad donde sea posible. citeturn517460search3
- Esta práctica te deja una forma bastante más madura de pensar un contenedor menos permisivo y más explícito en su runtime.

---

## Próximo tema

En el próximo bloque vas a empezar a moverte hacia una capa muy importante del trabajo real con Docker:

- networking entre servicios
- puertos internos y publicados
- DNS de Compose
- y cómo pensar mejor la conectividad del stack sin exponer de más
