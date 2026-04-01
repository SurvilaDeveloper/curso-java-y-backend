---
title: "Cómo funciona @Transactional y por qué es tan importante para mantener consistencia"
description: "Entender qué significa una transacción en Spring Boot, cómo funciona @Transactional y por qué resulta clave cuando varias operaciones sobre la base de datos deben confirmarse o revertirse como una sola unidad."
order: 47
module: "Persistencia con Spring Data JPA"
level: "base"
draft: false
---

En los temas anteriores viste cómo:

- modelar entidades
- usar repositories con Spring Data JPA
- hacer consultas derivadas y con `@Query`
- paginar resultados
- modelar relaciones entre entidades
- evitar exponer entidades relacionadas sin criterio

Eso ya te da una base muy buena para trabajar con persistencia.

Pero cuando una aplicación empieza a hacer operaciones reales de negocio, aparece una pregunta crucial:

> ¿qué pasa si una operación necesita tocar varias cosas en la base y algo falla en el medio?

Por ejemplo:

- crear un pedido y además descontar stock
- registrar un pago y actualizar el estado del pedido
- crear un usuario y guardar también su perfil inicial
- mover dinero entre dos cuentas
- eliminar una categoría y reacomodar otras referencias

En todos esos casos, no alcanza con que “cada operación individual funcione”.
Muchas veces necesitás que el conjunto se comporte como una sola unidad.

Ahí entra una idea central de persistencia y consistencia:

**la transacción**

Y en Spring, una de las formas más importantes de trabajar con esto es `@Transactional`.

Este tema es clave porque te ayuda a pasar de operaciones aisladas a flujos de persistencia más serios, donde importa muchísimo que el sistema no quede en un estado intermedio o incoherente si algo falla.

## Qué problema resuelve una transacción

Imaginá este caso:

1. se crea un pedido
2. se descuenta stock de varios productos
3. se registra una auditoría
4. se actualiza el total

Ahora supongamos que:

- el pedido se guardó
- parte del stock se descontó
- pero luego ocurre una excepción antes de terminar el flujo

La pregunta es:

> ¿querés que una parte quede guardada y otra no?

En muchos casos, la respuesta es claramente **no**.

Porque eso dejaría la base en un estado inconsistente.

Por ejemplo:

- pedido creado pero stock no actualizado del todo
- stock descontado pero pedido no confirmado
- pago registrado pero pedido sin cambio de estado
- parte de la operación sí y parte no

Ese tipo de estado parcial suele ser muy peligroso desde el punto de vista del negocio.

## La idea general de una transacción

Podés pensar una transacción así:

> un grupo de operaciones que deben confirmarse juntas o revertirse juntas.

Eso significa que, idealmente:

- si todo sale bien, se confirma todo
- si algo falla en el medio, se deshace todo lo que estaba dentro de esa unidad

Esta idea es una de las bases más importantes de cualquier sistema que trabaja seriamente con persistencia.

## Qué significa “confirmarse” o “revertirse”

### Confirmarse
Significa que los cambios quedan aplicados definitivamente en la base.

### Revertirse
Significa que, si algo falló antes de completar la operación correctamente, los cambios no deberían quedar parcialmente persistidos como si nada hubiera pasado.

A esa reversión suele llamársela **rollback**.

Y a la confirmación final se la suele llamar **commit**.

## Un ejemplo del problema sin transacción

Supongamos un service así:

```java
import org.springframework.stereotype.Service;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;

    public PedidoService(PedidoRepository pedidoRepository, ProductoRepository productoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
    }

    public void crearPedido() {
        Pedido pedido = new Pedido();
        pedido.setNumero("P-001");
        pedidoRepository.save(pedido);

        Producto producto = productoRepository.findById(1L)
                .orElseThrow(() -> new ProductoNoEncontradoException("No existe el producto"));

        producto.setStock(producto.getStock() - 1);
        productoRepository.save(producto);

        throw new RuntimeException("Falló algo después");
    }
}
```

