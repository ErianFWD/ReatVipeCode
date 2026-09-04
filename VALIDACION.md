# Validación de entrega

La estructura fue revisada antes de empaquetar.

- 23 archivos JavaScript/JSX parseados correctamente con parser JSX.
- 0 imports locales faltantes.
- `package.json` válido.
- `db.json` válido.
- Todos los `ownerId` demo corresponden a usuarios existentes.
- Estados demo limitados a `Pendiente`, `Confirmada` y `Cancelada`.
- Tipos demo limitados a `hotel` y `restaurant`.
- Rutas requeridas presentes en `App.jsx`.

## Validación local final recomendada

```bash
npm install
npm run build
```

Después, en dos terminales:

```bash
npm run server
```

```bash
npm run dev
```

El build con dependencias no se ejecuta dentro de este entorno si el registro npm no está disponible; por eso la comprobación final de Vite debe hacerse en la computadora donde se realizará la entrega.
