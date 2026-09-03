import { familyExclusionReason, familiarColumns } from "./family";
import { issue, type Issue } from "./issues";

export const DJPI_SOURCE = "oficina_anticorrupcion_djpi";

export const CONSOLIDADO_2024_COLUMNS = [
  "dj_id",
  "cuit",
  "anio",
  "tipo_declaracion_jurada_id",
  "tipo_declaracion_jurada_descripcion",
  "rectificativa",
  "funcionario_apellido_nombre",
  "sector",
  "organismo",
  "actividad_principal_ambito",
  "cargo",
  "desde",
  "goza_de_licencia",
  "fecha_inicio_licencia",
  "horas_dedicacion",
  "proveedor_contratista",
  "total_bienes_inicio",
  "deudas_inicio",
  "total_bienes_final",
  "total_deudas_final",
  "diferencia_valuacion",
  "ingresos_neto_gastos",
  "ingresos_no_alcanzados",
  "bienes_por_herencia",
  "importes_deducidos",
  "gastos_no_deducibles",
  "gastos_personales",
  "total_ingresos_c1",
  "total_gastos_c1",
  "ingreso_neto_renta_sueldo_c1",
  "total_ingresos_c2",
  "total_gastos_c2",
  "ingreso_neto_renta_capitales_c2",
  "total_ingresos_c3",
  "total_gastos_c3",
  "ingreso_neto_renta_empresa_c3",
  "total_ingresos_c4",
  "total_gastos_c4",
  "ingreso_neto_renta_trabajo_personal_c4",
  "total_ingreso_neto_c1234",
  "desgravaciones",
  "deducciones_generales",
  "seguro_vida",
  "gastos_sepelio",
  "aportes_obras_sociales",
  "deducciones_servicio_domestico",
  "cuota_medico_asistencial",
  "donaciones_fiscos",
  "fondos_jubilacion",
  "pagos_trabajadores_autonomos",
  "honorarios_asistencia_medica",
  "intereses_creditos_hipotecarios",
  "aportes_sociedades_garantias_reciprocas",
  "otros",
  "ingresos_trabajos_alquileres_rentas",
  "ingresos_no_alcanzados_por_ig",
  "bienes_heredados",
] as const;

export const BIENES_2024_COLUMNS = [
  "dj_id",
  "cuit",
  "anio",
  "tipo_declaracion_jurada_id",
  "tipo_declaracion_jurada_descripcion",
  "rectificativa",
  "funcionario_apellido_nombre",
  "periodo_inicio_cierre",
  "bien_tipo",
  "bien_descripcion",
  "bien_origen_fondos",
  "bien_titularidad",
  "bien_importe",
] as const;

export const DEUDAS_2024_COLUMNS = [
  "dj_id",
  "cuit",
  "anio",
  "tipo_declaracion_jurada_id",
  "tipo_declaracion_jurada_descripcion",
  "rectificativa",
  "funcionario_apellido_nombre",
  "periodo_inicio_cierre",
  "deuda_tipo",
  "deuda_descripcion",
  "deuda_radicacion_localizacion",
  "deuda_clasificacion",
  "deuda_importe",
] as const;

export const FAMILIAR_2024_COLUMNS = [
  "dj_id",
  "cuit",
  "anio",
  "tipo_declaracion_jurada_id",
  "tipo_declaracion_jurada_descripcion",
  "rectificativa",
  "funcionario_apellido_nombre",
  "familiar_apellido_nombre",
  "familiar_cuit",
  "familiar_genero",
  "familiar_fecha_nacimiento",
  "familiar_parentesco",
] as const;

export const CONSOLIDADO_REQUIRED = [
  "dj_id",
  "cuit",
  "anio",
  "tipo_declaracion_jurada_descripcion",
  "rectificativa",
  "funcionario_apellido_nombre",
  "organismo",
  "cargo",
  "total_bienes_inicio",
  "deudas_inicio",
  "total_bienes_final",
  "total_deudas_final",
] as const;

export const BIENES_REQUIRED = [
  "dj_id",
  "periodo_inicio_cierre",
  "bien_tipo",
  "bien_descripcion",
  "bien_titularidad",
  "bien_importe",
] as const;

