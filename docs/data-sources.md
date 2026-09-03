# Fuentes de datos oficiales — auditoría Fase 7A

Consulta: **2026-09-03**.

Este documento registra lo que se pudo **comprobar** en las fuentes oficiales,
no lo que el README del producto menciona. El portal sigue sirviendo el mock
ficticio. Nada de lo siguiente está publicado en la UI ni en `/api/v1`.

Estado de certeza:

- **comprobado**: inspeccionado en esta auditoría (metadata CKAN/GitHub y/o bytes reales)
- **diseñado**: regla de producto acordada, aún no persistida
- **desconocido**: no se pudo verificar sin un dump local completo o el origen bloqueó el acceso

---

## 1. Qué hay hoy en el repositorio

| Pieza | Qué es realmente | Qué no es |
| --- | --- | --- |
| `src/lib/data/mock/*.json` | Fixtures ficticios del producto | Fuente OA |
| `DATA_SOURCE=mock` (default) | Adapter JSON | Ingesta |
| `DATA_SOURCE=postgres` + seed | Copia del mock en Neon | Datos reales |
| `fixtures/ingest/*.csv` | CSV sintéticos del prototipo Fase 6/7 | Dump oficial |
| `src/lib/ingest/*` (antes de 7A) | Prototipo: parser en memoria, `Number()`, persistencia opt-in | Pipeline productivo |
| `ingest_review_queue` | Tabla mínima (`id`, `reason`, `payload`, `created_at`) | Cola de matching auditable |
| `npm run ingest` | Demo local sobre fixtures | Ingesta real |
| `/datos`, `/metodologia` | Texto de producto | Catálogo de snapshots |
| `/api/v1` | Contrato sobre el repository | API de ingesta |

No hay páginas nuevas ni cambios de UI en esta fase.

---

## 2. Fuente patrimonial (autoridad: Oficina Anticorrupción)

| Campo | Valor comprobado |
| --- | --- |
| Portal | https://datos.jus.gob.ar/dataset/declaraciones-juradas-patrimoniales-integrales |
| CKAN | https://datos.jus.gob.ar/api/3/action/package_show?id=declaraciones-juradas-patrimoniales-integrales |
| Dataset id | `4680199f-6234-4262-8a2a-8f7993bf784d` |
| Título | Declaraciones Juradas Patrimoniales Integrales de carácter público |
| Maintainer | Ministerio de Justicia. Oficina Anticorrupción (`uniddjjoa@jus.gov.ar`) |
| Licencia | CC-BY-4.0 |
| Metadata de columnas | https://github.com/datos-justicia-argentina/Declaraciones-Juradas-Patrimoniales-de-caracter-publico/blob/master/Declaraciones-Juradas-Patrimoniales-de-caracter-publico-metadata.md |
| `metadata_modified` CKAN | 2026-02-02T15:28:46Z |
| Frecuencia declarada | Anual |
| Sujetos | Obligados Ley 25.188 / 26.857, **incluye Poder Legislativo Nacional y candidatos a cargos electivos nacionales** |

CKAN no publica `size` ni `hash` de los recursos. Los tamaños y SHA-256 de abajo salen de `Content-Range` HTTP y de un hash local del archivo descargado a `/tmp` (no versionado).

### Inventario — CSV vigentes del portal (año fiscal 2024, “al 20251222”)

