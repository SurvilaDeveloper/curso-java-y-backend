---
title: "Repositorio privado y gestión de entornos"
description: "Estrategias para trabajar con repositorios privados de configuración en NovaMarket, separar ambientes como dev y prod, y evitar mezclar configuración operativa con información sensible."
order: 7
module: "Módulo 2 · Configuración centralizada"
level: "intermedio"
draft: false
---

# Repositorio privado y gestión de entornos

En la clase anterior dejamos armada una base importante para NovaMarket:

- un `config-server`,
- un repositorio Git como backend de configuración,
- y una estructura inicial por servicio.

Ahora vamos a profundizar en dos temas que, en proyectos reales, son inseparables:

- **el uso de un repositorio privado**,
- y la **gestión de entornos**.

A simple vista podría parecer un tema meramente operativo, pero en realidad impacta de lleno en la arquitectura. En una aplicación distribuida no solo importa que la configuración exista: también importa **quién puede verla, cómo se organiza por ambiente y cómo evitar que el sistema se vuelva confuso o inseguro cuando crecen las diferencias entre dev, test y prod**.

---

## Por qué esta clase importa tanto

Cuando se habla de configuración centralizada, muchas veces se explica primero el “camino feliz”:

- se crea un Config Server,
- se apunta a un repositorio Git,
- los servicios levantan,
- y listo.

Pero apenas el sistema empieza a parecerse a algo real, aparecen preguntas más serias:

- ¿la configuración debe estar en un repositorio público?
- ¿cómo se separan desarrollo y producción?
- ¿qué parte de la configuración cambia entre ambientes?
- ¿qué pasa si distintos servicios tienen necesidades distintas según el entorno?
- ¿cómo se evita que el repositorio central se convierta en un depósito caótico?

Esta clase se enfoca justamente en esas preguntas.

---

## Repositorio público vs. repositorio privado

En un curso, un repositorio público puede servir para mostrar una idea rápidamente.

Pero para una arquitectura como **NovaMarket**, la decisión coherente es pensar el repositorio de configuración como **privado**.

### ¿Por qué?

Porque incluso cuando el repositorio no contiene secretos directos, puede revelar información sensible desde el punto de vista operativo, por ejemplo:

- nombres internos de servicios,
- puertos,
- URLs internas,
- convenciones de despliegue,
- topología del sistema,
- endpoints expuestos,
- perfiles y comportamientos por ambiente.

Todo eso puede no ser una contraseña, pero sí forma parte del mapa interno del sistema.

Por eso conviene transmitir desde temprano esta idea:

**la configuración del sistema es parte de la arquitectura y merece un tratamiento controlado**.

---

## Qué significa “repositorio privado” en la práctica

En el contexto del curso, usar un repositorio privado significa que el Config Server no solo debe conocer la URL del backend Git, sino también tener la forma correcta de autenticarse para acceder al contenido.

Eso puede resolverse de distintas maneras según el proveedor o el entorno:

- credenciales técnicas,
- tokens de acceso,
- claves,
- mecanismos del entorno de ejecución.

No necesitamos convertir esta clase en un manual de cada plataforma. Lo importante es entender el principio:

**si el repositorio es privado, el Config Server necesita una estrategia de acceso que no esté hardcodeada de forma insegura**.

Es decir:

- la configuración del Config Server también merece cuidado,
- y no deberíamos resolver su acceso de una manera que comprometa todo el sistema.

---

## Qué cambia entre entornos

Uno de los grandes beneficios de centralizar configuración es poder expresar diferencias entre ambientes sin modificar el código de los microservicios.

En NovaMarket, algunos cambios típicos entre `dev` y `prod` podrían ser:

- puertos o direcciones de infraestructura,
- niveles de logging,
- exposición de endpoints de actuator,
- configuración de bases de datos,
- comportamiento de componentes auxiliares,
- integración con servicios simulados o reales,
- parámetros de tolerancia a fallas.

Lo importante es no tratar todos esos cambios como si fueran de la misma naturaleza.

---

## Diferencia entre configuración compartida y específica por entorno

Para mantener orden, conviene pensar la configuración en capas.

### Capa 1: configuración compartida

