---
title: "Estrategias para desarrollo, testing y producción"
description: "Cómo adaptar el uso de Flyway según el ambiente, qué conviene hacer en desarrollo, qué validar en testing y cómo preparar un despliegue mucho más seguro en producción."
order: 26
module: "Trabajo profesional con Flyway"
level: "intermedio"
draft: false
---

# Estrategias para desarrollo, testing y producción

A medida que un proyecto crece, Flyway deja de ser solo una herramienta para correr scripts y pasa a ser parte de una estrategia mucho más amplia.

No trabajás igual en una base de desarrollo que en una base de testing. Y, por supuesto, no deberías tratar producción como si fuera un entorno cualquiera.

Por eso, además de aprender comandos, hace falta entender **cómo cambia el uso de Flyway según el ambiente**.

Ese es el foco de este tema.

## Objetivos del tema

Al finalizar este tema deberías poder:

- distinguir qué rol cumple Flyway en desarrollo, testing y producción;
- entender por qué cada ambiente necesita reglas distintas;
- decidir qué prácticas son razonables en desarrollo y cuáles no deberían llegar a producción;
- preparar un flujo más seguro entre ambientes;
- reducir errores típicos al promover migraciones hacia entornos reales.

## El mismo proyecto, distintos objetivos

Aunque uses la misma base de código y las mismas migraciones, cada ambiente tiene un propósito diferente.

### Desarrollo

En desarrollo, el objetivo principal es **iterar rápido**.

Querés poder:

- crear nuevas migraciones;
- probar cambios de esquema;
- detectar errores temprano;
- rehacer una base local si hace falta;
- cambiar de rama y volver a un estado razonable.

### Testing / QA / UAT

En testing, el objetivo ya no es solo avanzar rápido, sino **verificar que el conjunto funciona**.

Acá suele importar más:

- validar que todas las migraciones se apliquen correctamente;
- correr pruebas automáticas;
- comprobar que el esquema final sea el esperado;
- ensayar despliegues sobre una base más parecida a la real.

### Producción

En producción, el objetivo central es **cambiar lo mínimo necesario con la máxima seguridad posible**.

Acá pesa mucho más:

- la previsibilidad;
- la trazabilidad;
- el control de riesgos;
- el tiempo de ejecución;
- y la confianza en que el despliegue ya fue ensayado antes.

## Qué dice Flyway sobre los ambientes

La documentación oficial actual define un **environment** como un conjunto de propiedades asociadas para conectarse a una base de datos.

Eso permite modelar ambientes como:

- `development`;
- `test`;
- `staging`;
- `production`;
- e incluso ambientes temporales de build o shadow.

En otras palabras, Flyway ya parte de una idea importante: **no existe un único destino universal para las migraciones**. Existen varios, y cada uno cumple una función dentro del pipeline.

## Desarrollo: el ambiente donde más aprendés y más te equivocás

El ambiente de desarrollo es el más flexible de todos.

Ahí es donde normalmente:

- escribís nuevas migraciones versionadas;
- corregís errores antes de compartir el cambio;
- agregás datos semilla o de prueba cuando corresponde;
- validás que una idea funciona;
- y entendés si el modelo evoluciona como esperabas.

Eso sí: flexible no significa caótico.

Si en desarrollo trabajás de cualquier manera, el problema se traslada después a testing y finalmente a producción.

## Qué conviene hacer en desarrollo

En un flujo sano, en desarrollo suele convenir:

- crear migraciones chicas y claras;
- correr `validate` seguido;
- probar `migrate` desde una base limpia cada tanto;
- usar una base local o aislada por desarrollador;
- y evitar arreglos manuales que después no queden representados en una migración.

La regla de fondo es simple: **lo que cambies en la base debería quedar expresado en el historial de Flyway**.

## Un problema muy común en desarrollo: la base local queda vieja

Con Flyway, cambiar de rama en Git no cambia automáticamente el estado de tu base local.

Eso significa que podés tener una rama nueva con migraciones distintas, pero seguir conectado a una base que ya refleja el estado de otra rama.

La documentación actual de Flyway contempla esto al hablar de provisioning y re-provisioning: un ambiente puede resetearse o recrearse para volver a un estado conocido.

Traducido a la práctica, esto lleva a una decisión importante:

- o usás una base distinta según el contexto de trabajo;
- o asumís que, al cambiar de rama, a veces vas a tener que reprovisionar o reconstruir tu base local.

## Desarrollo no es un ensayo de improvisación permanente

Hay cosas que en desarrollo podés hacer y que en ambientes superiores no deberían pasar con naturalidad.

Por ejemplo:

- limpiar una base local y reconstruirla desde cero;
- descartar datos de prueba;
- reprovisionar para volver a un estado consistente;
- probar migraciones incompletas antes de dejarlas listas.

