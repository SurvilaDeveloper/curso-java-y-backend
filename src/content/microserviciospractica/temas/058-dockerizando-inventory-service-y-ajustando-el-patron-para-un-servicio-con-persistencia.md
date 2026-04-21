---
title: "Dockerizando inventory-service y ajustando el patrón para un servicio con persistencia"
description: "Segundo paso práctico del módulo 7. Aplicación del patrón de dockerización sobre inventory-service y revisión de qué cambia cuando el servicio ya trabaja con persistencia."
order: 58
module: "Módulo 7 · Dockerización de NovaMarket"
level: "intermedio"
draft: false
---

# Dockerizando `inventory-service` y ajustando el patrón para un servicio con persistencia

En la clase anterior hicimos algo muy importante dentro del nuevo módulo:

- elegimos un primer servicio real,
- creamos el primer Dockerfile del proyecto,
- construimos su imagen,
- levantamos el contenedor,
- y verificamos que `catalog-service` seguía respondiendo correctamente dentro de Docker.

Eso ya tiene muchísimo valor.

Pero ahora toca el siguiente paso natural:

**replicar el patrón sobre otro servicio del sistema y ajustar la lectura cuando el servicio ya tiene una relación más clara con persistencia.**

Ese es el objetivo de esta clase.

Porque una cosa es dockerizar un primer servicio para aprender el patrón básico.  
Y otra bastante distinta es empezar a repetirlo sobre otros servicios reales del sistema y detectar qué partes del patrón se mantienen y qué matices nuevos aparecen.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creado un Dockerfile real para `inventory-service`,
- más claro qué partes del patrón se reutilizan casi sin cambios,
- entendido qué matices conviene mirar cuando el servicio ya usa persistencia,
- y ampliada la base del proyecto para que más de una pieza de NovaMarket ya pueda ejecutarse dentro de contenedores.

La meta de hoy no es orquestar todo el sistema.  
La meta es mucho más concreta: **extender correctamente el patrón de dockerización a `inventory-service` y leer bien lo que cambia y lo que no cambia respecto de `catalog-service`.**

---

## Estado de partida

Partimos de un proyecto donde ya:

- `catalog-service` quedó dockerizado,
- el patrón básico de Dockerfile ya fue comprendido,
- y NovaMarket ya empezó a dejar atrás la fase donde todo se ejecuta exclusivamente desde el entorno de desarrollo.

Ahora toca mover ese aprendizaje a otro servicio importante del sistema:

- `inventory-service`

Y eso importa mucho porque inventario ya no es simplemente otro nombre dentro del proyecto.  
Es una pieza que participa activamente del flujo central y que además ya carga con una relación más clara con persistencia.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué necesita `inventory-service` para ejecutarse dentro de un contenedor,
- crear su Dockerfile,
- construir la imagen,
- levantar el servicio dockerizado,
- y validar que sigue respondiendo correctamente.

Además, vamos a leer qué cambia cuando el servicio ya no es solo un endpoint simple, sino una pieza con estado persistente detrás.

---

## Qué problema queremos resolver exactamente

Queremos evitar dos errores bastante comunes:

### Error 1
Creer que el primer Dockerfile ya resolvió el problema de dockerización del proyecto entero.

### Error 2
Copiar el patrón sin mirar qué diferencias introduce un servicio con otras responsabilidades.

En lugar de eso, queremos algo más sano:

- reaplicar el patrón,
- confirmar qué partes son estables,
- y detectar con claridad qué matices nuevos aparecen.

Ese equilibrio es el corazón de esta clase.

---

## Por qué `inventory-service` es un buen segundo candidato

A esta altura del proyecto, `inventory-service` es un gran segundo paso porque:

- ya tiene una identidad fuerte dentro del flujo de negocio,
- ya forma parte del recorrido real de una orden,
- y además ya muestra que NovaMarket no se compone solo de servicios “simples”, sino de piezas con más peso funcional.

Eso vuelve a esta clase mucho más valiosa que si simplemente repitiéramos el mismo patrón sobre otro servicio sin ninguna relevancia especial.

---

## Qué parte del patrón debería mantenerse igual

Este punto importa muchísimo.

Al dockerizar `inventory-service`, varias cosas deberían sentirse familiares:

1. generar el `.jar`
2. crear un Dockerfile
3. copiar el `.jar` dentro de la imagen
4. exponer el puerto
5. ejecutar la aplicación con `java -jar`

Ese reconocimiento importa mucho porque muestra que la dockerización del proyecto no es una sucesión caótica de casos aislados.

Ya empieza a aparecer un patrón estable.

---

## Qué matiz nuevo conviene mirar en este servicio

Aunque el patrón general se mantiene, hay algo que conviene empezar a pensar mejor:

- `inventory-service` ya no es solo una app con endpoints visibles;
- también tiene más relación con estado y persistencia.

Eso no significa que hoy vayamos a resolver todavía todo el problema de bases compartidas o externalización final de datos dentro de contenedores.

Pero sí significa que ya conviene mirar este tipo de servicio con un poco más de atención.

Ese matiz mejora muchísimo la madurez del bloque.

---

## Paso 1 · Generar el `.jar` de `inventory-service`

Desde la carpeta del servicio, la secuencia sigue siendo la esperable:

```bash
./mvnw clean package
```

o en Windows:

```bash
mvnw.cmd clean package
```

La idea es tener el `.jar` listo dentro de `target/`.

Este paso ya debería sentirse bastante más natural después de la clase anterior.  
Y eso es justamente parte del valor del bloque: el patrón empieza a repetirse.

