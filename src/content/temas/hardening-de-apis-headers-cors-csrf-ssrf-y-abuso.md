---
title: "Hardening de APIs: headers, CORS, CSRF, SSRF y abuso"
description: "Cómo endurecer una API más allá de que funcione, qué superficie de ataque aparece en headers, navegadores, integraciones y tráfico automatizado, y cómo pensar CORS, CSRF, SSRF, controles de exposición y abuso como parte del diseño de seguridad del backend real."
order: 138
module: "Seguridad y operación avanzada"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior hablamos de **seguridad en integraciones externas y supply chain**.

Ahí vimos que una parte importante del riesgo no nace solo en tu código, sino también en:

- proveedores externos
- librerías
- imágenes de contenedor
- herramientas de CI/CD
- SDKs
- paquetes
- servicios conectados al backend

La idea central era clara:

**no hay que extender confianza ciega a todo lo externo solo porque sea conocido o popular.**

Ahora vamos a mirar otra frontera muy expuesta, todavía más cotidiana:

**la propia API que tu sistema publica hacia afuera.**

Porque una API puede estar:

- bien modelada a nivel de negocio
- correctamente autenticada
- razonablemente autorizada
- conectada con servicios seguros

Y aun así seguir siendo frágil si su superficie HTTP, sus headers, su política de origen, sus integraciones salientes y su manejo del tráfico están mal endurecidos.

Éste es un punto importante.

Muchos equipos creen que “asegurar la API” significa solamente:

- poner autenticación
- validar payloads
- tener HTTPS

Pero en sistemas reales eso no alcanza.

También importan cosas como:

- qué headers devolvés y cuáles aceptás
- qué orígenes del navegador autorizás
- cómo evitás requests cross-site no deseados
- si tus servidores pueden ser usados para llegar a redes internas o recursos sensibles
- qué hacés con clientes automatizados, scraping, brute force o abuso volumétrico
- qué endpoints quedan demasiado expuestos por defaults inseguros

Por eso, cuando hablamos de hardening de APIs, no hablamos de “un parche de seguridad”.

Hablamos de una disciplina de diseño cuyo objetivo es:

**reducir superficie de ataque, cerrar ambigüedades peligrosas y volver más difícil que una API sana a nivel funcional termine siendo insegura a nivel operativo.**

## Qué significa hardening de una API

Hardening significa endurecer.

En este contexto, significa tomar una API que ya existe o que está en diseño y preguntarse:

- ¿qué comportamiento permisivo de más estamos aceptando?
- ¿qué defaults son demasiado abiertos?
- ¿qué supuestos del navegador o del cliente estamos dando por obvios?
- ¿qué caminos laterales podrían aprovecharse para acceder, abusar, pivotear o degradar el sistema?
- ¿qué controles conviene volver explícitos en lugar de implícitos?

Dicho simple:

**hardening es reducir la distancia entre “la API funciona” y “la API resiste mejor errores, abuso y ataques”.**

No es una solución mágica.
Tampoco un checklist fijo que se copia sin pensar.

Es una forma de mirar la exposición real del backend.

## Una API expone mucho más que endpoints

A veces se piensa la API como una lista de rutas:

- `GET /products`
- `POST /orders`
- `PATCH /users/{id}`

Pero desde el punto de vista de seguridad, la superficie real incluye bastante más:

- métodos HTTP permitidos
- headers de request y response
- cookies
- tokens
- CORS
- caché intermedia
- proxies
- comportamiento frente a redirects
- parsing de URLs salientes
- timeouts
- validación de destinos externos
- límites de tamaño
- política de errores
- rate limiting
- protección contra automatización abusiva
- cómo interactúa el navegador con esa API

Si todo eso no se diseña con criterio, aparecen huecos que no tienen nada que ver con la lógica principal del negocio, pero igual comprometen el sistema.

## Headers: pequeños detalles que cambian mucho la exposición

Los headers a veces parecen un tema secundario.
Pero en realidad son una parte importante de cómo una API comunica restricciones, contexto y expectativas a clientes, proxies y navegadores.

No todos los headers de seguridad aplican igual a una API JSON que a una app renderizada en navegador.
Aun así, hay principios que conviene entender.

### Headers como contrato defensivo

Un header puede ayudar a definir:

- qué contenido se está sirviendo
- cómo debe interpretarlo el cliente
- qué orígenes están autorizados
- si ciertas respuestas deberían cachearse o no
- cómo se comportan credenciales y cookies
- cómo reducir algunas superficies del navegador

No son una muralla perfecta.
Pero sí son una capa muy relevante.

### Algunos ejemplos conceptuales importantes

#### `Content-Type`

Parece básico, pero es crítico.

