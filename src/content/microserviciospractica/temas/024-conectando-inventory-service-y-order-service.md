---
title: "Conectando inventory-service y order-service"
description: "Extensión de la configuración centralizada al resto de los servicios principales de NovaMarket. Integración de inventory-service y order-service con config-server y verificación de arranque."
order: 24
module: "Módulo 4 · Configuración centralizada"
level: "intermedio"
draft: false
---

# Conectando `inventory-service` y `order-service`

En la clase anterior conectamos `catalog-service` al Config Server y validamos que un microservicio del sistema ya puede cargar configuración centralizada.

Ahora toca completar el mismo proceso para los otros dos servicios principales del flujo actual de NovaMarket:

- `inventory-service`
- `order-service`

La lógica va a ser muy parecida, pero esta clase tiene un valor especial porque una vez terminada vamos a tener a los tres servicios principales del sistema consumiendo configuración desde el mismo lugar.

Eso cambia bastante la madurez del proyecto.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- `inventory-service` consumiendo configuración desde `config-server`,
- `order-service` consumiendo configuración desde `config-server`,
- reducida la configuración local de ambos servicios,
- y verificado que el flujo de creación de órdenes siga funcionando.

---

## Estado de partida

En este punto del curso, ya deberíamos tener:

- `config-server` operativo,
- `config-repo` con:
  - `inventory-service.yml`
  - `order-service.yml`
- y `catalog-service` ya conectado como cliente del servidor.

`inventory-service` y `order-service` todavía deberían seguir usando, al menos en parte, configuración local.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- agregar la dependencia de cliente en ambos servicios si todavía no la tienen,
- ajustar sus archivos locales,
- confirmar que las propiedades necesarias existen en `config-repo`,
- arrancar ambos servicios contra `config-server`,
- y verificar que el flujo actual del sistema no se rompa.

---

## Qué problema resolvemos al hacer esto

Queremos evitar una situación híbrida incómoda donde:

- un servicio usa configuración centralizada,
- y los otros siguen atados a sus archivos locales.

Eso genera una arquitectura inconsistente.

La meta de esta clase es que el núcleo actual del sistema quede alineado:

- catálogo,
- inventario,
- y órdenes

deben apoyarse en la misma estrategia de configuración.

---

## Paso 1 · Revisar `inventory-service.yml` y `order-service.yml` en `config-repo`

Antes de tocar los clientes, asegurate de que los archivos de configuración remota realmente existen y tienen lo necesario.

### `inventory-service.yml`
Debería incluir, como mínimo:

- `spring.application.name`
- datasource
- JPA
- `server.port`

### `order-service.yml`
También debería incluir:

- `spring.application.name`
- datasource
- JPA
- `server.port`
- y cualquier otra propiedad específica que quieras dejar centralizada

Si esos archivos están mal nombrados o incompletos, el arranque del cliente va a fallar o va a quedar a medio camino.

---

## Paso 2 · Agregar Config Client a `inventory-service`

Dentro de `inventory-service`, asegurate de tener agregada la dependencia de:

- **Spring Cloud Config Client**

Si todavía no está, este es el momento de incorporarla.

La idea es que el servicio pueda resolver configuración remota en el arranque, igual que ya lo hace `catalog-service`.

---

## Paso 3 · Ajustar el archivo local de `inventory-service`

Ahora revisá el `application.yml` local de `inventory-service`.

La idea es dejarlo reducido a lo mínimo necesario para que el cliente:

- se identifique,
- y sepa dónde está el servidor de configuración.

Una base conceptual razonable podría ser:

```yaml
spring:
  application:
    name: inventory-service
  config:
    import: "optional:configserver:http://localhost:8888"
```

Todo lo demás debería vivir preferentemente en:

```txt
config-repo/inventory-service.yml
```

---

## Paso 4 · Agregar Config Client a `order-service`

Repetí la misma lógica en `order-service`.

Asegurate de tener incorporada la dependencia de:

- **Spring Cloud Config Client**

Este paso es muy importante porque `order-service` es el núcleo del flujo actual y queremos que también deje atrás la configuración local dispersa.

---

## Paso 5 · Ajustar el archivo local de `order-service`

Ahora reducí el archivo local de `order-service` al mínimo necesario.

Una base conceptual razonable podría ser:

```yaml
spring:
  application:
    name: order-service
  config:
    import: "optional:configserver:http://localhost:8888"
```

El resto de las propiedades del servicio deberían estar ya en:

```txt
config-repo/order-service.yml
```

---

## Paso 6 · Levantar `config-server`

Antes de arrancar los clientes, levantá `config-server`.

