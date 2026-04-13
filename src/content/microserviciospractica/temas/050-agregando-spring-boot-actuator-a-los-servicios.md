---
title: "Agregando Spring Boot Actuator a los servicios"
description: "Inicio del bloque de observabilidad de NovaMarket. Incorporación de Spring Boot Actuator en los servicios principales para exponer health, info y una base operativa común."
order: 50
module: "Módulo 9 · Observabilidad de punta a punta"
level: "intermedio"
draft: false
---

# Agregando Spring Boot Actuator a los servicios

Hasta este punto, **NovaMarket** ya tiene bastante complejidad real:

- servicios de negocio,
- persistencia,
- configuración centralizada,
- discovery,
- gateway,
- seguridad con Keycloak,
- y un primer bloque de resiliencia bastante serio.

Ahora toca entrar en otro tema fundamental para cualquier sistema distribuido que empieza a madurar:

**la observabilidad.**

Porque una cosa es que el sistema funcione.  
Y otra muy distinta es poder **ver** qué está pasando dentro de él de una manera razonable.

El primer paso práctico para eso suele ser bastante concreto:

**agregar Actuator a los servicios.**

En esta clase vamos a empezar a construir esa base.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- agregada la dependencia de Actuator a los servicios principales,
- expuestos endpoints operativos básicos,
- y disponible una base homogénea para consultar estado, salud e información técnica mínima de NovaMarket.

No vamos a resolver todavía toda la observabilidad del sistema.  
La meta de hoy es dejar el primer piso bien armado.

---

## Estado de partida

Partimos de una arquitectura donde:

- `catalog-service`
- `inventory-service`
- `order-service`
- `api-gateway`

ya existen y tienen roles claros dentro del flujo actual.

Además, en el bloque anterior ya usamos Actuator especialmente sobre `order-service` para observar mejor resiliencia.  
Ahora lo que queremos es **extender esa capacidad** y convertirla en una práctica más general del sistema.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar o agregar la dependencia de Actuator en los servicios principales,
- definir endpoints operativos mínimos,
- exponer `health` e `info`,
- y validar que cada servicio ya ofrece una superficie básica de observación.

---

## Qué problema resuelve Actuator en este momento del curso

A medida que NovaMarket crece, necesitamos poder responder preguntas como:

- ¿el servicio está arriba?
- ¿está sano o está en un estado degradado?
- ¿qué endpoints operativos tengo disponibles?
- ¿qué señales mínimas puedo consultar sin entrar al código ni depender solo de logs?

Actuator no resuelve toda la observabilidad, pero sí da una base muy útil para empezar.

---

## Qué servicios conviene cubrir en esta clase

Para esta etapa del curso práctico, conviene enfocarnos al menos en:

- `catalog-service`
- `inventory-service`
- `order-service`
- `api-gateway`

No hace falta que todos tengan exactamente la misma riqueza operativa desde el primer minuto, pero sí conviene que todos expongan una base homogénea y fácil de consultar.

---

## Paso 1 · Agregar la dependencia de Actuator en `catalog-service`

Dentro de `catalog-service`, agregá la dependencia correspondiente a:

- **Spring Boot Actuator**

Si ya la venís usando en algún servicio, mejor todavía.  
La idea es que ahora quede como una práctica deliberada y sistemática.

---

## Paso 2 · Repetir la dependencia en `inventory-service`

Ahora hacé lo mismo en:

- `inventory-service`

Queremos que este servicio también empiece a ofrecer endpoints operativos básicos.

Esto es especialmente útil porque inventario es una dependencia crítica del flujo de órdenes y conviene poder observarlo con más claridad.

---

## Paso 3 · Repetir la dependencia en `order-service`

En `order-service`, si ya tenías Actuator por el bloque anterior, conviene revisar que siga bien integrado.

Si todavía no estaba formalmente agregado o querés alinearlo con el resto, este es el momento de dejarlo consistente con los demás servicios.

---

## Paso 4 · Agregar la dependencia también en `api-gateway`

Esto es muy valioso.

El gateway es hoy el punto de entrada del sistema, así que tener visibilidad mínima sobre su estado operativo es especialmente importante.

Por eso conviene agregar Actuator también en:

- `api-gateway`

---

## Paso 5 · Definir exposición mínima en la configuración remota

Como NovaMarket ya usa configuración centralizada, una opción razonable es definir la exposición de endpoints en `config-repo`.

Podés hacerlo servicio por servicio, por ejemplo en:

- `catalog-service.yml`
- `inventory-service.yml`
- `order-service.yml`
- `api-gateway.yml`

