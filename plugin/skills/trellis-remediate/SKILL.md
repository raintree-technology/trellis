---
name: trellis-remediate
description: Use when the user asks to fix, remediate, triage, or work through Trellis findings in a JavaScript or TypeScript repository. Detect whether the repository already uses Trellis before acting. Do not activate for a generic lint request that does not mention Trellis or for installing Trellis without explicit user authorization.
---

# Trellis remediation

Use Trellis's existing todo report as the handoff contract. Do not reproduce its
policy in this skill and do not change its JSON schema.

## Establish the repository state

1. Inspect package manifests, the lockfile, Biome configuration, scripts, and
   repository guidance for `@raintree-technology/trellis` adoption.
2. If Trellis or its exact Biome peer dependency is missing, stop before
   installation or any dependency change. Ask for explicit authorization and
   state the proposed versions and files.
3. Run the repository's existing command that invokes `trellis todo`. If no
   script exists but the installed package is resolvable, run the installed
   executable without modifying dependencies.
4. Confirm the report has `schemaVersion: 1`. Stop on an unknown schema.

## Remediate one rule group

1. Group open todos by `rule`. Select one group only.
2. Treat `error` and `fatal` findings as blocking candidates. Confirm whether
   the repository's Biome gate makes them release-blocking.
3. Treat warnings as human-judgment work. Inspect behavior and architecture
   before changing code.
4. Apply the smallest behavior-preserving correction that follows each todo's
   replacement direction.
5. Preserve a narrow local suppression when its reason is still justified. Do
   not remove or broaden suppressions to make the report cleaner.
6. Stop after the selected rule group. Report remaining groups for a later pass.

## Verify

After edits, rerun:

1. The repository's Trellis todo command.
2. The repository's Biome check.
3. Tests relevant to the changed behavior.

Report resolved IDs, remaining findings, preserved suppressions, exact checks,
and failures. A clean todo report does not replace the Biome gate or tests.
