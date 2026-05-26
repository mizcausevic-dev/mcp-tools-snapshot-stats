// Statistical analyzer for MCP `tools/list` snapshots.
// Companion to mcp-tools-snapshot / mcp-tools-diff / mcp-tool-card-summary.

export interface JsonSchema {
  type?: string;
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema | JsonSchema[];
  required?: string[];
  enum?: unknown[];
  oneOf?: JsonSchema[];
  anyOf?: JsonSchema[];
  allOf?: JsonSchema[];
  [key: string]: unknown;
}

export interface McpTool {
  name: string;
  description?: string;
  inputSchema?: JsonSchema;
}

export interface McpToolsListResult {
  tools: McpTool[];
}

export type SchemaPrimitive = "string" | "number" | "integer" | "boolean" | "array" | "object" | "null" | "any";

export interface PerToolStats {
  name: string;
  hasDescription: boolean;
  descriptionLength: number;
  hasInputSchema: boolean;
  /** Top-level property count (recursive into objects via `propertyCount`). */
  topLevelProperties: number;
  /** Recursive property count (sum across nested objects). */
  propertyCount: number;
  /** Max nesting depth seen in inputSchema. */
  schemaDepth: number;
  requiredCount: number;
  /** Required / topLevelProperties — undefined when topLevel = 0. */
  requiredRatio?: number;
}

export interface SnapshotStats {
  generatedAt: string;
  tools: number;
  /** Tool count without any inputSchema at all. */
  schemaLess: number;
  /** Tool count without a description. */
  missingDescription: number;
  /** Tool count with empty inputSchema (an inputSchema object with no properties). */
  emptySchema: number;
  /** Total property count across the whole snapshot. */
  totalProperties: number;
  /** Total required-field count across the whole snapshot. */
  totalRequired: number;
  /** Distribution of declared property types (string / number / object / …). */
  typeDistribution: Record<SchemaPrimitive, number>;
  /** Maximum schema depth across the whole snapshot. */
  maxSchemaDepth: number;
  /** Per-tool stats, sorted by name. */
  perTool: PerToolStats[];
}
