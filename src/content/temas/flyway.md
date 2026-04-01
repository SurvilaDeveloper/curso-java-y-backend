---
title: "Flyway"
description: "Qué es Flyway, por qué las migraciones importan tanto y cómo versionar cambios de base de datos de forma más segura en proyectos Java y Spring Boot."
order: 49
module: "Persistencia profesional"
level: "intermedio"
draft: false
---

## Introducción

Hasta ahora ya trabajaste bastante la parte de persistencia y backend real:

- repository
- JPA
- Hibernate
- consultas
- DTOs
- MapStruct
- testing
- despliegue
- Docker

Eso ya te permite construir una aplicación bastante seria.

Pero cuando un proyecto empieza a crecer, aparece una pregunta muy importante:

**¿cómo manejás los cambios de la base de datos a lo largo del tiempo?**

Por ejemplo:

- agregar una tabla nueva
- sumar una columna
- cambiar una restricción
- insertar datos iniciales
- corregir un esquema viejo
- mantener consistencia entre entornos

Ahí entra Flyway.

## Qué es Flyway

Flyway es una herramienta de migraciones de base de datos.

Dicho simple:

te permite versionar y ejecutar cambios del esquema de la base de forma ordenada y controlada.

## La idea general

Un proyecto real no tiene una base estática para siempre.

Con el tiempo necesitás cambiar cosas como:

- tablas
- columnas
- índices
- constraints
- datos semilla
- relaciones

Si esos cambios se hacen “a mano”, sin orden ni historial, el proyecto se vuelve mucho más frágil.

Flyway resuelve justamente eso.

## Qué problema resuelve

Sin migraciones controladas, suelen aparecer problemas como:

- “en mi máquina la base está distinta”
- staging tiene una tabla diferente
- producción no tiene la última columna
- alguien hizo cambios manuales sin dejar registro
- no queda claro en qué orden aplicar cambios
- es difícil reconstruir una base desde cero

Flyway ayuda a convertir esos cambios en algo:

- versionado
- repetible
- explícito
- trazable

## Por qué esto importa tanto

La base de datos no debería evolucionar de forma improvisada.

Si el código cambia y la base también cambia, necesitás que ambos evolucionen con cierto orden.

Eso es especialmente importante cuando:

- trabajás en equipo
- tenés varios entornos
- desplegás varias veces
- querés reproducir el sistema desde cero
- querés reducir riesgo al cambiar esquema

## La idea de migración

Una migración es un cambio versionado sobre la base de datos.

Por ejemplo:

- crear tabla `users`
- crear tabla `products`
- agregar columna `active` a `products`
- crear índice en `email`
- insertar roles iniciales

Cada uno de esos pasos puede vivir en un archivo versionado.

## Cómo piensa Flyway

Flyway trabaja con archivos de migración ordenados por versión.

Por ejemplo:

```text
V1__create_users_table.sql
V2__create_products_table.sql
V3__add_active_column_to_products.sql
V4__insert_default_roles.sql
```

## Qué expresa ese nombre

Normalmente:

- `V` indica versión
- el número indica el orden
- luego viene una descripción legible

Eso permite saber claramente qué cambio vino antes y cuál después.

## Qué hace Flyway con eso

Flyway lleva registro de qué migraciones ya fueron ejecutadas sobre una base.

Entonces, cuando la aplicación arranca o cuando ejecutás Flyway, puede aplicar solo las migraciones que faltan.

## Por qué eso es tan valioso

Porque te evita tener que preguntarte a mano:

- “¿esta base ya tiene la tabla nueva?”
- “¿ya se aplicó el índice?”
- “¿esta columna existe o no?”
- “¿qué script había que correr antes?”

Flyway se encarga de mantener ese historial.

## Flyway y Spring Boot

Flyway se integra muy bien con Spring Boot.

En un proyecto típico, agregás la dependencia, definís migraciones y Flyway puede correrlas automáticamente al arrancar la aplicación.

Eso hace muy natural incorporar migraciones al flujo real del backend.

## Dependencia típica

En Maven, suele agregarse algo como:

```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
```

## Dónde van las migraciones

En una configuración típica de Spring Boot, Flyway busca migraciones en una ruta como:

```text
src/main/resources/db/migration
```

Entonces podrías tener:

```text
src/main/resources/db/migration/V1__create_users_table.sql
src/main/resources/db/migration/V2__create_products_table.sql
src/main/resources/db/migration/V3__add_active_column.sql
```

