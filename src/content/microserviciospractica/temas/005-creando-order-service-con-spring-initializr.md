---
title: "Creando order-service con Spring Initializr"
description: "Creación del tercer microservicio base de NovaMarket. Generación de order-service con Spring Initializr, configuración inicial, arranque y verificación junto a catalog-service e inventory-service."
order: 5
module: "Módulo 1 · Preparación del proyecto y primeros servicios"
level: "base"
draft: false
---

# Creando `order-service` con Spring Initializr

En esta clase vamos a crear el tercer microservicio base de **NovaMarket**:

**`order-service`**

Este servicio va a ser el corazón del flujo principal del proyecto, porque más adelante se va a encargar de recibir la creación de órdenes, validar stock, registrar la operación y disparar parte del comportamiento distribuido del sistema.

Por ahora, igual que hicimos con los dos servicios anteriores, el foco no está en la lógica de negocio.  
Primero necesitamos dejar el proyecto bien generado, correctamente ubicado dentro del monorepo, configurado de forma mínima y levantando sin errores.

Con esta clase vamos a cerrar la primera tríada base del sistema:

- `catalog-service`
- `inventory-service`
- `order-service`

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creado `order-service`,
- ubicado dentro de `services/`,
- con configuración mínima inicial,
- arrancando correctamente,
- y conviviendo sin conflictos con `catalog-service` e `inventory-service`.

Todavía no vamos a exponer `POST /orders`.  
Esa parte viene después.

---

## Estado de partida

Partimos de un monorepo que ya debería tener esta forma aproximada:

```txt
novamarket/
  services/
    catalog-service/
    inventory-service/
  infrastructure/
  config-repo/
  docs/
  scripts/
```

Y además:

- `catalog-service` debería arrancar correctamente,
- `inventory-service` debería arrancar correctamente,
- y cada uno debería tener un puerto distinto.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- generar `order-service` con Spring Initializr,
- ubicarlo dentro del proyecto,
- revisar su estructura,
- definir nombre de aplicación y puerto,
- arrancarlo por primera vez,
- y verificar que los tres servicios base pueden convivir al mismo tiempo.

---

## Paso 1 · Abrir Spring Initializr

Vamos a repetir el mismo patrón que usamos para los otros servicios.

Esto es bueno, porque en un curso práctico conviene que los primeros pasos sigan una estructura consistente antes de empezar a agregar complejidad.

---

## Paso 2 · Configuración recomendada en Initializr

Una configuración base razonable para este servicio es la siguiente.

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
order-service
```

### Name
```txt
order-service
```

### Packaging
```txt
Jar
```

### Java
La misma versión que ya venís usando en `catalog-service` e `inventory-service`.

La consistencia acá importa bastante.  
No conviene mezclar versiones o criterios entre servicios si no hay una razón clara.

---

## Paso 3 · Dependencias iniciales recomendadas

Para esta primera versión del servicio, conviene mantener el mismo criterio que usamos hasta ahora.

Dependencias recomendadas:

- **Spring Web**
- **Spring Boot DevTools** opcional
- **Validation** opcional

No hace falta meter todavía persistencia, Feign, seguridad o mensajería.  
Esas piezas van a aparecer más adelante cuando el proyecto realmente las necesite.

---

## Paso 4 · Generar y ubicar el proyecto

Una vez generado el proyecto, ubicá la carpeta dentro de:

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
  infrastructure/
  config-repo/
  docs/
  scripts/
```

Con esto ya quedan creados los tres primeros servicios base del sistema.

---

## Paso 5 · Revisar la estructura generada

La estructura inicial debería ser equivalente a la de los otros servicios.

Algo así:

```txt
order-service/
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

Y dentro del paquete principal debería existir una clase tipo:

```java
@SpringBootApplication
public class OrderServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}
```

Este va a ser el punto de entrada del servicio.

---

## Paso 6 · Ajustar configuración mínima

Igual que en los otros servicios, conviene definir ya una base explícita para nombre de aplicación y puerto.

Conceptualmente, algo como esto:

```yaml
spring:
  application:
    name: order-service

server:
  port: 8083
