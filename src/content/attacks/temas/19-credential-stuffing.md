---
title: "Credential stuffing"
description: "Qué es el credential stuffing, por qué es distinto de adivinar contraseñas y cómo aprovecha la reutilización de credenciales filtradas entre distintos servicios."
order: 19
module: "Ataques contra autenticación"
level: "intro"
draft: false
---

# Credential stuffing

En los temas anteriores vimos ataques que intentan acertar una contraseña:

- fuerza bruta
- dictionary attacks

Ahora vamos a ver una lógica distinta y muy importante: el **credential stuffing**.

En este caso, el atacante no intenta adivinar una credencial probable ni recorrer combinaciones posibles.  
En cambio, parte de una suposición muy práctica:

> si una persona reutiliza sus credenciales en más de un servicio, una filtración previa puede servir para entrar en otro sistema distinto.

Eso vuelve a este ataque especialmente peligroso, porque aprovecha un problema muy común del mundo real:

- reutilización de usuario y contraseña
- cuentas reutilizadas entre servicios personales y profesionales
- hábitos repetidos de acceso
- exposición previa de credenciales en incidentes ajenos al sistema atacado

---

## Qué es el credential stuffing

El **credential stuffing** es un ataque contra autenticación basado en reutilizar credenciales que ya fueron filtradas previamente en otro contexto.

En lugar de intentar descubrir una contraseña nueva, el atacante usa pares de acceso que alguna vez fueron válidos en otro sistema y prueba si la misma combinación funciona también acá.

La lógica es esta:

- la credencial fue expuesta en algún incidente anterior
- el usuario reutilizó la misma combinación en más de un servicio
- el atacante intenta aprovechar esa reutilización

La idea importante es que este ataque **no depende tanto de adivinar**, sino de **reaprovechar** accesos que ya existían.

---

## Por qué este ataque es tan relevante

Es muy relevante porque ataca una costumbre muy extendida:

> usar la misma contraseña, o una muy parecida, en distintos servicios.

Desde el punto de vista del atacante, eso es extremadamente útil.

¿Por qué?

Porque evita parte del esfuerzo que implicarían otros ataques:

- no hace falta acertar una contraseña desde cero
- no hace falta construir una lista puramente hipotética
- no hace falta confiar tanto en la previsibilidad humana
- se parte de credenciales que ya fueron reales en algún momento

Eso hace que el credential stuffing pueda ser muy rentable cuando existe reutilización de accesos.

---

## Qué diferencia hay con otros ataques de autenticación

Conviene separar bien estas categorías.

### Fuerza bruta
Prueba múltiples combinaciones hasta acertar una válida.

### Dictionary attack
Prueba contraseñas probables basadas en hábitos humanos.

### Credential stuffing
Prueba credenciales reales obtenidas en filtraciones previas, apostando a que el usuario las reutiliza.

La diferencia principal es esta:

- en la fuerza bruta y en el dictionary attack se intenta **adivinar**
- en credential stuffing se intenta **reusar**

Eso cambia bastante la lógica ofensiva y también algunas medidas defensivas más importantes.

---

## Por qué funciona

Funciona cuando coinciden dos factores:

1. existe una credencial expuesta o filtrada de otro incidente
2. el usuario reutiliza esa misma combinación en el sistema atacado

Es decir, el problema no empieza necesariamente en el sistema objetivo.  
Puede empezar en otra parte del ecosistema digital del usuario.

Por ejemplo, si una persona reutiliza accesos entre:

- servicios personales
- plataformas antiguas
- cuentas de trabajo
- foros, tiendas, apps o herramientas externas

entonces una filtración en cualquiera de esos contextos puede terminar afectando a otros.

Esto vuelve al credential stuffing especialmente peligroso porque el riesgo puede venir “de afuera”.

---

## Qué busca lograr un atacante con este ataque

El objetivo suele ser conseguir acceso válido con el menor esfuerzo posible.

Una vez adentro, el atacante puede:

- leer información privada
- secuestrar cuentas
- cambiar datos del usuario
- operar como si fuera la persona legítima
- llegar a recursos más sensibles
- usar una cuenta comprometida como paso previo hacia otras acciones

Si además la cuenta reutilizada tiene valor especial, el impacto puede crecer mucho.

Por ejemplo, si se trata de:

- cuentas administrativas
- cuentas de soporte
- accesos privilegiados
- usuarios con información sensible
- identidades con permisos sobre otros recursos

---

## Por qué este ataque puede ser más eficiente que otros

En muchos escenarios, credential stuffing puede ser más eficiente que tratar de adivinar contraseñas.

¿Por qué?

Porque el atacante trabaja con credenciales que ya fueron reales.  
No está partiendo de una hipótesis puramente estadística.

