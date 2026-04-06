---
title: "Cifrado en reposo: qué resuelve y qué no"
description: "Cómo pensar el cifrado en reposo en una aplicación Java con Spring Boot. Qué amenazas ayuda a reducir, qué no resuelve por sí solo, por qué no reemplaza minimización ni control de acceso y cómo evitar la falsa sensación de seguridad cuando los datos siguen siendo legibles para la aplicación, los operadores o los flujos equivocados."
order: 76
module: "Datos sensibles y base de datos"
level: "base"
draft: false
---

# Cifrado en reposo: qué resuelve y qué no

## Objetivo del tema

Entender cómo pensar el **cifrado en reposo** en una aplicación Java + Spring Boot.

La idea es revisar una creencia muy extendida:

- “si la base está cifrada, los datos ya están protegidos”
- “si el disco está cifrado, ya no hay problema”
- “si usamos encryption at rest, entonces el riesgo fuerte desaparece”

Eso es una simplificación peligrosa.

Porque el cifrado en reposo sí puede reducir riesgos importantes, pero no resuelve por sí solo cosas como:

- acceso indebido desde la propia aplicación
- permisos excesivos
- mala autorización
- sobreexposición en responses
- logs inseguros
- secretos mal manejados
- cuentas internas con demasiado alcance
- datos innecesarios persistidos

En resumen:

> cifrar en reposo ayuda mucho en ciertos escenarios,  
> pero no reemplaza diseño seguro, minimización ni control real de acceso a la información.

---

## Idea clave

El cifrado en reposo protege datos **cuando están almacenados**.

Eso puede incluir:

- discos
- volúmenes
- tablas o columnas
- backups
- snapshots
- archivos persistidos
- caches duraderos
- objetos en storage
- datos fuera de uso inmediato

Su valor principal aparece cuando querés reducir el riesgo de que alguien acceda al almacenamiento sin pasar por el canal normal de la aplicación.

Por ejemplo:

- robo o acceso físico al disco
- acceso indebido a backups
- snapshots expuestos
- extracción de archivos de base
- reutilización de medios de almacenamiento
- ciertos incidentes de infraestructura

Pero hay algo fundamental que no conviene olvidar:

> si la aplicación o un actor autorizado ya puede leer el dato descifrado,  
> el cifrado en reposo no va a impedir por sí solo esa lectura.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- creer que cifrado en reposo vuelve irrelevante la minimización
- asumir que disco cifrado equivale a dato bien protegido en toda circunstancia
- tratar el cifrado como reemplazo de autorización o segmentación
- guardar secretos o datos innecesarios “total está cifrado”
- olvidar que la clave y la app suelen convivir dentro del mismo sistema
- no distinguir entre cifrado de disco, de base, de columna o de aplicación
- suponer que un insider o proceso con acceso legítimo queda neutralizado por el cifrado en reposo
- usar “encryption at rest” como respuesta automática sin mirar modelo de amenaza real

Es decir:

> el problema no es usar cifrado en reposo.  
> El problema es no entender exactamente contra qué ayuda y contra qué no.

---

## Error mental clásico

Un error muy común es este:

### “Si el storage está cifrado, los datos ya están protegidos aunque la app los lea mal”

Eso es falso.

Si la app:

- puede leer el dato
- puede devolverlo
- puede loguearlo
- puede exportarlo
- puede filtrarlo por un endpoint mal diseñado

entonces el cifrado en reposo no evita ese problema.

### Idea importante

El cifrado en reposo suele proteger mejor frente a escenarios como:

- pérdida del medio físico
- acceso directo al almacenamiento
- snapshots o backups expuestos

pero no frente a:

- una query legítima pero demasiado amplia
- un admin con permisos de lectura
- una cuenta técnica comprometida
- una mala política de autorización
- un bug que expone el dato desde la aplicación

---

## Qué significa “en reposo”

Conviene aclararlo porque a veces se lo usa de forma vaga.

“En reposo” suele referirse a datos almacenados, por ejemplo:

- en disco
- en una base de datos persistente
- en un backup
- en un volumen de máquina virtual
- en almacenamiento de objetos
- en un archivo subido ya persistido
- en una cola duradera
- en un snapshot de infraestructura

### Idea útil

No significa “dato totalmente fuera del sistema”.
Significa que el dato está guardado y no solo viajando por la red.

Eso lo diferencia del tema anterior, donde mirábamos tránsito.
Acá miramos almacenamiento.

---

