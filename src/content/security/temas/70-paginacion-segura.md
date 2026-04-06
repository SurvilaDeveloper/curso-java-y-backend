---
title: "Paginación segura"
description: "Cómo diseñar paginación segura en aplicaciones Java con Spring Boot para evitar enumeración excesiva, recorridos masivos del dataset, respuestas costosas y fugas indirectas a través de conteos, cursores o navegación predecible. Qué límites conviene imponer y cómo pensar offset, page size, cursores y visibilidad real de los datos."
order: 70
module: "SQL Injection, JPA y persistencia segura"
level: "base"
draft: false
---

# Paginación segura

## Objetivo del tema

Entender cómo diseñar **paginación segura** en una aplicación Java + Spring Boot cuando el backend expone:

- listados
- búsquedas
- resultados filtrados
- paneles administrativos
- endpoints de exploración
- exports parciales
- tablas paginadas en frontend
- feeds o listados cronológicos

La idea es salir de una mirada demasiado superficial del tema.

Porque paginar no es solamente:

- “partir resultados en páginas”
- “hacer más cómoda la UI”
- “no traer todo junto”

También es una decisión de seguridad y control operativo.

Una paginación mal diseñada puede facilitar:

- enumeración masiva
- recorrido sistemático del dataset
- extracción cómoda de información
- abuso de recursos
- respuestas costosas
- inferencia de existencia a partir de conteos o navegación

---

## Idea clave

La paginación define **cómo un actor recorre un conjunto de datos**.

Y esa decisión importa mucho.

No es lo mismo un endpoint que:

- limita tamaño de página
- controla orden
- estabiliza el recorrido
- oculta información innecesaria
- reduce señal útil para enumeración

que un endpoint donde el cliente puede:

- pedir páginas enormes
- recorrer todo el dataset sin fricción
- ordenar arbitrariamente
- usar offsets absurdos
- extraer resultados masivamente
- obtener conteos muy precisos

En resumen:

> paginar no solo organiza resultados.  
> También decide cuán fácil o difícil es explorar, extraer o abusar del conjunto de datos.

---

## Qué problema intenta resolver este tema

Este tema busca evitar patrones como:

- `size=100000`
- paginación sin límite máximo
- offsets gigantes
- navegación totalmente predecible sobre datasets sensibles
- conteos precisos donde no hacían falta
- listados que permiten barrido completo del sistema
- páginas con demasiados datos por registro
- paginación que ignora tenant, ownership o visibilidad
- endpoints de admin o soporte que permiten recorrer demasiado sin fricción
- APIs donde paginar mejora UX pero empeora mucho la capacidad de enumeración

Es decir:

> el problema no es permitir listar datos.  
> El problema es diseñar una navegación tan cómoda y abierta que el endpoint termine funcionando como una interfaz de extracción del dataset.

---

## Error mental clásico

Un error muy común es pensar:

### “Si ya validamos autorización por registro, no importa demasiado cómo se pagina”

Eso es incompleto.

Porque incluso si cada fila es visible para ese actor, la paginación puede seguir afectando mucho:

- cuánto volumen puede extraer
- con qué facilidad recorre todo
- qué tan rápido puede enumerar
- cuánta señal obtiene del sistema
- cuánto cuesta operativamente cada request

### Idea importante

La seguridad no solo depende de **qué registros puede ver**.
También depende de:

- cuántos puede obtener por request
- qué tan fácil es recorrerlos
- qué tan estable y predecible es el acceso
- qué metadata adicional recibe

---

## Qué problemas trae una paginación sin límites

Supongamos un endpoint tipo:

- `/orders?page=0&size=50000`
- `/users?offset=0&limit=100000`
- `/products?page=1&perPage=999999`

Aunque el backend siga “paginando”, en la práctica eso ya roza una extracción masiva.

### Riesgos

