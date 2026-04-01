---
title: "Cómo validar propiedades de configuración y detectar errores temprano"
description: "Entender cómo validar propiedades cargadas con @ConfigurationProperties para que Spring Boot detecte configuraciones inválidas o incompletas antes de que la aplicación empiece a fallar en ejecución."
order: 20
module: "Configuración en Spring Boot"
level: "base"
draft: false
---

En el tema anterior viste que `@ConfigurationProperties` permite agrupar propiedades relacionadas dentro de una clase propia.

Eso ya mejora mucho la organización de la configuración.

Pero aparece una pregunta importante:

> ¿qué pasa si la configuración existe, pero está mal?

Por ejemplo:

- falta una propiedad obligatoria
- una URL viene vacía
- un timeout viene en cero
- un número es negativo
- una cadena tiene un formato que no debería aceptar

Si la aplicación arranca igual y el error aparece recién más adelante, el problema suele ser más molesto de detectar.

Por eso, una práctica muy importante en Spring Boot es **validar la configuración al arrancar**.

La idea es simple:

> si una configuración es inválida, conviene fallar temprano y de forma clara, en lugar de dejar que el error se manifieste después en tiempo de ejecución.

## Por qué validar configuración es tan importante

La configuración forma parte del funcionamiento real de la app.

No es solo “un detalle externo”.

Si la configuración está mal, puede romper:

- integraciones
- seguridad
- acceso a base de datos
- jobs programados
- clientes HTTP
- límites internos
- flags funcionales

El punto es que una aplicación puede tener el código correcto pero igual funcionar mal por una configuración incorrecta.

Por eso, validar configuración no es algo decorativo. Es una forma de volver el sistema más confiable.

## El problema de no validar

Imaginá esta configuración:

```properties
api.cliente.base-url=
api.cliente.timeout=-5
api.cliente.reintentos=-1
```

Y una clase:

```java
@ConfigurationProperties(prefix = "api.cliente")
public class ApiClienteProperties {

    private String baseUrl;
    private int timeout;
    private int reintentos;

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public int getTimeout() {
        return timeout;
    }

    public void setTimeout(int timeout) {
        this.timeout = timeout;
    }

    public int getReintentos() {
        return reintentos;
    }

    public void setReintentos(int reintentos) {
        this.reintentos = reintentos;
    }
}
```

Si no validás nada, la app podría arrancar con esos valores absurdos y el problema aparecer más tarde, quizá cuando intente llamar a un servicio externo o calcular algo con esos números.

Eso vuelve el error:

- más tardío
- más difícil de rastrear
- menos claro para quien lo investiga

## La idea de validar al momento del arranque

Spring Boot permite combinar `@ConfigurationProperties` con validación para revisar que los valores cargados respeten ciertas reglas.

Eso significa que, cuando el framework intenta construir y enlazar esa configuración, también puede verificar cosas como:

- que un texto no venga vacío
- que un número sea positivo
- que una propiedad obligatoria exista
- que un texto tenga formato correcto
- que un tamaño mínimo o máximo se cumpla

Si alguna validación falla, la aplicación puede detener su arranque con un error claro.

Eso es buenísimo, porque evita seguir adelante con una base inestable.

## Qué tipo de validaciones suelen importar

En configuraciones reales, suelen ser muy comunes reglas como estas:

- la URL base no puede venir vacía
- el timeout debe ser mayor que cero
- la cantidad de reintentos no puede ser negativa
- un token no puede estar en blanco
- un porcentaje debe estar dentro de un rango
- un puerto debe ser válido
- una lista no puede venir vacía si es esencial para una integración

Estas restricciones no son lógica de negocio pura, pero sí forman parte de la salud operativa de la aplicación.

## Bean Validation como base conceptual

Spring Boot se apoya en el sistema de validación basado en anotaciones que también aparece en otros contextos, como validación de DTOs.

