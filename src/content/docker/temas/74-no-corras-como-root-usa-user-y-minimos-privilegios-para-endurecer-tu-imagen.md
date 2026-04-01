---
title: "No corras como root: usá USER y mínimos privilegios para endurecer tu imagen"
description: "Tema 74 del curso práctico de Docker: cómo usar la instrucción USER, crear usuarios no privilegiados, asignar ownership correcto y aplicar mínimos privilegios para que tus contenedores no corran como root sin necesidad."
order: 74
module: "Elegir bases e imágenes con criterio"
level: "intermedio"
draft: false
---

# No corras como root: usá USER y mínimos privilegios para endurecer tu imagen

## Objetivo del tema

En este tema vas a:

- entender por qué correr como root dentro del contenedor suele ser una mala idea
- usar `USER` en el Dockerfile con más criterio
- crear usuarios y grupos no privilegiados
- asignar ownership correcto a archivos y carpetas
- evitar imágenes que funcionan “de casualidad” solo porque todo corre con permisos excesivos

La idea es que empieces a endurecer tus imágenes desde una decisión muy concreta y muy importante: **quién ejecuta realmente el proceso dentro del contenedor**.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender por qué Docker recomienda no correr como root cuando no hace falta
2. ver qué hace exactamente la instrucción `USER`
3. crear un usuario y grupo dedicados dentro de la imagen
4. usar `COPY --chown` y ownership correcto
5. entender algunos límites prácticos del no-root
6. construir una regla simple de mínimos privilegios para tus próximos Dockerfiles

---

## Idea central que tenés que llevarte

Cuando una app corre como root dentro del contenedor, tiene más privilegios de los que muchas veces necesita.

Eso amplía el impacto potencial de errores, malas configuraciones o compromisos dentro del contenedor. Docker lo resume desde varias capas: en best practices recomienda cambiar a un usuario no root cuando el servicio puede correr sin privilegios; en hardening dice que endurecer una imagen implica aplicar least privilege; y en user namespace remap remarca que la mejor forma de evitar escaladas desde dentro del contenedor es configurar la app para correr como usuario no privilegiado. citeturn763390view0turn763390view2turn763390view4

Dicho simple:

> si tu servicio no necesita privilegios elevados,  
> no lo corras como root.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker deja varias ideas muy claras para este tema:

- en build best practices, Docker recomienda usar `USER` para cambiar a un usuario no root si el servicio puede correr sin privilegios, y además sugiere considerar UID/GID explícitos. citeturn763390view0turn901918search3
- la referencia de Dockerfile explica que `USER` define el usuario y grupo por defecto para el resto de la etapa actual, y que ese usuario aplica tanto a `RUN` como al runtime de `ENTRYPOINT` y `CMD`. citeturn602475view0turn602475view2
- la referencia de Dockerfile también documenta `COPY --chown`, y aclara que sin esa opción los archivos copiados quedan con UID/GID 0. citeturn602475view1
- Docker desaconseja instalar o usar `sudo` dentro de la imagen por comportamientos impredecibles de TTY y forwarding de señales. citeturn763390view0
- Docker Hardened Images documenta que endurecer la base incluye correr como no-root y reducir superficies de escritura. citeturn763390view2
- Docker también advierte que aplicaciones que corren como no-root pueden no poder bindear puertos menores a 1024 en versiones viejas de Docker o en ciertas configuraciones de Kubernetes/OpenShift; en esos casos conviene usar puertos mayores. citeturn763390view3

---

## Primer concepto: root dentro del contenedor sigue importando

A veces se escucha algo como:

> “Total está dentro de un contenedor, no importa que corra como root”.

Ese razonamiento es demasiado relajado.

Docker explica que los contenedores heredan gran parte de su postura de seguridad desde la base image y la forma en que están configurados. Si la imagen incluye componentes innecesarios o corre con privilegios elevados, cada contenedor construido encima queda expuesto a esos riesgos. citeturn763390view2

No significa que root dentro del contenedor sea idéntico a root del host.
Sí significa que **dar permisos de más dentro del contenedor sigue siendo una mala base de seguridad**.

