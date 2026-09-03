# Pipeline de datos reales — diseño Fase 7A

La Fase 7A **no ingesta** en la base de producción ni publica datos reales.
Deja un discovery reproducible (`npm run ingest:inspect`) y reglas que 7B
debe respetar.

Contrato de columnas 2024: `src/lib/ingest/schema-contract.ts` (no hay un
tercer documento duplicado).

---

## Flujo

```text
FUENTE
  ↓
SNAPSHOT
  ↓
VALIDACIÓN
  ↓
NORMALIZACIÓN
  ↓
IDENTIDAD
  ↓
MATCHING
  ↓
REVIEW
  ↓
PERSISTENCIA
  ↓
PUBLICACIÓN
```

| Paso | Estado | Evidencia |
| --- | --- | --- |
| FUENTE | comprobado | CKAN OA, metadata GitHub, HCDN; Senado ⚠ portal bloqueado |
| SNAPSHOT | diseñado + inspect local | Identidad `source/dataset/year/retrieved_at/sha256`. Inspect calcula hash. No hay downloader automático |
| VALIDACIÓN | comprobado en código sobre fixtures; reglas alineadas al dump 2024 | `inspect` + `schema-contract` + parsers. El CSV de 183 MB de bienes no se recorrió entero |
| NORMALIZACIÓN | comprobado para CUIT y montos observados | `parseCuit`, `parseMoney`. Texto solo para matching (`raw` se conserva) |
| IDENTIDAD | comprobado 2024; 2012 ⚠ sin `dj_id` | `identityFromRow` |
| MATCHING | diseñado e implementado como reglas, no corrido contra el padrón real | `decideMatch` — auto solo CUIT exacto |
| REVIEW | diseñado; tabla actual insuficiente | Documentado, **sin migración** |
| PERSISTENCIA | no implementada para datos reales | `INGEST_ALLOW_PERSIST` bloquea el prototipo |
| PUBLICACIÓN | no implementada | UI/API/mock sin cambios; sin CSV/JSON/ZIP públicos nuevos |

---

## Qué existe vs qué es prototipo

`npm run ingest` sigue siendo una demo sobre `fixtures/ingest`. Lee CSV
sintéticos, omite familia, y **no persiste** salvo
`INGEST_ALLOW_PERSIST=true` + `DATA_SOURCE=postgres`. No usarlo contra una
base compartida. No ejecutar `db:seed` sobre datos reales. No poner
`DEMO_MODE=false`.

`npm run ingest:inspect -- <archivo.csv>` es el comando de 7A: solo lectura,
sin PostgreSQL, sin HTTP.

---

## Snapshot

Cada archivo real se identifica con:

```text
source        oficina_anticorrupcion_djpi | camara_diputados | senado (cuando exista)
dataset       djpi_consolidado | djpi_bienes | djpi_deudas | …
fiscal_year   2024
retrieved_at  ISO de la consulta
source_url    URL CKAN del recurso
sha256        del archivo
filename      nombre local, no el remoto ciego
```

Directorio sugerido (fuera de Git):

```text
data/snapshots/<source>/<dataset>/<fiscal_year>/<yyyy-mm-dd>/<sha256-12>/archivo.csv
```

Nunca sobrescribir un snapshot anterior en silencio. Nunca usar `latest.csv`
como única referencia. El ZIP y los CSV sueltos del mismo “año fiscal” pueden
diferir en `Last-Modified`.

`fuentes` (tabla actual: `nombre`, `url`, `snapshot_date`, `archivo`,
`archivo_hash`) alcanza como provenance de producto si 7B guarda un registro
por archivo inspectado. No crear un sistema paralelo. Falta, si se necesita,
un id de snapshot compuesto y el `source_row_identifier` en la cola de review.

---

## Validación (antes de PostgreSQL)

Niveles: `ERROR` / `WARNING` / `INFO`. No todo es fatal.

**Archivo:** existe, no vacío, es un file regular, tamaño ≤ 600 MB, hash
calculable. Inspect rechaza URLs (no hay downloader).

**CSV:** encoding (UTF-8 BOM comprobado en 2024; latin-1 + TAB en 2015),
delimitador, encabezado, columnas requeridas, columnas inesperadas, cantidad
de campos por fila, campos demasiado largos.

**Datos:** año `dddd` en rango; `dj_id` dígitos; CUIT vacío / inválido /
checksum; `rectificativa` entero (no `0.00`); importes con `parseMoney`;
`desde` se trata como mes (`aaaamm` o `aaaa-mm`) sin inventar día; enums
conocidos (`I`/`C`, tipos de deuda) como WARNING si no coinciden.

Grupo familiar: `ERROR` y exclusión. No hay samples de filas familiares.

---

## Normalización

### CUIT = text

Canonical: 11 dígitos con checksum AFIP. Formatos demostrados:
`20123456783` y `20-12345678-3`. No pad de valores cortos. No `integer`.
El `raw` se conserva en el informe / futura review.

### Montos

No usar `Number(value)` sobre el string crudo.

| Origen | Formato observado | Ejemplo |
| --- | --- | --- |
| Consolidado 2024 | hyphen decimal | `35278884-41` |
| Consolidado 2024 cero | `-00` | 0.00 |
| Bienes / deudas 2024 | punto | `1050000.00`, `3554270.60` |
| ZIP 2015 | entero o punto | `0`, `1271206.42` |

Vacío ≠ 0. Si no se puede parsear: ERROR / review, no “corregir”.

