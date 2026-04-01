---
title: "Cómo agrupar propiedades con @ConfigurationProperties y por qué suele escalar mejor"
description: "Entender cómo funciona @ConfigurationProperties, cómo permite agrupar propiedades relacionadas y por qué suele ser una opción más mantenible que @Value cuando la configuración crece."
order: 19
module: "Configuración en Spring Boot"
level: "base"
draft: false
---

En el tema anterior viste que `@Value` es una forma muy directa de leer propiedades.

Sirve muy bien cuando necesitás uno o dos valores aislados, pero cuando la configuración empieza a crecer aparece una necesidad nueva:

- varias propiedades relacionadas entre sí
- un prefijo común
- una misma idea de configuración
- necesidad de más claridad y menos dispersión

Ahí es donde aparece una herramienta muy importante de Spring Boot:

`@ConfigurationProperties`

La idea general es sencilla:

> en lugar de leer propiedades sueltas una por una, podés agruparlas dentro de un objeto que represente una configuración completa.

Esto hace que la configuración sea más expresiva, más ordenada y más mantenible.

## El problema que intenta resolver

Imaginá este conjunto de propiedades:

```properties
api.cliente.base-url=https://api.ejemplo.com
api.cliente.timeout=5000
api.cliente.reintentos=3
api.cliente.log-body=true
```

Con `@Value`, podrías hacer algo así:

```java
@Component
public class ClienteApiService {

    @Value("${api.cliente.base-url}")
    private String baseUrl;

    @Value("${api.cliente.timeout}")
    private int timeout;

    @Value("${api.cliente.reintentos}")
    private int reintentos;

    @Value("${api.cliente.log-body}")
    private boolean logBody;
}
```

Eso funciona, pero ya se empieza a ver una limitación clara:

- muchas claves repetidas
- configuración repartida dentro de una clase que tal vez tiene otra responsabilidad
- poca separación entre lógica y parámetros configurables
- menor claridad sobre qué bloque de propiedades forman una unidad

`@ConfigurationProperties` aparece para representar mejor ese tipo de casos.

## La idea central de `@ConfigurationProperties`

Con esta herramienta, podés decirle a Spring Boot algo como esto:

> “todas las propiedades que empiecen con este prefijo quiero que se agrupen en este objeto”.

Por ejemplo:

```properties
api.cliente.base-url=https://api.ejemplo.com
api.cliente.timeout=5000
api.cliente.reintentos=3
api.cliente.log-body=true
```

y luego:

```java
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "api.cliente")
public class ApiClienteProperties {

    private String baseUrl;
    private int timeout;
    private int reintentos;
    private boolean logBody;

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

    public boolean isLogBody() {
        return logBody;
    }

    public void setLogBody(boolean logBody) {
        this.logBody = logBody;
    }
}
```

En este caso, Spring Boot puede tomar todas esas propiedades y cargarlas dentro del objeto `ApiClienteProperties`.

## Cómo pensar esta clase

Es muy importante entender que esta clase no representa lógica de negocio.

Representa **configuración agrupada**.

Dicho de otro modo:

- no es un servicio
- no es un controlador
- no es un repositorio
- no es una entidad

Es una clase cuyo trabajo es actuar como contenedor tipado de propiedades relacionadas.

## Qué ventaja conceptual tiene esto

Con `@Value`, las propiedades se leen como piezas sueltas.

Con `@ConfigurationProperties`, las propiedades pasan a formar un bloque coherente.

Eso trae varias ventajas:

- más orden
- menos repetición
- mejor legibilidad
- mejor mantenibilidad
- mejor separación entre configuración y lógica

En lugar de pensar “esta clase necesita cuatro strings y tres enteros”, empezás a pensar “esta clase depende de una configuración llamada `ApiClienteProperties`”.

Eso suele ser mucho más claro.

## Un ejemplo de uso

Supongamos esta clase de servicio:

```java
import org.springframework.stereotype.Service;

@Service
public class ClienteApiService {

    private final ApiClienteProperties properties;

    public ClienteApiService(ApiClienteProperties properties) {
        this.properties = properties;
    }

    public void mostrarConfiguracion() {
        System.out.println(properties.getBaseUrl());
        System.out.println(properties.getTimeout());
    }
}
```

Esto ya tiene otra calidad de diseño.

En vez de mezclar inyección de muchas propiedades simples, el servicio recibe un objeto que representa toda la configuración que necesita.

## Qué significa prefix

El atributo `prefix` define desde qué punto de la jerarquía de propiedades Spring debe empezar a mapear.

```java
@ConfigurationProperties(prefix = "api.cliente")
```

Eso significa que Spring busca propiedades que empiecen con:

- `api.cliente.base-url`
- `api.cliente.timeout`
- `api.cliente.reintentos`
- `api.cliente.log-body`

y las asocia con los campos correspondientes de la clase.

## Relación entre nombres de propiedades y campos

Spring Boot puede mapear propiedades con convenciones bastante cómodas.

Por ejemplo:

```properties
api.cliente.base-url=https://api.ejemplo.com
```

puede mapearse al campo:

```java
private String baseUrl;
```

Eso ayuda mucho, porque no necesitás que el nombre sea exactamente idéntico carácter por carácter. Spring Boot entiende ciertas conversiones habituales entre formatos de nombres.

## Un ejemplo más realista

Archivo de configuración:

```yaml
integracion:
  pagos:
    base-url: https://pagos.ejemplo.com
    timeout: 4000
    api-key: demo-key
    sandbox: true
```

Clase:

```java
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "integracion.pagos")
public class PagosProperties {

    private String baseUrl;
    private int timeout;
    private String apiKey;
    private boolean sandbox;

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

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public boolean isSandbox() {
        return sandbox;
    }

    public void setSandbox(boolean sandbox) {
        this.sandbox = sandbox;
    }
}
```

Esto deja mucho más clara la intención del bloque de propiedades.

## Cómo se registra esta clase

Acá aparece un punto importante: no alcanza solo con escribir la clase.

Spring necesita conocerla como bean para poder usarla.

Hay varias formas de hacerlo según el estilo del proyecto.

Una forma muy usada es habilitar el escaneo de clases de configuración de propiedades.

Por ejemplo, en la clase principal de la aplicación:

```java
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@ConfigurationPropertiesScan
public class MiAplicacion {
}
```

Con esto, Spring Boot puede detectar automáticamente clases anotadas con `@ConfigurationProperties`.

## Otra forma común de registrarla

También puede registrarse explícitamente usando anotaciones de habilitación.

Por ejemplo, conceptualmente:

```java
@EnableConfigurationProperties(ApiClienteProperties.class)
```

No hace falta profundizar ahora en todas las variantes posibles, pero sí quedarte con esta idea:

> la clase de propiedades debe estar registrada para que Spring Boot pueda construirla y enlazarle los valores.

## Por qué suele escalar mejor que `@Value`

Esta es la pregunta clave del tema.

`@ConfigurationProperties` suele escalar mejor porque:

- agrupa propiedades bajo una misma clase
- reduce strings repetidos
- vuelve más claro qué configuración pertenece a cada módulo
- mejora la mantenibilidad
- hace que los servicios reciban un objeto de configuración en lugar de muchos valores sueltos
- modela mejor configuraciones medianas o grandes

En otras palabras: deja de haber propiedades desperdigadas y aparece una estructura más intencional.

## Comparación mental rápida

### Con `@Value`
Pensás así:

- necesito este valor
- y este otro
- y este otro más

### Con `@ConfigurationProperties`
Pensás así:

- este componente depende de esta configuración agrupada

Ese cambio de mentalidad mejora mucho el diseño a medida que el proyecto crece.

## Un buen criterio práctico

Podés pensar así:

