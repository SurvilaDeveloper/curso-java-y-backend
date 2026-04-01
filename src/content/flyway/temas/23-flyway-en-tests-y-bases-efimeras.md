---
title: "Flyway en tests y bases efímeras"
description: "Cómo usar Flyway en pruebas automáticas y entornos temporales para recrear bases desde cero de forma confiable y repetible."
order: 23
module: "Trabajo profesional con Flyway"
level: "intermedio"
draft: false
---

# Flyway en tests y bases efímeras

Hasta acá ya trabajaste con Flyway en desarrollo, en varios ambientes y con una configuración más profesional. El siguiente paso natural es llevarlo a un escenario muy importante: **las pruebas automáticas**.

En proyectos reales, no alcanza con decir que las migraciones “funcionan en mi máquina”. También necesitás comprobar que:

- una base vacía puede construirse desde cero;
- el conjunto completo de migraciones sigue siendo válido;
- los cambios nuevos no rompen pruebas existentes;
- el proyecto puede recrear ambientes temporales de manera confiable.

Ahí es donde Flyway encaja muy bien con **tests** y con **bases efímeras**.

## Objetivos del tema

Al finalizar este tema deberías poder:

- entender por qué conviene ejecutar Flyway dentro de pruebas automatizadas;
- distinguir entre una base persistente y una base efímera;
- recrear una base desde cero para validar migraciones;
- usar ambientes temporales para testing o validaciones;
- evitar falsas sensaciones de seguridad cuando una migración solo se probó sobre una base ya existente.

## Qué es una base efímera

Una **base efímera** es una base temporal que se crea para un objetivo concreto y luego se descarta.

Por ejemplo, puede usarse para:

- correr una suite de pruebas de integración;
- validar una rama antes de hacer merge;
- comprobar que todas las migraciones levantan el esquema desde cero;
- ensayar despliegues en un entorno transitorio.

La gran ventaja es que no arrastra “basura histórica” ni estados manuales acumulados. Cada ejecución empieza desde una situación conocida.

## Por qué Flyway aporta tanto en este escenario

Flyway está pensado justamente para reproducir el estado de una base a partir de migraciones versionadas y repeatable.

Eso significa que, si tu proyecto está bien mantenido, deberías poder hacer esto una y otra vez:

1. partir de una base vacía;
2. ejecutar `migrate`;
3. obtener siempre el mismo resultado estructural esperado.

Si eso no ocurre, hay una señal importante: tu historial de migraciones dejó de ser confiable.

## El valor real de probar desde cero

Muchos equipos prueban solo sobre bases que ya vienen evolucionando desde hace semanas o meses. Eso puede ocultar problemas como estos:

- una migración asume que una tabla ya existe, pero en realidad debería crearla;
- un script depende de datos cargados manualmente en otro momento;
- una repeatable dejó de reflejar correctamente el estado esperado;
- una migración vieja ya no funciona en una instalación nueva.

Cuando recreás la base desde cero, esos problemas aparecen mucho antes.

## Ambientes temporales en Flyway

La documentación actual de Flyway contempla explícitamente **temporary environments** para bases temporales usadas en validaciones, incluyendo bases de build o shadow databases.

Eso es importante porque confirma que este no es un uso “inventado” por el equipo: es un patrón reconocido dentro del flujo profesional de Flyway.

## Ejemplo conceptual de ambientes para testing

Podrías tener una configuración así:

```toml
[flyway]
locations = ["filesystem:sql"]

[environments.development]
url = "jdbc:postgresql://localhost:5432/app_dev"
user = "postgres"
password = "postgres"

[environments.test]
url = "jdbc:postgresql://localhost:5432/app_test"
user = "postgres"
password = "postgres"

[environments.integration]
url = "jdbc:postgresql://localhost:5432/app_integration"
user = "postgres"
password = "postgres"
```

La idea es simple:

- `development` para tu trabajo diario;
- `test` para pruebas más rápidas o locales;
- `integration` para validaciones más completas o automatizadas.

## Estrategia 1: una base de test persistente que se reinicia seguido

Una estrategia bastante común al empezar es tener una base fija de testing, por ejemplo `app_test`, y reiniciarla antes de cada conjunto de pruebas.

El flujo suele ser:

1. limpiar o recrear la base;
2. ejecutar `flyway migrate`;
3. correr los tests;
4. repetir cuando haga falta.

Es una estrategia sencilla y muy útil mientras el proyecto todavía no necesita entornos completamente dinámicos.

## Estrategia 2: una base nueva por ejecución

Un enfoque más robusto es crear una base nueva para cada ejecución o para cada pipeline.

Por ejemplo:

- `app_test_145`
- `app_test_branch_x`
- `app_test_ci_20260401`

En ese modelo, la base se crea, se migra, se usa y luego se destruye.

Esto reduce interferencias entre ejecuciones y mejora mucho la reproducibilidad.

## Provisioning y reprovisioning