Eso puede reducir:

- el número de intentos necesarios
- el tiempo de prueba
- la necesidad de probar demasiadas variaciones
- el ruido que dejaría un ataque más extenso

No quiere decir que siempre vaya a funcionar.  
Pero sí que, cuando hay reutilización, puede ser una vía muy efectiva.

---

## Qué papel juega la automatización

La automatización es muy importante en este tipo de ataque.

Un atacante puede querer probar muchas credenciales filtradas sobre uno o varios servicios.  
Si eso se hace de forma automatizada, la escala y la velocidad del problema crecen mucho.

Esto vuelve especialmente riesgosos los sistemas que:

- exponen login públicamente
- no aplican límites razonables a intentos
- no detectan patrones anómalos
- no usan MFA
- no monitorean actividad de acceso fuera de patrón

Otra vez, no es la automatización por sí sola la que genera el problema, sino la combinación entre automatización y malas prácticas defensivas.

---

## Relación con filtraciones previas

Una de las claves del credential stuffing es que se apoya en incidentes anteriores.

Eso significa que una organización puede verse afectada aunque **ella misma no haya sido la fuente original de la filtración**.

Ese es un punto muy importante.

A veces el sistema atacado puede tener:

- buena infraestructura
- código razonable
- autenticación funcional

y aun así sufrir intentos exitosos porque sus usuarios arrastran credenciales reutilizadas desde otros servicios comprometidos.

Esto muestra que la seguridad de autenticación depende no solo del sistema, sino también del comportamiento de las personas y del ecosistema donde ya usaron sus accesos.

---

## Qué señales puede dejar este ataque

Credential stuffing puede dejar señales visibles si el sistema tiene buen monitoreo.

Algunas posibles señales son:

- múltiples intentos fallidos sobre muchas cuentas
- secuencias de acceso con patrones repetitivos
- picos anómalos sobre el endpoint de login
- accesos exitosos que siguen a lotes de fallos
- intentos distribuidos sobre muchas cuentas distintas
- inicios de sesión desde contextos poco habituales
- comportamiento posterior sospechoso una vez que alguna cuenta fue comprometida

A veces este ataque puede parecerse en logs a otras formas de presión sobre autenticación, pero conceptualmente se distingue por la reutilización de credenciales previamente expuestas.

---

## Qué cuentas suelen ser más atractivas

Como en otros ataques de autenticación, no todas las cuentas tienen el mismo valor.

Un atacante puede interesarse especialmente por:

- cuentas con privilegios altos
- usuarios con acceso a datos sensibles
- cuentas con capacidad de gestionar otras identidades
- perfiles con funciones administrativas
- accesos de servicio reutilizados indebidamente
- usuarios con valor económico o reputacional

Eso significa que la organización no solo debería pensar en la probabilidad del ataque, sino también en **qué cuentas serían más dañinas si fueran comprometidas**.

---

## Qué factores agravan el riesgo

Hay varios factores que vuelven más grave este ataque.

### Reutilización de contraseñas
Es el factor central.

### Ausencia de MFA
Si acertar usuario y contraseña basta para entrar, el riesgo crece mucho.

### Falta de detección de accesos anómalos
Si no se observan patrones raros, el atacante puede tener más margen.

### Cuentas privilegiadas sin protección reforzada
El impacto cambia muchísimo según el valor del acceso comprometido.

### Exposición pública del login sin fricción adecuada
Si el punto de entrada está abierto y sin controles adicionales, el ataque gana superficie.

---

## Qué defensas reducen mucho su efectividad

Este ataque pierde mucha fuerza cuando el sistema incorpora defensas adecuadas.

### MFA

Es una de las defensas más importantes.  
Aunque la credencial haya sido correcta, un segundo factor puede bloquear el acceso.

### Detección de accesos anómalos

Ubicación, dispositivo, horario, velocidad, reputación o contexto pueden ayudar a detectar uso indebido.

### Límites y fricción en autenticación

Rate limiting, bloqueos temporales o controles adaptativos dificultan la prueba masiva de credenciales.

### Políticas contra reutilización interna

Aunque una organización no pueda controlar lo que el usuario hace en toda internet, sí puede reducir el daño mediante mejores prácticas internas y protección reforzada.

### Protección extra para cuentas sensibles

Las cuentas privilegiadas deberían tener capas adicionales de control.

---

## Por qué no alcanza con “tener un login seguro”

Este tema deja una enseñanza importante:

> un sistema puede tener un login técnicamente correcto y aun así ser vulnerable al abuso de credenciales reutilizadas.

Eso pasa porque el problema no está solo en el formulario o en el backend de autenticación, sino en la realidad del comportamiento humano.