---

## Segundo concepto: qué hace `USER`

La referencia oficial del Dockerfile define así la instrucción:

```Dockerfile
USER <user>[:<group>]
```

o:

```Dockerfile
USER <UID>[:<GID>]
```

Y explica que establece el usuario y grupo por defecto para el resto de la etapa actual. Ese usuario se usa tanto en instrucciones `RUN` como en el runtime para `ENTRYPOINT` y `CMD`. citeturn602475view0turn602475view2

Esto importa mucho porque `USER` no solo cambia el proceso final.
También cambia cómo corren las instrucciones posteriores en esa etapa.

---

## Un ejemplo mínimo

```Dockerfile
FROM node:22
WORKDIR /app
COPY . .
USER node
CMD ["node", "server.js"]
```

La lectura conceptual sería:

- la imagen parte desde `node:22`
- copia el proyecto
- después cambia al usuario `node`
- y el proceso final ya no corre como root

Esto ya es un paso muy importante respecto a dejar todo corriendo con privilegios por defecto.

---

## Crear tu propio usuario y grupo

Docker, en best practices, da un ejemplo explícito de creación de usuario y grupo no root:

```Dockerfile
RUN groupadd -r postgres && useradd --no-log-init -r -g postgres postgres
```

También recomienda considerar un UID/GID explícito porque las asignaciones automáticas pueden no ser deterministas entre rebuilds. citeturn763390view0turn901918search3

Eso te da una regla bastante útil:

> si te importa que la identidad dentro de la imagen sea estable y predecible,  
> no te apoyes solo en el “próximo UID libre”.

---

## Por qué UID/GID explícitos puede ser una buena idea

Docker lo explica de forma bastante concreta: usuarios y grupos en una imagen pueden recibir UID/GID no deterministas según el orden de creación, por lo que si eso es importante, conviene fijarlos explícitamente. citeturn763390view0turn901918search3

Esto puede importarte cuando:

- querés reproducibilidad más fuerte
- necesitás coherencia entre build stages
- querés ownership más predecible
- trabajás con montajes o entornos donde el UID/GID sí importa bastante

---

## Ejemplo más sano con UID/GID explícito

```Dockerfile
FROM node:22

WORKDIR /app

RUN groupadd -g 1001 appgroup &&     useradd --no-log-init -u 1001 -g appgroup appuser

COPY . .

RUN chown -R appuser:appgroup /app

USER appuser

CMD ["node", "server.js"]
```

La idea es simple:

- creás una identidad dedicada
- dejás los archivos con ownership correcto
- corrés el proceso final con mínimos privilegios

---

## Tercer concepto: `COPY --chown`

La referencia oficial documenta:

```Dockerfile
COPY --chown=<user>:<group> <src> ... <dest>
```

y aclara que **sin este flag** los archivos copiados se crean con UID y GID de 0, o sea, root/root. citeturn602475view1

Esto importa muchísimo porque mucha gente hace bien el `USER`, pero deja los archivos como root sin darse cuenta.

---

## Por qué `COPY --chown` es tan útil

Porque te permite copiar directamente con ownership correcto.

Por ejemplo:

```Dockerfile
COPY --chown=appuser:appgroup . .
```

Eso evita tener que hacer un `chown -R` después para todo el árbol, y deja la intención mucho más clara.

Es una herramienta muy valiosa para que el cambio a no-root no quede incompleto.

---

## Un ejemplo todavía mejor

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

La lectura conceptual sería:

- el build inicial todavía usa privilegios donde hacen falta
- los archivos de la app ya quedan con ownership del usuario final
- el proceso del contenedor corre sin root

Eso suele ser bastante más prolijo que dejar todo root y confiar en que “seguro anda igual”.

---

## Qué pasa con usuarios integrados de algunas imágenes

Algunas imágenes ya traen usuarios no root integrados o variantes específicamente pensadas para no correr como root.

