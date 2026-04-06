---
title: "Rate limiting y abuso desde backend"
description: "Cómo pensar rate limiting y defensa contra abuso en una aplicación Java con Spring Boot. Qué problemas ayuda a reducir, qué no resuelve por sí solo y cómo diseñarlo sin romper la experiencia legítima ni confiar ciegamente en la infraestructura externa."
order: 49
module: "Defensa contra abuso"
level: "base"
draft: false
---

# Rate limiting y abuso desde backend

## Objetivo del tema

Entender cómo pensar **rate limiting** y defensa contra abuso en una aplicación Java + Spring Boot, sin tratarlo como una capa mágica que “frena bots” por sí sola ni como algo que solo le compete al gateway, al CDN o al frontend.

Este tema importa mucho porque muchos backends hacen un trabajo razonable de:

- autenticación
- autorización
- validación
- modelado de recursos

pero siguen quedando muy expuestos a abuso por volumen, repetición o automatización.

Y ese abuso puede impactar cosas como:

- login
- recuperación de contraseña
- búsquedas
- exportaciones
- creación masiva
- scraping
- brute force
- credential stuffing
- spam
- consumo excesivo de recursos
- enumeración
- denegación de servicio de baja intensidad

En resumen:

> no alcanza con decidir quién puede hacer algo.  
> También conviene decidir cuánto, con qué frecuencia y bajo qué ritmo puede intentarlo.

---

## Idea clave

Rate limiting no trata de decidir si una acción está permitida en abstracto.

Trata de decidir si, aunque esté permitida, el sistema debería aceptar **tantas** solicitudes, **tan rápido** o **de esa forma repetitiva**.

En resumen:

> autorización responde “puede”.  
> rate limiting ayuda a responder “puede hacerlo a este ritmo y en este volumen”.

Eso lo vuelve una capa muy útil contra abuso, incluso cuando el actor está autenticado o la operación es legítima en pequeñas dosis.

---

## Qué problema intenta resolver

Rate limiting intenta reducir cosas como:

- intentos masivos de login
- credential stuffing
- spam de endpoints públicos
- scraping agresivo
- abuso de búsquedas o filtros
- exportaciones repetidas
- enumeración por volumen
- creación automática de recursos
- loops client-side que castigan al backend
- uso desbalanceado de endpoints costosos

No siempre busca bloquear por completo.
Muchas veces busca:

- frenar
- encarecer
- distribuir mejor
- limitar daño
- comprar tiempo
- reducir rentabilidad del abuso

---

## Error mental clásico

Muchos sistemas piensan algo como:

- “si está autenticado, no hace falta rate limiting”
- “si el endpoint tiene permisos, ya está”
- “eso lo resolverá Cloudflare / Nginx / el gateway”
- “si el frontend no lo muestra tantas veces, no van a abusar”
- “si el uso es legítimo, no hace falta limitar nada”
- “si ponemos un límite global, ya resolvimos todo”

Todo eso es insuficiente.

Porque el abuso puede venir de:

- usuarios autenticados
- credenciales robadas
- scripts internos mal escritos
- integraciones defectuosas
- clientes legítimos que hacen demasiadas requests
- actores que sí tienen permiso, pero están usando el sistema de forma dañina

---

## Rate limiting no es lo mismo que autorización

Esto conviene dejarlo clarísimo.

## Autorización
responde:
- ¿este actor puede hacer esta acción?

## Rate limiting
responde:
- ¿puede hacerla tantas veces en esta ventana?
- ¿puede hacerlo a esta velocidad?
- ¿puede seguir insistiendo ahora mismo?

### Ejemplo

Un usuario puede estar perfectamente autorizado a:

- iniciar sesión
- buscar productos
- descargar un reporte
- crear comentarios

y aun así el sistema puede decidir:

- no permitir 200 intentos por minuto
- no permitir 50 exportaciones seguidas
- no permitir 100 comentarios en 10 segundos
- no permitir 500 búsquedas complejas por minuto

Eso no contradice la autorización.
La complementa.

---

## Qué formas de abuso suele ayudar a reducir

## 1. Brute force y login abuse
Especialmente útil en:
- login
- forgot password
- reset flows
- activación
- MFA verification

## 2. Scraping
Cuando el sistema devuelve datos consultables de forma repetitiva.

## 3. Enumeración
Muchos requests repetidos para descubrir:
- cuentas
- recursos
- documentos
- tenants
- identificadores válidos