## Distintos niveles de cifrado en reposo

No todo cifrado en reposo es igual.
Conviene distinguir al menos algunas capas posibles.

## 1. Cifrado del disco o volumen
Protege el medio de almacenamiento a bajo nivel.

### Qué valor tiene
Ayuda si alguien accede al disco o al volumen fuera del flujo normal del sistema.

### Qué no resuelve
Si la máquina o la app ya están levantadas y autorizadas, normalmente pueden leer el dato sin problema.

---

## 2. Cifrado gestionado por base de datos o servicio
Algunos motores o servicios cloud ofrecen cifrado del almacenamiento subyacente.

### Qué valor tiene
Mejora protección operativa y de infraestructura, especialmente en backups, snapshots o acceso al storage.

### Qué no resuelve
La base, una vez operativa, igual puede servir el dato a quien tenga acceso válido por la capa normal.

---

## 3. Cifrado a nivel de columna o campo
Ciertos datos se almacenan cifrados de forma más específica.

### Qué valor tiene
Puede reducir exposición frente a lecturas parciales de base, accesos internos más restringidos o dumps donde no todos deberían poder ver el valor claro.

### Qué no resuelve
Si la aplicación descifra automáticamente y luego lo usa o expone mal, el problema vuelve a aparecer.

---

## 4. Cifrado aplicado por la propia aplicación
La app cifra y descifra ciertos valores según reglas propias.

### Qué valor tiene
Da más control fino sobre qué datos se protegen y cómo.

### Qué no complica menos
También abre preguntas difíciles sobre:

- dónde viven las claves
- quién puede descifrar
- qué procesos lo necesitan
- cómo rotar
- cómo buscar o indexar
- qué pasa con logs, exports y debugging

No es “más seguro automáticamente” solo por ser más artesanal.

---

## Qué escenarios sí mejora mucho

El cifrado en reposo suele aportar valor real en escenarios como:

- pérdida de discos o medios
- acceso indebido a backups
- snapshots expuestos
- reutilización de hardware
- extracción de archivos de base fuera de la app
- ciertos incidentes de proveedor o infraestructura
- reducción de exposición cuando el acceso es al storage pero no al sistema operativo operativo ni a la app en ejecución

### Idea práctica

Es muy útil como defensa cuando la amenaza tiene más que ver con el almacenamiento que con la ejecución normal de la aplicación.

---

## Qué escenarios no soluciona por sí solo

Acá suele estar la mayor confusión.

El cifrado en reposo no soluciona por sí solo:

- una API que devuelve demasiado
- un IDOR
- un servicio con permisos de más
- un admin que exporta datos que puede leer
- una SQL injection ejecutada por la app con acceso legítimo
- logs que guardan valores en claro
- un proceso batch que lee y vuelca datos sensibles
- una mala segregación de roles
- un endpoint interno abusado
- datos innecesarios que jamás debieron persistirse

### Regla útil

Si el problema ocurre **después** de que el sistema ya pudo acceder al dato, el cifrado en reposo probablemente no sea la defensa principal.

---

## La clave también importa

Este punto es central.

No existe protección real por cifrado si el manejo de claves está mal pensado.

Porque en la práctica siempre aparece la pregunta:

> ¿quién puede descifrar?

Y eso depende de:

- dónde vive la clave
- quién accede a ella
- cómo se inyecta o gestiona
- qué procesos la usan
- cómo se rota
- qué pasa en backups, debugging o incidentes

### Idea importante

Si la clave queda:

- hardcodeada
- en texto claro
- accesible para demasiados procesos
- mezclada con el mismo entorno que guarda el dato

entonces el valor del cifrado puede degradarse muchísimo.

---

## App y clave en el mismo lugar: límite importante

Un caso muy común es este:

- la app guarda datos cifrados
- pero también tiene acceso directo a la clave o material necesario para descifrarlos
- y además opera todo en el mismo entorno

Eso no vuelve inútil el cifrado, pero sí marca un límite claro.

### Porque entonces

si alguien compromete la aplicación o el entorno con suficiente alcance, probablemente pueda obtener:

- el dato cifrado
- y también la capacidad de descifrarlo

### Conclusión

El cifrado en reposo sigue ayudando para ciertos escenarios de acceso al almacenamiento.
Pero frente a compromiso pleno de la app o de sus secretos, su capacidad de defensa baja mucho.

---

## Cifrar no justifica guardar de más

Esta es una regla importantísima.

