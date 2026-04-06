---
title: "Qué no guardar en application.properties"
description: "Qué valores no conviene guardar en application.properties o application.yml en una aplicación Java con Spring Boot. Por qué mezclar configuración con secretos es una fuente clásica de fuga, cómo distinguir convenience de seguridad y qué riesgos aparecen cuando credenciales, tokens o claves quedan dentro del proyecto o demasiado cerca del código."
order: 94
module: "Secretos, configuración y entorno"
level: "base"
draft: false
---

# Qué no guardar en application.properties

## Objetivo del tema

Entender **qué no conviene guardar en `application.properties` o `application.yml`** en una aplicación Java + Spring Boot.

La idea es revisar una práctica extremadamente común y peligrosa al mismo tiempo:

- “lo dejo en properties por comodidad”
- “es solo para que levante local”
- “después lo sacamos”
- “por ahora lo necesito en el proyecto”
- “si está en `application-local.yml`, no pasa nada”

Ese tipo de decisiones suele parecer pequeña.
Pero muchas fugas reales empiezan exactamente ahí.

Porque cuando un secreto o una credencial terminan en archivos de configuración del proyecto, pasan a quedar mucho más cerca de:

- el código fuente
- el repositorio
- los PRs
- el historial de Git
- el entorno local del desarrollador
- capturas de pantalla
- logs de arranque
- empaquetados o artefactos
- procesos de build y CI/CD

En resumen:

> `application.properties` es excelente para mucha configuración.  
> Pero mezclar ahí secretos reales suele ser una de las formas más rápidas de convertir conveniencia en fuga.

---

## Idea clave

No toda configuración es secreta.
Y no todo secreto debería vivir en el mismo lugar donde se define la configuración general de la app.

Ese es el corazón del tema.

En Spring Boot, archivos como:

- `application.properties`
- `application.yml`
- `application-dev.yml`
- `application-local.yml`
- `application-prod.yml`

son muy útiles para declarar:

- puertos
- feature flags
- timeouts
- nombres de colas
- rutas funcionales
- niveles de logging
- opciones de framework
- comportamiento del entorno

Pero no deberían convertirse en un “depósito cómodo” de:

- passwords
- API keys
- client secrets
- signing keys
- tokens
- claves de cifrado
- credenciales técnicas

La idea central es esta:

> una cosa es configuración del sistema.  
> Otra muy distinta es material que, si se filtra, otorga acceso o poder operativo real.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- subir secretos al repo junto con el código
- dejar passwords reales en `application.properties`
- usar el mismo archivo para configurar puertos y credenciales críticas
- creer que “como el repo es privado” ya está resuelto
- esconder secretos en perfiles locales que igual terminan circulando
- copiar y pegar archivos de configuración entre entornos con credenciales reales
- asumir que variables de placeholder ya equivalen a buena gestión de secretos
- dejar claves de firma o cifrado demasiado cerca del código
- usar archivos de configuración como mecanismo principal de distribución de secretos
- normalizar prácticas locales que luego se filtran a staging o producción

Es decir:

> el problema no es usar archivos de configuración.  
> El problema es convertirlos en un punto de almacenamiento y distribución de credenciales operativas.

---

## Error mental clásico

Un error muy común es este:

### “Está bien ponerlo en properties porque el repo es privado”

Eso es una falsa sensación de seguridad.

Porque incluso en un repo privado, esos secretos pueden terminar en:

- forks internos
- clones locales
- máquinas personales
- PRs
- historial de Git
- pipelines
- artefactos de build
- backups
- tickets
- screenshots
- chats internos
- accesos de exempleados o terceros con permisos históricos

### Idea importante

Privado no significa controlado con el rigor que merece una credencial real.
Y, además, los secretos rara vez se quedan solo en el repo original.

---

## Otro error clásico: “después lo sacamos”

Esta es una de las frases más peligrosas en este tema.

- “por ahora lo dejamos”
- “es temporal”
- “solo hasta que configuremos bien el entorno”
- “solo para una demo”
- “solo para que el equipo arranque rápido”

### Problema

