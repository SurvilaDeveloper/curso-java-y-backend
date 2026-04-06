---
title: "Bloqueo, throttling y defensa contra brute force"
description: "Cómo diseñar defensas razonables contra intentos masivos de login en una aplicación Java con Spring Boot y Spring Security. Qué diferencia hay entre bloqueo y throttling, qué riesgos tiene cada enfoque y cómo reducir abuso sin dañar demasiado a usuarios legítimos."
order: 26
module: "Autenticación"
level: "base"
draft: false
---

# Bloqueo, throttling y defensa contra brute force

## Objetivo del tema

Entender cómo defender un backend Java + Spring Boot + Spring Security contra intentos masivos de autenticación, sin caer en soluciones simplistas que terminan siendo:

- fáciles de abusar
- incómodas para usuarios legítimos
- pobres para observabilidad
- rígidas para operar
- o directamente contraproducentes

Este tema importa mucho porque el login es una superficie muy atractiva para:

- probar credenciales robadas
- automatizar intentos
- hacer password spraying
- explotar usuarios con contraseñas débiles
- desgastar el sistema
- generar ruido operacional

La idea central es esta:

> no alcanza con verificar bien la password.  
> También hay que decidir qué hace el sistema cuando alguien insiste demasiado.

---

## Idea clave

Defender el login contra brute force no significa solo “bloquear usuarios”.

Tampoco significa solo “poner rate limit”.

En resumen:

> una defensa razonable combina fricción, límites, observabilidad y decisiones de contención que reduzcan el valor de la automatización sin volver el acceso legítimo innecesariamente frágil.

Por eso conviene distinguir varias cosas que a veces se mezclan demasiado:

- bloqueo
- throttling
- rate limiting
- detección de patrones
- respuesta por cuenta
- respuesta por IP o fuente
- respuesta por contexto

---

## Qué es brute force en este contexto

En autenticación, brute force suele referirse a intentos automatizados o repetidos para adivinar credenciales.

Pero en la práctica conviene distinguir varios patrones:

## 1. Bruteforce clásico sobre una cuenta
Muchas contraseñas sobre un mismo usuario.

## 2. Credential stuffing
Muchos pares email/password robados de otros sistemas.

## 3. Password spraying
Pocas contraseñas comunes contra muchas cuentas.

## 4. Abuso distribuido
Intentos repartidos entre varias IPs o fuentes.

## 5. Ruido operacional o scraping de login
Intentos repetidos que, aunque no entren, ya generan carga, señal falsa o costo operativo.

No todas las defensas sirven igual para todos esos patrones.

---

## Qué queremos lograr realmente

Una buena defensa contra brute force debería intentar varias cosas a la vez:

- volver menos rentable la automatización
- encarecer intentos repetidos
- proteger cuentas reales
- reducir daño ante credenciales débiles o robadas
- no regalar demasiadas señales
- no romper innecesariamente la UX legítima
- dejar trazabilidad útil para investigación

Es decir, no solo queremos “rechazar” requests.
Queremos que el login sea una mala superficie para probar volumen.

---

## Diferencia entre bloqueo y throttling

Esto conviene separarlo muy bien.

## Bloqueo
Es impedir temporal o permanentemente nuevos intentos bajo ciertas condiciones.

Ejemplos:
- bloquear la cuenta por 15 minutos
- bloquear después de demasiados intentos fallidos
- exigir intervención adicional

## Throttling
Es enlentecer o limitar la velocidad de intentos sin cerrar completamente el acceso.

Ejemplos:
- agregar espera progresiva
- permitir menos intentos por ventana
- hacer más costoso cada fallo repetido

### Resumen útil

- el bloqueo corta
- el throttling frena

Ambos pueden servir, pero tienen efectos colaterales distintos.

---

## Error mental clásico

Muchos sistemas arrancan con una idea muy simple:

- “después de 5 intentos, bloqueo la cuenta”

Eso puede ayudar en algunos casos, pero por sí solo tiene varios problemas:

- se vuelve fácil de usar para hacer denial of access sobre cuentas legítimas
- puede generar soporte innecesario
- no frena bien ataques distribuidos o spraying
- no da una política gradual
- puede castigar demasiado a usuarios genuinos que se equivocan

