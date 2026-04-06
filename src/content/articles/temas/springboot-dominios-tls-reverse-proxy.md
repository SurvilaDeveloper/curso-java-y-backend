---
title: "Spring Boot · Dominios, TLS y reverse proxy"
description: "Guía práctica para exponer una aplicación Spring Boot con dominio propio, HTTPS y un reverse proxy delante."
order: 11
module: "Spring Boot - 'deploy'"
level: "intro"
draft: false
---
# Spring Boot · Dominios, TLS y reverse proxy

Guía práctica para exponer una aplicación Spring Boot con dominio propio, HTTPS y un reverse proxy delante.

---

## 1. Objetivo

Este documento resume cómo llevar una app Spring Boot a una URL pública como:

- `https://api.midominio.com`
- `https://app.midominio.com`

cubriendo:

- dominio y DNS
- terminación TLS
- reverse proxy
- headers `X-Forwarded-*`
- redirección HTTP → HTTPS
- WebSocket
- ejemplos con **Nginx** y **Caddy**
- diferencias entre **TLS en el proxy** y **TLS dentro de Spring Boot**

---

## 2. Arquitectura típica

La topología más común en producción es esta:

```text
Internet
   |
   v
[ Dominio + DNS ]
   |
   v
[ Reverse Proxy + TLS ]  --->  Nginx / Caddy
   |
   v
[ Spring Boot ]          --->  localhost:8080 o contenedor interno
```

### Ventajas de esta arquitectura

- el certificado TLS se administra en un solo lugar
- podés servir varios servicios bajo el mismo servidor
- el proxy puede hacer redirecciones, compresión, caching y rate limiting
- Spring Boot queda detrás de la red pública
- es más fácil rotar certificados y renovar HTTPS

---

## 3. Dominio y DNS

Antes de hablar de Spring Boot, necesitás que el dominio apunte a tu servidor.

### Registros comunes

#### A
Apunta un subdominio o dominio a una IP IPv4.

Ejemplo:

```dns
api.midominio.com  ->  203.0.113.10
```

#### AAAA
Apunta a una IP IPv6.

#### CNAME
Hace que un nombre apunte a otro nombre.

Ejemplo:

```dns
www.midominio.com  ->  midominio.com
```

### Recomendación práctica

Para una API o backend, lo más común es usar:

- `api.midominio.com`
- `back.midominio.com`
- `admin.midominio.com`

En lugar de colgar todo del dominio raíz.

---

## 4. Formas de montar HTTPS con Spring Boot

### Opción A — TLS en el reverse proxy

```text
Cliente HTTPS -> Reverse Proxy (termina TLS) -> Spring Boot por HTTP interno
```

Es la opción más usada.

#### Cuándo conviene

- VPS o EC2
- Docker Compose
- varios servicios en la misma máquina
- querés manejar certificados fuera de la app

#### Ventajas

- configuración más simple en la app
- certificados centralizados
- Nginx/Caddy manejan bien la exposición pública
- mejor separación entre red pública y aplicación

### Opción B — TLS dentro de Spring Boot

```text
Cliente HTTPS -> Spring Boot directamente
```

#### Cuándo conviene

- entornos simples
- pruebas puntuales
- una sola app expuesta sin proxy
- tráfico interno entre servicios con TLS extremo a extremo

#### Desventajas

- más responsabilidad dentro de la app
- más incómodo si servís varios sitios
- suele ser menos flexible para certificados, redirecciones y headers

### Opción C — TLS en el proxy y TLS también hacia Spring Boot

```text
Cliente HTTPS -> Proxy HTTPS -> Spring Boot HTTPS
```

Se usa cuando querés cifrado también dentro de la red interna o entre hosts distintos.

---

## 5. Qué conviene en la mayoría de proyectos

Para un backend Spring Boot normal:

- **dominio propio**
- **TLS terminado en Nginx o Caddy**
- **Spring Boot en `127.0.0.1:8080`** o en una red privada Docker
- **headers forward configurados correctamente**

