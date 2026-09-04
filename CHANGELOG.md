# Changelog

## 0.3.1

- Added a Codex remediation skill that consumes the existing `trellis todo`
  schema, processes one rule group at a time, preserves justified suppressions,
  and reruns repository checks after edits.
- Kept the version 1 JSON schema unchanged.

## 0.3.0

- Added deterministic JSON todo reports for coding-agent handoffs.
- Added shared checks for dynamic execution and disabled TLS verification.
- Kept product-specific architecture and exceptions in consuming repositories.

Earlier release history is available in the
[GitHub releases](https://github.com/raintree-technology/trellis/releases).
