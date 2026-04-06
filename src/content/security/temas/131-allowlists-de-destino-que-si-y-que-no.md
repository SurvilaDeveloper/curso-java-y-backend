---
title: "Allowlists de destino: qué sí y qué no"
description: "Cómo pensar allowlists de destino para mitigar SSRF en una aplicación Java con Spring Boot. Qué hace que una allowlist sea realmente útil, qué errores la vuelven débil y por qué no alcanza con permitir dominios 'parecidos' o listas amplias difíciles de auditar."
order: 131
module: "Consumo saliente, SSRF y conexiones externas"
level: "base"
draft: false
---

# Allowlists de destino: qué sí y qué no

## Objetivo del tema

Entender cómo pensar **allowlists de destino** para reducir riesgo de SSRF en una aplicación Java + Spring Boot.

La idea de este tema es tocar una defensa muy común y, al mismo tiempo, muy fácil de usar mal.

Cuando un equipo detecta que una funcionalidad hace requests salientes influenciadas por usuarios, una reacción habitual es:

- “hagamos una whitelist”
- “permitamos solo ciertos dominios”
- “bloqueemos todo salvo lo conocido”
- “si el host está en la lista, ya estamos bastante bien”

Eso puede ser una mejora real.
Pero no siempre.

Porque una allowlist sirve de verdad solo si responde bien preguntas como:

- ¿qué estamos permitiendo exactamente?
- ¿permitimos nombres o destinos reales?
- ¿quién controla esos destinos?
- ¿qué tan estable y auditable es la lista?
- ¿qué pasa con redirects, DNS y subdominios?
- ¿la lista expresa confianza real o solo una apariencia de control?

En resumen:

> una allowlist no es buena por existir.  
> Es buena cuando delimita destinos realmente confiables, de forma precisa, verificable y difícil de ensanchar por accidente.

---

## Idea clave

Una allowlist de destino intenta responder algo muy simple:

> “¿a qué lugares sí queremos que el backend esté autorizado a conectarse en esta funcionalidad?”

Eso ya es una mejora importante frente a:

- cualquier URL
- cualquier host
- cualquier callback
- cualquier redirect
- cualquier integración configurada por el usuario

La idea central es esta:

> en SSRF, una allowlist puede ser una defensa muy valiosa, pero solo si expresa una confianza concreta sobre destinos salientes.  
> No si se convierte en una lista amplia, ambigua o tan flexible que deja pasar casi todo lo que importa bloquear.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- creer que cualquier whitelist ya mitiga SSRF
- usar allowlists basadas solo en nombre textual
- permitir subdominios demasiado amplios
- confiar en regex o matching flojo
- llenar la allowlist de excepciones temporales permanentes
- no distinguir entre dominio permitido y destino realmente confiable
- no revisar quién controla el DNS o el ownership del destino
- construir listas enormes difíciles de auditar
- pensar que una allowlist reemplaza toda otra validación

Es decir:

> el problema no es usar allowlists.  
> El problema es construir allowlists que parecen restrictivas, pero en la práctica siguen dejando demasiado margen.

---

## Error mental clásico

Un error muy común es este:

### “Si el dominio está en una whitelist, entonces el riesgo ya está bastante cubierto”

Eso puede ser verdad en algunos casos.
Pero formulado así es demasiado simplista.

Porque todavía quedan preguntas importantes como:

- ¿qué significa exactamente “ese dominio”?
- ¿también sus subdominios?
- ¿quién controla su DNS?
- ¿a qué IP resuelve realmente?
- ¿puede redirigir a otro lado?
- ¿esa lista fue pensada para este caso de uso o se heredó de otro?
- ¿es una allowlist de destinos reales o solo de strings aceptables?

### Idea importante

Una allowlist útil no es una lista de nombres bonitos.
Es una lista de confianza saliente bien modelada.

---

## Qué debería expresar una allowlist sana

Una allowlist sana debería responder con claridad:

- qué destinos concretos son legítimos
- para qué funcionalidad
- bajo qué nivel de confianza
- con qué límites
- y con qué revisión posterior

### Por ejemplo, debería poder contestar

