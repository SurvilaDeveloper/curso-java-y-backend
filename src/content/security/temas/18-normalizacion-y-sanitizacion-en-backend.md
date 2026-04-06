---
title: "Normalización y sanitización en backend"
description: "Cómo distinguir normalización y sanitización en una aplicación Java con Spring Boot. Qué conviene normalizar, qué conviene sanitizar, qué nunca debería confiarse al frontend y cómo evitar que estas transformaciones rompan lógica, seguridad o trazabilidad."
order: 18
module: "Requests y validación"
level: "base"
draft: false
---

# Normalización y sanitización en backend

## Objetivo del tema

Entender la diferencia entre:

- **normalización**
- **sanitización**

en una aplicación Java + Spring Boot, y aprender a usarlas sin convertirlas en una excusa para confiar de más en el input del cliente.

Este tema es importante porque mucha gente mezcla estos conceptos y termina haciendo una de estas dos cosas:

- no transformar nada y dejar que el sistema reciba datos sucios, ambiguos o inconsistentes
- transformar demasiado y romper significado, trazabilidad o reglas del negocio

La idea no es “limpiar todo”.
La idea es **saber qué transformar, dónde y con qué objetivo**.

---

## Idea clave

Normalizar y sanitizar no son lo mismo.

## Normalizar
Es llevar un dato a una forma más estable o consistente.

## Sanitizar
Es eliminar, escapar o transformar partes del dato para reducir ciertos riesgos o incompatibilidades.

En resumen:

> Normalizar busca consistencia.  
> Sanitizar busca reducir riesgo o evitar interpretaciones peligrosas.

Las dos pueden ser útiles.  
Pero ninguna debería usarse de forma ciega.

---

## Qué es normalización

La normalización busca que datos equivalentes se representen de forma más uniforme.

### Ejemplos típicos

- quitar espacios al inicio y al final
- transformar emails a minúsculas si así lo define el sistema
- guardar teléfonos en un formato consistente
- colapsar separadores
- estandarizar códigos o identificadores
- convertir strings vacíos a null en ciertos contextos
- unificar formatos de fechas o zonas

La idea es reducir ambigüedad y mejorar coherencia.

---

## Qué es sanitización

La sanitización busca evitar que ciertos caracteres, fragmentos o estructuras se conviertan en un problema cuando el dato:

- se muestra
- se reinterpreta
- se usa en otro contexto
- se exporta
- se incrusta en HTML, logs, comandos o consultas

### Ejemplos típicos

- escapar HTML antes de renderizar en una vista
- limpiar etiquetas peligrosas si se permite texto enriquecido
- filtrar caracteres no permitidos en ciertos identificadores
- remover caracteres de control problemáticos
- limitar payloads que luego viajarán a otro motor o formato

---

## Error mental clásico

Mucha gente piensa algo así:

- “si lo sanitizo, ya está seguro”
- “si el frontend ya lo limpia, ya alcanza”
- “si le hago trim y lowercase, ya quedó validado”
- “si saco caracteres raros, ya resolví el problema”

No.

Ni normalización ni sanitización reemplazan:

- validación
- autorización
- ownership
- reglas de negocio
- queries seguras
- encoding correcto en salida
- diseño defensivo

En resumen:

> Normalizar y sanitizar ayudan.  
> Pero no convierten por sí solas un dato inseguro en una operación segura.

---

## Cuándo conviene normalizar

Conviene normalizar cuando necesitás que el sistema trate de forma consistente cosas que conceptualmente deberían ser equivalentes.

### Ejemplos útiles

- email
- username
- códigos
- tags
- teléfonos
- documentos
- slugs
- identificadores externos
- campos de búsqueda

### Ejemplo simple

```java
public class RegisterRequest {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8, max = 100)
    private String password;
}
```

Y luego en service:

```java
String normalizedEmail = request.getEmail().trim().toLowerCase();
```

Esto puede tener sentido si el sistema decidió que el email se maneja de forma case-insensitive.

---

## Cuándo conviene sanitizar

Conviene sanitizar cuando el dato va a pasar por contextos donde ciertos caracteres o estructuras pueden ser peligrosos o problemáticos.

### Ejemplos útiles

- contenido que luego se renderiza como HTML
- campos libres que irán a plantillas
- inputs que terminan en CSV, logs o documentos
- rich text controlado
- exportaciones
- texto que luego será consumido por otro sistema sensible al formato

### Ojo

Sanitizar no significa mutilar cualquier texto “por las dudas”.

Si un campo es simplemente un nombre o una descripción plana, muchas veces alcanza con:

- validar longitud
- aceptar texto normal
- renderizarlo correctamente según el contexto de salida

---

## Normalización no es validación

Esto es clave.

Supongamos este código:

```java
String normalizedEmail = request.getEmail().trim().toLowerCase();
```

Eso puede ayudar a consistencia.

Pero no valida:

- que tenga formato válido
- que el actor pueda usarlo
- que no exista ya
- que no esté prohibido
- que la operación tenga sentido de negocio

Lo mismo con un teléfono normalizado.
Puede quedar prolijo y seguir siendo semánticamente inválido para el sistema.

---