## 4. Spam
Por ejemplo:
- formularios
- comentarios
- tickets
- mensajes
- invitaciones
- requests de contacto

## 5. Uso excesivo de recursos caros
Por ejemplo:
- búsquedas complejas
- reportes
- exportaciones
- endpoints con joins pesados
- operaciones sobre archivos
- generación de PDFs o documentos

---

## No todo endpoint necesita el mismo límite

Otro error muy frecuente es pensar que un mismo rate limit sirve para todo.

No es lo mismo:

- `/auth/login`
- `/products/search`
- `/orders/export`
- `/comments`
- `/health`

Cada endpoint o grupo de endpoints puede tener:

- sensibilidad distinta
- costo distinto
- valor distinto para un atacante
- patrón de uso legítimo distinto

### Regla sana

No conviene modelar el rate limiting como una cifra universal arbitraria para toda la app.

---

## Qué dimensiones conviene mirar

Una defensa más madura suele mirar distintas dimensiones.

## Por IP o fuente
Útil cuando el actor todavía no está autenticado o el abuso viene de una misma fuente visible.

## Por cuenta o identidad
Muy útil cuando el actor sí está autenticado o el abuso está focalizado en un usuario.

## Por endpoint o acción
Porque no todos los endpoints merecen la misma política.

## Por tenant u organización
Muy útil en SaaS B2B o multi-tenant.

## Por clave compuesta
Ejemplos:
- cuenta + IP
- actor + endpoint
- tenant + acción
- usuario + recurso caro

Mientras más importante sea el endpoint, más útil suele ser pensar una clave de limitación adecuada.

---

## Ejemplo conceptual: login

En login puede tener sentido pensar límites por:

- IP
- email o identificador objetivo
- combinación IP + email
- ventana temporal

### Porque diferentes ataques se comportan distinto

- brute force sobre una cuenta
- password spraying sobre muchas cuentas
- credential stuffing distribuido

No necesariamente un solo contador resuelve todos esos patrones, pero ya muestra que limitar por dimensión correcta importa muchísimo.

---

## Ejemplo conceptual: búsqueda

Supongamos un endpoint:

```java
@GetMapping("/products/search")
public Page<ProductResponse> search(@RequestParam String q, Pageable pageable) {
    return productService.search(q, pageable);
}
```

Aunque la búsqueda sea pública o semipública, puede ser una mala idea aceptar:

- cientos de búsquedas por minuto desde una misma fuente
- automatización continua
- paginación extrema sin límite
- combinaciones agresivas con sort y filtros

Acá rate limiting ayuda a reducir:

- scraping
- abuso de infraestructura
- enumeración
- costo operativo innecesario

---

## Ejemplo conceptual: exportación

Supongamos:

```java
@PostMapping("/reports/export")
public ExportResponse export(@Valid @RequestBody ExportRequest request, Authentication authentication) {
    return reportService.export(request, authentication.getName());
}
```

Este tipo de operación suele ser mucho más sensible que una lectura normal porque:

- consume más recursos
- mueve más datos
- tiene más valor de abuso
- puede repetirse para extraer volumen

Entonces un límite razonable puede ser mucho más estricto que en un endpoint interactivo común.

---

## Rate limiting no reemplaza seguridad de negocio

Esto también es importante.

No conviene pensar:

- “si limitamos, ya no hace falta autorizar”
- “si frenamos por volumen, ya no hace falta validar ownership”
- “si hay rate limit, IDOR deja de importar”
- “si el scraping baja, ya no hace falta revisar qué datos expone el endpoint”

No.

Rate limiting:

- frena
- encarece
- reduce volumen
- mejora resiliencia

Pero no reemplaza:
- autorización
- ownership
- tenant/scope
- validación de estado
- diseño correcto de DTOs
- protección de datos sensibles

---

## Qué pasa si limitás demasiado poco

Si el límite es demasiado laxo, puede pasar que:

- el abuso siga siendo rentable
- el endpoint caro siga siendo explotable
- la enumeración siga funcionando
- el scraping siga siendo eficiente
- el login siga siendo muy atacable
- los reportes sigan pudiendo extraerse masivamente

Es decir:
- “tenemos rate limiting”
- pero en la práctica casi no cambia nada

---

## Qué pasa si limitás demasiado fuerte

Tampoco conviene irse al otro extremo.

Si el límite es demasiado agresivo, aparecen problemas como:

- mala UX legítima
- falsos positivos
- usuarios bloqueados por uso normal
- integraciones legítimas rotas
- soporte saturado
- clientes móviles o corporativos compartiendo IP castigados injustamente

