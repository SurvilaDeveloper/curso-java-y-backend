---
title: "Ajustando configuración mínima de los tres servicios"
description: "Estandarización de la configuración base de catalog-service, inventory-service y order-service. Definición de spring.application.name, puertos y criterios comunes para seguir construyendo NovaMarket con coherencia."
order: 6
module: "Módulo 1 · Preparación del proyecto y primeros servicios"
level: "base"
draft: false
---

# Ajustando configuración mínima de los tres servicios

Ya tenemos creados los tres primeros microservicios de **NovaMarket**:

- `catalog-service`
- `inventory-service`
- `order-service`

Eso ya es un muy buen avance, pero todavía nos falta algo importante:

**darles una base de configuración homogénea.**

En una arquitectura distribuida, incluso cuando todavía es pequeña, conviene mantener criterios estables desde el principio.  
Si cada servicio arranca con configuraciones improvisadas o diferentes entre sí, más adelante empiezan a aparecer fricciones innecesarias.

Esta clase tiene justamente ese objetivo:  
dejar una configuración mínima común para los tres servicios base.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar definido de forma consistente en los tres servicios:

- `spring.application.name`
- `server.port`
- formato de archivo de configuración
- y criterio general de organización de properties

No estamos todavía entrando en Config Server.  
Eso vendrá después.  
Por ahora queremos que la configuración local de cada servicio ya tenga una forma clara y uniforme.

---

## Estado de partida

Partimos de un monorepo donde ya existen:

```txt
novamarket/
  services/
    catalog-service/
    inventory-service/
    order-service/
```

Y además:

- los tres proyectos deberían abrir correctamente,
- y los tres servicios deberían poder arrancar.

Es posible que ya hayas definido puertos o nombres en alguno de ellos.  
En esta clase la idea es revisarlos y dejarlos alineados.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar el archivo de configuración de cada servicio,
- unificar formato,
- definir `spring.application.name` de forma explícita,
- definir `server.port` de forma clara,
- y verificar que la configuración mínima quede homogénea en los tres proyectos.

---

## Por qué esto importa

Aunque todavía no estemos usando Config Server, Eureka ni Gateway, estos primeros ajustes ayudan mucho a preparar el camino.

Tener el nombre de aplicación bien definido va a ser útil más adelante para:

- configuración centralizada,
- discovery,
- observabilidad,
- y trazabilidad de logs.

Tener puertos definidos va a ayudar a:

- levantar varios servicios a la vez,
- hacer pruebas locales,
- evitar conflictos,
- y ordenar el entorno.

Y tener un criterio uniforme de configuración va a mejorar bastante la mantenibilidad del proyecto.

---

## Decisión recomendada: usar `application.yml`

Spring Boot admite distintas formas de configuración, pero para este curso conviene elegir una sola y sostenerla.

Una buena opción es usar:

```txt
application.yml
```

¿Por qué?

Porque:

- es claro,
- fácil de leer,
- común en proyectos Spring,
- y se lleva bien con estructuras jerárquicas que más adelante van a aparecer bastante.

Si alguno de tus proyectos quedó con `application.properties`, esta clase es un buen momento para decidir si querés migrarlo al formato YAML y dejar el criterio fijo para el resto del curso.

---

## Configuración mínima recomendada por servicio

### `catalog-service`

```yaml
spring:
  application:
    name: catalog-service

server:
  port: 8081
```

### `inventory-service`

```yaml
spring:
  application:
    name: inventory-service

server:
  port: 8082
```

### `order-service`

```yaml
spring:
  application:
    name: order-service

server:
  port: 8083
```

Los puertos son una propuesta simple y ordenada para el curso práctico.  
Podés usar otros, pero mantener este patrón ayuda bastante a que el proyecto quede fácil de seguir.

---

## Paso 1 · Revisar `catalog-service`

Entrá en:

```txt
novamarket/services/catalog-service/src/main/resources/
```

Y verificá qué archivo de configuración existe.

### Si ya usás `application.yml`
Perfecto, revisalo y ajustalo.

### Si todavía tenés `application.properties`
Podés mantenerlo si querés, pero la recomendación para el curso es migrar a `application.yml` y dejar un único criterio para todos los servicios.

El objetivo es que `catalog-service` tenga explícitamente:

- nombre de aplicación
- puerto

---

## Paso 2 · Revisar `inventory-service`

Hacé lo mismo en:

```txt
novamarket/services/inventory-service/src/main/resources/
```

Asegurate de que el servicio tenga:

- `spring.application.name: inventory-service`
- `server.port: 8082`

Este paso es importante porque más adelante el nombre va a impactar en discovery y configuración externa.

---

## Paso 3 · Revisar `order-service`

Ahora repetí el proceso en:

```txt
novamarket/services/order-service/src/main/resources/
```

Dejá configurado:

- `spring.application.name: order-service`
- `server.port: 8083`

