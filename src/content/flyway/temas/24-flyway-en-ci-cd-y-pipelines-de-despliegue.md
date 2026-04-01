---
title: "Flyway en CI/CD y pipelines de despliegue"
description: "Cómo integrar Flyway en pipelines automáticos para validar migraciones, preparar despliegues y ejecutar cambios de base de datos de forma repetible."
order: 24
module: "Trabajo profesional con Flyway"
level: "intermedio"
draft: false
---

# Flyway en CI/CD y pipelines de despliegue

Hasta acá ya trabajaste con migraciones versionadas, repeatable, entornos, testing y bases efímeras. El paso natural ahora es llevar Flyway a un flujo de **automatización real**.

En un proyecto profesional, no alcanza con que las migraciones funcionen en tu máquina. También necesitás que se ejecuten de manera **repetible, controlada y auditable** dentro de un pipeline.

Eso es justamente lo que resuelve integrar Flyway en **CI/CD**.

## Objetivos del tema

Al finalizar este tema deberías poder:

- entender qué papel cumple Flyway dentro de un pipeline;
- distinguir entre validación en CI y despliegue en CD;
- automatizar la ejecución de `validate`, `info` y `migrate`;
- preparar un flujo más seguro para entornos como testing, aceptación y producción;
- evitar errores comunes al desplegar cambios de base de datos de forma automática.

## Qué significa usar Flyway en CI/CD

Usar Flyway en CI/CD significa que las migraciones dejan de ejecutarse de forma manual e informal, y pasan a ser parte del proceso automatizado del proyecto.

En vez de depender de que alguien recuerde correr scripts a mano, el pipeline puede encargarse de:

- obtener el código y las migraciones del repositorio;
- levantar o preparar una base temporal;
- validar que las migraciones tengan sentido;
- ejecutar las migraciones en un entorno controlado;
- correr pruebas;
- promover el cambio hacia ambientes superiores.

La idea central es simple: **la base de datos también forma parte del software que se entrega**.

## CI no es lo mismo que CD

Conviene separar bien estas dos etapas.

### Integración continua (CI)

En CI, Flyway se usa sobre todo para comprobar que el conjunto de migraciones sigue siendo sano.

Por ejemplo, el pipeline puede:

1. crear o limpiar una base de integración;
2. ejecutar `flyway migrate`;
3. ejecutar tests automáticos;
4. fallar rápido si algo no funciona.

Acá el objetivo principal es detectar problemas antes del merge o antes de preparar una release.

### Entrega o despliegue continuo (CD)

En CD, Flyway se usa para llevar esos cambios a ambientes reales o preproductivos.

Por ejemplo:

1. generar o revisar artefactos de despliegue;
2. aplicar migraciones en aceptación o staging;
3. validar el resultado;
4. ejecutar el despliegue en producción con controles adicionales.

Acá el foco no es solo validar, sino **entregar cambios con seguridad**.

## El pipeline como extensión del flujo que ya venís usando

Si lo pensás bien, no hay magia nueva. Solo estamos automatizando pasos que ya conocés:

- `info` para ver el estado;
- `validate` para detectar inconsistencias;
- `migrate` para aplicar cambios;
- eventualmente `repair`, pero solo cuando corresponde y con criterio.

Lo que cambia es el contexto: en lugar de correr estos comandos manualmente en tu terminal, pasan a ejecutarse dentro de un pipeline reproducible.

## Qué recomienda la documentación oficial para pipelines

La documentación actual de Flyway muestra ejemplos de pipelines basados en migraciones y explica que se puede desplegar usando **Flyway Command Line** o **Docker**, ejecutándolo en cualquier agente compatible con Windows, Linux o contenedores.

También presenta una secuencia de pipeline bastante representativa:

- una etapa de preparación;
- una etapa de build donde se limpia y migra una base de CI para validar que una base nueva pueda crearse correctamente;
- una etapa de tests;
- una etapa para preparar aceptación;
- una etapa de preparación de release;
- una compuerta de aprobación;
- y finalmente el despliegue a producción.

No significa que tengas que copiar exactamente ese flujo, pero sí te da una idea muy clara de cómo encaja Flyway en un proceso profesional.

## Lo primero: Flyway tiene que estar disponible en el agente

Para correr Flyway dentro de CI/CD, el agente del pipeline necesita poder ejecutarlo.

La documentación oficial actual menciona varias opciones:

- usar el contenedor Docker de Flyway;
- instalar la CLI en el agente;
- versionar los binarios descomprimidos dentro del repositorio;
- o instalarlo con un gestor de paquetes.

En la práctica, para muchos equipos el enfoque más limpio es uno de estos dos:

- **Docker**, si el pipeline ya trabaja bien con contenedores;
- **CLI instalada**, si el entorno del runner ya está bastante controlado.

