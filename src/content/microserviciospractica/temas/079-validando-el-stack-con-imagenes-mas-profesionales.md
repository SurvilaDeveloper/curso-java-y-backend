---
title: "Validando el stack con imágenes más profesionales"
description: "Checkpoint del refinamiento de imágenes y Dockerfile en NovaMarket. Validación del entorno integrado después de incorporar una estrategia más limpia de build y runtime."
order: 79
module: "Módulo 11 · Despliegue operativo con Docker Compose"
level: "intermedio"
draft: false
---

# Validando el stack con imágenes más profesionales

En las últimas clases mejoramos bastante la parte operativa de NovaMarket:

- refinamos la configuración para el entorno Docker Compose,
- fortalecimos el arranque con healthchecks y dependencias,
- revisamos y ordenamos los Dockerfile,
- e introdujimos multi-stage build en servicios importantes del proyecto.

Eso deja al stack mucho mejor parado que al inicio del bloque.

Ahora toca el paso lógico y necesario:

**volver a validar el entorno completo después de estas mejoras de empaquetado.**

Porque una cosa es tener Dockerfile más prolijos.  
Y otra distinta es comprobar que el sistema completo sigue funcionando bien, ahora con una estrategia de imágenes más profesional.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- las nuevas imágenes siguen levantando correctamente el stack,
- los servicios refinados siguen comportándose bien dentro de Compose,
- y NovaMarket conserva sus flujos importantes con una base de empaquetado más madura.

Esta clase funciona como checkpoint de cierre del tramo fuerte de refinamiento de imágenes.

---

## Estado de partida

Partimos de un entorno donde:

- el stack ya puede levantarse con Compose,
- las configuraciones ya fueron adaptadas al mundo Docker,
- el arranque ya es más robusto,
- y algunos servicios ya usan una estrategia de multi-stage build o Dockerfile mejor refinados.

La pregunta ahora es simple y muy importante:

**¿todo eso sigue funcionando bien en conjunto?**

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- reconstruir o volver a levantar el stack,
- observar el comportamiento del arranque con las imágenes refinadas,
- verificar servicios y endpoints importantes,
- y comprobar que el despliegue operativo ganó calidad sin romper el sistema.

---

## Qué queremos comprobar de verdad

No alcanza con que las imágenes “builden”.

Queremos validar algo más fuerte:

- que el stack sigue siendo operable,
- que las mejoras de Dockerfile no rompieron el comportamiento funcional,
- y que el proyecto está empezando a tener una base bastante seria de empaquetado y despliegue local.

Ese es el valor real de esta clase.

---

## Paso 1 · Reconstruir las imágenes relevantes

Ahora conviene volver a construir los servicios que ya migraste o refinaste.

Si aplicaste multi-stage build a servicios como:

- `order-service`
- `notification-service`

este es un gran momento para que el compose los reconstruya y los vuelva a levantar dentro del stack general.

La idea es verificar que el refinamiento del build no introduce regresiones.

---

## Paso 2 · Levantar el entorno integrado

Ahora sí, levantá nuevamente NovaMarket completo con Compose.

El objetivo es observar si:

- las imágenes refinadas arrancan bien,
- el orden general del stack sigue siendo sano,
- y el entorno integrado mantiene la estabilidad que veníamos construyendo.

---

## Paso 3 · Mirar el arranque con foco en los servicios refinados

Esta vez conviene prestar especial atención a los servicios cuyos Dockerfile o estrategia de build cambiaste.

Queremos ver cosas como:

- si arrancan correctamente,
- si el jar copiado a runtime es el esperado,
- y si el contenedor no quedó roto por un detalle de empaquetado.

Este punto es muy importante porque multi-stage build mejora mucho, pero también es un lugar donde un path mal resuelto puede romper todo enseguida.

---

## Paso 4 · Verificar infraestructura crítica

Como siempre, antes de entrar a los flujos del negocio conviene comprobar que el entorno base siga bien parado:

- RabbitMQ
- Zipkin
- Keycloak
- `config-server`
- `discovery-server`

La idea es confirmar que las mejoras del empaquetado de servicios propios no afectaron la operación del stack como conjunto.

---

## Paso 5 · Verificar los microservicios principales

Ahora revisá:

- `catalog-service`
- `inventory-service`
- `order-service`
- `notification-service`
- `api-gateway`

Queremos ver que el ecosistema funcional principal sigue existiendo y que los servicios refinados siguen integrándose normalmente al resto del stack.

