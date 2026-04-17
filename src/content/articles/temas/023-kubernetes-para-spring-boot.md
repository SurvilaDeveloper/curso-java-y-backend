---
title: "Kubernetes para backend Java y Spring Boot"
description: "Qué aporta Kubernetes a una aplicación Spring Boot, cómo empezar localmente y cómo desplegar una API paso a paso."
order: 23
module: "'Despliegue'"
level: "intro"
draft: false
---
# Kubernetes para backend Java y Spring Boot

## Introducción

Si ya entendés más o menos qué es una aplicación backend en Java o Spring Boot, el paso siguiente suele ser este:

> "Ya tengo mi aplicación funcionando. ¿Cómo la ejecuto de forma más ordenada, escalable y repetible en distintos entornos?"

Ahí es donde aparece **Kubernetes**.

Kubernetes no reemplaza a Spring Boot. Tampoco reemplaza a Docker.

Lo que hace Kubernetes es **orquestar contenedores**. En otras palabras: toma tus aplicaciones empaquetadas como imágenes y se encarga de ejecutarlas, reiniciarlas si fallan, exponerlas en red, escalarlas y administrar su configuración.

Para una aplicación Java o Spring Boot, Kubernetes sirve sobre todo para resolver preguntas como estas:

- ¿Cómo corro varias réplicas de mi API?
- ¿Cómo evito depender del proceso manual de "levantar un jar"?
- ¿Cómo expongo mi backend dentro o fuera del cluster?
- ¿Cómo separo configuración, secretos y código?
- ¿Cómo hago rolling updates sin tirar abajo todo?
- ¿Cómo sabe la plataforma si mi app está viva o lista para recibir tráfico?

Este artículo está pensado para alguien que ya conoce algo de Java o Spring Boot, pero todavía no usó Kubernetes en serio.

---

## 1. Qué hace Kubernetes en una app Spring Boot

Una aplicación Spring Boot normalmente arranca así:

1. compilás el proyecto,
2. generás un `.jar`,
3. lo ejecutás con `java -jar`.

Eso alcanza para desarrollo o para un servidor simple. Pero cuando la aplicación crece, empiezan a aparecer necesidades nuevas:

- correr varias instancias,
- actualizar sin downtime o con menos interrupción,
- balancear tráfico,
- separar configuración por ambiente,
- monitorear el estado de cada instancia,
- reiniciar automáticamente procesos caídos.

Kubernetes aporta justamente esa capa de operación.

### La idea mental correcta

Pensalo así:

- **Spring Boot** = la aplicación
- **Docker** = el paquete ejecutable de esa aplicación
- **Kubernetes** = el sistema que administra ese paquete cuando corre en uno o varios nodos

---

## 2. Qué necesitás antes de usar Kubernetes con Spring Boot

Antes de meterte con Kubernetes, conviene tener esto:

- Java instalado
- un proyecto Spring Boot que arranque correctamente
- Maven o Gradle
- Docker instalado
- `kubectl` instalado
- un cluster local para practicar, por ejemplo **minikube**

Para aprender, lo más práctico es trabajar localmente con **minikube**. Después, cuando entiendas el flujo, eso mismo se puede llevar a un cluster real.

---

## 3. No hace falta Spring Cloud Kubernetes para empezar

Este punto es importante.

Mucha gente cree que para correr Spring Boot en Kubernetes hace falta agregar librerías especiales desde el primer día. **No es así**.

Podés desplegar una app Spring Boot en Kubernetes usando solo:

- tu aplicación Spring Boot,
- una imagen de contenedor,
- un `Deployment`,
- un `Service`,
- y, si hace falta, `ConfigMap` y `Secret`.

Más adelante, si necesitás integración más profunda con el ecosistema de Kubernetes, recién ahí evaluás **Spring Cloud Kubernetes**.

---

## 4. El flujo real de trabajo

El flujo básico suele ser este:

1. crear o tener una app Spring Boot,
2. convertirla en imagen de contenedor,
3. levantar un cluster local,
4. cargar la imagen en el cluster,
5. crear un `Deployment`,
6. crear un `Service`,
7. probar la app,
8. agregar configuración externa,
9. agregar probes,
10. escalar o actualizar.

Eso es lo que vamos a recorrer.

---

## 5. Ejemplo de aplicación mínima

Supongamos una API simple con este controlador:

