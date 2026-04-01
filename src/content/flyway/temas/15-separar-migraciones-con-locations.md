---
title: "Separar migraciones con locations"
description: "Cómo organizar migraciones en distintas carpetas, cuándo conviene separar por entorno o por tipo y cómo usar locations sin volver confuso el flujo de Flyway."
order: 15
module: "Organización y configuración"
level: "intermedio"
draft: false
---

# Separar migraciones con `locations`

Hasta acá venimos construyendo una idea bastante clara:

- Flyway detecta migraciones;
- las ordena según sus reglas;
- aplica primero las versionadas pendientes;
- y luego las repeatable que hayan cambiado.

Pero a medida que un proyecto crece, aparece una necesidad muy común:

> ya no alcanza con tener todos los scripts mezclados en una sola carpeta.

En ese punto entra en juego `locations`.

La idea de este tema es que entiendas para qué sirve, cómo usarlo bien y qué criterio conviene seguir para no transformar una organización útil en una fuente de confusión.

## Objetivos

Al finalizar este tema deberías poder:

- entender qué hace `locations`;
- separar migraciones en más de una carpeta;
- distinguir entre organización útil y sobreingeniería;
- usar `locations` desde línea de comandos y desde `flyway.toml`;
- razonar cuándo conviene separar por entorno, por tipo o por responsabilidad.

## La idea central

`locations` es la configuración que le dice a Flyway **dónde buscar migraciones**.

Dicho de forma simple:

- si Flyway no sabe dónde mirar, no puede descubrir scripts;
- si vos configurás una o varias ubicaciones, Flyway escanea esas rutas;
- y todo archivo válido que encuentre dentro de ellas entra en el proceso normal de descubrimiento.

No cambia la lógica de versionado.
No cambia el orden básico de ejecución.
No reemplaza las reglas de nombres.

Lo que cambia es **la organización física de tus migraciones**.

## Qué permite hacer `locations`

Con `locations` podés indicar una sola carpeta o varias.

Por ejemplo, podrías tener algo así:

```text
sql/
  V1__crear_tablas_base.sql
  V2__agregar_indices.sql
```

O algo más organizado:

```text
db/
  core/
    V1__crear_tablas_base.sql
    V2__agregar_indices.sql
  reports/
    R__recrear_vistas.sql
```

En ambos casos Flyway puede descubrir migraciones, siempre que las rutas estén incluidas en `locations`.

## Descubrimiento recursivo

Un detalle importante es que Flyway escanea de forma recursiva debajo de las ubicaciones configuradas.

Eso significa que no hace falta declarar cada subcarpeta por separado si ya están bajo una ruta raíz razonable.

Por ejemplo, si definís una ubicación que apunta a `db`, Flyway puede encontrar migraciones válidas dentro de subdirectorios como:

- `db/core`
- `db/reports`
- `db/views`
- `db/modulos/clientes`

Esto te da flexibilidad para ordenar mejor el proyecto sin tener que inflar la configuración.

## Tipos de ubicación más comunes

Según cómo uses Flyway, las ubicaciones pueden apuntar a distintos tipos de origen.

### `filesystem:`

Es la opción más común cuando trabajás con Flyway CLI y archivos en disco.

Ejemplo:

```toml
[flyway]
locations = ["filesystem:sql"]
```

### `classpath:`

Es frecuente cuando Flyway está integrado a una aplicación Java y las migraciones viven dentro de los recursos del proyecto.

Ejemplo:

```toml
[flyway]
locations = ["classpath:db/migration"]
```

La regla práctica es simple:

- CLI y carpetas locales: normalmente `filesystem:`;
- integración con aplicación Java: muchas veces `classpath:`.

## Ejemplo básico con una sola ubicación

Supongamos esta estructura:

```text
mi-proyecto/
  flyway.toml
  sql/
    V1__crear_tabla_usuarios.sql
    V2__crear_tabla_productos.sql
```

Tu configuración podría ser:

```toml
[flyway]
locations = ["filesystem:sql"]
```

Y entonces, al ejecutar:

```bash
flyway migrate
```

Flyway buscará migraciones dentro de `sql`.

## Ejemplo con varias ubicaciones

Ahora imaginá que querés separar scripts generales de scripts de reporting:

```text
mi-proyecto/
  flyway.toml
  migrations/
    V1__crear_tablas_base.sql
    V2__agregar_indices.sql
  reporting/
    R__recrear_vistas.sql
```

Podrías usar:

```toml
[flyway]
locations = ["filesystem:migrations", "filesystem:reporting"]
```

Con eso Flyway buscará migraciones válidas en ambas carpetas.

## Cuándo conviene separar carpetas

Separar por carpetas tiene sentido cuando mejora la lectura y el mantenimiento.

### Casos razonables

- separar scripts principales de scripts auxiliares;
- aislar migraciones de reporting o vistas;
- organizar por módulos cuando el proyecto ya creció bastante;
- distinguir migraciones de aplicación de scripts específicos de pruebas controladas.

### Casos donde puede ser excesivo

- proyectos pequeños con pocas migraciones;
- estructuras que obligan a buscar archivos en demasiados lugares;
- separaciones artificiales que nadie del equipo entiende;
- carpetas creadas “por las dudas” sin una regla clara.

La organización tiene que ayudarte a pensar mejor el proyecto, no a esconderlo detrás de una estructura rebuscada.

## Separar por entorno: cuidado