La idea general es que podés expresar reglas declarativas sobre campos.

Por ejemplo:

- `@NotBlank`
- `@NotNull`
- `@Min`
- `@Max`
- `@Positive`

No hace falta memorizar todavía todas las anotaciones posibles.
Lo importante acá es entender la filosofía:

> la propia clase de configuración puede declarar qué valores considera válidos.

## Un ejemplo simple

Supongamos esta clase:

```java
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "api.cliente")
public class ApiClienteProperties {

    @NotBlank
    private String baseUrl;

    @Min(1)
    private int timeout;

    @Min(0)
    private int reintentos;

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public int getTimeout() {
        return timeout;
    }

    public void setTimeout(int timeout) {
        this.timeout = timeout;
    }

    public int getReintentos() {
        return reintentos;
    }

    public void setReintentos(int reintentos) {
        this.reintentos = reintentos;
    }
}
```

Con esto, ya estás expresando reglas muy claras:

- `baseUrl` no puede venir vacía
- `timeout` debe ser al menos 1
- `reintentos` no puede ser negativo

## Qué falta además de las anotaciones

Para que esa validación se ejecute, además de declarar restricciones, normalmente necesitás indicar que esa clase debe validarse.

Una forma típica es usar `@Validated`.

Por ejemplo:

```java
import org.springframework.validation.annotation.Validated;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Validated
@ConfigurationProperties(prefix = "api.cliente")
public class ApiClienteProperties {
    ...
}
```

La idea general es que Spring Boot:

1. carga las propiedades
2. intenta enlazarlas a la clase
3. valida esas reglas
4. si algo falla, detiene el arranque

## Un ejemplo completo

```java
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "api.cliente")
public class ApiClienteProperties {

    @NotBlank
    private String baseUrl;

    @Min(1)
    private int timeout;

    @Min(0)
    private int reintentos;

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public int getTimeout() {
        return timeout;
    }

    public void setTimeout(int timeout) {
        this.timeout = timeout;
    }

    public int getReintentos() {
        return reintentos;
    }

    public void setReintentos(int reintentos) {
        this.reintentos = reintentos;
    }
}
```

Y estas propiedades:

```properties
api.cliente.base-url=
api.cliente.timeout=0
api.cliente.reintentos=-1
```

Acá la app debería fallar al arrancar porque la configuración no cumple las restricciones declaradas.

## Por qué fallar al arrancar es algo bueno

A veces alguien ve que la app “no inicia” y piensa que eso es peor.

En realidad, en este tipo de casos suele ser mejor.

Porque significa que el sistema detectó temprano una condición inválida y evitó exponerse a un funcionamiento engañoso o inestable.

En otras palabras:

- error temprano → más fácil de detectar
- error tardío → más costoso, más confuso y más riesgoso

## Validación y mantenibilidad

La validación también mejora mucho la mantenibilidad del proyecto.

¿Por qué?

Porque deja documentadas las expectativas de configuración directamente en el código.

Por ejemplo:

```java
@NotBlank
private String apiKey;
```

Eso ya comunica algo importante sin necesidad de leer un documento externo: esa propiedad es obligatoria y no puede venir vacía.

Lo mismo con:

```java
@Min(1)
private int timeout;
```

Queda claro que cero o negativo no son valores aceptables.

## Validación como documentación viva

Este es un punto muy valioso.

Cuando la configuración está validada, la clase no solo transporta datos: también expresa restricciones de forma explícita.

Eso convierte a la clase en una especie de documentación viva del contrato configuracional.

Es mucho mejor que depender solo de comentarios sueltos o de “acuerdos implícitos” del equipo.

## Algunas validaciones típicas

### Texto obligatorio

```java
@NotBlank
private String baseUrl;
```

Sirve para cadenas que no deben venir vacías ni en blanco.

### Valor obligatorio

```java
@NotNull
private Integer maxItems;
```

Sirve cuando querés expresar que el valor debe existir.

