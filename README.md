# Trellis

Trellis turns Raintree Technology's shared engineering standards into a small,
strict Biome preset. It catches correctness mistakes, risky shortcuts, security
footguns, and structural debt in editors and CI. It can also export
active findings as deterministic JSON todo lists with stable IDs and approved
replacements.

Shared rules stay objective and useful across repositories. Product
architecture, framework constraints, and justified exceptions stay in the
repository that owns them.

## Package surface

Trellis exports one Biome configuration:

```text
@raintree-technology/trellis/biome
```

Product-specific accessibility, framework, architecture, and file-scope
settings stay in each repository.

## Install

Install exact versions at the consumer repository root:

```sh
bun add --dev --exact @raintree-technology/trellis@0.2.0 @biomejs/biome@2.5.6
```

At the consumer repository root, create a small `biome.json`:

```json
{
  "$schema": "./node_modules/@biomejs/biome/configuration_schema.json",
  "extends": ["@raintree-technology/trellis/biome"]
}
```

The consumer keeps its own file scope, framework rules, import boundaries, and
other local settings. Do not copy Trellis configuration or plugins into the
consumer.

No Trellis command is required. The repository's existing `biome lint` or
`biome check` command automatically includes the shared rules.

## JSON todo report

Run Trellis from a consumer repository to turn its active policy findings into
a deterministic JSON todo list:

```sh
bun run trellis todo
bun run trellis todo --output trellis-todo.json
```

The default report contains only Trellis findings. Use `--all` to include every
diagnostic from the repository's Biome configuration, including local rules.
Each todo includes a stable ID, severity, rule, source location, diagnostic,
and approved replacement. Generating a report succeeds even when it contains
error-level todos; repository lint remains the blocking command.

In a monorepo, declare both packages in the root `package.json`. Keep the
package export in the root Biome configuration. Nested configurations inherit
from the root so plugin paths continue to resolve from one place:

```json
{
  "root": false,
  "extends": ["//"]
}
```

Trellis covers `.js`, `.jsx`, `.mjs`, `.cjs`, `.ts`, `.tsx`, `.mts`, and
`.cts` files. Consumers still own generated-file exclusions and source scope.

## Current rules

| Policy | Implementation | Status |
| --- | --- | --- |
| Reject common correctness mistakes | Biome recommended rules | Biome defaults |
| Reject type-system escape | Biome `noExplicitAny` | Error |
| Reject parameter reassignment | Biome `noParameterAssign` | Error |
| Flag hard-to-follow functions | Cognitive complexity above 25 | Warning |
| Flag oversized functions | More than 150 nonblank lines per function | Warning |
| Flag oversized files | More than 500 nonblank lines per file | Warning |
| Flag overloaded signatures | More than 5 parameters | Warning |
| Flag unchecked assumptions | Biome `noNonNullAssertion` | Warning |
| RT005: no dynamic execution | Biome `noGlobalEval` and `noImpliedEval` | Error and audit warning |
| RT006: do not disable TLS verification | Two Trellis GritQL plugins | Error |

Errors cover shortcuts with a direct replacement: use a concrete type or
`unknown`, and copy a parameter into a local variable before changing it.
Warnings identify structural debt that needs human judgment before refactoring.
Trellis does not ban console output, nested ternaries, comments, UI patterns,
or other context-dependent choices.

Prefer a narrow inline suppression:

```ts
// biome-ignore lint/nursery/noImpliedEval: Required by the reviewed sandbox protocol.
const evaluator = new Function(source);
```

## Adding a rule

A shared rule belongs in Trellis only when it is objective, useful in more than
one repository, and has one clear replacement. Prefer a built-in Biome rule.
Keep rules with product-specific exceptions in the product repository.

See [RT005](./docs/rules/RT005.md) and [RT006](./docs/rules/RT006.md) for the
current catalog.