## Por qué Docker suele ser una opción fuerte

Docker tiene una ventaja grande: te evita discutir demasiado sobre qué versión de Flyway está instalada en cada agente.

Si tu job usa una imagen concreta, tenés más consistencia entre ejecuciones.

Además, resulta muy cómodo para pipelines porque:

- no requiere una instalación manual larga en cada runner;
- hace más simple fijar una versión;
- ayuda a evitar diferencias entre máquinas.

## Qué secretos suele necesitar el pipeline

Un pipeline con Flyway normalmente necesita algunos datos sensibles, por ejemplo:

- URL de la base;
- usuario;
- contraseña;
- y, según el caso, tokens o credenciales adicionales.

La documentación oficial remarca que en CI/CD hay que pasar estas credenciales mediante mecanismos de secretos del sistema usado, y menciona soporte para algunos secret managers.

La regla práctica es clara: **no hardcodees secretos en el repositorio**.

## Un flujo mínimo y muy útil para CI

Antes de pensar en producción, hay un pipeline muy sencillo que ya aporta muchísimo valor.

Por ejemplo:

1. checkout del repositorio;
2. preparación de una base efímera o de CI;
3. `flyway validate`;
4. `flyway migrate`;
5. tests automáticos;
6. destrucción o reinicio del entorno.

Con solo eso ya conseguís algo importantísimo: comprobar de manera automática que una instalación nueva del proyecto puede levantarse correctamente.

## Ejemplo conceptual de job de validación

No importa demasiado si usás GitHub Actions, GitLab CI, Jenkins o Azure DevOps. La idea general puede verse así:

```bash
flyway -environment=ci validate
flyway -environment=ci migrate
flyway -environment=ci info
./run-tests.sh
```

En un curso base no hace falta casarse con una plataforma específica. Lo importante es entender el orden lógico.

## Dónde conviene usar `validate`

`validate` es especialmente útil al comienzo del pipeline.

Sirve para detectar rápido cosas como:

- checksums que cambiaron;
- migraciones faltantes o inconsistentes;
- desalineación entre el historial y el contenido actual del repositorio.

Eso evita avanzar con un despliegue cuando el proyecto ya está roto desde antes.

## Dónde conviene usar `info`

`info` no siempre es obligatorio, pero es muy útil para observabilidad.

Puede ayudarte a:

- ver qué migraciones están pendientes;
- confirmar qué se aplicó;
- dejar trazabilidad en los logs del pipeline.

En proyectos medianos o grandes, esa visibilidad vale mucho.

## `migrate` es el corazón del despliegue

Cuando llegás a la etapa de despliegue real, el comando central sigue siendo `migrate`.

Flyway aplica las migraciones pendientes en orden y, por defecto, ejecuta cada migración en su propia transacción, salvo que cambies ese comportamiento con configuraciones específicas como `group`.

Eso hace que el pipeline sea bastante directo: el job apunta al entorno correcto y ejecuta `migrate`.

## Qué pasa con bases existentes en ambientes superiores

No todos los entornos de destino nacen desde cero.

La documentación oficial indica que, si tus bases downstream ya existen y todavía no tienen historial de Flyway, primero puede ser necesario hacer **baseline** antes de empezar a desplegar migraciones mediante pipeline.

Esto es clave en migraciones de proyectos legacy o cuando Flyway se adopta sobre una base ya en uso.

## Un pipeline no debería empezar directamente por producción

Una práctica sana es promover los cambios por etapas.

Por ejemplo:

1. CI con base efímera;
2. integración o testing compartido;
3. aceptación o staging;
4. producción.

Cada entorno tiene un propósito distinto.

- **CI** valida que el historial funciona.
- **Staging/aceptación** ensaya el despliegue en condiciones parecidas a producción.
- **Producción** recibe solo cambios que ya pasaron por controles previos.

## La idea de "rehearsal" antes de producción

Uno de los puntos más interesantes de la documentación oficial es que propone ensayar el cambio en aceptación antes de tocar producción.

Eso puede incluir:

- generar reportes del cambio;
- revisar el script de despliegue;
- correr pruebas adicionales;
- e incluso revisar una estrategia de rollback.

Este enfoque reduce mucho el riesgo de “sorpresas” en producción.

## Approval gates y revisión humana

Aunque la automatización ayuda muchísimo, no todo tiene que ser 100% automático.

En muchos equipos, especialmente cuando la base de datos es crítica, conviene incluir una **compuerta de aprobación** antes del despliegue a producción.

Eso permite revisar:

- qué migraciones van a entrar;
- si hubo warnings importantes;
- si el ensayo en staging salió bien;
- si existe un plan de contingencia razonable.

