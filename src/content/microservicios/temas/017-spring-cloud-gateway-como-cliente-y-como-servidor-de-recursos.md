---
title: "Spring Cloud Gateway como cliente y como servidor de recursos"
description: "Comparación entre Spring Cloud Gateway actuando como cliente OAuth2 y como Resource Server, y su impacto en la arquitectura de seguridad de NovaMarket."
order: 17
module: "Módulo 5 · Seguridad en microservicios"
level: "intermedio"
draft: false
---

# Spring Cloud Gateway como cliente y como servidor de recursos

En la clase anterior construimos la base conceptual de la seguridad distribuida en **NovaMarket**. Vimos que, cuando el sistema se divide en microservicios, ya no alcanza con pensar la seguridad como algo local a una sola aplicación.

Ahora vamos a enfocarnos en una decisión importante de arquitectura:

**¿qué papel cumple el API Gateway dentro del esquema de seguridad?**

En particular, vamos a comparar dos ideas que suelen aparecer en Spring Cloud Gateway:

- gateway como **cliente OAuth2**,
- gateway como **resource server**.

A simple vista pueden sonar parecidas porque ambas participan de un esquema con OAuth2, tokens e identidad. Pero en realidad resuelven problemas distintos.

---

## Recordatorio: el gateway en NovaMarket

En nuestro proyecto, el gateway es el punto de entrada único del sistema.

Todo tráfico externo idealmente pasa por él antes de llegar a:

- `catalog-service`,
- `order-service`,
- `inventory-service`,
- y otros componentes.

Eso convierte al gateway en un lugar muy natural para aplicar políticas transversales, y entre ellas aparece la seguridad.

Pero “aplicar seguridad” puede significar cosas diferentes.

---

## Qué significa ser cliente OAuth2

Cuando un componente actúa como **cliente OAuth2**, participa en un flujo donde obtiene o usa tokens para acceder a recursos protegidos o para representar a un usuario autenticado.

La idea general es esta:

- existe un proveedor de identidad,
- el usuario se autentica,
- se emite un token,
- el cliente usa ese token en su interacción con el sistema.

En ciertos escenarios, el gateway puede participar como cliente dentro de este flujo.

---

## Qué significa ser resource server

Cuando un componente actúa como **resource server**, protege recursos y valida tokens de acceso para decidir si la request puede continuar.

Es decir:

- recibe una request con token,
- valida que el token sea confiable,
- extrae identidad y permisos,
- aplica reglas de autorización,
- permite o bloquea el acceso.

En este caso, el foco no está en obtener el token, sino en **aceptar o rechazar** requests que intentan usar recursos protegidos.

---

## La diferencia esencial

La diferencia más importante puede resumirse así:

### Cliente OAuth2
Se preocupa por participar en un flujo de autenticación/autorización donde un cliente obtiene o maneja tokens.

### Resource Server
Se preocupa por proteger endpoints y validar tokens entrantes.

Dicho de otra forma:

- el cliente mira más hacia el proceso de acceso,
- el resource server mira más hacia la protección del recurso.

---

## Por qué esta diferencia importa en NovaMarket

Tomemos una operación concreta:

```text
POST /api/orders
```

Queremos que solo un usuario autenticado pueda crear una orden.

Para eso, alguien tiene que:

- recibir el token,
- validarlo,
- identificar al usuario,
- verificar si la request está autorizada.

Ese comportamiento encaja naturalmente con el rol de **resource server**.

Si el gateway cumple ese papel, puede actuar como una primera barrera de seguridad antes de enviar la request a `order-service`.

---

## Gateway como resource server en la práctica conceptual

Bajo este enfoque, el flujo sería más o menos así:

1. el usuario se autentica con el proveedor de identidad,
2. obtiene un access token,
3. llama al gateway con ese token,
4. el gateway valida el token,
5. si el token es válido y el acceso está permitido, reenvía la request,
6. si no, corta la operación en la entrada.

Este enfoque tiene una ventaja muy fuerte:

**la request inválida muere temprano**.

Eso reduce exposición innecesaria de los microservicios internos.

---

## Qué aporta el gateway como resource server

### 1. Barrera de entrada común
Permite concentrar una primera validación en un punto único.

### 2. Menor ruido aguas abajo
Los servicios internos no reciben requests externas ya rechazables desde el borde.

### 3. Arquitectura más clara
Hay una primera capa visible donde se decide si la request tiene derecho a entrar.

### 4. Mejor encaje con políticas transversales
Roles, scopes, autenticación básica de entrada y otras reglas pueden tratarse de forma más consistente.

---

## Pero eso no significa que los microservicios queden liberados

Este es un punto muy importante.

Aunque el gateway actúe como resource server, eso no implica que los microservicios deban confiar ciegamente en cualquier request que les llegue.

¿Por qué?

Porque la arquitectura distribuida necesita **defensa en profundidad**.

Algunas razones:

- un servicio podría exponerse por error,
- una llamada interna podría no venir del flujo esperado,
- una configuración errónea podría saltarse el gateway,
- los microservicios también necesitan conocer identidad para autorizar acciones concretas.

Por eso, en muchos diseños serios, el gateway protege el borde, pero los servicios downstream también validan tokens o al menos aplican sus propias reglas con una identidad confiable.

---

## Dónde encaja el gateway como cliente OAuth2

El rol de cliente OAuth2 es útil cuando el gateway participa activamente de un flujo donde necesita manejar credenciales o tokens dentro de un esquema OAuth2.

