---
title: "Checklist profesional antes de migrar en producción"
description: "Cómo preparar un despliegue real con Flyway: validaciones previas, seguridad, backups, estrategia de rollback y verificación posterior."
order: 30
module: "Cierre profesional del curso"
level: "avanzado"
draft: false
---

# Checklist profesional antes de migrar en producción

Llegados a este punto del curso, ya conocés la mecánica de Flyway: migraciones versionadas, repeatable, `info`, `validate`, `repair`, entornos, CI/CD y buenas prácticas. Ahora toca algo muy importante: **cómo pararte frente a un despliegue real en producción**.

En proyectos reales, el problema no suele ser “cómo escribir `V23__agregar_columna.sql`”, sino **cómo reducir el riesgo antes de ejecutar `migrate` sobre una base importante**.

Este tema cierra el curso con una checklist práctica y profesional.

## Qué vas a aprender

- Qué revisar antes de correr migraciones en producción.
- Cómo combinar Flyway con backups, validaciones y control de cambios.
- Qué decisiones conviene tomar antes del despliegue.
- Qué verificar después de aplicar migraciones.
- Qué anti-patrones evitar en una base sensible.

## Qué problema estamos resolviendo

En desarrollo, si algo sale mal, muchas veces se puede borrar la base, correr `clean`, rearmar todo y seguir. En producción, eso no existe.

En producción normalmente tenés:

- datos reales de clientes;
- tráfico concurrente;
- otros servicios dependiendo de la base;
- ventanas de mantenimiento acotadas;
- necesidad de rollback o recuperación;
- auditoría y trazabilidad.

Por eso, **migrar bien en producción no es solo ejecutar un comando**. Es preparar el terreno, validar el cambio y verificar el resultado.

## Idea central

La mejor migración a producción es la que:

1. fue versionada y revisada en control de versiones;
2. ya fue probada en ambientes anteriores;
3. llega con configuración correcta y secretos seguros;
4. tiene plan de recuperación;
5. se ejecuta con el menor grado posible de improvisación.

## Checklist previa a producción

### 1. Confirmar que las migraciones están en control de versiones

Antes de desplegar, asegurate de que:

- las migraciones estén committed en el repositorio;
- no haya scripts locales “sueltos” fuera del proyecto;
- el pipeline esté tomando exactamente la versión del código aprobada;
- nadie haya modificado a mano una migración ya aplicada en otros ambientes.

> Regla práctica: lo que va a producción tiene que ser exactamente lo que fue revisado, probado y versionado.

### 2. Verificar el ambiente objetivo

No des por hecho que estás apuntando a la base correcta.

Revisá:

- URL/JDBC del ambiente;
- usuario y credenciales;
- esquemas configurados;
- `locations` efectivas;
- environment seleccionado;
- si la tabla `flyway_schema_history` existe donde esperás.

Un error muy común no es una mala migración, sino **correr una buena migración sobre la base equivocada**.

### 3. Ejecutar `info` antes del despliegue

Antes de migrar, corré:

```bash
flyway info
```

Esto te permite ver:

- qué migraciones ya están aplicadas;
- cuáles están pendientes;
- si hay fallidas;
- si hay out-of-order;
- si el estado general coincide con lo esperado.

Si `info` muestra algo raro, no sigas como si nada.

### 4. Ejecutar `validate` antes de `migrate`

Antes de aplicar cambios, conviene validar integridad:

```bash
flyway validate
```

Esto ayuda a detectar problemas como:

- checksums distintos;
- migraciones renombradas;
- migraciones faltantes respecto del historial;
- inconsistencias entre lo aplicado y lo disponible localmente.

En un flujo profesional, **`validate` debería ser parte del pipeline y también de la rutina manual cuando el despliegue es delicado**.

### 5. Confirmar que el cambio ya fue probado en ambientes previos

No uses producción como laboratorio.

La migración ideal ya pasó por:

- desarrollo;
- test o integración;
- staging o preproducción, si existe.

Y ya fue probada con:

- datos representativos;
- volumen razonable;
- secuencia real de migraciones;
- la misma configuración base que vas a usar en producción.

### 6. Revisar si la migración es segura para producción

Preguntas útiles antes de ejecutar:

- ¿bloquea tablas por mucho tiempo?
- ¿agrega índices pesados?
- ¿reescribe tablas grandes?
- ¿mueve o transforma muchos datos?
- ¿depende de que no haya tráfico concurrente?
- ¿rompe compatibilidad con la versión actual de la aplicación?

No todas las migraciones tienen el mismo riesgo. Algunas son triviales. Otras necesitan ventana de mantenimiento, despliegue gradual o estrategia expand/contract.

### 7. Definir estrategia de backup y recuperación

Flyway versiona cambios, pero **no reemplaza una estrategia de backup**.

Antes de migrar en producción, debería estar claro:

- qué backup existe;
- de qué momento es;
- cuánto tarda restaurar;
- quién puede ejecutar la restauración;
- cuál es el procedimiento si la migración falla a mitad del proceso.

Muy importante: **tener backup no es lo mismo que tener una estrategia de recuperación probada**.

