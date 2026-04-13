---
title: "Integrando Micrometer Tracing en NovaMarket"
description: "Inicio del tramo de trazas distribuidas en NovaMarket. Integración de Micrometer Tracing para preparar el seguimiento del recorrido completo de una request entre servicios."
order: 52
module: "Módulo 9 · Observabilidad de punta a punta"
level: "intermedio"
draft: false
---

# Integrando Micrometer Tracing en NovaMarket

En las clases anteriores del módulo de observabilidad dimos dos pasos importantes:

- agregamos Actuator,
- e incorporamos una base de métricas con Micrometer.

Eso ya nos permite ver mucho más del sistema que antes.  
Pero todavía nos falta una pieza esencial para observar arquitecturas distribuidas con más claridad:

**las trazas distribuidas.**

Porque una cosa es mirar cada servicio por separado.  
Y otra muy distinta es poder seguir el recorrido de una misma request a través de varios componentes del sistema.

La herramienta base que vamos a incorporar ahora para empezar ese camino es **Micrometer Tracing**.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- incorporada la base de tracing en los servicios relevantes,
- preparado el sistema para propagar contexto de trazas,
- y lista la arquitectura para que, en las próximas clases, podamos visualizar el recorrido real de una request entre varios servicios.

Todavía no vamos a cerrar todo el flujo visual de tracing.  
La meta de hoy es dejar la integración técnica bien encaminada.

---

## Estado de partida

Partimos de una arquitectura donde:

- los servicios principales ya tienen Actuator,
- ya exponen métricas,
- y además existe un flujo distribuido bastante interesante entre:
  - `api-gateway`
  - `order-service`
  - `inventory-service`

Eso hace que NovaMarket ya sea un muy buen candidato para empezar a trabajar trazas reales.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- agregar dependencias de tracing,
- preparar los servicios para propagar contexto,
- revisar configuración base,
- y dejar todo listo para que en las próximas clases podamos observar una request viajando por la arquitectura.

---

## Qué problema resuelve Micrometer Tracing

Cuando una request pasa por varios componentes, es muy común que surjan preguntas como:

- ¿por dónde pasó exactamente?
- ¿en qué servicio se demoró más?
- ¿qué request interna corresponde a esta request externa?
- ¿cómo relaciono logs y comportamiento entre varios servicios?

Micrometer Tracing ayuda justamente a construir ese hilo conductor.

No reemplaza logs ni métricas, pero aporta algo diferente:

**contexto compartido entre componentes del flujo.**

---

## Qué servicios conviene cubrir primero

Para esta etapa del curso práctico, los más valiosos para empezar son:

- `api-gateway`
- `order-service`
- `inventory-service`

¿Por qué?

Porque ahí vive el flujo distribuido principal actual del sistema:

- el cliente entra por el gateway,
- pasa por órdenes,
- y órdenes consulta inventario.

Si logramos trazar bien esa secuencia, el aprendizaje del módulo se vuelve muy potente.

---

## Paso 1 · Agregar dependencias de tracing en `api-gateway`

Dentro de `api-gateway`, agregá las dependencias necesarias para:

- **Micrometer Tracing**
- y el bridge correspondiente al stack que vayas a usar después para exportación o visualización

Para esta clase no hace falta cerrar aún toda la parte de backend de trazas, pero sí conviene dejar la base técnica correcta.

---

## Paso 2 · Repetir la integración en `order-service`

Ahora hacé lo mismo en:

- `order-service`

Este es probablemente el servicio más importante del módulo actual, porque está en el centro del flujo distribuido y además ya carga bastante lógica del negocio.

---

## Paso 3 · Repetir la integración en `inventory-service`

Ahora incorporá la misma base en:

- `inventory-service`

La idea es que la request ya no se corte en términos de contexto cuando salte desde órdenes hacia inventario.

---

## Paso 4 · Mantener Actuator y métricas convivendo con tracing

Es importante entender que esto no reemplaza lo que ya construimos.

No estamos sacando:

- Actuator
- ni Micrometer Metrics

Estamos sumando otra capa:

- **tracing**

La observabilidad madura suele necesitar justamente esa combinación:

- estado,
- métricas,
- logs,
- y trazas.

---

## Paso 5 · Revisar configuración mínima necesaria

Dependiendo de la integración exacta que estés usando, puede ser útil dejar o revisar algunas propiedades comunes de observabilidad en la configuración de los servicios.

Para esta etapa no hace falta una configuración gigantesca.  
Lo importante es que el stack de tracing quede activo y que el contexto pueda propagarse correctamente entre componentes.