Eso tiene sentido en desarrollo porque el costo de equivocarte es bajo.

Pero esa libertad no debería confundirse con una excusa para editar migraciones ya aplicadas en ambientes compartidos o para depender de arreglos manuales que nadie más conoce.

## Testing: donde las migraciones dejan de ser “mi cambio” y pasan a ser “el cambio del sistema”

En testing, el foco cambia.

Ya no alcanza con que la migración funcione en tu base local. Ahora importa si el conjunto completo del proyecto puede:

- instalarse desde cero;
- actualizarse desde un estado previo;
- convivir con el código de aplicación;
- y pasar pruebas con un esquema realista.

Por eso testing suele ser el lugar donde Flyway gana más valor profesional.

## Qué conviene validar en testing

En un buen ambiente de test, Flyway suele usarse para confirmar cosas como estas:

- que una base vacía puede construirse completamente;
- que no hay errores de orden ni dependencias ocultas entre migraciones;
- que el código de la aplicación sigue funcionando con el esquema resultante;
- que ciertas correcciones de datos no rompen comportamiento existente;
- que el tiempo de ejecución del despliegue sigue siendo razonable.

La propia documentación de Redgate insiste bastante en la idea de probar migraciones en CI y de ejecutarlas de principio a fin sobre bases vacías o preparadas para validación.

## Bases efímeras, build databases y shadow databases

La documentación oficial actual menciona explícitamente ambientes temporales usados en validación, como **build databases** o **shadow databases**.

La idea es muy potente: en vez de confiar en una base compartida medio contaminada por pruebas viejas, levantás un entorno controlado para verificar el comportamiento real del historial.

Eso te da varias ventajas:

- repetibilidad;
- menos interferencia entre pruebas;
- detección más clara de fallos;
- y mayor confianza antes de promover cambios.

## Testing no debería alejarse demasiado de producción

Acá hay una enseñanza muy importante.

La documentación oficial sobre despliegue y trabajo con datos recomienda que exista un entorno de **staging o pre-producción** lo más parecido posible a producción.

¿Por qué?

Porque si en testing corrés un conjunto de scripts diferente, con otros datos, otras reglas o una estructura demasiado artificial, podés terminar validando algo que **no representa el despliegue real**.

En otras palabras: no alcanza con “tener un ambiente de test”. También importa **qué tan parecido es al destino real**.

## Cuidado con los scripts distintos por ambiente

Flyway permite varias estrategias para tratar datos o comportamientos distintos según ambiente.

La documentación menciona opciones como:

- carpetas diferentes para distintos targets;
- placeholders;
- script configuration files;
- deploy rules;
- proyectos separados para core, test o prod.

Todo eso puede ser útil.

Pero también trae una advertencia muy valiosa: **si ejecutás scripts distintos según el ambiente, entonces no estás probando exactamente el mismo despliegue que llegará a producción**.

Esa frase sola ya justifica muchísimo criterio de diseño.

## Entonces, ¿nunca conviene separar comportamiento por ambiente?

No. A veces sí conviene.

Por ejemplo:

- datos de prueba que solo tienen sentido en test;
- configuraciones auxiliares que no deberían existir en producción;
- casos donde necesitás estructuras de apoyo temporales para pruebas;
- o clientes/targets con diferencias muy específicas.

El punto no es prohibirlo, sino hacerlo con conciencia.

Cada vez que separás scripts por ambiente, tenés que preguntarte:

- ¿estoy agregando claridad o complejidad?
- ¿esto reduce riesgo o lo disfraza?
- ¿cómo verifico luego el camino real hacia producción?

## Producción: menos libertad, más disciplina

Producción no es el lugar para experimentar.

En producción, Flyway debería entrar cuando ya tenés bastante claro:

- qué migraciones están pendientes;
- cuánto podrían tardar;
- si fueron probadas antes;
- qué impacto tienen sobre los datos y sobre el código;
- y qué harías si algo no sale como esperabas.

Por eso producción exige un uso mucho más conservador de la herramienta.

## Qué conviene hacer antes de tocar producción

La documentación oficial sobre automatización propone una secuencia bastante razonable:

1. obtener scripts desde control de versiones;
2. construir, analizar y testear cambios en CI;
3. desplegar en ambientes de test si hace falta;
4. desplegar en staging o pre-producción;
5. revisar el cambio antes de pasar a producción;
6. verificar drift cuando aplica;
7. y recién entonces desplegar a producción.

Aunque no uses todas las capacidades avanzadas, la idea general es clarísima: **producción no debería ser el primer lugar donde descubrís si una migración funciona**.

## Staging como ensayo general

Uno de los ambientes más valiosos en una estrategia profesional es staging.

No porque sea “otro ambiente más”, sino porque sirve como ensayo general.

