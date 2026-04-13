---
title: "Introducción a API Gateway"
description: "Qué problema resuelve un API Gateway en una arquitectura de microservicios, por qué aparece naturalmente en NovaMarket y cómo cambia la forma de exponer el sistema hacia clientes externos."
order: 13
module: "Módulo 4 · API Gateway"
level: "intro"
draft: false
---

# Introducción a API Gateway

Hasta este punto del curso, NovaMarket ya empezó a tomar forma como sistema distribuido.

Tenemos una arquitectura donde distintos servicios cumplen responsabilidades diferentes:

- `catalog-service` expone el catálogo,
- `inventory-service` administra stock,
- `order-service` crea órdenes,
- `config-server` centraliza configuración,
- `discovery-server` permite registrar y descubrir instancias,
- y la comunicación entre servicios puede apoyarse en Eureka, Feign y balanceo.

Con eso ya podemos construir una base funcional bastante interesante.

Pero ahora aparece un problema nuevo.

## El problema de exponer muchos servicios hacia afuera

Imaginemos que un cliente externo —una UI, una app móvil, Postman o cualquier consumidor HTTP— quisiera interactuar directamente con NovaMarket.

Sin un gateway, ese cliente tendría que saber:

- qué servicios existen,
- en qué host o puerto está cada uno,
- qué rutas expone cada servicio,
- cuáles son internas y cuáles externas,
- qué reglas de seguridad aplica cada servicio,
- y cómo adaptarse si la topología cambia.

Eso genera un acoplamiento muy incómodo.

El cliente externo empieza a conocer demasiados detalles internos del sistema.

---

## Qué es un API Gateway

Un **API Gateway** es un componente que actúa como **punto de entrada único** para clientes externos.

En lugar de que el cliente llame directamente a cada microservicio, llama al gateway.

El gateway recibe la request y decide:

- a qué servicio interno enviarla,
- cómo transformar o enrutar la petición,
- qué filtros aplicar,
- qué políticas transversales ejecutar,
- y cómo devolver la respuesta.

Dicho de otra forma:

**el gateway se convierte en la puerta principal del sistema**.

---

## Por qué aparece naturalmente en una arquitectura distribuida

Cuando un sistema tiene pocos servicios y está en una etapa muy temprana, puede parecer aceptable exponer cada microservicio por separado.

Pero a medida que crece, esa decisión empieza a generar ruido:

- demasiados endpoints públicos,
- demasiados puertos visibles,
- demasiadas reglas duplicadas,
- demasiado conocimiento de topología por parte del cliente.

El gateway aparece entonces como una forma de ordenar esa entrada.

No es un “adorno cloud”.

Es una respuesta a una necesidad real de organización, encapsulamiento y control.

---

## Qué cambia en NovaMarket cuando incorporamos un gateway

Antes del gateway, el acceso puede verse más o menos así:

- cliente → `catalog-service`
- cliente → `order-service`
- cliente → `inventory-service`

Eso expone demasiado del interior del sistema.

Después del gateway, el modelo cambia:

- cliente → `api-gateway` → `catalog-service`
- cliente → `api-gateway` → `order-service`
- cliente → `api-gateway` → `inventory-service`

A partir de ahí, el cliente ya no necesita conocer la red interna ni la organización detallada de los servicios.

---

## Beneficio principal: punto de entrada único

Este es el beneficio más evidente.

En lugar de múltiples puertas de acceso, tenemos una sola entrada controlada.

Eso simplifica:

- documentación pública,
- consumo desde frontend o apps móviles,
- seguridad,
- monitoreo,
- evolución de rutas.

Además, nos permite cambiar detalles internos del sistema con menos impacto sobre los consumidores externos.

---

## Beneficio arquitectónico: ocultar la topología interna

El gateway ayuda a que el exterior vea una API más estable y más limpia.

Por ejemplo, un cliente no necesita saber:

- cuántas instancias de `catalog-service` existen,
- si `order-service` cambió de puerto,
- si `inventory-service` fue movido a otra red,
- o si el sistema dejó de exponer ciertas rutas internas.

Todo eso queda oculto detrás del gateway.

Esta idea es muy importante en arquitectura distribuida:

**el exterior debería depender lo menos posible del interior**.

---

## Beneficio operativo: centralizar preocupaciones transversales

Hay varias cosas que normalmente no pertenecen a la lógica de negocio específica de un servicio, pero sí afectan a todo el sistema.

Por ejemplo:

- autenticación,
- autorización básica de entrada,
- logging de requests,
- correlation IDs,
- reescritura de paths,
- headers comunes,
- rate limiting,
- manejo centralizado de errores.

Sin gateway, estas preocupaciones terminan:

- duplicadas,
- dispersas,
- o resueltas de forma inconsistente.

Con gateway, muchas de ellas pueden centralizarse en un único lugar.

---

## Qué no debe hacer un gateway

Este punto es importante.

Un gateway no debería transformarse en un “super backend” que concentra toda la lógica del sistema.

No debería convertirse en:

- un reemplazo del dominio,
- un lugar donde viven reglas de negocio complejas,
- un coordinador excesivo de procesos internos,
- un cuello de botella lógico.

Su rol es principalmente:

