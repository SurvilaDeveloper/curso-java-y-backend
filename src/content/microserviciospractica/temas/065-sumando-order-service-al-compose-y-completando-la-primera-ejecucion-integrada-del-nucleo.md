---
title: "Sumando order-service al Compose y completando la primera ejecución integrada del núcleo"
description: "Siguiente paso práctico del módulo 8. Incorporación de order-service al compose.yaml para completar la primera ejecución integrada del núcleo de negocio de NovaMarket."
order: 65
module: "Módulo 8 · Docker Compose para NovaMarket"
level: "intermedio"
draft: false
---

# Sumando `order-service` al Compose y completando la primera ejecución integrada del núcleo

En la clase anterior hicimos un paso muy importante dentro del bloque de Compose:

- sumamos `inventory-service`,
- dejamos infraestructura + catálogo + inventario conviviendo en una misma ejecución integrada,
- y el archivo `compose.yaml` empezó a parecerse mucho más a una descripción real del sistema.

Eso ya tiene muchísimo valor.

Pero ahora toca el siguiente paso natural y bastante importante:

**sumar `order-service` al Compose y completar la primera ejecución integrada del núcleo de negocio de NovaMarket.**

Ese es el objetivo de esta clase.

Porque una cosa es tener dos piezas del dominio dentro de la composición.  
Y otra bastante distinta es completar el trío funcional central del sistema:

- catálogo
- inventario
- órdenes

Ese cierre ya cambia bastante la lectura del proyecto.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- agregado `order-service` al `compose.yaml`,
- mucho más claro cómo el archivo ya empieza a describir el núcleo de negocio completo,
- validada la primera ejecución integrada del corazón funcional de NovaMarket,
- y el proyecto bastante más cerca de una versión multicontenedor que ya se parece de verdad a la aplicación real.

La meta de hoy no es tener todavía gateway + todo el borde dentro del Compose.  
La meta es mucho más concreta: **cerrar el bloque del núcleo funcional dentro de la composición integrada.**

---

## Estado de partida

Partimos de un proyecto donde ya:

- `config-server` está en Compose,
- `discovery-server` está en Compose,
- `catalog-service` está en Compose,
- `inventory-service` está en Compose,
- y el archivo ya dejó de ser una simple prueba para convertirse en una base real de ejecución integrada.

Eso significa que ahora la pregunta útil ya no es:

- “¿Compose sirve para correr partes del negocio?”

La pregunta útil es otra:

- **¿cómo terminamos de llevar el núcleo de negocio real del sistema a esta ejecución integrada?**

Y eso es exactamente lo que vamos a resolver en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué necesita `order-service` para entrar al Compose,
- agregarlo al archivo,
- levantar la composición ampliada,
- verificar que el servicio vive dentro del entorno integrado,
- y consolidar qué significa tener el corazón del negocio corriendo ya dentro de una misma definición multicontenedor.

---

## Qué problema queremos resolver exactamente

Hasta ahora ya logramos algo muy importante:

- Compose describe infraestructura
- y dos piezas reales del dominio.

Eso fue un gran paso.

Pero si queremos acercarnos de verdad a NovaMarket como aplicación multicontenedor coherente, necesitamos algo más:

**que también el servicio de órdenes, que representa el flujo central de compra, pase a formar parte explícita de esa composición.**

Ese cierre es justamente el corazón de esta clase.

---

## Por qué `order-service` vuelve especialmente valiosa esta etapa

A esta altura del curso, `order-service` no es una pieza cualquiera.

Es una muy buena forma de cerrar este subbloque porque:

- participa del flujo central del sistema,
- depende conceptualmente de otras piezas del dominio,
- y hace que el Compose ya no describa solo servicios “de apoyo” o de lectura, sino una parte bastante más seria del comportamiento del negocio.

Ese matiz importa muchísimo.

---

## Paso 1 · Confirmar que `order-service` ya tiene imagen disponible

Como ya lo dockerizamos en el módulo anterior, deberíamos tener lista una imagen como:

```txt
novamarket/order-service:dev
```

Esto vuelve a reforzar algo importante:

Compose no reemplaza la dockerización previa.  
La usa como base para una ejecución más integrada y declarativa.

---

## Paso 2 · Agregar `order-service` al `compose.yaml`

Ahora sumá `order-service` al archivo.

Una versión razonable podría verse así:

```yaml
services:
  config-server:
    image: novamarket/config-server:dev
    ports:
      - "8888:8888"
    networks:
      - novamarket-net

  discovery-server:
    image: novamarket/discovery-server:dev
    ports:
      - "8761:8761"
    depends_on:
      - config-server
    networks:
      - novamarket-net

  catalog-service:
    image: novamarket/catalog-service:dev
    ports:
      - "8081:8081"
    depends_on:
      - config-server
      - discovery-server
    networks:
      - novamarket-net

  inventory-service:
    image: novamarket/inventory-service:dev
    ports:
      - "8082:8082"
    depends_on:
      - config-server
      - discovery-server
    networks:
      - novamarket-net

  order-service:
    image: novamarket/order-service:dev
    ports:
      - "8083:8083"
    depends_on:
      - config-server
      - discovery-server
      - inventory-service
    networks:
      - novamarket-net

networks:
  novamarket-net:
```

