---
title: "Cómo preparar un backend Spring Boot para producción con configuración, secretos, entornos y despliegue"
description: "Entender qué cambia cuando un backend Spring Boot deja de vivir solo en desarrollo y empieza a necesitar una configuración seria para producción, incluyendo entornos, secretos, propiedades y criterios básicos de despliegue."
order: 89
module: "Arquitectura y crecimiento del backend"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo documentar mejor decisiones técnicas y arquitectónicas para que el backend siga siendo entendible a medida que crece.

Eso ya te dejó una idea muy importante:

> un proyecto serio no solo necesita buen código, sino también memoria explícita sobre por qué ciertas decisiones existen y qué tradeoffs están sosteniendo la arquitectura.

Ahora aparece otra dimensión igual de importante cuando el backend deja de ser “algo que corre en tu máquina” y empieza a acercarse más a una aplicación real:

- configuración por entorno
- secretos
- URLs de servicios externos
- credenciales
- variables sensibles
- diferencias entre desarrollo, test y producción
- despliegue
- operación mínima razonable

Es decir:

> no alcanza con que el backend funcione bien en local; también tiene que poder ejecutarse de forma seria en distintos entornos sin volverse inseguro, frágil o imposible de mantener.

Este tema es clave porque muchas aplicaciones están bastante bien diseñadas a nivel de código, pero se vuelven muy desprolijas justo cuando toca operarlas fuera del entorno de desarrollo.

## El problema de pensar el backend como si siempre fuera a correr igual

Mientras el proyecto todavía está muy en etapa de desarrollo, es muy común trabajar con ciertas simplificaciones:

- una sola base local
- una sola configuración
- credenciales copiadas a mano
- URLs hardcodeadas
- secretos en el código
- archivos de configuración que todos tocan sin demasiado criterio
- deploy casi inexistente o puramente manual

Durante un rato eso puede alcanzar.

Pero a medida que el backend crece y ya tiene cosas como:

- auth
- pagos
- storage externo
- emails
- webhooks
- integraciones
- frontend real
- varios módulos
- distintas personas tocando el proyecto

esas simplificaciones empiezan a doler bastante.

Entonces aparece una pregunta muy concreta:

> ¿cómo preparo el backend para ejecutarse de manera más seria fuera de mi entorno de desarrollo local?

## Qué cambia cuando aparece “producción”

Muchas cosas.

Porque producción no es solo “la misma app corriendo en otro lado”.
Muy a menudo implica:

- otra base de datos
- otros secretos
- otras URLs de terceros
- logs más importantes
- restricciones de seguridad más serias
- despliegues más cuidadosos
- más control sobre configuración
- necesidad de reproducibilidad
- más sensibilidad a errores operativos

En otras palabras:

> la operación del backend empieza a importar casi tanto como su diseño interno.

Y eso es completamente normal en sistemas reales.

## Qué tipo de configuración suele empezar a importar mucho

Por ejemplo:

- URL de base de datos
- usuario y password de base
- JWT secret o claves relacionadas
- credenciales de proveedor de pagos
- API key de emails
- configuración de storage externo
- URLs base de proveedores
- timeouts
- flags de entorno
- CORS
- dominios permitidos
- logging
- puertos
- perfiles activos

Todo esto muestra que la aplicación ya no puede depender de valores fijos metidos arbitrariamente en el código.

## Qué es un entorno en este contexto

Dicho simple:

> un entorno es una forma de ejecución del sistema con configuración y condiciones distintas según el contexto en el que corre.

Muy comúnmente aparecen cosas como:

- `dev`
- `test`
- `staging`
- `prod`

No todos los proyectos tienen exactamente todos esos entornos, pero la idea es muy común y muy útil.

## Qué suele cambiar entre entornos

Por ejemplo:

### Desarrollo
- base local
- credenciales de prueba
- proveedores sandbox
- logs más verbosos
- menor restricción operativa

### Test
- base controlada para tests
- configuración reproducible
- dobles o entornos aislados
- foco en automatización

### Staging
- ambiente parecido a producción
- integraciones cercanas a las reales
- validación previa a deploy serio

### Producción
- datos reales
- secretos reales
- infraestructura real
- requisitos operativos y de seguridad mucho más fuertes

Esto deja clarísimo por qué una sola configuración rígida suele quedarse corta.

