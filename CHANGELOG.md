# Changelog

## v0.1.0 — 2026-05-27

- Initial release: statistical analyzer for an MCP `tools/list` snapshot.
- Snapshot-wide metrics: tool count, schema-less / empty-schema / missing-description counts, total properties + required fields, max schema depth, type distribution across 8 primitives.
- Per-tool metrics: description presence + length, top-level vs total property count, schema depth, required-field count, required-ratio.
- Schema walk handles nested `properties`, `items` (array + tuple), `oneOf`, `anyOf`, `allOf` branches.
- Library API: `statsFor(list)` → `SnapshotStats`; `toMarkdown(stats)` + `toSummary(stats)` formatters.
- CLI: `mcp-tools-snapshot-stats <snapshot.json> [--format json|markdown|summary] [--out FILE]`.
- Companion to `mcp-tools-snapshot` (input), `mcp-tools-diff` (compare-mode), `mcp-tool-card-summary` (sibling for tool cards).
- Node 20/22 CI (lint, typecheck, coverage, build, demo, `npm audit`), AGPL-3.0-or-later, Dependabot.
