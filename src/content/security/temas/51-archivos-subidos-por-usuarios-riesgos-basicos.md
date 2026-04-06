---
title: "Archivos subidos por usuarios: riesgos básicos"
description: "Qué riesgos aparecen cuando una aplicación Java con Spring Boot permite subir archivos. Cómo pensar validación, almacenamiento, exposición y procesamiento de uploads sin confiar en nombre, extensión o tipo declarado por el cliente."
order: 51
module: "Archivos y contenido subido por usuarios"
level: "base"
draft: false
---

# Archivos subidos por usuarios: riesgos básicos

## Objetivo del tema

Entender qué riesgos aparecen cuando una aplicación Java + Spring Boot permite que usuarios suban archivos, y por qué esta superficie merece bastante más cuidado del que suele recibir en implementaciones apuradas.

Este tema importa mucho porque la subida de archivos parece una funcionalidad “normal” y cotidiana:

- avatar
- comprobante
- documento
- imagen
- adjunto
- CV
- factura
- certificado
- export/import
- evidencia
- archivo para soporte

Pero en backend real, un upload mal modelado puede abrir problemas como:

- ejecución o exposición de contenido peligroso
- almacenamiento de archivos no esperados
- denegación de servicio por tamaño o volumen
- path traversal o nombres mal usados
- sobrescritura accidental
- exposición pública indebida
- procesamiento costoso o inseguro
- malware o contenido abusivo
- escalada indirecta por archivos servidos o consumidos después

En resumen:

> permitir subir archivos no es solo “guardar bytes”.  
> Es aceptar input complejo, muchas veces pesado, a veces ejecutable o interpretable, y potencialmente muy costoso de manejar mal.

---

## Idea clave

Un archivo subido por un usuario no debería tratarse como un objeto confiable solo porque:

- tiene una extensión conocida
- vino desde tu frontend
- el navegador dijo un tipo MIME
- el nombre “parece normal”
- lo necesita un caso de uso legítimo

En resumen:

> un archivo subido es input externo complejo.  
> El backend debe decidir qué acepta, qué rechaza, dónde lo guarda, cómo lo nombra, cómo lo expone y qué nunca debería hacer con él.

---

## Qué problema intenta resolver este tema

Este tema intenta evitar patrones como:

- aceptar cualquier archivo “porque después vemos”
- confiar en la extensión enviada por el cliente
- guardar el archivo con su nombre original en una ruta sensible
- exponer uploads directamente desde el mismo entorno de ejecución
- procesar contenido pesado o malicioso sin límites
- asumir que imagen, PDF o documento son siempre seguros
- dejar que el tipo declarado por el navegador decida todo
- olvidar límites de tamaño, cantidad o frecuencia

Es decir:

> el problema no es que existan uploads.  
> El problema es tratarlos como si fueran simples adjuntos inocentes en vez de una superficie real de ataque y abuso.

---

## Qué hace especialmente delicados a los uploads

A diferencia de un string o un número, un archivo puede implicar al mismo tiempo:

- tamaño
- formato
- contenido binario
- nombre
- extensión
- tipo declarado por cliente
- procesamiento posterior
- almacenamiento
- exposición pública o privada
- parseo por librerías
- reuso por otros usuarios o sistemas

Eso hace que un upload no sea un input simple.
Es un paquete de decisiones.

---

## Error mental clásico

Muchísimas apps piensan algo como:

- “si el input es `<input type="file">`, ya está controlado”
- “si aceptamos solo `.jpg`, listo”
- “si el frontend valida tamaño, alcanza”
- “si el navegador dice `image/png`, debe ser una imagen”
- “si el archivo no se ejecuta en Java, no hay problema”
- “lo guardamos y después vemos qué hacemos”
- “si es para uso interno, no pasa nada”

Todo eso es insuficiente.

Porque siguen faltando preguntas como:

- ¿qué formatos aceptás realmente?
- ¿cómo verificás que lo sean?
- ¿qué límite de tamaño hay?
- ¿cómo nombrás el archivo?
- ¿dónde lo almacenás?
- ¿quién podrá descargarlo?
- ¿qué pasa si el contenido es malicioso o muy costoso?
- ¿qué pasa si otro módulo lo procesa después?

---

## Qué riesgos básicos suelen aparecer

Hay muchos, pero algunos de los más comunes son estos:

## 1. Tipo de archivo inesperado
El sistema acepta algo distinto de lo que cree aceptar.

