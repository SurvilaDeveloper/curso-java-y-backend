---
title: "Levantando y validando NovaMarket completo con Docker Compose"
description: "Checkpoint principal del bloque de despliegue operativo. Levantamiento del stack completo con Docker Compose y validación del entorno integrado de NovaMarket."
order: 73
module: "Módulo 11 · Despliegue operativo con Docker Compose"
level: "intermedio"
draft: false
---

# Levantando y validando NovaMarket completo con Docker Compose

En las dos clases anteriores preparamos algo muy importante:

- modelamos la infraestructura externa dentro de `docker-compose.yml`,
- sumamos los microservicios propios de NovaMarket,
- y dejamos el stack listo para ser levantado como un entorno integrado.

Ahora toca el paso más importante del bloque:

**levantar el sistema completo y validarlo como unidad.**

Este es uno de esos momentos del curso donde el proyecto deja de sentirse como una serie de servicios probados por separado y empieza a sentirse como un ecosistema real.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- Docker Compose puede levantar el stack completo,
- los servicios principales arrancan dentro del entorno integrado,
- la infraestructura se sostiene como conjunto,
- y NovaMarket ya puede probarse operativamente de una manera mucho más unificada.

---

## Estado de partida

En este punto del curso deberíamos tener:

- un `docker-compose.yml` en la raíz del proyecto,
- infraestructura externa modelada,
- microservicios propios incluidos,
- y una estrategia general bastante clara de red, puertos y dependencias.

Todavía falta comprobar que todo eso funciona junto en la práctica.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- construir o levantar el stack con Compose,
- observar el arranque de las piezas principales,
- verificar puertos y servicios expuestos,
- probar endpoints clave,
- y validar el entorno integrado de NovaMarket.

---

## Por qué esta clase es tan importante

Porque una cosa es tener un compose bien escrito.  
Y otra muy distinta es que el stack:

- arranque,
- se mantenga estable,
- y deje probar flujos reales del sistema.

Este paso es el que convierte la modelación del despliegue en una realidad operativa.

---

## Paso 1 · Construir y levantar el stack

Ahora sí, ejecutá el comando correspondiente para levantar el entorno completo.

En una estrategia típica de Compose, el objetivo es construir las imágenes necesarias y dejar arriba todos los servicios del stack.

No hace falta obsesionarse todavía con flags o variantes avanzadas.  
Lo importante es poner el sistema completo en marcha.

---

## Paso 2 · Observar los logs de arranque

Este paso es muy importante.

Mientras el stack levanta, conviene mirar los logs y detectar:

- qué servicios arrancan correctamente,
- cuáles tardan más,
- si hay errores obvios de configuración,
- y si aparece alguna referencia incorrecta a hosts o puertos.

En sistemas con varias piezas, este primer arranque suele enseñar bastante incluso antes de hacer la primera prueba funcional.

---

## Paso 3 · Verificar que la infraestructura externa está viva

Antes de entrar a los microservicios, conviene comprobar rápidamente las piezas externas más importantes.

Por ejemplo:

- RabbitMQ
- Zipkin
- Keycloak

La idea es confirmar que el stack no levantó solo algunos servicios “de aplicación”, sino también los componentes que sostienen varias funciones del sistema.

---

## Paso 4 · Verificar `config-server` y `discovery-server`

Ahora conviene revisar dos piezas fundamentales del entorno:

- `config-server`
- `discovery-server`

Estas son importantes porque muchas otras piezas del stack dependen de ellas para arrancar correctamente.

Si querés, podés comprobar:

- que `config-server` responde
- y que la consola de Eureka está disponible

Ese par suele ser una gran señal temprana de salud del entorno.

---

## Paso 5 · Verificar que los microservicios principales levantaron

Ahora conviene revisar los microservicios que sostienen el flujo de negocio principal:

- `catalog-service`
- `inventory-service`
- `order-service`
- `notification-service`
- `api-gateway`

No hace falta hacer todavía todas las pruebas funcionales.  
Primero alcanza con verificar que el stack realmente dejó estas piezas arriba.

---

## Paso 6 · Revisar Eureka dentro del entorno integrado

Abrí la consola de Eureka y observá si aparecen registrados los servicios que esperás.

La idea es confirmar que dentro del stack integrado siguen funcionando piezas que antes veníamos validando por separado:

- registro en discovery
- nombres lógicos
- y visibilidad del ecosistema

Este paso es muy valioso porque conecta el bloque de despliegue con el bloque de service discovery.

---

## Paso 7 · Probar el gateway

