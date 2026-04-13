---
title: "Creando api-gateway con Spring Initializr"
description: "Inicio del bloque de API Gateway en NovaMarket. Generación de api-gateway con Spring Initializr, configuración base y primer arranque del punto de entrada unificado del sistema."
order: 32
module: "Módulo 6 · API Gateway"
level: "intermedio"
draft: false
---

# Creando `api-gateway` con Spring Initializr

Hasta este punto, NovaMarket ya puede:

- exponer catálogo,
- exponer inventario,
- crear órdenes,
- centralizar configuración,
- registrar servicios en Eureka,
- y resolver integraciones por nombre lógico con Feign.

Eso ya es bastante valioso, pero todavía hay una característica importante que no tenemos:

**un punto de entrada único al sistema.**

Hoy, para probar NovaMarket, seguimos entrando directamente a cada servicio por su propio puerto:

- `catalog-service`
- `inventory-service`
- `order-service`

Eso funciona para desarrollo, pero no es el modelo más cómodo ni más realista para una arquitectura distribuida que empieza a crecer.

La pieza que viene a ordenar ese acceso es:

**`api-gateway`**

En esta clase vamos a crearlo desde cero y dejarlo listo como punto de entrada central del sistema.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creado el proyecto `api-gateway`,
- ubicado dentro del monorepo,
- configurado como Spring Cloud Gateway,
- conectado a la infraestructura base del sistema,
- y arrancando correctamente como nuevo componente de entrada.

Todavía no vamos a definir rutas.  
Primero necesitamos tener el gateway creado y operativo.

---

## Estado de partida

Partimos de un monorepo parecido a este:

```txt
novamarket/
  services/
    catalog-service/
    inventory-service/
    order-service/
    config-server/
    discovery-server/
```

Y además:

- `config-server` ya está operativo,
- `discovery-server` ya está operativo,
- y los servicios principales ya funcionan y se registran en Eureka.

Todavía no existe un gateway dentro del sistema.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- generar `api-gateway` con Spring Initializr,
- agregar dependencias apropiadas,
- ubicarlo dentro de `services/`,
- definir su configuración mínima,
- y arrancarlo como componente independiente.

---

## Qué problema resuelve `api-gateway`

Hoy los consumidores del sistema tienen que saber:

- qué servicio expone qué ruta,
- en qué puerto corre cada uno,
- y cómo entrar a cada parte de la arquitectura.

Eso está bien para una etapa inicial, pero si queremos que NovaMarket se acerque más a una arquitectura profesional, conviene que exista un único punto de entrada.

`api-gateway` viene a resolver justamente eso.

En vez de entrar directamente a cada microservicio, más adelante vamos a poder entrar por el gateway, que se encargará de:

- enrutar,
- centralizar acceso,
- aplicar filtros,
- y más adelante participar en seguridad.

---

## Paso 1 · Abrir Spring Initializr

Vamos a crear un nuevo proyecto, esta vez con el rol específico de gateway.

---

## Paso 2 · Configuración recomendada en Initializr

Una configuración razonable para este proyecto es:

### Project
**Maven**

### Language
**Java**

### Group
```txt
com.novamarket
```

### Artifact
```txt
api-gateway
```

### Name
```txt
api-gateway
```

### Packaging
```txt
Jar
```

### Java
La misma versión que ya venís usando en el resto del proyecto.

---

## Paso 3 · Dependencias necesarias

Para este proyecto necesitás como mínimo:

- **Spring Cloud Gateway**
- **Eureka Discovery Client**
- **Config Client** si querés que el gateway también consuma configuración centralizada

Y opcionalmente:

- **Spring Boot DevTools**

La combinación Gateway + Eureka es especialmente importante porque, más adelante, las rutas del gateway van a poder apuntar a servicios por nombre lógico.

---

## Paso 4 · Generar y ubicar el proyecto

Una vez generado, ubicá el proyecto dentro de:

```txt
novamarket/services/
```

El resultado esperado debería verse así:

```txt
novamarket/
  services/
    catalog-service/
    inventory-service/
    order-service/
    config-server/
    discovery-server/
    api-gateway/
```

Con esto, NovaMarket ya suma su punto de entrada central al monorepo.

---

## Paso 5 · Revisar la estructura generada

La estructura base debería ser la habitual:

```txt
api-gateway/
  src/
    main/
      java/
      resources/
    test/
      java/
  pom.xml
  mvnw
  mvnw.cmd
```

Y dentro del paquete principal deberías tener una clase tipo:

```java
@SpringBootApplication
public class ApiGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
```

---

## Paso 6 · Revisar una buena ubicación del paquete base

Una estructura razonable para el paquete raíz del gateway podría ser:

```txt
com.novamarket.gateway
```

O una variante equivalente que mantenga coherencia con el resto del proyecto.

Lo importante es que:

- tenga identidad clara,
- no quede mezclado con paquetes de otros servicios,
- y siga la misma lógica general de NovaMarket.

---

## Paso 7 · Definir una configuración mínima local o centralizada

