---
title: "Sumando Keycloak al Compose y levantando la primera infraestructura real de identidad"
description: "Primer paso práctico del módulo 10. Incorporación de Keycloak al entorno Compose de NovaMarket para establecer una primera infraestructura real de identidad dentro del sistema."
order: 92
module: "Módulo 10 · Seguridad real con Keycloak"
level: "intermedio"
draft: false
---

# Sumando Keycloak al Compose y levantando la primera infraestructura real de identidad

En la clase anterior dejamos algo bastante claro:

- NovaMarket ya está listo para una capa real de identidad,
- Keycloak entra acá como pieza de infraestructura y no como simple dependencia,
- y lo más sano ahora es darle un lugar concreto dentro del entorno integrado del sistema.

Ahora toca el paso concreto:

**sumar Keycloak al Compose y levantar la primera infraestructura real de identidad.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- incorporado Keycloak al entorno Compose de NovaMarket,
- mucho más claro qué significa que una pieza de identidad viva junto al resto de la infraestructura del sistema,
- validado el arranque básico de esa nueva pieza,
- y NovaMarket mejor preparado para el resto del bloque de seguridad real.

La meta de hoy no es todavía integrar Spring Security ni proteger rutas con JWT.  
La meta es mucho más concreta: **darle a NovaMarket una primera infraestructura de identidad funcionando de verdad dentro de su entorno multicontenedor**.

---

## Estado de partida

Partimos de un sistema donde ya:

- Compose describe infraestructura, núcleo y borde del sistema,
- el entorno multicontenedor ya es bastante serio,
- y el módulo ya dejó claro que la seguridad real necesita algo más que barreras simples en el gateway.

Eso significa que el problema ya no es si Keycloak tiene sentido.  
Ahora la pregunta útil es otra:

- **cómo lo incorporamos de forma coherente al entorno que ya existe**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir cómo introducir Keycloak dentro de la composición,
- agregar el nuevo servicio al entorno,
- configurarlo con una primera forma razonable de arranque,
- levantar el stack actualizado,
- y validar que la nueva pieza de identidad ya vive junto al resto del sistema.

---

## Qué problema queremos resolver exactamente

Hasta ahora ya logramos algo importante:

- NovaMarket puede correr bastante bien como aplicación multicontenedor integrada.

Eso fue un gran salto.

Pero si queremos abrir de verdad el bloque de seguridad real, necesitamos algo más:

**que la identidad ya no sea una idea teórica, sino una pieza viva del entorno.**

Porque ahora conviene pasar de:

- “más adelante integraremos autenticación”
a
- “ya existe en el entorno una infraestructura de identidad real sobre la que vamos a construir el resto del bloque”

Ese cambio de postura es justamente el corazón de esta clase.

---

## Paso 1 · Entender qué lugar va a ocupar Keycloak

A esta altura del módulo, conviene pensarlo así:

- Keycloak no reemplaza al gateway
- no reemplaza a los servicios
- y no pertenece al dominio de negocio

Keycloak entra como:

- infraestructura de identidad,
- vecina del resto del stack,
- y fuente de autenticación/tokenización sobre la que el sistema va a empezar a confiar.

Esa lectura es muy importante para ubicar bien la pieza.

---

## Paso 2 · Elegir una primera configuración razonable para Compose

Para esta etapa del curso, una incorporación inicial bastante razonable puede verse así:

```yaml
services:
  keycloak:
    image: quay.io/keycloak/keycloak:26.1
    command: start-dev
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
    ports:
      - "8085:8080"
    networks:
      - novamarket-net
```

La versión exacta puede variar con el tiempo, pero lo importante hoy es el patrón:

- imagen oficial
- modo de desarrollo
- usuario administrador inicial
- y puerto publicado para poder entrar desde el host

Eso ya tiene muchísimo valor para inaugurar el bloque.

---

## Paso 3 · Entender por qué `start-dev` tiene sentido acá

Este punto importa mucho.

Para una primera integración didáctica y práctica, `start-dev` es una gran opción porque:

- reduce complejidad inicial,
- permite levantar rápidamente la pieza,
- y nos deja enfocarnos primero en el rol de Keycloak dentro del entorno antes de meternos en endurecimiento o despliegue más serio.

