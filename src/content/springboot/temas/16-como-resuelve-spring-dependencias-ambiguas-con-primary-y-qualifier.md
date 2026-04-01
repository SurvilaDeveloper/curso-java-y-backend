---
title: "Cómo resuelve Spring dependencias ambiguas con @Primary y @Qualifier"
description: "Entender qué ocurre cuando hay varios beans del mismo tipo y cómo Spring usa herramientas como @Primary y @Qualifier para decidir cuál inyectar."
order: 16
module: "Fundamentos de Spring y Spring Boot"
level: "intro"
draft: false
---

Hasta ahora viste varios casos donde Spring encuentra un bean, lo crea y luego lo inyecta en otra clase sin problemas.

Eso funciona muy bien mientras haya una única opción clara para satisfacer una dependencia.

Pero en proyectos reales aparece rápidamente una situación más interesante:

- tenés más de un bean del mismo tipo
- una clase necesita ese tipo
- Spring debe decidir cuál usar

Ahí entra el problema de la **ambigüedad de dependencias**.

Este tema es importante porque te muestra que la inyección de dependencias no es solo “Spring pone algo donde hace falta”, sino que también necesita reglas para decidir **qué bean exacto corresponde en cada caso**.

## El problema base: más de un bean compatible

Supongamos que tenés esta interfaz:

```java
public interface Notificador {
    void enviar(String mensaje);
}
```

Y dos implementaciones:

```java
import org.springframework.stereotype.Component;

@Component
public class EmailNotificador implements Notificador {

    @Override
    public void enviar(String mensaje) {
        System.out.println("Email: " + mensaje);
    }
}
```

```java
import org.springframework.stereotype.Component;

@Component
public class SmsNotificador implements Notificador {

    @Override
    public void enviar(String mensaje) {
        System.out.println("SMS: " + mensaje);
    }
}
```

Ahora supongamos esta clase:

```java
import org.springframework.stereotype.Service;

@Service
public class AlertaService {

    private final Notificador notificador;

    public AlertaService(Notificador notificador) {
        this.notificador = notificador;
    }
}
```

Acá Spring ve que `AlertaService` necesita un `Notificador`.

El problema es que encuentra dos candidatos:

- `EmailNotificador`
- `SmsNotificador`

Entonces aparece una pregunta inevitable:

> ¿cuál de los dos debería inyectar?

## Qué pasa si no hacés nada

Si Spring encuentra más de un bean compatible y no tiene forma clara de elegir, normalmente lanza un error.

Conceptualmente, el problema es este:

- la dependencia pide un tipo
- hay varios beans que cumplen ese tipo
- no hay un criterio suficiente para resolver el conflicto

En ese escenario, Spring prefiere fallar antes que adivinar mal.

Eso es sano, porque evita inyecciones ambiguas o comportamientos inesperados.

## Por qué esto no es un error del framework

A veces alguien podría pensar:

> “si Spring es tan inteligente, debería saber cuál quiero”

Pero el framework no puede leer tu intención de negocio.

Si dos beans cumplen el mismo contrato, Spring necesita una regla explícita o una pista adicional para decidir.

Por eso existen mecanismos como:

- `@Primary`
- `@Qualifier`

## Cuándo aparece este problema

La ambigüedad suele aparecer cuando tenés:

- varias implementaciones de una misma interfaz
- varios beans del mismo tipo concreto
- configuraciones con múltiples clientes o estrategias
- distintos adaptadores para una misma responsabilidad
- beans técnicos parecidos pero con propósitos distintos

O sea: no es un caso raro. Es completamente normal en aplicaciones más flexibles.

## Primera herramienta: `@Primary`

`@Primary` sirve para marcar un bean como la opción preferida cuando hay varios candidatos del mismo tipo.

Por ejemplo:

```java
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary
public class EmailNotificador implements Notificador {

    @Override
    public void enviar(String mensaje) {
        System.out.println("Email: " + mensaje);
    }
}
```

Y otra implementación:

```java
import org.springframework.stereotype.Component;

@Component
public class SmsNotificador implements Notificador {

    @Override
    public void enviar(String mensaje) {
        System.out.println("SMS: " + mensaje);
    }
}
```

Ahora, si una clase pide un `Notificador`, Spring elegirá `EmailNotificador` por ser el bean primario.

## Cómo pensar `@Primary`

Podés entender `@Primary` así:

> “si nadie especifica otra cosa, este es el bean preferido para este tipo”

Eso lo vuelve muy útil cuando:

- existe una implementación más común
- querés dejar una opción por defecto
- hay una variante estándar y otras más específicas

## Un ejemplo completo con `@Primary`

```java
@Service
public class AlertaService {

    private final Notificador notificador;

    public AlertaService(Notificador notificador) {
        this.notificador = notificador;
    }

    public void alertar() {
        notificador.enviar("Alerta generada");
    }
}
```

