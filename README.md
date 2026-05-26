# mcp-tools-snapshot-stats

Statistical analyzer for an [MCP](https://modelcontextprotocol.io) `tools/list` snapshot. Answers: **how big, how deep, how documented is this MCP server's tool surface?**

> Status: v0.1.0 — Node 20/22 supported, library + CLI.

## What it measures

**Snapshot-wide:**

- Tool count
- Schema-less tools (no `inputSchema`)
- Empty-schema tools (`inputSchema` present but no properties)
- Missing-description tools
- Total properties / required fields
- Max schema depth
- Type distribution (`string` / `number` / `integer` / `boolean` / `array` / `object` / `null` / `any`)

**Per tool:**

- Has description? Description length
- Top-level vs total property count
- Schema depth (nested objects, arrays, `oneOf` / `anyOf` / `allOf` branches all counted)
- Required-field count and ratio (`required.length / topLevelProperties`)

## CLI

```
npx mcp-tools-snapshot-stats <snapshot.json> [--format json|markdown|summary] [--out FILE]
```

Input is an MCP `tools/list` result — the exact shape [`mcp-tools-snapshot`](https://github.com/mizcausevic-dev/mcp-tools-snapshot) captures.

## Library

```ts
import { statsFor, toMarkdown, toSummary } from "mcp-tools-snapshot-stats";

const stats = statsFor(toolsListResult);
console.log(toSummary(stats));      // "12 tools · 47 props · max depth 4 · 2 missing description · 0 schema-less"
console.log(toMarkdown(stats));     // full per-tool table
```

## Composes with

- [**`mcp-tools-snapshot`**](https://github.com/mizcausevic-dev/mcp-tools-snapshot) — captures the input.
- [**`mcp-tools-diff`**](https://github.com/mizcausevic-dev/mcp-tools-diff) — compares two snapshots; use this lib to characterize each one first.
- [**`mcp-tool-card-summary`**](https://github.com/mizcausevic-dev/mcp-tool-card-summary) — sibling: stats over MCP **Tool Cards** (the safety/disclosure layer), not raw `tools/list`.

## Develop

```
npm install
npm run lint && npm run typecheck && npm run coverage && npm run build
npm run demo
```

## License

[AGPL-3.0-or-later](LICENSE)
