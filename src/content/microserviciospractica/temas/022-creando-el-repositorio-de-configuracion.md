---
title: "Creando el repositorio de configuración"
description: "Construcción del config-repo de NovaMarket. Creación de archivos por servicio, organización de propiedades y preparación del entorno para que los microservicios consuman configuración centralizada."
order: 22
module: "Módulo 4 · Configuración centralizada"
level: "intermedio"
draft: false
---

# Creando el repositorio de configuración

En la clase anterior creamos **`config-server`** y lo dejamos listo para servir configuración desde una carpeta local del proyecto.

Ahora toca construir la segunda mitad de esa infraestructura:

**el repositorio de configuración.**

Hasta ahora, el servidor existe, pero todavía no tiene archivos útiles para entregar.  
Eso significa que NovaMarket ya tiene el componente que sirve configuración, pero todavía no tiene el contenido que los microservicios van a consumir.

Esta clase resuelve justamente eso.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creada y organizada la carpeta `config-repo`,
- definidos archivos de configuración por servicio,
- preparada configuración compartida,
- y lista la base para que `catalog-service`, `inventory-service` y `order-service` empiecen a consumir configuración centralizada.

Todavía no vamos a conectar los clientes.  
Primero necesitamos que el repositorio exista y tenga sentido.

---

## Estado de partida

Partimos de este contexto:

- `config-server` ya fue creado,
- `config-server` ya apunta a `../config-repo`,
- la carpeta `novamarket/config-repo/` ya existe,
- pero todavía no contiene archivos reales de configuración.

Además, los servicios siguen leyendo su configuración local desde sus propios `application.yml`.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- definir una estructura clara para `config-repo`,
- crear archivos base,
- separar propiedades compartidas de propiedades específicas,
- y dejar la configuración lista para que el siguiente paso sea conectar clientes al servidor.

---

## Qué problema resuelve `config-repo`

Si `config-server` es el componente que expone configuración, `config-repo` es la fuente desde la que la obtiene.

En este curso práctico, vamos a usar una estrategia **local y nativa** para simplificar el entorno:

- el servidor levanta dentro del monorepo,
- y lee archivos desde una carpeta también dentro del monorepo.

Eso nos da una gran ventaja didáctica:

- es fácil de entender,
- fácil de inspeccionar,
- y fácil de modificar mientras construimos NovaMarket.

---

## Qué tipo de archivos vamos a usar

Como venimos trabajando con YAML, conviene sostener el mismo formato también en `config-repo`.

Eso nos deja una estructura homogénea y fácil de leer.

La idea general es tener:

- un archivo compartido para configuración común,
- y archivos específicos por microservicio.

Una estructura razonable para esta etapa podría ser:

```txt
novamarket/
  config-repo/
    application.yml
    catalog-service.yml
    inventory-service.yml
    order-service.yml
```

Más adelante podremos agregar:

- `api-gateway.yml`
- `discovery-server.yml`
- `config-server.yml`
- perfiles como `catalog-service-dev.yml`

Pero para esta etapa no hace falta adelantarse tanto.

---

## Qué rol cumple cada archivo

### `application.yml`
Sirve para propiedades compartidas por varios servicios.

### `catalog-service.yml`
Contiene propiedades específicas de `catalog-service`.

### `inventory-service.yml`
Contiene propiedades específicas de `inventory-service`.

### `order-service.yml`
Contiene propiedades específicas de `order-service`.

Este esquema es simple y funciona muy bien para empezar.

---

## Paso 1 · Revisar la carpeta `config-repo`

Asegurate de que exista esta ruta:

```txt
novamarket/config-repo/
```

Si todavía no la creaste, este es el momento.

El objetivo es que el repositorio de configuración viva en la raíz del proyecto práctico y no dentro de un microservicio en particular.

---

## Paso 2 · Crear `application.yml`

Ahora vamos a crear el archivo compartido:

```txt
novamarket/config-repo/application.yml
```

Una primera versión razonable y sencilla podría ser algo como esto:

```yaml
app:
  environment: local

management:
  endpoints:
    web:
      exposure:
        include: health,info
```

No hace falta que este archivo sea gigante.  
Lo importante es que ya introduzca la idea de propiedades comunes que podrían ser compartidas por distintos servicios.

---

## Paso 3 · Crear `catalog-service.yml`

Ahora creá:

```txt
novamarket/config-repo/catalog-service.yml
```

Una versión razonable para esta etapa podría ser:

```yaml
spring:
  application:
    name: catalog-service
  datasource:
    url: jdbc:h2:mem:catalogdb
    driver-class-name: org.h2.Driver
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

server:
  port: 8081

catalog:
  seed-enabled: true
```

Fijate que, para este momento del curso, estamos moviendo al repositorio centralizado tanto el nombre del servicio como la configuración de base y puerto.

---

## Paso 4 · Crear `inventory-service.yml`

Ahora creá:

```txt
novamarket/config-repo/inventory-service.yml
```

Una base razonable podría ser:

```yaml
spring:
  application:
    name: inventory-service
  datasource:
    url: jdbc:h2:mem:inventorydb
    driver-class-name: org.h2.Driver
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

server:
  port: 8082

inventory:
  seed-enabled: true
```