Rate limiting sano no es simplemente “poner un número bajo”.
Es calibrar según:

- endpoint
- actor
- costo
- riesgo
- uso real

---

## Qué señales debería dar el backend

Cuando un límite se alcanza, el backend debería responder de forma consistente y entendible.

No hace falta regalar demasiado detalle ofensivo, pero sí conviene que el sistema:

- rechace de forma clara
- no se comporte erráticamente
- deje trazabilidad
- use status adecuados cuando corresponda
- mantenga consistencia de contrato

Muchas veces esto va acompañado por respuestas tipo:

- rechazo temporal
- retry más tarde
- ventana agotada
- límite excedido

Lo importante es que el comportamiento esté pensado, no improvisado.

---

## Qué endpoints merecen especial atención

Hay ciertas zonas donde conviene mirar rate limiting con más cariño.

### Login y auth
- login
- forgot password
- reset password
- MFA
- activación
- resend activation

### Consultas costosas
- búsquedas
- filtros complejos
- dashboards
- analytics
- listados amplios

### Extracción de datos
- exportaciones
- descargas
- reportes

### Acciones de volumen
- crear comentarios
- enviar mensajes
- abrir tickets
- formularios
- invitaciones
- creación masiva

### Endpoints con valor para scraping o enumeración
- usuarios
- productos
- documentos
- archivos
- recursos públicos/semi públicos

---

## Qué rol juega el actor autenticado

Otra idea importante:

estar autenticado no significa automáticamente quedar libre de límites.

A veces conviene limitar también por:

- usuario
- rol
- tenant
- plan
- tipo de operación

### Ejemplo

Un usuario autenticado puede:
- buscar
- exportar
- consultar reportes

pero no necesariamente:
- hacerlo sin restricción
- lanzar 500 exports seguidos
- disparar 100 búsquedas pesadas por minuto

Rate limiting por usuario autenticado también es una defensa útil contra:
- abuso deliberado
- cuentas comprometidas
- scripts mal hechos
- automatización dentro del sistema

---

## Qué rol juega el tenant o plan

En sistemas B2B o SaaS puede tener muchísimo sentido pensar límites por:

- tenant
- workspace
- organización
- plan contratado
- cuota operativa

Esto no es solo seguridad.
También toca:
- fairness
- protección de recursos
- aislamiento entre clientes
- prevención de abuso por volumen

Por ejemplo:
- un tenant free no tiene por qué poder exportar igual que un enterprise
- un tenant no debería degradar la infraestructura de todos los demás

---

## Qué se puede limitar

No solo requests crudas.

También puede ser útil limitar:

- intentos fallidos
- operaciones exitosas
- operaciones por ventana
- concurrencia
- volumen de exportación
- cantidad de items generados
- cantidad de mensajes o invitaciones
- frecuencia sobre una misma acción sensible

Es decir, a veces el límite más útil no es solo “X requests”.
A veces es:
- X acciones de cierto tipo
- X resultados
- X operaciones costosas

---

## Qué papel juega la infraestructura externa

CDN, WAF, proxy o gateway pueden ayudar muchísimo.
Pero suele ser un error apoyarse ciegamente solo ahí.

### ¿Por qué?

Porque muchas veces el backend entiende cosas que la capa externa no entiende bien, como:

- usuario autenticado
- tenant
- plan
- tipo real de operación
- costo semántico del endpoint
- acción crítica específica

Entonces una estrategia madura suele combinar:

- capa perimetral
- y reglas con más contexto dentro de backend o cerca del dominio de la API

No todo se resuelve en un solo lugar.

---

## Dónde suele vivir esta lógica

Dependiendo del caso, el rate limiting puede vivir en:

- gateway
- proxy
- CDN
- filtros
- interceptors
- middleware
- services especializados
- cache/store temporal
- políticas por operación

Lo importante no es que todo viva en una sola clase.
Lo importante es que el sistema tenga una política coherente y explicable.

---

## Qué conviene registrar

Conviene dejar trazabilidad sobre cosas como:

- límite alcanzado
- actor o fuente
- endpoint o acción afectada
- tenant si aplica
- volumen o frecuencia
- timestamps
- repetición o patrones

Esto ayuda a:

- tuning
- investigación
- detección de abuso
- soporte
- observabilidad
- mejora continua de políticas

Sin esto, es muy fácil que el limitador exista pero nadie sepa si está frenando abuso real o castigando uso legítimo.

