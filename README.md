# Tabroom

Shared tabs for group costs on Monad. A host opens a tab, people fund it, the host pays a vendor from the contract, and contributors claim the unspent balance pro-rata after close.

Built for the Monad Metropolis consumer and payments track. Judges asked for a working product, a write-up, and a link to the code. Open source is encouraged, not mandatory, but this repo is public so the six-week build can be checked.

## Product

Group costs still settle in chats and screenshots. Tabroom is the tab: one contract balance, many contributors, one vendor payout, then a claim for whatever was not spent. Monad is the fit because the payments are small and frequent, and the chain is a parallel EVM with low latency.

## Stack

Next.js, ethers v6, Solidity 0.8.26, Supabase for the tab index.

## Run

```bash
cp .env.example .env.local
npm install
npm test
npm run dev
```

## Deploy

```bash
npm run compile
NEXT_PUBLIC_MONAD_RPC_URL=https://rpc.monad.xyz \
DEPLOYER_PRIVATE_KEY=0xYOUR_KEY \
node scripts/deploy.mjs
```

Foundry:

```bash
forge create contracts/SharedTab.sol:SharedTab \
  --rpc-url https://rpc.monad.xyz \
  --private-key $DEPLOYER_PRIVATE_KEY
```

Monad mainnet chain id is 143. Gas is MON. Monad charges the gas limit rather than gas used, and cold account access is repriced, so estimate before broadcasting.

Paste the deployed address into `NEXT_PUBLIC_TAB_ADDRESS`. Paste the ERC-20 you will settle into `NEXT_PUBLIC_TAB_TOKEN_ADDRESS`. Do not invent a USDC address.

## Supabase

Run `supabase/schema.sql`, then fill the Supabase variables.

## Submission

Register at https://hackathon.monad.xyz and submit the demo, this repo, and a short write-up before 13 October 2026. The work shown should be from the build window.
