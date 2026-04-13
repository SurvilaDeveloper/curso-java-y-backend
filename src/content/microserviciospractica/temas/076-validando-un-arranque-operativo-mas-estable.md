---
title: "Validando un arranque operativo más estable"
description: "Checkpoint del refinamiento de Docker Compose en NovaMarket. Verificación del stack integrado después de los ajustes de configuración, healthchecks y dependencias."
order: 76
module: "Módulo 11 · Despliegue operativo con Docker Compose"
level: "intermedio"
draft: false
---

# Validando un arranque operativo más estable

En las últimas clases hicimos un trabajo muy importante sobre el entorno integrado de NovaMarket:

- modelamos Docker Compose,
- sumamos la infraestructura,
- incorporamos los microservicios propios,
- ajustamos la configuración para el mundo Docker,
- y además mejoramos el arranque con healthchecks y dependencias más robustas.

Ahora toca algo fundamental:

**volver a validar el stack completo después de todos esos refinamientos.**

Porque una cosa es haber mejorado el archivo compose y la configuración.  
Y otra distinta es comprobar que el entorno realmente se siente más estable, más predecible y más operable.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- el entorno Compose mejorado levanta correctamente,
- las piezas críticas están más ordenadas en su arranque,
- el sistema integrado sigue funcionando,
- y NovaMarket ya tiene una base local bastante sólida de operación unificada.

Esta clase funciona como checkpoint fuerte del refinamiento del bloque de Docker Compose.

---

## Estado de partida

Partimos de un stack que ya debería tener:

- servicios e infraestructura modelados,
- referencias internas más coherentes,
- healthchecks básicos,
- dependencias más razonables,
- y un `docker-compose.yml` bastante más robusto que en la primera versión.

Ahora toca poner todo eso a prueba.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- volver a levantar el stack,
- observar el arranque refinado,
- verificar las piezas principales del sistema,
- probar flujos funcionales clave,
- y confirmar que la experiencia operativa mejoró realmente.

---

## Qué queremos comprobar de verdad

Más allá de “el compose levanta”, hay preguntas más interesantes:

- ¿Config Server y Eureka se estabilizan mejor?
- ¿los servicios ya no arrancan tan a ciegas?
- ¿el stack se siente menos frágil?
- ¿sigue funcionando el negocio principal?
- ¿siguen funcionando mensajería, observabilidad y seguridad dentro del entorno integrado?

Ese es el tipo de validación que le da mucho valor a esta clase.

---

## Paso 1 · Levantar de nuevo el stack completo

Volvé a ejecutar el arranque del entorno Compose con la versión refinada del archivo.

La idea es observar el sistema ya no como una primera prueba exploratoria, sino como un entorno que debería haberse beneficiado de las mejoras introducidas en las clases anteriores.

---

## Paso 2 · Mirar el arranque con una mentalidad distinta

Esta vez no queremos mirar los logs solo buscando errores groseros.

Queremos observar algo más interesante:

- si el orden general se siente mejor,
- si hay menos fallos por timing,
- y si los servicios importantes parecen esperar mejor a sus dependencias.

Ese cambio de mirada es muy importante.

---

## Paso 3 · Verificar la infraestructura crítica

Conviene revisar primero:

- RabbitMQ
- Zipkin
- Keycloak
- `config-server`
- `discovery-server`

La idea es confirmar que las piezas base ya no solo arrancan, sino que lo hacen de una manera suficientemente estable como para sostener el resto del stack.

---

## Paso 4 · Verificar los microservicios principales

Ahora revisá:

- `catalog-service`
- `inventory-service`
- `order-service`
- `notification-service`
- `api-gateway`

Queremos confirmar que, una vez arriba, el sistema ya vuelve a presentar el ecosistema funcional que construimos a lo largo del curso.

---

## Paso 5 · Revisar Eureka

Abrí la consola de Eureka y comprobá que los servicios esperados vuelvan a aparecer.

Este paso sigue siendo muy valioso porque refleja bastante bien si el entorno integrado realmente quedó coherente después de los ajustes de arranque y referencias internas.

---

## Paso 6 · Probar una ruta pública por gateway

Ahora hacé una prueba simple y rápida:

```bash
curl http://localhost:8080/products
```

La idea es comprobar que el punto de entrada del sistema sigue funcionando bien dentro del stack Compose refinado.

