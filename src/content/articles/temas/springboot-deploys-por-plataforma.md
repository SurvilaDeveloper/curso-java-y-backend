---
title: "Spring Boot · Deploys por plataforma"
description: "Guía práctica para desplegar aplicaciones Spring Boot en Render, Railway, Fly.io, VPS y AWS EC2.
  Objetivo: que tengas una referencia rápida para elegir plataforma y salir a producción sin rehacer siempre la misma investigación."
order: 10
module: "Spring Boot - 'deploy'"
level: "intro"
draft: false
---
# Spring Boot · Deploys por plataforma

Guía práctica para desplegar aplicaciones Spring Boot en **Render**, **Railway**, **Fly.io**, **VPS** y **AWS EC2**.

> Objetivo: que tengas una referencia rápida para elegir plataforma y salir a producción sin rehacer siempre la misma investigación.

---

## 1) Elección rápida

| Plataforma | Cuándo conviene | Nivel de dificultad | Ideal para |
|---|---|---:|---|
| **Render** | Querés simplicidad, deploy desde repo o Dockerfile y poca operación | Baja | APIs REST, apps CRUD, backends medianos |
| **Railway** | Querés desplegar rápido y manejar variables/servicios desde UI | Baja | prototipos, side projects, microservicios chicos/medianos |
| **Fly.io** | Querés más control operativo, Docker first y despliegue global | Media | apps containerizadas, APIs con algo más de tuning |
| **VPS** | Querés control total a bajo costo mensual fijo | Media/Alta | proyectos propios, apps con stack clásico y reverse proxy |
| **AWS EC2** | Querés máximo control dentro de AWS y posibilidad de crecer a RDS, ALB, CloudWatch, etc. | Alta | producción más seria, arquitectura en AWS |

---

## 2) Requisitos mínimos del proyecto Spring Boot

Antes de desplegar en cualquiera de las plataformas, conviene dejar estas bases:

### `application.properties`

```properties
server.port=${PORT:8080}
management.endpoints.web.exposure.include=health,info
management.endpoint.health.probes.enabled=true
```

### `application.yml`

```yaml
server:
  port: ${PORT:8080}

management:
  endpoints:
    web:
      exposure:
        include: health,info
  endpoint:
    health:
      probes:
        enabled: true
```

### Recomendaciones comunes

- Exponer al menos un endpoint de health check, por ejemplo:
  - `/actuator/health`
  - `/actuator/health/readiness`
- Leer secretos desde variables de entorno.
- No hardcodear credenciales.
- Si usás base de datos, separar configuración por perfil (`dev`, `prod`).
- Si usás Docker, preferir imagen multi-stage.

---

## 3) Render

### Cuándo elegirlo

Elegilo si querés una experiencia parecida a “subo el repo, configuro variables, deploy”.

### Modalidades de deploy

- Desde **GitHub/GitLab/Bitbucket**.
- Desde **Dockerfile**.
- Desde **imagen preconstruida**.

### Puntos clave

- Tu app debe escuchar en `0.0.0.0`.
- Conviene leer el puerto desde `PORT`.
- En servicios web, Render enruta el tráfico al puerto al que escucha tu app.
- Podés configurar **health checks** y **auto-deploy**.

### Configuración base sugerida

```properties
server.port=${PORT:10000}
management.endpoints.web.exposure.include=health,info
```

> Si querés evitar sorpresas, igual podés dejar `server.port=${PORT:8080}`; Render inyecta `PORT` y eso alcanza.

### Flujo típico

1. Crear **Web Service**.
2. Conectar repositorio.
3. Elegir runtime o Dockerfile.
4. Definir:
   - Build Command
   - Start Command
   - Variables de entorno
5. Configurar health check, por ejemplo:
   - `/actuator/health`
6. Deploy.

### Ejemplo sin Docker

**Build Command**

```bash
./mvnw clean package -DskipTests
```

**Start Command**

```bash
java -jar target/app.jar
```

### Cuándo usar Docker en Render

Usá Docker si:

- necesitás paquetes del sistema,
- querés uniformidad entre local y prod,
- o ya venís con imagen lista.

### Ventajas

- Muy rápido de poner en línea.
- Poca fricción operativa.
- Bueno para CRUDs y APIs típicas.

### Desventajas

- Menos control fino que un VPS o EC2.
- Si tu app necesita una topología rara o tuning muy específico, puede quedarse corto.

---

## 4) Railway

### Cuándo elegirlo

Elegilo si querés una experiencia muy directa y amigable para deploy rápido.

### Modalidades de deploy

- Desde **GitHub repo**.
- Desde **Dockerfile**.
- Desde plantillas.

### Puntos clave

- Railway soporta despliegue de apps Spring Boot con guía oficial específica.
- Si hay Dockerfile en el root, Railway puede usarlo para construir la app.
- Las variables se gestionan muy bien desde la UI.
- Los **healthchecks** ayudan a tener despliegues sin downtime visible.
- Railway no ejecuta `docker-compose.yml` directamente: cada servicio del compose se traduce a un servicio propio dentro del proyecto.

### Configuración base sugerida