Duplicados `dj_id` hyphen vs punto: si los montos normalizados son iguales,
colapsar con WARNING. Si difieren (p. ej. `9727054-00` vs `97270540.00`):
**conflicto de fuente**, review, no elegir en silencio.

### Titularidad

`bien_importe` ya es el ARS del porcentaje declarado. Prohibido multiplicar.
Test de regresión en `ownership.test.ts`.

### Texto (solo matching)

`normalizeNombre`: NFD, sin diacríticos, minúsculas, espacios colapsados.
El valor original no se pisa.

### Fechas

- DJPI `desde`: precisión mes. Guardar `aaaa-mm` o `aaaamm` como mes, no
  `timestamp`.
- HCDN actual: `dd/mm/aaaa` → `date`.
- HCDN histórico: `2009-12-10T00:00:00` es un día; persistir `date`.
- Familiar `YYYY-MM-DD`: no se ingesta.

---

## Identidad de la declaración

```text
dj_id + anio + tipo(descripcion) + rectificativa + cuit
```

`tipo_declaracion_jurada_id` no se usa como autoridad: en 2024, `1` es Anual
y la metadata dice que `1` es baja.

Rectificativa: conservar `0..n`. La UI muestra la vigente
(`elegirDeclaracionesVisibles`). La ingesta no borra las anteriores.

Invariantes patrimoniales (7B, al persistir): importes parseados ≥ 0 cuando
la fuente no trae negativos. No inventar ceros. No imponer reglas financieras
que la OA no garantice.

---

## Matching (determinista)

```text
DJPI (recorte Congreso)
  → CUIT presente y válido
      → persona existente con ese CUIT
          → nombre alineado (variantes exactas normalizadas)
              → AUTO MATCH
          → nombre no alineado → REVIEW (cuit_nombre_discrepante)
      → no hay persona → REVIEW (cuit_sin_persona)  // no crear, no merge
  → CUIT ausente o inválido → REVIEW  // nunca auto
```

Nombre parecido **nunca** auto-match. No hay scoring.

Una ingesta no cambia persona, CUIT, slug ni fusiona identidades. Completar
un CUIT nulo en una persona conocida es un cambio: **review**.

Filtro `looksLikeLegisladorNacional` es recorte, no identidad. El DJPI cubre
toda la APN; sin filtro la cola se inunda. El recorte incluye históricos
cuando el cargo/organismo lo indican y el padrón parlamentario tenga a la
persona (no solo “en ejercicio”).

Autoridad por atributo, no global:

| Atributo | Gana | Conflicto |
| --- | --- | --- |
| Patrimonio, totales, ítems DJ | OA | registrar + conservar provenance |
| Mandato diputados | HCDN | no pisar con `organismo` DJPI |
| Mandato senado | Senado | ídem |
| Electoral | CNE (si se suma) | — |
| IPC / FX | INDEC / BCRA | nunca pisan ARS original |

---

## Review queue

Tabla actual `ingest_review_queue`: `id`, `reason`, `payload`, `created_at`.

Necesario en 7B (migración mínima, no ahora):

```text
source
source_row_identifier   # snapshot + número de fila o dj_id
candidate_person_id     # nullable
reason
status                  # pending | approved | rejected
payload                 # fragmento, no el CSV entero
created_at
reviewed_at
```

No guardar el CSV completo en Postgres. Referenciar snapshot + id de fila +
campos de revisión (nombre, CUIT raw, organismo, cargo, montos parseados).

---

## Schema Postgres

No se migra en 7A.

Incompatibilidades documentadas para 7B:

1. `declaraciones_source_dj_uidx` único en `source_dj_id` **choca** con 4 278
   `dj_id` repetidos en el consolidado 2024. Deduplicar serializaciones
   equivalentes *antes* de insertar; los conflictos van a review. El unique
   debería ser por `(fuente_id, source_dj_id)` después de ese colapso.
2. Cola de review incompleta (arriba).
3. `desde` mes vs columnas `date` de mandatos: no forzar día 1.
4. CUIT ya es `text`. Importes ya son `numeric`. No cambiar a integer/float.

Mock y Postgres del producto siguen en el dataset ficticio.

---

## Grupo familiar — salvaguardas

No basta “no usamos esa tabla”:

1. Filename `grupo[-_ ]?familiar` → archivo excluido.
2. Cualquier columna `familiar_*` → archivo excluido aunque se llame bienes.
3. Tests en `family.test.ts` e `inspect.test.ts`.
4. Inspect no imprime sample rows de familia.

---

## Seguridad

- Inspect: path local, `realpath`, file regular, techo de tamaño, no URLs.
- No hay endpoint HTTP de ingesta.
- No se interpola CSV en SQL en 7A (no hay persistencia real).
- No ejecutar shell con nombres de archivo remotos.
- No descargar en bucle ni cron.
- Bienes ~183 MB: inspect **stremea**; no carga el archivo entero en un string.
- Campos > 50 000 caracteres se recortan y marcan.

---

## Observabilidad y automatización

Scripts Node/TypeScript locales. No Kafka, Airflow, Spark ni warehouse.
No cron de descarga anual hasta que el run manual sea correcto.

---

## Listo para 7B

7B puede empezar cuando un operador pueda:

1. Descargar a mano un CSV oficial a `data/snapshots/…`
2. Correr `npm run ingest:inspect -- <path>`
3. Leer este documento y `docs/data-sources.md`
4. Saber qué filas serían auto-match vs review
5. Saber que familia, macro, descargas públicas y UI real **no** entran aún

7B no está en el alcance de este cambio.
