---
title: "Definir y usar un profile en settings.xml"
description: "Vigésimo cuarto tema práctico del curso de Maven: aprender a crear un profile dentro de settings.xml, activarlo y entender cómo se diferencia de los profiles del pom.xml para usar configuración local de forma más consciente."
order: 24
module: "Configuración por contexto y entornos"
level: "base"
draft: false
---

# Definir y usar un `profile` en `settings.xml`

## Objetivo del tema

En este vigésimo cuarto tema vas a:

- aprender a definir un `profile` dentro de `settings.xml`
- entender cómo se diferencia de un profile dentro del `pom.xml`
- activar un profile del usuario en un caso simple
- ver cómo Maven también puede tomar perfiles desde fuera del proyecto
- seguir separando con más criterio configuración del proyecto y configuración del entorno

La idea es que uses `settings.xml` en un caso real y controlado, para que deje de ser solo una idea teórica y pase a sentirse como una herramienta concreta.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer y modificar el `pom.xml`
- usar `profiles` dentro del `pom.xml`
- entender qué es `settings.xml`
- ubicar tu carpeta `.m2`
- distinguir mejor entre configuración del proyecto y configuración del entorno

Si hiciste los temas anteriores, ya estás listo para este paso.

---

## Idea central del tema

En el tema anterior viste que `settings.xml` sirve para configuraciones más del entorno o del usuario que del proyecto.

Ahora vas a bajar esa idea a una práctica concreta:
usar un `profile` dentro de `settings.xml`.

Eso te muestra algo muy importante:

> no todos los perfiles tienen que vivir en el `pom.xml`; algunos pueden pertenecer más a tu entorno local y entonces tiene mucho sentido que vivan en `settings.xml`.

---

## Qué diferencia general hay con un profile del pom

Esto conviene dejarlo claro desde el principio.

### Profile en `pom.xml`
Suele estar ligado al proyecto.
Forma parte del archivo del proyecto y puede viajar con él.

### Profile en `settings.xml`
Suele estar ligado al usuario o al entorno.
No forma parte natural del proyecto compartido.
Vive en tu máquina o en el entorno donde Maven corre.

Entonces aparece una idea muy importante:

> un profile en `settings.xml` sirve cuando la variación que querés expresar es local o del entorno, no algo que debería quedar adentro del proyecto para todos.

---

## Dónde se define un profile en settings.xml

Dentro del archivo `settings.xml`, un profile se define en un bloque como este:

```xml
<settings ...>
    <profiles>
        <profile>
            <id>usuario-local</id>
            ...
        </profile>
    </profiles>
</settings>
```

Y si querés activarlo explícitamente desde el propio `settings.xml`, también puede haber una sección como:

```xml
<activeProfiles>
    <activeProfile>usuario-local</activeProfile>
</activeProfiles>
```

Esto ya te muestra dos cosas:

- podés definir perfiles
- podés decidir cuáles quedan activos

---

## Primer ejemplo mínimo

Supongamos que querés definir un profile local del usuario con una propiedad.

Podrías tener un `settings.xml` así:

```xml
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 https://maven.apache.org/xsd/settings-1.0.0.xsd">

    <profiles>
        <profile>
            <id>usuario-local</id>
            <properties>
                <usuario.contexto>maquina-local</usuario.contexto>
            </properties>
        </profile>
    </profiles>

    <activeProfiles>
        <activeProfile>usuario-local</activeProfile>
    </activeProfiles>

</settings>
```

## Qué significa esto

- existe un profile llamado `usuario-local`
- define una property:
  - `usuario.contexto=maquina-local`
- y además queda activo por defecto en este entorno

---

## Qué conviene entender ya

Este profile no vive en el proyecto.
Vive en tu configuración local de Maven.

Por eso puede ser útil para cosas como:

- ajustes del entorno
- perfiles personales o del equipo local
- configuración de usuario
- pruebas del entorno

No para decisiones nucleares del proyecto que deberían viajar con el repositorio.

---

## Una intuición muy útil

Podés pensarlo así:

- profile en `pom.xml` = “variante del proyecto”
- profile en `settings.xml` = “variante de mi entorno Maven”

Esa diferencia es central.

---

## Primer experimento práctico

Si ya tenés un `settings.xml`, abrilo.
Si no lo tenés, crealo mínimo primero.

Después agregá algo así:

```xml
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 https://maven.apache.org/xsd/settings-1.0.0.xsd">

    <profiles>
        <profile>
            <id>usuario-local</id>
            <properties>
                <usuario.contexto>maquina-local</usuario.contexto>
            </properties>
        </profile>
    </profiles>

    <activeProfiles>
        <activeProfile>usuario-local</activeProfile>
    </activeProfiles>
</settings>
```

