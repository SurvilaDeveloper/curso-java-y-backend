---
title: "Archivos"
description: "Cómo leer, escribir y trabajar con archivos en Java usando la API moderna de java.nio.file."
order: 24
module: "Herramientas clave del lenguaje"
level: "intermedio"
draft: false
---

## Introducción

Hasta ahora trabajaste con datos que viven mientras el programa se está ejecutando:

- variables
- arrays
- colecciones
- objetos
- fechas

Pero muchas veces necesitás guardar información para que no se pierda cuando el programa termina.

Por ejemplo:

- guardar usuarios en un archivo
- leer una configuración
- escribir logs
- exportar resultados
- procesar archivos de texto

Para eso, Java permite trabajar con archivos del sistema.

## La idea general

La memoria del programa es temporal.

Si querés persistir información fuera de la ejecución actual, necesitás escribirla en algún medio externo, como:

- archivos
- base de datos
- servicios externos

En esta etapa nos vamos a enfocar en archivos, especialmente archivos de texto.

## API recomendada

En Java moderno, una forma muy recomendable de trabajar con archivos es usando la API de `java.nio.file`.

Las clases más importantes al empezar son:

- `Path`
- `Paths`
- `Files`

Import típico:

```java
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
```

## Qué es `Path`

`Path` representa una ruta del sistema de archivos.

Ejemplo:

```java
Path path = Paths.get("data.txt");
```

Eso representa un archivo llamado `data.txt` en la ubicación relativa actual.

## Qué es `Files`

`Files` es una clase utilitaria con muchos métodos estáticos para trabajar con archivos y directorios.

Por ejemplo:

- leer
- escribir
- copiar
- mover
- borrar
- verificar existencia

## Crear una ruta

```java
Path path = Paths.get("notes.txt");
System.out.println(path);
```

También podés representar rutas más largas:

```java
Path path = Paths.get("data", "users", "list.txt");
```

Esto ayuda a construir rutas de forma más clara y portable.

## Verificar si un archivo existe

```java
Path path = Paths.get("notes.txt");

if (Files.exists(path)) {
    System.out.println("El archivo existe");
} else {
    System.out.println("El archivo no existe");
}
```

## Escribir texto en un archivo

Una forma simple de escribir texto es `Files.writeString(...)`.

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class Main {
    public static void main(String[] args) throws IOException {
        Path path = Paths.get("notes.txt");
        Files.writeString(path, "Hola desde Java");
    }
}
```

Esto crea el archivo si no existe y escribe el contenido.

## Leer texto desde un archivo

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class Main {
    public static void main(String[] args) throws IOException {
        Path path = Paths.get("notes.txt");
        String content = Files.readString(path);

        System.out.println(content);
    }
}
```

## Qué está pasando acá

### `Files.writeString(...)`

Escribe un texto completo en un archivo.

### `Files.readString(...)`

Lee todo el contenido del archivo como un solo `String`.

## Cuidado con excepciones

Leer y escribir archivos puede fallar por motivos como:

- el archivo no existe
- no hay permisos
- la ruta es inválida
- el disco tiene problemas

Por eso estas operaciones suelen involucrar manejo de excepciones, normalmente `IOException`.

## Ejemplo con `try/catch`

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class Main {
    public static void main(String[] args) {
        Path path = Paths.get("notes.txt");

        try {
            Files.writeString(path, "Hola desde Java");
            String content = Files.readString(path);
            System.out.println(content);
        } catch (IOException e) {
            System.out.println("Error al trabajar con el archivo: " + e.getMessage());
        }
    }
}
```

## Escribir varias líneas

También podés escribir una lista de líneas.

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

public class Main {
    public static void main(String[] args) throws IOException {
        Path path = Paths.get("users.txt");

        List<String> lines = List.of(
            "Ana",
            "Luis",
            "Sofía"
        );

        Files.write(path, lines);
    }
}
```

## Leer líneas

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

