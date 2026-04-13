---
title: "Preparando el workspace y la estructura general del proyecto"
description: "Preparación del entorno de trabajo de NovaMarket. Organización del monorepo, carpetas principales, convenciones de nombres y base operativa sobre la que construiremos el curso práctico."
order: 2
module: "Módulo 1 · Preparación del proyecto y primeros servicios"
level: "intro"
draft: false
---

# Preparando el workspace y la estructura general del proyecto

En esta clase vamos a preparar la base operativa de **NovaMarket**.

Todavía no vamos a crear microservicios con Spring Initializr.  
Antes de eso, conviene dejar listo el terreno donde el proyecto va a crecer durante todo el curso.

Esta clase es importante porque muchas veces los problemas de un proyecto práctico no empiezan por el código Java, sino por una estructura desordenada, una organización poco clara o decisiones improvisadas desde el comienzo.

La idea acá es simple:

**dejar preparado un workspace entendible, limpio y sostenible para todo el curso.**

---

## Objetivo de esta clase

Al terminar esta clase debería quedar listo:

- el directorio raíz de **NovaMarket**,
- la estructura general del monorepo,
- las carpetas donde van a vivir servicios e infraestructura,
- y una convención clara para nombres y organización.

Todavía no vamos a tener microservicios funcionando, pero sí vamos a dejar una base que nos permita avanzar sin desorden.

---

## Estado de partida

Partimos de un estado muy simple:

- ya sabemos que el proyecto práctico se llama **NovaMarket**,
- ya conocemos el flujo principal del sistema,
- y ya está decidido que este curso va a construir el proyecto de forma incremental.

En este punto todavía no existe el workspace real del proyecto.

---

## Qué vamos a construir hoy

En esta clase vamos a preparar:

- la carpeta raíz del proyecto,
- la estructura del monorepo,
- la ubicación de microservicios e infraestructura,
- una carpeta para documentación y soporte,
- y un criterio fijo para nombres de servicios y módulos.

---

## Por qué conviene trabajar como monorepo

Para este curso práctico, la opción más didáctica y más cómoda es usar un **monorepo**.

Eso significa que vamos a tener una carpeta principal que agrupa todos los módulos del proyecto.

Por ejemplo, dentro de una sola raíz vamos a ubicar:

- `catalog-service`
- `inventory-service`
- `order-service`
- `notification-service`
- `config-server`
- `discovery-server`
- `api-gateway`
- y carpetas auxiliares para infraestructura

Este enfoque es muy útil en un curso porque:

- hace más fácil seguir el proyecto,
- permite ver toda la arquitectura en un solo lugar,
- reduce fricción al levantar y revisar servicios,
- y ayuda a mantener coherencia durante todo el recorrido.

En un entorno profesional real también existen enfoques con repositorios separados, pero para enseñar y construir NovaMarket paso a paso, el monorepo es una muy buena elección.

---

## Estructura general recomendada

La estructura base recomendada para el curso puede ser esta:

```txt
novamarket/
  services/
  infrastructure/
  config-repo/
  docs/
  scripts/
```

### `services/`
Acá van a vivir los microservicios de negocio y también algunos componentes de entrada o integración, como el gateway.

### `infrastructure/`
Acá vamos a ubicar piezas auxiliares relacionadas con el entorno del sistema, especialmente cuando el proyecto empiece a crecer con Docker, mensajería, seguridad u observabilidad.

### `config-repo/`
Esta carpeta nos va a servir más adelante para representar el repositorio de configuración centralizada.

### `docs/`
Puede usarse para notas, diagramas, requests de prueba o documentación auxiliar.

### `scripts/`
Opcional, pero útil si más adelante queremos tener comandos de ayuda o scripts de soporte.

---

## Estructura concreta que vamos a usar en el curso

A medida que el proyecto avance, una forma razonable de organizarlo será esta:

```txt
novamarket/
  services/
    catalog-service/
    inventory-service/
    order-service/
    notification-service/
    config-server/
    discovery-server/
    api-gateway/
  infrastructure/
    docker/
    keycloak/
    rabbitmq/
    zipkin/
  config-repo/
  docs/
  scripts/
```

No hace falta crear todas las carpetas finales hoy.  
Pero sí conviene conocer desde ahora la forma general que va a tener el proyecto.

---

## Convención de nombres

Para que el curso mantenga coherencia, conviene dejar fija una convención simple.

### Regla 1: nombres de servicios en minúsculas y con guion
Ejemplos:
- `catalog-service`
- `inventory-service`
- `order-service`

### Regla 2: nombres claros y alineados con la responsabilidad
Evitemos nombres ambiguos o muy genéricos.

### Regla 3: mantener consistencia entre nombre de carpeta, artifact y `spring.application.name`
Más adelante, esto va a evitar bastantes confusiones.

### Regla 4: usar el nombre **NovaMarket** solo para el sistema completo
Los módulos individuales deben mantener nombres específicos de servicio.

---

## Paso 1 · Crear la carpeta raíz del proyecto

Lo primero es crear una carpeta principal para el sistema.

Nombre recomendado:

```txt
novamarket
```

Si querés, podés crearla manualmente desde el explorador de archivos o desde terminal.

