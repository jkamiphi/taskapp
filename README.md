# Aplicación de Gestión de Tareas

Una aplicación moderna de gestión de tareas construida con Laravel y con un servicio frontend separado. Esta aplicación permite a los usuarios gestionar sus tareas con operaciones CRUD completas, autenticación de usuarios y una interfaz API limpia.

## Stack Tecnológico

### Backend
- **PHP**: ^8.2
- **Laravel Framework**: ^12.31.1
- **MySQL**: 8.0
- **Redis**: Última versión

### Frontend
- **Node.js**: 22
- **Vite**: Última versión (herramienta de construcción)
- **Framework Frontend**: Configurado vía Vite

### Herramientas de Desarrollo
- **Docker**: Vía Laravel Sail
- **Composer**: Para gestión de dependencias PHP
- **PHPUnit**: ^11.5.3 (para testing)
- **Laravel Pint**: ^1.25.1 (formateo de código)
- **Mockery**: ^1.6 (para mocking en tests)
- **Faker**: ^1.23 (para generar datos de prueba)

## Prerrequisitos

- Docker y Docker Compose
- Git

## Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd taskapp
```

### 2. Configuración del Entorno
```bash
# Copiar el archivo de entorno
cp .env.example .env

# Generar clave de aplicación
./vendor/bin/sail artisan key:generate
```

### 3. Configurar Variables de Entorno
Edita el archivo `.env` con tu configuración específica. Variables clave incluyen:

```env
APP_NAME=Laravel
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

# Configuración de Base de Datos (MySQL vía Docker)
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=sail
DB_PASSWORD=password

# Configuración Frontend
FRONTEND_URL=http://localhost:3000
FRONTEND_PORT=3000
VITE_PORT=5173
API_BASE_URL=http://localhost/api
CORS_ALLOWED_ORIGINS=
SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost,127.0.0.1:3000,127.0.0.1

# Configuracion Gemini
GEMINI_API_KEY=tu_api_key_aqui
```

### 4. Iniciar Servicios Docker
```bash
# Iniciar todos los servicios (MySQL, Redis, Meilisearch, Mailpit, etc.)
./vendor/bin/sail up -d

# O usar el alias después de la primera ejecución
alias sail='vendor/bin/sail'
sail up -d
```

### 5. Instalar Dependencias
```bash
# Instalar dependencias PHP
sail composer install

# Instalar dependencias Node.js para frontend
cd frontend
npm install
cd ..
```

### 6. Configuración de Base de Datos
```bash
# Ejecutar migraciones de base de datos
sail artisan migrate

# Poblar la base de datos con datos de ejemplo
sail artisan db:seed

# Opcional: Ejecutar seeders específicos
sail artisan db:seed --class=DemoSeeder
```

## Servidores de Desarrollo

### Iniciar Todos los Servicios de Desarrollo
```bash
# Usar el comando conveniente de desarrollo que inicia todos los servicios
sail composer dev
```

Este comando inicia:
- Servidor de desarrollo Laravel (puerto 80)
- Monitoreo de logs (Laravel Pail)

### Iniciar Servicios Individualmente

#### Solo Backend
```bash
sail artisan serve
```

#### Solo Frontend
```bash
cd frontend
npm run dev
```

#### Worker de Colas
```bash
sail artisan queue:work
```

#### Monitoreo de Logs
```bash
sail artisan pail --timeout=0
```

## Pruebas

### Ejecutar Todas las Pruebas
```bash
# Limpiar caché de configuración y ejecutar pruebas
sail composer test

# O manualmente
sail artisan config:clear
sail artisan test
```

### Ejecutar Suites de Pruebas Específicas
```bash
# Ejecutar pruebas de características
sail artisan test --testsuite=Feature