Si no hubiera un manejo transaccional correcto, podrías terminar con una situación problemática:

- el pedido se guardó
- el stock cambió
- pero la operación completa en realidad no debería haberse considerado exitosa

Eso rompe la coherencia del flujo.

## Qué aporta `@Transactional`

`@Transactional` le dice a Spring que cierta operación debe ejecutarse dentro de un contexto transaccional.

Ejemplo:

```java
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;

    public PedidoService(PedidoRepository pedidoRepository, ProductoRepository productoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
    }

    @Transactional
    public void crearPedido() {
        Pedido pedido = new Pedido();
        pedido.setNumero("P-001");
        pedidoRepository.save(pedido);

        Producto producto = productoRepository.findById(1L)
                .orElseThrow(() -> new ProductoNoEncontradoException("No existe el producto"));

        producto.setStock(producto.getStock() - 1);
        productoRepository.save(producto);

        throw new RuntimeException("Falló algo después");
    }
}
```

La idea general es:

- todo lo que ocurre dentro de este método forma parte de una misma unidad transaccional
- si algo falla de una forma relevante, Spring puede hacer rollback
- los cambios no deberían quedar parcialmente aplicados como si la operación hubiese terminado bien

## Cómo leer `@Transactional`

Podés leerlo así:

> esta operación no debería pensarse como una suma de pasos sueltos, sino como una única unidad consistente de trabajo contra la base de datos.

Eso es exactamente lo que hace tan importante a esta anotación.

## Un ejemplo más realista: crear pedido y descontar stock

```java
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;

    public PedidoService(PedidoRepository pedidoRepository, ProductoRepository productoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
    }

    @Transactional
    public void crearPedido(Long productoId, int cantidad) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new ProductoNoEncontradoException("No existe el producto " + productoId));

        if (producto.getStock() < cantidad) {
            throw new StockInsuficienteException("No hay stock suficiente");
        }

        Pedido pedido = new Pedido();
        pedido.setNumero("P-001");
        pedidoRepository.save(pedido);

        producto.setStock(producto.getStock() - cantidad);
        productoRepository.save(producto);
    }
}
```

Acá la intuición correcta es:

- o se crea el pedido y se descuenta stock correctamente
- o no debería persistirse ninguna de las dos cosas de forma parcial

## Por qué esto es tan importante

Porque muchas reglas de negocio no se pueden expresar bien si permitís que el sistema quede a mitad de camino.

Por ejemplo:

- un pago no debería quedar “medio aplicado”
- un movimiento de stock no debería quedar cortado a la mitad
- una operación financiera no debería actualizar solo una de dos cuentas
- un alta compleja no debería dejar datos huérfanos o incompletos

La transacción protege justamente esa consistencia.

## Un ejemplo clásico: transferencia entre cuentas

Este es uno de los ejemplos más didácticos de transacciones.

Supongamos:

1. restás saldo de una cuenta
2. sumás saldo a otra cuenta

Si el primer paso se guarda y el segundo falla, el sistema queda roto.

Por eso ambos pasos deberían vivir dentro de la misma transacción.

```java
@Transactional
public void transferir(Cuenta origen, Cuenta destino, double monto) {
    origen.setSaldo(origen.getSaldo() - monto);
    cuentaRepository.save(origen);

    if (monto > 1000000) {
        throw new RuntimeException("Falló la transferencia");
    }

    destino.setSaldo(destino.getSaldo() + monto);
    cuentaRepository.save(destino);
}
```

La intuición correcta es muy clara:

- o la transferencia ocurre completa
- o no ocurre en absoluto

## Qué significa rollback

Rollback significa, conceptualmente:

> deshacer los cambios de la transacción porque la operación no pudo completarse correctamente.

No tenés que imaginarlo como “ir borrando a mano línea por línea”.
Lo importante es entender el efecto lógico:

- la operación no se consolida
- la base no debería quedar como si una parte hubiera salido bien y la otra no

## Qué significa commit

Commit significa:

> confirmar definitivamente los cambios de la transacción porque todo terminó correctamente.