- “esta feature solo puede conectarse a estos endpoints del proveedor X”
- “este callback solo puede ir a dominios del cliente validados de esta forma”
- “este importador solo acepta recursos de este storage”
- “esta integración enterprise solo habla con hosts previamente aprobados por tenant y revisados bajo esta lógica”

### Idea útil

Cuanto más específica es la historia que la allowlist puede contar, más probablemente esté bien pensada.

---

## Qué NO debería ser una allowlist sana

No debería parecerse a cosas como:

- “cualquier cosa que termine en algo parecido”
- “todo nuestro dominio por las dudas”
- “todos los subdominios porque es más cómodo”
- “una regex amplia que nadie entiende”
- “una lista enorme que fue creciendo por excepciones”
- “si no parece localhost, lo dejamos”
- “si está configurado por el cliente, asumimos que es legítimo”

### Regla sana

Una allowlist que nadie puede explicar con precisión suele ser una defensa más débil de lo que aparenta.

---

## Allowlists por dominio: útiles, pero con límites

Permitir ciertos dominios o hosts suele ser una primera estrategia razonable.
Puede ayudar mucho si el caso de uso realmente tiene destinos conocidos.

Por ejemplo:

- un proveedor externo fijo
- una API específica
- un storage concreto
- un dominio del tenant previamente verificado

### Pero conviene recordar

el dominio es una capa de identidad útil, no una garantía automática total.

Todavía importa:

- a qué resuelve
- quién lo controla
- si hay subdominios flexibles
- si hay redirects
- si se reutiliza tiempo después

### Idea importante

Allowlist por dominio ayuda.
Pero si se usa sin pensar el destino real, puede quedarse corta.

---

## Subdominios: uno de los grandes lugares donde se degradan

Este es uno de los puntos donde más allowlists se vuelven flojas.

Patrones como:

- `*.ejemplo.com`
- “cualquier subdominio del cliente”
- “todo lo que cuelgue de este parent domain”

pueden sonar razonables, pero merecen mucho análisis.

### Porque no siempre sabés

- quién controla cada subdominio
- qué entornos viven ahí
- si hay previews o servicios auxiliares
- si existen subdominios huérfanos
- si alguno puede resolver a destinos internos o inesperados

### Idea importante

Abrir subdominios ampliamente suele ser bastante más peligroso que permitir un host concreto y muy bien entendido.

---

## Regex y matching flexible: la trampa de la comodidad

Otra forma habitual de “resolver” allowlists es usar matching más flexible, por ejemplo:

- expresiones regulares amplias
- `endsWith`
- `contains`
- reglas pensadas para “no tener que tocar más esto”

### Problema

Eso puede convertir una allowlist aparentemente elegante en una política difícil de auditar y demasiado generosa.

### Regla sana

Si una persona razonable del equipo no puede leer la regla y saber con claridad qué entra y qué no, ya hay una señal de riesgo.

---

## Allowlists largas también envejecen mal

No hace falta que la lógica sea dinámica para que una allowlist se vuelva débil.

Puede degradarse simplemente por acumulación:

- cliente A
- cliente B
- staging
- QA
- dominios viejos
- callbacks temporales
- migraciones
- proveedores históricos
- excepciones de soporte

### Resultado

La allowlist deja de expresar confianza actual y pasa a expresar historia operativa.

### Idea importante

Una lista grande no siempre es una defensa fuerte.
A veces es solo el archivo de deuda del equipo.

---

## Qué sí suele hacer fuerte a una allowlist

Hay rasgos que suelen volverla más sólida, por ejemplo:

- pocos destinos
- hosts concretos
- poca flexibilidad innecesaria
- ownership claro
- caso de uso específico
- revisión periódica
- relación directa entre feature y destino permitido
- validación cerca del destino real y no solo del string original

### Idea útil

Una allowlist buena suele ser:
- corta
- específica
- entendible
- y aburrida

Eso, en seguridad, es una gran señal.

---

## Qué la vuelve débil aunque “parezca restrictiva”

También hay rasgos que la debilitan mucho aunque a simple vista suene formal:

- depende solo de nombres y no de resolución
- permite subdominios amplios
- se basa en matching laxo
- nadie sabe quién mantiene la lista
- hay entries heredadas que nadie revisa
- convive con redirects abiertos
- valida al guardar, pero no al usar
- el backend confía demasiado en datos persistidos

