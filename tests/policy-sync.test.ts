import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { REPLACEMENTS, TRELLIS_CATEGORIES, TRELLIS_PLUGIN_RULES } from "../bin/trellis-policy.mjs";

const repositoryRoot = resolve(import.meta.dir, "..");

type BiomeConfiguration = {
  linter: { rules: Record<string, unknown> };
  plugins: { path: string }[];
};

function readJson(path: string): BiomeConfiguration {
  return JSON.parse(readFileSync(resolve(repositoryRoot, path), "utf8"));
}

function configuredCategories(configuration: BiomeConfiguration) {
  return Object.entries(configuration.linter.rules).flatMap(([group, settings]) => {
    if (group === "preset" || typeof settings !== "object" || settings === null) {
      return [];
    }
    return Object.keys(settings).map((rule) => `lint/${group}/${rule}`);
  });
}

describe("policy manifest", () => {
  test("covers every explicit shipped rule and approved replacement", () => {
    const shared = readJson("config/trellis.json");
    const local = readJson("biome.json");
    const categories = configuredCategories(shared);

    expect(categories.every((category) => TRELLIS_CATEGORIES.has(category))).toBe(true);
    expect(categories.every((category) => REPLACEMENTS[category])).toBe(true);
    expect(local.linter.rules).toEqual(shared.linter.rules);
  });

  test("keeps local and packaged plugin catalogs aligned", () => {
    const shared = readJson("config/trellis.json");
    const local = readJson("biome.json");
    const pluginNames = (configuration: { plugins: { path: string }[] }) =>
      configuration.plugins.map(({ path }) => basename(path)).sort();

    expect(pluginNames(local)).toEqual(pluginNames(shared));
    expect(TRELLIS_PLUGIN_RULES.map(({ rule }) => rule)).toEqual(["RT006"]);
    expect(REPLACEMENTS.RT006).toBeTruthy();
  });
});
