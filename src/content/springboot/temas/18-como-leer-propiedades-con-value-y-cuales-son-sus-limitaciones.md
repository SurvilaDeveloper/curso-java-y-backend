---
title: "Cómo leer propiedades con @Value y cuáles son sus limitaciones"
description: "Entender cómo usar @Value para leer propiedades en Spring Boot, en qué casos resulta útil y por qué a medida que la configuración crece suelen aparecer alternativas más robustas."
order: 18
module: "Configuración en Spring Boot"
level: "intro"
draft: false
---

En el tema anterior viste que Spring Boot promueve la **configuración externa**, es decir, la idea de definir ciertos valores fuera del código rígido de la aplicación.

Ahora toca ver una de las formas más directas de llevar eso al código: `@Value`.

`@Value` es una herramienta simple y muy útil para leer propiedades y usarlas dentro de beans administrados por Spring.

Dicho de forma sencilla:

> `@Value` permite inyectar un valor de configuración dentro de una clase.

Es uno de los primeros mecanismos que la mayoría aprende al empezar con Spring Boot porque es directo, fácil de entender y resuelve rápido muchos casos simples.

## Qué hace `@Value`

La anotación `@Value` le dice a Spring que tome un valor desde la configuración y lo inyecte en un campo, en un constructor o en un parámetro.

Por ejemplo, si tenés esta propiedad:

```properties
miapp.mensaje=Bienvenido a la aplicación
```

podés usarla así:

```java
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class MensajeService {

    @Value("${miapp.mensaje}")
    private String mensaje;

    public String obtenerMensaje() {
        return mensaje;
    }
}
```

Acá Spring reemplaza esa expresión por el valor configurado y lo deja disponible dentro del bean.

## Cómo se lee la sintaxis

Esta parte:

```java
@Value("${miapp.mensaje}")
```

puede leerse así:

- `${...}` indica que se busca una propiedad
- `miapp.mensaje` es la clave de esa propiedad

O sea, Spring busca un valor con ese nombre dentro de las fuentes de configuración disponibles y lo inyecta.

## Un primer ejemplo completo

Archivo `application.properties`:

```properties
spring.application.name=curso-springboot
miapp.saludo=Hola desde la configuración
```

Clase:

```java
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SaludoService {

    @Value("${miapp.saludo}")
    private String saludo;

    public String saludar() {
        return saludo;
    }
}
```

Con esto, `saludar()` devolvería el texto configurado.

## Dónde puede usarse `@Value`

`@Value` puede usarse en varios lugares.

### 1. En campos

Es la forma más corta y común al empezar.

```java
@Value("${miapp.titulo}")
private String titulo;
```

### 2. En el constructor

También puede usarse en parámetros del constructor.

```java
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ClienteApi {

    private final String baseUrl;

    public ClienteApi(@Value("${miapp.api.base-url}") String baseUrl) {
        this.baseUrl = baseUrl;
    }
}
```

### 3. En métodos o parámetros de métodos `@Bean`

```java
@Configuration
public class ClienteConfig {

    @Bean
    public ClienteExterno clienteExterno(@Value("${miapp.api.base-url}") String baseUrl) {
        return new ClienteExterno(baseUrl);
    }
}
```

Eso muestra que `@Value` no está limitado a una sola forma de uso.

## Campo o constructor: qué conviene más

Aunque al principio es normal usar `@Value` sobre campos, conceptualmente suele ser más prolijo usar inyección por constructor cuando ese valor es parte importante del estado del objeto.

Por ejemplo:

```java
@Component
public class EmailClient {

    private final String from;

    public EmailClient(@Value("${email.from}") String from) {
        this.from = from;
    }
}
```

Esto tiene varias ventajas:

- el objeto queda completo al construirse
- el valor puede ser `final`
- la dependencia configuracional queda más explícita
- el diseño resulta más claro

Aun así, para ejemplos sencillos o primeras prácticas, ver `@Value` en campos es completamente normal.

## Qué tipo de valores puede leer

`@Value` puede leer tipos bastante comunes.

Por ejemplo:

- `String`
- `int`
- `long`
- `boolean`
- `double`

Supongamos estas propiedades:

```properties
miapp.nombre=Mi App
miapp.puerto-interno=9000
miapp.modo-debug=true
miapp.factor=1.25
```

Y esta clase:

```java
@Component
public class AppInfo {

    @Value("${miapp.nombre}")
    private String nombre;

    @Value("${miapp.puerto-interno}")
    private int puertoInterno;

    @Value("${miapp.modo-debug}")
    private boolean modoDebug;

    @Value("${miapp.factor}")
    private double factor;
}
```

Spring puede convertir automáticamente esos valores a tipos compatibles.

## `@Value` y propiedades del framework

No solo sirve para propiedades propias.

También puede leer propiedades ya conocidas por Spring Boot.

Por ejemplo:

```java
@Value("${spring.application.name}")
private String nombreAplicacion;
```

Eso puede ser útil si en algún punto de tu código querés acceder a configuraciones ya definidas para el framework.

## Qué pasa si la propiedad no existe

Este es un punto muy importante.

Si Spring intenta resolver una propiedad con `@Value` y no la encuentra, normalmente va a fallar al crear el bean.

Ejemplo:

```java
@Value("${miapp.no-existe}")
private String valor;
```

Si `miapp.no-existe` no está definida en ninguna fuente de configuración, probablemente obtengas un error de arranque.

Eso tiene una consecuencia sana:

> Spring te obliga a enfrentar temprano configuraciones faltantes en lugar de dejar el problema escondido hasta más adelante.

## Valores por defecto con `@Value`

A veces querés que una propiedad sea opcional o tenga un fallback.

Para eso podés usar un valor por defecto dentro de la expresión.

```java
@Value("${miapp.mensaje:Hola por defecto}")
private String mensaje;
```

Esto significa:

- si existe `miapp.mensaje`, se usa ese valor
- si no existe, se usa `"Hola por defecto"`

Este recurso es muy útil para configuraciones opcionales o para ejemplos iniciales.

## Ejemplo con fallback

```properties
miapp.nombre=Curso Spring Boot
```

```java
@Component
public class PresentacionService {

    @Value("${miapp.nombre}")
    private String nombre;

    @Value("${miapp.autor:Autor no definido}")
    private String autor;

    public String resumen() {
        return nombre + " - " + autor;
    }
}
```

Acá `autor` seguirá funcionando aunque no esté definido en el archivo.

## `@Value` también puede leer variables de entorno indirectamente

Como Spring Boot unifica varias fuentes de configuración, `@Value` no se limita a leer solo `application.properties`.

Si una propiedad está disponible en el entorno, `@Value` puede resolverla desde ahí también.

Eso significa que esta anotación se beneficia del sistema general de configuración de Spring Boot, no solo de archivos.

## Qué tan útil es `@Value` al empezar

Muchísimo.

Para primeros temas, demos y necesidades simples, `@Value` es excelente porque:

- se entiende rápido
- exige poco contexto previo
- te muestra claramente la conexión entre propiedad y código
- resuelve valores sueltos con muy poco esfuerzo

Por eso suele ser la puerta de entrada natural al uso de propiedades en Spring Boot.

## Casos donde `@Value` encaja muy bien

`@Value` suele funcionar muy bien cuando necesitás:

- uno o dos valores aislados
- una propiedad simple
- un pequeño flag booleano
- un timeout concreto
- una URL puntual
- un nombre o texto configurable

Por ejemplo:

```java
@Value("${miapp.version}")
private String version;
```

o:

```java
@Value("${miapp.timeout}")
private int timeout;
```

En estos casos es directo y suficiente.

## Pero `@Value` no escala igual de bien

Acá aparece la parte importante del tema.

Aunque `@Value` es útil, cuando la configuración empieza a crecer puede volverse incómodo.

Imaginá esta clase:

```java
@Component
public class ApiConfigHolder {

    @Value("${api.base-url}")
    private String baseUrl;

    @Value("${api.timeout}")
    private int timeout;

    @Value("${api.reintentos}")
    private int reintentos;

    @Value("${api.token}")
    private String token;

    @Value("${api.modo-seguro}")
    private boolean modoSeguro;
}
```

