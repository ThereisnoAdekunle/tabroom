import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const solc = require("solc");
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(join(root, "contracts/SharedTab.sol"), "utf8");
const output = JSON.parse(solc.compile(JSON.stringify({
  language: "Solidity",
  sources: { "SharedTab.sol": { content: source } },
  settings: { optimizer: { enabled: true, runs: 200 }, outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } } },
})));
if (output.errors?.some((e) => e.severity === "error")) {
  console.error(output.errors);
  process.exit(1);
}
const contract = output.contracts["SharedTab.sol"].SharedTab;
mkdirSync(join(root, "artifacts/build"), { recursive: true });
writeFileSync(join(root, "artifacts/build/SharedTab.json"), JSON.stringify({
  abi: contract.abi,
  bytecode: "0x" + contract.evm.bytecode.object,
}, null, 2));
console.log("compiled SharedTab");