Este tipo de validación temprana ayuda mucho a detectar si el entorno integrado sigue bien parado antes de pasar a flujos más ricos.

---

## Paso 7 · Probar el flujo protegido principal

Ahora conviene ir al corazón del negocio actual: la creación de órdenes autenticadas.

Por ejemplo:

```bash
curl -i -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 1 }
    ]
  }'
```

Este request vuelve a ser excelente porque activa muchas piezas del sistema al mismo tiempo:

- gateway
- seguridad
- órdenes
- inventario
- observabilidad
- y mensajería

Es una gran prueba para validar el stack refinado.

---

## Paso 8 · Verificar el circuito asincrónico

Ahora consultá:

```bash
curl http://localhost:8085/notifications
```

La idea es confirmar que, incluso dentro del entorno Compose refinado, el evento `order.created` sigue recorriendo el circuito completo hasta `notification-service`.

Esto es un excelente indicador de salud sistémica del stack.

---

## Paso 9 · Revisar Zipkin y RabbitMQ si querés una validación más rica

Este es un gran momento para mirar también:

- Zipkin
- RabbitMQ
- y, si querés, la UI de Keycloak

La idea es confirmar que el stack refinado no solo sostiene microservicios de negocio, sino también las piezas de infraestructura que les dan soporte real.

Esto le da muchísimo valor al checkpoint.

---

## Paso 10 · Comparar mentalmente con el arranque anterior

Ahora conviene hacer una comparación explícita con la experiencia del primer bloque Compose.

Preguntas útiles:

- ¿se siente menos frágil el arranque?
- ¿hay menos necesidad de reinicios manuales?
- ¿las dependencias críticas parecen mejor coordinadas?
- ¿el sistema integrado se entiende más como un stack y menos como piezas pegadas?

Este paso ayuda muchísimo a convertir las mejoras técnicas en aprendizaje real.

---

## Qué estamos logrando con esta clase

Esta clase no introduce una tecnología nueva, pero sí hace algo muy valioso:

**convierte el refinamiento del despliegue en una experiencia operativa comprobable.**

Después de esta clase, NovaMarket ya no solo tiene un compose mejor escrito.  
Tiene un compose que se siente más sólido en la práctica.

---

## Qué todavía no estamos haciendo

Todavía no:

- optimizamos imágenes para distintos targets,
- versionamos estrategias de despliegue más allá del entorno local,
- ni entramos en pipelines automatizados.

Todo eso puede venir después.

La meta de hoy es mucho más concreta:

**confirmar que el stack local integrado ya ganó estabilidad real.**

---

## Errores comunes en esta etapa

### 1. Probar solo que “arranca” y no validar negocio
Un stack útil necesita más que procesos vivos.

### 2. No revisar discovery ni mensajería
Son dos grandes piezas del sistema actual.

### 3. No comparar explícitamente con el estado previo
Así se pierde el valor del refinamiento.

### 4. Mirar solo un endpoint simple
Conviene probar al menos un flujo rico del sistema.

### 5. Creer que el stack ya está “terminado para producción”
Todavía estamos en un entorno operativo local, aunque ya bastante serio.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías haber confirmado que NovaMarket puede levantarse y validarse de forma más estable dentro de Docker Compose, sosteniendo tanto infraestructura como flujos relevantes del negocio.

Eso deja muy bien consolidado este tramo del bloque de despliegue.

---

## Punto de control

Antes de seguir, verificá que:

- el stack levanta con la versión refinada del compose,
- los servicios principales aparecen correctamente,
- el gateway responde,
- el flujo protegido principal funciona,
- y las notificaciones siguen recorriendo el circuito asincrónico.

Si eso está bien, entonces el entorno operativo integrado ya quedó bastante sólido.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a empezar a pensar cómo empaquetar mejor el proyecto para una operación más profesional, refinando imágenes y revisando el rol de los Dockerfile del sistema.

Eso nos va a permitir seguir elevando el nivel del despliegue operativo de NovaMarket.

---

## Cierre

En esta clase validamos un arranque operativo más estable de NovaMarket dentro de Docker Compose.

Con eso, el proyecto no solo puede levantarse como stack integrado: también empieza a mostrar una experiencia de operación local mucho más madura, más predecible y más útil para seguir evolucionando el sistema.