La lógica es equivalente a la del catálogo, pero con configuración específica para inventario.

---

## Paso 5 · Crear `order-service.yml`

Ahora creá:

```txt
novamarket/config-repo/order-service.yml
```

Una versión razonable podría ser:

```yaml
spring:
  application:
    name: order-service
  datasource:
    url: jdbc:h2:mem:orderdb
    driver-class-name: org.h2.Driver
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

server:
  port: 8083

order:
  validation:
    stock-required: true
```

Acá ya empezamos a ver el valor de la configuración centralizada:  
propiedades técnicas y propiedades más cercanas al comportamiento del servicio pueden convivir en el mismo lugar.

---

## Paso 6 · Revisar consistencia de nombres

Este paso es importante.

Asegurate de que los nombres de los archivos coincidan exactamente con los `spring.application.name` que van a usar los clientes.

Por ejemplo:

- `catalog-service` ↔ `catalog-service.yml`
- `inventory-service` ↔ `inventory-service.yml`
- `order-service` ↔ `order-service.yml`

Más adelante, si esto no coincide, Config Server no va a resolver la configuración como esperamos.

---

## Paso 7 · Revisar qué propiedades estamos moviendo

En esta etapa conviene mover propiedades que ya existen localmente en los servicios, como:

- `spring.application.name`
- `server.port`
- `spring.datasource.*`
- `spring.jpa.*`

Esto nos prepara muy bien para la próxima clase, donde vamos a conectar el primer cliente.

No hace falta todavía centralizar absolutamente todo.  
Lo importante es que ya haya contenido real y coherente en `config-repo`.

---

## Paso 8 · Levantar `config-server`

Una vez creados los archivos, levantá nuevamente `config-server`.

Queremos verificar que:

- arranca correctamente,
- sigue apuntando a `config-repo`,
- y ya tiene archivos reales para servir.

En esta etapa todavía no hace falta que los clientes lo consuman, pero sí conviene que el servidor esté arriba y listo.

---

## Paso 9 · Probar resolución de configuración desde el servidor

Aunque todavía no conectamos a los servicios como clientes, ya podés probar si el servidor expone configuración.

Por ejemplo, con `config-server` en `8888`, podrías consultar algo como:

```txt
http://localhost:8888/catalog-service/default
```

Y también:

```txt
http://localhost:8888/inventory-service/default
http://localhost:8888/order-service/default
```

La respuesta debería ser un JSON generado por Config Server mostrando las propiedades resueltas para cada aplicación.

Esta es una muy buena verificación porque confirma que:

- `config-server` está funcionando,
- y `config-repo` está bien estructurado.

---

## Qué estamos logrando con esta clase

Esta clase deja completa la infraestructura mínima de configuración centralizada.

Ahora NovaMarket ya tiene:

- un servidor de configuración,
- un repositorio de configuración,
- archivos por servicio,
- y un punto de distribución centralizado listo para empezar a ser consumido.

Eso es un cambio arquitectónico bastante importante.

---

## Qué todavía no hicimos

Todavía no conectamos:

- `catalog-service`
- `inventory-service`
- `order-service`

como clientes del servidor.

Tampoco trabajamos todavía con:

- perfiles por entorno,
- repositorio Git remoto,
- ni refresh dinámico de propiedades.

Todo eso puede venir después.

La meta de hoy es mucho más concreta:

**dejar el repositorio de configuración creado y operativo.**

---

## Errores comunes en esta etapa

### 1. Nombrar mal los archivos
Si el nombre no coincide con el `spring.application.name`, Config Server no los va a resolver como esperamos.

### 2. Mezclar propiedades en archivos incorrectos
Conviene mantener clara la separación entre lo compartido y lo específico.

### 3. Apuntar `config-server` a una ruta equivocada
Entonces el servidor arranca, pero no encuentra nada útil.

### 4. No probar las URLs del Config Server
Es una forma muy buena de verificar la infraestructura antes de conectar clientes.

### 5. Intentar meter perfiles avanzados demasiado pronto
En esta etapa, menos es más.

---

## Resultado esperado al terminar la clase

Al terminar esta clase debería existir algo como esto:

```txt
novamarket/
  config-repo/
    application.yml
    catalog-service.yml
    inventory-service.yml
    order-service.yml
```

Y `config-server` debería poder resolver configuración para esos servicios.

Eso deja el terreno listo para que los microservicios empiecen a dejar atrás sus archivos locales y pasen a cargar configuración centralizada.

---

## Punto de control

Antes de seguir, verificá que:

- existen los archivos en `config-repo`,
- los nombres coinciden con los servicios,
- `config-server` arranca correctamente,
- y URLs como `http://localhost:8888/catalog-service/default` responden con configuración.

Si eso está bien, ya podemos empezar a conectar el primer cliente.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a conectar `catalog-service` al Config Server.

Ese va a ser el primer paso real donde uno de los microservicios deje de leer configuración local aislada y empiece a consumir configuración centralizada.

---

## Cierre

En esta clase construimos el repositorio de configuración de NovaMarket.

Con eso, la infraestructura de configuración centralizada ya quedó completa en su versión mínima: servidor y contenido.

Ahora sí estamos listos para empezar a mover los microservicios hacia ese nuevo esquema.
