export const TRELLIS_CATEGORIES = new Set([
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

export const TRELLIS_PLUGIN_RULES = [{ messagePrefix: "RT006:", rule: "RT006" }];

export const REPLACEMENTS = {
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
