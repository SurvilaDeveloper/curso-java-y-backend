---
title: "Despliegue práctico de una API Spring Boot en Kubernetes"
description: "En este artículo vas a desplegar una API Spring Boot dentro de Kubernetes de punta a punta.
  El recorrido incluye:
- una API mínima en Spring Boot
- la imagen Docker de la aplicación
- los manifiestos de Kubernetes
- `Deployment`, `Service`, `ConfigMap` y `Secret`
- probes de salud para que Kubernetes sepa si la app está viva y lista
- comandos para desplegar, probar, escalar, actualizar y hacer rollback
  La idea es que puedas usar este artículo como plantilla base para otros proyectos backend."
order: 24
module: "'Despliegue'"
level: "intro"
draft: false
---
# Despliegue práctico de una API Spring Boot en Kubernetes

## Qué vas a lograr

En este artículo vas a desplegar una API Spring Boot dentro de Kubernetes de punta a punta.

El recorrido incluye:

- una API mínima en Spring Boot
- la imagen Docker de la aplicación
- los manifiestos de Kubernetes
- `Deployment`, `Service`, `ConfigMap` y `Secret`
- probes de salud para que Kubernetes sepa si la app está viva y lista
- comandos para desplegar, probar, escalar, actualizar y hacer rollback

La idea es que puedas usar este artículo como plantilla base para otros proyectos backend.

---

## 1. Qué es lo que estamos construyendo

Vamos a desplegar una aplicación con esta idea mental:

- **Spring Boot** ejecuta la API
- **Docker** empaqueta la aplicación en una imagen
- **Kubernetes** crea y administra los contenedores
- **Deployment** define cuántas réplicas deben correr
- **Service** expone la aplicación dentro del cluster
- **ConfigMap** guarda configuración no sensible
- **Secret** guarda valores sensibles

---

## 2. Requisitos

Antes de empezar, necesitás tener instalado:

- Java
- Maven
- Docker
- `kubectl`
- un cluster local, por ejemplo **minikube**

Para comprobarlo:

```bash
java -version
mvn -version
docker --version
kubectl version --client
minikube version
```

---

## 3. Crear la API Spring Boot

Podés crear el proyecto con Spring Initializr usando estas dependencias:

- Spring Web
- Spring Boot Actuator

### Estructura mínima

```text
src/
  main/
    java/
      com/ejemplo/demo/
        DemoApplication.java
        HelloController.java
    resources/
      application.properties
pom.xml
Dockerfile
k8s/
  namespace.yaml
  configmap.yaml
  secret.yaml
  deployment.yaml
  service.yaml
```

---

## 4. `pom.xml`

Usá un `pom.xml` mínimo como este:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.5.13</version>
        <relativePath/>
    </parent>

    <groupId>com.ejemplo</groupId>
    <artifactId>demo</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>demo</name>
    <description>Demo API para Kubernetes</description>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>

</project>
```

> Si preferís, también podés generar la imagen de contenedor con Buildpacks en lugar de usar Dockerfile. En este artículo vamos por Dockerfile porque es más fácil de visualizar al principio.

---

## 5. Clase principal

### `src/main/java/com/ejemplo/demo/DemoApplication.java`

```java
package com.ejemplo.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

---

## 6. Controlador de prueba

### `src/main/java/com/ejemplo/demo/HelloController.java`

```java
package com.ejemplo.demo;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HelloController {

    @Value("${app.message:Hola desde Spring Boot}")
    private String message;

    @GetMapping("/hello")
    public Map<String, Object> hello() {
        return Map.of(
            "message", message,
            "status", "ok"
        );
    }
}
```

---

## 7. Configuración de Spring Boot

### `src/main/resources/application.properties`

```properties
spring.application.name=demo-api
server.port=8080

management.endpoints.web.exposure.include=health,info
management.endpoint.health.probes.add-additional-paths=true
```

Con esto vas a tener:

- endpoint de negocio: `/api/hello`
- endpoint de liveness: `/livez`
- endpoint de readiness: `/readyz`

Eso nos viene perfecto para Kubernetes.

---

## 8. Probar localmente antes de Docker

Compilá y ejecutá la aplicación:

```bash
mvn clean package
mvn spring-boot:run
```

Probá:

```bash
curl http://localhost:8080/api/hello
curl http://localhost:8080/livez
curl http://localhost:8080/readyz
```

Si todo está bien, recién ahí pasás al contenedor.

---

## 9. Crear la imagen Docker

### `Dockerfile`

```dockerfile
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY target/demo-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

Construí la imagen:

```bash
mvn clean package
docker build -t demo-api:1.0.0 .
```

Probala en Docker:

```bash
docker run --rm -p 8080:8080 demo-api:1.0.0
```

Y de nuevo:

```bash
curl http://localhost:8080/api/hello
curl http://localhost:8080/livez
curl http://localhost:8080/readyz
```

---

## 10. Levantar Kubernetes localmente

Si estás usando minikube:

```bash
minikube start
kubectl get nodes
```

Para que minikube pueda usar tu imagen local, cargala en el cluster:

```bash
minikube image load demo-api:1.0.0
```

---

## 11. Crear los manifiestos de Kubernetes

Creamos una carpeta `k8s/` con estos archivos.

---

## 12. Namespace

### `k8s/namespace.yaml`

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: demo
```

---

## 13. ConfigMap

### `k8s/configmap.yaml`

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: demo-api-config
  namespace: demo
data:
  APP_MESSAGE: "Hola desde Kubernetes"
```

---

## 14. Secret

### `k8s/secret.yaml`

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: demo-api-secret
  namespace: demo
type: Opaque
stringData:
  DUMMY_TOKEN: "secreto-ejemplo"
```

---

## 15. Deployment

### `k8s/deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-api
  namespace: demo
spec:
  replicas: 2
  selector:
    matchLabels:
      app: demo-api
  template:
    metadata:
      labels:
        app: demo-api
    spec:
      containers:
        - name: demo-api
          image: demo-api:1.0.0
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8080
          env:
            - name: app.message
              valueFrom:
                configMapKeyRef:
                  name: demo-api-config
                  key: APP_MESSAGE
            - name: DUMMY_TOKEN
              valueFrom:
                secretKeyRef:
                  name: demo-api-secret
                  key: DUMMY_TOKEN
          livenessProbe:
            httpGet:
              path: /livez
              port: 8080
            initialDelaySeconds: 15
            periodSeconds: 10
            timeoutSeconds: 2
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /readyz
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 5
            timeoutSeconds: 2
            failureThreshold: 3
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
```

### Detalles importantes

- `replicas: 2` crea dos instancias
- `matchLabels` conecta el Deployment con los Pods
- `imagePullPolicy: IfNotPresent` evita descargar si la imagen ya está disponible en el cluster local
- `livenessProbe` verifica si la app sigue viva
- `readinessProbe` verifica si la app está lista para recibir tráfico
- `resources` define pedidos y límites básicos

---

## 16. Service

### `k8s/service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: demo-api
  namespace: demo
spec:
  selector:
    app: demo-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
  type: ClusterIP