## Ejemplo simple de migración

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);
```

Guardada como:

```text
V1__create_users_table.sql
```

## Qué pasa después

Cuando Flyway corre sobre una base vacía, aplica esa migración y deja registrado que `V1` ya fue ejecutada.

## Segunda migración

```sql
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);
```

Guardada como:

```text
V2__create_products_table.sql
```

## Qué va logrando esto

Va construyendo la base paso a paso, de manera explícita.

Eso permite reconstruir el esquema desde cero siguiendo un historial claro.

## Flyway y tabla de historial

Internamente, Flyway mantiene una tabla donde registra qué migraciones fueron aplicadas.

No hace falta memorizar todos los detalles ahora, pero sí entender que Flyway no trabaja “a ciegas”.

Lleva control del historial de ejecución.

## Por qué es mejor que cambios manuales dispersos

Porque con cambios manuales:

- se pierde trazabilidad
- se generan diferencias entre entornos
- cuesta reproducir el estado correcto
- aumenta el riesgo al desplegar

Con Flyway, el cambio queda:

- escrito
- versionado
- ordenado
- repetible

## Relación con `ddl-auto`

En etapas iniciales quizá usaste algo como:

```properties
spring.jpa.hibernate.ddl-auto=update
```

Eso puede ser cómodo para aprender o arrancar, pero en proyectos más serios conviene entender sus límites.

## Qué problema tiene depender solo de `ddl-auto`

Puede resultar poco controlado para la evolución real del esquema.

Por ejemplo:

- no deja una historia clara de cambios
- no expresa bien intención
- puede comportarse de forma no ideal entre entornos
- no reemplaza una estrategia profesional de migraciones

## Por eso aparece Flyway

Flyway profesionaliza el cambio del esquema.

En vez de “que el ORM vaya ajustando cosas como pueda”, pasás a tener scripts explícitos y versionados.

## Qué se suele migrar con Flyway

No solo tablas.

También cosas como:

- columnas nuevas
- constraints
- índices
- tablas puente
- datos iniciales
- correcciones estructurales

## Migraciones de datos semilla

A veces también necesitás insertar datos básicos del sistema.

Por ejemplo:

- roles iniciales
- categorías base
- configuración mínima
- valores de referencia

Ejemplo:

```sql
INSERT INTO roles (name) VALUES ('USER');
INSERT INTO roles (name) VALUES ('ADMIN');
```

Eso podría ir en una migración si forma parte del estado mínimo esperado del sistema.

## Cuándo usar migraciones SQL

Una práctica muy común y muy sana es usar migraciones SQL explícitas.

¿Por qué?
Porque son claras, trazables y te obligan a pensar el modelo relacional con intención.

## Ventaja de SQL explícito

Te mantiene cerca de la realidad de la base.

Y eso conecta muy bien con algo importante que ya viste:

aunque uses JPA e Hibernate, sigue siendo valioso entender SQL y el modelo relacional.

## Orden de migraciones

El orden importa mucho.

Por ejemplo:

1. primero crear tabla `users`
2. después crear tabla `orders`
3. después crear `order_items`
4. después insertar datos iniciales si corresponde

No podés referenciar algo que todavía no existe.

Por eso la secuencia de migraciones tiene tanto valor.

## Ejemplo un poco más realista

### `V1__create_users_table.sql`

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);
```

### `V2__create_products_table.sql`

```sql
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);
```

### `V3__create_orders_table.sql`