Si `EmailNotificador` está marcado con `@Primary`, Spring inyecta ese bean en `AlertaService` sin que tengas que aclarar nada más.

## Qué ventaja tiene `@Primary`

La principal ventaja es que simplifica la inyección cuando hay una opción que querés tratar como default.

No hace falta que cada dependencia esté detallando manualmente cuál implementación quiere si en la mayoría de los casos la misma opción es la correcta.

## Qué limitación tiene `@Primary`

`@Primary` resuelve una preferencia general, pero no siempre alcanza.

Por ejemplo, imaginá esto:

- para unas clases querés email
- para otras querés SMS
- para otras querés WhatsApp

En ese caso, un default general puede no ser suficiente, porque distintas clases necesitan diferentes implementaciones.

Ahí suele entrar `@Qualifier`.

## Segunda herramienta: `@Qualifier`

`@Qualifier` sirve para indicar de manera más precisa **qué bean concreto querés inyectar**.

Sigamos con el mismo ejemplo:

```java
@Component
public class EmailNotificador implements Notificador {

    @Override
    public void enviar(String mensaje) {
        System.out.println("Email: " + mensaje);
    }
}
```

```java
@Component
public class SmsNotificador implements Notificador {

    @Override
    public void enviar(String mensaje) {
        System.out.println("SMS: " + mensaje);
    }
}
```

Ahora podés hacer esto:

```java
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Service
public class AlertaService {

    private final Notificador notificador;

    public AlertaService(@Qualifier("emailNotificador") Notificador notificador) {
        this.notificador = notificador;
    }
}
```

De esta forma, Spring ya no tiene que elegir entre varios sin guía. Le estás diciendo explícitamente cuál querés.

## De dónde sale el nombre del bean

Cuando usás componentes detectados automáticamente, el nombre del bean suele derivarse del nombre de la clase con la primera letra en minúscula.

Por ejemplo:

- `EmailNotificador` → `emailNotificador`
- `SmsNotificador` → `smsNotificador`

Ese nombre puede usarse con `@Qualifier`.

## Un ejemplo con dos clases que piden cosas distintas

```java
@Service
public class CampaniaEmailService {

    private final Notificador notificador;

    public CampaniaEmailService(@Qualifier("emailNotificador") Notificador notificador) {
        this.notificador = notificador;
    }
}
```

```java
@Service
public class CampaniaSmsService {

    private final Notificador notificador;

    public CampaniaSmsService(@Qualifier("smsNotificador") Notificador notificador) {
        this.notificador = notificador;
    }
}
```

En este caso, ambas clases dependen del mismo contrato `Notificador`, pero cada una elige una implementación diferente.

Ese es justamente uno de los escenarios donde `@Qualifier` resulta más valioso.

## Diferencia conceptual entre `@Primary` y `@Qualifier`

Una forma muy útil de pensarlo es así:

### `@Primary`
Marca la opción preferida por defecto.

### `@Qualifier`
Permite elegir explícitamente una opción concreta.

En otras palabras:

- `@Primary` resuelve la preferencia general
- `@Qualifier` resuelve la selección puntual

## Cuándo conviene usar `@Primary`

Suele tener sentido cuando:

- hay una implementación principal
- el 80 o 90 por ciento de los casos usan la misma opción
- querés una convención por defecto
- las otras implementaciones son más excepcionales

## Cuándo conviene usar `@Qualifier`

Suele tener sentido cuando:

- distintas clases necesitan distintas implementaciones
- no querés depender de una opción general
- querés que la elección quede muy explícita
- el contexto tiene varias variantes igual de válidas

## Ambos pueden convivir

No son herramientas incompatibles.

Podés tener una implementación marcada como `@Primary` y, además, en ciertos lugares usar `@Qualifier` para pedir otra específica.

Por ejemplo:

- `EmailNotificador` como primario
- `SmsNotificador` como alternativa puntual

Entonces:

- si una clase pide `Notificador` sin más, recibe el primario
- si otra usa `@Qualifier("smsNotificador")`, recibe SMS

Eso le da mucha flexibilidad al diseño.

## También puede pasar con beans definidos con `@Bean`

No solo aparece esta situación con `@Component`.

También puede pasar cuando declarás beans explícitamente.

```java
@Configuration
public class NotificadorConfig {

    @Bean
    public Notificador emailNotificador() {
        return new EmailNotificador();
    }

    @Bean
    public Notificador smsNotificador() {
        return new SmsNotificador();
    }
}
```

Acá también existen dos beans del tipo `Notificador`, así que Spring necesita un criterio para resolver la inyección.

Podrías usar `@Primary`:

```java
@Bean
@Primary
public Notificador emailNotificador() {
    return new EmailNotificador();
}
```

O podrías elegir con `@Qualifier` al inyectar.

## Un caso muy real: varios clientes externos

Imaginá que tenés dos clientes HTTP hacia distintos proveedores, pero ambos usan el mismo tipo base.