Como el resto del sistema ya empezó a usar Config Server, una opción razonable es que `api-gateway` también entre desde el inicio en ese mismo esquema.

Podés dejar localmente lo mínimo necesario para que el servicio:

- se identifique,
- y encuentre `config-server`.

Por ejemplo, una base conceptual razonable podría ser:

```yaml
spring:
  application:
    name: api-gateway
  config:
    import: "optional:configserver:http://localhost:8888"
```

Más adelante vamos a definir en `config-repo` su puerto y sus rutas.

Si querés una primera aproximación más simple para esta clase, también podrías dejar un `application.yml` local mínimo con puerto explícito. Pero para mantener coherencia con la arquitectura actual, conviene que el gateway entre ya en configuración centralizada.

---

## Paso 8 · Preparar configuración remota para el gateway

Antes de levantarlo, conviene crear o revisar:

```txt
novamarket/config-repo/api-gateway.yml
```

Una configuración mínima razonable para esta etapa podría ser:

```yaml
spring:
  application:
    name: api-gateway

server:
  port: 8080

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka
```

Todavía no hace falta definir rutas acá.  
Hoy nos alcanza con dejar al gateway listo para arrancar como servicio, registrarse y quedar operativo.

---

## Paso 9 · Levantar primero la infraestructura base

Antes de arrancar `api-gateway`, conviene tener arriba:

- `config-server`
- `discovery-server`

Si el gateway va a consumir configuración centralizada y registrarse en Eureka, esas dos piezas deberían estar disponibles primero.

---

## Paso 10 · Levantar `api-gateway`

Ahora sí, arrancá el gateway.

Queremos verificar que:

- el proyecto compile,
- cargue su configuración,
- arranque en el puerto esperado, por ejemplo `8080`,
- y pueda registrarse en Eureka si ya dejaste esa parte configurada.

---

## Qué deberías observar al arrancar

Si todo está bien, deberías ver:

- arranque normal de Spring Boot,
- inicialización del gateway,
- escucha en el puerto definido,
- y eventualmente registro en Eureka si ya activaste esa parte.

En esta etapa todavía no esperamos que enrute nada útil, porque las rutas las vamos a crear en la próxima clase.

---

## Paso 11 · Verificar si aparece en Eureka

Si `api-gateway` ya tiene integrada la parte de Eureka Client y la configuración remota correcta, conviene abrir:

```txt
http://localhost:8761
```

Y revisar si aparece registrado como algo equivalente a:

- `API-GATEWAY`

Esto no es obligatorio para que el gateway exista, pero sí es muy valioso porque lo deja integrado de entrada a la infraestructura de discovery del sistema.

---

## Qué estamos logrando con esta clase

Esta clase agrega una de las piezas más visibles de la arquitectura.

Ahora NovaMarket ya no tiene solo servicios de negocio e infraestructura interna.  
También tiene un componente pensado explícitamente para:

- concentrar el acceso,
- representar la entrada al sistema,
- y preparar el terreno para ruteo, filtros y seguridad.

Es un salto importante.

---

## Qué todavía no hicimos

Todavía no:

- configuramos rutas,
- probamos acceso al catálogo pasando por el gateway,
- ni centralizamos el ingreso al sistema.

Todo eso viene a continuación.

La meta de hoy es más concreta:

**dejar `api-gateway` creado y operativo.**

---

## Errores comunes en esta etapa

### 1. No agregar la dependencia de Gateway
Entonces el proyecto no cumple el rol esperado.

### 2. No integrar Config Server o Eureka de forma coherente
El gateway puede quedar aislado del resto de la arquitectura.

### 3. Olvidar crear `api-gateway.yml` en `config-repo`
Si estás usando configuración centralizada, esto es clave.

### 4. Elegir un puerto que ya esté ocupado
Conviene reservar un puerto claro, como `8080`, para el gateway.

### 5. Esperar que ya enrute servicios sin haber definido rutas
Eso recién viene en la próxima clase.

---

## Resultado esperado al terminar la clase

Al terminar esta clase debería existir:

```txt
novamarket/services/api-gateway
```

Y el proyecto debería:

- arrancar correctamente,
- cargar su configuración mínima,
- y quedar listo para convertirse en el punto de entrada real de NovaMarket.

---

## Punto de control

Antes de seguir, verificá que:

- `api-gateway` existe dentro de `services/`,
- tiene las dependencias correctas,
- arranca correctamente,
- carga configuración de forma coherente,
- y, si ya lo configuraste, aparece en Eureka.

Si eso está bien, ya podemos pasar a la parte más visible del gateway: las rutas.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a definir rutas desde `api-gateway` hacia los microservicios principales.

Ese será el momento en que NovaMarket empiece a poder usarse entrando por un único punto.

---

## Cierre

En esta clase creamos `api-gateway`, el nuevo punto de entrada de NovaMarket.

Todavía no enruta tráfico real, pero ya quedó preparado e integrado a la infraestructura base del sistema.  
En la próxima clase, esa pieza va a empezar a tener un impacto directo sobre cómo usamos la arquitectura.
