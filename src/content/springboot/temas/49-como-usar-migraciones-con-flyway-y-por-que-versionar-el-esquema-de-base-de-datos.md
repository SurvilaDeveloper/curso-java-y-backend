---
title: "Cómo usar migraciones con Flyway y por qué versionar el esquema de base de datos"
description: "Entender por qué conviene gestionar cambios de esquema con migraciones, cómo encaja Flyway en Spring Boot y por qué versionar la base de datos mejora muchísimo la consistencia, el trabajo en equipo y los despliegues."
order: 49
module: "Persistencia con Spring Data JPA"
level: "base"
draft: false
---

En el tema anterior viste cómo funcionan `fetch = LAZY` y `fetch = EAGER`, y cómo la forma en que se cargan las relaciones impacta muchísimo en el comportamiento real de una aplicación con JPA.

Ahora toca otra pieza muy importante del trabajo serio con base de datos.

Hasta este punto, ya podés imaginar entidades, relaciones, repositories y operaciones persistentes reales.
Pero aparece una pregunta clave:

> cuando el modelo cambia, ¿cómo cambia la base de datos de manera ordenada, repetible y controlada?

Porque en un proyecto real, el esquema de base de datos no se queda quieto.

Cambian cosas como:

- nuevas tablas
- nuevas columnas
- índices
- restricciones
- claves foráneas
- correcciones de nombres
- ajustes de tipos
- seeds técnicos o datos iniciales controlados

Si todo eso se hace “a mano”, muy rápido empiezan los problemas.

Ahí entran las **migraciones de base de datos**.
Y una de las herramientas más conocidas dentro del ecosistema Spring Boot es **Flyway**.

Este tema es clave porque marca un paso de madurez muy importante:
la base de datos deja de ser algo que se modifica informalmente y pasa a formar parte del historial versionado del proyecto.

## El problema de cambiar la base “a mano”

Imaginá este escenario.

Hoy tu entidad `Producto` tiene:

- `id`
- `titulo`
- `precio`

Pero mañana agregás:

- `stock`

Y pasado mañana agregás:

- `activo`

Y después decidís sumar:

- una relación con `Categoria`

La base de datos tiene que acompañar esos cambios.

Si hacés todo manualmente, pueden pasar cosas como estas:

- en tu máquina existe una columna y en la de otro compañero no
- en desarrollo cambiaste la tabla, pero en testing quedó distinta
- en producción nadie recuerda exactamente qué script se aplicó y cuál no
- dos personas hicieron cambios parecidos pero incompatibles
- una base quedó a mitad de camino respecto del modelo actual

Ese desorden es muy peligroso.

## Qué problema resuelven las migraciones

Las migraciones permiten que los cambios del esquema se expresen como pasos versionados, explícitos y repetibles.

Dicho de forma simple:

> una migración es un cambio de base de datos registrado como parte del proyecto.

Eso permite responder preguntas muy importantes como:

- qué cambios se hicieron
- en qué orden
- cuáles ya se aplicaron
- cuáles faltan
- cómo llevar una base desde un estado viejo al actual

En lugar de depender de memoria o cambios manuales aislados, el esquema se vuelve parte trazable del software.

## La idea general de versionar el esquema

Podés pensarlo así:

- el código fuente del proyecto se versiona
- las APIs cambian con control
- las dependencias se gestionan
- entonces también tiene sentido que el esquema de base se gestione de forma versionada

La base no debería ser una “caja aparte” que cambia por costumbre informal.
Debería evolucionar con el proyecto.

## Qué es Flyway

Flyway es una herramienta de migraciones de base de datos.

Su trabajo principal es este:

- detectar qué migraciones existen
- detectar cuáles ya se aplicaron
- ejecutar en orden las que faltan
- registrar qué cambios ya fueron aplicados

En otras palabras:

> Flyway ayuda a mantener sincronizado el esquema de base de datos con la evolución del proyecto.

## Por qué Flyway encaja tan bien con Spring Boot

Porque Spring Boot se integra muy bien con Flyway.

Eso hace que, una vez configurado, el proyecto pueda aplicar migraciones automáticamente al arrancar, siguiendo una convención bastante clara.

Esto aporta mucha comodidad sin obligarte a inventar infraestructura propia para controlar cambios del esquema.

## Qué significa “versionar el esquema”

Significa tratar los cambios de la base como algo que también tiene historia y orden.

Por ejemplo:

- V1 → crear tabla `producto`
- V2 → agregar columna `stock`
- V3 → crear tabla `categoria`
- V4 → agregar relación entre `producto` y `categoria`

Esta secuencia ya expresa algo importantísimo:

- qué pasó primero
- qué vino después
- cuál es la historia estructural del sistema

