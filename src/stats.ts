import type {
  JsonSchema,
  McpTool,
  McpToolsListResult,
  PerToolStats,
  SchemaPrimitive,
  SnapshotStats
} from "./types.js";

const PRIMITIVES: SchemaPrimitive[] = ["string", "number", "integer", "boolean", "array", "object", "null", "any"];

function emptyTypeDistribution(): Record<SchemaPrimitive, number> {
  const out = {} as Record<SchemaPrimitive, number>;
  for (const t of PRIMITIVES) out[t] = 0;
  return out;
}

function asPrimitive(t: unknown): SchemaPrimitive {
  if (typeof t === "string" && (PRIMITIVES as string[]).includes(t)) return t as SchemaPrimitive;
  return "any";
}

/** Walk an inputSchema and report depth + property count + per-type tally. */
function walk(
  schema: JsonSchema | undefined,
  depth: number,
  counts: Record<SchemaPrimitive, number>
): { properties: number; depth: number } {
  if (!schema || typeof schema !== "object") return { properties: 0, depth };
  let properties = 0;
  let maxDepth = depth;

  const t = asPrimitive(schema.type);
  // Don't count the top-level node itself as a "property" — that's the input wrapper.
  if (depth > 0) counts[t] += 1;

  if (schema.properties) {
    for (const [, sub] of Object.entries(schema.properties)) {
      properties += 1;
      const child = walk(sub, depth + 1, counts);
      properties += child.properties;
      if (child.depth > maxDepth) maxDepth = child.depth;
    }
  }
  if (schema.items) {
    const items = Array.isArray(schema.items) ? schema.items : [schema.items];
    for (const it of items) {
      const child = walk(it, depth + 1, counts);
      properties += child.properties;
      if (child.depth > maxDepth) maxDepth = child.depth;
    }
  }
  for (const key of ["oneOf", "anyOf", "allOf"] as const) {
    const arr = schema[key];
    if (Array.isArray(arr)) {
      for (const branch of arr) {
        const child = walk(branch as JsonSchema, depth + 1, counts);
        properties += child.properties;
        if (child.depth > maxDepth) maxDepth = child.depth;
      }
    }
  }
  return { properties, depth: maxDepth };
}

function statsForTool(tool: McpTool, totalCounts: Record<SchemaPrimitive, number>): PerToolStats {
  const desc = tool.description ?? "";
  const hasSchema = !!tool.inputSchema;
  const topLevelProperties = tool.inputSchema?.properties ? Object.keys(tool.inputSchema.properties).length : 0;
  const requiredCount = tool.inputSchema?.required?.length ?? 0;

  const localCounts = emptyTypeDistribution();
  const { properties, depth } = walk(tool.inputSchema, 0, localCounts);
  // merge into total
  for (const t of PRIMITIVES) totalCounts[t] += localCounts[t];

  const out: PerToolStats = {
    name: tool.name,
    hasDescription: desc.length > 0,
    descriptionLength: desc.length,
    hasInputSchema: hasSchema,
    topLevelProperties,
    propertyCount: properties,
    schemaDepth: depth,
    requiredCount
  };
  if (topLevelProperties > 0) out.requiredRatio = requiredCount / topLevelProperties;
  return out;
}

export function statsFor(list: McpToolsListResult, now?: string): SnapshotStats {
  if (!list || !Array.isArray(list.tools)) {
    throw new Error("tools/list result must have a tools array");
  }
  const typeDistribution = emptyTypeDistribution();
  const perTool: PerToolStats[] = [];
  let schemaLess = 0;
  let missingDescription = 0;
  let emptySchema = 0;
  let totalProperties = 0;
  let totalRequired = 0;
  let maxSchemaDepth = 0;

  for (const t of list.tools) {
    const s = statsForTool(t, typeDistribution);
    perTool.push(s);
    if (!s.hasDescription) missingDescription += 1;
    if (!s.hasInputSchema) schemaLess += 1;
    if (s.hasInputSchema && s.topLevelProperties === 0) emptySchema += 1;
    totalProperties += s.propertyCount;
    totalRequired += s.requiredCount;
    if (s.schemaDepth > maxSchemaDepth) maxSchemaDepth = s.schemaDepth;
  }
  perTool.sort((a, b) => a.name.localeCompare(b.name));

  return {
    generatedAt: now ?? new Date().toISOString(),
    tools: list.tools.length,
    schemaLess,
    missingDescription,
    emptySchema,
    totalProperties,
    totalRequired,
    typeDistribution,
    maxSchemaDepth,
    perTool
  };
}
