---
title: "Volumen vs bind mount: cuándo conviene uno y cuándo conviene el otro"
description: "Tema 24 del curso práctico de Docker: comparación clara entre volúmenes y bind mounts, sus diferencias prácticas y cómo elegir la opción más razonable según si buscás persistencia, compartición con el host o un mejor flujo de desarrollo."
order: 24
module: "Datos y archivos"
level: "base"
draft: false
---

# Volumen vs bind mount: cuándo conviene uno y cuándo conviene el otro

## Objetivo del tema

En este tema vas a:

- comparar volúmenes y bind mounts con claridad
- entender qué problema resuelve mejor cada uno
- ver cuándo conviene usar uno u otro
- evitar elecciones por costumbre o por confusión
- construir un criterio simple para proyectos reales

La idea es que no te quedes solo con “sé crear los dos”, sino con “sé cuál me conviene según el caso”.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. comparar la idea base de volumen y bind mount
2. ver sus diferencias más importantes
3. analizar casos típicos de uso
4. construir una regla práctica de decisión
5. cerrar el mini bloque de persistencia con una brújula clara

---

## Idea central que tenés que llevarte

Tanto los volúmenes como los bind mounts sirven para montar almacenamiento dentro de un contenedor.

Pero no están pensados exactamente para lo mismo.

Dicho simple:

- **volumen**: suele ser mejor cuando querés persistencia administrada por Docker y datos desacoplados del host
- **bind mount**: suele ser mejor cuando querés compartir una ruta concreta de tu máquina con el contenedor

Esa es la gran diferencia.

---

## Qué dice la documentación oficial

Docker lo resume de forma bastante directa: los **volume mounts** son muy buenos para almacenar datos persistentes y compartirlos entre contenedores, mientras que los **bind mounts** están pensados para compartir datos entre el contenedor y el host. Además, en un bind mount vos elegís la ruta exacta del host, mientras que en un volumen Docker administra la ubicación del almacenamiento. citeturn137156search11turn137156search1turn137156search0

---

## Comparación conceptual rápida

### Volumen
- Docker administra dónde vive
- está desacoplado de una ruta concreta del host
- suele ser una opción muy buena para persistencia duradera
- suele funcionar mejor como almacenamiento de aplicación

### Bind mount
- vos elegís una ruta concreta del host
- el contenedor ve esa ruta directamente
- es muy útil para compartir código, archivos o configuraciones con tu máquina
- depende más de la estructura concreta del host

---

## Diferencia 1: quién controla la ubicación del dato

Esta es una diferencia muy importante.

### Con volumen
Docker crea y mantiene la ubicación del almacenamiento. La documentación oficial remarca que un volumen usa una ubicación dentro del almacenamiento administrado por Docker en el host. citeturn137156search1turn137156search0

### Con bind mount
Vos elegís exactamente qué ruta del host querés montar. Docker indica que un bind mount enlaza una ruta concreta del host con una ruta del contenedor. citeturn137156search0turn137156search3

---

## Diferencia 2: relación con el host

### Volumen
Está más desacoplado de la estructura de carpetas de tu máquina. Docker incluso destaca que los volúmenes son más fáciles de respaldar o migrar que los bind mounts. citeturn137156search1

### Bind mount
Está muy atado al host. Docker advierte que los contenedores con bind mounts quedan fuertemente ligados a la estructura del filesystem del host, y pueden fallar en otra máquina si esa ruta no existe o no coincide. citeturn137156search0

---

## Diferencia 3: persistencia de datos de aplicación

### Volumen
Suele ser una muy buena opción para datos que querés conservar aunque cambie el contenedor, por ejemplo bases de datos, archivos subidos o contenido generado por la aplicación. Docker lo presenta como una solución fuerte para persistencia y compartición entre contenedores. citeturn137156search1turn137156search11

### Bind mount
También puede conservar datos, porque esos archivos viven en el host, pero no suele ser la opción más desacoplada ni la más cómoda para almacenamiento “interno” de aplicación cuando lo que querés es persistencia gestionada por Docker. citeturn137156search5turn137156search0

---

## Diferencia 4: desarrollo local

### Volumen
Puede usarse en desarrollo, sí, pero no es la opción más natural si querés editar archivos directamente desde tu editor del host.

### Bind mount
Acá suele brillar mucho más. Docker lo recomienda justamente para compartir código fuente, artefactos de build o archivos de configuración entre el host y el contenedor. En su workshop oficial, también muestra bind mounts para montar código y ver cambios de archivos desde el host dentro del contenedor. citeturn137156search0turn137156search2

---

## Diferencia 5: seguridad y cuidado con el host

Docker advierte que los bind mounts tienen acceso de escritura al host por defecto, lo que significa que procesos dentro del contenedor pueden modificar archivos del host, incluso de manera peligrosa si montás rutas sensibles. También recuerda que se pueden montar como solo lectura con `readonly` o `ro`. citeturn137156search0

Eso no significa que sean “malos”.
Significa que conviene usarlos con más conciencia porque tocan directamente tu filesystem real.

---

## Regla práctica simple

Si querés una regla mental rápida, podría ser esta:

### Elegí volumen cuando...
- querés persistir datos de la app
- querés desacoplarte del host
- querés compartir almacenamiento entre contenedores
- querés una opción más natural para bases de datos o datos duraderos

### Elegí bind mount cuando...
- querés compartir código fuente con el contenedor
- querés editar desde tu host y ver cambios rápido
- necesitás montar una config o archivo concreto del host
- tu prioridad es el flujo de desarrollo local

---

## Caso típico 1: base de datos

Si corrés PostgreSQL, MySQL o MongoDB para guardar datos reales, normalmente un **volumen** suele ser la opción más razonable. Docker incluso destaca los volúmenes como una buena solución para persistencia y para compartir almacenamiento entre contenedores. citeturn137156search1turn137156search11

