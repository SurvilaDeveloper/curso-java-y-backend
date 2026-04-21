---
title: "Dockerizando catalog-service como primer servicio real de NovaMarket"
description: "Primer paso práctico del módulo 7. Creación del primer Dockerfile real del proyecto usando catalog-service como servicio inicial para aprender el patrón de empaquetado."
order: 57
module: "Módulo 7 · Dockerización de NovaMarket"
level: "intermedio"
draft: false
---

# Dockerizando `catalog-service` como primer servicio real de NovaMarket

En la clase anterior dejamos algo bastante claro:

- NovaMarket ya tiene suficiente madurez como para empezar a dockerizarse,
- no hace falta todavía empaquetar todo de golpe,
- y lo más sano ahora es elegir un primer servicio real y aprender bien el patrón.

Ahora toca el paso concreto:

**dockerizar `catalog-service` como primer servicio real de NovaMarket.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creado un Dockerfile real para `catalog-service`,
- mucho más claro qué significa empaquetar un servicio Spring Boot,
- probado el servicio dentro de un contenedor,
- y preparado el patrón base que después vamos a reutilizar para el resto del sistema.

La meta de hoy no es empaquetar toda la arquitectura.  
La meta es mucho más concreta: **hacer bien el primer servicio para que el resto del bloque quede mucho más claro y mucho más sólido**.

---

## Estado de partida

Partimos de un proyecto donde ya:

- `catalog-service` existe hace tiempo,
- tiene endpoints visibles,
- ya forma parte del sistema real,
- y NovaMarket ya dejó de ser una práctica mínima.

Eso significa que `catalog-service` ya no es solo un buen ejemplo didáctico:  
también es una muy buena puerta de entrada para aprender el patrón de dockerización.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué necesita un servicio Spring Boot para correr en contenedor,
- crear un Dockerfile razonable para `catalog-service`,
- construir la imagen,
- levantar el contenedor,
- y verificar que el servicio sigue respondiendo correctamente dentro de ese entorno nuevo.

---

## Qué problema queremos resolver exactamente

Hasta ahora, `catalog-service` corría de una forma muy típica de desarrollo:

- desde el IDE,
- desde Maven,
- o desde una terminal local.

Eso está bien mientras estamos construyendo.

Pero ahora queremos algo bastante más serio:

- una imagen portable,
- un runtime más explícito,
- y una forma de ejecutar el servicio sin depender directamente del entorno de desarrollo donde fue escrito.

Ese cambio de enfoque es justamente el corazón de esta clase.

---

## Qué tiene que contener, como mínimo, un Dockerfile de este servicio

A esta altura del curso, conviene pensar el Dockerfile con una lógica bastante simple:

1. partir de una imagen base de Java adecuada
2. copiar el `.jar` del servicio
3. exponer el puerto
4. ejecutar la aplicación

No hace falta todavía complicarlo demasiado.

Lo importante es que el primer Dockerfile sea:

- claro,
- razonable,
- y fácil de entender.

---

## Paso 1 · Generar el `.jar` de `catalog-service`

Antes de construir la imagen, necesitás tener el artefacto empaquetado del servicio.

Desde la carpeta de `catalog-service`, una secuencia típica sería:

```bash
./mvnw clean package
```

o, en Windows con wrapper:

```bash
mvnw.cmd clean package
```

La idea es que al terminar tengas el `.jar` listo dentro de `target/`.

No hace falta todavía optimizar build para tiempos mínimos.  
La prioridad ahora es aprender bien el patrón.

---

## Paso 2 · Crear el Dockerfile

Dentro de `catalog-service`, creá un archivo llamado:

```txt
Dockerfile
```

Una versión razonable y didáctica para esta etapa podría ser:

```dockerfile
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY target/catalog-service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
```

Esta versión tiene muchísimo valor para aprender porque muestra con mucha claridad las piezas esenciales del empaquetado.

---

## Paso 3 · Entender qué hace este Dockerfile

Conviene leerlo con calma:

### `FROM eclipse-temurin:21-jre`
Usamos una imagen base con Java 21 en runtime.

### `WORKDIR /app`
Definimos una carpeta de trabajo dentro del contenedor.

### `COPY ...`
Copiamos el `.jar` generado por Maven.

### `EXPOSE 8081`
Documentamos el puerto esperado del servicio.

### `ENTRYPOINT`
Definimos cómo se ejecuta la aplicación al arrancar el contenedor.

Ese desglose importa muchísimo porque hace que el Dockerfile deje de ser una receta opaca.

---

## Paso 4 · Construir la imagen

Ahora construí la imagen desde la carpeta de `catalog-service`.

Por ejemplo:

```bash
docker build -t novamarket/catalog-service:dev .
```

