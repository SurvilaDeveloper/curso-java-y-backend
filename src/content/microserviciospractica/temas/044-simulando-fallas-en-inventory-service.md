---
title: "Simulando fallas en inventory-service"
description: "Inicio del bloque de resiliencia en NovaMarket. Simulación controlada de caídas y respuestas problemáticas en inventory-service para observar cómo impactan en order-service."
order: 44
module: "Módulo 8 · Resiliencia aplicada"
level: "intermedio"
draft: false
---

# Simulando fallas en `inventory-service`

Hasta este punto, NovaMarket ya logró algo importante:

- autenticación real,
- validación de JWT,
- rutas protegidas,
- gateway,
- discovery,
- Feign,
- y un flujo principal de órdenes funcionando de punta a punta.

Pero todavía hay una gran pregunta sin responder:

**¿qué pasa cuando una dependencia crítica falla?**

En nuestro caso, `order-service` depende directamente de `inventory-service` para validar stock antes de crear una orden.

Mientras todo funciona bien, el sistema responde como esperamos.  
El problema real aparece cuando inventario:

- no responde,
- responde mal,
- tarda demasiado,
- o directamente está caído.

Ese es el objetivo de esta clase: empezar a **romper** el sistema de manera controlada para entender mejor cómo se comporta hoy y por qué necesitamos resiliencia.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- `order-service` depende críticamente de `inventory-service`,
- una caída o degradación del servicio remoto afecta el flujo de órdenes,
- y el comportamiento actual todavía no es suficientemente robusto.

No vamos a arreglar el problema todavía.  
Primero queremos observarlo con claridad.

---

## Estado de partida

En este punto del curso deberíamos tener:

- `config-server`
- `discovery-server`
- `catalog-service`
- `inventory-service`
- `order-service`
- `api-gateway`
- Keycloak

Además:

- `order-service` ya usa Feign,
- resuelve `inventory-service` por nombre lógico,
- y el flujo autenticado de órdenes funciona correctamente.

Eso significa que ya existe una dependencia distribuida real sobre la que tiene sentido trabajar resiliencia.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- provocar fallas o indisponibilidad en `inventory-service`,
- observar cómo se rompe el flujo de órdenes,
- registrar qué respuestas devuelve el sistema hoy,
- y entender mejor por qué necesitamos timeout, manejo de errores y resiliencia más adelante.

---

## Por qué conviene simular fallas antes de agregar herramientas

Es muy tentador agregar directamente Resilience4j, retries o circuit breaker.

Pero pedagógicamente conviene hacer primero una cosa más simple:

**ver el problema desnudo.**

Si no observamos el fallo real, después es fácil meter una dependencia o una configuración sin entender del todo qué riesgo estamos intentando cubrir.

En microservicios, la resiliencia tiene mucho más sentido cuando nace de un dolor concreto del sistema.

---

## Qué tipo de fallas nos interesan en esta etapa

Para este primer acercamiento, nos interesan fallas bien visibles, por ejemplo:

- `inventory-service` apagado,
- `inventory-service` levantado pero no accesible,
- error remoto,
- lentitud excesiva,
- o respuesta inesperada.

No hace falta sofisticar mucho el escenario todavía.  
Con una caída simple ya podemos aprender bastante.

---

## Paso 1 · Confirmar el comportamiento normal antes de romper nada

Antes de simular una falla, conviene ejecutar una orden válida y verificar que el flujo está sano.

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

La respuesta debería ser una orden creada correctamente.

Este paso es importante porque deja claro que el sistema está bien antes de que lo rompamos intencionalmente.

---

## Paso 2 · Apagar `inventory-service`

Ahora vamos a provocar la falla más simple y más útil para empezar:

**apagar `inventory-service`.**

Podés detenerlo desde el IDE, cerrar el proceso o bajar el servicio según la forma en que lo estés corriendo.

No hace falta tocar todavía el resto de la arquitectura.

La idea es dejar a `order-service` operativo, pero sin la dependencia crítica que necesita para validar stock.

---

## Paso 3 · Revisar Eureka

Después de apagar `inventory-service`, conviene mirar:

```txt
http://localhost:8761
```

Queremos observar cómo se comporta Eureka cuando una dependencia desaparece.

Puede tardar un poco en reflejar el cambio, pero este paso es útil porque deja ver que el sistema de discovery no es una foto estática, sino un registro vivo del estado de las instancias.

---

## Paso 4 · Probar una orden con inventario caído

Ahora repetí el request de creación de orden:

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

La expectativa de esta clase es justamente que el flujo falle.

Lo importante no es solo “que falle”, sino **cómo** falla.

Preguntas útiles:

- ¿el error es claro o caótico?
- ¿se demora demasiado?
- ¿el gateway responde algo útil?
- ¿`order-service` logra manejar algo o simplemente explota?

---

## Paso 5 · Observar la respuesta del sistema