Ese “temporal” suele convertirse en:

- costumbre
- plantilla base
- ejemplo copiado
- archivo replicado en nuevos servicios
- historial permanente en Git
- secreto olvidado pero todavía válido

### Regla sana

Un secreto en `application.properties` rara vez es un detalle pasajero inocuo.
Suele ser el inicio de una deuda que después cuesta muchísimo erradicar.

---

## Qué tipo de cosas no conviene guardar ahí

Hay varias categorías que, como principio general, conviene no dejar en archivos de configuración del proyecto.

### 1. Credenciales de base de datos reales
Por ejemplo:

- username con privilegios reales
- password de producción
- password de staging sensible
- cuentas compartidas entre ambientes

### 2. API keys de terceros
Por ejemplo:

- pagos
- email
- storage
- analytics
- maps
- IA
- servicios de verificación
- mensajería

### 3. Client secrets de OAuth/OIDC
Estos valores otorgan capacidad operativa directa y no deberían viajar pegados al proyecto.

### 4. Claves de firma o cifrado
Por ejemplo:

- secrets de JWT
- claves privadas
- material criptográfico
- claves para cifrar o descifrar datos

### 5. Tokens o credenciales técnicas temporales
Aunque “vivan poco”, si terminan en el repo o en un config file, pueden filtrarse igual y generar daño dentro de su ventana de validez.

---

## Qué sí suele tener sentido guardar

Para no volver el tema caricaturesco, conviene decir también qué tipo de configuración sí suele encajar mejor en estos archivos.

### Ejemplos razonables

- `server.port`
- niveles de logging
- flags no sensibles
- timeouts
- tamaños máximos
- nombres de colas o topics
- URLs públicas no secretas
- opciones de serialización
- configuraciones de framework
- límites funcionales
- propiedades de negocio no confidenciales

### Idea útil

La pregunta no es “todo fuera de properties”.
La pregunta es:

> ¿este valor es solo configuración o su fuga cambia capacidades reales del sistema?

---

## El problema no es solo el archivo actual, sino el historial

Esto merece remarcarse mucho.

Aunque alguien borre luego el secreto del `application.properties`, puede seguir vivo en:

- commits viejos
- ramas
- tags
- PRs
- forks
- caches del CI
- copias locales
- backups del repo
- artefactos generados en el medio

### Idea importante

Cuando un secreto entra al repositorio, el problema ya no es solo “quitar la línea”.
También pasa a ser:

- rotarlo
- revocarlo
- revisar dónde quedó replicado
- asumir que quizá ya fue expuesto

---

## `application-local.yml` tampoco es zona mágica

Otro error frecuente es pensar:

- “esto no está en el archivo principal”
- “vive en `application-local.yml`”
- “entonces está bien”

Eso mejora algo solo si ese archivo:

- no se versiona
- no se comparte
- no se usa como plantilla con valores reales
- no termina copiado por Slack, Drive o tickets
- no se vuelve parte de la onboarding docs de forma insegura

### Problema

En la práctica, muchos equipos terminan compartiendo archivos locales con credenciales como si fueran material operativo normal.

### Regla sana

Cambiar el nombre del archivo no resuelve por sí solo el problema de gestionar secretos.

---

## El repo no debería ser el canal de distribución de secretos

Esta es una idea de fondo muy importante.

Cuando un secreto vive en `application.properties`, el repositorio empieza a funcionar como:

- almacenamiento
- distribución
- versionado
- replicación
- onboarding
- recuperación de credenciales

Y eso es una mala combinación.

### Porque Git está pensado para
- código
- historia
- colaboración
- reproducibilidad del proyecto

no para
- controlar lifecycle de credenciales
- revocar secretos
- restringir acceso fino a valores operativos
- limitar lectura según necesidad real
- rotar material sensible sin contaminar el historial

### Idea importante

Un secreto bien gestionado no debería depender del repo como canal principal de vida.

---

## Variables placeholder ayudan, pero no son la solución completa

En Spring es común ver algo como:

```properties
spring.datasource.password=${DB_PASSWORD}
```

