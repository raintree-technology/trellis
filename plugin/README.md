# Trellis Codex plugin recipe

This recipe provides one remediation skill for Trellis 0.3.1. The skill consumes
the package's existing `trellis todo` JSON report. It does not duplicate the
policy or define another finding schema.

The consuming repository owns installation, dependency changes, Biome commands,
tests, architecture rules, and justified local suppressions.