A veces un equipo decide persistir datos delicados con el argumento de que:

- “después lo ciframos”
- “como está cifrado, ya no preocupa tanto”
- “guardemos todo y luego vemos”

Eso es una muy mala lógica.

### Porque siguen existiendo preguntas clave

- ¿realmente necesitábamos guardar esto?
- ¿durante cuánto tiempo?
- ¿quién debe verlo?
- ¿en qué contexto?
- ¿qué daño hay si igual se expone desde la app?
- ¿qué costo agrega su existencia en backups, dumps o migraciones?

### Idea útil

El cifrado en reposo puede reducir el riesgo de guardar algo necesario.
No convierte en buena idea guardar algo innecesario.

---

## Cifrado y búsqueda: tensión real

En algunos casos aparece una dificultad práctica:

si cifrás cierto dato de forma fuerte, después buscar, ordenar o filtrar por él puede volverse más complejo.

Eso obliga a pensar con cuidado:

- qué datos realmente necesitan cifrado fino
- qué operaciones deben poder hacerse sobre ellos
- si hace falta tokenizar, indexar aparte o rediseñar el flujo
- si el costo funcional justifica el nivel de protección buscado

### Idea importante

No todos los datos se benefician igual del mismo tipo de cifrado.
Y no todo dato delicado debería seguir siendo plenamente consultable como antes.

---

## Cifrado y backups

Uno de los grandes lugares donde el cifrado en reposo suele tener valor es en backups.

Porque un backup:

- concentra mucha información
- puede vivir mucho tiempo
- a veces circula por más manos o sistemas
- puede terminar en entornos menos controlados
- puede quedar olvidado

### Regla práctica

Si el backup contiene gran parte del valor del sistema, protegerlo en reposo suele ser especialmente importante.

Pero incluso ahí conviene recordar:

- cuánto tiempo se guarda
- quién accede
- cómo se restaura
- si también arrastra datos innecesarios
- si el entorno de restauración respeta el mismo nivel de control

---

## Cifrado y dumps o snapshots

Lo mismo aplica a:

- dumps de base
- snapshots de disco
- copias de seguridad de volúmenes
- clonado de entornos

Estos suelen ser escenarios donde el cifrado en reposo tiene mucho sentido, porque el riesgo pasa justamente por acceso al material almacenado fuera del flujo normal del sistema.

### Idea útil

Muchas fugas graves no nacen del endpoint en producción, sino de copias laterales del sistema.
Ahí el cifrado en reposo puede ser una ayuda muy concreta.

---

## No todo dato necesita el mismo tratamiento

Decir esto no implica relajar el criterio.
Implica diseñar mejor.

No todos los datos tienen el mismo nivel de sensibilidad ni el mismo valor si se filtran.

Entonces conviene decidir con intención:

- qué solo necesita cifrado de infraestructura
- qué merece protección más fina
- qué quizá no debería persistirse
- qué debe quedar especialmente aislado
- qué puede vivir con otras capas sin llegar a cifrado aplicativo

### Idea importante

Cifrar todo del mismo modo no siempre es la mejor estrategia.
Lo importante es que el tratamiento responda al riesgo real.

---

## El cifrado en reposo no reemplaza control de acceso

Esto merece repetirse de forma muy clara.

Un sistema puede tener almacenamiento cifrado y, al mismo tiempo, estar mal diseñado porque:

- demasiados roles leen demasiado
- soporte ve campos que no debería
- un microservicio tiene acceso innecesario
- la app usa una cuenta de base demasiado poderosa
- un export interno saca más de la cuenta

### Regla sana

El cifrado protege almacenamiento.
El control de acceso protege **quién puede ver y usar el dato cuando el sistema ya está operativo**.

Necesitás ambas miradas.

---

## Tampoco reemplaza minimización ni retención

Otro error mental es pensar:

- “como está cifrado, lo podemos guardar indefinidamente”

Eso es mala idea.

Porque aunque el cifrado ayude, seguir acumulando datos:

- amplía impacto potencial
- complica cumplimiento
- aumenta superficie
- eleva valor del sistema como objetivo
- hace más costosos backups, migraciones y restauraciones

### Idea útil

Incluso con cifrado en reposo, sigue teniendo sentido preguntar:

- ¿debemos guardar esto?
- ¿por cuánto tiempo?
- ¿podemos minimizarlo?
- ¿podemos borrarlo antes?

---

## Qué señales suelen indicar falsa sensación de seguridad