Eso es mucho mejor que una base que simplemente “está como quedó”.

## Un ejemplo conceptual de migraciones

Supongamos una primera migración:

```sql
CREATE TABLE producto (
    id BIGINT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    precio DECIMAL(10,2) NOT NULL
);
```

Luego una segunda:

```sql
ALTER TABLE producto
ADD COLUMN stock INT NOT NULL DEFAULT 0;
```

Y después una tercera:

```sql
ALTER TABLE producto
ADD COLUMN activo BOOLEAN NOT NULL DEFAULT TRUE;
```

Eso ya muestra la lógica de evolución incremental.

No estás definiendo un gran estado abstracto y mágico.
Estás registrando los cambios concretos que llevaron al esquema actual.

## Por qué eso es tan valioso

Porque te permite reconstruir la historia del esquema.

Si alguien nuevo baja el proyecto, o si levantás una base en otro entorno, Flyway puede aplicar las migraciones en orden y dejar el esquema en el estado correcto.

Eso ayuda muchísimo en:

- desarrollo local
- integración continua
- testing
- staging
- producción
- trabajo en equipo

## Qué problemas evita

Muchísimos.

Por ejemplo:

- “en mi máquina funciona, pero en la tuya falta una columna”
- “cambié la tabla a mano y ahora no sé qué tocamos”
- “producción no tiene la misma estructura que desarrollo”
- “no recuerdo si ejecutamos este script”
- “dos cambios se pisaron y nadie los versionó bien”

Las migraciones no eliminan todos los problemas posibles del mundo, pero sí evitan muchísimo caos básico.

## La filosofía correcta

Una idea muy sana es esta:

> el esquema de base de datos también es parte del software.

No es simplemente un detalle operativo externo.
Forma parte del sistema y de su evolución.

Por eso tiene sentido que sus cambios se registren, se ordenen y se automaticen.

## Cómo suele verse Flyway en un proyecto

En proyectos Spring Boot, es muy común tener archivos de migración SQL en una ruta como esta:

```text
src/main/resources/db/migration
```

Dentro de esa carpeta, Flyway suele buscar archivos con una convención de nombres versionados.

Por ejemplo:

- `V1__crear_tabla_producto.sql`
- `V2__agregar_stock_a_producto.sql`
- `V3__crear_tabla_categoria.sql`

No hace falta que memorices ahora cada detalle exacto del naming más fino, pero sí conviene captar la idea:

- hay versiones
- hay orden
- hay scripts
- Flyway los aplica en secuencia

## La idea del nombre versionado

Una migración no es un archivo cualquiera.

Su nombre suele comunicar:

- el número de versión
- una descripción
- el hecho de que forma parte de la secuencia del esquema

Eso hace que el proyecto pueda ordenar claramente qué va antes y qué va después.

## Un ejemplo conceptual de estructura

```text
src/
  main/
    resources/
      db/
        migration/
          V1__crear_tabla_producto.sql
          V2__agregar_stock_a_producto.sql
          V3__crear_tabla_categoria.sql
          V4__agregar_categoria_id_a_producto.sql
```

Esto ya cuenta una historia bastante clara del esquema.

## Qué hace Flyway al arrancar

A nivel conceptual, Flyway puede hacer algo así:

1. mirar la carpeta de migraciones
2. identificar qué versiones existen
3. comparar contra lo ya aplicado en la base
4. ejecutar las migraciones pendientes en orden
5. registrar que esas migraciones ya fueron aplicadas

Esa lógica es la base de todo su valor.

## Qué significa “registrar lo ya aplicado”

Es una pieza muy importante.

Flyway no solo ejecuta scripts.
También lleva control de cuáles ya pasaron.

Eso evita que una misma migración se intente aplicar como si fuera nueva cada vez.

En otras palabras:

> no es una simple carpeta de SQL suelto; es un sistema de evolución controlada del esquema.

## Un ejemplo mental de evolución

Supongamos:

- hoy tu proyecto solo tiene `V1`
- mañana agregás `V2`
- pasado agregás `V3`

En una base que ya tenía `V1`, Flyway debería saber que faltan `V2` y `V3`.

En una base nueva, debería aplicar `V1`, luego `V2`, luego `V3`.

Eso muestra por qué el orden y el registro importan tanto.

## Qué relación tiene esto con JPA y entidades

Muy fuerte.

Cuando tus entidades cambian, muchas veces el esquema también necesita cambiar.

Por ejemplo:

### Entidad antes
```java
private String titulo;
private double precio;
```

### Entidad después
```java
private String titulo;
private double precio;
private int stock;
```

Ese cambio en Java puede implicar también un cambio real en la base.