Ahora corré en tu proyecto:

```bash
mvn help:effective-pom -Doutput=effective-pom-settings.xml
```

## Qué deberías buscar

Abrí el effective POM y buscá:

- `usuario.contexto`

## Qué objetivo tiene

Ver si esa propiedad del `settings.xml` aparece en el modelo efectivo que Maven termina usando.

Eso te muestra que la configuración externa sí influye en el resultado real.

---

## Qué aprendiste con esto

Que `settings.xml` no está aislado de todo.
No es un archivo muerto.
Puede afectar la configuración efectiva con la que Maven trabaja en tu entorno.

Eso ya es una comprensión muy valiosa.

---

## Segundo experimento: activar y desactivar el profile del usuario

Primero probá con `activeProfiles` activo.

Generá el effective POM y verificá que la property aparezca.

Después probá comentar o sacar esta parte:

```xml
<activeProfiles>
    <activeProfile>usuario-local</activeProfile>
</activeProfiles>
```

Y volvé a generar el effective POM.

## Qué deberías observar

Si el profile ya no está activo,
la property debería desaparecer del effective POM.

## Qué aprendiste con esto

Que no alcanza con definir el profile.
También importa si está activo o no.

Esto es igual de importante que en los profiles del `pom.xml`,
solo que ahora ocurre en la capa del entorno.

---

## Qué diferencia hay con activar un profile del proyecto con -P

En el `pom.xml`, ya viste cosas como:

```bash
mvn clean package -Pdev
```

Eso apunta a un profile definido en el proyecto.

En `settings.xml`, el profile puede quedar activo desde la propia configuración local del usuario,
sin que tengas que tocar necesariamente el `pom.xml` del proyecto.

Entonces aparece una idea importante:

> un profile del usuario puede influir en Maven incluso sin modificar el proyecto en sí, porque vive en la capa externa de configuración.

---

## Ejercicio 1 — definir un profile local simple

Quiero que hagas esto:

### Paso 1
Abrí o creá tu `settings.xml`.

### Paso 2
Definí un profile con `id`:
- `usuario-local`

### Paso 3
Dentro, agregá una property, por ejemplo:
- `usuario.contexto=maquina-local`

### Paso 4
Activá el profile dentro de `activeProfiles`.

### Paso 5
Generá el effective POM y verificá si la property aparece.

### Objetivo
Sentir de forma concreta cómo una capa local externa entra al modelo efectivo.

---

## Qué relación tiene esto con la claridad del proyecto

Muy fuerte.

Porque justo este tema te obliga a reforzar una pregunta importante:

- ¿esto pertenece al proyecto?
o
- ¿esto pertenece a mi entorno?

Si la respuesta es:
- “a mi entorno”

entonces un profile en `settings.xml` puede tener más sentido que meter esa lógica dentro del `pom.xml`.

Eso mejora bastante la limpieza conceptual del proyecto.

---

## Qué no conviene meter en un profile local del usuario

No conviene esconder ahí cosas que el proyecto debería dejar claras para cualquiera.

Por ejemplo, en general no tendría mucho sentido esconder solo en tu `settings.xml` cosas como:

- dependencias centrales del proyecto
- identidad del proyecto
- decisiones compartidas de build que otros también necesitan ver

Porque eso vuelve al proyecto demasiado dependiente de configuración invisible.

Entonces aparece una verdad importante:

> un profile de `settings.xml` es útil cuando la configuración realmente pertenece al entorno local; si no, puede volver el proyecto más opaco.

---

## Una intuición muy útil

Podés pensarlo así:

> cuanto más local sea la necesidad, más sentido puede tener el profile en `settings.xml`; cuanto más compartida sea la necesidad, más sentido suele tener el profile en el `pom.xml`.

Esa frase vale muchísimo.

---

## Error común 1 — usar settings.xml para esconder decisiones del proyecto

Eso después genera cosas como:
- “en mi máquina anda”
- “en otra no”
- “nadie entiende por qué”

Y eso no conviene.

---

## Error común 2 — no recordar que activeProfiles deja cosas activas por defecto

Si dejás un profile activo en `settings.xml`,
puede afectar Maven cada vez que trabajás,
aunque después te olvides.

Por eso conviene saber qué dejaste activo.

---

## Error común 3 — no verificar con effective POM

Otra vez, esta herramienta vuelve a ser clave.

Si no verificás,
podés creer que el profile influye o que no influye sin tener evidencia concreta.

---

## Error común 4 — pensar que settings.xml reemplaza al pom

No.
Son capas distintas.

- el `pom.xml` sigue siendo el archivo central del proyecto
- `settings.xml` sigue siendo la capa de entorno

