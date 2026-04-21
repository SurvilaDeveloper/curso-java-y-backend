---
title: "Levantando Keycloak y creando el realm, cliente y usuario base de NovaMarket"
description: "Levantar Keycloak en Docker, crear el realm novamarket, crear el cliente para api-gateway y dejar un usuario base listo para pruebas."
order: 22
module: "Módulo 5 · Seguridad"
level: "base"
draft: false
---

# Objetivo operativo

Levantar Keycloak localmente y dejar creada la base mínima de seguridad para NovaMarket:

- un realm
- un cliente
- un usuario de prueba

---

## Acciones

### 1. Crear una carpeta para infraestructura local

Dentro de la raíz del proyecto, crear esta carpeta:

```txt
novamarket-practico/infrastructure/
```

Dentro de esa carpeta, crear:

```txt
novamarket-practico/infrastructure/keycloak/
```

---

### 2. Crear un `docker-compose.yml` para Keycloak

Crear el archivo:

```txt
novamarket-practico/infrastructure/keycloak/docker-compose.yml
```

Pegar esto:

```yaml
services:
  keycloak:
    image: quay.io/keycloak/keycloak:26.1.0
    container_name: novamarket-keycloak
    ports:
      - "9090:8080"
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
    command: start-dev
```

---

### 3. Levantar Keycloak

Abrir una terminal dentro de:

```txt
novamarket-practico/infrastructure/keycloak
```

Ejecutar:

```bash
docker compose up -d
```

---

### 4. Verificar que Keycloak está corriendo

Abrir en el navegador:

```txt
http://localhost:9090
```

---

### 5. Entrar al panel de administración

Usar estas credenciales:

```txt
usuario: admin
contraseña: admin
```

---

### 6. Crear el realm

Dentro de Keycloak:

1. abrir el selector de realms
2. elegir `Create realm`
3. escribir este nombre:

```txt
novamarket
```

4. confirmar la creación

---

### 7. Crear el cliente para el gateway

Dentro del realm `novamarket`:

1. ir a `Clients`
2. elegir `Create client`
3. completar:

```txt
Client type: OpenID Connect
Client ID: api-gateway
```

4. continuar
5. en la pantalla de capacidades dejar activado:

```txt
Client authentication: Off
Authorization: Off
Standard flow: Off
Direct access grants: On
```

6. guardar

---

### 8. Crear un usuario de prueba

Dentro del realm `novamarket`:

1. ir a `Users`
2. elegir `Create new user`
3. completar:

```txt
Username: gabriel
Email verified: true
```

4. guardar

---

### 9. Asignar contraseña al usuario

Entrar al usuario `gabriel`.

Ir a la pestaña `Credentials`.

Configurar:

```txt
Password: gabriel123
Password confirmation: gabriel123
Temporary: Off
```

Guardar.

---

### 10. Verificar el issuer del realm

Abrir en el navegador:

```txt
http://localhost:9090/realms/novamarket/.well-known/openid-configuration
```

Comprobar que responda JSON.

---

### 11. Probar obtención de token

Ejecutar este `curl` en terminal:

```bash
curl -X POST "http://localhost:9090/realms/novamarket/protocol/openid-connect/token" ^
  -H "Content-Type: application/x-www-form-urlencoded" ^
  -d "client_id=api-gateway" ^
  -d "username=gabriel" ^
  -d "password=gabriel123" ^
  -d "grant_type=password"
```

Si estás en Git Bash o Linux/macOS, usar:

```bash
curl -X POST "http://localhost:9090/realms/novamarket/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=api-gateway" \
  -d "username=gabriel" \
  -d "password=gabriel123" \
  -d "grant_type=password"
```

---

### 12. Verificar que la respuesta trae `access_token`

Comprobar que el JSON incluya algo parecido a:

```json
{
  "access_token": "...",
  "expires_in": 300
}
```

---

## Verificación rápida

Comprobar que:

- Keycloak corre en `http://localhost:9090`
- existe el realm `novamarket`
- existe el cliente `api-gateway`
- existe el usuario `gabriel`
- se puede obtener un `access_token`

---

## Resultado esperado

Tener Keycloak levantado y la base mínima de autenticación lista para conectar con NovaMarket.

---

## Siguiente archivo

Seguir con:

```txt
023-conectando-api-gateway-a-keycloak-como-resource-server.md
```
