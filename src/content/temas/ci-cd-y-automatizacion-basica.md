---
title: "CI/CD y automatización básica"
description: "Qué es CI/CD, por qué importa en proyectos backend y cómo empezar a automatizar tests, builds y validaciones básicas de forma profesional."
order: 55
module: "Operación y presentación profesional"
level: "intermedio"
draft: false
---

## Introducción

Hasta ahora ya recorriste una parte muy fuerte del camino:

- lenguaje
- Spring Boot
- persistencia
- seguridad
- testing
- Docker
- observabilidad
- cache
- documentación y README profesional

Eso ya te permite construir y presentar un backend bastante serio.

Pero ahora aparece otra pregunta muy importante:

**¿cómo hacés para que ciertas verificaciones y pasos importantes no dependan siempre de hacerlo todo a mano?**

Por ejemplo:

- correr tests
- verificar que el build funcione
- detectar errores antes de mezclar cambios
- validar que el proyecto siga sano después de cada commit o push

Ahí entra CI/CD.

## Qué es CI/CD

CI/CD es una sigla muy usada en ingeniería de software.

Suele dividirse en dos partes:

- CI → Continuous Integration
- CD → Continuous Delivery o Continuous Deployment

## Qué significa CI

Integración continua significa automatizar verificaciones frecuentes sobre el proyecto a medida que se integran cambios.

Dicho simple:

cada vez que el código cambia, querés comprobar automáticamente que ciertas cosas sigan bien.

## Qué significa CD

La parte de CD apunta a automatizar o facilitar la entrega y despliegue del software.

Dependiendo del contexto, puede significar:

- dejar un build listo para entregar
- automatizar despliegue a cierto entorno
- publicar artefactos
- reducir pasos manuales del release

## La idea general

Supongamos que hacés cambios en tu backend y los subís al repositorio.

Sin automatización, podrías olvidarte de:

- correr tests
- verificar que compile
- comprobar que el empaquetado funcione
- validar que no rompiste algo básico

Con CI/CD, parte de eso puede ejecutarse automáticamente.

## Qué problema resuelve

CI/CD ayuda a reducir cosas como:

- errores que llegan tarde
- builds rotos que nadie detectó
- pasos manuales repetitivos
- diferencias entre “lo que alguien hizo localmente” y “lo que realmente pasó al integrar”
- despliegues demasiado artesanales

## Por qué esto importa tanto

Porque a medida que el proyecto crece, el costo de confiar solo en memoria humana también crece.

Automatizar pasos importantes mejora:

- confianza
- velocidad
- consistencia
- calidad del proyecto
- mantenibilidad

## Qué conviene automatizar primero

No hace falta construir una maquinaria enorme desde el día uno.

Una estrategia muy sana es empezar por automatizar cosas básicas pero valiosas.

Por ejemplo:

- correr tests
- compilar
- empaquetar
- validar el proyecto en cada push o pull request

Eso ya suma muchísimo.

## Continuous Integration en un proyecto backend Java

En un backend con Maven y Spring Boot, una pipeline básica de CI podría hacer cosas como:

1. clonar el repositorio
2. instalar o preparar Java
3. correr `mvn test`
4. correr `mvn package`
5. marcar el resultado como exitoso o fallido

Eso ya sirve para detectar problemas temprano.

## Qué no hace falta al principio

No hace falta arrancar directamente con:

- múltiples entornos
- despliegue automático completo a producción
- orquestación compleja
- matrix enorme de versiones
- pipelines gigantes

Primero conviene tener una automatización simple y confiable.

## Ejemplo de preguntas que CI responde

- ¿el proyecto compila?
- ¿los tests pasan?
- ¿se puede generar el `.jar`?
- ¿un cambio rompió algo básico?
- ¿el proyecto sigue sano en un entorno limpio?

## Por qué importa el “entorno limpio”

En tu máquina pueden quedar cosas configuradas que enmascaren problemas.

Por ejemplo:

- caches
- variables locales
- dependencias ya presentes
- archivos temporales
- configuraciones no versionadas

Una pipeline en un entorno limpio ayuda a detectar si el proyecto realmente puede construirse de forma reproducible.

## Herramientas comunes para CI/CD

Existen muchas herramientas posibles.

Por ejemplo:

- GitHub Actions
- GitLab CI
- Jenkins
- CircleCI
- Azure Pipelines
- otras

Para una etapa inicial y proyectos personales o de portfolio, GitHub Actions suele ser una puerta de entrada muy razonable y popular.

## GitHub Actions

GitHub Actions permite definir workflows automáticos dentro del repositorio.

Esos workflows se describen en archivos YAML.

## Dónde viven esos archivos

Normalmente en:

```text
.github/workflows/
```

