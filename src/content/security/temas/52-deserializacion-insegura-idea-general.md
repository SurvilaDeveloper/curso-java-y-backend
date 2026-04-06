---
title: "Deserialización insegura: idea general"
description: "Cómo entender la deserialización insegura en una aplicación Java con Spring Boot. Qué significa realmente deserializar input, por qué puede volverse peligrosa y qué ideas básicas conviene tener claras antes de tocar formatos complejos, objetos arbitrarios o librerías que reconstruyen estructuras desde datos externos."
order: 52
module: "Archivos y contenido subido por usuarios"
level: "base"
draft: false
---

# Deserialización insegura: idea general

## Objetivo del tema

Entender qué significa **deserializar** datos en una aplicación Java + Spring Boot, por qué esa operación puede volverse peligrosa y cuál es la intuición correcta para reconocer cuándo el backend está reconstruyendo estructuras desde input externo con demasiado poder.

Este tema importa mucho porque la deserialización insegura suele sonar lejana o demasiado técnica, pero en realidad toca una idea bastante simple y muy importante:

- el sistema recibe datos externos
- esos datos no solo se leen como texto plano
- además se transforman en objetos, estructuras o comportamientos que el backend empieza a tratar como significativos

Y si ese proceso está mal diseñado, puede abrir problemas como:

- reconstrucción de objetos no esperados
- parseo de estructuras demasiado libres
- activación de comportamientos laterales
- consumo excesivo de recursos
- bypass de validaciones
- superficies muy difíciles de auditar
- dependencia peligrosa de formatos o librerías

En resumen:

> deserializar no es solo “leer JSON”.  
> Es permitir que input externo influya en cómo el sistema reconstruye estructuras internas, y eso puede ser mucho más delicado de lo que parece.

---

## Idea clave

Serializar es convertir un objeto o estructura interna en un formato transportable.

Deserializar es hacer el camino inverso:

- tomar datos externos
- interpretarlos
- reconstruir estructuras en memoria

En resumen:

> cada vez que el backend reconstruye objetos o estructuras a partir de input externo, está confiando en un proceso de deserialización.

Eso no es malo por sí mismo.
De hecho, toda API JSON moderna hace cierta forma de deserialización.

El problema aparece cuando esa reconstrucción se vuelve:

- demasiado libre
- demasiado poderosa
- poco controlada
- dependiente de tipos o estructuras no esperadas
- difícil de validar o limitar

---

## Qué problema intenta resolver este tema

Este tema intenta evitar ideas como:

- “si viene en JSON, ya es seguro”
- “si Jackson lo puede mapear, entonces está bien”
- “si el formato parsea, ya alcanza”
- “si es un objeto Java, debe ser confiable”
- “si es una importación o un archivo de configuración, no pasa nada”
- “si la librería sabe deserializarlo, mejor”

Ese razonamiento es peligroso.

Porque siguen faltando preguntas como:

- ¿qué estructura exacta estamos aceptando?
- ¿qué tipos permitimos reconstruir?
- ¿qué campos o formas de input deberían quedar fuera?
- ¿qué comportamiento dispara esa reconstrucción?
- ¿qué costo de CPU, memoria o complejidad puede tener?
- ¿qué parte del sistema empieza a confiar demasiado en lo deserializado?

---

## Qué significa deserializar en la práctica cotidiana

En backend Java, deserializar puede aparecer en cosas como:

- `@RequestBody`
- JSON de APIs
- archivos importados
- mensajes de colas
- payloads de integraciones
- configuraciones cargadas desde fuentes externas
- objetos guardados y luego reconstruidos
- formatos binarios o estructurados
- sesiones antiguas o mecanismos de caché
- librerías que convierten input a objetos automáticamente

### Ejemplo simple y sano

```java
public class CreateUserRequest {
    private String name;
    private String email;
}
```

y luego:

```java
@PostMapping("/users")
public ResponseEntity<Void> create(@RequestBody CreateUserRequest request) {
    ...
}
```

Acá también hay deserialización.
El JSON externo se convierte en un DTO Java.

### Entonces, ¿cuál es el problema?

No la deserialización en sí.
El problema aparece cuando el backend deja que el input controle demasiado:

- forma
- tipo
- estructura
- profundidad
- comportamiento posterior

---

## Error mental clásico

A mucha gente le pasa esto:

- asocia deserialización insegura solo con “bugs exóticos”
- cree que solo importa si hay objetos binarios raros
- piensa que JSON común no entra en esta conversación
- cree que el peligro empieza recién cuando hay RCE o algo extremo

Eso vuelve ciego a un riesgo más general y útil de entender:

> cada vez que reconstruís estructuras complejas desde input externo, estás abriendo una frontera de confianza.

Cuanto más poder tenga esa reconstrucción, más cuidado necesitás.

---

## Deserialización sencilla vs deserialización peligrosa

No toda deserialización tiene el mismo riesgo.

## Deserialización relativamente sencilla
Por ejemplo:
- JSON a DTO fijo
- campos explícitos
- tipos simples
- validación clara
- pocos niveles de anidación
- sin comportamiento implícito extraño

## Deserialización más delicada
Por ejemplo:
- tipos arbitrarios
- estructuras polimórficas abiertas
- objetos complejos con demasiada libertad
- formatos binarios o históricos poco claros
- input que decide qué clase concreta instanciar
- librerías que reconstruyen más de lo que el equipo entiende

La diferencia importante no es solo el formato.
Es el **grado de control que el input tiene sobre la estructura interna resultante**.

---

## DTO fijo: un caso relativamente sano

### Ejemplo

```java
public class UpdateProfileRequest {

    private String name;
    private String phone;
}
```

```java
@PatchMapping("/users/me/profile")
public ResponseEntity<Void> update(@RequestBody UpdateProfileRequest request) {
    ...
}
```

Acá el backend espera:

- una forma concreta
- campos conocidos
- tipos previsibles
- objetivo acotado

Eso no elimina todos los riesgos, pero suele ser mucho más sano que aceptar estructuras demasiado libres o ambiguas.

---

## Cuándo empieza a ponerse feo

La cosa empieza a ponerse más delicada cuando el backend acepta cosas como:

- mapas arbitrarios
- payloads demasiado genéricos
- estructuras polimórficas abiertas
- clases o tipos decididos por el input
- árboles enormes o profundamente anidados
- archivos que representan objetos complejos reconstruibles
- formatos con semántica que el equipo no entiende bien

### Ejemplo sospechoso

```java
@PostMapping("/config/import")
public ResponseEntity<Void> importConfig(@RequestBody Object payload) {
    ...
}
```

o:

```java
public ResponseEntity<Void> importConfig(@RequestBody Map<String, Object> payload) {
    ...
}
```

Eso no es automáticamente inseguro, pero sí suele ser una señal de que el contrato es demasiado abierto y difícil de gobernar.

---

## Input externo no debería elegir libremente la forma interna

Esta es una idea muy útil.

Mientras más permitís que el input externo decida:

- qué tipo instanciar
- qué estructura exacta crear
- qué profundidad usar
- qué combinación rara de campos mezclar
- qué semántica activar

más compleja y riesgosa se vuelve la deserialización.

### Regla sana

El backend debería preferir:

- DTOs concretos
- contratos claros
- estructuras limitadas
- validación explícita
- mapping controlado

y desconfiar de modelos donde el input “descubre” o “elige” demasiado de la estructura interna.

---

## ¿Por qué Java aparece tanto en esta conversación?

Porque el ecosistema Java tiene una larga historia de:

- objetos ricos
- frameworks de mapeo
- serialización/deserialización automática
- formatos complejos
- librerías que convierten datos externos a objetos con mucha facilidad

Eso puede ser muy cómodo.
Pero también puede volver fácil que el equipo deje de preguntarse:

- qué exactamente se está reconstruyendo
- con qué límites
- con qué costo
- bajo qué garantías

No es un problema exclusivo de Java.
Pero en Java la frontera entre “objeto interno” e “input parseado” puede volverse especialmente opaca si no se piensa con cuidado.

---

## JSON común no está libre de riesgo conceptual

A veces se piensa:

- “si no usamos serialización binaria rara, entonces no importa”

Eso es demasiado simplista.

Aunque el caso más extremo de deserialización insegura suele asociarse a mecanismos más peligrosos, incluso con JSON conviene entender varios riesgos conceptuales como:

- input demasiado abierto
- mapeo a estructuras demasiado genéricas
- anidación o complejidad excesiva
- payloads inesperados
- abuso de parseo
- desajuste entre lo que el backend cree aceptar y lo que realmente acepta

No hace falta que el riesgo sea “ejecución remota” para que la superficie ya sea mala.

---

## Parsear no es validar

Otro error muy común.

### Ejemplo mental incorrecto

- “si el objeto parseó bien, entonces era válido”

No.

Que un payload pueda reconstruirse como estructura Java no significa que:

- tenga sentido de negocio
- sea seguro
- tenga el tamaño correcto
- tenga la forma correcta
- no incluya contenido inesperado
- no sea demasiado costoso de procesar

Parsear responde:
- “se pudo interpretar”

Validar responde:
- “deberíamos aceptarlo”

Y esas son preguntas completamente distintas.

---

## Deserialización y abuso de recursos

Además del riesgo conceptual o estructural, la deserialización también puede traer problemas de recursos.

### Ejemplos

- payloads enormes
- estructuras profundamente anidadas
- colecciones masivas
- objetos costosos de reconstruir
- conversiones que disparan CPU o memoria de más

A veces el problema no es que el atacante logre “hacer algo mágico”.
A veces el problema es que logra que el backend consuma demasiados recursos solo intentando reconstruir o procesar estructuras externas.

---

## Qué papel juegan los DTOs acotados

Usar DTOs concretos ayuda muchísimo porque reduce:

- libertad de forma
- libertad de tipo
- ambigüedad
- superficie de parseo
- necesidad de confiar en estructuras genéricas

### Ejemplo sano

```java
public class ImportCustomersRequest {
    private List<CustomerImportRow> customers;
}
```

en vez de algo como:

```java
Map<String, Object>
```

o

```java
Object payload
```

o estructuras libres que después el backend tiene que “interpretar”.

### Idea importante

Un DTO fijo no resuelve todo.
Pero hace mucho más visible qué estás aceptando realmente.

---

## Las estructuras genéricas merecen cuidado extra

No siempre son malas.
A veces son inevitables.
Pero conviene tratarlas con mucha más sospecha.

### Ejemplos que merecen revisión

- `Object`
- `Map<String, Object>`
- árboles genéricos
- nodos JSON sin schema claro
- polimorfismo abierto
- payloads donde el cliente define “tipo” o “kind” y de eso sale demasiado comportamiento

Mientras más genérica sea la entrada, más disciplina necesitás para que no se convierta en un agujero de claridad y control.

---

## Lo cómodo para el framework no siempre es lo más seguro para el sistema

Este es otro patrón importante.

Un framework puede hacer muy fácil algo como:

- mapear automáticamente
- reconstruir clases
- aceptar payloads diversos
- parsear formatos complejos

Eso no significa que sea buena idea dejarlo lo más abierto posible.

### Regla sana

La comodidad del mapeo debería estar subordinada a:
- claridad del contrato
- control del input
- validación
- previsibilidad
- límites de complejidad

No al revés.

---

## Qué señales muestran que tu deserialización merece revisión

Estas cosas suelen hacer ruido rápido:

- `Object` como request body
- `Map<String, Object>` sin schema claro
- payloads arbitrarios que el backend “interpreta después”
- input que decide tipo de operación de forma demasiado libre
- estructuras gigantes o muy profundas sin límites
- nadie puede explicar exactamente qué forma acepta el endpoint
- librerías de deserialización usadas sin entender bien su comportamiento
- objetos reconstruidos desde archivos o mensajes con demasiada confianza

---

## Deserialización y archivos

Esto conecta con el tema anterior.

Cuando el backend recibe un archivo y luego:

- lo parsea
- lo importa
- lo descompone
- lo convierte en objetos internos

también está haciendo una forma de deserialización.

Por eso:
- uploads
- importaciones
- lectura de CSV/JSON/XML/YAML
- documentos estructurados

pueden compartir bastante superficie conceptual con este tema.

El peligro no empieza solo al almacenar el archivo.
También al **interpretarlo**.

---

## Deserialización y mensajería/integraciones

