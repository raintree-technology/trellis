import { afterEach, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const cli = resolve(import.meta.dir, "../bin/trellis.mjs");
const temporaryDirectories: string[] = [];

function makeFakeBiome(lineOffset = 0, objectPath = false) {
  const directory = mkdtempSync(join(tmpdir(), "trellis-cli-"));
  temporaryDirectories.push(directory);
  const biome = join(directory, "biome.mjs");
  const diagnostics = [
    {
      category: "lint/style/noNonNullAssertion",
      severity: "warning",
      location: {
        path: objectPath ? { file: "src/b.ts" } : "src/b.ts",
        start: { line: 8 + lineOffset, column: 4 },
      },
      message: "Forbidden non-null assertion.",
    },
    {
      category: "lint/suspicious/noExplicitAny",
      severity: "error",
      location: {
        path: objectPath ? { file: "src/a.ts" } : "src/a.ts",
        start: { line: 2 + lineOffset, column: 10 },
      },
      message: "Unexpected any.",
    },
    {
      category: "lint/a11y/useButtonType",
      severity: "error",
      location: {
        path: objectPath ? { file: "src/c.tsx" } : "src/c.tsx",
        start: { line: 3 + lineOffset, column: 1 },
      },
      message: "Provide an explicit button type.",
    },
    {
      category: "plugin",
      severity: "error",
      location: {
        path: objectPath ? { file: "src/tls.ts" } : "src/tls.ts",
        start: { line: 5 + lineOffset, column: 2 },
      },
      message: "RT006: Do not disable TLS certificate verification.",
    },
  ];
  writeFileSync(
    biome,
    `#!/usr/bin/env node\nprocess.stdout.write(${JSON.stringify(JSON.stringify({ diagnostics }))});\n`,
  );
  chmodSync(biome, 0o755);
  return { biome, directory };
}

function run(arguments_: string[], biome?: string, cwd?: string) {
  return spawnSync(process.execPath, [cli, ...arguments_], {
    cwd,
    encoding: "utf8",
    env: biome ? { ...process.env, TRELLIS_BIOME_BIN: biome } : process.env,
  });
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("trellis todo", () => {
  test("prints help without requiring Biome", () => {
    const result = run(["todo", "--help"]);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Usage: trellis todo");
  });

  test("rejects an unknown command", () => {
    const result = run(["unknown"]);

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("Unknown command: unknown");
  });

  test("filters, sorts, and writes a deterministic Trellis report", () => {
    const { biome, directory } = makeFakeBiome();
    const first = run(["todo"], biome, directory);
    const second = run(["todo"], biome, directory);

    expect(first.status).toBe(0);
    expect(second.stdout).toBe(first.stdout);

    const report = JSON.parse(first.stdout);
    expect(report.schemaVersion).toBe(1);
    expect(report.scope).toBe("trellis");
    expect(report.summary).toEqual({ total: 3, errors: 2, warnings: 1, infos: 0 });
    expect(report.todos.map((todo: { rule: string }) => todo.rule)).toEqual([
      "noExplicitAny",
      "RT006",
      "noNonNullAssertion",
    ]);
    expect(report.todos[0].replacement).toContain("concrete type");

    const output = join(directory, "todo.json");
    const outputResult = run(["todo", "--all", "--output", output], biome, directory);
    expect(outputResult.status).toBe(0);
    expect(outputResult.stdout).toBe("");

    const allReport = JSON.parse(readFileSync(output, "utf8"));
    expect(allReport.scope).toBe("all-biome");
    expect(allReport.summary.total).toBe(4);
    expect(allReport.todos.some((todo: { rule: string }) => todo.rule === "useButtonType")).toBe(
      true,
    );
  });

  test("keeps IDs when source lines move and accepts object-shaped paths", () => {
    const firstBiome = makeFakeBiome();
    const movedBiome = makeFakeBiome(20, true);
    const first = JSON.parse(run(["todo"], firstBiome.biome, firstBiome.directory).stdout);
    const moved = JSON.parse(run(["todo"], movedBiome.biome, movedBiome.directory).stdout);

    expect(moved.todos.map((todo: { id: string }) => todo.id)).toEqual(
      first.todos.map((todo: { id: string }) => todo.id),
    );
    expect(moved.todos.map((todo: { file: string }) => todo.file)).toEqual([
      "src/a.ts",
      "src/tls.ts",
      "src/b.ts",
    ]);
  });

  test("parses the pinned Biome JSON reporter end to end", () => {
    const repositoryRoot = resolve(import.meta.dir, "..");
    const result = run(
      ["todo", "--config-path=tests/fixture-config.json", "tests/fixtures/rt006-invalid.mts"],
      undefined,
      repositoryRoot,
    );

    expect(result.status).toBe(0);
    const report = JSON.parse(result.stdout);
    expect(report.summary).toEqual({ total: 9, errors: 9, warnings: 0, infos: 0 });
    expect(report.todos.every((todo: { rule: string }) => todo.rule === "RT006")).toBe(true);
    expect(report.todos[0]).toMatchObject({
      file: "tests/fixtures/rt006-invalid.mts",
      line: 1,
      column: 1,
    });
  });
});
