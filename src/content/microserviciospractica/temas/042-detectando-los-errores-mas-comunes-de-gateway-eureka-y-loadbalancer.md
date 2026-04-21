---
title: "Detectando los errores más comunes de Gateway, Eureka y LoadBalancer"
description: "Cierre práctico del subbloque rehecho de API Gateway. Revisión de fallas frecuentes al integrar rutas lb://, discovery y múltiples instancias dentro de NovaMarket."
order: 42
module: "Módulo 6 · API Gateway"
level: "intermedio"
draft: false
---

# Detectando los errores más comunes de Gateway, Eureka y LoadBalancer

En las últimas clases del bloque rehecho del gateway hicimos un recorrido bastante fuerte:

- entendimos qué problema resuelve Load Balancer,
- ubicamos a NovaMarket dentro de un modelo principalmente de client-side load balancing,
- integramos Spring Cloud LoadBalancer en `api-gateway`,
- configuramos rutas con `lb://`,
- levantamos múltiples instancias reales,
- observamos reparto de tráfico,
- y hasta comparamos rutas explícitas con discovery locator.

Eso ya tiene muchísimo valor.

Pero ahora conviene hacer algo muy importante antes de seguir avanzando:

**detenernos a revisar los errores más comunes de Gateway + Eureka + LoadBalancer.**

Ese es el objetivo de esta clase.

Porque una cosa es que el bloque haya funcionado una vez.  
Y otra bastante distinta es saber detectar con rapidez qué suele romperse cuando este tipo de integración falla.

Ese conocimiento vale muchísimo en la práctica.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mucho más claro qué errores son los más frecuentes en este bloque de arquitectura,
- entendido cómo reconocerlos y dónde mirar primero,
- consolidado un checklist mental de diagnóstico,
- y más fuerte la base del gateway antes de seguir con el resto del roadmap rehecho.

Esta clase funciona como checkpoint técnico del bloque nuevo de Gateway + Eureka + LoadBalancer.

---

## Estado de partida

En este punto del curso ya tenemos una versión bastante madura del bloque:

- `api-gateway` existe,
- enruta con `lb://`,
- Eureka registra servicios,
- múltiples instancias reales ya pueden participar,
- y el reparto de tráfico ya se observó al menos en una forma básica.

Eso significa que ahora el valor no está tanto en “construir algo nuevo”, sino en **volver más robusta la comprensión de lo ya construido**.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- repasar los errores más frecuentes,
- entender qué síntomas producen,
- ubicar dónde conviene mirar primero,
- y dejar un mapa de diagnóstico muy útil para el resto del curso.

---

## Qué queremos resolver exactamente

Queremos evitar esta situación muy común en microservicios:

- “algo dejó de responder”
- y no saber si el problema está en:
  - el gateway,
  - Eureka,
  - la ruta,
  - el path,
  - el registro,
  - el puerto,
  - o el balanceo

La meta de hoy es justamente reducir esa zona gris.

---

## Error 1 · El gateway no tiene la dependencia correcta de LoadBalancer

Este es uno de los errores más clásicos del bloque rehecho.

### Síntoma
Querés usar algo como:

```yaml
uri: lb://inventory-service
```

pero el gateway no logra resolver correctamente el servicio o falla al arrancar / enrutar.

### Qué revisar primero
- que `api-gateway` tenga agregada la dependencia de **Spring Cloud LoadBalancer**
- que no estés asumiendo que Eureka Client solo ya alcanza

### Idea clave
- Eureka registra
- Gateway enruta
- LoadBalancer resuelve instancias para `lb://`

Las tres piezas tienen que estar presentes.

---

## Error 2 · El servicio no aparece registrado en Eureka

### Síntoma
La ruta del gateway está bien escrita, pero el servicio destino no se resuelve.

### Qué revisar primero
- consola de Eureka en `http://localhost:8761`
- que el servicio realmente aparezca
- que esté `UP`
- que tenga el nombre esperado