```

Con `ClusterIP`, el servicio queda disponible dentro del cluster. Para laboratorio local, después lo vamos a consumir con `port-forward`.

---

## 17. Desplegar todo

Aplicá los manifiestos:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

O si querés aplicar todo junto:

```bash
kubectl apply -f k8s/
```

---

## 18. Verificar el estado

```bash
kubectl get all -n demo
kubectl get pods -n demo
kubectl get svc -n demo
```

Ver detalle de un pod:

```bash
kubectl describe pod -n demo NOMBRE_DEL_POD
```

Ver logs:

```bash
kubectl logs -n demo deployment/demo-api
```

---

## 19. Probar la aplicación

Como el `Service` es `ClusterIP`, hacé un túnel local:

```bash
kubectl port-forward svc/demo-api 8080:80 -n demo
```

Ahora probá desde tu máquina:

```bash
curl http://localhost:8080/api/hello
curl http://localhost:8080/livez
curl http://localhost:8080/readyz
```

La respuesta de `/api/hello` debería usar el valor del `ConfigMap`.

---

## 20. Escalar la aplicación

Podés aumentar la cantidad de réplicas:

```bash
kubectl scale deployment demo-api --replicas=3 -n demo
kubectl get pods -n demo
```

Ahora Kubernetes intentará mantener tres Pods corriendo.

---

## 21. Actualizar la imagen

Supongamos que hacés un cambio en el código.

1. reconstruís la imagen
2. la volvés a cargar en minikube
3. actualizás el Deployment

```bash
mvn clean package
docker build -t demo-api:1.0.1 .
minikube image load demo-api:1.0.1
kubectl set image deployment/demo-api demo-api=demo-api:1.0.1 -n demo
```

Verificá el rollout:

```bash
kubectl rollout status deployment/demo-api -n demo
```

---

## 22. Hacer rollback

Si algo sale mal:

```bash
kubectl rollout undo deployment/demo-api -n demo
```

Ver historial:

```bash
kubectl rollout history deployment/demo-api -n demo
```

---

## 23. Qué hace cada recurso en palabras simples

### Pod

Es la unidad más pequeña que corre tu contenedor.

### Deployment

Le dice a Kubernetes cuántos Pods querés y cómo reemplazarlos si algo falla o si actualizás la imagen.

### Service

Le da una identidad estable a los Pods para que otras aplicaciones o usuarios puedan conectarse sin depender del nombre cambiante de cada Pod.

### ConfigMap

Guarda configuración no sensible.

### Secret

Guarda datos sensibles.

### Probe

Son chequeos automáticos.

- **liveness**: la app sigue viva
- **readiness**: la app ya puede recibir tráfico

---

## 24. Errores comunes

### La imagen no se encuentra

Si usás minikube local y la imagen no está en un registry público, cargala con:

```bash
minikube image load demo-api:1.0.0
```

### El Pod entra en crash loop

Mirar logs:

```bash
kubectl logs -n demo deployment/demo-api
```

Y describir el pod:

```bash
kubectl describe pod -n demo NOMBRE_DEL_POD
```

### La probe falla

Probá manualmente los endpoints:

```bash
curl http://localhost:8080/livez
curl http://localhost:8080/readyz
```

### La variable de entorno no llega

Revisá el `Deployment`, el `ConfigMap` y el `Secret`.

---

## 25. Flujo mental correcto

Pensalo así:

1. desarrollás la API en Spring Boot
2. la empaquetás en una imagen Docker
3. Kubernetes crea Pods con esa imagen
4. el Deployment mantiene la cantidad deseada de Pods
5. el Service reparte tráfico entre esos Pods
6. las probes le dicen a Kubernetes si la app debe seguir recibiendo tráfico o reiniciarse

---

## 26. Versión lista para producción: qué faltaría

Este laboratorio es una base muy buena, pero para producción normalmente agregarías:

- imagen publicada en Docker Hub o GHCR
- `Ingress`
- dominio y TLS
- variables por ambiente
- base de datos externa
- observabilidad
- HPA
- afinado de recursos
- estrategia de despliegue más cuidada
- namespaces por entorno

---

## 27. Resumen final

Con este paso a paso ya tenés un despliegue real y entendible de una API Spring Boot en Kubernetes.

Aprendiste a usar:

- Spring Boot para crear la API
- Docker para empaquetarla
- Kubernetes para correrla
- Deployment para administrar Pods
- Service para exponerla
- ConfigMap y Secret para configuración
- probes para salud de la aplicación

Ese es el núcleo del despliegue moderno de una API backend en Kubernetes.

---

## 28. Comandos de referencia rápida

```bash
minikube start
kubectl apply -f k8s/
kubectl get all -n demo
kubectl logs -n demo deployment/demo-api
kubectl port-forward svc/demo-api 8080:80 -n demo
kubectl scale deployment demo-api --replicas=3 -n demo
kubectl rollout status deployment/demo-api -n demo
kubectl rollout undo deployment/demo-api -n demo
```

---

## 29. Siguiente paso recomendado

El siguiente salto natural es hacer este mismo ejemplo pero con:

- PostgreSQL
- `Secret` real para credenciales
- `ConfigMap` para configuración de entorno
- `Ingress`
- perfil `dev` y `prod`
- health checks más realistas

Ahí ya pasás de ejemplo simple a una plantilla casi profesional.
