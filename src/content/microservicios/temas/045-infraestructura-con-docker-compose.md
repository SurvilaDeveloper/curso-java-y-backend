---
title: "Infraestructura con Docker Compose"
description: "Cómo incorporar infraestructura compartida como Config Server, Eureka, RabbitMQ y Keycloak dentro de Docker Compose para ejecutar NovaMarket como un sistema distribuido coherente."
order: 45
module: "Módulo 11 · Docker y despliegue local completo"
level: "intermedio"
draft: false
---

# Infraestructura con Docker Compose

En la clase anterior vimos cómo **Docker Compose** ayuda a levantar varios microservicios como un sistema coordinado.

Pero en una arquitectura de microservicios real, los servicios de negocio rara vez viven solos.  
También dependen de una capa de **infraestructura compartida** que sostiene buena parte del comportamiento del sistema.

En **NovaMarket**, esa infraestructura incluye componentes como:

- `config-server`,
- `discovery-server`,
- `RabbitMQ`,
- `Keycloak`,
- y, según el entorno, otras piezas complementarias.

La pregunta ahora ya no es solamente:

**¿cómo levanto varios microservicios juntos?**

La pregunta pasa a ser:

**¿cómo levanto la arquitectura completa, incluyendo la infraestructura que esos microservicios necesitan para funcionar como sistema distribuido?**

Ese es el objetivo de esta clase.

---

## Por qué la infraestructura importa tanto

En un proyecto pequeño o en una demo muy acotada, a veces puede parecer que los microservicios son el centro absoluto de todo.

Pero a medida que la arquitectura madura, se vuelve cada vez más evidente que muchos comportamientos importantes no dependen solo de los servicios de negocio, sino también de la infraestructura que los conecta y los sostiene.

Por ejemplo, en NovaMarket:

- sin `config-server`, cada servicio tendería a manejar su configuración de forma más aislada,
- sin `discovery-server`, el descubrimiento dinámico se debilita,
- sin `RabbitMQ`, la mensajería asincrónica desaparece,
- sin `Keycloak`, la seguridad distribuida pierde una pieza central.

Es decir: sin esa infraestructura, el sistema ya no se comporta como la arquitectura que venimos enseñando.

---

## Qué papel cumple Docker Compose en este punto

Docker Compose resulta especialmente útil acá porque permite describir no solo los microservicios de negocio, sino también el ecosistema técnico que los rodea.

Eso mejora mucho la coherencia del proyecto.

En vez de tener:

- microservicios por un lado,
- y dependencias “externas” levantadas manualmente o por separado,

podemos empezar a tener una representación más completa del entorno local del curso.

Eso hace que NovaMarket se parezca mucho más a un sistema real.

---

## Config Server dentro de Compose

`config-server` cumple una función transversal: centralizar configuración.

Incluirlo dentro del entorno Compose tiene mucho sentido porque ayuda a mostrar algo importante:

la configuración no es un detalle secundario ni un conjunto de archivos casuales.  
Forma parte de la arquitectura operativa.

Cuando `config-server` vive dentro del stack:

- su papel se vuelve visible,
- los demás servicios pueden consumir configuración en un entorno más parecido al real,
- y el alumno entiende mejor que la configuración centralizada también necesita ejecutarse, conectarse y estar disponible.

---

## Eureka dentro de Compose

Algo similar ocurre con `discovery-server`.

Mientras el proyecto es pequeño, a veces el discovery se entiende de manera bastante conceptual.  
Pero cuando se lo ejecuta realmente dentro del entorno, su rol se vuelve mucho más claro.

En NovaMarket, incluir Eureka en Compose permite observar mejor:

- registro de instancias,
- resolución entre servicios,
- dependencia del arranque coordinado,
- y el papel de discovery en una arquitectura que ya no vive sobre URLs fijas simples.

Eso le da más profundidad al proyecto.

---

## RabbitMQ dentro de Compose

RabbitMQ es una de las piezas de infraestructura más didácticas del curso porque hace visible la transición desde una arquitectura puramente sincrónica hacia una arquitectura híbrida.

Incluirlo en Compose es muy valioso porque permite que el alumno vea el sistema funcionando con:

- colas reales,
- publicación de eventos,
- consumo asincrónico,
- y diagnóstico de integración dentro del mismo entorno del proyecto.

En NovaMarket, esto hace mucho más tangible el rol de `notification-service` y de los eventos asociados a órdenes.

---

## Keycloak dentro de Compose

`Keycloak` es otra pieza que gana mucho valor al integrarse dentro del stack.