### Idea clave
Si el servicio no está en Eureka, el gateway no tiene de dónde resolver instancias.  
En ese caso, el problema no está necesariamente en la ruta; puede estar en el registro.

---

## Error 3 · El nombre lógico no coincide

Este error también es muy frecuente.

### Síntoma
En el gateway escribiste algo como:

```yaml
uri: lb://inventory-service
```

pero el servicio se registró con otro nombre o con una variante inesperada.

### Qué revisar primero
- `spring.application.name`
- cómo aparece realmente en Eureka
- y si el nombre lógico usado por el gateway coincide con el del registro

### Idea clave
El nombre lógico no es un detalle decorativo.  
Es la llave central de la resolución.

---

## Error 4 · El `Path` de la ruta no matchea la request real

### Síntoma
Entrás al gateway con una URL y obtenés un error, pero el servicio sí está arriba y registrado.

### Qué revisar primero
- el predicado `Path=...`
- la URL exacta que estás llamando
- si hay o no una coincidencia real entre ambas

### Ejemplo
Si definiste:

```yaml
Path=/inventory/**
```

pero llamás a otra cosa distinta, la ruta simplemente no se activa.

### Idea clave
A veces el problema no es ni Eureka ni LoadBalancer.  
Es simplemente que la request nunca entró en esa ruta.

---

## Error 5 · El path interno llega mal al microservicio

Este punto aparece muchísimo cuando usamos `StripPrefix`.

### Síntoma
La ruta del gateway sí se activa, pero el microservicio devuelve 404 o parece no reconocer el endpoint.

### Qué revisar primero
- si usaste `StripPrefix=1`
- qué path entra por el gateway
- qué path termina recibiendo realmente el microservicio

### Ejemplo
Si el servicio espera:

```txt
/orders
```

y vos sin darte cuenta le estás mandando:

```txt
/order-api/orders
```

la request no va a encontrar el endpoint correcto.

### Idea clave
Siempre conviene pensar por separado:

- path público
- path interno resultante

---

## Error 6 · Querer probar balanceo sin levantar más de una instancia

### Síntoma
Todo parece funcionar, pero no ves reparto real y te da la impresión de que LoadBalancer “no hace nada”.

### Qué revisar primero
- cuántas instancias reales del servicio están vivas
- si ambas están registradas en Eureka
- y si ambas responden correctamente

### Idea clave
Con una sola instancia, el modelo correcto sigue existiendo, pero el reparto todavía no se ve de forma interesante.

---

## Error 7 · No distinguir las instancias al probar

### Síntoma
Mandás varias requests, pero no podés saber si respondió la misma instancia o una distinta.

### Qué revisar primero
- si agregaste un endpoint auxiliar o una señal visible
- si los logs de cada proceso se distinguen
- si realmente tenés una forma observable de identificar quién respondió

### Idea clave
El balanceo puede estar funcionando perfectamente y aun así pasar desapercibido si no dejás una señal visible.

---

## Error 8 · Arranque en desorden de la infraestructura

### Síntoma
Servicios que a veces aparecen, a veces no; rutas que fallan; clientes que arrancan raro.

### Qué revisar primero
- si levantaste primero `config-server`
- después `discovery-server`
- y recién luego los servicios y el gateway

### Idea clave
En una arquitectura así, el orden de arranque importa bastante más de lo que parece al principio.

---

## Error 9 · Mezclar demasiado rápido discovery locator con rutas explícitas

### Síntoma
El gateway empieza a tener comportamientos menos claros, paths confusos o exposiciones inesperadas.

### Qué revisar primero
- si realmente querías usar discovery locator
- si no estás mezclándolo con rutas manuales sin una intención clara
- y si el path público sigue teniendo sentido

### Idea clave
Discovery locator no está mal, pero conviene introducirlo con criterio.  
En este punto del curso, las rutas explícitas siguen siendo la base más clara.