Ejemplo de comando:

```bash
mkdir novamarket
```

Después ingresá a esa carpeta:

```bash
cd novamarket
```

---

## Paso 2 · Crear las carpetas base del monorepo

Una vez dentro de `novamarket`, podemos crear la estructura mínima inicial.

```bash
mkdir services
mkdir infrastructure
mkdir config-repo
mkdir docs
mkdir scripts
```

Con eso ya queda preparada la base del proyecto.

---

## Paso 3 · Verificar la estructura inicial

En este punto, la carpeta debería verse aproximadamente así:

```txt
novamarket/
  services/
  infrastructure/
  config-repo/
  docs/
  scripts/
```

Todavía está vacía, y eso está bien.

El objetivo de hoy no es llenarla de proyectos, sino dejar un esqueleto claro sobre el que vamos a construir.

---

## Paso 4 · Preparar la carpeta donde van a vivir los servicios

Aunque todavía no generamos ningún servicio, sí conviene tener claro que todos los proyectos Spring Boot del curso van a nacer dentro de:

```txt
novamarket/services/
```

Eso significa que más adelante, cuando usemos Spring Initializr, cada proyecto generado debería terminar dentro de esa carpeta.

Por ejemplo:

```txt
novamarket/services/catalog-service
novamarket/services/inventory-service
novamarket/services/order-service
```

Esto evita que el curso se vuelva caótico a medida que crezca la cantidad de módulos.

---

## Paso 5 · Preparar la carpeta de infraestructura

Algo similar conviene hacer con infraestructura.

No hace falta llenar esta carpeta hoy, pero sí conviene decidir que más adelante acá va a vivir todo lo relacionado con soporte de entorno.

Por ejemplo:

```txt
novamarket/infrastructure/docker
novamarket/infrastructure/keycloak
novamarket/infrastructure/rabbitmq
novamarket/infrastructure/zipkin
```

Esto ayuda mucho a que la parte operativa del curso no termine mezclada con el código Java de los servicios.

---

## Paso 6 · Preparar una carpeta para requests o pruebas manuales

Una recomendación muy útil para este curso práctico es dejar dentro de `docs/` o dentro de una carpeta específica un espacio para pruebas manuales.

Por ejemplo:

```txt
novamarket/docs/http
```

O también:

```txt
novamarket/docs/requests
```

Más adelante eso te puede servir para guardar:

- ejemplos de requests,
- payloads JSON,
- casos de prueba,
- o notas de verificación rápida.

No es obligatorio, pero suma bastante.

---

## Estructura mínima sugerida al terminar hoy

Una estructura mínima muy razonable al finalizar esta clase sería esta:

```txt
novamarket/
  services/
  infrastructure/
  config-repo/
  docs/
    requests/
  scripts/
```

Si querés, podés crear `requests/` ahora mismo:

```bash
mkdir docs/requests
```

---

## Qué todavía no estamos haciendo

Es importante no adelantarse.

En esta clase **todavía no** estamos:

- generando proyectos con Initializr,
- escribiendo clases Java,
- configurando puertos,
- levantando Spring Boot,
- ni creando endpoints.

Todo eso viene ya a continuación.

Lo de hoy tiene valor porque prepara una base ordenada para que esos pasos sean más claros y sostenibles.

---

## Errores comunes en esta etapa

### 1. Empezar a crear servicios sin una carpeta raíz clara
Eso suele terminar en proyectos dispersos o mal organizados.

### 2. Mezclar infraestructura con servicios
Conviene separar desde el principio lo que es lógica del sistema de lo que es soporte de entorno.

### 3. Usar nombres inconsistentes
Si la carpeta se llama de una forma y el proyecto de otra, más adelante aparecen fricciones evitables.

### 4. Crear demasiada estructura antes de necesitarla
No hace falta sobrediseñar el workspace.  
Alcanza con dejar una base limpia y coherente.

---

## Resultado esperado al terminar la clase

Al terminar esta clase debería existir un workspace parecido a este:

```txt
novamarket/
  services/
  infrastructure/
  config-repo/
  docs/
  scripts/
```

Y debería estar claro que:

- los microservicios van a vivir dentro de `services/`,
- la infraestructura va a organizarse por separado,
- y el proyecto va a crecer como monorepo.

---

## Punto de control

Antes de pasar a la próxima clase, verificá lo siguiente:

- existe la carpeta raíz `novamarket`,
- existe la carpeta `services`,
- existe la carpeta `infrastructure`,
- existe la carpeta `config-repo`,
- y tenés claro que los próximos proyectos Spring Boot se van a crear dentro de `services/`.

Si eso está listo, ya podemos empezar a crear el primer microservicio real del curso.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a generar el primer servicio del proyecto:

**`catalog-service`**

Ahí sí vamos a entrar en Spring Initializr, dependencias, estructura del proyecto y primer arranque real con Spring Boot.

---

## Cierre

Esta clase dejó preparada la base física y organizativa de NovaMarket.

Puede parecer un paso simple, pero tiene muchísimo valor porque nos evita improvisación más adelante y nos permite construir todo el curso sobre un workspace claro.

A partir de la próxima clase empieza la construcción real de los servicios.