## 2. Tamaño excesivo
El archivo consume memoria, disco, CPU o ancho de banda de forma abusiva.

## 3. Nombre peligroso o conflictivo
El nombre del archivo se usa mal y rompe rutas, colisiona o genera exposición rara.

## 4. Exposición indebida
El archivo queda accesible desde donde no debería.

## 5. Procesamiento inseguro
Otra parte del sistema intenta parsearlo, transformarlo o ejecutarlo implícitamente.

## 6. Sobrescritura o colisión
Un archivo reemplaza a otro o queda ligado al recurso equivocado.

## 7. Abuso de volumen
Se suben muchos archivos para llenar almacenamiento o castigar infraestructura.

---

## La extensión no alcanza

Este es uno de los errores más clásicos.

### Ejemplo riesgoso

- aceptar archivo porque termina en `.jpg`
- o `.pdf`
- o `.docx`

### Problema

La extensión es solo una pista débil.
El cliente puede:

- renombrar el archivo
- mandar una extensión engañosa
- combinar contenido inesperado con nombre aparentemente normal

### Regla sana

La extensión puede ayudar como filtro superficial.
Pero no debería ser la única fuente de confianza.

---

## El tipo MIME enviado por el cliente tampoco alcanza

Otro error muy común es confiar demasiado en algo como:

- `image/png`
- `application/pdf`

porque eso vino en la request.

### Problema

Ese valor puede ser:

- incorrecto
- manipulado
- impreciso
- demasiado optimista
- simplemente declarativo

### Ejemplo conceptual

```java
@PostMapping("/upload")
public ResponseEntity<Void> upload(@RequestParam MultipartFile file) {
    if (!"image/png".equals(file.getContentType())) {
        throw new IllegalArgumentException("Tipo inválido");
    }
    // guardar...
    return ResponseEntity.noContent().build();
}
```

Esto puede ser una capa mínima útil, pero no debería ser toda la validación.

---

## Qué conviene validar al menos

Cuando recibís un archivo, suele ser sano pensar al menos en:

- si vino o no
- tamaño máximo
- cantidad máxima
- extensiones permitidas
- tipo declarado
- firma o contenido esperado cuando sea viable
- caso de uso concreto
- quién puede subirlo
- a qué recurso se asocia
- cuánto tiempo debería vivir

No siempre harás una inspección profunda del contenido.
Pero sí conviene evitar el modelo “acepto cualquier cosa y la guardo”.

---

## El caso de uso importa muchísimo

No todos los uploads requieren el mismo tratamiento.

### Ejemplo

No es lo mismo subir:

- avatar
- documento legal
- adjunto privado
- importación CSV
- imagen pública
- comprobante para soporte
- archivo para procesamiento interno

Cada uno cambia cosas como:

- tamaño tolerable
- visibilidad
- formato aceptable
- riesgo de exposición
- procesamiento posterior
- requerimientos de retención
- nivel de validación

### Regla sana

No conviene tener un endpoint “subir cualquier archivo” si los casos de uso reales son distintos y delicados.

---

## El nombre original no debería gobernar el almacenamiento

Otro error clásico es guardar el archivo directamente con el nombre enviado por el cliente.

### Ejemplo riesgoso

```java
String filename = file.getOriginalFilename();
Path path = Paths.get("/uploads/" + filename);
Files.copy(file.getInputStream(), path);
```

### Problemas posibles

- colisiones
- sobrescritura
- rutas raras
- nombres inesperados
- intento de path traversal
- exposición accidental
- mezcla de archivos entre usuarios o recursos

### Más sano

Usar un identificador generado por backend y tratar el nombre original solo como metadata si realmente hace falta conservarlo.

---

## Path traversal y nombres manipulados

Aunque no siempre se convierta automáticamente en una explotación, es mala idea dejar que partes del path real dependan directamente del nombre aportado por el cliente.

### Riesgo conceptual

El backend termina construyendo rutas de almacenamiento con input insuficientemente controlado.

### Más sano

- generar nombre interno propio
- normalizar o rechazar nombres extraños
- no usar directamente el nombre original para decidir ubicación sensible
- separar storage key de display name

---

## Dónde guardar el archivo también importa

No es lo mismo:

- guardarlo en una carpeta servida públicamente por la app
- guardarlo en almacenamiento privado y controlado
- ponerlo junto a recursos estáticos
- ponerlo fuera del alcance directo del servidor web
- dejarlo accesible por URL directa o exigir autorización de descarga