Eso suele ser bastante mejor que poner el password real directamente.
Pero tampoco significa que todo ya esté resuelto.

### Porque todavía hay que pensar

- de dónde sale `DB_PASSWORD`
- quién la inyecta
- quién la puede leer
- dónde queda registrada
- cómo se rota
- si el entorno la filtra en logs o debugging
- si el pipeline la expone
- si los desarrolladores la comparten de forma insegura

### Idea útil

Usar placeholders es una mejora de diseño.
No reemplaza una estrategia real de manejo de secretos.

---

## Archivos de ejemplo sí, secretos reales no

Una práctica útil y sana suele ser tener:

- archivos de ejemplo
- valores dummy
- documentación clara de qué variable falta
- plantillas seguras sin credenciales reales

### Por ejemplo
- `application-example.yml`
- placeholders
- documentación de entorno
- variables requeridas sin valor real

### Qué gana eso

- onboarding más claro
- menos necesidad de compartir secretos por canales ad hoc
- mejor separación entre estructura de config y material secreto real
- menos tentación de commitear credenciales “para que levante”

### Regla sana

Versionar estructura de configuración está bien.
Versionar secretos reales no.

---

## Los secrets de JWT o signing keys son especialmente peligrosos ahí

Este punto merece atención particular.

Mucha gente deja en config cosas como:

- `jwt.secret=...`
- claves HMAC largas
- material de firma
- secretos usados para emitir o validar tokens

### Problema

Si ese valor se filtra, el daño puede ser enorme porque alguien podría:

- firmar tokens
- falsificar sesiones
- validar o manipular flujos de autenticación
- comprometer la confianza en todo el esquema de tokens

### Idea importante

No todo secreto es igual.
Pero los de firma o cifrado suelen ser especialmente críticos y merecen más cuidado todavía.

---

## Credenciales de terceros: fuga con impacto externo

Cuando dejás una API key o secret de tercero en properties, el daño no siempre queda limitado a tu app.

También puede habilitar:

- consumo fraudulento de servicios pagos
- abuso de mensajería o email
- acceso a storage o colas
- uso indebido de cuentas compartidas
- incidentes con proveedores
- costos económicos
- bloqueos o sanciones del tercero

### Regla útil

El hecho de que el secreto “solo sirva para integrar” no lo hace menos serio.
Muchas veces lo vuelve más crítico.

---

## Secrets en properties y múltiples entornos

Otro problema aparece cuando el mismo patrón se replica en:

- `application-dev.yml`
- `application-staging.yml`
- `application-prod.yml`
- variantes por cliente
- forks
- servicios relacionados

### Resultado

- más copias
- más dispersión
- más gente con acceso
- más dificultad para rotar
- más errores entre entornos
- más chances de que producción termine expuesta por una práctica nacida en dev

### Idea importante

Las malas prácticas con secrets escalan muy mal cuando el número de entornos crece.

---

## El empaquetado también importa

A veces el problema no es solo el repo.
Si ciertas configuraciones quedan dentro del artefacto o de la imagen generada, los secretos pueden terminar demasiado cerca de:

- `.jar`
- imágenes de contenedor
- artefactos de release
- despliegues cacheados
- ambientes de staging
- repositorios de paquetes
- máquinas de build

### Regla sana

Un secreto no debería viajar pegado al código más de lo estrictamente necesario.
Cuanto más se incrusta en el artefacto, más se parece a un “dato de software” y menos a una credencial gobernada.

---

## Qué suele pasar después de una fuga por properties

Cuando una credencial real quedó en config y fue versionada, el equipo muchas veces reacciona tarde o incompleto.

Las acciones sanas suelen incluir preguntas como:

- ¿ese secreto sigue vigente?
- ¿ya se rotó?
- ¿quedó en historial?
- ¿se copió a otros servicios?
- ¿apareció en documentación o ejemplos?
- ¿hay que invalidar accesos?
- ¿qué otros ambientes usan el mismo valor?

### Idea importante

No alcanza con “removerlo del archivo”.
Cuando un secreto entró ahí, normalmente ya hay que tratarlo como potencialmente comprometido.