- respuestas enormes
- uso excesivo de memoria
- mayor tiempo de CPU y base de datos
- más datos expuestos por request
- scraping más eficiente
- mayor impacto si una cuenta legítima se abusa
- más difícil detectar abuso fino porque cada request ya transporta muchísimo

### Regla sana

Toda paginación debería tener un **máximo estricto de tamaño de página** definido por el backend.

No por el cliente.

---

## El tamaño de página es una decisión de seguridad y costo

Muchas veces el page size se elige solo por comodidad de frontend.

Eso es poco.

También conviene pensar:

- cuánto dato sensible viaja por request
- cuánto cuesta serializarlo
- qué tan fácil hace el scraping
- qué tan costosa vuelve la consulta
- si ese actor realmente necesita tanto volumen de una vez

### Idea útil

No hay un número universal perfecto.
Pero sí una regla sana:

> el tamaño máximo de página debería estar pensado para el caso de uso real, no para “ya que estamos, que sea flexible”.

---

## Offset pagination: útil, pero con límites

La paginación por offset es común y fácil de implementar:

- `page=0&size=20`
- `offset=40&limit=20`

Eso está bien en muchos contextos.
Pero tiene varios riesgos o costos cuando se usa sin cuidado.

### Problemas habituales

- offsets grandes pueden ser caros
- facilitan recorrer sistemáticamente todo el dataset
- se vuelven inestables si cambian los datos entre requests
- pueden dar señales útiles sobre volumen real
- se prestan a barridos previsibles

### Idea importante

Offset pagination no es mala por sí misma.
Pero conviene tratarla como una interfaz que necesita límites reales.

---

## Offsets gigantes: señal de abuso o diseño flojo

Si el backend acepta alegremente cosas como:

- `offset=500000`
- `page=10000`
- `size=1000`

probablemente está dando demasiada libertad.

### Qué puede significar eso

- scraping cómodo
- barrido masivo del dataset
- consultas muy costosas
- exploración mecánica
- mal uso por clientes legítimos o scripts

### Más sano

- imponer máximos de page size
- imponer máximos razonables de offset o profundidad navegable
- combinar con filtros más específicos
- detectar patrones de recorrido anormal

No siempre hace falta bloquear fuerte, pero sí conviene evitar libertad infinita.

---

## Cursor pagination: cuándo ayuda

En listados cronológicos o secuenciales, la paginación por cursor suele ser más sana que offset.

Por ejemplo, navegar usando:

- `nextCursor`
- `before`
- `after`
- `lastSeenId`
- `createdAt + id`

### Qué ventajas puede tener

- mejor performance en muchos casos
- menor costo que offsets muy grandes
- recorrido más estable
- menos incentivo a saltos arbitrarios profundos
- menos acoplamiento a “página 9432”

### Pero ojo

Cursor pagination no resuelve por sí sola todos los problemas.
También necesita pensar:

- qué orden se usa
- qué universo de datos puede ver el actor
- qué metadata exponés
- si el cursor revela demasiado
- si el tamaño de página sigue controlado

---

## Un cursor tampoco debería revelar demasiado

Hay implementaciones de cursor que terminan exponiendo directamente:

- IDs internos
- timestamps crudos
- combinaciones previsibles
- estructura del orden subyacente

Eso no siempre es gravísimo, pero tampoco es ideal si podés evitarlo.

### Más sano

Usar cursores diseñados como tokens de navegación más opacos o, al menos, no excesivamente expresivos.

### Idea clave

El cursor debería servir para continuar el recorrido.
No para enseñarle al cliente demasiado sobre la estructura interna del dataset.

---

## Orden estable: requisito clave para paginar bien

No se puede hablar de paginación sana sin hablar de orden estable.

Si el endpoint no tiene un orden claro y consistente, pueden pasar cosas como:

- resultados duplicados entre páginas
- registros salteados
- comportamiento extraño al cambiar datos
- dificultad para auditar navegación
- exploración confusa