### Idea importante

El storage no es solo una decisión de infraestructura.
También es una decisión de seguridad.

---

## No todo archivo subido debería quedar público

Esto parece obvio, pero se rompe mucho.

### Ejemplos de archivos que no deberían quedar expuestos libremente

- documentos personales
- comprobantes
- tickets con adjuntos
- documentos internos
- evidencias
- archivos de soporte
- exportaciones privadas
- reportes con datos sensibles

Si el backend guarda y sirve esos archivos como si fueran imágenes públicas del catálogo, puede estar abriendo una fuga importante.

---

## Servir un archivo también es autorización

Otro punto importante.

No alcanza con proteger la subida.
También importa proteger la descarga o visualización.

### Preguntas útiles

- ¿quién puede descargarlo?
- ¿el recurso al que está asociado pertenece al actor?
- ¿es público o privado?
- ¿tiene tenant?
- ¿hay scope?
- ¿la URL es controlada o cualquiera con el identificador puede bajar el archivo?

Muchos problemas no aparecen al subir, sino al exponer después.

---

## El tamaño importa más de lo que parece

Un archivo grande puede generar problemas como:

- consumo excesivo de memoria
- presión sobre disco
- requests largas
- timeouts
- colas saturadas
- procesamiento costoso
- límites superados en reverse proxy o infraestructura

### Regla sana

Definir límites claros por tipo de upload.

No es lo mismo aceptar:

- avatar de 2 MB
- PDF de 10 MB
- importación de 50 MB
- video de cientos de MB

Si el caso de uso no necesita tamaños grandes, no conviene tolerarlos “por las dudas”.

---

## Un solo archivo vs múltiples archivos

También conviene pensar:

- cuántos archivos por request
- cuántos por recurso
- cuántos por usuario
- cuántos por ventana de tiempo

Porque el abuso no siempre viene de un solo archivo gigante.
A veces viene de:

- muchísimos archivos pequeños
- repetición masiva
- spam de adjuntos
- uso del storage como basurero

Ahí se relaciona mucho con rate limiting y cuotas.

---

## Qué pasa cuando el backend procesa el archivo

Acá el riesgo puede crecer bastante.

Por ejemplo, si después el sistema:

- genera thumbnails
- parsea PDF
- lee CSV
- extrae texto
- convierte formatos
- analiza imágenes
- importa contenido a la base
- delega a librerías externas

entonces el archivo ya no es solo “almacenado”.
Está siendo interpretado o transformado.

### Idea importante

Cada procesamiento adicional abre otra superficie:
- bugs de parseo
- costos altos
- bloqueos
- payloads maliciosos
- formatos inesperados

Por eso conviene separar mentalmente:

- aceptar upload
- almacenar
- exponer
- procesar

Cada etapa merece sus propias decisiones.

---

## CSV, PDF, imágenes y documentos “normales” no son automáticamente inocentes

Otro error frecuente es asumir que ciertos formatos comunes son siempre seguros.

### Ejemplos típicos subestimados

- CSV usado para importación
- PDF usado como adjunto o descarga
- imágenes usadas para preview
- DOCX u hojas de cálculo usadas por soporte o clientes

No hace falta entrar todavía en vectores avanzados para entender la regla general:

> que un formato sea común no significa que puedas confiar ciegamente en él.

---

## Endpoint genérico de upload: zona de cuidado

Ejemplo demasiado abierto:

```java
@PostMapping("/files")
public FileResponse upload(@RequestParam MultipartFile file) {
    return fileService.store(file);
}
```

Esto puede estar bien como estructura base.
Pero si el service no sabe:

- para qué caso de uso es
- qué formato espera
- a qué recurso se liga
- quién puede verlo luego
- qué tamaño tolera
- qué nombre interno usa

entonces el endpoint es demasiado genérico para algo delicado.

### Más sano

Endpoints o servicios orientados a intención:

- avatar
- adjunto de ticket
- comprobante
- importación
- documento contractual

Eso vuelve mucho más claro qué aceptar y cómo tratarlo.

---

## Asociar el archivo a un recurso concreto ayuda mucho

Un upload sano suele responder algo como:

- este archivo pertenece a este ticket
- este avatar pertenece a este usuario
- este comprobante pertenece a esta orden
- este adjunto pertenece a este mensaje

