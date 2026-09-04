# Reflexión de grupo — ReservaPro

## 1. ¿Qué funcionalidades prototipamos con IA?

Utilizamos IA principalmente para acelerar la estructura inicial del proyecto, el formulario de login, AuthContext, rutas protegidas, formularios de reservas, filtros administrativos y componentes reutilizables. La IA ayudó a generar una primera versión funcional que luego fue revisada manualmente.

## 2. ¿Qué partes revisamos manualmente?

Revisamos la forma en que se comparte la sesión, los redirects de React Router, todas las llamadas a JSON Server, la asociación de `ownerId`, los cambios de estado de las reservas, el filtrado de datos y las acciones disponibles según el rol.

## 3. ¿En qué se equivocó o podía equivocarse la IA?

Un riesgo era cargar todas las reservas en el cliente y filtrarlas únicamente visualmente. Aunque la seguridad sigue siendo simulada, para el flujo académico se mejoró la consulta del usuario usando `/reservations?ownerId=ID`. También fue necesario revisar fechas, campos específicos de hotel/restaurante y el estado inicial durante la restauración de localStorage.

## 4. ¿Cómo detectamos los errores?

Probamos credenciales válidas e inválidas, acceso directo a rutas administrativas con un usuario estándar, creación de reservas, cancelaciones, recarga del navegador, filtros y comportamiento con JSON Server detenido.

## 5. ¿Por qué esta autorización NO es segura en producción?

Porque el navegador controla gran parte de la lógica. JSON Server no valida realmente que el usuario que hace una petición tenga el rol indicado. Además, las contraseñas están disponibles en el archivo de datos y no existe un sistema seguro de sesiones o tokens.

## 6. ¿Qué necesitaríamos en un backend real?

Un backend con autenticación server-side, contraseñas hasheadas, sesiones o JWT seguros, validación de permisos en cada endpoint, base de datos protegida, HTTPS y validación de todos los datos recibidos.

## 7. ¿Cómo distribuimos el trabajo?

La propuesta es dividir el trabajo entre integración, autenticación, autorización/rutas y datos/UI. Aunque cada integrante lidere un frente, todos deben revisar el sistema completo porque cualquiera puede recibir preguntas durante la defensa.

## 8. ¿Cómo utilizamos Git y Pull Requests?

Trabajamos en ramas pequeñas de funcionalidad, hacemos commits descriptivos, `pull` antes de continuar y al menos un Pull Request debe ser revisado por otro integrante antes de fusionarse a `main`.
