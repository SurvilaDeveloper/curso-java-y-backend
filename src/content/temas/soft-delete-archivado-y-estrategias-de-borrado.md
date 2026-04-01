---
title: "Soft delete, archivado y estrategias de borrado"
description: "Cómo decidir qué significa eliminar un dato en un sistema real, cuándo conviene borrar físicamente, cuándo ocultar lógicamente y cómo conservar historial sin romper el dominio."
order: 64
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
- trazabilidad
- arquitectura
- versionado de API

Eso ya te permite construir sistemas bastante serios.

Pero en cuanto una aplicación empieza a manejar datos reales y usuarios reales, aparece una pregunta muy importante:

**¿qué significa realmente eliminar algo?**

Por ejemplo:

- ¿un producto se borra para siempre?
- ¿una orden puede desaparecer?
- ¿un usuario se elimina o se desactiva?
- ¿un registro debe seguir existiendo por auditoría?
- ¿conviene ocultarlo, archivarlo o borrarlo físicamente?

Ahí entran el soft delete, el archivado y las estrategias de borrado.

## La idea general

Al principio, en proyectos simples, es muy común pensar así:

- si algo ya no se usa, se borra
- `DELETE` significa desaparición total

Eso puede estar bien en ciertos casos.

Pero en sistemas reales, eliminar datos suele ser mucho más delicado.

¿Por qué?

Porque a veces necesitás conservar:

- historial
- trazabilidad
- relaciones
- cumplimiento normativo
- reportes
- consistencia del dominio
- recuperación ante errores humanos

Por eso “borrar” no siempre significa lo mismo.

## Qué es borrado físico

El borrado físico significa eliminar realmente el registro de la base de datos.

Dicho simple:

el dato deja de existir en la tabla.

## Ejemplo mental

Si hacés esto:

```sql
DELETE FROM products WHERE id = 15;
```

ese producto desaparece físicamente de la tabla.

## Qué ventaja tiene

- es simple de entender
- reduce volumen de datos
- evita cargar registros que ya no deberían existir
- encaja bien para ciertos casos sin valor histórico

## Qué desventaja tiene

- puede romper trazabilidad
- puede complicar auditoría
- puede perder historial útil
- puede dañar relaciones o reporting
- puede hacer imposible recuperar un error de usuario o de operación

## Qué es soft delete

Soft delete significa que el dato no se elimina físicamente, sino que se marca como eliminado lógicamente.

Por ejemplo, con campos como:

- `deleted`
- `deletedAt`
- `active`
- `status = DELETED`
- `visibility = 0`
- según el diseño del sistema

## Ejemplo conceptual

```java
public class Product {
    private Long id;
    private String name;
    private boolean deleted;

    public Product(Long id, String name, boolean deleted) {
        this.id = id;
        this.name = name;
        this.deleted = deleted;
    }

    public boolean isDeleted() {
        return deleted;
    }
}
```

## Qué expresa esto

Que el registro sigue existiendo, pero el sistema ya no debería tratarlo como visible o activo en el flujo normal.

## Qué es archivado

Archivado es una estrategia relacionada, pero no siempre igual al soft delete.

Archivar suele significar:

- sacar algo del flujo operativo normal
- mantenerlo accesible para historia o consulta
- tratarlo como cerrado, antiguo o inactivo

Por ejemplo:

- órdenes históricas
- notas viejas
- tickets cerrados
- usuarios inactivos
- documentos antiguos

## Diferencia mental útil

Podés pensarlo así:

- borrado físico = desaparece realmente
- soft delete = sigue existiendo pero se considera eliminado lógicamente
- archivado = sigue existiendo y se conserva, pero ya no participa del flujo activo normal

## Por qué este tema importa tanto

Porque muchas decisiones de dominio dependen de esto.

Por ejemplo:

- una orden quizás no debería borrarse nunca físicamente
- un usuario quizá debería desactivarse, no borrarse
- un producto podría quedar oculto o archivado en vez de desaparecer
- un recurso sensible quizá deba conservarse por auditoría

## Qué problema resuelve el soft delete

Soft delete ayuda a resolver cosas como:

- recuperación ante errores humanos
- conservación de historial
- mantenimiento de relaciones
- visibilidad controlada
- trazabilidad de recursos eliminados lógicamente

## Qué problema resuelve el archivado

