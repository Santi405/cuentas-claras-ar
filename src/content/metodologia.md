# Metodología — DDJJ Congreso

Criterios internos del producto. La versión pública está en `/metodologia`.

## Qué es

Herramienta de consulta. No reemplaza fuentes oficiales, no investiga, no acusa y no trata un cambio declarado como ilícito.

## Qué muestra / qué no

Personas con mandato nacional, declaraciones disponibles, bienes, deudas, neto derivado, evolución comparable, mandatos.

No: grupo familiar, datos reservados, scraping no autorizado, inferencias de mercado, acusaciones, perfiles generados por IA.

## Montos

Valores declarados, no riqueza real ni precio de mercado. Inmuebles y vehículos pueden usar criterio fiscal. Neto = bienes − deudas del mismo momento (cierre en anuales; inicio en iniciales).

## Evolución

Año faltante ≠ cero. No interpolar. Variación solo entre anuales consecutivas. Una rectificativa no duplica el año; se muestra la versión vigente.

## Vistas

- ARS nominal (predeterminada): pesos del período fiscal.
- IPC y USD: transformaciones analíticas. En mock, series demostrativas.

## Fuentes

Conceptuales: patrimonial (DJPI oficial, futura), parlamentaria (mandatos), macro (solo para conversiones). El mock no atribuye registros ficticios a un organismo.

## Identificadores

UUID interno, slug en la URL, CUIT solo para matching. Ver `/datos`.