---

## Error 10 · Suponer que ya quedó resuelta toda la resiliencia del sistema

### Síntoma
Después de ver reparto entre instancias, sacar conclusiones demasiado fuertes sobre disponibilidad general.

### Qué revisar primero
- qué problema resolviste realmente
- y qué problemas todavía no resolviste

### Idea clave
Este bloque ya mejora muchísimo la arquitectura, pero todavía no cierra por sí solo:
- circuit breakers
- retries más finos
- timeouts más ricos
- fallback
- observabilidad distribuida profunda

No conviene inflar el alcance de lo logrado.

---

## Qué checklist mental conviene llevarse

A esta altura del curso, un checklist muy sano para diagnosticar este bloque podría ser:

### 1. ¿El gateway tiene la dependencia correcta?
### 2. ¿El servicio destino está registrado en Eureka?
### 3. ¿El nombre lógico coincide?
### 4. ¿La ruta del gateway matchea el path público real?
### 5. ¿El path interno llega correctamente al microservicio?
### 6. ¿Hay realmente más de una instancia si quiero observar reparto?
### 7. ¿Tengo una forma visible de distinguir qué instancia respondió?
### 8. ¿Levanté la infraestructura en un orden razonable?

Ese checklist vale muchísimo más que memorizar errores aislados.

---

## Qué estamos logrando con esta clase

Esta clase consolida el bloque rehecho del gateway desde el punto de vista del diagnóstico.

Ya no estamos solo construyendo algo que funciona.  
También estamos dejando un mapa bastante más robusto para reconocer con rapidez dónde suele romperse y cómo conviene empezar a mirarlo.

Eso es un salto importante de madurez.

---

## Qué todavía no hicimos

Todavía no cerramos este subbloque con una síntesis operativa fuerte ni decidimos exactamente cómo enlazarlo con el siguiente tramo del curso rehecho.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dejar bien identificados los errores más comunes de Gateway + Eureka + LoadBalancer dentro de NovaMarket.**

---

## Errores comunes al estudiar este tema

### 1. Querer memorizar síntomas sin entender la arquitectura
Conviene siempre volver al mapa general.

### 2. Buscar el problema “en el gateway” por reflejo
A veces el problema está en Eureka, en el registro o en el path.

### 3. No separar capas
Registro, resolución, ruteo y path interno no son la misma cosa.

### 4. No dejar señales observables en las pruebas
Eso hace mucho más difícil entender qué está pasando.

### 5. No usar una verificación en orden
Conviene ir desde infraestructura base hacia request final.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener un mapa mental mucho más fuerte de dónde suelen aparecer los problemas en este bloque del sistema y cómo conviene empezar a diagnosticarlos sin perderse.

Eso deja muy bien preparado el cierre de este subtramo rehecho del gateway.

---

## Punto de control

Antes de seguir, verificá que:

- sabés distinguir problemas de registro, de resolución y de path,
- entendés qué revisar primero cuando una ruta `lb://` falla,
- tenés un checklist mental razonable para este bloque,
- y sentís que el gateway ya dejó de ser una caja negra dentro de NovaMarket.

Si eso está bien, ya podemos cerrar este subbloque con una síntesis operativa fuerte y seguir con el resto del roadmap rehecho.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a cerrar este primer gran tramo rehecho del gateway con una síntesis operativa clara, validando qué postura nueva ganó NovaMarket después de incorporar correctamente Load Balancer al punto de entrada del sistema.

---

## Cierre

En esta clase detectamos los errores más comunes de Gateway, Eureka y LoadBalancer.

Con eso, NovaMarket deja este tramo del bloque rehecho no solo con una arquitectura más fuerte, sino también con una comprensión mucho más robusta de cómo sostenerla, diagnosticarla y seguir construyéndola sin que el gateway quede como una pieza opaca o mágica.