Ese suele ser el punto de equilibrio más práctico.

---

## 6. Spring Boot detrás de un reverse proxy

Cuando Spring Boot está detrás de un proxy, la app necesita interpretar correctamente datos como:

- protocolo original (`https`)
- host original
- IP real del cliente
- puerto público

Si eso no está bien configurado, pueden aparecer problemas como:

- generación incorrecta de URLs absolutas
- redirecciones a `http` en lugar de `https`
- logs con IP del proxy en vez de IP real del cliente
- cookies `secure` mal evaluadas
- callbacks OAuth mal construidos

### Configuración recomendada

#### application.properties

```properties
server.forward-headers-strategy=framework
```

Alternativa común:

```properties
server.forward-headers-strategy=native
```

### Regla práctica

- probá primero con `framework`
- si tu stack/proxy ya maneja correctamente los forward headers y querés delegar más al servidor embebido, evaluá `native`

---

## 7. Nginx como reverse proxy para Spring Boot

### Caso base: Spring Boot en localhost:8080

```nginx
server {
    listen 80;
    server_name api.midominio.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
    }
}
```

### Qué hace cada header

- `Host`: preserva el host original
- `X-Real-IP`: pasa la IP remota directa
- `X-Forwarded-For`: encadena IPs del cliente y proxies intermedios
- `X-Forwarded-Proto`: indica si vino por `http` o `https`
- `X-Forwarded-Host`: host público recibido
- `X-Forwarded-Port`: puerto público

---

## 8. Nginx con redirección a HTTPS

```nginx
server {
    listen 80;
    server_name api.midominio.com;
    return 301 https://$host$request_uri;
}
```

Esta parte redirige todo HTTP a HTTPS.

---

## 9. Nginx con HTTPS hacia Spring Boot por HTTP interno

```nginx
server {
    listen 443 ssl http2;
    server_name api.midominio.com;

    ssl_certificate     /etc/letsencrypt/live/api.midominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.midominio.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port 443;
    }
}
```

---

## 10. Nginx y WebSocket

Si tu app usa WebSocket o SockJS, agregá los headers de upgrade:

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 443 ssl http2;
    server_name ws.midominio.com;

    ssl_certificate     /etc/letsencrypt/live/ws.midominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ws.midominio.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

---

## 11. Caddy como reverse proxy para Spring Boot

Caddy simplifica muchísimo HTTPS automático.

### Caso básico

```caddyfile
api.midominio.com {
    reverse_proxy 127.0.0.1:8080
}
```

Eso ya es muy potente para entornos simples porque Caddy:

- solicita certificados automáticamente
- renueva certificados automáticamente
- redirige HTTP a HTTPS
- actúa como reverse proxy

### Caso con headers explícitos

Normalmente no hace falta agregar demasiado, pero si querés dejarlo bien claro:

```caddyfile
api.midominio.com {
    reverse_proxy 127.0.0.1:8080 {
        header_up Host {host}
        header_up X-Forwarded-Proto {scheme}
        header_up X-Forwarded-For {remote_host}
    }
}
```

---

## 12. Spring Boot con TLS propio

Si decidís que la app atienda HTTPS directamente, necesitás un certificado y una clave.

### Variante con bundle JKS / PKCS12

```properties
spring.ssl.bundle.jks.web.key.alias=application
spring.ssl.bundle.jks.web.keystore.location=classpath:application.p12
spring.ssl.bundle.jks.web.keystore.password=secret
spring.ssl.bundle.jks.web.keystore.type=PKCS12
server.ssl.bundle=web
server.port=8443
```

### Variante con bundle PEM

```properties
spring.ssl.bundle.pem.web.keystore.certificate=classpath:application.crt
spring.ssl.bundle.pem.web.keystore.private-key=classpath:application.key
server.ssl.bundle=web
server.port=8443
```

### Cuándo tiene sentido

- mTLS o cifrado interno
- servicios entre hosts internos
- laboratorio o pruebas
- despliegues sin reverse proxy