### Número mínimo

```java
@Min(1)
private int timeout;
```

Sirve para cantidades que no pueden ser cero o negativas.

### Número máximo

```java
@Max(100)
private int porcentaje;
```

Sirve para rangos acotados.

### Positivo

```java
@Positive
private int poolSize;
```

Sirve para valores que deben ser mayores que cero.

### Positivo o cero

```java
@PositiveOrZero
private int reintentos;
```

Muy útil para configuraciones donde cero sigue siendo válido.

## `@NotNull` y tipos primitivos

Conviene notar una diferencia conceptual importante.

Si usás tipos primitivos como `int` o `boolean`, esos campos no pueden ser `null` en Java, porque tienen valores por defecto.

Entonces, si querés detectar realmente la ausencia de un valor en algunos casos, puede convenir usar wrappers como `Integer`, `Boolean` o `Long`.

Por ejemplo:

```java
@NotNull
private Integer timeout;
```

Eso te permite distinguir mejor entre “valor no informado” y “valor informado en cero”.

No siempre hace falta, pero es importante conocer esta diferencia.

## Validación y configuración obligatoria

Una pregunta muy útil es esta:

> ¿qué propiedades son realmente obligatorias para que la app funcione bien?

Esas suelen ser buenas candidatas para validación estricta.

Por ejemplo:

- URL de integración obligatoria
- credencial indispensable
- bucket requerido
- nombre de cola obligatorio
- directorio base no vacío
- tamaño de lote mayor que cero

En cambio, otras propiedades pueden ser opcionales o tener defaults razonables.

## Defaults y validación pueden convivir

No todo tiene que ser obligatorio.

Podés tener propiedades con valores por defecto lógicos y aun así validar otras.

Por ejemplo:

- `timeout` obligatorio y positivo
- `reintentos` opcional con default razonable
- `logBody` opcional con false

La validación no significa volver toda configuración rígida.
Significa hacer explícito qué casos son aceptables y cuáles no.

## Un ejemplo con varias reglas

```java
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "storage.local")
public class StorageLocalProperties {

    @NotBlank
    private String basePath;

    @Min(1)
    private int maxFileSizeMb;

    @PositiveOrZero
    private int limpiezaCadaHoras;

    public String getBasePath() {
        return basePath;
    }

    public void setBasePath(String basePath) {
        this.basePath = basePath;
    }

    public int getMaxFileSizeMb() {
        return maxFileSizeMb;
    }

    public void setMaxFileSizeMb(int maxFileSizeMb) {
        this.maxFileSizeMb = maxFileSizeMb;
    }

    public int getLimpiezaCadaHoras() {
        return limpiezaCadaHoras;
    }

    public void setLimpiezaCadaHoras(int limpiezaCadaHoras) {
        this.limpiezaCadaHoras = limpiezaCadaHoras;
    }
}
```

Este bloque ya expresa un contrato bastante sano y claro.

## Qué tipo de errores evita esta práctica

Validar propiedades te ayuda a evitar errores como:

- conexiones rotas por URLs vacías
- timeouts inválidos
- límites absurdos
- tamaños negativos
- flags mal interpretados
- arranques aparentemente exitosos con configuración inútil

En general, evita errores de “mala configuración silenciosa”.

## Validación y testing

También ayuda mucho en pruebas.

Si la configuración necesaria para un componente no cumple reglas mínimas, el problema aparece enseguida al construir el contexto, en lugar de quedar oculto hasta una fase posterior del test.

Eso mejora el feedback y vuelve más confiable el entorno de pruebas.

## Validación anidada: una idea para más adelante

Cuando la configuración crece, también pueden aparecer objetos anidados.

Por ejemplo:

- una configuración principal
- dentro de ella, un bloque de auth
- otro bloque de timeouts
- otro bloque de retry

En esos casos, la validación puede extenderse a estructuras internas.

