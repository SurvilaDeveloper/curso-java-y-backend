---
title: "Broken Object Level Authorization (BOLA)"
description: "Qué es Broken Object Level Authorization, por qué es una de las fallas más críticas en APIs y cómo permite acceder a objetos concretos sin validar correctamente si la identidad solicitante tiene derecho sobre ellos."
order: 46
module: "Ataques web más avanzados"
level: "intermedio"
draft: false
---

# Broken Object Level Authorization (BOLA)

En el tema anterior vimos la **exposición excesiva de datos en APIs**, un problema muy frecuente donde el sistema devuelve más información de la necesaria aunque el endpoint “funcione bien”.

Ahora vamos a estudiar una de las fallas más importantes y repetidas en APIs modernas: **Broken Object Level Authorization**, o **BOLA**.

La idea general es esta:

> la API permite acceder a un objeto concreto identificado por un ID, clave o referencia, pero no valida correctamente si la identidad que hace la solicitud tiene derecho real sobre ese objeto.

Esto vuelve a BOLA especialmente grave porque muchas APIs están construidas justamente alrededor de objetos:

- usuarios
- pedidos
- documentos
- mensajes
- tickets
- facturas
- archivos
- perfiles
- suscripciones
- configuraciones

Y si la validación de acceso a nivel de objeto está mal resuelta, una identidad autenticada puede terminar consultando, modificando o borrando recursos que pertenecen a otra.

Por eso BOLA es una de las categorías más críticas en seguridad de APIs.

---

## Qué significa “object level authorization”

La **autorización a nivel de objeto** es la decisión que responde una pregunta muy concreta:

> ¿esta identidad puede operar sobre este objeto específico?

No alcanza con saber que:

- el usuario está autenticado
- el token es válido
- el rol general existe
- el endpoint permite la operación

También hace falta validar algo más fino:

- ¿este pedido pertenece a esta cuenta?
- ¿este documento es accesible para esta identidad?
- ¿este ticket corresponde a este usuario?
- ¿este archivo puede ser leído por quien lo pide?
- ¿esta modificación está permitida sobre este recurso concreto?

Eso es autorización a nivel de objeto.

---

## Qué es Broken Object Level Authorization

**Broken Object Level Authorization (BOLA)** ocurre cuando la API falla al validar correctamente si una identidad tiene derecho a acceder a un objeto específico.

Dicho de forma simple:

- el sistema expone un recurso identificable
- la identidad hace una solicitud sobre ese recurso
- la API comprueba que la solicitud es válida en términos generales
- pero no comprueba con suficiente rigor si ese objeto concreto le corresponde a quien lo está pidiendo

La idea clave es esta:

> el problema no está solo en el endpoint, sino en la relación entre identidad y objeto.

Por eso BOLA puede verse como una forma especialmente importante de falla de autorización en APIs.

---

## Por qué esta falla es tan frecuente en APIs

Es muy frecuente porque las APIs suelen trabajar con recursos identificables de forma explícita.

Por ejemplo:

- `/usuarios/{id}`
- `/pedidos/{id}`
- `/documentos/{id}`
- `/mensajes/{id}`
- `/facturas/{id}`

Eso es completamente normal desde el punto de vista del diseño funcional.

El problema aparece cuando la API hace algo como esto:

- recibe el identificador del objeto
- valida autenticación
- busca el recurso
- responde o lo modifica
- pero no verifica bien si ese recurso pertenece o no a la identidad solicitante

Como las APIs modernas están llenas de operaciones basadas en identificadores, esta falla aparece con mucha frecuencia.

---

## Por qué es tan grave

BOLA es grave porque puede permitir que una cuenta común haga cosas como:

- ver datos ajenos
- modificar recursos de otra persona
- borrar objetos que no le pertenecen
- descargar archivos privados
- consultar historiales de terceros
- alterar estados de negocio sobre recursos ajenos

Y todo eso puede pasar **sin necesidad de volverse administrador**.