### Regla práctica

Toda paginación debería apoyarse en un criterio de orden:

- claro
- estable
- conocido
- controlado por el backend
- compatible con el caso de uso real

Y si el cliente puede influir en el sort, eso debe pasar por whitelist estricta.

---

## Paginación y enumeración

Este punto es central.

Aunque cada página tenga pocos resultados, un endpoint muy navegable puede facilitar enumeración si:

- el universo es grande
- el recorrido es predecible
- los filtros permiten acotar progresivamente
- la respuesta incluye demasiada señal
- el actor puede recorrer sin fricción

### Ejemplo mental

Tal vez no exponés un recurso sensible en un solo endpoint directo.
Pero si permitís:

- búsqueda flexible
- sort controlable
- paginación profunda
- conteos precisos

entonces el sistema puede terminar siendo explorado de forma bastante eficiente igual.

### Idea útil

La revisión sana no mira solo “una página”.
Mira lo fácil que es recorrer **todas** las páginas.

---

## Conteos totales: a veces ayudan demasiado

Muchos endpoints paginados devuelven cosas como:

- `totalElements`
- `totalPages`
- `totalCount`

Eso puede ser útil para frontend.
Pero también puede dar información innecesaria.

### Riesgos

- confirmar volumen de datos
- ayudar a enumerar
- revelar actividad o existencia
- mostrar cuántos registros cumplen un criterio sensible
- dar señal innecesaria a un atacante o actor curioso

### Pregunta sana

¿El cliente realmente necesita conocer el total exacto?

A veces sí.
Pero otras veces alcanza con:

- saber si hay próxima página
- mostrar un “hay más resultados”
- usar navegación incremental
- evitar precisión innecesaria

---

## “Has next” a veces es mejor que “total exacto”

En muchos casos, para seguir navegando, el frontend solo necesita saber:

- si hay más resultados
- cuál es el próximo cursor
- si puede cargar más

No necesariamente necesita:

- el total exacto
- la cantidad total de páginas
- el volumen completo del dataset

### Ventaja

Eso reduce:

- señal útil para enumeración
- costo de ciertos conteos
- exposición innecesaria sobre el volumen real de datos

No siempre aplica, pero es una idea muy valiosa en endpoints más delicados.

---

## Paginación y mínimo dato por fila

No alcanza con limitar cuántos registros salen por página.
También importa **qué trae cada registro**.

Una página de 20 resultados puede seguir ser demasiado generosa si cada fila incluye:

- demasiados campos sensibles
- relaciones internas
- metadata operativa
- estados técnicos
- historiales
- flags que el actor no necesitaba ver

### Idea práctica

Paginación segura combina dos cosas:

- límite razonable de cantidad
- límite razonable de detalle por ítem

Si no, reducís el volumen de filas pero seguís filtrando demasiado por página.

---

## Admin y soporte: cuidado con recorridos masivos

En herramientas internas muchas veces se relajan los límites con el argumento de que:

- “esto es para operar”
- “lo usa gente de confianza”
- “cuanto más cómodo mejor”

Y así aparecen listados que permiten:

- recorrer muchísimo
- exportar demasiado
- combinar filtros potentes
- paginar profundo sin fricción

### Problema

Una cuenta comprometida o un uso impropio gana muchísimo poder de exploración.

Entonces, incluso en contextos internos, conviene pensar:

- tamaño máximo por página
- profundidad razonable
- filtros obligatorios cuando el dataset es grande
- segmentación por rol
- casos donde conviene cursor más que offset
- auditoría de recorridos masivos

---

## Paginación no reemplaza rate limiting

A veces alguien piensa:

- “como ya paginamos de a 20, no hace falta mirar abuso”

No.

Paginación ayuda, pero no reemplaza defensas como:

- rate limiting
- throttling
- detección de patrones extraños
- monitoreo de barridos
- alertas por recorrido masivo
- límites por actor o por endpoint

