---
title: "Checklists de revisión de configuración"
description: "Cómo revisar la configuración de una aplicación Java con Spring Boot desde seguridad usando checklists prácticos. Qué conviene inspeccionar en properties, variables de entorno, secretos, perfiles, Actuator, entornos y permisos para detectar exposición, mezcla de ambientes y exceso de privilegio antes de que se conviertan en incidentes."
order: 102
module: "Secretos, configuración y entorno"
level: "base"
draft: false
---

# Checklists de revisión de configuración

## Objetivo del tema

Entender cómo usar **checklists de revisión de configuración** para analizar una aplicación Java + Spring Boot desde una mirada de seguridad, sin depender solo de intuición o memoria.

Después de varios temas sobre:

- secretos
- properties
- variables de entorno
- secret managers
- rotación
- debugging
- Actuator
- separación por entornos
- menor privilegio en configuración

es útil transformar esas ideas en una herramienta práctica.

Porque en una revisión real, lo difícil no suele ser “no saber nada”.
Lo difícil suele ser:

- no olvidarse de revisar algo importante
- no quedarse solo en lo obvio
- no mezclar prioridades
- no asumir que “como funciona, debe estar bien”
- no pasar por alto una fuga silenciosa de configuración o un secreto mal distribuido

En resumen:

> un buen checklist no reemplaza criterio.  
> Pero ayuda muchísimo a revisar de forma más completa, más consistente y menos dependiente del azar.

---

## Idea clave

La configuración segura no suele romperse por una sola gran decisión dramática.
Se degrada por acumulación de pequeñas cosas como:

- un secreto hardcodeado
- un `.env` compartido informalmente
- un profile que apunta al recurso equivocado
- un Actuator demasiado rico
- una credencial con demasiado alcance
- un entorno con datos reales de más
- una variable que se imprime en logs
- una rotación imposible porque el valor está pegado en todos lados

La idea central es esta:

> revisar configuración bien significa mirar no solo dónde vive cada valor, sino también qué habilita, quién lo conoce, cuánto se comparte y qué tan fácil sería cambiarlo o contenerlo si algo sale mal.

---

## Qué problema intenta resolver este tema

Este tema busca evitar revisiones pobres como:

- mirar solo el `application.yml`
- chequear solo si hay passwords en texto claro
- revisar solo prod y no staging o local
- suponer que “usar env vars” cierra la discusión
- no mirar tooling, CI/CD y debugging
- no revisar qué valores tienen demasiado alcance
- olvidar quién puede leer o editar la configuración
- no pensar qué secretos duelen más de rotar
- no evaluar blast radius
- no conectar config con autorización, entornos y observabilidad

Es decir:

> el problema no es no tener herramientas.  
> El problema es revisar de forma fragmentada y dejar huecos importantes entre un tema y otro.

---

## Error mental clásico

Un error muy común es este:

### “Revisar configuración es buscar secrets hardcodeados y listo”

Eso es demasiado poco.

Sí, encontrar secretos hardcodeados importa.
Pero una revisión sana también debería detectar cosas como:

- secretos distribuidos con demasiado alcance
- entornos mal separados
- variables visibles en logs
- Actuator enseñando demasiado
- bundles de config sobredotados
- rotación dolorosa
- staging peligrosamente cerca de prod
- jobs o scripts con más poder del necesario

### Idea importante

Una revisión de configuración bien hecha mira **poder, exposición y lifecycle**, no solo “si hay strings feos en un archivo”.

---

## Qué hace útil a un checklist

Un checklist útil debería ayudarte a:

- no olvidar categorías importantes
- separar síntomas de causas
- ordenar prioridades
- convertir sospechas en preguntas concretas
- revisar lo mismo con consistencia en distintas apps o servicios
- detectar patrones repetidos del equipo u organización

### Lo que no debería hacer

No debería:

- reemplazar criterio
- dar falsa sensación de cobertura total
- invitar a marcar casillas sin pensar
- convertir la revisión en burocracia vacía

### Regla sana

Usá el checklist como mapa.
No como piloto automático.

---

## Primera familia de preguntas: ubicación de secretos

Cuando revises configuración, una primera batería útil es:

- ¿qué valores de esta app son secretos reales?
- ¿dónde viven hoy?
- ¿hay alguno en repo, properties, YAML o archivos versionados?
- ¿hay `.env` reales circulando?
- ¿hay secretos pegados a scripts, docs o onboarding?
- ¿alguno terminó demasiado cerca del artefacto o del código?
- ¿qué secreto crítico está en el lugar más débil hoy?

### Qué te ayuda a detectar

- hardcodeo
- distribución informal
- secretos históricos en Git
- mezcla entre config común y credenciales reales

---

## Segunda familia: distribución y alcance

Otra parte central de la revisión es preguntar:

- ¿qué secretos recibe cada servicio o proceso?
- ¿cuáles necesita realmente?
- ¿cuáles conoce pero no usa?
- ¿qué bundle de config está repartiendo demasiado?
- ¿qué jobs o workers están sobredotados?
- ¿qué personas pueden ver o editar más de lo que necesitan?
- ¿qué secretos se comparten entre demasiados componentes?

### Qué te ayuda a detectar

- exceso de privilegio
- blast radius innecesario
- rotación difícil
- mala separación entre funciones

---

## Tercera familia: separación por entornos

Un buen checklist de configuración debería revisar también:

- ¿dev, QA, staging y prod usan secretos distintos?
- ¿usan identidades técnicas distintas?
- ¿local puede tocar recursos reales de más?
- ¿staging está demasiado cerca de prod?
- ¿qué datos reales viven fuera de producción?
- ¿qué secretos o recursos se comparten sin necesidad?
- ¿el pipeline puede operar ambientes de más?
- ¿qué incidente en un entorno bajo escalaría demasiado fácil?

### Qué te ayuda a detectar

- fronteras nominales pero no reales
- fuga entre ambientes
- reuse de credenciales
- baja contención de incidentes

---

## Cuarta familia: exposición en runtime

Otra revisión importante es sobre derrame lateral:

- ¿qué secretos pueden terminar en logs?
- ¿qué variables se imprimen en arranque?
- ¿qué errores o traces arrastran configuración sensible?
- ¿qué clientes HTTP muestran headers o payloads de más?
- ¿qué dumps o herramientas de debugging podrían exponer valores críticos?
- ¿qué metadata sobre secretos o config se muestra en paneles o documentación interna?

### Qué te ayuda a detectar

- fugas por logs
- debugging peligroso
- observabilidad sobrerica
- cultura operativa frágil

---

## Quinta familia: Actuator y diagnóstico

En apps Spring, esta familia merece su propio bloque de preguntas:

- ¿qué endpoints de Actuator están expuestos?
- ¿quién puede acceder a ellos?
- ¿qué muestran `env`, `configprops`, `beans`, `mappings`, `health`, `info` y `metrics`?
- ¿se confía demasiado en el masking?
- ¿qué aprende un atacante o un interno curioso combinando esos endpoints?
- ¿staging o QA exponen más de lo sano?
- ¿se puede operar bien mostrando menos?

### Qué te ayuda a detectar

- mapas internos del sistema demasiado visibles
- exposición operativa innecesaria
- observabilidad útil convertida en inteligencia gratuita

---

## Sexta familia: rotación y lifecycle

Una revisión madura de configuración no termina en “dónde está”.
También pregunta:

- ¿qué secretos son más difíciles de cambiar hoy?
- ¿por qué?
- ¿cuántos consumidores tiene cada uno?
- ¿se puede convivir con valor viejo y nuevo?
- ¿la app requiere reinicio?
- ¿qué secret está tan compartido que da miedo tocarlo?
- ¿qué pasaría si mañana hubiera que rotarlo por incidente?
- ¿qué parte del ecosystem seguiría usando el valor viejo?
- ¿qué secreto parece eterno solo porque nunca nadie quiso moverlo?

### Qué te ayuda a detectar

- deuda operativa
- acoplamiento excesivo
- ausencia de plan de incidente
- secretos tratados como estáticos

---

## Séptima familia: mínima visibilidad humana

También conviene revisar:

- ¿quién puede ver secretos completos?
- ¿quién solo necesita saber que están configurados?
- ¿qué operadores o desarrolladores tienen acceso de más?
- ¿qué paneles o herramientas muestran valores completos innecesariamente?
- ¿qué parte de soporte podría operar con masking y no con acceso pleno?
- ¿qué docs o screenshots internos contienen secretos o config crítica?

### Qué te ayuda a detectar

- exposición humana innecesaria
- acceso amplio por costumbre
- falta de mínima revelación

---

## Octava familia: pipelines, tooling y automatización

Una revisión de config suele quedar incompleta si no mirás:

- CI/CD
- scripts de despliegue
- tareas manuales
- tooling local
- wrappers de arranque
- manifests
- archivos auxiliares
- documentación operativa

### Preguntas útiles

- ¿qué secretos pasan por el pipeline?
- ¿cuáles aparecen en logs del CI?
- ¿qué scripts locales usan credenciales fuertes?
- ¿qué variables se copian entre entornos?
- ¿qué comandos o snippets llevan valores reales pegados?

### Qué te ayuda a detectar

- derrame fuera de la app
- exposición por automatización
- malas prácticas repetidas en operación

---

## Checklist rápido de primera pasada

Si necesitás una revisión breve y efectiva, podés arrancar con algo como esto:

### 1. Secretos
- ¿hay secretos en repo, YAML o properties?
- ¿hay `.env` reales circulando?
- ¿qué tres secretos son más críticos?

### 2. Entornos
- ¿se repiten secretos entre dev, staging y prod?
- ¿hay datos reales donde no deberían?
- ¿local toca algo demasiado serio?

### 3. Exposición
- ¿qué logs o errores pueden filtrar secretos?
- ¿Actuator muestra de más?
- ¿algún panel interno enseña configuración rica?

### 4. Menor privilegio
- ¿qué servicio conoce secretos que no usa?
- ¿qué job auxiliar tiene demasiado poder?
- ¿qué identidad técnica está demasiado compartida?

### 5. Rotación
- ¿qué secreto da más miedo cambiar?
- ¿por qué?
- ¿qué pasaría si hoy se filtrara?

### Idea útil

Esta primera pasada no reemplaza una revisión profunda, pero suele encontrar bastante rápido lo más peligroso.

---

## Checklist profundo por valor de configuración

Otra forma útil es revisar valor por valor, con preguntas como:

- ¿este valor es configuración común, dato sensible o secreto?
- ¿qué habilita si se filtra?
- ¿quién realmente necesita conocerlo?
- ¿dónde vive?
- ¿cómo llega al runtime?
- ¿dónde podría derramarse?
- ¿en cuántos componentes está replicado?
- ¿qué entorno lo usa?
- ¿cómo se rota?
- ¿qué impacto tendría cambiarlo hoy?

### Idea importante

Este enfoque es lento, pero muy bueno para secretos críticos y revisiones más serias.

---

## Checklist por componente

También podés revisar componente por componente:

### Para cada servicio, app, worker o job:
- ¿qué secretos recibe?
- ¿cuáles usa de verdad?
- ¿qué configuración crítica podría quitarse?
- ¿qué acceso humano o técnico tiene sobre ese runtime?
- ¿qué derrame lateral puede producir?
- ¿cómo se afectaría si hubiera una rotación hoy?
- ¿qué blast radius tendría si se compromete?

### Qué gana este enfoque

Hace más visible el principio de menor privilegio y ayuda a detectar sobredotación por componente.

---

## Checklist por incidente potencial

Otra técnica muy potente es revisar la configuración desde escenarios de falla.

Por ejemplo:

### Si se filtra un `.env` local
- ¿qué impacto real tiene?
- ¿qué secretos estaban ahí?
- ¿qué entorno toca?
- ¿hay reuse con ambientes altos?

### Si se expone Actuator
- ¿qué mostraría?
- ¿qué secretos o metadata filtraría?
- ¿qué endpoints enseñan demasiado?

### Si se compromete staging
- ¿qué puede tocar?
- ¿qué secretos reales obtiene?
- ¿qué tan cerca queda de prod?

### Idea útil

Los checklists por incidente obligan a dejar de pensar solo en “cómo está armado” y pasar a “qué pasa si falla”.

---