---

## Paso 2 · Crear el Dockerfile de `inventory-service`

Dentro de `inventory-service`, creá un archivo:

```txt
Dockerfile
```

Una versión razonable y coherente con el servicio anterior podría verse así:

```dockerfile
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY target/inventory-service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]
```

Esta versión mantiene lo importante:

- claridad,
- sencillez,
- y coherencia con el primer patrón aprendido.

Todavía no hace falta complicarla más.

---

## Paso 3 · Entender qué estamos reafirmando con este Dockerfile

Este punto vale muchísimo.

Con este segundo servicio dockerizado, empieza a quedar claro que NovaMarket ya tiene un patrón real de empaquetado para sus piezas Spring Boot:

- imagen base de Java,
- `.jar` generado por Maven,
- puerto explícito,
- y comando de arranque directo.

Eso es mucho más importante que el archivo en sí mismo.

¿Por qué?

Porque deja de ser “un ejemplo aislado” y empieza a convertirse en una forma consistente de empaquetar servicios del sistema.

---

## Paso 4 · Construir la imagen

Ahora construí la imagen desde la carpeta de `inventory-service`:

```bash
docker build -t novamarket/inventory-service:dev .
```

La convención de nombre sigue la misma lógica que usamos antes:

- proyecto
- servicio
- etiqueta inicial

Ese tipo de consistencia mejora muchísimo el bloque.

---

## Paso 5 · Levantar el contenedor

Ahora ejecutá el contenedor.

Por ejemplo:

```bash
docker run --rm -p 8082:8082 novamarket/inventory-service:dev
```

La idea es exponer el puerto `8082` igual que venías usando localmente para este servicio.

En esta etapa, seguir usando el mismo puerto ayuda muchísimo porque evita meter ruido extra mientras todavía estamos aprendiendo el patrón de empaquetado.

---

## Paso 6 · Probar los endpoints del servicio

Ahora verificá que inventario sigue respondiendo correctamente.

Por ejemplo:

```bash
curl http://localhost:8082/inventory
curl http://localhost:8082/inventory/1
```

Lo importante es confirmar que:

- el contenedor arranca,
- el servicio responde,
- y funcionalmente sigue siendo el mismo `inventory-service` que ya veníamos usando dentro de NovaMarket.

Ese paso es central, porque reafirma que Docker no está cambiando la identidad del servicio, sino su forma de empaquetado y ejecución.

---

## Paso 7 · Entender qué todavía no resolvimos sobre persistencia

Este punto importa muchísimo.

Dockerizar un servicio con persistencia **no significa todavía** que ya resolvimos:

- almacenamiento duradero final,
- bases externas integradas en contenedores,
- ni redes completas entre servicios y bases dentro de un entorno orquestado.

Por ahora, lo importante es algo más concreto:

- el servicio ya puede empaquetarse y correr dentro de un contenedor,
- aunque la historia completa de persistencia dockerizada todavía esté abierta.

Ese matiz es muy importante para no inflar el alcance de la clase.

---

## Paso 8 · Pensar por qué esta clase mejora el bloque entero

A esta altura conviene fijar algo importante:

esta clase vale muchísimo porque transforma la dockerización del proyecto en algo menos puntual y más sistémico.

Ahora ya no tenemos un solo ejemplo.

Tenemos dos servicios reales del sistema empaquetados bajo una lógica bastante consistente.

Eso es justo lo que necesitábamos antes de seguir extendiendo el bloque.

---

## Qué estamos logrando con esta clase

Esta clase extiende el patrón de dockerización a `inventory-service` y consolida la idea de que NovaMarket ya está entrando en una etapa donde sus piezas pueden empezar a empaquetarse de forma bastante uniforme.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- dockerizamos `order-service`,
- ni empaquetamos todavía `config-server`, `discovery-server` o `api-gateway`,
- ni ejecutamos el sistema completo con Compose.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dejar `inventory-service` dockerizado y ajustar el patrón del bloque a un servicio con un poco más de peso funcional y relación con persistencia.**

---

## Errores comunes en esta etapa

### 1. Pensar que ya todo servicio se dockeriza “sin pensar”
El patrón se repite mucho, pero siempre conviene revisar puertos y artefactos concretos.

### 2. Confundir servicio dockerizado con persistencia resuelta
Todavía no estamos cerrando esa historia.

### 3. No mantener una convención clara entre servicios
La consistencia del bloque es parte central del aprendizaje.

### 4. No probar endpoints después del arranque
La validación sigue siendo parte esencial de la clase.

### 5. Querer optimizar demasiado temprano el Dockerfile
En esta etapa, lo simple y claro vale muchísimo más.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- `inventory-service` ya tiene su propio Dockerfile,
- la imagen se construye,
- el contenedor se ejecuta,
- y el servicio sigue respondiendo correctamente.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- el `.jar` de `inventory-service` se genera correctamente,
- el Dockerfile existe y se entiende,
- la imagen se construye,
- el contenedor arranca,
- y los endpoints del servicio siguen funcionando.

Si eso está bien, ya podemos pasar al siguiente tema y llevar el patrón también a `order-service`.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a dockerizar `order-service` para dejar un tercer servicio central del sistema ya listo para una futura ejecución integrada con Docker Compose.

---

## Cierre

En esta clase dockerizamos `inventory-service` y ajustamos el patrón para un servicio con persistencia.

Con eso, NovaMarket deja de tener un solo ejemplo aislado de dockerización y empieza a consolidar una forma más consistente y más madura de empaquetar servicios reales del sistema.
