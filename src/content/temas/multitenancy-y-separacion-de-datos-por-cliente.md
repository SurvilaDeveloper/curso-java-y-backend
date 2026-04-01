---
title: "Multitenancy y separación de datos por cliente"
description: "Qué es multitenancy, qué modelos existen y cómo pensar la separación de datos, seguridad y diseño cuando una misma plataforma sirve a múltiples clientes."
order: 61
module: "Arquitectura y escalabilidad"
level: "intermedio"
draft: false
---

## Introducción

Hasta ahora ya recorriste una parte muy amplia del backend con Java y Spring Boot:

- controllers
- services
- DTOs
- validaciones
- seguridad
- persistencia
- testing
- observabilidad
- cache
- arquitectura
- integraciones externas
- resiliencia
- versionado de API

Eso ya te permite construir sistemas bastante serios.

Pero cuando una plataforma deja de servir a un único contexto y empieza a servir a varios clientes u organizaciones, aparece una pregunta muy importante:

**¿cómo separás bien los datos y el comportamiento de cada cliente dentro de un mismo sistema?**

Ahí entra multitenancy.

## Qué es multitenancy

Multitenancy significa que una misma aplicación o plataforma sirve a múltiples clientes, organizaciones o contextos independientes, llamados tenants.

Dicho simple:

una sola plataforma puede atender a varios “clientes” lógicos, pero cada uno necesita cierto nivel de separación respecto de los demás.

## Qué es un tenant

Un tenant es una unidad lógica separada dentro del sistema.

Según el negocio, puede representar por ejemplo:

- una empresa
- una tienda
- una organización
- una cuenta corporativa
- una institución
- un cliente empresarial

## La idea general

Imaginá una plataforma SaaS donde varias empresas usan el mismo producto.

Todas usan la misma aplicación, pero no deberían mezclarse cosas como:

- usuarios
- órdenes
- productos
- facturas
- reportes
- configuraciones
- permisos
- branding
- métricas

Cada empresa necesita ver “su mundo” y no el de otra.

## Qué problema resuelve multitenancy

Multitenancy resuelve o intenta resolver la necesidad de:

- compartir una plataforma entre varios clientes
- mantener separación lógica o física entre datos
- administrar usuarios y permisos por cliente
- escalar el sistema sin crear una aplicación totalmente separada para cada caso

## Por qué esto importa tanto

Porque si el sistema está mal diseñado en este punto, podés terminar con problemas muy graves como:

- mezcla de datos entre clientes
- fallos de seguridad
- consultas incorrectas
- configuración compartida por error
- reportes contaminados
- dificultades de escalado

Es un tema muy serio.

## Qué cambia respecto de una app de un solo cliente

En una app simple de un solo contexto, muchas veces no tenés que pensar demasiado en aislamiento entre clientes.

En multitenancy, en cambio, tenés que pensar explícitamente:

- cómo se identifica el tenant
- cómo se filtran los datos
- cómo se protege el acceso
- cómo se separan configuraciones
- cómo se modelan usuarios y permisos
- cómo se migra y opera el sistema

## Modelos típicos de multitenancy

No hay una sola forma de implementarlo.

A nivel conceptual, hay varios modelos comunes.

Los más conocidos suelen ser:

- base de datos compartida, esquema compartido
- base de datos compartida, esquema por tenant
- base de datos separada por tenant

## 1. Base compartida, esquema compartido

Todos los tenants usan las mismas tablas, pero cada registro lleva una referencia al tenant.

Por ejemplo:

- tabla `orders`
- columna `tenant_id`

Y cada consulta debe respetar ese aislamiento.

## Ejemplo mental

Tabla `orders`:

| id | tenant_id | total |
|----|-----------|-------|
| 1  | 10        | 500   |
| 2  | 12        | 700   |
| 3  | 10        | 300   |

Si el tenant actual es 10, solo debería ver filas con `tenant_id = 10`.

## Qué ventaja tiene este modelo

- suele ser más simple de operar
- puede ser más eficiente en infraestructura
- es común en muchos sistemas SaaS

## Qué desventaja tiene

- exige muchísimo cuidado en seguridad y filtrado
- un error en consultas puede mezclar datos de tenants distintos
- el aislamiento es más lógico que físico

## 2. Base compartida, esquema por tenant

Todos los tenants usan la misma base, pero cada uno tiene su propio esquema.

Por ejemplo:

- `tenant_a.orders`
- `tenant_b.orders`

## Qué ventaja tiene

