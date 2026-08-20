# Product Marketing Context

*Last updated: 2026-08-20 · Auto-drafted from repository and package evidence*

## Product Overview

**One-liner:** Trellis gives JavaScript and TypeScript repositories one shared Biome policy and deterministic agent-readable fix lists.

**What it does:** Consumers extend a published Biome configuration containing selected correctness, security, and maintainability checks. The CLI converts active findings into stable JSON todos while leaving Biome as the enforcement gate.

**Product category:** JavaScript and TypeScript static-analysis policy

**Product type:** MIT-licensed public npm package

**Business model:** Free open-source package. No paid service or support offer is documented.

## Target Audience

**Primary users:** JavaScript and TypeScript maintainers who want shared code policy across human and coding-agent workflows.

**Primary use case:** Extend one pinned Biome configuration, run the existing repository check, and hand active findings to agents through deterministic JSON.

**Jobs to be done:**

- Keep objective checks consistent across repositories.
- Detect risky shortcuts such as disabled TLS verification and dynamic execution.
- Give coding agents stable findings that reviewers can diff.
- Keep architecture rules and justified exceptions in the repository that owns them.

## Problems and Alternatives

**Core problem:** Shared lint policy drifts when repositories copy configurations, while raw linter output is an unstable work queue for automated fixes.

**Alternatives:** Direct Biome configuration, ESLint presets, custom scripts, and repository-local checks may fit broader or project-specific policy. Trellis intentionally covers only repeatable shared rules with clear replacements.

## Differentiation

- Consumers extend Biome directly; no wrapper is required for enforcement.
- Custom GritQL checks target selected security and structural shortcuts.
- Todo fingerprints remain stable across unrelated line movement.
- JSON generation succeeds when blocking findings exist because the report is a handoff, not the gate.
- Product architecture, framework rules, source scope, and suppressions remain local.

## Objections and Fit

| Question | Answer |
| --- | --- |
| Does Trellis replace Biome? | No. It configures and extends Biome. |
| Does it enforce architecture or framework policy? | No. Consumers own project-specific rules and boundaries. |
| Does a generated todo mean checks passed? | No. Biome remains the pass/fail gate. |

**Anti-persona:** Teams seeking an all-purpose style guide, automatic architecture enforcement, or support for ecosystems outside JavaScript and TypeScript.

## Customer Language

No verified customer interviews or testimonials are recorded. Use: shared policy, deterministic todo, actionable replacement, local exception, Biome preset, and agent handoff. Avoid: clean code guarantee, security scanner, zero false positives, universal policy, and automatic fix for every finding.

## Brand Voice

**Tone:** Strict where evidence is objective, restrained where judgment belongs to the project

**Style:** Show the risky code, exact rule, replacement direction, and which system owns the final gate.

## Proof Points

- Public `@raintree-technology/trellis` package, version 0.3.0 in repository metadata.
- Pinned Biome 2.5.6 peer dependency and Node 24 package boundary.
- Shared rules for type escapes, parameter reassignment, dynamic execution, disabled TLS verification, and structural debt warnings.
- Fixture tests and package dry-run checks in the release path.

Adoption, developer-time savings, defect reduction, and security outcomes are not verified.

## Goals

**Primary goal:** Make repeatable Raintree JavaScript and TypeScript policy easy to adopt and easy for agents to act on.

**Conversion action:** Install the pinned package pair, extend `@raintree-technology/trellis/biome`, and run the repository's existing Biome check.

## Messaging Guardrails

- Keep shared objective policy separate from local architecture and product judgment.
- Never describe todo generation as a passing quality gate.
- State exact supported file types, Biome version, and node_modules limitation.
- Do not infer defect or security outcomes from rule presence alone.