Una base muy razonable para empezar podría ser:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info
```

Con esto ya tenemos algo muy útil sin abrir demasiado de entrada.

---

## Paso 6 · Opcionalmente enriquecer `info`

Además de `health`, puede ser útil exponer algo de información general con `info`.

Por ejemplo, según cómo quieras llevar el curso, podrías sumar propiedades como:

```yaml
info:
  app:
    name: catalog-service
    description: Servicio de catálogo de NovaMarket
```

Y equivalentes para otros servicios.

No es obligatorio, pero es una forma linda y clara de hacer más expresivo el endpoint `/actuator/info`.

---

## Paso 7 · Reiniciar los servicios

Una vez agregada la dependencia y ajustada la configuración, reiniciá los servicios correspondientes.

Conviene hacerlo de forma ordenada y verificar en cada uno que:

- arranca correctamente,
- no hay conflictos de configuración,
- y Actuator quedó realmente disponible.

Para esta clase podés ir validando servicio por servicio, sin necesidad de levantar todo el ecosistema al mismo tiempo desde el principio.

---

## Paso 8 · Probar `health` en `catalog-service`

Una vez arriba, probá algo como:

```bash
curl http://localhost:8081/actuator/health
```

La idea es comprobar que el servicio responde y que ya expone su estado operativo.

No hace falta que el output sea súper sofisticado todavía.  
Lo importante es tener una respuesta clara y usable.

---

## Paso 9 · Probar `health` en `inventory-service`

Ahora probá:

```bash
curl http://localhost:8082/actuator/health
```

Esto es especialmente útil para inventario porque, como ya vimos en resiliencia, es un servicio del que depende directamente el flujo de órdenes.

---

## Paso 10 · Probar `health` en `order-service`

Ahora probá:

```bash
curl http://localhost:8083/actuator/health
```

Acá queremos seguir consolidando lo que empezamos a usar en el bloque anterior, pero ahora ya como parte del módulo formal de observabilidad.

---

## Paso 11 · Probar `health` en `api-gateway`

Y finalmente probá:

```bash
curl http://localhost:8080/actuator/health
```

Esto ayuda mucho porque el gateway es hoy la pieza por la que entra todo el sistema, así que saber rápidamente si está vivo es muy valioso.

---

## Paso 12 · Probar `info`

Si configuraste también el bloque `info`, conviene probarlo en varios servicios.

Por ejemplo:

```bash
curl http://localhost:8081/actuator/info
curl http://localhost:8082/actuator/info
curl http://localhost:8083/actuator/info
curl http://localhost:8080/actuator/info
```

Esto no es crítico para el flujo funcional del sistema, pero sí suma bastante a la claridad operativa y a la consistencia del proyecto.

---

## Qué estamos logrando con esta clase

Esta clase no cambia el negocio del sistema, pero sí mejora mucho su operabilidad.

Después de esta clase, NovaMarket deja de ser una arquitectura donde para saber si algo está vivo había que:

- deducirlo por consola,
- o hacer una request funcional al azar.

Ahora empezamos a tener endpoints explícitos pensados para observación operativa.

Eso es un salto importante de madurez.

---

## Qué todavía no estamos haciendo

Todavía no estamos trabajando a fondo con:

- métricas ricas,
- tracing distribuido,
- visualización centralizada,
- ni análisis profundo del comportamiento del sistema.

Todo eso viene después.

La meta de hoy es mucho más concreta:

**dejar una base homogénea de endpoints operativos con Actuator.**

---

## Errores comunes en esta etapa

### 1. Agregar Actuator solo a un servicio y olvidarse del resto
Conviene sostener una base bastante homogénea.

### 2. No exponer `health` e `info`
Entonces parece que “Actuator está”, pero no aporta casi nada visible.

### 3. No reiniciar los servicios después de cambiar configuración
Eso suele dejar resultados confusos.

### 4. Abrir demasiados endpoints de entrada sin criterio
Para esta etapa, `health` e `info` son una base muy buena.

### 5. Confundir endpoints operativos con endpoints de negocio
Actuator no reemplaza la API funcional; la complementa.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, los servicios principales de NovaMarket deberían exponer al menos:

- `/actuator/health`
- `/actuator/info`

Y eso ya debería darte una base mucho más clara para observar el estado operativo del sistema.

---

## Punto de control

Antes de seguir, verificá que:

- Actuator está agregado en los servicios principales,
- `health` responde en cada uno,
- `info` responde donde lo configuraste,
- y el sistema sigue funcionando normalmente.

Si eso está bien, ya podemos enriquecer la observabilidad con métricas.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a trabajar con **Micrometer** y métricas.

Ese será el siguiente paso natural para pasar de “servicios vivos” a “servicios con señales medibles” dentro de NovaMarket.

---

## Cierre

En esta clase agregamos Spring Boot Actuator a los servicios principales de NovaMarket.

Con eso, la arquitectura gana una base operativa mucho más útil y visible, que nos prepara muy bien para entrar en el resto del bloque de observabilidad.
