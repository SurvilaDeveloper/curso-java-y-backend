---
title: "Transacciones y consistencia en operaciones complejas"
description: "Qué son las transacciones, por qué importan tanto en backend y cómo pensar consistencia cuando una operación modifica varias cosas relacionadas."
order: 65
module: "Operación y confiabilidad"
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
- auditoría
- soft delete
- arquitectura
- resiliencia
- integraciones externas

Eso ya te permite construir sistemas bastante serios.

Pero cuando una operación empieza a tocar varias cosas relacionadas al mismo tiempo, aparece una pregunta muy importante:

**¿cómo garantizás que el sistema no quede en un estado incoherente si algo falla a mitad de camino?**

Ahí entran las transacciones y la consistencia.

## Qué es una transacción

Una transacción es una unidad de trabajo que agrupa varias operaciones para que se comporten como un todo.

Dicho simple:

- o se aplican todas correctamente
- o no se aplica ninguna de forma parcial

## La idea general

Supongamos que querés crear una orden.

Esa operación podría implicar:

- guardar la orden
- guardar items
- descontar stock
- registrar movimiento de inventario
- dejar auditoría
- actualizar algún estado relacionado

Si una parte se guarda y otra falla, el sistema puede quedar roto o inconsistente.

La transacción ayuda a evitar eso.

## Qué problema resuelve

Resuelve situaciones como:

- se guardó la orden pero no los items
- se descontó stock pero no se creó la orden
- se registró pago pero no se actualizó estado
- se modificó una parte del sistema y otra quedó vieja
- un error técnico dejó datos a medio escribir

## Por qué esto importa tanto

Porque muchos bugs graves en sistemas de negocio no aparecen por una línea aislada, sino por operaciones complejas que quedan a medio camino.

Por ejemplo en:

- órdenes
- pagos
- stock
- usuarios y permisos
- facturación
- movimientos contables
- reservas
- workflows con varios pasos

## Consistencia

La consistencia es la propiedad de que los datos del sistema respeten las reglas esperadas del dominio y no queden en estados contradictorios.

Por ejemplo:

- una orden confirmada debería tener items válidos
- el stock no debería quedar negativo por error
- un pago aprobado debería reflejarse en el estado correcto
- un recurso borrado no debería seguir apareciendo activo en otro lado si eso rompe reglas

## Diferencia mental útil

Podés pensarlo así:

- transacción = mecanismo para agrupar cambios
- consistencia = resultado deseado de que el sistema no quede incoherente

## Ejemplo mental simple

Querés transferir dinero de una cuenta a otra.

Eso implica:

1. restar saldo a la cuenta A
2. sumar saldo a la cuenta B

Si hacés solo el paso 1 y el paso 2 falla, el sistema queda mal.

Por eso esa operación debería pensarse como una unidad.

## Qué significa “todo o nada”

No significa que literalmente el universo entero del sistema esté dentro de una misma transacción siempre.

Significa que el conjunto de operaciones que forman una unidad lógica debería comprometerse completo o revertirse si algo falla.

## ACID

Cuando se habla de transacciones, suele aparecer mucho la sigla ACID.

No hace falta memorizarla obsesivamente ahora, pero conviene conocer la idea general.

ACID resume propiedades clásicas de las transacciones:

- Atomicidad
- Consistencia
- Aislamiento
- Durabilidad

## Atomicidad

La operación se comporta como una unidad indivisible.

O todo ocurre o nada queda parcialmente aplicado.

## Consistencia

La transacción debería llevar el sistema de un estado válido a otro estado válido según las reglas.

## Aislamiento

Las transacciones concurrentes no deberían pisarse de forma desordenada.

## Durabilidad

Cuando la transacción se confirma correctamente, sus cambios no deberían perderse.

## Atomicidad: la más intuitiva para empezar

De estas ideas, la atomicidad suele ser la puerta más natural.

Es la intuición de:

**no quiero que una operación compleja quede a medias**

## Ejemplo de operación compleja

Caso:
crear una orden.

Imaginemos:

- guardar orden
- guardar items
- descontar stock

Si el stock falla por una excepción y la orden ya quedó persistida, puede haber un problema serio.