### Idea importante

Una allowlist fuerte no es una tabla estática bonita.
Es una política viva de confianza saliente.

---

## No reemplaza revisar resolución ni redirects

Esto conecta con el tema anterior.

Aunque tengas allowlist, sigue importando:

- cómo resuelve DNS
- a qué IP llega realmente
- si la request sigue redirecciones
- qué pasa entre check y connect
- si el destino cambia con el tiempo

### Regla sana

La allowlist no cancela esos problemas.
Solo puede ser una parte del modelo defensivo.

### Idea importante

Si permitís un nombre y luego seguís ciegamente cualquier resolución o redirect, la defensa pierde mucha fuerza.

---

## No reemplaza límites de red ni diseño de infraestructura

Otra tentación es pensar:

- “ya tenemos allowlist, no hace falta pensar nada más”

Eso también es peligroso.

Porque SSRF se vuelve más seria cuanto más alcance de red tiene el backend.
Y una allowlist por sí sola no resuelve:

- exposición de metadata
- reachability de localhost
- servicios internos confiados
- exceso de permisos salientes
- proxies internos demasiado permisivos

### Idea útil

La allowlist ayuda más cuando se combina con una postura de red y de salida más acotada.

---

## Allowlists por feature, no solo globales

Una mejora mental muy útil es dejar de pensar en:

- “la allowlist de la app”

y pasar a pensar en:

- “la allowlist de esta funcionalidad”
- “la allowlist de este conector”
- “la allowlist de este webhook”
- “la allowlist de este importador”

### Porque no es lo mismo

- importar imágenes
- validar callbacks
- hablar con un proveedor fijo
- sincronizar con tenants
- testear una conexión enterprise

### Regla sana

La confianza saliente suele ser más sana cuando se expresa por feature concreta y no como un gran permiso global.

---

## Cuando el destino debería ser fijo, no uses una allowlist enorme

Este también es un buen criterio práctico.

Si una funcionalidad de negocio debería hablar solo con:

- un proveedor
- una API fija
- un bucket fijo
- un servicio muy concreto

entonces una allowlist grande suele ser señal de diseño flojo o de deuda.

### Idea importante

A veces no necesitás “validar muchos destinos”.
Necesitás directamente no permitir variación.

---

## Multi-tenant: allowlists más legítimas, pero más exigentes

En apps B2B o multi-tenant puede ser razonable tener allowlists más ricas porque distintos clientes pueden registrar:

- callbacks
- dominios
- endpoints propios
- integraciones específicas

Eso no invalida la estrategia.
Pero sí la vuelve más exigente.

### Porque ahora conviene preguntarte

- ¿quién aprobó ese destino?
- ¿cómo se revisa por tenant?
- ¿qué ownership existe?
- ¿qué pasa si cambia el DNS?
- ¿qué pasa si el tenant apunta a algo inesperado?
- ¿qué parte de la allowlist es por cliente y cuál es global?

### Idea importante

Multi-tenant no vuelve inútiles las allowlists.
Solo las vuelve más difíciles de hacer bien.

---

## Qué pasa con callbacks configurables

Los callbacks merecen una mención especial porque suelen llevar rápidamente a una solución tipo whitelist.

Eso puede ser correcto.
Pero una postura sana debería poder responder:

- ¿qué callbacks aceptamos?
- ¿cómo se validan?
- ¿qué host exacto o patrón controlado se permite?
- ¿qué tenant puede usar qué destinos?
- ¿qué pasa si el destino deja de pertenecer a quien decía pertenecer?
- ¿cómo se revisa antes de cada uso o en qué momento?

### Idea útil

Callback configurable + whitelist floja suele ser una combinación engañosa:
parece control, pero puede seguir habiendo mucho riesgo.

---

## El objetivo no es “permitir lo parecido”, sino “permitir lo legítimo”

Esta frase resume muy bien el espíritu correcto.

Una allowlist débil suele pensar en términos de:

- parecido
- flexibilidad
- conveniencia
- bajo mantenimiento

Una allowlist fuerte piensa en términos de:

- legitimidad
- ownership
- destino real
- feature concreta
- menor variación posible
- revisión clara

### Idea importante