No compiten.
Se complementan.

---

## Ejercicio 2 — comparar proyecto con y sin profile local activo

Quiero que hagas este flujo:

### Paso 1
Dejá activo tu profile en `settings.xml`.

### Paso 2
Generá:

```bash
mvn help:effective-pom -Doutput=effective-pom-con-settings.xml
```

### Paso 3
Desactivá el profile sacándolo de `activeProfiles`.

### Paso 4
Generá:

```bash
mvn help:effective-pom -Doutput=effective-pom-sin-settings.xml
```

### Paso 5
Compará ambos archivos.

### Objetivo
Ver de forma concreta cuánto puede cambiar el proyecto efectivo cuando una configuración externa del usuario entra en juego.

---

## Qué relación tiene esto con equipos o entornos compartidos

Muchísima.

En equipos reales,
a veces existen configuraciones locales necesarias para ciertos accesos o entornos.
`settings.xml` aparece ahí como una herramienta lógica.

Pero justamente por eso conviene usarlo con criterio:
- para configuración local o de entorno,
- no como escondite de la lógica del proyecto.

---

## Ejercicio 3 — escribir una frontera conceptual

Quiero que respondas por escrito esta pregunta:

> Si quisiera definir un valor que solo tiene sentido en mi máquina, ¿lo pondría en el `pom.xml` o en `settings.xml`? ¿Por qué?

Y esta otra:

> Si quisiera definir una decisión que cualquier persona del proyecto debería ver y compartir, ¿dónde la pondría?

El objetivo es que te quede cada vez más fuerte la frontera entre ambas capas.

---

## Qué no conviene olvidar

Este tema no pretende que llenes `settings.xml` de profiles complejos.

Lo que sí quiere dejarte es una práctica concreta y muy valiosa:

- `settings.xml` también puede tener profiles
- esos profiles pueden activarse
- y pueden influir en el proyecto efectivo
- pero hay que usarlos para cosas del entorno, no para esconder la lógica del proyecto

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Definí un profile simple en `settings.xml`.

### Ejercicio 2
Hacé que ese profile agregue una property.

### Ejercicio 3
Activá el profile en `activeProfiles`.

### Ejercicio 4
Generá el effective POM.

### Ejercicio 5
Buscá la property en el effective POM.

### Ejercicio 6
Desactivá el profile y repetí la verificación.

### Ejercicio 7
Escribí con tus palabras qué te mostró este experimento sobre la diferencia entre `pom.xml` y `settings.xml`.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué diferencia hay entre un profile en `pom.xml` y uno en `settings.xml`?
2. ¿Cómo se activa un profile en `settings.xml` en este caso inicial?
3. ¿Qué comando te conviene usar para verificar si tuvo efecto?
4. ¿Qué riesgo hay si usás profiles locales para esconder decisiones del proyecto?
5. ¿Qué tipo de configuración sí parece tener sentido en un profile local?

---

## Mini desafío

Creá una práctica real en tu entorno y hacé esto:

1. creá `settings.xml` si no existe
2. agregá un profile llamado `usuario-local`
3. hacé que agregue una property
4. activalo con `activeProfiles`
5. generá el effective POM
6. desactivalo
7. generá de nuevo el effective POM
8. escribí una nota corta explicando qué cambió y por qué eso demuestra que Maven tiene una capa de configuración fuera del proyecto

Tu objetivo es que `settings.xml` deje de ser una idea abstracta y pase a sentirse como una parte real del modelo de configuración de Maven.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este vigésimo cuarto tema, ya deberías poder:

- definir un profile simple en `settings.xml`
- activarlo desde `activeProfiles`
- verificar su efecto en el effective POM
- entender mejor la diferencia entre perfiles del proyecto y perfiles del entorno
- y usar `settings.xml` con mucha más naturalidad y criterio

---

## Resumen del tema

- `settings.xml` también puede contener profiles.
- Esos profiles pertenecen más al entorno o al usuario que al proyecto.
- Pueden activarse con `activeProfiles`.
- Su efecto puede verificarse con `mvn help:effective-pom`.
- Son útiles cuando la necesidad es local, no cuando deberían expresar decisiones centrales del proyecto.
- Ya sumaste una aplicación concreta y controlada de la configuración externa de Maven.

---

## Próximo tema

En el próximo tema vas a aprender a cambiar la ubicación del repositorio local de Maven y a entender mejor qué impacto tiene eso, porque después de ver que `settings.xml` puede modificar el comportamiento del entorno, el siguiente paso natural es usarlo para tocar una de las piezas más visibles de la capa local: dónde Maven guarda realmente los artefactos descargados e instalados.