---

## Caso típico 2: código fuente de una app en desarrollo

Si querés abrir tu proyecto en el editor, guardar cambios y que el contenedor los vea enseguida, normalmente un **bind mount** suele ser la opción más natural. Docker lo muestra justo para compartir source code o artefactos entre host y contenedor. citeturn137156search0turn137156search2

---

## Caso típico 3: archivos de configuración locales

Si tenés un archivo concreto del host que querés montar en el contenedor, por ejemplo una configuración que editás localmente, un **bind mount** suele ser muy práctico. Docker lo incluye entre los usos típicos de bind mounts. citeturn137156search0

---

## Caso típico 4: datos generados por la app que querés conservar pero no te interesa ubicar a mano en el host

Acá normalmente un **volumen** suele tener más sentido, porque Docker administra la ubicación y el dato queda menos atado a una ruta específica del host. Además, Docker lo describe como más fácil de respaldar o migrar que un bind mount. citeturn137156search1

---

## Qué no tenés que confundir

### “Bind mount” no significa automáticamente “mejor”
Es mejor solo si necesitás compartir una ruta concreta del host.

### “Volumen” no significa automáticamente “más cómodo para desarrollo”
Depende del flujo que quieras.

### Ambos pueden persistir datos
La diferencia no es solo “persiste / no persiste”, sino **cómo** viven esos datos y qué grado de acoplamiento tienen con el host. citeturn137156search0turn137156search1

---

## Error común 1: usar bind mount para todo

Eso puede hacer que tu contenedor dependa demasiado de rutas concretas del host, algo que Docker señala explícitamente como una limitación. citeturn137156search0

---

## Error común 2: usar volumen cuando en realidad querías editar archivos locales cómodamente

Si tu objetivo principal es trabajar con código o archivos desde el host, un bind mount muchas veces encaja mejor. Docker lo plantea justo para eso. citeturn137156search0turn137156search2

---

## Error común 3: no pensar en la portabilidad

Los volúmenes suelen quedar más desacoplados de la estructura de carpetas de tu máquina, mientras que los bind mounts dependen del filesystem del host. Esa diferencia importa bastante cuando cambiás de máquina o querés un entorno menos frágil. citeturn137156search1turn137156search0

---

## Error común 4: montar rutas sensibles del host sin cuidado

Docker advierte que los bind mounts tienen acceso de escritura al host por defecto. Eso exige atención, sobre todo si montás carpetas importantes o del sistema. citeturn137156search0

---

## Ejercicio práctico obligatorio

Quiero que hagas este ejercicio de decisión.

### Ejercicio 1
Tomá estos cuatro casos y elegí qué usarías en cada uno:

1. una base PostgreSQL con datos que querés conservar
2. una app frontend en desarrollo donde editás archivos desde VS Code
3. un archivo de configuración local que querés montar dentro del contenedor
4. una carpeta de datos generados por la app que querés conservar, pero sin depender de una ruta manual del host

### Ejercicio 2
Para cada caso, respondé:

- ¿volumen o bind mount?
- ¿por qué?
- ¿qué problema te resuelve mejor?
- ¿qué riesgo o limitación te parece importante considerar?

---

## Segundo ejercicio de análisis

Compará estas dos ideas y explicalas con tus palabras:

### Idea A
“Quiero que el dato sobreviva aunque cambie el contenedor.”

### Idea B
“Quiero editar archivos reales de mi máquina y que el contenedor los vea enseguida.”

Respondé:

- cuál se parece más a un volumen
- cuál se parece más a un bind mount
- por qué no son exactamente el mismo problema

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿en qué casos ya te resulta obvio elegir volumen?
- ¿en qué casos ya te resulta obvio elegir bind mount?
- ¿qué valor práctico le ves al desacoplamiento de los volúmenes?
- ¿qué valor práctico le ves a la inmediatez de los bind mounts para desarrollo?
- ¿qué errores de decisión te imaginás que podrías evitar a partir de ahora?

Estas observaciones valen mucho más que repetir una regla rígida.

---

## Mini desafío

Intentá construir tu propia regla corta para decidir entre ambos.

Por ejemplo, completá esta frase con tus palabras:

> “Si quiero ________, probablemente me conviene un volumen.  
> Si quiero ________, probablemente me conviene un bind mount.”

Y además respondé:

- ¿qué tipo de proyecto tuyo pediría más volumen?
- ¿qué tipo de proyecto tuyo pediría más bind mount?
- ¿qué combinación de ambos te imaginás en una app real?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- comparar volúmenes y bind mounts con claridad
- explicar cuándo conviene uno y cuándo el otro
- reconocer el papel de cada uno en persistencia y desarrollo
- detectar riesgos y limitaciones de cada enfoque
- tomar decisiones más razonables en proyectos reales

---

## Resumen del tema

- Tanto volúmenes como bind mounts montan almacenamiento dentro de contenedores.
- Los volúmenes suelen ser mejores para persistencia administrada por Docker y datos desacoplados del host.
- Los bind mounts suelen ser mejores para compartir una ruta concreta del host con el contenedor.
- Los volúmenes son más fáciles de respaldar o migrar que los bind mounts. citeturn137156search1
- Los bind mounts son muy útiles para desarrollo, pero dependen más de la estructura del host y tienen más impacto directo sobre su filesystem. citeturn137156search0
- Elegir bien entre ambos te evita muchos problemas más adelante.

---

## Próximo tema

En el próximo tema vas a llevar esto a un caso muy usado en la práctica:

- persistir una base de datos
- montar almacenamiento en un contenedor de base
- empezar a pensar datos duraderos en un servicio real
