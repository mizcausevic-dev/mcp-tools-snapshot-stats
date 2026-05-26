import type { SchemaPrimitive, SnapshotStats } from "./types.js";

const PRIMITIVES: SchemaPrimitive[] = ["string", "number", "integer", "boolean", "array", "object", "null", "any"];

export function toMarkdown(stats: SnapshotStats): string {
  const lines: string[] = [];
  lines.push(`# MCP tools/list snapshot stats`);
  lines.push(``);
  lines.push(`Generated: \`${stats.generatedAt}\``);
  lines.push(``);
  lines.push(`## Posture`);
  lines.push(``);
  lines.push(`- Tools: **${stats.tools}**`);
  lines.push(`- Schema-less: ${stats.schemaLess} · empty schema: ${stats.emptySchema}`);
  lines.push(`- Missing description: ${stats.missingDescription}`);
  lines.push(`- Total properties: ${stats.totalProperties} · total required: ${stats.totalRequired}`);
  lines.push(`- Max schema depth: ${stats.maxSchemaDepth}`);
  lines.push(``);
  lines.push(`## Type distribution`);
  lines.push(``);
  lines.push(`| ${PRIMITIVES.join(" | ")} |`);
  lines.push(`| ${PRIMITIVES.map(() => "---:").join(" | ")} |`);
  lines.push(`| ${PRIMITIVES.map((p) => stats.typeDistribution[p]).join(" | ")} |`);
  lines.push(``);
  lines.push(`## Per tool`);
  lines.push(``);
  lines.push(`| tool | desc | top-level props | total props | depth | required | ratio |`);
  lines.push(`|---|---:|---:|---:|---:|---:|---:|`);
  for (const t of stats.perTool) {
    const desc = t.hasDescription ? "✓" : "—";
    const ratio = t.requiredRatio !== undefined ? `${Math.round(t.requiredRatio * 100)}%` : "—";
    lines.push(
      `| \`${t.name}\` | ${desc} | ${t.topLevelProperties} | ${t.propertyCount} | ${t.schemaDepth} | ${t.requiredCount} | ${ratio} |`
    );
  }
  return lines.join("\n");
}

export function toSummary(stats: SnapshotStats): string {
  return `${stats.tools} tool${stats.tools === 1 ? "" : "s"} · ${stats.totalProperties} props · max depth ${stats.maxSchemaDepth} · ${stats.missingDescription} missing description · ${stats.schemaLess} schema-less`;
}
