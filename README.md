# LiteBill

Split and settle group expenses using zKLTC on [LitVM LiteForge](https://liteforge.explorer.caldera.xyz) — a Litecoin Layer-2.

Connect your wallet, create a bill, share the link, and let your group pay their share. The contract auto-settles to the payee once everyone has contributed.

## Structure

```
contracts/   → Solidity smart contract (Deployed via remix-IDE)
frontend/    → React + Vite UI
```

## Getting Started

### Deploy the contract

```bash
cd contracts
cp .env.example .env   # fill in your private key
forge build
forge test
forge script script/DeployLiteBill.s.sol:DeployLiteBill \
  --rpc-url $LITVM_RPC_URL --broadcast
```

### Run the frontend

```bash
cd frontend
cp .env.example .env   # paste deployed contract address into VITE_LITEBILL_ADDRESS
npm install
npm run dev
```

## What it does

- **Create a bill** — set a payee, total amount in zKLTC, and how many people are splitting it
- **Contribute** — each participant pays their equal share
- **Auto-settle** — funds are released to the payee once fully funded
- **Cancel & refund** — creator can cancel; contributors can claim refunds on expired bills
- **Shareable links** — every bill gets a `?billId=` URL you can send to participants
- **Live updates** — the UI listens for on-chain events and refreshes automatically

## Network

| | |
|---|---|
| Network | LitVM LiteForge |
| Chain ID | 4441 |
| Currency | zKLTC |
| RPC | `https://liteforge.rpc.caldera.xyz/http` |
| Explorer | `https://liteforge.explorer.caldera.xyz` |