public class Main {
    public static void main(String[] args) throws IOException {
        Path path = Paths.get("users.txt");
        List<String> lines = Files.readAllLines(path);

        for (String line : lines) {
            System.out.println(line);
        }
    }
}
```

## Qué conviene usar según el caso

### `readString` / `writeString`

Muy cómodo para contenido textual simple.

### `readAllLines` / `write`

Muy útil cuando querés trabajar línea por línea.

## Agregar contenido al final

Si querés agregar texto sin reemplazar todo el archivo, podés usar opciones de apertura.

Ejemplo:

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

public class Main {
    public static void main(String[] args) throws IOException {
        Path path = Paths.get("log.txt");

        Files.writeString(
            path,
            "Nuevo evento
",
            StandardOpenOption.CREATE,
            StandardOpenOption.APPEND
        );
    }
}
```

## Qué hace esto

- `CREATE` crea el archivo si no existe
- `APPEND` agrega el contenido al final

## Crear directorios

También podés crear carpetas.

```java
Path dir = Paths.get("data");

if (!Files.exists(dir)) {
    Files.createDirectory(dir);
}
```

## Crear directorios anidados

Si necesitás varias carpetas en cadena:

```java
Path dir = Paths.get("data", "users", "backup");
Files.createDirectories(dir);
```

`createDirectories` crea todo lo necesario si no existe.

## Borrar archivos

```java
Path path = Paths.get("notes.txt");
Files.delete(path);
```

## Cuidado con `delete`

Si el archivo no existe, puede lanzar excepción.

Si querés una versión más segura:

```java
Files.deleteIfExists(path);
```

## Copiar archivos

```java
Path source = Paths.get("notes.txt");
Path target = Paths.get("backup.txt");

Files.copy(source, target);
```

## Mover o renombrar archivos

```java
Path source = Paths.get("notes.txt");
Path target = Paths.get("archived-notes.txt");

Files.move(source, target);
```

## Información sobre archivos

Podés consultar algunas propiedades.

### Tamaño

```java
long size = Files.size(path);
System.out.println(size);
```

### ¿Es un archivo regular?

```java
System.out.println(Files.isRegularFile(path));
```

### ¿Es un directorio?

```java
System.out.println(Files.isDirectory(path));
```

## Ejemplo práctico: guardar una lista de tareas

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        Path path = Paths.get("tasks.txt");

        List<String> tasks = List.of(
            "Estudiar Java",
            "Practicar Collections",
            "Leer sobre archivos"
        );

        try {
            Files.write(path, tasks);

            List<String> loadedTasks = Files.readAllLines(path);

            for (String task : loadedTasks) {
                System.out.println(task);
            }
        } catch (IOException e) {
            System.out.println("Error al guardar o leer tareas: " + e.getMessage());
        }
    }
}
```

## Trabajar con objetos y archivos

En esta etapa, lo más simple es escribir objetos como texto.

Por ejemplo, podrías tener una clase `User`:

```java
public class User {
    private String username;
    private String email;

    public User(String username, String email) {
        this.username = username;
        this.email = email;
    }

