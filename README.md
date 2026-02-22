# LiteBill – Group Expense Settlement with Litecoin on LitVM

LiteBill is a consumer payment app that lets groups split and settle expenses with LTC (zkLTC on LitVM).

## Workspace Structure

- `contracts/`: Foundry project with `LiteBill.sol`, Solidity tests, and deployment script.
- `frontend/`: React + Vite UI for wallet connection, bill creation, contribution, and status tracking.

## Quick Start

### 1) Contracts

```bash
cd contracts
cp .env.example .env
forge build
forge test
forge script script/DeployLiteBill.s.sol:DeployLiteBill --rpc-url $LITVM_RPC_URL --broadcast
```

### 2) Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open the app, set `VITE_LITEBILL_ADDRESS`, connect MetaMask, and start creating bills.

## Implemented Features

- Create bill with payee, total amount, and participant count.
- Equal-share contribution tracking (`contribute`).
- Automatic settlement when fully funded.
- Bill status retrieval (`getBillStatus`).
- Shareable bill links (`?billId=<id>`).