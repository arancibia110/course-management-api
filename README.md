# Course Management API

API REST para gestión de usuarios y cursos con autenticación JWT, desarrollada con Node.js, TypeScript y MySQL.

## Requisitos

- Docker y Docker Compose

## Instalación

```bash
git clone https://github.com/arancibia110/course-management-api.git
cd course-management-api
docker-compose up -d
docker-compose exec api npm run seed
```

Esto levanta la API en `http://localhost:3000` junto con MySQL y phpMyAdmin.

## Credenciales

Para probar el sistema hay dos usuarios precargados:

**Administrador:**
- Email: `admin@example.com`
- Password: `Admin123!@#`

**Estudiante:**
- Email: `alumno@example.com`
- Password: `Alumno123!@#`

## Funcionalidades Principales

### Perfil Administrador
El usuario admin puede:
- Crear, editar y eliminar cursos
- Crear, editar y eliminar usuarios
- Asociar estudiantes a cursos
- Ver qué estudiantes están inscritos en cada curso
- Cambiar contraseñas de usuarios

### Perfil Estudiante
Los estudiantes pueden:
- Ver todos sus cursos inscritos
- Ver el detalle y progreso de cada curso

## Endpoints

Base URL: `http://localhost:3000/api`

### Autenticación
- `POST /auth/login` - Login con email y password
- `POST /auth/refresh` - Renovar token de acceso
- `GET /auth/me` - Obtener datos del usuario actual

### Cursos (Solo Admin)
- `GET /courses` - Listar cursos (soporta paginación con `?page=1&limit=10`)
- `GET /courses/:id` - Ver detalle de un curso
- `POST /courses` - Crear nuevo curso
- `PUT /courses/:id` - Actualizar curso
- `DELETE /courses/:id` - Eliminar curso
- `GET /courses/:id/students` - Ver estudiantes inscritos

### Vista Estudiante (Endpoint Principal)
- `GET /students/me/courses` - Ver MIS cursos inscritos
- `GET /students/me/courses/:id` - Ver detalle de un curso mío

Este es el endpoint principal del proyecto. Retorna todos los cursos del estudiante autenticado con información de progreso, estado y fechas.

### Usuarios (Solo Admin)
- `GET /users` - Listar usuarios
- `GET /users/:id` - Ver un usuario
- `POST /users` - Crear usuario
- `PUT /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario
- `PUT /users/:id/change-password` - Cambiar contraseña

### Inscripciones (Solo Admin)
- `GET /enrollments` - Listar inscripciones
- `POST /enrollments` - Inscribir estudiante a curso
- `DELETE /enrollments/:id` - Desinscribir estudiante

## Cómo Probar

### 1. Postman (Recomendado)

Importa el archivo `postman_collection.json`. La colección tiene 20 endpoints con ejemplos de uso y los tokens se manejan automáticamente.

### 2. Swagger UI

Abre `http://localhost:3000/api-docs` en tu navegador para ver la documentación interactiva y probar los endpoints desde ahí.

### 3. Script de Pruebas

```bash
chmod +x test-api.sh
./test-api.sh
```

Este script ejecuta pruebas automáticas de todos los endpoints principales y los tests unitarios.

### 4. cURL

```bash
# Hacer login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alumno@example.com","password":"Alumno123!@#"}' \
  | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# Ver mis cursos
curl -X GET http://localhost:3000/api/students/me/courses \
  -H "Authorization: Bearer $TOKEN"
```

## Tecnologías Utilizadas

- **Node.js 20** - Runtime
- **TypeScript 5** - Lenguaje
- **Express 4** - Framework web
- **TypeORM 0.3** - ORM
- **MySQL 8** - Base de datos
- **JWT** - Autenticación
- **bcrypt** - Hash de contraseñas
- **Jest** - Testing
- **Docker** - Containerización

## Arquitectura

El proyecto usa Clean Architecture separada en 4 capas:

```
src/
├── domain/          # Entidades de negocio (User, Course, UserCourse)
├── application/     # DTOs y validaciones
├── infrastructure/  # Implementaciones (TypeORM, JWT, bcrypt)
└── interfaces/      # Controllers, rutas, middleware
```

Esta estructura permite cambiar implementaciones (por ejemplo, cambiar MySQL por PostgreSQL) sin afectar la lógica del negocio.

## Seguridad

El proyecto implementa varias medidas de seguridad:

- Las contraseñas se hashean con bcrypt usando 12 rounds
- Autenticación con JWT (access token válido por 24h, refresh token por 7 días)
- Validación de contraseñas seguras: mínimo 8 caracteres, mayúsculas, minúsculas, números y símbolos
- Rate limiting de 100 requests por 15 minutos
- Headers de seguridad configurados con Helmet
- Validación de datos de entrada con class-validator en todos los endpoints

## Base de Datos

### Estructura

La base de datos tiene 3 tablas principales:

**users** - Almacena usuarios con sus roles (ADMIN o STUDENT)  
**courses** - Almacena información de los cursos  
**user_courses** - Tabla intermedia que relaciona usuarios con cursos e incluye estado y progreso

### Acceso a phpMyAdmin

URL: `http://localhost:8080`

Credenciales:
- Usuario: `course_user`
- Password: `course_pass123`
- Base de datos: `course_management`

## Reportes SQL

El archivo `database/users_courses_report.sql` contiene varias consultas útiles:

- Reporte de usuarios con sus cursos
- Estadísticas por usuario (cursos completados, en progreso, etc.)
- Vista `vw_usuarios_cursos` para consultas frecuentes

Para ejecutarlo:
```bash
docker-compose exec mysql mysql -u course_user -pcourse_pass123 \
  course_management < database/users_courses_report.sql
```

## Tests

Para ejecutar los tests unitarios:

```bash
docker-compose exec api npm test
```

El proyecto incluye 15 tests que validan:
- Hashing y comparación de contraseñas con bcrypt
- Generación y verificación de tokens JWT
- Validaciones de contraseñas seguras con expresiones regulares
- Estructuras de datos del dominio (roles, estados)

## Datos de Prueba

Cuando ejecutas el seed, se crean:

**Usuarios:**
- 1 administrador
- 2 estudiantes (Juan Pérez y María González)

**Cursos:**
- JavaScript Avanzado (40 horas)
- Node.js y Express (50 horas)
- React y TypeScript (60 horas)
- Docker y Kubernetes (50 horas)

**Inscripciones:**
- Juan Pérez está inscrito en JavaScript Avanzado (45% completado) y Node.js y Express (recién inscrito)

## Comandos Útiles

```bash
# Ver logs de la API
docker-compose logs -f api

# Reiniciar la API
docker-compose restart api

# Detener todo
docker-compose down

# Reset completo (elimina la base de datos)
docker-compose down -v
docker-compose up -d
docker-compose exec api npm run seed

# Entrar al contenedor
docker-compose exec api sh

# Ver estado de los servicios
docker-compose ps
```

## URLs de los Servicios

- **API**: http://localhost:3000/api
- **Swagger**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health
- **phpMyAdmin**: http://localhost:8080

## Estructura del Proyecto

```
course-management-api/
├── src/                    # Código fuente
│   ├── domain/            # Entidades
│   ├── application/       # DTOs
│   ├── infrastructure/    # TypeORM, JWT, bcrypt
│   └── interfaces/        # Controllers, routes, middleware
├── database/              # Seeds y reportes SQL
├── docker-compose.yml     # Configuración de servicios
├── postman_collection.json
├── test-api.sh
└── README.md
```
