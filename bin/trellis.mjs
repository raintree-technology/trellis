#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, parse, resolve } from "node:path";

const TRELLIS_CATEGORIES = new Set([
  "lint/complexity/noExcessiveCognitiveComplexity",
  "lint/complexity/noExcessiveLinesPerFunction",
  "lint/complexity/useMaxParams",
  "lint/nursery/noImpliedEval",
  "lint/security/noGlobalEval",
  "lint/style/noExcessiveLinesPerFile",
  "lint/style/noNonNullAssertion",
  "lint/style/noParameterAssign",
  "lint/suspicious/noExplicitAny",
]);

const REPLACEMENTS = {
  "lint/complexity/noExcessiveCognitiveComplexity":
    "Split branches into small named functions with one responsibility.",
  "lint/complexity/noExcessiveLinesPerFunction":
    "Extract cohesive work into small named functions.",
  "lint/complexity/useMaxParams": "Group related parameters in a typed options object.",
  "lint/nursery/noImpliedEval": "Use a parser, declarative data, or a constrained interpreter.",
  "lint/security/noGlobalEval": "Use a parser, declarative data, or a constrained interpreter.",
  "lint/style/noExcessiveLinesPerFile": "Split the file along clear responsibility boundaries.",
  "lint/style/noNonNullAssertion": "Narrow or validate the value before using it.",
  "lint/style/noParameterAssign": "Copy the parameter into a local variable before changing it.",
  "lint/suspicious/noExplicitAny": "Use a concrete type or unknown and narrow it before use.",
  RT006: "Fix the certificate chain, hostname, or trust-store configuration.",
};

function usage() {
  return `Usage: trellis todo [paths...] [--output <file>] [--all]

Generate a deterministic JSON todo list from the repository's Biome diagnostics.

Options:
  --all, -a           Include every repository Biome diagnostic.
  --config-path FILE  Use an explicit Biome configuration file.
  --output, -o FILE   Write JSON to FILE instead of stdout.
  --help, -h          Show this help.
`;
}

function readValueOption(argv, index, longName, shortName) {
  const argument = argv[index];
  if (argument === longName || argument === shortName) {
    const value = argv[index + 1];
    if (!value) {
      throw new Error(`${argument} requires a file path.`);
    }
    return { consumed: 1, value };
  }

  const prefix = `${longName}=`;
  if (!argument.startsWith(prefix)) {
    return null;
  }

  const value = argument.slice(prefix.length);
  if (!value) {
    throw new Error(`${longName} requires a file path.`);
  }
  return { consumed: 0, value };
}

function parseArguments(argv) {
  if (argv[0] !== "todo") {
    throw new Error(argv.length === 0 ? usage() : `Unknown command: ${argv[0]}\n\n${usage()}`);
  }

  const paths = [];
  let all = false;
  let configPath;
  let output;

  for (let index = 1; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") {
      return { help: true };
    }
    if (argument === "--all" || argument === "-a") {
      all = true;
      continue;
    }
    const configOption = readValueOption(argv, index, "--config-path");
    if (configOption) {
      configPath = configOption.value;
      index += configOption.consumed;
      continue;
    }
    const outputOption = readValueOption(argv, index, "--output", "-o");
    if (outputOption) {
      output = outputOption.value;
      index += outputOption.consumed;
      continue;
    }
    if (argument.startsWith("-")) {
      throw new Error(`Unknown option: ${argument}`);
    }
    paths.push(argument);
  }

  return { all, configPath, help: false, output, paths: paths.length > 0 ? paths : ["."] };
}

function findBiome(cwd) {
  if (process.env.TRELLIS_BIOME_BIN) {
    return process.env.TRELLIS_BIOME_BIN;
  }

  const executable = process.platform === "win32" ? "biome.cmd" : "biome";
  let directory = cwd;
  const root = parse(directory).root;
  while (true) {
    const candidate = join(directory, "node_modules", ".bin", executable);
    if (existsSync(candidate)) {
      return candidate;
    }
    if (directory === root) {
      break;
    }
    directory = dirname(directory);
  }

  try {
    return createRequire(import.meta.url).resolve("@biomejs/biome/bin/biome");
  } catch {
    throw new Error(
      "Cannot find Biome. Install the exact @biomejs/biome peer dependency in this repository.",
    );
  }
}