Archivado ayuda a resolver la necesidad de:

- mantener historia
- reducir ruido en el flujo activo
- separar datos operativos de datos históricos
- seguir permitiendo ciertas consultas sin mezclar todo

## Ejemplo mental con e-commerce

Supongamos que tenés productos.

Si un producto deja de venderse, podés tener varias opciones:

### Borrado físico

Desaparece de la base.

### Soft delete

Sigue existiendo, pero ya no aparece en listados visibles normales.

### Archivado

Sigue existiendo como histórico, quizá visible solo en administración o reportes.

## Cuándo conviene borrado físico

Suele tener más sentido cuando:

- el dato realmente no tiene valor histórico
- no participa en relaciones importantes
- no afecta auditoría relevante
- no hay razones normativas o de negocio para conservarlo
- el costo de mantenerlo supera su valor

## Cuándo conviene soft delete

Suele tener más sentido cuando:

- querés poder recuperar
- no querés perder historia
- el recurso tiene relaciones
- querés ocultarlo del flujo normal
- la eliminación accidental sería costosa

## Cuándo conviene archivado

Suele tener más sentido cuando:

- el dato ya no es activo pero sigue siendo valioso
- querés separarlo del flujo diario
- sigue siendo consultable
- tiene valor histórico, operativo o legal

## No todo recurso merece la misma estrategia

Esto es muy importante.

No conviene decidir “todo será soft delete” o “todo se borra físico” sin pensar el dominio.

Cada tipo de recurso puede necesitar una política distinta.

## Ejemplos por tipo de recurso

### Órdenes

Muy a menudo no deberían borrarse físicamente sin muchísimo cuidado.

### Usuarios

Muchas veces se desactivan o bloquean, no se borran directo.

### Productos

A menudo se ocultan, se despublican, se archivan o se marcan como inactivos.

### Tokens temporales o caches

Muchas veces sí pueden eliminarse físicamente sin problemas.

## Diseño del modelo

Soft delete suele reflejarse con campos como:

- `deleted`
- `deletedAt`
- `deletedBy`
- `active`
- `status`
- `archivedAt`

## Ejemplo con `deletedAt`

```java
public class Product {
    private Long id;
    private String name;
    private LocalDateTime deletedAt;

    public Product(Long id, String name, LocalDateTime deletedAt) {
        this.id = id;
        this.name = name;
        this.deletedAt = deletedAt;
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }
}
```

## Qué ventaja tiene `deletedAt`

Da más información que un simple booleano porque permite saber cuándo ocurrió la eliminación lógica.

## Y si además guardás `deletedBy`

Podrías saber también quién lo hizo.

Eso conecta muy bien con auditoría y trazabilidad.

## Ejemplo conceptual más rico

```java
public class Product {
    private Long id;
    private String name;
    private LocalDateTime deletedAt;
    private Long deletedBy;

    public boolean isDeleted() {
        return deletedAt != null;
    }
}
```

## Qué valor agrega esto

Permite responder cosas como:

- ¿está eliminado?
- ¿cuándo se eliminó?
- ¿quién lo eliminó?

## Soft delete y consultas

Uno de los puntos más importantes del soft delete es que no basta con agregar un campo.

También hay que asegurarse de que las consultas normales excluyan los registros eliminados lógicamente.

## Ejemplo conceptual de repository

```java
List<Product> findByDeletedAtIsNull();
Optional<Product> findByIdAndDeletedAtIsNull(Long id);
```

## Qué expresa esto

Que el flujo normal solo debería ver registros no eliminados.

## Qué error común aparece

Agregar `deletedAt` o `deleted = true` pero olvidarse de filtrar después.

Eso hace que el soft delete no sirva realmente.

## Relación con multitenancy

Esto también se cruza con multitenancy.

En sistemas con tenant, las consultas suelen necesitar cosas como:

```java
findByIdAndTenantIdAndDeletedAtIsNull(...)
```

Porque hay que respetar:

- tenant correcto
- no eliminado
- recurso correcto

## Soft delete y seguridad

También hay que pensar cómo impacta en permisos.

Por ejemplo:

- ¿un usuario común puede ver un recurso eliminado?
- ¿solo un admin puede restaurarlo?
- ¿solo auditoría o backoffice puede consultarlo?
- ¿puede seguir apareciendo en reportes?

## Restauración