Esto ya empieza a verse más pesado.

Si la cantidad de propiedades crece más, el problema se nota todavía más.

## Primer límite: dispersión de propiedades

Con `@Value`, las propiedades suelen quedar repartidas por distintas clases.

Eso puede hacer más difícil ver de un vistazo toda la configuración de un módulo o componente.

Por ejemplo:

- una propiedad en un servicio
- otra en una clase de infraestructura
- otra en un cliente externo
- otra en un validador

Todo funciona, pero la visión global se vuelve más difusa.

## Segundo límite: grupos de configuración poco expresivos

Cuando varias propiedades pertenecen claramente al mismo concepto, `@Value` no siempre ofrece la representación más limpia.

Por ejemplo, si tenés:

```properties
email.host=smtp.ejemplo.com
email.port=587
email.username=demo
email.password=secreto
email.ssl=true
```

Con `@Value` podrías inyectarlas una por una.

Pero conceptualmente todas pertenecen al mismo grupo: la configuración de email.

A medida que crece la app, suele ser más claro agruparlas en una estructura dedicada en lugar de repartir cinco anotaciones.

## Tercer límite: menor mantenibilidad en configuraciones grandes

Cuando hay muchas propiedades, `@Value` puede llevar a:

- clases más verbosas
- mayor ruido visual
- repetición de claves
- riesgo de errores tipográficos
- dificultad para reorganizar configuración

No significa que `@Value` esté mal. Solo significa que tiene un punto a partir del cual otras herramientas resultan más cómodas.

## Cuarto límite: acoplamiento a strings de claves

Cada vez que usás `@Value`, escribís la clave como texto literal.

```java
@Value("${miapp.timeout}")
```

Eso tiene un costo:

- si renombrás la propiedad, tenés que actualizar esos literales
- si escribís mal una clave, el problema puede aparecer recién al arrancar
- el refactor no siempre es tan robusto como cuando modelás la configuración de otra manera

## Quinto límite: menor expresividad para estructuras complejas

Si tenés configuraciones jerárquicas o grupos con varios campos relacionados, `@Value` no siempre es la herramienta más elegante.

Por ejemplo, para algo muy simple sirve perfecto.
Pero si querés modelar algo como:

- datos de conexión
- límites
- timeouts
- flags
- listas
- configuraciones agrupadas por módulo

entonces empieza a quedar más natural usar otro enfoque.

## `@Value` sigue siendo válido aunque tenga límites

Esto es muy importante.

No hay que caer en el error de pensar:

> “como no escala a cualquier escenario, entonces no debería usarse”

No. `@Value` sigue siendo una herramienta legítima y útil.

Lo correcto es entender:

- dónde funciona muy bien
- dónde empieza a quedarse corto
- cuándo conviene pasar a algo más robusto

## Un buen ejemplo de uso razonable

```properties
miapp.mensaje-bienvenida=Hola
miapp.modo-debug=true
```

```java
@Component
public class BannerService {

    private final String mensaje;
    private final boolean debug;

    public BannerService(
        @Value("${miapp.mensaje-bienvenida}") String mensaje,
        @Value("${miapp.modo-debug:false}") boolean debug
    ) {
        this.mensaje = mensaje;
        this.debug = debug;
    }
}
```

Esto está bastante bien:

- son pocas propiedades
- están claras
- pertenecen a un componente pequeño
- no hace falta montar algo más elaborado

## Un ejemplo donde ya empieza a doler

```java
@Component
public class IntegracionExternaService {

    @Value("${integracion.base-url}")
    private String baseUrl;

    @Value("${integracion.usuario}")
    private String usuario;

    @Value("${integracion.password}")
    private String password;

    @Value("${integracion.timeout}")
    private int timeout;

    @Value("${integracion.reintentos}")
    private int reintentos;

    @Value("${integracion.pool-size}")
    private int poolSize;

    @Value("${integracion.log-body}")
    private boolean logBody;

    @Value("${integracion.modo-seguro}")
    private boolean modoSeguro;
}
```

