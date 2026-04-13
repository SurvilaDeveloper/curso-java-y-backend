---
title: "Creando inventory-service con Spring Initializr"
description: "Creación del segundo microservicio base de NovaMarket. Generación de inventory-service con Spring Initializr, configuración mínima y verificación de arranque."
order: 4
module: "Módulo 1 · Preparación del proyecto y primeros servicios"
level: "base"
draft: false
---

# Creando `inventory-service` con Spring Initializr

En esta clase vamos a crear el segundo microservicio real de **NovaMarket**:

**`inventory-service`**

Este servicio va a encargarse de administrar disponibilidad o stock.  
Más adelante será clave para validar si una orden puede crearse o no.

Por ahora, igual que pasó con `catalog-service`, el objetivo no es implementar todavía toda la lógica de inventario.  
Primero necesitamos dejar el servicio correctamente generado, ubicado dentro del proyecto y funcionando como base de Spring Boot.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creado el proyecto `inventory-service`,
- ubicado dentro del monorepo,
- con configuración mínima inicial,
- y arrancando correctamente.

Además, ya deberíamos tener dos servicios reales dentro de NovaMarket:

- `catalog-service`
- `inventory-service`

---

## Estado de partida

Venimos de la clase anterior, así que ya debería existir algo parecido a esto:

```txt
novamarket/
  services/
    catalog-service/
  infrastructure/
  config-repo/
  docs/
  scripts/
```

Y `catalog-service` debería arrancar sin problemas.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- generar `inventory-service` con Spring Initializr,
- ubicarlo dentro de `services/`,
- revisar su estructura,
- configurar nombre y puerto,
- arrancarlo por primera vez,
- y verificar que convive bien con `catalog-service`.

---

## Paso 1 · Abrir Spring Initializr

Vamos a repetir el mismo patrón que usamos en la clase anterior.

Lo importante es mantener consistencia entre servicios, porque más adelante eso va a simplificar bastante la integración.

---

## Paso 2 · Configuración recomendada en Initializr

Para `inventory-service`, una configuración base razonable es esta:

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
inventory-service
```

### Name
```txt
inventory-service
```

### Packaging
```txt
Jar
```

### Java
La misma versión que estés usando en el resto del curso.

---

## Paso 3 · Dependencias iniciales recomendadas

Para esta primera etapa, conviene mantener el mismo criterio que en `catalog-service`.

Dependencias sugeridas:

- **Spring Web**
- **Spring Boot DevTools** opcional
- **Validation** opcional

No hace falta meter todavía persistencia ni integración avanzada si todavía no la vamos a usar en esta clase.

---

## Paso 4 · Generar y ubicar el proyecto

Una vez generado el proyecto, colocalo dentro de:

```txt
novamarket/services/
```

El resultado debería verse así:

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

Ese detalle importa porque queremos que todos los microservicios del curso compartan la misma lógica de organización.

---

## Paso 5 · Revisar la estructura inicial

La estructura base de `inventory-service` debería ser equivalente a la del servicio anterior.

Algo así:

```txt
inventory-service/
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

Y dentro del paquete principal debería existir una clase parecida a:

```java
@SpringBootApplication
public class InventoryServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(InventoryServiceApplication.class, args);
    }
}
```

---

## Paso 6 · Ajustar configuración mínima

Ahora conviene dejar una configuración inicial clara también para este servicio.

Igual que con `catalog-service`, una base razonable sería declarar:

- nombre de aplicación,
- puerto.

Por ejemplo, conceptualmente:

```yaml
spring:
  application:
    name: inventory-service

server:
  port: 8082
```

El número exacto del puerto puede variar según tu organización, pero lo importante es que:

- no choque con `catalog-service`,
- sea explícito,
- y quede bien identificado desde el inicio.

---

## Paso 7 · Abrir o importar el proyecto en el IDE

En este punto ya deberías poder abrir `inventory-service` como proyecto Maven sin problema.

Si estás trabajando con la raíz del monorepo, también conviene verificar que la nueva carpeta se vea correctamente dentro del workspace general.

---

## Paso 8 · Primer arranque de `inventory-service`

Ahora toca levantar este nuevo servicio.