---

## Paso 6 · Probar el gateway

Hacé una prueba básica:

```bash
curl http://localhost:8080/products
```

Esto sigue siendo un gran termómetro rápido del entorno integrado.

Nos ayuda a comprobar que:

- el gateway arranca
- y al menos parte del flujo distribuido del sistema sigue respondiendo normalmente.

---

## Paso 7 · Probar el flujo protegido principal

Ahora probá otra vez una orden autenticada:

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

Este request vuelve a ser una prueba excelente porque activa muchas piezas al mismo tiempo.

Si este flujo sigue funcionando después del refinamiento de imágenes, eso ya dice muchísimo.

---

## Paso 8 · Verificar el flujo asincrónico

Ahora consultá:

```bash
curl http://localhost:8085/notifications
```

La idea es comprobar que el evento `order.created` sigue viajando correctamente y que `notification-service` —aunque ahora use una imagen más refinada— sigue cumpliendo su rol dentro del circuito asincrónico.

Este paso es muy valioso porque valida de manera indirecta:

- empaquetado
- arranque
- integración
- y mensajería

todo al mismo tiempo.

---

## Paso 9 · Revisar discovery y tracing si querés una validación más rica

También es muy útil volver a revisar:

- Eureka
- Zipkin

La idea es confirmar que el stack refinado sigue sosteniendo no solo endpoints del negocio, sino también discovery y observabilidad distribuida.

Eso ayuda a cerrar el bloque con una visión mucho más completa.

---

## Paso 10 · Comparar con el estado anterior del bloque

Ahora conviene hacer una comparación explícita.

Antes del refinamiento fuerte de imágenes, el entorno ya podía levantar.  
Pero ahora debería sentirse:

- más prolijo
- más consistente
- más fácil de entender
- y mejor preparado para seguir creciendo

Ese es el tipo de mejora que vale la pena capturar mentalmente al cerrar esta clase.

---

## Qué estamos logrando con esta clase

Esta clase transforma mejoras “de build” en una validación operativa real.

Ya no estamos hablando solo de:

- Dockerfile más lindos
- o stages más ordenados

Estamos comprobando que el sistema real sigue funcionando y que el stack gana madurez sin perder comportamiento.

Eso es un gran cierre para este tramo.

---

## Qué todavía no estamos haciendo

Todavía no:

- versionamos imágenes de una forma más formal,
- publicamos artefactos a un registry,
- ni construimos pipelines de build automatizados.

Todo eso puede venir después.

La meta de hoy es mucho más concreta:

**demostrar que NovaMarket sigue funcionando bien con un empaquetado más profesional.**

---

## Errores comunes en esta etapa

### 1. Validar solo el build y no el comportamiento del sistema
Eso deja el checkpoint incompleto.

### 2. Probar solo un endpoint muy simple
Conviene activar también el flujo protegido y asincrónico.

### 3. No mirar los servicios refinados específicamente
Ahí es donde más puede aparecer una regresión de empaquetado.

### 4. Confundir mejora de imagen con mejora automática de toda la operación
Siempre hay que verificar impacto real.

### 5. No comparar explícitamente el estado actual con el anterior
Ese contraste ayuda a captar el valor de las mejoras.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías haber comprobado que el stack completo de NovaMarket sigue funcionando sobre una base de imágenes y Dockerfile más refinada, lo que deja al proyecto mucho mejor parado para un despliegue operativo serio.

Eso cierra muy bien este tramo del bloque.

---

## Punto de control

Antes de seguir, verificá que:

- el stack vuelve a levantar con las imágenes refinadas,
- los servicios importantes responden,
- el gateway sigue funcionando,
- la orden protegida sigue creándose,
- y las notificaciones siguen recorriendo el circuito asincrónico.

Si eso está bien, entonces el refinamiento de empaquetado ya quedó realmente validado.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a empezar a pensar cómo documentar y operar mejor el stack, consolidando el bloque de despliegue con una visión más completa de uso, arranque y mantenimiento del entorno integrado.

Eso nos va a permitir cerrar esta etapa con una capa más fuerte de operación práctica.

---

## Cierre

En esta clase validamos NovaMarket completo después de refinar imágenes y Dockerfile.

Con eso, el proyecto ya no solo puede levantarse como stack integrado: también puede hacerlo apoyado en una estrategia de empaquetado bastante más profesional, clara y sostenible.