## Qué haría una transacción

Si todo eso está dentro de una transacción bien definida y ocurre un error, el sistema puede revertir los cambios ya hechos dentro de esa unidad.

## Spring y `@Transactional`

En Spring, una herramienta muy conocida para esto es:

```java
@Transactional
```

## Qué significa

Significa que el método o la operación se ejecuta dentro de una transacción.

A nivel conceptual:

- si todo sale bien, se confirma
- si ocurre una excepción relevante, se revierte

## Ejemplo simple

```java
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    @Transactional
    public void createOrder() {
        // guardar orden
        // guardar items
        // descontar stock
    }
}
```

## Qué expresa esto

Que el caso de uso `createOrder` no debería dejar efectos parciales si falla a mitad.

## Dónde conviene poner transacciones

En general, suele tener más sentido que las transacciones vivan en la capa de service o caso de uso, no en controllers.

## Por qué

Porque el service suele expresar mejor la unidad de negocio real.

El controller recibe HTTP.
El service entiende mejor la operación compuesta.

## Ejemplo mental

No interesa tanto transaccionar “el endpoint” como transaccionar:

- crear orden
- cancelar orden
- aprobar pago
- registrar usuario con ciertas relaciones
- actualizar estado y auditarlo de forma coherente

## Qué operaciones suelen ser candidatas claras

Suelen ser candidatas naturales las que:

- escriben varias cosas relacionadas
- dependen de reglas del dominio
- no deberían quedar a medias
- modifican estado importante

## Ejemplo conceptual con orden

```java
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public void createOrder(CreateOrderRequest request) {
        Order order = orderRepository.save(new Order(...));

        for (CreateOrderItemRequest item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

            if (product.getStock() < item.getQuantity()) {
                throw new IllegalStateException("Stock insuficiente");
            }

            product.setStock(product.getStock() - item.getQuantity());
            productRepository.save(product);

            orderItemRepository.save(new OrderItem(order.getId(), product.getId(), item.getQuantity()));
        }
    }
}
```

## Qué demuestra este ejemplo

Demuestra una unidad de negocio clara:

- crear orden
- validar stock
- descontar stock
- crear items

Si algo importante falla, esa operación no debería dejar cosas a medias.

## Qué pasaría sin transacción

Podría pasar algo como:

- se guarda la orden
- se guarda un item
- falla el segundo item
- el stock del primero ya se descontó
- el sistema queda parcialmente modificado

Eso puede ser muy difícil de arreglar después.

## Qué pasaría con una transacción bien aplicada

Si el error provoca rollback, la operación se revierte y el sistema no queda en ese estado intermedio.

## Rollback

Rollback significa revertir los cambios de la transacción cuando algo falla.

Es una idea central del tema.

## Qué eventos suelen disparar rollback

A nivel conceptual, cuando una operación falla de forma que no debería confirmarse, la transacción puede revertirse.

En Spring hay matices sobre tipos de excepción, pero para esta etapa lo importante es entender la lógica:

si la operación de negocio no puede completarse coherentemente, no querés confirmar cambios parciales.

## Consistencia de negocio vs consistencia técnica

Esto también conviene distinguirlo.

### Consistencia técnica

Que la base no quede a medias desde el punto de vista transaccional.

### Consistencia de negocio

Que el resultado respete reglas del dominio.

A veces una transacción técnica ayuda muchísimo, pero no resuelve por sí sola toda la consistencia de negocio si el flujo completo involucra sistemas externos o varios límites transaccionales.

## Qué significa eso

Que una transacción local es muy poderosa, pero no es magia universal para cualquier flujo distribuido.

## Límite de una transacción local

Una transacción local suele cubrir muy bien lo que pasa dentro de tu base de datos y tu contexto de persistencia.

Pero si el caso de uso involucra además:

- una API externa
- mensajería
- otro microservicio
- un pago externo

la consistencia se vuelve más compleja.

## Ejemplo mental

Supongamos:

1. guardás orden en tu base
2. llamás a una pasarela de pago externa
3. enviás evento a otro sistema

No todo eso necesariamente vive dentro de una única transacción local simple.