---

## Ejemplo conceptual sencillo

No hace falta fijar una implementación única acá, pero conceptualmente podría pensarse algo así:

```java
public void checkSearchRateLimit(String actorKey) {
    if (!rateLimitService.tryConsume("product-search:" + actorKey, 1)) {
        throw new TooManyRequestsException("Demasiadas búsquedas en esta ventana");
    }
}
```

Y luego en el service o en una capa previa:

```java
public Page<ProductResponse> search(String query, Pageable pageable, String actorKey) {
    checkSearchRateLimit(actorKey);
    return productRepository.search(query, pageable).map(productMapper::toResponse);
}
```

### Qué importa rescatar

- el límite se aplica sobre una clave significativa
- el rechazo ocurre antes de seguir cargando costo
- la política es explícita

---

## Qué errores suelen aparecer

Estas cosas suelen hacer mucho ruido:

- no tener rate limiting donde claramente hace falta
- un solo límite global para todo
- límites iguales para endpoints baratos y caros
- no diferenciar autenticado de anónimo
- no registrar nada
- depender solo del frontend
- pensar que JWT o sesión reemplazan control de volumen
- castigar IP compartidas sin pensar UX
- no revisar exports, búsquedas o auth flows
- nadie sabe explicar qué endpoint está limitado y cuál no

---

## Qué gana el backend si lo piensa bien

Cuando el backend piensa mejor el rate limiting, gana:

- menos abuso rentable
- más resiliencia
- menos scraping cómodo
- menos enumeración eficiente
- menos costo por automatización
- mejor protección para auth y endpoints caros
- más control por usuario, tenant o acción
- mejor base para operar incidentes o picos anómalos

No reemplaza otras defensas.
Pero baja muchísimo la rentabilidad del abuso.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- límites por endpoint o familia de endpoints
- sensibilidad especial en auth, exports y búsquedas
- alguna distinción entre anónimo y autenticado
- claves de limitación con sentido
- observabilidad y logs útiles
- política explicable
- calibración según costo e impacto

---

## Señales de ruido

Estas cosas suelen hacer ruido rápido:

- “no hace falta porque ya hay login”
- “eso lo hace el frontend”
- “el WAF lo arregla solo”
- todos los endpoints con el mismo límite
- sin límites en exports o búsquedas pesadas
- sin límites en auth flows
- nadie puede decir qué se está protegiendo ni contra qué abuso

---

## Checklist práctico

Cuando revises rate limiting en una app Spring, preguntate:

- ¿qué endpoints son más abusables o más caros?
- ¿cuáles están limitados hoy?
- ¿por IP, por usuario, por tenant o por qué clave?
- ¿hay límites distintos según tipo de endpoint?
- ¿qué pasa en login y recuperación?
- ¿qué pasa en búsquedas, exports y descargas?
- ¿qué actor autenticado podría abusar igual hoy?
- ¿qué señales deja el sistema cuando el límite se dispara?
- ¿se está castigando bien el abuso sin romper demasiado el uso legítimo?
- ¿el equipo puede explicar claramente qué protege el rate limiting y qué no?

---

## Mini ejercicio de reflexión

Tomá cinco endpoints de tu backend y respondé para cada uno:

1. ¿Qué daño produciría el abuso por volumen?
2. ¿Qué actor podría abusarlo?
3. ¿Qué clave tendría más sentido para limitarlo?
4. ¿Qué ventana o nivel de tolerancia sería razonable?
5. ¿Qué pasa hoy si alguien insiste cientos de veces?
6. ¿Qué observabilidad tenés sobre ese abuso?
7. ¿Cuál de esos endpoints hoy está más regalado a automatización?

Ese ejercicio ayuda muchísimo a pasar de “tenemos endpoints” a “tenemos endpoints gobernados también por ritmo y volumen”.

---

## Resumen

Rate limiting ayuda a reducir abuso de backend cuando la pregunta ya no es solo:

- “¿puede hacer esto?”

sino también:

- “¿puede hacerlo tantas veces, tan rápido y con este costo para el sistema?”

Suele ser especialmente útil en:

- auth
- búsquedas
- exports
- scraping
- spam
- enumeración
- endpoints costosos

En resumen:

> Un backend más maduro no solo controla permisos.  
> También controla ritmo, volumen y rentabilidad del abuso para que una acción legítima en pequeña escala no se convierta en una vía barata de explotación cuando se automatiza.

---

## Próximo tema

**CSRF: cuándo importa y cuándo no**
