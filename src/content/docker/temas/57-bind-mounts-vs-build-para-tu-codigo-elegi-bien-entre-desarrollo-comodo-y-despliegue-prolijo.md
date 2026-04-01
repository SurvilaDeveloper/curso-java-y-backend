---
title: "Bind mounts vs build para tu código: elegí bien entre desarrollo cómodo y despliegue prolijo"
description: "Tema 57 del curso práctico de Docker: cuándo conviene usar bind mounts para tu código propio, cuándo conviene construir una imagen nueva y por qué mezclar ambos enfoques sin criterio suele traer confusión entre desarrollo y despliegue."
order: 57
module: "Imágenes propias y flujos más cercanos a despliegue"
level: "intermedio"
draft: false
---

# Bind mounts vs build para tu código: elegí bien entre desarrollo cómodo y despliegue prolijo

## Objetivo del tema

En este tema vas a:

- distinguir cuándo conviene usar bind mounts para tu código
- distinguir cuándo conviene reconstruir la imagen
- entender por qué desarrollo y despliegue suelen pedir estrategias distintas
- evitar mezclar host y build final sin criterio
- empezar a tomar decisiones más sanas entre comodidad local y prolijidad del resultado final

La idea es que no uses siempre la misma herramienta por costumbre, sino que entiendas qué problema resuelve cada una.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender qué gana el desarrollo con bind mounts
2. entender qué gana el despliegue con imágenes construidas
3. comparar ambos enfoques en un caso real
4. ver por qué no conviene mezclar objetivos distintos
5. construir una regla práctica para decidir mejor según el contexto

---

## Idea central que tenés que llevarte

Cuando trabajás con código propio, hay dos estrategias muy comunes:

- compartir el código local con el contenedor
- construir una imagen nueva y correr esa imagen

No son enemigas.
Resuelven problemas distintos.

Dicho simple:

> para desarrollo local, compartir código suele darte más velocidad de iteración  
> para despliegue o entornos más cerrados, construir una imagen suele darte más prolijidad y reproducibilidad

---

## Por qué este tema importa tanto

A esta altura del curso ya viste varias piezas:

- bind mounts
- builds
- Compose
- multi-stage
- target
- caché
- images propias

Ahora hace falta unir todo eso en una decisión concreta:

> “¿Trabajo montando mi código desde el host o rebuildo la imagen?”

La respuesta correcta no suele ser “siempre una sola cosa”.

---

## Qué dice la documentación oficial

La documentación oficial de Docker explica que los bind mounts comparten un archivo o directorio real del host con el contenedor, y que en desarrollo son útiles para montar código fuente y ver cambios inmediatamente al guardar. También documenta que los bind mounts dependen del filesystem del host y que tanto procesos del host como del contenedor pueden modificar los archivos compartidos. Por otro lado, Docker indica que las imágenes y su Dockerfile son la base para ensamblar una imagen reproducible, y que para cambios de aplicación en un entorno más parecido a producción conviene reconstruir la imagen y recrear los servicios. Además, Docker presenta Compose Watch como una alternativa moderna para desarrollo, con ventajas frente a bind mounts en algunos casos de rendimiento y diferencias de plataforma. citeturn996017search0turn996017search2turn996017search6turn996017search15turn996017search7turn996017search22

---

## Primer enfoque: bind mounts para tu código

Ya viste que un bind mount conecta una carpeta del host con el contenedor.

Por ejemplo:

```yaml
services:
  app:
    volumes:
      - .:/app
```

La documentación oficial lo describe justamente como un enlace directo entre una ruta del host y una ruta del contenedor. citeturn996017search0turn996017search15

---

## Qué ventaja principal tiene

La ventaja más obvia es la velocidad de iteración.

Docker explica que cuando montás código fuente con bind mounts, el contenedor ve los cambios apenas guardás el archivo en el host. Eso permite flujos donde el proceso dentro del contenedor observa cambios y reacciona enseguida. citeturn996017search2

Eso es excelente para:

- desarrollo local
- edición frecuente
- feedback rápido
- hot reload o watchers

---

## Qué problema te ahorra

Te ahorra el ciclo completo de:

1. cambiar código
2. rebuildar imagen
3. recrear el contenedor
4. probar otra vez

Si estás iterando mucho, ese ahorro puede ser enorme.

---

## Qué costo tiene

Los bind mounts también traen costos y límites.

Docker documenta que dependen de la estructura y el sistema del host, y que el acceso a esos archivos no queda aislado por Docker de la misma manera que un volumen administrado. También remarca que host y contenedor pueden modificar simultáneamente esos archivos. citeturn996017search0turn996017search15

Traducido a práctica:

- dependen del host
- son menos portables
- pueden generar diferencias según plataforma
- no representan tan bien el “artefacto final” que vas a desplegar