Ahí podés observar:

- si el despliegue tarda demasiado;
- si una migración de datos es pesada;
- si hay incompatibilidades que no aparecieron en desarrollo;
- si la aplicación y la base siguen sincronizadas;
- y si la forma de desplegar se siente realmente segura.

Cuanto más se parezca staging a producción, más útil va a ser ese ensayo.

## Drift: cuando producción se aleja del historial esperado

Otro concepto muy importante en entornos reales es el **drift**.

La documentación actual de Flyway lo menciona al hablar de despliegues profesionales: conviene comprobar que producción no haya recibido cambios manuales por fuera del flujo esperado.

Eso puede pasar, por ejemplo, cuando alguien:

- aplica un hotfix directo en la base;
- ejecuta un script manual fuera del pipeline;
- crea o modifica objetos sin dejar rastro en el proyecto.

El problema no es solo “romper una regla”. El problema es que el historial deja de representar exactamente la realidad del ambiente.

## Qué cosas son razonables en cada ambiente

Una forma simple de pensar esto es así:

### En desarrollo

Suele ser razonable:

- reprovisionar;
- limpiar una base local;
- volver a correr desde cero;
- experimentar con migraciones antes de compartirlas.

### En testing

Suele ser razonable:

- construir bases efímeras;
- correr migraciones automáticas en CI;
- hacer smoke tests, integración y regresión;
- probar caminos completos de despliegue.

### En producción

Suele ser razonable:

- aplicar solo migraciones ya revisadas;
- hacerlo desde un pipeline controlado;
- minimizar cambios manuales;
- usar staging como ensayo previo;
- registrar claramente qué se ejecutó y cuándo.

## Qué errores aparecen cuando no distinguís ambientes

Muchísimos problemas típicos nacen de mezclar mentalmente todos los entornos como si fueran lo mismo.

Por ejemplo:

- tratar producción como una base más de pruebas;
- depender en testing de datos locales armados a mano;
- usar en desarrollo una base tan sucia que ya no representa nada;
- o tener scripts especiales por ambiente sin entender el costo de esa divergencia.

Cuando no diferenciás objetivos, el flujo entero se vuelve más frágil.

## Un flujo práctico y sano

Una estrategia razonable para muchos proyectos podría verse así:

1. en desarrollo, cada persona trabaja con su base local o aislada;
2. valida y prueba sus migraciones;
3. CI levanta una base efímera y ejecuta el historial completo;
4. el cambio pasa a un entorno de test o QA;
5. luego se ensaya en staging o pre-producción;
6. recién después se promueve a producción.

No es la única estrategia posible, pero sí una muy sólida para empezar.

## Ejemplo conceptual de ambientes en `flyway.toml`

```toml
[environments.development]
url = "jdbc:postgresql://localhost:5432/app_dev"
user = "dev_user"
password = "$APP_DEV_PASSWORD"

[environments.test]
url = "jdbc:postgresql://localhost:5432/app_test"
user = "test_user"
password = "$APP_TEST_PASSWORD"

[environments.staging]
url = "jdbc:postgresql://staging-db:5432/app"
user = "staging_user"
password = "$APP_STAGING_PASSWORD"

[environments.production]
url = "jdbc:postgresql://prod-db:5432/app"
user = "prod_user"
password = "$APP_PROD_PASSWORD"
```

Y después podrías ejecutar:

```bash
flyway -environment=development migrate
flyway -environment=test validate
flyway -environment=staging info
flyway -environment=production migrate
```

La idea no es memorizar el ejemplo, sino ver con claridad que **el mismo proyecto puede apuntar a distintos destinos con reglas distintas de uso**.

## Ejercicio recomendado

1. Definí ambientes `development`, `test` y `production` en tu configuración.
2. Corré una migración en `development`.
3. Validá el historial en `test`.
4. Simulá un pipeline simple que haga `validate` y `migrate` sobre una base de prueba limpia.
5. Escribí en un archivo aparte qué cosas permitirías en desarrollo pero no en producción.

## Errores comunes

- creer que todos los ambientes se usan igual;
- desplegar por primera vez una migración directamente en producción;
- mantener scripts divergentes por ambiente sin medir el costo;
- depender de cambios manuales que no quedaron en Flyway;
- no tener un entorno de staging razonablemente parecido a producción;
- usar una base de desarrollo tan contaminada que los resultados locales ya no son confiables.

## Idea clave para llevarte

Aprender Flyway no es solo aprender comandos.

También es aprender a **tratar distinto a cada ambiente**.

- En desarrollo buscás velocidad.
- En testing buscás confianza.
- En producción buscás seguridad y previsibilidad.

Cuando entendés esa diferencia, Flyway deja de ser una simple herramienta de migraciones y pasa a formar parte de una estrategia de despliegue mucho más profesional.
