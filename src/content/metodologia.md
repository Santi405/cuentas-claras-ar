# Metodología — DDJJ Congreso

Este archivo documenta los criterios del producto. La versión pública está en `/metodologia`.

## Fuentes

- DJPI (OA / datos.jus.gob.ar): montos, bienes, deudas, dj_id, CUIT.
- Cámaras: mandatos, distrito, bloque.
- CNE: listas (fase posterior).

## Cálculos

- Neto = bienes − deudas del mismo momento.
- Variación interanual solo entre anuales consecutivas.
- Default: ARS nominal. IPC y USD son vistas opcionales.
- USD: BCRA Com. A 3500 al 31/12. Nunca dólar paralelo.

## Exclusiones

- Grupo familiar / anexo reservado.
- Rankings de enriquecimiento.

## Identificadores

- Interno: UUID.
- Público: slug. CUIT nunca en la URL.