Acá ya es razonable pensar que la configuración se merece una representación más agrupada.

## `@Value` y expresiones

Además de leer propiedades, `@Value` históricamente también puede participar en expresiones más sofisticadas.

No hace falta profundizar eso ahora, porque para empezar lo importante es su uso más común: leer propiedades simples.

De hecho, conviene primero dominar bien el caso directo antes de entrar en formas más avanzadas o menos frecuentes.

## `@Value` y testing

Otro punto práctico: si una clase depende de valores leídos con `@Value`, esos valores pasan a formar parte de lo que el entorno de test debe proporcionar.

Eso no es un problema en sí mismo, pero conviene recordar que la configuración también es una dependencia.

Es decir, no solo importan los otros beans: también importan las propiedades necesarias para que la clase se construya correctamente.

## Cuándo usar `@Value` sin culpa

Podés usar `@Value` con total tranquilidad cuando:

- estás arrancando
- la propiedad es aislada
- el componente es pequeño
- querés una solución simple y directa
- la configuración no amerita una estructura dedicada

No hace falta complejizar una app pequeña solo por anticiparse a escenarios enormes.

## Cuándo empezar a mirar otra alternativa

Conviene mirar alternativas más robustas cuando:

- tenés muchas propiedades relacionadas
- querés agrupar configuración por prefijo
- buscás más claridad y mantenibilidad
- querés representar esa configuración como un objeto propio
- el sistema configuracional ya tiene cierto peso dentro de la app

Ahí suele entrar en juego una herramienta muy importante: `@ConfigurationProperties`.

Más adelante vas a verla con detalle.

## Una buena regla mental

Podés resumir la decisión así:

- **pocas propiedades simples** → `@Value` suele alcanzar
- **muchas propiedades relacionadas** → probablemente convenga agruparlas

Esta regla no es perfecta, pero ayuda muchísimo al empezar.

## Error común: usar `@Value` para todo sin revisar el tamaño del problema

Como `@Value` es fácil, a veces uno empieza a usarlo en todos lados.

Y sin darse cuenta termina con:

- muchas claves literales
- propiedades desperdigadas
- clases más ruidosas
- poca visión de conjunto

No está mal empezar así, pero conviene detectar cuándo ese enfoque ya necesita evolucionar.

## Error común: pensar que `@Value` siempre debe ir en campos

No necesariamente.

Aunque es frecuente verlo en campos, muchas veces usarlo en el constructor deja un diseño más claro.

Por ejemplo:

```java
@Component
public class ClienteApi {

    private final String url;

    public ClienteApi(@Value("${api.url}") String url) {
        this.url = url;
    }
}
```

Eso hace más visible de qué depende el objeto.

## Error común: usar valores por defecto para esconder problemas reales

Los fallbacks son útiles, pero también pueden ocultar configuraciones faltantes si se usan sin criterio.

Por ejemplo, poner valores por defecto en propiedades que en realidad deberían ser obligatorias puede hacer que la app arranque “como si nada” pero con una configuración equivocada.

Entonces, usar default values sí, pero con intención.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> `@Value` es una forma directa y práctica de leer propiedades en Spring Boot, ideal para configuraciones simples, pero a medida que la configuración crece suele volverse más conveniente agruparla con herramientas más expresivas.

## Resumen

- `@Value` permite inyectar propiedades dentro de un bean.
- Puede usarse en campos, constructores y métodos.
- Sirve muy bien para valores simples y aislados.
- También admite valores por defecto.
- Si una propiedad obligatoria falta, normalmente Spring falla al arrancar.
- A medida que la cantidad de propiedades crece, `@Value` se vuelve menos cómodo.
- Su principal límite aparece cuando querés agrupar configuración relacionada de forma más clara.

## Próximo tema

En el próximo tema vas a ver cómo agrupar propiedades con `@ConfigurationProperties`, por qué suele escalar mejor que `@Value` y en qué escenarios conviene preferirlo.
