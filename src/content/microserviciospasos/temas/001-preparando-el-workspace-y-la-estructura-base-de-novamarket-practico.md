---
title: "Preparando el workspace y la estructura base de NovaMarket práctico"
description: "Crear la carpeta raíz del proyecto, la estructura mínima de trabajo y los archivos base para arrancar el curso práctico de NovaMarket."
order: 1
module: "Módulo 1 · Base del proyecto"
level: "base"
draft: false
---

# Objetivo operativo

Dejar creado el workspace base de NovaMarket para trabajar todos los microservicios dentro de una misma carpeta raíz.

---

## Acciones

### 1. Crear la carpeta raíz del proyecto

Crear una carpeta llamada:

```txt
novamarket-practico
```

---

### 2. Abrir la carpeta en el IDE

Abrir `novamarket-practico` en IntelliJ IDEA.

---

### 3. Crear estas subcarpetas dentro de la raíz

Crear manualmente esta estructura:

```txt
novamarket-practico/
├── config-repo/
├── docs/
└── services/
```

---

### 4. Crear un `.gitignore` en la raíz

Crear el archivo:

```txt
novamarket-practico/.gitignore
```

Pegar esto:

```gitignore
# IntelliJ
.idea/
*.iml

# Java / Maven
target/
out/
.build/
.mvn/wrapper/maven-wrapper.jar

# Logs
logs/
*.log

# OS
.DS_Store
Thumbs.db

# Env
.env
.env.*

# Node
node_modules/
```

---

### 5. Crear un `README.md` mínimo en la raíz

Crear el archivo:

```txt
novamarket-practico/README.md
```

Pegar esto:

```md
# NovaMarket práctico

Workspace del curso práctico de NovaMarket.
```

---

### 6. Crear la estructura inicial del repositorio de configuración

Dentro de `config-repo`, crear estos archivos vacíos:

```txt
config-repo/
├── application.yml
├── discovery-server.yml
└── api-gateway.yml
```

---

### 7. Completar `config-repo/application.yml`

Abrir:

```txt
config-repo/application.yml
```

Pegar esto:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info
```

---

### 8. Completar `config-repo/discovery-server.yml`

Abrir:

```txt
config-repo/discovery-server.yml
```

Pegar esto:

```yaml
server:
  port: 8761

spring:
  application:
    name: discovery-server

eureka:
  client:
    register-with-eureka: false
    fetch-registry: false
```

---

### 9. Completar `config-repo/api-gateway.yml`

Abrir:

```txt
config-repo/api-gateway.yml
```

Pegar esto:

```yaml
server:
  port: 8080

spring:
  application:
    name: api-gateway

management:
  endpoints:
    web:
      exposure:
        include: health,info
```

---

### 10. Verificar que la estructura quedó así

```txt
novamarket-practico/
├── .gitignore
├── README.md
├── config-repo/
│   ├── application.yml
│   ├── discovery-server.yml
│   └── api-gateway.yml
├── docs/
└── services/
```

---

## Verificación rápida

Comprobar manualmente en el IDE que:

- existe `novamarket-practico`
- existe `services`
- existe `config-repo`
- existen los tres `.yml`
- existe `.gitignore`

---

## Resultado esperado

Tener listo el workspace base para empezar a crear los microservicios.

---

## Siguiente archivo

Seguir con:

```txt
002-creando-config-server-y-conectandolo-al-config-repo-local.md
```