### 8. Tener una estrategia de rollback o roll forward

En bases de datos, muchas veces no existe un “undo automático” simple. Por eso conviene decidir de antemano:

- si el plan es rollback restaurando backup;
- si el plan es corregir hacia adelante con una nueva migración;
- si el cambio requiere scripts reversibles específicos;
- si el despliegue debe dividirse en varias etapas.

En muchos equipos maduros, el enfoque preferido es **roll forward**, corrigiendo con una nueva migración, siempre que el problema no comprometa datos críticos.

### 9. Asegurar secretos y configuración sensible

No expongas credenciales en:

- repositorios;
- scripts versionados;
- logs del pipeline;
- archivos compartidos sin protección.

Lo correcto es usar:

- variables de entorno;
- secrets del sistema CI/CD;
- mecanismos centralizados de gestión de secretos.

### 10. Alinear aplicación y base de datos

Una migración puede ser correcta y aun así romper el sistema si la aplicación no está lista para convivir con el nuevo esquema.

Revisá si necesitás:

- desplegar primero la base y después la app;
- desplegar primero la app y después la base;
- mantener compatibilidad temporal entre ambas versiones;
- dividir el cambio en varias migraciones chicas.

Cuando el cambio es sensible, suele funcionar mejor una estrategia gradual:

1. agregar estructura nueva;
2. adaptar la aplicación;
3. migrar datos si hace falta;
4. recién al final eliminar lo viejo.

### 11. Confirmar observabilidad y monitoreo

Después de migrar, alguien tiene que mirar qué pasó.

Antes del despliegue, definí:

- dónde quedan los logs;
- quién monitorea errores;
- qué métricas del sistema hay que observar;
- cómo detectar bloqueos, lentitud o timeouts;
- cómo verificar que la app siguió operando bien.

### 12. Evitar `clean` y usos impulsivos de `repair`

En producción, `clean` no debería formar parte del flujo normal.

Y `repair` no es una herramienta para “hacer desaparecer el problema”, sino para corregir la tabla de historial **después** de entender qué pasó.

Si algo falla:

- primero diagnosticá;
- después decidí si corresponde limpiar objetos manuales, restaurar backup o corregir con una nueva migración;
- recién ahí evaluá si `repair` tiene sentido.

## Flujo sugerido de preproducción a producción

Un flujo simple y profesional puede ser este:

1. Se crea la migración en una rama de trabajo.
2. Se versiona junto con el cambio de aplicación.
3. Se prueba localmente sobre una base limpia o controlada.
4. Pasa por CI con validaciones automáticas.
5. Se prueba en test/staging.
6. Se revisa impacto, ventana, backup y recuperación.
7. En producción se ejecuta `info`.
8. Luego `validate`.
9. Si todo está correcto, se ejecuta `migrate`.
10. Se verifica estado final, logs y comportamiento de la aplicación.

## Ejemplo de rutina manual prudente

```bash
flyway info
flyway validate
flyway migrate
flyway info
```

La idea de este flujo es:

- entender el estado inicial;
- validar integridad;
- aplicar cambios;
- confirmar el estado final.

## Ejercicio práctico

Armá una checklist propia para un despliegue ficticio a producción.

### Escenario

Tenés una aplicación de e-commerce con una base PostgreSQL en producción. Vas a desplegar estas migraciones:

- `V21__agregar_columna_estado_logistico.sql`
- `V22__crear_indice_en_orders_created_at.sql`
- `R__vista_resumen_de_ventas.sql`

### Tu tarea

Escribí, en orden:

1. qué revisarías antes del despliegue;
2. qué comandos ejecutarías;
3. qué riesgos identificarías;
4. qué plan de recuperación definirías;
5. qué verificarías después de migrar.

## Errores comunes en producción

- Ejecutar Flyway contra el ambiente equivocado.
- Migrar sin correr antes `info` y `validate`.
- Confiar en que “si falla lo arreglamos después”.
- No saber si existe backup reciente.
- Mezclar cambios de aplicación y base sin compatibilidad temporal.
- Modificar una migración vieja para “ahorrar” una nueva versión.
- Usar `repair` como atajo sin entender el problema.
- Guardar credenciales sensibles en texto plano.

## Resumen

Flyway resuelve muy bien el versionado y la ejecución ordenada de migraciones, pero **un despliegue seguro a producción depende también del proceso**.

La idea no es solo “correr `migrate`”, sino hacerlo con:

- versionado claro;
- validación previa;
- ambientes bien separados;
- secretos protegidos;
- backup y recuperación definidos;
- verificación posterior.

Ese es el salto entre usar Flyway como herramienta y usarlo como parte de un flujo profesional.

## Próximo paso sugerido

Con este tema ya tenés un cierre sólido del curso. Un buen siguiente paso, si querés profundizar todavía más, sería crear material extra sobre alguno de estos ejes:

- expand/contract migrations;
- despliegues sin downtime;
- migraciones en sistemas multi-tenant;
- estrategia avanzada de datos de referencia;
- coordinación entre Flyway y releases de microservicios.
