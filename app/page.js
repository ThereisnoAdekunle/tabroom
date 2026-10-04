"use client";

import { useState } from "react";
import { BrowserProvider, Contract, parseUnits, id } from "ethers";

const TAB = process.env.NEXT_PUBLIC_TAB_ADDRESS || "";
const TOKEN = process.env.NEXT_PUBLIC_TAB_TOKEN_ADDRESS || "";
const DECIMALS = Number(process.env.NEXT_PUBLIC_TAB_TOKEN_DECIMALS || "6");
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_MONAD_CHAIN_ID || "143");
const RPC = process.env.NEXT_PUBLIC_MONAD_RPC_URL || "https://rpc.monad.xyz";
const EXPLORER = process.env.NEXT_PUBLIC_MONAD_EXPLORER || "https://monadvision.com";

const tabAbi = [
  "function open(address token, bytes32 titleHash) returns (uint256)",
  "function fund(uint256 id, uint256 amount)",
  "function spend(uint256 id, address vendor, uint256 amount)",
  "function close(uint256 id)",
  "function claim(uint256 id)",
];
const erc20Abi = ["function approve(address spender, uint256 amount) returns (bool)"];

export default function Home() {
  const [account, setAccount] = useState("");
  const [title, setTitle] = useState("Friday shoot");
  const [tabId, setTabId] = useState("1");
  const [amount, setAmount] = useState("20");
  const [vendor, setVendor] = useState("");
  const [message, setMessage] = useState("Open a tab, collect contributions, pay the vendor, then let people claim what was not spent.");
  const [error, setError] = useState("");

  async function connect() {
    setError("");
    if (!window.ethereum) return setError("No injected wallet found.");
    const provider = new BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    if (Number(network.chainId) !== CHAIN_ID) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: "0x" + CHAIN_ID.toString(16),
          chainName: "Monad",
          nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
          rpcUrls: [RPC],
          blockExplorerUrls: [EXPLORER],
        }],
      });
    }
    setAccount(await (await provider.getSigner()).getAddress());
  }

  async function withSigner() {
    if (!TAB || !TOKEN) throw new Error("Set NEXT_PUBLIC_TAB_ADDRESS and NEXT_PUBLIC_TAB_TOKEN_ADDRESS");
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return { signer, tab: new Contract(TAB, tabAbi, signer), token: new Contract(TOKEN, erc20Abi, signer) };
  }

  async function run(work) {
    setError("");
    try {
      const receipt = await work();
      setMessage(receipt.hash || "Confirmed");
    } catch (err) {
      setError(err.shortMessage || err.message);
    }
  }

  return (
    <main>
      <div className="kicker">Monad · chain {CHAIN_ID} · consumer payments</div>
      <h1>Tabroom</h1>
      <p className="muted">One tab for a shoot, a trip, or a table. Contributions stay in the contract until the host pays a vendor. Unspent funds are claimed pro-rata.</p>
      <button onClick={connect}>{account ? account.slice(0, 6) + "…" + account.slice(-4) : "Connect"}</button>
      <div className="grid">
        <section className="card">
          <h2>Open</h2>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="row">
            <button onClick={() => run(async () => {
              const { tab } = await withSigner();
              const tx = await tab.open(TOKEN, id(title));
              return tx.wait();
            })}>Open tab</button>
          </div>
        </section>
        <section className="card">
          <h2>Fund, spend, close</h2>
          <input value={tabId} onChange={(e) => setTabId(e.target.value)} placeholder="tab id" />
          <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="amount" />
          <input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="vendor 0x" />
          <div className="row">
            <button onClick={() => run(async () => {
              const { signer, tab, token } = await withSigner();
              const units = parseUnits(amount, DECIMALS);
              const approval = await token.approve(TAB, units);
              await approval.wait();
              const tx = await tab.fund(BigInt(tabId), units);
              const receipt = await tx.wait();
              await fetch("/api/tabs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, token: TOKEN, host: await signer.getAddress(), txHash: receipt.hash }) });
              return receipt;
            })}>Fund</button>
            <button onClick={() => run(async () => {
              const { tab } = await withSigner();
              const tx = await tab.spend(BigInt(tabId), vendor, parseUnits(amount, DECIMALS));
              return tx.wait();
            })}>Pay vendor</button>
            <button onClick={() => run(async () => (await (await withSigner()).tab.close(BigInt(tabId))).wait())}>Close</button>
            <button onClick={() => run(async () => (await (await withSigner()).tab.claim(BigInt(tabId))).wait())}>Claim unspent</button>
          </div>
        </section>
      </div>
      <p className={error ? "error" : "muted"}>{error || message}</p>
    </main>
  );
}