Seguridad saliente sana significa permitir lo legítimo, no lo que “más o menos entra” en una regla cómoda.

---

## Qué preguntas conviene hacer para evaluar una allowlist

Cuando revises una allowlist de destino, conviene preguntarte:

- ¿esta lista es realmente necesaria?
- ¿podría el destino ser fijo en vez de validado?
- ¿qué hosts concretos permite?
- ¿permite subdominios amplios?
- ¿quién controla DNS de esos hosts?
- ¿qué pasa con resolución final y redirects?
- ¿qué entries sobran hoy?
- ¿se revisa por feature o es una lista global heredada?
- ¿cuánto me costaría explicar por qué cada entrada merece confianza?
- ¿qué parte de esta allowlist existe por comodidad y no por necesidad real?

### Regla sana

Si esas preguntas incomodan mucho, probablemente la allowlist merece rediseño.

---

## Qué conviene revisar en una app Spring

Cuando revises allowlists de destino en una aplicación Spring, mirá especialmente:

- dónde se definen hosts o dominios permitidos
- si son globales o por feature
- si usan equality exacta, subdominios, regex o matching laxo
- si hay entries heredadas o viejas
- si la lista se combina con follow redirects
- si se valida solo el nombre o también el destino efectivo
- si hay diferencias entre validar al guardar y validar al usar
- si tenants o clientes pueden ampliar la allowlist
- quién mantiene esa lista y cómo se limpia
- cuánto de la confianza se basa en “se parece a un dominio nuestro”

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- allowlists más chicas
- hosts concretos y bien justificados
- menos flexibilidad gratuita
- menos subdominios amplios
- mejor relación entre feature y destino permitido
- limpieza periódica
- menos entries heredadas sin dueño claro
- más conciencia de que nombre permitido no equivale automáticamente a destino seguro

---

## Señales de ruido

Estas señales merecen revisión rápida:

- allowlists enormes
- regex generosas
- wildcard sobre subdominios
- matching por `contains` o `endsWith` sin más
- nadie sabe por qué cierta entrada sigue ahí
- la allowlist es global aunque las features sean muy distintas
- redirects o DNS no están considerados
- el equipo habla de “dominios permitidos” como si eso resolviera todo

---

## Checklist práctico

Cuando revises allowlists de destino, preguntate:

- ¿qué destinos concretos deberían estar permitidos de verdad?
- ¿la allowlist es por feature o global?
- ¿qué tan precisa es la comparación?
- ¿hay subdominios, regex o matching laxo?
- ¿qué entries ya no se justifican?
- ¿quién controla esos dominios?
- ¿qué pasa con resolución y redirects?
- ¿qué feature podría funcionar con menos variación de destino?
- ¿qué parte de la lista es deuda histórica?
- ¿qué quitarías primero para que la allowlist se parezca más a una confianza real y menos a una red flexible de excepciones?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Qué features usan allowlists de destino?
2. ¿Son listas globales o específicas por funcionalidad?
3. ¿Qué entries sabés justificar claramente?
4. ¿Cuáles están por historia o por comodidad?
5. ¿Hay wildcard o subdominios amplios?
6. ¿Qué pasa con redirects y resolución final en esas features?
7. ¿Qué cambio harías primero para que la allowlist exprese una confianza más precisa?

---

## Resumen

Las allowlists de destino pueden ser una defensa muy útil contra SSRF, pero solo cuando expresan destinos realmente legítimos y controlados con suficiente precisión.

Se vuelven más débiles cuando:

- permiten demasiado
- se basan solo en nombre textual
- aceptan subdominios amplios
- acumulan excepciones
- ignoran redirects y resolución
- o nadie puede explicar bien por qué cada entrada está ahí

En resumen:

> un backend más maduro no usa allowlists como decoración tranquilizadora ni como sustituto de pensar el destino real de las requests salientes.  
> Las usa para modelar confianza concreta sobre adónde sí debería poder conectarse cada funcionalidad, sabiendo que una lista corta, específica y bien mantenida suele proteger mucho más que una whitelist flexible y enorme que se siente cómoda al desplegar, pero borrosa e indefendible cuando toca explicar qué destinos está autorizando de verdad.

---

## Próximo tema

**Por qué una blacklist no alcanza**