Las migraciones ayudan a que ese cambio estructural no quede librado a acciones manuales informales.

## Por qué no conviene depender solo de “que Hibernate cree o actualice cosas”

En etapas muy iniciales o demos simples, puede existir la tentación de dejar que el esquema se ajuste automáticamente de alguna manera sin registrar bien los cambios.

Pero en aplicaciones reales, eso suele quedarse corto porque:

- no deja una historia clara
- no expresa con precisión qué cambió
- no siempre da control fino
- no ayuda tanto al trabajo en equipo
- no es una estrategia tan robusta para producción

Las migraciones versionadas aportan mucha más claridad y previsibilidad.

## Una idea importante: no se trata solo de crear tablas

Las migraciones no sirven únicamente para el “inicio” del proyecto.

También sirven para su evolución continua.

Por ejemplo:

- agregar una columna
- renombrar una tabla
- cambiar una restricción
- crear un índice
- mover datos de una forma a otra
- partir una tabla
- agregar claves foráneas

Es decir: Flyway acompaña el ciclo de vida del esquema, no solo el primer día.

## Un ejemplo simple de primera migración

Archivo:

```text
V1__crear_tabla_producto.sql
```

Contenido:

```sql
CREATE TABLE producto (
    id BIGINT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    precio DECIMAL(10,2) NOT NULL
);
```

La idea general sería:

- esta es la primera versión del esquema relevante para `producto`
- si la base todavía no la tiene, debe aplicarse
- después quedará registrada como ejecutada

## Un ejemplo de migración incremental

Archivo:

```text
V2__agregar_stock_a_producto.sql
```

Contenido:

```sql
ALTER TABLE producto
ADD COLUMN stock INT NOT NULL DEFAULT 0;
```

Acá ya ves muy bien la lógica de evolución.

No estás reescribiendo todo desde cero.
Estás agregando un cambio puntual y versionado.

## Un ejemplo con nueva tabla relacionada

Archivo:

```text
V3__crear_tabla_categoria.sql
```

Contenido:

```sql
CREATE TABLE categoria (
    id BIGINT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL
);
```

Luego otra migración:

```text
V4__agregar_categoria_id_a_producto.sql
```

Contenido:

```sql
ALTER TABLE producto
ADD COLUMN categoria_id BIGINT;

ALTER TABLE producto
ADD CONSTRAINT fk_producto_categoria
FOREIGN KEY (categoria_id) REFERENCES categoria(id);
```

Esto ya se siente muy cercano a la evolución real de un modelo JPA con relaciones.

## Qué gana el equipo con esto

Muchísimo.

Porque todos pueden trabajar con una base que evoluciona de forma controlada.

Eso mejora:

- onboarding
- colaboración
- despliegues
- debugging
- consistencia entre entornos
- trazabilidad del proyecto

En vez de decir “hacé estos cambios a mano”, el proyecto ya trae su propia historia estructural.

## Qué gana producción con esto

También mucho.

En producción, improvisar cambios manuales sobre el esquema suele ser especialmente delicado.

Tener migraciones versionadas ayuda a que los despliegues sean más previsibles.

No significa que nunca haya que tener cuidado.
Pero sí aporta una disciplina mucho más sana que cambiar cosas manualmente sin control.

## Qué relación tiene esto con CI/CD y automatización

Muy directa.

Cuando el esquema está versionado, también puede integrarse mejor con procesos automáticos de:

- build
- test
- deploy
- validación de entorno

Esto hace que la base de datos deje de ser un área medio artesanal y pase a ser parte mucho más integrada del flujo del software.

## Un punto importante: cada migración cuenta una historia pequeña y concreta

Una buena práctica mental es esta:

> cada migración debería representar un cambio claro, acotado y comprensible del esquema.

Por ejemplo:

- crear tabla `producto`
- agregar columna `stock`
- crear tabla `categoria`
- agregar FK de categoría a producto

Eso suele ser mucho más sano que scripts enormes y confusos que mezclan demasiadas cosas sin claridad.

## Qué conviene evitar

No conviene pensar las migraciones como un basurero de SQL sin criterio.

La idea no es “tirar comandos ahí”.
La idea es que cada cambio del esquema tenga:

- intención
- orden
- nombre claro
- trazabilidad

## Un ejemplo sano de evolución del proyecto

### Sprint 1
- `V1__crear_tabla_usuario.sql`

### Sprint 2
- `V2__agregar_email_a_usuario.sql`

### Sprint 3
- `V3__crear_tabla_pedido.sql`
- `V4__agregar_usuario_id_a_pedido.sql`

Esa evolución queda mucho más clara que una base modificada a mano sin historia explícita.