- recibir,
- filtrar,
- enrutar,
- transformar de forma limitada,
- aplicar políticas transversales.

La lógica principal de negocio debe seguir viviendo en los microservicios correspondientes.

---

## Relación entre Gateway y Service Discovery

Cuando el gateway recibe una request, normalmente no queremos que tenga rutas fijas hacia direcciones hardcodeadas.

Lo ideal es que también pueda trabajar con nombres lógicos de servicio.

Eso lo conecta naturalmente con lo que ya venimos construyendo:

- `discovery-server` registra servicios,
- los servicios se registran en Eureka,
- el gateway descubre sus instancias,
- y enruta tráfico usando esa información dinámica.

De esa forma, el gateway no es una isla separada, sino otra pieza integrada al ecosistema distribuido.

---

## Ejemplo conceptual en NovaMarket

Supongamos que un cliente quiere consultar productos.

Sin gateway, podría llamar directamente a algo como:

```text
http://catalog-service:8081/products
```

Con gateway, la entrada pública puede pasar a ser algo como:

```text
http://api-gateway/api/products
```

Internamente, el gateway se encarga de enrutar esa request hacia `catalog-service`.

Lo mismo para órdenes:

```text
POST /api/orders
```

En lugar de que el cliente conozca el endpoint interno real de `order-service`, el gateway ofrece una entrada más uniforme.

---

## Cómo mejora esto el flujo principal del curso

Recordemos nuestro flujo base:

**consultar catálogo → crear orden → validar stock → registrar orden → publicar evento → notificar**

Para el cliente externo, ese flujo debería sentirse coherente.

Desde afuera, idealmente existe una API ordenada donde:

- los productos se consultan desde una ruta clara,
- las órdenes se crean desde otra ruta clara,
- y toda la entrada al sistema está normalizada.

El gateway aporta justamente esa capa de coherencia.

---

## Diferencia entre comunicación externa e interna

Acá conviene separar dos planos.

### Comunicación externa
Es la que hacen clientes como:

- frontends,
- apps móviles,
- herramientas externas,
- consumidores de la API.

Esa es la comunicación que normalmente entra por el gateway.

### Comunicación interna
Es la que hacen los microservicios entre sí.

Por ejemplo:

- `order-service` llamando a `inventory-service`,
- o un servicio publicando un evento para `notification-service`.

Esa comunicación no necesariamente pasa por el gateway.

Esto es clave:

**el gateway no reemplaza la comunicación interna entre microservicios**.

Su foco principal es ordenar y controlar la entrada externa al sistema.

---

## Qué tipos de tareas suele asumir un gateway

Aunque la implementación concreta depende del proyecto, un gateway suele participar en tareas como estas:

### Routing
Definir a qué servicio se dirige cada request.

### Path rewriting
Transformar rutas externas en rutas internas.

### Header manipulation
Agregar, quitar o modificar headers.

### Authentication entry point
Validar o propagar información de seguridad.

### Logging y tracing inicial
Registrar información útil sobre el ingreso al sistema.

### Policies transversales
Aplicar reglas comunes antes de que la request llegue al servicio de negocio.

---

## Riesgos de no tener un gateway cuando el sistema crece

Si el sistema evoluciona sin una entrada unificada, suelen aparecer varios problemas:

- APIs expuestas de forma inconsistente,
- seguridad repetida en muchos lugares,
- clientes atados a detalles internos,
- rutas difíciles de versionar o reorganizar,
- más complejidad para monitorear el tráfico de entrada,
- mayor fricción al incorporar nuevos consumidores.

En etapas muy pequeñas eso puede pasar desapercibido, pero a medida que la arquitectura madura se vuelve más evidente.

---

## Riesgos de usar gateway sin criterio

Tampoco se trata de poner un gateway y asumir que todo queda resuelto.

Un gateway mal diseñado puede:

- volverse un punto de sobrecarga,
- acumular demasiada lógica,
- introducir rutas confusas,
- esconder errores de manera poco clara,
- o transformarse en un “mini monolito de entrada”.

Por eso conviene entender primero su rol y su límite.

---

## Cómo se integra con lo que viene después

Incorporar el gateway abre la puerta a varios temas muy importantes del curso:

- configuración de rutas,
- filters,
- observabilidad de entrada,
- seguridad con OAuth2 y JWT,
- propagación de token hacia microservicios,
- centralización de comportamientos comunes.

Es decir: el gateway no es una clase aislada. Es una pieza que conecta directamente con varios módulos posteriores.

---

## Cierre

Un **API Gateway** permite ofrecer un punto de entrada único y más ordenado para una arquitectura de microservicios.

Su valor no está solo en enrutar requests, sino en ayudar a:

- ocultar la topología interna,
- reducir acoplamiento con clientes externos,
- centralizar políticas transversales,
- y hacer que el sistema exponga una API más coherente.

En NovaMarket, incorporar el gateway es el paso natural para dejar atrás una arquitectura donde cada servicio se expone por separado y pasar a un sistema con una entrada más profesional y más controlada.

En la próxima clase vamos a dar el paso práctico: empezar a configurar **Spring Cloud Gateway** para que NovaMarket enrute requests hacia sus servicios internos.