Mientras se lo piensa solo como “el proveedor de autenticación”, puede quedar demasiado abstracto.  
Pero cuando forma parte del entorno Compose, se vuelve evidente que la seguridad distribuida también necesita infraestructura concreta.

En NovaMarket, eso permite observar mejor:

- autenticación real,
- emisión de tokens,
- integración con gateway,
- protección de rutas,
- y pruebas más cercanas a cómo se comportaría el sistema fuera del IDE.

Además, hace que la seguridad deje de ser solo teoría o configuración parcial.

---

## Qué gana la arquitectura al integrar todo esto

Cuando la infraestructura compartida entra en Compose, NovaMarket deja de ser simplemente “varios servicios que podrían conectarse”.

Pasa a ser una arquitectura más completa, donde:

- la configuración existe como servicio,
- el discovery existe como servicio,
- la seguridad existe como servicio,
- la mensajería existe como servicio,
- y el resto de los componentes de negocio se apoyan sobre esa base.

Eso mejora mucho la comprensión sistémica del proyecto.

---

## Qué orden conviene seguir al montar el stack

Aunque Compose ayuda a describir el conjunto, eso no significa que convenga cargar toda la complejidad de golpe.

Didácticamente suele ser mejor avanzar de forma progresiva.

Por ejemplo:

1. primero servicios de negocio básicos,
2. después Config Server y Eureka,
3. luego RabbitMQ,
4. después Keycloak,
5. y más adelante observabilidad.

Ese crecimiento gradual conserva algo muy importante del curso:  
que cada herramienta aparezca porque el sistema la necesita.

---

## Qué tensiones aparecen al levantar infraestructura real

Este paso también ayuda a enseñar algo muy valioso: una arquitectura distribuida no solo se diseña, también se opera.

Y cuando la operamos, aparecen tensiones reales como estas:

- tiempos de arranque distintos,
- dependencias entre componentes,
- configuración compartida,
- credenciales,
- conectividad entre redes,
- y necesidad de diagnóstico cuando algo no levanta bien.

Eso tiene muchísimo valor pedagógico porque acerca el curso a una experiencia profesional realista.

---

## Qué errores conviene evitar

Como en otras clases, hay malos caminos bastante comunes.

### 1. Querer meter toda la infraestructura sin criterio
Eso puede volver el entorno demasiado pesado y difícil de entender.

### 2. Esconder la infraestructura detrás de magia
Si el alumno no entiende qué rol cumple cada pieza, Compose termina siendo solo una caja negra.

### 3. Tratar todos los componentes como si fueran iguales
No todos cumplen el mismo rol ni tienen el mismo impacto operativo.

### 4. Olvidar que esto sigue siendo parte del diseño
La infraestructura también expresa decisiones arquitectónicas.

### 5. Perder foco del caso de uso central
Todo debería seguir sirviendo al flujo principal de NovaMarket: crear una orden de compra.

---

## Cómo se conecta con el flujo del curso

Hasta este punto, NovaMarket ya recorrió:

- configuración centralizada,
- discovery,
- gateway,
- seguridad,
- resiliencia,
- observabilidad,
- mensajería,
- testing,
- y contenedores.

Integrar infraestructura en Compose ayuda a reunir todo eso.

Es un paso que empieza a mostrar el proyecto no solo como una secuencia de temas, sino como un sistema realmente ejecutable.

---

## Qué valor práctico tiene para el alumno

Esta clase mejora bastante la utilidad del curso porque deja una base más reusable.

Después de ver este tema, el alumno no solo entiende conceptos de microservicios.  
También empieza a tener una idea más clara de cómo levantar localmente una arquitectura completa con dependencias importantes incluidas.

Eso ayuda mucho para:

- practicar,
- experimentar,
- romper cosas y diagnosticarlas,
- y compartir el proyecto con otras personas.

---

## Una idea práctica para llevarse

En una arquitectura distribuida, los microservicios de negocio no viven aislados.  
Necesitan una infraestructura que les permita configurarse, descubrirse, autenticarse y comunicarse.

Docker Compose aporta valor precisamente cuando deja de describir solo aplicaciones y empieza a describir **el ecosistema** en el que esas aplicaciones realmente funcionan.

---

## Cierre

Integrar infraestructura compartida dentro de Docker Compose es un paso clave para que NovaMarket se convierta en una arquitectura local coherente y ejecutable.

Incorporar `config-server`, `discovery-server`, `RabbitMQ` y `Keycloak` dentro del stack permite entender mejor la relación entre servicios de negocio e infraestructura transversal, y vuelve mucho más tangible la arquitectura que venimos construyendo a lo largo del curso.

En la próxima clase vamos a sumar otra dimensión importante del entorno local: **la observabilidad y el soporte técnico con Docker**.