---

## No todo debe resolverse con el mismo mecanismo

Este tema no exige una única herramienta, pero sí una dirección clara.

Lo importante es que los secretos reales:

- no queden pegados al repo
- no vivan como config común
- no se distribuyan por copia de archivos
- no se versionen como si fueran parte del código

### La implementación concreta puede variar

- variables de entorno bien gobernadas
- secret managers
- mecanismos de inyección del entorno
- vaults
- plataformas cloud

Pero el principio es el mismo:

> el archivo de configuración del proyecto no debería ser el hogar natural de credenciales reales.

---

## Qué conviene revisar en una app Spring

Cuando revises `application.properties` o `application.yml`, mirá especialmente:

- passwords
- API keys
- tokens
- client secrets
- claves JWT
- claves de cifrado
- rutas a keystores sensibles
- credenciales de SMTP, storage o mensajería
- valores reales en perfiles de dev/staging/prod
- placeholders correctos vs valores hardcodeados
- archivos locales compartidos informalmente con secretos reales

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- estructura de configuración versionada sin valores críticos reales
- placeholders en vez de secretos hardcodeados
- ejemplos y docs sin credenciales válidas
- menos necesidad de compartir archivos completos entre personas
- mejor separación entre config funcional y material secreto
- menor dependencia del repo como canal de distribución de credenciales
- mejor base para rotación y revocación

---

## Señales de ruido

Estas señales merecen revisión rápida:

- passwords reales en properties
- API keys o JWT secrets pegados en YAML
- frases como “después lo sacamos”
- `application-local.yml` compartido con credenciales reales
- el mismo secreto repetido en varios perfiles
- el equipo no sabe qué valores del archivo son realmente secretos
- config que “levanta perfecto” porque ya trae todas las credenciales dentro
- historial de Git con material sensible que nadie ha rotado todavía

---

## Checklist práctico

Cuando revises un `application.properties` o `application.yml`, preguntate:

- ¿qué valores de este archivo otorgan acceso o poder operativo?
- ¿cuáles de esos valores son secretos reales y no simple configuración?
- ¿alguno está hardcodeado en vez de venir por un canal mejor?
- ¿ese archivo se versiona, comparte o empaqueta?
- ¿qué pasaría si este repo se filtrara hoy?
- ¿qué secretos están repetidos en varios perfiles o servicios?
- ¿qué placeholders existen y de dónde se resuelven realmente?
- ¿qué valor fue puesto “temporalmente” y nunca se retiró?
- ¿qué habría que rotar si mañana descubrimos que este archivo circuló de más?
- ¿qué sacarías primero para reducir riesgo sin romper la app?

---

## Mini ejercicio de reflexión

Tomá un `application.yml` real o imaginario de una app tuya y respondé:

1. ¿Qué líneas son simple configuración?
2. ¿Qué líneas son secretos reales?
3. ¿Cuáles de esos secretos están demasiado cerca del código?
4. ¿Qué parte del archivo podrías dejar como plantilla y no como valor real?
5. ¿Qué secreto te daría más problemas si apareciera en un PR o en un screenshot?
6. ¿Qué rotación sería más dolorosa hoy porque el valor está pegado a demasiados lugares?
7. ¿Qué cambio harías primero para separar mejor configuración y credenciales?

---

## Resumen

`application.properties` y `application.yml` son herramientas excelentes para configurar una app Spring.
Pero no deberían convertirse en el lugar natural para guardar credenciales reales.

Los mayores riesgos aparecen cuando:

- secretos se versionan junto con el código
- perfiles locales o de entorno se comparten con valores válidos
- el repo termina distribuyendo credenciales
- claves críticas como JWT secrets o API keys quedan pegadas al proyecto
- “temporal” se vuelve permanente

En resumen:

> un backend más maduro no trata las credenciales como una línea más del archivo de config.  
> Distingue entre configuración y secreto, y evita que el proyecto, el repositorio o el artefacto se conviertan en el canal principal de almacenamiento y distribución de valores que otorgan acceso real.

---

## Próximo tema

**Variables de entorno y límites**
