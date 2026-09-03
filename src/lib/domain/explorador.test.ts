import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ignoredExplorerParamLabels,
  parseExplorerQuery,
} from "./explorador";

describe("parseExplorerQuery", () => {
  it("applies defaults when the query is empty", () => {
    const query = parseExplorerQuery({});
    assert.equal(query.sort, "nombre");
    assert.equal(query.page, 1);
    assert.equal(query.pageSize, 12);
    assert.equal(query.q, undefined);
    assert.equal(query.camara, undefined);
    assert.equal(query.estado, undefined);
    assert.equal(query.distrito, undefined);
    assert.equal(query.anio, undefined);
  });

  it("keeps valid filters, sort and pagination", () => {
    const query = parseExplorerQuery({
      q: " Ana ",
      camara: "senadores",
      estado: "historico",
      distrito: "Santa Fe",
      anio: "2024",
      sort: "-neto",
      page: "2",
      page_size: "20",
    });
    assert.equal(query.q, "Ana");
    assert.equal(query.camara, "senadores");
    assert.equal(query.estado, "historico");
    assert.equal(query.distrito, "santa-fe");
    assert.equal(query.anio, 2024);
    assert.equal(query.sort, "-neto");
    assert.equal(query.page, 2);
    assert.equal(query.pageSize, 20);
  });

  it("falls back to defaults for invalid values", () => {
    const query = parseExplorerQuery({
      camara: "congreso",
      estado: "activo",
      anio: "1900",
      sort: "invalid",
      page: "-5",
      page_size: "abc",
    });
    assert.equal(query.camara, undefined);
    assert.equal(query.estado, undefined);
    assert.equal(query.anio, undefined);
    assert.equal(query.sort, "nombre");
    assert.equal(query.page, 1);
    assert.equal(query.pageSize, 12);
  });

  it("caps page_size at 100", () => {
    const query = parseExplorerQuery({ page_size: "999999" });
    assert.equal(query.pageSize, 100);
  });
});

describe("ignoredExplorerParamLabels", () => {
  it("names only invalid known parameters", () => {
    const labels = ignoredExplorerParamLabels({
      camara: "no-existe",
      sort: "fortuna",
      page: "-5",
    });
    assert.deepEqual(labels, ["cámara", "orden", "página"]);
  });

  it("ignores unknown parameters and valid filters", () => {
    const labels = ignoredExplorerParamLabels({
      foo: "bar",
      cuit: "20000000028",
      q: "ana",
      camara: "diputados",
    });
    assert.deepEqual(labels, []);
  });
});