- mayor aislamiento que compartir el mismo esquema
- sigue habiendo cierta centralización operativa

## Qué desventaja tiene

- más complejidad operativa
- más manejo de migraciones y esquemas
- puede crecer en complejidad si hay muchísimos tenants

## 3. Base separada por tenant

Cada tenant tiene su propia base de datos.

## Qué ventaja tiene

- aislamiento fuerte
- más seguridad y separación operativa
- a veces facilita ciertos requisitos empresariales

## Qué desventaja tiene

- más costo operativo
- más complejidad de despliegue, migraciones y administración
- más trabajo de infraestructura

## Qué modelo elegir

Depende de cosas como:

- cantidad de tenants
- sensibilidad de los datos
- requisitos regulatorios
- costo operativo
- nivel de aislamiento requerido
- complejidad aceptable

No hay respuesta universal.

## Qué suele pasar en muchos sistemas

Muchos sistemas empiezan con:

- base compartida
- esquema compartido
- `tenant_id`

porque es más directo de construir.

Pero eso exige mucha disciplina.

## Identidad del tenant

Una pregunta central es:

**¿cómo sabe el sistema cuál es el tenant actual?**

Esa identidad puede venir, por ejemplo, de:

- subdominio
- token JWT
- header
- contexto del usuario autenticado
- ruta
- configuración de sesión

## Ejemplo con subdominio

```text
empresa-a.miapp.com
empresa-b.miapp.com
```

Ahí el subdominio puede ayudar a identificar el tenant.

## Ejemplo con JWT

El token podría incluir algo como:

```json
{
  "sub": "gabriel",
  "tenantId": 10,
  "roles": ["ADMIN"]
}
```

Y entonces el backend reconstruye el tenant actual desde la autenticación.

## Por qué esto es tan importante

Porque toda la seguridad del aislamiento depende muchísimo de identificar bien el tenant en cada request.

## `tenant_id` como parte del modelo

En un modelo de esquema compartido, suele ser muy común que varias entidades tengan un campo así:

```java
private Long tenantId;
```

Por ejemplo:

- `User`
- `Order`
- `Product`
- `Category`
- `Invoice`

según el tipo de sistema.

## Qué implica esto

Que el tenant deja de ser un detalle accesorio y pasa a ser parte fundamental del modelo del sistema.

## Ejemplo conceptual

```java
public class Product {
    private Long id;
    private Long tenantId;
    private String name;
    private double price;

    public Product(Long id, Long tenantId, String name, double price) {
        this.id = id;
        this.tenantId = tenantId;
        this.name = name;
        this.price = price;
    }

    public Long getId() {
        return id;
    }

    public Long getTenantId() {
        return tenantId;
    }

    public String getName() {
        return name;
    }

    public double getPrice() {
        return price;
    }
}
```

## Qué riesgo aparece acá

Que si una consulta olvida filtrar por `tenantId`, podrías terminar mostrando o modificando datos de otro tenant.

Ese es uno de los riesgos más delicados del modelo compartido.

## Seguridad y multitenancy

Multitenancy no es solo una decisión de persistencia.

También es una decisión de seguridad.

Porque no se trata solo de “guardar tenant_id” sino de garantizar que:

- un usuario del tenant A no vea datos del tenant B
- un admin de un tenant no administre otro tenant sin permiso
- las queries, endpoints y reportes respeten aislamiento

## Qué debe cruzarse siempre

En sistemas multitenant, suelen cruzarse permanentemente estas ideas:

- autenticación
- autorización
- tenant actual
- filtros de consulta
- reglas del dominio
- reporting
- logs y observabilidad

## Ejemplo mental de error grave

Supongamos que hacés esto:

```java
@GetMapping("/orders/{id}")
public OrderResponseDto getOrder(@PathVariable Long id) {
    return orderService.getById(id);
}
```

Y adentro del service o repository buscás solo por `id`.

Si no cruzás eso con el tenant actual, podrías devolver una orden de otro cliente.

Eso es gravísimo.

## Consulta segura

En un sistema multitenant con esquema compartido, muchas veces conviene que la búsqueda considere tenant + recurso.

Ejemplo conceptual:

```java
Optional<Order> findByIdAndTenantId(Long id, Long tenantId);
```

## Qué expresa esto

Que un recurso no se considera “accesible” solo por su id, sino por pertenencia al tenant correcto.

## Relación con Spring Security

Este tema conecta muy fuerte con seguridad.

Muchas veces el tenant actual vive asociado al usuario autenticado y se extrae de:

- claims del JWT
- detalles del principal autenticado
- contexto de seguridad

Eso permite que el resto del backend sepa en qué tenant está operando.

## Contexto del tenant

En sistemas más avanzados suele existir algún mecanismo para tener disponible el tenant actual durante la request.

Por ejemplo:

- un resolver
- un filtro
- un contexto por request
- integración con seguridad

No hace falta profundizar una implementación exacta ahora, pero sí entender la necesidad.

## Qué no conviene hacer

No conviene confiar en que el frontend mande libremente un `tenantId` y listo.

Ese dato debe validarse y relacionarse con la identidad/auth del usuario.

Si no, un atacante podría intentar forzar acceso a otro tenant.

## Multitenancy y repositories

En un diseño sano, el tenant debería formar parte de cómo se consultan o escriben datos.

Ejemplo:

```java
Page<Product> findByTenantIdAndActiveTrue(Long tenantId, Pageable pageable);
```

## Qué ventaja tiene esto

Que el aislamiento queda expresado directamente en la consulta.

## Multitenancy y casos de uso

También conviene que los casos de uso reciban o conozcan el tenant actual de forma explícita o bien resuelta por contexto.

Por ejemplo:

```java
public interface CreateProductUseCase {
    ProductResult createProduct(Long tenantId, CreateProductCommand command);
}
```

## Qué expresa esto

Que el tenant forma parte del caso de uso, no un dato accidental olvidable.

## Multitenancy y datos compartidos/globales

No todo tiene por qué estar particionado por tenant.

A veces puede haber datos globales, por ejemplo:

- catálogo público base
- lista de países
- monedas
- configuraciones del sistema
- features globales

Eso obliga a pensar qué es:

- tenant-specific
- global/shared

## Qué riesgo hay acá

Si mezclás mal estos conceptos, después las reglas de acceso se vuelven confusas.

Conviene modelarlo con bastante claridad.

## Multitenancy y configuración por cliente

Muchas plataformas también requieren que cada tenant tenga su propia configuración.

Por ejemplo:

- branding
- moneda
- idioma
- reglas fiscales
- preferencias operativas
- integraciones habilitadas

Eso vuelve al tenant algo bastante más profundo que un simple filtro de datos.

## Multitenancy y observabilidad

Esto también se conecta con logs, métricas y observabilidad.

Porque muchas veces conviene poder ver:

- errores por tenant
- consumo por tenant
- latencia por tenant
- actividad por tenant

Siempre con cuidado de no exponer datos indebidos.

## Multitenancy y cache

También conecta mucho con cache.

Si usás cache y no construís bien las claves incluyendo tenant cuando corresponde, podrías mezclar datos entre clientes.

Por ejemplo, una clave como:

```text
products::15
```

quizá no alcance si el producto 15 existe en más de un tenant o si la vista depende del contexto del tenant.

Tal vez necesitarías algo como:

```text
tenant:10:products::15
```

## Multitenancy y migraciones

Si tenés:

- esquema compartido
- esquema por tenant
- base por tenant

la forma de aplicar migraciones cambia bastante.

Especialmente en modelos con más aislamiento físico, Flyway y la operación de migraciones se vuelven aún más delicados.

## Multitenancy y despliegue

También impacta operación y despliegue.

Porque según el modelo elegido cambian bastante cosas como:

- aprovisionamiento
- configuración
- escalado
- backups
- restauración
- monitoreo
- costo de infraestructura

## Ventajas del enfoque multitenant

## 1. Plataforma compartida

Una sola aplicación puede servir a muchos clientes.

## 2. Eficiencia operativa

En ciertos modelos, la infraestructura puede ser más eficiente que desplegar una app totalmente distinta por cliente.

## 3. Evolución centralizada

Podés mejorar la plataforma y beneficiar a varios tenants a la vez.

## Desafíos del enfoque multitenant

## 1. Seguridad

El aislamiento debe ser impecable.

## 2. Complejidad de diseño

Todo el sistema debe pensar el tenant correctamente.

## 3. Operación más delicada

Depende mucho del modelo elegido.

## 4. Riesgo de mezcla de datos

Especialmente en modelos compartidos.

## Ejemplo conceptual simple

Supongamos una API de productos multitenant.

### Entidad

```java
public class Product {
    private Long id;
    private Long tenantId;
    private String name;
    private double price;

    public Product(Long id, Long tenantId, String name, double price) {
        this.id = id;
        this.tenantId = tenantId;
        this.name = name;
        this.price = price;
    }

    public Long getId() {
        return id;
    }

    public Long getTenantId() {
        return tenantId;
    }

    public String getName() {
        return name;
    }

    public double getPrice() {
        return price;
    }
}
```