Una gran ventaja del soft delete es que abre la puerta a restaurar.

Por ejemplo:

- un admin eliminó un producto por error
- el sistema puede restaurarlo limpiando `deletedAt`

## Ejemplo conceptual

```java
public void restoreProduct(Product product) {
    product.setDeletedAt(null);
    product.setDeletedBy(null);
}
```

## Qué muestra esto

Que el recurso puede volver al flujo activo sin tener que reconstruirlo desde cero.

## Qué costo tiene el soft delete

No todo es ventaja.

Soft delete también tiene costos:

- consultas más cuidadosas
- mayor volumen de datos acumulados
- más casos a considerar en reportes
- más complejidad en índices y performance
- más decisiones de visibilidad

Por eso no conviene usarlo ciegamente para todo.

## Archivado y UX del sistema

Archivado suele ser muy útil cuando querés evitar ruido visual sin perder historia.

Por ejemplo, un panel podría tener:

- activos
- archivados
- eliminados lógicamente

Eso da mucha más riqueza de manejo sin destruir información.

## Soft delete vs estado del dominio

A veces no conviene usar una bandera genérica de “deleted”.

En algunos dominios puede ser más claro usar estados explícitos.

Por ejemplo:

- `ACTIVE`
- `INACTIVE`
- `ARCHIVED`
- `DELETED`

Eso depende del modelo y del nivel de claridad que necesites.

## Ejemplo con enum

```java
public enum ProductStatus {
    ACTIVE,
    ARCHIVED,
    DELETED
}
```

## Qué ventaja tiene esto

Que expresa mejor las diferencias de negocio entre:

- algo activo
- algo archivado
- algo eliminado lógicamente

En algunos dominios eso es mucho mejor que un simple booleano.

## Borrado y relaciones

Este es otro tema delicado.

Si un recurso participa en relaciones, borrarlo físicamente puede generar:

- claves foráneas rotas
- pérdida de integridad histórica
- inconsistencias en reportes
- huecos difíciles de explicar

Por eso muchas veces recursos con relaciones importantes no deberían borrarse de forma agresiva.

## Ejemplo mental con órdenes

Una orden ligada a:

- usuario
- items
- pagos
- auditoría
- reportes

no suele ser buena candidata para borrado físico casual.

## Soft delete y reporting

También conviene definir si los recursos eliminados o archivados:

- cuentan o no en reportes
- se muestran o no en dashboards
- aparecen o no en métricas históricas

Eso depende mucho del dominio.

## Estrategias híbridas

A veces una estrategia sana es combinar enfoques.

Por ejemplo:

- soft delete primero
- borrado físico definitivo mucho más tarde por job programado
- archivado para recursos cerrados
- retención por cierto tiempo

## Ejemplo mental

Podrías hacer algo así:

- usuario elimina un recurso
- pasa a soft delete
- permanece recuperable 30 días
- luego un job de limpieza lo elimina definitivamente si corresponde

Eso combina recuperación y control del volumen de datos.

## Borrado y compliance / retención

En algunos sistemas, también pueden existir reglas de retención.

A veces un dato:

- no debe borrarse antes de cierto tiempo
- debe anonimizarse en vez de borrarse
- debe conservarse por trazabilidad
- debe eliminarse definitivamente luego de un plazo

No hace falta profundizar normativa específica ahora, pero conviene saber que el borrado no siempre es solo una decisión técnica local.

## Soft delete y cache

Si usás cache, también tenés que pensar qué pasa cuando algo se elimina lógicamente.

Por ejemplo:

- si un producto estaba cacheado y ahora se soft-deletea
- tenés que invalidar o actualizar cache

Si no, podrías seguir sirviendo recursos “eliminados”.

## Soft delete y OpenAPI / contrato

Si tenés endpoints de borrado, conviene que la API deje claro qué significa “eliminar”.

Por ejemplo:

- ¿es borrado lógico?
- ¿es archivado?
- ¿es irreversible?
- ¿puede restaurarse?
- ¿qué responde después?

Eso es parte del contrato del sistema.

## Qué no conviene hacer

No conviene:

- usar borrado físico por reflejo en recursos importantes
- meter soft delete sin filtrar consultas
- mezclar archivado y borrado sin una política clara
- olvidar impacto en reportes, cache y seguridad
- diseñar todo solo desde la base y no desde el dominio