Si querés dejar una pista clara en la configuración centralizada, podrías preparar bloques relacionados con observabilidad dentro de:

- `api-gateway.yml`
- `order-service.yml`
- `inventory-service.yml`

aunque en esta clase la prioridad está en que las dependencias y el pipeline de trazas queden activados.

---

## Paso 6 · Reiniciar los servicios relevantes

Después de agregar las dependencias, reiniciá:

- `api-gateway`
- `order-service`
- `inventory-service`

Y mantené arriba también:

- `config-server`
- `discovery-server`
- Keycloak si querés seguir probando el flujo autenticado

La idea es que el ecosistema real del sistema siga siendo el mismo, pero ahora enriquecido con contexto de trazas.

---

## Paso 7 · Generar tráfico real en el flujo distribuido

Ahora conviene ejecutar un request que pase por varios componentes.

Por ejemplo, una orden autenticada:

```bash
curl -i -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 1 }
    ]
  }'
```

Este tipo de request es ideal porque:

- entra por el gateway,
- pasa por `order-service`,
- y `order-service` consulta `inventory-service`.

Es decir, genera justo el tipo de recorrido que más nos interesa observar.

---

## Paso 8 · Revisar logs en busca de señales de trazas

Aunque todavía no hayamos integrado la visualización final del tracing, muchas veces ya aparecen señales útiles en logs o en el comportamiento del stack una vez activado.

La idea es empezar a observar si:

- se propagan identificadores de contexto,
- los logs muestran señales de correlación,
- o al menos la arquitectura ya no procesa cada request como eventos completamente aislados.

No hace falta que en esta clase todo se vea perfecto.  
La meta es preparar el terreno y empezar a notar la diferencia.

---

## Paso 9 · Entender qué estamos construyendo de fondo

Esta clase no es espectacular por lo que se ve inmediatamente, sino por lo que habilita.

Después de esta integración, NovaMarket queda listo para que en las próximas clases podamos:

- levantar un backend de trazas,
- seguir una request de punta a punta,
- y relacionar mucho mejor logs y comportamiento entre servicios.

En otras palabras:  
esta clase construye la base del hilo conductor del sistema.

---

## Qué estamos logrando con esta clase

Esta clase hace que NovaMarket deje de pensar cada servicio como una isla totalmente separada desde el punto de vista de observabilidad.

Ahora empezamos a preparar al sistema para que una misma request tenga identidad distribuida a lo largo de su recorrido.

Eso es un cambio muy importante en la calidad de la arquitectura.

---

## Qué todavía no hicimos

Todavía no:

- levantamos el backend concreto de trazas,
- visualizamos spans en una UI,
- ni recorrimos una request completa desde una herramienta dedicada.

Todo eso viene enseguida.

La meta de hoy es mucho más concreta:

**dejar integrado el tracing en los servicios relevantes del flujo principal.**

---

## Errores comunes en esta etapa

### 1. Agregar tracing solo a un servicio
Entonces el contexto distribuido queda incompleto.

### 2. Esperar una visualización completa sin haber montado aún el backend de trazas
Esta clase todavía está preparando la base.

### 3. Olvidarse del gateway
Es una pieza clave para seguir la entrada al sistema.

### 4. Pensar que tracing reemplaza métricas o logs
En realidad, los complementa.

### 5. No generar tráfico real después de integrar tracing
Sin requests distribuidas, cuesta mucho percibir su valor.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, los componentes principales del flujo distribuido de NovaMarket deberían estar preparados para participar en trazas compartidas.

Eso deja lista la base técnica para que en el siguiente paso podamos dar visibilidad real a ese recorrido.

---

## Punto de control

Antes de seguir, verificá que:

- agregaste dependencias de tracing en los servicios relevantes,
- reiniciaste el entorno correspondiente,
- generaste al menos una request distribuida real,
- y el sistema sigue funcionando normalmente con esta nueva capa incorporada.

Si eso está bien, ya podemos pasar al siguiente paso natural del módulo: levantar el backend donde vamos a ver esas trazas.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a levantar **Zipkin**.

Ese será el paso que nos permita empezar a ver de forma mucho más tangible el recorrido distribuido de las requests dentro de NovaMarket.

---

## Cierre

En esta clase integramos Micrometer Tracing en los componentes principales del flujo distribuido de NovaMarket.

Con eso, la arquitectura queda lista para dar el salto desde una observabilidad basada en servicios aislados hacia una observabilidad capaz de seguir una request a través de todo el sistema.