Docker lo muestra, por ejemplo, en su guía de React donde usa `nginxinc/nginx-unprivileged` y luego establece `USER nginx`, y explica que esto reduce superficie de ataque y alinea con mejores prácticas de hardening. También las Docker Hardened Images runtime documentan que por defecto corren como non-root. citeturn763390view5turn763390view3

Eso te da otra regla práctica:

> antes de inventar una identidad nueva,  
> mirá si la imagen base ya trae una opción no-root razonable.

---

## Qué pasa con puertos bajos

Docker documenta un detalle práctico muy importante: aplicaciones corriendo como no-root pueden no poder bindear puertos menores a 1024 en versiones más viejas de Docker o en algunas configuraciones de Kubernetes/OpenShift. En esos casos, conviene usar puertos mayores para compatibilidad. citeturn763390view3

Esto no invalida correr como no-root.
Solo significa que a veces tenés que ajustar algo tan simple como:

- escuchar en `8080` en vez de `80`
- o `3000` en vez de `443` en ciertos contextos

---

## Un ejemplo realista de esto

En la guía oficial de React, Docker usa un NGINX no-root y expone `8080` en lugar de `80`, justamente para encajar mejor con ese enfoque. citeturn763390view5

La enseñanza útil no es “siempre 8080”.
La enseñanza útil es:

- si elegís no-root, revisá también **qué puertos** necesitás bindear

---

## No uses `sudo` dentro de la imagen

Docker es muy directo con esto en best practices:
evitá instalar o usar `sudo`, porque su comportamiento de TTY y forwarding de señales puede ser impredecible. Si necesitás algo parecido, Docker sugiere considerar `gosu` en escenarios específicos. citeturn763390view0

En la práctica, esta es una gran regla:

> no intentes reproducir dentro del contenedor el mismo modelo de “subir y bajar privilegios” que usarías en una VM o servidor clásico si no tenés un motivo muy claro.

---

## ¿Esto reemplaza rootless mode o userns-remap?

No.

Docker documenta rootless mode como una forma de correr el daemon y los contenedores sin privilegios de root a nivel del runtime del host. También documenta userns-remap como otra capa de mitigación cuando procesos dentro del contenedor deben correr como root, remapeando ese root a un usuario menos privilegiado en el host. citeturn605805search1turn763390view4

La relación sana es esta:

- **correr como no-root dentro de la imagen**: endurece el proceso de la app
- **rootless mode / userns-remap**: endurecen cómo eso se traduce respecto del host

No compiten.
Son capas distintas.

---

## Una regla muy útil

Podés pensar así:

### Si la app puede correr sin privilegios
Creá o usá un usuario no-root y cambiate con `USER`.

### Si además querés ownership correcto
Usá `COPY --chown` o ajustá permisos antes del cambio de usuario.

### Si necesitás root para algunos pasos de build
Usalo solo donde haga falta, y después bajá privilegios para el runtime final.

Esta última parte es especialmente importante: **build y runtime no tienen por qué tener el mismo nivel de privilegios**.

---

## Qué no tenés que confundir

### `USER` no crea automáticamente el usuario
Primero el usuario tiene que existir en la imagen si no es uno ya integrado. citeturn602475view0

### Cambiar a no-root no arregla permisos mágicamente
Si copiaste archivos como root y nunca ajustaste ownership, igual podés tener problemas. citeturn602475view1

### No-root dentro del contenedor no vuelve innecesarias otras capas de seguridad
Rootless mode y userns-remap siguen siendo útiles a otro nivel. citeturn605805search1turn763390view4

### Menos privilegios no significa “rompé todo para ser más seguro”
La imagen tiene que seguir siendo usable y mantenible.

---

## Error común 1: cambiar a `USER` pero dejar todos los archivos como root

Eso suele terminar en errores de permisos que mucha gente interpreta como “no-root es problemático”, cuando en realidad faltó ownership correcto. citeturn602475view1

---

## Error común 2: usar UID/GID implícitos cuando después te importa que sean predecibles

Docker sugiere explícitamente considerar UID/GID explícitos cuando eso importa. citeturn763390view0turn901918search3

---

