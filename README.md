# Cuentas Claras 🇦🇷

Una app para **dividir gastos compartidos** entre amigos y saldar cuentas, pensada para
pesos argentinos (ARS). Creá un grupo, cargá los gastos indicando quién pagó y entre
quiénes se divide, y la app calcula los balances y sugiere la forma más simple de saldar.

Construida con **Next.js 16 (App Router)**, **React 19**, **TypeScript** y **Tailwind CSS 4**.

## Requisitos

- Node.js 22+
- [pnpm](https://pnpm.io/) 10+

## Puesta en marcha

```bash
pnpm install
pnpm dev
```

Abrí [http://localhost:3000](http://localhost:3000).

Los datos se guardan en un archivo local JSON en `.data/db.json` (ignorado por git),
que se siembra con un grupo de ejemplo la primera vez.

## Scripts

| Script | Descripción |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo con recarga en caliente |
| `pnpm build` | Build de producción |
| `pnpm start` | Sirve el build de producción |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | Chequeo de tipos con TypeScript |

## API

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/groups` | Lista los grupos |
| `POST` | `/api/groups` | Crea un grupo |
| `GET` | `/api/groups/:id` | Grupo + balances + sugerencias de pago |
| `POST` | `/api/groups/:id/members` | Agrega un integrante |
| `POST` | `/api/groups/:id/expenses` | Agrega un gasto |
| `DELETE` | `/api/groups/:id/expenses/:expenseId` | Elimina un gasto |

Los montos se manejan internamente en centavos (enteros) para evitar errores de redondeo.

## Estructura

```
src/
  app/            # Rutas (App Router) y route handlers de la API
  components/     # Componentes de cliente (formularios, detalle de grupo)
  lib/            # Lógica de dominio: store, balances, formato de moneda
```
