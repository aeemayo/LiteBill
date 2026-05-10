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

1. Open [Remix IDE](https://remix.ethereum.org/).
2. Create a new file `LiteBill.sol` and paste the contents of `contracts/contracts/LiteBill.sol`.
3. Compile the contract using the Solidity Compiler tab.
4. Go to the "Deploy & Run Transactions" tab.
5. Set the Environment to **Injected Provider - MetaMask** and ensure your wallet is connected to the **LitVM LiteForge** network.
6. Click **Deploy** and confirm the transaction in MetaMask.
7. Once deployed, copy the deployed contract address.

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