```

El número del puerto puede variar según tu organización, pero lo importante es que:

- sea distinto de los otros dos,
- quede claro desde el principio,
- y más adelante no genere colisiones cuando levantemos todos los servicios.

---

## Paso 7 · Abrir el proyecto en el IDE

En este punto, `order-service` ya debería abrir normalmente como proyecto Maven.

Conviene verificar que:

- el IDE descargue dependencias sin errores,
- no haya imports rotos,
- y la clase principal esté bien detectada como aplicación Spring Boot.

---

## Paso 8 · Primer arranque de `order-service`

Ahora toca levantar el servicio por primera vez.

Podés hacerlo con el wrapper del proyecto:

```bash
./mvnw spring-boot:run
```

O en Windows:

```bash
mvnw.cmd spring-boot:run
```

También podés ejecutarlo desde el IDE si preferís esa modalidad.

---

## Paso 9 · Verificar que el servicio arranca bien

Si todo está correcto, deberías ver en consola:

- arranque normal de Spring Boot,
- el puerto configurado,
- y ausencia de errores de inicialización.

Todavía no esperamos endpoints funcionales del dominio de órdenes.  
En esta etapa alcanza con que el servicio esté vivo.

---

## Paso 10 · Verificar convivencia de los tres servicios

Este paso ya es importante porque empieza a parecerse más al trabajo real con microservicios.

La idea es levantar al mismo tiempo:

- `catalog-service`
- `inventory-service`
- `order-service`

Y confirmar que:

- ninguno tiene conflicto de puertos,
- todos arrancan correctamente,
- y el entorno local tolera esa primera arquitectura mínima.

Una configuración de ejemplo razonable sería:

- `catalog-service` → `8081`
- `inventory-service` → `8082`
- `order-service` → `8083`

Si elegiste otra numeración, no hay problema, siempre que sea clara y consistente.

---

## Verificación mínima recomendada

Podés abrir en el navegador o probar con alguna herramienta HTTP estas rutas:

```txt
http://localhost:8081
http://localhost:8082
http://localhost:8083
```

En esta etapa puede aparecer un `404` porque todavía no definimos endpoints concretos, y eso es completamente normal.

Lo importante es que:

- no falle por conexión rechazada,
- y cada servicio esté efectivamente arriba.

---

## Qué todavía no hicimos

Todavía no implementamos:

- la entidad `Order`,
- la entidad `OrderItem`,
- el endpoint `POST /orders`,
- integración con inventario,
- persistencia,
- seguridad,
- ni eventos.

Pero eso está bien.

Lo que sí queda construido al final de esta clase es una base muy importante:  
los tres primeros microservicios del sistema ya existen y pueden levantarse.

---

## Errores comunes en esta etapa

### 1. Repetir un puerto ya usado
Eso impide el arranque simultáneo.

### 2. Elegir nombres inconsistentes
Más adelante esto complica configuración, discovery y observabilidad.

### 3. Ubicar el servicio fuera de `services/`
Eso rompe la organización del monorepo.

### 4. Probar solo el servicio nuevo y no la convivencia con los otros
Conviene detectar cuanto antes conflictos simples de entorno.

### 5. Adelantarse con lógica innecesaria
Todavía no toca meter modelos, controladores o integraciones.  
Primero conviene dejar el servicio base sólido.

---

## Resultado esperado al terminar la clase

Al terminar esta clase deberías tener algo así:

```txt
novamarket/
  services/
    catalog-service/
    inventory-service/
    order-service/
```

Y deberías poder levantar los tres servicios a la vez.

Eso deja lista la base operativa mínima de NovaMarket.

---

## Punto de control

Antes de seguir, verificá que:

- `order-service` existe dentro de `services/`,
- el proyecto abre bien en el IDE,
- arranca sin errores,
- usa un puerto distinto al de los otros dos servicios,
- y los tres servicios pueden coexistir al mismo tiempo.

Si eso está bien, ya estamos listos para estandarizar su configuración base.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a hacer algo muy importante:

**alinear la configuración mínima de los tres servicios**

Vamos a revisar nombres, puertos y criterios comunes para dejar una base homogénea antes de empezar a construir el flujo funcional real.

---

## Cierre

En esta clase creamos `order-service`, el tercer microservicio base del proyecto.

Con esto, NovaMarket ya dejó de ser un workspace vacío y pasó a ser una arquitectura mínima con tres servicios Spring Boot reales, organizados dentro del monorepo y listos para empezar a recibir lógica de negocio.