Por eso la defensa contra credential stuffing requiere pensar más allá del simple campo usuario/contraseña.

---

## Ejemplo conceptual

Imaginá una plataforma con login público, sin MFA, y usuarios que reutilizan contraseñas entre distintos servicios.

Si alguna de esas personas vio expuestas sus credenciales en otra plataforma meses antes, un atacante podría probar esa combinación en este sistema.

No hace falta que el sistema actual haya filtrado nada.  
El riesgo aparece porque el usuario trajo consigo una debilidad nacida en otro lado.

Ese es uno de los motivos por los que este ataque es tan importante de entender.

---

## Relación con la gestión de identidad

Credential stuffing muestra muy bien que la seguridad de identidad no es solo un tema técnico, sino también un problema de hábitos y gestión.

Implica pensar en cosas como:

- reutilización
- valor de las cuentas
- monitoreo contextual
- autenticación reforzada
- segmentación de privilegios
- respuesta temprana ante actividad sospechosa

O sea, no basta con “pedir contraseña”.  
Hay que diseñar la autenticación pensando en abuso real.

---

## Error común: creer que si la contraseña no es débil entonces no hay problema

No necesariamente.

En credential stuffing, una contraseña puede ser bastante fuerte desde el punto de vista técnico, pero seguir siendo peligrosa si fue reutilizada y ya quedó filtrada en otro servicio.

Ese es un punto clave:

- una contraseña fuerte y única ofrece mucha más protección
- una contraseña fuerte pero reutilizada puede seguir siendo un problema serio

La unicidad importa tanto como la fortaleza.

---

## Error común: pensar que este ataque solo afecta a usuarios comunes

No.

Puede afectar también:

- cuentas administrativas
- operadores
- soporte
- cuentas de servicio
- perfiles internos de alto valor

Y cuanto más privilegio tenga la cuenta, mayor puede ser el impacto final.

Por eso, la protección reforzada debería priorizar especialmente a identidades sensibles.

---

## Idea clave del tema

Credential stuffing es un ataque que reutiliza credenciales filtradas previamente en otros contextos, apostando a que los usuarios repiten esas mismas combinaciones en distintos servicios.

Su fuerza está en aprovechar:

- filtraciones previas
- hábitos de reutilización
- ausencia de MFA
- monitoreo insuficiente
- exposición pública del login

No se basa tanto en adivinar, sino en **reusar accesos reales** que ya existieron.

---

## Resumen

En este tema vimos que:

- credential stuffing reutiliza credenciales filtradas previamente
- se diferencia de la fuerza bruta y del dictionary attack porque no intenta adivinar desde cero
- funciona cuando los usuarios reutilizan accesos entre distintos servicios
- puede afectar a una organización aunque la filtración original haya ocurrido en otro lugar
- MFA, monitoreo contextual y fricción sobre autenticación reducen mucho su efectividad
- la unicidad de la contraseña es tan importante como su fortaleza

---

## Ejercicio de reflexión

Pensá en una plataforma con:

- login público
- usuarios comunes
- cuentas administrativas
- ausencia de MFA para parte de los accesos
- historial de usuarios que también usan otros servicios externos

Intentá responder:

1. ¿por qué esta plataforma podría ser vulnerable a credential stuffing aunque nunca haya filtrado credenciales propias?
2. ¿qué cuentas serían más críticas si fueran comprometidas?
3. ¿qué señales podrías buscar para detectar este ataque?
4. ¿qué defensa tendría más impacto inmediato?
5. ¿qué diferencia hay entre una contraseña fuerte reutilizada y una fuerte no reutilizada?

---

## Autoevaluación rápida

### 1. ¿Qué es credential stuffing?

Es un ataque que reutiliza credenciales filtradas previamente en otros servicios para intentar acceder a una cuenta en un sistema distinto.

### 2. ¿En qué se diferencia de la fuerza bruta?

En que no intenta adivinar desde cero, sino aprovechar credenciales reales que ya fueron válidas en otro contexto.

### 3. ¿Por qué puede afectar a una organización aunque no haya sufrido una filtración propia?

Porque sus usuarios pueden haber reutilizado credenciales expuestas en otros incidentes ajenos al sistema.

### 4. ¿Qué defensa reduce mucho su efectividad?

MFA, monitoreo contextual, protección reforzada de cuentas sensibles y fricción sobre intentos de acceso.

---

## Próximo tema

En el siguiente tema vamos a estudiar el **password spraying**, una técnica relacionada con autenticación en la que el atacante no insiste mucho sobre una sola cuenta, sino que prueba pocas contraseñas comunes sobre muchas cuentas diferentes para reducir detección y bloqueos tempranos.