Una API debería devolver tipos de contenido claros y coherentes.
No conviene dejar ambigüedad sobre qué está devolviendo una respuesta.

Cuando el contenido esperado es JSON, la respuesta debería ser consistente con eso.

#### `Cache-Control`

Si una respuesta contiene datos sensibles, tokens efímeros, información de cuenta o resultados personalizados, una política de caché mal definida puede provocar:

- exposición en caches compartidas
- datos viejos reutilizados donde no correspondía
- mezcla de contexto entre usuarios

No toda respuesta debe ser no-cache.
Pero sí conviene pensar explícitamente qué puede quedar almacenado y qué no.

#### `Set-Cookie`

Si usás cookies para sesión o autenticación, atributos como:

- `HttpOnly`
- `Secure`
- `SameSite`

son parte del hardening real, no un detalle decorativo.

Una cookie sin atributos claros deja espacio innecesario para robo, reuso o envío en contextos no deseados.

#### Headers que limitan interpretación o exposición

Dependiendo del tipo de sistema y de si hay frontend web servido por el mismo backend o por otro dominio, también pueden importar políticas que reduzcan:

- sniffing incorrecto de contenido
- framing no deseado
- exposición de información innecesaria

La idea no es memorizar nombres por deporte.
La idea es entender esto:

**los headers son una forma de hacer explícito qué comportamiento permitís y cuál no.**

### Error común: copiar headers “de internet” sin entenderlos

Muy frecuente.

Se ve un artículo, se agregan diez headers y listo.

El problema es que:

- algunos no aplican igual a APIs y a HTML
- algunos pueden romper flujos legítimos si se configuran mal
- otros generan una falsa sensación de seguridad

Hardening no es “pegar configuración”.
Es decidir con criterio sobre el contexto real del sistema.

## CORS: no es autenticación, no es autorización y no es un firewall

CORS suele generar muchísima confusión.

Muchos desarrolladores lo usan años sin tener del todo claro qué resuelve.

CORS, en esencia, es una política del navegador para controlar si una página web en cierto origen puede leer respuestas de otro origen.

Eso significa que CORS:

- **vive principalmente en el navegador**
- **no reemplaza autenticación**
- **no reemplaza autorización**
- **no detiene clientes que no son navegador**

Ésta es una idea central.

Si tu API responde a `curl`, a Postman o a un script server-to-server, CORS no lo va a frenar.

Por eso, configurarlo bien importa.
Pero entender sus límites importa todavía más.

### Qué error aparece mucho

El clásico:

- “como ya tenemos CORS, la API está protegida”

No.

CORS no protege la API frente a cualquier consumidor.
Lo que hace es decirle al navegador cuándo puede exponer la respuesta a JavaScript ejecutándose desde otro origen.

### Configuraciones peligrosas comunes

#### Permitir cualquier origen por comodidad

Muy típico en desarrollo:

- `*`
- reflejar cualquier `Origin`
- abrir todo “para que funcione”

Eso puede ser tolerable en un entorno controlado y temporal.
Pero en producción suele ser una mala práctica, sobre todo si además se combinan credenciales.

#### Mezclar credenciales con políticas demasiado amplias

Si una API usa cookies o credenciales del navegador, una configuración permisiva de CORS puede volver mucho más delicada la exposición.

#### No distinguir entornos

A veces se habilitan orígenes de desarrollo, staging y producción todos juntos, sin limpieza, durante meses.
Eso ensucia la frontera y dificulta entender qué clientes deberían estar realmente autorizados.

### Qué conviene pensar bien en CORS

- qué frontend real necesita hablar con la API
- desde qué dominios exactos
- si se usan cookies o credenciales del navegador
- qué métodos hacen falta
- qué headers personalizados se necesitan
- si la política cambia entre ambientes
- cómo evitar wildcards innecesarios

La pregunta sana no es:

“¿cómo hago para que deje de tirar error de CORS?”

La pregunta sana es:

**“¿qué orígenes reales deberían poder interactuar desde navegador con esta API y bajo qué condiciones?”**

## CSRF: el riesgo de que un navegador autenticado haga algo que el usuario no quiso

CSRF significa Cross-Site Request Forgery.

El problema aparece cuando un navegador ya tiene credenciales válidas para tu sistema y otra página logra disparar una request que el backend interpreta como legítima.

La clave del ataque no es robar la sesión.
La clave es **aprovechar que la sesión ya existe**.

Esto importa especialmente cuando la autenticación se apoya en cookies enviadas automáticamente por el navegador.

### Cuándo el riesgo es real

Suele importar más cuando:

- usás cookies de sesión
- el navegador las adjunta automáticamente
- existen endpoints que cambian estado
- el backend no exige un segundo mecanismo para distinguir intención legítima

### Error común

