import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";

const biome = "./node_modules/.bin/biome";
const config = "tests/fixture-config.json";

function lint(path: string) {
  return spawnSync(biome, ["lint", `--config-path=${config}`, "--max-diagnostics=none", path], {
    encoding: "utf8",
  });
}

describe("RT006 plugins", () => {
  test("report every prohibited TLS form", () => {
    const result = lint("tests/fixtures/rt006-invalid.mts");
    const output = `${result.stdout}${result.stderr}`;

    expect(result.status).toBe(1);
    expect(output.match(/RT006:/g)).toHaveLength(6);
  });

  test("allow secure TLS settings", () => {
    const result = lint("tests/fixtures/rt006-valid.mts");

    expect(result.status).toBe(0);
  });
});