Eso no significa que sea la forma final de correrlo en todos los contextos.  
Significa algo más preciso:

- **es una forma excelente de inaugurar el bloque dentro del curso práctico**

---

## Paso 4 · Pensar qué cambia en la red del sistema

Ahora que Keycloak entra al Compose, la red `novamarket-net` gana otra pieza muy importante.

Eso importa muchísimo porque el entorno ya no solo sostiene:

- configuración,
- discovery,
- negocio,
- gateway

Ahora además sostiene:

- identidad

Ese salto cambia bastante la lectura del stack y lo vuelve mucho más parecido a una arquitectura de microservicios real.

---

## Paso 5 · Levantar la composición actualizada

Ahora levantá el entorno otra vez:

```bash
docker compose up
```

o:

```bash
docker compose up -d
```

La idea es que el stack ya no solo levante el sistema de negocio, sino también la pieza que va a sostener el siguiente bloque de seguridad.

Ese es uno de los momentos más importantes de la clase, porque el cambio deja de ser teórico y empieza a vivir dentro del entorno real de NovaMarket.

---

## Paso 6 · Verificar que Keycloak esté vivo

Ahora probá entrar a algo como:

```txt
http://localhost:8085
```

Lo importante es confirmar que:

- Keycloak arranca,
- responde,
- y ya forma parte visible del entorno del sistema.

No hace falta todavía configurar todo.  
La meta de hoy es mucho más concreta: validar la presencia real de esta nueva pieza.

---

## Paso 7 · Entender qué acabamos de ganar

Este punto importa muchísimo.

Hasta ahora, la seguridad real era una intención lógica del roadmap.

Ahora, en cambio, ya existe:

- una pieza concreta,
- viva,
- accesible,
- y sostenida por el mismo Compose que ya sostiene el resto del sistema.

Eso cambia muchísimo la madurez del bloque, porque la identidad deja de ser un tema abstracto y pasa a ser infraestructura real.

---

## Paso 8 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya tiene su seguridad real integrada”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene su primera infraestructura real de identidad funcionando dentro del entorno Compose.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase suma Keycloak al Compose y levanta la primera infraestructura real de identidad de NovaMarket.

Ya no estamos solo hablando de seguridad más seria.  
Ahora también estamos haciendo que la pieza que la va a sostener viva dentro del mismo entorno integrado del sistema.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- configuramos realms, clients, usuarios o roles,
- ni integramos todavía el gateway o los servicios con tokens reales,
- ni consolidamos aún este subbloque con un checkpoint fuerte.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dar el primer paso real para que la identidad del sistema tenga una infraestructura concreta dentro de NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Pensar que levantar Keycloak ya equivale a tener seguridad integrada
No. Este es solo el primer paso de infraestructura.

### 2. Tratar a Keycloak como si fuera un servicio más del negocio
No pertenece al dominio; pertenece a la infraestructura de identidad.

### 3. Querer resolver realms, tokens y protección de rutas en la misma clase
Conviene ir bloque por bloque.

### 4. No validar que la pieza realmente arranca y responde
La verificación sigue siendo parte esencial de la clase.

### 5. No ver el cambio de escala del proyecto después de esta incorporación
Ahora el entorno ya sostiene también identidad real.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- Keycloak ya forma parte del Compose,
- arranca correctamente,
- vive junto al resto de la arquitectura,
- y NovaMarket ya dio un primer paso serio hacia seguridad real basada en identidad.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- Keycloak está agregado al Compose,
- el entorno actualizado levanta correctamente,
- la consola web responde,
- y sentís que la identidad ya dejó de ser una idea futura para convertirse en una pieza real del sistema.

Si eso está bien, ya podemos pasar al siguiente tema y consolidar esta incorporación inicial antes de empezar a configurar realms y clients.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta incorporación inicial de Keycloak al entorno de NovaMarket antes de entrar en el modelado práctico de realm, client, usuarios y roles.

---

## Cierre

En esta clase sumamos Keycloak al Compose y levantamos la primera infraestructura real de identidad.

Con eso, NovaMarket deja de preparar la seguridad solo desde el discurso o desde barreras simples en el gateway y empieza a sostenerla con una pieza mucho más seria, mucho más centralizada y mucho más alineada con una arquitectura real de microservicios.