Aplica a varios servicios o incluso a todo el sistema.

Ejemplo:

- ciertas convenciones de logs,
- exposición de endpoints técnicos comunes,
- flags generales.

### Capa 2: configuración específica de cada servicio

Aplica a un servicio concreto.

Ejemplo:

- puerto,
- nombre lógico,
- comportamiento propio del servicio,
- parámetros del dominio.

### Capa 3: configuración específica del ambiente

Introduce diferencias entre `dev`, `test`, `prod` o cualquier otro perfil.

Ejemplo:

- niveles de logging más verbosos en `dev`,
- configuración más restrictiva en `prod`,
- URLs diferentes para infraestructura,
- comportamiento de debugging habilitado o deshabilitado.

Cuando estas capas no están claras, el repositorio de configuración se vuelve desordenado muy rápido.

---

## Una estructura coherente para NovaMarket

Una propuesta didáctica y práctica podría ser esta:

```txt
novamarket-config/
  application.yml
  application-dev.yml
  application-prod.yml
  catalog-service.yml
  catalog-service-dev.yml
  catalog-service-prod.yml
  inventory-service.yml
  inventory-service-dev.yml
  inventory-service-prod.yml
  order-service.yml
  order-service-dev.yml
  order-service-prod.yml
  api-gateway.yml
  api-gateway-dev.yml
  api-gateway-prod.yml
```

Esta estructura comunica varias cosas importantes de una sola vez:

- hay una base común,
- cada servicio tiene su identidad,
- y además hay variaciones por ambiente.

No hace falta que todos los archivos existan desde el día uno. Se pueden ir agregando cuando hagan falta. Lo importante es que el criterio quede definido desde ahora.

---

## Qué tipo de diferencias tendría `dev`

En un entorno de desarrollo, lo habitual es priorizar:

- visibilidad,
- velocidad para probar,
- facilidad de diagnóstico,
- y menor fricción.

Por eso, en `dev` podrían aparecer decisiones como:

- logs más detallados,
- endpoints técnicos más expuestos,
- configuraciones de infraestructura locales,
- integraciones simuladas,
- y valores útiles para experimentar sin tanta rigidez.

### Ejemplo conceptual

```yaml
logging:
  level:
    root: INFO
    com.novamarket: DEBUG

management:
  endpoints:
    web:
      exposure:
        include: "*"
```

Este tipo de configuración puede ser aceptable en desarrollo, pero no necesariamente en producción.

---

## Qué tipo de diferencias tendría `prod`

En producción, lo esperable es priorizar:

- estabilidad,
- control,
- seguridad,
- visibilidad útil pero no excesiva,
- y restricciones coherentes.

Por ejemplo:

- menor verbosidad de logs,
- exposición mucho más limitada de endpoints de actuator,
- conexiones a infraestructura real,
- flags de desarrollo desactivados,
- y configuración más prudente de componentes críticos.

Ejemplo conceptual:

```yaml
logging:
  level:
    root: WARN
    com.novamarket: INFO

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
```

Acá se ve claramente que el entorno no solo cambia valores. También cambia criterios operativos.

---

## Qué no debería resolverse con perfiles de forma desordenada

Los perfiles son útiles, pero también pueden convertirse en una trampa.

Un error bastante común es meter en ellos todo tipo de diferencias sin una estrategia clara.

Por ejemplo:

- comportamiento funcional distinto entre ambientes,
- reglas de negocio que cambian sin motivo sólido,
- servicios que en `dev` hacen una cosa y en `prod` otra completamente diferente,
- o configuraciones tan distintas que terminan volviendo irrelevante lo que se prueba localmente.

La enseñanza importante es esta:

**los perfiles deben expresar diferencias de entorno, no reescribir arbitrariamente el sistema**.

---

## Configuración operativa vs. secretos

Esta distinción merece insistencia porque es una de las más importantes del módulo.

### Configuración operativa

Es aquella que describe cómo corre el sistema.

Ejemplos:

- puertos,
- nombres de servicio,
- endpoints técnicos,
- flags de comportamiento,
- niveles de logging,
- perfiles,
- valores de tuning no sensibles.

### Secretos

