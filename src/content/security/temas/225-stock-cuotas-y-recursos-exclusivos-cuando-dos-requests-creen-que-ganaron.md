---
title: "Stock, cuotas y recursos exclusivos: cuando dos requests creen que ganaron"
description: "Cómo entender race conditions y TOCTOU en stock, cuotas y recursos exclusivos en aplicaciones Java con Spring Boot. Por qué no basta con verificar disponibilidad antes de actuar y qué cambia cuando dos requests compiten por la misma unidad lógica de negocio."
order: 225
module: "Race conditions, TOCTOU y consistencia bajo concurrencia"
level: "base"
draft: false
---

# Stock, cuotas y recursos exclusivos: cuando dos requests creen que ganaron

## Objetivo del tema

Entender por qué **stock**, **cuotas** y otros **recursos exclusivos** son una de las superficies más clásicas y más importantes para pensar **race conditions** y **TOCTOU** en aplicaciones Java + Spring Boot.

La idea de este tema es bajar el bloque a un caso muy tangible de producto y negocio.

Porque muchas aplicaciones tienen alguna forma de recurso que no puede asignarse infinitamente, por ejemplo:

- unidades de stock
- cupos de evento
- turnos
- códigos promocionales únicos
- asientos
- plazas
- licencias limitadas
- capacidad por tenant
- tokens de uso único
- invitaciones
- slots de procesamiento
- reservas temporales

Y en todos esos casos aparece una intuición muy tentadora:

- “primero verifico si queda disponibilidad”
- “si todavía hay, entonces asigno”
- “si sigue libre, reservo”
- “si nadie lo tomó antes, lo doy”

Eso parece perfectamente razonable.
Hasta que dos requests llegan casi al mismo tiempo.

Ahí aparece el problema central del tema:

> ambas leen una realidad todavía disponible,  
> ambas creen que pueden actuar,  
> y recién después el sistema descubre que dejó “ganar” a más de una.

En resumen:

> stock, cuotas y recursos exclusivos importan porque muestran con muchísima claridad que una verificación correcta en un instante no alcanza si la asignación real ocurre después y el sistema permite que varios actores compitan sobre la misma disponibilidad como si cada uno estuviera solo.

---

## Idea clave

La idea central del tema es esta:

> en recursos exclusivos, la pregunta no es solo “¿había disponibilidad cuando miré?”,  
> sino “¿cómo evita el sistema que dos actores distintos conviertan esa misma disponibilidad en dos asignaciones válidas al mismo tiempo?”

Eso cambia bastante la forma de mirar la lógica.

Porque una cosa es pensar:

- “si `stock > 0`, descuento”
- “si el cupo existe, reservo”
- “si el código sigue sin usar, lo marco como usado”

Y otra muy distinta es preguntarte:

- “¿qué pasa si otro request leyó exactamente lo mismo un milisegundo antes?”
- “¿qué evita que ambos lleguen a la misma conclusión?”
- “¿qué parte del sistema convierte disponibilidad en exclusividad real?”

### Idea importante

La validación de disponibilidad no basta por sí sola.
El sistema necesita una forma de **hacer exclusiva la transición** desde “disponible” hacia “ya asignado”.

### Regla sana

Cada vez que el negocio tenga algo que solo uno puede ganar, preguntate qué impide que dos requests crean haber ganado al mismo tiempo.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- pensar que el stock se resuelve con un `if (stock > 0)`
- asumir que leer disponibilidad antes de reservar ya es suficiente
- no modelar concurrencia entre requests normales de usuarios
- confundir “no vi problema en testing manual” con “la lógica es segura”
- olvidar que workers, retries o callbacks también pueden competir por cupos
- tratar overselling o dobles reservas como si fueran solo bugs menores de negocio y no fallas reales de concurrencia

Es decir:

> el problema no es solo saber si hay disponibilidad.  
> El problema es **cómo se convierte esa disponibilidad en una asignación única sin que otros flujos se adelanten o lleguen al mismo tiempo**.

---

## Error mental clásico

Un error muy común es este:

### “Está bien porque chequeamos disponibilidad justo antes de confirmar”