Creer que “si la ruta requiere login, entonces ya está protegida”.

No necesariamente.
Porque en un escenario CSRF el navegador del usuario ya está logueado.

### Cómo se piensa la mitigación

No hace falta reducirlo a una receta única, pero conceptualmente suele incluir:

- `SameSite` bien configurado en cookies
- tokens anti-CSRF cuando el modelo lo requiere
- separación clara entre operaciones seguras e inseguras
- no aceptar cambios de estado por métodos demasiado permisivos
- revisar si realmente conviene autenticación basada en cookies para cierto cliente

Una lección importante acá es ésta:

**el navegador es un entorno con comportamientos automáticos.**

Y cuando diseñás APIs consumidas por browser, no alcanza con pensar solo en el servidor.
También tenés que pensar en cómo el navegador adjunta credenciales, sigue redirects, interpreta orígenes y dispara requests.

## SSRF: cuando tu backend se convierte en proxy hacia lugares que no debería alcanzar

SSRF significa Server-Side Request Forgery.

Es uno de los riesgos más subestimados en backends modernos.

El patrón general es éste:

- el sistema acepta una URL o un destino controlado parcial o totalmente por un actor externo
- el backend realiza una request saliente hacia ese destino
- esa capacidad se usa para llegar a recursos internos, metadata sensible o servicios que no deberían estar expuestos

Dicho simple:

**el atacante no entra solo a tu API; logra que tu API haga requests en su nombre hacia otros destinos.**

### Dónde aparece esto en la práctica

- preview de URLs
- validadores de webhooks
- importadores desde URL
- descarga de archivos remotos
- generación de thumbnails desde enlaces externos
- integraciones que aceptan callbacks configurables
- renderizadores o scrapers internos

### Por qué es peligroso

Porque el servidor suele tener acceso a cosas que el atacante no tiene directamente:

- red interna
- servicios administrativos
- metadata de cloud
- recursos no públicos
- hosts internos no ruteables desde internet

Y si esa salida no está controlada, el backend puede transformarse en un pivot muy valioso.

### Errores clásicos que abren SSRF

- aceptar cualquier URL
- validar solo con regex superficial
- permitir redirects sin control
- no resolver ni controlar IPs destino
- no bloquear rangos internos o especiales
- confiar en DNS sin considerar rebinding
- usar clientes HTTP demasiado permisivos
- descargar contenido remoto sin límites de tiempo o tamaño

### Cómo pensar mitigación de SSRF

Más que una sola técnica, conviene pensar en capas:

- evitar requests salientes arbitrarias cuando no son necesarias
- usar allowlists de hosts o destinos esperados
- bloquear acceso a IPs internas, loopback, link-local o metadata sensible
- limitar redirects
- controlar timeouts y tamaño de respuesta
- registrar intentos sospechosos
- separar infraestructura para que procesos que consumen URLs externas no tengan acceso innecesario a redes sensibles

La idea central es muy importante:

**si tu backend hace requests a destinos elegidos por terceros, esa capacidad debe tratarse como una operación de alto riesgo.**

## Abuso: no todo ataque busca entrar; muchos buscan agotar, automatizar o explotar asimetrías

A veces se piensa seguridad solo como confidencialidad o acceso indebido.
Pero muchas amenazas contra APIs vienen por el lado del abuso.

Por ejemplo:

- brute force de login
- credential stuffing
- scraping agresivo
- enumeración de recursos o cuentas
- spam automatizado
- consumo volumétrico de endpoints costosos
- reintentos masivos para provocar carga
- explotación de operaciones asimétricas donde una request barata dispara trabajo caro

En estos casos, aunque el atacante no “entre” del todo, igual puede:

- degradar servicio
- aumentar costos
- afectar usuarios legítimos
- forzar bloqueos operativos
- generar ruido en soporte
- desgastar infraestructura

## El abuso se diseña, no solo se bloquea después

Una API madura debería preguntarse desde diseño:

- ¿qué endpoints son especialmente atractivos para automatización?
- ¿qué operación cuesta poco disparar pero mucho procesar?
- ¿qué errores devuelven demasiada información útil para enumerar?
- ¿qué acciones se pueden repetir sin fricción?
- ¿qué recursos necesitan rate limit, cuotas, desafíos o cooldowns?

### Algunas defensas típicas

- rate limiting por IP, usuario, token o combinación contextual
- cuotas por tenant o plan
- límites de concurrencia
- backpressure
- timeouts razonables
- costo creciente o desafíos adicionales ante patrones sospechosos
- respuestas menos informativas en superficies sensibles
- observabilidad específica para detectar abuso
- separación entre tráfico humano, tráfico automatizado legítimo e integraciones de confianza

### Error común: mismo tratamiento para todo el tráfico