---

## Segundo enfoque: build de una imagen propia

El otro enfoque es construir una imagen con tu código incluido.

Por ejemplo:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
```

Acá el código deja de compartirse desde el host en vivo y pasa a formar parte de una imagen concreta.

La documentación oficial del Dockerfile recuerda que la imagen se construye leyendo instrucciones del Dockerfile y ensamblando un artefacto ejecutable a partir del contexto. citeturn996017search23turn996017search14

---

## Qué ventaja principal tiene

La principal ventaja es la reproducibilidad.

Cuando corrés una imagen construida:

- sabés qué archivos entraron
- sabés qué base usó
- sabés qué dependencias quedaron instaladas
- el entorno se parece mucho más a un artefacto de despliegue real

Esto encaja muy bien con producción, staging o cualquier entorno donde querés más estabilidad y menos dependencia del host. Docker incluso recomienda, para cambios de app en Compose de producción, reconstruir la imagen y recrear el servicio. citeturn996017search6

---

## Qué problema te resuelve

Te resuelve algo muy importante:

- el servicio ya no depende de tu carpeta local viva
- el resultado queda contenido en la imagen
- podés compartir, versionar o publicar ese artefacto
- el entorno final es más fácil de reproducir en otra máquina

Eso es justo lo que suele importar más al acercarte a despliegue real.

---

## Qué costo tiene

El costo principal es que iterar suele ser más lento.

Porque, cada vez que el cambio afecta la imagen final, aparece el ciclo de build y recreación.

Docker lo documenta de forma práctica para Compose en producción: cuando cambia el código de la app, hay que rebuildar la imagen y recrear el servicio. citeturn996017search6

---

## Regla práctica simple

Podés pensar así:

### Si estás desarrollando y cambiando archivos todo el tiempo
Bind mount o Compose Watch suele ser lo más cómodo. citeturn996017search2turn996017search22

### Si querés un artefacto más cercano a despliegue
Build de imagen y recreación del servicio suele ser lo más sano. citeturn996017search6turn996017search23

---

## Qué papel juega Compose Watch

Docker presenta Compose Watch como una herramienta para desarrollo que actualiza servicios cuando cambiás archivos locales. También explica que, frente a bind mounts, puede ayudar con rendimiento y con ciertos problemas de portabilidad, especialmente cuando hay muchos archivos pequeños o cuando hay artefactos no portables entre host y contenedor. citeturn996017search1turn996017search4turn996017search7turn996017search22

Esto no significa que bind mounts “ya no sirvan”.
Significa que hoy tenés más de una opción sana para desarrollo.

---

## Un caso clásico: no sincronizar node_modules

Docker advierte explícitamente, en la documentación de Compose Watch, que en proyectos Node.js no conviene sincronizar `node_modules/` desde el host porque esos paquetes pueden contener código nativo no portable entre plataformas. citeturn996017search1

Esta observación es muy útil porque muestra un patrón real:

- código fuente sí
- artefactos dependientes de plataforma, no necesariamente

Eso ya te enseña que “montar todo” no siempre es buena idea.

---

## Un ejemplo sano para desarrollo

Por ejemplo:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    volumes:
      - .:/app
```

### Cómo se lee
- usás un Dockerfile para definir el entorno base
- pero durante desarrollo compartís el código desde el host para iterar rápido

Esto puede ser totalmente razonable en local.

---

## Un ejemplo más sano para despliegue

