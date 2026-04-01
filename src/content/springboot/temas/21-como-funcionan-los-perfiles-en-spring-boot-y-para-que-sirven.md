---
title: "Cómo funcionan los perfiles en Spring Boot y para qué sirven"
description: "Entender qué son los perfiles en Spring Boot, cómo permiten adaptar configuración y comportamiento según el entorno y por qué resultan tan importantes en aplicaciones reales."
order: 21
module: "Configuración en Spring Boot"
level: "base"
draft: false
---

En los temas anteriores viste que Spring Boot permite externalizar configuración y validarla.

Eso ya es un paso enorme.

Pero en una aplicación real aparece rápidamente una necesidad más específica:

- en desarrollo querés una base local
- en testing querés una configuración aislada
- en producción querés credenciales, logs y parámetros distintos
- quizá en un entorno demo querés otra combinación
- en integración continua querés otro comportamiento

La gran pregunta es:

> ¿cómo hacer para que una misma aplicación tenga configuraciones distintas según el entorno, sin andar tocando el código todo el tiempo?

Spring Boot responde a esto con una herramienta fundamental: los **perfiles**.

## Qué es un perfil

Un perfil es una forma de decirle a Spring:

> “para este entorno o este contexto, quiero activar esta variante de configuración o de comportamiento”.

Dicho de forma más simple:

- el código base puede ser el mismo
- pero ciertos valores o ciertos beans pueden cambiar según el perfil activo

Eso hace que una sola aplicación pueda adaptarse a distintos escenarios sin duplicarse ni volverse caótica.

## La idea mental correcta

Conviene pensar los perfiles así:

- no son aplicaciones distintas
- no son proyectos distintos
- no son “ramas” separadas del código

Son más bien **modos de ejecución** dentro de una misma aplicación.

Por ejemplo:

- modo desarrollo
- modo testing
- modo producción

Cada modo puede activar o sobrescribir ciertas cosas.

## Por qué los perfiles son tan importantes

Sin perfiles, una aplicación real suele caer en una de estas situaciones incómodas:

### 1. Cambiar archivos a mano antes de correr
Por ejemplo:
- poner una URL local
- después cambiarla a una URL de producción
- después volver a cambiarla

Eso es frágil y propenso a errores.

### 2. Hardcodear decisiones por entorno
Por ejemplo:

```java
if ("prod".equals(entorno)) {
    // usar una configuración
} else {
    // usar otra
}
```

A veces hay casos donde algo parecido puede tener sentido, pero muchas veces eso mezcla lógica de entorno con lógica de aplicación de una forma poco limpia.

### 3. Duplicar configuraciones sin estructura
Terminas con:
- archivos mezclados
- valores repetidos
- despliegues poco claros
- alto riesgo de levantar el entorno incorrecto

Los perfiles existen justamente para evitar este tipo de desorden.

## Ejemplo típico de perfiles

Los perfiles más habituales suelen ser:

- `dev`
- `test`
- `prod`

No son obligatorios ni mágicos, simplemente son convenciones muy comunes.

Podrías tener:

- configuración base
- configuración extra para desarrollo
- configuración extra para testing
- configuración extra para producción

## Archivo base y archivos por perfil

Una forma muy típica de trabajar es esta:

- `application.properties`
- `application-dev.properties`
- `application-test.properties`
- `application-prod.properties`

La idea general es:

- `application.properties` contiene la configuración común o base
- cada archivo de perfil agrega o sobrescribe lo necesario para su entorno específico

## Un ejemplo simple

Archivo base:

```properties
spring.application.name=mi-aplicacion
miapp.mensaje=Mensaje base
```

Archivo de desarrollo:

```properties
miapp.mensaje=Mensaje para desarrollo
server.port=8081
```

Archivo de producción:

```properties
miapp.mensaje=Mensaje para producción
server.port=8080
```

Con esto, la app puede conservar una base compartida pero cambiar ciertos valores según el perfil activo.

## Qué significa “perfil activo”

El perfil activo es el que Spring toma como referencia para decidir qué configuración específica debe aplicar además de la base.

Dicho de otro modo:

- siempre puede existir una configuración general
- el perfil activo decide qué capa adicional entra en juego