```java
package com.ejemplo.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "Hola desde Spring Boot en Kubernetes";
    }
}
```

Y una clase principal:

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

Con eso ya alcanza para practicar el despliegue.

---

## 6. Crear la imagen del contenedor

Spring Boot permite generar imágenes de contenedor de dos formas muy comunes:

- con un `Dockerfile`,
- o con **Cloud Native Buildpacks**.

Para empezar, Buildpacks suele ser la opción más cómoda.

### Opción A: Buildpacks con Maven

```bash
./mvnw spring-boot:build-image -Dspring-boot.build-image.imageName=demo-spring-boot-k8s:0.0.1
```

### Opción B: Buildpacks con Gradle

```bash
./gradlew bootBuildImage --imageName=demo-spring-boot-k8s:0.0.1
```

Esto genera una imagen Docker lista para ejecutar.

### Opción C: Dockerfile simple

También podés usar un `Dockerfile` sencillo:

```dockerfile
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY target/demo-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Y construirla así:

```bash
docker build -t demo-spring-boot-k8s:0.0.1 .
```

Para aprender, cualquiera de las dos rutas sirve.

---

## 7. Levantar Kubernetes localmente con minikube

Una forma muy práctica de practicar es usar minikube.

Arranque básico:

```bash
minikube start
```

Verificá que el cluster esté accesible:

```bash
kubectl get nodes
```

Si todo está bien, vas a ver al menos un nodo en estado `Ready`.

---

## 8. Cargar la imagen dentro de minikube

Si tu imagen existe solo en tu máquina local, el cluster necesita verla.

Una forma directa es esta:

```bash
minikube image load demo-spring-boot-k8s:0.0.1
```

Con eso, minikube carga la imagen en su runtime interno y Kubernetes ya puede usarla sin necesidad de publicarla primero en un registry remoto.

---

## 9. Crear el Deployment

El `Deployment` es el recurso que define cómo querés que corra tu aplicación.

Creá un archivo `deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-spring-boot
spec:
  replicas: 2
  selector:
    matchLabels:
      app: demo-spring-boot
  template:
    metadata:
      labels:
        app: demo-spring-boot
    spec:
      containers:
        - name: app
          image: demo-spring-boot-k8s:0.0.1
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8080
```

Aplicalo:

```bash
kubectl apply -f deployment.yaml
```

Verificá el resultado:

```bash
kubectl get deployments
kubectl get pods
```

### Qué significa este archivo

- `replicas: 2` dice que querés dos instancias.
- `selector` y `labels` conectan el Deployment con los Pods.
- `containers` describe el contenedor a ejecutar.
- `containerPort: 8080` documenta el puerto que usa la app dentro del contenedor.

---

## 10. Crear el Service

Los Pods son efímeros. Sus IP pueden cambiar. Por eso no se suele acceder a ellos directamente.

Kubernetes resuelve eso con un **Service**.

Creá `service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: demo-spring-boot-service
spec:
  selector:
    app: demo-spring-boot
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
  type: NodePort
```

Aplicalo:

```bash
kubectl apply -f service.yaml
```

Verificá:

```bash
kubectl get services
```

### Qué hace este Service

- selecciona los Pods con `app: demo-spring-boot`,
- expone un puerto estable,
- redirige el tráfico al puerto `8080` del contenedor,
- usando `NodePort`, te deja probarlo fácilmente en local.

---

## 11. Acceder a la aplicación

Con minikube, una forma muy cómoda es esta:

```bash
minikube service demo-spring-boot-service --url
```

Eso te devuelve una URL. Después probás:

```bash
curl http://LA_URL/hello
```

Y deberías recibir:

```text
Hola desde Spring Boot en Kubernetes
```

---

## 12. Cómo ver qué está pasando

Estos comandos te van a acompañar siempre:

```bash
kubectl get pods
kubectl get deployments
kubectl get services
kubectl describe pod NOMBRE_DEL_POD
kubectl logs NOMBRE_DEL_POD
```

Con eso podés:

- ver si los Pods arrancaron,
- detectar errores de imagen,
- revisar eventos,
- inspeccionar logs.

---

## 13. Configuración externa con ConfigMap

Una buena práctica es no hardcodear configuración de ambiente dentro de la imagen.

Para eso existe `ConfigMap`.

Ejemplo:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: demo-config
data:
  APP_MESSAGE: "Hola desde ConfigMap"
```

