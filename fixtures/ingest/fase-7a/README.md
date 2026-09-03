# Fixtures Fase 7A

Muestras **sintéticas** con la forma observada en el snapshot DJPI 2024
(consulta 2026-09-03). No son filas de funcionarios reales.

- Encabezados de bienes/deudas copian los espacios posteriores a la coma del
  archivo oficial (` bien_importe`, ` deuda_importe`).
- El consolidado usa importes con hyphen decimal (`1000000-00`) y una fila
  duplicada con punto (`1000000.00`) para el mismo `dj_id`.
- `tipo_declaracion_jurada_id=1` con descripción `Anual` reproduce el mapeo
  real de 2024 (no el de la metadata OA).
- El archivo de grupo familiar existe solo para probar el rechazo. No hay
  datos reales de familia.

Origen de la estructura: portal
https://datos.jus.gob.ar/dataset/declaraciones-juradas-patrimoniales-integrales
y metadata en
https://github.com/datos-justicia-argentina/Declaraciones-Juradas-Patrimoniales-de-caracter-publico