Por ejemplo:

```text
.github/workflows/ci.yml
```

## Qué es un workflow

Un workflow es una automatización definida por eventos y pasos.

Por ejemplo:

- cuando alguien hace push
- cuando se abre un pull request
- ejecutar tests y build

## Ejemplo conceptual de workflow básico

```yaml
name: CI

on:
  push:
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Java
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 21

      - name: Run tests
        run: mvn test

      - name: Build package
        run: mvn package
```

## Qué hace este workflow

Hace algo muy importante y bastante sano:

- corre en push
- corre en pull request
- prepara Java 21
- corre tests
- intenta empaquetar el proyecto

## Qué valor tiene esto

Muchísimo.

Porque ya te da una validación automática bastante seria para un proyecto inicial o intermedio.

## Eventos: `push` y `pull_request`

Estos dos eventos son especialmente comunes.

### `push`

Se dispara cuando hay push al repositorio.

### `pull_request`

Se dispara cuando se abre o actualiza un pull request.

## Por qué conviene usar ambos

Porque permite verificar el proyecto tanto cuando subís cambios directos como cuando alguien quiere integrar cambios vía PR.

## `actions/checkout`

Este paso trae el código del repositorio al entorno de ejecución del workflow.

## `actions/setup-java`

Este paso instala o prepara la versión de Java que necesitás para correr el proyecto.

## `mvn test`

Ejecuta tests.

## `mvn package`

Compila y empaqueta la aplicación.

## Por qué a veces alcanza con esto para empezar

Porque resuelve la parte más crítica del inicio:

- verificar salud básica del proyecto
- automatizar validación
- reducir errores manuales repetitivos

## CI no reemplaza testing

Esto es importante.

CI no reemplaza tests.

Más bien:
ejecuta automáticamente los tests que vos ya definiste.

O sea:

- testing = qué comprobaciones existen
- CI = cuándo y cómo se ejecutan automáticamente

## Qué pasa si los tests fallan

Si una pipeline está bien configurada y los tests fallan, el workflow falla.

Eso es bueno porque te da una señal temprana de que el proyecto no está sano.

## Qué conviene incluir más adelante

Después de una CI básica, podrías sumar cosas como:

- chequeo de formatting o lint
- análisis estático
- build Docker
- publicación de artefactos
- despliegue a staging
- notificaciones
- validación de migraciones

Pero no hace falta hacer todo eso ya.

## CD: delivery y deploy

Pasemos un poco a la parte de CD.

Como idea general, el siguiente paso después de validar el proyecto puede ser:

- generar un artefacto listo para usar
- publicarlo
- o incluso desplegarlo automáticamente a cierto entorno

## Continuous Delivery

La app queda siempre en un estado donde podría entregarse o desplegarse.

No necesariamente se despliega sola a producción en cada commit.

## Continuous Deployment

En su versión más agresiva, un cambio que pasa todas las validaciones podría desplegarse automáticamente.

Esto ya exige más madurez y más cuidado.

## Qué conviene para esta etapa

Para una etapa inicial o intermedia, suele ser más sano apuntar primero a:

- CI fuerte
- delivery razonable
- despliegue semi-automatizado o controlado

Eso ya es muy valioso.

## Publicar artefactos

Una forma intermedia de CD puede ser publicar artefactos del build.

Por ejemplo:

- `.jar`
- imagen Docker
- reportes de test

Eso no necesariamente despliega, pero sí deja listo algo utilizable.

## Docker y CI/CD

Si ya venís usando Docker, una evolución natural es automatizar también el build de imagen.

Ejemplo conceptual:

1. correr tests
2. construir `.jar`
3. construir imagen Docker
4. publicar imagen o dejarla lista

Eso ya empieza a conectar backend, build y operación de forma mucho más profesional.

## Ejemplo conceptual con Docker

```yaml
- name: Build JAR
  run: mvn package

- name: Build Docker image
  run: docker build -t my-app .
```

## Qué aporta esto

Te permite comprobar que incluso la parte containerizada del proyecto sigue sana.

## CI/CD y documentación

También se conecta con la lección anterior de README.

Un proyecto profesional debería dejar claro:

- qué verifica la pipeline
- cómo correr esas validaciones localmente
- qué pasa antes de desplegar
- qué workflows existen si ya los tenés montados

Eso mejora mucho la comprensión del proyecto.

## Qué no conviene automatizar sin pensar

No conviene automatizar por automatizar.

Por ejemplo, un despliegue automático a producción sin una base sólida puede ser riesgoso.

Primero conviene tener:

- tests útiles
- build estable
- configuración clara
- entornos entendidos
- rollback o criterio operativo razonable

## CI/CD y calidad del proyecto