# Ejecutar pruebas unitarias
sail artisan test --testsuite=Unit
```

## Endpoints de API

La aplicación proporciona endpoints API RESTful para gestión de tareas:

- `GET /api/tasks` - Listar todas las tareas
- `POST /api/tasks` - Crear una nueva tarea
- `GET /api/tasks/{id}` - Obtener una tarea específica
- `PUT /api/tasks/{id}` - Actualizar una tarea
- `DELETE /api/tasks/{id}` - Eliminar una tarea
- `POST /api/tasks/generate-with-ai` - Generar tareas usando IA (requiere tema en el cuerpo)

Endpoints de autenticación (si se usa Laravel Sanctum):
- `POST /api/register` - Registro de usuario
- `POST /api/login` - Inicio de sesión de usuario
- `POST /api/logout` - Cierre de sesión de usuario

## Esquema de Base de Datos

### Tabla Users
- `id` - Clave primaria
- `name` - Nombre del usuario
- `email` - Email del usuario (único)
- `password` - Contraseña encriptada
- Timestamps

### Tabla Tasks
- `id` - Clave primaria
- `title` - Título de la tarea
- `description` - Descripción de la tarea
- `completed` - Estado booleano
- `due_date` - Fecha de vencimiento opcional
- `user_id` - Clave foránea a tabla users
- Timestamps

## Estructura del Proyecto

```
├── app/
│   ├── Http/Controllers/    # Controladores API
│   ├── Models/             # Modelos Eloquent (User, Task)
│   └── Providers/          # Proveedores de Servicio
|   └── Services/           # Servicios personalizados (e.g., GeminiTaskService)
├── config/                 # Archivos de configuración
├── database/
│   ├── factories/          # Factorías de Modelo
│   ├── migrations/         # Migraciones de base de datos
│   └── seeders/           # Seeders de base de datos
├── frontend/              # Aplicación frontend
├── routes/                # Rutas API y web
├── tests/                 # Archivos de prueba
└── docker/               # Configuración Docker
```

## Comandos Disponibles

### Scripts de Composer
```bash
# Iniciar entorno de desarrollo
sail composer dev

# Ejecutar pruebas
sail composer test

# Formatear código
sail composer format
```

### Comandos Artisan
```bash
# Operaciones de base de datos
sail artisan migrate
sail artisan migrate:fresh --seed
sail artisan db:seed

# Monitoreo de logs
sail artisan pail

# Gestión de caché
sail artisan config:clear
sail artisan route:clear
sail artisan view:clear
```

## Consideraciones Especiales

### Servicios Docker
La aplicación usa Laravel Sail para orquestación Docker, que incluye:
- **MySQL 8.0**: Base de datos principal
- **Mailpit**: Prueba de emails durante desarrollo

### Integración Frontend
- El frontend corre como un servicio separado en el puerto 3000
- La comunicación API se configura vía variable de entorno `API_BASE_URL`
- Las peticiones cross-origin se manejan por la configuración CORS

### Flujo de Trabajo de Desarrollo
- Usa `sail composer dev` para iniciar todos los servicios simultáneamente
- La aplicación soporta hot-reloading para backend y frontend
- El procesamiento de colas se maneja automáticamente en modo desarrollo
- El monitoreo de logs proporciona información en tiempo real de la aplicación


### Consideraciones de Producción
- Actualizar `.env` para entorno de producción
- Usar credenciales de base de datos apropiadas
- Habilitar modo de mantenimiento de Laravel para despliegues

## Resolución de Problemas

### Problemas Comunes

1. **Conflictos de puertos**: Asegurar que los puertos 80, 3000, 3306, 6379 estén disponibles
2. **Problemas de permisos**: Ejecutar `sail shell` y arreglar permisos de archivos si es necesario
3. **Conexión de base de datos**: Verificar que el contenedor MySQL esté corriendo con `sail ps`
4. **Frontend no carga**: Verificar si las dependencias Node.js están instaladas

### Comandos Útiles
```bash
# Verificar estado de servicios
sail ps

# Ver logs
sail logs api
sail logs mysql

# Acceder al shell del contenedor
sail shell

# Reiniciar todo
sail down -v
sail up -d
sail artisan migrate:fresh --seed
```
