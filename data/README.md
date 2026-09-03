# Snapshots locales

Los CSV oficiales de DJPI pesan decenas o cientos de megabytes. No se
versionan en Git.

Colocar descargas manuales en `data/snapshots/` con un directorio que identifique
fuente, dataset, año fiscal y fecha de recuperación. Ejemplo:

```text
data/snapshots/oficina_anticorrupcion_djpi/djpi_consolidado/2024/2026-09-03/
```

Nunca usar `latest.csv` como única referencia. El identificador del snapshot
incluye `sha256` (ver `docs/data-ingestion.md`).