No todo cliente es igual.

No es lo mismo:

- un usuario desde navegador
- una app mobile propia
- un partner empresarial
- un job interno
- un bot autorizado
- un atacante con automatización

Si tratás todo igual, o abrís demasiado, o rompés casos legítimos.

## Hardening no reemplaza las otras capas

Esto también es importante.

Hardening de APIs no reemplaza:

- autenticación
- autorización
- validación de negocio
- observabilidad
- secretos bien gestionados
- segmentación de red
- diseño de integraciones

Se suma a todo eso.

Es una capa transversal que ayuda a que errores pequeños no se conviertan tan fácilmente en incidentes grandes.

## Errores comunes en hardening de APIs

### 1. Resolver CORS “hasta que deje de molestar”

Eso suele terminar en configuraciones demasiado abiertas.

### 2. Suponer que CSRF ya no importa sin revisar el modelo real de sesión

Especialmente peligroso cuando hay cookies.

### 3. Permitir que cualquier usuario o integración dispare requests salientes arbitrarias

SSRF vive ahí.

### 4. Tratar headers como decoración

Muchas veces contienen decisiones importantes sobre exposición.

### 5. Pensar abuso solo cuando ya hubo incidente

Para entonces, normalmente ya dolió en costo, soporte o disponibilidad.

### 6. Copiar configuraciones de seguridad sin entender contexto

Hardening genérico y ciego también rompe sistemas.

### 7. Devolver errores demasiado verbosos en endpoints sensibles

Eso ayuda a atacantes a aprender el sistema.

## Qué preguntas conviene hacerse al diseñar este tema

1. ¿qué parte de nuestra API realmente necesita ser consumida desde navegador y desde qué orígenes?
2. ¿usamos cookies, tokens o ambos, y qué riesgos trae cada modelo?
3. ¿hay endpoints que cambian estado y podrían ser sensibles a CSRF?
4. ¿existe alguna feature que haga requests salientes hacia URLs controladas por terceros?
5. ¿qué destinos salientes deberían estar explícitamente permitidos y cuáles explícitamente bloqueados?
6. ¿qué endpoints son más atractivos para brute force, scraping o automatización abusiva?
7. ¿qué headers o defaults actuales dejan demasiada ambigüedad sobre caché, contenido o credenciales?
8. ¿qué controles están realmente diseñados y cuáles solo quedaron “porque así vino el framework”? 

## Relación con los temas anteriores

Este tema conecta fuerte con varios de los que ya vimos.

Con **validación defensiva y hardening de entrada**, porque muchas superficies de API empiezan precisamente en requests ambiguas o demasiado permisivas.

Con **autenticación avanzada y gestión de identidad**, porque cookies, sesiones y credenciales cambian el perfil de riesgo de browser y API.

Con **autorización robusta y control fino de permisos**, porque CORS no reemplaza permisos reales y los límites de acceso siguen siendo responsabilidad del backend.

Con **seguridad en integraciones externas y supply chain**, porque SSRF y requests salientes mal diseñadas convierten integraciones aparentemente inocentes en caminos laterales hacia recursos sensibles.

## Qué deberías llevarte de esta lección

Si tuvieras que quedarte con una sola idea, que sea ésta:

**una API segura no es solo una API con login; es una API cuya superficie HTTP, comportamiento en navegador, salidas de red y resistencia al abuso fueron pensadas explícitamente.**

Cuando ese trabajo no existe, aparecen problemas como:

- orígenes demasiado abiertos
- cookies peligrosamente configuradas
- endpoints expuestos a CSRF
- backend usado como proxy para SSRF
- abuso que degrada servicio o dispara costos
- configuraciones copiadas sin criterio

Y nada de eso suele verse en el happy path del desarrollo diario.

## Cierre

En backend real, endurecer APIs no es “agregar seguridad al final”.
Es reconocer que la exposición HTTP tiene demasiados matices como para confiar en defaults, tutoriales sueltos o configuraciones heredadas.

Un backend profesional necesita poder responder con claridad:

- qué clientes lo consumen
- desde qué contextos
- con qué credenciales
- qué orígenes del navegador están permitidos
- qué requests cruzadas deberían bloquearse
- qué destinos salientes son seguros
- qué abuso espera y cómo lo contiene

Ésa es la diferencia entre publicar endpoints,
y operar una **superficie API endurecida de verdad**.

Y una vez que esta frontera HTTP está mejor controlada, el siguiente paso natural es mirar otro frente clásico de incidentes:

**qué pasa cuando el sistema acepta archivos, procesa uploads o aloja contenido generado por usuarios.**

Ahí entramos en el próximo tema: **seguridad de archivos, uploads y contenido generado por usuarios**.
