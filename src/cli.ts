#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

import { statsFor } from "./stats.js";
import { toMarkdown, toSummary } from "./format.js";
import type { McpToolsListResult } from "./types.js";

type Format = "json" | "markdown" | "summary";

interface Args {
  input?: string;
  format: Format;
  out?: string;
  help: boolean;
}

const FORMATS: Format[] = ["json", "markdown", "summary"];

function parseArgs(argv: string[]): Args {
  const args: Args = { format: "json", help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") args.help = true;
    else if (a === "--format") {
      const v = argv[++i] as Format;
      if (!FORMATS.includes(v)) throw new Error(`--format must be one of: ${FORMATS.join(", ")}`);
      args.format = v;
    } else if (a === "--out") args.out = argv[++i];
    else if (!a.startsWith("-")) args.input = a;
    else throw new Error(`Unknown option: ${a}`);
  }
  return args;
}

const HELP = `mcp-tools-snapshot-stats — statistical analyzer for an MCP tools/list snapshot

Usage:
  mcp-tools-snapshot-stats <snapshot.json> [--format json|markdown|summary] [--out FILE]

Reads an MCP tools/list result (the shape mcp-tools-snapshot captures) and emits
a per-tool stats table plus snapshot-wide aggregates: tool count, property
totals, schema depth, missing descriptions, type distribution.

Exit codes:
  0 — stats emitted
  2 — usage / I/O error`;

export function run(argv: string[]): number {
  let args: Args;
  try {
    args = parseArgs(argv);
  } catch (e) {
    process.stderr.write(`${(e as Error).message}\n`);
    return 2;
  }
  if (args.help || !args.input) {
    process.stdout.write(`${HELP}\n`);
    return args.help ? 0 : 2;
  }

  let payload: McpToolsListResult;
  try {
    payload = JSON.parse(readFileSync(args.input, "utf8")) as McpToolsListResult;
  } catch (e) {
    process.stderr.write(`error reading input: ${(e as Error).message}\n`);
    return 2;
  }

  let stats;
  try {
    stats = statsFor(payload);
  } catch (e) {
    process.stderr.write(`${(e as Error).message}\n`);
    return 2;
  }

  let out: string;
  if (args.format === "json") out = JSON.stringify(stats, null, 2);
  else if (args.format === "markdown") out = toMarkdown(stats);
  else out = toSummary(stats);

  if (args.out) writeFileSync(args.out, `${out}\n`, "utf8");
  else process.stdout.write(`${out}\n`);
  return 0;
}

const invokedDirectly =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  try {
    process.exit(run(process.argv.slice(2)));
  } catch (e) {
    process.stderr.write(`fatal: ${(e as Error).message}\n`);
    process.exit(2);
  }
}