---

## 13. Recomendación sobre certificados

### Para producción pública

Lo más normal es usar certificados públicos automáticos con:

- **Caddy** directamente
- o **Nginx + Certbot / ACME**

### Para tráfico interno

Podés usar:

- certificados privados
- CA interna
- certificados montados como secretos

### Nunca hagas esto

- subir certificados y claves privadas al repositorio
- dejar passwords del keystore hardcodeados en el código fuente
- mezclar secretos de producción dentro de `application.properties` versionado

---

## 14. Variables de entorno recomendadas

Si usás configuración externa:

```properties
server.port=8080
server.forward-headers-strategy=framework
```

Y luego los secretos vía variables de entorno o secretos del orquestador.

Ejemplo conceptual:

```bash
SPRING_SSL_BUNDLE_JKS_WEB_KEYSTORE_PASSWORD=supersecreto
```

---

## 15. Reverse proxy con Docker Compose

### Ejemplo conceptual

```text
[ caddy o nginx ] ---> [ app Spring Boot ]
```

### Idea de red

- el proxy publica `80` y `443`
- la app expone solo `8080` dentro de la red de Docker
- la app no necesita publicar `8080` al host si solo la consume el proxy

---

## 16. Ejemplo de Compose con Caddy

```yaml
services:
  app:
    image: miapp:latest
    environment:
      SERVER_FORWARD_HEADERS_STRATEGY: framework
    expose:
      - "8080"

  caddy:
    image: caddy:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - app

volumes:
  caddy_data:
  caddy_config:
```

### Caddyfile

```caddyfile
api.midominio.com {
    reverse_proxy app:8080
}
```

---

## 17. Ejemplo de Compose con Nginx

```yaml
services:
  app:
    image: miapp:latest
    environment:
      SERVER_FORWARD_HEADERS_STRATEGY: framework
    expose:
      - "8080"

  nginx:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./certs:/etc/letsencrypt:ro
    depends_on:
      - app
```

### nginx.conf

```nginx
server {
    listen 80;
    server_name api.midominio.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.midominio.com;

    ssl_certificate     /etc/letsencrypt/live/api.midominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.midominio.com/privkey.pem;

    location / {
        proxy_pass http://app:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port 443;
    }
}
```

---

## 18. Reverse proxy y Actuator

Conviene no exponer indiscriminadamente todos los endpoints de Actuator al público.

### Recomendación

- publicar solo `health` si realmente lo necesitás
- dejar otros endpoints protegidos
- si el proveedor necesita health checks, usar una ruta dedicada o `/actuator/health`

Ejemplo:

```properties
management.endpoints.web.exposure.include=health,info
```

Si necesitás más seguridad, montá reglas específicas en Spring Security o dejá esos endpoints accesibles solo desde red interna.

---

## 19. Spring Security detrás de proxy

Si usás login, OAuth2, redirects o cookies seguras, la detección correcta de `https` es importante.

### Puntos a cuidar

- `server.forward-headers-strategy`
- `X-Forwarded-Proto=https`
- host correcto
- callbacks OAuth construidos con el dominio público
- cookies seguras cuando corresponde

Si esos datos no están bien, pueden aparecer loops de redirección o callbacks inválidos.

---

## 20. EC2 y VPS: puertos que normalmente abrís

### Si usás reverse proxy público

En la máquina pública normalmente abrís:

- `80/tcp`
- `443/tcp`
- `22/tcp` solo para administración y preferentemente restringido por IP

### Lo ideal

- **no** exponer `8080` a Internet si solo lo usa Nginx/Caddy
- dejar `8080` accesible solo por localhost o red privada

---

## 21. Checklist mínimo para producción

### Dominio
- [ ] el DNS apunta a la IP correcta
- [ ] el subdominio elegido ya resuelve

### Reverse proxy
- [ ] HTTP redirige a HTTPS
- [ ] el proxy reenvía `Host`
- [ ] el proxy reenvía `X-Forwarded-Proto`
- [ ] el proxy reenvía la IP del cliente

