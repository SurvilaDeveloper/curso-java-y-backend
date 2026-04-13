---
title: "Creando namespace y estructura base de manifests"
description: "Primer paso concreto del bloque de Kubernetes en NovaMarket. Creación del namespace y de la estructura inicial de recursos para empezar a orquestar el sistema."
order: 81
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Creando namespace y estructura base de manifests

En la clase anterior preparamos el terreno conceptual para el salto hacia Kubernetes.

Ahora toca el primer paso realmente concreto del bloque:

**crear el namespace y la estructura base de manifests para NovaMarket.**

Todavía no vamos a desplegar los microservicios del sistema.  
Antes de eso, conviene hacer algo mucho más importante y mucho más sano:

**ordenar el espacio donde esos recursos van a vivir.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creada la carpeta `k8s/` del proyecto,
- definido un namespace para NovaMarket,
- organizada una estructura base de manifests,
- y listo el entorno para empezar a desplegar recursos reales de Kubernetes en las próximas clases.

Esta clase es pequeña en apariencia, pero muy importante para sostener la coherencia del bloque entero.

---

## Estado de partida

Partimos de un proyecto donde:

- ya existe un stack integrado en Docker Compose,
- los servicios ya tienen imágenes razonables,
- y el bloque de Kubernetes ya fue introducido conceptualmente.

Lo que todavía no existe es una base ordenada de recursos Kubernetes dentro del proyecto.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- crear la carpeta `k8s/`,
- definir una estructura inicial de organización,
- crear un namespace para NovaMarket,
- y dejar un primer recurso aplicable al cluster.

---

## Por qué conviene empezar por un namespace

Porque el namespace nos da algo muy valioso:

- agrupa recursos relacionados,
- ordena mejor el entorno,
- y evita que todo quede mezclado con otros recursos del cluster.

Para un proyecto como NovaMarket, usar namespace desde el principio es una muy buena práctica, incluso en un entorno de aprendizaje.

---

## Paso 1 · Crear la carpeta `k8s/`

En la raíz del proyecto, creá algo como:

```txt
novamarket/k8s/
```

Y adentro una estructura mínima razonable, por ejemplo:

```txt
k8s/
  base/
  infrastructure/
  services/
```

Esta organización nos va a venir muy bien a medida que el bloque crezca.

---

## Qué rol puede tener cada carpeta

### `k8s/base/`
Recursos básicos del entorno, como el namespace.

### `k8s/infrastructure/`
Piezas compartidas o externas que después podamos decidir llevar a Kubernetes.

### `k8s/services/`
Deployments y Services de los microservicios propios de NovaMarket.

No hace falta que esté todo lleno hoy.  
Lo importante es que el orden ya exista.

---

## Paso 2 · Crear el manifest del namespace

Ahora vamos a crear el primer recurso real del bloque.

Por ejemplo:

```txt
k8s/base/namespace.yaml
```

Una versión razonable podría ser:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: novamarket
```

Este archivo es simple, pero tiene muchísimo valor porque define el espacio lógico donde van a vivir los recursos del proyecto.

---

## Paso 3 · Aplicar el namespace

Ahora aplicá el recurso al cluster con el comando correspondiente.

La idea es que Kubernetes ya tenga creado el namespace `novamarket` antes de que empecemos a desplegar otras piezas.

Este paso es importante porque deja el bloque anclado en un espacio propio y reconocible.

---

## Paso 4 · Verificar que el namespace existe

Después de aplicarlo, verificá que el namespace ya quedó creado.

Queremos confirmar que la base del bloque ya no es solo una carpeta en el repo, sino un recurso real dentro del entorno Kubernetes.

---

## Paso 5 · Pensar cómo vamos a referenciar el namespace en los próximos recursos

A partir de esta clase, muchos de los manifests que creemos deberían incluir algo como:

```yaml
metadata:
  namespace: novamarket
```

No hace falta que hoy lo escribamos en todos los archivos del bloque, porque todavía no tenemos tantos recursos.  
Pero sí conviene fijar esta convención desde ahora.

---

## Paso 6 · Preparar un archivo README o nota interna para `k8s/`

Esto no es obligatorio, pero puede ser muy útil.

Por ejemplo, dentro de `k8s/` podrías dejar una nota simple que explique:

- qué contiene cada carpeta,
- qué namespace usa el proyecto,
- y en qué orden conviene aplicar los recursos.

Para un curso práctico, este tipo de orden documental suma bastante.

---

## Paso 7 · Pensar el orden de despliegue futuro

Ahora que ya existe el namespace, conviene dejar claro el orden probable de las siguientes clases.

Una secuencia razonable sería:

1. namespace  
2. recursos básicos compartidos  
3. `config-server`  
4. `discovery-server`  
5. después servicios del negocio  

Ese mapa ayuda mucho a que el bloque no se vuelva desordenado.

---

## Paso 8 · Relacionar este paso con lo que ya hicimos en Docker Compose

Este punto vale mucho.

En Compose teníamos un stack unificado y una red compartida.

En Kubernetes, el namespace no reemplaza directamente esa red, pero sí cumple un rol de agrupación lógica muy importante dentro del entorno.

Ese paralelismo ayuda a entender por qué este primer recurso es tan valioso, aunque todavía no mueva lógica del negocio.

---

## Qué estamos logrando con esta clase

Esta clase crea el primer ancla real del bloque de Kubernetes.

Ahora NovaMarket ya no solo “piensa” en Kubernetes:  
ya tiene:

- una estructura de manifests
- y un namespace real

Eso significa que el bloque de orquestación ya empezó de verdad.

---

## Qué todavía no hicimos

Todavía no:

- desplegamos `config-server`
- desplegamos `discovery-server`
- creamos Deployments
- ni creamos Services de Kubernetes

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**ordenar y delimitar el espacio del proyecto dentro del cluster.**

---

## Errores comunes en esta etapa

### 1. Saltarse el namespace y crear recursos sueltos
Eso hace que el bloque pierda orden enseguida.

### 2. No organizar la carpeta `k8s/` desde el principio
Después cuesta mucho mantenerla limpia.

### 3. Mezclar infraestructura y servicios propios sin criterio
Conviene separarlos desde ahora.

### 4. Aplicar recursos sin verificar en qué namespace van a vivir
Este bloque justamente busca evitar esa ambigüedad.

### 5. Pensar que esta clase es demasiado pequeña para importar
En realidad, sostiene la prolijidad del módulo entero.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, NovaMarket debería tener una carpeta `k8s/` ordenada y un namespace `novamarket` ya creado en Kubernetes.

Eso deja perfectamente preparado el primer despliegue real de servicios.

---

## Punto de control

Antes de seguir, verificá que:

- existe la carpeta `k8s/`,
- la estructura base está creada,
- el archivo `namespace.yaml` existe,
- el namespace `novamarket` ya fue aplicado,
- y el proyecto ya tiene un espacio claro dentro del cluster.

Si eso está bien, ya podemos pasar al primer despliegue importante del bloque.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a llevar `config-server` a Kubernetes con sus primeros manifests de Deployment y Service.

Ese será el primer microservicio real de NovaMarket desplegado dentro del nuevo entorno.

---

## Cierre

En esta clase creamos el namespace y la estructura base de manifests de Kubernetes para NovaMarket.

Con eso, el proyecto ya tiene un espacio propio dentro del cluster y una organización inicial lo suficientemente clara como para empezar a desplegar recursos reales sin perder orden ni coherencia.