## Sanitización no es escape de salida

Otro error muy común.

### Ejemplo de mal razonamiento

- “limpio el input y entonces después puedo renderizarlo tranquilo en cualquier lado”

No siempre.

La forma correcta suele ser:

- validar el input
- almacenar lo que tenga sentido almacenar
- aplicar encoding o escape **en el contexto de salida** que corresponda

Por ejemplo:

- HTML encode si va a HTML
- JSON encode si va a JSON
- URL encode si va en URL
- CSV escaping si va a CSV

La sanitización de entrada no reemplaza el manejo correcto del output.

---

## Ejemplo útil: campo nombre

Supongamos este DTO:

```java
public class UpdateProfileRequest {

    @NotBlank
    @Size(max = 100)
    private String name;
}
```

### Normalización razonable

En service:

```java
String normalizedName = request.getName().trim();
```

Eso puede tener sentido.

### Lo que no deberías hacer automáticamente

- borrar caracteres arbitrariamente sin criterio
- “sanitizar” de tal manera que cambie el nombre real
- asumir que todo carácter raro es peligroso
- romper tildes, unicode o formatos válidos

La transformación debe responder a una necesidad concreta, no a miedo difuso.

---

## Ejemplo útil: email

### Request

```java
public class ChangeEmailRequest {

    @NotBlank
    @Email
    private String email;
}
```

### En service

```java
String normalizedEmail = request.getEmail().trim().toLowerCase();
```

Acá la normalización suele ser razonable si tu sistema decidió:

- comparar emails sin distinguir mayúsculas/minúsculas
- persistirlos en forma canónica

### Pero igual falta

- validar unicidad
- validar reglas del negocio
- validar ownership o autorización según el caso
- decidir si el cambio de email está permitido

---

## Ejemplo útil: texto libre

Supongamos:

```java
public class CreateCommentRequest {

    @NotBlank
    @Size(max = 1000)
    private String content;
}
```

### Qué podrías hacer

- trim razonable
- tal vez normalizar saltos de línea si el caso lo justifica
- limitar longitud
- decidir si el sistema admite texto plano o HTML

### Qué no deberías hacer sin pensar

- remover arbitrariamente caracteres
- asumir que “limpiando” el input ya resolviste cualquier riesgo posterior
- permitir HTML y confiar solo en un replace improvisado
- romper el significado del contenido

Si el comentario se va a mostrar en HTML, el manejo seguro del output sigue importando mucho.

---

## Dónde conviene normalizar

En una app Spring, la normalización suele quedar bien en lugares como:

- service
- capa de mapeo
- constructores de valor
- validadores específicos
- lógica previa a persistencia

### Por qué suele ser mejor ahí

Porque ahí ya podés decidir con más contexto:

- qué campo es
- qué significa
- cómo lo usa el negocio
- si conviene persistirlo normalizado o no
- si esa transformación tiene sentido global

---

## Dónde conviene sanitizar

Depende mucho del caso de uso.

Puede vivir en:

- service, si la sanitización hace parte del contrato de persistencia
- una capa específica de transformación
- el punto de salida, si el problema depende del contexto de renderizado
- mappers de exportación
- utilidades especializadas

Lo importante es no hacerlo “al voleo” en cualquier lado.

---

## Ejemplo: normalización útil en service

```java
public UserResponse register(RegisterRequest request) {
    String normalizedEmail = request.getEmail().trim().toLowerCase();

    if (userRepository.existsByEmail(normalizedEmail)) {
        throw new IllegalStateException("El email ya está registrado");
    }

    User user = new User();
    user.setEmail(normalizedEmail);
    user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

    userRepository.save(user);

    return userMapper.toResponse(user);
}
```

Acá la normalización tiene sentido porque:

- mejora consistencia
- ayuda a unicidad
- evita diferencias artificiales

---

## Ejemplo: sanitización mal entendida

```java
String safe = request.getContent().replace("<", "").replace(">", "");
```

Esto suele ser una mala idea como defensa principal porque:

- es incompleto
- rompe contenido legítimo
- no resuelve contexto de salida
- da falsa sensación de seguridad
- depende demasiado de parches frágiles

Mucho mejor es decidir:

- si aceptás texto plano o HTML
- si necesitás una librería seria para sanitizar rich text
- cómo vas a renderizar después
- qué encoding corresponde en salida

---

## Qué riesgos aparecen si no normalizás cuando deberías

Pueden aparecer problemas como:

- duplicados lógicos
- comparaciones inconsistentes
- búsquedas erráticas
- reglas de unicidad débiles
- errores raros por espacios o casing
- datos sucios difíciles de auditar
- diferencias artificiales entre inputs equivalentes

### Ejemplo

- `Juan@Mail.com`
- `juan@mail.com`
- `  juan@mail.com  `

Si el sistema conceptualmente los considera el mismo email, no normalizar puede generar inconsistencias importantes.

---

## Qué riesgos aparecen si sanitizás mal o de más

También hay problemas cuando sanitizás sin criterio.

Por ejemplo:

- romper contenido válido
- perder información útil
- ocultar trazabilidad
- dificultar debugging
- cambiar el significado del dato
- aplicar una limpieza incompleta que da falsa seguridad
- mezclar “limpieza” con “seguridad” de forma peligrosa

---

## No todo campo necesita normalización o sanitización

Otra idea importante.

No conviene convertir estas prácticas en una manía automática.

### Preguntas útiles antes de transformar un campo

- ¿este campo necesita consistencia canónica?
- ¿este campo se compara después?
- ¿este campo define unicidad?
- ¿este campo viaja a un contexto sensible?
- ¿este campo admite texto libre?
- ¿esta transformación cambia significado?
- ¿la sanitización corresponde en input o en output?

Si no sabés responder para qué transformás, probablemente no deberías transformarlo todavía.

---

## Qué relación tiene esto con seguridad

La relación es real, pero indirecta.

Normalizar y sanitizar ayudan a seguridad cuando:

- reducen ambigüedad
- evitan inconsistencias explotables
- hacen más robusta la lógica
- previenen problemas de interpretación
- preparan mejor ciertos datos para recorridos posteriores

Pero no deberían usarse como reemplazo de:

- validación declarativa
- validación semántica
- autorización
- queries seguras
- output encoding correcto
- diseño defensivo

---

## Cómo pensar bien esto en una app Spring

Una forma sana de pensarlo es así:

### El DTO
recibe el dato

### Bean Validation
valida forma básica

### Service
decide si conviene normalizar algo para consistencia

### Capa de salida
aplica encoding o escape según el contexto de representación

### Sanitización especializada
solo si el caso de uso realmente lo necesita

Ese flujo suele ser bastante más robusto que:

- aceptar todo
- hacer replace de cosas raras
- creer que ya quedó “seguro”

---

## Ejemplo completo

### DTO

```java
public class RegisterRequest {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8, max = 100)
    private String password;
}
```

### Service

```java
public UserResponse register(RegisterRequest request) {
    String normalizedEmail = request.getEmail().trim().toLowerCase();

    if (userRepository.existsByEmail(normalizedEmail)) {
        throw new IllegalStateException("El email ya está registrado");
    }

    User user = new User();
    user.setEmail(normalizedEmail);
    user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

    userRepository.save(user);

    return userMapper.toResponse(user);
}
```

Acá hay:

- validación sintáctica
- normalización
- validación semántica
- persistencia segura

Todo con responsabilidades bastante claras.

---

## Señales de diseño sano

Una app más sana suele mostrar:

- normalización deliberada y justificada
- poca “limpieza mágica”
- Bean Validation para forma
- service para decisiones de consistencia
- DTOs claros
- salida tratada según contexto
- poca confianza en que “ya limpié todo”
- menos acoplamiento entre input y verdad del sistema

---

## Señales de ruido

Estas cosas suelen hacer ruido:

- replace improvisado de caracteres peligrosos
- sanitización casera como defensa principal
- normalización hecha en frontend pero no en backend
- transforms automáticos que cambian demasiado el significado
- confiar en que sanitizar input resuelve renderizado seguro
- falta total de normalización donde sí hay unicidad o comparación fuerte
- lógica dispersa sin criterio claro sobre dónde transformar

---

## Checklist práctico

Cuando revises una app Spring, preguntate:

- ¿qué campos conviene normalizar para consistencia?
- ¿qué campos no conviene tocar demasiado porque perderían significado?
- ¿qué parte del input se compara luego de forma sensible?
- ¿qué parte del sistema depende de unicidad o equivalencia?
- ¿hay sanitización improvisada con replace o regex frágiles?
- ¿se está confundiendo sanitización de entrada con escape de salida?
- ¿hay texto libre que después se renderiza en contextos sensibles?
- ¿la normalización está justificada por negocio o es una costumbre sin objetivo?
- ¿el backend depende de que el frontend ya “limpió” el dato?
- ¿hay una política clara sobre dónde transformar y dónde no?

---

## Mini ejercicio de reflexión

Tomá tres campos reales de tu backend, por ejemplo:

- email
- nombre
- comentario
- teléfono
- código de cupón
- username

Y para cada uno respondé:

1. ¿Conviene normalizarlo?
2. ¿Conviene sanitizarlo?
3. ¿Qué transformación concreta tendría sentido?
4. ¿Qué transformación lo rompería?
5. ¿Qué parte de la seguridad real no queda resuelta aunque lo normalices o sanitices?

Ese ejercicio ayuda mucho a dejar de “limpiar cosas” por costumbre y empezar a transformar con criterio.

---

## Resumen

Normalización y sanitización no son lo mismo.

## Normalización
- busca consistencia
- ayuda a comparaciones, unicidad y coherencia

## Sanitización
- busca reducir ciertos riesgos de interpretación o representación
- depende mucho del contexto

Las dos pueden ser útiles.
Pero ninguna reemplaza:

- validación
- autorización
- negocio
- diseño seguro
- encoding de salida correcto

En resumen:

> Transformar datos puede ayudar mucho.  
> Pero hacerlo sin criterio puede dar falsa seguridad, romper significado o esconder que el problema real sigue sin resolverse.

---

## Próximo tema

**Parámetros peligrosos en filtros y búsquedas**