Eso ayuda a ordenar:

- ownership
- tenant
- visibilidad
- retención
- cleanup
- autorización de descarga

El archivo no debería quedar “flotando” sin modelo.

---

## Qué metadata conviene guardar

Suele tener sentido guardar cosas como:

- id interno
- owner o recurso asociado
- storage key
- nombre original, si hace falta
- tamaño
- tipo declarado
- timestamps
- visibilidad
- estado de procesamiento si aplica

### Ejemplo conceptual

```java
@Entity
public class StoredFile {

    @Id
    @GeneratedValue
    private Long id;

    private String storageKey;
    private String originalFilename;
    private Long sizeBytes;
    private String declaredContentType;
    private Long ownerUserId;
    private Long tenantId;
    private Instant createdAt;
}
```

Eso ya es mucho más sano que “copiar archivo a una carpeta y listo”.

---

## Qué señales muestran que el upload está flojo

Estas cosas suelen hacer bastante ruido:

- sin límite de tamaño claro
- confiar solo en extensión
- confiar solo en `contentType`
- nombre original usado como path real
- archivos públicos por defecto
- DTO o metadata pobre
- endpoint genérico para cualquier cosa
- ninguna validación por caso de uso
- descarga sin autorización fuerte
- procesamiento posterior sin controles claros

---

## Qué gana el backend si trata mejor los uploads

Cuando el backend trata mejor los uploads, gana:

- menos exposición accidental
- menos archivos inesperados
- menos abuso de almacenamiento
- menos superficie para procesamiento peligroso
- mejor autorización en descarga
- mejor trazabilidad
- mejor alineación con el caso de uso real

No es solo un detalle técnico.
Es seguridad de input, almacenamiento y exposición.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- caso de uso claro por upload
- límites de tamaño
- nombre interno generado por backend
- metadata razonable
- archivos ligados a recurso y actor
- visibilidad explícita
- descarga autorizada
- menor confianza en extensión o tipo declarado
- menos endpoints genéricos sin contexto

---

## Señales de ruido

Estas cosas suelen hacer ruido rápido:

- “subir cualquier archivo”
- carpeta pública para todo
- `getOriginalFilename()` usado directo como clave de almacenamiento
- sin cuotas ni límites
- descarga por id sin ownership
- storage mezclado con assets públicos
- nadie sabe bien quién puede descargar qué
- nadie sabe cuánto pesa o cuántos archivos puede subir un usuario

---

## Checklist práctico

Cuando revises uploads en una app Spring, preguntate:

- ¿para qué caso de uso existe este upload?
- ¿qué formatos acepta realmente?
- ¿cómo valida el backend eso?
- ¿qué tamaño máximo permite?
- ¿qué nombre usa para almacenarlo?
- ¿qué metadata guarda?
- ¿a qué recurso se asocia?
- ¿quién puede descargarlo después?
- ¿es público o privado?
- ¿el sistema lo procesa después? ¿cómo?
- ¿qué pasaría si alguien sube algo distinto de lo esperado o muchísimo más grande?

---

## Mini ejercicio de reflexión

Tomá tres uploads reales o imaginarios de tu backend y respondé:

1. ¿Qué caso de uso resuelven?
2. ¿Qué formatos deberían aceptar?
3. ¿Qué tamaño máximo debería tener sentido?
4. ¿Dónde se almacenan?
5. ¿Quién puede descargarlos?
6. ¿Qué metadata guardás?
7. ¿Qué parte del diseño hoy confía demasiado en el frontend o en el nombre del archivo?
8. ¿Cuál de esos tres uploads hoy te inspira menos confianza y por qué?

Ese ejercicio ayuda muchísimo a convertir “subir archivos” en una capacidad gobernada, no en una caja negra de bytes.

---

## Resumen

Los uploads de usuarios merecen bastante cuidado porque combinan:

- input complejo
- tamaño
- almacenamiento
- exposición
- procesamiento posterior
- autorización de descarga

No conviene confiar ciegamente en:

- extensión
- nombre
- MIME declarado por cliente
- validación del frontend

En resumen:

> Un backend más maduro no trata los archivos subidos como adjuntos inocentes por defecto.  
> Los trata como input externo complejo que debe validarse, almacenarse, asociarse y exponerse con mucho más criterio que un simple string.

---

## Próximo tema

**Deserialización insegura: idea general**