Conceptualmente, esto puede ser relevante cuando:

- el gateway participa en la autenticación del usuario,
- necesita trabajar con el contexto OAuth2 como cliente,
- maneja el acceso hacia otros recursos protegidos.

Pero, para el problema específico de **proteger los endpoints de entrada de NovaMarket**, el rol más natural y pedagógicamente importante es el de **resource server**.

---

## Qué enfoque conviene priorizar en el curso

Para este curso, conviene pensar el gateway principalmente como:

**una puerta de entrada que protege recursos y valida tokens**.

O sea, como **resource server**.

¿Por qué?

Porque eso nos permite enseñar con mucha claridad:

- autenticación basada en token,
- autorización inicial en el borde,
- rechazo temprano de requests inválidas,
- integración limpia con Keycloak,
- propagación posterior del token a los microservicios.

Este enfoque se alinea muy bien con el flujo central de NovaMarket y con el resto del roadmap.

---

## Relación con Keycloak

En nuestro diseño base, **Keycloak** será el proveedor de identidad.

Eso significa que:

- los usuarios se autentican allí,
- se emiten tokens,
- el gateway puede validar esos tokens,
- y los microservicios pueden apoyarse en la misma fuente de identidad.

Así evitamos construir desde cero una solución casera de autenticación y podemos concentrarnos en la arquitectura distribuida.

---

## Un flujo típico en NovaMarket

Veamos un ejemplo más completo.

### Caso: crear una orden

1. el usuario inicia sesión contra Keycloak,
2. obtiene un JWT,
3. llama a `POST /api/orders` pasando el token,
4. el gateway valida el token como resource server,
5. si el acceso es válido, reenvía la request a `order-service`,
6. `order-service` procesa la orden,
7. si necesita identidad del usuario, esa identidad debe llegar de forma segura,
8. luego se continúa con el resto del flujo.

Este modelo nos deja una seguridad más coherente y realista.

---

## El problema de la propagación del token

Una vez que el gateway valida el token, aparece otra cuestión crítica:

**¿qué pasa con ese token después?**

Opciones conceptuales:

- el gateway lo corta y solo reenvía datos ya procesados,
- el gateway reenvía el token al microservicio,
- el microservicio también valida el token,
- o se usa alguna estrategia intermedia.

En este curso vamos a avanzar hacia una arquitectura donde la identidad no se pierde al cruzar capas, porque `order-service` y otros componentes también necesitan tomar decisiones propias.

Eso nos lleva a la siguiente clase sobre integración con Keycloak y luego a la propagación del token hacia microservicios.

---

## Riesgos de delegar toda la seguridad en el gateway

Otro error frecuente sería decir:

“si el gateway ya validó todo, entonces los demás servicios no necesitan saber nada de seguridad”.

Ese enfoque puede generar varios problemas:

- exceso de confianza en una sola capa,
- microservicios incapaces de aplicar autorización propia,
- falta de trazabilidad de identidad dentro del sistema,
- menor robustez frente a errores de configuración.

Por eso conviene pensar al gateway como **primera barrera**, no como única barrera.

---

## Qué decisiones de autorización podrían vivir en el gateway

Algunas reglas tienen mucho sentido en el borde.

Por ejemplo:

- exigir token para ciertos endpoints,
- negar acceso a rutas administrativas sin rol adecuado,
- impedir tráfico anónimo a operaciones críticas.

Esto reduce ruido y simplifica parte del control de entrada.

---

## Qué decisiones deberían seguir viviendo en los microservicios

Los servicios siguen necesitando su propia mirada de seguridad cuando la autorización depende del dominio.

Por ejemplo:

- que un usuario solo pueda ver sus propias órdenes,
- que solo un rol administrativo modifique stock,
- que ciertos claims afecten decisiones internas del negocio.

Eso pertenece al servicio que conoce la lógica funcional.

---

## Regla práctica para NovaMarket

Una forma sana de repartir responsabilidades sería:

### Gateway
- validar identidad inicial,
- proteger rutas externas,
- cortar tráfico inválido,
- propagar contexto de seguridad.

### Microservicios
- validar o consumir identidad confiable,
- aplicar autorización de dominio,
- proteger recursos internos relevantes.

Este reparto evita tanto la duplicación caótica como la confianza ingenua.

---

## Cómo encaja esto en el roadmap

Esta clase no es un detalle secundario. Marca una decisión arquitectónica de fondo.

A partir de acá, el módulo de seguridad va a seguir este camino lógico:

1. fundamentos,
2. rol del gateway,
3. integración con Keycloak,
4. propagación del token,
5. microservicios como resource servers.

Ese orden permite que cada pieza aparezca cuando ya entendemos para qué sirve.

---

## Cierre

Aunque Spring Cloud Gateway puede relacionarse con OAuth2 de distintas maneras, para el caso de uso principal de NovaMarket la idea más importante es entenderlo como **resource server en el borde del sistema**.

Eso significa que el gateway puede:

- recibir tokens,
- validarlos,
- autenticar requests,
- autorizar acceso inicial,
- y cortar temprano el tráfico inválido.

Sin embargo, eso no elimina la necesidad de que los microservicios también participen del modelo de seguridad con una defensa más profunda y con autorización acorde a su dominio.

En la próxima clase vamos a integrar el proveedor de identidad del curso, **Keycloak**, para convertir estas decisiones conceptuales en una arquitectura concreta y coherente para NovaMarket.
