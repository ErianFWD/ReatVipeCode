# Casos de prueba — ReservaPro

## Autenticación

- [ ] Admin correcto: `admin@reservapro.com / 1234` entra al dashboard admin.
- [ ] User correcto: `user@reservapro.com / 1234` entra al dashboard user.
- [ ] Password incorrecto muestra error.
- [ ] JSON Server apagado muestra mensaje de conexión.
- [ ] Recargar mantiene la sesión.
- [ ] Logout borra sesión y vuelve a `/login`.

## Rutas y roles

- [ ] Sin sesión, `/dashboard` redirige a `/login`.
- [ ] User en `/admin/reservas` llega a `/acceso-denegado`.
- [ ] Admin puede entrar a rutas administrativas.
- [ ] Navbar cambia según el rol.

## Reservas

- [ ] User crea reserva hotel.
- [ ] User crea reserva restaurante.
- [ ] `ownerId` coincide con `user.id`.
- [ ] Fecha pasada es rechazada.
- [ ] User solo ve sus propias reservas.
- [ ] User solo puede cancelar reservas pendientes desde la UI.
- [ ] Admin ve todas las reservas.
- [ ] Admin confirma una pendiente.
- [ ] Admin cancela una reserva.
- [ ] Filtros de admin funcionan por estado y servicio.
- [ ] Búsqueda funciona por nombre/correo/teléfono.

## Usuarios

- [ ] Admin crea usuario.
- [ ] Correo duplicado es rechazado.
- [ ] Password no se muestra en tabla.
- [ ] Admin activo no puede eliminarse.
- [ ] Usuario con reservas asociadas no puede eliminarse desde la UI.

## Build

- [ ] `npm install` termina correctamente.
- [ ] `npm run build` no muestra errores.
- [ ] `npm run server` inicia JSON Server en 3001.
- [ ] `npm run dev` inicia Vite.