Automatizar no significa eliminar el criterio humano. Significa usarlo en el momento correcto.

## Qué rol juega la estrategia de rollback

La documentación oficial recomienda pensar una estrategia de rollback dentro del pipeline.

Esto no quiere decir que siempre vayas a deshacer migraciones automáticamente. De hecho, muchas veces el rollback real de una base de datos requiere bastante criterio.

Pero sí conviene que el equipo tenga una estrategia para casos como:

- una migración que falla a mitad de despliegue;
- una release que necesita revertirse por comportamiento funcional;
- una corrección urgente posterior al despliegue.

En algunos casos eso puede ser una migración compensatoria. En otros, una restauración controlada. Lo importante es no improvisar en caliente.

## Error común: meter `clean` en un pipeline de producción

Uno de los errores más peligrosos es usar `clean` de manera liviana en automatización.

`clean` puede tener sentido en una base efímera de CI o testing. Pero llevar esa costumbre a un pipeline que apunte a ambientes persistentes es una muy mala idea.

La regla práctica del curso sigue intacta:

- `clean` puede tener lugar en tests y entornos descartables;
- **no** debería formar parte de un flujo de producción.

## Error común: mezclar ambientes por mala configuración

Otro error clásico es que el pipeline termine apuntando a la base incorrecta.

Por eso es tan importante:

- usar environments claros;
- separar bien secretos y configuraciones;
- evitar parámetros ambiguos;
- y revisar logs y nombres de entorno con mucho cuidado.

En Flyway, la automatización funciona muy bien, pero justamente por eso un error de configuración puede escalar rápido.

## Error común: usar `repair` como parche automático

En un pipeline serio, `repair` no debería ejecutarse como una reacción automática ante cualquier falla.

Si una migración falla, primero hay que entender qué ocurrió.

Usar `repair` sin analizar la causa puede dejar el historial prolijo “por afuera” mientras el estado real de la base sigue mal.

La automatización buena no oculta problemas: los hace visibles antes.

## Qué aporta Flyway a la trazabilidad

Integrar Flyway a CI/CD no solo automatiza. También mejora la trazabilidad.

Cada ejecución deja evidencia de:

- qué versión del repositorio se desplegó;
- qué migraciones se aplicaron;
- en qué entorno ocurrió;
- y en qué momento sucedió.

Eso vuelve mucho más profesional el manejo del cambio en base de datos.

## Un ejemplo conceptual de promoción entre ambientes

Podrías pensar un flujo así:

1. el desarrollador mergea a la rama principal;
2. el pipeline crea una base de CI y corre `validate` + `migrate` + tests;
3. si todo sale bien, se habilita el despliegue a staging;
4. en staging se ejecuta `migrate` contra una base persistente de ensayo;
5. el equipo revisa el resultado;
6. una aprobación manual habilita el paso a producción;
7. producción ejecuta `migrate` con la configuración del environment correcto.

No hace falta empezar con toda esta complejidad desde el día uno. Pero sí conviene entender hacia dónde crecer.

## Ejercicio recomendado

Tomá el proyecto del tema anterior y simulá un pipeline manual en tu máquina:

1. creá un environment `ci`;
2. configurá una base temporal o descartable;
3. ejecutá `flyway -environment=ci validate`;
4. ejecutá `flyway -environment=ci migrate`;
5. ejecutá `flyway -environment=ci info`;
6. corré una pequeña suite de pruebas o verificaciones;
7. repetí el proceso varias veces hasta que sea completamente confiable.

Después, llevá ese mismo flujo a un script de shell o a la plataforma de CI/CD que prefieras.

## Buenas prácticas

- empezá por automatizar validación y tests antes de automatizar producción;
- usá bases efímeras o descartables para CI;
- separá claramente environments, secretos y responsabilidades;
- registrá en logs el resultado de `info`, `validate` y `migrate` cuando tenga sentido;
- no ejecutes `repair` ni `clean` automáticamente en entornos sensibles;
- promové cambios entre ambientes, en lugar de saltar directo a producción.

## Resumen

Flyway encaja muy bien en CI/CD porque convierte la evolución de la base en un proceso **repetible, versionado y automatizable**.

En CI te ayuda a comprobar que una base puede reconstruirse y que las migraciones siguen siendo válidas. En CD te permite llevar esos cambios hacia entornos superiores con más control, trazabilidad y seguridad.

Cuando combinás environments claros, bases efímeras para validación, `validate`, `info`, `migrate` y una promoción ordenada entre ambientes, tu flujo de base de datos se vuelve mucho más profesional.

## Próximo tema

En el próximo tema vamos a ver **trabajo en equipo, ramas y conflictos entre migraciones**, para entender qué pasa cuando varias personas cambian la base al mismo tiempo.