Entonces, aunque el bloqueo puede servir, rara vez conviene tratarlo como la única defensa.

---

## Qué es throttling en la práctica

Throttling suele significar que, a medida que los intentos fallan, el sistema:

- aumenta fricción
- agrega esperas
- limita la frecuencia
- reduce throughput por actor, cuenta o fuente

### Ejemplos simples

- esperar 1 segundo después de cierto número de fallos
- esperar 5 segundos después de más fallos
- permitir solo cierta tasa por ventana
- exigir pausa antes de volver a intentar

Esto suele ser menos agresivo que bloquear de inmediato y puede reducir mucho el valor de la automatización.

---

## Por qué el brute force no es solo un problema de contraseña

Aunque las contraseñas fuertes ayudan, no resuelven todo.

Porque el riesgo también depende de:

- volumen de intentos permitidos
- visibilidad de señales del login
- reutilización de credenciales robadas
- cuentas no protegidas adicionalmente
- respuesta del sistema frente a repetición
- facilidad para automatizar

En resumen:

> una contraseña fuerte ayuda, pero un flujo de autenticación sin defensa de volumen sigue siendo una superficie atractiva.

---

## Qué dimensiones conviene observar

Cuando pensás defensa contra brute force, conviene mirar varias dimensiones:

## 1. Por cuenta
¿Cuántos intentos fallidos hay sobre el mismo usuario?

## 2. Por IP o fuente
¿Cuántos intentos vienen de la misma fuente?

## 3. Por combinación fuente + cuenta
¿Cuándo una misma IP insiste sobre una cuenta específica?

## 4. Por patrón global
¿Hay password spraying o actividad masiva dispersa?

## 5. Por ventana temporal
¿Está ocurriendo rápido o sostenido?

Si solo mirás una dimensión, te quedan huecos en otras.

---

## Bloqueo por cuenta: ventajas y riesgos

### Ventajas
- protege bastante bien contra insistencia simple sobre una cuenta
- fácil de explicar
- fácil de implementar
- reduce cierto daño directo

### Riesgos
- permite denial of access sobre usuarios legítimos
- puede usarse para molestar soporte
- afecta experiencia de usuarios reales
- no resuelve bien ataques distribuidos o spraying

### Cuándo puede tener sentido
- como medida complementaria
- por ventanas temporales
- con criterios prudentes
- junto con observabilidad y otras capas

---

## Throttling: ventajas y riesgos

### Ventajas
- reduce velocidad de automatización
- castiga menos a usuarios reales que un bloqueo duro
- puede escalar de forma gradual
- sirve bien contra repetición rápida

### Riesgos
- si es muy laxo, no frena lo suficiente
- si es muy agresivo, empeora UX legítima
- puede requerir mejor diseño operativo
- no siempre frena ataques distribuidos por sí solo

### Cuándo suele ser útil
- casi siempre como capa base
- especialmente antes de llegar a bloqueo fuerte
- combinado con monitoreo y señales adicionales

---

## Rate limiting no es exactamente lo mismo

A veces se usa como término paraguas, pero conviene pensarlo con algo más de precisión.

### Rate limiting
Limita cantidad de requests por ventana o por clave de control.

Puede aplicarse a:
- IP
- usuario
- endpoint
- token
- fingerprint
- combinaciones

### Relación con throttling
El rate limiting puede ser una forma concreta de throttling, pero no todo throttling es simplemente cortar por cuota fija.

---

## Qué señales del login empeoran el problema

Algunas decisiones del flujo de login hacen más rentable el abuso, por ejemplo:

- respuestas demasiado distintas según el error
- latencias demasiado distintas entre usuario existente y no existente
- ausencia total de fricción
- falta de límites por ventana
- mensajes que ayudan a enumerar usuarios
- falta de registro útil de intentos
- comportamiento idéntico e ilimitado ante repetición

Un login seguro no solo verifica credenciales: también cuida cómo se comporta bajo presión.

---

## Qué datos conviene registrar

No todo intento necesita un log exhaustivo ruidoso.
Pero conviene poder registrar cosas como:

- cuenta objetivo
- timestamp
- IP o fuente
- éxito o fallo
- cantidad de fallos recientes
- activación de throttling
- activación de bloqueo
- eventos anómalos
- desbloqueo o recuperación

Esto ayuda a:

- investigación
- alertas
- soporte
- tuning de políticas
- respuesta a incidentes

---

## Ejemplo conceptual de política gradual

Una estrategia razonable podría verse así:

### Nivel 1
Pocos fallos:
- responder normal
- registrar

### Nivel 2
Más fallos:
- agregar pequeña demora
- seguir registrando

### Nivel 3
Persistencia clara:
- demora mayor
- posible desafío adicional o fricción extra

### Nivel 4
Patrón muy agresivo:
- bloqueo temporal
- alerta
- análisis adicional

La idea no es memorizar una política exacta.
La idea es ver que una defensa madura suele ser gradual, no binaria.

---

## Qué pasa si bloqueás demasiado rápido

Si la política es muy dura, por ejemplo:

- 3 intentos y bloqueo total

podés generar problemas como:

- usuarios legítimos bloqueados por error
- soporte saturado
- denial of access intencional sobre cuentas reales
- mala experiencia general
- gente evitando el sistema o generando tickets innecesarios

Una defensa fuerte pero torpe también puede dañar al negocio.

---

## Qué pasa si no hacés nada

Si el login acepta intentos ilimitados o casi ilimitados, el atacante gana demasiado margen para:

- probar credenciales robadas
- insistir sobre cuentas débiles
- recorrer listas
- automatizar sin demasiado costo
- extraer señales del comportamiento

Eso deja al sistema innecesariamente expuesto incluso si usa buen hashing y buena arquitectura de autenticación.

---

## Qué rol cumple Spring Security acá

Spring Security resuelve muy bien varias partes del flujo de autenticación, pero este tipo de defensa normalmente exige decisiones adicionales del sistema, por ejemplo:

- contadores de intentos
- ventanas temporales
- tracking por cuenta o IP
- bloqueos temporales
- servicios de rate limiting
- listeners o hooks de eventos de autenticación
- políticas de respuesta y observabilidad

No conviene asumir que “usar Spring Security” ya resuelve automáticamente defensa de volumen.

---

## Dónde suele vivir esta lógica

Dependiendo del sistema, la defensa contra brute force puede repartirse entre:

- service de auth
- listeners de eventos de autenticación
- filtros
- infraestructura perimetral
- API gateway
- cache o store temporal para contadores
- reglas por cuenta
- reglas por IP o fuente

Lo importante no es que todo viva en un solo archivo.
Lo importante es que el equipo tenga clara la política y sus puntos de aplicación.

---

## Ejemplo conceptual de respuesta gradual por cuenta

No vamos a fijar una implementación única, pero mentalmente podría verse así:

```java
public void onFailedLogin(String normalizedEmail, String sourceIp) {
    failedLoginTracker.registerFailure(normalizedEmail, sourceIp);

    if (failedLoginTracker.shouldTemporarilyBlock(normalizedEmail)) {
        accountProtectionService.temporarilyBlock(normalizedEmail);
    }
}
```

Y luego en el flujo de login:

```java
public AuthResponse login(LoginRequest request, String sourceIp) {
    String normalizedEmail = request.getEmail().trim().toLowerCase();

    if (accountProtectionService.isTemporarilyBlocked(normalizedEmail)) {
        throw new IllegalStateException("Acceso temporalmente restringido");
    }

    try {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        normalizedEmail,
                        request.getPassword()
                )
        );

        failedLoginTracker.clear(normalizedEmail, sourceIp);

        SecurityUser principal = (SecurityUser) authentication.getPrincipal();
        return tokenService.issueTokens(principal);

    } catch (AuthenticationException ex) {
        onFailedLogin(normalizedEmail, sourceIp);
        throw ex;
    }
}
```

### Importante

Esto es solo una forma conceptual de ordenar responsabilidades.
Lo valioso del ejemplo es la idea de:

- medir
- responder
- limpiar contadores al éxito
- separar seguimiento de intentos del resto de la autenticación

---

## Qué no deberías hacer

Estas cosas suelen ser malas ideas:

- bloqueo permanente demasiado fácil
- no distinguir fallos por tiempo o contexto
- no registrar nada
- responder con mensajes muy distintos según cuenta/IP/estado
- dejar intentos ilimitados
- confiar solo en bloqueo por cuenta
- castigar tanto que el login legítimo quede roto
- diseñar defensa sin posibilidad de ajuste o tuning
- no pensar el impacto operativo sobre soporte y usuarios reales

---

## Relación con credential stuffing y spraying

Esto es importante porque muchas apps piensan solo en brute force clásico sobre una cuenta.

Pero en credential stuffing y password spraying:

- pocas contraseñas se prueban sobre muchas cuentas
- o muchas credenciales robadas se prueban de forma distribuida

Ahí una defensa solo por cuenta puede ser insuficiente.

Por eso conviene combinar:

- observación por cuenta
- observación por fuente
- observación por patrón global
- fricción gradual
- monitoreo

No todos los ataques se ven iguales.

---

## Qué gana el backend si resuelve bien esto

Un backend que trata mejor el problema gana:

- menor rentabilidad para automatización
- más protección sobre cuentas reales
- menos daño ante credenciales débiles o robadas
- más observabilidad
- mejor capacidad de respuesta
- menos necesidad de improvisar en incidentes
- mejor equilibrio entre seguridad y experiencia

No se trata solo de bloquear.
Se trata de administrar mejor una superficie muy atractiva.

---

## Señales de diseño sano

Una defensa más sana suele mostrar:

- límites razonables
- fricción gradual
- registro útil
- política clara y explicable
- baja revelación en respuestas
- separación entre autenticación y tracking de intentos
- posibilidad de ajustar parámetros
- combinación razonable de señales

---

## Señales de ruido

Estas cosas suelen hacer ruido rápido:

- login ilimitado
- solo bloqueo duro y nada más
- respuestas demasiado específicas
- cero trazabilidad
- política imposible de explicar
- decisiones arbitrarias sin tuning
- soporte saturado por falsos bloqueos
- no considerar ataques distribuidos o spraying
- dependencia absoluta de una sola defensa

---

## Checklist práctico

Cuando revises defensa contra brute force en una app Spring, preguntate:

- ¿qué pasa después de varios intentos fallidos?
- ¿hay algún throttling o rate limiting?
- ¿hay bloqueo temporal o alguna fricción gradual?
- ¿qué dimensión se observa: cuenta, IP, ambas?
- ¿la respuesta revela demasiado?
- ¿el sistema registra intentos fallidos y exitosos?
- ¿la política es configurable o está clavada sin criterio?
- ¿qué tan fácil sería hacer denial of access sobre una cuenta legítima?
- ¿la estrategia sirve solo para un atacante simple o también piensa en stuffing y spraying?
- ¿el equipo puede explicar claramente cuándo se frena, cuándo se bloquea y cuándo se alerta?

---

## Mini ejercicio de reflexión

Tomá tu flujo de login actual y respondé:

1. ¿Cuántos intentos fallidos permite realmente?
2. ¿Qué cambia entre el primer fallo y el décimo?
3. ¿Qué pasa con una cuenta legítima atacada desde afuera?
4. ¿Qué pasa con un atacante que reparte intentos entre muchas cuentas?
5. ¿Qué trazabilidad deja hoy el sistema?
6. ¿Tu defensa es más de bloqueo, más de throttling, o casi inexistente?
7. ¿Dónde harías el primer ajuste para volver el abuso menos rentable sin romper mucho la UX?

Ese ejercicio suele mostrar enseguida si el login está demasiado expuesto o demasiado rígido.

---

## Resumen

Defender autenticación contra brute force exige más que comparar bien una password.

Conviene pensar en:

- bloqueo
- throttling
- rate limiting
- observación por cuenta y por fuente
- mensajes prudentes
- trazabilidad
- fricción gradual
- equilibrio con experiencia legítima

En resumen:

> Una buena defensa contra intentos masivos no depende de una sola medida extrema.  
> Suele depender de varias capas moderadas que juntas vuelven el abuso más caro, más lento y más visible.

---

## Próximo tema

**Recuperación de contraseña segura**