En este punto, el sistema todavía no tiene resiliencia aplicada formalmente.

Por eso es normal encontrar cosas como:

- error técnico poco amigable,
- response poco clara,
- tiempo de espera incómodo,
- o una falla propagada desde la dependencia remota.

Este comportamiento “feo” o crudo tiene muchísimo valor didáctico, porque es exactamente el problema que vamos a empezar a corregir en las próximas clases.

---

## Paso 6 · Revisar logs de `order-service`

Ahora mirá la consola de `order-service`.

Queremos detectar cosas como:

- excepciones del cliente Feign,
- error de resolución del servicio,
- fallo al intentar consultar inventario,
- o timeouts implícitos.

Este paso es central, porque el corazón del problema de resiliencia aparece justamente acá:  
un servicio de negocio no puede depender de una llamada remota sin tener una estrategia clara para cuando esa llamada sale mal.

---

## Paso 7 · Revisar también el gateway

Mirá la consola de `api-gateway`.

Queremos observar si:

- el request llegó correctamente,
- el gateway dejó pasar la request autenticada,
- y el error ocurre realmente más adentro, cuando `order-service` intenta usar su dependencia.

Esto ayuda mucho a diferenciar entre:

- error de entrada,
- error de seguridad,
- y error de dependencia interna.

---

## Paso 8 · Levantar otra vez `inventory-service` y repetir la prueba

Ahora volvé a levantar `inventory-service`.

Esperá a que:

- registre correctamente en Eureka,
- quede operativo,
- y responda otra vez sus endpoints.

Después repetí el request de orden válida.

La idea es comprobar que, una vez recuperada la dependencia, el sistema vuelve a comportarse normalmente.

Este contraste entre:

- sistema sano,
- sistema con dependencia caída,
- y sistema recuperado

es muy valioso para entender el impacto real de una dependencia remota en el flujo del negocio.

---

## Paso 9 · Simular una falla lógica o respuesta problemática

Si querés profundizar un poco más en esta clase, una opción útil es modificar temporalmente `inventory-service` para que:

- devuelva un error,
- o lance una excepción en un caso puntual.

Por ejemplo, podrías introducir una condición temporal en el endpoint de inventario para un `productId` específico y devolver una respuesta fallida.

No es obligatorio para esta clase, pero sirve para ver que no solo la caída total puede romper el flujo; también lo hace una mala respuesta del servicio remoto.

---

## Qué estamos logrando con esta clase

Esta clase hace algo muy importante:

**convierte resiliencia en un problema visible.**

Ya no estamos hablando en abstracto de “qué pasa si un microservicio falla”.  
Ahora lo estamos viendo directamente en NovaMarket.

Eso cambia mucho la calidad del aprendizaje, porque a partir de este punto cada mejora de resiliencia va a tener una motivación concreta.

---

## Qué todavía no hicimos

Todavía no:

- configuramos timeouts explícitos,
- manejamos mejor el error técnico,
- agregamos Resilience4j,
- ni introdujimos retry o circuit breaker.

Todo eso viene a continuación.

La meta de hoy es más concreta:

**ver cómo se rompe hoy el sistema cuando inventario falla.**

---

## Errores comunes en esta etapa

### 1. No probar primero el flujo sano
Entonces cuesta comparar el impacto real de la falla.

### 2. Apagar demasiadas piezas a la vez
Conviene aislar la falla y concentrarse en `inventory-service`.

### 3. No mirar logs
Gran parte del aprendizaje de esta clase aparece ahí.

### 4. Confundir una falla de seguridad con una falla de dependencia
Por eso conviene usar un token válido en las pruebas protegidas.

### 5. Intentar “arreglar” la falla antes de observarla
El valor de esta clase está justamente en ver el problema primero.

---

## Resultado esperado al terminar la clase

Al terminar esta clase deberías haber comprobado que:

- el flujo principal depende de `inventory-service`,
- cuando esa dependencia falla el sistema actual sufre,
- y la experiencia del error todavía necesita mejorar bastante.

Eso deja muy bien planteado el siguiente tramo del módulo.

---

## Punto de control

Antes de seguir, verificá que:

- probaste una orden válida con el sistema sano,
- apagaste o degradaste `inventory-service`,
- volviste a probar el flujo,
- observaste cómo falló,
- y revisaste logs de `order-service`.

Si eso está bien, ya podemos empezar a mejorar la respuesta del sistema ante este tipo de problemas.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a agregar timeout y un mejor manejo básico de errores.

Ese será el primer paso real para que el sistema falle de una manera más controlada y menos caótica.

---

## Cierre

En esta clase empezamos el bloque de resiliencia haciendo algo fundamental: provocar una falla real y observar cómo impacta en el negocio.

Con eso, NovaMarket deja de parecer una arquitectura que “anda” solo cuando todo sale bien y empieza a mostrar uno de los desafíos más reales de los sistemas distribuidos: qué pasa cuando una dependencia crítica deja de responder.
