---
title: "Verificando descubrimiento de servicios"
description: "Checkpoint práctico del bloque de Eureka. Revisión del registro de instancias, lectura de la consola de descubrimiento y validación del estado actual de NovaMarket antes de usar nombres lógicos."
order: 28
module: "Módulo 5 · Service Discovery y comunicación profesional"
level: "intermedio"
draft: false
---

# Verificando descubrimiento de servicios

En la clase anterior conectamos los servicios principales de NovaMarket con `discovery-server` y logramos que se registren en Eureka.

Ahora toca hacer una pausa muy útil:

**entender bien qué estamos viendo y verificar que el descubrimiento esté realmente sano.**

Esta clase funciona como checkpoint del bloque de registro y descubrimiento antes de empezar a usar nombres lógicos para integrar servicios.

No vamos a incorporar una tecnología nueva.  
Vamos a observar, validar y consolidar lo que acabamos de construir.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber confirmado que:

- los servicios principales se registran correctamente,
- la consola de Eureka refleja el estado real del sistema,
- el nombre lógico de cada servicio es el esperado,
- y NovaMarket está listo para reemplazar URLs fijas por resolución vía discovery.

---

## Estado de partida

En este punto del curso deberíamos tener:

- `discovery-server` arriba,
- `catalog-service` registrado,
- `inventory-service` registrado,
- `order-service` registrado.

Además, el flujo actual de órdenes debería seguir funcionando como antes, aunque todavía use una llamada fija hacia inventario.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- revisar la consola de Eureka,
- interpretar qué representa cada servicio registrado,
- verificar nombres, instancias y estados,
- reiniciar o apagar un servicio para observar cambios,
- y confirmar que el bloque de discovery quedó sano antes de avanzar.

---

## Por qué esta clase vale la pena

A veces cuando una tecnología “anda” aparece la tentación de avanzar enseguida.

Pero en microservicios eso suele salir caro.

Conviene detenerse y entender bien:

- qué se registró,
- bajo qué nombre,
- en qué estado,
- y qué implicancias tiene eso para el siguiente paso de la arquitectura.

Esta clase sirve justamente para que Eureka no quede como una caja negra más dentro del proyecto.

---

## Paso 1 · Levantar `discovery-server`

Primero asegurate de que `discovery-server` esté arriba y accesible.

Por ejemplo:

```txt
http://localhost:8761
```

La consola debería abrirse correctamente.

---

## Paso 2 · Levantar los tres servicios principales

Ahora asegurate de que estén arriba:

- `catalog-service`
- `inventory-service`
- `order-service`

Conviene levantarlos después de `discovery-server`, para que el registro se produzca con normalidad desde el comienzo.

---

## Paso 3 · Revisar la consola de Eureka

Entrá a:

```txt
http://localhost:8761
```

En esta pantalla deberías poder ver las aplicaciones registradas.

En una situación saludable, debería aparecer algo equivalente a:

- `CATALOG-SERVICE`
- `INVENTORY-SERVICE`
- `ORDER-SERVICE`

Lo importante acá no es solo que estén, sino que estén con el nombre esperado.

---

## Qué representa cada entrada en la consola

Cada aplicación registrada representa un nombre lógico bajo el cual Eureka conoce al servicio.

Por ejemplo:

- `CATALOG-SERVICE` representa a `catalog-service`
- `INVENTORY-SERVICE` representa a `inventory-service`
- `ORDER-SERVICE` representa a `order-service`

Según la configuración o la visualización, Eureka puede mostrar los nombres en mayúsculas aunque en el proyecto los manejemos en minúsculas.

Eso es completamente normal.

---

## Paso 4 · Verificar que el nombre lógico coincide con `spring.application.name`

Este es uno de los chequeos más importantes.

Queremos confirmar que lo que aparece en Eureka realmente coincide con el `spring.application.name` de cada servicio.

Por ejemplo:

- `catalog-service` debe registrarse como `catalog-service`
- `inventory-service` debe registrarse como `inventory-service`
- `order-service` debe registrarse como `order-service`

Si Eureka muestra algo inesperado, probablemente haya un problema de configuración que conviene corregir antes de seguir.

---

## Paso 5 · Revisar el estado de cada instancia

La consola de Eureka no solo muestra nombres.  
También muestra el estado de las instancias registradas.

Lo que queremos ver en una situación saludable es que las instancias estén marcadas como:

- disponibles,
- activas,
- o equivalentes al estado `UP`, según la visualización.