O sea:

- no hubo error que obligue a revertir
- la unidad de trabajo se considera exitosa
- los cambios quedan persistidos

## Una idea muy sana para recordar

Podés resumirlo así:

- **commit** → todo salió bien, confirmar
- **rollback** → algo falló, revertir

Esa pareja de conceptos es fundamental.

## Dónde suele ponerse `@Transactional`

En muchísimos proyectos, `@Transactional` suele ponerse en la capa **service**.

Eso tiene mucho sentido porque la capa service es la que normalmente coordina:

- varios repositories
- varias reglas de negocio
- varios pasos de una operación
- decisiones que forman una unidad coherente

Es decir, el service suele ser el lugar natural donde se define el alcance de una transacción del caso de uso.

## Por qué no suele ser ideal ponerla en cualquier lado

### En controller
No suele ser el lugar ideal porque el controller debería estar más enfocado en HTTP, no en definir unidades transaccionales del negocio.

### En repository
Tampoco suele ser el lugar principal para expresar la unidad completa del caso de uso, porque el repository está más enfocado en acceso a datos puntual.

La transacción suele tener más sentido donde se coordinan varios pasos significativos del flujo.

## Un buen patrón mental

Podés pensar así:

- controller → recibe request y devuelve response
- service → decide el flujo y la unidad transaccional
- repository → ejecuta acceso a datos dentro de ese flujo

Ese patrón encaja muy bien con `@Transactional`.

## Qué pasa si dentro del método todo sale bien

Si no ocurre ninguna excepción que invalide la operación, la transacción puede completarse correctamente y terminar en commit.

Eso significa que todos los cambios hechos dentro de esa unidad quedan confirmados.

Por ejemplo:

```java
@Transactional
public void altaCompleta() {
    // guardar entidad A
    // guardar entidad B
    // actualizar entidad C
    // todo correcto
}
```

Si nada falla, la operación completa se consolida.

## Qué pasa si algo falla en el medio

Si ocurre una excepción relevante durante la operación, la intención de la transacción es que el sistema no confirme un estado parcial.

Por ejemplo:

```java
@Transactional
public void altaCompleta() {
    // guardar entidad A
    // guardar entidad B
    throw new RuntimeException("falló");
}
```

La operación debería revertirse para que no quede A guardada como si el flujo completo hubiera terminado bien.

## Un ejemplo de creación doble

Supongamos que al registrar un usuario querés:

- crear el usuario
- crear su perfil inicial

```java
@Transactional
public void registrarUsuario(RegistroUsuarioRequest request) {
    Usuario usuario = new Usuario();
    usuario.setNombre(request.getNombre());
    usuario.setEmail(request.getEmail());
    usuarioRepository.save(usuario);

    Perfil perfil = new Perfil();
    perfil.setUsuario(usuario);
    perfil.setBiografia("Perfil inicial");
    perfilRepository.save(perfil);
}
```

Acá tiene bastante sentido que ambos pasos formen parte de una misma unidad.

No querés un usuario creado sin perfil inicial si el caso de uso exige ambas cosas juntas.

## Qué relación tiene esto con reglas de negocio

Muy fuerte.

Muchas reglas no se tratan solo de “validar campos”.
También se tratan de mantener el sistema consistente frente a operaciones de varias etapas.

Ahí `@Transactional` deja de ser una cuestión puramente técnica y se vuelve muy ligada al negocio real.

## Un ejemplo con varios repositories

Ese es uno de los escenarios más típicos.

```java
@Transactional
public void procesarPedido(...) {
    pedidoRepository.save(...);
    stockRepository.save(...);
    auditoriaRepository.save(...);
}
```

El punto no es cuántos repositories participen.
El punto es que el caso de uso exige que sus cambios formen una unidad coherente.

## Una aclaración importante: transacción no significa “solo porque hay muchos pasos”

No toda operación de varios pasos necesita necesariamente una transacción amplia.
Y tampoco toda transacción tiene que ser gigantesca.

La pregunta correcta no es:

- “¿hay más de una línea?”

La pregunta correcta es:

> ¿estos cambios deben confirmarse o revertirse juntos para mantener coherencia?

Esa es la verdadera brújula.

## Un ejemplo donde sí parece importante

- crear pedido
- descontar stock
- actualizar total
- dejar auditoría

Claramente suena como una unidad.

## Un ejemplo donde quizá la decisión merece más análisis

- guardar algo principal
- disparar un proceso de notificación secundaria
- registrar un evento no crítico

No todo necesariamente tiene el mismo peso transaccional.
Más adelante vas a pensar mucho mejor estas fronteras.

## Qué relación tiene esto con excepciones de negocio

Muy buena.

Si dentro de un método transaccional lanzás una excepción de negocio porque el flujo no puede completarse, eso puede ser exactamente la señal que determina que no debe confirmarse la operación.

Por ejemplo:

```java
@Transactional
public void crearPedido(Long productoId, int cantidad) {
    Producto producto = productoRepository.findById(productoId)
            .orElseThrow(() -> new ProductoNoEncontradoException("No existe el producto"));

    if (producto.getStock() < cantidad) {
        throw new StockInsuficienteException("No hay stock suficiente");
    }

    // seguir con la operación
}
```

Acá la excepción no es solo un mensaje.
También puede formar parte de la lógica que evita consolidar una operación inválida.

## Qué todavía no estás viendo en profundidad

Este tema es introductorio y conceptual.

Todavía no estás entrando fuerte en cosas como:

- niveles de propagación
- isolation
- transacciones anidadas
- readOnly
- excepciones checked vs unchecked en detalle
- flush
- diferencias finas entre momento de escritura y momento de confirmación

Todo eso existe y puede importar mucho más adelante.

Pero primero conviene tener una intuición firme de para qué sirve una transacción y por qué `@Transactional` es tan importante.

## Qué significa “mantener consistencia”

Es una expresión que aparece mucho, pero conviene hacerla bien concreta.

Mantener consistencia significa evitar que el sistema quede en estados incoherentes como:

- pedido creado sin stock ajustado
- stock descontado sin pedido creado
- saldo restado sin saldo acreditado
- usuario creado sin datos mínimos asociados cuando el caso exige ambas cosas
- operación de negocio “a medias”

La transacción protege justamente contra ese tipo de escenarios.

## Un ejemplo conceptual de inconsistencia

Sin transacción:

1. guardaste el pedido
2. explotó el descuento de stock

Resultado:
- pedido existe
- stock no refleja lo sucedido

Eso es un estado difícil de justificar desde el negocio.

Con transacción:
- o quedan ambas cosas
- o no queda ninguna

Eso es muchísimo más sano.

## Una muy buena pregunta para saber si conviene `@Transactional`

Podés preguntarte:

- ¿esta operación toca varias cosas persistentes relacionadas?
- ¿si algo falla en el medio, sería malo que la mitad quede guardada?
- ¿el negocio espera que todo esto suceda como una unidad?
- ¿tengo un caso de uso con varios pasos que deben mantenerse coherentes?

Si la respuesta es sí, hay una buena chance de que la transacción sea importante.

## Qué relación tiene esto con el repository

El repository te da operaciones como:

- `save`
- `findById`
- `deleteById`

Pero esas operaciones, por sí solas, no expresan necesariamente la unidad completa del caso de uso.

La transacción vive en un nivel más alto:
el del flujo que combina varias de esas operaciones.

Por eso encaja tan bien en la capa service.

## Qué relación tiene esto con el controller

El controller no suele ser el mejor lugar para pensar consistencia transaccional del negocio.

El controller debería estar más enfocado en:

- recibir la request
- delegar
- devolver la response

La pregunta “esto debe confirmarse todo junto o revertirse todo junto” suele pertenecer mucho más al caso de uso que a la capa web.

## Un ejemplo sano de arquitectura

### Controller

