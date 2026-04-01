---
title: "No agregues privilegios de más: cap_add, cap_drop y privileged con criterio"
description: "Tema 77 del curso práctico de Docker: cómo pensar Linux capabilities en contenedores, cuándo usar cap_add o cap_drop en Compose, por qué privileged amplía muchísimo los permisos del contenedor y cómo aplicar el principio de mínimos privilegios en runtime."
order: 77
module: "Elegir bases e imágenes con criterio"
level: "intermedio"
draft: false
---

# No agregues privilegios de más: cap_add, cap_drop y privileged con criterio

## Objetivo del tema

En este tema vas a:

- entender qué son las Linux capabilities en el contexto de Docker
- usar `cap_add` y `cap_drop` con más criterio
- entender por qué `privileged` suele ser demasiado para muchos casos
- distinguir entre “mi contenedor necesita algo puntual” y “le estoy dando permisos de sobra”
- seguir endureciendo servicios desde el runtime, no solo desde la imagen

La idea es que no resuelvas problemas de permisos “abriendo todo”, sino agregando o quitando solo lo que realmente haga falta.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender qué problema resuelven las capabilities
2. ver qué exponen Docker y Compose para agregarlas o quitarlas
3. entender por qué `privileged` cambia muchísimo la postura de seguridad
4. construir una regla de mínimos privilegios en runtime
5. distinguir qué cosas conviene no tocar salvo que sea realmente necesario

---

## Idea central que tenés que llevarte

No todos los permisos extra son iguales.

A veces un contenedor necesita una capacidad puntual.
Por ejemplo, hacer algo de red o administrar cierto aspecto específico del sistema.

Pero darle permisos de más puede ampliar mucho el impacto de un error o compromiso.

Docker lo deja bastante claro: los contenedores, por defecto, ya tienen un conjunto reducido de capacidades y pueden endurecerse más con mecanismos como capacidades limitadas, seccomp y AppArmor. También advierte que `--privileged`, `--cap-add` y opciones parecidas elevan notablemente los privilegios del contenedor. citeturn390005search6turn390005search9turn793190search11

Dicho simple:

> si el contenedor necesita un permiso puntual,  
> intentá dar solo ese permiso puntual y no abrirlo todo.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker deja varias piezas muy claras para este tema:

- Compose documenta `cap_add`, `cap_drop` y `privileged` como atributos del servicio. citeturn390005search1
- La referencia de `docker run` explica que Docker retiene un subconjunto de capacidades por defecto y permite agregar o quitar capabilities específicas con `--cap-add` y `--cap-drop`. También documenta que `--privileged` otorga todas las capabilities, reconfigura LSMs y da acceso a todos los dispositivos del host. citeturn390005search0
- Docker muestra una tabla de capabilities que pueden agregarse o quitarse, y un patrón explícito para “drop all and add back only what you need”. citeturn390005search0
- La documentación de seguridad general refuerza que Docker ya viene con límites razonables por defecto y que correr como usuario no privilegiado dentro del contenedor agrega otra capa de seguridad. citeturn390005search6
- La FAQ de seguridad de contenedores en Docker Desktop dice directamente que contenedores `--privileged`, `--pid=host` o con `--cap-add` corren con privilegios elevados dentro de la VM y pueden acceder a internals de la VM y Docker Engine. citeturn390005search9

---

## Primer concepto: qué es una capability

Docker no define las capabilities como “root o no-root”, sino como permisos finos del kernel Linux que pueden agregarse o quitarse al contenedor.

La referencia de `docker run` lo presenta justamente en términos de capabilities específicas que el contenedor puede conservar, perder o recuperar. citeturn390005search0

La idea útil no es memorizar la teoría del kernel.
La idea útil es esta:

> una capability es una porción específica de privilegio que no siempre querés dar completa o permanentemente.

---

## Segundo concepto: Docker ya aplica un recorte por defecto

Docker Engine documenta que los contenedores no arrancan con acceso totalmente irrestricto, sino con un subconjunto de capabilities por defecto. La referencia de `docker run` incluso enumera capacidades retenidas por defecto, como `CHOWN`, `DAC_OVERRIDE`, `FOWNER`, `SETUID`, `SETGID`, `NET_BIND_SERVICE`, entre otras. citeturn390005search0

Eso ya te enseña algo importante:

- el runtime no arranca “totalmente abierto”
- pero tampoco significa que debas agregar más capabilities alegremente

---

## Tercer concepto: `cap_add`

Compose documenta `cap_add` así:

```yaml
cap_add:
  - ALL
```

como ejemplo de sintaxis, y la referencia de `docker run` lo vincula a `--cap-add` para sumar capabilities concretas al contenedor. citeturn390005search1turn390005search0

Un ejemplo más razonable que `ALL` sería algo como:

```yaml
services:
  app:
    image: miusuario/app:dev
    cap_add:
      - NET_ADMIN
```

### Cómo se lee
- el contenedor recibe una capability extra
- no se está abriendo “todo”
- se intenta resolver una necesidad concreta

La clave es justamente esa: **necesidad concreta**.

---

## Cuarto concepto: `cap_drop`