### Spring Boot
- [ ] `server.forward-headers-strategy` configurado
- [ ] la app escucha en puerto interno correcto
- [ ] no expone puertos innecesarios

### TLS
- [ ] certificado válido
- [ ] renovación prevista
- [ ] claves fuera del repo

### Seguridad
- [ ] `/actuator` no está abierto de más
- [ ] `8080` no está publicado si no hace falta
- [ ] SSH restringido

---

## 22. Estrategias recomendadas según escenario

### Escenario simple en VPS
- dominio + DNS
- Caddy
- Spring Boot en `127.0.0.1:8080`

### Escenario más controlado
- dominio + DNS
- Nginx
- Certbot / ACME
- Spring Boot en localhost o red interna

### Escenario con Docker Compose
- Caddy o Nginx como servicio frontal
- app sin publicar `8080`
- variables de entorno para forward headers

### Escenario endurecido
- proxy público con TLS
- Spring Boot con TLS interno adicional
- red privada entre nodos
- secretos montados como archivos o secretos del orquestador

---

## 23. Qué elegir: Nginx o Caddy

### Caddy
Elegilo si querés:

- empezar rápido
- HTTPS automático
- menos configuración manual
- muy buena experiencia en VPS simples

### Nginx
Elegilo si querés:

- control fino
- configuraciones más tradicionales
- ecosistema muy conocido
- reglas más detalladas de proxy, routing y tuning

---

## 24. Plantilla corta recomendada

Si querés una base sensata para la mayoría de apps Spring Boot:

### application.properties

```properties
server.port=8080
server.forward-headers-strategy=framework
management.endpoints.web.exposure.include=health,info
```

### Caddyfile

```caddyfile
api.midominio.com {
    reverse_proxy 127.0.0.1:8080
}
```

O con Nginx:

```nginx
server {
    listen 80;
    server_name api.midominio.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.midominio.com;

    ssl_certificate     /ruta/fullchain.pem;
    ssl_certificate_key /ruta/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

---

## 25. Errores frecuentes

### 1. La app redirige a http en lugar de https
Suele faltar:

- `X-Forwarded-Proto`
- o `server.forward-headers-strategy`

### 2. El callback OAuth sale con localhost
Suele faltar:

- host correcto en el proxy
- forward headers bien interpretados

### 3. El navegador marca certificado inválido
Puede ser:

- dominio no coincide
- cadena de certificados incompleta
- certificado vencido

### 4. WebSocket no conecta
Suele faltar:

- `Upgrade`
- `Connection: upgrade`
- `proxy_http_version 1.1`

### 5. Exponés 8080 innecesariamente
Si usás proxy frontal, no suele hacer falta abrirlo a Internet.

---

## 26. Recomendación final

Para la mayoría de proyectos personales, educativos y muchos productivos chicos/medianos:

### Mi recomendación práctica

- **dominio/subdominio propio**
- **Caddy o Nginx delante**
- **HTTPS en el proxy**
- **Spring Boot por HTTP interno**
- **`server.forward-headers-strategy=framework`**
- **Actuator limitado**
- **puerto 8080 no expuesto públicamente**

Es simple, mantenible y muy cercano a cómo suelen desplegarse muchas apps reales.

---

## 27. Fuentes oficiales sugeridas

- Spring Boot SSL: https://docs.spring.io/spring-boot/reference/features/ssl.html
- Spring Boot monitoring/Actuator: https://docs.spring.io/spring-boot/reference/actuator/monitoring.html
- Nginx proxy module: https://nginx.org/en/docs/http/ngx_http_proxy_module.html
- Nginx WebSocket proxying: https://nginx.org/en/docs/http/websocket.html
- Caddy automatic HTTPS: https://caddyserver.com/docs/automatic-https
- Caddy reverse proxy quick start: https://caddyserver.com/docs/quick-starts/reverse-proxy
- AWS EC2 security groups: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-security-groups.html