## Buenas prácticas iniciales

## 1. Definir por tipo de recurso qué significa eliminar

No asumir una única política para todo.

## 2. Si usás soft delete, asegurar filtros correctos en queries normales

Es fundamental.

## 3. Conservar metadatos útiles como `deletedAt` y `deletedBy` cuando aporten valor

Eso mejora mucho trazabilidad.

## 4. Pensar si el dominio necesita `archived`, `inactive` o estados más expresivos

A veces un simple booleano no alcanza.

## 5. Considerar restauración, reporting, cache y auditoría como parte del diseño

No como detalles aparte.

## Ejemplo conceptual de service

```java
@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final AuditService auditService;

    public ProductService(ProductRepository productRepository, AuditService auditService) {
        this.productRepository = productRepository;
        this.auditService = auditService;
    }

    public void softDeleteProduct(Long productId, Long actorId) {
        Product product = productRepository.findByIdAndDeletedAtIsNull(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        product.setDeletedAt(LocalDateTime.now());
        product.setDeletedBy(actorId);

        productRepository.save(product);

        auditService.record(
                "PRODUCT_SOFT_DELETED",
                "PRODUCT",
                productId.toString(),
                actorId,
                "USER",
                "deletedAt=" + product.getDeletedAt()
        );
    }
}
```

## Qué demuestra este ejemplo

Demuestra una estrategia bastante realista:

- el recurso no desaparece físicamente
- se marca cuándo y quién lo eliminó
- se deja una huella auditada
- el flujo normal deberá excluirlo de consultas activas

## Comparación con otros lenguajes

### Si venís de JavaScript

Quizás ya viste sistemas donde “delete” en realidad significa desactivar, ocultar o archivar. En Java y Spring Boot el problema es exactamente el mismo, pero suele volverse más visible cuando aparecen auditoría, reporting, relaciones y sistemas empresariales con más trazabilidad.

### Si venís de Python

Puede recordarte a la necesidad de decidir entre borrado real, flags lógicos y archivado según el valor histórico del dato. En Java, este tema suele tomar bastante fuerza porque el ecosistema empresarial exige pensar muy bien integridad, auditoría y evolución del dominio.

## Errores comunes

### 1. Borrar físicamente recursos importantes sin pensar historial o relaciones

Eso puede ser muy costoso.

### 2. Implementar soft delete pero olvidarse de filtrarlo en consultas

Error clásico.

### 3. Mezclar archivado, inactivación y borrado lógico sin política clara

Después el dominio se vuelve confuso.

### 4. No invalidar cache ni ajustar reportes al eliminar

El sistema sigue mostrando cosas incorrectas.

### 5. No pensar si el recurso puede o no restaurarse

Eso también forma parte del significado de “eliminar”.

## Mini ejercicio

Tomá tres recursos de tu proyecto integrador, por ejemplo:

- usuario
- producto
- orden

Y definí para cada uno:

1. si conviene borrado físico, soft delete o archivado
2. por qué
3. qué campos necesitarías
4. si debería poder restaurarse
5. cómo impacta en auditoría, seguridad y reportes

## Ejemplo posible

### Producto
- estrategia: soft delete
- campos:
  - `deletedAt`
  - `deletedBy`
- restaurable: sí
- impacto:
  - excluir de catálogo
  - mantener historial en órdenes

### Orden
- estrategia: no borrar físicamente
- quizá archivado o estado final
- restaurable: no necesariamente
- impacto:
  - mantener integridad histórica y reportes

## Resumen

En esta lección viste que:

- eliminar un dato puede significar cosas distintas según el dominio
- el borrado físico, el soft delete y el archivado resuelven problemas distintos
- en sistemas reales conviene decidir la estrategia por tipo de recurso
- soft delete puede ser muy valioso, pero exige filtros correctos, trazabilidad y criterio
- auditoría, reportes, cache, seguridad y relaciones se ven muy afectados por cómo definís el borrado
- diseñar bien qué significa “eliminar” vuelve al sistema mucho más robusto y coherente

## Siguiente tema

La siguiente natural es **transacciones y consistencia en operaciones complejas**, porque después de pensar en trazabilidad, borrado y evolución del dominio, otro paso muy valioso en sistemas serios es entender cómo garantizar que varias operaciones relacionadas se comporten como una unidad consistente.