La documentación actual de Flyway explica que es posible **provisionar** una base que todavía no existe antes de conectarse a ella, o incluso **reprovisionar** una base existente para devolverla a un estado conocido.

Esto es especialmente útil para escenarios de testing, validación o ambientes temporales.

La idea de fondo es potente: en vez de preparar la base manualmente, dejás que el flujo sea repetible.

## Qué significa reprovisionar

Reprovisionar es volver a un estado conocido.

Según el caso, eso puede significar:

- dejar la base vacía para volver a migrarla;
- recrearla desde una referencia controlada;
- usar una base temporal de validación que se reinicia cada vez.

En pruebas automáticas, esta capacidad ayuda a evitar estados contaminados por ejecuciones anteriores.

## Relación con `clean`

En algunos contextos de test, una forma de volver a un estado inicial es usar `clean` y luego `migrate`.

El patrón sería:

```bash
flyway -environment=test clean
flyway -environment=test migrate
```

Esto puede ser útil en desarrollo o en ambientes temporales bien controlados. Pero no hay que olvidar la regla central del curso: **`clean` no es para producción**.

En entornos de testing, sí puede formar parte de una estrategia razonable si tenés claro que la base puede destruirse sin riesgo.

## Un flujo muy útil: validar instalación nueva

Uno de los mejores usos de una base efímera es responder esta pregunta:

> “Si alguien clona el proyecto hoy y parte de una base vacía, ¿las migraciones levantan todo correctamente?”

Para eso alcanza con un flujo simple:

1. crear una base vacía temporal;
2. ejecutar `flyway migrate`;
3. opcionalmente correr `flyway info` y `flyway validate`;
4. ejecutar tests de integración;
5. destruir la base.

Si esto pasa de forma repetible, tu proyecto gana mucha solidez.

## Qué validar además del esquema

No todo tiene que ser “la tabla existe”. En pruebas con Flyway también conviene validar:

- que índices, constraints y claves foráneas se creen correctamente;
- que datos de referencia necesarios estén presentes;
- que vistas o funciones de repeatable migrations queden en el estado esperado;
- que el arranque de la aplicación funcione contra una base recién migrada.

Eso convierte a Flyway en parte real del proceso de calidad, y no solo en una herramienta de despliegue.

## El error clásico: confiar solo en una base vieja

Un error muy común es este:

- la app funciona en la base del desarrollador;
- las pruebas pasan contra una base ya armada hace tiempo;
- pero una instalación nueva falla.

Cuando eso pasa, muchas veces el problema no está en la aplicación sino en una migración que ya no reconstruye bien el sistema completo.

Por eso, probar desde cero no es un lujo: es una red de seguridad.

## Bases efímeras y CI/CD

Este tema también prepara el terreno para CI/CD.

En pipelines modernos, es muy habitual que un job:

1. levante una base temporal;
2. ejecute las migraciones;
3. corra validaciones y tests;
4. descarte ese entorno al terminar.

Si acostumbrás tu proyecto a este flujo desde temprano, después la integración con automatización resulta mucho más natural.

## Shadow databases y validaciones más avanzadas

La documentación de Flyway también menciona shadow databases dentro del trabajo con ambientes temporales y reprovisioning.

Aunque no todas las capacidades asociadas a shadow databases son necesarias para un curso base, es útil que te quede la idea: Flyway no solo piensa en una base de desarrollo y una de producción, sino también en bases auxiliares que sirven para cálculo, validación o generación de artefactos.

## Ejercicio recomendado

Armá un proyecto pequeño con estas migraciones:

- `V1__crear_tabla_clientes.sql`
- `V2__crear_tabla_productos.sql`
- `V3__crear_tabla_pedidos.sql`
- `R__vista_resumen_pedidos.sql`

Luego hacé este ejercicio:

1. configurá un environment `test`;
2. creá una base vacía para ese entorno;
3. ejecutá `flyway -environment=test migrate`;
4. verificá que todas las tablas y la vista existan;
5. corré `flyway -environment=test info`;
6. destruí o reiniciá la base;
7. repetí el proceso desde cero.

La meta no es solo que funcione una vez, sino que funcione **siempre**.

## Buenas prácticas

- probá regularmente tus migraciones sobre una base vacía;
- usá ambientes temporales para validaciones importantes;
- no dependas de estados manuales heredados;
- si usás `clean` en tests, hacelo solo sobre bases descartables y claramente separadas;
- incluí Flyway dentro de tus pruebas de integración y no solamente en despliegue.

## Resumen

Flyway brilla especialmente cuando lo usás para recrear bases desde cero y validar que tu historial de migraciones sigue siendo confiable.

Las **bases efímeras** y los **ambientes temporales** ayudan a detectar fallas que una base vieja puede esconder. Si combinás eso con `migrate`, `info`, `validate` y una estrategia clara de reprovisioning, conseguís un flujo mucho más sólido para desarrollo, testing y automatización.

## Próximo tema

En el próximo tema vamos a ver **Flyway en CI/CD**, para llevar este mismo enfoque a pipelines automáticos de integración y entrega.
