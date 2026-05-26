import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { statsFor } from "../src/stats.js";
import { toMarkdown, toSummary } from "../src/format.js";
import type { McpToolsListResult } from "../src/types.js";

const here = fileURLToPath(new URL(".", import.meta.url));
const list = (name: string): McpToolsListResult =>
  JSON.parse(readFileSync(`${here}/../fixtures/${name}`, "utf8")) as McpToolsListResult;

describe("statsFor", () => {
  it("counts tools and basic posture metrics", () => {
    const s = statsFor(list("tools-list.json"), "2026-05-27T08:00:00Z");
    expect(s.tools).toBe(4);
    expect(s.schemaLess).toBe(1); // "version" has no inputSchema
    expect(s.missingDescription).toBe(2); // ping + version
    expect(s.emptySchema).toBe(1); // ping (has schema but no properties)
  });

  it("tallies top-level + total property counts", () => {
    const s = statsFor(list("tools-list.json"), "2026-05-27T08:00:00Z");
    const sv = s.perTool.find((t) => t.name === "search-vectorstore");
    expect(sv?.topLevelProperties).toBe(3); // query, top_k, filter
    // total = query + top_k + filter (1 obj) + namespace + tags (1 array) + (items: 1 string)
    // walk: filter.props (2) → namespace, tags(array, items string) → items adds depth
    expect(sv!.propertyCount).toBeGreaterThanOrEqual(5);
  });

  it("measures schema depth", () => {
    const s = statsFor(list("tools-list.json"), "2026-05-27T08:00:00Z");
    const sv = s.perTool.find((t) => t.name === "search-vectorstore");
    expect(sv?.schemaDepth).toBeGreaterThanOrEqual(3);
  });

  it("populates typeDistribution", () => {
    const s = statsFor(list("tools-list.json"), "2026-05-27T08:00:00Z");
    expect(s.typeDistribution.string).toBeGreaterThan(0);
    expect(s.typeDistribution.integer).toBeGreaterThan(0);
    expect(s.typeDistribution.object).toBeGreaterThan(0);
    expect(s.typeDistribution.array).toBeGreaterThan(0);
  });

  it("computes requiredRatio per tool when topLevelProperties > 0", () => {
    const s = statsFor(list("tools-list.json"), "2026-05-27T08:00:00Z");
    const sum = s.perTool.find((t) => t.name === "summarize");
    expect(sum?.requiredCount).toBe(1);
    expect(sum?.requiredRatio).toBeCloseTo(0.5, 5);

    const ping = s.perTool.find((t) => t.name === "ping");
    expect(ping?.requiredRatio).toBeUndefined();
  });

  it("sorts perTool by name", () => {
    const s = statsFor(list("tools-list.json"), "2026-05-27T08:00:00Z");
    expect(s.perTool.map((t) => t.name)).toEqual(["ping", "search-vectorstore", "summarize", "version"]);
  });

  it("throws on malformed input", () => {
    expect(() => statsFor({} as McpToolsListResult)).toThrow();
    expect(() => statsFor(null as unknown as McpToolsListResult)).toThrow();
  });

  it("handles an empty tools array", () => {
    const s = statsFor({ tools: [] }, "2026-05-27T08:00:00Z");
    expect(s.tools).toBe(0);
    expect(s.maxSchemaDepth).toBe(0);
    expect(s.totalProperties).toBe(0);
  });

  it("walks oneOf / anyOf / allOf branches", () => {
    const r = statsFor(
      {
        tools: [
          {
            name: "branchy",
            description: "x",
            inputSchema: {
              type: "object",
              properties: {
                payload: {
                  oneOf: [{ type: "string" }, { type: "number" }],
                  anyOf: [{ type: "boolean" }],
                  allOf: [{ type: "object", properties: { x: { type: "integer" } } }]
                }
              }
            }
          }
        ]
      },
      "2026-05-27T08:00:00Z"
    );
    expect(r.typeDistribution.string).toBeGreaterThan(0);
    expect(r.typeDistribution.boolean).toBe(1);
    expect(r.typeDistribution.integer).toBe(1);
  });
});

describe("formatters", () => {
  it("toMarkdown renders posture + per-tool table", () => {
    const md = toMarkdown(statsFor(list("tools-list.json"), "2026-05-27T08:00:00Z"));
    expect(md).toContain("MCP tools/list snapshot stats");
    expect(md).toContain("search-vectorstore");
    expect(md).toContain("Type distribution");
  });

  it("toSummary emits a one-liner", () => {
    const s = toSummary(statsFor(list("tools-list.json"), "2026-05-27T08:00:00Z"));
    expect(s).toMatch(/^4 tools/);
    expect(s).toMatch(/max depth/);
  });
});
