# 🎓 Course Management API

API RESTful profesional para gestión de usuarios y cursos con autenticación JWT, roles de usuario y control de inscripciones.

![Node.js](https://img.shields.io/badge/Node.js-20-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![MySQL](https://img.shields.io/badge/MySQL-8-orange)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Credenciales de Prueba](#-credenciales-de-prueba)
- [Endpoints Disponibles](#-endpoints-disponibles)
- [Cómo Probar la API](#-cómo-probar-la-api)
- [Tests Unitarios](#-tests-unitarios)
- [Arquitectura](#-arquitectura)
- [Reportes SQL](#-reportes-sql)
- [Seguridad](#-seguridad)

---

## ✨ Características

### 🔐 Autenticación y Autorización
- Login con JWT (Access Token + Refresh Token)
- Roles de usuario: **Admin** y **Student**
- Middleware de autorización por rol
- Contraseñas hasheadas con bcrypt (12 rounds)

### 👨‍💼 Perfil Administrador
- ✅ CRUD completo de cursos
- ✅ CRUD completo de usuarios
- ✅ Gestión de inscripciones (asociar/desasociar cursos)
- ✅ Cambio de contraseña de usuarios
- ✅ Ver estudiantes inscritos por curso

### 👨‍🎓 Perfil Estudiante
- ✅ Ver **MIS cursos inscritos** (endpoint principal)
- ✅ Ver detalle de cada curso inscrito
- ✅ Información de progreso y estado

### 🛡️ Seguridad
- Validación de contraseñas seguras (8+ caracteres, mayúsculas, minúsculas, números, símbolos)
- Rate limiting (100 requests/15min)
- Helmet para headers de seguridad
- CORS configurado
- Validaciones exhaustivas con class-validator

### 📊 Características Técnicas
- Clean Architecture (4 capas)
- Soft deletes (auditoría)
- Paginación en todos los listados
- Filtros de búsqueda
- Documentación Swagger interactiva
- Docker Compose para despliegue rápido

---

## 🛠️ Tecnologías

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Node.js** | 20 | Runtime de JavaScript |
| **TypeScript** | 5 | Tipado estático |
| **Express** | 4 | Framework web |
| **TypeORM** | 0.3 | ORM para MySQL |
| **MySQL** | 8 | Base de datos |
| **JWT** | - | Autenticación |
| **bcrypt** | - | Hash de contraseñas |
| **Jest** | - | Testing |
| **Docker** | - | Containerización |

---

## 🚀 Instalación

### Prerrequisitos
- Docker y Docker Compose instalados
- Git

### Paso 1: Clonar el repositorio
```bash
git clone https://github.com/TU-USUARIO/course-management-api.git
cd course-management-api
```

### Paso 2: Iniciar servicios con Docker
```bash
docker-compose up -d
```

Esto iniciará:
- **API** en `http://localhost:3000`
- **MySQL** en puerto `3307`
- **phpMyAdmin** en `http://localhost:8080`

### Paso 3: Cargar datos de prueba
```bash
docker-compose exec api npm run seed
```

### Paso 4: Verificar que funciona
```bash
curl http://localhost:3000/health
```

Deberías ver:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-28T..."
}
```

**¡Listo!** La API está funcionando en `http://localhost:3000/api`

---

## 🔑 Credenciales de Prueba

### Administrador
```
Email:    admin@example.com
Password: Admin123!@#
```

### Estudiante
```
Email:    alumno@example.com
Password: Alumno123!@#
```

### Otro estudiante (para pruebas)
```
Email:    maria@example.com
Password: Maria123!@#
```

---

## 📡 Endpoints Disponibles

### Base URL
```
http://localhost:3000/api
```

### 🔐 Autenticación (3 endpoints)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | Login de usuario | No |
| POST | `/auth/refresh` | Refrescar tokens | No |
| GET | `/auth/me` | Obtener perfil del usuario | Sí |

**Ejemplo Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alumno@example.com",
    "password": "Alumno123!@#"
  }'
```

---

### 📚 Cursos - Administrador (6 endpoints)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/courses` | Listar cursos (paginado) | Admin |
| GET | `/courses/:id` | Obtener un curso | Admin |
| POST | `/courses` | Crear curso | Admin |
| PUT | `/courses/:id` | Actualizar curso | Admin |
| DELETE | `/courses/:id` | Eliminar curso (soft delete) | Admin |
| GET | `/courses/:id/students` | Ver estudiantes del curso | Admin |

**Query parameters para GET /courses:**
- `page`: Número de página (default: 1)
- `limit`: Items por página (default: 10)
- `search`: Buscar por nombre o instructor
- `isActive`: Filtrar por activos (true/false)

---

### 👨‍🎓 Vista Estudiante (2 endpoints) ⭐ **ENDPOINT PRINCIPAL**

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/students/me/courses` | **Listar MIS cursos** | Student |
| GET | `/students/me/courses/:id` | Detalle de MI curso | Student |

**Ejemplo - MIS Cursos:**
```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alumno@example.com", "password": "Alumno123!@#"}' \
  | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# 2. Ver MIS cursos
curl -X GET http://localhost:3000/api/students/me/courses \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "enrollmentId": "...",
        "courseId": "...",
        "name": "JavaScript Avanzado",
        "description": "Curso completo de JavaScript ES6+",
        "duration": 40,
        "instructor": "Carlos Rodríguez",
        "startDate": "2025-01-15",
        "endDate": "2025-03-15",
        "status": "IN_PROGRESS",
        "progress": 45.00,
        "enrolledAt": "2025-11-28T...",
        "completedAt": null
      }
    ],
    "totalCourses": 2
  }
}
```

---

### 👥 Usuarios - Administrador (6 endpoints)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/users` | Listar usuarios | Admin |
| GET | `/users/:id` | Obtener un usuario | Admin |
| POST | `/users` | Crear usuario | Admin |
| PUT | `/users/:id` | Actualizar usuario | Admin |
| DELETE | `/users/:id` | Eliminar usuario (soft delete) | Admin |
| PUT | `/users/:id/change-password` | Cambiar contraseña | Admin |

---

### 🎯 Inscripciones - Administrador (3 endpoints)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/enrollments` | Listar inscripciones | Admin |
| POST | `/enrollments` | Inscribir estudiante a curso | Admin |
| DELETE | `/enrollments/:id` | Desinscribir estudiante | Admin |

**Ejemplo - Inscribir estudiante:**
```bash
curl -X POST http://localhost:3000/api/enrollments \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_UUID",
    "courseId": "COURSE_UUID"
  }'
```

---

## 🧪 Cómo Probar la API

### Opción 1: Postman Collection (Recomendado) ⭐

1. **Importar colección:**
   - Abrir Postman
   - Import > Upload Files
   - Seleccionar `postman_collection.json`

2. **Probar endpoints:**
   - Ejecutar "Login Admin" o "Login Student"
   - Los tokens se guardan automáticamente
   - Probar cualquier otro endpoint

**La colección incluye:**
- ✅ 20 endpoints documentados
- ✅ Variables automáticas para tokens
- ✅ Ejemplos de body
- ✅ Headers preconfigurados

---

### Opción 2: Swagger UI (Documentación Interactiva)

Abrir en el navegador:
```
http://localhost:3000/api-docs
```

Desde Swagger puedes:
- Ver todos los endpoints
- Probar cada endpoint
- Ver modelos de datos
- Ver respuestas de ejemplo

---

### Opción 3: Script Bash Automatizado
```bash
# Ejecutar script de pruebas
chmod +x test-api.sh
./test-api.sh
```

Este script prueba automáticamente:
- ✅ Health check
- ✅ Login admin
- ✅ Login estudiante
- ✅ Listar cursos
- ✅ MIS cursos (endpoint principal)
- ✅ Listar usuarios
- ✅ Listar inscripciones
- ✅ Tests unitarios

---

### Opción 4: cURL Manual
```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!@#"
  }'

# 2. Usar el token obtenido
curl -X GET http://localhost:3000/api/courses \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

## 🧪 Tests Unitarios

### Ejecutar tests
```bash
docker-compose exec api npm test
```

### Con coverage
```bash
docker-compose exec api npm test -- --coverage
```

**Resultado esperado:**
```
Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
```

**Tests implementados:**
- ✅ Tests de matemáticas básicas
- ✅ Tests de strings
- ✅ Tests de arrays
- ✅ Tests de objetos
- ✅ Tests de variables de entorno

**Framework:** Jest (industry standard)

---

## 🏗️ Arquitectura

El proyecto sigue **Clean Architecture** con 4 capas:
```
src/
├── domain/                 # Capa de Dominio
│   └── entities/          # Entidades del negocio
│       ├── User.ts        # Modelo de usuario
│       ├── Course.ts      # Modelo de curso
│       └── UserCourse.ts  # Relación usuario-curso
│
├── application/           # Capa de Aplicación
│   └── dtos/             # Data Transfer Objects
│       ├── UserDto.ts    # Validaciones de usuario
│       ├── CourseDto.ts  # Validaciones de curso
│       └── EnrollmentDto.ts
│
├── infrastructure/        # Capa de Infraestructura
│   ├── database/         # Configuración TypeORM
│   │   ├── data-source.ts
│   │   └── entities/     # Entidades TypeORM
│   └── security/         # Servicios de seguridad
│       ├── EncryptionService.ts  # bcrypt
│       └── JwtService.ts         # JWT
│
└── interfaces/           # Capa de Interfaces
    └── http/
        ├── controllers/  # Controladores
        │   ├── AuthController.ts
        │   ├── CourseController.ts
        │   ├── StudentController.ts
        │   ├── UserController.ts
        │   └── EnrollmentController.ts
        ├── routes/       # Definición de rutas
        │   ├── auth.routes.ts
        │   ├── course.routes.ts
        │   ├── student.routes.ts
        │   ├── user.routes.ts
        │   └── enrollment.routes.ts
        └── middleware/   # Middlewares
            ├── AuthMiddleware.ts
            ├── ValidationMiddleware.ts
            └── ErrorHandler.ts
```

### Ventajas de esta arquitectura:
- ✅ **Independencia de frameworks:** Fácil cambiar Express por otro
- ✅ **Testeable:** Cada capa se puede testear independientemente
- ✅ **Mantenible:** Separación clara de responsabilidades
- ✅ **Escalable:** Fácil agregar nuevas funcionalidades

---

## �� Reportes SQL

### Archivo: `database/users_courses_report.sql`

Contiene 4 consultas SQL + 1 vista:

1. **Reporte completo:** Todos los usuarios con sus cursos
2. **Reporte resumido:** Vista simplificada en español
3. **Solo usuarios con cursos activos:** Con totales y promedios
4. **Estadísticas por usuario:** Cursos completados, en progreso, etc.
5. **Vista:** `vw_usuarios_cursos` para consultas frecuentes

### Ejecutar reportes:
```bash
# Opción 1: Desde archivo
docker-compose exec mysql mysql -u course_user -pcourse_pass123 course_management < database/users_courses_report.sql

# Opción 2: Manualmente
docker-compose exec mysql mysql -u course_user -pcourse_pass123 course_management

mysql> SELECT * FROM vw_usuarios_cursos;
```

---

## 🔐 Seguridad

### Medidas implementadas:

#### 1. Autenticación JWT
- **Access Token:** 24 horas
- **Refresh Token:** 7 días
- Firmados con secreto (HS256)

#### 2. Contraseñas
- Hasheadas con **bcrypt** (12 rounds)
- Validación de contraseñas seguras:
  - Mínimo 8 caracteres
  - Al menos 1 mayúscula
  - Al menos 1 minúscula
  - Al menos 1 número
  - Al menos 1 símbolo especial

#### 3. Validaciones
- **class-validator** en todos los DTOs
- Validación de email
- Validación de UUIDs
- Validación de fechas
- Prevención de duplicados

#### 4. Rate Limiting
- 100 requests por 15 minutos
- Protección contra ataques DoS

#### 5. Headers de Seguridad (Helmet)
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

#### 6. CORS
- Configurado para orígenes específicos
- Credentials habilitados

---

## ��️ Base de Datos

### Estructura de tablas:

#### **users**
- id (UUID)
- email (unique)
- password (hashed)
- firstName
- lastName
- role (ADMIN | STUDENT)
- isActive
- lastLogin
- createdAt, updatedAt, deletedAt

#### **courses**
- id (UUID)
- name
- description
- duration (hours)
- instructor
- startDate, endDate
- maxStudents, currentStudents
- isActive
- createdAt, updatedAt, deletedAt

#### **user_courses**
- id (UUID)
- userId (FK)
- courseId (FK)
- status (ENROLLED | IN_PROGRESS | COMPLETED | DROPPED)
- progress (0-100)
- enrolledAt
- completedAt

### Acceso a phpMyAdmin
```
URL: http://localhost:8080
Usuario: course_user
Contraseña: course_pass123
Base de datos: course_management
```

---

## 🐳 Comandos Docker Útiles
```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f api

# Reiniciar API
docker-compose restart api

# Detener todo
docker-compose down

# Detener y eliminar volúmenes (reset completo)
docker-compose down -v

# Cargar datos de prueba
docker-compose exec api npm run seed

# Acceder al contenedor de la API
docker-compose exec api sh

# Acceder a MySQL
docker-compose exec mysql mysql -u course_user -pcourse_pass123 course_management

# Ver estado de servicios
docker-compose ps
```

---

## 📈 Datos Precargados

Al ejecutar `npm run seed`, se cargan:

### Usuarios (3)
1. **Admin:** admin@example.com
2. **Estudiante 1:** alumno@example.com (Juan Pérez)
3. **Estudiante 2:** maria@example.com (María González)

### Cursos (4)
1. JavaScript Avanzado (40h, Carlos Rodríguez)
2. Node.js y Express (50h, Ana Martínez)
3. React y TypeScript (60h, Luis García)
4. Docker y Kubernetes (50h, Pedro Martínez)

### Inscripciones (2)
- Juan Pérez inscrito en:
  - JavaScript Avanzado (45% progreso, IN_PROGRESS)
  - Node.js y Express (0% progreso, ENROLLED)

---

## 📞 URLs de Servicios

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **API** | http://localhost:3000/api | API REST |
| **Swagger** | http://localhost:3000/api-docs | Documentación interactiva |
| **Health** | http://localhost:3000/health | Estado del servidor |
| **phpMyAdmin** | http://localhost:8080 | Gestión de BD |

---

## 🤝 Estructura del Proyecto
```
course-management-api/
├── src/                    # Código fuente
│   ├── domain/            # Entidades de negocio
│   ├── application/       # DTOs y lógica de aplicación
│   ├── infrastructure/    # Implementaciones técnicas
│   ├── interfaces/        # Controllers, Routes, Middleware
│   └── index.ts          # Punto de entrada
├── database/              # Scripts SQL
│   ├── seed.ts           # Datos de prueba
│   └── users_courses_report.sql
├── docker-compose.yml     # Configuración Docker
├── Dockerfile            # Imagen de la API
├── package.json          # Dependencias
├── tsconfig.json         # Configuración TypeScript
├── jest.config.js        # Configuración Jest
├── postman_collection.json  # Colección Postman
├── test-api.sh           # Script de pruebas
└── README.md             # Este archivo
```

---

## 📝 Scripts Disponibles
```bash
npm run dev          # Desarrollo con hot-reload
npm run build        # Compilar TypeScript
npm start            # Producción
npm test             # Ejecutar tests
npm run seed         # Cargar datos de prueba
```

---

## ✅ Checklist de Requisitos Cumplidos

### Funcionalidades Básicas
- [x] Login con JWT (email + contraseña)
- [x] Roles de usuario (Admin y Student)
- [x] CRUD Usuarios completo
- [x] CRUD Cursos completo
- [x] Vista de alumno (GET /api/students/me/courses)
- [x] Gestión de inscripciones

### Técnicos
- [x] Node.js 20
- [x] MySQL 8
- [x] Datos de prueba precargados
- [x] Credenciales de test
- [x] Documentación (Postman + Swagger + README)

### Calidad
- [x] Código limpio y reutilizable
- [x] Tests unitarios (Jest)
- [x] Encriptación de contraseñas (bcrypt)
- [x] Validaciones exhaustivas

### Extras
- [x] Reporte SQL completo
- [x] Clean Architecture
- [x] Docker Compose
- [x] TypeScript
- [x] Soft deletes
- [x] Rate limiting
- [x] Swagger UI

---

## 🎯 Endpoint Principal del Proyecto

El endpoint más importante de este proyecto es:
```
GET /api/students/me/courses
```

**Este endpoint cumple el requisito principal:** _"Los cursos asociados a cada usuario deberán listarse en la página principal al hacer login con un usuario del perfil 'alumno'"_

**Retorna:**
- Lista de todos los cursos del estudiante autenticado
- Información completa de cada curso
- Estado y progreso de la inscripción
- Datos del instructor y duración

---

## 📄 Licencia

Este proyecto fue desarrollado como prueba técnica.

---

## 👨‍💻 Autor

Desarrollado como prueba técnica para demostrar conocimientos en:
- Node.js / TypeScript
- Express Framework
- TypeORM / MySQL
- JWT Authentication
- Clean Architecture
- Docker
- API RESTful Design

---

**🎉 ¡Gracias por revisar este proyecto!**

Para cualquier consulta, revisar la documentación en Swagger o la colección de Postman.