export const DEUDAS_REQUIRED = [
  "dj_id",
  "periodo_inicio_cierre",
  "deuda_tipo",
  "deuda_descripcion",
  "deuda_importe",
] as const;

export type DjpiResourceKind =
  | "consolidado"
  | "bienes"
  | "deudas"
  | "grupo_familiar"
  | "unknown";

export function detectResourceKind(
  filename: string,
  headers: string[],
): DjpiResourceKind {
  if (familyExclusionReason(filename, headers)) return "grupo_familiar";
  const set = new Set(headers);
  if (set.has("bien_importe") || set.has("bien_descripcion")) return "bienes";
  if (set.has("deuda_importe") || set.has("deuda_descripcion")) return "deudas";
  if (set.has("total_bienes_final") || set.has("total_bienes_inicio")) {
    return "consolidado";
  }
  const lower = filename.toLowerCase();
  if (/bienes/.test(lower)) return "bienes";
  if (/deudas/.test(lower)) return "deudas";
  if (/consolidado/.test(lower) || /declaraciones-juradas-\d{4}-consolidado/.test(lower)) {
    return "consolidado";
  }
  return "unknown";
}

export function expectedColumns(kind: DjpiResourceKind): readonly string[] {
  switch (kind) {
    case "consolidado":
      return CONSOLIDADO_2024_COLUMNS;
    case "bienes":
      return BIENES_2024_COLUMNS;
    case "deudas":
      return DEUDAS_2024_COLUMNS;
    case "grupo_familiar":
      return FAMILIAR_2024_COLUMNS;
    default:
      return [];
  }
}

export function requiredColumns(kind: DjpiResourceKind): readonly string[] {
  switch (kind) {
    case "consolidado":
      return CONSOLIDADO_REQUIRED;
    case "bienes":
      return BIENES_REQUIRED;
    case "deudas":
      return DEUDAS_REQUIRED;
    default:
      return [];
  }
}

export function validateHeaders(
  filename: string,
  headers: string[],
): { kind: DjpiResourceKind; issues: Issue[]; excluded: boolean } {
  const issues: Issue[] = [];
  const family = familyExclusionReason(filename, headers);
  if (family) {
    issues.push(
      issue(
        "ERROR",
        family,
        family === "archivo_grupo_familiar"
          ? `Recurso de grupo familiar excluido: ${filename}`
          : `Columnas familiares presentes: ${familiarColumns(headers).join(", ")}`,
      ),
    );
    return { kind: "grupo_familiar", issues, excluded: true };
  }

  const kind = detectResourceKind(filename, headers);
  if (kind === "unknown") {
    issues.push(
      issue(
        "WARNING",
        "recurso_desconocido",
        "No se pudo clasificar el CSV como consolidado, bienes o deudas",
      ),
    );
    return { kind, issues, excluded: false };
  }

  const headerSet = new Set(headers);
  const required = requiredColumns(kind);
  for (const col of required) {
    if (!headerSet.has(col)) {
      issues.push(
        issue("ERROR", "columna_requerida_ausente", `Falta columna requerida ${col}`, {
          column: col,
        }),
      );
    }
  }

  const expected = new Set(expectedColumns(kind));
  for (const col of headers) {
    if (!expected.has(col)) {
      issues.push(
        issue(
          "WARNING",
          "columna_inesperada",
          `Columna no presente en el contrato 2024: ${col}`,
          { column: col },
        ),
      );
    }
  }
  for (const col of expected) {
    if (!headerSet.has(col)) {
      issues.push(
        issue(
          "INFO",
          "columna_2024_ausente",
          `El snapshot 2024 incluye ${col} y este archivo no`,
          { column: col },
        ),
      );
    }
  }

  if (headers.includes("apellido_nombre") && !headers.includes("funcionario_apellido_nombre")) {
    issues.push(
      issue(
        "WARNING",
        "schema_drift_nombre",
        "Columna apellido_nombre (snapshots antiguos) en lugar de funcionario_apellido_nombre",
        { column: "apellido_nombre" },
      ),
    );
  }

  return { kind, issues, excluded: false };
}