### Repository

```java
public interface ProductRepository {
    Optional<Product> findByIdAndTenantId(Long id, Long tenantId);
    List<Product> findByTenantId(Long tenantId);
}
```

### Caso de uso

```java
public interface GetProductUseCase {
    ProductResult getById(Long tenantId, Long productId);
}
```

## Qué demuestra esto

Que el tenant se vuelve parte explícita de la lógica del sistema.

## Cuándo conviene estudiar este tema

Aunque no todos los proyectos personales necesitan multitenancy, es muy valioso entenderlo porque muestra una capa mucho más madura de diseño.

Te obliga a pensar con mucha más precisión sobre:

- seguridad
- aislamiento
- arquitectura
- operación
- contratos del sistema

## Qué no conviene hacer

No conviene meter multitenancy “porque suena enterprise” si el proyecto no lo necesita.

Pero sí conviene entender el problema y sus modelos, porque aparece muchísimo en SaaS, plataformas B2B y productos compartidos por múltiples organizaciones.

## Buenas prácticas iniciales

## 1. Elegir explícitamente el modelo de aislamiento

No dejarlo ambiguo.

## 2. Tratar el tenant como parte central del sistema

No como un detalle suelto.

## 3. Cruzar seguridad, consultas y tenant correctamente

El aislamiento depende de eso.

## 4. Ser extremadamente cuidadoso con cache, logs y reporting

Ahí también puede haber mezcla indebida.

## 5. No confiar ciegamente en datos enviados por cliente para determinar tenant

Eso debe integrarse bien con autenticación y autorización.

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede recordarte a SaaS multiempresa o plataformas B2B donde varias organizaciones comparten la misma app. En Java y Spring Boot el problema es el mismo, pero suele abordarse con bastante énfasis en tipado, seguridad, repositorios y diseño explícito de acceso a datos.

### Si venís de Python

Puede parecerse al diseño de aplicaciones multicliente donde el aislamiento entre organizaciones es crítico. En Java, este tema suele sentirse muy natural dentro de sistemas empresariales y obliga a pensar con bastante profundidad en arquitectura, persistencia y seguridad.

## Errores comunes

### 1. Olvidar filtrar por tenant en alguna consulta

Eso puede ser gravísimo.

### 2. Confiar en tenantId enviado por el cliente sin validación fuerte

Eso abre puertas peligrosas.

### 3. No pensar cómo afecta multitenancy a cache, logs o métricas

También ahí se pueden mezclar datos.

### 4. Elegir un modelo de aislamiento sin considerar operación y seguridad

La decisión no es solo técnica local.

### 5. Tratar el tenant como un campo más y no como una dimensión arquitectónica

Eso suele explotar después.

## Mini ejercicio

Pensá un proyecto SaaS simple, por ejemplo:

- gestor de tareas para empresas
- sistema de reservas para gimnasios
- panel de inventario para múltiples tiendas

Y definí:

1. qué sería un tenant
2. qué modelo elegirías:
   - esquema compartido
   - esquema por tenant
   - base por tenant
3. cómo identificarías al tenant actual
4. qué datos serían específicos por tenant
5. qué datos serían globales
6. qué riesgo de mezcla de datos te preocuparía más

## Ejemplo posible

Sistema:
gestor de inventario para múltiples tiendas

- tenant = tienda
- modelo = base compartida, esquema compartido
- identificación = `tenantId` dentro del JWT
- datos por tenant:
  - productos
  - stock
  - órdenes
  - usuarios
- datos globales:
  - países
  - monedas
- riesgo principal:
  - consultas o cache sin filtro correcto por tenant

## Resumen

En esta lección viste que:

- multitenancy significa servir a múltiples clientes o contextos dentro de una misma plataforma
- existen distintos modelos de aislamiento con ventajas y costos distintos
- el tenant debe tratarse como una dimensión central del sistema
- seguridad, persistencia, cache, observabilidad y operación se ven muy afectadas por esta decisión
- entender multitenancy ayuda mucho a pensar sistemas SaaS y plataformas más avanzadas

## Siguiente tema

La siguiente natural es **búsqueda y filtrado avanzado**, porque después de profundizar bastante en arquitectura, contratos, resiliencia y multitenancy, otro paso muy valioso en APIs reales es aprender a ofrecer búsquedas y filtros más expresivos y eficientes.
