# mcp-tools-snapshot-stats

Statistical analyzer for an [MCP](https://modelcontextprotocol.io) `tools/list` snapshot. Answers: **how big, how deep, how documented is this MCP server's tool surface?**

> **Retirement notice, 2026-10-30:** This source-only utility is being prepared for reversible read-only GitHub archival. Check the repository's GitHub archive badge for its current state. Its schema-depth, type-distribution, and description statistics are still available in this source; neither [`mcp-tools-snapshot`](https://github.com/mizcausevic-dev/mcp-tools-snapshot) nor [`mcp-tools-diff`](https://github.com/mizcausevic-dev/mcp-tools-diff) is a drop-in replacement. The public npm registry returned `E404` for `mcp-tools-snapshot-stats`, `@mizcausevic-dev/mcp-tools-snapshot-stats`, and `@kineticgain/mcp-tools-snapshot-stats` on 2026-10-30. Do not use the old `npx` command. Other distribution routes and private consumers were not verified.

Version 0.1.0 source is configured for Node 20/22 CI. The Git history and source remain available after archival; a demonstrated consumer need can justify restoring maintenance.

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

## Run from source

```bash
git clone https://github.com/mizcausevic-dev/mcp-tools-snapshot-stats.git
cd mcp-tools-snapshot-stats
npm ci
npm run build
node dist/cli.js fixtures/tools-list.json --format summary
```

The locked source-build toolchain currently has unresolved npm audit findings. Run `npm ci` in an isolated checkout; do not use this repository as a production dependency while it is unmaintained.

Replace the fixture path with your own `tools/list` JSON file. The CLI also accepts `--format json` or `--format markdown`, and `--out` to write a file.

Input is an MCP `tools/list` result — the exact shape [`mcp-tools-snapshot`](https://github.com/mizcausevic-dev/mcp-tools-snapshot) captures.

## Library

```ts
// From this checkout after `npm run build`:
import { statsFor, toMarkdown, toSummary } from "./dist/index.js";

const stats = statsFor(toolsListResult);
console.log(toSummary(stats));      // "12 tools · 47 props · max depth 4 · 2 missing description · 0 schema-less"
console.log(toMarkdown(stats));     // full per-tool table
```

## Composes with

- [**`mcp-tools-snapshot`**](https://github.com/mizcausevic-dev/mcp-tools-snapshot) — captures the input.
- [**`mcp-tools-diff`**](https://github.com/mizcausevic-dev/mcp-tools-diff) — compares two snapshots; use this lib to characterize each one first.
- [**`mcp-tool-card-fleet-summary`**](https://github.com/mizcausevic-dev/mcp-tool-card-fleet-summary) — maintained sibling for MCP **Tool Card** posture, not raw `tools/list` statistics.

## Develop

```
npm install
npm run lint && npm run typecheck && npm run coverage && npm run build
npm run demo
```

## License

[AGPL-3.0-or-later](LICENSE)