### Idea importante

Paginación reduce el volumen por request.
No impide por sí sola que alguien haga 5000 requests ordenadas.

---

## Paginación y cacheo de resultados

En algunos contextos, resultados muy cacheables pueden mejorar costo y estabilidad.
Pero también conviene revisar:

- si el cache respeta actor y visibilidad
- si mezcla tenants
- si expone resultados que cambian de contexto
- si el criterio de paginación sigue siendo consistente

No es el corazón del tema, pero sirve recordar que paginar también interactúa con otras capas del sistema.

---

## Qué conviene revisar en una codebase

Cuando revises paginación en Spring, buscá especialmente:

- `size` o `limit` sin tope máximo
- offsets gigantes aceptados sin control
- `Pageable` expuesto sin restricciones
- `sort` libre combinado con paginación
- `totalCount` devuelto siempre por costumbre
- páginas con demasiados campos por ítem
- endpoints admin capaces de recorrer datasets enormes
- ausencia de rate limiting en listados sensibles
- navegación profunda sobre universos que deberían estar más acotados
- cursores que revelan demasiado del modelo interno

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- tamaño máximo de página definido por backend
- orden estable y controlado
- sort por whitelist
- universo de datos acotado por tenant, ownership y visibilidad
- uso cuidadoso de conteos totales
- preferencia por cursor donde tiene sentido
- payload razonable por ítem
- límites operativos sobre profundidad o volumen
- mejor combinación entre paginación, filtros y control de abuso

---

## Señales de ruido

Estas señales merecen revisión rápida:

- `size` arbitrario
- `offset` o `page` prácticamente ilimitados
- `sort` libre con paginación
- conteos exactos siempre expuestos
- respuestas pequeñas en número, pero enormes en detalle
- endpoints internos con barrido casi irrestricto
- cursores que muestran IDs o estructura de forma muy cruda
- nadie puede explicar por qué ese endpoint deja recorrer tanto
- paginación usada como excusa para no pensar abuso ni extracción masiva

---

## Checklist práctico

Cuando revises paginación, preguntate:

- ¿el tamaño máximo de página está definido por el backend?
- ¿el actor realmente necesita ese volumen por request?
- ¿hay un orden estable y controlado?
- ¿el sort pasa por whitelist?
- ¿offsets gigantes o navegación profunda deberían limitarse?
- ¿cursor sería más sano en este caso que offset?
- ¿el endpoint devuelve total exacto sin necesidad real?
- ¿cada ítem trae más detalle del necesario?
- ¿tenant, ownership y visibilidad se aplican antes de paginar?
- ¿hay rate limiting o monitoreo para recorridos masivos?

---

## Mini ejercicio de reflexión

Tomá un endpoint paginado real de tu proyecto y respondé:

1. ¿Cuál es su tamaño máximo por página?
2. ¿Ese número está justificado por el caso de uso o es arbitrario?
3. ¿Usa offset o cursor? ¿Tiene sentido esa elección?
4. ¿El sort es estable y está controlado?
5. ¿Devuelve total exacto? ¿Hace falta?
6. ¿Qué tan fácil sería recorrer todo el dataset con esa API?
7. ¿Qué cambiarías para que siga siendo útil pero menos explotable?

---

## Resumen

Paginación segura no significa esconder todo ni complicar artificialmente la UX.

Significa diseñar la navegación del dataset con intención, pensando no solo en comodidad, sino también en:

- volumen por request
- facilidad de recorrido
- costo operativo
- señal útil para enumeración
- estabilidad del orden
- metadata expuesta
- universo real de datos visibles

En resumen:

> paginar bien no es solo dividir resultados.  
> Es decidir cuánto, cómo y con qué facilidad puede un actor recorrer los datos que el backend pone a su alcance.

---

## Próximo tema

**Acceso a datos con mínimo privilegio**