Ahora conviene probar el punto de entrada principal del sistema.

Por ejemplo, alguna ruta pública del gateway:

```bash
curl http://localhost:8080/products
```

La idea es confirmar que, incluso dentro del stack integrado, el gateway sigue cumpliendo su rol de entrada unificada.

---

## Paso 8 · Probar el flujo protegido principal

Si querés una validación más fuerte del entorno, este es un gran momento para probar una orden autenticada.

Conceptualmente:

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

Este request vale muchísimo porque activa varias piezas al mismo tiempo:

- gateway
- seguridad
- órdenes
- inventario
- y posiblemente notificaciones vía RabbitMQ

Es una excelente prueba de integración real.

---

## Paso 9 · Verificar el flujo asincrónico también

Si el request anterior funcionó, conviene comprobar que el circuito asincrónico también sigue vivo dentro del stack integrado.

Por ejemplo:

```bash
curl http://localhost:8085/notifications
```

La idea es confirmar que la orden creada dentro del entorno Compose también disparó el evento esperado y que `notification-service` siguió funcionando correctamente.

Esto fortalece mucho la validación del stack.

---

## Paso 10 · Mirar Zipkin o RabbitMQ si querés enriquecer la validación

Si querés hacer una verificación más rica, este es un gran momento para revisar:

- Zipkin
- RabbitMQ
- y sus UIs respectivas

La idea es confirmar que el stack integrado no solo levanta servicios, sino también los soportes operativos y asincrónicos del sistema.

Esto ayuda a cerrar el bloque con una mirada mucho más completa.

---

## Paso 11 · Pensar qué ya cambió respecto del desarrollo pieza por pieza

Después de esta clase, conviene hacerse esta pregunta:

**¿qué ganamos con este entorno integrado?**

La respuesta razonable debería ser algo así:

- menos pasos manuales
- una arquitectura más visible como conjunto
- una forma más realista de operar localmente
- mejor base para seguir pensando despliegue y operación

Ese cambio es muy importante.

---

## Qué estamos logrando con esta clase

Esta clase convierte a NovaMarket en un sistema mucho más operable.

Hasta ahora, el proyecto podía construirse y probarse bien, pero todavía dependía bastante de levantar piezas sueltas.

Después de esta clase, el sistema ya puede existir como un stack coherente, con una forma mucho más unificada de arranque y validación.

Eso es un salto enorme.

---

## Qué todavía no estamos haciendo

Todavía no:

- optimizamos imágenes
- afinamos healthchecks avanzados
- resolvemos todos los detalles finos de readiness
- ni hablamos todavía de despliegue fuera del entorno local

Todo eso puede venir después.

La meta de hoy es mucho más concreta:

**demostrar que NovaMarket completo ya puede levantarse y probarse como stack integrado.**

---

## Errores comunes en esta etapa

### 1. Querer validar negocio sin mirar primero el arranque del stack
Los logs iniciales suelen decir muchísimo.

### 2. Pensar que si el compose levantó no hace falta probar endpoints
Levantar no equivale a validar integración real.

### 3. No revisar discovery ni el gateway
Son dos puntos centrales del sistema.

### 4. Seguir mentalmente con hosts tipo `localhost` dentro de la lógica interna del stack
Este bloque justamente empuja a pensar más en red interna y nombres de servicio.

### 5. Frustrarse si el primer arranque requiere ajuste fino
Eso es bastante normal en un sistema con varias piezas.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, NovaMarket debería poder levantarse como un stack integrado con Docker Compose y vos deberías haber podido validar al menos parte importante del entorno:

- infraestructura
- servicios principales
- gateway
- y uno o más flujos del negocio

Eso deja el bloque de despliegue muy bien encaminado.

---

## Punto de control

Antes de seguir, verificá que:

- el stack levanta,
- la infraestructura principal responde,
- Eureka muestra servicios,
- el gateway responde,
- y al menos un flujo funcional importante del sistema corre dentro del entorno Compose.

Si eso está bien, entonces el bloque actual de despliegue ya quedó bastante sólido.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a empezar a refinar este entorno operativo, revisando ajustes finos de configuración, dependencia y preparación para una experiencia más robusta de arranque.

Eso nos va a permitir endurecer todavía más el stack antes de entrar en nuevas extensiones del proyecto.

---

## Cierre

En esta clase levantamos y validamos NovaMarket completo con Docker Compose.

Con eso, el proyecto deja de ser solo un conjunto de servicios que sabíamos ejecutar por separado y pasa a convertirse en un sistema integrado con una forma mucho más realista de operación local.