Y en tu `Deployment`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-spring-boot
spec:
  replicas: 2
  selector:
    matchLabels:
      app: demo-spring-boot
  template:
    metadata:
      labels:
        app: demo-spring-boot
    spec:
      containers:
        - name: app
          image: demo-spring-boot-k8s:0.0.1
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8080
          env:
            - name: APP_MESSAGE
              valueFrom:
                configMapKeyRef:
                  name: demo-config
                  key: APP_MESSAGE
```

En Spring Boot podés leer esa variable con:

```java
@Value("${APP_MESSAGE:Mensaje por defecto}")
private String appMessage;
```

Y devolverla en un endpoint, o usarla donde corresponda.

### Idea importante

`ConfigMap` sirve para datos **no sensibles**.

---

## 14. Datos sensibles con Secret

Para contraseñas, tokens o claves, usás `Secret`.

Ejemplo:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: demo-secret
type: Opaque
stringData:
  DB_PASSWORD: supersecreta
```

Y en el `Deployment`:

```yaml
env:
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: demo-secret
        key: DB_PASSWORD
```

Después Spring Boot lo puede leer como una variable de entorno más.

### Ojo con esto

Un `Secret` no significa automáticamente "seguridad total". Es la forma correcta de modelar datos sensibles en Kubernetes, pero igual hay que cuidar permisos, acceso al cluster y buenas prácticas operativas.

---

## 15. Probes: liveness, readiness y startup

Este es uno de los puntos más valiosos cuando corrés Spring Boot en Kubernetes.

Kubernetes puede consultar endpoints HTTP para saber:

- si la app **está viva**,
- si la app **está lista para recibir tráfico**,
- o si todavía **está arrancando**.

Para una aplicación Spring Boot, esto combina muy bien con **Actuator**.

### Dependencia útil

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

### Configuración útil en `application.yml`

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health
  endpoint:
    health:
      probes:
        add-additional-paths: true
```

Con eso, Spring Boot puede exponer rutas útiles como:

- `/livez`
- `/readyz`

### Probes en el Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-spring-boot
spec:
  replicas: 2
  selector:
    matchLabels:
      app: demo-spring-boot
  template:
    metadata:
      labels:
        app: demo-spring-boot
    spec:
      containers:
        - name: app
          image: demo-spring-boot-k8s:0.0.1
          ports:
            - containerPort: 8080
          startupProbe:
            httpGet:
              path: /livez
              port: 8080
            failureThreshold: 30
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /livez
              port: 8080
            initialDelaySeconds: 20
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /readyz
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 5
```

### Cómo pensarlas

- **startupProbe**: protege a aplicaciones lentas al arrancar.
- **livenessProbe**: decide si hay que reiniciar el contenedor.
- **readinessProbe**: decide si ese Pod puede recibir tráfico.

En una API Spring Boot esto es importantísimo, porque una app puede estar viva pero todavía no lista para atender requests reales.

---

## 16. Escalar la aplicación

Si querés más réplicas:

```bash
kubectl scale deployment demo-spring-boot --replicas=4
```

Después:

```bash
kubectl get pods
```

Vas a ver más instancias.

En local esto sirve para aprender. En producción se usa muchísimo para absorber carga o mejorar disponibilidad.

---

## 17. Actualizar la imagen

Supongamos que cambiaste código.

El flujo sería:

1. recompilar,
2. reconstruir imagen,
3. volver a cargarla en minikube,
4. actualizar el `Deployment`.

Ejemplo:

```bash
./mvnw spring-boot:build-image -Dspring-boot.build-image.imageName=demo-spring-boot-k8s:0.0.2
minikube image load demo-spring-boot-k8s:0.0.2
```

Y actualizás la imagen del Deployment:

```bash
kubectl set image deployment/demo-spring-boot app=demo-spring-boot-k8s:0.0.2
```

Verificás rollout:

```bash
kubectl rollout status deployment/demo-spring-boot
```

Y si algo sale mal:

```bash
kubectl rollout undo deployment/demo-spring-boot
```

---

## 18. Qué suele mapearse desde Spring Boot a Kubernetes

Una manera útil de verlo es así:

| Spring Boot / app | Kubernetes |
|---|---|
| aplicación `.jar` | imagen de contenedor |
| proceso Java | contenedor dentro de un Pod |
| varias instancias | réplicas del Deployment |
| config por ambiente | ConfigMap |
| passwords / tokens | Secret |
| endpoint HTTP | Service / Ingress |
| health checks | liveness / readiness / startup probes |