## Error común 3: intentar bindear 80 o 443 desde un usuario no-root sin revisar compatibilidad

Eso puede darte un fallo que en realidad no tiene nada de misterioso. citeturn763390view3

---

## Error común 4: meter `sudo` porque “así lo arreglo rápido”

Docker desaconseja ese camino. citeturn763390view0

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Leé este Dockerfile y detectá qué le falta:

```Dockerfile
FROM node:22
WORKDIR /app
COPY . .
CMD ["node", "server.js"]
```

Respondé:

- por qué probablemente corre como root
- qué riesgo o mala práctica hay ahí
- qué le agregarías para endurecerlo

### Ejercicio 2
Ahora mirá esta versión:

```Dockerfile
FROM node:22

WORKDIR /app

RUN groupadd -g 1001 appgroup &&     useradd --no-log-init -u 1001 -g appgroup appuser

COPY --chown=appuser:appgroup . .

USER appuser

CMD ["node", "server.js"]
```

Respondé:

- qué mejora introduce `USER`
- qué mejora introduce `COPY --chown`
- por qué esta versión sigue una lógica de mínimos privilegios

### Ejercicio 3
Respondé además:

- cuándo usarías un usuario ya incluido por la base
- cuándo crearías uno propio
- por qué evitarías `sudo`
- qué revisarías si una app no-root intenta bindear un puerto bajo

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- si hoy el proceso final corre como root
- si la base ya trae un usuario no-root útil
- si necesitarías un UID/GID explícito
- qué archivos o carpetas tendrías que dejar con ownership correcto
- qué cambio concreto te gustaría hacer primero para bajar privilegios sin romper la app

No hace falta escribir todavía el Dockerfile final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre “funciona” y “funciona con mínimos privilegios”?
- ¿qué servicio tuyo hoy probablemente está corriendo con más permisos de los que necesita?
- ¿qué parte del tema de ownership te parece más fácil de olvidar?
- ¿en qué caso usarías un usuario integrado de la base y en cuál crearías uno propio?
- ¿qué mejora concreta te gustaría notar al endurecer una imagen así?

Estas observaciones valen mucho más que memorizar `USER` de memoria.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si mi servicio puede correr sin privilegios, probablemente me conviene usar ________.  
> Si quiero que los archivos copiados queden con ownership correcto desde el principio, probablemente me conviene usar ________.  
> Si necesito que la identidad dentro de la imagen sea predecible, probablemente me conviene definir ________ explícitos.

Y además respondé:

- ¿por qué este tema impacta tanto en la postura de seguridad del contenedor?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no dejar todo corriendo como root?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar por qué Docker recomienda no correr como root cuando no hace falta
- usar `USER` con más criterio
- crear usuarios y grupos dedicados dentro de la imagen
- usar `COPY --chown` para ownership correcto
- entender cómo esta decisión encaja con least privilege y con otras capas como rootless o userns-remap

---

## Resumen del tema

- Docker recomienda usar `USER` para cambiar a un usuario no root cuando el servicio puede correr sin privilegios. citeturn763390view0turn602475view0
- Si el UID/GID importa, conviene considerarlos explícitamente porque las asignaciones automáticas pueden no ser deterministas. citeturn763390view0turn901918search3
- `COPY --chown` permite dejar archivos con ownership correcto; sin ese flag, se crean como UID/GID 0. citeturn602475view1
- Docker desaconseja usar `sudo` dentro de la imagen. citeturn763390view0
- Endurecer una imagen incluye correr como no-root y reducir superficies de ataque o de escritura. citeturn763390view2
- Las apps no-root pueden necesitar puertos mayores a 1024 en ciertos entornos para evitar problemas de binding. citeturn763390view3turn763390view5
- Este tema te deja una base muy sólida para endurecer tus imágenes desde una decisión muy concreta: quién ejecuta realmente el proceso final.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque con otra decisión muy práctica de endurecimiento y limpieza:

- capas de escritura
- filesystem más controlado
- artefactos innecesarios
- y cómo seguir reduciendo superficie sin volver la imagen inmanejable