Si una instancia aparece en un estado extraño o no termina de registrarse bien, esta es la mejor etapa para detectarlo.

---

## Paso 6 · Apagar temporalmente un servicio y observar el cambio

Una verificación muy útil en esta clase es apagar uno de los servicios y mirar cómo reacciona Eureka.

Por ejemplo:

1. apagá `inventory-service`
2. revisá la consola
3. observá si después de un tiempo deja de figurar o cambia su estado

Luego volvelo a levantar y observá cómo reaparece.

Esto ayuda mucho a entender que Eureka no es simplemente una lista estática de servicios, sino un registro vivo del estado del sistema.

---

## Paso 7 · Reiniciar un servicio y confirmar nuevo registro

Podés hacer una prueba similar reiniciando, por ejemplo, `catalog-service`.

La idea es confirmar que:

- el registro se vuelve a producir,
- Eureka sigue mostrando la instancia,
- y el servidor de descubrimiento está reflejando el entorno actual.

Esta clase gana mucho valor cuando el alumno ve ese comportamiento en vivo.

---

## Paso 8 · Probar que los servicios siguen funcionando

Después de observar el registro, conviene volver a comprobar funcionalidad.

Probá por ejemplo:

```bash
curl http://localhost:8081/products
curl http://localhost:8082/inventory
curl -X POST http://localhost:8083/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 1 }
    ]
  }'
```

Esto confirma que:

- el sistema sigue operando,
- y el uso de Eureka hasta acá no rompió ningún contrato funcional.

---

## Paso 9 · Entender qué todavía no cambió

Este punto es muy importante para no sacar conclusiones prematuras.

Aunque los servicios ya estén registrados, **todavía**:

- `order-service` sigue llamando a `inventory-service` por URL fija,
- no estamos usando resolución por nombre lógico,
- no hay balanceo,
- no hay Feign.

Es decir:

**el discovery ya existe, pero todavía no está siendo explotado por la integración.**

Y eso está bien.  
Esta clase es justamente la transición entre el registro y el uso real de ese registro.

---

## Qué estamos logrando con esta clase

Lo que logramos acá es comprensión operativa del bloque de discovery.

No solo sabemos que los servicios “se registran”.  
También podemos ver:

- cómo aparecen,
- cómo se nombran,
- cómo cambian de estado,
- y por qué eso importa para lo que viene.

Esto fortalece muchísimo la siguiente etapa del curso.

---

## Qué errores comunes se detectan bien en esta clase

### 1. `spring.application.name` mal definido
Entonces Eureka muestra nombres inesperados.

### 2. Servicio que no se registra
Puede faltar la dependencia, la configuración o haber un problema de conectividad.

### 3. Instancia que no aparece `UP`
Conviene revisar logs y configuración.

### 4. Eureka levantado pero clientes mal configurados
La consola deja esto bastante en evidencia.

### 5. Creer que ya estamos usando discovery en las llamadas
Todavía no; eso viene después.

---

## Qué todavía no estamos haciendo

Todavía no:

- reemplazamos la URL fija en `order-service`,
- integramos OpenFeign,
- ni usamos el nombre lógico de `inventory-service`.

Todo eso viene a continuación.

La meta de hoy es mucho más concreta:

**dejar el bloque de Eureka comprendido y verificado.**

---

## Checklist de verificación mínima

Al terminar esta clase deberías poder confirmar que:

- `discovery-server` está arriba,
- los tres servicios aparecen en la consola,
- sus nombres lógicos son correctos,
- su estado es saludable,
- apagar o reiniciar servicios se refleja en Eureka,
- y el sistema sigue funcionando.

Si todo eso está bien, entonces NovaMarket ya tiene una base sólida de descubrimiento para avanzar hacia una integración más profesional.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, Eureka debería dejar de ser para vos una pieza “que está ahí” y pasar a ser una parte entendible y verificable del sistema.

Eso es exactamente lo que necesitamos antes de hacer un cambio mucho más importante en la integración entre servicios.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a integrar **OpenFeign** en `order-service`.

Ese va a ser el primer paso real para consumir `inventory-service` usando el nombre lógico registrado en Eureka, en lugar de depender de una URL fija.

---

## Cierre

En esta clase verificamos y entendimos mejor el descubrimiento de servicios en NovaMarket.

Eso nos deja en una muy buena posición para el siguiente salto del curso: pasar de una integración HTTP simple y rígida a una integración más profesional apoyada en Eureka y clientes declarativos.