Por eso, saber qué perfil está activo es muy importante para entender cómo se está comportando la aplicación.

## Cómo se activa un perfil

Una forma común es indicar una propiedad como:

```properties
spring.profiles.active=dev
```

También puede activarse de otras maneras, como desde variables de entorno o argumentos al arrancar la aplicación.

No hace falta aprender todavía todas las formas posibles.
Lo importante es entender esta idea:

> el perfil activo puede definirse desde la configuración o desde el entorno, y eso modifica el resultado final de la configuración efectiva.

## Qué pasa cuando se activa un perfil

Cuando un perfil está activo, Spring Boot:

- carga la configuración base
- carga la configuración específica del perfil
- resuelve los valores finales según sus reglas de precedencia

Eso significa que una propiedad puede existir en ambos lugares y el valor del perfil sobrescribir al base.

## Ejemplo de sobrescritura

Archivo base:

```properties
miapp.timeout=3000
```

Archivo `application-dev.properties`:

```properties
miapp.timeout=10000
```

Si el perfil activo es `dev`, el timeout efectivo será `10000`.

Esto permite adaptar el comportamiento sin tocar el código ni el archivo base.

## Qué tipo de cosas suelen variar por perfil

Los perfiles suelen usarse para diferencias como estas:

### Desarrollo
- base de datos local
- logs más verbosos
- puertos alternativos
- integraciones simuladas o simplificadas
- valores pensados para iterar rápido

### Testing
- configuraciones aisladas
- comportamiento controlado para pruebas
- servicios falsos o simplificados
- parámetros cómodos para test

### Producción
- base de datos real
- logs más moderados
- seguridad más estricta
- parámetros estables
- integraciones reales
- configuraciones optimizadas para despliegue

## Qué conviene dejar en el archivo base

Una buena pregunta práctica es esta:

> ¿qué debería ir en la configuración base y qué debería quedar por perfil?

Como criterio general, en el archivo base conviene poner:

- valores comunes
- defaults razonables
- configuración compartida
- parámetros que no cambian entre entornos

En cambio, por perfil conviene poner:

- lo que realmente cambia según contexto
- URLs específicas
- puertos especiales
- datos de entorno
- configuraciones técnicas distintas

## Por qué esto evita duplicación innecesaria

Si no existiera una base común, cada perfil tendría que repetir todo.

Eso generaría:

- archivos más largos
- mucha duplicación
- más riesgo de inconsistencias
- mantenimiento más costoso

Por eso la combinación “base + sobrescritura por perfil” es tan valiosa.

## Los perfiles no son solo para propiedades

Esto es muy importante.

Hasta acá lo más fácil es pensar perfiles como una forma de cambiar valores de configuración.

Pero también sirven para condicionar qué beans o configuraciones están activos.

Eso abre posibilidades muy potentes.

Por ejemplo:

- un bean real en producción
- un bean fake en desarrollo
- una integración simplificada en testing
- una implementación distinta según el entorno

## `@Profile` como idea central

Spring permite asociar ciertos beans o clases de configuración a un perfil concreto.

Por ejemplo:

```java
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("dev")
public class NotificadorConsolaService {
}
```

Y otra implementación:

```java
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("prod")
public class NotificadorEmailService {
}
```

La idea general es:

- si está activo `dev`, una implementación participa del contexto
- si está activo `prod`, participa otra

Esto permite cambiar comportamiento real de la aplicación según el entorno.

## Un ejemplo conceptual muy claro

Imaginá esta interfaz:

```java
public interface Notificador {
    void enviar(String mensaje);
}
```

Implementación para desarrollo:

```java
@Service
@Profile("dev")
public class NotificadorLog implements Notificador {

    @Override
    public void enviar(String mensaje) {
        System.out.println("DEV -> " + mensaje);
    }
}
```

Implementación para producción:

```java
@Service
@Profile("prod")
public class NotificadorEmail implements Notificador {

    @Override
    public void enviar(String mensaje) {
        System.out.println("EMAIL -> " + mensaje);
    }
}
```

Con esto, una clase que dependa de `Notificador` puede recibir distintas implementaciones según el perfil activo.

