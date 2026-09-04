# ReservaPro — Hotel Boutique & Restaurant

Proyecto académico en **React + Vite + JSON Server** para practicar autenticación, autorización por roles, React Router, Context API, consumo de una API REST simulada y colaboración con Git/GitHub.

## Integrantes

- [INTEGRANTE 1] — Líder / integrador
- [INTEGRANTE 2] — Autenticación
- [INTEGRANTE 3] — Autorización y rutas
- [INTEGRANTE 4] — Datos y UI

## Tema

ReservaPro permite administrar reservas de **hotel boutique** y **restaurante** dentro de una misma aplicación.

### Usuario estándar (`user`)

- Iniciar y cerrar sesión.
- Mantener la sesión con `localStorage`.
- Crear reservas de hotel o restaurante.
- Ver únicamente sus propias reservas mediante `ownerId`.
- Cancelar sus reservas pendientes.
- Consultar dashboard y perfil.

### Administrador (`admin`)

- Ver dashboard general.
- Consultar todas las reservas.
- Filtrar por estado, tipo y búsqueda.
- Confirmar o cancelar reservas.
- Consultar usuarios.
- Crear usuarios.
- Eliminar usuarios sin reservas asociadas.

## Tecnologías

- React 18
- Vite
- React Router DOM
- Context API
- JSON Server
- Recharts
- React Icons
- CSS responsive

## Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Ejecutar JSON Server

En una terminal:

```bash
npm run server
```

El backend simulado quedará en:

```text
http://localhost:3001
```

### 3. Ejecutar React

En otra terminal:

```bash
npm run dev
```

Vite normalmente abrirá:

```text
http://localhost:5173
```

En Windows también puedes ejecutar `INICIAR.bat`, que abre el servidor y Vite en dos terminales.

## Usuarios de prueba

### Administrador

```text
Correo: admin@reservapro.com
Contraseña: 1234
```

### Usuario estándar

```text
Correo: user@reservapro.com
Contraseña: 1234
```

También hay usuarios de ejemplo adicionales en `db.json`.

## Rutas

| Ruta | Acceso | Descripción |
|---|---|---|
| `/` | Público | Landing de ReservaPro |
| `/login` | Público | Inicio de sesión |
| `/dashboard` | Autenticado | Dashboard según rol |
| `/reservar` | Autenticado | Crear reserva |
| `/mis-reservas` | Autenticado | Reservas filtradas por `ownerId` |
| `/perfil` | Autenticado | Perfil del usuario |
| `/admin/reservas` | Solo admin | Todas las reservas y cambio de estado |
| `/admin/usuarios` | Solo admin | Gestión de usuarios |
| `/acceso-denegado` | Autenticado | Página 403 |
| `*` | Todos | Página 404 |

## Arquitectura

```text
ReservaPro/
├── public/
│   ├── favicon.svg
│   ├── fallback-hotel.svg
│   └── fallback-restaurant.svg
├── src/
│   ├── components/
│   │   ├── AdminRoute.jsx
│   │   ├── ErrorMessage.jsx
│   │   ├── Loader.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── ReservationCard.jsx
│   │   ├── ReservationForm.jsx
│   │   ├── StatCard.jsx
│   │   └── StatusBadge.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── AccessDenied.jsx
│   │   ├── AdminReservations.jsx
│   │   ├── AdminUsers.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── MyReservations.jsx
│   │   ├── NewReservation.jsx
│   │   ├── NotFound.jsx
│   │   └── Profile.jsx
│   ├── services/
│   │   └── api.js
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
├── db.json
├── BITACORA.md
├── REFLEXION.md
├── PRUEBAS.md
├── INICIAR.bat
├── BUILD.bat
├── package.json
└── vite.config.js
```

## Conceptos de React evidenciados

- **Componentes funcionales:** páginas, Navbar, cards, rutas protegidas y formularios.
- **Props:** ReservationCard, ReservationForm, StatCard, StatusBadge, Loader.
- **useState:** formularios, filtros, login, datos y mensajes.
- **useEffect:** carga de datos desde JSON Server y restauración de sesión.
- **Renderizado condicional:** dashboard por rol, campos hotel/restaurante y acciones según estado.
- **Listas y keys:** reservas, usuarios, métricas y filtros.
- **Eventos:** submit, logout, confirmar, cancelar y eliminar.
- **React Router:** navegación y protección de rutas.
- **Context API:** sesión compartida con AuthContext.

## Cómo funciona `ownerId`

Cuando un usuario crea una reserva, se guarda:

```js
ownerId: user.id
```

Después, la página de reservas del usuario consulta:

```text
GET /reservations?ownerId=ID
```

Así un usuario estándar no recibe la lista completa desde la interfaz.

## Advertencia de seguridad

Este proyecto **simula autenticación y autorización con fines académicos**.

JSON Server no proporciona seguridad real:

- las contraseñas están en texto plano en `db.json`;
- no existe hashing;
- no existe JWT;
- no existen sesiones seguras del servidor;
- un usuario podría modificar manualmente peticiones HTTP;
- los permisos se comprueban principalmente en el cliente.

En producción sería necesario un backend real con:

- base de datos protegida;
- contraseñas con hashing;
- sesiones o tokens seguros;
- validación server-side;
- middleware de autorización;
- HTTPS;
- protección contra abuso y validaciones adicionales.

## Git y GitHub

Ramas sugeridas:

```text
feature/authentication
feature/roles-routing
feature/reservations
feature/admin-users-ui
```

Commits sugeridos:

```text
feat: create ReservaPro React base
feat: add login authentication with JSON Server
feat: add auth context and session persistence
feat: protect routes by authentication
feat: add admin role authorization
feat: add user reservation form
feat: filter reservations by ownerId
feat: add admin reservations management
feat: add user management panel
style: add ReservaPro responsive interface
docs: add README and prompt log
```

## Documentación adicional

- [BITACORA.md](./BITACORA.md)
- [REFLEXION.md](./REFLEXION.md)
- [PRUEBAS.md](./PRUEBAS.md)