Con esto ya tendríamos los tres servicios base alineados.

---

## Paso 4 · Verificar que los nombres coincidan con las carpetas y el propósito del servicio

Este es un paso pequeño, pero útil.

Conviene revisar que haya coherencia entre:

- nombre de carpeta
- nombre del artifact
- nombre del servicio
- `spring.application.name`

Por ejemplo, para `catalog-service`:

- carpeta: `catalog-service`
- artifact: `catalog-service`
- application name: `catalog-service`

Esa consistencia más adelante simplifica mucho la lectura del sistema.

---

## Paso 5 · Verificar que no existan puertos repetidos

Antes de levantar todo de nuevo, revisá que no haya dos servicios usando el mismo puerto.

Una distribución simple y clara es:

- `catalog-service` → `8081`
- `inventory-service` → `8082`
- `order-service` → `8083`

Esto nos deja una progresión fácil de recordar y muy útil para pruebas manuales.

---

## Paso 6 · Levantar los tres servicios otra vez

Ahora conviene volver a levantar los tres servicios con la configuración ya alineada.

La idea es verificar:

- que arrancan correctamente,
- que respetan el puerto configurado,
- que no hay conflictos,
- y que el nombre de la aplicación quedó bien declarado.

En esta etapa podés hacerlo desde tres terminales distintas o desde el IDE, según tu forma de trabajo.

---

## Qué deberías ver en consola

Si todo está bien, al arrancar cada servicio deberías poder identificar con claridad:

- qué servicio está corriendo,
- en qué puerto está levantado,
- y que el arranque terminó sin errores.

Esto parece menor, pero ya mejora mucho la experiencia de trabajo cuando hay más de un microservicio al mismo tiempo.

---

## Verificación mínima recomendada

Probá estas rutas:

```txt
http://localhost:8081
http://localhost:8082
http://localhost:8083
```

Todavía puede haber `404`, y eso sigue siendo normal.  
Lo importante es que:

- cada servicio está arriba,
- el puerto responde,
- y no hay confusión sobre qué proceso corresponde a qué módulo.

---

## Buenas prácticas que estamos fijando desde ahora

Esta clase no introduce una tecnología espectacular, pero sí fija costumbres muy valiosas para lo que viene.

### 1. Nombrar siempre explícitamente el servicio
No dejarlo implícito.

### 2. Declarar siempre el puerto local
Evitar depender del puerto por defecto si el proyecto va a tener varios servicios.

### 3. Mantener formato homogéneo
Todos con YAML o todos con properties, pero no mezclados sin razón.

### 4. Evitar decisiones improvisadas
Cada microservicio nuevo debería seguir el mismo patrón.

---

## Qué todavía no estamos haciendo

Todavía no estamos:

- centralizando configuración,
- usando perfiles por entorno,
- cargando propiedades remotas,
- integrando Eureka,
- ni creando settings específicos de infraestructura.

Eso vendrá después.

El objetivo de hoy es más básico pero muy importante:  
que la configuración local inicial ya tenga orden y coherencia.

---

## Errores comunes en esta etapa

### 1. Dejar servicios sin `spring.application.name`
Más adelante eso complica bastante la evolución del proyecto.

### 2. Repetir puertos sin darse cuenta
Eso puede hacerte perder tiempo en errores simples de arranque.

### 3. Mezclar YAML y properties sin criterio
Conviene elegir una forma y sostenerla.

### 4. No revisar consistencia entre artifact y nombre de servicio
Pequeñas inconsistencias acá pueden generar confusión después.

### 5. Creer que esto es “solo prolijidad”
En realidad, esta base facilita mucho todo lo que viene.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, los tres servicios base deberían tener una configuración mínima clara y homogénea.

Algo equivalente a esto:

- `catalog-service` → nombre explícito + puerto `8081`
- `inventory-service` → nombre explícito + puerto `8082`
- `order-service` → nombre explícito + puerto `8083`

Y los tres deberían poder levantarse correctamente.

---

## Punto de control

Antes de seguir, verificá que:

- los tres servicios tienen un archivo de configuración claro,
- `spring.application.name` está definido en cada uno,
- cada servicio tiene un puerto distinto,
- la convención quedó homogénea,
- y los tres servicios arrancan bien con esa configuración.

Si eso está bien, ya tenemos una base mucho más firme para empezar a tocar estructura interna de código.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a definir una **estructura base de paquetes y clases** para que los tres servicios empiecen a tener una organización interna coherente y sostenible.

Ese paso va a preparar muy bien la entrada al primer flujo funcional del sistema.

---

## Cierre

En esta clase ajustamos la configuración mínima de los tres primeros microservicios de NovaMarket.

Puede parecer un paso simple, pero deja algo muy valioso: una base homogénea sobre la que después vamos a montar persistencia, discovery, gateway, seguridad y el resto del sistema sin arrastrar desorden innecesario desde el inicio.
