---
title: "Escalada vertical de privilegios"
description: "Qué es la escalada vertical de privilegios, por qué puede permitir a un usuario alcanzar funciones de mayor autoridad y cómo suele aparecer por fallas de autorización o diseño del control de acceso."
order: 27
module: "Ataques contra autorización y control de acceso"
level: "intro"
draft: false
---

# Escalada vertical de privilegios

En el tema anterior vimos la **escalada horizontal de privilegios**, donde un usuario autenticado logra acceder a recursos de otro usuario del mismo nivel.

Ahora vamos a estudiar otra variante muy importante: la **escalada vertical de privilegios**.

La idea general es esta:

> una persona o cuenta con un nivel de acceso determinado consigue alcanzar funciones, recursos o permisos reservados a un nivel superior.

A diferencia de la escalada horizontal, donde el movimiento es “hacia los costados” entre pares equivalentes, acá el movimiento es **hacia arriba** en la jerarquía del sistema.

Por eso se llama **vertical**:

- no se trata de tocar los recursos de otro usuario similar
- se trata de llegar a capacidades que deberían pertenecer a un rol más poderoso

Este problema es especialmente grave porque puede convertir una cuenta común en la puerta de entrada hacia controles administrativos, operaciones sensibles y recursos de alto impacto.

---

## Qué significa “privilegio” en este contexto

Un **privilegio** es una capacidad que el sistema concede a una identidad.

Puede estar relacionado con:

- ver información
- modificar recursos
- borrar objetos
- aprobar operaciones
- acceder a paneles
- gestionar usuarios
- cambiar configuraciones
- ejecutar funciones internas
- administrar partes del sistema

No todos los usuarios deberían tener los mismos privilegios.

Por eso, muchas aplicaciones definen niveles o roles, por ejemplo:

- visitante
- usuario autenticado
- moderador
- soporte
- operador
- administrador
- superadministrador

Cada uno de esos niveles debería tener un alcance distinto.

---

## Qué es una escalada vertical de privilegios

Una **escalada vertical de privilegios** ocurre cuando un usuario o cuenta accede a permisos de un nivel superior sin que eso le corresponda.

Eso puede significar, por ejemplo:

- usar funciones administrativas siendo usuario común
- acceder a paneles reservados
- ejecutar acciones de gestión de otros usuarios
- cambiar configuraciones críticas
- manipular operaciones que requieren privilegios elevados
- alcanzar recursos internos destinados a perfiles más poderosos

La identidad puede seguir siendo la misma, pero el sistema le concede un alcance que no debería tener.

La clave está en esto:

> el problema no es solo que alguien accede a “más cosas”, sino que accede a cosas reservadas a una autoridad superior.

---

## Diferencia con la escalada horizontal

Conviene fijar bien esta diferencia.

### Escalada horizontal
Un usuario accede a recursos de otro usuario del mismo nivel.

Ejemplo conceptual:
- un cliente ve el pedido de otro cliente

### Escalada vertical
Un usuario accede a funciones o capacidades de un rol superior.

Ejemplo conceptual:
- un cliente o usuario común llega a una función reservada a administración

Ambas son fallas de autorización.  
La diferencia es la dirección del salto:

- **horizontal**: hacia recursos ajenos del mismo rango
- **vertical**: hacia capacidades superiores

---

## Por qué este problema es tan grave

La escalada vertical suele ser especialmente grave porque los privilegios altos concentran mucho poder.

Una vez que un atacante alcanza ese nivel, puede ganar capacidad para:

- ver información masiva
- cambiar permisos
- afectar a muchos usuarios a la vez
- manipular configuraciones críticas
- ocultar acciones
- modificar estados de negocio
- crear nuevas cuentas privilegiadas
- abrir caminos a otros sistemas o recursos

Es decir, no solo aumenta el acceso, sino también el **potencial de impacto**.

Por eso, una escalada vertical puede transformar un incidente relativamente acotado en un problema mucho más amplio.

---

## Qué suele fallar en estos casos

A nivel conceptual, este problema aparece cuando el sistema no controla bien quién puede usar funciones reservadas.

Algunas fallas típicas pueden incluir:

### Controles ausentes en el backend

La interfaz oculta una función administrativa, pero el servidor no valida correctamente el privilegio al recibir la acción.

### Roles mal verificados

El sistema supone que un usuario pertenece a cierto nivel o no comprueba bien si realmente tiene ese rol.

### Permisos demasiado amplios

Algunas cuentas reciben capacidades que exceden claramente lo que necesitan.

### Inconsistencia entre distintas partes del sistema

Una ruta, endpoint o pantalla sí valida privilegios altos, pero otra equivalente no.

### Flujos alternativos débiles

Una operación sensible está protegida en el camino principal, pero queda expuesta por una ruta secundaria, una API auxiliar o una lógica heredada.