Podés hacerlo igual que el anterior:

```bash
./mvnw spring-boot:run
```

O en Windows:

```bash
mvnw.cmd spring-boot:run
```

También podés correr la clase principal desde el IDE.

---

## Paso 9 · Verificar que el servicio arranca bien

Si todo está correcto, en consola deberías ver:

- arranque normal de Spring Boot,
- el puerto configurado,
- y ausencia de errores de inicialización.

En esta etapa todavía no esperamos endpoints funcionales de inventario.  
Solo queremos comprobar que el servicio está vivo.

---

## Paso 10 · Verificar convivencia con `catalog-service`

Este paso es importante.

No alcanza con que `inventory-service` arranque solo.  
Queremos empezar a verificar que NovaMarket puede tener varios servicios levantados al mismo tiempo.

Por eso conviene probar esto:

1. levantar `catalog-service`,
2. levantar `inventory-service`,
3. confirmar que ambos arrancan sin conflicto,
4. verificar que cada uno escucha en su propio puerto.

Por ejemplo, si elegiste:

- `catalog-service` en `8081`
- `inventory-service` en `8082`

entonces ambas aplicaciones deberían convivir sin problemas.

---

## Verificación mínima recomendada

Podés validar que el servicio está levantado probando su puerto.

Por ejemplo:

```txt
http://localhost:8082
```

Todavía puede devolver 404 si no existe ninguna ruta, y eso es perfectamente aceptable en esta etapa.

Lo importante es que no falle por conexión rechazada y que la aplicación esté efectivamente arriba.

---

## Qué todavía no hicimos

Todavía no implementamos:

- el modelo de inventario,
- endpoints de stock,
- integración con órdenes,
- persistencia,
- ni lógica de validación.

Todo eso viene más adelante.

El foco de hoy es dejar creado y funcionando el segundo microservicio base del proyecto.

---

## Diferencia importante respecto de la clase anterior

Aunque esta clase repite bastante el patrón de `catalog-service`, tiene una diferencia práctica importante:

ya no estamos probando un servicio aislado, sino una arquitectura mínima con más de un proceso levantado.

Eso significa que empezamos a entrar en una lógica más propia de microservicios:

- puertos distintos,
- arranques separados,
- verificación de convivencia,
- y organización de varios módulos dentro del mismo sistema.

---

## Errores comunes en esta etapa

### 1. Reutilizar el mismo puerto del servicio anterior
Eso va a impedir que ambos servicios levanten al mismo tiempo.

### 2. Cambiar nombres sin seguir la convención
Más adelante puede traer problemas de consistencia.

### 3. No verificar el arranque simultáneo
Es importante detectar cuanto antes conflictos simples de entorno.

### 4. Ubicar el servicio fuera de `services/`
Eso rompe la estructura del monorepo.

### 5. Pensar que por no tener endpoints todavía el servicio “no sirve”
En esta etapa el valor está en dejar la base correctamente instalada y verificable.

---

## Resultado esperado al terminar la clase

Al terminar esta clase deberías tener algo así:

```txt
novamarket/
  services/
    catalog-service/
    inventory-service/
```

Y deberías poder levantar ambos servicios sin conflicto.

Eso ya deja a NovaMarket con dos componentes reales funcionando al mismo tiempo.

---

## Punto de control

Antes de avanzar, verificá que:

- `inventory-service` existe dentro de `services/`,
- el proyecto abre bien,
- el servicio arranca sin errores,
- usa un puerto distinto al de `catalog-service`,
- y ambos servicios pueden levantarse al mismo tiempo.

Si eso está bien, ya estamos listos para crear el tercer servicio base.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a crear:

**`order-service`**

Ese servicio va a ser el centro del flujo principal de NovaMarket y, con él, ya vamos a tener los tres primeros servicios base del proyecto.

---

## Cierre

En esta clase creamos `inventory-service`, el segundo microservicio real del curso práctico.

Aunque todavía no tenga lógica de stock implementada, ya quedó correctamente generado, organizado dentro del monorepo y verificado en ejecución.

Con esto, NovaMarket empieza a pasar de “proyecto preparado” a “arquitectura mínima en construcción”.