Otra zona importante es cuando el backend consume datos desde:

- colas
- eventos
- webhooks
- integraciones externas
- almacenamiento previo

A veces el input ya no viene de un navegador o cliente final, y por eso el equipo baja la guardia.

Pero sigue siendo input externo o semiexterno.
Y si el sistema reconstruye estructuras complejas sin suficiente control, el riesgo sigue estando.

---

## Qué conviene preguntarse siempre

Cuando una app deserializa algo, conviene preguntarse:

- ¿qué estructura exacta espero?
- ¿quién decide esa forma?
- ¿el contrato es fijo o demasiado abierto?
- ¿qué tan grande puede ser?
- ¿qué tan anidado puede venir?
- ¿qué tipos acepto realmente?
- ¿qué comportamiento posterior depende de lo que se reconstruyó?
- ¿qué parte valida que esto tenga sentido?
- ¿qué pasa si el input no es el que yo imaginé, pero igual parsea?

Estas preguntas ordenan muchísimo más que memorizar slogans.

---

## Qué gana el backend si piensa esto bien

Cuando el backend piensa mejor la deserialización, gana:

- contratos más claros
- menos payloads ambiguos
- menos superficie accidental
- menos confianza ciega en librerías de mapeo
- menos parseo costoso e innecesario
- mejor validación
- mejor capacidad de auditar qué acepta realmente cada endpoint

No es una paranoia académica.
Es claridad de frontera entre input y estructura interna.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- DTOs concretos
- contratos claros
- poca entrada genérica sin necesidad
- validación explícita
- límites razonables de tamaño y complejidad
- menor dependencia de tipos elegidos por input
- equipo que entiende qué está reconstruyendo y por qué

---

## Señales de ruido

Estas cosas suelen hacer ruido rápido:

- “aceptamos cualquier JSON y vemos”
- `Object` como payload por comodidad
- `Map<String, Object>` por todos lados
- parseo demasiado flexible
- input que define comportamiento interno sin demasiados límites
- nadie sabe bien qué formas soporta el endpoint
- librerías potentes usadas como caja negra

---

## Checklist práctico

Cuando revises deserialización en una app Spring, preguntate:

- ¿qué endpoints reconstruyen estructuras desde input externo?
- ¿usan DTOs concretos o estructuras genéricas?
- ¿qué tan fijo es el contrato?
- ¿qué tamaño o complejidad puede tener el payload?
- ¿qué parte del sistema valida sentido además de parseo?
- ¿qué librería reconstruye esos objetos?
- ¿qué pasa si el input viene con más forma, más profundidad o más libertad de la esperada?
- ¿qué partes del backend están confiando en que “si parseó, está bien”?
- ¿qué archivos o integraciones terminan convirtiéndose en objetos internos?
- ¿el equipo puede explicar claramente qué se está deserializando y con qué límites?

---

## Mini ejercicio de reflexión

Tomá tres puntos de entrada de tu backend y respondé:

1. ¿Qué formato reciben?
2. ¿Qué estructura reconstruyen?
3. ¿El contrato es fijo o muy abierto?
4. ¿Quién decide realmente esa forma?
5. ¿Qué pasa después con el objeto reconstruido?
6. ¿Qué validaciones hay además del parseo?
7. ¿Cuál de esos tres puntos te inspira menos confianza hoy y por qué?

Ese ejercicio ayuda muchísimo a detectar dónde el backend está interpretando más de lo que debería con menos límites de los necesarios.

---

## Resumen

Deserialización insegura, en su idea general, aparece cuando el backend reconstruye estructuras internas desde input externo con demasiado poder, demasiada libertad o demasiado poca validación.

No toda deserialización es mala.
Pero conviene desconfiar más cuando hay:

- estructuras genéricas
- contratos poco claros
- tipos abiertos
- payloads complejos
- archivos o mensajes interpretados después
- parseo costoso o demasiado flexible

En resumen:

> Un backend más maduro no se queda tranquilo solo porque el input “parsea bien”.  
> También quiere saber qué estructura está reconstruyendo, con qué límites y con qué costo para la seguridad y la estabilidad del sistema.

---

## Próximo tema

**Logs, trazabilidad y no filtrar secretos**
