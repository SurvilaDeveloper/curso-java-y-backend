---
title: "Fases comunes de un ataque"
description: "Panorama general de las fases que suelen aparecer en muchos ataques, desde el reconocimiento inicial hasta la acción sobre el objetivo y la persistencia."
order: 6
module: "Fundamentos de los ataques"
level: "intro"
draft: false
---

# Fases comunes de un ataque

Cuando una persona empieza a estudiar seguridad, a veces imagina un ataque como un único momento: alguien “entra” a un sistema y listo.

Pero en la práctica, muchos ataques no ocurren en un solo paso.  
Suelen desarrollarse como una **secuencia de fases**.

No todos los incidentes siguen exactamente el mismo recorrido, y no todos los ataques tienen el mismo nivel de complejidad.  
Sin embargo, existe un patrón general que ayuda muchísimo a entender cómo se prepara, se ejecuta y se aprovecha una intrusión.

Estudiar esas fases permite responder mejor preguntas como estas:

- ¿qué hizo primero el atacante?
- ¿cómo llegó hasta el objetivo?
- ¿qué señales dejó en el camino?
- ¿en qué punto se podría haber detectado?
- ¿qué controles habrían frenado el avance?

---

## Por qué conviene pensar los ataques por fases

Mirar un ataque como un proceso tiene varias ventajas.

Primero, evita una visión demasiado simplista.  
Segundo, ayuda a analizar mejor tanto la prevención como la detección.  
Y tercero, permite entender que muchas defensas no bloquean “todo el ataque”, sino una etapa concreta.

Por ejemplo:

- una buena configuración puede frenar el reconocimiento útil
- un control de acceso puede bloquear la explotación
- el monitoreo puede detectar movimiento lateral
- la segmentación puede reducir el impacto final

Esto significa que defender no es solamente “evitar que empiece”, sino también **interrumpir el progreso del ataque**.

---

## Idea general: un ataque suele progresar

Aunque cada caso es distinto, en muchos escenarios aparece una lógica parecida:

1. el atacante reúne información
2. identifica una oportunidad
3. intenta obtener acceso
4. amplía o consolida ese acceso
5. busca cumplir su objetivo
6. intenta mantenerse o desaparecer sin ser detectado

No siempre aparecen todas estas etapas.  
A veces un ataque es muy corto y directo.  
Otras veces dura días, semanas o meses.

Lo importante es entender que muchas intrusiones avanzan de manera gradual.

---

## Fase 1 — Reconocimiento

La primera fase frecuente es el **reconocimiento**.

En esta etapa, el atacante intenta averiguar cosas sobre el objetivo.  
No necesariamente interactúa todavía de forma agresiva.  
A veces solo observa, recolecta y ordena información.

Puede intentar descubrir:

- qué dominio o subdominios existen
- qué tecnologías usa la víctima
- qué servicios están expuestos
- qué rutas o endpoints parecen sensibles
- qué usuarios o correos pueden existir
- qué empleados o roles son relevantes
- qué información pública podría ser útil

### Qué busca lograr esta fase

Reducir incertidumbre.

Cuanto más sabe el atacante, más fácil le resulta elegir un vector de entrada útil.

### Ejemplos de esta fase

- búsqueda de paneles expuestos
- identificación de versiones de software
- recopilación de correos para phishing
- revisión de repositorios públicos
- detección de servicios y puertos visibles

---

## Fase 2 — Enumeración y validación de oportunidades

Después del reconocimiento, muchas veces viene una etapa más concreta: confirmar qué caminos realmente son aprovechables.

Acá el atacante ya no solo observa.  
Empieza a probar, verificar y acotar posibilidades.

Puede intentar responder preguntas como:

- ¿ese panel realmente existe?
- ¿ese usuario es válido?
- ¿esa API responde de forma útil?
- ¿ese servicio parece mal configurado?
- ¿esa vulnerabilidad podría explotarse en este sistema?

Esta fase puede incluir pruebas más activas, aunque todavía no siempre impliquen una intrusión consumada.

### Ejemplos

- probar si un endpoint devuelve datos sensibles
- verificar si una ruta administrativa responde
- confirmar si una versión vulnerable está realmente en uso
- comprobar si hay diferencia entre usuarios válidos e inválidos
- detectar si una autenticación permite abuso automatizado

---

## Fase 3 — Acceso inicial

En esta etapa, el atacante intenta conseguir un primer punto de entrada real.

Ese acceso inicial puede lograrse de muchas formas, por ejemplo:

- credenciales robadas o débiles
- phishing
- explotación de una vulnerabilidad
- abuso de una mala configuración
- acceso a una consola expuesta
- utilización de una cuenta ya comprometida

No siempre se trata de un acceso “administrativo”.  
A veces el acceso inicial es limitado, pero suficiente para seguir avanzando.

### Idea importante

Un primer acceso no siempre es el objetivo final.  
Muchas veces es solo la puerta de entrada.

---

## Fase 4 — Ejecución o explotación efectiva

Una vez que existe una oportunidad clara, el atacante puede intentar ejecutar acciones concretas para explotar la debilidad.

Esto puede incluir:

- enviar una entrada manipulada
- ejecutar una acción no autorizada
- forzar una operación del sistema
- usar credenciales válidas para entrar
- aprovechar una lógica defectuosa
- activar una cadena de pasos que produce un efecto útil

Dependiendo del tipo de ataque, esta fase puede coincidir con el acceso inicial o venir inmediatamente después.

### Ejemplo conceptual

Si una aplicación es vulnerable a una inyección, la ejecución efectiva ocurre cuando el atacante logra que la aplicación procese la entrada maliciosa de manera útil para sus fines.

---

## Fase 5 — Escalada o ampliación de acceso

Después de entrar, muchos atacantes intentan mejorar su posición.

Esto puede significar:

- obtener más privilegios
- acceder a más recursos
- pasar de una cuenta común a una administrativa
- llegar a otros sistemas internos
- descubrir secretos, tokens o llaves
- abusar de permisos excesivos

Esta fase es muy importante porque muchas intrusiones no se quedan en el primer punto de acceso.

### Qué busca lograr

Pasar de un acceso limitado a uno más valioso.

---

## Fase 6 — Movimiento lateral

En ataques más complejos, sobre todo en entornos corporativos, puede aparecer el **movimiento lateral**.

Eso ocurre cuando el atacante usa un acceso ya conseguido para desplazarse hacia otros sistemas, cuentas o servicios relacionados.

Por ejemplo:

- desde una aplicación comprometida hacia una base de datos
- desde una cuenta de usuario hacia una cuenta con más privilegios
- desde un equipo comprometido hacia otros activos internos
- desde una credencial filtrada hacia varios servicios

### Por qué es importante

Porque muestra que el daño no siempre queda encerrado en el primer sistema alcanzado.

---

## Fase 7 — Acción sobre el objetivo

En esta etapa, el atacante intenta concretar aquello que realmente busca.

El objetivo puede variar mucho:

- robar datos
- alterar información
- secuestrar cuentas
- instalar malware
- cifrar archivos
- interrumpir un servicio
- obtener persistencia
- usar recursos ajenos
- dañar la operación
- espiar actividad

Dicho de otro modo, acá se materializa el valor del ataque para el agresor.

---

## Fase 8 — Persistencia

En algunos casos, el atacante no quiere un acceso momentáneo, sino mantener la posibilidad de volver.

La **persistencia** consiste en generar mecanismos que permitan conservar el acceso o recuperarlo más adelante.

Esto puede hacerse de distintas maneras según el entorno, pero la idea general es la misma:

> no depender de una sola oportunidad efímera.

### Ejemplos conceptuales

- crear accesos adicionales
- dejar credenciales o tokens útiles
- modificar configuraciones para conservar entrada
- establecer mecanismos difíciles de detectar
- apoyarse en accesos alternativos

No siempre aparece esta fase, pero cuando aparece suele volver más grave el incidente.

---

## Fase 9 — Evasión y ocultamiento

Muchos atacantes intentan reducir las probabilidades de ser detectados.

Para eso pueden buscar:

- dejar menos rastros
- parecer actividad normal
- distribuir sus acciones en el tiempo
- evitar comportamientos muy ruidosos
- ocultar accesos o cambios realizados

Cuanto más importante es el objetivo, más probable es que el atacante intente pasar desapercibido durante más tiempo.

Esto no significa que siempre lo logre, pero sí que la detección puede volverse más difícil si la organización no monitorea bien.

---

## No todos los ataques pasan por todas las fases

Este punto es importante.

Un ataque simple puede durar segundos y no incluir casi ninguna de estas etapas de forma visible.

Por ejemplo:

- un bot encuentra una contraseña débil
- entra
- roba algo
- termina

En cambio, un ataque más preparado puede incluir:

- reconocimiento
- recopilación de información
- spear phishing
- acceso inicial
- escalada
- movimiento lateral
- extracción de datos
- persistencia

Por eso hay que pensar estas fases como un **modelo útil**, no como una receta rígida.

