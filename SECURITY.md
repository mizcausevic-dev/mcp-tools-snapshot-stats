# Security Policy

`mcp-tools-snapshot-stats` is a pure-transform library and CLI: it reads a JSON snapshot from disk (or in-memory) and emits a stats object. No network listener, no remote fetch, no execution of user-supplied code.

The input may contain tool names and inputSchema definitions that are sensitive in your environment. The report includes tool names and schema shape — no schema values, no example inputs.

## Supported versions

Only the latest tagged release is supported.

## Reporting a vulnerability

Please use GitHub Security Advisories for private disclosure:

- [Open a security advisory](https://github.com/mizcausevic-dev/mcp-tools-snapshot-stats/security/advisories/new)

Do not file public issues for security reports.