## Qué priorizar cuando el checklist encuentra mucho

Una revisión real suele encontrar varias cosas a la vez.
Entonces conviene priorizar por criterios como:

- secretos con más poder operativo
- valores más compartidos
- entornos más mezclados
- fugas ya visibles por logs o panels
- rotaciones imposibles
- componentes con más blast radius
- prácticas fáciles de corregir con mucho impacto

### Regla sana

No intentes arreglar todo a la vez.
Pero sí atacá primero lo que combine:

- alto impacto
- alta probabilidad
- y bajo costo de mejora inmediata

---

## Qué NO hacer con el checklist

También conviene evitar algunas trampas.

### No lo uses para:
- marcar casillas sin leer código ni despliegue
- asumir que “si no apareció en el checklist, no existe”
- reemplazar threat modeling
- delegar por completo criterio técnico
- cerrar la revisión demasiado pronto porque “la lista se ve bien”

### Idea importante

El checklist te ayuda a mirar mejor.
No piensa por vos.

---

## Qué conviene revisar en una app Spring concreta

Cuando hagas una revisión de configuración en una aplicación Spring Boot, mirá especialmente:

- `application.properties` y `application.yml`
- perfiles por entorno
- placeholders y resolución desde env
- secretos reales vs config común
- Actuator
- logs de arranque y debugging
- clientes HTTP
- workers y jobs
- CI/CD y scripts auxiliares
- archivos `.env`
- rotación y compartición de credenciales
- diferencia real entre local, QA, staging y prod

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- secretos fuera del repo y bien identificados
- entornos realmente separados
- menor privilegio por componente
- menos derrame en observabilidad
- Actuator más acotado
- menos bundles universales de config
- mejor capacidad de rotación
- mejor trazabilidad sobre qué secreto usa cada pieza
- checklists que permiten repetir el análisis con consistencia

---

## Señales de ruido

Estas señales merecen revisión rápida:

- nadie puede listar secretos críticos
- el equipo cree que “usar env vars” ya cierra el problema
- staging demasiado parecido a prod en lo peligroso
- jobs y APIs recibiendo el mismo paquete de config
- Actuator enseñando demasiado
- logs con configuration properties ricas
- secretos viejos que nadie quiere tocar
- el mismo valor repetido en demasiados servicios o entornos
- el equipo no tiene una forma clara de revisar config sin improvisar cada vez

---

## Checklist práctico consolidado

Cuando quieras hacer una revisión rápida pero seria, preguntate:

- ¿qué valores de esta app son realmente secretos?
- ¿dónde viven hoy?
- ¿qué secretos están demasiado compartidos?
- ¿qué componente recibe más de lo que necesita?
- ¿qué entorno puede tocar demasiado?
- ¿qué se derrama por logs, debugging o Actuator?
- ¿qué secreto sería más difícil de rotar hoy?
- ¿qué bundle o archivo está repartiendo demasiado poder?
- ¿qué fuga en local o staging tendría impacto demasiado alto?
- ¿qué tres cambios bajarían más riesgo en menos tiempo?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y hacé esta revisión en una sola hoja:

1. Listá sus 5 secretos más importantes.
2. Indicá dónde vive cada uno.
3. Marcá qué componentes los consumen.
4. Señalá cuáles están demasiado compartidos.
5. Anotá qué logs o endpoints podrían filtrarlos.
6. Identificá el entorno más peligrosamente mezclado.
7. Elegí los 3 cambios de configuración que más reducirían blast radius en el corto plazo.

---

## Resumen

Los checklists de revisión de configuración ayudan a convertir un tema amplio y difuso en un proceso más concreto y repetible.

Sirven especialmente para revisar:

- secretos
- entornos
- exposición en runtime
- Actuator
- menor privilegio
- rotación
- tooling y pipelines
- acceso humano
- blast radius

En resumen:

> un backend más maduro no revisa su configuración solo cuando algo falla ni depende de que alguien “se acuerde” de mirar lo importante.  
> Usa checklists como herramienta de disciplina técnica para detectar secretos mal ubicados, entornos mezclados y configuraciones con demasiado poder antes de que todo eso se convierta en incidente.

---

## Próximo tema

**HTTP security headers**