### Confusión entre autenticación y autoridad

El sistema actúa como si “estar logueado” bastara para usar funciones que deberían requerir verificación de privilegio superior.

---

## Qué busca lograr un atacante con una escalada vertical

El atacante puede tener distintos objetivos, según el contexto.

### Obtener control administrativo

Acceder a paneles o funciones de mayor autoridad.

### Ampliar capacidad de acción

No solo ver datos, sino cambiar reglas, permisos, usuarios o configuraciones.

### Aumentar el alcance del incidente

Una cuenta común puede afectar uno o pocos recursos; una cuenta privilegiada puede afectar muchos más.

### Ocultar o sostener el acceso

Con más privilegios, puede resultar más fácil manipular el entorno, persistir o reducir visibilidad.

### Preparar ataques posteriores

El acceso elevado puede servir para mover lateralmente, alterar integraciones o abrir nuevas puertas.

---

## Ejemplo conceptual simple

Imaginá una aplicación donde:

- cualquier usuario puede iniciar sesión
- existe un panel administrativo para gestionar cuentas
- solo ciertos roles deberían poder usarlo

Ahora imaginá que, por una falla en la validación del backend, una cuenta común consigue llegar a una acción reservada a administración.

Aunque la persona siga siendo el mismo usuario, el sistema le está permitiendo operar como si tuviera un nivel superior.

Eso es una escalada vertical de privilegios:

- no está usando recursos de un par
- está alcanzando funciones reservadas a una capa más alta del sistema

---

## Relación con roles y modelos de permiso

Este problema aparece mucho cuando el diseño de roles y permisos es confuso, incompleto o demasiado flexible sin control claro.

Por ejemplo, si el sistema no tiene bien definido:

- qué acciones corresponden a cada rol
- qué recursos son sensibles
- qué validaciones deben aplicarse siempre
- qué diferencias reales existen entre un usuario y un administrador

entonces la autorización se vuelve inconsistente.

La seguridad mejora cuando el modelo de permisos es:

- explícito
- comprensible
- verificable
- coherente entre frontend, backend y APIs

Si el modelo de privilegios es ambiguo, la probabilidad de escaladas crece.

---

## Relación con mínimo privilegio

El principio de **mínimo privilegio** dice que cada identidad debería tener solo los permisos estrictamente necesarios para cumplir su función.

La escalada vertical es, en cierto sentido, la negación práctica de ese principio.

Si una cuenta puede terminar accediendo a funciones claramente superiores, entonces:

- los privilegios están mal delimitados
- los controles están mal aplicados
- la separación entre niveles es débil

Por eso este tema está muy ligado no solo a la autorización puntual, sino también al diseño general del acceso.

---

## Qué recursos o funciones suelen ser más delicados

Algunos recursos son especialmente sensibles frente a una escalada vertical.

### Gestión de usuarios
- crear cuentas
- modificar roles
- bloquear o desbloquear identidades
- cambiar credenciales o métodos de acceso

### Configuración del sistema
- cambiar parámetros críticos
- alterar integraciones
- modificar reglas de negocio
- activar o desactivar controles de seguridad

### Operaciones de administración
- ver información masiva
- moderar contenido
- aprobar acciones
- operar sobre cuentas de terceros
- ejecutar tareas reservadas

### Herramientas internas
- paneles de soporte
- dashboards de control
- interfaces de mantenimiento
- utilidades auxiliares expuestas

Mientras más poder concentre una función, más grave puede ser una autorización mal resuelta sobre ella.

---

## Qué señales pueden sugerir este problema

Detectarlo no siempre es simple, pero algunas situaciones deberían resultar sospechosas.

### Ejemplos conceptuales

- una cuenta común accede a rutas o funciones administrativas
- aparecen acciones de alto privilegio ejecutadas por identidades que no deberían poder hacerlas
- ciertos endpoints responden correctamente sin rol adecuado
- operaciones sensibles quedan disponibles a usuarios no autorizados
- la auditoría muestra desajustes entre rol y acción ejecutada
- cuentas de bajo privilegio producen cambios que solo deberían venir de administración

A veces el problema no se ve como un error, sino como una acción **demasiado exitosa** para el rol que la ejecutó.

---

## Qué impacto puede tener

El impacto suele ser mayor que en muchas otras fallas de autorización, porque el salto es hacia funciones de poder.

### Sobre confidencialidad
Puede abrir acceso a datos internos, globales o masivos.

### Sobre integridad
Puede permitir cambios críticos en configuraciones, permisos, estados o registros.

### Sobre operación
Puede afectar procesos de negocio, soporte, administración y continuidad del servicio.

### Sobre seguridad general
Puede abrir la puerta a persistencia, creación de nuevas cuentas poderosas o desactivación de controles.

### Sobre reputación y cumplimiento
Si el acceso elevado permite exposición o manipulación a gran escala, el daño puede ser enorme.