Una pipeline simple pero sana ya mejora mucho la calidad del proyecto.

Porque obliga a que el backend mantenga al menos ciertas garantías mínimas:

- compila
- testea
- empaqueta
- se puede construir en limpio

Eso es muchísimo más serio que depender solo de “a mí me anduvo local”.

## Validaciones útiles para agregar más adelante

Una evolución natural podría incluir cosas como:

- `mvn test`
- `mvn package`
- build Docker
- chequeo de cobertura
- revisión de estilo
- validación de migraciones Flyway
- smoke tests en un entorno temporal

No hace falta todo junto, pero ese camino existe.

## CI/CD y proyecto integrador

En tu proyecto integrador, sumar CI/CD muestra muchísimo valor porque demuestra que no solo sabés escribir el backend, sino también cuidarlo operativamente.

Eso es muy fuerte para portfolio y para trabajo real.

## Señal profesional muy valiosa

Una señal profesional importante es que alguien pueda entrar al repo y ver:

- tests
- README claro
- Docker
- pipeline de CI

Eso transmite bastante madurez técnica.

## Buenas prácticas iniciales

## 1. Empezar simple

Una pipeline que testea y builda ya suma muchísimo.

## 2. Automatizar pasos valiosos y repetitivos

No hace falta automatizar lo irrelevante.

## 3. Mantener la pipeline legible

También es parte del proyecto.

## 4. Hacer que la pipeline refleje cómo realmente se valida el proyecto

No solo “algo que corre por quedar bonito”.

## 5. No saltar demasiado rápido a despliegue automático total

Primero conviene consolidar la parte de CI.

## Ejemplo de workflow básico bastante sano

```yaml
name: CI

on:
  push:
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Java 21
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 21

      - name: Run tests
        run: mvn test

      - name: Package application
        run: mvn package
```

## Qué demuestra este ejemplo

Demuestra una automatización mínima pero valiosa de:

- checkout
- entorno Java
- tests
- build

Eso ya es un gran paso.

## Cómo se conecta con todo lo anterior

CI/CD se apoya muy bien en todo lo que ya trabajaste:

- testing
- Maven
- Docker
- Flyway
- observabilidad
- README
- despliegue

Porque automatizar bien exige que esas piezas tengan cierto orden y cierta calidad.

## Comparación con otros lenguajes

### Si venís de JavaScript

Probablemente ya viste pipelines que corren tests, builds y publicación de artefactos. En Java y Spring Boot la idea es exactamente igual, pero muy apoyada en Maven, JARs y, muchas veces, contenedores Docker.

### Si venís de Python

Puede recordarte a workflows que validan proyecto, ejecutan tests y preparan despliegues. En Java, el flujo suele sentirse muy natural con Maven y GitHub Actions, especialmente para proyectos Spring Boot.

## Errores comunes

### 1. No automatizar nada y depender solo del entorno local

Eso reduce mucho la confianza del proyecto.

### 2. Crear una pipeline enorme antes de tener tests útiles

Primero conviene automatizar valor real.

### 3. No entender qué hace cada paso del workflow

Después cuesta mantenerlo.

### 4. Automatizar despliegues riesgosos demasiado pronto

Eso puede salir caro.

### 5. Dejar la pipeline rota o desactualizada

Una automatización que siempre falla también degrada mucho el proyecto.

## Mini ejercicio

Diseñá una pipeline básica para tu proyecto integrador que haga al menos esto:

1. checkout del repositorio
2. preparar Java
3. correr tests
4. empaquetar el proyecto
5. opcional: construir imagen Docker

Respondé además:

- ¿en qué eventos se ejecutaría?
- ¿qué validación te parece imprescindible?
- ¿qué automatizarías después como siguiente mejora?

## Ejemplo posible

- eventos: `push` y `pull_request`
- imprescindible: `mvn test`
- siguiente mejora:
  - `mvn package`
  - build Docker
  - validación de Flyway
  - despliegue a staging

## Resumen

En esta lección viste que:

- CI/CD ayuda a automatizar validaciones y parte del ciclo de entrega del software
- CI se enfoca en verificar continuamente la salud del proyecto al integrar cambios
- una pipeline básica puede correr tests y build automáticamente
- GitHub Actions es una forma muy accesible de empezar
- no hace falta arrancar con automatización gigantesca: una CI simple ya aporta mucho
- sumar CI/CD a tu proyecto mejora muchísimo su madurez técnica y profesional

## Siguiente tema

La siguiente natural es **arquitectura hexagonal y separación por capas más avanzada**, porque después de haber cubierto una base muy fuerte de backend, operación, seguridad y automatización, el siguiente paso muy valioso es empezar a mirar cómo escalar la estructura del proyecto con una arquitectura más flexible y mantenible.