La idea es que el nombre de la imagen ya refleje:

- el proyecto
- el servicio
- y una etiqueta inicial razonable

No hace falta todavía una convención ultra sofisticada.  
Con algo claro y consistente alcanza.

---

## Paso 5 · Entender qué acabamos de crear

Cuando la imagen termina de construirse, eso significa que ahora ya existe una unidad portable que contiene:

- el runtime de Java necesario,
- el `.jar` del servicio,
- y la instrucción de arranque

Esa imagen ya no depende del IDE.

Y ese cambio vale muchísimo porque es justamente la puerta de entrada a una ejecución mucho más seria del proyecto.

---

## Paso 6 · Levantar el contenedor

Ahora levantá el contenedor.

Por ejemplo:

```bash
docker run --rm -p 8081:8081 novamarket/catalog-service:dev
```

Eso expone el puerto del contenedor al puerto local `8081`, lo que nos permite probar el servicio igual que antes, pero ahora empaquetado.

Este es uno de los momentos más importantes de toda la clase, porque convierte en algo visible el paso de:

- servicio local tradicional
a
- servicio empaquetado y ejecutado en contenedor

---

## Paso 7 · Probar el endpoint del catálogo

Ahora verificá que el servicio sigue respondiendo.

Por ejemplo:

```bash
curl http://localhost:8081/products
```

Y también, si corresponde:

```bash
curl http://localhost:8081/products/1
```

La idea es confirmar que el servicio:

- arranca dentro del contenedor,
- sigue exponiendo sus endpoints,
- y funcionalmente sigue siendo el mismo `catalog-service` que ya conocíamos, pero ahora empaquetado de forma mucho más portable.

---

## Paso 8 · Entender qué todavía depende del entorno actual

Este punto importa mucho.

Aunque ya dockerizamos `catalog-service`, todavía seguimos en una etapa intermedia.

¿Por qué?

Porque:

- todavía no estamos levantando toda la arquitectura en contenedores,
- todavía no conectamos `catalog-service` con `config-server` o con otras piezas dentro de una red Docker real,
- y todavía seguimos probando un servicio bastante aislado.

Eso está perfecto.

La meta de hoy no es resolver toda la ejecución integrada.  
La meta es aprender bien el primer patrón.

---

## Paso 9 · Pensar por qué `catalog-service` fue un buen primer candidato

A esta altura conviene fijar algo importante:

`catalog-service` fue un gran primer servicio para dockerizar porque:

- ya tenía identidad clara,
- ya tenía endpoints visibles,
- y su empaquetado deja muy limpio el aprendizaje del patrón.

Eso hace que el bloque de Docker empiece con muy buena base antes de meternos en piezas más conectadas o más complejas.

---

## Qué estamos logrando con esta clase

Esta clase aplica la primera mejora real del nuevo módulo de dockerización.

Ya no estamos solo diciendo que NovaMarket debería empezar a empaquetarse.  
Ahora también estamos convirtiendo esa idea en un servicio real ejecutándose como contenedor.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- dockerizamos los demás servicios,
- ni conectamos todo con Docker Compose,
- ni resolvimos la ejecución integrada completa del sistema.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dejar `catalog-service` dockerizado como primer servicio real de NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Querer meter multi-stage build y optimizaciones demasiado pronto
En esta etapa, lo simple y claro vale muchísimo más.

### 2. No generar antes el `.jar`
Entonces la imagen no tiene qué copiar.

### 3. No probar el contenedor después del build
La validación es parte esencial de la clase.

### 4. Confundir “imagen construida” con “arquitectura completa dockerizada”
Todavía estamos en el primer paso del bloque.

### 5. No usar un naming razonable para la imagen
Conviene ya empezar con una convención simple y clara.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- `catalog-service` ya tiene un Dockerfile real,
- la imagen puede construirse,
- el contenedor puede levantarse,
- y el servicio sigue respondiendo correctamente empaquetado dentro de Docker.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- el `.jar` de `catalog-service` se genera correctamente,
- el Dockerfile existe y se entiende,
- la imagen se construye,
- el contenedor arranca,
- y los endpoints del catálogo siguen funcionando.

Si eso está bien, ya podemos pasar al siguiente tema y extender este patrón al resto del sistema.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a replicar el patrón de dockerización sobre otros servicios de NovaMarket para empezar a dejar más de una pieza del sistema lista para una futura ejecución integrada con Docker Compose.

---

## Cierre

En esta clase dockerizamos `catalog-service` como primer servicio real de NovaMarket.

Con eso, el curso rehecho deja de pensar solo en servicios que corren desde el entorno de desarrollo y empieza a convertir al proyecto en una arquitectura mucho más portable, mucho más reproducible y mucho más cercana a una ejecución seria fuera de la máquina local.
