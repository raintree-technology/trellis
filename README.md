# Trellis

<!-- project-record: trellis -->

**Active open-source package · MIT License**

Trellis gives JavaScript and TypeScript teams one strict Biome policy for repeatable
correctness, security, and maintainability checks. It also turns active findings into
deterministic JSON todos that coding agents can implement and reviewers can diff.

## Install Trellis

Install exact package and peer-dependency versions at the consumer repository root:

```bash
bun add --dev --exact @raintree-technology/trellis@0.3.0 @biomejs/biome@2.5.6
```

Create `biome.json`:

```json
{
  "$schema": "./node_modules/@biomejs/biome/configuration_schema.json",
  "extends": ["@raintree-technology/trellis/biome"]
}
```

The repository’s existing `biome check` command now enforces the shared policy. No
Trellis wrapper is required.

## See the policy handoff

Given a risky shortcut:

```ts
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
```

Biome reports the blocking rule with its reason and replacement direction:

```text
readme-proof.ts:1:1 plugin

  × RT006: TLS certificate verification must remain enabled.
    Fix the trust store or certificate chain instead.

  > 1 │ process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
      │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
```

This capture is checked against the pinned Biome version and the RT006 fixture in the
test suite. Trellis can also produce an agent-readable todo:

```bash
bun run trellis todo --output trellis-todo.json
```

```json
{
  "id": "trellis-<stable-fingerprint>",
  "status": "open",
  "severity": "error",
  "rule": "RT006",
  "message": "Do not disable TLS certificate verification.",
  "replacement": "Use a trusted CA or a scoped test transport."
}
```

The JSON report is a handoff artifact, not a second policy engine. Report generation
succeeds when error-level todos exist; the repository’s Biome check remains the gate.

## Why use Trellis

- **Share objective policy.** Keep repeatable rules consistent across repositories.
- **Keep exceptions local.** Product architecture, framework rules, and justified
  suppressions stay with the repository that owns them.
- **Give agents stable work.** Todo IDs derive from the file, category, message, and
  same-message occurrence, so unrelated line movement does not rewrite the list.
- **Prefer clear replacements.** Shared rules belong here only when they identify an
  objective problem with an actionable alternative.

## Current policy

| Policy | Implementation | Gate |
| --- | --- | --- |
| Common correctness mistakes | Biome recommended rules | Biome defaults |
| Type-system escape | `noExplicitAny` | Error |
| Parameter reassignment | `noParameterAssign` | Error |
| Dynamic execution | `noGlobalEval` and `noImpliedEval` | Error and audit warning |
| Disabled TLS verification | Trellis GritQL plugins | Error |
| Complexity above 25 | Biome cognitive complexity | Warning |
| Functions over 150 nonblank lines | Trellis policy | Warning |
| Files over 500 nonblank lines | Trellis policy | Warning |
| More than five parameters | Trellis policy | Warning |
| Non-null assertions | `noNonNullAssertion` | Warning |

Warnings identify structural debt that needs human judgment. Trellis does not ban
console output, nested ternaries, comments, UI patterns, or other context-dependent
choices. The rule rationale lives in [`docs/rules/`](docs/rules/).

## Compatibility and boundaries

Trellis covers `.js`, `.jsx`, `.mjs`, `.cjs`, `.ts`, `.tsx`, `.mts`, and `.cts`.
Consumers own generated-file exclusions, source scope, framework rules, import
boundaries, and architecture checks.

Plugin paths require a physical root `node_modules` directory. Yarn Plug’n’Play
without one is not supported. In a monorepo, install both packages at the root and let
nested Biome configurations extend `//`.

Use narrow suppressions with a reason when a reviewed exception is necessary:

```ts
// biome-ignore lint/nursery/noImpliedEval: Required by the reviewed sandbox protocol.
const evaluator = new Function(source);
```

## Raintree open-source system

Trellis owns shared JavaScript and TypeScript code policy. It can be used independently.
[Raintree Standards](https://github.com/raintree-technology/raintree.standards) defines
governed requirements, [DocPull](https://github.com/raintree-technology/docpull)
acquires evidence, [HIG Doctor](https://github.com/raintree-technology/hig-doctor)
audits interfaces, and [PolicyStrata](https://github.com/raintree-technology/policystrata)
tests cross-layer policy behavior. See the
[Raintree open-source portfolio](https://raintree.technology/portfolio#open-source).

## Project policies

[npm package](https://www.npmjs.com/package/@raintree-technology/trellis) ·
[Contributing](CONTRIBUTING.md) · [Security](SECURITY.md) · [Changelog](CHANGELOG.md) ·
[Source repository](https://github.com/raintree-technology/trellis) · [MIT License](LICENSE)