## Qué problema trae hardcodear configuración sensible

Muchísimos.

Por ejemplo:

- credenciales expuestas en el repo
- dificultad para cambiar de entorno
- deploys inseguros
- secretos repetidos en varios archivos
- imposibilidad de rotar fácilmente
- mezcla de configuración local con productiva
- confusión sobre qué valor está realmente activo

Esto vuelve muy importante separar:

- código
- configuración
- secretos sensibles

Esta separación es una de las bases más sanas de un backend serio.

## Qué conviene configurar por fuera del código

Como regla general bastante útil, conviene pensar que no deberían quedar hardcodeados en el código valores como:

- passwords
- API keys
- secrets
- tokens de terceros
- URLs variables por entorno
- usuarios de base
- credenciales cloud
- flags operativos específicos del deploy

No porque el código “no pueda”.
Sino porque operativamente suele ser muchísimo más sano que esas cosas vivan en configuración externa o controlada por entorno.

## Qué relación tiene esto con Spring Boot

Muy directa.

Spring Boot está especialmente bien preparado para trabajar con configuración externa y perfiles, y eso es una gran ventaja.

No hace falta que este tema sea una guía exhaustiva de todas las posibilidades del framework.
Lo importante primero es entender la idea arquitectónica y operativa:

> la app debe poder cambiar ciertos valores según el entorno sin tocar el código fuente principal.

Eso ya te cambia muchísimo la madurez del proyecto.

## Un ejemplo conceptual de configuración

Por ejemplo, podrías tener cosas como:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/app_dev
spring.datasource.username=app_user
spring.datasource.password=dev_password

