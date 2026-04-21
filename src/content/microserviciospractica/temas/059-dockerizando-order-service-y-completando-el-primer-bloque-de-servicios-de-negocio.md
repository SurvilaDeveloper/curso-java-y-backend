---
title: "Dockerizando order-service y completando el primer bloque de servicios de negocio"
description: "Tercer paso práctico del módulo 7. Dockerización de order-service para completar el primer bloque de servicios de negocio empaquetados de NovaMarket."
order: 59
module: "Módulo 7 · Dockerización de NovaMarket"
level: "intermedio"
draft: false
---

# Dockerizando `order-service` y completando el primer bloque de servicios de negocio

En las últimas clases del módulo 7 hicimos dos pasos muy importantes:

- dockerizamos `catalog-service`,
- dockerizamos `inventory-service`,
- y con eso empezamos a convertir NovaMarket en algo bastante más portable y más reproducible que antes.

Eso ya tiene muchísimo valor.

Pero ahora toca cerrar una primera tanda muy importante de este bloque:

**dockerizar `order-service` y completar el primer bloque de servicios de negocio empaquetados.**

Ese es el objetivo de esta clase.

Porque una cosa es tener uno o dos servicios dockerizados.  
Y otra bastante distinta es completar el trío central de negocio del proyecto:

- catálogo
- inventario
- órdenes

Ese cierre ya cambia bastante la lectura del sistema.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creado un Dockerfile real para `order-service`,
- extendido el patrón de dockerización a un tercer servicio central,
- completado el primer bloque de servicios de negocio empaquetados,
- y NovaMarket mucho más cerca de una ejecución integrada seria.

La meta de hoy no es orquestar todo el sistema todavía.  
La meta es mucho más concreta: **dejar también a `order-service` dentro del patrón de empaquetado que ya empezamos a consolidar en el proyecto.**

---

## Estado de partida

Partimos de un proyecto donde ya:

- `catalog-service` quedó dockerizado,
- `inventory-service` quedó dockerizado,
- y el patrón base del módulo ya se entiende bastante mejor que al comienzo.

Ahora toca llevar esa misma lógica a `order-service`, que no es cualquier pieza del sistema:

- representa el flujo de creación de órdenes,
- interactúa con inventario,
- y ya tiene un peso funcional muy claro dentro de NovaMarket.

Eso vuelve a esta clase particularmente importante.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- generar el `.jar` de `order-service`,
- crear su Dockerfile,
- construir la imagen,
- levantar el contenedor,
- y validar que sigue exponiendo su endpoint principal correctamente.

Además, vamos a leer por qué completar el bloque de servicios de negocio cambia bastante la madurez del proyecto.

---

## Qué problema queremos resolver exactamente

Queremos evitar dos errores comunes:

### Error 1
Quedarnos con la idea de que Docker ya quedó “entendido” solo porque dos servicios simples corren en contenedores.

### Error 2
No reconocer el valor de cerrar una primera tanda coherente de servicios centrales del negocio.

En lugar de eso, queremos algo más fuerte:

- repetir bien el patrón,
- completar el bloque principal del dominio,
- y dejar a NovaMarket mejor preparado para el siguiente gran salto: la ejecución integrada.

Ese equilibrio es el corazón de esta clase.

---

## Por qué `order-service` es un cierre importante de este subbloque

A esta altura del proyecto, `order-service` tiene mucho peso porque:

- forma parte del flujo central de compra,
- ya es un servicio más serio que una simple lectura de catálogo,
- y representa una parte del sistema donde el comportamiento de negocio se vuelve más evidente.

Dockerizarlo significa que ya no estamos empaquetando solo servicios “cómodos” o periféricos.  
Estamos cerrando el núcleo funcional del sistema.

Ese matiz importa muchísimo.

---

## Paso 1 · Generar el `.jar` de `order-service`

Como en las clases anteriores, empezamos por empaquetar el servicio.

Desde la carpeta de `order-service`:

```bash
./mvnw clean package
```

o en Windows:

```bash
mvnw.cmd clean package
```

La idea sigue siendo la misma:

- obtener el `.jar`
- dejarlo listo dentro de `target/`
- y usarlo como base de la imagen

A esta altura, este paso ya debería sentirse como parte de un patrón bastante claro.

---

## Paso 2 · Crear el Dockerfile

Dentro de `order-service`, creá un archivo:

```txt
Dockerfile
```

Una versión razonable y consistente con lo que ya venimos haciendo podría ser:

```dockerfile
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY target/order-service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8083

ENTRYPOINT ["java", "-jar", "app.jar"]
```

La consistencia con los Dockerfiles anteriores importa muchísimo, porque ahora ya no estamos aprendiendo un caso aislado: estamos consolidando una familia de servicios empaquetados bajo una lógica común.

---

## Paso 3 · Entender qué reafirma este tercer Dockerfile

Este punto vale muchísimo.

Con `order-service`, el patrón ya empieza a verse muy estable:

- misma imagen base
- mismo esquema de trabajo
- mismo tipo de empaquetado
- misma lógica de arranque
- y variaciones concretas solo en:
  - nombre del `.jar`
  - puerto expuesto
  - identidad del servicio