---

## Ejemplo simple de secuencia completa

Imaginá una organización con un panel administrativo expuesto y un equipo interno poco entrenado contra phishing.

Una secuencia posible podría ser:

1. el atacante identifica correos y tecnologías usadas
2. detecta un punto de acceso interesante
3. envía un correo convincente a una persona con privilegios
4. obtiene credenciales
5. entra al panel
6. busca más recursos o permisos
7. accede a información sensible
8. intenta mantener acceso para volver después

No hace falta bajar a nivel técnico para entender algo clave:

> el ataque fue progresando.

Y si progresó, entonces había varias oportunidades para detectarlo o frenarlo.

---

## Cómo ayuda esto a defender

Pensar por fases mejora mucho la defensa.

### En prevención
Porque permite reforzar distintos puntos:

- exposición pública
- autenticación
- permisos
- segmentación
- actualización de sistemas
- manejo de secretos
- validación de entradas

### En detección
Porque ayuda a reconocer señales tempranas:

- escaneos o enumeración extraña
- intentos repetidos de acceso
- cambios inusuales de privilegios
- accesos fuera de patrón
- conexiones entre sistemas poco habituales
- exfiltración o uso anómalo de recursos

### En respuesta
Porque ayuda a reconstruir qué pasó:

- cómo empezó
- por dónde avanzó
- qué activos tocó
- si hubo persistencia
- qué riesgo sigue activo

---

## Error común: pensar solo en la fase final

Muchas veces se analiza un incidente enfocándose únicamente en el daño visible.

Por ejemplo:

- “robaron datos”
- “entraron a una cuenta”
- “se cayó el sistema”

Pero esa es solo la parte final o más visible.

Si no entendés las fases previas, te perdés:

- cómo se abrió la puerta
- qué señales aparecieron antes
- qué controles faltaron
- dónde se podría haber detenido el avance

En seguridad, mirar solo el resultado final suele ser insuficiente.

---

## Error común: creer que detectar tarde es igual de útil que detectar temprano

No es lo mismo encontrar un problema en reconocimiento que encontrarlo después de la exfiltración de datos.

Mientras más temprano se detecta una fase, más oportunidades hay de reducir impacto.

Por eso la defensa no debería depender solo de “detectar el desastre”, sino también de identificar progresos sospechosos antes de llegar al objetivo final.

---

## Idea clave del tema

Muchos ataques no son un solo evento, sino un proceso que avanza por etapas.

Aunque cada caso es distinto, suele ser útil pensar en fases como:

- reconocimiento
- validación de oportunidades
- acceso inicial
- explotación
- escalada
- movimiento lateral
- acción sobre el objetivo
- persistencia
- evasión

Este enfoque ayuda a prevenir, detectar y responder mejor.

---

## Resumen

En este tema vimos que:

- muchos ataques progresan de forma gradual
- el reconocimiento suele ser una etapa temprana clave
- el acceso inicial no siempre es el objetivo final
- después de entrar, el atacante puede ampliar privilegios o moverse lateralmente
- la acción final puede ser robo, alteración, interrupción o persistencia
- no todos los ataques siguen todas las fases
- aun así, pensar por etapas es muy útil para defender

---

## Ejercicio de reflexión

Tomá como ejemplo una aplicación con:

- login
- panel de usuario
- panel administrativo
- base de datos
- almacenamiento de archivos

Intentá imaginar una secuencia posible de ataque y responder:

1. ¿qué podría hacer un atacante en reconocimiento?
2. ¿qué tipo de acceso inicial buscaría?
3. ¿cómo podría ampliar el impacto?
4. ¿qué señales deberían encender alertas?
5. ¿qué controles interrumpirían la secuencia?

---

## Autoevaluación rápida

### 1. ¿Todos los ataques siguen exactamente las mismas fases?

No. Las fases sirven como modelo general, pero no todos los ataques recorren el mismo camino.

### 2. ¿Qué suele buscar la fase de reconocimiento?

Reducir incertidumbre reuniendo información útil sobre el objetivo.

### 3. ¿El acceso inicial siempre es el objetivo final?

No. Muchas veces es solo el primer paso para avanzar hacia algo de mayor valor.

### 4. ¿Por qué es útil detectar temprano un ataque?

Porque permite frenar el avance antes de que el impacto sea mayor.

---

## Próximo tema

En el siguiente tema vamos a estudiar los **indicadores de compromiso**, es decir, las señales que pueden sugerir que un sistema, una cuenta o un servicio ya fue afectado o está siendo abusado.
