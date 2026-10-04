import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { shareOf, assertTabInput } from "../lib/tab.js";

const require = createRequire(import.meta.url);
const solc = require("solc");

test("unspent is split pro-rata and dust stays behind", () => {
  assert.equal(shareOf(50, 100, 40), 30n);
  assert.equal(shareOf(1, 3, 1), 0n);
  assert.throws(() => shareOf(10, 10, 11));
});

test("tab input is bounded", () => {
  assert.throws(() => assertTabInput({ title: "ab", token: "0x1111111111111111111111111111111111111111" }));
  assert.equal(assertTabInput({ title: "Friday shoot", token: "0x1111111111111111111111111111111111111111" }).title, "Friday shoot");
});

test("SharedTab compiles", () => {
  const source = readFileSync(new URL("../contracts/SharedTab.sol", import.meta.url), "utf8");
  const output = JSON.parse(solc.compile(JSON.stringify({
    language: "Solidity",
    sources: { "SharedTab.sol": { content: source } },
    settings: { outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } } },
  })));
  const errors = (output.errors || []).filter((e) => e.severity === "error");
  assert.equal(errors.length, 0, JSON.stringify(errors));
});
