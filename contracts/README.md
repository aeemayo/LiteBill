# LiteBill Contracts

Foundry project for deploying and testing the LiteBill smart contract.

## Setup

Install Foundry (if needed):

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Then configure environment:

```bash
cp .env.example .env
```

Update `.env` with your LitVM testnet RPC and deployer key.

## Commands

```bash
forge build
forge test
forge script script/DeployLiteBill.s.sol:DeployLiteBill --rpc-url $LITVM_RPC_URL --broadcast
```

## Contract

- `createBill(payee, totalAmount, participantCount)` creates a bill in wei.
- `createBillWithExpiry(payee, totalAmount, participantCount, expiresAt)` creates a bill with optional expiry.
- `contribute(billId)` pays the exact equal share.
- `cancelBill(billId)` lets the creator cancel an unsettled bill.
- `claimRefund(billId)` lets contributors recover funds from cancelled/expired bills.
