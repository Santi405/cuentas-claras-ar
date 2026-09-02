# Cuentas Claras AR

Un seguimiento simple de ingresos y gastos en **pesos argentinos (ARS)**. Registrá
movimientos, mirá tu balance del período y desglosá los gastos por categoría.

Aplicación full-stack construida con **Next.js (App Router) + TypeScript + Tailwind CSS**
y persistencia local en **SQLite** (`better-sqlite3`), sin depender de servicios externos.

## Requisitos

- Node.js 22+
- npm 10+

No se necesitan secretos ni bases de datos externas: la base SQLite se crea
automáticamente en `data/cuentas.db` en el primer arranque y se siembra con datos de ejemplo.

## Puesta en marcha

```bash
npm ci          # instalar dependencias (compila better-sqlite3)
npm run dev     # servidor de desarrollo en http://localhost:3000
```

## Scripts

| Script            | Descripción                                      |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Servidor de desarrollo (hot reload).             |
| `npm run build`   | Build de producción.                             |
| `npm start`       | Servir el build de producción.                   |
| `npm run lint`    | ESLint (config de Next.js).                      |
| `npm run typecheck` | Chequeo de tipos con TypeScript (`tsc --noEmit`). |

## API

| Método   | Ruta                      | Descripción                        |
| -------- | ------------------------- | ---------------------------------- |
| `GET`    | `/api/transactions`       | Lista todos los movimientos.       |
| `POST`   | `/api/transactions`       | Crea un movimiento.                |
| `DELETE` | `/api/transactions/:id`   | Elimina un movimiento por ID.      |

Ejemplo:

```bash
curl -s http://localhost:3000/api/transactions | jq
curl -s -X POST http://localhost:3000/api/transactions \
  -H 'Content-Type: application/json' \
  -d '{"type":"expense","description":"Café","category":"Comida","amount":3500,"date":"2026-09-02"}'
```

## Estructura

```
app/                 Rutas y páginas (App Router)
  api/transactions/  Endpoints REST
components/           Componentes de UI
lib/                 Acceso a datos (SQLite), tipos y formateo
data/                Base SQLite (generada, ignorada por git)
```

## Licencia

MIT — ver [LICENSE](./LICENSE).
