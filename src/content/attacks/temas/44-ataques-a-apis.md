---
title: "Ataques a APIs"
description: "Qué hace especialmente sensibles a las APIs, qué tipos de problemas aparecen con frecuencia en ellas y por qué requieren una mirada de seguridad distinta aunque compartan muchas fallas con las aplicaciones web tradicionales."
order: 44
module: "Ataques web más avanzados"
level: "intermedio"
draft: false
---

# Ataques a APIs

En el tema anterior vimos **Server-Side Request Forgery (SSRF)**, una vulnerabilidad donde la aplicación puede ser inducida a hacer solicitudes desde el servidor hacia destinos internos o sensibles.

Ahora vamos a entrar en una superficie cada vez más importante en sistemas modernos: las **APIs**.

La idea general de este tema es esta:

> una API no es solo “otra forma de exponer la aplicación”, sino una superficie con características propias que puede concentrar muchos riesgos de autenticación, autorización, exposición de datos, automatización y abuso de lógica.

Esto no significa que las APIs tengan vulnerabilidades completamente distintas de las aplicaciones web tradicionales.  
De hecho, muchas veces los mismos problemas reaparecen:

- autenticación débil
- autorización rota
- exposición excesiva de información
- validaciones insuficientes
- lógica de negocio abusada
- manejo inseguro de objetos, estados o recursos

Pero el contexto cambia bastante.

Y justamente por eso conviene estudiar las APIs como una superficie especial.

---

## Qué es una API en este contexto

Una **API** es una interfaz mediante la cual un sistema expone funciones, datos o recursos para que otro cliente o componente pueda interactuar con él.

Ese cliente puede ser, por ejemplo:

- un frontend web
- una app móvil
- otro servicio
- una integración externa
- una herramienta interna
- un script
- un consumidor automatizado

La idea importante es esta:

> una API expone capacidades del sistema de una forma más directa, estructurada y programable.

Eso la vuelve muy útil, pero también puede volverla muy atractiva para atacantes si no está bien diseñada o protegida.

---

## Por qué las APIs son una superficie especialmente sensible

Las APIs suelen concentrar varias características que aumentan su valor ofensivo.

### Exponen funciones de forma directa

En lugar de pasar por la interfaz visual, una API suele ofrecer acceso más directo a datos y operaciones.

### Son programables

Eso facilita automatización, repetición, enumeración y abuso a escala.

### Manejan muchos objetos y estados

Por ejemplo:

- usuarios
- pedidos
- documentos
- tokens
- relaciones
- operaciones de negocio
- recursos internos

### Suelen ser el backend real del sistema

El frontend muchas veces es solo una capa visual.  
La API es quien verdaderamente accede a datos, aplica lógica y ejecuta acciones.

### A menudo se integran con muchos clientes

Web, móvil, terceros, herramientas internas o servicios externos pueden compartir la misma API o APIs relacionadas.

Todo esto hace que una API mal protegida pueda convertirse en un punto de impacto enorme.

---

## Por qué no alcanza con pensar “si la web está bien, la API también”

Este es un error muy común.

Una aplicación puede tener una interfaz web que parezca relativamente cuidada y, sin embargo, exponer una API mucho más permisiva o menos consistente.

Por ejemplo, puede pasar que:

- la interfaz oculte opciones, pero la API igual acepte la acción
- la web filtre recursos por usuario, pero la API no valide bien propiedad
- la UI limite ciertos flujos, pero la API permita automatización masiva
- el frontend no muestre ciertos datos, pero la API sí los devuelva
- la autenticación del sitio se vea sólida, pero la API tenga tokens o flujos alternativos más débiles

La seguridad real no se decide en la apariencia del frontend.  
Se decide en lo que la API permite hacer realmente.

---

## Qué busca lograr un atacante en una API

Depende mucho del sistema, pero conceptualmente puede intentar:

- autenticarse o mantener acceso de forma indebida
- consultar datos que no debería ver
- modificar recursos ajenos
- automatizar acciones sensibles
- abusar de la lógica de negocio
- enumerar objetos o relaciones
- explotar funciones internas o menos visibles
- aprovechar exposición excesiva de datos
- escalar privilegios
- interferir con operaciones críticas

La idea importante es esta:

> como la API expone la lógica real del sistema en forma programable, puede ofrecer al atacante una superficie muy eficiente para explorar y abusar.

---

## Qué tipos de problemas aparecen con frecuencia

Aunque cada API es distinta, hay varias categorías que aparecen una y otra vez.

### Autenticación débil o inconsistente

Problemas en:

- emisión de tokens
- manejo de sesiones
- protección de endpoints
- flujos alternativos
- expiración o revocación
- reconfiguración de acceso

### Autorización rota

Problemas como:

- acceso a recursos ajenos
- escalada horizontal
- escalada vertical
- validación deficiente de propiedad
- roles mal aplicados
- permisos inconsistentes entre endpoints