---

## 19. Qué no hace Kubernetes por vos

Kubernetes no arregla por sí solo:

- bugs de código,
- mala configuración de memoria para la JVM,
- queries lentas,
- problemas de diseño,
- seguridad de aplicación,
- observabilidad completa.

Kubernetes ayuda a operar aplicaciones. No reemplaza las buenas prácticas de backend.

---

## 20. Errores comunes al empezar

### 1. Creer que Kubernetes reemplaza Docker

No. Normalmente trabajás con ambos. Primero tenés una imagen; después Kubernetes la orquesta.

### 2. Querer usar demasiadas herramientas juntas

Al principio alcanza con:

- Spring Boot
- Docker
- minikube
- kubectl
- Deployment
- Service
- ConfigMap
- Secret
- Actuator

### 3. No exponer bien los probes

Si configurás mal `liveness` y `readiness`, Kubernetes puede reiniciar tu app o marcarla como no disponible aunque el problema sea de configuración.

### 4. Meter secretos dentro de la imagen

No conviene. Los secretos deberían vivir fuera de la imagen.

### 5. No revisar logs ni `describe`

Muchos errores iniciales se resuelven con:

```bash
kubectl logs NOMBRE_DEL_POD
kubectl describe pod NOMBRE_DEL_POD
```

---

## 21. Cuándo usar Spring Cloud Kubernetes

No es obligatorio para arrancar.

Puede volverse interesante si querés, por ejemplo:

- cargar ConfigMaps o Secrets como fuentes de propiedades de Spring,
- discovery más integrado con Kubernetes,
- reacciones automáticas a cambios de configuración,
- integración más profunda con el ecosistema cloud native.

Pero para el primer despliegue real, muchas veces es mejor entender antes la base pura de Kubernetes.

---

## 22. Roadmap sugerido para aprender esto bien

Un orden razonable sería:

1. crear una app Spring Boot mínima,
2. contenerizarla,
3. levantarla en Docker,
4. aprender `kubectl get`, `describe`, `logs`,
5. crear `Deployment` y `Service`,
6. usar minikube,
7. agregar `ConfigMap` y `Secret`,
8. agregar Actuator y probes,
9. practicar escalado,
10. practicar actualización de imagen,
11. después recién ver Ingress, autoscaling, observabilidad y Helm.

---

## 23. Resumen final

Kubernetes para Spring Boot sirve para ejecutar tu backend de una forma más robusta, declarativa y escalable.

La idea central es esta:

1. tu aplicación Spring Boot sigue siendo tu aplicación,
2. la empaquetás como contenedor,
3. Kubernetes la ejecuta en Pods,
4. un Deployment mantiene el estado deseado,
5. un Service la expone,
6. ConfigMap y Secret separan configuración y datos sensibles,
7. las probes ayudan a que la plataforma sepa cuándo la app está bien.

Para empezar no necesitás una arquitectura compleja. Con una API simple, Docker, minikube, `kubectl`, un `Deployment`, un `Service` y Actuator, ya podés aprender muchísimo.

---

## 24. Referencias oficiales

- Kubernetes Documentation: https://kubernetes.io/docs/home/
- Kubernetes Architecture: https://kubernetes.io/docs/concepts/architecture/
- Deployments: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
- Services: https://kubernetes.io/docs/concepts/services-networking/service/
- ConfigMaps: https://kubernetes.io/docs/concepts/configuration/configmap/
- Secrets: https://kubernetes.io/docs/concepts/configuration/secret/
- Probes: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
- Hello Minikube: https://kubernetes.io/docs/tutorials/hello-minikube/
- minikube image load: https://minikube.sigs.k8s.io/docs/commands/image/
- Spring Boot Container Images: https://docs.spring.io/spring-boot/reference/packaging/container-images/index.html
- Spring Boot Cloud Native Buildpacks: https://docs.spring.io/spring-boot/reference/packaging/container-images/cloud-native-buildpacks.html
- Spring Boot Actuator Endpoints: https://docs.spring.io/spring-boot/reference/actuator/endpoints.html
- Spring Cloud Kubernetes: https://docs.spring.io/spring-cloud-kubernetes/docs/current/reference/html/