Por ejemplo:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    image: miusuario/app:dev
```

### Cómo se lee
- el código ya se integra a la imagen
- el servicio corre esa imagen
- no depende del código del host en vivo

Esto se parece mucho más a un entorno de despliegue o distribución.

---

## Qué problema aparece cuando mezclás ambos sin criterio

Si usás bind mounts en un entorno donde querías reproducibilidad, podés terminar con:

- diferencias entre host y contenedor
- resultados difíciles de replicar
- dependencia excesiva de archivos locales
- sensación engañosa de que “la imagen funciona”, cuando en realidad el contenedor estaba usando tu código del host

Ese último punto es especialmente importante.

---

## Una pregunta muy útil para decidir

Preguntate esto:

> “¿Estoy optimizando velocidad de iteración o fidelidad del artefacto final?”

### Si la prioridad es iterar rápido
host mount / watch suele encajar mejor.

### Si la prioridad es representar bien el artefacto final
build de imagen suele encajar mejor.

Esa pregunta sola resuelve muchísimo.

---

## Qué pasa con los datos de la app

Una aclaración importante:
este tema habla del **código propio de la app**, no del almacenamiento persistente de datos.

Docker sigue recomendando volúmenes como mecanismo preferido para datos generados y usados por contenedores, y remarca que para muchos casos de desarrollo y producción son más simples y menos propensos a errores que un bind mount para datos. citeturn996017search11turn996017search12

O sea:

- código de la app → bind mount o build, según el caso
- datos persistentes → normalmente volumen, no mezclar con esta decisión

---

## Qué no tenés que confundir

### Bind mount de código no es lo mismo que volumen de datos
Resuelven problemas distintos. citeturn996017search0turn996017search12

### Build de imagen no significa que desarrollo con mounts esté “mal”
Simplemente prioriza otra cosa.

### Que algo funcione con bind mount no garantiza que la imagen final esté bien
Puede que estés viendo el código del host y no el artefacto de imagen.

### Compose Watch no es idéntico a bind mounts
Docker lo presenta como una alternativa con comportamiento y ventajas propias. citeturn996017search1turn996017search4turn996017search7

---

## Error común 1: desarrollar con bind mount y creer que eso ya representa el despliegue final

No necesariamente.
Estás optimizando una experiencia de desarrollo, no validando por completo el artefacto final.

---

## Error común 2: rebuildar todo en cada cambio pequeño durante desarrollo

Eso puede volverte el flujo muchísimo más lento de lo necesario. citeturn996017search2turn996017search22

---

## Error común 3: montar todo el proyecto sin pensar qué partes no deberían compartirse

La documentación de Compose Watch sobre `node_modules/` muestra justamente por qué esto puede ser una mala idea. citeturn996017search1

---

## Error común 4: usar bind mounts para datos persistentes por costumbre

Docker recomienda volúmenes como mecanismo preferido para persistencia generada y usada por contenedores. citeturn996017search11turn996017search12

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Tomá este servicio de desarrollo:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    volumes:
      - .:/app
```

Respondé:

- qué ventaja te da en desarrollo
- por qué el código no depende solo de la imagen construida
- qué parte del flujo se vuelve más rápida

### Ejercicio 2
Ahora comparalo con este servicio:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    image: miusuario/app:dev
```

Respondé:

- qué gana este enfoque
- por qué se parece más a un artefacto final
- qué costo tiene para iterar durante desarrollo

### Ejercicio 3
Respondé además:

- cuándo te parece más razonable usar bind mount o watch
- cuándo te parece más razonable rebuildar la imagen
- por qué no conviene decidir esto “por costumbre”

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- en desarrollo, preferirías montar el código o rebuildar seguido
- en un entorno más parecido a despliegue, qué preferirías
- qué parte del proyecto no te gustaría sincronizar desde el host
- qué dejarías sí o sí en la imagen final
- cómo separarías mejor el flujo de desarrollo del flujo de despliegue

No hace falta escribir todavía el stack final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre “comodidad local” y “fidelidad del artefacto final”?
- ¿qué parte de tu flujo hoy está más pensada para desarrollo que para despliegue?
- ¿qué decisión te cuesta más: montar o rebuildar?
- ¿qué artefacto dependiente del host no te gustaría compartir por bind mount?
- ¿en qué proyecto tuyo esta distinción te ahorraría más confusión?

Estas observaciones valen mucho más que repetir una receta.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero iterar rápido sobre código que cambia seguido, probablemente me conviene ________ o ________.  
> Si quiero un resultado más cercano al artefacto final de despliegue, probablemente me conviene ________.

Y además respondé:

- ¿por qué mezclar ambos enfoques sin criterio puede ser engañoso?
- ¿qué parte de tus proyectos te gustaría revisar primero con esta lógica?
- ¿qué ventaja le ves a Compose Watch frente a ciertos bind mounts?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- distinguir cuándo conviene bind mount, watch o build para tu código propio
- separar mejor desarrollo y despliegue
- evitar confundir código compartido desde el host con artefacto final de imagen
- no mezclar persistencia de datos con esta decisión
- tomar decisiones bastante más sanas según el objetivo del entorno

---

## Resumen del tema

- Los bind mounts comparten código del host con el contenedor y son muy útiles para desarrollo con cambios inmediatos. citeturn996017search0turn996017search2
- Compose Watch es una alternativa moderna para desarrollo, con ventajas en algunos escenarios de rendimiento y portabilidad. citeturn996017search1turn996017search7turn996017search22
- Para un entorno más parecido a producción o despliegue, Docker recomienda rebuildar la imagen y recrear el servicio cuando cambia la app. citeturn996017search6
- Los datos persistentes suelen ir mejor en volúmenes que en bind mounts. citeturn996017search11turn996017search12
- Este tema te ayuda a separar con más criterio el flujo de desarrollo del flujo de despliegue.

---

## Próximo tema

En el próximo tema vas a seguir cerrando este bloque de imágenes y builds con una práctica más integrada:

- servicio propio
- build serio
- multi-stage
- target o variante
- y un flujo completo desde desarrollo hasta una imagen lista para usar
