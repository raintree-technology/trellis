# Trellis

Trellis is Raintree Technology's small, strict Biome preset. It rejects obvious
code slop, security footguns, and avoidable inconsistency in editors, local
validation, and CI.

Trellis does not encode product architecture. Repository-specific rules and
exceptions stay in the repository that owns them.

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
bun add --dev --exact @raintree-technology/trellis@0.1.0 @biomejs/biome@2.5.6
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
| RT005: no dynamic execution | Biome `noGlobalEval` and `noImpliedEval` | Error and audit warning |
| RT006: do not disable TLS verification | Two Trellis GritQL plugins | Error |

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