Esta versión ya tiene muchísimo peso porque el Compose empieza a describir el núcleo funcional casi completo del proyecto.

---

## Paso 3 · Entender por qué `inventory-service` aparece como dependencia conceptual

Este punto importa mucho.

Aunque `depends_on` no resuelva toda la historia fina de salud o readiness, sí ayuda mucho a expresar la intención de la arquitectura.

En el caso de `order-service`, eso es especialmente valioso porque:

- órdenes tiene mucho sentido junto a infraestructura
- pero además está fuertemente ligada al mundo de inventario dentro del flujo real del sistema

Dejar esa relación visible en el archivo mejora bastante su legibilidad.

---

## Paso 4 · Levantar la composición ampliada

Ahora levantá la composición actualizada:

```bash
docker compose up
```

o:

```bash
docker compose up -d
```

La idea es que por primera vez el Compose ya levante:

- `config-server`
- `discovery-server`
- `catalog-service`
- `inventory-service`
- `order-service`

Ese momento vale muchísimo porque ya se siente bastante más cerca de una aplicación real y no solo de una infraestructura de soporte con ejemplos sueltos.

---

## Paso 5 · Verificar que `order-service` esté vivo

Ahora hacé una prueba básica sobre órdenes.

Por ejemplo:

```bash
curl -i -X POST http://localhost:8083/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 1 }
    ]
  }'
```

El comportamiento exacto puede depender de qué tan bien hayan quedado alineadas las piezas en este entorno, pero lo importante es validar que:

- el servicio arranca,
- expone su endpoint,
- y ya forma parte del Compose como pieza real del dominio.

---

## Paso 6 · Revisar Eureka

Ahora conviene mirar:

```txt
http://localhost:8761
```

Lo esperable es que la consola ya muestre algo como:

- `CATALOG-SERVICE`
- `INVENTORY-SERVICE`
- `ORDER-SERVICE`

además de la infraestructura que corresponda.

Este paso es muy importante porque confirma que no solo agregaste contenedores a un archivo: también seguiste sosteniendo la lógica arquitectónica del sistema dentro de Compose.

---

## Paso 7 · Entender qué cambia al completar el núcleo del negocio

Este punto importa muchísimo.

Hasta la clase anterior, la composición ya tenía piezas valiosas del dominio.

Pero ahora, con órdenes adentro, la cosa cambia bastante.

¿Por qué?

Porque el archivo ya no describe:

- infraestructura
- más uno o dos servicios

Ahora describe algo mucho más importante:

- la base del sistema
- más el núcleo central del negocio

Ese salto cambia muchísimo la madurez del bloque.

---

## Paso 8 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya corre completo en Compose”

Sería exagerado.

Todavía faltan piezas importantes como:

- `api-gateway`
- quizá ajustes más finos de configuración
- y una lectura más fuerte del arranque coordinado del conjunto

Lo correcto es algo más preciso:

- NovaMarket ya tiene infraestructura + núcleo de negocio integrados dentro de Compose.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase suma `order-service` al Compose y completa la primera ejecución integrada del núcleo de negocio de NovaMarket.

Ya no estamos solo ampliando una composición.  
Ahora también estamos convirtiéndola en una representación bastante seria del corazón funcional del sistema.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- sumamos `api-gateway`,
- ni cerramos todavía una experiencia de entrada unificada dentro de Compose,
- ni consolidamos aún este bloque con una síntesis fuerte.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**cerrar el núcleo funcional del sistema dentro del `compose.yaml`.**

---

## Errores comunes en esta etapa

### 1. Pensar que sumar `order-service` es solo un paso más
En realidad cambia bastante el peso arquitectónico de la composición.

### 2. No revisar Eureka además de los endpoints
La coherencia arquitectónica sigue siendo central.

### 3. Confundir núcleo del negocio integrado con aplicación completa
Todavía falta el borde del sistema dentro de Compose.

### 4. Exagerar lo logrado
Aún no estamos en la versión completa del stack.

### 5. No reconocer el salto de madurez del archivo después de esta clase
Ese cambio es justamente el corazón del bloque.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- `order-service` ya forma parte del Compose,
- la composición ya contiene infraestructura + núcleo de negocio,
- el sistema está mucho más cerca de una ejecución real integrada,
- y el archivo ya representa una porción bastante seria de NovaMarket.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- `order-service` está agregado al Compose,
- la composición levanta correctamente,
- el servicio responde,
- aparece en Eureka,
- y sentís que el archivo ya empieza a representar el corazón real del sistema.

Si eso está bien, ya podemos pasar al siguiente tema y consolidar esta primera ejecución integrada del núcleo antes de abrir el siguiente gran paso.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta primera ejecución integrada del núcleo de negocio de NovaMarket antes de sumar `api-gateway` y completar un entorno Compose mucho más cercano a la aplicación real.

---

## Cierre

En esta clase sumamos `order-service` al Compose y completamos la primera ejecución integrada del núcleo del negocio.

Con eso, NovaMarket deja atrás una composición todavía parcial y empieza a mostrar, de forma bastante más seria, cómo su infraestructura y su corazón funcional ya pueden convivir dentro de una misma aplicación multicontenedor declarativa.
