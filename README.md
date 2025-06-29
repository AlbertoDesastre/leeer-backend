# Leeer Backend API

Este proyecto es una API RESTful desarrollada con NestJS y TypeORM para la gestión de una plataforma de creación y colaboración de obras literarias. Permite a los usuarios registrarse, crear obras, colaborar en creaciones de otros autores, gestionar partes de las obras y administrar peticiones de colaboración.

## Características principales

- Registro y autenticación de usuarios.
- Creación, consulta, actualización y borrado de obras literarias.
- Gestión de partes (capítulos) de cada obra.
- Sistema de colaboraciones: los usuarios pueden solicitar colaborar en obras ajenas y, si son aprobados, escribir partes colaborativas.
- Paginación en todos los endpoints de consulta.
- Sembrado automático de datos de prueba (seed).

## Levantar el proyecto en local

1. **Clona el repositorio**

   ```sh
   git clone <url-del-repo>
   cd leeer-backend
   ```

2. **Instala las dependencias**

   ```sh
   npm install
   ```

3. **Configura las variables de entorno**

   - Copia el archivo `example.env` a `.env` y edítalo con tus credenciales de base de datos MySQL:
     ```sh
     cp example.env .env
     # Edita .env según tus necesidades
     ```

4. **Levanta la base de datos MySQL**

   - Asegúrate de tener un servidor MySQL corriendo y una base de datos creada según lo especificado en tu `.env`.

5. **Ejecuta las migraciones y/o el seed (opcional)**

   - Puedes ejecutar el seed para poblar la base de datos con datos de prueba:
     ```sh
     # Desde el código puedes llamar al endpoint de seed o ejecutar el método correspondiente
     ```

6. **Inicia el servidor de desarrollo**

   ```sh
   npm run start:dev
   ```

7. **Accede a la API**
   - Por defecto estará disponible en: `http://localhost:3000`

## Notas

- La API está estructurada de forma modular siguiendo buenas prácticas de NestJS.
- Todos los endpoints principales están documentados mediante DTOs y comentarios en el código.
- El sistema de colaboraciones permite distinguir entre partes originales y colaborativas, así como el tipo de colaboración (canon, spinoff, fanfiction).

---

¿Dudas? Consulta el código fuente o contacta con el autor.