```java
@RestController
@RequestMapping("/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping
    public ResponseEntity<Void> crear(@RequestBody CrearPedidoRequest request) {
        pedidoService.crearPedido(request);
        return ResponseEntity.status(201).build();
    }
}
```

### Service

```java
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;

    public PedidoService(PedidoRepository pedidoRepository, ProductoRepository productoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
    }

    @Transactional
    public void crearPedido(CrearPedidoRequest request) {
        // lógica del caso de uso
        // guardar pedido
        // descontar stock
        // validar reglas
    }
}
```

Esto ya muestra una ubicación bastante razonable de la transacción.

## Una aclaración sana: @Transactional no reemplaza buen diseño

No conviene pensar:

> “le pongo @Transactional y listo, ya resolví todo”

La transacción ayuda muchísimo, sí.
Pero sigue siendo importante:

- modelar bien el caso de uso
- separar responsabilidades
- lanzar excepciones adecuadas
- no mezclar demasiadas cosas en un único método gigante
- pensar bien qué debe o no formar parte de la unidad transaccional

Es una herramienta muy poderosa, pero no reemplaza criterio de diseño.

## Error común: creer que solo importa cuando hay dinero

Las transacciones suelen asociarse rápido a banca o pagos, pero en realidad aparecen en muchísimos dominios.

Por ejemplo:

- reservas
- stock
- órdenes
- workflows
- creación compuesta de datos
- integridad de relaciones
- auditoría consistente

No hace falta que haya dinero de por medio para que la consistencia sea crítica.

## Error común: poner @Transactional “por las dudas” en cualquier cosa

Tampoco conviene usarla de forma automática en todo sin pensar.

La pregunta siempre debería ser:

- ¿cuál es la unidad real del caso de uso?
- ¿qué cosas deben ir juntas?
- ¿qué pasaría si falla a la mitad?

Usarla con criterio suele ser mucho mejor que llenarlo todo de transacciones indiscriminadamente.

## Error común: no pensar en el estado parcial como problema real

A veces, mientras el proyecto es chico, uno subestima esto.

Pero cuando el sistema empieza a manejar operaciones más importantes, los estados parciales pueden convertirse en bugs muy serios y difíciles de rastrear.

Entender las transacciones temprano es una gran inversión conceptual.

## Error común: meter demasiadas responsabilidades no relacionadas en una sola transacción gigantesca

El otro extremo también existe.

Si una transacción empieza a englobar demasiadas cosas poco relacionadas, el diseño también puede volverse más confuso.

La idea no es hacer “transacciones enormes porque sí”.
La idea es capturar una unidad coherente de trabajo.

## Relación con Spring Boot

Spring Boot y Spring Data JPA hacen muy cómodo trabajar con transacciones porque `@Transactional` se integra naturalmente con la capa service y con el acceso a datos.

Eso permite que la preocupación por la consistencia no quede relegada a una infraestructura manual enorme, sino que pueda expresarse con bastante claridad en el lugar correcto del flujo.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> `@Transactional` permite que un conjunto de operaciones de persistencia se comporte como una sola unidad consistente, de modo que si algo falla en el medio no quede la base en un estado parcial o incoherente, algo fundamental para muchísimos casos de negocio reales.

## Resumen

- Una transacción agrupa operaciones que deben confirmarse o revertirse juntas.
- `@Transactional` permite expresar esa unidad de trabajo en Spring.
- `commit` significa confirmar cambios; `rollback` significa revertirlos.
- La capa service suele ser un lugar muy natural para definir transacciones.
- Las transacciones son clave cuando varias operaciones deben mantener consistencia.
- No reemplazan el buen diseño, pero son una herramienta central de cualquier backend serio con base de datos.
- Este tema sienta una base fundamental para entender persistencia real más allá del CRUD ingenuo.

## Próximo tema

En el próximo tema vas a ver cómo funcionan `fetch = LAZY` y `fetch = EAGER`, qué significa realmente que una relación se cargue de forma diferida o inmediata y por qué entender eso te ayuda a evitar tanto respuestas problemáticas como consultas innecesarias.