En muchos casos, basta con tener cualquier cuenta válida y luego aprovechar que la API no aísla correctamente los objetos entre identidades.

Por eso el impacto puede ser enorme sobre:

- confidencialidad
- integridad
- confianza del usuario
- cumplimiento
- operación del sistema

---

## Qué busca lograr un atacante con BOLA

El atacante puede buscar distintos objetivos según el tipo de objeto afectado.

### Leer recursos ajenos

Por ejemplo:

- pedidos
- documentos
- perfiles
- mensajes
- facturas
- historiales

### Modificar recursos ajenos

Por ejemplo:

- cambiar estados
- actualizar datos
- editar contenido
- marcar registros
- alterar configuraciones

### Borrar o destruir recursos

Si la API permite operaciones destructivas sin validar bien propiedad.

### Enumerar el sistema

Aunque no pueda modificar, acceder a objetos ajenos puede servir para descubrir:

- qué objetos existen
- cómo se organizan
- qué relaciones hay entre ellos
- qué usuarios o cuentas están presentes

La idea importante es esta:

> el atacante quiere romper el aislamiento entre objetos que deberían pertenecer a identidades distintas.

---

## Relación con IDOR

BOLA está muy relacionado con lo que antes vimos como **IDOR**.

De hecho, conceptualmente son problemas muy cercanos.

### En IDOR
Hablábamos de una referencia directa a un objeto sin autorización correcta.

### En BOLA
Hablamos de una API que no valida correctamente el acceso a nivel de objeto.

Podría decirse que:

- IDOR es un concepto clásico muy conocido
- BOLA es una forma moderna y especialmente relevante de pensar ese mismo problema en APIs

La idea central sigue siendo la misma:

> que un objeto exista y sea identificable no significa que cualquiera con acceso al endpoint deba poder usarlo.

---

## Qué diferencia hay entre autenticación y BOLA

Este punto es fundamental.

La API puede autenticar perfectamente a la persona usuaria y aun así seguir siendo vulnerable.

### Autenticación correcta
Significa que el sistema sabe quién hace la solicitud.

### BOLA
Aparece cuando, aun sabiendo quién es, la API no verifica correctamente si esa identidad puede acceder a **ese objeto**.

Por eso BOLA demuestra una lección muy importante:

> una API puede estar bien autenticada y, sin embargo, romper completamente el aislamiento entre recursos.

---

## Por qué no alcanza con validar el rol general

A veces un equipo piensa algo como:

- “si el usuario está autenticado como cliente, ya puede usar este endpoint”
- “si tiene rol de usuario, está bien”
- “si pasó el auth middleware, listo”

Pero eso no alcanza.

Dos personas pueden compartir el mismo rol general y aun así solo deberían acceder a **sus propios objetos**.

Por ejemplo:

- dos clientes
- dos alumnos
- dos compradores
- dos autores
- dos operadores

Tener el mismo rol no implica tener derecho sobre los mismos recursos.

Por eso BOLA exige una validación más fina que la del rol general.

---

## Qué suele fallar exactamente

A nivel conceptual, esta vulnerabilidad suele aparecer cuando la API comete errores como estos.

### Valida autenticación pero no propiedad

El sistema confirma que hay una identidad válida, pero no cruza adecuadamente el objeto con ella.

### Usa el ID del recurso sin verificar relación

La API procesa el identificador recibido como si fuera suficiente.

### Se apoya demasiado en el frontend

La UI solo muestra objetos “propios”, pero el backend no controla qué pasa si se solicita otro.

### Protege algunos métodos y otros no

Por ejemplo, valida bien la lectura, pero no la actualización o el borrado.

### Tiene controles inconsistentes entre endpoints

Una ruta verifica pertenencia; otra equivalente no.

La raíz vuelve a ser siempre la misma:

> la relación entre identidad, objeto y acción no está validada con suficiente rigor.

---

## Ejemplo conceptual simple