Queremos asegurarnos de que:

- está arriba,
- puede resolver:
  - `inventory-service/default`
  - `order-service/default`
- y el repositorio centralizado está disponible.

Podés probar:

```txt
http://localhost:8888/inventory-service/default
http://localhost:8888/order-service/default
```

Si eso responde bien, ya tenemos listo el lado servidor.

---

## Paso 7 · Levantar `inventory-service`

Ahora levantá `inventory-service`.

Conviene mirar bien los logs de arranque para detectar:

- si encontró `config-server`,
- si pudo resolver el entorno remoto,
- y si arrancó usando el puerto y las propiedades centralizadas.

Una vez arriba, probá:

```bash
curl http://localhost:8082/inventory
```

Si el servicio responde como antes, entonces la migración hacia Config Server no rompió su contrato funcional.

---

## Paso 8 · Levantar `order-service`

Ahora hacé lo mismo con `order-service`.

Prestá atención a:

- resolución de propiedades remotas,
- datasource,
- JPA,
- puerto,
- y arranque general del servicio.

Una vez levantado, el punto clave ya no es solo si arranca, sino si sigue integrando correctamente con `inventory-service`.

---

## Paso 9 · Verificar `POST /orders`

Ahora probá nuevamente el flujo de creación de órdenes.

Por ejemplo:

```bash
curl -X POST http://localhost:8083/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 2 },
      { "productId": 2, "quantity": 1 }
    ]
  }'
```

La respuesta esperada debería seguir siendo:

- `201 Created`
- una orden válida con id generado

Esto es muy importante porque confirma que:

- `order-service` arrancó con configuración centralizada,
- `inventory-service` también,
- y la integración entre ambos sigue funcionando.

---

## Paso 10 · Verificar un error de negocio controlado

Probá también una orden sin stock suficiente:

```bash
curl -X POST http://localhost:8083/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 3, "quantity": 99 }
    ]
  }'
```

La respuesta debería seguir siendo un `400 Bad Request` con mensaje claro.

Esto confirma que la migración de configuración no afectó la lógica del flujo.

---

## Qué estamos logrando con esta clase

Al terminar esta clase, NovaMarket ya tiene a sus tres servicios principales del momento consumiendo configuración centralizada:

- `catalog-service`
- `inventory-service`
- `order-service`

Eso significa que el proyecto ya no depende solo de archivos locales aislados para definir entorno y comportamiento técnico básico.

Es un avance bastante importante en términos de arquitectura.

---

## Qué todavía no hicimos

Todavía no estamos trabajando con:

- perfiles por entorno,
- refresh dinámico,
- repositorio Git real,
- ni otros servicios de infraestructura conectados como clientes.

Todo eso puede venir después.

La meta de hoy es más concreta:

**que el núcleo de NovaMarket ya quede alineado con configuración centralizada.**

---

## Errores comunes en esta etapa

### 1. Olvidar la dependencia de Config Client en uno de los servicios
Eso genera comportamientos inconsistentes.

### 2. Dejar nombres de aplicación distintos al archivo remoto
Entonces Config Server no resuelve correctamente.

### 3. Arrancar clientes sin el servidor de configuración arriba
Conviene mantener el orden de arranque.

### 4. Duplicar demasiadas propiedades localmente
Eso vuelve confuso qué fuente de configuración está prevaleciendo.

### 5. No volver a probar el flujo de órdenes
Este paso es clave para confirmar que la migración fue sana.

---

## Resultado esperado al terminar la clase

Al terminar esta clase:

- `inventory-service` debería usar configuración centralizada,
- `order-service` debería usar configuración centralizada,
- y el flujo principal de creación de órdenes debería seguir funcionando.

Con eso, el bloque base de configuración centralizada queda realmente integrado en el sistema.

---

## Punto de control

Antes de seguir, verificá que:

- `inventory-service` carga configuración desde `config-server`,
- `order-service` carga configuración desde `config-server`,
- ambos servicios arrancan correctamente,
- y `POST /orders` sigue funcionando con normalidad.

Si eso está bien, ya podemos pasar a un refinamiento muy útil de este bloque: los perfiles y las propiedades por entorno.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a trabajar con perfiles y propiedades por entorno.

Ese paso nos va a permitir darle a NovaMarket una forma más flexible de gestionar diferencias entre, por ejemplo, desarrollo y otros escenarios.

---

## Cierre

En esta clase completamos la primera ola de migración hacia Config Server en los servicios principales de NovaMarket.

Con eso, la configuración centralizada dejó de ser solo una pieza de infraestructura montada y pasó a convertirse en una práctica real del proyecto.
