---
title: "Docker Compose para arquitectura de microservicios"
description: "Cómo usar Docker Compose para levantar varios servicios y dependencias coordinadas, y por qué esta pieza es clave para ejecutar NovaMarket como sistema completo."
order: 44
module: "Módulo 11 · Docker y despliegue local completo"
level: "base"
draft: false
---

# Docker Compose para arquitectura de microservicios

Dockerizar microservicios individuales es un paso importante, pero no alcanza por sí solo para ejecutar una arquitectura distribuida completa.

En **NovaMarket**, por ejemplo, no basta con tener una imagen para `order-service` o para `inventory-service`.

El sistema real involucra varias piezas que necesitan convivir:

- varios microservicios,
- bases de datos,
- el gateway,
- eventualmente RabbitMQ,
- seguridad,
- y más adelante otros componentes transversales.

Entonces aparece una necesidad muy concreta:

**¿cómo levantamos todo eso de forma coordinada, repetible y comprensible?**

La respuesta natural en este tramo del curso es **Docker Compose**.

---

## Qué problema resuelve Docker Compose

Cuando una arquitectura tiene varios contenedores, levantar cada uno manualmente puede volverse muy incómodo.

Empiezan a aparecer preguntas como:

- ¿en qué orden arranco cada componente?
- ¿qué puertos expone cada uno?
- ¿qué variables necesita?
- ¿cómo se conectan entre sí?
- ¿qué red comparten?
- ¿cómo represento la topología del sistema?

Docker Compose ayuda justamente a describir ese conjunto.

No se enfoca en un servicio aislado, sino en **la arquitectura como sistema**.

---

## Por qué encaja tan bien con un curso de microservicios

Este tema tiene mucho valor pedagógico porque hace visible algo que ya venimos construyendo desde varias clases:

NovaMarket no es una app única.  
Es un ecosistema de componentes que cooperan.

Compose permite expresar eso de manera concreta:

- qué servicios existen,
- cómo se relacionan,
- qué depende de qué,
- y cómo se arranca el sistema de forma repetible.

En ese sentido, no es solo una herramienta operativa.  
También ayuda a entender la arquitectura.

---

## Qué tipo de componentes pueden entrar en Compose

En el proyecto del curso, Compose puede servir para levantar piezas como estas:

- `catalog-service`,
- `inventory-service`,
- `order-service`,
- `api-gateway`,
- bases de datos,
- y más adelante otros componentes como RabbitMQ o Keycloak.

Cada uno sigue conservando su responsabilidad.

La diferencia es que ahora existe una forma unificada de arrancarlos juntos.

---

## El valor de describir el entorno

Uno de los grandes aportes de Compose es que el entorno deja de quedar en la memoria del desarrollador o en una lista manual de pasos.

En lugar de depender de instrucciones frágiles como:

- primero corré esto,
- después levantá aquello,
- después acordate de mapear este puerto,
- después exportá estas variables,

el sistema pasa a tener una descripción más explícita y repetible.

Eso mejora:

- la comprensión,
- la reproducibilidad,
- la colaboración,
- y la experiencia didáctica.

---

## Cómo se aplica esto a NovaMarket

Pensemos en una versión intermedia del curso.

NovaMarket ya podría tener:

- `catalog-service`,
- `inventory-service`,
- `order-service`,
- `api-gateway`.

Con Docker Compose, ese conjunto puede levantarse de manera coordinada, sin necesidad de iniciar cada parte por separado desde la terminal o desde el IDE.

Eso hace que el proyecto empiece a sentirse de verdad como una arquitectura distribuida y no solo como varios proyectos Java vecinos.

---

## Qué papel juegan las redes y la comunicación

Uno de los aspectos más importantes en Compose es que ayuda a organizar la comunicación entre contenedores.

En una arquitectura distribuida, no alcanza con que cada servicio “arranque”.  
También necesita encontrar a los demás.

Compose ayuda a modelar:

- redes compartidas,
- nombres de servicio,
- puertos internos y externos,
- y conexiones entre componentes.

Esto dialoga muy bien con temas ya vistos en el curso, como discovery, gateway y configuración.

---

## Qué relación tiene con la configuración externa

Cuando varios servicios se levantan juntos, la gestión de configuración se vuelve todavía más importante.

Cada contenedor puede necesitar:

- puertos,
- perfiles,
- URLs,
- credenciales,
- hostnames,
- nombres de base,
- y parámetros técnicos diversos.

Compose ayuda a centralizar y organizar parte de esa información de entorno.

Eso no reemplaza Spring Cloud Config, pero sí complementa la forma en que el sistema se pone en marcha localmente.

---

## Qué errores comunes conviene evitar

Como pasa con otras herramientas, también hay malos usos frecuentes.

### 1. Usar Compose como sustituto del diseño
Si la arquitectura es confusa, Compose no la vuelve clara automáticamente.

### 2. Sobrecargar el archivo con demasiada complejidad desde el inicio
Conviene construirlo de forma progresiva.

### 3. Mezclar responsabilidades de manera desordenada
Cada servicio debería seguir teniendo su rol bien definido.

### 4. Pensar solo en “que arranque”
Arrancar es importante, pero también importa que la topología refleje bien la arquitectura.

### 5. Olvidar que el entorno debe ser entendible
Un Compose difícil de leer también dificulta el aprendizaje.

---

## Qué gana el alumno con este enfoque

A nivel pedagógico, Compose tiene una gran ventaja:  
permite que el alumno vea el proyecto como una unidad ejecutable completa.

Eso cambia bastante la experiencia del curso.

En vez de quedarse con la sensación de haber aprendido herramientas separadas, puede observar:

- servicios coordinados,
- dependencias levantadas,
- rutas funcionando,
- y un entorno que refleja mejor la naturaleza distribuida del sistema.

Ese salto es muy valioso.

---

## Cómo prepara el resto del módulo

Este tema no cierra Docker.  
Más bien abre su versión más interesante.

Una vez que Compose entra en juego, ya podemos pensar en sumar:

- infraestructura compartida,
- RabbitMQ,
- Keycloak,
- observabilidad,
- y diagnóstico del sistema completo.

Es decir, primero armamos el conjunto básico de microservicios y después incorporamos gradualmente el resto del ecosistema.

---

## Una visión concreta dentro de NovaMarket

En este punto del curso, Compose puede cumplir una función muy clara:

**ser la forma estándar de levantar la arquitectura local del proyecto.**

Eso significa que deja de haber una separación tan fuerte entre “lo que explicamos” y “lo que se ejecuta”.

La arquitectura documentada y la arquitectura que corre empiezan a parecerse más.

Y eso mejora mucho la coherencia del curso.

---

## Una idea práctica para llevarse

Cuando una aplicación distribuida ya tiene varios servicios y dependencias, la pregunta no es solo:

**“¿Cómo dockerizo cada pieza?”**

La pregunta más útil pasa a ser:

**“¿Cómo describo y levanto el sistema completo de manera coordinada, repetible y entendible?”**

Ahí es donde Docker Compose se vuelve una pieza central.

---

## Cierre

Docker Compose ayuda a pasar de contenedores aislados a una arquitectura ejecutable como sistema completo.

En NovaMarket, esto permite levantar varios microservicios y dependencias de forma coordinada, reducir fricción en el entorno local y hacer mucho más visible la topología real del proyecto.

En la próxima clase vamos a seguir profundizando esta línea incorporando más infraestructura al entorno: **configuración e integración de componentes como Config Server, Eureka, RabbitMQ o Keycloak dentro de Docker Compose**.