```sql
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Qué muestra este ejemplo

Que las migraciones pueden ir construyendo el modelo relacional de forma incremental y entendible.

## Migraciones y trabajo en equipo

Cuando trabajás con otras personas, Flyway se vuelve todavía más valioso.

Porque permite que todos compartan una historia explícita de cambios de base.

Eso reduce muchísimo el caos típico de:

- “yo hice este cambio local”
- “en mi base sí existe esa columna”
- “en staging no está”
- “producción quedó vieja”

## Migraciones y entornos

Flyway también ayuda mucho a mantener consistencia entre:

- desarrollo
- testing
- staging
- producción

No garantiza magia total, pero sí da una base muchísimo más seria para alinear esquema entre entornos.

## Qué no conviene hacer

No conviene mezclar:

- cambios manuales silenciosos en producción
- cambios automáticos ambiguos del ORM
- scripts sueltos sin historial
- migraciones desordenadas o renombradas después de ejecutadas

La disciplina con migraciones importa bastante.

## Renombrar migraciones ya aplicadas

Esto suele ser mala idea.

Una vez que una migración fue aplicada y forma parte del historial, cambiarla sin criterio puede traer problemas de consistencia.

Por eso conviene tratarlas con bastante cuidado.

## Flyway y reconstrucción desde cero

Una gran ventaja de un proyecto bien migrado es que, en teoría, alguien podría tomar la base vacía y reconstruir el esquema completo ejecutando las migraciones en orden.

Eso es una señal muy fuerte de madurez del proyecto.

## Migrations + entidades JPA

Flyway y JPA no compiten.
Se complementan.

Podés pensar algo así:

- JPA / Hibernate → mapeo y persistencia del día a día
- Flyway → evolución controlada del esquema

Ambos cumplen roles distintos y muy valiosos.

## Cómo encaja esto con entidades y repositories

Vos seguís teniendo:

- entidades JPA
- repositories
- services
- controllers

La diferencia es que el esquema que sostiene esas entidades deja de depender solo de evolución implícita y pasa a estar versionado explícitamente.

## Flyway en despliegue

Flyway también se conecta muy fuerte con despliegue.

Porque cuando llevás una aplicación a otro entorno, no solo desplegás código.
También necesitás que la base esté en el estado correcto.

Ahí las migraciones son fundamentales.

## Buen flujo mental

Un flujo sano suele ser algo así:

1. cambiás el modelo que necesita evolucionar
2. escribís migración correspondiente
3. ajustás entidades si hace falta
4. corrés tests
5. desplegás
6. la base evoluciona con orden

## Flyway no reemplaza diseño de base

También conviene decir esto.

Flyway ayuda a gestionar cambios, pero no diseña bien por vos el modelo relacional.

Sigue siendo importante pensar:

- tablas
- claves
- constraints
- relaciones
- índices
- tipos de datos

## Qué gana tu proyecto al usarlo

Un proyecto que usa Flyway razonablemente bien suele ganar:

- más trazabilidad
- más reproducibilidad
- menos improvisación
- más orden entre código y base
- mejor despliegue
- mejor trabajo en equipo

## Integración conceptual con Docker

Si ya venís usando Docker, Flyway también encaja muy bien ahí.

Porque si querés levantar una app con una base desde cero, las migraciones ayudan a que el esquema se prepare automáticamente de forma más controlada.

Eso hace el entorno mucho más portable y más consistente.

## Buenas prácticas iniciales

## 1. Preferir migraciones explícitas y claras

Que el archivo cuente bien qué cambio introduce.

## 2. Mantener nombres descriptivos

Ejemplo:
`V4__add_status_column_to_orders.sql`

## 3. No depender ciegamente de `ddl-auto=update` en proyectos serios

Conviene tener más control.

## 4. No modificar migraciones viejas ya ejecutadas sin criterio

Eso puede romper consistencia.

## 5. Pensar también datos iniciales importantes

No solo estructura.

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede recordarte a herramientas de migración de esquema usadas con ORMs o query builders. En Java y Spring Boot, Flyway cumple ese papel de forma muy fuerte y muy habitual en proyectos profesionales.

### Si venís de Python

Puede hacerte pensar en herramientas de migración de base como parte del ciclo normal del proyecto. En Java, Flyway se volvió una opción muy popular porque se integra bien con Spring Boot y encaja muy bien en flujos de despliegue serios.

## Errores comunes

### 1. Dejar que el esquema cambie sin historial

Eso se vuelve inmanejable con el tiempo.

### 2. Confiar demasiado en cambios automáticos del ORM

Ayudan, pero no reemplazan migraciones versionadas.

### 3. No pensar el orden de las migraciones

Eso rompe fácilmente relaciones y dependencias.

### 4. Mezclar cambios manuales sueltos con migraciones formales

Eso genera entornos inconsistentes.

### 5. Tratar migraciones como algo secundario

En proyectos reales son una parte muy importante de la salud del backend.

## Mini ejercicio

Diseñá las primeras migraciones de una API simple que tenga:

- usuarios
- productos
- órdenes

Intentá escribir conceptualmente:

1. `V1__create_users_table.sql`
2. `V2__create_products_table.sql`
3. `V3__create_orders_table.sql`
4. una migración extra para agregar una columna o insertar datos semilla

## Ejemplo posible

- `V1__create_users_table.sql`
- `V2__create_products_table.sql`
- `V3__create_orders_table.sql`
- `V4__insert_default_roles.sql`

## Resumen

En esta lección viste que:

- Flyway es una herramienta de migraciones de base de datos
- ayuda a versionar y ejecutar cambios de esquema de forma controlada
- resuelve muchos problemas típicos de evolución de base entre entornos
- se integra muy bien con Spring Boot
- complementa a JPA e Hibernate en lugar de reemplazarlos
- profesionaliza mucho la parte de persistencia y despliegue de un proyecto real

## Siguiente tema

La siguiente natural es **paginación y ordenamiento**, porque después de profesionalizar bastante persistencia, DTOs y migraciones, el siguiente paso muy útil para APIs reales es aprender a servir datos grandes de forma más controlada y eficiente.
