# Trellis agent instructions

Trellis is Raintree Technology's executable code-policy package.

## Scope

- Keep shared rules objective and useful in more than one adopted repository.
- Prefer a built-in Biome rule over a custom GritQL plugin.
- Keep repository-specific architecture and exceptions in the consuming repository.
- Treat a new blocking diagnostic or a wider blocking scope as a breaking policy change.
- Keep the approved release workflow at `.github/workflows/release.yml`; npm trusted publishing
  binds to that exact filename.
- Do not add publishing credentials, tokens, or additional release workflows without explicit
  approval.

## Biome versions

- Pin the same exact Biome version in Trellis and every consumer.
- Treat a Biome version bump as a coordinated Trellis release and consumer migration.
- Before a bump, check whether nursery rules graduated or changed groups. Update both the
  configuration key and every suppression path in the same release.
- Run the plugin fixtures and a clean consumer install before publishing a Biome bump.

## Rule changes

- Prefer a built-in Biome rule even when it is in the nursery group.
- Give every custom rule a stable `RT###` identifier.
- State the approved replacement in each diagnostic.
- Start new custom rules at warning severity.
- Promote a rule to error only after its intended repositories have been audited and all findings triaged.
- Keep custom-rule suppressions specific to the plugin file and require a concrete explanation.
- Mark a rewrite safe only when it preserves runtime behavior and is idempotent.

## Commands

- `bun run check` validates Trellis without changing files.
- `bun run check:fixtures` confirms every RT006 form produces the expected diagnostic.
- `bun run check:write` applies Biome's safe formatting and fixes.
- `bun run package:check` shows the exact npm package contents without publishing.