Eso suena prudente.
Pero puede seguir siendo insuficiente.

Porque todavía conviene preguntar:

- ¿qué ocurre entre ese chequeo y la escritura?
- ¿otro request puede leer lo mismo?
- ¿otro servicio puede reclamar el mismo recurso?
- ¿hay retries o jobs que compiten con usuarios reales?
- ¿qué pasa si dos transacciones llegan con el mismo snapshot de disponibilidad?

### Idea importante

“Justo antes” no significa “de manera exclusiva”.
Y esa diferencia es toda la historia del problema.

---

# Parte 1: Qué es un recurso exclusivo, a nivel intuitivo

## La intuición simple

Un recurso exclusivo es cualquier cosa donde el sistema necesita garantizar que una misma unidad lógica no sea concedida más veces de lo permitido.

Eso puede verse como:

- vender una de las últimas unidades
- ocupar el último lugar disponible
- asignar un turno único
- consumir un cupón una sola vez
- entregar un premio limitado
- adjudicar un asiento
- reservar una franja horaria
- procesar un token de uso único

### Idea útil

No hace falta que el recurso sea físico.
Basta con que el negocio diga:
- “esto no puede usarse más de N veces”
o incluso
- “esto solo lo puede ganar uno”.

### Regla sana

Cada vez que el negocio tenga una exclusividad, asumí que la concurrencia ya es parte del problema.

---

# Parte 2: Por qué el caso de stock enseña tan bien TOCTOU

El stock es un ejemplo perfecto porque el patrón suele ser muy claro:

1. el sistema lee stock actual
2. valida que todavía hay
3. sigue con el flujo de compra o reserva
4. recién después descuenta o marca consumo

### Problema

Entre el paso 2 y el paso 4 puede entrar otro actor que hace exactamente lo mismo.

### Idea importante

El stock deja ver con mucha claridad la brecha entre:
- **verificación**
y
- **consumo real**.

### Regla sana

Si el flujo dice “primero verifico que haya una unidad y luego la consumo”, ya hay una pregunta obligatoria de TOCTOU.

---

# Parte 3: Dos requests normales alcanzan para romper la ilusión

No hace falta imaginar un ataque sofisticado.
Basta con algo mucho más cotidiano:

- dos usuarios comprando a la vez
- un usuario apretando dos veces
- un retry automático
- un request móvil y otro web casi simultáneos
- un worker procesando una cola mientras un request manual hace lo mismo

### Idea útil

La concurrencia no necesita mala intención ni miles de requests.
A veces alcanza con dos actores legítimos llegando casi juntos.

### Regla sana

No modeles exclusividad pensando solo en el usuario ideal, secuencial y paciente.
Modelala pensando que el sistema puede recibir dos intentos válidos casi a la vez.

### Idea importante

Una race condition de stock puede nacer de uso normal del producto, no solo de abuso.

---

# Parte 4: Disponibilidad no es lo mismo que posesión

Este matiz conviene dejarlo muy claro.

Una cosa es que el sistema determine:

- “hay stock”
- “queda un cupo”
- “ese turno sigue libre”

Y otra muy distinta es que ya haya transformado eso en:

- stock consumido
- cupo reservado
- turno asignado
- código marcado como usado

### Idea útil

La ventana peligrosa vive justo entre esas dos cosas.

### Regla sana

No confundas:
- estado leído como disponible
con
- recurso realmente capturado o comprometido.

### Idea importante

Leer que algo está libre no equivale a haberlo ganado.

---

# Parte 5: Cuotas y límites comparten exactamente la misma lógica

Esto no aplica solo a inventario.
También aparece en:

- límite de inscripciones
- cantidad máxima por usuario
- capacidad diaria
- licencias activas
- rate-limits de negocio
- créditos disponibles
- invitaciones restantes
- canjes máximos
- cupos por campaña

### Idea útil

Aunque el nombre cambie, la estructura del problema sigue siendo la misma:

- leo disponibilidad
- decido que alcanza
- actúo después
- otro actor puede haber hecho lo mismo

### Regla sana