```properties
server.port=${PORT:8080}
management.endpoints.web.exposure.include=health,info
```

### Flujo típico

1. Crear proyecto nuevo.
2. Elegir **Deploy from GitHub repo**.
3. Conectar repo.
4. Definir variables:
   - `SPRING_PROFILES_ACTIVE=prod`
   - `DATABASE_URL=...`
   - `JWT_SECRET=...`
5. Configurar health check:
   - `/actuator/health`
6. Deploy.

### Si desplegás con Dockerfile

Ejemplo de arranque dentro del contenedor:

```dockerfile
ENTRYPOINT ["java","-jar","/app/app.jar"]
```

Y en Spring Boot:

```properties
server.port=${PORT:8080}
```

### Regiones

Railway permite elegir región de despliegue. Conviene poner la app cerca de la base o de la mayoría de los usuarios.

### Ventajas

- Muy simple para empezar.
- UI cómoda para variables, logs y servicios.
- Ideal para prototipos y deploys rápidos.

### Desventajas

- Menos control operativo que VPS/EC2.
- Si tu stack es muy custom, a veces Docker termina siendo el camino más limpio.

---

## 5) Fly.io

### Cuándo elegirlo

Elegilo si te gusta un enfoque más cercano a infraestructura moderna basada en contenedores, con CLI y más control que Render/Railway.

### Puntos clave

- Fly.io trabaja muy bien con **Dockerfile**.
- `fly launch` te genera una base de configuración (`fly.toml`).
- El `internal_port` del `fly.toml` debe coincidir con el puerto real de tu app.
- Tu app debe escuchar en `0.0.0.0`.
- Los secretos pueden inyectarse como variables de entorno.
- Tiene health checks configurables.

### Configuración Spring Boot sugerida

```properties
server.port=${PORT:8080}
management.endpoints.web.exposure.include=health,info
```

### Dockerfile típico

```dockerfile
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY target/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
```

### `fly.toml` mínimo orientativo

```toml
app = "mi-app-springboot"
primary_region = "eze"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = "stop"
  auto_start_machines = true
  min_machines_running = 0
```

### Flujo típico

1. Instalar `flyctl`.
2. Loguearte.
3. En la raíz del proyecto:

```bash
fly launch
```

4. Revisar `fly.toml`.
5. Deploy:

```bash
fly deploy
```

6. Cargar secretos:

```bash
fly secrets set SPRING_PROFILES_ACTIVE=prod JWT_SECRET=supersecreto
```

### Health checks

Podés configurar checks HTTP o de máquina para que Fly tome mejores decisiones de routing y despliegue.

### Ventajas

- Muy buen equilibrio entre facilidad y control.
- Docker first.
- Bueno si querés crecer a algo más serio sin saltar de inmediato a AWS.

### Desventajas

- Requiere más atención que Render/Railway.
- Si nunca trabajaste con puertos, health checks y CLI, hay curva de aprendizaje.

---

## 6) VPS

### Cuándo elegirlo

Elegilo si querés **control total** con costo fijo y te sentís cómodo administrando Linux.

### Stack clásico recomendado en un VPS

- Ubuntu o Debian
- Java 17/21
- Nginx o Caddy como reverse proxy
- systemd para levantar el jar
- PostgreSQL gestionado aparte o en el mismo server
- Certbot o Caddy para TLS

### Opción A: correr el `.jar` directo

#### Estructura sugerida

```text
/opt/apps/mi-api/app.jar
/etc/systemd/system/mi-api.service
```

#### Unidad systemd

```ini
[Unit]
Description=Mi API Spring Boot
After=network.target

[Service]
User=spring
WorkingDirectory=/opt/apps/mi-api
Environment=SPRING_PROFILES_ACTIVE=prod
Environment=PORT=8080
ExecStart=/usr/bin/java -jar /opt/apps/mi-api/app.jar
SuccessExitStatus=143
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

#### Comandos

```bash
sudo systemctl daemon-reload
sudo systemctl enable mi-api
sudo systemctl start mi-api
sudo systemctl status mi-api
```

### Reverse proxy con Nginx

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
    }
}
```

### Opción B: usar Docker en el VPS

Podés correr la app con:

- `docker run`
- o `docker compose`

Esto te sirve si ya tenés tus imágenes y querés uniformidad con otros entornos.

### Ventajas

- Máximo control.
- Coste generalmente predecible.
- Muy bueno para aprender despliegue real.

### Desventajas

- Vos administrás seguridad, actualizaciones, backups y monitoreo.
- Más trabajo operativo.

---

## 7) AWS EC2

### Cuándo elegirlo

Elegilo si querés correr Spring Boot en AWS con control de instancia, red, discos, seguridad y posibilidad de sumar servicios administrados alrededor.

### Enfoque recomendado

Para una arquitectura razonable:

- **EC2** para la app
- **RDS** para PostgreSQL/MySQL
- **Security Groups** bien definidos
- opcionalmente **ALB** + **ACM** para TLS
- logs y métricas en **CloudWatch** si querés profesionalizarlo más

### Camino simple: EC2 + jar + systemd