Compose también documenta `cap_drop`, y Docker muestra un patrón muy útil: podés quitar capabilities específicas o incluso quitar todas con `ALL` y luego devolver solo las mínimas necesarias. citeturn390005search1turn390005search0

Ejemplo:

```yaml
services:
  app:
    image: miusuario/app:dev
    cap_drop:
      - NET_ADMIN
      - SYS_ADMIN
```

O un enfoque más agresivo:

```yaml
services:
  app:
    image: miusuario/app:dev
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

Docker documenta justamente este patrón en CLI como:

```bash
--cap-add=ALL --cap-drop=MKNOD
```

o el inverso de quitar todo y sumar lo necesario. citeturn390005search0

---

## Por qué `cap_drop: [ALL]` es una idea interesante

Porque invierte la pregunta.

En vez de pensar:

- “¿qué cosas le saco?”

pasás a pensar:

- “¿qué necesita realmente este proceso para correr?”

Ese cambio mental es muy potente para hardening.

No siempre vas a poder llevarlo al extremo sin ensayo.
Pero conceptualmente es una muy buena dirección.

---

## Quinto concepto: `privileged`

Compose documenta `privileged` como atributo del servicio. Y Docker `run` explica que `--privileged` le da al contenedor **todas** las capabilities, habilita acceso a todos los dispositivos del host y reconfigura mecanismos como AppArmor o SELinux para dar al contenedor acceso casi equivalente al de la máquina host. citeturn390005search1turn390005search0turn793190search7

Eso es un cambio enorme.

No es “una capability más”.
Es una ampliación muchísimo más grande de privilegios.

---

## Por qué `privileged` suele ser demasiado

Porque, en la mayoría de los casos, el problema real no es:

> “mi contenedor necesita casi todo el poder del host”

sino algo mucho más acotado, como:

- bindear puertos
- tocar algo de red
- interactuar con un dispositivo concreto
- ejecutar una operación muy específica

Abrir todo con `privileged` suele resolver por fuerza bruta algo que quizá podía resolverse con mucho menos.

La documentación de Enhanced Container Isolation lo dice directamente: un contenedor privilegiado normalmente representa riesgos de seguridad significativos porque obtiene acceso prácticamente sin restricciones al kernel Linux. citeturn793190search7

---

## Una regla muy útil

Podés pensar así:

### ¿Mi contenedor necesita un permiso puntual?
Probablemente mirá `cap_add` para esa capability puntual.

### ¿Quiero endurecer más un servicio?
Pensá si podés usar `cap_drop` para quitar capacidades innecesarias.

### ¿Estoy tentado a usar `privileged`?
Frená y revisá si no estás abriendo demasiado para resolver un problema pequeño.

Esta regla sola te evita muchas malas decisiones.

---

## Qué relación tiene esto con no-root

En el tema 74 viste que correr como no-root es una mejora muy importante.

Esto no lo reemplaza.

La relación sana es:

- `USER` reduce privilegios del proceso dentro del contenedor
- capabilities controlan permisos más finos a nivel del runtime
- `privileged` es otra cosa mucho más grande y más delicada

Docker, en seguridad general, insiste en correr procesos como non-privileged users cuando sea posible, incluso antes de meterte en capas extra como seccomp o LSMs. citeturn390005search6

---

## Qué relación tiene esto con seccomp y otros límites

La documentación de seccomp dice que el perfil por defecto ya bloquea alrededor de 44 syscalls de más de 300, con un equilibrio razonable entre protección y compatibilidad. citeturn793190search11

Eso refuerza una idea importante:

- Docker ya trae límites razonables por defecto
- hardening no suele significar “agregá permisos”
- muchas veces significa **no romper** esos límites salvo que tengas una razón clara

---

## Qué capabilities aparecen mucho en ejemplos

La referencia de `docker run` muestra ejemplos como:

- `NET_ADMIN`
- `SYS_ADMIN`
- `MKNOD`
- `NET_BIND_SERVICE` citeturn390005search0

No hace falta que memorices la tabla completa.
Lo importante es ver el patrón:

- algunas capabilities son muy específicas
- otras son muy poderosas
- y no conviene tratarlas como si todas costaran lo mismo

Especialmente `SYS_ADMIN` suele verse como una capability muy amplia y sensible en la práctica, aunque acá el foco no es memorizar jerarquías, sino evitar abrir de más.

---

## Un ejemplo sano de ajuste fino

Imaginá un servicio que solo necesita bindear un puerto bajo y poco más.

Un enfoque más fino podría ser algo como:

```yaml
services:
  web:
    image: miusuario/web:prod
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

La lectura conceptual sería:

- quitás todo
- devolvés solo lo mínimo necesario
- evitás una apertura general de privilegios

No significa que esta sea siempre la receta exacta.
Sí significa que el razonamiento es mucho más sano que `privileged: true`.

---

## Un ejemplo de mala señal de diseño

```yaml
services:
  app:
    image: miusuario/app:dev
    privileged: true
```

Esto puede tener sentido en casos muy específicos y muy deliberados.
Pero como solución por defecto o “para que ande”, suele ser una señal de que estás resolviendo permisos de la forma más abierta posible.