function isTrellisDiagnostic(diagnostic) {
  return (
    TRELLIS_CATEGORIES.has(diagnostic.category) ||
    (diagnostic.category === "plugin" && diagnostic.message.startsWith("RT006:"))
  );
}

function ruleName(diagnostic) {
  if (diagnostic.category === "plugin" && diagnostic.message.startsWith("RT006:")) {
    return "RT006";
  }
  return diagnostic.category.split("/").at(-1);
}

function todoFromDiagnostic(diagnostic) {
  const rule = ruleName(diagnostic);
  const file = diagnostic.location?.path ?? null;
  const line = diagnostic.location?.start?.line ?? null;
  const column = diagnostic.location?.start?.column ?? null;
  const fingerprint = createHash("sha256")
    .update(
      `${diagnostic.category}\0${file ?? ""}\0${line ?? ""}\0${column ?? ""}\0${diagnostic.message}`,
    )
    .digest("hex")
    .slice(0, 16);

  return {
    id: `trellis-${fingerprint}`,
    status: "open",
    severity: diagnostic.severity,
    rule,
    category: diagnostic.category,
    file,
    line,
    column,
    message: diagnostic.message,
    replacement: REPLACEMENTS[rule] ?? REPLACEMENTS[diagnostic.category] ?? null,
  };
}

function severityRank(severity) {
  return { fatal: 0, error: 1, warning: 2, info: 3, information: 3, hint: 4 }[severity] ?? 5;
}

function buildReport(biomeReport, includeAll) {
  const todos = biomeReport.diagnostics
    .filter((diagnostic) => includeAll || isTrellisDiagnostic(diagnostic))
    .map(todoFromDiagnostic)
    .sort(
      (left, right) =>
        severityRank(left.severity) - severityRank(right.severity) ||
        (left.file ?? "").localeCompare(right.file ?? "") ||
        (left.line ?? 0) - (right.line ?? 0) ||
        left.category.localeCompare(right.category),
    );

  return {
    schemaVersion: 1,
    scope: includeAll ? "all-biome" : "trellis",
    summary: {
      total: todos.length,
      errors: todos.filter((todo) => todo.severity === "error" || todo.severity === "fatal").length,
      warnings: todos.filter((todo) => todo.severity === "warning").length,
      infos: todos.filter((todo) => todo.severity === "info" || todo.severity === "information")
        .length,
    },
    todos,
  };
}

function main() {
  let options;
  try {
    options = parseArguments(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 2;
    return;
  }

  if (options.help) {
    process.stdout.write(usage());
    return;
  }

  let biome;
  try {
    biome = findBiome(process.cwd());
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 2;
    return;
  }

  const biomeArguments = ["lint", "--reporter=json", "--max-diagnostics=none"];
  if (options.configPath) {
    biomeArguments.push(`--config-path=${options.configPath}`);
  }
  biomeArguments.push(...options.paths);

  const result = spawnSync(biome, biomeArguments, {
    cwd: process.cwd(),
    encoding: "utf8",
    shell: process.platform === "win32",
  });

  if (result.error) {
    process.stderr.write(`Biome could not run: ${result.error.message}\n`);
    process.exitCode = 2;
    return;
  }

  let biomeReport;
  try {
    biomeReport = JSON.parse(result.stdout);
  } catch {
    process.stderr.write(result.stderr || result.stdout || "Biome did not return a JSON report.\n");
    process.exitCode = 2;
    return;
  }

  const json = `${JSON.stringify(buildReport(biomeReport, options.all), null, 2)}\n`;
  if (options.output) {
    writeFileSync(resolve(process.cwd(), options.output), json, "utf8");
    return;
  }
  process.stdout.write(json);
}

main();