## Qué pasa si dos personas cambian el modelo a la vez

Ahí se vuelve todavía más importante tener control de versiones sobre el esquema.

Las migraciones ayudan a ordenar y detectar cómo evoluciona la base cuando varias manos tocan el proyecto.

No reemplazan toda coordinación del equipo, claro.
Pero sí aportan una estructura muchísimo más sana que depender de cambios locales informales.

## Qué relación tiene esto con testing

También muy buena.

Si tu esquema está versionado, es mucho más fácil tener entornos de prueba que reflejen fielmente el estado esperado de la base.

Eso reduce un montón de problemas de “este test falla porque la base no está como debería”.

## Una buena intuición sobre Flyway

Flyway no “piensa por vos” el modelo.
No decide qué esquema tiene sentido.

Lo que hace es ayudarte a **ejecutar y controlar** esa evolución de forma ordenada.

Es decir:

- el diseño sigue siendo tu responsabilidad
- la herramienta te da disciplina y trazabilidad

## Qué todavía no estás viendo

Este tema es introductorio y conceptual.

Todavía no estás entrando a fondo en cosas como:

- configuración precisa de Flyway en `application.properties`
- cómo convive con Hibernate en distintos modos
- estrategias avanzadas de migración
- rollback de migraciones
- migraciones de datos más complejas
- seeds iniciales
- validación avanzada del historial

Pero primero conviene fijar bien la idea de fondo:
**el esquema debe evolucionar de forma versionada y controlada**.

## Una muy buena pregunta para saber si tu proyecto necesita migraciones

Podés preguntarte:

- ¿la base cambia con el tiempo?
- ¿hay más de un entorno?
- ¿hay más de una persona tocando el proyecto?
- ¿querés poder reproducir el estado del esquema?
- ¿querés desplegar con más seguridad?
- ¿querés evitar cambios manuales caóticos?

Si la respuesta es sí, las migraciones tienen muchísimo sentido.

Y en proyectos reales, casi siempre lo tienen.

## Qué relación tiene esto con la mantenibilidad

Muy fuerte.

Un proyecto con migraciones bien cuidadas suele ser más fácil de:

- entender
- desplegar
- compartir
- auditar
- evolucionar

Porque la historia de la base deja de estar escondida en acciones manuales y pasa a estar visible en el repositorio.

## Error común: cambiar la base a mano y después “ya veremos”

Eso puede parecer práctico en un proyecto diminuto o en una prueba rápida.

Pero a medida que el sistema crece, suele volverse una fuente constante de inconsistencias y dolores de cabeza.

## Error común: pensar que solo importa el modelo Java y no el esquema real

No.

Las entidades importan muchísimo, pero también importa cómo evoluciona la base real donde viven los datos.

Modelo y esquema tienen que acompañarse.

## Error común: escribir migraciones demasiado grandes y poco claras

Si una migración mezcla demasiadas cosas sin una intención legible, se vuelve más difícil de revisar y mantener.

Las migraciones claras y acotadas suelen funcionar mucho mejor.

## Error común: creer que Flyway “te resuelve” automáticamente el diseño del esquema

No.
Te ayuda a controlar cambios.
Pero el diseño correcto de tablas, relaciones y restricciones sigue siendo una decisión de arquitectura y modelado.

## Relación con Spring Boot

Spring Boot integra muy bien Flyway y hace que trabajar con migraciones pueda sentirse bastante natural dentro del proyecto.

Eso permite que la evolución del esquema no quede separada del resto del desarrollo, sino que forme parte normal del ciclo de vida de la aplicación.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> usar migraciones con Flyway permite que el esquema de base de datos evolucione de forma versionada, ordenada y repetible, evitando cambios manuales caóticos y haciendo que la base de datos pase a formar parte controlada del historial real del proyecto.

## Resumen

- El esquema de base de datos también cambia y necesita control.
- Las migraciones permiten registrar esos cambios de forma ordenada y versionada.
- Flyway ayuda a aplicar en orden las migraciones pendientes y a registrar cuáles ya se ejecutaron.
- Esto mejora muchísimo la consistencia entre entornos, el trabajo en equipo y los despliegues.
- Las migraciones no son solo para crear tablas, sino para acompañar toda la evolución del esquema.
- Cada migración debería representar un cambio claro y comprensible.
- Este tema marca un paso importante hacia un manejo más serio y profesional de la persistencia.

## Próximo tema

En el próximo tema vas a ver cómo conectar Spring Boot con una base de datos real usando `application.properties`, la URL JDBC, usuario, contraseña y dialecto, para que todo lo anterior deje de ser solo estructura conceptual y empiece a funcionar contra un motor de base concreto.