Son datos cuyo acceso indebido compromete la seguridad o el control del sistema.

Ejemplos:

- contraseñas,
- tokens privados,
- claves,
- secretos de clientes OAuth,
- credenciales de acceso a infraestructura.

Aunque a veces ambos tipos de datos aparezcan juntos en la práctica, **conceptualmente no son lo mismo**.

Para este curso conviene dejar establecido que:

- la configuración operativa sí puede estar centralizada en Git,
- pero los secretos requieren un tratamiento más cuidadoso.

---

## Un ejemplo concreto con NovaMarket

Supongamos que en desarrollo trabajamos con:

- RabbitMQ local,
- Keycloak local,
- bases locales,
- y trazas visibles para pruebas.

Mientras que en producción podríamos tener:

- otra infraestructura,
- otras URLs,
- otros límites de exposición,
- otra configuración de logs,
- y mecanismos más estrictos de seguridad.

Nada de eso debería obligarnos a modificar el código del `order-service`, `inventory-service` o `api-gateway`.

Ese es precisamente uno de los beneficios más importantes de trabajar bien con configuración centralizada por entorno.

---

## Cómo mantener el repositorio ordenado

A medida que NovaMarket crezca, el repositorio de configuración también va a crecer.

Por eso conviene fijar algunas reglas desde temprano.

### Regla 1: nombres consistentes

Si el servicio se llama `order-service`, no debería aparecer como `orders`, `order`, `ord-service` o cualquier otra variante según el archivo.

### Regla 2: un lugar claro para lo compartido

Lo compartido no debe repetirse sin necesidad en cada archivo.

### Regla 3: diferencias de entorno explícitas

No conviene esconder decisiones importantes en configuraciones ambiguas o difíciles de rastrear.

### Regla 4: no usar el repositorio de configuración como mezcla de borradores

Si un archivo concentra valores viejos, pruebas a medias y propiedades comentadas sin criterio, deja de ser una fuente confiable.

### Regla 5: separar lo demostrativo de lo realmente sensible

En un curso podemos usar configuraciones pedagógicas, pero sin normalizar malas prácticas.

---

## Qué ventajas da esto más adelante en el roadmap

Esta clase no se agota en el módulo de configuración. También prepara el terreno para varios módulos futuros.

### Para Eureka

Los nombres y perfiles consistentes facilitan el registro y descubrimiento de servicios.

### Para Gateway

La configuración por entorno ayuda a definir rutas, filtros y seguridad sin ensuciar el código.

### Para observabilidad

Permite variar niveles de logs y exposición de métricas según el ambiente.

### Para resiliencia

Hace más fácil ajustar timeouts, retries o estrategias según el contexto.

### Para Docker y despliegue

Ayuda a levantar el sistema completo con comportamientos distintos en local y en escenarios más cercanos a producción.

---

## Cómo se ve el beneficio en el proyecto del curso

Recordemos que NovaMarket no es una colección de demos aisladas.

El objetivo es que el sistema crezca de forma coherente.

Con esta clase, ya podemos decir que la configuración centralizada del proyecto tiene una base mejor definida porque ahora:

- está respaldada por Git,
- puede estar protegida en un repositorio privado,
- puede expresar diferencias por ambiente,
- y evita mezclar todo en una sola capa confusa.

Eso puede parecer una mejora silenciosa, pero en arquitectura distribuida estas decisiones suelen ser las que más orden aportan cuando el proyecto empieza a madurar.

---

## Cierre

Trabajar con un repositorio privado y con una estrategia clara de entornos no es un detalle accesorio de Spring Cloud Config. Es parte del diseño serio de una arquitectura distribuida.

En NovaMarket, esta clase nos deja dos ideas estructurales importantes:

- la configuración centralizada debe tratarse como un recurso controlado,
- y los ambientes deben expresarse con un criterio claro, sin desordenar ni volver inseguro el sistema.

En la próxima clase vamos a cambiar de eje y empezar a entrar en uno de los temas más representativos de la arquitectura distribuida: **el descubrimiento de servicios**. A partir de ahí, NovaMarket empezará a dejar atrás la dependencia de direcciones fijas y a comportarse cada vez más como un ecosistema de microservicios real.