Eso es importantísimo porque muestra que el bloque de Docker ya no depende de creatividad caso por caso.

Ya empieza a existir una convención real del proyecto.

---

## Paso 4 · Construir la imagen

Ahora construí la imagen desde la carpeta de `order-service`:

```bash
docker build -t novamarket/order-service:dev .
```

La convención de nombre sigue exactamente la misma lógica que en las clases anteriores.

Eso tiene mucho valor porque ayuda a que el proyecto vaya quedando más limpio también desde el punto de vista operativo.

---

## Paso 5 · Levantar el contenedor

Ahora ejecutá el contenedor:

```bash
docker run --rm -p 8083:8083 novamarket/order-service:dev
```

La idea sigue siendo exponer el puerto habitual del servicio para que la prueba funcional sea clara y no meta ruido extra.

Todavía estamos en una etapa donde conviene privilegiar:

- claridad,
- validación directa,
- y reconocimiento del patrón.

---

## Paso 6 · Probar el endpoint principal de órdenes

Ahora hacé una prueba funcional básica.

Por ejemplo:

```bash
curl -i -X POST http://localhost:8083/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 1 }
    ]
  }'
```

El comportamiento exacto puede depender de qué piezas externas tenga disponibles en ese momento, pero lo importante ahora es validar que:

- el servicio arranca dentro del contenedor,
- el endpoint está vivo,
- y el empaquetado no rompió la identidad del servicio.

Este punto es muy importante porque `order-service` no es solo una pieza de lectura: ya forma parte del flujo central del sistema.

---

## Paso 7 · Entender qué todavía no resolvimos sobre integración real

Conviene dejar esto muy claro.

Dockerizar `order-service` **no significa todavía** que ya resolvimos:

- la comunicación completa con otras piezas dockerizadas,
- la red compartida entre todos los servicios,
- la conexión integrada con Config Server, Eureka o el gateway dentro de contenedores,
- ni la ejecución full-stack del sistema.

Eso está perfectamente bien.

La meta de hoy es mucho más concreta:

- dejar a `order-service` empaquetado
- y cerrar el primer bloque de servicios de negocio dockerizados.

Ese alcance ya es muy valioso.

---

## Paso 8 · Pensar por qué esta clase cambia tanto la lectura del proyecto

A esta altura conviene fijar algo importante:

después de esta clase, NovaMarket ya no tiene solo un “primer ejemplo” de servicio containerizado.

Tampoco tiene solo dos.

Ahora ya tiene empaquetados:

- `catalog-service`
- `inventory-service`
- `order-service`

Eso significa que el núcleo funcional del sistema ya empezó a moverse hacia una forma mucho más seria de ejecución.

Y ese salto vale muchísimo.

---

## Qué estamos logrando con esta clase

Esta clase dockeriza `order-service` y completa el primer bloque de servicios de negocio empaquetados de NovaMarket.

Ya no estamos solo practicando Docker sobre piezas aisladas.  
Ahora también estamos cerrando el núcleo central del dominio dentro de una lógica más portable y más reproducible.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- dockerizamos `config-server`, `discovery-server` o `api-gateway`,
- ni construimos todavía el `docker-compose.yml`,
- ni ejecutamos el sistema completo de forma integrada.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dejar `order-service` dockerizado y completar el primer bloque de servicios de negocio empaquetados.**

---

## Errores comunes en esta etapa

### 1. Pensar que este Dockerfile es “uno más”
En realidad cierra una tanda muy importante del sistema.

### 2. Olvidar que `order-service` participa de un flujo más sensible
La validación funcional acá importa mucho.

### 3. Confundir servicio dockerizado con sistema integrado dockerizado
Todavía no estamos en Compose.

### 4. Romper la consistencia del patrón entre servicios
La homogeneidad del bloque es parte esencial del aprendizaje.

### 5. No reconocer el cambio de escala del proyecto después de esta clase
Con tres servicios de negocio dockerizados, NovaMarket ya entra en otra etapa.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- `order-service` ya tiene su propio Dockerfile,
- la imagen se construye,
- el contenedor arranca,
- y el núcleo de negocio del sistema ya quedó mayormente empaquetado dentro del patrón que estamos construyendo.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- el `.jar` de `order-service` se genera correctamente,
- el Dockerfile existe y se entiende,
- la imagen se construye,
- el contenedor arranca,
- y la lectura general del proyecto ya cambió porque el bloque central del dominio quedó dockerizado.

Si eso está bien, ya podemos pasar al siguiente tema y consolidar esta primera tanda antes de abrir Docker Compose.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar el primer bloque de servicios dockerizados de NovaMarket, dejando una síntesis clara de qué ganó el proyecto antes de pasar a la ejecución integrada con Compose.

---

## Cierre

En esta clase dockerizamos `order-service` y completamos el primer bloque de servicios de negocio empaquetados.

Con eso, NovaMarket deja de tener solo ejemplos aislados de Docker y pasa a tener su núcleo funcional principal mucho más cerca de una ejecución portable, reproducible y mucho más seria fuera del entorno local.