### Exposición excesiva de datos

La API devuelve más información de la necesaria, aunque el frontend luego no la muestre toda.

### Enumeración de recursos

La estructura de la API puede facilitar el descubrimiento de objetos, relaciones o identificadores.

### Abuso de lógica de negocio

La API permite ejecutar flujos o combinaciones de acciones de forma no prevista.

### Automatización a escala

Al ser una superficie programable, ciertos abusos pueden repetirse con mucha facilidad si faltan límites o monitoreo.

### Gestión insegura de objetos y estados

Especialmente cuando los recursos tienen relaciones complejas o privilegios variados.

---

## Qué relación tiene con temas ya vistos

Este punto es muy importante.

Los ataques a APIs no son un “mundo aparte”; muchas veces son la reaparición de problemas ya estudiados, pero sobre una superficie más directa y más automatizable.

Por ejemplo:

### Autenticación
Pueden reaparecer temas como:
- credenciales débiles
- tokens inseguros
- MFA mal integrado
- sesiones persistentes o mal revocadas

### Autorización
Pueden reaparecer:
- IDOR
- Broken Access Control
- escalada horizontal
- escalada vertical
- manipulación de roles y permisos

### Exposición de datos
Una API puede filtrar más información de la que el frontend usa.

### Inyecciones y validación
Si la API arma consultas, comandos o renderizados de manera insegura, pueden reaparecer otras familias de ataques.

Esto muestra que estudiar APIs no significa empezar de cero, sino entender cómo cambian los riesgos cuando la lógica del sistema se expone de forma programable.

---

## Qué diferencia hay entre una API y una interfaz web desde la perspectiva del atacante

Desde la perspectiva ofensiva, una API puede tener varias ventajas.

### Menos ruido visual

No hace falta interactuar con botones, pantallas o navegación visual.

### Más repetibilidad

Las acciones pueden automatizarse más fácilmente.

### Más visibilidad del modelo de datos

A veces la estructura de recursos, respuestas y errores revela mejor cómo está organizado el sistema.

### Más facilidad para probar variaciones

Es más fácil cambiar parámetros, IDs, cuerpos de requests, orden de llamadas o combinaciones de operaciones.

### Menos fricción

Si los controles están mal puestos, la API puede ser una vía más directa que la interfaz.

Por eso una API insegura puede ser muy útil para explorar el sistema con precisión y velocidad.

---

## Qué impacto puede tener un ataque a APIs

El impacto depende del tipo de API y de los recursos que exponga, pero puede ser enorme.

### Sobre confidencialidad

Puede exponer:

- datos personales
- historiales
- documentos
- metadatos
- relaciones internas
- información sensible de usuarios o del negocio

### Sobre integridad

Puede permitir:

- modificar recursos
- cambiar estados
- alterar relaciones
- crear o borrar objetos
- abusar de acciones administrativas

### Sobre disponibilidad

Puede afectar:

- operación de servicios
- recursos compartidos
- rendimiento
- colas o procesos internos
- estabilidad del backend

### Sobre seguridad general

Puede abrir la puerta a:
- reconocimiento profundo
- automatización de abuso
- escaladas de privilegio
- explotación encadenada con otros fallos

En sistemas modernos, una API comprometida muchas veces equivale a comprometer el corazón funcional de la aplicación.

---

## Ejemplo conceptual simple

Imaginá una aplicación con:

- frontend web
- app móvil
- panel administrativo
- API central para usuarios, pedidos y documentos

La interfaz web puede mostrar solo “lo correcto” para cada persona.  
Pero si la API:

- devuelve más datos de los necesarios
- no valida bien qué recursos pertenecen a quién
- deja ejecutar operaciones con pocos controles
- expone funciones directas de gestión

entonces el problema real está en la API, aunque el frontend “se vea bien”.

Ese es el corazón de este tema:

> la API puede ser la verdadera superficie de ataque principal, aunque la gente piense primero en la interfaz web.

---

## Qué señales deberían hacer sospechar riesgo en una API

Algunas situaciones conceptuales suelen indicar que vale la pena mirar la API con más cuidado.

### Ejemplos de señales

- endpoints que devuelven demasiada información
- estructuras de recursos fáciles de enumerar
- validación débil de propiedad o permisos
- acciones de alto impacto expuestas de forma muy directa
- ausencia de límites frente a automatización
- respuestas que revelan demasiado sobre objetos o estados
- diferencias entre lo que la UI permite y lo que la API acepta
- herramientas internas o móviles que usan endpoints menos protegidos que la web principal

Muchas veces el problema aparece no por una sola falla grande, sino por una combinación de exposición, automatización y control de acceso débil.

---

## Por qué este tema es cada vez más importante

Las APIs son cada vez más relevantes porque muchas arquitecturas modernas dependen fuertemente de ellas.

Hoy es muy común ver sistemas con:

- frontend separado del backend
- apps móviles
- microservicios
- integraciones de terceros
- paneles internos
- clientes múltiples sobre el mismo dominio lógico

Eso hace que la API ya no sea un “complemento”, sino a menudo el núcleo real del sistema.

Y si el núcleo está mal protegido, el impacto puede ser muy amplio.

---

## Qué puede hacer una organización para defender mejor sus APIs

Desde una mirada defensiva, algunas ideas clave son:

- tratar la API como una superficie principal de seguridad, no como un detalle técnico del backend
- validar autenticación y autorización con el mismo rigor en todos los endpoints
- revisar qué datos devuelve cada respuesta y si realmente hacen falta
- aplicar mínimo privilegio a nivel de recurso, acción y rol
- limitar abuso automatizado cuando corresponda
- auditar diferencias entre web, móvil, paneles y herramientas internas
- revisar cómo se exponen objetos, identificadores y relaciones
- diseñar la API pensando en seguridad desde el modelo de recursos y no solo desde el transporte

La idea importante es que una API segura no depende solo de “tener tokens”, sino de decidir bien:

- qué expone
- a quién
- con qué límites
- con qué contexto
- y con qué nivel de visibilidad o automatización posible

---

## Error común: pensar que si la API usa JSON ya está “ordenada” y por eso es segura

No.

Que una API sea prolija, moderna o fácil de consumir no la vuelve segura.

Puede seguir siendo vulnerable si:

- autentica mal
- autoriza mal
- expone demasiado
- acepta combinaciones peligrosas
- deja automatizar abuso sin controles
- revela demasiado del modelo interno

La claridad del formato no reemplaza la seguridad del diseño.

---

## Error común: creer que solo importa proteger el login de la API

Eso es importante, pero no alcanza.

Una API puede tener autenticación correcta y aun así ser insegura si luego:

- no valida propiedad
- expone datos de más
- permite acciones indebidas
- devuelve objetos completos sin necesidad
- deja funciones administrativas alcanzables
- no controla bien la relación entre identidad, acción y recurso

La seguridad de una API es mucho más que “poner auth al principio”.

---

## Idea clave del tema

Los ataques a APIs son especialmente importantes porque las APIs exponen la lógica real del sistema de forma programable, directa y automatizable.

Este tema enseña que:

- muchas fallas conocidas reaparecen en APIs con gran impacto
- la diferencia no está solo en el formato, sino en la superficie programable y en la facilidad para automatizar abuso
- una API puede estar peor protegida que la interfaz visual y aun así ser el corazón del sistema
- la defensa requiere mirar autenticación, autorización, exposición de datos, lógica de negocio y automatización como un conjunto

---

## Resumen

En este tema vimos que:

- una API expone funciones y recursos del sistema para clientes o componentes
- puede ser una superficie de ataque especialmente valiosa por ser directa y programable
- en APIs reaparecen problemas de autenticación, autorización, exposición de datos y abuso lógico
- la interfaz web no garantiza que la API esté bien protegida
- el impacto puede ser enorme porque la API suele ser el backend real de la aplicación
- la defensa requiere tratarla como una superficie principal y revisar tanto diseño como control de acceso y exposición

---

## Ejercicio de reflexión

Pensá en una aplicación con:

- frontend web
- app móvil
- panel administrativo
- API central
- usuarios con distintos roles
- documentos, pedidos y configuraciones
- algunas integraciones externas

Intentá responder:

1. ¿qué recursos expone la API?
2. ¿qué diferencias puede haber entre lo que la UI muestra y lo que la API realmente devuelve o permite?
3. ¿qué riesgos aumentan por el hecho de que la API sea programable?
4. ¿qué endpoints serían más críticos para revisar primero?
5. ¿qué principios aplicarías para que la API no se convierta en la principal superficie de abuso del sistema?

---

## Autoevaluación rápida

### 1. ¿Qué hace especialmente sensibles a las APIs?

Que exponen funciones del sistema de forma directa, estructurada y automatizable, muchas veces siendo el verdadero backend de la aplicación.

### 2. ¿Las APIs tienen vulnerabilidades completamente distintas a la web tradicional?

No. Muchas veces reaparecen los mismos problemas, pero con más facilidad de automatización y con una superficie más directa.

### 3. ¿Por qué la API puede ser más peligrosa que la interfaz visual?

Porque puede permitir acciones, devolver datos o aceptar combinaciones que la UI oculta o limita visualmente.

### 4. ¿Qué defensa ayuda mucho a protegerlas?

Tratar la API como una superficie principal de seguridad y revisar con rigor autenticación, autorización, exposición de datos, lógica de negocio y abuso automatizado.

---

## Próximo tema

En el siguiente tema vamos a estudiar la **exposición excesiva de datos en APIs**, un problema muy frecuente donde la aplicación devuelve más información de la necesaria y termina filtrando detalles sensibles, internos o innecesarios aunque la operación parezca legítima.