Cada vez que exista una cantidad finita o una capacidad máxima, pensá en ella como un recurso concurrente, no solo como una cifra de negocio.

---

# Parte 6: Exclusividad temporal también es exclusividad

Otra cosa que suele subestimarse es que no todo recurso exclusivo se “gasta” para siempre.
Algunos son exclusivos solo por un tiempo, por ejemplo:

- un lock de reserva por unos minutos
- un turno en proceso de pago
- una ventana temporal para reclamar algo
- un asiento “retenido”
- un código bloqueado mientras se confirma el canje

### Idea importante

Eso no simplifica el problema.
A veces lo complica más, porque aparecen:

- expiraciones
- renovaciones
- limpiezas de reservas viejas
- jobs de liberación
- competidores que llegan justo cuando vence algo

### Regla sana

No subestimes recursos “solo temporalmente exclusivos”.
También necesitan un modelo fuerte de concurrencia.

---

# Parte 7: Doble gasto, doble uso y overselling son primos muy cercanos

Este tema conecta conceptualmente con varios problemas clásicos:

- overselling
- doble uso de cupones
- doble reserva
- doble reclamo
- doble ejecución de una operación “única”
- doble consumo de saldo o crédito

### Idea útil

La familia del problema es la misma:
- dos flujos distintos creen legítimamente que aún pueden consumir el mismo recurso.

### Regla sana

Si el negocio no tolera que una unidad se use dos veces, el diseño no puede depender solo de buenas intenciones temporales del tipo “si todavía queda, avanzá”.

### Idea importante

Cuando algo solo debe pasar una vez, la concurrencia deja de ser opcional como conversación de diseño.

---

# Parte 8: Qué síntomas suelen aparecer

No siempre vas a ver crashes o errores ruidosos.
A veces los síntomas son más silenciosos:

- stock negativo
- dos órdenes confirmadas sobre la misma última unidad
- más asistentes confirmados que cupos disponibles
- dos usuarios con el mismo turno
- cupones o códigos usados más veces de lo permitido
- estados imposibles que luego el backoffice intenta corregir manualmente
- errores “esporádicos” que soporte no logra reproducir fácil

### Idea importante

La race condition no necesita romper todo para ser grave.
Basta con romper la exclusividad en un porcentaje pequeño de casos.

### Regla sana

Si el daño por duplicación es serio, una frecuencia baja no convierte el problema en menor.

---

# Parte 9: Qué patrones de código merecen sospecha inmediata

Conviene sospechar especialmente cuando veas cosas como:

- buscar stock y luego descontar en pasos separados
- verificar existencia de reserva y después crear
- chequear cupón no usado y luego marcarlo
- leer cupos restantes y luego confirmar inscripción
- contar registros y después permitir crear uno más
- validar “último disponible” y después persistir el consumo

### Idea útil

Todos esos patrones comparten la misma estructura:
- **read → decide → write**
sobre un recurso finito o exclusivo.

### Regla sana

Cada vez que la lógica de negocio sea “si no está tomado, lo tomo”, ya merece una revisión explícita de concurrencia.

---

# Parte 10: Qué preguntas conviene hacer en una review

Cuando revises stock, cuotas o exclusividad, conviene preguntar:

- ¿qué recurso solo puede asignarse un número limitado de veces?
- ¿cómo se verifica disponibilidad hoy?
- ¿cómo se convierte esa disponibilidad en asignación real?
- ¿qué pasa si dos flujos ejecutan el mismo check a la vez?
- ¿hay requests, workers o retries que compiten por lo mismo?
- ¿qué síntoma aparecería si dos actores “ganaran”?
- ¿el sistema modela exclusividad como un dato o como una transición que necesita protección especial?

### Idea importante

La buena review no termina en:
- “chequea stock”
Sigue hasta:
- “¿qué impide que otro llegue a la misma conclusión antes del descuento real?”

---

# Parte 11: Qué revisar en una app Spring

En una app Spring, conviene sospechar especialmente cuando veas:

- compras o reservas con inventario limitado
- canjes o cupones de un solo uso
- creación de recursos sujetos a capacidad máxima
- asignaciones exclusivas a un actor
- verificación previa y update posterior en métodos distintos
- request + worker compitiendo por el mismo cupo
- lógica que depende de “si todavía queda” o “si todavía no fue usado”

### Idea útil

Si la app gestiona un recurso que el negocio considera finito, ya tenés una superficie clásica de race condition aunque el código se vea perfectamente razonable.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- conciencia clara de que disponibilidad y asignación no son lo mismo
- menor ventana entre check y consumo real
- modelado explícito de recursos exclusivos
- menos pasos separados sin protección suficiente
- equipos que entienden que overselling, doble reserva o doble uso son problemas de concurrencia y no solo de UX o soporte

### Idea importante

La madurez aquí se nota cuando el sistema no confía solo en que “nadie más llegará justo en ese momento”.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- “primero validamos y después recién grabamos” como respuesta suficiente
- lógica secuencial sobre recursos finitos compartidos
- retries o workers tocando el mismo recurso sin modelo claro
- confianza excesiva en la baja probabilidad de colisión
- soporte corrigiendo manualmente dobles reservas o overselling
- el equipo piensa en reglas de negocio, pero no en competencia temporal por esas reglas

### Regla sana

Si el sistema depende de que dos actores no coincidan en un momento desafortunado para mantener la exclusividad, probablemente todavía no tiene bien resuelto el problema.

---

## Checklist práctica

Para revisar stock, cuotas y recursos exclusivos, preguntate:

- ¿qué recurso es finito o único?
- ¿qué check se hace antes de asignarlo?
- ¿qué pasa entre ese check y la escritura real?
- ¿quién más puede competir por ese mismo recurso?
- ¿qué síntomas aparecerían si dos ganaran?
- ¿qué parte del diseño asume un mundo secuencial que en producción no existe?
- ¿qué revisarías si tuvieras que demostrar que nunca puede haber doble asignación?

---

## Mini ejercicio de reflexión

Tomá un flujo real de tu app Spring y respondé:

1. ¿Qué recurso exclusivo maneja?
2. ¿Cómo verifica disponibilidad hoy?
3. ¿Cómo lo asigna o consume realmente?
4. ¿Qué otros requests, jobs o retries podrían competir por lo mismo?
5. ¿Qué daño sería peor si dos “ganaran”?
6. ¿Qué parte del equipo sigue viendo esto como “solo lógica de negocio”?
7. ¿Qué revisarías primero después de este tema?

---

## Resumen

Stock, cuotas y recursos exclusivos importan porque muestran con muchísima claridad que una verificación correcta de disponibilidad no basta si el sistema permite que dos actores distintos conviertan esa misma disponibilidad en dos asignaciones reales antes de que el estado quede efectivamente comprometido.

La gran intuición del tema es esta:

- disponibilidad no equivale a posesión
- leer “todavía hay” no significa haber ganado el recurso
- dos requests normales alcanzan para romper la exclusividad
- overselling, doble reserva y doble uso son el mismo patrón de concurrencia
- y el problema real no está solo en el check, sino en cómo se protege la transición hacia el consumo real

En resumen:

> un backend más maduro no trata stock, cupos y recursos exclusivos como simples contadores de negocio que pueden validarse una vez y luego actualizarse con calma, sino como superficies donde varias operaciones normales pueden competir por la misma unidad lógica en un lapso muy corto y romper, sin que el código “parezca mal”, la exclusividad que el negocio necesita sostener.  
> Entiende que la pregunta importante no es solo si había disponibilidad cuando el sistema miró, sino qué impide que otra operación vea lo mismo y llegue a la misma conclusión antes de que la asignación quede realmente consolidada.  
> Y justamente por eso este tema importa tanto: porque baja el problema de race conditions a una situación que casi cualquier producto entiende enseguida y deja una intuición muy útil para todo el bloque, que es que donde el negocio necesita unicidad, cuota o capacidad limitada, la concurrencia deja de ser un detalle de implementación y pasa a ser parte central del modelo de seguridad y consistencia.

---

## Próximo tema

**Checks de permiso antes de usar el recurso: TOCTOU en ownership y autorización**