| Fuente | Recurso | Año | URL/origen | Snapshot (Last-Modified HTTP) | Formato | Bytes | Encoding | Delimitador | Columnas | Filas | SHA-256 | Estado |
| --- | --- | ---: | --- | --- | --- | ---: | --- | --- | ---: | ---: | --- | --- |
| OA / datos.jus.gob.ar | consolidado | 2024 | [resource `a331ccb8-…`](https://datos.jus.gob.ar/dataset/4680199f-6234-4262-8a2a-8f7993bf784d/resource/a331ccb8-5c13-447f-9bd6-d8018a4b8a62/download/declaraciones-juradas-2024-consolidado-al-20251222.csv) | 2026-02-02 14:02:25 GMT | CSV | 29 406 143 | UTF-8 BOM | coma | 57 | 66 376 | `904c746875746b6c14bd3d44427bd4081e7c3eb51970b53389f56d2dd354c2b4` | vigente; 1 fila malformada |
| OA | bienes | 2024 | [resource `ffa28585-…`](https://datos.jus.gob.ar/dataset/4680199f-6234-4262-8a2a-8f7993bf784d/resource/ffa28585-9adb-473e-9627-0ffe1938d288/download/declaraciones-juradas-bienes-2024-consolidado-al-20251222.csv) | 2026-02-02 15:24:55 GMT | CSV | 182 899 400 | UTF-8 BOM | coma | 13 | no contadas (archivo ~183 MB) | no calculado en esta auditoría | vigente; encabezado con espacios |
| OA | deudas | 2024 | [resource `dd1c30e2-…`](https://datos.jus.gob.ar/dataset/4680199f-6234-4262-8a2a-8f7993bf784d/resource/dd1c30e2-e773-47fd-ac80-9afaf3f1baa4/download/declaraciones-juradas-deudas-2024-consolidado-al-20251222.csv) | 2026-01-30 20:16:52 GMT | CSV | 6 542 341 | UTF-8 BOM | coma | 13 | 34 377 | `f47a1a058e44973a38dcc2dd3c47caae3a6c49a12df73ca110d7854e970fd5e0` | vigente; encabezado con espacios |
| OA | **grupo familiar** | 2024 | [resource `aeb174ff-…`](https://datos.jus.gob.ar/dataset/4680199f-6234-4262-8a2a-8f7993bf784d/resource/aeb174ff-26b5-4586-827f-872afdc52b49/download/declaraciones-juradas-grupo-familiar-2024-consolidado-al-20251222.csv) | 2026-01-30 20:17:28 GMT | CSV | 12 029 188 | UTF-8 BOM | coma | 12 | no contadas (excluido) | no calculado | **excluido del producto** |

Los cuatro recursos **no** comparten schema. Bienes y deudas añaden `periodo_inicio_cierre` e ítems; el consolidado añade decenas de columnas impositivas; el familiar añade `familiar_*`.

El ZIP 2024 (`70ce68db-…`, 141 660 999 bytes, 2026-01-30) **no es idéntico** a los CSV sueltos: los CSV de bienes del portal se actualizaron el 2026-02-02, después del ZIP.

### Inventario — ZIP históricos (portal)

Cada ZIP declara años 2012–AAAA en distintas combinaciones. Tamaños por `Content-Range`:

| Recurso | Año del ZIP | Bytes | Last-Modified HTTP | Notas comprobadas |
| --- | ---: | ---: | --- | --- |
| `declaraciones-juradas-2024.zip` | 2024 | 141 660 999 | 2026-01-30 | Consolidado 2012–2024; bienes 2022–2024; deudas 2022–2024; familiar 2022–2024 |
| `declaraciones-juradas-2023.zip` | 2023 | 137 192 123 | 2025-02-26 | Incluye bienes/deudas/familiar 2021–2023 y consolidados 2012–2023 |
| `declaraciones-juradas-2022.zip` | 2022 | 127 549 089 | 2024-06-13 | Bienes/deudas/familiar 2019–2022 + consolidados 2012–2022 |
| `declaraciones-juradas-2021.zip` | 2021 | 75 043 586 | 2025-02-26 | Archivo `…-2021-consolidado-al-20221207.csv` de **3 bytes** (corrupto/vacío) |
| `declaraciones-juradas-2020.zip` | 2020 | 113 432 287 | 2023-12-14 | Bienes/deudas/familiar 2018–2020 |
| `declaraciones-juradas-2019.zip` | 2019 | 302 484 789 | 2019-12-12 | Mezcla 20190524 (tamaños plausibles) y 20191115 con **uncompressed size idéntico 166 282 233** en muchos CSV: señal de corrupción o placeholder |
| `declaraciones-juradas-2018.zip` | 2018 | 33 235 722 | 2019-06-25 | No listado internamente en detalle en esta auditoría |
| `declaraciones-juradas-2017.zip` | 2017 | 24 716 882 | 2019-06-25 | ídem |
| `declaraciones-juradas-2016.zip` | 2016 | 18 464 537 | 2019-06-25 | Solo consolidados 2012–2015. **Drift de schema** (abajo) |

---

## 3. Estructura 2024 comprobada

### Consolidado (57 columnas)

Encabezado real (UTF-8 BOM, delimitador coma):

`dj_id,cuit,anio,tipo_declaracion_jurada_id,tipo_declaracion_jurada_descripcion,rectificativa,funcionario_apellido_nombre,sector,organismo,actividad_principal_ambito,cargo,desde,goza_de_licencia,fecha_inicio_licencia,horas_dedicacion,proveedor_contratista,total_bienes_inicio,deudas_inicio,total_bienes_final,total_deudas_final,diferencia_valuacion,ingresos_neto_gastos,ingresos_no_alcanzados,bienes_por_herencia,importes_deducidos,gastos_no_deducibles,gastos_personales,total_ingresos_c1,…,bienes_heredados`

Significado (metadata OA + observaciones 2024):

| Columna | Metadata OA | Observado 2024 |
| --- | --- | --- |
| `dj_id` | int, id de la DJ | Entero textual. **No es único**: 66 376 filas / 62 097 `dj_id` distintos / 4 278 ids repetidos |
| `cuit` | documentado como **int** | 11 dígitos **texto**, sin guiones. 0 vacíos en filas bien formadas. El producto lo guarda como `text` |
| `anio` | año de presentación | `2024` en este recurso |
| `tipo_declaracion_jurada_id` | 0 inicial, 1 baja, 2 anual | **Contradice la metadata**: `0=Inicial`, `1=Anual` (47 449), `2=Baja` (8 484) |
| `tipo_declaracion_jurada_descripcion` | Anual / Baja / Inicial | Usar **esta** columna para el tipo |
| `rectificativa` | cantidad de enmiendas | Enteros `0`–`7` observados (`0`: 61 603; `1`: 4 015; …) |
| `funcionario_apellido_nombre` | apellido y nombre | `APELLIDO NOMBRES` sin coma en las filas muestreadas |
| `organismo` / `cargo` | organismo y cargo | Muchos organismos de APN. Congreso es un recorte, no el universo |
| `desde` | metadata: `aaaa-mm` | Observado: **`aaaamm`** (`202305`). No inventar día |
| `goza_de_licencia` | SI / NO | SI / NO |
| Totales patrimoniales | float ARS | **Hyphen decimal**: `35278884-41` = 35 278 884.41; cero = `-00` |
| Columnas C1–C4 e ingresos | floats | Mismo hyphen decimal. Fuera del recorte público previsto |

1 fila malformada (`anio=0.00`, `cuit` de 9 caracteres, `rectificativa=0.00`).

### Bienes (13 columnas)

Encabezado real (hay **espacios después de comas**):

`dj_id,cuit,anio,…,periodo_inicio_cierre,bien_tipo,bien_descripcion, bien_origen_fondos, bien_titularidad, bien_importe`

La metadata lista `bien_descripcion` antes de `bien_tipo`. El archivo tiene **`bien_tipo` antes de `bien_descripcion`**. Parsear por nombre, no por posición.

| Columna | Significado | Observado |
| --- | --- | --- |
| `periodo_inicio_cierre` | I inicio / C cierre | `I` en la primera fila |
| `bien_titularidad` | % de titularidad | `100.00` |
| `bien_importe` | ARS **ya correspondiente al % de titularidad** (texto explícito de la metadata) | `1050000.00` (punto decimal, distinto del consolidado) |

**Regla:** no calcular `bien_importe × titularidad`.

### Deudas (13 columnas)

Encabezado con espacios: `deuda_tipo, deuda_descripcion, deuda_radicacion_localizacion, deuda_clasificacion, deuda_importe`.

34 377 filas. `deuda_importe` usa **punto decimal** en el 100 % de las filas (`3554270.60`). Metadata: tipo Común / Hipotecario / Prendario; radicación Argentina / Extranjera. El archivo usa `COMUN`, `ARGENTINA` (sin tilde) en la muestra.

### Grupo familiar (12 columnas) — excluido

`familiar_apellido_nombre`, `familiar_cuit`, `familiar_genero`, `familiar_fecha_nacimiento`, `familiar_parentesco`.

Muestra de encabezado (no se persiste, no se publica): parentesco `CONYUGE / CONVIVIENTE` (no exactamente `Cónyuge - Conviviente` de la metadata). Género `F`/`M`. Fecha `YYYY-MM-DD`.

El producto **no incorpora grupo familiar**. Hay denylist de filename, rechazo de columnas `familiar_*` y tests.

---

## 4. Cómo identificar una DDJJ y al declarante

**No** vale `1 fila CSV = 1 DDJJ`.

- Consolidado: una fila debería ser una declaración, pero 2024 **repite `dj_id`** con una segunda serialización de los mismos montos (hyphen vs punto). En 4 278 ids las dos filas son la misma persona/CUIT/tipo/rectificativa; los importes o son equivalentes tras normalizar o **difieren** (caso `9727054-00` vs `97270540.00`, factor 10). Eso es un error de fuente: **review**, no elegir la última fila.
- Bienes / deudas: muchas filas por `dj_id`.
- Clave lógica prevista: `dj_id` + `anio` + tipo (descripción) + `rectificativa` + CUIT canónico, después de colapsar pares de serialización **equivalentes**.
- El declarante se identifica por **CUIT** (11 dígitos, checksum AFIP). Nombre solo no identifica.
- Años 2012 del ZIP 2016: consolidado **sin `dj_id`** y columna `apellido_nombre`. Identidad más débil; no hay parser 2024 que sirva.

Rectificativas: existen `0,1,2,…,7` en 2024. No borrar versiones históricas en ingesta. La UI ya elige la vigente con `elegirDeclaracionesVisibles` (mayor rectificativa, prefiere anual).

---

## 5. Drift entre años (comprobado, no exhaustivo)

Comparación ZIP 2016 (archivos 2012–2015) vs CSV 2024:

| Cambio | Detalle |
| --- | --- |
| Delimitador | 2015: **TAB** + latin-1. 2012–2014 y 2024: coma + UTF-8 BOM |
| `dj_id` | Ausente en 2012. Presente desde 2013 |
| Nombre | `apellido_nombre` (2012–2015) vs `funcionario_apellido_nombre` (2024) |
| Tipo DJ | Ausente en 2012–2015. Presente en 2024 (`tipo_*`) |
| Importes 2015 | `0` y `1271206.42` (punto), no hyphen |
| Bienes/deudas | No están en el ZIP 2016; aparecen en recursos posteriores (metadata: desde ~2016) |
| Orden bienes | Metadata ≠ archivo 2024 |
| `tipo_id` | Metadata ≠ archivo 2024 |
| `desde` | Metadata `aaaa-mm` ≠ archivo 2024 `aaaamm` |
| ZIP 2019/2021 | Archivos internos rotos o tamaños imposibles |

Conclusión: **un parser 2024 no sirve para 2012–2015**. No hay un framework genérico de migración. 7B debe ramificar por encabezado observado (coma vs tab, presencia de `dj_id`/`tipo_*`).

Años relevantes disponibles en el portal: consolidados al menos 2012–2024 (vía ZIPs). Bienes/deudas “completos” de forma razonable a partir de ~2018–2019 según el ZIP, con huecos. El recorte del producto cubre legisladores actuales **e históricos** dentro de esas fuentes, no décadas anteriores a 2012.

---

## 6. Qué es del legislador vs del mandato vs de la familia

| Dominio | Fuente de autoridad | Columnas / recursos |
| --- | --- | --- |
| Patrimonio / DJ | OA DJPI | consolidado (totales), bienes, deudas |
| Identidad para matching | OA CUIT + padrón parlamentario | `cuit`, `funcionario_apellido_nombre` |
| Grupo familiar | OA (existe) | `familiar_*` — **no se publica, no se ingesta** |
| Mandato Diputados | Cámara de Diputados | datasets HCDN (abajo), no `organismo`/`cargo` de la DJPI |
| Mandato Senado | Senado | portal de datos abiertos (abajo); **schema no descargado en esta sesión** |
| Electoral | CNE (futuro) | no incorporado |
| IPC | INDEC (futuro) | no implementado |
| FX | BCRA Com. A 3500 (futuro) | no implementado |

`organismo` y `cargo` de la DJPI sirven como **filtro de recorte** y contexto, no como trayectoria parlamentaria.

---

## 7. Cámara de Diputados (autoridad de mandato)

Portal: https://datos.hcdn.gob.ar/dataset/legisladores  
CKAN package `legisladores` (`a80e0fa7-…`), Secretaría Parlamentaria, CC-BY, metadata 2026-08-18.

| Recurso | Bytes CKAN | Columnas comprobadas | Fechas |
| --- | ---: | --- | --- |
| `diputados_actuales2.0.csv` (`bed68ccd-…`) | 21 559 | `APELLIDO,NOMBRE,SEXO,DISTRITO,MANDATO,FECHA_DE_JURA,FECHA_DE_INICIO,BLOQUE` | `dd/mm/aaaa`, mandato `2025-2029` |
| `diputados1.9.csv` (`169de2eb-…`) | 389 992 | `ID,APELLIDO,NOMBRE,GENERO,DISTRITO,INICIO,FIN,JURAMENTO,CESE,BLOQUE,BLOQUE_INICIO,BLOQUE_FIN` | ISO `2009-12-10T00:00:00` (es **día**; persistir `date`, no timestamp de reloj) |
| JSON equivalentes | — | mismos recursos | — |

Los dos CSV de diputados **no comparten schema**. El histórico trae `ID` tipo `HCDN1136`. El actual no trae CUIT.

Bloques: https://datos.hcdn.gob.ar/dataset/bloques-interbloques-e-integracion

| Recurso | Encabezado comprobado |
| --- | --- |
| `listado_bloques_actualizado3.6.csv` | `BLOQUE,DIPUTADO_NOMBRE,DIPUTADO_APELLIDO,CARGO,CANTIDAD` |
| `listado_interbloques_actualizado0.6.csv` | `INTERBLOQUE,PRESIDENTE,CANTIDAD` |
| `composicion_actual_por_bloques3.6.csv` | `BLOQUE,APELLIDO,NOMBRE,PERIODO` |

---

## 8. Senado

Existe un micrositio oficial https://www.senado.gob.ar/micrositios/DatosAbiertos/ con “Listado de Senadores Vigentes” y “Listado Histórico de Senadores”. Un plan 2017 menciona exportaciones JSON/XLSX.

En esta auditoría:

- El fetch HTTP del micrositio fue **interrumpido por WAF** (`Acceso interrumpido`).
- Sí respondió `ExportarListadoAgentes/json`: es **personal/agentes** (`LEGAJO`, `APELLIDO Y NOMBRE`), no senadores.
- No se usó OpenSanctions ni repositorios de terceros como fuente primaria.

Estado: **desconocido** el schema machine-readable de senadores vigentes/históricos hasta un fetch exitoso. 7B debe reintentar el portal oficial, no scrapear HTML como plan A.

---

## 9. Series macro (solo punto de integración futuro)

No implementar en 7A. Las transformaciones se mantienen separadas del ARS declarado.

| Uso | Autoridad | Punto de partida |
| --- | --- | --- |
| IPC | INDEC | Series de tiempo APN: https://www.argentina.gob.ar/datos-abiertos/api-series-de-tiempo y catálogo INDEC |
| Tipo de cambio de referencia | BCRA Com. A 3500 | Estadísticas BCRA / misma API de series cuando el id esté confirmado |

No mezclar IPC/FX con `bien_importe` en el mismo paso de parseo.

---

## 10. Respuestas directas

1. **Archivos oficiales:** CSV 2024 consolidado/bienes/deudas/familiar + ZIPs 2016–2024 + Diputados (actual, histórico, bloques). Senado: portal existe, dump no verificado.
2. **Estructura:** ver §3–§5. No asumir igualdad entre recursos ni entre años.
3. **Columnas:** 57 / 13 / 13 / 12 en 2024; trim de espacios en bienes/deudas/familiar.
4. **Significado:** metadata GitHub OA, con las contradicciones documentadas (`tipo_id`, `desde`, orden bienes, cuit como int).
5. **Años:** consolidados 2012–2024 en ZIPs; bienes/deudas según ZIP, con huecos.
6. **Identificar DDJJ:** `dj_id` + año + tipo descripción + rectificativa, deduplicando serializaciones equivalentes.
7. **Identificar declarante:** CUIT canónico validado; nunca el nombre solo.
8. **Diferencias entre años:** §5.
9. **Grupo familiar:** recurso propio y columnas `familiar_*`. Excluido.
10. **Legislador (patrimonio):** filas DJPI cuyo `organismo`/`cargo` pasan el recorte Congreso, asociadas por CUIT a una persona del padrón parlamentario.
11. **Mandatos:** HCDN / Senado, no DJPI.
12. **Matching:** ver `docs/data-ingestion.md`.
13. **Automatizable:** CUIT válido + persona existente con ese CUIT + nombre alineado + no familia.
14. **Review:** CUIT ausente/inválido, CUIT nuevo, nombre discrepante, montos duplicados contradictorios, schema drift, filas malformadas.
15. **Versionado de snapshot:** `source/dataset/fiscal_year/retrieved_at/sha256`. Nunca `latest.csv`.
16. **Reproducir:** guardar el archivo con ese id, correr `npm run ingest:inspect`, no persistir hasta 7B.
17. **Errores antes de publicar:** validación de archivo/CSV/datos con ERROR/WARNING/INFO; exclusión familiar; no `Number()`; no silent zero; cola de review (schema a completar en 7B).