Ahí entran estrategias más avanzadas, como compensaciones o diseños más distribuidos.

## Qué conviene entender primero

Antes de ir a sagas o patrones distribuidos, conviene dominar muy bien la consistencia local dentro de una sola aplicación y una sola base.

Ese es el paso natural.

## Transacción no significa “meter todo adentro”

También conviene tener este criterio.

No conviene hacer métodos gigantes con veinte cosas irrelevantes metidas en una transacción enorme “por las dudas”.

Las transacciones también deben pensarse con cuidado.

## Por qué

Porque una transacción demasiado grande puede:

- durar mucho
- bloquear más de la cuenta
- complicar concurrencia
- meter lógica externa innecesaria
- degradar rendimiento

## Regla mental sana

Una transacción debería envolver una unidad de negocio coherente, no convertirse en un cajón enorme de cualquier cosa.

## Lecturas y escrituras

No todas las operaciones necesitan el mismo nivel de cuidado transaccional.

Por ejemplo:

- una lectura simple puede no necesitar una transacción explícita compleja
- una operación de escritura compuesta suele ser mucho más candidata

## Aislamiento y concurrencia

Otro tema importante es que a veces varias operaciones ocurren al mismo tiempo.

Por ejemplo:

- dos usuarios intentan comprar el último stock
- dos admins modifican el mismo recurso
- dos procesos actualizan el mismo saldo

Ahí no solo importa rollback.
También importa cómo se comportan operaciones concurrentes.

## Qué puede pasar sin cuidado

Podrían aparecer problemas como:

- lecturas inconsistentes
- actualizaciones perdidas
- stock incorrecto
- doble confirmación
- estados pisados

## No hace falta bajar a todos los niveles de aislamiento ahora

Pero sí conviene entender que la consistencia en operaciones concurrentes no se resuelve solo con “poner `@Transactional` y olvidarse”.

## Transacciones y auditoría

Esto conecta muy bien con la lección anterior.

Si una operación importante debe dejar auditoría, muchas veces conviene pensar si esa auditoría forma parte de la misma unidad coherente.

Por ejemplo:

- si se cambia el estado de una orden
- y también querés registrar el evento auditado

¿querés que exista una sin la otra?

Muchas veces no.

## Ejemplo mental

Si una orden cambió de estado pero la auditoría no se registró, quizás perdiste parte importante de trazabilidad.

En algunos casos querrás que ambas cosas vivan en una misma unidad coherente.

## Transacciones y soft delete

También conecta con soft delete.

Por ejemplo, si al eliminar lógicamente un recurso querés además:

- invalidar relaciones lógicas
- registrar auditoría
- actualizar visibilidad
- limpiar cierto estado asociado

puede convenirte tratar eso como una operación consistente.

## Transacciones y eventos

Acá aparece una sutileza importante.

Si dentro de una operación local además publicás un evento, tenés que pensar muy bien qué pasa si:

- la base confirma
- pero el evento no sale
- o el evento sale
- pero después la transacción local falla

Esto ya apunta a problemas más avanzados de consistencia entre base y mensajería.

No hace falta resolverlo todo ahora, pero sí entender que el borde existe.

## Qué operaciones suelen ser más delicadas

Especialmente:

- stock
- pagos
- reservas
- permisos
- movimientos contables
- estados que no deberían contradecirse

## Qué preguntas conviene hacerse

Para una operación compleja, conviene preguntarte:

1. ¿qué cambios forman una sola unidad lógica?
2. ¿qué pasa si falla el paso 2 de 4?
3. ¿quiero rollback completo?
4. ¿hay pasos externos que no viven en la misma transacción?
5. ¿qué estado sería inconsistente si algo queda a medias?

Estas preguntas valen muchísimo.

## Ejemplo de operación que sí parece una unidad clara

- crear orden
- guardar items
- descontar stock

## Ejemplo de operación más delicada y mixta

- crear orden
- cobrar externamente
- enviar email
- publicar evento
- generar factura externa

Acá ya empiezan a mezclarse límites diferentes y el diseño requiere más criterio.

## Qué no conviene hacer

No conviene:

- ignorar transacciones en operaciones complejas
- meter toda la app en una transacción eterna
- asumir que `@Transactional` resuelve cualquier consistencia distribuida
- olvidar concurrencia
- no pensar qué significa rollback en términos del dominio

## Buenas prácticas iniciales

## 1. Identificar unidades de negocio reales

Transaccionar casos de uso coherentes.

## 2. Poner transacciones en service o caso de uso

Suele ser más sano que en controllers.

## 3. No dejar operaciones importantes a medio camino

Ese es uno de los grandes objetivos.

## 4. Pensar rollback desde el punto de vista del dominio

No solo técnico.

## 5. Entender que integraciones externas complican la consistencia

Y que ahí hacen falta decisiones más avanzadas.

## Ejemplo conceptual de service más claro

```java
@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final AuditService auditService;

    public ProductService(ProductRepository productRepository, AuditService auditService) {
        this.productRepository = productRepository;
        this.auditService = auditService;
    }

    @Transactional
    public void updatePrice(Long productId, double newPrice, Long actorId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        double oldPrice = product.getPrice();
        product.setPrice(newPrice);

        productRepository.save(product);

        auditService.record(
                "PRODUCT_PRICE_UPDATED",
                "PRODUCT",
                productId.toString(),
                actorId,
                "USER",
                "before=" + oldPrice + ", after=" + newPrice
        );
    }
}
```

## Qué demuestra este ejemplo

Demuestra una unidad bastante razonable:

- cambiar precio
- persistir cambio
- dejar trazabilidad

Si una parte relevante falla, no querés una historia incompleta o un cambio parcial.

## Comparación con otros lenguajes

### Si venís de JavaScript

Probablemente ya viste operaciones donde varias escrituras necesitan mantenerse coherentes y donde un fallo a mitad de camino puede dejar desastres silenciosos. En Java y Spring Boot este tema aparece muchísimo, especialmente en sistemas con negocio serio, y suele modelarse muy claramente alrededor de services y transacciones.

### Si venís de Python

Puede recordarte a la necesidad de agrupar cambios relacionados para no dejar datos a medias. En Java, el ecosistema Spring hace este tema muy visible y muy importante, especialmente cuando las operaciones cruzan varias entidades y reglas del dominio.

## Errores comunes

### 1. No usar transacciones donde claramente hacen falta

Eso deja al sistema expuesto a inconsistencias.

### 2. Poner transacciones enormes sin criterio

Eso también trae problemas.

### 3. Asumir que una transacción local cubre cualquier integración externa

No es así.

### 4. Ignorar concurrencia

La consistencia no es solo rollback.

### 5. No pensar qué cambios forman una unidad lógica real

Ese análisis es central.

## Mini ejercicio

Tomá una operación de tu proyecto integrador, por ejemplo:

- crear orden
- cambiar estado de orden
- actualizar stock
- registrar usuario con roles

Y definí:

1. qué pasos forman la unidad de negocio
2. qué cosas no deberían quedar parciales
3. si conviene una transacción
4. qué pasaría si falla un paso intermedio
5. si hay alguna integración externa que complique la consistencia

## Ejemplo posible

Caso:
crear orden

- pasos:
  - guardar orden
  - guardar items
  - descontar stock
- no debería quedar parcial:
  - orden sin items
  - stock descontado sin orden válida
- conviene transacción: sí
- integración externa delicada:
  - pago o email, si aplica

## Resumen

En esta lección viste que:

- una transacción agrupa operaciones para que se comporten como una unidad
- esto ayuda a evitar estados parciales e inconsistentes
- la consistencia es una preocupación central en operaciones de negocio complejas
- Spring permite expresar esto con `@Transactional`
- conviene pensar transacciones en la capa de service o caso de uso
- las operaciones distribuidas o con servicios externos requieren un análisis todavía más cuidadoso

## Siguiente tema

La siguiente natural es **patrón Saga y consistencia en sistemas distribuidos**, porque después de entender bien la consistencia local con transacciones, el siguiente paso muy valioso es ver qué pasa cuando la operación cruza varios servicios o límites donde una sola transacción local ya no alcanza.
