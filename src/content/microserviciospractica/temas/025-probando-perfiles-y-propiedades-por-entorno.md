---
title: "Probando perfiles y propiedades por entorno"
description: "Primer trabajo práctico con perfiles en la configuración centralizada de NovaMarket. Organización de archivos por entorno, verificación de propiedades y validación del comportamiento con perfiles activos."
order: 25
module: "Módulo 4 · Configuración centralizada"
level: "intermedio"
draft: false
---

# Probando perfiles y propiedades por entorno

A esta altura, NovaMarket ya tiene una base bastante valiosa de configuración centralizada:

- `config-server` está operativo,
- `config-repo` existe,
- y los tres servicios principales ya consumen configuración remota.

Pero todavía nos falta una parte muy importante para que esta infraestructura tenga un valor más realista:

**trabajar con perfiles y propiedades por entorno.**

Porque una cosa es tener configuración centralizada.  
Y otra bastante más útil es poder cambiar el comportamiento o los valores según el entorno activo.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- una organización básica de perfiles dentro de `config-repo`,
- al menos un entorno diferenciado para probar,
- clientes capaces de resolver propiedades según el perfil activo,
- y validado el comportamiento del sistema al cambiar de perfil.

No vamos a construir todavía un esquema extremadamente sofisticado.  
Queremos una base clara, útil y fácil de seguir.

---

## Estado de partida

En este punto del curso:

- `config-server` ya está sirviendo configuración,
- `catalog-service`, `inventory-service` y `order-service` ya la consumen,
- y en `config-repo` tenemos archivos como:
  - `application.yml`
  - `catalog-service.yml`
  - `inventory-service.yml`
  - `order-service.yml`

Hasta ahora, todos esos archivos responden al perfil por defecto.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- introducir el concepto práctico de perfil dentro de `config-repo`,
- crear archivos específicos por entorno,
- activar un perfil en al menos un servicio,
- y comprobar que el valor resuelto cambia según el entorno activo.

---

## Qué problema queremos resolver

Hasta ahora, si cambiamos una propiedad en `catalog-service.yml`, ese cambio impacta siempre que carguemos configuración para ese servicio.

Pero en sistemas reales suele ser muy útil poder decir:

- en desarrollo quiero un valor,
- en otro entorno quiero otro,
- y no quiero editar el mismo archivo base cada vez.

Ahí es donde los perfiles se vuelven valiosos.

---

## Cómo se expresan los perfiles en `config-repo`

En Config Server, una forma muy común de trabajar con perfiles es usar archivos adicionales con el sufijo del perfil.

Por ejemplo:

- `catalog-service.yml`
- `catalog-service-dev.yml`

O también:

- `inventory-service.yml`
- `inventory-service-dev.yml`

La lógica es sencilla:

- el archivo base contiene configuración general,
- y el archivo del perfil agrega o sobrescribe valores cuando ese perfil está activo.

---

## Paso 1 · Crear un archivo de perfil para `catalog-service`

Vamos a empezar por un solo servicio para que el mecanismo quede claro.

Creá:

```txt
novamarket/config-repo/catalog-service-dev.yml
```

Una versión simple y útil para esta etapa podría ser:

```yaml
catalog:
  profile-message: "catalog-service corriendo con perfil dev"
```

Este tipo de propiedad es muy buena para probar porque:

- no rompe comportamiento importante,
- y deja muy visible si realmente estamos resolviendo el perfil correcto.

---

## Paso 2 · Mantener una propiedad equivalente en el archivo base

Ahora conviene agregar en el archivo base:

```txt
novamarket/config-repo/catalog-service.yml
```

una propiedad equivalente, pero con otro valor. Por ejemplo:

```yaml
catalog:
  profile-message: "catalog-service corriendo con perfil default"
```

Con esto ya tenemos una comparación muy clara:

- si carga el perfil por defecto, el mensaje será uno,
- si carga `dev`, el mensaje será otro.

Eso hace muy fácil verificar el comportamiento.

---

## Paso 3 · Activar el perfil en `catalog-service`

Ahora necesitamos indicarle a `catalog-service` que use el perfil `dev`.

En esta etapa, como el servicio ya consume configuración centralizada, una forma razonable es definir localmente el perfil activo.

Por ejemplo, en el archivo local mínimo del servicio, podrías sumar:

```yaml
spring:
  application:
    name: catalog-service
  config:
    import: "optional:configserver:http://localhost:8888"
  profiles:
    active: dev
```

Con esto, el cliente debería pedir al servidor configuración para:

- aplicación `catalog-service`
- perfil `dev`

---

## Paso 4 · Exponer temporalmente la propiedad para verificarla

Para que la prueba sea visible, conviene exponer temporalmente esa propiedad vía endpoint o mediante log.

Una opción simple para esta etapa es inyectarla en un controlador de prueba dentro de `catalog-service`.

Por ejemplo, podrías agregar temporalmente un endpoint como:

```java
@GetMapping("/profile-message")
public String profileMessage() {
    return profileMessage;
}
```

inyectando la propiedad con `@Value("${catalog.profile-message}")`.

No hace falta que este endpoint quede para siempre en el proyecto si no querés.  
En esta clase sirve como herramienta de verificación muy útil.

---

## Paso 5 · Levantar `config-server`

Antes de arrancar el cliente, levantá `config-server`.

Conviene verificar también que el servidor resuelva el perfil correctamente.

Podés probar:

```txt
http://localhost:8888/catalog-service/dev
```

Ahí deberías ver un JSON donde aparezca la propiedad del perfil `dev`.

Esta es una excelente verificación intermedia antes de arrancar el servicio cliente.

---

## Paso 6 · Levantar `catalog-service`

Ahora sí levantá `catalog-service` con el perfil `dev` activo.

Queremos verificar que:

- arranca correctamente,
- consulta a `config-server`,
- y resuelve la configuración del perfil adecuado.

En los logs ya puede aparecer alguna señal útil, pero lo ideal es confirmarlo mediante un comportamiento observable.

---

## Paso 7 · Verificar el valor del perfil activo

Ahora probá el endpoint que expone temporalmente la propiedad.

Por ejemplo:

```bash
curl http://localhost:8081/profile-message
```

La respuesta esperada debería ser algo como:

```txt
catalog-service corriendo con perfil dev
```

Si eso ocurre, entonces la resolución por perfil está funcionando correctamente.

---

## Paso 8 · Probar el comportamiento sin perfil `dev`

Si querés hacer una verificación más completa, podés sacar temporalmente el perfil activo o cambiarlo, reiniciar el servicio y volver a probar.

En ese caso, lo esperable sería obtener el valor del archivo base:

```txt
catalog-service corriendo con perfil default
```

Esto ayuda muchísimo a entender que:

- no solo tenemos configuración centralizada,
- sino que además ya podemos variarla por entorno.

---

## Paso 9 · Extender mentalmente el mismo patrón al resto de servicios

En esta clase no hace falta crear perfiles especiales para todos los servicios al mismo tiempo.

Lo importante es entender y validar el mecanismo.

Después de esta prueba, el mismo patrón puede aplicarse sin problema a:

- `inventory-service`
- `order-service`
- y más adelante al resto del sistema

con archivos como:

- `inventory-service-dev.yml`
- `order-service-dev.yml`

---

## Qué estamos logrando con esta clase

Esta clase agrega algo muy importante a NovaMarket:

la configuración centralizada deja de ser solo una centralización “plana” y pasa a tener una primera noción de **entorno**.

Eso nos permite empezar a pensar el sistema de una forma mucho más flexible y más cercana a una arquitectura profesional.

---

## Qué todavía no estamos haciendo

Todavía no estamos:

- manejando múltiples perfiles complejos por cada servicio,
- trabajando con refresh dinámico,
- conectando el repositorio a Git,
- ni armando una estrategia completa de entornos productivos.

Todo eso puede venir después.

La meta de hoy es mucho más concreta:

**probar y entender el mecanismo de perfiles sobre Config Server en NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Crear mal el nombre del archivo de perfil
Debe seguir el patrón correcto, por ejemplo `catalog-service-dev.yml`.

### 2. No activar realmente el perfil en el cliente
Entonces el servicio sigue cargando el archivo base y parece que no funciona.

### 3. No verificar primero con la URL del Config Server
Esa verificación intermedia ahorra bastante tiempo.

### 4. Elegir una propiedad difícil de observar
Conviene usar algo bien visible, como un mensaje.

### 5. Cambiar demasiadas cosas al mismo tiempo
Para esta clase, menos es más.

---

## Resultado esperado al terminar la clase

Al terminar esta clase deberías haber comprobado que:

- Config Server puede resolver archivos por perfil,
- un cliente puede activar un perfil específico,
- y las propiedades efectivamente cambian según el entorno activo.

Eso le da a NovaMarket una base de configuración bastante más flexible.

---

## Punto de control

Antes de seguir, verificá que:

- existe un archivo como `catalog-service-dev.yml`,
- el cliente activa correctamente el perfil `dev`,
- `config-server` responde para `catalog-service/dev`,
- y el valor observable cambia respecto del perfil por defecto.

Si eso está bien, ya podemos pasar al siguiente gran bloque del curso práctico.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a empezar con **Service Discovery**, creando `discovery-server`.

Eso va a marcar otro salto importante en la arquitectura de NovaMarket.

---

## Cierre

En esta clase probamos perfiles y propiedades por entorno sobre la infraestructura de configuración centralizada de NovaMarket.

Con eso, el proyecto ya no solo centraliza propiedades: también puede diferenciarlas según el contexto de ejecución.

Ese es un paso muy útil y muy realista para seguir haciendo crecer la arquitectura con criterio.
