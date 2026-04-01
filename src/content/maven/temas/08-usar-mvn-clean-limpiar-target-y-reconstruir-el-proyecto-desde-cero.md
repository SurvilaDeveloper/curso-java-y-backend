---
title: "Usar mvn clean: limpiar target y reconstruir el proyecto desde cero"
description: "Octavo tema práctico del curso de Maven: aprender qué hace mvn clean, cuándo conviene usarlo, qué borra exactamente y cómo combinarlo con compile, test, package e install para reconstruir un proyecto desde cero."
order: 8
module: "Fundamentos de Maven"
level: "intro"
draft: false
---

# Usar `mvn clean`: limpiar `target` y reconstruir el proyecto desde cero

## Objetivo del tema

En este octavo tema vas a:

- entender qué hace `mvn clean`
- aprender qué carpeta limpia Maven
- distinguir entre limpiar y compilar
- ver cuándo conviene reconstruir desde cero
- combinar `clean` con `compile`, `test`, `package` e `install`
- incorporar una práctica muy común del día a día con Maven

La idea es que entiendas que `clean` no compila ni testea ni empaqueta:
solo limpia lo generado por el build anterior.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer el `pom.xml`
- agregar dependencias
- entender el lifecycle principal
- distinguir `package` e `install`
- entender scopes básicos
- usar:
  - `mvn compile`
  - `mvn test`
  - `mvn package`
  - `mvn install`

Si venís siguiendo el curso, ya tenés la base perfecta.

---

## Idea central del tema

Cuando trabajás con Maven, muchísimas cosas generadas por el build van a una carpeta llamada:

```text
target
```

Ahí Maven suele dejar:

- clases compiladas
- clases de test
- reportes
- el `.jar`
- archivos intermedios del build

A veces querés conservar eso.
Pero otras veces conviene borrarlo y reconstruir todo desde cero.

Para eso existe:

```bash
mvn clean
```

Dicho simple:

> `mvn clean` limpia lo que Maven generó antes para que el próximo build arranque desde cero.

---

## Qué hace exactamente `mvn clean`

Cuando ejecutás:

```bash
mvn clean
```

Maven ejecuta el lifecycle de limpieza y normalmente elimina la carpeta:

```text
target
```

Eso es lo más importante que tenés que recordar.

No compila.
No corre tests.
No genera jars.
Solo limpia.

---

## Primer experimento práctico

Ubicate en tu proyecto y asegurate de tener algo generado.
Por ejemplo, corré:

```bash
mvn package
```

Después revisá la carpeta del proyecto.
Deberías ver:

```text
target
```

Y dentro, archivos generados por el build.

Ahora corré:

```bash
mvn clean
```

## Qué deberías observar

La carpeta `target` desaparece.

Ese es el resultado central de `clean`.

---

## Qué aprendiste ya

Que `clean` no trabaja sobre tu código fuente.
Trabaja sobre lo generado.

No toca normalmente:

- `src/main/java`
- `src/test/java`
- `pom.xml`

Lo que borra es el resultado del build.

---

## Qué diferencia hay entre código fuente y archivos generados

Esto es clave.

### Código fuente
Es lo que vos escribís:
- `.java`
- tests
- recursos
- `pom.xml`

### Archivos generados
Es lo que Maven produce:
- `.class`
- reportes
- artefactos
- archivos dentro de `target`

Entonces aparece una idea importante:

> `mvn clean` no te borra el proyecto; te borra el resultado generado del proyecto.

---

## Segundo experimento: clean + compile

Corré:

```bash
mvn clean
mvn compile
```

## Qué pasó acá

### `mvn clean`
Borró `target`.

### `mvn compile`
Volvió a crear `target` y compiló desde cero.

Esto ya te deja ver un flujo muy común:

```bash
mvn clean compile
```

---

## Tercer experimento: clean + package

Corré:

```bash
mvn clean package
```

## Qué significa esto

Le estás pidiendo a Maven:

1. limpiá lo anterior
2. reconstruí el proyecto hasta empaquetar

En la práctica, esto suele usarse muchísimo porque te asegura un build fresco.

---

## Cuarto experimento: clean + install

Corré:

```bash
mvn clean install
```