#### Pasos generales

1. Lanzar una instancia EC2.
2. Elegir una AMI Linux.
3. Crear o reutilizar un key pair.
4. Configurar security group.
5. Instalar Java.
6. Copiar el jar.
7. Crear servicio systemd.
8. Abrir HTTP/HTTPS si corresponde.
9. Poner Nginx o Caddy delante si querés dominio y TLS más prolijos.

### Security groups mínimos recomendados

- **22** solo desde tu IP para SSH.
- **80** desde internet si terminás TLS afuera o usás HTTP temporalmente.
- **443** desde internet si servís HTTPS.
- **8080** no exponerlo públicamente si usás reverse proxy; dejarlo solo interno.

### Flujo sugerido de producción

#### Opción simple

- EC2
- Nginx
- Spring Boot en 127.0.0.1:8080
- dominio apuntando a la instancia

#### Opción más seria

- Application Load Balancer
- certificado en ACM
- EC2 como target
- app en puerto privado
- base en RDS

### Comandos orientativos en Amazon Linux / Ubuntu

```bash
java -version
mkdir -p /opt/apps/mi-api
```

Copiás el jar y luego repetís el enfoque de `systemd` del VPS.

### Ventajas

- Mucho control.
- Integración natural con servicios AWS.
- Escalable si más adelante querés balanceador, ASG, RDS, S3, Secrets Manager, etc.

### Desventajas

- Más complejidad.
- Si no necesitás AWS, quizá estás metiendo más infraestructura de la necesaria.

---

## 8) Qué conviene para cada caso

### Quiero sacar una API rápido

- **Render**
- **Railway**

### Quiero algo intermedio con Docker y más control

- **Fly.io**

### Quiero aprender despliegue real y manejar Linux

- **VPS**

### Ya estoy en AWS o quiero una arquitectura profesionalizable

- **EC2**

---

## 9) Recomendación práctica mía

Si hoy estuvieras armando varios backends Spring Boot para practicar y también para proyectos reales, te diría:

1. **Render o Railway** para validar rápido una API.
2. **Fly.io** para acostumbrarte a Docker + config + deploy más serio.
3. **VPS** para aprender reverse proxy, systemd, dominios, TLS y operación.
4. **EC2** cuando ya quieras entrar de lleno en AWS.

Ese orden te da curva de aprendizaje progresiva.

---

## 10) Plantillas mínimas reutilizables

### A. Build/start sin Docker

```bash
./mvnw clean package -DskipTests
java -jar target/app.jar
```

### B. Variables comunes

```env
SPRING_PROFILES_ACTIVE=prod
PORT=8080
JWT_SECRET=...
SPRING_DATASOURCE_URL=...
SPRING_DATASOURCE_USERNAME=...
SPRING_DATASOURCE_PASSWORD=...
```

### C. Health endpoint recomendado

```properties
management.endpoints.web.exposure.include=health,info
management.endpoint.health.probes.enabled=true
```

---

## 11) Errores típicos

### La app no arranca en la plataforma

Revisar:

- que lea `PORT`,
- que exponga el puerto correcto,
- que el proceso principal no termine,
- que el jar exista realmente en la ruta esperada.

### El health check falla

Revisar:

- endpoint correcto,
- Actuator incluido,
- exposición del endpoint,
- tiempo de arranque suficiente.

### La base conecta en local pero no en producción

Revisar:

- variables de entorno,
- SSL requerido o no,
- firewall/security groups,
- host correcto,
- credenciales.

### En Fly.io no responde

Revisar:

- `internal_port`,
- que la app escuche en `0.0.0.0`,
- que el Dockerfile arranque el proceso correcto.

### En EC2 funciona pero no abre desde internet

Revisar:

- security group,
- firewall del SO,
- Nginx/Caddy,
- DNS,
- puertos abiertos.

---

## 12) Fuentes oficiales recomendadas

### Render

- https://render.com/docs/web-services
- https://render.com/docs/docker
- https://render.com/docs/deploys
- https://render.com/docs/troubleshooting-deploys

### Railway

- https://docs.railway.com/guides/spring-boot
- https://docs.railway.com/builds/dockerfiles
- https://docs.railway.com/variables
- https://docs.railway.com/deployments/healthchecks
- https://docs.railway.com/deployments/regions
- https://docs.railway.com/guides/docker-compose

### Fly.io

- https://fly.io/docs/
- https://fly.io/docs/reference/fly-launch/
- https://fly.io/docs/reference/configuration/
- https://fly.io/docs/languages-and-frameworks/dockerfile/
- https://fly.io/docs/reference/health-checks/
- https://fly.io/docs/getting-started/troubleshooting/

### AWS EC2

- https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-security-groups.html
- https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/security-group-rules-reference.html
- https://docs.aws.amazon.com/linux/al2023/ug/ec2.html
- https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html

---

## 13) Cierre

Si querés seguir la serie, el próximo archivo que mejor encaja es:

- **dominios + TLS + reverse proxy para Spring Boot**
- o **observabilidad y logs en producción**
- o **checklist de hardening para pasar de dev a prod**

