---
title: "Qué es un ciberataque"
description: "Introducción al concepto de ciberataque, sus objetivos, sus componentes y por qué conviene entenderlo desde una perspectiva defensiva."
order: 1
module: "Fundamentos de los ataques"
level: "intro"
draft: false
---

# Qué es un ciberataque

Cuando se empieza a estudiar seguridad, una de las primeras palabras que aparece es **ataque**.  
Sin embargo, no siempre se entiende bien qué significa en la práctica.

Un **ciberataque** es una acción intencional orientada a comprometer la **confidencialidad**, la **integridad** o la **disponibilidad** de sistemas, aplicaciones, redes o datos.

Dicho más simple: es un intento deliberado de **acceder**, **alterar**, **bloquear**, **robar** o **dañar** recursos digitales.

---

## Por qué es importante entender este concepto

Estudiar los distintos ataques no tiene como objetivo aprender a dañar sistemas, sino desarrollar una mirada más clara sobre:

- qué intenta hacer un atacante
- qué debilidades suele aprovechar
- qué consecuencias puede provocar
- cómo prevenirlo o detectarlo antes de que cause daño

En otras palabras, entender qué es un ciberataque ayuda a pensar mejor la seguridad desde un enfoque **defensivo**.

---

## Qué busca lograr un ciberataque

No todos los ataques persiguen lo mismo.  
Dependiendo del contexto, un atacante puede intentar:

- robar información
- obtener acceso no autorizado
- secuestrar cuentas
- interrumpir un servicio
- modificar datos
- extorsionar a una organización
- aprovechar recursos ajenos
- espiar actividad de usuarios o sistemas

Por eso, cuando hablamos de ataques, no nos referimos a una sola técnica, sino a un conjunto amplio de acciones con objetivos diferentes.

---

## Qué puede ser atacado

Un ciberataque no se dirige solamente a una página web.  
Puede apuntar a muchos tipos de activos, por ejemplo:

- aplicaciones web
- APIs
- bases de datos
- servidores
- redes internas
- servicios en la nube
- dispositivos de usuario
- cuentas y credenciales
- archivos y documentos
- procesos humanos dentro de una organización

Esto es importante porque la seguridad no depende solo del código: también involucra infraestructura, configuración y comportamiento de las personas.

---

## Los tres impactos clásicos: confidencialidad, integridad y disponibilidad

Una forma clásica de entender los ataques es pensar qué propiedad están afectando.

### Confidencialidad

Se rompe cuando alguien accede a información que no debería ver.

Ejemplos:

- robo de contraseñas
- filtración de datos personales
- acceso indebido a información interna

### Integridad

Se ve afectada cuando la información o el sistema es alterado de manera no autorizada.

Ejemplos:

- modificación de registros
- manipulación de precios
- cambio no autorizado de permisos o configuraciones

### Disponibilidad

Se pierde cuando un sistema o servicio deja de estar accesible para los usuarios legítimos.

Ejemplos:

- caída de un sitio
- saturación de un servidor
- bloqueo de archivos por ransomware

Muchos ataques impactan en una de estas propiedades, y otros afectan a más de una al mismo tiempo.

---

## Un ciberataque no es lo mismo que una vulnerabilidad

Estos conceptos suelen confundirse, pero no son iguales.

### Vulnerabilidad

Es una debilidad o falla que podría ser aprovechada.

Ejemplos:

- una contraseña débil
- una mala configuración
- una validación insuficiente
- una dependencia vulnerable

### Ataque

Es la acción concreta que intenta aprovechar esa debilidad.

Ejemplo:

- si una aplicación permite contraseñas muy débiles, eso es una vulnerabilidad
- si alguien prueba muchas combinaciones hasta entrar, eso es un ataque

Esta diferencia es fundamental:  
la vulnerabilidad es la **puerta abierta**, el ataque es el **intento de entrar**.

---

## Un ciberataque tampoco es lo mismo que una amenaza

Otro error común es mezclar amenaza, vulnerabilidad y ataque.

### Amenaza

Es aquello que tiene el potencial de causar daño.

Por ejemplo:

- un ciberdelincuente
- un grupo organizado
- malware
- un empleado malicioso
- una campaña automatizada

### Vulnerabilidad

Es la debilidad explotable.

### Ataque

Es la acción que materializa el intento de explotar esa debilidad.

Pensarlo así ayuda mucho:

- **amenaza**: quién o qué puede causar daño
- **vulnerabilidad**: por dónde puede ocurrir
- **ataque**: cómo se intenta concretar

---

## Un mismo ataque puede tener distintas formas

No existe una única manera de atacar un sistema.

Por ejemplo, un atacante puede intentar acceder a una cuenta mediante:

- fuerza bruta
- credenciales filtradas
- phishing
- robo de sesión
- fallos lógicos en autenticación

El objetivo final puede ser parecido, pero la técnica cambia.

Esto explica por qué la seguridad no se resuelve con una sola medida.  
Bloquear un tipo de ataque no garantiza bloquear todos los demás.

---

## Ejemplos de ataques que probablemente ya escuchaste

Aunque recién estés empezando, seguramente ya viste algunos nombres:

- **phishing**
- **inyección SQL**
- **XSS**
- **DDoS**
- **ransomware**
- **fuerza bruta**
- **secuestro de sesión**

No hace falta conocerlos todavía en detalle.  
Lo importante en este primer tema es entender que todos ellos son ejemplos de **ciberataques**, pero cada uno explota debilidades distintas y produce impactos diferentes.

---

## Cómo pensar un ataque desde una mirada defensiva

Una buena forma de estudiar seguridad es hacerse siempre estas preguntas:

1. ¿Qué está intentando lograr el atacante?  
2. ¿Qué debilidad está aprovechando?  
3. ¿Qué recurso está en riesgo?  
4. ¿Qué señales podría dejar ese intento?  
5. ¿Cómo podría prevenirse o mitigarse?

Este enfoque te ayuda a no memorizar nombres de ataques como una lista aislada, sino a entender su lógica.

---

## Ejemplo sencillo

Imaginá una aplicación con un formulario de login.

Si un atacante intenta miles de contraseñas hasta acertar, eso es un ataque.  
Si además la aplicación no limita intentos y permite contraseñas débiles, existen vulnerabilidades que facilitan ese ataque.

El daño posible puede incluir:

- acceso indebido a una cuenta
- robo de información
- uso no autorizado de funciones del sistema

Y las defensas podrían incluir:

- límite de intentos
- contraseñas robustas
- autenticación multifactor
- monitoreo de patrones anómalos

Este ejemplo muestra algo importante:  
un ataque casi nunca se entiende bien si se mira aislado del contexto técnico.

---

## Idea clave del tema

Un **ciberataque** es una acción intencional que busca comprometer sistemas, servicios o datos aprovechando debilidades técnicas, lógicas o humanas.

Entender esto es la base para estudiar todo lo demás, porque después cada tipo de ataque será una forma concreta de llevar esa idea a la práctica.

---

## Errores comunes al empezar

### Pensar que un ataque siempre implica “hackear” visualmente un sistema

Muchos ataques son silenciosos y no muestran nada espectacular.  
A veces consisten simplemente en robar credenciales, abusar de permisos o extraer información sin ser detectados.

### Creer que todos los ataques son complejos

No siempre.  
Muchos ataques funcionan por errores simples, configuraciones inseguras o malas prácticas repetidas.

### Suponer que solo se ataca código

También se atacan personas, procesos, configuraciones, credenciales y servicios expuestos.

---

## Resumen

En este tema vimos que:

- un ciberataque es una acción intencional para comprometer recursos digitales
- puede afectar confidencialidad, integridad o disponibilidad
- no es lo mismo que una vulnerabilidad
- no es lo mismo que una amenaza
- puede dirigirse a aplicaciones, redes, infraestructura, usuarios o datos
- conviene analizarlo siempre desde una perspectiva defensiva

---

## Ejercicio de reflexión

Pensá en una aplicación web cualquiera que uses todos los días.

Intentá responder:

- ¿qué información valiosa contiene?
- ¿qué querría obtener un atacante?
- ¿qué pasaría si alguien accediera sin permiso?
- ¿qué ocurriría si el sistema dejara de estar disponible?

No hace falta resolverlo técnicamente todavía.  
El objetivo es empezar a desarrollar una mentalidad de análisis.

---

## Autoevaluación rápida

### 1. ¿Qué describe mejor a un ciberataque?

Una acción intencional orientada a comprometer sistemas, datos o servicios.

### 2. ¿Una vulnerabilidad y un ataque son lo mismo?

No. La vulnerabilidad es la debilidad; el ataque es el intento de aprovecharla.

### 3. ¿Qué significa afectar la disponibilidad?

Que el sistema o servicio deje de estar accesible para los usuarios legítimos.

### 4. ¿Solo se atacan aplicaciones web?

No. También pueden atacarse redes, cuentas, servidores, infraestructura, usuarios y muchos otros recursos.

---

## Próximo tema

En el siguiente tema vamos a profundizar en cuatro conceptos que aparecen constantemente en seguridad:

- amenaza
- vulnerabilidad
- riesgo
- exploit

Entender bien esas diferencias te va a dar una base mucho más sólida para analizar ataques reales.