## Qué significa

Le estás diciendo:

1. borrá lo generado anteriormente
2. compilá
3. testeá
4. empaquetá
5. instalá en el repositorio local

Este también es un comando muy común.

---

## Una intuición muy útil

Podés pensarlo así:

### `mvn package`
Construí sobre el estado actual del proyecto.

### `mvn clean package`
Borrá el resultado anterior y construí todo de nuevo.

Esta diferencia es simple pero importantísima.

---

## ¿Cuándo conviene usar `clean`?

No hace falta usarlo absolutamente siempre.
Pero sí conviene bastante en situaciones como:

### 1. Cuando querés asegurarte de reconstruir todo desde cero
Para descartar residuos del build anterior.

### 2. Cuando algo raro parece haber quedado generado
Por ejemplo:
- clases viejas
- empaquetados desactualizados
- resultados inconsistentes

### 3. Antes de un build más “serio”
Por ejemplo:
- generar un `.jar`
- validar algo para entrega
- instalar una versión limpia

### 4. Cuando querés entender mejor qué produce realmente Maven
Porque al limpiar y reconstruir, ves más claramente qué vuelve a aparecer.

---

## ¿Cuándo no hace falta necesariamente usarlo?

No siempre hace falta si:

- solo hiciste cambios chicos
- solo querés compilar rápido
- el proyecto ya está en estado normal
- no hay señales de build “sucio”

Maven puede recompilar sin necesidad de limpiar todo antes.

Entonces aparece una verdad importante:

> `clean` es muy útil, pero no tiene que volverse un reflejo automático sin entender para qué lo usás.

---

## Qué significa “build limpio”

Cuando alguien dice algo como:
- “corré un clean build”

normalmente quiere decir:
- borrá lo generado
- reconstruí de cero

Por ejemplo:

```bash
mvn clean package
```

o

```bash
mvn clean install
```

La idea es reducir la posibilidad de que el resultado dependa de restos del build anterior.

---

## Error común 1 — creer que `clean` compila

No.
`clean` solo limpia.

Si corrés:

```bash
mvn clean
```

y nada más,
no vas a tener:

- `.class`
- `.jar`
- resultados de tests
- nada reconstruido

Solo habrás borrado `target`.

---

## Error común 2 — pensar que `clean` borra código fuente

Tampoco.
No te borra:
- `App.java`
- tests
- `pom.xml`

Solo borra lo generado por Maven.

---

## Error común 3 — usar siempre `clean` sin pensar

Es muy común hacer esto:

```bash
mvn clean install
```

para absolutamente todo.

No está prohibido.
Pero tampoco siempre hace falta.

Conviene entender:
- qué problema querés resolver
- y si realmente necesitás empezar desde cero

---

## Error común 4 — no usar `clean` cuando el build parece raro

También pasa el extremo contrario.
A veces alguien cambia cosas, el build queda inconsistente y nunca limpia.

En esos casos, `clean` suele ser una buena primera herramienta para despejar dudas.

---

## Ejercicio 1 — observar la desaparición de target

Quiero que hagas esto sí o sí:

### Paso 1
Corré:

```bash
mvn package
```

### Paso 2
Entrá a `target` y mirá qué hay.

### Paso 3
Corré:

```bash
mvn clean
```

### Paso 4
Verificá que `target` desaparezca.

### Objetivo
Asociar visualmente `clean` con limpieza de build generado.

---

## Ejercicio 2 — reconstrucción completa

Ahora hacé este flujo:

```bash
mvn clean
mvn compile
mvn test
mvn package
```

Observá cómo Maven va recreando `target` y sus contenidos.

La idea es que sientas la secuencia completa:
- limpiar
- reconstruir

---

## Ejercicio 3 — comparar con y sin clean

### Opción A
Corré:

```bash
mvn package
```

### Opción B
Corré:

```bash
mvn clean package
```

Después respondé con tus palabras:

- ¿qué diferencia conceptual hay entre ambos?
- ¿qué agrega `clean`?
- ¿en qué caso te sentirías más seguro con uno u otro?

---

## Qué relación tiene `clean` con el lifecycle

Esto es interesante.