No hace falta profundizar ahora, pero conviene saber que este enfoque no se limita solo a clases planas y simples.

## Validar no es lo mismo que configurar bien por arte de magia

Este punto es importante.

La validación ayuda muchísimo, pero no reemplaza el criterio.

Podrías tener una URL no vacía que igual sea incorrecta conceptualmente.
O un timeout positivo que igual resulte absurdo para el negocio.

Por eso, validar es mejor que no validar, pero sigue siendo necesario pensar bien qué reglas expresan una configuración razonable.

## Error común: no validar nada “porque total después se ve”

Ese enfoque suele salir caro.

Cuando una configuración es importante, dejar que el sistema arranque con valores dudosos suele trasladar el problema a un momento peor.

Validar temprano casi siempre da una mejor experiencia de mantenimiento.

## Error común: validar en la lógica del servicio algo que podría fallar antes

A veces alguien hace esto:

```java
if (timeout <= 0) {
    throw new IllegalArgumentException("Timeout inválido");
}
```

dentro de un servicio.

No siempre está mal, pero si ese valor viene de configuración externa, muchas veces tiene más sentido que el problema se detecte cuando la configuración se carga, no cuando el servicio ya está trabajando.

Eso ordena mejor las responsabilidades.

## Error común: usar defaults para esconder configuraciones faltantes

Como viste antes, los defaults pueden ser útiles.

Pero si una propiedad realmente es obligatoria, ponerle un default “para que no falle” puede ocultar un problema real de despliegue o de setup.

No toda ausencia debe taparse con fallback automático.

## Error común: mezclar validación de configuración con reglas de negocio complejas

La validación configuracional debería centrarse en cosas como:

- obligatoriedad
- formato
- rango
- consistencia estructural básica

No conviene convertir la clase de properties en un lugar para meter lógica de negocio compleja.

Su rol principal sigue siendo representar configuración.

## Un criterio práctico muy sano

Podés pensar así:

- si un valor mal configurado rompe la app o la vuelve incoherente, probablemente convenga validarlo
- si el valor es opcional y tiene un fallback razonable, quizá no haga falta una validación estricta
- si el valor necesita reglas muy elaboradas, quizá haya que revisar el diseño o separar responsabilidades

## Relación con el diseño general

Validar configuración también ayuda a reforzar una idea importante:

> la configuración es una dependencia seria del sistema, no un detalle secundario.

Del mismo modo que cuidás la definición de interfaces, DTOs o entidades, también conviene cuidar el contrato de configuración.

Eso vuelve la aplicación más robusta y menos propensa a comportamientos erráticos.

## Relación con Spring Boot

Este tema encaja de manera muy natural con la filosofía de Spring Boot:

- configuración declarativa
- binding automático
- validación temprana
- feedback rápido al arrancar

Boot no solo quiere que puedas configurar una aplicación fácilmente.
También quiere ayudarte a detectar cuando esa configuración ya no cumple condiciones mínimas razonables.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> validar propiedades de configuración permite que Spring Boot detecte problemas importantes al arrancar, en lugar de dejar que la aplicación falle después de forma más confusa y costosa de diagnosticar.

## Resumen

- La configuración también puede ser inválida aunque el código esté bien.
- `@ConfigurationProperties` se puede combinar con validación.
- Anotaciones como `@NotBlank`, `@NotNull`, `@Min` o `@Positive` ayudan a expresar reglas claras.
- `@Validated` permite activar ese proceso sobre la clase de configuración.
- Fallar al arrancar ante una configuración inválida suele ser algo bueno.
- Validar mejora la mantenibilidad y documenta el contrato configuracional.
- No reemplaza el criterio de diseño, pero sí hace el sistema mucho más robusto.

## Próximo tema

En el próximo tema vas a ver cómo funcionan los perfiles en Spring Boot y cómo permiten cambiar configuración y comportamiento según el entorno, como desarrollo, testing o producción.
