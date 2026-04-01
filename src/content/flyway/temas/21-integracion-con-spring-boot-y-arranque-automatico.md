---
title: "Integración con Spring Boot y arranque automático"
description: "Cómo integrar Flyway en una aplicación Spring Boot para ejecutar migraciones automáticamente al iniciar la app."
order: 21
module: "Integraciones y automatización"
level: "intermedio"
draft: false
---

# Integración con Spring Boot y arranque automático

Hasta ahora trabajaste con Flyway desde CLI, Maven y Gradle. En muchos proyectos reales, sin embargo, Flyway también se integra directamente con la aplicación para que las migraciones se ejecuten al iniciar el sistema.

Esa integración es especialmente común en **Spring Boot**, porque te permite levantar la aplicación y dejar la base de datos en el estado correcto sin pasos manuales adicionales.

## Objetivos del tema

Al finalizar este tema deberías poder:

- integrar Flyway dentro de una aplicación Spring Boot;
- entender cuándo Spring Boot ejecuta las migraciones;
- ubicar correctamente los scripts SQL;
- configurar propiedades básicas;
- reconocer cuándo conviene este enfoque y cuándo es mejor migrar fuera del arranque de la app.

## Qué aporta Spring Boot en este escenario

Spring Boot detecta automáticamente ciertas librerías en el classpath y configura componentes en función de eso. Si Flyway está presente y la aplicación tiene un `DataSource` válido, Spring Boot puede ejecutar las migraciones al iniciar.

La idea general es esta:

1. la aplicación arranca;
2. Spring Boot crea el `DataSource`;
3. Flyway inspecciona las migraciones disponibles;
4. se aplican las pendientes;
5. recién después la aplicación continúa con el arranque normal.

Esto hace muy cómodo el desarrollo local y también simplifica bastante los entornos de testing.

## Dependencia necesaria

En un proyecto Maven podés agregar Flyway así:

```xml
<dependency>
  <groupId>org.flywaydb</groupId>
  <artifactId>flyway-core</artifactId>
</dependency>
```

Si ya venís trabajando con PostgreSQL, probablemente además tengas algo como esto:

```xml
<dependency>
  <groupId>org.postgresql</groupId>
  <artifactId>postgresql</artifactId>
  <scope>runtime</scope>
</dependency>
```

## Ubicación de las migraciones

En una app Spring Boot, lo más habitual es dejar los scripts acá:

```text
src/main/resources/db/migration
```

Por ejemplo:

```text
src/main/resources/db/migration/
  V1__crear_tabla_clientes.sql
  V2__agregar_email_a_clientes.sql
  V3__crear_tabla_pedidos.sql
```

Con esa ubicación, Flyway las descubre automáticamente sin configuración extra.

## Configuración mínima

Un `application.yml` simple podría quedar así:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/flyway_demo
    username: postgres
    password: postgres
  flyway:
    enabled: true
```

Y si preferís `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/flyway_demo
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.flyway.enabled=true
```

En muchos casos ni siquiera hace falta declarar `spring.flyway.enabled=true`, porque ya viene habilitado cuando Flyway está presente. Aun así, escribirlo explícitamente puede ayudarte a dejar clara la intención del proyecto.

## Primer ejemplo práctico

Supongamos que creás el archivo:

```sql
-- src/main/resources/db/migration/V1__crear_tabla_productos.sql
CREATE TABLE productos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    precio NUMERIC(12,2) NOT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

Cuando arrancás la aplicación, Flyway debería:

- crear `flyway_schema_history` si todavía no existe;
- detectar `V1__crear_tabla_productos.sql`;
- ejecutar la migración;
- registrar que esa versión ya fue aplicada.

Después de eso, si volvés a iniciar la app, esa migración **no** se ejecutará otra vez.

## Cambiar la ubicación de las migraciones

Si querés usar otra carpeta, podés configurarlo así:

```yaml
spring:
  flyway:
    locations: classpath:database/migrations
```

O incluso varias ubicaciones:

```yaml
spring:
  flyway:
    locations:
      - classpath:db/migration
      - classpath:db/seed
```

Esto puede servir cuando querés separar migraciones estructurales de otros scripts relacionados.

## Propiedades útiles

Algunas propiedades que te conviene conocer:

```yaml
spring:
  flyway:
    enabled: true
    baseline-on-migrate: false
    validate-on-migrate: true
    clean-disabled: true
    locations: classpath:db/migration
```

### Qué significan

- `enabled`: activa o desactiva Flyway en el arranque.
- `baseline-on-migrate`: puede baselinar automáticamente una base existente.
- `validate-on-migrate`: valida antes de migrar.
- `clean-disabled`: protege contra limpiezas accidentales.
- `locations`: indica dónde buscar migraciones.

## Cuándo conviene este enfoque

Integrar Flyway al arranque de Spring Boot suele ser una muy buena idea en:

- proyectos pequeños y medianos;
- desarrollo local;
- testing automatizado;
- demos internas;
- aplicaciones donde el mismo despliegue de la app controla la evolución de la base.

## Cuándo hay que pensarlo mejor

En sistemas más grandes, no siempre conviene que la aplicación migre automáticamente al iniciar. Por ejemplo:

- si hay múltiples instancias arrancando al mismo tiempo;
- si la ventana de despliegue requiere control manual;
- si las migraciones son delicadas o muy pesadas;
- si el equipo separa estrictamente despliegue de aplicación y despliegue de base de datos.

En esos casos, muchas veces se ejecuta Flyway en un paso separado del pipeline.

## Personalización avanzada

Spring Boot te deja intervenir el comportamiento por código.

### Estrategia de migración

Podés definir una estrategia personalizada:

```java
@Bean
public FlywayMigrationStrategy flywayMigrationStrategy() {
    return flyway -> {
        flyway.repair();
        flyway.migrate();
    };
}
```

Esto te da más control, aunque hay que usarlo con criterio. Por ejemplo, hacer `repair()` automáticamente en todos los arranques no suele ser una buena práctica en entornos serios.

### Customización de configuración

También podés personalizar Flyway con un bean:

```java
@Bean
public FlywayConfigurationCustomizer flywayConfigurationCustomizer() {
    return configuration -> configuration.baselineOnMigrate(false);
}
```

Este enfoque sirve cuando necesitás ajustar detalles finos que no querés dejar solo en propiedades.

## Ver el estado con Actuator

Si usás Spring Boot Actuator, podés inspeccionar el estado de las migraciones desde un endpoint.

Eso es muy útil para observabilidad y diagnóstico, sobre todo en entornos donde necesitás confirmar rápidamente qué versiones se aplicaron.

## Error común: mezclar inicialización manual y Flyway

Cuando un proyecto usa Flyway, conviene que la evolución de esquema quede centralizada allí.

Un error frecuente es mezclar:

- scripts automáticos de inicialización,
- generación de esquema desde JPA/Hibernate,
- y migraciones de Flyway.

Eso puede producir diferencias entre entornos, orden incierto de ejecución o cambios que nadie sabe exactamente de dónde salieron.

## Ejercicio recomendado

Creá una aplicación Spring Boot mínima con PostgreSQL y hacé esto:

1. configurá el `DataSource`;
2. agregá `flyway-core`;
3. creá `V1__crear_tabla_categorias.sql`;
4. levantá la aplicación;
5. verificá que se creó la tabla;
6. agregá `V2__agregar_columna_descripcion.sql`;
7. reiniciá la app;
8. comprobá que Flyway solo ejecutó la nueva migración.

## Buenas prácticas

- mantené las migraciones en `src/main/resources/db/migration` salvo que tengas un motivo real para cambiarlo;
- no modifiques migraciones ya aplicadas;
- usá `validate` como parte del flujo habitual;
- evitá depender de generación automática de esquema si Flyway es la fuente de verdad;
- para producción, evaluá si querés migrar en el arranque o en un paso separado.

## Resumen

Spring Boot y Flyway se integran muy bien. Con una dependencia, un `DataSource` y una carpeta de migraciones, podés lograr que la aplicación arranque con la base lista y versionada.

Es una solución muy cómoda y profesional, siempre que entiendas el flujo y no la uses de forma automática en contextos donde el control del despliegue necesita ser más estricto.

## Próximo tema

En el próximo tema vamos a ver **Flyway en tests y bases efímeras**, para aprovechar migraciones automáticas en pruebas de integración y entornos temporales.