- si necesitás una propiedad suelta, `@Value` puede alcanzar
- si tenés un grupo coherente de propiedades, `@ConfigurationProperties` suele ser mejor

No porque sea “más moderno” o “más profesional” en abstracto, sino porque modela mejor el problema.

## Un ejemplo comparativo

### Opción con `@Value`

```java
@Service
public class ReporteService {

    @Value("${reporte.base-url}")
    private String baseUrl;

    @Value("${reporte.timeout}")
    private int timeout;

    @Value("${reporte.max-items}")
    private int maxItems;
}
```

### Opción con `@ConfigurationProperties`

```java
@ConfigurationProperties(prefix = "reporte")
public class ReporteProperties {

    private String baseUrl;
    private int timeout;
    private int maxItems;

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

    public int getMaxItems() {
        return maxItems;
    }

    public void setMaxItems(int maxItems) {
        this.maxItems = maxItems;
    }
}
```

```java
@Service
public class ReporteService {

    private final ReporteProperties properties;

    public ReporteService(ReporteProperties properties) {
        this.properties = properties;
    }
}
```

La segunda opción suele dar una imagen mucho más clara del sistema.

## También mejora la separación de responsabilidades

Con `@ConfigurationProperties`, un servicio deja de ser el lugar donde “se sabe todo sobre las properties”.

En cambio:

- la clase de configuración representa las propiedades
- el servicio se enfoca en usar esa configuración

Eso mejora la organización del código.

## Útil para módulos e integraciones

Este enfoque resulta especialmente útil para:

- clientes HTTP
- integraciones externas
- límites y timeouts
- features flags
- parámetros de negocio configurables
- configuración de storage
- configuración de email
- configuración de seguridad
- configuración de jobs o schedulers

Casi cualquier bloque de configuración con identidad propia puede beneficiarse de este patrón.

## Tipado más claro

Otro punto fuerte es que pasás a trabajar con un objeto tipado en lugar de muchas expresiones dispersas.

Por ejemplo:

```java
properties.getTimeout()
properties.getBaseUrl()
properties.isSandbox()
```

Eso suele ser más legible y más robusto que tener muchos `@Value` repartidos.

## Menos acoplamiento a strings

Con `@Value`, las claves viven como strings literales dentro de cada clase.

Con `@ConfigurationProperties`, ese acoplamiento se reduce porque el prefijo se concentra en un solo lugar y luego trabajás con campos del objeto.

Eso no elimina por completo la necesidad de que la configuración esté bien escrita, pero sí mejora bastante la estructura.

## También hace más fácil entender el dominio de configuración

Imaginá que alguien nuevo entra al proyecto.

Si encuentra una clase así:

```java
@ConfigurationProperties(prefix = "integracion.erp")
public class ErpProperties {
    ...
}
```

entiende rápido que existe un bloque de configuración asociado a la integración ERP.

Eso suele ser mucho más expresivo que descubrir diez `@Value` desperdigados por varias clases.

## ¿Reemplaza siempre a `@Value`?

No.

Ese es un punto importante.

`@ConfigurationProperties` no viene a prohibir `@Value`.

Ambos tienen lugar.

`@Value` sigue siendo muy útil para casos simples.
`@ConfigurationProperties` entra en escena cuando la configuración merece modelarse como un objeto propio.

La clave no es elegir un “ganador universal”, sino usar cada herramienta donde mejor encaje.

## Qué pasa con propiedades opcionales

Una clase de configuración puede tener propiedades que el sistema resuelva si existen o que tomen ciertos valores según cómo esté modelado el objeto.

Más adelante vas a profundizar en validación y defaults, pero por ahora lo importante es entender que esta herramienta no solo agrupa: también abre la puerta a un tratamiento más serio de la configuración.

## Validación: una pista de lo que viene

Uno de los puntos fuertes de `@ConfigurationProperties` es que combina muy bien con validación.

Eso significa que más adelante vas a poder expresar cosas como:

- este campo no puede faltar
- este valor debe ser positivo
- este texto no puede estar vacío

Ese tipo de validación no es el centro de este tema todavía, pero ya conviene saber que es una de las razones por las que este enfoque resulta tan potente en proyectos reales.

## Un ejemplo con más orden semántico

Propiedades:

```properties
storage.s3.bucket=mi-bucket
storage.s3.region=us-east-1
storage.s3.endpoint=https://s3.amazonaws.com
storage.s3.enabled=true
```

Clase:

```java
@ConfigurationProperties(prefix = "storage.s3")
public class S3Properties {

    private String bucket;
    private String region;
    private String endpoint;
    private boolean enabled;

    public String getBucket() {
        return bucket;
    }

    public void setBucket(String bucket) {
        this.bucket = bucket;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
```

Al ver esto, la configuración deja de ser una serie de piezas sueltas y pasa a tener forma concreta.

## Error común: querer usar `@ConfigurationProperties` para una sola propiedad trivial

Podrías hacerlo, pero muchas veces sería innecesario.

Si solo necesitás una propiedad simple, montar una clase entera de configuración puede ser demasiado.

Por eso sigue siendo importante evaluar el tamaño real del problema.

## Error común: pensar que esta clase debe tener lógica de negocio

No es la idea.

Una clase de propiedades debería representar configuración, no convertirse en un servicio disfrazado.

Lo sano es que su responsabilidad principal sea:

- recibir valores
- exponerlos
- eventualmente validar su forma

No decidir lógica de negocio compleja.

## Error común: olvidar registrarla

Otro problema muy común es escribir la clase con `@ConfigurationProperties` pero no hacer que Spring Boot la registre.

En ese caso, la clase existe en el código pero el framework no la gestiona como corresponde.

Por eso conviene tener muy presente que este mecanismo necesita estar habilitado correctamente.

## Error común: seguir usando veinte `@Value` aunque el problema ya creció

A veces uno arranca con `@Value` y todo va bien.

Pero si la configuración crece y aun así se insiste en seguir agregando más y más propiedades sueltas, el diseño empieza a volverse ruidoso.

Detectar ese momento y pasar a una estructura agrupada suele ser una mejora importante.

## Una regla mental muy útil

Podés resumirlo así:

- **configuración pequeña y aislada** → `@Value`
- **configuración agrupada y con identidad propia** → `@ConfigurationProperties`

Esta regla no cubre absolutamente todos los casos, pero te da una muy buena base para decidir.

## Relación con Spring Boot

Este enfoque encaja muy bien con la filosofía de Spring Boot porque Boot está muy orientado a configuración declarativa, propiedades por prefijo y componentes que se adaptan según el entorno.

De hecho, gran parte de la configuración seria dentro del ecosistema Spring Boot se apoya en ideas de este estilo.

Entender bien `@ConfigurationProperties` te acerca bastante a una forma más madura de trabajar con configuración en aplicaciones reales.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> `@ConfigurationProperties` permite representar grupos de propiedades como objetos tipados y coherentes, lo que suele volver la configuración más clara, mantenible y escalable que una colección de `@Value` dispersos.

## Resumen

- `@ConfigurationProperties` sirve para agrupar propiedades relacionadas.
- Usa un prefijo para mapear bloques de configuración a una clase.
- Suele escalar mejor que `@Value` cuando hay varias propiedades coherentes entre sí.
- Mejora la legibilidad y la separación de responsabilidades.
- Permite que servicios y componentes reciban un objeto de configuración en lugar de muchos valores sueltos.
- Necesita estar correctamente registrada para que Spring Boot la use.
- No reemplaza siempre a `@Value`, pero sí suele ser mejor en configuraciones medianas o grandes.

## Próximo tema

En el próximo tema vas a ver cómo validar propiedades de configuración para que Spring Boot detecte temprano configuraciones inválidas o incompletas antes de que provoquen errores más difíciles de rastrear.