security.jwt.secret=dev-secret
payments.provider.base-url=https://sandbox.provider.com
storage.base-url=https://sandbox-storage.example.com
```

Esto ya muestra algo importante:
ciertos valores no pertenecen al código del caso de uso, sino a la configuración de ejecución.

## Qué pasa con secretos

Este es uno de los puntos más importantes del tema.

No toda configuración tiene el mismo peso.

Una cosa es:

- timeout de un cliente HTTP
- nombre de una feature flag
- tamaño máximo de upload

Y otra muy distinta es:

- password de base
- JWT secret
- API key de pagos
- secreto de webhook
- credenciales de email
- claves cloud

Es decir:

> los secretos merecen todavía más cuidado que la configuración normal.

No conviene tratarlos como simples strings cualquiera.

## Qué significa tratar bien los secretos

Primero, en términos muy prácticos, suele significar cosas como:

- no commitearlos en el repo
- no hardcodearlos en clases
- no dejarlos en archivos versionados de manera insegura
- poder inyectarlos desde el entorno
- diferenciarlos bien entre dev, test y prod
- poder rotarlos sin reescribir medio sistema

Esto ya representa un salto muy grande de madurez operativa.

## Un error muy común

Pensar que porque el proyecto todavía es “chico”, entonces está bien dejar:

- claves en `application.properties` subido al repo
- tokens en constantes
- passwords en código
- secretos en clases de config

Eso puede parecer cómodo al principio, pero empieza a ser muy mala base apenas el proyecto crece o se comparte un poco más.

## Qué relación tiene esto con el repo y el equipo

Muy fuerte.

Porque apenas hay más de una persona o más de un entorno, la pregunta de “qué configuración va al repo y cuál no” se vuelve muchísimo más importante.

Normalmente, suele tener sentido que al repo vayan:

- defaults no sensibles
- estructura esperada de configuración
- placeholders
- ejemplos

y no los secretos reales de producción.

Esto mejora muchísimo seguridad y operabilidad.

## Qué pasa con `application.properties` o `application.yml`

Estos archivos son un lugar muy natural para mucha configuración.
Pero conviene usarlos con criterio.

Pueden ser excelentes para:

- defaults razonables
- estructura de claves
- configuración por entorno no sensible
- parámetros técnicos del sistema

Pero no deberían convertirse en un basurero donde se sube cualquier secreto productivo sin pensar.

La clave otra vez es el criterio, no el archivo en sí.

## Qué relación tiene esto con perfiles

Muy fuerte.

Los perfiles permiten pensar algo como:

- `application.properties` como base
- `application-dev.properties`
- `application-prod.properties`
- y variantes según entorno

No hace falta explicar todos los mecanismos internos de Spring en detalle ahora mismo.
Lo importante es entender el problema que resuelven:

> permitir que la misma aplicación se comporte con configuraciones diferentes según el entorno donde corre.

Eso es extremadamente valioso.

## Un ejemplo de diferencia por perfil

Podrías imaginar algo así:

### Desarrollo
```properties
payments.provider.base-url=https://sandbox.provider.com
logging.level.root=INFO
logging.level.com.ejemplo=DEBUG
```

### Producción
```properties
payments.provider.base-url=https://api.provider.com
logging.level.root=WARN
logging.level.com.ejemplo=INFO
```

Esto ya muestra cómo una misma app necesita comportamientos operativos distintos según dónde viva.

## Qué relación tiene esto con integraciones externas

Absolutamente central.

A esta altura del backend ya tenés cosas como:

- pagos
- email
- storage
- OAuth externo
- webhooks
- APIs de terceros

Y casi todas esas integraciones traen configuración sensible o variable por entorno, por ejemplo:

- URL sandbox vs producción
- API keys distintas
- secretos distintos
- endpoints internos distintos
- flags de simulación
- timeouts

Eso significa que una mala política de configuración puede romper o volver muy inseguras muchas partes sensibles del sistema.

## Qué relación tiene esto con seguridad

Muy fuerte también.

Porque algunas de las peores prácticas operativas suelen ser justamente prácticas de seguridad débiles, como:

- secrets en el repo
- JWT secret fijo hardcodeado
- credenciales productivas usadas también en desarrollo
- webhooks configurados igual en todos los entornos
- CORS permisivo por costumbre
- variables sensibles expuestas sin cuidado

Entonces este tema no es solo “DevOps”.
Toca directamente la seguridad real del sistema.

## Qué relación tiene esto con despliegue

Total.

Porque desplegar una app no es solo subir un jar o correr un contenedor.
También es:

- inyectar configuración correcta
- asegurar secretos
- apuntar al entorno correcto
- evitar mezclar credenciales
- activar el perfil adecuado
- tener parámetros razonables de ejecución

Es decir:

> el despliegue real depende mucho de cómo preparaste la app para configurarse correctamente.

Si eso no está resuelto, el deploy se vuelve más manual, más riesgoso y más frágil.

## Qué significa que el deploy sea reproducible

Que no dependa de magia ni de memoria oral del tipo:

- “ah, en producción había que tocar también este archivo a mano”
- “me olvidé que ese secret estaba en tal servidor”
- “ese valor lo había cambiado Juan directo en la VM”
- “creo que staging usa otro endpoint, pero no estoy seguro”

La reproducibilidad importa muchísimo porque reduce errores humanos y hace que el sistema sea mucho más confiable al moverse entre entornos.

## Qué relación tiene esto con observabilidad y operación

También muy fuerte.

Porque producción no solo exige arrancar la app.
También exige poder entender:

- qué perfil está activo
- qué versión está corriendo
- cómo se comporta el logging
- qué integraciones están apuntando a qué entorno
- si una configuración crítica falta
- si el sistema está arrancando con valores incorrectos

Esto muestra que una configuración buena también ayuda mucho a operar y diagnosticar.

## Qué conviene dejar muy explícito

Muchas veces es muy útil que quede claro, por ejemplo:

- qué propiedades son obligatorias
- cuáles son sensibles
- cuáles cambian por entorno
- qué defaults son seguros y cuáles no
- cómo se configura localmente
- qué proveedor usa sandbox y cuál producción
- qué flags no deberían activarse en prod

Esto ayuda muchísimo a otras personas y también a tu yo futuro.

## Un ejemplo de configuración tipada

En vez de tener strings sueltos por todas partes, muchas veces conviene agrupar ciertas configuraciones por responsabilidad.

Por ejemplo, conceptualmente:

```java
public class PaymentProperties {
    private String baseUrl;
    private String apiKey;
    private int timeoutMs;
}
```

o algo equivalente para:

- storage
- email
- JWT
- webhooks

No hace falta que ahora te pongas a implementar todas estas clases.
Lo importante es entender la idea:

> la configuración también merece estructura y no solo strings sueltos esparcidos.

## Por qué esto ayuda tanto

Porque mejora:

- legibilidad
- validación
- mantenibilidad
- localización del problema
- claridad sobre qué depende de qué

Y además hace menos probable que un valor sensible o crítico quede perdido en una zona rara del código.

## Qué pasa con configuración faltante

Otro punto muy importante.

Una aplicación seria debería reaccionar de manera clara si le falta una configuración crítica.
No conviene que arranque “más o menos” y falle mucho después de forma confusa.

Por ejemplo, si falta:

- API key de pagos
- JWT secret
- credencial de base
- secreto de webhook

muchas veces lo más sano es fallar temprano y claramente.

Esto evita errores mucho más feos y costosos más adelante.

## Qué relación tiene esto con entornos locales

También muy fuerte.

Porque conviene que desarrollo local siga siendo usable sin volver el setup un infierno.
Entonces aparece un equilibrio importante:

- no hardcodear secretos inseguros
- pero tampoco volver imposible correr la app localmente

Ahí suele ayudar mucho tener:

- ejemplos claros
- variables de entorno
- archivos locales no versionados
- sandbox de proveedores
- documentación breve de arranque

Otra vez:
criterio por encima del dogma.

## Qué no conviene hacer

No conviene:

- guardar secretos reales en el repo
- mezclar configuración de producción con desarrollo sin frontera clara
- hardcodear URLs o claves sensibles en clases
- depender de retoques manuales invisibles para que la app “ande”
- tratar todos los entornos como si fueran el mismo
- dejar configuración crítica dispersa sin estructura

Ese tipo de decisiones suele salir cara bastante rápido.

## Otro error común

Pensar que “después vemos producción”.
A cierta altura del backend, eso ya no es una deuda pequeña.
Porque seguridad, pagos, storage y demás dependen muchísimo de cómo se opera la configuración real.

## Otro error común

Tener demasiados valores mágicos repartidos en el código y no saber cuál corresponde a qué entorno.
Eso vuelve muy difícil diagnosticar errores o mover el sistema entre ambientes.

## Otro error común

No distinguir entre:
- configuración normal
- configuración sensible
- y secretos críticos

Esa diferencia importa muchísimo más de lo que parece al principio.

## Una buena heurística

Podés preguntarte:

- ¿este valor pertenece al código o al entorno?
- ¿es sensible o no?
- ¿cambia entre dev, test y prod?
- ¿puedo rotarlo o modificarlo sin tocar código?
- ¿la app fallaría claro si este valor falta?
- ¿otra persona entendería cómo configurar este backend sin adivinar?

Responder eso te ayuda muchísimo a madurar la operación del proyecto.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque a esta altura del backend ya probablemente tengas suficientes piezas sensibles como para que operar mal la configuración empiece a ser tan peligroso como programar mal una parte del dominio.

Especialmente con:

- JWT
- pagos
- storage externo
- emails
- OAuth
- webhooks
- base real
- frontend en producción

Por eso este tema no es un detalle de infraestructura menor.
Es parte del backend serio de punta a punta.

## Relación con Spring Boot

Spring Boot te da muy buenas herramientas para perfiles, properties y configuración externa.
Pero el verdadero salto no está solo en saber que esas herramientas existen.

El salto está en pensar el backend como una aplicación que:

- vive en varios entornos
- depende de secretos
- necesita despliegues más seguros
- y ya no puede tratar configuración y operación como una improvisación local.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> preparar un backend Spring Boot para producción implica separar mejor código, configuración y secretos, pensar distintos entornos de ejecución y hacer que el despliegue deje de depender de magia informal, porque a cierta escala operar mal la aplicación puede ser tan peligroso como diseñarla mal por dentro.

## Resumen

- Un backend serio no puede depender de una única configuración rígida pensada solo para local.
- Desarrollo, test, staging y producción suelen necesitar diferencias reales de configuración.
- No conviene hardcodear secretos ni tratarlos como simples strings del código.
- Integraciones externas, JWT, storage y pagos vuelven este tema especialmente sensible.
- Configuración clara, separada y reproducible mejora seguridad y operación.
- Spring Boot da herramientas muy útiles para esto, pero lo central es el criterio de diseño operativo.
- Este tema marca el paso desde “backend que anda” a “backend que puede operarse con más madurez en entornos reales”.

## Próximo tema

En el próximo tema vas a ver cómo pensar observabilidad básica del backend con logs, métricas y trazas, porque una vez que el sistema ya corre en serio fuera de tu máquina, también necesitás poder entender qué está pasando cuando algo falla o se vuelve lento.
