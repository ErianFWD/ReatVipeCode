# Bitácora de Vibe Coding — ReservaPro

La metodología utilizada es **Describe → Genera → Revisa → Prueba → Refina**.

| Funcionalidad | Prompt utilizado | Qué generó la IA | Qué revisamos | Qué corregimos/refinamos |
|---|---|---|---|---|
| Login | Crear login React controlado que consulte usuarios de JSON Server por correo y contraseña. | Formulario, llamada a API y mensaje de error. | Credenciales incorrectas, servidor apagado y datos almacenados. | Se centralizó la API y se evita guardar password en AuthContext. |
| AuthContext | Crear contexto para compartir usuario y rol y persistir sesión. | `AuthProvider`, `login`, `logout` y `localStorage`. | Restauración de sesión y estado inicial. | Se agregó `loading` para no redirigir antes de leer localStorage. |
| ProtectedRoute | Proteger rutas sin sesión. | Componente con `Navigate`. | Redirección y ubicación original. | Se muestra Loader durante restauración de sesión. |
| AdminRoute | Bloquear rutas admin a usuarios estándar. | Verificación de `role`. | Acceso directo escribiendo URL. | Se redirige a `/acceso-denegado`. |
| Reserva | Crear formulario hotel/restaurante. | Campos controlados y renderizado condicional. | Fecha pasada, guests, noches, email y teléfono. | Se agregaron validaciones y campos específicos por servicio. |
| ownerId | Asociar reserva al usuario activo. | `ownerId: user.id`. | Que el user no reciba todas las reservas. | `getUserReservations(ownerId)` consulta directamente el filtro en JSON Server. |
| Mis reservas | Listar reservas propias y cancelar pendientes. | Cards y PATCH de estado. | Que una confirmada no pueda cancelarse desde UI de cliente. | Solo se muestra cancelar cuando status es `Pendiente`. |
| Admin reservas | Tabla con todas las reservas y acciones. | Filtros, búsqueda y PATCH. | Estados y actualización inmediata de UI. | Se usan confirmaciones antes de cambiar estado. |
| Admin usuarios | Crear/eliminar usuarios. | Formulario y tabla. | Duplicados, password visible, borrar admin activo. | Se oculta password, se bloquea correo duplicado y no se elimina admin activo. |
| Seguridad | Explicar límites de JSON Server. | Advertencia inicial. | Diferencia autenticación/autorización. | Se documentó por qué no sirve como seguridad de producción. |

## Evidencia de revisión manual

Antes de considerar cada módulo terminado se revisaron:

1. Imports y rutas.
2. Nombres de propiedades en `db.json`.
3. Llamadas `GET`, `POST`, `PATCH` y `DELETE`.
4. Renderizado según `role`.
5. Casos sin sesión.
6. JSON Server apagado.
7. Filtros por `ownerId`.
8. Estados `Pendiente`, `Confirmada` y `Cancelada`.