Hasta ahora trabajaste mucho con fases del lifecycle principal:
- `compile`
- `test`
- `package`
- `install`

Pero `clean` pertenece a otro lifecycle:
- el de limpieza

No hace falta que te compliques demasiado todavía.
Solo quedate con esta idea:

> Maven no tiene un solo lifecycle. `clean` pertenece al ciclo de limpieza, no al build principal.

Eso te va abriendo la cabeza para entender mejor su estructura.

---

## Qué aparece en la salida de `mvn clean`

Corré:

```bash
mvn clean
```

Podrías ver algo parecido a:

```bash
[INFO] --- clean:...:clean (default-clean) @ mi-primer-proyecto-maven ---
[INFO] Deleting .../target
[INFO] BUILD SUCCESS
```

## Qué significa esto

- Maven ejecutó el plugin de limpieza
- detectó `target`
- lo eliminó
- terminó bien

No hace falta leer más que eso al principio.

---

## Ejercicio 4 — provocar un “build raro” y limpiar

Este ejercicio es simple pero útil.

### Paso 1
Corré:

```bash
mvn package
```

### Paso 2
Mirá `target`.

### Paso 3
Cambiá alguna clase Java.

### Paso 4
Corré otra vez:

```bash
mvn package
```

### Paso 5
Después corré:

```bash
mvn clean package
```

### Objetivo
Empezar a sentir la diferencia entre:
- seguir construyendo sobre lo actual
- y reconstruir desde cero

---

## Qué no conviene olvidar

`clean` no es “mejor” en sí mismo.
Es una herramienta para una necesidad concreta.

Conviene usarlo con intención,
igual que todo lo que venís aprendiendo con Maven.

---

## Una intuición muy útil

Podés pensarlo así:

> `clean` no te hace avanzar en el lifecycle principal; te prepara el terreno para que ese avance ocurra desde cero.

Esa idea vale muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Corré:

```bash
mvn package
```

y verificá que exista `target`.

### Ejercicio 2
Corré:

```bash
mvn clean
```

y comprobá que `target` desaparezca.

### Ejercicio 3
Corré:

```bash
mvn clean compile
```

y verificá que `target` vuelva a aparecer.

### Ejercicio 4
Corré:

```bash
mvn clean package
```

y verificá que se regenere el `.jar`.

### Ejercicio 5
Respondé:
- ¿qué hace `clean`?
- ¿qué no hace `clean`?
- ¿cuándo lo usarías?

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué carpeta limpia Maven normalmente al ejecutar `clean`?
2. ¿Qué diferencia hay entre `mvn package` y `mvn clean package`?
3. ¿`clean` compila?
4. ¿`clean` borra el código fuente?
5. ¿Por qué puede ser útil reconstruir desde cero?

---

## Mini desafío

Creá un proyecto nuevo o usá el actual y hacé este flujo completo:

```bash
mvn clean
mvn compile
mvn test
mvn package
mvn install
```

Después explicá con tus palabras qué dejó cada etapa y qué cambió en el proyecto después de cada comando.

Este ejercicio te ordena muchísimo la cabeza sobre cómo trabaja Maven.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este octavo tema, ya deberías poder:

- entender qué hace `mvn clean`
- saber que limpia `target`
- diferenciar entre limpiar y construir
- combinar `clean` con otras fases del build
- decidir con más criterio cuándo conviene reconstruir desde cero
- y dejar de ver `clean` como un comando misterioso

---

## Resumen del tema

- `mvn clean` limpia lo generado por Maven, especialmente `target`.
- No compila, no testea y no empaqueta.
- `mvn clean package` significa: limpiar y reconstruir hasta empaquetar.
- `clean` pertenece al lifecycle de limpieza, no al build principal.
- Es muy útil para reconstrucciones limpias y para resolver builds extraños.
- No hace falta usarlo siempre, pero sí conviene saber exactamente para qué sirve.

---

## Próximo tema

En el próximo tema vas a aprender a crear un `.jar` con más intención y a entender mejor qué contiene realmente el artefacto generado, porque después de aprender a limpiar y reconstruir el proyecto, el siguiente paso natural es mirar más de cerca el resultado empaquetado y no tratarlo solo como “un archivo que aparece en target”.
