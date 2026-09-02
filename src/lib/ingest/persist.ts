import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/data/postgres/db";
import * as t from "@/lib/data/postgres/schema";
import type { IngestResult } from "./pipeline";

export async function persistIngestResult(result: IngestResult): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();

  for (const item of result.review) {
    await db.insert(t.ingestReviewQueue).values({
      id: randomUUID(),
      reason: item.reason,
      payload: JSON.stringify(item),
      createdAt: now,
    });
  }

  const fuenteId = randomUUID();
  const first = result.declaraciones[0];
  if (first) {
    await db.insert(t.fuentes).values({
      id: fuenteId,
      nombre: "Ingesta DJPI",
      url: "https://datos.jus.gob.ar/dataset/declaraciones-juradas-patrimoniales-integrales",
      snapshotDate: now.slice(0, 10),
      archivo: first.archivo,
      archivoHash: first.archivoHash,
    });
  }

  for (const d of result.declaraciones) {
    const declId = randomUUID();
    await db.insert(t.declaraciones).values({
      id: declId,
      personaId: d.personaId,
      anioFiscal: d.anioFiscal,
      tipo: d.tipo,
      fuenteId,
      sourceDjId: d.sourceDjId,
      rectificativa: d.rectificativa,
      periodo: d.tipo === "inicial" ? "I" : "C",
      organismoDeclarado: d.organismoDeclarado,
      cargoDeclarado: d.cargoDeclarado,
      bienesInicio: String(d.bienesInicio),
      bienesCierre: String(d.bienesCierre),
      deudasInicio: String(d.deudasInicio),
      deudasCierre: String(d.deudasCierre),
    });
    for (const b of result.bienes.filter((x) => x.sourceDjId === d.sourceDjId)) {
      await db.insert(t.bienes).values({
        id: randomUUID(),
        declaracionId: declId,
        tipo: b.tipo,
        descripcion: b.descripcion,
        origenFondos: b.origenFondos,
        titularidadPct: b.titularidadPct === null ? null : String(b.titularidadPct),
        importeArs: String(b.importeArs),
      });
    }
    for (const debt of result.deudas.filter((x) => x.sourceDjId === d.sourceDjId)) {
      await db.insert(t.deudas).values({
        id: randomUUID(),
        declaracionId: declId,
        tipo: debt.tipo,
        descripcion: debt.descripcion,
        radicacion: debt.radicacion,
        clasificacion: debt.clasificacion,
        importeArs: String(debt.importeArs),
      });
    }
  }
}