```java
public class ApiClient {
}
```

Y registrás dos beans:

```java
@Configuration
public class ClienteConfig {

    @Bean
    public ApiClient clienteFacturacion() {
        return new ApiClient();
    }

    @Bean
    public ApiClient clienteInventario() {
        return new ApiClient();
    }
}
```

Si una clase pide simplemente `ApiClient`, Spring no sabrá cuál elegir.

En ese caso, `@Qualifier` suele ser muy útil porque permite expresar con claridad si querés el de facturación o el de inventario.

## También se pueden inyectar colecciones

Aunque el problema principal de este tema es elegir un bean concreto, conviene saber que Spring también puede inyectar **todos los beans compatibles** como colección.

Por ejemplo, varias implementaciones de una misma interfaz pueden recibirse como lista.

Eso ya es otro patrón, útil para estrategias o procesamiento por cadena, pero sirve para entender que la ambigüedad no siempre se resuelve eligiendo uno solo: a veces querés trabajar con todos.

De todos modos, para empezar, lo más importante es dominar la elección de un bean individual.

## Error común: pensar que `@Primary` siempre “gana” todo

`@Primary` no anula cualquier otra instrucción.

Si en un punto de inyección usás `@Qualifier`, esa selección explícita pesa más que la preferencia general.

O sea:

- `@Primary` define un default
- `@Qualifier` define una elección concreta

## Error común: usar `@Qualifier` en todos lados sin necesidad

También puede pasar lo contrario.

Si hay una única implementación clara o un bean primario bien elegido, llenar todo el código de qualifiers puede volver el proyecto más ruidoso.

No siempre hace falta escribir la selección explícita si el contexto ya resuelve la intención de forma clara.

## Error común: resolver mal un problema de diseño

A veces la ambigüedad no es un problema técnico, sino una señal de que el diseño todavía no está claro.

Por ejemplo:

- dos beans hacen casi lo mismo pero con nombres poco expresivos
- varias implementaciones se mezclan sin una intención clara
- el contrato de la interfaz es demasiado amplio

En esos casos, antes de apilar `@Qualifier`, puede valer la pena revisar el diseño.

## Un patrón muy común: estrategia

Todo este tema aparece muchísimo cuando usás el patrón estrategia.

Por ejemplo:

- distintos métodos de pago
- distintos validadores
- distintos notificados
- distintos exportadores
- distintos adaptadores externos

Ahí suele haber una interfaz común y varias implementaciones.

Spring permite trabajar muy bien con ese estilo, pero justamente por eso necesitás saber cómo resolver la selección del bean correcto.

## Un ejemplo con varios exportadores

```java
public interface Exportador {
    void exportar();
}
```

```java
@Component
public class PdfExportador implements Exportador {

    @Override
    public void exportar() {
        System.out.println("Exportando PDF");
    }
}
```

```java
@Component
public class CsvExportador implements Exportador {

    @Override
    public void exportar() {
        System.out.println("Exportando CSV");
    }
}
```

Si una clase necesita uno concreto:

```java
@Service
public class ReporteService {

    private final Exportador exportador;

    public ReporteService(@Qualifier("pdfExportador") Exportador exportador) {
        this.exportador = exportador;
    }
}
```

Eso deja muy explícita la intención.

## Qué criterio conviene seguir al empezar

Una guía práctica bastante sana puede ser esta:

1. si hay una implementación claramente principal, usá `@Primary`
2. si una clase necesita una implementación específica, usá `@Qualifier`
3. si hay demasiada ambigüedad, revisá el diseño
4. no conviertas la resolución de beans en una maraña innecesaria

## Relación con Spring Boot

Spring Boot, al autoconfigurar componentes, también puede convivir con múltiples beans del mismo tipo.

Por eso entender `@Primary` y `@Qualifier` no sirve solo para tus clases de negocio, sino también para interactuar mejor con configuraciones más avanzadas.

Más adelante, cuando veas clientes HTTP, seguridad, serialización o integración con librerías, este concepto te va a volver a aparecer una y otra vez.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> cuando hay varios beans compatibles con una dependencia, Spring necesita una regla clara para decidir cuál inyectar, y herramientas como `@Primary` y `@Qualifier` existen justamente para expresar esa intención.

## Resumen

- La ambigüedad aparece cuando hay varios beans del mismo tipo.
- Si Spring no puede decidir, normalmente falla.
- `@Primary` marca una opción preferida por defecto.
- `@Qualifier` permite elegir explícitamente un bean concreto.
- Ambos mecanismos pueden convivir.
- La ambigüedad es normal en proyectos con varias implementaciones.
- A veces el conflicto también revela decisiones de diseño que conviene revisar.

## Próximo tema

En el próximo tema vas a ver cómo funciona la configuración externa en Spring Boot y por qué propiedades, archivos de configuración y variables de entorno son una parte tan importante de una aplicación real.