---

## Qué no tenés que confundir

### `cap_add` no es lo mismo que `privileged`
Una agrega permisos puntuales.
El otro abre muchísimo más el contenedor. citeturn390005search0turn793190search7

### `cap_drop` no reemplaza a `USER`
Una cosa es el usuario del proceso.
Otra cosa son las capabilities del runtime.

### Que el contenedor “funcione” con `privileged` no significa que sea una buena configuración
Puede ser solo la forma más bruta de hacer que deje de fallar.

### Docker ya trae límites razonables por defecto
No conviene romperlos sin entender bien por qué. citeturn390005search0turn793190search11

---

## Error común 1: usar `privileged` como parche rápido

Eso puede resolver síntomas, pero también amplía muchísimo el riesgo. citeturn793190search7turn390005search9

---

## Error común 2: agregar capabilities sin poder explicar para qué

Si no podés describir qué permiso puntual necesitás, probablemente todavía no deberías agregarlo.

---

## Error común 3: olvidar que los bind mounts del host y los privilegios extra se potencian entre sí

La FAQ de seguridad de contenedores deja claro que contenedores con privilegios elevados pueden acceder a internals de la VM y Docker Engine; mezclar eso con mounts poderosos no es algo para tomar livianamente. citeturn390005search9

---

## Error común 4: endurecer el Dockerfile pero abrir de más el runtime

Hardening de imagen y hardening de ejecución tienen que conversar entre sí.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Respondé con tus palabras:

- qué es una capability en este contexto
- qué diferencia hay entre `cap_add` y `cap_drop`
- por qué `privileged` suele ser mucho más amplio

### Ejercicio 2
Compará estos tres servicios:

#### Servicio A
```yaml
services:
  app:
    image: miusuario/app:dev
```

#### Servicio B
```yaml
services:
  app:
    image: miusuario/app:dev
    cap_add:
      - NET_ADMIN
```

#### Servicio C
```yaml
services:
  app:
    image: miusuario/app:dev
    privileged: true
```

Respondé:

- cuál mantiene la postura más conservadora
- cuál agrega un permiso puntual
- cuál abre muchísimo más el contenedor
- por qué no conviene tratarlos como equivalentes

### Ejercicio 3
Ahora pensá este patrón:

```yaml
services:
  web:
    image: miusuario/web:prod
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

Y respondé:

- qué lógica de mínimos privilegios ves ahí
- por qué te parece más sana que `privileged: true`
- qué pregunta deberías hacerte antes de agregar una capability nueva

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- si hoy le estás dando privilegios extra al contenedor
- si realmente sabés cuáles necesita
- si podrías probar un enfoque más conservador
- si alguna vez pensaste en `privileged` como atajo
- qué servicio tuyo te gustaría revisar primero con esta lógica

No hace falta escribir todavía el `compose.yaml` final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre permiso puntual y apertura total?
- ¿qué servicio tuyo hoy podría estar más privilegiado de lo necesario?
- ¿qué te parece más peligroso: agregar capabilities sin entenderlas o marcar todo como privileged?
- ¿qué parte del runtime hoy te gustaría endurecer más?
- ¿qué mejora concreta te gustaría ver en tu criterio de permisos después de este tema?

Estas observaciones valen mucho más que memorizar nombres de capabilities.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si necesito un permiso puntual, probablemente me conviene ________.  
> Si quiero quitar privilegios innecesarios, probablemente me conviene ________.  
> Si estoy tentado a usar `privileged`, probablemente primero debería preguntarme ________.

Y además respondé:

- ¿por qué este tema impacta tanto en el hardening del runtime?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no abrir privilegios de más?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar qué son las capabilities en el contexto de Docker
- distinguir `cap_add`, `cap_drop` y `privileged`
- pensar mejor cuándo agregar o quitar privilegios de runtime
- evitar `privileged` como solución por defecto
- aplicar una lógica más sana de mínimos privilegios en la ejecución del contenedor

---

## Resumen del tema

- Compose documenta `cap_add`, `cap_drop` y `privileged` como atributos del servicio. citeturn390005search1
- Docker `run` documenta que el runtime ya aplica un subconjunto de capabilities por defecto y permite agregar o quitar capacidades específicas. citeturn390005search0
- Docker también documenta un patrón válido de quitar todas las capabilities y devolver solo las mínimas necesarias. citeturn390005search0
- `--privileged` da todas las capabilities, acceso a todos los dispositivos y relaja mecanismos de seguridad como AppArmor o SELinux. citeturn390005search0turn793190search7
- La documentación de seguridad de Docker refuerza que los contenedores ya son bastante seguros por defecto, especialmente si corrés procesos como usuarios no privilegiados y no abrís privilegios extra sin necesidad. citeturn390005search6turn793190search11
- Este tema te deja una base mucho más madura para decidir qué privilegios extra, si alguno, realmente necesita tu contenedor.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque con una práctica integrada de runtime hardening:

- no-root
- filesystem más controlado
- capabilities más restringidas
- y un servicio que ya se vea bastante más cerrado y deliberado en su ejecución