    public String toLine() {
        return username + "," + email;
    }
}
```

Luego podrías guardar varias líneas en un archivo:

```java
List<String> lines = List.of(
    user1.toLine(),
    user2.toLine()
);
```

Más adelante vas a ver opciones más avanzadas como JSON, serialización o persistencia con base de datos.

## Relación con excepciones

Esta lección conecta mucho con lo que viste en exceptions.

Las operaciones con archivos suelen requerir:

- `try/catch`
- `throws`
- manejo cuidadoso de errores

Porque el sistema de archivos puede fallar por muchas razones fuera de tu control.

## Usar `throws` en ejemplos simples

A veces, para simplificar ejemplos educativos, vas a ver algo así:

```java
public static void main(String[] args) throws IOException
```

Eso no significa que se ignore el error.
Solo significa que el método declara que puede lanzar esa excepción en vez de capturarla ahí mismo.

En código real, muchas veces vas a querer manejar mejor esos casos.

## Rutas relativas y absolutas

### Ruta relativa

```java
Paths.get("notes.txt")
```

Depende del directorio actual del programa.

### Ruta absoluta

```java
Paths.get("C:/projects/data/notes.txt")
```

Apunta a una ubicación exacta.

Para empezar, suele ser más cómodo trabajar con rutas relativas.

## API antigua vs moderna

En Java también existen clases más viejas como:

- `File`
- `FileReader`
- `BufferedReader`
- `FileWriter`

Siguen siendo útiles y aparecen mucho en material existente.

Pero para empezar, la API de `java.nio.file` suele ser una forma más clara y moderna para casos comunes.

## Ejemplo completo

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        Path dir = Paths.get("data");
        Path file = dir.resolve("notes.txt");

        try {
            if (!Files.exists(dir)) {
                Files.createDirectories(dir);
            }

            Files.write(
                file,
                List.of("Línea 1", "Línea 2", "Línea 3"),
                StandardOpenOption.CREATE,
                StandardOpenOption.TRUNCATE_EXISTING
            );

            List<String> lines = Files.readAllLines(file);

            for (String line : lines) {
                System.out.println(line);
            }

            System.out.println("Tamaño: " + Files.size(file) + " bytes");
        } catch (IOException e) {
            System.out.println("Error con archivos: " + e.getMessage());
        }
    }
}
```

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede resultarte más estructurado que leer archivos rápidamente con ciertas APIs del ecosistema Node.js, pero Java deja muy explícito el trabajo con rutas, excepciones y tipos.

### Si venís de Python

Puede recordarte a abrir archivos, leer y escribir, pero en Java moderno el enfoque con `Path` y `Files` ofrece una API bastante limpia y consistente.

## Errores comunes

### 1. Olvidar manejar `IOException`

Las operaciones con archivos pueden fallar y Java te obliga a tenerlo en cuenta.

### 2. Pensar que escribir siempre agrega contenido

Muchas operaciones reemplazan el archivo completo si no indicás opciones como `APPEND`.

### 3. Confundir ruta relativa con ruta absoluta

Eso puede hacer que el archivo termine en un lugar inesperado.

### 4. Suponer que el archivo existe

Siempre conviene verificar o capturar el error.

### 5. Elegir una API más compleja de la necesaria

Para muchos casos simples, `Files.readString`, `Files.writeString`, `Files.readAllLines` y `Files.write` alcanzan perfectamente.

## Mini ejercicio

Escribí código para:

1. crear un archivo `tasks.txt`
2. guardar varias líneas
3. leerlas y mostrarlas
4. comprobar si el archivo existe
5. mostrar su tamaño
6. agregar una nueva línea al final

## Ejemplo posible

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        Path path = Paths.get("tasks.txt");

        try {
            Files.write(path, List.of("Tarea 1", "Tarea 2", "Tarea 3"));

            List<String> lines = Files.readAllLines(path);
            for (String line : lines) {
                System.out.println(line);
            }

            System.out.println("Existe: " + Files.exists(path));
            System.out.println("Tamaño: " + Files.size(path));

            Files.writeString(
                path,
                "Tarea 4
",
                StandardOpenOption.APPEND
            );
        } catch (IOException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}
```

## Resumen

En esta lección viste que:

- los archivos permiten persistir información fuera de la memoria del programa
- `Path` representa rutas
- `Files` ofrece operaciones modernas para leer y escribir archivos
- podés trabajar con texto completo o línea por línea
- también podés crear directorios, copiar, mover y borrar archivos
- las operaciones con archivos suelen requerir manejo de excepciones
- `java.nio.file` es una API moderna y muy recomendable para empezar

## Siguiente tema

En la próxima lección conviene pasar a **Maven**, porque una vez que ya sabés trabajar con más partes reales del lenguaje y su biblioteca estándar, el siguiente paso natural es aprender a manejar proyectos Java con dependencias, estructura y automatización.
