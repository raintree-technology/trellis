import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");

test("README keeps the public project contract", () => {
  for (const required of [
    "<!-- project-record: trellis -->",
    "**Active open-source package",
    "## Install Trellis",
    "## Compatibility and boundaries",
    "## Raintree open-source system",
    "## Project policies",
  ]) {
    expect(readme).toContain(required);
  }
  expect(readme.match(/^# /gm)).toHaveLength(1);
  expect(readme.indexOf("bun add --dev --exact")).toBeLessThan(
    readme.indexOf("bun run trellis todo"),
  );
});

test("README shows the diagnostic emitted by the pinned RT006 fixture", () => {
  const repositoryRoot = resolve(import.meta.dir, "..");
  const result = spawnSync(
    "./node_modules/.bin/biome",
    [
      "lint",
      "--config-path=tests/fixture-config.json",
      "--max-diagnostics=1",
      "tests/fixtures/rt006-invalid.mts",
    ],
    { cwd: repositoryRoot, encoding: "utf8" },
  );
  const diagnostic = `${result.stdout}${result.stderr}`;

  expect(result.status).toBe(1);
  for (const evidence of [
    "RT006: TLS certificate verification must remain enabled.",
    "Fix the trust store or certificate chain instead.",
    'process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";',
  ]) {
    expect(diagnostic).toContain(evidence);
    expect(readme).toContain(evidence);
  }
});