---

## Por qué este problema no siempre requiere una cuenta “importante”

A veces se piensa que para llegar a algo crítico hay que comprometer una cuenta ya poderosa.

Pero la escalada vertical demuestra justamente lo contrario:

> una cuenta muy común puede ser suficiente si el sistema no separa bien los niveles de privilegio.

Esto vuelve especialmente peligroso cualquier acceso inicial, incluso uno aparentemente menor.

Una cuenta básica ya no es solo “un usuario más” si puede convertirse en un punto de salto hacia administración.

---

## Qué puede hacer una organización para reducir este riesgo

Desde una mirada defensiva, algunas ideas clave son:

- definir con claridad qué acciones corresponden a cada rol
- validar privilegios en el backend para toda función sensible
- no confiar en que ocultar opciones en la interfaz alcanza
- aplicar mínimo privilegio de manera real
- revisar consistencia entre API, frontend y paneles internos
- auditar funciones administrativas y su exposición
- testear explícitamente si usuarios comunes pueden alcanzar acciones de mayor nivel
- revisar flujos heredados o secundarios donde los controles suelen aflojarse

La idea central es que la jerarquía de permisos debe ser real, no solo visual o declarativa.

---

## Error común: pensar que un panel oculto ya está protegido

No.

Que una función administrativa no aparezca en la interfaz normal no significa que esté correctamente protegida.

Si el backend no valida bien el privilegio, la función puede seguir estando disponible para quien no corresponde.

La seguridad no puede depender de “que no se vea”.  
Tiene que depender de controles efectivos de acceso.

---

## Error común: creer que si el usuario ya es legítimo, el sistema puede confiar más de lo debido

El hecho de que alguien tenga una cuenta válida no lo habilita para usar funciones reservadas.

Ese salto de confianza es justamente el corazón de muchas escaladas verticales.

Una buena autorización debe preguntar siempre:

- ¿quién es esta identidad?
- ¿qué rol tiene?
- ¿esta acción específica le corresponde?
- ¿sobre este recurso concreto?
- ¿en este contexto?

Si esas preguntas se simplifican demasiado, el riesgo aumenta.

---

## Idea clave del tema

La escalada vertical de privilegios ocurre cuando una cuenta o identidad alcanza funciones, acciones o recursos reservados a un nivel superior debido a una falla de autorización o a un mal diseño del control de acceso.

Este tema enseña que:

- el problema no es solo entrar al sistema
- también importa que los niveles de autoridad estén correctamente separados
- una cuenta común puede volverse muy peligrosa si puede saltar a funciones administrativas
- el mínimo privilegio y la validación consistente en backend son esenciales

---

## Resumen

En este tema vimos que:

- la escalada vertical es una falla de autorización donde se alcanzan privilegios superiores
- se diferencia de la escalada horizontal porque no va hacia pares equivalentes, sino hacia niveles más altos
- puede afectar paneles, configuraciones, gestión de usuarios y funciones críticas
- suele aparecer por validaciones ausentes, inconsistentes o mal distribuidas
- el impacto puede ser enorme porque los privilegios altos concentran mucho poder
- la defensa requiere roles claros, backend estricto y pruebas específicas sobre funciones sensibles

---

## Ejercicio de reflexión

Pensá en una aplicación con:

- usuarios comunes
- soporte
- moderadores
- administradores
- panel de configuración
- API de gestión de cuentas
- funciones internas reservadas

Intentá responder:

1. ¿qué acciones deberían quedar reservadas a privilegios altos?
2. ¿qué error de diseño podría permitir que un usuario común llegue a ellas?
3. ¿qué diferencias debería validar siempre el backend entre roles?
4. ¿qué casos de prueba harías para buscar escalada vertical?
5. ¿qué logs o eventos revisarías para detectar este tipo de abuso?

---

## Autoevaluación rápida

### 1. ¿Qué es una escalada vertical de privilegios?

Es cuando una cuenta o usuario accede a funciones o recursos reservados a un nivel superior de autoridad.

### 2. ¿En qué se diferencia de la escalada horizontal?

En que la horizontal va hacia recursos de pares equivalentes, mientras que la vertical sube hacia capacidades de mayor privilegio.

### 3. ¿Por qué suele ser tan grave?

Porque puede abrir acceso a funciones administrativas, configuraciones críticas y recursos de alto impacto.

### 4. ¿Qué defensa ayuda mucho a prevenirla?

Validar privilegios de forma consistente en el backend, aplicar mínimo privilegio y revisar con rigor todas las funciones sensibles.

---

## Próximo tema

En el siguiente tema vamos a estudiar los **IDOR y el acceso inseguro a recursos**, una categoría muy importante porque suele materializar tanto problemas de escalada horizontal como fallas de control de acceso a nivel de objeto.
