# Frontend del Sistema de Gestión de Gimnasio

## Descripción
Frontend desarrollado con Next.js para el sistema de gestión de gimnasio. Implementa una interfaz moderna y responsiva utilizando Material-UI y TailwindCSS.

## Características
- Interfaz moderna y responsiva
- Control de acceso biométrico facial
- Gestión de membresías y planes
- Sistema de ventas y facturación
- Gestión de inventario
- Reportes y estadísticas
- Autenticación y autorización

## Requisitos
- Node.js 16+
- npm 7+

## Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd Frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env.local
# Editar .env.local con tus configuraciones
```

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

## Estructura del Proyecto
```
Frontend/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── pages/         # Páginas de la aplicación
│   ├── services/      # Servicios y API
│   ├── store/         # Estado global (Redux)
│   └── utils/         # Utilidades
├── public/            # Archivos estáticos
└── package.json       # Dependencias
```

## Páginas Principales

### Autenticación
- Login
- Registro
- Recuperación de contraseña

### Dashboard
- Resumen general
- Estadísticas
- Alertas

### Usuarios
- Lista de usuarios
- Perfil de usuario
- Registro de usuario

### Membresías
- Lista de membresías
- Crear membresía
- Editar membresía

### Productos
- Lista de productos
- Crear producto
- Editar producto
- Inventario

### Ventas
- Nueva venta
- Historial de ventas
- Reportes

### Control de Acceso
- Registro facial
- Verificación de acceso
- Historial de acceso

## Tecnologías Utilizadas
- Next.js 14
- Material-UI
- TailwindCSS
- Redux Toolkit
- React Query
- Chart.js
- Formik & Yup

## Scripts Disponibles
- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run start`: Inicia la aplicación en modo producción
- `npm run lint`: Ejecuta el linter

## Contribución
1. Fork el repositorio
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Crear un Pull Request

## Licencia
Este proyecto está bajo la Licencia MIT. 