Eso es poderosísimo.

## Qué ventaja aporta esto

La gran ventaja es que ya no necesitás mezclar lógica de entorno dentro del código del servicio consumidor.

No hace falta algo así:

```java
if (modoProduccion) {
    enviarEmail();
} else {
    mostrarEnConsola();
}
```

En muchos casos, podés dejar que Spring seleccione la implementación correcta según el perfil.

Eso deja el código más limpio y mejor separado.

## Perfiles y clases de configuración

`@Profile` no solo puede usarse sobre servicios.

También puede usarse sobre clases de configuración.

Por ejemplo:

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("prod")
public class ProduccionConfig {
}
```

Eso permite que ciertas configuraciones técnicas entren solo en determinados entornos.

Es especialmente útil cuando querés registrar beans específicos para producción, desarrollo o testing.

## Perfiles y beans declarados manualmente

También puede aplicarse a métodos `@Bean`.

Por ejemplo:

```java
@Configuration
public class ClienteConfig {

    @Bean
    @Profile("dev")
    public ClienteExterno clienteFake() {
        return new ClienteExterno("http://localhost:9999");
    }

    @Bean
    @Profile("prod")
    public ClienteExterno clienteReal() {
        return new ClienteExterno("https://api.real.com");
    }
}
```

Esto deja muy clara la intención: el mismo tipo de bean puede resolverse distinto según el perfil.

## Cuándo usar perfiles para beans y cuándo para propiedades

Una regla mental muy útil es esta:

- si solo cambia un valor, probablemente alcanza con configuración por perfil
- si cambia la implementación o la estructura del componente, probablemente convenga usar `@Profile`

Por ejemplo:

### Cambia solo la URL
Usá properties por perfil.

### Cambia el tipo de servicio que participa del contexto
Usá `@Profile`.

No es una regla absoluta, pero ayuda mucho a pensar con claridad.

## Un caso clásico: base de datos

Uno de los usos más típicos de perfiles es la configuración de base de datos.

Por ejemplo:

### En desarrollo
- base local
- datos temporales
- setup sencillo

### En test
- base aislada o efímera
- configuración pensada para pruebas

### En producción
- base real
- credenciales reales
- parámetros más controlados

Todo esto puede resolverse mediante propiedades específicas por perfil sin tener que tocar el código principal.

## Otro caso clásico: logging

También es muy común ajustar logs según el entorno.

Por ejemplo:

### En dev
- más detalle
- más trazas
- más ruido útil para depurar

### En prod
- menos ruido
- enfoque en eventos importantes
- logs más estables y seguros

Esto vuelve los perfiles muy útiles también para operación y observabilidad.

## Perfiles y seguridad

En producción suelen existir requisitos que en desarrollo no siempre necesitás endurecer del mismo modo.

Por ejemplo:

- endpoints especiales
- llaves o credenciales
- orígenes permitidos
- configuraciones de seguridad más estrictas

Los perfiles ayudan a expresar estas diferencias de forma ordenada.

## Perfiles y secretos

Aunque los perfiles ayudan a cambiar configuraciones, no deberían usarse como excusa para dejar secretos sensibles versionados sin cuidado.

Por ejemplo, no porque exista `application-prod.properties` significa que sea buena idea meter ahí cualquier credencial real dentro del repositorio.

Los perfiles ayudan a estructurar configuración, pero la gestión de secretos sigue necesitando buenas prácticas.

## Una misma app, múltiples contextos

Esta es una de las ideas más importantes del tema.

Spring Boot no te obliga a hacer una app para desarrollo y otra para producción.

Te permite tener una sola aplicación adaptable.

Eso tiene enormes ventajas:

- menos duplicación
- menos divergencia entre entornos
- mantenimiento más limpio
- despliegues más previsibles

## Qué pasa si activás mal un perfil

Si activás el perfil equivocado, podrías terminar con:

- configuración incorrecta
- beans no deseados
- integraciones falsas en un entorno real
- logs demasiado verbosos o demasiado pobres
- endpoints o recursos mal configurados

Por eso, en equipos y despliegues reales, manejar bien la activación del perfil es una cuestión importante.

## Perfiles y testing

Los perfiles también son muy útiles en pruebas.

Permiten preparar contextos donde:

- ciertas integraciones están reemplazadas
- ciertas propiedades usan valores de test
- algunos beans se activan solo en ese escenario

Eso da mucho control sobre cómo se comporta la aplicación durante pruebas automatizadas.

## Error común: usar perfiles para cualquier diferencia mínima

No toda variación necesita un perfil.

A veces basta con una propiedad externa o una variable de entorno.

Si empezás a crear perfiles para cada pequeña variación, podés terminar con demasiados modos y una matriz difícil de entender.

Por eso conviene usarlos con intención, no por reflejo.

## Error común: meter mucha lógica de negocio atada a perfiles

Los perfiles son muy útiles, pero no deberían volverse una excusa para repartir la lógica del sistema en ramas de entorno por todos lados.

Lo ideal es que resuelvan diferencias de contexto técnico o de infraestructura, o variaciones de implementación bien justificadas.

Si terminan alterando masivamente reglas de negocio, quizá hay otra decisión de diseño que revisar.

## Error común: olvidar la configuración base

Otro problema común es poner absolutamente todo por perfil y dejar el archivo base casi vacío.

Eso puede ser válido en algunos proyectos, pero muchas veces se pierde la ventaja de centralizar defaults y configuración común.

La combinación más sana suele ser:

- base compartida
- sobrescrituras puntuales por perfil

## Error común: pensar que los perfiles reemplazan por completo otras fuentes de configuración

Los perfiles son una parte del sistema configuracional de Spring Boot, no toda la historia.

Siguen conviviendo con:

- propiedades base
- variables de entorno
- argumentos de arranque
- reglas de precedencia

O sea: no son una isla. Forman parte del modelo general de configuración.

## Un ejemplo integrador

Supongamos esta estructura:

Archivo base:

```properties
spring.application.name=miapp
miapp.modo=normal
```

Archivo `application-dev.properties`:

```properties
miapp.modo=desarrollo
server.port=8081
```

Archivo `application-prod.properties`:

```properties
miapp.modo=produccion
server.port=8080
```

Y un bean:

```java
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class InfoModo {

    @Value("${miapp.modo}")
    private String modo;

    public String getModo() {
        return modo;
    }
}
```

El valor de `modo` dependerá del perfil activo.

Ese ejemplo ya muestra el corazón del mecanismo:
mismo código, distinta configuración efectiva.

## Una regla práctica muy sana

Podés pensar así:

- valores que cambian por entorno → perfiles
- implementaciones que cambian por entorno → `@Profile`
- configuración común → archivo base
- secretos reales → manejar con cuidado fuera de lo versionado si corresponde

Esta brújula ayuda muchísimo al empezar.

## Relación con Spring Boot

Los perfiles son una parte central de la experiencia real con Spring Boot.

Boot está pensado para facilitar:

- desarrollo local
- testing
- despliegue
- configuración por entorno
- adaptación sin reescritura del código

Entender bien los perfiles te acerca mucho a usar Spring Boot como se usa en proyectos de verdad, y no solo en demos pequeñas.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> los perfiles permiten que una misma aplicación Spring Boot adapte su configuración y, en ciertos casos, sus beans activos según el entorno, sin necesidad de duplicar el proyecto ni modificar el código principal para cada escenario.

## Resumen

- Un perfil representa una variante de configuración o comportamiento según el entorno.
- Los perfiles más comunes suelen ser `dev`, `test` y `prod`.
- La configuración base puede convivir con configuraciones específicas por perfil.
- El perfil activo determina qué valores y, eventualmente, qué beans se aplican.
- `@Profile` permite activar beans o configuraciones según el entorno.
- Los perfiles ayudan a evitar hardcodeo, duplicación y desorden entre entornos.
- Son una herramienta central para trabajar con Spring Boot en aplicaciones reales.

## Próximo tema

En el próximo tema vas a ver cómo se combinan y resuelven distintas fuentes de configuración en Spring Boot, y por qué entender la precedencia entre archivos, perfiles, variables de entorno y argumentos de arranque evita muchos errores sutiles.