Imaginá una API que permite consultar un pedido por identificador.

Hasta ahí, eso es totalmente normal.

Ahora imaginá que el backend hace esto:

- valida que la persona esté autenticada
- busca el pedido por ID
- si existe, lo devuelve

Pero no valida correctamente si ese pedido pertenece a la cuenta que lo está solicitando.

Entonces la API deja de proteger el objeto a nivel individual.

Ese es el corazón de BOLA:

> la identidad tiene acceso al endpoint, pero no debería tener acceso a ese recurso concreto.

---

## Qué tipos de objetos suelen verse más afectados

Prácticamente cualquier objeto de negocio puede verse afectado.

### Objetos de cuenta
- perfiles
- preferencias
- sesiones auxiliares
- configuraciones

### Objetos transaccionales
- pedidos
- reservas
- pagos
- facturas
- solicitudes

### Objetos de contenido
- archivos
- documentos
- mensajes
- comentarios
- publicaciones privadas

### Objetos de workflow
- tickets
- estados
- aprobaciones
- asignaciones
- relaciones entre procesos

Mientras más sensible sea el objeto y más operaciones permita la API sobre él, más grave puede ser la falla.

---

## Qué impacto puede tener

El impacto depende del tipo de objeto y de la operación permitida.

### Sobre confidencialidad

Puede exponer información privada o sensible de otras personas.

### Sobre integridad

Puede permitir modificar o borrar recursos ajenos.

### Sobre operación

Puede alterar flujos de negocio si el objeto participa en procesos importantes.

### Sobre confianza y cumplimiento

Si los usuarios descubren que sus recursos no están correctamente aislados, el daño puede ser muy serio.

### Sobre ataques posteriores

La información obtenida puede facilitar:

- enumeración
- targeting
- abuso de lógica
- escaladas posteriores

---

## Qué señales pueden sugerir este problema

Hay varias situaciones que deberían hacer sospechar.

### Ejemplos conceptuales

- endpoints que aceptan IDs de objetos directamente
- recursos accesibles con solo cambiar la referencia del objeto
- respuestas exitosas sobre objetos no vinculados a la identidad
- operaciones de lectura, actualización o borrado que no cruzan usuario y recurso en el backend
- diferencias entre lo que la UI deja ver y lo que la API realmente acepta
- auditorías donde actor y objeto no guardan relación lógica

Muchas veces el problema aparece no como un error, sino como una respuesta “demasiado correcta” para quien la pidió.

---

## Por qué este problema puede pasar desapercibido

Pasa desapercibido con facilidad porque en el uso normal:

- cada persona consulta sus propios objetos
- el frontend muestra solo lo correcto
- la app parece funcionar bien
- nadie prueba sistemáticamente el cruce entre identidades y recursos ajenos

Además, como la autenticación puede estar bien hecha, el equipo puede sentir una falsa seguridad.

Pero BOLA vive en una capa más fina:

- no en “si hay sesión”
- sino en “si ese objeto concreto corresponde a esa sesión”

---

## Por qué es tan importante en APIs modernas

BOLA se volvió especialmente crítico en APIs modernas porque:

- casi todo se modela como recursos accesibles por ID
- hay más clientes consumiendo la misma lógica
- se automatizan más operaciones
- la exploración de endpoints y objetos es más fácil
- el backend real está en la API, no en la interfaz visual
- la velocidad de desarrollo puede llevar a confiar demasiado en filtros del frontend

En otras palabras:

> las APIs modernas multiplican la cantidad de lugares donde el sistema debe validar correctamente identidad contra objeto.

Y si esa validación no está centralizada o bien diseñada, la falla se repite con facilidad.

---

## Qué puede hacer una organización para prevenir BOLA

Desde una mirada defensiva, algunas ideas clave son:

- validar siempre en backend la relación entre identidad, objeto y acción
- no confiar en que el frontend ya filtró “lo correcto”
- no asumir que autenticación y rol general son suficientes
- revisar lectura, actualización, borrado y operaciones especiales por separado
- diseñar el acceso a objetos con el principio de mínimo privilegio
- testear explícitamente casos donde una identidad intenta acceder a objetos ajenos
- auditar endpoints con IDs o referencias directas a recursos
- tratar la autorización a nivel de objeto como una decisión central de diseño de API

La idea importante es esta:

> la API no debería preguntarse solo “¿quién sos?”, sino también “¿por qué deberías poder tocar exactamente este objeto?”.

---

## Error común: pensar que si el objeto tiene un ID “difícil”, ya está protegido

No.

Que el identificador sea menos obvio puede dificultar algo, pero no reemplaza la autorización real.

La defensa sólida no depende de que el objeto sea difícil de adivinar, sino de que aunque alguien lo conozca o lo obtenga, la API **rechace** el acceso si no corresponde.

La seguridad no puede descansar en la opacidad del identificador.

---

## Error común: creer que BOLA solo afecta lectura de datos

No.

Puede afectar también:

- actualización
- borrado
- descarga
- confirmación
- cambio de estado
- aprobación
- cualquier operación sobre un objeto concreto

A veces el impacto más grave no viene por ver un recurso, sino por poder modificarlo.

---

## Idea clave del tema

Broken Object Level Authorization (BOLA) ocurre cuando una API permite operar sobre un objeto específico sin validar correctamente si la identidad solicitante tiene derecho real sobre ese recurso.

Este tema enseña que:

- autenticación correcta no alcanza
- compartir rol general no implica compartir objetos
- el backend debe validar identidad, objeto y acción en cada operación relevante
- BOLA es una de las fallas más críticas y frecuentes en APIs modernas

---

## Resumen

En este tema vimos que:

- BOLA es una falla de autorización a nivel de objeto en APIs
- aparece cuando el sistema no valida bien si una identidad puede acceder a un recurso concreto
- está muy relacionado con IDOR y con la escalada horizontal
- puede afectar lectura, modificación, borrado y otras operaciones sobre objetos ajenos
- es especialmente frecuente en APIs porque casi todo se modela como recursos accesibles por identificador
- la defensa requiere validaciones explícitas de pertenencia o alcance en el backend

---

## Ejercicio de reflexión

Pensá en una API que expone:

- perfiles
- pedidos
- documentos
- tickets
- archivos
- configuraciones ligadas a usuarios

Intentá responder:

1. ¿qué endpoints operan sobre objetos identificables?
2. ¿cuáles serían más graves si no validaran correctamente pertenencia?
3. ¿por qué autenticación y rol general no alcanzan para protegerlos?
4. ¿qué pruebas harías para detectar BOLA en lectura, actualización y borrado?
5. ¿qué principio de diseño aplicarías para que la autorización a nivel de objeto no dependa del frontend?

---

## Autoevaluación rápida

### 1. ¿Qué es BOLA?

Es una falla donde la API no valida correctamente si una identidad tiene derecho a acceder u operar sobre un objeto específico.

### 2. ¿Por qué es tan frecuente en APIs?

Porque las APIs modernas exponen muchos recursos identificables por ID y es fácil olvidar validar bien la relación entre usuario y objeto.

### 3. ¿En qué se diferencia de solo “tener autenticación”?

En que autenticación dice quién sos, pero BOLA se refiere a si podés tocar ese recurso concreto.

### 4. ¿Qué defensa ayuda mucho a prevenirlo?

Validar en backend la relación entre identidad, objeto y acción para cada operación relevante, sin confiar en filtros del frontend ni en la opacidad del identificador.

---

## Próximo tema

En el siguiente tema vamos a estudiar el **Broken Function Level Authorization (BFLA)**, otra falla crítica en APIs donde el problema ya no está solo en el objeto concreto, sino en que ciertas funciones o acciones quedan accesibles para roles o identidades que no deberían poder ejecutarlas.