Hay frases que suelen mostrar que el equipo está confiando demasiado en esta capa:

- “la base está cifrada, así que está todo bien”
- “aunque se filtre el dump, está cifrado”
- “como usamos encryption at rest, ya no preocupa tanto quién lea”
- “guardemos esto que después lo ciframos”
- “si alguien entra por la app ya es otro problema”
- “los backups cifrados nos permiten guardar de todo”

### Problema

Cada una puede tener una parte de verdad.
Pero usadas como excusa general suelen tapar decisiones de diseño pobres en otras capas.

---

## Qué conviene revisar en una arquitectura o sistema

Cuando revises cifrado en reposo, mirá especialmente:

- qué tipo de cifrado existe realmente
- si protege disco, base, columna o aplicación
- qué datos delicados siguen estando disponibles en claro para demasiados procesos
- cómo se manejan las claves
- si la app y la clave conviven sin mucha separación
- qué pasa con backups, dumps y snapshots
- si se está usando el cifrado como excusa para persistir de más
- si roles, exports o logs siguen exponiendo el dato igual
- qué amenazas reales querés reducir con esa capa
- qué escenarios siguen completamente abiertos aunque el storage esté cifrado

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- comprensión clara de qué amenaza reduce el cifrado en reposo
- distinción entre storage protegido y dato todavía accesible por la app
- manejo de claves más intencional
- mejor criterio sobre qué datos merecen protección más fina
- backups y copias laterales tratados con cuidado
- menos confianza ciega en el cifrado como solución total
- integración con minimización, retención y control de acceso
- menos acumulación de datos innecesarios solo porque “están cifrados”

---

## Señales de ruido

Estas señales merecen revisión rápida:

- el equipo no sabe si el cifrado es de disco, base, columna o app
- se habla de cifrado en reposo como si neutralizara mala autorización
- claves accesibles de forma demasiado amplia
- la app puede leer todo y eso no se considera problema
- backups cifrados pero datos innecesarios acumulados
- cifrado usado como justificación para persistir payloads o secretos completos
- nadie puede explicar qué amenaza concreta se quiso resolver
- el storage está cifrado, pero logs, exports o queries internas exponen lo mismo igual

---

## Checklist práctico

Cuando revises cifrado en reposo, preguntate:

- ¿qué tipo de cifrado en reposo tenemos realmente?
- ¿qué amenaza concreta reduce en nuestro caso?
- ¿protege storage físico, dumps, backups o columnas específicas?
- ¿quién puede leer el dato ya descifrado dentro del sistema?
- ¿cómo se manejan las claves?
- ¿la app y la capacidad de descifrar están demasiado juntas?
- ¿estamos usando esta capa como excusa para guardar de más?
- ¿qué datos seguirían completamente expuestos por la propia app aunque el storage esté cifrado?
- ¿cómo tratamos backups, snapshots y restauraciones?
- ¿qué otras capas faltan para complementar de verdad esta protección?

---

## Mini ejercicio de reflexión

Tomá un dato delicado de tu sistema, por ejemplo:

- token de integración
- dato de pago
- documento
- dirección
- score interno
- nota administrativa sensible

y respondé:

1. ¿Dónde queda almacenado hoy?
2. ¿Está cifrado en reposo? ¿En qué nivel?
3. ¿Qué amenaza concreta reduce ese cifrado?
4. ¿Quién puede leer ese dato en claro desde la app o el entorno?
5. ¿La clave vive demasiado cerca del dato?
6. ¿Ese dato realmente debería persistirse?
7. ¿Qué riesgo seguiría igual aunque el storage estuviera perfectamente cifrado?

---

## Resumen

El cifrado en reposo es una capa valiosa, especialmente frente a escenarios donde alguien accede al almacenamiento sin pasar por el flujo normal de la aplicación.

Ayuda mucho en casos como:

- discos perdidos
- backups expuestos
- snapshots
- dumps
- acceso al storage subyacente

Pero no resuelve por sí solo:

- mala autorización
- sobreexposición desde la app
- cuentas internas con demasiado alcance
- logs inseguros
- persistencia innecesaria
- claves mal gestionadas

En resumen:

> un backend más maduro no usa el cifrado en reposo como consuelo general.  
> Lo entiende como una defensa concreta contra ciertos escenarios de acceso al almacenamiento,  
> y la combina con minimización, control de acceso y manejo serio de secretos y claves.

---

## Próximo tema

**Secretos vs datos cifrados**
