import { readFileSync } from "node:fs";
import { JsonRpcProvider, Wallet, ContractFactory } from "ethers";

const artifact = JSON.parse(readFileSync(new URL("../artifacts/build/SharedTab.json", import.meta.url)));
const key = process.env.DEPLOYER_PRIVATE_KEY;
if (!key) {
  console.error("Set DEPLOYER_PRIVATE_KEY");
  process.exit(1);
}
const provider = new JsonRpcProvider(process.env.NEXT_PUBLIC_MONAD_RPC_URL || "https://rpc.monad.xyz", 143);
const wallet = new Wallet(key, provider);
const factory = new ContractFactory(artifact.abi, artifact.bytecode, wallet);
const contract = await factory.deploy();
await contract.waitForDeployment();
console.log("SharedTab", await contract.getAddress());