Acá conviene ser muy prudente.

A veces alguien piensa algo así:

- una carpeta para desarrollo;
- otra para testing;
- otra para producción.

Eso **puede** tener sentido en algunos casos muy controlados, pero también puede volverse peligroso si implica que cada entorno termina teniendo historias de migración distintas.

La regla general más sana es esta:

> los entornos deberían compartir la misma historia principal de migraciones siempre que sea posible.

Si cada ambiente empieza a correr scripts distintos como norma, el riesgo de divergencia sube mucho.

## Cuándo sí puede existir una separación por entorno

Puede tener sentido cuando se trata de:

- scripts auxiliares de prueba;
- datos de laboratorio;
- material de validación que no forma parte del historial principal;
- configuraciones específicas del entorno aplicadas de forma consciente.

Pero incluso ahí conviene dejar muy claro qué pertenece a la historia real del esquema y qué pertenece al soporte del entorno.

## Entornos y overrides de configuración

Flyway moderno permite definir entornos en `flyway.toml` y también aplicar overrides de configuración por entorno.

Eso significa que podés tener algo como:

```toml
[environments.development]
url = "jdbc:postgresql://localhost:5432/app_dev"
user = "postgres"
password = "postgres"

[environments.development.flyway]
locations = ["filesystem:migrations", "filesystem:testdata"]

[environments.production]
url = "jdbc:postgresql://db-server:5432/app_prod"
user = "app"
password = "secreto"

[environments.production.flyway]
locations = ["filesystem:migrations"]
```

La idea conceptual acá es importante:

- el entorno de desarrollo puede incluir material adicional controlado;
- producción puede usar solo la historia principal;
- y el cambio de entorno se hace apuntando al environment correspondiente.

## Un criterio sano para diseñar carpetas

Cuando no sabés cómo organizar, esta guía suele funcionar bien:

### Opción simple

```text
sql/
  V1__...
  V2__...
  R__...
```

Ideal para cursos, proyectos chicos y etapas tempranas.

### Opción intermedia

```text
db/
  migration/
    V1__...
    V2__...
  repeatable/
    R__...
```

Útil si querés separar mejor los tipos de cambio sin romper demasiado la simplicidad.

### Opción modular

```text
db/
  core/
  billing/
  reporting/
```

Más razonable cuando el proyecto ya tiene muchos cambios, varios módulos y suficiente complejidad como para justificar esa organización.

## Qué no cambia aunque uses varias locations

Esto es muy importante para no confundirse.

Aunque uses una carpeta o diez, Flyway sigue teniendo las mismas reglas base:

- las migraciones deben respetar la convención de nombres;
- las versionadas se aplican una sola vez;
- las pendientes se ejecutan en orden;
- las repeatable se ejecutan después de las versionadas pendientes si cambiaron;
- el historial se sigue registrando en `flyway_schema_history`.

`locations` organiza la búsqueda.
No redefine el modelo de migración.

## Errores comunes

### 1. Usar muchas carpetas sin una convención clara

Si nadie sabe por qué un script está en cierta carpeta, la estructura deja de ayudar.

### 2. Mezclar scripts principales y experimentales

Si ponés pruebas, borradores y migraciones reales dentro del mismo circuito de búsqueda, tarde o temprano algo que no debía ejecutarse va a ser descubierto.

### 3. Cambiar locations sin revisar el impacto

Modificar `locations` no es un cambio inocente. Puede hacer que Flyway deje de encontrar scripts esperados o empiece a descubrir otros que antes no consideraba.

### 4. Crear historias distintas por entorno sin una razón seria

Cuando desarrollo, testing y producción dejan de compartir la misma lógica de evolución, el mantenimiento se vuelve más frágil.

## Ejemplo práctico desde línea de comandos

También podés indicar ubicaciones al vuelo:

```bash
flyway -locations="filesystem:migrations,filesystem:reporting" migrate
```

Eso puede servir para pruebas puntuales o para automatizaciones, aunque en proyectos reales suele ser más claro dejar la configuración establecida en `flyway.toml`.

## Buenas prácticas

- empezá simple y complejizá solo cuando haga falta;
- usá nombres de carpetas que expresen intención real;
- mantené una historia principal compartida entre entornos siempre que sea posible;
- separá claramente scripts de producción y scripts auxiliares;
- evitá estructuras que solo entiende quien las inventó;
- revisá `locations` con cuidado antes de cambiarla en un proyecto en marcha.

## Ejercicio práctico

1. Creá una estructura simple con una carpeta `migrations`.
2. Guardá allí dos migraciones versionadas.
3. Configurá `locations` para apuntar a esa carpeta.
4. Ejecutá `info` y `migrate`.
5. Después separá una migración repeatable en otra carpeta, por ejemplo `reporting`.
6. Agregá esa segunda ubicación a la configuración.
7. Volvé a correr `info`.
8. Anotá qué ventaja concreta te dio la nueva organización y si realmente valió la pena.

## Cierre

Cuando recién empezás con Flyway, una sola carpeta suele alcanzar.

Pero cuando el proyecto crece, `locations` te permite ordenar mejor el trabajo sin cambiar la lógica central del versionado.

La clave está en usar esa flexibilidad con criterio.

No se trata de crear estructuras sofisticadas porque sí.
Se trata de lograr que las migraciones sigan siendo fáciles de encontrar, de entender y de ejecutar con seguridad.
